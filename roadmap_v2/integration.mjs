import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const defaultBaseDir = path.dirname(fileURLToPath(import.meta.url));

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}

function cloneFrozen(value) {
  return deepFreeze(structuredClone(value));
}

function readJson(file) {
  const bytes = fs.readFileSync(file);
  return { bytes, value: JSON.parse(bytes.toString("utf8")) };
}

function resolvePinned(baseDir, descriptor, id) {
  assert(typeof descriptor?.path === "string" && !path.isAbsolute(descriptor.path), `Invalid Integration path for ${id}`);
  const file = path.resolve(baseDir, descriptor.path);
  assert(file.startsWith(`${baseDir}${path.sep}`), `Integration path escapes package: ${descriptor.path}`);
  assert(fs.existsSync(file), `Missing Roadmap Integration file: ${descriptor.path}`);
  const bytes = fs.readFileSync(file);
  assert(bytes.length === descriptor.bytes, `Roadmap Integration byte count mismatch: ${descriptor.path}`);
  assert(sha256(bytes) === descriptor.sha256, `Roadmap Integration hash mismatch: ${descriptor.path}`);
  return { file, bytes };
}

function pinnedJson(baseDir, descriptor, id) {
  return JSON.parse(resolvePinned(baseDir, descriptor, id).bytes.toString("utf8"));
}

function assertKeys(value, allowed, label) {
  const unexpected = Object.keys(value).filter((key) => !allowed.has(key));
  assert(unexpected.length === 0, `${label} contains unsupported fields: ${unexpected.join(", ")}`);
}

function unique(values) {
  return [...new Set(values)];
}

