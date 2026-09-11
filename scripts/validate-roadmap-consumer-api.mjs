import { loadRoadmapConsumer } from "../roadmap_v2/consumer.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const consumer = loadRoadmapConsumer();
const legacy = consumer.listLegacyEligibility();
const overlays = consumer.listOverlayEligibility();
const framework = consumer.listFrameworkEligibility();
const blueprints = consumer.listDiagnosticBlueprints();
const chapterBlueprints = blueprints.filter((item) => item.sourceType === "roadmap_chapter");
const lessonBlueprints = blueprints.filter((item) => item.sourceType === "roadmap_lesson");

assert(consumer.getCapability("diagnosticBlueprintRead") === true, "Diagnostic blueprint read is not enabled");
assert(consumer.getCapability("diagnosticExecution") === false, "Diagnostic execution is prematurely enabled");
assert(consumer.getCapability("masteryEvidenceWrite") === false, "Mastery write is prematurely enabled");
assert(consumer.getCapability("priorityEngineRead") === false, "Priority Engine read is prematurely enabled");
assert(consumer.getCapability("runtimeActivation") === false, "Runtime activation is prematurely enabled");
assert(consumer.getCapability("unknown") === null, "Unknown capability must fail closed");

assert(legacy.length === 347, "Legacy eligibility inventory is incomplete");
assert(legacy.filter((item) => item.state === "VERIFIED_REFERENCE_ONLY").length === 5, "Verified legacy reference count drift");
assert(legacy.filter((item) => item.state === "QUARANTINED_UNMAPPED").length === 342, "Quarantined legacy count drift");
assert(legacy.every((item) => item.diagnosticExecutionEligible === false), "A legacy record is executable by Diagnostic");
assert(legacy.every((item) => item.priorityEngineEligible === false), "A legacy record is Priority Engine eligible");
assert(legacy.every((item) => item.runtimeActivationEligible === false), "A legacy record is runtime eligible");

assert(overlays.length === 18, "Overlay eligibility inventory is incomplete");
assert(overlays.every((item) => item.state === "VERIFIED_OVERLAY_REFERENCE_ONLY"), "Overlay state drift");
assert(framework.length === 21, "Framework eligibility inventory is incomplete");
assert(framework.every((item) => item.state === "QUARANTINED_OUTLINE"), "Framework outline escaped quarantine");

assert(chapterBlueprints.length === 77, "Static/legacy chapter blueprint count drift");
assert(lessonBlueprints.length === 304, "Lesson blueprint count drift");
assert(blueprints.every((item) => item.executionReady === false), "An L22 blueprint is marked executable");
assert(consumer.getDiagnosticBlueprint("CUR-L4-C01") === null, "Dynamic chapter produced a pre-instantiation blueprint");

const c07 = consumer.getChapterBundle("MATH-L2-C07");
assert(c07.provenance.authoritativeLegacyLessons.length === 5, "MATH-L2-C07 verified provenance count drift");
assert(c07.provenance.frameworkOutlineCandidates.some((item) => item.legacyId === "m_p07"), "MATH-L2-C07 framework quarantine evidence missing");
assert(c07.eligibility.state === "LEGACY_COMPOSITE_BLUEPRINT_ONLY", "MATH-L2-C07 eligibility state drift");
assert(c07.diagnosticBlueprint.executionReady === false, "MATH-L2-C07 is prematurely executable");

for (const edge of consumer.sidecar.graph.prerequisiteEdges) {
  assert(consumer.sidecar.hasNode(edge.from), `Missing prerequisite source node: ${edge.from}`);
  assert(consumer.sidecar.hasNode(edge.to), `Missing prerequisite target node: ${edge.to}`);
}
assert(consumer.sidecar.graph.validation.cycleNodes.length === 0, "Cross-chapter graph contains a cycle");

assert(Object.isFrozen(consumer), "Consumer API is mutable");
assert(Object.isFrozen(consumer.contract), "Consumer contract is mutable");
assert(Object.isFrozen(c07), "Chapter bundle is mutable");
assert(Object.isFrozen(legacy), "Legacy eligibility list is mutable");

console.log(JSON.stringify({
  status: "PASS_B86_READ_ONLY_CONSUMER_API",
  diagnosticBlueprints: blueprints.length,
  chapterBlueprints: chapterBlueprints.length,
  lessonBlueprints: lessonBlueprints.length,
  verifiedLegacyReferences: 5,
  quarantinedLegacyLessons: 342,
  quarantinedFrameworkOutlines: 21,
  priorityEngineEligibleLegacyRecords: 0,
  runtimeActivationEligibleRecords: 0
}));
