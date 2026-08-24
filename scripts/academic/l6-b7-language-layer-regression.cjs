'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const UNIVERSAL_PATH = 'assets/data/lesson/universal-lesson-contract-v2.json';
const REGISTRY_PATH = 'assets/data/lesson/lesson-type-registry-v1.json';
const MASTERY_PATH = 'assets/data/lesson/master-ready-policy-v1.json';
const VISUAL_PATH = 'assets/data/lesson/visual-teaching-contract-v1.json';
const ROADMAP_PATH = 'assets/data/roadmap/iu5-090401-11-v3.json';
const HOOKS_PATH = 'assets/data/lesson/language-layer-hooks-v1.json';
const DOC_PATH = 'docs/migration/L6_B7_LANGUAGE_LAYER_HOOKS.md';
const REPORT_PATH = 'docs/migration/L6_B7_LANGUAGE_LAYER_REGRESSION.generated.json';
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

for (const file of [
  UNIVERSAL_PATH,
  REGISTRY_PATH,
  MASTERY_PATH,
  VISUAL_PATH,
  ROADMAP_PATH,
  HOOKS_PATH,
  DOC_PATH,
  'subjects/russian/data/lessons.json',
  'subjects/russian/assets/subject-adapter.js',
  'subjects/russian/subject-manifest.json',
  'subjects/research/data/lessons.json',
  'subjects/research/data/curriculum.json',
  'subjects/research/subject-manifest.json'
]) {
  check('FILE-' + file, 'required B7 input exists', fs.existsSync(absolute(file)), file);
}

if (failures.length) {
  console.error('L6-B7 regression cannot start because required inputs are missing.');
  console.error(failures.join('\n'));
  process.exit(2);
}

const universal = json(UNIVERSAL_PATH);
const registry = json(REGISTRY_PATH);
const mastery = json(MASTERY_PATH);
const visual = json(VISUAL_PATH);
const roadmap = json(ROADMAP_PATH);
const hooks = json(HOOKS_PATH);
const doc = read(DOC_PATH);
const hooksText = JSON.stringify(hooks);
const russianLessons = json('subjects/russian/data/lessons.json');
const researchLessons = json('subjects/research/data/lessons.json');
const researchCurriculum = json('subjects/research/data/curriculum.json');
const typeIds = Object.keys(registry.types || {});
const profileIds = Object.keys(hooks.typeProfiles || {});

check(
  'HOOKS-IDENTITY',
  'language layer contract identity version and status are explicit',
  hooks.contractId === 'bauman-language-layer-hooks'
    && hooks.contractVersion === '1.0.0'
    && hooks.status === 'L6-B7-CONTRACT',
  {
    contractId: hooks.contractId,
    contractVersion: hooks.contractVersion,
    status: hooks.status
  }
);
check(
  'UNIVERSAL-REF',
  'B7 references the exact B2 Universal Lesson language namespace',
  hooks.universalLessonContractRef.path === UNIVERSAL_PATH
    && hooks.universalLessonContractRef.contractId === universal.contractId
    && hooks.universalLessonContractRef.schemaVersion === universal.schemaVersion
    && hooks.universalLessonContractRef.extensionNamespace === 'language',
  hooks.universalLessonContractRef
);
check(
  'REGISTRY-REF',
  'B7 references the exact B4 lesson type registry',
  hooks.typeRegistryRef.path === REGISTRY_PATH
    && hooks.typeRegistryRef.registryId === registry.registryId
    && hooks.typeRegistryRef.registryVersion === registry.registryVersion,
  hooks.typeRegistryRef
);
check(
  'MASTERY-REF',
  'B7 references the exact B5 Master-ready policy',
  hooks.masterReadyPolicyRef.path === MASTERY_PATH
    && hooks.masterReadyPolicyRef.policyId === mastery.policyId
    && hooks.masterReadyPolicyRef.policyVersion === mastery.policyVersion,
  hooks.masterReadyPolicyRef
);
check(
  'VISUAL-REF',
  'B7 references the exact B6 visual teaching contract',
  hooks.visualTeachingContractRef.path === VISUAL_PATH
    && hooks.visualTeachingContractRef.contractId === visual.contractId
    && hooks.visualTeachingContractRef.contractVersion === visual.contractVersion,
  hooks.visualTeachingContractRef
);
check(
  'ROADMAP-REF',
  'B7 references the exact Roadmap V3 identity',
  hooks.roadmapRef.path === ROADMAP_PATH
    && hooks.roadmapRef.roadmapId === roadmap.id
    && hooks.roadmapRef.schemaVersion === roadmap.schemaVersion,
  hooks.roadmapRef
);

const languageNamespace = universal.extensionNamespaces?.language;
check(
  'RESERVED-B2-HOOKS',
  'B2 reserved the four language hook fields and B7/L12 activation boundary',
  containsAll(languageNamespace?.reservedFields, [
    'russianTwinRef',
    'englishResearchRef',
    'vietnameseRescuePolicyRef',
    'exposurePolicyRef'
  ])
    && languageNamespace.activationRound === 'L6-B7-and-L12',
  languageNamespace
);

