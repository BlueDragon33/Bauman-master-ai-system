'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const REPORT_PATH = 'docs/migration/L6_B1_REFERENCE_AUDIT.generated.json';
const AUDIT_PATH = 'docs/migration/L6_B1_REFERENCE_IMPLEMENTATION_AUDIT.md';
const failures = [];
const checks = [];

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

function roles(lesson) {
  return Array.from(new Set((lesson.slides || [])
    .map((slide) => slide.role || slide.type || slide.kind)
    .filter(Boolean)));
}

function containsAll(values, expected) {
  const set = new Set(values);
  return expected.every((value) => set.has(value));
}

function sourceBytes(file) {
  return fs.statSync(path.join(ROOT, file)).size;
}

const requiredFiles = [
  AUDIT_PATH,
  'docs/migration/MIGRATION_PLAN.md',
  'assets/data/roadmap/iu5-090401-11-v3.json',
  'subjects/russian/index.html',
  'subjects/russian/subject-manifest.json',
  'subjects/russian/assets/subject-adapter.js',
  'subjects/russian/assets/lazy-heavy-data-v1341.js',
  'subjects/russian/data/lessons.json',
  'subjects/math/index.html',
  'subjects/math/subject-manifest.json',
  'subjects/math/assets/subject-adapter.js',
  'subjects/math/data/lessons.json',
  'subjects/math/data/theory_lecture_content.json'
];

for (const file of requiredFiles) {
  check('FILE-' + file, 'required audit input exists', fs.existsSync(path.join(ROOT, file)), file);
}

if (failures.length) {
  console.error('L6-B1 reference audit cannot start because required inputs are missing.');
  console.error(failures.join('\n'));
  process.exit(2);
}

const audit = read(AUDIT_PATH);
const masterPlan = read('docs/migration/MIGRATION_PLAN.md');
const roadmap = json('assets/data/roadmap/iu5-090401-11-v3.json');
const russianManifest = json('subjects/russian/subject-manifest.json');
const russianAdapter = read('subjects/russian/assets/subject-adapter.js');
const russianLazy = read('subjects/russian/assets/lazy-heavy-data-v1341.js');
const russianIndex = read('subjects/russian/index.html');
const russianLessons = json('subjects/russian/data/lessons.json');
const mathManifest = json('subjects/math/subject-manifest.json');
const mathAdapter = read('subjects/math/assets/subject-adapter.js');
const mathIndex = read('subjects/math/index.html');
const mathLessons = json('subjects/math/data/lessons.json');
const mathTheory = json('subjects/math/data/theory_lecture_content.json');

check(
  'PLAN-25-235',
  'master plan remains 25 rounds and 235 steps',
  masterPlan.includes('25 lượt · 235 bước'),
  'docs/migration/MIGRATION_PLAN.md'
);
check(
  'PLAN-L6-B1',
  'L6 starts with the three-reference deep audit',
  /Audit sâu ba reference implementations/.test(masterPlan),
  'L6 step 1'
);
check(
  'IDENTITY-DISPLAY',
  'personalized display code is 09.04.01/11',
  roadmap.displayCode === '09.04.01/11' && roadmap.department === 'ИУ-5',
  { displayCode: roadmap.displayCode, department: roadmap.department }
);
check(
  'IDENTITY-OFFICIAL',
  'official published code is 09.04.01',
  roadmap.officialPublishedDirectionCode === '09.04.01'
    && roadmap.source
    && roadmap.source.publicDirectionCode === '09.04.01',
  {
    officialPublishedDirectionCode: roadmap.officialPublishedDirectionCode,
    sourcePublicDirectionCode: roadmap.source && roadmap.source.publicDirectionCode
  }
);

const russianRoles = roles(russianLessons[0] || {});
const russianRequiredSources = (russianManifest.dataFiles || []).filter((item) => item.required);
const russianLazySources = (russianManifest.dataFiles || []).filter((item) => item.lazy);
const russianSpecialCapabilities = [
  'dialogue',
  'deep-dialogue',
  'deep-speaking',
  'speaking-link-index',
  'writing',
  'vocab',
  'grammar',
  'mindmap',
  'review',
  'exam',
  'json-import-export',
  'lazy-data'
];

