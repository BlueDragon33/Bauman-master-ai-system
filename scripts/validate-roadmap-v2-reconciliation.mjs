import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const manifest=JSON.parse(fs.readFileSync('recovery/roadmap-v2/reconciliation-manifest.v1.json','utf8'));
assert.equal(manifest.schema,'BAUMAN_ROADMAP_V2_RECONCILIATION_V1');
assert.equal(manifest.phase,'L27R2A_HISTORICAL_EVIDENCE_ARCHIVE');
assert.equal(manifest.currentRuntime.sourceHead,'146d8f672975f46b36164cbd795e837801e50c97');
assert.equal(manifest.currentRuntime.mainAncestor,'1a6dfa3f822a9b6c662bf01cad48b12334ab3aae');
assert.equal(manifest.historicalRoadmap.terminalHead,'0438b6f4256003e6f20c266c97d944ade7c52f83');
assert.equal(manifest.historicalRoadmap.terminalRound,27);
assert.equal(manifest.historicalRoadmap.terminalStep,108);

for(const sha of [manifest.currentRuntime.mainAncestor,manifest.currentRuntime.sourceHead]){
  execFileSync('git',['merge-base','--is-ancestor',sha,'HEAD'],{stdio:'ignore'});
}

for(const [name,evidence] of Object.entries(manifest.l27r1GateEvidence)){
  assert.equal(evidence.conclusion,'success',`L27R1 gate not green: ${name}`);
  assert.ok(Number.isInteger(evidence.runId)&&evidence.runId>0,`missing gate run id: ${name}`);
}

assert.equal(manifest.driftAudit.checkedProtectedPaths,40);
assert.equal(manifest.driftAudit.unchangedProtectedPaths,30);
assert.equal(manifest.driftAudit.changedProtectedPaths,10);
assert.equal(manifest.driftAudit.theoryContent.recordsCurrent,18);
assert.equal(manifest.driftAudit.theoryContent.slidesOld,300);
assert.equal(manifest.driftAudit.theoryContent.slidesCurrent,306);

const required=[
 'foundation/domain-model/canonical-identity-runtime.js',
 'subjects/shared/foundation-identity-bootstrap.js',
 'subjects/russian/assets/learning-state.js',
 'subjects/russian/assets/learning-flow.js',
 'subjects/russian/assets/capability-progression.js',
 'subjects/russian/scripts/validate-readiness-navigator.mjs',
 'tests/russian-offline-shell-browser.mjs',
 'tests/subject-progress-contract-browser.mjs'
];
for(const path of required)assert.equal(fs.existsSync(path),true,`missing protected modern-runtime file: ${path}`);

assert.equal(fs.existsSync('foundation/content-registry'),false,'Foundation L10 must stay outside recovery');
assert.equal(fs.existsSync('roadmap_v2'),false,'Canonical Roadmap transplant must not begin during R2A');

const rounds=Object.fromEntries(manifest.rounds.map(x=>[x.id,x.status]));
assert.equal(rounds.L27R1,'pass');
assert.equal(rounds.L27R2A,'in_progress');
assert.equal(rounds.L27R2B,'blocked_on_L27R2A');
assert.equal(manifest.nextOfficialRound.allowedOnlyAfter,'L27R6_PASS');

console.log('ROADMAP_V2_RECONCILIATION_L27R1_LOCK=PASS');
console.log(JSON.stringify({phase:manifest.phase,drift:manifest.driftAudit.changedProtectedPaths,next:'L27R2A'},null,2));
