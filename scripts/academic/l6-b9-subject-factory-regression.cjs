'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.cwd();
const REGISTRY_PATH = 'assets/data/lesson/subject-factory-registry-v1.json';
const RESOLVER_PATH = 'assets/js/platform/universal-lesson/subject-factory-registry-v1.js';
const VALIDATOR_PATH = 'assets/js/platform/universal-lesson/lesson-schema-validator-v1.js';
const TYPE_REGISTRY_PATH = 'assets/data/lesson/lesson-type-registry-v1.json';
const MAIN_CATALOG_PATH = 'assets/js/data.js';
const OFFLINE_MANAGER_PATH = 'assets/js/platform/offline-subject-pack-manager.js';
const DOC_PATH = 'docs/migration/L6_B9_SUBJECT_FACTORY_REGISTRY.md';
const REPORT_PATH = 'docs/migration/L6_B9_SUBJECT_FACTORY_REGRESSION.generated.json';
const RUSSIAN_LAZY_PATH = 'subjects/russian/assets/lazy-heavy-data-v1341.js';
const LIGHT_SUBJECTS = ['ai', 'foundation', 'research', 'signal', 'systems'];
const SPECIALIST_SUBJECTS = ['russian', 'math', 'programming'];
const EXPECTED_SUBJECTS = ['russian', 'math', 'programming', 'foundation', 'ai', 'signal', 'systems', 'research'];
const EXPECTED_LIGHT_COUNTS = {
  ai: 51,
  foundation: 21,
  research: 45,
  signal: 36,
  systems: 57
};

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

function loadFactory(resolverSource) {
  const sandbox = { window: {}, TextEncoder };
  vm.createContext(sandbox);
  vm.runInContext(read(VALIDATOR_PATH), sandbox, { filename: VALIDATOR_PATH });
  vm.runInContext(resolverSource || read(RESOLVER_PATH), sandbox, { filename: RESOLVER_PATH });
  return {
    validator: sandbox.window.BaumanUniversalLessonValidator,
    factory: sandbox.window.BaumanSubjectFactoryRegistry
  };
}

function loadAdapter(subjectId) {
  const adapterPath = 'subjects/' + subjectId + '/assets/subject-adapter.js';
  const sandbox = { window: {} };
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(read(adapterPath), sandbox, { filename: adapterPath });
  return { adapter: sandbox.window.SUBJECT_ADAPTER, sandbox };
}

function registrySourceIds(subject) {
  const sources = subject.dataSources;
  return unique([].concat(
    sources.startup || [],
    sources.requiredLazy || [],
    sources.optionalLazy || [],
    sources.runtimeSupplemental || []
  ));
}

function parseRuntimeDataFiles(source) {
  const match = source.match(/(?:const|let|var)\s+DATA_FILES\s*=\s*\[([^\]]+)\]/);
  if (!match) return [];
  const values = [];
  const quotePattern = /['"]([^'"]+)['"]/g;
  let item;
  while ((item = quotePattern.exec(match[1]))) values.push(item[1]);
  return values;
}

function loadMainCatalog() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(read(MAIN_CATALOG_PATH), sandbox, { filename: MAIN_CATALOG_PATH });
  return sandbox.window.BAUMAN_DATA;
}

function classificationSummary(factory, registry, subjectId, lessons) {
  const outcomes = lessons.map(function (lesson) {
    const result = factory.resolveLessonType(registry, subjectId, lesson);
    return {
      lessonId: lesson.id || lesson.lessonId || null,
      moduleId: lesson.moduleId || null,
      ok: result.ok,
      code: result.code,
      lessonType: result.lessonType || null,
      authority: result.authority || null
    };
  });
  const types = {};
  outcomes.forEach(function (outcome) {
    const key = outcome.ok ? outcome.lessonType : outcome.code;
    types[key] = (types[key] || 0) + 1;
  });
  return { outcomes, types };
}

const requiredFiles = [
  REGISTRY_PATH,
  RESOLVER_PATH,
  VALIDATOR_PATH,
  TYPE_REGISTRY_PATH,
  MAIN_CATALOG_PATH,
  OFFLINE_MANAGER_PATH,
  DOC_PATH,
  RUSSIAN_LAZY_PATH
];

for (const subjectId of EXPECTED_SUBJECTS) {
  requiredFiles.push('subjects/' + subjectId + '/index.html');
  requiredFiles.push('subjects/' + subjectId + '/data/lessons.json');
  requiredFiles.push('subjects/' + subjectId + '/subject-manifest.json');
}
for (const subjectId of SPECIALIST_SUBJECTS) {
  requiredFiles.push('subjects/' + subjectId + '/assets/subject-adapter.js');
}
for (const subjectId of LIGHT_SUBJECTS) {
  requiredFiles.push('subjects/' + subjectId + '/assets/' + subjectId + '.js');
}

for (const file of unique(requiredFiles)) {
  check('FILE-' + file, 'required B9 input exists', fs.existsSync(absolute(file)), file);
}

if (failures.length) {
  console.error('L6-B9 regression cannot start because required inputs are missing.');
  console.error(failures.join('\n'));
  process.exit(2);
}