const principleIds = (hooks.principles || []).map((item) => item.id);
check(
  'PRINCIPLES',
  'B7 principles cover companion latent source type rescue research AI assessment and offline boundaries',
  sameSet(principleIds, [
    'companion-not-copy',
    'latent-by-default',
    'source-language-preserved',
    'subject-type-preserved',
    'rescue-not-mastery',
    'research-english-not-ui-english',
    'ai-draft-not-source',
    'assessment-integrity',
    'offline-usable'
  ])
    && hooks.principles.every((item) => item.rule.length > 90),
  principleIds
);
check(
  'NOT-TRANSLATED-COPY',
  'hook is a source-aligned companion without duplicate lesson or progress',
  /not a duplicate lesson/.test(
    hooks.principles.find((item) => item.id === 'companion-not-copy').rule
  )
    && /never overwrites authoritative text/.test(
      hooks.principles.find((item) => item.id === 'source-language-preserved').rule
    )
    && /second source-lesson completion flag/.test(hooks.hookEnvelope.stateRule),
  {
    companion: hooks.principles.find((item) => item.id === 'companion-not-copy'),
    stateRule: hooks.hookEnvelope.stateRule
  }
);
check(
  'PRIMARY-TYPE-PRESERVED',
  'language support never reclassifies a technical lesson or merges language blocks',
  /never changes a mathematics/.test(
    hooks.principles.find((item) => item.id === 'subject-type-preserved').rule
  )
    && /never changes the primary lesson type/.test(
      hooks.typeProfileContract.secondaryFacetRule
    )
    && /blind-merges/.test(hooks.typeProfileContract.secondaryFacetRule),
  hooks.typeProfileContract.secondaryFacetRule
);

const activation = hooks.activationContract;
check(
  'LATENT-DEFAULT',
  'B7 is declared hidden and not auto-activated before L12',
  activation.declarationRound === 'L6-B7'
    && activation.fullLearnerUiRound === 'L12'
    && activation.defaultState === 'declared'
    && activation.defaultVisibility === 'hidden-until-resolved'
    && activation.autoActivate === false,
  activation
);
check(
  'ACTIVATION-STATES',
  'activation separates declared available recommended active deferred and unavailable',
  sameSet(activation.states, [
    'declared',
    'available',
    'recommended',
    'active',
    'deferred',
    'unavailable'
  ]),
  activation.states
);
check(
  'ACTIVATION-AUTHORITY',
  'only learner instructor or deterministic plan activates while AI only recommends',
  sameSet(activation.authorizedActivators, [
    'learner-explicit-choice',
    'instructor-assignment',
    'deterministic-study-plan'
  ])
    && containsAll(activation.recommendationActors, [
      'deterministic-context-resolver',
      'ai-advisory'
    ])
    && !activation.authorizedActivators.includes('ai-advisory'),
  {
    authorized: activation.authorizedActivators,
    recommenders: activation.recommendationActors
  }
);
const availableContextRefs = [
  ...universal.contextReferenceContract.requiredRefs,
  ...universal.contextReferenceContract.optionalRefs
];
check(
  'ACTIVATION-CONTEXT',
  'resolver inputs are available in the B2 context contract',
  activation.requiredResolverInputs.every((ref) => availableContextRefs.includes(ref)),
  {
    inputs: activation.requiredResolverInputs,
    available: availableContextRefs
  }
);
check(
  'DEFER-NONBLOCKING',
  'plan activation is deferable and missing alignment never blocks source lesson',
  activation.rules.some((rule) => /immediate learner defer control/.test(rule))
    && activation.rules.some((rule) => /never blocks the source lesson/.test(rule))
    && activation.rules.some((rule) => /cannot activate a hook/.test(rule)),
  activation.rules
);

const languageRoles = hooks.languageRoleContract;
check(
  'LANGUAGE-CODES',
  'language layer uses explicit Vietnamese Russian and English codes',
  sameSet(languageRoles.languageCodes, ['vi', 'ru', 'en']),
  languageRoles.languageCodes
);
check(
  'LANGUAGE-ROLES',
  'source learning support and target output roles are explicit',
  sameSet(languageRoles.roles, [
    'sourceLanguage',
    'primaryLearningLanguage',
    'supportLanguages',
    'targetOutputLanguage'
  ])
    && containsAll(languageRoles.requiredFields, [
      'sourceLanguage',
      'primaryLearningLanguage',
      'supportLanguages',
      'targetOutputLanguage',
      'script',
      'locale',
      'fallbackOrder'
    ]),
  languageRoles
);
check(
  'LANGUAGE-ROLE-INVARIANTS',
  'Russian and English target roles preserve source identity and assessment',
  languageRoles.rules.some((rule) => /Russian Twin normally targets ru/.test(rule))
    && languageRoles.rules.some((rule) => /English Research normally targets en/.test(rule))
    && languageRoles.rules.some((rule) => /never changes source identity/.test(rule)),
  languageRoles.rules
);

