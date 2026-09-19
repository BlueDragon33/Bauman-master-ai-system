import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {loadCurrentAdmissionHarness} from './roadmap-v2-admission-harness.mjs';

const admission=loadCurrentAdmissionHarness();
const satisfying=new Set(admission.readiness.mastery.contract.prerequisiteGate.satisfyingStates);

function snapshot(targetId,state,phaseId='GD2',options={}){
  return {
    schema:'BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1',
    streamId:options.streamId||`B110::${phaseId}::${targetId}`,
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
      candidateId:`B110::CANDIDATE::${id}`,
      targetId:snap.targetId,phaseId:snap.phaseId,
      masterRelevance:0.8,masterRelevanceSource:'L28/B110 advisory fixture',
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
  return {schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',requestId:`B110::SCHEDULE::${phaseId}`,phaseId,weekStart:'2026-09-21',weeklyCapacityMinutes:600,items};
}
function request(phaseId,focusTargetIds,items){
  return {schema:'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1',reportId:`B110::READINESS::${phaseId}::${focusTargetIds.join('+')}`,phaseId,focusTargetIds,scheduleRequest:schedule(phaseId,items),externalGates:[]};
}
function event(sequence,evidenceType,payload,targetId,phaseId='GD2'){
  return {schema:'BAUMAN_ROADMAP_V2_EVIDENCE_EVENT_V1',eventId:`${targetId}-B110-${sequence}`,streamId:`B110::STREAM::${targetId}`,sequence,targetId,phaseId,evidenceType,occurredAt:'2026-09-19T00:00:00Z',source:{kind:'b110_fixture',ref:`${targetId}/${sequence}`},payload};
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

assert.equal(admission.contract.acceptance.result,'PASS_B109_CONTRACT');
assert.equal(admission.contract.mode.productionIntegration,'disconnected');
assert.equal(admission.contract.consumerPolicy.planningBridgeAdmitted,false);
assert.equal(admission.contract.consumerPolicy.safeShellAdmitted,false);

// Red -> blocked advisory.
{
  const out=admission.projectAdvisory(request('GD2',['RU-R0-C01'],[]));
  assert.equal(out.readinessColor,'red');
  assert.equal(out.advisoryState,'blocked');
  assert.equal(out.runtimeActionAuthorized,false);
}

// Yellow -> caution advisory.
{
  const s=snapshot('RU-R0-C01','dang_hoc');
  const out=admission.projectAdvisory(request('GD2',['RU-R0-C01'],[
    item('RU-PROGRESS',s,{technicalTrack:null,activityKind:'russian_foundation'})
  ]));
  assert.equal(out.readinessColor,'yellow');
  assert.equal(out.advisoryState,'caution');
  assert.equal(out.runtimeActionAuthorized,false);
}

// Green -> human review only; never action authorization.
{
  const complete=admission.readiness.mastery.reduceEvidenceStream(fullEvidence('RU-R0-C01'));
  const out=admission.projectAdvisory(request('GD2',['RU-R0-C01'],[
    item('RU-MASTER',complete,{technicalTrack:null,activityKind:'russian_foundation'})
  ]));
  assert.equal(out.readinessColor,'green');
  assert.equal(out.advisoryState,'ready_for_human_review');
  assert.equal(out.runtimeActionAuthorized,false);
  assert.equal(out.scheduleWriteAllowed,false);
  assert.equal(out.notificationWriteAllowed,false);
}

// Projection is deterministic, deeply frozen and does not mutate input.
{
  const s=snapshot('RU-R0-C01','dang_hoc');
  const input=request('GD2',['RU-R0-C01'],[item('DETERMINISTIC',s,{technicalTrack:null,activityKind:'russian_foundation'})]);
  const before=structuredClone(input);
  const a=admission.projectAdvisory(input),b=admission.projectAdvisory(input);
  assert.deepEqual(input,before);
  assert.deepEqual(a,b);
  assert(Object.isFrozen(a)&&Object.isFrozen(a.targetSummaries)&&Object.isFrozen(a.targetSummaries[0]));
  assert.equal(a.persisted,false);
  assert.equal(a.productionConsumerConnected,false);
  assert.throws(()=>{a.advisoryState='ready_for_human_review';},TypeError);
}

// Caller cannot inject a Readiness result/color into the request.
{
  const bad=request('GD2',['RU-R0-C01'],[]);
  bad.readinessResult={overallColor:'green'};
  assert.throws(()=>admission.projectAdvisory(bad),/unsupported fields/);
  const badColor=request('GD2',['RU-R0-C01'],[]);
  badColor.overallColor='green';
  assert.throws(()=>admission.projectAdvisory(badColor),/unsupported fields/);
}

// Harness remains test-only and side-effect free.
{
  const source=fs.readFileSync('scripts/roadmap-v2-admission-harness.mjs','utf8');
  for(const forbidden of [/writeFileSync\s*\(/,/appendFileSync\s*\(/,/writeFile\s*\(/,/localStorage/,/sessionStorage/,/fetch\s*\(/,/XMLHttpRequest/,/child_process/,/spawn\s*\(/,/exec\s*\(/]){
    assert.doesNotMatch(source,forbidden,`Admission harness gained forbidden side effect: ${forbidden}`);
  }
  function walk(dir){return fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.posix.join(dir,e.name);return e.isDirectory()?walk(p):[p];}):[];}
  for(const file of [...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p))){
    const text=fs.readFileSync(file,'utf8');
    assert.equal(text.includes('roadmap-v2-admission-harness.mjs'),false,`Admission harness wired into runtime: ${file}`);
    assert.equal(text.includes('loadCurrentAdmissionHarness'),false,`Admission activation leaked into runtime: ${file}`);
  }
}

console.log('ROADMAP_V2_L28_B110_ADVISORY_PROJECTOR=PASS');
console.log(JSON.stringify({
  red:'blocked',
  yellow:'caution',
  green:'ready_for_human_review',
  automaticAction:false,
  deterministic:true,
  deepFrozen:true,
  productionConsumer:false,
  persistence:false,
  dashboardUi:false,
  scheduleWrite:false,
  calendarWrite:false,
  runtimeActivation:false,
  notificationWrite:false
},null,2));
