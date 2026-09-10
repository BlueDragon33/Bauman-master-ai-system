'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pack = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/prerequisite-packs/p11-research-foundation.json'), 'utf8'));
const prereq = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/prerequisite-registry-iu5-2026.json'), 'utf8'));
const curriculum = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/official-curriculum-iu5-2026.json'), 'utf8'));
const lessons = JSON.parse(fs.readFileSync(path.join(root, 'subjects/research/data/lessons.json'), 'utf8'));

const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const unique = values => new Set(values).size === values.length;

assert(pack.schema === 'bauman_prerequisite_pack_v1', 'unexpected P11 pack schema');
assert(pack.gateId === 'P11', 'pack gateId must be P11');
assert(pack.notOfficialAdministrativePrerequisite === true, 'P11 must be explicitly non-administrative prerequisite');
assert(pack.mastery?.target === 88, 'P11 target must match registry target 88');
assert(pack.mastery?.applicationMinimum === 85, 'P11 application minimum must be 85');
assert(pack.mastery?.criticalMisconceptionsAllowed === 0, 'P11 must allow zero critical misconceptions');
assert(pack.implementationPolicy?.schedulerMutation === false, 'Pass10 must not mutate scheduler');
assert(pack.implementationPolicy?.writesDiagnosticScores === false, 'Pass10 must not write diagnostic scores');
assert(pack.implementationPolicy?.newTopLevelSubject === false, 'P11 must remain inside Research');
assert(pack.implementationPolicy?.overwritesExistingResearchLessons === false, 'Pass10 must reuse rather than overwrite Research lessons');
assert(pack.implementationPolicy?.autoSelectsResearchTrack === false, 'Pass10 must not auto-select a thesis/NIR track');
assert(pack.implementationPolicy?.legacyUGVUSVBecomesDefault === false, 'legacy UGV/USV must not remain default');
assert(pack.implementationPolicy?.mainBranchMutation === false, 'Pass10 must not mutate main');
assert(pack.implementationPolicy?.milestoneDatesAreEventDriven === true, 'research milestones must be event-driven rather than hard-coded as authoritative');

const registryGate = prereq.coreGates.find(x => x.id === 'P11');
assert(Boolean(registryGate), 'P11 missing from prerequisite registry');
assert(registryGate?.target === 88, 'P11 registry target must remain 88');
for (const topic of ['research question','hypothesis','literature matrix','experiment design','metrics','baseline','reproducibility','citation','technical report']) {
  assert((registryGate?.topics || []).some(x => x.toLowerCase().includes(topic.toLowerCase())), `P11 registry lost topic ${topic}`);
}

const disciplines = new Map(curriculum.disciplines.map(x => [x.id, x]));
const practices = new Map(curriculum.practices.map(x => [x.id, x]));
const gia = new Map(curriculum.gia.map(x => [x.id, x]));
const d02 = disciplines.get('d02');
const d13 = disciplines.get('d13');
const d16 = disciplines.get('d16');
const d17 = disciplines.get('d17');
const p02 = practices.get('p02');
const p05 = practices.get('p05');
const g01 = gia.get('g01');
assert(d02?.nameRu === 'Методология научного познания' && d02?.credits === 2 && JSON.stringify(d02?.semesters) === JSON.stringify([1]), 'd02 identity/credits/semester drifted');
assert(p02?.nameRu === 'Научно-исследовательская работа' && p02?.credits === 21 && p02?.hours === 756 && JSON.stringify(p02?.semesters) === JSON.stringify([1,2,3,4]), 'p02 NIR must remain 21 credits / 756 hours / semesters 1-4');
assert(d16?.nameRu === 'НИР по обработке и анализу данных' && d16?.credits === 2 && JSON.stringify(d16?.semesters) === JSON.stringify([3]), 'd16 identity/credits/semester drifted');
assert(p05?.nameRu === 'Преддипломная практика' && p05?.credits === 3 && JSON.stringify(p05?.semesters) === JSON.stringify([4]), 'p05 pre-diploma identity/credits/semester drifted');
assert(g01?.nameRu === 'Подготовка и защита ВКР' && g01?.credits === 9 && JSON.stringify(g01?.semesters) === JSON.stringify([4]), 'g01 VKR identity/credits/semester drifted');
assert(d13?.nameRu === 'Искусственный интеллект в задачах бизнес-аналитики', 'd13 support identity drifted');
assert(d17?.nameRu === 'Эргономический анализ систем обработки и отображения информации', 'd17 support identity drifted');

