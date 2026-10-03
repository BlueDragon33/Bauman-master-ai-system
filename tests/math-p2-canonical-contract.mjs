import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const fail = (msg) => { throw new Error('[MATH02] ' + msg); };

const model = readJson('prompts/subjects/math/evidence/MATH_P2_CANONICAL_MODEL.json');

if (model.schemaVersion !== '1.0.0') fail('unexpected schemaVersion');
if (model.status !== 'VALIDATING') fail('contract must remain VALIDATING until repository evidence passes');
if (model.owner?.curriculumTruth !== 'prompts/subjects/math/evidence/MATH_P2_CANONICAL_MODEL.json') fail('canonical curriculum owner mismatch');

const tiers = Object.keys(model.evidenceSemantics || {});
for (const tier of ['exposure','progress','performance','mastery']) {
  if (!tiers.includes(tier)) fail('missing evidence tier ' + tier);
}
if (!/never granted from self-report/i.test(model.evidenceSemantics.mastery || '')) {
  fail('mastery truthfulness guard missing');
}

for (const [name, def] of Object.entries(model.entityFamilies || {})) {
  if (!def.prefix || !Array.isArray(def.required) || !def.required.includes('provenance')) {
    fail('entity family lacks prefix/required provenance: ' + name);
  }
}

const counts = new Set(model.countSemantics || []);
for (const key of ['actualRecordCount','plannedTargetCount','coverageCount','derivedIndexCount','legacyCompatibilityCount']) {
  if (!counts.has(key)) fail('missing count semantic ' + key);
}

if (!model.migration?.preserveLearnerState) fail('learner-state preservation must be explicit');
if (!model.migration?.rollbackRequired) fail('rollback requirement missing');
if (model.mathematicalTruth?.generatedCandidateCanonicalByDefault !== false) fail('generated candidate authority unsafe');

const topo = model.topology?.order || [];
if (topo.join('>') !== 'stage>discipline>chapter>lesson') fail('non-deterministic topology');

const collectStrings = (node, keys, out = new Set()) => {
  if (Array.isArray(node)) {
    for (const v of node) collectStrings(v, keys, out);
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (keys.has(k) && typeof v === 'string') out.add(v);
      collectStrings(v, keys, out);
    }
  }
  return out;
};

const chapters = readJson('subjects/math/data/chapter_spine.json');
const chapterIds = collectStrings(chapters, new Set(['id','chapterId']));
if (chapterIds.size < 56) fail('chapter spine exposes fewer than 56 chapter IDs');

const lessons = readJson('subjects/math/data/lessons.json');
const lessonIds = collectStrings(lessons, new Set(['id','lessonId']));
if (lessonIds.size < 86) fail('lessons source exposes fewer than 86 retained lesson IDs');

const sidecars = [
  'formula_content.json',
  'exercise_content.json',
  'application_content.json',
  'simulation_content.json',
  'professor_qa_content.json',
  'review_pack_content.json',
  'question_bank_content.json'
];

let checked = 0;
for (const file of sidecars) {
  const doc = readJson('subjects/math/data/' + file);
  const records = Array.isArray(doc) ? doc : (Array.isArray(doc.records) ? doc.records : []);
  for (const record of records) {
    if (record.chapterId && !chapterIds.has(record.chapterId)) {
      fail(file + ' orphan chapterId ' + record.chapterId);
    }
    if (record.lessonId && !lessonIds.has(record.lessonId)) {
      fail(file + ' orphan lessonId ' + record.lessonId);
    }
    if (record.lessonId || record.chapterId) checked += 1;
  }
}
if (checked === 0) fail('no sidecar references were checked');

const theory = readJson('subjects/math/data/theory_lecture_content.json');
const theoryRecords = Array.isArray(theory) ? theory : (Array.isArray(theory.records) ? theory.records : []);
if (theoryRecords.length === 0) fail('theory_lecture_content has no measurable records');

console.log(JSON.stringify({
  status: 'PASS',
  check: 'MATH02 canonical contract',
  chapterIds: chapterIds.size,
  lessonIds: lessonIds.size,
  sidecarReferencesChecked: checked,
  theoryLectureRecords: theoryRecords.length
}));
