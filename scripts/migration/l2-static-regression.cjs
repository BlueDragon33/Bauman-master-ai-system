'use strict';

const fs = require('fs');
const vm = require('vm');
const childProcess = require('child_process');

function fail(message) {
  console.error('FAIL:', message);
  process.exitCode = 1;
}

function ok(message) {
  console.log('PASS:', message);
}

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
  ok(message);
}

function assertProtectedPathsUnchanged() {
  const protectedPaths = [
    'assets/js/data.js',
    'assets/js/main.js',
    'assets/js/planning-main.js',
    'subjects/math',
    'subjects/russian'
  ];
  try {
    childProcess.execFileSync('git', ['diff', '--quiet', 'origin/main', '--', ...protectedPaths], { stdio: 'pipe' });
    ok('L2 protected runtime paths unchanged from main');
  } catch (error) {
    throw new Error('L2 protected runtime paths changed unexpectedly');
  }
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

function executePlatformScripts() {
  const legacySeed = {
    bauman_main_all_phases_subjects_v1: JSON.stringify({ page: 'home', progress: { math: 1 } }),
    bauman_main_users_fullcode_v1: JSON.stringify([{ email: 'legacy@example.test', role: 'user' }]),
    bauman_current_user_fullcode_v1: JSON.stringify({ email: 'legacy@example.test', role: 'user' })
  };
  const localStorage = makeLocalStorage(legacySeed);
  const window = {
    localStorage,
    console,
    addEventListener() {},
    removeEventListener() {}
  };
  const context = vm.createContext({ window, console, Date, Map, Set, Object, Array, JSON, String });

  [
    'assets/js/platform/runtime-config.js',
    'assets/js/platform/storage-adapter.js',
    'assets/js/platform/state-schema.js',
    'assets/js/platform/platform-bootstrap.js'
  ].forEach((path) => {
    new vm.Script(read(path), { filename: path }).runInContext(context);
    ok(path + ' parses and executes in isolated browser-like context');
  });

  const audit = window.BAUMAN_PLATFORM_AUDIT({ log: false });
  assert(audit.passed === true, 'platform bootstrap audit passes');
  assert(audit.checks.cloudSyncOff === true, 'cloud sync remains OFF in Safety Platform Layer');
  assert(audit.checks.backendAuthOff === true, 'backend auth remains OFF in Safety Platform Layer');
  assert(audit.checks.aiProxyOff === true, 'AI proxy remains OFF in Safety Platform Layer');
  assert(audit.checks.storageRoundTrip === true, 'storage adapter round-trip works');
  assert(audit.checks.storageProbeCleaned === true, 'storage adapter probe is cleaned');

  const snapshotAfterAudit = localStorage.snapshot();
  Object.entries(legacySeed).forEach(([key, value]) => {
    assert(snapshotAfterAudit[key] === value, 'legacy key preserved: ' + key);
  });

  const migrationTarget = '__bauman_l2_copy_target__';
  const copyResult = window.BaumanPlatformStorage.copyLegacyJSON(
    migrationTarget,
    ['bauman_main_all_phases_subjects_v1']
  );
  assert(copyResult.copied === true, 'copyLegacyJSON can copy without deleting source');
  assert(localStorage.getItem('bauman_main_all_phases_subjects_v1') === legacySeed.bauman_main_all_phases_subjects_v1, 'copyLegacyJSON leaves legacy source untouched');
  window.BaumanPlatformStorage.removeItem(migrationTarget, { purpose: 'test-cleanup' });

  const described = window.BaumanStateSchema.describeLegacyState({
    progress: { math: 1 },
    schedule: { entries: {} },
    subjects: { math: {} },
    customFutureField: 42
  });
  assert(described.dynamic.progress.math === 1, 'state schema classifies dynamic progress');
  assert(!!described.staticOrConfiguration.subjects.math, 'state schema classifies subject configuration');
  assert(described.untouchedKeys.includes('customFutureField'), 'state schema preserves awareness of unknown future fields');
}

function checkIndex() {
  const index = read('index.html');
  assert(!index.includes('</div>7'), 'stray topbar token removed');

  const scripts = [
    'assets/js/platform/runtime-config.js',
    'assets/js/platform/storage-adapter.js',
    'assets/js/platform/state-schema.js',
    'assets/js/platform/platform-bootstrap.js',
    'assets/js/data.js',
    'assets/js/main.js',
    'assets/js/planning-main.js'
  ];
  let last = -1;
  scripts.forEach((src) => {
    const pos = index.indexOf(`src="${src}"`);
    assert(pos >= 0, 'index loads ' + src);
    assert(pos > last, 'script order is safe for ' + src);
    last = pos;
  });
}

try {
  assertProtectedPathsUnchanged();
  checkIndex();
  executePlatformScripts();
} catch (error) {
  fail(error.stack || error.message || String(error));
}

if (process.exitCode) process.exit(process.exitCode);
console.log('L2 STATIC REGRESSION: ALL CHECKS PASSED');