const officialIds = new Set([
  ...curriculum.disciplines.map(x => x.id),
  ...curriculum.practices.map(x => x.id),
  ...curriculum.gia.map(x => x.id),
  ...curriculum.electiveGroups.map(x => x.id),
  ...curriculum.electiveGroups.flatMap(g => g.options.map(x => x.id))
]);
for (const target of pack.officialTargets || []) assert(officialIds.has(target.courseId), `P11 references unknown official target ${target.courseId}`);
for (const id of ['d02','p02','d16','p05','g01','d13','d17']) assert((pack.officialTargets || []).some(x => x.courseId === id), `P11 must map to ${id}`);
for (const id of ['d02','p02','d16','p05','g01']) assert((pack.officialTargets || []).find(x => x.courseId === id)?.role === 'primary', `${id} must be a primary P11 target`);

const lessonMap = new Map(lessons.map(x => [x.id, x]));
const reuseExpected = ['r_p02_l1','r_p03_l1','r_p04_l1','r_s02_l1','r_m102_l1','r_m201_l1','r_m301_l1','r_m302_l1','r_m401_l1','r_m402_l1','r_m403_l1'];
for (const id of reuseExpected) assert(lessonMap.has(id), `P11 reuse lesson ${id} missing`);
const expectedTitleSignals = {
  r_p02_l1: /tìm kiếm.*tài liệu|quản lý tài liệu/i,
  r_p03_l1: /Câu hỏi nghiên cứu.*giả thuyết.*metric/i,
  r_p04_l1: /Memo đề tài sơ bộ/i,
  r_s02_l1: /Đọc paper.*annotation tiếng Nga/i,
  r_m102_l1: /Chọn đề tài НИР.*novelty.*khả thi/i,
  r_m201_l1: /Proposal v1.*baseline/i,
  r_m301_l1: /Sprint thực nghiệm/i,
  r_m302_l1: /Báo cáo НИР.*chương luận văn/i,
  r_m401_l1: /Thực tập tiền tốt nghiệp/i,
  r_m402_l1: /Viết ВКР.*pre-defense/i,
  r_m403_l1: /Gói bảo vệ.*slide.*Q&A.*demo/i
};
for (const [id, re] of Object.entries(expectedTitleSignals)) assert(re.test(lessonMap.get(id)?.title || ''), `${id} title identity drifted`);
const reuseIds = new Set((pack.localReuse || []).flatMap(x => x.lessonIds || []));
for (const id of reuseExpected) assert(reuseIds.has(id), `P11 localReuse must include ${id}`);
assert(pack.legacyResearchVaultPolicy?.overwriteLegacyLessonsInPass10 === false, 'Pass10 must not rewrite the entire legacy Research vault');
assert(pack.legacyResearchVaultPolicy?.neutralizationAppliedInPrerequisiteRoute === true, 'P11 prerequisite route must neutralize legacy project bias');

const trackPolicy = pack.researchTrackPolicy || {};
assert(trackPolicy.stateBeforeSupervisor === 'TOPIC_NEUTRAL', 'P11 must remain TOPIC_NEUTRAL before supervisor confirmation');
assert(trackPolicy.activeTrack === null, 'P11 activeTrack must be null before supervisor/formal topic confirmation');
assert(trackPolicy.lockRequires === 'supervisor_or_formal_topic_confirmation', 'track lock must require supervisor/formal topic confirmation');
const trackIds = (trackPolicy.candidateTracks || []).map(x => x.id);
assert(trackIds.length >= 6 && unique(trackIds), 'P11 must expose a diverse unique candidate-track set');
for (const id of ['llm_rag_agents','ml_data_systems','neural_cv_nlp','time_series_decision','logical_mivar','database_ai_systems','autonomous_systems']) assert(trackIds.includes(id), `candidate track ${id} missing`);

