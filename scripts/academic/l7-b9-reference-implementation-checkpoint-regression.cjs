'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const REGISTRY_PATH = 'assets/data/lesson/reference-implementation-registry-v1.json';
const FACTORY_PATH = 'assets/data/lesson/subject-factory-registry-v1.json';
const VISUAL_PATH = 'assets/data/lesson/visual-teaching-contract-v1.json';
const LANGUAGE_PATH = 'assets/data/lesson/language-layer-hooks-v1.json';
const MASTER_READY_PATH = 'assets/data/lesson/master-ready-policy-v1.json';
const EVIDENCE_PATH = 'assets/data/lesson/reference-subject-evidence-review-v1.json';
const B8_PROFILE_PATH = 'assets/data/lesson/reference-subject-qa-profile-v1.json';
const TWIN_PATH = 'assets/data/lesson/russian-twin-registry-v1.json';
const MATH_POLICY_PATH = 'assets/data/lesson/math-prerequisite-policy-v1.json';
const DOC_PATH = 'docs/migration/L7_B9_REFERENCE_IMPLEMENTATION_CHECKPOINT.md';
const REPORT_PATH = 'docs/migration/L7_B9_REFERENCE_IMPLEMENTATION_CHECKPOINT.generated.json';

const INPUT_REPORTS = {
  'L7-B1': 'docs/migration/L7_B1_RUSSIAN_COVERAGE_AUDIT.generated.json',
  'L7-B2': 'docs/migration/L7_B2_RUSSIAN_UNIVERSAL_ADAPTER.generated.json',
  'L7-B3': 'docs/migration/L7_B3_RUSSIAN_TWIN_REGISTRY.generated.json',
  'L7-B4': 'docs/migration/L7_B4_MATH_COVERAGE_PREREQUISITE_AUDIT.generated.json',
  'L7-B5': 'docs/migration/L7_B5_MATH_UNIVERSAL_ADAPTER.generated.json',
  'L7-B6': 'docs/migration/L7_B6_FOUNDATION_PREPARATORY_COMPLETION.generated.json',
  'L7-B7': 'docs/migration/L7_B7_REFERENCE_EVIDENCE_SPACED_REVIEW.generated.json',
  'L7-B8': 'docs/migration/L7_B8_REFERENCE_VISUAL_PEDAGOGICAL_QA.generated.json'
};

const EXPECTED_GOVERNING_REFS = {
  universalLesson: 'assets/data/lesson/universal-lesson-contract-v2.json',
  blockPolicy: 'assets/data/lesson/universal-lesson-block-policy-v1.json',
  lessonTypes: 'assets/data/lesson/lesson-type-registry-v1.json',
  masterReady: MASTER_READY_PATH,
  visualTeaching: VISUAL_PATH,
  languageLayer: LANGUAGE_PATH,
  subjectFactory: FACTORY_PATH,
  evidenceReview: EVIDENCE_PATH,
  visualPedagogicalQa: B8_PROFILE_PATH,
  russianUniversalAdapter: 'assets/js/platform/universal-lesson/russian-universal-adapter-v1.js',
  russianTwinRegistry: TWIN_PATH,
  russianTwinGlossary: 'assets/data/lesson/russian-twin-glossary-v1.generated.json',
  mathPrerequisitePolicy: MATH_POLICY_PATH,
  mathPrerequisiteGraph: 'assets/data/lesson/math-prerequisite-graph-v1.generated.json',
  mathUniversalAdapter: 'assets/js/platform/universal-lesson/math-universal-adapter-v1.js'
};

