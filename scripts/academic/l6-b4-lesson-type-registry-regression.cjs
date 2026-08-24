'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONTRACT_PATH = 'assets/data/lesson/universal-lesson-contract-v2.json';
const POLICY_PATH = 'assets/data/lesson/universal-lesson-block-policy-v1.json';
const REGISTRY_PATH = 'assets/data/lesson/lesson-type-registry-v1.json';
const DOC_PATH = 'docs/migration/L6_B4_LESSON_TYPE_REGISTRY.md';
const REPORT_PATH = 'docs/migration/L6_B4_LESSON_TYPE_REGISTRY.generated.json';
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

function sameSet(left, right) {
  return left.length === right.length && containsAll(left, right);
}

for (const file of [CONTRACT_PATH, POLICY_PATH, REGISTRY_PATH, DOC_PATH]) {
  check('FILE-' + file, 'required B4 input exists', fs.existsSync(path.join(ROOT, file)), file);
}

if (failures.length) {
  console.error('L6-B4 registry regression cannot start because required inputs are missing.');
  console.error(failures.join('\n'));
  process.exit(2);
}

const contract = json(CONTRACT_PATH);
const policy = json(POLICY_PATH);
const registry = json(REGISTRY_PATH);
const doc = read(DOC_PATH);
const types = registry.types || {};
const typeIds = Object.keys(types);
const expectedTypes = [
  'language',
  'mathematics',
  'programming',
  'database',
  'software-design',
  'ml-data',
  'asoiu-system',
  'research'
];
const registeredStrategies = contract.presentationContract.strategies;
const registeredArtifacts = contract.sourceBindingContract.artifactKinds;
const registeredContexts = [
  ...contract.contextReferenceContract.requiredRefs,
  ...contract.contextReferenceContract.optionalRefs
];
const registeredOfflineClasses = contract.offlineContract.availabilityValues;

check(
  'REGISTRY-IDENTITY',
  'registry identity version and status are explicit',
  registry.registryId === 'bauman-lesson-type-registry'
    && registry.registryVersion === '1.0.0'
    && registry.status === 'L6-B4-REGISTRY',
  {
    registryId: registry.registryId,
    registryVersion: registry.registryVersion,
    status: registry.status
  }
);
check(
  'CONTRACT-REF',
  'registry references the exact B2 contract',
  registry.contractRef.contractId === contract.contractId
    && registry.contractRef.schemaVersion === contract.schemaVersion
    && registry.contractRef.path === CONTRACT_PATH,
  registry.contractRef
);
check(
  'POLICY-REF',
  'registry references the exact B3 policy',
  registry.blockPolicyRef.policyId === policy.policyId
    && registry.blockPolicyRef.policyVersion === policy.policyVersion
    && registry.blockPolicyRef.path === POLICY_PATH,
  registry.blockPolicyRef
);
check(
  'TYPE-SET',
  'registry contains exactly the eight master-plan lesson types',
  sameSet(typeIds, expectedTypes)
    && sameSet(policy.lessonTypePolicyRefs, expectedTypes),
  { registry: typeIds, policy: policy.lessonTypePolicyRefs }
);

const requiredProfileFields = registry.profileContract.requiredFields;
const profileSummaries = {};
const profileErrors = {};
const definitionSet = new Set();

