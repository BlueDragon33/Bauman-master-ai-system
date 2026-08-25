'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '../..');
const MANIFEST_PATH = 'assets/data/lesson/reference-lesson-activation-v1.json';
const SCHEMA_PATH = 'assets/data/lesson/schema/universal-lesson-v2.schema.json';
const POLICY_PATH = 'assets/data/lesson/universal-lesson-block-policy-v1.json';
const REGISTRY_PATH = 'assets/data/lesson/subject-factory-registry-v1.json';
const SOURCE_PATH = 'subjects/foundation/data/lessons.json';
const FOUNDATION_INDEX = 'subjects/foundation/index.html';
const FOUNDATION_RUNTIME = 'subjects/foundation/assets/foundation.js';
const RUNTIME_PATH = 'assets/js/platform/universal-lesson/reference-lesson-runtime-v1.js';
const BOOTSTRAP_PATH = 'assets/js/platform/universal-lesson/reference-lesson-bootstrap-v1.js';
const CSS_PATH = 'assets/css/universal-lesson-reference.css';
const DOC_PATH = 'docs/migration/L6_B11_REFERENCE_RUNTIME_ROLLBACK_CHECKPOINT.md';
const REPORT_PATH = 'docs/migration/L6_B11_REFERENCE_RUNTIME_REGRESSION.generated.json';
const B10_REPORT_PATH = 'docs/migration/L6_B10_RENDERER_BRIDGE_REGRESSION.generated.json';
const EXPECTED_B10_REPORT_SHA = '3157bed5c4494209b65a539c9c08a5a2794cc2b888991858ea6e7e7445b93ce8';

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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function get(object, dotted) {
  return dotted.split('.').reduce(function (value, key) {
    return value && value[key];
  }, object);
}

for (const file of [
  'assets/js/platform/universal-lesson/lesson-schema-validator-v1.js',
  'assets/js/platform/universal-lesson/lesson-version-migrator-v1.js',
  'assets/js/platform/universal-lesson/subject-factory-registry-v1.js',
  'assets/js/platform/universal-lesson/universal-lesson-renderer-v1.js',
  RUNTIME_PATH
]) {
  require(absolute(file));
}

const validator = globalThis.BaumanUniversalLessonValidator;
const referenceRuntime = globalThis.BaumanL6ReferenceLessonRuntime;
const manifest = json(MANIFEST_PATH);
const schema = json(SCHEMA_PATH);
const blockPolicy = json(POLICY_PATH);
const registry = json(REGISTRY_PATH);
const sourceRecords = json(SOURCE_PATH);
const b10Report = json(B10_REPORT_PATH);
const runtimeSource = read(RUNTIME_PATH);
const bootstrapSource = read(BOOTSTRAP_PATH);
const foundationIndex = read(FOUNDATION_INDEX);
const cssSource = read(CSS_PATH);
const doc = fs.existsSync(absolute(DOC_PATH)) ? read(DOC_PATH) : '';
const checks = [];
const failures = [];
const mutationTests = [];

function check(id, title, ok, evidence) {
  const row = { id, title, ok: !!ok, evidence: evidence === undefined ? null : evidence };
  checks.push(row);
  if (!row.ok) failures.push(id + ': ' + title);
  return row.ok;
}

function planFor(input) {
  const options = input || {};
  return referenceRuntime.buildReferencePlan({
    manifest: options.manifest || manifest,
    schema: options.schema || schema,
    blockPolicy: options.blockPolicy || blockPolicy,
    registry: options.registry || registry,
    sourceRecords: options.sourceRecords || sourceRecords,
    availableCapabilities: Object.prototype.hasOwnProperty.call(options, 'availableCapabilities')
      ? options.availableCapabilities
      : ['speech-recording']
  });
}

function mutation(id, title, result, expectedCodes) {
  const codes = Array.isArray(expectedCodes) ? expectedCodes : [expectedCodes];
  const observed = result?.ok !== true && codes.includes(result?.code);
  mutationTests.push({
    id,
    title,
    expectedFailureObserved: observed,
    code: result?.code || null
  });
  check('MUTATION-' + id, title, observed, { code: result?.code || null, expectedCodes: codes });
}

