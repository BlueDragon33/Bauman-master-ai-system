import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const fail=message=>{throw new Error(`FOUNDATION_BROWSER_BOOTSTRAP_GATE=FAIL\n${message}`)};
const assert=(condition,message)=>{if(!condition)fail(message)};
const registry=JSON.parse(read('foundation/domain-model/legacy-mapping-registry.v1.json'));
const identitySource=read('foundation/domain-model/canonical-identity-runtime.js');
const storeSource=read('foundation/domain-model/identity-overlay-store.js');
const extractorSource=read('foundation/domain-model/legacy-snapshot-extractor.js');
const bootstrapSource=read('subjects/shared/foundation-identity-bootstrap.js');
const indexSource=read('subjects/russian/index.html');

assert(!/localStorage\s*\.\s*(setItem|removeItem|clear)\s*\(/.test(bootstrapSource),'Bootstrap must not write localStorage directly');
assert(!/sessionStorage\s*\.\s*(setItem|removeItem|clear)\s*\(/.test(bootstrapSource),'Bootstrap must not write sessionStorage');
assert(!/innerHTML\s*=|appendChild\s*\(|insertAdjacentHTML\s*\(/.test(bootstrapSource),'Bootstrap must remain UI-silent');
assert(bootstrapSource.includes("mode:'silent-read-only'"),'Bootstrap mode must be explicit');
assert(bootstrapSource.includes('FOUNDATION_IDENTITY_BOOTSTRAP_READ_ONLY'),'Read-only adapter must fail closed on writes');

const expectedScripts=[
  '../shared/host-bridge.js',
  '../../foundation/domain-model/canonical-identity-runtime.js',
  '../../foundation/domain-model/identity-overlay-store.js',
  '../../foundation/domain-model/legacy-snapshot-extractor.js',
  '../shared/foundation-identity-bootstrap.js',
  'assets/planning-bridge.js',
  'assets/core.js',
  'assets/learning-state.js'
];
let last=-1;
for(const src of expectedScripts){const pos=indexSource.indexOf(`src="${src}"`);assert(pos>=0,`Russian index missing ${src}`);assert(pos>last,`Unsafe script order near ${src}`);last=pos;}

class MemoryStorage{
  constructor(seed={}){this.map=new Map(Object.entries(seed));this.ops=[];}
  getItem(key){this.ops.push({op:'get',key});return this.map.has(key)?this.map.get(key):null;}
  setItem(key,value){this.ops.push({op:'set',key});this.map.set(key,String(value));}
  removeItem(key){this.ops.push({op:'remove',key});this.map.delete(key);}
  snapshot(){return JSON.stringify([...this.map.entries()].sort((a,b)=>a[0].localeCompare(b[0])));}
}

const seed={
  bauman_russian_survival_master_v11_clean_skeleton:JSON.stringify({view:'learning',learnTab:'theory',lessonId:'R01',slide:3,unknownCore:{keep:true}}),
  bauman_russian_learning_state_v1:JSON.stringify({schema:'RUSSIAN_LEARNING_STATE_V1',resume:{route:{view:'learning',lessonId:'R01'}},items:{'learning:theory:R01':{status:'in_progress',unknown:{keep:true}}},reviewQueue:{'vocab:12':{reason:'wrong'}},futureRoot:{keep:true}}),
  bauman_russian_learning_flow_v1:JSON.stringify({schema:'RUSSIAN_LEARNING_FLOW_V1',lessons:{R01:{steps:{theory:{events:2},speaking:{attempts:1}}}}}),
  bauman_russian_vocab_srs_v1:JSON.stringify({schema:'RUSSIAN_VOCAB_SRS_V1',cards:{'vocab:12':{reviewCount:2}},sentences:{'user:vocab:12:1':{sentence:'Это дом.'}}}),
  bauman_russian_academic_language_v1:JSON.stringify({schema:'RUSSIAN_ACADEMIC_LANGUAGE_V1',grammar:{G01:{ruleReads:1}},reading:{'R01:slide:3':{reads:1}},writing:{W01:{snapshots:[]}}})
};
const storage=new MemoryStorage(seed),before=storage.snapshot();
const events=[];
const sandbox={console,encodeURIComponent,decodeURIComponent,Date,JSON,Object,Set,String,Number,Error,Math,Promise,URL,CustomEvent:function(type,init){this.type=type;this.detail=init?.detail;}};
sandbox.globalThis=sandbox;
sandbox.localStorage=storage;
sandbox.BAUMAN_HOST_TASK={subjectId:'russian',courseId:'prep',taskId:'task-001',missionId:'mission-001'};
sandbox.dispatchEvent=event=>{events.push(event);return true;};
vm.runInNewContext(identitySource,sandbox,{filename:'canonical-identity-runtime.js'});
vm.runInNewContext(storeSource,sandbox,{filename:'identity-overlay-store.js'});
vm.runInNewContext(extractorSource,sandbox,{filename:'legacy-snapshot-extractor.js'});
vm.runInNewContext(bootstrapSource,sandbox,{filename:'foundation-identity-bootstrap.js'});
const api=sandbox.BaumanFoundationIdentityBootstrap;
assert(api?.schema==='BAUMAN_FOUNDATION_IDENTITY_BOOTSTRAP_V1','Bootstrap API missing');

const readOnly=api.readOnlyStorage(storage);
let writeBlocked=false;try{readOnly.setItem('x','y');}catch(error){writeBlocked=String(error?.message||'').includes('READ_ONLY');}
assert(writeBlocked,'Read-only adapter did not fail closed on write');

const fixed='2026-09-17T12:30:00.000Z';
const report=api.buildReport(registry,storage,sandbox.BAUMAN_HOST_TASK,fixed);
assert(report.mode==='silent-read-only','Unexpected bootstrap mode');
assert(report.persistedStatus==='empty','Fresh overlay should be empty before planning');
assert(report.descriptorCount>=12,'Too few legacy descriptors extracted');
assert(report.mappingCount===report.descriptorCount,'Every descriptor should map exactly once in fresh overlay');
assert(report.overlay?.schema==='BAUMAN_IDENTITY_OVERLAY_V1','Planned overlay schema mismatch');
assert(storage.snapshot()===before,'buildReport changed legacy or overlay storage');
assert(storage.ops.every(op=>op.op==='get'),'buildReport attempted a storage write');

storage.ops=[];
const runReport=await api.run({registry,storage,hostTask:sandbox.BAUMAN_HOST_TASK,now:fixed});
assert(runReport.plannedChecksum===report.plannedChecksum,'run() differs from pure buildReport()');
assert(storage.snapshot()===before,'run() changed storage');
assert(storage.ops.every(op=>op.op==='get'),'run() attempted a storage write');
assert(sandbox.BAUMAN_FOUNDATION_IDENTITY_REPORT?.schema==='BAUMAN_FOUNDATION_IDENTITY_BOOTSTRAP_V1','Runtime report was not exposed');
assert(events.some(event=>event.type==='bauman:foundation-identity-ready'),'Ready event missing');

const corruptSeed={...seed,bauman_identity_overlay_v1:'{"bad":true}'};
const corruptStorage=new MemoryStorage(corruptSeed),corruptBefore=corruptStorage.snapshot();
const corruptReport=api.buildReport(registry,corruptStorage,sandbox.BAUMAN_HOST_TASK,fixed);
assert(corruptReport.persistedStatus==='corrupt','Corrupt overlay must be reported as corrupt');
assert(corruptStorage.snapshot()===corruptBefore,'Corrupt overlay handling must remain read-only');
assert(corruptStorage.ops.every(op=>op.op==='get'),'Corrupt overlay handling attempted write/recovery');

console.log('FOUNDATION_BROWSER_BOOTSTRAP_GATE=PASS');
console.log(JSON.stringify({schema:api.schema,descriptorCount:report.descriptorCount,mappingCount:report.mappingCount,storageWrites:0,uiWrites:0,corruptRecoveryWrites:0},null,2));
