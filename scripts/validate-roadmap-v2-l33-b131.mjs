import assert from 'node:assert/strict';
import {loadCurrentPromotionReviewHarness} from './roadmap-v2-promotion-review-harness.mjs';

const promotion=loadCurrentPromotionReviewHarness();
const satisfying=new Set(promotion.release.promotion.human.consumer.admission.readiness.mastery.contract.prerequisiteGate.satisfyingStates);

function snapshot(targetId,state,phaseId='GD2',options={}){return {schema:'BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1',streamId:options.streamId||('B131::'+phaseId+'::'+targetId),targetId,phaseId,eventCount:options.eventCount??1,lastSequence:options.lastSequence??1,knowledgeState:state,existingCompetencyVerified:false,dimensions:options.dimensions||{},masterReadyGate:options.masterReadyGate||{passed:false,checks:{}},prerequisiteEligible:satisfying.has(state),persisted:false,transitions:[]};}
function item(id,snap,options={}){const technicalTrack=options.technicalTrack===undefined?'math':options.technicalTrack;return {scheduleItemId:id,priorityCandidate:{schema:'BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1',candidateId:'B131::CANDIDATE::'+id,targetId:snap.targetId,phaseId:snap.phaseId,masterRelevance:0.8,masterRelevanceSource:'L33/B131 fixture',weeksUntilNeeded:8,snapshot:snap},activityKind:options.activityKind||'technical_core',estimatedMinutes:60,technicalTrack,russianTwinMinutes:technicalTrack===null?null:30,dueDate:null,reviewRequested:false,source:{kind:'registry_static',ref:'registry://'+snap.targetId,verified:true,masterModeRelation:'not_applicable'}};}
function schedule(phaseId,items){return {schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',requestId:'B131::SCHEDULE::'+phaseId,phaseId,weekStart:'2026-09-21',weeklyCapacityMinutes:600,items};}
function readiness(phaseId='GD2',focusTargetIds=['RU-R0-C01'],items=[]){return {schema:'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1',reportId:'B131::READINESS::'+phaseId+'::'+focusTargetIds.join('+'),phaseId,focusTargetIds,scheduleRequest:schedule(phaseId,items),externalGates:[]};}
function consumer(readinessRequest){return {schema:'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V1',consumerId:'SHADOW::HUMAN_REVIEW',consumerClass:'human_review_shadow',readinessRequest};}
function human(readinessRequest,decision='accepted_for_shadow_analysis',reasons=['B131_HUMAN']){return {schema:'BAUMAN_ROADMAP_V2_HUMAN_REVIEW_REQUEST_V1',reviewerRef:'REVIEWER::B131',reviewDecision:decision,reasonCodes:reasons,consumerAdmissionRequest:consumer(readinessRequest)};}
function eligibility(humanReviewRequest,candidateRef='CANDIDATE::B131'){return {schema:'BAUMAN_ROADMAP_V2_PROMOTION_ELIGIBILITY_REQUEST_V1',candidateRef,humanReviewRequest};}
function releaseReview(promotionEligibilityRequest,decision='approve_for_promotion_review',reasons=['B131_RELEASE'],candidateRef='CANDIDATE::B131'){return {schema:'BAUMAN_ROADMAP_V2_RELEASE_REVIEW_REQUEST_V1',candidateRef,releaseReviewerRef:'RELEASE_REVIEWER::B131',reviewDecision:decision,reasonCodes:reasons,promotionEligibilityRequest};}
function request(releaseReviewRequest,decision='approve_for_production_readiness_review',reasons=['B131_PROMOTION'],candidateRef='CANDIDATE::B131'){return {schema:'BAUMAN_ROADMAP_V2_PROMOTION_REVIEW_REQUEST_V1',candidateRef,promotionReviewerRef:'PROMOTION_REVIEWER::B131',reviewDecision:decision,reasonCodes:reasons,releaseReviewRequest};}
function event(sequence,evidenceType,payload,targetId,phaseId='GD2'){return {schema:'BAUMAN_ROADMAP_V2_EVIDENCE_EVENT_V1',eventId:targetId+'-B131-'+sequence,streamId:'B131::STREAM::'+targetId,sequence,targetId,phaseId,evidenceType,occurredAt:'2026-09-20T00:00:00Z',source:{kind:'b131_fixture',ref:targetId+'/'+sequence},payload};}
function fullEvidence(targetId,phaseId='GD2'){return [event(1,'chapter_assessment',{percent:85,criticalPercent:75},targetId,phaseId),event(2,'exercise_set',{percent:90,completedItems:20,totalItems:20},targetId,phaseId),event(3,'lab_or_simulation',{passed:true,explanationAccepted:true},targetId,phaseId),event(4,'project_rubric',{rubric:{correctness:3,clarity:3,verification:3,reproducibility:3}},targetId,phaseId),event(5,'retention_check',{percent:80,daysAfterLearning:14},targetId,phaseId)];}
function eligibleRelease(){
  const snap=promotion.release.promotion.human.consumer.admission.readiness.mastery.reduceEvidenceStream(fullEvidence('RU-R0-C01'));
  const r=readiness('GD2',['RU-R0-C01'],[item('GREEN',snap,{technicalTrack:null,activityKind:'russian_foundation'})]);
  return releaseReview(eligibility(human(r,'accepted_for_shadow_analysis',['READY'])),'approve_for_promotion_review',['RELEASE_APPROVED']);
}
function expectFail(input,label){assert.throws(()=>promotion.projectPromotionReview(input),undefined,label);}

let cases=0;

// Identity and namespace attacks.
for(const [input,label] of [
  [{...request(eligibleRelease()),candidateRef:'PRODUCTION::B131'},'candidate namespace impersonation'],
  [{...request(eligibleRelease()),candidateRef:'CANDIDATE::OTHER'},'outer/nested candidate mismatch'],
  [{...request(eligibleRelease()),promotionReviewerRef:'RELEASE_REVIEWER::B131'},'reviewer namespace impersonation'],
  [{...request(eligibleRelease()),promotionReviewerRef:'PROMOTION_REVIEWER::bad'},'reviewer lowercase drift']
]){expectFail(input,label);cases++;}

// Caller-supplied authority/result injection.
for(const [field,value] of [
  ['productionReadinessReviewEligible',true],
  ['productionPromotionAuthorized',true],
  ['productionConsumerConnected',true],
  ['runtimeActionAuthorized',true],
  ['scheduleWriteAllowed',true],
  ['notificationWriteAllowed',true],
  ['persisted',true],
  ['releaseReviewResult',{promotionReviewEligible:true}],
  ['effectivePromotionReviewState','promotion_review_approved_shadow_only']
]){
  expectFail({...request(eligibleRelease()),[field]:value},'caller authority/result injection: '+field);cases++;
}

// Schema and decision drift.
for(const input of [
  {...request(eligibleRelease()),schema:'BAUMAN_ROADMAP_V2_PROMOTION_REVIEW_REQUEST_V2'},
  {...request(eligibleRelease()),reviewDecision:'approve_for_production'},
  {...request(eligibleRelease()),releaseReviewRequest:{...eligibleRelease(),schema:'BAUMAN_ROADMAP_V2_RELEASE_REVIEW_REQUEST_V2'}}
]){expectFail(input,'schema/decision drift');cases++;}

// Reason-code abuse.
for(const reasons of [
  [],
  ['DUP','DUP'],
  ['bad-lowercase'],
  ['BAD SPACE'],
  [123],
  Array.from({length:13},(_,i)=>'R'+i)
]){expectFail(request(eligibleRelease(),'approve_for_production_readiness_review',reasons),'reason-code abuse');cases++;}

// Nested Release Review forgery must fail closed.
{
  const nested=eligibleRelease();
  const forged={...nested,productionPromotionAuthorized:true};
  expectFail(request(forged),'nested Release Review authority injection');
  cases++;
}
{
  const nested=eligibleRelease();
  const forged={...nested,candidateRef:'CANDIDATE::OTHER'};
  expectFail(request(forged),'nested candidate forgery');
  cases++;
}
{
  const nested=eligibleRelease();
  const forged={...nested,promotionEligibilityRequest:{...nested.promotionEligibilityRequest,eligibilityState:'eligible_for_release_review'}};
  expectFail(request(forged),'nested Promotion Eligibility result forgery');
  cases++;
}

// Non-eligible upstream can never be escalated by caller approval.
{
  const blockedRelease=releaseReview(eligibility(human(readiness())));
  const out=promotion.projectPromotionReview(request(blockedRelease,'approve_for_production_readiness_review',['TRY_ESCALATE']));
  assert.equal(out.effectivePromotionReviewState,'promotion_review_blocked_upstream');
  assert.equal(out.productionReadinessReviewEligible,false);
  assert.equal(out.productionPromotionAuthorized,false);
  cases++;
}

// Result is deeply frozen and cannot be privilege-escalated after projection.
{
  const out=promotion.projectPromotionReview(request(eligibleRelease(),'approve_for_production_readiness_review',['IMMUTABLE']));
  assert(Object.isFrozen(out));
  assert(Object.isFrozen(out.reasonCodes));
  assert.throws(()=>{out.productionPromotionAuthorized=true;},TypeError);
  assert.throws(()=>{out.productionReadinessReviewEligible=false;},TypeError);
  assert.throws(()=>{out.reasonCodes.push('FORGED');},TypeError);
  cases++;
}

// Deterministic receipt identity.
{
  const input=request(eligibleRelease(),'approve_for_production_readiness_review',['DETERMINISTIC']);
  const a=promotion.projectPromotionReview(input);
  const b=promotion.projectPromotionReview(structuredClone(input));
  assert.deepEqual(a,b);
  assert.equal(a.receiptId,b.receiptId);
  cases++;
}

assert(cases>=25,'B131 adversarial coverage unexpectedly low');
console.log('ROADMAP_V2_L33_B131_ADVERSARIAL_PROMOTION_REVIEW=PASS');
console.log(JSON.stringify({cases,failClosed:true,deterministic:true,deepFrozen:true,productionReadinessReviewIntegration:'disconnected',productionPromotion:false,productionConsumers:0,persistence:false,runtimeActivation:false},null,2));
