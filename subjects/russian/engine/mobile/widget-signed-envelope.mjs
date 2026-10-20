import { createPublicKey, verify } from 'node:crypto';
import { sha256, widgetLexicalPayload } from './widget-deck.mjs';
import { inspectActualWidgetExportReadiness } from './widget-export-readiness.mjs';

// Crypto-only adapter for the exact iOS SignedDeckPackage wire format.
// Public keys are CALLER-SUPPLIED for signature checking, NOT trusted release
// authority. This module cannot sign, approve RU03 content or publish anything.
const MAX_BYTES = 256_000;
const SPKI_ED25519_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');
const lexicalFields = ['contentId', 'revision', 'senseId', 'textRu', 'stressMarked', 'meaningVi', 'stage'];
const itemFields = [...lexicalFields, 'contentSha256', 'sourceRefs', 'approvalDecisionId', 'reviewerEvidenceId', 'licenseUrl', 'audio'];
const deckFields = ['schemaVersion', 'sourceProjectId', 'contentRevision', 'generatedAt', 'expiresAt', 'status', 'items', 'diagnostics', 'productionReleaseAuthorized', 'learnerMasteryAuthority'];
const audioFields = ['url', 'sha256', 'licenseRef'];
const isObj = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const exact = (o, keys) => isObj(o) && Object.keys(o).length === keys.length && keys.every(k => Object.hasOwn(o,k));
const hex64 = x => typeof x === 'string' && /^[a-f0-9]{64}$/.test(x);
const bounded = (x, cap) => typeof x === 'string' && x.length > 0 && Buffer.byteLength(x,'utf8') <= cap;
const https = x => {
  try { const u = new URL(x); return u.protocol === 'https:' && u.hostname && !u.username && !u.password; }
  catch { return false; }
};
const iso = s => typeof s === 'string' && Number.isFinite(Date.parse(s)) && new Date(s).toISOString() === s;
function requireValid(ok, reason) { if (!ok) throw new Error('WIDGET_ENVELOPE_REJECTED:' + reason); }
function buf(x, expectedSize, name) {
  requireValid(Buffer.isBuffer(x) || x instanceof Uint8Array, name + '_MUST_BE_BYTES');
  const b = Buffer.from(x);
  requireValid(expectedSize === null ? (b.length > 0 && b.length <= MAX_BYTES) : b.length === expectedSize, name + '_SIZE');
  return b;
}
function validItem(w) {
  if (!exact(w,itemFields)) return false;
  if (!lexicalFields.every(k => bounded(w[k],k==='stressMarked'?768:k==='meaningVi'?1024:k==='textRu'?512:128))) return false;
  if (!/^[a-zA-Z0-9._-]{1,80}$/.test(w.contentId) || !hex64(w.contentSha256)) return false;
  if (!Array.isArray(w.sourceRefs) || w.sourceRefs.length===0 || w.sourceRefs.length>16 ||
      w.sourceRefs.some(x=>!https(x)) || new Set(w.sourceRefs).size!==w.sourceRefs.length) return false;
  if (!https(w.licenseUrl) || !bounded(w.approvalDecisionId,1024) || !bounded(w.reviewerEvidenceId,1024)) return false;
  if (w.audio!==null && !(exact(w.audio,audioFields) && https(w.audio.url) && hex64(w.audio.sha256) && bounded(w.audio.licenseRef,1024))) return false;
  return w.contentSha256 === sha256({...widgetLexicalPayload(w),sourceRefs:w.sourceRefs});
}
function validDeck(deck, now) {
  requireValid(exact(deck,deckFields), 'DECK_SHAPE');
  requireValid(deck.schemaVersion==='RUSSIAN_WIDGET_DECK_V1' &&
    deck.sourceProjectId==='project:bauman-master-ai-system' &&
    deck.status==='REVIEWED_CONTENT_PROJECTION' &&
    deck.productionReleaseAuthorized===false && deck.learnerMasteryAuthority===false,'DECK_AUTHORITY');
  requireValid(Array.isArray(deck.items) && deck.items.length>0 && deck.items.length<=100, 'ITEM_COUNT');
  requireValid(deck.items.every(validItem), 'ITEM_FINGERPRINT_OR_SCHEMA');
  requireValid(new Set(deck.items.map(x=>x.contentId)).size===deck.items.length,'DUPLICATE_ID');
  requireValid(hex64(deck.contentRevision) &&
    deck.contentRevision===sha256(deck.items.map(x=>[x.contentId,x.revision,x.contentSha256,x.approvalDecisionId])),'REVISION');
  const d=deck.diagnostics;
  requireValid(exact(d,['candidates','exported','withheld']) &&
    Object.values(d).every(x=>Number.isSafeInteger(x)&&x>=0) &&
    d.exported===deck.items.length && d.candidates===d.exported+d.withheld,'DIAGNOSTICS');
  requireValid(iso(deck.generatedAt) && iso(deck.expiresAt),'TIMESTAMPS');
  const issued=Date.parse(deck.generatedAt), expires=Date.parse(deck.expiresAt);
  requireValid(expires>issued && expires-issued<=30*86400000 && issued<=now+300000 && expires>now,'EXPIRED_OR_FUTURE');
}

/**
 * Assemble a mathematically verified Ed25519 package for iOS.
 * The actual producer must independently gate canonical source approvals,
 * offline/display rights, release identity and key authority BEFORE calling.
 * Positive results here are NOT an RU03 acceptance or a release permission.
 * No key generation, signing, disk write or network call occurs.
 */
export function assembleCryptographicWidgetEnvelope({payloadBytes, signature, publicKeyRaw, keyId, now=Date.now()}) {
  requireValid(typeof keyId==='string' && /^[A-Za-z0-9._-]{1,128}$/.test(keyId), 'KEY_ID');
  const payload=buf(payloadBytes,null,'PAYLOAD');
  const sig=buf(signature,64,'SIGNATURE');
  const raw=buf(publicKeyRaw,32,'PUBLIC_KEY');
  requireValid(Number.isFinite(now),'CLOCK');
  let deck;
  try { deck = JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(payload)); }
  catch { throw new Error('WIDGET_ENVELOPE_REJECTED:PAYLOAD_JSON'); }
  validDeck(deck,now);
  const pub=createPublicKey({key:Buffer.concat([SPKI_ED25519_PREFIX,raw]),format:'der',type:'spki'});
  requireValid(verify(null,payload,pub,sig),'SIGNATURE_INVALID');
  const bytes=Buffer.from(JSON.stringify({keyId,payloadBase64:payload.toString('base64'),signatureBase64:sig.toString('base64')}),'utf8');
  requireValid(bytes.length<=MAX_BYTES,'WRAPPER_TOO_LARGE');
  return bytes;
}

/** Canonical release entrypoint: source-of-truth never comes from a caller flag.
 * Current Bauman actual-source readiness is intentionally BLOCKED. No package
 * can be produced here without a separately authorized source/rights/release
 * integration and signing authority, regardless of test fixture signatures.
 */
export function assembleCanonicalWidgetReleaseEnvelope(args) {
  const readiness=inspectActualWidgetExportReadiness();
  requireValid(readiness.state==='READY' && readiness.eligibleToExport===true &&
    readiness.qualityGatePass===true && readiness.productionAuthority===true, 'SOURCE_NOT_AUTHORIZED');
  return assembleCryptographicWidgetEnvelope(args);
}
