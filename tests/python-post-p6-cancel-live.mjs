import assert from 'node:assert/strict';
const base=process.env.BAUMAN_PYTHON_PROVIDER_URL||'http://127.0.0.1:8788';
async function raw(path,body,signal){const response=await fetch(base+path,{method:body?'POST':'GET',headers:body?{'content-type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined,signal});const payload=await response.json().catch(()=>({}));return{response,payload};}
async function req(path,body){const x=await raw(path,body);assert.ok(x.response.ok,path+' '+x.response.status+' '+JSON.stringify(x.payload));return x.payload;}

const id='chat-abort-'+crypto.randomUUID().toLowerCase();
const controller=new AbortController();
const started=Date.now();
const running=raw('/api/python/run',{runId:id,code:'while True: pass',timeoutMs:5000},controller.signal);
await new Promise(r=>setTimeout(r,250));
controller.abort();
let aborted=false;
try{await running;}catch(error){aborted=error?.name==='AbortError';}
const elapsed=Date.now()-started;
assert.equal(aborted,true,'run fetch must abort from client request signal');
assert.ok(elapsed<2500,'client abort did not return promptly: '+elapsed+'ms');

// Give the Durable Object request-abort cleanup a short window, then prove the provider is healthy.
await new Promise(r=>setTimeout(r,500));
const health=await req('/__python/provider-health');
assert.equal(health.ok,true);

const known='chat-known-'+crypto.randomUUID().toLowerCase();
const normal=await req('/api/python/run',{runId:known,code:'print(42)',timeoutMs:1000});
assert.equal(normal.runId,known,'server must preserve valid client-known runId');
assert.equal(normal.status,'complete');
assert.equal(normal.stdout.trim(),'42');

console.log(JSON.stringify({schema:'PYTHON_POST_P6_CANCEL_LIVE_V2',status:'PASS',requestAbort:true,elapsedMs:elapsed,providerHealthyAfterAbort:true,knownRunIdPreserved:true},null,2));
