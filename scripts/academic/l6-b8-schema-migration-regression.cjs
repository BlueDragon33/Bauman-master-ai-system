'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.cwd();
const SCHEMA_PATH = 'assets/data/lesson/schema/universal-lesson-v2.schema.json';
const MIGRATION_REGISTRY_PATH = 'assets/data/lesson/schema/lesson-migration-registry-v1.json';
const VALIDATOR_PATH = 'assets/js/platform/universal-lesson/lesson-schema-validator-v1.js';
const MIGRATOR_PATH = 'assets/js/platform/universal-lesson/lesson-version-migrator-v1.js';
const UNIVERSAL_PATH = 'assets/data/lesson/universal-lesson-contract-v2.json';
const BLOCK_POLICY_PATH = 'assets/data/lesson/universal-lesson-block-policy-v1.json';
const TYPE_REGISTRY_PATH = 'assets/data/lesson/lesson-type-registry-v1.json';
const MASTERY_PATH = 'assets/data/lesson/master-ready-policy-v1.json';
const VISUAL_PATH = 'assets/data/lesson/visual-teaching-contract-v1.json';
const LANGUAGE_PATH = 'assets/data/lesson/language-layer-hooks-v1.json';
const DOC_PATH = 'docs/migration/L6_B8_LESSON_SCHEMA_VALIDATOR_MIGRATION.md';
const REPORT_PATH = 'docs/migration/L6_B8_SCHEMA_MIGRATION_REGRESSION.generated.json';
const FIXTURE_ROOT = 'scripts/academic/fixtures/l6-b8';
const CANONICAL_FIXTURE = FIXTURE_ROOT + '/canonical-minimal-v2.json';
const UNIVERSAL_V1_FIXTURE = FIXTURE_ROOT + '/legacy-universal-v1.json';
const ELEARNING_FIXTURE = FIXTURE_ROOT + '/legacy-elearning-v1.1.json';
const RUSSIAN_PATH = 'subjects/russian/data/lessons.json';
const RUSSIAN_ADAPTER_PATH = 'subjects/russian/assets/subject-adapter.js';
const RUSSIAN_MANIFEST_PATH = 'subjects/russian/subject-manifest.json';
const MATH_PATH = 'subjects/math/data/theory_core/theory_core_c01_l01.json';
const MATH_RUNTIME_SOURCE_PATH = 'subjects/math/data/theory_lecture_content.json';
const RESEARCH_PATH = 'subjects/research/data/lessons.json';
const RESEARCH_MANIFEST_PATH = 'subjects/research/subject-manifest.json';

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

function stableEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function containsAll(values, required) {
  const set = new Set(values || []);
  return required.every((value) => set.has(value));
}

