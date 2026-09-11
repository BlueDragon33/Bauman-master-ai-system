import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, "roadmap_v2/registry/roadmap-v2.registry.json");
const GRAPH_PATH = path.join(ROOT, "roadmap_v2/graph/prerequisite-graph.json");

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
if (registry.acceptance?.step !== 74 || registry.acceptance?.result !== "PASS") {
  throw new Error("Step 74 registry is not PASS");
}
if (registry.source?.sha256 !== "22b1bbbf900f2b0fb34db2d683944495dd3d34805ee28ac63de312a6ec648b5d") {
  throw new Error("Corrected syllabus source fingerprint drift");
}
const chapters = registry.courses.flatMap((course) =>
  course.levels.flatMap((level) =>
    level.chapters.map((chapter) => ({ ...chapter, courseId: course.id, levelId: level.id }))
  )
);
const lessons = chapters.flatMap((chapter) =>
  chapter.lessons.map((lesson) => ({ ...lesson, chapterId: chapter.id, courseId: chapter.courseId }))
);
const chapterById = new Map(chapters.map((item) => [item.id, item]));
const lessonById = new Map(lessons.map((item) => [item.id, item]));
const allNodeIds = new Set([...chapterById.keys(), ...lessonById.keys()]);

const externalGateDefinitions = [
  ["EXT-DIAGNOSTIC-ENTRY", /diagnostic đầu vào/gi, "diagnostic", "blocking"],
  ["EXT-TECH-CHAPTER-IN-PROGRESS", /chapter chuyên môn tương ứng đang học/gi, "contextual_current_lesson", "contextual"],
  ["EXT-COMPLETE-TECHNICAL-PROJECT", /một project kỹ thuật hoàn chỉnh/gi, "evidence", "blocking"],
  ["EXT-CURRENT-SYLLABUS-IMPORTED", /syllabus môn đã nhập vào Kho 09/gi, "external_artifact", "blocking"],
  ["EXT-NIR-TOPIC-RESEARCH-PLAN", /Kho 10 đã có topic và research plan/gi, "external_artifact", "blocking"],
  ["EXT-EXISTING-COMPETENCY-CONFIRMED", /Existing Competency xác nhận/gi, "existing_competency", "alternative"],
  ["EXT-EXISTING-SIGNAL-DIAGNOSED", /Existing Competency tín hiệu được chẩn đoán/gi, "existing_competency", "blocking"],
  ["EXT-EXISTING-CONTROL-AUTOMATION", /Existing Competency Control\/automation/gi, "existing_competency", "blocking"],
  ["EXT-EXISTING-SIGNAL", /Existing Competency signal/gi, "existing_competency", "blocking"],
  ["EXT-OFFICIAL-COURSE-SYLLABUS", /syllabus\/tài liệu chính thức của môn/gi, "external_artifact", "blocking"],
  ["EXT-REAL-WEEKLY-MATERIAL", /tài liệu tuần thật/gi, "external_artifact", "blocking"],
  ["EXT-RELATED-WEEKS-COMPLETE", /các tuần liên quan đã học/gi, "mastery_evidence", "blocking"],
  ["EXT-CURRENT-COURSE-COMPLETE", /hoàn thành môn/gi, "mastery_evidence", "blocking"],
  ["EXT-EXISTING-AUTOMATION-CONTROL", /Existing Competency automation\/control/gi, "existing_competency", "blocking"],
  ["EXT-RELATED-TECHNICAL-MODULE", /module kỹ thuật liên quan/gi, "contextual_current_lesson", "contextual"]
].map(([id, pattern, gateType, defaultEdgeType]) => ({ id, pattern, gateType, defaultEdgeType }));

const aliasDefinitions = [
  { id: "ALIAS-PYTHON-NUMPY-PANDAS", pattern: /Python NumPy\/Pandas/gi, refs: ["PY-L2-C04", "PY-L2-C05"], edgeType: "blocking" },
  { id: "ALIAS-PYTHON-BASIC-RECOMMENDED", pattern: /Python cơ bản được khuyến nghị/gi, refs: ["PY-L0-C01"], edgeType: "recommended" },
  { id: "ALIAS-PYTHON-L1", pattern: /Python L1/gi, refs: ["PY-L1-C03"], edgeType: "blocking" },
  { id: "ALIAS-PYTHON-L2", pattern: /Python L2/gi, refs: ["PY-L2-C06"], edgeType: "blocking" },
  { id: "ALIAS-PY-L2", pattern: /\bPY-L2\b(?!-C)/g, refs: ["PY-L2-C06"], edgeType: "blocking" },
  { id: "ALIAS-LINUX-L1", pattern: /Linux L1/gi, refs: ["SYS-L1-C03"], edgeType: "blocking" },
  { id: "ALIAS-BASIC-CALCULUS", pattern: /giải tích cơ bản/gi, refs: ["MATH-L0-C02"], edgeType: "blocking" }
];

