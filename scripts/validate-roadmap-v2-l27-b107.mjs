import assert from 'node:assert/strict';
import {loadCurrentReadinessHarness} from './roadmap-v2-readiness-harness.mjs';

const readiness=loadCurrentReadinessHarness();
const satisfying=new Set(readiness.mastery.contract.prerequisiteGate.satisfyingStates);

function snapshot(targetId,state='dang_hoc',phaseId='GD2',options={}){
  return {
    schema:'BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1',
    streamId:options.streamId||`B107::${phaseId}::${targetId}`,
    targetId,phaseId,eventCount:1,lastSequence:1,
    knowledgeState:state,existingCompetencyVerified:false,dimensions:{},
    masterReadyGate:{passed:false,checks:{}},
    prerequisiteEligible:satisfying.has(state),
    persisted:options.persisted===true,
    transitions:[]
  };
}
function item(id,snap){
  return {
    scheduleItemId:id,
    priorityCandidate:{
      schema:'BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1',
      candidateId:`B107::CANDIDATE::${id}`,
      targetId:snap.targetId,phaseId:snap.phaseId,
      masterRelevance:0.8,masterRelevanceSource:'L27/B107 adversarial fixture',
      weeksUntilNeeded:8,snapshot:snap
    },
    activityKind:'russian_foundation',
    estimatedMinutes:60,
    technicalTrack:null,
    russianTwinMinutes:null,
    dueDate:null,
    reviewRequested:false,
    source:{kind:'registry_static',ref:`registry://${snap.targetId}`,verified:true,masterModeRelation:'not_applicable'}
  };
}
function schedule(phaseId='GD2',items=[]){
  return {
    schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',
    requestId:`B107::SCHEDULE::${phaseId}`,
    phaseId,weekStart:'2026-09-21',weeklyCapacityMinutes:600,items
  };
}
function request(options={}){
  const phaseId=options.phaseId||'GD2';
  return {
    schema:'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1',
    reportId:options.reportId||'B107::READINESS',
    phaseId,
    focusTargetIds:options.focusTargetIds||['RU-R0-C01'],
    scheduleRequest:options.scheduleRequest||schedule(phaseId,options.items||[]),
    externalGates:options.externalGates||[]
  };
}
function gate(gateId='EXT-DIAGNOSTIC-ENTRY',satisfied=true,verified=true){
  return {gateId,satisfied,sourceRef:`verified://${gateId}`,verified};
}
let cases=0;
function rejected(fn,pattern){
  assert.throws(fn,pattern);
  cases+=1;
}

assert.equal(readiness.contract.acceptance.step,108);
assert.equal(readiness.contract.acceptance.result,'PASS_CLOSEOUT_PENDING_FINAL_STATE_GATE');
assert.equal(readiness.contract.mode.productionIntegration,'disconnected');

// Caller cannot smuggle a readiness decision.
{
  const bad=request();
  bad.overallColor='green';
  rejected(()=>readiness.projectReadiness(bad),/unsupported fields/);
}

// Unknown and duplicate focus targets fail closed.
rejected(()=>readiness.projectReadiness(request({focusTargetIds:['NOT-A-CURRENT-TARGET']})),/Unknown Readiness focus target/);
rejected(()=>readiness.projectReadiness(request({focusTargetIds:['RU-R0-C01','RU-R0-C01']})),/Duplicate Readiness focus target/);

// Readiness and Scheduler phases cannot diverge.
rejected(()=>readiness.projectReadiness(request({phaseId:'GD2',scheduleRequest:schedule('GD1',[])})),/Readiness\/Scheduler phase mismatch/);

// External gates must be known, unique, verified records rather than caller booleans.
rejected(()=>readiness.projectReadiness(request({externalGates:[gate('EXT-NOT-CURRENT')]})),/Unknown Readiness external gate/);
rejected(()=>readiness.projectReadiness(request({externalGates:[gate(),gate()]})),/Duplicate Readiness external gate/);
rejected(()=>readiness.projectReadiness(request({externalGates:[gate('EXT-DIAGNOSTIC-ENTRY',true,false)]})),/Unverified Readiness external gate/);
{
  const bad=request();
  bad.externalGates={'EXT-DIAGNOSTIC-ENTRY':true};
  rejected(()=>readiness.projectReadiness(bad),/external gates must be an array/i);
}

// Persisted mastery snapshots are not admissible to the read-only current lane.
{
  const persisted=snapshot('RU-R0-C01','dang_hoc','GD2',{persisted:true});
  rejected(()=>readiness.projectReadiness(request({items:[item('PERSISTED',persisted)]})),/persisted/i);
}

// A valid adversarial-control request still produces immutable, non-persistent output.
{
  const live=snapshot('RU-R0-C01');
  const result=readiness.projectReadiness(request({items:[item('CONTROL',live)]}));
  assert.equal(result.overallColor,'yellow');
  assert.equal(result.persisted,false);
  assert.equal(result.dashboardUiRendered,false);
  assert.equal(result.runtimeWriteAllowed,false);
  assert.equal(result.notificationWriteAllowed,false);
  assert(Object.isFrozen(result)&&Object.isFrozen(result.targets)&&Object.isFrozen(result.targets[0]));
}

assert.equal(cases,9);
console.log('ROADMAP_V2_L27_B107_ADVERSARIAL_READINESS=PASS');
console.log(JSON.stringify({
  adversarialCases:cases,
  callerDecisionInjectionRejected:true,
  unknownTargetRejected:true,
  duplicateTargetRejected:true,
  phaseMismatchRejected:true,
  unknownExternalGateRejected:true,
  duplicateExternalGateRejected:true,
  unverifiedExternalGateRejected:true,
  booleanGateMapRejected:true,
  persistedSnapshotRejected:true,
  productionIntegration:'disconnected',
  persistence:false,
  runtimeWrite:false,
  notificationWrite:false
},null,2));
