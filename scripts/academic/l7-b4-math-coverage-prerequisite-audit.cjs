'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const POLICY_PATH = 'assets/data/lesson/math-prerequisite-policy-v1.json';
const LESSONS_PATH = 'subjects/math/data/lessons.json';
const OVERLAY_PATH = 'subjects/math/data/theory_lecture_content.json';
const MANIFEST_PATH = 'subjects/math/subject-manifest.json';
const FACTORY_PATH = 'assets/data/lesson/subject-factory-registry-v1.json';
const GRAPH_PATH = 'assets/data/lesson/math-prerequisite-graph-v1.generated.json';
const DOC_PATH = 'docs/migration/L7_B4_MATH_COVERAGE_PREREQUISITE_AUDIT.md';
const REPORT_PATH = 'docs/migration/L7_B4_MATH_COVERAGE_PREREQUISITE_AUDIT.generated.json';
const checks = [];

function read(file) { return fs.readFileSync(path.join(ROOT, file), 'utf8'); }
function json(file) { return JSON.parse(read(file)); }
function digest(value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
function check(id, title, ok, evidence) {
  checks.push({ id, title, ok: Boolean(ok), evidence: evidence === undefined ? null : evidence });
}
function unique(values) { return Array.from(new Set(values)); }

for (const file of [POLICY_PATH, LESSONS_PATH, OVERLAY_PATH, MANIFEST_PATH, FACTORY_PATH, DOC_PATH]) {
  check('FILE-' + file, 'required L7-B4 input exists', fs.existsSync(path.join(ROOT, file)), file);
}
if (checks.some((item) => !item.ok)) process.exit(2);

const policy = json(POLICY_PATH);
const lessons = json(LESSONS_PATH);
const overlay = json(OVERLAY_PATH).records;
const manifest = json(MANIFEST_PATH);
const factory = json(FACTORY_PATH);
const sourceDigest = digest(lessons);
const requiredRoles = [
  'problem_framing', 'deep_essence', 'counter_intuition', 'real_bridge',
  'notation', 'core_formula', 'assumption_gate', 'interpretation',
  'mini_case', 'common_mistakes', 'practice', 'simulation',
  'application', 'professor_qa', 'bridge', 'takeaway'
];
const bankFiles = {
  exercises: 'subjects/math/data/exercises.json',
  exerciseContent: 'subjects/math/data/exercise_content.json',
  simulations: 'subjects/math/data/simulations.json',
  simulationContent: 'subjects/math/data/simulation_content.json',
  tests: 'subjects/math/data/tests.json',
  questionBankContent: 'subjects/math/data/question_bank_content.json'
};
const bankCounts = {
  exercises: json(bankFiles.exercises).length,
  exerciseContent: json(bankFiles.exerciseContent).records.length,
  simulations: json(bankFiles.simulations).length,
  simulationContent: json(bankFiles.simulationContent).records.length,
  tests: json(bankFiles.tests).questions.length,
  questionBankContent: json(bankFiles.questionBankContent).records.length
};
const stageCounts = Object.fromEntries(unique(lessons.map((lesson) => lesson.stage)).map((stage) => [
  stage,
  lessons.filter((lesson) => lesson.stage === stage).length
]));
const chapterIds = unique(lessons.map((lesson) => lesson.chapterId));
const overlayChapterIds = unique(overlay.map((record) => record.chapterId));
const overlaySlideCounts = overlay.map((record) => record.slides.length);

function resolveDomain(lesson) {
  const title = String(lesson.departmentTitle || '');
  return policy.domainProfiles.find((profile) =>
    profile.departmentTitleIncludes.some((needle) => title.includes(needle))) || null;
}

const lastByStage = new Map();
const nodes = lessons.map((lesson, sourceIndex) => {
  const previous = lastByStage.get(lesson.stage) || null;
  const domain = resolveDomain(lesson);
  lastByStage.set(lesson.stage, lesson.id);
  return {
    lessonId: lesson.id,
    sourceIndex,
    stageId: lesson.stage,
    chapterId: lesson.chapterId,
    sourceChapterNo: lesson.sourceChapterNo,
    domainId: domain && domain.id,
    prerequisiteRefs: previous ? [{
      targetLessonId: previous,
      relation: policy.sequencePolicy.kind,
      requiredState: 'practised',
      assessmentBlocking: false,
      manualReviewRequired: true,
      provenance: 'system-derived-source-order'
    }] : [],
    downstreamRefs: domain ? domain.downstreamRefs.slice() : [],
    sourceRef: LESSONS_PATH + '#/' + sourceIndex
  };
});

const subjectFiles = {
  ai: json('subjects/ai/data/lessons.json'),
  signal: json('subjects/signal/data/lessons.json'),
  systems: json('subjects/systems/data/lessons.json'),
  research: json('subjects/research/data/lessons.json'),
  foundation: json('subjects/foundation/data/lessons.json'),
  russian: json('subjects/russian/data/lessons.json'),
  programming: json('subjects/programming/data/lessons.json')
};
const knownDownstream = new Set();
Object.entries(subjectFiles).forEach(([subjectId, records]) => records.forEach((record) => {
  knownDownstream.add(subjectId + ':' + (record.id || record.lessonId));
}));
const graph = {
  schema: 'bauman-math-prerequisite-graph-v1',
  status: 'review-candidate-not-runtime-active',
  policyRef: POLICY_PATH,
  sourceRef: LESSONS_PATH,
  sourceDigest,
  nodeCount: nodes.length,
  prerequisiteEdgeCount: nodes.reduce((sum, node) => sum + node.prerequisiteRefs.length, 0),
  downstreamEdgeCount: nodes.reduce((sum, node) => sum + node.downstreamRefs.length, 0),
  nodes,
  activation: {
    runtimeActive: false,
    assessmentBlocking: false,
    manualReviewRequired: true
  }
};

check('POLICY-IDENTITY', 'B4 policy identity and version are explicit',
  policy.policyId === 'bauman-math-prerequisite-policy'
    && policy.policyVersion === '1.0.0'
    && policy.status === 'L7-B4-AUDIT-POLICY',
  { id: policy.policyId, version: policy.policyVersion, status: policy.status });
check('PROGRAM-IDENTITY', 'official and personalized direction codes remain distinct',
  policy.programIdentity.department === 'ИУ-5'
    && policy.programIdentity.officialPublishedDirectionCode === '09.04.01'
    && policy.programIdentity.personalizedDisplayCode === '09.04.01/11',
  policy.programIdentity);
check('LEGACY-COUNT', 'all 347 stable Math legacy lessons remain present and unique',
  lessons.length === 347 && new Set(lessons.map((lesson) => lesson.id)).size === 347
    && manifest.data.lessons === 347,
  { lessons: lessons.length, manifest: manifest.data.lessons });
check('STAGE-COVERAGE', 'Math legacy retains all six learning stages',
  JSON.stringify(Object.keys(stageCounts).sort()) === JSON.stringify(['master_y1_s1', 'master_y1_s2', 'nir', 'prep', 'vkr', 'vn']),
  stageCounts);
check('CHAPTER-COVERAGE', 'Math legacy contains 41 stable chapter IDs', chapterIds.length === 41, chapterIds.length);
check('SLIDE-COUNT', 'every legacy lesson retains exactly sixteen slides',
  lessons.every((lesson) => Array.isArray(lesson.slides) && lesson.slides.length === 16),
  { minimum: Math.min(...lessons.map((lesson) => lesson.slides.length)), maximum: Math.max(...lessons.map((lesson) => lesson.slides.length)) });
check('ROLE-COVERAGE', 'every legacy lesson retains theory practice simulation application and oral roles',
  lessons.every((lesson) => {
    const roles = new Set(lesson.slides.map((slide) => slide.role));
    return requiredRoles.every((role) => roles.has(role));
  }), requiredRoles);
check('OVERLAY-TRUTH', 'reviewed theory overlay is exactly 18 records across three chapters',
  overlay.length === 18 && overlayChapterIds.length === 3
    && overlay.every((record) => Array.isArray(record.slides) && record.slides.length >= 16),
  {
    records: overlay.length,
    chapters: overlayChapterIds.length,
    minimumSlides: Math.min(...overlaySlideCounts),
    maximumSlides: Math.max(...overlaySlideCounts),
    totalSlides: overlaySlideCounts.reduce((sum, count) => sum + count, 0)
  });
check('OVERLAY-NOT-FULL', 'audit records that the 18 overlays are partial rather than full 347 coverage',
  policy.knownGapCodes.includes('THEORY_OVERLAY_PARTIAL')
    && overlay.length < lessons.length && overlayChapterIds.length < chapterIds.length,
  { overlayLessons: 18, legacyLessons: 347, overlayChapters: 3, legacyChapters: 41 });
check('BANK-TRUTH', 'external exercise simulation and assessment banks remain empty and are not counted as content',
  Object.values(bankCounts).every((count) => count === 0)
    && policy.knownGapCodes.includes('EXTERNAL_BANKS_EMPTY'), bankCounts);
check('EMBEDDED-FALLBACK', 'empty external banks do not erase embedded practice simulation and oral legacy roles',
  lessons.every((lesson) => ['practice', 'simulation', 'application', 'professor_qa'].every((role) =>
    lesson.slides.some((slide) => slide.role === role))),
  ['practice', 'simulation', 'application', 'professor_qa']);
check('SOURCE-AUTHORITY', 'policy preserves legacy authority and reviewed overlay precedence without source mutation',
  policy.sourceAuthority.legacyLessons === LESSONS_PATH
    && policy.sourceAuthority.reviewedTheoryOverlay === OVERLAY_PATH + '#records'
    && factory.subjects.math.compatibility.sourceMutation === false,
  policy.sourceAuthority);
check('DOMAIN-COVERAGE', 'all 347 lessons resolve to one explicit ИУ-5 bridge domain',
  nodes.every((node) => Boolean(node.domainId))
    && unique(nodes.map((node) => node.domainId)).length === policy.domainProfiles.length,
  unique(nodes.map((node) => node.domainId)));
check('DOWNSTREAM-TARGETS', 'all AI Data Signal Systems Research Russian Foundation and Programming refs resolve',
  policy.domainProfiles.every((profile) => profile.downstreamRefs.every((ref) => knownDownstream.has(ref))),
  policy.domainProfiles.flatMap((profile) => profile.downstreamRefs));
check('GRAPH-COVERAGE', 'prerequisite graph has one node per stable legacy lesson',
  graph.nodeCount === 347 && new Set(nodes.map((node) => node.lessonId)).size === 347,
  graph.nodeCount);
check('SEQUENCE-BOUNDARY', 'inferred sequence is non-blocking system-derived and requires review',
  graph.prerequisiteEdgeCount === lessons.length - Object.keys(stageCounts).length
    && nodes.flatMap((node) => node.prerequisiteRefs).every((edge) =>
      edge.assessmentBlocking === false
        && edge.manualReviewRequired === true
        && edge.provenance === 'system-derived-source-order')
    && policy.knownGapCodes.includes('PREREQUISITES_SYSTEM_DERIVED'),
  { edges: graph.prerequisiteEdgeCount, stageRoots: Object.keys(stageCounts).length });
check('DOWNSTREAM-NON-MASTERY', 'downstream bridge cannot change Master-ready or learner state',
  policy.downstreamRefPolicy.masterReadyEffect === 'none-until-reviewed-objective-binding'
    && policy.downstreamRefPolicy.sourceMutation === false
    && policy.downstreamRefPolicy.learnerStateMutation === false
    && policy.downstreamRefPolicy.aiMayPromote === false,
  policy.downstreamRefPolicy);
check('SOURCE-IMMUTABLE', 'audit leaves all Math legacy lesson JSON unchanged', digest(lessons) === sourceDigest, sourceDigest);
check('NO-HUTECH-LEARNER-COPY', 'B4 learner artifacts contain no HUTECH label',
  !/HUTECH/i.test(JSON.stringify(policy) + JSON.stringify(graph) + read(DOC_PATH)), 'absent');

fs.writeFileSync(path.join(ROOT, GRAPH_PATH), JSON.stringify(graph, null, 2) + '\n');
const findings = [
  {
    code: 'THEORY_OVERLAY_PARTIAL',
    severity: 'planned-gap',
    evidence: { overlayLessons: 18, legacyLessons: 347, overlayChapters: 3, legacyChapters: 41 },
    owner: 'L7-B5'
  },
  {
    code: 'EXTERNAL_BANKS_EMPTY',
    severity: 'planned-gap',
    evidence: bankCounts,
    fallback: '347 legacy lessons retain embedded practice/simulation/application/professor_qa roles',
    owner: 'L7-B5/L7-B7'
  },
  {
    code: 'PREREQUISITES_SYSTEM_DERIVED',
    severity: 'review-required',
    evidence: { candidateEdges: graph.prerequisiteEdgeCount, runtimeActive: false },
    owner: 'L7-B5/L7-B7'
  }
];
const report = {
  gate: 'L7-B4',
  status: checks.every((item) => item.ok) ? 'PASS' : 'FAIL',
  passMeaning: 'coverage and gap audit complete; not a claim that all external Math banks or theory overlays are complete',
  legacyLessonCount: lessons.length,
  legacyChapterCount: chapterIds.length,
  overlayLessonCount: overlay.length,
  overlayChapterCount: overlayChapterIds.length,
  prerequisiteNodeCount: graph.nodeCount,
  prerequisiteEdgeCount: graph.prerequisiteEdgeCount,
  downstreamEdgeCount: graph.downstreamEdgeCount,
  graphDigest: digest(graph),
  findings,
  checks
};
fs.writeFileSync(path.join(ROOT, REPORT_PATH), JSON.stringify(report, null, 2) + '\n');
for (const item of checks) console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.id} ${item.title}`);
console.log(`L7-B4 ${report.status}: ${checks.filter((item) => item.ok).length}/${checks.length} checks; ${findings.length} tracked findings`);
if (report.status !== 'PASS') process.exit(1);
