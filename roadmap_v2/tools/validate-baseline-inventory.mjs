import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const BASE = path.join(ROOT, "roadmap_v2/baseline");
const files = {
  canonical: "math-main-e383912-inventory.json",
  lessons: "math-legacy-lessons-inventory.json",
  physical: "math-physical-source-inventory.json",
  framework: "math-theory-framework-inventory.json"
};

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(BASE, name), "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const canonical = readJson(files.canonical);
const lessons = readJson(files.lessons);
const physical = readJson(files.physical);
const framework = readJson(files.framework);
const expectedRef = "e383912354673bdce7a0059d6b9a23799d74e689";
const lessonBlob = "caacdf2b0813c1300af215608c4222ca61669184";
const expectedCompositeRefs = [
  "MATH-VN-PS-C05-L05",
  "MATH-PREP-LA2-C10-L05",
  "MATH-PREP-LA2-C10-L06",
  "MATH-PREP-LA2-C10-L07",
  "MATH-PREP-PS2-C15-L06"
];

assert(canonical.repository.headCommit === expectedRef, "canonical baseline ref drift");
assert(canonical.step.status.startsWith("PASS_"), "baseline step is not closed as PASS");
assert(lessons.repository.ref === expectedRef, "lesson inventory ref drift");
assert(physical.repository.ref === expectedRef, "physical inventory ref drift");
assert(lessons.repository.gitBlobSha === lessonBlob, "lesson blob fingerprint drift");
assert(physical.sourceRoles.legacyLessons.gitBlobSha === lessonBlob, "physical source lesson blob mismatch");
assert(lessons.counts.lessons === 347, "expected 347 legacy lessons");
assert(lessons.counts.uniqueLessonIds === 347 && lessons.counts.duplicateLessonIds === 0, "legacy lesson IDs are not unique");
assert(lessons.counts.sourceChapters === 40, "expected 40 source chapters");
assert(lessons.counts.physicalContentGroups === 41, "expected 41 physical content groups");
assert(lessons.counts.slides === 5552, "expected 5,552 legacy slides");
assert(lessons.counts.minSlidesPerLesson === 16 && lessons.counts.maxSlidesPerLesson === 16, "legacy slide-count contract drift");
assert(lessons.contentGroups.length === 41, "content-group inventory is incomplete");
assert(lessons.contentGroups.reduce((sum, item) => sum + item.lessonCount, 0) === 347, "content-group lesson total mismatch");
assert(lessons.contentGroups.reduce((sum, item) => sum + item.slideCount, 0) === 5552, "content-group slide total mismatch");
assert(lessons.resolvedCountExplanation.result === "intentional_content_segmentation", "40/41 count discrepancy is unresolved");

const canonicalComposite = canonical.legacyCompositeCovarianceCorrelationPca.lessons.map((item) => item.id);
const lessonComposite = lessons.roadmapV2Composite.lessons.map((item) => item.id);
const physicalComposite = physical.roadmapV2Composite.verifiedLegacyRefs;
for (const refs of [canonicalComposite, lessonComposite, physicalComposite]) {
  assert(JSON.stringify(refs) === JSON.stringify(expectedCompositeRefs), "MATH-L2-C07 verified legacy refs drift");
}

const external = Object.fromEntries(canonical.externalDataSources.map((item) => [item.id, item]));
assert(external.lessons.actualPrimaryCount === 347 && external.lessons.status === "populated", "canonical lessons classification is wrong");
assert(external.speaking.actualPrimaryCount === 260 && external.speaking.status === "populated", "large speaking blob classification is wrong");
assert(external["dialogue-bauman-az"].actualPrimaryCount === 520 && external["dialogue-bauman-az"].status === "populated", "large dialogue blob classification is wrong");
for (const id of ["formulas", "exercises", "applications", "simulations"]) {
  assert(external[id].actualPrimaryCount === 0, `${id} must remain recorded as an empty sidecar source`);
}
assert(external.tests.topLevelArrayCounts.questions === 0, "tests.json must remain recorded as a zero-question shell");
assert(physical.sourceRoles.theoryOverlay.counts.records === 18, "expected 18 theory overlay records");
assert(physical.sourceRoles.theoryOverlay.counts.slides === 300, "expected 300 theory overlay slides");
assert(physical.sourceRoles.theoryFramework.role === "secondary_outline_candidate_not_physical_lesson_source", "theory framework role is unsafe");
assert(framework.repository.ref === expectedRef, "theory framework inventory ref drift");
assert(framework.repository.gitBlobSha === "fb3a9a052e6c467c03bea5204dae10303ba73766", "theory framework blob fingerprint drift");
assert(framework.counts.chapters === 21 && framework.counts.uniqueChapterIds === 21, "theory framework chapter inventory drift");
assert(framework.counts.subLessons === 172 && framework.counts.uniqueSubLessonIds === 172, "theory framework sublesson inventory drift");
assert(framework.chapters.length === 21, "theory framework chapter list incomplete");
assert(framework.chapters.reduce((sum, item) => sum + item.subLessonIds.length, 0) === 172, "theory framework sublesson list incomplete");
assert(framework.role === "secondary_outline_candidates_not_authoritative_physical_lessons", "theory framework authority classification is unsafe");
assert(canonical.acceptance.runtimeModified === false, "baseline audit must not modify runtime");

const checksumLines = fs.readFileSync(path.join(BASE, "math-main-e383912-inventory.sha256"), "utf8")
  .trim()
  .split(/\r?\n/);
const checksumMap = Object.fromEntries(checksumLines.map((line) => {
  const match = line.match(/^([a-f0-9]{64})\s+(.+)$/);
  assert(match, `invalid checksum line: ${line}`);
  return [match[2], match[1]];
}));
for (const name of Object.values(files)) {
  const content = fs.readFileSync(path.join(BASE, name));
  const actual = crypto.createHash("sha256").update(content).digest("hex");
  assert(checksumMap[name] === actual, `SHA-256 mismatch for ${name}`);
}

console.log(JSON.stringify({
  step: 73,
  result: "PASS",
  ref: expectedRef,
  legacyLessons: lessons.counts.lessons,
  legacySlides: lessons.counts.slides,
  sourceChapters: lessons.counts.sourceChapters,
  physicalContentGroups: lessons.counts.physicalContentGroups,
  overlayRecords: physical.sourceRoles.theoryOverlay.counts.records,
  verifiedCompositeRefs: expectedCompositeRefs.length,
  runtimeModified: false
}, null, 2));
