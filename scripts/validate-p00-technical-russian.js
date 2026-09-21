'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const readJson = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const pack = readJson('assets/data/prerequisite-packs/p00-technical-russian.json');
const prereq = readJson('assets/data/prerequisite-registry-iu5-2026.json');
const curriculum = readJson('assets/data/official-curriculum-iu5-2026.json');
const russianCurriculum = readJson('subjects/russian/data/curriculum.json');
const knowledgeIndex = readJson('subjects/russian/data/knowledge-index.json');
const manifest = readJson('subjects/russian/subject-manifest.json');

const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const unique = values => new Set(values).size === values.length;

assert(pack.schema === 'bauman_prerequisite_pack_v1', 'unexpected P0 pack schema');
assert(pack.gateId === 'P0', 'pack gateId must be P0');
assert(pack.version === 'P0_TECHNICAL_RUSSIAN_IU5_2026_V2_D01_INTEGRITY', 'P0 d01-integrity version missing');
assert(pack.notOfficialAdministrativePrerequisite === true, 'P0 must be explicitly non-administrative prerequisite');
assert(pack.mastery?.target === 90, 'P0 target must match registry target 90');
assert(pack.mastery?.applicationMinimum === 85, 'P0 application minimum must be 85');
assert(pack.mastery?.criticalMisconceptionsAllowed === 0, 'P0 must allow zero critical misconceptions');
assert(pack.mastery?.masteredThreshold === 95, 'P0 MASTERED threshold must be 95');
assert(pack.implementationPolicy?.schedulerMutation === false, 'Pass12 must not mutate scheduler');
assert(pack.implementationPolicy?.writesDiagnosticScores === false, 'Pass12 must not write diagnostic scores');
assert(pack.implementationPolicy?.newTopLevelSubject === false, 'P0 must reuse the Russian subject');
assert(pack.implementationPolicy?.overwritesExistingRussianLessons === false, 'Pass12 must not overwrite Russian lessons');
assert(pack.implementationPolicy?.duplicatesGeneralRussianCurriculum === false, 'Pass12 must not create a duplicate general-Russian curriculum');
assert(pack.implementationPolicy?.courseSpecificMappingOnly === true, 'P0 must remain a course-specific mapping layer');
assert(pack.implementationPolicy?.excludesForeignLanguageCourseD01 === true, 'P0 must explicitly exclude d01 Foreign Language');
assert(pack.implementationPolicy?.officialCourseNamesComeOnlyFromLockedCurriculum === true, 'official course identity policy missing');
assert(pack.implementationPolicy?.glossaryTermsAreLearningSupportNotOfficialSyllabusClaims === true, 'glossary evidence label missing');
assert(pack.implementationPolicy?.mainBranchMutation === false, 'Pass12 must not mutate main');

const gate = prereq.coreGates.find(x => x.id === 'P0');
assert(Boolean(gate), 'P0 missing from prerequisite registry');
assert(gate?.homeSubject === 'russian', 'P0 home subject must remain russian');
assert(gate?.target === 90, 'P0 registry target must remain 90');
for (const topic of ['đọc đề kỹ thuật','nghe chỉ dẫn lớp/lab','thuật ngữ toán-CNTT-AI-CSDL','trình bày lời giải','vấn đáp học thuật']) {
  assert((gate?.topics || []).includes(topic), `P0 registry lost topic ${topic}`);
}
const d01dep = prereq.courseDependencies.find(x => x.courseId === 'd01');
assert(d01dep && d01dep.critical.length === 0 && d01dep.support.length === 0, 'd01 must not depend on P0 Russian');
assert(/English|Л2/.test(d01dep?.note || ''), 'd01 English/L2 correction note missing');

assert(manifest.id === 'russian', 'Russian subject manifest identity drifted');
for (const cap of ['learningSpeakingPractice','dialogueStudio','vocabFlashcards','mainPlanningBridge']) {
  assert(manifest.capabilities?.[cap] === true, `Russian capability ${cap} missing`);
}
assert((russianCurriculum.modules || []).some(x => x.id === 'hk1' && (x.lessonIds || []).join(',') === 'R11,R12,R13,R14'), 'Russian HK1 module R11-R14 identity drifted');
assert((russianCurriculum.modules || []).some(x => x.id === 'prep' && (x.lessonIds || []).includes('R08') && (x.lessonIds || []).includes('R09')), 'Russian prep module must preserve R08/R09');

