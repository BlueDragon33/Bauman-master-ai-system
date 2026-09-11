import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadRoadmapIntegration } from "../roadmap_v2/integration.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "roadmap_v2");
const baselineCommit = "e383912354673bdce7a0059d6b9a23799d74e689";

function allOff() {
  return {
    roadmapCoreProjection: false,
    diagnosticRuntime: false,
    evidencePersistence: false,
    priorityScheduler: false,
    readinessDashboard: false
  };
}

function request(overrides = {}) {
  const requestedFeatureFlags = {
    ...allOff(),
    ...(overrides.requestedFeatureFlags || {})
  };
  return {
    schema: "BAUMAN_ROADMAP_V2_ACTIVATION_REQUEST_V1",
    planId: overrides.planId || "L28::TEST",
    baselineCommit,
    requestedFeatureFlags,
    source: { ref: "test://l28/integration", verified: true },
    protectedFingerprintStatus: "PASS",
    rollbackVerified: true,
    ...Object.fromEntries(Object.entries(overrides).filter(([key]) => key !== "requestedFeatureFlags"))
  };
}

test("loads the pinned B110 disconnected Integration harness", () => {
  const integration = loadRoadmapIntegration();
  assert.equal(integration.manifest.status, "PASS_B110_FAIL_CLOSED_ACTIVATION_PLANNING_HARNESS");
  assert.equal(integration.manifest.counts.featureFlags, 5);
  assert.equal(integration.manifest.counts.defaultOffFlags, 5);
  assert.equal(integration.manifest.counts.productionImports, 0);
  assert.equal(integration.manifest.counts.runtimeWrites, 0);
});

test("returns a safe no-op only when every requested flag is OFF", () => {
  const integration = loadRoadmapIntegration();
  const result = integration.planActivation(request());
  assert.equal(result.decision, "safe_noop");
  assert.deepEqual(result.requestedFeatureFlags, allOff());
  assert.deepEqual(result.effectiveFeatureFlags, allOff());
  assert.deepEqual(result.reasonCodes, ["REQUESTED_FLAGS_ALL_OFF"]);
});

test("blocks the Roadmap core flag before the L29 runtime bridge", () => {
  const integration = loadRoadmapIntegration();
  const result = integration.planActivation(request({ requestedFeatureFlags: { roadmapCoreProjection: true } }));
  assert.equal(result.decision, "blocked");
  assert.equal(result.reasonCodes.includes("PRODUCTION_INTEGRATION_DISCONNECTED"), true);
  assert.equal(result.reasonCodes.includes("RUNTIME_BRIDGE_NOT_IMPLEMENTED"), true);
  assert.equal(result.effectiveFeatureFlags.roadmapCoreProjection, false);
});

test("blocks Diagnostic runtime while verified item banks remain zero", () => {
  const integration = loadRoadmapIntegration();
  const result = integration.planActivation(request({ requestedFeatureFlags: { diagnosticRuntime: true } }));
  assert.equal(result.decision, "blocked");
  assert.equal(result.reasonCodes.includes("DIAGNOSTIC_ITEM_BANKS_MISSING"), true);
  assert.equal(result.reasonCodes.includes("DEPENDENCY_NOT_ENABLED"), true);
});

test("blocks evidence persistence before a versioned store and restore path exist", () => {
  const integration = loadRoadmapIntegration();
  const result = integration.planActivation(request({ requestedFeatureFlags: { evidencePersistence: true } }));
  assert.equal(result.decision, "blocked");
  assert.equal(result.reasonCodes.includes("EVIDENCE_STORE_NOT_IMPLEMENTED"), true);
  assert.equal(result.reasonCodes.includes("DEPENDENCY_NOT_ENABLED"), true);
});

test("blocks Priority/Scheduler while legacy mapping review remains incomplete", () => {
  const integration = loadRoadmapIntegration();
  const result = integration.planActivation(request({ requestedFeatureFlags: { priorityScheduler: true } }));
  assert.equal(result.decision, "blocked");
  assert.equal(result.reasonCodes.includes("LEGACY_MAPPING_REVIEW_INCOMPLETE"), true);
  assert.equal(result.reasonCodes.includes("DEPENDENCY_NOT_ENABLED"), true);
});

