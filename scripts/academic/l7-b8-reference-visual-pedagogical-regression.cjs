'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.cwd();
const PROFILE_PATH = 'assets/data/lesson/reference-subject-qa-profile-v1.json';
const VISUAL_PATH = 'assets/data/lesson/visual-teaching-contract-v1.json';
const MASTER_READY_PATH = 'assets/data/lesson/master-ready-policy-v1.json';
const FACTORY_PATH = 'assets/data/lesson/subject-factory-registry-v1.json';
const EVIDENCE_REGISTRY_PATH = 'assets/data/lesson/reference-subject-evidence-review-v1.json';
const EVIDENCE_ENGINE_PATH = 'assets/js/platform/universal-lesson/reference-subject-evidence-review-v1.js';
const RUSSIAN_ADAPTER_PATH = 'assets/js/platform/universal-lesson/russian-universal-adapter-v1.js';
const MATH_ADAPTER_PATH = 'assets/js/platform/universal-lesson/math-universal-adapter-v1.js';
const FOUNDATION_BRIDGE_PATH = 'assets/js/platform/universal-lesson/foundation-preparatory-bridge-v1.js';
const FOUNDATION_CONTRACT_PATH = 'assets/data/lesson/foundation-preparatory-bridge-v1.json';
const ACTIVATION_PATH = 'assets/data/lesson/reference-lesson-activation-v1.json';
const ROADMAP_PATH = 'assets/data/roadmap/iu5-090401-11-v3.json';
const DOC_PATH = 'docs/migration/L7_B8_REFERENCE_VISUAL_PEDAGOGICAL_QA.md';
const REPORT_PATH = 'docs/migration/L7_B8_REFERENCE_VISUAL_PEDAGOGICAL_QA.generated.json';
const RUSSIAN_CORE_PATH = 'subjects/russian/assets/core.js';
const RUSSIAN_LAZY_PATH = 'subjects/russian/assets/lazy-heavy-data-v1341.js';
const MATH_E129_PATH = 'subjects/math/assets/theory_skin/theory-tab-E129.js';
const MATH_E246_PATH = 'subjects/math/assets/theory_skin/theory-legacy-route-E246.js';
const FOUNDATION_RUNTIME_PATH = 'assets/js/platform/universal-lesson/reference-lesson-runtime-v1.js';
const FOUNDATION_CSS_PATH = 'assets/css/universal-lesson-reference.css';
const OFFLINE_MANAGER_PATH = 'assets/js/platform/offline-subject-pack-manager.js';
const SERVICE_WORKER_PATH = 'service-worker.js';

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

function flattenFoundationLessons(pack) {
  return list(pack && pack.tracks)
    .flatMap((track) => list(track.modules))
    .flatMap((module) => list(module.lessons));
}

