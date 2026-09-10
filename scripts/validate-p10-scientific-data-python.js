'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pack = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/prerequisite-packs/p10-scientific-data-python.json'), 'utf8'));
const prereq = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/prerequisite-registry-iu5-2026.json'), 'utf8'));
const curriculum = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/official-curriculum-iu5-2026.json'), 'utf8'));
const lessons = JSON.parse(fs.readFileSync(path.join(root, 'subjects/programming/data/lessons.json'), 'utf8'));

const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const unique = values => new Set(values).size === values.length;

assert(pack.schema === 'bauman_prerequisite_pack_v1', 'unexpected P10 pack schema');
assert(pack.gateId === 'P10', 'pack gateId must be P10');
assert(pack.notOfficialAdministrativePrerequisite === true, 'P10 must be explicitly non-administrative prerequisite');
assert(pack.mastery?.target === 90, 'P10 target must match registry target 90');
assert(pack.mastery?.applicationMinimum === 85, 'P10 application minimum must be 85');
assert(pack.mastery?.criticalMisconceptionsAllowed === 0, 'P10 must allow zero critical misconceptions');
assert(pack.implementationPolicy?.schedulerMutation === false, 'Pass09 must not mutate scheduler');
assert(pack.implementationPolicy?.writesDiagnosticScores === false, 'Pass09 must not write diagnostic scores');
assert(pack.implementationPolicy?.newTopLevelSubject === false, 'P10 must remain inside Programming');
assert(pack.implementationPolicy?.overwritesExistingLessons === false, 'Pass09 must reuse rather than overwrite Programming lessons');
assert(pack.implementationPolicy?.requiresSciPyForEveryTask === false, 'SciPy must remain a focused tool, not a universal requirement');
assert(pack.implementationPolicy?.requiresMLOpsForReady === false, 'MLOps must not become a P10 READY requirement');
assert(pack.implementationPolicy?.mainBranchMutation === false, 'Pass09 must not mutate main');

const registryGate = prereq.coreGates.find(x => x.id === 'P10');
assert(Boolean(registryGate), 'P10 missing from prerequisite registry');
assert(registryGate?.target === 90, 'P10 registry target must remain 90');
for (const topic of ['NumPy','pandas','SciPy','matplotlib','data cleaning','feature preprocessing','scikit-learn','reproducible notebook']) {
  assert((registryGate?.topics || []).some(x => x.toLowerCase().includes(topic.toLowerCase())), `P10 registry lost topic ${topic}`);
}

const disciplines = new Map(curriculum.disciplines.map(x => [x.id, x]));
const expectedCourses = {
  d04:['Многомерный анализ данных в системах искусственного интеллекта',1],
  d08:['Методы машинного обучения в автоматизированных системах обработки информации и управления',2],
  d11:['Разработка нейросетевых систем',2],
  d12:['Анализ временных рядов',3],
  d13:['Искусственный интеллект в задачах бизнес-аналитики',3],
  d16:['НИР по обработке и анализу данных',3]
};
for (const [id,[name,sem]] of Object.entries(expectedCourses)) {
  const c = disciplines.get(id);
  assert(c?.nameRu === name, `${id} identity drifted`);
  assert((c?.semesters || []).includes(sem), `${id} semester drifted`);
}
assert(disciplines.get('d04')?.credits === 5 && disciplines.get('d04')?.hours === 180, 'd04 must remain 5 credits / 180 hours');
assert((disciplines.get('d04')?.assessment || []).includes('Экз') && (disciplines.get('d04')?.assessment || []).includes('ДЗчт'), 'd04 assessment drifted');

const targetIds = new Set((pack.officialTargets || []).map(x => x.courseId));
for (const id of Object.keys(expectedCourses)) assert(targetIds.has(id), `P10 must map to ${id}`);
assert((pack.officialTargets || []).find(x => x.courseId === 'd04')?.role === 'primary', 'd04 must be primary P10 target');

