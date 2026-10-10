/**
 * RE57 read-only continuation status. It does not authenticate GitHub CI, sign RU03
 * reviewer decisions, release production, or infer learner mastery from previews.
 */
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {buildRe49ReviewInventory} from './re49-review-packets-r4.mjs';
import {buildReadinessReport} from './re45-review-core.mjs';
import {loadReviewerRegistry,validateReviewerRegistry} from './re50-external-review-handoff.mjs';

const read=url=>JSON.parse(readFileSync(url,'utf8'));
export function localRe57Sources(){
  return {
    state:read(new URL('../../../../prompts/subjects/russian/engine/PROJECT_STATE.json',import.meta.url)),
    adoption:read(new URL('../../../../.blueprint/constitution-adoption.json',import.meta.url)),
    inventory:buildRe49ReviewInventory(),
    reviewers:loadReviewerRegistry()
  };
}
export const PILOT_INDICATORS=Object.freeze([
  'K1_REGRESSIONS_PER_CHANGE',
  'K2_FIRST_FIX_SUCCESS_RATE',
  'K3_NEW_DUPLICATE_LOGIC',
  'K4_LOAD_AND_RESPONSE_PERFORMANCE',
  'K5_REOPENED_DEFECT_RATE'
]);

export function buildRe57Readiness({state,adoption,inventory,reviewers,decisions=[]}={}){
  if(!state||!adoption||!inventory||!reviewers)throw new Error('RE57 sources required');
  if(state.track!=='russian-engine'||state.activeWorkPackage!=='RE57')
    throw new Error('RE57 state is stale or wrong track');
  if(adoption.policyId!=='blueprint-os:universal-century-grade'||
     adoption.policyVersion!=='1.2.0'||adoption.enforcementMode!=='enforced')
    throw new Error('RE57 adopted Constitution drift: verify canonical Blueprint authority before proceeding');
  if(state.continuation?.authoritativeConstitution?.adoptedPolicyVersion!==adoption.policyVersion)
    throw new Error('RE57 continuation/adoption version mismatch');
  const registry=validateReviewerRegistry(reviewers);
  if(!registry.ok)throw new Error('RE57 invalid reviewer registry: '+registry.errors.join('; '));
  if(inventory.itemCount!==43||inventory.items.length!==43)throw new Error('RE57 expected exact 43-item review inventory');
  const check=buildReadinessReport(inventory,decisions,{reviewerRegistry:reviewers});
  const liveTextApproved=check.entries.filter(x=>x.textApproved).length;
  const liveAudioApproved=check.entries.filter(x=>x.audioApproved).length;
  const reviewerOnboarded=registry.reviewerCount>0;
  const blockers=[
    ...(!reviewerOnboarded?['EXTERNAL_RU03_REVIEWER_NOT_REGISTERED']:[]),
    ...(liveTextApproved<43?['RU03_TEXT_NOT_FULLY_VERIFIED']:[]),
    ...(liveAudioApproved<43?['RU03_AUDIO_NOT_FULLY_VERIFIED']:[]),
    ...(!check.promotionReady?['CANONICAL_PROMOTION_BLOCKED']:[])
  ];
  return Object.freeze({
    schema:'RUSSIAN_ENGINE_RE57_TRUTHFUL_HANDOFF_V1',
    engineeringBaseline:Object.freeze({
      lastMergedMain:state.continuation.latestVerifiedMergedEngineering.mergedMainSha,
      lastVerifiedStep:state.continuation.latestVerifiedMergedEngineering.step,
      exactHeadCIFromThisCommand:'NOT_VERIFIED',
      productionReleaseFromThisCommand:'NOT_AUTHORIZED'
    }),
    constitutionalAuthority:Object.freeze({
      effectiveVersion:adoption.policyVersion,
      proposal13:'DRAFT_NOT_RATIFIED',
      draftPracticeMode:'OBSERVATION_ONLY'
    }),
    linguisticReview:Object.freeze({
      totalItems:inventory.itemCount,
      authorizedReviewers:registry.reviewerCount,
      verifiedTextItems:liveTextApproved,
      verifiedAudioItems:liveAudioApproved,
      counts:check.counts,
      promotionReady:check.promotionReady,
      blockers:Object.freeze(blockers)
    }),
    draftQualityIndicators:Object.freeze(
      PILOT_INDICATORS.map(name=>Object.freeze({name,status:'NOT_MEASURED_NO_TRUSTED_LIVE_BASELINE'}))
    ),
    workHandoff:Object.freeze({
      allocationLabel:'FINAL_APPROX_5_PERCENT_OF_WORKFLOW_NOT_PRODUCT_COMPLETION',
      handoffFile:state.continuation.workHandoff,
      cloudBrowserVerification:'REQUIRES_EXPLICIT_WORK_SESSION',
      credentialedNativeReview:'NOT_SUBSTITUTED_BY_WORK',
      production:'SEPARATE_EXPLICIT_APPROVAL_REQUIRED'
    }),
    canonicalPublicationReady:check.promotionReady,
    productionPublished:false
  });
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===fileURLToPath(new URL('file://'+process.argv[1]))){
  const result=buildRe57Readiness(localRe57Sources());
  console.log(JSON.stringify(result,null,2));
}
