'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const readJson = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const pack = readJson('assets/data/prerequisite-packs/p11-research-foundation.json');
const prereq = readJson('assets/data/prerequisite-registry-iu5-2026.json');
const curriculum = readJson('assets/data/official-curriculum-iu5-2026.json');
const lessons = readJson('subjects/research/data/lessons.json');

const errors = [];
const assert = (ok, msg) => { if (!ok) errors.push(msg); };
const unique = xs => new Set(xs).size === xs.length;

// Gate and mutation policy.
assert(pack.schema === 'bauman_prerequisite_pack_v1', 'unexpected P11 pack schema');
assert(pack.gateId === 'P11', 'pack gateId must be P11');
assert(pack.notOfficialAdministrativePrerequisite === true, 'P11 must be non-administrative prerequisite');
assert(pack.mastery?.target === 88, 'P11 target must be 88');
assert(pack.mastery?.applicationMinimum === 85, 'P11 D1 minimum must be 85');
assert(pack.mastery?.criticalMisconceptionsAllowed === 0, 'P11 must allow zero critical misconceptions');
for (const [key, expected] of Object.entries({
  schedulerMutation:false,
  writesDiagnosticScores:false,
  newTopLevelSubject:false,
  overwritesExistingResearchLessons:false,
  autoSelectsResearchTrack:false,
  legacyUGVUSVBecomesDefault:false,
  mainBranchMutation:false,
  milestoneDatesAreEventDriven:true
})) assert(pack.implementationPolicy?.[key] === expected, `P11 implementation policy drift: ${key}`);

// Registry integrity.
const gate = prereq.coreGates.find(x => x.id === 'P11');
assert(Boolean(gate), 'P11 missing from prerequisite registry');
assert(gate?.target === 88, 'P11 registry target drifted');
for (const topic of ['research question','hypothesis','literature matrix','experiment design','metrics','baseline','reproducibility','citation','technical report']) {
  assert((gate?.topics || []).some(x => x.toLowerCase().includes(topic.toLowerCase())), `P11 registry lost topic ${topic}`);
}

// Locked official curriculum targets.
const disciplines = new Map(curriculum.disciplines.map(x => [x.id, x]));
const practices = new Map(curriculum.practices.map(x => [x.id, x]));
const gia = new Map(curriculum.gia.map(x => [x.id, x]));
const d02 = disciplines.get('d02'), d13 = disciplines.get('d13'), d16 = disciplines.get('d16'), d17 = disciplines.get('d17');
const p02 = practices.get('p02'), p05 = practices.get('p05'), g01 = gia.get('g01');
assert(d02?.nameRu === 'Методология научного познания' && d02.credits === 2 && JSON.stringify(d02.semesters) === '[1]', 'd02 drifted');
assert(p02?.nameRu === 'Научно-исследовательская работа' && p02.credits === 21 && p02.hours === 756 && JSON.stringify(p02.semesters) === '[1,2,3,4]', 'p02 NIR must remain 21 credits / 756 hours / semesters 1-4');
assert(d16?.nameRu === 'НИР по обработке и анализу данных' && d16.credits === 2 && JSON.stringify(d16.semesters) === '[3]', 'd16 drifted');
assert(p05?.nameRu === 'Преддипломная практика' && p05.credits === 3 && JSON.stringify(p05.semesters) === '[4]', 'p05 drifted');
assert(g01?.nameRu === 'Подготовка и защита ВКР' && g01.credits === 9 && JSON.stringify(g01.semesters) === '[4]', 'g01 drifted');
assert(d13?.nameRu === 'Искусственный интеллект в задачах бизнес-аналитики', 'd13 support target drifted');
assert(d17?.nameRu === 'Эргономический анализ систем обработки и отображения информации', 'd17 support target drifted');
const officialIds = new Set([...curriculum.disciplines, ...curriculum.practices, ...curriculum.gia, ...curriculum.electiveGroups, ...curriculum.electiveGroups.flatMap(g => g.options)].map(x => x.id));
for (const t of pack.officialTargets || []) assert(officialIds.has(t.courseId), `unknown P11 official target ${t.courseId}`);
for (const id of ['d02','p02','d16','p05','g01','d13','d17']) assert((pack.officialTargets || []).some(x => x.courseId === id), `P11 mapping missing ${id}`);
for (const id of ['d02','p02','d16','p05','g01']) assert((pack.officialTargets || []).find(x => x.courseId === id)?.role === 'primary', `${id} must be primary P11 target`);

