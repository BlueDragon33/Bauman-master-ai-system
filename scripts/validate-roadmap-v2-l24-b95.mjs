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

function event(sequence,evidenceType,payload,{targetId='MATH-L2-C07',phaseId='GD0',eventId,streamId}={}){
  return {
    schema:'BAUMAN_ROADMAP_V2_EVIDENCE_EVENT_V1',
    eventId:eventId||`B95-${targetId}-${phaseId}-${sequence}`,
    streamId:streamId||`STREAM::${targetId}::${phaseId}`,
    sequence,targetId,phaseId,evidenceType,
    occurredAt:'2026-09-18T00:00:00Z',
    source:{kind:'b95_validation_fixture',ref:`FIXTURE-${sequence}`},
    payload
  };
}

function fullEvidence({targetId='MATH-L2-C07',phaseId='GD0',includeTerms=true}={}){
  const opts={targetId,phaseId};
  const events=[
    event(1,'chapter_assessment',{percent:85,criticalPercent:75},opts),
    event(2,'exercise_set',{percent:90,completedItems:20,totalItems:20},opts),
    event(3,'lab_or_simulation',{passed:true,explanationAccepted:true},opts),
    event(4,'project_rubric',{rubric:{correctness:3,clarity:3,verification:3,reproducibility:3}},opts),
    event(5,'retention_check',{percent:80,daysAfterLearning:14},opts)
  ];
  if(includeTerms&&['GD2','GD3'].includes(phaseId)&&!targetId.startsWith('RU-')){
    events.push(event(6,'russian_technical_terms',{verifiedTermCount:5},opts));
  }
  return events;
}

function snapshot(targetId,knowledgeState){
  return {
    schema:'BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1',
    targetId,
    knowledgeState,
    persisted:false
  };
}

assert.equal(mastery.contract.schema,'BAUMAN_ROADMAP_V2_MASTERY_CONTRACT_V2');
assert.equal(mastery.prerequisitePolicy.validation.result,'PASS');
assert.equal(mastery.prerequisitePolicy.mode.productionIntegration,'disconnected');

// Master-ready requires every GD0 dimension.
const complete=mastery.reduceEvidenceStream(fullEvidence());
assert.equal(complete.knowledgeState,'master_ready');
assert.equal(complete.masterReadyGate.passed,true);
assert.equal(complete.persisted,false);
assert.equal(Object.values(complete.masterReadyGate.checks).every(Boolean),true);

// Missing one required dimension must not yield Master-ready.
const noLab=fullEvidence().filter(e=>e.evidenceType!=='lab_or_simulation').map((e,i)=>({...e,sequence:i+1,eventId:`B95-NOLAB-${i+1}`}));
const noLabResult=mastery.reduceEvidenceStream(noLab);
assert.notEqual(noLabResult.knowledgeState,'master_ready');
assert.equal(noLabResult.masterReadyGate.checks.labOrSimulation,false);

// GD2/GD3 non-Russian targets require technical Russian terms.
const gd2NoTerms=mastery.reduceEvidenceStream(fullEvidence({phaseId:'GD2',includeTerms:false}));
assert.equal(gd2NoTerms.masterReadyGate.russianTermsRequired,true);
assert.equal(gd2NoTerms.masterReadyGate.checks.russianTechnicalTerms,false);
assert.notEqual(gd2NoTerms.knowledgeState,'master_ready');

const gd2WithTerms=mastery.reduceEvidenceStream(fullEvidence({phaseId:'GD2',includeTerms:true}));
assert.equal(gd2WithTerms.masterReadyGate.checks.russianTechnicalTerms,true);
assert.equal(gd2WithTerms.knowledgeState,'master_ready');

// Russian target is exempt from the additional Russian-term gate.
const russianTarget=mastery.reduceEvidenceStream(fullEvidence({targetId:'RU-R3-C07',phaseId:'GD3',includeTerms:false}));
assert.equal(russianTarget.masterReadyGate.russianTermsRequired,false);
assert.equal(russianTarget.knowledgeState,'master_ready');

