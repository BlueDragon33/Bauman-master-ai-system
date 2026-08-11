import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRoadmapSidecar } from "./loader.mjs";

const defaultBaseDir = path.dirname(fileURLToPath(import.meta.url));

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(file) {
  const bytes = fs.readFileSync(file);
  return { bytes, value: JSON.parse(bytes.toString("utf8")) };
}

function readPinnedJson(baseDir, descriptor, id) {
  assert(typeof descriptor?.path === "string" && descriptor.path.startsWith("consumer/"), `Invalid consumer path for ${id}`);
  const file = path.resolve(baseDir, descriptor.path);
  assert(file.startsWith(`${baseDir}${path.sep}`), `Consumer path escapes package: ${descriptor.path}`);
  assert(fs.existsSync(file), `Missing Roadmap consumer file: ${descriptor.path}`);
  const loaded = readJson(file);
  assert(loaded.bytes.length === descriptor.bytes, `Roadmap consumer byte count mismatch: ${descriptor.path}`);
  assert(sha256(loaded.bytes) === descriptor.sha256, `Roadmap consumer hash mismatch: ${descriptor.path}`);
  return loaded.value;
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}

function frozenCopy(value) {
  if (value === null || value === undefined) return value;
  return deepFreeze(structuredClone(value));
}

function reason(contract, ...ids) {
  return ids.map((id) => ({ id, message: contract.reasonCodes[id] }));
}

