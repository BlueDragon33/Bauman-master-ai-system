import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {loadCurrentProductionPromotionAuthorizationHarness} from './roadmap-v2-production-promotion-authorization-harness.mjs';

const authorization=loadCurrentProductionPromotionAuthorizationHarness();
const readinessReview=authorization.readinessReview;
const promotion=readinessReview.promotion;
const satisfying=new Set(promotion.release.promotion.human.consumer.admission.readiness.mastery.contract.prerequisiteGate.satisfyingStates);

function snapshot(targetId,state,phaseId='GD2'){return {schema:'BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1',streamId:'B138::'+phaseId+'::'+targetId,targetId,phaseId,eventCount:1,lastSequence:1,knowledgeState:state,existingCompetencyVerified:false,dimensions:{},masterReadyGate:{passed:false,checks:{}},prerequisiteEligible:satisfying.has(state),persisted:false,transitions:[]};}
function item(id,snap,technicalTrack='math',activityKind='technical_core'){return {scheduleItemId:id,priorityCandidate:{schema:'BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1',candidateId:'B138::CANDIDATE::'+id,targetId:snap.targetId,phaseId:snap.phaseId,masterRelevance:0.8,masterRelevanceSource:'L35/B138 fixture',weeksUntilNeeded:8,snapshot:snap},activityKind,estimatedMinutes:60,technicalTrack,russianTwinMinutes:technicalTrack===null?null:30,dueDate:null,reviewRequested:false,source:{kind:'registry_static',ref:'registry://'+snap.targetId,verified:true,masterModeRelation:'not_applicable'}};}
function schedule(phaseId,items){return {schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',requestId:'B138::SCHEDULE::'+phaseId,phaseId,weekStart:'2026-09-21',weeklyCapacityMinutes:600,items};}
function readiness(phaseId='GD2',focusTargetIds=['RU-R0-C01'],items=[]){return {schema:'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1',reportId:'B138::READINESS::'+phaseId+'::'+focusTargetIds.join('+'),phaseId,focusTargetIds,scheduleRequest:schedule(phaseId,items),externalGates:[]};}
function consumer(readinessRequest){return {schema:'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V1',consumerId:'SHADOW::HUMAN_REVIEW',consumerClass:'human_review_shadow',readinessRequest};}
function human(readinessRequest,decision='accepted_for_shadow_analysis',reasons=['B138_HUMAN']){return {schema:'BAUMAN_ROADMAP_V2_HUMAN_REVIEW_REQUEST_V1',reviewerRef:'REVIEWER::B138',reviewDecision:decision,reasonCodes:reasons,consumerAdmissionRequest:consumer(readinessRequest)};}
function eligibility(humanReviewRequest,candidateRef='CANDIDATE::B138'){return {schema:'BAUMAN_ROADMAP_V2_PROMOTION_ELIGIBILITY_REQUEST_V1',candidateRef,humanReviewRequest};}
function releaseReview(promotionEligibilityRequest,decision='approve_for_promotion_review',reasons=['B138_RELEASE'],candidateRef='CANDIDATE::B138'){return {schema:'BAUMAN_ROADMAP_V2_RELEASE_REVIEW_REQUEST_V1',candidateRef,releaseReviewerRef:'RELEASE_REVIEWER::B138',reviewDecision:decision,reasonCodes:reasons,promotionEligibilityRequest};}
function promotionReview(releaseReviewRequest,decision='approve_for_production_readiness_review',reasons=['B138_PROMOTION'],candidateRef='CANDIDATE::B138'){return {schema:'BAUMAN_ROADMAP_V2_PROMOTION_REVIEW_REQUEST_V1',candidateRef,promotionReviewerRef:'PROMOTION_REVIEWER::B138',reviewDecision:decision,reasonCodes:reasons,releaseReviewRequest};}
function productionReadiness(promotionReviewRequest,decision='approve_shadow_readiness',reasons=['B138_READINESS'],candidateRef='CANDIDATE::B138'){return {schema:'BAUMAN_ROADMAP_V2_PRODUCTION_READINESS_REVIEW_REQUEST_V1',candidateRef,productionReadinessReviewerRef:'PRODUCTION_READINESS_REVIEWER::B138',reviewDecision:decision,reasonCodes:reasons,promotionReviewRequest};}
function request(productionReadinessReviewRequest,decision='authorize_receipt_only',reasons=['B138_AUTHORIZATION'],candidateRef='CANDIDATE::B138'){return {schema:'BAUMAN_ROADMAP_V2_PRODUCTION_PROMOTION_AUTHORIZATION_REQUEST_V1',candidateRef,productionPromotionAuthorizerRef:'PRODUCTION_PROMOTION_AUTHORIZER::B138',authorizationDecision:decision,reasonCodes:reasons,productionReadinessReviewRequest};}
function event(sequence,evidenceType,payload,targetId,phaseId='GD2'){return {schema:'BAUMAN_ROADMAP_V2_EVIDENCE_EVENT_V1',eventId:targetId+'-B138-'+sequence,streamId:'B138::STREAM::'+targetId,sequence,targetId,phaseId,evidenceType,occurredAt:'2026-09-20T00:00:00Z',source:{kind:'b138_fixture',ref:targetId+'/'+sequence},payload};}
function fullEvidence(targetId,phaseId='GD2'){return [event(1,'chapter_assessment',{percent:85,criticalPercent:75},targetId,phaseId),event(2,'exercise_set',{percent:90,completedItems:20,totalItems:20},targetId,phaseId),event(3,'lab_or_simulation',{passed:true,explanationAccepted:true},targetId,phaseId),event(4,'project_rubric',{rubric:{correctness:3,clarity:3,verification:3,reproducibility:3}},targetId,phaseId),event(5,'retention_check',{percent:80,daysAfterLearning:14},targetId,phaseId)];}
function eligibleProductionReadiness(){
  const snap=promotion.release.promotion.human.consumer.admission.readiness.mastery.reduceEvidenceStream(fullEvidence('RU-R0-C01'));
  const r=readiness('GD2',['RU-R0-C01'],[item('GREEN',snap,null,'russian_foundation')]);
  const h=human(r,'accepted_for_shadow_analysis',['READY']);
  const e=eligibility(h);
  const rel=releaseReview(e,'approve_for_promotion_review',['RELEASE_APPROVED']);
  const pro=promotionReview(rel,'approve_for_production_readiness_review',['PROMOTION_APPROVED']);
  return productionReadiness(pro,'approve_shadow_readiness',['READINESS_APPROVED']);
}

// Upstream not shadow-ready => authorization blocked regardless of caller decision.
{
  const blocked=productionReadiness(promotionReview(releaseReview(eligibility(human(readiness())))));
  const out=authorization.projectProductionPromotionAuthorization(request(blocked));
  assert.equal(out.sourceProductionReadinessReviewState,'production_readiness_review_blocked_upstream');
  assert.equal(out.effectiveProductionPromotionAuthorizationState,'production_promotion_authorization_blocked_upstream');
  assert.equal(out.authorizationReceiptGranted,false);
}
// Shadow-ready + authorize => receipt only, no execution.
{
  const out=authorization.projectProductionPromotionAuthorization(request(eligibleProductionReadiness(),'authorize_receipt_only',['AUTHORIZE_RECEIPT']));
  assert.equal(out.sourceProductionReadinessReviewState,'production_readiness_review_approved_shadow_only');
  assert.equal(out.effectiveProductionPromotionAuthorizationState,'production_promotion_authorization_receipt_granted');
  assert.equal(out.authorizationReceiptGranted,true);
  assert.equal(out.authorizationScope,'receipt_only_no_execution');
  assert.equal(out.productionPromotionExecuted,false);
  assert.equal(out.deploymentExecuted,false);
  assert.equal(out.productionConsumerConnected,false);
}
// Shadow-ready + needs revision.
{
  const out=authorization.projectProductionPromotionAuthorization(request(eligibleProductionReadiness(),'needs_revision',['FIX_REQUIRED']));
  assert.equal(out.effectiveProductionPromotionAuthorizationState,'production_promotion_authorization_needs_revision');
  assert.equal(out.authorizationReceiptGranted,false);
}
// Shadow-ready + reject.
{
  const out=authorization.projectProductionPromotionAuthorization(request(eligibleProductionReadiness(),'rejected',['REJECTED']));
  assert.equal(out.effectiveProductionPromotionAuthorizationState,'production_promotion_authorization_rejected');
  assert.equal(out.authorizationReceiptGranted,false);
}

// Deterministic, input-preserving, audit-preserving, deeply frozen.
{
  const input=request(eligibleProductionReadiness(),'authorize_receipt_only',['DETERMINISTIC']);
  const before=structuredClone(input);
  const a=authorization.projectProductionPromotionAuthorization(input);
  const b=authorization.projectProductionPromotionAuthorization(input);
  assert.deepEqual(input,before);
  assert.deepEqual(a,b);
  assert.equal(a.productionPromotionAuthorizerRef,'PRODUCTION_PROMOTION_AUTHORIZER::B138');
  assert.equal(a.submittedAuthorizationDecision,'authorize_receipt_only');
  assert.deepEqual(a.reasonCodes,['DETERMINISTIC']);
  assert(Object.isFrozen(a));
  assert(Object.isFrozen(a.reasonCodes));
  assert.throws(()=>{a.productionPromotionExecuted=true;},TypeError);
  assert.throws(()=>{a.reasonCodes.push('FORGED');},TypeError);
}

// Fail closed against identity mismatch and caller-supplied authority/result fields.
for(const forged of [
  {...request(eligibleProductionReadiness()),candidateRef:'CANDIDATE::OTHER'},
  {...request(eligibleProductionReadiness()),productionPromotionAuthorizerRef:'PRODUCTION_READINESS_REVIEWER::B138'},
  {...request(eligibleProductionReadiness()),shadowProductionReady:true},
  {...request(eligibleProductionReadiness()),productionPromotionExecuted:true},
  {...request(eligibleProductionReadiness()),deploymentExecuted:true},
  {...request(eligibleProductionReadiness()),productionReadinessReviewResult:{shadowProductionReady:true}},
  {...request(eligibleProductionReadiness()),reasonCodes:[]},
  {...request(eligibleProductionReadiness()),reasonCodes:['DUP','DUP']}
]){assert.throws(()=>authorization.projectProductionPromotionAuthorization(forged));}

// Scripts-only and side-effect free.
{
  const source=fs.readFileSync('scripts/roadmap-v2-production-promotion-authorization-harness.mjs','utf8');
  for(const forbidden of [/writeFileSync\s*\(/,/appendFileSync\s*\(/,/writeFile\s*\(/,/localStorage/,/sessionStorage/,/fetch\s*\(/,/XMLHttpRequest/,/child_process/,/spawn\s*\(/,/exec\s*\(/])assert.doesNotMatch(source,forbidden,'Authorization harness gained forbidden side effect: '+forbidden);
  function walk(dir){return fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.posix.join(dir,e.name);return e.isDirectory()?walk(p):[p];}):[];}
  for(const file of [...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p))){
    const text=fs.readFileSync(file,'utf8');
    assert.equal(text.includes('roadmap-v2-production-promotion-authorization-harness.mjs'),false,'Authorization harness wired into runtime: '+file);
    assert.equal(text.includes('loadCurrentProductionPromotionAuthorizationHarness'),false,'Authorization activation leaked into runtime: '+file);
  }
}

console.log('ROADMAP_V2_L35_B138_PRODUCTION_PROMOTION_AUTHORIZATION_PROJECTOR=PASS');
console.log(JSON.stringify({
  states:['production_promotion_authorization_blocked_upstream','production_promotion_authorization_needs_revision','production_promotion_authorization_rejected','production_promotion_authorization_receipt_granted'],
  deterministic:true,
  deepFrozen:true,
  auditFields:true,
  authorizationReceiptOnly:true,
  productionPromotionExecution:false,
  deployment:false,
  productionConsumers:0,
  persistence:false,
  runtimeActivation:false
},null,2));
