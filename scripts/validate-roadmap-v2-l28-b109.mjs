import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const contract=read('roadmap_v2/admission/current-contract.json');
const schema=read('roadmap_v2/admission/admission-contract.schema.json');
const resultSchema=read('roadmap_v2/admission/admission-result.schema.json');
const readiness=read('roadmap_v2/readiness/current-contract.json');
const readinessRequest=read('roadmap_v2/readiness/readiness-request.schema.json');
const readinessResult=read('roadmap_v2/readiness/readiness-result.schema.json');

assert.equal(schema.$id,'BAUMAN_ROADMAP_V2_ADMISSION_CONTRACT_V1');
assert.equal(contract.schema,schema.$id);
assert.equal(contract.version,'2.8.0-l28-b109');
assert.equal(resultSchema.$id,'BAUMAN_ROADMAP_V2_ADMISSION_RESULT_V1');

assert.equal(contract.upstreamSchemas.readinessContract,readiness.schema);
assert.equal(contract.upstreamSchemas.readinessRequest,readinessRequest.$id);
assert.equal(contract.upstreamSchemas.readinessResult,readinessResult.$id);
assert.equal(contract.upstreamSchemas.admissionResult,resultSchema.$id);

assert.equal(contract.mode.productionIntegration,'disconnected');
assert.equal(contract.mode.consumerAdapterEnabled,false);
assert.equal(contract.mode.persistentStoreEnabled,false);
assert.equal(contract.mode.dashboardUiEnabled,false);
assert.equal(contract.mode.scheduleWriteAllowed,false);
assert.equal(contract.mode.calendarWriteAllowed,false);
assert.equal(contract.mode.runtimeWriteAllowed,false);
assert.equal(contract.mode.notificationWriteAllowed,false);
assert.equal(contract.mode.automaticActionAllowed,false);

assert.equal(contract.admissionPolicy.recomputeReadinessFromRequest,true);
assert.equal(contract.admissionPolicy.acceptCallerSuppliedReadinessResult,false);
assert.equal(contract.admissionPolicy.acceptCallerSuppliedReadinessColor,false);
assert.equal(contract.admissionPolicy.persistedReadinessAccepted,false);
assert.equal(contract.admissionPolicy.manualOverrideAllowed,false);

assert.deepEqual(contract.decisionPolicy,{
  red:'blocked',
  yellow:'caution',
  green:'ready_for_human_review',
  greenAuthorizesAutomaticAction:false,
  greenAuthorizesRuntimeActivation:false,
  redOrYellowMutatesSchedule:false
});

assert.deepEqual(contract.consumerPolicy.productionConsumerIds,[]);
assert.equal(contract.consumerPolicy.planningBridgeAdmitted,false);
assert.equal(contract.consumerPolicy.safeShellAdmitted,false);
assert.equal(contract.consumerPolicy.subjectRuntimeAdmitted,false);
assert.equal(contract.consumerPolicy.directUiRenderAdmitted,false);
assert.equal(contract.consumerPolicy.futureConsumerRequiresSeparateAdmissionGate,true);

for(const key of ['productionConsumerConnect','persistentStoreWrite','dashboardUiRender','scheduleWrite','calendarWrite','runtimeActivation','notificationWrite','automaticAction']){
  assert.equal(contract.capabilities[key],false,`Forbidden B109 capability enabled: ${key}`);
}
assert.equal(contract.acceptance.step,109);
assert.equal(contract.acceptance.currentTrack,'L28');
assert.equal(contract.acceptance.productionConsumersConnected,0);
assert.equal(contract.acceptance.result,'PASS_B109_CONTRACT');

const serialized=JSON.stringify(contract);
for(const forbidden of [
  'BAUMAN_ROADMAP_V2_READINESS_MANIFEST',
  'consumerManifestSha256',
  'baselineSha',
  'baselineHash'
]) assert.equal(serialized.includes(forbidden),false,`B109 stale identity/hash dependency: ${forbidden}`);

function walk(dir){
  if(!fs.existsSync(dir))return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
    const p=path.posix.join(dir,e.name);
    return e.isDirectory()?walk(p):[p];
  });
}
for(const p of walk('roadmap_v2')){
  assert.equal(/\.(?:js|mjs|cjs|html|css)$/i.test(p),false,`B109 executable/UI leaked into canonical Roadmap tree: ${p}`);
}
for(const file of [
  ...(fs.existsSync('index.html')?['index.html']:[]),
  ...walk('assets'),
  ...walk('subjects')
].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p))){
  const text=fs.readFileSync(file,'utf8');
  assert.equal(text.includes('roadmap_v2/admission/current-contract.json'),false,`B109 admission contract wired into runtime: ${file}`);
  assert.equal(text.includes('BAUMAN_ROADMAP_V2_ADMISSION_CONTRACT_V1'),false,`B109 admission activation leaked into runtime: ${file}`);
}

console.log('ROADMAP_V2_L28_B109_ADMISSION_CONTRACT=PASS');
console.log(JSON.stringify({
  admission:contract.schema,
  readiness:readiness.schema,
  resultSchema:resultSchema.$id,
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