function profileErrors(candidate, observed) {
  const errors = [];
  const requireRule = (condition, code) => {
    if (!condition) errors.push(code);
  };
  const subjectIds = ['russian', 'math', 'foundation'];
  const dimensionIds = [
    'source-truth',
    'pedagogy-before-decoration',
    'specialist-runtime-ownership',
    'responsive-reflow',
    'accessible-operation',
    'assessment-and-evidence-integrity',
    'offline-deterministic-core',
    'claim-boundary'
  ];
  const findingIds = [
    'FOUNDATION_TEMPLATE_CONTENT_REVIEW_REQUIRED',
    'FOUNDATION_ASSESSMENT_NOT_MASTERY_QUALIFIED',
    'FOUNDATION_SIMULATION_STAGE_DRIFT',
    'FOUNDATION_B11_SINGLE_REFERENCE_SCOPE'
  ];
  const boundaryKeys = [
    'sourceMutationAllowed',
    'learnerStateMigrationAllowed',
    'evidenceWriteAllowed',
    'reviewScheduleWriteAllowed',
    'runtimeCutoverAllowed',
    'referenceActivationExpansionAllowed',
    'automaticMasterReadyAllowed',
    'pageEventEvidenceAllowed',
    'scrollEventEvidenceAllowed',
    'elapsedTimeEvidenceAllowed',
    'aiVerificationAllowed',
    'serviceWorkerChangeAllowed',
    'subjectPackPolicyChangeAllowed'
  ];

  requireRule(candidate.profileId === 'bauman-reference-subject-visual-pedagogical-qa', 'PROFILE_ID');
  requireRule(candidate.profileVersion === '1.0.0', 'PROFILE_VERSION');
  requireRule(candidate.release === 'L7-B8-REFERENCE-VISUAL-PEDAGOGICAL-QA-V1', 'PROFILE_RELEASE');
  requireRule(candidate.status === 'AUDIT_PROFILE_DEFINED_RUNTIME_UNCHANGED', 'PROFILE_STATUS');
  requireRule(candidate.programIdentity?.department === 'ИУ-5'
    && candidate.programIdentity?.officialPublishedDirectionCode === '09.04.01'
    && candidate.programIdentity?.personalizedDisplayCode === '09.04.01/11', 'PROGRAM_IDENTITY');
  requireRule(candidate.governingRefs?.visualTeachingContract === VISUAL_PATH
    && candidate.governingRefs?.masterReadyPolicy === MASTER_READY_PATH
    && candidate.governingRefs?.subjectFactory === FACTORY_PATH
    && candidate.governingRefs?.evidenceReview === EVIDENCE_REGISTRY_PATH
    && candidate.governingRefs?.foundationBridge === FOUNDATION_CONTRACT_PATH
    && candidate.governingRefs?.referenceActivation === ACTIVATION_PATH, 'GOVERNING_REFS');
  requireRule(same(candidate.scope?.subjectOrder, subjectIds), 'SUBJECT_ORDER');
  requireRule(candidate.scope?.expectedLessonCatalogCount === 406, 'SCOPE_LESSON_COUNT');
  requireRule(sameSet(candidate.scope?.modes, ['online', 'offline']), 'SCOPE_MODES');
  requireRule(list(candidate.scope?.notClaimed).includes('all-406-lessons-manually-reviewed')
    && list(candidate.scope?.notClaimed).includes('foundation-academic-content-approved')
    && list(candidate.scope?.notClaimed).includes('master-ready')
    && list(candidate.scope?.notClaimed).includes('runtime-cutover')
    && list(candidate.scope?.notClaimed).includes('whole-repository-offline-precache'), 'SCOPE_NOT_CLAIMED');
  requireRule(same(list(candidate.qaDimensions).map((item) => item.id), dimensionIds)
    && list(candidate.qaDimensions).every((item) => item.required === true && String(item.rule || '').length > 40), 'QA_DIMENSIONS');

  requireRule(same(candidate.browserContract?.viewports, [
    { id: 'desktop', width: 1440, height: 900 },
    { id: 'tablet', width: 820, height: 1180 },
    { id: 'mobile', width: 390, height: 844 }
  ]), 'BROWSER_VIEWPORTS');
  requireRule(candidate.browserContract?.maxDocumentOverflowPx === 64
    && candidate.browserContract?.maxFoundationDialogOverflowPx === 1
    && candidate.browserContract?.minimumMobileTargetSizePx === 24
    && candidate.browserContract?.reducedMotionMode === 'reduce'
    && candidate.browserContract?.consoleErrorTolerance === 0
    && candidate.browserContract?.pageErrorTolerance === 0
    && candidate.browserContract?.requiredOnlineSurfaceCount === 9
    && candidate.browserContract?.requiredOfflineSubjectCount === 3, 'BROWSER_THRESHOLDS');

  const russian = candidate.subjects?.russian;
  requireRule(russian?.lessonType === 'language'
    && russian?.engineRef === 'russian-v13-specialist'
    && russian?.route === 'subjects/russian/index.html'
    && russian?.offlinePolicyRef === 'russian-rich-explicit'
    && russian?.sourceCoverage?.lessonCount === 26
    && russian?.sourceCoverage?.sourceSlideCount === 1138
    && russian?.browserSurface?.surfaceSelector === '.learn-canva-shell'
    && sameSet(russian?.browserSurface?.requiredSelectors, [
      '.lesson-reader', '.slidebox', '[data-lesson]', '[data-slide]', '[data-act="open-present"]'
    ])
    && /SPECIALIST_RUNTIME/.test(russian?.acceptance || ''), 'RUSSIAN_PROFILE');

  const math = candidate.subjects?.math;
  requireRule(math?.lessonType === 'mathematics'
    && math?.engineRef === 'math-e126-specialist'
    && math?.route === 'subjects/math/index.html'
    && math?.offlinePolicyRef === 'math-rich-explicit'
    && math?.sourceCoverage?.legacyLessonCount === 347
    && math?.sourceCoverage?.reviewedOverlayCount === 18
    && math?.sourceCoverage?.catalogCount === 365
    && math?.sourceCoverage?.sourceBlockCount === 5852
    && sameSet(math?.sourceCoverage?.sourceFamilies, ['reviewed-theory-overlay', 'legacy-math-runtime'])
    && math?.browserSurface?.surfaceSelector === '.e129-theory-shell'
    && sameSet(math?.browserSurface?.requiredSelectors, [
      '.e129-reader', '[data-current-lesson]', '.e129-slide', '[data-e129-present]'
    ])
    && /partial/.test(math?.claimBoundary || ''), 'MATH_PROFILE');

  const foundation = candidate.subjects?.foundation;
  requireRule(sameSet(foundation?.lessonTypes, ['language', 'mathematics', 'programming'])
    && foundation?.engineRef === 'light-elearning-v2'
    && foundation?.route === 'subjects/foundation/index.html'
    && foundation?.offlinePolicyRef === 'light-core-explicit'
    && foundation?.sourceCoverage?.preparatoryLessonCount === 15
    && foundation?.sourceCoverage?.bridgeTrackCount === 3
    && foundation?.sourceCoverage?.reviewedRuntimeLessonCount === 1
    && foundation?.sourceCoverage?.reviewedRuntimeLessonId === 'f_s01_l1'
    && foundation?.browserSurface?.surfaceSelector === '.universal-reference-dialog'
    && sameSet(foundation?.browserSurface?.requiredSelectors, [
      '[data-l6-reference-modal="true"] .universal-lesson', '.ul-block', '[data-universal-action="open-specialist"]'
    ])
    && /SINGLE_PILOT/.test(foundation?.acceptance || ''), 'FOUNDATION_PROFILE');

  const findings = list(candidate.foundationFindingDisposition);
  requireRule(same(findings.map((item) => item.id), findingIds), 'FINDING_IDS');
  const findingById = Object.fromEntries(findings.map((item) => [item.id, item]));
  requireRule(findingById.FOUNDATION_TEMPLATE_CONTENT_REVIEW_REQUIRED?.status === 'OPEN_BLOCKING_CONTENT_ACCEPTANCE'
    && findingById.FOUNDATION_TEMPLATE_CONTENT_REVIEW_REQUIRED?.nextOwner === 'L21_CONTENT_OPERATIONS_AND_CURRICULUM_GOVERNANCE'
    && list(findingById.FOUNDATION_TEMPLATE_CONTENT_REVIEW_REQUIRED?.blocks).includes('foundation-academic-content-approval'), 'TEMPLATE_FINDING_OPEN');
  requireRule(findingById.FOUNDATION_ASSESSMENT_NOT_MASTERY_QUALIFIED?.status === 'CONTROLLED_NOT_QUALIFIED'
    && findingById.FOUNDATION_ASSESSMENT_NOT_MASTERY_QUALIFIED?.nextOwner === 'L21_CONTENT_OPERATIONS_AND_CURRICULUM_GOVERNANCE'
    && list(findingById.FOUNDATION_ASSESSMENT_NOT_MASTERY_QUALIFIED?.blocks).includes('foundation-master-ready-claim'), 'ASSESSMENT_FINDING_OPEN');
  requireRule(findingById.FOUNDATION_SIMULATION_STAGE_DRIFT?.status === 'OPEN_BLOCKING_FULL_SIMULATION_COVERAGE'
    && findingById.FOUNDATION_SIMULATION_STAGE_DRIFT?.nextOwner === 'L21_CONTENT_OPERATIONS_AND_CURRICULUM_GOVERNANCE'
    && list(findingById.FOUNDATION_SIMULATION_STAGE_DRIFT?.blocks).includes('foundation-full-simulation-coverage-claim'), 'SIMULATION_FINDING_OPEN');
  requireRule(findingById.FOUNDATION_B11_SINGLE_REFERENCE_SCOPE?.status === 'ACCEPTED_LIMITED_RUNTIME_SCOPE'
    && findingById.FOUNDATION_B11_SINGLE_REFERENCE_SCOPE?.nextOwner === 'FUTURE_REVIEWED_REFERENCE_EXPANSION'
    && list(findingById.FOUNDATION_B11_SINGLE_REFERENCE_SCOPE?.blocks).includes('whole-foundation-universal-runtime-activation-claim'), 'B11_FINDING_LIMITED');

  requireRule(boundaryKeys.every((key) => candidate.runtimeBoundary?.[key] === false), 'RUNTIME_BOUNDARY');
  requireRule(candidate.offlineBoundary?.preparationMode === 'explicit-base-pack'
    && candidate.offlineBoundary?.wholeRepositoryPrecacheAllowed === false
    && candidate.offlineBoundary?.largeFeatureResources === 'explicit-session-only'
    && candidate.offlineBoundary?.cloudOrAiRequired === false, 'OFFLINE_BOUNDARY');
  requireRule(candidate.rollback?.sourceContentImpact === 'none'
    && candidate.rollback?.learnerStateImpact === 'none'
    && candidate.rollback?.runtimeImpact === 'none'
    && candidate.rollback?.offlinePolicyImpact === 'none', 'ROLLBACK_BOUNDARY');

  requireRule(candidate.integrityBaselines?.algorithm === 'sha256'
    && same(Object.keys(candidate.integrityBaselines?.files || {}).sort(), Object.keys(observed.integrityDigests || {}).sort())
    && Object.entries(observed.integrityDigests || {}).every(([file, hash]) => candidate.integrityBaselines.files[file] === hash), 'INTEGRITY_BASELINES');
  requireRule(observed.catalog?.totals?.lessonCount === 406
    && observed.catalog?.subjects?.russian?.lessonCount === 26
    && observed.catalog?.subjects?.math?.lessonCount === 365
    && observed.catalog?.subjects?.foundation?.lessonCount === 15, 'OBSERVED_CATALOG_COUNTS');
  requireRule(observed.russianSlideCount === 1138, 'OBSERVED_RUSSIAN_SLIDES');
  requireRule(observed.mathLegacyCount === 347
    && observed.mathOverlayCount === 18
    && observed.mathCatalogCount === 365
    && observed.mathBlockCount === 5852, 'OBSERVED_MATH_COVERAGE');
  requireRule(observed.foundationPack?.coverage?.lessonCount === 15
    && observed.foundationPack?.tracks?.length === 3, 'OBSERVED_FOUNDATION_COVERAGE');
  requireRule(observed.foundationPack?.sourceTemplateSignals?.uniqueKeyPointSets === 1
    && observed.foundationPack?.sourceTemplateSignals?.uniqueCoreTheorySets === 1
    && observed.foundationPack?.sourceTemplateSignals?.uniqueMasteryCriteriaSets === 1
    && observed.foundationPack?.sourceTemplateSignals?.preparatoryQuestionRecords === 22
    && observed.foundationPack?.sourceTemplateSignals?.uniquePreparatoryQuestionBodies === 10, 'OBSERVED_FOUNDATION_TEMPLATES');
  requireRule(observed.foundationPack?.supportingEvidence?.exercises?.masteryQualified === false
    && observed.foundationPack?.supportingEvidence?.tests?.masteryQualified === false
    && observed.foundationPack?.supportingEvidence?.simulations?.masteryQualified === false, 'OBSERVED_FOUNDATION_NOT_MASTERY');
  requireRule(same(observed.foundationPack?.supportingEvidence?.simulations?.stageDrift, ['m1', 'm3', 'm4', 'prepare']), 'OBSERVED_SIMULATION_DRIFT');
  const enabledReferences = list(observed.referenceActivation?.referenceLessons).filter((item) => item.enabled !== false);
  requireRule(enabledReferences.length === 1
    && enabledReferences[0]?.subjectId === 'foundation'
    && enabledReferences[0]?.lessonId === 'f_s01_l1', 'OBSERVED_REFERENCE_SCOPE');
  requireRule(Object.values(observed.catalog?.claims || {}).every((value) => value === false)
    && observed.catalog?.totals?.evidenceSlotCount === 2030
    && observed.catalog?.subjects?.foundation?.lessons?.every((lesson) => lesson.masterReadyClaimed === false), 'OBSERVED_NO_CLAIMS');
  return errors;
}

