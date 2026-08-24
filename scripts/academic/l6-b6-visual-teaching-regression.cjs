'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const UNIVERSAL_PATH = 'assets/data/lesson/universal-lesson-contract-v2.json';
const REGISTRY_PATH = 'assets/data/lesson/lesson-type-registry-v1.json';
const MASTERY_PATH = 'assets/data/lesson/master-ready-policy-v1.json';
const VISUAL_PATH = 'assets/data/lesson/visual-teaching-contract-v1.json';
const B1_REPORT_PATH = 'docs/migration/L6_B1_REFERENCE_AUDIT.generated.json';
const DOC_PATH = 'docs/migration/L6_B6_VISUAL_TEACHING_CONTRACT.md';
const REPORT_PATH = 'docs/migration/L6_B6_VISUAL_TEACHING_REGRESSION.generated.json';
const checks = [];
const failures = [];

function absolute(file) {
  return path.join(ROOT, file);
}

function read(file) {
  return fs.readFileSync(absolute(file), 'utf8');
}

function json(file) {
  return JSON.parse(read(file));
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(absolute(file))).digest('hex');
}

function check(id, title, ok, evidence) {
  const item = {
    id,
    title,
    ok: Boolean(ok),
    evidence: evidence === undefined ? null : evidence
  };
  checks.push(item);
  if (!item.ok) failures.push(id + ': ' + title);
}

function containsAll(values, required) {
  const set = new Set(values || []);
  return required.every((value) => set.has(value));
}

function sameSet(left, right) {
  const a = left || [];
  const b = right || [];
  return a.length === b.length && containsAll(a, b);
}

function unique(values) {
  return Array.from(new Set(values || []));
}

for (const file of [
  UNIVERSAL_PATH,
  REGISTRY_PATH,
  MASTERY_PATH,
  VISUAL_PATH,
  B1_REPORT_PATH,
  DOC_PATH
]) {
  check('FILE-' + file, 'required B6 input exists', fs.existsSync(absolute(file)), file);
}

if (failures.length) {
  console.error('L6-B6 regression cannot start because required inputs are missing.');
  console.error(failures.join('\n'));
  process.exit(2);
}

const universal = json(UNIVERSAL_PATH);
const registry = json(REGISTRY_PATH);
const mastery = json(MASTERY_PATH);
const visual = json(VISUAL_PATH);
const b1 = json(B1_REPORT_PATH);
const doc = read(DOC_PATH);
const visualText = JSON.stringify(visual);
const typeIds = Object.keys(registry.types || {});
const profileIds = Object.keys(visual.typeProfiles || {});
const families = Object.keys(visual.representationContract?.families || {});
const roles = visual.learningRoles || [];
const registeredAssignments = typeIds.flatMap(
  (typeId) => registry.types[typeId].visualRepresentationKinds || []
);
const registeredKinds = unique(registeredAssignments);
const mappedKinds = Object.keys(visual.kindFamilyMap || {});

check(
  'VISUAL-IDENTITY',
  'visual teaching contract identity version and status are explicit',
  visual.contractId === 'bauman-visual-teaching-contract'
    && visual.contractVersion === '1.0.0'
    && visual.status === 'L6-B6-CONTRACT',
  {
    contractId: visual.contractId,
    contractVersion: visual.contractVersion,
    status: visual.status
  }
);
check(
  'UNIVERSAL-REF',
  'B6 references the exact B2 Universal Lesson Contract',
  visual.universalLessonContractRef.path === UNIVERSAL_PATH
    && visual.universalLessonContractRef.contractId === universal.contractId
    && visual.universalLessonContractRef.schemaVersion === universal.schemaVersion,
  visual.universalLessonContractRef
);
check(
  'REGISTRY-REF',
  'B6 references the exact B4 type registry',
  visual.typeRegistryRef.path === REGISTRY_PATH
    && visual.typeRegistryRef.registryId === registry.registryId
    && visual.typeRegistryRef.registryVersion === registry.registryVersion,
  visual.typeRegistryRef
);
check(
  'MASTERY-REF',
  'B6 references the exact B5 Master-ready policy',
  visual.masterReadyPolicyRef.path === MASTERY_PATH
    && visual.masterReadyPolicyRef.policyId === mastery.policyId
    && visual.masterReadyPolicyRef.policyVersion === mastery.policyVersion,
  visual.masterReadyPolicyRef
);
check(
  'DESIGN-DECISIONS',
  'B6 binds semantic navigation specialist visual AI offline assessment and identity decisions',
  containsAll(visual.designDecisionRefs, ['D01', 'D05', 'D07', 'D08', 'D09', 'D11', 'D12']),
  visual.designDecisionRefs
);