export function loadRoadmapConsumer(options = {}) {
  const baseDir = path.resolve(options.baseDir || defaultBaseDir);
  const bridgeManifestFile = path.join(baseDir, "consumer", "manifest.json");
  const bridgeLoaded = readJson(bridgeManifestFile);
  const bridge = bridgeLoaded.value;

  assert(bridge.schema === "BAUMAN_ROADMAP_V2_CONSUMER_MANIFEST_V1", "Unsupported Roadmap consumer manifest schema");
  assert(bridge.status === "PASS_B85_CONSUMER_CONTRACT", "Roadmap consumer contract is not B85 PASS");
  assert(bridge.mode === "read_only_consumer_bridge", "Roadmap consumer bridge is not read-only");
  assert(bridge.productionIntegration === "disconnected", "Roadmap consumer production boundary is not locked");

  const upstreamManifestFile = path.join(baseDir, "manifest.json");
  const upstreamManifest = readJson(upstreamManifestFile);
  assert(sha256(upstreamManifest.bytes) === bridge.upstream.sidecarManifestSha256, "Roadmap consumer upstream manifest hash mismatch");

  const contract = readPinnedJson(baseDir, bridge.files.consumerContract, "consumerContract");
  const schema = readPinnedJson(baseDir, bridge.files.consumerContractSchema, "consumerContractSchema");
  assert(contract.schema === "BAUMAN_ROADMAP_V2_CONSUMER_CONTRACT_V1", "Invalid Roadmap consumer contract");
  assert(schema.$id === contract.schema, "Roadmap consumer contract/schema identity mismatch");
  assert(contract.mode.access === "read_only" && contract.mode.failClosed === true, "Roadmap consumer is not fail-closed read-only");
  assert(contract.capabilities.runtimeActivation === false, "Roadmap consumer prematurely enables runtime activation");
  assert(contract.capabilities.priorityEngineRead === false && contract.capabilities.priorityEngineWrite === false, "Roadmap consumer prematurely enables Priority Engine access");

  const sidecar = loadRoadmapSidecar({ baseDir });
  assert(sidecar.manifest.schema === contract.upstreamSchemas.sidecarManifest, "Consumer/sidecar schema mismatch");
  assert(sidecar.registry.schema === contract.upstreamSchemas.registry, "Consumer/registry schema mismatch");
  assert(sidecar.graph.schema === contract.upstreamSchemas.prerequisiteGraph, "Consumer/graph schema mismatch");
  assert(sidecar.mapping.schema === contract.upstreamSchemas.legacyMapping, "Consumer/mapping schema mismatch");
  assert(sidecar.contract.schema === contract.upstreamSchemas.migrationContract, "Consumer/migration contract schema mismatch");
  assert(sidecar.manifest.baselineCommit === bridge.baselineCommit, "Consumer baseline commit drift");

  const chapters = sidecar.registry.courses.flatMap((course) => course.levels.flatMap((level) => level.chapters));
  const lessons = chapters.flatMap((chapter) => chapter.lessons);
  const chapterById = new Map(chapters.map((item) => [item.id, item]));
  const lessonById = new Map(lessons.map((item) => [item.id, item]));
  const legacyById = new Map(sidecar.mapping.legacyLessonMappings.map((item) => [item.legacyId, item]));
  const overlayById = new Map(sidecar.mapping.overlayMappings.map((item) => [item.legacyId, item]));
  const frameworkById = new Map(sidecar.mapping.frameworkMappings.map((item) => [item.legacyId, item]));

  assert(chapters.length === bridge.counts.chapters, "Consumer chapter count drift");
  assert(lessons.length === bridge.counts.numberedLessons, "Consumer lesson count drift");
  assert(legacyById.size === bridge.counts.legacyLessonsInventoried, "Consumer legacy inventory count drift");
  assert(sidecar.mapping.validation.priorityEngineEligibleLegacyRecords === 0, "Consumer contains prematurely eligible legacy records");
  assert(sidecar.graph.validation.cycleNodes.length === 0, "Consumer prerequisite graph contains a cycle");
  assert(sidecar.graph.validation.missingRefs?.length === 0 || sidecar.graph.validation.missingRefs === undefined, "Consumer prerequisite graph contains missing refs");

  for (const item of legacyById.values()) {
    assert(contract.states.legacyLesson[item.mappingStatus], `Unknown legacy eligibility state: ${item.mappingStatus}`);
    assert(item.priorityEngineEligible === false && item.inPlaceMutationAllowed === false, `Unsafe legacy mapping flags: ${item.legacyId}`);
    for (const targetId of item.targetChapterIds || []) assert(chapterById.has(targetId), `Missing legacy mapping target: ${targetId}`);
  }
  for (const item of overlayById.values()) {
    assert(contract.states.overlay[item.mappingStatus], `Unknown overlay eligibility state: ${item.mappingStatus}`);
    assert(item.priorityEngineEligible === false && item.inPlaceMutationAllowed === false, `Unsafe overlay flags: ${item.legacyId}`);
    if (item.targetChapterId) assert(chapterById.has(item.targetChapterId), `Missing overlay target: ${item.targetChapterId}`);
  }
  for (const item of frameworkById.values()) {
    assert(contract.states.framework[item.mappingStatus], `Unknown framework eligibility state: ${item.mappingStatus}`);
    assert(item.mappingStatus === "secondary_outline_quarantined_candidate", `Framework item escaped quarantine: ${item.legacyId}`);
    assert(item.priorityEngineEligible === false && item.inPlaceMutationAllowed === false, `Unsafe framework flags: ${item.legacyId}`);
    for (const targetId of item.candidateTargetChapterIds || []) assert(chapterById.has(targetId), `Missing framework candidate target: ${targetId}`);
  }

  const chapterEligibility = (chapter) => {
    const dynamic = chapter.deliveryMode === "dynamic";
    const legacyComposite = chapter.deliveryMode === "legacy_preserve";
    const state = contract.states.roadmapChapter[chapter.deliveryMode];
    assert(state, `Unknown chapter delivery mode: ${chapter.deliveryMode}`);
    return deepFreeze({
      sourceType: "roadmap_chapter",
      sourceId: chapter.id,
      state,
      contractReadable: true,
      provenanceReadable: true,
      diagnosticBlueprintEligible: !dynamic,
      diagnosticExecutionEligible: false,
      masteryEvidenceEligible: false,
      priorityEngineEligible: false,
      runtimeActivationEligible: false,
      reasonCodes: reason(
        contract,
        ...(dynamic ? ["DYNAMIC_INSTANCE_REQUIRED"] : ["BLUEPRINT_NOT_EXECUTABLE"]),
        ...(legacyComposite ? ["LEGACY_SIDECARS_MISSING"] : []),
        "MASTERY_STORE_ABSENT",
        "PRIORITY_ENGINE_NOT_IMPLEMENTED",
        "PRODUCTION_DISCONNECTED"
      )
    });
  };

  const lessonEligibility = (lesson) => deepFreeze({
    sourceType: "roadmap_lesson",
    sourceId: lesson.id,
    state: contract.states.roadmapLesson[lesson.deliveryMode],
    contractReadable: true,
    provenanceReadable: true,
    diagnosticBlueprintEligible: true,
    diagnosticExecutionEligible: false,
    masteryEvidenceEligible: false,
    priorityEngineEligible: false,
    runtimeActivationEligible: false,
    reasonCodes: reason(contract, "BLUEPRINT_NOT_EXECUTABLE", "MASTERY_STORE_ABSENT", "PRIORITY_ENGINE_NOT_IMPLEMENTED", "PRODUCTION_DISCONNECTED")
  });

  const legacyEligibility = (item) => {
    const verified = item.mappingStatus === "verified_exact_lesson_to_logical_chapter";
    return deepFreeze({
      sourceType: "legacy_math_lesson",
      sourceId: item.legacyId,
      state: contract.states.legacyLesson[item.mappingStatus],
      contractReadable: true,
      provenanceReadable: true,
      mappingReferenceEligible: verified,
      diagnosticBlueprintEligible: false,
      diagnosticExecutionEligible: false,
      masteryEvidenceEligible: false,
      priorityEngineEligible: false,
      runtimeActivationEligible: false,
      targetChapterIds: [...(item.targetChapterIds || [])],
      reasonCodes: reason(contract, verified ? "LEGACY_SIDECARS_MISSING" : "LEGACY_MAPPING_UNVERIFIED", "MASTERY_STORE_ABSENT", "PRIORITY_ENGINE_NOT_IMPLEMENTED", "PRODUCTION_DISCONNECTED")
    });
  };

  const overlayEligibility = (item) => deepFreeze({
    sourceType: "theory_runtime_overlay",
    sourceId: item.legacyId,
    state: contract.states.overlay[item.mappingStatus],
    contractReadable: true,
    provenanceReadable: true,
    mappingReferenceEligible: true,
    diagnosticBlueprintEligible: false,
    diagnosticExecutionEligible: false,
    masteryEvidenceEligible: false,
    priorityEngineEligible: false,
    runtimeActivationEligible: false,
    targetChapterIds: item.targetChapterId ? [item.targetChapterId] : [],
    reasonCodes: reason(contract, "LEGACY_MAPPING_UNVERIFIED", "MASTERY_STORE_ABSENT", "PRIORITY_ENGINE_NOT_IMPLEMENTED", "PRODUCTION_DISCONNECTED")
  });

  const frameworkEligibility = (item) => deepFreeze({
    sourceType: "theory_framework_outline",
    sourceId: item.legacyId,
    state: contract.states.framework[item.mappingStatus],
    contractReadable: true,
    provenanceReadable: true,
    mappingReferenceEligible: false,
    diagnosticBlueprintEligible: false,
    diagnosticExecutionEligible: false,
    masteryEvidenceEligible: false,
    priorityEngineEligible: false,
    runtimeActivationEligible: false,
    targetChapterIds: [],
    candidateTargetChapterIds: [...(item.candidateTargetChapterIds || [])],
    reasonCodes: reason(contract, "FRAMEWORK_OUTLINE_ONLY", "MASTERY_STORE_ABSENT", "PRIORITY_ENGINE_NOT_IMPLEMENTED", "PRODUCTION_DISCONNECTED")
  });

  const getEligibility = (id) => {
    if (chapterById.has(id)) return chapterEligibility(chapterById.get(id));
    if (lessonById.has(id)) return lessonEligibility(lessonById.get(id));
    if (legacyById.has(id)) return legacyEligibility(legacyById.get(id));
    if (overlayById.has(id)) return overlayEligibility(overlayById.get(id));
    if (frameworkById.has(id)) return frameworkEligibility(frameworkById.get(id));
    return null;
  };

  const getDiagnosticBlueprint = (id) => {
    const chapter = chapterById.get(id);
    if (chapter) {
      const eligibility = chapterEligibility(chapter);
      if (!eligibility.diagnosticBlueprintEligible) return null;
      return deepFreeze({
        sourceType: "roadmap_chapter",
        sourceId: chapter.id,
        title: chapter.title,
        deliveryMode: chapter.deliveryMode,
        prerequisiteRefs: [...(chapter.prerequisites?.refs || [])],
        assessmentContract: frozenCopy(chapter.learningContract?.assessment || null),
        masterReadyEvidenceContract: frozenCopy(chapter.learningContract?.masterReadyEvidence || null),
        executionReady: false,
        eligibility
      });
    }
    const lesson = lessonById.get(id);
    if (!lesson) return null;
    const eligibility = lessonEligibility(lesson);
    return deepFreeze({
      sourceType: "roadmap_lesson",
      sourceId: lesson.id,
      title: lesson.title,
      deliveryMode: lesson.deliveryMode,
      prerequisiteRefs: [...(lesson.prerequisites?.refs || [])],
      assessmentContract: frozenCopy(lesson.assessment || null),
      masterReadyEvidenceContract: frozenCopy(lesson.masterReadyEvidence || null),
      executionReady: false,
      eligibility
    });
  };

  const getChapterBundle = (id) => {
    const chapter = chapterById.get(id);
    if (!chapter) return null;
    return deepFreeze({
      chapter,
      prerequisites: sidecar.getPrerequisites(id),
      dependents: sidecar.getDependents(id),
      externalGates: sidecar.getExternalGates(id),
      provenance: sidecar.getMapping(id),
      eligibility: chapterEligibility(chapter),
      diagnosticBlueprint: getDiagnosticBlueprint(id)
    });
  };

  const listLegacyEligibility = () => deepFreeze([...legacyById.values()].map(legacyEligibility));
  const listOverlayEligibility = () => deepFreeze([...overlayById.values()].map(overlayEligibility));
  const listFrameworkEligibility = () => deepFreeze([...frameworkById.values()].map(frameworkEligibility));
  const listDiagnosticBlueprints = () => deepFreeze([
    ...chapters.filter((item) => item.deliveryMode !== "dynamic").map((item) => getDiagnosticBlueprint(item.id)),
    ...lessons.map((item) => getDiagnosticBlueprint(item.id))
  ]);

  const api = {
    bridge: deepFreeze(bridge),
    contract: deepFreeze(contract),
    sidecar,
    getCapability: (id) => Object.hasOwn(contract.capabilities, id) ? contract.capabilities[id] : null,
    getEligibility,
    getChapterBundle,
    getDiagnosticBlueprint,
    listDiagnosticBlueprints,
    listLegacyEligibility,
    listOverlayEligibility,
    listFrameworkEligibility
  };
  return Object.freeze(api);
}
