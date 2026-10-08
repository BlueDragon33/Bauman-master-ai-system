import assert from 'node:assert/strict';
import {buildRe49ReviewInventory} from '../review/re49-review-packets-r4.mjs';
import {buildExternalReviewHandoff,validateExternalReviewDecision,validateReviewerRegistry} from '../review/re50-external-review-handoff.mjs';

const inventory=buildRe49ReviewInventory();
const emptyRegistry={schema:'RUSSIAN_ENGINE_RU03_REVIEWERS_V1',state:'EXTERNAL_REVIEWER_REQUIRED',reviewers:[]};
const handoff=buildExternalReviewHandoff({inventory,registry:emptyRegistry});
assert.equal(handoff.itemCount,43);
assert.equal(handoff.reviewerCount,0);
assert.equal(handoff.state,'EXTERNAL_REVIEWER_REQUIRED');
assert.equal(handoff.audioReady,false);
assert.equal(handoff.canonicalPublicationReady,false);
assert.equal(handoff.entries.every(x=>x.decisionTemplate.decision===null),true,'draft decisions must not preselect APPROVE');

const item=inventory.items[0];
const baseDecision={
  decisionId:'test-decision-1',
  itemId:item.itemId,
  scope:'TEXT',
  decision:'APPROVE',
  reviewerAuthority:'HUMAN_RU03',
  reviewerType:'HUMAN',
  reviewerId:'qualified-reviewer-test-only',
  decidedAt:'2026-10-08T00:00:00Z',
  reviewFingerprint:item.reviewFingerprint,
  textFingerprint:item.textFingerprint,
  audioFingerprint:item.audioFingerprint
};
assert.equal(validateExternalReviewDecision(item,baseDecision,{registry:emptyRegistry}).ok,false,'unregistered reviewer must fail');

const textRegistry={
  schema:'RUSSIAN_ENGINE_RU03_REVIEWERS_V1',
  state:'TEST_ONLY',
  reviewers:[{
    reviewerId:'qualified-reviewer-test-only',
    authority:'HUMAN_RU03',
    reviewerType:'HUMAN',
    status:'ACTIVE',
    authorizationEvidence:{status:'VERIFIED',reference:'TEST_FIXTURE_ONLY',verifiedBy:'test-harness',verifiedAt:'2026-10-08T00:00:00Z'},
    qualifications:['RUSSIAN_TEXT']
  }]
};
assert.equal(validateReviewerRegistry(textRegistry).ok,true);
assert.equal(validateExternalReviewDecision(item,baseDecision,{registry:textRegistry}).ok,true,'authorized exact TEXT decision should pass structure');

const noEvidenceRegistry=structuredClone(textRegistry);
delete noEvidenceRegistry.reviewers[0].authorizationEvidence;
assert.equal(validateReviewerRegistry(noEvidenceRegistry).ok,false,'unverified qualifications are insufficient');
assert.equal(validateExternalReviewDecision(item,baseDecision,{registry:noEvidenceRegistry}).ok,false);

const aiRegistry={
  schema:'RUSSIAN_ENGINE_RU03_REVIEWERS_V1',
  state:'TEST_ONLY',
  reviewers:[{
    reviewerId:'ai-reviewer',
    authority:'HUMAN_RU03',
    reviewerType:'AI',
    status:'ACTIVE',
    authorizationEvidence:{status:'VERIFIED',reference:'TEST_FIXTURE_ONLY',verifiedBy:'test-harness',verifiedAt:'2026-10-08T00:00:00Z'},
    qualifications:['RUSSIAN_TEXT']
  }]
};
assert.equal(validateReviewerRegistry(aiRegistry).ok,false,'AI reviewer cannot become RU03 HUMAN authority');

const audioRegistry={
  schema:'RUSSIAN_ENGINE_RU03_REVIEWERS_V1',
  state:'TEST_ONLY',
  reviewers:[{
    reviewerId:'qualified-reviewer-test-only',
    authority:'HUMAN_RU03',
    reviewerType:'HUMAN',
    status:'ACTIVE',
    authorizationEvidence:{status:'VERIFIED',reference:'TEST_FIXTURE_ONLY',verifiedBy:'test-harness',verifiedAt:'2026-10-08T00:00:00Z'},
    qualifications:['RUSSIAN_TEXT','RUSSIAN_AUDIO']
  }]
};
const audioDecision={...baseDecision,scope:'AUDIO'};
assert.equal(validateExternalReviewDecision(item,audioDecision,{registry:audioRegistry}).ok,false,'missing immutable audio hash must block AUDIO approval');

const stale={...baseDecision,reviewFingerprint:'stale',textFingerprint:'stale'};
assert.equal(validateExternalReviewDecision(item,stale,{registry:textRegistry}).ok,false,'stale fingerprints must fail');

console.log(JSON.stringify({
  ok:true,
  handoffItems:43,
  noAuthorizedReviewer:true,
  unregisteredReviewerBlocked:true,
  aiReviewerBlocked:true,
  exactQualifiedTextDecisionStructurallyAccepted:true,
  audioApprovalBlockedWithoutImmutableAudio:true,
  staleDecisionBlocked:true,
  canonicalPublicationReady:false
}));
