import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {loadCurrentReleaseReviewHarness} from './roadmap-v2-release-review-harness.mjs';

function run(file,marker){
  const r=spawnSync(process.execPath,[file],{encoding:'utf8'});
  if(r.status!==0)throw new Error('B128 dependency gate failed: '+file+'\n'+r.stdout+'\n'+r.stderr);
  assert.match(r.stdout,marker,'B128 prerequisite marker missing: '+file);
}
run('scripts/validate-roadmap-v2-l32-b125.mjs',/ROADMAP_V2_L32_B125_RELEASE_REVIEW_CONTRACT=PASS/);
run('scripts/validate-roadmap-v2-l32-h1-release-review-binding.mjs',/ROADMAP_V2_L32_H1_RELEASE_REVIEW_BINDING=PASS/);
run('scripts/validate-roadmap-v2-l32-b126.mjs',/ROADMAP_V2_L32_B126_RELEASE_REVIEW_PROJECTOR=PASS/);
run('scripts/validate-roadmap-v2-l32-b127.mjs',/ROADMAP_V2_L32_B127_ADVERSARIAL_RELEASE_REVIEW=PASS/);

const release=loadCurrentReleaseReviewHarness();
const contract=release.contract;

assert.equal(contract.schema,'BAUMAN_ROADMAP_V2_RELEASE_REVIEW_CONTRACT_V1');
assert.equal(contract.version,'2.12.1-l32-b125-h1');
assert.equal(contract.acceptance.step,125);
assert.equal(contract.acceptance.currentTrack,'L32');
assert.equal(contract.acceptance.result,'PASS_B125_CONTRACT');
assert.equal(contract.mode.productionIntegration,'disconnected');
assert.equal(contract.mode.promotionReviewIntegration,'disconnected');
assert.equal(contract.mode.releaseReviewOnly,true);
assert.equal(contract.mode.productionPromotionEnabled,false);
for(const key of ['persistentStoreEnabled','dashboardUiEnabled','scheduleWriteAllowed','calendarWriteAllowed','runtimeWriteAllowed','notificationWriteAllowed','automaticActionAllowed'])assert.equal(contract.mode[key],false,'B128 forbidden Release Review mode enabled: '+key);
assert.equal(contract.candidatePolicy.requireNestedCandidateMatch,true);
assert.equal(contract.reviewPolicy.approvedDecisionAuthorizesProduction,false);
assert.equal(contract.reviewPolicy.manualProductionOverrideAllowed,false);
for(const key of ['productionPromotion','productionConsumerConnect','persistentStoreWrite','dashboardUiRender','scheduleWrite','calendarWrite','runtimeActivation','notificationWrite','automaticAction'])assert.equal(contract.capabilities[key],false,'B128 forbidden Release Review capability enabled: '+key);

function walk(dir){if(!fs.existsSync(dir))return [];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const p=path.posix.join(dir,entry.name);return entry.isDirectory()?walk(p):[p];});}
for(const p of walk('roadmap_v2'))assert.equal(/\.(?:js|mjs|cjs|html|css)$/i.test(p),false,'B128 executable/UI leaked into canonical Roadmap tree: '+p);

const runtimeFiles=[...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p));
for(const file of runtimeFiles){
  const text=fs.readFileSync(file,'utf8');
  for(const forbidden of ['roadmap-v2-release-review-harness.mjs','loadCurrentReleaseReviewHarness','roadmap_v2/release-review/current-contract.json','BAUMAN_ROADMAP_V2_RELEASE_REVIEW_CONTRACT_V1','BAUMAN_ROADMAP_V2_RELEASE_REVIEW_REQUEST_V1'])assert.equal(text.includes(forbidden),false,'B128 Release Review runtime wiring leaked: '+file+' -> '+forbidden);
}

const harnessSource=fs.readFileSync('scripts/roadmap-v2-release-review-harness.mjs','utf8');
for(const pattern of [/writeFileSync\s*\(/,/appendFileSync\s*\(/,/writeFile\s*\(/,/localStorage/,/sessionStorage/,/fetch\s*\(/,/XMLHttpRequest/,/child_process/,/spawn\s*\(/,/exec\s*\(/])assert.doesNotMatch(harnessSource,pattern,'B128 Release Review harness gained forbidden side effect: '+pattern);

const candidateRef='CANDIDATE::B128';
const red=release.projectReleaseReview({
  schema:'BAUMAN_ROADMAP_V2_RELEASE_REVIEW_REQUEST_V1',
  candidateRef,
  releaseReviewerRef:'RELEASE_REVIEWER::B128',
  reviewDecision:'approve_for_promotion_review',
  reasonCodes:['B128_CLOSEOUT'],
  promotionEligibilityRequest:{
    schema:'BAUMAN_ROADMAP_V2_PROMOTION_ELIGIBILITY_REQUEST_V1',
    candidateRef,
    humanReviewRequest:{
      schema:'BAUMAN_ROADMAP_V2_HUMAN_REVIEW_REQUEST_V1',
      reviewerRef:'REVIEWER::B128',
      reviewDecision:'accepted_for_shadow_analysis',
      reasonCodes:['B128_UPSTREAM'],
      consumerAdmissionRequest:{
        schema:'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V1',
        consumerId:'SHADOW::HUMAN_REVIEW',
        consumerClass:'human_review_shadow',
        readinessRequest:{
          schema:'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1',
          reportId:'B128::READINESS::RED',
          phaseId:'GD2',
          focusTargetIds:['RU-R0-C01'],
          scheduleRequest:{
            schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',
            requestId:'B128::SCHEDULE::RED',
            phaseId:'GD2',
            weekStart:'2026-09-21',
            weeklyCapacityMinutes:600,
            items:[]
          },
          externalGates:[]
        }
      }
    }
  }
});
assert.equal(red.candidateRef,candidateRef);
assert.equal(red.releaseReviewerRef,'RELEASE_REVIEWER::B128');
assert.equal(red.submittedReviewDecision,'approve_for_promotion_review');
assert.deepEqual(red.reasonCodes,['B128_CLOSEOUT']);
assert.equal(red.sourceEligibilityState,'not_eligible_upstream_blocked');
assert.equal(red.effectiveReleaseReviewState,'release_review_blocked_upstream');
assert.equal(red.promotionReviewEligible,false);
for(const key of ['persisted','productionPromotionAuthorized','productionConsumerConnected','runtimeActionAuthorized','scheduleWriteAllowed','notificationWriteAllowed'])assert.equal(red[key],false,'B128 output authority widened: '+key);
assert(Object.isFrozen(red)&&Object.isFrozen(red.reasonCodes));

console.log('ROADMAP_V2_L32_B128_CLOSEOUT=PASS');
console.log(JSON.stringify({priorSteps:{B125:'PASS',H1:'PASS',B126:'PASS',B127:'PASS_28_OF_28'},releaseReviewContract:contract.schema,canonicalExecutableFiles:0,runtimeWiring:0,promotionReviewIntegration:'disconnected',productionConsumers:0,productionPromotion:false,persistence:false,dashboardUi:false,scheduleWrite:false,calendarWrite:false,runtimeActivation:false,notificationWrite:false,automaticAction:false,productionIntegration:'disconnected',next:'L33 only after B128 and documentation/final-state closeout heads pass the complete six-gate set'},null,2));