check(
  'HOOK-ENVELOPE',
  'hook envelope binds identity objectives sources alignment roles activation exposure evidence offline and provenance',
  containsAll(hooks.hookEnvelope.requiredFields, [
    'hookId',
    'hookKind',
    'lessonId',
    'subjectId',
    'lessonType',
    'objectiveRefs',
    'sourceBindings',
    'alignmentRefs',
    'languageRoles',
    'activationPolicyRef',
    'exposurePolicyRef',
    'evidenceRefs',
    'offlineRef',
    'provenance'
  ])
    && sameSet(hooks.hookEnvelope.hookKinds, ['russian-twin', 'english-research'])
    && /never identity/.test(hooks.hookEnvelope.identityRule)
    && /never exists only to fill/.test(hooks.hookEnvelope.objectiveRule),
  hooks.hookEnvelope
);

const alignment = hooks.alignmentContract;
check(
  'ALIGNMENT-FIELDS',
  'alignment binds source concepts language text outputs tokens review version and provenance',
  containsAll(alignment.requiredFields, [
    'alignmentId',
    'hookId',
    'sourceAnchorRefs',
    'conceptRefs',
    'unitKind',
    'languageRoles',
    'sourceTextRefs',
    'alignedOutputRefs',
    'protectedTokenRefs',
    'reviewStatus',
    'contentVersion',
    'provenance'
  ]),
  alignment.requiredFields
);
check(
  'ALIGNMENT-UNITS',
  'alignment covers terms claims steps instructions language technical research and defense units',
  sameSet(alignment.unitKinds, [
    'term',
    'definition',
    'claim',
    'worked-step',
    'instruction',
    'dialogue-turn',
    'formula-narration',
    'code-or-query-explanation',
    'research-section',
    'defense-prompt'
  ]),
  alignment.unitKinds
);
check(
  'ALIGNMENT-REVIEW-STATES',
  'AI draft source alignment instructor review official original and repair are distinct',
  sameSet(alignment.reviewStatuses, [
    'unreviewed-ai-draft',
    'source-aligned',
    'instructor-reviewed',
    'official-source-original',
    'needs-repair'
  ]),
  alignment.reviewStatuses
);
check(
  'ALIGNMENT-PROVENANCE',
  'AI draft cannot become source and source changes invalidate incompatible alignment',
  alignment.rules.some((rule) => /stays unreviewed-ai-draft/.test(rule))
    && alignment.rules.some((rule) => /never an AI or learner translation/.test(rule))
    && alignment.rules.some((rule) => /creates needs-repair/.test(rule))
    && alignment.rules.some((rule) => /reported as unavailable instead of fabricated/.test(rule)),
  alignment.rules
);

const reviewAuthority = hooks.reviewAuthorityContract;
check(
  'ALIGNMENT-REVIEW-AUTHORITY',
  'alignment review actors have exact bounded status authority',
  sameSet(Object.keys(reviewAuthority.actors || {}), [
    'deterministic-source-importer',
    'curriculum-curator',
    'instructor-review',
    'system-integrity-check',
    'learner-contribution',
    'ai-advisory'
  ])
    && sameSet(
      reviewAuthority.actors['deterministic-source-importer'].maySetStatuses,
      ['official-source-original']
    )
    && sameSet(
      reviewAuthority.actors['curriculum-curator'].maySetStatuses,
      ['source-aligned', 'needs-repair']
    )
    && sameSet(
      reviewAuthority.actors['instructor-review'].maySetStatuses,
      ['source-aligned', 'instructor-reviewed', 'needs-repair']
    )
    && sameSet(
      reviewAuthority.actors['system-integrity-check'].maySetStatuses,
      ['needs-repair']
    )
    && reviewAuthority.actors['learner-contribution'].maySetStatuses.length === 0
    && sameSet(
      reviewAuthority.actors['ai-advisory'].maySetStatuses,
      ['unreviewed-ai-draft']
    ),
  reviewAuthority.actors
);
check(
  'ALIGNMENT-NOT-MASTERY',
  'alignment review cannot verify learner competence or bypass B5',
  reviewAuthority.rules.some((rule) => /not learner competence/.test(rule))
    && reviewAuthority.rules.some((rule) => /separate authorized B5 verifier/.test(rule))
    && /cannot promote itself/.test(reviewAuthority.actors['ai-advisory'].condition),
  reviewAuthority.rules
);