const registry = json(REGISTRY_PATH);
const resolverSource = read(RESOLVER_PATH);
const runtime = loadFactory(resolverSource);
const validator = runtime.validator;
const factory = runtime.factory;
const typeRegistry = json(TYPE_REGISTRY_PATH);
const mainCatalog = loadMainCatalog();
const offlineManagerSource = read(OFFLINE_MANAGER_PATH);
const doc = read(DOC_PATH);
const registryValidation = factory.validateRegistry(registry);
const subjectIds = Object.keys(registry.subjects);
const mainSubjectIds = mainCatalog.subjects.map(function (subject) { return subject.id; });
const lessonTypeIds = Object.keys(typeRegistry.types || {});

check(
  'REGISTRY-IDENTITY',
  'registry has the stable B9 identity and version',
  registry.registryId === 'bauman-subject-factory-registry'
    && registry.registryVersion === '1.0.0'
    && registry.status === 'L6-B9-SUBJECT-FACTORY-REGISTRY',
  { id: registry.registryId, version: registry.registryVersion, status: registry.status }
);
check(
  'REGISTRY-VALID',
  'resolver validates the committed registry',
  registryValidation.valid,
  registryValidation
);
check(
  'REGISTRY-DIGEST',
  'registry validation emits a stable SHA-256 digest',
  registryValidation.digest === validator.hash256(registry)
    && /^[0-9a-f]{64}$/.test(registryValidation.digest),
  registryValidation.digest
);
check(
  'PROGRAM-IDENTITY',
  'official and personalized Bauman codes remain exact and distinct',
  registry.programIdentity.department === 'ИУ-5'
    && registry.programIdentity.officialPublishedDirectionCode === '09.04.01'
    && registry.programIdentity.personalizedDisplayCode === '09.04.01/11'
    && registry.programIdentity.officialPublishedDirectionCode !== registry.programIdentity.personalizedDisplayCode,
  registry.programIdentity
);
check(
  'SUBJECT-SET',
  'Factory registers exactly the eight Main subjects',
  sameSet(subjectIds, EXPECTED_SUBJECTS)
    && sameSet(subjectIds, mainSubjectIds)
    && subjectIds.length === 8,
  { registry: subjectIds, main: mainSubjectIds }
);
check(
  'MAIN-SUBJECT-UNIQUE',
  'Main subject catalog IDs are unique',
  mainSubjectIds.length === unique(mainSubjectIds).length,
  mainSubjectIds
);
check(
  'TYPE-REGISTRY-BOUNDARY',
  'every allowed Factory lesson type belongs to the locked B4 vocabulary',
  subjectIds.every(function (subjectId) {
    return registry.subjects[subjectId].lessonTypePolicy.allowed.every(function (typeId) {
      return lessonTypeIds.includes(typeId);
    });
  }),
  lessonTypeIds
);
check(
  'CONTRACT-SET',
  'B9 references all B2-B8 contracts plus Main and offline policy',
  sameSet(Object.keys(registry.contractRefs), [
    'universalLesson',
    'blockPolicy',
    'lessonTypes',
    'masterReady',
    'visualTeaching',
    'languageHooks',
    'lessonMigration',
    'mainSubjectCatalog',
    'offlinePackManager'
  ]),
  Object.keys(registry.contractRefs)
);

for (const [refId, ref] of Object.entries(registry.contractRefs)) {
  check(
    'CONTRACT-FILE-' + refId,
    'contract reference resolves to an existing repository file',
    typeof ref.path === 'string' && fs.existsSync(absolute(ref.path)),
    ref
  );
  if (ref.id) {
    const contract = json(ref.path);
    check(
      'CONTRACT-IDENTITY-' + refId,
      'referenced JSON contract identity and version match',
      [contract.contractId, contract.registryId, contract.policyId].includes(ref.id)
        && [contract.contractVersion, contract.registryVersion, contract.policyVersion, contract.schemaVersion].includes(ref.version),
      {
        expected: { id: ref.id, version: ref.version },
        actual: {
          id: contract.contractId || contract.registryId || contract.policyId || null,
          version: contract.contractVersion || contract.registryVersion || contract.policyVersion || contract.schemaVersion || null
        }
      }
    );
  }
}

