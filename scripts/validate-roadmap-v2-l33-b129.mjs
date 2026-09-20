import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const contract=read('roadmap_v2/promotion-review/current-contract.json');
const schema=read('roadmap_v2/promotion-review/promotion-review-contract.schema.json');
const requestSchema=read('roadmap_v2/promotion-review/promotion-review-request.schema.json');
const resultSchema=read('roadmap_v2/promotion-review/promotion-review-result.schema.json');
const releaseContract=read('roadmap_v2/release-review/current-contract.json');
const releaseRequest=read('roadmap_v2/release-review/release-review-request.schema.json');
const releaseResult=read('roadmap_v2/release-review/release-review-result.schema.json');

assert.equal(schema.$id,'BAUMAN_ROADMAP_V2_PROMOTION_REVIEW_CONTRACT_V1');
assert.equal(contract.schema,schema.$id);
assert.equal(contract.version,'2.13.0-l33-b129');
assert.equal(requestSchema.$id,'BAUMAN_ROADMAP_V2_PROMOTION_REVIEW_REQUEST_V1');
assert.equal(resultSchema.$id,'BAUMAN_ROADMAP_V2_PROMOTION_REVIEW_RESULT_V1');
assert.equal(contract.upstreamSchemas.releaseReviewContract,releaseContract.schema);
assert.equal(contract.upstreamSchemas.releaseReviewRequest,releaseRequest.$id);
assert.equal(contract.upstreamSchemas.releaseReviewResult,releaseResult.$id);
assert.equal(contract.upstreamSchemas.promotionReviewRequest,requestSchema.$id);
assert.equal(contract.upstreamSchemas.promotionReviewResult,resultSchema.$id);

assert.equal(contract.mode.productionIntegration,'disconnected');
assert.equal(contract.mode.productionReadinessReviewIntegration,'disconnected');
assert.equal(contract.mode.promotionReviewOnly,true);
assert.equal(contract.mode.productionPromotionEnabled,false);
for(const key of ['persistentStoreEnabled','dashboardUiEnabled','scheduleWriteAllowed','calendarWriteAllowed','runtimeWriteAllowed','notificationWriteAllowed','automaticActionAllowed']){
  assert.equal(contract.mode[key],false,'B129 forbidden mode enabled: '+key);
}

assert.equal(contract.candidatePolicy.candidateRefPattern,'^CANDIDATE::[A-Z0-9_-]+$');
assert.equal(contract.candidatePolicy.recomputeReleaseReviewFromRequest,true);
assert.equal(contract.candidatePolicy.acceptCallerSuppliedReleaseReviewResult,false);
assert.equal(contract.candidatePolicy.acceptCallerSuppliedPromotionReviewEligibility,false);
assert.equal(contract.candidatePolicy.requirePromotionReviewEligible,true);
assert.equal(contract.candidatePolicy.manualEligibilityOverrideAllowed,false);
assert.equal(contract.candidatePolicy.requireNestedCandidateMatch,true);

assert.equal(contract.reviewPolicy.reviewerRefPattern,'^PROMOTION_REVIEWER::[A-Z0-9_-]+$');
assert.deepEqual(contract.reviewPolicy.allowedDecisions,['approve_for_production_readiness_review','needs_revision','rejected']);
assert.equal(contract.reviewPolicy.upstreamBlockedState,'promotion_review_blocked_upstream');
assert.equal(contract.reviewPolicy.approvedState,'promotion_review_approved_shadow_only');
assert.equal(contract.reviewPolicy.needsRevisionState,'promotion_review_needs_revision');
assert.equal(contract.reviewPolicy.rejectedState,'promotion_review_rejected');
assert.equal(contract.reviewPolicy.approvedDecisionAuthorizesProduction,false);
assert.equal(contract.reviewPolicy.manualProductionOverrideAllowed,false);