function expandRange(prefix, start, end, suffix = "") {
  const a = Number(start);
  const b = Number(end);
  const width = start.length;
  const result = [];
  for (let value = a; value <= b; value += 1) {
    result.push(`${prefix}${String(value).padStart(width, "0")}${suffix}`);
  }
  return result;
}

function resolveRaw(raw, targetChapterId) {
  let residual = raw;
  const refs = [];
  const externalGateIds = [];
  const aliasEvidence = [];
  const referenceExpressions = [];

  residual = residual.replace(
    /([A-Z]+-(?:R|L)\d-C\d{2}-)L(\d{2})[–-]L(\d{2})/g,
    (full, prefix, start, end) => {
      const expanded = expandRange(prefix + "L", start, end);
      refs.push(...expanded);
      referenceExpressions.push({ raw: full, expanded });
      return " ";
    }
  );
  residual = residual.replace(
    /([A-Z]+-(?:R|L)\d-)C(\d{2})[–-]C(\d{2})/g,
    (full, prefix, start, end) => {
      const expanded = expandRange(prefix + "C", start, end);
      refs.push(...expanded);
      referenceExpressions.push({ raw: full, expanded });
      return " ";
    }
  );
  residual = residual.replace(
    /([A-Z]+)-(R|L)(\d)-C(\d{2})\/(R|L)(\d)-C(\d{2})/g,
    (full, prefix, typeA, levelA, chapterA, typeB, levelB, chapterB) => {
      const expanded = [
        `${prefix}-${typeA}${levelA}-C${chapterA}`,
        `${prefix}-${typeB}${levelB}-C${chapterB}`
      ];
      refs.push(...expanded);
      referenceExpressions.push({ raw: full, expanded });
      return " ";
    }
  );
  residual = residual.replace(/[A-Z]+-(?:R|L)\d-C\d{2}-L\d{2}/g, (full) => {
    refs.push(full);
    referenceExpressions.push({ raw: full, expanded: [full] });
    return " ";
  });
  residual = residual.replace(/[A-Z]+-(?:R|L)\d-C\d{2}/g, (full) => {
    refs.push(full);
    referenceExpressions.push({ raw: full, expanded: [full] });
    return " ";
  });

  for (const alias of aliasDefinitions) {
    alias.pattern.lastIndex = 0;
    if (alias.pattern.test(residual)) {
      alias.pattern.lastIndex = 0;
      residual = residual.replace(alias.pattern, " ");
      refs.push(...alias.refs);
      aliasEvidence.push({ aliasId: alias.id, refs: alias.refs, edgeType: alias.edgeType });
    }
  }
  for (const gate of externalGateDefinitions) {
    gate.pattern.lastIndex = 0;
    if (gate.pattern.test(residual)) {
      gate.pattern.lastIndex = 0;
      residual = residual.replace(gate.pattern, " ");
      externalGateIds.push(gate.id);
    }
  }

  const modifiers = {
    logic: /\bhoặc\b/i.test(raw) ? "any_of" : "all_of",
    concurrent: /đang song hành/i.test(raw),
    justInTime: /just-in-time/i.test(raw),
    recommended: /được khuyến nghị/i.test(raw)
  };
  residual = residual
    .replace(/\bE15\b/gi, " ")
    .replace(/đang song hành/gi, " ")
    .replace(/học just-in-time/gi, " ")
    .replace(/được khuyến nghị/gi, " ")
    .replace(/\b(?:không|hoặc|và)\b/gi, " ")
    .replace(/[;,.()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const uniqueRefs = [...new Set(refs)];
  const uniqueGates = [...new Set(externalGateIds)];
  const missingRefs = uniqueRefs.filter((id) => !allNodeIds.has(id));
  const selfRefs = uniqueRefs.filter((id) => id === targetChapterId || lessonById.get(id)?.chapterId === targetChapterId);
  return {
    raw,
    refs: uniqueRefs,
    externalGateIds: uniqueGates,
    referenceExpressions,
    aliasEvidence,
    modifiers,
    unresolvedResidual: residual,
    missingRefs,
    selfRefs
  };
}

const resolutions = [];
for (const chapter of chapters) resolutions.push({ chapterId: chapter.id, ...resolveRaw(chapter.prerequisites.raw, chapter.id) });

const missingRefs = resolutions.flatMap((item) => item.missingRefs.map((ref) => ({ chapterId: item.chapterId, ref })));
const selfRefs = resolutions.flatMap((item) => item.selfRefs.map((ref) => ({ chapterId: item.chapterId, ref })));
const unresolved = resolutions
  .filter((item) => item.unresolvedResidual)
  .map((item) => ({ chapterId: item.chapterId, raw: item.raw, residual: item.unresolvedResidual }));
if (missingRefs.length) throw new Error(`Missing prerequisite nodes: ${JSON.stringify(missingRefs)}`);
if (selfRefs.length) throw new Error(`Self prerequisite nodes: ${JSON.stringify(selfRefs)}`);
if (unresolved.length) throw new Error(`Unresolved prerequisite text: ${JSON.stringify(unresolved)}`);

const resolutionByChapter = new Map(resolutions.map((item) => [item.chapterId, item]));
for (const course of registry.courses) {
  for (const level of course.levels) {
    for (const chapter of level.chapters) {
      const result = resolutionByChapter.get(chapter.id);
      chapter.prerequisites.refs = result.refs;
      chapter.prerequisites.externalGateIds = result.externalGateIds;
      chapter.prerequisites.logic = result.modifiers.logic;
      chapter.prerequisites.modifiers = result.modifiers;
      chapter.prerequisites.aliasEvidence = result.aliasEvidence;
      chapter.prerequisites.resolutionStatus = "resolved_pass";
      for (const lesson of chapter.lessons) {
        lesson.prerequisites = structuredClone(chapter.prerequisites);
      }
    }
  }
}
registry.source.prerequisiteGraph = "roadmap_v2/graph/prerequisite-graph.json";
registry.source.prerequisiteGraphStatus = "resolved_pass";
fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + "\n", "utf8");

const enrichedRegistryContent = fs.readFileSync(REGISTRY_PATH, "utf8");
const registrySha256 = crypto.createHash("sha256").update(enrichedRegistryContent).digest("hex");

const nodes = [
  ...registry.courses.map((course) => ({ id: course.id, type: "course", title: course.title, order: course.order })),
  ...registry.courses.flatMap((course) =>
    course.levels.map((level) => ({
      id: `${course.id}:${level.id}`,
      type: "level",
      title: level.title,
      courseId: course.id,
      levelId: level.id,
      order: level.order
    }))
  ),
  ...chapters.map((item) => ({
    id: item.id,
    type: "chapter",
    title: item.title,
    courseId: item.courseId,
    levelId: item.levelId,
    deliveryMode: item.deliveryMode
  })),
  ...lessons.map((item) => ({
    id: item.id,
    type: "lesson",
    title: item.title,
    courseId: item.courseId,
    chapterId: item.chapterId
  })),
  ...externalGateDefinitions.map((item) => ({
    id: item.id,
    type: "external_gate",
    gateType: item.gateType
  }))
];

const hierarchyEdges = [];
for (const course of registry.courses) {
  for (const level of course.levels) {
    const levelId = `${course.id}:${level.id}`;
    hierarchyEdges.push({ from: course.id, to: levelId, type: "contains" });
    for (const chapter of level.chapters) {
      hierarchyEdges.push({ from: levelId, to: chapter.id, type: "contains" });
      for (const lesson of chapter.lessons) hierarchyEdges.push({ from: chapter.id, to: lesson.id, type: "contains" });
    }
  }
}

const prerequisiteEdges = [];
for (const result of resolutions) {
  const defaultType = result.modifiers.recommended
    ? "recommended"
    : result.modifiers.concurrent
      ? "concurrent"
      : result.modifiers.justInTime
        ? "just_in_time"
        : "blocking";
  for (const ref of result.refs) {
    const aliasType = result.aliasEvidence.find((item) => item.refs.includes(ref))?.edgeType;
    prerequisiteEdges.push({
      from: ref,
      to: result.chapterId,
      type: aliasType || defaultType,
      logic: result.modifiers.logic,
      sourceRaw: result.raw
    });
  }
  for (const gateId of result.externalGateIds) {
    const gate = externalGateDefinitions.find((item) => item.id === gateId);
    prerequisiteEdges.push({
      from: gateId,
      to: result.chapterId,
      type: result.modifiers.concurrent ? "concurrent" : gate.defaultEdgeType,
      logic: result.modifiers.logic,
      sourceRaw: result.raw
    });
  }
}

const duplicateEdgeKeys = [];
const edgeSeen = new Set();
for (const edge of prerequisiteEdges) {
  const key = `${edge.from}|${edge.to}|${edge.type}|${edge.logic}`;
  if (edgeSeen.has(key)) duplicateEdgeKeys.push(key);
  edgeSeen.add(key);
}
if (duplicateEdgeKeys.length) throw new Error(`Duplicate prerequisite edges: ${duplicateEdgeKeys.join(", ")}`);

function sourceChapter(nodeId) {
  if (chapterById.has(nodeId)) return nodeId;
  if (lessonById.has(nodeId)) return lessonById.get(nodeId).chapterId;
  return null;
}
const adjacency = new Map(chapters.map((item) => [item.id, new Set()]));
const indegree = new Map(chapters.map((item) => [item.id, 0]));
for (const edge of prerequisiteEdges) {
  if (!["blocking", "just_in_time", "concurrent", "alternative"].includes(edge.type)) continue;
  const fromChapter = sourceChapter(edge.from);
  if (!fromChapter || fromChapter === edge.to) continue;
  if (!adjacency.get(fromChapter).has(edge.to)) {
    adjacency.get(fromChapter).add(edge.to);
    indegree.set(edge.to, indegree.get(edge.to) + 1);
  }
}
const queue = [...chapters.map((item) => item.id).filter((id) => indegree.get(id) === 0)].sort();
const topologicalOrder = [];
while (queue.length) {
  const id = queue.shift();
  topologicalOrder.push(id);
  for (const next of [...adjacency.get(id)].sort()) {
    indegree.set(next, indegree.get(next) - 1);
    if (indegree.get(next) === 0) {
      queue.push(next);
      queue.sort();
    }
  }
}
const cycleNodes = chapters.map((item) => item.id).filter((id) => !topologicalOrder.includes(id));
if (cycleNodes.length) throw new Error(`Prerequisite cycle detected: ${cycleNodes.join(", ")}`);

const graph = {
  schema: "BAUMAN_ROADMAP_V2_PREREQUISITE_GRAPH_V1",
  version: 1,
  generatedAt: "2026-08-10T21:00:00+07:00",
  source: {
    registry: "roadmap_v2/registry/roadmap-v2.registry.json",
    registrySha256
  },
  direction: "prerequisite_to_dependent",
  counts: {
    nodes: nodes.length,
    courseNodes: nodes.filter((item) => item.type === "course").length,
    levelNodes: nodes.filter((item) => item.type === "level").length,
    chapterNodes: nodes.filter((item) => item.type === "chapter").length,
    lessonNodes: nodes.filter((item) => item.type === "lesson").length,
    externalGateNodes: nodes.filter((item) => item.type === "external_gate").length,
    hierarchyEdges: hierarchyEdges.length,
    prerequisiteEdges: prerequisiteEdges.length
  },
  nodes,
  hierarchyEdges,
  prerequisiteEdges,
  resolutions,
  topologicalChapterOrder: topologicalOrder,
  validation: {
    courseNodes: nodes.filter((item) => item.type === "course").length,
    levelNodes: nodes.filter((item) => item.type === "level").length,
    chapterNodes: nodes.filter((item) => item.type === "chapter").length,
    lessonNodes: nodes.filter((item) => item.type === "lesson").length,
    externalGateNodes: nodes.filter((item) => item.type === "external_gate").length,
    hierarchyEdges: hierarchyEdges.length,
    prerequisiteEdges: prerequisiteEdges.length,
    explicitReferenceExpressions: resolutions.reduce((sum, item) => sum + item.referenceExpressions.length, 0),
    expandedCanonicalRefs: resolutions.reduce((sum, item) => sum + item.refs.length, 0),
    externalGateUses: resolutions.reduce((sum, item) => sum + item.externalGateIds.length, 0),
    unresolvedResiduals: unresolved,
    missingRefs,
    selfRefs,
    duplicateEdgeKeys,
    cycleNodes,
    topologicalChapterCount: topologicalOrder.length,
    result: "PASS"
  },
  acceptance: {
    step: 75,
    registryStep74Passed: true,
    allPrerequisiteTextResolved: unresolved.length === 0,
    allReferencesExist: missingRefs.length === 0,
    noSelfReferences: selfRefs.length === 0,
    noDuplicateEdges: duplicateEdgeKeys.length === 0,
    acyclic: cycleNodes.length === 0,
    priorityEngineActivated: false,
    runtimeModified: false,
    result: "PASS"
  }
};
fs.writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2) + "\n", "utf8");
console.log(JSON.stringify({
  output: path.relative(ROOT, GRAPH_PATH),
  registrySha256,
  validation: graph.validation
}, null, 2));
