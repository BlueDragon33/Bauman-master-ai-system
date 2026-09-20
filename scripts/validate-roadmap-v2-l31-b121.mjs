import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const contract=read('roadmap_v2/promotion-eligibility/current-contract.json');
const schema=read('roadmap_v2/promotion-eligibility/promotion-eligibility-contract.schema.json');
const requestSchema=read('roadmap_v2/promotion-eligibility/promotion-eligibility-request.schema.json');
const resultSchema=read('roadmap_v2/promotion-eligibility/promotion-eligibility-result.schema.json');
const humanContract=read('roadmap_v2/human-review/current-contract.json');
const humanRequest=read('roadmap_v2/human-review/human-review-request.schema.json');
const humanResult=read('roadmap_v2/human-review/human-review-result.schema.json');

assert.equal(schema.$id,'BAUMAN_ROADMAP_V2_PROMOTION_ELIGIBILITY_CONTRACT_V1');
assert.equal(contract.schema,schema.$id);
assert.equal(contract.version,'2.11.0-l31-b121');
assert.equal(requestSchema.$id,'BAUMAN_ROADMAP_V2_PROMOTION_ELIGIBILITY_REQUEST_V1');
assert.equal(resultSchema.$id,'BAUMAN_ROADMAP_V2_PROMOTION_ELIGIBILITY_RESULT_V1');
assert.equal(contract.upstreamSchemas.humanReviewContract,humanContract.schema);
assert.equal(contract.upstreamSchemas.humanReviewRequest,humanRequest.$id);
assert.equal(contract.upstreamSchemas.humanReviewResult,humanResult.$id);
assert.equal(contract.upstreamSchemas.promotionEligibilityRequest,requestSchema.$id);
assert.equal(contract.upstreamSchemas.promotionEligibilityResult,resultSchema.$id);

assert.equal(contract.mode.productionIntegration,'disconnected');
assert.equal(contract.mode.releaseReviewIntegration,'disconnected');
assert.equal(contract.mode.productionPromotionEnabled,false);
for(const key of ['persistentStoreEnabled','dashboardUiEnabled','scheduleWriteAllowed','calendarWriteAllowed','runtimeWriteAllowed','notificationWriteAllowed','automaticActionAllowed'])assert.equal(contract.mode[key],false,'B121 forbidden mode enabled: '+key);

assert.equal(contract.candidatePolicy.candidateRefPattern,'^CANDIDATE::[A-Z0-9_-]+$');
assert.equal(contract.candidatePolicy.recomputeHumanReviewFromRequest,true);
assert.equal(contract.candidatePolicy.acceptCallerSuppliedHumanReviewResult,false);
assert.equal(contract.candidatePolicy.acceptCallerSuppliedEligibilityState,false);
assert.equal(contract.candidatePolicy.manualEligibilityOverrideAllowed,false);

assert.deepEqual(contract.eligibilityPolicy,{
  review_blocked_upstream:'not_eligible_upstream_blocked',
  review_needs_revision:'not_eligible_needs_revision',
  review_rejected:'not_eligible_rejected',
  review_accepted_shadow_only:'eligible_for_release_review',
  eligibleStateAuthorizesReleaseReview:false,
  eligibleStateAuthorizesProduction:false
});

for(const key of ['releaseReviewAuthorize','productionPromotion','productionConsumerConnect','persistentStoreWrite','dashboardUiRender','scheduleWrite','calendarWrite','runtimeActivation','notificationWrite','automaticAction'])assert.equal(contract.capabilities[key],false,'B121 forbidden capability enabled: '+key);
assert.equal(contract.acceptance.step,121);
assert.equal(contract.acceptance.currentTrack,'L31');
assert.equal(contract.acceptance.productionConsumersConnected,0);
assert.equal(contract.acceptance.releaseReviewIntegration,'disconnected');
assert.equal(contract.acceptance.productionIntegration,'disconnected');
assert.equal(contract.acceptance.releaseReviewAuthorizationAllowed,false);
assert.equal(contract.acceptance.productionPromotionAllowed,false);
assert.equal(contract.acceptance.runtimeActivationAllowed,false);
assert.equal(contract.acceptance.result,'PASS_B121_CONTRACT');

assert.equal(requestSchema.additionalProperties,false);
assert.deepEqual(requestSchema.required,['schema','candidateRef','humanReviewRequest']);
assert.equal(requestSchema.properties.schema.const,requestSchema.$id);
assert.equal(requestSchema.properties.candidateRef.pattern,'^CANDIDATE::[A-Z0-9_-]+$');

assert.equal(resultSchema.additionalProperties,false);
assert.equal(resultSchema.properties.candidateRef.pattern,'^CANDIDATE::[A-Z0-9_-]+$');
assert.deepEqual(resultSchema.properties.eligibilityState.enum,['not_eligible_upstream_blocked','not_eligible_needs_revision','not_eligible_rejected','eligible_for_release_review']);
for(const key of ['persisted','releaseReviewAuthorized','productionPromotionAuthorized','productionConsumerConnected','runtimeActionAuthorized','scheduleWriteAllowed','notificationWriteAllowed'])assert.equal(resultSchema.properties[key].const,false,'B121 result authority widened: '+key);

function walk(dir){if(!fs.existsSync(dir))return [];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const p=path.posix.join(dir,entry.name);return entry.isDirectory()?walk(p):[p];});}
for(const p of walk('roadmap_v2'))assert.equal(/\.(?:js|mjs|cjs|html|css)$/i.test(p),false,'B121 executable/UI leaked into canonical Roadmap tree: '+p);
for(const file of [...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p))){
  const text=fs.readFileSync(file,'utf8');
  assert.equal(text.includes('roadmap_v2/promotion-eligibility/current-contract.json'),false,'B121 promotion eligibility wired into runtime: '+file);
  assert.equal(text.includes('BAUMAN_ROADMAP_V2_PROMOTION_ELIGIBILITY_CONTRACT_V1'),false,'B121 promotion eligibility activation leaked into runtime: '+file);
}

console.log('ROADMAP_V2_L31_B121_PROMOTION_ELIGIBILITY_CONTRACT=PASS');
console.log(JSON.stringify({promotionEligibility:contract.schema,upstreamHumanReview:humanContract.schema,releaseReviewIntegration:'disconnected',productionConsumers:0,productionPromotion:false,persistence:false,runtimeActivation:false,automaticAction:false},null,2));
