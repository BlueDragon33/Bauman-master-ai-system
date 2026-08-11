import fs from "node:fs";
import { loadRoadmapConsumer } from "../roadmap_v2/consumer.mjs";
import { loadRoadmapMastery } from "../roadmap_v2/mastery.mjs";
import { loadRoadmapScheduler } from "../roadmap_v2/scheduler.mjs";

function read(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const contract = read("roadmap_v2/readiness/readiness-contract.json");
const contractSchema = read("roadmap_v2/readiness/readiness-contract.schema.json");
const requestSchema = read("roadmap_v2/readiness/readiness-request.schema.json");
const resultSchema = read("roadmap_v2/readiness/readiness-result.schema.json");
const consumer = loadRoadmapConsumer();
const mastery = loadRoadmapMastery();
const scheduler = loadRoadmapScheduler();

assert(contract.schema === "BAUMAN_ROADMAP_V2_READINESS_CONTRACT_V1", "Invalid Readiness contract schema");
assert(contractSchema.$id === contract.schema, "Readiness contract/schema identity mismatch");
assert(requestSchema.$id === "BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1", "Readiness request schema identity mismatch");
assert(resultSchema.$id === "BAUMAN_ROADMAP_V2_READINESS_RESULT_V1", "Readiness result schema identity mismatch");
assert(consumer.bridge.schema === contract.upstreamSchemas.consumerManifest, "Readiness/consumer schema mismatch");
assert(mastery.manifest.schema === contract.upstreamSchemas.masteryManifest, "Readiness/mastery schema mismatch");
assert(scheduler.manifest.schema === contract.upstreamSchemas.schedulerManifest, "Readiness/Scheduler schema mismatch");
assert(contract.upstreamSchemas.masterySnapshot === "BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1", "Readiness mastery snapshot schema drift");
assert(contract.upstreamSchemas.schedulerRequest === "BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1", "Readiness Scheduler request schema drift");
assert(contract.upstreamSchemas.schedulerResult === "BAUMAN_ROADMAP_V2_SCHEDULER_RESULT_V1", "Readiness Scheduler result schema drift");

assert(contract.statusPolicy.red.code === "blocked_or_unknown", "Readiness red semantics drift");
assert(contract.statusPolicy.yellow.code === "prerequisite_ready_not_master_ready", "Readiness yellow semantics drift");
assert(contract.statusPolicy.green.code === "master_ready", "Readiness green semantics drift");
assert(contract.targetPolicy.missingSnapshotPolicy === "red_unknown", "Missing readiness evidence does not fail closed");
assert(contract.targetPolicy.unverifiedMasterReadyClaimPolicy === "red_unknown", "Unverified Master-ready claim does not fail closed");
assert(contract.targetPolicy.recommendedAndContextualEdgesBlock === false && mastery.contract.prerequisiteGate.recommendedEdgesDoNotBlock === true, "Recommended edge readiness policy drift");
assert(contract.externalGatePolicy.verifiedSourceRequired === true && contract.externalGatePolicy.missingGateDefaultsToSatisfied === false, "External gate readiness policy drift");
assert(contract.overallPolicy.emptyFocusSetAllowed === false && contract.overallPolicy.manualOverrideAllowed === false, "Overall readiness policy permits unsafe input");
assert(contract.acceptance?.result === "PASS_CONTRACT_ONLY" && contract.acceptance?.step === 105, "Readiness B105 acceptance boundary is incomplete");

const unsafe = ["persistentStoreWrite", "dashboardUiRender", "runtimeActivation", "notificationWrite"]
  .filter((id) => contract.capabilities[id] !== false);
assert(unsafe.length === 0, `Unsafe Readiness capabilities enabled: ${unsafe.join(", ")}`);

console.log(JSON.stringify({
  status: "PASS_B105_READINESS_MODEL_CONTRACT",
  colors: Object.keys(contract.statusPolicy),
  missingSnapshotPolicy: contract.targetPolicy.missingSnapshotPolicy,
  masterReadyRequiredForGreen: true,
  passedMasterReadyGateRequiredForGreen: true,
  externalGatesVerified: true,
  dashboardConnected: false,
  runtimeActivationAllowed: false
}));
