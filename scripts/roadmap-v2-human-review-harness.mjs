import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadCurrentConsumerAdmissionHarness} from './roadmap-v2-consumer-admission-harness.mjs';

function deepFreeze(value,seen=new WeakSet()){
  if(!value||typeof value!=='object'||seen.has(value))return value;
  seen.add(value);
  for(const child of Object.values(value))deepFreeze(child,seen);
  return Object.freeze(value);
}
function clone(value){return value===undefined?undefined:structuredClone(value);}
function readJson(file,label){
  if(!fs.existsSync(file))throw new Error(`Missing current Human Review file: ${label}`);
  try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{throw new Error(`Invalid current Human Review JSON: ${label}`);}
}

export function loadCurrentHumanReviewHarness(options={}){
  const root=options.rootDir||process.cwd();
  const contract=readJson(`${root}/roadmap_v2/human-review/current-contract.json`,'Human Review contract');
  const contractSchema=readJson(`${root}/roadmap_v2/human-review/human-review-contract.schema.json`,'Human Review contract schema');
  const requestSchema=readJson(`${root}/roadmap_v2/human-review/human-review-request.schema.json`,'Human Review request schema');
  const resultSchema=readJson(`${root}/roadmap_v2/human-review/human-review-result.schema.json`,'Human Review result schema');
  const consumer=loadCurrentConsumerAdmissionHarness({rootDir:root});

  assert.equal(contract.schema,contractSchema.$id,'Human Review contract/schema mismatch');
  assert.equal(contract.upstreamSchemas.consumerAdmissionContract,consumer.contract.schema,'Human Review/Consumer Admission contract mismatch');
  assert.equal(contract.upstreamSchemas.consumerAdmissionRequest,consumer.requestSchema.$id,'Human Review/Consumer Admission request mismatch');
  assert.equal(contract.upstreamSchemas.consumerAdmissionResult,consumer.resultSchema.$id,'Human Review/Consumer Admission result mismatch');
  assert.equal(contract.upstreamSchemas.humanReviewRequest,requestSchema.$id,'Human Review request schema mismatch');
  assert.equal(contract.upstreamSchemas.humanReviewResult,resultSchema.$id,'Human Review result schema mismatch');
  assert.equal(contract.mode.productionIntegration,'disconnected','Human Review production boundary widened');
  assert.equal(contract.mode.humanReviewOnly,true,'Human Review-only boundary widened');
  assert.equal(contract.mode.productionPromotionEnabled,false,'Human Review production promotion enabled');
  assert.equal(contract.mode.persistentStoreEnabled,false,'Human Review persistence enabled');
  assert.equal(contract.mode.dashboardUiEnabled,false,'Human Review dashboard enabled');
  assert.equal(contract.mode.scheduleWriteAllowed,false,'Human Review schedule write enabled');
  assert.equal(contract.mode.calendarWriteAllowed,false,'Human Review calendar write enabled');
  assert.equal(contract.mode.runtimeWriteAllowed,false,'Human Review runtime write enabled');
  assert.equal(contract.mode.notificationWriteAllowed,false,'Human Review notification write enabled');
  assert.equal(contract.mode.automaticActionAllowed,false,'Human Review automatic action enabled');

  const allowedKeys=new Set(requestSchema.required);
  const allowedDecisions=new Set(contract.reviewPolicy.allowedSubmittedDecisions);
  const validateRequest=input=>{
    assert(input&&typeof input==='object'&&!Array.isArray(input),'Invalid Human Review request');
    const unexpected=Object.keys(input).filter(key=>!allowedKeys.has(key));
    assert.equal(unexpected.length,0,`Human Review request contains unsupported fields: ${unexpected.join(', ')}`);
    assert.equal(input.schema,requestSchema.$id,'Human Review request schema mismatch');
    assert.match(input.reviewerRef,/^REVIEWER::[A-Z0-9_-]+$/,'Human Review reviewer reference outside REVIEWER namespace');
    assert(allowedDecisions.has(input.reviewDecision),'Unsupported Human Review decision');
    assert(Array.isArray(input.reasonCodes),'Human Review reason codes must be an array');
    assert(input.reasonCodes.length>=1&&input.reasonCodes.length<=16,'Human Review reason codes count out of range');
    assert.equal(new Set(input.reasonCodes).size,input.reasonCodes.length,'Duplicate Human Review reason code');
    for(const reason of input.reasonCodes){
      assert.equal(typeof reason,'string','Invalid Human Review reason code');
      assert.match(reason,/^[A-Z0-9_:-]+$/,'Invalid Human Review reason code');
    }
    assert(input.consumerAdmissionRequest&&typeof input.consumerAdmissionRequest==='object'&&!Array.isArray(input.consumerAdmissionRequest),'Missing Human Review Consumer Admission request');
    assert.equal(input.consumerAdmissionRequest.schema,consumer.requestSchema.$id,'Nested Consumer Admission request schema mismatch');
    return clone(input);
  };

  const projectHumanReview=input=>{
    const request=validateRequest(input);
    const upstream=consumer.projectShadowConsumer(request.consumerAdmissionRequest);
    assert.equal(upstream.persisted,false,'Persisted Consumer Admission result reached Human Review');
    assert.equal(upstream.productionConsumerConnected,false,'Production consumer reached Human Review');
    assert.equal(upstream.runtimeActionAuthorized,false,'Consumer Admission authorized runtime action before Human Review');
    assert.equal(upstream.scheduleWriteAllowed,false,'Consumer Admission authorized schedule write before Human Review');
    assert.equal(upstream.notificationWriteAllowed,false,'Consumer Admission authorized notification write before Human Review');

    const upstreamReady=
      upstream.readinessColor==='green'&&
      upstream.advisoryState==='ready_for_human_review'&&
      upstream.consumerDecision==='shadow_review_ready_for_human_review';

    let effectiveReviewState;
    if(request.reviewDecision==='accepted_for_shadow_analysis'&&!upstreamReady){
      effectiveReviewState=contract.decisionPolicy.upstreamNotReady;
    }else{
      effectiveReviewState=contract.decisionPolicy[request.reviewDecision];
    }
    assert(
      ['review_blocked_upstream','review_needs_revision','review_accepted_shadow_only','review_rejected'].includes(effectiveReviewState),
      `Unsupported Human Review effective state: ${effectiveReviewState}`
    );

    const reasonCodes=clone(request.reasonCodes);
    const receiptId=[
      'HUMAN_REVIEW',
      request.reviewerRef,
      upstream.projectionId,
      request.reviewDecision,
      reasonCodes.join('+')
    ].join('::');

    const result={
      schema:resultSchema.$id,
      receiptId,
      reviewerRef:request.reviewerRef,
      consumerAdmissionProjectionId:upstream.projectionId,
      reportId:upstream.reportId,
      phaseId:upstream.phaseId,
      weekStart:upstream.weekStart,
      sourceReadinessColor:upstream.readinessColor,
      sourceConsumerDecision:upstream.consumerDecision,
      submittedReviewDecision:request.reviewDecision,
      effectiveReviewState,
      reasonCodes,
      persisted:false,
      productionPromotionAuthorized:false,
      productionConsumerConnected:false,
      runtimeActionAuthorized:false,
      scheduleWriteAllowed:false,
      notificationWriteAllowed:false
    };

    assert.equal(result.persisted,false);
    assert.equal(result.productionPromotionAuthorized,false);
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
    consumer,
    validateRequest,
    projectHumanReview
  });
}
