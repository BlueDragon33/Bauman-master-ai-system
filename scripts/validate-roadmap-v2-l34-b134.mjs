import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {loadCurrentProductionReadinessReviewHarness} from './roadmap-v2-production-readiness-review-harness.mjs';

const readinessReview=loadCurrentProductionReadinessReviewHarness();
const promotion=readinessReview.promotion;
const satisfying=new Set(promotion.release.promotion.human.consumer.admission.readiness.mastery.contract.prerequisiteGate.satisfyingStates);

function snapshot(targetId,state,phaseId='GD2',options={}){return {schema:'BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1',streamId:options.streamId||('B134::'+phaseId+'::'+targetId),targetId,phaseId,eventCount:options.eventCount??1,lastSequence:options.lastSequence??1,knowledgeState:state,existingCompetencyVerified:false,dimensions:options.dimensions||{},masterReadyGate:options.masterReadyGate||{passed:false,checks:{}},prerequisiteEligible:satisfying.has(state),persisted:false,transitions:[]};}
function item(id,snap,options={}){const technicalTrack=options.technicalTrack===undefined?'math':options.technicalTrack;return {scheduleItemId:id,priorityCandidate:{schema:'BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1',candidateId:'B134::CANDIDATE::'+id,targetId:snap.targetId,phaseId:snap.phaseId,masterRelevance:0.8,masterRelevanceSource:'L34/B134 fixture',weeksUntilNeeded:8,snapshot:snap},activityKind:options.activityKind||'technical_core',estimatedMinutes:60,technicalTrack,russianTwinMinutes:technicalTrack===null?null:30,dueDate:null,reviewRequested:false,source:{kind:'registry_static',ref:'registry://'+snap.targetId,verified:true,masterModeRelation:'not_applicable'}};}
function schedule(phaseId,items){return {schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',requestId:'B134::SCHEDULE::'+phaseId,phaseId,weekStart:'2026-09-21',weeklyCapacityMinutes:600,items};}
function readiness(phaseId='GD2',focusTargetIds=['RU-R0-C01'],items=[]){return {schema:'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1',reportId:'B134::READINESS::'+phaseId+'::'+focusTargetIds.join('+'),phaseId,focusTargetIds,scheduleRequest:schedule(phaseId,items),externalGates:[]};}
function consumer(readinessRequest){return {schema:'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V1',consumerId:'SHADOW::HUMAN_REVIEW',consumerClass:'human_review_shadow',readinessRequest};}
function human(readinessRequest,decision='accepted_for_shadow_analysis',reasons=['B134_HUMAN']){return {schema:'BAUMAN_ROADMAP_V2_HUMAN_REVIEW_REQUEST_V1',reviewerRef:'REVIEWER::B134',reviewDecision:decision,reasonCodes:reasons,consumerAdmissionRequest:consumer(readinessRequest)};}
function eligibility(humanReviewRequest,candidateRef='CANDIDATE::B134'){return {schema:'BAUMAN_ROADMAP_V2_PROMOTION_ELIGIBILITY_REQUEST_V1',candidateRef,humanReviewRequest};}
function releaseReview(promotionEligibilityRequest,decision='approve_for_promotion_review',reasons=['B134_RELEASE'],candidateRef='CANDIDATE::B134'){return {schema:'BAUMAN_ROADMAP_V2_RELEASE_REVIEW_REQUEST_V1',candidateRef,releaseReviewerRef:'RELEASE_REVIEWER::B134',reviewDecision:decision,reasonCodes:reasons,promotionEligibilityRequest};}
function promotionReview(releaseReviewRequest,decision='approve_for_production_readiness_review',reasons=['B134_PROMOTION'],candidateRef='CANDIDATE::B134'){return {schema:'BAUMAN_ROADMAP_V2_PROMOTION_REVIEW_REQUEST_V1',candidateRef,promotionReviewerRef:'PROMOTION_REVIEWER::B134',reviewDecision:decision,reasonCodes:reasons,releaseReviewRequest};}
function request(promotionReviewRequest,decision='approve_shadow_readiness',reasons=['B134_PRODUCTION_READINESS'],candidateRef='CANDIDATE::B134'){return {schema:'BAUMAN_ROADMAP_V2_PRODUCTION_READINESS_REVIEW_REQUEST_V1',candidateRef,productionReadinessReviewerRef:'PRODUCTION_READINESS_REVIEWER::B134',reviewDecision:decision,reasonCodes:reasons,promotionReviewRequest};}
function event(sequence,evidenceType,payload,targetId,phaseId='GD2'){return {schema:'BAUMAN_ROADMAP_V2_EVIDENCE_EVENT_V1',eventId:targetId+'-B134-'+sequence,streamId:'B134::STREAM::'+targetId,sequence,targetId,phaseId,evidenceType,occurredAt:'2026-09-20T00:00:00Z',source:{kind:'b134_fixture',ref:targetId+'/'+sequence},payload};}
function fullEvidence(targetId,phaseId='GD2'){return [event(1,'chapter_assessment',{percent:85,criticalPercent:75},targetId,phaseId),event(2,'exercise_set',{percent:90,completedItems:20,totalItems:20},targetId,phaseId),event(3,'lab_or_simulation',{passed:true,explanationAccepted:true},targetId,phaseId),event(4,'project_rubric',{rubric:{correctness:3,clarity:3,verification:3,reproducibility:3}},targetId,phaseId),event(5,'retention_check',{percent:80,daysAfterLearning:14},targetId,phaseId)];}
function eligibleRelease(){
  const snap=promotion.release.promotion.human.consumer.admission.readiness.mastery.reduceEvidenceStream(fullEvidence('RU-R0-C01'));
  const r=readiness('GD2',['RU-R0-C01'],[item('GREEN',snap,{technicalTrack:null,activityKind:'russian_foundation'})]);
  return releaseReview(eligibility(human(r,'accepted_for_shadow_analysis',['READY'])),'approve_for_promotion_review',['RELEASE_APPROVED']);
}
function eligiblePromotion(){return promotionReview(eligibleRelease(),'approve_for_production_readiness_review',['PROMOTION_APPROVED']);}

// Upstream Promotion Review not eligible => blocked regardless of caller approval.
{
  const out=readinessReview.projectProductionReadinessReview(request(promotionReview(releaseReview(eligibility(human(readiness()))))));
  assert.equal(out.sourcePromotionReviewState,'promotion_review_blocked_upstream');
  assert.equal(out.effectiveProductionReadinessReviewState,'production_readiness_review_blocked_upstream');
  assert.equal(out.shadowProductionReady,false);
}
// Eligible Promotion Review + approve => shadow-ready only, never production-authorized.
{
  const out=readinessReview.projectProductionReadinessReview(request(eligiblePromotion(),'approve_shadow_readiness',['APPROVE_SHADOW']));
  assert.equal(out.sourcePromotionReviewState,'promotion_review_approved_shadow_only');
  assert.equal(out.effectiveProductionReadinessReviewState,'production_readiness_review_approved_shadow_only');
  assert.equal(out.shadowProductionReady,true);
  assert.equal(out.productionPromotionAuthorized,false);
  assert.equal(out.productionConsumerConnected,false);
}
// Eligible Promotion Review + needs revision.
{
  const out=readinessReview.projectProductionReadinessReview(request(eligiblePromotion(),'needs_revision',['FIX_REQUIRED']));
  assert.equal(out.effectiveProductionReadinessReviewState,'production_readiness_review_needs_revision');
  assert.equal(out.shadowProductionReady,false);
}
// Eligible Promotion Review + rejected.
{
  const out=readinessReview.projectProductionReadinessReview(request(eligiblePromotion(),'rejected',['REJECTED']));
  assert.equal(out.effectiveProductionReadinessReviewState,'production_readiness_review_rejected');
  assert.equal(out.shadowProductionReady,false);
}

// Deterministic, input-preserving, audit-preserving, deeply frozen.
{
  const input=request(eligiblePromotion(),'approve_shadow_readiness',['DETERMINISTIC']);
  const before=structuredClone(input);
  const a=readinessReview.projectProductionReadinessReview(input);
  const b=readinessReview.projectProductionReadinessReview(input);
  assert.deepEqual(input,before);
  assert.deepEqual(a,b);
  assert.equal(a.productionReadinessReviewerRef,'PRODUCTION_READINESS_REVIEWER::B134');
  assert.equal(a.submittedReviewDecision,'approve_shadow_readiness');
  assert.deepEqual(a.reasonCodes,['DETERMINISTIC']);
  assert(Object.isFrozen(a));
  assert(Object.isFrozen(a.reasonCodes));
  assert.throws(()=>{a.productionPromotionAuthorized=true;},TypeError);
  assert.throws(()=>{a.reasonCodes.push('FORGED');},TypeError);
}

// Fail closed against identity mismatch and caller-supplied authority/result fields.
for(const forged of [
  {...request(eligiblePromotion()),candidateRef:'CANDIDATE::OTHER'},
  {...request(eligiblePromotion()),productionReadinessReviewerRef:'PROMOTION_REVIEWER::B134'},
  {...request(eligiblePromotion()),shadowProductionReady:true},
  {...request(eligiblePromotion()),productionPromotionAuthorized:true},
  {...request(eligiblePromotion()),promotionReviewResult:{productionReadinessReviewEligible:true}},
  {...request(eligiblePromotion()),reasonCodes:[]},
  {...request(eligiblePromotion()),reasonCodes:['DUP','DUP']}
]){assert.throws(()=>readinessReview.projectProductionReadinessReview(forged));}

// Scripts-only and side-effect free.
{
  const source=fs.readFileSync('scripts/roadmap-v2-production-readiness-review-harness.mjs','utf8');
  for(const forbidden of [/writeFileSync\s*\(/,/appendFileSync\s*\(/,/writeFile\s*\(/,/localStorage/,/sessionStorage/,/fetch\s*\(/,/XMLHttpRequest/,/child_process/,/spawn\s*\(/,/exec\s*\(/])assert.doesNotMatch(source,forbidden,'Production Readiness Review harness gained forbidden side effect: '+forbidden);
  function walk(dir){return fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.posix.join(dir,e.name);return e.isDirectory()?walk(p):[p];}):[];}
  for(const file of [...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p))){
    const text=fs.readFileSync(file,'utf8');
    assert.equal(text.includes('roadmap-v2-production-readiness-review-harness.mjs'),false,'Production Readiness Review harness wired into runtime: '+file);
    assert.equal(text.includes('loadCurrentProductionReadinessReviewHarness'),false,'Production Readiness Review activation leaked into runtime: '+file);
  }
}

console.log('ROADMAP_V2_L34_B134_PRODUCTION_READINESS_REVIEW_PROJECTOR=PASS');
console.log(JSON.stringify({
  states:['production_readiness_review_blocked_upstream','production_readiness_review_needs_revision','production_readiness_review_rejected','production_readiness_review_approved_shadow_only'],
  deterministic:true,
  deepFrozen:true,
  auditFields:true,
  shadowProductionReadyOnly:true,
  productionPromotion:false,
  productionConsumers:0,
  persistence:false,
  runtimeActivation:false
},null,2));
