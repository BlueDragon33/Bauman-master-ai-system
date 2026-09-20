import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {loadCurrentAdmissionHarness} from './roadmap-v2-admission-harness.mjs';

const admission=loadCurrentAdmissionHarness();
const satisfying=new Set(admission.readiness.mastery.contract.prerequisiteGate.satisfyingStates);
let passed=0;
const expectReject=(label,fn,pattern)=>{
  assert.throws(fn,pattern,label);
  passed++;
};
const expectPass=(label,fn)=>{
  fn();
  passed++;
};

function snapshot(targetId,state,phaseId='GD2',options={}){
  return {
    schema:'BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1',
    streamId:options.streamId||`B111::${phaseId}::${targetId}`,
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
      candidateId:`B111::CANDIDATE::${id}`,
      targetId:snap.targetId,phaseId:snap.phaseId,
      masterRelevance:0.8,masterRelevanceSource:'L28/B111 adversarial fixture',
      weeksUntilNeeded:8,snapshot:snap
    },
    activityKind:options.activityKind||'technical_core',
    estimatedMinutes:60,
    technicalTrack,
    russianTwinMinutes:technicalTrack===null?null:30,
    dueDate:null,reviewRequested:false,
    source:{kind:'registry_static',ref:`registry://${snap.targetId}`,verified:true,masterModeRelation:'not_applicable'}
  };
}
function schedule(phaseId,items){
  return {schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',requestId:`B111::SCHEDULE::${phaseId}`,phaseId,weekStart:'2026-09-21',weeklyCapacityMinutes:600,items};
}
function request(phaseId='GD2',focusTargetIds=['RU-R0-C01'],items=[]){
  return {schema:'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1',reportId:`B111::READINESS::${phaseId}::${focusTargetIds.join('+')}`,phaseId,focusTargetIds,scheduleRequest:schedule(phaseId,items),externalGates:[]};
}
function event(sequence,evidenceType,payload,targetId,phaseId='GD2'){
  return {schema:'BAUMAN_ROADMAP_V2_EVIDENCE_EVENT_V1',eventId:`${targetId}-B111-${sequence}`,streamId:`B111::STREAM::${targetId}`,sequence,targetId,phaseId,evidenceType,occurredAt:'2026-09-19T00:00:00Z',source:{kind:'b111_fixture',ref:`${targetId}/${sequence}`},payload};
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

// 1-2: caller-supplied Readiness authority is always rejected.
expectReject('forged readiness result rejected',()=>{
  const bad=request(); bad.readinessResult={schema:'BAUMAN_ROADMAP_V2_READINESS_RESULT_V1',overallColor:'green'};
  admission.projectAdvisory(bad);
},/unsupported fields/);
expectReject('forged readiness color rejected',()=>{
  const bad=request(); bad.overallColor='green';
  admission.projectAdvisory(bad);
},/unsupported fields/);

// 3-5: schema/persistence/action authority injection cannot cross the request boundary.
expectReject('request schema drift rejected',()=>{
  const bad=request(); bad.schema='BAUMAN_ROADMAP_V2_READINESS_REQUEST_V0';
  admission.projectAdvisory(bad);
},/schema mismatch/);
expectReject('persisted result injection rejected',()=>{
  const bad=request(); bad.persisted=true;
  admission.projectAdvisory(bad);
},/unsupported fields/);
expectReject('automatic action injection rejected',()=>{
  const bad=request(); bad.runtimeActionAuthorized=true; bad.productionConsumerConnected=true;
  admission.projectAdvisory(bad);
},/unsupported fields/);

// 6-9: malformed/ambiguous targets fail closed.
expectReject('empty targets rejected',()=>admission.projectAdvisory(request('GD2',[],[])),/non-empty/);
expectReject('duplicate target rejected',()=>admission.projectAdvisory(request('GD2',['RU-R0-C01','RU-R0-C01'],[])),/Duplicate Readiness focus target/);
expectReject('unknown target rejected',()=>admission.projectAdvisory(request('GD2',['FORGED-TARGET'],[])),/Unknown Readiness focus target/);
expectReject('non-string target rejected',()=>admission.projectAdvisory(request('GD2',[42],[])),/Invalid Readiness focus target/);

// 10-11: downstream schedule and mastery persistence cannot be smuggled through Admission.
expectReject('schedule phase mismatch rejected',()=>{
  const bad=request('GD2',['RU-R0-C01'],[]); bad.scheduleRequest.phaseId='GD1';
  admission.projectAdvisory(bad);
},/phase mismatch/);
expectReject('persisted mastery snapshot rejected',()=>{
  const snap=snapshot('RU-R0-C01','dang_hoc','GD2',{persisted:true});
  admission.projectAdvisory(request('GD2',['RU-R0-C01'],[item('PERSISTED',snap,{technicalTrack:null,activityKind:'russian_foundation'})]));
},/Persisted mastery snapshot admitted/);

// 12: unknown/unverified external consumer gate cannot forge admission.
expectReject('unknown external gate rejected',()=>{
  const bad=request();
  bad.externalGates=[{gateId:'FORGED-GATE',satisfied:true,sourceRef:'forged://gate',verified:true}];
  admission.projectAdvisory(bad);
},/Unknown Readiness external gate/);

// 13-15: red/yellow/green stay advisory only.
expectPass('red remains blocked advisory',()=>{
  const out=admission.projectAdvisory(request());
  assert.equal(out.readinessColor,'red');
  assert.equal(out.advisoryState,'blocked');
  assert.equal(out.runtimeActionAuthorized,false);
});
expectPass('yellow remains caution advisory',()=>{
  const snap=snapshot('RU-R0-C01','dang_hoc');
  const out=admission.projectAdvisory(request('GD2',['RU-R0-C01'],[item('YELLOW',snap,{technicalTrack:null,activityKind:'russian_foundation'})]));
  assert.equal(out.readinessColor,'yellow');
  assert.equal(out.advisoryState,'caution');
  assert.equal(out.runtimeActionAuthorized,false);
});
expectPass('green remains human-review only',()=>{
  const snap=admission.readiness.mastery.reduceEvidenceStream(fullEvidence('RU-R0-C01'));
  const out=admission.projectAdvisory(request('GD2',['RU-R0-C01'],[item('GREEN',snap,{technicalTrack:null,activityKind:'russian_foundation'})]));
  assert.equal(out.readinessColor,'green');
  assert.equal(out.advisoryState,'ready_for_human_review');
  assert.equal(out.productionConsumerConnected,false);
  assert.equal(out.runtimeActionAuthorized,false);
  assert.equal(out.scheduleWriteAllowed,false);
  assert.equal(out.notificationWriteAllowed,false);
});

// 16: deterministic aggregation and exact output authority flags.
expectPass('deterministic aggregation',()=>{
  const snap=snapshot('RU-R0-C01','dang_hoc');
  const input=request('GD2',['RU-R0-C01'],[item('DETERMINISM',snap,{technicalTrack:null,activityKind:'russian_foundation'})]);
  const before=structuredClone(input);
  const a=admission.projectAdvisory(input);
  const b=admission.projectAdvisory(input);
  assert.deepEqual(a,b);
  assert.deepEqual(input,before);
  assert.deepEqual(Object.keys(a).sort(),[
    'advisoryState','counts','notificationWriteAllowed','persisted','phaseId','productionConsumerConnected',
    'projectionId','readinessColor','reportId','runtimeActionAuthorized','scheduleReadiness',
    'scheduleWriteAllowed','targetSummaries','weekStart','schema'
  ].sort());
});

// 17: deep-freeze prevents post-projection privilege escalation.
expectPass('deep freeze blocks mutation escalation',()=>{
  const out=admission.projectAdvisory(request());
  assert(Object.isFrozen(out));
  assert(Object.isFrozen(out.targetSummaries));
  assert(Object.isFrozen(out.targetSummaries[0]));
  assert.throws(()=>{out.runtimeActionAuthorized=true;},TypeError);
  assert.throws(()=>{out.advisoryState='ready_for_human_review';},TypeError);
  assert.equal(out.runtimeActionAuthorized,false);
});

// 18: no consumer/runtime wiring or side-effect API leaks.
expectPass('runtime wiring leak scan',()=>{
  const forbiddenRefs=['roadmap-v2-admission-harness.mjs','loadCurrentAdmissionHarness'];
  const forbiddenApis=[/localStorage/,/sessionStorage/,/fetch\s*\(/,/XMLHttpRequest/,/writeFileSync\s*\(/,/appendFileSync\s*\(/,/child_process/,/spawn\s*\(/,/exec\s*\(/];
  function walk(dir){return fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.posix.join(dir,e.name);return e.isDirectory()?walk(p):[p];}):[];}
  for(const file of [...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p))){
    const text=fs.readFileSync(file,'utf8');
    for(const ref of forbiddenRefs)assert.equal(text.includes(ref),false,`Admission consumer wiring leaked into runtime: ${file} -> ${ref}`);
  }
  const harnessSource=fs.readFileSync('scripts/roadmap-v2-admission-harness.mjs','utf8');
  for(const pattern of forbiddenApis)assert.doesNotMatch(harnessSource,pattern,`Admission harness gained side-effect API: ${pattern}`);
});

assert.equal(passed,18);
console.log('ROADMAP_V2_L28_B111_ADVERSARIAL_ADMISSION=PASS');
console.log(JSON.stringify({passed,total:18,productionIntegration:'disconnected',automaticAction:false,persistence:false},null,2));
