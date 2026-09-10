'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = rel => fs.existsSync(path.join(root, rel));

const html = read('index.html');
const count = token => html.split(token).length - 1;

// Academic overlay must be present exactly once, without replacing current-main runtime wiring.
assert(count('assets/css/academic-2026.css') === 1, 'academic CSS must be referenced exactly once');
assert(count('assets/js/academic-main.js') === 1, 'academic JS must be referenced exactly once');
assert(count('assets/js/planning-main.js') === 1, 'planning-main must remain referenced exactly once');
assert(count('assets/js/platform/runtime-config.js') === 1, 'current runtime-config wiring must be preserved');
assert(count('assets/js/platform/device-access-gate.js') === 1, 'current device-access-gate wiring must be preserved');
assert(count('assets/css/device-access-gate.css') === 1, 'current device-access-gate CSS must be preserved');
assert(count('assets/js/data.js') === 1, 'current data runtime wiring must be preserved');
assert(count('assets/js/main.js') === 1, 'current main runtime wiring must be preserved');

const planningPos = html.indexOf('assets/js/planning-main.js');
const academicPos = html.indexOf('assets/js/academic-main.js');
assert(planningPos >= 0 && academicPos > planningPos, 'academic-main must load after planning-main');
const mainCssPos = html.indexOf('assets/css/main.css');
const academicCssPos = html.indexOf('assets/css/academic-2026.css');
const deviceCssPos = html.indexOf('assets/css/device-access-gate.css');
assert(mainCssPos >= 0 && academicCssPos > mainCssPos, 'academic CSS must load after main CSS');
assert(deviceCssPos > academicCssPos, 'device gate CSS must remain last among shell CSS so access UI cannot be weakened');
assert(!/<div[^>]+id=["'](?:app|appRoot)["'][^>]*>\s*7(?:\s|<)/i.test(html), 'stray literal 7 detected in app root');

const packs = [
  'p00-technical-russian.json',
  'p04-discrete-algorithms-data-structures.json',
  'p06-database-fundamentals.json',
  'p07-linux-os-networks.json',
  'p08-software-engineering.json',
  'p09-markov-queueing-simulation.json',
  'p10-scientific-data-python.json',
  'p11-research-foundation.json',
  'j01-information-system-architecture.json'
];
for (const file of packs) assert(exists(`assets/data/prerequisite-packs/${file}`), `missing Academic 2026 pack ${file}`);

for (const file of [
  'assets/data/official-curriculum-iu5-2026.json',
  'assets/data/prerequisite-registry-iu5-2026.json',
  'assets/data/prerequisite-content-coverage-2026.json',
  'assets/js/academic-main.js',
  'assets/css/academic-2026.css'
]) assert(exists(file), `missing Academic 2026 integration file ${file}`);

const validators = [
  'validate-academic-2026.js',
  'validate-prerequisite-coverage-2026.js',
  'validate-p00-technical-russian.js',
  'validate-p04-discrete-algorithms-data-structures.js',
  'validate-p06-database-fundamentals.js',
  'validate-p07-linux-os-networks.js',
  'validate-p08-software-engineering.js',
  'validate-p09-markov-queueing.js',
  'validate-p10-scientific-data-python.js',
  'validate-p11-research-foundation.js',
  'validate-j01-information-system-architecture.js'
];
for (const file of validators) assert(exists(`scripts/${file}`), `missing Academic validator ${file}`);

// Protect the historical Pass03 coverage audit from being mistaken for live implementation state.
const coverage = JSON.parse(read('assets/data/prerequisite-content-coverage-2026.json'));
assert(coverage.version === 'PREREQ_CONTENT_COVERAGE_IU5_2026_PASS03', 'coverage snapshot version drifted; Pass03 audit must remain historical');
assert(coverage.policy?.statusIsQualitative === true, 'coverage snapshot must remain qualitative');
assert(coverage.policy?.noFabricatedCoveragePercent === true, 'coverage snapshot must preserve no-fabricated-percent policy');

// Confirm overlay did not replace the current runtime/device gate implementation files.
for (const file of [
  'assets/js/platform/runtime-config.js',
  'assets/js/platform/device-access-gate.js',
  'assets/css/device-access-gate.css'
]) assert(exists(file), `current-main runtime protection file missing: ${file}`);

if (errors.length) {
  console.error(`PHASE1_SYNC_VALIDATION_FAIL (${errors.length})`);
  errors.forEach(e => console.error(`- ${e}`));
  process.exit(1);
}
console.log('PHASE1_SYNC_VALIDATION_PASS');
console.log(JSON.stringify({
  academicPacks: packs.length,
  academicValidators: validators.length,
  planningBeforeAcademic: academicPos > planningPos,
  currentDeviceGatePreserved: true,
  historicalCoverageSnapshotPreserved: true
}, null, 2));