const nodes = pack.nodes || [];
const nodeIds = nodes.map(x => x.id);
const nodeSet = new Set(nodeIds);
assert(nodes.length === 12, `P11 expected 12 nodes, got ${nodes.length}`);
assert(unique(nodeIds), 'P11 node IDs must be unique');
assert(nodes.every((x, i) => x.order === i + 1), 'P11 node order must be contiguous 1..12');
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
  ['P11-N01', /problem|scope|phạm vi|feasib/i],
  ['P11-N02', /literature|source|nguồn/i],
  ['P11-N03', /matrix|claim|citation|trích dẫn/i],
  ['P11-N04', /research question|hypothesis|operational/i],
  ['P11-N05', /baseline|metric|evaluation/i],
  ['P11-N06', /experiment|control|confound|leakage/i],
  ['P11-N07', /reproduc|research log|artifact/i],
  ['P11-N08', /uncertainty|limitation|causal/i],
  ['P11-N09', /novelty|contribution|risk|feasib/i],
  ['P11-N10', /report|traceability|conclusion/i],
  ['P11-N11', /supervisor|ACTIVE_NIR|decision log/i],
  ['P11-N12', /NIR|VKR|defense|evidence/i]
];
for (const [id, re] of signals) {
  const node = nodes.find(x => x.id === id);
  assert(Boolean(node) && re.test(JSON.stringify(node)), `${id} missing required signal ${re}`);
}

const diagnostic = pack.diagnostic || {};
assert(diagnostic.D0?.weight === 0.25, 'P11 D0 weight must be 0.25');
assert(diagnostic.D1?.weight === 0.5, 'P11 D1 weight must be 0.5');
assert(diagnostic.D2?.weight === 0.25, 'P11 D2 weight must be 0.25');
assert((diagnostic.D0?.items || []).length === 18, 'P11 D0 must contain 18 recall items');
assert((diagnostic.D1?.items || []).length === 12, 'P11 D1 must contain 12 application items');
assert((diagnostic.D2?.items || []).length === 8, 'P11 D2 must contain 8 oral items');
const diagItems = [...(diagnostic.D0?.items || []), ...(diagnostic.D1?.items || []), ...(diagnostic.D2?.items || [])];
assert(unique(diagItems.map(x => x.id)), 'P11 diagnostic IDs must be unique');
for (const item of diagItems) assert(nodeSet.has(item.node), `${item.id} references missing node ${item.node}`);
assert((diagnostic.D2?.items || []).every(x => typeof x.promptRu === 'string' && x.promptRu.length > 30), 'P11 D2 must include substantive Russian prompts');

const misconceptions = pack.criticalMisconceptions || [];
assert(misconceptions.length >= 12, 'P11 must include at least 12 critical misconceptions');
assert(unique(misconceptions.map(x => x.id)), 'P11 misconception IDs must be unique');
for (const m of misconceptions) assert(nodeSet.has(m.node), `${m.id} references missing node ${m.node}`);
const routes = pack.repairRoutes || [];
assert(routes.length >= 8, 'P11 must have at least 8 repair routes');
assert(unique(routes.map(x => x.id)), 'P11 repair route IDs must be unique');
for (const route of routes) {
  for (const nodeId of route.triggerNodes || []) assert(nodeSet.has(nodeId), `${route.id} trigger references missing node ${nodeId}`);
  for (const token of route.route || []) {
    if (/^P11-N\d+$/.test(token)) assert(nodeSet.has(token), `${route.id} references missing node ${token}`);
    if (/^r_/.test(token)) assert(lessonMap.has(token), `${route.id} references missing research lesson ${token}`);
  }
}