const requiredFiles = [
  PROFILE_PATH,
  VISUAL_PATH,
  MASTER_READY_PATH,
  FACTORY_PATH,
  EVIDENCE_REGISTRY_PATH,
  EVIDENCE_ENGINE_PATH,
  RUSSIAN_ADAPTER_PATH,
  MATH_ADAPTER_PATH,
  FOUNDATION_BRIDGE_PATH,
  FOUNDATION_CONTRACT_PATH,
  ACTIVATION_PATH,
  ROADMAP_PATH,
  DOC_PATH,
  RUSSIAN_CORE_PATH,
  RUSSIAN_LAZY_PATH,
  MATH_E129_PATH,
  MATH_E246_PATH,
  FOUNDATION_RUNTIME_PATH,
  FOUNDATION_CSS_PATH,
  OFFLINE_MANAGER_PATH,
  SERVICE_WORKER_PATH,
  'subjects/russian/index.html',
  'subjects/russian/data/lessons.json',
  'subjects/russian/data/dialogue-bauman-az.json',
  'subjects/russian/data/deep-speaking-bauman.json',
  'subjects/russian/data/speaking.json',
  'subjects/russian/data/handwriting.json',
  'subjects/russian/data/writing.json',
  'subjects/russian/data/tests.json',
  'subjects/russian/data/simulations.json',
  'subjects/math/index.html',
  'subjects/math/data/lessons.json',
  'subjects/math/data/theory_lecture_content.json',
  'assets/data/lesson/math-prerequisite-graph-v1.generated.json',
  'subjects/foundation/index.html',
  'subjects/foundation/data/curriculum.json',
  'subjects/foundation/data/lessons.json',
  'subjects/foundation/data/exercises.json',
  'subjects/foundation/data/tests.json',
  'subjects/foundation/data/simulations.json',
  ...Object.values(MATH_BANK_PATHS)
];
for (const file of requiredFiles) {
  check('FILE-' + file, 'required L7-B8 input exists', fs.existsSync(path.join(ROOT, file)), file);
}
if (checks.some((item) => !item.ok)) {
  console.error('L7-B8 cannot start because required inputs are missing.');
  process.exit(2);
}

