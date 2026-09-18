import assert from 'node:assert/strict';
import registryApi from '../foundation/content-registry/content-asset-registry.js';
import resolver from '../foundation/content-resolution/runtime-resource-resolver.js';
import delivery from '../foundation/content-resolution/runtime-delivery-plan.js';

let registry=registryApi.emptyRegistry();
const put=record=>{registry=registryApi.appendRecord(registry,record);};
put({registryId:'bdr:checksum:test:plan-local-001',algorithm:'sha256',digest:'a'.repeat(64),byteLength:21,recordVersion:1});
put({registryId:'bdr:asset:test:plan-local-001',canonicalEntityId:'bd:artifact:test:plan-local-001',assetType:'document',mediaType:'application/json',checksumId:'bdr:checksum:test:plan-local-001',locators:[{kind:'repository_relative',value:'subjects/test/plan.json'}],state:'active',recordVersion:1});
put({registryId:'bdr:checksum:test:plan-hash-001',algorithm:'sha256',digest:'b'.repeat(64),byteLength:22,recordVersion:1});
put({registryId:'bdr:asset:test:plan-hash-001',canonicalEntityId:'bd:artifact:test:plan-hash-001',assetType:'dataset',mediaType:'application/json',checksumId:'bdr:checksum:test:plan-hash-001',locators:[{kind:'content_hash',value:'sha256:'+'b'.repeat(64)}],state:'verified',recordVersion:1});

const before=JSON.stringify(registry);
const localDescriptor=resolver.resolve(registry,{targetRegistryId:'bdr:asset:test:plan-local-001',mode:'learner_runtime',accessContext:{private:true},runtimePolicy:{allowRepositoryRelative:true,allowHttps:false,allowedHttpsOrigins:[],availableProviders:[]}});
const localPlan=delivery.buildPlan(registry,localDescriptor);
assert.equal(localPlan.status,'ready');
assert.equal(localPlan.adapterId,'package-relative-resource');
assert.equal(localPlan.resource.value,'subjects/test/plan.json');
assert.equal(localPlan.integrity.digest,'a'.repeat(64));
assert.equal(localPlan.integrity.byteLength,21);
assert.equal(localPlan.integrity.verificationRequired,true);
assert.equal(localPlan.requiresNetwork,false);

const hashDescriptor=resolver.resolve(registry,{targetRegistryId:'bdr:asset:test:plan-hash-001',mode:'learner_runtime',accessContext:{private:true},runtimePolicy:{allowRepositoryRelative:false,allowHttps:false,allowedHttpsOrigins:[],availableProviders:['content_hash']}});
const hashPlan=delivery.buildPlan(registry,hashDescriptor);
assert.equal(hashPlan.adapterId,'content-hash-resource');
assert.equal(hashPlan.provider,'content_hash');
assert.equal(hashPlan.resource.value,'sha256:'+'b'.repeat(64));

assert.equal(JSON.stringify(registry),before,'delivery plan must not mutate registry');
assert.ok(Object.isFrozen(localPlan));
assert.ok(Object.isFrozen(localPlan.integrity));
assert.ok(Object.isFrozen(localPlan.identity));

console.log('RUNTIME_DELIVERY_PLAN_GATE=PASS');
console.log(JSON.stringify({schema:delivery.schema,localAdapter:localPlan.adapterId,hashAdapter:hashPlan.adapterId,verificationRequired:true,registryImmutable:true},null,2));
