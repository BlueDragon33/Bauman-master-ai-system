import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {loadCurrentConsumerAdmissionHarness} from './roadmap-v2-consumer-admission-harness.mjs';

function run(file,marker){
  const r=spawnSync(process.execPath,[file],{encoding:'utf8'});
  if(r.status!==0)throw new Error('B116 dependency gate failed: '+file+'\n'+r.stdout+'\n'+r.stderr);
  assert.match(r.stdout,marker,'B116 prerequisite marker missing: '+file);
}
run('scripts/validate-roadmap-v2-l29-b113.mjs',/ROADMAP_V2_L29_B113_CONSUMER_ADMISSION_CONTRACT=PASS/);
run('scripts/validate-roadmap-v2-l29-h1-consumer-admission-request.mjs',/ROADMAP_V2_L29_H1_CONSUMER_ADMISSION_REQUEST=PASS/);
run('scripts/validate-roadmap-v2-l29-b114.mjs',/ROADMAP_V2_L29_B114_SHADOW_ADAPTER=PASS/);
run('scripts/validate-roadmap-v2-l29-b115.mjs',/ROADMAP_V2_L29_B115_ADVERSARIAL_CONSUMER_ADMISSION=PASS/);

const consumer=loadCurrentConsumerAdmissionHarness();
const contract=consumer.contract;

assert.equal(contract.schema,'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_CONTRACT_V1');
assert.equal(contract.version,'2.9.1-l29-b113-h1');
assert.equal(contract.acceptance.step,113);
assert.equal(contract.acceptance.currentTrack,'L29');
assert.equal(contract.acceptance.result,'PASS_B113_CONTRACT');
assert.equal(contract.acceptance.requestSchemaPinned,true);
assert.equal(contract.mode.productionIntegration,'disconnected');
assert.equal(contract.mode.shadowConsumerOnly,true);
assert.equal(contract.mode.productionConsumerAdapterEnabled,false);
assert.equal(contract.mode.persistentStoreEnabled,false);
assert.equal(contract.mode.dashboardUiEnabled,false);
assert.equal(contract.mode.scheduleWriteAllowed,false);
assert.equal(contract.mode.calendarWriteAllowed,false);
assert.equal(contract.mode.runtimeWriteAllowed,false);
assert.equal(contract.mode.notificationWriteAllowed,false);
assert.equal(contract.mode.automaticActionAllowed,false);
assert.deepEqual(contract.candidatePolicy.productionConsumerIds,[]);
assert.deepEqual(contract.candidatePolicy.allowedShadowConsumerClasses,['human_review_shadow']);
assert.equal(contract.candidatePolicy.planningBridgeAdmitted,false);
assert.equal(contract.candidatePolicy.safeShellAdmitted,false);
assert.equal(contract.candidatePolicy.subjectRuntimeAdmitted,false);
assert.equal(contract.candidatePolicy.directUiRenderAdmitted,false);
assert.equal(contract.candidatePolicy.manualOverrideAllowed,false);

for(const key of ['productionConsumerConnect','persistentStoreWrite','dashboardUiRender','scheduleWrite','calendarWrite','runtimeActivation','notificationWrite','automaticAction']){
  assert.equal(contract.capabilities[key],false,'B116 forbidden Consumer Admission capability enabled: '+key);
}

function walk(dir){
  if(!fs.existsSync(dir))return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const p=path.posix.join(dir,entry.name);
    return entry.isDirectory()?walk(p):[p];
  });
}

for(const p of walk('roadmap_v2')){
  assert.equal(/\.(?:js|mjs|cjs|html|css)$/i.test(p),false,'B116 executable/UI leaked into canonical Roadmap tree: '+p);
}

const runtimeFiles=[...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p));
for(const file of runtimeFiles){
  const text=fs.readFileSync(file,'utf8');
  for(const forbidden of [
    'roadmap-v2-consumer-admission-harness.mjs',
    'loadCurrentConsumerAdmissionHarness',
    'roadmap_v2/consumer-admission/current-contract.json',
    'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_CONTRACT_V1',
    'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V1'
  ])assert.equal(text.includes(forbidden),false,'B116 Consumer Admission runtime wiring leaked: '+file+' -> '+forbidden);
}

const harnessSource=fs.readFileSync('scripts/roadmap-v2-consumer-admission-harness.mjs','utf8');
for(const pattern of [/writeFileSync\s*\(/,/appendFileSync\s*\(/,/writeFile\s*\(/,/localStorage/,/sessionStorage/,/fetch\s*\(/,/XMLHttpRequest/,/child_process/,/spawn\s*\(/,/exec\s*\(/]){
  assert.doesNotMatch(harnessSource,pattern,'B116 Consumer Admission harness gained forbidden side effect: '+pattern);
}

const red=consumer.projectShadowConsumer({
  schema:'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V1',
  consumerId:'SHADOW::HUMAN_REVIEW',
  consumerClass:'human_review_shadow',
  readinessRequest:{
    schema:'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1',
    reportId:'B116::CLOSEOUT::RED',
    phaseId:'GD2',
    focusTargetIds:['RU-R0-C01'],
    scheduleRequest:{schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',requestId:'B116::SCHEDULE::RED',phaseId:'GD2',weekStart:'2026-09-21',weeklyCapacityMinutes:600,items:[]},
    externalGates:[]
  }
});
assert.equal(red.readinessColor,'red');
assert.equal(red.advisoryState,'blocked');
assert.equal(red.consumerDecision,'shadow_review_blocked');
assert.equal(red.persisted,false);
assert.equal(red.productionConsumerConnected,false);
assert.equal(red.runtimeActionAuthorized,false);
assert.equal(red.scheduleWriteAllowed,false);
assert.equal(red.notificationWriteAllowed,false);
assert(Object.isFrozen(red));

console.log('ROADMAP_V2_L29_B116_CLOSEOUT=PASS');
console.log(JSON.stringify({
  priorSteps:{B113:'PASS',H1:'PASS',B114:'PASS',B115:'PASS'},
  consumerAdmissionContract:contract.schema,
  canonicalExecutableFiles:0,runtimeWiring:0,productionConsumers:0,
  persistence:false,dashboardUi:false,scheduleWrite:false,calendarWrite:false,
  runtimeActivation:false,notificationWrite:false,automaticAction:false,
  productionIntegration:'disconnected',
  next:'L30 only after B116 and documentation/final-state closeout heads pass the complete six-gate set'
},null,2));