const protectedTokens = hooks.protectedTokenContract;
const expectedTokenCategories = [
  'code-identifier',
  'api-symbol',
  'sql-keyword',
  'formula-symbol',
  'dataset-field',
  'citation-key',
  'file-path',
  'version-id',
  'official-program-code',
  'official-course-title'
];
check(
  'PROTECTED-TOKEN-CATEGORIES',
  'technical citation version and official identity tokens are protected',
  sameSet(protectedTokens.categories, expectedTokenCategories),
  protectedTokens.categories
);
check(
  'PROTECTED-TOKEN-HANDLING',
  'protected tokens carry identity source handling and review',
  containsAll(protectedTokens.requiredFields, [
    'tokenId',
    'category',
    'surface',
    'sourceRef',
    'handling',
    'reviewStatus'
  ])
    && sameSet(protectedTokens.handlingValues, [
      'preserve-exact',
      'preserve-plus-explanation',
      'localized-label-with-original',
      'review-required'
    ]),
  protectedTokens
);
check(
  'PROGRAM-CODE-TOKENS',
  'official and personalized Bauman program codes remain distinct',
  protectedTokens.identityRules.some((rule) => /09\.04\.01 in source metadata/.test(rule))
    && protectedTokens.identityRules.some((rule) => /ИУ-5 · 09\.04\.01\/11/.test(rule)),
  protectedTokens.identityRules
);

const glossary = hooks.glossaryContract;
check(
  'GLOSSARY-FIELDS',
  'glossary binds concept subject languages sources false friends review version and provenance',
  containsAll(glossary.requiredFields, [
    'termId',
    'conceptRef',
    'subjectRefs',
    'terms',
    'usageContexts',
    'sourceRefs',
    'falseFriendRefs',
    'reviewStatus',
    'contentVersion',
    'provenance'
  ])
    && sameSet(glossary.termLanguages, ['vi', 'ru', 'en']),
  glossary
);
check(
  'GLOSSARY-TYPED-FIELDS',
  'Russian and English research glossary fields remain domain-specific',
  containsAll(glossary.russianOptionalFields, [
    'stress',
    'gender',
    'casePattern',
    'aspect',
    'collocations',
    'pronunciationRef'
  ])
    && containsAll(glossary.englishResearchOptionalFields, [
      'searchSynonyms',
      'paperSectionUsage',
      'claimStrength',
      'collocations',
      'citationUsageNote'
    ]),
  {
    russian: glossary.russianOptionalFields,
    englishResearch: glossary.englishResearchOptionalFields
  }
);
check(
  'GLOSSARY-SOURCE-BOUNDARY',
  'glossary aligns by concept and preserves missing shared and personal entries',
  glossary.rules.some((rule) => /never through surface-string equality alone/.test(rule))
    && glossary.rules.some((rule) => /remains missing/.test(rule))
    && glossary.rules.some((rule) => /never overwrite the shared glossary/.test(rule)),
  glossary.rules
);

const russian = hooks.russianTwin;
const expectedRussianModes = [
  'technical-terminology',
  'concept-twin',
  'worked-step-narration',
  'classroom-dialogue',
  'lab-report-language',
  'error-repair-language',
  'oral-defense',
  'nir-vkr-register'
];
check(
  'RUSSIAN-TWIN-IDENTITY',
  'Russian Twin has Russian target and Vietnamese rescue defaults',
  russian.hookId === 'russian-twin'
    && russian.targetLanguage === 'ru'
    && russian.supportLanguageDefault === 'vi',
  {
    hookId: russian.hookId,
    targetLanguage: russian.targetLanguage,
    supportLanguageDefault: russian.supportLanguageDefault
  }
);
check(
  'RUSSIAN-TWIN-MODES',
  'Russian Twin modes cover terminology concept steps classroom lab repair defense and NIR/VKR register',
  sameSet(russian.modes, expectedRussianModes),
  russian.modes
);
check(
  'RUSSIAN-TWIN-UNIT',
  'Russian Twin unit binds source Russian rescue terminology action evidence review and offline',
  containsAll(russian.requiredTwinUnitFields, [
    'twinUnitId',
    'sourceLessonRef',
    'sourceAnchorRefs',
    'mode',
    'ruOutputRef',
    'viRescueRef',
    'terminologyRefs',
    'learnerAction',
    'evidenceKind',
    'reviewStatus',
    'offlineRef'
  ]),
  russian.requiredTwinUnitFields
);
check(
  'RUSSIAN-EXPOSURE',
  'Russian exposure progresses recognition comprehension retrieval production defense',
  russian.exposureSequence.join('->') === 'recognize->comprehend->retrieve->produce->defend',
  russian.exposureSequence
);
check(
  'RUSSIAN-ENGINE-OWNERSHIP',
  'Russian engine retains specialist tools and missing alignment is nonblocking',
  russian.rules.some((rule) => /dedicated Russian engine owns dialogue/.test(rule))
    && russian.rules.some((rule) => /not a machine-translated clone/.test(rule))
    && russian.rules.some((rule) => /No hook activates when source alignment is missing/.test(rule)),
  russian.rules
);

