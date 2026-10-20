import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { assembleCryptographicWidgetEnvelope, assembleCanonicalWidgetReleaseEnvelope } from '../mobile/widget-signed-envelope.mjs';
import { sha256, widgetLexicalPayload } from '../mobile/widget-deck.mjs';

// Entire fixture is synthetic and test-only; it never represents actual RU03
// authority, a live publisher, licensing or a Production signing identity.
const now = Date.parse('2026-10-20T10:00:00.000Z');
function syntheticDeck() {
  const item={
    contentId:'TEST-RU-001',revision:'test-r1',senseId:'test-sense',
    textRu:'привет',stressMarked:'приве́т',meaningVi:'lời chào thân mật',stage:'A1',
    sourceRefs:['https://example.invalid/fictional-source'],
    approvalDecisionId:'SYNTHETIC-NOT-A-DECISION',reviewerEvidenceId:'TEST-ONLY',
    licenseUrl:'https://example.invalid/fictional-license',audio:null
  };
  item.contentSha256=sha256({...widgetLexicalPayload(item),sourceRefs:item.sourceRefs});
  const deck={
    schemaVersion:'RUSSIAN_WIDGET_DECK_V1',sourceProjectId:'project:bauman-master-ai-system',
    generatedAt:'2026-10-20T10:00:00.000Z',expiresAt:'2026-10-21T10:00:00.000Z',
    status:'REVIEWED_CONTENT_PROJECTION',items:[item],
    diagnostics:{candidates:1,exported:1,withheld:0},
    productionReleaseAuthorized:false,learnerMasteryAuthority:false
  };
  deck.contentRevision=sha256(deck.items.map(x=>[x.contentId,x.revision,x.contentSha256,x.approvalDecisionId]));
  return deck;
}
function fixture(overrides={}) {
  const kp=generateKeyPairSync('ed25519');
  const bytes=Buffer.from(JSON.stringify(overrides.deck??syntheticDeck()),'utf8');
  const sig=sign(null,bytes,kp.privateKey);
  const raw=kp.publicKey.export({type:'spki',format:'der'}).subarray(-32);
  return {payloadBytes:bytes,signature:sig,publicKeyRaw:raw,keyId:'TEST-KEY-NOT-RELEASED',now,...overrides};
}
function errorCase(mutate, match) {
  const x=syntheticDeck(); mutate(x);
  assert.throws(()=>assembleCryptographicWidgetEnvelope(fixture({deck:x})),match);
}
test('test-only Ed25519 package matches iOS SignedDeckPackage field encoding',()=>{
  const x=fixture();
  const wire=assembleCryptographicWidgetEnvelope(x);
  const o=JSON.parse(wire.toString('utf8'));
  assert.deepEqual(Object.keys(o),['keyId','payloadBase64','signatureBase64']);
  assert.equal(o.keyId,x.keyId);
  assert.deepEqual(Buffer.from(o.payloadBase64,'base64'),x.payloadBytes);
  assert.deepEqual(Buffer.from(o.signatureBase64,'base64'),x.signature);
});
test('tampered payload and signature cannot be assembled',()=>{
  const x=fixture();
  const tampered=Buffer.from(x.payloadBytes);tampered[2]^=1;
  assert.throws(()=>assembleCryptographicWidgetEnvelope({...x,payloadBytes:tampered}),/SIGNATURE_INVALID|PAYLOAD_JSON|DECK_SHAPE/);
  const signature=Buffer.from(x.signature);signature[0]^=1;
  assert.throws(()=>assembleCryptographicWidgetEnvelope({...x,signature}),/SIGNATURE_INVALID/);
  const another=fixture();
  assert.throws(()=>assembleCryptographicWidgetEnvelope({...x,publicKeyRaw:another.publicKeyRaw}),/SIGNATURE_INVALID/);
});
test('semantic fingerprint mismatch is blocked even with valid test signature',()=>{
  errorCase(x=>{x.items[0].meaningVi='đã bị sửa';},/ITEM_FINGERPRINT_OR_SCHEMA/);
  errorCase(x=>{x.items[0].contentSha256='b'.repeat(64);x.contentRevision=sha256(x.items.map(i=>[i.contentId,i.revision,i.contentSha256,i.approvalDecisionId]));},/ITEM_FINGERPRINT_OR_SCHEMA/);
  errorCase(x=>{x.contentRevision='a'.repeat(64);},/REVISION/);
});
test('unapproved, unsupported and missing content are fail-closed',()=>{
  errorCase(x=>{x.status='NO_AUTHORIZED_CONTENT';x.items=[];},/DECK_AUTHORITY/);
  errorCase(x=>{x.productionReleaseAuthorized=true;},/DECK_AUTHORITY/);
  errorCase(x=>{x.learnerMasteryAuthority=true;},/DECK_AUTHORITY/);
  errorCase(x=>{x.items[0].audio={url:'http://evil.invalid/x',sha256:'a'.repeat(64),licenseRef:'X'};},/ITEM_FINGERPRINT_OR_SCHEMA/);
});
test('expiry and impossible diagnostics are blocked',()=>{
  errorCase(x=>{x.expiresAt='2026-10-20T09:59:59.000Z';},/EXPIRED_OR_FUTURE/);
  errorCase(x=>{x.expiresAt='2026-12-20T10:00:00.000Z';},/EXPIRED_OR_FUTURE/);
  errorCase(x=>{x.diagnostics.exported=42;},/DIAGNOSTICS/);
});
test('reject oversized payload, missing keys and malformed key identifier',()=>{
  const x=fixture();
  assert.throws(()=>assembleCryptographicWidgetEnvelope({...x,payloadBytes:Buffer.alloc(256_001)}),/PAYLOAD_SIZE/);
  assert.throws(()=>assembleCryptographicWidgetEnvelope({...x,publicKeyRaw:Buffer.alloc(0)}),/PUBLIC_KEY_SIZE/);
  assert.throws(()=>assembleCryptographicWidgetEnvelope({...x,keyId:'bad key'}),/KEY_ID/);
});
test('actual Bauman source/release boundary remains closed despite test signature',()=>{
  assert.throws(()=>assembleCanonicalWidgetReleaseEnvelope(fixture()),/SOURCE_NOT_AUTHORIZED/);
});
