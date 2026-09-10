'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const packPath = path.join(root, 'assets/data/prerequisite-packs/p06-database-fundamentals.json');
const prereqPath = path.join(root, 'assets/data/prerequisite-registry-iu5-2026.json');
const curriculumPath = path.join(root, 'assets/data/official-curriculum-iu5-2026.json');
const programmingLessonsPath = path.join(root, 'subjects/programming/data/lessons.json');

const pack = JSON.parse(fs.readFileSync(packPath, 'utf8'));
const prereq = JSON.parse(fs.readFileSync(prereqPath, 'utf8'));
const curriculum = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'));
const programmingLessons = JSON.parse(fs.readFileSync(programmingLessonsPath, 'utf8'));

const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const unique = values => new Set(values).size === values.length;

assert(pack.schema === 'bauman_prerequisite_pack_v1', 'unexpected P6 pack schema');
assert(pack.gateId === 'P6', 'pack gateId must be P6');
assert(pack.notOfficialAdministrativePrerequisite === true, 'P6 must be explicitly non-administrative prerequisite');
assert(pack.mastery?.target === 90, 'P6 target must be 90');
assert(pack.mastery?.applicationMinimum === 85, 'P6 application minimum must be 85');
assert(pack.mastery?.criticalMisconceptionsAllowed === 0, 'P6 must allow zero critical misconceptions');
assert(pack.implementationPolicy?.schedulerMutation === false, 'Pass05 must not mutate scheduler');
assert(pack.implementationPolicy?.writesDiagnosticScores === false, 'Pass05 must not write diagnostic scores');
assert(pack.implementationPolicy?.duplicatesExistingPR06PR15 === false, 'Pass05 must reuse PR06/PR15, not duplicate them');
assert(pack.implementationPolicy?.newTopLevelSubject === false, 'P6 must stay inside Programming rather than create another top-level subject');
assert(pack.implementationPolicy?.mainBranchMutation === false, 'Pass05 must not mutate main branch');

const registryGate = prereq.coreGates.find(x => x.id === 'P6');
assert(Boolean(registryGate), 'P6 missing from prerequisite registry');
assert(registryGate?.target === 90, 'P6 registry target must remain 90');
for (const topic of ['relational algebra','normalization','ACID','transactions','isolation-locking','indexes','B-tree/hash','query plan']) {
  assert((registryGate?.topics || []).some(x => x.toLowerCase().includes(topic.toLowerCase())), `P6 registry lost topic ${topic}`);
}

const disciplines = new Map(curriculum.disciplines.map(x => [x.id, x]));
const d06 = disciplines.get('d06');
const d10 = disciplines.get('d10');
assert(Boolean(d06), 'official d06 is missing');
assert(d06?.nameRu === 'Оптимизация баз данных систем машинного обучения', 'd06 title drifted from locked curriculum');
assert(d06?.credits === 4 && d06?.hours === 144, 'd06 must remain 4 credits / 144 hours');
assert(JSON.stringify(d06?.semesters) === JSON.stringify([1]), 'd06 must remain semester 1');
assert((d06?.assessment || []).includes('Экз'), 'd06 must retain exam assessment');
assert(Boolean(d10), 'official d10 is missing');
assert(d10?.nameRu === 'Постреляционные базы данных', 'd10 title drifted from locked curriculum');
assert(d10?.credits === 4 && d10?.hours === 144, 'd10 must remain 4 credits / 144 hours');
assert(JSON.stringify(d10?.semesters) === JSON.stringify([2]), 'd10 must remain semester 2');

const curriculumIds = new Set([
  ...curriculum.disciplines.map(x=>x.id),
  ...curriculum.practices.map(x=>x.id),
  ...curriculum.gia.map(x=>x.id),
  ...curriculum.electiveGroups.map(x=>x.id),
  ...curriculum.electiveGroups.flatMap(g=>g.options.map(x=>x.id))
]);
for (const target of pack.officialTargets || []) {
  assert(curriculumIds.has(target.courseId), `P6 references unknown official target ${target.courseId}`);
}
assert((pack.officialTargets||[]).some(x=>x.courseId==='d06' && x.role==='primary'), 'P6 must target d06 as primary');
assert((pack.officialTargets||[]).some(x=>x.courseId==='d10'), 'P6 must bridge to d10 Post-relational DB');

