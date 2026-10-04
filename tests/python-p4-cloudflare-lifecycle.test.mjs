import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from '../runtime/python-cloudflare/node_modules/esbuild/lib/main.js';

const dir=await mkdtemp(join(tmpdir(),'python04-do-tests-'));
const output=join(dir,'worker.mjs');
await build({entryPoints:['runtime/python-cloudflare/worker.ts'],outfile:output,bundle:true,platform:'node',format:'esm',plugins:[{
  name:'native-durable-object-test-shim',setup(b){
    b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'durable-object',namespace:'test-only'}));
    b.onLoad({filter:/.*/,namespace:'test-only'},()=>({contents:'export class DurableObject {constructor(ctx,env){this.ctx=ctx;this.env=env;}}'}));
  }
}]});
const {PythonSandbox}=await import(pathToFileURL(output));
test.after(async()=>rm(dir,{recursive:true,force:true}));

function setup() {
  const objects=new Map();
  const env={PYTHON_SANDBOX:{getByName(name){if(!objects.has(name))objects.set(name,create());return objects.get(name);}}};
  function create(){
    const data=new Map();let alarm=null,tail=Promise.resolve();
    const storage={async get(k){return structuredClone(data.get(k));},async put(k,v){data.set(k,structuredClone(v));},async delete(k){data.delete(k);},async setAlarm(time){alarm=time;},async deleteAlarm(){alarm=null;},async getAlarm(){return alarm;},async transaction(fn){const before=new Map(data),previous=alarm;try{return await fn(storage);}catch(e){data.clear();for(const [k,v]of before)data.set(k,v);alarm=previous;throw e;}}};
    const ctx={storage,container:{running:false,async inspect(){return null;},async destroy(){this.running=false;}},blockConcurrencyWhile(fn){const next=tail.then(fn);tail=next.catch(()=>{});return next;}};
    const object=new PythonSandbox(ctx,env);object.testContext=ctx;return object;
  }
  return {env,objects};
}

test('admission recovers a Worker crash between claim and child reservation',async()=>{
  const {env}=setup();const admission=env.PYTHON_SANDBOX.getByName('admission-owner');
  const runId=crypto.randomUUID(),child='a'.repeat(64);
  assert.equal(await admission.claimAdmission(runId,child),true);
  assert.ok(await admission.testContext.storage.getAlarm(),'no recovery alarm for orphan admission');
  await admission.alarm();
  assert.equal(await admission.testContext.storage.get('activeRun'),undefined);
  const cancelled=env.PYTHON_SANDBOX.getByName(child);
  assert.equal((await cancelled.testContext.storage.get('reservation')).phase,'cancelled');
  await assert.rejects(()=>cancelled.reserve(runId,'admission-owner'),/RUN_ALREADY_RESERVED/);
  assert.equal(await admission.claimAdmission(crypto.randomUUID(),'b'.repeat(64)),true);
});

test('claim/alarm persistence is atomic when alarm storage fails',async()=>{
  const {env}=setup();const admission=env.PYTHON_SANDBOX.getByName('admission-owner');
  admission.testContext.storage.setAlarm=async()=>{throw Error('injected alarm write failure');};
  await assert.rejects(()=>admission.claimAdmission(crypto.randomUUID(),'c'.repeat(64)),/injected/);
  assert.equal(await admission.testContext.storage.get('activeRun'),undefined);
});

test('release RPC failure retains recovery alarm and never executes a late cancelled reservation',async()=>{
  const {env}=setup();const owner='admission-owner',childName='d'.repeat(64),runId=crypto.randomUUID();
  const admission=env.PYTHON_SANDBOX.getByName(owner),child=env.PYTHON_SANDBOX.getByName(childName);
  await admission.claimAdmission(runId,childName);await child.reserve(runId,owner);
  const release=admission.releaseAdmission.bind(admission);
  admission.releaseAdmission=async()=>{throw Error('injected release RPC failure');};
  await assert.rejects(()=>child.cancelRun(runId),/injected/);
  assert.ok(await child.testContext.storage.getAlarm(),'child recovery alarm was deleted before release');
  assert.ok(await admission.testContext.storage.getAlarm(),'admission lacks recovery alarm');
  admission.releaseAdmission=release;
  await admission.alarm();
  assert.equal(await admission.testContext.storage.get('activeRun'),undefined);
  const late=await child.runCode({runId,code:"print('MUST_NOT_EXECUTE')"});
  assert.equal(late.status,'stale_result');
});
