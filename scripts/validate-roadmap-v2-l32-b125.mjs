import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const contract=read('roadmap_v2/release-review/current-contract.json');
const schema=read('roadmap_v2/release-review/release-review-contract.schema.json');
const requestSchema=read('roadmap_v2/release-review/release-review-request.schema.json');
const resultSchema=read('roadmap_v2/release-review/release-review-result.schema.json');
const promotionContract=read('roadmap_v2/promotion-eligibility/current-contract.json');
const promotionRequest=read('roadmap_v2/promotion-eligibility/promotion-eligibility-request.schema.json');
const promotionResult=read('roadmap_v2/promotion-eligibility/promotion-eligibility-result.schema.json');

assert.equal(schema.$id,'BAUMAN_ROADMAP_V2_RELEASE_REVIEW_CONTRACT_V1');
assert.equal(contract.schema,schema.$id);
assert.equal(contract.version,'2.12.0-l32-b125');
assert.equal(requestSchema.$id,'BAUMAN_ROADMAP_V2_RELEASE_REVIEW_REQUEST_V1');
assert.equal(resultSchema.$id,'BAUMAN_ROADMAP_V2_RELEASE_REVIEW_RESULT_V1');
assert.equal(contract.upstreamSchemas.promotionEligibilityContract,promotionContract.schema);
assert.equal(contract.upstreamSchemas.promotionEligibilityRequest,promotionRequest.$id);
assert.equal(contract.upstreamSchemas.promotionEligibilityResult,promotionResult.$id);
assert.equal(contract.upstreamSchemas.releaseReviewRequest,requestSchema.$id);
assert.equal(contract.upstreamSchemas.releaseReviewResult,resultSchema.$id);

assert.equal(contract.mode.productionIntegration,'disconnected');
assert.equal(contract.mode.promotionReviewIntegration,'disconnected');
assert.equal(contract.mode.releaseReviewOnly,true);
assert.equal(contract.mode.productionPromotionEnabled,false);
for(const key of ['persistentStoreEnabled','dashboardUiEnabled','scheduleWriteAllowed','calendarWriteAllowed','runtimeWriteAllowed','notificationWriteAllowed','automaticActionAllowed'])assert.equal(contract.mode[key],false,'B125 forbidden mode enabled: '+key);

assert.equal(contract.candidatePolicy.candidateRefPattern,'^CANDIDATE::[A-Z0-9_-]+$');
assert.equal(contract.candidatePolicy.recomputePromotionEligibilityFromRequest,true);
assert.equal(contract.candidatePolicy.acceptCallerSuppliedPromotionEligibilityResult,false);
assert.equal(contract.candidatePolicy.acceptCallerSuppliedEligibilityState,false);
assert.equal(contract.candidatePolicy.requireEligibleForReleaseReview,true);
assert.equal(contract.candidatePolicy.manualEligibilityOverrideAllowed,false);

assert.equal(contract.reviewPolicy.reviewerRefPattern,'^RELEASE_REVIEWER::[A-Z0-9_-]+$');
assert.deepEqual(contract.reviewPolicy.allowedDecisions,['approve_for_promotion_review','needs_revision','rejected']);
assert.equal(contract.reviewPolicy.upstreamBlockedState,'release_review_blocked_upstream');
assert.equal(contract.reviewPolicy.approvedState,'release_review_approved_shadow_only');
assert.equal(contract.reviewPolicy.needsRevisionState,'release_review_needs_revision');
assert.equal(contract.reviewPolicy.rejectedState,'release_review_rejected');
assert.equal(contract.reviewPolicy.approvedDecisionAuthorizesProduction,false);
assert.equal(contract.reviewPolicy.manualProductionOverrideAllowed,false);

for(const key of ['productionPromotion','productionConsumerConnect','persistentStoreWrite','dashboardUiRender','scheduleWrite','calendarWrite','runtimeActivation','notificationWrite','automaticAction'])assert.equal(contract.capabilities[key],false,'B125 forbidden capability enabled: '+key);
assert.equal(contract.acceptance.step,125);
assert.equal(contract.acceptance.currentTrack,'L32');
assert.equal(contract.acceptance.productionConsumersConnected,0);
assert.equal(contract.acceptance.promotionReviewIntegration,'disconnected');
assert.equal(contract.acceptance.productionIntegration,'disconnected');
assert.equal(contract.acceptance.productionPromotionAllowed,false);
assert.equal(contract.acceptance.runtimeActivationAllowed,false);
assert.equal(contract.acceptance.result,'PASS_B125_CONTRACT');

assert.equal(requestSchema.additionalProperties,false);
assert.deepEqual(requestSchema.required,['schema','candidateRef','releaseReviewerRef','reviewDecision','reasonCodes','promotionEligibilityRequest']);
assert.equal(requestSchema.properties.schema.const,requestSchema.$id);
assert.equal(requestSchema.properties.candidateRef.pattern,'^CANDIDATE::[A-Z0-9_-]+$');
assert.equal(requestSchema.properties.releaseReviewerRef.pattern,'^RELEASE_REVIEWER::[A-Z0-9_-]+$');
assert.deepEqual(requestSchema.properties.reviewDecision.enum,['approve_for_promotion_review','needs_revision','rejected']);

assert.equal(resultSchema.additionalProperties,false);
assert.deepEqual(resultSchema.properties.sourceEligibilityState.enum,['not_eligible_upstream_blocked','not_eligible_needs_revision','not_eligible_rejected','eligible_for_release_review']);
assert.deepEqual(resultSchema.properties.effectiveReleaseReviewState.enum,['release_review_blocked_upstream','release_review_needs_revision','release_review_rejected','release_review_approved_shadow_only']);
for(const key of ['persisted','productionPromotionAuthorized','productionConsumerConnected','runtimeActionAuthorized','scheduleWriteAllowed','notificationWriteAllowed'])assert.equal(resultSchema.properties[key].const,false,'B125 result authority widened: '+key);

function walk(dir){if(!fs.existsSync(dir))return [];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const p=path.posix.join(dir,entry.name);return entry.isDirectory()?walk(p):[p];});}
for(const p of walk('roadmap_v2'))assert.equal(/\.(?:js|mjs|cjs|html|css)$/i.test(p),false,'B125 executable/UI leaked into canonical Roadmap tree: '+p);
for(const file of [...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p))){
  const text=fs.readFileSync(file,'utf8');
  assert.equal(text.includes('roadmap_v2/release-review/current-contract.json'),false,'B125 release review wired into runtime: '+file);
  assert.equal(text.includes('BAUMAN_ROADMAP_V2_RELEASE_REVIEW_CONTRACT_V1'),false,'B125 release review activation leaked into runtime: '+file);
}

console.log('ROADMAP_V2_L32_B125_RELEASE_REVIEW_CONTRACT=PASS');
console.log(JSON.stringify({releaseReview:contract.schema,upstreamPromotionEligibility:promotionContract.schema,promotionReviewIntegration:'disconnected',productionConsumers:0,productionPromotion:false,persistence:false,runtimeActivation:false,automaticAction:false},null,2));
