import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const contract=read('roadmap_v2/human-review/current-contract.json');
const schema=read('roadmap_v2/human-review/human-review-contract.schema.json');
const requestSchema=read('roadmap_v2/human-review/human-review-request.schema.json');
const resultSchema=read('roadmap_v2/human-review/human-review-result.schema.json');
const consumerContract=read('roadmap_v2/consumer-admission/current-contract.json');
const consumerRequest=read('roadmap_v2/consumer-admission/consumer-admission-request.schema.json');
const consumerResult=read('roadmap_v2/consumer-admission/consumer-admission-result.schema.json');

assert.equal(schema.$id,'BAUMAN_ROADMAP_V2_HUMAN_REVIEW_CONTRACT_V1');
assert.equal(contract.schema,schema.$id);
assert.equal(contract.version,'2.10.0-l30-b117');
assert.equal(requestSchema.$id,'BAUMAN_ROADMAP_V2_HUMAN_REVIEW_REQUEST_V1');
assert.equal(resultSchema.$id,'BAUMAN_ROADMAP_V2_HUMAN_REVIEW_RESULT_V1');
assert.equal(contract.upstreamSchemas.consumerAdmissionContract,consumerContract.schema);
assert.equal(contract.upstreamSchemas.consumerAdmissionRequest,consumerRequest.$id);
assert.equal(contract.upstreamSchemas.consumerAdmissionResult,consumerResult.$id);
assert.equal(contract.upstreamSchemas.humanReviewRequest,requestSchema.$id);
assert.equal(contract.upstreamSchemas.humanReviewResult,resultSchema.$id);

assert.equal(contract.mode.productionIntegration,'disconnected');
assert.equal(contract.mode.humanReviewOnly,true);
assert.equal(contract.mode.productionPromotionEnabled,false);
for(const key of ['persistentStoreEnabled','dashboardUiEnabled','scheduleWriteAllowed','calendarWriteAllowed','runtimeWriteAllowed','notificationWriteAllowed','automaticActionAllowed'])assert.equal(contract.mode[key],false,'B117 forbidden mode enabled: '+key);

assert.equal(contract.reviewPolicy.recomputeConsumerAdmissionFromRequest,true);
assert.equal(contract.reviewPolicy.acceptCallerSuppliedConsumerAdmissionResult,false);
assert.equal(contract.reviewPolicy.acceptCallerSuppliedConsumerDecision,false);
assert.equal(contract.reviewPolicy.reviewerRefPattern,'^REVIEWER::[A-Z0-9_-]+$');
assert.deepEqual(contract.reviewPolicy.allowedSubmittedDecisions,['needs_revision','accepted_for_shadow_analysis','rejected']);
assert.equal(contract.reviewPolicy.reasonCodesRequired,true);
assert.equal(contract.reviewPolicy.acceptanceRequiresUpstreamReady,true);
assert.equal(contract.reviewPolicy.acceptedDecisionAuthorizesProduction,false);
assert.equal(contract.reviewPolicy.manualProductionOverrideAllowed,false);

assert.deepEqual(contract.decisionPolicy,{
  upstreamNotReady:'review_blocked_upstream',
  needs_revision:'review_needs_revision',
  accepted_for_shadow_analysis:'review_accepted_shadow_only',
  rejected:'review_rejected',
  acceptedShadowOnlyAuthorizesProduction:false
});

for(const key of ['productionPromotion','productionConsumerConnect','persistentStoreWrite','dashboardUiRender','scheduleWrite','calendarWrite','runtimeActivation','notificationWrite','automaticAction'])assert.equal(contract.capabilities[key],false,'B117 forbidden capability enabled: '+key);
assert.equal(contract.acceptance.step,117);
assert.equal(contract.acceptance.currentTrack,'L30');
assert.equal(contract.acceptance.productionConsumersConnected,0);
assert.equal(contract.acceptance.productionIntegration,'disconnected');
assert.equal(contract.acceptance.productionPromotionAllowed,false);
assert.equal(contract.acceptance.runtimeActivationAllowed,false);
assert.equal(contract.acceptance.result,'PASS_B117_CONTRACT');

assert.equal(requestSchema.additionalProperties,false);
assert.deepEqual(requestSchema.required,['schema','reviewerRef','reviewDecision','reasonCodes','consumerAdmissionRequest']);
assert.equal(requestSchema.properties.schema.const,requestSchema.$id);
assert.equal(requestSchema.properties.reviewerRef.pattern,'^REVIEWER::[A-Z0-9_-]+$');
assert.deepEqual(requestSchema.properties.reviewDecision.enum,['needs_revision','accepted_for_shadow_analysis','rejected']);
assert.equal(requestSchema.properties.reasonCodes.minItems,1);
assert.equal(requestSchema.properties.reasonCodes.uniqueItems,true);

assert.equal(resultSchema.additionalProperties,false);
assert.equal(resultSchema.properties.reviewerRef.pattern,'^REVIEWER::[A-Z0-9_-]+$');
assert.deepEqual(resultSchema.properties.effectiveReviewState.enum,['review_blocked_upstream','review_needs_revision','review_accepted_shadow_only','review_rejected']);
for(const key of ['persisted','productionPromotionAuthorized','productionConsumerConnected','runtimeActionAuthorized','scheduleWriteAllowed','notificationWriteAllowed'])assert.equal(resultSchema.properties[key].const,false,'B117 result authority widened: '+key);

function walk(dir){
  if(!fs.existsSync(dir))return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const p=path.posix.join(dir,entry.name);return entry.isDirectory()?walk(p):[p];});
}
for(const p of walk('roadmap_v2'))assert.equal(/\.(?:js|mjs|cjs|html|css)$/i.test(p),false,'B117 executable/UI leaked into canonical Roadmap tree: '+p);
for(const file of [...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p))){
  const text=fs.readFileSync(file,'utf8');
  assert.equal(text.includes('roadmap_v2/human-review/current-contract.json'),false,'B117 Human Review contract wired into runtime: '+file);
  assert.equal(text.includes('BAUMAN_ROADMAP_V2_HUMAN_REVIEW_CONTRACT_V1'),false,'B117 Human Review activation leaked into runtime: '+file);
  assert.equal(text.includes('BAUMAN_ROADMAP_V2_HUMAN_REVIEW_REQUEST_V1'),false,'B117 Human Review request activation leaked into runtime: '+file);
}

console.log('ROADMAP_V2_L30_B117_HUMAN_REVIEW_CONTRACT=PASS');
console.log(JSON.stringify({
  humanReview:contract.schema,requestSchema:requestSchema.$id,
  upstreamConsumerAdmission:consumerContract.schema,
  reviewDecisions:contract.reviewPolicy.allowedSubmittedDecisions,
  productionConsumers:0,productionPromotion:false,persistence:false,dashboardUi:false,
  scheduleWrite:false,calendarWrite:false,runtimeActivation:false,notificationWrite:false,automaticAction:false
},null,2));
