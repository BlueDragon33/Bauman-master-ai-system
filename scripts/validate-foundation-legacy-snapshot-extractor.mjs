import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const fail=message=>{throw new Error(`FOUNDATION_LEGACY_SNAPSHOT_EXTRACTOR_GATE=FAIL\n${message}`)};
const assert=(condition,message)=>{if(!condition)fail(message)};
const registry=JSON.parse(read('foundation/domain-model/legacy-mapping-registry.v1.json'));
const identitySource=read('foundation/domain-model/canonical-identity-runtime.js');
const storeSource=read('foundation/domain-model/identity-overlay-store.js');
const extractorSource=read('foundation/domain-model/legacy-snapshot-extractor.js');

for(const pattern of [/localStorage\s*\./,/sessionStorage\s*\./,/document\s*\./,/window\s*\./])assert(!pattern.test(extractorSource),`Extractor must be pure and environment-neutral: ${pattern}`);

const sourceShapeChecks=[
  ['subjects/russian/assets/learning-state.js',['items','reviewQueue','resume']],
  ['subjects/russian/assets/learning-flow.js',['lessons','steps']],
  ['subjects/russian/assets/vocab-srs.js',['cards','sentences']],
  ['subjects/russian/assets/academic-language.js',['grammar','reading','writing']],
  ['subjects/shared/host-bridge.js',['subjectId','courseId','taskId','missionId']]
];
for(const [file,tokens] of sourceShapeChecks){const text=read(file);for(const token of tokens)assert(text.includes(token),`Runtime source no longer exposes expected legacy shape ${token} in ${file}`);}

const sandbox={console,encodeURIComponent,decodeURIComponent,Date,JSON,Object,Set,String,Number,Error,Math};
sandbox.globalThis=sandbox;
vm.runInNewContext(identitySource,sandbox,{filename:'canonical-identity-runtime.js'});
vm.runInNewContext(storeSource,sandbox,{filename:'identity-overlay-store.js'});
vm.runInNewContext(extractorSource,sandbox,{filename:'legacy-snapshot-extractor.js'});
const identity=sandbox.BaumanIdentityRuntime,store=sandbox.BaumanIdentityOverlayStore,extractor=sandbox.BaumanLegacySnapshotExtractor;
assert(extractor?.schema==='BAUMAN_LEGACY_SNAPSHOT_EXTRACTOR_V1','Snapshot extractor did not initialize');
assert(extractor.routeFields.includes('lessonId')&&extractor.routeFields.includes('vocabIndex'),'Extractor route field contract incomplete');

const snapshots={
  'russian-core-state':{view:'learning',learnTab:'theory',lessonId:'R01',slide:2,unknownCoreField:{keep:true}},
  'russian-learning-state':{schema:'RUSSIAN_LEARNING_STATE_V1',resume:{route:{view:'learning',lessonId:'R01'},activity:'Không được dùng làm ID'},items:{'learning:theory:R01':{status:'in_progress'},'vocab:12':{status:'review_due'}},reviewQueue:{'vocab:12':{reason:'wrong_answer'}},unknown:{keep:true}},
  'russian-learning-flow':{schema:'RUSSIAN_LEARNING_FLOW_V1',lessons:{R01:{title:'Tên hiển thị không phải ID',steps:{theory:{events:2},speaking:{attempts:1}}},R02:{steps:{check:{correct:1}}}}},
  'russian-vocab-srs':{schema:'RUSSIAN_VOCAB_SRS_V1',cards:{'vocab:12':{term:'дом'},'vocab:13':{term:'окно'}},sentences:{'source:vocab:12':{sentence:'Вот мой дом.'},'user:vocab:13:1':{sentence:'Это окно.'}}},
  'russian-academic-language':{schema:'RUSSIAN_ACADEMIC_LANGUAGE_V1',grammar:{GR01:{ruleReads:1}},reading:{'R01:slide:2':{reads:1}},writing:{W01:{snapshots:[]}}},
  'bauman-subject-host':{subjectId:'russian',courseId:'prep-ru',taskId:'task-001',missionId:'mission-001',learningItem:'Display only'}
};
const before=JSON.stringify(snapshots);
const first=extractor.extractAll(registry,snapshots);
const second=extractor.extractAll(registry,snapshots);
assert(JSON.stringify(first)===JSON.stringify(second),'Snapshot extraction must be deterministic');
assert(JSON.stringify(snapshots)===before,'Snapshot extraction mutated legacy input');
assert(first.length===22,`Unexpected descriptor count: ${first.length}`);
assert(new Set(first.map(x=>`${x.systemId}|${x.scope}|${x.legacyId}`)).size===first.length,'Descriptors must be unique');
assert(!JSON.stringify(first).includes('Tên hiển thị không phải ID'),'Display title leaked into identity descriptors');
assert(!JSON.stringify(first).includes('Không được dùng làm ID'),'Resume activity label leaked into identity descriptors');
assert(!JSON.stringify(first).includes('Display only'),'Host display field leaked into identity descriptors');

