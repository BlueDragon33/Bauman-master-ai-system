'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONTRACT_PATH = 'assets/data/lesson/universal-lesson-contract-v2.json';
const POLICY_PATH = 'assets/data/lesson/universal-lesson-block-policy-v1.json';
const DOC_PATH = 'docs/migration/L6_B3_BLOCK_REQUIREMENT_POLICIES.md';
const REPORT_PATH = 'docs/migration/L6_B3_BLOCK_POLICY.generated.json';
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

for (const file of [CONTRACT_PATH, POLICY_PATH, DOC_PATH]) {
  check('FILE-' + file, 'required B3 input exists', fs.existsSync(path.join(ROOT, file)), file);
}

if (failures.length) {
  console.error('L6-B3 policy regression cannot start because required inputs are missing.');
  console.error(failures.join('\n'));
  process.exit(2);
}

const contract = json(CONTRACT_PATH);
const policy = json(POLICY_PATH);
const doc = read(DOC_PATH);
const catalogKinds = Object.keys(contract.semanticBlockCatalog || {});
const baseKinds = Object.keys(policy.basePolicy || {});
const requirementStates = Object.keys(policy.requirementStates || {});
const fulfillmentModes = Object.keys(policy.fulfillmentModes || {});
const conditionIds = Object.keys(policy.conditionCatalog || {});
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

function normalizeEntry(entry) {
  const normalized = Object.assign({}, entry);
  if (normalized.requirement !== 'conditional') delete normalized.conditionRef;
  return normalized;
}

function resolvePolicy(type, mode) {
  const typePolicy = policy.policiesByLessonType[type];
  const modePolicy = mode ? policy.lessonModeOverlays[mode] : null;
  const resolved = {};
  for (const kind of catalogKinds) {
    const base = policy.basePolicy[kind] || {};
    const typeOverride = typePolicy && typePolicy.overrides && typePolicy.overrides[kind] || {};
    const modeOverride = modePolicy && modePolicy.overrides && modePolicy.overrides[kind] || {};
    resolved[kind] = normalizeEntry(Object.assign({}, base, typeOverride, modeOverride));
  }
  return resolved;
}

function validationErrors(resolved) {
  const errors = [];
  for (const [kind, entry] of Object.entries(resolved)) {
    if (!catalogKinds.includes(kind)) errors.push(kind + ': unknown block');
    if (!requirementStates.includes(entry.requirement)) {
      errors.push(kind + ': invalid requirement ' + entry.requirement);
    }
    if (!fulfillmentModes.includes(entry.fulfillment)) {
      errors.push(kind + ': invalid fulfillment ' + entry.fulfillment);
    }
    if (entry.requirement === 'conditional' && !conditionIds.includes(entry.conditionRef)) {
      errors.push(kind + ': invalid condition ' + entry.conditionRef);
    }
    if (entry.requirement !== 'conditional' && entry.conditionRef) {
      errors.push(kind + ': stale condition ' + entry.conditionRef);
    }
    if (entry.fulfillment === 'external'
      && (!Array.isArray(entry.capabilityRefs) || entry.capabilityRefs.length === 0)) {
      errors.push(kind + ': external fulfillment has no capabilities');
    }
  }
  return errors;
}

function counts(resolved, field) {
  return Object.values(resolved).reduce((out, entry) => {
    const key = entry[field];
    out[key] = (out[key] || 0) + 1;
    return out;
  }, {});
}

