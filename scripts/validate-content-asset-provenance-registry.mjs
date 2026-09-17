import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const contractPath=path.join(root,'foundation/content-registry/registry-contract.v1.json');
const fixturePath=path.join(root,'foundation/content-registry/examples/step1-registry-fixture.v1.json');
const domainPath=path.join(root,'foundation/domain-model/domain-contract.v1.json');
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const fail=message=>{throw new Error(`CONTENT_ASSET_PROVENANCE_GATE=FAIL\n${message}`)};
const assert=(condition,message)=>{if(!condition)fail(message)};

for(const file of [contractPath,fixturePath,domainPath]) assert(fs.existsSync(file),`Missing ${path.relative(root,file)}`);
const contract=readJson(contractPath);
const fixture=readJson(fixturePath);
const domain=readJson(domainPath);

assert(contract.schema==='BAUMAN_CONTENT_ASSET_PROVENANCE_REGISTRY_V1','Unexpected registry schema');
assert(contract.contractVersion===1,'Registry contract version must be 1');
assert(contract.status==='foundation','Registry contract must remain foundation-scoped in L10 Step 1');
assert(contract.compatibility?.strategy==='additive','Registry compatibility must be additive');
assert(contract.compatibility?.runtimeIntegration==='none','L10 Step 1 must not integrate with runtime');
assert(contract.compatibility?.legacyPathsPreserved===true,'Legacy paths must be preserved');
assert(contract.compatibility?.legacyContentUntouched===true,'Legacy content must remain untouched');
assert(contract.compatibility?.breakingChangesForbidden===true,'Breaking changes must be forbidden');

assert(domain.schema===contract.domainDependency?.schema,'Registry must depend on the current foundation domain schema');
assert(domain.contractVersion===contract.domainDependency?.contractVersion,'Registry domain contract version mismatch');
assert(contract.domainDependency?.mustNotMutateDomainContract===true,'L10 registry must not mutate L9 domain contract');
for(const kind of contract.domainDependency?.canonicalEntityKinds||[]){
  assert(domain.identity?.allowedKinds?.includes(kind),`Registry canonical kind is not allowed by domain contract: ${kind}`);
}
assert(domain.extensionPolicy?.adaptersPreferredOverCoreChanges===true,'Domain adapter-first invariant missing');

const requiredModels=['asset','content','source','provenance','checksum','access'];
for(const model of requiredModels) assert(contract.models?.[model],`Missing registry model: ${model}`);

assert(contract.models.provenance.appendOnly===true,'Provenance must be append-only');
assert(contract.provenancePolicy?.appendOnly===true,'Provenance policy must be append-only');
assert(contract.provenancePolicy?.generatedContentMustRetainSourceLineage===true,'Generated content must retain source lineage');
assert(contract.provenancePolicy?.transformMustReferenceInputs===true,'Transforms must reference their inputs');
assert(contract.provenancePolicy?.historyMayNotBeRewritten===true,'Provenance history must not be rewritten');

assert(contract.models.checksum.requiredAlgorithm==='sha256','SHA-256 must be the required checksum algorithm');
assert(contract.models.checksum.digestLength===64,'SHA-256 lowercase hex digest must be 64 characters');
assert(contract.models.checksum.immutable===true,'Checksum records must be immutable');
assert(contract.integrity?.checksumRequiredForAssets===true,'Assets must require checksums');
assert(contract.integrity?.checksumMismatchState==='quarantined','Checksum mismatch must quarantine assets');

assert(contract.locatorPolicy?.repositoryRelative?.separator==='/','Portable repository locators must use forward slash');
assert(contract.locatorPolicy?.repositoryRelative?.mustNotContainDriveLetter===true,'Canonical repository locators must reject drive letters');
assert(contract.locatorPolicy?.repositoryRelative?.mustNotContainParentTraversal===true,'Canonical repository locators must reject parent traversal');
assert(contract.locatorPolicy?.externalUrl?.scheme==='https','Canonical external URLs must use HTTPS');

assert(contract.step1Gate?.runtimeMutationAllowed===false,'Step 1 must not mutate runtime');
assert(contract.step1Gate?.requiresValidFixture===true,'Step 1 must require a valid fixture');
assert(contract.step1Gate?.requiresNegativeContractTests===true,'Step 1 must require negative contract tests');
assert(contract.step1Gate?.requiresDomainCompatibilityCheck===true,'Step 1 must check L9 domain compatibility');

