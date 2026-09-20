import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const contract=read('roadmap_v2/production-readiness-review/current-contract.json');
const schema=read('roadmap_v2/production-readiness-review/production-readiness-review-contract.schema.json');
const requestSchema=read('roadmap_v2/production-readiness-review/production-readiness-review-request.schema.json');
const resultSchema=read('roadmap_v2/production-readiness-review/production-readiness-review-result.schema.json');
const promotionContract=read('roadmap_v2/promotion-review/current-contract.json');
const promotionRequest=read('roadmap_v2/promotion-review/promotion-review-request.schema.json');
const promotionResult=read('roadmap_v2/promotion-review/promotion-review-result.schema.json');

assert.equal(schema.$id,'BAUMAN_ROADMAP_V2_PRODUCTION_READINESS_REVIEW_CONTRACT_V1');
assert.equal(contract.schema,schema.$id);
assert.equal(contract.version,'2.14.0-l34-b133');
assert.equal(requestSchema.$id,'BAUMAN_ROADMAP_V2_PRODUCTION_READINESS_REVIEW_REQUEST_V1');
assert.equal(resultSchema.$id,'BAUMAN_ROADMAP_V2_PRODUCTION_READINESS_REVIEW_RESULT_V1');
assert.equal(contract.upstreamSchemas.promotionReviewContract,promotionContract.schema);
assert.equal(contract.upstreamSchemas.promotionReviewRequest,promotionRequest.$id);
assert.equal(contract.upstreamSchemas.promotionReviewResult,promotionResult.$id);
assert.equal(contract.upstreamSchemas.productionReadinessReviewRequest,requestSchema.$id);
assert.equal(contract.upstreamSchemas.productionReadinessReviewResult,resultSchema.$id);

assert.equal(contract.mode.productionIntegration,'disconnected');
assert.equal(contract.mode.productionReadinessReviewOnly,true);
assert.equal(contract.mode.productionPromotionEnabled,false);
for(const key of ['persistentStoreEnabled','dashboardUiEnabled','scheduleWriteAllowed','calendarWriteAllowed','runtimeWriteAllowed','notificationWriteAllowed','automaticActionAllowed']){
  assert.equal(contract.mode[key],false,'B133 forbidden mode enabled: '+key);
}

assert.equal(contract.candidatePolicy.candidateRefPattern,'^CANDIDATE::[A-Z0-9_-]+$');
assert.equal(contract.candidatePolicy.recomputePromotionReviewFromRequest,true);
assert.equal(contract.candidatePolicy.acceptCallerSuppliedPromotionReviewResult,false);
assert.equal(contract.candidatePolicy.acceptCallerSuppliedProductionReadinessReviewEligibility,false);
assert.equal(contract.candidatePolicy.requireProductionReadinessReviewEligible,true);
assert.equal(contract.candidatePolicy.manualEligibilityOverrideAllowed,false);
assert.equal(contract.candidatePolicy.requireNestedCandidateMatch,true);

assert.equal(contract.reviewPolicy.reviewerRefPattern,'^PRODUCTION_READINESS_REVIEWER::[A-Z0-9_-]+$');
assert.deepEqual(contract.reviewPolicy.allowedDecisions,['approve_shadow_readiness','needs_revision','rejected']);
assert.equal(contract.reviewPolicy.upstreamBlockedState,'production_readiness_review_blocked_upstream');
assert.equal(contract.reviewPolicy.approvedState,'production_readiness_review_approved_shadow_only');
assert.equal(contract.reviewPolicy.needsRevisionState,'production_readiness_review_needs_revision');
assert.equal(contract.reviewPolicy.rejectedState,'production_readiness_review_rejected');
assert.equal(contract.reviewPolicy.approvedDecisionAuthorizesProduction,false);
assert.equal(contract.reviewPolicy.manualProductionOverrideAllowed,false);