const descriptors = {};
const sourceEvidence = {};
for (const subjectId of subjectIds) {
  const subject = registry.subjects[subjectId];
  const resolved = factory.resolveSubject(registry, subjectId);
  const descriptor = factory.buildDescriptor(registry, subjectId);
  descriptors[subjectId] = descriptor;
  check(
    'SUBJECT-RESOLVE-' + subjectId,
    'subject resolves with registered engine and offline policy',
    resolved.ok && resolved.code === 'SUBJECT_RESOLVED',
    resolved.ok ? { engineRef: subject.engineRef, offlinePolicyRef: subject.offlinePolicyRef } : resolved
  );
  check(
    'SUBJECT-DESCRIPTOR-' + subjectId,
    'subject descriptor builds deterministically',
    descriptor.ok
      && descriptor.code === 'SUBJECT_DESCRIPTOR_BUILT'
      && descriptor.dataSources.length === registrySourceIds(subject).length,
    descriptor.ok ? {
      engineRef: descriptor.engineRef,
      sourceCount: descriptor.dataSources.length,
      widgetCount: descriptor.widgetRefs.length
    } : descriptor
  );
  check(
    'SUBJECT-MAIN-ROUTE-' + subjectId,
    'subject Main route is stable and exists',
    subject.routes.main === 'subjects/' + subjectId + '/index.html'
      && fs.existsSync(absolute(subject.routes.main)),
    subject.routes.main
  );
  check(
    'SUBJECT-ROUTES-' + subjectId,
    'all registered subject routes are safe and exist',
    Object.values(subject.routes).every(function (route) {
      return factory.safeRelativePath(route) && fs.existsSync(absolute(route));
    }),
    subject.routes
  );
  check(
    'SUBJECT-READ-ONLY-' + subjectId,
    'B9 subject profile cannot render migrate mutate source or migrate state',
    subject.compatibility.directMigration === false
      && subject.compatibility.directFactoryRender === false
      && subject.compatibility.sourceMutation === false
      && subject.compatibility.learnerStateMigration === false,
    subject.compatibility
  );
  const sourceIds = registrySourceIds(subject);
  check(
    'SOURCE-CLASS-UNIQUE-' + subjectId,
    'each registered source belongs to exactly one load class',
    sourceIds.length === [].concat(
      subject.dataSources.startup,
      subject.dataSources.requiredLazy,
      subject.dataSources.optionalLazy,
      subject.dataSources.runtimeSupplemental
    ).length,
    {
      startup: subject.dataSources.startup.length,
      requiredLazy: subject.dataSources.requiredLazy.length,
      optionalLazy: subject.dataSources.optionalLazy.length,
      runtimeSupplemental: subject.dataSources.runtimeSupplemental.length
    }
  );
  sourceEvidence[subjectId] = [];
  for (const sourceId of sourceIds) {
    const source = factory.resolveDataSource(registry, subjectId, sourceId);
    const exists = source.ok && fs.existsSync(absolute(source.relativePath));
    const bytes = exists ? fs.statSync(absolute(source.relativePath)).size : null;
    sourceEvidence[subjectId].push({
      sourceId,
      loadClass: source.loadClass || null,
      relativePath: source.relativePath || null,
      bytes
    });
    check(
      'SOURCE-RESOLVE-' + subjectId + '-' + sourceId,
      'registered source resolves to an existing safe local file',
      source.ok
        && factory.safeRelativePath(source.relativePath)
        && source.relativePath.startsWith(subject.dataSources.root + '/')
        && exists,
      source.ok ? {
        loadClass: source.loadClass,
        relativePath: source.relativePath,
        bytes
      } : source
    );
  }
}

const adapterEvidence = {};
for (const subjectId of SPECIALIST_SUBJECTS) {
  const loaded = loadAdapter(subjectId);
  const adapter = loaded.adapter;
  const subject = registry.subjects[subjectId];
  const registered = registrySourceIds(subject).filter(function (sourceId) {
    return !subject.dataSources.runtimeSupplemental.includes(sourceId);
  });
  const adapterSources = unique([].concat(adapter.dataFiles || [], adapter.optionalDataFiles || []));
  adapterEvidence[subjectId] = {
    registered,
    adapterDataFiles: Array.from(adapter.dataFiles || []),
    adapterOptionalDataFiles: Array.from(adapter.optionalDataFiles || []),
    adapterMetaKeys: Object.keys(adapter.dataSourceMeta || {})
  };
  check(
    'ADAPTER-SOURCES-' + subjectId,
    'specialist adapter source inventory reconciles exactly with B9',
    sameSet(registered, adapterSources),
    {
      registeredCount: registered.length,
      adapterCount: adapterSources.length,
      registryOnly: registered.filter(function (item) { return !adapterSources.includes(item); }),
      adapterOnly: adapterSources.filter(function (item) { return !registered.includes(item); })
    }
  );
  check(
    'ADAPTER-META-' + subjectId,
    'every registered specialist adapter source has metadata',
    registered.every(function (sourceId) {
      return Object.prototype.hasOwnProperty.call(adapter.dataSourceMeta || {}, sourceId);
    }),
    { registeredCount: registered.length, metaCount: Object.keys(adapter.dataSourceMeta || {}).length }
  );
}

const russianLoaded = loadAdapter('russian');
const russianSandbox = russianLoaded.sandbox;
russianSandbox.document = {
  readyState: 'loading',
  addEventListener: function () {},
  createElement: function () {
    return {
      dataset: {},
      click: function () {},
      remove: function () {}
    };
  },
  body: { appendChild: function () {} }
};
russianSandbox.setTimeout = function () { return 0; };
vm.runInContext(read(RUSSIAN_LAZY_PATH), russianSandbox, { filename: RUSSIAN_LAZY_PATH });
Array.from(russianSandbox.window.SUBJECT_ADAPTER.optionalDataFiles);
const russianLazySelfCheck = russianSandbox.window.BAUMAN_RUSSIAN_V1341_LAZY.selfCheck();
check(
  'RUSSIAN-REQUIRED-LAZY',
  'Russian vocab tests and speaking are required-lazy and persistence-safe',
  russianLazySelfCheck.ok
    && sameSet(russianLazySelfCheck.heavy, ['vocab', 'tests', 'speaking'])
    && sameSet(registry.subjects.russian.dataSources.requiredLazy, russianLazySelfCheck.heavy)
    && sameSet(registry.subjects.russian.dataSources.optionalLazy, [
      'dialogue-bauman-az',
      'deep-speaking-bauman',
      'speaking-link-index'
    ]),
  russianLazySelfCheck
);

