import fs from "node:fs";

function read(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const contract = read("roadmap_v2/integration/integration-contract.json");
const contractSchema = read("roadmap_v2/integration/integration-contract.schema.json");
const requestSchema = read("roadmap_v2/integration/activation-request.schema.json");
const planSchema = read("roadmap_v2/integration/activation-plan.schema.json");

assert(contract.schema === "BAUMAN_ROADMAP_V2_INTEGRATION_CONTRACT_V1", "Invalid Integration contract schema");
assert(contractSchema.$id === contract.schema, "Integration contract/schema identity mismatch");
assert(requestSchema.$id === "BAUMAN_ROADMAP_V2_ACTIVATION_REQUEST_V1", "Activation request schema identity mismatch");
assert(planSchema.$id === "BAUMAN_ROADMAP_V2_ACTIVATION_PLAN_V1", "Activation plan schema identity mismatch");
assert(contract.baselineCommit === "e383912354673bdce7a0059d6b9a23799d74e689", "Integration baseline drift");
assert(contract.mode.productionIntegration === "disconnected", "Integration contract connects production prematurely");
assert(contract.mode.legacyRuntimeAuthoritative === true, "Legacy runtime is not authoritative in L28");
assert(contract.mode.runtimeWriteAllowed === false, "Integration contract enables runtime writes");

const flagNames = [
  "roadmapCoreProjection",
  "diagnosticRuntime",
  "evidencePersistence",
  "priorityScheduler",
  "readinessDashboard"
];
assert(Object.keys(contract.featureFlags).length === flagNames.length, "Unexpected Integration feature flag count");
for (const flag of flagNames) {
  assert(Object.hasOwn(contract.featureFlags, flag), `Missing Integration feature flag: ${flag}`);
  assert(contract.featureFlags[flag].default === false, `Integration feature flag default is not OFF: ${flag}`);
  assert(Number.isInteger(contract.featureFlags[flag].activationStep) && contract.featureFlags[flag].activationStep >= 113, `Feature flag activates before L29: ${flag}`);
}

const policy = contract.activationPolicy;
assert(policy.allFlagsDefaultOff === true, "All-flags-OFF policy missing");
assert(policy.explicitRequestRequired === true && policy.verifiedSourceRequired === true, "Activation provenance policy incomplete");
assert(policy.exactBaselineRequired === true && policy.protectedFingerprintPassRequired === true, "Activation baseline gate incomplete");
assert(policy.rollbackVerificationRequired === true && policy.dependencyClosureRequired === true, "Activation rollback/dependency gate incomplete");
assert(policy.partialActivationAllowed === false && policy.activationAllowedInL28 === false, "L28 permits activation");

assert(contract.rollbackPolicy.strategy === "atomic_feature_flag_kill_switch", "Rollback strategy drift");
assert(contract.rollbackPolicy.legacyEntrypointsRemainUnchanged === true, "Rollback does not preserve legacy entrypoints");
assert(contract.rollbackPolicy.disableAllFlagsOnFailure === true, "Rollback does not disable all flags");
assert(contract.rollbackPolicy.dataRollbackRequiredInL28 === false, "L28 incorrectly claims persistent data rollback");

const unsafeCapabilities = [
  "featureFlagWrite",
  "runtimeImportWrite",
  "evidenceStoreWrite",
  "calendarWrite",
  "dashboardRender",
  "notificationWrite",
  "legacyMutation"
].filter((capability) => contract.capabilities[capability] !== false);
assert(unsafeCapabilities.length === 0, `Unsafe Integration capabilities enabled: ${unsafeCapabilities.join(", ")}`);
assert(contract.acceptance?.step === 109 && contract.acceptance?.result === "PASS_CONTRACT_ONLY", "B109 acceptance boundary incomplete");

console.log(JSON.stringify({
  status: "PASS_B109_INTEGRATION_CONTRACT",
  featureFlags: flagNames.length,
  allFlagsDefaultOff: true,
  rollbackStrategy: contract.rollbackPolicy.strategy,
  productionIntegration: contract.mode.productionIntegration,
  runtimeWrites: 0,
  legacyMutations: 0
}));
