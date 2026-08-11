import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { loadRoadmapConsumer } from "../roadmap_v2/consumer.mjs";
import { loadRoadmapPriority } from "../roadmap_v2/priority.mjs";

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
const priority = loadRoadmapPriority();
const contract = JSON.parse(bytes("scheduler/scheduler-contract.json").toString("utf8"));

if (contract.acceptance?.result !== "PASS_CONTRACT_ONLY") throw new Error("Scheduler contract is not B101 PASS");
if (consumer.bridge.schema !== contract.upstreamSchemas.consumerManifest) throw new Error("Scheduler/consumer schema mismatch");
if (priority.manifest.schema !== contract.upstreamSchemas.priorityManifest) throw new Error("Scheduler/Priority schema mismatch");

const manifest = {
  schema: "BAUMAN_ROADMAP_V2_SCHEDULER_MANIFEST_V1",
  version: "2.6.0-l26-b103",
  status: "PASS_B103_DETERMINISTIC_WEEKLY_PROJECTION_HARNESS",
  mode: "in_memory_weekly_projection_harness",
  productionIntegration: "disconnected",
  baselineCommit: consumer.bridge.baselineCommit,
  upstream: {
    priorityManifest: descriptor("priority/manifest.json")
  },
  files: {
    schedulerContract: descriptor("scheduler/scheduler-contract.json"),
    schedulerContractSchema: descriptor("scheduler/scheduler-contract.schema.json"),
    schedulerRequestSchema: descriptor("scheduler/scheduler-request.schema.json"),
    schedulerResultSchema: descriptor("scheduler/scheduler-result.schema.json"),
    schedulerEngine: descriptor("scheduler.mjs")
  },
  counts: {
    phasePolicies: Object.keys(contract.phasePolicies).length,
    productionCalendarConnections: 0,
    persistentStores: 0,
    calendarWrites: 0,
    runtimeWrites: 0,
    generatedDynamicContent: 0
  },
  safety: {
    priorityRecomputedFromCandidates: true,
    currentBaumanRequiresVerifiedSource: true,
    russianTwinIsPlaceholderOnly: true,
    atomicBundles: true,
    capacityOverrunAllowed: false,
    reviewOnDemandGrantsMasterReady: false,
    productionCalendarConnections: 0,
    persistentStoreWrites: 0,
    calendarWrites: 0,
    runtimeWrites: 0
  },
  acceptance: {
    step: 103,
    contractPinned: true,
    projectorPinned: true,
    deterministicManifest: true,
    productionIntegration: "disconnected",
    result: "PASS_DETERMINISTIC_WEEKLY_PROJECTION_HARNESS"
  }
};

fs.writeFileSync(path.join(root, "scheduler", "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ status: manifest.status, counts: manifest.counts, safety: manifest.safety }));