const knowledge = new Map(knowledgeIndex.map(x => [x.id, x]));
const requiredLessons = ['R05','R06','R07','R08','R09','R10','R11','R12','R13','R14'];
for (const id of requiredLessons) assert(knowledge.has(id), `P0 reuse lesson ${id} missing from knowledge index`);
const titleSignals = {
  R05:/Đọc đề Toán Tin/i,
  R06:/Nghe hiểu bài giảng|ghi chép/i,
  R07:/Ngôn ngữ lớp dự bị STANKIN/i,
  R08:/Từ vựng khoa học nền/i,
  R09:/Đọc hiểu đề thi dự bị/i,
  R10:/Phỏng vấn|trình bày ngắn/i,
  R11:/Đọc đề cương môn học|tín chỉ/i,
  R12:/Ghi chép bài giảng kỹ thuật/i,
  R13:/Thảo luận nhóm|báo cáo tiến độ/i,
  R14:/Trình bày bài toán kỹ thuật/i
};
for (const [id,re] of Object.entries(titleSignals)) assert(re.test(knowledge.get(id)?.title || ''), `${id} title identity drifted`);
const reusedIds = new Set((pack.localReuse || []).flatMap(x => x.lessonIds || []));
for (const id of requiredLessons) assert(reusedIds.has(id), `P0 localReuse must include ${id}`);

const allOfficial = new Map([
  ...curriculum.disciplines.map(x => [x.id, x]),
  ...curriculum.practices.map(x => [x.id, x]),
  ...curriculum.gia.map(x => [x.id, x])
]);
const officialIdentities = {
  d01:'Иностранный язык',
  d02:'Методология научного познания',
  d03:'Аналитические модели автоматизированных систем обработки информации и управления',
  d04:'Многомерный анализ данных в системах искусственного интеллекта',
  d05:'Объектно-ориентированное проектирование автоматизированных систем обработки информации и управления',
  d06:'Оптимизация баз данных систем машинного обучения',
  d15:'Технологии разработки программного обеспечения',
  p02:'Научно-исследовательская работа',
  p04:'Педагогическая практика',
  g01:'Подготовка и защита ВКР'
};
for (const [id,name] of Object.entries(officialIdentities)) assert(allOfficial.get(id)?.nameRu === name, `${id} official identity drifted`);
for (const target of pack.officialTargets || []) assert(allOfficial.has(target.courseId), `P0 references unknown official target ${target.courseId}`);
for (const id of ['d02','d03','d04','d05','d06','d15','p02','p04','g01']) assert((pack.officialTargets || []).some(x => x.courseId === id), `P0 must map to intended Russian-support target ${id}`);
assert(!(pack.officialTargets || []).some(x => x.courseId === 'd01'), 'P0 officialTargets must exclude d01 Foreign Language');
for (const id of ['p04','g01']) assert((pack.officialTargets || []).find(x=>x.courseId===id)?.role === 'primary', `${id} must remain primary P0 target`);

// P0 must not replace exact curriculum assessment codes with invented course grading rules.
assert(JSON.stringify(allOfficial.get('d01')?.assessment) === JSON.stringify(['Зчт']), 'd01 assessment drifted');
assert(JSON.stringify(allOfficial.get('d04')?.assessment) === JSON.stringify(['Экз','ДЗчт']), 'd04 assessment drifted');
assert(JSON.stringify(allOfficial.get('g01')?.assessment) === JSON.stringify(['ГЭК']), 'g01 assessment drifted');
assert(/does not invent grading rules/i.test(pack.assessmentLanguage?.sourcePolicy || ''), 'P0 assessment-language policy must reject invented grading rules');

const verbs = pack.instructionVerbs || [];
assert(verbs.length >= 14, 'P0 must include at least 14 instruction verbs');
assert(unique(verbs.map(x => x.ru)), 'P0 instruction verbs must be unique');
for (const ru of ['найдите','вычислите','определите','докажите','объясните','обоснуйте','сравните','укажите','опишите','рассчитайте','постройте','разработайте','проанализируйте','оцените']) {
  assert(verbs.some(x => x.ru === ru), `P0 missing instruction verb ${ru}`);
}

