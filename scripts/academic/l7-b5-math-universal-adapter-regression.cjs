'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.cwd();
const ADAPTER_PATH = 'assets/js/platform/universal-lesson/math-universal-adapter-v1.js';
const VALIDATOR_PATH = 'assets/js/platform/universal-lesson/lesson-schema-validator-v1.js';
const SCHEMA_PATH = 'assets/data/lesson/schema/universal-lesson-v2.schema.json';
const BLOCK_POLICY_PATH = 'assets/data/lesson/universal-lesson-block-policy-v1.json';
const TYPE_REGISTRY_PATH = 'assets/data/lesson/lesson-type-registry-v1.json';
const MASTER_READY_PATH = 'assets/data/lesson/master-ready-policy-v1.json';
const FACTORY_PATH = 'assets/data/lesson/subject-factory-registry-v1.json';
const GRAPH_PATH = 'assets/data/lesson/math-prerequisite-graph-v1.generated.json';
const LESSONS_PATH = 'subjects/math/data/lessons.json';
const OVERLAY_PATH = 'subjects/math/data/theory_lecture_content.json';
const DOC_PATH = 'docs/migration/L7_B5_MATH_UNIVERSAL_ADAPTER.md';
const REPORT_PATH = 'docs/migration/L7_B5_MATH_UNIVERSAL_ADAPTER.generated.json';
const RUNTIME_PATHS = [
  'subjects/math/index.html',
  'subjects/math/assets/subject-adapter.js',
  'subjects/math/assets/theory_skin/theory-tab-E129.js'
];
const BANK_PATHS = {
  formulas: 'subjects/math/data/formulas.json',
  exercises: 'subjects/math/data/exercises.json',
  simulations: 'subjects/math/data/simulations.json',
  applications: 'subjects/math/data/applications.json',
  professorQa: 'subjects/math/data/professor_qa.json',
  tests: 'subjects/math/data/tests.json',
  questionBank: 'subjects/math/data/question_bank.json'
};

const checks = [];
const mutationTests = [];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function json(file) {
  return JSON.parse(read(file));
}

