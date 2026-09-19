import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadCurrentAdmissionHarness} from './roadmap-v2-admission-harness.mjs';

function deepFreeze(value,seen=new WeakSet()){
  if(!value||typeof value!=='object'||seen.has(value))return value;
  seen.add(value);
  for(const child of Object.values(value))deepFreeze(child,seen);
  return Object.freeze(value);
}
function clone(value){return value===undefined?undefined:structuredClone(value);}
function readJson(file,label){
  if(!fs.existsSync(file))throw new Error(`Missing current Consumer Admission file: ${label}`);
  try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{throw new Error(`Invalid current Consumer Admission JSON: ${label}`);}
}

export function loadCurrentConsumerAdmissionHarness(options={}){
  const root=options.rootDir||process.cwd();
  const contract=readJson(`${root}/roadmap_v2/consumer-admission/current-contract.json`,'Consumer Admission contract');
  const contractSchema=readJson(`${root}/roadmap_v2/consumer-admission/consumer-admission-contract.schema.json`,'Consumer Admission contract schema');
  const requestSchema=readJson(`${root}/roadmap_v2/consumer-admission/consumer-admission-request.schema.json`,'Consumer Admission request schema');
  const resultSchema=readJson(`${root}/roadmap_v2/consumer-admission/consumer-admission-result.schema.json`,'Consumer Admission result schema');
  const admission=loadCurrentAdmissionHarness({rootDir:root});

  assert.equal(contract.schema,contractSchema.$id,'Consumer Admission contract/schema mismatch');
  assert.equal(contract.upstreamSchemas.admissionContract,admission.contract.schema,'Consumer Admission/Admission contract mismatch');
  assert.equal(contract.upstreamSchemas.admissionResult,admission.resultSchema.$id,'Consumer Admission/Admission result mismatch');
  assert.equal(contract.upstreamSchemas.consumerAdmissionRequest,requestSchema.$id,'Consumer Admission request schema mismatch');
  assert.equal(contract.upstreamSchemas.consumerAdmissionResult,resultSchema.$id,'Consumer Admission result schema mismatch');
  assert.equal(contract.mode.productionIntegration,'disconnected','Consumer Admission production boundary widened');
  assert.equal(contract.mode.shadowConsumerOnly,true,'Consumer Admission shadow-only boundary widened');
  assert.equal(contract.mode.productionConsumerAdapterEnabled,false,'Production Consumer Admission adapter enabled');
  assert.equal(contract.mode.persistentStoreEnabled,false,'Consumer Admission persistence enabled');
  assert.equal(contract.mode.dashboardUiEnabled,false,'Consumer Admission dashboard enabled');
  assert.equal(contract.mode.scheduleWriteAllowed,false,'Consumer Admission schedule write enabled');
  assert.equal(contract.mode.calendarWriteAllowed,false,'Consumer Admission calendar write enabled');
  assert.equal(contract.mode.runtimeWriteAllowed,false,'Consumer Admission runtime write enabled');
  assert.equal(contract.mode.notificationWriteAllowed,false,'Consumer Admission notification write enabled');
  assert.equal(contract.mode.automaticActionAllowed,false,'Consumer Admission automatic action enabled');

  const allowedKeys=new Set(requestSchema.required);
  const validateRequest=input=>{
    assert(input&&typeof input==='object'&&!Array.isArray(input),'Invalid Consumer Admission request');
    const unexpected=Object.keys(input).filter(key=>!allowedKeys.has(key));
    assert.equal(unexpected.length,0,`Consumer Admission request contains unsupported fields: ${unexpected.join(', ')}`);
    assert.equal(input.schema,requestSchema.$id,'Consumer Admission request schema mismatch');
    assert.match(input.consumerId,/^SHADOW::[A-Z0-9_-]+$/,'Consumer Admission consumer ID outside SHADOW namespace');
    assert.equal(input.consumerClass,'human_review_shadow','Unsupported Consumer Admission class');
    assert(input.readinessRequest&&typeof input.readinessRequest==='object'&&!Array.isArray(input.readinessRequest),'Missing Consumer Admission Readiness request');
    assert.equal(input.readinessRequest.schema,contract.upstreamSchemas.readinessRequest,'Nested Readiness request schema mismatch');
    return clone(input);
  };

  const projectShadowConsumer=input=>{
    const request=validateRequest(input);
    const advisory=admission.projectAdvisory(request.readinessRequest);
    assert.equal(advisory.persisted,false,'Persisted Admission advisory reached shadow consumer');
    assert.equal(advisory.productionConsumerConnected,false,'Production consumer reached shadow adapter');
    assert.equal(advisory.runtimeActionAuthorized,false,'Admission advisory authorized runtime action');
    assert.equal(advisory.scheduleWriteAllowed,false,'Admission advisory authorized schedule write');
    assert.equal(advisory.notificationWriteAllowed,false,'Admission advisory authorized notification write');

    const consumerDecision=contract.decisionPolicy[advisory.advisoryState];
    assert(
      ['shadow_review_blocked','shadow_review_caution','shadow_review_ready_for_human_review'].includes(consumerDecision),
      `Unsupported Consumer Admission advisory state: ${advisory.advisoryState}`
    );

    const result={
      schema:resultSchema.$id,
      projectionId:`CONSUMER_ADMISSION::${request.consumerId}::${advisory.projectionId}`,
      consumerId:request.consumerId,
      consumerClass:request.consumerClass,
      admissionProjectionId:advisory.projectionId,
      reportId:advisory.reportId,
      phaseId:advisory.phaseId,
      weekStart:advisory.weekStart,
      readinessColor:advisory.readinessColor,
      advisoryState:advisory.advisoryState,
      consumerDecision,
      persisted:false,
      productionConsumerConnected:false,
      runtimeActionAuthorized:false,
      scheduleWriteAllowed:false,
      notificationWriteAllowed:false
    };

    assert.equal(result.persisted,false);
    assert.equal(result.productionConsumerConnected,false);
    assert.equal(result.runtimeActionAuthorized,false);
    assert.equal(result.scheduleWriteAllowed,false);
    assert.equal(result.notificationWriteAllowed,false);
    return deepFreeze(result);
  };

  return Object.freeze({
    contract:deepFreeze(clone(contract)),
    contractSchema:deepFreeze(clone(contractSchema)),
    requestSchema:deepFreeze(clone(requestSchema)),
    resultSchema:deepFreeze(clone(resultSchema)),
    admission,
    validateRequest,
    projectShadowConsumer
  });
}
