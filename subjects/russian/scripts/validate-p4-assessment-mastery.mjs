import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const json=p=>JSON.parse(read(p));

const core=read('subjects/russian/assets/core.js');
const index=read('subjects/russian/index.html');
const assessment=read('subjects/russian/assets/assessment-mastery.js');
const tests=json('subjects/russian/data/tests.json');
const attempt=json('subjects/russian/docs/p4/RUSSIAN_ATTEMPT_STATE_SCHEMA.json');
const mastery=json('subjects/russian/docs/p4/RUSSIAN_MASTERY_STATE_SCHEMA.json');
const srs=json('subjects/russian/docs/p4/RUSSIAN_SRS_STATE_SCHEMA.json');
const remediation=json('subjects/russian/docs/p4/RUSSIAN_REMEDIATION_STATE_SCHEMA.json');
const ownership=read('subjects/russian/docs/p4/RUSSIAN_MASTERY_OWNERSHIP_MATRIX.md');
const alignment=read('subjects/russian/docs/p4/RUSSIAN_ASSESSMENT_ALIGNMENT_MATRIX.md');
const migration=read('subjects/russian/docs/p4/RUSSIAN_ASSESSMENT_MIGRATION_PLAN.md');

assert.match(index,/assets\/assessment-mastery\.js/,'Canonical P4 owner must be loaded');
assert.match(assessment,/RUSSIAN_ASSESSMENT_MASTERY_STATE_V1/);
assert.match(assessment,/recordAssessmentAttempt/);
assert.match(assessment,/firstAttemptByAssessment/);
assert.match(assessment,/firstAttemptByItem/);
assert.match(assessment,/recordEvidence/);
assert.match(assessment,/authoritative===true/);
assert.match(assessment,/recordStageGate/);
assert.match(assessment,/early-retention-repair/);
assert.match(assessment,/mid-retention/);
assert.match(assessment,/transfer-weakness-check/);
assert.match(assessment,/longer-retention-stage-consolidation/);

assert.match(core,/markStorageRecovery/);
assert.match(core,/Russian core state write blocked until explicit recovery decision/);
assert.match(core,/RussianCoreStateRecovery/);
assert.doesNotMatch(core,/raw\.length>maxChars[\s\S]{0,400}localStorage\.removeItem\(keyName\)/,'Oversize state must not be deleted');
assert.match(core,/recordAssessmentAttempt/,'Exam submit must write canonical attempt');
assert.match(core,/canonicalExamAttemptId/);
assert.match(core,/attemptIds/);
assert.match(core,/score:null[\s\S]{0,200}selfConfirmed:true/,'Manual speaking confirmation must not fabricate score 100');
assert.doesNotMatch(core,/manual:true[^\n]{0,160}score:100|score:100[^\n]{0,160}manual:true/,'Manual speaking must not store fake 100%');

assert.equal(attempt.stateSchema,'RUSSIAN_ATTEMPT_STATE_V1');
assert.ok(attempt.invariants.includes('first submitted attempt never overwritten'));
assert.ok(attempt.invariants.includes('retry uses new attemptId'));
assert.equal(mastery.stateSchema,'RUSSIAN_MASTERY_STATE_V1');
assert.ok(mastery.rules.includes('presentation cannot write mastery'));
assert.ok(mastery.rules.includes('AI Mentor cannot write official mastery'));
assert.equal(srs.stateSchema,'RUSSIAN_SRS_STATE_V1');
assert.equal(srs.owners.generalReviewQueue,'subjects/russian/assets/learning-state.js');
assert.equal(srs.owners.vocabularySchedule,'subjects/russian/assets/vocab-srs.js');
assert.equal(remediation.stateSchema,'RUSSIAN_REMEDIATION_STATE_V1');
assert.ok(remediation.rules.includes('opening remediation never clears weakness'));

assert.match(ownership,/assessment-mastery\.js/);
assert.match(ownership,/ONE OWNER/);
assert.match(ownership,/SIGNAL, NOT MASTERY OWNER/);
assert.match(alignment,/1,320/);
assert.match(alignment,/multiple_choice/);
assert.match(alignment,/PRESERVE AS ASSESSMENT COMPONENT/);
assert.match(migration,/Do \*\*not\*\* fabricate item-level first-attempt history/);

const qs=Array.isArray(tests.questions)?tests.questions:[];
assert.equal(qs.length,1320,'Current question-bank baseline changed unexpectedly');
assert.equal(qs.filter(q=>q.questionType==='multiple_choice').length,1320,'Current P4 evidence classification must be updated if question types change');
assert.equal(new Set(qs.map(q=>q.stage)).size,6);
assert.equal(new Set(qs.map(q=>q.lessonId).filter(Boolean)).size,26);
assert.equal(qs.filter(q=>q.diagnostic).length,1320);
assert.equal(qs.filter(q=>q.review).length,1320);
const stageCounts=Object.fromEntries([...new Set(qs.map(q=>q.stage))].map(s=>[s,qs.filter(q=>q.stage===s).length]));
for(const [stage,count] of Object.entries(stageCounts))assert.equal(count,220,`${stage}: expected 220 baseline questions`);
const prompts=qs.map(q=>String(q.question||'').trim()).filter(Boolean);
assert.equal(new Set(prompts).size,prompts.length,'Exact duplicate question prompts found');

assert.equal(Number(tests.passRule?.passScore),80);
const levelCounts=Object.fromEntries((tests.examPlan?.levels||[]).map(x=>[x.id,Number(x.count)]));
assert.deepEqual(levelCounts,{easy:20,medium:40,hard:60,expert:100});

console.log(JSON.stringify({
  phase:'P4',
  status:'PASS',
  canonicalAttemptOwner:'assessment-mastery.js',
  bankQuestions:qs.length,
  bankQuestionTypes:[...new Set(qs.map(q=>q.questionType))],
  stages:Object.keys(stageCounts).length,
  lessons:new Set(qs.map(q=>q.lessonId).filter(Boolean)).size,
  passScore:tests.passRule?.passScore,
  paperSizes:levelCounts,
  stateRecovery:'preserve-and-block-overwrite',
  manualSpeakingScore:'non-numeric-self-confirmation'
},null,2));
