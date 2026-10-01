import fs from 'node:fs';
import assert from 'node:assert/strict';
const j=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const ai=j('subjects/russian/data/ai-mentor-policy.json');
const scenario=j('subjects/russian/data/scenario-registry.json');
const provenance=j('subjects/russian/data/provenance.json');
const gov=j('subjects/russian/data/authoring-governance.json');
const acc=j('subjects/russian/docs/ru08/RUSSIAN_RU08_ACCEPTANCE_MATRIX.json');
const manifest=j('subjects/russian/subject-manifest.json');
const index=fs.readFileSync('subjects/russian/index.html','utf8');
const editor=fs.readFileSync('subjects/russian/editor.html','utf8');
const scenarioRuntime=fs.readFileSync('subjects/russian/assets/scenario-runtime.js','utf8');
const authorRuntime=fs.readFileSync('subjects/russian/assets/authoring-adapter.js','utf8');

assert.equal(ai.phase,'RU07');
assert.equal(ai.authority.canonicalTruthOwner,'RU03');
assert.equal(ai.authority.assessmentMasteryOwner,'RU04');
assert.equal(ai.authority.speechAudioOwner,'RU05');
assert.equal(ai.authority.academicTechnicalOwner,'RU06');
assert.equal(ai.authority.authoringPromotionOwner,'RU08');
assert.equal(ai.generatedPractice.promotionPath,'RU08_REVIEWED_REPOSITORY_PATCH');
assert.equal(ai.runtimeReality.activeMode,'DETERMINISTIC_LOCAL_FALLBACK');

assert.equal(scenario.phase,'RU05');
assert.equal(scenario.engine.masteryOwner,'RU04');
assert.equal(scenario.engine.plannerOwner,'RU04');
assert.equal(scenario.engine.linguisticTruthOwner,'RU03');
assert.equal(scenario.runtime.authorityWrites,false);
assert.equal(provenance.phase,'RU03');

assert.equal(gov.recoveredP12Responsibilities.noCodeFirst,true);
assert.equal(gov.permissions.selfApprovalAllowed,false);
assert.equal(gov.recoveredP12Responsibilities.autosaveAndDraftRecovery,true);
assert.equal(gov.recoveredP12Responsibilities.semanticDiffRequiredForPromotion,true);
assert.equal(gov.recoveredP12Responsibilities.impactAnalysisRequiredForPromotion,true);
assert.equal(gov.recoveredP12Responsibilities.migrationDryRunRequired,true);
assert.equal(gov.bulk.partialCanonicalCommit,false);

assert.match(index,/assets\/scenario-runtime\.js/);
assert.match(index,/assets\/scenario-runtime\.css/);
assert.match(scenarioRuntime,/PRACTICE_ONLY/);
assert.match(scenarioRuntime,/writesMastery:false/);
assert.match(editor,/data-russian-authoring/);
assert.match(editor,/Raw JSON không phải giao diện mặc định/);
assert.match(authorRuntime,/payloadIncluded:false/);
assert.match(authorRuntime,/STAGING_ONLY/);

for(const k of Object.keys(acc.journeys)){
  const evidence=acc.executableEvidence?.journeys?.[k];
  assert(Array.isArray(evidence)&&evidence.length,'journey lacks executable evidence '+k);
  for(const p of evidence)assert(fs.existsSync(p),'journey evidence file missing '+p);
}
for(const f of acc.failureMatrix){
  const evidence=acc.executableEvidence?.failures?.[f];
  assert(Array.isArray(evidence)&&evidence.length,'failure lacks executable evidence '+f);
  for(const p of evidence)assert(fs.existsSync(p),'failure evidence file missing '+p);
}
for(const cap of ['scenario-runtime','structured-authoring'])assert(manifest.requiredCapabilities.includes(cap),'manifest missing '+cap);
console.log('RUSSIAN_PROMPT_REAUDIT_GATE=PASS');