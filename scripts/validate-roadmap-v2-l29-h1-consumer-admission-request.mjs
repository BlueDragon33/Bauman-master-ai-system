import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const contract=read('roadmap_v2/consumer-admission/current-contract.json');
const requestSchema=read('roadmap_v2/consumer-admission/consumer-admission-request.schema.json');
const readinessRequest=read('roadmap_v2/readiness/readiness-request.schema.json');

assert.equal(requestSchema.$id,'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V1');
assert.equal(requestSchema.type,'object');
assert.equal(requestSchema.additionalProperties,false);
assert.deepEqual(requestSchema.required,['schema','consumerId','consumerClass','readinessRequest']);
assert.equal(requestSchema.properties.schema.const,requestSchema.$id);
assert.equal(requestSchema.properties.consumerId.pattern,'^SHADOW::[A-Z0-9_-]+$');
assert.equal(requestSchema.properties.consumerClass.const,'human_review_shadow');
assert.equal(requestSchema.properties.readinessRequest.type,'object');

assert.equal(contract.version,'2.9.1-l29-b113-h1');
assert.equal(contract.upstreamSchemas.consumerAdmissionRequest,requestSchema.$id);
assert.equal(contract.upstreamSchemas.readinessRequest,readinessRequest.$id);
assert.equal(contract.candidatePolicy.requestSchemaRequired,true);
assert.deepEqual(contract.candidatePolicy.allowedShadowConsumerClasses,['human_review_shadow']);
assert.deepEqual(contract.candidatePolicy.productionConsumerIds,[]);
assert.equal(contract.candidatePolicy.acceptCallerSuppliedAdmissionResult,false);
assert.equal(contract.candidatePolicy.acceptCallerSuppliedAdmissionState,false);
assert.equal(contract.candidatePolicy.acceptCallerSuppliedConsumerDecision,false);
assert.equal(contract.acceptance.requestSchemaPinned,true);

const allowedKeys=new Set(requestSchema.required);
const validateEnvelope=input=>{
  assert(input&&typeof input==='object'&&!Array.isArray(input),'Invalid Consumer Admission request');
  const unexpected=Object.keys(input).filter(key=>!allowedKeys.has(key));
  assert.equal(unexpected.length,0,`Consumer Admission request contains unsupported fields: ${unexpected.join(', ')}`);
  assert.equal(input.schema,requestSchema.$id,'Consumer Admission request schema mismatch');
  assert.match(input.consumerId,/^SHADOW::[A-Z0-9_-]+$/,'Consumer Admission consumer ID outside SHADOW namespace');
  assert.equal(input.consumerClass,'human_review_shadow','Unsupported Consumer Admission class');
  assert(input.readinessRequest&&typeof input.readinessRequest==='object'&&!Array.isArray(input.readinessRequest),'Missing Consumer Admission Readiness request');
  assert.equal(input.readinessRequest.schema,readinessRequest.$id,'Nested Readiness request schema mismatch');
  return structuredClone(input);
};

const valid={
  schema:requestSchema.$id,
  consumerId:'SHADOW::HUMAN_REVIEW',
  consumerClass:'human_review_shadow',
  readinessRequest:{
    schema:readinessRequest.$id,
    reportId:'L29-H1-PROBE',
    phaseId:'GD2',
    focusTargetIds:['RU-R0-C01'],
    scheduleRequest:{},
    externalGates:[]
  }
};
assert.deepEqual(validateEnvelope(valid),valid);

for(const forged of [
  {...valid,consumerId:'PLANNING_BRIDGE'},
  {...valid,consumerClass:'planning_bridge'},
  {...valid,admissionResult:{advisoryState:'ready_for_human_review'}},
  {...valid,consumerDecision:'shadow_review_ready_for_human_review'},
  {...valid,persisted:true}
]){
  assert.throws(()=>validateEnvelope(forged));
}

function walk(dir){
  if(!fs.existsSync(dir))return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const p=path.posix.join(dir,entry.name);
    return entry.isDirectory()?walk(p):[p];
  });
}
for(const p of walk('roadmap_v2')){
  assert.equal(/\.(?:js|mjs|cjs|html|css)$/i.test(p),false,`L29-H1 executable/UI leaked into canonical Roadmap tree: ${p}`);
}
for(const file of [
  ...(fs.existsSync('index.html')?['index.html']:[]),
  ...walk('assets'),
  ...walk('subjects')
].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p))){
  const text=fs.readFileSync(file,'utf8');
  assert.equal(text.includes('BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V1'),false,`L29-H1 request activation leaked into runtime: ${file}`);
}

console.log('ROADMAP_V2_L29_H1_CONSUMER_ADMISSION_REQUEST=PASS');
console.log(JSON.stringify({
  requestSchema:requestSchema.$id,
  allowedKeys:[...allowedKeys],
  consumerNamespace:'SHADOW::*',
  consumerClass:'human_review_shadow',
  productionConsumers:0,
  runtimeWiring:0
},null,2));
