import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const planner=read('subjects/russian/assets/adaptive-planner.js');
const index=read('subjects/russian/index.html');
const sw=read('subjects/russian/sw.js');

assert.match(planner,/RUSSIAN_ADAPTIVE_PLANNER_V1/);
assert.match(planner,/function buildPlan\(/);
assert.match(planner,/dueLearning\(\)/);
assert.match(planner,/dueVocab\(\)/);
assert.match(planner,/weaknessTasks\(\)/);
assert.match(planner,/balanceTasks\(base\)/);
assert.match(planner,/sort\(\(a,b\)=>b\.priority-a\.priority\|\|a\.id\.localeCompare\(b\.id\)\)/);
assert.doesNotMatch(planner,/recordEvidence\s*\(/,'Planner must not write mastery evidence');
assert.doesNotMatch(planner,/recordAssessmentAttempt\s*\(/,'Planner must not own assessment attempts');
assert.doesNotMatch(planner,/Math\.random\s*\(/,'Planner must remain deterministic by default');
assert.ok(index.indexOf('assets/assessment-mastery.js') < index.indexOf('assets/adaptive-planner.js'),'P4 mastery must load before P5 planner');
assert.ok(index.indexOf('assets/adaptive-planner.js') < index.indexOf('assets/learning-state.js'),'Planner must load before Today renderer');
assert.match(sw,/russian-app-shell-v\\d+-[a-z0-9-]+/,'Offline shell cache must remain versioned; later phases may advance the cache version');
assert.match(sw,/\.\/assets\/adaptive-planner\.js/);

const required=[
  'subjects/russian/docs/p5/RUSSIAN_ADAPTIVE_SRS_PERSONALIZATION_CONSTITUTION.md',
  'subjects/russian/docs/p5/RUSSIAN_DAILY_PLANNER_CONTRACT.json',
  'subjects/russian/docs/p5/RUSSIAN_PERSONALIZATION_STATE_SCHEMA.json',
  'subjects/russian/docs/p5/RUSSIAN_RECOMMENDATION_REASON_CODES.json',
  'subjects/russian/docs/p5/RUSSIAN_ADAPTIVE_PRIORITY_POLICY.md',
  'subjects/russian/docs/p5/RUSSIAN_BACKLOG_RECOVERY_POLICY.md',
  'subjects/russian/docs/p5/RUSSIAN_SKILL_BALANCE_POLICY.md',
  'subjects/russian/docs/p5/RUSSIAN_INTENSIVE_MODE_POLICY.md',
  'subjects/russian/docs/p5/RUSSIAN_PERSONALIZATION_TEST_MATRIX.md',
  'subjects/russian/docs/p5/RUSSIAN_P5_EVIDENCE_INDEX.md',
  'subjects/russian/docs/p5/RUSSIAN_P5_PHASE_RECORD.md'
];
for(const p of required)assert.ok(fs.existsSync(p),p+' missing');
console.log('Russian P5 adaptive planner contract: PASS');