check(
  'POLICY-IDENTITY',
  'policy identity version and B2 contract ref are explicit',
  policy.policyId === 'bauman-universal-lesson-block-policy'
    && policy.policyVersion === '1.0.0'
    && policy.status === 'L6-B3-POLICY'
    && policy.contractRef.contractId === contract.contractId
    && policy.contractRef.schemaVersion === contract.schemaVersion,
  {
    policyId: policy.policyId,
    policyVersion: policy.policyVersion,
    contractRef: policy.contractRef
  }
);
check(
  'REQUIREMENT-STATES',
  'policy defines required optional conditional and forbidden states',
  sameSet(requirementStates, ['required', 'optional', 'conditional', 'forbidden'])
    && policy.requirementStates.optional.emptyBehavior === 'omit-without-placeholder'
    && policy.requirementStates.forbidden.presentBehavior === 'validation-error-and-quarantine',
  requirementStates
);
check(
  'FULFILLMENT-MODES',
  'policy separates inline external and either fulfillment',
  sameSet(fulfillmentModes, ['inline', 'external', 'either']),
  fulfillmentModes
);
check(
  'CONDITION-CATALOG',
  'every named condition has scope expression and reason',
  conditionIds.length >= 10
    && conditionIds.every((id) => {
      const condition = policy.conditionCatalog[id];
      return condition.scope
        && typeof condition.expression === 'string'
        && condition.expression.length > 10
        && typeof condition.reason === 'string'
        && condition.reason.length > 20;
    }),
  conditionIds
);
const conditionUsage = {};
for (const id of conditionIds) conditionUsage[id] = 0;
for (const entry of Object.values(policy.basePolicy || {})) {
  if (entry.conditionRef) conditionUsage[entry.conditionRef] += 1;
}
for (const profile of Object.values(policy.policiesByLessonType || {})) {
  for (const entry of Object.values(profile.overrides || {})) {
    if (entry.conditionRef) conditionUsage[entry.conditionRef] += 1;
  }
}
for (const overlay of Object.values(policy.lessonModeOverlays || {})) {
  for (const entry of Object.values(overlay.overrides || {})) {
    if (entry.conditionRef) conditionUsage[entry.conditionRef] += 1;
  }
}
check(
  'CONDITION-USAGE',
  'every declared condition is exercised by base type or mode policy',
  conditionIds.every((id) => conditionUsage[id] > 0),
  conditionUsage
);
check(
  'BASE-COVERAGE',
  'base policy classifies exactly every B2 semantic block',
  sameSet(baseKinds, catalogKinds),
  { baseKinds, catalogKinds }
);
check(
  'BASE-VALID',
  'base policy has no invalid state fulfillment or condition',
  validationErrors(Object.fromEntries(
    Object.entries(policy.basePolicy).map(([kind, entry]) => [kind, normalizeEntry(entry)])
  )).length === 0,
  validationErrors(Object.fromEntries(
    Object.entries(policy.basePolicy).map(([kind, entry]) => [kind, normalizeEntry(entry)])
  ))
);
check(
  'NO-FIXED-FLOW',
  'policy contains no fixed canonical flow or requiredFor lists',
  !Object.prototype.hasOwnProperty.call(policy, 'canonicalFlow')
    && !JSON.stringify(policy).includes('requiredFor')
    && policy.presentationBehavior.createsTabs === false
    && policy.presentationBehavior.createsRoutes === false
    && policy.presentationBehavior.emptyOptionalPlaceholder === false,
  policy.presentationBehavior
);

const typeKeys = Object.keys(policy.policiesByLessonType || {});
check(
  'TYPE-REFS',
  'policy references exactly the eight master-plan lesson types',
  sameSet(policy.lessonTypePolicyRefs, expectedTypes)
    && sameSet(typeKeys, expectedTypes),
  { refs: policy.lessonTypePolicyRefs, keys: typeKeys }
);

const resolvedProfiles = {};
for (const type of expectedTypes) {
  const resolved = resolvePolicy(type);
  const errors = validationErrors(resolved);
  const requirementCounts = counts(resolved, 'requirement');
  const fulfillmentCounts = counts(resolved, 'fulfillment');
  resolvedProfiles[type] = {
    requirementCounts,
    fulfillmentCounts,
    requiredBlocks: Object.entries(resolved)
      .filter(([, entry]) => entry.requirement === 'required')
      .map(([kind]) => kind),
    conditionalBlocks: Object.entries(resolved)
      .filter(([, entry]) => entry.requirement === 'conditional')
      .map(([kind]) => kind),
    optionalBlocks: Object.entries(resolved)
      .filter(([, entry]) => entry.requirement === 'optional')
      .map(([kind]) => kind),
    externalBlocks: Object.entries(resolved)
      .filter(([, entry]) => entry.fulfillment === 'external')
      .map(([kind]) => kind),
    errors
  };
  check(
    'TYPE-' + type.toUpperCase(),
    type + ' resolves all blocks without invalid entries or fixed-full requirements',
    Object.keys(resolved).length === catalogKinds.length
      && errors.length === 0
      && (requirementCounts.required || 0) < catalogKinds.length
      && ((requirementCounts.optional || 0) + (requirementCounts.conditional || 0)) > 0,
    resolvedProfiles[type]
  );
}

