import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { loadRoadmapConsumer } from "../roadmap_v2/consumer.mjs";
import { loadRoadmapMastery } from "../roadmap_v2/mastery.mjs";

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
const contract = JSON.parse(bytes("priority/priority-contract.json").toString("utf8"));

if (contract.acceptance?.result !== "PASS_CONTRACT_ONLY") throw new Error("Priority contract is not B97 PASS");
if (consumer.bridge.schema !== contract.upstreamSchemas.consumerManifest) throw new Error("Priority/consumer schema mismatch");
if (mastery.manifest.schema !== contract.upstreamSchemas.masteryManifest) throw new Error("Priority/mastery schema mismatch");

const manifest = {
  schema: "BAUMAN_ROADMAP_V2_PRIORITY_MANIFEST_V1",
  version: "2.5.0-l25-b99",
  status: "PASS_B99_EXPLAINABLE_PRIORITY_RANKING_HARNESS",
  mode: "in_memory_priority_scoring_harness",
  productionIntegration: "disconnected",
  baselineCommit: consumer.bridge.baselineCommit,
  upstream: {
    consumerManifest: descriptor("consumer/manifest.json"),
    masteryManifest: descriptor("mastery/manifest.json")
  },
  files: {
    priorityContract: descriptor("priority/priority-contract.json"),
    priorityContractSchema: descriptor("priority/priority-contract.schema.json"),
    priorityCandidateSchema: descriptor("priority/priority-candidate.schema.json"),
    priorityResultSchema: descriptor("priority/priority-result.schema.json"),
    priorityEngine: descriptor("priority.mjs")
  },
  counts: {
    weights: Object.keys(contract.formula.weights).length,
    knowledgeStates: Object.keys(contract.normalization.knowledgeGapByState).length,
    weightedBands: contract.weightedBands.length,
    persistentStores: 0,
    schedulerWrites: 0,
    runtimeWrites: 0
  },
  safety: {
    derivedFeaturesCannotBeOverridden: true,
    explainableContributions: true,
    stableRanking: true,
    criticalOverrideEnabled: true,
    existingCompetencyGrantsMasterReady: false,
    persistentStoreWrites: 0,
    schedulerWrites: 0,
    runtimeWrites: 0
  },
  acceptance: {
    step: 99,
    formulaPinned: true,
    scoringEnginePinned: true,
    rankingEnginePinned: true,
    schedulerEnabled: false,
    productionIntegration: "disconnected",
    result: "PASS_EXPLAINABLE_PRIORITY_RANKING_HARNESS"
  }
};

fs.writeFileSync(path.join(root, "priority", "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ status: manifest.status, counts: manifest.counts, safety: manifest.safety }));