const profile = json(PROFILE_PATH);
const visualContract = json(VISUAL_PATH);
const masterReadyPolicy = json(MASTER_READY_PATH);
const subjectFactory = json(FACTORY_PATH);
const evidenceRegistry = json(EVIDENCE_REGISTRY_PATH);
const foundationContract = json(FOUNDATION_CONTRACT_PATH);
const referenceActivation = json(ACTIVATION_PATH);
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
  contract: foundationContract,
  curriculum: json('subjects/foundation/data/curriculum.json'),
  lessons: json('subjects/foundation/data/lessons.json'),
  exercises: json('subjects/foundation/data/exercises.json'),
  tests: json('subjects/foundation/data/tests.json'),
  simulations: json('subjects/foundation/data/simulations.json'),
  subjectFactory,
  referenceActivation,
  roadmap: json(ROADMAP_PATH)
};

const sandbox = { console, TextEncoder };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
for (const file of [RUSSIAN_ADAPTER_PATH, MATH_ADAPTER_PATH, FOUNDATION_BRIDGE_PATH, EVIDENCE_ENGINE_PATH]) {
  vm.runInContext(read(file), sandbox, { filename: file });
}
const russianAdapter = sandbox.BaumanRussianUniversalAdapter;
const mathAdapter = sandbox.BaumanMathUniversalAdapter;
const foundationBridge = sandbox.BaumanFoundationPreparatoryBridge;
const evidenceEngine = sandbox.BaumanReferenceSubjectEvidenceReview;
const foundationPack = foundationBridge.buildBridgePack(foundationSources);
const russianProjection = russianAdapter.projectLessons(russianLessons, russianSources);
const mathProjection = mathAdapter.projectCatalog(mathSources);
const catalogSources = {
  registry: evidenceRegistry,
  masterReadyPolicy,
  subjectFactory,
  russian: { adapter: russianAdapter, lessons: russianLessons, sources: russianSources },
  math: { adapter: mathAdapter, sources: mathSources },
  foundation: { bridge: foundationBridge, sources: foundationSources }
};
const catalog = evidenceEngine.buildCatalog(catalogSources);

