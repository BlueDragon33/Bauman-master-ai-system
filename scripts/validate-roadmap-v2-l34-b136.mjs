import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {loadCurrentProductionReadinessReviewHarness} from './roadmap-v2-production-readiness-review-harness.mjs';

function run(file,marker){
  const r=spawnSync(process.execPath,[file],{encoding:'utf8'});
  if(r.status!==0)throw new Error('B136 dependency gate failed: '+file+'\n'+r.stdout+'\n'+r.stderr);
  assert.match(r.stdout,marker,'B136 prerequisite marker missing: '+file);
}
run('scripts/validate-roadmap-v2-l34-b133.mjs',/ROADMAP_V2_L34_B133_PRODUCTION_READINESS_REVIEW_CONTRACT=PASS/);
run('scripts/validate-roadmap-v2-l34-b134.mjs',/ROADMAP_V2_L34_B134_PRODUCTION_READINESS_REVIEW_PROJECTOR=PASS/);
run('scripts/validate-roadmap-v2-l34-b135.mjs',/ROADMAP_V2_L34_B135_ADVERSARIAL_PRODUCTION_READINESS_REVIEW=PASS/);

const review=loadCurrentProductionReadinessReviewHarness();
const contract=review.contract;

assert.equal(contract.schema,'BAUMAN_ROADMAP_V2_PRODUCTION_READINESS_REVIEW_CONTRACT_V1');
assert.equal(contract.version,'2.14.0-l34-b133');
assert.equal(contract.acceptance.step,133);
assert.equal(contract.acceptance.currentTrack,'L34');
assert.equal(contract.acceptance.result,'PASS_B133_CONTRACT');
assert.equal(contract.mode.productionIntegration,'disconnected');
assert.equal(contract.mode.productionReadinessReviewOnly,true);
assert.equal(contract.mode.productionPromotionEnabled,false);
for(const key of ['persistentStoreEnabled','dashboardUiEnabled','scheduleWriteAllowed','calendarWriteAllowed','runtimeWriteAllowed','notificationWriteAllowed','automaticActionAllowed']){
  assert.equal(contract.mode[key],false,'B136 forbidden Production Readiness Review mode enabled: '+key);
}
assert.equal(contract.candidatePolicy.recomputePromotionReviewFromRequest,true);
assert.equal(contract.candidatePolicy.acceptCallerSuppliedPromotionReviewResult,false);
assert.equal(contract.candidatePolicy.acceptCallerSuppliedProductionReadinessReviewEligibility,false);
assert.equal(contract.candidatePolicy.requireProductionReadinessReviewEligible,true);
assert.equal(contract.candidatePolicy.manualEligibilityOverrideAllowed,false);
assert.equal(contract.candidatePolicy.requireNestedCandidateMatch,true);
assert.equal(contract.reviewPolicy.approvedDecisionAuthorizesProduction,false);
assert.equal(contract.reviewPolicy.manualProductionOverrideAllowed,false);
for(const key of ['productionPromotion','productionConsumerConnect','persistentStoreWrite','dashboardUiRender','scheduleWrite','calendarWrite','runtimeActivation','notificationWrite','automaticAction']){
  assert.equal(contract.capabilities[key],false,'B136 forbidden Production Readiness Review capability enabled: '+key);
}

function walk(dir){if(!fs.existsSync(dir))return [];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const p=path.posix.join(dir,entry.name);return entry.isDirectory()?walk(p):[p];});}
for(const p of walk('roadmap_v2'))assert.equal(/\.(?:js|mjs|cjs|html|css)$/i.test(p),false,'B136 executable/UI leaked into canonical Roadmap tree: '+p);

const runtimeFiles=[...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p));
for(const file of runtimeFiles){
  const text=fs.readFileSync(file,'utf8');
  for(const forbidden of [
    'roadmap-v2-production-readiness-review-harness.mjs',
    'loadCurrentProductionReadinessReviewHarness',
    'roadmap_v2/production-readiness-review/current-contract.json',
    'BAUMAN_ROADMAP_V2_PRODUCTION_READINESS_REVIEW_CONTRACT_V1',
    'BAUMAN_ROADMAP_V2_PRODUCTION_READINESS_REVIEW_REQUEST_V1'
  ])assert.equal(text.includes(forbidden),false,'B136 Production Readiness Review runtime wiring leaked: '+file+' -> '+forbidden);
}