const glossaries = pack.courseMiniGlossaries || [];
assert(glossaries.length === 6, `P0 expected 6 course mini-glossaries, got ${glossaries.length}`);
assert(!glossaries.some(g => (g.courseIds || []).includes('d01')), 'P0 Russian glossary must not target d01');
for (const g of glossaries) {
  assert((g.courseIds || []).length > 0, 'P0 glossary missing courseIds');
  for (const id of g.courseIds || []) assert(allOfficial.has(id), `P0 glossary references unknown course ${id}`);
  assert((g.terms || []).length >= 12, `P0 glossary ${g.label} must contain at least 12 terms`);
  assert(unique(g.terms || []), `P0 glossary ${g.label} contains duplicate terms`);
}
for (const id of ['d03','d04','d05','d06','d15','d02','p02']) {
  assert(glossaries.some(g => (g.courseIds || []).includes(id)), `P0 missing mini-glossary mapping for ${id}`);
}

const frames = pack.oralFrames || [];
assert(frames.length >= 12, 'P0 must include at least 12 oral frames');
assert(unique(frames.map(x => x.id)), 'P0 oral frame IDs must be unique');
assert(frames.every(x => /[А-Яа-яЁё]/.test(x.ru || '')), 'P0 oral frames must contain Russian text');

const nodes = pack.nodes || [];
const nodeIds = nodes.map(x => x.id);
const nodeSet = new Set(nodeIds);
assert(nodes.length === 12, `P0 expected 12 nodes, got ${nodes.length}`);
assert(unique(nodeIds), 'P0 node IDs must be unique');
assert(nodes.every((x,i) => x.order === i + 1), 'P0 node order must be contiguous 1..12');
for (const node of nodes) for (const dep of node.dependsOn || []) assert(nodeSet.has(dep), `${node.id} depends on missing node ${dep}`);
const visiting = new Set(), visited = new Set();
function visit(id) {
  if (visiting.has(id)) { errors.push(`cycle detected at ${id}`); return; }
  if (visited.has(id)) return;
  visiting.add(id);
  const node = nodes.find(x => x.id === id);
  for (const dep of node?.dependsOn || []) visit(dep);
  visiting.delete(id); visited.add(id);
}
for (const id of nodeIds) visit(id);

const signals = [
  ['P0-N01',/động từ|yêu cầu|prompt/i],
  ['P0-N02',/học phần|kiểm tra|nộp bài/i],
  ['P0-N03',/Nghe giảng|định nghĩa|giả thiết/i],
  ['P0-N04',/Toán|xác suất|mô hình/i],
  ['P0-N05',/Đa biến|thống kê|dữ liệu/i],
  ['P0-N06',/OOP|UML|software/i],
  ['P0-N07',/Cơ sở dữ liệu|truy vấn/i],
  ['P0-N08',/nghiên cứu|NIR/i],
  ['P0-N09',/lời giải kỹ thuật/i],
  ['P0-N10',/Vấn đáp|bảo vệ/i],
  ['P0-N11',/Team|lab|tiến độ/i],
  ['P0-N12',/just-in-time|course-specific/i]
];
for (const [id,re] of signals) assert(re.test(JSON.stringify(nodes.find(x=>x.id===id) || {})), `${id} missing required signal ${re}`);

const diagnostic = pack.diagnostic || {};
assert(diagnostic.D0?.weight === 0.25, 'P0 D0 weight must be 0.25');
assert(diagnostic.D1?.weight === 0.5, 'P0 D1 weight must be 0.5');
assert(diagnostic.D2?.weight === 0.25, 'P0 D2 weight must be 0.25');
assert((diagnostic.D0?.items || []).length === 20, 'P0 D0 must contain 20 recall items');
assert((diagnostic.D1?.items || []).length === 12, 'P0 D1 must contain 12 application items');
assert((diagnostic.D2?.items || []).length === 10, 'P0 D2 must contain 10 oral items');
const diagItems = [...diagnostic.D0.items, ...diagnostic.D1.items, ...diagnostic.D2.items];
assert(unique(diagItems.map(x => x.id)), 'P0 diagnostic IDs must be unique');
for (const item of diagItems) assert(nodeSet.has(item.node), `${item.id} references missing node ${item.node}`);
assert(diagnostic.D2.items.every(x => typeof x.promptRu === 'string' && x.promptRu.length > 70 && /[А-Яа-яЁё]/.test(x.promptRu)), 'P0 D2 must include substantive Russian prompts');