const english = hooks.englishResearchLayer;
const expectedEnglishModes = [
  'search-query',
  'paper-reading',
  'claim-evidence-annotation',
  'methods-results-language',
  'citation-paraphrase-boundary',
  'scientific-writing',
  'conference-defense',
  'reproducibility-readme'
];
check(
  'ENGLISH-RESEARCH-IDENTITY',
  'English Research has English target and Vietnamese Russian support defaults',
  english.hookId === 'english-research'
    && english.targetLanguage === 'en'
    && sameSet(english.supportLanguageDefaults, ['vi', 'ru']),
  {
    hookId: english.hookId,
    targetLanguage: english.targetLanguage,
    supportLanguageDefaults: english.supportLanguageDefaults
  }
);
check(
  'ENGLISH-RESEARCH-MODES',
  'English Research modes cover search papers claims methods citations writing defense and reproducibility',
  sameSet(english.modes, expectedEnglishModes),
  english.modes
);
check(
  'ENGLISH-RESEARCH-UNIT',
  'English Research unit binds research/source context output terminology action evidence claims review and offline',
  containsAll(english.requiredResearchUnitFields, [
    'researchUnitId',
    'sourceLessonRef',
    'researchContextRef',
    'sourceAnchorRefs',
    'mode',
    'enInputOrOutputRef',
    'terminologyRefs',
    'learnerAction',
    'evidenceKind',
    'claimSourceBoundaryRef',
    'reviewStatus',
    'offlineRef'
  ]),
  english.requiredResearchUnitFields
);
check(
  'ENGLISH-NOT-SITE-LOCALE',
  'English Research is scoped and cannot fabricate or mask invalid research',
  english.rules.some((rule) => /not a whole-site locale/.test(rule))
    && english.rules.some((rule) => /never synthesized/.test(rule))
    && english.rules.some((rule) => /cannot compensate for invalid research/.test(rule)),
  english.rules
);

const exposure = hooks.exposurePolicy;
check(
  'EXPOSURE-LEVELS',
  'exposure progresses hidden term rescue aligned guided and independent output',
  exposure.levels.join('->') === [
    'hidden',
    'term-only',
    'term-plus-rescue',
    'aligned-snippet',
    'guided-output',
    'independent-output'
  ].join('->'),
  exposure.levels
);
check(
  'RESCUE-BOUNDARY',
  'rescue reduces for independent output and cannot bypass assessment or script',
  exposure.rules.some((rule) => /progressively reduced/.test(rule))
    && exposure.rules.some((rule) => /capped by the active disclosure policy/.test(rule))
    && exposure.rules.some((rule) => /never replaces required Cyrillic/.test(rule)),
  exposure.rules
);

const evidence = hooks.evidenceBoundary;
check(
  'NON-EVIDENCE-EVENTS',
  'open view rescue and feedback events are explicitly non-evidence',
  sameSet(evidence.nonEvidenceEvents, [
    'hook-opened',
    'term-viewed',
    'rescue-used',
    'feedback-received'
  ])
    && evidence.nonEvidenceEvents.every((event) => evidence.hookEventKinds.includes(event)),
  evidence
);
check(
  'MASTERY-EVIDENCE-BOUNDARY',
  'only mapped learner artifacts verified by B5 can project to mastery',
  /named objective maps it to a registered type evidence output/.test(evidence.verificationRule)
    && /authorized B5 verifier/.test(evidence.verificationRule)
    && /does not create language mastery/.test(evidence.supportRule)
    && /does not verify research validity/.test(evidence.supportRule),
  evidence
);

const assessment = hooks.assessmentContract;
check(
  'ASSESSMENT-DIMENSIONS',
  'assessment separates domain source comprehension production terminology and register',
  sameSet(assessment.dimensions, [
    'domain-correctness',
    'source-integrity',
    'target-language-comprehension',
    'target-language-production',
    'terminology-accuracy',
    'register-and-defense'
  ]),
  assessment.dimensions
);
check(
  'ASSESSMENT-INTEGRITY',
  'language support cannot fake production or reveal protected answers',
  assessment.rules.some((rule) => /remain separate rubric dimensions/.test(rule))
    && assessment.rules.some((rule) => /cannot satisfy target-language production/.test(rule))
    && assessment.rules.some((rule) => /unavailable to both hooks and AI before submission/.test(rule))
    && assessment.rules.some((rule) => /one focused language or domain repair/.test(rule)),
  assessment.rules
);

const ai = hooks.aiBoundary;
check(
  'AI-ALLOWED',
  'AI may recommend draft explain search diagnose repair and simulate practice',
  sameSet(ai.allowedActions, [
    'recommend-hook',
    'draft-alignment',
    'explain-term',
    'suggest-search-query',
    'diagnose-language-error',
    'suggest-source-linked-repair',
    'simulate-unverified-oral-practice'
  ]),
  ai.allowedActions
);
check(
  'AI-FORBIDDEN',
  'AI cannot activate overwrite promote fabricate verify leak or change roles',
  sameSet(ai.forbiddenActions, [
    'auto-activate-hook',
    'overwrite-source-text',
    'promote-ai-draft-to-source',
    'fabricate-paper-or-citation',
    'set-verified',
    'reveal-protected-answer',
    'silently-change-language-role'
  ]),
  ai.forbiddenActions
);
check(
  'AI-CONTEXT',
  'AI requires all B2 current lesson learner schedule language and NIR/VKR refs',
  sameSet(ai.requiredContextRefs, universal.contextReferenceContract.requiredRefs),
  {
    B7: ai.requiredContextRefs,
    B2: universal.contextReferenceContract.requiredRefs
  }
);
check(
  'AI-PROVENANCE-OFFLINE',
  'AI stays inference with source review and no queued offline verification',
  /ai-inference/.test(ai.provenanceRule)
    && /source refs/.test(ai.provenanceRule)
    && /without queued AI verification/.test(ai.offlineFallbackRule),
  ai
);

