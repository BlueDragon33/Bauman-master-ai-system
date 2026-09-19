import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const contract=read('roadmap_v2/release-review/current-contract.json');
const requestSchema=read('roadmap_v2/release-review/release-review-request.schema.json');
const resultSchema=read('roadmap_v2/release-review/release-review-result.schema.json');

assert.equal(contract.schema,'BAUMAN_ROADMAP_V2_RELEASE_REVIEW_CONTRACT_V1');
assert.equal(contract.version,'2.12.1-l32-b125-h1');
assert.equal(contract.candidatePolicy.requireNestedCandidateMatch,true);
assert.equal(contract.candidatePolicy.recomputePromotionEligibilityFromRequest,true);
assert.equal(contract.candidatePolicy.acceptCallerSuppliedPromotionEligibilityResult,false);
assert.equal(contract.outputPolicy.includesReleaseReviewerRef,true);
assert.equal(contract.outputPolicy.includesSubmittedReviewDecision,true);
assert.equal(contract.outputPolicy.includesReasonCodes,true);

for(const field of ['releaseReviewerRef','submittedReviewDecision','reasonCodes'])assert(resultSchema.required.includes(field),'L32-H1 audit field missing from required result: '+field);
assert.equal(resultSchema.properties.releaseReviewerRef.pattern,'^RELEASE_REVIEWER::[A-Z0-9_-]+$');
assert.deepEqual(resultSchema.properties.submittedReviewDecision.enum,['approve_for_promotion_review','needs_revision','rejected']);
assert.equal(resultSchema.properties.reasonCodes.minItems,1);
assert.equal(resultSchema.properties.reasonCodes.maxItems,12);
assert.equal(requestSchema.properties.candidateRef.pattern,'^CANDIDATE::[A-Z0-9_-]+$');

for(const key of ['productionPromotionAuthorized','productionConsumerConnected','runtimeActionAuthorized','scheduleWriteAllowed','notificationWriteAllowed'])assert.equal(resultSchema.properties[key].const,false,'L32-H1 widened authority: '+key);
for(const key of ['productionPromotion','productionConsumerConnect','persistentStoreWrite','dashboardUiRender','scheduleWrite','calendarWrite','runtimeActivation','notificationWrite','automaticAction'])assert.equal(contract.capabilities[key],false,'L32-H1 widened capability: '+key);

console.log('ROADMAP_V2_L32_H1_RELEASE_REVIEW_BINDING=PASS');
console.log(JSON.stringify({candidateIdentityBound:true,auditFields:['releaseReviewerRef','submittedReviewDecision','reasonCodes'],productionPromotion:false,productionConsumers:0,persistence:false,runtimeActivation:false},null,2));
