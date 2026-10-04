import {DurableObject} from 'cloudflare:workers';
import runtimeWorker, {authorizeRuntimeRequest} from '../../cloudflare/runtime-worker.mjs';
import {superviseContainer,validateRequest,RUNTIME,POLICY} from './controller.mjs';

interface Env {
  PYTHON_SANDBOX: DurableObjectNamespace<PythonSandbox>;
  BAUMAN_PYTHON_EXECUTION_ENABLED?: string;
  BAUMAN_PYTHON04_ACCEPTANCE_SECRET?: string;
  BAUMAN_BUILD_REVISION?: string;
  BAUMAN_CONTROL_ORIGIN?: string;
  ASSETS?: Fetcher;
}
type Reservation={runId:string;admissionName:string;phase:'reserved'|'running'|'finished'|'cancelled'|'cleanup_failed'};
type AdmissionLease={runId:string;childName:string};
type ExecutionResult={status:string;runId?:string;officialEvidence:boolean;cleanup?:boolean;[key:string]:unknown};
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'cache-control':'no-store, private','x-content-type-options':'nosniff'}});
async function cleanupDeadline<T>(operation:Promise<T>):Promise<T> {
  let timer:ReturnType<typeof setTimeout>|undefined;
  try{return await Promise.race([operation,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('CLEANUP_DEADLINE')),POLICY.cleanupMs);})]);}
  finally{if(timer!==undefined)clearTimeout(timer);}
}
const validId=(value:unknown):value is string=>typeof value==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(value);
async function digest(value:string) {return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(b=>b.toString(16).padStart(2,'0')).join('');}
async function acceptanceOwner(request:Request,env:Env) {
  const secret=env.BAUMAN_PYTHON04_ACCEPTANCE_SECRET;
  if(!secret||secret.length<32)return '';
  const token=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';
  if(token.length>256)return '';
  const a=await digest(token),b=await digest(secret);
  let different=0;for(let i=0;i<a.length;i++)different|=a.charCodeAt(i)^b.charCodeAt(i);
  return different?'':'acceptance-fixture';
}