const lessonMap = new Map(lessons.map(x => [x.id || x.lessonId, x]));
const reuseExpected = ['PR04','PR05','PR08','PR12','PR25','PR26'];
for (const id of reuseExpected) assert(lessonMap.has(id), `P10 reuse lesson ${id} missing`);
const expectedTitles = {
  PR04:'NumPy và vector hóa dữ liệu',
  PR05:'Pandas và làm sạch bảng dữ liệu',
  PR08:'Notebook thực nghiệm và README tái lập',
  PR12:'File, JSON, CSV và dữ liệu học tập',
  PR25:'Pipeline dữ liệu cho ML',
  PR26:'Scikit-learn baseline và metric'
};
for (const [id,title] of Object.entries(expectedTitles)) assert(lessonMap.get(id)?.title === title, `${id} identity drifted`);
const reuseIds = new Set((pack.localReuse || []).flatMap(x => x.lessonIds || []));
for (const id of reuseExpected) assert(reuseIds.has(id), `P10 localReuse must include ${id}`);

const nodes = pack.nodes || [];
const nodeIds = nodes.map(x => x.id);
const nodeSet = new Set(nodeIds);
assert(nodes.length === 11, `P10 expected 11 nodes, got ${nodes.length}`);
assert(unique(nodeIds), 'P10 node IDs must be unique');
assert(nodes.every((x,i) => x.order === i + 1), 'P10 node order must be contiguous 1..11');
for (const node of nodes) for (const dep of node.dependsOn || []) assert(nodeSet.has(dep), `${node.id} depends on missing node ${dep}`);
const visiting = new Set(), visited = new Set();
function visit(id) {
  if (visiting.has(id)) { errors.push(`cycle detected at ${id}`); return; }
  if (visited.has(id)) return;
  visiting.add(id);
  const node = nodes.find(x => x.id === id);
  for (const dep of node?.dependsOn || []) visit(dep);
  visiting.delete(id);
  visited.add(id);
}
for (const id of nodeIds) visit(id);

const signals = [
  ['P10-N01',/shape|dtype|axis|vectorization/i],
  ['P10-N02',/schema|missing|merge|cardinality/i],
  ['P10-N03',/CSV|JSON|dtype|parse/i],
  ['P10-N04',/SciPy|stats|linalg|optimize|residual/i],
  ['P10-N05',/matplotlib|histogram|scatter|boxplot/i],
  ['P10-N06',/train|validation|test|leakage/i],
  ['P10-N07',/Pipeline|ColumnTransformer/i],
  ['P10-N08',/imputation|scaling|encoding/i],
  ['P10-N09',/cross-validation|baseline|metric/i],
  ['P10-N10',/reproduc|notebook|seed|artifact/i],
  ['P10-N11',/schema|contract|drift|d04/i]
];
for (const [id,re] of signals) {
  const node = nodes.find(x => x.id === id);
  assert(Boolean(node) && re.test(JSON.stringify(node)), `${id} missing required signal ${re}`);
}

const diagnostic = pack.diagnostic || {};
assert(diagnostic.D0?.weight === 0.25, 'P10 D0 weight must be 0.25');
assert(diagnostic.D1?.weight === 0.5, 'P10 D1 weight must be 0.5');
assert(diagnostic.D2?.weight === 0.25, 'P10 D2 weight must be 0.25');
assert((diagnostic.D0?.items || []).length === 18, 'P10 D0 must contain 18 recall items');
assert((diagnostic.D1?.items || []).length === 12, 'P10 D1 must contain 12 application items');
assert((diagnostic.D2?.items || []).length === 8, 'P10 D2 must contain 8 oral items');
const diagItems = [...(diagnostic.D0?.items || []), ...(diagnostic.D1?.items || []), ...(diagnostic.D2?.items || [])];
assert(unique(diagItems.map(x => x.id)), 'P10 diagnostic IDs must be unique');
for (const item of diagItems) assert(nodeSet.has(item.node), `${item.id} references missing node ${item.node}`);
assert((diagnostic.D2?.items || []).every(x => typeof x.promptRu === 'string' && x.promptRu.length > 20), 'P10 D2 must include Russian prompts');

