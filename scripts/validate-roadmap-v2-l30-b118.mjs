import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {loadCurrentHumanReviewHarness} from './roadmap-v2-human-review-harness.mjs';

const review=loadCurrentHumanReviewHarness();
const satisfying=new Set(review.consumer.admission.readiness.mastery.contract.prerequisiteGate.satisfyingStates);

function snapshot(targetId,state,phaseId='GD2',options={}){
  return {
    schema:'BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1',
    streamId:options.streamId||('B118::'+phaseId+'::'+targetId),
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
      candidateId:'B118::CANDIDATE::'+id,
      targetId:snap.targetId,phaseId:snap.phaseId,
      masterRelevance:0.8,masterRelevanceSource:'L30/B118 human review fixture',
      weeksUntilNeeded:8,snapshot:snap
    },
    activityKind:options.activityKind||'technical_core',
    estimatedMinutes:60,technicalTrack,
    russianTwinMinutes:technicalTrack===null?null:30,
    dueDate:null,reviewRequested:false,
    source:{kind:'registry_static',ref:'registry://'+snap.targetId,verified:true,masterModeRelation:'not_applicable'}
  };
}
function schedule(phaseId,items){
  return {schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',requestId:'B118::SCHEDULE::'+phaseId,phaseId,weekStart:'2026-09-21',weeklyCapacityMinutes:600,items};
}
function readinessRequest(phaseId,focusTargetIds,items){
  return {schema:'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1',reportId:'B118::READINESS::'+phaseId+'::'+focusTargetIds.join('+'),phaseId,focusTargetIds,scheduleRequest:schedule(phaseId,items),externalGates:[]};
}
function consumerRequest(readiness){
  return {schema:'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V1',consumerId:'SHADOW::HUMAN_REVIEW',consumerClass:'human_review_shadow',readinessRequest:readiness};
}
function humanRequest(readiness,decision='accepted_for_shadow_analysis',reasons=['B118_REVIEW']){
  return {schema:'BAUMAN_ROADMAP_V2_HUMAN_REVIEW_REQUEST_V1',reviewerRef:'REVIEWER::B118',reviewDecision:decision,reasonCodes:reasons,consumerAdmissionRequest:consumerRequest(readiness)};
}
function event(sequence,evidenceType,payload,targetId,phaseId='GD2'){
  return {schema:'BAUMAN_ROADMAP_V2_EVIDENCE_EVENT_V1',eventId:targetId+'-B118-'+sequence,streamId:'B118::STREAM::'+targetId,sequence,targetId,phaseId,evidenceType,occurredAt:'2026-09-19T00:00:00Z',source:{kind:'b118_fixture',ref:targetId+'/'+sequence},payload};
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

assert.equal(review.contract.acceptance.result,'PASS_B117_CONTRACT');
assert.equal(review.contract.mode.productionIntegration,'disconnected');
assert.equal(review.contract.mode.productionPromotionEnabled,false);

// Red upstream + acceptance request -> blocked upstream, never promoted.
{
  const out=review.projectHumanReview(humanRequest(readinessRequest('GD2',['RU-R0-C01'],[])));
  assert.equal(out.sourceReadinessColor,'red');
  assert.equal(out.sourceConsumerDecision,'shadow_review_blocked');
  assert.equal(out.submittedReviewDecision,'accepted_for_shadow_analysis');
  assert.equal(out.effectiveReviewState,'review_blocked_upstream');
  assert.equal(out.productionPromotionAuthorized,false);
}

// Yellow upstream + acceptance request -> blocked upstream.
{
  const s=snapshot('RU-R0-C01','dang_hoc');
  const out=review.projectHumanReview(humanRequest(readinessRequest('GD2',['RU-R0-C01'],[
    item('RU-PROGRESS',s,{technicalTrack:null,activityKind:'russian_foundation'})
  ])));
  assert.equal(out.sourceReadinessColor,'yellow');
  assert.equal(out.sourceConsumerDecision,'shadow_review_caution');
  assert.equal(out.effectiveReviewState,'review_blocked_upstream');
}

// Green upstream can be accepted for shadow analysis only.
{
  const complete=review.consumer.admission.readiness.mastery.reduceEvidenceStream(fullEvidence('RU-R0-C01'));
  const out=review.projectHumanReview(humanRequest(readinessRequest('GD2',['RU-R0-C01'],[
    item('RU-MASTER',complete,{technicalTrack:null,activityKind:'russian_foundation'})
  ]),'accepted_for_shadow_analysis',['UPSTREAM_READY','HUMAN_CHECK_COMPLETE']));
  assert.equal(out.sourceReadinessColor,'green');
  assert.equal(out.sourceConsumerDecision,'shadow_review_ready_for_human_review');
  assert.equal(out.effectiveReviewState,'review_accepted_shadow_only');
  assert.equal(out.productionPromotionAuthorized,false);
  assert.equal(out.productionConsumerConnected,false);
  assert.equal(out.runtimeActionAuthorized,false);
  assert.equal(out.scheduleWriteAllowed,false);
  assert.equal(out.notificationWriteAllowed,false);
}

// Explicit revision/rejection decisions remain non-authoritative.
{
  const red=readinessRequest('GD2',['RU-R0-C01'],[]);
  const revise=review.projectHumanReview(humanRequest(red,'needs_revision',['MISSING_EVIDENCE']));
  assert.equal(revise.effectiveReviewState,'review_needs_revision');
  const reject=review.projectHumanReview(humanRequest(red,'rejected',['POLICY_MISMATCH']));
  assert.equal(reject.effectiveReviewState,'review_rejected');
  assert.equal(revise.productionPromotionAuthorized,false);
  assert.equal(reject.productionPromotionAuthorized,false);
}

// Deterministic, deeply frozen and input-preserving.
{
  const s=snapshot('RU-R0-C01','dang_hoc');
  const input=humanRequest(readinessRequest('GD2',['RU-R0-C01'],[item('DETERMINISTIC',s,{technicalTrack:null,activityKind:'russian_foundation'})]),'needs_revision',['B118_DETERMINISTIC']);
  const before=structuredClone(input);
  const a=review.projectHumanReview(input),b=review.projectHumanReview(input);
  assert.deepEqual(input,before);
  assert.deepEqual(a,b);
  assert(Object.isFrozen(a));
  assert(Object.isFrozen(a.reasonCodes));
  assert.equal(a.persisted,false);
  assert.throws(()=>{a.productionPromotionAuthorized=true;},TypeError);
  assert.deepEqual(Object.keys(a).sort(),[
    'schema','receiptId','reviewerRef','consumerAdmissionProjectionId','reportId','phaseId','weekStart',
    'sourceReadinessColor','sourceConsumerDecision','submittedReviewDecision','effectiveReviewState','reasonCodes',
    'persisted','productionPromotionAuthorized','productionConsumerConnected','runtimeActionAuthorized','scheduleWriteAllowed','notificationWriteAllowed'
  ].sort());
}

// Outer request authority is fail-closed.
{
  const base=readinessRequest('GD2',['RU-R0-C01'],[]);
  const good=humanRequest(base);
  for(const forged of [
    {...good,schema:'BAUMAN_ROADMAP_V2_HUMAN_REVIEW_REQUEST_V0'},
    {...good,reviewerRef:'ADMIN'},
    {...good,reviewDecision:'promote_to_production'},
    {...good,reasonCodes:[]},
    {...good,reasonCodes:['DUP','DUP']},
    {...good,consumerAdmissionResult:{consumerDecision:'shadow_review_ready_for_human_review'}},
    {...good,productionPromotionAuthorized:true}
  ])assert.throws(()=>review.projectHumanReview(forged));
}

// Harness stays scripts-only and side-effect free.
{
  const source=fs.readFileSync('scripts/roadmap-v2-human-review-harness.mjs','utf8');
  for(const forbidden of [/writeFileSync\s*\(/,/appendFileSync\s*\(/,/writeFile\s*\(/,/localStorage/,/sessionStorage/,/fetch\s*\(/,/XMLHttpRequest/,/child_process/,/spawn\s*\(/,/exec\s*\(/]){
    assert.doesNotMatch(source,forbidden,'Human Review harness gained forbidden side effect: '+forbidden);
  }
  function walk(dir){return fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.posix.join(dir,e.name);return e.isDirectory()?walk(p):[p];}):[];}
  for(const file of [...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p))){
    const text=fs.readFileSync(file,'utf8');
    assert.equal(text.includes('roadmap-v2-human-review-harness.mjs'),false,'Human Review harness wired into runtime: '+file);
    assert.equal(text.includes('loadCurrentHumanReviewHarness'),false,'Human Review activation leaked into runtime: '+file);
  }
}

console.log('ROADMAP_V2_L30_B118_HUMAN_REVIEW_PROJECTOR=PASS');
console.log(JSON.stringify({
  redAcceptance:'review_blocked_upstream',
  yellowAcceptance:'review_blocked_upstream',
  greenAcceptance:'review_accepted_shadow_only',
  deterministic:true,deepFrozen:true,productionPromotion:false,productionConsumers:0,
  persistence:false,dashboardUi:false,scheduleWrite:false,calendarWrite:false,runtimeActivation:false,notificationWrite:false,automaticAction:false
},null,2));
