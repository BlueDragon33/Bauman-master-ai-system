import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadCurrentPriorityHarness} from './roadmap-v2-priority-harness.mjs';

const priority=loadCurrentPriorityHarness();
const satisfying=new Set(priority.mastery.prerequisiteGate.satisfyingStates);

function snapshot(targetId,state,options={}){
  const phaseId=options.phaseId||'GD2';
  return {
    schema:'BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1',
    streamId:`B99::${targetId}::${phaseId}`,
    targetId,phaseId,eventCount:1,lastSequence:1,knowledgeState:state,
    existingCompetencyVerified:false,dimensions:{},
    masterReadyGate:{passed:state==='master_ready'},
    prerequisiteEligible:satisfying.has(state),
    persisted:false,transitions:[]
  };
}
function candidate(targetId,state,options={}){
  const snap=options.snapshot||snapshot(targetId,state,{phaseId:options.phaseId||'GD2'});
  return {
    schema:'BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1',
    candidateId:options.candidateId||`B99::${targetId}::${state}`,
    targetId,
    phaseId:options.phaseId||snap.phaseId,
    masterRelevance:options.masterRelevance??0.5,
    masterRelevanceSource:'L25/B99 deterministic ranking fixture',
    weeksUntilNeeded:Object.hasOwn(options,'weeksUntilNeeded')?options.weeksUntilNeeded:8,
    snapshot:snap
  };
}

assert.equal(priority.contract.ranking.stable,true);
assert.deepEqual(priority.contract.ranking.order,[
  'critical first',
  'weighted score descending',
  'weeks until needed ascending with null last',
  'target ID ascending'
]);

// Critical override must sort ahead of a higher weighted non-critical candidate.
const critical=candidate('MATH-L2-C07','gap',{masterRelevance:0.1,weeksUntilNeeded:4,candidateId:'CRITICAL'});
const highNonCritical=candidate('MATH-L1-C03','gap',{masterRelevance:1,weeksUntilNeeded:5,candidateId:'HIGH'});
const criticalRank=priority.rankCandidates([highNonCritical,critical]);
assert.equal(criticalRank[0].candidateId,'CRITICAL');
assert.equal(criticalRank[0].criticalOverride,true);
assert.equal(criticalRank[0].rank,1);

// Weighted score descending after critical flag.
const low=candidate('MATH-L1-C03','master_ready',{masterRelevance:0.1,weeksUntilNeeded:null,candidateId:'LOW'});
const medium=candidate('MATH-L1-C04','dang_hoc',{masterRelevance:0.4,weeksUntilNeeded:12,candidateId:'MEDIUM'});
const scoreRank=priority.rankCandidates([low,medium]);
assert(scoreRank[0].weightedScore>scoreRank[1].weightedScore);
assert.equal(scoreRank[0].candidateId,'MEDIUM');

// Equal weighted score in same urgency band -> earlier week first.
const week5=candidate('MATH-L1-C03','dang_hoc',{masterRelevance:0.5,weeksUntilNeeded:5,candidateId:'W5'});
const week8=candidate('MATH-L1-C04','dang_hoc',{masterRelevance:0.5,weeksUntilNeeded:8,candidateId:'W8'});
const weekRank=priority.rankCandidates([week8,week5]);
assert.equal(weekRank[0].weightedScore,weekRank[1].weightedScore);
assert.equal(weekRank[0].weeksUntilNeeded,5);
assert.equal(weekRank[1].weeksUntilNeeded,8);

// Null horizon sorts after finite horizon when score is equal.
const finite25=candidate('MATH-L1-C04','master_ready',{
  masterRelevance:5/35,
  weeksUntilNeeded:25,
  candidateId:'FINITE'
});
const nullDue=candidate('MATH-L1-C03','master_ready',{
  masterRelevance:0.2,
  weeksUntilNeeded:null,
  candidateId:'NULL'
});
const nullRank=priority.rankCandidates([nullDue,finite25]);
assert.equal(nullRank[0].weightedScore,nullRank[1].weightedScore);
assert.equal(nullRank[0].candidateId,'FINITE');
assert.equal(nullRank[1].candidateId,'NULL');

