import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createPromotionRegistry,stableContentFingerprint,validatePromotionCandidate} from '../content/promotion/promotion-registry.mjs';

const fixture=JSON.parse(fs.readFileSync(new URL('../content/fixtures/promotion-candidates.v1.json',import.meta.url),'utf8'));
const candidate=fixture.candidates[0];
assert.equal(validatePromotionCandidate(candidate).ok,true);
assert.equal(stableContentFingerprint(candidate),stableContentFingerprint(structuredClone(candidate)));

const registry=createPromotionRegistry();
assert.equal(registry.register(candidate).created,true);
assert.equal(registry.register(candidate).created,false);

const changed=structuredClone(candidate);
changed.linguisticPayload.text='Дай книгу.';
assert.throws(()=>registry.register(changed),/immutable revision conflict/);

assert.throws(()=>registry.transition({contentId:candidate.contentId,revision:'r1',to:'PUBLISHED_REFERENCE'}),/illegal promotion transition/);

const reviewCandidate=registry.transition({contentId:candidate.contentId,revision:'r1',to:'REVIEW_CANDIDATE'});
assert.equal(reviewCandidate.state,'REVIEW_CANDIDATE');

assert.throws(()=>registry.transition({
 contentId:candidate.contentId,revision:'r1',to:'RU03_APPROVED',
 review:{authority:'AI',decision:'APPROVE',reviewerId:'bot',reviewedRevision:'r1'}
}),/approval validation failed/);

const approved=registry.transition({
 contentId:candidate.contentId,revision:'r1',to:'RU03_APPROVED',
 review:{authority:'RU03',decision:'APPROVE',reviewerId:'reviewer-01',reviewedRevision:'r1'}
});
assert.equal(approved.state,'RU03_APPROVED');

const published=registry.transition({
 contentId:candidate.contentId,revision:'r1',to:'PUBLISHED_REFERENCE',
 canonicalRef:'RU03:CONTENT:RU-ENG-CONTENT-001:r1'
});
assert.equal(published.state,'PUBLISHED_REFERENCE');
assert.equal(published.canonicalRef,'RU03:CONTENT:RU-ENG-CONTENT-001:r1');

const superseded=registry.supersede({contentId:candidate.contentId,revision:'r1',replacedByRevision:'r2'});
assert.equal(superseded.state,'SUPERSEDED');
assert(registry.history().some(x=>x.type==='superseded-by'));

console.log(JSON.stringify({
 ok:true,
 immutableRevision:true,
 ru03ApprovalRequired:true,
 skippedPromotionBlocked:true,
 supersessionHistory:true
}));
