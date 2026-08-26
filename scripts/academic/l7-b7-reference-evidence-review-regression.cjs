'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.cwd();
const ENGINE_PATH = 'assets/js/platform/universal-lesson/reference-subject-evidence-review-v1.js';
const REGISTRY_PATH = 'assets/data/lesson/reference-subject-evidence-review-v1.json';
const POLICY_PATH = 'assets/data/lesson/master-ready-policy-v1.json';
const TYPE_REGISTRY_PATH = 'assets/data/lesson/lesson-type-registry-v1.json';
const FACTORY_PATH = 'assets/data/lesson/subject-factory-registry-v1.json';
const RUSSIAN_ADAPTER_PATH = 'assets/js/platform/universal-lesson/russian-universal-adapter-v1.js';
const MATH_ADAPTER_PATH = 'assets/js/platform/universal-lesson/math-universal-adapter-v1.js';
const FOUNDATION_BRIDGE_PATH = 'assets/js/platform/universal-lesson/foundation-preparatory-bridge-v1.js';
const FOUNDATION_CONTRACT_PATH = 'assets/data/lesson/foundation-preparatory-bridge-v1.json';
const DOC_PATH = 'docs/migration/L7_B7_REFERENCE_EVIDENCE_SPACED_REVIEW.md';
const REPORT_PATH = 'docs/migration/L7_B7_REFERENCE_EVIDENCE_SPACED_REVIEW.generated.json';
const RUNTIME_PATHS = [
  'subjects/russian/index.html',
  'subjects/math/index.html',
  'subjects/foundation/index.html',
  'assets/js/platform/storage-adapter.js',
  'assets/js/platform/subject-storage.js'
];
const MATH_BANK_PATHS = {
  formulas: 'subjects/math/data/formulas.json',
  exercises: 'subjects/math/data/exercises.json',
  simulations: 'subjects/math/data/simulations.json',
  applications: 'subjects/math/data/applications.json',
  professorQa: 'subjects/math/data/professor_qa.json',
  tests: 'subjects/math/data/tests.json',
  questionBank: 'subjects/math/data/question_bank.json'
};

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

function check(id, title, ok, evidence) {
  checks.push({ id, title, ok: Boolean(ok), evidence: evidence === undefined ? null : evidence });
}

function mutation(id, title, observed, evidence) {
  mutationTests.push({ id, title, expectedFailureObserved: Boolean(observed), evidence: evidence || null });
}

function rejected(fn, expectedCode) {
  try {
    fn();
    return { rejected: false, code: null };
  } catch (error) {
    return {
      rejected: expectedCode ? error && error.code === expectedCode : true,
      code: error && error.code || error && error.name || 'unknown-error'
    };
  }
}

function allLessons(catalog) {
  return catalog.subjectOrder.flatMap((subjectId) => catalog.subjects[subjectId].lessons);
}

function allSlots(catalog) {
  return allLessons(catalog).flatMap((lesson) => lesson.evidenceSlots);
}

function allTemplates(catalog) {
  return allLessons(catalog).flatMap((lesson) => lesson.reviewHookTemplates);
}

function verifiedStages(lesson, policy, overrides = {}) {
  return ['understand', 'solve', 'build-apply', 'explain'].map((stage, index) => ({
    evaluationId: `eval:${lesson.subjectId}:${lesson.lessonId}:${stage}`,
    stage,
    normalizedScore: Math.min(1, policy.profiles[lesson.typeId].stageMinimums[stage] + 0.05),
    status: 'verified',
    sourceIntegrityValid: true,
    verification: {
      actorType: 'deterministic-evaluator',
      method: 'artifact-validator'
    },
    ...(overrides[stage] || {}),
    order: index
  }));
}

function verifiedAttempts(lesson, anchorAt, policy, overrides = {}) {
  const anchorMs = Date.parse(anchorAt);
  return lesson.reviewHookTemplates.map((hook, index) => ({
    attemptId: `attempt:${lesson.subjectId}:${lesson.lessonId}:d${hook.windowDays}:1`,
    hookId: hook.hookId,
    subjectId: lesson.subjectId,
    lessonId: lesson.lessonId,
    createdAt: new Date(anchorMs + hook.windowDays * 86400000).toISOString(),
    normalizedScore: Math.min(1, policy.profiles[lesson.typeId].retentionPolicy.minimumNormalized + 0.05),
    status: 'verified',
    variedPrompt: true,
    protectedAnswerReused: false,
    sourceIntegrityValid: true,
    verification: {
      actorType: 'deterministic-evaluator',
      method: 'artifact-validator'
    },
    ...(overrides[hook.windowDays] || {}),
    order: index
  }));
}

function fullGateEvaluation() {
  return {
    evaluationId: 'gate-evaluation-1',
    status: 'verified',
    allStageMinimumsPass: true,
    totalThresholdPass: true,
    criticalCriteriaPass: true,
    requiredPrerequisitesResolved: true,
    sourceIntegrityValid: true,
    verification: {
      actorType: 'instructor-review',
      method: 'rubric-review'
    }
  };
}

const requiredFiles = [
  ENGINE_PATH,
  REGISTRY_PATH,
  POLICY_PATH,
  TYPE_REGISTRY_PATH,
  FACTORY_PATH,
  RUSSIAN_ADAPTER_PATH,
  MATH_ADAPTER_PATH,
  FOUNDATION_BRIDGE_PATH,
  FOUNDATION_CONTRACT_PATH,
  DOC_PATH,
  'subjects/russian/data/lessons.json',
  'subjects/math/data/lessons.json',
  'subjects/math/data/theory_lecture_content.json',
  'assets/data/lesson/math-prerequisite-graph-v1.generated.json',
  'subjects/foundation/data/curriculum.json',
  'subjects/foundation/data/lessons.json',
  'subjects/foundation/data/exercises.json',
  'subjects/foundation/data/tests.json',
  'subjects/foundation/data/simulations.json',
  'assets/data/lesson/reference-lesson-activation-v1.json',
  'assets/data/roadmap/iu5-090401-11-v3.json',
  ...Object.values(MATH_BANK_PATHS),
  ...RUNTIME_PATHS
];
for (const file of requiredFiles) {
  check('FILE-' + file, 'required L7-B7 input exists', fs.existsSync(path.join(ROOT, file)), file);
}
if (checks.some((item) => !item.ok)) {
  console.error('L7-B7 cannot start because required inputs are missing.');
  process.exit(2);
}

