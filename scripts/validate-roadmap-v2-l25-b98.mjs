import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadCurrentPriorityHarness} from './roadmap-v2-priority-harness.mjs';

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
const priority=loadCurrentPriorityHarness();

const satisfying=new Set(priority.mastery.prerequisiteGate.satisfyingStates);
function snapshot(targetId,state,options={}){
  const phaseId=options.phaseId||'GD2';
  return {
    schema:'BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1',
    streamId:options.streamId||`B98::${targetId}::${phaseId}`,
    targetId,
    phaseId,
    eventCount:options.eventCount??1,
    lastSequence:options.lastSequence??1,
    knowledgeState:state,
    existingCompetencyVerified:options.existingCompetencyVerified??false,
    dimensions:options.dimensions||{},
    masterReadyGate:{passed:state==='master_ready'},
    prerequisiteEligible:satisfying.has(state),
    persisted:options.persisted??false,
    transitions:[]
  };
}
function candidate(targetId,state,options={}){
  const snap=options.snapshot||snapshot(targetId,state,{phaseId:options.phaseId||'GD2'});
  return {
    schema:'BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1',
    candidateId:options.candidateId||`B98::${targetId}::${state}`,
    targetId,
    phaseId:options.phaseId||snap.phaseId,
    masterRelevance:options.masterRelevance??0.8,
    masterRelevanceSource:options.masterRelevanceSource||'L25/B98 deterministic validator fixture',
    weeksUntilNeeded:Object.hasOwn(options,'weeksUntilNeeded')?options.weeksUntilNeeded:8,
    snapshot:snap
  };
}

assert.equal(priority.contract.schema,'BAUMAN_ROADMAP_V2_PRIORITY_CONTRACT_V2');
assert.equal(priority.resultSchema.$id,'BAUMAN_ROADMAP_V2_PRIORITY_RESULT_V2');
assert.equal(priority.contract.mode.productionIntegration,'disconnected');
assert.equal(priority.contract.capabilities.persistentStoreWrite,false);
assert.equal(priority.contract.capabilities.schedulerWrite,false);
assert.equal(priority.contract.capabilities.runtimeActivation,false);

// Exact weighted formula using integer percentage contributions.
const exact=priority.scoreCandidate(candidate('MATH-L2-C07','gap',{masterRelevance:0.9,weeksUntilNeeded:4}));
assert.deepEqual(exact.features,{
  masterRelevance:0.9,
  knowledgeGap:1,
  prerequisiteUrgency:1,
  forgettingRisk:0.25
});
assert.deepEqual(exact.weights,{
  masterRelevance:0.35,
  knowledgeGap:0.3,
  prerequisiteUrgency:0.2,
  forgettingRisk:0.15
});
assert.deepEqual(exact.contributions,{
  masterRelevance:31.5,
  knowledgeGap:30,
  prerequisiteUrgency:20,
  forgettingRisk:3.75
});
assert.equal(exact.weightedScore,85.25);
assert.equal(exact.criticalOverride,true);
assert.equal(exact.disposition,'critical');

// Every knowledge state maps to the current contract value.
const expectedGap={gap:1,chua_hoc:0.85,dang_hoc:0.6,can_on:0.45,dat_prerequisite:0.2,master_ready:0};
for(const [state,value] of Object.entries(expectedGap)){
  const r=priority.scoreCandidate(candidate('MATH-L1-C03',state,{candidateId:`STATE::${state}`}));
  assert.equal(r.features.knowledgeGap,value,`knowledge-gap normalization drift: ${state}`);
}

// Urgency boundaries.
for(const [weeks,value] of [[0,1],[4,1],[5,0.75],[8,0.75],[9,0.5],[12,0.5],[13,0.25],[24,0.25],[25,0.1],[null,0]]){
  const r=priority.scoreCandidate(candidate('MATH-L1-C03','dang_hoc',{
    candidateId:`WEEK::${String(weeks)}`,
    weeksUntilNeeded:weeks
  }));
  assert.equal(r.features.prerequisiteUrgency,value,`urgency normalization drift: ${weeks}`);
}

