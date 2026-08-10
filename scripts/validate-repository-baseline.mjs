import crypto from "node:crypto";
import fs from "node:fs";

const baseline = JSON.parse(fs.readFileSync("roadmap_v2/baseline/math-main-e383912-inventory.json", "utf8"));
const legacy = JSON.parse(fs.readFileSync("roadmap_v2/baseline/math-legacy-lessons-inventory.json", "utf8"));
const physical = JSON.parse(fs.readFileSync("roadmap_v2/baseline/math-physical-source-inventory.json", "utf8"));
const fail = (message) => { throw new Error(message); };

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`);
  return crypto.createHash("sha1").update(header).update(buffer).digest("hex");
}

function expectedFingerprints() {
  const entries = [
    ...baseline.coreFiles,
    ...baseline.referencedRuntimeAssets,
    physical.sourceRoles.legacyLessons,
    physical.sourceRoles.theoryOverlay,
    physical.sourceRoles.theoryFramework,
    physical.sourceRoles.chapterSpine,
    ...baseline.externalDataSources.filter((item) => [
      "formulas", "exercises", "applications", "simulations", "professor_qa", "tests"
    ].includes(item.id))
  ];
  return Object.fromEntries(entries.map((item) => [item.path, item.gitBlobSha]));
}

export function collectProtectedFingerprints() {
  const expected = expectedFingerprints();
  const actual = {};
  for (const [file, expectedSha] of Object.entries(expected)) {
    if (!fs.existsSync(file)) fail(`Protected baseline file is missing: ${file}`);
    const sha = gitBlobSha(fs.readFileSync(file));
    if (sha !== expectedSha) fail(`Protected fingerprint drift: ${file}; expected ${expectedSha}; received ${sha}`);
    actual[file] = sha;
  }
  return actual;
}

export function validateAcademicBaseline() {
  const lessons = JSON.parse(fs.readFileSync(physical.sourceRoles.legacyLessons.path, "utf8"));
  if (!Array.isArray(lessons)) fail("lessons.json must be an array");
  const lessonIds = lessons.map((lesson) => lesson.id || lesson.lessonId);
  if (lessons.length !== legacy.counts.lessons) fail(`Unexpected lesson count: ${lessons.length}`);
  if (new Set(lessonIds).size !== legacy.counts.uniqueLessonIds) fail("Lesson IDs are not unique");
  const chapterIds = new Set(lessons.map((lesson) => lesson.chapterId));
  if (chapterIds.size !== legacy.counts.physicalContentGroups) fail(`Unexpected physical content-group count: ${chapterIds.size}`);
  const slides = lessons.reduce((sum, lesson) => sum + (Array.isArray(lesson.slides) ? lesson.slides.length : 0), 0);
  if (slides !== legacy.counts.slides) fail(`Unexpected base slide count: ${slides}`);

  const requiredLegacyRefs = physical.roadmapV2Composite.verifiedLegacyRefs;
  for (const id of requiredLegacyRefs) if (!lessonIds.includes(id)) fail(`Missing verified covariance/PCA legacy lesson: ${id}`);

  const overlay = JSON.parse(fs.readFileSync(physical.sourceRoles.theoryOverlay.path, "utf8"));
  if ((overlay.records || []).length !== physical.sourceRoles.theoryOverlay.counts.records) fail("Unexpected durable theory overlay count");

  const framework = JSON.parse(fs.readFileSync(physical.sourceRoles.theoryFramework.path, "utf8"));
  const frameworkChapters = (framework.faculties || []).flatMap((faculty) =>
    (faculty.departments || []).flatMap((department) => department.chapters || [])
  );
  const frameworkSubLessons = frameworkChapters.flatMap((chapter) => chapter.subLessons || []);
  if (frameworkChapters.length !== physical.sourceRoles.theoryFramework.counts.frameworkChapters) fail("Unexpected theory-framework chapter count");
  if (frameworkSubLessons.length !== physical.sourceRoles.theoryFramework.counts.frameworkSubLessons) fail("Unexpected theory-framework sub-lesson count");
  const mP07 = frameworkChapters.find((chapter) => chapter.id === "m_p07");
  if (!mP07 || (mP07.subLessons || []).length !== 8) fail("m_p07 outline candidate drift");
  if ((mP07.subLessons || []).some((item) => item.contentStatus !== "outline_only_waiting_for_full_content")) fail("m_p07 unexpectedly contains runtime-ready content");

  for (const file of physical.standaloneSidecarAudit.emptyArrays) {
    const value = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!Array.isArray(value) || value.length !== 0) fail(`${file} is no longer the locked empty baseline`);
  }

  const tests = JSON.parse(fs.readFileSync(physical.standaloneSidecarAudit.testShell.path, "utf8"));
  if (!Array.isArray(tests.levels) || tests.levels.length !== physical.standaloneSidecarAudit.testShell.levels) fail("Unexpected tests.json contract level count");
  if (!Array.isArray(tests.questions) || tests.questions.length !== physical.standaloneSidecarAudit.testShell.questions) fail("Unexpected tests.json question count");

  return {
    lessons: lessons.length,
    uniqueLessonIds: new Set(lessonIds).size,
    sourceChapters: legacy.counts.sourceChapters,
    physicalContentGroups: chapterIds.size,
    baseSlides: slides,
    durableTheoryOverlayRecords: (overlay.records || []).length,
    frameworkOutlineChapters: frameworkChapters.length,
    frameworkOutlineSubLessons: frameworkSubLessons.length,
    verifiedCompositeLegacyRefs: requiredLegacyRefs.length,
    emptyStandaloneSources: physical.standaloneSidecarAudit.emptyArrays.length,
    testContractLevels: tests.levels.length,
    testQuestions: tests.questions.length
  };
}

if (process.argv[1] && process.argv[1].endsWith("validate-repository-baseline.mjs")) {
  const fingerprints = collectProtectedFingerprints();
  const academic = validateAcademicBaseline();
  console.log(JSON.stringify({
    status: "PASS_B77",
    baselineCommit: baseline.repository.headCommit,
    protectedFingerprints: Object.keys(fingerprints).length,
    academic
  }));
}