for(const key of ['productionPromotion','productionConsumerConnect','persistentStoreWrite','dashboardUiRender','scheduleWrite','calendarWrite','runtimeActivation','notificationWrite','automaticAction']){
  assert.equal(contract.capabilities[key],false,'B129 forbidden capability enabled: '+key);
}
assert.equal(contract.capabilities.promotionReviewEvaluate,true);
assert.equal(contract.capabilities.productionReadinessEligibilityProject,true);
assert.equal(contract.acceptance.step,129);
assert.equal(contract.acceptance.currentTrack,'L33');
assert.equal(contract.acceptance.productionConsumersConnected,0);
assert.equal(contract.acceptance.productionReadinessReviewIntegration,'disconnected');
assert.equal(contract.acceptance.productionIntegration,'disconnected');
assert.equal(contract.acceptance.productionPromotionAllowed,false);
assert.equal(contract.acceptance.runtimeActivationAllowed,false);
assert.equal(contract.acceptance.result,'PASS_B129_CONTRACT');

assert.equal(requestSchema.additionalProperties,false);
assert.deepEqual(requestSchema.required,['schema','candidateRef','promotionReviewerRef','reviewDecision','reasonCodes','releaseReviewRequest']);
assert.equal(requestSchema.properties.schema.const,requestSchema.$id);
assert.equal(requestSchema.properties.candidateRef.pattern,'^CANDIDATE::[A-Z0-9_-]+$');
assert.equal(requestSchema.properties.promotionReviewerRef.pattern,'^PROMOTION_REVIEWER::[A-Z0-9_-]+$');
assert.deepEqual(requestSchema.properties.reviewDecision.enum,['approve_for_production_readiness_review','needs_revision','rejected']);
assert.equal(requestSchema.properties.reasonCodes.minItems,1);
assert.equal(requestSchema.properties.reasonCodes.maxItems,12);

assert.equal(resultSchema.additionalProperties,false);
for(const field of ['candidateRef','promotionReviewerRef','submittedReviewDecision','reasonCodes','releaseReviewReceiptId','productionReadinessReviewEligible']){
  assert(resultSchema.required.includes(field),'B129 result audit field missing: '+field);
}
assert.equal(resultSchema.properties.promotionReviewerRef.pattern,'^PROMOTION_REVIEWER::[A-Z0-9_-]+$');
assert.deepEqual(resultSchema.properties.submittedReviewDecision.enum,['approve_for_production_readiness_review','needs_revision','rejected']);
assert.deepEqual(resultSchema.properties.sourceReleaseReviewState.enum,['release_review_blocked_upstream','release_review_needs_revision','release_review_rejected','release_review_approved_shadow_only']);
assert.deepEqual(resultSchema.properties.effectivePromotionReviewState.enum,['promotion_review_blocked_upstream','promotion_review_needs_revision','promotion_review_rejected','promotion_review_approved_shadow_only']);
for(const key of ['persisted','productionPromotionAuthorized','productionConsumerConnected','runtimeActionAuthorized','scheduleWriteAllowed','notificationWriteAllowed']){
  assert.equal(resultSchema.properties[key].const,false,'B129 result authority widened: '+key);
}

function walk(dir){
  if(!fs.existsSync(dir))return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const p=path.posix.join(dir,entry.name);
    return entry.isDirectory()?walk(p):[p];
  });
}
for(const p of walk('roadmap_v2')){
  assert.equal(/\.(?:js|mjs|cjs|html|css)$/i.test(p),false,'B129 executable/UI leaked into canonical Roadmap tree: '+p);
}
for(const file of [...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p))){
  const text=fs.readFileSync(file,'utf8');
  assert.equal(text.includes('roadmap_v2/promotion-review/current-contract.json'),false,'B129 Promotion Review wired into runtime: '+file);
  assert.equal(text.includes('BAUMAN_ROADMAP_V2_PROMOTION_REVIEW_CONTRACT_V1'),false,'B129 Promotion Review activation leaked into runtime: '+file);
}

console.log('ROADMAP_V2_L33_B129_PROMOTION_REVIEW_CONTRACT=PASS');
console.log(JSON.stringify({
  promotionReview:contract.schema,
  upstreamReleaseReview:releaseContract.schema,
  productionReadinessReviewIntegration:'disconnected',
  productionConsumers:0,
  productionPromotion:false,
  persistence:false,
  runtimeActivation:false,
  automaticAction:false
},null,2));
