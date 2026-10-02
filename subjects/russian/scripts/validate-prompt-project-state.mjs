import fs from 'node:fs';
import assert from 'node:assert/strict';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const statePath = 'prompts/subjects/russian/PROJECT_STATE.json';
const state = readJson(statePath);

assert.equal(state.subject, 'russian');
assert.equal(state.constitution, 'prompts/CONSTITUTION.md');
assert.equal(state.masterPrompt, 'prompts/subjects/russian/RUSSIAN_MASTER_PROMPT.md');
assert.equal(state.releaseAnnex, 'prompts/constitution/C3_RELEASE_ANNEX_SHARED.md');
for (const path of [state.constitution, state.masterPrompt, state.releaseAnnex]) {
  assert(fs.existsSync(path), 'Russian prompt authority path missing: ' + path);
}

assert.equal(state.activeModule, 'RU08', 'Current Russian active module must remain RU08 until exact-head validation closes');
assert(['RU08_VALIDATING', 'RU08_PASS'].includes(state.status), 'Russian project state regressed to a stale execution phase');

const upstream = ['RU01','RU02','RU03','RU04','RU05','RU06','RU07'];
for (const module of upstream) {
  assert(state.completedModules.includes(module), 'completedModules missing ' + module);
  const phase = module.toLowerCase();
  const phaseRecord = `subjects/russian/docs/${phase}/RUSSIAN_${module}_PHASE_RECORD.md`;
  assert(fs.existsSync(phaseRecord), 'phase record missing: ' + phaseRecord);
  const text = fs.readFileSync(phaseRecord, 'utf8');
  assert(/State:\s*\*\*PASS\*\*|RU0[1-7] STATE:\s*PASS/i.test(text), module + ' phase record is not PASS');
}

assert.equal(new Set(state.completedModules).size, state.completedModules.length, 'completedModules contains duplicates');
if (state.status === 'RU08_VALIDATING') {
  assert(!state.completedModules.includes('RU08'), 'RU08 cannot be completed while state is VALIDATING');
}
if (state.status === 'RU08_PASS') {
  assert(state.completedModules.includes('RU08'), 'RU08 PASS must be reflected in completedModules');
}

assert.equal(state.auditBaselineSha, '2b0b540edc381c4ea6268e080b0444d0c78b7277');
assert.match(state.exactHeadBinding || '', /current Git HEAD|current git HEAD/i, 'state must bind exact head dynamically rather than hardcoding a self-invalidating SHA');
assert(Array.isArray(state.evidence) && state.evidence.length >= 10, 'Russian project-state evidence index is incomplete');
for (const path of state.evidence) assert(fs.existsSync(path), 'project-state evidence path missing: ' + path);
assert(Array.isArray(state.blockers), 'blockers must be an array');

console.log(JSON.stringify({
  ok: true,
  status: state.status,
  activeModule: state.activeModule,
  upstreamPass: upstream.length,
  evidence: state.evidence.length,
  releaseAnnex: state.releaseAnnex
}));