const OFFICIAL_IDS = ['russian', 'math'];
const DOWNSTREAM_IDS = ['programming', 'ai', 'signal', 'systems', 'research'];
const DOWNSTREAM_ROUNDS = {
  programming: 'L8',
  ai: 'L9',
  signal: 'L9',
  systems: 'L10',
  research: 'L11'
};
const ALLOWED_TRANSFER_MODES = [
  'contract-pattern',
  'read-only-adapter-projection',
  'source-aligned-hook',
  'supports-link',
  'qa-expectation'
];
const PROHIBITED_TRANSFERS = [
  'reference-subject-ui-copy',
  'reference-subject-source-copy',
  'reference-subject-runtime-owner-copy',
  'reference-subject-storage-namespace-copy',
  'reference-subject-learner-state-copy',
  'reference-subject-evidence-or-score-copy',
  'reference-subject-course-identity-copy',
  'specialist-widget-use-outside-registered-type',
  'automatic-prerequisite-activation',
  'automatic-master-ready-promotion'
];
const REQUIRED_INPUT_GATES = [
  'L7-B1',
  'L7-B2',
  'L7-B3',
  'L7-B4',
  'L7-B5',
  'L7-B6',
  'L7-B7',
  'L7-B8-DETERMINISTIC',
  'L7-B8-BROWSER'
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
  REGISTRY_PATH,
  FACTORY_PATH,
  VISUAL_PATH,
  LANGUAGE_PATH,
  MASTER_READY_PATH,
  EVIDENCE_PATH,
  B8_PROFILE_PATH,
  TWIN_PATH,
  MATH_POLICY_PATH,
  DOC_PATH,
  ...Object.values(INPUT_REPORTS),
  ...Object.values(EXPECTED_GOVERNING_REFS)
];
for (const file of Array.from(new Set(requiredFiles))) {
  check('FILE-' + file, 'required L7-B9 input exists', fs.existsSync(path.join(ROOT, file)), file);
}
if (checks.some((item) => !item.ok)) {
  console.error('L7-B9 required input missing.');
  process.exit(2);
}

const registry = json(REGISTRY_PATH);
const factory = json(FACTORY_PATH);
const visual = json(VISUAL_PATH);
const language = json(LANGUAGE_PATH);
const masterReady = json(MASTER_READY_PATH);
const evidence = json(EVIDENCE_PATH);
const b8Profile = json(B8_PROFILE_PATH);
const twin = json(TWIN_PATH);
const mathPolicy = json(MATH_POLICY_PATH);
const inputReports = Object.fromEntries(Object.entries(INPUT_REPORTS).map(([id, file]) => [id, json(file)]));

function factorySnapshot(subjectId) {
  const subject = factory.subjects[subjectId];
  return {
    engineRef: subject.engineRef,
    route: subject.routes.main,
    lessonTypes: subject.lessonTypePolicy.allowed,
    offlinePolicyRef: subject.offlinePolicyRef
  };
}

function mathBinding(subjectId) {
  const domains = [];
  const refs = [];
  for (const profile of list(mathPolicy.domainProfiles)) {
    const matching = list(profile.downstreamRefs).filter((ref) => ref.startsWith(subjectId + ':'));
    if (!matching.length) continue;
    if (!domains.includes(profile.id)) domains.push(profile.id);
    for (const ref of matching) if (!refs.includes(ref)) refs.push(ref);
  }
  return { domainIds: domains, targetRefs: refs };
}

function expectedBaselines() {
  return {
    russianProjectionDigest: inputReports['L7-B2'].projectionDigest,
    russianTwinPackDigest: inputReports['L7-B3'].packDigest,
    mathGraphDigest: inputReports['L7-B4'].graphDigest,
    mathProjectionDigest: inputReports['L7-B5'].projectionDigest,
    evidenceCatalogDigest: inputReports['L7-B7'].catalogDigest,
    b8ProfileProjectionDigest: inputReports['L7-B8'].projectionDigests.profile
  };
}