export class PythonSandbox extends DurableObject<Env> {
  private controller?: AbortController;
  async claimAdmission(runId:string,childName:string) {
    if(!validId(runId)||!/^[a-f0-9]{64}$/.test(childName))throw new Error('INVALID_LEASE');
    return this.ctx.blockConcurrencyWhile(()=>this.ctx.storage.transaction(async storage=>{
      if(await storage.get('activeRun'))return false;
      await storage.put('activeRun',{runId,childName} satisfies AdmissionLease);
      await storage.setAlarm(Date.now()+60000);
      return true;
    }));
  }
  async releaseAdmission(runId:string) {
    return this.ctx.blockConcurrencyWhile(()=>this.ctx.storage.transaction(async storage=>{
      if((await storage.get<AdmissionLease>('activeRun'))?.runId===runId) {
        await storage.delete('activeRun');
        await storage.deleteAlarm();
      }
    }));
  }
  async reserve(runId:string,admissionName:string) {
    if(!validId(runId))throw new Error('INVALID_RUN_ID');
    return this.ctx.blockConcurrencyWhile(()=>this.ctx.storage.transaction(async storage=>{
      if(await storage.get('reservation'))throw new Error('RUN_ALREADY_RESERVED');
      await storage.put('reservation',{runId,admissionName,phase:'reserved'} satisfies Reservation);
      await storage.setAlarm(Date.now()+60000);
      return {runId,status:'reserved',officialEvidence:false};
    }));
  }
  // The admission alarm can arrive before reserve. A persisted tombstone stops
  // the old Worker from reviving that abandoned run after admission is released.
  async reapRun(runId:string) {
    await this.ctx.blockConcurrencyWhile(async()=>{
      const current=await this.ctx.storage.get<Reservation>('reservation');
      if(current&&current.runId!==runId)throw new Error('RUN_ID_MISMATCH');
      this.controller?.abort();
      await this.ctx.storage.transaction(async storage=>{
        await storage.put('reservation',{runId,admissionName:current?.admissionName||'',phase:'cancelled'} satisfies Reservation);
        await storage.setAlarm(Date.now()+30000);
      });
    });
    let cleanup=false;
    try {
      if(this.ctx.container?.running)await cleanupDeadline(this.ctx.container.destroy());
      cleanup=(await cleanupDeadline(this.ctx.container!.inspect()))===null;
    }catch{}
    if(!cleanup)await this.ctx.storage.put('reservation',{...await this.ctx.storage.get<Reservation>('reservation'),runId,phase:'cleanup_failed'});
    return {cleanup};
  }
  async getRuntimeIdentity(){return {...RUNTIME,policy:POLICY,imageId:this.ctx.container?.images.python||null,officialEvidence:false};}
  async runCode(input:unknown):Promise<ExecutionResult> {
    const request=validateRequest(input);
    const admitted=await this.ctx.blockConcurrencyWhile(async()=>{
      const reserved=await this.ctx.storage.get<Reservation>('reservation');
      if(!reserved||reserved.runId!==request.runId||reserved.phase!=='reserved')return false;
      this.controller=new AbortController();
      await this.ctx.storage.put('reservation',{...reserved,phase:'running'});
      await this.ctx.storage.setAlarm(Date.now()+45000);
      return true;
    });
    if(!admitted)return {status:'stale_result',runId:request.runId,officialEvidence:false};
    const result=await superviseContainer(this.ctx.container,request,{signal:this.controller!.signal});
    this.controller=undefined;
    const phase=result.cleanup?'finished':'cleanup_failed';
    const reserved=await this.ctx.storage.get<Reservation>('reservation');
    await this.ctx.storage.put('reservation',{...reserved,runId:request.runId,phase});
    // This transient reservation is not learner history or official evidence.
    if(result.cleanup) {
      if(reserved?.admissionName)await this.env.PYTHON_SANDBOX.getByName(reserved.admissionName).releaseAdmission(request.runId);
      await this.ctx.storage.deleteAlarm();
    }
    return result;
  }
  async runTests(input:unknown):Promise<ExecutionResult>{return this.runCode({...validateRequest(input),mode:'test'});}
  async cancelRun(runId:string) {
    const reserved=await this.ctx.blockConcurrencyWhile(async()=>{
      const current=await this.ctx.storage.get<Reservation>('reservation');
      if(!current||current.runId!==runId)return null;
      this.controller?.abort();
      if(['reserved','running'].includes(current.phase))await this.ctx.storage.put('reservation',{...current,phase:'cancelled'});
      return current;
    });
    if(!reserved||reserved.runId!==runId)return {status:'stale_result',officialEvidence:false};
    if(reserved.phase==='reserved') {
      await this.env.PYTHON_SANDBOX.getByName(reserved.admissionName).releaseAdmission(runId);
      await this.ctx.storage.deleteAlarm();
      return {runId,status:'cancelled',cleanup:true,officialEvidence:false};
    }
    return {runId,status:'cancellation_requested',cleanup:false,officialEvidence:false};
  }
  async alarm() {
    const active=await this.ctx.storage.get<AdmissionLease>('activeRun');
    if(active) {
      // Admission owns a second recovery alarm even if the HTTP Worker crashes.
      const child=this.env.PYTHON_SANDBOX.getByName(active.childName);
      try {
        if((await child.reapRun(active.runId)).cleanup) {
          await this.releaseAdmission(active.runId);
          return;
        }
      }catch{}
      await this.ctx.storage.setAlarm(Date.now()+30000);
      return;
    }
    const reserved=await this.ctx.storage.get<Reservation>('reservation');
    if(!reserved)return;
    const {cleanup}=await this.reapRun(reserved.runId);
    if(cleanup) {
      // Retain the child alarm until the remote admission release succeeds.
      if(reserved.admissionName)await this.env.PYTHON_SANDBOX.getByName(reserved.admissionName).releaseAdmission(reserved.runId);
      await this.ctx.storage.deleteAlarm();
    }
  }

}

