import assert from "node:assert/strict";

const base=String(process.env.BAUMAN_PYTHON_PROVIDER_URL||"").replace(/\/$/,"");
const token=String(process.env.BAUMAN_E2E_DEVICE_SESSION||"");
assert.ok(/^https:\/\//.test(base),"BAUMAN_PYTHON_PROVIDER_URL must be HTTPS");
assert.match(token,/^bm1\.[A-Za-z0-9_-]{40,100}$/,"valid smoke device session required");

async function request(path,{method="GET",body}={}){
  const response=await fetch(base+path,{
    method,
    headers:{
      authorization:"Bearer "+token,
      ...(body?{"content-type":"application/json"}:{})
    },
    body:body?JSON.stringify(body):undefined
  });
  const payload=await response.json().catch(()=>({}));
  assert.ok(response.ok,path+" HTTP "+response.status+" "+JSON.stringify(payload));
  return payload;
}

const runtime=await request("/api/python/runtime");
assert.equal(runtime.ok,true);
assert.equal(runtime.implementation,"CPython");
assert.equal(runtime.version,"3.14.8");
assert.equal(runtime.runtimeProfileId,"cpython-3.14.8-stdlib-v1");
assert.equal(runtime.provider,"cloudflare-container-durable-object-v1");

const run=await request("/api/python/run",{method:"POST",body:{
  taskId:"py-beginner-sum",
  attemptId:"release-smoke-run",
  code:"print(2+3)",
  stdin:""
}});
assert.equal(run.ok,true);
assert.equal(run.status,"complete");
assert.equal(String(run.stdout).trim(),"5");
assert.equal(run.runtimeProfileId,"cpython-3.14.8-stdlib-v1");

const test=await request("/api/python/test",{method:"POST",body:{
  taskId:"py-beginner-sum",
  code:"a,b=map(int,input().split());print(a+b)"
}});
assert.equal(test.ok,true);
assert.equal(test.passed,2);
assert.equal(test.total,2);
assert.equal(test.masteryWrite,false);
assert.equal(test.academicWrite,false);
assert.doesNotMatch(JSON.stringify(test),/"expected"|1000000|2000000/);

const submit=await request("/api/python/submit",{method:"POST",body:{
  taskId:"py-assessment-even",
  attemptId:"release-smoke-submit",
  code:"n=int(input());print('EVEN' if n%2==0 else 'ODD')"
}});
assert.equal(submit.ok,true);
assert.equal(submit.result,"passed");
assert.equal(submit.hiddenTestCount,3);
assert.equal(submit.hiddenMaterialReturned,false);
assert.equal(submit.evidenceOnly,true);
assert.equal(submit.officialAttemptWrite,false);
assert.equal(submit.masteryWrite,false);
assert.equal(submit.learnerStateOwnerRequired,true);
assert.doesNotMatch(JSON.stringify(submit),/1000001|"expected"|"stdin"/);

console.log(JSON.stringify({
  schema:"PYTHON_PRODUCTION_SMOKE_V1",
  status:"PASS",
  runtime:{implementation:runtime.implementation,version:runtime.version,profile:runtime.runtimeProfileId,provider:runtime.provider},
  run:{status:run.status,stdout:String(run.stdout).trim()},
  publicTests:{passed:test.passed,total:test.total},
  submit:{result:submit.result,hiddenTestCount:submit.hiddenTestCount,hiddenMaterialReturned:false,officialAttemptWrite:false,masteryWrite:false}
},null,2));