const manifestValidation = referenceRuntime.validateManifest(manifest);
check(
  'MANIFEST-CONTRACT',
  'activation manifest validates as the exact B11 contract',
  manifestValidation.valid === true && manifestValidation.code === 'ACTIVATION_MANIFEST_VALID',
  manifestValidation
);
check(
  'PROGRAM-IDENTITY',
  'official and personalized Bauman codes remain distinct',
  manifest.programIdentity.department === 'ИУ-5'
    && manifest.programIdentity.officialPublishedDirectionCode === '09.04.01'
    && manifest.programIdentity.personalizedDisplayCode === '09.04.01/11',
  manifest.programIdentity
);
check(
  'EXACT-ALLOWLIST',
  'only one Foundation lesson is runtime-enabled by B11',
  manifest.referenceLessons.length === 1
    && manifest.referenceLessons[0].subjectId === 'foundation'
    && manifest.referenceLessons[0].lessonId === 'f_s01_l1'
    && manifest.referenceLessons[0].enabled === true,
  manifest.referenceLessons.map(function (item) {
    return { subjectId: item.subjectId, lessonId: item.lessonId, enabled: item.enabled };
  })
);
check(
  'BOUNDARY',
  'activation forbids source migration state migration upload persistence and automatic Master-ready',
  manifest.runtimeBoundary.sourceMutationAllowed === false
    && manifest.runtimeBoundary.learnerStateMigrationAllowed === false
    && manifest.runtimeBoundary.networkUploadAllowed === false
    && manifest.runtimeBoundary.audioPersistenceAllowed === false
    && manifest.runtimeBoundary.automaticMasterReadyAllowed === false
    && manifest.runtimeBoundary.legacyFallbackRequired === true,
  manifest.runtimeBoundary
);
check(
  'REVIEW-BOUNDARY',
  'review record is scoped to mapping policy capability and does not claim academic approval',
  manifest.referenceLessons[0].projection.review.status === 'reviewed-for-exact-b11-reference'
    && manifest.referenceLessons[0].projection.review.academicApproval === 'not-claimed'
    && manifest.referenceLessons[0].projection.review.masterReadyApproval === 'not-claimed',
  manifest.referenceLessons[0].projection.review
);

const sourceBefore = validator.hash256(sourceRecords);
const plan = planFor();
const sourceAfter = validator.hash256(sourceRecords);
check(
  'REFERENCE-PLAN',
  'exact reviewed Foundation projection builds through Subject Factory',
  plan.ok === true
    && plan.code === 'REFERENCE_RUNTIME_READY'
    && plan.subjectId === 'foundation'
    && plan.lessonId === 'f_s01_l1'
    && plan.lessonType === 'language'
    && plan.factory.ruleId === 'foundation-classroom-and-study',
  plan.ok ? { code: plan.code, factory: plan.factory } : plan
);
check(
  'SOURCE-UNCHANGED',
  'planning leaves the complete legacy lessons array byte-semantically unchanged',
  plan.sourceUnchanged === true
    && plan.sourceMutationPerformed === false
    && sourceBefore === sourceAfter
    && plan.sourceDigest === manifest.referenceLessons[0].source.stableRecordSha256,
  { sourceBefore, sourceAfter, sourceDigest: plan.sourceDigest }
);
check(
  'DEPENDENCY-PINS',
  'schema policy and Factory stable JSON digests match the review pins',
  plan.ok === true
    && plan.dependencyDigests.schema === manifest.dependencies.schema.stableJsonSha256
    && plan.dependencyDigests.blockPolicy === manifest.dependencies.blockPolicy.stableJsonSha256
    && plan.dependencyDigests.subjectFactory === manifest.dependencies.subjectFactory.stableJsonSha256,
  plan.dependencyDigests
);
check(
  'PROJECTION-PIN',
  'deterministic eLearning projection matches the reviewed output digest',
  plan.projection.outputDigest === manifest.referenceLessons[0].projection.stableOutputSha256
    && plan.projection.warningCount === 1
    && plan.projection.academicApproval === 'not-claimed',
  plan.projection
);
check(
  'RENDER-PINS',
  'render model and safe HTML match their exact review digests',
  plan.modelDigest === manifest.referenceLessons[0].projection.stableRenderModelSha256
    && plan.htmlDigest === manifest.referenceLessons[0].projection.stableHtmlSha256,
  { modelDigest: plan.modelDigest, htmlDigest: plan.htmlDigest }
);