test("blocks the complete activation chain and never partially activates it", () => {
  const integration = loadRoadmapIntegration();
  const enabled = Object.fromEntries(Object.keys(allOff()).map((flag) => [flag, true]));
  const result = integration.planActivation(request({ requestedFeatureFlags: enabled }));
  assert.equal(result.decision, "blocked");
  assert.deepEqual(result.requestedFeatureFlags, enabled);
  assert.deepEqual(result.effectiveFeatureFlags, allOff());
  assert.equal(result.reasonCodes.includes("PRODUCTION_INTEGRATION_DISCONNECTED"), true);
});

test("rejects unsupported caller fields and result overrides", () => {
  const integration = loadRoadmapIntegration();
  assert.throws(() => integration.planActivation({ ...request(), decision: "safe_noop" }), /unsupported fields/);
  assert.throws(() => integration.planActivation({ ...request(), effectiveFeatureFlags: allOff() }), /unsupported fields/);
});

test("rejects unknown feature flags", () => {
  const integration = loadRoadmapIntegration();
  const input = request();
  input.requestedFeatureFlags.hiddenRuntimeBypass = true;
  assert.throws(() => integration.planActivation(input), /unsupported fields/);
});

test("rejects an incomplete or non-boolean feature flag set", () => {
  const integration = loadRoadmapIntegration();
  const incomplete = request();
  delete incomplete.requestedFeatureFlags.readinessDashboard;
  assert.throws(() => integration.planActivation(incomplete), /must specify every feature flag/);
  const invalid = request();
  invalid.requestedFeatureFlags.roadmapCoreProjection = "false";
  assert.throws(() => integration.planActivation(invalid), /not boolean/);
});

test("rejects baseline drift and unverified provenance", () => {
  const integration = loadRoadmapIntegration();
  assert.throws(() => integration.planActivation(request({ baselineCommit: "0".repeat(40) })), /baseline commit mismatch/);
  assert.throws(() => integration.planActivation(request({ source: { ref: "test://unverified", verified: false } })), /Unverified Activation source/);
});

test("rejects a failed protected fingerprint or unverified rollback gate", () => {
  const integration = loadRoadmapIntegration();
  assert.throws(() => integration.planActivation(request({ protectedFingerprintStatus: "FAIL" })), /fingerprint gate is not PASS/);
  assert.throws(() => integration.planActivation(request({ rollbackVerified: false })), /rollback gate is not verified/);
});

test("returns deterministic deeply frozen non-persisted plans", () => {
  const integration = loadRoadmapIntegration();
  const input = request({ requestedFeatureFlags: { roadmapCoreProjection: true } });
  const first = integration.planActivation(input);
  const second = integration.planActivation(input);
  assert.deepEqual(first, second);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.requestedFeatureFlags), true);
  assert.equal(Object.isFrozen(first.effectiveFeatureFlags), true);
  assert.equal(Object.isFrozen(first.rollback), true);
  assert.equal(first.persisted, false);
  assert.equal(first.runtimeWriteAllowed, false);
  assert.equal(first.legacyMutationAllowed, false);
  assert.throws(() => { first.decision = "safe_noop"; }, TypeError);
});

test("preserves an atomic kill-switch rollback plan for every blocked request", () => {
  const integration = loadRoadmapIntegration();
  const result = integration.planActivation(request({ requestedFeatureFlags: { readinessDashboard: true } }));
  assert.deepEqual(result.rollback, {
    strategy: "atomic_feature_flag_kill_switch",
    allFlagsDisabled: true,
    legacyEntrypointsPreserved: true,
    dataRollbackRequired: false,
    verified: true
  });
});

test("fails closed when a pinned Integration or upstream file is tampered or missing", () => {
  const tampered = fs.mkdtempSync(path.join(os.tmpdir(), "bauman-integration-tamper-"));
  try {
    fs.cpSync(packageRoot, tampered, { recursive: true });
    fs.appendFileSync(path.join(tampered, "integration", "integration-contract.json"), "\n");
    assert.throws(() => loadRoadmapIntegration({ baseDir: tampered }), /Integration (byte count|hash) mismatch/);
  } finally {
    fs.rmSync(tampered, { recursive: true, force: true });
  }

  const missing = fs.mkdtempSync(path.join(os.tmpdir(), "bauman-integration-missing-"));
  try {
    fs.cpSync(packageRoot, missing, { recursive: true });
    fs.rmSync(path.join(missing, "readiness", "manifest.json"));
    assert.throws(() => loadRoadmapIntegration({ baseDir: missing }), /Missing Roadmap Integration file/);
  } finally {
    fs.rmSync(missing, { recursive: true, force: true });
  }
});
