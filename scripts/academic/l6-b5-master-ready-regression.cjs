'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CONTRACT_PATH = 'assets/data/lesson/universal-lesson-contract-v2.json';
const REGISTRY_PATH = 'assets/data/lesson/lesson-type-registry-v1.json';
const POLICY_PATH = 'assets/data/lesson/master-ready-policy-v1.json';
const DOC_PATH = 'docs/migration/L6_B5_MASTER_READY_EVIDENCE_GATES.md';
const REPORT_PATH = 'docs/migration/L6_B5_MASTER_READY_REGRESSION.generated.json';
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

for (const file of [CONTRACT_PATH, REGISTRY_PATH, POLICY_PATH, DOC_PATH]) {
  check('FILE-' + file, 'required B5 input exists', fs.existsSync(path.join(ROOT, file)), file);
}

if (failures.length) {
  console.error('L6-B5 regression cannot start because required inputs are missing.');
  console.error(failures.join('\n'));
  process.exit(2);
}

const contract = json(CONTRACT_PATH);
const registry = json(REGISTRY_PATH);
const policy = json(POLICY_PATH);
const doc = read(DOC_PATH);
const stages = policy.stageOrder || [];
const expectedStages = [
  'understand',
  'solve',
  'build-apply',
  'explain',
  'retain'
];
const typeIds = Object.keys(registry.types || {});
const profileIds = Object.keys(policy.profiles || {});

check(
  'POLICY-IDENTITY',
  'Master-ready policy identity version and status are explicit',
  policy.policyId === 'bauman-master-ready-policy'
    && policy.policyVersion === '1.0.0'
    && policy.status === 'L6-B5-POLICY',
  {
    policyId: policy.policyId,
    policyVersion: policy.policyVersion,
    status: policy.status
  }
);
check(
  'CONTRACT-REF',
  'policy references exact B2 contract',
  policy.contractRef.path === CONTRACT_PATH
    && policy.contractRef.contractId === contract.contractId
    && policy.contractRef.schemaVersion === contract.schemaVersion,
  policy.contractRef
);
check(
  'REGISTRY-REF',
  'policy references exact B4 type registry',
  policy.typeRegistryRef.path === REGISTRY_PATH
    && policy.typeRegistryRef.registryId === registry.registryId
    && policy.typeRegistryRef.registryVersion === registry.registryVersion,
  policy.typeRegistryRef
);
check(
  'STAGE-ORDER',
  'policy defines exactly understand solve build-apply explain retain',
  sameSet(stages, expectedStages)
    && stages.every((stage, index) => stage === expectedStages[index]),
  stages
);
check(
  'STAGE-CONTRACT',
  'every stage has meaning dependencies and evidence minimum',
  expectedStages.every((stage) => {
    const item = policy.stageContract[stage];
    return item
      && typeof item.meaning === 'string'
      && item.meaning.length > 50
      && Array.isArray(item.dependency)
      && item.dependency.every((dependency) => expectedStages.includes(dependency))
      && item.minimumEvidenceEvents >= 1;
  }),
  policy.stageContract
);
check(
  'STAGE-DEPENDENCIES',
  'retain depends on the first four stages',
  sameSet(policy.stageContract.retain.dependency, expectedStages.slice(0, 4)),
  policy.stageContract.retain.dependency
);

const evidenceFields = [
  'evidenceId',
  'lessonId',
  'typeId',
  'stage',
  'evidenceKind',
  'artifactRefs',
  'sourceRefs',
  'learnerStateRef',
  'attemptRef',
  'createdAt',
  'verification',
  'provenance'
];
check(
  'EVIDENCE-ENVELOPE',
  'evidence envelope keeps identity artifacts source learner state verification and provenance',
  containsAll(policy.evidenceEnvelope.requiredFields, evidenceFields)
    && /append-only/.test(policy.evidenceEnvelope.attemptRule)
    && /versioned source/.test(policy.evidenceEnvelope.sourceRefRule)
    && /never embeds a private learner file/.test(policy.evidenceEnvelope.artifactRefRule),
  policy.evidenceEnvelope.requiredFields
);
check(
  'PROVENANCE-BOUNDARY',
  'evidence provenance separates source user system and AI',
  sameSet(policy.evidenceEnvelope.provenanceGroups, [
    'provided-source',
    'user-evidence',
    'system-derived',
    'ai-inference'
  ]),
  policy.evidenceEnvelope.provenanceGroups
);