const harnessSource=fs.readFileSync('scripts/roadmap-v2-production-readiness-review-harness.mjs','utf8');
for(const pattern of [/writeFileSync\s*\(/,/appendFileSync\s*\(/,/writeFile\s*\(/,/localStorage/,/sessionStorage/,/fetch\s*\(/,/XMLHttpRequest/,/child_process/,/spawn\s*\(/,/exec\s*\(/]){
  assert.doesNotMatch(harnessSource,pattern,'B136 Production Readiness Review harness gained forbidden side effect: '+pattern);
}

const candidateRef='CANDIDATE::B136';
const out=review.projectProductionReadinessReview({
  schema:'BAUMAN_ROADMAP_V2_PRODUCTION_READINESS_REVIEW_REQUEST_V1',
  candidateRef,
  productionReadinessReviewerRef:'PRODUCTION_READINESS_REVIEWER::B136',
  reviewDecision:'approve_shadow_readiness',
  reasonCodes:['B136_CLOSEOUT'],
  promotionReviewRequest:{
    schema:'BAUMAN_ROADMAP_V2_PROMOTION_REVIEW_REQUEST_V1',
    candidateRef,
    promotionReviewerRef:'PROMOTION_REVIEWER::B136',
    reviewDecision:'approve_for_production_readiness_review',
    reasonCodes:['B136_PROMOTION'],
    releaseReviewRequest:{
      schema:'BAUMAN_ROADMAP_V2_RELEASE_REVIEW_REQUEST_V1',
      candidateRef,
      releaseReviewerRef:'RELEASE_REVIEWER::B136',
      reviewDecision:'approve_for_promotion_review',
      reasonCodes:['B136_RELEASE'],
      promotionEligibilityRequest:{
        schema:'BAUMAN_ROADMAP_V2_PROMOTION_ELIGIBILITY_REQUEST_V1',
        candidateRef,
        humanReviewRequest:{
          schema:'BAUMAN_ROADMAP_V2_HUMAN_REVIEW_REQUEST_V1',
          reviewerRef:'REVIEWER::B136',
          reviewDecision:'accepted_for_shadow_analysis',
          reasonCodes:['B136_HUMAN'],
          consumerAdmissionRequest:{
            schema:'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V1',
            consumerId:'SHADOW::HUMAN_REVIEW',
            consumerClass:'human_review_shadow',
            readinessRequest:{
              schema:'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1',
              reportId:'B136::READINESS::BLOCKED',
              phaseId:'GD2',
              focusTargetIds:['RU-R0-C01'],
              scheduleRequest:{
                schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',
                requestId:'B136::SCHEDULE::BLOCKED',
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
    }
  }
});

assert.equal(out.candidateRef,candidateRef);
assert.equal(out.productionReadinessReviewerRef,'PRODUCTION_READINESS_REVIEWER::B136');
assert.equal(out.submittedReviewDecision,'approve_shadow_readiness');
assert.deepEqual(out.reasonCodes,['B136_CLOSEOUT']);
assert.equal(out.sourcePromotionReviewState,'promotion_review_blocked_upstream');
assert.equal(out.effectiveProductionReadinessReviewState,'production_readiness_review_blocked_upstream');
assert.equal(out.shadowProductionReady,false);
for(const key of ['persisted','productionPromotionAuthorized','productionConsumerConnected','runtimeActionAuthorized','scheduleWriteAllowed','notificationWriteAllowed']){
  assert.equal(out[key],false,'B136 output authority widened: '+key);
}
assert(Object.isFrozen(out)&&Object.isFrozen(out.reasonCodes));

console.log('ROADMAP_V2_L34_B136_CLOSEOUT=PASS');
console.log(JSON.stringify({
  priorSteps:{B133:'PASS',F1:'PASS',B134:'PASS',B135:'PASS_31_OF_31'},
  productionReadinessReviewContract:contract.schema,
  canonicalExecutableFiles:0,
  runtimeWiring:0,
  shadowProductionReadyOnly:true,
  productionConsumers:0,
  productionPromotion:false,
  persistence:false,
  dashboardUi:false,
  scheduleWrite:false,
  calendarWrite:false,
  runtimeActivation:false,
  notificationWrite:false,
  automaticAction:false,
  productionIntegration:'disconnected',
  next:'L34 documentation/final-state closeout, then architecture audit before merge'
},null,2));
