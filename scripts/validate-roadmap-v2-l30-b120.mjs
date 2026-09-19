import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {loadCurrentHumanReviewHarness} from './roadmap-v2-human-review-harness.mjs';

function run(file,marker){
  const r=spawnSync(process.execPath,[file],{encoding:'utf8'});
  if(r.status!==0)throw new Error('B120 dependency gate failed: '+file+'\n'+r.stdout+'\n'+r.stderr);
  assert.match(r.stdout,marker,'B120 prerequisite marker missing: '+file);
}
run('scripts/validate-roadmap-v2-l30-b117.mjs',/ROADMAP_V2_L30_B117_HUMAN_REVIEW_CONTRACT=PASS/);
run('scripts/validate-roadmap-v2-l30-b118.mjs',/ROADMAP_V2_L30_B118_HUMAN_REVIEW_PROJECTOR=PASS/);
run('scripts/validate-roadmap-v2-l30-b119.mjs',/ROADMAP_V2_L30_B119_ADVERSARIAL_HUMAN_REVIEW=PASS/);

const review=loadCurrentHumanReviewHarness();
const contract=review.contract;

assert.equal(contract.schema,'BAUMAN_ROADMAP_V2_HUMAN_REVIEW_CONTRACT_V1');
assert.equal(contract.version,'2.10.0-l30-b117');
assert.equal(contract.acceptance.step,117);
assert.equal(contract.acceptance.currentTrack,'L30');
assert.equal(contract.acceptance.result,'PASS_B117_CONTRACT');
assert.equal(contract.mode.productionIntegration,'disconnected');
assert.equal(contract.mode.humanReviewOnly,true);
assert.equal(contract.mode.productionPromotionEnabled,false);
for(const key of ['persistentStoreEnabled','dashboardUiEnabled','scheduleWriteAllowed','calendarWriteAllowed','runtimeWriteAllowed','notificationWriteAllowed','automaticActionAllowed'])assert.equal(contract.mode[key],false,'B120 forbidden Human Review mode enabled: '+key);
assert.equal(contract.reviewPolicy.acceptedDecisionAuthorizesProduction,false);
assert.equal(contract.reviewPolicy.manualProductionOverrideAllowed,false);
for(const key of ['productionPromotion','productionConsumerConnect','persistentStoreWrite','dashboardUiRender','scheduleWrite','calendarWrite','runtimeActivation','notificationWrite','automaticAction'])assert.equal(contract.capabilities[key],false,'B120 forbidden Human Review capability enabled: '+key);

function walk(dir){if(!fs.existsSync(dir))return [];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const p=path.posix.join(dir,entry.name);return entry.isDirectory()?walk(p):[p];});}
for(const p of walk('roadmap_v2'))assert.equal(/\.(?:js|mjs|cjs|html|css)$/i.test(p),false,'B120 executable/UI leaked into canonical Roadmap tree: '+p);

const runtimeFiles=[...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p));
for(const file of runtimeFiles){
  const text=fs.readFileSync(file,'utf8');
  for(const forbidden of ['roadmap-v2-human-review-harness.mjs','loadCurrentHumanReviewHarness','roadmap_v2/human-review/current-contract.json','BAUMAN_ROADMAP_V2_HUMAN_REVIEW_CONTRACT_V1','BAUMAN_ROADMAP_V2_HUMAN_REVIEW_REQUEST_V1'])assert.equal(text.includes(forbidden),false,'B120 Human Review runtime wiring leaked: '+file+' -> '+forbidden);
}

const harnessSource=fs.readFileSync('scripts/roadmap-v2-human-review-harness.mjs','utf8');
for(const pattern of [/writeFileSync\s*\(/,/appendFileSync\s*\(/,/writeFile\s*\(/,/localStorage/,/sessionStorage/,/fetch\s*\(/,/XMLHttpRequest/,/child_process/,/spawn\s*\(/,/exec\s*\(/])assert.doesNotMatch(harnessSource,pattern,'B120 Human Review harness gained forbidden side effect: '+pattern);

const red=review.projectHumanReview({
  schema:'BAUMAN_ROADMAP_V2_HUMAN_REVIEW_REQUEST_V1',reviewerRef:'REVIEWER::B120',reviewDecision:'accepted_for_shadow_analysis',reasonCodes:['B120_CLOSEOUT'],
  consumerAdmissionRequest:{schema:'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V1',consumerId:'SHADOW::HUMAN_REVIEW',consumerClass:'human_review_shadow',readinessRequest:{schema:'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1',reportId:'B120::CLOSEOUT::RED',phaseId:'GD2',focusTargetIds:['RU-R0-C01'],scheduleRequest:{schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',requestId:'B120::SCHEDULE::RED',phaseId:'GD2',weekStart:'2026-09-21',weeklyCapacityMinutes:600,items:[]},externalGates:[]}}
});
assert.equal(red.sourceReadinessColor,'red');
assert.equal(red.effectiveReviewState,'review_blocked_upstream');
assert.equal(red.persisted,false);
assert.equal(red.productionPromotionAuthorized,false);
assert.equal(red.productionConsumerConnected,false);
assert.equal(red.runtimeActionAuthorized,false);
assert.equal(red.scheduleWriteAllowed,false);
assert.equal(red.notificationWriteAllowed,false);
assert(Object.isFrozen(red));

console.log('ROADMAP_V2_L30_B120_CLOSEOUT=PASS');
console.log(JSON.stringify({priorSteps:{B117:'PASS',B118:'PASS',B119:'PASS_23_OF_23'},humanReviewContract:contract.schema,canonicalExecutableFiles:0,runtimeWiring:0,productionConsumers:0,productionPromotion:false,persistence:false,dashboardUi:false,scheduleWrite:false,calendarWrite:false,runtimeActivation:false,notificationWrite:false,automaticAction:false,productionIntegration:'disconnected',next:'L31 only after B120 and documentation/final-state closeout heads pass the complete six-gate set'},null,2));
