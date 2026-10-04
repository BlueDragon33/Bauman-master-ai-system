export const POLICY = Object.freeze({wallMs:5000,startupMs:15000,cleanupMs:5000,
  addressSpaceBytes:100663296,cpuSoftSeconds:2,cpuHardSeconds:3,outputBytes:16384,
  transportBytes:131072,fileBytes:16384,maxFileBytes:1048576,
  vm:Object.freeze({vcpu:0.25,memoryMib:256,diskMb:2048})});
export const RUNTIME = Object.freeze({python:'3.14.8',runtimeProfileId:'python04-cf-stdlib-v1',
  baseImage:'sha256:d1e795fbdab8a4744432467f32f348c6baa99f07abc05ffde710913f65c8261d'});
const encoder=new TextEncoder();
const size=text=>encoder.encode(text).length;
export function validateRequest(input) {
  if (!input || typeof input!=='object' || Array.isArray(input)) throw new Error('INVALID_REQUEST');
  const allowed=new Set(['runId','taskId','sessionId','code','cells','stdin','files','mode']);
  if(Object.keys(input).some(k=>!allowed.has(k))) throw new Error('UNKNOWN_REQUEST_FIELD');
  for(const key of ['runId','taskId','sessionId'])
    if(input[key]!==undefined && (typeof input[key]!=='string' || !/^[\w.-]{1,80}$/.test(input[key]))) throw new Error('INVALID_ID');
  const cells=input.cells===undefined?[input.code]:input.cells;
  if(!Array.isArray(cells)||!cells.length||cells.length>12||cells.some(c=>typeof c!=='string')||size(cells.join(''))>16384) throw new Error('INVALID_CODE');
  if(input.stdin!==undefined && (typeof input.stdin!=='string'||size(input.stdin)>8192)) throw new Error('INVALID_STDIN');
  if(input.mode!==undefined && !['run','test','trace','notebook'].includes(input.mode)) throw new Error('INVALID_MODE');
  if(input.mode==='test' && input.taskId!=='sum-integers') throw new Error('UNKNOWN_PUBLIC_TASK');
  const files=input.files??{};
  if(typeof files!=='object'||Array.isArray(files)||Object.keys(files).length>8) throw new Error('INVALID_FILES');
  let bytes=0;
  for(const [name,text] of Object.entries(files)) {
    if(!/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*\.[A-Za-z0-9]{1,8}$/.test(name)||name.length>120||name.startsWith('cell-')||typeof text!=='string') throw new Error('UNSAFE_FILE');
    bytes+=size(text);
  }
  if(bytes>POLICY.fileBytes) throw new Error('FILES_TOO_LARGE');
  return {runId:input.runId,taskId:input.taskId||'practice',sessionId:input.sessionId||'practice',cells,files,stdin:input.stdin||'',mode:input.mode||'run'};
}
const deadline=async(promise,ms)=>{
  let timer;
  try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('DEADLINE')),ms);})]);}
  finally{clearTimeout(timer);}
};
function normalize(payload,base) {
  if(!payload||!['completed','runtime_error','memory_limit','output_limit'].includes(payload.status)||typeof payload.stdout!=='string'||typeof payload.stderr!=='string'||size(payload.stdout+payload.stderr)>POLICY.outputBytes+8) return {...base,status:'invalid_result'};
  const location=f=>({file:/^cell-\d+\.py$/.test(f?.file)?f.file:'untrusted',line:Number.isSafeInteger(f?.line)&&f.line>0?f.line:null});
  const exception=payload.exception&&typeof payload.exception==='object'?{
    type:String(payload.exception.type||'Exception').slice(0,80),message:String(payload.exception.message||'').slice(0,1000),
    offset:Number.isSafeInteger(payload.exception.offset)?payload.exception.offset:null,
    frames:Array.isArray(payload.exception.frames)?payload.exception.frames.slice(0,20).map(location):[]}:null;
  const result={...base,status:payload.status,stdout:payload.stdout,stderr:payload.stderr,exception,
    trace:Array.isArray(payload.trace)?payload.trace.slice(0,100).map(location):[],
    cells:Array.isArray(payload.cells)?payload.cells.slice(0,12).map((_c,i)=>({index:i,status:'reported_completed'})):[],
    truncated:payload.status==='output_limit'||payload.truncated===true};
  if(base.mode==='test') {
    const cases=[0,3,0,15].map((expected,i)=>({id:'public-'+(i+1),visibility:'public',status:payload.status==='completed'&&payload.values?.[i]===expected?'passed':'failed'}));
    result.tests={passed:cases.filter(c=>c.status==='passed').length,failed:cases.filter(c=>c.status==='failed').length,cases};
    result.correctness=result.tests.failed?'public_tests_failed':'public_tests_passed';
  }
  return result;
}

