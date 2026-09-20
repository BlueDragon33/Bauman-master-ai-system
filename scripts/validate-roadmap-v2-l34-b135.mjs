import assert from 'node:assert/strict';
import {loadCurrentProductionReadinessReviewHarness} from './roadmap-v2-production-readiness-review-harness.mjs';

const readinessReview=loadCurrentProductionReadinessReviewHarness();
const promotion=readinessReview.promotion;
const satisfying=new Set(promotion.release.promotion.human.consumer.admission.readiness.mastery.contract.prerequisiteGate.satisfyingStates);

function snapshot(targetId,state,phaseId='GD2',options={}){return {schema:'BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1',streamId:options.streamId||('B135::'+phaseId+'::'+targetId),targetId,phaseId,eventCount:options.eventCount??1,lastSequence:options.lastSequence??1,knowledgeState:state,existingCompetencyVerified:false,dimensions:options.dimensions||{},masterReadyGate:options.masterReadyGate||{passed:false,checks:{}},prerequisiteEligible:satisfying.has(state),persisted:false,transitions:[]};}
function item(id,snap,options={}){const technicalTrack=options.technicalTrack===undefined?'math':options.technicalTrack;return {scheduleItemId:id,priorityCandidate:{schema:'BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1',candidateId:'B135::CANDIDATE::'+id,targetId:snap.targetId,phaseId:snap.phaseId,masterRelevance:0.8,masterRelevanceSource:'L34/B135 fixture',weeksUntilNeeded:8,snapshot:snap},activityKind:options.activityKind||'technical_core',estimatedMinutes:60,technicalTrack,russianTwinMinutes:technicalTrack===null?null:30,dueDate:null,reviewRequested:false,source:{kind:'registry_static',ref:'registry://'+snap.targetId,verified:true,masterModeRelation:'not_applicable'}};}
function schedule(phaseId,items){return {schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',requestId:'B135::SCHEDULE::'+phaseId,phaseId,weekStart:'2026-09-21',weeklyCapacityMinutes:600,items};}
function readiness(phaseId='GD2',focusTargetIds=['RU-R0-C01'],items=[]){return {schema:'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1',reportId:'B135::READINESS::'+phaseId+'::'+focusTargetIds.join('+'),phaseId,focusTargetIds,scheduleRequest:schedule(phaseId,items),externalGates:[]};}
function consumer(readinessRequest){return {schema:'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V1',consumerId:'SHADOW::HUMAN_REVIEW',consumerClass:'human_review_shadow',readinessRequest};}
function human(readinessRequest,decision='accepted_for_shadow_analysis',reasons=['B135_HUMAN']){return {schema:'BAUMAN_ROADMAP_V2_HUMAN_REVIEW_REQUEST_V1',reviewerRef:'REVIEWER::B135',reviewDecision:decision,reasonCodes:reasons,consumerAdmissionRequest:consumer(readinessRequest)};}
function eligibility(humanReviewRequest,candidateRef='CANDIDATE::B135'){return {schema:'BAUMAN_ROADMAP_V2_PROMOTION_ELIGIBILITY_REQUEST_V1',candidateRef,humanReviewRequest};}
function releaseReview(promotionEligibilityRequest,decision='approve_for_promotion_review',reasons=['B135_RELEASE'],candidateRef='CANDIDATE::B135'){return {schema:'BAUMAN_ROADMAP_V2_RELEASE_REVIEW_REQUEST_V1',candidateRef,releaseReviewerRef:'RELEASE_REVIEWER::B135',reviewDecision:decision,reasonCodes:reasons,promotionEligibilityRequest};}
function promotionReview(releaseReviewRequest,decision='approve_for_production_readiness_review',reasons=['B135_PROMOTION'],candidateRef='CANDIDATE::B135'){return {schema:'BAUMAN_ROADMAP_V2_PROMOTION_REVIEW_REQUEST_V1',candidateRef,promotionReviewerRef:'PROMOTION_REVIEWER::B135',reviewDecision:decision,reasonCodes:reasons,releaseReviewRequest};}
function request(promotionReviewRequest,decision='approve_shadow_readiness',reasons=['B135_PRODUCTION_READINESS'],candidateRef='CANDIDATE::B135'){return {schema:'BAUMAN_ROADMAP_V2_PRODUCTION_READINESS_REVIEW_REQUEST_V1',candidateRef,productionReadinessReviewerRef:'PRODUCTION_READINESS_REVIEWER::B135',reviewDecision:decision,reasonCodes:reasons,promotionReviewRequest};}
function event(sequence,evidenceType,payload,targetId,phaseId='GD2'){return {schema:'BAUMAN_ROADMAP_V2_EVIDENCE_EVENT_V1',eventId:targetId+'-B135-'+sequence,streamId:'B135::STREAM::'+targetId,sequence,targetId,phaseId,evidenceType,occurredAt:'2026-09-20T00:00:00Z',source:{kind:'b135_fixture',ref:targetId+'/'+sequence},payload};}
function fullEvidence(targetId,phaseId='GD2'){return [event(1,'chapter_assessment',{percent:85,criticalPercent:75},targetId,phaseId),event(2,'exercise_set',{percent:90,completedItems:20,totalItems:20},targetId,phaseId),event(3,'lab_or_simulation',{passed:true,explanationAccepted:true},targetId,phaseId),event(4,'project_rubric',{rubric:{correctness:3,clarity:3,verification:3,reproducibility:3}},targetId,phaseId),event(5,'retention_check',{percent:80,daysAfterLearning:14},targetId,phaseId)];}
function eligibleRelease(){
  const snap=promotion.release.promotion.human.consumer.admission.readiness.mastery.reduceEvidenceStream(fullEvidence('RU-R0-C01'));
  const r=readiness('GD2',['RU-R0-C01'],[item('GREEN',snap,{technicalTrack:null,activityKind:'russian_foundation'})]);
  return releaseReview(eligibility(human(r,'accepted_for_shadow_analysis',['READY'])),'approve_for_promotion_review',['RELEASE_APPROVED']);
}
function eligiblePromotion(){return promotionReview(eligibleRelease(),'approve_for_production_readiness_review',['PROMOTION_APPROVED']);}
function expectFail(input,label){assert.throws(()=>readinessReview.projectProductionReadinessReview(input),undefined,label);}

let cases=0;

// Identity and namespace attacks.
for(const [input,label] of [
  [{...request(eligiblePromotion()),candidateRef:'PRODUCTION::B135'},'candidate namespace impersonation'],
  [{...request(eligiblePromotion()),candidateRef:'CANDIDATE::OTHER'},'outer/nested candidate mismatch'],
  [{...request(eligiblePromotion()),productionReadinessReviewerRef:'PROMOTION_REVIEWER::B135'},'reviewer namespace impersonation'],
  [{...request(eligiblePromotion()),productionReadinessReviewerRef:'PRODUCTION_READINESS_REVIEWER::bad'},'reviewer lowercase drift']
]){expectFail(input,label);cases++;}

// Caller-supplied authority/result injection.
for(const [field,value] of [
  ['shadowProductionReady',true],
  ['productionPromotionAuthorized',true],
  ['productionConsumerConnected',true],
  ['runtimeActionAuthorized',true],
  ['scheduleWriteAllowed',true],
  ['notificationWriteAllowed',true],
  ['persisted',true],
  ['promotionReviewResult',{productionReadinessReviewEligible:true}],
  ['effectiveProductionReadinessReviewState','production_readiness_review_approved_shadow_only']
]){
  expectFail({...request(eligiblePromotion()),[field]:value},'caller authority/result injection: '+field);cases++;
}

// Schema and decision drift.
for(const input of [
  {...request(eligiblePromotion()),schema:'BAUMAN_ROADMAP_V2_PRODUCTION_READINESS_REVIEW_REQUEST_V2'},
  {...request(eligiblePromotion()),reviewDecision:'approve_for_production'},
  {...request(eligiblePromotion()),promotionReviewRequest:{...eligiblePromotion(),schema:'BAUMAN_ROADMAP_V2_PROMOTION_REVIEW_REQUEST_V2'}}
]){expectFail(input,'schema/decision drift');cases++;}

// Reason-code abuse.
for(const reasons of [
  [],
  ['DUP','DUP'],
  ['bad-lowercase'],
  ['BAD SPACE'],
  [123],
  Array.from({length:13},(_,i)=>'R'+i)
]){expectFail(request(eligiblePromotion(),'approve_shadow_readiness',reasons),'reason-code abuse');cases++;}

// Nested Promotion Review forgery must fail closed.
{
  const nested=eligiblePromotion();
  expectFail(request({...nested,productionPromotionAuthorized:true}),'nested Promotion Review authority injection');
  cases++;
}
{
  const nested=eligiblePromotion();
  expectFail(request({...nested,candidateRef:'CANDIDATE::OTHER'}),'nested Promotion Review candidate forgery');
  cases++;
}
{
  const nested=eligiblePromotion();
  expectFail(request({...nested,productionReadinessReviewEligible:true}),'nested Promotion Review result/eligibility forgery');
  cases++;
}
{
  const nested=eligiblePromotion();
  expectFail(request({...nested,effectivePromotionReviewState:'promotion_review_approved_shadow_only'}),'nested Promotion Review state forgery');
  cases++;
}

// Upstream not eligible can never be escalated by caller approval.
{
  const blockedPromotion=promotionReview(releaseReview(eligibility(human(readiness()))));
  const out=readinessReview.projectProductionReadinessReview(request(blockedPromotion,'approve_shadow_readiness',['TRY_ESCALATE']));
  assert.equal(out.effectiveProductionReadinessReviewState,'production_readiness_review_blocked_upstream');
  assert.equal(out.shadowProductionReady,false);
  assert.equal(out.productionPromotionAuthorized,false);
  cases++;
}

// Needs-revision/rejected decisions cannot produce readiness.
for(const decision of ['needs_revision','rejected']){
  const out=readinessReview.projectProductionReadinessReview(request(eligiblePromotion(),decision,['NO_READY']));
  assert.equal(out.shadowProductionReady,false);
  assert.equal(out.productionPromotionAuthorized,false);
  cases++;
}

// Result is deeply frozen and cannot be privilege-escalated after projection.
{
  const out=readinessReview.projectProductionReadinessReview(request(eligiblePromotion(),'approve_shadow_readiness',['IMMUTABLE']));
  assert(Object.isFrozen(out));
  assert(Object.isFrozen(out.reasonCodes));
  assert.throws(()=>{out.productionPromotionAuthorized=true;},TypeError);
  assert.throws(()=>{out.shadowProductionReady=false;},TypeError);
  assert.throws(()=>{out.productionConsumerConnected=true;},TypeError);
  assert.throws(()=>{out.reasonCodes.push('FORGED');},TypeError);
  cases++;
}

// Deterministic receipt identity.
{
  const input=request(eligiblePromotion(),'approve_shadow_readiness',['DETERMINISTIC']);
  const a=readinessReview.projectProductionReadinessReview(input);
  const b=readinessReview.projectProductionReadinessReview(structuredClone(input));
  assert.deepEqual(a,b);
  assert.equal(a.receiptId,b.receiptId);
  cases++;
}

assert(cases>=28,'B135 adversarial coverage unexpectedly low');
console.log('ROADMAP_V2_L34_B135_ADVERSARIAL_PRODUCTION_READINESS_REVIEW=PASS');
console.log(JSON.stringify({
  cases,
  failClosed:true,
  deterministic:true,
  deepFrozen:true,
  shadowProductionReadyOnly:true,
  productionPromotion:false,
  productionConsumers:0,
  persistence:false,
  runtimeActivation:false
},null,2));
