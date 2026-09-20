import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const contract=read('roadmap_v2/production-promotion-authorization/current-contract.json');
const schema=read('roadmap_v2/production-promotion-authorization/production-promotion-authorization-contract.schema.json');
const requestSchema=read('roadmap_v2/production-promotion-authorization/production-promotion-authorization-request.schema.json');
const resultSchema=read('roadmap_v2/production-promotion-authorization/production-promotion-authorization-result.schema.json');
const readinessContract=read('roadmap_v2/production-readiness-review/current-contract.json');
const readinessRequest=read('roadmap_v2/production-readiness-review/production-readiness-review-request.schema.json');
const readinessResult=read('roadmap_v2/production-readiness-review/production-readiness-review-result.schema.json');

assert.equal(schema.$id,'BAUMAN_ROADMAP_V2_PRODUCTION_PROMOTION_AUTHORIZATION_CONTRACT_V1');
assert.equal(contract.schema,schema.$id);
assert.equal(contract.version,'2.15.0-l35-b137');
assert.equal(requestSchema.$id,'BAUMAN_ROADMAP_V2_PRODUCTION_PROMOTION_AUTHORIZATION_REQUEST_V1');
assert.equal(resultSchema.$id,'BAUMAN_ROADMAP_V2_PRODUCTION_PROMOTION_AUTHORIZATION_RESULT_V1');
assert.equal(contract.upstreamSchemas.productionReadinessReviewContract,readinessContract.schema);
assert.equal(contract.upstreamSchemas.productionReadinessReviewRequest,readinessRequest.$id);
assert.equal(contract.upstreamSchemas.productionReadinessReviewResult,readinessResult.$id);
assert.equal(contract.upstreamSchemas.productionPromotionAuthorizationRequest,requestSchema.$id);
assert.equal(contract.upstreamSchemas.productionPromotionAuthorizationResult,resultSchema.$id);

assert.equal(contract.mode.productionIntegration,'disconnected');
assert.equal(contract.mode.authorizationReceiptOnly,true);
assert.equal(contract.mode.productionPromotionExecutionEnabled,false);
assert.equal(contract.mode.deploymentEnabled,false);
for(const key of ['persistentStoreEnabled','dashboardUiEnabled','scheduleWriteAllowed','calendarWriteAllowed','runtimeWriteAllowed','notificationWriteAllowed','automaticActionAllowed']){
  assert.equal(contract.mode[key],false,'B137 forbidden mode enabled: '+key);
}

assert.equal(contract.candidatePolicy.candidateRefPattern,'^CANDIDATE::[A-Z0-9_-]+$');
assert.equal(contract.candidatePolicy.recomputeProductionReadinessReviewFromRequest,true);
assert.equal(contract.candidatePolicy.acceptCallerSuppliedProductionReadinessReviewResult,false);
assert.equal(contract.candidatePolicy.acceptCallerSuppliedShadowProductionReady,false);
assert.equal(contract.candidatePolicy.requireShadowProductionReady,true);
assert.equal(contract.candidatePolicy.manualEligibilityOverrideAllowed,false);
assert.equal(contract.candidatePolicy.requireNestedCandidateMatch,true);

assert.equal(contract.authorizationPolicy.authorizerRefPattern,'^PRODUCTION_PROMOTION_AUTHORIZER::[A-Z0-9_-]+$');
assert.deepEqual(contract.authorizationPolicy.allowedDecisions,['authorize_receipt_only','needs_revision','rejected']);
assert.equal(contract.authorizationPolicy.upstreamBlockedState,'production_promotion_authorization_blocked_upstream');
assert.equal(contract.authorizationPolicy.authorizedState,'production_promotion_authorization_receipt_granted');
assert.equal(contract.authorizationPolicy.needsRevisionState,'production_promotion_authorization_needs_revision');
assert.equal(contract.authorizationPolicy.rejectedState,'production_promotion_authorization_rejected');
assert.equal(contract.authorizationPolicy.authorizationScope,'receipt_only_no_execution');
assert.equal(contract.authorizationPolicy.authorizedDecisionExecutesPromotion,false);
assert.equal(contract.authorizationPolicy.manualProductionOverrideAllowed,false);