const integrityDigests = Object.fromEntries(
  Object.keys(profile.integrityBaselines.files).sort().map((file) => [file, digest(read(file))])
);
const russianSlideCount = russianProjection.reduce((sum, lesson) => sum + lesson.blocks.length, 0);
const mathLegacyCount = mathProjection.legacy.length;
const mathOverlayCount = mathProjection.overlays.length;
const mathCatalogCount = mathLegacyCount + mathOverlayCount;
const mathBlockCount = mathProjection.legacy.concat(mathProjection.overlays)
  .reduce((sum, lesson) => sum + lesson.blocks.length, 0);
const observed = {
  integrityDigests,
  catalog,
  russianSlideCount,
  mathLegacyCount,
  mathOverlayCount,
  mathCatalogCount,
  mathBlockCount,
  foundationPack,
  referenceActivation
};
const staticProfileErrors = profileErrors(profile, observed);

check('PROFILE-VALID', 'B8 profile passes every fail-closed structural and observed-truth rule',
  staticProfileErrors.length === 0, staticProfileErrors);
check('VISUAL-CONTRACT-OWNERSHIP', 'L6-B6 visual contract remains the governing source for accessibility, evidence and offline semantics',
  visualContract.contractId === 'bauman-visual-teaching-contract'
    && visualContract.status === 'L6-B6-CONTRACT'
    && /page activity or AI output/.test(visualContract.purpose)
    && visualContract.accessibilityContract.responsiveRules.some((rule) => /reduced-motion/.test(rule))
    && visualContract.offlineContract.rules.some((rule) => /available offline/.test(rule)),
  { contractId: visualContract.contractId, status: visualContract.status });
check('PROGRAM-IDENTITY', 'official and personalized program identities remain separate',
  profile.programIdentity.department === 'ИУ-5'
    && profile.programIdentity.officialPublishedDirectionCode === '09.04.01'
    && profile.programIdentity.personalizedDisplayCode === '09.04.01/11',
  profile.programIdentity);
check('CATALOG-TRUTH', 'B7 source projection still exposes exactly 406 lessons with no completion or Master-ready claim',
  catalog.totals.lessonCount === 406
    && catalog.totals.evidenceSlotCount === 2030
    && catalog.totals.reviewHookTemplateCount === 1250
    && Object.values(catalog.claims).every((value) => value === false),
  catalog.totals);
check('RUSSIAN-SOURCE-TRUTH', 'all 26 Russian lessons and 1,138 source slides remain in the specialist-owned projection',
  russianProjection.length === 26
    && russianSlideCount === 1138
    && russianProjection.every((lesson) => lesson.offline.legacyRuntimeEntry === 'subjects/russian/index.html'),
  { lessons: russianProjection.length, slides: russianSlideCount });
check('MATH-SOURCE-TRUTH', 'Math keeps 347 legacy lessons plus 18 reviewed overlays and 5,852 source blocks',
  mathLegacyCount === 347
    && mathOverlayCount === 18
    && mathCatalogCount === 365
    && mathBlockCount === 5852,
  { legacy: mathLegacyCount, overlays: mathOverlayCount, lessons: mathCatalogCount, blocks: mathBlockCount });
check('MATH-PARTIAL-OVERLAY-TRUTH', 'reviewed overlays remain a separate partial family and never replace legacy coverage',
  mathProjection.overlays.length === 18
    && mathProjection.legacy.length === 347
    && new Set(mathProjection.legacy.concat(mathProjection.overlays).map((lesson) => lesson.metadata.lessonId)).size === 365
    && /partial/.test(profile.subjects.math.claimBoundary),
  profile.subjects.math.sourceCoverage);
check('FOUNDATION-BRIDGE-TRUTH', 'Foundation keeps three tracks and fifteen exact preparatory bridge lessons',
  foundationPack.tracks.length === 3
    && foundationPack.coverage.lessonCount === 15
    && flattenFoundationLessons(foundationPack).length === 15,
  { tracks: foundationPack.tracks.map((track) => track.trackId), lessons: foundationPack.coverage.lessonCount });
