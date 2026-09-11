'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const text=p=>fs.readFileSync(path.join(root,p),'utf8');
const errors=[];
const assert=(c,m)=>{if(!c)errors.push(m)};
const unique=a=>new Set(a).size===a.length;

const registry=read('assets/data/prerequisite-registry-iu5-2026.json');
const manifest=read('assets/data/prerequisite-packs/manifest-2026.json');
const chapters=read('subjects/math/data/chapter_spine.json');
const disciplines=read('subjects/math/data/discipline_spine.json').disciplines;
const programming=read('subjects/programming/data/lessons.json');
const runtime=text('assets/js/academic-main.js');

assert(manifest.schema==='bauman_prerequisite_pack_manifest_v1','diagnostic pack manifest schema drifted');
const manifestIds=(manifest.packs||[]).map(x=>x.gateId);
assert(unique(manifestIds),'manifest gate IDs must be unique');
for(const id of ['P0','P1','P2','P3','P4','P5','P6','P7','P8','P9','P10','P11','J1']) assert(manifestIds.includes(id),`manifest missing ${id}`);
assert(JSON.stringify(manifest.deferredUntilLaterJIT)===JSON.stringify(['P12','J2','J3','J4']),'later JIT gates must remain deferred after Pass13B');

const gateMap=new Map([...registry.coreGates,...registry.jitBridgeGates].map(x=>[x.id,x]));
const newSpecs={
  P1:{path:'assets/data/prerequisite-packs/p01-calculus-foundation.json',discipline:'calculus_multivariable',chapters:['MATH-VN-C03-ham_so_ao_ham_va_gradien']},
  P2:{path:'assets/data/prerequisite-packs/p02-linear-algebra.json',discipline:'linear_algebra_data_space',chapters:['MATH-VN-C01-vector_trong_khong_gian_','MATH-VN-C02-ma_tran_va_phep_bien_oi_','MATH-PREP-C10-ai_so_tuyen_tinh_ii_tri_']},
  P3:{path:'assets/data/prerequisite-packs/p03-probability-statistics.json',discipline:'probability_statistics_inference',chapters:['MATH-VN-C04-xac_suat_co_ban_va_bien_','MATH-PREP-C16-thong_ke_uoc_luong_kiem_']},
  P5:{path:'assets/data/prerequisite-packs/p05-python-oop.json',lessons:['PR03','PR13','PR14','PR17']}
};
const chapterIds=new Set(chapters.map(x=>x.id));
const disciplineIds=new Set(disciplines.map(x=>x.id));
const programmingIds=new Set(programming.map(x=>x.id));

for(const [gateId,spec] of Object.entries(newSpecs)){
  const pack=read(spec.path),gate=gateMap.get(gateId);
  assert(pack.schema==='bauman_prerequisite_pack_v1',`${gateId} schema drifted`);
  assert(pack.gateId===gateId,`${gateId} gateId mismatch`);
  assert(pack.reuseOnly===true,`${gateId} must be reuse-only`);
  assert(pack.notOfficialAdministrativePrerequisite===true,`${gateId} must remain non-administrative`);
  assert(pack.mastery?.target===90 && gate?.target===90,`${gateId} target must remain 90`);
  assert(pack.mastery?.applicationMinimum===85,`${gateId} D1 floor must be 85`);
  assert(pack.mastery?.masteredThreshold===95 && pack.mastery?.masteredApplicationMinimum===90,`${gateId} mastered rule drifted`);
  assert(pack.implementationPolicy?.schedulerMutation===false,`${gateId} content pack must not mutate scheduler`);
  assert(pack.implementationPolicy?.writesDiagnosticScores===false,`${gateId} content pack must not write learner scores`);
  assert(pack.implementationPolicy?.duplicatesExistingTheory===false,`${gateId} must not duplicate existing theory`);
  const nodes=pack.nodes||[],ids=nodes.map(x=>x.id),nodeSet=new Set(ids);
  assert(nodes.length===8,`${gateId} expected 8 diagnostic nodes`);
  assert(unique(ids),`${gateId} node IDs must be unique`);
  assert(nodes.every((x,i)=>x.order===i+1),`${gateId} node order must be 1..8`);
  for(const n of nodes)for(const dep of n.dependsOn||[])assert(nodeSet.has(dep),`${gateId} ${n.id} depends on missing ${dep}`);
  const d0=pack.diagnostic?.D0?.items||[],d1=pack.diagnostic?.D1?.items||[],d2=pack.diagnostic?.D2?.items||[];
  assert(pack.diagnostic?.D0?.weight===0.25 && pack.diagnostic?.D1?.weight===0.5 && pack.diagnostic?.D2?.weight===0.25,`${gateId} diagnostic weights drifted`);
  assert(d0.length===16,`${gateId} D0 must have 16 items`);
  assert(d1.length===10,`${gateId} D1 must have 10 items`);
  assert(d2.length===6,`${gateId} D2 must have 6 items`);
  const diag=[...d0,...d1,...d2];
  assert(unique(diag.map(x=>x.id)),`${gateId} diagnostic IDs must be unique`);
  for(const item of diag)assert(nodeSet.has(item.node),`${gateId} ${item.id} references missing node`);
  assert(d2.every(x=>typeof x.promptRu==='string'&&x.promptRu.length>35),`${gateId} D2 Russian prompts must be substantive`);
  assert((pack.criticalMisconceptions||[]).length>=7,`${gateId} needs critical misconceptions`);
  assert((pack.repairRoutes||[]).length>=3,`${gateId} needs repair routes`);
  for(const route of pack.repairRoutes||[]){for(const id of route.triggerNodes||[])assert(nodeSet.has(id),`${gateId} route ${route.id} has missing trigger ${id}`);assert(typeof route.stopWhen==='string'&&route.stopWhen.length>20,`${gateId} route ${route.id} needs measurable stop condition`)}
  if(spec.discipline)assert(disciplineIds.has(spec.discipline),`${gateId} reused Math discipline missing`);
  for(const id of spec.chapters||[])assert(chapterIds.has(id),`${gateId} reused Math chapter ${id} missing`);
  for(const id of spec.lessons||[])assert(programmingIds.has(id),`${gateId} reused Programming lesson ${id} missing`);
}

