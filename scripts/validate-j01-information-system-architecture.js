'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pack = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/prerequisite-packs/j01-information-system-architecture.json'), 'utf8'));
const prereq = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/prerequisite-registry-iu5-2026.json'), 'utf8'));
const curriculum = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/official-curriculum-iu5-2026.json'), 'utf8'));
const lessons = JSON.parse(fs.readFileSync(path.join(root, 'subjects/systems/data/lessons.json'), 'utf8'));

const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const unique = values => new Set(values).size === values.length;

assert(pack.schema === 'bauman_prerequisite_pack_v1', 'unexpected J1 pack schema');
assert(pack.gateId === 'J1', 'pack gateId must be J1');
assert(pack.notOfficialAdministrativePrerequisite === true, 'J1 must be explicitly non-administrative prerequisite');
assert(pack.mastery?.target === 85, 'J1 target must match registry target 85');
assert(pack.mastery?.applicationMinimum === 80, 'J1 application minimum must be 80');
assert(pack.mastery?.criticalMisconceptionsAllowed === 0, 'J1 must allow zero critical misconceptions');
assert(pack.implementationPolicy?.schedulerMutation === false, 'Pass11 must not mutate scheduler');
assert(pack.implementationPolicy?.writesDiagnosticScores === false, 'Pass11 must not write diagnostic scores');
assert(pack.implementationPolicy?.newTopLevelSubject === false, 'J1 must remain inside Systems');
assert(pack.implementationPolicy?.overwritesExistingSystemsLessons === false, 'Pass11 must not overwrite Systems lessons');
assert(pack.implementationPolicy?.legacyAutonomousExamplesBecomeDefault === false, 'legacy autonomous examples must not become default');
assert(pack.implementationPolicy?.neutralInformationSystemCaseIsDefault === true, 'neutral information-system case must be the default J1 case');
assert(pack.implementationPolicy?.mainBranchMutation === false, 'Pass11 must not mutate main');

const registryGate = prereq.jitBridgeGates.find(x => x.id === 'J1');
assert(Boolean(registryGate), 'J1 missing from prerequisite registry');
assert(registryGate?.target === 85, 'J1 registry target must remain 85');
assert(registryGate?.activateBeforeSemester === 1, 'J1 must activate before semester 1');
for (const topic of ['system boundary','components-interfaces','data flow','service architecture','availability','bottleneck','architecture documentation']) {
  assert((registryGate?.topics || []).some(x => x.toLowerCase().includes(topic.toLowerCase())), `J1 registry lost topic ${topic}`);
}

const disciplines = new Map(curriculum.disciplines.map(x => [x.id, x]));
const practices = new Map(curriculum.practices.map(x => [x.id, x]));
const identities = {
  d03:'Аналитические модели автоматизированных систем обработки информации и управления',
  d05:'Объектно-ориентированное проектирование автоматизированных систем обработки информации и управления',
  d09:'Модели надёжности АСОИУ',
  d14:'Управление проектированием информационных систем',
  d15:'Технологии разработки программного обеспечения',
  d19:'Описание процессов жизненного цикла СТС'
};
for (const [id, name] of Object.entries(identities)) assert(disciplines.get(id)?.nameRu === name, `${id} identity drifted`);
assert(practices.get('p03')?.nameRu === 'Эксплуатационная практика', 'p03 identity drifted');
assert(disciplines.get('d03')?.credits === 4 && JSON.stringify(disciplines.get('d03')?.semesters) === JSON.stringify([1]), 'd03 credits/semester drifted');
assert(disciplines.get('d05')?.credits === 6 && JSON.stringify(disciplines.get('d05')?.semesters) === JSON.stringify([1]), 'd05 credits/semester drifted');
assert(disciplines.get('d15')?.credits === 6 && JSON.stringify(disciplines.get('d15')?.semesters) === JSON.stringify([1,2]), 'd15 credits/semesters drifted');
assert(disciplines.get('d14')?.credits === 3 && JSON.stringify(disciplines.get('d14')?.semesters) === JSON.stringify([3]), 'd14 credits/semester drifted');
assert(disciplines.get('d19')?.credits === 4 && JSON.stringify(disciplines.get('d19')?.semesters) === JSON.stringify([4]), 'd19 credits/semester drifted');
assert(practices.get('p03')?.credits === 3 && JSON.stringify(practices.get('p03')?.semesters) === JSON.stringify([2]), 'p03 credits/semester drifted');