// Full tie -> target ID ascending, independent of input order.
const tie03=candidate('MATH-L1-C03','dang_hoc',{masterRelevance:0.5,weeksUntilNeeded:8,candidateId:'T03'});
const tie04=candidate('MATH-L1-C04','dang_hoc',{masterRelevance:0.5,weeksUntilNeeded:8,candidateId:'T04'});
const tieA=priority.rankCandidates([tie04,tie03]);
const tieB=priority.rankCandidates([tie03,tie04]);
assert.deepEqual(tieA.map(x=>x.targetId),['MATH-L1-C03','MATH-L1-C04']);
assert.deepEqual(tieB.map(x=>x.targetId),['MATH-L1-C03','MATH-L1-C04']);
assert.deepEqual(tieA,tieB);

// Larger mixed ranking is deterministic under reversed input.
const mixed=[
  candidate('MATH-L1-C03','dang_hoc',{masterRelevance:0.5,weeksUntilNeeded:8,candidateId:'A'}),
  candidate('MATH-L1-C04','master_ready',{masterRelevance:0.1,weeksUntilNeeded:null,candidateId:'B'}),
  candidate('MATH-L2-C07','gap',{masterRelevance:0.2,weeksUntilNeeded:4,candidateId:'C'}),
  candidate('MATH-L1-C02','dang_hoc',{masterRelevance:0.9,weeksUntilNeeded:5,candidateId:'D'})
];
const mixedA=priority.rankCandidates(mixed);
const mixedB=priority.rankCandidates([...mixed].reverse());
assert.deepEqual(mixedA,mixedB);
assert.deepEqual(mixedA.map(x=>x.rank),[1,2,3,4]);
assert.equal(mixedA[0].criticalOverride,true);

// Ranked results remain valid V2 surfaces and deeply frozen.
for(const result of mixedA){
  assert.equal(result.schema,'BAUMAN_ROADMAP_V2_PRIORITY_RESULT_V2');
  assert(Number.isInteger(result.rank)&&result.rank>=1);
  assert.equal(result.persisted,false);
  assert.equal(result.schedulerWriteAllowed,false);
  assert.equal(Object.isFrozen(result),true);
  assert.equal(Object.isFrozen(result.features),true);
  assert.equal(Object.isFrozen(result.weights),true);
  assert.equal(Object.isFrozen(result.contributions),true);
}
assert.equal(Object.isFrozen(mixedA),true);
assert.throws(()=>{mixedA[0].rank=99;},TypeError);

// Duplicate identities fail closed before ranking.
const dupIdA=candidate('MATH-L1-C03','dang_hoc',{candidateId:'DUP'});
const dupIdB=candidate('MATH-L1-C04','dang_hoc',{candidateId:'DUP'});
assert.throws(()=>priority.rankCandidates([dupIdA,dupIdB]),/Duplicate Priority candidate ID/);

const dupTargetA=candidate('MATH-L1-C03','dang_hoc',{candidateId:'ONE'});
const dupTargetB=candidate('MATH-L1-C03','master_ready',{candidateId:'TWO'});
assert.throws(()=>priority.rankCandidates([dupTargetA,dupTargetB]),/Duplicate Priority target ID/);

assert.throws(()=>priority.rankCandidates(null),/Priority candidates must be an array/);

// Input candidates are not mutated.
const source=[candidate('MATH-L1-C03','dang_hoc',{candidateId:'IMMUTABLE-A'}),candidate('MATH-L1-C04','dang_hoc',{candidateId:'IMMUTABLE-B'})];
const before=structuredClone(source);
priority.rankCandidates(source);
assert.deepEqual(source,before);

// Canonical historical engine/manifest remain quarantined.
assert.equal(fs.existsSync('roadmap_v2/priority.mjs'),false);
assert.equal(fs.existsSync('roadmap_v2/priority/manifest.json'),false);
assert.equal(priority.contract.mode.productionIntegration,'disconnected');
assert.equal(priority.contract.capabilities.persistentStoreWrite,false);
assert.equal(priority.contract.capabilities.schedulerWrite,false);
assert.equal(priority.contract.capabilities.runtimeActivation,false);

console.log('ROADMAP_V2_L25_B99_PRIORITY_RANKING=PASS');
console.log(JSON.stringify({
  criticalFirst:true,
  weightedScoreDescending:true,
  weeksAscendingNullLast:true,
  targetIdAscending:true,
  inputOrderIndependent:true,
  duplicateCandidateRejected:true,
  duplicateTargetRejected:true,
  resultSchema:'BAUMAN_ROADMAP_V2_PRIORITY_RESULT_V2',
  persistence:false,
  scheduler:false,
  runtimeActivation:false
},null,2));
