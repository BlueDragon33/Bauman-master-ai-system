import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const exists = (rel) => fs.existsSync(path.join(root, rel));
const fail = (msg) => { throw new Error('[PYTHON02] ' + msg); };

const model = readJson('prompts/subjects/python/evidence/PYTHON_P2_CANONICAL_MODEL.json');
const comp = readJson('prompts/subjects/python/evidence/PYTHON_COMPETENCY_GRAPH.json');
const graph = readJson('prompts/subjects/python/evidence/PYTHON_PREREQUISITE_GRAPH.json');
const legacy = readJson('prompts/subjects/python/evidence/PYTHON_LEGACY_LESSON_OWNERSHIP_MAP.json');
const lessons = readJson('subjects/programming/data/lessons.json');

if (model.schemaVersion !== '1.0.0') fail('unexpected schemaVersion');
if (!['VALIDATING','PASS'].includes(model.status)) fail('model must be VALIDATING or PASS');
if (model.owner?.academicTruth !== 'prompts/subjects/python/evidence/PYTHON_P2_CANONICAL_MODEL.json') fail('canonical owner mismatch');
if (model.targetProgram?.code !== '09.04.01/11') fail('target program drift');
if (model.targetProgram?.standalonePythonCourseClaimed !== false) fail('must not invent a standalone official Python course');
if (model.versionPolicy?.supportedPythonMinor !== null) fail('PYTHON02 must leave Python minor unbound');
if (model.migration?.runtimeMutationAuthorized !== false) fail('runtime mutation is forbidden in PYTHON02');
if (model.migration?.productionMigrationActivated !== false) fail('production migration is forbidden in PYTHON02');
if (!model.migration?.preserveLegacyIds || !model.migration?.preserveLearnerState) fail('compatibility preservation missing');

for (const rel of model.deliverables || []) if (!exists(rel)) fail('missing deliverable ' + rel);

const allowed = new Set([
  'KEEP_PYTHON',
  'KEEP_AS_PYTHON_IMPLEMENTATION_CONTEXT',
  'ROUTE_TO_ALGORITHMS',
  'ROUTE_TO_DATABASE',
  'ROUTE_TO_ML_AI',
  'ROUTE_TO_SOFTWARE_ENGINEERING'
]);
if (legacy.expectedLessonCount !== 48) fail('expected legacy lesson count must be 48');
if (legacy.lessons.length !== 48) fail('ownership map must classify exactly 48 lessons');

const runtimeIds = lessons.map(x => x.id);
const mappedIds = legacy.lessons.map(x => x.lessonId);
if (new Set(runtimeIds).size !== 48) fail('runtime lesson IDs are not unique');
if (new Set(mappedIds).size !== 48) fail('mapped lesson IDs are not unique');
for (const id of runtimeIds) if (!mappedIds.includes(id)) fail('missing legacy classification ' + id);
for (const row of legacy.lessons) {
  if (!allowed.has(row.classification)) fail('invalid classification for ' + row.lessonId);
  if (row.productionDeletionAuthorized !== false) fail('unsafe deletion authorization for ' + row.lessonId);
  if (row.compatibilityAction !== 'PRESERVE_LEGACY_ID_AND_RUNTIME_PROJECTION') fail('compatibility action drift for ' + row.lessonId);
}

const nodeIds = new Set(graph.nodes.map(n => n.id));
if (nodeIds.size !== comp.competencies.length) fail('competency node count mismatch');
if (comp.competencies.length !== 16) fail('expected 16 competency families');
for (const c of comp.competencies) {
  if (!nodeIds.has(c.id)) fail('competency absent from prerequisite graph ' + c.id);
  for (const p of c.prerequisites || []) if (!nodeIds.has(p)) fail('dangling competency prerequisite ' + p);
}
const outgoing = new Map([...nodeIds].map(id => [id, []]));
for (const e of graph.edges) {
  if (!nodeIds.has(e.from) || !nodeIds.has(e.to)) fail('dangling graph edge');
  if (e.from === e.to) fail('self edge ' + e.from);
  outgoing.get(e.from).push(e.to);
}
const state = new Map();
const visit = (id) => {
  const s = state.get(id) || 0;
  if (s === 1) fail('cycle detected at ' + id);
  if (s === 2) return;
  state.set(id, 1);
  for (const to of outgoing.get(id) || []) visit(to);
  state.set(id, 2);
};
for (const id of nodeIds) visit(id);

for (const tier of ['exposure','progress','performance','mastery']) {
  if (!model.evidenceSemantics?.[tier]) fail('missing evidence semantic ' + tier);
}
if (!/never inferred/i.test(model.evidenceSemantics.mastery)) fail('mastery truthfulness guard missing');

console.log(JSON.stringify({
  status:'PASS',
  check:'PYTHON02 canonical academic contract',
  legacyLessons:legacy.lessons.length,
  competencies:comp.competencies.length,
  prerequisiteEdges:graph.edges.length,
  runtimeMutation:false
}));