function registryErrors(candidate) {
  const errors = [];
  const requireRule = (condition, code) => {
    if (!condition) errors.push(code);
  };

  requireRule(candidate.registryId === 'bauman-reference-implementation-registry', 'REGISTRY_ID');
  requireRule(candidate.registryVersion === '1.0.0', 'REGISTRY_VERSION');
  requireRule(candidate.release === 'L7-B9-REFERENCE-IMPLEMENTATION-CHECKPOINT-V1', 'REGISTRY_RELEASE');
  requireRule(candidate.status === 'OFFICIAL_REFERENCE_DESIGNATION_RUNTIME_UNCHANGED', 'REGISTRY_STATUS');
  requireRule(candidate.programIdentity?.department === 'ИУ-5'
    && candidate.programIdentity?.officialPublishedDirectionCode === '09.04.01'
    && candidate.programIdentity?.personalizedDisplayCode === '09.04.01/11', 'PROGRAM_IDENTITY');
  requireRule(same(candidate.governingRefs, EXPECTED_GOVERNING_REFS), 'GOVERNING_REFS');

  const designation = candidate.designationContract || {};
  requireRule(same(designation.officialReferenceOrder, OFFICIAL_IDS), 'OFFICIAL_REFERENCE_ORDER');
  requireRule(same(designation.downstreamSubjectOrder, DOWNSTREAM_IDS), 'DOWNSTREAM_SUBJECT_ORDER');
  requireRule(same(designation.allowedTransferModes, ALLOWED_TRANSFER_MODES), 'TRANSFER_MODES');
  requireRule(same(designation.prohibitedTransfers, PROHIBITED_TRANSFERS), 'PROHIBITED_TRANSFERS');
  requireRule(same(designation.requiredInputGates, REQUIRED_INPUT_GATES), 'REQUIRED_INPUT_GATES');
  requireRule(/smallest registered capability/.test(designation.selectionRule || '')
    && /own engine/.test(designation.meaning || ''), 'CAPABILITY_SPECIFIC_MEANING');

  requireRule(same(Object.keys(candidate.officialReferences || {}), OFFICIAL_IDS), 'OFFICIAL_REFERENCE_KEYS');
  for (const subjectId of OFFICIAL_IDS) {
    const reference = candidate.officialReferences?.[subjectId];
    const subject = factory.subjects[subjectId];
    requireRule(reference?.id === subjectId, 'REFERENCE_ID_' + subjectId);
    requireRule(reference?.engineRef === subject.engineRef
      && reference?.route === subject.routes.main
      && reference?.offlinePolicyRef === subject.offlinePolicyRef
      && same(reference?.lessonTypes, subject.lessonTypePolicy.allowed), 'REFERENCE_FACTORY_PARITY_' + subjectId);
    requireRule(list(reference?.implementationRefs).length >= 4
      && list(reference?.implementationRefs).every((file) => fs.existsSync(path.join(ROOT, file))), 'REFERENCE_INPUTS_' + subjectId);
    requireRule(list(reference?.capabilities).length === 5
      && list(reference?.capabilities).every((capability) =>
        ALLOWED_TRANSFER_MODES.includes(capability.transferMode)
        && String(capability.consumerRule || '').length > 50), 'REFERENCE_CAPABILITIES_' + subjectId);
    requireRule(/Official reference status does not/.test(reference?.claimBoundary || ''), 'REFERENCE_CLAIM_BOUNDARY_' + subjectId);
  }

  const russian = candidate.officialReferences?.russian;
  const russianCapabilityIds = [
    'russian-specialist-language-workspaces',
    'russian-read-only-universal-projection',
    'russian-source-aligned-language-companion',
    'russian-evidence-and-review-shape',
    'russian-responsive-offline-qa'
  ];
  requireRule(russian?.designation === 'OFFICIAL_LANGUAGE_REFERENCE_IMPLEMENTATION', 'RUSSIAN_DESIGNATION');
  requireRule(same(russian?.sourceCoverage, {
    lessonCount: b8Profile.subjects.russian.sourceCoverage.lessonCount,
    sourceSlideCount: b8Profile.subjects.russian.sourceCoverage.sourceSlideCount,
    sourceFamily: b8Profile.subjects.russian.sourceCoverage.sourceFamily
  }), 'RUSSIAN_SOURCE_COVERAGE');
  requireRule(same(list(russian?.capabilities).map((item) => item.id), russianCapabilityIds), 'RUSSIAN_CAPABILITY_IDS');
  requireRule(same(russian?.capabilities?.[0]?.sourceWidgetRefs, factory.subjects.russian.widgetRefs), 'RUSSIAN_WIDGET_OWNERSHIP');

  const math = candidate.officialReferences?.math;
  const mathCapabilityIds = [
    'math-authoritative-source-routing',
    'math-typed-representations',
    'math-downstream-support-graph',
    'math-evidence-and-review-shape',
    'math-responsive-offline-qa'
  ];
  requireRule(math?.designation === 'OFFICIAL_MATHEMATICS_REFERENCE_IMPLEMENTATION', 'MATH_DESIGNATION');
  requireRule(same(math?.sourceCoverage, {
    legacyLessonCount: b8Profile.subjects.math.sourceCoverage.legacyLessonCount,
    reviewedOverlayCount: b8Profile.subjects.math.sourceCoverage.reviewedOverlayCount,
    catalogCount: b8Profile.subjects.math.sourceCoverage.catalogCount,
    sourceBlockCount: b8Profile.subjects.math.sourceCoverage.sourceBlockCount,
    sourceFamilies: b8Profile.subjects.math.sourceCoverage.sourceFamilies
  }), 'MATH_SOURCE_COVERAGE');
  requireRule(same(list(math?.capabilities).map((item) => item.id), mathCapabilityIds), 'MATH_CAPABILITY_IDS');
  requireRule(same(math?.capabilities?.[1]?.sourceWidgetRefs, factory.subjects.math.widgetRefs), 'MATH_WIDGET_OWNERSHIP');

  requireRule(same(Object.keys(candidate.downstreamBindings || {}), DOWNSTREAM_IDS), 'DOWNSTREAM_BINDING_KEYS');
  for (const subjectId of DOWNSTREAM_IDS) {
    const binding = candidate.downstreamBindings?.[subjectId];
    const expectedMath = mathBinding(subjectId);
    const twinProfile = twin.subjectProfiles[subjectId];
    requireRule(binding?.subjectId === subjectId
      && binding?.implementationRound === DOWNSTREAM_ROUNDS[subjectId], 'DOWNSTREAM_ID_ROUND_' + subjectId);
    requireRule(same(binding?.factorySnapshot, factorySnapshot(subjectId)), 'DOWNSTREAM_FACTORY_PARITY_' + subjectId);
    requireRule(binding?.russianReference?.referenceId === 'russian'
      && binding?.russianReference?.capabilityRef === 'russian-source-aligned-language-companion'
      && binding?.russianReference?.availability === twinProfile.availability
      && same(binding?.russianReference?.typeProfiles, factory.subjects[subjectId].lessonTypePolicy.allowed)
      && binding?.russianReference?.activation === 'source-alignment-and-authorized-opt-in-required', 'DOWNSTREAM_RUSSIAN_BINDING_' + subjectId);
    requireRule(binding?.mathReference?.referenceId === 'math'
      && binding?.mathReference?.capabilityRef === 'math-downstream-support-graph'
      && binding?.mathReference?.relation === mathPolicy.downstreamRefPolicy.relation
      && same(binding?.mathReference?.domainIds, expectedMath.domainIds)
      && same(binding?.mathReference?.targetRefs, expectedMath.targetRefs)
      && binding?.mathReference?.assessmentBlocking === mathPolicy.sequencePolicy.assessmentBlocking
      && binding?.mathReference?.masterReadyEffect === mathPolicy.downstreamRefPolicy.masterReadyEffect
      && binding?.mathReference?.activation === 'reviewed-objective-binding-required', 'DOWNSTREAM_MATH_BINDING_' + subjectId);
  }

  const implementationBoundary = candidate.downstreamImplementationBoundary || {};
  const requiredTrueBoundary = [
    'ownEngineRequired',
    'ownSourceAuthorityRequired',
    'ownRegisteredWidgetsRequired',
    'ownStorageNamespaceRequired',
    'ownLearnerStateRequired',
    'ownEvidenceRequired',
    'ownAssessmentAuthorityRequired',
    'factoryRegistrationMustRemainAuthoritative',
    'typeProfileMustRemainAuthoritative'
  ];
  requireRule(requiredTrueBoundary.every((key) => implementationBoundary[key] === true)
    && implementationBoundary.missingReferenceAlignmentBehavior === 'continue-downstream-source-unchanged'
    && implementationBoundary.missingReviewedMathBindingBehavior === 'keep-support-link-inactive', 'DOWNSTREAM_IMPLEMENTATION_BOUNDARY');

  requireRule(candidate.retainedFindings?.russian?.[0]?.id === 'RUSSIAN_BUILD_APPLY_TARGET_ABSENT_IN_B2'
    && same(candidate.retainedFindings.russian[0].blocks,
      evidence.openFindings.find((item) => item.id === 'RUSSIAN_BUILD_APPLY_TARGET_ABSENT_IN_B2').blocks), 'RUSSIAN_FINDING_RETAINED');
  const mathFindings = list(inputReports['L7-B4'].findings).map((finding) => ({
    id: finding.code,
    status: finding.severity,
    nextOwner: finding.owner
  }));
  requireRule(same(candidate.retainedFindings?.math, mathFindings), 'MATH_FINDINGS_RETAINED');
  requireRule(candidate.retainedFindings?.global?.[0]?.id === 'NO_LEARNER_EVIDENCE_IMPORTED'
    && same(candidate.retainedFindings.global[0].blocks,
      evidence.openFindings.find((item) => item.id === 'NO_LEARNER_EVIDENCE_IMPORTED').blocks), 'GLOBAL_FINDING_RETAINED');

  const foundation = candidate.foundationDisposition || {};
  requireRule(foundation.designation === 'NOT_AN_OFFICIAL_REFERENCE_IMPLEMENTATION'
    && foundation.role === 'SUPPORTING_PREPARATORY_BRIDGE_AND_SINGLE_REVIEWED_PILOT'
    && foundation.factoryPilot === factory.subjects.foundation.compatibility.factoryPilot
    && foundation.reviewedRuntimeLessonId === b8Profile.subjects.foundation.sourceCoverage.reviewedRuntimeLessonId
    && foundation.officialReferenceEligible === false, 'FOUNDATION_NOT_OFFICIAL');
  requireRule(same(foundation.findings, b8Profile.foundationFindingDisposition), 'FOUNDATION_FINDINGS_RETAINED');
  requireRule(/L21/.test(foundation.promotionRule || '') && /cannot promote/.test(foundation.promotionRule || ''), 'FOUNDATION_PROMOTION_RULE');

  requireRule(same(candidate.evidenceBaselines, expectedBaselines()), 'EVIDENCE_BASELINES');
  const requiredNotClaimed = [
    'runtime-cutover',
    'source-content-copy-or-approval',
    'downstream-subject-implementation-complete',
    'learner-completion',
    'learner-evidence-imported',
    'master-ready',
    'foundation-official-reference-status',
    'whole-repository-offline-precache',
    'main-branch-merge'
  ];
  requireRule(requiredNotClaimed.every((claim) => list(candidate.claimBoundary?.notClaimed).includes(claim))
    && /fail closed/.test(candidate.claimBoundary?.passMeaning || ''), 'CLAIM_BOUNDARY');
  requireRule(Object.values(candidate.runtimeBoundary || {}).every((value) => value === false), 'RUNTIME_BOUNDARY');
  requireRule(candidate.rollback?.sourceContentImpact === 'none'
    && candidate.rollback?.learnerStateImpact === 'none'
    && candidate.rollback?.runtimeImpact === 'none'
    && candidate.rollback?.offlinePolicyImpact === 'none'
    && candidate.rollback?.mainBranchImpact === 'none', 'ROLLBACK_BOUNDARY');
  return errors;
}

