import { createHash } from 'node:crypto';

export const WIDGET_DECK_SCHEMA = 'RUSSIAN_WIDGET_DECK_V1';
const PROJECT = 'project:bauman-master-ai-system';
const REQUIRED_SCOPES = Object.freeze(['RU_TEXT','RU_STRESS','VI_MEANING','SENSE']);
const clean = x => typeof x === 'string' ? x.trim() : '';
const rows = x => Array.isArray(x) ? x : [];
const obj = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const hex = x => /^[a-f0-9]{64}$/.test(clean(x));
const iso = x => typeof x === 'string' && !Number.isNaN(Date.parse(x)) && new Date(x).toISOString() === x;
const unique = a => new Set(a).size === a.length;
const exactlyOne = (collection, predicate) => {
  const matches = rows(collection).filter(predicate);
  return matches.length === 1 ? matches[0] : null;
};
const isHttps = x => {
  try { const u = new URL(x); return u.protocol === 'https:' && !u.username && !u.password; }
  catch { return false; }
};

function stable(value) {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
  if (obj(value)) return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + stable(value[k])).join(',') + '}';
  return JSON.stringify(value);
}
export function sha256(value) {
  return createHash('sha256').update(stable(value), 'utf8').digest('hex');
}
export function widgetLexicalPayload(item) {
  return {
    contentId: clean(item?.contentId),
    revision: clean(item?.revision),
    senseId: clean(item?.senseId),
    textRu: clean(item?.textRu),
    stressMarked: clean(item?.stressMarked),
    meaningVi: clean(item?.meaningVi),
    stage: clean(item?.stage)
  };
}
function reviewerAuthorized(registry, reviewerId) {
  if (registry?.schema !== 'RUSSIAN_ENGINE_RU03_REVIEWERS_V1' ||
      registry?.state !== 'VERIFIED_HUMAN_REVIEWERS') return false;
  const reviewer = exactlyOne(registry.reviewers, r => r.id === reviewerId);
  return reviewer?.type === 'HUMAN' &&
    reviewer?.authority === 'RU03' &&
    reviewer?.status === 'ACTIVE' &&
    reviewer?.credentialsVerified === true &&
    Boolean(clean(reviewer?.verificationEvidenceId));
}
function approvedAudio(item, approval, rights) {
  const audio = item?.audio;
  if (!obj(audio) || !isHttps(audio.url) || !hex(audio.sha256)) return null;
  // Audio approval and offline rights are independent of textual RU03 approval.
  if (approval?.audioSha256 !== audio.sha256 ||
      approval?.audioDecision !== 'APPROVE' ||
      rights?.audioSha256 !== audio.sha256 ||
      rights?.audioOfflineAllowed !== true ||
      !clean(rights?.audioLicenseRef)) return null;
  return { url: audio.url, sha256: audio.sha256, licenseRef: rights.audioLicenseRef };
}
function validStressMarkup(text, marked) {
  const source = text.normalize('NFD');
  const rendered = marked.normalize('NFD');
  if (rendered.replace(/\u0301/g, '') !== source) return false;
  const markedWords = marked.normalize('NFC').split(/[\s\-]+/u);
  for (const word of markedWords) {
    if (!/[А-Яа-яЁё]/u.test(word)) continue;
    const accents = [...word.matchAll(/\u0301/gu)];
    if (accents.length > 1) return false;
    const decomposed = word.normalize('NFD');
    const marks = [...decomposed.matchAll(/\u0301/gu)];
    if (marks.some(match => !/[аеёиоуыэюя]/iu.test(decomposed[match.index - 1] ?? ''))) return false;
    const syllables = (word.match(/[аеёиоуыэюя]/giu) ?? []).length;
    if (syllables > 1 && marks.length === 0 && !/[ёЁ]/u.test(word)) return false;
    if (marks.length && /[ёЁ]/u.test(word)) return false;
  }
  return true;
}

