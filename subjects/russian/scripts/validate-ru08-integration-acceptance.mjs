import fs from 'node:fs';
import assert from 'node:assert/strict';
import {hashPayload,validateCandidate,reviewEnvelope} from './russian-authoring-candidate.mjs';
const j=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const manifest=j('subjects/russian/subject-manifest.json');
const manifestJs=fs.readFileSync('subjects/russian/subject-manifest.js','utf8');
const governance=j('subjects/russian/data/authoring-governance.json');
const owners=j('subjects/russian/docs/ru02/RUSSIAN_RU02_CANONICAL_OWNER_REGISTRY.json');
const acceptance=j('subjects/russian/docs/ru08/RUSSIAN_RU08_ACCEPTANCE_MATRIX.json');
const rc=j('subjects/russian/docs/ru08/RUSSIAN_RU08_RC_READINESS.json');
const editor=fs.readFileSync('subjects/russian/editor.html','utf8');
const adapter=fs.readFileSync('subjects/russian/assets/subject-adapter.js','utf8');
const index=fs.readFileSync('subjects/russian/index.html','utf8');
const sw=fs.readFileSync('subjects/russian/sw.js','utf8');
const reviewStore=fs.readFileSync('control-service/src/content-review-store.ts','utf8');
const migration=fs.readFileSync('control-service/migrations/0004_content_review.sql','utf8');
const authorBrowser='tests/russian-authoring-journey-browser.mjs';