const expectedKinds = manifest.referenceLessons[0].expectedRender.sectionKinds;
const actualKinds = plan.model.sections.map(function (section) { return section.kind; });
const oral = plan.model.sections.find(function (section) { return section.kind === 'oral'; });
check(
  'B3-POLICY-COMPLETE',
  'full language policy resolves ten meaningful sections without orientation-mode weakening',
  plan.model.policyEvidence.lessonMode === null
    && JSON.stringify(actualKinds) === JSON.stringify(expectedKinds)
    && actualKinds.length === 10,
  actualKinds
);
check(
  'REAL-ORAL-CAPABILITY',
  'required external oral block binds only to the implemented memory-only recording widget',
  oral?.mode === 'external'
    && oral?.capabilityRef === 'speech-recording'
    && oral?.widgetId === 'foundation-oral-rehearsal'
    && Object.keys(plan.capabilityProviders).length === 1,
  oral
);
check(
  'NO-MASTER-READY-CLAIM',
  'reference render never turns open completion or recording into Master-ready',
  plan.masterReadyClaimed === false
    && plan.model.masterReadyClaimed === false
    && /Master-ready: do policy B5/.test(plan.html),
  { plan: plan.masterReadyClaimed, model: plan.model.masterReadyClaimed }
);
check(
  'SAFE-LEARNER-HTML',
  'rendered learner HTML is semantic escaped and comparison-school free',
  /data-universal-lesson="f_s01_l1"/.test(plan.html)
    && /09\.04\.01\/11/.test(plan.html)
    && !/<script/i.test(plan.html)
    && !/\son[a-z]+=/i.test(plan.html)
    && !/HUTECH/i.test(plan.html),
  { htmlDigest: plan.htmlDigest }
);

const rollback = referenceRuntime.rollback(plan, plan.source);
check(
  'ROLLBACK',
  'rollback restores the unchanged Foundation engine route after a source digest check',
  rollback.ok === true
    && rollback.code === 'UNCHANGED_FOUNDATION_ROUTE_RESTORED'
    && rollback.route === 'subjects/foundation/index.html'
    && rollback.sourceUnchanged === true
    && rollback.learnerStateWritePerformed === false
    && rollback.cacheWritePerformed === false,
  rollback
);

const withoutCapability = planFor({ availableCapabilities: [] });
check(
  'FAIL-CLOSED-CAPABILITY',
  'missing MediaRecorder capability blocks Universal activation and keeps legacy fallback',
  withoutCapability.ok === false
    && withoutCapability.code === 'CAPABILITY_UNAVAILABLE'
    && withoutCapability.legacyFallbackRequired === true,
  withoutCapability
);