const principleIds = (visual.principles || []).map((item) => item.id);
check(
  'PRINCIPLES',
  'visual principles cover pedagogy typing navigation interaction repair assessment accessibility offline and provenance',
  sameSet(principleIds, [
    'pedagogy-before-decoration',
    'typed-specialist-ownership',
    'visual-not-tab',
    'predict-act-observe-explain',
    'focused-repair',
    'assessment-integrity',
    'accessible-equivalence',
    'offline-deterministic-core',
    'provenance-boundary'
  ])
    && (visual.principles || []).every((item) => item.rule.length > 80),
  principleIds
);
check(
  'NO-DECORATION-EVIDENCE',
  'decorative or page activity cannot become learning evidence',
  /decorative media never satisfies/.test(visual.principles[0].rule)
    && /opening, viewing or animating a visual alone is not evidence/.test(
      visual.visualEnvelope.evidenceRule
    ),
  {
    principle: visual.principles[0].rule,
    evidenceRule: visual.visualEnvelope.evidenceRule
  }
);
check(
  'NO-FIXED-TABS',
  'contract does not define required visual tabs or a tab count',
  !Object.prototype.hasOwnProperty.call(visual, 'tabs')
    && !Object.prototype.hasOwnProperty.call(visual, 'tabCount')
    && !Object.prototype.hasOwnProperty.call(visual, 'requiredTabs')
    && /never implies a fixed tab count/.test(
      visual.principles.find((item) => item.id === 'visual-not-tab').rule
    ),
  visual.principles.find((item) => item.id === 'visual-not-tab')
);

const requiredEnvelopeFields = [
  'visualId',
  'lessonId',
  'blockRef',
  'lessonType',
  'learningRole',
  'representationKind',
  'representationFamily',
  'specialistCapabilityRef',
  'sourceBindings',
  'stateModelRef',
  'interactionPolicyRef',
  'feedbackPolicyRef',
  'disclosurePolicyRef',
  'accessibility',
  'offline',
  'evidenceRefs',
  'provenance'
];
check(
  'VISUAL-ENVELOPE',
  'visual envelope binds identity type semantics source state feedback accessibility offline evidence and provenance',
  containsAll(visual.visualEnvelope.requiredFields, requiredEnvelopeFields)
    && /never derives only from array position/.test(visual.visualEnvelope.identityRule)
    && /does not create a hidden parallel lesson structure/.test(visual.visualEnvelope.blockRule)
    && /source binding contract/.test(visual.visualEnvelope.sourceRule)
    && /may be null/.test(visual.visualEnvelope.specialistCapabilityRule)
    && /registered for the lesson type/.test(visual.visualEnvelope.specialistCapabilityRule),
  visual.visualEnvelope
);

