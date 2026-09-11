'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const readJson=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const pack=readJson('assets/data/prerequisite-packs/p00-technical-russian.json');
const prereq=readJson('assets/data/prerequisite-registry-iu5-2026.json');
const curriculum=readJson('assets/data/official-curriculum-iu5-2026.json');
const russianCurriculum=readJson('subjects/russian/data/curriculum.json');
const knowledgeIndex=readJson('subjects/russian/data/knowledge-index.json');
const manifest=readJson('subjects/russian/subject-manifest.json');
const errors=[];
const assert=(c,m)=>{if(!c)errors.push(m)};
const unique=a=>new Set(a).size===a.length;

assert(pack.schema==='bauman_prerequisite_pack_v1','unexpected P0 schema');
assert(pack.version==='P0_TECHNICAL_RUSSIAN_IU5_2026_V2_INTEGRITY_CORRECTED','P0 corrected version missing');
assert(pack.gateId==='P0','P0 gateId drifted');
assert(pack.notOfficialAdministrativePrerequisite===true,'P0 must remain non-administrative');
assert(pack.mastery?.target===90&&pack.mastery?.applicationMinimum===85,'P0 readiness thresholds drifted');
assert(pack.mastery?.masteredThreshold===95&&pack.mastery?.masteredApplicationMinimum===90,'P0 mastery thresholds drifted');
assert(pack.implementationPolicy?.excludesForeignLanguageCourseD01===true,'P0 must explicitly exclude d01');
assert(pack.implementationPolicy?.schedulerMutation===false,'P0 pack must not mutate scheduler');
assert(pack.implementationPolicy?.writesDiagnosticScores===false,'P0 pack must not write scores');
assert(pack.implementationPolicy?.newTopLevelSubject===false,'P0 must reuse Russian subject');

const p0=prereq.coreGates.find(x=>x.id==='P0');
assert(p0?.homeSubject==='russian'&&p0?.target===90,'registry P0 identity drifted');
const d01dep=prereq.courseDependencies.find(x=>x.courseId==='d01');
assert(d01dep&&d01dep.critical.length===0&&d01dep.support.length===0,'d01 must not depend on P0 Russian');
assert(/English|Л2/.test(d01dep?.note||''),'d01 dependency correction note missing');

const officialTargets=pack.officialTargets||[];
assert(!officialTargets.some(x=>x.courseId==='d01'),'P0 officialTargets must exclude d01 Foreign Language');
for(const id of ['d02','d03','d04','d05','d06','d15','p02','p04','g01']) assert(officialTargets.some(x=>x.courseId===id),`P0 missing intended technical/research target ${id}`);
for(const id of ['p04','g01']) assert(officialTargets.find(x=>x.courseId===id)?.role==='primary',`${id} must remain primary P0 target`);
assert((pack.sourceEvidence||[]).some(x=>x.url==='https://e-learning.bmstu.ru/l/course/index.php?categoryid=3'),'P0 must record L2 public evidence used for d01 separation');
assert(/does not replace the L2 English Foreign Language course d01/i.test(pack.scopeGuard?.rule||''),'scope guard must reject P0-as-d01 substitution');

assert(manifest.id==='russian','Russian manifest identity drifted');
for(const cap of ['learningSpeakingPractice','dialogueStudio','vocabFlashcards','mainPlanningBridge']) assert(manifest.capabilities?.[cap]===true,`Russian capability ${cap} missing`);
assert((russianCurriculum.modules||[]).some(x=>x.id==='hk1'&&(x.lessonIds||[]).join(',')==='R11,R12,R13,R14'),'Russian HK1 lesson identity drifted');
const knowledge=new Map(knowledgeIndex.map(x=>[x.id,x]));
const requiredLessons=['R05','R06','R07','R08','R09','R10','R11','R12','R13','R14'];
for(const id of requiredLessons) assert(knowledge.has(id),`P0 reuse lesson missing ${id}`);
const reused=new Set((pack.localReuse||[]).flatMap(x=>x.lessonIds||[]));
for(const id of requiredLessons) assert(reused.has(id),`P0 localReuse missing ${id}`);

const official=new Map([...curriculum.disciplines,...curriculum.practices,...curriculum.gia].map(x=>[x.id,x]));
assert(official.get('d01')?.department==='Л2','d01 must remain department Л2');
assert(official.get('d01')?.nameRu==='Иностранный язык','d01 identity drifted');
assert(JSON.stringify(official.get('d01')?.assessment)===JSON.stringify(['Зчт']),'d01 assessment drifted');
for(const target of officialTargets) assert(official.has(target.courseId),`P0 target references unknown official item ${target.courseId}`);

