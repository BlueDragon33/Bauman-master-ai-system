import assert from 'node:assert/strict';
import {buildReadinessReport,finalizeReviewItem,verifyAuthorizedReviewDecision,verifyReviewDecision} from '../review/re45-review-core.mjs';
import {buildRe49ReviewInventory} from '../review/re49-review-packets-r4.mjs';
import {buildExternalReviewHandoff,loadReviewerRegistry} from '../review/re50-external-review-handoff.mjs';

const inventory=buildRe49ReviewInventory();
const item=inventory.items[0];
const registry=loadReviewerRegistry();
assert.deepEqual(registry.reviewers,[],'production registry is intentionally empty until genuine reviewer onboarding');

const spoof={
  itemId:item.itemId,scope:'TEXT',decision:'APPROVE',reviewerAuthority:'HUMAN_RU03',
  reviewerType:'HUMAN',reviewerId:'not-an-authorized-expert',decisionId:'spoof-001',
  decidedAt:'2026-10-08T12:00:00Z',reviewFingerprint:item.reviewFingerprint,textFingerprint:item.textFingerprint
};
assert.equal(verifyReviewDecision(item,spoof).ok,true,'old structural-only check demonstrates the original trust gap');
assert.equal(verifyAuthorizedReviewDecision(item,spoof,registry).ok,false,'self-claim cannot be authenticated');
const report=buildReadinessReport(inventory,[spoof]);
assert.equal(report.promotionReady,false);
assert.equal(report.entries[0].textApproved,false);
assert.equal(report.entries[0].status,'linguistic_review_pending');
assert.equal(report.entries[0].unauthorizedDecisionCount,1);

const qualified={
  schema:'RUSSIAN_ENGINE_RU03_REVIEWERS_V1',state:'TEST_FIXTURE_ONLY',
  reviewers:[{
    reviewerId:'test-qualified-human',authority:'HUMAN_RU03',reviewerType:'HUMAN',
    status:'ACTIVE',qualifications:['RUSSIAN_TEXT','RUSSIAN_AUDIO'],
    authorizationEvidence:{status:'VERIFIED',reference:'TEST_FIXTURE_NOT_A_REAL_CREDENTIAL',verifiedBy:'test-harness',verifiedAt:'2026-10-08T12:00:00Z'}
  }]
};
const signedByTest={...spoof,reviewerId:'test-qualified-human'};
assert.equal(verifyAuthorizedReviewDecision(item,signedByTest,qualified).ok,true,'only structurally authorized synthetic TEXT evidence passes fixture test');
const reportWithFixture=buildReadinessReport(inventory,[signedByTest],{reviewerRegistry:qualified});
assert.equal(reportWithFixture.entries[0].status,'audio_review_pending');
assert.equal(reportWithFixture.promotionReady,false);
assert.equal(buildReadinessReport(inventory,[signedByTest]).entries[0].textApproved,false,'injected fixture never changes production default');

assert.equal(verifyAuthorizedReviewDecision(item,{...signedByTest,reviewerType:'AI'},qualified).ok,false);
assert.equal(verifyAuthorizedReviewDecision(item,{...signedByTest,decidedAt:'tomorrow'},qualified).ok,false);
assert.equal(verifyAuthorizedReviewDecision(item,{...signedByTest,reviewFingerprint:'stale'},qualified).ok,false);
const noCredential=structuredClone(qualified);
delete noCredential.reviewers[0].authorizationEvidence;
assert.equal(verifyAuthorizedReviewDecision(item,signedByTest,noCredential).ok,false);
const duplicated=structuredClone(qualified);
duplicated.reviewers.push(structuredClone(duplicated.reviewers[0]));
assert.equal(verifyAuthorizedReviewDecision(item,signedByTest,duplicated).ok,false);

const fakeAudio=finalizeReviewItem({
  itemId:'test:recording',sourceCatalog:'test',sourceRevision:'r-test',sourceSceneId:'test',
  utteranceKind:'reply',textRu:'Здравствуйте.',worldId:'test',situationVi:{setting:'test'},
  speakerRole:'staff',recipientRole:'learner',register:'polite',
  expectedAction:{kind:'listen'},expectedVisual:null,
  audio:{kind:'RECORDED',immutableAudioSha256:'a'.repeat(64),assetFile:'file-does-not-exist.wav'}
});
const forgedAudioDecision={
  ...signedByTest,itemId:fakeAudio.itemId,scope:'AUDIO',
  reviewFingerprint:fakeAudio.reviewFingerprint,audioFingerprint:fakeAudio.audioFingerprint
};
assert.equal(verifyReviewDecision(fakeAudio,forgedAudioDecision).ok,true,'mere SHA string passes old structural check');
assert.equal(verifyAuthorizedReviewDecision(fakeAudio,forgedAudioDecision,qualified).ok,false,'real audio bytes must match SHA before approval');
assert.equal(verifyAuthorizedReviewDecision(fakeAudio,{...forgedAudioDecision,scope:'AUDIO'},registry).ok,false);

const handoff=buildExternalReviewHandoff({registry});
assert.equal(handoff.entries.length,43);
assert.equal(handoff.entries.every(x=>x.decisionTemplate.decision===null),true);
assert.equal(handoff.canonicalPublicationReady,false);

console.log(JSON.stringify({
  ok:true,
  trustGapClosedForReadiness:true,
  unauthorizedTextApprovalRejected:true,
  independentCredentialEvidenceRequired:true,
  missingAudioFileBlocked:true,
  preselectedApprovalRemoved:true,
  unverifiedContentItems:43,
  promotionReady:false
}));
