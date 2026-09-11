import fs from "node:fs";
import crypto from "node:crypto";

const registryPath = "roadmap_v2/registry/roadmap-v2.registry.json";
const graphPath = "roadmap_v2/graph/prerequisite-graph.json";
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const registry = readJson(registryPath);
const graph = readJson(graphPath);
const chapters = registry.courses.flatMap((course) => course.levels.flatMap((level) => level.chapters));
const lessons = chapters.flatMap((chapter) => chapter.lessons);
const chapterById = new Map(chapters.map((item) => [item.id, item]));
const lessonById = new Map(lessons.map((item) => [item.id, item]));
const resolutionById = new Map(graph.resolutions.map((item) => [item.chapterId, item]));
const nodeIds = graph.nodes.map((item) => item.id);
const nodeSet = new Set(nodeIds);

assert(graph.schema === "BAUMAN_ROADMAP_V2_PREREQUISITE_GRAPH_V1", "graph schema drift");
assert(graph.source.registrySha256 === sha256(registryPath), "graph registry SHA-256 mismatch");
assert(registry.source.prerequisiteGraphStatus === "resolved_pass", "registry graph status is not resolved_pass");
assert(graph.counts.nodes === 450, "expected 450 total graph nodes");
assert(graph.counts.courseNodes === 10 && graph.counts.levelNodes === 36, "course/level node counts drift");
assert(graph.counts.chapterNodes === 85 && graph.counts.lessonNodes === 304, "chapter/lesson node counts drift");
assert(graph.counts.externalGateNodes === 15, "external gate node count drift");
assert(graph.counts.hierarchyEdges === 425 && graph.counts.prerequisiteEdges === 185, "edge counts drift");
assert(nodeSet.size === nodeIds.length, "graph node IDs are not unique");
assert(graph.resolutions.length === 85 && resolutionById.size === 85, "resolution count drift");
assert(graph.topologicalChapterOrder.length === 85 && new Set(graph.topologicalChapterOrder).size === 85, "topological order is incomplete");
assert(graph.validation.unresolvedResiduals.length === 0, "unresolved prerequisite text remains");
assert(graph.validation.missingRefs.length === 0, "missing prerequisite refs remain");
assert(graph.validation.selfRefs.length === 0, "self prerequisite refs remain");
assert(graph.validation.duplicateEdgeKeys.length === 0, "duplicate prerequisite edges remain");
assert(graph.validation.cycleNodes.length === 0, "cached validation reports a prerequisite cycle");

for (const edge of [...graph.hierarchyEdges, ...graph.prerequisiteEdges]) {
  assert(nodeSet.has(edge.from), `edge source node missing: ${edge.from}`);
  assert(nodeSet.has(edge.to), `edge target node missing: ${edge.to}`);
}
const edgeKeys = graph.prerequisiteEdges.map((edge) => `${edge.from}|${edge.to}|${edge.type}|${edge.logic}`);
assert(new Set(edgeKeys).size === edgeKeys.length, "recomputed duplicate prerequisite edges");
assert(graph.prerequisiteEdges.length === graph.resolutions.reduce((sum, item) => sum + item.refs.length + item.externalGateIds.length, 0), "resolution-to-edge coverage mismatch");

for (const chapter of chapters) {
  const resolution = resolutionById.get(chapter.id);
  assert(resolution, `missing resolution: ${chapter.id}`);
  assert(chapter.prerequisites.resolutionStatus === "resolved_pass", `chapter prerequisite unresolved: ${chapter.id}`);
  assert(JSON.stringify(chapter.prerequisites.refs) === JSON.stringify(resolution.refs), `chapter refs differ from graph: ${chapter.id}`);
  assert(JSON.stringify(chapter.prerequisites.externalGateIds) === JSON.stringify(resolution.externalGateIds), `chapter gates differ from graph: ${chapter.id}`);
  for (const lesson of chapter.lessons) {
    assert(JSON.stringify(lesson.prerequisites) === JSON.stringify(chapter.prerequisites), `lesson prerequisite inheritance drift: ${lesson.id}`);
  }
}

const sourceChapter = (id) => chapterById.has(id) ? id : lessonById.get(id)?.id ? lessonById.get(id).id.replace(/-L\d{2}$/, "") : null;
const adjacency = new Map(chapters.map((item) => [item.id, new Set()]));
const indegree = new Map(chapters.map((item) => [item.id, 0]));
for (const edge of graph.prerequisiteEdges) {
  if (!new Set(["blocking", "just_in_time", "concurrent", "alternative"]).has(edge.type)) continue;
  const from = sourceChapter(edge.from);
  if (!from || from === edge.to) continue;
  assert(adjacency.has(from) && indegree.has(edge.to), `chapter adjacency endpoint missing: ${from} -> ${edge.to}`);
  if (!adjacency.get(from).has(edge.to)) {
    adjacency.get(from).add(edge.to);
    indegree.set(edge.to, indegree.get(edge.to) + 1);
  }
}
const queue = [...chapters.map((item) => item.id).filter((id) => indegree.get(id) === 0)].sort();
const recomputedTopological = [];
while (queue.length) {
  const id = queue.shift();
  recomputedTopological.push(id);
  for (const next of [...adjacency.get(id)].sort()) {
    indegree.set(next, indegree.get(next) - 1);
    if (indegree.get(next) === 0) {
      queue.push(next);
      queue.sort();
    }
  }
}
assert(recomputedTopological.length === 85, "independent topological sort found a cycle");
assert(JSON.stringify(recomputedTopological) === JSON.stringify(graph.topologicalChapterOrder), "topological order is not deterministic");

const c07 = resolutionById.get("MATH-L2-C07");
assert(JSON.stringify(c07.refs) === JSON.stringify(["MATH-L2-C05", "MATH-L2-C06", "MATH-L1-C03"]), "MATH-L2-C07 prerequisite expansion drift");
const mathEntry = resolutionById.get("MATH-L0-C02");
assert(mathEntry.modifiers.logic === "any_of", "MATH-L0-C02 alternative logic lost");
const mathEntryEdges = graph.prerequisiteEdges.filter((edge) => edge.to === "MATH-L0-C02");
assert(mathEntryEdges.length === 2 && mathEntryEdges.every((edge) => edge.logic === "any_of"), "MATH-L0-C02 alternative edges are incomplete");
assert(mathEntryEdges.some((edge) => edge.type === "alternative" && edge.from === "EXT-EXISTING-COMPETENCY-CONFIRMED"), "Existing Competency alternative gate lost");
assert(graph.acceptance.step === 75 && graph.acceptance.result === "PASS", "Step 75 acceptance is not PASS");
assert(graph.acceptance.priorityEngineActivated === false && graph.acceptance.runtimeModified === false, "Step 75 crossed its activation/runtime boundary");

console.log(JSON.stringify({
  step: 75,
  result: "PASS",
  registrySha256: graph.source.registrySha256,
  nodes: graph.counts.nodes,
  hierarchyEdges: graph.counts.hierarchyEdges,
  prerequisiteEdges: graph.counts.prerequisiteEdges,
  resolutions: graph.resolutions.length,
  topologicalChapters: recomputedTopological.length,
  priorityEngineActivated: false,
  runtimeModified: false
}, null, 2));