const expectedRoles = [
  'orient',
  'concept-model',
  'worked-step',
  'predict',
  'manipulate-observe',
  'construct',
  'compare',
  'error-intercept',
  'explain-defend',
  'review-retrieve',
  'result-evidence'
];
check(
  'LEARNING-ROLES',
  'shared visual learning roles are exact and non-navigational',
  sameSet(roles, expectedRoles),
  roles
);
const expectedFamilies = [
  'annotated-illustration',
  'relationship-diagram',
  'step-sequence',
  'state-comparison',
  'trace-timeline',
  'plot-or-chart',
  'media-overlay',
  'artifact-view',
  'interactive-model',
  'specialist-widget'
];
check(
  'REPRESENTATION-FAMILIES',
  'contract defines the ten shared fallback and accessibility families',
  sameSet(families, expectedFamilies)
    && families.every((family) => visual.representationContract.families[family].length > 70),
  families
);
check(
  'SPECIALIST-OWNERSHIP',
  'resolution preserves registered specialist ownership and rejects extension inference',
  /lessonType/.test(visual.representationContract.resolutionRule)
    && /specialist capability/.test(visual.representationContract.resolutionRule)
    && /file extension alone/.test(visual.representationContract.resolutionRule)
    && /never all profile kinds by default/.test(visual.representationContract.profileUsageRule)
    && /does not claim feature parity/.test(visual.representationContract.noGenericReplacementRule),
  visual.representationContract
);
check(
  'FALLBACK-ORDER',
  'fallback order keeps specialist then static structured and descriptive states',
  sameSet(visual.representationContract.fallbackOrder, [
    'registered specialist renderer',
    'deterministic static state or artifact snapshot',
    'structured table or ordered steps',
    'long description with source anchors'
  ]),
  visual.representationContract.fallbackOrder
);
check(
  'KIND-MAP-COVERAGE',
  'every distinct B4 visual kind is mapped once with no unknown kind',
  sameSet(mappedKinds, registeredKinds),
  {
    registeredAssignments: registeredAssignments.length,
    registeredKinds: registeredKinds.length,
    mappedKinds: mappedKinds.length,
    missing: registeredKinds.filter((kind) => !mappedKinds.includes(kind)),
    extra: mappedKinds.filter((kind) => !registeredKinds.includes(kind))
  }
);
check(
  'KIND-MAP-FAMILIES',
  'every registered kind resolves to a declared family',
  mappedKinds.every((kind) => families.includes(visual.kindFamilyMap[kind])),
  visual.kindFamilyMap
);

const requiredStepFields = [
  'stepId',
  'objectiveRef',
  'instruction',
  'learnerAction',
  'observableStateChange',
  'expectedObservation',
  'sourceRefs',
  'evidenceRefs',
  'accessibilityLabel'
];
const expectedStepStates = [
  'locked',
  'available',
  'active',
  'attempted',
  'verified',
  'needs-repair',
  'complete'
];
const stepPairs = visual.stepStateContract.transitions.map(
  (item) => item.from + '->' + item.to
);
check(
  'STEP-FIELDS',
  'step state binds purpose action observable change source evidence and accessibility',
  containsAll(visual.stepStateContract.requiredStepFields, requiredStepFields),
  visual.stepStateContract.requiredStepFields
);
check(
  'STEP-STATES',
  'step states separate lock attempt verification repair and completion',
  sameSet(visual.stepStateContract.states, expectedStepStates),
  visual.stepStateContract.states
);
check(
  'STEP-TRANSITIONS',
  'step transitions include explicit prerequisite attempt verification repair retry and completion',
  containsAll(stepPairs, [
    'locked->available',
    'available->active',
    'active->attempted',
    'attempted->verified',
    'attempted->needs-repair',
    'needs-repair->active',
    'verified->complete'
  ]),
  stepPairs
);
check(
  'STEP-RECOVERY',
  'locked and failed steps expose recovery while reset preserves evidence',
  visual.stepStateContract.rules.some((rule) => /locked step exposes why/.test(rule))
    && visual.stepStateContract.rules.some((rule) => /Reset restores/.test(rule))
    && visual.stepStateContract.rules.some((rule) => /never to a fixed UI tab count/.test(rule)),
  visual.stepStateContract.rules
);

