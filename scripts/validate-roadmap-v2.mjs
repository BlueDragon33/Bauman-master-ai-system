import fs from 'node:fs';

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const fail = message => { throw new Error(message); };

const baseline = readJson('docs/roadmap_v2/baseline_inventory.json');
const registry = readJson('docs/roadmap_v2/roadmap_registry.json');

if (baseline.status !== 'PASS') fail('Baseline inventory is not PASS');
if (registry.status !== 'PASS_B74') fail('Registry is not PASS_B74');
if (registry.baselineRef !== `main@${baseline.commit}`) fail('Registry baselineRef does not match inventory commit');

const nodeIds = registry.nodes.map(node => node.id);
if (new Set(nodeIds).size !== nodeIds.length) fail('Duplicate registry node ID');
const lessonIds = registry.nodes.flatMap(node => node.lessons.map(lesson => lesson.id));
if (new Set(lessonIds).size !== lessonIds.length) fail('Duplicate registry lesson ID');

const expected = { subjects: 10, nodes: 85, numberedLessons: 304, dynamicNodes: 8, legacyCompositeNodes: 1 };
for (const [key, value] of Object.entries(expected)) {
  if (registry.counts[key] !== value) fail(`Unexpected ${key}: ${registry.counts[key]}`);
}

const contractKeys = ['theory', 'exercises', 'applications', 'simulationLab', 'assessment', 'project', 'masterReady'];
for (const node of registry.nodes) {
  if (!registry.subjects.some(subject => subject.id === node.subjectId)) fail(`Unknown subject for ${node.id}`);
  if (!node.prerequisiteText) fail(`Missing prerequisite text for ${node.id}`);
  for (const key of contractKeys) if (!node.learningContract[key]) fail(`Missing ${key} for ${node.id}`);
  for (const lesson of node.lessons) if (!lesson.id.startsWith(`${node.id}-L`)) fail(`Lesson namespace mismatch: ${lesson.id}`);
}

const pca = registry.nodes.find(node => node.id === 'MATH-L2-C07');
if (!pca) fail('Missing MATH-L2-C07');
if (pca.lessonMode !== 'legacy_composite') fail('MATH-L2-C07 must be a legacy composite');
const expectedLegacy = baseline.roadmapLogicalMappings['MATH-L2-C07'].legacyRefs;
if (JSON.stringify(pca.legacyRefs) !== JSON.stringify(expectedLegacy)) fail('MATH-L2-C07 legacyRefs differ from baseline inventory');

const weightTotal = Object.values(registry.priorityWeights).reduce((sum, value) => sum + value, 0);
if (Math.abs(weightTotal - 1) > 1e-12) fail(`Priority weights total ${weightTotal}`);

console.log(JSON.stringify({
  status: 'PASS_B74',
  subjects: registry.counts.subjects,
  nodes: registry.counts.nodes,
  numberedLessons: registry.counts.numberedLessons,
  dynamicNodes: registry.counts.dynamicNodes,
  uniqueNodeIds: nodeIds.length,
  uniqueLessonIds: lessonIds.length,
  baselineCommit: baseline.commit
}));

