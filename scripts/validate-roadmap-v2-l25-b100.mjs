import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {loadCurrentPriorityHarness} from './roadmap-v2-priority-harness.mjs';

const readText=p=>fs.readFileSync(p,'utf8');
const priority=loadCurrentPriorityHarness();
const satisfying=new Set(priority.mastery.prerequisiteGate.satisfyingStates);

for(const doc of [
  'docs/roadmap_v2/L25_B97_ACCEPTANCE.md',
  'docs/roadmap_v2/L25_H1_PRIORITY_RESULT_SCHEMA.md',
  'docs/roadmap_v2/L25_B98_ACCEPTANCE.md',
  'docs/roadmap_v2/L25_B99_ACCEPTANCE.md',
  'docs/roadmap_v2/L25_F1_FLOAT_WEIGHT_VALIDATION.md',
  'docs/roadmap_v2/L25_F2_PACKAGED_HUB_READINESS.md',
  'docs/roadmap_v2/L25_F3_PRIORITY_HARNESS_DECODE.md',
  'docs/roadmap_v2/L25_F4_B99_BLUEPRINT_FIXTURE.md'
]){
  assert.match(readText(doc),/Status: `PASS`/,`L25 closeout prerequisite is not PASS: ${doc}`);
}

const protectedFiles=[
  'roadmap_v2/priority/priority-contract.json',
  'roadmap_v2/priority/priority-contract.schema.json',
  'roadmap_v2/priority/priority-candidate.schema.json',
  'roadmap_v2/priority/priority-result.schema.json',
  'roadmap_v2/mastery/mastery-contract.json',
  'roadmap_v2/mastery/mastery-snapshot.schema.json',
  'roadmap_v2/consumer/blueprint.json'
];
const before=Object.fromEntries(protectedFiles.map(p=>[p,fs.readFileSync(p)]));

assert.equal(priority.contract.schema,'BAUMAN_ROADMAP_V2_PRIORITY_CONTRACT_V2');
assert.equal(priority.resultSchema.$id,'BAUMAN_ROADMAP_V2_PRIORITY_RESULT_V2');
assert.equal(priority.contract.mode.productionIntegration,'disconnected');
assert.equal(priority.contract.mode.persistentStoreEnabled,false);
assert.equal(priority.contract.mode.schedulerWriteAllowed,false);
assert.equal(priority.contract.mode.runtimeWriteAllowed,false);
assert.equal(priority.contract.capabilities.persistentStoreWrite,false);
assert.equal(priority.contract.capabilities.schedulerWrite,false);
assert.equal(priority.contract.capabilities.runtimeActivation,false);

const targets=[];
for(const chapter of priority.blueprint.chapters){
  targets.push(chapter.id);
  for(const lesson of chapter.lessons)targets.push(lesson.id);
}
assert.equal(priority.blueprint.chapters.length,priority.blueprint.counts.chapters);
assert.equal(targets.length,priority.blueprint.counts.chapters+priority.blueprint.counts.numberedLessons);
assert.equal(new Set(targets).size,targets.length,'Consumer Blueprint target IDs are not unique');
assert.equal(targets.length,389,'current Priority closeout target count drift');

const phases=['GD0','GD1','GD2','GD3'];
const states=['chua_hoc','dang_hoc','dat_prerequisite','master_ready','can_on','gap'];
const weekPattern=[null,0,4,5,8,9,12,13,24,25];

function snapshot(targetId,state,phaseId,index){
  return {
    schema:'BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1',
    streamId:`B100::${index}::${targetId}`,
    targetId,
    phaseId,
    eventCount:1,
    lastSequence:1,
    knowledgeState:state,
    existingCompetencyVerified:false,
    dimensions:{},
    masterReadyGate:{passed:state==='master_ready'},
    prerequisiteEligible:satisfying.has(state),
    persisted:false,
    transitions:[]
  };
}

const candidates=targets.map((targetId,index)=>{
  const phaseId=phases[index%phases.length];
  const state=states[index%states.length];
  return {
    schema:'BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1',
    candidateId:`B100::${String(index+1).padStart(3,'0')}`,
    targetId,
    phaseId,
    masterRelevance:(index%101)/100,
    masterRelevanceSource:'L25/B100 full current-blueprint closeout fixture',
    weeksUntilNeeded:weekPattern[index%weekPattern.length],
    snapshot:snapshot(targetId,state,phaseId,index)
  };
});