check(
  'BOOTSTRAP-BOUNDARY',
  'Foundation entry loads only the B11 bootstrap after the unchanged legacy runtime',
  foundationIndex.includes('reference-lesson-bootstrap-v1.js')
    && !foundationIndex.includes('universal-lesson-renderer-v1.js')
    && !foundationIndex.includes('legacy-lesson-bridge-v1.js')
    && foundationIndex.indexOf('./assets/foundation.js') < foundationIndex.indexOf('reference-lesson-bootstrap-v1.js'),
  FOUNDATION_INDEX
);
check(
  'BOOTSTRAP-SEQUENCE',
  'B11 bootstrap loads locked dependencies before the exact activation runtime',
  /lesson-schema-validator-v1/.test(bootstrapSource)
    && /lesson-version-migrator-v1/.test(bootstrapSource)
    && /subject-factory-registry-v1/.test(bootstrapSource)
    && /universal-lesson-renderer-v1/.test(bootstrapSource)
    && /reference-lesson-runtime-v1/.test(bootstrapSource)
    && /for \(const entry of modules\) await loadModule/.test(bootstrapSource),
  BOOTSTRAP_PATH
);
check(
  'RUNTIME-PRIVACY',
  'recording is memory-only with track and object-URL cleanup and no persistence API',
  /MediaRecorder/.test(runtimeSource)
    && /getUserMedia/.test(runtimeSource)
    && /revokeObjectURL/.test(runtimeSource)
    && /track\.stop/.test(runtimeSource)
    && !/localStorage/.test(runtimeSource)
    && !/indexedDB/.test(runtimeSource)
    && !/caches\./.test(runtimeSource)
    && !/serviceWorker/.test(runtimeSource),
  RUNTIME_PATH
);
check(
  'LEGACY-FALLBACK-UX',
  'Universal modal exposes an explicit old-interface fallback and wraps only openLesson',
  /data-l6-reference-action=\\?"legacy\\?"/.test(runtimeSource)
    && /legacy\.openLesson/.test(runtimeSource)
    && /if \(tryOpen\(lessonId\)\) return true/.test(runtimeSource),
  RUNTIME_PATH
);
check(
  'RESPONSIVE-CONTRACT',
  'reference modal CSS includes desktop two-column and mobile one-column boundaries',
  /grid-template-columns:minmax\(0,1\.15fr\)/.test(cssSource)
    && /@media\(max-width:760px\)/.test(cssSource)
    && /\.ul-support-grid,\.ul-oral-widget\{grid-template-columns:1fr\}/.test(cssSource)
    && /width:100vw/.test(cssSource),
  CSS_PATH
);
check(
  'LEARNER-BRAND',
  'new learner entry runtime style and manifest contain no comparison-school label',
  [foundationIndex, runtimeSource, bootstrapSource, cssSource, JSON.stringify(manifest)]
    .every(function (value) { return !/HUTECH/i.test(value); }),
  [FOUNDATION_INDEX, RUNTIME_PATH, BOOTSTRAP_PATH, CSS_PATH, MANIFEST_PATH]
);

const specialistEvidence = {};
for (const subjectId of ['russian', 'math']) {
  const guard = manifest.specialistGuards[subjectId];
  const indexPath = 'subjects/' + subjectId + '/index.html';
  specialistEvidence[subjectId] = {
    guard,
    referenceBootstrapLoaded: /reference-lesson-(?:bootstrap|runtime)-v1/.test(read(indexPath))
  };
}
check(
  'SPECIALIST-NOT-ACTIVATED',
  'Russian and Mathematics keep their unchanged delegate routes and load no B11 pilot',
  Object.values(specialistEvidence).every(function (entry) {
    return entry.guard.behavior === 'delegate-unchanged'
      && entry.guard.activationAllowed === false
      && entry.referenceBootstrapLoaded === false;
  }),
  specialistEvidence
);

const b10Compatibility = b10Report.referenceCompatibilitySha256 || {};
const protectedPaths = [
  'subjects/russian/assets/core.js',
  'subjects/russian/assets/subject-adapter.js',
  'subjects/russian/data/lessons.json',
  'subjects/math/assets/subject-adapter.js',
  'subjects/math/assets/theory_skin/theory-tab-E129.js',
  'subjects/math/data/theory_lecture_content.json',
  FOUNDATION_RUNTIME,
  SOURCE_PATH
];
const protectedHashes = Object.fromEntries(protectedPaths.map(function (file) {
  return [file, { expected: b10Compatibility[file], actual: sha256(file) }];
}));
check(
  'REFERENCE-COMPATIBILITY',
  'Russian Math and unchanged Foundation source/runtime match the locked B10 checkpoint hashes',
  protectedPaths.every(function (file) {
    return /^[0-9a-f]{64}$/.test(protectedHashes[file].expected || '')
      && protectedHashes[file].expected === protectedHashes[file].actual;
  }),
  protectedHashes
);
check(
  'B10-REPORT-STABLE',
  'locked B10 report remains byte-identical after guarded B11 wiring',
  b10Report.status === 'PASS'
    && b10Report.summary?.failed === 0
    && sha256(B10_REPORT_PATH) === EXPECTED_B10_REPORT_SHA,
  { status: b10Report.status, sha256: sha256(B10_REPORT_PATH) }
);