const expectedOutcomes = [
  'unattempted',
  'correct',
  'partially-correct',
  'incorrect',
  'inconclusive',
  'needs-review'
];
check(
  'OUTCOME-VOCABULARY',
  'correct-wrong contract preserves partial inconclusive and review outcomes',
  sameSet(visual.correctWrongContract.outcomes, expectedOutcomes),
  visual.correctWrongContract.outcomes
);
check(
  'COMPARISON-FIELDS',
  'comparison binds states dimensions reason source repair and disclosure',
  containsAll(visual.correctWrongContract.requiredComparisonFields, [
    'baselineState',
    'candidateState',
    'contrastDimensions',
    'outcome',
    'explanation',
    'sourceRefs',
    'repairRef',
    'disclosurePolicyRef'
  ]),
  visual.correctWrongContract.requiredComparisonFields
);
check(
  'NON-COLOR-NON-BINARY',
  'comparison is not color-only binary and separates runtime from learner error',
  visual.correctWrongContract.rules.some((rule) => /not only a green or red surface/.test(rule))
    && visual.correctWrongContract.rules.some((rule) => /Non-binary technical results/.test(rule))
    && visual.correctWrongContract.rules.some((rule) => /runtime error/.test(rule)),
  visual.correctWrongContract.rules
);
check(
  'CONDITIONAL-REPAIR-REF',
  'repair reference is nullable for correct state but required for repair outcomes',
  /may be null for correct or unattempted outcomes/.test(
    visual.correctWrongContract.nullableReferenceRule
  )
    && /required for partially-correct, incorrect and needs-review/.test(
      visual.correctWrongContract.nullableReferenceRule
    ),
  visual.correctWrongContract.nullableReferenceRule
);

check(
  'INTERACTION-MODES',
  'interaction modes cover observe predict classify manipulate construct trace compare annotate and explain',
  sameSet(visual.interactionContract.modes, [
    'observe',
    'predict',
    'classify',
    'manipulate',
    'construct',
    'trace',
    'compare',
    'annotate',
    'explain'
  ]),
  visual.interactionContract.modes
);
check(
  'INTERACTION-EVENT',
  'interaction events retain visual step before/after state time and provenance',
  containsAll(visual.interactionContract.requiredActionEventFields, [
    'eventId',
    'visualId',
    'lessonId',
    'stepId',
    'action',
    'inputRefs',
    'beforeStateRef',
    'afterStateRef',
    'createdAt',
    'provenance'
  ]),
  visual.interactionContract.requiredActionEventFields
);
check(
  'INTERACTION-DETERMINISM',
  'interaction is reproducible resettable keyboard operable and autoplay-safe',
  visual.interactionContract.determinismRules.some((rule) => /same versioned inputs/.test(rule))
    && visual.interactionContract.determinismRules.some((rule) => /Run, pause, step, retry and reset/.test(rule))
    && visual.interactionContract.determinismRules.some((rule) => /keyboard-operable/.test(rule))
    && visual.interactionContract.determinismRules.some((rule) => /Autoplay never/.test(rule)),
  visual.interactionContract.determinismRules
);

check(
  'FEEDBACK-EVENT',
  'feedback binds attempt outcome primary error source repair retry actor and provenance',
  containsAll(visual.feedbackContract.requiredEventFields, [
    'feedbackId',
    'attemptRef',
    'visualId',
    'outcome',
    'primaryErrorRef',
    'sourceAnchors',
    'message',
    'repairRef',
    'retryPolicy',
    'actorType',
    'provenance'
  ]),
  visual.feedbackContract.requiredEventFields
);
check(
  'FOCUSED-FEEDBACK',
  'only one primary error group is expanded while secondary findings remain retrievable',
  visual.feedbackContract.maxPrimaryErrorGroupsShownAtOnce === 1
    && visual.feedbackContract.secondaryFindingPolicy === 'collapsed-and-retrievable',
  {
    maximum: visual.feedbackContract.maxPrimaryErrorGroupsShownAtOnce,
    secondary: visual.feedbackContract.secondaryFindingPolicy
  }
);
check(
  'CONDITIONAL-PRIMARY-ERROR',
  'primary error is nullable for correct feedback and required for needs-repair',
  visual.feedbackContract.verificationAuthorityRef === MASTERY_PATH + '#verificationActors'
    && /may be null for correct or unscored feedback/.test(
      visual.feedbackContract.primaryErrorRule
    )
    && /required when feedback creates a needs-repair route/.test(
      visual.feedbackContract.primaryErrorRule
    ),
  {
    verificationAuthorityRef: visual.feedbackContract.verificationAuthorityRef,
    primaryErrorRule: visual.feedbackContract.primaryErrorRule
  }
);
check(
  'AI-FEEDBACK-BOUNDARY',
  'AI feedback is advisory source-bound and has deterministic fallback',
  visual.feedbackContract.rules.some((rule) =>
    /AI advisory feedback cannot set verified, fabricate a source or reveal/.test(rule)
  )
    && visual.feedbackContract.rules.some((rule) => /Unavailable AI falls back/.test(rule)),
  visual.feedbackContract.rules
);