function digest(value) {
  const input = typeof value === 'string' ? value : JSON.stringify(value);
  return crypto.createHash('sha256').update(input).digest('hex');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function check(id, title, ok, evidence) {
  checks.push({ id, title, ok: Boolean(ok), evidence: evidence === undefined ? null : evidence });
}

function mutation(id, title, rejected, evidence) {
  mutationTests.push({ id, title, expectedFailureObserved: Boolean(rejected), evidence: evidence || null });
}

function countRecords(value) {
  if (Array.isArray(value)) return value.length;
  if (!value || typeof value !== 'object') return null;
  for (const key of ['records', 'items', 'questions', 'lessons']) {
    if (Array.isArray(value[key])) return value[key].length;
  }
  return null;
}

function nestedTypeCounts(slides) {
  const counts = {};
  array(slides).forEach((slide) => array(slide && slide.blocks).forEach((block) => {
    const type = String(block && block.type || 'unspecified');
    counts[type] = (counts[type] || 0) + 1;
  }));
  return counts;
}

function sourceSlides(lessons, overlays) {
  return lessons.flatMap((lesson) => lesson.slides).concat(overlays.flatMap((record) => record.slides));
}

function projectedSlides(catalog) {
  return catalog.legacy.flatMap((lesson) => lesson.blocks).concat(catalog.overlays.flatMap((lesson) => lesson.blocks));
}

function requiredBlockKinds(policy) {
  const resolved = { ...policy.base };
  Object.entries(policy.policiesByLessonType.mathematics.overrides).forEach(([kind, value]) => {
    resolved[kind] = { ...(resolved[kind] || {}), ...value };
  });
  return Object.entries(resolved)
    .filter(([, value]) => value.requirement === 'required')
    .map(([kind]) => kind)
    .sort();
}

function projectionBoundaryValid(lesson) {
  const math = lesson && lesson.extensions && lesson.extensions.mathematics;
  if (!math || math.sourceSlideCount !== array(lesson.blocks).length) return false;
  if (!math.sourceSelection || math.sourceSelection.globalOverlayPromotion !== false) return false;
  if (!math.masterReady || math.masterReady.claimed !== false) return false;
  if (array(lesson.masteryEvidence).some((item) => item.status !== 'missing')) return false;
  if (!math.prerequisiteCandidates || math.prerequisiteCandidates.runtimeActive !== false) return false;
  if (array(math.prerequisiteCandidates.records).some((item) => item.runtimeActive !== false || item.assessmentBlocking !== false)) return false;
  if (Object.values(math.externalBanks || {}).some((bank) => bank.completionClaimed !== false)) return false;
  if (array(lesson.provenance && lesson.provenance.aiInferenceRefs).length !== 0) return false;
  return true;
}

const requiredFiles = [
  ADAPTER_PATH,
  VALIDATOR_PATH,
  SCHEMA_PATH,
  BLOCK_POLICY_PATH,
  TYPE_REGISTRY_PATH,
  MASTER_READY_PATH,
  FACTORY_PATH,
  GRAPH_PATH,
  LESSONS_PATH,
  OVERLAY_PATH,
  DOC_PATH,
  ...RUNTIME_PATHS,
  ...Object.values(BANK_PATHS)
];
for (const file of requiredFiles) {
  check('FILE-' + file, 'required L7-B5 input exists', fs.existsSync(path.join(ROOT, file)), file);
}
if (checks.some((item) => !item.ok)) {
  console.error('L7-B5 cannot start because required inputs are missing.');
  process.exit(2);
}

const schema = json(SCHEMA_PATH);
const blockPolicy = json(BLOCK_POLICY_PATH);
const typeRegistry = json(TYPE_REGISTRY_PATH);
const masterReadyPolicy = json(MASTER_READY_PATH);
const factory = json(FACTORY_PATH);
const graph = json(GRAPH_PATH);
const lessons = json(LESSONS_PATH);
const overlayPayload = json(OVERLAY_PATH);
const overlays = overlayPayload.records;
const banks = Object.fromEntries(Object.entries(BANK_PATHS).map(([key, file]) => [key, json(file)]));
const sourceDigestsBefore = {
  lessons: digest(lessons),
  overlays: digest(overlayPayload),
  graph: digest(graph),
  banks: digest(banks),
  runtime: Object.fromEntries(RUNTIME_PATHS.map((file) => [file, digest(read(file))]))
};

const sandbox = { console, TextEncoder };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(read(VALIDATOR_PATH), sandbox, { filename: VALIDATOR_PATH });
vm.runInContext(read(ADAPTER_PATH), sandbox, { filename: ADAPTER_PATH });
const validator = sandbox.BaumanUniversalLessonValidator;
const adapter = sandbox.BaumanMathUniversalAdapter;

const sources = {
  legacyLessons: lessons,
  theoryOverlay: overlayPayload,
  prerequisiteGraph: graph,
  banks
};
const catalog = adapter.projectCatalog(sources);
const allProjected = catalog.legacy.concat(catalog.overlays);
const validations = allProjected.map((lesson) => validator.validateLesson(lesson, schema));
const requiredKinds = requiredBlockKinds(blockPolicy);
const allSourceSlides = sourceSlides(lessons, overlays);
const allProjectedBlocks = projectedSlides(catalog);
const sourceNestedTypes = nestedTypeCounts(allSourceSlides);
const projectedNestedTypes = nestedTypeCounts(allProjectedBlocks.map((block) => ({ blocks: block.payload.sourceBlocks })));

check('ADAPTER-IDENTITY', 'adapter has a stable Math Universal identity',
  adapter.adapterId === 'math-universal-adapter-v1'
    && adapter.contractVersion === '2.0.0'
    && adapter.release === 'L7-B5-MATH-UNIVERSAL-ADAPTER-V1',
  { adapterId: adapter.adapterId, release: adapter.release });
check('REFERENCE-POLICY', 'Math registry, Factory and Master-ready policy remain the governing references',
  typeRegistry.types.mathematics.id === 'mathematics'
    && factory.subjects.math.engineRef === 'math-e126-specialist'
    && factory.subjects.math.compatibility.directFactoryRender === false
    && masterReadyPolicy.profiles.mathematics.typeId === 'mathematics',
  {
    engine: factory.subjects.math.engineRef,
    directFactoryRender: factory.subjects.math.compatibility.directFactoryRender,
    threshold: masterReadyPolicy.profiles.mathematics.totalThreshold
  });
check('LEGACY-COVERAGE', 'all 347 stable legacy lessons project exactly once',
  catalog.legacy.length === 347
    && new Set(catalog.legacy.map((lesson) => lesson.metadata.lessonId)).size === 347,
  catalog.legacy.length);
check('OVERLAY-COVERAGE', 'all 18 reviewed theory overlays project separately',
  catalog.overlays.length === 18
    && new Set(catalog.overlays.map((lesson) => lesson.metadata.lessonId)).size === 18,
  catalog.overlays.length);
check('CROSS-FAMILY-IDENTITY', 'current legacy and overlay ids remain distinct without inferred equivalence',
  new Set(allProjected.map((lesson) => lesson.metadata.lessonId)).size === 365,
  { projected: allProjected.length, unique: new Set(allProjected.map((lesson) => lesson.metadata.lessonId)).size });
check('SCHEMA-VALID', 'all 365 projections pass the real Universal v2 validator',
  validations.every((result) => result.valid),
  validations.filter((result) => !result.valid).slice(0, 10).map((result) => ({ lessonId: result.lessonId, errors: result.errors })));
check('LEGACY-SLIDE-PRESERVATION', 'all 5,552 legacy source slides project one-to-one in source order',
  catalog.legacy.reduce((sum, lesson) => sum + lesson.blocks.length, 0) === 5552
    && catalog.legacy.every((lesson, lessonIndex) => lesson.blocks.length === lessons[lessonIndex].slides.length
      && lesson.blocks.every((block, slideIndex) => block.presentationHint.sourceIndex === slideIndex
        && block.sourceBindings[0].locator.sourceAnchors[0] === `/${lessonIndex}/slides/${slideIndex}`)),
  catalog.legacy.reduce((sum, lesson) => sum + lesson.blocks.length, 0));
check('OVERLAY-SLIDE-PRESERVATION', 'all 300 overlay slides project one-to-one, including both 22-slide accepted decks',
  catalog.overlays.reduce((sum, lesson) => sum + lesson.blocks.length, 0) === 300
    && catalog.overlays.every((lesson, lessonIndex) => lesson.blocks.length === overlays[lessonIndex].slides.length
      && lesson.blocks.every((block, slideIndex) => block.presentationHint.sourceIndex === slideIndex
        && block.sourceBindings[0].locator.sourceAnchors[0] === `/records/${lessonIndex}/slides/${slideIndex}`)),
  {
    blocks: catalog.overlays.reduce((sum, lesson) => sum + lesson.blocks.length, 0),
    richDecks: catalog.overlays.filter((lesson) => lesson.blocks.length === 22).map((lesson) => lesson.metadata.lessonId)
  });
check('LOSSLESS-PAYLOAD', 'titles, roles, layouts and nested source blocks are preserved without flattening',
  catalog.legacy.every((lesson, lessonIndex) => lesson.blocks.every((block, slideIndex) => {
    const slide = lessons[lessonIndex].slides[slideIndex];
    return block.payload.title === slide.title
      && block.payload.sourceRole === slide.role
      && block.payload.sourceLayout === slide.layout
      && digest(block.payload.sourceBlocks) === digest(slide.blocks);
  })) && catalog.overlays.every((lesson, lessonIndex) => lesson.blocks.every((block, slideIndex) => {
    const slide = overlays[lessonIndex].slides[slideIndex];
    return block.payload.title === slide.title
      && block.payload.sourceRole === slide.role
      && block.payload.sourceLayout === null
      && digest(block.payload.sourceBlocks) === digest(slide.blocks);
  })),
  { sourceBlockDigest: digest(allSourceSlides.map((slide) => slide.blocks)) });
check('NESTED-TYPE-PRESERVATION', 'formula, code, QA, lists and text block families remain exact',
  digest(sourceNestedTypes) === digest(projectedNestedTypes),
  { source: sourceNestedTypes, projected: projectedNestedTypes });
check('BLOCK-POLICY', 'every Math projection fulfills all resolved required Universal block kinds',
  allProjected.every((lesson) => {
    const kinds = new Set(lesson.blocks.map((block) => block.kind));
    return requiredKinds.every((kind) => kinds.has(kind));
  }), requiredKinds);
check('FORMULA-SPECIALIST', 'notation and formula roles keep specialist formula ownership',
  allProjected.every((lesson) => lesson.blocks.filter((block) => ['notation', 'core_formula'].includes(block.payload.sourceRole))
    .every((block) => block.specialistCapabilityRef === 'math-formula-typesetter')),
  allProjectedBlocks.filter((block) => ['notation', 'core_formula'].includes(block.payload.sourceRole)).length);
check('STEP-SOLUTION-SPECIALIST', 'worked and practice roles keep specialist step-solution ownership',
  allProjected.every((lesson) => lesson.blocks.filter((block) => ['mini_case', 'practice', 'derivation', 'numerical_rank'].includes(block.payload.sourceRole))
    .every((block) => block.specialistCapabilityRef === 'math-step-solution')),
  allProjectedBlocks.filter((block) => ['mini_case', 'practice', 'derivation', 'numerical_rank'].includes(block.payload.sourceRole)).length);
check('SIMULATION-SPECIALIST', 'simulation roles keep parameter-simulation ownership and evidence',
  allProjected.every((lesson) => lesson.blocks.filter((block) => ['simulation', 'sensitivity_analysis'].includes(block.payload.sourceRole))
    .every((block) => block.kind === 'lab-simulation'
      && block.specialistCapabilityRef === 'math-parameter-simulation'
      && block.evidenceRefs.includes('simulation-result'))),
  allProjectedBlocks.filter((block) => ['simulation', 'sensitivity_analysis'].includes(block.payload.sourceRole)).length);
check('ORAL-SPECIALIST', 'professor Q&A remains an external specialist oral capability',
  allProjected.every((lesson) => lesson.blocks.filter((block) => block.payload.sourceRole === 'professor_qa')
    .every((block) => block.kind === 'oral' && block.specialistCapabilityRef === 'math-professor-oral')),
  allProjectedBlocks.filter((block) => block.payload.sourceRole === 'professor_qa').length);
check('EXACT-OVERLAY-RESOLUTION', 'an exact overlay id resolves to the reviewed overlay only', (() => {
  const resolved = adapter.resolveSource(overlays[0].lessonId, sources);
  return resolved.status === 'FOUND'
    && resolved.sourceFamily === 'reviewed-theory-overlay'
    && resolved.record === overlays[0]
    && resolved.exactId === true;
})(), overlays[0].lessonId);
check('LEGACY-FALLBACK', 'an exact legacy id without an overlay preserves legacy fallback', (() => {
  const resolved = adapter.resolveSource(lessons[0].id, sources);
  return resolved.status === 'FOUND'
    && resolved.sourceFamily === 'legacy-lessons'
    && resolved.record === lessons[0]
    && resolved.exactId === true;
})(), lessons[0].id);
check('NO-FUZZY-PROMOTION', 'unknown or look-alike ids fail closed without fuzzy matching', (() => {
  const resolved = adapter.resolveSource(overlays[0].lessonId.replace(/e130$/, 'e131'), sources);
  return resolved.status === 'UNAVAILABLE'
    && resolved.reason === 'NO_EXACT_SOURCE_MATCH'
    && resolved.fuzzyMatchingAttempted === false;
})(), 'NO_EXACT_SOURCE_MATCH');
check('PREREQUISITE-BOUNDARY', '341 system-derived prerequisite candidates remain outside active prerequisites',
  catalog.legacy.reduce((sum, lesson) => sum + lesson.extensions.mathematics.prerequisiteCandidates.records.length, 0) === 341
    && allProjected.every((lesson) => lesson.prerequisites.length === 0
      && lesson.extensions.mathematics.prerequisiteCandidates.runtimeActive === false
      && lesson.extensions.mathematics.prerequisiteCandidates.assessmentBlocking === false),
  341);
check('DOWNSTREAM-NON-MASTERY', 'all 1,279 downstream support refs remain non-mastery and read-only',
  catalog.legacy.reduce((sum, lesson) => sum + lesson.extensions.mathematics.downstreamSupport.records.length, 0) === 1279
    && catalog.legacy.every((lesson) => lesson.extensions.mathematics.downstreamSupport.records.every((item) =>
      item.masteryEffect === 'none-until-reviewed-objective-binding'
        && item.learnerStateMutation === false
        && item.aiMayPromote === false)),
  1279);
check('EXTERNAL-BANK-TRUTH', 'all empty standalone banks remain unavailable and never claim completion',
  Object.values(banks).every((bank) => countRecords(bank) === 0)
    && allProjected.every((lesson) => Object.values(lesson.extensions.mathematics.externalBanks).every((bank) =>
      bank.recordCount === 0 && bank.availability === 'unavailable' && bank.completionClaimed === false)),
  Object.fromEntries(Object.entries(banks).map(([key, value]) => [key, countRecords(value)])));
check('MASTER-READY-BOUNDARY', 'adapter creates no verified or Master-ready learner claim',
  allProjected.every((lesson) => projectionBoundaryValid(lesson)),
  { projected: allProjected.length, verified: 0, claimed: 0 });
check('OFFLINE-ROLLBACK', 'all projections retain explicit Math pack fallback and unchanged runtime entry',
  allProjected.every((lesson) => lesson.offline.policyId === 'math-rich-explicit'
    && lesson.offline.resources[0].availability === 'subject-pack'
    && lesson.offline.deterministicFallbackRef === lesson.offline.resources[0].id
    && lesson.offline.legacyRuntimeEntry === 'subjects/math/index.html'),
  allProjected[0].offline);
check('PROGRAM-IDENTITY', 'official and personalized direction codes remain separated',
  allProjected.every((lesson) => lesson.metadata.programIdentity.officialPublishedDirectionCode === '09.04.01'
    && lesson.metadata.programIdentity.personalizedDisplayCode === '09.04.01/11'
    && lesson.metadata.programIdentity.department === 'ИУ-5'),
  allProjected[0].metadata.programIdentity);
check('NO-AI-PROVENANCE', 'adapter does not promote AI inference into Math source provenance',
  allProjected.every((lesson) => lesson.provenance.aiInferenceRefs.length === 0), 0);
check('NO-PERSONAL-CURRICULUM-COPY', 'adapter output contains no HUTECH learner label',
  !/HUTECH/i.test(JSON.stringify(catalog)), 'absent');
check('SOURCE-IMMUTABLE', 'projection leaves Math source, graph and banks unchanged',
  sourceDigestsBefore.lessons === digest(lessons)
    && sourceDigestsBefore.overlays === digest(overlayPayload)
    && sourceDigestsBefore.graph === digest(graph)
    && sourceDigestsBefore.banks === digest(banks),
  sourceDigestsBefore);
check('RUNTIME-IMMUTABLE', 'B5 leaves Math runtime and specialist reader files unchanged',
  RUNTIME_PATHS.every((file) => sourceDigestsBefore.runtime[file] === digest(read(file))), sourceDigestsBefore.runtime);
check('DETERMINISTIC', 'repeated full-catalog projection has a stable SHA-256 digest',
  digest(catalog) === digest(adapter.projectCatalog(sources)), digest(catalog));
check('INVALID-SOURCE-FAILS', 'malformed Math records fail closed', (() => {
  try {
    adapter.projectLegacyLesson({ id: 'broken' });
    return false;
  } catch (_) {
    return true;
  }
})(), 'TypeError expected');
check('DUPLICATE-SOURCE-FAILS', 'duplicate ids inside a source family fail closed', (() => {
  try {
    adapter.projectCatalog({ ...sources, legacyLessons: [lessons[0], clone(lessons[0])] });
    return false;
  } catch (_) {
    return true;
  }
})(), 'TypeError expected');

{
  const lesson = clone(catalog.legacy[0]);
  lesson.blocks.pop();
  mutation('DROP-SOURCE-SLIDE', 'dropping a source slide violates one-to-one preservation',
    !projectionBoundaryValid(lesson), { sourceSlides: 16, projectedBlocks: lesson.blocks.length });
}
{
  const lesson = clone(catalog.legacy[1]);
  lesson.extensions.mathematics.prerequisiteCandidates.runtimeActive = true;
  mutation('ACTIVATE-INFERRED-PREREQUISITE', 'system-derived prerequisite activation is rejected',
    !projectionBoundaryValid(lesson), true);
}
{
  const lesson = clone(catalog.legacy[0]);
  lesson.extensions.mathematics.masterReady.claimed = true;
  lesson.masteryEvidence[0].status = 'verified';
  mutation('PROMOTE-MASTER-READY', 'adapter-level Master-ready promotion is rejected',
    !projectionBoundaryValid(lesson), true);
}
{
  const lesson = clone(catalog.legacy[0]);
  lesson.extensions.mathematics.externalBanks.tests.completionClaimed = true;
  mutation('CLAIM-EMPTY-BANK', 'completion claim for an empty assessment bank is rejected',
    !projectionBoundaryValid(lesson), lesson.extensions.mathematics.externalBanks.tests);
}
{
  const lesson = clone(catalog.legacy[0]);
  lesson.extensions.mathematics.sourceSelection.globalOverlayPromotion = true;
  mutation('PROMOTE-PARTIAL-OVERLAY', 'global promotion of 18 partial overlays is rejected',
    !projectionBoundaryValid(lesson), true);
}
{
  const lesson = clone(catalog.legacy[0]);
  const formulaBlock = lesson.blocks.find((block) => block.payload.sourceRole === 'core_formula');
  const sourceFormula = lessons[0].slides.find((slide) => slide.role === 'core_formula');
  formulaBlock.payload.sourceBlocks[0].body = 'mutated formula';
  mutation('MUTATE-FORMULA-PAYLOAD', 'formula payload mutation is detected against the source digest',
    digest(formulaBlock.payload.sourceBlocks) !== digest(sourceFormula.blocks), {
      source: digest(sourceFormula.blocks),
      mutated: digest(formulaBlock.payload.sourceBlocks)
    });
}

const report = {
  gate: 'L7-B5',
  status: checks.every((item) => item.ok) && mutationTests.every((item) => item.expectedFailureObserved) ? 'PASS' : 'FAIL',
  passMeaning: 'read-only Math Universal projection is complete; no runtime cutover, source rewrite, external-bank completion or Master-ready claim',
  adapterRelease: adapter.release,
  legacyLessonCount: catalog.legacy.length,
  overlayLessonCount: catalog.overlays.length,
  projectedLessonCount: allProjected.length,
  legacyBlockCount: catalog.legacy.reduce((sum, lesson) => sum + lesson.blocks.length, 0),
  overlayBlockCount: catalog.overlays.reduce((sum, lesson) => sum + lesson.blocks.length, 0),
  prerequisiteCandidateCount: catalog.legacy.reduce((sum, lesson) => sum + lesson.extensions.mathematics.prerequisiteCandidates.records.length, 0),
  downstreamSupportCount: catalog.legacy.reduce((sum, lesson) => sum + lesson.extensions.mathematics.downstreamSupport.records.length, 0),
  externalBankCounts: Object.fromEntries(Object.entries(banks).map(([key, value]) => [key, countRecords(value)])),
  projectionDigest: digest(catalog),
  sourceDigests: sourceDigestsBefore,
  checks,
  mutationTests
};
fs.writeFileSync(path.join(ROOT, REPORT_PATH), JSON.stringify(report, null, 2) + '\n');

for (const item of checks) console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.id} ${item.title}`);
for (const item of mutationTests) console.log(`${item.expectedFailureObserved ? 'PASS' : 'FAIL'} MUTATION-${item.id} ${item.title}`);
console.log(`L7-B5 ${report.status}: ${checks.filter((item) => item.ok).length}/${checks.length} checks; ${mutationTests.filter((item) => item.expectedFailureObserved).length}/${mutationTests.length} expected mutation failures observed`);
if (report.status !== 'PASS') process.exit(1);
