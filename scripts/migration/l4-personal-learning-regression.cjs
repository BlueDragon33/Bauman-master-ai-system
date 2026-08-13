'use strict';

const fs = require('fs');
const vm = require('vm');

function read(file) { return fs.readFileSync(file, 'utf8'); }
function assert(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
function makeLocalStorage(seed) {
  const map = new Map(Object.entries(seed || {}));
  return {
    getItem(key) { return map.has(key) ? map.get(key) : null; },
    setItem(key, value) { map.set(key, String(value)); },
    removeItem(key) { map.delete(key); },
    snapshot() { return Object.fromEntries(map.entries()); }
  };
}

const INLINE_PAYLOAD = 'data:text/html;base64,TEVHQUNZX1BBWUxPQURfTVVTVF9OT1RfQ09QWQ==';
const legacyState = {
  page: 'schedule',
  homePanel: 'timeline',
  roadmapStage: 'prepare',
  subject: 'math',
  subjectStage: 'prepare',
  researchTopic: 'ugv',
  theme: 'night',
  font: 'serif',
  fontSize: 'large',
  lastStudy: { subjectId: 'math', path: 'subjects/math/index.html' },
  progress: {
    math: { percent: 44, completedLessons: 11 },
    russian: { percent: 31, completedLessons: 8 }
  },
  subjectReports: {
    math: [
      { courseId: 'p2', score: 8.5, percent: 85, answered: 20, total: 20, targetScore: 80, receivedAt: '2026-08-12T09:00:00Z' },
      { courseId: 'p2', score: 9, percent: 90, answered: 40, total: 40, targetScore: 80, receivedAt: '2026-08-13T09:00:00Z' }
    ],
    russian: [
      { courseId: 'p1', percent: 70, answered: 20, total: 20, targetScore: 80, receivedAt: '2026-08-13T07:00:00Z' }
    ]
  },
  reviewQueue: [
    { id: 'rv-1', subjectId: 'russian', due: '2026-08-14' },
    { id: 'rv-2', subjectId: 'math', due: '2026-08-15' }
  ],
  schedule: {
    view: 'main',
    weekStart: '2026-08-10',
    edit: false,
    timezone: 'utc7',
    autoStage: 'prepare',
    autoFrom: '2026-06-08',
    autoTo: '2026-10-31',
    targetQuestions: 100,
    targetScore: 80,
    entries: {
      '2026-08-13|morning1': { subjectId: 'russian', itemId: 'p1', status: 'completed', durationMinutes: 90 },
      '2026-08-13|afternoon': { subjectId: 'math', itemId: 'p2', status: 'planned', durationMinutes: 120 }
    }
  },
  activity: [
    { type: 'open-subject', subjectId: 'russian', at: '2026-08-13T06:00:00Z' },
    { type: 'test-complete', subjectId: 'math', at: '2026-08-13T09:00:00Z' }
  ],
  activeTask: { taskId: 'task-1', subjectId: 'math', targetQuestions: 100 },
  planningWarnings: { 'math::p2': { message: 'Cần ôn thêm', createdAt: '2026-08-13T09:05:00Z' } },
  planningMissions: { 'mission-1': { id: 'mission-1', subjectId: 'math', deadline: '2026-08-20' } },
  planningPlans: { 'math::p2': { sessions: [{ id: 's1', date: '2026-08-14' }] } },
  planningActions: { 'action-1': { type: 'add_extra_study_time', at: '2026-08-13T09:06:00Z' } },
  researchChecks: { 'ugv-paper': true, 'ugv-data': false },
  researchFiles: {
    'ugv-paper': [
      { name: 'paper.html', mime: 'text/html', typeLabel: 'HTML', content: INLINE_PAYLOAD, addedAt: '2026-08-13T08:00:00Z' }
    ]
  },
  subjects: {
    math: { name: 'Toán Bauman', desc: 'static content', mainPath: 'subjects/math/index.html', editorPath: 'subjects/math/editor.html', priority: 'q1' },
    russian: { name: 'Tiếng Nga', desc: 'static content', mainPath: 'subjects/russian/index.html', editorPath: 'subjects/russian/editor.html', priority: 'q1' }
  },
  futureFieldFromNewRuntime: { preserveInLegacy: true }
};

const currentUser = {
  email: 'Student@Example.Test',
  name: 'Người học thử',
  role: 'user',
  password: 'MUST_NOT_COPY'
};

const mainKey = 'bauman_main_all_phases_subjects_v1';
const currentUserKey = 'bauman_current_user_fullcode_v1';
const usersKey = 'bauman_main_users_fullcode_v1';
const seed = {
  [mainKey]: JSON.stringify(legacyState),
  [currentUserKey]: JSON.stringify(currentUser),
  [usersKey]: JSON.stringify([{ ...currentUser }])
};
const localStorage = makeLocalStorage(seed);
const window = { localStorage, console, addEventListener() {}, removeEventListener() {} };
const context = vm.createContext({ window, console, Date, Map, Set, Object, Array, JSON, String, Number, Math, TypeError });

for (const file of [
  'assets/js/platform/runtime-config.js',
  'assets/js/platform/storage-adapter.js',
  'assets/js/platform/main-state-repository.js',
  'assets/js/platform/personal-learning-schema.js',
  'assets/js/platform/personal-learning-migrator.js',
  'assets/js/platform/personal-learning-repository.js'
]) {
  new vm.Script(read(file), { filename: file }).runInContext(context);
  console.log('PASS:', file, 'parses and executes');
}

const schema = window.BaumanPersonalLearningSchema;
const migrator = window.BaumanPersonalLearningMigrator;
const repo = window.BaumanPersonalLearningRepository;

assert(schema.schemaVersion === 1, 'Personal Learning schema version is explicit');
assert(repo.featureEnabled === false, 'Personal Learning shadow remains disabled by default');

const first = migrator.fromLegacyMainState(legacyState, currentUser);
const second = migrator.fromLegacyMainState(legacyState, currentUser);
assert(JSON.stringify(first) === JSON.stringify(second), 'legacy migration is deterministic');
assert(schema.isPersonalLearningState(first), 'migrated state matches Personal Learning schema');

assert(first.identity.email === 'student@example.test', 'identity email is normalized');
assert(!Object.prototype.hasOwnProperty.call(first.identity, 'password'), 'password is never copied into identity');
assert(!JSON.stringify(first).includes('MUST_NOT_COPY'), 'credential value is absent from Personal Learning state');

assert(Object.keys(first.progress.subjects).length === 2, 'progress subjects are preserved');
assert(first.assessments.results.length === 3, 'subject reports become append-only assessment records');
assert(new Set(first.assessments.results.map((x) => x.id)).size === 3, 'assessment result IDs are stable and unique');
assert(first.reviews.queue.length === 2, 'review queue is preserved as revision records');
assert(first.schedule.entries.length === 2, 'schedule entries are split into record-level entries');
assert(first.schedule.entries.some((x) => x.id === '2026-08-13|afternoon'), 'schedule legacy slot key is preserved as record ID');
assert(first.studyActivity.events.length === 2, 'study activity becomes append-only events');
assert(first.planning.warnings.length === 1, 'planning warnings are preserved');
assert(first.planning.missions.length === 1, 'planning missions are preserved');
assert(first.planning.plans.length === 1, 'planning plans are preserved');
assert(first.planning.actions.length === 1, 'planning actions are preserved');

assert(first.research.attachments.length === 1, 'research attachment metadata is represented');
assert(first.research.attachments[0].hasInlinePayload === true, 'shadow records that legacy attachment still has inline payload');
assert(first.research.attachments[0].legacyRef.itemId === 'ugv-paper', 'attachment has deterministic legacy reference');
assert(!JSON.stringify(first).includes(INLINE_PAYLOAD), 'inline Base64/Data URL payload is not duplicated into shadow state');

assert(first.configuration.subjectOverrides.length === 2, 'only subject path/priority overrides are carried into personal configuration');
assert(!JSON.stringify(first.configuration).includes('static content'), 'static subject descriptions are not copied into personal configuration');
assert(first.sourceSnapshot.unclassifiedFields.includes('futureFieldFromNewRuntime'), 'unknown future legacy field is surfaced, not silently ignored');

const report = migrator.integrityReport(legacyState, first);
assert(report.passed === true, 'shadow integrity passes despite deferred attachment payload');
assert(report.shadowSafe === true, 'state is safe for shadow storage');
assert(report.cutoverReady === false, 'state is not falsely declared cutover-ready');
assert(report.attachmentPayloadsStillLegacy === 1, 'integrity report counts payloads intentionally left in legacy state');
assert(report.unclassifiedFields.includes('futureFieldFromNewRuntime'), 'integrity report blocks silent cutover on unknown fields');

const legacyRawBefore = localStorage.getItem(mainKey);
const refresh = repo.refreshShadow({ test: true });
assert(refresh.written === true, 'shadow repository writes only after integrity PASS');
assert(refresh.legacyPreserved === true, 'shadow refresh reports legacy state preserved');
assert(localStorage.getItem(mainKey) === legacyRawBefore, 'legacy main state remains byte-for-byte unchanged after shadow refresh');
assert(localStorage.getItem(schema.shadowKey) !== null, 'shadow state is stored under a separate versioned key');

const audit = repo.auditShadow();
assert(audit.present === true && audit.passed === true, 'stored shadow passes repository audit');
assert(audit.integrity.cutoverReady === false, 'stored shadow audit retains cutover blocker information');

const shadowRaw = localStorage.getItem(schema.shadowKey);
assert(!shadowRaw.includes(INLINE_PAYLOAD), 'stored shadow does not duplicate inline research payload');
assert(!shadowRaw.includes('MUST_NOT_COPY'), 'stored shadow contains no legacy password value');
assert(localStorage.getItem(usersKey) === seed[usersKey], 'legacy users cache is unchanged by L4 shadow migration');
assert(localStorage.getItem(currentUserKey) === seed[currentUserKey], 'legacy current-user cache is unchanged by L4 shadow migration');

repo.removeShadow({ testCleanup: true });
assert(localStorage.getItem(schema.shadowKey) === null, 'shadow cleanup does not touch legacy state');
assert(localStorage.getItem(mainKey) === legacyRawBefore, 'legacy main state survives shadow cleanup unchanged');

console.log('L4 PERSONAL LEARNING REGRESSION: ALL CHECKS PASSED');
