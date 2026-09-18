import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const manifest=JSON.parse(fs.readFileSync('recovery/roadmap-v2/reconciliation-manifest.v1.json','utf8'));
assert.equal(manifest.schema,'BAUMAN_ROADMAP_V2_RECONCILIATION_V1');
assert.equal(manifest.phase,'L27R2B0_CONTRACT_HYGIENE');
for(const sha of [manifest.currentRuntime.mainAncestor,manifest.currentRuntime.sourceHead]){
  execFileSync('git',['merge-base','--is-ancestor',sha,'HEAD'],{stdio:'ignore'});
}
for(const [label,group] of Object.entries({R1:manifest.l27r1GateEvidence,R2A:manifest.l27r2aGateEvidence})){
  for(const [name,evidence] of Object.entries(group)){
    assert.equal(evidence.conclusion,'success',`${label} gate not green: ${name}`);
  }
}
assert.equal(manifest.driftAudit.checkedProtectedPaths,40);
assert.equal(manifest.driftAudit.changedProtectedPaths,10);
assert.equal(manifest.driftAudit.theoryContent.slidesCurrent,306);
assert.equal(fs.existsSync('foundation/content-registry'),false,'Foundation L10 must stay outside recovery');
assert.equal(fs.existsSync('roadmap_v2'),false,'Canonical Roadmap paths must remain inactive in R2B0');
const rounds=Object.fromEntries(manifest.rounds.map(x=>[x.id,x.status]));
assert.equal(rounds.L27R1,'pass');
assert.equal(rounds.L27R2A,'pass');
assert.equal(rounds.L27R2B0,'in_progress');
assert.equal(rounds.L27R2B,'blocked_on_L27R2B0');
assert.equal(manifest.nextOfficialRound.allowedOnlyAfter,'L27R6_PASS');
console.log('ROADMAP_V2_RECONCILIATION_R2B0_LOCK=PASS');
