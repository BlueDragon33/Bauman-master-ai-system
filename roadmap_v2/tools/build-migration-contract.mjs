import fs from "node:fs";
import crypto from "node:crypto";

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const paths = {
  registry: "roadmap_v2/registry/roadmap-v2.registry.json",
  graph: "roadmap_v2/graph/prerequisite-graph.json",
  baseline: "roadmap_v2/baseline/math-main-e383912-inventory.json",
  physical: "roadmap_v2/baseline/math-physical-source-inventory.json",
  legacyLessons: "roadmap_v2/baseline/math-legacy-lessons-inventory.json",
  framework: "roadmap_v2/baseline/math-theory-framework-inventory.json",
  mapping: "roadmap_v2/migration/legacy-to-roadmap-v2.mapping.json",
  contract: "roadmap_v2/migration/migration-contract.json",
  report: "roadmap_v2/reports/migration-l19.json",
  acceptance: "roadmap_v2/reports/LUOT_19_ACCEPTANCE.md"
};

const registry = readJson(paths.registry);
const graph = readJson(paths.graph);
const baseline = readJson(paths.baseline);
const physical = readJson(paths.physical);
const legacy = readJson(paths.legacyLessons);
const framework = readJson(paths.framework);
const targetChapters = registry.courses.flatMap((course) =>
  course.levels.flatMap((level) => level.chapters.map((chapter) => ({ ...chapter, courseId: course.id })))
);
const targetIds = new Set(targetChapters.map((item) => item.id));

assert(baseline.step.status.startsWith("PASS_"), "Step 73 baseline is not PASS");
assert(registry.acceptance?.step === 74 && registry.acceptance?.result === "PASS", "Step 74 registry is not PASS");
assert(graph.acceptance?.step === 75 && graph.acceptance?.result === "PASS", "Step 75 graph is not PASS");
assert(graph.source.registrySha256 === sha256(paths.registry), "graph/registry fingerprint mismatch");
assert(legacy.acceptance.result === "PASS" && legacy.counts.lessons === 347, "legacy lesson inventory is incomplete");
assert(framework.acceptance.result === "PASS" && framework.counts.chapters === 21, "framework inventory is incomplete");
assert(physical.acceptance.result === "PASS", "physical source inventory is not PASS");

const verifiedCompositeById = new Map(legacy.roadmapV2Composite.lessons.map((item) => [item.id, item]));
const legacyLessonMappings = legacy.contentGroups.flatMap((group) => {
  const prefix = group.firstLessonId.replace(/L\d{2}$/, "");
  return Array.from({ length: group.lessonCount }, (_, index) => {
    const legacyId = `${prefix}L${String(index + 1).padStart(2, "0")}`;
    const exact = verifiedCompositeById.get(legacyId);
    return {
      sourceType: "legacy_math_lesson",
      legacyId,
      legacyChapterId: group.chapterId,
      sourceChapterNo: group.sourceChapterNo,
      legacyTitle: exact?.title || null,
      slideCount: 16,
      targetChapterIds: exact ? [legacy.roadmapV2Composite.logicalChapterId] : [],
      targetLessonIds: [],
      mappingStatus: exact ? "verified_exact_lesson_to_logical_chapter" : "preserved_unmapped_requires_semantic_review",
      preserveLegacyId: true,
      inPlaceMutationAllowed: false,
      priorityEngineEligible: false,
      contentReadiness: {
        theorySlides: "verified_16",
        additiveSidecars: exact ? "required_missing" : "not_assessed"
      },
      activationBlocker: exact
        ? "Formula/exercise/simulation/test sidecars and integration regression gates are not complete."
        : "No target is asserted without lesson-level semantic review."
    };
  });
});

const overlayChapterTargets = {
  "MATH-VN-C01-vector_trong_khong_gian_": "MATH-L1-C03",
  "MATH-VN-C02-ma_tran_va_phep_bien_oi_": "MATH-L1-C03",
  "MATH-VN-C03-giai_tich_dao_ham_gradient": "MATH-L1-C04"
};
const overlayMappings = Object.entries(baseline.durableTheoryContent.distribution).flatMap(([legacyChapterId, stats]) =>
  stats.lessonIds.map((legacyId) => ({
    sourceType: "theory_runtime_overlay_record",
    legacyId,
    legacyChapterId,
    targetChapterId: overlayChapterTargets[legacyChapterId] || null,
    targetLessonId: null,
    mappingStatus: overlayChapterTargets[legacyChapterId]
      ? "chapter_verified_lesson_granularity_pending"
      : "unmatched_quarantined",
    preserveLegacyId: true,
    inPlaceMutationAllowed: false,
    priorityEngineEligible: false,
    activationBlocker: "Roadmap V2 has four logical lessons per chapter while the overlay has six physical records; exact many-to-many lesson mapping requires the Math integration gate."
  }))
);