// Retention regression demotes previously complete evidence to can_on.
const retentionEvents=fullEvidence();
retentionEvents.push(event(6,'retention_check',{percent:70,daysAfterLearning:21}));
const retention=mastery.reduceEvidenceStream(retentionEvents);
assert.equal(retention.knowledgeState,'can_on');
assert.equal(retention.masterReadyGate.checks.retention,false);
assert.equal(retention.prerequisiteEligible,false);
assert(retention.transitions.some(t=>t.from==='master_ready'&&t.to==='can_on'));

// Gap override blocks Master-ready and explicit clear can restore it.
const base=fullEvidence();
const withGap=mastery.reduceEvidenceStream([...base,event(6,'gap_override',{active:true,reason:'reviewed critical gap'})]);
assert.equal(withGap.knowledgeState,'gap');
assert.equal(withGap.masterReadyGate.checks.noGapOverride,false);
const cleared=mastery.reduceEvidenceStream([
  ...base,
  event(6,'gap_override',{active:true,reason:'reviewed critical gap'}),
  event(7,'gap_override',{active:false,reason:'gap resolved by reviewed evidence'})
]);
assert.equal(cleared.knowledgeState,'master_ready');
assert.equal(cleared.masterReadyGate.passed,true);

// ANY-OF: internal prerequisite OR explicit external competency confirmation.
const anyNone=mastery.evaluatePrerequisiteGate('MATH-L0-C02',[]);
assert.equal(anyNone.ready,false);
assert.equal(anyNone.blockers.length,1);
assert.equal(anyNone.blockers[0].logic,'any_of');

const anyInternal=mastery.evaluatePrerequisiteGate('MATH-L0-C02',[
  snapshot('MATH-L0-C01','dat_prerequisite')
]);
assert.equal(anyInternal.ready,true);

const anyExternal=mastery.evaluatePrerequisiteGate('MATH-L0-C02',[],{
  'EXT-EXISTING-COMPETENCY-CONFIRMED':true
});
assert.equal(anyExternal.ready,true);

// Recommended prerequisite never blocks a required prerequisite.
const recommendedBlocked=mastery.evaluatePrerequisiteGate('PY-L2-C05',[]);
assert.equal(recommendedBlocked.ready,false);
assert(recommendedBlocked.blockers.some(x=>x.from==='PY-L2-C04'));
assert(recommendedBlocked.advisory.some(x=>x.from==='DB-L1-C02'&&x.type==='recommended'));

const recommendedReady=mastery.evaluatePrerequisiteGate('PY-L2-C05',[
  snapshot('PY-L2-C04','dat_prerequisite')
]);
assert.equal(recommendedReady.ready,true);
assert.equal(recommendedReady.recommendedEdgesBlock,false);

// Just-in-time edges are blocking but only their own segment is JIT.
const jitBlocked=mastery.evaluatePrerequisiteGate('ML-L1-C02',[
  snapshot('ML-L1-C01','dat_prerequisite'),
  snapshot('MATH-L1-C03','master_ready'),
  snapshot('MATH-L1-C04','dat_prerequisite')
]);
assert.equal(jitBlocked.ready,false);
assert(jitBlocked.blockers.some(x=>x.type==='just_in_time'));

const jitReady=mastery.evaluatePrerequisiteGate('ML-L1-C02',[
  snapshot('ML-L1-C01','dat_prerequisite'),
  snapshot('MATH-L1-C03','master_ready'),
  snapshot('MATH-L1-C04','dat_prerequisite'),
  snapshot('MATH-L3-C09-L02','dat_prerequisite'),
  snapshot('MATH-L3-C09-L03','master_ready')
]);
assert.equal(jitReady.ready,true);

// Concurrent edge accepts in-progress state; the ordinary prerequisite still must satisfy.
const concurrentBlocked=mastery.evaluatePrerequisiteGate('ML-L3-C08',[
  snapshot('RU-R3-C07','dang_hoc')
]);
assert.equal(concurrentBlocked.ready,false);
assert(concurrentBlocked.blockers.some(x=>x.from==='ML-L1-C01'));

