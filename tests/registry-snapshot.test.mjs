import assert from 'node:assert/strict';
import registryApi from '../foundation/content-registry/content-asset-registry.js';
import snapshot from '../foundation/content-registry/registry-snapshot.js';

let registry=registryApi.emptyRegistry();
registry=registryApi.appendRecord(registry,{registryId:'bdr:source:test:s-001',canonicalEntityId:'bd:source:test:s-001',sourceType:'repository',title:'S',locator:{kind:'repository_relative',value:'subjects/test/s.txt'},capturedAt:'2026-09-18T00:00:00Z',recordVersion:1});
const base=JSON.parse(snapshot.serializeSnapshot(registry));

assert.throws(()=>snapshot.parseSnapshot('{broken'),/INVALID_JSON/);
assert.throws(()=>snapshot.parseSnapshot({...base,schema:'OTHER'}),/SCHEMA_MISMATCH/);
assert.throws(()=>snapshot.parseSnapshot({...base,recordCount:99}),/RECORD_COUNT_MISMATCH/);

const duplicate=structuredClone(base);
duplicate.records.source.push(structuredClone(duplicate.records.source[0]));
duplicate.recordCount++;
assert.throws(()=>snapshot.parseSnapshot(duplicate),/DUPLICATE_RECORD/);

const wrongBucket=structuredClone(base);
wrongBucket.records.asset=[structuredClone(wrongBucket.records.source[0])];
wrongBucket.records.source=[];
assert.throws(()=>snapshot.parseSnapshot(wrongBucket),/BUCKET_TYPE_MISMATCH/);

const missingRef=structuredClone(base);
missingRef.records.checksum=[{registryId:'bdr:checksum:test:c-001',algorithm:'sha256',digest:'a'.repeat(64),byteLength:1,recordVersion:1}];
missingRef.records.asset=[{registryId:'bdr:asset:test:a-001',canonicalEntityId:'bd:artifact:test:a-001',assetType:'document',mediaType:'text/plain',checksumId:'bdr:checksum:test:missing',locators:[{kind:'repository_relative',value:'subjects/test/a.txt'}],state:'verified',recordVersion:1}];
missingRef.recordCount=3;
assert.throws(()=>snapshot.parseSnapshot(missingRef),/CHECKSUM_MISSING/);

const unknown=structuredClone(base);
unknown.records.other=[];
assert.throws(()=>snapshot.parseSnapshot(unknown),/UNKNOWN_RECORD_BUCKET/);

const canonicalA=snapshot.stableStringify({z:1,a:{y:2,x:3}});
const canonicalB=snapshot.stableStringify({a:{x:3,y:2},z:1});
assert.equal(canonicalA,canonicalB);

const before=JSON.stringify(registry);
snapshot.serializeSnapshot(registry);
assert.equal(JSON.stringify(registry),before,'snapshot export must be read-only');

console.log('REGISTRY_SNAPSHOT_TEST=PASS');
console.log(JSON.stringify({negativeCases:6,readOnly:true,canonicalOrdering:true},null,2));