const lessonIds = new Set(programmingLessons.map(x=>x.id || x.lessonId).filter(Boolean));
for (const id of ['PR06','PR15']) assert(lessonIds.has(id), `existing Programming lesson ${id} is required for P6 reuse`);
const localReuseIds = new Set((pack.localReuse || []).flatMap(x=>x.lessonIds || []));
for (const id of ['PR06','PR15']) assert(localReuseIds.has(id), `P6 localReuse must include ${id}`);

const nodes = pack.nodes || [];
const nodeIds = nodes.map(x=>x.id);
const nodeSet = new Set(nodeIds);
assert(nodes.length === 11, `P6 expected 11 nodes, got ${nodes.length}`);
assert(unique(nodeIds), 'P6 node IDs must be unique');
assert(nodes.every((x,i)=>x.order===i+1), 'P6 node order must be contiguous 1..11');
for (const node of nodes) {
  for (const dep of node.dependsOn || []) assert(nodeSet.has(dep), `${node.id} depends on missing node ${dep}`);
}

const visiting = new Set(), visited = new Set();
function visit(id){
  if(visiting.has(id)){ errors.push(`cycle detected at ${id}`); return; }
  if(visited.has(id)) return;
  visiting.add(id);
  const node = nodes.find(x=>x.id===id);
  for(const dep of node?.dependsOn || []) visit(dep);
  visiting.delete(id);
  visited.add(id);
}
for(const id of nodeIds) visit(id);

const requiredNodeSignals = [
  ['P6-N02', /đại số quan hệ|relational algebra/i],
  ['P6-N03', /1NF|1НФ/],
  ['P6-N03', /BCNF|НФБК/],
  ['P6-N04', /window|окон/i],
  ['P6-N05', /ACID/i],
  ['P6-N06', /deadlock|взаимоблок/i],
  ['P6-N08', /B-tree/i],
  ['P6-N09', /cardinality|кардиналь/i],
  ['P6-N10', /EXPLAIN\/EXPLAIN ANALYZE/i],
  ['P6-N11', /ML|машин/i]
];
for (const [id, re] of requiredNodeSignals) {
  const node = nodes.find(x=>x.id===id);
  assert(Boolean(node) && re.test(JSON.stringify(node)), `${id} is missing required signal ${re}`);
}

const diagnostic = pack.diagnostic || {};
assert(diagnostic.D0?.weight === 0.25, 'P6 D0 weight must be 0.25');
assert(diagnostic.D1?.weight === 0.5, 'P6 D1 weight must be 0.5');
assert(diagnostic.D2?.weight === 0.25, 'P6 D2 weight must be 0.25');
assert((diagnostic.D0?.items||[]).length === 18, 'P6 D0 must contain 18 recall items');
assert((diagnostic.D1?.items||[]).length === 12, 'P6 D1 must contain 12 application items');
assert((diagnostic.D2?.items||[]).length === 8, 'P6 D2 must contain 8 oral/explain items');
const diagItems = [...(diagnostic.D0?.items||[]), ...(diagnostic.D1?.items||[]), ...(diagnostic.D2?.items||[])];
const diagIds = diagItems.map(x=>x.id);
assert(unique(diagIds), 'P6 diagnostic item IDs must be unique');
for(const item of diagItems) assert(nodeSet.has(item.node), `${item.id} references missing node ${item.node}`);
assert((diagnostic.D2?.items||[]).every(x=>typeof x.promptRu==='string' && x.promptRu.length>20), 'P6 D2 must contain Russian oral prompts');

const misconceptions = pack.criticalMisconceptions || [];
assert(misconceptions.length >= 10, 'P6 must include at least 10 critical misconceptions');
assert(unique(misconceptions.map(x=>x.id)), 'P6 misconception IDs must be unique');
for(const m of misconceptions) assert(nodeSet.has(m.node), `${m.id} references missing node ${m.node}`);

const routes = pack.repairRoutes || [];
assert(routes.length >= 7, 'P6 must have targeted repair routes');
assert(unique(routes.map(x=>x.id)), 'P6 repair route IDs must be unique');
for(const route of routes){
  for(const nodeId of route.triggerNodes || []) assert(nodeSet.has(nodeId), `${route.id} trigger references missing node ${nodeId}`);
  for(const token of route.route || []){
    if(/^P6-N\d+$/.test(token)) assert(nodeSet.has(token), `${route.id} route references missing node ${token}`);
    if(/^PR\d+$/.test(token)) assert(lessonIds.has(token), `${route.id} reuse route references missing lesson ${token}`);
  }
}

