import assert from "node:assert/strict";
const base=process.env.BAUMAN_PYTHON_PROVIDER_URL||"http://127.0.0.1:8788";
async function call(path,body){const t=Date.now();const r=await fetch(base+path,{method:body?"POST":"GET",headers:body?{"content-type":"application/json"}:undefined,body:body?JSON.stringify(body):undefined});const p=await r.json();assert.ok(r.ok,path+" "+r.status+" "+JSON.stringify(p));assert.ok(Date.now()-t<30000,path+" exceeded 30s");return p;}
const health=await call("/__python/provider-health");assert.equal(health.version,"3.14.8");assert.equal(health.runtimeProfileId,"cpython-3.14.8-stdlib-v1");
const tot=await call("/__python/test-of-tests",{});assert.equal(tot.ok,true);assert.equal(tot.hiddenMaterialReturned,false);
assert.equal(tot.candidates.canonical.passed,3);assert.equal(tot.candidates.alternate.passed,3);assert.ok(tot.candidates.wrong.passed<3);
const hidden=await call("/__python/hidden-boundary",{});assert.equal(hidden.ok,true);assert.equal(hidden.platformSecretsUnavailable,true);assert.equal(hidden.hiddenTestsExposed,false);
const good="n=int(input());print('EVEN' if n%2==0 else 'ODD')";
const a=await call("/api/python/submit",{taskId:"py-assessment-even",attemptId:"p6-idempotency-1",code:good});
const b=await call("/api/python/submit",{taskId:"py-assessment-even",attemptId:"p6-idempotency-1",code:good});
for(const x of [a,b]){assert.equal(x.result,"passed");assert.equal(x.evidenceOnly,true);assert.equal(x.officialAttemptWrite,false);assert.equal(x.masteryWrite,false);assert.equal(x.hiddenMaterialReturned,false);}
assert.notEqual(a.runId,b.runId);assert.equal(a.attemptId,b.attemptId);
console.log(JSON.stringify({schema:"PYTHON_P6_PROVIDER_LIVE_V1",status:"PASS",runtime:health.version,testOfTests:true,hiddenBoundary:true,stateBoundary:"evidence-only-no-official-writes"},null,2));