for (const typeId of expectedTypes) {
  const profile = types[typeId];
  const errors = [];
  for (const field of requiredProfileFields) {
    if (!Object.prototype.hasOwnProperty.call(profile, field)) {
      errors.push('missing ' + field);
    }
  }
  if (profile.id !== typeId) errors.push('id mismatch');
  if (!profile.title
    || !profile.title.vi
    || !profile.title.ru
    || !profile.title.en) errors.push('missing trilingual title');
  if (typeof profile.definition !== 'string' || profile.definition.length < 80) {
    errors.push('definition too short');
  }
  if (definitionSet.has(profile.definition)) errors.push('duplicate definition');
  definitionSet.add(profile.definition);
  if (!Array.isArray(profile.useWhen) || profile.useWhen.length < 1) errors.push('missing useWhen');
  if (!Array.isArray(profile.avoidWhen) || profile.avoidWhen.length < 1) errors.push('missing avoidWhen');
  if (profile.blockPolicyRef !== POLICY_PATH + '#policiesByLessonType/' + typeId) {
    errors.push('wrong blockPolicyRef');
  }
  if (!Array.isArray(profile.capabilityRefs)
    || profile.capabilityRefs.length < registry.profileContract.minimumCapabilityRefs) {
    errors.push('too few capabilities');
  }
  if (!Array.isArray(profile.evidenceOutputs)
    || profile.evidenceOutputs.length < registry.profileContract.minimumEvidenceOutputs) {
    errors.push('too few evidence outputs');
  }
  if (!Array.isArray(profile.assessmentModes)
    || profile.assessmentModes.length < registry.profileContract.minimumAssessmentModes) {
    errors.push('too few assessment modes');
  }
  if (!Array.isArray(profile.contextEmphasis)
    || profile.contextEmphasis.length < registry.profileContract.minimumContextEmphasis) {
    errors.push('too few context refs');
  }
  const unknownStrategies = profile.presentationStrategies.filter(
    (value) => !registeredStrategies.includes(value)
  );
  const unknownArtifacts = profile.sourceArtifactKinds.filter(
    (value) => !registeredArtifacts.includes(value)
  );
  const unknownContexts = profile.contextEmphasis.filter(
    (value) => !registeredContexts.includes(value)
  );
  const unknownOffline = profile.offlineResourceClasses.filter(
    (value) => !registeredOfflineClasses.includes(value)
  );
  if (unknownStrategies.length) errors.push('unknown strategies: ' + unknownStrategies.join(','));
  if (unknownArtifacts.length) errors.push('unknown artifacts: ' + unknownArtifacts.join(','));
  if (unknownContexts.length) errors.push('unknown contexts: ' + unknownContexts.join(','));
  if (unknownOffline.length) errors.push('unknown offline classes: ' + unknownOffline.join(','));
  if (!Array.isArray(profile.visualRepresentationKinds)
    || profile.visualRepresentationKinds.length < 4) {
    errors.push('too few visual representation kinds');
  }
  const forward = profile.forwardRefs || {};
  for (const [field, prefix] of Object.entries({
    masteryProfile: 'L6-B5#',
    visualProfile: 'L6-B6#',
    languageHooks: 'L6-B7#',
    rendererProfile: 'L6-B10#'
  })) {
    if (forward[field] !== prefix + typeId) errors.push('wrong forward ref ' + field);
  }
  const expectedDefinitionRef = REGISTRY_PATH + '#types/' + typeId;
  if (policy.policiesByLessonType[typeId].definitionRef !== expectedDefinitionRef) {
    errors.push('B3 definitionRef mismatch');
  }
  profileErrors[typeId] = errors;
  profileSummaries[typeId] = {
    title: profile.title,
    capabilities: profile.capabilityRefs.length,
    sourceArtifactKinds: profile.sourceArtifactKinds,
    presentationStrategies: profile.presentationStrategies,
    visuals: profile.visualRepresentationKinds.length,
    evidenceOutputs: profile.evidenceOutputs.length,
    assessmentModes: profile.assessmentModes.length,
    contextEmphasis: profile.contextEmphasis,
    offlineResourceClasses: profile.offlineResourceClasses,
    compatibilityReference: profile.compatibilityReference
  };
  check(
    'TYPE-' + typeId.toUpperCase(),
    typeId + ' satisfies the common lesson-type profile contract',
    errors.length === 0,
    { summary: profileSummaries[typeId], errors }
  );
}

check(
  'PROFILE-FIELD-CONTRACT',
  'profile contract includes identity boundaries capabilities evidence context offline and forward refs',
  containsAll(requiredProfileFields, [
    'id',
    'definition',
    'useWhen',
    'avoidWhen',
    'blockPolicyRef',
    'capabilityRefs',
    'sourceArtifactKinds',
    'presentationStrategies',
    'visualRepresentationKinds',
    'evidenceOutputs',
    'assessmentModes',
    'contextEmphasis',
    'offlineResourceClasses',
    'compatibilityReference',
    'forwardRefs'
  ]),
  requiredProfileFields
);
check(
  'POLICY-DEFINITION-REFS',
  'every B3 type policy resolves to its exact B4 definition',
  expectedTypes.every((typeId) =>
    policy.policiesByLessonType[typeId].definitionRef
      === REGISTRY_PATH + '#types/' + typeId
  ),
  Object.fromEntries(expectedTypes.map((typeId) => [
    typeId,
    policy.policiesByLessonType[typeId].definitionRef
  ]))
);

