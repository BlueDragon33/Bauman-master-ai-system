'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pack = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/prerequisite-packs/p07-linux-os-networks.json'), 'utf8'));
const prereq = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/prerequisite-registry-iu5-2026.json'), 'utf8'));
const curriculum = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/official-curriculum-iu5-2026.json'), 'utf8'));
const lessons = JSON.parse(fs.readFileSync(path.join(root, 'subjects/programming/data/lessons.json'), 'utf8'));

const errors=[];
const assert=(condition,message)=>{if(!condition)errors.push(message);};
const unique=values=>new Set(values).size===values.length;

assert(pack.schema==='bauman_prerequisite_pack_v1','unexpected P7 pack schema');
assert(pack.gateId==='P7','pack gateId must be P7');
assert(pack.notOfficialAdministrativePrerequisite===true,'P7 must be explicitly non-administrative prerequisite');
assert(pack.mastery?.target===85,'P7 target must match registry target 85');
assert(pack.mastery?.applicationMinimum===85,'P7 application minimum must be 85');
assert(pack.mastery?.criticalMisconceptionsAllowed===0,'P7 must allow zero critical misconceptions');
assert(pack.implementationPolicy?.schedulerMutation===false,'Pass07 must not mutate scheduler');
assert(pack.implementationPolicy?.writesDiagnosticScores===false,'Pass07 must not write diagnostic scores');
assert(pack.implementationPolicy?.newTopLevelSubject===false,'P7 must remain inside Programming');
assert(pack.implementationPolicy?.requiresDockerForReady===false,'Docker must not become mandatory for P7 READY');
assert(pack.implementationPolicy?.mainBranchMutation===false,'Pass07 must not mutate main');

const registryGate=prereq.coreGates.find(x=>x.id==='P7');
assert(Boolean(registryGate),'P7 missing from prerequisite registry');
assert(registryGate?.target===85,'P7 registry target must remain 85');
for(const topic of ['shell-files-permissions','process-thread','memory-filesystem','SSH','TCP/IP','TCP-UDP','port-socket','HTTP','client-server','environment-package management']){
  assert((registryGate?.topics||[]).some(x=>x.toLowerCase().includes(topic.toLowerCase())),`P7 registry lost topic ${topic}`);
}

const disciplines=new Map(curriculum.disciplines.map(x=>[x.id,x]));
assert(disciplines.get('d06')?.nameRu==='Оптимизация баз данных систем машинного обучения','d06 identity drifted');
assert(disciplines.get('d10')?.nameRu==='Постреляционные базы данных','d10 identity drifted');
assert(disciplines.get('d15')?.nameRu==='Технологии разработки программного обеспечения','d15 identity drifted');
const e01=curriculum.electiveGroups.find(x=>x.id==='e01');
const e02=curriculum.electiveGroups.find(x=>x.id==='e02');
assert(Boolean(e01) && e01.semester===3,'e01 security elective group missing/drifted');
assert(Boolean(e02?.options?.find(x=>x.id==='e02a' && x.nameRu==='Технологии обработки больших данных')),'e02a Big Data elective missing/drifted');
assert(curriculum.practices.find(x=>x.id==='p03')?.nameRu==='Эксплуатационная практика','p03 operational practice missing/drifted');

const officialIds=new Set([
  ...curriculum.disciplines.map(x=>x.id),
  ...curriculum.practices.map(x=>x.id),
  ...curriculum.gia.map(x=>x.id),
  ...curriculum.electiveGroups.map(x=>x.id),
  ...curriculum.electiveGroups.flatMap(g=>g.options.map(x=>x.id))
]);
for(const target of pack.officialTargets||[]) assert(officialIds.has(target.courseId),`P7 references unknown official target ${target.courseId}`);
for(const id of ['d06','d10','d15','e01','e02a','p03']) assert((pack.officialTargets||[]).some(x=>x.courseId===id),`P7 must map to ${id}`);