// Forgetting risk from state/retention.
assert.equal(priority.scoreCandidate(candidate('MATH-L1-C03','can_on')).features.forgettingRisk,1);
assert.equal(priority.scoreCandidate(candidate('MATH-L1-C03','dat_prerequisite')).features.forgettingRisk,0.6);
assert.equal(priority.scoreCandidate(candidate('MATH-L1-C03','dang_hoc')).features.forgettingRisk,0.45);
assert.equal(priority.scoreCandidate(candidate('MATH-L1-C03','gap',{weeksUntilNeeded:8})).features.forgettingRisk,0.25);
assert.equal(priority.scoreCandidate(candidate('MATH-L1-C03','chua_hoc')).features.forgettingRisk,0);
assert.equal(priority.scoreCandidate(candidate('MATH-L1-C03','master_ready')).features.forgettingRisk,0.15);

const retained=snapshot('MATH-L1-C03','dat_prerequisite',{
  dimensions:{retention:{percent:80,daysAfterLearning:14}}
});
assert.equal(priority.scoreCandidate(candidate('MATH-L1-C03','dat_prerequisite',{snapshot:retained})).features.forgettingRisk,0.15);
const failedRetention=snapshot('MATH-L1-C03','dat_prerequisite',{
  dimensions:{retention:{percent:70,daysAfterLearning:14}}
});
assert.equal(priority.scoreCandidate(candidate('MATH-L1-C03','dat_prerequisite',{snapshot:failedRetention})).features.forgettingRisk,1);
const staleRetention=snapshot('MATH-L1-C03','dat_prerequisite',{
  dimensions:{retention:{percent:80,daysAfterLearning:22}}
});
assert.equal(priority.scoreCandidate(candidate('MATH-L1-C03','dat_prerequisite',{snapshot:staleRetention})).features.forgettingRisk,1);

// Critical override applies only to gap <= 4 weeks.
assert.equal(priority.scoreCandidate(candidate('MATH-L2-C07','gap',{weeksUntilNeeded:4})).criticalOverride,true);
assert.equal(priority.scoreCandidate(candidate('MATH-L2-C07','gap',{weeksUntilNeeded:5})).criticalOverride,false);
assert.equal(priority.scoreCandidate(candidate('MATH-L2-C07','dang_hoc',{weeksUntilNeeded:4})).criticalOverride,false);

// Existing Competency + valid diagnostic/retention becomes review_on_demand, never Master-ready.
const reviewSnapshot=snapshot('MATH-L1-C03','dat_prerequisite',{
  existingCompetencyVerified:true,
  dimensions:{
    diagnostic:{scorePercent:90,criticalPercent:80},
    retention:{percent:80,daysAfterLearning:14}
  }
});
const review=priority.scoreCandidate(candidate('MATH-L1-C03','dat_prerequisite',{snapshot:reviewSnapshot}));
assert.equal(review.reviewOnDemand,true);
assert.equal(review.disposition,'review_on_demand');
assert.equal(review.masterReady,false);
assert.equal(review.persisted,false);
assert.equal(review.schedulerWriteAllowed,false);

const noRetention=snapshot('MATH-L1-C03','dat_prerequisite',{
  existingCompetencyVerified:true,
  dimensions:{diagnostic:{scorePercent:90,criticalPercent:80}}
});
assert.equal(priority.scoreCandidate(candidate('MATH-L1-C03','dat_prerequisite',{snapshot:noRetention})).reviewOnDemand,false);
const staleReview=snapshot('MATH-L1-C03','dat_prerequisite',{
  existingCompetencyVerified:true,
  dimensions:{
    diagnostic:{scorePercent:90,criticalPercent:80},
    retention:{percent:80,daysAfterLearning:22}
  }
});
assert.equal(priority.scoreCandidate(candidate('MATH-L1-C03','dat_prerequisite',{snapshot:staleReview})).reviewOnDemand,false);

// Weighted bands.
assert.equal(priority.scoreCandidate(candidate('MATH-L2-C07','gap',{masterRelevance:1,weeksUntilNeeded:8})).disposition,'high');
assert.equal(priority.scoreCandidate(candidate('MATH-L1-C03','dang_hoc',{masterRelevance:0.4,weeksUntilNeeded:12})).disposition,'medium');
assert.equal(priority.scoreCandidate(candidate('MATH-L1-C03','master_ready',{masterRelevance:0.1,weeksUntilNeeded:null})).disposition,'low');

