import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {loadCurrentPromotionEligibilityHarness} from './roadmap-v2-promotion-eligibility-harness.mjs';

const promotion=loadCurrentPromotionEligibilityHarness();
const satisfying=new Set(promotion.human.consumer.admission.readiness.mastery.contract.prerequisiteGate.satisfyingStates);
let passed=0;
const expectReject=(label,fn,pattern)=>{assert.throws(fn,pattern,label);passed++;};
const expectPass=(label,fn)=>{fn();passed++;};

function snapshot(targetId,state,phaseId='GD2',options={}){return {schema:'BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1',streamId:options.streamId||('B123::'+phaseId+'::'+targetId),targetId,phaseId,eventCount:options.eventCount??1,lastSequence:options.lastSequence??1,knowledgeState:state,existingCompetencyVerified:false,dimensions:options.dimensions||{},masterReadyGate:options.masterReadyGate||{passed:false,checks:{}},prerequisiteEligible:satisfying.has(state),persisted:options.persisted??false,transitions:[]};}
function item(id,snap,options={}){const technicalTrack=options.technicalTrack===undefined?'math':options.technicalTrack;return {scheduleItemId:id,priorityCandidate:{schema:'BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1',candidateId:'B123::CANDIDATE::'+id,targetId:snap.targetId,phaseId:snap.phaseId,masterRelevance:0.8,masterRelevanceSource:'L31/B123 adversarial fixture',weeksUntilNeeded:8,snapshot:snap},activityKind:options.activityKind||'technical_core',estimatedMinutes:60,technicalTrack,russianTwinMinutes:technicalTrack===null?null:30,dueDate:null,reviewRequested:false,source:{kind:'registry_static',ref:'registry://'+snap.targetId,verified:true,masterModeRelation:'not_applicable'}};}
function schedule(phaseId,items){return {schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',requestId:'B123::SCHEDULE::'+phaseId,phaseId,weekStart:'2026-09-21',weeklyCapacityMinutes:600,items};}
function readiness(phaseId='GD2',focusTargetIds=['RU-R0-C01'],items=[]){return {schema:'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1',reportId:'B123::READINESS::'+phaseId+'::'+focusTargetIds.join('+'),phaseId,focusTargetIds,scheduleRequest:schedule(phaseId,items),externalGates:[]};}
function consumer(readinessRequest,overrides={}){return {schema:'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V1',consumerId:'SHADOW::HUMAN_REVIEW',consumerClass:'human_review_shadow',readinessRequest,...overrides};}
function human(readinessRequest=readiness(),decision='accepted_for_shadow_analysis',reasons=['B123_REVIEW'],overrides={}){return {schema:'BAUMAN_ROADMAP_V2_HUMAN_REVIEW_REQUEST_V1',reviewerRef:'REVIEWER::B123',reviewDecision:decision,reasonCodes:reasons,consumerAdmissionRequest:consumer(readinessRequest),...overrides};}
function request(humanReviewRequest=human(),overrides={}){return {schema:'BAUMAN_ROADMAP_V2_PROMOTION_ELIGIBILITY_REQUEST_V1',candidateRef:'CANDIDATE::B123',humanReviewRequest,...overrides};}
function event(sequence,evidenceType,payload,targetId,phaseId='GD2'){return {schema:'BAUMAN_ROADMAP_V2_EVIDENCE_EVENT_V1',eventId:targetId+'-B123-'+sequence,streamId:'B123::STREAM::'+targetId,sequence,targetId,phaseId,evidenceType,occurredAt:'2026-09-19T00:00:00Z',source:{kind:'b123_fixture',ref:targetId+'/'+sequence},payload};}
function fullEvidence(targetId,phaseId='GD2'){return [event(1,'chapter_assessment',{percent:85,criticalPercent:75},targetId,phaseId),event(2,'exercise_set',{percent:90,completedItems:20,totalItems:20},targetId,phaseId),event(3,'lab_or_simulation',{passed:true,explanationAccepted:true},targetId,phaseId),event(4,'project_rubric',{rubric:{correctness:3,clarity:3,verification:3,reproducibility:3}},targetId,phaseId),event(5,'retention_check',{percent:80,daysAfterLearning:14},targetId,phaseId)];}

// 1-7: outer Promotion Eligibility boundary.
expectReject('eligibility schema drift rejected',()=>promotion.projectEligibility(request(human(),{schema:'BAUMAN_ROADMAP_V2_PROMOTION_ELIGIBILITY_REQUEST_V0'})),/schema mismatch/);
expectReject('candidate namespace rejected',()=>promotion.projectEligibility(request(human(),{candidateRef:'PRODUCTION'})),/CANDIDATE namespace/);
expectReject('lowercase candidate rejected',()=>promotion.projectEligibility(request(human(),{candidateRef:'CANDIDATE::candidate'})),/CANDIDATE namespace/);
expectReject('caller eligibility state rejected',()=>promotion.projectEligibility(request(human(),{eligibilityState:'eligible_for_release_review'})),/unsupported fields/);
expectReject('caller release authorization rejected',()=>promotion.projectEligibility(request(human(),{releaseReviewAuthorized:true})),/unsupported fields/);
expectReject('caller production promotion rejected',()=>promotion.projectEligibility(request(human(),{productionPromotionAuthorized:true})),/unsupported fields/);
expectReject('caller human review result rejected',()=>promotion.projectEligibility(request(human(),{humanReviewResult:{effectiveReviewState:'review_accepted_shadow_only'}})),/unsupported fields/);

// 8-15: nested Human Review / Consumer Admission / Readiness / Mastery authority.
expectReject('human review schema drift rejected',()=>promotion.projectEligibility(request(human(readiness(),'accepted_for_shadow_analysis',['OK'],{schema:'BAUMAN_ROADMAP_V2_HUMAN_REVIEW_REQUEST_V0'}))),/schema mismatch/);
expectReject('reviewer identity rejected',()=>promotion.projectEligibility(request(human(readiness(),'accepted_for_shadow_analysis',['OK'],{reviewerRef:'ADMIN'}))),/REVIEWER namespace/);
expectReject('production human decision rejected',()=>promotion.projectEligibility(request(human(readiness(),'promote_to_production',['OK']))),/Unsupported Human Review decision/);
expectReject('empty reason codes rejected',()=>promotion.projectEligibility(request(human(readiness(),'needs_revision',[]))),/count out of range/);
expectReject('production consumer impersonation rejected',()=>{const h=human();h.consumerAdmissionRequest.consumerId='PLANNING_BRIDGE';promotion.projectEligibility(request(h));},/SHADOW namespace/);
expectReject('consumer class impersonation rejected',()=>{const h=human();h.consumerAdmissionRequest.consumerClass='planning_bridge';promotion.projectEligibility(request(h));},/Unsupported Consumer Admission class/);
expectReject('nested readiness authority rejected',()=>{const h=human();h.consumerAdmissionRequest.readinessRequest.overallColor='green';promotion.projectEligibility(request(h));},/unsupported fields/);
expectReject('persisted mastery rejected',()=>{const s=snapshot('RU-R0-C01','dang_hoc','GD2',{persisted:true});promotion.projectEligibility(request(human(readiness('GD2',['RU-R0-C01'],[item('PERSISTED',s,{technicalTrack:null,activityKind:'russian_foundation'})]))));},/Persisted mastery snapshot admitted/);

// 16-20: eligibility mapping never widens authority.
expectPass('red accepted review remains ineligible',()=>{const out=promotion.projectEligibility(request());assert.equal(out.sourceReadinessColor,'red');assert.equal(out.sourceHumanReviewState,'review_blocked_upstream');assert.equal(out.eligibilityState,'not_eligible_upstream_blocked');assert.equal(out.releaseReviewAuthorized,false);});
expectPass('yellow accepted review remains ineligible',()=>{const s=snapshot('RU-R0-C01','dang_hoc');const out=promotion.projectEligibility(request(human(readiness('GD2',['RU-R0-C01'],[item('YELLOW',s,{technicalTrack:null,activityKind:'russian_foundation'})]))));assert.equal(out.sourceReadinessColor,'yellow');assert.equal(out.eligibilityState,'not_eligible_upstream_blocked');assert.equal(out.productionPromotionAuthorized,false);});
expectPass('needs revision remains ineligible',()=>{const out=promotion.projectEligibility(request(human(readiness(),'needs_revision',['FIX'])));assert.equal(out.eligibilityState,'not_eligible_needs_revision');assert.equal(out.productionPromotionAuthorized,false);});
expectPass('rejected remains ineligible',()=>{const out=promotion.projectEligibility(request(human(readiness(),'rejected',['NO'])));assert.equal(out.eligibilityState,'not_eligible_rejected');assert.equal(out.releaseReviewAuthorized,false);});
expectPass('green accepted review becomes eligibility only',()=>{const s=promotion.human.consumer.admission.readiness.mastery.reduceEvidenceStream(fullEvidence('RU-R0-C01'));const out=promotion.projectEligibility(request(human(readiness('GD2',['RU-R0-C01'],[item('GREEN',s,{technicalTrack:null,activityKind:'russian_foundation'})]),'accepted_for_shadow_analysis',['READY'])));assert.equal(out.sourceReadinessColor,'green');assert.equal(out.sourceHumanReviewState,'review_accepted_shadow_only');assert.equal(out.eligibilityState,'eligible_for_release_review');assert.equal(out.releaseReviewAuthorized,false);assert.equal(out.productionPromotionAuthorized,false);assert.equal(out.productionConsumerConnected,false);assert.equal(out.runtimeActionAuthorized,false);});

// 21: deterministic exact output surface.
expectPass('deterministic exact output',()=>{const input=request(human(readiness(),'needs_revision',['DET']));const before=structuredClone(input);const a=promotion.projectEligibility(input),b=promotion.projectEligibility(input);assert.deepEqual(input,before);assert.deepEqual(a,b);assert.deepEqual(Object.keys(a).sort(),['schema','projectionId','candidateRef','humanReviewReceiptId','reportId','phaseId','weekStart','sourceReadinessColor','sourceHumanReviewState','eligibilityState','persisted','releaseReviewAuthorized','productionPromotionAuthorized','productionConsumerConnected','runtimeActionAuthorized','scheduleWriteAllowed','notificationWriteAllowed'].sort());});

// 22: deep freeze blocks post-projection escalation.
expectPass('deep freeze blocks escalation',()=>{const out=promotion.projectEligibility(request(human(readiness(),'needs_revision',['FREEZE'])));assert(Object.isFrozen(out));assert.throws(()=>{out.releaseReviewAuthorized=true;},TypeError);assert.throws(()=>{out.productionPromotionAuthorized=true;},TypeError);assert.throws(()=>{out.eligibilityState='eligible_for_release_review';},TypeError);assert.equal(out.releaseReviewAuthorized,false);});

// 23: manual override cannot be injected.
expectReject('manual override rejected',()=>promotion.projectEligibility(request(human(),{manualOverride:true})),/unsupported fields/);

// 24: no runtime wiring or side-effect APIs.
expectPass('runtime wiring leak scan',()=>{
  function walk(dir){return fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.posix.join(dir,e.name);return e.isDirectory()?walk(p):[p];}):[];}
  for(const file of [...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p))){const text=fs.readFileSync(file,'utf8');for(const ref of ['roadmap-v2-promotion-eligibility-harness.mjs','loadCurrentPromotionEligibilityHarness','BAUMAN_ROADMAP_V2_PROMOTION_ELIGIBILITY_CONTRACT_V1'])assert.equal(text.includes(ref),false,'Promotion Eligibility wiring leaked into runtime: '+file+' -> '+ref);}
  const source=fs.readFileSync('scripts/roadmap-v2-promotion-eligibility-harness.mjs','utf8');
  for(const pattern of [/writeFileSync\s*\(/,/appendFileSync\s*\(/,/writeFile\s*\(/,/localStorage/,/sessionStorage/,/fetch\s*\(/,/XMLHttpRequest/,/child_process/,/spawn\s*\(/,/exec\s*\(/])assert.doesNotMatch(source,pattern,'Promotion Eligibility harness gained side-effect API: '+pattern);
});

assert.equal(passed,24);
console.log('ROADMAP_V2_L31_B123_ADVERSARIAL_PROMOTION_ELIGIBILITY=PASS');
console.log(JSON.stringify({passed,total:24,releaseReviewAuthorized:false,productionPromotion:false,productionConsumers:0,productionIntegration:'disconnected',persistence:false,runtimeActivation:false,automaticAction:false},null,2));