check(
  'OFFLINE-CLASSES',
  'B7 offline classes match B4 and B6',
  sameSet(hooks.offlineContract.resourceClasses, ['bundled', 'subject-pack', 'local-file'])
    && sameSet(hooks.offlineContract.resourceClasses, visual.offlineContract.resourceClasses),
  hooks.offlineContract.resourceClasses
);
check(
  'OFFLINE-BEHAVIOR',
  'offline alignment uses explicit packs zero-copy optional services and stable reconciliation',
  hooks.offlineContract.rules.some((rule) => /deterministic lookup offline/.test(rule))
    && hooks.offlineContract.rules.some((rule) => /explicit subject-pack or local-file/.test(rule))
    && hooks.offlineContract.rules.some((rule) => /optional services/.test(rule))
    && hooks.offlineContract.rules.some((rule) => /zero-copy/.test(rule))
    && hooks.offlineContract.rules.some((rule) => /stable hook alignment and evidence IDs/.test(rule)),
  hooks.offlineContract.rules
);

check(
  'ACCESSIBILITY-FIELDS',
  'B7 accessibility binds language script order reader transcript keyboard scaling and fallback',
  containsAll(hooks.accessibilityContract.requiredFields, [
    'languageTag',
    'script',
    'readingOrder',
    'screenReaderLabel',
    'transcriptRef',
    'keyboardPath',
    'textScalingBehavior',
    'fallbackRef'
  ]),
  hooks.accessibilityContract.requiredFields
);
check(
  'ACCESSIBILITY-BEHAVIOR',
  'mixed scripts stack accessibly with transcript controls text semantics and token boundaries',
  hooks.accessibilityContract.rules.some((rule) => /declares language and script/.test(rule))
    && hooks.accessibilityContract.rules.some((rule) => /source then companion then learner-action/.test(rule))
    && hooks.accessibilityContract.rules.some((rule) => /not color alone/.test(rule))
    && hooks.accessibilityContract.rules.some((rule) => /Audio has transcript/.test(rule))
    && hooks.accessibilityContract.rules.some((rule) => /retain explicit language or token boundaries/.test(rule)),
  hooks.accessibilityContract.rules
);

check(
  'PROFILE-SET',
  'B7 has exactly one language hook profile for every B4 lesson type',
  sameSet(profileIds, typeIds),
  { profiles: profileIds, types: typeIds }
);
const requiredProfileFields = hooks.typeProfileContract.requiredFields;
const tokenSet = new Set(protectedTokens.categories);
const russianModeSet = new Set(russian.modes);
const englishModeSet = new Set(english.modes);
const profileSummaries = {};
const profileErrors = {};

for (const typeId of typeIds) {
  const profile = hooks.typeProfiles[typeId];
  const registryType = registry.types[typeId];
  const errors = [];
  for (const field of requiredProfileFields) {
    if (!Object.prototype.hasOwnProperty.call(profile || {}, field)) {
      errors.push('missing ' + field);
    }
  }
  if (!profile) {
    errors.push('missing profile');
  } else {
    if (profile.typeId !== typeId) errors.push('typeId mismatch');
    if (!Array.isArray(profile.russianTwinModes) || profile.russianTwinModes.length < 4) {
      errors.push('too few Russian modes');
    }
    for (const mode of profile.russianTwinModes || []) {
      if (!russianModeSet.has(mode)) errors.push('unknown Russian mode ' + mode);
    }
    if (!Array.isArray(profile.englishResearchModes)
      || profile.englishResearchModes.length < 4) {
      errors.push('too few English modes');
    }
    for (const mode of profile.englishResearchModes || []) {
      if (!englishModeSet.has(mode)) errors.push('unknown English mode ' + mode);
    }
    const evidenceOutputs = new Set(registryType.evidenceOutputs || []);
    if (!Array.isArray(profile.masteryProjectionRefs)
      || profile.masteryProjectionRefs.length < 3) {
      errors.push('too few mastery projection refs');
    }
    for (const output of profile.masteryProjectionRefs || []) {
      if (!evidenceOutputs.has(output)) errors.push('unknown evidence output ' + output);
    }
    if (!Array.isArray(profile.protectedTokenCategories)
      || profile.protectedTokenCategories.length < 3) {
      errors.push('too few protected token categories');
    }
    for (const category of profile.protectedTokenCategories || []) {
      if (!tokenSet.has(category)) errors.push('unknown protected token ' + category);
    }
    if (typeof profile.activationNotes !== 'string' || profile.activationNotes.length < 120) {
      errors.push('activation notes too short');
    }
    if (registryType.forwardRefs.languageHooks !== 'L6-B7#' + typeId) {
      errors.push('B4 language hook forward ref mismatch');
    }
  }
  profileErrors[typeId] = errors;
  profileSummaries[typeId] = profile ? {
    russianTwinModes: profile.russianTwinModes,
    englishResearchModes: profile.englishResearchModes,
    masteryProjectionRefs: profile.masteryProjectionRefs,
    protectedTokenCategories: profile.protectedTokenCategories,
    activationNotes: profile.activationNotes,
    errors
  } : { errors };
  check(
    'PROFILE-' + typeId.toUpperCase(),
    typeId + ' uses registered language modes evidence outputs tokens and B4 forward ref',
    errors.length === 0,
    profileSummaries[typeId]
  );
}

