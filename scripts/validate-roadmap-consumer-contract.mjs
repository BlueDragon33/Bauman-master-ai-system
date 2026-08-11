import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("roadmap_v2");

function read(relativePath) {
  const bytes = fs.readFileSync(path.join(root, relativePath));
  return { bytes, value: JSON.parse(bytes.toString("utf8")) };
}

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const bridge = read("consumer/manifest.json");
const contract = read("consumer/consumer-contract.json");
const schema = read("consumer/consumer-contract.schema.json");
const upstream = read("manifest.json");
const mapping = read("data/mappingReport.json").value;

assert(bridge.value.schema === "BAUMAN_ROADMAP_V2_CONSUMER_MANIFEST_V1", "Invalid consumer manifest schema");
assert(bridge.value.status === "PASS_B85_CONSUMER_CONTRACT", "Consumer manifest status is not B85 PASS");
assert(bridge.value.mode === "read_only_consumer_bridge", "Consumer bridge is not read-only");
assert(bridge.value.productionIntegration === "disconnected", "Consumer bridge is not production-disconnected");
assert(bridge.value.upstream.sidecarManifestSha256 === sha256(upstream.bytes), "Pinned upstream sidecar hash mismatch");
assert(bridge.value.files.consumerContract.sha256 === sha256(contract.bytes), "Pinned consumer contract hash mismatch");
assert(bridge.value.files.consumerContractSchema.sha256 === sha256(schema.bytes), "Pinned consumer schema hash mismatch");
assert(schema.value.$id === contract.value.schema, "Contract/schema identity mismatch");
assert(contract.value.mode.access === "read_only", "Consumer contract must be read-only");
assert(contract.value.mode.productionIntegration === "disconnected", "Consumer contract must remain disconnected");
assert(contract.value.mode.failClosed === true, "Consumer contract must fail closed");

const allowedCapabilities = [
  "registryRead",
  "prerequisiteRead",
  "provenanceRead",
  "eligibilityRead",
  "diagnosticBlueprintRead"
];
const enabledCapabilities = Object.entries(contract.value.capabilities)
  .filter(([, enabled]) => enabled)
  .map(([id]) => id)
  .sort();
assert(JSON.stringify(enabledCapabilities) === JSON.stringify(allowedCapabilities.sort()), "Consumer capabilities exceed the L22 read boundary");

const legacyStatuses = new Set(mapping.legacyLessonMappings.map((item) => item.mappingStatus));
const overlayStatuses = new Set(mapping.overlayMappings.map((item) => item.mappingStatus));
const frameworkStatuses = new Set(mapping.frameworkMappings.map((item) => item.mappingStatus));
for (const status of legacyStatuses) assert(contract.value.states.legacyLesson[status], `Unknown legacy eligibility status: ${status}`);
for (const status of overlayStatuses) assert(contract.value.states.overlay[status], `Unknown overlay eligibility status: ${status}`);
for (const status of frameworkStatuses) assert(contract.value.states.framework[status], `Unknown framework eligibility status: ${status}`);

assert(mapping.legacyLessonMappings.length === bridge.value.counts.legacyLessonsInventoried, "Legacy inventory count drift");
assert(mapping.validation.exactLegacyLessonMappingsVerified === bridge.value.counts.exactLegacyLessonMappingsVerified, "Verified mapping count drift");
assert(mapping.validation.preservedLegacyLessonsUnmapped === bridge.value.counts.preservedLegacyLessonsUnmapped, "Unmapped legacy count drift");
assert(mapping.validation.priorityEngineEligibleLegacyRecords === 0, "Priority Engine legacy eligibility must remain zero");
assert(mapping.legacyLessonMappings.every((item) => item.priorityEngineEligible === false), "A legacy lesson is prematurely Priority Engine eligible");
assert(mapping.overlayMappings.every((item) => item.priorityEngineEligible === false), "An overlay is prematurely Priority Engine eligible");
assert(mapping.frameworkMappings.every((item) => item.priorityEngineEligible === false), "A framework outline is prematurely Priority Engine eligible");
assert(mapping.frameworkMappings.every((item) => item.mappingStatus === "secondary_outline_quarantined_candidate"), "A framework outline escaped quarantine");

assert(contract.value.acceptance.mappingBoundaryExplicit === true, "Mapping boundary is not explicit");
assert(contract.value.acceptance.contentBoundaryExplicit === true, "Content boundary is not explicit");
assert(contract.value.acceptance.schemaBoundaryExplicit === true, "Schema boundary is not explicit");
assert(contract.value.acceptance.crossChapterAuditRequired === true, "Cross-chapter audit is not required");
assert(contract.value.acceptance.runtimeActivationAllowed === false, "Runtime activation is prematurely allowed");

console.log(JSON.stringify({
  status: "PASS_B85_CONSUMER_CONTRACT",
  enabledCapabilities,
  legacyStatuses: [...legacyStatuses].sort(),
  overlayStatuses: [...overlayStatuses].sort(),
  frameworkStatuses: [...frameworkStatuses].sort(),
  priorityEngineEligibleLegacyRecords: 0
}));
