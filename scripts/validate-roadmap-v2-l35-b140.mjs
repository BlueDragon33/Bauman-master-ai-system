import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {loadCurrentProductionPromotionAuthorizationHarness} from './roadmap-v2-production-promotion-authorization-harness.mjs';

function run(file,marker){
  const r=spawnSync(process.execPath,[file],{encoding:'utf8'});
  if(r.status!==0)throw new Error('B140 dependency gate failed: '+file+'\n'+r.stdout+'\n'+r.stderr);
  assert.match(r.stdout,marker,'B140 prerequisite marker missing: '+file);
}
run('scripts/validate-roadmap-v2-l35-b137.mjs',/ROADMAP_V2_L35_B137_PRODUCTION_PROMOTION_AUTHORIZATION_CONTRACT=PASS/);
run('scripts/validate-roadmap-v2-l35-b138.mjs',/ROADMAP_V2_L35_B138_PRODUCTION_PROMOTION_AUTHORIZATION_PROJECTOR=PASS/);
run('scripts/validate-roadmap-v2-l35-b139.mjs',/ROADMAP_V2_L35_B139_ADVERSARIAL_PRODUCTION_PROMOTION_AUTHORIZATION=PASS/);

const authorization=loadCurrentProductionPromotionAuthorizationHarness();
const contract=authorization.contract;

assert.equal(contract.schema,'BAUMAN_ROADMAP_V2_PRODUCTION_PROMOTION_AUTHORIZATION_CONTRACT_V1');
assert.equal(contract.version,'2.15.0-l35-b137');
assert.equal(contract.acceptance.step,137);
assert.equal(contract.acceptance.currentTrack,'L35');
assert.equal(contract.acceptance.result,'PASS_B137_CONTRACT');
assert.equal(contract.mode.productionIntegration,'disconnected');
assert.equal(contract.mode.authorizationReceiptOnly,true);
assert.equal(contract.mode.productionPromotionExecutionEnabled,false);
assert.equal(contract.mode.deploymentEnabled,false);
for(const key of ['persistentStoreEnabled','dashboardUiEnabled','scheduleWriteAllowed','calendarWriteAllowed','runtimeWriteAllowed','notificationWriteAllowed','automaticActionAllowed']){
  assert.equal(contract.mode[key],false,'B140 forbidden Authorization mode enabled: '+key);
}
assert.equal(contract.candidatePolicy.recomputeProductionReadinessReviewFromRequest,true);
assert.equal(contract.candidatePolicy.acceptCallerSuppliedProductionReadinessReviewResult,false);
assert.equal(contract.candidatePolicy.acceptCallerSuppliedShadowProductionReady,false);
assert.equal(contract.candidatePolicy.requireShadowProductionReady,true);
assert.equal(contract.candidatePolicy.manualEligibilityOverrideAllowed,false);
assert.equal(contract.candidatePolicy.requireNestedCandidateMatch,true);
assert.equal(contract.authorizationPolicy.authorizationScope,'receipt_only_no_execution');
assert.equal(contract.authorizationPolicy.authorizedDecisionExecutesPromotion,false);
assert.equal(contract.authorizationPolicy.manualProductionOverrideAllowed,false);
for(const key of ['productionPromotionExecute','deploymentExecute','productionConsumerConnect','persistentStoreWrite','dashboardUiRender','scheduleWrite','calendarWrite','runtimeActivation','notificationWrite','automaticAction']){
  assert.equal(contract.capabilities[key],false,'B140 forbidden Authorization capability enabled: '+key);
}

function walk(dir){if(!fs.existsSync(dir))return [];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const p=path.posix.join(dir,entry.name);return entry.isDirectory()?walk(p):[p];});}
for(const p of walk('roadmap_v2'))assert.equal(/\.(?:js|mjs|cjs|html|css)$/i.test(p),false,'B140 executable/UI leaked into canonical Roadmap tree: '+p);

const runtimeFiles=[...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p));
for(const file of runtimeFiles){
  const text=fs.readFileSync(file,'utf8');
  for(const forbidden of [
    'roadmap-v2-production-promotion-authorization-harness.mjs',
    'loadCurrentProductionPromotionAuthorizationHarness',
    'roadmap_v2/production-promotion-authorization/current-contract.json',
    'BAUMAN_ROADMAP_V2_PRODUCTION_PROMOTION_AUTHORIZATION_CONTRACT_V1',
    'BAUMAN_ROADMAP_V2_PRODUCTION_PROMOTION_AUTHORIZATION_REQUEST_V1'
  ])assert.equal(text.includes(forbidden),false,'B140 Authorization runtime wiring leaked: '+file+' -> '+forbidden);
}

