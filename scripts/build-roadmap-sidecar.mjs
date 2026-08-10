import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const outputRoot = path.resolve("roadmap_v2");
const dataRoot = path.join(outputRoot, "data");
const sources = {
  registry: "roadmap_v2/registry/roadmap-v2.registry.json",
  prerequisiteGraph: "roadmap_v2/graph/prerequisite-graph.json",
  mappingReport: "roadmap_v2/migration/legacy-to-roadmap-v2.mapping.json",
  migrationContract: "roadmap_v2/migration/migration-contract.json"
};

fs.mkdirSync(dataRoot, { recursive: true });
const files = {};
for (const [id, source] of Object.entries(sources)) {
  const bytes = fs.readFileSync(source);
  JSON.parse(bytes.toString("utf8"));
  const targetName = `${id}.json`;
  const target = path.join(dataRoot, targetName);
  fs.writeFileSync(target, bytes);
  files[id] = {
    path: `data/${targetName}`,
    source,
    bytes: bytes.length,
    sha256: crypto.createHash("sha256").update(bytes).digest("hex")
  };
}

const registry = JSON.parse(fs.readFileSync(sources.registry, "utf8"));
const graph = JSON.parse(fs.readFileSync(sources.prerequisiteGraph, "utf8"));
const mapping = JSON.parse(fs.readFileSync(sources.mappingReport, "utf8"));
const contract = JSON.parse(fs.readFileSync(sources.migrationContract, "utf8"));

if (registry.acceptance?.result !== "PASS") throw new Error("Canonical registry is not PASS");
if (graph.validation?.result !== "PASS") throw new Error("Canonical prerequisite graph is not PASS");
if (mapping.validation?.result !== "PASS_CONTRACT_ONLY") throw new Error("Canonical mapping is not PASS_CONTRACT_ONLY");
if (contract.acceptance?.result !== "PASS_CONTRACT_ONLY") throw new Error("Canonical migration contract is not PASS_CONTRACT_ONLY");

const manifest = {
  schema: "BAUMAN_ROADMAP_V2_SIDECAR_MANIFEST_V1",
  version: "2.1.0-l21-b81",
  status: "PASS_B81_PACKAGE",
  namespace: "roadmap_v2",
  mode: "read_only_sidecar",
  productionIntegration: "disconnected",
  baselineCommit: contract.immutableBaseline.commit,
  registryVersion: registry.version,
  graphVersion: graph.version,
  mappingVersion: mapping.version,
  contractVersion: contract.version,
  canonicalSourcesOnly: true,
  files,
  counts: {
    courses: registry.counts.courses,
    chapters: registry.counts.chapters,
    numberedLessons: registry.counts.numberedLessons,
    dynamicChapters: registry.counts.dynamicChapters,
    legacyPreserveChapters: registry.counts.legacyPreserveChapters,
    hierarchyEdges: graph.validation.hierarchyEdges,
    prerequisiteEdges: graph.validation.prerequisiteEdges,
    externalGateNodes: graph.validation.externalGateNodes,
    legacyLessonsInventoried: mapping.validation.legacyLessonsInventoried,
    exactLegacyLessonMappingsVerified: mapping.validation.exactLegacyLessonMappingsVerified,
    preservedLegacyLessonsUnmapped: mapping.validation.preservedLegacyLessonsUnmapped,
    frameworkOutlineCandidates: mapping.validation.frameworkCandidatesQuarantined,
    priorityEngineEligibleLegacyRecords: mapping.validation.priorityEngineEligibleLegacyRecords
  },
  immutability: {
    sourceFilesAreCopiedByteForByte: true,
    loaderReturnsDeepFrozenData: true,
    loaderWritesToLegacyRuntime: false,
    failClosedOnMissingOrHashMismatch: true,
    runtimeEntrypointsModified: false
  }
};

fs.writeFileSync(path.join(outputRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ status: manifest.status, files: Object.keys(files).length, counts: manifest.counts }));
