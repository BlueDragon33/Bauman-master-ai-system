'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const packPath = path.join(root, 'assets/data/prerequisite-packs/p04-discrete-algorithms-data-structures.json');
const prereqPath = path.join(root, 'assets/data/prerequisite-registry-iu5-2026.json');
const curriculumPath = path.join(root, 'assets/data/official-curriculum-iu5-2026.json');
const lessonsPath = path.join(root, 'subjects/programming/data/lessons.json');
const mathSpinePath = path.join(root, 'subjects/math/data/discipline_spine.json');

const pack = JSON.parse(fs.readFileSync(packPath, 'utf8'));
const prereq = JSON.parse(fs.readFileSync(prereqPath, 'utf8'));
const curriculum = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'));
const lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));
const mathSpine = JSON.parse(fs.readFileSync(mathSpinePath, 'utf8'));

const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const unique = values => new Set(values).size === values.length;

assert(pack.schema === 'bauman_prerequisite_pack_v1', 'unexpected P4 pack schema');
assert(pack.gateId === 'P4', 'pack gateId must be P4');
assert(pack.notOfficialAdministrativePrerequisite === true, 'P4 must be explicitly non-administrative prerequisite');
assert(pack.mastery?.target === 88, 'P4 target must match registry target 88');
assert(pack.mastery?.applicationMinimum === 85, 'P4 application minimum must be 85');
assert(pack.mastery?.criticalMisconceptionsAllowed === 0, 'P4 must allow zero critical misconceptions');
assert(pack.implementationPolicy?.schedulerMutation === false, 'Pass06 must not mutate scheduler');
assert(pack.implementationPolicy?.writesDiagnosticScores === false, 'Pass06 must not write diagnostic scores');
assert(pack.implementationPolicy?.duplicatesExistingPR02PR10PR11 === false, 'Pass06 must reuse PR02/PR10/PR11');
assert(pack.implementationPolicy?.newTopLevelSubject === false, 'P4 must remain inside existing subject architecture');
assert(pack.implementationPolicy?.mainBranchMutation === false, 'Pass06 must not mutate main branch');

const registryGate = prereq.coreGates.find(x => x.id === 'P4');
assert(Boolean(registryGate), 'P4 missing from prerequisite registry');
assert(registryGate?.target === 88, 'P4 registry target must remain 88');
for (const topic of ['logic-tập hợp-quan hệ','độ phức tạp','array-list','stack-queue','hash','tree','graph','sorting-searching','BFS-DFS','recursion']) {
  assert((registryGate?.topics || []).some(x => x.toLowerCase().includes(topic.toLowerCase())), `P4 registry lost topic ${topic}`);
}

const disciplines = new Map(curriculum.disciplines.map(x => [x.id, x]));
const d05 = disciplines.get('d05');
const d06 = disciplines.get('d06');
const d10 = disciplines.get('d10');
const d18 = disciplines.get('d18');
assert(d05?.nameRu === 'Объектно-ориентированное проектирование автоматизированных систем обработки информации и управления', 'd05 title drifted');
assert(d05?.credits === 6 && d05?.hours === 216 && JSON.stringify(d05?.semesters) === JSON.stringify([1]), 'd05 must remain 6 credits / 216 hours / semester 1');
assert(d06?.credits === 4 && d06?.hours === 144 && JSON.stringify(d06?.semesters) === JSON.stringify([1]), 'd06 must remain 4 credits / 144 hours / semester 1');
assert(d10?.nameRu === 'Постреляционные базы данных' && d10?.credits === 4 && JSON.stringify(d10?.semesters) === JSON.stringify([2]), 'd10 must remain official semester-2 post-relational DB');
assert(d18?.nameRu === 'Миварные технологии логического искусственного интеллекта' && d18?.credits === 4 && JSON.stringify(d18?.semesters) === JSON.stringify([4]), 'd18 must remain official semester-4 Mivar course');
const e02 = curriculum.electiveGroups.find(x => x.id === 'e02');
const e02a = e02?.options?.find(x => x.id === 'e02a');
assert(Boolean(e02a) && e02a.nameRu === 'Технологии обработки больших данных', 'e02a Big Data elective missing/drifted');

const officialIds = new Set([
  ...curriculum.disciplines.map(x=>x.id),
  ...curriculum.practices.map(x=>x.id),
  ...curriculum.gia.map(x=>x.id),
  ...curriculum.electiveGroups.map(x=>x.id),
  ...curriculum.electiveGroups.flatMap(g=>g.options.map(x=>x.id))
]);
for (const target of pack.officialTargets || []) assert(officialIds.has(target.courseId), `P4 references unknown official target ${target.courseId}`);
for (const id of ['d05','d06','d10','d18','e02a']) assert((pack.officialTargets||[]).some(x=>x.courseId===id), `P4 must map to ${id}`);

