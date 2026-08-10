import fs from "node:fs";
import crypto from "node:crypto";

const paths = {
  registry: "roadmap_v2/registry/roadmap-v2.registry.json",
  graph: "roadmap_v2/graph/prerequisite-graph.json",
  baseline: "roadmap_v2/baseline/math-main-e383912-inventory.json",
  physical: "roadmap_v2/baseline/math-physical-source-inventory.json",
  legacy: "roadmap_v2/baseline/math-legacy-lessons-inventory.json",
  framework: "roadmap_v2/baseline/math-theory-framework-inventory.json",
  mapping: "roadmap_v2/migration/legacy-to-roadmap-v2.mapping.json",
  contract: "roadmap_v2/migration/migration-contract.json",
  report: "roadmap_v2/reports/migration-l19.json"
};
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const registry = readJson(paths.registry);
const graph = readJson(paths.graph);
const baseline = readJson(paths.baseline);
const legacy = readJson(paths.legacy);
const framework = readJson(paths.framework);
const mapping = readJson(paths.mapping);
const contract = readJson(paths.contract);
const report = readJson(paths.report);
const chapters = registry.courses.flatMap((course) => course.levels.flatMap((level) => level.chapters));
const targetIds = new Set(chapters.map((item) => item.id));

assert(mapping.schema === "BAUMAN_ROADMAP_V2_LEGACY_MAPPING_V2" && mapping.version === 2, "mapping schema/version drift");
assert(contract.schema === "BAUMAN_ROADMAP_V2_MIGRATION_CONTRACT_V2" && contract.version === 2, "contract schema/version drift");
assert(mapping.source.baselineCommit === baseline.repository.headCommit, "mapping baseline commit drift");
assert(mapping.target.registrySha256 === sha256(paths.registry), "mapping registry hash mismatch");
assert(mapping.target.graphSha256 === sha256(paths.graph), "mapping graph hash mismatch");
assert(graph.source.registrySha256 === sha256(paths.registry), "graph registry hash mismatch");

const expectedLegacyIds = legacy.contentGroups.flatMap((group) => {
  const prefix = group.firstLessonId.replace(/L\d{2}$/, "");
  return Array.from({ length: group.lessonCount }, (_, index) => `${prefix}L${String(index + 1).padStart(2, "0")}`);
});
const mappedLegacyIds = mapping.legacyLessonMappings.map((item) => item.legacyId);
assert(expectedLegacyIds.length === 347 && new Set(expectedLegacyIds).size === 347, "legacy inventory expansion drift");
assert(JSON.stringify(mappedLegacyIds) === JSON.stringify(expectedLegacyIds), "mapping does not cover every legacy lesson in stable order");
assert(mapping.legacyLessonMappings.every((item) => item.preserveLegacyId && item.inPlaceMutationAllowed === false), "legacy identity/mutation policy violated");
assert(mapping.legacyLessonMappings.every((item) => item.priorityEngineEligible === false), "legacy lesson activated too early");

const exact = mapping.legacyLessonMappings.filter((item) => item.mappingStatus === "verified_exact_lesson_to_logical_chapter");
const unmapped = mapping.legacyLessonMappings.filter((item) => item.mappingStatus === "preserved_unmapped_requires_semantic_review");
const expectedExactIds = legacy.roadmapV2Composite.lessons.map((item) => item.id);
assert(exact.length === 5 && JSON.stringify(exact.map((item) => item.legacyId)) === JSON.stringify(expectedExactIds), "exact C07 mapping set drift");
assert(exact.every((item) => JSON.stringify(item.targetChapterIds) === JSON.stringify(["MATH-L2-C07"])), "exact legacy refs target the wrong logical chapter");
assert(exact.every((item) => item.contentReadiness.additiveSidecars === "required_missing"), "exact legacy refs incorrectly marked runtime-ready");
assert(unmapped.length === 342 && unmapped.every((item) => item.targetChapterIds.length === 0), "unreviewed legacy lesson was assigned a target");

