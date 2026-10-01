import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const has=(text,token,msg)=>assert(text.includes(token),msg||('missing '+token));
const no=(text,token,msg)=>assert(!text.includes(token),msg||('forbidden '+token));

const root='subjects/russian';
const index=read(root+'/index.html');
const core=read(root+'/assets/core.js');
const authority=read(root+'/assets/assessment-authority.js');
const scenario=read(root+'/assets/scenario-runtime.js');
const production=read(root+'/assets/academic-production.js');
const ai=read(root+'/assets/ai-coaching-runtime.js');
const editor=read(root+'/editor.html');
const authoring=read(root+'/assets/authoring-studio.js');
const sw=read(root+'/sw.js');
const provenance=json(root+'/data/provenance.json');

const assessment=(provenance.records||[]).find(x=>x.id==='assessment-bank');
assert(assessment,'assessment-bank provenance missing');
assert.notEqual(String(assessment.validationStatus||assessment.status).toUpperCase(),'VERIFIED','audit must not silently promote current tests.json');
has(authority,'unverified-answer-key-authority');
has(core,"mode:authority.officialEligible?'exam':'diagnostic-unverified'");
has(core,'authoritativeGateRecords');
has(core,'x&&x.authorityEligible===true');
has(core,'answer key chưa VERIFIED');
has(core,'state.reviewProgress.diagnostic');
has(index,'assets/assessment-authority.js');

has(scenario,'RUSSIAN_RU05_SCENARIO_RUNTIME_V1');
has(scenario,'bauman_russian_scenario_registry_v1');
has(scenario,"authoritative:false");
has(scenario,'offlineFallback');
has(index,'assets/scenario-runtime.js');
has(index,'assets/scenario-runtime.css');

for(const name of ['technical-concepts','academic-functions','reading','performance-tasks'])has(production,name,'RU06 runtime must consume '+name);
has(production,'learner-production-snapshot');
has(production,'novel-transfer');
has(production,'authoritative:false');
has(index,'assets/academic-production.js');
has(index,'assets/academic-production.css');

has(ai,'RUSSIAN_RU07_AI_COACHING_RUNTIME_V1');
for(const token of ['BLOCKED_ASSESSMENT','STALE_QUARANTINED','REJECTED_CITATION','REJECTED_TOOL_USE','REJECTED_PROTECTED_TOKEN_DRIFT'])has(ai,token);
has(ai,"toolsAllowed:[]");
has(index,'assets/ai-coaching-runtime.js');
has(core,'RussianAICoachingRuntime');

has(editor,'Russian Authoring Studio');
has(editor,'id="responsibility"');
has(editor,'id="sourceRefs"');
has(editor,'id="assessmentAlignment"');
has(editor,'id="researchLineage"');
has(editor,'Canonical patch SHA');
has(editor,'Published/release SHA');
has(editor,'Raw JSON không phải giao diện mặc định');
no(editor,'id="rawJson"','ordinary author UI must not default to raw JSON editor');
has(authoring,'RUSSIAN_AUTHORING_CANDIDATE_V1');
has(authoring,'metadataOnly:true');
has(authoring,'State skipping is forbidden');
has(authoring,'canonicalPatchSha');
has(authoring,'publishedSha');
has(authoring,'create-reviewed-repository-revert');

for(const asset of ['assessment-authority.js','scenario-runtime.js','scenario-runtime.css','academic-production.js','academic-production.css','ai-coaching-runtime.js','authoring-studio.js','authoring-studio.css'])has(sw,asset,'offline shell missing '+asset);

for(const test of [
 'tests/russian-ru03-assessment-authority-browser.mjs',
 'tests/russian-ru05-scenario-browser.mjs',
 'tests/russian-ru06-academic-production-browser.mjs',
 'tests/russian-ru07-ai-guard-browser.mjs',
 'tests/russian-ru08-authoring-browser.mjs'
])assert(fs.existsSync(test),'missing browser acceptance '+test);

console.log(JSON.stringify({ok:true,assessmentStatus:assessment.validationStatus||assessment.status,checks:['truth-first-assessment','scenario-runtime','academic-production','guarded-ai','structured-authoring','offline-assets','browser-acceptance']}));