check('REGISTRY-VALID', 'B9 designation registry passes every fail-closed structural and observed-truth rule',
  registryErrors(registry).length === 0, registryErrors(registry));
check('FACTORY-SUBJECT-ORDER', 'Subject Factory still contains the two references, Foundation and the five later subjects in the audited order',
  same(Object.keys(factory.subjects), ['russian', 'math', 'programming', 'foundation', 'ai', 'signal', 'systems', 'research']),
  Object.keys(factory.subjects));
check('TWIN-FACTORY-TYPE-PARITY', 'Russian Twin profiles use every current Subject Factory lesson type and default exactly',
  Object.keys(factory.subjects).every((subjectId) =>
    same(twin.subjectProfiles[subjectId].lessonTypes, factory.subjects[subjectId].lessonTypePolicy.allowed)
      && twin.subjectProfiles[subjectId].defaultLessonType === factory.subjects[subjectId].lessonTypePolicy.default),
  Object.fromEntries(Object.keys(factory.subjects).map((subjectId) => [subjectId, twin.subjectProfiles[subjectId].lessonTypes])));
check('VISUAL-TYPE-PROFILES', 'every later-subject type has an L6 visual teaching profile',
  DOWNSTREAM_IDS.every((subjectId) => factory.subjects[subjectId].lessonTypePolicy.allowed.every((typeId) => visual.typeProfiles[typeId])),
  DOWNSTREAM_IDS.flatMap((subjectId) => factory.subjects[subjectId].lessonTypePolicy.allowed));