const disclosureIds = Object.keys(visual.disclosurePolicies || {});
check(
  'DISCLOSURE-CONTEXTS',
  'disclosure separates orientation examples guided independent review and formal assessment',
  sameSet(disclosureIds, [
    'orientation',
    'worked-example',
    'guided-practice',
    'independent-practice',
    'review',
    'formal-assessment'
  ]),
  disclosureIds
);
const formal = visual.disclosurePolicies['formal-assessment'];
check(
  'FORMAL-ASSESSMENT-INTEGRITY',
  'formal assessment hides correctness hints and solutions before submission',
  formal.correctnessTiming === 'only-after-submission-boundary'
    && formal.hintMode === 'none-unless-blueprint-explicitly-allows'
    && formal.solutionMode === 'post-submission-policy-only'
    && /unavailable to learner and AI advisory before submission/.test(formal.protectedAnswerRule),
  formal
);
check(
  'PRACTICE-DISCLOSURE',
  'guided independent and review feedback require committed attempts and policy gates',
  visual.disclosurePolicies['guided-practice'].correctnessTiming === 'after-committed-step'
    && visual.disclosurePolicies['independent-practice'].correctnessTiming === 'after-committed-attempt'
    && visual.disclosurePolicies.review.correctnessTiming === 'after-retrieval-attempt',
  visual.disclosurePolicies
);

const accessibility = visual.accessibilityContract;
check(
  'ACCESSIBILITY-FIELDS',
  'accessibility requires description non-color keyboard focus motion fallback and language',
  containsAll(accessibility.requiredFields, [
    'shortLabel',
    'longDescriptionRef',
    'nonColorLegend',
    'keyboardModel',
    'focusOrder',
    'reducedMotionBehavior',
    'textOrTableFallbackRef',
    'language'
  ]),
  accessibility.requiredFields
);
check(
  'ACCESSIBILITY-FAMILIES',
  'every representation family has at least two explicit accessibility requirements',
  sameSet(Object.keys(accessibility.familyRequirements || {}), families)
    && families.every((family) => accessibility.familyRequirements[family].length >= 2),
  accessibility.familyRequirements
);
check(
  'RESPONSIVE-ACCESSIBILITY',
  'responsive rules protect controls order zoom reflow and reduced motion',
  accessibility.responsiveRules.some((rule) => /mobile, tablet or desktop/.test(rule))
    && accessibility.responsiveRules.some((rule) => /source-before-action/.test(rule))
    && accessibility.responsiveRules.some((rule) => /Zoom and text reflow/.test(rule))
    && accessibility.responsiveRules.some((rule) => /reduced-motion/.test(rule)),
  accessibility.responsiveRules
);

