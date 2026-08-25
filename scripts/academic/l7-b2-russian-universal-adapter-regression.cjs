'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.cwd();
const ADAPTER_PATH = 'assets/js/platform/universal-lesson/russian-universal-adapter-v1.js';
const VALIDATOR_PATH = 'assets/js/platform/universal-lesson/lesson-schema-validator-v1.js';
const SCHEMA_PATH = 'assets/data/lesson/schema/universal-lesson-v2.schema.json';
const REPORT_PATH = 'docs/migration/L7_B2_RUSSIAN_UNIVERSAL_ADAPTER.generated.json';
const DOC_PATH = 'docs/migration/L7_B2_RUSSIAN_UNIVERSAL_ADAPTER.md';
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

for (const file of [ADAPTER_PATH, VALIDATOR_PATH, SCHEMA_PATH, DOC_PATH]) {
  check('FILE-' + file, 'required L7-B2 input exists', fs.existsSync(path.join(ROOT, file)), file);
}

if (checks.some((item) => !item.ok)) {
  console.error('L7-B2 cannot start because required inputs are missing.');
  process.exit(2);
}

const sandbox = { console, TextEncoder };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(read(VALIDATOR_PATH), sandbox, { filename: VALIDATOR_PATH });
vm.runInContext(read(ADAPTER_PATH), sandbox, { filename: ADAPTER_PATH });

const validator = sandbox.BaumanUniversalLessonValidator;
const adapter = sandbox.BaumanRussianUniversalAdapter;
const schema = json(SCHEMA_PATH);
const lessons = json('subjects/russian/data/lessons.json');
const sourceDigestBefore = digest(lessons);
const sources = {
  dialogues: json('subjects/russian/data/dialogue-bauman-az.json'),
  deepSpeaking: json('subjects/russian/data/deep-speaking-bauman.json'),
  speaking: json('subjects/russian/data/speaking.json'),
  handwriting: json('subjects/russian/data/handwriting.json'),
  writing: json('subjects/russian/data/writing.json'),
  tests: json('subjects/russian/data/tests.json').questions,
  simulations: json('subjects/russian/data/simulations.json')
};
const projected = adapter.projectLessons(lessons, sources);
const validations = projected.map((lesson) => validator.validateLesson(lesson, schema));

check('ADAPTER-IDENTITY', 'adapter has a stable release identity',
  adapter.adapterId === 'russian-universal-adapter-v1'
    && adapter.contractVersion === '2.0.0',
  { adapterId: adapter.adapterId, release: adapter.release });
check('LESSON-COVERAGE', 'all 26 Russian lessons project exactly once',
  projected.length === 26 && new Set(projected.map((lesson) => lesson.metadata.lessonId)).size === 26,
  projected.map((lesson) => lesson.metadata.lessonId));
check('SOURCE-IMMUTABLE', 'projection does not mutate Russian lesson source data',
  sourceDigestBefore === digest(lessons), sourceDigestBefore);
check('SCHEMA-VALID', 'every projected lesson passes the real Universal v2 validator',
  validations.every((result) => result.valid),
  validations.filter((result) => !result.valid).map((result) => ({ lessonId: result.lessonId, errors: result.errors })));
check('IDENTITY-CODES', 'official and personalized program codes remain separated',
  projected.every((lesson) => lesson.metadata.programIdentity.officialPublishedDirectionCode === '09.04.01'
    && lesson.metadata.programIdentity.personalizedDisplayCode === '09.04.01/11'),
  projected[0].metadata.programIdentity);
check('SLIDE-PRESERVATION', 'every source slide has one ordered Universal semantic block',
  projected.every((lesson, index) => lesson.blocks.length === lessons[index].slides.length
    && lesson.extensions.russian.sourceSlideCount === lessons[index].slides.length
    && lesson.blocks.every((block, blockIndex) => block.presentationHint.sourceIndex === blockIndex)),
  projected.map((lesson) => [lesson.metadata.lessonId, lesson.blocks.length]));
check('SOURCE-LOCATORS', 'lesson and slide bindings use stable source locators',
  projected.every((lesson, lessonIndex) =>
    lesson.metadata.sourceIdentity.locator.sourcePath === 'subjects/russian/data/lessons.json'
      && lesson.metadata.sourceIdentity.locator.sourceAnchors[0] === `/${lessonIndex}`
      && lesson.blocks.every((block, blockIndex) =>
        block.sourceBindings[0].locator.sourcePath === 'subjects/russian/data/lessons.json'
          && block.sourceBindings[0].locator.sourceAnchors[0] === `/${lessonIndex}/slides/${blockIndex}`)),
  projected[0].blocks[0].sourceBindings[0].locator);
check('SPECIALIST-OWNERSHIP', 'language-specific engines remain referenced instead of flattened',
  projected.every((lesson) => lesson.contextRefs.specialist
    && Array.isArray(lesson.contextRefs.specialist.dialogueRefs)
    && Array.isArray(lesson.contextRefs.specialist.deepSpeakingRefs)
    && Array.isArray(lesson.contextRefs.specialist.speakingRefs)
    && Array.isArray(lesson.contextRefs.specialist.handwritingRefs)
    && Array.isArray(lesson.contextRefs.specialist.writingRefs)
    && Array.isArray(lesson.contextRefs.specialist.assessmentRefs)),
  Object.keys(projected[0].contextRefs.specialist));
check('LANGUAGE-EVIDENCE', 'all lessons expose comprehension oral writing and retention evidence',
  projected.every((lesson) => {
    const kinds = new Set(lesson.masteryEvidence.map((item) => item.evidenceKind));
    return ['comprehension-response', 'oral-response', 'written-response', 'retention-check']
      .every((kind) => kinds.has(kind));
  }), projected[0].masteryEvidence.map((item) => item.evidenceKind));
check('OFFLINE-DETERMINISTIC', 'all projections retain subject-pack and legacy offline fallback',
  projected.every((lesson) => lesson.offline.resources[0].availability === 'subject-pack'
    && lesson.offline.deterministicFallbackRef === lesson.offline.resources[0].id
    && lesson.offline.legacyRuntimeEntry === 'subjects/russian/index.html'),
  projected[0].offline);
check('NO-AI-SOURCE-PROMOTION', 'adapter does not promote AI inference into source provenance',
  projected.every((lesson) => lesson.provenance.aiInferenceRefs.length === 0
    && lesson.provenance.sourceRefs.length === 1), projected[0].provenance);
check('DETERMINISTIC', 'repeated projection has a stable SHA-256 digest',
  digest(projected) === digest(adapter.projectLessons(lessons, sources)), digest(projected));
check('INVALID-INPUT-FAILS', 'malformed Russian lessons fail closed', (() => {
  try { adapter.projectLesson({ id: 'broken' }); return false; } catch (_) { return true; }
})(), 'TypeError expected');

const report = {
  gate: 'L7-B2',
  status: checks.every((item) => item.ok) ? 'PASS' : 'FAIL',
  adapterRelease: adapter.release,
  lessonCount: lessons.length,
  projectedBlockCount: projected.reduce((sum, lesson) => sum + lesson.blocks.length, 0),
  projectionDigest: digest(projected),
  checks
};
fs.writeFileSync(path.join(ROOT, REPORT_PATH), JSON.stringify(report, null, 2) + '\n');

for (const item of checks) console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.id} ${item.title}`);
console.log(`L7-B2 ${report.status}: ${checks.filter((item) => item.ok).length}/${checks.length} checks`);
if (report.status !== 'PASS') process.exit(1);
