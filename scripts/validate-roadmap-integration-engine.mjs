import { loadRoadmapIntegration } from "../roadmap_v2/integration.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function request(overrides = {}) {
  const flags = {
    roadmapCoreProjection: false,
    diagnosticRuntime: false,
    evidencePersistence: false,
    priorityScheduler: false,
    readinessDashboard: false,
    ...(overrides.requestedFeatureFlags || {})
  };
  return {
    schema: "BAUMAN_ROADMAP_V2_ACTIVATION_REQUEST_V1",
    planId: overrides.planId || "L28::SAFE-NOOP",
    baselineCommit: "e383912354673bdce7a0059d6b9a23799d74e689",
    requestedFeatureFlags: flags,
    source: { ref: "validator://l28/b110", verified: true },
    protectedFingerprintStatus: "PASS",
    rollbackVerified: true,
    ...Object.fromEntries(Object.entries(overrides).filter(([key]) => key !== "requestedFeatureFlags"))
  };
}

const integration = loadRoadmapIntegration();
const safe = integration.planActivation(request());
const blocked = integration.planActivation(request({
  planId: "L28::BLOCKED-CORE",
  requestedFeatureFlags: { roadmapCoreProjection: true }
}));

assert(safe.decision === "safe_noop", "All-OFF Activation request is not a safe no-op");
assert(Object.values(safe.effectiveFeatureFlags).every((value) => value === false), "Safe no-op enables a feature flag");
assert(safe.reasonCodes.includes("REQUESTED_FLAGS_ALL_OFF"), "Safe no-op reason missing");
assert(blocked.decision === "blocked", "L28 enabled feature flag was not blocked");
assert(blocked.reasonCodes.includes("PRODUCTION_INTEGRATION_DISCONNECTED"), "Disconnected production reason missing");
assert(blocked.reasonCodes.includes("RUNTIME_BRIDGE_NOT_IMPLEMENTED"), "Runtime bridge blocker missing");
assert(Object.values(blocked.effectiveFeatureFlags).every((value) => value === false), "Blocked plan enables a feature flag");
assert(blocked.rollback.allFlagsDisabled === true && blocked.rollback.legacyEntrypointsPreserved === true, "Atomic rollback plan incomplete");
assert(Object.isFrozen(blocked) && Object.isFrozen(blocked.effectiveFeatureFlags) && Object.isFrozen(blocked.rollback), "Activation plan is mutable");
assert(blocked.persisted === false && blocked.runtimeWriteAllowed === false && blocked.legacyMutationAllowed === false, "Activation plan escaped the L28 harness");

console.log(JSON.stringify({
  status: "PASS_B110_FAIL_CLOSED_ACTIVATION_PLANNER",
  safeDecision: safe.decision,
  enabledRequestDecision: blocked.decision,
  effectiveEnabledFlags: Object.values(blocked.effectiveFeatureFlags).filter(Boolean).length,
  persistedPlans: 0,
  runtimeWrites: 0,
  legacyMutations: 0
}));
