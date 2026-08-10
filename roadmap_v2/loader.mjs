import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const defaultBaseDir = path.dirname(fileURLToPath(import.meta.url));

function readJson(file) {
  const bytes = fs.readFileSync(file);
  return { bytes, value: JSON.parse(bytes.toString("utf8")) };
}

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function appendIndex(index, key, value) {
  if (!key) return;
  if (!index.has(key)) index.set(key, []);
  index.get(key).push(value);
}

export function loadRoadmapSidecar(options = {}) {
  const baseDir = path.resolve(options.baseDir || defaultBaseDir);
  const manifestFile = path.join(baseDir, "manifest.json");
  const { value: manifest } = readJson(manifestFile);
  assert(manifest.schema === "BAUMAN_ROADMAP_V2_SIDECAR_MANIFEST_V1", "Unsupported Roadmap sidecar manifest schema");
  assert(manifest.mode === "read_only_sidecar", "Roadmap sidecar is not read-only");
  assert(manifest.productionIntegration === "disconnected", "Roadmap sidecar production boundary is not locked");
  assert(manifest.canonicalSourcesOnly === true, "Roadmap sidecar is not built from canonical sources");

  const datasets = {};
  for (const [id, descriptor] of Object.entries(manifest.files || {})) {
    assert(typeof descriptor.path === "string" && descriptor.path.startsWith("data/"), `Invalid sidecar path for ${id}`);
    const file = path.resolve(baseDir, descriptor.path);
    assert(file.startsWith(`${baseDir}${path.sep}`), `Sidecar path escapes package: ${descriptor.path}`);
    assert(fs.existsSync(file), `Missing Roadmap sidecar file: ${descriptor.path}`);
    const loaded = readJson(file);
    assert(sha256(loaded.bytes) === descriptor.sha256, `Roadmap sidecar hash mismatch: ${descriptor.path}`);
    datasets[id] = loaded.value;
  }

  const registry = datasets.registry;
  const graph = datasets.prerequisiteGraph;
  const mapping = datasets.mappingReport;
  const contract = datasets.migrationContract;
  assert(registry?.schema === "BAUMAN_ROADMAP_V2_SYLLABUS_REGISTRY_V1", "Invalid registry dataset");
  assert(graph?.schema === "BAUMAN_ROADMAP_V2_PREREQUISITE_GRAPH_V1", "Invalid prerequisite graph dataset");
  assert(mapping?.schema === "BAUMAN_ROADMAP_V2_LEGACY_MAPPING_V2", "Invalid mapping dataset");
  assert(contract?.schema === "BAUMAN_ROADMAP_V2_MIGRATION_CONTRACT_V2", "Invalid migration contract dataset");
  assert(registry.counts.chapters === manifest.counts.chapters, "Manifest/registry chapter count mismatch");
  assert(registry.counts.numberedLessons === manifest.counts.numberedLessons, "Manifest/registry lesson count mismatch");
  assert(mapping.legacyLessonMappings.length === manifest.counts.legacyLessonsInventoried, "Manifest/mapping inventory count mismatch");
  assert(mapping.validation.exactLegacyLessonMappingsVerified === manifest.counts.exactLegacyLessonMappingsVerified, "Manifest/mapping exact-ref count mismatch");
  assert(graph.validation.cycleNodes.length === 0, "Roadmap graph contains a prerequisite cycle");
  assert(mapping.validation.priorityEngineEligibleLegacyRecords === 0, "Roadmap sidecar contains prematurely eligible legacy records");

  const courses = registry.courses;
  const chapters = courses.flatMap((course) => course.levels.flatMap((level) => level.chapters));
  const lessons = chapters.flatMap((chapter) => chapter.lessons);
  const courseById = new Map(courses.map((item) => [item.id, item]));
  const chapterById = new Map(chapters.map((item) => [item.id, item]));
  const lessonById = new Map(lessons.map((item) => [item.id, item]));
  const graphNodeById = new Map(graph.nodes.map((item) => [item.id, item]));
  const prerequisitesByNodeId = new Map();
  const dependentsByNodeId = new Map();
  const externalGatesByNodeId = new Map();
  for (const edge of graph.prerequisiteEdges) {
    appendIndex(prerequisitesByNodeId, edge.to, edge);
    appendIndex(dependentsByNodeId, edge.from, edge);
    if (graphNodeById.get(edge.from)?.type === "external_gate") appendIndex(externalGatesByNodeId, edge.to, edge);
  }

  const authoritativeByTarget = new Map();
  const overlaysByTarget = new Map();
  const frameworkByTarget = new Map();
  for (const item of mapping.legacyLessonMappings) {
    for (const targetChapterId of item.targetChapterIds || []) appendIndex(authoritativeByTarget, targetChapterId, item);
  }
  for (const item of mapping.overlayMappings) appendIndex(overlaysByTarget, item.targetChapterId, item);
  for (const item of mapping.frameworkMappings) {
    for (const targetChapterId of item.candidateTargetChapterIds || []) appendIndex(frameworkByTarget, targetChapterId, item);
  }

  const frozen = deepFreeze({ manifest, registry, graph, mapping, contract });
  const cloneList = (list) => deepFreeze([...list]);
  const getMapping = (targetChapterId) => deepFreeze({
    targetChapterId,
    authoritativeLegacyLessons: [...(authoritativeByTarget.get(targetChapterId) || [])],
    runtimeTheoryOverlays: [...(overlaysByTarget.get(targetChapterId) || [])],
    frameworkOutlineCandidates: [...(frameworkByTarget.get(targetChapterId) || [])]
  });
  const api = {
    ...frozen,
    getNode: (id) => graphNodeById.get(id) || null,
    getCourse: (id) => courseById.get(id) || null,
    getChapter: (id) => chapterById.get(id) || null,
    getLesson: (id) => lessonById.get(id) || null,
    getMapping,
    getMappings: getMapping,
    getAuthoritativeLegacyLessons: (id) => cloneList(authoritativeByTarget.get(id) || []),
    getPrerequisites: (id, options = {}) => cloneList(
      (prerequisitesByNodeId.get(id) || []).filter((edge) => options.includeRecommended !== false || edge.type !== "recommended")
    ),
    getDependents: (id) => cloneList(dependentsByNodeId.get(id) || []),
    getExternalGates: (id) => cloneList(externalGatesByNodeId.get(id) || []),
    hasNode: (id) => graphNodeById.has(id)
  };
  return Object.freeze(api);
}
