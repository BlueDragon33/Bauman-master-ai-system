import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import {
  bootstrapRoadmapV2Bridge,
  resolveRoadmapV2Flags
} from "../subjects/math/assets/roadmap-v2-bridge.mjs";
import { loadRoadmapCoreProjection } from "../roadmap_v2/browser-runtime.mjs";

const flagNames = ["roadmapCoreProjection", "diagnosticRuntime", "evidencePersistence", "priorityScheduler", "readinessDashboard"];
const allOff = () => Object.fromEntries(flagNames.map((name) => [name, false]));
const encode = (value) => new TextEncoder().encode(`${JSON.stringify(value, null, 2)}\n`);
const descriptor = (path, bytes) => ({ path, bytes: bytes.byteLength, sha256: crypto.createHash("sha256").update(bytes).digest("hex") });

function fixture(options = {}) {
  const contractBytes = fs.readFileSync("roadmap_v2/runtime/runtime-bridge-contract.json");
  const integrationBytes = fs.readFileSync("roadmap_v2/integration/manifest.json");
  const runtimeManifest = JSON.parse(fs.readFileSync("roadmap_v2/runtime/manifest.json", "utf8"));
  const sidecar = JSON.parse(fs.readFileSync("roadmap_v2/manifest.json", "utf8"));
  const registryBytes = encode({ schema: "BAUMAN_ROADMAP_V2_SYLLABUS_REGISTRY_V1", version: 2, courses: [] });
  const graphBytes = encode({ schema: "BAUMAN_ROADMAP_V2_PREREQUISITE_GRAPH_V1", version: 1, counts: { nodes: 450, prerequisiteEdges: 185 }, nodes: [], prerequisiteEdges: [] });
  sidecar.files.registry = descriptor("data/registry.json", registryBytes);
  sidecar.files.prerequisiteGraph = descriptor("data/prerequisiteGraph.json", graphBytes);
  const sidecarBytes = encode(sidecar);
  runtimeManifest.upstream.integrationManifest = descriptor("integration/manifest.json", integrationBytes);
  runtimeManifest.upstream.sidecarManifest = descriptor("manifest.json", sidecarBytes);
  runtimeManifest.files.runtimeContract = descriptor("runtime/runtime-bridge-contract.json", contractBytes);
  const runtimeManifestBytes = encode(runtimeManifest);
  const files = new Map([
    ["runtime/manifest.json", runtimeManifestBytes],
    ["runtime/runtime-bridge-contract.json", contractBytes],
    ["integration/manifest.json", integrationBytes],
    ["manifest.json", sidecarBytes],
    ["data/registry.json", registryBytes],
    ["data/prerequisiteGraph.json", graphBytes]
  ]);
  if (options.tamper) files.set(options.tamper, new TextEncoder().encode("{}\n"));
  if (options.missing) files.delete(options.missing);
  const requests = [];
  const baseUrl = new URL("https://roadmap.test/roadmap_v2/");
  const fetchImpl = async (input) => {
    const url = new URL(input);
    const relative = url.pathname.slice(baseUrl.pathname.length);
    requests.push(relative);
    if (!files.has(relative)) return new Response("missing", { status: 404 });
    return new Response(files.get(relative), { status: 200 });
  };
  return { baseUrl, fetchImpl, requests };
}

test("pins the B114 connected-default-OFF Runtime manifest", () => {
  const manifest = JSON.parse(fs.readFileSync("roadmap_v2/runtime/manifest.json", "utf8"));
  assert.equal(manifest.status, "PASS_B114_BROWSER_READ_ONLY_CORE_PROJECTION_BRIDGE");
  assert.equal(manifest.productionIntegration, "connected_default_off");
  assert.equal(manifest.counts.featureFlags, 5);
  assert.equal(manifest.counts.defaultOffFlags, 5);
  assert.equal(manifest.counts.runtimeWrites, 0);
});

test("resolves an absent flag object to the safe default", () => {
  const result = resolveRoadmapV2Flags(undefined);
  assert.equal(result.valid, true);
  assert.equal(result.reason, "DEFAULT_OFF");
  assert.deepEqual(result.flags, allOff());
});

test("accepts an explicit all-OFF flag object", () => {
  const result = resolveRoadmapV2Flags(allOff());
  assert.equal(result.valid, true);
  assert.equal(result.reason, "EXPLICIT_ALL_OFF");
  assert.deepEqual(result.flags, allOff());
});

test("accepts only the L29 core projection capability", () => {
  const result = resolveRoadmapV2Flags({ ...allOff(), roadmapCoreProjection: true });
  assert.equal(result.valid, true);
  assert.equal(result.reason, "EXPLICIT_CORE_PROJECTION");
  assert.equal(result.flags.roadmapCoreProjection, true);
});