for(const key of ['productionPromotionExecute','deploymentExecute','productionConsumerConnect','persistentStoreWrite','dashboardUiRender','scheduleWrite','calendarWrite','runtimeActivation','notificationWrite','automaticAction']){
  assert.equal(contract.capabilities[key],false,'B137 forbidden capability enabled: '+key);
}
assert.equal(contract.capabilities.productionPromotionAuthorizationEvaluate,true);
assert.equal(contract.capabilities.shadowAuthorizationReceiptProject,true);
assert.equal(contract.acceptance.step,137);
assert.equal(contract.acceptance.currentTrack,'L35');
assert.equal(contract.acceptance.productionConsumersConnected,0);
assert.equal(contract.acceptance.productionIntegration,'disconnected');
assert.equal(contract.acceptance.productionPromotionExecutionAllowed,false);
assert.equal(contract.acceptance.deploymentAllowed,false);
assert.equal(contract.acceptance.runtimeActivationAllowed,false);
assert.equal(contract.acceptance.result,'PASS_B137_CONTRACT');

assert.equal(requestSchema.additionalProperties,false);
assert.deepEqual(requestSchema.required,['schema','candidateRef','productionPromotionAuthorizerRef','authorizationDecision','reasonCodes','productionReadinessReviewRequest']);
assert.equal(requestSchema.properties.schema.const,requestSchema.$id);
assert.equal(requestSchema.properties.candidateRef.pattern,'^CANDIDATE::[A-Z0-9_-]+$');
assert.equal(requestSchema.properties.productionPromotionAuthorizerRef.pattern,'^PRODUCTION_PROMOTION_AUTHORIZER::[A-Z0-9_-]+$');
assert.deepEqual(requestSchema.properties.authorizationDecision.enum,['authorize_receipt_only','needs_revision','rejected']);
assert.equal(requestSchema.properties.reasonCodes.minItems,1);
assert.equal(requestSchema.properties.reasonCodes.maxItems,12);

assert.equal(resultSchema.additionalProperties,false);
for(const field of ['candidateRef','productionPromotionAuthorizerRef','submittedAuthorizationDecision','reasonCodes','productionReadinessReviewReceiptId','authorizationReceiptGranted','authorizationScope']){
  assert(resultSchema.required.includes(field),'B137 result audit field missing: '+field);
}
assert.equal(resultSchema.properties.productionPromotionAuthorizerRef.pattern,'^PRODUCTION_PROMOTION_AUTHORIZER::[A-Z0-9_-]+$');
assert.deepEqual(resultSchema.properties.submittedAuthorizationDecision.enum,['authorize_receipt_only','needs_revision','rejected']);
assert.deepEqual(resultSchema.properties.sourceProductionReadinessReviewState.enum,['production_readiness_review_blocked_upstream','production_readiness_review_needs_revision','production_readiness_review_rejected','production_readiness_review_approved_shadow_only']);
assert.deepEqual(resultSchema.properties.effectiveProductionPromotionAuthorizationState.enum,['production_promotion_authorization_blocked_upstream','production_promotion_authorization_needs_revision','production_promotion_authorization_rejected','production_promotion_authorization_receipt_granted']);
assert.equal(resultSchema.properties.authorizationScope.const,'receipt_only_no_execution');
for(const key of ['persisted','productionPromotionExecuted','deploymentExecuted','productionConsumerConnected','runtimeActionAuthorized','scheduleWriteAllowed','notificationWriteAllowed']){
  assert.equal(resultSchema.properties[key].const,false,'B137 result authority widened: '+key);
}

function walk(dir){
  if(!fs.existsSync(dir))return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const p=path.posix.join(dir,entry.name);
    return entry.isDirectory()?walk(p):[p];
  });
}
for(const p of walk('roadmap_v2')){
  assert.equal(/\.(?:js|mjs|cjs|html|css)$/i.test(p),false,'B137 executable/UI leaked into canonical Roadmap tree: '+p);
}
for(const file of [...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p))){
  const text=fs.readFileSync(file,'utf8');
  assert.equal(text.includes('roadmap_v2/production-promotion-authorization/current-contract.json'),false,'B137 Production Promotion Authorization wired into runtime: '+file);
  assert.equal(text.includes('BAUMAN_ROADMAP_V2_PRODUCTION_PROMOTION_AUTHORIZATION_CONTRACT_V1'),false,'B137 Production Promotion Authorization activation leaked into runtime: '+file);
}

console.log('ROADMAP_V2_L35_B137_PRODUCTION_PROMOTION_AUTHORIZATION_CONTRACT=PASS');
console.log(JSON.stringify({
  productionPromotionAuthorization:contract.schema,
  upstreamProductionReadinessReview:readinessContract.schema,
  authorizationScope:contract.authorizationPolicy.authorizationScope,
  productionConsumers:0,
  productionPromotionExecution:false,
  deployment:false,
  persistence:false,
  runtimeActivation:false,
  automaticAction:false
},null,2));
