import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

function setup(runtime) {
  const calls=[];
  const context={window:{SUBJECT_ADAPTER:{id:'programming',pythonRuntime:runtime},location:{search:'?api=https://untrusted.example.test'}},navigator:{onLine:true},URLSearchParams,URL,module:{exports:{}},console,
    fetch(){throw Error('product adapter created second execution transport');}};
  vm.runInNewContext(fs.readFileSync('subjects/programming/assets/python-product-integration.js','utf8'),context);
  return {api:context.window.BAUMAN_PYTHON_PRODUCT,context,calls};
}

test('product and author preview reuse one facade; URL query cannot redirect code',async()=>{
  const calls=[];
  const {api}=setup({async runCode(request){calls.push(request);return {status:'completed',runId:'owner-run',stdout:'5\n',officialEvidence:false};},getRuntimeIdentity(){return null;},cancel(){calls.push('cancel');}});
  const result=await api.invoke('run',{taskId:'py-beginner-sum',code:'source',stdin:'2 3\n',attemptId:'ui-attempt'});
  assert.equal(result.status,'completed');assert.equal(result.masteryWrite,false);assert.equal(result.officialAttemptWrite,false);
  assert.equal(calls.length,1);assert.equal(calls[0].attemptId,undefined);
  assert.equal(calls[0].code,'source');assert.equal(calls[0].taskId,'py-beginner-sum');
  await api.invoke('cancel');assert.equal(calls[1],'cancel');
});

test('unsupported assessment, offline and private payloads cannot execute or claim evidence',async()=>{
  let executed=0,cancelled=0;
  const {api,context}=setup({runCode(){executed++;},getRuntimeIdentity(){return null;},cancel(){cancelled++;}});
  assert.equal((await api.invoke('submit',{taskId:'py-beginner-sum',code:'source'})).code,'OFFICIAL_ASSESSMENT_UNAVAILABLE');
  assert.equal((await api.invoke('test',{taskId:'py-beginner-sum',code:'source'})).code,'TASK_TEST_CONTRACT_PENDING');
  assert.equal((await api.invoke('run',{code:'source',hiddenTests:['PRIVATE_CANARY']})).code,'INVALID_PRACTICE_REQUEST');
  context.navigator.onLine=false;
  assert.equal((await api.invoke('run',{code:'source'})).code,'OFFLINE_EXECUTION_UNAVAILABLE');
  await api.invoke('cancel');assert.equal(cancelled,1,'offline cancellation failed to invalidate local results');
  assert.equal(executed,0);assert.equal((await api.invoke('runtime')).ok,false);
});