const registry = json(REGISTRY_PATH);
const masterReadyPolicy = json(POLICY_PATH);
const lessonTypeRegistry = json(TYPE_REGISTRY_PATH);
const subjectFactory = json(FACTORY_PATH);
const russianLessons = json('subjects/russian/data/lessons.json');
const russianSources = {
  dialogues: json('subjects/russian/data/dialogue-bauman-az.json'),
  deepSpeaking: json('subjects/russian/data/deep-speaking-bauman.json'),
  speaking: json('subjects/russian/data/speaking.json'),
  handwriting: json('subjects/russian/data/handwriting.json'),
  writing: json('subjects/russian/data/writing.json'),
  tests: json('subjects/russian/data/tests.json').questions,
  simulations: json('subjects/russian/data/simulations.json')
};
const mathSources = {
  legacyLessons: json('subjects/math/data/lessons.json'),
  theoryOverlay: json('subjects/math/data/theory_lecture_content.json'),
  prerequisiteGraph: json('assets/data/lesson/math-prerequisite-graph-v1.generated.json'),
  banks: Object.fromEntries(Object.entries(MATH_BANK_PATHS).map(([key, file]) => [key, json(file)]))
};
const foundationSources = {
  contract: json(FOUNDATION_CONTRACT_PATH),
  curriculum: json('subjects/foundation/data/curriculum.json'),
  lessons: json('subjects/foundation/data/lessons.json'),
  exercises: json('subjects/foundation/data/exercises.json'),
  tests: json('subjects/foundation/data/tests.json'),
  simulations: json('subjects/foundation/data/simulations.json'),
  subjectFactory,
  referenceActivation: json('assets/data/lesson/reference-lesson-activation-v1.json'),
  roadmap: json('assets/data/roadmap/iu5-090401-11-v3.json')
};
const sourceDigestsBefore = {
  registry: digest(registry),
  masterReadyPolicy: digest(masterReadyPolicy),
  lessonTypeRegistry: digest(lessonTypeRegistry),
  subjectFactory: digest(subjectFactory),
  russianLessons: digest(russianLessons),
  russianSources: digest(russianSources),
  mathSources: digest(mathSources),
  foundationSources: digest(foundationSources),
  runtime: Object.fromEntries(RUNTIME_PATHS.map((file) => [file, digest(read(file))]))
};

const sandbox = { console, TextEncoder };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
for (const file of [RUSSIAN_ADAPTER_PATH, MATH_ADAPTER_PATH, FOUNDATION_BRIDGE_PATH, ENGINE_PATH]) {
  vm.runInContext(read(file), sandbox, { filename: file });
}
const russianAdapter = sandbox.BaumanRussianUniversalAdapter;
const mathAdapter = sandbox.BaumanMathUniversalAdapter;
const foundationBridge = sandbox.BaumanFoundationPreparatoryBridge;
const engine = sandbox.BaumanReferenceSubjectEvidenceReview;
const catalogSources = {
  registry,
  masterReadyPolicy,
  subjectFactory,
  russian: { adapter: russianAdapter, lessons: russianLessons, sources: russianSources },
  math: { adapter: mathAdapter, sources: mathSources },
  foundation: { bridge: foundationBridge, sources: foundationSources }
};
const catalog = engine.buildCatalog(catalogSources);
const lessons = allLessons(catalog);
const slots = allSlots(catalog);
const templates = allTemplates(catalog);

check('ENGINE-IDENTITY', 'B7 evidence-review engine has a stable identity',
  engine.registryId === 'bauman-reference-subject-evidence-review'
    && engine.registryVersion === '1.0.0'
    && engine.release === 'L7-B7-REFERENCE-EVIDENCE-REVIEW-V1',
  { registryId: engine.registryId, release: engine.release });
check('PROGRAM-IDENTITY', 'official and personalized program codes remain separated',
  catalog.programIdentity.department === 'ИУ-5'
    && catalog.programIdentity.officialPublishedDirectionCode === '09.04.01'
    && catalog.programIdentity.personalizedDisplayCode === '09.04.01/11',
  catalog.programIdentity);
check('GOVERNING-REFS', 'B7 remains governed by L6-B5, type registry, Factory and B2/B5/B6 adapters',
  registry.governingRefs.masterReadyPolicy === POLICY_PATH
    && registry.governingRefs.lessonTypeRegistry === TYPE_REGISTRY_PATH
    && registry.governingRefs.subjectFactory === FACTORY_PATH
    && registry.governingRefs.russianAdapter === RUSSIAN_ADAPTER_PATH
    && registry.governingRefs.mathAdapter === MATH_ADAPTER_PATH
    && registry.governingRefs.foundationBridge === FOUNDATION_BRIDGE_PATH,
  registry.governingRefs);
check('FIVE-STAGE-POLICY', 'B7 maps the exact L6-B5 five-stage order',
  JSON.stringify(engine.stageOrder) === JSON.stringify(masterReadyPolicy.stageOrder)
    && JSON.stringify(masterReadyPolicy.stageOrder) === JSON.stringify(['understand', 'solve', 'build-apply', 'explain', 'retain']),
  masterReadyPolicy.stageOrder);