// Container is the native Cloudflare 1.x boundary. The injectable interface is
// also used for control-plane failure tests; those tests do not prove VM safety.
export async function superviseContainer(container,input,{signal}={}) {
  const request=validateRequest(input), started=Date.now();
  const base={runId:request.runId,taskId:request.taskId,sessionId:request.sessionId,mode:request.mode,
    provider:'cloudflare-container-native',runtime:RUNTIME,policy:POLICY,stdout:'',stderr:'',exception:null,trace:[],cells:[],
    officialEvidence:false,correctness:'not_assessed',cleanup:false,truncated:false,exitCode:null,artifacts:[]};
  if(signal?.aborted) return {...base,status:'cancelled',cleanup:true};
  const image=container?.images?.python;
  if(typeof image!=='string'||!/(?:^|@)sha256:[a-f0-9]{64}$/.test(image)) return {...base,status:'provider_unavailable',cleanup:true};
  base.runtime={...RUNTIME,imageId:image};
  let process,status='',launched=false,result,timer;
  const aborter=new AbortController();
  const stop=reason=>{if(status)return;status=reason;aborter.abort();try{process?.kill(9);}catch{}};
  const cancel=()=>stop('cancelled');
  signal?.addEventListener('abort',cancel,{once:true});
  let text='',stdoutBytes=0,stderrBytes=0;
  const drain=async(stream,isError=false)=>{
    if(!stream)throw new Error('MISSING_PIPE');
    const reader=stream.getReader();
    try{while(true){const {value,done}=await reader.read();if(done)break;
      if(isError){stderrBytes+=value.byteLength;if(stderrBytes>POLICY.outputBytes)stop('output_limit');}
      else {stdoutBytes+=value.byteLength;if(stdoutBytes>POLICY.transportBytes)stop('output_limit');else text+=new TextDecoder().decode(value);}
    }}finally{reader.releaseLock();}
  };
  try {
    if(container.running)throw new Error('WORKSPACE_REUSE_FORBIDDEN');
    launched=true;
    container.start({image,instance:POLICY.vm,enableInternet:false,env:{}});
    const wire={...request,...(request.mode==='test'?{publicInputs:[[],[1,2],[-3,3],[4,5,6]]}:{})};
    const stdin=new ReadableStream({start(c){c.enqueue(encoder.encode(JSON.stringify(wire)));c.close();}});
    timer=setTimeout(()=>stop('timeout'),POLICY.startupMs);
    process=await deadline(container.exec(['/usr/bin/env','-i','PATH=/usr/local/bin:/usr/bin:/bin','PYTHONHASHSEED=0','/usr/local/bin/python','-s','-P','/runner.py'],{stdin,stdout:'pipe',stderr:'pipe',signal:aborter.signal}),POLICY.startupMs);
    clearTimeout(timer);
    if(status){try{process.kill(9);}catch{}}
    timer=setTimeout(()=>stop('timeout'),POLICY.wallMs);
    const [, ,exitCode]=await deadline(Promise.all([drain(process.stdout),drain(process.stderr,true),process.exitCode]),POLICY.wallMs+1000);
    base.exitCode=exitCode;
    clearTimeout(timer);
    if(!status && [137,152].includes(exitCode))status='timeout';
    if(status)result={...base,status,truncated:status==='output_limit'};
    else {let payload;try{payload=JSON.parse(text);}catch{}
      result=normalize(payload,{...base,runtime:{...RUNTIME,imageId:image}});}
  } catch {result={...base,status:status||'provider_error'};}
  finally {
    clearTimeout(timer);signal?.removeEventListener('abort',cancel);
    if(!result)result={...base,status:status||'provider_error'};
    if(launched) {
      try{await deadline(container.destroy(),POLICY.cleanupMs);result.cleanup=(await deadline(container.inspect(),POLICY.cleanupMs))===null;}catch{result.cleanup=false;}
    } else result.cleanup=true;
    if(!result.cleanup){result.status='cleanup_failed';result.stdout='';result.stderr='';result.correctness='not_assessed';delete result.tests;}
    result.durationMs=Date.now()-started;
    result.cancelled=result.status==='cancelled';result.timedOut=result.status==='timeout';
    result.supervisorSignals={stdoutBytes,stderrBytes};
  }
  return result;
}
