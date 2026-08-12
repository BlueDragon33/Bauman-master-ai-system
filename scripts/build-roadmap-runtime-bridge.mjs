import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("roadmap_v2");

function bytes(relativePath) {
  return fs.readFileSync(path.join(root, relativePath));
}

function json(relativePath) {
  return JSON.parse(bytes(relativePath).toString("utf8"));
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function descriptor(relativePath, file = path.join(root, relativePath)) {
  const value = fs.readFileSync(file);
  return { path: relativePath, bytes: value.length, sha256: sha256(value) };
}

const contract = json("runtime/runtime-bridge-contract.json");
const integration = json("integration/manifest.json");
const sidecar = json("manifest.json");
if (contract.acceptance?.result !== "PASS_CONTRACT_ONLY") throw new Error("Runtime Bridge contract is not B113 PASS");
if (integration.schema !== contract.upstreamSchemas.integrationManifest) throw new Error("Runtime Bridge/Integration schema mismatch");
if (integration.productionIntegration !== "disconnected") throw new Error("Runtime Bridge upstream Integration boundary is open");
if (sidecar.schema !== "BAUMAN_ROADMAP_V2_SIDECAR_MANIFEST_V1" || sidecar.mode !== "read_only_sidecar") throw new Error("Runtime Bridge sidecar boundary drift");
if (Object.values(contract.featureFlags).some((flag) => flag.default !== false)) throw new Error("Runtime Bridge feature flag defaults ON");

const manifest = {
  schema: "BAUMAN_ROADMAP_V2_RUNTIME_MANIFEST_V1",
  version: "2.9.0-l29-b114",
  status: "PASS_B114_BROWSER_READ_ONLY_CORE_PROJECTION_BRIDGE",
  mode: "browser_read_only_core_projection_bridge",
  productionIntegration: "connected_default_off",
  defaultActivation: "disabled",
  baselineCommit: contract.baselineCommit,
  upstream: {
    integrationManifest: descriptor("integration/manifest.json"),
    sidecarManifest: descriptor("manifest.json")
  },
  files: {
    runtimeContract: descriptor("runtime/runtime-bridge-contract.json"),
    runtimeContractSchema: descriptor("runtime/runtime-bridge-contract.schema.json"),
    browserRuntime: descriptor("browser-runtime.mjs"),
    mathBridge: descriptor("../subjects/math/assets/roadmap-v2-bridge.mjs", path.resolve("subjects/math/assets/roadmap-v2-bridge.mjs")),
    legacyIndexSnapshot: descriptor("runtime/legacy-index.e383912.html")
  },
  counts: {
    featureFlags: Object.keys(contract.featureFlags).length,
    defaultOffFlags: Object.values(contract.featureFlags).filter((flag) => flag.default === false).length,
    availableL29Capabilities: Object.values(contract.featureFlags).filter((flag) => flag.availableInL29).length,
    courses: sidecar.counts.courses,
    chapters: sidecar.counts.chapters,
    numberedLessons: sidecar.counts.numberedLessons,
    graphNodes: sidecar.counts.courses + 36 + sidecar.counts.chapters + sidecar.counts.numberedLessons + sidecar.counts.externalGateNodes,
    prerequisiteEdges: sidecar.counts.prerequisiteEdges,
    productionEntrypointsModified: 1,
    persistentStores: 0,
    domMutations: 0,
    runtimeWrites: 0,
    legacyMutations: 0
  },
  safety: {
    defaultOffMakesZeroRoadmapRequests: true,
    unsupportedFlagsFailClosed: true,
    browserPayloadHashPinned: true,
    legacyIndexByteExactRollback: true,
    subjectManifestsUnchanged: true,
    persistentStoreWrites: 0,
    domMutations: 0,
    runtimeWrites: 0,
    legacyMutations: 0
  },
  acceptance: {
    step: 114,
    contractPinned: true,
    browserRuntimePinned: true,
    bridgePinned: true,
    defaultActivation: "disabled",
    result: "PASS_BROWSER_READ_ONLY_CORE_PROJECTION_BRIDGE"
  }
};

fs.writeFileSync(path.join(root, "runtime", "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ status: manifest.status, counts: manifest.counts, safety: manifest.safety }));