// Reuse verified Research content, do not rebuild it.
const lessonMap = new Map(lessons.map(x => [x.id, x]));
const reuseExpected = ['r_p02_l1','r_p03_l1','r_p04_l1','r_s02_l1','r_m102_l1','r_m201_l1','r_m301_l1','r_m302_l1','r_m401_l1','r_m402_l1','r_m403_l1'];
for (const id of reuseExpected) assert(lessonMap.has(id), `P11 reuse lesson missing ${id}`);
const titleChecks = {
  r_p02_l1:/tìm kiếm.*tài liệu|quản lý tài liệu/i,
  r_p03_l1:/Câu hỏi nghiên cứu.*giả thuyết.*metric/i,
  r_p04_l1:/Memo đề tài sơ bộ/i,
  r_s02_l1:/Đọc paper.*annotation tiếng Nga/i,
  r_m102_l1:/Chọn đề tài НИР.*novelty.*khả thi/i,
  r_m201_l1:/Proposal v1.*baseline/i,
  r_m301_l1:/Sprint thực nghiệm/i,
  r_m302_l1:/Báo cáo НИР.*chương luận văn/i,
  r_m401_l1:/Thực tập tiền tốt nghiệp/i,
  r_m402_l1:/Viết ВКР.*pre-defense/i,
  r_m403_l1:/Gói bảo vệ.*slide.*Q&A.*demo/i
};
for (const [id, re] of Object.entries(titleChecks)) assert(re.test(lessonMap.get(id)?.title || ''), `${id} title identity drifted`);
const reused = new Set((pack.localReuse || []).flatMap(x => x.lessonIds || []));
for (const id of reuseExpected) assert(reused.has(id), `P11 localReuse missing ${id}`);
assert(pack.legacyResearchVaultPolicy?.overwriteLegacyLessonsInPass10 === false, 'Pass10 must not rewrite legacy Research vault');
assert(pack.legacyResearchVaultPolicy?.neutralizationAppliedInPrerequisiteRoute === true, 'P11 route must neutralize legacy project bias');

// Research-track neutralization is a hard invariant.
const tp = pack.researchTrackPolicy || {};
assert(tp.stateBeforeSupervisor === 'TOPIC_NEUTRAL', 'state before supervisor must be TOPIC_NEUTRAL');
assert(tp.activeTrack === null, 'activeTrack must be null before confirmation');
assert(tp.lockRequires === 'supervisor_or_formal_topic_confirmation', 'track lock requires supervisor/formal topic confirmation');
const trackIds = (tp.candidateTracks || []).map(x => x.id);
assert(trackIds.length === 7 && unique(trackIds), 'P11 must expose exactly seven unique candidate tracks');
for (const id of ['llm_rag_agents','ml_data_systems','neural_cv_nlp','time_series_decision','logical_mivar','database_ai_systems','autonomous_systems']) assert(trackIds.includes(id), `candidate track missing ${id}`);

// Dependency graph.
const nodes = pack.nodes || [], nodeIds = nodes.map(x => x.id), nodeSet = new Set(nodeIds);
assert(nodes.length === 12, `P11 expected 12 nodes, got ${nodes.length}`);
assert(unique(nodeIds), 'P11 node IDs must be unique');
assert(nodes.every((x, i) => x.order === i + 1), 'P11 order must be 1..12');
for (const n of nodes) for (const d of n.dependsOn || []) assert(nodeSet.has(d), `${n.id} depends on missing ${d}`);
const visiting = new Set(), visited = new Set();
function visit(id) {
  if (visiting.has(id)) { errors.push(`cycle detected at ${id}`); return; }
  if (visited.has(id)) return;
  visiting.add(id);
  for (const d of nodes.find(x => x.id === id)?.dependsOn || []) visit(d);
  visiting.delete(id); visited.add(id);
}
nodeIds.forEach(visit);
const signals = [
  ['P11-N01',/problem|scope|phạm vi|feasib/i],['P11-N02',/literature|source|nguồn/i],['P11-N03',/matrix|claim|citation|trích dẫn/i],
  ['P11-N04',/research question|hypothesis|operational/i],['P11-N05',/baseline|metric|evaluation/i],['P11-N06',/experiment|control|confound|leakage/i],
  ['P11-N07',/reproduc|research log|artifact/i],['P11-N08',/uncertainty|limitation|causal/i],['P11-N09',/novelty|contribution|risk|feasib/i],
  ['P11-N10',/report|traceability|conclusion/i],['P11-N11',/supervisor|ACTIVE_NIR|decision log/i],['P11-N12',/NIR|VKR|defense|evidence/i]
];
for (const [id, re] of signals) assert(re.test(JSON.stringify(nodes.find(x => x.id === id) || {})), `${id} missing required signal ${re}`);

// Diagnostic integrity.
const d = pack.diagnostic || {};
assert(d.D0?.weight === 0.25 && d.D1?.weight === 0.5 && d.D2?.weight === 0.25, 'P11 diagnostic weights drifted');
assert((d.D0?.items || []).length === 18, 'P11 D0 must contain 18 items');
assert((d.D1?.items || []).length === 12, 'P11 D1 must contain 12 items');
assert((d.D2?.items || []).length === 8, 'P11 D2 must contain 8 items');
const diagItems = [...(d.D0?.items || []), ...(d.D1?.items || []), ...(d.D2?.items || [])];
assert(unique(diagItems.map(x => x.id)), 'P11 diagnostic IDs must be unique');
for (const item of diagItems) assert(nodeSet.has(item.node), `${item.id} references missing node ${item.node}`);
assert((d.D2?.items || []).every(x => typeof x.promptRu === 'string' && x.promptRu.length > 30), 'P11 D2 must include substantive Russian prompts');

