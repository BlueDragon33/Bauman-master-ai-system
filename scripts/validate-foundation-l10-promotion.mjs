import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const exists=rel=>fs.statSync(path.join(root,rel),{throwIfNoEntry:false})?.isFile()===true;
const fail=message=>{throw new Error(`FOUNDATION_L10_PROMOTION_GATE=FAIL\n${message}`)};
const assert=(condition,message)=>{if(!condition)fail(message)};
const manifest=JSON.parse(read('foundation/content-registry/l10-promotion-manifest.v1.json'));

assert(manifest.schema==='BAUMAN_FOUNDATION_L10_PROMOTION_V1','Unexpected promotion manifest schema');
assert(manifest.version===1,'Promotion manifest version must be 1');
assert(manifest.status==='promotion_candidate','L10 must remain a promotion candidate until explicit promotion');
assert(manifest.baseCompatibility?.strategy==='additive','L10 promotion must remain additive');
assert(manifest.baseCompatibility?.legacyRuntimeAuthoritative===true,'Legacy runtime must remain authoritative');
assert(manifest.baseCompatibility?.runtimeIntegration==='none','L10 core must remain runtime-neutral at freeze');
assert(manifest.baseCompatibility?.l9DomainContractGitBlobSha==='0691acecbec6734cb746aa9cb745350880a98d59','Promoted L9 domain baseline drifted');

for(const audit of manifest.requiredAudits||[])assert(exists(`foundation/content-registry/${audit}`),`Missing required audit: ${audit}`);
for(const file of manifest.runtimeRequired||[])assert(exists(file),`Missing required runtime file: ${file}`);
for(const file of manifest.validatorRequired||[])assert(exists(file),`Missing required validator: ${file}`);
for(const file of manifest.testRequired||[])assert(exists(file),`Missing required test: ${file}`);

const contract=JSON.parse(read('foundation/content-registry/registry-contract.v1.json'));
assert(contract.schema==='BAUMAN_CONTENT_ASSET_PROVENANCE_REGISTRY_V1','Registry contract schema drifted');
assert(contract.contractVersion===1,'Registry contract version drifted');
assert(contract.domainDependency?.schema==='BAUMAN_DOMAIN_CONTRACT_V1','L9 domain dependency schema drifted');
assert(contract.domainDependency?.gitBlobSha===manifest.baseCompatibility.l9DomainContractGitBlobSha,'L9 domain dependency blob drifted');
assert(contract.domainDependency?.mustNotMutateDomainContract===true,'L10 may mutate the L9 domain contract');
assert(contract.compatibility?.strategy==='additive','Registry compatibility is no longer additive');
assert(contract.compatibility?.runtimeIntegration==='none','Registry contract gained an unreviewed runtime integration');
assert(contract.compatibility?.legacyPathsPreserved===true,'Legacy content paths are no longer preserved');
assert(contract.compatibility?.legacyContentUntouched===true,'Legacy content is no longer protected');
assert(contract.identity?.rules?.stable===true,'Registry identity is no longer stable');
assert(contract.identity?.rules?.neverDerivedFromDisplayName===true,'Registry identity may derive from display text');