check(
  'LANGUAGE-SPECIALIST',
  'language requires externally fulfilled oral capability',
  resolvedProfiles.language.requiredBlocks.includes('oral')
    && resolvedProfiles.language.externalBlocks.includes('oral')
    && containsAll(policy.policiesByLessonType.language.overrides.oral.capabilityRefs, [
      'dialogue',
      'shadowing',
      'deep-speaking'
    ]),
  policy.policiesByLessonType.language.overrides.oral
);
check(
  'MATH-SPECIALIST',
  'mathematics requires theory example concept map and professor oral while keeping lab visual conditional',
  containsAll(resolvedProfiles.mathematics.requiredBlocks, [
    'concept-map',
    'theory',
    'worked-example',
    'misconception',
    'oral'
  ])
    && containsAll(resolvedProfiles.mathematics.conditionalBlocks, [
      'lab-simulation',
      'visual-check'
    ])
    && policy.policiesByLessonType.mathematics.overrides.theory.capabilityRefs.includes('formula-typesetting'),
  resolvedProfiles.mathematics
);
check(
  'PROGRAMMING-SPECIALIST',
  'programming requires an external code lab',
  resolvedProfiles.programming.requiredBlocks.includes('lab-simulation')
    && resolvedProfiles.programming.externalBlocks.includes('lab-simulation')
    && policy.policiesByLessonType.programming.overrides['lab-simulation'].capabilityRefs.includes('code-lab'),
  policy.policiesByLessonType.programming.overrides['lab-simulation']
);
check(
  'DATABASE-SPECIALIST',
  'database requires SQL lab and schema or query-plan visual',
  containsAll(resolvedProfiles.database.requiredBlocks, [
    'lab-simulation',
    'visual-check'
  ])
    && policy.policiesByLessonType.database.overrides['lab-simulation'].capabilityRefs.includes('sql-playground')
    && policy.policiesByLessonType.database.overrides['visual-check'].capabilityRefs.includes('query-plan'),
  resolvedProfiles.database
);
check(
  'SOFTWARE-DESIGN-SPECIALIST',
  'software design requires diagram visual and design defense',
  containsAll(resolvedProfiles['software-design'].requiredBlocks, [
    'visual-check',
    'oral'
  ])
    && policy.policiesByLessonType['software-design'].overrides['visual-check'].capabilityRefs.includes('architecture-diagram'),
  resolvedProfiles['software-design']
);
check(
  'ML-DATA-SPECIALIST',
  'ML data requires dataset lab and model or metric visual',
  containsAll(resolvedProfiles['ml-data'].requiredBlocks, [
    'lab-simulation',
    'visual-check'
  ])
    && policy.policiesByLessonType['ml-data'].overrides['lab-simulation'].capabilityRefs.includes('dataset-playground')
    && policy.policiesByLessonType['ml-data'].overrides['visual-check'].capabilityRefs.includes('model-comparison'),
  resolvedProfiles['ml-data']
);
check(
  'ASOIU-SPECIALIST',
  'ASOIU system requires architecture visual and system defense',
  containsAll(resolvedProfiles['asoiu-system'].requiredBlocks, [
    'visual-check',
    'oral'
  ])
    && policy.policiesByLessonType['asoiu-system'].overrides['visual-check'].capabilityRefs.includes('reliability-state'),
  resolvedProfiles['asoiu-system']
);
check(
  'RESEARCH-SPECIALIST',
  'research requires oral defense and project NIR VKR evidence',
  containsAll(resolvedProfiles.research.requiredBlocks, [
    'oral',
    'project-nir-evidence'
  ])
    && policy.policiesByLessonType.research.overrides['project-nir-evidence'].capabilityRefs.includes('nir-milestone')
    && policy.policiesByLessonType.research.overrides['project-nir-evidence'].capabilityRefs.includes('vkr-milestone'),
  resolvedProfiles.research
);

