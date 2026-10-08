import assert from 'node:assert/strict';
import {verifyReviewDecision,buildReadinessReport,fingerprint} from '../review/re45-review-core.mjs';
import {buildRe47ReviewInventory} from '../review/re47-review-packets-r3.mjs';
import {buildRe49Advisory,buildRe49ReviewInventory,buildRe49ReviewPackets,compareRe47ToRe49} from '../review/re49-review-packets-r4.mjs';

const oldInventory=buildRe47ReviewInventory();
const advisory=buildRe49Advisory();
const inventory=buildRe49ReviewInventory({advisory});
const again=buildRe49ReviewInventory({advisory:buildRe49Advisory()});
const packets=buildRe49ReviewPackets(inventory);
const packetsAgain=buildRe49ReviewPackets(again);
const delta=compareRe47ToRe49();

assert.equal(inventory.itemCount,43);
assert.equal(packets.packets.length,43);
assert.equal(inventory.structuralFindings.length,0);
assert.equal(delta.changedReviewFingerprints,43,'new pack revisions must invalidate every RE47 packet');
assert.deepEqual(inventory.items.map(x=>x.itemId),oldInventory.items.map(x=>x.itemId));
assert.deepEqual(inventory.items.map(x=>x.reviewFingerprint),again.items.map(x=>x.reviewFingerprint));
assert.equal(packets.sourceInventoryFingerprint,packetsAgain.sourceInventoryFingerprint);
assert.equal(inventory.items.every(x=>x.audioFingerprint===null),true);
assert.equal(packets.packets.every(x=>x.status==='PENDING_EXTERNAL_REVIEW'),true);
assert.equal(packets.packets.every(x=>x.reviewerAuthorityRequired==='HUMAN_RU03'),true);

const notebook=inventory.items.find(x=>x.itemId==='spatial:rl-15-university:instruction');
assert.equal(notebook.textRu,'Передай мне, пожалуйста, тетрадь.');
assert.equal(notebook.advisory.decision,'REVISED_CANDIDATE');
assert.equal(notebook.expectedAction.toNodeId,'classmate');

const shower=inventory.items.find(x=>x.itemId==='dialogue:repair-dorm-shower:reply');
assert.equal(shower.textRu,'Душевая в конце коридора справа.');
assert.equal(shower.advisory.decision,'REVISED_CANDIDATE');
assert.equal(shower.sourceRevision,'repair-dialogues-ai-draft-r4');
assert.equal(shower.situationVi.directionHint,'Quản lý cho biết phòng tắm ở cuối hành lang, bên phải.');
assert.equal(shower.situationVi.directionHint.includes('rẽ phải'),false);
assert.equal(shower.expectedVisual.nodeId,'shower-room');

const oldNotebook=oldInventory.items.find(x=>x.itemId===notebook.itemId);
const staleApproval={
  itemId:oldNotebook.itemId,
  scope:'TEXT',
  decision:'APPROVE',
  reviewerAuthority:'HUMAN_RU03',
  reviewerId:'synthetic-reviewer',
  reviewFingerprint:oldNotebook.reviewFingerprint,
  textFingerprint:oldNotebook.textFingerprint
};
assert.equal(verifyReviewDecision(notebook,staleApproval).ok,false,'RE47 approval must be stale');

const exactTextApproval={
  itemId:notebook.itemId,
  scope:'TEXT',
  decision:'APPROVE',
  reviewerAuthority:'HUMAN_RU03',
  reviewerId:'synthetic-reviewer',
  reviewFingerprint:notebook.reviewFingerprint,
  textFingerprint:notebook.textFingerprint
};
assert.equal(verifyReviewDecision(notebook,exactTextApproval).ok,true);
assert.equal(verifyReviewDecision(notebook,{...exactTextApproval,scope:'AUDIO',audioFingerprint:null}).ok,false);

const readiness=buildReadinessReport(inventory,[]);
assert.equal(readiness.counts.linguistic_review_pending,43);
assert.equal(readiness.promotionReady,false);
assert.equal(fingerprint(advisory),fingerprint(buildRe49Advisory()));

console.log(JSON.stringify({
  ok:true,
  reviewItems:43,
  packets:43,
  changedReviewFingerprintsFromRE47:43,
  correctedNotebookRecipient:true,
  correctedDormLocationAdverb:true,
  reviewPacketBindsVietnameseDirection:true,
  zeroImmutableAudio:true,
  oldApprovalsStale:true,
  promotionReady:false
}));