const requiredScope = new Set(pack.scopeGuard?.required || []);
for(const required of [
  'relational algebra',
  'functional dependencies and normalization',
  'ACID and transactions',
  'isolation anomalies, locking and deadlocks',
  'B-tree/hash/composite indexes',
  'query planner, cardinality and cost',
  'EXPLAIN/EXPLAIN ANALYZE workflow',
  'physical database design'
]) assert(requiredScope.has(required), `P6 scope missing ${required}`);

const activeText = JSON.stringify({nodes:pack.nodes, diagnostic:pack.diagnostic, criticalMisconceptions:pack.criticalMisconceptions, repairRoutes:pack.repairRoutes});
assert(!/Kubernetes|vendor administration certification|cloud-specific managed database certification/i.test(activeText), 'P6 active content must stay free of administration/cloud detours');

// Independent conceptual invariants for a canonical normalization example.
function closure(seed, fds){
  const out = new Set(seed);
  let changed = true;
  while(changed){
    changed = false;
    for(const fd of fds){
      if(fd.left.every(a=>out.has(a))){
        for(const a of fd.right){ if(!out.has(a)){ out.add(a); changed=true; } }
      }
    }
  }
  return out;
}
const attrs = ['student_id','student_name','course_id','course_name','teacher_id','teacher_name','grade'];
const fds = [
  {left:['student_id'],right:['student_name']},
  {left:['course_id'],right:['course_name','teacher_id']},
  {left:['teacher_id'],right:['teacher_name']},
  {left:['student_id','course_id'],right:['grade']}
];
const keyClosure = closure(['student_id','course_id'],fds);
assert(attrs.every(a=>keyClosure.has(a)), 'canonical normalization invariant: composite key must determine all attributes');
assert(!attrs.every(a=>closure(['student_id'],fds).has(a)), 'canonical normalization invariant: student_id alone must not be a key');
assert(!attrs.every(a=>closure(['course_id'],fds).has(a)), 'canonical normalization invariant: course_id alone must not be a key');

// Independent deadlock invariant: T1 waits T2 and T2 waits T1 must form a cycle.
function hasCycle(graph){
  const temp=new Set(), done=new Set();
  function dfs(v){
    if(temp.has(v)) return true;
    if(done.has(v)) return false;
    temp.add(v);
    for(const w of graph[v]||[]) if(dfs(w)) return true;
    temp.delete(v); done.add(v); return false;
  }
  return Object.keys(graph).some(dfs);
}
assert(hasCycle({T1:['T2'],T2:['T1']}) === true, 'deadlock cycle invariant failed');
assert(hasCycle({T1:['T2'],T2:[]}) === false, 'acyclic wait-for invariant failed');

// A unique-like predicate should be more selective than a 3-value categorical predicate in the canonical diagnostic case.
const rows = 10_000_000;
const uniqueSelectivity = 1/rows;
const threeValueSelectivity = 1/3;
assert(uniqueSelectivity < threeValueSelectivity, 'selectivity ordering invariant failed');

for(const src of pack.sourceEvidence || []) assert(/^https:\/\//.test(src.url||''), 'P6 source evidence must use explicit HTTPS URLs');
assert((pack.sourceEvidence||[]).some(x=>x.kind==='official_curriculum'), 'P6 must preserve official curriculum source evidence');
assert((pack.sourceEvidence||[]).some(x=>x.kind==='legacy_related_iu5_material'), 'P6 must clearly label related legacy IU5 material rather than present it as exact 2026 d06 syllabus');
assert(pack.practicePlatform?.officiallyRequiredByBauman2026Plan === false, 'PostgreSQL practice platform must not be presented as official Bauman requirement');

if(errors.length){
  console.error(`P06_DATABASE_FUNDAMENTALS_VALIDATION_FAIL (${errors.length})`);
  errors.forEach(e=>console.error(`- ${e}`));
  process.exit(1);
}
console.log('P06_DATABASE_FUNDAMENTALS_VALIDATION_PASS');
console.log(JSON.stringify({
  nodes:nodes.length,
  D0:diagnostic.D0.items.length,
  D1:diagnostic.D1.items.length,
  D2:diagnostic.D2.items.length,
  misconceptions:misconceptions.length,
  repairRoutes:routes.length,
  reusedLessons:['PR06','PR15'],
  officialTargets:pack.officialTargets.map(x=>x.courseId)
},null,2));