check('FOUNDATION-TEMPLATE-TRUTH', 'generic Foundation source repetition stays measured and visible',
  foundationPack.sourceTemplateSignals.uniqueKeyPointSets === 1
    && foundationPack.sourceTemplateSignals.uniqueCoreTheorySets === 1
    && foundationPack.sourceTemplateSignals.uniqueMasteryCriteriaSets === 1
    && foundationPack.sourceTemplateSignals.preparatoryQuestionRecords === 22
    && foundationPack.sourceTemplateSignals.uniquePreparatoryQuestionBodies === 10,
  foundationPack.sourceTemplateSignals);
check('FOUNDATION-ASSESSMENT-TRUTH', 'Foundation support records remain explicitly non-mastery-qualified',
  Object.values(foundationPack.supportingEvidence).every((item) => item.masteryQualified === false),
  foundationPack.supportingEvidence);
check('FOUNDATION-SIMULATION-TRUTH', 'exact preparatory simulation coverage and stage drift remain visible',
  foundationPack.supportingEvidence.simulations.observationRecordCount === 1
    && foundationPack.supportingEvidence.simulations.practiceRecordCount === 1
    && same(foundationPack.supportingEvidence.simulations.stageDrift, ['m1', 'm3', 'm4', 'prepare']),
  foundationPack.supportingEvidence.simulations);
check('FOUNDATION-B11-SCOPE', 'exactly one reviewed Foundation runtime activation remains enabled',
  referenceActivation.referenceLessons.length === 1
    && referenceActivation.referenceLessons[0].subjectId === 'foundation'
    && referenceActivation.referenceLessons[0].lessonId === 'f_s01_l1'
    && foundationPack.b11Reference.enabledReferenceCount === 1
    && foundationPack.b11Reference.expandedByB6 === false,
  foundationPack.b11Reference);
check('FOUNDATION-FINDINGS-RETAINED', 'all four Foundation findings remain explicit with claim-specific dispositions',
  same(profile.foundationFindingDisposition.map((item) => item.id), [
    'FOUNDATION_TEMPLATE_CONTENT_REVIEW_REQUIRED',
    'FOUNDATION_ASSESSMENT_NOT_MASTERY_QUALIFIED',
    'FOUNDATION_SIMULATION_STAGE_DRIFT',
    'FOUNDATION_B11_SINGLE_REFERENCE_SCOPE'
  ])
    && profile.foundationFindingDisposition.slice(0, 3).every((item) => item.status !== 'RESOLVED')
    && profile.foundationFindingDisposition.every((item) => item.blocks.length > 0),
  profile.foundationFindingDisposition.map((item) => ({ id: item.id, status: item.status, blocks: item.blocks })));
check('L21-CONTENT-ROUTING', 'content, assessment and simulation findings route to L21 governance rather than a false B8 approval',
  profile.foundationFindingDisposition.slice(0, 3)
    .every((item) => item.nextOwner === 'L21_CONTENT_OPERATIONS_AND_CURRICULUM_GOVERNANCE'),
  profile.foundationFindingDisposition.slice(0, 3).map((item) => ({ id: item.id, nextOwner: item.nextOwner })));
check('NO-EVIDENCE-OR-MASTERY-PROMOTION', 'B8 forbids page, scroll, time, AI and visual activation from becoming evidence or Master-ready',
  profile.runtimeBoundary.evidenceWriteAllowed === false
    && profile.runtimeBoundary.automaticMasterReadyAllowed === false
    && profile.runtimeBoundary.pageEventEvidenceAllowed === false
    && profile.runtimeBoundary.scrollEventEvidenceAllowed === false
    && profile.runtimeBoundary.elapsedTimeEvidenceAllowed === false
    && profile.runtimeBoundary.aiVerificationAllowed === false,
  profile.runtimeBoundary);
check('NO-RUNTIME-OR-SOURCE-CUTOVER', 'B8 changes no source, learner-state, specialist runtime, Service Worker or subject-pack policy',
  profile.runtimeBoundary.sourceMutationAllowed === false
    && profile.runtimeBoundary.learnerStateMigrationAllowed === false
    && profile.runtimeBoundary.runtimeCutoverAllowed === false
    && profile.runtimeBoundary.referenceActivationExpansionAllowed === false
    && profile.runtimeBoundary.serviceWorkerChangeAllowed === false
    && profile.runtimeBoundary.subjectPackPolicyChangeAllowed === false,
  profile.runtimeBoundary);
check('EXPLICIT-OFFLINE-BOUNDARY', 'offline QA uses explicit base packs and rejects whole-repository precache or cloud dependence',
  profile.offlineBoundary.preparationMode === 'explicit-base-pack'
    && profile.offlineBoundary.wholeRepositoryPrecacheAllowed === false
    && profile.offlineBoundary.largeFeatureResources === 'explicit-session-only'
    && profile.offlineBoundary.cloudOrAiRequired === false
    && /prepareBase/.test(read(OFFLINE_MANAGER_PATH))
    && /BASE_MAX_RESOURCE=5\*1024\*1024/.test(read(OFFLINE_MANAGER_PATH))
    && /SESSION_MAX_RESOURCE=64\*1024\*1024/.test(read(OFFLINE_MANAGER_PATH)),
  profile.offlineBoundary);

for (const [file, expected] of Object.entries(profile.integrityBaselines.files)) {
  check('INTEGRITY-' + file, 'B7 checkpoint bytes remain unchanged for B8 audit', integrityDigests[file] === expected,
    { file, expected, actual: integrityDigests[file] });
}

