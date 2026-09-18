import assert from 'node:assert/strict';
import registryApi from '../foundation/content-registry/content-asset-registry.js';
import provenance from '../foundation/content-registry/provenance-chain.js';
import snapshot from '../foundation/content-registry/registry-snapshot.js';

let registry=registryApi.emptyRegistry();
const put=record=>{registry=registryApi.appendRecord(registry,record);};
const source={registryId:'bdr:source:test:snap-source-001',canonicalEntityId:'bd:source:test:snap-source-001',sourceType:'repository',title:'Snapshot source',locator:{kind:'repository_relative',value:'subjects/test/snapshot.txt'},capturedAt:'2026-09-18T00:00:00Z',recordVersion:1};
const checksum={registryId:'bdr:checksum:test:snap-001',algorithm:'sha256',digest:'c'.repeat(64),byteLength:8,recordVersion:1};
const asset={registryId:'bdr:asset:test:snap-001',canonicalEntityId:'bd:artifact:test:snap-001',assetType:'document',mediaType:'text/plain',checksumId:checksum.registryId,locators:[{kind:'repository_relative',value:'subjects/test/snapshot.txt'}],state:'verified',recordVersion:1};
[source,checksum,asset].forEach(put);
registry=provenance.appendEvent(registry,{registryId:'bdr:provenance:test:snap-import-001',eventType:'imported',subjectId:asset.registryId,sourceIds:[source.registryId],at:'2026-09-18T01:00:00Z',actor:'bd:person:test:maintainer',recordVersion:1});
put({registryId:'bdr:access:test:snap-private-001',scope:asset.registryId,visibility:'private',recordVersion:1});
registry.extensions['x-bauman-test']={note:'preserve me'};

const exported=snapshot.exportSnapshot(registry);
assert.equal(exported.schema,'BAUMAN_CONTENT_ASSET_REGISTRY_SNAPSHOT_V1');
assert.equal(exported.recordCount,5);
const text=snapshot.serializeSnapshot(registry);
const restored=snapshot.importSnapshot(text);
assert.deepEqual(restored,registry);
assert.equal(snapshot.serializeSnapshot(restored),text);
assert.equal(snapshot.canonicalDigestInput(text),text);

console.log('REGISTRY_SNAPSHOT_GATE=PASS');
console.log(JSON.stringify({schema:snapshot.schema,recordCount:exported.recordCount,deterministic:true,extensionsPreserved:true},null,2));
