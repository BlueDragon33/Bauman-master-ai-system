'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.cwd();
const REGISTRY_PATH = 'assets/data/lesson/russian-twin-registry-v1.json';
const GENERATOR_PATH = 'assets/js/platform/universal-lesson/russian-twin-generator-v1.js';
const HOOKS_PATH = 'assets/data/lesson/language-layer-hooks-v1.json';
const FACTORY_PATH = 'assets/data/lesson/subject-factory-registry-v1.json';
const PROGRAMMING_PATH = 'subjects/programming/data/lessons.json';
const GLOSSARY_PATH = 'assets/data/lesson/russian-twin-glossary-v1.generated.json';
const DOC_PATH = 'docs/migration/L7_B3_RUSSIAN_TWIN_REGISTRY.md';
const REPORT_PATH = 'docs/migration/L7_B3_RUSSIAN_TWIN_REGISTRY.generated.json';
const checks = [];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function json(file) {
  return JSON.parse(read(file));
}

function digest(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function check(id, title, ok, evidence) {
  checks.push({ id, title, ok: Boolean(ok), evidence: evidence === undefined ? null : evidence });
}

for (const file of [REGISTRY_PATH, GENERATOR_PATH, HOOKS_PATH, FACTORY_PATH, PROGRAMMING_PATH, DOC_PATH]) {
  check('FILE-' + file, 'required L7-B3 input exists', fs.existsSync(path.join(ROOT, file)), file);
}
if (checks.some((item) => !item.ok)) process.exit(2);

const sandbox = {};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(read(GENERATOR_PATH), sandbox, { filename: GENERATOR_PATH });
const generator = sandbox.BaumanRussianTwinGenerator;
const registry = json(REGISTRY_PATH);
const hooks = json(HOOKS_PATH);
const factory = json(FACTORY_PATH);
const lessons = json(PROGRAMMING_PATH);
const sourceDigest = digest(lessons);
const pack = generator.buildSubjectPack('programming', lessons, registry);

check('REGISTRY-IDENTITY', 'registry identity version and status are explicit',
  registry.registryId === 'bauman-russian-twin-registry'
    && registry.registryVersion === '1.0.0'
    && registry.status === 'L7-B3-REGISTRY',
  { registryId: registry.registryId, version: registry.registryVersion, status: registry.status });
check('PROGRAM-IDENTITY', 'official and personalized direction codes stay separated',
  registry.programIdentity.department === 'ИУ-5'
    && registry.programIdentity.officialPublishedDirectionCode === '09.04.01'
    && registry.programIdentity.personalizedDisplayCode === '09.04.01/11',
  registry.programIdentity);
check('SUBJECT-COVERAGE', 'registry covers exactly the eight Subject Factory subjects',
  JSON.stringify(Object.keys(registry.subjectProfiles).sort()) === JSON.stringify(Object.keys(factory.subjects).sort()),
  Object.keys(registry.subjectProfiles));
check('TYPE-COMPATIBILITY', 'subject lesson types exist in the L6-B7 type profiles',
  Object.values(registry.subjectProfiles).every((profile) =>
    profile.lessonTypes.every((type) => Boolean(hooks.typeProfiles[type]))),
  Object.fromEntries(Object.entries(registry.subjectProfiles).map(([id, profile]) => [id, profile.lessonTypes])));
check('TYPE-POLICY-PARITY', 'Programming type rules match the Subject Factory instead of code constants', (() => {
  const twinProfile = registry.subjectProfiles.programming;
  const factoryProfile = factory.subjects.programming.lessonTypePolicy;
  const twinRules = Object.fromEntries(twinProfile.lessonTypeRules.map((rule) => [rule.lessonType, rule.lessonIds]));
  const factoryRules = Object.fromEntries(factoryProfile.rules.map((rule) => [rule.type, rule.lessonIds]));
  return twinProfile.defaultLessonType === factoryProfile.default
    && JSON.stringify(twinRules) === JSON.stringify(factoryRules);
})(), registry.subjectProfiles.programming.lessonTypeRules);
check('LATENT-ACTIVATION', 'Twin remains hidden opt-in and AI cannot activate it',
  registry.activationPolicy.defaultState === 'declared'
    && registry.activationPolicy.defaultVisibility === 'hidden'
    && registry.activationPolicy.autoActivate === false
    && registry.activationPolicy.aiMayActivate === false,
  registry.activationPolicy);
check('READ-ONLY-POLICY', 'generation policy forbids source state runtime and generic translation writes',
  registry.generationPolicy.sourceMode === 'read-only'
    && registry.generationPolicy.sourceMutation === false
    && registry.generationPolicy.learnerStateMutation === false
    && registry.generationPolicy.runtimeActivation === false
    && registry.generationPolicy.genericTranslation === false,
  registry.generationPolicy);
check('SOURCE-COVERAGE', 'all 48 Programming lessons have explicit source-aligned terminology',
  lessons.length === 48 && pack.records.length === 48 && pack.twinUnits.length === 48 && pack.unavailable.length === 0,
  { lessons: lessons.length, records: pack.records.length, units: pack.twinUnits.length });
check('SOURCE-IMMUTABLE', 'generator leaves Programming source byte-equivalent as JSON',
  digest(lessons) === sourceDigest, sourceDigest);
check('TERM-COPY-EXACT', 'vi ru and en surfaces copy source terminology exactly',
  pack.records.every((record, index) => ['vi', 'ru', 'en'].every((language) =>
    record.terms.find((term) => term.language === language).surface === lessons[index].terminology[language])),
  pack.records.slice(0, 3).map((record) => record.terms));
check('CONTEXT-BOUND', 'every glossary record binds subject lesson stage and resolved type',
  pack.records.every((record, index) => {
    const context = record.usageContexts[0];
    return context.subjectId === 'programming'
      && context.lessonId === lessons[index].id
      && context.stageId === lessons[index].stage
      && registry.subjectProfiles.programming.lessonTypes.includes(context.lessonType);
  }), pack.records.slice(0, 5).map((record) => record.usageContexts[0]));
check('STABLE-IDENTITY', 'term and twin identities use stable subject and lesson IDs',
  pack.records.every((record, index) => record.termId === `programming:${lessons[index].id}:terminology`)
    && pack.twinUnits.every((unit, index) =>
      unit.twinUnitId === `programming:${lessons[index].id}:technical-terminology`),
  pack.records.slice(0, 3).map((record) => record.termId));
check('SOURCE-PROVENANCE', 'shared glossary contains source refs and no AI inference',
  pack.records.every((record) => record.reviewStatus === 'source-aligned'
    && record.sourceRefs.length === 1
    && record.provenance.origin === 'provided-source'
    && record.provenance.aiInferenceRefs.length === 0),
  pack.records[0].provenance);
check('TWIN-CONTRACT', 'every unit contains all L6-B7 required Twin fields',
  pack.twinUnits.every((unit) => hooks.russianTwin.requiredTwinUnitFields.every((field) =>
    Object.prototype.hasOwnProperty.call(unit, field))),
  hooks.russianTwin.requiredTwinUnitFields);
check('SPECIALIST-OWNERSHIP', 'Twin references but does not replace the Russian specialist engine',
  pack.twinUnits.every((unit) => unit.specialistPracticeRef === 'subjects/russian/index.html'),
  pack.twinUnits[0].specialistPracticeRef);
check('OFFLINE-DETERMINISTIC', 'resolved pack works offline without generative AI',
  pack.offline.availability === 'subject-pack'
    && pack.offline.generativeAiRequired === false
    && pack.offline.fallback === 'source-lesson-without-twin',
  pack.offline);
check('MISSING-FAILS-CLOSED', 'missing alignment remains unavailable without blocking the source lesson', (() => {
  const result = generator.buildTwinUnit('ai', json('subjects/ai/data/lessons.json')[0], registry);
  return result.ok === false && result.code === 'ALIGNMENT_MISSING' && result.sourceLessonContinues === true;
})(), 'AI lesson without reviewed terminology');
check('UNKNOWN-SUBJECT-FAILS', 'unknown subjects fail closed', (() => {
  const result = generator.buildTwinUnit('unknown', lessons[0], registry);
  return result.ok === false && result.reason === 'SUBJECT_NOT_REGISTERED';
})(), 'unknown');
check('UNAVAILABLE-SOURCE-INDEX', 'unavailable records preserve their original source index', (() => {
  const sample = [lessons[0], { id: 'BROKEN', stage: 'vn', title: 'Missing terminology' }, lessons[1]];
  const samplePack = generator.buildSubjectPack('programming', sample, registry);
  return samplePack.records.length === 2
    && samplePack.unavailable.length === 1
    && samplePack.unavailable[0].sourceIndex === 1;
})(), 1);
check('DETERMINISTIC', 'repeated pack generation has a stable SHA-256 digest',
  digest(pack) === digest(generator.buildSubjectPack('programming', lessons, registry)), digest(pack));
check('NO-HUTECH-LEARNER-COPY', 'B3 learner-facing artifacts contain no HUTECH label',
  !/HUTECH/i.test(JSON.stringify(registry) + JSON.stringify(pack) + read(DOC_PATH)), 'absent');

fs.writeFileSync(path.join(ROOT, GLOSSARY_PATH), JSON.stringify(pack, null, 2) + '\n');
const report = {
  gate: 'L7-B3',
  status: checks.every((item) => item.ok) ? 'PASS' : 'FAIL',
  generatorRelease: generator.release,
  subjectCount: Object.keys(registry.subjectProfiles).length,
  programmingLessonCount: lessons.length,
  glossaryRecordCount: pack.records.length,
  twinUnitCount: pack.twinUnits.length,
  packDigest: digest(pack),
  checks
};
fs.writeFileSync(path.join(ROOT, REPORT_PATH), JSON.stringify(report, null, 2) + '\n');
for (const item of checks) console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.id} ${item.title}`);
console.log(`L7-B3 ${report.status}: ${checks.filter((item) => item.ok).length}/${checks.length} checks`);
if (report.status !== 'PASS') process.exit(1);
