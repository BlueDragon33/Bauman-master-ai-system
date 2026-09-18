import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const fail=message=>{throw new Error(`FOUNDATION_CANONICAL_PROJECTION_GATE=FAIL\n${message}`)};
const assert=(condition,message)=>{if(!condition)fail(message)};
const registry=JSON.parse(read('foundation/domain-model/legacy-mapping-registry.v1.json'));
const sources={
  identity:read('foundation/domain-model/canonical-identity-runtime.js'),
  store:read('foundation/domain-model/identity-overlay-store.js'),
  extractor:read('foundation/domain-model/legacy-snapshot-extractor.js'),
  bootstrap:read('subjects/shared/foundation-identity-bootstrap.js'),
  persistence:read('subjects/shared/foundation-identity-persistence.js'),
  projection:read('foundation/domain-model/canonical-read-projection.js'),
  bridge:read('subjects/shared/foundation-identity-projection.js')
};
assert(!/localStorage\s*\.|sessionStorage\s*\.|document\s*\.|window\s*\./.test(sources.projection),'Projection core must remain browser/storage/UI neutral');
assert(!/innerHTML\s*=|appendChild\s*\(|insertAdjacentHTML\s*\(/.test(sources.bridge),'Projection bridge must not render UI');
assert(!/setItem\s*\(|removeItem\s*\(/.test(sources.bridge),'Projection bridge must not write storage');

const html=read('subjects/russian/index.html');
const ordered=[
  '../../foundation/domain-model/canonical-identity-runtime.js',
  '../../foundation/domain-model/identity-overlay-store.js',
  '../../foundation/domain-model/legacy-snapshot-extractor.js',
  '../../foundation/domain-model/canonical-read-projection.js',
  '../shared/foundation-identity-bootstrap.js',
  '../shared/foundation-identity-persistence.js',
  '../shared/foundation-identity-projection.js',
  'assets/planning-bridge.js'
];
let previous=-1;
for(const resource of ordered){const pos=html.indexOf(resource);assert(pos>previous,`Russian script order is invalid around ${resource}`);previous=pos;}

class MemoryStorage{
  constructor(seed={}){this.map=new Map(Object.entries(seed));this.ops=[];}
  getItem(key){this.ops.push({op:'get',key});return this.map.has(key)?this.map.get(key):null;}
  setItem(key,value){this.ops.push({op:'set',key});this.map.set(key,String(value));}
  removeItem(key){this.ops.push({op:'remove',key});this.map.delete(key);}
}
const listeners=new Map(),events=[];
const sandbox={console,encodeURIComponent,decodeURIComponent,Date,JSON,Object,Set,Map,String,Number,Error,Math,Promise,URL,queueMicrotask,CustomEvent:function(type,init){this.type=type;this.detail=init?.detail;}};
sandbox.globalThis=sandbox;
sandbox.addEventListener=(type,fn)=>{if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn);};
sandbox.dispatchEvent=event=>{events.push(event);for(const fn of listeners.get(event.type)||[])fn(event);return true;};
for(const [name,source] of Object.entries(sources))vm.runInNewContext(source,sandbox,{filename:name+'.js'});
const bootstrap=sandbox.BaumanFoundationIdentityBootstrap;
const persistence=sandbox.BaumanFoundationIdentityPersistence;
const projectionCore=sandbox.BaumanCanonicalReadProjection;
const bridge=sandbox.BaumanFoundationIdentityProjection;
assert(projectionCore?.schema==='BAUMAN_CANONICAL_READ_PROJECTION_V1','Projection core missing');
assert(bridge?.schema==='BAUMAN_FOUNDATION_IDENTITY_PROJECTION_BRIDGE_V1','Projection bridge missing');

const seed={
  bauman_russian_survival_master_v11_clean_skeleton:JSON.stringify({view:'learning',learnTab:'theory',lessonId:'R01',slide:2}),
  bauman_russian_learning_state_v1:JSON.stringify({schema:'RUSSIAN_LEARNING_STATE_V1',resume:{route:{view:'learning',lessonId:'R01'}},items:{'learning:theory:R01':{status:'in_progress'}},reviewQueue:{'vocab:12':{reason:'wrong'}}}),
  bauman_russian_learning_flow_v1:JSON.stringify({schema:'RUSSIAN_LEARNING_FLOW_V1',lessons:{R01:{steps:{theory:{events:1}}}}}),
  bauman_russian_vocab_srs_v1:JSON.stringify({schema:'RUSSIAN_VOCAB_SRS_V1',cards:{'vocab:12':{reviewCount:1}},sentences:{'user:vocab:12:123':{text:'Это дом.'}}}),
  bauman_russian_academic_language_v1:JSON.stringify({schema:'RUSSIAN_ACADEMIC_LANGUAGE_V1',grammar:{G01:{ruleReads:1}},reading:{'R01:slide:2':{reads:1}},writing:{W01:{drafts:1}}})
};
const storage=new MemoryStorage(seed),hostTask={subjectId:'russian',courseId:'prep',taskId:'task-001',missionId:'mission-001'},fixed='2026-09-17T14:00:00.000Z';
const bootstrapReport=bootstrap.buildReport(registry,storage,hostTask,fixed);
const persisted=await persistence.persist(bootstrapReport,{registry,storage,now:fixed});
assert(persisted.status==='persisted','Projection fixture overlay was not persisted');
sandbox.BAUMAN_FOUNDATION_IDENTITY_REPORT=bootstrapReport;
sandbox.BAUMAN_FOUNDATION_IDENTITY_PERSISTENCE_REPORT=persisted;
storage.ops=[];
const bridgeReport=bridge.rebuild();
assert(bridgeReport.status==='ready'&&bridgeReport.durable===true,'Projection bridge did not become durable-ready');
assert(storage.ops.length===0,'Projection bridge touched storage');

const rows=bridge.list();
assert(rows.length===bootstrapReport.mappingCount,'Projection mapping count differs from bootstrap mapping count');
assert(rows.length>5,'Projection fixture produced too few mappings');
for(let i=1;i<rows.length;i++)assert(rows[i-1].key.localeCompare(rows[i].key)<=0,'Projection rows are not deterministically sorted');
const sample=rows.find(row=>row.legacy.systemId==='russian-vocab-srs'&&row.legacy.scope==='card');
assert(sample,'Expected vocab card projection missing');
assert(bridge.canonicalFor(sample.legacy.systemId,sample.legacy.scope,sample.legacy.id)===sample.canonicalId,'canonicalFor lookup mismatch');
const resolved=bridge.resolve(sample.legacy.systemId,sample.legacy.scope,sample.legacy.id);
assert(resolved?.canonicalId===sample.canonicalId,'resolve lookup mismatch');
assert(Object.isFrozen(resolved)&&Object.isFrozen(resolved.legacy),'Resolved identity must be deeply frozen');
const reverse=bridge.reverse(sample.canonicalId);
assert(reverse.some(row=>row.key===sample.key),'Reverse canonical lookup mismatch');
assert(bridge.list({systemId:'russian-vocab-srs',scope:'card'}).every(row=>row.legacy.systemId==='russian-vocab-srs'&&row.legacy.scope==='card'),'Filtered list leaked unrelated mappings');
assert(bridge.canonicalFor('russian-vocab-srs','card','missing-card')===null,'Unknown mapping must return null');

const legacyRecord={nested:{value:1},unknown:{keep:true}};
const projected=bridge.projectRecord(sample.legacy.systemId,sample.legacy.scope,sample.legacy.id,legacyRecord);
assert(projected?.canonicalId===sample.canonicalId,'projectRecord canonical ID mismatch');
assert(projected.record!==legacyRecord&&projected.record.nested!==legacyRecord.nested,'projectRecord must clone legacy records');
try{projected.record.nested.value=99;}catch{}
assert(legacyRecord.nested.value===1,'Projected record mutated source legacy record');
assert(Object.isFrozen(projected)&&Object.isFrozen(projected.record)&&Object.isFrozen(projected.record.nested),'Projected record must be deeply frozen');

const mismatch=projectionCore.create(bootstrapReport,{...persisted,checksum:'deadbeef'});
assert(mismatch.status==='blocked'&&mismatch.reason==='checksum_mismatch','Checksum mismatch must block projection');
sandbox.BAUMAN_FOUNDATION_IDENTITY_PERSISTENCE_REPORT={schema:'BAUMAN_FOUNDATION_IDENTITY_PERSISTENCE_V1',status:'blocked-corrupt',reason:'existing_overlay_corrupt'};
const blocked=bridge.rebuild();
assert(blocked.status==='blocked'&&blocked.durable===false,'Corrupt persistence must block browser projection');
assert(bridge.canonicalFor(sample.legacy.systemId,sample.legacy.scope,sample.legacy.id)===null,'Blocked projection retained stale canonical lookup');
assert(bridge.list().length===0,'Blocked projection retained stale mapping list');
assert(events.some(event=>event.type==='bauman:foundation-identity-projection-ready'),'Projection ready event missing');

console.log('FOUNDATION_CANONICAL_PROJECTION_GATE=PASS');
console.log(JSON.stringify({schema:projectionCore.schema,bridgeSchema:bridge.schema,mappings:rows.length,durableReady:true,storageOpsDuringProjection:0,uiWrites:0,unknownFailsClosed:true,checksumMismatchBlocked:true,corruptPersistenceBlocked:true},null,2));
