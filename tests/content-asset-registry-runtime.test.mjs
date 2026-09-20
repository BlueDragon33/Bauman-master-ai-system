import assert from 'node:assert/strict';
import runtime from '../foundation/content-registry/content-asset-registry.js';

const checksum={
  registryId:'bdr:checksum:test:file-001',algorithm:'sha256',
  digest:'a'.repeat(64),byteLength:10,recordVersion:1
};
const source={
  registryId:'bdr:source:test:source-001',canonicalEntityId:'bd:source:test:source-001',
  sourceType:'repository',title:'Source',locator:{kind:'repository_relative',value:'subjects/test/source.pdf'},
  capturedAt:'2026-09-17T00:00:00Z',recordVersion:1
};
const asset={
  registryId:'bdr:asset:test:file-001',canonicalEntityId:'bd:source:test:source-001',
  assetType:'pdf',mediaType:'application/pdf',checksumId:checksum.registryId,
  locators:[{kind:'repository_relative',value:'subjects/test/source.pdf'}],state:'verified',recordVersion:1
};

let registry=runtime.emptyRegistry();
const original=structuredClone(registry);
registry=runtime.appendRecord(registry,source);
assert.deepEqual(original,runtime.emptyRegistry(),'append must not mutate the original registry');
registry=runtime.appendRecord(registry,checksum);
registry=runtime.appendRecord(registry,asset);
assert.equal(runtime.assertIntegrity(registry),true);

assert.throws(()=>runtime.appendRecord(registry,asset),/DUPLICATE_RECORD/);
assert.throws(()=>runtime.appendRecord(runtime.emptyRegistry(),asset),/CHECKSUM_MISSING/);
assert.throws(()=>runtime.validateLocator({kind:'repository_relative',value:'C:\\Bauman\\x.pdf'}),/NON_PORTABLE_LOCATOR/);
assert.throws(()=>runtime.validateLocator({kind:'repository_relative',value:'../x.pdf'}),/NON_PORTABLE_LOCATOR/);
assert.throws(()=>runtime.validateLocator({kind:'https_url',value:'http://example.com/x.pdf'}),/INSECURE_EXTERNAL_LOCATOR/);
assert.throws(()=>runtime.parseRegistryId('bdr:asset:test:Display Name'),/INVALID_REGISTRY_ID_SEGMENT/);

const badChecksum={...checksum,registryId:'bdr:checksum:test:bad-001',digest:'ABC'};
assert.throws(()=>runtime.appendRecord(registry,badChecksum),/INVALID_CHECKSUM/);

const missingSourceEvent={
  registryId:'bdr:provenance:test:event-001',eventType:'imported',subjectId:asset.registryId,
  sourceIds:['bdr:source:test:missing'],at:'2026-09-17T00:00:00Z',actor:'bd:person:test:maintainer',recordVersion:1
};
assert.throws(()=>runtime.appendRecord(registry,missingSourceEvent),/PROVENANCE_SOURCE_MISSING/);

const before=JSON.stringify(registry);
runtime.canonicalIndex(registry);
runtime.listByType(registry,'asset');
runtime.findRecord(registry,asset.registryId);
assert.equal(JSON.stringify(registry),before,'read operations must not mutate registry');

console.log('CONTENT_ASSET_REGISTRY_RUNTIME_TEST=PASS');
console.log(JSON.stringify({negativeCases:8,records:3},null,2));