check(
  'OFFLINE-RESOURCE-CLASSES',
  'offline resource classes match the B4 registry vocabulary',
  sameSet(visual.offlineContract.resourceClasses, ['bundled', 'subject-pack', 'local-file'])
    && typeIds.every((typeId) =>
      sameSet(registry.types[typeId].offlineResourceClasses, visual.offlineContract.resourceClasses)
    ),
  visual.offlineContract.resourceClasses
);
check(
  'OFFLINE-FIELDS',
  'offline resources carry class version size integrity availability and fallback',
  containsAll(visual.offlineContract.requiredFields, [
    'resourceClass',
    'version',
    'sizeBytes',
    'integrityRef',
    'availabilityState',
    'fallbackRef'
  ]),
  visual.offlineContract.requiredFields
);
check(
  'OFFLINE-BEHAVIOR',
  'offline core explicit packs zero-copy files AI independence and error separation are explicit',
  visual.offlineContract.rules.some((rule) => /remain available offline/.test(rule))
    && visual.offlineContract.rules.some((rule) => /explicit download/.test(rule))
    && visual.offlineContract.rules.some((rule) => /zero-copy/.test(rule))
    && visual.offlineContract.rules.some((rule) => /Missing cloud or AI service never blocks/.test(rule))
    && visual.offlineContract.rules.some((rule) => /incorrect learner answer/.test(rule)),
  visual.offlineContract.rules
);
check(
  'PERFORMANCE-METADATA',
  'performance metadata covers size class loading dimensions and fallback',
  containsAll(visual.performanceContract.requiredResourceMetadata, [
    'sizeBytes',
    'resourceClass',
    'loadingPolicy',
    'intrinsicDimensionsOrAspectRatio',
    'fallbackRef'
  ]),
  visual.performanceContract.requiredResourceMetadata
);
check(
  'PERFORMANCE-BEHAVIOR',
  'visual performance requires lazy loading stable layout pause and early fallback',
  visual.performanceContract.rules.some((rule) => /lazy-load/.test(rule))
    && visual.performanceContract.rules.some((rule) => /stable layout space/.test(rule))
    && visual.performanceContract.rules.some((rule) => /pause when hidden/.test(rule))
    && visual.performanceContract.rules.some((rule) => /fallback renders before/.test(rule)),
  visual.performanceContract.rules
);

check(
  'PROFILE-SET',
  'B6 has exactly one visual profile for every B4 lesson type',
  sameSet(profileIds, typeIds),
  { profiles: profileIds, types: typeIds }
);
const profileSummaries = {};
const profileErrors = {};
for (const typeId of typeIds) {
  const profile = visual.typeProfiles[typeId];
  const registryType = registry.types[typeId];
  const errors = [];
  if (!profile) {
    errors.push('missing profile');
  } else {
    if (profile.typeId !== typeId) errors.push('typeId mismatch');
    if (!sameSet(profile.representationKinds, registryType.visualRepresentationKinds)) {
      errors.push('representation set mismatch');
    }
    const allowedCapabilities = new Set(registryType.capabilityRefs || []);
    if (!Array.isArray(profile.specialistCapabilityRefs)
      || profile.specialistCapabilityRefs.length < 5) {
      errors.push('too few specialist capabilities');
    }
    for (const capability of profile.specialistCapabilityRefs || []) {
      if (!allowedCapabilities.has(capability)) errors.push('unknown capability ' + capability);
    }
    if (!Array.isArray(profile.requiredRoleCoverage)
      || profile.requiredRoleCoverage.length < 5) {
      errors.push('too few learning roles');
    }
    for (const role of profile.requiredRoleCoverage || []) {
      if (!roles.includes(role)) errors.push('unknown learning role ' + role);
    }
    if (!Array.isArray(profile.domainRules)
      || profile.domainRules.length < 3
      || profile.domainRules.some((rule) => rule.length < 70)) {
      errors.push('domain rules incomplete');
    }
    for (const kind of profile.representationKinds || []) {
      if (!visual.kindFamilyMap[kind]) errors.push('unmapped kind ' + kind);
    }
    if (registryType.forwardRefs.visualProfile !== 'L6-B6#' + typeId) {
      errors.push('B4 visual forward ref mismatch');
    }
  }
  profileErrors[typeId] = errors;
  profileSummaries[typeId] = profile ? {
    representationKinds: profile.representationKinds,
    representationFamilies: unique(
      profile.representationKinds.map((kind) => visual.kindFamilyMap[kind])
    ),
    specialistCapabilityRefs: profile.specialistCapabilityRefs,
    requiredRoleCoverage: profile.requiredRoleCoverage,
    domainRules: profile.domainRules.length,
    errors
  } : { errors };
  check(
    'PROFILE-' + typeId.toUpperCase(),
    typeId + ' matches its registered visuals capabilities roles and forward ref',
    errors.length === 0,
    profileSummaries[typeId]
  );
}