const routeA=extractor.coreRouteId({slide:2,lessonId:'R01',view:'learning',learnTab:'theory'});
const routeB=extractor.coreRouteId({learnTab:'theory',view:'learning',lessonId:'R01',slide:2});
assert(routeA===routeB,'Core route identity must not depend on object insertion order');
assert(routeA==='view=learning&learnTab=theory&lessonId=R01&slide=2','Core route identity field order changed unexpectedly');

for(const row of first){
  const system=(registry.systems||[]).find(x=>x.systemId===row.systemId);
  assert(system,`Descriptor references unknown system ${row.systemId}`);
  assert((system.scopeRules||[]).some(x=>x.scope===row.scope),`Descriptor references unknown scope ${row.systemId}/${row.scope}`);
  const resolved=identity.resolveLegacy(registry,row.systemId,row.scope,row.legacyId);
  assert(resolved.canonicalId.startsWith('bd:'),`Descriptor did not resolve to canonical identity: ${JSON.stringify(row)}`);
}

const overlay=store.planMappings(registry,first,identity.emptyOverlay(),'2026-09-17T12:30:00.000Z');
assert(Object.keys(overlay.mappings).length===first.length,'End-to-end dry-run mapping count differs from descriptors');

class MemoryStorage{
  constructor(seed={}){this.map=new Map(Object.entries(seed));this.ops=[];}
  getItem(key){return this.map.has(key)?this.map.get(key):null;}
  setItem(key,value){this.ops.push({op:'set',key});this.map.set(key,String(value));}
  removeItem(key){this.ops.push({op:'remove',key});this.map.delete(key);}
}
const legacySeed={};for(const system of registry.systems||[])if(system.storageKey)legacySeed[system.storageKey]=JSON.stringify(snapshots[system.systemId]||{});
const memory=new MemoryStorage(legacySeed),legacyBefore=JSON.stringify(legacySeed);
store.commit(memory,registry,overlay,'2026-09-17T12:30:00.000Z');
const state=store.read(memory,registry);
assert(state.status==='ok','End-to-end dry-run overlay persistence failed');
assert(Object.keys(state.overlay.mappings).length===first.length,'Persisted end-to-end overlay lost mappings');
for(const [key,value] of Object.entries(JSON.parse(legacyBefore)))assert(memory.getItem(key)===value,`Dry-run changed legacy storage ${key}`);
const allowed=new Set(store.allowedWriteKeys(registry));assert(memory.ops.every(x=>allowed.has(x.key)),'End-to-end dry-run wrote outside overlay keys');

console.log('FOUNDATION_LEGACY_SNAPSHOT_EXTRACTOR_GATE=PASS');
console.log(JSON.stringify({schema:extractor.schema,descriptors:first.length,deterministic:true,legacyMutation:false,endToEndOverlay:true,legacyWrites:0},null,2));
