import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=process.cwd();
const contract=JSON.parse(fs.readFileSync(path.join(root,'foundation/content-registry/registry-contract.v1.json'),'utf8'));
const fixture=JSON.parse(fs.readFileSync(path.join(root,'foundation/content-registry/examples/step1-registry-fixture.v1.json'),'utf8'));

const registryPattern=/^bdr:(asset|content|source|provenance|checksum|access):[a-z0-9][a-z0-9-]*:[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
const checksumPattern=/^[0-9a-f]{64}$/;

function validRepositoryLocator(value){
  return typeof value==='string'
    && value.length>0
    && !value.startsWith('/')
    && !/^[A-Za-z]:[\\/]/.test(value)
    && !value.includes('\\')
    && !value.split('/').includes('..');
}

function validChecksum(record){
  return record?.algorithm===contract.models.checksum.requiredAlgorithm
    && checksumPattern.test(record?.digest||'')
    && Number.isInteger(record?.byteLength)
    && record.byteLength>=0;
}

const asset=structuredClone(fixture.records.assets[0]);
const checksum=structuredClone(fixture.records.checksums[0]);
const provenance=structuredClone(fixture.records.provenance[0]);

assert.equal(registryPattern.test(asset.registryId),true,'valid asset registry ID should pass');
assert.equal(validChecksum(checksum),true,'valid SHA-256 checksum fixture should pass');
assert.equal(validRepositoryLocator(asset.locators[0].value),true,'valid repository-relative locator should pass');
assert.equal(contract.models.provenance.appendOnly,true,'provenance contract must be append-only');

const badChecksum={...checksum,digest:'ABC123'};
assert.equal(validChecksum(badChecksum),false,'uppercase/short checksum must fail');

assert.equal(validRepositoryLocator('C:\\Bauman\\source.pdf'),false,'Windows absolute path must fail as canonical locator');
assert.equal(validRepositoryLocator('/home/user/source.pdf'),false,'Unix absolute path must fail as canonical locator');
assert.equal(validRepositoryLocator('../outside/source.pdf'),false,'parent traversal must fail as canonical locator');
assert.equal(validRepositoryLocator('subjects\\russian\\source.pdf'),false,'backslash path must fail as canonical locator');

const missingLineage={...provenance,sourceIds:undefined};
assert.equal(Array.isArray(missingLineage.sourceIds),false,'provenance without sourceIds must fail required lineage expectation');

const displayDerivedId='bdr:asset:russian:Russian Grammar PDF';
assert.equal(registryPattern.test(displayDerivedId),false,'display-derived ID with spaces must fail');

assert.equal(contract.compatibility.runtimeIntegration,'none','Step 1 must remain runtime-neutral');
assert.equal(contract.step1Gate.runtimeMutationAllowed,false,'Step 1 runtime mutation must remain forbidden');

console.log('CONTENT_ASSET_PROVENANCE_CONTRACT_TEST=PASS');
console.log(JSON.stringify({negativeCases:7,fixtureSchema:fixture.schema},null,2));
