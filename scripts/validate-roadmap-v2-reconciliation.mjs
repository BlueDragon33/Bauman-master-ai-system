import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const manifestPath='recovery/roadmap-v2/reconciliation-manifest.v1.json';
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));

assert.equal(manifest.schema,'BAUMAN_ROADMAP_V2_RECONCILIATION_V1');
assert.equal(manifest.phase,'L27R1_BASELINE_FREEZE');
assert.equal(manifest.status,'stabilization_only');
assert.equal(manifest.currentRuntime.sourceHead,'146d8f672975f46b36164cbd795e837801e50c97');
assert.equal(manifest.currentRuntime.mainAncestor,'1a6dfa3f822a9b6c662bf01cad48b12334ab3aae');
assert.equal(manifest.historicalRoadmap.baseline,'e383912354673bdce7a0059d6b9a23799d74e689');
assert.equal(manifest.historicalRoadmap.terminalRound,27);
assert.equal(manifest.historicalRoadmap.terminalStep,108);
assert.equal(manifest.separateWork.mergeIntoRecoveryNow,false);
assert.equal(manifest.nextOfficialRound.id,'L28');
assert.equal(manifest.nextOfficialRound.step,109);
assert.equal(manifest.nextOfficialRound.allowedOnlyAfter,'L27R6_PASS');

function ancestor(sha){
  execFileSync('git',['merge-base','--is-ancestor',sha,'HEAD'],{stdio:'ignore'});
}
ancestor(manifest.currentRuntime.mainAncestor);
ancestor(manifest.currentRuntime.sourceHead);

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
for(const path of required) assert.equal(fs.existsSync(path),true,`missing protected modern-runtime file: ${path}`);

assert.equal(fs.existsSync('foundation/content-registry'),false,'Foundation L10 must stay outside the L27R1 recovery baseline');
assert.equal(fs.existsSync('roadmap_v2'),false,'Roadmap V2 transplant must not start during L27R1');

const rounds=manifest.rounds.map(x=>x.id);
assert.deepEqual(rounds,['L27R1','L27R2','L27R3','L27R4','L27R5','L27R6']);
assert.equal(manifest.rounds[0].status,'in_progress');
for(const round of manifest.rounds.slice(1)) assert.match(round.status,/^blocked_on_/);

console.log('ROADMAP_V2_RECONCILIATION_L27R1=PASS');
console.log(JSON.stringify({
  modernMain:manifest.currentRuntime.mainAncestor,
  modernRuntime:manifest.currentRuntime.sourceHead,
  historicalBaseline:manifest.historicalRoadmap.baseline,
  historicalTerminal:`L${manifest.historicalRoadmap.terminalRound}/B${manifest.historicalRoadmap.terminalStep}`,
  officialNext:'L28/B109',
  roadmapTransplanted:false,
  foundationL10Mixed:false
},null,2));
