import assert from 'node:assert/strict';
import {fingerprint,finalizeReviewItem,verifyReviewDecision,buildReadinessReport} from '../review/re45-review-core.mjs';
import {loadCurrentCandidateInventory,buildReviewPackets} from '../review/re45-review-inventory.mjs';

const inventory=loadCurrentCandidateInventory();
const again=loadCurrentCandidateInventory();
assert.equal(inventory.schema,'RUSSIAN_ENGINE_RE45_REVIEW_INVENTORY_V1');
assert.equal(inventory.itemCount,43,'15 spatial + 4*(5 dialogue turns + 2 repair turns)');
assert.deepEqual(inventory.items.map(x=>x.reviewFingerprint),again.items.map(x=>x.reviewFingerprint),'inventory fingerprints must be deterministic');
assert.equal(inventory.items.every(x=>x.audioFingerprint===null),true,'browser TTS has no immutable reviewed audio');
assert.equal(inventory.items.every(x=>x.canonicalPublicationReady===false),true);
assert.equal(inventory.structuralFindings.filter(x=>x.code==='ROLE_FIELD_SEMANTICS_CONFLICT').length,9,'nine polite spatial lines expose speaker/addressee schema ambiguity');
assert.equal(inventory.structuralFindings.filter(x=>x.code==='VN_CONTEXT_NOT_REVISION_BOUND').length,15,'all 15 spatial Vietnamese hints currently live outside the revision-bound candidate pack');
assert.ok(inventory.duplicateTextGroups.length>=5,'reused phrases must be reported, not silently collapsed');

assert.equal(fingerprint({b:2,a:1}),fingerprint({a:1,b:2}),'object key order must not alter fingerprint');
assert.notEqual(fingerprint({x:'ё'}),fingerprint({x:'е\u0308'}),'Unicode text must not be silently normalized');

const byScene=id=>inventory.items.find(x=>x.itemId==='spatial:'+id+':instruction');
assert.equal(byScene('rl-11-dorm').expectedVisual.nodeId,'room-12');
assert.equal(byScene('rl-11-dorm').expectedVisual.visualType,'numbered-room');
assert.equal(byScene('rl-08-metro').expectedVisual.nodeId,'metro-route-map');
assert.equal(byScene('rl-08-metro').expectedVisual.visualType,'map-board');
assert.equal(byScene('rl-13-university').expectedVisual.nodeId,'auditorium-12');
assert.equal(byScene('rl-13-university').expectedVisual.visualType,'lecture-room');
assert.equal(byScene('rl-12-dorm').expectedVisual.nodeId,'shower-room');
assert.equal(byScene('rl-09-metro').expectedVisual.nodeId,'station-entrance');

const packets=buildReviewPackets(inventory);
assert.equal(packets.packets.length,43);
assert.equal(packets.packets.every(x=>x.status==='PENDING_EXTERNAL_REVIEW'),true);
assert.equal(packets.packets.every(x=>x.reviewerAuthorityRequired==='HUMAN_RU03'),true);

const first=inventory.items[0];
const baseDecision={
  itemId:first.itemId,scope:'TEXT',decision:'APPROVE',
  reviewerId:'reviewer-1',reviewFingerprint:first.reviewFingerprint,textFingerprint:first.textFingerprint
};
assert.equal(verifyReviewDecision(first,{...baseDecision,reviewerAuthority:'AI'}).ok,false,'AI cannot self-approve');
assert.equal(verifyReviewDecision(first,{...baseDecision,reviewerAuthority:'HUMAN_RU03',reviewerId:''}).ok,false,'anonymous approval forbidden');
assert.equal(verifyReviewDecision(first,{...baseDecision,reviewerAuthority:'HUMAN_RU03'}).ok,true,'exact human text review can be accepted');
assert.equal(verifyReviewDecision(first,{...baseDecision,scope:'AUDIO',reviewerAuthority:'HUMAN_RU03',audioFingerprint:null}).ok,false,'TTS without immutable reviewed audio cannot pass audio gate');

const reviewedBase={
  itemId:'synthetic:test:audio',sourceCatalog:'test',sourceRevision:'r1',sourceSceneId:'s1',utteranceKind:'reply',
  textRu:'Здравствуйте.',worldId:'test',situationVi:'test',speakerRole:'staff',recipientRole:'learner',register:'polite-stranger',
  expectedAction:{kind:'listen'},expectedVisual:null
};
const audioV1=finalizeReviewItem({...reviewedBase,audio:{kind:'RECORDED',authority:'NONE',immutableAudioSha256:'a'.repeat(64)}});
const audioDecision={itemId:audioV1.itemId,scope:'AUDIO',decision:'APPROVE',reviewerAuthority:'HUMAN_RU03',reviewerId:'reviewer-2',reviewFingerprint:audioV1.reviewFingerprint,audioFingerprint:audioV1.audioFingerprint};
assert.equal(verifyReviewDecision(audioV1,audioDecision).ok,true);
const audioV2=finalizeReviewItem({...reviewedBase,audio:{kind:'RECORDED',authority:'NONE',immutableAudioSha256:'b'.repeat(64)}});
assert.equal(verifyReviewDecision(audioV2,audioDecision).ok,false,'changed audio must invalidate old approval');

const readiness=buildReadinessReport(inventory,[]);
assert.equal(readiness.itemCount,43);
assert.equal(readiness.counts.linguistic_review_pending,43);
assert.equal(readiness.promotionReady,false,'zero external review must fail closed');

const oneTextApproved=buildReadinessReport(inventory,[{...baseDecision,reviewerAuthority:'HUMAN_RU03'}]);
assert.equal(oneTextApproved.promotionReady,false);
assert.equal(oneTextApproved.entries.find(x=>x.itemId===first.itemId).status,'audio_review_pending');

console.log(JSON.stringify({
  ok:true,items:inventory.itemCount,structuralFindings:inventory.structuralFindings.length,roleSemanticConflicts:inventory.structuralFindings.filter(x=>x.code==='ROLE_FIELD_SEMANTICS_CONFLICT').length,
  duplicateTextGroups:inventory.duplicateTextGroups.length,zeroImmutableAudio:true,
  tamperAndStaleDecisionRejection:true,promotionReady:false
}));
