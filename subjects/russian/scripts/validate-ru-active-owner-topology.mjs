import fs from 'node:fs';
import assert from 'node:assert/strict';

const j=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const scenario=j('subjects/russian/data/scenario-registry.json');
const ai=j('subjects/russian/data/ai-mentor-policy.json');
const provenance=j('subjects/russian/data/provenance.json');
const technical=j('subjects/russian/data/technical-concepts.json');
const academic=j('subjects/russian/data/academic-functions.json');
const reading=j('subjects/russian/data/reading.json');
const performance=j('subjects/russian/data/performance-tasks.json');

assert.equal(scenario.activeOwner,'RU05');
assert.deepEqual({
  dialogueRuntimeOwner:scenario.engine.dialogueRuntimeOwner,
  speechRecognitionOwner:scenario.engine.speechRecognitionOwner,
  recordingOwner:scenario.engine.recordingOwner,
  masteryOwner:scenario.engine.masteryOwner,
  plannerOwner:scenario.engine.plannerOwner,
  linguisticTruthOwner:scenario.engine.linguisticTruthOwner,
  aiCoachOwner:scenario.engine.aiCoachOwner
},{
  dialogueRuntimeOwner:'RU05',
  speechRecognitionOwner:'RU05',
  recordingOwner:'RU05',
  masteryOwner:'RU04',
  plannerOwner:'RU04',
  linguisticTruthOwner:'RU03',
  aiCoachOwner:'RU07'
});

assert.equal(ai.activeOwner,'RU07');
assert.equal(ai.authority.canonicalTruthOwner,'RU03');
assert.equal(ai.authority.assessmentMasteryOwner,'RU04');
assert.equal(ai.authority.plannerSrsOwner,'RU04');
assert.equal(ai.authority.speechAudioOwner,'RU05');
assert.deepEqual(ai.authority.academicTechnicalOwners,['RU06']);
assert.equal(ai.generatedPractice.promotionPath,'RU08_REVIEW_WORKFLOW');

assert.equal(provenance.activeOwner,'RU03');
assert.equal(technical.activeOwner,'RU06');
assert.equal(technical.authorityPolicy,'RU03_FAIL_CLOSED');
assert.equal(academic.activeOwner,'RU06');
assert.equal(reading.activeOwner,'RU06');
assert.equal(performance.activeOwner,'RU06');
assert.equal(performance.assessmentOwner,'RU04');
for(const t of performance.tasks||[]) assert.match(String(t.rubricRef||''),/^RU04-/);

const activeAuthorityValues=[
  scenario.activeOwner,
  ...Object.values(scenario.engine).filter(v=>typeof v==='string'),
  ai.activeOwner,
  ai.authority.canonicalTruthOwner,
  ai.authority.assessmentMasteryOwner,
  ai.authority.plannerSrsOwner,
  ai.authority.speechAudioOwner,
  ...ai.authority.academicTechnicalOwners,
  ai.generatedPractice.promotionPath,
  provenance.activeOwner,
  technical.activeOwner,
  technical.authorityPolicy,
  academic.activeOwner,
  reading.activeOwner,
  performance.activeOwner,
  performance.assessmentOwner,
  ...performance.tasks.map(t=>t.rubricRef)
];
for(const v of activeAuthorityValues){
  assert(!/^P(?:[0-9]|1[0-7])(?:$|[-_])/.test(String(v)), 'legacy Pxx topology leaked into active authority: '+v);
}

for(const legacy of [scenario,ai,provenance,technical,academic,reading,performance]){
  assert.match(String(legacy.sourcePhase||legacy.phase||''),/^P(?:[0-9]|1[0-7])$/,'legacy source provenance missing');
}

console.log(JSON.stringify({ok:true,rule:'legacy Pxx allowed only as source provenance/stable IDs; active authority must use RU topology'}));
