'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pack = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/prerequisite-packs/p08-software-engineering.json'), 'utf8'));
const prereq = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/prerequisite-registry-iu5-2026.json'), 'utf8'));
const curriculum = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/official-curriculum-iu5-2026.json'), 'utf8'));
const lessons = JSON.parse(fs.readFileSync(path.join(root, 'subjects/programming/data/lessons.json'), 'utf8'));

const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const unique = values => new Set(values).size === values.length;

assert(pack.schema === 'bauman_prerequisite_pack_v1', 'unexpected P8 pack schema');
assert(pack.gateId === 'P8', 'pack gateId must be P8');
assert(pack.notOfficialAdministrativePrerequisite === true, 'P8 must be explicitly non-administrative prerequisite');
assert(pack.mastery?.target === 88, 'P8 target must match registry target 88');
assert(pack.mastery?.applicationMinimum === 85, 'P8 application minimum must be 85');
assert(pack.mastery?.criticalMisconceptionsAllowed === 0, 'P8 must allow zero critical misconceptions');
assert(pack.implementationPolicy?.schedulerMutation === false, 'Pass08 must not mutate scheduler');
assert(pack.implementationPolicy?.writesDiagnosticScores === false, 'Pass08 must not write diagnostic scores');
assert(pack.implementationPolicy?.newTopLevelSubject === false, 'P8 must remain inside Programming');
assert(pack.implementationPolicy?.overwritesExistingProgrammingLessons === false, 'Pass08 must reuse rather than overwrite Programming lessons');
assert(pack.implementationPolicy?.neutralizesUGVExamplesInPrerequisiteRoute === true, 'P8 prerequisite path must neutralize project-specific UGV examples');
assert(pack.implementationPolicy?.mainBranchMutation === false, 'Pass08 must not mutate main');

const registryGate = prereq.coreGates.find(x => x.id === 'P8');
assert(Boolean(registryGate), 'P8 missing from prerequisite registry');
assert(registryGate?.target === 88, 'P8 registry target must remain 88');
for (const topic of ['requirements','UML','SOLID','design patterns','architecture','Git workflow','testing','software lifecycle','documentation']) {
  assert((registryGate?.topics || []).some(x => x.toLowerCase().includes(topic.toLowerCase())), `P8 registry lost topic ${topic}`);
}

const disciplines = new Map(curriculum.disciplines.map(x => [x.id, x]));
const practices = new Map(curriculum.practices.map(x => [x.id, x]));
const d05 = disciplines.get('d05');
const d15 = disciplines.get('d15');
const d14 = disciplines.get('d14');
const d19 = disciplines.get('d19');
const p01 = practices.get('p01');
assert(d05?.nameRu === 'Объектно-ориентированное проектирование автоматизированных систем обработки информации и управления', 'd05 identity drifted');
assert(d05?.credits === 6 && d05?.hours === 216 && JSON.stringify(d05?.semesters) === JSON.stringify([1]), 'd05 must remain 6 credits / 216 hours / semester 1');
assert((d05?.assessment || []).includes('Экз') && (d05?.assessment || []).includes('ДЗчт'), 'd05 assessment drifted');
assert(d15?.nameRu === 'Технологии разработки программного обеспечения', 'd15 identity drifted');
assert(d15?.credits === 6 && d15?.hours === 216 && JSON.stringify(d15?.semesters) === JSON.stringify([1,2]), 'd15 must remain 6 credits / 216 hours / semesters 1-2');
assert(d14?.nameRu === 'Управление проектированием информационных систем' && JSON.stringify(d14?.semesters) === JSON.stringify([3]), 'd14 downstream identity/semester drifted');
assert(d19?.nameRu === 'Описание процессов жизненного цикла СТС' && JSON.stringify(d19?.semesters) === JSON.stringify([4]), 'd19 downstream identity/semester drifted');
assert(p01?.nameRu === 'Проектно-технологическая практика' && JSON.stringify(p01?.semesters) === JSON.stringify([2]), 'p01 practice bridge drifted');

const officialIds = new Set([
  ...curriculum.disciplines.map(x => x.id),
  ...curriculum.practices.map(x => x.id),
  ...curriculum.gia.map(x => x.id),
  ...curriculum.electiveGroups.map(x => x.id),
  ...curriculum.electiveGroups.flatMap(g => g.options.map(x => x.id))
]);
for (const target of pack.officialTargets || []) assert(officialIds.has(target.courseId), `P8 references unknown official target ${target.courseId}`);
for (const id of ['d05','d15','d14','d19','p01']) assert((pack.officialTargets || []).some(x => x.courseId === id), `P8 must map to ${id}`);
assert((pack.officialTargets || []).find(x => x.courseId === 'd05')?.role === 'primary', 'd05 must be a primary P8 target');
assert((pack.officialTargets || []).find(x => x.courseId === 'd15')?.role === 'primary', 'd15 must be a primary P8 target');

