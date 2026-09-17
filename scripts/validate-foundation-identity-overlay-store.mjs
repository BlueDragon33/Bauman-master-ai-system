import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const fail=message=>{throw new Error(`FOUNDATION_IDENTITY_OVERLAY_STORE_GATE=FAIL\n${message}`)};
const assert=(condition,message)=>{if(!condition)fail(message)};
const registry=JSON.parse(read('foundation/domain-model/legacy-mapping-registry.v1.json'));
const identitySource=read('foundation/domain-model/canonical-identity-runtime.js');
const storeSource=read('foundation/domain-model/identity-overlay-store.js');

const p=registry.persistence||{};
assert(p.storeSchema==='BAUMAN_IDENTITY_OVERLAY_STORE_V1','Unexpected store schema');
assert(p.storageKey==='bauman_identity_overlay_v1','Overlay final key changed unexpectedly');
assert(p.stagingKey==='bauman_identity_overlay_v1_staging','Overlay staging key changed unexpectedly');
assert(p.legacyKeysNeverWritten===true,'Legacy keys must never be written');
assert(p.stagingRequired===true,'Staging must be required');
assert(p.readBackVerificationRequired===true,'Read-back verification must be required');
assert(p.recoveryFromValidStagingAllowed===true,'Staging recovery contract missing');

assert(!/localStorage\s*\./.test(storeSource),'Overlay store must receive an adapter instead of hard-coding localStorage');
assert(!/sessionStorage\s*\./.test(storeSource),'Overlay store must not use sessionStorage');
assert(!/document\s*\./.test(storeSource),'Overlay store must be UI-neutral');
for(const system of registry.systems||[]){
  if(system.storageKey)assert(!storeSource.includes(system.storageKey),`Overlay store source must not embed legacy storage key ${system.storageKey}`);
}

const sandbox={console,encodeURIComponent,decodeURIComponent,Date,JSON,Object,Set,String,Number,Error,Math};
sandbox.globalThis=sandbox;
vm.runInNewContext(identitySource,sandbox,{filename:'canonical-identity-runtime.js'});
vm.runInNewContext(storeSource,sandbox,{filename:'identity-overlay-store.js'});
const identity=sandbox.BaumanIdentityRuntime,store=sandbox.BaumanIdentityOverlayStore;
assert(identity?.schema==='BAUMAN_CANONICAL_IDENTITY_RUNTIME_V1','Identity runtime missing');
assert(store?.schema==='BAUMAN_IDENTITY_OVERLAY_STORE_V1','Overlay store missing');

class MemoryStorage{
  constructor(seed={}){this.map=new Map(Object.entries(seed));this.ops=[];this.failOnSetKey=null;this.failOnce=false;}
  getItem(key){return this.map.has(key)?this.map.get(key):null;}
  setItem(key,value){this.ops.push({op:'set',key});if(this.failOnSetKey===key){if(this.failOnce)this.failOnSetKey=null;throw new Error(`SIMULATED_WRITE_FAILURE:${key}`);}this.map.set(key,String(value));}
  removeItem(key){this.ops.push({op:'remove',key});this.map.delete(key);}
}

const legacySeed={};
for(const system of registry.systems||[])if(system.storageKey)legacySeed[system.storageKey]=JSON.stringify({sentinel:`KEEP:${system.systemId}`,unknown:{preserve:true}});
const storage=new MemoryStorage(legacySeed);
const beforeLegacy=JSON.stringify(Object.fromEntries([...storage.map.entries()].filter(([key])=>key.startsWith('bauman_russian_'))));

