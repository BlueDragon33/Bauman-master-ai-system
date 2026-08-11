import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { loadRoadmapConsumer } from "../roadmap_v2/consumer.mjs";
import { loadRoadmapMastery } from "../roadmap_v2/mastery.mjs";
import { loadRoadmapScheduler } from "../roadmap_v2/scheduler.mjs";

const root = path.resolve("roadmap_v2");

function bytes(relativePath) {
  return fs.readFileSync(path.join(root, relativePath));
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function descriptor(relativePath) {
  const value = bytes(relativePath);
  return { path: relativePath, bytes: value.length, sha256: sha256(value) };
}

const consumer = loadRoadmapConsumer();
const mastery = loadRoadmapMastery();
const scheduler = loadRoadmapScheduler();
const contract = JSON.parse(bytes("readiness/readiness-contract.json").toString("utf8"));

if (contract.acceptance?.result !== "PASS_CONTRACT_ONLY") throw new Error("Readiness contract is not B105 PASS");
if (consumer.bridge.schema !== contract.upstreamSchemas.consumerManifest) throw new Error("Readiness/consumer schema mismatch");
if (mastery.manifest.schema !== contract.upstreamSchemas.masteryManifest) throw new Error("Readiness/mastery schema mismatch");
if (scheduler.manifest.schema !== contract.upstreamSchemas.schedulerManifest) throw new Error("Readiness/Scheduler schema mismatch");

const manifest = {
  schema: "BAUMAN_ROADMAP_V2_READINESS_MANIFEST_V1",
  version: "2.7.0-l27-b107",
  status: "PASS_B107_FAIL_CLOSED_READINESS_PROJECTION_HARNESS",
  mode: "read_only_readiness_projection_harness",
  productionIntegration: "disconnected",
  baselineCommit: consumer.bridge.baselineCommit,
  upstream: {
    consumerManifest: descriptor("consumer/manifest.json"),
    masteryManifest: descriptor("mastery/manifest.json"),
    schedulerManifest: descriptor("scheduler/manifest.json")
  },
  files: {
    readinessContract: descriptor("readiness/readiness-contract.json"),
    readinessContractSchema: descriptor("readiness/readiness-contract.schema.json"),
    readinessRequestSchema: descriptor("readiness/readiness-request.schema.json"),
    readinessResultSchema: descriptor("readiness/readiness-result.schema.json"),
    readinessEngine: descriptor("readiness.mjs")
  },
  counts: {
    readinessDimensions: contract.readinessDimensions.length,
    colors: Object.keys(contract.statusPolicy).length,
    persistentStores: 0,
    dashboardUiRenders: 0,
    runtimeWrites: 0,
    notificationWrites: 0
  },
  safety: {
    missingEvidenceFailsClosed: true,
    masterReadyRequiredForGreen: true,
    verifiedExternalGateSourcesRequired: true,
    schedulerResultRecomputed: true,
    manualColorOverrideAllowed: false,
    persistentStoreWrites: 0,
    dashboardUiRenders: 0,
    runtimeWrites: 0,
    notificationWrites: 0
  },
  acceptance: {
    step: 107,
    contractPinned: true,
    projectorPinned: true,
    deterministicManifest: true,
    productionIntegration: "disconnected",
    result: "PASS_FAIL_CLOSED_READINESS_PROJECTION_HARNESS"
  }
};

fs.writeFileSync(path.join(root, "readiness", "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ status: manifest.status, counts: manifest.counts, safety: manifest.safety }));
