import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadCurrentPromotionReviewHarness} from './roadmap-v2-promotion-review-harness.mjs';

function deepFreeze(value,seen=new WeakSet()){
  if(!value||typeof value!=='object'||seen.has(value))return value;
  seen.add(value);
  for(const child of Object.values(value))deepFreeze(child,seen);
  return Object.freeze(value);
}
function clone(value){return value===undefined?undefined:structuredClone(value);}
function readJson(file,label){
  if(!fs.existsSync(file))throw new Error('Missing current Production Readiness Review file: '+label);
  try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{throw new Error('Invalid current Production Readiness Review JSON: '+label);}
}

export function loadCurrentProductionReadinessReviewHarness(options={}){
  const root=options.rootDir||process.cwd();
  const contract=readJson(root+'/roadmap_v2/production-readiness-review/current-contract.json','Production Readiness Review contract');
  const contractSchema=readJson(root+'/roadmap_v2/production-readiness-review/production-readiness-review-contract.schema.json','Production Readiness Review contract schema');
  const requestSchema=readJson(root+'/roadmap_v2/production-readiness-review/production-readiness-review-request.schema.json','Production Readiness Review request schema');
  const resultSchema=readJson(root+'/roadmap_v2/production-readiness-review/production-readiness-review-result.schema.json','Production Readiness Review result schema');
  const promotion=loadCurrentPromotionReviewHarness({rootDir:root});

  assert.equal(contract.schema,contractSchema.$id,'Production Readiness Review contract/schema mismatch');
  assert.equal(contract.upstreamSchemas.promotionReviewContract,promotion.contract.schema,'Production Readiness Review/Promotion Review contract mismatch');
  assert.equal(contract.upstreamSchemas.promotionReviewRequest,promotion.requestSchema.$id,'Production Readiness Review/Promotion Review request mismatch');
  assert.equal(contract.upstreamSchemas.promotionReviewResult,promotion.resultSchema.$id,'Production Readiness Review/Promotion Review result mismatch');
  assert.equal(contract.upstreamSchemas.productionReadinessReviewRequest,requestSchema.$id,'Production Readiness Review request schema mismatch');
  assert.equal(contract.upstreamSchemas.productionReadinessReviewResult,resultSchema.$id,'Production Readiness Review result schema mismatch');
  assert.equal(contract.mode.productionIntegration,'disconnected','Production integration boundary widened');
  assert.equal(contract.mode.productionReadinessReviewOnly,true,'Production Readiness Review-only boundary widened');
  assert.equal(contract.mode.productionPromotionEnabled,false,'Production promotion enabled');
  for(const key of ['persistentStoreEnabled','dashboardUiEnabled','scheduleWriteAllowed','calendarWriteAllowed','runtimeWriteAllowed','notificationWriteAllowed','automaticActionAllowed']){
    assert.equal(contract.mode[key],false,'Production Readiness Review mode widened: '+key);
  }

  const allowedKeys=new Set(requestSchema.required);
  const allowedDecisions=new Set(contract.reviewPolicy.allowedDecisions);
  const validateRequest=input=>{
    assert(input&&typeof input==='object'&&!Array.isArray(input),'Invalid Production Readiness Review request');
    const unexpected=Object.keys(input).filter(key=>!allowedKeys.has(key));
    assert.equal(unexpected.length,0,'Production Readiness Review request contains unsupported fields: '+unexpected.join(', '));
    assert.equal(input.schema,requestSchema.$id,'Production Readiness Review request schema mismatch');
    assert.match(input.candidateRef,/^CANDIDATE::[A-Z0-9_-]+$/,'Production Readiness Review candidate reference outside CANDIDATE namespace');
    assert.match(input.productionReadinessReviewerRef,/^PRODUCTION_READINESS_REVIEWER::[A-Z0-9_-]+$/,'Production Readiness Review reviewer reference outside PRODUCTION_READINESS_REVIEWER namespace');
    assert(allowedDecisions.has(input.reviewDecision),'Unsupported Production Readiness Review decision');
    assert(Array.isArray(input.reasonCodes),'Production Readiness Review reason codes must be an array');
    assert(input.reasonCodes.length>=1&&input.reasonCodes.length<=12,'Production Readiness Review reason codes count out of range');
    assert.equal(new Set(input.reasonCodes).size,input.reasonCodes.length,'Duplicate Production Readiness Review reason code');
    for(const reason of input.reasonCodes){
      assert.equal(typeof reason,'string','Invalid Production Readiness Review reason code');
      assert.match(reason,/^[A-Z0-9_-]{1,64}$/,'Invalid Production Readiness Review reason code');
    }
    assert(input.promotionReviewRequest&&typeof input.promotionReviewRequest==='object'&&!Array.isArray(input.promotionReviewRequest),'Missing nested Promotion Review request');
    assert.equal(input.promotionReviewRequest.schema,promotion.requestSchema.$id,'Nested Promotion Review request schema mismatch');
    assert.equal(input.candidateRef,input.promotionReviewRequest.candidateRef,'Production Readiness Review candidate does not match nested Promotion Review candidate');
    return clone(input);
  };

  const projectProductionReadinessReview=input=>{
    const request=validateRequest(input);
    const upstream=promotion.projectPromotionReview(request.promotionReviewRequest);
    assert.equal(upstream.candidateRef,request.candidateRef,'Recomputed Promotion Review candidate mismatch');
    assert.equal(upstream.persisted,false,'Persisted Promotion Review result reached Production Readiness Review');
    assert.equal(upstream.productionPromotionAuthorized,false,'Promotion Review authorized production promotion');
    assert.equal(upstream.productionConsumerConnected,false,'Production consumer reached Production Readiness Review');
    assert.equal(upstream.runtimeActionAuthorized,false,'Promotion Review authorized runtime action');
    assert.equal(upstream.scheduleWriteAllowed,false,'Promotion Review authorized schedule write');
    assert.equal(upstream.notificationWriteAllowed,false,'Promotion Review authorized notification write');

    const eligible=upstream.productionReadinessReviewEligible===true;
    let effectiveProductionReadinessReviewState;
    if(!eligible){
      effectiveProductionReadinessReviewState=contract.reviewPolicy.upstreamBlockedState;
    }else if(request.reviewDecision==='approve_shadow_readiness'){
      effectiveProductionReadinessReviewState=contract.reviewPolicy.approvedState;
    }else if(request.reviewDecision==='needs_revision'){
      effectiveProductionReadinessReviewState=contract.reviewPolicy.needsRevisionState;
    }else{
      effectiveProductionReadinessReviewState=contract.reviewPolicy.rejectedState;
    }

    assert([
      'production_readiness_review_blocked_upstream',
      'production_readiness_review_needs_revision',
      'production_readiness_review_rejected',
      'production_readiness_review_approved_shadow_only'
    ].includes(effectiveProductionReadinessReviewState),'Unsupported Production Readiness Review effective state');

    const reasonCodes=clone(request.reasonCodes);
    const shadowProductionReady=effectiveProductionReadinessReviewState==='production_readiness_review_approved_shadow_only';
    const result={
      schema:resultSchema.$id,
      receiptId:['PRODUCTION_READINESS_REVIEW',request.candidateRef,request.productionReadinessReviewerRef,upstream.receiptId,request.reviewDecision,reasonCodes.join('+')].join('::'),
      candidateRef:request.candidateRef,
      productionReadinessReviewerRef:request.productionReadinessReviewerRef,
      submittedReviewDecision:request.reviewDecision,
      reasonCodes,
      promotionReviewReceiptId:upstream.receiptId,
      releaseReviewReceiptId:upstream.releaseReviewReceiptId,
      promotionEligibilityProjectionId:upstream.promotionEligibilityProjectionId,
      humanReviewReceiptId:upstream.humanReviewReceiptId,
      reportId:upstream.reportId,
      phaseId:upstream.phaseId,
      weekStart:upstream.weekStart,
      sourcePromotionReviewState:upstream.effectivePromotionReviewState,
      effectiveProductionReadinessReviewState,
      shadowProductionReady,
      persisted:false,
      productionPromotionAuthorized:false,
      productionConsumerConnected:false,
      runtimeActionAuthorized:false,
      scheduleWriteAllowed:false,
      notificationWriteAllowed:false
    };
    for(const key of ['persisted','productionPromotionAuthorized','productionConsumerConnected','runtimeActionAuthorized','scheduleWriteAllowed','notificationWriteAllowed']){
      assert.equal(result[key],false,'Production Readiness Review authority widened: '+key);
    }
    return deepFreeze(result);
  };

  return Object.freeze({
    contract:deepFreeze(clone(contract)),
    contractSchema:deepFreeze(clone(contractSchema)),
    requestSchema:deepFreeze(clone(requestSchema)),
    resultSchema:deepFreeze(clone(resultSchema)),
    promotion,
    validateRequest,
    projectProductionReadinessReview
  });
}
