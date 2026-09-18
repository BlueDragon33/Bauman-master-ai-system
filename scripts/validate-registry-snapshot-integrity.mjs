import assert from 'node:assert/strict';
import registryApi from '../foundation/content-registry/content-asset-registry.js';
import provenance from '../foundation/content-registry/provenance-chain.js';
import integrity from '../foundation/content-registry/registry-snapshot-integrity.js';

let registry=registryApi.emptyRegistry();
const put=record=>{registry=registryApi.appendRecord(registry,record);};
const source={registryId:'bdr:source:test:seal-source-001',canonicalEntityId:'bd:source:test:seal-source-001',sourceType:'repository',title:'Integrity source',locator:{kind:'repository_relative',value:'subjects/test/integrity.txt'},capturedAt:'2026-09-18T00:00:00Z',recordVersion:1};
const checksum={registryId:'bdr:checksum:test:seal-001',algorithm:'sha256',digest:'e'.repeat(64),byteLength:16,recordVersion:1};
const asset={registryId:'bdr:asset:test:seal-001',canonicalEntityId:'bd:artifact:test:seal-001',assetType:'document',mediaType:'text/plain',checksumId:checksum.registryId,locators:[{kind:'repository_relative',value:'subjects/test/integrity.txt'}],state:'verified',recordVersion:1};
[source,checksum,asset].forEach(put);
registry=provenance.appendEvent(registry,{registryId:'bdr:provenance:test:seal-import-001',eventType:'imported',subjectId:asset.registryId,sourceIds:[source.registryId],at:'2026-09-18T01:00:00Z',actor:'bd:person:test:maintainer',recordVersion:1});
put({registryId:'bdr:access:test:seal-private-001',scope:asset.registryId,visibility:'private',recordVersion:1});
registry.extensions['x-bauman-integrity-test']={note:'preserve'};
const before=JSON.stringify(registry);

const envelope=await integrity.seal(registry,'2026-09-18T13:00:00.000Z');
assert.equal(envelope.schema,integrity.schema);
assert.equal(envelope.recordCount,5);
assert.equal(envelope.checksum.algorithm,'sha256');
assert.match(envelope.checksum.digest,/^[0-9a-f]{64}$/);
assert.ok(envelope.checksum.byteLength>0);

const checked=await integrity.verifyEnvelope(envelope);
assert.equal(checked.ok,true);
assert.equal(checked.verification.state,'verified');
assert.deepEqual(checked.registry,registry);
assert.deepEqual(await integrity.importVerified(integrity.serializeEnvelope(envelope)),registry);
assert.equal(JSON.stringify(registry),before,'integrity seal and verification must not mutate the source registry');

console.log('REGISTRY_SNAPSHOT_INTEGRITY_GATE=PASS');
console.log(JSON.stringify({schema:integrity.schema,recordCount:envelope.recordCount,algorithm:envelope.checksum.algorithm,verified:checked.ok,sourceImmutable:true},null,2));