const overlayKeys = Object.keys(policy.lessonModeOverlays || {});
const overlayProfiles = {};
for (const mode of overlayKeys) {
  const resolved = resolvePolicy('mathematics', mode);
  overlayProfiles[mode] = {
    requirementCounts: counts(resolved, 'requirement'),
    requiredBlocks: Object.entries(resolved)
      .filter(([, entry]) => entry.requirement === 'required')
      .map(([kind]) => kind),
    forbiddenBlocks: Object.entries(resolved)
      .filter(([, entry]) => entry.requirement === 'forbidden')
      .map(([kind]) => kind),
    errors: validationErrors(resolved)
  };
}
check(
  'MODE-OVERLAYS',
  'orientation diagnostic and recovery overlays resolve safely',
  sameSet(overlayKeys, ['orientation-only', 'diagnostic', 'recovery'])
    && overlayKeys.every((mode) => overlayProfiles[mode].errors.length === 0),
  overlayProfiles
);
check(
  'MODE-REQUIRED-SCOPE',
  'special modes do not inherit unrelated full-lesson requirements',
  sameSet(overlayProfiles['orientation-only'].requiredBlocks, ['orientation'])
    && sameSet(overlayProfiles.diagnostic.requiredBlocks, [
      'orientation',
      'assessment'
    ])
    && sameSet(overlayProfiles.recovery.requiredBlocks, [
      'exercise',
      'misconception',
      'review',
      'mastery'
    ]),
  overlayProfiles
);
check(
  'FORBIDDEN-EXERCISED',
  'mode overlays exercise forbidden behavior without banning a block globally',
  containsAll(overlayProfiles['orientation-only'].forbiddenBlocks, [
    'assessment',
    'mastery'
  ])
    && overlayProfiles.diagnostic.forbiddenBlocks.includes('worked-example')
    && !Object.values(policy.basePolicy).some((entry) => entry.requirement === 'forbidden'),
  overlayProfiles
);
check(
  'RECOVERY-FOCUS',
  'recovery requires only correction review and corrected mastery evidence',
  sameSet(
    Object.entries(resolvePolicy('language', 'recovery'))
      .filter(([, entry]) => entry.requirement === 'required')
      .map(([kind]) => kind),
    ['exercise', 'misconception', 'review', 'mastery']
  ),
  policy.lessonModeOverlays.recovery
);

check(
  'VALIDATION-POLICY',
  'validation rejects missing external capabilities and source mutation',
  policy.validationPolicy.externalWithoutCapabilityPolicy === 'error'
    && policy.validationPolicy.sourceMutationAllowed === false
    && policy.validationPolicy.legacyStateKeyMutationAllowed === false
    && policy.validationPolicy.optionalEmptyPolicy === 'omit',
  policy.validationPolicy
);
check(
  'RESOLUTION-ALGORITHM',
  'resolution algorithm ends in populated semantic blocks rather than tabs',
  policy.resolutionAlgorithm.length >= 10
    && policy.resolutionAlgorithm.some((step) => /never convert policy rows directly into tabs/.test(step)),
  policy.resolutionAlgorithm
);

const comparisonLabel = ['hu', 'tech'].join('');
check(
  'LEARNER-BRAND-BOUNDARY',
  'policy contains no comparison-school learner label',
  !JSON.stringify(policy).toLowerCase().includes(comparisonLabel),
  contract.programIdentity.learnerBrandPolicy
);
check(
  'PROGRAM-IDENTITY',
  'B3 inherits the official and personalized code boundary from V2',
  contract.programIdentity.officialPublishedDirectionCode === '09.04.01'
    && contract.programIdentity.personalizedDisplayCode === '09.04.01/11',
  contract.programIdentity
);
check(
  'DOC-COVERAGE',
  'B3 decision record covers policy axes resolution conditions types modes and rollback',
  [
    'Two policy axes',
    'Resolution order',
    'Named conditions',
    'Base policy',
    'Lesson-type policy references',
    'Lesson-mode overlays',
    'Specialist ownership',
    'Presentation and offline behavior',
    'Compatibility and rollback',
    'Acceptance'
  ].every((heading) => doc.includes(heading)),
  DOC_PATH
);

const report = {
  schema: 'L6_B3_BLOCK_POLICY_REGRESSION_V1',
  policyId: policy.policyId,
  policyVersion: policy.policyVersion,
  contractVersion: contract.schemaVersion,
  blockKinds: catalogKinds,
  requirementStates,
  fulfillmentModes,
  conditionIds,
  resolvedProfiles,
  overlayProfiles,
  presentationBehavior: policy.presentationBehavior,
  validationPolicy: policy.validationPolicy,
  checks,
  failures,
  result: failures.length ? 'FAIL' : 'PASS'
};

fs.mkdirSync(path.dirname(path.join(ROOT, REPORT_PATH)), { recursive: true });
fs.writeFileSync(path.join(ROOT, REPORT_PATH), JSON.stringify(report, null, 2) + '\n');

console.log(
  'L6-B3 block requirement policy regression: '
    + checks.length
    + ' checks, '
    + failures.length
    + ' failure(s).'
);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(2);
}
console.log('L6-B3 block requirement policy regression PASS.');