check('LANGUAGE-TYPE-PROFILES', 'every later-subject type has a Russian Twin language-layer profile',
  DOWNSTREAM_IDS.every((subjectId) => factory.subjects[subjectId].lessonTypePolicy.allowed.every((typeId) => language.typeProfiles[typeId])),
  DOWNSTREAM_IDS.flatMap((subjectId) => factory.subjects[subjectId].lessonTypePolicy.allowed));
check('MASTER-READY-OWNERSHIP', 'Master-ready remains governed by the L6-B5 policy and not by B9 designation',
  masterReady.policyId === 'bauman-master-ready-policy'
    && masterReady.status === 'L6-B5-POLICY'
    && registry.runtimeBoundary.automaticMasterReadyAllowed === false,
  { policyId: masterReady.policyId, status: masterReady.status });
check('ALL-B1-B8-REPORTS-PASS', 'all committed L7-B1 through B8 deterministic input reports remain PASS',
  Object.values(inputReports).every((report) => report.status === 'PASS'),
  Object.fromEntries(Object.entries(inputReports).map(([id, report]) => [id, report.status])));
check('B8-BROWSER-DEPENDENCY', 'B9 declares the B8 browser gate as a required CI predecessor rather than a local synthetic PASS',
  registry.designationContract.requiredInputGates.includes('L7-B8-BROWSER')
    && /Browser execution is a separate required CI gate/.test(inputReports['L7-B8'].passMeaning),
  registry.designationContract.requiredInputGates);
