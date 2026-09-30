import fs from 'node:fs';
import assert from 'node:assert/strict';
import {hashPayload,validateCandidate,reviewEnvelope} from './russian-authoring-candidate.mjs';
const j=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const gov=j('subjects/russian/data/authoring-governance.json');
const owners=j('subjects/russian/docs/p3/RUSSIAN_CONTENT_OWNER_REGISTRY.json');
const provenance=j('subjects/russian/data/provenance.json');
const reviewStore=fs.readFileSync('control-service/src/content-review-store.ts','utf8');
const migration=fs.readFileSync('control-service/migrations/0004_content_review.sql','utf8');
assert.equal(gov.schema,'RUSSIAN_AUTHORING_GOVERNANCE_V1');
assert.equal(gov.reviewService.storageMode,'METADATA_ONLY');
assert.equal(gov.reviewService.storesLearningContent,false);
assert.equal(gov.permissions.candidateMayWriteCanonical,false);
assert.equal(gov.permissions.bulkImportMayWriteCanonical,false);
assert.equal(gov.permissions.generatedContentMayWriteCanonical,false);
assert.equal(gov.permissions.reviewServiceMayWriteCanonical,false);
assert.deepEqual(gov.lifecycle.promotionOrder,['DRAFT','VALIDATED','REVIEW_REQUESTED','APPROVED','CANONICAL_PATCHED','PUBLISHED']);
assert.equal(gov.lifecycle.noStateSkipping,true);
const byResp=new Map(owners.owners.map(x=>[x.responsibility,x]));
for(const r of gov.authorableResponsibilities){
  const owner=byResp.get(r);
  assert.ok(owner?.canonicalOwner,'missing canonical owner: '+r);
  assert.ok(!(owner.classification||'').startsWith('DERIVED'),'derived owner declared authorable: '+r);
}
for(const r of gov.derivedResponsibilities){
  const owner=byResp.get(r);
  if(owner) assert.ok(owner.classification||owner.canonicalOwner===null,'derived responsibility lacks classification: '+r);
}
assert.match(provenance.promotionRule,/Only VERIFIED/);
assert.match(reviewStore,/metadataOnly: true/);
assert.match(reviewStore,/expectedStatus/);
assert.match(reviewStore,/PUBLISHER_REQUIRED/);
assert.doesNotMatch(migration,/content_body|body_json|learning_content/i);
const draft={
 schema:'RUSSIAN_AUTHORING_CANDIDATE_V1',candidateId:'P12-DEMO-1',responsibility:'vocab',
 canonicalId:'demo:vocab',revision:'r1',state:'VALIDATED',payload:{ru:'пример',vi:'ví dụ'},
 sourceRefs:['source:test'],rollbackNote:'restore previous canonical item',diffSummary:'demo validator candidate'
};
draft.contentHash=hashPayload(draft.payload);
const v=validateCandidate(draft);
assert.equal(v.ok,true,v.errors.join('; '));
assert.equal(v.canonicalOwner,'subjects/russian/data/vocab.json');
const envelope=reviewEnvelope(draft);
assert.equal(envelope.metadataOnly,true);
assert.equal(envelope.contentHash,draft.contentHash);
assert.equal(envelope.sourcePath,'subjects/russian/data/vocab.json');
const derived={...draft,candidateId:'P12-DEMO-2',responsibility:'knowledge-index'};
const vd=validateCandidate(derived);
assert.equal(vd.ok,false);
assert.ok(vd.errors.some(x=>x.includes('derived')||x.includes('authorable')));
const generated={...draft,candidateId:'P12-DEMO-3',state:'APPROVED',generated:true,reviewer:'reviewer',reviewedAt:'2026-09-30T00:00:00Z',confidence:'UNVERIFIED'};
const vg=validateCandidate(generated,{requirePromotion:true});
assert.equal(vg.ok,false);
assert.ok(vg.errors.includes('generated promotion requires VERIFIED provenance'));
console.log('RUSSIAN_P12_AUTHORING_GOVERNANCE_GATE=PASS',JSON.stringify({authorable:gov.authorableResponsibilities.length,derived:gov.derivedResponsibilities.length,reviewStorage:gov.reviewService.storageMode}));
