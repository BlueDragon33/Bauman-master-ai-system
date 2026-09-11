import fs from "node:fs";
import crypto from "node:crypto";

const registryPath = "roadmap_v2/registry/roadmap-v2.registry.json";
const specPath = "roadmap_v2/spec/Bauman_Roadmap_V2_Syllabus_Luot18.md";
const baselinePath = "roadmap_v2/baseline/math-main-e383912-inventory.json";
const legacyPath = "roadmap_v2/baseline/math-legacy-lessons-inventory.json";
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const registry = readJson(registryPath);
const baseline = readJson(baselinePath);
const legacy = readJson(legacyPath);
const chapters = registry.courses.flatMap((course) => course.levels.flatMap((level) => level.chapters));
const lessons = chapters.flatMap((chapter) => chapter.lessons);
const ids = [...chapters.map((item) => item.id), ...lessons.map((item) => item.id)];
const expectedCounts = {
  courses: 10,
  chapters: 85,
  numberedLessons: 304,
  dynamicChapters: 8,
  legacyPreserveChapters: 1,
  preservedLegacyLessons: 347,
  preservedTheoryOverlayRecords: 18,
  preservedLegacyLessonCandidates: 5
};

assert(registry.schema === "BAUMAN_ROADMAP_V2_SYLLABUS_REGISTRY_V1", "registry schema drift");
assert(registry.version === 2, "registry version must be 2 after corrected baseline audit");
assert(registry.source.file === specPath, "registry source must be the vendored corrected spec");
assert(registry.source.sha256 === sha256(specPath), "registry source fingerprint mismatch");
assert(registry.source.sha256 === "22b1bbbf900f2b0fb34db2d683944495dd3d34805ee28ac63de312a6ec648b5d", "unexpected corrected spec hash");
assert(registry.source.mathBaselineCommit === baseline.repository.headCommit, "baseline commit mismatch");
assert(baseline.step.status.startsWith("PASS_"), "Step 73 is not PASS");
for (const [key, expected] of Object.entries(expectedCounts)) {
  assert(registry.counts[key] === expected, `registry count mismatch ${key}: ${registry.counts[key]} != ${expected}`);
}
assert(chapters.length === 85 && lessons.length === 304, "flattened registry counts mismatch");
assert(new Set(ids).size === ids.length, "registry IDs are not unique");
assert(registry.courses.map((item) => item.order).join(",") === "1,2,3,4,5,6,7,8,9,10", "course ordering drift");
assert(chapters.filter((item) => item.deliveryMode === "dynamic").length === 8, "dynamic chapter count drift");
assert(chapters.filter((item) => item.deliveryMode === "legacy_preserve").length === 1, "legacy-preserve chapter count drift");

const contractFields = ["theory", "exercises", "application", "simulationOrLab", "assessment", "projectCheckpoint", "masterReadyEvidence"];
for (const chapter of chapters) {
  assert(chapter.prerequisites?.raw, `missing prerequisite contract: ${chapter.id}`);
  for (const field of contractFields) assert(chapter.learningContract?.[field]?.seed, `missing ${field} contract: ${chapter.id}`);
}
for (const lesson of lessons) {
  for (const field of contractFields) assert(lesson[field]?.seed, `missing lesson ${field} contract: ${lesson.id}`);
}

const c07 = chapters.find((item) => item.id === "MATH-L2-C07");
assert(c07?.title === "Covariance, correlation và PCA — LEGACY COMPOSITE", "MATH-L2-C07 title drift");
assert(c07?.deliveryMode === "legacy_preserve", "MATH-L2-C07 must be legacy_preserve");
assert(c07?.legacyBinding?.mappingStatus === "verified_minimum_set", "MATH-L2-C07 mapping is not verified");
assert(c07?.legacyBinding?.physicalSourceGitBlobSha === legacy.repository.gitBlobSha, "MATH-L2-C07 lesson blob mismatch");
assert(c07?.legacyBinding?.physicalLessonCandidates?.length === 5, "MATH-L2-C07 must have five minimum verified refs");
assert(c07?.legacyBinding?.sidecarGaps?.join(",") === "formula,exercise,simulation,test", "MATH-L2-C07 sidecar gaps drift");
assert(!JSON.stringify(c07).includes("E15"), "MATH-L2-C07 still contains the invalid E15 physical-source claim");

const weights = registry.priorityEngine.weights;
assert(weights.masterRelevance === 0.35 && weights.knowledgeGap === 0.30 && weights.prerequisiteUrgency === 0.20 && weights.forgettingRisk === 0.15, "Priority Engine weights drift");
assert(Math.abs(Object.values(weights).reduce((sum, value) => sum + value, 0) - 1) < Number.EPSILON, "Priority Engine weights must sum to 1");
assert(registry.baseline.runtimeModified === false && registry.acceptance.runtimeModified === false, "registry generation modified runtime");
assert(registry.acceptance.result === "PASS", "Step 74 acceptance is not PASS");

console.log(JSON.stringify({
  step: 74,
  result: "PASS",
  sourceSha256: registry.source.sha256,
  counts: registry.counts,
  chapterContractsChecked: chapters.length,
  lessonContractsChecked: lessons.length,
  uniqueIds: ids.length,
  verifiedLegacyRefs: c07.legacyBinding.physicalLessonCandidates.length,
  runtimeModified: false
}, null, 2));