check(
  'RUSSIAN-SCHEMA',
  'Russian keeps its dedicated subject schema',
  russianManifest.id === 'russian' && russianManifest.schema === 'SUBJECT_MODULE_V1',
  { id: russianManifest.id, schema: russianManifest.schema }
);
check(
  'RUSSIAN-LESSONS',
  'Russian baseline has 26 rich lessons',
  Array.isArray(russianLessons) && russianLessons.length === 26
    && Array.isArray(russianLessons[0].slides)
    && russianLessons[0].slides.length >= 40,
  { lessonCount: russianLessons.length, firstLessonSlides: russianLessons[0].slides.length }
);
check(
  'RUSSIAN-ROLES',
  'Russian slide roles preserve specialist pedagogy',
  containsAll(russianRoles, [
    'scenario',
    'vocabulary',
    'drill',
    'phrasebook',
    'mistake',
    'exercise',
    'rubric',
    'quiz',
    'routine'
  ]),
  russianRoles
);
check(
  'RUSSIAN-NOT-GENERIC',
  'Russian is not falsely classified as the generic eLearning payload',
  !Object.prototype.hasOwnProperty.call(russianLessons[0], 'eLearning'),
  Object.keys(russianLessons[0])
);
check(
  'RUSSIAN-DATA-POLICY',
  'Russian manifest distinguishes required and lazy sources',
  russianRequiredSources.length >= 12
    && containsAll(russianLazySources.map((item) => item.id), [
      'dialogue-bauman-az',
      'deep-speaking-bauman',
      'speaking-link-index'
    ]),
  {
    requiredCount: russianRequiredSources.length,
    lazySources: russianLazySources.map((item) => item.id)
  }
);
check(
  'RUSSIAN-L5-LAZY',
  'Russian L5 lazy overlay preserves required persistence-safe heavy data',
  russianLazy.includes("var heavy=['vocab','tests','speaking']")
    && russianLazy.includes('legacy-db-overlay-preserved')
    && russianLazy.includes('load-on-feature-entry'),
  'vocab/tests/speaking'
);
check(
  'RUSSIAN-CAPABILITIES',
  'Russian adapter still declares the audited specialist capabilities',
  russianSpecialCapabilities.every((value) => russianAdapter.includes("'" + value + "'")),
  russianSpecialCapabilities
);
check(
  'RUSSIAN-ENTRY',
  'Russian entry preserves storage, adapter, lazy overlay, planning bridge and core order',
  [
    '../../assets/js/platform/storage-adapter.js',
    '../../assets/js/platform/subject-storage.js',
    'assets/subject-adapter.js',
    'assets/lazy-heavy-data-v1341.js',
    'assets/planning-bridge.js',
    'assets/core.js'
  ].every((asset, index, values) => {
    const position = russianIndex.indexOf(asset);
    return position >= 0 && (index === 0 || position > russianIndex.indexOf(values[index - 1]));
  }),
  'subjects/russian/index.html'
);

const mathRoles = roles(mathLessons[0] || {});
const mathTheoryRecords = Array.isArray(mathTheory.records) ? mathTheory.records : [];
const mathSpecialScripts = [
  'theory-slideshow-identity-E210.js',
  'theory-slideshow-reader-content-E211.js',
  'theory-artifact-registry-E244.js',
  'theory-artifact-authoritative-route-E245.js',
  'theory-artifact-reader-E241.js',
  'theory-slideshow-richness-E242.js',
  'theory-slideshow-reader-formula-accuracy-E224.js',
  'theory-formula-typeset-E234.js'
];

