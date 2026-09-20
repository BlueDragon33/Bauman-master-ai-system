import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadCurrentHumanReviewHarness} from './roadmap-v2-human-review-harness.mjs';

function deepFreeze(value,seen=new WeakSet()){
  if(!value||typeof value!=='object'||seen.has(value))return value;
  seen.add(value);
  for(const child of Object.values(value))deepFreeze(child,seen);
  return Object.freeze(value);
}
function clone(value){return value===undefined?undefined:structuredClone(value);}
function readJson(file,label){
  if(!fs.existsSync(file))throw new Error('Missing current Promotion Eligibility file: '+label);
  try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{throw new Error('Invalid current Promotion Eligibility JSON: '+label);}
}

export function loadCurrentPromotionEligibilityHarness(options={}){
  const root=options.rootDir||process.cwd();
  const contract=readJson(root+'/roadmap_v2/promotion-eligibility/current-contract.json','Promotion Eligibility contract');
  const contractSchema=readJson(root+'/roadmap_v2/promotion-eligibility/promotion-eligibility-contract.schema.json','Promotion Eligibility contract schema');
  const requestSchema=readJson(root+'/roadmap_v2/promotion-eligibility/promotion-eligibility-request.schema.json','Promotion Eligibility request schema');
  const resultSchema=readJson(root+'/roadmap_v2/promotion-eligibility/promotion-eligibility-result.schema.json','Promotion Eligibility result schema');
  const human=loadCurrentHumanReviewHarness({rootDir:root});

  assert.equal(contract.schema,contractSchema.$id,'Promotion Eligibility contract/schema mismatch');
  assert.equal(contract.upstreamSchemas.humanReviewContract,human.contract.schema,'Promotion Eligibility/Human Review contract mismatch');
  assert.equal(contract.upstreamSchemas.humanReviewRequest,human.requestSchema.$id,'Promotion Eligibility/Human Review request mismatch');
  assert.equal(contract.upstreamSchemas.humanReviewResult,human.resultSchema.$id,'Promotion Eligibility/Human Review result mismatch');
  assert.equal(contract.upstreamSchemas.promotionEligibilityRequest,requestSchema.$id,'Promotion Eligibility request schema mismatch');
  assert.equal(contract.upstreamSchemas.promotionEligibilityResult,resultSchema.$id,'Promotion Eligibility result schema mismatch');
  assert.equal(contract.mode.productionIntegration,'disconnected','Promotion Eligibility production boundary widened');
  assert.equal(contract.mode.releaseReviewIntegration,'disconnected','Promotion Eligibility release-review boundary widened');
  assert.equal(contract.mode.productionPromotionEnabled,false,'Promotion Eligibility production promotion enabled');
  for(const key of ['persistentStoreEnabled','dashboardUiEnabled','scheduleWriteAllowed','calendarWriteAllowed','runtimeWriteAllowed','notificationWriteAllowed','automaticActionAllowed'])assert.equal(contract.mode[key],false,'Promotion Eligibility mode widened: '+key);

  const allowedKeys=new Set(requestSchema.required);
  const validateRequest=input=>{
    assert(input&&typeof input==='object'&&!Array.isArray(input),'Invalid Promotion Eligibility request');
    const unexpected=Object.keys(input).filter(key=>!allowedKeys.has(key));
    assert.equal(unexpected.length,0,'Promotion Eligibility request contains unsupported fields: '+unexpected.join(', '));
    assert.equal(input.schema,requestSchema.$id,'Promotion Eligibility request schema mismatch');
    assert.match(input.candidateRef,/^CANDIDATE::[A-Z0-9_-]+$/,'Promotion Eligibility candidate reference outside CANDIDATE namespace');
    assert(input.humanReviewRequest&&typeof input.humanReviewRequest==='object'&&!Array.isArray(input.humanReviewRequest),'Missing Promotion Eligibility Human Review request');
    assert.equal(input.humanReviewRequest.schema,human.requestSchema.$id,'Nested Human Review request schema mismatch');
    return clone(input);
  };

  const projectEligibility=input=>{
    const request=validateRequest(input);
    const review=human.projectHumanReview(request.humanReviewRequest);
    assert.equal(review.persisted,false,'Persisted Human Review result reached Promotion Eligibility');
    assert.equal(review.productionPromotionAuthorized,false,'Human Review authorized production promotion before Promotion Eligibility');
    assert.equal(review.productionConsumerConnected,false,'Production consumer reached Promotion Eligibility');
    assert.equal(review.runtimeActionAuthorized,false,'Human Review authorized runtime action before Promotion Eligibility');
    assert.equal(review.scheduleWriteAllowed,false,'Human Review authorized schedule write before Promotion Eligibility');
    assert.equal(review.notificationWriteAllowed,false,'Human Review authorized notification write before Promotion Eligibility');

    const eligibilityState=contract.eligibilityPolicy[review.effectiveReviewState];
    assert(['not_eligible_upstream_blocked','not_eligible_needs_revision','not_eligible_rejected','eligible_for_release_review'].includes(eligibilityState),'Unsupported Promotion Eligibility state: '+review.effectiveReviewState);

    const result={
      schema:resultSchema.$id,
      projectionId:['PROMOTION_ELIGIBILITY',request.candidateRef,review.receiptId].join('::'),
      candidateRef:request.candidateRef,
      humanReviewReceiptId:review.receiptId,
      reportId:review.reportId,
      phaseId:review.phaseId,
      weekStart:review.weekStart,
      sourceReadinessColor:review.sourceReadinessColor,
      sourceHumanReviewState:review.effectiveReviewState,
      eligibilityState,
      persisted:false,
      releaseReviewAuthorized:false,
      productionPromotionAuthorized:false,
      productionConsumerConnected:false,
      runtimeActionAuthorized:false,
      scheduleWriteAllowed:false,
      notificationWriteAllowed:false
    };

    for(const key of ['persisted','releaseReviewAuthorized','productionPromotionAuthorized','productionConsumerConnected','runtimeActionAuthorized','scheduleWriteAllowed','notificationWriteAllowed'])assert.equal(result[key],false,'Promotion Eligibility authority widened: '+key);
    return deepFreeze(result);
  };

  return Object.freeze({
    contract:deepFreeze(clone(contract)),
    contractSchema:deepFreeze(clone(contractSchema)),
    requestSchema:deepFreeze(clone(requestSchema)),
    resultSchema:deepFreeze(clone(resultSchema)),
    human,
    validateRequest,
    projectEligibility
  });
}