const lessonMap = new Map(lessons.map(x => [x.id || x.lessonId, x]));
const reuseExpected = ['PR07','PR14','PR17','PR18','PR19','PR22','PR23','PR24'];
for (const id of reuseExpected) assert(lessonMap.has(id), `P8 reuse lesson ${id} missing`);
assert(lessonMap.get('PR07')?.title === 'Git, GitHub và nhật ký học tập', 'PR07 identity drifted');
assert(lessonMap.get('PR14')?.title === 'Unit test căn bản với pytest', 'PR14 identity drifted');
assert(lessonMap.get('PR17')?.title === 'OOP cho АСОИУ: class, interface, responsibility', 'PR17 identity drifted');
assert(lessonMap.get('PR18')?.title === 'Thiết kế module và kiến trúc package Python', 'PR18 identity drifted');
assert(lessonMap.get('PR19')?.title === 'Mẫu thiết kế ứng dụng: factory, strategy, adapter', 'PR19 identity drifted');
assert(lessonMap.get('PR22')?.title === 'Kỹ nghệ phần mềm: requirement, issue, milestone', 'PR22 identity drifted');
assert(lessonMap.get('PR23')?.title === 'Kiểm thử tích hợp và test dữ liệu', 'PR23 identity drifted');
assert(lessonMap.get('PR24')?.title === 'CI nhẹ và kiểm tra chất lượng code', 'PR24 identity drifted');
const reuseIds = new Set((pack.localReuse || []).flatMap(x => x.lessonIds || []));
for (const id of reuseExpected) assert(reuseIds.has(id), `P8 localReuse must include ${id}`);
for (const id of ['PR17','PR19']) {
  const entry = (pack.localReuse || []).find(x => (x.lessonIds || []).includes(id));
  assert(entry?.reusePolicy === 'concept_only_neutralize_project_example', `${id} must be concept-only reuse because the existing lesson contains project-specific examples`);
}

const nodes = pack.nodes || [];
const nodeIds = nodes.map(x => x.id);
const nodeSet = new Set(nodeIds);
assert(nodes.length === 11, `P8 expected 11 nodes, got ${nodes.length}`);
assert(unique(nodeIds), 'P8 node IDs must be unique');
assert(nodes.every((x, i) => x.order === i + 1), 'P8 node order must be contiguous 1..11');
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
  ['P8-N01', /boundary|stakeholder|ranh giới/i],
  ['P8-N02', /functional|non-functional|acceptance|traceability/i],
  ['P8-N03', /use-case|class diagram|sequence|component|deployment/i],
  ['P8-N04', /SOLID|SRP|DIP|composition/i],
  ['P8-N05', /Strategy|Adapter|Factory/i],
  ['P8-N06', /architecture|interface|data contract|kiến trúc/i],
  ['P8-N07', /performance|scalability|availability|reliability|maintainability/i],
  ['P8-N08', /lifecycle|waterfall|iterative|incremental|change/i],
  ['P8-N09', /Git|review|release|tag|configuration/i],
  ['P8-N10', /unit|integration|system|acceptance|regression/i],
  ['P8-N11', /traceability|bảo vệ|defense|d05\/d15/i]
];
for (const [id, re] of signals) {
  const node = nodes.find(x => x.id === id);
  assert(Boolean(node) && re.test(JSON.stringify(node)), `${id} missing required signal ${re}`);
}

const diagnostic = pack.diagnostic || {};
assert(diagnostic.D0?.weight === 0.25, 'P8 D0 weight must be 0.25');
assert(diagnostic.D1?.weight === 0.5, 'P8 D1 weight must be 0.5');
assert(diagnostic.D2?.weight === 0.25, 'P8 D2 weight must be 0.25');
assert((diagnostic.D0?.items || []).length === 18, 'P8 D0 must contain 18 recall items');
assert((diagnostic.D1?.items || []).length === 12, 'P8 D1 must contain 12 application items');
assert((diagnostic.D2?.items || []).length === 8, 'P8 D2 must contain 8 oral items');
const diagItems = [...(diagnostic.D0?.items || []), ...(diagnostic.D1?.items || []), ...(diagnostic.D2?.items || [])];
assert(unique(diagItems.map(x => x.id)), 'P8 diagnostic IDs must be unique');
for (const item of diagItems) assert(nodeSet.has(item.node), `${item.id} references missing node ${item.node}`);
assert((diagnostic.D2?.items || []).every(x => typeof x.promptRu === 'string' && x.promptRu.length > 20), 'P8 D2 must include Russian prompts');