const lessonMap = new Map(lessons.map(x=>[x.id || x.lessonId, x]));
for (const id of ['PR02','PR10','PR11']) assert(lessonMap.has(id), `existing Programming lesson ${id} required for P4 reuse`);
assert(lessonMap.get('PR02')?.title === 'Tư duy thuật toán và độ phức tạp', 'PR02 identity drifted');
assert(lessonMap.get('PR10')?.title === 'Pseudocode và giải thích thuật toán bằng tiếng Nga', 'PR10 identity drifted');
assert(lessonMap.get('PR11')?.title === 'Cấu trúc dữ liệu nhập môn', 'PR11 identity drifted');
const reuseIds = new Set((pack.localReuse||[]).flatMap(x=>x.lessonIds||[]));
for (const id of ['PR02','PR10','PR11']) assert(reuseIds.has(id), `P4 localReuse must include ${id}`);
const spineIds = new Set((mathSpine.disciplines||[]).map(x=>x.id));
for (const id of ['math_language_logic','discrete_graph_db_knowledge']) assert(spineIds.has(id), `P4 references missing Math spine ${id}`);

const nodes = pack.nodes || [];
const nodeIds = nodes.map(x=>x.id);
const nodeSet = new Set(nodeIds);
assert(nodes.length === 10, `P4 expected 10 nodes, got ${nodes.length}`);
assert(unique(nodeIds), 'P4 node IDs must be unique');
assert(nodes.every((x,i)=>x.order===i+1), 'P4 node order must be contiguous 1..10');
for (const node of nodes) for (const dep of node.dependsOn || []) assert(nodeSet.has(dep), `${node.id} depends on missing node ${dep}`);

const visiting = new Set(), visited = new Set();
function visit(id){
  if(visiting.has(id)){ errors.push(`cycle detected at ${id}`); return; }
  if(visited.has(id)) return;
  visiting.add(id);
  const node = nodes.find(x=>x.id===id);
  for(const dep of node?.dependsOn || []) visit(dep);
  visiting.delete(id); visited.add(id);
}
for(const id of nodeIds) visit(id);

const requiredSignals = [
  ['P4-N01', /logic|mệnh đề|quan hệ/i],
  ['P4-N02', /Big-O|phức tạp/i],
  ['P4-N03', /linked list|liên kết/i],
  ['P4-N04', /collision|va chạm/i],
  ['P4-N05', /BST|tree|cây/i],
  ['P4-N06', /recursion|đệ quy|call stack/i],
  ['P4-N07', /binary search|nhị phân/i],
  ['P4-N08', /BFS/i],
  ['P4-N08', /DFS/i],
  ['P4-N09', /O\(V\+E\)/],
  ['P4-N10', /Mivar|мивар/i]
];
for (const [id,re] of requiredSignals){
  const node=nodes.find(x=>x.id===id);
  assert(Boolean(node) && re.test(JSON.stringify(node)), `${id} missing required signal ${re}`);
}

const diagnostic = pack.diagnostic || {};
assert(diagnostic.D0?.weight === 0.25, 'P4 D0 weight must be 0.25');
assert(diagnostic.D1?.weight === 0.5, 'P4 D1 weight must be 0.5');
assert(diagnostic.D2?.weight === 0.25, 'P4 D2 weight must be 0.25');
assert((diagnostic.D0?.items||[]).length === 18, 'P4 D0 must contain 18 recall items');
assert((diagnostic.D1?.items||[]).length === 12, 'P4 D1 must contain 12 application items');
assert((diagnostic.D2?.items||[]).length === 8, 'P4 D2 must contain 8 oral items');
const diagItems=[...(diagnostic.D0?.items||[]),...(diagnostic.D1?.items||[]),...(diagnostic.D2?.items||[])];
assert(unique(diagItems.map(x=>x.id)), 'P4 diagnostic item IDs must be unique');
for(const item of diagItems) assert(nodeSet.has(item.node), `${item.id} references missing node ${item.node}`);
assert((diagnostic.D2?.items||[]).every(x=>typeof x.promptRu==='string' && x.promptRu.length>20), 'P4 D2 must include Russian oral prompts');

const misconceptions=pack.criticalMisconceptions||[];
assert(misconceptions.length>=10, 'P4 must include at least 10 critical misconceptions');
assert(unique(misconceptions.map(x=>x.id)), 'P4 misconception IDs must be unique');
for(const m of misconceptions) assert(nodeSet.has(m.node), `${m.id} references missing node ${m.node}`);

