'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.cwd();
const BRIDGE_PATH = 'assets/js/platform/universal-lesson/foundation-preparatory-bridge-v1.js';
const CONTRACT_PATH = 'assets/data/lesson/foundation-preparatory-bridge-v1.json';
const CURRICULUM_PATH = 'subjects/foundation/data/curriculum.json';
const LESSONS_PATH = 'subjects/foundation/data/lessons.json';
const EXERCISES_PATH = 'subjects/foundation/data/exercises.json';
const TESTS_PATH = 'subjects/foundation/data/tests.json';
const SIMULATIONS_PATH = 'subjects/foundation/data/simulations.json';
const FACTORY_PATH = 'assets/data/lesson/subject-factory-registry-v1.json';
const REFERENCE_PATH = 'assets/data/lesson/reference-lesson-activation-v1.json';
const ROADMAP_PATH = 'assets/data/roadmap/iu5-090401-11-v3.json';
const DOC_PATH = 'docs/migration/L7_B6_FOUNDATION_PREPARATORY_COMPLETION.md';
const REPORT_PATH = 'docs/migration/L7_B6_FOUNDATION_PREPARATORY_COMPLETION.generated.json';
const RUNTIME_PATHS = [
  'subjects/foundation/index.html',
  'subjects/foundation/assets/foundation.js',
  'assets/js/platform/universal-lesson/reference-lesson-bootstrap-v1.js'
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

function check(id, title, ok, evidence) {
  checks.push({ id, title, ok: Boolean(ok), evidence: evidence === undefined ? null : evidence });
}

function mutation(id, title, result) {
  mutationTests.push({
    id,
    title,
    expectedFailureObserved: Boolean(result && result.rejected),
    evidence: result ? { code: result.code || null } : null
  });
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

function flattenLessons(pack) {
  return list(pack && pack.tracks)
    .flatMap((track) => list(track.modules))
    .flatMap((module) => list(module.lessons));
}

function allHandoffs(pack) {
  return list(pack && pack.tracks).flatMap((track) => list(track.handoffs));
}

function allCheckpoints(pack) {
  return list(pack && pack.tracks).flatMap((track) => list(track.capabilityCheckpoints));
}

const requiredFiles = [
  BRIDGE_PATH,
  CONTRACT_PATH,
  CURRICULUM_PATH,
  LESSONS_PATH,
  EXERCISES_PATH,
  TESTS_PATH,
  SIMULATIONS_PATH,
  FACTORY_PATH,
  REFERENCE_PATH,
  ROADMAP_PATH,
  DOC_PATH,
  ...RUNTIME_PATHS
];
for (const file of requiredFiles) {
  check('FILE-' + file, 'required L7-B6 input exists', fs.existsSync(path.join(ROOT, file)), file);
}
if (checks.some((item) => !item.ok)) {
  console.error('L7-B6 cannot start because required inputs are missing.');
  process.exit(2);
}

const contract = json(CONTRACT_PATH);
const curriculum = json(CURRICULUM_PATH);
const lessons = json(LESSONS_PATH);
const exercises = json(EXERCISES_PATH);
const tests = json(TESTS_PATH);
const simulations = json(SIMULATIONS_PATH);
const subjectFactory = json(FACTORY_PATH);
const referenceActivation = json(REFERENCE_PATH);
const roadmap = json(ROADMAP_PATH);
const sources = {
  contract,
  curriculum,
  lessons,
  exercises,
  tests,
  simulations,
  subjectFactory,
  referenceActivation,
  roadmap
};
const sourceDigestsBefore = {
  contract: digest(contract),
  curriculum: digest(curriculum),
  lessons: digest(lessons),
  exercises: digest(exercises),
  tests: digest(tests),
  simulations: digest(simulations),
  subjectFactory: digest(subjectFactory),
  referenceActivation: digest(referenceActivation),
  roadmap: digest(roadmap),
  runtime: Object.fromEntries(RUNTIME_PATHS.map((file) => [file, digest(read(file))]))
};

const sandbox = { console };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(read(BRIDGE_PATH), sandbox, { filename: BRIDGE_PATH });
const bridge = sandbox.BaumanFoundationPreparatoryBridge;
const pack = bridge.buildBridgePack(sources);
const projectedLessons = flattenLessons(pack);
const checkpoints = allCheckpoints(pack);
const handoffs = allHandoffs(pack);
const preparatoryModules = curriculum.modules.filter((module) => module.stage === 'preparatory');
const preparatoryLessons = lessons.filter((lesson) => lesson.stage === 'preparatory');
const outsideLessons = lessons.filter((lesson) => lesson.stage !== 'preparatory');
const trackIds = pack.tracks.map((track) => track.trackId);
const expectedTrackIds = ['classroom-russian', 'math-science-transition', 'study-method-bridge'];

check('BRIDGE-IDENTITY', 'bridge API has a stable L7-B6 identity',
  bridge.contractId === 'bauman-foundation-preparatory-bridge'
    && bridge.contractVersion === '1.0.0'
    && bridge.release === 'L7-B6-FOUNDATION-PREPARATORY-COMPLETION-V1',
  { contractId: bridge.contractId, release: bridge.release });
check('CONTRACT-SCOPE', 'completion is explicitly structural and preparatory-only',
  contract.scope.subjectId === 'foundation'
    && contract.scope.stageId === 'preparatory'
    && contract.scope.notClaimed.includes('master-ready')
    && contract.scope.notClaimed.includes('academic-content-approval'),
  contract.scope);
check('PROGRAM-IDENTITY', 'official and personalized program codes remain separated',
  pack.programIdentity.department === 'ИУ-5'
    && pack.programIdentity.officialPublishedDirectionCode === '09.04.01'
    && pack.programIdentity.personalizedDisplayCode === '09.04.01/11',
  pack.programIdentity);
check('RUNTIME-BOUNDARY', 'B6 is read-only exact-ID and cannot activate routes or specialists',
  pack.runtimeBoundary.projectionMode === 'read-only-exact-id'
    && pack.runtimeBoundary.sourceMutationAllowed === false
    && pack.runtimeBoundary.learnerStateMutationAllowed === false
    && pack.runtimeBoundary.routeActivationAllowed === false
    && pack.runtimeBoundary.automaticMasterReadyAllowed === false
    && pack.runtimeBoundary.specialistCutoverAllowed === false
    && pack.runtimeBoundary.fuzzyLessonMatchAllowed === false,
  pack.runtimeBoundary);
check('FACTORY-BOUNDARY', 'Foundation Factory remains a non-rendering read-only pilot',
  subjectFactory.subjects.foundation.compatibility.mode === 'light-read-only-projection'
    && subjectFactory.subjects.foundation.compatibility.directFactoryRender === false
    && subjectFactory.subjects.foundation.compatibility.sourceMutation === false
    && subjectFactory.subjects.foundation.compatibility.learnerStateMigration === false,
  subjectFactory.subjects.foundation.compatibility);
check('TRACK-COVERAGE', 'all three required preparatory bridge tracks are present once and ordered',
  JSON.stringify(trackIds) === JSON.stringify(expectedTrackIds)
    && new Set(trackIds).size === 3,
  trackIds);
check('MODULE-COVERAGE', 'all five current preparatory modules are assigned exactly once',
  pack.coverage.moduleCount === 5
    && JSON.stringify(pack.coverage.moduleIds) === JSON.stringify(preparatoryModules.map((module) => module.id))
    && new Set(pack.tracks.flatMap((track) => track.modules.map((module) => module.moduleId))).size === 5,
  pack.coverage.moduleIds);
check('LESSON-COVERAGE', 'all fifteen current preparatory lessons are referenced exactly once',
  pack.coverage.lessonCount === 15
    && projectedLessons.length === 15
    && new Set(projectedLessons.map((lesson) => lesson.lessonId)).size === 15
    && JSON.stringify(projectedLessons.map((lesson) => lesson.lessonId)) === JSON.stringify(preparatoryLessons.map((lesson) => lesson.id)),
  projectedLessons.map((lesson) => lesson.lessonId));
check('OUT-OF-SCOPE-EXCLUSION', 'the six non-preparatory Foundation lessons remain outside B6',
  outsideLessons.length === 6
    && projectedLessons.every((lesson) => lesson.stageId === 'preparatory')
    && outsideLessons.every((lesson) => !pack.coverage.lessonIds.includes(lesson.id)),
  outsideLessons.map((lesson) => lesson.id));
check('MODULE-LESSON-PARITY', 'each module preserves its exact three source lesson IDs and source order',
  pack.tracks.every((track) => track.modules.every((module) => {
    const sourceModule = preparatoryModules.find((candidate) => candidate.id === module.moduleId);
    return module.lessons.length === 3
      && JSON.stringify(module.lessons.map((lesson) => lesson.lessonId)) === JSON.stringify(sourceModule.lessons);
  })),
  pack.tracks.flatMap((track) => track.modules.map((module) => ({ moduleId: module.moduleId, lessons: module.lessons.length }))));
check('LESSON-SOURCE-LOCATORS', 'every bridge lesson retains an exact source record locator',
  projectedLessons.every((lesson) => lesson.source.path === LESSONS_PATH
    && Number.isInteger(lesson.source.sourceIndex)
    && lessons[lesson.source.sourceIndex].id === lesson.lessonId
    && lesson.source.recordId === lesson.lessonId),
  projectedLessons.map((lesson) => ({ lessonId: lesson.lessonId, sourceIndex: lesson.source.sourceIndex })));
check('ROLE-COVERAGE', 'theory, practice and handoff roles each cover all five modules',
  pack.coverage.roleCounts['concept-orientation'] === 5
    && pack.coverage.roleCounts['guided-practice'] === 5
    && pack.coverage.roleCounts['handoff-application'] === 5,
  pack.coverage.roleCounts);
check('FACTORY-TYPE-PARITY', 'all modules keep their deterministic Subject Factory lesson type',
  pack.tracks.every((track) => track.modules.every((module) => {
    const rules = subjectFactory.subjects.foundation.lessonTypePolicy.rules
      .filter((rule) => rule.moduleIds.includes(module.moduleId));
    return rules.length === 1 && rules[0].id === module.factoryRuleId && rules[0].type === module.lessonType;
  })),
  pack.tracks.flatMap((track) => track.modules.map((module) => ({ moduleId: module.moduleId, lessonType: module.lessonType }))));
check('CHECKPOINT-COVERAGE', 'the three tracks expose nine unique capability checkpoints',
  checkpoints.length === 9 && new Set(checkpoints.map((checkpoint) => checkpoint.id)).size === 9
    && pack.tracks.every((track) => track.capabilityCheckpoints.length === 3),
  checkpoints.map((checkpoint) => checkpoint.id));
check('RUSSIAN-CUE-COVERAGE', 'every preparatory checkpoint carries nonempty Cyrillic classroom or technical cues',
  checkpoints.every((checkpoint) => checkpoint.russianCues.length > 0
    && checkpoint.russianCues.every((cue) => /[А-Яа-яЁё]/.test(cue))),
  checkpoints.reduce((sum, checkpoint) => sum + checkpoint.russianCues.length, 0));
check('EVIDENCE-TARGET-BOUNDARY', 'lesson and checkpoint evidence remains a target and has not been collected',
  projectedLessons.every((lesson) => lesson.evidenceTarget.status === 'target-defined-not-collected'
    && lesson.evidenceTarget.artifactRefs.length === 0)
    && checkpoints.every((checkpoint) => checkpoint.masteryEffect === 'none-until-L7-B7'),
  { lessons: projectedLessons.length, checkpoints: checkpoints.length });
check('CLASSROOM-SPECIALIST-OWNERSHIP', 'classroom Russian remains a reference to the Russian specialist',
  pack.tracks[0].specialistRefs.length === 1
    && pack.tracks[0].specialistRefs[0].subjectId === 'russian'
    && pack.tracks[0].specialistRefs[0].owner === subjectFactory.subjects.russian.engineRef
    && pack.tracks[0].specialistRefs[0].behavior === 'reference-only-no-cutover',
  pack.tracks[0].specialistRefs);
check('TRANSITION-SPECIALIST-OWNERSHIP', 'Math, Programming, Signal and Systems keep their registered owners',
  JSON.stringify(pack.tracks[1].specialistRefs.map((ref) => ref.subjectId))
    === JSON.stringify(['math', 'programming', 'signal', 'systems'])
    && pack.tracks[1].specialistRefs.every((ref) => subjectFactory.subjects[ref.subjectId].engineRef === ref.owner),
  pack.tracks[1].specialistRefs);
check('STUDY-METHOD-OWNERSHIP', 'study method keeps the unchanged Foundation runtime',
  pack.tracks[2].specialistRefs.length === 1
    && pack.tracks[2].specialistRefs[0].subjectId === 'foundation'
    && pack.tracks[2].specialistRefs[0].behavior === 'unchanged-legacy-runtime',
  pack.tracks[2].specialistRefs);
check('HANDOFF-ROUTE-PARITY', 'all six handoffs resolve to registered subject routes or the pinned roadmap',
  handoffs.length === 6 && handoffs.every((handoff) => handoff.targetSubjectId
    ? subjectFactory.subjects[handoff.targetSubjectId].routes.main === handoff.targetRoute
    : handoff.targetRoute === ROADMAP_PATH),
  handoffs.map((handoff) => ({ moduleId: handoff.moduleId, target: handoff.targetSubjectId || 'roadmap' })));
check('NO-LESSON-EQUIVALENCE', 'handoffs never infer an exact later-subject lesson or mastery',
  handoffs.every((handoff) => handoff.targetLessonId === null
    && handoff.exactLessonEquivalenceClaimed === false
    && handoff.masteryEffect === 'none'),
  handoffs.length);
check('B11-REFERENCE-SCOPE', 'the sole existing runtime reference remains exact to f_s01_l1',
  pack.b11Reference.enabledReferenceCount === 1
    && pack.b11Reference.activationId === 'foundation-f_s01_l1-language-reference'
    && pack.b11Reference.lessonId === 'f_s01_l1'
    && pack.b11Reference.expandedByB6 === false
    && pack.b11Reference.masterReadyClaimed === false,
  pack.b11Reference);
check('B11-REFERENCE-PRESERVATION', 'B6 records but does not recreate or expand the B11 activation',
  projectedLessons.filter((lesson) => lesson.runtimeReference === 'existing-b11-exact').length === 1
    && projectedLessons.find((lesson) => lesson.runtimeReference === 'existing-b11-exact').lessonId === 'f_s01_l1'
    && projectedLessons.every((lesson) => lesson.activatedByB6 === false),
  projectedLessons.filter((lesson) => lesson.runtimeReference === 'existing-b11-exact').map((lesson) => lesson.lessonId));
check('SUPPORTING-SOURCE-COUNTS', 'current preparatory exercise, test and simulation counts are recorded exactly',
  pack.supportingEvidence.exercises.recordCount === 15
    && pack.supportingEvidence.tests.recordCount === 22
    && pack.supportingEvidence.simulations.observationRecordCount === 1
    && pack.supportingEvidence.simulations.practiceRecordCount === 1,
  pack.supportingEvidence);
check('SUPPORTING-SOURCES-NON-MASTERY', 'template exercises, tests and scenarios remain non-mastery support',
  Object.values(pack.supportingEvidence).every((item) => item.masteryQualified === false)
    && pack.supportingEvidence.exercises.status.includes('review-required')
    && pack.supportingEvidence.tests.status.includes('review-required')
    && pack.supportingEvidence.simulations.status.includes('review-required'),
  pack.supportingEvidence);
check('TEMPLATE-CONTENT-TRUTH', 'generic source repetition is measured rather than called academic completion',
  pack.sourceTemplateSignals.uniqueKeyPointSets === 1
    && pack.sourceTemplateSignals.uniqueCoreTheorySets === 1
    && pack.sourceTemplateSignals.uniqueMasteryCriteriaSets === 1
    && pack.sourceTemplateSignals.preparatoryQuestionRecords === 22
    && pack.sourceTemplateSignals.uniquePreparatoryQuestionBodies === 10,
  pack.sourceTemplateSignals);
check('SIMULATION-STAGE-DRIFT', 'simulation stage IDs outside current curriculum remain an explicit finding',
  JSON.stringify(pack.supportingEvidence.simulations.stageDrift) === JSON.stringify(['m1', 'm3', 'm4', 'prepare']),
  pack.supportingEvidence.simulations.stageDrift);
check('OPEN-FINDINGS', 'all four B6 limitations remain routed to B7 or B8',
  JSON.stringify(pack.openFindings.map((finding) => finding.id)) === JSON.stringify([
    'FOUNDATION_TEMPLATE_CONTENT_REVIEW_REQUIRED',
    'FOUNDATION_ASSESSMENT_NOT_MASTERY_QUALIFIED',
    'FOUNDATION_SIMULATION_STAGE_DRIFT',
    'FOUNDATION_B11_SINGLE_REFERENCE_SCOPE'
  ])
    && pack.openFindings.every((finding) => /^L7-B(7|8)(\/L7-B8)?$/.test(finding.owner)),
  pack.openFindings);
check('CLAIM-BOUNDARY', 'B6 creates no learner completion, Master-ready, cutover or whole-subject activation claim',
  Object.values(pack.claims).every((value) => value === false)
    && projectedLessons.every((lesson) => lesson.learnerCompletionClaimed === false && lesson.masterReadyClaimed === false)
    && bridge.assertBoundary(pack) === true,
  pack.claims);
check('OFFLINE-ROLLBACK', 'offline ownership and deterministic Foundation fallback remain unchanged',
  pack.offline.policyRef === 'light-core-explicit'
    && pack.offline.deterministicFallback === 'subjects/foundation/index.html'
    && pack.offline.serviceWorkerOwner === 'site-root'
    && pack.offline.changedByB6 === false
    && pack.rollback.sourceContentImpact === 'none'
    && pack.rollback.legacyRuntimeImpact === 'none'
    && pack.rollback.learnerStateImpact === 'none',
  { offline: pack.offline, rollback: pack.rollback });
check('EXACT-LESSON-RESOLUTION', 'exact preparatory lesson IDs resolve to one bridge record',
  bridge.resolveLesson(pack, 'f_s01_l1').lessonId === 'f_s01_l1'
    && bridge.resolveLesson(pack, 'f_s04_l3').trackId === 'math-science-transition'
    && bridge.resolveLesson(pack, 'f_s05_l2').trackId === 'study-method-bridge',
  ['f_s01_l1', 'f_s04_l3', 'f_s05_l2']);
check('EXACT-TRACK-RESOLUTION', 'exact bridge track IDs resolve to one ordered track',
  bridge.resolveTrack(pack, 'classroom-russian').modules.length === 1
    && bridge.resolveTrack(pack, 'math-science-transition').modules.length === 3
    && bridge.resolveTrack(pack, 'study-method-bridge').modules.length === 1,
  trackIds);
check('NO-FUZZY-LESSON-PROMOTION', 'unknown or look-alike lesson IDs fail closed',
  rejected(() => bridge.resolveLesson(pack, 'f_s01_l1-copy'), 'NO_EXACT_FOUNDATION_LESSON_MATCH').rejected
    && rejected(() => bridge.resolveLesson(pack, 'F_S01_L1'), 'NO_EXACT_FOUNDATION_LESSON_MATCH').rejected,
  'NO_EXACT_FOUNDATION_LESSON_MATCH');
check('NO-FUZZY-TRACK-PROMOTION', 'unknown or look-alike track IDs fail closed',
  rejected(() => bridge.resolveTrack(pack, 'classroom-russian-copy'), 'NO_EXACT_FOUNDATION_TRACK_MATCH').rejected,
  'NO_EXACT_FOUNDATION_TRACK_MATCH');

const duplicateModuleContract = clone(contract);
duplicateModuleContract.tracks[2].moduleIds.push('f_s01');
duplicateModuleContract.tracks[2].lessonTypeByModule.f_s01 = 'language';
mutation('DUPLICATE-MODULE-ASSIGNMENT', 'a module cannot belong to two preparatory tracks',
  rejected(() => bridge.buildBridgePack({ ...sources, contract: duplicateModuleContract }), 'FOUNDATION_MODULE_MULTI_ASSIGNMENT'));

const missingLessonSource = lessons.filter((lesson) => lesson.id !== 'f_s05_l3');
mutation('DROP-PREPARATORY-LESSON', 'a missing source lesson breaks exact bridge coverage',
  rejected(() => bridge.buildBridgePack({ ...sources, lessons: missingLessonSource }), 'FOUNDATION_LESSON_SOURCE_MISMATCH'));

const duplicateLessonSource = clone(lessons);
duplicateLessonSource.push(clone(duplicateLessonSource.find((lesson) => lesson.id === 'f_s02_l1')));
mutation('DUPLICATE-PREPARATORY-LESSON', 'duplicate source lesson IDs fail closed',
  rejected(() => bridge.buildBridgePack({ ...sources, lessons: duplicateLessonSource }), 'FOUNDATION_LESSON_DUPLICATE'));

const typeDriftFactory = clone(subjectFactory);
typeDriftFactory.subjects.foundation.lessonTypePolicy.rules
  .find((rule) => rule.id === 'foundation-math-and-physics').type = 'language';
mutation('FACTORY-TYPE-DRIFT', 'a bridge lesson type cannot diverge from Subject Factory',
  rejected(() => bridge.buildBridgePack({ ...sources, subjectFactory: typeDriftFactory }), 'FOUNDATION_FACTORY_TYPE_MISMATCH'));

const expandedReference = clone(referenceActivation);
const copiedReference = clone(expandedReference.referenceLessons[0]);
copiedReference.activationId = 'foundation-f_s01_l2-unreviewed-expansion';
copiedReference.lessonId = 'f_s01_l2';
expandedReference.referenceLessons.push(copiedReference);
mutation('EXPAND-B11-REFERENCE', 'B6 cannot silently expand the one reviewed B11 runtime reference',
  rejected(() => bridge.buildBridgePack({ ...sources, referenceActivation: expandedReference }), 'FOUNDATION_B11_SCOPE_MISMATCH'));

const qualifiedSupportContract = clone(contract);
qualifiedSupportContract.supportingEvidencePolicy.tests.masteryQualified = true;
mutation('QUALIFY-TEMPLATE-ASSESSMENT', 'template tests cannot become mastery-qualified in B6',
  rejected(() => bridge.buildBridgePack({ ...sources, contract: qualifiedSupportContract }), 'FOUNDATION_SUPPORT_MASTERY_ESCALATION'));

const claimedPack = clone(pack);
claimedPack.claims.masterReadyClaimed = true;
mutation('PROMOTE-MASTER-READY', 'B6 cannot promote structural coverage to Master-ready',
  rejected(() => bridge.assertBoundary(claimedPack), 'FOUNDATION_PACK_BOUNDARY_ESCALATION'));

const promotedHandoffPack = clone(pack);
promotedHandoffPack.tracks[1].handoffs[0].targetLessonId = 'MATH-VN-LA-C01-L01';
promotedHandoffPack.tracks[1].handoffs[0].exactLessonEquivalenceClaimed = true;
mutation('PROMOTE-HANDOFF-EQUIVALENCE', 'an unreviewed support route cannot become an exact lesson equivalence',
  rejected(() => bridge.assertBoundary(promotedHandoffPack), 'FOUNDATION_PACK_BOUNDARY_ESCALATION'));

const sourceDigestsAfter = {
  contract: digest(contract),
  curriculum: digest(curriculum),
  lessons: digest(lessons),
  exercises: digest(exercises),
  tests: digest(tests),
  simulations: digest(simulations),
  subjectFactory: digest(subjectFactory),
  referenceActivation: digest(referenceActivation),
  roadmap: digest(roadmap),
  runtime: Object.fromEntries(RUNTIME_PATHS.map((file) => [file, digest(read(file))]))
};
check('SOURCE-IMMUTABLE', 'bridge projection leaves all Foundation and governance sources unchanged',
  JSON.stringify(sourceDigestsBefore) === JSON.stringify(sourceDigestsAfter),
  sourceDigestsAfter);
check('RUNTIME-IMMUTABLE', 'B6 does not change Foundation or B11 runtime files',
  JSON.stringify(sourceDigestsBefore.runtime) === JSON.stringify(sourceDigestsAfter.runtime),
  sourceDigestsAfter.runtime);

const secondPack = bridge.buildBridgePack(sources);
check('DETERMINISTIC', 'repeated full bridge projection has a stable SHA-256 digest',
  digest(pack) === digest(secondPack), digest(pack));

const failedChecks = checks.filter((item) => !item.ok);
const failedMutations = mutationTests.filter((item) => !item.expectedFailureObserved);
const status = failedChecks.length === 0 && failedMutations.length === 0 ? 'PASS' : 'FAIL';
const report = {
  gate: 'L7-B6',
  release: bridge.release,
  status,
  trackIds,
  moduleCount: pack.coverage.moduleCount,
  lessonCount: pack.coverage.lessonCount,
  lessonRoleCounts: pack.coverage.roleCounts,
  capabilityCheckpointCount: checkpoints.length,
  supportingEvidence: pack.supportingEvidence,
  sourceTemplateSignals: pack.sourceTemplateSignals,
  openFindings: pack.openFindings,
  sourceDigests: sourceDigestsAfter,
  packDigest: digest(pack),
  checks,
  mutationTests,
  passMeaning: 'Structural preparatory bridge only; academic content, assessment quality, learner completion, Master-ready and whole-Foundation runtime activation remain unclaimed.'
};
fs.writeFileSync(path.join(ROOT, REPORT_PATH), JSON.stringify(report, null, 2) + '\n');

for (const item of checks) {
  console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.id} ${item.title}`);
}
for (const item of mutationTests) {
  console.log(`${item.expectedFailureObserved ? 'PASS' : 'FAIL'} MUTATION-${item.id} ${item.title}`);
}
console.log(`L7-B6 ${status}: ${checks.length - failedChecks.length}/${checks.length} checks; ${mutationTests.length - failedMutations.length}/${mutationTests.length} expected mutation failures observed`);
if (status !== 'PASS') process.exit(1);
