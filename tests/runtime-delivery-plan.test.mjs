import assert from 'node:assert/strict';
import registryApi from '../foundation/content-registry/content-asset-registry.js';
import resolver from '../foundation/content-resolution/runtime-resource-resolver.js';
import delivery from '../foundation/content-resolution/runtime-delivery-plan.js';

function baseRegistry(){
  let r=registryApi.emptyRegistry();
  r=registryApi.appendRecord(r,{registryId:'bdr:checksum:test:dp-a',algorithm:'sha256',digest:'a'.repeat(64),byteLength:3,recordVersion:1});
  r=registryApi.appendRecord(r,{registryId:'bdr:asset:test:dp-a',canonicalEntityId:'bd:artifact:test:dp-a',assetType:'document',mediaType:'text/plain',checksumId:'bdr:checksum:test:dp-a',locators:[{kind:'repository_relative',value:'subjects/test/a.txt'}],state:'active',recordVersion:1});
  r=registryApi.appendRecord(r,{registryId:'bdr:checksum:test:dp-h',algorithm:'sha256',digest:'b'.repeat(64),byteLength:4,recordVersion:1});
  r=registryApi.appendRecord(r,{registryId:'bdr:asset:test:dp-h',canonicalEntityId:'bd:artifact:test:dp-h',assetType:'document',mediaType:'text/plain',checksumId:'bdr:checksum:test:dp-h',locators:[{kind:'content_hash',value:'sha256:'+'b'.repeat(64)}],state:'verified',recordVersion:1});
  return r;
}
const registry=baseRegistry();
const request={mode:'learner_runtime',accessContext:{private:true},runtimePolicy:{allowRepositoryRelative:true,allowHttps:false,allowedHttpsOrigins:[],availableProviders:[]}};
const descriptor=resolver.resolve(registry,{...request,targetRegistryId:'bdr:asset:test:dp-a'});
assert.equal(delivery.buildPlan(registry,descriptor).status,'ready');

assert.throws(()=>delivery.buildPlan(registry,{schema:'OTHER',status:'resolved'}),/INVALID_DESCRIPTOR_SCHEMA/);
assert.throws(()=>delivery.buildPlan(registry,{schema:'BAUMAN_RUNTIME_RESOURCE_DESCRIPTOR_V1',status:'blocked'}),/DESCRIPTOR_NOT_RESOLVED/);

{
  const x=structuredClone(descriptor); x.checksumId='bdr:checksum:test:dp-h';
  assert.throws(()=>delivery.buildPlan(registry,x),/CHECKSUM_REFERENCE_MISMATCH/);
}
{
  const x=structuredClone(descriptor); x.locator={kind:'repository_relative',value:'subjects/test/not-linked.txt'};
  assert.throws(()=>delivery.buildPlan(registry,x),/LOCATOR_NOT_LINKED_TO_ASSET/);
}
{
  const x=structuredClone(descriptor); x.transport='https';
  assert.throws(()=>delivery.buildPlan(registry,x),/TRANSPORT_LOCATOR_MISMATCH/);
}
{
  const x=structuredClone(descriptor); x.canonicalEntityId='bd:artifact:test:other';
  assert.throws(()=>delivery.buildPlan(registry,x),/CANONICAL_ID_MISMATCH/);
}

const hashDescriptor=resolver.resolve(registry,{mode:'learner_runtime',targetRegistryId:'bdr:asset:test:dp-h',accessContext:{private:true},runtimePolicy:{allowRepositoryRelative:false,allowHttps:false,allowedHttpsOrigins:[],availableProviders:['content_hash']}});
const tamperedRegistry=structuredClone(registry);
tamperedRegistry.records.checksum['bdr:checksum:test:dp-h'].digest='c'.repeat(64);
assert.throws(()=>delivery.buildPlan(tamperedRegistry,hashDescriptor),/CONTENT_HASH_CHECKSUM_MISMATCH/);

console.log('RUNTIME_DELIVERY_PLAN_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:7,checksumBinding:true,locatorBinding:true,transportBinding:true},null,2));
