import assert from 'node:assert/strict';
const base=process.env.BAUMAN_PYTHON_PROVIDER_URL||'http://127.0.0.1:8788';
async function raw(path,body){const response=await fetch(base+path,{method:body?'POST':'GET',headers:body?{'content-type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});const payload=await response.json().catch(()=>({}));return{response,payload};}
async function req(path,body){const x=await raw(path,body);assert.ok(x.response.ok,path+' '+x.response.status+' '+JSON.stringify(x.payload));return x.payload;}

const id='chat-cancel-'+crypto.randomUUID().toLowerCase();
const started=Date.now();
const running=raw('/api/python/run',{runId:id,code:'while True: pass',timeoutMs:5000});
await new Promise(r=>setTimeout(r,250));
const canceled=await req('/api/python/cancel',{runId:id});
assert.equal(canceled.runId,id);
assert.equal(canceled.canceled,true);
const result=await running;
const elapsed=Date.now()-started;
assert.ok(elapsed<4500,'in-flight cancel did not beat timeout: '+elapsed+'ms');
assert.ok([200,503].includes(result.response.status),'unexpected run response after cancel '+result.response.status);

const known='chat-known-'+crypto.randomUUID().toLowerCase();
const normal=await req('/api/python/run',{runId:known,code:'print(42)',timeoutMs:1000});
assert.equal(normal.runId,known,'server must preserve valid client-known runId');
assert.equal(normal.status,'complete');
assert.equal(normal.stdout.trim(),'42');

console.log(JSON.stringify({schema:'PYTHON_POST_P6_CANCEL_LIVE_V1',status:'PASS',cancelRunId:id,elapsedMs:elapsed,knownRunIdPreserved:true},null,2));
