import crypto from "node:crypto";
import fs from "node:fs";

function read(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function gitBlobSha(bytes) {
  const header = Buffer.from(`blob ${bytes.length}\0`);
  return crypto.createHash("sha1").update(header).update(bytes).digest("hex");
}

const contract = read("roadmap_v2/runtime/runtime-bridge-contract.json");
const schema = read("roadmap_v2/runtime/runtime-bridge-contract.schema.json");
const legacyIndex = fs.readFileSync("roadmap_v2/runtime/legacy-index.e383912.html");
const canonicalLegacyIndex = contract.mutationScope.indexMutation.legacySnapshotStorageTrailingLfExcluded === true
  && legacyIndex.at(-1) === 0x0a
  ? legacyIndex.subarray(0, -1)
  : legacyIndex;

assert(contract.schema === "BAUMAN_ROADMAP_V2_RUNTIME_BRIDGE_CONTRACT_V1", "Invalid Runtime Bridge contract schema");
assert(schema.$id === contract.schema, "Runtime Bridge contract/schema identity mismatch");
assert(contract.baselineCommit === "e383912354673bdce7a0059d6b9a23799d74e689", "Runtime Bridge baseline drift");
assert(contract.mutationScope.indexMutation.legacySnapshotStorageTrailingLfExcluded === true, "Legacy snapshot storage normalization is not explicit");
assert(gitBlobSha(canonicalLegacyIndex) === contract.mutationScope.indexMutation.legacyGitBlobSha, "Legacy index rollback snapshot fingerprint drift");
assert(contract.mutationScope.indexMutation.allowedInsertionCount === 1, "Runtime Bridge permits multiple entrypoint insertions");
assert(contract.mutationScope.indexMutation.insertionPoint === "immediately_before_closing_body", "Runtime Bridge insertion point drift");
assert(contract.mode.defaultActivation === "disabled", "Runtime Bridge default is not disabled");
assert(contract.mode.legacyRuntimeAuthoritativeWhenDisabled === true, "Legacy runtime is not authoritative with the bridge disabled");
assert(contract.mode.productionDataWriteAllowed === false && contract.mode.legacyMutationAllowed === false, "Runtime Bridge enables unsafe writes");

const flags = Object.entries(contract.featureFlags);
assert(flags.length === 5, "Unexpected Runtime Bridge feature flag count");
assert(flags.every(([, value]) => value.default === false), "A Runtime Bridge feature flag defaults ON");
assert(flags.filter(([, value]) => value.availableInL29).map(([name]) => name).join("") === "roadmapCoreProjection", "L29 capability boundary drift");
assert(contract.activationPolicy.defaultRoadmapNetworkRequests === 0, "Default-OFF bridge permits Roadmap network requests");
assert(contract.activationPolicy.domMutationAllowed === false, "Runtime Bridge permits DOM mutation");
assert(contract.rollbackPolicy.defaultOffRestoresLegacyOnlyPath === true, "Default-OFF rollback invariant missing");
assert(contract.rollbackPolicy.bridgeRemovalRestoresExactLegacySnapshot === true, "Byte-exact bridge removal invariant missing");
assert(contract.rollbackPolicy.persistentDataRollbackRequired === false, "L29 incorrectly claims persistent data rollback");

const unsafe = ["diagnosticExecution", "evidenceRead", "evidenceWrite", "prioritySchedulerExecution", "dashboardRender", "calendarWrite", "notificationWrite", "legacyMutation"]
  .filter((capability) => contract.capabilities[capability] !== false);
assert(unsafe.length === 0, `Unsafe Runtime Bridge capabilities enabled: ${unsafe.join(", ")}`);
assert(contract.acceptance?.step === 113 && contract.acceptance?.result === "PASS_CONTRACT_ONLY", "B113 acceptance boundary incomplete");

console.log(JSON.stringify({
  status: "PASS_B113_RUNTIME_BRIDGE_CONTRACT",
  featureFlags: flags.length,
  defaultOffFlags: flags.filter(([, value]) => value.default === false).length,
  availableCapabilities: ["roadmapCoreProjection"],
  legacyIndexBlobSha: gitBlobSha(canonicalLegacyIndex),
  defaultRoadmapRequests: 0,
  productionWrites: 0
}));