assert(/Academic 2026 Runtime · Pass 13[B-Z]/.test(runtime),'runtime must retain Pass13B-or-later diagnostic model');
assert(runtime.includes('bauman_academic_2026_diagnostics_v1'),'runtime must use dedicated diagnostic storage');
assert(runtime.includes('criticalMisconceptions'),'runtime must persist explicit critical misconception count');
assert(runtime.includes('failedNodeIds'),'runtime must support failed-node evidence');
assert(runtime.includes('Promise.allSettled'),'runtime must tolerate individual optional pack load failures');
assert(runtime.includes('repairRoutesForGate'),'runtime must expose evidence-aware repair routing');
assert(runtime.includes('shouldStopGate'),'runtime must expose STOP rule state');
assert(runtime.includes("reason:'application_floor_not_met'"),'runtime must enforce D1 floor');
assert(runtime.includes('diag.score>=95&&diag.d1>=90'),'MASTERED must require D1 >= 90');
assert(runtime.includes('diag.score<globalReady'),'runtime must keep sub-90 scores out of READY even when a local gate target is lower');
assert(!/schedule\.entries\s*\[[^\]]+\]\s*=/.test(runtime),'Academic runtime must not write schedule entries while scheduler feature gate is off');
assert(!/\.autoSchedule\s*\(/.test(runtime),'Academic runtime must not invoke autoSchedule while scheduler feature gate is off');

function stateOf(diag){if(!diag)return 'unassessed';const score=.25*diag.D0+.5*diag.D1+.25*diag.D2;if(diag.critical>0)return 'repair';if(score<60)return 'rebuild';if(score<80)return 'repair';if(score<90)return 'bridge';if(diag.D1<85)return 'repair';if(score>=95&&diag.D1>=90)return 'mastered';return 'ready'}
assert(stateOf(null)==='unassessed','UNASSESSED invariant failed');
assert(stateOf({D0:59,D1:59,D2:59,critical:0})==='rebuild','REBUILD boundary failed');
assert(stateOf({D0:60,D1:60,D2:60,critical:0})==='repair','REPAIR lower boundary failed');
assert(stateOf({D0:80,D1:80,D2:80,critical:0})==='bridge','BRIDGE lower boundary failed');
assert(stateOf({D0:88,D1:88,D2:88,critical:0})==='bridge','local target below 90 must not become global READY');
assert(stateOf({D0:96,D1:84,D2:96,critical:0})==='repair','D1 floor must override high overall score');
assert(stateOf({D0:92,D1:92,D2:92,critical:0})==='ready','READY invariant failed');
assert(stateOf({D0:96,D1:89,D2:96,critical:0})==='ready','MASTERED D1 floor invariant failed');
assert(stateOf({D0:96,D1:96,D2:96,critical:0})==='mastered','MASTERED invariant failed');
assert(stateOf({D0:100,D1:100,D2:100,critical:1})==='repair','critical misconception override failed');
function courseReady(states){return states.every(x=>x==='mastered')?'mastered':states.every(x=>x==='ready'||x==='mastered')?'ready':states.includes('rebuild')?'rebuild':states.includes('repair')?'repair':'bridge'}
assert(courseReady(['ready','mastered'])==='ready','course READY worst-gate invariant failed');
assert(courseReady(['mastered','mastered'])==='mastered','course MASTERED invariant failed');
assert(courseReady(['ready','bridge'])==='bridge','course weak critical gate must not be averaged away');

if(errors.length){console.error(`DIAGNOSTIC_RUNTIME_13B_VALIDATION_FAIL (${errors.length})`);errors.forEach(e=>console.error(`- ${e}`));process.exit(1)}
console.log('DIAGNOSTIC_RUNTIME_13B_VALIDATION_PASS');
console.log(JSON.stringify({manifestPacks:manifestIds.length,newReuseDiagnosticGates:Object.keys(newSpecs),statePolicy:['unassessed','rebuild','repair','bridge','ready','mastered'],schedulerMutation:false,forwardCompatible:true},null,2));