// Result V2 output surface is exact and explainable.
const output=priority.scoreCandidate(candidate('MATH-L1-C03','dang_hoc'));
const allowedResult=new Set(Object.keys(priority.resultSchema.properties));
const requiredResult=new Set(priority.resultSchema.required);
for(const field of requiredResult)assert(Object.hasOwn(output,field),`result missing V2 field: ${field}`);
for(const field of Object.keys(output))assert(allowedResult.has(field),`result contains undeclared V2 field: ${field}`);
assert.equal(output.schema,'BAUMAN_ROADMAP_V2_PRIORITY_RESULT_V2');
assert.equal(Object.isFrozen(output),true);
assert.equal(Object.isFrozen(output.features),true);
assert.equal(Object.isFrozen(output.weights),true);
assert.equal(Object.isFrozen(output.contributions),true);
assert.equal(Object.isFrozen(output.reasonCodes),true);
assert.throws(()=>{output.disposition='critical';},TypeError);

// Fail closed on manual derived overrides and invalid inputs.
for(const field of ['knowledgeGap','prerequisiteUrgency','forgettingRisk','weightedScore','disposition','criticalOverride','reviewOnDemand','rank']){
  const input=candidate('MATH-L1-C03','dang_hoc',{candidateId:`OVERRIDE::${field}`});
  input[field]=1;
  assert.throws(()=>priority.scoreCandidate(input),new RegExp(`override is forbidden: ${field}`));
}
assert.throws(()=>priority.scoreCandidate(candidate('MATH-L1-C03','dang_hoc',{masterRelevance:1.1})),/outside \[0,1\]/);
assert.throws(()=>priority.scoreCandidate(candidate('MATH-L1-C03','dang_hoc',{weeksUntilNeeded:-1})),/Invalid weeks until needed/);
assert.throws(()=>priority.scoreCandidate(candidate('DOES-NOT-EXIST','dang_hoc')),/Unknown Priority target/);

const phaseMismatch=candidate('MATH-L1-C03','dang_hoc');
phaseMismatch.phaseId='GD3';
assert.throws(()=>priority.scoreCandidate(phaseMismatch),/phase mismatch/);

const persisted=snapshot('MATH-L1-C03','dang_hoc',{persisted:true});
assert.throws(()=>priority.scoreCandidate(candidate('MATH-L1-C03','dang_hoc',{snapshot:persisted})),/Persisted mastery snapshot admitted/);

const badMasterReady=snapshot('MATH-L1-C03','dang_hoc');
badMasterReady.masterReadyGate.passed=true;
assert.throws(()=>priority.scoreCandidate(candidate('MATH-L1-C03','dang_hoc',{snapshot:badMasterReady})),/Master-ready state\/gate mismatch/);

const badPrereq=snapshot('MATH-L1-C03','dang_hoc');
badPrereq.prerequisiteEligible=true;
assert.throws(()=>priority.scoreCandidate(candidate('MATH-L1-C03','dang_hoc',{snapshot:badPrereq})),/Prerequisite eligibility\/state mismatch/);

// B98 must not write canonical Priority engine/manifest or mutate source JSON.
assert.equal(fs.existsSync('roadmap_v2/priority.mjs'),false,'historical canonical Priority engine must remain absent');
assert.equal(fs.existsSync('roadmap_v2/priority/manifest.json'),false,'historical Priority manifest must remain quarantined');
for(const [p,bytes] of Object.entries(before)){
  assert.deepEqual(fs.readFileSync(p),bytes,`B98 mutated canonical source: ${p}`);
}

console.log('ROADMAP_V2_L25_B98_PRIORITY_SCORING=PASS');
console.log(JSON.stringify({
  formula:'35/30/20/15',
  scoreExample:exact.weightedScore,
  knowledgeStates:6,
  urgencyCases:10,
  criticalOverride:true,
  reviewOnDemand:true,
  resultSchema:priority.resultSchema.$id,
  deeplyFrozen:true,
  canonicalWrites:0,
  persistence:false,
  scheduler:false,
  runtimeActivation:false
},null,2));
