import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const fail=message=>{throw new Error(`FOUNDATION_IDENTITY_PERSISTENCE_GATE=FAIL\n${message}`)};
const assert=(condition,message)=>{if(!condition)fail(message)};
const registry=JSON.parse(read('foundation/domain-model/legacy-mapping-registry.v1.json'));
const identitySource=read('foundation/domain-model/canonical-identity-runtime.js');
const storeSource=read('foundation/domain-model/identity-overlay-store.js');
const extractorSource=read('foundation/domain-model/legacy-snapshot-extractor.js');
const bootstrapSource=read('subjects/shared/foundation-identity-bootstrap.js');
const persistenceSource=read('subjects/shared/foundation-identity-persistence.js');

const p=registry.persistence||{};
assert(p.browserPersistenceMode==='verified_overlay_only','Browser persistence mode must be verified_overlay_only');
assert(p.browserAutoCommitAllowed===true,'Browser auto-commit must be explicitly allowed');
assert(p.corruptOverlayAutoRepairAllowed===false,'Corrupt overlay must not be auto-repaired');
assert(p.idempotentNoRewriteRequired===true,'No-rewrite idempotence policy missing');
assert(!/innerHTML\s*=|appendChild\s*\(|insertAdjacentHTML\s*\(/.test(persistenceSource),'Persistence bridge must be UI-neutral');
assert(!/sessionStorage\s*\./.test(persistenceSource),'Persistence bridge must not use sessionStorage');
for(const system of registry.systems||[])if(system.storageKey)assert(!persistenceSource.includes(system.storageKey),`Persistence bridge must not embed legacy key ${system.storageKey}`);

class MemoryStorage{
  constructor(seed={}){this.map=new Map(Object.entries(seed));this.ops=[];this.failOnSetKey=null;}
  getItem(key){this.ops.push({op:'get',key});return this.map.has(key)?this.map.get(key):null;}
  setItem(key,value){this.ops.push({op:'set',key});if(this.failOnSetKey===key)throw new Error(`SIMULATED_WRITE_FAILURE:${key}`);this.map.set(key,String(value));}
  removeItem(key){this.ops.push({op:'remove',key});this.map.delete(key);}
  raw(key){return this.map.get(key)??null;}
}
const events=[];
const sandbox={console,encodeURIComponent,decodeURIComponent,Date,JSON,Object,Set,String,Number,Error,Math,Promise,URL,queueMicrotask,CustomEvent:function(type,init){this.type=type;this.detail=init?.detail;}};
sandbox.globalThis=sandbox;
sandbox.dispatchEvent=event=>{events.push(event);return true;};
sandbox.addEventListener=()=>{};
vm.runInNewContext(identitySource,sandbox,{filename:'canonical-identity-runtime.js'});
vm.runInNewContext(storeSource,sandbox,{filename:'identity-overlay-store.js'});
vm.runInNewContext(extractorSource,sandbox,{filename:'legacy-snapshot-extractor.js'});
vm.runInNewContext(bootstrapSource,sandbox,{filename:'foundation-identity-bootstrap.js'});
vm.runInNewContext(persistenceSource,sandbox,{filename:'foundation-identity-persistence.js'});
const bootstrap=sandbox.BaumanFoundationIdentityBootstrap,persist=sandbox.BaumanFoundationIdentityPersistence,store=sandbox.BaumanIdentityOverlayStore;
assert(persist?.schema==='BAUMAN_FOUNDATION_IDENTITY_PERSISTENCE_V1','Persistence bridge API missing');

const legacySeed={
  bauman_russian_survival_master_v11_clean_skeleton:JSON.stringify({view:'learning',learnTab:'theory',lessonId:'R01',slide:2,unknown:{keep:true}}),
  bauman_russian_learning_state_v1:JSON.stringify({schema:'RUSSIAN_LEARNING_STATE_V1',resume:{route:{view:'learning',lessonId:'R01'}},items:{'learning:theory:R01':{status:'in_progress'}},reviewQueue:{'vocab:12':{reason:'wrong'}}}),
  bauman_russian_learning_flow_v1:JSON.stringify({schema:'RUSSIAN_LEARNING_FLOW_V1',lessons:{R01:{steps:{theory:{events:1}}}}}),
  bauman_russian_vocab_srs_v1:JSON.stringify({schema:'RUSSIAN_VOCAB_SRS_V1',cards:{'vocab:12':{reviewCount:1}},sentences:{}}),
  bauman_russian_academic_language_v1:JSON.stringify({schema:'RUSSIAN_ACADEMIC_LANGUAGE_V1',grammar:{G01:{ruleReads:1}},reading:{},writing:{}})
};
const hostTask={subjectId:'russian',courseId:'prep',taskId:'task-001',missionId:'mission-001'};
const fixed='2026-09-17T13:00:00.000Z';
function legacyRaw(storage){return Object.fromEntries(Object.keys(legacySeed).map(key=>[key,storage.raw(key)]));}
function assertLegacyEqual(a,b,label){for(const key of Object.keys(legacySeed))assert(a[key]===b[key],`${label}: legacy bytes changed for ${key}`);}

// Empty overlay -> exactly one verified persisted overlay.
const storage=new MemoryStorage(legacySeed),before=legacyRaw(storage);
const report=bootstrap.buildReport(registry,storage,hostTask,fixed);
storage.ops=[];
const first=await persist.persist(report,{registry,storage,now:fixed});
assert(first.status==='persisted','Fresh overlay was not persisted');
assert(storage.raw(p.storageKey),'Final overlay key missing');
assert(storage.raw(p.stagingKey)===null,'Staging key must be cleaned after commit');
assertLegacyEqual(before,legacyRaw(storage),'fresh persist');
const writeKeys=storage.ops.filter(x=>x.op!=='get').map(x=>x.key);
assert(writeKeys.length>0,'Fresh persistence performed no overlay writes');
assert(writeKeys.every(key=>key===p.storageKey||key===p.stagingKey),`Persistence touched non-overlay key: ${JSON.stringify(writeKeys)}`);
const firstRaw=storage.raw(p.storageKey);

// Same overlay -> unchanged, zero writes/removes, same envelope bytes.
storage.ops=[];
const report2=bootstrap.buildReport(registry,storage,hostTask,'2099-01-01T00:00:00.000Z');
const second=await persist.persist(report2,{registry,storage,now:'2099-01-01T00:00:00.000Z'});
assert(second.status==='unchanged','Second identical persistence must be unchanged');
assert(storage.ops.every(x=>x.op==='get'),'Unchanged overlay must not rewrite storage');
assert(storage.raw(p.storageKey)===firstRaw,'Unchanged overlay envelope bytes changed');
assertLegacyEqual(before,legacyRaw(storage),'idempotent persist');

// Valid staging with same planned checksum -> verified recovery only.
const stagingStorage=new MemoryStorage(legacySeed);
const stagingReport=bootstrap.buildReport(registry,stagingStorage,hostTask,fixed);
const envelope={schema:store.schema,version:1,writtenAt:fixed,checksum:store.checksum(stagingReport.overlay),overlay:stagingReport.overlay};
stagingStorage.map.set(p.stagingKey,store.stableStringify(envelope));
const stagingBefore=legacyRaw(stagingStorage);stagingStorage.ops=[];
const recovered=await persist.persist(stagingReport,{registry,storage:stagingStorage,now:fixed});
assert(recovered.status==='recovered','Valid staging overlay was not recovered');
assert(stagingStorage.raw(p.storageKey),'Recovered final key missing');
assert(stagingStorage.raw(p.stagingKey)===null,'Recovered staging key not removed');
assert(stagingStorage.ops.filter(x=>x.op!=='get').every(x=>x.key===p.storageKey||x.key===p.stagingKey),'Recovery touched non-overlay storage');
assertLegacyEqual(stagingBefore,legacyRaw(stagingStorage),'staging recovery');

// Corrupt final overlay -> blocked, byte-for-byte unchanged, no writes/removes.
const corruptStorage=new MemoryStorage({...legacySeed,[p.storageKey]:'{"bad":true}'}),corruptBefore=legacyRaw(corruptStorage),corruptRaw=corruptStorage.raw(p.storageKey);
const corruptReport=bootstrap.buildReport(registry,corruptStorage,hostTask,fixed);corruptStorage.ops=[];
const blocked=await persist.persist(corruptReport,{registry,storage:corruptStorage,now:fixed});
assert(blocked.status==='blocked-corrupt','Corrupt overlay must fail closed');
assert(corruptStorage.ops.every(x=>x.op==='get'),'Corrupt overlay handling must not write/remove');
assert(corruptStorage.raw(p.storageKey)===corruptRaw,'Corrupt overlay must not be auto-repaired or replaced');
assertLegacyEqual(corruptBefore,legacyRaw(corruptStorage),'corrupt block');

// Tampered bootstrap report -> blocked before writes.
const tamperStorage=new MemoryStorage(legacySeed),tampered=JSON.parse(JSON.stringify(report));
tampered.overlay.futureTamper=true;tamperStorage.ops=[];
const integrity=await persist.persist(tampered,{registry,storage:tamperStorage,now:fixed});
assert(integrity.status==='blocked-integrity','Tampered bootstrap report must be blocked');
assert(tamperStorage.ops.every(x=>x.op==='get'),'Integrity block attempted a write');
assert(!tamperStorage.raw(p.storageKey),'Integrity block created final overlay');

assert(events.some(e=>e.type==='bauman:foundation-identity-persistence'),'Persistence status event missing');
console.log('FOUNDATION_IDENTITY_PERSISTENCE_GATE=PASS');
console.log(JSON.stringify({schema:persist.schema,first:first.status,second:second.status,recovery:recovered.status,corrupt:blocked.status,integrity:integrity.status,legacyWrites:0,idempotentNoRewrite:true},null,2));
