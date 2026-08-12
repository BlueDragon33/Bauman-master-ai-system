import crypto from "node:crypto";
import fs from "node:fs";
import { loadRoadmapCoreProjection } from "../roadmap_v2/browser-runtime.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const baseUrl = new URL("https://roadmap.test/roadmap_v2/");
const encode = (value) => new TextEncoder().encode(`${JSON.stringify(value, null, 2)}\n`);
const descriptor = (path, bytes) => ({ path, bytes: bytes.byteLength, sha256: crypto.createHash("sha256").update(bytes).digest("hex") });

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
const fixtures = new Map([
  ["runtime/manifest.json", runtimeManifestBytes],
  ["runtime/runtime-bridge-contract.json", contractBytes],
  ["integration/manifest.json", integrationBytes],
  ["manifest.json", sidecarBytes],
  ["data/registry.json", registryBytes],
  ["data/prerequisiteGraph.json", graphBytes]
]);
const fetches = [];
const fetchImpl = async (input) => {
  const url = new URL(input);
  assert(url.origin === baseUrl.origin && url.pathname.startsWith(baseUrl.pathname), `Unexpected Runtime Bridge URL: ${url}`);
  const relative = url.pathname.slice(baseUrl.pathname.length);
  assert(fixtures.has(relative), `Missing Runtime Bridge fixture: ${relative}`);
  fetches.push(relative);
  return new Response(fixtures.get(relative), { status: 200 });
};

const result = await loadRoadmapCoreProjection({ baseUrl, fetchImpl });
assert(result.status === "ready_read_only_core_projection", "Browser core projection is not ready");
assert(result.counts.courses === 10 && result.counts.chapters === 85 && result.counts.numberedLessons === 304, "Browser Registry counts drift");
assert(result.counts.graphNodes === 450 && result.counts.prerequisiteEdges === 185, "Browser Graph counts drift");
assert(Object.isFrozen(result) && Object.isFrozen(result.registry) && Object.isFrozen(result.prerequisiteGraph), "Browser core projection is mutable");
assert(result.persisted === false && result.domMutated === false && result.runtimeWriteAllowed === false && result.legacyMutationAllowed === false, "Browser core projection escaped read-only boundary");
assert(fetches.length === 6, `Unexpected Browser core projection fetch count: ${fetches.length}`);

console.log(JSON.stringify({
  status: "PASS_B114_BROWSER_READ_ONLY_CORE_PROJECTION",
  fetches,
  counts: result.counts,
  persisted: false,
  domMutated: false,
  runtimeWrites: 0,
  legacyMutations: 0
}));