test("fails closed for unknown and non-boolean flags", () => {
  const unknown = resolveRoadmapV2Flags({ ...allOff(), bypass: true });
  assert.equal(unknown.valid, false);
  assert.equal(unknown.reason, "UNKNOWN_FLAG");
  assert.deepEqual(unknown.flags, allOff());
  const invalid = resolveRoadmapV2Flags({ ...allOff(), roadmapCoreProjection: "true" });
  assert.equal(invalid.valid, false);
  assert.equal(invalid.reason, "NON_BOOLEAN_FLAG");
  assert.deepEqual(invalid.flags, allOff());
});

test("fails closed for invalid flag containers", () => {
  for (const value of [null, true, [], "flags"]) {
    const result = resolveRoadmapV2Flags(value);
    assert.equal(result.valid, false);
    assert.equal(result.reason, "INVALID_FLAG_OBJECT");
    assert.deepEqual(result.flags, allOff());
  }
});

test("fails closed when an unavailable L29 capability is requested", () => {
  for (const flag of flagNames.slice(1)) {
    const result = resolveRoadmapV2Flags({ ...allOff(), [flag]: true });
    assert.equal(result.valid, false);
    assert.equal(result.reason, "L29_CAPABILITY_NOT_AVAILABLE");
    assert.deepEqual(result.flags, allOff());
  }
});

test("default-OFF bootstrap makes no projection request", async () => {
  let calls = 0;
  const result = await bootstrapRoadmapV2Bridge({ flags: undefined, publish: false, loadProjection: async () => { calls += 1; } });
  assert.equal(result.status, "disabled_default_off");
  assert.equal(calls, 0);
  assert.equal(result.projection, null);
});

test("invalid flags never call the projection loader", async () => {
  let calls = 0;
  const result = await bootstrapRoadmapV2Bridge({ flags: { hidden: true }, publish: false, loadProjection: async () => { calls += 1; } });
  assert.equal(result.status, "blocked_fail_closed");
  assert.equal(calls, 0);
  assert.deepEqual(result.effectiveFeatureFlags, allOff());
});

test("explicit core flag exposes only a read-only projection", async () => {
  const projection = Object.freeze({ status: "ready_read_only_core_projection", persisted: false, domMutated: false });
  const result = await bootstrapRoadmapV2Bridge({
    flags: { ...allOff(), roadmapCoreProjection: true },
    publish: false,
    loadProjection: async () => projection
  });
  assert.equal(result.status, "ready_read_only_core_projection");
  assert.equal(result.projection, projection);
  assert.equal(result.runtimeWriteAllowed, false);
  assert.equal(result.legacyMutationAllowed, false);
});

test("projection load failure disables every flag", async () => {
  const result = await bootstrapRoadmapV2Bridge({
    flags: { ...allOff(), roadmapCoreProjection: true },
    publish: false,
    loadProjection: async () => { throw new TypeError("fixture failure"); }
  });
  assert.equal(result.status, "failed_closed");
  assert.equal(result.reasonCode, "CORE_PROJECTION_LOAD_FAILED");
  assert.equal(result.errorName, "TypeError");
  assert.deepEqual(result.effectiveFeatureFlags, allOff());
});

test("loads hash-pinned Registry and Graph into a deeply frozen projection", async () => {
  const fx = fixture();
  const result = await loadRoadmapCoreProjection(fx);
  assert.equal(result.status, "ready_read_only_core_projection");
  assert.deepEqual(result.counts, { courses: 10, chapters: 85, numberedLessons: 304, graphNodes: 450, prerequisiteEdges: 185 });
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.registry), true);
  assert.equal(Object.isFrozen(result.prerequisiteGraph), true);
  assert.deepEqual(fx.requests, ["runtime/manifest.json", "runtime/runtime-bridge-contract.json", "integration/manifest.json", "manifest.json", "data/registry.json", "data/prerequisiteGraph.json"]);
});

test("browser projection is deterministic and non-persisted", async () => {
  const first = await loadRoadmapCoreProjection(fixture());
  const second = await loadRoadmapCoreProjection(fixture());
  assert.deepEqual(first, second);
  assert.equal(first.persisted, false);
  assert.equal(first.domMutated, false);
  assert.equal(first.runtimeWriteAllowed, false);
  assert.equal(first.legacyMutationAllowed, false);
});

test("browser projection rejects a tampered pinned payload", async () => {
  await assert.rejects(() => loadRoadmapCoreProjection(fixture({ tamper: "data/prerequisiteGraph.json" })), /byte count mismatch|hash mismatch/);
});

test("browser projection fails closed when a pinned payload is missing", async () => {
  await assert.rejects(() => loadRoadmapCoreProjection(fixture({ missing: "data/registry.json" })), /browser fetch failed/);
});
