import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {loadCurrentReadinessHarness} from './roadmap-v2-readiness-harness.mjs';

function run(file,marker){
  const r=spawnSync(process.execPath,[file],{encoding:'utf8'});
  if(r.status!==0)throw new Error(`B108 dependency gate failed: ${file}\n${r.stdout}\n${r.stderr}`);
  assert.match(r.stdout,marker,`B108 prerequisite marker missing: ${file}`);
  return r.stdout;
}
run('scripts/validate-roadmap-v2-l27-b105.mjs',/ROADMAP_V2_L27_B105_READINESS_CONTRACT=PASS/);
run('scripts/validate-roadmap-v2-l27-b106.mjs',/ROADMAP_V2_L27_B106_READINESS_PROJECTOR=PASS/);
run('scripts/validate-roadmap-v2-l27-b107.mjs',/ROADMAP_V2_L27_B107_ADVERSARIAL_READINESS=PASS/);

const readiness=loadCurrentReadinessHarness();
assert.equal(readiness.contract.schema,'BAUMAN_ROADMAP_V2_READINESS_CONTRACT_V1');
assert.equal(readiness.contract.acceptance.step,108);
assert.equal(readiness.contract.acceptance.result,'PASS_CLOSEOUT_PENDING_FINAL_STATE_GATE');
assert.equal(readiness.contract.mode.productionIntegration,'disconnected');
assert.equal(readiness.contract.mode.persistentStoreEnabled,false);
assert.equal(readiness.contract.mode.dashboardUiEnabled,false);
assert.equal(readiness.contract.mode.runtimeWriteAllowed,false);
assert.equal(readiness.contract.mode.notificationWriteAllowed,false);
assert.equal(readiness.contract.overallPolicy.manualOverrideAllowed,false);
assert.equal(readiness.contract.externalGatePolicy.verifiedSourceRequired,true);
assert.equal(readiness.contract.externalGatePolicy.callerBooleanMapAccepted,false);
assert.equal(readiness.contract.outputPolicy.deepFrozen,true);
assert.equal(readiness.contract.outputPolicy.persistentSnapshot,false);

const historical=JSON.parse(fs.readFileSync('roadmap_v2/readiness/readiness-contract.json','utf8'));
assert.equal(historical.version,'2.7.0-l27-b105');
assert.equal(historical.upstreamSchemas.consumerManifest,'BAUMAN_ROADMAP_V2_CONSUMER_MANIFEST_V1');
assert.equal(historical.upstreamSchemas.masteryManifest,'BAUMAN_ROADMAP_V2_MASTERY_MANIFEST_V1');
assert.equal(historical.upstreamSchemas.schedulerManifest,'BAUMAN_ROADMAP_V2_SCHEDULER_MANIFEST_V1');

const currentText=fs.readFileSync('roadmap_v2/readiness/current-contract.json','utf8');
for(const forbidden of [
  'BAUMAN_ROADMAP_V2_CONSUMER_MANIFEST_V1',
  'BAUMAN_ROADMAP_V2_MASTERY_MANIFEST_V1',
  'BAUMAN_ROADMAP_V2_SCHEDULER_MANIFEST_V1'
]){
  assert.equal(currentText.includes(forbidden),false,`B108 current readiness boundary regained stale identity: ${forbidden}`);
}

function walk(dir){
  if(!fs.existsSync(dir))return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const p=path.posix.join(dir,entry.name);
    return entry.isDirectory()?walk(p):[p];
  });
}
for(const p of walk('roadmap_v2')){
  assert.equal(/\.(?:js|mjs|cjs|html|css)$/i.test(p),false,`B108 executable/UI leaked into canonical Roadmap tree: ${p}`);
}
for(const file of [
  ...(fs.existsSync('index.html')?['index.html']:[]),
  ...walk('assets'),
  ...walk('subjects')
].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p))){
  const text=fs.readFileSync(file,'utf8');
  assert.equal(text.includes('roadmap-v2-readiness-harness.mjs'),false,`B108 Readiness harness wired into runtime: ${file}`);
  assert.equal(text.includes('loadCurrentReadinessHarness'),false,`B108 Readiness activation leaked into runtime: ${file}`);
}

console.log('ROADMAP_V2_L27_B108_CLOSEOUT=PASS');
console.log(JSON.stringify({
  priorSteps:{B105:'PASS',B106:'PASS',B107:'PASS'},
  readinessContract:readiness.contract.schema,
  historicalReadinessPreserved:true,
  staleManifestDependencies:0,
  canonicalExecutableFiles:0,
  runtimeWiring:0,
  persistence:false,
  dashboardUi:false,
  runtimeActivation:false,
  notificationWrite:false,
  productionIntegration:'disconnected',
  next:'L28 only after complete six-gate CI passes on this closeout head'
},null,2));
