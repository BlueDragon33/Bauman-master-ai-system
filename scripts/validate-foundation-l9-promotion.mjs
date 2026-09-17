import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const exists=rel=>fs.statSync(path.join(root,rel),{throwIfNoEntry:false})?.isFile()===true;
const fail=message=>{throw new Error(`FOUNDATION_L9_PROMOTION_GATE=FAIL\n${message}`)};
const assert=(condition,message)=>{if(!condition)fail(message)};
const manifest=JSON.parse(read('foundation/domain-model/l9-promotion-manifest.v1.json'));

assert(manifest.schema==='BAUMAN_FOUNDATION_L9_PROMOTION_V1','Unexpected promotion manifest schema');
assert(manifest.version===1,'Promotion manifest version must be 1');
assert(manifest.status==='promotion_candidate','L9 manifest must remain a promotion candidate until PR promotion');
assert(manifest.baseCompatibility?.strategy==='additive','L9 promotion must remain additive');
assert(manifest.baseCompatibility?.legacyRuntimeAuthoritative===true,'Legacy runtime must remain authoritative');
assert(manifest.baseCompatibility?.hostBridgeProtocolPreserved==='BAUMAN_SUBJECT_BRIDGE_V1','Host Bridge contract drifted');

for(const audit of manifest.requiredAudits||[])assert(exists(`foundation/domain-model/${audit}`),`Missing required audit: ${audit}`);
for(const file of manifest.runtimeRequired||[])assert(exists(file),`Missing required runtime dependency: ${file}`);

const registry=JSON.parse(read('foundation/domain-model/legacy-mapping-registry.v1.json'));
assert(registry.policy?.mode==='overlay','Registry is no longer overlay-only');
assert(registry.policy?.legacyDataAuthoritative===true,'Registry no longer treats legacy data as authoritative');
assert(registry.policy?.rewriteLegacyIds===false,'Registry allows legacy ID rewrite');
assert(registry.policy?.rewriteLegacyStorage===false,'Registry allows legacy storage rewrite');
assert(registry.persistence?.legacyKeysNeverWritten===true,'Overlay persistence no longer protects legacy keys');
assert(registry.persistence?.corruptOverlayAutoRepairAllowed===false,'Corrupt overlay auto-repair became enabled');

const expectedLegacy=new Set(manifest.legacyStorageKeys||[]);
const registryLegacy=new Set((registry.systems||[]).map(x=>x.storageKey).filter(Boolean));
for(const key of expectedLegacy)assert(registryLegacy.has(key)||key==='bauman_russian_survival_master_v11_clean_skeleton',`Manifest legacy key missing from registry: ${key}`);

const sourceBindings={
  'bauman_russian_survival_master_v11_clean_skeleton':'subjects/russian/assets/learning-state.js',
  'bauman_russian_learning_state_v1':'subjects/russian/assets/learning-state.js',
  'bauman_russian_learning_flow_v1':'subjects/russian/assets/learning-flow.js',
  'bauman_russian_vocab_srs_v1':'subjects/russian/assets/vocab-srs.js',
  'bauman_russian_academic_language_v1':'subjects/russian/assets/academic-language.js'
};
for(const key of expectedLegacy){const file=sourceBindings[key];assert(file&&read(file).includes(key),`Legacy storage key disappeared or moved without migration: ${key}`);}

