import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildContentFirstRu03Handoff} from '../review/re61-r02-r04-source-review-handoff.mjs';
import {fingerprint,verifyAuthorizedReviewDecision,buildReadinessReport} from '../review/re45-review-core.mjs';
import {loadReviewerRegistry} from '../review/re50-external-review-handoff.mjs';

const h=buildContentFirstRu03Handoff();
assert.equal(h.schema,'RUSSIAN_CONTENT_FIRST_RE61_HANDOFF_V1');
assert.equal(h.itemCount,6);
assert.equal(h.status,'PENDING_EXTERNAL_RU03');
assert.equal(h.reviewerCount,0);
assert.equal(h.textReady,false);assert.equal(h.audioReady,false);
assert.equal(h.canonicalPublicationReady,false);
assert.equal(h.re50InventoryUnaffected,true);
assert.ok(h.reviewItems.every(x=>x.audioFingerprint===null&&x.audio.kind==='BROWSER_TTS_SAMPLE_ONLY'));
assert.ok(h.reviewItems.every(x=>x.requiredReviews.includes('TEXT')&&x.requiredReviews.includes('AUDIO')));
assert.ok(h.reviewItems.every(x=>x.humanApproval===false&&x.status==='PENDING_EXTERNAL_RU03'));
assert.ok(h.reviewItems.every(x=>x.decisionTemplate.decision===null));
assert.equal(new Set(h.reviewItems.map(x=>x.itemId)).size,6);
assert.deepEqual(h.reviewItems.map(x=>x.lessonId),['R02','R02','R03','R03','R04','R04']);
assert.equal(h.readiness.itemCount,6);
assert.equal(h.readiness.counts.linguistic_review_pending,6);
assert.equal(h.readiness.promotionReady,false);
const h2=buildContentFirstRu03Handoff();
assert.deepEqual(h.reviewItems.map(x=>x.reviewFingerprint),h2.reviewItems.map(x=>x.reviewFingerprint),
  'Fingerprints must be deterministic across identical source');
const src=JSON.parse(fs.readFileSync(new URL('../../data/listen-write-lessons.json',import.meta.url),'utf8'));
for(const i of h.reviewItems){
  const row=src.find(x=>x.lessonId===i.lessonId);
  const item=row.items.find(x=>x.id===i.sourceItemId);
  assert.equal(i.textRu,item.drills[0].audioText);
  assert.equal(i.sourceItemFingerprint,fingerprint({lessonId:i.lessonId,sourceItem:item}));
  assert.match(i.textFingerprint,/^[a-f0-9]{64}$/);
  assert.match(i.reviewFingerprint,/^[a-f0-9]{64}$/);
}
const forged={...h.reviewItems[0].decisionTemplate,decisionId:'forged-test-only',
  decision:'APPROVE',reviewerId:'not-real',
  decidedAt:'2026-10-19T00:00:00Z',notes:'test forged approval'};
const registry=loadReviewerRegistry();
assert.equal(registry.reviewers.length,0);
assert.equal(verifyAuthorizedReviewDecision(h.reviewItems[0],forged,registry).ok,false,
  'Human string without authorization cannot approve text');
const audio={...forged,scope:'AUDIO',audioFingerprint:null};
assert.equal(verifyAuthorizedReviewDecision(h.reviewItems[0],audio,registry).ok,false,
  'No immutable audio asset can pass AUDIO gate');
const stale={...forged,reviewFingerprint:'0'.repeat(64)};
assert.equal(verifyAuthorizedReviewDecision(h.reviewItems[0],stale,registry).ok,false);
const altered=structuredClone(src);
altered.find(x=>x.lessonId==='R03').items[0].drills[0].audioText='SOURCE_TAMPERED';
assert.throws(()=>buildContentFirstRu03Handoff({rows:altered}),/Unsafe\/untraceable learner text/);
const modified=structuredClone(src);
modified.find(x=>x.lessonId==='R04').items[1].printSample='SOURCE_TAMPERED';
assert.throws(()=>buildContentFirstRu03Handoff({rows:modified}),/Unsafe\/untraceable learner text/);
const partial=buildReadinessReport({items:h.reviewItems},[forged,audio],{reviewerRegistry:registry});
assert.equal(partial.promotionReady,false);
assert.equal(partial.entries.some(x=>x.textApproved||x.audioApproved),false);
assert.ok(partial.entries[0].unauthorizedDecisionCount>=2);
console.log('RUSSIAN_RE61_CONTENT_REVIEW_HANDOFF_PASS',JSON.stringify({
  items:6,sourceBound:true,deterministicFingerprints:true,activeReviewers:0,
  unauthorizedApprovalsRejected:true,audioApprovalBlocked:true,
  canonicalPublicationReady:false
}));
