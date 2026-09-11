import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("roadmap_v2");
const consumerRoot = path.join(root, "consumer");
const sidecarManifestFile = path.join(root, "manifest.json");
const contractFile = path.join(consumerRoot, "consumer-contract.json");
const schemaFile = path.join(consumerRoot, "consumer-contract.schema.json");

function read(file) {
  const bytes = fs.readFileSync(file);
  return { bytes, value: JSON.parse(bytes.toString("utf8")) };
}

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

const sidecar = read(sidecarManifestFile);
const contract = read(contractFile);
const schema = read(schemaFile);

if (sidecar.value.schema !== "BAUMAN_ROADMAP_V2_SIDECAR_MANIFEST_V1") {
  throw new Error("Unexpected upstream sidecar manifest schema");
}
if (sidecar.value.productionIntegration !== "disconnected") {
  throw new Error("Consumer bridge requires a disconnected upstream sidecar");
}
if (contract.value.schema !== "BAUMAN_ROADMAP_V2_CONSUMER_CONTRACT_V1") {
  throw new Error("Unexpected consumer contract schema");
}
if (contract.value.mode?.access !== "read_only" || contract.value.mode?.productionIntegration !== "disconnected") {
  throw new Error("Consumer contract must remain read-only and production-disconnected");
}
if (contract.value.capabilities?.runtimeActivation !== false || contract.value.capabilities?.priorityEngineRead !== false) {
  throw new Error("Consumer contract prematurely enables runtime or Priority Engine access");
}
if (schema.value.$id !== contract.value.schema) {
  throw new Error("Consumer contract/schema identity mismatch");
}

const manifest = {
  schema: "BAUMAN_ROADMAP_V2_CONSUMER_MANIFEST_V1",
  version: "2.2.0-l22-b85",
  status: "PASS_B85_CONSUMER_CONTRACT",
  mode: "read_only_consumer_bridge",
  productionIntegration: "disconnected",
  baselineCommit: sidecar.value.baselineCommit,
  upstream: {
    sidecarManifestPath: "roadmap_v2/manifest.json",
    sidecarManifestSha256: sha256(sidecar.bytes),
    sidecarSchema: sidecar.value.schema,
    sidecarVersion: sidecar.value.version
  },
  files: {
    consumerContract: {
      path: "consumer/consumer-contract.json",
      bytes: contract.bytes.length,
      sha256: sha256(contract.bytes)
    },
    consumerContractSchema: {
      path: "consumer/consumer-contract.schema.json",
      bytes: schema.bytes.length,
      sha256: sha256(schema.bytes)
    }
  },
  counts: {
    courses: sidecar.value.counts.courses,
    chapters: sidecar.value.counts.chapters,
    numberedLessons: sidecar.value.counts.numberedLessons,
    dynamicChapters: sidecar.value.counts.dynamicChapters,
    legacyLessonsInventoried: sidecar.value.counts.legacyLessonsInventoried,
    exactLegacyLessonMappingsVerified: sidecar.value.counts.exactLegacyLessonMappingsVerified,
    preservedLegacyLessonsUnmapped: sidecar.value.counts.preservedLegacyLessonsUnmapped,
    priorityEngineEligibleLegacyRecords: sidecar.value.counts.priorityEngineEligibleLegacyRecords
  },
  acceptance: {
    step: 85,
    consumerContractPinned: true,
    upstreamManifestPinned: true,
    readOnly: true,
    failClosed: true,
    productionDisconnected: true,
    result: "PASS"
  }
};

fs.writeFileSync(path.join(consumerRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ status: manifest.status, counts: manifest.counts }));
