import fs from "node:fs";
import { loadRoadmapConsumer } from "../roadmap_v2/consumer.mjs";
import { loadRoadmapDiagnostic } from "../roadmap_v2/diagnostic.mjs";

function read(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const contract = read("roadmap_v2/mastery/mastery-contract.json");
const contractSchema = read("roadmap_v2/mastery/mastery-contract.schema.json");
const eventSchema = read("roadmap_v2/mastery/evidence-event.schema.json");
const snapshotSchema = read("roadmap_v2/mastery/mastery-snapshot.schema.json");
const consumer = loadRoadmapConsumer();
const diagnostic = loadRoadmapDiagnostic();
const registryGate = consumer.sidecar.registry.globalMasterReadyGate;

assert(contract.schema === "BAUMAN_ROADMAP_V2_MASTERY_CONTRACT_V1", "Invalid mastery contract schema");
assert(contractSchema.$id === contract.schema, "Mastery contract/schema identity mismatch");
assert(eventSchema.$id === "BAUMAN_ROADMAP_V2_EVIDENCE_EVENT_V1", "Evidence event schema identity mismatch");
assert(snapshotSchema.$id === "BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1", "Mastery snapshot schema identity mismatch");
assert(consumer.bridge.schema === contract.upstreamSchemas.consumerManifest, "Mastery/consumer schema mismatch");
assert(diagnostic.manifest.schema === contract.upstreamSchemas.diagnosticManifest, "Mastery/diagnostic schema mismatch");

assert(JSON.stringify(contract.knowledgeStates) === JSON.stringify(consumer.sidecar.registry.knowledgeStates), "Knowledge states drift from registry");
assert(contract.thresholds.chapterAssessmentPercent === registryGate.chapterAssessmentPercent, "Assessment threshold drift");
assert(contract.thresholds.criticalPrerequisiteFloorPercent === registryGate.criticalPrerequisiteFloorPercent, "Critical floor drift");
assert(contract.thresholds.labExplanationRequired === registryGate.labExplanationRequired, "Lab explanation gate drift");
assert(contract.thresholds.projectRubricMinimumPerDimension === registryGate.projectRubricMinimumPerDimension, "Project rubric threshold drift");
assert(JSON.stringify(contract.thresholds.projectRubricDimensions) === JSON.stringify(registryGate.projectRubricDimensions), "Project rubric dimensions drift");
assert(contract.thresholds.retentionWindowDays.minimum === registryGate.retentionWindowDays[0], "Retention minimum drift");
assert(contract.thresholds.retentionWindowDays.maximum === registryGate.retentionWindowDays[1], "Retention maximum drift");
assert(contract.thresholds.retentionPercent === registryGate.retentionPercent, "Retention threshold drift");
assert(contract.thresholds.russianTechnicalTermsInGD2GD3.minimum === registryGate.russianTechnicalTermsRequiredInGD2GD3[0], "Russian term minimum drift");
assert(contract.thresholds.russianTechnicalTermsInGD2GD3.maximum === registryGate.russianTechnicalTermsRequiredInGD2GD3[1], "Russian term maximum drift");

assert(contract.diagnosticBoundary.passingStatus === diagnostic.contract.statusSemantics.pass, "Diagnostic passing status drift");
assert(contract.diagnosticBoundary.passingDiagnosticSatisfiesChapterAssessment === false, "Diagnostic pass prematurely satisfies assessment");
assert(contract.diagnosticBoundary.passingDiagnosticGrantsMasterReady === false, "Diagnostic pass prematurely grants Master-ready");
assert(contract.acceptance.existingCompetencyDistinctFromMasterReady === true, "Existing Competency/Master-ready boundary missing");
assert(contract.mode.appendOnlyEvents === true, "Evidence events are not append-only");
assert(contract.mode.persistentStoreEnabled === false, "Mastery persistence is prematurely enabled");
assert(contract.acceptance.priorityEngineEnabled === false, "Priority Engine is prematurely enabled");
assert(contract.acceptance.runtimeActivationAllowed === false, "Runtime activation is prematurely enabled");
const graphEdgeTypes = [...new Set(consumer.sidecar.graph.prerequisiteEdges.map((edge) => edge.type))].sort();
assert(graphEdgeTypes.every((type) => contract.edgeTypePolicy[type]), `Mastery contract has no policy for graph edge types: ${graphEdgeTypes.filter((type) => !contract.edgeTypePolicy[type]).join(", ")}`);

const unsafe = ["persistentStoreWrite", "priorityEngineWrite", "schedulerWrite", "runtimeActivation"]
  .filter((id) => contract.capabilities[id] !== false);
assert(unsafe.length === 0, `Unsafe mastery capabilities enabled: ${unsafe.join(", ")}`);

console.log(JSON.stringify({
  status: "PASS_B93_MASTERY_CONTRACT",
  knowledgeStates: contract.knowledgeStates.length,
  evidenceTypes: contract.evidenceTypes.length,
  assessmentPercent: contract.thresholds.chapterAssessmentPercent,
  criticalFloorPercent: contract.thresholds.criticalPrerequisiteFloorPercent,
  retentionPercent: contract.thresholds.retentionPercent,
  diagnosticPassOutcome: contract.diagnosticBoundary.passingKnowledgeState,
  diagnosticGrantsMasterReady: false,
  persistentStoreEnabled: false,
  priorityEngineEnabled: false
}));
