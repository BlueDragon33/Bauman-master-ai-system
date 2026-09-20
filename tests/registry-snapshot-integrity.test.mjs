import assert from 'node:assert/strict';
import registryApi from '../foundation/content-registry/content-asset-registry.js';
import snapshot from '../foundation/content-registry/registry-snapshot.js';
import assetIntegrity from '../foundation/content-registry/asset-integrity.js';
import integrity from '../foundation/content-registry/registry-snapshot-integrity.js';

let registry=registryApi.emptyRegistry();
registry=registryApi.appendRecord(registry,{registryId:'bdr:source:test:seal-s-001',canonicalEntityId:'bd:source:test:seal-s-001',sourceType:'repository',title:'Original',locator:{kind:'repository_relative',value:'subjects/test/s.txt'},capturedAt:'2026-09-18T00:00:00Z',recordVersion:1});
const at='2026-09-18T13:00:00.000Z';
const envelope=await integrity.seal(registry,at);

assert.equal((await integrity.verifyEnvelope({...envelope,schema:'OTHER'})).reason,'schema');
assert.equal((await integrity.verifyEnvelope({...envelope,sealedAt:'2026-09-18T13:00:00Z'})).reason,'sealed_at');
assert.equal((await integrity.verifyEnvelope({...envelope,recordCount:99})).reason,'metadata');
assert.equal((await integrity.verifyEnvelope({...envelope,checksum:{...envelope.checksum,digest:'0'.repeat(64)}})).reason,'checksum_digest_mismatch');

const tamperedRegistry=structuredClone(registry);
tamperedRegistry.records.source['bdr:source:test:seal-s-001'].title='Tampered but structurally valid';
const tamperedSnapshot=snapshot.serializeSnapshot(tamperedRegistry);
const tampered=await integrity.verifyEnvelope({...envelope,snapshot:tamperedSnapshot});
assert.equal(tampered.reason,'checksum_byte_length_and_digest_mismatch');

const recomputed=await assetIntegrity.sha256(tamperedSnapshot);
const validButRecomputed={...envelope,snapshot:tamperedSnapshot,checksum:recomputed};
const recomputedCheck=await integrity.verifyEnvelope(validButRecomputed);
assert.equal(recomputedCheck.ok,true,'checksum envelopes detect corruption but are not signatures');

const nonCanonical={...envelope,snapshot:JSON.stringify(JSON.parse(envelope.snapshot),null,2)};
assert.equal((await integrity.verifyEnvelope(nonCanonical)).reason,'snapshot_noncanonical');

await assert.rejects(()=>integrity.importVerified({...envelope,checksum:{...envelope.checksum,digest:'f'.repeat(64)}}),/VERIFY_FAILED/);
assert.equal((await integrity.verifyEnvelope('{broken')).reason,'not_object');

const before=JSON.stringify(registry);
await integrity.verifyEnvelope(envelope);
assert.equal(JSON.stringify(registry),before,'verification must be read-only');

console.log('REGISTRY_SNAPSHOT_INTEGRITY_TEST=PASS');
console.log(JSON.stringify({negativeCases:7,corruptionDetected:true,recomputedChecksumAcceptedByDesign:true,readOnly:true},null,2));