check(
  'MATH-SCHEMA',
  'Mathematics keeps its dedicated subject schema',
  mathManifest.id === 'math' && mathManifest.schema === 'subject-v7',
  { id: mathManifest.id, schema: mathManifest.schema }
);
check(
  'MATH-LESSONS',
  'Mathematics baseline has 347 lessons',
  Array.isArray(mathLessons) && mathLessons.length === 347
    && mathManifest.data
    && mathManifest.data.lessons === 347,
  { actual: mathLessons.length, manifest: mathManifest.data && mathManifest.data.lessons }
);
check(
  'MATH-ROLES',
  'Mathematics slide roles preserve technical pedagogy',
  containsAll(mathRoles, [
    'problem_framing',
    'core_formula',
    'assumption_gate',
    'simulation',
    'common_mistakes',
    'application',
    'practice',
    'professor_qa'
  ]),
  mathRoles
);
check(
  'MATH-RENDER-METADATA',
  'Mathematics eLearning field is identified as render metadata',
  mathLessons[0].eLearning
    && mathLessons[0].eLearning.formulaRenderMode
    && !Object.prototype.hasOwnProperty.call(mathLessons[0].eLearning, 'objectives'),
  Object.keys(mathLessons[0].eLearning || {})
);
check(
  'MATH-AUTHORITATIVE-CONTENT',
  'Mathematics has a separate authoritative lecture record collection',
  mathTheory.schema
    && mathTheoryRecords.length === 18
    && mathTheoryRecords.every((record) => record.lessonId && Array.isArray(record.slides)),
  { schema: mathTheory.schema, recordCount: mathTheoryRecords.length }
);
check(
  'MATH-SPECIAL-LAYERS',
  'Mathematics entry keeps identity, artifact, reader, richness and formula layers',
  mathSpecialScripts.every((asset) => mathIndex.includes(asset)),
  mathSpecialScripts
);
check(
  'MATH-CAPABILITIES',
  'Mathematics adapter keeps formula, simulation, oral, application, review and exam capabilities',
  [
    'formula',
    'simulation',
    'professor-oral-defense',
    'application',
    'review',
    'exam',
    'json-import-export',
    'lazy-data'
  ].every((value) => mathAdapter.includes("'" + value + "'")),
  'subjects/math/assets/subject-adapter.js'
);

const lightSubjects = {
  foundation: 21,
  ai: 51,
  research: 45,
  signal: 36,
  systems: 57
};
const lightRequiredKeys = [
  'lessonContractVersion',
  'objectives',
  'prerequisites',
  'coreTheory',
  'workedExample',
  'guidedPractice',
  'commonMistakes',
  'checkpointQuestions',
  'masteryCriteria',
  'rubric',
  'reviewIfWrong'
];
const lightMetrics = {};

for (const [subject, minimum] of Object.entries(lightSubjects)) {
  const lessons = json('subjects/' + subject + '/data/lessons.json');
  const validPayloads = lessons.filter((lesson) => {
    const payload = lesson.eLearning || {};
    return payload.lessonContractVersion === 'elearning-v1.1'
      && lightRequiredKeys.every((key) => Object.prototype.hasOwnProperty.call(payload, key));
  });
  lightMetrics[subject] = {
    lessons: lessons.length,
    validPayloads: validPayloads.length,
    minimum
  };
  check(
    'LIGHT-' + subject.toUpperCase(),
    subject + ' has complete eLearning-v1.1 payloads',
    lessons.length >= minimum && validPayloads.length === lessons.length,
    lightMetrics[subject]
  );
}

const learnerFacingFiles = [
  'index.html',
  'assets/js/data.js',
  'assets/js/academic-data-v3.js',
  'assets/data/roadmap/iu5-090401-11-v3.json',
  'subjects/russian/index.html',
  'subjects/math/index.html',
  'subjects/foundation/index.html',
  'subjects/ai/index.html',
  'subjects/research/index.html',
  'subjects/signal/index.html',
  'subjects/systems/index.html',
  'subjects/russian/data/lessons.json',
  'subjects/math/data/lessons.json',
  'subjects/foundation/data/lessons.json',
  'subjects/ai/data/lessons.json',
  'subjects/research/data/lessons.json',
  'subjects/signal/data/lessons.json',
  'subjects/systems/data/lessons.json'
];
const comparisonLabel = ['hu', 'tech'].join('');
const comparisonViolations = learnerFacingFiles.filter((file) =>
  read(file).toLowerCase().includes(comparisonLabel)
);
check(
  'LEARNER-IDENTITY-BOUNDARY',
  'learner-facing shell and lesson sources contain no comparison-school label',
  comparisonViolations.length === 0,
  comparisonViolations
);

const decisionIds = Array.from({ length: 12 }, (_, index) =>
  'D' + String(index + 1).padStart(2, '0') + ' ·'
);
check(
  'AUDIT-DECISIONS',
  'audit records all twelve binding architecture decisions',
  decisionIds.every((id) => audit.includes(id)),
  decisionIds
);
check(
  'AUDIT-NO-FIXED-TABS',
  'audit explicitly separates semantic blocks from UI tabs',
  audit.includes('Semantic blocks are not UI tabs')
    && audit.includes('The five stages are learner states, not five mandatory tabs'),
  'D01'
);
check(
  'AUDIT-READ-ONLY-ADAPTERS',
  'audit requires read-only compatibility adapters first',
  audit.includes('Compatibility starts read-only')
    && /without rewriting source\s+files or state keys/.test(audit),
  'D03'
);
check(
  'AUDIT-CANDIDATE-NO-MERGE',
  'experimental branch is recorded as inspected but not merged',
  audit.includes('1680540ae06fcb2185d15eec5b0870a7cf5c7219')
    && /No commit\s+or tree from that branch is merged/.test(audit)
    && audit.includes('Exactly 18 canonical flow sections')
    && audit.includes('Reject as a universal invariant'),
  'academic/universal-lesson-factory-v1'
);

