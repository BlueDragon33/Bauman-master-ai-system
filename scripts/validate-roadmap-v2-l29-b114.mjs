import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {loadCurrentConsumerAdmissionHarness} from './roadmap-v2-consumer-admission-harness.mjs';

const consumer=loadCurrentConsumerAdmissionHarness();
const satisfying=new Set(consumer.admission.readiness.mastery.contract.prerequisiteGate.satisfyingStates);

function snapshot(targetId,state,phaseId='GD2',options={}){
  return {
    schema:'BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1',
    streamId:options.streamId||`B114::${phaseId}::${targetId}`,
    targetId,phaseId,eventCount:options.eventCount??1,lastSequence:options.lastSequence??1,
    knowledgeState:state,existingCompetencyVerified:false,
    dimensions:options.dimensions||{},
    masterReadyGate:options.masterReadyGate||{passed:false,checks:{}},
    prerequisiteEligible:satisfying.has(state),persisted:false,transitions:[]
  };
}
function item(id,snap,options={}){
  const technicalTrack=options.technicalTrack===undefined?'math':options.technicalTrack;
  return {
    scheduleItemId:id,
    priorityCandidate:{
      schema:'BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1',
      candidateId:`B114::CANDIDATE::${id}`,
      targetId:snap.targetId,phaseId:snap.phaseId,
      masterRelevance:0.8,masterRelevanceSource:'L29/B114 shadow adapter fixture',
      weeksUntilNeeded:8,snapshot:snap
    },
    activityKind:options.activityKind||'technical_core',
    estimatedMinutes:60,
    technicalTrack,
    russianTwinMinutes:technicalTrack===null?null:30,
    dueDate:null,reviewRequested:false,
    source:{kind:'registry_static',ref:`registry://${snap.targetId}`,verified:true,masterModeRelation:'not_applicable'}
  };
}
function schedule(phaseId,items){
  return {schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',requestId:`B114::SCHEDULE::${phaseId}`,phaseId,weekStart:'2026-09-21',weeklyCapacityMinutes:600,items};
}
function readinessRequest(phaseId,focusTargetIds,items){
  return {schema:'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1',reportId:`B114::READINESS::${phaseId}::${focusTargetIds.join('+')}`,phaseId,focusTargetIds,scheduleRequest:schedule(phaseId,items),externalGates:[]};
}
function consumerRequest(readiness,overrides={}){
  return {
    schema:'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V1',
    consumerId:'SHADOW::HUMAN_REVIEW',
    consumerClass:'human_review_shadow',
    readinessRequest:readiness,
    ...overrides
  };
}
function event(sequence,evidenceType,payload,targetId,phaseId='GD2'){
  return {schema:'BAUMAN_ROADMAP_V2_EVIDENCE_EVENT_V1',eventId:`${targetId}-B114-${sequence}`,streamId:`B114::STREAM::${targetId}`,sequence,targetId,phaseId,evidenceType,occurredAt:'2026-09-19T00:00:00Z',source:{kind:'b114_fixture',ref:`${targetId}/${sequence}`},payload};
}
function fullEvidence(targetId,phaseId='GD2'){
  return [
    event(1,'chapter_assessment',{percent:85,criticalPercent:75},targetId,phaseId),
    event(2,'exercise_set',{percent:90,completedItems:20,totalItems:20},targetId,phaseId),
    event(3,'lab_or_simulation',{passed:true,explanationAccepted:true},targetId,phaseId),
    event(4,'project_rubric',{rubric:{correctness:3,clarity:3,verification:3,reproducibility:3}},targetId,phaseId),
    event(5,'retention_check',{percent:80,daysAfterLearning:14},targetId,phaseId)
  ];
}

assert.equal(consumer.contract.acceptance.result,'PASS_B113_CONTRACT');
assert.equal(consumer.contract.mode.productionIntegration,'disconnected');
assert.deepEqual(consumer.contract.candidatePolicy.productionConsumerIds,[]);
assert.equal(consumer.contract.candidatePolicy.planningBridgeAdmitted,false);
assert.equal(consumer.contract.candidatePolicy.safeShellAdmitted,false);
assert.equal(consumer.contract.candidatePolicy.subjectRuntimeAdmitted,false);

// Red -> shadow review blocked.
{
  const out=consumer.projectShadowConsumer(consumerRequest(readinessRequest('GD2',['RU-R0-C01'],[])));
  assert.equal(out.readinessColor,'red');
  assert.equal(out.advisoryState,'blocked');
  assert.equal(out.consumerDecision,'shadow_review_blocked');
  assert.equal(out.runtimeActionAuthorized,false);
}

// Yellow -> shadow review caution.
{
  const s=snapshot('RU-R0-C01','dang_hoc');
  const out=consumer.projectShadowConsumer(consumerRequest(readinessRequest('GD2',['RU-R0-C01'],[
    item('RU-PROGRESS',s,{technicalTrack:null,activityKind:'russian_foundation'})
  ])));
  assert.equal(out.readinessColor,'yellow');
  assert.equal(out.advisoryState,'caution');
  assert.equal(out.consumerDecision,'shadow_review_caution');
}

// Green -> human review only, never execution.
{
  const complete=consumer.admission.readiness.mastery.reduceEvidenceStream(fullEvidence('RU-R0-C01'));
  const out=consumer.projectShadowConsumer(consumerRequest(readinessRequest('GD2',['RU-R0-C01'],[
    item('RU-MASTER',complete,{technicalTrack:null,activityKind:'russian_foundation'})
  ])));
  assert.equal(out.readinessColor,'green');
  assert.equal(out.advisoryState,'ready_for_human_review');
  assert.equal(out.consumerDecision,'shadow_review_ready_for_human_review');
  assert.equal(out.productionConsumerConnected,false);
  assert.equal(out.runtimeActionAuthorized,false);
  assert.equal(out.scheduleWriteAllowed,false);
  assert.equal(out.notificationWriteAllowed,false);
}

// Deterministic, deeply frozen and input-preserving.
{
  const s=snapshot('RU-R0-C01','dang_hoc');
  const input=consumerRequest(readinessRequest('GD2',['RU-R0-C01'],[
    item('DETERMINISTIC',s,{technicalTrack:null,activityKind:'russian_foundation'})
  ]));
  const before=structuredClone(input);
  const a=consumer.projectShadowConsumer(input);
  const b=consumer.projectShadowConsumer(input);
  assert.deepEqual(input,before);
  assert.deepEqual(a,b);
  assert(Object.isFrozen(a));
  assert.equal(a.persisted,false);
  assert.throws(()=>{a.consumerDecision='shadow_review_ready_for_human_review';},TypeError);
}

// Request envelope is fail-closed against forged authority and production consumers.
{
  const base=readinessRequest('GD2',['RU-R0-C01'],[]);
  for(const forged of [
    consumerRequest(base,{consumerId:'PLANNING_BRIDGE'}),
    consumerRequest(base,{consumerClass:'planning_bridge'}),
    consumerRequest(base,{admissionResult:{advisoryState:'ready_for_human_review'}}),
    consumerRequest(base,{consumerDecision:'shadow_review_ready_for_human_review'}),
    consumerRequest(base,{persisted:true})
  ]){
    assert.throws(()=>consumer.projectShadowConsumer(forged));
  }
}

// Harness is test-only and side-effect free.
{
  const source=fs.readFileSync('scripts/roadmap-v2-consumer-admission-harness.mjs','utf8');
  for(const forbidden of [/writeFileSync\s*\(/,/appendFileSync\s*\(/,/writeFile\s*\(/,/localStorage/,/sessionStorage/,/fetch\s*\(/,/XMLHttpRequest/,/child_process/,/spawn\s*\(/,/exec\s*\(/]){
    assert.doesNotMatch(source,forbidden,`Consumer Admission harness gained forbidden side effect: ${forbidden}`);
  }
  function walk(dir){return fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.posix.join(dir,e.name);return e.isDirectory()?walk(p):[p];}):[];}
  for(const file of [...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p))){
    const text=fs.readFileSync(file,'utf8');
    assert.equal(text.includes('roadmap-v2-consumer-admission-harness.mjs'),false,`Consumer Admission harness wired into runtime: ${file}`);
    assert.equal(text.includes('loadCurrentConsumerAdmissionHarness'),false,`Consumer Admission activation leaked into runtime: ${file}`);
  }
}

console.log('ROADMAP_V2_L29_B114_SHADOW_ADAPTER=PASS');
console.log(JSON.stringify({
  red:'shadow_review_blocked',
  yellow:'shadow_review_caution',
  green:'shadow_review_ready_for_human_review',
  deterministic:true,
  deepFrozen:true,
  productionConsumers:0,
  persistence:false,
  dashboardUi:false,
  scheduleWrite:false,
  calendarWrite:false,
  runtimeActivation:false,
  notificationWrite:false,
  automaticAction:false
},null,2));