const actors = policy.verificationActors;
check(
  'VERIFICATION-AUTHORITY',
  'only deterministic evaluator and instructor may set verified',
  actors['deterministic-evaluator'].maySetVerified === true
    && actors['instructor-review'].maySetVerified === true
    && actors['learner-self-check'].maySetVerified === false
    && actors['peer-review'].maySetVerified === false
    && actors['ai-advisory'].maySetVerified === false,
  Object.fromEntries(Object.entries(actors).map(([id, item]) => [id, item.maySetVerified]))
);
check(
  'AI-BOUNDARY',
  'AI is advisory and cannot fabricate or finally verify evidence',
  /cannot be the final verification authority/.test(actors['ai-advisory'].boundary)
    && /cannot mark the repaired evidence verified/.test(policy.repairPolicy.rules.join(' ')),
  actors['ai-advisory']
);
check(
  'DETERMINISTIC-METHODS',
  'deterministic verification covers tests queries numeric invariants and artifacts',
  containsAll(actors['deterministic-evaluator'].allowedMethods, [
    'unit-test',
    'query-result',
    'numeric-tolerance',
    'simulation-invariant',
    'artifact-validator'
  ]),
  actors['deterministic-evaluator'].allowedMethods
);

const states = policy.gateStateMachine.states;
check(
  'GATE-STATES',
  'state machine distinguishes provisional retention mastery due and repair',
  sameSet(states, [
    'not-started',
    'learning',
    'ready-for-retention',
    'master-ready',
    'retention-due',
    'needs-repair'
  ]),
  states
);
const transitionPairs = policy.gateStateMachine.transitions.map(
  (item) => item.from + '->' + item.to
);
check(
  'GATE-TRANSITIONS',
  'state machine includes readiness retention pass due fail and repair transitions',
  containsAll(transitionPairs, [
    'not-started->learning',
    'learning->ready-for-retention',
    'ready-for-retention->master-ready',
    'ready-for-retention->needs-repair',
    'master-ready->retention-due',
    'master-ready->needs-repair',
    'retention-due->master-ready',
    'learning->needs-repair',
    'retention-due->needs-repair',
    'needs-repair->learning'
  ]),
  transitionPairs
);
check(
  'NO-PAGE-VIEW-MASTERY',
  'page route scroll time and chat events cannot satisfy mastery',
  policy.gateStateMachine.invariants.some((value) =>
    /page-view, route-open, scroll, elapsed-time or AI-chat event is never sufficient evidence/.test(value)
  ),
  policy.gateStateMachine.invariants
);
check(
  'PROVISIONAL-NOT-MASTER',
  'ready-for-retention is explicitly not Master-ready',
  policy.gateStateMachine.invariants.some((value) =>
    /ready-for-retention is provisional/.test(value)
  ),
  policy.gateStateMachine.invariants
);
check(
  'SCORING-CONTRACT',
  'score scale weight total stage and critical rules are explicit',
  policy.scoreContract.criterionScale.minimum === 0
    && policy.scoreContract.criterionScale.maximum === 4
    && policy.scoreContract.weightSum === 1
    && /critical criterion/.test(policy.scoreContract.criticalFailureRule)
    && /Any stage/.test(policy.scoreContract.stageFailureRule)
    && /unresolved required prerequisite/.test(policy.scoreContract.prerequisiteRule)
    && /source version/.test(policy.scoreContract.sourceIntegrityRule)
    && /Course pass and Master-ready are separate/.test(policy.scoreContract.officialGradeBoundary),
  policy.scoreContract
);
check(
  'INTEGRITY-REPAIR',
  'prerequisite and source invalidation explicitly block or repair mastery',
  policy.gateStateMachine.invariants.some((value) =>
    /Unresolved required prerequisites block/.test(value)
  )
    && policy.gateStateMachine.invariants.some((value) =>
      /versioned sources/.test(value)
    )
    && transitionPairs.includes('ready-for-retention->needs-repair')
    && transitionPairs.includes('master-ready->needs-repair'),
  policy.gateStateMachine.invariants
);

check(
  'PROFILE-SET',
  'policy has exactly one profile for every B4 lesson type',
  sameSet(profileIds, typeIds),
  { profiles: profileIds, types: typeIds }
);

const requiredProfileFields = policy.rubricContract.requiredProfileFields;
const requiredCriterionFields = policy.rubricContract.requiredCriterionFields;
const profileSummaries = {};
const profileErrors = {};
const totalThresholds = new Set();
const retentionSignatures = new Set();

