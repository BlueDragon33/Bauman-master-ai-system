import fs from 'node:fs';

const registry = JSON.parse(fs.readFileSync('docs/roadmap_v2/roadmap_registry.json', 'utf8'));
const graph = JSON.parse(fs.readFileSync('docs/roadmap_v2/prerequisite_graph.json', 'utf8'));
const fail = message => { throw new Error(message); };

if (graph.status !== 'PASS_B75') fail('Graph is not PASS_B75');
if (graph.registryVersion !== registry.version) fail('Graph/registry version mismatch');
const registryIds = new Set(registry.nodes.map(node => node.id));
const gateIds = new Set(graph.externalGates.map(gate => gate.id));
const keys = new Set();

for (const edge of graph.edges) {
  if (!registryIds.has(edge.target)) fail(`Unknown edge target ${edge.target}`);
  if (edge.kind === 'gate') {
    if (!gateIds.has(edge.source)) fail(`Unknown external gate ${edge.source}`);
  } else if (!registryIds.has(edge.source)) fail(`Unknown edge source ${edge.source}`);
  if (edge.source === edge.target) fail(`Self edge ${edge.source}`);
  const key = `${edge.source}|${edge.target}|${edge.kind}`;
  if (keys.has(key)) fail(`Duplicate edge ${key}`);
  keys.add(key);
}

if (graph.cycleNodes.length || graph.counts.cycles) fail('Graph contains a required-edge cycle');
if (graph.topologicalOrder.length !== registry.nodes.length) fail('Topological order does not cover every registry node');
if (new Set(graph.topologicalOrder).size !== registry.nodes.length) fail('Topological order contains duplicates');

const position = new Map(graph.topologicalOrder.map((id, index) => [id, index]));
for (const edge of graph.edges.filter(edge => edge.kind === 'required')) {
  if (position.get(edge.source) >= position.get(edge.target)) fail(`Invalid topological order for ${edge.source} -> ${edge.target}`);
}

console.log(JSON.stringify({
  status: 'PASS_B75',
  nodes: registry.nodes.length,
  requiredInternalEdges: graph.counts.requiredInternalEdges,
  recommendedInternalEdges: graph.counts.recommendedInternalEdges,
  externalGates: graph.counts.externalGates,
  unresolvedInternalRefs: graph.counts.unresolvedInternalRefs,
  cycles: graph.counts.cycles
}));