check('READ-ONLY-BOUNDARY', 'B7 cannot mutate source, state, schedule, runtime or Master-ready',
  catalog.runtimeBoundary.mode === 'pure-read-only-hook-projection'
    && catalog.runtimeBoundary.sourceMutationAllowed === false
    && catalog.runtimeBoundary.learnerStateMutationAllowed === false
    && catalog.runtimeBoundary.scheduleWriteAllowed === false
    && catalog.runtimeBoundary.runtimeActivationAllowed === false
    && catalog.runtimeBoundary.automaticMasterReadyAllowed === false
    && catalog.runtimeBoundary.aiFinalVerificationAllowed === false
    && catalog.runtimeBoundary.pageEventEvidenceAllowed === false,
  catalog.runtimeBoundary);
check('SUBJECT-ORDER', 'catalog order is Russian, Math, Foundation',
  JSON.stringify(catalog.subjectOrder) === JSON.stringify(['russian', 'math', 'foundation']),
  catalog.subjectOrder);
check('SUBJECT-COUNTS', 'B7 covers 26 Russian, 365 Math and 15 Foundation lessons',
  catalog.subjects.russian.lessonCount === 26
    && catalog.subjects.math.lessonCount === 365
    && catalog.subjects.foundation.lessonCount === 15,
  Object.fromEntries(catalog.subjectOrder.map((id) => [id, catalog.subjects[id].lessonCount])));
check('CATALOG-TOTAL', 'all 406 current reference-subject lessons receive hooks',
  catalog.totals.subjectCount === 3 && catalog.totals.lessonCount === 406 && lessons.length === 406,
  catalog.totals);
check('SUBJECT-LESSON-UNIQUENESS', 'lesson IDs are unique inside each subject catalog',
  catalog.subjectOrder.every((subjectId) => {
    const ids = catalog.subjects[subjectId].lessons.map((lesson) => lesson.lessonId);
    return ids.length === new Set(ids).size;
  }), catalog.subjectOrder);
check('EVIDENCE-SLOT-COVERAGE', 'every lesson has five missing stage slots',
  catalog.totals.evidenceSlotCount === 2030
    && slots.length === 2030
    && lessons.every((lesson) => lesson.evidenceSlots.length === 5),
  catalog.totals.evidenceSlotCount);
check('MISSING-EVIDENCE-TRUTH', 'B7 imports no evidence, score, artifact, verifier or learner state',
  slots.every((slot) => slot.status === 'missing'
    && slot.artifactRefs.length === 0
    && slot.eventRefs.length === 0
    && slot.verificationStatus === 'not-submitted'
    && slot.masteryEffect === 'none-until-policy-verification')
    && lessons.every((lesson) => lesson.learnerStateImported === false && lesson.masterReadyClaimed === false),
  { slots: slots.length, imported: 0 });
check('EVIDENCE-KIND-POLICY-PARITY', 'every preferred and accepted evidence kind comes from its L6-B5 type profile',
  lessons.every((lesson) => lesson.evidenceSlots.every((slot) => {
    const stageKinds = masterReadyPolicy.profiles[lesson.typeId].stageEvidence[slot.stage];
    return stageKinds.includes(slot.preferredEvidenceKind)
      && JSON.stringify(slot.acceptedEvidenceKinds) === JSON.stringify(stageKinds)
      && slot.stageMinimum === masterReadyPolicy.profiles[lesson.typeId].stageMinimums[slot.stage];
  })), Object.keys(registry.evidenceProfiles));
const russianSlots = catalog.subjects.russian.lessons.flatMap((lesson) => lesson.evidenceSlots);
check('RUSSIAN-SOURCE-TARGET-TRUTH', 'Russian keeps 104 B2 targets and adds 26 missing build-apply targets without evidence',
  russianSlots.filter((slot) => slot.sourceTarget.status === 'adapter-target-present-missing').length === 104
    && russianSlots.filter((slot) => slot.sourceTarget.status === 'hook-target-added-missing').length === 26
    && russianSlots.filter((slot) => slot.stage === 'build-apply')
      .every((slot) => slot.sourceTarget.status === 'hook-target-added-missing' && slot.preferredEvidenceKind === 'dialogue-turn'),
  {
    adapterTargets: russianSlots.filter((slot) => slot.sourceTarget.status === 'adapter-target-present-missing').length,
    addedMissingTargets: russianSlots.filter((slot) => slot.sourceTarget.status === 'hook-target-added-missing').length
  });
const mathSlots = catalog.subjects.math.lessons.flatMap((lesson) => lesson.evidenceSlots);
check('MATH-SOURCE-TARGET-TRUTH', 'all 1,825 Math B5 stage targets remain present but missing',
  mathSlots.length === 1825
    && mathSlots.every((slot) => slot.sourceTarget.status === 'adapter-target-present-missing'
      && slot.sourceTarget.sourceTargetStatus === 'missing'),
  mathSlots.length);
const foundationSlots = catalog.subjects.foundation.lessons.flatMap((lesson) => lesson.evidenceSlots);
check('FOUNDATION-SOURCE-TARGET-TRUTH', 'all 75 Foundation slots remain unqualified hook targets',
  foundationSlots.length === 75
    && foundationSlots.every((slot) => slot.sourceTarget.status === 'bridge-target-unqualified'
      && slot.status === 'missing'),
  foundationSlots.length);
check('FOUNDATION-TYPE-DISTRIBUTION', 'Foundation hooks preserve six language, six mathematics and three programming lessons',
  catalog.subjects.foundation.lessons.filter((lesson) => lesson.typeId === 'language').length === 6
    && catalog.subjects.foundation.lessons.filter((lesson) => lesson.typeId === 'mathematics').length === 6
    && catalog.subjects.foundation.lessons.filter((lesson) => lesson.typeId === 'programming').length === 3,
  catalog.subjects.foundation.lessons.reduce((counts, lesson) => {
    counts[lesson.typeId] = (counts[lesson.typeId] || 0) + 1;
    return counts;
  }, {}));