const frameworkCandidateTargets = {
  m_p01: ["MATH-L1-C03"],
  m_p02: ["MATH-L1-C03"],
  m_p03: ["MATH-L1-C04"],
  m_p04: ["MATH-L2-C05"],
  m_p05: ["MATH-L2-C05"],
  m_p06: ["MATH-L2-C06"],
  m_p07: ["MATH-L2-C07"],
  m_p08: ["MATH-L3-C10"],
  m_s01: ["RU-R2-C06"],
  m_s02: ["RU-R2-C06", "MATH-L1-C03"],
  m_s03: ["RU-R2-C06", "MATH-L2-C05", "MATH-L2-C06"],
  m_s04: ["RU-R2-C06", "MATH-L2-C07"],
  m_s05: ["RU-R2-C06"],
  m_m101: ["MATH-L2-C07", "ML-L2-C04"],
  m_m102: ["MATH-L2-C07", "ML-L2-C04"],
  m_m103: ["ML-L2-C04"],
  m_m104: ["MATH-L2-C07", "ML-L2-C04"],
  m_m301: ["MATH-L3-C10", "ML-L2-C05"],
  m_m302: ["MATH-L3-C10", "ML-L2-C05"],
  m_m303: ["MATH-L3-C10", "ML-L2-C05"],
  m_m304: ["MATH-L3-C10", "ML-L2-C05"]
};
const frameworkMappings = framework.chapters.map((source) => ({
  sourceType: "secondary_theory_framework_chapter",
  legacyId: source.id,
  legacyTitle: source.title,
  legacyChapterNumber: source.chapterNumber,
  legacySubLessonIds: source.subLessonIds,
  candidateTargetChapterIds: frameworkCandidateTargets[source.id] || [],
  targetChapterIds: [],
  mappingStatus: "secondary_outline_quarantined_candidate",
  confidence: "candidate_only",
  sourceContentStatus: source.contentStatuses,
  preserveLegacyIds: true,
  inPlaceMutationAllowed: false,
  priorityEngineEligible: false,
  activationBlocker: "theory-framework is an outline/checkpoint source, not the authoritative 347-lesson physical source; candidates require explicit semantic review."
}));

const sidecarIds = new Set([
  "formulas", "exercises", "applications", "simulations", "professor_qa",
  "question_bank", "test_blueprints", "review_packs", "tests", "content-index",
  "knowledge-index", "mastery-map", "mindmap", "concept-map", "chapter_lectures"
]);
const sidecarSourceGaps = baseline.externalDataSources
  .filter((item) => sidecarIds.has(item.id) && item.actualPrimaryCount === 0)
  .map((item) => ({
    id: item.id,
    path: item.path,
    gitBlobSha: item.gitBlobSha,
    actualPrimaryCount: item.actualPrimaryCount,
    topLevelArrayCounts: item.topLevelArrayCounts,
    sourceStatus: item.status,
    migrationDisposition: "create_additive_roadmap_v2_sidecar_never_backfill_or_claim_reuse"
  }));

const confirmedMappedTargetIds = new Set([
  ...legacyLessonMappings.flatMap((item) => item.targetChapterIds),
  ...overlayMappings.map((item) => item.targetChapterId).filter(Boolean)
]);
const newTargetNodes = targetChapters
  .filter((item) => !confirmedMappedTargetIds.has(item.id))
  .map((item) => ({
    targetChapterId: item.id,
    courseId: item.courseId,
    deliveryMode: item.deliveryMode,
    disposition: item.deliveryMode === "dynamic" ? "dynamic_generation" : "new_content_diagnostic_or_future_review",
    legacyMappingRequired: false
  }));