for (const typeId of typeIds) {
  const profile = policy.profiles[typeId];
  const type = registry.types[typeId];
  const allowedOutputs = new Set(type.evidenceOutputs);
  const errors = [];
  for (const field of requiredProfileFields) {
    if (!Object.prototype.hasOwnProperty.call(profile, field)) {
      errors.push('missing ' + field);
    }
  }
  if (profile.typeId !== typeId) errors.push('typeId mismatch');
  if (!(profile.totalThreshold >= 0.75 && profile.totalThreshold <= 0.9)) {
    errors.push('total threshold outside safety range');
  }
  totalThresholds.add(profile.totalThreshold);
  const stageMinimumIds = Object.keys(profile.stageMinimums || {});
  if (!sameSet(stageMinimumIds, expectedStages)) errors.push('stage minimum set mismatch');
  for (const value of Object.values(profile.stageMinimums || {})) {
    if (!(value >= 0.7 && value <= 0.95)) errors.push('stage minimum outside range');
  }
  if (!sameSet(Object.keys(profile.stageInterpretation || {}), expectedStages)) {
    errors.push('stage interpretation set mismatch');
  }
  if (!sameSet(Object.keys(profile.stageEvidence || {}), expectedStages)) {
    errors.push('stage evidence set mismatch');
  }
  for (const [stage, outputs] of Object.entries(profile.stageEvidence || {})) {
    if (!Array.isArray(outputs) || outputs.length === 0) errors.push(stage + ': empty evidence');
    for (const output of outputs || []) {
      if (!allowedOutputs.has(output)) errors.push(stage + ': unknown output ' + output);
    }
  }
  if (!Array.isArray(profile.criteria) || profile.criteria.length < 5) {
    errors.push('too few rubric criteria');
  }
  const criterionIds = new Set();
  const coveredStages = new Set();
  let weightSum = 0;
  let criticalCount = 0;
  for (const criterion of profile.criteria || []) {
    for (const field of requiredCriterionFields) {
      if (!Object.prototype.hasOwnProperty.call(criterion, field)) {
        errors.push((criterion.id || '?') + ': missing ' + field);
      }
    }
    if (criterionIds.has(criterion.id)) errors.push('duplicate criterion ' + criterion.id);
    criterionIds.add(criterion.id);
    weightSum += criterion.weight;
    if (criterion.critical) criticalCount += 1;
    if (!(criterion.minimumNormalized >= 0.7 && criterion.minimumNormalized <= 0.95)) {
      errors.push(criterion.id + ': minimum outside range');
    }
    for (const stage of criterion.stages || []) {
      if (!expectedStages.includes(stage)) errors.push(criterion.id + ': unknown stage ' + stage);
      coveredStages.add(stage);
    }
    for (const output of criterion.evidenceOutputRefs || []) {
      if (!allowedOutputs.has(output)) errors.push(criterion.id + ': unknown output ' + output);
    }
  }
  if (Math.abs(weightSum - 1) > 1e-9) errors.push('weight sum ' + weightSum);
  if (criticalCount < 2) errors.push('too few critical criteria');
  if (!sameSet(Array.from(coveredStages), expectedStages)) errors.push('criteria do not cover all stages');
  const retention = profile.retentionPolicy || {};
  const windows = retention.windowsDays || [];
  const requiredWindows = retention.requiredWindowsDays || [];
  if (windows.length < 2
    || windows.some((value, index) => index > 0 && value <= windows[index - 1])) {
    errors.push('retention windows not strictly increasing');
  }
  if (!requiredWindows.length
    || requiredWindows.some((value) => !windows.includes(value))
    || requiredWindows.some((value, index) => index > 0 && value <= requiredWindows[index - 1])) {
    errors.push('invalid required retention windows');
  }
  if (requiredWindows.some((value) => value <= 0)) errors.push('retention is not delayed');
  if (!(retention.minimumNormalized >= 0.7 && retention.minimumNormalized <= 0.95)) {
    errors.push('retention minimum outside range');
  }
  if (retention.minimumNormalized !== profile.stageMinimums.retain) {
    errors.push('retention minimum differs from retain stage');
  }
  if (retention.variedPromptRequired !== true) errors.push('varied prompt not required');
  if (retention.scheduleContextRef !== 'schedule') errors.push('schedule context missing');
  retentionSignatures.add(requiredWindows.join(','));
  if (typeof profile.thresholdRationale !== 'string'
    || profile.thresholdRationale.length < 80) {
    errors.push('threshold rationale too short');
  }
  const expectedForwardRef = 'L6-B5#' + typeId;
  if (type.forwardRefs.masteryProfile !== expectedForwardRef) {
    errors.push('B4 mastery forward ref mismatch');
  }
  profileErrors[typeId] = errors;
  profileSummaries[typeId] = {
    totalThreshold: profile.totalThreshold,
    stageMinimums: profile.stageMinimums,
    criteria: profile.criteria.length,
    criticalCriteria: criticalCount,
    weightSum: Number(weightSum.toFixed(10)),
    evidenceOutputs: type.evidenceOutputs,
    retentionWindowsDays: windows,
    requiredRetentionWindowsDays: requiredWindows,
    retentionMinimum: retention.minimumNormalized,
    errors
  };
  check(
    'PROFILE-' + typeId.toUpperCase(),
    typeId + ' has a valid type-specific evidence rubric and retention gate',
    errors.length === 0,
    profileSummaries[typeId]
  );
}

