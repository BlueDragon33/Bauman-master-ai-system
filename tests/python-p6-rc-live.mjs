import assert from 'node:assert/strict';
const base=process.env.BAUMAN_PYTHON_PROVIDER_URL||'http://127.0.0.1:8788';
async function raw(path,body){const r=await fetch(base+path,{method:body?'POST':'GET',headers:body?{'content-type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});const p=await r.json().catch(()=>({}));return{r,p};}
async function req(path,body){const {r,p}=await raw(path,body);assert.ok(r.ok,path+' '+r.status+' '+JSON.stringify(p));return p;}
async function run(code,extra={}){return req('/api/python/run',{runId:'p6-'+crypto.randomUUID().toLowerCase(),code,...extra});}
const health=await req('/__python/provider-health');assert.equal(health.version,'3.14.8');assert.equal(health.runtimeProfileId,'cpython-3.14.8-stdlib-v1');

const languageCases=[
 ["print(7/2,7//2,-7%3)",/3\.5 3 2/],
 ["print(bool([]),bool([0]),None is None)",/False True True/],
 ["a=[1,[2]];b=a.copy();b[1].append(3);print(a,b,a==b,a is b)",/\[1, \[2, 3\]\].*False/],
 ["def f(x=[]): x.append(1); return len(x)\nprint(f(),f())",/1 2/],
 ["it=iter([1,2]);print(list(it),list(it))",/\[1, 2\] \[\]/],
 ["s='Привет';print(s[1:4],len(s))",/рив 6/],
 ["class A:\n def __init__(self,x): self.x=x\nprint(A(4).x)",/^4\s*$/m],
 ["from pathlib import Path\np=Path('p6-utf8.txt');p.write_text('Привет',encoding='utf-8');print(p.read_text(encoding='utf-8'))",/Привет/]
];
for(const [code,re] of languageCases){const x=await run(code);assert.equal(x.status,'complete');assert.match(x.stdout,re);}
const missing=await run("import definitely_missing_bauman_module");assert.equal(missing.status,'runtime_error');
const timeout=await run("while True: pass",{timeoutMs:500});assert.equal(timeout.status,'timeout');
const flood=await run("for _ in range(2048): print('x'*1024)",{timeoutMs:2000});assert.equal(flood.status,'output_limit');
const env=await run("import os;print(os.environ)",{timeoutMs:1000});assert.equal(env.status,'complete');assert.doesNotMatch(env.stdout,/BAUMAN_|TOKEN|SECRET|DATABASE/i);
const net=await run("import urllib.request;urllib.request.urlopen('https://example.com',timeout=1)",{timeoutMs:2500});assert.notEqual(net.status,'complete');

const tot=await req('/__python/test-of-tests',{});assert.equal(tot.ok,true);assert.equal(tot.candidates.canonical.passed,3);assert.equal(tot.candidates.alternate.passed,3);assert.ok(tot.candidates.wrong.passed<3);assert.equal(tot.hiddenMaterialReturned,false);
const attempt='p6-repeat-'+crypto.randomUUID().toLowerCase();
const good={taskId:'py-assessment-even',attemptId:attempt,runId:'p6-'+crypto.randomUUID().toLowerCase(),code:"n=int(input());print('EVEN' if n%2==0 else 'ODD')"};
const s1=await req('/api/python/submit',good);const s2=await req('/api/python/submit',{...good,runId:'p6-'+crypto.randomUUID().toLowerCase()});
for(const s of [s1,s2]){assert.equal(s.result,'passed');assert.equal(s.attemptId,attempt);assert.equal(s.officialAttemptWrite,false);assert.equal(s.masteryWrite,false);assert.equal(s.hiddenMaterialReturned,false);}
assert.notEqual(s1.runId,s2.runId);

const cancelId='p6-cancel-'+crypto.randomUUID().toLowerCase();
const started=Date.now();
const runPromise=raw('/api/python/run',{runId:cancelId,code:'while True: pass',timeoutMs:5000});
await new Promise(r=>setTimeout(r,250));
const canceled=await req('/api/python/cancel',{runId:cancelId});assert.equal(canceled.canceled,true);
const runResult=await runPromise;
assert.ok(Date.now()-started<4500,'cancel did not terminate before timeout');
assert.ok([200,503].includes(runResult.r.status));
console.log(JSON.stringify({schema:'PYTHON_P6_RC_LIVE_V1',status:'PASS',runtime:health.runtimeProfileId,languageCases:languageCases.length,timeout:true,outputLimit:true,secretIsolation:true,networkDenied:true,testOfTests:true,evidenceOnlyRepeatSafe:true,cancel:true},null,2));