const scored=candidates.map(x=>priority.scoreCandidate(x));
assert.equal(scored.length,389);
for(const result of scored){
  assert.equal(result.schema,'BAUMAN_ROADMAP_V2_PRIORITY_RESULT_V2');
  assert(result.weightedScore>=0&&result.weightedScore<=100);
  assert.equal(result.persisted,false);
  assert.equal(result.schedulerWriteAllowed,false);
  assert.equal(Object.isFrozen(result),true);
  assert.equal(Object.isFrozen(result.features),true);
  assert.equal(Object.isFrozen(result.weights),true);
  assert.equal(Object.isFrozen(result.contributions),true);
  assert.equal(Object.isFrozen(result.reasonCodes),true);
}

const rankedA=priority.rankCandidates(candidates);
const rankedB=priority.rankCandidates([...candidates].reverse());
const split=137;
const rotated=[...candidates.slice(split),...candidates.slice(0,split)];
const rankedC=priority.rankCandidates(rotated);
assert.deepEqual(rankedA,rankedB,'full ranking changed when input order reversed');
assert.deepEqual(rankedA,rankedC,'full ranking changed when input order rotated');
assert.equal(rankedA.length,389);
assert.deepEqual(rankedA.map(x=>x.rank),Array.from({length:389},(_,i)=>i+1));
assert.equal(new Set(rankedA.map(x=>x.targetId)).size,389);
assert.equal(Object.isFrozen(rankedA),true);
for(const result of rankedA){
  assert.equal(Object.isFrozen(result),true);
  assert.equal(result.persisted,false);
  assert.equal(result.schedulerWriteAllowed,false);
}

// Explicit closeout guard: critical override must still dominate rank order.
const criticalTargets=rankedA.filter(x=>x.criticalOverride);
if(criticalTargets.length){
  const firstNonCritical=rankedA.findIndex(x=>!x.criticalOverride);
  assert(firstNonCritical===-1||rankedA.slice(0,firstNonCritical).every(x=>x.criticalOverride),'non-critical result appeared before a critical result');
}

// Historical canonical engine/manifest stay quarantined.
assert.equal(fs.existsSync('roadmap_v2/priority.mjs'),false,'historical canonical Priority engine must remain absent');
assert.equal(fs.existsSync('roadmap_v2/priority/manifest.json'),false,'historical Priority manifest must remain absent');

// Harness itself must remain read-only and disconnected.
const harnessSource=readText('scripts/roadmap-v2-priority-harness.mjs');
for(const forbidden of [
  /writeFileSync\s*\(/,
  /appendFileSync\s*\(/,
  /writeFile\s*\(/,
  /localStorage/,
  /sessionStorage/,
  /fetch\s*\(/,
  /XMLHttpRequest/,
  /child_process/,
  /spawn\s*\(/,
  /exec\s*\(/
]){
  assert.doesNotMatch(harnessSource,forbidden,`Priority harness gained forbidden side-effect primitive: ${forbidden}`);
}

// Runtime trees must not import or activate the recovery/test harness.
function walk(dir){
  if(!fs.existsSync(dir))return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const p=path.join(dir,entry.name);
    return entry.isDirectory()?walk(p):[p];
  });
}
const runtimeFiles=[
  ...(fs.existsSync('index.html')?['index.html']:[]),
  ...walk('assets'),
  ...walk('subjects')
].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p));
for(const file of runtimeFiles){
  const text=readText(file);
  assert.equal(text.includes('roadmap-v2-priority-harness.mjs'),false,`Priority harness wired into runtime: ${file}`);
  assert.equal(text.includes('loadCurrentPriorityHarness'),false,`Priority harness activation leaked into runtime: ${file}`);
}

for(const [p,bytes] of Object.entries(before)){
  assert.deepEqual(fs.readFileSync(p),bytes,`B100 mutated canonical source: ${p}`);
}

console.log('ROADMAP_V2_L25_B100_PRIORITY_CLOSEOUT=PASS');
console.log(JSON.stringify({
  contract:priority.contract.schema,
  resultSchema:priority.resultSchema.$id,
  blueprintTargets:targets.length,
  scoredTargets:scored.length,
  rankedTargets:rankedA.length,
  reverseOrderDeterministic:true,
  rotatedOrderDeterministic:true,
  canonicalWrites:0,
  runtimeWiring:0,
  persistence:false,
  scheduler:false,
  runtimeActivation:false,
  productionIntegration:'disconnected'
},null,2));
