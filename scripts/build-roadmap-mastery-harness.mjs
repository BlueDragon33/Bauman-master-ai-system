import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { loadRoadmapConsumer } from "../roadmap_v2/consumer.mjs";
import { loadRoadmapDiagnostic } from "../roadmap_v2/diagnostic.mjs";

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
const diagnostic = loadRoadmapDiagnostic();
const contract = JSON.parse(bytes("mastery/mastery-contract.json").toString("utf8"));

if (contract.acceptance?.result !== "PASS_CONTRACT_ONLY") throw new Error("Mastery contract is not B93 PASS");
if (consumer.bridge.schema !== contract.upstreamSchemas.consumerManifest) throw new Error("Mastery/consumer schema mismatch");
if (diagnostic.manifest.schema !== contract.upstreamSchemas.diagnosticManifest) throw new Error("Mastery/diagnostic schema mismatch");

const manifest = {
  schema: "BAUMAN_ROADMAP_V2_MASTERY_MANIFEST_V1",
  version: "2.4.0-l24-b95",
  status: "PASS_B95_MASTERY_PREREQUISITE_HARNESS",
  mode: "in_memory_append_only_evidence_harness",
  productionIntegration: "disconnected",
  baselineCommit: consumer.bridge.baselineCommit,
  upstream: {
    consumerManifest: descriptor("consumer/manifest.json"),
    diagnosticManifest: descriptor("diagnostic/manifest.json")
  },
  files: {
    masteryContract: descriptor("mastery/mastery-contract.json"),
    masteryContractSchema: descriptor("mastery/mastery-contract.schema.json"),
    evidenceEventSchema: descriptor("mastery/evidence-event.schema.json"),
    masterySnapshotSchema: descriptor("mastery/mastery-snapshot.schema.json"),
    masteryEngine: descriptor("mastery.mjs")
  },
  counts: {
    knowledgeStates: contract.knowledgeStates.length,
    evidenceTypes: contract.evidenceTypes.length,
    catalogTargets: diagnostic.catalog.counts.plans,
    persistentStores: 0,
    persistedEvents: 0,
    persistedSnapshots: 0
  },
  safety: {
    appendOnlyValidation: true,
    inMemoryReductionOnly: true,
    diagnosticPassGrantsMasterReady: false,
    persistentStoreWrites: 0,
    priorityEngineWrites: 0,
    schedulerWrites: 0,
    runtimeWrites: 0
  },
  acceptance: {
    step: 95,
    eventSchemaPinned: true,
    reducerPinned: true,
    deterministicReplayRequired: true,
    masterReadyGateEnabled: true,
    prerequisitePropagationEnabled: true,
    productionPersistenceEnabled: false,
    result: "PASS_MASTERY_PREREQUISITE_HARNESS"
  }
};

fs.writeFileSync(path.join(root, "mastery", "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ status: manifest.status, counts: manifest.counts, safety: manifest.safety }));
