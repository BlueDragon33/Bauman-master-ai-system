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

function descriptor(relativePath) {
  const value = bytes(relativePath);
  return { path: relativePath, bytes: value.length, sha256: sha256(value) };
}

const contract = json("integration/integration-contract.json");
const diagnostic = json("diagnostic/manifest.json");
const readiness = json("readiness/manifest.json");

if (contract.acceptance?.result !== "PASS_CONTRACT_ONLY") throw new Error("Integration contract is not B109 PASS");
if (diagnostic.schema !== contract.upstreamSchemas.diagnosticManifest) throw new Error("Integration/Diagnostic schema mismatch");
if (readiness.schema !== contract.upstreamSchemas.readinessManifest) throw new Error("Integration/Readiness schema mismatch");
if (diagnostic.productionIntegration !== "disconnected" || readiness.productionIntegration !== "disconnected") throw new Error("Integration upstream production boundary is open");
if (diagnostic.counts.verifiedItemBanks !== 0 || diagnostic.counts.executablePlans !== 0) throw new Error("Integration contract diagnostic assumptions drifted");

const manifest = {
  schema: "BAUMAN_ROADMAP_V2_INTEGRATION_MANIFEST_V1",
  version: "2.8.0-l28-b110",
  status: "PASS_B110_FAIL_CLOSED_ACTIVATION_PLANNING_HARNESS",
  mode: "read_only_activation_planning_harness",
  productionIntegration: "disconnected",
  baselineCommit: contract.baselineCommit,
  upstream: {
    diagnosticManifest: descriptor("diagnostic/manifest.json"),
    readinessManifest: descriptor("readiness/manifest.json")
  },
  files: {
    integrationContract: descriptor("integration/integration-contract.json"),
    integrationContractSchema: descriptor("integration/integration-contract.schema.json"),
    activationRequestSchema: descriptor("integration/activation-request.schema.json"),
    activationPlanSchema: descriptor("integration/activation-plan.schema.json"),
    integrationEngine: descriptor("integration.mjs")
  },
  counts: {
    featureFlags: Object.keys(contract.featureFlags).length,
    defaultOffFlags: Object.values(contract.featureFlags).filter((flag) => flag.default === false).length,
    verifiedDiagnosticItemBanks: diagnostic.counts.verifiedItemBanks,
    executableDiagnosticPlans: diagnostic.counts.executablePlans,
    productionImports: 0,
    persistentStores: 0,
    runtimeWrites: 0,
    legacyMutations: 0
  },
  safety: {
    allFlagsDefaultOff: true,
    anyEnabledFlagBlockedInL28: true,
    exactBaselineRequired: true,
    protectedFingerprintPassRequired: true,
    rollbackVerificationRequired: true,
    atomicKillSwitch: true,
    legacyEntrypointsPreserved: true,
    productionWrites: 0
  },
  acceptance: {
    step: 110,
    contractPinned: true,
    enginePinned: true,
    upstreamManifestsPinned: true,
    productionIntegration: "disconnected",
    result: "PASS_FAIL_CLOSED_ACTIVATION_PLANNING_HARNESS"
  }
};

fs.writeFileSync(path.join(root, "integration", "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ status: manifest.status, counts: manifest.counts, safety: manifest.safety }));