const misconceptions = pack.criticalMisconceptions || [];
assert(misconceptions.length >= 10, 'P8 must include at least 10 critical misconceptions');
assert(unique(misconceptions.map(x => x.id)), 'P8 misconception IDs must be unique');
for (const m of misconceptions) assert(nodeSet.has(m.node), `${m.id} references missing node ${m.node}`);
const routes = pack.repairRoutes || [];
assert(routes.length >= 8, 'P8 must have at least 8 repair routes');
assert(unique(routes.map(x => x.id)), 'P8 repair route IDs must be unique');
for (const route of routes) {
  for (const nodeId of route.triggerNodes || []) assert(nodeSet.has(nodeId), `${route.id} trigger references missing node ${nodeId}`);
  for (const token of route.route || []) {
    if (/^P8-N\d+$/.test(token)) assert(nodeSet.has(token), `${route.id} references missing node ${token}`);
    if (/^PR\d+$/.test(token)) assert(lessonMap.has(token), `${route.id} references missing lesson ${token}`);
  }
}

const requiredScope = new Set(pack.scopeGuard?.required || []);
for (const required of [
  'problem boundary and stakeholders',
  'functional and non-functional requirements',
  'acceptance criteria and traceability',
  'UML use-case/class/sequence/component/deployment views',
  'OOP responsibility and SOLID',
  'basic design patterns',
  'software architecture and interfaces',
  'quality attributes and trade-offs',
  'software lifecycle and change management',
  'Git/review/configuration/release workflow',
  'unit/integration/system/regression/acceptance testing'
]) assert(requiredScope.has(required), `P8 scope missing ${required}`);

const activeText = JSON.stringify({nodes:pack.nodes, diagnostic:pack.diagnostic, criticalMisconceptions:pack.criticalMisconceptions, repairRoutes:pack.repairRoutes});
assert(!/Kubernetes|service mesh|cloud architecture certification|advanced DevOps|enterprise-framework specialization|competitive programming/i.test(activeText), 'P8 active content must stay free of platform/certification detours');
assert(!/UGV|USV|PID|LQR|Kalman|FPGA|PLC|SCADA|robot-specific/i.test(activeText), 'P8 active content must remain project/control neutral');

// Independent traceability sanity: every requirement in a complete matrix must have at least one test.
function uncoveredRequirements(requirementIds, links) {
  const covered = new Set(links.filter(x => Array.isArray(x.tests) && x.tests.length).map(x => x.req));
  return requirementIds.filter(id => !covered.has(id));
}
const completeLinks = [
  {req:'R1', tests:['T1']},
  {req:'R2', tests:['T2','T3']},
  {req:'R3', tests:['T4']}
];
assert(uncoveredRequirements(['R1','R2','R3'], completeLinks).length === 0, 'traceability complete-matrix invariant failed');
assert(JSON.stringify(uncoveredRequirements(['R1','R2','R3'], completeLinks.slice(0,2))) === JSON.stringify(['R3']), 'traceability missing-coverage invariant failed');

// Independent semantic-version ordering sanity for release-management exercises.
function semverCompare(a, b) {
  const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] < pb[i]) return -1;
    if (pa[i] > pb[i]) return 1;
  }
  return 0;
}
assert(semverCompare('1.2.3','1.3.0') < 0, 'semver minor-order invariant failed');
assert(semverCompare('1.9.9','2.0.0') < 0, 'semver major-order invariant failed');
assert(semverCompare('2.1.0','2.1.0') === 0, 'semver equality invariant failed');

for (const src of pack.sourceEvidence || []) assert(/^https:\/\//.test(src.url || ''), 'P8 source evidence must use HTTPS');
assert((pack.sourceEvidence || []).some(x => x.kind === 'official_curriculum'), 'P8 must preserve official curriculum evidence');

if (errors.length) {
  console.error(`P08_SOFTWARE_ENGINEERING_VALIDATION_FAIL (${errors.length})`);
  errors.forEach(e => console.error(`- ${e}`));
  process.exit(1);
}
console.log('P08_SOFTWARE_ENGINEERING_VALIDATION_PASS');
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