check('REVIEW-TEMPLATE-COVERAGE', 'type-specific policy windows create 1,250 unscheduled review templates',
  catalog.totals.reviewHookTemplateCount === 1250
    && templates.length === 1250
    && templates.every((hook) => hook.state === 'template' && hook.dueAt === null && hook.attemptRefs.length === 0),
  catalog.totals.reviewHookTemplateCount);
check('REQUIRED-REVIEW-COVERAGE', '812 policy-required delayed review templates are identified',
  catalog.totals.requiredReviewHookTemplateCount === 812
    && templates.filter((hook) => hook.required).length === 812,
  catalog.totals.requiredReviewHookTemplateCount);
check('SUBJECT-REVIEW-TEMPLATE-COUNTS', 'Russian, Math and Foundation retain their type-specific window counts',
  catalog.subjects.russian.lessons.flatMap((lesson) => lesson.reviewHookTemplates).length === 104
    && catalog.subjects.math.lessons.flatMap((lesson) => lesson.reviewHookTemplates).length === 1095
    && catalog.subjects.foundation.lessons.flatMap((lesson) => lesson.reviewHookTemplates).length === 51,
  { russian: 104, math: 1095, foundation: 51 });
check('SUBJECT-REQUIRED-TEMPLATE-COUNTS', 'required retention windows total 52, 730 and 30 by subject',
  catalog.subjects.russian.lessons.flatMap((lesson) => lesson.reviewHookTemplates).filter((hook) => hook.required).length === 52
    && catalog.subjects.math.lessons.flatMap((lesson) => lesson.reviewHookTemplates).filter((hook) => hook.required).length === 730
    && catalog.subjects.foundation.lessons.flatMap((lesson) => lesson.reviewHookTemplates).filter((hook) => hook.required).length === 30,
  { russian: 52, math: 730, foundation: 30 });
check('RETENTION-POLICY-PARITY', 'every hook template copies its type window, requiredness and minimum exactly',
  lessons.every((lesson) => {
    const retention = masterReadyPolicy.profiles[lesson.typeId].retentionPolicy;
    return JSON.stringify(lesson.reviewHookTemplates.map((hook) => hook.windowDays)) === JSON.stringify(retention.windowsDays)
      && lesson.reviewHookTemplates.every((hook) => hook.required === retention.requiredWindowsDays.includes(hook.windowDays)
        && hook.minimumNormalized === retention.minimumNormalized
        && hook.variedPromptRequired === true);
  }), ['language', 'mathematics', 'programming']);
check('STABLE-HOOK-IDENTITY', 'every evidence and review hook uses exact stable subject/lesson identity',
  lessons.every((lesson) => lesson.evidenceSlots.every((slot) => slot.slotId === `evidence:${lesson.subjectId}:${lesson.lessonId}:${slot.stage}`)
    && lesson.reviewHookTemplates.every((hook) => hook.hookId === `review:${lesson.subjectId}:${lesson.lessonId}:d${hook.windowDays}`)),
  lessons[0].reviewHookTemplates.map((hook) => hook.hookId));
check('ROUTE-OFFLINE-PARITY', 'subject routes and offline policies remain the registered existing values',
  catalog.subjectOrder.every((subjectId) => catalog.subjects[subjectId].runtimeRoute === subjectFactory.subjects[subjectId].routes.main
    && catalog.subjects[subjectId].offlinePolicyRef === subjectFactory.subjects[subjectId].offlinePolicyRef),
  Object.fromEntries(catalog.subjectOrder.map((id) => [id, {
    route: catalog.subjects[id].runtimeRoute,
    offline: catalog.subjects[id].offlinePolicyRef
  }])));
check('CATALOG-CLAIM-BOUNDARY', 'catalog makes no state, completion, runtime or Master-ready claim',
  Object.values(catalog.claims).every((value) => value === false)
    && engine.assertCatalogBoundary(catalog) === true,
  catalog.claims);
check('OPEN-FINDINGS', 'Russian, Foundation and no-state limitations remain explicit',
  JSON.stringify(catalog.openFindings.map((finding) => finding.id)) === JSON.stringify([
    'RUSSIAN_BUILD_APPLY_TARGET_ABSENT_IN_B2',
    'FOUNDATION_SOURCE_EVIDENCE_UNQUALIFIED',
    'NO_LEARNER_EVIDENCE_IMPORTED'
  ]), catalog.openFindings);
check('EXACT-RESOLUTION', 'exact subject and lesson IDs resolve one hook record',
  engine.resolveLesson(catalog, 'russian', russianLessons[0].id).subjectId === 'russian'
    && engine.resolveLesson(catalog, 'math', catalog.subjects.math.lessons[0].lessonId).subjectId === 'math'
    && engine.resolveLesson(catalog, 'foundation', 'f_s03_l1').typeId === 'programming',
  [russianLessons[0].id, catalog.subjects.math.lessons[0].lessonId, 'f_s03_l1']);
check('NO-FUZZY-RESOLUTION', 'unknown, look-alike and cross-subject IDs fail closed',
  rejected(() => engine.resolveLesson(catalog, 'russian', russianLessons[0].id + '-copy'), 'NO_EXACT_EVIDENCE_HOOK_MATCH').rejected
    && rejected(() => engine.resolveLesson(catalog, 'Russian', russianLessons[0].id), 'NO_EXACT_EVIDENCE_HOOK_MATCH').rejected
    && rejected(() => engine.resolveLesson(catalog, 'foundation', catalog.subjects.math.lessons[0].lessonId), 'NO_EXACT_EVIDENCE_HOOK_MATCH').rejected,
  'NO_EXACT_EVIDENCE_HOOK_MATCH');

const russianLesson = catalog.subjects.russian.lessons[0];
const mathLesson = catalog.subjects.math.lessons[0];
const programmingLesson = engine.resolveLesson(catalog, 'foundation', 'f_s03_l1');
const anchorAt = '2026-01-01T00:00:00.000Z';

