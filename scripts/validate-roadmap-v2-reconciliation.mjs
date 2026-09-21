import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const manifest=JSON.parse(fs.readFileSync('recovery/roadmap-v2/reconciliation-manifest.v1.json','utf8'));
assert.equal(manifest.schema,'BAUMAN_ROADMAP_V2_RECONCILIATION_V1');

const phaseOrder=[
  'L27R1_BASELINE_FREEZE',
  'L27R2A_HISTORICAL_EVIDENCE_ARCHIVE',
  'L27R2B0_CONTRACT_HYGIENE',
  'L27R2B_STATIC_CONTRACT_SCHEMA_TRANSPLANT',
  'L27R2C_TOOLCHAIN_DATA_TEST_TRANSPLANT',
  'L27R3_MODERN_BASELINE_REGENERATION',
  'L27R4_FOUNDATION_RUSSIAN_COMPATIBILITY',
  'L27R5_OFFLINE_PACKAGE_FAILURE_HARDENING',
  'L27R6_FULL_PROMOTION_GATE'
];
assert.equal(phaseOrder.includes(manifest.phase),true,`unknown reconciliation phase: ${manifest.phase}`);

for(const sha of [manifest.currentRuntime.mainAncestor,manifest.currentRuntime.sourceHead]){
  execFileSync('git',['merge-base','--is-ancestor',sha,'HEAD'],{stdio:'ignore'});
}
for(const [label,group] of Object.entries({R1:manifest.l27r1GateEvidence,R2A:manifest.l27r2aGateEvidence})){
  for(const [name,evidence] of Object.entries(group)){
    assert.equal(evidence.conclusion,'success',`${label} gate not green: ${name}`);
  }
}

assert.equal(manifest.historicalRoadmap.terminalRound,27);
assert.equal(manifest.historicalRoadmap.terminalStep,108);
assert.equal(manifest.historicalRoadmap.terminalStatus,'PASS_B105_B108_READINESS_PROJECTION_PRODUCTION_DISCONNECTED');
assert.equal(manifest.driftAudit.checkedProtectedPaths,40);
assert.equal(manifest.driftAudit.changedProtectedPaths,10);
assert.equal(manifest.driftAudit.theoryContent.recordsCurrent,18);
assert.equal(manifest.driftAudit.theoryContent.slidesCurrent,306);
assert.equal(fs.existsSync('foundation/content-registry'),false,'Foundation L10 must stay outside recovery');
assert.equal(manifest.nextOfficialRound.id,'L28');
assert.equal(manifest.nextOfficialRound.step,109);
assert.equal(manifest.nextOfficialRound.allowedOnlyAfter,'L27R6_PASS');

const rounds=manifest.rounds;
const ids=rounds.map(x=>x.id);
assert.deepEqual(ids,['L27R1','L27R2A','L27R2B0','L27R2B','L27R2C','L27R3','L27R4','L27R5','L27R6']);
const status=Object.fromEntries(rounds.map(x=>[x.id,x.status]));
assert.equal(status.L27R1,'pass');
assert.equal(status.L27R2A,'pass');

const phaseRules={
  L27R2B0_CONTRACT_HYGIENE:{passed:['L27R1','L27R2A'],active:'L27R2B0'},
  L27R2B_STATIC_CONTRACT_SCHEMA_TRANSPLANT:{passed:['L27R1','L27R2A','L27R2B0'],active:'L27R2B'},
  L27R2C_TOOLCHAIN_DATA_TEST_TRANSPLANT:{passed:['L27R1','L27R2A','L27R2B0','L27R2B'],active:'L27R2C'},
  L27R3_MODERN_BASELINE_REGENERATION:{passed:['L27R1','L27R2A','L27R2B0','L27R2B','L27R2C'],active:'L27R3'},
  L27R4_FOUNDATION_RUSSIAN_COMPATIBILITY:{passed:['L27R1','L27R2A','L27R2B0','L27R2B','L27R2C','L27R3'],active:'L27R4'},
  L27R5_OFFLINE_PACKAGE_FAILURE_HARDENING:{passed:['L27R1','L27R2A','L27R2B0','L27R2B','L27R2C','L27R3','L27R4'],active:'L27R5'},
  L27R6_FULL_PROMOTION_GATE:{passed:['L27R1','L27R2A','L27R2B0','L27R2B','L27R2C','L27R3','L27R4','L27R5'],active:'L27R6'}
};
const rule=phaseRules[manifest.phase];
if(rule){
  for(const id of rule.passed)assert.equal(status[id],'pass',`required prior phase not pass: ${id}`);
  assert.equal(status[rule.active],'in_progress',`active phase mismatch: ${rule.active}`);
}

const active=rounds.filter(x=>x.status==='in_progress');
assert.equal(active.length<=1,true,'more than one reconciliation round active');
for(let i=0;i<rounds.length;i++){
  const r=rounds[i];
  if(r.status==='pass')continue;
  if(r.status==='in_progress'){
    for(let j=i+1;j<rounds.length;j++){
      assert.equal(
        String(rounds[j].status).startsWith('blocked_on_'),
        true,
        `future round not blocked after active ${r.id}: ${rounds[j].id}=${rounds[j].status}`
      );
    }
    break;
  }
}

if(manifest.phase==='L27R2B_STATIC_CONTRACT_SCHEMA_TRANSPLANT'){
  assert.equal(fs.existsSync('roadmap_v2'),true,'R2B canonical Roadmap contract tree missing');
  assert.equal(manifest.r2b?.admittedFiles,23);
  assert.equal(manifest.r2b?.executableEngines,0);
  assert.equal(manifest.r2b?.generatedDataFiles,0);
  assert.equal(manifest.r2b?.runtimeUiChanges,0);
  assert.equal(manifest.r2b?.productionIntegration,'disconnected');
  assert.equal(fs.existsSync('roadmap_v2/migration/migration-contract.json'),false,'historical migration contract must remain quarantined');
}

console.log('ROADMAP_V2_RECONCILIATION_STATE=PASS');
console.log(JSON.stringify({phase:manifest.phase,active:active[0]?.id||null,next:'L28/B109 after L27R6'},null,2));