const mathSources = registry.subjects.math.dataSources;
check(
  'MATH-AUTHORITATIVE-PRECEDENCE',
  'Mathematics prefers authoritative theory and keeps full legacy lessons deferred',
  mathSources.lessonSourcePolicy.primary === 'theory_lecture_content'
    && mathSources.lessonSourcePolicy.precedence[0] === 'window.DB.theory_lecture_content'
    && mathSources.lessonSourcePolicy.precedence.includes('registered-artifact-reader')
    && mathSources.lessonSourcePolicy.precedence.at(-1) === 'explicit-legacy-lessons'
    && mathSources.requiredLazy.includes('lessons')
    && mathSources.runtimeSupplemental.includes('lessons-deferred')
    && mathSources.pathOverrides['lessons-deferred'] === 'lessons_deferred.json',
  mathSources.lessonSourcePolicy
);

const lightEvidence = {};
for (const subjectId of LIGHT_SUBJECTS) {
  const subject = registry.subjects[subjectId];
  const manifest = json(subject.routes.manifest);
  const manifestSources = manifest.data.map(function (file) { return file.replace(/\.json$/, ''); });
  const runtimeDataFiles = parseRuntimeDataFiles(read(subject.routes.runtime));
  const lessons = json('subjects/' + subjectId + '/data/lessons.json');
  const expectedRuntimeSources = subject.dataSources.startup.concat(subject.dataSources.runtimeSupplemental);
  lightEvidence[subjectId] = {
    manifestSources,
    runtimeDataFiles,
    lessonCount: lessons.length,
    sourceVersionCount: lessons.filter(function (lesson) {
      return lesson.eLearning && lesson.eLearning.lessonContractVersion === 'elearning-v1.1';
    }).length
  };
  check(
    'LIGHT-MANIFEST-' + subjectId,
    'light JSON manifest matches the six registered startup sources',
    sameSet(manifestSources, subject.dataSources.startup) && manifestSources.length === 6,
    manifestSources
  );
  check(
    'LIGHT-RUNTIME-' + subjectId,
    'light runtime inventory equals startup plus simulations supplement',
    sameSet(runtimeDataFiles, expectedRuntimeSources)
      && sameSet(subject.dataSources.runtimeSupplemental, ['simulations'])
      && runtimeDataFiles.length === 7,
    runtimeDataFiles
  );
  check(
    'LIGHT-ELEARNING-' + subjectId,
    'all current light lessons preserve eLearning V1.1 source identity',
    lessons.length === EXPECTED_LIGHT_COUNTS[subjectId]
      && lessons.every(function (lesson) {
        return lesson.eLearning && lesson.eLearning.lessonContractVersion === 'elearning-v1.1';
      }),
    lightEvidence[subjectId]
  );
}

const lessonSources = {};
for (const subjectId of EXPECTED_SUBJECTS) {
  lessonSources[subjectId] = json('subjects/' + subjectId + '/data/lessons.json');
}
const lessonSourcesBefore = JSON.stringify(lessonSources);
const classification = {};
for (const subjectId of EXPECTED_SUBJECTS) {
  classification[subjectId] = classificationSummary(factory, registry, subjectId, lessonSources[subjectId]);
}

const expectedClassification = {
  russian: { language: 26 },
  math: { mathematics: 347 },
  programming: { programming: 28, database: 4, 'software-design': 16 },
  foundation: { language: 6, mathematics: 6, programming: 3, UNCLASSIFIED_LESSON: 6 },
  ai: { 'ml-data': 51 },
  signal: { 'ml-data': 36 },
  systems: { 'asoiu-system': 57 },
  research: { research: 45 }
};
for (const subjectId of EXPECTED_SUBJECTS) {
  check(
    'CLASSIFICATION-' + subjectId,
    'current lessons match the audited B9 primary-type distribution',
    JSON.stringify(classification[subjectId].types) === JSON.stringify(expectedClassification[subjectId]),
    classification[subjectId].types
  );
}
check(
  'CLASSIFICATION-SOURCE-UNCHANGED',
  'classification does not mutate any current lesson source',
  JSON.stringify(lessonSources) === lessonSourcesBefore,
  digestText(lessonSourcesBefore)
);
check(
  'FOUNDATION-FAIL-CLOSED',
  'Foundation holds exactly the two unreviewed modules with no default',
  registry.subjects.foundation.lessonTypePolicy.default === null
    && sameSet(registry.subjects.foundation.lessonTypePolicy.manualReviewModules, ['f_m201', 'f_m202'])
    && classification.foundation.outcomes.filter(function (item) {
      return item.code === 'UNCLASSIFIED_LESSON';
    }).every(function (item) {
      return ['f_m201', 'f_m202'].includes(item.moduleId);
    }),
  classification.foundation.types
);

