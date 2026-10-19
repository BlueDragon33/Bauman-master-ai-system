import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const source=await readFile(new URL('../src/local-d1-observer.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {createLocalD1Observer}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const deferred=()=>{let resolve,reject;const promise=new Promise((res,rej)=>{resolve=res;reject=rej;});return {promise,resolve,reject};};
const context=()=>{const pending=[];return {ctx:{waitUntil(p){pending.push(p);}},pending};};

test('outstanding background D1 persists after HTTP response until write resolves',async()=>{
  const obs=createLocalD1Observer('BAUMAN-CONTROL'),wait=deferred(),{ctx,pending}=context();
  const db={prepare(){return {async run(){await wait.promise;return {success:true};}}}};
  const res=await obs.trackFetch({DB:db},async(env,observedCtx)=>{
    observedCtx.waitUntil(env.DB.prepare('INSERT').run());
    return new Response('accepted',{status:202});
  },ctx);
  assert.equal(res.status,202);
  assert.equal(obs.snapshot().activeRequests,0);
  assert.equal(obs.snapshot().activeD1Calls,1);
  assert.equal(obs.snapshot().activeBackgroundTasks,1);
  assert.equal(obs.snapshot().backgroundDrainVerified,false);
  wait.resolve();await Promise.allSettled(pending);
  assert.equal(obs.snapshot().activeBackgroundTasks,0);
  assert.equal(obs.snapshot().completedBackgroundTasks,1);
  assert.equal(obs.snapshot().unverifiedBackgroundTasks,1);
  assert.equal(obs.snapshot().durableReadbackVerified,false);
});
test('rejected background D1 write is recorded; runtime never ready',async()=>{
  const obs=createLocalD1Observer('BAUMAN-CONTROL'),d=deferred(),{ctx,pending}=context();
  obs.observeWaitUntil(ctx,d.promise);d.reject(Error('D1 failed'));
  const values=await Promise.allSettled(pending);
  assert.equal(values[0].status,'rejected');
  assert.equal(obs.snapshot().rejectedBackgroundTasks,1);
  assert.equal(obs.snapshot().activeBackgroundTasks,0);
  assert.equal(obs.snapshot().gracefulShutdownReady,false);
});
test('deadline reports timeout once, does not cancel in-flight background write',async()=>{
  let clock=1000;
  const obs=createLocalD1Observer('BAUMAN-CONTROL',{now:()=>clock,timeoutMs:100});
  const d=deferred(),{ctx,pending}=context();obs.observeWaitUntil(ctx,d.promise);
  clock=1100;assert.equal(obs.snapshot().timedOutBackgroundTasks,1);
  assert.equal(obs.snapshot().timedOutBackgroundTasks,1);
  assert.equal(obs.snapshot().activeBackgroundTasks,1);
  d.resolve();await Promise.allSettled(pending);
  assert.equal(obs.snapshot().activeBackgroundTasks,0);
  assert.equal(obs.snapshot().timedOutBackgroundTasks,1);
  assert.equal(obs.snapshot().backgroundDrainVerified,false);
});
test('incorrect or rejected D1 readback never becomes durability evidence',async()=>{
  for(const verify of [async()=>false,async()=>{throw Error('readback failed');}]){
    const obs=createLocalD1Observer('BAUMAN-CONTROL'),{ctx,pending}=context();
    obs.observeWaitUntil(ctx,Promise.resolve(),verify);
    assert.equal((await Promise.allSettled(pending))[0].status,'rejected');
    assert.equal(obs.snapshot().failedBackgroundReadbacks,1);
    assert.equal(obs.snapshot().backgroundDurabilityVerified,false);
  }
});
test('positive caller-supplied readback remains advisory not independent verification',async()=>{
  const obs=createLocalD1Observer('BAUMAN-CONTROL'),{ctx,pending}=context();
  obs.observeWaitUntil(ctx,Promise.resolve(),async()=>true);
  await Promise.allSettled(pending);
  const snap=obs.snapshot();
  assert.equal(snap.readbackReported,1);
  assert.equal(snap.backgroundDurabilityVerified,false);
  assert.equal(snap.allIsolatesObserved,false);
});
test('invalid and refused waitUntil registration remain permanently tainted',async()=>{
  const obs=createLocalD1Observer('BAUMAN-CONTROL');
  assert.throws(()=>obs.observeWaitUntil({waitUntil(){}},null),/D1_BACKGROUND_REGISTRATION_INVALID/);
  assert.throws(()=>obs.observeWaitUntil({waitUntil(){throw Error('blocked');}},Promise.resolve()),/blocked/);
  await Promise.resolve();
  assert.equal(obs.snapshot().rejectedRegistrations,2);
  assert.equal(obs.snapshot().autoRestartAllowed,false);
  assert.equal(obs.snapshot().allWaitUntilJobsInstrumented,false);
});
test('source Worker drain preflight remains 503 and refuses restart',async()=>{
  const obs=createLocalD1Observer('BAUMAN-CONTROL'),res=obs.blockedPreflight();
  assert.equal(res.status,503);
  const payload=await res.json();
  assert.equal(payload.supported,false);
  assert.equal(payload.autoRestartAllowed,false);
});
test('cannot configure zero or excessive timeout',()=>{
  assert.throws(()=>createLocalD1Observer('BAUMAN-CONTROL',{timeoutMs:0}),/CONFIG_INVALID/);
  assert.throws(()=>createLocalD1Observer('BAUMAN-CONTROL',{timeoutMs:120001}),/CONFIG_INVALID/);
});
test('actual Worker entry forwards observer-owned context; never claims global coverage',async()=>{
  const entry=await readFile(new URL('../src/automation-contract.ts',import.meta.url),'utf8');
  const delegated=await readFile(new URL('../src/index.ts',import.meta.url),'utf8');
  assert.match(entry,/trackFetch\(incomingEnv, async \(env, observedContext\)/);
  assert.match(entry,/controlService\.fetch\(request, env, observedContext \?\? _ctx\)/);
  assert.match(entry,/\}, _ctx\);/);
  assert.match(delegated,/_observedContext\?: ExecutionContext/);
  assert.match(source,/allWaitUntilJobsInstrumented: false/);
  assert.match(source,/backgroundDrainVerified: false/);
  assert.match(source,/autoRestartAllowed: false/);
});