const misconceptions = pack.criticalMisconceptions || [];
assert(misconceptions.length >= 10, 'P10 must include at least 10 critical misconceptions');
assert(unique(misconceptions.map(x => x.id)), 'P10 misconception IDs must be unique');
for (const m of misconceptions) assert(nodeSet.has(m.node), `${m.id} references missing node ${m.node}`);
const routes = pack.repairRoutes || [];
assert(routes.length >= 8, 'P10 must have at least 8 repair routes');
assert(unique(routes.map(x => x.id)), 'P10 repair route IDs must be unique');
for (const route of routes) {
  for (const nodeId of route.triggerNodes || []) assert(nodeSet.has(nodeId), `${route.id} trigger references missing node ${nodeId}`);
  for (const token of route.route || []) {
    if (/^P10-N\d+$/.test(token)) assert(nodeSet.has(token), `${route.id} references missing node ${token}`);
    if (/^PR\d+$/.test(token)) assert(lessonMap.has(token), `${route.id} references missing lesson ${token}`);
  }
}

const requiredScope = new Set(pack.scopeGuard?.required || []);
for (const required of [
  'NumPy shape-dtype-vectorization discipline',
  'pandas schema and missing-data handling',
  'CSV/JSON/tabular ingestion',
  'SciPy essentials only',
  'matplotlib diagnostic visualization',
  'train-validation-test split discipline',
  'data leakage prevention',
  'scikit-learn Pipeline and ColumnTransformer',
  'scaling-encoding-imputation',
  'cross-validation and metric workflow',
  'reproducible preprocessing',
  'dataset/schema validation'
]) assert(requiredScope.has(required), `P10 scope missing ${required}`);

const activeText = JSON.stringify({nodes:pack.nodes,diagnostic:pack.diagnostic,criticalMisconceptions:pack.criticalMisconceptions,repairRoutes:pack.repairRoutes});
assert(!/Kubernetes|Kubeflow|Airflow administration|Spark internals|CUDA optimization|distributed training|feature-store|LLM framework|robotics telemetry/i.test(activeText), 'P10 active content must remain free of MLOps/distributed/project detours');

// Independent numerical/data-pipeline sanity invariants.
function matmulShape(a,b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== 2 || b.length !== 1) return null;
  return a[1] === b[0] ? [a[0]] : null;
}
assert(JSON.stringify(matmulShape([120,8],[8])) === JSON.stringify([120]), 'matrix-vector shape invariant failed');
assert(matmulShape([120,8],[7]) === null, 'incompatible matrix-vector shape must fail');

const mean = xs => xs.reduce((s,x)=>s+x,0)/xs.length;
const train = [0,1,2,3];
const test = [100];
const trainMean = mean(train);
const leakedMean = mean([...train,...test]);
assert(trainMean === 1.5, 'train-only mean invariant failed');
assert(leakedMean > 20, 'leakage mean sanity failed');
assert(trainMean !== leakedMean, 'train-only preprocessing statistic must differ from leaked full-data statistic in canonical case');

function schemaOk(row) {
  return Number.isInteger(row.id) && typeof row.timestamp === 'string' && Number.isFinite(row.feature_1) && ['A','B'].includes(row.target);
}
assert(schemaOk({id:1,timestamp:'2026-09-10T10:00:00Z',feature_1:2.5,target:'A'}) === true, 'valid schema invariant failed');
assert(schemaOk({id:1,timestamp:'2026-09-10T10:00:00Z',feature_1:'2.5',target:'A'}) === false, 'dtype drift invariant failed');
assert(schemaOk({id:1,timestamp:'2026-09-10T10:00:00Z',feature_1:2.5,target:'C'}) === false, 'category contract invariant failed');

for (const src of pack.sourceEvidence || []) assert(/^https:\/\//.test(src.url || ''), 'P10 source evidence must use HTTPS');
assert((pack.sourceEvidence || []).some(x => x.kind === 'official_curriculum'), 'P10 must preserve official curriculum evidence');

if (errors.length) {
  console.error(`P10_SCIENTIFIC_DATA_PYTHON_VALIDATION_FAIL (${errors.length})`);
  errors.forEach(e => console.error(`- ${e}`));
  process.exit(1);
}
console.log('P10_SCIENTIFIC_DATA_PYTHON_VALIDATION_PASS');
console.log(JSON.stringify({
  nodes:nodes.length,
  D0:diagnostic.D0.items.length,
  D1:diagnostic.D1.items.length,
  D2:diagnostic.D2.items.length,
  misconceptions:misconceptions.length,
  repairRoutes:routes.length,
  reusedLessons:reuseExpected,
  officialTargets:pack.officialTargets.map(x=>x.courseId)
}, null, 2));
