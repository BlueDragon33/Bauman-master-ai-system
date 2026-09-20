import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadCurrentMasteryHarness} from './roadmap-v2-mastery-harness.mjs';

const protectedFiles=[
  'roadmap_v2/mastery/mastery-contract.json',
  'roadmap_v2/mastery/mastery-contract.schema.json',
  'roadmap_v2/mastery/evidence-event.schema.json',
  'roadmap_v2/mastery/mastery-snapshot.schema.json',
  'roadmap_v2/consumer/blueprint.json',
  'roadmap_v2/diagnostic/catalog.json'
];
const before=Object.fromEntries(protectedFiles.map(p=>[p,fs.readFileSync(p)]));

const mastery=loadCurrentMasteryHarness();
const plan=mastery.catalog.plans.find(p=>p.deliveryMode==='static');
assert(plan,'No static target available for B94');

function event(sequence,evidenceType,payload,overrides={}){
  const targetId=overrides.targetId||plan.targetId;
  const phaseId=overrides.phaseId||'GD0';
  return {
    schema:'BAUMAN_ROADMAP_V2_EVIDENCE_EVENT_V1',
    eventId:overrides.eventId||`B94-EV-${sequence}`,
    streamId:overrides.streamId||`STREAM::${targetId}::${phaseId}`,
    sequence,targetId,phaseId,evidenceType,
    occurredAt:'2026-09-18T00:00:00Z',
    source:{kind:'b94_validation_fixture',ref:`FIXTURE-${sequence}`},
    payload
  };
}

function fullEvidence(){
  return [
    event(1,'chapter_assessment',{percent:85,criticalPercent:75}),
    event(2,'exercise_set',{percent:90,completedItems:20,totalItems:20}),
    event(3,'lab_or_simulation',{passed:true,explanationAccepted:true}),
    event(4,'project_rubric',{rubric:{correctness:3,clarity:3,verification:3,reproducibility:3}}),
    event(5,'retention_check',{percent:80,daysAfterLearning:14})
  ];
}

assert.equal(mastery.contract.schema,'BAUMAN_ROADMAP_V2_MASTERY_CONTRACT_V2');
assert.equal(mastery.contract.mode.productionIntegration,'disconnected');
assert.equal(mastery.contract.mode.persistentStoreEnabled,false);
assert.equal(mastery.contract.capabilities.persistentStoreWrite,false);
assert.equal(mastery.contract.capabilities.runtimeActivation,false);

const diagnosticPass=mastery.reduceEvidenceStream([
  event(1,'diagnostic_result',{
    status:'existing_competency_verified',
    scorePercent:100,
    criticalPercent:100,
    masterReady:false,
    persistable:false
  })
]);
assert.equal(diagnosticPass.knowledgeState,'dat_prerequisite');
assert.equal(diagnosticPass.existingCompetencyVerified,true);
assert.equal(diagnosticPass.prerequisiteEligible,true);
assert.equal(diagnosticPass.persisted,false);
assert.equal(diagnosticPass.masterReadyGate.passed,false);

const diagnosticGap=mastery.reduceEvidenceStream([
  event(1,'diagnostic_result',{
    status:'critical_gap',
    scorePercent:85,
    criticalPercent:50,
    masterReady:false,
    persistable:false
  })
]);
assert.equal(diagnosticGap.knowledgeState,'gap');
assert.equal(diagnosticGap.prerequisiteEligible,false);
assert.equal(diagnosticGap.persisted,false);

const complete=mastery.reduceEvidenceStream(fullEvidence());
assert.equal(complete.knowledgeState,'master_ready');
assert.equal(complete.masterReadyGate.passed,true);
assert.equal(complete.persisted,false);

const replay=mastery.reduceEvidenceStream(structuredClone(fullEvidence()));
assert.deepEqual(replay,complete);
assert.equal(Object.isFrozen(complete),true);
assert.equal(Object.isFrozen(complete.dimensions),true);
assert.equal(Object.isFrozen(complete.masterReadyGate),true);
assert.equal(Object.isFrozen(complete.transitions),true);
assert.throws(()=>{complete.knowledgeState='gap';},TypeError);

assert.throws(()=>mastery.reduceEvidenceStream([
  event(1,'chapter_assessment',{percent:80,criticalPercent:70}),
  event(2,'exercise_set',{percent:80,completedItems:20,totalItems:20},{eventId:'B94-EV-1'})
]),/Duplicate evidence event ID/);

assert.throws(()=>mastery.reduceEvidenceStream([
  event(2,'chapter_assessment',{percent:80,criticalPercent:70})
]),/Non-monotonic evidence sequence/);

assert.throws(()=>mastery.reduceEvidenceStream([
  event(1,'chapter_assessment',{percent:80,criticalPercent:70}),
  event(2,'exercise_set',{percent:80,completedItems:20,totalItems:20},{targetId:'MATH-L2-C07'})
]),/stream ID changed|target changed/);

assert.throws(()=>mastery.reduceEvidenceStream([
  event(1,'chapter_assessment',{percent:80,criticalPercent:70}),
  event(2,'exercise_set',{percent:80,completedItems:20,totalItems:20},{phaseId:'GD2'})
]),/stream ID changed|phase changed/);

assert.throws(()=>mastery.reduceEvidenceStream([
  event(1,'chapter_assessment',{percent:101,criticalPercent:70})
]),/between 0 and 100/);

assert.throws(()=>mastery.reduceEvidenceStream([
  event(1,'exercise_set',{percent:80,completedItems:21,totalItems:20})
]),/exceeds total/);

assert.throws(()=>mastery.reduceEvidenceStream([
  event(1,'diagnostic_result',{
    status:'existing_competency_verified',scorePercent:100,criticalPercent:100,masterReady:true,persistable:false
  })
]),/grants Master-ready/);

assert.throws(()=>mastery.reduceEvidenceStream([
  event(1,'diagnostic_result',{
    status:'existing_competency_verified',scorePercent:100,criticalPercent:100,masterReady:false,persistable:true
  })
]),/marked persistable/);

assert.throws(()=>mastery.reduceEvidenceStream([
  event(1,'chapter_assessment',{percent:80,criticalPercent:70},{targetId:'DOES-NOT-EXIST'})
]),/Unknown mastery target/);

assert.throws(()=>mastery.reduceEvidenceStream([
  event(1,'unknown_evidence',{},{})
]),/Unknown evidence type/);

assert.equal(fs.existsSync('roadmap_v2/mastery/mastery.mjs'),false,'canonical Mastery executable must remain absent');
assert.equal(fs.existsSync('roadmap_v2/mastery/manifest.json'),false,'historical Mastery manifest must remain quarantined');

for(const [p,bytes] of Object.entries(before)){
  assert.deepEqual(fs.readFileSync(p),bytes,`B94 harness mutated canonical source: ${p}`);
}

console.log('ROADMAP_V2_L24_B94_EVIDENCE_REDUCER=PASS');
console.log(JSON.stringify({
  targetId:plan.targetId,
  diagnosticPassState:diagnosticPass.knowledgeState,
  diagnosticGapState:diagnosticGap.knowledgeState,
  fullEvidenceState:complete.knowledgeState,
  deterministicReplay:true,
  deeplyFrozen:true,
  canonicalWrites:0,
  persistence:false,
  negativeCases:10
},null,2));