const exactLegacyMappings = legacyLessonMappings.filter((item) => item.mappingStatus === "verified_exact_lesson_to_logical_chapter");
const preservedUnmappedLegacy = legacyLessonMappings.filter((item) => item.mappingStatus === "preserved_unmapped_requires_semantic_review");
const confirmedTargetIds = [
  ...exactLegacyMappings.flatMap((item) => item.targetChapterIds),
  ...overlayMappings.map((item) => item.targetChapterId).filter(Boolean)
];
const confirmedMissingTargets = [...new Set(confirmedTargetIds.filter((id) => !targetIds.has(id)))];
const candidateMissingTargets = [...new Set(frameworkMappings.flatMap((item) => item.candidateTargetChapterIds).filter((id) => !targetIds.has(id)))];
const sourceIds = [
  ...legacyLessonMappings.map((item) => item.legacyId),
  ...overlayMappings.map((item) => item.legacyId),
  ...frameworkMappings.map((item) => item.legacyId)
];
const duplicateSourceIds = sourceIds.filter((id, index) => sourceIds.indexOf(id) !== index);
const registryC07 = targetChapters.find((item) => item.id === "MATH-L2-C07");
const registryC07Refs = registryC07.legacyBinding.physicalLessonCandidates.map((item) => item.id);
const inventoryC07Refs = legacy.roadmapV2Composite.lessons.map((item) => item.id);
const requiredSidecarGaps = ["formulas", "exercises", "applications", "simulations", "tests"];
const missingSidecarGapRecords = requiredSidecarGaps.filter((id) => !sidecarSourceGaps.some((item) => item.id === id));

const validation = {
  legacyLessonsInventoried: legacyLessonMappings.length,
  legacyLessonIdsUnique: new Set(legacyLessonMappings.map((item) => item.legacyId)).size,
  exactLegacyLessonMappingsVerified: exactLegacyMappings.length,
  preservedLegacyLessonsUnmapped: preservedUnmappedLegacy.length,
  overlayRecordsInventoried: overlayMappings.length,
  overlayRecordsChapterVerified: overlayMappings.filter((item) => item.targetChapterId).length,
  frameworkChaptersInventoried: frameworkMappings.length,
  frameworkSubLessonsInventoried: frameworkMappings.reduce((sum, item) => sum + item.legacySubLessonIds.length, 0),
  frameworkCandidatesQuarantined: frameworkMappings.filter((item) => item.mappingStatus === "secondary_outline_quarantined_candidate").length,
  sidecarSourceGaps: sidecarSourceGaps.length,
  newTargetNodes: newTargetNodes.length,
  confirmedMissingTargets,
  candidateMissingTargets,
  duplicateSourceIds: [...new Set(duplicateSourceIds)],
  c07RegistryRefsMatchInventory: JSON.stringify(registryC07Refs) === JSON.stringify(inventoryC07Refs),
  missingSidecarGapRecords,
  priorityEngineEligibleLegacyRecords: [
    ...legacyLessonMappings,
    ...overlayMappings,
    ...frameworkMappings
  ].filter((item) => item.priorityEngineEligible).length,
  inPlaceLegacyMutations: 0,
  mappingCompleteAsInventory: true,
  semanticMappingComplete: false,
  result: "PENDING"
};
validation.result = (
  validation.legacyLessonsInventoried === 347 &&
  validation.legacyLessonIdsUnique === 347 &&
  validation.exactLegacyLessonMappingsVerified === 5 &&
  validation.preservedLegacyLessonsUnmapped === 342 &&
  validation.overlayRecordsInventoried === 18 &&
  validation.overlayRecordsChapterVerified === 18 &&
  validation.frameworkChaptersInventoried === 21 &&
  validation.frameworkSubLessonsInventoried === 172 &&
  validation.frameworkCandidatesQuarantined === 21 &&
  validation.confirmedMissingTargets.length === 0 &&
  validation.candidateMissingTargets.length === 0 &&
  validation.duplicateSourceIds.length === 0 &&
  validation.c07RegistryRefsMatchInventory &&
  validation.missingSidecarGapRecords.length === 0 &&
  validation.priorityEngineEligibleLegacyRecords === 0 &&
  validation.inPlaceLegacyMutations === 0
) ? "PASS_CONTRACT_ONLY" : "FAIL";
assert(validation.result === "PASS_CONTRACT_ONLY", JSON.stringify(validation));

