import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const readJson=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

const constitution=readJson('subjects/russian/docs/p3/RUSSIAN_CONTENT_SCHEMA_CONSTITUTION.json');
const registry=readJson('subjects/russian/docs/p3/RUSSIAN_CONTENT_OWNER_REGISTRY.json');
const topology=readJson('subjects/russian/docs/p3/RUSSIAN_CANONICAL_OWNER_TOPOLOGY.json');
const graph=readJson('subjects/russian/docs/p3/RUSSIAN_CONTENT_GRAPH_CONTRACT.json');
const p2=readJson('subjects/russian/docs/p2/RUSSIAN_R01_R26_TARGET_CURRICULUM.json');
const manifest=readJson('subjects/russian/subject-manifest.json');
const ru02Owners=fs.existsSync(path.join(ROOT,'subjects/russian/docs/ru02/RUSSIAN_RU02_CANONICAL_OWNER_REGISTRY.json'))
  ? readJson('subjects/russian/docs/ru02/RUSSIAN_RU02_CANONICAL_OWNER_REGISTRY.json')
  : null;
const currentLessons=readJson('subjects/russian/data/lessons.json');
const contentContract=read('subjects/russian/assets/content-contract.js');

const canonicalTypes=[
 'Stage','MacroModule','Unit','MicroLesson','Competency','LinguisticFunction','PhoneticConcept','GrammarConcept','LexicalEntry','PhraseCollocation','ListeningItem','SpeakingItem','DialogueScenario','DeepSpeakingTask','ReadingText','WritingTask','TechnicalConcept','AcademicFunction','Exercise','AssessmentItem','PerformanceTask','ErrorPattern','RemediationPath','MediaAsset','ProvenanceRecord'
];

assert.equal(constitution.phase,'P3');
assert.equal(constitution.goldenRule,'ONE FACT · ONE OWNER · MANY USES');
assert.deepEqual(constitution.canonicalEntityTypes,canonicalTypes);
assert.equal(Object.keys(constitution.entitySchemas).length,25);
for(const type of canonicalTypes){
  assert.ok(constitution.entitySchemas[type],`Missing schema for ${type}`);
  assert.ok(Array.isArray(constitution.entitySchemas[type].required),`${type}: required field list missing`);
  assert.ok(constitution.entitySchemas[type].required.includes('id'),`${type}: stable id must be required`);
}

assert.equal(constitution.identity.versionInIdentity,undefined,'Identity versioning must not be embedded as an ID field');
assert.ok(constitution.identity.rules.includes('no version in ID'));
assert.equal(constitution.versioning.learnerUiExposure,false);
assert.ok(constitution.derivedOnly.includes('knowledge-index'));
assert.ok(constitution.derivedOnly.includes('speaking-link-index'));

assert.equal(topology.phase,'P3');
assert.equal(topology.runtimeMigrationApplied,false);
assert.equal(topology.targetOwners.length,25);
const ownerTypes=topology.targetOwners.map(x=>x.entityType);
assert.deepEqual(ownerTypes,canonicalTypes,'Every canonical entity type must have exactly one target owner');
assert.equal(new Set(ownerTypes).size,25);
for(const owner of topology.targetOwners){
  assert.ok(owner.targetOwner,`${owner.entityType}: target owner missing`);
}
const ownerByType=Object.fromEntries(topology.targetOwners.map(x=>[x.entityType,x.targetOwner]));
assert.equal(ownerByType.SpeakingItem,'subjects/russian/data/speaking.json');
assert.equal(ownerByType.DialogueScenario,'subjects/russian/data/dialogue-bauman-az.json');
assert.equal(ownerByType.DeepSpeakingTask,'subjects/russian/data/deep-speaking-bauman.json');
assert.equal(ownerByType.LexicalEntry,'subjects/russian/data/vocab.json');
assert.equal(ownerByType.GrammarConcept,'subjects/russian/data/grammar.json');
assert.equal(ownerByType.AssessmentItem,'subjects/russian/data/tests.json');

const derivedPaths=new Set(topology.derivedOwners.map(x=>x.path).filter(Boolean));
for(const owner of topology.targetOwners){
  assert.ok(!derivedPaths.has(owner.targetOwner),`${owner.entityType}: canonical owner cannot also be a derived owner`);
}
for(const d of topology.derivedOwners){
  assert.match(d.classification,/DERIVED|INTEGRATION/,`${d.output}: must remain derived/non-fact-owner`);
}

assert.equal(graph.phase,'P3');
assert.equal(graph.nodeRule,'Every graph node is a canonical stable ID.');
assert.equal(graph.relations.requires.acyclic,true);
for(const rel of ['requires','teaches','uses','reviews','tests','contrasts','extends','remediates','contains','belongs-to','derived-from']){
  assert.ok(Object.hasOwn(graph.relations,rel),`Unknown/missing required relation ${rel}`);
}
for(const flag of ['dangling-node','unknown-relation','requires-cycle','assessment-without-teaching','lesson-without-competency']){
  assert.ok(graph.validation.reject.includes(flag),`Missing graph rejection: ${flag}`);
}

assert.equal(registry.phase,'P3');
const currentResponsibility=new Map(registry.owners.map(x=>[x.responsibility,x]));
for(const key of ['curriculum','vocab','grammar','practice-exercise','assessment','basic-speaking','dialogue','deep-speaking','media','knowledge-index','speaking-link-index']){
  assert.ok(currentResponsibility.has(key),`Current owner evidence missing: ${key}`);
}
assert.equal(currentResponsibility.get('knowledge-index').classification,'DERIVED');
assert.equal(currentResponsibility.get('speaking-link-index').classification,'DERIVED');

assert.equal(p2.runtimeCanonical,false,'P2 target must remain design authority during P3');
assert.equal(currentLessons.length,26,'P3 must preserve current R01-R26 lesson identity before runtime migration');
const lessonIds=currentLessons.map(x=>x.id);
assert.equal(new Set(lessonIds).size,26);
for(let i=1;i<=26;i++) assert.ok(lessonIds.includes(`R${String(i).padStart(2,'0')}`));

assert.match(contentContract,/Only explicit source marks are canonical/);
assert.match(contentContract,/never infer stress from Latin transliteration/);
assert.match(contentContract,/Content metadata must not modify canonical learning mastery/);

const runtimeDataIds=new Set([...(manifest.data||[]),...(manifest.dataFiles||[]).map(x=>x.id)]);
const ru02ByType=new Map((ru02Owners?.owners||[]).map(x=>[x[0],{path:x[1],status:x[2]}]));
for(const planned of topology.targetOwners.filter(x=>x.status==='PLANNED_CANONICAL')){
  const basename=path.basename(planned.targetOwner,'.json');
  const current=ru02ByType.get(planned.entityType);
  const materialized=current?.path===planned.targetOwner && current?.status!=='PLANNED' && fs.existsSync(path.join(ROOT,planned.targetOwner));
  if(!materialized) assert.ok(!runtimeDataIds.has(basename),`Planned owner leaked into runtime manifest before verified content exists: ${basename}`);
}

console.log(JSON.stringify({
 phase:'P3',
 status:'PASS',
 goldenRule:constitution.goldenRule,
 canonicalEntityTypes:canonicalTypes.length,
 targetOwners:topology.targetOwners.length,
 derivedOutputs:topology.derivedOwners.length,
 currentR01R26Preserved:currentLessons.length,
 runtimeMigrationApplied:topology.runtimeMigrationApplied
},null,2));
