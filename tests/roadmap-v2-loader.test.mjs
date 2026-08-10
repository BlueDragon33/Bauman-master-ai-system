import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { loadRoadmapSidecar } from '../roadmap_v2/loader.mjs';

const packageRoot = path.resolve('roadmap_v2');

test('loads the canonical read-only sidecar', () => {
  const sidecar = loadRoadmapSidecar({ baseDir: packageRoot });
  assert.equal(sidecar.manifest.status, 'PASS_B81_PACKAGE');
  assert.equal(sidecar.registry.counts.chapters, 85);
  assert.equal(sidecar.registry.counts.numberedLessons, 304);
  assert.equal(sidecar.graph.validation.cycleNodes.length, 0);
  assert.equal(sidecar.mapping.legacyLessonMappings.length, 347);
  assert.equal(sidecar.mapping.validation.exactLegacyLessonMappingsVerified, 5);
  assert.equal(sidecar.mapping.validation.semanticMappingComplete, false);
  assert.equal(sidecar.manifest.productionIntegration, 'disconnected');
  assert.equal(sidecar.manifest.canonicalSourcesOnly, true);
});

test('exposes immutable indexed lookups', () => {
  const sidecar = loadRoadmapSidecar({ baseDir: packageRoot });
  assert.equal(sidecar.hasNode('MATH-L2-C07'), true);
  assert.equal(sidecar.hasNode('DOES-NOT-EXIST'), false);
  assert.equal(sidecar.getNode('DOES-NOT-EXIST'), null);
  assert.equal(sidecar.getChapter('MATH-L2-C07').legacyBinding.physicalLessonCandidates.length, 5);
  assert.equal(sidecar.getAuthoritativeLegacyLessons('MATH-L2-C07').length, 5);
  assert.ok(sidecar.getMapping('MATH-L2-C07').frameworkOutlineCandidates.some(item => item.legacyId === 'm_p07'));
  assert.ok(sidecar.getMapping('MATH-L2-C07').frameworkOutlineCandidates.every(item => item.mappingStatus === 'secondary_outline_quarantined_candidate'));
  assert.ok(sidecar.getPrerequisites('ML-L2-C04').some(edge => edge.from === 'MATH-L2-C07'));
  assert.ok(sidecar.getDependents('MATH-L2-C07').some(edge => edge.to === 'ML-L2-C04'));
  assert.equal(Object.isFrozen(sidecar), true);
  assert.equal(Object.isFrozen(sidecar.registry), true);
  assert.equal(Object.isFrozen(sidecar.registry.courses), true);
  assert.throws(() => { sidecar.registry.courses.push({}); }, TypeError);
});

test('can exclude recommended prerequisites without mutating indexes', () => {
  const sidecar = loadRoadmapSidecar({ baseDir: packageRoot });
  const all = sidecar.getPrerequisites('PY-L2-C05');
  const required = sidecar.getPrerequisites('PY-L2-C05', { includeRecommended: false });
  assert.ok(all.length > required.length);
  assert.equal(required.some(edge => edge.type === 'recommended'), false);
  assert.equal(Object.isFrozen(all), true);
  assert.equal(Object.isFrozen(required), true);
});

test('fails closed when a sidecar file is tampered', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'bauman-sidecar-tamper-'));
  try {
    fs.cpSync(packageRoot, temp, { recursive: true });
    fs.appendFileSync(path.join(temp, 'data', 'registry.json'), '\n');
    assert.throws(() => loadRoadmapSidecar({ baseDir: temp }), /hash mismatch/);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('fails closed when a required sidecar file is missing', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'bauman-sidecar-missing-'));
  try {
    fs.cpSync(packageRoot, temp, { recursive: true });
    fs.rmSync(path.join(temp, 'data', 'mappingReport.json'));
    assert.throws(() => loadRoadmapSidecar({ baseDir: temp }), /Missing Roadmap sidecar file/);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