const concurrentReady=mastery.evaluatePrerequisiteGate('ML-L3-C08',[
  snapshot('ML-L1-C01','dat_prerequisite'),
  snapshot('RU-R3-C07','dang_hoc')
]);
assert.equal(concurrentReady.ready,true);

// Contextual external gates remain explicit/advisory and do not silently become satisfied.
const contextual=mastery.evaluatePrerequisiteGate('RU-R2-C06',[
  snapshot('RU-R2-C05','dat_prerequisite')
]);
assert.equal(contextual.ready,true);
assert(contextual.advisory.some(x=>x.from==='EXT-TECH-CHAPTER-IN-PROGRESS'&&x.type==='contextual'));
assert(contextual.unresolvedExternalGateIds.includes('EXT-TECH-CHAPTER-IN-PROGRESS'));
assert.equal(contextual.contextualEdgesBlock,false);

// Blocking external gate must be explicitly supplied true.
const externalBlocked=mastery.evaluatePrerequisiteGate('RU-R3-C08',[
  snapshot('RU-R3-C07','master_ready')
]);
assert.equal(externalBlocked.ready,false);
assert(externalBlocked.unresolvedExternalGateIds.includes('EXT-COMPLETE-TECHNICAL-PROJECT'));

const externalFalse=mastery.evaluatePrerequisiteGate('RU-R3-C08',[
  snapshot('RU-R3-C07','master_ready')
],{'EXT-COMPLETE-TECHNICAL-PROJECT':false});
assert.equal(externalFalse.ready,false);

const externalReady=mastery.evaluatePrerequisiteGate('RU-R3-C08',[
  snapshot('RU-R3-C07','master_ready')
],{'EXT-COMPLETE-TECHNICAL-PROJECT':true});
assert.equal(externalReady.ready,true);
assert.equal(externalReady.unresolvedExternalGateIds.length,0);

// Fail closed on malformed prerequisite inputs.
assert.throws(()=>mastery.evaluatePrerequisiteGate('ML-L2-C04',[
  snapshot('MATH-L2-C07','dat_prerequisite'),
  snapshot('MATH-L2-C07','master_ready')
]),/Duplicate mastery snapshot target/);
assert.throws(()=>mastery.evaluatePrerequisiteGate('ML-L2-C04',[
  {...snapshot('MATH-L2-C07','dat_prerequisite'),persisted:true}
]),/Persisted snapshot admitted/);
assert.throws(()=>mastery.evaluatePrerequisiteGate('ML-L2-C04',[
  snapshot('DOES-NOT-EXIST','dat_prerequisite')
]),/Unknown mastery snapshot target/);
assert.throws(()=>mastery.evaluatePrerequisiteGate('DOES-NOT-EXIST',[]),/Unknown prerequisite target/);

// All returned evaluations are immutable and non-persisted.
assert.equal(Object.isFrozen(externalReady),true);
assert.equal(Object.isFrozen(externalReady.blockers),true);
assert.equal(externalReady.persisted,false);

for(const [p,bytes] of Object.entries(before)){
  assert.deepEqual(fs.readFileSync(p),bytes,`B95 mutated canonical source: ${p}`);
}
assert.equal(fs.existsSync('roadmap_v2/graph/prerequisite-graph.json'),false,'historical prerequisite graph must remain quarantined');
assert.equal(fs.existsSync('roadmap_v2/mastery/manifest.json'),false,'historical mastery manifest must remain quarantined');

console.log('ROADMAP_V2_L24_B95_MASTERY_PREREQUISITE_GATES=PASS');
console.log(JSON.stringify({
  mastery:{
    fullEvidence:'master_ready',
    retentionRegression:'can_on',
    gd2RussianTermsRequired:true,
    russianTargetAdditionalTermsRequired:false,
    gapOverrideBlocks:true
  },
  prerequisites:{
    anyOf:true,
    justInTime:true,
    concurrent:true,
    recommendedNonBlocking:true,
    contextualNonBlockingExplicit:true,
    blockingExternalExplicit:true
  },
  persistence:false,
  canonicalWrites:0
},null,2));
