'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const packPath = path.join(root, 'assets/data/prerequisite-packs/p09-markov-queueing-simulation.json');
const prereqPath = path.join(root, 'assets/data/prerequisite-registry-iu5-2026.json');
const curriculumPath = path.join(root, 'assets/data/official-curriculum-iu5-2026.json');
const pack = JSON.parse(fs.readFileSync(packPath, 'utf8'));
const prereq = JSON.parse(fs.readFileSync(prereqPath, 'utf8'));
const curriculum = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'));
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const unique = values => new Set(values).size === values.length;
const close = (a,b,eps=1e-9) => Math.abs(a-b) <= eps;

assert(pack.schema === 'bauman_prerequisite_pack_v1', 'unexpected P9 pack schema');
assert(pack.gateId === 'P9', 'pack gateId must be P9');
assert(pack.notOfficialAdministrativePrerequisite === true, 'P9 must be explicitly non-administrative prerequisite');
assert(pack.mastery?.target === 90, 'P9 target must be 90');
assert(pack.mastery?.applicationMinimum === 85, 'P9 application minimum must be 85');
assert(pack.mastery?.criticalMisconceptionsAllowed === 0, 'P9 must allow zero critical misconceptions');
assert(pack.implementationPolicy?.schedulerMutation === false, 'Pass04 must not mutate scheduler');
assert(pack.implementationPolicy?.writesDiagnosticScores === false, 'Pass04 must not write diagnostic scores');
assert(pack.implementationPolicy?.duplicatesExistingP3Theory === false, 'Pass04 must reuse, not duplicate, P3 theory');

const registryGate = prereq.coreGates.find(x => x.id === 'P9');
assert(Boolean(registryGate), 'P9 missing from prerequisite registry');
assert(registryGate?.target === 90, 'P9 registry target must remain 90');
assert(pack.upstream?.critical?.includes('P3'), 'P9 must depend critically on P3 probability/statistics');

const curriculumIds = new Set([
  ...curriculum.disciplines.map(x=>x.id),
  ...curriculum.practices.map(x=>x.id),
  ...curriculum.gia.map(x=>x.id),
  ...curriculum.electiveGroups.map(x=>x.id),
  ...curriculum.electiveGroups.flatMap(g=>g.options.map(x=>x.id))
]);
for (const target of pack.officialTargets || []) {
  assert(curriculumIds.has(target.courseId), `P9 references unknown official target ${target.courseId}`);
}
assert((pack.officialTargets||[]).some(x=>x.courseId==='d03'), 'P9 must target d03 Analytical Models');
assert((pack.officialTargets||[]).some(x=>x.courseId==='d09'), 'P9 must bridge to d09 Reliability');

const nodes = pack.nodes || [];
const nodeIds = nodes.map(x=>x.id);
const nodeSet = new Set(nodeIds);
assert(nodes.length === 11, `P9 expected 11 nodes, got ${nodes.length}`);
assert(unique(nodeIds), 'P9 node IDs must be unique');
assert(nodes.every((x,i)=>x.order===i+1), 'P9 node order must be contiguous 1..11');
for (const node of nodes) {
  for (const dep of node.dependsOn || []) assert(nodeSet.has(dep), `${node.id} depends on missing node ${dep}`);
}

// Detect dependency cycles.
const visiting = new Set(), visited = new Set();
function visit(id){
  if(visiting.has(id)){errors.push(`cycle detected at ${id}`); return;}
  if(visited.has(id))return;
  visiting.add(id);
  const node = nodes.find(x=>x.id===id);
  for(const dep of node?.dependsOn || []) visit(dep);
  visiting.delete(id); visited.add(id);
}
for(const id of nodeIds) visit(id);

const formulas = nodes.flatMap(n => n.formulas || []);
const formulaIds = formulas.map(x=>x.id);
assert(unique(formulaIds), 'P9 formula IDs must be unique');
for(const id of Array.from({length:16},(_,i)=>`P9-F${String(i+1).padStart(2,'0')}`)) {
  assert(formulaIds.includes(id), `missing required P9 formula ${id}`);
}

const diagnostic = pack.diagnostic || {};
assert(diagnostic.D0?.weight === 0.25, 'P9 D0 weight must be 0.25');
assert(diagnostic.D1?.weight === 0.5, 'P9 D1 weight must be 0.5');
assert(diagnostic.D2?.weight === 0.25, 'P9 D2 weight must be 0.25');
assert((diagnostic.D0?.items||[]).length === 16, 'P9 D0 must contain 16 recall items');
assert((diagnostic.D1?.items||[]).length === 12, 'P9 D1 must contain 12 application items');
assert((diagnostic.D2?.items||[]).length === 8, 'P9 D2 must contain 8 oral/explain items');
const diagItems = [...(diagnostic.D0?.items||[]), ...(diagnostic.D1?.items||[]), ...(diagnostic.D2?.items||[])];
const diagIds = diagItems.map(x=>x.id);
assert(unique(diagIds), 'P9 diagnostic item IDs must be unique');
for(const item of diagItems) assert(nodeSet.has(item.node), `${item.id} references missing node ${item.node}`);