const mapping = {
  schema: "BAUMAN_ROADMAP_V2_LEGACY_MAPPING_V2",
  version: 2,
  generatedAt: "2026-08-10T21:00:00+07:00",
  source: {
    repository: baseline.repository.fullName,
    baselineCommit: baseline.repository.headCommit,
    baselineInventory: paths.baseline,
    physicalInventory: paths.physical,
    legacyLessonInventory: paths.legacyLessons,
    theoryFrameworkInventory: paths.framework
  },
  target: {
    registry: paths.registry,
    registrySha256: sha256(paths.registry),
    graph: paths.graph,
    graphSha256: sha256(paths.graph)
  },
  mappingRules: {
    preserveLegacyIds: true,
    addRoadmapV2NamespaceOnly: true,
    noInPlaceLegacyMutation: true,
    authoritativeLessonSource: "subjects/math/data/lessons.json",
    theoryFrameworkRole: "secondary_outline_candidates_only",
    unmatchedPolicy: "preserve_quarantine_and_report",
    ambiguousPolicy: "candidate_only_never_auto_activate",
    sidecarPolicy: "create_additive_sidecars_never_claim_nonexistent_reuse",
    priorityEnginePolicy: "blocked_until_exact_mapping_content_readiness_and_runtime_regression_pass"
  },
  legacyLessonMappings,
  overlayMappings,
  frameworkMappings,
  sidecarSourceGaps,
  newTargetNodes,
  validation
};
fs.writeFileSync(paths.mapping, JSON.stringify(mapping, null, 2) + "\n", "utf8");

const contract = {
  schema: "BAUMAN_ROADMAP_V2_MIGRATION_CONTRACT_V2",
  version: 2,
  generatedAt: "2026-08-10T21:00:00+07:00",
  scope: "Lượt 19 / Bước 76 — contract and inventory-complete mapping only; no runtime activation",
  immutableBaseline: {
    repository: baseline.repository.fullName,
    branch: baseline.repository.defaultBranch,
    commit: baseline.repository.headCommit,
    inventories: {
      canonical: { path: paths.baseline, sha256: sha256(paths.baseline) },
      physical: { path: paths.physical, sha256: sha256(paths.physical) },
      legacyLessons: { path: paths.legacyLessons, sha256: sha256(paths.legacyLessons) },
      theoryFramework: { path: paths.framework, sha256: sha256(paths.framework) }
    }
  },
  targetArtifacts: {
    registryPath: paths.registry,
    registrySha256: sha256(paths.registry),
    graphPath: paths.graph,
    graphSha256: sha256(paths.graph),
    mappingPath: paths.mapping,
    mappingSha256: sha256(paths.mapping)
  },
  invariants: [
    "Preserve all 347 physical lessons and all 18 theory overlay records at their existing IDs.",
    "No legacy object, title, formula, exercise, simulation, test, route or runtime asset may be renamed, deleted or rewritten by migration.",
    "Roadmap V2 metadata is additive and namespaced; physical legacy identity remains authoritative.",
    "theory-framework is a secondary outline/checkpoint source and never substitutes for lessons.json.",
    "Unmatched or ambiguous items remain quarantined and are never guessed or auto-activated.",
    "MATH-L2-C07 has exactly five minimum verified legacy refs across source chapters 4, 10 and 15; m_p07 remains a secondary candidate only.",
    "Empty standalone formula/exercise/application/simulation/test sources require new additive sidecars; nonexistent records cannot be described as reused.",
    "Priority Engine activation requires exact mapping, content-readiness and runtime/browser regression gates.",
    "E235 remains unchanged and E236/E237/E238 remain disabled."
  ],
  transactionProtocol: {
    phase1: "Read immutable baseline and verify every inventory fingerprint.",
    phase2: "Build an additive mapping without mutating any legacy/runtime source.",
    phase3: "Validate source coverage, target existence, ID uniqueness, quarantine state, graph consistency and sidecar gaps.",
    phase4: "Activate selected records only in a later integration round after content-readiness and runtime/browser tests.",
    abortConditions: [
      "baseline fingerprint drift",
      "source inventory coverage gap",
      "missing target node",
      "duplicate source ID",
      "unquarantined ambiguous mapping",
      "unreported standalone sidecar gap",
      "runtime regression"
    ],
    rollback: "Remove the additive Roadmap V2 overlay artifacts/branch; the physical baseline needs no rollback because it is never mutated."
  },
  gates: {
    contractGate: { status: "PASS", evidence: validation },
    runtimeActivationGate: {
      status: "BLOCKED_BY_DESIGN",
      earliestRound: 31,
      reason: "Dedicated Math integration must resolve selected lesson granularity, build sidecars and pass regression/browser tests."
    }
  },
  acceptance: {
    step: 76,
    baselinePinned: true,
    mappingCompleteAsInventory: true,
    semanticMappingComplete: false,
    ambiguityQuarantined: true,
    sourceMutations: 0,
    priorityEngineActivated: false,
    runtimeModified: false,
    result: "PASS_CONTRACT_ONLY"
  }
};
fs.writeFileSync(paths.contract, JSON.stringify(contract, null, 2) + "\n", "utf8");