const russianHtml = read('subjects/russian/index.html');
const mathHtml = read('subjects/math/index.html');
const foundationHtml = read('subjects/foundation/index.html');
const russianRuntime = read(RUSSIAN_CORE_PATH) + '\n' + read(RUSSIAN_LAZY_PATH);
const mathRuntime = read(MATH_E129_PATH) + '\n' + read(MATH_E246_PATH);
const foundationRuntime = read(FOUNDATION_RUNTIME_PATH) + '\n' + read(FOUNDATION_CSS_PATH);
check('HTML-SHELLS', 'all three audited routes declare Vietnamese language, viewport metadata and their current app roots',
  [russianHtml, mathHtml, foundationHtml].every((source) => /<html lang="vi">/.test(source) && /meta name="viewport"/.test(source))
    && /id="app"/.test(russianHtml)
    && /id="app"/.test(mathHtml)
    && /class="app"/.test(foundationHtml),
  profile.scope.subjectOrder);
check('RUSSIAN-SURFACE-CONTRACT', 'Russian specialist source contains every declared learning-surface selector and ready probe',
  /learn-canva-shell/.test(russianRuntime)
    && /lesson-reader/.test(russianRuntime)
    && /slidebox/.test(russianRuntime)
    && /data-lesson/.test(russianRuntime)
    && /data-slide/.test(russianRuntime)
    && /data-act="open-present"/.test(russianRuntime)
    && /BAUMAN_RUSSIAN_V1341_LAZY/.test(russianRuntime),
  profile.subjects.russian.browserSurface);
check('MATH-SURFACE-CONTRACT', 'Math E129/E246 source contains every declared reader selector and both ready probes',
  /e129-theory-shell/.test(mathRuntime)
    && /e129-reader/.test(mathRuntime)
    && /data-current-lesson/.test(mathRuntime)
    && /e129-slide/.test(mathRuntime)
    && /data-e129-present/.test(mathRuntime)
    && /BAUMAN_MATH_THEORY_E129/.test(mathRuntime)
    && /BAUMAN_MATH_E246_LEGACY_ROUTE/.test(mathRuntime),
  profile.subjects.math.browserSurface);
check('FOUNDATION-SURFACE-CONTRACT', 'Foundation exact pilot source contains Universal dialog, ten-block runtime hook and reduced-motion handling',
  /data-l6-reference-modal="true"/.test(foundationRuntime)
    && /universal-reference-dialog/.test(foundationRuntime)
    && /data-universal-action="open-specialist"/.test(foundationRuntime)
    && /BaumanL6ReferenceLessonRuntime/.test(foundationRuntime)
    && /prefers-reduced-motion:reduce/.test(foundationRuntime),
  profile.subjects.foundation.browserSurface);
check('DOC-DECISION-RECORD', 'B8 decision record states matrix, open findings, PASS meaning, rollback and B9 handoff',
  /desktop/.test(read(DOC_PATH))
    && /tablet/.test(read(DOC_PATH))
    && /mobile/.test(read(DOC_PATH))
    && /offline/.test(read(DOC_PATH))
    && /FOUNDATION_TEMPLATE_CONTENT_REVIEW_REQUIRED/.test(read(DOC_PATH))
    && /L21/.test(read(DOC_PATH))
    && /PASS/.test(read(DOC_PATH))
    && /rollback/i.test(read(DOC_PATH))
    && /L7-B9/.test(read(DOC_PATH)),
  DOC_PATH);

function mutateProfile(id, title, applyMutation) {
  const mutant = clone(profile);
  applyMutation(mutant);
  const errors = profileErrors(mutant, observed);
  mutation(id, title, errors.length > 0, errors);
}

const expandedActivation = clone(referenceActivation);
const addedReference = clone(expandedActivation.referenceLessons[0]);
addedReference.activationId = 'foundation-f_s01_l2-unreviewed';
addedReference.lessonId = 'f_s01_l2';
expandedActivation.referenceLessons.push(addedReference);
const expandedErrors = profileErrors(profile, { ...observed, referenceActivation: expandedActivation });
mutation('EXPAND-FOUNDATION-ACTIVATION', 'an unreviewed second Foundation runtime activation fails closed',
  expandedErrors.includes('OBSERVED_REFERENCE_SCOPE'), expandedErrors);

