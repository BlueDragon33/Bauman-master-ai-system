import fs from 'node:fs';
import assert from 'node:assert/strict';
import {buildCatalogReviewPackets,sceneReviewFingerprint} from '../review/scene-review-packet.mjs';
import {preflightSceneCatalog} from '../review/linguistic-preflight.mjs';
import {createHumanReviewDecisionRegistry} from '../review/review-decision-registry.mjs';
import {compileCanonicalScene,evaluateHumanReviewGate} from '../authoring/canonical-scene-compiler.mjs';

const read=url=>JSON.parse(fs.readFileSync(url,'utf8'));
const catalog=read(new URL('../content/fixtures/real-life-scenes.v1.json',import.meta.url));
const materialized=read(new URL('../content/review/real-life-scenes.review-packets.v1.json',import.meta.url));

const preflight=preflightSceneCatalog(catalog);
assert.equal(preflight.ok,true,preflight.errors.join('; '));
assert.equal(preflight.sceneCount,15);
assert.equal(preflight.linguisticCorrectness,'REVIEW_REQUIRED');
assert.equal(preflight.warnings.length,15);

const packets=buildCatalogReviewPackets(catalog);
assert.equal(packets.length,15);
assert.equal(materialized.total,15);
assert.equal(materialized.autoApproved,0);
assert.equal(materialized.state,'HUMAN_REVIEW_REQUIRED');
assert.equal(packets.every(x=>x.reviewDecision===null),true);
assert.equal(packets.every(x=>x.linguisticCorrectness==='REVIEW_REQUIRED'),true);

for(let i=0;i<packets.length;i++){
  assert.equal(materialized.packets[i].sceneId,packets[i].sceneId);
  assert.equal(materialized.packets[i].revision,packets[i].revision);
  assert.equal(materialized.packets[i].fingerprint,packets[i].fingerprint);
  assert.equal(sceneReviewFingerprint(catalog.scenes[i]),packets[i].fingerprint);
}

const emptyGate=evaluateHumanReviewGate({packets,decisions:[]});
assert.equal(emptyGate.engineeringReady,true);
assert.equal(emptyGate.humanReviewRequired,true);
assert.equal(emptyGate.canonicalPublicationReady,false);
assert.equal(emptyGate.approved.length,0);
assert.equal(emptyGate.pending.length,15);

assert.throws(()=>compileCanonicalScene({
  scene:catalog.scenes[0],
  packet:packets[0],
  decision:null
}),/human RU03 approval required/);

const registry=createHumanReviewDecisionRegistry();
assert.throws(()=>registry.record({
  decisionId:'D-AI-1',
  sceneId:packets[0].sceneId,
  revision:packets[0].revision,
  fingerprint:packets[0].fingerprint,
  authority:'RU03',
  reviewerType:'AI',
  reviewerId:'ai',
  decision:'APPROVE',
  decidedAt:'2026-10-08T00:00:00Z'
}),/reviewerType must be HUMAN/);

const humanDecision={
  decisionId:'D-HUMAN-1',
  sceneId:packets[0].sceneId,
  revision:packets[0].revision,
  fingerprint:packets[0].fingerprint,
  authority:'RU03',
  reviewerType:'HUMAN',
  reviewerId:'reviewer-test',
  decision:'APPROVE',
  decidedAt:'2026-10-08T00:00:00Z',
  notes:'test fixture decision only'
};
assert.equal(registry.record(humanDecision).created,true);
assert.equal(registry.record(humanDecision).created,false);

assert.throws(()=>registry.record({...humanDecision,decision:'REJECT'}),/immutable decision conflict/);

const originalStatus=catalog.scenes[0].status;
const compiled=compileCanonicalScene({
  scene:catalog.scenes[0],
  packet:packets[0],
  decision:humanDecision
});
assert.equal(compiled.status,'RU03_APPROVED');
assert.equal(compiled.approvedBy.reviewerType,'HUMAN');
assert.equal(compiled.canonicalRef,packets[0].proposedCanonicalRef);
assert.equal(catalog.scenes[0].status,originalStatus);
assert.equal(originalStatus,'FIXTURE_NONCANONICAL_PENDING_RU03');

assert.throws(()=>compileCanonicalScene({
  scene:catalog.scenes[0],
  packet:packets[0],
  decision:{...humanDecision,revision:'stale-r0'}
}),/stale review revision/);

assert.throws(()=>compileCanonicalScene({
  scene:catalog.scenes[0],
  packet:packets[0],
  decision:{...humanDecision,fingerprint:'fnv1a32-deadbeef'}
}),/stale review fingerprint/);

const oneApproved=evaluateHumanReviewGate({packets,decisions:[humanDecision]});
assert.equal(oneApproved.approved.length,1);
assert.equal(oneApproved.pending.length,14);
assert.equal(oneApproved.canonicalPublicationReady,false);
assert.equal(oneApproved.humanReviewRequired,true);

const duplicateCatalog=structuredClone(catalog);
const conflict=structuredClone(catalog.scenes[0]);
conflict.sceneId='conflicting-duplicate';
conflict.expectedAction.objectId=conflict.world.objects[1].id;
duplicateCatalog.scenes.push(conflict);
const duplicatePreflight=preflightSceneCatalog(duplicateCatalog);
assert.equal(duplicatePreflight.ok,false);
assert(duplicatePreflight.errors.some(x=>x.includes('duplicate Russian surface with conflicting semantics')));

const leakageCatalog=structuredClone(catalog);
leakageCatalog.scenes[0].translationVi='đưa quả bóng';
const leakage=preflightSceneCatalog(leakageCatalog);
assert.equal(leakage.ok,false);
assert(leakage.errors.some(x=>x.includes('translation leakage')));

console.log(JSON.stringify({
  ok:true,
  reviewPackets:packets.length,
  structuralPreflight:true,
  autoApproved:0,
  aiApprovalBlocked:true,
  humanDecisionRevisionBound:true,
  staleDecisionBlocked:true,
  sourceFixtureImmutable:true,
  humanReviewRequired:true,
  canonicalPublicationReady:false
}));
