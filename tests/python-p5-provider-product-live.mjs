import assert from "node:assert/strict";
const base=process.env.BAUMAN_PYTHON_PROVIDER_URL||"http://127.0.0.1:8788";
async function req(path,body){const r=await fetch(base+path,{method:body?"POST":"GET",headers:body?{"content-type":"application/json"}:undefined,body:body?JSON.stringify(body):undefined});const p=await r.json().catch(()=>({}));assert.ok(r.ok,path+" "+r.status+" "+JSON.stringify(p));return p;}
const test=await req("/api/python/test",{taskId:"py-beginner-sum",code:"a,b=map(int,input().split());print(a+b)"});
assert.equal(test.passed,2);assert.equal(test.total,2);assert.equal(test.masteryWrite,false);assert.equal(test.academicWrite,false);
assert.doesNotMatch(JSON.stringify(test),/2 3|-5 7|expected|1000000/);
const submitGood=await req("/api/python/submit",{taskId:"py-assessment-even",attemptId:"p5-good",code:"n=int(input());print('EVEN' if n%2==0 else 'ODD')"});
assert.equal(submitGood.ok,true);assert.equal(submitGood.result,"passed");assert.equal(submitGood.publicTestCount,2);assert.equal(submitGood.hiddenTestCount,3);assert.equal(submitGood.hiddenMaterialReturned,false);assert.equal(submitGood.officialAttemptWrite,false);assert.equal(submitGood.masteryWrite,false);assert.equal(submitGood.learnerStateOwnerRequired,true);
assert.doesNotMatch(JSON.stringify(submitGood),/1000001|expected|negative|large|\"stdin\"/);
const submitWrong=await req("/api/python/submit",{taskId:"py-assessment-even",attemptId:"p5-wrong",code:"print('EVEN')"});
assert.equal(submitWrong.ok,false);assert.equal(submitWrong.result,"failed");assert.ok(submitWrong.passed<submitWrong.total);
console.log(JSON.stringify({schema:"PYTHON_P5_PROVIDER_PRODUCT_LIVE_V1",status:"PASS",test:{passed:test.passed,total:test.total},submit:{passed:submitGood.passed,total:submitGood.total,hiddenMaterialReturned:false}},null,2));
