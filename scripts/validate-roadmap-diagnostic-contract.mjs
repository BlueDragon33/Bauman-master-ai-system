import fs from "node:fs";
import { loadRoadmapConsumer } from "../roadmap_v2/consumer.mjs";

function read(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const contract = read("roadmap_v2/diagnostic/diagnostic-contract.json");
const schema = read("roadmap_v2/diagnostic/diagnostic-contract.schema.json");
const itemBankSchema = read("roadmap_v2/diagnostic/item-bank.schema.json");
const attemptSchema = read("roadmap_v2/diagnostic/attempt.schema.json");
const consumer = loadRoadmapConsumer();

assert(contract.schema === "BAUMAN_ROADMAP_V2_DIAGNOSTIC_CONTRACT_V1", "Invalid diagnostic contract schema");
assert(schema.$id === contract.schema, "Diagnostic contract/schema identity mismatch");
assert(itemBankSchema.$id === contract.itemBankGate.schema, "Item bank schema identity mismatch");
assert(attemptSchema.$id === contract.attemptGate.schema, "Attempt schema identity mismatch");
assert(contract.mode.access === "read_only" && contract.mode.failClosed === true, "Diagnostic contract is not fail-closed read-only");
assert(contract.mode.productionIntegration === "disconnected", "Diagnostic contract is not production-disconnected");

for (const capability of contract.upstream.requiredConsumerCapabilities) {
  assert(consumer.getCapability(capability) === true, `Required consumer capability is disabled: ${capability}`);
}
for (const capability of contract.upstream.forbiddenConsumerCapabilities) {
  assert(consumer.getCapability(capability) === false, `Forbidden consumer capability is enabled: ${capability}`);
}

const distributionTotal = Object.values(contract.assessmentPolicy.difficultyDistribution).reduce((sum, count) => sum + count, 0);
assert(distributionTotal === contract.assessmentPolicy.requiredItemCount, "Diagnostic difficulty distribution does not total required item count");
assert(contract.assessmentPolicy.requiredItemCount === 20, "Diagnostic policy must use 20 items");
assert(contract.assessmentPolicy.passPercent === 80, "Diagnostic pass threshold drift");
assert(contract.assessmentPolicy.criticalItemFloorPercent === 70, "Diagnostic critical floor drift");
assert(contract.assessmentPolicy.requiresCriticalItems === true, "Diagnostic policy must require critical items");

assert(contract.statusSemantics.pass === "existing_competency_verified", "Diagnostic pass semantic drift");
assert(contract.statusSemantics.forbiddenOutcome === "master_ready", "Master-ready forbidden outcome is missing");
assert(contract.statusSemantics.pass !== contract.statusSemantics.forbiddenOutcome, "Diagnostic pass cannot equal Master-ready");
assert(contract.acceptance.existingCompetencyDistinctFromMasterReady === true, "Existing Competency/Master-ready boundary is not explicit");
assert(contract.acceptance.unreviewedGenerationForbidden === true, "Unreviewed generated items are not forbidden");
assert(contract.acceptance.masteryPersistenceEnabled === false, "Diagnostic prematurely enables mastery persistence");
assert(contract.acceptance.runtimeActivationAllowed === false, "Diagnostic prematurely enables runtime activation");

const unsafeEnabled = ["masteryEvidenceWrite", "priorityEngineWrite", "schedulerWrite", "runtimeActivation"]
  .filter((id) => contract.capabilities[id] !== false);
assert(unsafeEnabled.length === 0, `Unsafe diagnostic capabilities enabled: ${unsafeEnabled.join(", ")}`);

console.log(JSON.stringify({
  status: "PASS_B89_DIAGNOSTIC_CONTRACT",
  policyId: contract.assessmentPolicy.id,
  requiredItems: contract.assessmentPolicy.requiredItemCount,
  difficultyDistribution: contract.assessmentPolicy.difficultyDistribution,
  passPercent: contract.assessmentPolicy.passPercent,
  criticalFloorPercent: contract.assessmentPolicy.criticalItemFloorPercent,
  passOutcome: contract.statusSemantics.pass,
  forbiddenOutcome: contract.statusSemantics.forbiddenOutcome,
  masteryPersistenceEnabled: false,
  runtimeActivationAllowed: false
}));