check(
  'LANGUAGE-BOUNDARY',
  'language owns production and preserves Russian specialist capabilities',
  containsAll(types.language.capabilityRefs, [
    'dialogue',
    'shadowing',
    'deep-speaking',
    'handwriting-workspace',
    'writing-workspace'
  ])
    && types.language.evidenceOutputs.includes('oral-response')
    && types.language.compatibilityReference.subjectId === 'russian',
  profileSummaries.language
);
check(
  'MATHEMATICS-BOUNDARY',
  'mathematics owns derivation formula matrix simulation and professor oral',
  containsAll(types.mathematics.capabilityRefs, [
    'authoritative-theory-deck',
    'formula-typesetting',
    'matrix-rendering',
    'parameter-simulation',
    'professor-oral-defense'
  ])
    && types.mathematics.evidenceOutputs.includes('mathematical-solution')
    && types.mathematics.compatibilityReference.subjectId === 'math',
  profileSummaries.mathematics
);
check(
  'PROGRAMMING-BOUNDARY',
  'programming owns executable code tests and debugging',
  containsAll(types.programming.capabilityRefs, [
    'code-lab',
    'unit-test',
    'debug-runner'
  ])
    && types.programming.evidenceOutputs.includes('passing-tests'),
  profileSummaries.programming
);
check(
  'DATABASE-BOUNDARY',
  'database owns SQL schema transaction and query-plan evidence',
  containsAll(types.database.capabilityRefs, [
    'sql-playground',
    'schema-diagram',
    'transaction-scenario',
    'query-plan'
  ])
    && types.database.evidenceOutputs.includes('query-plan-analysis'),
  profileSummaries.database
);
check(
  'SOFTWARE-DESIGN-BOUNDARY',
  'software design owns requirements UML architecture and traceability',
  containsAll(types['software-design'].capabilityRefs, [
    'requirements-map',
    'uml-workspace',
    'architecture-workspace',
    'traceability-matrix'
  ])
    && types['software-design'].evidenceOutputs.includes('architecture-artifact'),
  profileSummaries['software-design']
);
check(
  'ML-DATA-BOUNDARY',
  'ML data owns dataset model metric experiment and reproducibility evidence',
  containsAll(types['ml-data'].capabilityRefs, [
    'dataset-playground',
    'experiment-runner',
    'metric-visualizer',
    'model-comparison',
    'reproducibility-check'
  ])
    && types['ml-data'].evidenceOutputs.includes('experiment-log'),
  profileSummaries['ml-data']
);
check(
  'ASOIU-BOUNDARY',
  'ASOIU system owns architecture information flow reliability and lifecycle',
  containsAll(types['asoiu-system'].capabilityRefs, [
    'architecture-diagram',
    'information-flow',
    'reliability-scenario',
    'lifecycle-map'
  ])
    && types['asoiu-system'].evidenceOutputs.includes('reliability-analysis'),
  profileSummaries['asoiu-system']
);
check(
  'RESEARCH-BOUNDARY',
  'research owns question literature protocol evidence NIR VKR and defense',
  containsAll(types.research.capabilityRefs, [
    'research-question-builder',
    'literature-matrix',
    'evidence-vault',
    'experiment-protocol',
    'nir-milestone',
    'vkr-milestone',
    'defense-simulator'
  ])
    && types.research.evidenceOutputs.includes('scientific-section'),
  profileSummaries.research
);

const compatibilitySubjects = expectedTypes
  .filter((typeId) => types[typeId].compatibilityReference)
  .map((typeId) => ({
    typeId,
    subjectId: types[typeId].compatibilityReference.subjectId,
    status: types[typeId].compatibilityReference.status
  }));
check(
  'REFERENCE-CLAIMS',
  'only Russian and Mathematics are audited references and neither claims migration',
  compatibilitySubjects.length === 2
    && compatibilitySubjects.some((item) =>
      item.typeId === 'language'
      && item.subjectId === 'russian'
      && item.status === 'audited-reference-unprojected'
    )
    && compatibilitySubjects.some((item) =>
      item.typeId === 'mathematics'
      && item.subjectId === 'math'
      && item.status === 'audited-reference-unprojected'
    )
    && compatibilitySubjects.every((item) => !/migrated|pass/i.test(item.status)),
  compatibilitySubjects
);

