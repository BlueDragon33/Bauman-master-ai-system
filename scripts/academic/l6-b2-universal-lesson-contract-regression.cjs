'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONTRACT_PATH = 'assets/data/lesson/universal-lesson-contract-v2.json';
const DOC_PATH = 'docs/migration/L6_B2_UNIVERSAL_LESSON_CONTRACT.md';
const B1_AUDIT_PATH = 'docs/migration/L6_B1_REFERENCE_IMPLEMENTATION_AUDIT.md';
const REPORT_PATH = 'docs/migration/L6_B2_UNIVERSAL_LESSON_CONTRACT.generated.json';
const checks = [];
const failures = [];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function json(file) {
  return JSON.parse(read(file));
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

for (const file of [CONTRACT_PATH, DOC_PATH, B1_AUDIT_PATH]) {
  check('FILE-' + file, 'required B2 input exists', fs.existsSync(path.join(ROOT, file)), file);
}

if (failures.length) {
  console.error('L6-B2 contract regression cannot start because required inputs are missing.');
  console.error(failures.join('\n'));
  process.exit(2);
}

const contract = json(CONTRACT_PATH);
const doc = read(DOC_PATH);
const b1Audit = read(B1_AUDIT_PATH);
const instance = contract.instanceContract || {};
const catalog = contract.semanticBlockCatalog || {};
const blockKinds = Object.keys(catalog);

check(
  'CONTRACT-IDENTITY',
  'contract identity and version are explicit',
  contract.contractId === 'bauman-universal-lesson-contract'
    && contract.schemaVersion === '2.0.0'
    && contract.status === 'L6-B2-CONTRACT',
  {
    contractId: contract.contractId,
    schemaVersion: contract.schemaVersion,
    status: contract.status
  }
);
check(
  'PROGRAM-IDENTITY',
  'official and personalized direction codes remain distinct',
  contract.programIdentity
    && contract.programIdentity.department === 'ИУ-5'
    && contract.programIdentity.officialPublishedDirectionCode === '09.04.01'
    && contract.programIdentity.personalizedDisplayCode === '09.04.01/11',
  contract.programIdentity
);
check(
  'B1-DECISIONS',
  'contract references all twelve B1 architecture decisions',
  containsAll(
    contract.designDecisionRefs,
    Array.from({ length: 12 }, (_, index) => 'D' + String(index + 1).padStart(2, '0'))
  ),
  contract.designDecisionRefs
);

const requiredTopLevel = [
  'metadata',
  'prerequisites',
  'objectives',
  'blocks',
  'masteryEvidence',
  'contextRefs',
  'offline',
  'provenance'
];
check(
  'INSTANCE-ENVELOPE',
  'instance envelope contains every required top-level learning field',
  containsAll(instance.requiredTopLevelFields, requiredTopLevel),
  instance.requiredTopLevelFields
);

const metadataFields = [
  'contractVersion',
  'lessonId',
  'subjectId',
  'lessonType',
  'titles',
  'stageId',
  'programIdentity',
  'sourceIdentity',
  'contentVersion'
];
check(
  'METADATA-CONTRACT',
  'metadata carries stable lesson subject type stage program and source identity',
  containsAll(instance.metadata && instance.metadata.requiredFields, metadataFields)
    && instance.metadata.fields
    && instance.metadata.fields.sourceIdentity
    && /Array position or sourcePath alone/.test(instance.metadata.fields.sourceIdentity.rule),
  instance.metadata && instance.metadata.requiredFields
);
check(
  'PREREQUISITE-CONTRACT',
  'prerequisite relations states and recovery behavior are explicit',
  containsAll(instance.prerequisites && instance.prerequisites.relations, [
    'requires',
    'recommended',
    'diagnostic',
    'co-requisite'
  ])
    && containsAll(instance.prerequisites && instance.prerequisites.requiredStates, [
      'introduced',
      'practised',
      'assessment-pass',
      'master-ready'
    ])
    && /recovery routes/.test(instance.prerequisites.resolutionRule),
  instance.prerequisites
);
check(
  'OBJECTIVE-CONTRACT',
  'objectives require observable evidence kinds',
  instance.objectives
    && instance.objectives.minimumItems === 1
    && containsAll(instance.objectives.itemRequiredFields, [
      'id',
      'statement',
      'evidenceKinds'
    ])
    && /observable evidence/.test(instance.objectives.rule),
  instance.objectives
);

const expectedBlockKinds = [
  'orientation',
  'concept-map',
  'theory',
  'worked-example',
  'exercise',
  'lab-simulation',
  'misconception',
  'visual-check',
  'oral',
  'review',
  'assessment',
  'mastery',
  'project-nir-evidence'
];
check(
  'BLOCK-CATALOG',
  'semantic catalog contains exactly the thirteen reviewed B2 block kinds',
  blockKinds.length === expectedBlockKinds.length
    && containsAll(blockKinds, expectedBlockKinds),
  blockKinds
);
check(
  'BLOCK-REQUIREDNESS-DEFERRED',
  'every block defers requiredness to profiles',
  blockKinds.every((kind) => catalog[kind].defaultRequirement === 'profile-defined')
    && !JSON.stringify(catalog).includes('requiredFor'),
  blockKinds.map((kind) => [kind, catalog[kind].defaultRequirement])
);
check(
  'BLOCK-PURPOSE',
  'every semantic block has purpose payload and evidence contracts',
  blockKinds.every((kind) =>
    typeof catalog[kind].purpose === 'string'
      && catalog[kind].purpose.length > 20
      && Array.isArray(catalog[kind].payloadFields)
      && catalog[kind].payloadFields.length >= 3
      && Array.isArray(catalog[kind].evidenceKinds)
      && catalog[kind].evidenceKinds.length >= 2
  ),
  blockKinds
);
check(
  'REQUESTED-THEORY-EXAMPLE-EXERCISE',
  'theory example and exercise contracts are present',
  catalog.theory
    && catalog['worked-example']
    && catalog.exercise
    && containsAll(catalog['worked-example'].payloadFields, [
      'problem',
      'steps',
      'result',
      'verification'
    ])
    && containsAll(catalog.exercise.payloadFields, [
      'prompt',
      'expectedArtifact',
      'solutionDisclosure'
    ]),
  ['theory', 'worked-example', 'exercise']
);
check(
  'REQUESTED-LAB-SIMULATION',
  'lab and simulation share a typed block without forcing both',
  catalog['lab-simulation']
    && containsAll(catalog['lab-simulation'].aliases, [
      'lab',
      'simulation',
      'interactive'
    ])
    && catalog['lab-simulation'].specialistCapabilityExamples.length >= 4,
  catalog['lab-simulation']
);
check(
  'REQUESTED-MISCONCEPTION-VISUAL',
  'misconception and visual-check contracts include diagnosis repair and accessibility',
  containsAll(catalog.misconception.payloadFields, [
    'wrongPattern',
    'likelyCause',
    'diagnostic',
    'repairRef'
  ])
    && containsAll(catalog['visual-check'].payloadFields, [
      'correctState',
      'incorrectState',
      'feedback',
      'accessibilityFallback'
    ]),
  ['misconception', 'visual-check']
);
check(
  'REQUESTED-ORAL-REVIEW',
  'oral and review contracts preserve specialist and retention evidence',
  catalog.oral.specialistCapabilityExamples.includes('shadowing')
    && catalog.oral.specialistCapabilityExamples.includes('professor-oral-defense')
    && catalog.review.evidenceKinds.includes('retention-check'),
  ['oral', 'review']
);
check(
  'REQUESTED-TEST',
  'assessment contract explicitly aliases test and exam',
  containsAll(catalog.assessment.aliases, ['test', 'exam'])
    && containsAll(catalog.assessment.payloadFields, [
      'attemptPolicy',
      'disclosureMode',
      'passPolicyRef',
      'remedialRef'
    ]),
  catalog.assessment
);
check(
  'REQUESTED-MASTERY',
  'mastery contract uses the five evidence stages',
  containsAll(catalog.mastery.evidenceKinds, [
    'understand',
    'solve',
    'build-apply',
    'explain',
    'retain'
  ]),
  catalog.mastery.evidenceKinds
);
check(
  'REQUESTED-PROJECT-NIR',
  'project NIR and VKR evidence is represented without global requiredness',
  containsAll(catalog['project-nir-evidence'].aliases, [
    'project-checkpoint',
    'nir-checkpoint',
    'vkr-checkpoint'
  ])
    && containsAll(catalog['project-nir-evidence'].evidenceKinds, [
      'project-artifact',
      'nir-milestone',
      'vkr-milestone'
    ]),
  catalog['project-nir-evidence']
);

check(
  'SOURCE-BINDING',
  'source binding combines artifact identity locator provenance adapter and precedence',
  containsAll(contract.sourceBindingContract.requiredFields, [
    'sourceArtifactId',
    'sourceArtifactKind',
    'sourceVersion',
    'locator',
    'origin',
    'adapterId',
    'precedence'
  ])
    && contract.sourceBindingContract.precedenceRule.length >= 5
    && /array index alone/.test(contract.sourceBindingContract.precedenceRule.join(' ')),
  contract.sourceBindingContract.requiredFields
);
check(
  'PROVENANCE-BOUNDARY',
  'provided source user system and AI origins remain distinguishable',
  containsAll(contract.sourceBindingContract.origins, [
    'provided-source',
    'user-provided',
    'system-derived',
    'ai-inference'
  ])
    && containsAll(instance.provenance.requiredFields, [
      'sourceRefs',
      'userEvidenceRefs',
      'systemDerivedRefs',
      'aiInferenceRefs'
    ]),
  contract.sourceBindingContract.origins
);
check(
  'BLOCK-ENVELOPE',
  'block envelope separates source payload presentation evidence and offline refs',
  containsAll(contract.blockEnvelope.requiredFields, [
    'id',
    'kind',
    'sourceBindings',
    'payload',
    'presentationHint',
    'evidenceRefs',
    'offlineRef'
  ])
    && contract.blockEnvelope.fields.presentationHint.binding === 'non-binding'
    && contract.blockEnvelope.fields.specialistCapabilityRef.ownership === 'subject-engine',
  contract.blockEnvelope.requiredFields
);

check(
  'NO-CANONICAL-FLOW',
  'contract has no fixed canonicalFlow navigation',
  !Object.prototype.hasOwnProperty.call(contract, 'canonicalFlow')
    && /not mandatory tabs/.test(contract.learningJourney.rule)
    && contract.presentationContract.binding === 'separate-from-semantic-contract',
  contract.learningJourney
);
check(
  'PRESENTATION-STRATEGIES',
  'presentation contract supports common and specialist strategies without empty views',
  containsAll(contract.presentationContract.strategies, [
    'inline-flow',
    'gated-stepper',
    'slide-deck',
    'specialist-workspace',
    'external-artifact'
  ])
    && contract.presentationContract.rules.some((rule) => /empty view/.test(rule)),
  contract.presentationContract.strategies
);
check(
  'LEARNING-JOURNEY',
  'learning journey transfers learn practise analyse review assess as states',
  containsAll(contract.learningJourney.states, [
    'learn',
    'practise',
    'analyse',
    'review',
    'assess'
  ]),
  contract.learningJourney.states
);
check(
  'MASTERY-THRESHOLDS-DEFERRED',
  'mastery vocabulary exists while thresholds and rubrics remain profile-owned',
  containsAll(contract.masteryEvidenceVocabulary.stages, [
    'understand',
    'solve',
    'build-apply',
    'explain',
    'retain'
  ])
    && contract.masteryEvidenceVocabulary.thresholdOwnership === 'lesson-type-profile'
    && contract.masteryEvidenceVocabulary.rubricOwnership === 'lesson-type-profile',
  contract.masteryEvidenceVocabulary
);
check(
  'ASSESSMENT-INTEGRITY',
  'practice official attempt and review use distinct disclosure modes',
  contract.assessmentIntegrity.disclosureModes.practice
    && contract.assessmentIntegrity.disclosureModes['official-attempt'] === 'defer-correctness-until-submit'
    && contract.assessmentIntegrity.disclosureModes.review
    && /cannot reveal protected answers/.test(contract.assessmentIntegrity.aiPolicy),
  contract.assessmentIntegrity
);

const requiredContextRefs = [
  'currentLesson',
  'prerequisiteGraph',
  'learnerProgress',
  'assessmentErrors',
  'weakTopics',
  'schedule',
  'currentSubject',
  'languageState',
  'nirVkrContext'
];
check(
  'CONTEXT-REFS',
  'context includes lesson prerequisite weakness schedule language and NIR/VKR',
  containsAll(contract.contextReferenceContract.requiredRefs, requiredContextRefs)
    && /does not embed private learner history/.test(contract.contextReferenceContract.dataBoundary),
  contract.contextReferenceContract.requiredRefs
);
check(
  'OFFLINE-CONTRACT',
  'offline resources and deterministic fallback are mandatory',
  containsAll(contract.offlineContract.requiredFields, [
    'policyId',
    'resources',
    'deterministicFallbackRef'
  ])
    && containsAll(contract.offlineContract.availabilityValues, [
      'shell',
      'bundled',
      'subject-pack',
      'local-file',
      'network-only'
    ])
    && contract.offlineContract.rules.some((rule) => /Generative AI is optional/.test(rule)),
  contract.offlineContract.requiredFields
);
check(
  'LANGUAGE-HOOKS-RESERVED',
  'Russian Twin English Research and Vietnamese rescue slots are reserved for B7 and L12',
  containsAll(contract.extensionNamespaces.language.reservedFields, [
    'russianTwinRef',
    'englishResearchRef',
    'vietnameseRescuePolicyRef',
    'exposurePolicyRef'
  ])
    && contract.extensionNamespaces.language.activationRound === 'L6-B7-and-L12',
  contract.extensionNamespaces.language
);
check(
  'COMPATIBILITY',
  'Russian and Mathematics compatibility is read-only with rollback',
  contract.compatibilityContract.projectionMode === 'read-only-first'
    && contract.compatibilityContract.sourceMutationAllowed === false
    && contract.compatibilityContract.legacyStateKeyMutationAllowed === false
    && contract.compatibilityContract.specialistEngineOwnsInteraction === true
    && containsAll(contract.compatibilityContract.requiredReferenceSubjects, [
      'russian',
      'math'
    ])
    && /unchanged subject engine/.test(contract.compatibilityContract.rollbackRule),
  contract.compatibilityContract
);

const serialized = JSON.stringify(contract).toLowerCase();
const comparisonLabel = ['hu', 'tech'].join('');
check(
  'LEARNER-BRAND-BOUNDARY',
  'contract contains no comparison-school learner label',
  !serialized.includes(comparisonLabel),
  contract.programIdentity.learnerBrandPolicy
);
check(
  'DOC-CONTRACT-MAPPING',
  'B2 documentation explains all requested contract areas and later-step boundaries',
  [
    'Instance envelope',
    'Semantic block catalog',
    'Block envelope',
    'Prerequisite and objective semantics',
    'Evidence, assessment and project boundaries',
    'Context and provenance',
    'Offline and compatibility',
    'Scope held for later L6 steps'
  ].every((heading) => doc.includes(heading)),
  DOC_PATH
);
check(
  'DOC-REFERENCE-CONSISTENCY',
  'B2 remains consistent with the binding B1 decisions',
  b1Audit.includes('D01 · Semantic blocks are not UI tabs')
    && b1Audit.includes('D03 · Compatibility starts read-only')
    && b1Audit.includes('D04 · Identity precedes rendering')
    && b1Audit.includes('D08 · AI receives references, not ownership')
    && b1Audit.includes('D12 · Bauman identity is two-field'),
  B1_AUDIT_PATH
);

const report = {
  schema: 'L6_B2_UNIVERSAL_LESSON_CONTRACT_REGRESSION_V1',
  contractId: contract.contractId,
  contractVersion: contract.schemaVersion,
  semanticBlockKinds: blockKinds,
  requiredTopLevelFields: instance.requiredTopLevelFields,
  requiredContextRefs: contract.contextReferenceContract.requiredRefs,
  identity: contract.programIdentity,
  compatibility: {
    projectionMode: contract.compatibilityContract.projectionMode,
    sourceMutationAllowed: contract.compatibilityContract.sourceMutationAllowed,
    legacyStateKeyMutationAllowed: contract.compatibilityContract.legacyStateKeyMutationAllowed,
    referenceSubjects: contract.compatibilityContract.requiredReferenceSubjects
  },
  checks,
  failures,
  result: failures.length ? 'FAIL' : 'PASS'
};

fs.mkdirSync(path.dirname(path.join(ROOT, REPORT_PATH)), { recursive: true });
fs.writeFileSync(path.join(ROOT, REPORT_PATH), JSON.stringify(report, null, 2) + '\n');

console.log(
  'L6-B2 universal lesson contract regression: '
    + checks.length
    + ' checks, '
    + failures.length
    + ' failure(s).'
);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(2);
}
console.log('L6-B2 universal lesson contract regression PASS.');