const misconceptions = pack.criticalMisconceptions || [];
assert(misconceptions.length === 12 && unique(misconceptions.map(x => x.id)), 'P11 must contain 12 unique critical misconceptions');
for (const m of misconceptions) assert(nodeSet.has(m.node), `${m.id} references missing node ${m.node}`);
const routes = pack.repairRoutes || [];
assert(routes.length === 8 && unique(routes.map(x => x.id)), 'P11 must contain 8 unique repair routes');
for (const r of routes) {
  for (const id of r.triggerNodes || []) assert(nodeSet.has(id), `${r.id} trigger missing ${id}`);
  for (const token of r.route || []) {
    if (/^P11-N\d+$/.test(token)) assert(nodeSet.has(token), `${r.id} references missing ${token}`);
    if (/^r_/.test(token)) assert(lessonMap.has(token), `${r.id} references missing lesson ${token}`);
  }
}

// Scope: check positive route content, while allowing misconceptions to name what must be rejected.
const nodeAndTaskText = JSON.stringify({nodes:pack.nodes, D0:d.D0, D1:d.D1, D2:d.D2});
assert(!/UGV|USV|FPGA|PLC|SCADA|robotics hardware|\bPID\b|LQR|Kalman/i.test(nodeAndTaskText), 'P11 active learning path must remain project/control neutral');
const excluded = new Set(pack.scopeGuard?.excludedFromDefaultRoute || []);
for (const phrase of ['forcing UGV/USV as thesis topic','forcing LLM/RAG/Agents before supervisor confirmation','fabricated citations or fabricated novelty claims','publication-count chasing']) assert(excluded.has(phrase), `P11 exclusion missing: ${phrase}`);
const m03 = misconceptions.find(x => x.id === 'P11-M03');
assert(/nguồn.*hỗ trợ claim|truy vết/i.test(m03?.correction || ''), 'P11 must explicitly correct citation fabrication/mismatch risk');
const m10 = misconceptions.find(x => x.id === 'P11-M10');
assert(/literature|evidence/i.test(m10?.correction || ''), 'P11 must explicitly ground novelty in literature/evidence');

// Independent sanity invariants.
function uncoveredClaims(ids, links) {
  const covered = new Set(links.filter(x => Array.isArray(x.sources) && x.sources.length).map(x => x.claim));
  return ids.filter(id => !covered.has(id));
}
const claimLinks = [{claim:'C1',sources:['S1']},{claim:'C2',sources:['S2','S3']},{claim:'C3',sources:['S4']}];
assert(uncoveredClaims(['C1','C2','C3'], claimLinks).length === 0, 'claim-source traceability invariant failed');
assert(JSON.stringify(uncoveredClaims(['C1','C2','C3'], claimLinks.slice(0,2))) === '["C3"]', 'missing-source detection invariant failed');
function disjoint(a, b) { const s = new Set(a); return b.every(x => !s.has(x)); }
assert(disjoint(['v1','v2','v3'], ['t1','t2']), 'validation/test disjoint invariant failed');
assert(!disjoint(['v1','v2','t1'], ['t1','t2']), 'validation/test leakage detection invariant failed');
const resolveTrack = (candidate, confirmed) => confirmed ? candidate : null;
assert(resolveTrack('database_ai_systems', false) === null, 'topic must remain unlocked before confirmation');
assert(resolveTrack('database_ai_systems', true) === 'database_ai_systems', 'confirmed topic should be lockable');

// Evidence labels prevent a public/legacy course page from becoming a fabricated 2026 cohort rule.
for (const src of pack.sourceEvidence || []) assert(/^https:\/\//.test(src.url || ''), 'P11 evidence URLs must use HTTPS');
assert((pack.sourceEvidence || []).some(x => x.kind === 'official_curriculum' && x.status === 'locked_source_of_truth_for_course_identity_timing_credits'), 'locked official curriculum evidence missing');
assert((pack.sourceEvidence || []).some(x => x.kind === 'public_iu5_nir_page' && x.status === 'public_learning_material_not_locked_as_exact_2026_master_requirement'), 'public NIR page must remain non-locked cohort evidence');

if (errors.length) {
  console.error(`P11_RESEARCH_FOUNDATION_VALIDATION_FAIL (${errors.length})`);
  errors.forEach(e => console.error(`- ${e}`));
  process.exit(1);
}
console.log('P11_RESEARCH_FOUNDATION_VALIDATION_PASS');
console.log(JSON.stringify({nodes:nodes.length,D0:d.D0.items.length,D1:d.D1.items.length,D2:d.D2.items.length,misconceptions:misconceptions.length,repairRoutes:routes.length,candidateTracks:trackIds.length,reusedLessons:reuseExpected,officialTargets:pack.officialTargets.map(x => x.courseId)}, null, 2));
