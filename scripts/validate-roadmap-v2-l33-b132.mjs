import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {loadCurrentPromotionReviewHarness} from './roadmap-v2-promotion-review-harness.mjs';

function run(file,marker){
  const r=spawnSync(process.execPath,[file],{encoding:'utf8'});
  if(r.status!==0)throw new Error('B132 dependency gate failed: '+file+'\n'+r.stdout+'\n'+r.stderr);
  assert.match(r.stdout,marker,'B132 prerequisite marker missing: '+file);
}
run('scripts/validate-roadmap-v2-l33-b129.mjs',/ROADMAP_V2_L33_B129_PROMOTION_REVIEW_CONTRACT=PASS/);
run('scripts/validate-roadmap-v2-l33-b130.mjs',/ROADMAP_V2_L33_B130_PROMOTION_REVIEW_PROJECTOR=PASS/);
run('scripts/validate-roadmap-v2-l33-b131.mjs',/ROADMAP_V2_L33_B131_ADVERSARIAL_PROMOTION_REVIEW=PASS/);

const promotion=loadCurrentPromotionReviewHarness();
const contract=promotion.contract;

assert.equal(contract.schema,'BAUMAN_ROADMAP_V2_PROMOTION_REVIEW_CONTRACT_V1');
assert.equal(contract.version,'2.13.0-l33-b129');
assert.equal(contract.acceptance.step,129);
assert.equal(contract.acceptance.currentTrack,'L33');
assert.equal(contract.acceptance.result,'PASS_B129_CONTRACT');
assert.equal(contract.mode.productionIntegration,'disconnected');
assert.equal(contract.mode.productionReadinessReviewIntegration,'disconnected');
assert.equal(contract.mode.promotionReviewOnly,true);
assert.equal(contract.mode.productionPromotionEnabled,false);
for(const key of ['persistentStoreEnabled','dashboardUiEnabled','scheduleWriteAllowed','calendarWriteAllowed','runtimeWriteAllowed','notificationWriteAllowed','automaticActionAllowed'])assert.equal(contract.mode[key],false,'B132 forbidden Promotion Review mode enabled: '+key);
assert.equal(contract.candidatePolicy.recomputeReleaseReviewFromRequest,true);
assert.equal(contract.candidatePolicy.acceptCallerSuppliedReleaseReviewResult,false);
assert.equal(contract.candidatePolicy.acceptCallerSuppliedPromotionReviewEligibility,false);
assert.equal(contract.candidatePolicy.requireNestedCandidateMatch,true);
assert.equal(contract.reviewPolicy.approvedDecisionAuthorizesProduction,false);
assert.equal(contract.reviewPolicy.manualProductionOverrideAllowed,false);
for(const key of ['productionPromotion','productionConsumerConnect','persistentStoreWrite','dashboardUiRender','scheduleWrite','calendarWrite','runtimeActivation','notificationWrite','automaticAction'])assert.equal(contract.capabilities[key],false,'B132 forbidden Promotion Review capability enabled: '+key);

function walk(dir){if(!fs.existsSync(dir))return [];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const p=path.posix.join(dir,entry.name);return entry.isDirectory()?walk(p):[p];});}
for(const p of walk('roadmap_v2'))assert.equal(/\.(?:js|mjs|cjs|html|css)$/i.test(p),false,'B132 executable/UI leaked into canonical Roadmap tree: '+p);

const runtimeFiles=[...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p));
for(const file of runtimeFiles){
  const text=fs.readFileSync(file,'utf8');
  for(const forbidden of ['roadmap-v2-promotion-review-harness.mjs','loadCurrentPromotionReviewHarness','roadmap_v2/promotion-review/current-contract.json','BAUMAN_ROADMAP_V2_PROMOTION_REVIEW_CONTRACT_V1','BAUMAN_ROADMAP_V2_PROMOTION_REVIEW_REQUEST_V1'])assert.equal(text.includes(forbidden),false,'B132 Promotion Review runtime wiring leaked: '+file+' -> '+forbidden);
}

const harnessSource=fs.readFileSync('scripts/roadmap-v2-promotion-review-harness.mjs','utf8');
for(const pattern of [/writeFileSync\s*\(/,/appendFileSync\s*\(/,/writeFile\s*\(/,/localStorage/,/sessionStorage/,/fetch\s*\(/,/XMLHttpRequest/,/child_process/,/spawn\s*\(/,/exec\s*\(/])assert.doesNotMatch(harnessSource,pattern,'B132 Promotion Review harness gained forbidden side effect: '+pattern);

const candidateRef='CANDIDATE::B132';
const out=promotion.projectPromotionReview({
  schema:'BAUMAN_ROADMAP_V2_PROMOTION_REVIEW_REQUEST_V1',
  candidateRef,
  promotionReviewerRef:'PROMOTION_REVIEWER::B132',
  reviewDecision:'approve_for_production_readiness_review',
  reasonCodes:['B132_CLOSEOUT'],
  releaseReviewRequest:{
    schema:'BAUMAN_ROADMAP_V2_RELEASE_REVIEW_REQUEST_V1',
    candidateRef,
    releaseReviewerRef:'RELEASE_REVIEWER::B132',
    reviewDecision:'approve_for_promotion_review',
    reasonCodes:['B132_RELEASE'],
    promotionEligibilityRequest:{
      schema:'BAUMAN_ROADMAP_V2_PROMOTION_ELIGIBILITY_REQUEST_V1',
      candidateRef,
      humanReviewRequest:{
        schema:'BAUMAN_ROADMAP_V2_HUMAN_REVIEW_REQUEST_V1',
        reviewerRef:'REVIEWER::B132',
        reviewDecision:'accepted_for_shadow_analysis',
        reasonCodes:['B132_HUMAN'],
        consumerAdmissionRequest:{
          schema:'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V1',
          consumerId:'SHADOW::HUMAN_REVIEW',
          consumerClass:'human_review_shadow',
          readinessRequest:{
            schema:'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1',
            reportId:'B132::READINESS::BLOCKED',
            phaseId:'GD2',
            focusTargetIds:['RU-R0-C01'],
            scheduleRequest:{
              schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',
              requestId:'B132::SCHEDULE::BLOCKED',
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
});

assert.equal(out.candidateRef,candidateRef);
assert.equal(out.promotionReviewerRef,'PROMOTION_REVIEWER::B132');
assert.equal(out.submittedReviewDecision,'approve_for_production_readiness_review');
assert.deepEqual(out.reasonCodes,['B132_CLOSEOUT']);
assert.equal(out.sourceReleaseReviewState,'release_review_blocked_upstream');
assert.equal(out.effectivePromotionReviewState,'promotion_review_blocked_upstream');
assert.equal(out.productionReadinessReviewEligible,false);
for(const key of ['persisted','productionPromotionAuthorized','productionConsumerConnected','runtimeActionAuthorized','scheduleWriteAllowed','notificationWriteAllowed'])assert.equal(out[key],false,'B132 output authority widened: '+key);
assert(Object.isFrozen(out)&&Object.isFrozen(out.reasonCodes));

console.log('ROADMAP_V2_L33_B132_CLOSEOUT=PASS');
console.log(JSON.stringify({
  priorSteps:{B129:'PASS',B130:'PASS',B131:'PASS'},
  promotionReviewContract:contract.schema,
  canonicalExecutableFiles:0,
  runtimeWiring:0,
  productionReadinessReviewIntegration:'disconnected',
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
  next:'L33 documentation/final-state closeout, then architecture audit before merge'
},null,2));