const waiting = engine.materializeSchedule(russianLesson, masterReadyPolicy, {}, registry);
check('SCHEDULE-WAITS-FOR-EVIDENCE', 'no stage evidence means no dated review schedule',
  waiting.status === 'WAITING_FOR_VERIFIED_EVIDENCE'
    && waiting.hooks.every((hook) => hook.state === 'template' && hook.dueAt === null)
    && waiting.nextReviewAt === null,
  waiting.status);
const partial = engine.materializeSchedule(russianLesson, masterReadyPolicy, {
  stageEvaluations: verifiedStages(russianLesson, masterReadyPolicy).slice(0, 3)
}, registry);
check('SCHEDULE-WAITS-FOR-ALL-PRE-STAGES', 'partial verified stages cannot create an anchor or due date',
  partial.status === 'WAITING_FOR_VERIFIED_EVIDENCE'
    && partial.hooks.every((hook) => hook.dueAt === null),
  partial.stageEvaluations);
const belowMinimumStages = verifiedStages(russianLesson, masterReadyPolicy, {
  solve: { normalizedScore: masterReadyPolicy.profiles.language.stageMinimums.solve - 0.01 }
});
const needsRepair = engine.materializeSchedule(russianLesson, masterReadyPolicy, {
  stageEvaluations: belowMinimumStages
}, registry);
check('STAGE-MINIMUM-REPAIR', 'a verified stage below its type minimum routes to repair',
  needsRepair.status === 'NEEDS_REPAIR'
    && needsRepair.stageEvaluations.find((item) => item.stage === 'solve').state === 'needs-repair'
    && needsRepair.hooks.every((hook) => hook.dueAt === null),
  needsRepair.stageEvaluations.find((item) => item.stage === 'solve'));
const readyForAnchor = engine.materializeSchedule(russianLesson, masterReadyPolicy, {
  stageEvaluations: verifiedStages(russianLesson, masterReadyPolicy)
}, registry);
check('READY-FOR-RETENTION-ANCHOR', 'four passing pre-retention stages create only an anchor candidate',
  readyForAnchor.status === 'READY_FOR_RETENTION_ANCHOR'
    && readyForAnchor.masterReadyClaimed === false
    && readyForAnchor.hooks.every((hook) => hook.state === 'template'),
  readyForAnchor.status);
check('EXPLICIT-AS-OF-REQUIRED', 'dated scheduling fails closed without explicit asOf',
  rejected(() => engine.materializeSchedule(russianLesson, masterReadyPolicy, {
    stageEvaluations: verifiedStages(russianLesson, masterReadyPolicy),
    retentionAnchorAt: anchorAt
  }, registry), 'EVIDENCE_REVIEW_AS_OF_REQUIRED').rejected,
  'EVIDENCE_REVIEW_AS_OF_REQUIRED');
const russianScheduled = engine.materializeSchedule(russianLesson, masterReadyPolicy, {
  stageEvaluations: verifiedStages(russianLesson, masterReadyPolicy),
  retentionAnchorAt: anchorAt,
  asOf: '2026-01-02T00:00:00.000Z',
  retentionAttempts: []
}, registry);
check('LANGUAGE-SCHEDULE-MATERIALIZATION', 'language schedule materializes exact UTC days 1, 3, 7 and 14',
  russianScheduled.hooks.length === 4
    && JSON.stringify(russianScheduled.hooks.map((hook) => hook.dueAt)) === JSON.stringify([
      '2026-01-02T00:00:00.000Z',
      '2026-01-04T00:00:00.000Z',
      '2026-01-08T00:00:00.000Z',
      '2026-01-15T00:00:00.000Z'
    ])
    && russianScheduled.hooks[0].state === 'due'
    && russianScheduled.hooks.slice(1).every((hook) => hook.state === 'scheduled'),
  russianScheduled.hooks.map((hook) => ({ day: hook.windowDays, dueAt: hook.dueAt, state: hook.state })));
const mathScheduled = engine.materializeSchedule(mathLesson, masterReadyPolicy, {
  stageEvaluations: verifiedStages(mathLesson, masterReadyPolicy),
  retentionAnchorAt: anchorAt,
  asOf: '2026-01-02T00:00:00.000Z',
  retentionAttempts: []
}, registry);
check('MATH-SCHEDULE-MATERIALIZATION', 'Math schedule materializes exact days 1, 7 and 21',
  JSON.stringify(mathScheduled.hooks.map((hook) => hook.windowDays)) === JSON.stringify([1, 7, 21])
    && mathScheduled.hooks[0].state === 'due'
    && mathScheduled.hooks[2].dueAt === '2026-01-22T00:00:00.000Z',
  mathScheduled.hooks.map((hook) => ({ day: hook.windowDays, dueAt: hook.dueAt })));
const programmingScheduled = engine.materializeSchedule(programmingLesson, masterReadyPolicy, {
  stageEvaluations: verifiedStages(programmingLesson, masterReadyPolicy),
  retentionAnchorAt: anchorAt,
  asOf: '2026-01-02T00:00:00.000Z',
  retentionAttempts: []
}, registry);
check('FOUNDATION-PROGRAMMING-SCHEDULE', 'Foundation computing uses the programming retention profile',
  programmingLesson.typeId === 'programming'
    && JSON.stringify(programmingScheduled.hooks.map((hook) => hook.windowDays)) === JSON.stringify([1, 7, 21])
    && programmingScheduled.hooks.every((hook) => hook.minimumNormalized === 0.8),
  programmingScheduled.hooks.map((hook) => ({ day: hook.windowDays, minimum: hook.minimumNormalized })));