const boiSnapshot = {
  url: 'https://boi-ech.dinhnam3391.chatgpt.site',
  htmlSha256: 'e519d69fb792f6647ca824baaa1990db32eaee453944e814177595b6e2b77dea',
  pageJsSha256: '870bef7e83d04cd93025b1aa8936dd84ef72c69db3f3124bbf00a434ed8a6e87',
  cssSha256: 'b18a588795cad3932b5e96b3c9358056c0e9e7b55685aca4abc233090311ea6f'
};
check(
  'AUDIT-BOI-SNAPSHOT',
  'Bơi ếch reference is frozen by URL and three content hashes',
  Object.values(boiSnapshot).every((value) => audit.includes(value)),
  boiSnapshot
);
check(
  'AUDIT-BOI-TRANSFER',
  'Bơi ếch transfer keeps gated learning and offline flow without copying domain UI',
  audit.includes('learn, practise, analyse, review, then test')
    && audit.includes('Correct one important error at a time')
    && audit.includes('What is not copied'),
  'pedagogical state transfer'
);

const report = {
  schema: 'L6_B1_REFERENCE_AUDIT_V1',
  auditedDate: '2026-08-24',
  auditedBaseline: {
    workingBranch: 'migration/webapp-l1-audit-storage',
    remoteHeadBeforeL6: '5d56a0da86f9f92359f24e4851075fc67133f36c',
    l5ValidatedSource: 'de34c9606d8e35b138e9933c835d4ab55228fca6',
    l5Checkpoint: 'checkpoint/l5-webapp-offline-pass-a20-20260824',
    l5WorkflowRun: '32702609199',
    l5ArtifactId: '9511098621',
    l5ArtifactSha256: 'cbad86b04a73d92d1e2e9109787e6a73627c967191e13a0c42e3b18c23a41218',
    experimentalBranch: 'academic/universal-lesson-factory-v1',
    experimentalHead: '1680540ae06fcb2185d15eec5b0870a7cf5c7219'
  },
  boiSnapshot,
  metrics: {
    russian: {
      lessons: russianLessons.length,
      firstLessonSlides: russianLessons[0].slides.length,
      firstLessonRoles: russianRoles,
      requiredDataSources: russianRequiredSources.length,
      lazyManifestSources: russianLazySources.map((item) => item.id),
      largeSourceBytes: {
        dialogueBaumanAz: sourceBytes('subjects/russian/data/dialogue-bauman-az.json'),
        deepSpeakingBauman: sourceBytes('subjects/russian/data/deep-speaking-bauman.json'),
        vocabulary: sourceBytes('subjects/russian/data/vocab.json'),
        tests: sourceBytes('subjects/russian/data/tests.json'),
        speaking: sourceBytes('subjects/russian/data/speaking.json')
      }
    },
    mathematics: {
      lessons: mathLessons.length,
      firstLessonSlides: mathLessons[0].slides.length,
      firstLessonRoles: mathRoles,
      authoritativeTheoryRecords: mathTheoryRecords.length,
      specialRuntimeLayers: mathSpecialScripts
    },
    lightSubjects: lightMetrics
  },
  decisions: decisionIds.map((id) => id.slice(0, 3)),
  checks,
  failures,
  result: failures.length ? 'FAIL' : 'PASS'
};

fs.mkdirSync(path.dirname(path.join(ROOT, REPORT_PATH)), { recursive: true });
fs.writeFileSync(path.join(ROOT, REPORT_PATH), JSON.stringify(report, null, 2) + '\n');

console.log(
  'L6-B1 reference implementation audit: '
    + checks.length
    + ' checks, '
    + failures.length
    + ' failure(s).'
);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(2);
}
console.log('L6-B1 reference implementation audit PASS.');
