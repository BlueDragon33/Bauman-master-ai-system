import assert from 'node:assert/strict';
import registryApi from '../foundation/content-registry/content-asset-registry.js';
import resolver from '../foundation/content-resolution/runtime-resource-resolver.js';

function buildRegistry(){
  let registry=registryApi.emptyRegistry();
  const put=record=>{registry=registryApi.appendRecord(registry,record);};
  put({registryId:'bdr:checksum:test:resolver-local-001',algorithm:'sha256',digest:'a'.repeat(64),byteLength:10,recordVersion:1});
  put({registryId:'bdr:checksum:test:resolver-https-001',algorithm:'sha256',digest:'b'.repeat(64),byteLength:11,recordVersion:1});
  put({registryId:'bdr:checksum:test:resolver-hash-001',algorithm:'sha256',digest:'c'.repeat(64),byteLength:12,recordVersion:1});
  put({registryId:'bdr:asset:test:resolver-local-001',canonicalEntityId:'bd:artifact:test:resolver-local-001',assetType:'document',mediaType:'application/json',checksumId:'bdr:checksum:test:resolver-local-001',locators:[{kind:'repository_relative',value:'subjects/test/data.json'}],state:'active',recordVersion:1});
  put({registryId:'bdr:asset:test:resolver-https-001',canonicalEntityId:'bd:artifact:test:resolver-https-001',assetType:'document',mediaType:'application/json',checksumId:'bdr:checksum:test:resolver-https-001',locators:[{kind:'https_url',value:'https://example.test/data.json'}],state:'verified',recordVersion:1});
  put({registryId:'bdr:asset:test:resolver-hash-001',canonicalEntityId:'bd:artifact:test:resolver-hash-001',assetType:'document',mediaType:'application/json',checksumId:'bdr:checksum:test:resolver-hash-001',locators:[{kind:'content_hash',value:'sha256:'+'c'.repeat(64)}],state:'verified',recordVersion:1});
  put({registryId:'bdr:content:test:resolver-content-001',canonicalEntityId:'bd:artifact:test:resolver-content-001',contentType:'learning_material',title:'Resolver content',assetIds:['bdr:asset:test:resolver-local-001'],sourceIds:[],provenanceEventIds:[],recordVersion:1});
  return registry;
}

const registry=buildRegistry();
const before=JSON.stringify(registry);
const base={mode:'learner_runtime',accessContext:{private:true},runtimePolicy:{allowRepositoryRelative:true,allowHttps:false,availableProviders:[]}};

const local=resolver.resolve(registry,{...base,targetRegistryId:'bdr:asset:test:resolver-local-001'});
assert.equal(local.status,'resolved');
assert.equal(local.transport,'package_relative');
assert.equal(local.locator.value,'subjects/test/data.json');
assert.equal(local.access.target.allowed,true);
assert.equal(local.access.asset.allowed,true);

const content=resolver.resolve(registry,{...base,targetRegistryId:'bdr:content:test:resolver-content-001'});
assert.equal(content.status,'resolved');
assert.equal(content.contentRegistryId,'bdr:content:test:resolver-content-001');
assert.equal(content.assetRegistryId,'bdr:asset:test:resolver-local-001');

const remoteBlocked=resolver.resolve(registry,{...base,targetRegistryId:'bdr:asset:test:resolver-https-001'});
assert.equal(remoteBlocked.status,'blocked');
assert.equal(remoteBlocked.reason,'no_allowed_locator');

const remoteDeniedWithoutOrigin=resolver.resolve(registry,{...base,targetRegistryId:'bdr:asset:test:resolver-https-001',runtimePolicy:{allowRepositoryRelative:true,allowHttps:true,allowedHttpsOrigins:[],availableProviders:[]}});
assert.equal(remoteDeniedWithoutOrigin.status,'blocked');

const remoteAllowed=resolver.resolve(registry,{...base,targetRegistryId:'bdr:asset:test:resolver-https-001',runtimePolicy:{allowRepositoryRelative:true,allowHttps:true,allowedHttpsOrigins:['https://example.test'],availableProviders:[]}});
assert.equal(remoteAllowed.status,'resolved');
assert.equal(remoteAllowed.transport,'https');

const hashMissing=resolver.resolve(registry,{...base,targetRegistryId:'bdr:asset:test:resolver-hash-001'});
assert.equal(hashMissing.status,'provider_required');
assert.equal(hashMissing.provider,'content_hash');

const hashAllowed=resolver.resolve(registry,{...base,targetRegistryId:'bdr:asset:test:resolver-hash-001',runtimePolicy:{allowRepositoryRelative:true,allowHttps:false,availableProviders:['content_hash']}});
assert.equal(hashAllowed.status,'resolved');
assert.equal(hashAllowed.transport,'content_addressed_provider');

assert.equal(JSON.stringify(registry),before,'resolver must not mutate registry');
assert.ok(Object.isFrozen(local));
assert.ok(Object.isFrozen(local.locator));
assert.ok(Object.isFrozen(local.access));

console.log('RUNTIME_RESOURCE_RESOLVER_GATE=PASS');
console.log(JSON.stringify({schema:resolver.schema,descriptorSchema:resolver.descriptorSchema,local:local.status,content:content.status,https:remoteAllowed.status,contentHash:hashAllowed.status,registryImmutable:true},null,2));