const signalKeys = Object.keys(registry.classificationSignals || {});
check(
  'CLASSIFICATION-SIGNALS',
  'every type has non-empty classification signals',
  sameSet(signalKeys, expectedTypes)
    && signalKeys.every((typeId) =>
      Array.isArray(registry.classificationSignals[typeId])
      && registry.classificationSignals[typeId].length >= 1
    ),
  signalKeys
);
check(
  'COMPOSITION-RULES',
  'composition requires one primary type and prevents blind policy merge',
  registry.compositionRules.primaryTypeCount === 1
    && registry.compositionRules.secondaryFacetCount.minimum === 0
    && registry.compositionRules.secondaryFacetCount.maximum === 3
    && registry.compositionRules.secondaryFacetEffect === 'context-and-capability-hints-only'
    && /forbidden/.test(registry.compositionRules.blockPolicyMerge)
    && registry.compositionRules.examples.length >= 4,
  registry.compositionRules
);
const compositionErrors = [];
for (const example of registry.compositionRules.examples) {
  if (!expectedTypes.includes(example.primaryType)) {
    compositionErrors.push(example.lesson + ': unknown primary type');
  }
  if (!Array.isArray(example.secondaryFacets)
    || example.secondaryFacets.length > registry.compositionRules.secondaryFacetCount.maximum) {
    compositionErrors.push(example.lesson + ': invalid secondary count');
  }
  for (const facet of example.secondaryFacets || []) {
    if (!expectedTypes.includes(facet)) compositionErrors.push(example.lesson + ': unknown facet ' + facet);
    if (facet === example.primaryType) compositionErrors.push(example.lesson + ': primary repeated as facet');
  }
  if (!example.reason) compositionErrors.push(example.lesson + ': missing reason');
}
check(
  'COMPOSITION-EXAMPLES',
  'composition examples use only registered distinct primary and secondary types',
  compositionErrors.length === 0,
  compositionErrors
);
check(
  'CLASSIFICATION-PROCEDURE',
  'classification starts from artifact and correctness test and never blind-merges policies',
  registry.classificationProcedure.length >= 6
    && registry.classificationProcedure.some((step) => /primary learner artifact/.test(step))
    && registry.classificationProcedure.some((step) => /test that decides correctness/.test(step))
    && registry.classificationProcedure.some((step) => /Never merge block requirement matrices/.test(step)),
  registry.classificationProcedure
);
check(
  'SUBJECT-BOUNDARY',
  'B4 does not bind whole subjects before the Subject Factory step',
  registry.subjectBoundary.currentSubjectMappingAllowed === false
    && /L6-B9/.test(registry.subjectBoundary.rule)
    && /one-engine-per-subject coupling/.test(registry.subjectBoundary.reason),
  registry.subjectBoundary
);

check(
  'PROGRAM-IDENTITY',
  'registry inherits official 09.04.01 and personalized 09.04.01/11 identity',
  contract.programIdentity.officialPublishedDirectionCode === '09.04.01'
    && contract.programIdentity.personalizedDisplayCode === '09.04.01/11'
    && contract.programIdentity.department === 'ИУ-5',
  contract.programIdentity
);
check(
  'CYRILLIC-RESEARCH-CODES',
  'Russian research abbreviations use consistent Cyrillic НИР and ВКР',
  !JSON.stringify(registry).includes('VКР')
    && JSON.stringify(types.research).includes('НИР')
    && JSON.stringify(types.research).includes('ВКР'),
  types.research.title
);
const comparisonLabel = ['hu', 'tech'].join('');
check(
  'LEARNER-BRAND-BOUNDARY',
  'registry contains no comparison-school learner label',
  !JSON.stringify(registry).toLowerCase().includes(comparisonLabel),
  contract.programIdentity.learnerBrandPolicy
);
check(
  'DOC-COVERAGE',
  'B4 decision record covers subject boundary profile types composition references and rollback',
  [
    'Subject is not lesson type',
    'Profile contract',
    'Eight canonical types',
    'Boundaries that prevent misclassification',
    'Composition rules',
    'Reference-engine compatibility',
    'Context, offline and language boundaries',
    'Forward ownership',
    'Rollback',
    'Acceptance'
  ].every((heading) => doc.includes(heading)),
  DOC_PATH
);

const report = {
  schema: 'L6_B4_LESSON_TYPE_REGISTRY_REGRESSION_V1',
  registryId: registry.registryId,
  registryVersion: registry.registryVersion,
  contractVersion: contract.schemaVersion,
  policyVersion: policy.policyVersion,
  typeIds,
  profileSummaries,
  profileErrors,
  compatibilitySubjects,
  compositionExamples: registry.compositionRules.examples,
  subjectBoundary: registry.subjectBoundary,
  checks,
  failures,
  result: failures.length ? 'FAIL' : 'PASS'
};

fs.mkdirSync(path.dirname(path.join(ROOT, REPORT_PATH)), { recursive: true });
fs.writeFileSync(path.join(ROOT, REPORT_PATH), JSON.stringify(report, null, 2) + '\n');

console.log(
  'L6-B4 lesson type registry regression: '
    + checks.length
    + ' checks, '
    + failures.length
    + ' failure(s).'
);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(2);
}
console.log('L6-B4 lesson type registry regression PASS.');
