import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {loadCurrentPromotionEligibilityHarness} from './roadmap-v2-promotion-eligibility-harness.mjs';

const promotion=loadCurrentPromotionEligibilityHarness();
const satisfying=new Set(promotion.human.consumer.admission.readiness.mastery.contract.prerequisiteGate.satisfyingStates);

function snapshot(targetId,state,phaseId='GD2',options={}){return {schema:'BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1',streamId:options.streamId||('B122::'+phaseId+'::'+targetId),targetId,phaseId,eventCount:options.eventCount??1,lastSequence:options.lastSequence??1,knowledgeState:state,existingCompetencyVerified:false,dimensions:options.dimensions||{},masterReadyGate:options.masterReadyGate||{passed:false,checks:{}},prerequisiteEligible:satisfying.has(state),persisted:false,transitions:[]};}
function item(id,snap,options={}){const technicalTrack=options.technicalTrack===undefined?'math':options.technicalTrack;return {scheduleItemId:id,priorityCandidate:{schema:'BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1',candidateId:'B122::CANDIDATE::'+id,targetId:snap.targetId,phaseId:snap.phaseId,masterRelevance:0.8,masterRelevanceSource:'L31/B122 fixture',weeksUntilNeeded:8,snapshot:snap},activityKind:options.activityKind||'technical_core',estimatedMinutes:60,technicalTrack,russianTwinMinutes:technicalTrack===null?null:30,dueDate:null,reviewRequested:false,source:{kind:'registry_static',ref:'registry://'+snap.targetId,verified:true,masterModeRelation:'not_applicable'}};}
function schedule(phaseId,items){return {schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',requestId:'B122::SCHEDULE::'+phaseId,phaseId,weekStart:'2026-09-21',weeklyCapacityMinutes:600,items};}
function readiness(phaseId='GD2',focusTargetIds=['RU-R0-C01'],items=[]){return {schema:'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1',reportId:'B122::READINESS::'+phaseId+'::'+focusTargetIds.join('+'),phaseId,focusTargetIds,scheduleRequest:schedule(phaseId,items),externalGates:[]};}
function consumer(readinessRequest){return {schema:'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V1',consumerId:'SHADOW::HUMAN_REVIEW',consumerClass:'human_review_shadow',readinessRequest};}
function human(readinessRequest,decision='accepted_for_shadow_analysis',reasons=['B122_REVIEW']){return {schema:'BAUMAN_ROADMAP_V2_HUMAN_REVIEW_REQUEST_V1',reviewerRef:'REVIEWER::B122',reviewDecision:decision,reasonCodes:reasons,consumerAdmissionRequest:consumer(readinessRequest)};}
function request(humanReviewRequest,candidateRef='CANDIDATE::B122'){return {schema:'BAUMAN_ROADMAP_V2_PROMOTION_ELIGIBILITY_REQUEST_V1',candidateRef,humanReviewRequest};}
function event(sequence,evidenceType,payload,targetId,phaseId='GD2'){return {schema:'BAUMAN_ROADMAP_V2_EVIDENCE_EVENT_V1',eventId:targetId+'-B122-'+sequence,streamId:'B122::STREAM::'+targetId,sequence,targetId,phaseId,evidenceType,occurredAt:'2026-09-19T00:00:00Z',source:{kind:'b122_fixture',ref:targetId+'/'+sequence},payload};}
function fullEvidence(targetId,phaseId='GD2'){return [event(1,'chapter_assessment',{percent:85,criticalPercent:75},targetId,phaseId),event(2,'exercise_set',{percent:90,completedItems:20,totalItems:20},targetId,phaseId),event(3,'lab_or_simulation',{passed:true,explanationAccepted:true},targetId,phaseId),event(4,'project_rubric',{rubric:{correctness:3,clarity:3,verification:3,reproducibility:3}},targetId,phaseId),event(5,'retention_check',{percent:80,daysAfterLearning:14},targetId,phaseId)];}

// Upstream blocked -> not eligible.
{const out=promotion.projectEligibility(request(human(readiness())));assert.equal(out.sourceHumanReviewState,'review_blocked_upstream');assert.equal(out.eligibilityState,'not_eligible_upstream_blocked');}
// Needs revision -> not eligible.
{const out=promotion.projectEligibility(request(human(readiness(),'needs_revision',['FIX_REQUIRED'])));assert.equal(out.sourceHumanReviewState,'review_needs_revision');assert.equal(out.eligibilityState,'not_eligible_needs_revision');}
// Rejected -> not eligible.
{const out=promotion.projectEligibility(request(human(readiness(),'rejected',['REJECTED'])));assert.equal(out.sourceHumanReviewState,'review_rejected');assert.equal(out.eligibilityState,'not_eligible_rejected');}
// Accepted green -> eligible for release review only.
{const snap=promotion.human.consumer.admission.readiness.mastery.reduceEvidenceStream(fullEvidence('RU-R0-C01'));const r=readiness('GD2',['RU-R0-C01'],[item('GREEN',snap,{technicalTrack:null,activityKind:'russian_foundation'})]);const out=promotion.projectEligibility(request(human(r,'accepted_for_shadow_analysis',['READY'])));assert.equal(out.sourceReadinessColor,'green');assert.equal(out.sourceHumanReviewState,'review_accepted_shadow_only');assert.equal(out.eligibilityState,'eligible_for_release_review');assert.equal(out.releaseReviewAuthorized,false);assert.equal(out.productionPromotionAuthorized,false);}

// Deterministic, input-preserving, deeply frozen.
{const input=request(human(readiness(),'needs_revision',['DETERMINISTIC']));const before=structuredClone(input);const a=promotion.projectEligibility(input),b=promotion.projectEligibility(input);assert.deepEqual(input,before);assert.deepEqual(a,b);assert(Object.isFrozen(a));assert.throws(()=>{a.productionPromotionAuthorized=true;},TypeError);assert.throws(()=>{a.eligibilityState='eligible_for_release_review';},TypeError);}

// Fail closed against caller authority.
for(const forged of [
  {...request(human(readiness())),candidateRef:'PRODUCTION'},
  {...request(human(readiness())),eligibilityState:'eligible_for_release_review'},
  {...request(human(readiness())),releaseReviewAuthorized:true},
  {...request(human(readiness())),productionPromotionAuthorized:true},
  {...request(human(readiness())),humanReviewResult:{effectiveReviewState:'review_accepted_shadow_only'}}
]){assert.throws(()=>promotion.projectEligibility(forged));}

// Scripts-only and side-effect free.
{
  const source=fs.readFileSync('scripts/roadmap-v2-promotion-eligibility-harness.mjs','utf8');
  for(const forbidden of [/writeFileSync\s*\(/,/appendFileSync\s*\(/,/writeFile\s*\(/,/localStorage/,/sessionStorage/,/fetch\s*\(/,/XMLHttpRequest/,/child_process/,/spawn\s*\(/,/exec\s*\(/])assert.doesNotMatch(source,forbidden,'Promotion Eligibility harness gained forbidden side effect: '+forbidden);
  function walk(dir){return fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.posix.join(dir,e.name);return e.isDirectory()?walk(p):[p];}):[];}
  for(const file of [...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p))){const text=fs.readFileSync(file,'utf8');assert.equal(text.includes('roadmap-v2-promotion-eligibility-harness.mjs'),false,'Promotion Eligibility harness wired into runtime: '+file);assert.equal(text.includes('loadCurrentPromotionEligibilityHarness'),false,'Promotion Eligibility activation leaked into runtime: '+file);}
}

console.log('ROADMAP_V2_L31_B122_PROMOTION_ELIGIBILITY_PROJECTOR=PASS');
console.log(JSON.stringify({states:['not_eligible_upstream_blocked','not_eligible_needs_revision','not_eligible_rejected','eligible_for_release_review'],deterministic:true,deepFrozen:true,releaseReviewAuthorized:false,productionPromotion:false,productionConsumers:0,persistence:false,runtimeActivation:false},null,2));