const requiredScope = new Set(pack.scopeGuard?.required || []);
for (const required of [
  'problem framing and research scope',
  'literature search and source quality',
  'literature matrix and citation traceability',
  'research question and hypothesis',
  'baseline and metrics',
  'experiment design and controls',
  'reproducibility and research log',
  'result analysis and limitations',
  'novelty contribution feasibility and risk',
  'technical report structure',
  'supervisor checkpoints and change control',
  'NIR to VKR continuity and defense evidence'
]) assert(requiredScope.has(required), `P11 scope missing ${required}`);

const activeText = JSON.stringify({nodes:pack.nodes, diagnostic:pack.diagnostic, criticalMisconceptions:pack.criticalMisconceptions, repairRoutes:pack.repairRoutes});
assert(!/UGV|USV|FPGA|PLC|SCADA|robotics hardware|PID|LQR|Kalman/i.test(activeText), 'P11 active route must remain project/control neutral');
assert(!/fabricated citation|bịa citation|publication-count chasing/i.test(activeText), 'P11 active route must not normalize fabricated citations or publication-count chasing');

// Independent research-traceability sanity: every major claim must map to at least one source.
function uncoveredClaims(claimIds, links) {
  const covered = new Set(links.filter(x => Array.isArray(x.sources) && x.sources.length > 0).map(x => x.claim));
  return claimIds.filter(id => !covered.has(id));
}
const claimLinks = [
  {claim:'C1', sources:['S1']},
  {claim:'C2', sources:['S2','S3']},
  {claim:'C3', sources:['S4']}
];
assert(uncoveredClaims(['C1','C2','C3'], claimLinks).length === 0, 'claim-source traceability complete invariant failed');
assert(JSON.stringify(uncoveredClaims(['C1','C2','C3'], claimLinks.slice(0,2))) === JSON.stringify(['C3']), 'claim-source traceability missing-source invariant failed');

// Independent final-evaluation sanity: tuning and final-test IDs must be disjoint.
function disjoint(a, b) {
  const s = new Set(a);
  return b.every(x => !s.has(x));
}
assert(disjoint(['v1','v2','v3'], ['t1','t2']) === true, 'validation/test disjoint invariant failed');
assert(disjoint(['v1','v2','t1'], ['t1','t2']) === false, 'validation/test leakage detection invariant failed');

// Independent topic-lock sanity: no confirmed supervisor/topic -> no active track.
function resolveTrack(candidate, confirmed) { return confirmed ? candidate : null; }
assert(resolveTrack('database_ai_systems', false) === null, 'topic must stay unlocked before confirmation');
assert(resolveTrack('database_ai_systems', true) === 'database_ai_systems', 'confirmed topic should be lockable');

for (const src of pack.sourceEvidence || []) assert(/^https:\/\//.test(src.url || ''), 'P11 source evidence must use HTTPS');
assert((pack.sourceEvidence || []).some(x => x.kind === 'official_curriculum' && x.status === 'locked_source_of_truth_for_course_identity_timing_credits'), 'P11 must preserve locked official curriculum evidence');
assert((pack.sourceEvidence || []).some(x => x.kind === 'public_iu5_nir_page' && x.status === 'public_learning_material_not_locked_as_exact_2026_master_requirement'), 'P11 must label public NIR page as non-locked cohort evidence');

if (errors.length) {
  console.error(`P11_RESEARCH_FOUNDATION_VALIDATION_FAIL (${errors.length})`);
  errors.forEach(e => console.error(`- ${e}`));
  process.exit(1);
}
console.log('P11_RESEARCH_FOUNDATION_VALIDATION_PASS');
console.log(JSON.stringify({
  nodes:nodes.length,
  D0:diagnostic.D0.items.length,
  D1:diagnostic.D1.items.length,
  D2:diagnostic.D2.items.length,
  misconceptions:misconceptions.length,
  repairRoutes:routes.length,
  candidateTracks:trackIds.length,
  reusedLessons:reuseExpected,
  officialTargets:pack.officialTargets.map(x => x.courseId)
}, null, 2));