const lessonMap=new Map(lessons.map(x=>[x.id||x.lessonId,x]));
for(const id of ['PR01','PR27','PR30']) assert(lessonMap.has(id),`P7 reuse lesson ${id} missing`);
assert(lessonMap.get('PR01')?.title==='Thiết lập môi trường Python, VS Code và Live Server','PR01 identity drifted');
assert(lessonMap.get('PR27')?.title==='API inference với FastAPI','PR27 identity drifted');
assert(lessonMap.get('PR30')?.title==='Docker nhập môn cho môi trường tái lập','PR30 identity drifted');
const reuseIds=new Set((pack.localReuse||[]).flatMap(x=>x.lessonIds||[]));
for(const id of ['PR01','PR27','PR30']) assert(reuseIds.has(id),`P7 localReuse must include ${id}`);

const nodes=pack.nodes||[];
const nodeIds=nodes.map(x=>x.id);
const nodeSet=new Set(nodeIds);
assert(nodes.length===10,`P7 expected 10 nodes, got ${nodes.length}`);
assert(unique(nodeIds),'P7 node IDs must be unique');
assert(nodes.every((x,i)=>x.order===i+1),'P7 node order must be contiguous 1..10');
for(const node of nodes) for(const dep of node.dependsOn||[]) assert(nodeSet.has(dep),`${node.id} depends on missing node ${dep}`);
const visiting=new Set(),visited=new Set();
function visit(id){if(visiting.has(id)){errors.push(`cycle detected at ${id}`);return;}if(visited.has(id))return;visiting.add(id);const node=nodes.find(x=>x.id===id);for(const dep of node?.dependsOn||[])visit(dep);visiting.delete(id);visited.add(id);}
for(const id of nodeIds)visit(id);

const signals=[
  ['P7-N01',/absolute|relative|pwd|đường dẫn/i],
  ['P7-N02',/rwx|permission|quyền/i],
  ['P7-N03',/process|thread|stdout|stderr/i],
  ['P7-N04',/virtual memory|filesystem|file descriptor/i],
  ['P7-N05',/virtual environment|PATH/i],
  ['P7-N06',/SSH/i],
  ['P7-N07',/IPv4|DNS|port/i],
  ['P7-N08',/TCP|UDP|socket/i],
  ['P7-N09',/HTTP|URL|status code/i],
  ['P7-N10',/service|database|process|port/i]
];
for(const [id,re] of signals){const node=nodes.find(x=>x.id===id);assert(Boolean(node)&&re.test(JSON.stringify(node)),`${id} missing required signal ${re}`);}

const diagnostic=pack.diagnostic||{};
assert(diagnostic.D0?.weight===0.25,'P7 D0 weight must be 0.25');
assert(diagnostic.D1?.weight===0.5,'P7 D1 weight must be 0.5');
assert(diagnostic.D2?.weight===0.25,'P7 D2 weight must be 0.25');
assert((diagnostic.D0?.items||[]).length===18,'P7 D0 must contain 18 recall items');
assert((diagnostic.D1?.items||[]).length===12,'P7 D1 must contain 12 application items');
assert((diagnostic.D2?.items||[]).length===8,'P7 D2 must contain 8 oral items');
const diagItems=[...(diagnostic.D0?.items||[]),...(diagnostic.D1?.items||[]),...(diagnostic.D2?.items||[])];
assert(unique(diagItems.map(x=>x.id)),'P7 diagnostic IDs must be unique');
for(const item of diagItems)assert(nodeSet.has(item.node),`${item.id} references missing node ${item.node}`);
assert((diagnostic.D2?.items||[]).every(x=>typeof x.promptRu==='string'&&x.promptRu.length>20),'P7 D2 must include Russian prompts');

