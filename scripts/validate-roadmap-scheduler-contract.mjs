import fs from "node:fs";
import { loadRoadmapConsumer } from "../roadmap_v2/consumer.mjs";
import { loadRoadmapPriority } from "../roadmap_v2/priority.mjs";

function read(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const contract = read("roadmap_v2/scheduler/scheduler-contract.json");
const contractSchema = read("roadmap_v2/scheduler/scheduler-contract.schema.json");
const requestSchema = read("roadmap_v2/scheduler/scheduler-request.schema.json");
const resultSchema = read("roadmap_v2/scheduler/scheduler-result.schema.json");
const consumer = loadRoadmapConsumer();
const priority = loadRoadmapPriority();
const phases = Object.fromEntries(consumer.sidecar.registry.program.phases.map((phase) => [phase.id, phase.mode]));

assert(contract.schema === "BAUMAN_ROADMAP_V2_SCHEDULER_CONTRACT_V1", "Invalid Scheduler contract schema");
assert(contractSchema.$id === contract.schema, "Scheduler contract/schema identity mismatch");
assert(requestSchema.$id === "BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1", "Scheduler request schema identity mismatch");
assert(resultSchema.$id === "BAUMAN_ROADMAP_V2_SCHEDULER_RESULT_V1", "Scheduler result schema identity mismatch");
assert(consumer.bridge.schema === contract.upstreamSchemas.consumerManifest, "Scheduler/consumer schema mismatch");
assert(priority.manifest.schema === contract.upstreamSchemas.priorityManifest, "Scheduler/Priority schema mismatch");
assert(contract.upstreamSchemas.priorityCandidate === "BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1", "Scheduler Priority candidate schema drift");
assert(contract.upstreamSchemas.priorityResult === "BAUMAN_ROADMAP_V2_PRIORITY_RESULT_V1", "Scheduler Priority result schema drift");

for (const [phaseId, mode] of Object.entries(phases)) {
  assert(contract.phasePolicies[phaseId]?.mode === mode, `Scheduler phase mode drift: ${phaseId}`);
}
assert(contract.phasePolicies.GD1.technicalSessionMinimumAdvisory === 2, "GD1 technical minimum advisory drift");
assert(contract.phasePolicies.GD1.technicalSessionMaximum === 3, "GD1 technical maximum drift");
assert(JSON.stringify(contract.phasePolicies.GD1.technicalRotationTracks) === JSON.stringify(["python", "database", "math"]), "GD1 rotation tracks drift");
assert(contract.phasePolicies.GD3.masterMode === true, "GD3 Master Mode is disabled");
assert(contract.phasePolicies.GD3.currentBaumanOverride === true, "Current Bauman override is disabled");
assert(contract.phasePolicies.GD3.previewWindowWeeks.minimum === 2 && contract.phasePolicies.GD3.previewWindowWeeks.maximum === 4, "Master Mode preview window drift");
assert(contract.phasePolicies.GD3.unrelatedStaticPolicy === "defer", "GD3 unrelated static policy drift");
assert(contract.priorityAdmission.recomputeFromPriorityCandidate === true && contract.priorityAdmission.acceptCallerSuppliedPriorityResult === false, "Scheduler accepts unverified Priority results");
assert(contract.priorityAdmission.reviewOnDemandRequiresExplicitRequest === true && contract.priorityAdmission.reviewOnDemandGrantsMasterReady === false, "Review-on-demand boundary drift");
assert(contract.bundlePolicy.technicalAndRussianTwinAtomic === true && contract.bundlePolicy.partialBundleAllowed === false, "Russian twin atomic bundle boundary drift");

const unsafe = ["calendarRead", "calendarWrite", "persistentStoreWrite", "runtimeActivation", "dynamicContentGenerate"]
  .filter((id) => contract.capabilities[id] !== false);
assert(unsafe.length === 0, `Unsafe Scheduler capabilities enabled: ${unsafe.join(", ")}`);
assert(contract.acceptance?.result === "PASS_CONTRACT_ONLY" && contract.acceptance?.step === 101, "Scheduler B101 acceptance boundary is incomplete");

console.log(JSON.stringify({
  status: "PASS_B101_SCHEDULER_MASTER_MODE_CONTRACT",
  phaseModes: phases,
  gd1TechnicalSessions: { minimumAdvisory: 2, maximum: 3 },
  masterModePreviewWeeks: contract.phasePolicies.GD3.previewWindowWeeks,
  currentBaumanOverride: true,
  calendarConnected: false,
  runtimeActivationAllowed: false
}));
