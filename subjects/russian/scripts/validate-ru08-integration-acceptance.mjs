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
const reviewStore=fs.readFileSync('control-service/src/content-review-store.ts','utf8');
const migration=fs.readFileSync('control-service/migrations/0004_content_review.sql','utf8');
const editor=fs.readFileSync('subjects/russian/editor.html','utf8');
const authorWorkspace=fs.readFileSync('subjects/russian/assets/author-workspace.js','utf8');

assert.equal(manifest.schema,'SUBJECT_MODULE_V2');
assert.equal(manifest.id,'russian');
assert.equal(manifest.architecture?.authoringGovernance,'subjects/russian/data/authoring-governance.json');
assert.equal(manifest.authoring?.ordinaryAuthorMode,'schema-aware-fields-not-raw-json-by-default');
assert.equal(manifest.authoring?.controlReviewStorage,'metadata-only');
assert.equal(manifest.authoring?.workspace,'subjects/russian/editor.html');
assert.equal(manifest.authoring?.workspaceMode,'structured-candidate-staging');
assert.equal(manifest.authoring?.browserCanonicalWrite,false);
assert.match(editor,/id="candidateForm"/);
assert.doesNotMatch(editor,/storageItemJson/,'ordinary author workspace must not default to raw JSON');
assert.match(authorWorkspace,/canonicalWrite:false/);
assert.match(authorWorkspace,/metadataOnly:true/);
assert.equal(manifest.compatibility?.destructiveMigration,false);
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

const ownerMap=new Map((owners.owners||[]).map(x=>[x[0],x[1]]));
const schemaPolicies=new Set();
for(const type of governance.authorableEntityTypes){
  assert(ownerMap.get(type),'authorable entity lacks RU02 owner: '+type);
  const schema=governance.entitySchemas?.[type];
  assert(schema,'authorable entity lacks schema-aware descriptor: '+type);
  assert(Array.isArray(schema.fields)&&schema.fields.length,'authorable entity schema has no fields: '+type);
  assert(Array.isArray(schema.validationPolicies)&&schema.validationPolicies.length,'authorable entity lacks validation policies: '+type);
  assert.equal(new Set(schema.fields.map(x=>x.id)).size,schema.fields.length,'duplicate schema field id: '+type);
  for(const policy of schema.validationPolicies)schemaPolicies.add(policy);
}
assert.equal(governance.schemaAwareAuthoring?.mode,'ENTITY_SCHEMA_DRIVEN');
for(const policy of governance.russianValidation)assert(schemaPolicies.has(policy),'Russian validation policy is not mapped to any entity schema: '+policy);
assert.match(authorWorkspace,/schemaFor/);
assert.match(authorWorkspace,/data-detail/);
assert.match(authorWorkspace,/validationPolicies/);

const draft={schema:'RUSSIAN_AUTHORING_CANDIDATE_V1',candidateId:'RU08-DEMO',responsibility:'LexicalEntry',canonicalId:'LEX-DEMO',revision:'r1',state:'VALIDATED',payload:{ru:'приме́р',vi:'ví dụ',details:{lemma:'пример',stress:'приме́р',partOfSpeech:'noun',yoEPolicy:'not-applicable',morphology:'м.р.; неодуш.; 2-е склонение',government:'not-applicable',acceptedVariants:'пример',register:'neutral'}},sourceRefs:['source:test'],rollbackNote:'restore previous canonical item',diffSummary:'fixture'};
draft.contentHash=hashPayload(draft.payload);
const v=validateCandidate(draft);
assert.equal(v.ok,true,v.errors.join('; '));
assert.equal(v.canonicalOwner,'subjects/russian/data/vocab.json');
assert(v.validationPolicies.includes('stress'));
assert.equal(reviewEnvelope(draft).metadataOnly,true);
const invalidStress=structuredClone(draft);
invalidStress.candidateId='RU08-BAD-STRESS';
invalidStress.payload.details.stress='пример';
invalidStress.contentHash=hashPayload(invalidStress.payload);
const invalidStressResult=validateCandidate(invalidStress);
assert.equal(invalidStressResult.ok,false,'LexicalEntry without explicit stress must fail closed');
assert(invalidStressResult.errors.some(x=>x.includes('stress')),'stress failure reason missing');
const generated={...draft,candidateId:'RU08-GEN',state:'APPROVED',generated:true,reviewer:'reviewer',reviewedAt:'2026-10-01T00:00:00Z',confidence:'UNVERIFIED'};
assert.equal(validateCandidate(generated,{requirePromotion:true}).ok,false,'generated unverified content cannot promote');

for(const k of ['beginner','survival','university','technical','research','author'])assert(Array.isArray(acceptance.journeys[k])&&acceptance.journeys[k].length,'missing acceptance journey '+k);
assert(acceptance.failureMatrix.length>=17,'failure matrix incomplete');
assert(['CANDIDATE','READY_FOR_MERGE'].includes(rc.state),'invalid RU08 RC readiness state');
assert.equal(rc.releaseAnnex,'prompts/constitution/C3_RELEASE_ANNEX_SHARED.md');
assert(fs.existsSync(rc.releaseAnnex),'canonical shared Release Annex path missing');
assert.match(rc.releaseClosureRule,/observation/i);
assert.match(rc.rollbackTarget,/live pre-deploy production/i);

for(const phase of ['ru02','ru03','ru04','ru05','ru06','ru07']){
 const p='subjects/russian/docs/'+phase+'/RUSSIAN_'+phase.toUpperCase()+'_PHASE_RECORD.md';
 assert(fs.existsSync(p),'missing '+p);
 assert.match(fs.readFileSync(p,'utf8'),/State:\s*\*\*PASS\*\*|RU0[2-7] STATE:\s*PASS/i,'upstream not PASS: '+phase);
}
console.log(JSON.stringify({ok:true,subject:manifest.id,dataFiles:manifest.dataFiles.length,capabilities:manifest.requiredCapabilities.length,authorable:governance.authorableEntityTypes.length,schemaPolicies:schemaPolicies.size,failures:acceptance.failureMatrix.length}));