check(
  'LANGUAGE-VISUAL-SAFETY',
  'language profile distinguishes pronunciation advisory state transcript and phrase dimensions',
  visual.typeProfiles.language.domainRules.some((rule) => /separates transcript similarity/.test(rule))
    && visual.typeProfiles.language.domainRules.some((rule) => /offline non-audio recovery/.test(rule))
    && visual.typeProfiles.language.domainRules.some((rule) => /meaning, form or pronunciation/.test(rule)),
  visual.typeProfiles.language.domainRules
);
check(
  'MATH-VISUAL-SAFETY',
  'mathematics profile preserves assumptions notation dimensions units values and prediction',
  visual.typeProfiles.mathematics.domainRules.some((rule) => /assumptions, notation, dimensions/.test(rule))
    && visual.typeProfiles.mathematics.domainRules.some((rule) => /axis scale, units/.test(rule))
    && visual.typeProfiles.mathematics.domainRules.some((rule) => /prediction before manipulation/.test(rule)),
  visual.typeProfiles.mathematics.domainRules
);
check(
  'PROGRAMMING-FOCUSED-FAILURE',
  'programming profile binds runtime state and focuses the first causal test failure',
  visual.typeProfiles.programming.domainRules.some((rule) => /source version, input, runtime/.test(rule))
    && visual.typeProfiles.programming.domainRules.some((rule) => /first causal failure/.test(rule)),
  visual.typeProfiles.programming.domainRules
);
check(
  'ML-EVALUATION-INTEGRITY',
  'ML visual profile keeps split baseline uncertainty leakage and scoped counts visible',
  visual.typeProfiles['ml-data'].domainRules.some((rule) => /dataset split, baseline, uncertainty/.test(rule))
    && visual.typeProfiles['ml-data'].domainRules.some((rule) => /never hides leakage/.test(rule))
    && visual.typeProfiles['ml-data'].domainRules.some((rule) => /expose counts/.test(rule)),
  visual.typeProfiles['ml-data'].domainRules
);
check(
  'RESEARCH-PROVENANCE',
  'research visual profile separates source learner system and AI and keeps NIR/VKR evidence',
  visual.typeProfiles.research.domainRules.some((rule) =>
    /provided source, learner note, system-derived relation and AI inference separate/.test(rule)
  )
    && visual.typeProfiles.research.domainRules.some((rule) => /НИР\/ВКР milestone/.test(rule)),
  visual.typeProfiles.research.domainRules
);

const boi = visual.referenceCompatibility.boiPedagogy;
check(
  'BOI-SNAPSHOT',
  'B6 uses the exact frozen B1 public reference and hashes',
  boi.url === b1.boiSnapshot.url
    && boi.htmlSha256 === b1.boiSnapshot.htmlSha256
    && boi.pageJsSha256 === b1.boiSnapshot.pageJsSha256
    && boi.cssSha256 === b1.boiSnapshot.cssSha256,
  boi
);
check(
  'BOI-TRANSFER-BOUNDARY',
  'B6 keeps gated focused offline pedagogy and rejects domain graphics and fixed visual tabs',
  containsAll(boi.kept, [
    'visible learner journey',
    'checkpoint before formal assessment',
    'one primary error at a time',
    'post-submission formal feedback',
    'source-grounded AI recovery',
    'deterministic offline learning'
  ])
    && containsAll(boi.notCopied, [
      'swimming movement graphics',
      'physical-safety instructions',
      'stroke-specific interactions',
      'five mandatory visual tabs'
    ]),
  boi
);

const referenceHashes = {};
const referenceModes = {};
for (const subjectId of ['russian', 'mathematics']) {
  const reference = visual.referenceCompatibility[subjectId];
  referenceModes[subjectId] = reference.mode;
  referenceHashes[subjectId] = {};
  for (const sourcePath of reference.sourcePaths || []) {
    const exists = fs.existsSync(absolute(sourcePath));
    if (exists) referenceHashes[subjectId][sourcePath] = sha256(sourcePath);
    check(
      'REFERENCE-' + subjectId.toUpperCase() + '-' + sourcePath,
      subjectId + ' compatibility source exists and is hashable',
      exists,
      exists ? referenceHashes[subjectId][sourcePath] : sourcePath
    );
  }
}
check(
  'REFERENCE-MODES',
  'Russian and Mathematics remain read-only and unprojected',
  referenceModes.russian === 'read-only-reference-unprojected'
    && referenceModes.mathematics === 'read-only-reference-unprojected',
  referenceModes
);