const dependencyMutant = clone(manifest);
dependencyMutant.dependencies.schema.stableJsonSha256 = '0'.repeat(64);
mutation('DEPENDENCY-PIN', 'changed schema pin blocks activation', planFor({ manifest: dependencyMutant }), ['DEPENDENCY_DIGEST_MISMATCH']);

const sourceMutant = clone(sourceRecords);
sourceMutant.find(function (item) { return item.id === 'f_s01_l1'; }).title += ' changed';
mutation('SOURCE-DIGEST', 'changed legacy lesson blocks activation', planFor({ sourceRecords: sourceMutant }), ['SOURCE_DIGEST_MISMATCH']);

const contextMutant = clone(manifest);
contextMutant.referenceLessons[0].projection.context.lessonType = 'programming';
mutation('CONTEXT', 'changed projection type fails the exact manifest boundary', planFor({ manifest: contextMutant }), ['INVALID_ACTIVATION_MANIFEST']);

const registryMutant = clone(registry);
registryMutant.subjects.foundation.compatibility.factoryPilot = false;
const registryManifest = clone(manifest);
registryManifest.dependencies.subjectFactory.stableJsonSha256 = validator.hash256(registryMutant);
mutation('FACTORY-PILOT', 'removing Factory pilot authorization blocks activation', planFor({ manifest: registryManifest, registry: registryMutant }), ['FACTORY_PILOT_NOT_AUTHORIZED']);

const capabilityMutant = clone(manifest);
capabilityMutant.widgets['foundation-oral-rehearsal'].capabilityRefs.push('dialogue');
mutation('CAPABILITY-SCOPE', 'widening the reviewed widget capability list fails closed', planFor({ manifest: capabilityMutant }), ['INVALID_ACTIVATION_MANIFEST']);

const reviewMutant = clone(manifest);
reviewMutant.referenceLessons[0].projection.review.academicApproval = 'instructor-approved';
mutation('REVIEW-AUTHORITY', 'claiming unrecorded academic approval fails closed', planFor({ manifest: reviewMutant }), ['INVALID_ACTIVATION_MANIFEST']);

const masteryMutant = clone(manifest);
masteryMutant.referenceLessons[0].expectedRender.masterReadyClaimed = true;
mutation('MASTER-READY', 'turning the pilot into a Master-ready claim fails closed', planFor({ manifest: masteryMutant }), ['INVALID_ACTIVATION_MANIFEST']);

const routeMutant = clone(manifest);
routeMutant.referenceLessons[0].rollback.route = 'subjects/russian/index.html';
mutation('ROLLBACK-ROUTE', 'redirecting rollback to another subject fails closed', planFor({ manifest: routeMutant }), ['INVALID_ACTIVATION_MANIFEST']);

mutation('MISSING-CAPABILITY', 'missing recording API keeps the old lesson active', planFor({ availableCapabilities: [] }), ['CAPABILITY_UNAVAILABLE']);

const rollbackSourceMutant = clone(plan.source);
rollbackSourceMutant.title += ' tampered';
mutation('ROLLBACK-DIGEST', 'rollback rejects a modified source snapshot', referenceRuntime.rollback(plan, rollbackSourceMutant), ['SOURCE_INTEGRITY_FAILED']);

const specialistMutant = clone(manifest);
specialistMutant.specialistGuards.russian.activationAllowed = true;
mutation('SPECIALIST-GUARD', 'enabling Russian pilot cutover fails the specialist guard', planFor({ manifest: specialistMutant }), ['INVALID_ACTIVATION_MANIFEST']);

