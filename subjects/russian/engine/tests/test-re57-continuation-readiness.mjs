import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildRe57Readiness,localRe57Sources,PILOT_INDICATORS} from '../review/re57-continuation-readiness.mjs';

const inputs=localRe57Sources(),report=buildRe57Readiness(inputs);
assert.equal(inputs.adoption.policyVersion,'1.2.0');
assert.equal(report.constitutionalAuthority.proposal13,'DRAFT_NOT_RATIFIED');
assert.equal(report.constitutionalAuthority.draftPracticeMode,'OBSERVATION_ONLY');
assert.equal(report.engineeringBaseline.lastVerifiedStep,'RE56');
assert.equal(report.engineeringBaseline.lastMergedMain,'e81d6b20ac7221224ac16ce7804e47ede3822361');
assert.equal(report.engineeringBaseline.exactHeadCIFromThisCommand,'NOT_VERIFIED');
assert.equal(report.linguisticReview.totalItems,43);
assert.equal(report.linguisticReview.authorizedReviewers,0);
assert.equal(report.linguisticReview.verifiedTextItems,0);
assert.equal(report.linguisticReview.verifiedAudioItems,0);
assert.equal(report.linguisticReview.counts.linguistic_review_pending,43);
assert.equal(report.canonicalPublicationReady,false);
assert.equal(report.productionPublished,false);
assert.equal(report.draftQualityIndicators.length,5);
assert.deepEqual(PILOT_INDICATORS.map(x=>x),report.draftQualityIndicators.map(x=>x.name));
assert.equal(report.draftQualityIndicators.every(x=>x.status.startsWith('NOT_MEASURED')),true);

const forged=structuredClone(inputs);
forged.reviewers.reviewers=[{
  reviewerId:'pretend',reviewerType:'AI',authority:'HUMAN_RU03',status:'ACTIVE',
  qualifications:['RUSSIAN_TEXT'],authorizationEvidence:{status:'VERIFIED',reference:'fake',verifiedBy:'me',verifiedAt:'2026-10-10T00:00:00Z'}
}];
assert.throws(()=>buildRe57Readiness(forged),/invalid reviewer registry/);
const premature=structuredClone(inputs);
premature.adoption.policyVersion='1.3.0';
assert.throws(()=>buildRe57Readiness(premature),/adopted Constitution drift/);
const stale=structuredClone(inputs);
stale.state.activeWorkPackage='RE40';
assert.throws(()=>buildRe57Readiness(stale),/state is stale/);
const same=buildRe57Readiness(localRe57Sources());
assert.deepEqual(report,same,'pure deterministic readiness; no invented metrics');

const handoff=fs.readFileSync(new URL('../../../docs/engine/RE57_WORK_LAST_5_PERCENT_HANDOFF.md',import.meta.url),'utf8');
for(const phrase of ['PR #98','RU03','Production','Work','exact SHA','5%','STOP']){
  assert.ok(handoff.includes(phrase),'Work handoff missing '+phrase);
}
assert.ok(!handoff.includes('HUMAN_RU03_APPROVED'));
console.log(JSON.stringify({ok:true,adoption:'1.2.0',constitutionalDraft13:true,staleStateRejected:true,
  unregisteredAIReviewerRejected:true,reviewItems:43,approvedText:0,approvedAudio:0,
  pilotMetricsNotFabricated:true,productionPublished:false,workHandoffPrepared:true}));
