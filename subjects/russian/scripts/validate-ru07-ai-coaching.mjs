import fs from 'node:fs';
import assert from 'node:assert/strict';
const j=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const base=j('subjects/russian/data/ai-mentor-policy.json');
const modes=j('subjects/russian/docs/ru07/RUSSIAN_RU07_AI_MODE_PERMISSION_MATRIX.json');
const ctx=j('subjects/russian/docs/ru07/RUSSIAN_RU07_CONTEXT_GROUNDING_CONTRACT.json');
const sec=j('subjects/russian/docs/ru07/RUSSIAN_RU07_FEEDBACK_ASSESSMENT_SECURITY_POLICY.json');
const fb=j('subjects/russian/docs/ru07/RUSSIAN_RU07_FALLBACK_POLICY.json');
const fx=j('subjects/russian/docs/ru07/RUSSIAN_RU07_GOLDEN_AI_FIXTURES.json');

assert.equal(base.phase,'RU07','active AI policy must be owned by RU07');
assert.equal(base.legacySourceResponsibility,'P10');
assert.deepEqual(base.authority,{
  canonicalTruthOwner:'RU03',
  assessmentMasteryOwner:'RU04',
  plannerSrsOwner:'RU04',
  speechAudioScenarioOwner:'RU05',
  academicResearchProductionOwner:'RU06',
  authoringPromotionOwner:'RU08',
  aiRole:'NON_AUTHORITATIVE_COACH'
});
assert.equal(base.generatedPractice.promotionPath,'RU08_AUTHORING_REVIEW_GOVERNANCE');
assert.equal(base.generatedPractice.lifecycle,'EPHEMERAL_UNTIL_RU08_REVIEW');
assert.equal(base.contextPolicy.minimumNecessaryOnly,true);
assert.equal(base.contextPolicy.fullLearnerHistoryByDefault,false);
assert.equal(base.contextPolicy.wholeDatasetDumpByDefault,false);
assert.equal(base.contextPolicy.conversationSummaryIsCanonicalTruth,false);
for(const k of ['writeMastery','writeAttemptHistory','writeSrs','writePlanner','unlockStage','generateCanonicalContent']) assert.equal(base.permissions[k],false,'base AI permission unsafe '+k);
for(const x of ['write-mastery','write-official-score','overwrite-canonical-content','fabricate-citation','fabricate-result']) assert(modes.forbidden.includes(x));
for(const x of ['assessment-submit','source-rubric-revision','scenario-run-change']) assert(ctx.staleResponseQuarantine.includes(x));
for(const x of ['direct-answer','translation-answer','previous-turn-answer-context']) assert(sec.assessmentLeakageBlocked.includes(x));
assert(sec.promptInjectionSources.includes('retrieved-snippets'));
assert(fb.providerFailure.includes('deterministic-practice'));
for(const id of ['fake-citation','assessment-leakage','prompt-injection-document','stale-response','provider-failure']) assert(fx.fixtures.some(x=>x.id===id));
const serialized=JSON.stringify(base);
for(const stale of ['"canonicalTruthOwner":"P7"','"assessmentMasteryOwner":"P4"','"plannerSrsOwner":"P5"','"speechAudioOwner":"P6"','P12_REVIEW_WORKFLOW']) assert(!serialized.includes(stale),'stale active P-topology leaked into RU07 policy: '+stale);
console.log(JSON.stringify({ok:true,phase:base.phase,modes:Object.keys(modes.modes).length,fixtures:fx.fixtures.length}));