const descriptors=[
  {systemId:'russian-learning-state',scope:'item',legacyId:'learning:theory:R01'},
  {systemId:'russian-learning-state',scope:'review',legacyId:'vocab:12'},
  {systemId:'russian-learning-flow',scope:'lesson',legacyId:'R01'},
  {systemId:'russian-vocab-srs',scope:'card',legacyId:'vocab:12'},
  {systemId:'russian-academic-language',scope:'reading',legacyId:'R01:slide:2'},
  {systemId:'bauman-subject-host',scope:'task',legacyId:'task-001'}
];
const fixed='2026-09-17T12:00:00.000Z';
const planned1=store.planMappings(registry,descriptors,{...identity.emptyOverlay(),extensions:{future:{keep:true}},futureRoot:{x:7}},fixed);
const planned2=store.planMappings(registry,descriptors,planned1,'2099-01-01T00:00:00.000Z');
assert(store.stableStringify(planned1)===store.stableStringify(planned2),'Planning the same mappings twice must be semantically idempotent');
assert(Object.keys(planned1.mappings).length===descriptors.length,'Unexpected planned mapping count');
assert(planned1.extensions.future.keep===true&&planned1.futureRoot.x===7,'Planning must preserve unknown overlay fields');

const envelope=store.commit(storage,registry,planned1,fixed);
assert(envelope.checksum===store.checksum(planned1),'Envelope checksum mismatch');
const readBack=store.read(storage,registry);
assert(readBack.status==='ok','Committed overlay did not read back as ok');
assert(store.stableStringify(readBack.overlay)===store.stableStringify(planned1),'Read-back overlay is not semantically identical to committed overlay');
assert(storage.getItem(p.stagingKey)===null,'Staging key must be removed after verified commit');

const allowed=new Set(store.allowedWriteKeys(registry));
assert(storage.ops.every(x=>allowed.has(x.key)),`Persistence touched a non-overlay key: ${JSON.stringify(storage.ops)}`);
const afterLegacy=JSON.stringify(Object.fromEntries([...storage.map.entries()].filter(([key])=>key.startsWith('bauman_russian_'))));
assert(beforeLegacy===afterLegacy,'Legacy storage changed during overlay commit');

const failureStorage=new MemoryStorage(legacySeed);
failureStorage.failOnSetKey=p.storageKey;failureStorage.failOnce=true;
let failed=false;
try{store.commit(failureStorage,registry,planned1,fixed)}catch(_){failed=true;}
assert(failed,'Simulated final write failure was not surfaced');
assert(failureStorage.getItem(p.stagingKey)!==null,'Verified staging copy must survive an interrupted final write');
for(const [key,value] of Object.entries(legacySeed))assert(failureStorage.getItem(key)===value,`Legacy key changed after interrupted commit: ${key}`);
const preRecovery=store.read(failureStorage,registry);
assert(preRecovery.status==='staging','Interrupted commit should expose a valid staging recovery candidate');
const recovered=store.recover(failureStorage,registry);
assert(recovered.status==='ok','Recovery did not restore a verified final overlay');
assert(failureStorage.getItem(p.stagingKey)===null,'Staging key must be removed after successful recovery');
for(const [key,value] of Object.entries(legacySeed))assert(failureStorage.getItem(key)===value,`Legacy key changed during recovery: ${key}`);
assert(failureStorage.ops.every(x=>allowed.has(x.key)),`Recovery touched a non-overlay key: ${JSON.stringify(failureStorage.ops)}`);

const corruptStorage=new MemoryStorage();
store.commit(corruptStorage,registry,planned1,fixed);
const raw=JSON.parse(corruptStorage.getItem(p.storageKey));
raw.overlay.mappings[Object.keys(raw.overlay.mappings)[0]].canonicalId='bd:task:tampered:value';
corruptStorage.map.set(p.storageKey,JSON.stringify(raw));
const corrupt=store.read(corruptStorage,registry);
assert(corrupt.status==='corrupt','Checksum tampering must fail closed as corrupt');

console.log('FOUNDATION_IDENTITY_OVERLAY_STORE_GATE=PASS');
console.log(JSON.stringify({storeSchema:store.schema,mappings:descriptors.length,transactional:true,recovery:true,legacyWrites:0,checksumFailClosed:true,canonicalSemanticCompare:true},null,2));