const earlyAttempts = verifiedAttempts(russianLesson, anchorAt, masterReadyPolicy, {
  7: { createdAt: '2026-01-07T23:59:59.000Z' }
});
const earlyResult = engine.materializeSchedule(russianLesson, masterReadyPolicy, {
  stageEvaluations: verifiedStages(russianLesson, masterReadyPolicy),
  retentionAnchorAt: anchorAt,
  asOf: '2026-01-15T00:00:00.000Z',
  retentionAttempts: earlyAttempts,
  gateEvaluation: fullGateEvaluation()
}, registry);
check('EARLY-ATTEMPT-DOES-NOT-PASS', 'an attempt before its due instant cannot satisfy that window',
  earlyResult.hooks.find((hook) => hook.windowDays === 7).state === 'due'
    && earlyResult.hooks.find((hook) => hook.windowDays === 7).failureReason === 'attempt-before-due-does-not-satisfy-window'
    && earlyResult.requiredRetentionComplete === false
    && earlyResult.eligibleForMasterReadyVerification === false,
  earlyResult.hooks.find((hook) => hook.windowDays === 7));
const protectedReuse = verifiedAttempts(russianLesson, anchorAt, masterReadyPolicy, {
  14: { protectedAnswerReused: true }
});
const protectedResult = engine.materializeSchedule(russianLesson, masterReadyPolicy, {
  stageEvaluations: verifiedStages(russianLesson, masterReadyPolicy),
  retentionAnchorAt: anchorAt,
  asOf: '2026-01-15T00:00:00.000Z',
  retentionAttempts: protectedReuse
}, registry);
check('PROTECTED-ANSWER-REUSE-REPAIR', 'protected-answer reuse cannot pass delayed retention',
  protectedResult.hooks.find((hook) => hook.windowDays === 14).state === 'needs-repair'
    && protectedResult.status === 'NEEDS_REPAIR',
  protectedResult.hooks.find((hook) => hook.windowDays === 14));
const unvaried = verifiedAttempts(russianLesson, anchorAt, masterReadyPolicy, {
  14: { variedPrompt: false }
});
const unvariedResult = engine.materializeSchedule(russianLesson, masterReadyPolicy, {
  stageEvaluations: verifiedStages(russianLesson, masterReadyPolicy),
  retentionAnchorAt: anchorAt,
  asOf: '2026-01-15T00:00:00.000Z',
  retentionAttempts: unvaried
}, registry);
check('VARIED-PROMPT-REQUIRED', 'an unvaried prompt cannot pass delayed retention',
  unvariedResult.hooks.find((hook) => hook.windowDays === 14).state === 'needs-repair'
    && unvariedResult.requiredRetentionComplete === false,
  unvariedResult.hooks.find((hook) => hook.windowDays === 14));
const lowRetention = verifiedAttempts(russianLesson, anchorAt, masterReadyPolicy, {
  14: { normalizedScore: 0.7 }
});
const lowRetentionResult = engine.materializeSchedule(russianLesson, masterReadyPolicy, {
  stageEvaluations: verifiedStages(russianLesson, masterReadyPolicy),
  retentionAnchorAt: anchorAt,
  asOf: '2026-01-15T00:00:00.000Z',
  retentionAttempts: lowRetention
}, registry);
check('RETENTION-MINIMUM-REPAIR', 'a due retention attempt below the type minimum routes to repair',
  lowRetentionResult.hooks.find((hook) => hook.windowDays === 14).state === 'needs-repair'
    && lowRetentionResult.status === 'NEEDS_REPAIR',
  lowRetentionResult.hooks.find((hook) => hook.windowDays === 14));
const allRussianAttempts = verifiedAttempts(russianLesson, anchorAt, masterReadyPolicy);
const retentionComplete = engine.materializeSchedule(russianLesson, masterReadyPolicy, {
  stageEvaluations: verifiedStages(russianLesson, masterReadyPolicy),
  retentionAnchorAt: anchorAt,
  asOf: '2026-01-15T00:00:00.000Z',
  retentionAttempts: allRussianAttempts
}, registry);
check('RETENTION-COMPLETE-GATE-PENDING', 'passing every review window still waits for the full Master-ready gate',
  retentionComplete.requiredRetentionComplete === true
    && retentionComplete.status === 'RETENTION_COMPLETE_GATE_PENDING'
    && retentionComplete.eligibleForMasterReadyVerification === false
    && retentionComplete.masterReadyClaimed === false,
  retentionComplete.status);
const verificationCandidate = engine.materializeSchedule(russianLesson, masterReadyPolicy, {
  stageEvaluations: verifiedStages(russianLesson, masterReadyPolicy),
  retentionAnchorAt: anchorAt,
  asOf: '2026-01-15T00:00:00.000Z',
  retentionAttempts: allRussianAttempts,
  gateEvaluation: fullGateEvaluation()
}, registry);
check('MASTER-READY-CANDIDATE-NOT-CLAIM', 'full evidence yields only a verification candidate and performs no state write',
  verificationCandidate.status === 'MASTER_READY_VERIFICATION_CANDIDATE'
    && verificationCandidate.eligibleForMasterReadyVerification === true
    && verificationCandidate.masterReadyClaimed === false
    && verificationCandidate.learnerStateWritePerformed === false
    && verificationCandidate.scheduleWritePerformed === false
    && engine.assertScheduleBoundary(verificationCandidate, registry) === true,
  {
    status: verificationCandidate.status,
    eligible: verificationCandidate.eligibleForMasterReadyVerification,
    claimed: verificationCandidate.masterReadyClaimed
  });
check('AI-CANNOT-VERIFY-STAGE', 'AI advisory output cannot verify a pre-retention stage',
  rejected(() => engine.materializeSchedule(russianLesson, masterReadyPolicy, {
    stageEvaluations: verifiedStages(russianLesson, masterReadyPolicy, {
      explain: { verification: { actorType: 'ai-advisory', method: 'oral-feedback' } }
    })
  }, registry), 'EVIDENCE_REVIEW_UNAUTHORIZED_VERIFIER').rejected,
  'EVIDENCE_REVIEW_UNAUTHORIZED_VERIFIER');
