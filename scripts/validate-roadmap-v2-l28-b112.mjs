import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {loadCurrentAdmissionHarness} from './roadmap-v2-admission-harness.mjs';

function run(file,marker){
  const r=spawnSync(process.execPath,[file],{encoding:'utf8'});
  if(r.status!==0)throw new Error(`B112 dependency gate failed: ${file}\n${r.stdout}\n${r.stderr}`);
  assert.match(r.stdout,marker,`B112 prerequisite marker missing: ${file}`);
}
run('scripts/validate-roadmap-v2-l28-b109.mjs',/ROADMAP_V2_L28_B109_ADMISSION_CONTRACT=PASS/);
run('scripts/validate-roadmap-v2-l28-b110.mjs',/ROADMAP_V2_L28_B110_ADVISORY_PROJECTOR=PASS/);
run('scripts/validate-roadmap-v2-l28-b111.mjs',/ROADMAP_V2_L28_B111_ADVERSARIAL_ADMISSION=PASS/);

const admission=loadCurrentAdmissionHarness();
const contract=admission.contract;

assert.equal(contract.schema,'BAUMAN_ROADMAP_V2_ADMISSION_CONTRACT_V1');
assert.equal(contract.version,'2.8.0-l28-b109');
assert.equal(contract.acceptance.step,109);
assert.equal(contract.acceptance.currentTrack,'L28');
assert.equal(contract.acceptance.result,'PASS_B109_CONTRACT');
assert.equal(contract.mode.productionIntegration,'disconnected');
assert.equal(contract.mode.consumerAdapterEnabled,false);
assert.equal(contract.mode.persistentStoreEnabled,false);
assert.equal(contract.mode.dashboardUiEnabled,false);
assert.equal(contract.mode.scheduleWriteAllowed,false);
assert.equal(contract.mode.calendarWriteAllowed,false);
assert.equal(contract.mode.runtimeWriteAllowed,false);
assert.equal(contract.mode.notificationWriteAllowed,false);
assert.equal(contract.mode.automaticActionAllowed,false);
assert.deepEqual(contract.consumerPolicy.productionConsumerIds,[]);
assert.equal(contract.consumerPolicy.planningBridgeAdmitted,false);
assert.equal(contract.consumerPolicy.safeShellAdmitted,false);
assert.equal(contract.consumerPolicy.subjectRuntimeAdmitted,false);
assert.equal(contract.consumerPolicy.directUiRenderAdmitted,false);
assert.equal(contract.consumerPolicy.futureConsumerRequiresSeparateAdmissionGate,true);

for(const key of ['productionConsumerConnect','persistentStoreWrite','dashboardUiRender','scheduleWrite','calendarWrite','runtimeActivation','notificationWrite','automaticAction']){
  assert.equal(contract.capabilities[key],false,`B112 forbidden Admission capability enabled: ${key}`);
}

function walk(dir){
  if(!fs.existsSync(dir))return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const p=path.posix.join(dir,entry.name);
    return entry.isDirectory()?walk(p):[p];
  });
}

for(const p of walk('roadmap_v2')){
  assert.equal(/\.(?:js|mjs|cjs|html|css)$/i.test(p),false,`B112 executable/UI leaked into canonical Roadmap tree: ${p}`);
}

const runtimeFiles=[
  ...(fs.existsSync('index.html')?['index.html']:[]),
  ...walk('assets'),
  ...walk('subjects')
].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p));

for(const file of runtimeFiles){
  const text=fs.readFileSync(file,'utf8');
  for(const forbidden of [
    'roadmap-v2-admission-harness.mjs',
    'loadCurrentAdmissionHarness',
    'roadmap_v2/admission/current-contract.json',
    'BAUMAN_ROADMAP_V2_ADMISSION_CONTRACT_V1'
  ]){
    assert.equal(text.includes(forbidden),false,`B112 Admission runtime wiring leaked: ${file} -> ${forbidden}`);
  }
}

const harnessSource=fs.readFileSync('scripts/roadmap-v2-admission-harness.mjs','utf8');
for(const pattern of [
  /writeFileSync\s*\(/,/appendFileSync\s*\(/,/writeFile\s*\(/,
  /localStorage/,/sessionStorage/,/fetch\s*\(/,/XMLHttpRequest/,
  /child_process/,/spawn\s*\(/,/exec\s*\(/
]){
  assert.doesNotMatch(harnessSource,pattern,`B112 Admission harness gained forbidden side effect: ${pattern}`);
}

const red=admission.projectAdvisory({
  schema:'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1',
  reportId:'B112::CLOSEOUT::RED',
  phaseId:'GD2',
  focusTargetIds:['RU-R0-C01'],
  scheduleRequest:{
    schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',
    requestId:'B112::SCHEDULE::RED',
    phaseId:'GD2',
    weekStart:'2026-09-21',
    weeklyCapacityMinutes:600,
    items:[]
  },
  externalGates:[]
});
assert.equal(red.readinessColor,'red');
assert.equal(red.advisoryState,'blocked');
assert.equal(red.persisted,false);
assert.equal(red.productionConsumerConnected,false);
assert.equal(red.runtimeActionAuthorized,false);
assert.equal(red.scheduleWriteAllowed,false);
assert.equal(red.notificationWriteAllowed,false);
assert(Object.isFrozen(red));

console.log('ROADMAP_V2_L28_B112_CLOSEOUT=PASS');
console.log(JSON.stringify({
  priorSteps:{B109:'PASS',B110:'PASS',B111:'PASS'},
  admissionContract:contract.schema,
  canonicalExecutableFiles:0,
  runtimeWiring:0,
  productionConsumers:0,
  persistence:false,
  dashboardUi:false,
  scheduleWrite:false,
  calendarWrite:false,
  runtimeActivation:false,
  notificationWrite:false,
  automaticAction:false,
  productionIntegration:'disconnected',
  next:'L29 only after complete six-gate CI passes on B112 and documentation/final-state closeout'
},null,2));