const officialIds = new Set([...curriculum.disciplines.map(x=>x.id), ...curriculum.practices.map(x=>x.id)]);
for (const target of pack.officialTargets || []) assert(officialIds.has(target.courseId), `J1 references unknown official target ${target.courseId}`);
for (const id of ['d03','d05','d09','d14','d15','d19','p03']) assert((pack.officialTargets || []).some(x => x.courseId === id), `J1 must map to ${id}`);
for (const id of ['d14','d19','p03']) assert((pack.officialTargets || []).find(x=>x.courseId===id)?.role === 'primary', `${id} must be primary J1 target`);

const lessonMap = new Map(lessons.map(x => [x.id, x]));
assert(lessonMap.has('s_p01_l1'), 'J1 reuse lesson s_p01_l1 missing');
assert(/Tư duy hệ thống cho UGV\/USV tự hành/i.test(lessonMap.get('s_p01_l1')?.title || ''), 's_p01_l1 identity drifted');
const reuse = (pack.localReuse || []).find(x => (x.lessonIds || []).includes('s_p01_l1'));
assert(reuse?.reusePolicy === 'concept_only_neutralize_autonomous_case', 's_p01_l1 must be concept-only neutralized reuse');
assert((reuse?.doNotReuseAsDefault || []).some(x => /UGV\/USV/i.test(x)), 'reuse policy must explicitly block UGV/USV defaulting');

const refCase = pack.defaultReferenceCase || {};
assert(refCase.id === 'CASE-IS-01', 'default reference case identity drifted');
for (const c of ['web client','application service','database','analytics worker','observability']) assert((refCase.components || []).includes(c), `default reference case missing ${c}`);
assert(!/UGV|USV|robot|sensor|controller|PID|LQR|Kalman/i.test(JSON.stringify(refCase)), 'default J1 reference case must remain neutral');

const nodes = pack.nodes || [];
const nodeIds = nodes.map(x => x.id);
const nodeSet = new Set(nodeIds);
assert(nodes.length === 10, `J1 expected 10 nodes, got ${nodes.length}`);
assert(unique(nodeIds), 'J1 node IDs must be unique');
assert(nodes.every((x,i)=>x.order===i+1), 'J1 node order must be contiguous 1..10');
for (const node of nodes) for (const dep of node.dependsOn || []) assert(nodeSet.has(dep), `${node.id} depends on missing node ${dep}`);
const visiting = new Set(), visited = new Set();
function visit(id) {
  if (visiting.has(id)) { errors.push(`cycle detected at ${id}`); return; }
  if (visited.has(id)) return;
  visiting.add(id);
  const node = nodes.find(x=>x.id===id);
  for (const dep of node?.dependsOn || []) visit(dep);
  visiting.delete(id); visited.add(id);
}
for (const id of nodeIds) visit(id);

const signals = [
  ['J1-N01', /boundary|actor|responsibil/i],
  ['J1-N02', /component|layer|decomposition/i],
  ['J1-N03', /interface|contract|schema|version/i],
  ['J1-N04', /data flow|state|sequence/i],
  ['J1-N05', /deployment|runtime|network hop/i],
  ['J1-N06', /latency|throughput|utilization|queue/i],
  ['J1-N07', /bottleneck|critical path|dependency/i],
  ['J1-N08', /availability|failure|degrad|reliability/i],
  ['J1-N09', /logs|metrics|traces|observability/i],
  ['J1-N10', /documentation|trade-off|defense|architecture/i]
];
for (const [id,re] of signals) {
  const node = nodes.find(x=>x.id===id);
  assert(Boolean(node) && re.test(JSON.stringify(node)), `${id} missing required signal ${re}`);
}

const diagnostic = pack.diagnostic || {};
assert(diagnostic.D0?.weight === 0.25, 'J1 D0 weight must be 0.25');
assert(diagnostic.D1?.weight === 0.5, 'J1 D1 weight must be 0.5');
assert(diagnostic.D2?.weight === 0.25, 'J1 D2 weight must be 0.25');
assert((diagnostic.D0?.items || []).length === 18, 'J1 D0 must contain 18 recall items');
assert((diagnostic.D1?.items || []).length === 12, 'J1 D1 must contain 12 application items');
assert((diagnostic.D2?.items || []).length === 8, 'J1 D2 must contain 8 oral items');
const diagItems = [...(diagnostic.D0?.items||[]), ...(diagnostic.D1?.items||[]), ...(diagnostic.D2?.items||[])];
assert(unique(diagItems.map(x=>x.id)), 'J1 diagnostic IDs must be unique');
for (const item of diagItems) assert(nodeSet.has(item.node), `${item.id} references missing node ${item.node}`);
assert((diagnostic.D2?.items || []).every(x => typeof x.promptRu === 'string' && x.promptRu.length > 30), 'J1 D2 must include substantive Russian prompts');