check(
  'LANGUAGE-RUSSIAN-COVERAGE',
  'language type permits the complete Russian Twin vocabulary',
  sameSet(hooks.typeProfiles.language.russianTwinModes, russian.modes),
  hooks.typeProfiles.language.russianTwinModes
);
check(
  'ML-ENGLISH-COVERAGE',
  'ML data permits the complete English Research vocabulary',
  sameSet(hooks.typeProfiles['ml-data'].englishResearchModes, english.modes),
  hooks.typeProfiles['ml-data'].englishResearchModes
);
check(
  'RESEARCH-ENGLISH-COVERAGE',
  'research permits the complete English Research vocabulary and NIR/VKR Russian register',
  sameSet(hooks.typeProfiles.research.englishResearchModes, english.modes)
    && hooks.typeProfiles.research.russianTwinModes.includes('nir-vkr-register'),
  hooks.typeProfiles.research
);

const russianReference = hooks.referenceCompatibility.russian;
const researchReference = hooks.referenceCompatibility.research;
check(
  'RUSSIAN-REFERENCE-MODE',
  'Russian remains read-only and unprojected with specialist ownership',
  russianReference.mode === 'read-only-reference-unprojected'
    && /Russian engine retains/.test(russianReference.ownership),
  russianReference
);
check(
  'RUSSIAN-REFERENCE-COUNTS',
  'Russian keeps 26 lessons and Russian titles',
  russianLessons.length === russianReference.auditedExpectations.lessonCount
    && russianLessons.filter((lesson) => typeof lesson.ruTitle === 'string' && lesson.ruTitle).length
      === russianReference.auditedExpectations.ruTitleCount,
  {
    lessons: russianLessons.length,
    ruTitles: russianLessons.filter((lesson) => lesson.ruTitle).length
  }
);
check(
  'RESEARCH-REFERENCE-MODE',
  'Research remains a read-only light subject and B7 only declares hooks',
  researchReference.mode === 'read-only-light-subject-unprojected'
    && /B7 only declares aligned language hooks/.test(researchReference.ownership),
  researchReference
);
const researchVersions = Array.from(new Set(
  researchLessons.map((lesson) => lesson.eLearning?.lessonContractVersion).filter(Boolean)
));
check(
  'RESEARCH-REFERENCE-COUNTS',
  'Research keeps 45 eLearning v1.1 lessons and staged curriculum',
  researchLessons.length === researchReference.auditedExpectations.lessonCount
    && researchLessons.every((lesson) =>
      lesson.eLearning?.lessonContractVersion
        === researchReference.auditedExpectations.lessonContractVersion
    )
    && Array.isArray(researchCurriculum.modules)
    && researchCurriculum.modules.length >= 10,
  {
    lessons: researchLessons.length,
    versions: researchVersions,
    curriculumModules: researchCurriculum.modules?.length
  }
);

const roadmapText = JSON.stringify(roadmap);
check(
  'ROADMAP-HOOK-MODULES',
  'Roadmap retains Russian Twin methodology and research thesis modules',
  hooks.referenceCompatibility.roadmap.requiredModules.every((item) =>
    roadmapText.includes(item)
  ),
  hooks.referenceCompatibility.roadmap.requiredModules
);
check(
  'ROADMAP-PRIORITY-SIGNALS',
  'Roadmap priority engine retains NIR/VKR and matching Russian technical',
  hooks.referenceCompatibility.roadmap.requiredPrioritySignals.every((item) =>
    roadmap.priorityEngine.includes(item)
  ),
  roadmap.priorityEngine
);

const referenceHashes = {};
for (const [id, reference] of Object.entries({
  russian: russianReference,
  research: researchReference
})) {
  referenceHashes[id] = {};
  for (const sourcePath of reference.sourcePaths) {
    const exists = fs.existsSync(absolute(sourcePath));
    if (exists) referenceHashes[id][sourcePath] = sha256(sourcePath);
    check(
      'REFERENCE-' + id.toUpperCase() + '-' + sourcePath,
      id + ' reference source exists and is hashable',
      exists,
      exists ? referenceHashes[id][sourcePath] : sourcePath
    );
  }
}

