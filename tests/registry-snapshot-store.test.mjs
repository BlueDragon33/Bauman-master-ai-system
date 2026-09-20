import assert from 'node:assert/strict';
import registryApi from '../foundation/content-registry/content-asset-registry.js';
import store from '../foundation/content-registry/registry-snapshot-store.js';

function memoryStorage(){
  const map=new Map();
  return {
    getItem(key){return map.has(key)?map.get(key):null;},
    setItem(key,value){map.set(key,String(value));},
    removeItem(key){map.delete(key);}
  };
}
let registry=registryApi.emptyRegistry();
registry=registryApi.appendRecord(registry,{registryId:'bdr:source:test:store-s-001',canonicalEntityId:'bd:source:test:store-s-001',sourceType:'repository',title:'S',locator:{kind:'repository_relative',value:'subjects/test/s.txt'},capturedAt:'2026-09-18T00:00:00Z',recordVersion:1});
const config={storageKey:'final',stagingKey:'staging'};
const at='2026-09-18T12:00:00.000Z';

assert.throws(()=>store.read({},config),/INVALID_STORAGE_ADAPTER/);
assert.throws(()=>store.allowedWriteKeys({storageKey:'same',stagingKey:'same'}),/STORAGE_KEYS_MUST_DIFFER/);
assert.throws(()=>store.seal(registry,'2026-09-18T12:00:00Z'),/INVALID_COMMITTED_AT/);

const envelope=store.seal(registry,at);
assert.equal(store.verifyEnvelope({...envelope,recordCount:99}).reason,'metadata');
assert.equal(store.verifyEnvelope({...envelope,schema:'OTHER'}).reason,'schema');
const nonCanonical={...envelope,snapshot:JSON.stringify(JSON.parse(envelope.snapshot),null,2)};
assert.equal(store.verifyEnvelope(nonCanonical).reason,'snapshot_noncanonical');

const corrupt=memoryStorage();
corrupt.setItem(config.storageKey,'{broken');
assert.equal(store.read(corrupt,config).status,'corrupt');

const recoverable=memoryStorage();
recoverable.setItem(config.storageKey,'{broken');
recoverable.setItem(config.stagingKey,store.stableStringify(envelope));
assert.equal(store.read(recoverable,config).status,'staging');
assert.equal(store.recover(recoverable,config).status,'ok');

const badWrite={
  map:new Map(),
  getItem(key){return this.map.has(key)?this.map.get(key):null;},
  setItem(key,value){this.map.set(key,String(value)+'x');},
  removeItem(key){this.map.delete(key);}
};
assert.throws(()=>store.commit(badWrite,config,registry,at),/STAGING_VERIFY_FAILED/);

const before=JSON.stringify(registry);
store.verifyEnvelope(envelope);
assert.equal(JSON.stringify(registry),before,'verification must be read-only');

console.log('REGISTRY_SNAPSHOT_STORE_TEST=PASS');
console.log(JSON.stringify({negativeCases:7,recovery:true,readOnly:true},null,2));
