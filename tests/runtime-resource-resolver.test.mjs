import assert from 'node:assert/strict';
import registryApi from '../foundation/content-registry/content-asset-registry.js';
import resolver from '../foundation/content-resolution/runtime-resource-resolver.js';

function makeRegistry(){
  let registry=registryApi.emptyRegistry();
  const put=record=>{registry=registryApi.appendRecord(registry,record);};
  const checksum=(id,digest)=>put({registryId:id,algorithm:'sha256',digest:digest.repeat(64),byteLength:1,recordVersion:1});
  checksum('bdr:checksum:test:r-a','a');
  checksum('bdr:checksum:test:r-b','b');
  checksum('bdr:checksum:test:r-c','c');
  checksum('bdr:checksum:test:r-d','d');
  put({registryId:'bdr:asset:test:r-a',canonicalEntityId:'bd:artifact:test:r-a',assetType:'document',mediaType:'text/plain',checksumId:'bdr:checksum:test:r-a',locators:[{kind:'repository_relative',value:'subjects/test/a.txt'}],state:'active',recordVersion:1});
  put({registryId:'bdr:asset:test:r-b',canonicalEntityId:'bd:artifact:test:r-b',assetType:'document',mediaType:'text/plain',checksumId:'bdr:checksum:test:r-b',locators:[{kind:'repository_relative',value:'subjects/test/b.txt'}],state:'verified',recordVersion:1});
  put({registryId:'bdr:asset:test:r-c',canonicalEntityId:'bd:artifact:test:r-c',assetType:'document',mediaType:'text/plain',checksumId:'bdr:checksum:test:r-c',locators:[{kind:'content_hash',value:'sha256:'+'c'.repeat(64)}],state:'verified',recordVersion:1});
  put({registryId:'bdr:asset:test:r-d',canonicalEntityId:'bd:artifact:test:r-d',assetType:'document',mediaType:'text/plain',checksumId:'bdr:checksum:test:r-d',locators:[{kind:'repository_relative',value:'subjects/test/d.txt'}],state:'quarantined',recordVersion:1});
  put({registryId:'bdr:content:test:r-multi',canonicalEntityId:'bd:artifact:test:r-multi',contentType:'learning_material',title:'Multi',assetIds:['bdr:asset:test:r-b','bdr:asset:test:r-a'],sourceIds:[],provenanceEventIds:[],recordVersion:1});
  put({registryId:'bdr:content:test:r-public',canonicalEntityId:'bd:artifact:test:r-public',contentType:'learning_material',title:'Public wrapper',assetIds:['bdr:asset:test:r-a'],sourceIds:[],provenanceEventIds:[],recordVersion:1});
  put({registryId:'bdr:access:test:r-public-access',scope:'bdr:content:test:r-public',visibility:'public',recordVersion:1});
  return registry;
}
const registry=makeRegistry();
const allowPrivate={mode:'learner_runtime',accessContext:{private:true},runtimePolicy:{allowRepositoryRelative:true,allowHttps:false,availableProviders:[]}};

assert.equal(resolver.resolve(registry,{...allowPrivate,targetRegistryId:'bdr:asset:test:missing'}).status,'not_found');

const denied=resolver.resolve(registry,{...allowPrivate,targetRegistryId:'bdr:asset:test:r-a',accessContext:{}});
assert.equal(denied.status,'blocked');
assert.equal(denied.reason,'target_access_denied');

const quarantined=resolver.resolve(registry,{...allowPrivate,targetRegistryId:'bdr:asset:test:r-d'});
assert.equal(quarantined.status,'blocked');
assert.equal(quarantined.reason,'asset_state_quarantined');

const hash=resolver.resolve(registry,{...allowPrivate,targetRegistryId:'bdr:asset:test:r-c'});
assert.equal(hash.status,'provider_required');

const ambiguous=resolver.resolve(registry,{...allowPrivate,targetRegistryId:'bdr:content:test:r-multi'});
assert.equal(ambiguous.status,'ambiguous');
assert.deepEqual(ambiguous.candidateAssetIds,['bdr:asset:test:r-a','bdr:asset:test:r-b']);

const preferred=resolver.resolve(registry,{...allowPrivate,targetRegistryId:'bdr:content:test:r-multi',preferredAssetId:'bdr:asset:test:r-b'});
assert.equal(preferred.status,'resolved');
assert.equal(preferred.assetRegistryId,'bdr:asset:test:r-b');

const notLinked=resolver.resolve(registry,{...allowPrivate,targetRegistryId:'bdr:content:test:r-multi',preferredAssetId:'bdr:asset:test:r-c'});
assert.equal(notLinked.status,'blocked');
assert.equal(notLinked.reason,'preferred_asset_not_linked');

const wrapperAllowedAssetDenied=resolver.resolve(registry,{
  ...allowPrivate,
  targetRegistryId:'bdr:content:test:r-public',
  accessContext:{}
});
assert.equal(wrapperAllowedAssetDenied.status,'blocked');
assert.equal(wrapperAllowedAssetDenied.reason,'no_readable_asset');

assert.throws(()=>resolver.resolve(registry,{targetRegistryId:'bdr:asset:test:r-a',mode:'unknown',accessContext:{private:true},runtimePolicy:{}}),/INVALID_MODE/);
assert.throws(()=>resolver.resolve(registry,{mode:'learner_runtime',accessContext:{private:true},runtimePolicy:{}}),/TARGET_REQUIRED/);

console.log('RUNTIME_RESOURCE_RESOLVER_NEGATIVE_TEST=PASS');
console.log(JSON.stringify({negativeCases:10,ambiguous:true,preferredAsset:true,doubleAccessCheck:true},null,2));