const verbs=pack.instructionVerbs||[];
assert(verbs.length>=14&&unique(verbs.map(x=>x.ru)),'P0 instruction verbs incomplete/duplicate');
for(const ru of ['найдите','вычислите','определите','докажите','объясните','обоснуйте','сравните','укажите','опишите','рассчитайте','постройте','разработайте','проанализируйте','оцените']) assert(verbs.some(x=>x.ru===ru),`P0 missing verb ${ru}`);

const glossaries=pack.courseMiniGlossaries||[];
assert(glossaries.length===6,'P0 must keep six mini-glossaries');
assert(!glossaries.some(g=>(g.courseIds||[]).includes('d01')),'P0 Russian glossary must not target d01');
for(const g of glossaries){assert((g.terms||[]).length>=12,`P0 glossary too small ${g.label}`);assert(unique(g.terms||[]),`P0 glossary duplicate terms ${g.label}`)}

const nodes=pack.nodes||[], nodeIds=nodes.map(x=>x.id), nodeSet=new Set(nodeIds);
assert(nodes.length===12&&unique(nodeIds),'P0 must keep 12 unique nodes');
assert(nodes.every((x,i)=>x.order===i+1),'P0 node order drifted');
for(const n of nodes) for(const dep of n.dependsOn||[]) assert(nodeSet.has(dep),`${n.id} missing dependency ${dep}`);
const visiting=new Set(),visited=new Set();
function visit(id){if(visiting.has(id)){errors.push(`P0 cycle at ${id}`);return}if(visited.has(id))return;visiting.add(id);for(const dep of nodes.find(x=>x.id===id)?.dependsOn||[])visit(dep);visiting.delete(id);visited.add(id)}
for(const id of nodeIds)visit(id);

const d=pack.diagnostic||{};
assert(d.D0?.weight===.25&&d.D1?.weight===.5&&d.D2?.weight===.25,'P0 diagnostic weights drifted');
assert((d.D0?.items||[]).length===20,'P0 D0 must have 20 items');
assert((d.D1?.items||[]).length===12,'P0 D1 must have 12 items');
assert((d.D2?.items||[]).length===10,'P0 D2 must have 10 items');
const allDiag=[...(d.D0?.items||[]),...(d.D1?.items||[]),...(d.D2?.items||[])];
assert(unique(allDiag.map(x=>x.id)),'P0 diagnostic IDs duplicate');
for(const item of allDiag) assert(nodeSet.has(item.node),`${item.id} points to missing node`);
assert((d.D2?.items||[]).every(x=>/[А-Яа-яЁё]/.test(x.promptRu||'')&&(x.promptRu||'').length>70),'P0 D2 Russian prompts too weak');

const misconceptions=pack.criticalMisconceptions||[];
assert(misconceptions.length>=14&&unique(misconceptions.map(x=>x.id)),'P0 misconceptions incomplete/duplicate');
assert(misconceptions.some(x=>/prerequisite.*d01|d01.*Л2/i.test(x.statement||'')),'P0 must guard against treating Russian as d01 prerequisite');
const routes=pack.repairRoutes||[];
assert(routes.length===8&&unique(routes.map(x=>x.id)),'P0 repair routes drifted');
for(const r of routes){assert((r.stopWhen||'').length>20,`${r.id} stop condition too weak`);for(const n of r.triggerNodes||[])assert(nodeSet.has(n),`${r.id} trigger missing ${n}`);for(const token of r.route||[]){if(/^P0-N\d+$/.test(token))assert(nodeSet.has(token),`${r.id} missing node ${token}`);if(/^R\d+$/.test(token))assert(knowledge.has(token),`${r.id} missing lesson ${token}`)}}

function score(d0,d1,d2){return .25*d0+.5*d1+.25*d2}
function ready(d0,d1,d2,critical){return score(d0,d1,d2)>=90&&d1>=85&&critical===0}
assert(score(90,90,90)===90&&ready(90,90,90,0),'P0 READY invariant failed');
assert(score(100,80,100)===90&&!ready(100,80,100,0),'P0 D1 floor invariant failed');
assert(!ready(100,100,100,1),'P0 critical misconception override failed');

if(errors.length){console.error(`P0_TECHNICAL_RUSSIAN_FAIL (${errors.length})`);for(const e of errors)console.error(`- ${e}`);process.exit(1)}
console.log('P0_TECHNICAL_RUSSIAN_INTEGRITY_CORRECTED_PASS');
console.log(JSON.stringify({d01Separated:true,targetCount:officialTargets.length,nodes:nodes.length,D0:d.D0.items.length,D1:d.D1.items.length,D2:d.D2.items.length,repairRoutes:routes.length},null,2));