check(
  'PROGRAM-IDENTITY',
  'B6 inherits official and personalized Bauman identity without conflating codes',
  universal.programIdentity.department === 'ИУ-5'
    && universal.programIdentity.officialPublishedDirectionCode === '09.04.01'
    && universal.programIdentity.personalizedDisplayCode === '09.04.01/11'
    && visual.programIdentityRef === UNIVERSAL_PATH + '#programIdentity',
  universal.programIdentity
);
const comparisonLabel = ['hu', 'tech'].join('');
check(
  'LEARNER-BRAND-BOUNDARY',
  'B6 contract and decision record contain no comparison-school learner label',
  !visualText.toLowerCase().includes(comparisonLabel)
    && !doc.toLowerCase().includes(comparisonLabel),
  universal.programIdentity.learnerBrandPolicy
);

check(
  'FORWARD-OWNERSHIP',
  'B6 leaves language hooks schema factory renderer and reference regression to B7-B11',
  ['L6-B7', 'L6-B8', 'L6-B9', 'L6-B10', 'L6-B11'].every(
    (step) => Object.prototype.hasOwnProperty.call(visual.forwardOwnership, step)
  )
    && /does not claim/.test(visual.forwardOwnership.rule),
  visual.forwardOwnership
);
check(
  'ROLLBACK',
  'B6 rollback has no learner-state or legacy-runtime impact',
  visual.rollback.learnerStateImpact === 'none'
    && visual.rollback.legacyRuntimeImpact === 'none'
    && /B5 checkpoint/.test(visual.rollback.scope),
  visual.rollback
);
check(
  'DOC-COVERAGE',
  'B6 decision record covers audit architecture state feedback types accessibility offline provenance compatibility rollback and acceptance',
  [
    'Reference audit and transfer boundary',
    'Three-layer visual architecture',
    'Visual envelope and learning roles',
    'Representation families and typed kinds',
    'Step-state contract',
    'Correct, wrong and non-binary outcomes',
    'Interaction and deterministic state',
    'Focused feedback and AI boundary',
    'Practice and assessment disclosure',
    'Type-specific profiles',
    'Accessibility and responsive behavior',
    'Offline and performance behavior',
    'Provenance and Bauman identity',
    'Compatibility and forward ownership',
    'Rollback',
    'Acceptance'
  ].every((heading) => doc.includes(heading)),
  DOC_PATH
);

const kindFamilyCounts = {};
for (const family of families) kindFamilyCounts[family] = 0;
for (const family of Object.values(visual.kindFamilyMap)) kindFamilyCounts[family] += 1;

const report = {
  schema: 'L6_B6_VISUAL_TEACHING_REGRESSION_V1',
  contractId: visual.contractId,
  contractVersion: visual.contractVersion,
  universalContractVersion: universal.schemaVersion,
  typeRegistryVersion: registry.registryVersion,
  masterReadyPolicyVersion: mastery.policyVersion,
  learningRoles: roles,
  representationFamilies: families,
  registeredRepresentationAssignments: registeredAssignments.length,
  distinctRegisteredRepresentationKinds: registeredKinds.length,
  kindFamilyCounts,
  stepStates: visual.stepStateContract.states,
  outcomeVocabulary: visual.correctWrongContract.outcomes,
  disclosurePolicies: visual.disclosurePolicies,
  profileSummaries,
  profileErrors,
  referenceModes,
  referenceHashes,
  boiSnapshot: boi,
  checks,
  failures,
  result: failures.length ? 'FAIL' : 'PASS'
};

fs.mkdirSync(path.dirname(absolute(REPORT_PATH)), { recursive: true });
fs.writeFileSync(absolute(REPORT_PATH), JSON.stringify(report, null, 2) + '\n');

console.log(
  'L6-B6 visual teaching regression: '
    + checks.length
    + ' checks, '
    + failures.length
    + ' failure(s).'
);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(2);
}
console.log('L6-B6 visual teaching regression PASS.');