function sameSet(left, right) {
  return (left || []).length === (right || []).length && containsAll(left, right);
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

function loadRuntime(validatorSource, migratorSource) {
  const sandbox = { window: {}, TextEncoder };
  vm.createContext(sandbox);
  vm.runInContext(validatorSource || read(VALIDATOR_PATH), sandbox, { filename: VALIDATOR_PATH });
  if (migratorSource !== null) {
    vm.runInContext(migratorSource || read(MIGRATOR_PATH), sandbox, { filename: MIGRATOR_PATH });
  }
  return {
    validator: sandbox.window.BaumanUniversalLessonValidator,
    migrator: sandbox.window.BaumanUniversalLessonMigrator || null
  };
}

function pointerParts(pointer) {
  if (typeof pointer !== 'string' || !pointer.startsWith('/')) throw new Error('Invalid fixture pointer');
  return pointer.slice(1).split('/').map((part) => part.replace(/~1/g, '/').replace(/~0/g, '~'));
}

function applyMutationDescriptor(descriptor) {
  const target = clone(json(descriptor.base));
  const mutation = descriptor.mutation;
  const parts = pointerParts(mutation.path);
  if (mutation.operation === 'add-property') {
    let container = target;
    for (const part of parts) container = container[part];
    container[mutation.key] = clone(mutation.value);
    return target;
  }
  let parent = target;
  for (const part of parts.slice(0, -1)) parent = parent[part];
  const key = parts[parts.length - 1];
  if (mutation.operation === 'delete') delete parent[key];
  else if (mutation.operation === 'replace') parent[key] = clone(mutation.value);
  else throw new Error('Unsupported mutation fixture operation: ' + mutation.operation);
  return target;
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

const requiredFiles = [
  SCHEMA_PATH,
  MIGRATION_REGISTRY_PATH,
  VALIDATOR_PATH,
  MIGRATOR_PATH,
  UNIVERSAL_PATH,
  BLOCK_POLICY_PATH,
  TYPE_REGISTRY_PATH,
  MASTERY_PATH,
  VISUAL_PATH,
  LANGUAGE_PATH,
  DOC_PATH,
  CANONICAL_FIXTURE,
  UNIVERSAL_V1_FIXTURE,
  ELEARNING_FIXTURE,
  RUSSIAN_PATH,
  RUSSIAN_ADAPTER_PATH,
  RUSSIAN_MANIFEST_PATH,
  MATH_PATH,
  MATH_RUNTIME_SOURCE_PATH,
  RESEARCH_PATH,
  RESEARCH_MANIFEST_PATH
];

for (const descriptorPath of [
  FIXTURE_ROOT + '/invalid-missing-metadata.json',
  FIXTURE_ROOT + '/invalid-duplicate-block-id.json',
  FIXTURE_ROOT + '/invalid-offline-ref.json',
  FIXTURE_ROOT + '/invalid-credential-key.json'
]) requiredFiles.push(descriptorPath);

for (const file of requiredFiles) {
  check('FILE-' + file, 'required B8 input exists', fs.existsSync(absolute(file)), file);
}

if (failures.length) {
  console.error('L6-B8 regression cannot start because required inputs are missing.');
  console.error(failures.join('\n'));
  process.exit(2);
}

const schema = json(SCHEMA_PATH);
const migrationRegistry = json(MIGRATION_REGISTRY_PATH);
const universal = json(UNIVERSAL_PATH);
const blockPolicy = json(BLOCK_POLICY_PATH);
const typeRegistry = json(TYPE_REGISTRY_PATH);
const mastery = json(MASTERY_PATH);
const visual = json(VISUAL_PATH);
const language = json(LANGUAGE_PATH);
const doc = read(DOC_PATH);
const canonical = json(CANONICAL_FIXTURE);
const universalV1 = json(UNIVERSAL_V1_FIXTURE);
const elearningV11 = json(ELEARNING_FIXTURE);
const russianLessons = json(RUSSIAN_PATH);
const mathLesson = json(MATH_PATH);
const researchLessons = json(RESEARCH_PATH);
const validatorSource = read(VALIDATOR_PATH);
const migratorSource = read(MIGRATOR_PATH);
const runtime = loadRuntime(validatorSource, migratorSource);
const validator = runtime.validator;
const migrator = runtime.migrator;
const canonicalBlockKinds = Object.keys(universal.semanticBlockCatalog || {});
const schemaBlockKinds = schema.$defs?.block?.properties?.kind?.enum || [];
const lessonTypeIds = Object.keys(typeRegistry.types || {});

check(
  'SCHEMA-IDENTITY',
  'schema is stable JSON Schema Draft 2020-12 for Universal Lesson V2',
  schema.$schema === 'https://json-schema.org/draft/2020-12/schema'
    && schema.$id === 'https://bauman-master-ai.local/schema/universal-lesson-v2.schema.json'
    && schema.title === 'Bauman Universal Lesson Instance V2',
  { draft: schema.$schema, id: schema.$id, title: schema.title }
);
const schemaDefinition = validator.validateSchemaDefinition(schema);
check(
  'SCHEMA-LOCAL-REFS',
  'schema definition passes and every reference resolves locally',
  schemaDefinition.valid,
  schemaDefinition.errors
);
check(
  'SCHEMA-TOP-LEVEL',
  'schema requires the eight B2 canonical top-level fields',
  sameSet(schema.required, [
    'metadata',
    'prerequisites',
    'objectives',
    'blocks',
    'masteryEvidence',
    'contextRefs',
    'offline',
    'provenance'
  ]),
  schema.required
);
check(
  'SCHEMA-BLOCK-KINDS',
  'schema block vocabulary is exactly the 13 B2 semantic kinds',
  sameSet(schemaBlockKinds, canonicalBlockKinds) && schemaBlockKinds.length === 13,
  schemaBlockKinds
);
check(
  'SCHEMA-LESSON-TYPES',
  'schema lesson types are exactly the eight B4 primary types',
  sameSet(schema.$defs?.metadata?.properties?.lessonType?.enum, lessonTypeIds)
    && lessonTypeIds.length === 8,
  lessonTypeIds
);
check(
  'SCHEMA-UNKNOWN-PASS-THROUGH',
  'canonical top level block and extensions permit specialist pass-through fields',
  schema.additionalProperties === true
    && schema.$defs?.block?.additionalProperties === true
    && schema.properties?.extensions?.additionalProperties === true,
  {
    root: schema.additionalProperties,
    block: schema.$defs?.block?.additionalProperties,
    extensions: schema.properties?.extensions?.additionalProperties
  }
);
check(
  'SCHEMA-PROGRAM-IDENTITY',
  'official and personalized program codes remain distinct exact constants',
  schema.$defs?.programIdentity?.properties?.department?.const === 'ИУ-5'
    && schema.$defs?.programIdentity?.properties?.officialPublishedDirectionCode?.const === '09.04.01'
    && schema.$defs?.programIdentity?.properties?.personalizedDisplayCode?.const === '09.04.01/11',
  schema.$defs?.programIdentity?.properties
);

check(
  'REGISTRY-IDENTITY',
  'B8 migration registry identity and status are explicit',
  migrationRegistry.registryId === 'bauman-universal-lesson-migration-registry'
    && migrationRegistry.registryVersion === '1.0.0'
    && migrationRegistry.status === 'L6-B8-MIGRATION-REGISTRY',
  {
    id: migrationRegistry.registryId,
    version: migrationRegistry.registryVersion,
    status: migrationRegistry.status
  }
);
check(
  'REGISTRY-TARGET',
  'registry binds the exact target contract schema validator and migrator',
  migrationRegistry.target.contractId === universal.contractId
    && migrationRegistry.target.contractVersion === universal.schemaVersion
    && migrationRegistry.target.schemaPath === SCHEMA_PATH
    && migrationRegistry.target.schemaId === schema.$id
    && migrationRegistry.target.validatorPath === VALIDATOR_PATH
    && migrationRegistry.target.migratorPath === MIGRATOR_PATH,
  migrationRegistry.target
);
const expectedContractRefs = {
  universal: [UNIVERSAL_PATH, universal.contractId, universal.schemaVersion],
  blockPolicy: [BLOCK_POLICY_PATH, blockPolicy.policyId, blockPolicy.policyVersion],
  lessonTypes: [TYPE_REGISTRY_PATH, typeRegistry.registryId, typeRegistry.registryVersion],
  masterReady: [MASTERY_PATH, mastery.policyId, mastery.policyVersion],
  visualTeaching: [VISUAL_PATH, visual.contractId, visual.contractVersion],
  languageHooks: [LANGUAGE_PATH, language.contractId, language.contractVersion]
};
for (const [key, expected] of Object.entries(expectedContractRefs)) {
  const actual = migrationRegistry.contractRefs[key];
  check(
    'REGISTRY-REF-' + key,
    'registry references the exact ' + key + ' contract',
    actual.path === expected[0] && actual.id === expected[1] && actual.version === expected[2],
    actual
  );
}
check(
  'REGISTRY-DIGEST',
  'SHA-256 stable JSON is the only B8 integrity digest',
  migrationRegistry.digest.algorithm === 'sha256-stable-json-v1'
    && /never rollback integrity/.test(migrationRegistry.digest.nonIntegrityIdentifier),
  migrationRegistry.digest
);
check(
  'REGISTRY-FAMILIES',
  'registry declares exactly canonical V2 two migratable legacy families and two adapter-only families',
  sameSet(Object.keys(migrationRegistry.sourceFamilies), [
    'canonical-v2',
    'universal-v1',
    'elearning-v1.1',
    'russian-rich-v13',
    'math-rich-legacy'
  ]),
  Object.keys(migrationRegistry.sourceFamilies)
);
for (const family of ['russian-rich-v13', 'math-rich-legacy']) {
  const policy = migrationRegistry.sourceFamilies[family];
  check(
    'REGISTRY-ADAPTER-' + family,
    family + ' is adapter-only with no migration path or write authority',
    policy.strategy === 'adapter-required'
      && policy.migrationPath === null
      && policy.writesAllowed === false
      && /^route-to-unchanged-/.test(policy.fallback),
    policy
  );
}
check(
  'REGISTRY-VERSION-GRAPH',
  'version graph has two dry-run forward edges no cycles and no automatic cutover',
  migrationRegistry.versionGraph.edges.length === 2
    && migrationRegistry.versionGraph.edges.every((edge) => edge.mode === 'dry-run-candidate')
    && migrationRegistry.versionGraph.cyclesAllowed === false
    && migrationRegistry.versionGraph.automaticCutoverAllowed === false,
  migrationRegistry.versionGraph
);
check(
  'REGISTRY-CONTEXT',
  'projection context matches the executable migrator and source detection is advisory only',
  sameSet(migrationRegistry.projectionContext.requiredFields, migrator.requiredContextFields)
    && migrationRegistry.projectionContext.sourceFamilyIsExplicit === true
    && migrationRegistry.projectionContext.sourceDetectionIsAdvisoryOnly === true,
  migrationRegistry.projectionContext
);
check(
  'REGISTRY-INVARIANTS',
  'registry locks dry-run validation determinism rollback review and legacy preservation',
  containsAll((migrationRegistry.invariants || []).map((item) => item.id), [
    'dry-run-only',
    'source-byte-equivalent',
    'validated-output',
    'deterministic',
    'idempotent-canonical',
    'rollback-snapshot',
    'manual-review-before-cutover',
    'legacy-specialist-preservation',
    'no-learner-state-write'
  ]),
  migrationRegistry.invariants
);
check(
  'REGISTRY-FORWARD-BOUNDARY',
  'B8 does not claim factory renderer reference runtime or cutover work',
  migrationRegistry.forwardOwnership.runtimeCutoverInB8 === false
    && /Subject Factory/.test(migrationRegistry.forwardOwnership['L6-B9'])
    && /renderer/.test(migrationRegistry.forwardOwnership['L6-B10'])
    && /runtime/.test(migrationRegistry.forwardOwnership['L6-B11']),
  migrationRegistry.forwardOwnership
);

check(
  'VALIDATOR-API',
  'validator exposes the versioned browser API and security inspection',
  validator.release === 'L6-B8-LESSON-SCHEMA-VALIDATOR-V1'
    && validator.supportedSchemaVersion === '2.0.0'
    && typeof validator.validateLesson === 'function'
    && typeof validator.validateSchemaDefinition === 'function'
    && typeof validator.inspectJsonValue === 'function'
    && typeof validator.hash256 === 'function',
  { release: validator.release, version: validator.supportedSchemaVersion }
);
check(
  'MIGRATOR-API',
  'migrator exposes target versions source families migration and rollback',
  migrator.release === 'L6-B8-LESSON-VERSION-MIGRATOR-V1'
    && migrator.targetVersion === '2.0.0'
    && sameSet(migrator.sourceFamilies, Object.keys(migrationRegistry.sourceFamilies))
    && sameSet(migrator.adapterOnlyFamilies, ['russian-rich-v13', 'math-rich-legacy'])
    && typeof migrator.migrate === 'function'
    && typeof migrator.rollback === 'function',
  {
    release: migrator.release,
    targetVersion: migrator.targetVersion,
    sourceFamilies: migrator.sourceFamilies
  }
);
const shaVectors = ['', 'abc', 'Bauman ИУ-5 · 09.04.01/11'];
check(
  'VALIDATOR-SHA256',
  'browser SHA-256 matches Node crypto for ASCII and UTF-8 vectors',
  shaVectors.every((value) => validator.hash256(value) === digestText(value)),
  shaVectors.map((value) => ({ value, digest: validator.hash256(value) }))
);
check(
  'VALIDATOR-EVIDENCE-VOCABULARY',
  'validator evidence outputs exactly match all eight B4 type profiles',
  lessonTypeIds.every((typeId) => sameSet(validator.typeEvidenceOutputs[typeId], typeRegistry.types[typeId].evidenceOutputs)),
  validator.typeEvidenceOutputs
);

const canonicalValidation = validator.validateLesson(canonical, schema);
check(
  'FIXTURE-CANONICAL-VALID',
  'canonical V2 fixture passes schema security and semantic validation',
  canonicalValidation.valid
    && canonicalValidation.digestAlgorithm === 'sha256-stable-json-v1'
    && canonicalValidation.digest.length === 64,
  canonicalValidation
);
check(
  'FIXTURE-PROGRAM-IDENTITY',
  'canonical fixture keeps official and personalized codes in their exact fields',
  canonical.metadata.programIdentity.officialPublishedDirectionCode === '09.04.01'
    && canonical.metadata.programIdentity.personalizedDisplayCode === '09.04.01/11',
  canonical.metadata.programIdentity
);
check(
  'VALIDATOR-CROSS-REALM',
  'plain JSON from the host realm validates inside the browser VM realm',
  canonicalValidation.valid,
  canonicalValidation.errors
);
class NonPlainFixture {}
const nonPlain = clone(canonical);
nonPlain.extensions.nonPlain = new NonPlainFixture();
const nonPlainResult = validator.validateLesson(nonPlain, schema);
check(
  'VALIDATOR-NON-PLAIN',
  'class instances remain rejected while cross-realm plain JSON is accepted',
  !nonPlainResult.valid && nonPlainResult.errors.some((item) => item.keyword === 'plain-object'),
  nonPlainResult.errors
);
const nonFinite = clone(canonical);
nonFinite.extensions.nonFinite = Number.POSITIVE_INFINITY;
const nonFiniteResult = validator.validateLesson(nonFinite, schema);
check(
  'VALIDATOR-NON-FINITE',
  'non-finite numbers are rejected as non-JSON values',
  !nonFiniteResult.valid && nonFiniteResult.errors.some((item) => item.keyword === 'finite-number'),
  nonFiniteResult.errors
);
const cyclic = clone(canonical);
cyclic.extensions.cycle = cyclic;
const cyclicResult = validator.validateLesson(cyclic, schema);
check(
  'VALIDATOR-CYCLE',
  'cyclic inputs are rejected before schema evaluation',
  !cyclicResult.valid && cyclicResult.errors.some((item) => item.keyword === 'cycle'),
  cyclicResult.errors
);
const prototypeKey = clone(canonical);
prototypeKey.extensions.attack = JSON.parse('{"__proto__":{"polluted":true}}');
const prototypeResult = validator.validateLesson(prototypeKey, schema);
check(
  'VALIDATOR-PROTOTYPE-KEY',
  'prototype-control keys are rejected',
  !prototypeResult.valid && prototypeResult.errors.some((item) => item.keyword === 'forbidden-key'),
  prototypeResult.errors
);
const complexityResult = validator.validateLesson(canonical, schema, { limits: { maxNodes: 5 } });
check(
  'VALIDATOR-COMPLEXITY',
  'configured complexity limits fail closed',
  !complexityResult.valid && complexityResult.errors.some((item) => item.keyword === 'maxNodes'),
  complexityResult.errors
);
const badRefSchema = clone(schema);
badRefSchema.properties.metadata.$ref = 'https://example.invalid/external-schema.json';
const badRefResult = validator.validateSchemaDefinition(badRefSchema);
check(
  'VALIDATOR-EXTERNAL-REF',
  'external and unresolved schema references are rejected',
  !badRefResult.valid && badRefResult.errors.some((item) => item.keyword === '$ref'),
  badRefResult.errors
);

const invalidFixtureOutcomes = [];
for (const descriptorPath of [
  FIXTURE_ROOT + '/invalid-missing-metadata.json',
  FIXTURE_ROOT + '/invalid-duplicate-block-id.json',
  FIXTURE_ROOT + '/invalid-offline-ref.json',
  FIXTURE_ROOT + '/invalid-credential-key.json'
]) {
  const descriptor = json(descriptorPath);
  const invalidLesson = applyMutationDescriptor(descriptor);
  const result = validator.validateLesson(invalidLesson, schema);
  const expected = descriptor.expectedError;
  const matched = result.errors.some((item) => item.path === expected.path && item.keyword === expected.keyword);
  invalidFixtureOutcomes.push({
    descriptorPath,
    expected,
    valid: result.valid,
    matched,
    errors: result.errors
  });
  check(
    'INVALID-' + path.basename(descriptorPath, '.json'),
    'negative fixture fails for the intended path and keyword',
    !result.valid && matched,
    { expected, errors: result.errors }
  );
}
const badFallback = clone(canonical);
badFallback.offline.deterministicFallbackRef = 'missing-fallback';
const badFallbackResult = validator.validateLesson(badFallback, schema);
check(
  'VALIDATOR-FALLBACK-REF',
  'deterministic offline fallback must resolve to a declared resource',
  !badFallbackResult.valid
    && badFallbackResult.errors.some((item) => item.path === '/offline/deterministicFallbackRef' && item.keyword === 'offline-ref'),
  badFallbackResult.errors
);
const badEvidence = clone(canonical);
badEvidence.objectives[0].evidenceKinds = ['query-result'];
const badEvidenceResult = validator.validateLesson(badEvidence, schema);
check(
  'VALIDATOR-TYPE-EVIDENCE',
  'evidence output from another lesson type is rejected',
  !badEvidenceResult.valid && badEvidenceResult.errors.some((item) => item.keyword === 'type-evidence-output'),
  badEvidenceResult.errors
);

const migrationOutcomes = {};
const canonicalSourceBefore = JSON.stringify(canonical);
const canonicalRun1 = migrator.migrate(canonical, {}, schema, {});
const canonicalRun2 = migrator.migrate(canonical, {}, schema, {});
migrationOutcomes.canonical = {
  code: canonicalRun1.code,
  migrationId: canonicalRun1.migrationId,
  inputDigest: canonicalRun1.inputDigest,
  outputDigest: canonicalRun1.outputDigest
};
check(
  'MIGRATION-CANONICAL-NOOP',
  'canonical V2 is validated and cloned without semantic transformation',
  canonicalRun1.ok
    && canonicalRun1.strategyId === 'canonical-v2-validate-clone'
    && canonicalRun1.manualReviewRequired === false
    && stableEqual(canonicalRun1.output, canonical),
  migrationOutcomes.canonical
);
check(
  'MIGRATION-CANONICAL-DETERMINISTIC',
  'canonical no-op migration is deterministic and idempotent',
  canonicalRun1.migrationId === canonicalRun2.migrationId
    && canonicalRun1.outputDigest === canonicalRun2.outputDigest
    && stableEqual(canonicalRun1.output, canonicalRun2.output),
  { first: migrationOutcomes.canonical, secondId: canonicalRun2.migrationId, secondDigest: canonicalRun2.outputDigest }
);
check(
  'MIGRATION-CANONICAL-SOURCE',
  'canonical validation does not mutate its source',
  canonicalRun1.sourceUnchanged && JSON.stringify(canonical) === canonicalSourceBefore,
  { sourceUnchanged: canonicalRun1.sourceUnchanged, digest: canonicalRun1.inputDigest }
);
const canonicalRollback = migrator.rollback(canonicalRun1);
check(
  'MIGRATION-CANONICAL-ROLLBACK',
  'canonical source snapshot rolls back exactly',
  canonicalRollback.ok && stableEqual(canonicalRollback.source, canonical),
  { code: canonicalRollback.code, digest: canonicalRollback.digest }
);

const universalContext = {
  subjectId: 'programming',
  lessonId: 'legacy-programming-001',
  lessonType: 'programming',
  stageId: 'vn-foundation',
  sourcePath: UNIVERSAL_V1_FIXTURE,
  sourceArtifactId: 'legacy-programming-001',
  sourceVersion: '1.0.0',
  adapterId: 'universal-v1-projection',
  contentVersion: 'fixture-content-v1',
  objectiveEvidenceKinds: ['passing-tests', 'debug-trace']
};
const universalBefore = JSON.stringify(universalV1);
const universalRun1 = migrator.migrate(universalV1, universalContext, schema, { sourceFamily: 'universal-v1' });
const universalRun2 = migrator.migrate(universalV1, universalContext, schema, { sourceFamily: 'universal-v1' });
migrationOutcomes.universalV1 = {
  code: universalRun1.code,
  migrationId: universalRun1.migrationId,
  inputDigest: universalRun1.inputDigest,
  outputDigest: universalRun1.outputDigest,
  blockKinds: universalRun1.output?.blocks?.map((item) => item.kind) || []
};
check(
  'MIGRATION-V1-CANDIDATE',
  'Universal V1 produces a validated manual-review V2 candidate',
  universalRun1.ok
    && universalRun1.validation.valid
    && universalRun1.manualReviewRequired
    && universalRun1.strategyId === 'universal-v1-to-v2'
    && sameSet(migrationOutcomes.universalV1.blockKinds, ['orientation', 'theory', 'exercise']),
  migrationOutcomes.universalV1
);
check(
  'MIGRATION-V1-PRESERVATION',
  'Universal V1 source legacy fields and block annotations are preserved',
  universalRun1.output.extensions.migration.unmappedFields.legacyRoute === universalV1.legacyRoute
    && universalRun1.output.extensions.migration.unmappedFields.legacyWidgetConfig.runner === 'python'
    && universalRun1.output.extensions.migration.unmappedFields.extensions.legacyNamespace.keep === true
    && universalRun1.output.blocks.find((item) => item.id === 'legacy-theory').legacySource.legacyAnnotation === 'preserve-me',
  universalRun1.output.extensions.migration
);
check(
  'MIGRATION-V1-DETERMINISTIC',
  'Universal V1 mapping is deterministic',
  universalRun1.migrationId === universalRun2.migrationId
    && universalRun1.outputDigest === universalRun2.outputDigest
    && stableEqual(universalRun1.output, universalRun2.output),
  { first: universalRun1.migrationId, second: universalRun2.migrationId }
);
check(
  'MIGRATION-V1-SOURCE',
  'Universal V1 source stays unchanged',
  universalRun1.sourceUnchanged && JSON.stringify(universalV1) === universalBefore,
  { sourceUnchanged: universalRun1.sourceUnchanged, inputDigest: universalRun1.inputDigest }
);
const universalRollback = migrator.rollback(universalRun1);
check(
  'MIGRATION-V1-ROLLBACK',
  'Universal V1 rollback restores the exact source snapshot',
  universalRollback.ok && stableEqual(universalRollback.source, universalV1),
  { code: universalRollback.code, digest: universalRollback.digest }
);

const elearningContext = {
  subjectId: 'research',
  lessonId: 'research-fixture-001',
  lessonType: 'research',
  stageId: 'prepare',
  sourcePath: ELEARNING_FIXTURE,
  sourceArtifactId: 'research-fixture-001',
  sourceVersion: 'elearning-v1.1',
  adapterId: 'elearning-v1.1-projection',
  contentVersion: 'fixture-content-v1',
  objectiveEvidenceKinds: ['research-question', 'experiment-protocol']
};
const elearningBefore = JSON.stringify(elearningV11);
const elearningRun1 = migrator.migrate(elearningV11, elearningContext, schema, { sourceFamily: 'elearning-v1.1' });
const elearningRun2 = migrator.migrate(elearningV11, elearningContext, schema, { sourceFamily: 'elearning-v1.1' });
const expectedElearningKinds = [
  'orientation',
  'theory',
  'worked-example',
  'exercise',
  'lab-simulation',
  'misconception',
  'review',
  'mastery',
  'project-nir-evidence'
];
migrationOutcomes.elearningV11 = {
  code: elearningRun1.code,
  migrationId: elearningRun1.migrationId,
  inputDigest: elearningRun1.inputDigest,
  outputDigest: elearningRun1.outputDigest,
  blockKinds: elearningRun1.output?.blocks?.map((item) => item.kind) || []
};
check(
  'MIGRATION-ELEARNING-CANDIDATE',
  'eLearning V1.1 produces a validated manual-review Research candidate',
  elearningRun1.ok
    && elearningRun1.validation.valid
    && elearningRun1.manualReviewRequired
    && elearningRun1.strategyId === 'elearning-v1.1-to-v2'
    && stableEqual(migrationOutcomes.elearningV11.blockKinds, expectedElearningKinds),
  migrationOutcomes.elearningV11
);
check(
  'MIGRATION-ELEARNING-NO-EMPTY-BLOCK',
  'eLearning mapping emits no empty placeholder block',
  elearningRun1.output.blocks.every((block) => Object.keys(block.payload || {}).length > 0),
  elearningRun1.output.blocks.map((block) => ({ id: block.id, kind: block.kind, payloadKeys: Object.keys(block.payload || {}) }))
);
const elearningMigrationExtension = elearningRun1.output.extensions.migration;
check(
  'MIGRATION-ELEARNING-PRESERVATION',
  'eLearning wrapper and unmapped payload fields remain in the migration extension',
  elearningMigrationExtension.wrapperUnmappedFields.description === elearningV11.description
    && stableEqual(elearningMigrationExtension.wrapperUnmappedFields.keyPoints, elearningV11.keyPoints)
    && stableEqual(elearningMigrationExtension.wrapperUnmappedFields.tasks, elearningV11.tasks)
    && elearningMigrationExtension.wrapperUnmappedFields.legacyCardTheme === 'research-blue'
    && elearningMigrationExtension.payloadUnmappedFields.legacyExperimentalFlag === 'preserve-in-extension',
  elearningMigrationExtension
);
check(
  'MIGRATION-ELEARNING-DETERMINISTIC',
  'eLearning V1.1 mapping is deterministic',
  elearningRun1.migrationId === elearningRun2.migrationId
    && elearningRun1.outputDigest === elearningRun2.outputDigest
    && stableEqual(elearningRun1.output, elearningRun2.output),
  { first: elearningRun1.migrationId, second: elearningRun2.migrationId }
);
check(
  'MIGRATION-ELEARNING-SOURCE',
  'eLearning V1.1 source stays unchanged',
  elearningRun1.sourceUnchanged && JSON.stringify(elearningV11) === elearningBefore,
  { sourceUnchanged: elearningRun1.sourceUnchanged, inputDigest: elearningRun1.inputDigest }
);
const elearningRollback = migrator.rollback(elearningRun1);
check(
  'MIGRATION-ELEARNING-ROLLBACK',
  'eLearning rollback restores the exact source snapshot',
  elearningRollback.ok && stableEqual(elearningRollback.source, elearningV11),
  { code: elearningRollback.code, digest: elearningRollback.digest }
);

const guardOutcomes = {};
guardOutcomes.missingFamily = migrator.migrate(universalV1, universalContext, schema, {});
guardOutcomes.unknownFamily = migrator.migrate(universalV1, universalContext, schema, { sourceFamily: 'unknown-family' });
const wrongVersionSource = clone(universalV1);
wrongVersionSource.contractVersion = '0.9.0';
guardOutcomes.wrongSourceVersion = migrator.migrate(wrongVersionSource, universalContext, schema, { sourceFamily: 'universal-v1' });
const incompleteContext = clone(universalContext);
delete incompleteContext.adapterId;
guardOutcomes.incompleteContext = migrator.migrate(universalV1, incompleteContext, schema, { sourceFamily: 'universal-v1' });
const wrongContextVersion = clone(universalContext);
wrongContextVersion.sourceVersion = '1.0.1';
guardOutcomes.wrongContextVersion = migrator.migrate(universalV1, wrongContextVersion, schema, { sourceFamily: 'universal-v1' });
guardOutcomes.apply = migrator.migrate(universalV1, universalContext, schema, { sourceFamily: 'universal-v1', apply: true });
guardOutcomes.commit = migrator.migrate(universalV1, universalContext, schema, { sourceFamily: 'universal-v1', commit: true });
guardOutcomes.write = migrator.migrate(universalV1, universalContext, schema, { sourceFamily: 'universal-v1', write: true });
check(
  'MIGRATION-EXPLICIT-FAMILY',
  'non-canonical source without explicit family is blocked',
  guardOutcomes.missingFamily.code === 'SOURCE_FAMILY_REQUIRED',
  guardOutcomes.missingFamily.code
);
check(
  'MIGRATION-UNKNOWN-FAMILY',
  'unknown source family is blocked',
  guardOutcomes.unknownFamily.code === 'UNKNOWN_SOURCE_FAMILY',
  guardOutcomes.unknownFamily.code
);
check(
  'MIGRATION-SOURCE-VERSION',
  'mismatched source signature and version are blocked',
  guardOutcomes.wrongSourceVersion.code === 'SOURCE_FAMILY_VERSION_MISMATCH',
  guardOutcomes.wrongSourceVersion.code
);
check(
  'MIGRATION-CONTEXT-REQUIRED',
  'incomplete projection context is blocked',
  guardOutcomes.incompleteContext.code === 'MIGRATION_CONTEXT_REQUIRED'
    && guardOutcomes.incompleteContext.details.missingFields.includes('adapterId'),
  guardOutcomes.incompleteContext.details
);
check(
  'MIGRATION-CONTEXT-VERSION',
  'context source version must match the registered version',
  guardOutcomes.wrongContextVersion.code === 'CONTEXT_SOURCE_VERSION_MISMATCH',
  guardOutcomes.wrongContextVersion.code
);
check(
  'MIGRATION-DRY-RUN-ONLY',
  'apply commit and write requests all fail closed',
  ['apply', 'commit', 'write'].every((key) => guardOutcomes[key].code === 'B8_DRY_RUN_ONLY'),
  {
    apply: guardOutcomes.apply.code,
    commit: guardOutcomes.commit.code,
    write: guardOutcomes.write.code
  }
);
const unknownBlockSource = clone(universalV1);
unknownBlockSource.sections[0].type = 'unregistered-legacy-panel';
const unknownBlockResult = migrator.migrate(
  unknownBlockSource,
  universalContext,
  schema,
  { sourceFamily: 'universal-v1' }
);
check(
  'MIGRATION-UNKNOWN-BLOCK',
  'unregistered legacy block kind blocks the candidate instead of dropping content',
  unknownBlockResult.code === 'MIGRATION_MAPPING_ERROR'
    && unknownBlockResult.output === null
    && unknownBlockResult.details.some((item) => /Unsupported block kind/.test(item.message)),
  { code: unknownBlockResult.code, details: unknownBlockResult.details }
);
const sparseElearning = clone(elearningV11);
for (const field of [
  'workedExample',
  'guidedPractice',
  'simulationLink',
  'commonMistakes',
  'checkpointQuestions',
  'masteryCriteria',
  'rubric',
  'baumanConnection'
]) delete sparseElearning.eLearning[field];
const sparseElearningResult = migrator.migrate(
  sparseElearning,
  elearningContext,
  schema,
  { sourceFamily: 'elearning-v1.1' }
);
check(
  'MIGRATION-SPARSE-NO-PLACEHOLDER',
  'absent eLearning fields do not create empty semantic blocks or views',
  sparseElearningResult.ok
    && sparseElearningResult.output.blocks.every((block) => Object.keys(block.payload || {}).length > 0)
    && !sparseElearningResult.output.blocks.some((block) => [
      'worked-example',
      'exercise',
      'lab-simulation',
      'misconception',
      'review',
      'mastery',
      'project-nir-evidence'
    ].includes(block.kind)),
  sparseElearningResult.output?.blocks?.map((block) => block.kind) || sparseElearningResult
);
const invalidSource = clone(universalV1);
invalidSource.nonFinite = Number.NaN;
const invalidSourceResult = migrator.migrate(invalidSource, universalContext, schema, { sourceFamily: 'universal-v1' });
check(
  'MIGRATION-SOURCE-JSON',
  'non-JSON migration source is rejected before mapping',
  invalidSourceResult.code === 'INVALID_SOURCE_JSON'
    && invalidSourceResult.details.some((item) => item.keyword === 'finite-number'),
  invalidSourceResult.details
);
const invalidContext = clone(universalContext);
invalidContext.apiKey = 'forbidden-test-value';
const invalidContextResult = migrator.migrate(universalV1, invalidContext, schema, { sourceFamily: 'universal-v1' });
check(
  'MIGRATION-CONTEXT-JSON',
  'credential-like migration context is rejected before mapping',
  invalidContextResult.code === 'INVALID_MIGRATION_CONTEXT'
    && invalidContextResult.details.some((item) => item.keyword === 'credential-key'),
  invalidContextResult.details
);
const tamperedRollbackInput = clone(universalRun1);
tamperedRollbackInput.sourceSnapshot.legacyRoute = '#/tampered';
const tamperedRollback = migrator.rollback(tamperedRollbackInput);
check(
  'MIGRATION-ROLLBACK-INTEGRITY',
  'tampered source snapshot cannot be restored',
  !tamperedRollback.ok && tamperedRollback.code === 'SOURCE_SNAPSHOT_INTEGRITY_FAILED',
  tamperedRollback
);

const russianBefore = JSON.stringify(russianLessons[0]);
const russianAdapterResult = migrator.migrate(
  russianLessons[0],
  { subjectId: 'russian' },
  schema,
  { sourceFamily: 'russian-rich-v13' }
);
check(
  'REFERENCE-RUSSIAN-ADAPTER',
  'real Russian rich lesson is adapter-only and unchanged',
  russianAdapterResult.code === 'ADAPTER_REQUIRED'
    && russianAdapterResult.output === null
    && russianAdapterResult.sourceUnchanged
    && JSON.stringify(russianLessons[0]) === russianBefore,
  { code: russianAdapterResult.code, digest: russianAdapterResult.inputDigest }
);
check(
  'REFERENCE-RUSSIAN-COVERAGE',
  'Russian reference remains 26 lessons with 26 Russian titles',
  russianLessons.length === 26
    && russianLessons.filter((lesson) => typeof lesson.ruTitle === 'string' && lesson.ruTitle.length).length === 26,
  {
    lessons: russianLessons.length,
    ruTitles: russianLessons.filter((lesson) => typeof lesson.ruTitle === 'string' && lesson.ruTitle.length).length
  }
);
const mathBefore = JSON.stringify(mathLesson);
const mathAdapterResult = migrator.migrate(
  mathLesson,
  { subjectId: 'math' },
  schema,
  { sourceFamily: 'math-rich-legacy' }
);
check(
  'REFERENCE-MATH-ADAPTER',
  'real Mathematics rich lesson is adapter-only and unchanged',
  mathAdapterResult.code === 'ADAPTER_REQUIRED'
    && mathAdapterResult.output === null
    && mathAdapterResult.sourceUnchanged
    && JSON.stringify(mathLesson) === mathBefore,
  { code: mathAdapterResult.code, digest: mathAdapterResult.inputDigest, lessonId: mathLesson.lessonId }
);

const researchBefore = JSON.stringify(researchLessons);
const researchProjectionOutcomes = [];
for (const source of researchLessons) {
  const context = {
    subjectId: 'research',
    lessonId: source.id,
    lessonType: 'research',
    stageId: source.stage,
    sourcePath: RESEARCH_PATH,
    sourceArtifactId: 'research:' + source.id,
    sourceVersion: 'elearning-v1.1',
    adapterId: 'research-elearning-v1.1-projection',
    contentVersion: 'research-elearning-v1.1'
  };
  const result = migrator.migrate(source, context, schema, { sourceFamily: 'elearning-v1.1' });
  researchProjectionOutcomes.push({
    lessonId: source.id,
    ok: result.ok,
    code: result.code,
    valid: Boolean(result.validation?.valid),
    sourceUnchanged: result.sourceUnchanged,
    manualReviewRequired: result.manualReviewRequired,
    outputDigest: result.outputDigest,
    blockCount: result.output?.blocks?.length || 0
  });
}
const researchOutputDigests = researchProjectionOutcomes.map((item) => item.outputDigest);
check(
  'REFERENCE-RESEARCH-45',
  'all 45 current Research eLearning V1.1 sources produce validated dry-run candidates',
  researchLessons.length === 45
    && researchLessons.every((lesson) => lesson.eLearning?.lessonContractVersion === 'elearning-v1.1')
    && researchProjectionOutcomes.every((item) => item.ok && item.valid && item.manualReviewRequired),
  {
    sourceCount: researchLessons.length,
    candidateCount: researchProjectionOutcomes.filter((item) => item.ok).length
  }
);
check(
  'REFERENCE-RESEARCH-SOURCE',
  'full Research source array remains unchanged after 45 projections',
  researchProjectionOutcomes.every((item) => item.sourceUnchanged)
    && JSON.stringify(researchLessons) === researchBefore,
  { unchangedCount: researchProjectionOutcomes.filter((item) => item.sourceUnchanged).length }
);
check(
  'REFERENCE-RESEARCH-DIGESTS',
  'each Research candidate has a distinct SHA-256 output digest',
  researchOutputDigests.every((value) => typeof value === 'string' && value.length === 64)
    && new Set(researchOutputDigests).size === 45,
  { distinct: new Set(researchOutputDigests).size, aggregate: digestText(researchOutputDigests.join('\n')) }
);
check(
  'LEARNER-BRAND-OUTPUT',
  'canonical and migrated learner candidates contain only the Bauman program identity',
  !/HUTECH/i.test(JSON.stringify([
    canonical,
    universalRun1.output,
    elearningRun1.output,
    researchProjectionOutcomes
  ])),
  'Bauman-only candidate surfaces'
);

const officialCodeMutant = clone(schema);
officialCodeMutant.$defs.programIdentity.properties.officialPublishedDirectionCode.const = '09.04.01/11';
const officialCodeMutantResult = validator.validateLesson(canonical, officialCodeMutant);
recordMutation(
  'OFFICIAL-CODE',
  'personalized code substituted into official field is caught',
  !officialCodeMutantResult.valid
    && officialCodeMutantResult.errors.some((item) => item.path === '/metadata/programIdentity/officialPublishedDirectionCode'),
  officialCodeMutantResult.errors
);

const duplicateGuardNeedle = "errors.push.apply(errors, duplicateIdErrors(lesson.blocks, 'blocks'));";
const duplicateGuardMutant = validatorSource.replace(duplicateGuardNeedle, '// mutation: duplicate block IDs accepted');
let duplicateGuardObserved = false;
let duplicateGuardEvidence = null;
try {
  const mutantValidator = loadRuntime(duplicateGuardMutant, null).validator;
  const duplicateDescriptor = json(FIXTURE_ROOT + '/invalid-duplicate-block-id.json');
  const result = mutantValidator.validateLesson(applyMutationDescriptor(duplicateDescriptor), schema);
  duplicateGuardObserved = duplicateGuardMutant !== validatorSource && result.valid;
  duplicateGuardEvidence = { mutantLoaded: duplicateGuardMutant !== validatorSource, valid: result.valid, errors: result.errors };
} catch (error) {
  duplicateGuardEvidence = { error: String(error && error.message || error) };
}
recordMutation(
  'DUPLICATE-ID',
  'removing duplicate block ID guard makes the negative fixture escape',
  duplicateGuardObserved,
  duplicateGuardEvidence
);

function adapterPoliciesSafe(registry) {
  return ['russian-rich-v13', 'math-rich-legacy'].every((family) => {
    const policy = registry.sourceFamilies[family];
    return policy.strategy === 'adapter-required'
      && policy.migrationPath === null
      && policy.writesAllowed === false;
  });
}
const adapterRegistryMutant = clone(migrationRegistry);
adapterRegistryMutant.sourceFamilies['russian-rich-v13'].strategy = 'direct-migration';
adapterRegistryMutant.sourceFamilies['russian-rich-v13'].migrationPath = 'russian-rich-v13-to-v2';
adapterRegistryMutant.sourceFamilies['russian-rich-v13'].writesAllowed = true;
recordMutation(
  'RUSSIAN-DIRECT-MIGRATION',
  'registry audit rejects direct Russian migration and write authority',
  adapterPoliciesSafe(migrationRegistry) && !adapterPoliciesSafe(adapterRegistryMutant),
  adapterRegistryMutant.sourceFamilies['russian-rich-v13']
);

const applyGuardNeedle = "if (options.apply === true || options.commit === true || options.write === true) {";
const applyGuardMutant = migratorSource.replace(applyGuardNeedle, 'if (false) {');
let applyGuardObserved = false;
let applyGuardEvidence = null;
try {
  const mutantMigrator = loadRuntime(validatorSource, applyGuardMutant).migrator;
  const result = mutantMigrator.migrate(universalV1, universalContext, schema, {
    sourceFamily: 'universal-v1',
    apply: true
  });
  applyGuardObserved = applyGuardMutant !== migratorSource && result.code !== 'B8_DRY_RUN_ONLY';
  applyGuardEvidence = { mutantLoaded: applyGuardMutant !== migratorSource, code: result.code };
} catch (error) {
  applyGuardEvidence = { error: String(error && error.message || error) };
}
recordMutation(
  'DRY-RUN-GUARD',
  'removing the write guard is exposed by the apply=true regression',
  applyGuardObserved,
  applyGuardEvidence
);

const adapterGuardNeedle = 'if (ADAPTER_ONLY_FAMILIES.has(explicitFamily)) {';
const adapterGuardMutant = migratorSource.replace(adapterGuardNeedle, 'if (false) {');
let adapterGuardObserved = false;
let adapterGuardEvidence = null;
try {
  const mutantMigrator = loadRuntime(validatorSource, adapterGuardMutant).migrator;
  const result = mutantMigrator.migrate(
    russianLessons[0],
    { subjectId: 'russian' },
    schema,
    { sourceFamily: 'russian-rich-v13' }
  );
  adapterGuardObserved = adapterGuardMutant !== migratorSource && result.code !== 'ADAPTER_REQUIRED';
  adapterGuardEvidence = { mutantLoaded: adapterGuardMutant !== migratorSource, code: result.code };
} catch (error) {
  adapterGuardEvidence = { error: String(error && error.message || error) };
}
recordMutation(
  'ADAPTER-GUARD',
  'removing adapter-only branch is exposed by the real Russian regression',
  adapterGuardObserved,
  adapterGuardEvidence
);

const rollbackNeedle = '|| validator.hash256(source) !== result.inputDigest) {';
const rollbackGuardMutant = migratorSource.replace(
  rollbackNeedle,
  '|| validator.hash256(source) !== validator.hash256(source)) {'
);
let rollbackGuardObserved = false;
let rollbackGuardEvidence = null;
try {
  const mutantMigrator = loadRuntime(validatorSource, rollbackGuardMutant).migrator;
  const result = mutantMigrator.migrate(universalV1, universalContext, schema, { sourceFamily: 'universal-v1' });
  result.sourceSnapshot.legacyRoute = '#/tampered-by-mutation';
  const rollback = mutantMigrator.rollback(result);
  rollbackGuardObserved = rollbackGuardMutant !== migratorSource && rollback.ok;
  rollbackGuardEvidence = { mutantLoaded: rollbackGuardMutant !== migratorSource, rollback };
} catch (error) {
  rollbackGuardEvidence = { error: String(error && error.message || error) };
}
recordMutation(
  'ROLLBACK-INTEGRITY',
  'removing snapshot digest comparison lets tampering escape and is observed',
  rollbackGuardObserved,
  rollbackGuardEvidence
);

check(
  'MUTATION-SUMMARY',
  'all six B8 protection mutations fail in the expected direction',
  mutationTests.length === 6 && mutationTests.every((item) => item.expectedFailureObserved),
  mutationTests.map((item) => ({ id: item.id, observed: item.expectedFailureObserved }))
);
check(
  'DOC-BOUNDARY',
  'decision record states pending remote CI dry-run boundary and future ownership',
  /implementation pending remote CI/.test(doc)
    && /B8_DRY_RUN_ONLY/.test(doc)
    && /ADAPTER_REQUIRED/.test(doc)
    && /B9 registers subject engines/.test(doc)
    && /B10 implements the Universal Lesson Renderer/.test(doc),
  DOC_PATH
);
check(
  'DOC-CODES',
  'decision record distinguishes official and personalized program codes',
  /official Bauman publication code: `09\.04\.01`/.test(doc)
    && /personalized learner display code: `09\.04\.01\/11`/.test(doc),
  DOC_PATH
);

const compatibilityPaths = [
  RUSSIAN_PATH,
  RUSSIAN_ADAPTER_PATH,
  RUSSIAN_MANIFEST_PATH,
  MATH_PATH,
  MATH_RUNTIME_SOURCE_PATH,
  RESEARCH_PATH,
  RESEARCH_MANIFEST_PATH
];
const compatibilityHashes = Object.fromEntries(compatibilityPaths.map((file) => [file, sha256(file)]));
check(
  'REFERENCE-SOURCE-HASHES',
  'reference source and runtime files remain readable and hashed for rollback comparison',
  Object.values(compatibilityHashes).every((value) => /^[0-9a-f]{64}$/.test(value)),
  compatibilityHashes
);

const b8ArtifactPaths = [
  SCHEMA_PATH,
  MIGRATION_REGISTRY_PATH,
  VALIDATOR_PATH,
  MIGRATOR_PATH,
  DOC_PATH,
  CANONICAL_FIXTURE,
  UNIVERSAL_V1_FIXTURE,
  ELEARNING_FIXTURE,
  FIXTURE_ROOT + '/invalid-missing-metadata.json',
  FIXTURE_ROOT + '/invalid-duplicate-block-id.json',
  FIXTURE_ROOT + '/invalid-offline-ref.json',
  FIXTURE_ROOT + '/invalid-credential-key.json'
];
const b8ArtifactHashes = Object.fromEntries(b8ArtifactPaths.map((file) => [file, sha256(file)]));
const passed = checks.filter((item) => item.ok).length;
const report = {
  schema: 'L6_B8_SCHEMA_MIGRATION_REGRESSION_V1',
  status: failures.length ? 'FAIL' : 'PASS',
  branch: 'migration/webapp-l1-audit-storage',
  generatedFor: '2026-08-24',
  scope: 'Universal Lesson V2 schema validator pure migration and rollback; no runtime cutover or learner-state write.',
  summary: {
    total: checks.length,
    passed,
    failed: checks.length - passed,
    mutationTests: mutationTests.length,
    expectedMutationFailuresObserved: mutationTests.filter((item) => item.expectedFailureObserved).length,
    researchSources: researchLessons.length,
    researchCandidates: researchProjectionOutcomes.filter((item) => item.ok).length
  },
  contracts: {
    schemaId: schema.$id,
    validatorRelease: validator.release,
    migratorRelease: migrator.release,
    migrationRegistryId: migrationRegistry.registryId,
    targetVersion: migrator.targetVersion,
    digestAlgorithm: migrationRegistry.digest.algorithm
  },
  migrationOutcomes,
  guardOutcomes: Object.fromEntries(Object.entries(guardOutcomes).map(([key, value]) => [key, value.code])),
  invalidFixtureOutcomes,
  researchProjection: {
    sourceCount: researchLessons.length,
    candidateCount: researchProjectionOutcomes.filter((item) => item.ok).length,
    distinctOutputDigests: new Set(researchOutputDigests).size,
    outputDigestAggregate: digestText(researchOutputDigests.join('\n')),
    outcomes: researchProjectionOutcomes
  },
  referenceCompatibility: {
    russian: {
      lessonCount: russianLessons.length,
      ruTitleCount: russianLessons.filter((lesson) => typeof lesson.ruTitle === 'string' && lesson.ruTitle.length).length,
      migrationCode: russianAdapterResult.code
    },
    mathematics: {
      lessonId: mathLesson.lessonId,
      migrationCode: mathAdapterResult.code
    },
    sourceSha256: compatibilityHashes
  },
  mutationTests,
  b8ArtifactSha256: b8ArtifactHashes,
  checks
};

fs.writeFileSync(absolute(REPORT_PATH), JSON.stringify(report, null, 2) + '\n');
const reportHash = sha256(REPORT_PATH);

if (failures.length) {
  console.error('L6-B8 schema/migration regression: FAIL (' + passed + '/' + checks.length + ')');
  console.error(failures.join('\n'));
  console.error('Report: ' + REPORT_PATH);
  console.error('Report SHA-256: ' + reportHash);
  process.exit(1);
}

console.log('L6-B8 schema/migration regression: PASS (' + passed + '/' + checks.length + ')');
console.log('Mutation tests: ' + mutationTests.length + '/' + mutationTests.length + ' expected failures observed');
console.log('Research dry-run candidates: ' + researchProjectionOutcomes.length + '/' + researchLessons.length);
console.log('Report: ' + REPORT_PATH);
console.log('Report SHA-256: ' + reportHash);
