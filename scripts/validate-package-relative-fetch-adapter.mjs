import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import registryApi from '../foundation/content-registry/content-asset-registry.js';
import resolver from '../foundation/content-resolution/runtime-resource-resolver.js';
import deliveryPlan from '../foundation/content-resolution/runtime-delivery-plan.js';
import executor from '../foundation/content-resolution/runtime-delivery-executor.js';
import packageAdapter from '../foundation/content-resolution/adapters/package-relative-fetch-adapter.js';

const text='package payload';
const bytes=new TextEncoder().encode(text);
const digest=crypto.createHash('sha256').update(bytes).digest('hex');
let registry=registryApi.emptyRegistry();
registry=registryApi.appendRecord(registry,{registryId:'bdr:checksum:test:pkg-001',algorithm:'sha256',digest,byteLength:bytes.byteLength,recordVersion:1});
registry=registryApi.appendRecord(registry,{registryId:'bdr:asset:test:pkg-001',canonicalEntityId:'bd:artifact:test:pkg-001',assetType:'document',mediaType:'text/plain',checksumId:'bdr:checksum:test:pkg-001',locators:[{kind:'repository_relative',value:'subjects/test/package.txt'}],state:'active',recordVersion:1});

const descriptor=resolver.resolve(registry,{targetRegistryId:'bdr:asset:test:pkg-001',mode:'learner_runtime',accessContext:{private:true},runtimePolicy:{allowRepositoryRelative:true,allowHttps:false,allowedHttpsOrigins:[],availableProviders:[]}});
const plan=deliveryPlan.buildPlan(registry,descriptor);
let request=null;
const adapter=packageAdapter.create({
  baseUrl:'https://app.example/root/index.html',
  fetchFn:async(url,options)=>{
    request={url,options};
    return {ok:true,status:200,arrayBuffer:async()=>bytes.buffer.slice(0)};
  }
});
let consumed='';
const result=await executor.execute(plan,{[adapter.adapterId]:adapter.load},async payload=>{
  consumed=new TextDecoder().decode(payload);
});
assert.equal(result.status,'verified');
assert.equal(consumed,text);
assert.equal(request.url,'https://app.example/root/subjects/test/package.txt');
assert.deepEqual(request.options,{method:'GET',cache:'no-cache',credentials:'same-origin',redirect:'error'});
assert.equal(adapter.baseOrigin,'https://app.example');

console.log('PACKAGE_RELATIVE_FETCH_ADAPTER_GATE=PASS');
console.log(JSON.stringify({schema:packageAdapter.schema,status:result.status,url:request.url,sameOrigin:true,verifiedBeforeConsume:true},null,2));
