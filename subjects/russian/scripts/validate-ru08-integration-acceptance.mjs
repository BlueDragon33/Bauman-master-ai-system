import fs from 'node:fs';
import assert from 'node:assert/strict';
const j=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const t=p=>fs.readFileSync(p,'utf8');
for(const p of [
 'subjects/russian/docs/ru02/RUSSIAN_RU02_PHASE_RECORD.md',
 'subjects/russian/docs/ru03/RUSSIAN_RU03_PHASE_RECORD.md',
 'subjects/russian/docs/ru04/RUSSIAN_RU04_PHASE_RECORD.md',
 'subjects/russian/docs/ru05/RUSSIAN_RU05_PHASE_RECORD.md',
 'subjects/russian/docs/ru06/RUSSIAN_RU06_PHASE_RECORD.md',
 'subjects/russian/docs/ru07/RUSSIAN_RU07_PHASE_RECORD.md'
]) assert.match(t(p),/State:\s*\*\*PASS\*\*/i,'upstream phase not PASS: '+p);

const manifest=j('subjects/russian/subject-manifest.json');
const gov=j('subjects/russian/data/authoring-governance.json');
const owners=j('subjects/russian/docs/ru02/RUSSIAN_RU02_CANONICAL_OWNER_REGISTRY.json');
const acc=j('subjects/russian/docs/ru08/RUSSIAN_RU08_ACCEPTANCE_MATRIX.json');
const fail=j('subjects/russian/docs/ru08/RUSSIAN_RU08_FAILURE_MATRIX.json');
const rc=j('subjects/russian/docs/ru08/RUSSIAN_RU08_RC_READINESS.json');
const sw=t('subjects/russian/sw.js');
const index=t('subjects/russian/index.html');
const editor=t('subjects/russian/editor.html');
const editorJs=t('subjects/russian/assets/authoring-editor.js');
const review=t('control-service/src/content-review-store.ts');

assert.equal(manifest.architecture?.noPlatformFork,true);
assert.equal(manifest.authoring?.rawJsonDefault,false);
assert.equal(manifest.authoring?.canonicalBrowserWrite,false);
assert.equal(gov.reviewService.storageMode,'METADATA_ONLY');
assert.equal(gov.reviewService.storesLearningContent,false);
assert.equal(gov.permissions.candidateMayWriteCanonical,false);
assert.equal(gov.permissions.reviewServiceMayWriteCanonical,false);
assert.match(review,/metadataOnly:\s*true/);
assert.match(review,/expectedStatus/);
assert.match(review,/PUBLISHER_REQUIRED/);

const ownerMap=new Map((owners.owners||[]).map(([type,path,status])=>[type,{path,status}]));
for(const type of gov.authorableEntityTypes){
 const o=ownerMap.get(type); assert(o?.path,'missing RU02 owner: '+type);
 assert(!String(o.status).startsWith('PLANNED'),'planned owner declared active-authorable: '+type);
 assert(fs.existsSync(o.path),'active owner file missing: '+o.path);
}
for(const type of gov.plannedEntityTypes){
 const o=ownerMap.get(type); assert(o,'planned type missing from RU02 owners: '+type);
}

const registered=new Map(manifest.architecture?.registeredCanonicalOwners?.owners||[]);
for(const [type,path] of [
 ['TechnicalConcept','data/technical-concepts.json'],['AcademicFunction','data/academic-functions.json'],['ReadingText','data/reading.json'],
 ['PerformanceTask','data/performance-tasks.json'],['ProvenanceRecord','data/provenance.json'],['ScenarioComposition','data/scenario-registry.json'],
 ['AiMentorPolicy','data/ai-mentor-policy.json'],['AuthoringGovernance','data/authoring-governance.json']
]) assert.equal(registered.get(type),path,'manifest architecture missing RU08 owner registration: '+type);
for(const id of ['dialogue-bauman-az','deep-speaking-bauman','speaking-link-index']){
 const row=(manifest.dataFiles||[]).find(x=>x.id===id); assert.equal(row?.lazy,true,'large dataset lost lazy flag: '+id);
 assert(!sw.includes(`'./data/${id}.json'`)&&!sw.includes(`"./data/${id}.json"`),'large dataset precached: '+id);
}
assert(!index.includes('authoring-editor.js'),'authoring editor must not enter learner startup');
assert(!sw.includes('./assets/authoring-editor.js'),'authoring editor must not enter learner offline shell');
assert.doesNotMatch(editorJs,/innerHTML\s*=|insertAdjacentHTML|eval\s*\(|new Function/);
assert.match(editor,/authoringForm/);
assert.match(editor,/không ghi trực tiếp/i);

const journeys=new Set(acc.journeys.map(x=>x.id));
for(const id of ['beginner','survival','university','technical','research','admin-author']) assert(journeys.has(id),'missing acceptance journey '+id);
assert(fail.failures.length>=17,'failure matrix incomplete');
assert.equal(rc.architecture.noRussianPlatformFork,true);
assert.equal(rc.productionAuthority,'GLOBAL_CONSTITUTIONS/C3_RELEASE_ANNEX_PRODUCTION.md');

console.log(JSON.stringify({ok:true,upstream:'RU02-RU07 PASS',authorable:gov.authorableEntityTypes.length,journeys:acc.journeys.length,failures:fail.failures.length,noStartupAuthoring:true}));