const explicitSignalMath = factory.resolveLessonType(
  registry,
  'signal',
  lessonSources.signal[0],
  { explicitLessonType: 'mathematics' }
);
const explicitSystemsDesign = factory.resolveLessonType(
  registry,
  'systems',
  lessonSources.systems[0],
  { explicitLessonType: 'software-design' }
);
const forbiddenSignalResearch = factory.resolveLessonType(
  registry,
  'signal',
  lessonSources.signal[0],
  { explicitLessonType: 'research' }
);
check(
  'CLASSIFICATION-EXPLICIT-ALLOWED',
  'reviewed explicit context may select only an allowed subject type',
  explicitSignalMath.ok
    && explicitSignalMath.lessonType === 'mathematics'
    && explicitSystemsDesign.ok
    && explicitSystemsDesign.lessonType === 'software-design',
  { signal: explicitSignalMath, systems: explicitSystemsDesign }
);
check(
  'CLASSIFICATION-EXPLICIT-BLOCKED',
  'explicit context outside the subject type set fails closed',
  !forbiddenSignalResearch.ok && forbiddenSignalResearch.code === 'LESSON_TYPE_NOT_ALLOWED',
  forbiddenSignalResearch
);

const ambiguityRegistry = clone(registry);
ambiguityRegistry.subjects.programming.lessonTypePolicy.rules.push({
  id: 'mutation-pr06-design',
  type: 'software-design',
  lessonIds: ['PR06']
});
const ambiguousType = factory.resolveLessonType(
  ambiguityRegistry,
  'programming',
  lessonSources.programming.find(function (lesson) { return lesson.id === 'PR06'; })
);
check(
  'CLASSIFICATION-AMBIGUITY',
  'two rules producing different primary types fail closed',
  !ambiguousType.ok && ambiguousType.code === 'AMBIGUOUS_LESSON_TYPE',
  ambiguousType
);

const widgetEvidence = [];
for (const subjectId of subjectIds) {
  const subject = registry.subjects[subjectId];
  for (const widgetId of subject.widgetRefs) {
    const widget = registry.widgetCatalog[widgetId];
    const lessonType = widget.lessonTypes.find(function (typeId) {
      return subject.lessonTypePolicy.allowed.includes(typeId);
    });
    const resolved = factory.resolveWidget(registry, subjectId, widgetId, lessonType);
    const existing = ['existing', 'existing-lazy'].includes(widget.availability);
    widgetEvidence.push({
      subjectId,
      widgetId,
      availability: widget.availability,
      lessonType,
      ok: resolved.ok,
      useSpecialistWidget: resolved.useSpecialistWidget,
      useDeterministicFallback: resolved.useDeterministicFallback
    });
    check(
      'WIDGET-' + subjectId + '-' + widgetId,
      'registered widget resolves with truthful availability and deterministic fallback',
      resolved.ok
        && resolved.useSpecialistWidget === existing
        && resolved.useDeterministicFallback === !existing
        && typeof resolved.fallback === 'string'
        && resolved.fallback.length > 0,
      widgetEvidence.at(-1)
    );
  }
}
check(
  'WIDGET-PLANNED-AUTHORITY',
  'planned widgets claim no Master-ready authority before implementation',
  Object.values(registry.widgetCatalog).filter(function (widget) {
    return /^planned-/.test(widget.availability);
  }).every(function (widget) {
    return widget.masterReadyAuthority === 'none-until-implemented';
  }),
  Object.fromEntries(Object.entries(registry.widgetCatalog).filter(function (entry) {
    return /^planned-/.test(entry[1].availability);
  }).map(function (entry) {
    return [entry[0], entry[1].masterReadyAuthority];
  }))
);
check(
  'WIDGET-UNKNOWN',
  'unknown or cross-subject widgets fail closed',
  factory.resolveWidget(registry, 'math', 'code-runner', 'mathematics').code === 'UNREGISTERED_WIDGET'
    && factory.resolveWidget(registry, 'math', 'unknown-widget', 'mathematics').code === 'UNREGISTERED_WIDGET',
  'UNREGISTERED_WIDGET'
);
check(
  'WIDGET-TYPE-MISMATCH',
  'widget and lesson-type mismatch fails closed',
  factory.resolveWidget(registry, 'programming', 'code-runner', 'database').code === 'WIDGET_LESSON_TYPE_MISMATCH',
  factory.resolveWidget(registry, 'programming', 'code-runner', 'database')
);

