import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const fail=message=>{throw new Error(`FOUNDATION_IDENTITY_RUNTIME_GATE=FAIL\n${message}`)};
const assert=(condition,message)=>{if(!condition)fail(message)};

const registry=JSON.parse(read('foundation/domain-model/legacy-mapping-registry.v1.json'));
const runtimeSource=read('foundation/domain-model/canonical-identity-runtime.js');

assert(registry.schema==='BAUMAN_LEGACY_MAPPING_REGISTRY_V1','Unexpected legacy mapping registry schema');
assert(registry.registryVersion===1,'Legacy mapping registry version must be 1');
assert(registry.domainContract==='BAUMAN_DOMAIN_CONTRACT_V1','Registry must bind to the foundation domain contract');
assert(registry.overlaySchema==='BAUMAN_IDENTITY_OVERLAY_V1','Unexpected identity overlay schema');
assert(registry.policy?.mode==='overlay','Legacy mapping must use overlay mode');
assert(registry.policy?.legacyDataAuthoritative===true,'Legacy data must remain authoritative in L9 step 2');
assert(registry.policy?.rewriteLegacyIds===false,'Legacy IDs must not be rewritten');
assert(registry.policy?.rewriteLegacyStorage===false,'Legacy storage must not be rewritten');
assert(registry.policy?.runtimeStorageWritesAllowed===false,'Identity runtime must not write storage in step 2');
assert(registry.policy?.mappingMustBeDeterministic===true,'Mappings must be deterministic');
assert(registry.policy?.mappingMustBeIdempotent===true,'Mappings must be idempotent');
assert(registry.policy?.unknownOverlayFieldsPreserved===true,'Unknown overlay fields must be preserved');

const systems=Array.isArray(registry.systems)?registry.systems:[];
assert(systems.length>=6,'Expected current Russian and host systems in the registry');
assert(new Set(systems.map(x=>x.systemId)).size===systems.length,'systemId values must be unique');
assert(new Set(systems.map(x=>x.namespace)).size===systems.length,'Namespaces must be unique across legacy systems');
for(const system of systems){
  assert(system.systemId&&system.namespace,`Invalid registry system: ${JSON.stringify(system)}`);
  const rules=Array.isArray(system.scopeRules)?system.scopeRules:[];
  assert(rules.length>0,`Missing scope rules for ${system.systemId}`);
  assert(new Set(rules.map(x=>x.scope)).size===rules.length,`Duplicate scope rule in ${system.systemId}`);
  for(const rule of rules)assert(rule.scope&&rule.kind&&rule.localPrefix,`Incomplete scope rule in ${system.systemId}`);
}

const sourceBindings=[
  ['subjects/russian/assets/learning-state.js','bauman_russian_learning_state_v1','RUSSIAN_LEARNING_STATE_V1'],
  ['subjects/russian/assets/learning-flow.js','bauman_russian_learning_flow_v1','RUSSIAN_LEARNING_FLOW_V1'],
  ['subjects/russian/assets/vocab-srs.js','bauman_russian_vocab_srs_v1','RUSSIAN_VOCAB_SRS_V1'],
  ['subjects/russian/assets/academic-language.js','bauman_russian_academic_language_v1','RUSSIAN_ACADEMIC_LANGUAGE_V1'],
  ['subjects/shared/host-bridge.js',null,'BAUMAN_SUBJECT_BRIDGE_V1']
];
for(const [file,storageKey,schema] of sourceBindings){
  const text=read(file);
  if(storageKey)assert(text.includes(storageKey),`Legacy storage key disappeared from ${file}: ${storageKey}`);
  assert(text.includes(schema),`Legacy schema disappeared from ${file}: ${schema}`);
}
assert(read('subjects/russian/assets/learning-state.js').includes('bauman_russian_survival_master_v11_clean_skeleton'),'Legacy Russian core storage fallback disappeared');

assert(!/localStorage\s*\./.test(runtimeSource),'Identity runtime must be storage-neutral');
assert(!/sessionStorage\s*\./.test(runtimeSource),'Identity runtime must be session-storage-neutral');
assert(!/document\s*\./.test(runtimeSource),'Identity runtime must be UI-neutral');
assert(!/window\s*\./.test(runtimeSource),'Identity runtime must not require window APIs');

