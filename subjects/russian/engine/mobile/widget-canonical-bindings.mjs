import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRussianWidgetDeck, sha256 } from './widget-deck.mjs';
import { inspectActualWidgetExportReadiness } from './widget-export-readiness.mjs';

// This is a proposed source-binding location, NOT an approved registry.
// Real lexical candidate, publication, decision and rights bindings are absent.
const ROOT = fileURLToPath(new URL('../../../../', import.meta.url));
const CONTENT = 'subjects/russian/engine/content/';
const MANIFEST = CONTENT + 'widget-source-bindings.v1.json';
const REVIEWERS = CONTENT + 'review/ru03-reviewers.v1.json';
const PARTS = Object.freeze(['candidates', 'publications', 'decisions', 'rights', 'reviewers']);
const maxBytes = 4_000_000;
const hex64 = s => typeof s === 'string' && /^[a-f0-9]{64}$/.test(s);
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
function fail(code) { throw new Error('WIDGET_CANONICAL_BINDING_BLOCKED:' + code); }

// Do not let a checked-in manifest fetch from an arbitrary URL, parent tree,
// symlink or absolute path. Only the Bauman content owner can define sources.
function ownedFile(repoRelativePath) {
  if (typeof repoRelativePath !== 'string' ||
      !repoRelativePath.startsWith(CONTENT) ||
      isAbsolute(repoRelativePath) || repoRelativePath.includes('\\') ||
      repoRelativePath.split('/').some(p => p === '..' || p === '.' || p === '')) fail('UNTRUSTED_SOURCE_PATH');
  const target = resolve(ROOT, repoRelativePath);
  const contentRoot = resolve(ROOT, CONTENT);
  if (!target.startsWith(contentRoot + sep)) fail('UNTRUSTED_SOURCE_PATH');
  let meta, actual;
  try {
    meta = lstatSync(target);
    actual = realpathSync(target);
  } catch { fail('CANONICAL_SOURCE_MISSING'); }
  if (!meta.isFile() || !actual.startsWith(realpathSync(contentRoot) + sep) ||
      !relative(realpathSync(contentRoot), actual) ||
      meta.size === 0 || meta.size > maxBytes) fail('CANONICAL_SOURCE_UNSAFE');
  return target;
}
function fileJSON(path) {
  const bytes = readFileSync(ownedFile(path));
  let value;
  try { value = JSON.parse(bytes.toString('utf8')); }
  catch { fail('INVALID_CANONICAL_JSON'); }
  return { value, digest: createHash('sha256').update(bytes).digest('hex') };
}
function manifest() {
  const m = fileJSON(MANIFEST).value;
  if (!object(m) || m.schema !== 'RUSSIAN_WIDGET_SOURCE_BINDINGS_V1' ||
      m.sourceProjectId !== 'project:bauman-master-ai-system' ||
      m.state !== 'GOVERNANCE_REVIEWED' ||
      !object(m.sources) || Object.keys(m.sources).length !== PARTS.length ||
      PARTS.some(k => !object(m.sources[k]) ||
        !hex64(m.sources[k].sha256) ||
        typeof m.sources[k].path !== 'string')) fail('BINDING_MANIFEST_NOT_APPROVED');
  if (m.sources.reviewers.path !== REVIEWERS ||
      m.sources.decisions.path.endsWith('real-life-scenes.review-decisions.v1.json')) {
    // Scene review decisions are NOT lexical RU03 approval decisions.
    fail('LEXICAL_REVIEW_SOURCE_REQUIRED');
  }
  const paths = PARTS.map(k => m.sources[k].path);
  if (new Set(paths).size !== paths.length || paths.some(p => p === MANIFEST)) fail('DUPLICATE_SOURCE_BINDING');
  return m;
}

/** Read-only inventory of real canonical prerequisites. This never creates a
 * deck and deliberately cannot upgrade blocked readiness to an approval.
 */
export function inspectCanonicalWidgetBindings() {
  const readiness = inspectActualWidgetExportReadiness();
  const blockers = [...readiness.blockers];
  if (!existsSync(resolve(ROOT, MANIFEST))) blockers.push('WIDGET_PINNED_BINDING_MANIFEST_MISSING');
  return Object.freeze({
    schemaVersion: 'RUSSIAN_WIDGET_CANONICAL_BINDINGS_REPORT_V1',
    sourceProjectId: 'project:bauman-master-ai-system',
    state: 'BLOCKED',
    eligibleToExport: false,
    productionAuthority: false,
    blockers: Object.freeze([...new Set(blockers)])
  });
}

/** Production source path only. No caller-supplied candidates/approvals or
 * arbitrary paths. A separate independently reviewed readiness change must
 * enable projection, and a separate authorized release ceremony must sign it.
 */
export function buildCanonicalWidgetDeck({ generatedAt, expiresAt } = {}) {
  const gate = inspectActualWidgetExportReadiness();
  if (gate.state !== 'READY' || gate.eligibleToExport !== true ||
      gate.qualityGatePass !== true || gate.productionAuthority !== true) fail('SOURCE_NOT_AUTHORIZED');
  const pinned = manifest();
  const inputs = {};
  for (const part of PARTS) {
    const {value,digest} = fileJSON(pinned.sources[part].path);
    if (digest !== pinned.sources[part].sha256) fail('SOURCE_DIGEST_MISMATCH');
    inputs[part] = value;
  }
  if (!Array.isArray(inputs.candidates) || inputs.candidates.length === 0 ||
      inputs.reviewers.schema !== 'RUSSIAN_ENGINE_RU03_REVIEWERS_V1' ||
      inputs.reviewers.state !== 'VERIFIED_HUMAN_REVIEWERS' ||
      inputs.decisions.schemaVersion !== 'RUSSIAN_ENGINE_HUMAN_REVIEW_DECISIONS_V1' ||
      inputs.publications.schema !== 'RUSSIAN_WIDGET_PUBLICATION_REGISTRY_V1' ||
      inputs.rights.schema !== 'RUSSIAN_WIDGET_RIGHTS_V1') fail('CANONICAL_REGISTRY_SCHEMA');
  const deck = buildRussianWidgetDeck({ ...inputs, generatedAt, expiresAt });
  if (deck.status !== 'REVIEWED_CONTENT_PROJECTION' || deck.items.length === 0 ||
      !hex64(deck.contentRevision) ||
      deck.contentRevision !== sha256(deck.items.map(x =>
        [x.contentId, x.revision, x.contentSha256, x.approvalDecisionId]))) fail('NO_AUTHORIZED_LEXICAL_CONTENT');
  return deck;
}