check(
  'NO-GLOBAL-THRESHOLD',
  'type thresholds and retention schedules are not one hidden global rule',
  totalThresholds.size >= 4
    && retentionSignatures.size >= 3
    && !Object.prototype.hasOwnProperty.call(policy, 'minimumAssessmentPercent')
    && !Object.prototype.hasOwnProperty.call(policy, 'retentionTargetPercent'),
  {
    totalThresholds: Array.from(totalThresholds),
    retentionSignatures: Array.from(retentionSignatures)
  }
);
check(
  'LANGUAGE-CRITICAL',
  'language makes comprehension production repair and retention critical',
  containsAll(
    policy.profiles.language.criteria.filter((item) => item.critical).map((item) => item.id),
    [
      'comprehension-accuracy',
      'production-accuracy',
      'fluency-and-repair',
      'language-retention'
    ]
  ),
  profileSummaries.language
);
check(
  'MATH-CRITICAL',
  'mathematics makes assumptions method dimensions verification and retention critical',
  containsAll(
    policy.profiles.mathematics.criteria.filter((item) => item.critical).map((item) => item.id),
    [
      'concept-and-assumption',
      'method-correctness',
      'notation-dimension-and-units',
      'application-and-verification',
      'mathematical-retention'
    ]
  ),
  profileSummaries.mathematics
);
check(
  'PROGRAMMING-CRITICAL',
  'programming requires passing tests debugging reproducibility and delayed behavior',
  policy.profiles.programming.stageEvidence.solve.includes('passing-tests')
    && policy.profiles.programming.stageEvidence.retain.includes('passing-tests')
    && containsAll(
      policy.profiles.programming.criteria.filter((item) => item.critical).map((item) => item.id),
      ['functional-correctness', 'debugging-evidence', 'repository-reproducibility']
    ),
  profileSummaries.programming
);
check(
  'DATABASE-CRITICAL',
  'database requires query correctness integrity transaction and delayed evidence',
  containsAll(
    policy.profiles.database.criteria.filter((item) => item.critical).map((item) => item.id),
    ['query-correctness', 'data-model-and-integrity', 'transaction-and-normalization']
  )
    && policy.profiles.database.stageEvidence.retain.includes('query-result'),
  profileSummaries.database
);
check(
  'DESIGN-CRITICAL',
  'software design requires traceability architecture tradeoffs diagram consistency and transfer',
  containsAll(
    policy.profiles['software-design'].criteria.filter((item) => item.critical).map((item) => item.id),
    [
      'requirements-traceability',
      'architecture-correctness',
      'tradeoff-reasoning',
      'diagram-consistency'
    ]
  ),
  profileSummaries['software-design']
);
check(
  'ML-DATA-CRITICAL',
  'ML data requires data integrity evaluation reproducibility and delayed experiment evidence',
  containsAll(
    policy.profiles['ml-data'].criteria.filter((item) => item.critical).map((item) => item.id),
    [
      'data-pipeline-integrity',
      'evaluation-validity',
      'experiment-reproducibility'
    ]
  )
    && policy.profiles['ml-data'].stageEvidence.retain.includes('reproducibility-record'),
  profileSummaries['ml-data']
);
check(
  'ASOIU-CRITICAL',
  'ASOIU system requires boundary model reliability architecture and transfer',
  containsAll(
    policy.profiles['asoiu-system'].criteria.filter((item) => item.critical).map((item) => item.id),
    [
      'system-boundary-and-flow',
      'analytical-model',
      'reliability-and-failure',
      'architecture-and-lifecycle'
    ]
  ),
  profileSummaries['asoiu-system']
);
check(
  'RESEARCH-CRITICAL',
  'research makes question sources method evidence reproducibility and defense critical',
  policy.profiles.research.criteria.every((item) => item.critical)
    && containsAll(
      policy.profiles.research.criteria.map((item) => item.id),
      [
        'question-and-claim',
        'source-integrity',
        'method-and-protocol',
        'evidence-and-analysis',
        'reproducibility-and-limits',
        'writing-defense-and-retention'
      ]
    ),
  profileSummaries.research
);