const sandbox={console,URLSearchParams,encodeURIComponent,decodeURIComponent,Date,JSON,Object,Set,String,Number,Error};
sandbox.globalThis=sandbox;
vm.runInNewContext(runtimeSource,sandbox,{filename:'canonical-identity-runtime.js'});
const api=sandbox.BaumanIdentityRuntime;
assert(api?.schema==='BAUMAN_CANONICAL_IDENTITY_RUNTIME_V1','Identity runtime did not initialize');
assert(api.overlaySchema==='BAUMAN_IDENTITY_OVERLAY_V1','Runtime overlay schema mismatch');

const encoded=api.canonicalId('task','russian-learning','learning:theory:Урок 1');
const parsed=api.parseCanonicalId(encoded);
assert(parsed.kind==='task','Canonical kind did not round-trip');
assert(parsed.namespace==='russian-learning','Canonical namespace did not round-trip');
assert(parsed.localId==='learning:theory:Урок 1','Canonical local ID did not round-trip Cyrillic/colon content');

const samples=[
  ['russian-core-state','route','learning:theory:lesson-01'],
  ['russian-learning-state','item','learning:theory:lesson-01'],
  ['russian-learning-state','review','vocab:12'],
  ['russian-learning-flow','lesson','R01'],
  ['russian-vocab-srs','card','vocab:12'],
  ['russian-vocab-srs','sentence','user:vocab:12:123456'],
  ['russian-academic-language','grammar','GR01'],
  ['russian-academic-language','reading','R01:slide:2'],
  ['russian-academic-language','writing','W01'],
  ['bauman-subject-host','task','task-001']
];
for(const [systemId,scope,legacyId] of samples){
  const a=api.resolveLegacy(registry,systemId,scope,legacyId);
  const b=api.resolveLegacy(registry,systemId,scope,legacyId);
  assert(a.canonicalId===b.canonicalId,`Non-deterministic mapping for ${systemId}/${scope}/${legacyId}`);
  assert(api.parseCanonicalId(a.canonicalId).localId.includes('/'),'Canonical local ID must preserve scope separation');
}

const sameLegacyA=api.resolveLegacy(registry,'russian-learning-state','item','same-id').canonicalId;
const sameLegacyB=api.resolveLegacy(registry,'russian-learning-flow','step','same-id').canonicalId;
assert(sameLegacyA!==sameLegacyB,'Same legacy ID from different systems must not collide');

const seed={schema:'BAUMAN_IDENTITY_OVERLAY_V1',version:1,mappings:{},extensions:{futureProvider:{enabled:true}},futureRoot:{preserveMe:42}};
const fixedTime='2026-09-17T00:00:00.000Z';
const once=api.ensureMapping(seed,registry,'russian-vocab-srs','card','vocab:12',fixedTime);
const twice=api.ensureMapping(once,registry,'russian-vocab-srs','card','vocab:12','2099-01-01T00:00:00.000Z');
assert(JSON.stringify(once)===JSON.stringify(twice),'ensureMapping must be idempotent and preserve the original mappedAt');
assert(twice.extensions?.futureProvider?.enabled===true,'Unknown extension was not preserved');
assert(twice.futureRoot?.preserveMe===42,'Unknown root overlay field was not preserved');
assert(api.findCanonical(twice,'russian-vocab-srs','card','vocab:12')===api.resolveLegacy(registry,'russian-vocab-srs','card','vocab:12').canonicalId,'Overlay lookup mismatch');

const original={nested:{value:1},unknown:{keep:true}};
const wrapped=api.mapLegacyRecord(registry,'russian-learning-state','item','legacy-item',original);
wrapped.record.nested.value=99;
assert(original.nested.value===1,'mapLegacyRecord mutated the legacy record');
assert(original.unknown.keep===true,'Unknown legacy field was altered');

let conflictCaught=false;
const conflict=api.ensureMapping(api.emptyOverlay(),registry,'russian-vocab-srs','card','vocab:99',fixedTime);
const key=api.mappingKey('russian-vocab-srs','card','vocab:99');
conflict.mappings[key].canonicalId='bd:knowledge:wrong:wrong';
try{api.ensureMapping(conflict,registry,'russian-vocab-srs','card','vocab:99',fixedTime)}catch(_){conflictCaught=true;}
assert(conflictCaught,'Mapping conflicts must fail closed');

console.log('FOUNDATION_IDENTITY_RUNTIME_GATE=PASS');
console.log(JSON.stringify({registry:registry.schema,systems:systems.length,samples:samples.length,overlaySchema:api.overlaySchema,storageNeutral:true,idempotent:true},null,2));
