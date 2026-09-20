import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const contract=read('roadmap_v2/consumer-admission/current-contract.json');
const schema=read('roadmap_v2/consumer-admission/consumer-admission-contract.schema.json');
const requestSchema=read('roadmap_v2/consumer-admission/consumer-admission-request.schema.json');
const resultSchema=read('roadmap_v2/consumer-admission/consumer-admission-result.schema.json');
const admission=read('roadmap_v2/admission/current-contract.json');
const admissionResult=read('roadmap_v2/admission/admission-result.schema.json');
const readinessRequest=read('roadmap_v2/readiness/readiness-request.schema.json');

assert.equal(schema.$id,'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_CONTRACT_V1');
assert.equal(contract.schema,schema.$id);
assert.equal(contract.version,'2.9.1-l29-b113-h1');
assert.equal(requestSchema.$id,'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V1');
assert.equal(resultSchema.$id,'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_RESULT_V1');

assert.equal(contract.upstreamSchemas.admissionContract,admission.schema);
assert.equal(contract.upstreamSchemas.admissionResult,admissionResult.$id);
assert.equal(contract.upstreamSchemas.readinessRequest,readinessRequest.$id);
assert.equal(contract.upstreamSchemas.consumerAdmissionRequest,requestSchema.$id);
assert.equal(contract.upstreamSchemas.consumerAdmissionResult,resultSchema.$id);

assert.equal(contract.mode.productionIntegration,'disconnected');
assert.equal(contract.mode.shadowConsumerOnly,true);
assert.equal(contract.mode.productionConsumerAdapterEnabled,false);
assert.equal(contract.mode.persistentStoreEnabled,false);
assert.equal(contract.mode.dashboardUiEnabled,false);
assert.equal(contract.mode.scheduleWriteAllowed,false);
assert.equal(contract.mode.calendarWriteAllowed,false);
assert.equal(contract.mode.runtimeWriteAllowed,false);
assert.equal(contract.mode.notificationWriteAllowed,false);
assert.equal(contract.mode.automaticActionAllowed,false);

assert.equal(contract.candidatePolicy.recomputeAdmissionFromReadinessRequest,true);
assert.equal(contract.candidatePolicy.requestSchemaRequired,true);
assert.equal(contract.candidatePolicy.acceptCallerSuppliedAdmissionResult,false);
assert.equal(contract.candidatePolicy.acceptCallerSuppliedAdmissionState,false);
assert.equal(contract.candidatePolicy.acceptCallerSuppliedConsumerDecision,false);
assert.deepEqual(contract.candidatePolicy.allowedShadowConsumerClasses,['human_review_shadow']);
assert.equal(contract.candidatePolicy.consumerIdPattern,'^SHADOW::[A-Z0-9_-]+$');
assert.deepEqual(contract.candidatePolicy.productionConsumerIds,[]);
assert.equal(contract.candidatePolicy.planningBridgeAdmitted,false);
assert.equal(contract.candidatePolicy.safeShellAdmitted,false);
assert.equal(contract.candidatePolicy.subjectRuntimeAdmitted,false);
assert.equal(contract.candidatePolicy.directUiRenderAdmitted,false);
assert.equal(contract.candidatePolicy.manualOverrideAllowed,false);

assert.deepEqual(contract.decisionPolicy,{
  blocked:'shadow_review_blocked',
  caution:'shadow_review_caution',
  ready_for_human_review:'shadow_review_ready_for_human_review',
  greenAuthorizesAutomaticAction:false,
  greenAuthorizesRuntimeActivation:false,
  consumerDecisionAuthorizesWrite:false
});

for(const key of ['productionConsumerConnect','persistentStoreWrite','dashboardUiRender','scheduleWrite','calendarWrite','runtimeActivation','notificationWrite','automaticAction']){
  assert.equal(contract.capabilities[key],false,`Forbidden B113 capability enabled: ${key}`);
}

assert.equal(contract.acceptance.step,113);
assert.equal(contract.acceptance.currentTrack,'L29');
assert.equal(contract.acceptance.productionConsumersConnected,0);
assert.equal(contract.acceptance.productionIntegration,'disconnected');
assert.equal(contract.acceptance.runtimeActivationAllowed,false);
assert.equal(contract.acceptance.result,'PASS_B113_CONTRACT');
assert.equal(contract.acceptance.requestSchemaPinned,true);

assert.equal(requestSchema.additionalProperties,false);
assert.deepEqual(requestSchema.required,['schema','consumerId','consumerClass','readinessRequest']);
assert.equal(requestSchema.properties.schema.const,requestSchema.$id);
assert.equal(requestSchema.properties.consumerId.pattern,'^SHADOW::[A-Z0-9_-]+$');
assert.equal(requestSchema.properties.consumerClass.const,'human_review_shadow');

assert.equal(resultSchema.additionalProperties,false);
assert.equal(resultSchema.properties.consumerId.pattern,'^SHADOW::[A-Z0-9_-]+$');
assert.equal(resultSchema.properties.consumerClass.const,'human_review_shadow');
for(const key of ['persisted','productionConsumerConnected','runtimeActionAuthorized','scheduleWriteAllowed','notificationWriteAllowed']){
  assert.equal(resultSchema.properties[key].const,false,`B113 result schema widened authority: ${key}`);
}

function walk(dir){
  if(!fs.existsSync(dir))return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const p=path.posix.join(dir,entry.name);
    return entry.isDirectory()?walk(p):[p];
  });
}

for(const p of walk('roadmap_v2')){
  assert.equal(/\.(?:js|mjs|cjs|html|css)$/i.test(p),false,`B113 executable/UI leaked into canonical Roadmap tree: ${p}`);
}

for(const file of [
  ...(fs.existsSync('index.html')?['index.html']:[]),
  ...walk('assets'),
  ...walk('subjects')
].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p))){
  const text=fs.readFileSync(file,'utf8');
  assert.equal(text.includes('roadmap_v2/consumer-admission/current-contract.json'),false,`B113 consumer-admission contract wired into runtime: ${file}`);
  assert.equal(text.includes('BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_CONTRACT_V1'),false,`B113 consumer-admission activation leaked into runtime: ${file}`);
  assert.equal(text.includes('BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V1'),false,`B113 consumer-admission request activation leaked into runtime: ${file}`);
}

console.log('ROADMAP_V2_L29_B113_CONSUMER_ADMISSION_CONTRACT=PASS');
console.log(JSON.stringify({
  consumerAdmission:contract.schema,
  requestSchema:requestSchema.$id,
  upstreamAdmission:admission.schema,
  allowedShadowConsumerClasses:contract.candidatePolicy.allowedShadowConsumerClasses,
  productionConsumers:0,
  planningBridge:false,
  safeShell:false,
  subjectRuntime:false,
  persistence:false,
  dashboardUi:false,
  scheduleWrite:false,
  calendarWrite:false,
  runtimeActivation:false,
  notificationWrite:false,
  automaticAction:false
},null,2));
