import fs from 'node:fs';

const registry = JSON.parse(fs.readFileSync('docs/roadmap_v2/roadmap_registry.json', 'utf8'));
const nodeById = new Map(registry.nodes.map(node => [node.id, node]));
const nodeIds = [...nodeById.keys()];

const aliases = [
  { pattern: /Python NumPy\/Pandas/i, refs: ['PY-L2-C04', 'PY-L2-C05'], kind: 'required' },
  { pattern: /Python L2/i, refs: ['PY-L2-C04', 'PY-L2-C05', 'PY-L2-C06'], kind: 'required' },
  { pattern: /\bPY-L2\b(?!-C)/, refs: ['PY-L2-C04', 'PY-L2-C05', 'PY-L2-C06'], kind: 'required' },
  { pattern: /Python L1/i, refs: ['PY-L1-C02', 'PY-L1-C03'], kind: 'required' },
  { pattern: /Linux L1/i, refs: ['SYS-L1-C02', 'SYS-L1-C03'], kind: 'required' },
  { pattern: /giải tích cơ bản/i, refs: ['MATH-L0-C02'], kind: 'required' },
  { pattern: /Python cơ bản được khuyến nghị/i, refs: ['PY-L0-C01'], kind: 'recommended' }
];

const externalRules = [
  { id: 'ENTRY_DIAGNOSTIC', pattern: /diagnostic đầu vào/i, label: 'Entry diagnostic completed' },
  { id: 'EXISTING_COMPETENCY_GENERAL', pattern: /Existing Competency xác nhận/i, label: 'Relevant existing competency verified' },
  { id: 'EXISTING_COMPETENCY_CONTROL', pattern: /Existing Competency (?:Control\/automation|automation\/control)/i, label: 'Control and automation competency verified' },
  { id: 'EXISTING_COMPETENCY_SIGNAL', pattern: /Existing Competency (?:tín hiệu|signal)/i, label: 'Signal competency verified' },
  { id: 'ACTIVE_SPECIALIST_CHAPTER', pattern: /chapter chuyên môn tương ứng đang học/i, label: 'Active specialist chapter is selected' },
  { id: 'COMPLETE_TECHNICAL_PROJECT', pattern: /một project kỹ thuật hoàn chỉnh/i, label: 'A complete technical project exists' },
  { id: 'COURSE_SYLLABUS_IMPORTED', pattern: /syllabus môn đã nhập vào Kho 09/i, label: 'Current Bauman course syllabus imported' },
  { id: 'NIR_TOPIC_AND_PLAN_READY', pattern: /Kho 10 đã có topic và research plan/i, label: 'NIR topic and research plan ready' },
  { id: 'OFFICIAL_COURSE_SYLLABUS', pattern: /syllabus\/tài liệu chính thức của môn/i, label: 'Official course syllabus available' },
  { id: 'REAL_WEEK_MATERIAL', pattern: /tài liệu tuần thật/i, label: 'Real weekly course material available' },
  { id: 'RELEVANT_WEEKS_COMPLETE', pattern: /các tuần liên quan đã học/i, label: 'Relevant course weeks completed' },
  { id: 'COURSE_COMPLETE', pattern: /hoàn thành môn/i, label: 'Current Bauman course completed' },
  { id: 'RELATED_TECH_MODULE', pattern: /module kỹ thuật liên quan/i, label: 'Related technical module selected' }
];

function expandRanges(text) {
  const refs = [];
  const range = /((?:RU-R\d|MATH-L\d|PY-L\d|ADS-L\d|DB-L\d|SYS-L\d|OR-L\d|ML-L\d|CUR-L\d|NIR-L\d)-C)(\d{2})[–-]C(\d{2})/g;
  let match;
  while ((match = range.exec(text)) !== null) {
    const start = Number(match[2]);
    const end = Number(match[3]);
    for (let number = start; number <= end; number += 1) refs.push(`${match[1]}${String(number).padStart(2, '0')}`);
  }
  const slash = /\b([A-Z]+)-([RL])(\d)-C(\d{2})\/([RL])(\d)-C(\d{2})\b/g;
  while ((match = slash.exec(text)) !== null) {
    refs.push(`${match[1]}-${match[2]}${match[3]}-C${match[4]}`);
    refs.push(`${match[1]}-${match[5]}${match[6]}-C${match[7]}`);
  }
  return refs;
}