check(
  'REPAIR-POLICY',
  'repair is source-linked focused append-only and AI-advisory',
  containsAll(policy.repairPolicy.routeInputs, [
    'assessmentErrors',
    'weakTopics',
    'criterionScores',
    'sourceRefs',
    'prerequisiteGraph',
    'schedule'
  ])
    && policy.repairPolicy.rules.some((value) => /one diagnosed error group/.test(value))
    && policy.repairPolicy.rules.some((value) => /appends evidence/.test(value))
    && policy.repairPolicy.rules.some((value) => /AI may suggest/.test(value)),
  policy.repairPolicy
);
check(
  'OFFLINE-POLICY',
  'evidence and deterministic verification work offline without queued AI verification',
  policy.offlinePolicy.evidenceCaptureWithoutNetwork === true
    && policy.offlinePolicy.deterministicVerificationWithoutNetwork === true
    && policy.offlinePolicy.queuedAiVerificationAllowed === false
    && /stable IDs/.test(policy.offlinePolicy.syncRule)
    && /never changes an existing verified score silently/.test(policy.offlinePolicy.syncRule),
  policy.offlinePolicy
);

check(
  'PROGRAM-IDENTITY',
  'B5 inherits official and personalized Bauman identity',
  contract.programIdentity.department === 'ИУ-5'
    && contract.programIdentity.officialPublishedDirectionCode === '09.04.01'
    && contract.programIdentity.personalizedDisplayCode === '09.04.01/11',
  contract.programIdentity
);
const comparisonLabel = ['hu', 'tech'].join('');
check(
  'LEARNER-BRAND-BOUNDARY',
  'Master-ready policy contains no comparison-school learner label',
  !JSON.stringify(policy).toLowerCase().includes(comparisonLabel),
  contract.programIdentity.learnerBrandPolicy
);
check(
  'DOC-COVERAGE',
  'B5 decision record covers stages state evidence verification scoring types repair offline and rollback',
  [
    'Five shared evidence stages',
    'Master-ready state machine',
    'Evidence envelope',
    'Verification authority',
    'Scoring and critical failures',
    'Type-specific defaults',
    'Type evidence examples',
    'Repair behavior',
    'Offline behavior',
    'Compatibility and forward ownership',
    'Rollback',
    'Acceptance'
  ].every((heading) => doc.includes(heading)),
  DOC_PATH
);

const report = {
  schema: 'L6_B5_MASTER_READY_REGRESSION_V1',
  policyId: policy.policyId,
  policyVersion: policy.policyVersion,
  contractVersion: contract.schemaVersion,
  registryVersion: registry.registryVersion,
  stages,
  gateStates: states,
  verificationAuthority: Object.fromEntries(
    Object.entries(actors).map(([id, item]) => [id, item.maySetVerified])
  ),
  profileSummaries,
  profileErrors,
  distinctTotalThresholds: Array.from(totalThresholds),
  distinctRetentionSignatures: Array.from(retentionSignatures),
  offlinePolicy: policy.offlinePolicy,
  checks,
  failures,
  result: failures.length ? 'FAIL' : 'PASS'
};

fs.mkdirSync(path.dirname(path.join(ROOT, REPORT_PATH)), { recursive: true });
fs.writeFileSync(path.join(ROOT, REPORT_PATH), JSON.stringify(report, null, 2) + '\n');

console.log(
  'L6-B5 Master-ready regression: '
    + checks.length
    + ' checks, '
    + failures.length
    + ' failure(s).'
);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(2);
}
console.log('L6-B5 Master-ready regression PASS.');
