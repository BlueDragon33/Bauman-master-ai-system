import fs from "node:fs";
import { loadRoadmapConsumer } from "../roadmap_v2/consumer.mjs";
import { loadRoadmapMastery } from "../roadmap_v2/mastery.mjs";

function read(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const contract = read("roadmap_v2/priority/priority-contract.json");
const contractSchema = read("roadmap_v2/priority/priority-contract.schema.json");
const candidateSchema = read("roadmap_v2/priority/priority-candidate.schema.json");
const consumer = loadRoadmapConsumer();
const mastery = loadRoadmapMastery();
const registryPriority = consumer.sidecar.registry.priorityEngine;

assert(contract.schema === "BAUMAN_ROADMAP_V2_PRIORITY_CONTRACT_V1", "Invalid Priority contract schema");
assert(contractSchema.$id === contract.schema, "Priority contract/schema identity mismatch");
assert(candidateSchema.$id === "BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1", "Priority candidate schema identity mismatch");
assert(consumer.bridge.schema === contract.upstreamSchemas.consumerManifest, "Priority/consumer schema mismatch");
assert(mastery.manifest.schema === contract.upstreamSchemas.masteryManifest, "Priority/mastery schema mismatch");
assert(mastery.contract.upstreamSchemas.diagnosticResult && contract.upstreamSchemas.masterySnapshot === "BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1", "Priority mastery snapshot schema mismatch");

assert(contract.formula.expression === registryPriority.formula, "Priority formula expression drift");
assert(JSON.stringify(contract.formula.weights) === JSON.stringify(registryPriority.weights), "Priority weights drift");
const weightTotal = Object.values(contract.formula.weights).reduce((sum, value) => sum + value, 0);
assert(Math.abs(weightTotal - 1) < 1e-12, "Priority weights do not total 1");
assert(contract.criticalOverride.maximumWeeksUntilNeeded === 4, "Critical override week threshold drift");
assert(contract.criticalOverride.requiredKnowledgeState === "gap", "Critical override knowledge-state drift");
assert(contract.existingCompetencyRule.diagnosticPercentMinimum === 80, "Existing Competency diagnostic threshold drift");
assert(contract.existingCompetencyRule.retentionPercentMinimum === 75, "Existing Competency retention threshold drift");
assert(contract.existingCompetencyRule.disposition === "review_on_demand", "Existing Competency disposition drift");
assert(contract.existingCompetencyRule.grantsMasterReady === false, "Existing Competency grants Master-ready");
assert(contract.acceptance.registryFormulaExact === true && contract.acceptance.criticalOverrideExact === true, "Priority acceptance boundary is incomplete");

const states = new Set(consumer.sidecar.registry.knowledgeStates);
assert(Object.keys(contract.normalization.knowledgeGapByState).every((state) => states.has(state)), "Priority normalization contains unknown knowledge state");
assert([...states].every((state) => Object.hasOwn(contract.normalization.knowledgeGapByState, state)), "Priority normalization misses a knowledge state");

const unsafe = ["persistentStoreWrite", "schedulerWrite", "runtimeActivation"]
  .filter((id) => contract.capabilities[id] !== false);
assert(unsafe.length === 0, `Unsafe Priority capabilities enabled: ${unsafe.join(", ")}`);

console.log(JSON.stringify({
  status: "PASS_B97_PRIORITY_CONTRACT",
  formula: contract.formula.expression,
  weights: contract.formula.weights,
  weightTotal,
  criticalMaximumWeeks: contract.criticalOverride.maximumWeeksUntilNeeded,
  existingCompetencyDisposition: contract.existingCompetencyRule.disposition,
  schedulerEnabled: false,
  runtimeActivationAllowed: false
}));
