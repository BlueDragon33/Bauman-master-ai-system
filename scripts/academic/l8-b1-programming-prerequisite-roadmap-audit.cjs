'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const POLICY_PATH = 'assets/data/lesson/programming-prerequisite-policy-v1.json';
const LESSONS_PATH = 'subjects/programming/data/lessons.json';
const CURRICULUM_PATH = 'subjects/programming/data/curriculum.json';
const MANIFEST_PATH = 'subjects/programming/subject-manifest.json';
const FACTORY_PATH = 'assets/data/lesson/subject-factory-registry-v1.json';
const REFERENCE_PATH = 'assets/data/lesson/reference-implementation-registry-v1.json';
const TWIN_PATH = 'assets/data/lesson/russian-twin-registry-v1.json';
const TWIN_GLOSSARY_PATH = 'assets/data/lesson/russian-twin-glossary-v1.generated.json';
const ROADMAP_PATH = 'assets/data/roadmap/iu5-090401-11-v3.json';
const GRAPH_PATH = 'assets/data/lesson/programming-prerequisite-graph-v1.generated.json';
const DOC_PATH = 'docs/migration/L8_B1_PROGRAMMING_PREREQUISITE_ROADMAP.md';
const REPORT_PATH = 'docs/migration/L8_B1_PROGRAMMING_PREREQUISITE_ROADMAP.generated.json';

const AUXILIARY_PATHS = {
  grammar: 'subjects/programming/data/grammar.json',
  grammarPath: 'subjects/programming/data/grammar-path.json',
  knowledgeIndex: 'subjects/programming/data/knowledge-index.json',
  stageMindmaps: 'subjects/programming/data/mindmap.json',
  exercises: 'subjects/programming/data/exercises.json',
  tests: 'subjects/programming/data/tests.json',
  simulations: 'subjects/programming/data/simulations.json'
};

const EXPECTED_LESSON_IDS = Array.from({ length: 48 }, (_, index) =>
  'PR' + String(index + 1).padStart(2, '0'));
const EXPECTED_STAGE_IDS = ['vn', 'prep', 'hk1', 'hk2', 'hk3', 'hk4'];
const EXPECTED_FOUNDATION_IDS = EXPECTED_LESSON_IDS.slice(0, 16);
const EXPECTED_DOWNSTREAM_IDS = EXPECTED_LESSON_IDS.slice(16);
const EXPECTED_MANDATORY_IDS = [
  'PR01', 'PR02', 'PR03', 'PR07', 'PR08', 'PR09',
  'PR10', 'PR11', 'PR12', 'PR13', 'PR14', 'PR16'
];
const EXPECTED_BRANCH_IDS = ['PR04', 'PR05', 'PR06', 'PR15'];
const EXPECTED_ROOT_IDS = ['PR01', 'PR02', 'PR06', 'PR07', 'PR09'];
const EXPECTED_EDGE_PROJECTION = [
  ['PR01', 'PR03', 'candidate-required-foundation'],
  ['PR03', 'PR04', 'candidate-required-foundation'],
  ['PR04', 'PR05', 'candidate-required-foundation'],
  ['PR01', 'PR08', 'candidate-required-foundation'],
  ['PR03', 'PR08', 'candidate-required-foundation'],
  ['PR07', 'PR08', 'candidate-supporting-foundation'],
  ['PR02', 'PR10', 'candidate-required-foundation'],
  ['PR09', 'PR10', 'candidate-required-foundation'],
  ['PR02', 'PR11', 'candidate-required-foundation'],
  ['PR03', 'PR11', 'candidate-required-foundation'],
  ['PR03', 'PR12', 'candidate-required-foundation'],
  ['PR03', 'PR13', 'candidate-required-foundation'],
  ['PR03', 'PR14', 'candidate-required-foundation'],
  ['PR13', 'PR14', 'candidate-required-foundation'],
  ['PR06', 'PR15', 'candidate-required-foundation'],
  ['PR07', 'PR16', 'candidate-supporting-foundation'],
  ['PR09', 'PR16', 'candidate-required-foundation']
];
const EXPECTED_FINDING_CODES = [
  'SOURCE_PREREQUISITES_ABSENT',
  'PYTHON_FUNDAMENTALS_DEPTH_NOT_YET_ACCEPTED',
  'ALGORITHMS_DATA_STRUCTURES_COVERAGE_THIN',
  'ADVANCED_DATABASE_COVERAGE_GAPS',
  'AUXILIARY_CONTENT_NOT_ACADEMICALLY_QUALIFIED',
  'INTERACTIVE_WIDGETS_DECLARED_NOT_IMPLEMENTED'
];
const EXPECTED_FUTURE_STEPS = Array.from({ length: 13 }, (_, index) => 'L8-B' + (index + 2));
const EXPECTED_SLIDE_TITLES = [
  'Mục tiêu bài học',
  'Workflow lõi',
  'Ví dụ tối thiểu',
  'Sai lầm cần tránh',
  'Ứng dụng Bauman'
];
const REQUIRED_LESSON_FIELDS = [
  'id', 'lessonId', 'stage', 'moduleId', 'title', 'summary', 'description',
  'object', 'method', 'keyPoints', 'slides', 'formula', 'application', 'terminology'
];

const checks = [];
const mutationTests = [];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function json(file) {
  return JSON.parse(read(file));
}