const expectedOverlayIds = Object.values(baseline.durableTheoryContent.distribution).flatMap((item) => item.lessonIds);
assert(mapping.overlayMappings.length === 18, "overlay inventory count drift");
assert(JSON.stringify(mapping.overlayMappings.map((item) => item.legacyId)) === JSON.stringify(expectedOverlayIds), "overlay source coverage drift");
assert(mapping.overlayMappings.every((item) => item.mappingStatus === "chapter_verified_lesson_granularity_pending"), "overlay mapping status is unsafe");
assert(mapping.overlayMappings.every((item) => item.inPlaceMutationAllowed === false && item.priorityEngineEligible === false), "overlay activated or mutated too early");

assert(mapping.frameworkMappings.length === 21, "framework chapter coverage drift");
assert(JSON.stringify(mapping.frameworkMappings.map((item) => item.legacyId)) === JSON.stringify(framework.chapters.map((item) => item.id)), "framework chapter order/coverage drift");
assert(mapping.frameworkMappings.reduce((sum, item) => sum + item.legacySubLessonIds.length, 0) === 172, "framework sublesson coverage drift");
assert(mapping.frameworkMappings.every((item) => item.mappingStatus === "secondary_outline_quarantined_candidate"), "framework candidate escaped quarantine");
assert(mapping.frameworkMappings.every((item) => item.targetChapterIds.length === 0 && item.priorityEngineEligible === false), "framework candidate was activated");

const allMappings = [...mapping.legacyLessonMappings, ...mapping.overlayMappings, ...mapping.frameworkMappings];
const allSourceIds = allMappings.map((item) => item.legacyId);
assert(new Set(allSourceIds).size === allSourceIds.length, "duplicate source IDs across mapping classes");
for (const target of [
  ...exact.flatMap((item) => item.targetChapterIds),
  ...mapping.overlayMappings.map((item) => item.targetChapterId).filter(Boolean),
  ...mapping.frameworkMappings.flatMap((item) => item.candidateTargetChapterIds)
]) assert(targetIds.has(target), `mapping target missing from registry: ${target}`);

const requiredSidecars = ["formulas", "exercises", "applications", "simulations", "tests"];
for (const id of requiredSidecars) {
  const gap = mapping.sidecarSourceGaps.find((item) => item.id === id);
  assert(gap?.actualPrimaryCount === 0, `required sidecar gap missing: ${id}`);
  assert(gap.migrationDisposition === "create_additive_roadmap_v2_sidecar_never_backfill_or_claim_reuse", `unsafe sidecar disposition: ${id}`);
}
const tests = mapping.sidecarSourceGaps.find((item) => item.id === "tests");
assert(tests.topLevelArrayCounts.questions === 0, "tests source is not recorded as a zero-question shell");

const confirmedTargets = new Set([
  ...exact.flatMap((item) => item.targetChapterIds),
  ...mapping.overlayMappings.map((item) => item.targetChapterId).filter(Boolean)
]);
const expectedNewTargets = chapters.filter((item) => !confirmedTargets.has(item.id)).map((item) => item.id);
assert(mapping.newTargetNodes.length === 82, "new target node count drift");
assert(JSON.stringify(mapping.newTargetNodes.map((item) => item.targetChapterId)) === JSON.stringify(expectedNewTargets), "new target node inventory drift");

const validation = mapping.validation;
assert(validation.legacyLessonsInventoried === 347 && validation.legacyLessonIdsUnique === 347, "legacy validation counts drift");
assert(validation.exactLegacyLessonMappingsVerified === 5 && validation.preservedLegacyLessonsUnmapped === 342, "mapping partition drift");
assert(validation.overlayRecordsInventoried === 18 && validation.overlayRecordsChapterVerified === 18, "overlay validation drift");
assert(validation.frameworkChaptersInventoried === 21 && validation.frameworkSubLessonsInventoried === 172, "framework validation drift");
assert(validation.confirmedMissingTargets.length === 0 && validation.candidateMissingTargets.length === 0, "missing mapping target remains");
assert(validation.duplicateSourceIds.length === 0 && validation.missingSidecarGapRecords.length === 0, "mapping coverage blocker remains");
assert(validation.priorityEngineEligibleLegacyRecords === 0 && validation.inPlaceLegacyMutations === 0, "activation/mutation boundary crossed");
assert(validation.mappingCompleteAsInventory === true && validation.semanticMappingComplete === false, "contract-only completeness semantics drift");
assert(validation.result === "PASS_CONTRACT_ONLY", "mapping validation is not PASS_CONTRACT_ONLY");