const aiGate = fullGateEvaluation();
aiGate.verification = { actorType: 'ai-advisory', method: 'rubric-suggestion' };
check('AI-CANNOT-VERIFY-FINAL-GATE', 'AI advisory output cannot verify the final gate',
  rejected(() => engine.materializeSchedule(russianLesson, masterReadyPolicy, {
    stageEvaluations: verifiedStages(russianLesson, masterReadyPolicy),
    retentionAnchorAt: anchorAt,
    asOf: '2026-01-15T00:00:00.000Z',
    retentionAttempts: allRussianAttempts,
    gateEvaluation: aiGate
  }, registry), 'EVIDENCE_REVIEW_UNAUTHORIZED_VERIFIER').rejected,
  'EVIDENCE_REVIEW_UNAUTHORIZED_VERIFIER');
const duplicateAttempts = allRussianAttempts.concat(clone(allRussianAttempts[0]));
check('APPEND-ONLY-ATTEMPT-IDENTITY', 'duplicate attempt IDs fail closed instead of overwriting evidence',
  rejected(() => engine.materializeSchedule(russianLesson, masterReadyPolicy, {
    stageEvaluations: verifiedStages(russianLesson, masterReadyPolicy),
    retentionAnchorAt: anchorAt,
    asOf: '2026-01-15T00:00:00.000Z',
    retentionAttempts: duplicateAttempts
  }, registry), 'EVIDENCE_REVIEW_ATTEMPT_DUPLICATE').rejected,
  'EVIDENCE_REVIEW_ATTEMPT_DUPLICATE');
const wrongScopeAttempts = clone(allRussianAttempts);
wrongScopeAttempts[0].lessonId = mathLesson.lessonId;
check('ATTEMPT-SCOPE-BOUNDARY', 'a review attempt cannot cross subject or lesson identity',
  rejected(() => engine.materializeSchedule(russianLesson, masterReadyPolicy, {
    stageEvaluations: verifiedStages(russianLesson, masterReadyPolicy),
    retentionAnchorAt: anchorAt,
    asOf: '2026-01-15T00:00:00.000Z',
    retentionAttempts: wrongScopeAttempts
  }, registry), 'EVIDENCE_REVIEW_ATTEMPT_SCOPE_INVALID').rejected,
  'EVIDENCE_REVIEW_ATTEMPT_SCOPE_INVALID');

const mutatedCatalogClaim = clone(catalog);
mutatedCatalogClaim.claims.masterReadyClaimed = true;
mutation('CATALOG-MASTER-READY-CLAIM', 'catalog-level Master-ready promotion is rejected',
  rejected(() => engine.assertCatalogBoundary(mutatedCatalogClaim), 'EVIDENCE_REVIEW_CATALOG_BOUNDARY_ESCALATION').rejected,
  { code: 'EVIDENCE_REVIEW_CATALOG_BOUNDARY_ESCALATION' });
const mutatedSlot = clone(catalog);
mutatedSlot.subjects.russian.lessons[0].evidenceSlots[0].status = 'verified';
mutation('SYNTHESIZE-EVIDENCE-SLOT', 'a generated verified slot without evidence is rejected',
  rejected(() => engine.assertCatalogBoundary(mutatedSlot), 'EVIDENCE_REVIEW_CATALOG_BOUNDARY_ESCALATION').rejected,
  { code: 'EVIDENCE_REVIEW_CATALOG_BOUNDARY_ESCALATION' });
const mutatedTemplate = clone(catalog);
mutatedTemplate.subjects.math.lessons[0].reviewHookTemplates[0].state = 'scheduled';
mutatedTemplate.subjects.math.lessons[0].reviewHookTemplates[0].dueAt = '2026-01-02T00:00:00.000Z';
mutation('PRE-SCHEDULE-CATALOG-HOOK', 'catalog generation cannot invent a due date',
  rejected(() => engine.assertCatalogBoundary(mutatedTemplate), 'EVIDENCE_REVIEW_CATALOG_BOUNDARY_ESCALATION').rejected,
  { code: 'EVIDENCE_REVIEW_CATALOG_BOUNDARY_ESCALATION' });
const escalatedRegistry = clone(registry);
escalatedRegistry.runtimeBoundary.automaticMasterReadyAllowed = true;
mutation('ENABLE-AUTOMATIC-MASTER-READY', 'registry cannot enable automatic Master-ready',
  rejected(() => engine.buildCatalog({ ...catalogSources, registry: escalatedRegistry }), 'EVIDENCE_REVIEW_BOUNDARY_ESCALATION').rejected,
  { code: 'EVIDENCE_REVIEW_BOUNDARY_ESCALATION' });
const invalidKindRegistry = clone(registry);
invalidKindRegistry.evidenceProfiles.language['build-apply'].preferredEvidenceKind = 'page-view';
mutation('USE-PAGE-EVENT-AS-EVIDENCE', 'page events cannot become policy evidence kinds',
  rejected(() => engine.buildCatalog({ ...catalogSources, registry: invalidKindRegistry }), 'EVIDENCE_REVIEW_KIND_INVALID').rejected,
  { code: 'EVIDENCE_REVIEW_KIND_INVALID' });
const shortRussian = russianLessons.slice(0, -1);
mutation('DROP-RUSSIAN-LESSON', 'catalog count drift fails closed',
  rejected(() => engine.buildCatalog({
    ...catalogSources,
    russian: { ...catalogSources.russian, lessons: shortRussian }
  }), 'EVIDENCE_REVIEW_CATALOG_COUNT_MISMATCH').rejected,
  { code: 'EVIDENCE_REVIEW_CATALOG_COUNT_MISMATCH' });
const duplicateRussian = russianLessons.concat(clone(russianLessons[0]));
mutation('DUPLICATE-RUSSIAN-LESSON', 'duplicate hook identity fails closed',
  rejected(() => engine.buildCatalog({
    ...catalogSources,
    registry: { ...clone(registry), subjects: { ...clone(registry.subjects), russian: { ...clone(registry.subjects.russian), expectedLessonCount: 27 } } },
    russian: { ...catalogSources.russian, lessons: duplicateRussian }
  }), 'EVIDENCE_REVIEW_LESSON_DUPLICATE').rejected,
  { code: 'EVIDENCE_REVIEW_LESSON_DUPLICATE' });