function digest(value) {
  const input = typeof value === 'string' ? value : JSON.stringify(value);
  return crypto.createHash('sha256').update(input).digest('hex');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function sameSet(left, right) {
  return same(Array.from(new Set(list(left))).sort(), Array.from(new Set(list(right))).sort());
}

function check(id, title, ok, evidence) {
  checks.push({ id, title, ok: Boolean(ok), evidence: evidence === undefined ? null : evidence });
}

function mutation(id, title, observed, evidence) {
  mutationTests.push({
    id,
    title,
    expectedFailureObserved: Boolean(observed),
    evidence: evidence === undefined ? null : evidence
  });
}

const requiredFiles = [
  POLICY_PATH,
  LESSONS_PATH,
  CURRICULUM_PATH,
  MANIFEST_PATH,
  FACTORY_PATH,
  REFERENCE_PATH,
  TWIN_PATH,
  TWIN_GLOSSARY_PATH,
  ROADMAP_PATH,
  DOC_PATH,
  ...Object.values(AUXILIARY_PATHS)
];
for (const file of requiredFiles) {
  check('FILE-' + file, 'required L8-B1 input exists', fs.existsSync(path.join(ROOT, file)), file);
}
if (checks.some((item) => !item.ok)) {
  console.error('L8-B1 required input missing.');
  process.exit(2);
}

const policy = json(POLICY_PATH);
const lessons = json(LESSONS_PATH);
const curriculum = json(CURRICULUM_PATH);
const manifest = json(MANIFEST_PATH);
const factoryRegistry = json(FACTORY_PATH);
const factory = factoryRegistry.subjects.programming;
const referenceRegistry = json(REFERENCE_PATH);
const referenceBinding = referenceRegistry.downstreamBindings.programming;
const twinRegistry = json(TWIN_PATH);
const twinProfile = twinRegistry.subjectProfiles.programming;
const twinGlossary = json(TWIN_GLOSSARY_PATH);
const roadmap = json(ROADMAP_PATH);
const auxiliary = Object.fromEntries(Object.entries(AUXILIARY_PATHS).map(([id, file]) => [id, json(file)]));

function classifyLesson(lessonId) {
  for (const rule of list(factory.lessonTypePolicy.rules)) {
    if (list(rule.lessonIds).includes(lessonId)) return rule.type;
  }
  return factory.lessonTypePolicy.default;
}

function countsBy(values) {
  return values.reduce((result, value) => {
    result[value] = (result[value] || 0) + 1;
    return result;
  }, {});
}

function prerequisiteFields(record) {
  return Object.keys(record).filter((key) => /prereq|dependenc|requires?/i.test(key));
}

function expectedBaselines() {
  return {
    lessonsDigest: digest(lessons),
    curriculumDigest: digest(curriculum),
    manifestDigest: digest(manifest),
    factoryProgrammingDigest: digest(factory),
    referenceBindingDigest: digest(referenceBinding),
    russianTwinProfileDigest: digest(twinProfile),
    roadmapDigest: digest(roadmap)
  };
}

function isAcyclic(nodeIds, edges) {
  const adjacency = new Map(nodeIds.map((id) => [id, []]));
  for (const edge of edges) {
    if (!adjacency.has(edge.fromLessonId) || !adjacency.has(edge.toLessonId)) return false;
    adjacency.get(edge.fromLessonId).push(edge.toLessonId);
  }
  const state = new Map();
  function visit(id) {
    if (state.get(id) === 'visiting') return false;
    if (state.get(id) === 'done') return true;
    state.set(id, 'visiting');
    for (const target of adjacency.get(id)) if (!visit(target)) return false;
    state.set(id, 'done');
    return true;
  }
  return nodeIds.every(visit);
}

function buildGraph(candidate) {
  const primaryStrandByLesson = new Map();
  for (const strand of list(candidate.foundationStrands)) {
    for (const lessonId of list(strand.primaryLessonIds)) primaryStrandByLesson.set(lessonId, strand.id);
  }
  const mandatory = new Set(list(candidate.scope?.mandatoryCoreLessonIds));
  const branches = new Set(list(candidate.scope?.branchIntroductionLessonIds));
  const edges = list(candidate.foundationEdges);
  const nodes = lessons.map((lesson, sourceIndex) => ({
    lessonId: lesson.id,
    sourceIndex,
    stageId: lesson.stage,
    moduleId: lesson.moduleId,
    lessonType: classifyLesson(lesson.id),
    title: lesson.title,
    readinessRole: mandatory.has(lesson.id)
      ? 'mandatory-core'
      : branches.has(lesson.id)
        ? 'branch-introduction'
        : 'downstream-registered-not-sequenced',
    primaryStrandId: primaryStrandByLesson.get(lesson.id) || null,
    reviewState: EXPECTED_FOUNDATION_IDS.includes(lesson.id)
      ? 'L8-B1-system-curated-review-candidate'
      : 'registered-for-owning-later-L8-step',
    prerequisiteRefs: edges.filter((edge) => edge.toLessonId === lesson.id).map((edge) => ({
      targetLessonId: edge.fromLessonId,
      relation: edge.relation,
      requiredState: candidate.dependencyPolicy?.requiredState,
      assessmentBlocking: candidate.dependencyPolicy?.assessmentBlocking,
      runtimeActive: candidate.dependencyPolicy?.runtimeActive,
      manualReviewRequired: candidate.dependencyPolicy?.manualReviewRequired,
      provenance: candidate.dependencyPolicy?.provenance,
      rationale: edge.rationale
    })),
    sourceRef: LESSONS_PATH + '#/' + sourceIndex
  }));
  return {
    schema: 'bauman-programming-prerequisite-graph-v1',
    release: candidate.release,
    status: candidate.dependencyPolicy?.graphStatus,
    policyRef: POLICY_PATH,
    sourceRefs: {
      lessons: LESSONS_PATH,
      curriculum: CURRICULUM_PATH,
      subjectFactory: FACTORY_PATH + '#subjects.programming',
      roadmap: ROADMAP_PATH
    },
    sourceDigests: expectedBaselines(),
    nodeCount: nodes.length,
    foundationNodeCount: nodes.filter((node) => node.reviewState === 'L8-B1-system-curated-review-candidate').length,
    downstreamRegisteredNodeCount: nodes.filter((node) => node.reviewState === 'registered-for-owning-later-L8-step').length,
    prerequisiteEdgeCount: nodes.reduce((sum, node) => sum + node.prerequisiteRefs.length, 0),
    requiredCandidateEdgeCount: edges.filter((edge) => edge.relation === 'candidate-required-foundation').length,
    supportingCandidateEdgeCount: edges.filter((edge) => edge.relation === 'candidate-supporting-foundation').length,
    foundationRootLessonIds: EXPECTED_FOUNDATION_IDS.filter((lessonId) =>
      !edges.some((edge) => edge.toLessonId === lessonId)),
    nodes,
    futureStepHandoffs: clone(candidate.futureStepHandoffs),
    referenceBindings: clone(candidate.referenceBindings),
    activation: {
      runtimeActive: candidate.dependencyPolicy?.runtimeActive,
      assessmentBlocking: candidate.dependencyPolicy?.assessmentBlocking,
      manualReviewRequired: candidate.dependencyPolicy?.manualReviewRequired,
      sourceMutation: candidate.dependencyPolicy?.sourceMutation,
      curriculumMutation: candidate.dependencyPolicy?.curriculumMutation,
      learnerStateMutation: candidate.dependencyPolicy?.learnerStateMutation,
      automaticMasterReady: candidate.runtimeBoundary?.automaticMasterReadyAllowed
    }
  };
}

function policyErrors(candidate) {
  const errors = [];
  const requireRule = (condition, code) => {
    if (!condition) errors.push(code);
  };
  const scope = candidate.scope || {};
  const dependency = candidate.dependencyPolicy || {};
  const graph = buildGraph(candidate);
  const foundationSet = new Set(EXPECTED_FOUNDATION_IDS);
  const sourceIndex = new Map(lessons.map((lesson, index) => [lesson.id, index]));
  const edges = list(candidate.foundationEdges);
  const edgeProjection = edges.map((edge) => [edge.fromLessonId, edge.toLessonId, edge.relation]);
  const edgeKeys = edges.map((edge) => edge.fromLessonId + '>' + edge.toLessonId);
  const strandLessonIds = list(candidate.foundationStrands).flatMap((strand) => list(strand.primaryLessonIds));
  const handoffSteps = list(candidate.futureStepHandoffs).flatMap((handoff) => list(handoff.stepIds));

  requireRule(candidate.policyId === 'bauman-programming-prerequisite-policy', 'POLICY_ID');
  requireRule(candidate.policyVersion === '1.0.0', 'POLICY_VERSION');
  requireRule(candidate.release === 'L8-B1-PROGRAMMING-PREREQUISITE-ROADMAP-V1', 'POLICY_RELEASE');
  requireRule(candidate.status === 'AUDIT_ROADMAP_RUNTIME_UNCHANGED', 'POLICY_STATUS');
  requireRule(candidate.programIdentity?.department === 'ИУ-5'
    && candidate.programIdentity?.officialPublishedDirectionCode === '09.04.01'
    && candidate.programIdentity?.personalizedDisplayCode === '09.04.01/11', 'PROGRAM_IDENTITY');
  requireRule(candidate.sourceAuthority?.lessons === LESSONS_PATH
    && candidate.sourceAuthority?.curriculum === CURRICULUM_PATH
    && candidate.sourceAuthority?.manifest === MANIFEST_PATH
    && candidate.sourceAuthority?.roadmap === ROADMAP_PATH
    && /read-only/.test(candidate.sourceAuthority?.rule || '')
    && /never inserts inferred prerequisites/.test(candidate.sourceAuthority?.rule || ''), 'SOURCE_AUTHORITY');
  requireRule(same(candidate.sourceBaselines, expectedBaselines()), 'SOURCE_BASELINES');

  requireRule(scope.auditedLessonCount === 48
    && scope.foundationLessonCount === 16
    && scope.downstreamRegisteredLessonCount === 32
    && same(scope.foundationStageIds, ['vn', 'prep']), 'SCOPE_COUNTS');
  requireRule(same(scope.mandatoryCoreLessonIds, EXPECTED_MANDATORY_IDS), 'MANDATORY_CORE_IDS');
  requireRule(same(scope.branchIntroductionLessonIds, EXPECTED_BRANCH_IDS), 'BRANCH_INTRODUCTION_IDS');
  requireRule(sameSet([...list(scope.mandatoryCoreLessonIds), ...list(scope.branchIntroductionLessonIds)], EXPECTED_FOUNDATION_IDS)
    && list(scope.mandatoryCoreLessonIds).every((id) => !list(scope.branchIntroductionLessonIds).includes(id)), 'FOUNDATION_SCOPE_PARTITION');
  requireRule(sameSet(strandLessonIds, EXPECTED_FOUNDATION_IDS)
    && strandLessonIds.length === EXPECTED_FOUNDATION_IDS.length
    && list(candidate.foundationStrands).length === 6, 'FOUNDATION_STRAND_PARTITION');

  requireRule(same(dependency.allowedRelations, ['candidate-required-foundation', 'candidate-supporting-foundation'])
    && dependency.graphStatus === 'review-candidate-not-runtime-active'
    && dependency.requiredState === 'practised'
    && dependency.assessmentBlocking === false
    && dependency.runtimeActive === false
    && dependency.manualReviewRequired === true
    && dependency.provenance === 'system-curated-concept-dependency'
    && dependency.sourceMutation === false
    && dependency.curriculumMutation === false
    && dependency.learnerStateMutation === false
    && dependency.aiMayPromote === false
    && dependency.unknownLessonBehavior === 'fail-closed', 'DEPENDENCY_BOUNDARY');
  requireRule(same(edgeProjection, EXPECTED_EDGE_PROJECTION), 'EDGE_PROJECTION');
  requireRule(new Set(edgeKeys).size === edges.length
    && edges.every((edge) => edge.fromLessonId !== edge.toLessonId
      && foundationSet.has(edge.fromLessonId)
      && foundationSet.has(edge.toLessonId)
      && dependency.allowedRelations.includes(edge.relation)
      && String(edge.rationale || '').length >= 45), 'EDGE_SHAPE_SCOPE');
  requireRule(edges.every((edge) => sourceIndex.get(edge.fromLessonId) < sourceIndex.get(edge.toLessonId)), 'EDGE_FORWARD_SOURCE_POSITION');
  requireRule(isAcyclic(EXPECTED_FOUNDATION_IDS, edges), 'EDGE_ACYCLIC');
  requireRule(same(graph.foundationRootLessonIds, EXPECTED_ROOT_IDS), 'FOUNDATION_ROOTS');
  requireRule(graph.prerequisiteEdgeCount === 17
    && graph.requiredCandidateEdgeCount === 15
    && graph.supportingCandidateEdgeCount === 2, 'EDGE_COUNTS');

  requireRule(sameSet(handoffSteps, EXPECTED_FUTURE_STEPS)
    && handoffSteps.length === EXPECTED_FUTURE_STEPS.length, 'FUTURE_STEP_COVERAGE');
  requireRule(list(candidate.futureStepHandoffs).every((handoff) =>
    list(handoff.currentAnchorLessonIds).every((id) => EXPECTED_LESSON_IDS.includes(id))
      && list(handoff.requiredFoundationLessonIds).every((id) => foundationSet.has(id))
      && list(handoff.supportingFoundationLessonIds).every((id) => foundationSet.has(id))
      && list(handoff.requiredFoundationLessonIds).every((id) => !list(handoff.supportingFoundationLessonIds).includes(id))
      && String(handoff.boundary || '').length >= 55), 'FUTURE_HANDOFF_BOUNDARIES');

  requireRule(candidate.referenceBindings?.russianTwin?.referenceId === 'russian'
    && candidate.referenceBindings?.russianTwin?.availability === twinProfile.availability
    && candidate.referenceBindings?.russianTwin?.sourceAlignedLessonCount === twinGlossary.records.length
    && same(candidate.referenceBindings?.russianTwin?.typeProfiles, factory.lessonTypePolicy.allowed)
    && candidate.referenceBindings?.russianTwin?.activation === referenceBinding.russianReference.activation
    && candidate.referenceBindings?.russianTwin?.learnerStateMutation === false, 'RUSSIAN_REFERENCE_BOUNDARY');
  requireRule(candidate.referenceBindings?.mathSupport?.referenceId === 'math'
    && candidate.referenceBindings?.mathSupport?.relation === referenceBinding.mathReference.relation
    && same(candidate.referenceBindings?.mathSupport?.domainIds, referenceBinding.mathReference.domainIds)
    && same(candidate.referenceBindings?.mathSupport?.targetLessonIds,
      referenceBinding.mathReference.targetRefs.map((ref) => ref.split(':')[1]))
    && candidate.referenceBindings?.mathSupport?.assessmentBlocking === false
    && candidate.referenceBindings?.mathSupport?.runtimeActive === false
    && candidate.referenceBindings?.mathSupport?.masterReadyEffect === referenceBinding.mathReference.masterReadyEffect,
  'MATH_REFERENCE_BOUNDARY');

  requireRule(same(candidate.coverageExpectations?.stageCounts, {
    vn: 8, prep: 8, hk1: 8, hk2: 8, hk3: 8, hk4: 8
  }), 'EXPECTED_STAGE_COUNTS');
  requireRule(same(candidate.coverageExpectations?.lessonTypeCounts, {
    programming: 28, database: 4, 'software-design': 16
  }), 'EXPECTED_TYPE_COUNTS');
  requireRule(candidate.coverageExpectations?.lessonSlidesEach === 5
    && same(candidate.coverageExpectations?.auxiliaryRecords, {
      grammar: 48,
      grammarPath: 48,
      knowledgeIndex: 48,
      stageMindmaps: 6,
      exercises: 144,
      tests: 384,
      simulations: 96
    }), 'EXPECTED_AUXILIARY_COUNTS');

  requireRule(same(list(candidate.knownFindings).map((finding) => finding.code), EXPECTED_FINDING_CODES), 'FINDING_CODES');
  requireRule(list(candidate.knownFindings).every((finding) =>
    /^OPEN_/.test(finding.status || '')
      && String(finding.evidence || '').length >= 80
      && list(finding.blocks).length > 0
      && /^L8-/.test(finding.nextOwner || '')), 'FINDING_DISPOSITIONS');
  const requiredNotClaimed = [
    'source-prerequisites-are-official',
    'runtime-prerequisite-enforcement',
    'learner-locking-or-unlocking',
    'programming-content-depth-approved',
    'assessment-quality-approved',
    'L8-B2-through-B14-complete',
    'master-ready',
    'runtime-or-ui-cutover',
    'main-branch-merge'
  ];
  requireRule(requiredNotClaimed.every((claim) => list(candidate.claimBoundary?.notClaimed).includes(claim))
    && /deterministic and fail closed/.test(candidate.claimBoundary?.passMeaning || ''), 'CLAIM_BOUNDARY');
  requireRule(Object.values(candidate.runtimeBoundary || {}).length === 12
    && Object.values(candidate.runtimeBoundary || {}).every((value) => value === false), 'RUNTIME_BOUNDARY');
  requireRule(candidate.rollback?.sourceContentImpact === 'none'
    && candidate.rollback?.learnerStateImpact === 'none'
    && candidate.rollback?.runtimeImpact === 'none'
    && candidate.rollback?.offlinePolicyImpact === 'none'
    && candidate.rollback?.mainBranchImpact === 'none', 'ROLLBACK_BOUNDARY');
  return errors;
}

const graph = buildGraph(policy);
const stageCounts = countsBy(lessons.map((lesson) => lesson.stage));
const typeCounts = countsBy(lessons.map((lesson) => classifyLesson(lesson.id)));
const moduleByStage = Object.fromEntries(curriculum.modules.map((module) => [module.stage, module.id]));
const explicitPrerequisiteFields = lessons.flatMap((lesson) =>
  prerequisiteFields(lesson).map((field) => ({ lessonId: lesson.id, field })));
const allSlideTitleSets = new Set(lessons.map((lesson) => JSON.stringify(lesson.slides.map((slide) => slide.title))));
const tests = auxiliary.tests.questions;
const auxiliaryCounts = {
  grammar: auxiliary.grammar.length,
  grammarPath: auxiliary.grammarPath.length,
  knowledgeIndex: auxiliary.knowledgeIndex.length,
  stageMindmaps: auxiliary.stageMindmaps.length,
  exercises: auxiliary.exercises.length,
  tests: tests.length,
  simulations: auxiliary.simulations.length
};
const advancedAlgorithmTerms = ['search', 'sort', 'hash', 'tree', 'graph', 'duyệt đồ thị', 'cây', 'băm', 'sắp xếp', 'tìm kiếm'];
const advancedDatabaseTerms = ['normalization', 'transaction', 'query plan', 'database optimization', 'nosql', 'chuẩn hóa cơ sở dữ liệu', 'giao dịch cơ sở dữ liệu', 'kế hoạch truy vấn', 'tối ưu cơ sở dữ liệu'];
const normalizedTitles = lessons.map((lesson) => lesson.title.toLowerCase());

check('POLICY-VALID', 'Programming prerequisite policy passes every fail-closed structural and observed-truth rule',
  policyErrors(policy).length === 0, policyErrors(policy));
check('LESSON-IDENTITY-COVERAGE', 'all 48 authoritative Programming lesson IDs remain unique and in their current source order',
  same(lessons.map((lesson) => lesson.id), EXPECTED_LESSON_IDS)
    && lessons.every((lesson) => lesson.lessonId === lesson.id)
    && new Set(lessons.map((lesson) => lesson.id)).size === 48
    && manifest.data.lessons === 48,
  { lessonCount: lessons.length, first: lessons[0]?.id, last: lessons[lessons.length - 1]?.id });
check('LESSON-FIELD-COVERAGE', 'every source lesson retains the existing pedagogical and terminology fields',
  lessons.every((lesson) => REQUIRED_LESSON_FIELDS.every((field) => Object.prototype.hasOwnProperty.call(lesson, field))),
  REQUIRED_LESSON_FIELDS);
check('SOURCE-PREREQUISITES-ABSENT', 'source truth records zero explicit prerequisite or dependency fields',
  explicitPrerequisiteFields.length === 0
    && policy.knownFindings.some((finding) => finding.code === 'SOURCE_PREREQUISITES_ABSENT'),
  explicitPrerequisiteFields);
check('CURRICULUM-STAGE-COVERAGE', 'curriculum and lessons retain six stages with eight lessons each',
  same(curriculum.stages.map((stage) => stage.id), EXPECTED_STAGE_IDS)
    && same(stageCounts, policy.coverageExpectations.stageCounts)
    && lessons.every((lesson) => moduleByStage[lesson.stage] === lesson.moduleId),
  { stageIds: curriculum.stages.map((stage) => stage.id), stageCounts });
check('CURRICULUM-PRINCIPLE', 'current curriculum still states the Python SQL Git to terminology to OOP database software engineering to NIR VKR progression',
  curriculum.principles.some((principle) => /Python\/SQL\/Git/.test(principle)
    && /OOP\/CSDL\/Kỹ nghệ/.test(principle)
    && /НИР\/ВКР/.test(principle)),
  curriculum.principles);
check('FACTORY-TYPE-PARITY', 'all Programming lessons resolve through the authoritative three-type Subject Factory policy',
  same(factory.lessonTypePolicy.allowed, ['programming', 'database', 'software-design'])
    && factory.lessonTypePolicy.default === 'programming'
    && same(typeCounts, policy.coverageExpectations.lessonTypeCounts),
  typeCounts);
check('SPECIALIST-OWNERSHIP', 'Programming keeps its specialist engine route source and offline policy without direct migration',
  factory.engineRef === 'programming-v2-specialist'
    && factory.routes.main === 'subjects/programming/index.html'
    && factory.offlinePolicyRef === 'programming-rich-explicit'
    && factory.dataSources.lessonSourcePolicy.primary === 'lessons'
    && factory.compatibility.directMigration === false
    && factory.compatibility.sourceMutation === false
    && factory.compatibility.learnerStateMigration === false,
  { engineRef: factory.engineRef, route: factory.routes.main, offlinePolicyRef: factory.offlinePolicyRef });
check('FIVE-SLIDE-SOURCE-TRUTH', 'every lesson currently retains five blocks with the same source slide-title roles',
  lessons.every((lesson) => lesson.slides.length === 5 && same(lesson.slides.map((slide) => slide.title), EXPECTED_SLIDE_TITLES))
    && allSlideTitleSets.size === 1,
  { lessons: lessons.length, slidesEach: 5, uniqueSlideTitleSets: allSlideTitleSets.size });
check('FOUNDATION-PARTITION', 'the sixteen vn/prep lessons split into twelve mandatory core and four branch introductions exactly once',
  graph.foundationNodeCount === 16
    && graph.downstreamRegisteredNodeCount === 32
    && graph.nodes.filter((node) => node.readinessRole === 'mandatory-core').length === 12
    && graph.nodes.filter((node) => node.readinessRole === 'branch-introduction').length === 4,
  countsBy(graph.nodes.map((node) => node.readinessRole)));
check('DOWNSTREAM-UNSEQUENCED', 'PR17-PR48 remain visible but receive no B1 prerequisite edge or completion claim',
  graph.nodes.filter((node) => EXPECTED_DOWNSTREAM_IDS.includes(node.lessonId)).every((node) =>
    node.reviewState === 'registered-for-owning-later-L8-step'
      && node.prerequisiteRefs.length === 0
      && node.primaryStrandId === null),
  { downstreamNodes: EXPECTED_DOWNSTREAM_IDS.length });
check('GRAPH-BOUNDARY', 'all seventeen concept-dependency candidates are inactive non-blocking and require manual review',
  graph.prerequisiteEdgeCount === 17
    && graph.requiredCandidateEdgeCount === 15
    && graph.supportingCandidateEdgeCount === 2
    && graph.nodes.flatMap((node) => node.prerequisiteRefs).every((edge) =>
      edge.assessmentBlocking === false
        && edge.runtimeActive === false
        && edge.manualReviewRequired === true
        && edge.provenance === 'system-curated-concept-dependency'),
  { total: graph.prerequisiteEdgeCount, required: graph.requiredCandidateEdgeCount, supporting: graph.supportingCandidateEdgeCount });
check('GRAPH-NOT-SOURCE-ORDER-CHAIN', 'B1 graph is a concept map with five roots rather than an automatic previous-lesson chain',
  same(graph.foundationRootLessonIds, EXPECTED_ROOT_IDS)
    && graph.prerequisiteEdgeCount !== EXPECTED_FOUNDATION_IDS.length - policy.scope.foundationStageIds.length,
  graph.foundationRootLessonIds);
check('AUXILIARY-COUNT-COVERAGE', 'current workflow index exercise test simulation and stage-map counts remain exact',
  same(auxiliaryCounts, policy.coverageExpectations.auxiliaryRecords), auxiliaryCounts);
check('AUXILIARY-LESSON-COVERAGE', 'each lesson retains one workflow record three exercises eight test questions and two simulations',
  EXPECTED_LESSON_IDS.every((lessonId) =>
    auxiliary.grammar.filter((item) => item.lessonId === lessonId).length === 1
      && auxiliary.grammarPath.filter((item) => item.lessonId === lessonId).length === 1
      && auxiliary.exercises.filter((item) => item.lessonId === lessonId).length === 3
      && tests.filter((item) => item.lessonId === lessonId).length === 8
      && auxiliary.simulations.filter((item) => item.lessonId === lessonId).length === 2),
  { lessons: EXPECTED_LESSON_IDS.length, grammarEach: 1, grammarPathEach: 1, exercisesEach: 3, testsEach: 8, simulationsEach: 2 });
check('KNOWLEDGE-MINDMAP-COVERAGE', 'knowledge index and stage mindmaps cover every stable lesson identity exactly once',
  EXPECTED_LESSON_IDS.every((lessonId) => auxiliary.knowledgeIndex.filter((item) => item.id === 'ki_' + lessonId).length === 1)
    && sameSet(auxiliary.stageMindmaps.flatMap((map) => map.branches.map((branch) => branch.id.replace(/^node_/, ''))), EXPECTED_LESSON_IDS),
  { knowledgeRecords: auxiliary.knowledgeIndex.length, mindmapNodes: auxiliary.stageMindmaps.flatMap((map) => map.branches).length });
check('ROADMAP-TRACK-ALIGNMENT', 'B1 keeps the four authoritative Programming-adjacent Roadmap V3 tracks and priorities',
  roadmap.department === 'ИУ-5'
    && roadmap.officialPublishedDirectionCode === '09.04.01'
    && roadmap.displayCode === '09.04.01/11'
    && same(roadmap.tracks['python-oop'].modules,
      ['python-core', 'oop', 'solid-patterns', 'numpy-pandas', 'testing', 'git', 'api-data-pipeline'])
    && same(roadmap.tracks.algorithms.modules,
      ['complexity', 'linear-structures', 'hashing', 'trees-graphs', 'search-sort', 'graph-traversal'])
    && same(roadmap.tracks.database.modules,
      ['sql', 'relational-model', 'schema-normalization', 'transactions', 'indexing-query-plan', 'db-optimization', 'post-relational', 'ml-data-architecture'])
    && same(roadmap.tracks['software-engineering'].modules,
      ['requirements', 'uml', 'architecture', 'oop-system-design', 'testing-strategy', 'versioning-ci', 'lifecycle', 'project-management']),
  {
    pythonOop: roadmap.tracks['python-oop'].modules,
    algorithms: roadmap.tracks.algorithms.modules,
    database: roadmap.tracks.database.modules,
    softwareEngineering: roadmap.tracks['software-engineering'].modules
  });
check('ALGORITHM-GAP-TRUTH', 'current titles do not silently claim explicit search sort hash tree or graph module coverage',
  advancedAlgorithmTerms.every((term) => normalizedTitles.every((title) => !title.includes(term)))
    && policy.knownFindings.some((finding) => finding.code === 'ALGORITHMS_DATA_STRUCTURES_COVERAGE_THIN'),
  advancedAlgorithmTerms);
check('DATABASE-GAP-TRUTH', 'current titles do not silently claim explicit normalization transaction query-plan optimization or NoSQL coverage',
  advancedDatabaseTerms.every((term) => normalizedTitles.every((title) => !title.includes(term)))
    && policy.knownFindings.some((finding) => finding.code === 'ADVANCED_DATABASE_COVERAGE_GAPS'),
  advancedDatabaseTerms);
check('RUSSIAN-TWIN-SOURCE-ALIGNMENT', 'Russian Twin remains source-aligned to all 48 Programming terminology records without learner-state mutation',
  twinProfile.availability === 'source-aligned'
    && twinProfile.sourcePath === LESSONS_PATH
    && twinGlossary.subjectId === 'programming'
    && twinGlossary.records.length === 48
    && sameSet(twinGlossary.records.map((record) => record.usageContexts[0].lessonId), EXPECTED_LESSON_IDS)
    && policy.referenceBindings.russianTwin.learnerStateMutation === false,
  { availability: twinProfile.availability, records: twinGlossary.records.length });
check('MATH-SUPPORT-NONBLOCKING', 'Math remains a supports-only review candidate for PR06 and PR20',
  same(referenceBinding.mathReference.targetRefs, ['programming:PR06', 'programming:PR20'])
    && referenceBinding.mathReference.relation === 'supports'
    && referenceBinding.mathReference.assessmentBlocking === false
    && policy.referenceBindings.mathSupport.runtimeActive === false,
  referenceBinding.mathReference);
check('PLANNED-WIDGET-TRUTH', 'code runner and SQL playground remain planned-L8 with static fallbacks and no Master-ready authority',
  factoryRegistry.widgetCatalog['code-runner'].availability === 'planned-L8'
    && factoryRegistry.widgetCatalog['code-runner'].fallback === 'static-code-exercise'
    && factoryRegistry.widgetCatalog['code-runner'].masterReadyAuthority === 'none-until-implemented'
    && factoryRegistry.widgetCatalog['sql-playground'].availability === 'planned-L8'
    && factoryRegistry.widgetCatalog['sql-playground'].fallback === 'query-and-expected-result-card'
    && factoryRegistry.widgetCatalog['sql-playground'].masterReadyAuthority === 'none-until-implemented',
  {
    codeRunner: factoryRegistry.widgetCatalog['code-runner'],
    sqlPlayground: factoryRegistry.widgetCatalog['sql-playground']
  });
check('FINDINGS-REMAIN-OPEN', 'all six audit findings stay visible and block their specific later acceptance claims',
  same(policy.knownFindings.map((finding) => finding.code), EXPECTED_FINDING_CODES)
    && policy.knownFindings.every((finding) => /^OPEN_/.test(finding.status) && finding.blocks.length > 0),
  policy.knownFindings.map((finding) => ({ code: finding.code, status: finding.status, nextOwner: finding.nextOwner })));
check('NO-HUTECH-LEARNER-COPY', 'L8-B1 learner-facing governance artifacts contain no HUTECH label',
  !/HUTECH/i.test(JSON.stringify(policy) + JSON.stringify(graph) + read(DOC_PATH)), 'absent');
check('DOC-DECISION-RECORD', 'decision record states source truth candidate semantics handoffs findings claim boundary and rollback',
  /48 bài/.test(read(DOC_PATH))
    && /17 cạnh/.test(read(DOC_PATH))
    && /review-candidate-not-runtime-active/.test(read(DOC_PATH))
    && /PR17–PR48/.test(read(DOC_PATH))
    && /SOURCE_PREREQUISITES_ABSENT/.test(read(DOC_PATH))
    && /INTERACTIVE_WIDGETS_DECLARED_NOT_IMPLEMENTED/.test(read(DOC_PATH))
    && /không phải/.test(read(DOC_PATH))
    && /rollback/i.test(read(DOC_PATH))
    && /L8-B2/.test(read(DOC_PATH)),
  DOC_PATH);

function mutatePolicy(id, title, applyMutation) {
  const mutant = clone(policy);
  applyMutation(mutant);
  const errors = policyErrors(mutant);
  mutation(id, title, errors.length > 0, errors);
}

mutatePolicy('DRIFT-SOURCE-BASELINE', 'a changed Programming source baseline requires explicit B1 review',
  (candidate) => { candidate.sourceBaselines.lessonsDigest = '0'.repeat(64); });
mutatePolicy('ENABLE-RUNTIME', 'candidate prerequisites cannot become runtime-active in B1',
  (candidate) => { candidate.dependencyPolicy.runtimeActive = true; });
mutatePolicy('BLOCK-ASSESSMENT', 'candidate prerequisites cannot block assessment in B1',
  (candidate) => { candidate.dependencyPolicy.assessmentBlocking = true; });
mutatePolicy('DROP-MANDATORY-CORE', 'dropping a mandatory foundation lesson fails closed',
  (candidate) => { candidate.scope.mandatoryCoreLessonIds.pop(); });
mutatePolicy('OVERLAP-FOUNDATION-ROLES', 'a lesson cannot be both mandatory core and branch introduction',
  (candidate) => { candidate.scope.mandatoryCoreLessonIds.push('PR04'); });
mutatePolicy('CHANGE-CONCEPT-EDGE', 'changing an approved B1 concept edge requires explicit review',
  (candidate) => { candidate.foundationEdges[0].fromLessonId = 'PR02'; });
mutatePolicy('ADD-SELF-CYCLE', 'self-referential prerequisite candidates fail closed',
  (candidate) => { candidate.foundationEdges[0].fromLessonId = 'PR03'; });
mutatePolicy('SEQUENCE-DOWNSTREAM-EARLY', 'B1 cannot add prerequisites to PR17-PR48',
  (candidate) => { candidate.foundationEdges[0].toLessonId = 'PR17'; });
mutatePolicy('DROP-FUTURE-STEP', 'every L8-B2 through B14 handoff must remain visible',
  (candidate) => { candidate.futureStepHandoffs.pop(); });
mutatePolicy('PROMOTE-MATH-SUPPORT', 'Math supports links cannot become assessment-blocking prerequisites',
  (candidate) => { candidate.referenceBindings.mathSupport.assessmentBlocking = true; });
mutatePolicy('INVENT-RUSSIAN-COVERAGE', 'Russian Twin source-aligned count cannot exceed its 48 reviewed records',
  (candidate) => { candidate.referenceBindings.russianTwin.sourceAlignedLessonCount = 49; });
mutatePolicy('HIDE-FINDING', 'all six unresolved L8 findings must remain visible',
  (candidate) => { candidate.knownFindings.shift(); });
mutatePolicy('CLAIM-CONTENT-COMPLETE', 'B1 cannot claim Programming content completion',
  (candidate) => { candidate.runtimeBoundary.contentCompletionClaimAllowed = true; });
mutatePolicy('CLAIM-MASTER-READY', 'B1 cannot grant automatic Master-ready',
  (candidate) => { candidate.runtimeBoundary.automaticMasterReadyAllowed = true; });

for (const item of mutationTests) {
  check('MUTATION-' + item.id, item.title, item.expectedFailureObserved, item.evidence);
}

fs.writeFileSync(path.join(ROOT, GRAPH_PATH), JSON.stringify(graph, null, 2) + '\n');
const report = {
  gate: 'L8-B1',
  release: policy.release,
  status: checks.every((item) => item.ok) ? 'PASS' : 'FAIL',
  sourceAudit: {
    lessonCount: lessons.length,
    stageCounts,
    lessonTypeCounts: typeCounts,
    slideCount: lessons.reduce((sum, lesson) => sum + lesson.slides.length, 0),
    explicitPrerequisiteFieldCount: explicitPrerequisiteFields.length,
    auxiliaryCounts,
    sourceDigests: expectedBaselines()
  },
  foundationRoadmap: {
    lessonCount: graph.foundationNodeCount,
    mandatoryCoreCount: policy.scope.mandatoryCoreLessonIds.length,
    branchIntroductionCount: policy.scope.branchIntroductionLessonIds.length,
    strandCount: policy.foundationStrands.length,
    rootLessonIds: graph.foundationRootLessonIds,
    candidateEdgeCount: graph.prerequisiteEdgeCount,
    requiredCandidateEdgeCount: graph.requiredCandidateEdgeCount,
    supportingCandidateEdgeCount: graph.supportingCandidateEdgeCount,
    graphDigest: digest(graph)
  },
  downstreamBoundary: {
    registeredUnsequencedLessonCount: graph.downstreamRegisteredNodeCount,
    futureStepCount: EXPECTED_FUTURE_STEPS.length,
    russianTwinSourceAlignedLessonCount: twinGlossary.records.length,
    mathSupportTargetLessonIds: policy.referenceBindings.mathSupport.targetLessonIds,
    runtimeActive: graph.activation.runtimeActive,
    assessmentBlocking: graph.activation.assessmentBlocking
  },
  findingCount: policy.knownFindings.length,
  findings: policy.knownFindings,
  policyDigest: digest(policy),
  graphDigest: digest(graph),
  mutationTests,
  passMeaning: policy.claimBoundary.passMeaning
    + ' PASS is an audit and roadmap checkpoint, not academic approval, runtime activation, learner evidence, content completion or Master-ready.',
  checks
};
fs.writeFileSync(path.join(ROOT, REPORT_PATH), JSON.stringify(report, null, 2) + '\n');
for (const item of checks) console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.id} ${item.title}`);
console.log(`L8-B1 ${report.status}: ${checks.filter((item) => item.ok).length}/${checks.length} checks; ${mutationTests.filter((item) => item.expectedFailureObserved).length}/${mutationTests.length} mutations; ${policy.knownFindings.length} findings`);
if (report.status !== 'PASS') process.exit(1);
