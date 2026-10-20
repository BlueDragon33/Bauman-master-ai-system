import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inspectActualWidgetExportReadiness } from '../mobile/widget-export-readiness.mjs';
import { inspectCanonicalWidgetBindings, buildCanonicalWidgetDeck } from '../mobile/widget-canonical-bindings.mjs';
import { assembleCanonicalWidgetReleaseEnvelope } from '../mobile/widget-signed-envelope.mjs';

// These are the ACTUAL Bauman source registries, not fabricated approval files.
const provenance = new URL('../../data/provenance.json', import.meta.url);
const reviewers = new URL('../content/review/ru03-reviewers.v1.json', import.meta.url);
const sceneDecisions = new URL('../content/review/real-life-scenes.review-decisions.v1.json', import.meta.url);

test('real RU03 evidence does not authorize widget export', () => {
  const p=JSON.parse(readFileSync(provenance));
  const r=JSON.parse(readFileSync(reviewers));
  const d=JSON.parse(readFileSync(sceneDecisions));
  assert.equal(p.datasets.find(x => x.id === 'vocab')?.status,'UNVERIFIED');
  assert.equal(r.state,'EXTERNAL_REVIEWER_REQUIRED');
  assert.deepEqual(r.reviewers,[]);
  assert.deepEqual(d.decisions,[]);
  const report=inspectActualWidgetExportReadiness();
  assert.equal(report.eligibleToExport,false);
  assert.equal(report.productionAuthority,false);
});

test('canonical binding read-only inventory is BLOCKED; no simulated authorization', () => {
  const inventory=inspectCanonicalWidgetBindings();
  assert.equal(inventory.schemaVersion,'RUSSIAN_WIDGET_CANONICAL_BINDINGS_REPORT_V1');
  assert.equal(inventory.state,'BLOCKED');
  assert.equal(inventory.eligibleToExport,false);
  assert.equal(inventory.productionAuthority,false);
  assert(inventory.blockers.includes('WIDGET_PUBLICATION_RIGHTS_AND_CANDIDATE_BINDINGS_NOT_APPROVED'));
  assert(inventory.blockers.includes('WIDGET_PINNED_BINDING_MANIFEST_MISSING'));
  assert(!('items' in inventory));
  assert(!('contentRevision' in inventory));
});

test('projector cannot read unapproved caller-selected candidates or grant RU03', () => {
  assert.throws(() => buildCanonicalWidgetDeck({
    generatedAt:'2026-10-20T00:00:00.000Z',
    expiresAt:'2026-10-21T00:00:00.000Z',
    candidates:[{textRu:'ТЕСТ',approvalDecisionId:'FAKE'}],
    reviewers:{state:'VERIFIED_HUMAN_REVIEWERS'}
  }),/WIDGET_CANONICAL_BINDING_BLOCKED:SOURCE_NOT_AUTHORIZED/);
});

test('canonical release cannot accept an arbitrary signed payload without verified source bindings', () => {
  assert.throws(()=>assembleCanonicalWidgetReleaseEnvelope({
    payloadBytes:Buffer.from('{"status":"REVIEWED_CONTENT_PROJECTION"}'),
    signature:Buffer.alloc(64),
    publicKeyRaw:Buffer.alloc(32),
    keyId:'TEST-ONLY'
  }),/WIDGET_ENVELOPE_REJECTED:SOURCE_NOT_AUTHORIZED/);
});