const misconceptions = pack.criticalMisconceptions || [];
assert(misconceptions.length >= 12, 'J1 must include at least 12 critical misconceptions');
assert(unique(misconceptions.map(x=>x.id)), 'J1 misconception IDs must be unique');
for (const m of misconceptions) assert(nodeSet.has(m.node), `${m.id} references missing node ${m.node}`);
const routes = pack.repairRoutes || [];
assert(routes.length >= 8, 'J1 must have at least 8 repair routes');
assert(unique(routes.map(x=>x.id)), 'J1 repair route IDs must be unique');
for (const route of routes) {
  for (const nodeId of route.triggerNodes || []) assert(nodeSet.has(nodeId), `${route.id} trigger references missing node ${nodeId}`);
  for (const token of route.route || []) {
    if (/^J1-N\d+$/.test(token)) assert(nodeSet.has(token), `${route.id} references missing node ${token}`);
    if (/^s_/.test(token)) assert(lessonMap.has(token), `${route.id} references missing Systems lesson ${token}`);
  }
}

const requiredScope = new Set(pack.scopeGuard?.required || []);
for (const required of [
  'system boundary and actors','components and responsibilities','interfaces and data contracts','end-to-end data flow and state ownership','deployment topology','latency throughput utilization and capacity','bottleneck and dependency analysis','availability reliability and failure propagation','observability evidence','architecture documentation and trade-offs'
]) assert(requiredScope.has(required), `J1 scope missing ${required}`);

const positiveText = JSON.stringify({defaultReferenceCase:pack.defaultReferenceCase,nodes:pack.nodes,diagnostic:pack.diagnostic,repairRoutes:pack.repairRoutes});
assert(!/UGV|USV|PID|LQR|Kalman|FPGA|PLC|SCADA|ROS specialization|robot-specific|sensor-control/i.test(positiveText), 'J1 active/default route must remain information-system neutral');
assert(!/Kubernetes|service mesh|cloud certification/i.test(positiveText), 'J1 active route must avoid platform/certification detours');

// Independent architecture sanity: detect dependency cycles.
function hasCycle(graph) {
  const seen = new Set(), active = new Set();
  function dfs(v) {
    if (active.has(v)) return true;
    if (seen.has(v)) return false;
    seen.add(v); active.add(v);
    for (const n of graph[v] || []) if (dfs(n)) return true;
    active.delete(v); return false;
  }
  return Object.keys(graph).some(dfs);
}
assert(hasCycle({client:['service'],service:['db'],db:[]}) === false, 'acyclic dependency invariant failed');
assert(hasCycle({a:['b'],b:['c'],c:['a']}) === true, 'cycle detection invariant failed');

// Independent latency sanity: serial critical path sums component/hop latency.
const serialPathMs = [35, 70, 240, 55].reduce((a,b)=>a+b,0);
assert(serialPathMs === 400, 'serial latency-budget invariant failed');

// Independent availability sanity for independent serial dependencies.
function serialAvailability(values) { return values.reduce((a,b)=>a*b,1); }
const avail = serialAvailability([0.999,0.995,0.9995]);
assert(avail < 0.999 && avail > 0.992, 'serial availability invariant failed');

// Independent bottleneck evidence sanity.
const measurements = {client:40, service:75, database:760, network:25};
const bottleneck = Object.entries(measurements).sort((a,b)=>b[1]-a[1])[0][0];
assert(bottleneck === 'database', 'bottleneck measurement invariant failed');

for (const src of pack.sourceEvidence || []) {
  if (src.url) assert(/^https:\/\//.test(src.url), 'J1 URL evidence must use HTTPS');
}
assert((pack.sourceEvidence || []).some(x=>x.kind==='official_curriculum' && x.locked===true), 'J1 must preserve locked official curriculum evidence');

if (errors.length) {
  console.error(`J01_INFORMATION_SYSTEM_ARCHITECTURE_VALIDATION_FAIL (${errors.length})`);
  errors.forEach(e=>console.error(`- ${e}`));
  process.exit(1);
}
console.log('J01_INFORMATION_SYSTEM_ARCHITECTURE_VALIDATION_PASS');
console.log(JSON.stringify({nodes:nodes.length,D0:diagnostic.D0.items.length,D1:diagnostic.D1.items.length,D2:diagnostic.D2.items.length,misconceptions:misconceptions.length,repairRoutes:routes.length,reusedLessons:['s_p01_l1'],officialTargets:pack.officialTargets.map(x=>x.courseId)}, null, 2));