const protectedSources=[
  'foundation/domain-model/canonical-identity-runtime.js',
  'foundation/domain-model/identity-overlay-store.js',
  'foundation/domain-model/legacy-snapshot-extractor.js',
  'foundation/domain-model/canonical-read-projection.js',
  'subjects/shared/foundation-identity-bootstrap.js',
  'subjects/shared/foundation-identity-persistence.js',
  'subjects/shared/foundation-identity-projection.js',
  'subjects/shared/foundation-canonical-context.js'
].map(read).join('\n');
assert(!/localStorage\.clear\s*\(|sessionStorage\.clear\s*\(|indexedDB\.deleteDatabase\s*\(/.test(protectedSources),'Destructive storage reset detected in Foundation runtime');
for(const key of expectedLegacy)assert(!protectedSources.includes(`setItem('${key}'`)&&!protectedSources.includes(`setItem(\"${key}\"`),`Foundation runtime contains direct legacy write: ${key}`);

const index=read('subjects/russian/index.html');
const order=[
  '../shared/host-bridge.js',
  '../../foundation/domain-model/canonical-identity-runtime.js',
  '../../foundation/domain-model/identity-overlay-store.js',
  '../../foundation/domain-model/legacy-snapshot-extractor.js',
  '../../foundation/domain-model/canonical-read-projection.js',
  '../shared/foundation-identity-bootstrap.js',
  '../shared/foundation-identity-persistence.js',
  '../shared/foundation-identity-projection.js',
  '../shared/foundation-canonical-context.js',
  'assets/planning-bridge.js',
  'assets/core.js',
  'assets/learning-state.js',
  'assets/ai-mentor-guard.js'
];
let last=-1;
for(const token of order){const at=index.indexOf(token);assert(at>=0,`Russian runtime missing L9 dependency: ${token}`);assert(at>last,`Russian L9 load order drifted at ${token}`);last=at;}

const context=read('subjects/shared/foundation-canonical-context.js');
assert(!/localStorage\s*\.|sessionStorage\s*\.|document\s*\./.test(context),'Canonical context adapter is no longer read-only/browser-state neutral');
assert(context.includes('legacyAuthoritative:true'),'Canonical context no longer declares legacy authority');
assert(context.includes('mayModifyMastery:false'),'Canonical context no longer forbids mastery writes');

const ai=read('subjects/russian/assets/ai-mentor-guard.js');
assert(ai.includes('Object.values(learning.reviewQueue||{})'),'AI canonical Review Queue read contract drifted');
assert(ai.includes('canonicalIdentityReadOnly:true'),'AI canonical identity policy is no longer read-only');
assert(ai.includes('aiMayModifyMastery:false'),'AI mastery protection disappeared');
assert(ai.includes('BaumanFoundationCanonicalContext?.current?.'),'AI no longer consumes canonical context through the explicit adapter');

for(const packageFile of ['scripts/prepare-cloudflare-preview.mjs','scripts/prepare-chatgpt-site.mjs']){
  const text=read(packageFile);
  for(const required of manifest.runtimeRequired||[])assert(text.includes(required)||required.startsWith('foundation/')&&text.includes("fs.cpSync(path.join(root, 'foundation')"),`${packageFile} does not protect runtime dependency: ${required}`);
  assert(text.includes('foundation-canonical-context.js'),`${packageFile} does not verify canonical context packaging`);
}

const foundationWorkflow=read('.github/workflows/foundation-domain-model-gate.yml');
const systemWorkflow=read('.github/workflows/system-integration-ci.yml');
assert(foundationWorkflow.includes('validate-foundation-l9-promotion.mjs'),'Foundation workflow does not enforce L9 promotion gate');
assert(systemWorkflow.includes('foundation-canonical-context-browser.mjs'),'Whole System workflow does not exercise canonical context browser acceptance');
assert(systemWorkflow.includes('Run packaged Foundation canonical context acceptance'),'Packaged canonical context acceptance missing');

const visibleSurface=index.replace(/<script[\s\S]*$/i,'');
assert(!/BAUMAN_FOUNDATION_L9_PROMOTION_V1|BAUMAN_CANONICAL_READ_PROJECTION_V1|bauman_identity_overlay_v1/.test(visibleSurface),'Foundation debug/storage identifiers leaked into learner HTML surface');

console.log('FOUNDATION_L9_PROMOTION_GATE=PASS');
console.log(JSON.stringify({schema:manifest.schema,status:manifest.status,audits:manifest.requiredAudits.length,runtimeFiles:manifest.runtimeRequired.length,legacyKeys:manifest.legacyStorageKeys.length,foundationKeys:manifest.foundationStorageKeys.length,consumerIntegrations:manifest.consumerIntegrations.length,destructiveResets:0,legacyWrites:0},null,2));