const misconceptions = pack.criticalMisconceptions || [];
assert(misconceptions.length >= 13, 'P0 must include at least 13 critical misconceptions');
assert(unique(misconceptions.map(x=>x.id)), 'P0 misconception IDs must be unique');
for (const m of misconceptions) assert(nodeSet.has(m.node), `${m.id} references missing node ${m.node}`);
const routes = pack.repairRoutes || [];
assert(routes.length === 8, 'P0 must have exactly 8 focused repair routes');
assert(unique(routes.map(x=>x.id)), 'P0 repair route IDs must be unique');
for (const route of routes) {
  assert(typeof route.stopWhen === 'string' && route.stopWhen.length > 20, `${route.id} must define a measurable stop condition`);
  for (const nodeId of route.triggerNodes || []) assert(nodeSet.has(nodeId), `${route.id} trigger references missing node ${nodeId}`);
  for (const token of route.route || []) {
    if (/^P0-N\d+$/.test(token)) assert(nodeSet.has(token), `${route.id} references missing node ${token}`);
    if (/^R\d+$/.test(token)) assert(knowledge.has(token), `${route.id} references missing Russian lesson ${token}`);
  }
}

const scope = new Set(pack.scopeGuard?.required || []);
for (const item of ['technical prompt reading','class and lab listening','course assessment vocabulary','math-data-CS terminology','structured technical explanation','academic oral Q&A','course-specific just-in-time glossary','NIR/VKR research communication']) {
  assert(scope.has(item), `P0 scope missing ${item}`);
}
assert(/does not replace STANKIN Russian/i.test(pack.scopeGuard?.rule || ''), 'P0 must not replace STANKIN Russian');
assert(/does not replace the Л2 English Foreign Language course d01/i.test(pack.scopeGuard?.rule || ''), 'P0 must not replace d01 English');
assert(/does not.*official course syllabus item/i.test(pack.scopeGuard?.rule || ''), 'P0 must not present learning glossary as official syllabus');

// Independent mastery sanity: overall >=90 is not enough if application is below 85.
function score(d0,d1,d2) { return 0.25*d0 + 0.50*d1 + 0.25*d2; }
function ready(d0,d1,d2,misconceptions) { return score(d0,d1,d2) >= 90 && d1 >= 85 && misconceptions === 0; }
assert(score(90,90,90) === 90, 'P0 weighted-score invariant failed');
assert(ready(90,90,90,0) === true, 'P0 READY invariant failed');
assert(score(100,80,100) === 90 && ready(100,80,100,0) === false, 'P0 D1-floor invariant failed');
assert(ready(100,100,100,1) === false, 'P0 critical-misconception invariant failed');

// Independent JIT selection sanity: only selected course glossary should be active for the current event.
function glossaryFor(courseId) { return glossaries.filter(g => (g.courseIds || []).includes(courseId)); }
assert(glossaryFor('d06').length === 1 && glossaryFor('d06')[0].label === 'Database Optimization', 'P0 d06 JIT glossary selection invariant failed');
assert(glossaryFor('d03').length === 1, 'P0 d03 JIT glossary selection invariant failed');
assert(glossaryFor('unknown').length === 0, 'P0 unknown-course glossary invariant failed');

for (const src of pack.sourceEvidence || []) assert(typeof src.path === 'string' && src.path.length > 5, 'P0 source evidence must use repo paths');
assert((pack.sourceEvidence || []).some(x => x.kind === 'official_curriculum' && x.locked === true), 'P0 must preserve locked official curriculum evidence');
assert((pack.sourceEvidence || []).some(x => x.kind === 'local_russian_knowledge_index' && x.locked === false), 'P0 must preserve local Russian evidence label');

if (errors.length) {
  console.error(`P00_TECHNICAL_RUSSIAN_VALIDATION_FAIL (${errors.length})`);
  errors.forEach(e => console.error(`- ${e}`));
  process.exit(1);
}
console.log('P00_TECHNICAL_RUSSIAN_VALIDATION_PASS');
console.log(JSON.stringify({
  nodes:nodes.length,
  D0:diagnostic.D0.items.length,
  D1:diagnostic.D1.items.length,
  D2:diagnostic.D2.items.length,
  misconceptions:misconceptions.length,
  repairRoutes:routes.length,
  instructionVerbs:verbs.length,
  miniGlossaries:glossaries.length,
  reusedLessons:requiredLessons,
  officialTargets:pack.officialTargets.map(x=>x.courseId)
}, null, 2));
