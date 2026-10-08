import assert from 'node:assert/strict';
import {verifyReviewDecision,buildReadinessReport} from '../review/re45-review-core.mjs';
import {loadCurrentCandidateInventory} from '../review/re45-review-inventory.mjs';
import {buildRe47ReviewInventory,buildRe47ReviewPackets} from '../review/re47-review-packets-r3.mjs';

const oldInventory=loadCurrentCandidateInventory();
const inventory=buildRe47ReviewInventory();
const again=buildRe47ReviewInventory();
const packets=buildRe47ReviewPackets(inventory);
const packetsAgain=buildRe47ReviewPackets(again);

assert.equal(inventory.schema,'RUSSIAN_ENGINE_RE47_REVIEW_INVENTORY_V1');
assert.equal(inventory.itemCount,43);
assert.equal(packets.packets.length,43);
assert.equal(inventory.structuralFindings.length,0,'RE46 role/VN structural findings must be resolved in RE47');
assert.deepEqual(inventory.items.map(x=>x.itemId),oldInventory.items.map(x=>x.itemId),'item identities stay stable across revisions');
assert.deepEqual(inventory.items.map(x=>x.reviewFingerprint),again.items.map(x=>x.reviewFingerprint),'resolved packet fingerprints must be deterministic');
assert.equal(packets.sourceInventoryFingerprint,packetsAgain.sourceInventoryFingerprint,'packet manifest fingerprint must be deterministic');

const oldById=new Map(oldInventory.items.map(x=>[x.itemId,x]));
const changed=inventory.items.filter(x=>oldById.get(x.itemId)?.reviewFingerprint!==x.reviewFingerprint);
assert.equal(changed.length,43,'all 43 exact review fingerprints must change for the new candidate revisions');

assert.equal(inventory.items.every(x=>x.audioFingerprint===null),true,'no immutable reviewed audio exists yet');
assert.equal(inventory.items.every(x=>x.advisory&&x.advisory.decision),true,'every item must carry AI advisory context');
assert.equal(inventory.items.every(x=>x.situationVi?.setting&&x.situationVi?.purpose),true,'every item must bind Vietnamese context into review fingerprint');
assert.equal(packets.packets.every(x=>x.status==='PENDING_EXTERNAL_REVIEW'),true);
assert.equal(packets.packets.every(x=>x.reviewerAuthorityRequired==='HUMAN_RU03'),true);

const metroReply=inventory.items.find(x=>x.itemId==='dialogue:repair-metro-entrance:reply');
const universityReply=inventory.items.find(x=>x.itemId==='dialogue:repair-university-room:reply');
assert.equal(metroReply.textRu,'Вход в метро дальше по улице, справа.');
assert.equal(universityReply.textRu,'Аудитория номер двенадцать — дальше по коридору, справа.');
assert.equal(metroReply.advisory.decision,'REVISED_CANDIDATE');
assert.equal(universityReply.advisory.decision,'REVISED_CANDIDATE');

const shopRequest=inventory.items.find(x=>x.itemId==='spatial:rl-04-shop:instruction');
const dormRequest=inventory.items.find(x=>x.itemId==='spatial:rl-11-dorm:instruction');
assert.deepEqual({speaker:shopRequest.speakerRole,recipient:shopRequest.recipientRole},{speaker:'learner',recipient:'shop-staff'});
assert.deepEqual({speaker:dormRequest.speakerRole,recipient:dormRequest.recipientRole},{speaker:'learner',recipient:'dorm-administrator'});

const oldFirst=oldInventory.items[0],newFirst=inventory.items.find(x=>x.itemId===oldFirst.itemId);
const oldApproval={
  itemId:oldFirst.itemId,
  scope:'TEXT',
  decision:'APPROVE',
  reviewerAuthority:'HUMAN_RU03',
  reviewerId:'synthetic-reviewer',
  reviewFingerprint:oldFirst.reviewFingerprint,
  textFingerprint:oldFirst.textFingerprint
};
assert.equal(verifyReviewDecision(newFirst,oldApproval).ok,false,'approval for old revision must be stale on RE47');

const newTextApproval={
  itemId:newFirst.itemId,
  scope:'TEXT',
  decision:'APPROVE',
  reviewerAuthority:'HUMAN_RU03',
  reviewerId:'synthetic-reviewer',
  reviewFingerprint:newFirst.reviewFingerprint,
  textFingerprint:newFirst.textFingerprint
};
assert.equal(verifyReviewDecision(newFirst,newTextApproval).ok,true,'exact new text decision structure is valid');
const fakeAudioApproval={...newTextApproval,scope:'AUDIO',audioFingerprint:null};
assert.equal(verifyReviewDecision(newFirst,fakeAudioApproval).ok,false,'missing immutable audio can never pass');

const readiness=buildReadinessReport(inventory,[]);
assert.equal(readiness.itemCount,43);
assert.equal(readiness.counts.linguistic_review_pending,43);
assert.equal(readiness.promotionReady,false);

const oneText=buildReadinessReport(inventory,[newTextApproval]);
assert.equal(oneText.entries.find(x=>x.itemId===newFirst.itemId).status,'linguistic_review_pending','unregistered synthetic reviewer cannot approve content');
assert.equal(oneText.entries.find(x=>x.itemId===newFirst.itemId).unauthorizedDecisionCount,1);
assert.equal(oneText.promotionReady,false);

console.log(JSON.stringify({
  ok:true,
  reviewItems:43,
  packets:43,
  changedFingerprintsFromR2:changed.length,
  structuralFindings:0,
  revisionBoundVietnamese:true,
  advisoryCoverage:true,
  zeroImmutableAudio:true,
  staleOldApprovalRejected:true,
  promotionReady:false
}));