const protectedMutationObserved = protectedResult.status === 'NEEDS_REPAIR'
  && protectedResult.eligibleForMasterReadyVerification === false;
mutation('REUSE-PROTECTED-ANSWER', 'protected-answer reuse cannot pass retention',
  protectedMutationObserved, { status: protectedResult.status });
const earlyMutationObserved = earlyResult.requiredRetentionComplete === false
  && earlyResult.eligibleForMasterReadyVerification === false;
mutation('SATISFY-WINDOW-EARLY', 'an early attempt cannot satisfy a delayed window',
  earlyMutationObserved, { status: earlyResult.status });
const mutatedSchedule = clone(verificationCandidate);
mutatedSchedule.masterReadyClaimed = true;
mutation('WRITE-MASTER-READY-STATE', 'schedule output cannot write or claim Master-ready',
  rejected(() => engine.assertScheduleBoundary(mutatedSchedule, registry), 'EVIDENCE_REVIEW_SCHEDULE_BOUNDARY_ESCALATION').rejected,
  { code: 'EVIDENCE_REVIEW_SCHEDULE_BOUNDARY_ESCALATION' });

const sourceDigestsAfter = {
  registry: digest(registry),
  masterReadyPolicy: digest(masterReadyPolicy),
  lessonTypeRegistry: digest(lessonTypeRegistry),
  subjectFactory: digest(subjectFactory),
  russianLessons: digest(russianLessons),
  russianSources: digest(russianSources),
  mathSources: digest(mathSources),
  foundationSources: digest(foundationSources),
  runtime: Object.fromEntries(RUNTIME_PATHS.map((file) => [file, digest(read(file))]))
};
check('SOURCE-IMMUTABLE', 'B7 leaves adapters, policies and all subject sources unchanged',
  JSON.stringify(sourceDigestsBefore) === JSON.stringify(sourceDigestsAfter),
  sourceDigestsAfter);
check('RUNTIME-IMMUTABLE', 'B7 changes no Russian, Math, Foundation or storage runtime file',
  JSON.stringify(sourceDigestsBefore.runtime) === JSON.stringify(sourceDigestsAfter.runtime),
  sourceDigestsAfter.runtime);
const secondCatalog = engine.buildCatalog(catalogSources);
check('DETERMINISTIC-CATALOG', 'repeated full hook catalog has a stable SHA-256 digest',
  digest(catalog) === digest(secondCatalog), digest(catalog));
const secondSchedule = engine.materializeSchedule(russianLesson, masterReadyPolicy, {
  stageEvaluations: verifiedStages(russianLesson, masterReadyPolicy),
  retentionAnchorAt: anchorAt,
  asOf: '2026-01-15T00:00:00.000Z',
  retentionAttempts: allRussianAttempts,
  gateEvaluation: fullGateEvaluation()
}, registry);
check('DETERMINISTIC-SCHEDULE', 'repeated explicit scheduling has a stable SHA-256 digest',
  digest(verificationCandidate) === digest(secondSchedule), digest(verificationCandidate));
check('OFFLINE-NON-AI', 'hook projection and scheduling remain offline and non-AI',
  catalog.offline.hookProjectionWithoutNetwork === true
    && catalog.offline.scheduleMaterializationWithoutNetwork === true
    && catalog.offline.aiRequired === false
    && catalog.offline.serviceWorkerChange === false
    && catalog.offline.subjectPackChange === false,
  catalog.offline);

const failedChecks = checks.filter((item) => !item.ok);
const failedMutations = mutationTests.filter((item) => !item.expectedFailureObserved);
const status = failedChecks.length === 0 && failedMutations.length === 0 ? 'PASS' : 'FAIL';
const report = {
  gate: 'L7-B7',
  release: engine.release,
  status,
  subjectCounts: Object.fromEntries(catalog.subjectOrder.map((id) => [id, catalog.subjects[id].lessonCount])),
  lessonCount: catalog.totals.lessonCount,
  evidenceSlotCount: catalog.totals.evidenceSlotCount,
  reviewHookTemplateCount: catalog.totals.reviewHookTemplateCount,
  requiredReviewHookTemplateCount: catalog.totals.requiredReviewHookTemplateCount,
  sourceTargetCounts: {
    russianAdapterTargets: russianSlots.filter((slot) => slot.sourceTarget.status === 'adapter-target-present-missing').length,
    russianAddedMissingTargets: russianSlots.filter((slot) => slot.sourceTarget.status === 'hook-target-added-missing').length,
    mathAdapterTargets: mathSlots.filter((slot) => slot.sourceTarget.status === 'adapter-target-present-missing').length,
    foundationUnqualifiedTargets: foundationSlots.filter((slot) => slot.sourceTarget.status === 'bridge-target-unqualified').length
  },
  openFindings: catalog.openFindings,
  sourceDigests: sourceDigestsAfter,
  catalogDigest: digest(catalog),
  scheduleFixtureDigest: digest(verificationCandidate),
  checks,
  mutationTests,
  passMeaning: 'Evidence and spaced-review hooks are structurally complete and deterministic; no learner evidence was imported and no Master-ready or state-write claim was made.'
};
fs.writeFileSync(path.join(ROOT, REPORT_PATH), JSON.stringify(report, null, 2) + '\n');

for (const item of checks) console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.id} ${item.title}`);
for (const item of mutationTests) {
  console.log(`${item.expectedFailureObserved ? 'PASS' : 'FAIL'} MUTATION-${item.id} ${item.title}`);
}
console.log(`L7-B7 ${status}: ${checks.length - failedChecks.length}/${checks.length} checks; ${mutationTests.length - failedMutations.length}/${mutationTests.length} expected mutation failures observed`);
if (status !== 'PASS') process.exit(1);