const harnessSource=fs.readFileSync('scripts/roadmap-v2-production-promotion-authorization-harness.mjs','utf8');
for(const pattern of [/writeFileSync\s*\(/,/appendFileSync\s*\(/,/writeFile\s*\(/,/localStorage/,/sessionStorage/,/fetch\s*\(/,/XMLHttpRequest/,/child_process/,/spawn\s*\(/,/exec\s*\(/]){
  assert.doesNotMatch(harnessSource,pattern,'B140 Authorization harness gained forbidden side effect: '+pattern);
}

const candidateRef='CANDIDATE::B140';
const out=authorization.projectProductionPromotionAuthorization({
  schema:'BAUMAN_ROADMAP_V2_PRODUCTION_PROMOTION_AUTHORIZATION_REQUEST_V1',
  candidateRef,
  productionPromotionAuthorizerRef:'PRODUCTION_PROMOTION_AUTHORIZER::B140',
  authorizationDecision:'authorize_receipt_only',
  reasonCodes:['B140_CLOSEOUT'],
  productionReadinessReviewRequest:{
    schema:'BAUMAN_ROADMAP_V2_PRODUCTION_READINESS_REVIEW_REQUEST_V1',
    candidateRef,
    productionReadinessReviewerRef:'PRODUCTION_READINESS_REVIEWER::B140',
    reviewDecision:'approve_shadow_readiness',
    reasonCodes:['B140_READINESS'],
    promotionReviewRequest:{
      schema:'BAUMAN_ROADMAP_V2_PROMOTION_REVIEW_REQUEST_V1',
      candidateRef,
      promotionReviewerRef:'PROMOTION_REVIEWER::B140',
      reviewDecision:'approve_for_production_readiness_review',
      reasonCodes:['B140_PROMOTION'],
      releaseReviewRequest:{
        schema:'BAUMAN_ROADMAP_V2_RELEASE_REVIEW_REQUEST_V1',
        candidateRef,
        releaseReviewerRef:'RELEASE_REVIEWER::B140',
        reviewDecision:'approve_for_promotion_review',
        reasonCodes:['B140_RELEASE'],
        promotionEligibilityRequest:{
          schema:'BAUMAN_ROADMAP_V2_PROMOTION_ELIGIBILITY_REQUEST_V1',
          candidateRef,
          humanReviewRequest:{
            schema:'BAUMAN_ROADMAP_V2_HUMAN_REVIEW_REQUEST_V1',
            reviewerRef:'REVIEWER::B140',
            reviewDecision:'accepted_for_shadow_analysis',
            reasonCodes:['B140_HUMAN'],
            consumerAdmissionRequest:{
              schema:'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V1',
              consumerId:'SHADOW::HUMAN_REVIEW',
              consumerClass:'human_review_shadow',
              readinessRequest:{
                schema:'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1',
                reportId:'B140::READINESS::BLOCKED',
                phaseId:'GD2',
                focusTargetIds:['RU-R0-C01'],
                scheduleRequest:{
                  schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',
                  requestId:'B140::SCHEDULE::BLOCKED',
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
  }
});

assert.equal(out.candidateRef,candidateRef);
assert.equal(out.productionPromotionAuthorizerRef,'PRODUCTION_PROMOTION_AUTHORIZER::B140');
assert.equal(out.submittedAuthorizationDecision,'authorize_receipt_only');
assert.deepEqual(out.reasonCodes,['B140_CLOSEOUT']);
assert.equal(out.sourceProductionReadinessReviewState,'production_readiness_review_blocked_upstream');
assert.equal(out.effectiveProductionPromotionAuthorizationState,'production_promotion_authorization_blocked_upstream');
assert.equal(out.authorizationReceiptGranted,false);
assert.equal(out.authorizationScope,'receipt_only_no_execution');
for(const key of ['persisted','productionPromotionExecuted','deploymentExecuted','productionConsumerConnected','runtimeActionAuthorized','scheduleWriteAllowed','notificationWriteAllowed']){
  assert.equal(out[key],false,'B140 output authority widened: '+key);
}
assert(Object.isFrozen(out)&&Object.isFrozen(out.reasonCodes));

console.log('ROADMAP_V2_L35_B140_CLOSEOUT=PASS');
console.log(JSON.stringify({
  priorSteps:{B137:'PASS',F1:'PASS',B138:'PASS',B139:'PASS_34_OF_34'},
  productionPromotionAuthorizationContract:contract.schema,
  authorizationScope:'receipt_only_no_execution',
  canonicalExecutableFiles:0,
  runtimeWiring:0,
  productionConsumers:0,
  productionPromotionExecution:false,
  deployment:false,
  persistence:false,
  dashboardUi:false,
  scheduleWrite:false,
  calendarWrite:false,
  runtimeActivation:false,
  notificationWrite:false,
  automaticAction:false,
  productionIntegration:'disconnected',
  next:'L35 documentation/final-state closeout, then architecture audit before merge'
},null,2));