check('RUSSIAN-COVERAGE-LOCK', 'Russian reference designation retains exactly 26 lessons and 1,138 source slides',
  registry.officialReferences.russian.sourceCoverage.lessonCount === 26
    && registry.officialReferences.russian.sourceCoverage.sourceSlideCount === 1138,
  registry.officialReferences.russian.sourceCoverage);
check('MATH-COVERAGE-LOCK', 'Math reference designation retains 347 legacy lessons plus 18 overlays, 365 catalog lessons and 5,852 blocks',
  registry.officialReferences.math.sourceCoverage.legacyLessonCount === 347
    && registry.officialReferences.math.sourceCoverage.reviewedOverlayCount === 18
    && registry.officialReferences.math.sourceCoverage.catalogCount === 365
    && registry.officialReferences.math.sourceCoverage.sourceBlockCount === 5852,
  registry.officialReferences.math.sourceCoverage);
check('DOWNSTREAM-MATH-TARGETS', 'all five later subjects have explicit non-blocking Math support targets from the B4 policy',
  DOWNSTREAM_IDS.every((subjectId) => mathBinding(subjectId).targetRefs.length > 0),
  Object.fromEntries(DOWNSTREAM_IDS.map((subjectId) => [subjectId, mathBinding(subjectId)])));
check('RUSSIAN-ALIGNMENT-TRUTH', 'Programming is source-aligned while the other four later Russian Twin bindings remain unavailable pending reviewed alignment',
  twin.subjectProfiles.programming.availability === 'source-aligned'
    && DOWNSTREAM_IDS.filter((id) => id !== 'programming').every((id) =>
      twin.subjectProfiles[id].availability === 'declared-awaiting-source-alignment'),
  Object.fromEntries(DOWNSTREAM_IDS.map((id) => [id, twin.subjectProfiles[id].availability])));