const privacyMutant = clone(manifest);
privacyMutant.runtimeBoundary.audioPersistenceAllowed = true;
mutation('AUDIO-PERSISTENCE', 'allowing recording persistence fails the privacy boundary', planFor({ manifest: privacyMutant }), ['INVALID_ACTIVATION_MANIFEST']);

check(
  'MUTATION-SUMMARY',
  'all twelve B11 protection mutations fail in the expected direction',
  mutationTests.length === 12
    && mutationTests.every(function (item) { return item.expectedFailureObserved; }),
  mutationTests.map(function (item) { return { id: item.id, code: item.code }; })
);

check(
  'DOC-DECISION',
  'B11 decision record explains capability truth rollback offline and specialist boundaries',
  /LIGHT-POLICY-CAPABILITY-GAP/.test(doc)
    && /speech-recording/.test(doc)
    && /MediaRecorder/.test(doc)
    && /Russian/.test(doc)
    && /Mathematics/.test(doc)
    && /offline/.test(doc)
    && /rollback/.test(doc),
  DOC_PATH
);

const artifacts = [
  MANIFEST_PATH,
  RUNTIME_PATH,
  BOOTSTRAP_PATH,
  CSS_PATH,
  FOUNDATION_INDEX,
  DOC_PATH
];
const artifactHashes = Object.fromEntries(artifacts.filter(function (file) {
  return fs.existsSync(absolute(file));
}).map(function (file) {
  return [file, sha256(file)];
}));
const passed = checks.filter(function (item) { return item.ok; }).length;
const report = {
  schema: 'L6_B11_REFERENCE_RUNTIME_REGRESSION_V1',
  status: failures.length ? 'FAIL' : 'PASS',
  branch: 'migration/webapp-l1-audit-storage',
  generatedFor: '2026-08-24',
  scope: 'Exact reviewed Foundation reference activation, real memory-only oral capability, responsive/offline browser ownership and digest-checked rollback; Russian and Mathematics remain unchanged delegates.',
  summary: {
    total: checks.length,
    passed,
    failed: checks.length - passed,
    referenceLessons: manifest.referenceLessons.length,
    renderedSections: plan.model?.sections?.length || 0,
    externalCapabilities: Object.keys(plan.capabilityProviders || {}).length,
    mutationTests: mutationTests.length,
    expectedMutationFailuresObserved: mutationTests.filter(function (item) {
      return item.expectedFailureObserved;
    }).length
  },
  activation: plan.ok ? {
    code: plan.code,
    subjectId: plan.subjectId,
    lessonId: plan.lessonId,
    lessonType: plan.lessonType,
    factory: plan.factory,
    sourceDigest: plan.sourceDigest,
    outputDigest: plan.projection.outputDigest,
    modelDigest: plan.modelDigest,
    htmlDigest: plan.htmlDigest,
    sectionKinds: actualKinds,
    capabilityProviders: plan.capabilityProviders,
    masterReadyClaimed: plan.masterReadyClaimed
  } : plan,
  rollback,
  specialistEvidence,
  protectedCompatibilitySha256: protectedHashes,
  mutationTests,
  b11ArtifactSha256: artifactHashes,
  checks
};

fs.writeFileSync(absolute(REPORT_PATH), JSON.stringify(report, null, 2) + '\n');
const reportHash = sha256(REPORT_PATH);

if (failures.length) {
  console.error('L6-B11 reference runtime regression: FAIL (' + passed + '/' + checks.length + ')');
  console.error(failures.join('\n'));
  console.error('Report: ' + REPORT_PATH);
  console.error('Report SHA-256: ' + reportHash);
  process.exit(2);
}

console.log('L6-B11 reference runtime regression: PASS (' + passed + '/' + checks.length + ')');
console.log('Reference activation: foundation:f_s01_l1');
console.log('Rendered sections: ' + actualKinds.length + '/' + expectedKinds.length);
console.log('External capabilities: ' + Object.keys(plan.capabilityProviders).length + '/1');
console.log('Mutation tests: ' + mutationTests.length + '/' + mutationTests.length + ' expected failures observed');
console.log('Report: ' + REPORT_PATH);
console.log('Report SHA-256: ' + reportHash);
