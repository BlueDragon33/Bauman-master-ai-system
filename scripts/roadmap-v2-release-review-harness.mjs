import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadCurrentPromotionEligibilityHarness} from './roadmap-v2-promotion-eligibility-harness.mjs';

function deepFreeze(value,seen=new WeakSet()){
  if(!value||typeof value!=='object'||seen.has(value))return value;
  seen.add(value);
  for(const child of Object.values(value))deepFreeze(child,seen);
  return Object.freeze(value);
}
function clone(value){return value===undefined?undefined:structuredClone(value);}
function readJson(file,label){
  if(!fs.existsSync(file))throw new Error('Missing current Release Review file: '+label);
  try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{throw new Error('Invalid current Release Review JSON: '+label);}
}

export function loadCurrentReleaseReviewHarness(options={}){
  const root=options.rootDir||process.cwd();
  const contract=readJson(root+'/roadmap_v2/release-review/current-contract.json','Release Review contract');
  const contractSchema=readJson(root+'/roadmap_v2/release-review/release-review-contract.schema.json','Release Review contract schema');
  const requestSchema=readJson(root+'/roadmap_v2/release-review/release-review-request.schema.json','Release Review request schema');
  const resultSchema=readJson(root+'/roadmap_v2/release-review/release-review-result.schema.json','Release Review result schema');
  const promotion=loadCurrentPromotionEligibilityHarness({rootDir:root});

  assert.equal(contract.schema,contractSchema.$id,'Release Review contract/schema mismatch');
  assert.equal(contract.upstreamSchemas.promotionEligibilityContract,promotion.contract.schema,'Release Review/Promotion Eligibility contract mismatch');
  assert.equal(contract.upstreamSchemas.promotionEligibilityRequest,promotion.requestSchema.$id,'Release Review/Promotion Eligibility request mismatch');
  assert.equal(contract.upstreamSchemas.promotionEligibilityResult,promotion.resultSchema.$id,'Release Review/Promotion Eligibility result mismatch');
  assert.equal(contract.upstreamSchemas.releaseReviewRequest,requestSchema.$id,'Release Review request schema mismatch');
  assert.equal(contract.upstreamSchemas.releaseReviewResult,resultSchema.$id,'Release Review result schema mismatch');
  assert.equal(contract.mode.productionIntegration,'disconnected','Release Review production boundary widened');
  assert.equal(contract.mode.promotionReviewIntegration,'disconnected','Release Review promotion-review boundary widened');
  assert.equal(contract.mode.releaseReviewOnly,true,'Release Review-only boundary widened');
  assert.equal(contract.mode.productionPromotionEnabled,false,'Release Review production promotion enabled');
  for(const key of ['persistentStoreEnabled','dashboardUiEnabled','scheduleWriteAllowed','calendarWriteAllowed','runtimeWriteAllowed','notificationWriteAllowed','automaticActionAllowed'])assert.equal(contract.mode[key],false,'Release Review mode widened: '+key);

  const allowedKeys=new Set(requestSchema.required);
  const allowedDecisions=new Set(contract.reviewPolicy.allowedDecisions);
  const validateRequest=input=>{
    assert(input&&typeof input==='object'&&!Array.isArray(input),'Invalid Release Review request');
    const unexpected=Object.keys(input).filter(key=>!allowedKeys.has(key));
    assert.equal(unexpected.length,0,'Release Review request contains unsupported fields: '+unexpected.join(', '));
    assert.equal(input.schema,requestSchema.$id,'Release Review request schema mismatch');
    assert.match(input.candidateRef,/^CANDIDATE::[A-Z0-9_-]+$/,'Release Review candidate reference outside CANDIDATE namespace');
    assert.match(input.releaseReviewerRef,/^RELEASE_REVIEWER::[A-Z0-9_-]+$/,'Release Review reviewer reference outside RELEASE_REVIEWER namespace');
    assert(allowedDecisions.has(input.reviewDecision),'Unsupported Release Review decision');
    assert(Array.isArray(input.reasonCodes),'Release Review reason codes must be an array');
    assert(input.reasonCodes.length>=1&&input.reasonCodes.length<=12,'Release Review reason codes count out of range');
    assert.equal(new Set(input.reasonCodes).size,input.reasonCodes.length,'Duplicate Release Review reason code');
    for(const reason of input.reasonCodes){
      assert.equal(typeof reason,'string','Invalid Release Review reason code');
      assert.match(reason,/^[A-Z0-9_-]{1,64}$/,'Invalid Release Review reason code');
    }
    assert(input.promotionEligibilityRequest&&typeof input.promotionEligibilityRequest==='object'&&!Array.isArray(input.promotionEligibilityRequest),'Missing Release Review Promotion Eligibility request');
    assert.equal(input.promotionEligibilityRequest.schema,promotion.requestSchema.$id,'Nested Promotion Eligibility request schema mismatch');
    assert.equal(input.candidateRef,input.promotionEligibilityRequest.candidateRef,'Release Review candidate does not match nested Promotion Eligibility candidate');
    return clone(input);
  };

  const projectReleaseReview=input=>{
    const request=validateRequest(input);
    const upstream=promotion.projectEligibility(request.promotionEligibilityRequest);
    assert.equal(upstream.candidateRef,request.candidateRef,'Recomputed Promotion Eligibility candidate mismatch');
    assert.equal(upstream.persisted,false,'Persisted Promotion Eligibility result reached Release Review');
    assert.equal(upstream.releaseReviewAuthorized,false,'Promotion Eligibility authorized Release Review execution');
    assert.equal(upstream.productionPromotionAuthorized,false,'Promotion Eligibility authorized production promotion');
    assert.equal(upstream.productionConsumerConnected,false,'Production consumer reached Release Review');
    assert.equal(upstream.runtimeActionAuthorized,false,'Promotion Eligibility authorized runtime action');
    assert.equal(upstream.scheduleWriteAllowed,false,'Promotion Eligibility authorized schedule write');
    assert.equal(upstream.notificationWriteAllowed,false,'Promotion Eligibility authorized notification write');

    const eligible=upstream.eligibilityState==='eligible_for_release_review';
    let effectiveReleaseReviewState;
    if(!eligible){
      effectiveReleaseReviewState=contract.reviewPolicy.upstreamBlockedState;
    }else if(request.reviewDecision==='approve_for_promotion_review'){
      effectiveReleaseReviewState=contract.reviewPolicy.approvedState;
    }else if(request.reviewDecision==='needs_revision'){
      effectiveReleaseReviewState=contract.reviewPolicy.needsRevisionState;
    }else{
      effectiveReleaseReviewState=contract.reviewPolicy.rejectedState;
    }

    assert(['release_review_blocked_upstream','release_review_needs_revision','release_review_rejected','release_review_approved_shadow_only'].includes(effectiveReleaseReviewState),'Unsupported Release Review effective state');
    const reasonCodes=clone(request.reasonCodes);
    const promotionReviewEligible=effectiveReleaseReviewState==='release_review_approved_shadow_only';
    const result={
      schema:resultSchema.$id,
      receiptId:['RELEASE_REVIEW',request.candidateRef,request.releaseReviewerRef,upstream.projectionId,request.reviewDecision,reasonCodes.join('+')].join('::'),
      candidateRef:request.candidateRef,
      releaseReviewerRef:request.releaseReviewerRef,
      submittedReviewDecision:request.reviewDecision,
      reasonCodes,
      promotionEligibilityProjectionId:upstream.projectionId,
      humanReviewReceiptId:upstream.humanReviewReceiptId,
      reportId:upstream.reportId,
      phaseId:upstream.phaseId,
      weekStart:upstream.weekStart,
      sourceEligibilityState:upstream.eligibilityState,
      effectiveReleaseReviewState,
      promotionReviewEligible,
      persisted:false,
      productionPromotionAuthorized:false,
      productionConsumerConnected:false,
      runtimeActionAuthorized:false,
      scheduleWriteAllowed:false,
      notificationWriteAllowed:false
    };
    for(const key of ['persisted','productionPromotionAuthorized','productionConsumerConnected','runtimeActionAuthorized','scheduleWriteAllowed','notificationWriteAllowed'])assert.equal(result[key],false,'Release Review authority widened: '+key);
    return deepFreeze(result);
  };

  return Object.freeze({
    contract:deepFreeze(clone(contract)),
    contractSchema:deepFreeze(clone(contractSchema)),
    requestSchema:deepFreeze(clone(requestSchema)),
    resultSchema:deepFreeze(clone(resultSchema)),
    promotion,
    validateRequest,
    projectReleaseReview
  });
}