const registryPattern=/^bdr:(asset|content|source|provenance|checksum|access):[a-z0-9][a-z0-9-]*:[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
const canonicalPattern=/^bd:(source|artifact):[a-z0-9][a-z0-9-]*:[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
const checksumPattern=/^[0-9a-f]{64}$/;
const drivePattern=/^[A-Za-z]:[\\/]/;

function validateLocator(locator,label){
  assert(locator&&typeof locator==='object',`${label} locator must be an object`);
  assert(contract.locatorPolicy.canonicalLocatorKinds.includes(locator.kind),`${label} unsupported locator kind: ${locator.kind}`);
  assert(typeof locator.value==='string'&&locator.value.length>0,`${label} locator value is required`);
  if(locator.kind==='repository_relative'){
    assert(!locator.value.startsWith('/'),`${label} repository locator must be relative`);
    assert(!drivePattern.test(locator.value),`${label} repository locator must not contain a drive letter`);
    assert(!locator.value.includes('\\'),`${label} repository locator must use forward slashes`);
    assert(!locator.value.split('/').includes('..'),`${label} repository locator must not traverse parents`);
  }
  if(locator.kind==='https_url') assert(/^https:\/\//.test(locator.value),`${label} external URL must use HTTPS`);
  if(locator.kind==='content_hash') assert(/^sha256:[0-9a-f]{64}$/.test(locator.value),`${label} content hash must be sha256:<64 lowercase hex>`);
}

function validateRequired(record,modelName){
  const model=contract.models[modelName];
  for(const field of model.required) assert(record[field]!==undefined&&record[field]!==null,`${modelName} missing required field: ${field}`);
  assert(registryPattern.test(record.registryId),`${modelName} has invalid registryId: ${record.registryId}`);
  assert(Number.isInteger(record.recordVersion)&&record.recordVersion>=contract.versioning.recordVersionStartsAt,`${modelName} recordVersion must be >= 1`);
}

const records=fixture.records||{};
const collectionMap={sources:'source',checksums:'checksum',assets:'asset',contents:'content',provenance:'provenance',access:'access'};
const seenIds=new Set();
for(const [collection,modelName] of Object.entries(collectionMap)){
  assert(Array.isArray(records[collection])&&records[collection].length>0,`Fixture collection missing or empty: ${collection}`);
  for(const record of records[collection]){
    validateRequired(record,modelName);
    assert(!seenIds.has(record.registryId),`Duplicate registryId in fixture: ${record.registryId}`);
    seenIds.add(record.registryId);
    if(record.canonicalEntityId!==undefined) assert(canonicalPattern.test(record.canonicalEntityId),`${modelName} canonicalEntityId must use bd:source or bd:artifact`);
    if(modelName==='source') validateLocator(record.locator,'source');
    if(modelName==='asset'){
      assert(contract.models.asset.assetTypes.includes(record.assetType),`Unsupported assetType: ${record.assetType}`);
      assert(contract.models.asset.states.includes(record.state),`Unsupported asset state: ${record.state}`);
      assert(Array.isArray(record.locators)&&record.locators.length>0,'Asset requires at least one locator');
      record.locators.forEach((locator,index)=>validateLocator(locator,`asset[${index}]`));
    }
    if(modelName==='checksum'){
      assert(record.algorithm==='sha256','Fixture checksum algorithm must be sha256');
      assert(checksumPattern.test(record.digest),'Fixture checksum digest must be 64 lowercase hex characters');
      assert(Number.isInteger(record.byteLength)&&record.byteLength>=0,'Fixture checksum byteLength must be a non-negative integer');
    }
    if(modelName==='provenance'){
      assert(contract.models.provenance.eventTypes.includes(record.eventType),`Unsupported provenance eventType: ${record.eventType}`);
      assert(Array.isArray(record.sourceIds),'Provenance sourceIds must be an array');
    }
    if(modelName==='access') assert(contract.models.access.visibility.includes(record.visibility),`Unsupported access visibility: ${record.visibility}`);
  }
}

const asset=records.assets[0];
assert(seenIds.has(asset.checksumId),`Asset checksumId not found: ${asset.checksumId}`);
for(const content of records.contents){
  for(const id of content.assetIds||[]) assert(seenIds.has(id),`Content assetId not found: ${id}`);
  for(const id of content.sourceIds||[]) assert(seenIds.has(id),`Content sourceId not found: ${id}`);
  for(const id of content.provenanceEventIds||[]) assert(seenIds.has(id),`Content provenanceEventId not found: ${id}`);
}
for(const event of records.provenance){
  assert(seenIds.has(event.subjectId),`Provenance subjectId not found: ${event.subjectId}`);
  for(const id of event.sourceIds||[]) assert(seenIds.has(id),`Provenance sourceId not found: ${id}`);
}

console.log('CONTENT_ASSET_PROVENANCE_GATE=PASS');
console.log(JSON.stringify({
  schema:contract.schema,
  version:contract.contractVersion,
  models:requiredModels.length,
  fixtureRecords:seenIds.size,
  domainSchema:domain.schema,
  compatibility:contract.compatibility.strategy,
  runtimeIntegration:contract.compatibility.runtimeIntegration
},null,2));