assert.equal(manifest.schema,'SUBJECT_MODULE_V2');
assert.equal(manifest.id,'russian');
assert.equal(manifest.architecture?.authoringGovernance,'subjects/russian/data/authoring-governance.json');
assert.equal(manifest.authoring?.ordinaryAuthorMode,'schema-aware-fields-not-raw-json-by-default');
assert.equal(manifest.authoring?.controlReviewStorage,'metadata-only');
assert.equal(manifest.compatibility?.destructiveMigration,false);
const adapterMatch=adapter.match(/dataFiles:\s*\[([^\]]+)\]/s);
assert(adapterMatch,'cannot read adapter dataFiles');
const adapterIds=[...adapterMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map(x=>x[1]);
const manifestIds=(manifest.dataFiles||[]).map(x=>x.id);
for(const id of adapterIds) assert(manifestIds.includes(id),'adapter required dataset missing from manifest: '+id);
for(const id of (manifest.dataFiles||[]).filter(x=>x.required).map(x=>x.id)) assert(adapterIds.includes(id),'manifest required dataset not loaded by adapter: '+id);
assert.deepEqual(new Set(manifest.data),new Set(manifestIds),'manifest data/dataFiles ids must match');
for(const id of ['provenance','technical-concepts','academic-functions','reading','performance-tasks','scenario-registry','ai-mentor-policy']){
  assert((manifest.dataFiles||[]).some(x=>x.id===id),'manifest missing current dataset '+id);
}
for(const cap of ['assessment-mastery','review-scheduler','adaptive-planner','speech-interaction','dialogue-scenario','academic-production','ai-coaching-optional','content-review-metadata']){
  assert((manifest.requiredCapabilities||[]).includes(cap),'missing capability '+cap);
}
const parsedJs=JSON.parse(manifestJs.replace(/^window\.SUBJECT_MANIFEST\s*=\s*/,'').replace(/;\s*$/,''));
assert.deepEqual(parsedJs,manifest,'subject-manifest.js must mirror JSON');

assert.equal(governance.reviewService.storageMode,'METADATA_ONLY');
assert.equal(governance.reviewService.storesLearningContent,false);
assert.equal(governance.permissions.candidateMayWriteCanonical,false);
assert.equal(governance.permissions.bulkImportMayWriteCanonical,false);
assert.equal(governance.permissions.generatedContentMayWriteCanonical,false);
assert.equal(governance.permissions.reviewServiceMayWriteCanonical,false);
assert.equal(governance.ordinaryAuthoring.rawJsonDefault,false);
assert.equal(governance.bulk.mode,'STAGING_ONLY');
assert.equal(governance.bulk.atomicCanonicalOverwrite,false);
assert.match(reviewStore,/metadataOnly:\s*true/);
assert.match(reviewStore,/expectedStatus/);
assert.match(reviewStore,/PUBLISHER_REQUIRED/);
assert.doesNotMatch(migration,/content_body|body_json|learning_content/i);

assert.match(editor,/Russian Authoring Workspace/);
assert.match(editor,/id="advancedRaw"/);
assert.doesNotMatch(editor,/<details[^>]*id="advancedRaw"[^>]*\sopen(?:\s|>)/i,'raw JSON must not open by default');
assert.match(editor,/RussianAuthoringWorkspace/);
assert.match(editor,/authoring-governance\.json/);
assert.match(editor,/RUSSIAN_RU02_CANONICAL_OWNER_REGISTRY\.json/);
assert.match(editor,/metadataOnly:true/);
assert.match(editor,/Import candidate JSON/);
assert.match(editor,/Tạo revision kế tiếp/);
assert.match(editor,/importCandidateFile/);
assert.match(editor,/nextRevision/);
assert.doesNotMatch(editor,/<button[^>]*>\s*Publish canonical\s*<\/button>/i,'authoring UI must not expose direct canonical publish');
assert(fs.existsSync(authorBrowser),'RU08 authoring browser journey missing');
for(const asset of ['scenario-engine.js','scenario-engine.css','academic-production.js','academic-production.css']){
 assert(index.includes('assets/'+asset),'runtime asset not wired in index: '+asset);
 assert(sw.includes('./assets/'+asset),'runtime asset not precached offline: '+asset);
}

const ownerMap=new Map((owners.owners||[]).map(x=>[x[0],x[1]]));
for(const type of governance.authorableEntityTypes)assert(ownerMap.get(type),'authorable entity lacks RU02 owner: '+type);

const draft={schema:'RUSSIAN_AUTHORING_CANDIDATE_V1',candidateId:'RU08-DEMO',responsibility:'LexicalEntry',canonicalId:'LEX-DEMO',revision:'r1',state:'VALIDATED',payload:{ru:'пример'},sourceRefs:['source:test'],rollbackNote:'restore previous canonical item',diffSummary:'fixture'};
draft.contentHash=hashPayload(draft.payload);
const v=validateCandidate(draft);
assert.equal(v.ok,true,v.errors.join('; '));
assert.equal(v.canonicalOwner,'subjects/russian/data/vocab.json');
assert.equal(reviewEnvelope(draft).metadataOnly,true);
const generated={...draft,candidateId:'RU08-GEN',state:'APPROVED',generated:true,reviewer:'reviewer',reviewedAt:'2026-10-01T00:00:00Z',confidence:'UNVERIFIED'};
assert.equal(validateCandidate(generated,{requirePromotion:true}).ok,false,'generated unverified content cannot promote');

const journeys=['beginner','survival','university','technical','research','author'];
for(const k of journeys){
  assert(Array.isArray(acceptance.journeys[k])&&acceptance.journeys[k].length,'missing acceptance journey '+k);
  assert(Array.isArray(acceptance.journeyEvidence?.[k])&&acceptance.journeyEvidence[k].length,'journey lacks evidence '+k);
  for(const p of acceptance.journeyEvidence[k])assert(fs.existsSync(p),'journey evidence file missing '+k+': '+p);
}
assert(acceptance.journeyEvidence.author.includes(authorBrowser),'author journey must include real browser acceptance');

assert(acceptance.failureMatrix.length>=17,'failure matrix incomplete');
for(const failure of acceptance.failureMatrix){
  assert(Array.isArray(acceptance.failureEvidence?.[failure])&&acceptance.failureEvidence[failure].length,'failure lacks evidence '+failure);
  for(const p of acceptance.failureEvidence[failure])assert(fs.existsSync(p),'failure evidence file missing '+failure+': '+p);
}
assert.match(acceptance.evidenceRule,/cannot satisfy RU08 RC readiness/);
assert(['CANDIDATE','READY_FOR_MERGE'].includes(rc.state),'invalid RU08 RC readiness state');
assert.match(rc.releaseAnnex,/C3_RELEASE_ANNEX_PRODUCTION/);

for(const phase of ['ru02','ru03','ru04','ru05','ru06','ru07']){
 const p='subjects/russian/docs/'+phase+'/RUSSIAN_'+phase.toUpperCase()+'_PHASE_RECORD.md';
 assert(fs.existsSync(p),'missing '+p);
 assert.match(fs.readFileSync(p,'utf8'),/State:\s*\*\*PASS\*\*|RU0[2-7] STATE:\s*PASS/i,'upstream not PASS: '+phase);
}
console.log(JSON.stringify({ok:true,subject:manifest.id,dataFiles:manifest.dataFiles.length,capabilities:manifest.requiredCapabilities.length,authorable:governance.authorableEntityTypes.length,journeys:journeys.length,failures:acceptance.failureMatrix.length,authorBrowser:true}));
