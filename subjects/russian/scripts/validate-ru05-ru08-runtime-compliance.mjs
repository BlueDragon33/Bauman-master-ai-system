import fs from 'node:fs';
import assert from 'node:assert/strict';
const j=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const t=p=>fs.readFileSync(p,'utf8');
const index=t('subjects/russian/index.html');
const sw=t('subjects/russian/sw.js');
const scenarioRuntime=t('subjects/russian/assets/scenario-runtime.js');
const production=t('subjects/russian/assets/production-workbench.js');
const ai=t('subjects/russian/assets/ai-mentor-guard.js');
const editor=t('subjects/russian/editor.html');
const author=t('subjects/russian/assets/authoring-workbench.js');
const registry=j('subjects/russian/data/scenario-registry.json');
const gov=j('subjects/russian/data/authoring-governance.json');
const owners=j('subjects/russian/docs/ru02/RUSSIAN_RU02_CANONICAL_OWNER_REGISTRY.json');
const acceptance=j('subjects/russian/docs/ru08/RUSSIAN_RU08_ACCEPTANCE_MATRIX.json');

for(const asset of ['assets/scenario-runtime.js','assets/scenario-runtime.css','assets/production-workbench.js','assets/production-workbench.css'])assert(index.includes(asset),'runtime asset not wired: '+asset);
for(const asset of ['scenario-runtime.js','scenario-runtime.css','production-workbench.js','production-workbench.css','editor.html','authoring-workbench.js','authoring-workbench.css','scenario-registry.json','technical-concepts.json','academic-functions.json','reading.json','performance-tasks.json'])assert(sw.includes(asset),'offline shell missing '+asset);
for(const family of ['real-life','administration','classroom','lab','seminar','research','defense'])assert(registry.scenarios.some(x=>x.family===family),'scenario family missing '+family);
assert.match(scenarioRuntime,/sessionStorage\.setItem\(SESSION_KEY/,'scenario state must resume in-tab');
assert.doesNotMatch(scenarioRuntime,/localStorage\.setItem/,'scenario runtime must not mutate persistent learning stores');
assert.match(scenarioRuntime,/writesMastery:false/);
assert.match(scenarioRuntime,/writesSrs:false/);
assert.match(scenarioRuntime,/deterministicRun/);

for(const file of ['technical-concepts.json','academic-functions.json','reading.json','performance-tasks.json'])assert(production.includes(file),'RU06 workbench does not consume '+file);
assert.match(production,/canonicalDataReadOnly:true/);
assert.match(production,/writesMastery:false/);
assert.match(ai,/RussianProductionWorkbench\?\.context/,'AI grounding missing RU06 production context');

assert(index.includes('id="authoringBtn"'),'authoring editor not reachable from Russian UI');
assert(editor.includes('authoring-workbench.js'),'editor runtime missing');
assert.match(author,/directCanonicalWrite:false/);
assert.match(author,/rawJsonDefault:false/);
assert.match(author,/reviewMetadataOnly:true/);
assert.equal(gov.permissions.candidateMayWriteCanonical,false);
assert.equal(gov.ordinaryAuthoring.rawJsonDefault,false);
const ownerMap=new Map(owners.owners.map(x=>[x[0],x[1]]));
for(const type of gov.authorableEntityTypes)assert(ownerMap.has(type),'authorable type lacks canonical owner '+type);

for(const p of ['tests/russian-ru05-ru08-acceptance-browser.mjs','tests/russian-offline-shell-browser.mjs'])assert(fs.existsSync(p),'missing executable acceptance '+p);
assert.equal(acceptance.executableEvidence?.browser,'tests/russian-ru05-ru08-acceptance-browser.mjs');
assert.equal(acceptance.executableEvidence?.offline,'tests/russian-offline-shell-browser.mjs');
for(const k of ['survival','university','technical','research','author'])assert(acceptance.executableEvidence?.journeys?.[k],'journey lacks executable evidence mapping '+k);
console.log(JSON.stringify({ok:true,scenarios:registry.scenarios.length,authorable:gov.authorableEntityTypes.length,browser:acceptance.executableEvidence.browser}));