const misconceptions=pack.criticalMisconceptions||[];
assert(misconceptions.length>=10,'P7 must include at least 10 critical misconceptions');
assert(unique(misconceptions.map(x=>x.id)),'P7 misconception IDs must be unique');
for(const m of misconceptions)assert(nodeSet.has(m.node),`${m.id} references missing node ${m.node}`);
const routes=pack.repairRoutes||[];
assert(routes.length>=8,'P7 must have at least 8 repair routes');
assert(unique(routes.map(x=>x.id)),'P7 repair route IDs must be unique');
for(const route of routes){for(const nodeId of route.triggerNodes||[])assert(nodeSet.has(nodeId),`${route.id} trigger references missing node ${nodeId}`);for(const token of route.route||[]){if(/^P7-N\d+$/.test(token))assert(nodeSet.has(token),`${route.id} references missing node ${token}`);if(/^PR\d+$/.test(token))assert(lessonMap.has(token),`${route.id} references missing lesson ${token}`);}}

const requiredScope=new Set(pack.scopeGuard?.required||[]);
for(const required of ['Linux shell, paths and files','users, permissions and environment variables','process, thread, standard streams and exit status','memory and filesystem basics','package/environment management','SSH and remote workflow','IPv4/TCP-IP/DNS/ports basics','TCP versus UDP','sockets and client-server model','HTTP request-response basics','service/database connectivity troubleshooting']) assert(requiredScope.has(required),`P7 scope missing ${required}`);
const activeText=JSON.stringify({nodes:pack.nodes,diagnostic:pack.diagnostic,criticalMisconceptions:pack.criticalMisconceptions,repairRoutes:pack.repairRoutes});
assert(!/kernel compilation|kernel-module|CCNA|CCNP|Kubernetes|penetration testing|nftables|iptables.*deep/i.test(activeText),'P7 active content must stay free of sysadmin/network-cert detours');
assert(!/UGV|USV|PID|LQR|Kalman|FPGA|PLC|SCADA/i.test(activeText),'P7 active content must remain project/control neutral');

// Independent sanity invariants.
function modeBits(mode){return {owner:(mode>>6)&7,group:(mode>>3)&7,other:mode&7};}
const m=modeBits(0o640);
assert(m.owner===6&&m.group===4&&m.other===0,'permission 640 invariant failed');
function same24(a,b){const pa=a.split('.').map(Number),pb=b.split('.').map(Number);return pa.length===4&&pb.length===4&&pa.slice(0,3).every((v,i)=>v===pb[i]);}
assert(same24('192.168.1.42','192.168.1.99')===true,'/24 same-subnet invariant failed');
assert(same24('192.168.1.42','192.168.2.10')===false,'/24 different-subnet invariant failed');
const u=new URL('http://127.0.0.1:8080/api/predict?x=1');
assert(u.protocol==='http:'&&u.hostname==='127.0.0.1'&&u.port==='8080'&&u.pathname==='/api/predict'&&u.searchParams.get('x')==='1','HTTP URL decomposition invariant failed');
const validPort=p=>Number.isInteger(p)&&p>=1&&p<=65535;
assert(validPort(5432)&&validPort(8080)&&!validPort(0)&&!validPort(70000),'port-range invariant failed');

for(const src of pack.sourceEvidence||[])assert(/^https:\/\//.test(src.url||''),'P7 source evidence must use HTTPS');
assert((pack.sourceEvidence||[]).some(x=>x.kind==='official_curriculum'),'P7 must preserve official curriculum evidence');

if(errors.length){console.error(`P07_LINUX_OS_NETWORKS_VALIDATION_FAIL (${errors.length})`);errors.forEach(e=>console.error(`- ${e}`));process.exit(1);}
console.log('P07_LINUX_OS_NETWORKS_VALIDATION_PASS');
console.log(JSON.stringify({nodes:nodes.length,D0:diagnostic.D0.items.length,D1:diagnostic.D1.items.length,D2:diagnostic.D2.items.length,misconceptions:misconceptions.length,repairRoutes:routes.length,reusedLessons:['PR01','PR27','PR30'],officialTargets:pack.officialTargets.map(x=>x.courseId)},null,2));
