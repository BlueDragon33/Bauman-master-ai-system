import assert from 'node:assert/strict';
import registryApi from '../foundation/content-registry/content-asset-registry.js';
import provenance from '../foundation/content-registry/provenance-chain.js';
import store from '../foundation/content-registry/registry-snapshot-store.js';

function memoryStorage(){
  const map=new Map(),ops=[];
  return {
    ops,
    getItem(key){return map.has(key)?map.get(key):null;},
    setItem(key,value){ops.push(['set',key]);map.set(key,String(value));},
    removeItem(key){ops.push(['remove',key]);map.delete(key);}
  };
}

let registry=registryApi.emptyRegistry();
const put=record=>{registry=registryApi.appendRecord(registry,record);};
const source={registryId:'bdr:source:test:store-source-001',canonicalEntityId:'bd:source:test:store-source-001',sourceType:'repository',title:'Store source',locator:{kind:'repository_relative',value:'subjects/test/store.txt'},capturedAt:'2026-09-18T00:00:00Z',recordVersion:1};
const checksum={registryId:'bdr:checksum:test:store-001',algorithm:'sha256',digest:'d'.repeat(64),byteLength:12,recordVersion:1};
const asset={registryId:'bdr:asset:test:store-001',canonicalEntityId:'bd:artifact:test:store-001',assetType:'document',mediaType:'text/plain',checksumId:checksum.registryId,locators:[{kind:'repository_relative',value:'subjects/test/store.txt'}],state:'verified',recordVersion:1};
[source,checksum,asset].forEach(put);
registry=provenance.appendEvent(registry,{registryId:'bdr:provenance:test:store-import-001',eventType:'imported',subjectId:asset.registryId,sourceIds:[source.registryId],at:'2026-09-18T01:00:00Z',actor:'bd:person:test:maintainer',recordVersion:1});
put({registryId:'bdr:access:test:store-private-001',scope:asset.registryId,visibility:'private',recordVersion:1});
registry.extensions['x-bauman-store-test']={note:'round trip'};
const before=JSON.stringify(registry);

const config={storageKey:'bauman.registry.snapshot.v1',stagingKey:'bauman.registry.snapshot.v1.staging'};
const storage=memoryStorage();
const committedAt='2026-09-18T12:00:00.000Z';
const envelope=store.commit(storage,config,registry,committedAt);
assert.equal(envelope.schema,store.schema);
assert.equal(envelope.recordCount,5);
assert.equal(storage.getItem(config.stagingKey),null);
const state=store.read(storage,config);
assert.equal(state.status,'ok');
assert.deepEqual(state.registry,registry);
assert.equal(JSON.stringify(registry),before,'commit must not mutate source registry');

const crashStorage=memoryStorage();
const crashEnvelope=store.seal(registry,'2026-09-18T12:05:00.000Z');
crashStorage.setItem(config.stagingKey,store.stableStringify(crashEnvelope));
assert.equal(store.read(crashStorage,config).status,'staging');
const recovered=store.recover(crashStorage,config);
assert.equal(recovered.status,'ok');
assert.deepEqual(recovered.registry,registry);
assert.equal(crashStorage.getItem(config.stagingKey),null);

const allowed=new Set(store.allowedWriteKeys(config));
assert.equal(allowed.size,2);
for(const [,key] of [...storage.ops,...crashStorage.ops])assert.ok(allowed.has(key),`unexpected storage key: ${key}`);

console.log('REGISTRY_SNAPSHOT_STORE_GATE=PASS');
console.log(JSON.stringify({schema:store.schema,recordCount:envelope.recordCount,transactional:true,recovery:true,sourceImmutable:true},null,2));