for (const entry of Object.values(contract.immutableBaseline.inventories)) {
  assert(entry.sha256 === sha256(entry.path), `immutable inventory hash mismatch: ${entry.path}`);
}
assert(contract.targetArtifacts.registrySha256 === sha256(paths.registry), "contract registry hash mismatch");
assert(contract.targetArtifacts.graphSha256 === sha256(paths.graph), "contract graph hash mismatch");
assert(contract.targetArtifacts.mappingSha256 === sha256(paths.mapping), "contract mapping hash mismatch");
assert(contract.gates.contractGate.status === "PASS", "contract gate is not PASS");
assert(contract.gates.runtimeActivationGate.status === "BLOCKED_BY_DESIGN", "runtime activation gate is not blocked");
assert(contract.acceptance.step === 76 && contract.acceptance.result === "PASS_CONTRACT_ONLY", "Step 76 acceptance drift");
assert(contract.acceptance.sourceMutations === 0 && contract.acceptance.runtimeModified === false, "source/runtime mutation recorded");
assert(contract.acceptance.priorityEngineActivated === false, "Priority Engine activated during contract round");
assert(report.contract.sha256 === sha256(paths.contract) && report.mapping.sha256 === sha256(paths.mapping), "migration report hash drift");
assert(report.summary.result === "PASS_CONTRACT_ONLY", "migration report is not PASS_CONTRACT_ONLY");

const validationReport = {
  schema: "BAUMAN_ROADMAP_V2_VALIDATION_REPORT_V2",
  generatedAt: "2026-08-10T21:00:00+07:00",
  files: Object.fromEntries(Object.entries(paths).filter(([id]) => id !== "report").map(([id, file]) => [
    id,
    { path: file, sha256: sha256(file) }
  ])),
  steps: {
    baselineInventory: { step: 73, result: baseline.step.status },
    registry: { step: 74, result: registry.acceptance.result },
    prerequisiteGraph: { step: 75, result: graph.acceptance.result },
    migrationContract: { step: 76, result: contract.acceptance.result }
  },
  sourceArchitecture: {
    authoritativeLegacyLessons: 347,
    exactLegacyMappings: exact.length,
    theoryOverlayRecords: mapping.overlayMappings.length,
    quarantinedFrameworkChapters: mapping.frameworkMappings.length,
    quarantinedFrameworkSubLessons: validation.frameworkSubLessonsInventoried,
    semanticMappingComplete: false,
    priorityEngineEligibleRecords: 0,
    sourceMutations: 0,
    runtimeModified: false
  },
  summary: { checks: 4, passed: 4, failed: 0, result: "PASS_CONTRACT_ONLY" }
};
fs.writeFileSync("roadmap_v2/reports/validation-l19.json", JSON.stringify(validationReport, null, 2) + "\n", "utf8");

console.log(JSON.stringify({
  step: 76,
  result: "PASS_CONTRACT_ONLY",
  legacyLessonsInventoried: mappedLegacyIds.length,
  exactLegacyMappings: exact.length,
  preservedUnmappedLegacy: unmapped.length,
  overlayRecords: mapping.overlayMappings.length,
  frameworkChapters: mapping.frameworkMappings.length,
  frameworkSubLessons: validation.frameworkSubLessonsInventoried,
  sidecarGaps: mapping.sidecarSourceGaps.length,
  priorityEngineEligibleRecords: validation.priorityEngineEligibleLegacyRecords,
  sourceMutations: contract.acceptance.sourceMutations,
  runtimeModified: contract.acceptance.runtimeModified
}, null, 2));
