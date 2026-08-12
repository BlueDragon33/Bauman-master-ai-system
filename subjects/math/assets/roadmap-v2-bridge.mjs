const flagNames = Object.freeze([
  "roadmapCoreProjection",
  "diagnosticRuntime",
  "evidencePersistence",
  "priorityScheduler",
  "readinessDashboard"
]);
const allOff = () => Object.freeze(Object.fromEntries(flagNames.map((name) => [name, false])));

function freezeStatus(value) {
  return Object.freeze({
    schema: "BAUMAN_ROADMAP_V2_MATH_BRIDGE_STATUS_V1",
    persisted: false,
    domMutated: false,
    runtimeWriteAllowed: false,
    legacyMutationAllowed: false,
    ...value
  });
}

export function resolveRoadmapV2Flags(input) {
  if (input === undefined) return { valid: true, flags: allOff(), reason: "DEFAULT_OFF" };
  if (!input || typeof input !== "object" || Array.isArray(input)) return { valid: false, flags: allOff(), reason: "INVALID_FLAG_OBJECT" };
  const keys = Object.keys(input);
  if (keys.some((key) => !flagNames.includes(key))) return { valid: false, flags: allOff(), reason: "UNKNOWN_FLAG" };
  if (keys.some((key) => typeof input[key] !== "boolean")) return { valid: false, flags: allOff(), reason: "NON_BOOLEAN_FLAG" };
  const flags = Object.freeze(Object.fromEntries(flagNames.map((name) => [name, input[name] === true])));
  const unsupported = flagNames.slice(1).some((name) => flags[name]);
  if (unsupported) return { valid: false, flags: allOff(), reason: "L29_CAPABILITY_NOT_AVAILABLE" };
  return { valid: true, flags, reason: flags.roadmapCoreProjection ? "EXPLICIT_CORE_PROJECTION" : "EXPLICIT_ALL_OFF" };
}

export async function bootstrapRoadmapV2Bridge(options = {}) {
  const resolved = resolveRoadmapV2Flags(Object.hasOwn(options, "flags") ? options.flags : globalThis.__BAUMAN_ROADMAP_V2_FLAGS__);
  const publish = options.publish !== false;
  const publishStatus = (status) => {
    if (publish) globalThis.__BAUMAN_ROADMAP_V2_RUNTIME__ = status;
    return status;
  };
  if (!resolved.valid) {
    const status = freezeStatus({ status: "blocked_fail_closed", effectiveFeatureFlags: resolved.flags, reasonCode: resolved.reason, projection: null });
    return publishStatus(status);
  }
  if (!resolved.flags.roadmapCoreProjection) {
    const status = freezeStatus({ status: "disabled_default_off", effectiveFeatureFlags: resolved.flags, reasonCode: resolved.reason, projection: null });
    return publishStatus(status);
  }

  try {
    const loadProjection = options.loadProjection || (async () => {
      const runtime = await import("../../../roadmap_v2/browser-runtime.mjs");
      return runtime.loadRoadmapCoreProjection();
    });
    const projection = await loadProjection();
    const status = freezeStatus({ status: "ready_read_only_core_projection", effectiveFeatureFlags: resolved.flags, reasonCode: "CORE_PROJECTION_READY", projection });
    publishStatus(status);
    if (publish && typeof globalThis.CustomEvent === "function") globalThis.dispatchEvent?.(new CustomEvent("bauman:roadmap-v2-ready", { detail: { status: status.status } }));
    return status;
  } catch (error) {
    const status = freezeStatus({ status: "failed_closed", effectiveFeatureFlags: allOff(), reasonCode: "CORE_PROJECTION_LOAD_FAILED", errorName: error?.name || "Error", projection: null });
    return publishStatus(status);
  }
}

const ready = bootstrapRoadmapV2Bridge();
Object.defineProperty(globalThis, "__BAUMAN_ROADMAP_V2_READY__", {
  value: ready,
  enumerable: false,
  configurable: false,
  writable: false
});
