import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {loadCurrentPromotionEligibilityHarness} from './roadmap-v2-promotion-eligibility-harness.mjs';

function run(file,marker){
  const r=spawnSync(process.execPath,[file],{encoding:'utf8'});
  if(r.status!==0)throw new Error('B124 dependency gate failed: '+file+'\n'+r.stdout+'\n'+r.stderr);
  assert.match(r.stdout,marker,'B124 prerequisite marker missing: '+file);
}
run('scripts/validate-roadmap-v2-l31-b121.mjs',/ROADMAP_V2_L31_B121_PROMOTION_ELIGIBILITY_CONTRACT=PASS/);
run('scripts/validate-roadmap-v2-l31-b122.mjs',/ROADMAP_V2_L31_B122_PROMOTION_ELIGIBILITY_PROJECTOR=PASS/);
run('scripts/validate-roadmap-v2-l31-b123.mjs',/ROADMAP_V2_L31_B123_ADVERSARIAL_PROMOTION_ELIGIBILITY=PASS/);

const promotion=loadCurrentPromotionEligibilityHarness();
const contract=promotion.contract;

assert.equal(contract.schema,'BAUMAN_ROADMAP_V2_PROMOTION_ELIGIBILITY_CONTRACT_V1');
assert.equal(contract.version,'2.11.0-l31-b121');
assert.equal(contract.acceptance.step,121);
assert.equal(contract.acceptance.currentTrack,'L31');
assert.equal(contract.acceptance.result,'PASS_B121_CONTRACT');
assert.equal(contract.mode.productionIntegration,'disconnected');
assert.equal(contract.mode.releaseReviewIntegration,'disconnected');
assert.equal(contract.mode.productionPromotionEnabled,false);
for(const key of ['persistentStoreEnabled','dashboardUiEnabled','scheduleWriteAllowed','calendarWriteAllowed','runtimeWriteAllowed','notificationWriteAllowed','automaticActionAllowed'])assert.equal(contract.mode[key],false,'B124 forbidden Promotion Eligibility mode enabled: '+key);
assert.equal(contract.eligibilityPolicy.eligibleStateAuthorizesReleaseReview,false);
assert.equal(contract.eligibilityPolicy.eligibleStateAuthorizesProduction,false);
for(const key of ['releaseReviewAuthorize','productionPromotion','productionConsumerConnect','persistentStoreWrite','dashboardUiRender','scheduleWrite','calendarWrite','runtimeActivation','notificationWrite','automaticAction'])assert.equal(contract.capabilities[key],false,'B124 forbidden Promotion Eligibility capability enabled: '+key);

function walk(dir){if(!fs.existsSync(dir))return [];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const p=path.posix.join(dir,entry.name);return entry.isDirectory()?walk(p):[p];});}
for(const p of walk('roadmap_v2'))assert.equal(/\.(?:js|mjs|cjs|html|css)$/i.test(p),false,'B124 executable/UI leaked into canonical Roadmap tree: '+p);

const runtimeFiles=[...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p));
for(const file of runtimeFiles){
  const text=fs.readFileSync(file,'utf8');
  for(const forbidden of ['roadmap-v2-promotion-eligibility-harness.mjs','loadCurrentPromotionEligibilityHarness','roadmap_v2/promotion-eligibility/current-contract.json','BAUMAN_ROADMAP_V2_PROMOTION_ELIGIBILITY_CONTRACT_V1','BAUMAN_ROADMAP_V2_PROMOTION_ELIGIBILITY_REQUEST_V1'])assert.equal(text.includes(forbidden),false,'B124 Promotion Eligibility runtime wiring leaked: '+file+' -> '+forbidden);
}

const harnessSource=fs.readFileSync('scripts/roadmap-v2-promotion-eligibility-harness.mjs','utf8');
for(const pattern of [/writeFileSync\s*\(/,/appendFileSync\s*\(/,/writeFile\s*\(/,/localStorage/,/sessionStorage/,/fetch\s*\(/,/XMLHttpRequest/,/child_process/,/spawn\s*\(/,/exec\s*\(/])assert.doesNotMatch(harnessSource,pattern,'B124 Promotion Eligibility harness gained forbidden side effect: '+pattern);

const red=promotion.projectEligibility({
  schema:'BAUMAN_ROADMAP_V2_PROMOTION_ELIGIBILITY_REQUEST_V1',
  candidateRef:'CANDIDATE::B124',
  humanReviewRequest:{
    schema:'BAUMAN_ROADMAP_V2_HUMAN_REVIEW_REQUEST_V1',
    reviewerRef:'REVIEWER::B124',
    reviewDecision:'accepted_for_shadow_analysis',
    reasonCodes:['B124_CLOSEOUT'],
    consumerAdmissionRequest:{
      schema:'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V1',
      consumerId:'SHADOW::HUMAN_REVIEW',
      consumerClass:'human_review_shadow',
      readinessRequest:{
        schema:'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1',
        reportId:'B124::READINESS::RED',
        phaseId:'GD2',
        focusTargetIds:['RU-R0-C01'],
        scheduleRequest:{
          schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',
          requestId:'B124::SCHEDULE::RED',
          phaseId:'GD2',
          weekStart:'2026-09-21',
          weeklyCapacityMinutes:600,
          items:[]
        },
        externalGates:[]
      }
    }
  }
});
assert.equal(red.sourceReadinessColor,'red');
assert.equal(red.sourceHumanReviewState,'review_blocked_upstream');
assert.equal(red.eligibilityState,'not_eligible_upstream_blocked');
for(const key of ['persisted','releaseReviewAuthorized','productionPromotionAuthorized','productionConsumerConnected','runtimeActionAuthorized','scheduleWriteAllowed','notificationWriteAllowed'])assert.equal(red[key],false,'B124 output authority widened: '+key);
assert(Object.isFrozen(red));

console.log('ROADMAP_V2_L31_B124_CLOSEOUT=PASS');
console.log(JSON.stringify({priorSteps:{B121:'PASS',B122:'PASS',B123:'PASS_24_OF_24'},promotionEligibilityContract:contract.schema,canonicalExecutableFiles:0,runtimeWiring:0,releaseReviewAuthorized:false,productionConsumers:0,productionPromotion:false,persistence:false,dashboardUi:false,scheduleWrite:false,calendarWrite:false,runtimeActivation:false,notificationWrite:false,automaticAction:false,productionIntegration:'disconnected',next:'L32 only after B124 and documentation/final-state closeout heads pass the complete six-gate set'},null,2));
