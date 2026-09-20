import assert from 'node:assert/strict';
import {loadCurrentProductionPromotionAuthorizationHarness} from './roadmap-v2-production-promotion-authorization-harness.mjs';

const authorization=loadCurrentProductionPromotionAuthorizationHarness();
const readinessReview=authorization.readinessReview;
const promotion=readinessReview.promotion;
const satisfying=new Set(promotion.release.promotion.human.consumer.admission.readiness.mastery.contract.prerequisiteGate.satisfyingStates);

function snapshot(targetId,state,phaseId='GD2'){return {schema:'BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1',streamId:'B139::'+phaseId+'::'+targetId,targetId,phaseId,eventCount:1,lastSequence:1,knowledgeState:state,existingCompetencyVerified:false,dimensions:{},masterReadyGate:{passed:false,checks:{}},prerequisiteEligible:satisfying.has(state),persisted:false,transitions:[]};}
function item(id,snap,technicalTrack='math',activityKind='technical_core'){return {scheduleItemId:id,priorityCandidate:{schema:'BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1',candidateId:'B139::CANDIDATE::'+id,targetId:snap.targetId,phaseId:snap.phaseId,masterRelevance:0.8,masterRelevanceSource:'L35/B139 fixture',weeksUntilNeeded:8,snapshot:snap},activityKind,estimatedMinutes:60,technicalTrack,russianTwinMinutes:technicalTrack===null?null:30,dueDate:null,reviewRequested:false,source:{kind:'registry_static',ref:'registry://'+snap.targetId,verified:true,masterModeRelation:'not_applicable'}};}
function schedule(phaseId,items){return {schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',requestId:'B139::SCHEDULE::'+phaseId,phaseId,weekStart:'2026-09-21',weeklyCapacityMinutes:600,items};}
function readiness(phaseId='GD2',focusTargetIds=['RU-R0-C01'],items=[]){return {schema:'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1',reportId:'B139::READINESS::'+phaseId+'::'+focusTargetIds.join('+'),phaseId,focusTargetIds,scheduleRequest:schedule(phaseId,items),externalGates:[]};}
function consumer(readinessRequest){return {schema:'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V1',consumerId:'SHADOW::HUMAN_REVIEW',consumerClass:'human_review_shadow',readinessRequest};}
function human(readinessRequest,decision='accepted_for_shadow_analysis',reasons=['B139_HUMAN']){return {schema:'BAUMAN_ROADMAP_V2_HUMAN_REVIEW_REQUEST_V1',reviewerRef:'REVIEWER::B139',reviewDecision:decision,reasonCodes:reasons,consumerAdmissionRequest:consumer(readinessRequest)};}
function eligibility(humanReviewRequest,candidateRef='CANDIDATE::B139'){return {schema:'BAUMAN_ROADMAP_V2_PROMOTION_ELIGIBILITY_REQUEST_V1',candidateRef,humanReviewRequest};}
function releaseReview(promotionEligibilityRequest,decision='approve_for_promotion_review',reasons=['B139_RELEASE'],candidateRef='CANDIDATE::B139'){return {schema:'BAUMAN_ROADMAP_V2_RELEASE_REVIEW_REQUEST_V1',candidateRef,releaseReviewerRef:'RELEASE_REVIEWER::B139',reviewDecision:decision,reasonCodes:reasons,promotionEligibilityRequest};}
function promotionReview(releaseReviewRequest,decision='approve_for_production_readiness_review',reasons=['B139_PROMOTION'],candidateRef='CANDIDATE::B139'){return {schema:'BAUMAN_ROADMAP_V2_PROMOTION_REVIEW_REQUEST_V1',candidateRef,promotionReviewerRef:'PROMOTION_REVIEWER::B139',reviewDecision:decision,reasonCodes:reasons,releaseReviewRequest};}
function productionReadiness(promotionReviewRequest,decision='approve_shadow_readiness',reasons=['B139_READINESS'],candidateRef='CANDIDATE::B139'){return {schema:'BAUMAN_ROADMAP_V2_PRODUCTION_READINESS_REVIEW_REQUEST_V1',candidateRef,productionReadinessReviewerRef:'PRODUCTION_READINESS_REVIEWER::B139',reviewDecision:decision,reasonCodes:reasons,promotionReviewRequest};}
function request(productionReadinessReviewRequest,decision='authorize_receipt_only',reasons=['B139_AUTHORIZATION'],candidateRef='CANDIDATE::B139'){return {schema:'BAUMAN_ROADMAP_V2_PRODUCTION_PROMOTION_AUTHORIZATION_REQUEST_V1',candidateRef,productionPromotionAuthorizerRef:'PRODUCTION_PROMOTION_AUTHORIZER::B139',authorizationDecision:decision,reasonCodes:reasons,productionReadinessReviewRequest};}
function event(sequence,evidenceType,payload,targetId,phaseId='GD2'){return {schema:'BAUMAN_ROADMAP_V2_EVIDENCE_EVENT_V1',eventId:targetId+'-B139-'+sequence,streamId:'B139::STREAM::'+targetId,sequence,targetId,phaseId,evidenceType,occurredAt:'2026-09-20T00:00:00Z',source:{kind:'b139_fixture',ref:targetId+'/'+sequence},payload};}
function fullEvidence(targetId,phaseId='GD2'){return [event(1,'chapter_assessment',{percent:85,criticalPercent:75},targetId,phaseId),event(2,'exercise_set',{percent:90,completedItems:20,totalItems:20},targetId,phaseId),event(3,'lab_or_simulation',{passed:true,explanationAccepted:true},targetId,phaseId),event(4,'project_rubric',{rubric:{correctness:3,clarity:3,verification:3,reproducibility:3}},targetId,phaseId),event(5,'retention_check',{percent:80,daysAfterLearning:14},targetId,phaseId)];}
function eligibleProductionReadiness(){
  const snap=promotion.release.promotion.human.consumer.admission.readiness.mastery.reduceEvidenceStream(fullEvidence('RU-R0-C01'));
  const r=readiness('GD2',['RU-R0-C01'],[item('GREEN',snap,null,'russian_foundation')]);
  return productionReadiness(
    promotionReview(
      releaseReview(
        eligibility(
          human(r,'accepted_for_shadow_analysis',['READY'])
        ),
        'approve_for_promotion_review',['RELEASE_APPROVED']
      ),
      'approve_for_production_readiness_review',['PROMOTION_APPROVED']
    ),
    'approve_shadow_readiness',['READINESS_APPROVED']
  );
}
function expectFail(input,label){assert.throws(()=>authorization.projectProductionPromotionAuthorization(input),undefined,label);}

let cases=0;

// Identity and namespace attacks.
for(const [input,label] of [
  [{...request(eligibleProductionReadiness()),candidateRef:'PRODUCTION::B139'},'candidate namespace impersonation'],
  [{...request(eligibleProductionReadiness()),candidateRef:'CANDIDATE::OTHER'},'outer/nested candidate mismatch'],
  [{...request(eligibleProductionReadiness()),productionPromotionAuthorizerRef:'PRODUCTION_READINESS_REVIEWER::B139'},'authorizer namespace impersonation'],
  [{...request(eligibleProductionReadiness()),productionPromotionAuthorizerRef:'PRODUCTION_PROMOTION_AUTHORIZER::bad'},'authorizer lowercase drift']
]){expectFail(input,label);cases++;}

// Caller-supplied authority/result injection.
for(const [field,value] of [
  ['authorizationReceiptGranted',true],
  ['shadowProductionReady',true],
  ['productionPromotionExecuted',true],
  ['deploymentExecuted',true],
  ['productionConsumerConnected',true],
  ['runtimeActionAuthorized',true],
  ['scheduleWriteAllowed',true],
  ['notificationWriteAllowed',true],
  ['persisted',true],
  ['productionReadinessReviewResult',{shadowProductionReady:true}],
  ['effectiveProductionPromotionAuthorizationState','production_promotion_authorization_receipt_granted']
]){
  expectFail({...request(eligibleProductionReadiness()),[field]:value},'caller authority/result injection: '+field);cases++;
}

// Schema and decision drift.
for(const input of [
  {...request(eligibleProductionReadiness()),schema:'BAUMAN_ROADMAP_V2_PRODUCTION_PROMOTION_AUTHORIZATION_REQUEST_V2'},
  {...request(eligibleProductionReadiness()),authorizationDecision:'execute_production_promotion'},
  {...request(eligibleProductionReadiness()),productionReadinessReviewRequest:{...eligibleProductionReadiness(),schema:'BAUMAN_ROADMAP_V2_PRODUCTION_READINESS_REVIEW_REQUEST_V2'}}
]){expectFail(input,'schema/decision drift');cases++;}

// Reason-code abuse.
for(const reasons of [
  [],
  ['DUP','DUP'],
  ['bad-lowercase'],
  ['BAD SPACE'],
  [123],
  Array.from({length:13},(_,i)=>'R'+i)
]){expectFail(request(eligibleProductionReadiness(),'authorize_receipt_only',reasons),'reason-code abuse');cases++;}

// Nested Production Readiness Review forgery must fail closed.
{
  const nested=eligibleProductionReadiness();
  expectFail(request({...nested,productionPromotionAuthorized:true}),'nested readiness promotion authority injection');
  cases++;
}
{
  const nested=eligibleProductionReadiness();
  expectFail(request({...nested,candidateRef:'CANDIDATE::OTHER'}),'nested readiness candidate forgery');
  cases++;
}
{
  const nested=eligibleProductionReadiness();
  expectFail(request({...nested,shadowProductionReady:true}),'nested readiness result injection');
  cases++;
}
{
  const nested=eligibleProductionReadiness();
  expectFail(request({...nested,effectiveProductionReadinessReviewState:'production_readiness_review_approved_shadow_only'}),'nested readiness state forgery');
  cases++;
}

// Upstream not ready can never be escalated by caller authorization.
{
  const blocked=productionReadiness(promotionReview(releaseReview(eligibility(human(readiness())))));
  const out=authorization.projectProductionPromotionAuthorization(request(blocked,'authorize_receipt_only',['TRY_ESCALATE']));
  assert.equal(out.effectiveProductionPromotionAuthorizationState,'production_promotion_authorization_blocked_upstream');
  assert.equal(out.authorizationReceiptGranted,false);
  assert.equal(out.productionPromotionExecuted,false);
  assert.equal(out.deploymentExecuted,false);
  cases++;
}

// Needs-revision/rejected decisions cannot grant a receipt.
for(const decision of ['needs_revision','rejected']){
  const out=authorization.projectProductionPromotionAuthorization(request(eligibleProductionReadiness(),decision,['NO_AUTHORIZATION']));
  assert.equal(out.authorizationReceiptGranted,false);
  assert.equal(out.productionPromotionExecuted,false);
  assert.equal(out.deploymentExecuted,false);
  cases++;
}

// Receipt grant remains non-executing.
{
  const out=authorization.projectProductionPromotionAuthorization(request(eligibleProductionReadiness(),'authorize_receipt_only',['RECEIPT_ONLY']));
  assert.equal(out.authorizationReceiptGranted,true);
  assert.equal(out.authorizationScope,'receipt_only_no_execution');
  assert.equal(out.productionPromotionExecuted,false);
  assert.equal(out.deploymentExecuted,false);
  assert.equal(out.productionConsumerConnected,false);
  assert.equal(out.runtimeActionAuthorized,false);
  cases++;
}

// Result is deeply frozen and cannot be privilege-escalated after projection.
{
  const out=authorization.projectProductionPromotionAuthorization(request(eligibleProductionReadiness(),'authorize_receipt_only',['IMMUTABLE']));
  assert(Object.isFrozen(out));
  assert(Object.isFrozen(out.reasonCodes));
  assert.throws(()=>{out.productionPromotionExecuted=true;},TypeError);
  assert.throws(()=>{out.deploymentExecuted=true;},TypeError);
  assert.throws(()=>{out.authorizationScope='execute';},TypeError);
  assert.throws(()=>{out.productionConsumerConnected=true;},TypeError);
  assert.throws(()=>{out.reasonCodes.push('FORGED');},TypeError);
  cases++;
}

// Deterministic receipt identity.
{
  const input=request(eligibleProductionReadiness(),'authorize_receipt_only',['DETERMINISTIC']);
  const a=authorization.projectProductionPromotionAuthorization(input);
  const b=authorization.projectProductionPromotionAuthorization(structuredClone(input));
  assert.deepEqual(a,b);
  assert.equal(a.receiptId,b.receiptId);
  cases++;
}

assert(cases>=30,'B139 adversarial coverage unexpectedly low');
console.log('ROADMAP_V2_L35_B139_ADVERSARIAL_PRODUCTION_PROMOTION_AUTHORIZATION=PASS');
console.log(JSON.stringify({
  cases,
  failClosed:true,
  deterministic:true,
  deepFrozen:true,
  authorizationReceiptOnly:true,
  productionPromotionExecution:false,
  deployment:false,
  productionConsumers:0,
  persistence:false,
  runtimeActivation:false
},null,2));