for(const key of ['productionPromotion','productionConsumerConnect','persistentStoreWrite','dashboardUiRender','scheduleWrite','calendarWrite','runtimeActivation','notificationWrite','automaticAction']){
  assert.equal(contract.capabilities[key],false,'B133 forbidden capability enabled: '+key);
}
assert.equal(contract.capabilities.productionReadinessReviewEvaluate,true);
assert.equal(contract.capabilities.shadowProductionReadinessProject,true);
assert.equal(contract.acceptance.step,133);
assert.equal(contract.acceptance.currentTrack,'L34');
assert.equal(contract.acceptance.productionConsumersConnected,0);
assert.equal(contract.acceptance.productionIntegration,'disconnected');
assert.equal(contract.acceptance.productionPromotionAllowed,false);
assert.equal(contract.acceptance.runtimeActivationAllowed,false);
assert.equal(contract.acceptance.result,'PASS_B133_CONTRACT');

assert.equal(requestSchema.additionalProperties,false);
assert.deepEqual(requestSchema.required,['schema','candidateRef','productionReadinessReviewerRef','reviewDecision','reasonCodes','promotionReviewRequest']);
assert.equal(requestSchema.properties.schema.const,requestSchema.$id);
assert.equal(requestSchema.properties.candidateRef.pattern,'^CANDIDATE::[A-Z0-9_-]+$');
assert.equal(requestSchema.properties.productionReadinessReviewerRef.pattern,'^PRODUCTION_READINESS_REVIEWER::[A-Z0-9_-]+$');
assert.deepEqual(requestSchema.properties.reviewDecision.enum,['approve_shadow_readiness','needs_revision','rejected']);
assert.equal(requestSchema.properties.reasonCodes.minItems,1);
assert.equal(requestSchema.properties.reasonCodes.maxItems,12);

assert.equal(resultSchema.additionalProperties,false);
for(const field of ['candidateRef','productionReadinessReviewerRef','submittedReviewDecision','reasonCodes','promotionReviewReceiptId','shadowProductionReady']){
  assert(resultSchema.required.includes(field),'B133 result audit field missing: '+field);
}
assert.equal(resultSchema.properties.productionReadinessReviewerRef.pattern,'^PRODUCTION_READINESS_REVIEWER::[A-Z0-9_-]+$');
assert.deepEqual(resultSchema.properties.submittedReviewDecision.enum,['approve_shadow_readiness','needs_revision','rejected']);
assert.deepEqual(resultSchema.properties.sourcePromotionReviewState.enum,['promotion_review_blocked_upstream','promotion_review_needs_revision','promotion_review_rejected','promotion_review_approved_shadow_only']);
assert.deepEqual(resultSchema.properties.effectiveProductionReadinessReviewState.enum,['production_readiness_review_blocked_upstream','production_readiness_review_needs_revision','production_readiness_review_rejected','production_readiness_review_approved_shadow_only']);
for(const key of ['persisted','productionPromotionAuthorized','productionConsumerConnected','runtimeActionAuthorized','scheduleWriteAllowed','notificationWriteAllowed']){
  assert.equal(resultSchema.properties[key].const,false,'B133 result authority widened: '+key);
}

function walk(dir){
  if(!fs.existsSync(dir))return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const p=path.posix.join(dir,entry.name);
    return entry.isDirectory()?walk(p):[p];
  });
}
for(const p of walk('roadmap_v2')){
  assert.equal(/\.(?:js|mjs|cjs|html|css)$/i.test(p),false,'B133 executable/UI leaked into canonical Roadmap tree: '+p);
}
for(const file of [...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p))){
  const text=fs.readFileSync(file,'utf8');
  assert.equal(text.includes('roadmap_v2/production-readiness-review/current-contract.json'),false,'B133 Production Readiness Review wired into runtime: '+file);
  assert.equal(text.includes('BAUMAN_ROADMAP_V2_PRODUCTION_READINESS_REVIEW_CONTRACT_V1'),false,'B133 Production Readiness Review activation leaked into runtime: '+file);
}

console.log('ROADMAP_V2_L34_B133_PRODUCTION_READINESS_REVIEW_CONTRACT=PASS');
console.log(JSON.stringify({
  productionReadinessReview:contract.schema,
  upstreamPromotionReview:promotionContract.schema,
  productionConsumers:0,
  productionPromotion:false,
  persistence:false,
  runtimeActivation:false,
  automaticAction:false
},null,2));