check(
  'PROGRAM-IDENTITY',
  'B7 inherits exact official and personalized Bauman identity',
  universal.programIdentity.department === 'ИУ-5'
    && universal.programIdentity.officialPublishedDirectionCode === '09.04.01'
    && universal.programIdentity.personalizedDisplayCode === '09.04.01/11'
    && roadmap.officialPublishedDirectionCode === '09.04.01'
    && roadmap.displayCode === '09.04.01/11'
    && hooks.programIdentityRef === UNIVERSAL_PATH + '#programIdentity',
  {
    contract: universal.programIdentity,
    roadmap: {
      official: roadmap.officialPublishedDirectionCode,
      display: roadmap.displayCode
    }
  }
);
const comparisonLabel = ['hu', 'tech'].join('');
check(
  'LEARNER-BRAND-BOUNDARY',
  'B7 contract and decision record contain no comparison-school learner label',
  !hooksText.toLowerCase().includes(comparisonLabel)
    && !doc.toLowerCase().includes(comparisonLabel),
  universal.programIdentity.learnerBrandPolicy
);

check(
  'FORWARD-OWNERSHIP',
  'B7 leaves schema factory renderer regression multilingual UI and AI runtime forward work explicit',
  ['L6-B8', 'L6-B9', 'L6-B10', 'L6-B11', 'L12', 'L13'].every(
    (step) => Object.prototype.hasOwnProperty.call(hooks.forwardOwnership, step)
  )
    && /does not claim translated content coverage/.test(hooks.forwardOwnership.rule),
  hooks.forwardOwnership
);
check(
  'ROLLBACK',
  'B7 rollback has no learner-state or legacy-runtime impact',
  hooks.rollback.learnerStateImpact === 'none'
    && hooks.rollback.legacyRuntimeImpact === 'none'
    && /B6 checkpoint/.test(hooks.rollback.scope),
  hooks.rollback
);
check(
  'DOC-COVERAGE',
  'B7 decision record covers audit activation roles alignment tokens glossary layers exposure evidence assessment AI offline profiles compatibility rollback and acceptance',
  [
    'Audit baseline',
    'Companion, not translated copy',
    'Latent activation contract',
    'Language roles',
    'Hook and alignment envelopes',
    'Protected technical tokens',
    'Trilingual glossary hook',
    'Russian Twin',
    'English Research Layer',
    'Exposure and Vietnamese rescue',
    'Evidence boundary',
    'Assessment dimensions',
    'AI grounding and authority',
    'Offline and accessibility behavior',
    'Eight type profiles',
    'Compatibility and forward ownership',
    'Rollback',
    'Acceptance'
  ].every((heading) => doc.includes(heading)),
  DOC_PATH
);

const report = {
  schema: 'L6_B7_LANGUAGE_LAYER_REGRESSION_V1',
  contractId: hooks.contractId,
  contractVersion: hooks.contractVersion,
  universalContractVersion: universal.schemaVersion,
  typeRegistryVersion: registry.registryVersion,
  masterReadyPolicyVersion: mastery.policyVersion,
  visualTeachingContractVersion: visual.contractVersion,
  roadmapVersion: roadmap.schemaVersion,
  activation: {
    declarationRound: activation.declarationRound,
    fullLearnerUiRound: activation.fullLearnerUiRound,
    defaultState: activation.defaultState,
    defaultVisibility: activation.defaultVisibility,
    autoActivate: activation.autoActivate,
    states: activation.states,
    authorizedActivators: activation.authorizedActivators,
    recommendationActors: activation.recommendationActors
  },
  languageCodes: languageRoles.languageCodes,
  alignmentReviewStatuses: alignment.reviewStatuses,
  protectedTokenCategories: protectedTokens.categories,
  russianTwinModes: russian.modes,
  englishResearchModes: english.modes,
  exposureLevels: exposure.levels,
  profileSummaries,
  profileErrors,
  referenceMetrics: {
    russianLessons: russianLessons.length,
    russianTitles: russianLessons.filter((lesson) => lesson.ruTitle).length,
    researchLessons: researchLessons.length,
    researchContractVersions: researchVersions,
    researchCurriculumModules: researchCurriculum.modules?.length || 0
  },
  referenceHashes,
  checks,
  failures,
  result: failures.length ? 'FAIL' : 'PASS'
};

fs.mkdirSync(path.dirname(absolute(REPORT_PATH)), { recursive: true });
fs.writeFileSync(absolute(REPORT_PATH), JSON.stringify(report, null, 2) + '\n');

console.log(
  'L6-B7 language layer regression: '
    + checks.length
    + ' checks, '
    + failures.length
    + ' failure(s).'
);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(2);
}
console.log('L6-B7 language layer regression PASS.');
