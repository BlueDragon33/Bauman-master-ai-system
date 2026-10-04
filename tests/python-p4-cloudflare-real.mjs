import assert from 'node:assert/strict';
import fs from 'node:fs';
const base=process.env.BAUMAN_PYTHON04_BASE_URL;
const secret=process.env.BAUMAN_PYTHON04_ACCEPTANCE_SECRET;
const revision=process.env.BAUMAN_BUILD_REVISION;
if(!base||!secret||!revision||!/^[a-f0-9]{40}$/.test(revision))throw new Error('REAL_PROVIDER_REQUIRED: actual endpoint, scoped acceptance key and exact source SHA required; never replace this gate with a mock');
const headers={'content-type':'application/json',authorization:'Bearer '+secret};
const receipt={status:'RUNNING',provider:'cloudflare-container-native',target:base,exactTestedSha:revision,results:[],officialAssessmentEnabled:false};
async function post(op,body,signal) {
  const response=await fetch(base+'/__python04/'+op,{method:'POST',headers,body:JSON.stringify(body),signal:signal||AbortSignal.timeout(45000)});
  const text=await response.text();assert.ok(Buffer.byteLength(text)<262144,'response boundary');
  return {http:response.status,...JSON.parse(text)};
}
async function run(input) {
  const reserved=await post('reserve',{});
  assert.equal(reserved.http,200,JSON.stringify(reserved));
  assert.match(reserved.runId,/^[a-f0-9-]{36}$/);
  try{return await post('run',{...input,runId:reserved.runId});}
  finally{await post('cancel',{runId:reserved.runId});}
}
const golden=JSON.parse(fs.readFileSync('prompts/subjects/python/evidence/PYTHON_RUNTIME_GOLDEN_FIXTURES.json'));
const cases=golden.fixtures.filter(f=>f.kind==='sandbox').map(f=>({id:f.id,code:f.program,status:f.expectedStatus,exception:f.exception,stdout:f.stdout}));
cases.push(
  {id:'reject-forged-result',code:"import os,json\nos.write(1,json.dumps({'status':'completed','stdout':'x'*20000,'stderr':'','officialEvidence':True}).encode())\nos._exit(0)",status:'invalid_result',stdout:''},
  {id:'hard-resource-policy',code:"import resource\nassert resource.getrlimit(resource.RLIMIT_AS)[1] == 100663296\ntry: resource.setrlimit(resource.RLIMIT_AS,(-1,-1))\nexcept (ValueError,PermissionError): print('denied')\nelse: raise Exception('limit bypass')",status:'completed',stdout:'denied\n'}
);
try {
  const health=await (await fetch(base+'/__python04/health')).json();
  receipt.observedRevision=health.revision;
  assert.equal(health.revision,revision,'deployed revision does not match tested source');
  assert.equal(health.learnerExecutionEnabled,false);
  assert.equal((await fetch(base+'/api/python/reserve',{method:'POST',headers:{'content-type':'application/json'},body:'{}'})).status,403);
  assert.equal((await fetch(base+'/__python04/reserve',{method:'POST',headers:{'content-type':'application/json'},body:'{}'})).status,401);
  const normal=await run({code:'import sys\nprint(sys.version_info[:3])\nprint(6 * 7)'});
  assert.equal(normal.status,'completed',JSON.stringify(normal));
  assert.equal(normal.stdout,'(3, 14, 8)\n42\n');
  assert.match(normal.runtime.imageId,/(?:^|@)sha256:[a-f0-9]{64}$/);
  for(const fixture of cases) {
    const result=await run({code:fixture.code});
    assert.equal(result.status,fixture.status,fixture.id+': '+JSON.stringify(result));
    assert.equal(result.cleanup,true,fixture.id);
    assert.equal(result.officialEvidence,false);
    assert.ok(Buffer.byteLength(result.stdout+result.stderr)<=16392);
    if(fixture.stdout!==undefined)assert.equal(result.stdout,fixture.stdout,fixture.id);
    if(fixture.exception)assert.equal(result.exception?.type,fixture.exception,fixture.id);
    receipt.results.push({id:fixture.id,status:'PASS',outcome:result.status,imageId:result.runtime.imageId,durationMs:result.durationMs});
  }
  for(const code of ['def solve(values):\n    return sum(values)','def solve(values):\n    total=0\n    for v in values: total+=v\n    return total']) {
    const result=await run({code,taskId:'sum-integers',mode:'test'});
    assert.equal(result.tests.passed,4);assert.equal(result.tests.failed,0);
  }
  const wrong=await run({code:'def solve(values):\n    print("PASS")\n    return 3',taskId:'sum-integers',mode:'test'});
  assert.equal(wrong.tests.failed,3);
  assert.equal(wrong.correctness,'public_tests_failed');
  const privateReject=await run({code:'pass',hiddenTests:['PRIVATE_FIXTURE_CANARY']});
  assert.equal(privateReject.http,400);
  assert.ok(!JSON.stringify(privateReject).includes('PRIVATE_FIXTURE_CANARY'));
  const notebook=await run({cells:['x=21','print(x*2)'],mode:'notebook'});
  assert.equal(notebook.stdout,'42\n');
  const fresh=await run({code:'print(x)'});assert.equal(fresh.exception.type,'NameError');
  const syntax=await run({cells:['x=1','if True print(x)'],mode:'notebook'});
  assert.equal(syntax.exception.frames[0].file,'cell-2.py');
  const first=await run({code:"print(hash('bauman-reproducibility'))"});
  const second=await run({code:"print(hash('bauman-reproducibility'))"});assert.equal(first.stdout,second.stdout);
  const reserved=await post('reserve',{});
  const pending=post('run',{runId:reserved.runId,code:'while True: pass'});
  await new Promise(resolve=>setTimeout(resolve,1000));
  await post('cancel',{runId:reserved.runId});
  const cancelled=await pending;
  assert.equal(cancelled.status,'cancelled');assert.equal(cancelled.cleanup,true);
  const stale=await post('run',{runId:reserved.runId,code:'print("stale")'});
  assert.equal(stale.status,'stale_result');
  receipt.results.push({id:'stale-result',status:'PASS'},{id:'hidden-test-leak',status:'PASS',scope:'private payload rejected; official grader remains disabled'},{id:'cancellation-cleanup',status:'PASS'},{id:'public-behavior-tests',status:'PASS'},{id:'fresh-notebook-replay',status:'PASS'});
  receipt.status='PASS_PROVIDER_SPIKE_ONLY';
} catch(error){receipt.status='FAIL';receipt.failure=String(error.message).slice(0,4000);throw error;}
finally {
  const path=process.env.BAUMAN_PYTHON04_RECEIPT||'/tmp/python04-cloudflare-real-receipt.json';
  fs.writeFileSync(path,JSON.stringify(receipt,null,2)+'\n');
  console.log(JSON.stringify({status:receipt.status,fixtures:receipt.results.length,exactTestedSha:receipt.exactTestedSha,receipt:path}));
}