const report = {
  schema: "BAUMAN_ROADMAP_V2_MIGRATION_REPORT_L19_V2",
  generatedAt: "2026-08-10T21:00:00+07:00",
  contract: { path: paths.contract, sha256: sha256(paths.contract) },
  mapping: { path: paths.mapping, sha256: sha256(paths.mapping) },
  summary: {
    baselineCommit: baseline.repository.headCommit,
    legacyLessonsInventoried: validation.legacyLessonsInventoried,
    exactLegacyLessonMappingsVerified: validation.exactLegacyLessonMappingsVerified,
    preservedLegacyLessonsUnmapped: validation.preservedLegacyLessonsUnmapped,
    overlayRecordsInventoried: validation.overlayRecordsInventoried,
    frameworkChaptersInventoried: validation.frameworkChaptersInventoried,
    frameworkSubLessonsInventoried: validation.frameworkSubLessonsInventoried,
    frameworkCandidatesQuarantined: validation.frameworkCandidatesQuarantined,
    sidecarSourceGaps: validation.sidecarSourceGaps,
    priorityEngineEligibleLegacyRecords: validation.priorityEngineEligibleLegacyRecords,
    sourceMutations: validation.inPlaceLegacyMutations,
    result: "PASS_CONTRACT_ONLY"
  },
  resolvedIssue: {
    issue: "Large GitHub blobs returned empty inline content through the connector, which initially made populated lessons/speaking/dialogue sources look empty.",
    resolution: "Decode immutable blobs by SHA. lessons.json contains 347 unique lessons/5,552 slides; theory_lecture_content contains 18 overlay records; standalone sidecar arrays remain genuinely empty and tests has zero questions.",
    consequence: "Migration preserves the 347 lessons and 18 overlays, treats theory-framework as secondary, maps only five verified MATH-L2-C07 refs, and quarantines every unverified semantic mapping."
  }
};
fs.writeFileSync(paths.report, JSON.stringify(report, null, 2) + "\n", "utf8");

const markdown = `# Lượt 19 — Bước 73–76 — Acceptance

Status: **PASS (CONTRACT ONLY; RUNTIME ACTIVATION BLOCKED)**

## Bước 73 — Baseline inventory

- Pinned baseline: \`BlueDragon33/Bauman-master-ai-system@${baseline.repository.headCommit}\`.
- Decoded and fingerprinted 347 unique legacy lessons with 5,552 slides plus 18 theory overlay records with 300 slides.
- Reconciled 40 source chapters versus 41 physical content groups: source chapter 4 is deliberately split into §1 and §2 groups.
- Inventoried 21 secondary theory-framework chapters / 172 sublessons without treating them as the authoritative lesson source.
- Verified standalone formula/exercise/application/simulation arrays are empty and tests contains zero questions.

## Bước 74 — Syllabus Registry

- 10 courses, 85 chapters, 304 numbered new lessons.
- 8 dynamic chapters and 1 legacy-preserve logical composite.
- MATH-L2-C07 contains five verified physical refs and records formula/exercise/simulation/test sidecar gaps.

## Bước 75 — Prerequisite Graph

- 450 nodes, 425 hierarchy edges and ${graph.validation.prerequisiteEdges} prerequisite edges.
- 85/85 prerequisite expressions resolved; missing refs, self refs, duplicate edges and cycles are all zero.

## Bước 76 — Migration Contract

- Inventory coverage: 347 legacy lessons, 18 overlays, 21 framework chapters / 172 sublessons.
- Exact verified lesson mappings: 5; preserved/unmapped legacy lessons: 342.
- Framework candidates remain quarantined; Priority Engine eligible records: 0.
- Legacy/runtime source mutations: 0; Priority Engine activation: false.
- Runtime/UI Math remains unchanged; E235 unchanged; E236/E237/E238 disabled.

## Next gate

Lượt 20 starts at Bước 77. It may validate schemas, versioning, overlay storage and baseline-drift detection, but it may not activate runtime mappings.
`;
fs.writeFileSync(paths.acceptance, markdown, "utf8");

console.log(JSON.stringify({
  mapping: validation,
  contract: contract.acceptance,
  report: report.summary,
  acceptancePath: paths.acceptance
}, null, 2));
