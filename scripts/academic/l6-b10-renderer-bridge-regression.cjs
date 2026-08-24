'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.cwd();
const CONTRACT_PATH = 'assets/data/lesson/universal-lesson-renderer-contract-v1.json';
const RENDERER_PATH = 'assets/js/platform/universal-lesson/universal-lesson-renderer-v1.js';
const BRIDGE_PATH = 'assets/js/platform/universal-lesson/legacy-lesson-bridge-v1.js';
const VALIDATOR_PATH = 'assets/js/platform/universal-lesson/lesson-schema-validator-v1.js';
const MIGRATOR_PATH = 'assets/js/platform/universal-lesson/lesson-version-migrator-v1.js';
const FACTORY_PATH = 'assets/js/platform/universal-lesson/subject-factory-registry-v1.js';
const SCHEMA_PATH = 'assets/data/lesson/schema/universal-lesson-v2.schema.json';
const UNIVERSAL_PATH = 'assets/data/lesson/universal-lesson-contract-v2.json';
const BLOCK_POLICY_PATH = 'assets/data/lesson/universal-lesson-block-policy-v1.json';
const TYPE_REGISTRY_PATH = 'assets/data/lesson/lesson-type-registry-v1.json';
const MASTERY_PATH = 'assets/data/lesson/master-ready-policy-v1.json';
const VISUAL_PATH = 'assets/data/lesson/visual-teaching-contract-v1.json';
const LANGUAGE_PATH = 'assets/data/lesson/language-layer-hooks-v1.json';
const MIGRATION_REGISTRY_PATH = 'assets/data/lesson/schema/lesson-migration-registry-v1.json';
const FACTORY_REGISTRY_PATH = 'assets/data/lesson/subject-factory-registry-v1.json';
const CANONICAL_FIXTURE_PATH = 'scripts/academic/fixtures/l6-b8/canonical-minimal-v2.json';
const DOC_PATH = 'docs/migration/L6_B10_UNIVERSAL_LESSON_RENDERER_BRIDGE.md';
const REPORT_PATH = 'docs/migration/L6_B10_RENDERER_BRIDGE_REGRESSION.generated.json';
const EXPECTED_TYPES = [
  'language',
  'mathematics',
  'programming',
  'database',
  'software-design',
  'ml-data',
  'asoiu-system',
  'research'
];
const EXPECTED_SUBJECTS = [
  'russian',
  'math',
  'programming',
  'foundation',
  'ai',
  'signal',
  'systems',
  'research'
];
const LIGHT_SUBJECTS = ['foundation', 'ai', 'signal', 'systems', 'research'];

const checks = [];
const failures = [];
const mutationTests = [];

function absolute(file) {
  return path.join(ROOT, file);
}

function read(file) {
  return fs.readFileSync(absolute(file), 'utf8');
}

function json(file) {
  return JSON.parse(read(file));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(absolute(file))).digest('hex');
}