const offlineEvidence = {};
for (const [policyId, policy] of Object.entries(registry.offlinePolicyCatalog)) {
  offlineEvidence[policyId] = policy;
  check(
    'OFFLINE-POLICY-' + policyId,
    'offline policy preserves L5 limits and deterministic local fallback',
    policy.baseDiscovery === 'runtime-network-probe'
      && policy.baseMaxResourceBytes === 5 * 1024 * 1024
      && policy.sessionMaxResourceBytes === 64 * 1024 * 1024
      && policy.silentWholeRepositoryPrecache === false
      && policy.generativeAiRequired === false
      && typeof policy.deterministicFallback === 'string'
      && policy.deterministicFallback.length > 0,
    policy
  );
}
check(
  'OFFLINE-RUNTIME-CONSTANTS',
  'registry byte limits and release match the existing offline manager',
  /const BASE_MAX_RESOURCE=5\*1024\*1024;/.test(offlineManagerSource)
    && /const SESSION_MAX_RESOURCE=64\*1024\*1024;/.test(offlineManagerSource)
    && /BAUMAN_OFFLINE_SUBJECT_PACK_MANAGER_2026_08_24/.test(offlineManagerSource)
    && registry.contractRefs.offlinePackManager.release === 'BAUMAN_OFFLINE_SUBJECT_PACK_MANAGER_2026_08_24',
  registry.contractRefs.offlinePackManager
);
const largeSources = Object.values(sourceEvidence).flat().filter(function (source) {
  return source.bytes > 5 * 1024 * 1024;
});
check(
  'OFFLINE-LARGE-SOURCES-DEFERRED',
  'every current source over 5 MiB is excluded from the startup class',
  largeSources.length === 6
    && largeSources.every(function (source) { return source.loadClass !== 'startup'; })
    && sameSet(largeSources.map(function (source) { return source.sourceId; }), [
      'vocab',
      'tests',
      'speaking',
      'dialogue-bauman-az',
      'deep-speaking-bauman',
      'lessons'
    ]),
  largeSources
);

