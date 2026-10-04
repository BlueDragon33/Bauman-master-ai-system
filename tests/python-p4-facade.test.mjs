import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

function facade(fetch) {
  const context={window:{SUBJECT_ADAPTER:{id:'programming'}},AbortController,setTimeout,clearTimeout,crypto:globalThis.crypto,fetch};
  vm.runInNewContext(fs.readFileSync('subjects/programming/assets/python-runtime.js','utf8'),context);
  return context.window.SUBJECT_ADAPTER.pythonRuntime;
}
const response=(body,status=200)=>({ok:status<400,status,json:async()=>body});

test('facade uses only owner-minted reservations at same origin and never grants official authority',async()=>{
  const calls=[],id=crypto.randomUUID();
  const api=facade(async(url,options)=>{
    calls.push({url,options});const body=JSON.parse(options.body);
    if(url.endsWith('/reserve'))return response({status:'reserved',runId:id});
    return response({...body,status:'completed',officialEvidence:false,runtime:{python:'3.14.8'}});
  });
  const result=await api.run({code:'print(42)'});
  assert.equal(result.runId,id);assert.equal(result.status,'completed');
  assert.deepEqual(calls.map(c=>c.url),['/api/python/reserve','/api/python/run','/api/python/cancel']);
  assert.ok(calls.every(c=>c.options.credentials==='same-origin'));
  assert.equal(api.offlineExecution,false);assert.equal(api.officialAssessment,false);
  assert.equal(api.getRuntimeIdentity().python,'3.14.8');
});

test('late reserve is cancelled; old execution result cannot replace a newer request',async()=>{
  let lateReserve,lateResult;const firstId=crypto.randomUUID(),secondId=crypto.randomUUID(),cancelled=[];let reserves=0;
  const api=facade(async(url,options)=>{
    const body=JSON.parse(options.body);
    if(url.endsWith('/cancel')){cancelled.push(body.runId);return response({status:'cancelled'});}
    if(url.endsWith('/reserve'))return ++reserves===1?new Promise(r=>lateReserve=()=>r(response({status:'reserved',runId:firstId}))):response({status:'reserved',runId:secondId});
    return new Promise(r=>lateResult=()=>r(response({...body,status:'completed',officialEvidence:false})));
  });
  const old=api.run({code:'old'});await Promise.resolve();
  const next=api.run({code:'new'});lateReserve();
  await new Promise(r=>setImmediate(r));
  assert.equal((await old).status,'stale_result');assert.ok(cancelled.includes(firstId));
  api.cancel();lateResult();assert.equal((await next).status,'stale_result');assert.ok(cancelled.includes(secondId));
});

test('provider denial, transport failure and forged result fail closed',async()=>{
  const denied=facade(async()=>response({status:'acceptance_pending'},403));
  assert.equal((await denied.run({code:'pass'})).status,'acceptance_pending');
  const unavailable=facade(async()=>{throw Error('offline');});
  assert.equal((await unavailable.run({code:'pass'})).status,'provider_unavailable');
  const id=crypto.randomUUID();const forged=facade(async(url)=>response(url.endsWith('/reserve')?{status:'reserved',runId:id}:{status:'completed',runId:id,officialEvidence:true}));
  assert.equal((await forged.run({code:'pass'})).status,'invalid_result');
  assert.equal(forged.advice({},'ai_prohibited').status,'disabled');
});
