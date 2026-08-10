import crypto from 'node:crypto';
import fs from 'node:fs';

const baseline = JSON.parse(fs.readFileSync('docs/roadmap_v2/baseline_inventory.json', 'utf8'));
const fail = message => { throw new Error(message); };

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`);
  return crypto.createHash('sha1').update(header).update(buffer).digest('hex');
}

export function collectProtectedFingerprints() {
  const actual = {};
  for (const [file, expected] of Object.entries(baseline.fingerprints)) {
    if (!fs.existsSync(file)) fail(`Protected baseline file is missing: ${file}`);
    const sha = gitBlobSha(fs.readFileSync(file));
    if (sha !== expected) fail(`Protected fingerprint drift: ${file}; expected ${expected}; received ${sha}`);
    actual[file] = sha;
  }
  return actual;
}

export function validateAcademicBaseline() {
  const lessons = JSON.parse(fs.readFileSync('subjects/math/data/lessons.json', 'utf8'));
  if (!Array.isArray(lessons)) fail('lessons.json must be an array');
  const lessonIds = lessons.map(lesson => lesson.id || lesson.lessonId);
  if (lessons.length !== baseline.physicalCounts.lessonRecords) fail(`Unexpected lesson count: ${lessons.length}`);
  if (new Set(lessonIds).size !== baseline.physicalCounts.uniqueLessonIds) fail('Lesson IDs are not unique');
  const chapterIds = new Set(lessons.map(lesson => lesson.chapterId));
  if (chapterIds.size !== baseline.physicalCounts.lessonChapterIds) fail(`Unexpected lesson chapter count: ${chapterIds.size}`);
  const slides = lessons.reduce((sum, lesson) => sum + (Array.isArray(lesson.slides) ? lesson.slides.length : 0), 0);
  if (slides !== baseline.physicalCounts.baseSlides) fail(`Unexpected base slide count: ${slides}`);

  const requiredLegacyRefs = baseline.roadmapLogicalMappings['MATH-L2-C07'].legacyRefs;
  for (const id of requiredLegacyRefs) if (!lessonIds.includes(id)) fail(`Missing verified covariance/PCA legacy lesson: ${id}`);

  const overlay = JSON.parse(fs.readFileSync('subjects/math/data/theory_lecture_content.json', 'utf8'));
  if ((overlay.records || []).length !== baseline.physicalCounts.durableTheoryOverlayRecords) fail('Unexpected durable theory overlay count');

  for (const file of ['formulas.json', 'exercises.json', 'simulations.json']) {
    const value = JSON.parse(fs.readFileSync(`subjects/math/data/${file}`, 'utf8'));
    if (!Array.isArray(value) || value.length !== 0) fail(`${file} is no longer the locked empty baseline`);
  }

  const tests = JSON.parse(fs.readFileSync('subjects/math/data/tests.json', 'utf8'));
  if (!Array.isArray(tests.levels) || tests.levels.length !== baseline.physicalCounts.testContractLevels) fail('Unexpected tests.json contract level count');
  if (!Array.isArray(tests.questions) || tests.questions.length !== baseline.physicalCounts.testQuestions) fail('Unexpected tests.json question count');

  return {
    lessons: lessons.length,
    uniqueLessonIds: new Set(lessonIds).size,
    lessonChapterIds: chapterIds.size,
    baseSlides: slides,
    durableTheoryOverlayRecords: (overlay.records || []).length,
    verifiedCompositeLegacyRefs: requiredLegacyRefs.length,
    emptyStandaloneSources: 3,
    testContractLevels: tests.levels.length
  };
}

if (process.argv[1] && process.argv[1].endsWith('validate-repository-baseline.mjs')) {
  const fingerprints = collectProtectedFingerprints();
  const academic = validateAcademicBaseline();
  console.log(JSON.stringify({
    status: 'PASS_B77',
    baselineCommit: baseline.commit,
    protectedFingerprints: Object.keys(fingerprints).length,
    academic
  }));
}