check(
  'SECURITY-UNKNOWN-SUBJECT',
  'unknown and unsafe subject identifiers fail closed',
  factory.resolveSubject(registry, 'unknown').code === 'UNKNOWN_SUBJECT'
    && factory.resolveSubject(registry, '../math').code === 'INVALID_SUBJECT_ID',
  {
    unknown: factory.resolveSubject(registry, 'unknown').code,
    unsafe: factory.resolveSubject(registry, '../math').code
  }
);
check(
  'SECURITY-UNKNOWN-SOURCE',
  'unknown and unsafe source identifiers fail closed',
  factory.resolveDataSource(registry, 'math', 'not-registered').code === 'UNKNOWN_DATA_SOURCE'
    && factory.resolveDataSource(registry, 'math', '../lessons').code === 'INVALID_SOURCE_ID',
  {
    unknown: factory.resolveDataSource(registry, 'math', 'not-registered').code,
    unsafe: factory.resolveDataSource(registry, 'math', '../lessons').code
  }
);
check(
  'SECURITY-PATH-GUARD',
  'path guard rejects protocol absolute traversal query and fragment paths',
  [
    'https://example.test/data.json',
    '/subjects/math/data/lessons.json',
    '../subjects/math/data/lessons.json',
    'subjects/math/../russian/data/lessons.json',
    'subjects/math/data/lessons.json?x=1',
    'subjects/math/data/lessons.json#x'
  ].every(function (candidate) { return factory.safeRelativePath(candidate) === false; })
    && factory.safeRelativePath('subjects/math/data/lessons.json') === true,
  'safe repository-relative same-origin paths only'
);
check(
  'SECURITY-PURE-RUNTIME',
  'B9 resolver has no DOM network cache or persistence side effect',
  !/\bfetch\s*\(/.test(resolverSource)
    && !/\bdocument\b/.test(resolverSource)
    && !/\blocalStorage\b/.test(resolverSource)
    && !/\bindexedDB\b/.test(resolverSource)
    && !/\bcaches\b/.test(resolverSource),
  RESOLVER_PATH
);

const registryBeforeDescriptorMutation = JSON.stringify(registry);
const clonedDescriptor = factory.buildDescriptor(registry, 'math');
clonedDescriptor.routes.main = 'tampered';
clonedDescriptor.dataSources[0].relativePath = 'tampered';
check(
  'DESCRIPTOR-CLONE-BOUNDARY',
  'mutating a returned descriptor cannot mutate the registry',
  JSON.stringify(registry) === registryBeforeDescriptorMutation
    && registry.subjects.math.routes.main === 'subjects/math/index.html',
  registry.subjects.math.routes.main
);
const learnerSurfacePaths = [
  'index.html',
  MAIN_CATALOG_PATH
].concat(EXPECTED_SUBJECTS.map(function (subjectId) {
  return 'subjects/' + subjectId + '/index.html';
}));
check(
  'LEARNER-BRAND',
  'current learner entry surfaces contain no HUTECH label',
  learnerSurfacePaths.every(function (file) { return !/HUTECH/i.test(read(file)); }),
  learnerSurfacePaths
);
check(
  'B9-NO-RUNTIME-WIRING',
  'B9 registry and resolver are not loaded by current learner runtimes',
  learnerSurfacePaths.every(function (file) {
    const source = read(file);
    return !/subject-factory-registry-v1/.test(source)
      && !/BaumanSubjectFactoryRegistry/.test(source);
  }),
  'runtime wiring remains owned by L6-B10'
);
check(
  'B9-FORWARD-BOUNDARY',
  'registry explicitly assigns runtime wiring to B10',
  registry.forwardOwnership.runtimeWiringInB9 === false
    && /Renderer selection/.test(registry.forwardOwnership['L6-B10'])
    && /runtime/.test(registry.forwardOwnership['L6-B11']),
  registry.forwardOwnership
);

function mutationValidation(mutator) {
  const mutant = clone(registry);
  mutator(mutant);
  return factory.validateRegistry(mutant);
}

let mutationResult = mutationValidation(function (mutant) {
  mutant.engineCatalog['math-e126-specialist'].directFactoryRender = true;
});
recordMutation(
  'DIRECT-FACTORY-RENDER',
  'activating a B9 engine renderer is rejected',
  !mutationResult.valid && mutationResult.errors.some(function (item) {
    return item.code === 'ENGINE_RUNTIME_BOUNDARY_BROKEN';
  }),
  mutationResult.errors
);

mutationResult = mutationValidation(function (mutant) {
  mutant.subjects.ai.dataSources.runtimeSupplemental = [];
});
recordMutation(
  'LIGHT-SIMULATION-SUPPLEMENT',
  'removing the audited light simulation supplement is rejected',
  !mutationResult.valid && mutationResult.errors.some(function (item) {
    return item.code === 'LIGHT_SIMULATION_SUPPLEMENT_REQUIRED';
  }),
  mutationResult.errors
);

mutationResult = mutationValidation(function (mutant) {
  mutant.subjects.foundation.lessonTypePolicy.default = 'language';
});
recordMutation(
  'FOUNDATION-DEFAULT',
  'forcing a Foundation default across unreviewed modules is rejected',
  !mutationResult.valid && mutationResult.errors.some(function (item) {
    return item.code === 'FOUNDATION_FAIL_CLOSED_POLICY_REQUIRED';
  }),
  mutationResult.errors
);

mutationResult = mutationValidation(function (mutant) {
  mutant.subjects.russian.dataSources.requiredLazy = ['tests', 'speaking'];
  mutant.subjects.russian.dataSources.optionalLazy.push('vocab');
});
recordMutation(
  'RUSSIAN-PERSISTENCE',
  'moving required Russian vocab into optional persistence exclusion is rejected',
  !mutationResult.valid && mutationResult.errors.some(function (item) {
    return item.code === 'RUSSIAN_REQUIRED_LAZY_POLICY_REQUIRED';
  }),
  mutationResult.errors
);

mutationResult = mutationValidation(function (mutant) {
  mutant.subjects.math.dataSources.lessonSourcePolicy.primary = 'lessons';
  mutant.subjects.math.dataSources.lessonSourcePolicy.precedence = ['explicit-legacy-lessons'];
});
recordMutation(
  'MATH-SOURCE-PRECEDENCE',
  'selecting legacy Math lessons ahead of authoritative theory is rejected',
  !mutationResult.valid && mutationResult.errors.some(function (item) {
    return item.code === 'MATH_AUTHORITATIVE_SOURCE_POLICY_REQUIRED';
  }),
  mutationResult.errors
);

mutationResult = mutationValidation(function (mutant) {
  mutant.offlinePolicyCatalog['light-core-explicit'].silentWholeRepositoryPrecache = true;
});
recordMutation(
  'OFFLINE-WHOLE-REPOSITORY',
  'silent whole-repository precache is rejected',
  !mutationResult.valid && mutationResult.errors.some(function (item) {
    return item.code === 'OFFLINE_POLICY_UNSAFE';
  }),
  mutationResult.errors
);

mutationResult = mutationValidation(function (mutant) {
  mutant.subjects.math.dataSources.pathOverrides.lessons = '../../index.html';
});
recordMutation(
  'SOURCE-TRAVERSAL',
  'a traversal source path override is rejected',
  !mutationResult.valid && mutationResult.errors.some(function (item) {
    return item.code === 'UNSAFE_DATA_SOURCE_PATH';
  }),
  mutationResult.errors
);

mutationResult = mutationValidation(function (mutant) {
  mutant.widgetCatalog['code-runner'].masterReadyAuthority = 'deterministic-evaluator-only';
});
recordMutation(
  'PLANNED-WIDGET-AUTHORITY',
  'a planned widget cannot claim Master-ready authority',
  !mutationResult.valid && mutationResult.errors.some(function (item) {
    return item.code === 'PLANNED_WIDGET_AUTHORITY_FORBIDDEN';
  }),
  mutationResult.errors
);

check(
  'MUTATION-SUMMARY',
  'all eight B9 protection mutations fail in the expected direction',
  mutationTests.length === 8
    && mutationTests.every(function (item) { return item.expectedFailureObserved; }),
  mutationTests.map(function (item) {
    return { id: item.id, observed: item.expectedFailureObserved };
  })
);
check(
  'DOC-BOUNDARY',
  'decision record states pending remote CI and B9 no-render/no-write boundary',
  /implementation pending remote CI/.test(doc)
    && /B9 does not activate the Universal Lesson Renderer/.test(doc)
    && /B10 implements renderer selection/.test(doc)
    && /B11 validates the reference runtime/.test(doc),
  DOC_PATH
);
check(
  'DOC-CODES',
  'decision record distinguishes official and personalized program codes',
  doc.includes('official publication direction code:')
    && doc.includes('personalized learner display code:')
    && doc.includes('09.04.01')
    && doc.includes('09.04.01/11'),
  DOC_PATH
);
check(
  'DOC-FOUNDATION',
  'decision record documents the fail-closed Foundation pilot',
  doc.includes('f_m201')
    && doc.includes('f_m202')
    && doc.includes('UNCLASSIFIED_LESSON')
    && /Foundation therefore has no default primary type/.test(doc),
  DOC_PATH
);

const compatibilityPaths = [
  MAIN_CATALOG_PATH,
  OFFLINE_MANAGER_PATH,
  RUSSIAN_LAZY_PATH,
  'subjects/russian/assets/subject-adapter.js',
  'subjects/russian/data/lessons.json',
  'subjects/math/assets/subject-adapter.js',
  'subjects/math/data/theory_lecture_content.json',
  'subjects/math/data/lessons_deferred.json',
  'subjects/programming/assets/subject-adapter.js',
  'subjects/programming/data/lessons.json'
].concat(LIGHT_SUBJECTS.flatMap(function (subjectId) {
  return [
    'subjects/' + subjectId + '/subject-manifest.json',
    'subjects/' + subjectId + '/assets/' + subjectId + '.js',
    'subjects/' + subjectId + '/data/lessons.json'
  ];
}));
const compatibilityHashes = Object.fromEntries(unique(compatibilityPaths).map(function (file) {
  return [file, sha256(file)];
}));
check(
  'REFERENCE-SOURCE-HASHES',
  'current catalogs adapters runtimes and lesson sources are hashed for rollback comparison',
  Object.values(compatibilityHashes).every(function (value) {
    return /^[0-9a-f]{64}$/.test(value);
  }),
  compatibilityHashes
);

const b9ArtifactPaths = [REGISTRY_PATH, RESOLVER_PATH, DOC_PATH];
const b9ArtifactHashes = Object.fromEntries(b9ArtifactPaths.map(function (file) {
  return [file, sha256(file)];
}));
const passed = checks.filter(function (item) { return item.ok; }).length;
const report = {
  schema: 'L6_B9_SUBJECT_FACTORY_REGRESSION_V1',
  status: failures.length ? 'FAIL' : 'PASS',
  branch: 'migration/webapp-l1-audit-storage',
  generatedFor: '2026-08-24',
  scope: 'Read-only Subject Factory registry source resolver and compatibility audit; no renderer activation source migration or learner-state write.',
  summary: {
    total: checks.length,
    passed,
    failed: checks.length - passed,
    subjects: subjectIds.length,
    engines: Object.keys(registry.engineCatalog).length,
    widgets: Object.keys(registry.widgetCatalog).length,
    resolvedSources: Object.values(sourceEvidence).flat().length,
    currentLessonsClassified: Object.values(lessonSources).flat().length,
    heldFoundationLessons: classification.foundation.types.UNCLASSIFIED_LESSON || 0,
    mutationTests: mutationTests.length,
    expectedMutationFailuresObserved: mutationTests.filter(function (item) {
      return item.expectedFailureObserved;
    }).length
  },
  registry: {
    id: registry.registryId,
    version: registry.registryVersion,
    resolverRelease: factory.release,
    digestAlgorithm: registryValidation.digestAlgorithm,
    digest: registryValidation.digest,
    validationSummary: registryValidation.summary,
    warnings: registryValidation.warnings
  },
  programIdentity: registry.programIdentity,
  subjectDescriptors: Object.fromEntries(Object.entries(descriptors).map(function (entry) {
    const subjectId = entry[0];
    const descriptor = entry[1];
    return [subjectId, {
      ok: descriptor.ok,
      engineRef: descriptor.engineRef || null,
      sourceCount: descriptor.dataSources ? descriptor.dataSources.length : 0,
      widgetCount: descriptor.widgetRefs ? descriptor.widgetRefs.length : 0,
      offlinePolicyRef: descriptor.offlinePolicyRef || null,
      compatibility: descriptor.compatibility || null
    }];
  })),
  classification: Object.fromEntries(Object.entries(classification).map(function (entry) {
    return [entry[0], {
      sourceCount: entry[1].outcomes.length,
      distribution: entry[1].types
    }];
  })),
  sourceEvidence,
  adapterEvidence,
  lightEvidence,
  widgetEvidence,
  offlineEvidence,
  largeDeferredSources: largeSources,
  mutationTests,
  referenceCompatibilitySha256: compatibilityHashes,
  b9ArtifactSha256: b9ArtifactHashes,
  checks
};

fs.writeFileSync(absolute(REPORT_PATH), JSON.stringify(report, null, 2) + '\n');
const reportHash = sha256(REPORT_PATH);

if (failures.length) {
  console.error('L6-B9 Subject Factory regression: FAIL (' + passed + '/' + checks.length + ')');
  console.error(failures.join('\n'));
  console.error('Report: ' + REPORT_PATH);
  console.error('Report SHA-256: ' + reportHash);
  process.exit(1);
}

console.log('L6-B9 Subject Factory regression: PASS (' + passed + '/' + checks.length + ')');
console.log('Registered sources: ' + Object.values(sourceEvidence).flat().length);
console.log('Current lessons classified/held: ' + Object.values(lessonSources).flat().length);
console.log('Mutation tests: ' + mutationTests.length + '/' + mutationTests.length + ' expected failures observed');
console.log('Report: ' + REPORT_PATH);
console.log('Report SHA-256: ' + reportHash);