const misconceptions = pack.criticalMisconceptions || [];
assert(misconceptions.length >= 8, 'P9 must include at least 8 critical misconceptions');
assert(unique(misconceptions.map(x=>x.id)), 'P9 misconception IDs must be unique');
for(const m of misconceptions) assert(nodeSet.has(m.node), `${m.id} references missing node ${m.node}`);

for(const route of pack.repairRoutes || []){
  for(const nodeId of route.triggerNodes || []) assert(nodeSet.has(nodeId), `${route.id} trigger references missing node ${nodeId}`);
  for(const token of route.route || []){
    if(/^P9-N\d+$/.test(token)) assert(nodeSet.has(token), `${route.id} route references missing node ${token}`);
  }
}

const requiredScope = new Set(pack.scopeGuard?.required || []);
for(const required of ['Poisson process','Markov chains/CTMC bridge','M/M/1','M/M/c',"Little's law",'discrete-event simulation']) {
  assert(requiredScope.has(required), `P9 scope missing ${required}`);
}
const activeText = JSON.stringify({nodes:pack.nodes, diagnostic:pack.diagnostic, criticalMisconceptions:pack.criticalMisconceptions, repairRoutes:pack.repairRoutes});
assert(!/PID|LQR|Kalman|sensor fusion|robot dynamics|FPGA|PLC|SCADA/i.test(activeText), 'P9 active learning content must stay free of optional control/hardware detours');

// Independent numeric invariants: fail CI if canonical queue formulas drift.
function mm1(lambda,mu){
  const rho=lambda/mu;
  return {rho,L:rho/(1-rho),Lq:rho*rho/(1-rho),W:1/(mu-lambda),Wq:rho/(mu-lambda)};
}
const q1=mm1(8,10);
assert(close(q1.rho,0.8) && close(q1.L,4) && close(q1.Lq,3.2) && close(q1.W,0.5) && close(q1.Wq,0.4), 'M/M/1 canonical invariant failed');
assert(close(q1.L,8*q1.W) && close(q1.Lq,8*q1.Wq), "M/M/1 Little's law invariant failed");

function factorial(n){let v=1; for(let i=2;i<=n;i++)v*=i; return v;}
function mmc(lambda,mu,c){
  const a=lambda/mu, rho=lambda/(c*mu);
  let sum=0; for(let n=0;n<c;n++) sum += Math.pow(a,n)/factorial(n);
  const tail=Math.pow(a,c)/(factorial(c)*(1-rho));
  const P0=1/(sum+tail);
  const Pwait=tail*P0;
  const Lq=Pwait*rho/(1-rho);
  const Wq=Lq/lambda;
  const W=Wq+1/mu;
  const L=lambda*W;
  return {a,rho,P0,Pwait,Lq,Wq,W,L};
}
const q2=mmc(6,4,2);
assert(close(q2.rho,0.75), 'M/M/2 rho invariant failed');
assert(close(q2.P0,1/7), 'M/M/2 P0 invariant failed');
assert(close(q2.Pwait,4.5/7), 'M/M/2 Erlang-C invariant failed');
assert(close(q2.Lq,27/14), 'M/M/2 Lq invariant failed');
assert(close(q2.Wq,9/28), 'M/M/2 Wq invariant failed');

for(const src of pack.sourceEvidence || []) assert(/^https:\/\//.test(src.url||''), 'P9 source evidence must use explicit HTTPS URLs');
assert((pack.sourceEvidence||[]).some(x=>x.kind==='official_curriculum'), 'P9 must preserve official curriculum source evidence');
assert((pack.sourceEvidence||[]).some(x=>x.kind==='iu5_public_learning_material'), 'P9 must preserve IU5 public learning-material evidence');

if(errors.length){
  console.error(`P09_MARKOV_QUEUEING_VALIDATION_FAIL (${errors.length})`);
  errors.forEach(e=>console.error(`- ${e}`));
  process.exit(1);
}
console.log('P09_MARKOV_QUEUEING_VALIDATION_PASS');
console.log(JSON.stringify({nodes:nodes.length, formulas:formulas.length, D0:diagnostic.D0.items.length, D1:diagnostic.D1.items.length, D2:diagnostic.D2.items.length, misconceptions:misconceptions.length, officialTargets:pack.officialTargets.map(x=>x.courseId)},null,2));