function digestText(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function unique(values) {
  return Array.from(new Set(values || []));
}

function containsAll(values, required) {
  const set = new Set(values || []);
  return (required || []).every(function (value) { return set.has(value); });
}

function sameSet(left, right) {
  return (left || []).length === (right || []).length
    && containsAll(left, right)
    && containsAll(right, left);
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

function recordMutation(id, title, observed, evidence) {
  const item = {
    id,
    title,
    expectedFailureObserved: Boolean(observed),
    evidence: evidence === undefined ? null : evidence
  };
  mutationTests.push(item);
  check('MUTATION-' + id, title, item.expectedFailureObserved, item.evidence);
}

function loadRuntime(rendererSource, bridgeSource) {
  const sandbox = { window: {}, TextEncoder };
  vm.createContext(sandbox);
  const sources = [
    [VALIDATOR_PATH, read(VALIDATOR_PATH)],
    [MIGRATOR_PATH, read(MIGRATOR_PATH)],
    [FACTORY_PATH, read(FACTORY_PATH)],
    [RENDERER_PATH, rendererSource || read(RENDERER_PATH)],
    [BRIDGE_PATH, bridgeSource || read(BRIDGE_PATH)]
  ];
  for (const entry of sources) {
    vm.runInContext(entry[1], sandbox, { filename: entry[0] });
  }
  return {
    validator: sandbox.window.BaumanUniversalLessonValidator,
    migrator: sandbox.window.BaumanUniversalLessonMigrator,
    factory: sandbox.window.BaumanSubjectFactoryRegistry,
    renderer: sandbox.window.BaumanUniversalLessonRenderer,
    bridge: sandbox.window.BaumanLegacyLessonBridge
  };
}

const requiredFiles = [
  CONTRACT_PATH,
  RENDERER_PATH,
  BRIDGE_PATH,
  VALIDATOR_PATH,
  MIGRATOR_PATH,
  FACTORY_PATH,
  SCHEMA_PATH,
  UNIVERSAL_PATH,
  BLOCK_POLICY_PATH,
  TYPE_REGISTRY_PATH,
  MASTERY_PATH,
  VISUAL_PATH,
  LANGUAGE_PATH,
  MIGRATION_REGISTRY_PATH,
  FACTORY_REGISTRY_PATH,
  CANONICAL_FIXTURE_PATH,
  DOC_PATH
];
for (const subjectId of EXPECTED_SUBJECTS) {
  requiredFiles.push('subjects/' + subjectId + '/index.html');
  requiredFiles.push('subjects/' + subjectId + '/data/lessons.json');
}
for (const file of unique(requiredFiles)) {
  check('FILE-' + file, 'required B10 input exists', fs.existsSync(absolute(file)), file);
}
if (failures.length) {
  console.error('L6-B10 regression cannot start because required inputs are missing.');
  console.error(failures.join('\n'));
  process.exit(2);
}

const rendererSource = read(RENDERER_PATH);
const bridgeSource = read(BRIDGE_PATH);
const runtime = loadRuntime(rendererSource, bridgeSource);
const validator = runtime.validator;
const factory = runtime.factory;
const renderer = runtime.renderer;
const bridge = runtime.bridge;
const rendererContract = json(CONTRACT_PATH);
const schema = json(SCHEMA_PATH);
const universal = json(UNIVERSAL_PATH);
const blockPolicy = json(BLOCK_POLICY_PATH);
const typeRegistry = json(TYPE_REGISTRY_PATH);
const mastery = json(MASTERY_PATH);
const visual = json(VISUAL_PATH);
const language = json(LANGUAGE_PATH);
const migrationRegistry = json(MIGRATION_REGISTRY_PATH);
const registry = json(FACTORY_REGISTRY_PATH);
const canonicalFixture = json(CANONICAL_FIXTURE_PATH);
const doc = read(DOC_PATH);
const dependencies = { rendererContract, schema, blockPolicy, registry };

function sourceBindingFor(lessonId, subjectId) {
  const binding = clone(canonicalFixture.metadata.sourceIdentity);
  binding.sourceArtifactId = 'b10-source-' + subjectId + '-' + lessonId;
  binding.sourceVersion = 'b10-fixture-v1';
  binding.locator.sourcePath = CANONICAL_FIXTURE_PATH;
  binding.locator.recordId = lessonId;
  binding.adapterId = 'b10-regression-fixture';
  return binding;
}

function payloadFor(kind) {
  if (kind === 'orientation') {
    return {
      governingQuestion: 'How does <source> become safe evidence?',
      whyItMatters: 'Connect this lesson to Bauman ИУ-5.',
      successPreview: 'Explain and verify one result.'
    };
  }
  if (kind === 'concept-map') {
    return { nodes: ['input', 'model', 'evidence'], edges: ['input -> model', 'model -> evidence'] };
  }
  if (kind === 'theory') {
    return { claims: ['A claim needs a source and assumptions.'], rules: ['preserve source identity'] };
  }
  if (kind === 'worked-example') {
    return { problem: 'Trace one deterministic example.', steps: ['observe', 'reason', 'verify'], result: 'verified' };
  }
  if (kind === 'exercise') {
    return { prompt: 'Produce a reviewable artifact.', expectedArtifact: 'artifact and explanation' };
  }
  if (kind === 'lab-simulation') {
    return { mode: 'parameter-check', procedure: ['set baseline', 'change one input', 'record result'] };
  }
  if (kind === 'misconception') {
    return { wrongPattern: 'claim without evidence', likelyCause: 'source boundary missing', repairRef: 'block-review' };
  }
  if (kind === 'visual-check') {
    return { visualType: 'state-comparison', correctState: 'source-linked', incorrectState: 'source-free' };
  }
  if (kind === 'oral') {
    return { prompt: 'Defend the result and limitation.', mode: 'oral-defense', language: 'vi' };
  }
  if (kind === 'review') {
    return { retrievalItems: ['governing question', 'verification rule'], repairGroups: ['source boundary'] };
  }
  if (kind === 'assessment') {
    return {
      disclosureMode: 'official-attempt',
      question: 'Which result is source-grounded?',
      answer: 'secret-answer',
      nested: { correctState: 'secret-correct-state' }
    };
  }
  if (kind === 'mastery') {
    return { stageEvidenceRefs: ['evidence-b10'], gatePolicyRef: 'L6-B5' };
  }
  return {
    milestoneRef: 'nir-vkr:test',
    artifactRequirements: ['source', 'method', 'result', 'limitation'],
    nextAction: 'review'
  };
}

const subjectByType = {
  language: 'russian',
  mathematics: 'math',
  programming: 'programming',
  database: 'programming',
  'software-design': 'programming',
  'ml-data': 'ai',
  'asoiu-system': 'systems',
  research: 'research'
};

function canonicalFor(typeId, subjectId) {
  const lessonId = 'b10-' + typeId + '-fixture';
  const evidenceKind = validator.typeEvidenceOutputs[typeId][0];
  const sourceBinding = sourceBindingFor(lessonId, subjectId || subjectByType[typeId]);
  const lesson = clone(canonicalFixture);
  lesson.metadata.lessonId = lessonId;
  lesson.metadata.subjectId = subjectId || subjectByType[typeId];
  lesson.metadata.lessonType = typeId;
  lesson.metadata.titles = {
    primary: 'B10 ' + typeId + ' renderer fixture',
    vi: 'Bài kiểm thử renderer ' + typeId
  };
  lesson.metadata.stageId = 'prepare';
  lesson.metadata.sourceIdentity = sourceBinding;
  lesson.metadata.contentVersion = 'b10-content-v1';
  lesson.metadata.flags = {
    teachesNewConcept: true,
    hasWorkedProcedure: true,
    requiresInteractiveManipulation: true,
    hasDiagnosableVisualState: true,
    requiresOralPerformance: true
  };
  lesson.metadata.assessmentBlueprintRef = 'blueprint:b10';
  lesson.metadata.projectRef = 'project:b10';
  lesson.metadata.experimentRef = 'experiment:b10';
  lesson.metadata.datasetRef = 'dataset:b10';
  lesson.prerequisites = [{
    id: 'prerequisite-b10',
    relation: 'requires',
    targetRef: 'lesson:b10-prior',
    requiredState: 'introduced'
  }];
  lesson.objectives = [{
    id: 'objective-b10',
    statement: 'Produce and explain a source-grounded ' + typeId + ' artifact.',
    evidenceKinds: [evidenceKind],
    language: 'en'
  }];
  lesson.blocks = renderer.blockOrder.map(function (kind) {
    return {
      id: 'block-' + kind,
      kind,
      sourceBindings: [clone(sourceBinding)],
      payload: payloadFor(kind),
      presentationHint: { preferredStrategy: 'inline-flow', accessibilityMode: 'semantic' },
      evidenceRefs: ['objective-b10'],
      offlineRef: 'lesson-core',
      specialistCapabilityRef: null
    };
  });
  lesson.masteryEvidence = [{
    id: 'evidence-b10',
    stage: 'solve',
    evidenceKind,
    status: 'verified',
    artifactRefs: ['artifact:b10']
  }];
  lesson.provenance = {
    sourceRefs: [sourceBinding.sourceArtifactId],
    userEvidenceRefs: [],
    systemDerivedRefs: [],
    aiInferenceRefs: []
  };
  return lesson;
}

function capabilitiesFor(typeId) {
  const table = renderer.policyTable(blockPolicy, typeId, null);
  return unique(Object.values(table.table || {}).flatMap(function (entry) {
    return entry.fulfillment === 'external' ? entry.capabilityRefs || [] : [];
  }));
}

check(
  'CONTRACT-IDENTITY',
  'renderer contract has stable B10 identity and version',
  rendererContract.contractId === 'bauman-universal-lesson-renderer-contract'
    && rendererContract.contractVersion === '1.0.0'
    && rendererContract.status === 'L6-B10-RENDERER-BRIDGE-CONTRACT',
  {
    id: rendererContract.contractId,
    version: rendererContract.contractVersion,
    status: rendererContract.status
  }
);
check(
  'PROGRAM-IDENTITY',
  'renderer contract preserves distinct official and personalized Bauman codes',
  rendererContract.programIdentity.department === 'ИУ-5'
    && rendererContract.programIdentity.officialPublishedDirectionCode === '09.04.01'
    && rendererContract.programIdentity.personalizedDisplayCode === '09.04.01/11',
  rendererContract.programIdentity
);
check(
  'CONTRACT-REFS',
  'renderer contract references B2 through B9 artifacts exactly',
  sameSet(Object.values(rendererContract.contractRefs), [
    UNIVERSAL_PATH,
    BLOCK_POLICY_PATH,
    TYPE_REGISTRY_PATH,
    MASTERY_PATH,
    VISUAL_PATH,
    LANGUAGE_PATH,
    SCHEMA_PATH,
    MIGRATION_REGISTRY_PATH,
    FACTORY_REGISTRY_PATH
  ]),
  rendererContract.contractRefs
);
for (const [refId, file] of Object.entries(rendererContract.contractRefs)) {
  check(
    'CONTRACT-REF-' + refId,
    'renderer contract reference exists',
    fs.existsSync(absolute(file)),
    file
  );
}
check(
  'RUNTIME-BOUNDARY',
  'B10 contract is pure and leaves runtime wiring to B11',
  rendererContract.runtimeBoundary.purePlanning === true
    && rendererContract.runtimeBoundary.domWriteAllowed === false
    && rendererContract.runtimeBoundary.networkAllowed === false
    && rendererContract.runtimeBoundary.cacheWriteAllowed === false
    && rendererContract.runtimeBoundary.sourceMutationAllowed === false
    && rendererContract.runtimeBoundary.learnerStateWriteAllowed === false
    && rendererContract.runtimeBoundary.legacyStateKeyMutationAllowed === false
    && rendererContract.runtimeBoundary.runtimeWiringInB10 === false
    && rendererContract.runtimeBoundary.runtimeActivationRound === 'L6-B11',
  rendererContract.runtimeBoundary
);
check(
  'PRESENTATION-VOCABULARY',
  'renderer keeps all seven B2 strategies without creating fixed tabs routes or empty views',
  sameSet(rendererContract.presentation.strategies, universal.presentationContract.strategies)
    && sameSet(renderer.strategies, universal.presentationContract.strategies)
    && rendererContract.presentation.createsFixedTabs === false
    && rendererContract.presentation.createsRoutes === false
    && rendererContract.presentation.createsEmptyViews === false,
  rendererContract.presentation
);
check(
  'SEMANTIC-ORDER',
  'renderer semantic order is exactly the 13 B2 block kinds',
  sameSet(rendererContract.presentation.semanticOrder, Object.keys(universal.semanticBlockCatalog))
    && sameSet(renderer.blockOrder, Object.keys(universal.semanticBlockCatalog))
    && renderer.blockOrder.length === 13,
  renderer.blockOrder
);
check(
  'BLOCK-LABELS',
  'every semantic block has a non-empty learner label',
  renderer.blockOrder.every(function (kind) {
    return typeof renderer.blockLabels[kind] === 'string'
      && renderer.blockLabels[kind].length > 0
      && rendererContract.presentation.blockLabelsVi[kind] === renderer.blockLabels[kind];
  }),
  rendererContract.presentation.blockLabelsVi
);
check(
  'CAPABILITY-WIDGET-COVERAGE',
  'capability catalog covers exactly every B9 widget',
  sameSet(Object.keys(rendererContract.capabilityProviderCatalog), Object.keys(registry.widgetCatalog)),
  {
    contract: Object.keys(rendererContract.capabilityProviderCatalog),
    factory: Object.keys(registry.widgetCatalog)
  }
);
for (const [widgetId, capabilities] of Object.entries(rendererContract.capabilityProviderCatalog)) {
  check(
    'CAPABILITY-' + widgetId,
    'widget capability map uses non-empty unique safe identifiers',
    Array.isArray(capabilities)
      && capabilities.length > 0
      && capabilities.length === unique(capabilities).length
      && capabilities.every(function (capability) {
        return /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(capability) && !capability.includes('..');
      }),
    capabilities
  );
}
check(
  'DEPENDENCY-AUDIT',
  'bridge dependency audit accepts the locked B8-B10 stack',
  bridge.dependencyAudit(dependencies).ok,
  bridge.dependencyAudit(dependencies)
);
check(
  'RELEASES',
  'renderer and bridge expose stable B10 releases',
  renderer.release === 'L6-B10-UNIVERSAL-LESSON-RENDERER-V1'
    && bridge.release === 'L6-B10-LEGACY-LESSON-BRIDGE-V1',
  { renderer: renderer.release, bridge: bridge.release }
);

const typeEvidence = {};
for (const typeId of EXPECTED_TYPES) {
  const lesson = canonicalFor(typeId);
  const before = JSON.stringify(lesson);
  const validation = validator.validateLesson(lesson, schema);
  const first = renderer.buildRenderModel(lesson, schema, blockPolicy, {
    availableCapabilities: capabilitiesFor(typeId),
    strategy: 'inline-flow'
  });
  const second = renderer.buildRenderModel(lesson, schema, blockPolicy, {
    availableCapabilities: capabilitiesFor(typeId),
    strategy: 'inline-flow'
  });
  const htmlFirst = first.ok ? renderer.renderToHtml(first.model, { attemptSubmitted: true }) : null;
  const htmlSecond = second.ok ? renderer.renderToHtml(second.model, { attemptSubmitted: true }) : null;
  typeEvidence[typeId] = {
    schemaValid: validation.valid,
    state: first.code,
    sectionCount: first.model?.sections?.length || 0,
    modelDigest: first.modelDigest || null,
    htmlDigest: htmlFirst?.htmlDigest || null,
    omittedKinds: first.policy?.omittedKinds || [],
    warnings: first.policy?.warnings || []
  };
  check(
    'TYPE-SCHEMA-' + typeId,
    'synthetic canonical type fixture passes the B8 schema',
    validation.valid,
    validation.errors
  );
  check(
    'TYPE-POLICY-' + typeId,
    'canonical type fixture resolves the exact B3 policy',
    first.ok
      && first.code === 'CANONICAL_RENDER_READY'
      && first.policy.ok
      && first.model.lessonType === typeId
      && first.model.masterReadyClaimed === false,
    first.ok ? typeEvidence[typeId] : first
  );
  check(
    'TYPE-HTML-' + typeId,
    'canonical type fixture renders safe semantic HTML',
    htmlFirst?.ok
      && htmlFirst.code === 'HTML_RENDERED'
      && htmlFirst.html.includes('data-lesson-type="' + typeId + '"')
      && !/<script/i.test(htmlFirst.html)
      && !/\sonclick\s*=|\sonerror\s*=/i.test(htmlFirst.html)
      && !/role="tab"/i.test(htmlFirst.html),
    htmlFirst?.ok ? htmlFirst.htmlDigest : htmlFirst
  );
  check(
    'TYPE-DETERMINISTIC-' + typeId,
    'canonical render model and HTML are deterministic',
    first.modelDigest === second.modelDigest
      && htmlFirst?.htmlDigest === htmlSecond?.htmlDigest
      && htmlFirst?.html === htmlSecond?.html,
    { model: first.modelDigest, html: htmlFirst?.htmlDigest }
  );
  check(
    'TYPE-SOURCE-' + typeId,
    'renderer leaves the canonical type source unchanged',
    JSON.stringify(lesson) === before,
    validator.hash256(lesson)
  );
}

const fullProgramming = canonicalFor('programming');
const missingReview = clone(fullProgramming);
missingReview.blocks = missingReview.blocks.filter(function (block) { return block.kind !== 'review'; });
const missingReviewResult = renderer.buildRenderModel(
  missingReview,
  schema,
  blockPolicy,
  { availableCapabilities: capabilitiesFor('programming') }
);
check(
  'POLICY-REQUIRED-MISSING',
  'missing required review block fails closed',
  !missingReviewResult.ok
    && missingReviewResult.code === 'POLICY_BLOCKED'
    && missingReviewResult.policy.errors.some(function (item) {
      return item.code === 'MISSING_REQUIRED_BLOCK' && item.kind === 'review';
    }),
  missingReviewResult.policy?.errors
);

const missingCapabilityResult = renderer.buildRenderModel(
  fullProgramming,
  schema,
  blockPolicy,
  { availableCapabilities: [] }
);
check(
  'POLICY-EXTERNAL-MISSING',
  'missing required Programming external capabilities fails closed',
  !missingCapabilityResult.ok
    && missingCapabilityResult.policy.errors.some(function (item) {
      return ['EXTERNAL_CAPABILITY_UNAVAILABLE', 'MISSING_EXTERNAL_CAPABILITY'].includes(item.code)
        && item.kind === 'lab-simulation';
    }),
  missingCapabilityResult.policy?.errors
);

function minimalModeLesson(mode) {
  const lesson = canonicalFor('programming');
  lesson.metadata.flags = {
    teachesNewConcept: false,
    hasWorkedProcedure: false,
    requiresInteractiveManipulation: false,
    hasDiagnosableVisualState: false,
    requiresOralPerformance: false
  };
  delete lesson.metadata.assessmentBlueprintRef;
  delete lesson.metadata.projectRef;
  delete lesson.metadata.experimentRef;
  delete lesson.metadata.datasetRef;
  lesson.prerequisites = [];
  const keep = {
    'orientation-only': ['orientation'],
    diagnostic: ['orientation', 'assessment'],
    recovery: ['exercise', 'misconception', 'review', 'mastery']
  }[mode];
  lesson.blocks = lesson.blocks.filter(function (block) { return keep.includes(block.kind); });
  return lesson;
}

for (const [mode, expectedKinds] of Object.entries({
  'orientation-only': ['orientation'],
  diagnostic: ['orientation', 'assessment'],
  recovery: ['exercise', 'misconception', 'review', 'mastery']
})) {
  const lesson = minimalModeLesson(mode);
  const result = renderer.buildRenderModel(lesson, schema, blockPolicy, {
    lessonMode: mode,
    availableCapabilities: []
  });
  check(
    'MODE-' + mode,
    'registered lesson mode renders only its populated required semantic set',
    result.ok
      && sameSet(result.model.sections.map(function (section) { return section.kind; }), expectedKinds)
      && result.model.sections.length === expectedKinds.length,
    result.ok ? result.model.sections.map(function (section) { return section.kind; }) : result
  );
  if (mode === 'orientation-only') {
    check(
      'MODE-ORIENTATION-MASTERY',
      'orientation-only suppresses top-level mastery evidence and claims no completion',
      result.ok
        && result.model.masteryEvidence.length === 0
        && result.model.policyEvidence.suppressedMasteryEvidenceCount === 1
        && result.model.masterReadyClaimed === false,
      result.model
    );
  }
}

const forbiddenLesson = minimalModeLesson('orientation-only');
forbiddenLesson.blocks.push(clone(fullProgramming.blocks.find(function (block) {
  return block.kind === 'mastery';
})));
const forbiddenResult = renderer.buildRenderModel(forbiddenLesson, schema, blockPolicy, {
  lessonMode: 'orientation-only',
  availableCapabilities: []
});
check(
  'POLICY-FORBIDDEN',
  'forbidden mastery block is quarantined and blocks orientation-only mode',
  !forbiddenResult.ok
    && forbiddenResult.policy.errors.some(function (item) {
      return item.code === 'FORBIDDEN_BLOCK_PRESENT' && item.kind === 'mastery';
    })
    && forbiddenResult.policy.quarantinedBlockIds.includes('block-mastery'),
  forbiddenResult.policy
);
check(
  'POLICY-UNKNOWN-MODE',
  'unknown lesson mode fails closed',
  renderer.buildRenderModel(fullProgramming, schema, blockPolicy, {
    lessonMode: 'unknown-mode',
    availableCapabilities: capabilitiesFor('programming')
  }).policy?.code === 'UNKNOWN_LESSON_MODE',
  'UNKNOWN_LESSON_MODE'
);

const conditionalLesson = canonicalFor('programming');
conditionalLesson.metadata.flags.teachesNewConcept = false;
const conditionalResult = renderer.buildRenderModel(conditionalLesson, schema, blockPolicy, {
  availableCapabilities: capabilitiesFor('programming')
});
check(
  'POLICY-CONDITIONAL-PRESENT',
  'false conditional keeps present source content as optional with warning',
  conditionalResult.ok
    && conditionalResult.model.sections.some(function (section) { return section.kind === 'theory'; })
    && conditionalResult.policy.warnings.some(function (item) {
      return item.code === 'CONDITIONAL_FALSE_CONTENT_RETAINED' && item.kind === 'theory';
    }),
  conditionalResult.policy?.warnings
);

const unknownStrategyResult = renderer.buildRenderModel(fullProgramming, schema, blockPolicy, {
  availableCapabilities: capabilitiesFor('programming'),
  strategy: 'unsafe-unknown-strategy'
});
check(
  'PRESENTATION-UNKNOWN-HINT',
  'unknown requested strategy falls back deterministically without dropping content',
  unknownStrategyResult.ok
    && unknownStrategyResult.model.strategy === 'inline-flow'
    && unknownStrategyResult.model.sections.length > 0,
  unknownStrategyResult.model?.strategy
);

const injectionLesson = canonicalFor('programming');
injectionLesson.metadata.titles.primary = '<img src=x onerror=alert(1)>';
injectionLesson.blocks.find(function (block) {
  return block.kind === 'orientation';
}).payload.governingQuestion = '<script>alert(1)</script>';
const injectionRender = renderer.buildRenderModel(injectionLesson, schema, blockPolicy, {
  availableCapabilities: capabilitiesFor('programming')
});
const injectionHtml = renderer.renderToHtml(injectionRender.model, { attemptSubmitted: true });
check(
  'HTML-ESCAPING',
  'source markup is escaped and cannot create script image or inline handler nodes',
  injectionHtml.ok
    && !/<(?:script|img)\b/i.test(injectionHtml.html)
    && !/<[^>]+\son(?:click|error)\s*=/i.test(injectionHtml.html)
    && injectionHtml.html.includes('&lt;script&gt;alert(1)&lt;/script&gt;')
    && injectionHtml.html.includes('&lt;img src=x onerror=alert(1)&gt;'),
  injectionHtml.htmlDigest
);

const protectedRender = renderer.buildRenderModel(fullProgramming, schema, blockPolicy, {
  availableCapabilities: capabilitiesFor('programming')
});
const protectedHtml = renderer.renderToHtml(protectedRender.model, {
  activeOfficialAttempt: true,
  attemptSubmitted: false
});
const submittedHtml = renderer.renderToHtml(protectedRender.model, {
  activeOfficialAttempt: false,
  attemptSubmitted: true
});
check(
  'ASSESSMENT-PROTECTED',
  'active official attempt recursively hides answer solution and correct-state keys',
  protectedHtml.ok
    && protectedHtml.html.includes('[protected-until-submit]')
    && !protectedHtml.html.includes('secret-answer')
    && !protectedHtml.html.includes('secret-correct-state'),
  protectedHtml.htmlDigest
);
check(
  'ASSESSMENT-SUBMITTED',
  'explicit submitted review may display escaped answer material',
  submittedHtml.ok
    && submittedHtml.html.includes('secret-answer')
    && submittedHtml.html.includes('secret-correct-state'),
  submittedHtml.htmlDigest
);
check(
  'HTML-INVALID-MODEL',
  'HTML renderer rejects arbitrary non-ready models',
  renderer.renderToHtml({ state: 'POLICY_BLOCKED', sections: [] }).code === 'INVALID_RENDER_MODEL',
  renderer.renderToHtml({ state: 'POLICY_BLOCKED', sections: [] })
);

const providerEvidence = {};
for (const subjectId of EXPECTED_SUBJECTS) {
  const providers = bridge.capabilityProviders(registry, rendererContract, subjectId);
  providerEvidence[subjectId] = providers;
  const widgetRefs = registry.subjects[subjectId].widgetRefs;
  check(
    'PROVIDERS-' + subjectId,
    'bridge exposes capabilities only through existing subject widgets',
    Object.values(providers).every(function (provider) {
      const widget = registry.widgetCatalog[provider.widgetId];
      return widgetRefs.includes(provider.widgetId)
        && ['existing', 'existing-lazy'].includes(widget.availability);
    }),
    providers
  );
}
check(
  'PROVIDERS-PLANNED-EXCLUDED',
  'declared and planned widgets do not expose external capabilities',
  !Object.values(providerEvidence.programming).some(function (provider) {
    return provider.widgetId === 'code-runner' || provider.widgetId === 'sql-playground';
  })
    && !Object.values(providerEvidence.ai).some(function (provider) {
      return provider.widgetId === 'model-metric-visual';
    })
    && !Object.values(providerEvidence.signal).some(function (provider) {
      return provider.widgetId === 'signal-plot';
    })
    && !Object.values(providerEvidence.systems).some(function (provider) {
      return provider.widgetId === 'system-architecture-workspace';
    })
    && !Object.values(providerEvidence.research).some(function (provider) {
      return provider.widgetId === 'research-evidence-board';
    }),
  providerEvidence
);

const specialistSources = {
  russian: json('subjects/russian/data/lessons.json')[0],
  math: json('subjects/math/data/lessons.json')[0],
  programming: json('subjects/programming/data/lessons.json')[0]
};
const specialistPlans = {};
for (const subjectId of ['russian', 'math', 'programming']) {
  const source = specialistSources[subjectId];
  const before = JSON.stringify(source);
  const plan = bridge.plan(source, { subjectId }, dependencies);
  specialistPlans[subjectId] = plan;
  check(
    'BRIDGE-SPECIALIST-' + subjectId,
    'specialist subject delegates to the unchanged engine route',
    plan.ok
      && plan.code === 'DELEGATE_SPECIALIST_ENGINE'
      && plan.delegate.route === registry.subjects[subjectId].routes.main
      && plan.projection === null
      && plan.render === null
      && plan.sourceMutationAllowed === false
      && plan.learnerStateWriteAllowed === false,
    plan
  );
  check(
    'BRIDGE-SPECIALIST-SOURCE-' + subjectId,
    'specialist bridge leaves source byte-equivalent',
    JSON.stringify(source) === before && plan.sourceUnchanged,
    plan.sourceDigest
  );
  const rollback = bridge.rollback(plan, source);
  check(
    'BRIDGE-SPECIALIST-ROLLBACK-' + subjectId,
    'specialist rollback restores the direct unchanged route',
    rollback.ok
      && rollback.code === 'UNCHANGED_ENGINE_ROUTE_RESTORED'
      && rollback.route === registry.subjects[subjectId].routes.main
      && rollback.learnerStateWritePerformed === false
      && rollback.cacheWritePerformed === false,
    rollback
  );
}

const lightPlans = {};
for (const subjectId of LIGHT_SUBJECTS) {
  const lessons = json('subjects/' + subjectId + '/data/lessons.json');
  const source = subjectId === 'foundation'
    ? lessons.find(function (lesson) { return lesson.id === 'f_s03_l1'; })
    : lessons[0];
  const before = JSON.stringify(source);
  const plan = bridge.plan(source, { subjectId }, dependencies);
  lightPlans[subjectId] = plan;
  check(
    'BRIDGE-LIGHT-REVIEW-' + subjectId,
    'current light eLearning source remains review-only by default',
    plan.ok
      && plan.code === 'REVIEW_REQUIRED'
      && plan.projection.manualReviewRequired === true
      && plan.render === null
      && plan.masterReadyClaimed === false,
    plan
  );
  check(
    'BRIDGE-LIGHT-SOURCE-' + subjectId,
    'light review planning leaves source unchanged',
    JSON.stringify(source) === before
      && plan.sourceUnchanged
      && plan.projection.sourceUnchanged,
    plan.projection
  );
  const preview = bridge.plan(source, { subjectId, reviewPreview: true }, dependencies);
  check(
    'BRIDGE-LIGHT-GAP-' + subjectId,
    'current light review preview fails closed on an unmet strict B3 capability or block',
    !preview.ok
      && preview.code === 'REVIEW_PREVIEW_BLOCKED'
      && preview.render.policy.errors.length > 0
      && preview.masterReadyClaimed === false,
    preview.render?.policy?.errors
  );
}

const foundationHeld = json('subjects/foundation/data/lessons.json').find(function (lesson) {
  return lesson.id === 'f_m201_l1';
});
const foundationHeldPlan = bridge.plan(
  foundationHeld,
  { subjectId: 'foundation', reviewPreview: true },
  dependencies
);
check(
  'BRIDGE-FOUNDATION-HELD',
  'Foundation unreviewed module remains UNCLASSIFIED_LESSON',
  !foundationHeldPlan.ok && foundationHeldPlan.code === 'UNCLASSIFIED_LESSON',
  foundationHeldPlan
);

const orientationAi = canonicalFor('ml-data', 'ai');
orientationAi.blocks = orientationAi.blocks.filter(function (block) {
  return block.kind === 'orientation';
});
orientationAi.metadata.flags = {
  teachesNewConcept: false,
  hasWorkedProcedure: false,
  requiresInteractiveManipulation: false,
  hasDiagnosableVisualState: false,
  requiresOralPerformance: false
};
delete orientationAi.metadata.assessmentBlueprintRef;
delete orientationAi.metadata.projectRef;
delete orientationAi.metadata.experimentRef;
delete orientationAi.metadata.datasetRef;
orientationAi.prerequisites = [];
const orientationAiPlan = bridge.plan(orientationAi, {
  subjectId: 'ai',
  lessonMode: 'orientation-only'
}, dependencies);
check(
  'BRIDGE-CANONICAL-LIGHT',
  'bridge can build a safe canonical orientation-only light render plan',
  orientationAiPlan.ok
    && orientationAiPlan.code === 'CANONICAL_RENDER_READY'
    && orientationAiPlan.render.model.reviewPreview === false
    && orientationAiPlan.render.model.sections.length === 1
    && orientationAiPlan.render.html.includes('data-universal-lesson')
    && orientationAiPlan.masterReadyClaimed === false,
  orientationAiPlan.ok ? {
    code: orientationAiPlan.code,
    sections: orientationAiPlan.render.model.sections.length,
    htmlDigest: orientationAiPlan.render.htmlDigest
  } : orientationAiPlan
);
const orientationRollback = bridge.rollback(orientationAiPlan, orientationAi);
check(
  'BRIDGE-CANONICAL-ROLLBACK',
  'canonical light plan rolls back to the unchanged light route',
  orientationRollback.ok
    && orientationRollback.route === registry.subjects.ai.routes.main,
  orientationRollback
);

const fullAi = canonicalFor('ml-data', 'ai');
const fullAiPlan = bridge.plan(fullAi, { subjectId: 'ai' }, dependencies);
check(
  'BRIDGE-CANONICAL-CAPABILITY-GAP',
  'full canonical light lesson cannot use declared metric widget as implemented capability',
  !fullAiPlan.ok
    && fullAiPlan.code === 'POLICY_BLOCKED'
    && fullAiPlan.render.policy.errors.some(function (item) {
      return ['lab-simulation', 'visual-check'].includes(item.kind);
    }),
  fullAiPlan.render?.policy?.errors
);

const writeOutcomes = {};
for (const requestKey of ['apply', 'write', 'commit', 'persist', 'activate']) {
  writeOutcomes[requestKey] = bridge.plan(
    specialistSources.russian,
    { subjectId: 'russian', [requestKey]: true },
    dependencies
  );
}
check(
  'BRIDGE-PLAN-ONLY',
  'apply write commit persist and activate requests all fail closed',
  Object.values(writeOutcomes).every(function (result) {
    return !result.ok && result.code === 'B10_PLAN_ONLY';
  }),
  Object.fromEntries(Object.entries(writeOutcomes).map(function (entry) {
    return [entry[0], entry[1].code];
  }))
);
check(
  'BRIDGE-SUBJECT-GUARDS',
  'unknown and unsafe subject IDs fail closed',
  bridge.plan({}, { subjectId: 'unknown' }, dependencies).code === 'UNKNOWN_SUBJECT'
    && bridge.plan({}, { subjectId: '../math' }, dependencies).code === 'INVALID_SUBJECT_ID',
  {
    unknown: bridge.plan({}, { subjectId: 'unknown' }, dependencies).code,
    unsafe: bridge.plan({}, { subjectId: '../math' }, dependencies).code
  }
);
check(
  'BRIDGE-CREDENTIAL-GUARD',
  'credential-like bridge request is rejected before planning',
  bridge.plan(
    specialistSources.russian,
    { subjectId: 'russian', apiKey: 'forbidden-test-value' },
    dependencies
  ).code === 'INVALID_BRIDGE_REQUEST',
  'INVALID_BRIDGE_REQUEST'
);
check(
  'BRIDGE-INVALID-SOURCE',
  'null and non-JSON sources fail closed',
  bridge.plan(null, { subjectId: 'ai' }, dependencies).code === 'INVALID_SOURCE'
    && bridge.plan({ value: Number.NaN }, { subjectId: 'ai' }, dependencies).code === 'INVALID_SOURCE',
  'INVALID_SOURCE'
);

const tamperedRussian = clone(specialistSources.russian);
tamperedRussian.title = 'tampered';
const tamperedRollback = bridge.rollback(specialistPlans.russian, tamperedRussian);
check(
  'ROLLBACK-INTEGRITY',
  'rollback rejects a source that differs from the planned digest',
  !tamperedRollback.ok && tamperedRollback.code === 'SOURCE_INTEGRITY_FAILED',
  tamperedRollback
);

check(
  'PURE-RENDERER',
  'renderer source has no DOM network cache or persistence side effect',
  !/\bdocument\b/.test(rendererSource)
    && !/\bfetch\s*\(/.test(rendererSource)
    && !/\blocalStorage\b/.test(rendererSource)
    && !/\bindexedDB\b/.test(rendererSource)
    && !/\bcaches\b/.test(rendererSource)
    && !/\.innerHTML\s*=/.test(rendererSource),
  RENDERER_PATH
);
check(
  'PURE-BRIDGE',
  'bridge source has no DOM network cache or persistence side effect',
  !/\bdocument\b/.test(bridgeSource)
    && !/\bfetch\s*\(/.test(bridgeSource)
    && !/\blocalStorage\b/.test(bridgeSource)
    && !/\bindexedDB\b/.test(bridgeSource)
    && !/\bcaches\b/.test(bridgeSource)
    && !/\.innerHTML\s*=/.test(bridgeSource),
  BRIDGE_PATH
);

const learnerSurfacePaths = ['index.html', 'assets/js/data.js'].concat(EXPECTED_SUBJECTS.map(function (subjectId) {
  return 'subjects/' + subjectId + '/index.html';
}));
check(
  'B10-NO-RUNTIME-WIRING',
  'B10 modules are not loaded by current learner entry points',
  learnerSurfacePaths.every(function (file) {
    const source = read(file);
    return !/universal-lesson-renderer-v1/.test(source)
      && !/legacy-lesson-bridge-v1/.test(source)
      && !/BaumanLegacyLessonBridge/.test(source);
  }),
  learnerSurfacePaths
);
check(
  'LEARNER-BRAND',
  'current learner entry surfaces and B10 HTML contain no comparison-school label',
  learnerSurfacePaths.every(function (file) { return !/HUTECH/i.test(read(file)); })
    && !/HUTECH/i.test(orientationAiPlan.render.html),
  learnerSurfacePaths
);
check(
  'IDENTITY-DISPLAY',
  'generic learner HTML displays personalized code without rewriting official metadata',
  orientationAiPlan.render.html.includes('09.04.01/11')
    && orientationAi.metadata.programIdentity.officialPublishedDirectionCode === '09.04.01'
    && orientationAi.metadata.programIdentity.personalizedDisplayCode === '09.04.01/11',
  orientationAi.metadata.programIdentity
);

let dependencyMutant = clone(rendererContract);
dependencyMutant.runtimeBoundary.runtimeWiringInB10 = true;
let mutationResult = bridge.dependencyAudit({
  rendererContract: dependencyMutant,
  schema,
  blockPolicy,
  registry
});
recordMutation(
  'RUNTIME-WIRING',
  'activating B10 runtime wiring is rejected by dependency audit',
  !mutationResult.ok && mutationResult.errors.some(function (item) {
    return item.code === 'B10_RUNTIME_BOUNDARY_BROKEN';
  }),
  mutationResult.errors
);

const availabilityNeedle = "if (!isObject(widget) || !['existing', 'existing-lazy'].includes(widget.availability)) return;";
const availabilityMutantSource = bridgeSource.replace(
  availabilityNeedle,
  'if (!isObject(widget)) return;'
);
let availabilityObserved = false;
let availabilityEvidence = null;
try {
  const mutant = loadRuntime(rendererSource, availabilityMutantSource);
  const providers = mutant.bridge.capabilityProviders(registry, rendererContract, 'ai');
  availabilityObserved = availabilityMutantSource !== bridgeSource
    && Object.values(providers).some(function (provider) {
      return provider.widgetId === 'model-metric-visual';
    });
  availabilityEvidence = providers;
} catch (error) {
  availabilityEvidence = { error: String(error && error.message || error) };
}
recordMutation(
  'PLANNED-CAPABILITY',
  'removing availability guard exposes a declared widget as implemented',
  availabilityObserved,
  availabilityEvidence
);

const escapeNeedle = "'<': '&lt;',";
const escapeMutantSource = rendererSource
  .replace(escapeNeedle, "'<': '<',")
  .replace("'>': '&gt;',", "'>': '>',");
let escapeObserved = false;
let escapeEvidence = null;
try {
  const mutant = loadRuntime(escapeMutantSource, bridgeSource);
  const lesson = canonicalFor('programming');
  lesson.metadata.titles.primary = '<script>mutant-title</script>';
  const built = mutant.renderer.buildRenderModel(lesson, schema, blockPolicy, {
    availableCapabilities: capabilitiesFor('programming')
  });
  const html = mutant.renderer.renderToHtml(built.model, { attemptSubmitted: true });
  escapeObserved = escapeMutantSource !== rendererSource && /<script>mutant-title<\/script>/.test(html.html);
  escapeEvidence = {
    mutantLoaded: escapeMutantSource !== rendererSource,
    rawScriptObserved: /<script>mutant-title<\/script>/.test(html.html)
  };
} catch (error) {
  escapeEvidence = { error: String(error && error.message || error) };
}
recordMutation(
  'HTML-ESCAPE',
  'removing less-than escaping exposes source script markup',
  escapeObserved,
  escapeEvidence
);

const protectedNeedle = "    'answer',\n";
const protectedMutantSource = rendererSource.replace(protectedNeedle, '');
let protectedObserved = false;
let protectedEvidence = null;
try {
  const mutant = loadRuntime(protectedMutantSource, bridgeSource);
  const lesson = canonicalFor('programming');
  const built = mutant.renderer.buildRenderModel(lesson, schema, blockPolicy, {
    availableCapabilities: capabilitiesFor('programming')
  });
  const html = mutant.renderer.renderToHtml(built.model, { activeOfficialAttempt: true });
  protectedObserved = protectedMutantSource !== rendererSource && html.html.includes('secret-answer');
  protectedEvidence = {
    mutantLoaded: protectedMutantSource !== rendererSource,
    answerLeaked: html.html.includes('secret-answer')
  };
} catch (error) {
  protectedEvidence = { error: String(error && error.message || error) };
}
recordMutation(
  'ANSWER-DISCLOSURE',
  'removing answer protection leaks official-attempt material',
  protectedObserved,
  protectedEvidence
);

const forbiddenNeedle = "if (effectiveRequirement === 'forbidden') {";
const forbiddenMutantSource = rendererSource.replace(forbiddenNeedle, 'if (false) {');
let forbiddenObserved = false;
let forbiddenEvidence = null;
try {
  const mutant = loadRuntime(forbiddenMutantSource, bridgeSource);
  const lesson = minimalModeLesson('orientation-only');
  lesson.blocks.push(clone(fullProgramming.blocks.find(function (block) {
    return block.kind === 'mastery';
  })));
  const built = mutant.renderer.buildRenderModel(lesson, schema, blockPolicy, {
    lessonMode: 'orientation-only',
    availableCapabilities: []
  });
  forbiddenObserved = forbiddenMutantSource !== rendererSource && built.ok;
  forbiddenEvidence = {
    mutantLoaded: forbiddenMutantSource !== rendererSource,
    ok: built.ok,
    sections: built.model?.sections?.map(function (section) { return section.kind; }) || []
  };
} catch (error) {
  forbiddenEvidence = { error: String(error && error.message || error) };
}
recordMutation(
  'FORBIDDEN-BLOCK',
  'removing forbidden-block guard lets mastery enter orientation-only mode',
  forbiddenObserved,
  forbiddenEvidence
);

const planNeedle = 'if (request.apply === true || request.write === true || request.commit === true';
const planMutantSource = bridgeSource.replace(
  planNeedle,
  'if (false || request.write === true || request.commit === true'
);
let planObserved = false;
let planEvidence = null;
try {
  const mutant = loadRuntime(rendererSource, planMutantSource);
  const result = mutant.bridge.plan(
    specialistSources.russian,
    { subjectId: 'russian', apply: true },
    dependencies
  );
  planObserved = planMutantSource !== bridgeSource && result.code !== 'B10_PLAN_ONLY';
  planEvidence = { mutantLoaded: planMutantSource !== bridgeSource, code: result.code };
} catch (error) {
  planEvidence = { error: String(error && error.message || error) };
}
recordMutation(
  'PLAN-ONLY',
  'removing apply guard lets an activation-shaped request reach routing',
  planObserved,
  planEvidence
);

const specialistNeedle = "const engineIsSpecialist = SPECIALIST_ENGINE_MODES.includes(resolved.engine.mode)\n      || resolved.subject.compatibility.mode === 'read-only-adapter-bridge';";
const specialistMutantSource = bridgeSource.replace(specialistNeedle, 'const engineIsSpecialist = false;');
let specialistObserved = false;
let specialistEvidence = null;
try {
  const mutant = loadRuntime(rendererSource, specialistMutantSource);
  const result = mutant.bridge.plan(
    specialistSources.russian,
    { subjectId: 'russian' },
    dependencies
  );
  specialistObserved = specialistMutantSource !== bridgeSource
    && result.code !== 'DELEGATE_SPECIALIST_ENGINE';
  specialistEvidence = { mutantLoaded: specialistMutantSource !== bridgeSource, code: result.code };
} catch (error) {
  specialistEvidence = { error: String(error && error.message || error) };
}
recordMutation(
  'SPECIALIST-DELEGATION',
  'removing specialist detection breaks unchanged Russian delegation',
  specialistObserved,
  specialistEvidence
);

const rollbackNeedle = 'if (evidence.inspection.errors.length || evidence.digest !== planResult.sourceDigest) {';
const rollbackMutantSource = bridgeSource.replace(
  rollbackNeedle,
  'if (evidence.inspection.errors.length || evidence.digest !== evidence.digest) {'
);
let rollbackObserved = false;
let rollbackEvidence = null;
try {
  const mutant = loadRuntime(rendererSource, rollbackMutantSource);
  const rollback = mutant.bridge.rollback(specialistPlans.russian, tamperedRussian);
  rollbackObserved = rollbackMutantSource !== bridgeSource && rollback.ok;
  rollbackEvidence = { mutantLoaded: rollbackMutantSource !== bridgeSource, rollback };
} catch (error) {
  rollbackEvidence = { error: String(error && error.message || error) };
}
recordMutation(
  'ROLLBACK-DIGEST',
  'removing rollback digest comparison accepts a modified source',
  rollbackObserved,
  rollbackEvidence
);

const externalPolicyMutant = clone(blockPolicy);
externalPolicyMutant.policiesByLessonType.programming.overrides['lab-simulation'].fulfillment = 'either';
const externalPolicyLesson = minimalModeLesson('recovery');
externalPolicyLesson.blocks.push(clone(fullProgramming.blocks.find(function (block) {
  return block.kind === 'orientation';
})));
externalPolicyLesson.blocks.push(clone(fullProgramming.blocks.find(function (block) {
  return block.kind === 'lab-simulation';
})));
externalPolicyLesson.metadata.flags.requiresInteractiveManipulation = true;
const externalPolicyResult = renderer.buildRenderModel(
  externalPolicyLesson,
  schema,
  externalPolicyMutant,
  { lessonMode: 'recovery', assessmentErrors: [], weakTopics: [] }
);
recordMutation(
  'EXTERNAL-LAB-POLICY',
  'weakening Programming code lab from external to either lets inline generic content satisfy it',
  externalPolicyResult.ok
    && externalPolicyResult.model.sections.some(function (section) {
      return section.kind === 'lab-simulation' && section.mode === 'inline';
    }),
  externalPolicyResult.ok ? externalPolicyResult.model.sections : externalPolicyResult.policy?.errors
);

check(
  'MUTATION-SUMMARY',
  'all nine B10 protection mutations fail in the expected direction',
  mutationTests.length === 9
    && mutationTests.every(function (item) { return item.expectedFailureObserved; }),
  mutationTests.map(function (item) {
    return { id: item.id, observed: item.expectedFailureObserved };
  })
);

check(
  'DOC-BOUNDARY',
  'decision record states pending remote CI and no B10 runtime activation',
  /implementation pending remote CI/.test(doc)
    && /B10 deliberately performs no DOM write/.test(doc)
    && /B11 owns the first/.test(doc)
    && /DELEGATE_SPECIALIST_ENGINE/.test(doc),
  DOC_PATH
);
check(
  'DOC-GAP',
  'decision record documents the fail-closed light capability gap',
  /Audit finding: light capability gap/.test(doc)
    && /REVIEW_PREVIEW_BLOCKED/.test(doc)
    && /does not relabel generic buttons/.test(doc),
  DOC_PATH
);
check(
  'DOC-IDENTITY',
  'decision record distinguishes official and personalized codes',
  doc.includes('official source direction:')
    && doc.includes('personalized learner display:')
    && doc.includes('09.04.01')
    && doc.includes('09.04.01/11'),
  DOC_PATH
);

const compatibilityPaths = [
  'assets/js/data.js',
  'assets/js/platform/offline-subject-pack-manager.js',
  'subjects/russian/assets/core.js',
  'subjects/russian/assets/subject-adapter.js',
  'subjects/russian/data/lessons.json',
  'subjects/math/assets/subject-adapter.js',
  'subjects/math/assets/theory_skin/theory-tab-E129.js',
  'subjects/math/data/theory_lecture_content.json',
  'subjects/programming/assets/subject-adapter.js',
  'subjects/programming/data/lessons.json'
].concat(LIGHT_SUBJECTS.flatMap(function (subjectId) {
  return [
    'subjects/' + subjectId + '/assets/' + subjectId + '.js',
    'subjects/' + subjectId + '/data/lessons.json'
  ];
}));
const compatibilityHashes = Object.fromEntries(unique(compatibilityPaths).map(function (file) {
  return [file, sha256(file)];
}));
check(
  'REFERENCE-SOURCE-HASHES',
  'current engines adapters and lessons are hashed for rollback comparison',
  Object.values(compatibilityHashes).every(function (value) {
    return /^[0-9a-f]{64}$/.test(value);
  }),
  compatibilityHashes
);

const b10Artifacts = [CONTRACT_PATH, RENDERER_PATH, BRIDGE_PATH, DOC_PATH];
const b10ArtifactHashes = Object.fromEntries(b10Artifacts.map(function (file) {
  return [file, sha256(file)];
}));
const passed = checks.filter(function (item) { return item.ok; }).length;
const report = {
  schema: 'L6_B10_RENDERER_BRIDGE_REGRESSION_V1',
  status: failures.length ? 'FAIL' : 'PASS',
  branch: 'migration/webapp-l1-audit-storage',
  generatedFor: '2026-08-24',
  scope: 'Pure Universal Lesson policy renderer safe HTML and read-only legacy bridge; no learner runtime activation or state write.',
  summary: {
    total: checks.length,
    passed,
    failed: checks.length - passed,
    canonicalTypes: EXPECTED_TYPES.length,
    specialistDelegates: Object.keys(specialistPlans).length,
    lightReviewSources: Object.keys(lightPlans).length,
    currentLightPolicyGaps: Object.keys(lightPlans).length,
    mutationTests: mutationTests.length,
    expectedMutationFailuresObserved: mutationTests.filter(function (item) {
      return item.expectedFailureObserved;
    }).length
  },
  contracts: {
    rendererContractId: rendererContract.contractId,
    rendererContractVersion: rendererContract.contractVersion,
    rendererRelease: renderer.release,
    bridgeRelease: bridge.release,
    universalContract: universal.contractId,
    blockPolicy: blockPolicy.policyId,
    lessonTypeRegistry: typeRegistry.registryId,
    masteryPolicy: mastery.policyId,
    visualContract: visual.contractId,
    languageContract: language.contractId,
    migrationRegistry: migrationRegistry.registryId,
    subjectFactory: registry.registryId
  },
  typeEvidence,
  capabilityProviders: providerEvidence,
  specialistPlans: Object.fromEntries(Object.entries(specialistPlans).map(function (entry) {
    return [entry[0], {
      code: entry[1].code,
      engineRef: entry[1].engineRef,
      route: entry[1].delegate.route,
      sourceDigest: entry[1].sourceDigest
    }];
  })),
  lightPlans: Object.fromEntries(Object.entries(lightPlans).map(function (entry) {
    return [entry[0], {
      code: entry[1].code,
      lessonType: entry[1].lessonType,
      migrationId: entry[1].projection.migrationId,
      outputDigest: entry[1].projection.outputDigest,
      manualReviewRequired: entry[1].projection.manualReviewRequired
    }];
  })),
  canonicalLightOrientation: {
    code: orientationAiPlan.code,
    sections: orientationAiPlan.render.model.sections.length,
    modelDigest: orientationAiPlan.render.modelDigest,
    htmlDigest: orientationAiPlan.render.htmlDigest
  },
  mutationTests,
  referenceCompatibilitySha256: compatibilityHashes,
  b10ArtifactSha256: b10ArtifactHashes,
  checks
};

fs.writeFileSync(absolute(REPORT_PATH), JSON.stringify(report, null, 2) + '\n');
const reportHash = sha256(REPORT_PATH);

if (failures.length) {
  console.error('L6-B10 renderer/bridge regression: FAIL (' + passed + '/' + checks.length + ')');
  console.error(failures.join('\n'));
  console.error('Report: ' + REPORT_PATH);
  console.error('Report SHA-256: ' + reportHash);
  process.exit(1);
}

console.log('L6-B10 renderer/bridge regression: PASS (' + passed + '/' + checks.length + ')');
console.log('Canonical policy/render types: ' + EXPECTED_TYPES.length + '/' + EXPECTED_TYPES.length);
console.log('Specialist delegates: ' + Object.keys(specialistPlans).length + '/' + Object.keys(specialistPlans).length);
console.log('Light review-only sources: ' + Object.keys(lightPlans).length + '/' + Object.keys(lightPlans).length);
console.log('Mutation tests: ' + mutationTests.length + '/' + mutationTests.length + ' expected failures observed');
console.log('Report: ' + REPORT_PATH);
console.log('Report SHA-256: ' + reportHash);
