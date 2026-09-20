import assert from 'node:assert/strict';
import registryApi from '../foundation/content-registry/content-asset-registry.js';
import provenance from '../foundation/content-registry/provenance-chain.js';

let registry=registryApi.emptyRegistry();
const append=record=>{registry=registryApi.appendRecord(registry,record);};
const source={registryId:'bdr:source:test:original-001',canonicalEntityId:'bd:source:test:original-001',sourceType:'repository',title:'Original',locator:{kind:'repository_relative',value:'subjects/test/original.txt'},capturedAt:'2026-09-17T00:00:00Z',recordVersion:1};
const sourceChecksum={registryId:'bdr:checksum:test:original-001',algorithm:'sha256',digest:'a'.repeat(64),byteLength:10,recordVersion:1};
const derivedChecksum={registryId:'bdr:checksum:test:derived-001',algorithm:'sha256',digest:'b'.repeat(64),byteLength:20,recordVersion:1};
const sourceAsset={registryId:'bdr:asset:test:original-001',canonicalEntityId:'bd:artifact:test:original-001',assetType:'document',mediaType:'text/plain',checksumId:sourceChecksum.registryId,locators:[{kind:'repository_relative',value:'subjects/test/original.txt'}],state:'verified',recordVersion:1};
const derivedAsset={registryId:'bdr:asset:test:derived-001',canonicalEntityId:'bd:artifact:test:derived-001',assetType:'document',mediaType:'text/plain',checksumId:derivedChecksum.registryId,locators:[{kind:'repository_relative',value:'subjects/test/derived.txt'}],state:'verified',recordVersion:1};
[source,sourceChecksum,derivedChecksum,sourceAsset,derivedAsset].forEach(append);

const imported={registryId:'bdr:provenance:test:original-import-001',eventType:'imported',subjectId:sourceAsset.registryId,sourceIds:[source.registryId],at:'2026-09-17T01:00:00Z',actor:'bd:person:test:maintainer',recordVersion:1};
registry=provenance.appendEvent(registry,imported);
const transformed={registryId:'bdr:provenance:test:derived-transform-001',eventType:'transformed',subjectId:derivedAsset.registryId,sourceIds:[source.registryId],inputIds:[sourceAsset.registryId],at:'2026-09-17T02:00:00Z',actor:'bd:person:test:maintainer',recordVersion:1};
registry=provenance.appendEvent(registry,transformed);
const verified={registryId:'bdr:provenance:test:derived-verify-001',eventType:'verified',subjectId:derivedAsset.registryId,sourceIds:[source.registryId],checksumId:derivedChecksum.registryId,previousEventId:transformed.registryId,at:'2026-09-17T03:00:00Z',actor:'bd:person:test:maintainer',recordVersion:1};
registry=provenance.appendEvent(registry,verified);

assert.equal(provenance.schema,'BAUMAN_PROVENANCE_CHAIN_V1');
assert.equal(provenance.assertProvenanceIntegrity(registry),true);
assert.equal(provenance.eventsForSubject(registry,derivedAsset.registryId).length,2);
assert.equal(provenance.latestEvent(registry,derivedAsset.registryId).registryId,verified.registryId);

const trace=provenance.traceLineage(registry,derivedAsset.registryId);
assert.deepEqual(trace.subjectIds,[derivedAsset.registryId,sourceAsset.registryId].sort());
assert.deepEqual(trace.sourceIds,[source.registryId]);
assert.deepEqual(trace.eventIds,[imported.registryId,transformed.registryId,verified.registryId].sort());
assert.deepEqual(trace.checksumIds,[derivedChecksum.registryId]);

console.log('PROVENANCE_CHAIN_GATE=PASS');
console.log(JSON.stringify({schema:provenance.schema,subjects:trace.subjectIds.length,sources:trace.sourceIds.length,events:trace.eventIds.length,checksums:trace.checksumIds.length},null,2));