check('FOUNDATION-FINDINGS-ROUTED', 'three Foundation content findings remain routed to L21 and the single pilot remains limited',
  registry.foundationDisposition.findings.filter((item) =>
    item.nextOwner === 'L21_CONTENT_OPERATIONS_AND_CURRICULUM_GOVERNANCE').length === 3
    && registry.foundationDisposition.findings.find((item) =>
      item.id === 'FOUNDATION_B11_SINGLE_REFERENCE_SCOPE')?.status === 'ACCEPTED_LIMITED_RUNTIME_SCOPE',
  registry.foundationDisposition.findings.map((item) => ({ id: item.id, status: item.status, nextOwner: item.nextOwner })));
check('NO-HUTECH-LEARNER-COPY', 'B9 learner-facing governance artifacts contain no HUTECH label',
  !/HUTECH/i.test(JSON.stringify(registry) + read(DOC_PATH)), 'absent');
check('DOC-DECISION-RECORD', 'B9 decision record states official references, downstream matrix, non-copy boundary, findings, rollback and L8 handoff',
  /OFFICIAL_LANGUAGE_REFERENCE_IMPLEMENTATION/.test(read(DOC_PATH))
    && /OFFICIAL_MATHEMATICS_REFERENCE_IMPLEMENTATION/.test(read(DOC_PATH))
    && /Programming/.test(read(DOC_PATH))
    && /AI\/Data/.test(read(DOC_PATH))
    && /Signal/.test(read(DOC_PATH))
    && /Systems/.test(read(DOC_PATH))
    && /Research/.test(read(DOC_PATH))
    && /không sao chép/i.test(read(DOC_PATH))
    && /FOUNDATION_TEMPLATE_CONTENT_REVIEW_REQUIRED/.test(read(DOC_PATH))
    && /rollback/i.test(read(DOC_PATH))
    && /L8/.test(read(DOC_PATH)),
  DOC_PATH);

function mutateRegistry(id, title, applyMutation) {
  const mutant = clone(registry);
  applyMutation(mutant);
  const errors = registryErrors(mutant);
  mutation(id, title, errors.length > 0, errors);
}

mutateRegistry('DROP-MATH-OFFICIAL-REFERENCE', 'dropping Math from the official reference order fails closed',
  (candidate) => candidate.designationContract.officialReferenceOrder.pop());
mutateRegistry('PROMOTE-FOUNDATION-OFFICIAL', 'Foundation cannot be promoted while its B8 findings remain claim-blocking',
  (candidate) => candidate.designationContract.officialReferenceOrder.push('foundation'));
mutateRegistry('ALLOW-REFERENCE-UI-COPY', 'reference designation cannot authorize downstream UI copying',
  (candidate) => { candidate.runtimeBoundary.referenceUiCopyAllowed = true; });
mutateRegistry('ALLOW-RUNTIME-CUTOVER', 'B9 cannot cut over Russian or Math specialist runtimes',
  (candidate) => { candidate.runtimeBoundary.runtimeCutoverAllowed = true; });
mutateRegistry('DRIFT-DOWNSTREAM-ENGINE', 'a later subject must retain its registered engine and route',
  (candidate) => { candidate.downstreamBindings.ai.factorySnapshot.engineRef = 'math-e126-specialist'; });
mutateRegistry('ASSIGN-UNREGISTERED-TYPE', 'a reference binding cannot introduce a lesson type absent from Subject Factory',
  (candidate) => { candidate.downstreamBindings.signal.russianReference.typeProfiles.push('asoiu-system'); });
mutateRegistry('ACTIVATE-MATH-PREREQUISITE', 'system-derived Math supports links cannot become assessment-blocking prerequisites',
  (candidate) => { candidate.downstreamBindings.programming.mathReference.assessmentBlocking = true; });