export function loadRoadmapIntegration(options = {}) {
  const baseDir = path.resolve(options.baseDir || defaultBaseDir);
  const manifest = readJson(path.join(baseDir, "integration", "manifest.json")).value;
  assert(manifest.schema === "BAUMAN_ROADMAP_V2_INTEGRATION_MANIFEST_V1", "Unsupported Roadmap Integration manifest schema");
  assert(manifest.status === "PASS_B110_FAIL_CLOSED_ACTIVATION_PLANNING_HARNESS", "Roadmap Integration manifest is not B110 PASS");
  assert(manifest.mode === "read_only_activation_planning_harness", "Roadmap Integration is not read-only activation planning");
  assert(manifest.productionIntegration === "disconnected", "Roadmap Integration production boundary is not locked");

  const diagnosticManifest = pinnedJson(baseDir, manifest.upstream.diagnosticManifest, "diagnosticManifest");
  const readinessManifest = pinnedJson(baseDir, manifest.upstream.readinessManifest, "readinessManifest");
  const contract = pinnedJson(baseDir, manifest.files.integrationContract, "integrationContract");
  const contractSchema = pinnedJson(baseDir, manifest.files.integrationContractSchema, "integrationContractSchema");
  const requestSchema = pinnedJson(baseDir, manifest.files.activationRequestSchema, "activationRequestSchema");
  const planSchema = pinnedJson(baseDir, manifest.files.activationPlanSchema, "activationPlanSchema");
  resolvePinned(baseDir, manifest.files.integrationEngine, "integrationEngine");

  assert(contractSchema.$id === contract.schema, "Integration contract/schema identity mismatch");
  assert(requestSchema.$id === "BAUMAN_ROADMAP_V2_ACTIVATION_REQUEST_V1", "Activation request schema mismatch");
  assert(planSchema.$id === "BAUMAN_ROADMAP_V2_ACTIVATION_PLAN_V1", "Activation plan schema mismatch");
  assert(diagnosticManifest.schema === contract.upstreamSchemas.diagnosticManifest, "Integration/Diagnostic schema mismatch");
  assert(readinessManifest.schema === contract.upstreamSchemas.readinessManifest, "Integration/Readiness schema mismatch");
  assert(diagnosticManifest.productionIntegration === "disconnected", "Diagnostic is not disconnected");
  assert(readinessManifest.productionIntegration === "disconnected", "Readiness is not disconnected");
  assert(contract.activationPolicy.activationAllowedInL28 === false, "L28 activation policy is unsafe");

  const flagNames = Object.keys(contract.featureFlags);
  const requestKeys = new Set([
    "schema",
    "planId",
    "baselineCommit",
    "requestedFeatureFlags",
    "source",
    "protectedFingerprintStatus",
    "rollbackVerified"
  ]);
  const sourceKeys = new Set(["ref", "verified"]);

  const validateRequest = (input) => {
    assert(input && typeof input === "object" && !Array.isArray(input), "Invalid Activation request");
    assertKeys(input, requestKeys, "Activation request");
    assert(input.schema === requestSchema.$id, "Activation request schema mismatch");
    assert(typeof input.planId === "string" && input.planId.trim(), "Missing Activation plan ID");
    assert(input.baselineCommit === contract.baselineCommit, "Activation baseline commit mismatch");
    assert(input.requestedFeatureFlags && typeof input.requestedFeatureFlags === "object" && !Array.isArray(input.requestedFeatureFlags), "Missing Activation feature flags");
    assertKeys(input.requestedFeatureFlags, new Set(flagNames), "Activation feature flags");
    assert(Object.keys(input.requestedFeatureFlags).length === flagNames.length, "Activation request must specify every feature flag");
    for (const flag of flagNames) assert(typeof input.requestedFeatureFlags[flag] === "boolean", `Activation feature flag is not boolean: ${flag}`);
    assert(input.source && typeof input.source === "object" && !Array.isArray(input.source), "Missing Activation source");
    assertKeys(input.source, sourceKeys, "Activation source");
    assert(typeof input.source.ref === "string" && input.source.ref.trim(), "Missing Activation source ref");
    assert(input.source.verified === true, "Unverified Activation source");
    assert(input.protectedFingerprintStatus === "PASS", "Protected fingerprint gate is not PASS");
    assert(input.rollbackVerified === true, "Activation rollback gate is not verified");
    return cloneFrozen(input);
  };

  const planActivation = (input) => {
    const request = validateRequest(input);
    const enabled = flagNames.filter((flag) => request.requestedFeatureFlags[flag]);
    const effectiveFeatureFlags = Object.fromEntries(flagNames.map((flag) => [flag, false]));
    const reasons = [];

    if (enabled.length === 0) {
      reasons.push("REQUESTED_FLAGS_ALL_OFF");
    } else {
      reasons.push("PRODUCTION_INTEGRATION_DISCONNECTED");
      if (request.requestedFeatureFlags.roadmapCoreProjection) reasons.push("RUNTIME_BRIDGE_NOT_IMPLEMENTED");
      if (request.requestedFeatureFlags.diagnosticRuntime && diagnosticManifest.counts.verifiedItemBanks === 0) reasons.push("DIAGNOSTIC_ITEM_BANKS_MISSING");
      if (request.requestedFeatureFlags.evidencePersistence) reasons.push("EVIDENCE_STORE_NOT_IMPLEMENTED");
      if (request.requestedFeatureFlags.priorityScheduler) reasons.push("LEGACY_MAPPING_REVIEW_INCOMPLETE");

      for (const flag of enabled) {
        const missingFeatureDependency = contract.featureFlags[flag].requires.some((dependency) =>
          Object.hasOwn(contract.featureFlags, dependency) && request.requestedFeatureFlags[dependency] !== true
        );
        if (missingFeatureDependency) reasons.push("DEPENDENCY_NOT_ENABLED");
      }
    }

    return deepFreeze({
      schema: planSchema.$id,
      planId: request.planId,
      decision: enabled.length === 0 ? "safe_noop" : "blocked",
      requestedFeatureFlags: structuredClone(request.requestedFeatureFlags),
      effectiveFeatureFlags,
      reasonCodes: unique(reasons),
      rollback: {
        strategy: contract.rollbackPolicy.strategy,
        allFlagsDisabled: true,
        legacyEntrypointsPreserved: true,
        dataRollbackRequired: false,
        verified: true
      },
      persisted: false,
      runtimeWriteAllowed: false,
      legacyMutationAllowed: false
    });
  };

  return deepFreeze({
    manifest,
    contract,
    diagnosticManifest,
    readinessManifest,
    requestSchema,
    planSchema,
    validateRequest,
    planActivation
  });
}