const routes=pack.repairRoutes||[];
assert(routes.length>=8, 'P4 must have at least 8 targeted repair routes');
assert(unique(routes.map(x=>x.id)), 'P4 repair-route IDs must be unique');
for(const route of routes){
  for(const nodeId of route.triggerNodes||[]) assert(nodeSet.has(nodeId), `${route.id} trigger references missing node ${nodeId}`);
  for(const token of route.route||[]){
    if(/^P4-N\d+$/.test(token)) assert(nodeSet.has(token), `${route.id} references missing node ${token}`);
    if(/^PR\d+$/.test(token)) assert(lessonMap.has(token), `${route.id} references missing reused lesson ${token}`);
  }
}

const requiredScope=new Set(pack.scopeGuard?.required||[]);
for(const required of ['logic, sets and relations','asymptotic time/space complexity','array and linked list','stack and queue','hash table and collision handling','tree and tree traversal','sorting and binary search','recursion and call-stack reasoning','graph representation','BFS and DFS','graph complexity reasoning','relation/graph bridge to database and logical AI']) {
  assert(requiredScope.has(required), `P4 scope missing ${required}`);
}
const activeText=JSON.stringify({nodes:pack.nodes,diagnostic:pack.diagnostic,criticalMisconceptions:pack.criticalMisconceptions,repairRoutes:pack.repairRoutes});
assert(!/segment tree|Fenwick|suffix array|suffix tree|min-cost-flow|computational geometry/i.test(activeText), 'P4 active content must stay free of contest detours');
assert(!/UGV|USV|robot dynamics|PID|LQR|Kalman|FPGA|PLC|SCADA/i.test(activeText), 'P4 active content must stay topic-neutral and free of optional project/control detours');

// Independent algorithm invariants.
function binarySearch(a,x){let lo=0,hi=a.length-1;while(lo<=hi){const mid=lo+Math.floor((hi-lo)/2);if(a[mid]===x)return mid;if(a[mid]<x)lo=mid+1;else hi=mid-1;}return -1;}
const sorted=[1,3,5,7,9,11,13,15];
assert(binarySearch(sorted,1)===0 && binarySearch(sorted,15)===7 && binarySearch(sorted,8)===-1, 'binary-search invariant failed');

function bfs(graph,start){const q=[start],seen=new Set([start]),dist={[start]:0};for(let i=0;i<q.length;i++){const v=q[i];for(const w of graph[v]||[]){if(!seen.has(w)){seen.add(w);dist[w]=dist[v]+1;q.push(w);}}}return {order:q,dist};}
const graph={A:['B','C'],B:['A','D'],C:['A','D'],D:['B','C','E'],E:['D']};
const b=bfs(graph,'A');
assert(b.dist.E===3, 'BFS shortest-path-by-edge-count invariant failed');
assert(new Set(b.order).size===5, 'BFS visitation uniqueness invariant failed');

function dfs(graph,start){const seen=new Set(),order=[];function go(v){if(seen.has(v))return;seen.add(v);order.push(v);for(const w of graph[v]||[])go(w);}go(start);return order;}
const d=dfs(graph,'A');
assert(new Set(d).size===5, 'DFS reachability invariant failed');

// Hash collisions must be possible even when keys differ.
const h=x=>x%8;
assert(h(1)===h(9) && 1!==9, 'hash-collision sanity invariant failed');

for(const src of pack.sourceEvidence||[]) assert(/^https:\/\//.test(src.url||''), 'P4 source evidence must use explicit HTTPS URLs');
assert((pack.sourceEvidence||[]).some(x=>x.kind==='official_curriculum'), 'P4 must preserve official curriculum source evidence');

if(errors.length){
  console.error(`P04_DISCRETE_ALGORITHMS_DATA_STRUCTURES_VALIDATION_FAIL (${errors.length})`);
  errors.forEach(e=>console.error(`- ${e}`));
  process.exit(1);
}
console.log('P04_DISCRETE_ALGORITHMS_DATA_STRUCTURES_VALIDATION_PASS');
console.log(JSON.stringify({nodes:nodes.length,D0:diagnostic.D0.items.length,D1:diagnostic.D1.items.length,D2:diagnostic.D2.items.length,misconceptions:misconceptions.length,repairRoutes:routes.length,reusedLessons:['PR02','PR10','PR11'],officialTargets:pack.officialTargets.map(x=>x.courseId)},null,2));