const internalEdges = [];
const externalEdges = [];
const usedExternalGates = new Map();

for (const target of registry.nodes) {
  const text = target.prerequisiteText;
  const refs = new Map();

  for (const id of nodeIds) {
    if (text.includes(id)) {
      const recommended = text.includes(`${id} được khuyến nghị`);
      refs.set(id, recommended ? 'recommended' : 'required');
    }
  }
  for (const id of expandRanges(text)) refs.set(id, 'required');
  for (const alias of aliases) {
    if (alias.pattern.test(text)) for (const id of alias.refs) if (!refs.has(id)) refs.set(id, alias.kind);
  }

  for (const [source, kind] of refs) {
    if (!nodeById.has(source)) throw new Error(`Unresolved internal prerequisite ${source} for ${target.id}`);
    if (source === target.id) throw new Error(`Self prerequisite ${source}`);
    internalEdges.push({ source, target: target.id, kind, evidence: text });
  }

  for (const rule of externalRules) {
    if (!rule.pattern.test(text)) continue;
    usedExternalGates.set(rule.id, { id: rule.id, label: rule.label });
    externalEdges.push({ source: rule.id, target: target.id, kind: 'gate', evidence: text });
  }
}

const edgeKey = edge => `${edge.source}|${edge.target}|${edge.kind}`;
const seen = new Set();
const dedupedInternal = internalEdges.filter(edge => !seen.has(edgeKey(edge)) && seen.add(edgeKey(edge)));
const dedupedExternal = externalEdges.filter(edge => !seen.has(edgeKey(edge)) && seen.add(edgeKey(edge)));

const requiredEdges = dedupedInternal.filter(edge => edge.kind === 'required');
const adjacency = new Map(nodeIds.map(id => [id, []]));
const indegree = new Map(nodeIds.map(id => [id, 0]));
for (const edge of requiredEdges) {
  adjacency.get(edge.source).push(edge.target);
  indegree.set(edge.target, indegree.get(edge.target) + 1);
}
const queue = nodeIds.filter(id => indegree.get(id) === 0).sort();
const topologicalOrder = [];
while (queue.length) {
  const current = queue.shift();
  topologicalOrder.push(current);
  for (const next of adjacency.get(current).sort()) {
    indegree.set(next, indegree.get(next) - 1);
    if (indegree.get(next) === 0) {
      queue.push(next);
      queue.sort();
    }
  }
}
const cycleNodes = nodeIds.filter(id => !topologicalOrder.includes(id));
if (cycleNodes.length) throw new Error(`Prerequisite cycle: ${cycleNodes.join(', ')}`);

const graph = {
  schema: 'BAUMAN_ROADMAP_V2_PREREQUISITE_GRAPH_V1',
  version: '2.0.0-l19-b75',
  status: 'PASS_B75',
  registryVersion: registry.version,
  direction: 'prerequisite_to_dependent',
  cyclePolicy: 'required_edges_must_be_acyclic; recommended_edges_are_non_blocking',
  nodes: registry.nodes.map(node => ({ id: node.id, subjectId: node.subjectId, level: node.level })),
  externalGates: [...usedExternalGates.values()].sort((a, b) => a.id.localeCompare(b.id)),
  edges: [...dedupedInternal, ...dedupedExternal],
  topologicalOrder,
  cycleNodes,
  counts: {
    registryNodes: nodeIds.length,
    requiredInternalEdges: requiredEdges.length,
    recommendedInternalEdges: dedupedInternal.filter(edge => edge.kind === 'recommended').length,
    externalGates: usedExternalGates.size,
    externalGateEdges: dedupedExternal.length,
    unresolvedInternalRefs: 0,
    cycles: cycleNodes.length
  }
};

fs.writeFileSync('docs/roadmap_v2/prerequisite_graph.json', `${JSON.stringify(graph, null, 2)}\n`);
console.log(JSON.stringify(graph.counts));
