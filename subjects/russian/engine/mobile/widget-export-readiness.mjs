import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

/**
 * P1 preflight against actual BAUMAN-owned inputs at fixed repository paths.
 * Reporting is READ ONLY. This module never grants RU03/publication authority
 * and it never produces or writes a vocabulary deck.
 */
const paths = Object.freeze({
  provenance: fileURLToPath(new URL('../../data/provenance.json', import.meta.url)),
  reviewers: fileURLToPath(new URL('../content/review/ru03-reviewers.v1.json', import.meta.url)),
  sceneDecisions: fileURLToPath(new URL('../content/review/real-life-scenes.review-decisions.v1.json', import.meta.url))
});
function load(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}
function nonempty(value) { return Array.isArray(value) && value.length > 0; }

export function inspectActualWidgetExportReadiness() {
  const provenance = load(paths.provenance);
  const reviewers = load(paths.reviewers);
  const sceneDecisions = load(paths.sceneDecisions);
  const vocab = Array.isArray(provenance.datasets)
    ? provenance.datasets.find(x => x.id === 'vocab') : null;
  const blockers = [];
  if (provenance.schema !== 'RUSSIAN_PROVENANCE_REGISTRY_V1' ||
      provenance.policy !== 'FAIL_CLOSED' || vocab?.status !== 'VERIFIED') {
    blockers.push('VOCAB_DATASET_NOT_CANONICALLY_VERIFIED');
  }
  if (reviewers.schema !== 'RUSSIAN_ENGINE_RU03_REVIEWERS_V1' ||
      reviewers.state !== 'VERIFIED_HUMAN_REVIEWERS' ||
      !nonempty(reviewers.reviewers)) {
    blockers.push('NO_VERIFIED_RU03_HUMAN_REVIEWERS');
  }
  if (sceneDecisions.schemaVersion !== 'RUSSIAN_ENGINE_HUMAN_REVIEW_DECISIONS_V1' ||
      sceneDecisions.authority !== 'RU03' ||
      !nonempty(sceneDecisions.decisions)) {
    blockers.push('NO_HUMAN_RU03_SCENE_DECISIONS');
  }
  // No audited, revision-pinned canonical Widget publication/rights/candidate
  // registries are wired to the exporter yet. This is deliberately ALWAYS a
  // blocker until a separately reviewed Bauman integration replaces this gate.
  blockers.push('WIDGET_PUBLICATION_RIGHTS_AND_CANDIDATE_BINDINGS_NOT_APPROVED');
  return Object.freeze({
    schemaVersion: 'RUSSIAN_WIDGET_EXPORT_READINESS_V1',
    sourceProjectId: 'project:bauman-master-ai-system',
    stage: 'P1_PREVIEW',
    state: 'BLOCKED',
    eligibleToExport: false,
    qualityGatePass: false,
    productionAuthority: false,
    blockers
  });
}

const invoked = process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (invoked) {
  try {
    const report = inspectActualWidgetExportReadiness();
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    // CI and release automation must never treat missing RU03 proof as success.
    process.exitCode = 2;
  } catch (error) {
    console.error('[russian-mobile] failed to inspect canonical source: ' +
      (error instanceof Error ? error.message : String(error)));
    process.exitCode = 3;
  }
}
