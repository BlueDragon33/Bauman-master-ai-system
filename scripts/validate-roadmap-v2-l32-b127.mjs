import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {loadCurrentReleaseReviewHarness} from './roadmap-v2-release-review-harness.mjs';

const release=loadCurrentReleaseReviewHarness();
const satisfying=new Set(release.promotion.human.consumer.admission.readiness.mastery.contract.prerequisiteGate.satisfyingStates);
let passed=0;
const expectReject=(label,fn,pattern)=>{assert.throws(fn,pattern,label);passed++;};
const expectPass=(label,fn)=>{fn();passed++;};

function snapshot(targetId,state,phaseId='GD2',options={}){return {schema:'BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1',streamId:options.streamId||('B127::'+phaseId+'::'+targetId),targetId,phaseId,eventCount:options.eventCount??1,lastSequence:options.lastSequence??1,knowledgeState:state,existingCompetencyVerified:false,dimensions:options.dimensions||{},masterReadyGate:options.masterReadyGate||{passed:false,checks:{}},prerequisiteEligible:satisfying.has(state),persisted:options.persisted??false,transitions:[]};}
function item(id,snap,options={}){const technicalTrack=options.technicalTrack===undefined?'math':options.technicalTrack;return {scheduleItemId:id,priorityCandidate:{schema:'BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1',candidateId:'B127::CANDIDATE::'+id,targetId:snap.targetId,phaseId:snap.phaseId,masterRelevance:0.8,masterRelevanceSource:'L32/B127 adversarial fixture',weeksUntilNeeded:8,snapshot:snap},activityKind:options.activityKind||'technical_core',estimatedMinutes:60,technicalTrack,russianTwinMinutes:technicalTrack===null?null:30,dueDate:null,reviewRequested:false,source:{kind:'registry_static',ref:'registry://'+snap.targetId,verified:true,masterModeRelation:'not_applicable'}};}
function schedule(phaseId,items){return {schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',requestId:'B127::SCHEDULE::'+phaseId,phaseId,weekStart:'2026-09-21',weeklyCapacityMinutes:600,items};}
function readiness(phaseId='GD2',focusTargetIds=['RU-R0-C01'],items=[]){return {schema:'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1',reportId:'B127::READINESS::'+phaseId+'::'+focusTargetIds.join('+'),phaseId,focusTargetIds,scheduleRequest:schedule(phaseId,items),externalGates:[]};}
function consumer(readinessRequest,overrides={}){return {schema:'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V1',consumerId:'SHADOW::HUMAN_REVIEW',consumerClass:'human_review_shadow',readinessRequest,...overrides};}
function human(readinessRequest=readiness(),decision='accepted_for_shadow_analysis',reasons=['B127_HUMAN'],overrides={}){return {schema:'BAUMAN_ROADMAP_V2_HUMAN_REVIEW_REQUEST_V1',reviewerRef:'REVIEWER::B127',reviewDecision:decision,reasonCodes:reasons,consumerAdmissionRequest:consumer(readinessRequest),...overrides};}
function eligibility(humanReviewRequest=human(),candidateRef='CANDIDATE::B127',overrides={}){return {schema:'BAUMAN_ROADMAP_V2_PROMOTION_ELIGIBILITY_REQUEST_V1',candidateRef,humanReviewRequest,...overrides};}
function request(promotionEligibilityRequest=eligibility(),decision='approve_for_promotion_review',reasons=['B127_RELEASE'],overrides={}){return {schema:'BAUMAN_ROADMAP_V2_RELEASE_REVIEW_REQUEST_V1',candidateRef:'CANDIDATE::B127',releaseReviewerRef:'RELEASE_REVIEWER::B127',reviewDecision:decision,reasonCodes:reasons,promotionEligibilityRequest,...overrides};}
function event(sequence,evidenceType,payload,targetId,phaseId='GD2'){return {schema:'BAUMAN_ROADMAP_V2_EVIDENCE_EVENT_V1',eventId:targetId+'-B127-'+sequence,streamId:'B127::STREAM::'+targetId,sequence,targetId,phaseId,evidenceType,occurredAt:'2026-09-20T00:00:00Z',source:{kind:'b127_fixture',ref:targetId+'/'+sequence},payload};}
function fullEvidence(targetId,phaseId='GD2'){return [event(1,'chapter_assessment',{percent:85,criticalPercent:75},targetId,phaseId),event(2,'exercise_set',{percent:90,completedItems:20,totalItems:20},targetId,phaseId),event(3,'lab_or_simulation',{passed:true,explanationAccepted:true},targetId,phaseId),event(4,'project_rubric',{rubric:{correctness:3,clarity:3,verification:3,reproducibility:3}},targetId,phaseId),event(5,'retention_check',{percent:80,daysAfterLearning:14},targetId,phaseId)];}
function eligiblePromotion(){
  const snap=release.promotion.human.consumer.admission.readiness.mastery.reduceEvidenceStream(fullEvidence('RU-R0-C01'));
  return eligibility(human(readiness('GD2',['RU-R0-C01'],[item('GREEN',snap,{technicalTrack:null,activityKind:'russian_foundation'})]),'accepted_for_shadow_analysis',['READY']));
}

// 1-10: outer Release Review request boundary.
expectReject('release schema drift rejected',()=>release.projectReleaseReview(request(eligibility(),'approve_for_promotion_review',['OK'],{schema:'BAUMAN_ROADMAP_V2_RELEASE_REVIEW_REQUEST_V0'})),/schema mismatch/);
expectReject('candidate namespace rejected',()=>release.projectReleaseReview(request(eligibility(),'approve_for_promotion_review',['OK'],{candidateRef:'PRODUCTION'})),/CANDIDATE namespace/);
expectReject('lowercase candidate rejected',()=>release.projectReleaseReview(request(eligibility(),'approve_for_promotion_review',['OK'],{candidateRef:'CANDIDATE::candidate'})),/CANDIDATE namespace/);
expectReject('reviewer namespace rejected',()=>release.projectReleaseReview(request(eligibility(),'approve_for_promotion_review',['OK'],{releaseReviewerRef:'REVIEWER::B127'})),/RELEASE_REVIEWER namespace/);
expectReject('lowercase reviewer rejected',()=>release.projectReleaseReview(request(eligibility(),'approve_for_promotion_review',['OK'],{releaseReviewerRef:'RELEASE_REVIEWER::human'})),/RELEASE_REVIEWER namespace/);
expectReject('production decision rejected',()=>release.projectReleaseReview(request(eligibility(),'promote_to_production',['OK'])),/Unsupported Release Review decision/);
expectReject('empty reasons rejected',()=>release.projectReleaseReview(request(eligibility(),'needs_revision',[])),/count out of range/);
expectReject('duplicate reasons rejected',()=>release.projectReleaseReview(request(eligibility(),'needs_revision',['DUP','DUP'])),/Duplicate Release Review reason code/);
expectReject('malformed reason rejected',()=>release.projectReleaseReview(request(eligibility(),'needs_revision',['bad reason'])),/Invalid Release Review reason code/);
expectReject('too many reasons rejected',()=>release.projectReleaseReview(request(eligibility(),'needs_revision',Array.from({length:13},(_,i)=>'R'+i))),/count out of range/);

// 11-16: caller cannot forge identity, result or authority.
expectReject('outer/nested candidate mismatch rejected',()=>release.projectReleaseReview(request(eligibility(human(),'CANDIDATE::OTHER'))),/candidate does not match/);
expectReject('caller promotion-review eligibility rejected',()=>release.projectReleaseReview(request(eligibility(),'approve_for_promotion_review',['OK'],{promotionReviewEligible:true})),/unsupported fields/);
expectReject('caller production promotion rejected',()=>release.projectReleaseReview(request(eligibility(),'approve_for_promotion_review',['OK'],{productionPromotionAuthorized:true})),/unsupported fields/);
expectReject('caller release result rejected',()=>release.projectReleaseReview(request(eligibility(),'approve_for_promotion_review',['OK'],{releaseReviewResult:{effectiveReleaseReviewState:'release_review_approved_shadow_only'}})),/unsupported fields/);
expectReject('caller effective state rejected',()=>release.projectReleaseReview(request(eligibility(),'approve_for_promotion_review',['OK'],{effectiveReleaseReviewState:'release_review_approved_shadow_only'})),/unsupported fields/);
expectReject('manual override rejected',()=>release.projectReleaseReview(request(eligibility(),'approve_for_promotion_review',['OK'],{manualOverride:true})),/unsupported fields/);

// 17-21: nested Promotion Eligibility / Human Review / Consumer authority.
expectReject('nested promotion schema drift rejected',()=>release.projectReleaseReview(request(eligibility(human(),'CANDIDATE::B127',{schema:'BAUMAN_ROADMAP_V2_PROMOTION_ELIGIBILITY_REQUEST_V0'}))),/schema mismatch/);
expectReject('nested eligibility state rejected',()=>release.projectReleaseReview(request(eligibility(human(),'CANDIDATE::B127',{eligibilityState:'eligible_for_release_review'}))),/unsupported fields/);
expectReject('nested human schema drift rejected',()=>{
  const nestedHuman=human(readiness(),'accepted_for_shadow_analysis',['OK'],{schema:'BAUMAN_ROADMAP_V2_HUMAN_REVIEW_REQUEST_V0'});
  release.projectReleaseReview(request(eligibility(nestedHuman)));
},/schema mismatch/);
expectReject('production consumer impersonation rejected',()=>{const h=human();h.consumerAdmissionRequest.consumerId='PLANNING_BRIDGE';release.projectReleaseReview(request(eligibility(h)));},/SHADOW namespace/);
expectReject('persisted mastery rejected',()=>{const s=snapshot('RU-R0-C01','dang_hoc','GD2',{persisted:true});release.projectReleaseReview(request(eligibility(human(readiness('GD2',['RU-R0-C01'],[item('PERSISTED',s,{technicalTrack:null,activityKind:'russian_foundation'})])))));},/Persisted mastery snapshot admitted/);

// 22-25: decision mapping cannot widen authority.
expectPass('upstream noneligible approval remains blocked',()=>{const out=release.projectReleaseReview(request());assert.equal(out.sourceEligibilityState,'not_eligible_upstream_blocked');assert.equal(out.effectiveReleaseReviewState,'release_review_blocked_upstream');assert.equal(out.promotionReviewEligible,false);assert.equal(out.productionPromotionAuthorized,false);});
expectPass('eligible approval remains shadow-only',()=>{const out=release.projectReleaseReview(request(eligiblePromotion(),'approve_for_promotion_review',['READY']));assert.equal(out.sourceEligibilityState,'eligible_for_release_review');assert.equal(out.effectiveReleaseReviewState,'release_review_approved_shadow_only');assert.equal(out.promotionReviewEligible,true);assert.equal(out.productionPromotionAuthorized,false);assert.equal(out.productionConsumerConnected,false);assert.equal(out.runtimeActionAuthorized,false);});
expectPass('eligible needs-revision remains non-authoritative',()=>{const out=release.projectReleaseReview(request(eligiblePromotion(),'needs_revision',['FIX']));assert.equal(out.effectiveReleaseReviewState,'release_review_needs_revision');assert.equal(out.promotionReviewEligible,false);assert.equal(out.productionPromotionAuthorized,false);});
expectPass('eligible rejection remains non-authoritative',()=>{const out=release.projectReleaseReview(request(eligiblePromotion(),'rejected',['NO']));assert.equal(out.effectiveReleaseReviewState,'release_review_rejected');assert.equal(out.promotionReviewEligible,false);assert.equal(out.productionPromotionAuthorized,false);});

// 26: deterministic exact output and audit preservation.
expectPass('deterministic exact audited output',()=>{const input=request(eligiblePromotion(),'approve_for_promotion_review',['DET']);const before=structuredClone(input);const a=release.projectReleaseReview(input),b=release.projectReleaseReview(input);assert.deepEqual(input,before);assert.deepEqual(a,b);assert.equal(a.candidateRef,'CANDIDATE::B127');assert.equal(a.releaseReviewerRef,'RELEASE_REVIEWER::B127');assert.equal(a.submittedReviewDecision,'approve_for_promotion_review');assert.deepEqual(a.reasonCodes,['DET']);assert.deepEqual(Object.keys(a).sort(),['schema','receiptId','candidateRef','releaseReviewerRef','submittedReviewDecision','reasonCodes','promotionEligibilityProjectionId','humanReviewReceiptId','reportId','phaseId','weekStart','sourceEligibilityState','effectiveReleaseReviewState','promotionReviewEligible','persisted','productionPromotionAuthorized','productionConsumerConnected','runtimeActionAuthorized','scheduleWriteAllowed','notificationWriteAllowed'].sort());});

// 27: deep freeze blocks post-review escalation.
expectPass('deep freeze blocks escalation',()=>{const out=release.projectReleaseReview(request(eligiblePromotion(),'approve_for_promotion_review',['FREEZE']));assert(Object.isFrozen(out)&&Object.isFrozen(out.reasonCodes));assert.throws(()=>{out.productionPromotionAuthorized=true;},TypeError);assert.throws(()=>{out.promotionReviewEligible=false;},TypeError);assert.throws(()=>{out.reasonCodes.push('FORGED');},TypeError);assert.equal(out.productionPromotionAuthorized,false);});

// 28: no runtime wiring or side-effect APIs.
expectPass('runtime wiring leak scan',()=>{
  function walk(dir){return fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.posix.join(dir,e.name);return e.isDirectory()?walk(p):[p];}):[];}
  for(const file of [...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p))){
    const text=fs.readFileSync(file,'utf8');
    for(const ref of ['roadmap-v2-release-review-harness.mjs','loadCurrentReleaseReviewHarness','BAUMAN_ROADMAP_V2_RELEASE_REVIEW_CONTRACT_V1'])assert.equal(text.includes(ref),false,'Release Review wiring leaked into runtime: '+file+' -> '+ref);
  }
  const source=fs.readFileSync('scripts/roadmap-v2-release-review-harness.mjs','utf8');
  for(const pattern of [/writeFileSync\s*\(/,/appendFileSync\s*\(/,/writeFile\s*\(/,/localStorage/,/sessionStorage/,/fetch\s*\(/,/XMLHttpRequest/,/child_process/,/spawn\s*\(/,/exec\s*\(/])assert.doesNotMatch(source,pattern,'Release Review harness gained side-effect API: '+pattern);
});

assert.equal(passed,28);
console.log('ROADMAP_V2_L32_B127_ADVERSARIAL_RELEASE_REVIEW=PASS');
console.log(JSON.stringify({passed,total:28,promotionReviewIntegration:'disconnected',productionPromotion:false,productionConsumers:0,productionIntegration:'disconnected',persistence:false,runtimeActivation:false,automaticAction:false},null,2));
