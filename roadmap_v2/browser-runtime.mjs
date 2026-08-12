const MANIFEST_SCHEMA = "BAUMAN_ROADMAP_V2_RUNTIME_MANIFEST_V1";
const RESULT_SCHEMA = "BAUMAN_ROADMAP_V2_BROWSER_PROJECTION_V1";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}

function toHex(bytes) {
  return [...new Uint8Array(bytes)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

async function sha256(bytes) {
  assert(globalThis.crypto?.subtle, "Web Crypto SHA-256 is unavailable");
  return toHex(await globalThis.crypto.subtle.digest("SHA-256", bytes));
}

async function fetchBytes(url, fetchImpl) {
  const response = await fetchImpl(url, { cache: "no-store", credentials: "same-origin" });
  assert(response?.ok === true, `Roadmap browser fetch failed: ${url}`);
  return new Uint8Array(await response.arrayBuffer());
}

function parseJson(bytes, label) {
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new Error(`Invalid Roadmap browser JSON: ${label}`);
  }
}

async function fetchPinned(baseUrl, descriptor, label, fetchImpl) {
  assert(descriptor && typeof descriptor.path === "string" && !descriptor.path.startsWith("/"), `Invalid browser descriptor: ${label}`);
  const url = new URL(descriptor.path, baseUrl);
  assert(url.origin === baseUrl.origin, `Browser descriptor escapes origin: ${label}`);
  const bytes = await fetchBytes(url, fetchImpl);
  assert(bytes.byteLength === descriptor.bytes, `Roadmap browser byte count mismatch: ${descriptor.path}`);
  assert(await sha256(bytes) === descriptor.sha256, `Roadmap browser hash mismatch: ${descriptor.path}`);
  return parseJson(bytes, label);
}

export async function loadRoadmapCoreProjection(options = {}) {
  const baseUrl = new URL(options.baseUrl || new URL("./", import.meta.url));
  const fetchImpl = options.fetchImpl || globalThis.fetch?.bind(globalThis);
  assert(typeof fetchImpl === "function", "Roadmap browser fetch is unavailable");

  const manifestBytes = await fetchBytes(new URL("runtime/manifest.json", baseUrl), fetchImpl);
  const manifest = parseJson(manifestBytes, "runtime manifest");
  assert(manifest.schema === MANIFEST_SCHEMA, "Unsupported Roadmap Runtime manifest schema");
  assert(manifest.status === "PASS_B114_BROWSER_READ_ONLY_CORE_PROJECTION_BRIDGE", "Roadmap Runtime manifest is not B114 PASS");
  assert(manifest.mode === "browser_read_only_core_projection_bridge", "Roadmap Runtime is not read-only core projection");
  assert(manifest.defaultActivation === "disabled", "Roadmap Runtime default activation drift");
  assert(manifest.productionIntegration === "connected_default_off", "Roadmap Runtime connection mode drift");

  const contract = await fetchPinned(baseUrl, manifest.files.runtimeContract, "runtime contract", fetchImpl);
  const integrationManifest = await fetchPinned(baseUrl, manifest.upstream.integrationManifest, "integration manifest", fetchImpl);
  const sidecarManifest = await fetchPinned(baseUrl, manifest.upstream.sidecarManifest, "sidecar manifest", fetchImpl);
  assert(contract.schema === "BAUMAN_ROADMAP_V2_RUNTIME_BRIDGE_CONTRACT_V1", "Roadmap browser/runtime contract mismatch");
  assert(contract.baselineCommit === manifest.baselineCommit, "Roadmap browser baseline mismatch");
  assert(integrationManifest.schema === contract.upstreamSchemas.integrationManifest, "Roadmap browser Integration schema mismatch");
  assert(sidecarManifest.schema === "BAUMAN_ROADMAP_V2_SIDECAR_MANIFEST_V1", "Roadmap browser sidecar schema mismatch");
  assert(integrationManifest.productionIntegration === "disconnected", "Roadmap browser upstream Integration boundary is open");
  assert(sidecarManifest.mode === "read_only_sidecar", "Roadmap browser sidecar is not read-only");

  const registry = await fetchPinned(baseUrl, sidecarManifest.files.registry, "registry", fetchImpl);
  const graph = await fetchPinned(baseUrl, sidecarManifest.files.prerequisiteGraph, "prerequisite graph", fetchImpl);
  assert(registry.schema === "BAUMAN_ROADMAP_V2_SYLLABUS_REGISTRY_V1", "Roadmap browser Registry schema mismatch");
  assert(graph.schema === "BAUMAN_ROADMAP_V2_PREREQUISITE_GRAPH_V1", "Roadmap browser Graph schema mismatch");
  assert(sidecarManifest.counts.courses === 10 && sidecarManifest.counts.chapters === 85 && sidecarManifest.counts.numberedLessons === 304, "Roadmap browser Registry counts drift");
  assert(graph.counts.nodes === 450 && graph.counts.prerequisiteEdges === 185, "Roadmap browser Graph counts drift");

  return deepFreeze({
    schema: RESULT_SCHEMA,
    status: "ready_read_only_core_projection",
    baselineCommit: manifest.baselineCommit,
    counts: {
      courses: sidecarManifest.counts.courses,
      chapters: sidecarManifest.counts.chapters,
      numberedLessons: sidecarManifest.counts.numberedLessons,
      graphNodes: graph.counts.nodes,
      prerequisiteEdges: graph.counts.prerequisiteEdges
    },
    registry,
    prerequisiteGraph: graph,
    persisted: false,
    domMutated: false,
    runtimeWriteAllowed: false,
    legacyMutationAllowed: false
  });
}

export const roadmapBrowserRuntime = Object.freeze({
  schema: MANIFEST_SCHEMA,
  resultSchema: RESULT_SCHEMA,
  loadRoadmapCoreProjection
});
