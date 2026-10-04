import assert from 'node:assert/strict';
import test from 'node:test';

test('canonical Container controller denies unpinned images and request policy overrides',async()=>{
  const {validateRequest,superviseContainer}=await import('../runtime/python-cloudflare/controller.mjs');
  assert.throws(()=>validateRequest({code:'pass',hiddenTests:['secret']}),/UNKNOWN_REQUEST_FIELD/);
  assert.throws(()=>validateRequest({code:'pass',files:{'../secret':'x'}}),/UNSAFE_FILE/);
  let started=false;
  const result=await superviseContainer({images:{python:'mutable:latest'},start(){started=true;}},{runId:crypto.randomUUID(),code:'pass'});
  assert.equal(started,false);
  assert.equal(result.status,'provider_unavailable');
  assert.equal(result.officialEvidence,false);
});

test('controller bounds raw output, destroys the VM and rejects forged authority',async()=>{
  const {superviseContainer}=await import('../runtime/python-cloudflare/controller.mjs');
  const image='sha256:'+'1'.repeat(64);
  for(const raw of ['x'.repeat(200000),JSON.stringify({status:'completed',stdout:'x'.repeat(20000),stderr:'',officialEvidence:true})]) {
    let destroyed=false,killCount=0;
    const process={stdout:new ReadableStream({start(c){c.enqueue(new TextEncoder().encode(raw));c.close();}}),stderr:new ReadableStream({start(c){c.close();}}),exitCode:Promise.resolve(0),kill(){killCount++;}};
    const container={images:{python:image},running:false,start(options){assert.equal(options.enableInternet,false);assert.deepEqual(options.env,{});this.running=true;},async exec(){return process;},async destroy(){destroyed=true;this.running=false;},async inspect(){return null;}};
    const r=await superviseContainer(container,{runId:crypto.randomUUID(),code:'pass'});
    assert.ok(['output_limit','invalid_result'].includes(r.status));
    assert.equal(r.stdout,'');
    assert.equal(r.officialEvidence,false);
    assert.equal(r.cleanup,true);
    assert.equal(destroyed,true);
    assert.ok(killCount<=1);
  }
});

test('cleanup failure quarantines evidence; pre-start cancellation executes no code',async()=>{
  const {superviseContainer}=await import('../runtime/python-cloudflare/controller.mjs');
  const signal=AbortSignal.abort();
  const r=await superviseContainer({}, {runId:crypto.randomUUID(),code:'pass'},{signal});
  assert.equal(r.status,'cancelled');
  assert.equal(r.cleanup,true);
  const image='sha256:'+'1'.repeat(64);
  const container={images:{python:image},start(){},async exec(){throw new Error('injected');},async destroy(){throw new Error('cleanup unavailable');},async inspect(){return {image};}};
  const failed=await superviseContainer(container,{runId:crypto.randomUUID(),code:'pass'});
  assert.equal(failed.status,'cleanup_failed');
  assert.equal(failed.cleanup,false);
});
