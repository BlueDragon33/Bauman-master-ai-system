import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadCurrentReleaseReviewHarness} from './roadmap-v2-release-review-harness.mjs';

function deepFreeze(value,seen=new WeakSet()){
  if(!value||typeof value!=='object'||seen.has(value))return value;
  seen.add(value);
  for(const child of Object.values(value))deepFreeze(child,seen);
  return Object.freeze(value);
}
function clone(value){return value===undefined?undefined:structuredClone(value);}
function readJson(file,label){
  if(!fs.existsSync(file))throw new Error('Missing current Promotion Review file: '+label);
  try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{throw new Error('Invalid current Promotion Review JSON: '+label);}
}

export function loadCurrentPromotionReviewHarness(options={}){
  const root=options.rootDir||process.cwd();
  const contract=readJson(root+'/roadmap_v2/promotion-review/current-contract.json','Promotion Review contract');
  const contractSchema=readJson(root+'/roadmap_v2/promotion-review/promotion-review-contract.schema.json','Promotion Review contract schema');
  const requestSchema=readJson(root+'/roadmap_v2/promotion-review/promotion-review-request.schema.json','Promotion Review request schema');
  const resultSchema=readJson(root+'/roadmap_v2/promotion-review/promotion-review-result.schema.json','Promotion Review result schema');
  const release=loadCurrentReleaseReviewHarness({rootDir:root});

  assert.equal(contract.schema,contractSchema.$id,'Promotion Review contract/schema mismatch');
  assert.equal(contract.upstreamSchemas.releaseReviewContract,release.contract.schema,'Promotion Review/Release Review contract mismatch');
  assert.equal(contract.upstreamSchemas.releaseReviewRequest,release.requestSchema.$id,'Promotion Review/Release Review request mismatch');
  assert.equal(contract.upstreamSchemas.releaseReviewResult,release.resultSchema.$id,'Promotion Review/Release Review result mismatch');
  assert.equal(contract.upstreamSchemas.promotionReviewRequest,requestSchema.$id,'Promotion Review request schema mismatch');
  assert.equal(contract.upstreamSchemas.promotionReviewResult,resultSchema.$id,'Promotion Review result schema mismatch');
  assert.equal(contract.mode.productionIntegration,'disconnected','Promotion Review production boundary widened');
  assert.equal(contract.mode.productionReadinessReviewIntegration,'disconnected','Promotion Review production-readiness boundary widened');
  assert.equal(contract.mode.promotionReviewOnly,true,'Promotion Review-only boundary widened');
  assert.equal(contract.mode.productionPromotionEnabled,false,'Promotion Review production promotion enabled');
  for(const key of ['persistentStoreEnabled','dashboardUiEnabled','scheduleWriteAllowed','calendarWriteAllowed','runtimeWriteAllowed','notificationWriteAllowed','automaticActionAllowed'])assert.equal(contract.mode[key],false,'Promotion Review mode widened: '+key);

  const allowedKeys=new Set(requestSchema.required);
  const allowedDecisions=new Set(contract.reviewPolicy.allowedDecisions);
  const validateRequest=input=>{
    assert(input&&typeof input==='object'&&!Array.isArray(input),'Invalid Promotion Review request');
    const unexpected=Object.keys(input).filter(key=>!allowedKeys.has(key));
    assert.equal(unexpected.length,0,'Promotion Review request contains unsupported fields: '+unexpected.join(', '));
    assert.equal(input.schema,requestSchema.$id,'Promotion Review request schema mismatch');
    assert.match(input.candidateRef,/^CANDIDATE::[A-Z0-9_-]+$/,'Promotion Review candidate reference outside CANDIDATE namespace');
    assert.match(input.promotionReviewerRef,/^PROMOTION_REVIEWER::[A-Z0-9_-]+$/,'Promotion Review reviewer reference outside PROMOTION_REVIEWER namespace');
    assert(allowedDecisions.has(input.reviewDecision),'Unsupported Promotion Review decision');
    assert(Array.isArray(input.reasonCodes),'Promotion Review reason codes must be an array');
    assert(input.reasonCodes.length>=1&&input.reasonCodes.length<=12,'Promotion Review reason codes count out of range');
    assert.equal(new Set(input.reasonCodes).size,input.reasonCodes.length,'Duplicate Promotion Review reason code');
    for(const reason of input.reasonCodes){
      assert.equal(typeof reason,'string','Invalid Promotion Review reason code');
      assert.match(reason,/^[A-Z0-9_-]{1,64}$/,'Invalid Promotion Review reason code');
    }
    assert(input.releaseReviewRequest&&typeof input.releaseReviewRequest==='object'&&!Array.isArray(input.releaseReviewRequest),'Missing Promotion Review Release Review request');
    assert.equal(input.releaseReviewRequest.schema,release.requestSchema.$id,'Nested Release Review request schema mismatch');
    assert.equal(input.candidateRef,input.releaseReviewRequest.candidateRef,'Promotion Review candidate does not match nested Release Review candidate');
    return clone(input);
  };

  const projectPromotionReview=input=>{
    const request=validateRequest(input);
    const upstream=release.projectReleaseReview(request.releaseReviewRequest);
    assert.equal(upstream.candidateRef,request.candidateRef,'Recomputed Release Review candidate mismatch');
    assert.equal(upstream.persisted,false,'Persisted Release Review result reached Promotion Review');
    assert.equal(upstream.productionPromotionAuthorized,false,'Release Review authorized production promotion');
    assert.equal(upstream.productionConsumerConnected,false,'Production consumer reached Promotion Review');
    assert.equal(upstream.runtimeActionAuthorized,false,'Release Review authorized runtime action');
    assert.equal(upstream.scheduleWriteAllowed,false,'Release Review authorized schedule write');
    assert.equal(upstream.notificationWriteAllowed,false,'Release Review authorized notification write');

    const eligible=upstream.promotionReviewEligible===true;
    let effectivePromotionReviewState;
    if(!eligible){
      effectivePromotionReviewState=contract.reviewPolicy.upstreamBlockedState;
    }else if(request.reviewDecision==='approve_for_production_readiness_review'){
      effectivePromotionReviewState=contract.reviewPolicy.approvedState;
    }else if(request.reviewDecision==='needs_revision'){
      effectivePromotionReviewState=contract.reviewPolicy.needsRevisionState;
    }else{
      effectivePromotionReviewState=contract.reviewPolicy.rejectedState;
    }

    assert(['promotion_review_blocked_upstream','promotion_review_needs_revision','promotion_review_rejected','promotion_review_approved_shadow_only'].includes(effectivePromotionReviewState),'Unsupported Promotion Review effective state');
    const reasonCodes=clone(request.reasonCodes);
    const productionReadinessReviewEligible=effectivePromotionReviewState==='promotion_review_approved_shadow_only';
    const result={
      schema:resultSchema.$id,
      receiptId:['PROMOTION_REVIEW',request.candidateRef,request.promotionReviewerRef,upstream.receiptId,request.reviewDecision,reasonCodes.join('+')].join('::'),
      candidateRef:request.candidateRef,
      promotionReviewerRef:request.promotionReviewerRef,
      submittedReviewDecision:request.reviewDecision,
      reasonCodes,
      releaseReviewReceiptId:upstream.receiptId,
      promotionEligibilityProjectionId:upstream.promotionEligibilityProjectionId,
      humanReviewReceiptId:upstream.humanReviewReceiptId,
      reportId:upstream.reportId,
      phaseId:upstream.phaseId,
      weekStart:upstream.weekStart,
      sourceReleaseReviewState:upstream.effectiveReleaseReviewState,
      effectivePromotionReviewState,
      productionReadinessReviewEligible,
      persisted:false,
      productionPromotionAuthorized:false,
      productionConsumerConnected:false,
      runtimeActionAuthorized:false,
      scheduleWriteAllowed:false,
      notificationWriteAllowed:false
    };
    for(const key of ['persisted','productionPromotionAuthorized','productionConsumerConnected','runtimeActionAuthorized','scheduleWriteAllowed','notificationWriteAllowed'])assert.equal(result[key],false,'Promotion Review authority widened: '+key);
    return deepFreeze(result);
  };

  return Object.freeze({
    contract:deepFreeze(clone(contract)),
    contractSchema:deepFreeze(clone(contractSchema)),
    requestSchema:deepFreeze(clone(requestSchema)),
    resultSchema:deepFreeze(clone(resultSchema)),
    release,
    validateRequest,
    projectPromotionReview
  });
}
