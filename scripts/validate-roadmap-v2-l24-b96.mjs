import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {buildCurrentPrerequisitePolicy} from './roadmap-v2-prerequisite-policy.mjs';
import {loadCurrentMasteryHarness} from './roadmap-v2-mastery-harness.mjs';

function run(file){
  const r=spawnSync(process.execPath,[file],{encoding:'utf8'});
  if(r.status!==0)throw new Error(`B96 dependency gate failed: ${file}\n${r.stdout}\n${r.stderr}`);
  return r.stdout;
}
assert.match(run('scripts/validate-roadmap-v2-l24-b93.mjs'),/ROADMAP_V2_L24_B93_MASTERY_CONTRACT=PASS/);
assert.match(run('scripts/validate-roadmap-v2-l24-b94.mjs'),/ROADMAP_V2_L24_B94_EVIDENCE_REDUCER=PASS/);
assert.match(run('scripts/validate-roadmap-v2-l24-h1-prerequisite-policy.mjs'),/ROADMAP_V2_L24_H1_PREREQUISITE_POLICY=PASS/);
assert.match(run('scripts/validate-roadmap-v2-l24-b95.mjs'),/ROADMAP_V2_L24_B95_MASTERY_PREREQUISITE_GATES=PASS/);

const mastery=loadCurrentMasteryHarness();
const policyA=buildCurrentPrerequisitePolicy();
const policyB=buildCurrentPrerequisitePolicy();
assert.deepEqual(policyA,policyB,'B96 prerequisite policy is not deterministic');

assert.equal(mastery.contract.schema,'BAUMAN_ROADMAP_V2_MASTERY_CONTRACT_V2');
assert.equal(mastery.contract.mode.productionIntegration,'disconnected');
assert.equal(mastery.contract.mode.persistentStoreEnabled,false);
assert.equal(mastery.contract.capabilities.persistentStoreWrite,false);
assert.equal(mastery.contract.capabilities.priorityEngineWrite,false);
assert.equal(mastery.contract.capabilities.schedulerWrite,false);
assert.equal(mastery.contract.capabilities.runtimeActivation,false);
assert.equal(mastery.contract.upstream.manifestDependencyRequired,false);
assert.equal(mastery.contract.upstream.staleHistoricalManifestAccepted,false);

assert.equal(mastery.prerequisitePolicy.validation.result,'PASS');
assert.equal(mastery.prerequisitePolicy.mode.productionIntegration,'disconnected');
assert.equal(mastery.prerequisitePolicy.mode.persistenceEnabled,false);
assert.equal(mastery.prerequisitePolicy.mode.runtimeActivation,false);

assert.equal(fs.existsSync('roadmap_v2/mastery/manifest.json'),false);
assert.equal(fs.existsSync('roadmap_v2/graph/prerequisite-graph.json'),false);
assert.equal(fs.existsSync('roadmap_v2/consumer/manifest.json'),false);
assert.equal(fs.existsSync('roadmap_v2/diagnostic/manifest.json'),false);
assert.equal(fs.existsSync('roadmap_v2/migration/migration-contract.json'),false);

function walk(dir){
  if(!fs.existsSync(dir))return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const p=path.posix.join(dir,entry.name);
    return entry.isDirectory()?walk(p):[p];
  });
}
const canonical=walk('roadmap_v2');
for(const p of canonical){
  assert.equal(/\.(js|mjs|cjs|html|css)$/.test(p),false,`canonical Roadmap executable/UI leaked at B96: ${p}`);
}

const serialized=[
  mastery.contract,
  mastery.blueprint,
  mastery.diagnostic,
  mastery.catalog,
  mastery.prerequisitePolicy
].map(JSON.stringify).join('\n');
for(const forbidden of [
  'e383912354673bdce7a0059d6b9a23799d74e689',
  'consumerManifestSha256',
  'diagnosticManifest',
  '"generatedAt"'
]){
  assert.equal(serialized.includes(forbidden),false,`stale/non-deterministic dependency leaked at B96: ${forbidden}`);
}

assert.equal(mastery.blueprint.validation.result,'PASS');
assert.equal(mastery.blueprint.counts.diagnosticTargets,381);
assert.equal(mastery.catalog.counts.plans,381);
assert.equal(mastery.catalog.counts.verifiedItemBanks,0);
assert.equal(mastery.catalog.counts.executablePlans,0);
assert.equal(mastery.catalog.counts.generatedQuestionItems,0);

console.log('ROADMAP_V2_L24_B96_CLOSEOUT=PASS');
console.log(JSON.stringify({
  priorSteps:{B93:'PASS',B94:'PASS',H1:'PASS',B95:'PASS'},
  masteryContract:'V2',
  diagnosticTargets:381,
  verifiedItemBanks:0,
  executablePlans:0,
  generatedQuestionItems:0,
  prerequisitePolicyDeterministic:true,
  historicalManifestsAdmitted:0,
  historicalGraphAdmitted:false,
  persistence:false,
  priorityEngine:false,
  scheduler:false,
  runtimeActivation:false,
  productionIntegration:'disconnected',
  next:'L25 only after complete six-gate CI passes on this closeout head'
},null,2));
