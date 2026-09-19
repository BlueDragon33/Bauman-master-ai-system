import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {loadCurrentHumanReviewHarness} from './roadmap-v2-human-review-harness.mjs';

const review=loadCurrentHumanReviewHarness();
const satisfying=new Set(review.consumer.admission.readiness.mastery.contract.prerequisiteGate.satisfyingStates);
let passed=0;
const expectReject=(label,fn,pattern)=>{assert.throws(fn,pattern,label);passed++;};
const expectPass=(label,fn)=>{fn();passed++;};

function snapshot(targetId,state,phaseId='GD2',options={}){
  return {schema:'BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1',streamId:options.streamId||('B119::'+phaseId+'::'+targetId),targetId,phaseId,eventCount:options.eventCount??1,lastSequence:options.lastSequence??1,knowledgeState:state,existingCompetencyVerified:false,dimensions:options.dimensions||{},masterReadyGate:options.masterReadyGate||{passed:false,checks:{}},prerequisiteEligible:satisfying.has(state),persisted:options.persisted??false,transitions:[]};
}
function item(id,snap,options={}){
  const technicalTrack=options.technicalTrack===undefined?'math':options.technicalTrack;
  return {scheduleItemId:id,priorityCandidate:{schema:'BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1',candidateId:'B119::CANDIDATE::'+id,targetId:snap.targetId,phaseId:snap.phaseId,masterRelevance:0.8,masterRelevanceSource:'L30/B119 adversarial fixture',weeksUntilNeeded:8,snapshot:snap},activityKind:options.activityKind||'technical_core',estimatedMinutes:60,technicalTrack,russianTwinMinutes:technicalTrack===null?null:30,dueDate:null,reviewRequested:false,source:{kind:'registry_static',ref:'registry://'+snap.targetId,verified:true,masterModeRelation:'not_applicable'}};
}
function schedule(phaseId,items){return {schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',requestId:'B119::SCHEDULE::'+phaseId,phaseId,weekStart:'2026-09-21',weeklyCapacityMinutes:600,items};}
function readinessRequest(phaseId='GD2',focusTargetIds=['RU-R0-C01'],items=[]){return {schema:'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1',reportId:'B119::READINESS::'+phaseId+'::'+focusTargetIds.join('+'),phaseId,focusTargetIds,scheduleRequest:schedule(phaseId,items),externalGates:[]};}
function consumerRequest(readiness=readinessRequest(),overrides={}){return {schema:'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V1',consumerId:'SHADOW::HUMAN_REVIEW',consumerClass:'human_review_shadow',readinessRequest:readiness,...overrides};}
function request(readiness=readinessRequest(),decision='accepted_for_shadow_analysis',reasons=['B119_REVIEW'],overrides={}){return {schema:'BAUMAN_ROADMAP_V2_HUMAN_REVIEW_REQUEST_V1',reviewerRef:'REVIEWER::B119',reviewDecision:decision,reasonCodes:reasons,consumerAdmissionRequest:consumerRequest(readiness),...overrides};}
function event(sequence,evidenceType,payload,targetId,phaseId='GD2'){return {schema:'BAUMAN_ROADMAP_V2_EVIDENCE_EVENT_V1',eventId:targetId+'-B119-'+sequence,streamId:'B119::STREAM::'+targetId,sequence,targetId,phaseId,evidenceType,occurredAt:'2026-09-19T00:00:00Z',source:{kind:'b119_fixture',ref:targetId+'/'+sequence},payload};}
function fullEvidence(targetId,phaseId='GD2'){return [event(1,'chapter_assessment',{percent:85,criticalPercent:75},targetId,phaseId),event(2,'exercise_set',{percent:90,completedItems:20,totalItems:20},targetId,phaseId),event(3,'lab_or_simulation',{passed:true,explanationAccepted:true},targetId,phaseId),event(4,'project_rubric',{rubric:{correctness:3,clarity:3,verification:3,reproducibility:3}},targetId,phaseId),event(5,'retention_check',{percent:80,daysAfterLearning:14},targetId,phaseId)];}

// 1-8: outer Human Review identity/schema/reason boundary.
expectReject('review schema drift rejected',()=>review.projectHumanReview(request(readinessRequest(),'accepted_for_shadow_analysis',['OK'],{schema:'BAUMAN_ROADMAP_V2_HUMAN_REVIEW_REQUEST_V0'})),/schema mismatch/);
expectReject('reviewer namespace rejected',()=>review.projectHumanReview(request(readinessRequest(),'accepted_for_shadow_analysis',['OK'],{reviewerRef:'ADMIN'})),/REVIEWER namespace/);
expectReject('lowercase reviewer rejected',()=>review.projectHumanReview(request(readinessRequest(),'accepted_for_shadow_analysis',['OK'],{reviewerRef:'REVIEWER::human'})),/REVIEWER namespace/);
expectReject('production promotion decision rejected',()=>review.projectHumanReview(request(readinessRequest(),'promote_to_production',['OK'])),/Unsupported Human Review decision/);
expectReject('empty reasons rejected',()=>review.projectHumanReview(request(readinessRequest(),'needs_revision',[])),/count out of range/);
expectReject('duplicate reasons rejected',()=>review.projectHumanReview(request(readinessRequest(),'needs_revision',['DUP','DUP'])),/Duplicate Human Review reason code/);
expectReject('malformed reason rejected',()=>review.projectHumanReview(request(readinessRequest(),'needs_revision',['bad reason'])),/Invalid Human Review reason code/);
expectReject('too many reasons rejected',()=>review.projectHumanReview(request(readinessRequest(),'needs_revision',Array.from({length:17},(_,i)=>'R'+i))),/count out of range/);

// 9-11: caller cannot inject review/upstream authority.
expectReject('caller consumer result rejected',()=>review.projectHumanReview(request(readinessRequest(),'accepted_for_shadow_analysis',['OK'],{consumerAdmissionResult:{consumerDecision:'shadow_review_ready_for_human_review'}})),/unsupported fields/);
expectReject('caller effective state rejected',()=>review.projectHumanReview(request(readinessRequest(),'accepted_for_shadow_analysis',['OK'],{effectiveReviewState:'review_accepted_shadow_only'})),/unsupported fields/);
expectReject('caller production promotion rejected',()=>review.projectHumanReview(request(readinessRequest(),'accepted_for_shadow_analysis',['OK'],{productionPromotionAuthorized:true})),/unsupported fields/);

// 12-16: nested Consumer Admission / Readiness / Mastery forgery is rejected.
expectReject('production consumer impersonation rejected',()=>{const r=request();r.consumerAdmissionRequest.consumerId='PLANNING_BRIDGE';review.projectHumanReview(r);},/SHADOW namespace/);
expectReject('consumer class impersonation rejected',()=>{const r=request();r.consumerAdmissionRequest.consumerClass='planning_bridge';review.projectHumanReview(r);},/Unsupported Consumer Admission class/);
expectReject('nested admission result rejected',()=>{const r=request();r.consumerAdmissionRequest.admissionResult={advisoryState:'ready_for_human_review'};review.projectHumanReview(r);},/unsupported fields/);
expectReject('nested readiness color rejected',()=>{const r=request();r.consumerAdmissionRequest.readinessRequest.overallColor='green';review.projectHumanReview(r);},/unsupported fields/);
expectReject('persisted mastery rejected',()=>{const s=snapshot('RU-R0-C01','dang_hoc','GD2',{persisted:true});review.projectHumanReview(request(readinessRequest('GD2',['RU-R0-C01'],[item('PERSISTED',s,{technicalTrack:null,activityKind:'russian_foundation'})])));},/Persisted mastery snapshot admitted/);

// 17-19: upstream readiness cannot be forged by a review decision.
expectPass('red acceptance blocked upstream',()=>{const out=review.projectHumanReview(request());assert.equal(out.sourceReadinessColor,'red');assert.equal(out.effectiveReviewState,'review_blocked_upstream');assert.equal(out.productionPromotionAuthorized,false);});
expectPass('yellow acceptance blocked upstream',()=>{const s=snapshot('RU-R0-C01','dang_hoc');const out=review.projectHumanReview(request(readinessRequest('GD2',['RU-R0-C01'],[item('YELLOW',s,{technicalTrack:null,activityKind:'russian_foundation'})])));assert.equal(out.sourceReadinessColor,'yellow');assert.equal(out.effectiveReviewState,'review_blocked_upstream');assert.equal(out.runtimeActionAuthorized,false);});
expectPass('green acceptance remains shadow only',()=>{const s=review.consumer.admission.readiness.mastery.reduceEvidenceStream(fullEvidence('RU-R0-C01'));const out=review.projectHumanReview(request(readinessRequest('GD2',['RU-R0-C01'],[item('GREEN',s,{technicalTrack:null,activityKind:'russian_foundation'})]),'accepted_for_shadow_analysis',['UPSTREAM_READY']));assert.equal(out.sourceReadinessColor,'green');assert.equal(out.effectiveReviewState,'review_accepted_shadow_only');assert.equal(out.productionPromotionAuthorized,false);assert.equal(out.productionConsumerConnected,false);assert.equal(out.runtimeActionAuthorized,false);});

// 20-21: negative human decisions never widen authority.
expectPass('needs revision stays non-authoritative',()=>{const out=review.projectHumanReview(request(readinessRequest(),'needs_revision',['MISSING_EVIDENCE']));assert.equal(out.effectiveReviewState,'review_needs_revision');assert.equal(out.productionPromotionAuthorized,false);});
expectPass('rejection stays non-authoritative',()=>{const out=review.projectHumanReview(request(readinessRequest(),'rejected',['POLICY_MISMATCH']));assert.equal(out.effectiveReviewState,'review_rejected');assert.equal(out.productionPromotionAuthorized,false);});

// 22: deterministic exact output and deep freeze prevent post-review escalation.
expectPass('deterministic frozen receipt',()=>{const input=request(readinessRequest(),'needs_revision',['DETERMINISTIC']);const before=structuredClone(input);const a=review.projectHumanReview(input),b=review.projectHumanReview(input);assert.deepEqual(input,before);assert.deepEqual(a,b);assert(Object.isFrozen(a)&&Object.isFrozen(a.reasonCodes));assert.throws(()=>{a.productionPromotionAuthorized=true;},TypeError);assert.throws(()=>{a.effectiveReviewState='review_accepted_shadow_only';},TypeError);assert.equal(a.productionPromotionAuthorized,false);});

// 23: no runtime wiring or side-effect APIs.
expectPass('runtime wiring leak scan',()=>{
  function walk(dir){return fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.posix.join(dir,e.name);return e.isDirectory()?walk(p):[p];}):[];}
  for(const file of [...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p))){
    const text=fs.readFileSync(file,'utf8');
    for(const ref of ['roadmap-v2-human-review-harness.mjs','loadCurrentHumanReviewHarness','BAUMAN_ROADMAP_V2_HUMAN_REVIEW_CONTRACT_V1'])assert.equal(text.includes(ref),false,'Human Review wiring leaked into runtime: '+file+' -> '+ref);
  }
  const source=fs.readFileSync('scripts/roadmap-v2-human-review-harness.mjs','utf8');
  for(const pattern of [/writeFileSync\s*\(/,/appendFileSync\s*\(/,/writeFile\s*\(/,/localStorage/,/sessionStorage/,/fetch\s*\(/,/XMLHttpRequest/,/child_process/,/spawn\s*\(/,/exec\s*\(/])assert.doesNotMatch(source,pattern,'Human Review harness gained side-effect API: '+pattern);
});

assert.equal(passed,23);
console.log('ROADMAP_V2_L30_B119_ADVERSARIAL_HUMAN_REVIEW=PASS');
console.log(JSON.stringify({passed,total:23,productionPromotion:false,productionConsumers:0,productionIntegration:'disconnected',persistence:false,runtimeActivation:false,automaticAction:false},null,2));