const runtimeFiles=manifest.runtimeRequired.filter(file=>file.endsWith('.js'));
const runtimeText=runtimeFiles.map(read).join('\n');
assert(!/localStorage\s*\.|sessionStorage\s*\.|indexedDB\s*\.|XMLHttpRequest\s*\(|WebSocket\s*\(|fetch\s*\(/.test(runtimeText),'L10 core gained browser/network storage coupling');
assert(!/localStorage\.clear\s*\(|sessionStorage\.clear\s*\(|indexedDB\.deleteDatabase\s*\(/.test(runtimeText),'Destructive storage reset detected');

const schemaSources={
  BAUMAN_CONTENT_ASSET_REGISTRY_RUNTIME_V1:'foundation/content-registry/content-asset-registry.js',
  BAUMAN_ASSET_INTEGRITY_V1:'foundation/content-registry/asset-integrity.js',
  BAUMAN_PROVENANCE_CHAIN_V1:'foundation/content-registry/provenance-chain.js',
  BAUMAN_ACCESS_POLICY_V1:'foundation/content-registry/access-policy.js',
  BAUMAN_CONTENT_ASSET_REGISTRY_SNAPSHOT_V1:'foundation/content-registry/registry-snapshot.js',
  BAUMAN_CONTENT_ASSET_REGISTRY_SNAPSHOT_STORE_V1:'foundation/content-registry/registry-snapshot-store.js',
  BAUMAN_CONTENT_ASSET_REGISTRY_SNAPSHOT_INTEGRITY_V1:'foundation/content-registry/registry-snapshot-integrity.js'
};
for(const [schema,file] of Object.entries(schemaSources))assert(read(file).includes(schema),`Missing frozen schema ${schema} in ${file}`);

const registry=read('foundation/content-registry/content-asset-registry.js');
assert(registry.includes("RECORD_TYPES=Object.freeze(['asset','content','source','provenance','checksum','access'])"),'Registry record families drifted');
assert(registry.includes("VISIBILITY=new Set(['private','course','organization','public'])"),'Visibility model drifted');

const provenance=read('foundation/content-registry/provenance-chain.js');
assert(provenance.includes("const SCHEMA='BAUMAN_PROVENANCE_CHAIN_V1'"),'Provenance schema drifted');
assert(provenance.includes('assertProvenanceIntegrity'),'Provenance integrity gate disappeared');

const access=read('foundation/content-registry/access-policy.js');
assert(access.includes("const ORDER=Object.freeze({private:0,course:1,organization:2,public:3})"),'Access visibility order drifted');
assert(access.includes("'private'"),'Private access boundary disappeared');

const snapshot=read('foundation/content-registry/registry-snapshot.js');
assert(snapshot.includes('stableStringify'),'Canonical deterministic snapshot serialization disappeared');
assert(snapshot.includes('assertProvenanceIntegrity'),'Snapshot no longer requires provenance integrity');

const store=read('foundation/content-registry/registry-snapshot-store.js');
assert(store.includes('stagingKey')&&store.includes('STAGING_VERIFY_FAILED')&&store.includes('FINAL_VERIFY_FAILED'),'Transactional snapshot persistence boundary drifted');
assert(!store.includes('localStorage')&&!store.includes('sessionStorage')&&!store.includes('indexedDB'),'Snapshot store became browser-storage specific');

const integrity=read('foundation/content-registry/registry-snapshot-integrity.js');
assert(integrity.includes("algorithm:'sha256'")||read('foundation/content-registry/asset-integrity.js').includes("algorithm:'sha256'"),'SHA-256 integrity boundary disappeared');
assert(integrity.includes('snapshot_noncanonical'),'Integrity verification no longer rejects noncanonical snapshots');
assert(integrity.includes('VERIFY_FAILED'),'Verified import no longer fails closed');

const audit8=read('foundation/content-registry/AUDIT_L10_STEP8.md');
assert(audit8.includes('does **not** prove who created a snapshot')||audit8.includes('not identity authentication'),'Step 8 no longer documents checksum/authentication separation');

const workflow=read('.github/workflows/content-asset-provenance-gate.yml');
assert(workflow.includes('validate-foundation-l10-promotion.mjs'),'Content Asset Provenance workflow does not enforce L10 promotion freeze');

console.log('FOUNDATION_L10_PROMOTION_GATE=PASS');
console.log(JSON.stringify({
  schema:manifest.schema,
  status:manifest.status,
  audits:manifest.requiredAudits.length,
  runtimeFiles:manifest.runtimeRequired.length,
  validators:manifest.validatorRequired.length,
  tests:manifest.testRequired.length,
  runtimeIntegration:manifest.baseCompatibility.runtimeIntegration,
  destructiveResets:0,
  browserNetworkCoupling:0
},null,2));
