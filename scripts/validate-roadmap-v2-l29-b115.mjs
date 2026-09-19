import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {loadCurrentConsumerAdmissionHarness} from './roadmap-v2-consumer-admission-harness.mjs';

const consumer=loadCurrentConsumerAdmissionHarness();
const satisfying=new Set(consumer.admission.readiness.mastery.contract.prerequisiteGate.satisfyingStates);
let passed=0;
const expectReject=(label,fn,pattern)=>{assert.throws(fn,pattern,label);passed++;};
const expectPass=(label,fn)=>{fn();passed++;};

function snapshot(targetId,state,phaseId='GD2',options={}){
  return {
    schema:'BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1',
    streamId:options.streamId||('B115::'+phaseId+'::'+targetId),
    targetId,phaseId,eventCount:options.eventCount??1,lastSequence:options.lastSequence??1,
    knowledgeState:state,existingCompetencyVerified:false,
    dimensions:options.dimensions||{},
    masterReadyGate:options.masterReadyGate||{passed:false,checks:{}},
    prerequisiteEligible:satisfying.has(state),persisted:options.persisted??false,transitions:[]
  };
}
function item(id,snap,options={}){
  const technicalTrack=options.technicalTrack===undefined?'math':options.technicalTrack;
  return {
    scheduleItemId:id,
    priorityCandidate:{
      schema:'BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1',
      candidateId:'B115::CANDIDATE::'+id,
      targetId:snap.targetId,phaseId:snap.phaseId,
      masterRelevance:0.8,masterRelevanceSource:'L29/B115 adversarial fixture',
      weeksUntilNeeded:8,snapshot:snap
    },
    activityKind:options.activityKind||'technical_core',
    estimatedMinutes:60,technicalTrack,
    russianTwinMinutes:technicalTrack===null?null:30,
    dueDate:null,reviewRequested:false,
    source:{kind:'registry_static',ref:'registry://'+snap.targetId,verified:true,masterModeRelation:'not_applicable'}
  };
}
function schedule(phaseId,items){
  return {schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',requestId:'B115::SCHEDULE::'+phaseId,phaseId,weekStart:'2026-09-21',weeklyCapacityMinutes:600,items};
}
function readinessRequest(phaseId='GD2',focusTargetIds=['RU-R0-C01'],items=[]){
  return {schema:'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1',reportId:'B115::READINESS::'+phaseId+'::'+focusTargetIds.join('+'),phaseId,focusTargetIds,scheduleRequest:schedule(phaseId,items),externalGates:[]};
}
function request(readiness=readinessRequest(),overrides={}){
  return {schema:'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V1',consumerId:'SHADOW::HUMAN_REVIEW',consumerClass:'human_review_shadow',readinessRequest:readiness,...overrides};
}
function event(sequence,evidenceType,payload,targetId,phaseId='GD2'){
  return {schema:'BAUMAN_ROADMAP_V2_EVIDENCE_EVENT_V1',eventId:targetId+'-B115-'+sequence,streamId:'B115::STREAM::'+targetId,sequence,targetId,phaseId,evidenceType,occurredAt:'2026-09-19T00:00:00Z',source:{kind:'b115_fixture',ref:targetId+'/'+sequence},payload};
}
function fullEvidence(targetId,phaseId='GD2'){
  return [
    event(1,'chapter_assessment',{percent:85,criticalPercent:75},targetId,phaseId),
    event(2,'exercise_set',{percent:90,completedItems:20,totalItems:20},targetId,phaseId),
    event(3,'lab_or_simulation',{passed:true,explanationAccepted:true},targetId,phaseId),
    event(4,'project_rubric',{rubric:{correctness:3,clarity:3,verification:3,reproducibility:3}},targetId,phaseId),
    event(5,'retention_check',{percent:80,daysAfterLearning:14},targetId,phaseId)
  ];
}

// 1-7: outer consumer boundary rejects privilege and identity forgery.
expectReject('request schema drift rejected',()=>consumer.projectShadowConsumer(request(readinessRequest(),{schema:'BAUMAN_ROADMAP_V2_CONSUMER_ADMISSION_REQUEST_V0'})),/schema mismatch/);
expectReject('production consumer id rejected',()=>consumer.projectShadowConsumer(request(readinessRequest(),{consumerId:'PLANNING_BRIDGE'})),/SHADOW namespace/);
expectReject('lowercase shadow id rejected',()=>consumer.projectShadowConsumer(request(readinessRequest(),{consumerId:'SHADOW::human_review'})),/SHADOW namespace/);
expectReject('unsupported consumer class rejected',()=>consumer.projectShadowConsumer(request(readinessRequest(),{consumerClass:'planning_bridge'})),/Unsupported Consumer Admission class/);
expectReject('caller admission result rejected',()=>consumer.projectShadowConsumer(request(readinessRequest(),{admissionResult:{advisoryState:'ready_for_human_review'}})),/unsupported fields/);
expectReject('caller consumer decision rejected',()=>consumer.projectShadowConsumer(request(readinessRequest(),{consumerDecision:'shadow_review_ready_for_human_review'})),/unsupported fields/);
expectReject('caller persistence authority rejected',()=>consumer.projectShadowConsumer(request(readinessRequest(),{persisted:true})),/unsupported fields/);

// 8-13: nested Readiness/Scheduler/Mastery authority remains fail-closed.
expectReject('nested readiness result rejected',()=>{const r=readinessRequest();r.readinessResult={overallColor:'green'};consumer.projectShadowConsumer(request(r));},/unsupported fields/);
expectReject('empty focus rejected',()=>consumer.projectShadowConsumer(request(readinessRequest('GD2',[],[]))),/non-empty/);
expectReject('duplicate focus rejected',()=>consumer.projectShadowConsumer(request(readinessRequest('GD2',['RU-R0-C01','RU-R0-C01'],[]))),/Duplicate Readiness focus target/);
expectReject('unknown focus rejected',()=>consumer.projectShadowConsumer(request(readinessRequest('GD2',['FORGED-TARGET'],[]))),/Unknown Readiness focus target/);
expectReject('schedule phase mismatch rejected',()=>{const r=readinessRequest();r.scheduleRequest.phaseId='GD1';consumer.projectShadowConsumer(request(r));},/phase mismatch/);
expectReject('persisted mastery rejected',()=>{const snap=snapshot('RU-R0-C01','dang_hoc','GD2',{persisted:true});consumer.projectShadowConsumer(request(readinessRequest('GD2',['RU-R0-C01'],[item('PERSISTED',snap,{technicalTrack:null,activityKind:'russian_foundation'})])));},/Persisted mastery snapshot admitted/);

// 14: unknown external gate cannot forge green.
expectReject('unknown external gate rejected',()=>{const r=readinessRequest();r.externalGates=[{gateId:'FORGED-GATE',satisfied:true,sourceRef:'forged://gate',verified:true}];consumer.projectShadowConsumer(request(r));},/Unknown Readiness external gate/);

// 15-17: all traffic-light outcomes remain shadow review only.
expectPass('red remains blocked shadow review',()=>{const out=consumer.projectShadowConsumer(request());assert.equal(out.readinessColor,'red');assert.equal(out.consumerDecision,'shadow_review_blocked');assert.equal(out.runtimeActionAuthorized,false);});
expectPass('yellow remains caution shadow review',()=>{const snap=snapshot('RU-R0-C01','dang_hoc');const out=consumer.projectShadowConsumer(request(readinessRequest('GD2',['RU-R0-C01'],[item('YELLOW',snap,{technicalTrack:null,activityKind:'russian_foundation'})])));assert.equal(out.readinessColor,'yellow');assert.equal(out.consumerDecision,'shadow_review_caution');assert.equal(out.productionConsumerConnected,false);});
expectPass('green remains human review only',()=>{const snap=consumer.admission.readiness.mastery.reduceEvidenceStream(fullEvidence('RU-R0-C01'));const out=consumer.projectShadowConsumer(request(readinessRequest('GD2',['RU-R0-C01'],[item('GREEN',snap,{technicalTrack:null,activityKind:'russian_foundation'})])));assert.equal(out.readinessColor,'green');assert.equal(out.consumerDecision,'shadow_review_ready_for_human_review');assert.equal(out.persisted,false);assert.equal(out.productionConsumerConnected,false);assert.equal(out.runtimeActionAuthorized,false);assert.equal(out.scheduleWriteAllowed,false);assert.equal(out.notificationWriteAllowed,false);});

// 18: deterministic exact authority surface.
expectPass('deterministic exact output',()=>{const snap=snapshot('RU-R0-C01','dang_hoc');const input=request(readinessRequest('GD2',['RU-R0-C01'],[item('DET',snap,{technicalTrack:null,activityKind:'russian_foundation'})]));const before=structuredClone(input);const a=consumer.projectShadowConsumer(input);const b=consumer.projectShadowConsumer(input);assert.deepEqual(input,before);assert.deepEqual(a,b);assert.deepEqual(Object.keys(a).sort(),['schema','projectionId','consumerId','consumerClass','admissionProjectionId','reportId','phaseId','weekStart','readinessColor','advisoryState','consumerDecision','persisted','productionConsumerConnected','runtimeActionAuthorized','scheduleWriteAllowed','notificationWriteAllowed'].sort());});

// 19: deep freeze blocks post-projection privilege escalation.
expectPass('deep freeze blocks escalation',()=>{const out=consumer.projectShadowConsumer(request());assert(Object.isFrozen(out));assert.throws(()=>{out.runtimeActionAuthorized=true;},TypeError);assert.throws(()=>{out.consumerDecision='shadow_review_ready_for_human_review';},TypeError);assert.equal(out.runtimeActionAuthorized,false);});

// 20: shadow adapter is not wired into runtime and has no side-effect APIs.
expectPass('runtime wiring leak scan',()=>{
  function walk(dir){return fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.posix.join(dir,e.name);return e.isDirectory()?walk(p):[p];}):[];}
  for(const file of [...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p))){
    const text=fs.readFileSync(file,'utf8');
    assert.equal(text.includes('roadmap-v2-consumer-admission-harness.mjs'),false,'Consumer Admission wiring leaked into runtime: '+file);
    assert.equal(text.includes('loadCurrentConsumerAdmissionHarness'),false,'Consumer Admission activation leaked into runtime: '+file);
  }
  const source=fs.readFileSync('scripts/roadmap-v2-consumer-admission-harness.mjs','utf8');
  for(const pattern of [/writeFileSync\s*\(/,/appendFileSync\s*\(/,/writeFile\s*\(/,/localStorage/,/sessionStorage/,/fetch\s*\(/,/XMLHttpRequest/,/child_process/,/spawn\s*\(/,/exec\s*\(/])assert.doesNotMatch(source,pattern,'Consumer Admission harness gained side-effect API: '+pattern);
});

assert.equal(passed,20);
console.log('ROADMAP_V2_L29_B115_ADVERSARIAL_CONSUMER_ADMISSION=PASS');
console.log(JSON.stringify({passed,total:20,productionConsumers:0,productionIntegration:'disconnected',persistence:false,runtimeActivation:false,automaticAction:false},null,2));
