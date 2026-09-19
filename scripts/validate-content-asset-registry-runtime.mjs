import assert from 'node:assert/strict';
import runtime from '../foundation/content-registry/content-asset-registry.js';
import fs from 'node:fs';

const fixture=JSON.parse(fs.readFileSync('foundation/content-registry/examples/step1-registry-fixture.v1.json','utf8'));
const rows=fixture.records;
let registry=runtime.emptyRegistry();

const append=row=>{registry=runtime.appendRecord(registry,row);};
rows.sources.forEach(append);
rows.checksums.forEach(append);
rows.assets.forEach(append);
rows.provenance.forEach(append);
rows.contents.forEach(append);
rows.access.forEach(append);

assert.equal(runtime.schema,'BAUMAN_CONTENT_ASSET_REGISTRY_RUNTIME_V1');
assert.equal(runtime.assertIntegrity(registry),true);
assert.equal(runtime.listByType(registry,'asset').length,1);
assert.equal(runtime.listByType(registry,'source').length,1);
assert.equal(runtime.findRecord(registry,rows.assets[0].registryId).checksumId,rows.assets[0].checksumId);

const index=runtime.canonicalIndex(registry);
const canonicalId=rows.sources[0].canonicalEntityId;
assert.deepEqual(index[canonicalId].sort(),[
  rows.assets[0].registryId,
  rows.contents[0].registryId,
  rows.sources[0].registryId
].sort());

assert.equal(Object.keys(registry.records).sort().join(','),'access,asset,checksum,content,provenance,source');
console.log('CONTENT_ASSET_REGISTRY_RUNTIME_GATE=PASS');
console.log(JSON.stringify({schema:runtime.schema,records:Object.values(registry.records).reduce((n,b)=>n+Object.keys(b).length,0),canonicalIndexKeys:Object.keys(index).length},null,2));
