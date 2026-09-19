import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import registryApi from '../foundation/content-registry/content-asset-registry.js';
import resolver from '../foundation/content-resolution/runtime-resource-resolver.js';
import deliveryPlan from '../foundation/content-resolution/runtime-delivery-plan.js';
import executor from '../foundation/content-resolution/runtime-delivery-executor.js';

const good='abc';
const digest=crypto.createHash('sha256').update(good).digest('hex');
let registry=registryApi.emptyRegistry();
registry=registryApi.appendRecord(registry,{registryId:'bdr:checksum:test:ex-a',algorithm:'sha256',digest,byteLength:3,recordVersion:1});
registry=registryApi.appendRecord(registry,{registryId:'bdr:asset:test:ex-a',canonicalEntityId:'bd:artifact:test:ex-a',assetType:'document',mediaType:'text/plain',checksumId:'bdr:checksum:test:ex-a',locators:[{kind:'repository_relative',value:'subjects/test/a.txt'}],state:'active',recordVersion:1});
const descriptor=resolver.resolve(registry,{targetRegistryId:'bdr:asset:test:ex-a',mode:'learner_runtime',accessContext:{private:true},runtimePolicy:{allowRepositoryRelative:true,allowHttps:false,allowedHttpsOrigins:[],availableProviders:[]}});
const plan=deliveryPlan.buildPlan(registry,descriptor);

assert.equal((await executor.execute(plan,{})).reason,'adapter_missing');
assert.equal((await executor.execute(plan,{'package-relative-resource':async()=>{throw new Error('load')}})).reason,'adapter_error');
assert.equal((await executor.execute(plan,{'package-relative-resource':async()=>({notBytes:true})})).reason,'adapter_invalid_payload');

let consumerCalls=0;
const bad=await executor.execute(plan,{'package-relative-resource':async()=>'abd'},async()=>{consumerCalls++});
assert.equal(bad.status,'blocked');
assert.equal(bad.reason,'integrity_mismatch');
assert.equal(consumerCalls,0,'consumer must not receive failed bytes');

const typed=new TextEncoder().encode(good);
let typedReceived=null;
const ok=await executor.execute(plan,{'package-relative-resource':async()=>({bytes:typed})},async bytes=>{typedReceived=bytes});
assert.equal(ok.status,'verified');
assert.ok(typedReceived instanceof Uint8Array);
assert.deepEqual([...typedReceived],[97,98,99]);

typed[0]=120;
assert.deepEqual([...typedReceived],[97,98,99],'consumer must receive a copy, not adapter-owned mutable bytes');

assert.rejects(()=>executor.execute({...plan,schema:'OTHER'},{'package-relative-resource':async()=>good}),/INVALID_PLAN_SCHEMA/);
assert.rejects(()=>executor.execute({...plan,status:'blocked'},{'package-relative-resource':async()=>good}),/PLAN_NOT_READY/);

console.log('RUNTIME_DELIVERY_EXECUTOR_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:6,failedBytesForwarded:0,adapterPayloadIsolation:true},null,2));