mutateRegistry('INVENT-RUSSIAN-ALIGNMENT', 'B9 cannot mark an unaligned later subject as Russian Twin source-aligned',
  (candidate) => { candidate.downstreamBindings.ai.russianReference.availability = 'source-aligned'; });
mutateRegistry('HIDE-FOUNDATION-FINDING', 'all four Foundation finding dispositions must remain visible',
  (candidate) => { candidate.foundationDisposition.findings.shift(); });
mutateRegistry('PROMOTE-MATH-OVERLAY', 'the 18 Math overlays cannot become full replacement coverage',
  (candidate) => { candidate.officialReferences.math.sourceCoverage.reviewedOverlayCount = 365; });
mutateRegistry('ENABLE-AUTOMATIC-MASTER-READY', 'official reference status cannot grant automatic Master-ready',
  (candidate) => { candidate.runtimeBoundary.automaticMasterReadyAllowed = true; });
mutateRegistry('DRIFT-EVIDENCE-BASELINE', 'a changed B1-B8 evidence digest requires explicit re-review',
  (candidate) => { candidate.evidenceBaselines.mathProjectionDigest = '0'.repeat(64); });

for (const item of mutationTests) {
  check('MUTATION-' + item.id, item.title, item.expectedFailureObserved, item.evidence);
}

const designationProjection = {
  officialReferences: registry.officialReferences,
  downstreamBindings: registry.downstreamBindings,
  downstreamImplementationBoundary: registry.downstreamImplementationBoundary,
  retainedFindings: registry.retainedFindings,
  foundationDisposition: registry.foundationDisposition,
  evidenceBaselines: registry.evidenceBaselines,
  claimBoundary: registry.claimBoundary,
  runtimeBoundary: registry.runtimeBoundary
};
const report = {
  gate: 'L7-B9',
  release: registry.release,
  status: checks.every((item) => item.ok) ? 'PASS' : 'FAIL',
  officialReferences: OFFICIAL_IDS.map((id) => ({
    id,
    designation: registry.officialReferences[id].designation,
    engineRef: registry.officialReferences[id].engineRef,
    capabilityCount: registry.officialReferences[id].capabilities.length
  })),
  downstreamSubjectCount: DOWNSTREAM_IDS.length,
  downstreamBindings: Object.fromEntries(DOWNSTREAM_IDS.map((id) => [id, {
    implementationRound: registry.downstreamBindings[id].implementationRound,
    lessonTypes: registry.downstreamBindings[id].factorySnapshot.lessonTypes,
    russianTwinAvailability: registry.downstreamBindings[id].russianReference.availability,
    mathDomainCount: registry.downstreamBindings[id].mathReference.domainIds.length,
    mathTargetCount: registry.downstreamBindings[id].mathReference.targetRefs.length
  }])),
  sourceCoverage: {
    russian: registry.officialReferences.russian.sourceCoverage,
    math: registry.officialReferences.math.sourceCoverage
  },
  retainedFindingCounts: {
    russian: registry.retainedFindings.russian.length,
    math: registry.retainedFindings.math.length,
    global: registry.retainedFindings.global.length,
    foundation: registry.foundationDisposition.findings.length
  },
  evidenceBaselines: registry.evidenceBaselines,
  registryDigest: digest(registry),
  designationProjectionDigest: digest(designationProjection),
  factoryProjectionDigest: digest(Object.fromEntries([...OFFICIAL_IDS, ...DOWNSTREAM_IDS].map((id) => [id, factorySnapshot(id)]))),
  mutationTests,
  passMeaning: registry.claimBoundary.passMeaning
    + ' Remote L7-B8 browser success remains a required CI predecessor; B9 does not synthesize a local browser PASS.',
  checks
};

fs.writeFileSync(path.join(ROOT, REPORT_PATH), JSON.stringify(report, null, 2) + '\n');
for (const item of checks) console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.id} ${item.title}`);
console.log(`L7-B9 ${report.status}: ${checks.filter((item) => item.ok).length}/${checks.length} checks; ${mutationTests.filter((item) => item.expectedFailureObserved).length}/${mutationTests.length} mutations`);
if (report.status !== 'PASS') process.exit(1);