export default {
  async fetch(request:Request,env:Env):Promise<Response> {
    const url=new URL(request.url);
    if(url.pathname==='/__python04/health')return reply({status:'validation_only',learnerExecutionEnabled:env.BAUMAN_PYTHON_EXECUTION_ENABLED==='true',officialAssessment:false,runtime:RUNTIME,revision:env.BAUMAN_BUILD_REVISION||'unvalidated'});
    const acceptance=url.pathname.startsWith('/__python04/');
    const learner=url.pathname.startsWith('/api/python/');
    if(!acceptance&&!learner) {
      if(!env.ASSETS)return reply({status:'assets_unavailable'},503);
      return runtimeWorker.fetch(request,env);
    }
    if(request.method!=='POST')return reply({status:'method_not_allowed'},405);
    const operation=url.pathname.split('/').pop();
    if(!['reserve','run','cancel'].includes(operation||''))return reply({status:'not_found'},404);
    if(learner&&env.BAUMAN_PYTHON_EXECUTION_ENABLED!=='true')return reply({status:'acceptance_pending',officialEvidence:false},403);
    let owner='';
    if(acceptance){owner=await acceptanceOwner(request,env);if(!owner)return reply({status:'unauthorized'},401);}
    else {
      if(request.headers.get('origin')!==url.origin)return reply({status:'untrusted_origin'},403);
      const authorized=await authorizeRuntimeRequest(request,env);
      if(!authorized.ok)return reply({status:authorized.code},authorized.status);
      owner=String(authorized.device?.id||'');
      if(!owner)return reply({status:'owner_unavailable'},403);
    }
    if(!request.headers.get('content-type')?.startsWith('application/json'))return reply({status:'json_required'},415);
    let body:Record<string,unknown>;
    try {
      const reader=request.body?.getReader();if(!reader)throw new Error();
      const chunks:Uint8Array[]=[];let size=0;
      let timedOut=false;
      const timeout=setTimeout(()=>{timedOut=true;void reader.cancel();},3000);
      try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>65536){await reader.cancel();return reply({status:'request_too_large'},413);}chunks.push(value);}}
      finally{clearTimeout(timeout);reader.releaseLock();}
      if(timedOut)return reply({status:'request_timeout'},408);
      const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
      body=JSON.parse(new TextDecoder().decode(bytes));
      if(!body||typeof body!=='object'||Array.isArray(body))throw new Error();
    } catch{return reply({status:'invalid_request'},400);}
    try {
      if(operation==='reserve') {
        if(Object.keys(body).length)return reply({status:'invalid_request'},400);
        const runId=crypto.randomUUID();
        const admissionName='admission-'+await digest(owner);
        const admission=env.PYTHON_SANDBOX.getByName(admissionName);
        const childName=await digest(JSON.stringify([owner,runId]));
        if(!await admission.claimAdmission(runId,childName))return reply({status:'busy',officialEvidence:false},409);
        const stub=env.PYTHON_SANDBOX.getByName(childName);
        try{return reply({...await stub.reserve(runId,admissionName),runtime:await stub.getRuntimeIdentity()});}
        catch {await admission.releaseAdmission(runId);throw new Error('RESERVATION_FAILED');}
      }
      if(!validId(body.runId))return reply({status:'invalid_run_id'},400);
      const stub=env.PYTHON_SANDBOX.getByName(await digest(JSON.stringify([owner,body.runId])));
      if(operation==='cancel') {
        if(Object.keys(body).some(k=>k!=='runId'))return reply({status:'invalid_request'},400);
        return reply(await stub.cancelRun(body.runId));
      }
      let input;
      try{input=validateRequest(body);}catch{return reply({status:'invalid_request',officialEvidence:false},400);}
      return reply(await (input.mode==='test'?stub.runTests(input):stub.runCode(input)));
    } catch{return reply({status:'provider_error',officialEvidence:false},503);}
  }
} satisfies ExportedHandler<Env>;
