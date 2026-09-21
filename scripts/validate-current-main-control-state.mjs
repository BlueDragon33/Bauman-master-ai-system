import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const read = path => fs.readFileSync(path, 'utf8');
const state = read('CODEX_STATE.md');
const task = read('CODEX_TASK.md');
const roadmap = read('docs/roadmap_v2/CURRENT_EXECUTION_STATE.md');
const control = JSON.parse(read('control/application-management.contract.json'));

const stateTask = state.match(/^Current task:\s+`([^`]+)`/m)?.[1] || '';
const taskTask = task.match(/^Task:\s+`([^`]+)`/m)?.[1] || '';

assert.ok(stateTask, 'CODEX_STATE current task marker is missing.');
assert.ok(taskTask, 'CODEX_TASK task marker is missing.');
assert.equal(stateTask, taskTask, 'CODEX_STATE and CODEX_TASK point to different current tasks.');

assert.match(state, /^Branch:\s+`main`$/m, 'CODEX_STATE must identify main as the current branch.');
assert.match(state, /^Base:\s+`main`$/m, 'CODEX_STATE must identify main as the current base.');
assert.ok(state.includes('ROADMAP_V2_COMPLETE'), 'CODEX_STATE must preserve ROADMAP_V2_COMPLETE.');
assert.ok(state.includes('CURRENT_MAIN_CLEAN'), 'CODEX_STATE must preserve CURRENT_MAIN_CLEAN.');
assert.ok(task.includes('CHAT_FIRST / CURRENT_MAIN / FAIL_CLOSED'), 'CODEX_TASK must preserve current-main fail-closed mode.');

const promotedSection = state.match(/Promoted current-main capabilities:\n([\s\S]*?)\n## /)?.[1] || '';
const promotedShas = [...promotedSection.matchAll(/`([0-9a-f]{40})`/gi)].map(match => match[1].toLowerCase());
assert.ok(promotedShas.length > 0, 'CODEX_STATE promoted current-main capability SHAs are missing.');
assert.equal(new Set(promotedShas).size, promotedShas.length, 'CODEX_STATE promoted current-main capability SHAs must be unique.');
for (const sha of promotedShas) {
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', sha, 'HEAD'], {stdio: 'ignore'});
  } catch {
    assert.fail(`Promoted current-main SHA is not an ancestor of HEAD: ${sha}`);
  }
}

assert.ok(roadmap.includes('Current round: **Lượt 35**'), 'Authoritative Roadmap marker must remain at Lượt 35.');
assert.ok(roadmap.includes('ROADMAP V2 COMPLETE · MERGED TO MAIN'), 'Authoritative Roadmap marker must remain complete and merged.');
assert.ok(roadmap.includes('no L36 required by current architecture'), 'Authoritative Roadmap marker must preserve the no-L36 architecture boundary.');
assert.ok(roadmap.includes('Production/runtime activation by Roadmap V2: **disconnected**'), 'Roadmap production/runtime activation must remain disconnected.');
assert.ok(state.includes('complete through **L35**') || state.includes('complete through L35'), 'CODEX_STATE must agree that Roadmap V2 is complete through L35.');
assert.ok(task.includes('Roadmap V2 is complete through L35'), 'CODEX_TASK must agree that Roadmap V2 is complete through L35.');
assert.ok(!/^\s*Current round:\s*\*\*Lượt 36\*\*/m.test(roadmap), 'L36 must not become the authoritative current round without a separately approved architecture track.');

assert.ok(Number(control.contractVersion) >= 7, 'Application Management contract must remain at version 7 or newer.');
const explicitMissing = Object.entries(control.readiness || {}).filter(([, value]) => value === 'missing');
assert.deepEqual(explicitMissing, [], 'Application Management readiness must not contain an explicit missing capability.');
assert.equal(control.boundary?.independentRuntime, true, 'Bauman runtime must remain independent.');
assert.equal(control.boundary?.embeddedInApplicationManagement, false, 'Bauman runtime must not become embedded in Application Management.');
assert.equal(control.policy?.productionDeployRequiresExplicitPromotionAfterPreview, true, 'Production deploy must continue requiring explicit promotion after preview.');
assert.equal(control.policy?.applicationManagementMayEditLearningContent, false, 'Application Management must not edit learning content.');
assert.equal(control.contentReview?.metadataOnly, true, 'Content Review must remain metadata-only.');
assert.equal(control.contentReview?.learningContentStoredInControlDatabase, false, 'Control DB must not store learning-content bodies.');

assert.ok(state.includes('non-authoritative learner reflection'), 'CODEX_STATE must preserve the Deep Study Journal non-authoritative boundary.');
assert.ok(task.includes('reflection-only learner state'), 'CODEX_TASK must preserve the Deep Study Journal reflection-only boundary.');
assert.ok(task.includes('no mastery/diagnostic/prerequisite/scheduler/progress mutation'), 'CODEX_TASK must preserve Deep Study Journal no-mutation authority.');

console.log('CURRENT_MAIN_CONTROL_STATE_GATE_V1_1=PASS');
console.log(JSON.stringify({
  task: stateTask,
  roadmapRound: 35,
  roadmapComplete: true,
  productionRuntimeActivation: 'disconnected',
  applicationManagementContractVersion: control.contractVersion,
  explicitMissingCapabilities: explicitMissing.length,
  promotedShaCount: promotedShas.length,
  promotedShaAncestryVerified: true,
  failClosed: true
}, null, 2));