function validated(item, context) {
  if (!obj(item) || item.state !== 'PUBLISHED_REFERENCE' ||
      item.provenance?.status !== 'VERIFIED' ||
      item.validationResult !== 'VERIFIED' ||
      item.withdrawn === true || clean(item.supersededByRevision)) return null;
  const lex = widgetLexicalPayload(item);
  if (Object.values(lex).some(x => !x) || !/[А-Яа-яЁё]/u.test(lex.textRu)) return null;
  if (!Array.isArray(item.sourceRefs) || !item.sourceRefs.length ||
      !unique(item.sourceRefs) || !item.sourceRefs.every(isHttps)) return null;
  // Structure only: a qualified RU03 reviewer still decides actual Russian stress.
  if (!validStressMarkup(lex.textRu, lex.stressMarked)) return null;

  const fingerprint = sha256({ ...lex, sourceRefs: item.sourceRefs });
  const release = exactlyOne(context.publications?.entries, r =>
    r.contentId === lex.contentId && r.revision === lex.revision);
  if (context.publications?.schema !== 'RUSSIAN_WIDGET_PUBLICATION_REGISTRY_V1' ||
      release?.state !== 'PUBLISHED_REFERENCE' ||
      release?.contentSha256 !== fingerprint ||
      release?.withdrawn === true || clean(release?.supersededByRevision)) return null;

  const review = exactlyOne(context.decisions?.decisions, d =>
    d.contentId === lex.contentId && d.revision === lex.revision &&
    d.senseId === lex.senseId);
  if (context.decisions?.schemaVersion !== 'RUSSIAN_ENGINE_HUMAN_REVIEW_DECISIONS_V1' ||
      review?.authority !== 'RU03' || review?.reviewerType !== 'HUMAN' ||
      review?.decision !== 'APPROVE' || !iso(review?.decidedAt) ||
      review?.contentSha256 !== fingerprint || !clean(review?.decisionId) ||
      !REQUIRED_SCOPES.every(s => rows(review.scopes).includes(s)) ||
      !reviewerAuthorized(context.reviewers, review.reviewerId)) return null;

  const right = exactlyOne(context.rights?.entries, r =>
    r.contentId === lex.contentId && r.revision === lex.revision &&
    r.senseId === lex.senseId);
  if (context.rights?.schema !== 'RUSSIAN_WIDGET_RIGHTS_V1' ||
      right?.contentSha256 !== fingerprint ||
      right?.displayAllowed !== true || right?.offlineCacheAllowed !== true ||
      right?.revoked === true || !isHttps(right?.licenseUrl) ||
      !item.sourceRefs.every(s => rows(right.sourceRefs).includes(s))) return null;
  return {
    ...lex,
    contentSha256: fingerprint,
    sourceRefs: [...item.sourceRefs],
    approvalDecisionId: review.decisionId,
    reviewerEvidenceId: context.reviewers.reviewers.find(r => r.id === review.reviewerId).verificationEvidenceId,
    licenseUrl: right.licenseUrl,
    audio: approvedAudio(item, review, right)
  };
}

/**
 * Read-only projection of explicitly supplied Bauman-owned source registries.
 * It neither approves content nor reads raw vocab.json. Missing/stale proof => omit.
 * Callers must bind registries to a trusted reviewed source revision, not UI input.
 */
export function buildRussianWidgetDeck({
  candidates = [], publications = null, reviewers = null,
  decisions = null, rights = null, generatedAt, expiresAt
} = {}) {
  if (!iso(generatedAt) || !iso(expiresAt)) throw new Error('generatedAt and expiresAt must be explicit ISO-8601');
  const lifetimeMs = Date.parse(expiresAt) - Date.parse(generatedAt);
  if (lifetimeMs <= 0 || lifetimeMs > 30 * 86400000) {
    throw new Error('widget deck expiry must be after generation and within 30 days');
  }
  if (!Array.isArray(candidates)) throw new TypeError('candidates must be an array');
  const ids = candidates.map(x => clean(x?.contentId));
  if (!unique(ids)) throw new Error('duplicate contentId or competing revisions: fail closed');
  const context = {publications, reviewers, decisions, rights};
  const items = candidates.map(x => validated(x, context)).filter(Boolean)
    .sort((a,b) => a.contentId.localeCompare(b.contentId) || a.revision.localeCompare(b.revision));
  const contentRevision = sha256(items.map(x => [x.contentId,x.revision,x.contentSha256,x.approvalDecisionId]));
  return Object.freeze({
    schemaVersion: WIDGET_DECK_SCHEMA,
    sourceProjectId: PROJECT,
    contentRevision,
    generatedAt,
    expiresAt,
    status: items.length ? 'REVIEWED_CONTENT_PROJECTION' : 'NO_AUTHORIZED_CONTENT',
    items,
    diagnostics: { candidates: candidates.length, exported: items.length, withheld: candidates.length - items.length },
    // A content deck is not a license to deploy, grant mastery or certify RU03.
    productionReleaseAuthorized: false,
    learnerMasteryAuthority: false
  });
}
