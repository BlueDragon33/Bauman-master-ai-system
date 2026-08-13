'use strict';

const fs = require('fs');
const vm = require('vm');
const childProcess = require('child_process');

function read(path) { return fs.readFileSync(path, 'utf8'); }
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

function protectSubjectRuntimes() {
  childProcess.execFileSync('git', [
    'diff', '--quiet', 'origin/main', '--',
    'assets/js/data.js',
    'assets/js/planning-main.js',
    'subjects/math',
    'subjects/russian'
  ]);
  console.log('PASS: protected subject/data/planning runtimes unchanged from main');
}

function executeRepositoryTests() {
  const seed = {
    bauman_main_all_phases_subjects_v1: JSON.stringify({ page: 'home', progress: { math: 1 }, schedule: { entries: {} } }),
    bauman_main_users_fullcode_v1: JSON.stringify([{ email: 'legacy@example.test', role: 'user' }]),
    bauman_current_user_fullcode_v1: JSON.stringify({ email: 'legacy@example.test', role: 'user' })
  };
  const localStorage = makeLocalStorage(seed);
  const window = { localStorage, console, addEventListener() {}, removeEventListener() {} };
  const context = vm.createContext({ window, console, Date, Map, Set, Object, Array, JSON, String, TypeError });

  [
    'assets/js/platform/runtime-config.js',
    'assets/js/platform/storage-adapter.js',
    'assets/js/platform/state-schema.js',
    'assets/js/platform/main-state-repository.js',
    'assets/js/platform/platform-bootstrap.js'
  ].forEach((path) => {
    new vm.Script(read(path), { filename: path }).runInContext(context);
    console.log('PASS:', path, 'parses and executes');
  });

  const repo = window.BaumanMainStateRepository;
  assert(!!repo, 'main state repository is available');
  assert(repo.keys.mainState === 'bauman_main_all_phases_subjects_v1', 'repository reuses legacy main-state key');
  assert(repo.keys.users === 'bauman_main_users_fullcode_v1', 'repository reuses legacy users key');
  assert(repo.keys.currentUser === 'bauman_current_user_fullcode_v1', 'repository reuses legacy session key');

  const initialState = repo.readMainState(null);
  assert(initialState.progress.math === 1, 'repository reads existing legacy main state');

  repo.writeMainState({ page: 'schedule', progress: { math: 2 }, schedule: { entries: {} } }, { test: true });
  assert(JSON.parse(localStorage.getItem(repo.keys.mainState)).page === 'schedule', 'repository writes main state to same legacy key');

  repo.writeCurrentUser({ email: 'next@example.test', role: 'user' }, { test: true });
  assert(repo.readCurrentUser(null).email === 'next@example.test', 'repository writes and reads session cache');
  repo.clearCurrentUser({ test: true });
  assert(localStorage.getItem(repo.keys.currentUser) === null, 'repository clears session cache');

  repo.writeUsers([{ email: 'next@example.test', role: 'user' }], { test: true });
  assert(repo.readUsers([])[0].email === 'next@example.test', 'repository writes and reads legacy users cache');

  repo.mutateMainState((draft) => {
    draft.progress.math = 3;
  }, {}, { test: true });
  assert(repo.readMainState({}).progress.math === 3, 'repository mutation persists through adapter');

  const keys = Object.keys(localStorage.snapshot()).sort();
  assert(keys.every((key) => [repo.keys.mainState, repo.keys.users].includes(key)), 'repository test creates no unexpected persistent keys after session clear');
}

function checkIndexOrder() {
  const index = read('index.html');
  const scripts = [
    'assets/js/platform/runtime-config.js',
    'assets/js/platform/storage-adapter.js',
    'assets/js/platform/state-schema.js',
    'assets/js/platform/main-state-repository.js',
    'assets/js/platform/platform-bootstrap.js',
    'assets/js/data.js',
    'assets/js/main.js',
    'assets/js/planning-main.js'
  ];
  let last = -1;
  for (const src of scripts) {
    const pos = index.indexOf(`src="${src}"`);
    assert(pos >= 0, 'index loads ' + src);
    assert(pos > last, 'script order safe for ' + src);
    last = pos;
  }
}

function inspectMainMigrationPhase() {
  const main = read('assets/js/main.js');
  const repositoryReferenced = main.includes('BaumanMainStateRepository');
  if (!repositoryReferenced) {
    console.log('INFO: main.js is still legacy-direct; repository readiness phase only.');
    return;
  }

  assert(!main.includes('localStorage.getItem(KEY)'), 'main state no longer reads KEY directly from localStorage');
  assert(!main.includes('localStorage.setItem(KEY'), 'main state no longer writes KEY directly to localStorage');
  assert(!main.includes('localStorage.getItem(CURRENT_USER_KEY)'), 'session no longer reads CURRENT_USER_KEY directly');
  assert(!main.includes('localStorage.setItem(CURRENT_USER_KEY'), 'session no longer writes CURRENT_USER_KEY directly');
  assert(!main.includes('localStorage.removeItem(CURRENT_USER_KEY)'), 'session no longer clears CURRENT_USER_KEY directly');
  assert(main.includes('BaumanMainStateRepository'), 'main runtime references repository after migration');
}

try {
  protectSubjectRuntimes();
  checkIndexOrder();
  executeRepositoryTests();
  inspectMainMigrationPhase();
  console.log('L3 STORAGE REGRESSION: ALL CHECKS PASSED');
} catch (error) {
  console.error('FAIL:', error.stack || error.message || String(error));
  process.exit(1);
}
