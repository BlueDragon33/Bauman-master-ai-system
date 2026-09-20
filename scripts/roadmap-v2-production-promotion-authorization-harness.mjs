import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadCurrentProductionReadinessReviewHarness} from './roadmap-v2-production-readiness-review-harness.mjs';

function deepFreeze(value,seen=new WeakSet()){
  if(!value||typeof value!=='object'||seen.has(value))return value;
  seen.add(value);
  for(const child of Object.values(value))deepFreeze(child,seen);
  return Object.freeze(value);
}
function clone(value){return value===undefined?undefined:structuredClone(value);}
function readJson(file,label){
  if(!fs.existsSync(file))throw new Error('Missing current Production Promotion Authorization file: '+label);
  try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{throw new Error('Invalid current Production Promotion Authorization JSON: '+label);}
}

export function loadCurrentProductionPromotionAuthorizationHarness(options={}){
  const root=options.rootDir||process.cwd();
  const contract=readJson(root+'/roadmap_v2/production-promotion-authorization/current-contract.json','Production Promotion Authorization contract');
  const contractSchema=readJson(root+'/roadmap_v2/production-promotion-authorization/production-promotion-authorization-contract.schema.json','Production Promotion Authorization contract schema');
  const requestSchema=readJson(root+'/roadmap_v2/production-promotion-authorization/production-promotion-authorization-request.schema.json','Production Promotion Authorization request schema');
  const resultSchema=readJson(root+'/roadmap_v2/production-promotion-authorization/production-promotion-authorization-result.schema.json','Production Promotion Authorization result schema');
  const readinessReview=loadCurrentProductionReadinessReviewHarness({rootDir:root});

  assert.equal(contract.schema,contractSchema.$id,'Production Promotion Authorization contract/schema mismatch');
  assert.equal(contract.upstreamSchemas.productionReadinessReviewContract,readinessReview.contract.schema,'Authorization/Production Readiness Review contract mismatch');
  assert.equal(contract.upstreamSchemas.productionReadinessReviewRequest,readinessReview.requestSchema.$id,'Authorization/Production Readiness Review request mismatch');
  assert.equal(contract.upstreamSchemas.productionReadinessReviewResult,readinessReview.resultSchema.$id,'Authorization/Production Readiness Review result mismatch');
  assert.equal(contract.upstreamSchemas.productionPromotionAuthorizationRequest,requestSchema.$id,'Authorization request schema mismatch');
  assert.equal(contract.upstreamSchemas.productionPromotionAuthorizationResult,resultSchema.$id,'Authorization result schema mismatch');
  assert.equal(contract.mode.productionIntegration,'disconnected','Production integration boundary widened');
  assert.equal(contract.mode.authorizationReceiptOnly,true,'Authorization receipt-only boundary widened');
  assert.equal(contract.mode.productionPromotionExecutionEnabled,false,'Production promotion execution enabled');
  assert.equal(contract.mode.deploymentEnabled,false,'Deployment enabled');
  for(const key of ['persistentStoreEnabled','dashboardUiEnabled','scheduleWriteAllowed','calendarWriteAllowed','runtimeWriteAllowed','notificationWriteAllowed','automaticActionAllowed']){
    assert.equal(contract.mode[key],false,'Production Promotion Authorization mode widened: '+key);
  }

  const allowedKeys=new Set(requestSchema.required);
  const allowedDecisions=new Set(contract.authorizationPolicy.allowedDecisions);
  const validateRequest=input=>{
    assert(input&&typeof input==='object'&&!Array.isArray(input),'Invalid Production Promotion Authorization request');
    const unexpected=Object.keys(input).filter(key=>!allowedKeys.has(key));
    assert.equal(unexpected.length,0,'Production Promotion Authorization request contains unsupported fields: '+unexpected.join(', '));
    assert.equal(input.schema,requestSchema.$id,'Production Promotion Authorization request schema mismatch');
    assert.match(input.candidateRef,/^CANDIDATE::[A-Z0-9_-]+$/,'Authorization candidate reference outside CANDIDATE namespace');
    assert.match(input.productionPromotionAuthorizerRef,/^PRODUCTION_PROMOTION_AUTHORIZER::[A-Z0-9_-]+$/,'Authorizer reference outside PRODUCTION_PROMOTION_AUTHORIZER namespace');
    assert(allowedDecisions.has(input.authorizationDecision),'Unsupported Production Promotion Authorization decision');
    assert(Array.isArray(input.reasonCodes),'Authorization reason codes must be an array');
    assert(input.reasonCodes.length>=1&&input.reasonCodes.length<=12,'Authorization reason codes count out of range');
    assert.equal(new Set(input.reasonCodes).size,input.reasonCodes.length,'Duplicate Authorization reason code');
    for(const reason of input.reasonCodes){
      assert.equal(typeof reason,'string','Invalid Authorization reason code');
      assert.match(reason,/^[A-Z0-9_-]{1,64}$/,'Invalid Authorization reason code');
    }
    assert(input.productionReadinessReviewRequest&&typeof input.productionReadinessReviewRequest==='object'&&!Array.isArray(input.productionReadinessReviewRequest),'Missing nested Production Readiness Review request');
    assert.equal(input.productionReadinessReviewRequest.schema,readinessReview.requestSchema.$id,'Nested Production Readiness Review request schema mismatch');
    assert.equal(input.candidateRef,input.productionReadinessReviewRequest.candidateRef,'Authorization candidate does not match nested Production Readiness Review candidate');
    return clone(input);
  };

  const projectProductionPromotionAuthorization=input=>{
    const request=validateRequest(input);
    const upstream=readinessReview.projectProductionReadinessReview(request.productionReadinessReviewRequest);
    assert.equal(upstream.candidateRef,request.candidateRef,'Recomputed Production Readiness Review candidate mismatch');
    assert.equal(upstream.persisted,false,'Persisted Production Readiness Review result reached Authorization');
    assert.equal(upstream.productionPromotionAuthorized,false,'Upstream Production Readiness Review authorized promotion execution');
    assert.equal(upstream.productionConsumerConnected,false,'Production consumer reached Authorization');
    assert.equal(upstream.runtimeActionAuthorized,false,'Upstream authorized runtime action');
    assert.equal(upstream.scheduleWriteAllowed,false,'Upstream authorized schedule write');
    assert.equal(upstream.notificationWriteAllowed,false,'Upstream authorized notification write');

    const eligible=upstream.shadowProductionReady===true;
    let effectiveProductionPromotionAuthorizationState;
    if(!eligible){
      effectiveProductionPromotionAuthorizationState=contract.authorizationPolicy.upstreamBlockedState;
    }else if(request.authorizationDecision==='authorize_receipt_only'){
      effectiveProductionPromotionAuthorizationState=contract.authorizationPolicy.authorizedState;
    }else if(request.authorizationDecision==='needs_revision'){
      effectiveProductionPromotionAuthorizationState=contract.authorizationPolicy.needsRevisionState;
    }else{
      effectiveProductionPromotionAuthorizationState=contract.authorizationPolicy.rejectedState;
    }

    assert([
      'production_promotion_authorization_blocked_upstream',
      'production_promotion_authorization_needs_revision',
      'production_promotion_authorization_rejected',
      'production_promotion_authorization_receipt_granted'
    ].includes(effectiveProductionPromotionAuthorizationState),'Unsupported Production Promotion Authorization state');

    const reasonCodes=clone(request.reasonCodes);
    const authorizationReceiptGranted=effectiveProductionPromotionAuthorizationState==='production_promotion_authorization_receipt_granted';
    const result={
      schema:resultSchema.$id,
      receiptId:['PRODUCTION_PROMOTION_AUTHORIZATION',request.candidateRef,request.productionPromotionAuthorizerRef,upstream.receiptId,request.authorizationDecision,reasonCodes.join('+')].join('::'),
      candidateRef:request.candidateRef,
      productionPromotionAuthorizerRef:request.productionPromotionAuthorizerRef,
      submittedAuthorizationDecision:request.authorizationDecision,
      reasonCodes,
      productionReadinessReviewReceiptId:upstream.receiptId,
      promotionReviewReceiptId:upstream.promotionReviewReceiptId,
      releaseReviewReceiptId:upstream.releaseReviewReceiptId,
      promotionEligibilityProjectionId:upstream.promotionEligibilityProjectionId,
      humanReviewReceiptId:upstream.humanReviewReceiptId,
      reportId:upstream.reportId,
      phaseId:upstream.phaseId,
      weekStart:upstream.weekStart,
      sourceProductionReadinessReviewState:upstream.effectiveProductionReadinessReviewState,
      effectiveProductionPromotionAuthorizationState,
      authorizationReceiptGranted,
      authorizationScope:contract.authorizationPolicy.authorizationScope,
      persisted:false,
      productionPromotionExecuted:false,
      deploymentExecuted:false,
      productionConsumerConnected:false,
      runtimeActionAuthorized:false,
      scheduleWriteAllowed:false,
      notificationWriteAllowed:false
    };
    for(const key of ['persisted','productionPromotionExecuted','deploymentExecuted','productionConsumerConnected','runtimeActionAuthorized','scheduleWriteAllowed','notificationWriteAllowed']){
      assert.equal(result[key],false,'Production Promotion Authorization authority widened: '+key);
    }
    return deepFreeze(result);
  };

  return Object.freeze({
    contract:deepFreeze(clone(contract)),
    contractSchema:deepFreeze(clone(contractSchema)),
    requestSchema:deepFreeze(clone(requestSchema)),
    resultSchema:deepFreeze(clone(resultSchema)),
    readinessReview,
    validateRequest,
    projectProductionPromotionAuthorization
  });
}