mutateProfile('APPROVE-TEMPLATE-CONTENT', 'B8 cannot mark generic Foundation templates academically approved', (mutant) => {
  mutant.foundationFindingDisposition[0].status = 'RESOLVED';
});
mutateProfile('QUALIFY-TEMPLATE-ASSESSMENT', 'B8 cannot qualify Foundation template assessment for Master-ready', (mutant) => {
  mutant.foundationFindingDisposition[1].status = 'MASTERY_QUALIFIED';
  mutant.foundationFindingDisposition[1].blocks = [];
});
mutateProfile('HIDE-SIMULATION-DRIFT', 'B8 cannot hide the Foundation simulation-stage drift', (mutant) => {
  mutant.foundationFindingDisposition[2].status = 'RESOLVED';
});
mutateProfile('PROMOTE-MATH-OVERLAY', 'eighteen reviewed overlays cannot become full Math replacement coverage', (mutant) => {
  mutant.subjects.math.sourceCoverage.reviewedOverlayCount = 365;
  mutant.subjects.math.claimBoundary = 'Full reviewed replacement coverage.';
});
mutateProfile('DROP-MOBILE-VIEWPORT', 'desktop and tablet alone cannot satisfy the B8 responsive matrix', (mutant) => {
  mutant.browserContract.viewports = mutant.browserContract.viewports.filter((item) => item.id !== 'mobile');
  mutant.browserContract.requiredOnlineSurfaceCount = 6;
});
mutateProfile('PROMOTE-PAGE-EVENT-EVIDENCE', 'page activity cannot become evidence or automatic Master-ready state', (mutant) => {
  mutant.runtimeBoundary.pageEventEvidenceAllowed = true;
  mutant.runtimeBoundary.automaticMasterReadyAllowed = true;
});
mutateProfile('ALLOW-SOURCE-RUNTIME-MUTATION', 'the QA slice cannot mutate source or cut over specialist runtimes', (mutant) => {
  mutant.runtimeBoundary.sourceMutationAllowed = true;
  mutant.runtimeBoundary.runtimeCutoverAllowed = true;
});
mutateProfile('WHOLE-REPOSITORY-PRECACHE', 'offline QA cannot silently become whole-repository precache', (mutant) => {
  mutant.offlineBoundary.wholeRepositoryPrecacheAllowed = true;
  mutant.offlineBoundary.preparationMode = 'automatic-whole-repository';
});
mutateProfile('DRIFT-SUBJECT-COUNTS', 'a drift from 26/365/15 and 406 total fails closed', (mutant) => {
  mutant.subjects.russian.sourceCoverage.lessonCount = 25;
  mutant.scope.expectedLessonCatalogCount = 405;
});
mutateProfile('DRIFT-INTEGRITY-BASELINE', 'a changed audited source digest requires an explicit new review', (mutant) => {
  mutant.integrityBaselines.files['subjects/math/index.html'] = '0'.repeat(64);
});

const secondFoundationPack = foundationBridge.buildBridgePack(foundationSources);
const secondCatalog = evidenceEngine.buildCatalog(catalogSources);
check('DETERMINISTIC-AUDIT', 'repeated Foundation and 406-lesson audit projections have stable digests',
  digest(foundationPack) === digest(secondFoundationPack)
    && digest(catalog) === digest(secondCatalog)
    && profileErrors(profile, observed).length === 0,
  { foundationPackDigest: digest(foundationPack), catalogDigest: digest(catalog) });

const failedChecks = checks.filter((item) => !item.ok);
const failedMutations = mutationTests.filter((item) => !item.expectedFailureObserved);
const status = failedChecks.length === 0 && failedMutations.length === 0 ? 'PASS' : 'FAIL';
const report = {
  gate: 'L7-B8',
  release: profile.release,
  status,
  branch: 'migration/webapp-l1-audit-storage',
  scope: {
    subjects: profile.scope.subjectOrder,
    lessonCount: catalog.totals.lessonCount,
    onlineSurfaceCount: profile.browserContract.requiredOnlineSurfaceCount,
    offlineSubjectCount: profile.browserContract.requiredOfflineSubjectCount,
    viewports: profile.browserContract.viewports
  },
  sourceCoverage: {
    russian: { lessons: russianProjection.length, sourceSlides: russianSlideCount },
    math: { legacyLessons: mathLegacyCount, reviewedOverlays: mathOverlayCount, lessons: mathCatalogCount, sourceBlocks: mathBlockCount },
    foundation: {
      preparatoryLessons: foundationPack.coverage.lessonCount,
      bridgeTracks: foundationPack.tracks.length,
      reviewedRuntimeLessons: foundationPack.b11Reference.enabledReferenceCount
    }
  },
  foundationFindings: profile.foundationFindingDisposition,
  integrityDigests,
  projectionDigests: {
    russian: digest(russianProjection),
    math: digest(mathProjection),
    foundation: digest(foundationPack),
    evidenceCatalog: digest(catalog),
    profile: digest(profile)
  },
  checks,
  mutationTests,
  passMeaning: 'The B8 audit profile, source truth, representative specialist/reference surface contracts and claim boundaries are deterministic and intact. Browser execution is a separate required CI gate; Foundation content, assessment and simulation findings remain open and claim-blocking.'
};
fs.writeFileSync(path.join(ROOT, REPORT_PATH), JSON.stringify(report, null, 2) + '\n');

for (const item of checks) {
  console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.id} ${item.title}`);
}
for (const item of mutationTests) {
  console.log(`${item.expectedFailureObserved ? 'PASS' : 'FAIL'} MUTATION-${item.id} ${item.title}`);
}
console.log(`L7-B8 ${status}: ${checks.length - failedChecks.length}/${checks.length} checks; ${mutationTests.length - failedMutations.length}/${mutationTests.length} expected mutation failures observed`);
if (status !== 'PASS') process.exit(1);
