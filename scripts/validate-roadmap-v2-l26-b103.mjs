import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {loadCurrentSchedulerHarness} from './roadmap-v2-scheduler-harness.mjs';

const scheduler=loadCurrentSchedulerHarness();
const satisfying=new Set(scheduler.priority.mastery.prerequisiteGate.satisfyingStates);
let passed=0;
const check=(name,fn)=>{fn();passed+=1;console.log(`PASS ${String(passed).padStart(2,'0')} ${name}`);};

function snapshot(targetId,state,phaseId,options={}){
  return {
    schema:'BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1',
    streamId:options.streamId||`B103::${phaseId}::${targetId}`,
    targetId,phaseId,eventCount:1,lastSequence:1,knowledgeState:state,
    existingCompetencyVerified:options.existingCompetencyVerified||false,
    dimensions:options.dimensions||{},
    masterReadyGate:{passed:state==='master_ready'},
    prerequisiteEligible:satisfying.has(state),
    persisted:false,transitions:[]
  };
}
function candidate(targetId,state,phaseId,options={}){
  return {
    schema:'BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1',
    candidateId:options.candidateId||`B103::${phaseId}::${targetId}`,
    targetId,phaseId,
    masterRelevance:options.masterRelevance??0.8,
    masterRelevanceSource:options.masterRelevanceSource||'L26/B103 adversarial fixture',
    weeksUntilNeeded:options.weeksUntilNeeded??8,
    snapshot:options.snapshot||snapshot(targetId,state,phaseId)
  };
}
function item(id,priorityCandidate,options={}){
  const technicalTrack=options.technicalTrack===undefined?'math':options.technicalTrack;
  const russianTwinMinutes=options.russianTwinMinutes===undefined?(technicalTrack===null?null:30):options.russianTwinMinutes;
  return {
    scheduleItemId:id,priorityCandidate,
    activityKind:options.activityKind||'technical_core',
    estimatedMinutes:options.estimatedMinutes||60,
    technicalTrack,russianTwinMinutes,
    dueDate:options.dueDate??null,
    reviewRequested:options.reviewRequested||false,
    source:{
      kind:options.sourceKind||'registry_static',
      ref:options.sourceRef||`registry://${priorityCandidate.targetId}`,
      verified:options.verified??true,
      masterModeRelation:options.masterModeRelation||'not_applicable'
    }
  };
}
function request(phaseId,items,options={}){
  return {
    schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',
    requestId:options.requestId||`B103::SCHEDULE::${phaseId}`,
    phaseId,
    weekStart:options.weekStart||'2026-09-21',
    weeklyCapacityMinutes:options.weeklyCapacityMinutes??600,
    items
  };
}
const currentPreview=(id,weeks=3,extra={})=>item(
  id,
  candidate('MATH-L1-C03','chua_hoc','GD3',{weeksUntilNeeded:weeks,candidateId:`B103::CURRENT::${id}`}),
  {
    activityKind:'current_subject_preview',
    sourceKind:'current_bauman_official',
    sourceRef:`official-syllabus://current/${id}`,
    masterModeRelation:'current_subject_prerequisite',
    ...extra
  }
);

check('contract and disconnected boundary pinned',()=>{
  assert.equal(scheduler.contract.version,'2.6.1-l26-b101-current');
  for(const key of ['calendarReadEnabled','calendarWriteEnabled','persistentStoreEnabled','runtimeWriteAllowed','dynamicContentGenerationAllowed']) assert.equal(scheduler.contract.mode[key],false);
  assert.equal(scheduler.contract.mode.productionIntegration,'disconnected');
});

check('Critical gap wins before weighted Priority',()=>{
  const result=scheduler.projectWeek(request('GD2',[
    item('NORMAL',candidate('MATH-L1-C03','dang_hoc','GD2',{masterRelevance:1,weeksUntilNeeded:8})),
    item('CRITICAL',candidate('MATH-L2-C07','gap','GD2',{masterRelevance:0.1,weeksUntilNeeded:4}))
  ]));
  assert.equal(result.sessions.filter(x=>x.companionOf===null)[0].scheduleItemId,'CRITICAL');
});

check('verified Current Bauman override wins after Critical',()=>{
  const result=scheduler.projectWeek(request('GD3',[
    item('STATIC',candidate('MATH-L1-C04','dang_hoc','GD3',{masterRelevance:1}),{masterModeRelation:'current_subject_prerequisite'}),
    currentPreview('CURRENT',3,{technicalTrack:'other'})
  ]));
  const primary=result.sessions.filter(x=>x.companionOf===null);
  assert.equal(primary[0].scheduleItemId,'CURRENT');
  assert(primary[0].reasonCodes.includes('VERIFIED_CURRENT_BAUMAN_OVERRIDE'));
});

check('Current Bauman provenance fails closed',()=>{
  const unverified=currentPreview('UNVERIFIED',3,{verified:false});
  assert.throws(()=>scheduler.projectWeek(request('GD3',[unverified])),/Unverified Scheduler source/);
  const wrongKind=currentPreview('WRONG-KIND');
  wrongKind.source.kind='registry_static';
  assert.throws(()=>scheduler.projectWeek(request('GD3',[wrongKind])),/lacks official source/);
  const noRelation=currentPreview('NO-RELATION');
  noRelation.source.masterModeRelation='not_applicable';
  assert.throws(()=>scheduler.projectWeek(request('GD3',[noRelation])),/lacks verified Master Mode relation/);
});

check('NIR provenance relation fails closed',()=>{
  const nir=item('NIR',candidate('MATH-L1-C03','dang_hoc','GD3'),{
    activityKind:'nir_thesis',technicalTrack:null,russianTwinMinutes:null,
    sourceKind:'nir_plan_verified',sourceRef:'nir-plan://verified/1',
    masterModeRelation:'not_applicable'
  });
  assert.throws(()=>scheduler.projectWeek(request('GD3',[nir])),/NIR activity lacks verified Master Mode relation/);
  nir.source.masterModeRelation='nir_thesis_prerequisite';
  assert.doesNotThrow(()=>scheduler.projectWeek(request('GD3',[nir])));
});

check('preview window is exactly 2-4 weeks',()=>{
  for(const weeks of [2,3,4]) assert.doesNotThrow(()=>scheduler.projectWeek(request('GD3',[currentPreview(`OK-${weeks}`,weeks)],{requestId:`OK-${weeks}`})));
  for(const weeks of [1,5]) assert.throws(()=>scheduler.projectWeek(request('GD3',[currentPreview(`BAD-${weeks}`,weeks)],{requestId:`BAD-${weeks}`})),/outside 2-4 week window/);
});

check('dynamic template IDs remain fail-closed',()=>{
  assert(scheduler.blockedDynamicTargetIds.includes('CUR-L4-C03'));
  const blocked=candidate('CUR-L4-C03','chua_hoc','GD3',{weeksUntilNeeded:3});
  assert.throws(()=>scheduler.projectWeek(request('GD3',[item('DYNAMIC',blocked,{
    activityKind:'current_subject_preview',sourceKind:'current_bauman_official',
    sourceRef:'official-syllabus://uninstantiated',
    masterModeRelation:'current_subject_prerequisite'
  })])),/requires real syllabus instance/);
});

check('GD3 unrelated static work is deferred',()=>{
  const result=scheduler.projectWeek(request('GD3',[
    item('RELATED',candidate('MATH-L1-C03','dang_hoc','GD3'),{activityKind:'bridge',masterModeRelation:'current_subject_prerequisite'}),
    item('UNRELATED',candidate('MATH-L1-C04','dang_hoc','GD3'),{masterModeRelation:'unrelated_static'})
  ]));
  assert(result.sessions.some(x=>x.scheduleItemId==='RELATED'));
  assert(result.deferred.some(x=>x.scheduleItemId==='UNRELATED'&&x.reason==='GD3_UNRELATED_STATIC_DEFERRED'));
});

check('Russian twin is required and remains placeholder-only',()=>{
  for(const phaseId of ['GD1','GD2','GD3']){
    const missing=item(`MISS-${phaseId}`,candidate('MATH-L1-C03','dang_hoc',phaseId),{
      russianTwinMinutes:null,
      masterModeRelation:phaseId==='GD3'?'current_subject_prerequisite':'not_applicable'
    });
    assert.throws(()=>scheduler.projectWeek(request(phaseId,[missing])),/Required Russian twin budget missing/);
  }
  const result=scheduler.projectWeek(request('GD2',[item('TWIN',candidate('MATH-L1-C03','dang_hoc','GD2'))]));
  assert.equal(result.sessions[1].activityKind,'russian_twin_placeholder');
  assert(result.sessions[1].reasonCodes.includes('CONTENT_GENERATION_DISABLED'));
});

check('technical and Russian twin bundle is capacity-atomic',()=>{
  const result=scheduler.projectWeek(request('GD2',[
    item('ATOMIC',candidate('MATH-L2-C07','gap','GD2',{weeksUntilNeeded:4}))
  ],{weeklyCapacityMinutes:89}));
  assert.equal(result.sessions.length,0);
  assert.equal(result.usedMinutes,0);
  assert.equal(result.deferred[0].reason,'WEEKLY_CAPACITY_ATOMIC_BUNDLE');
  assert.equal(result.readiness.ready,false);
});

check('Existing Competency requires explicit review request',()=>{
  const retained=snapshot('MATH-L1-C03','dat_prerequisite','GD2',{
    existingCompetencyVerified:true,
    dimensions:{diagnostic:{scorePercent:90,criticalPercent:80},retention:{percent:80,daysAfterLearning:14}}
  });
  const c=candidate('MATH-L1-C03','dat_prerequisite','GD2',{snapshot:retained});
  const omitted=scheduler.projectWeek(request('GD2',[item('REVIEW',c,{activityKind:'retention_review'})]));
  assert.equal(omitted.deferred[0].reason,'REVIEW_ON_DEMAND_NOT_REQUESTED');
  const explicit=scheduler.projectWeek(request('GD2',[item('REVIEW',c,{activityKind:'retention_review',reviewRequested:true})]));
  assert(explicit.sessions.length>0);
  assert.equal(scheduler.priority.scoreCandidate(c).masterReady,false);
});

check('GD1 rotates distinct Python Database Math tracks',()=>{
  const result=scheduler.projectWeek(request('GD1',[
    item('PY',candidate('PY-L1-C02','dang_hoc','GD1'),{technicalTrack:'python'}),
    item('DB',candidate('DB-L1-C02','dang_hoc','GD1'),{technicalTrack:'database'}),
    item('MATH',candidate('MATH-L1-C03','dang_hoc','GD1'),{technicalTrack:'math'}),
    item('PY2',candidate('PY-L1-C03','dang_hoc','GD1'),{technicalTrack:'python'}),
    item('OTHER',candidate('MATH-L1-C04','dang_hoc','GD1'),{technicalTrack:'other'})
  ]));
  assert.equal(result.readiness.gd1TechnicalSessionCount,3);
  assert.equal(result.readiness.gd1MinimumAdvisoryMet,true);
  assert(result.deferred.some(x=>x.reason==='GD1_TRACK_ALREADY_SELECTED'));
  assert(result.deferred.some(x=>x.reason==='GD1_NON_ROTATION_TRACK_DEFERRED'));
});

check('GD1 advisory reports insufficient technical breadth',()=>{
  const result=scheduler.projectWeek(request('GD1',[
    item('PY',candidate('PY-L1-C02','dang_hoc','GD1'),{technicalTrack:'python'})
  ]));
  assert.equal(result.readiness.gd1TechnicalSessionCount,1);
  assert.equal(result.readiness.gd1MinimumAdvisoryMet,false);
  assert.equal(result.readiness.ready,false);
});

check('duplicate item candidate and target identities are rejected',()=>{
  const first=item('DUP',candidate('MATH-L1-C03','dang_hoc','GD2'));
  assert.throws(()=>scheduler.projectWeek(request('GD2',[first,item('DUP',candidate('MATH-L1-C04','dang_hoc','GD2'))])),/Duplicate Scheduler item ID/);
  assert.throws(()=>scheduler.projectWeek(request('GD2',[first,item('OTHER',candidate('MATH-L1-C04','dang_hoc','GD2',{candidateId:first.priorityCandidate.candidateId}))])),/Duplicate Scheduler Priority candidate ID/);
  assert.throws(()=>scheduler.projectWeek(request('GD2',[first,item('OTHER',candidate('MATH-L1-C03','dang_hoc','GD2',{candidateId:'OTHER'}))])),/Duplicate Scheduler target ID/);
});

check('caller-derived Priority overrides and malformed requests are rejected',()=>{
  const supplied=item('SUPPLIED',candidate('MATH-L1-C03','dang_hoc','GD2'));
  supplied.priorityResult={disposition:'critical'};
  assert.throws(()=>scheduler.projectWeek(request('GD2',[supplied])),/unsupported fields/);
  const overridden=item('OVERRIDE',candidate('MATH-L1-C03','dang_hoc','GD2'));
  overridden.priorityCandidate.weightedScore=100;
  assert.throws(()=>scheduler.projectWeek(request('GD2',[overridden])),/(override is forbidden|unsupported fields)/);
  const mismatch=item('MISMATCH',candidate('MATH-L1-C03','dang_hoc','GD3'));
  assert.throws(()=>scheduler.projectWeek(request('GD2',[mismatch])),/phase mismatch/);
  const valid=item('VALID',candidate('MATH-L1-C03','dang_hoc','GD2'));
  assert.throws(()=>scheduler.projectWeek(request('GD2',[valid],{weekStart:'2026-02-30'})),/Invalid Scheduler week start/);
  assert.throws(()=>scheduler.projectWeek({...request('GD2',[valid]),weeklyCapacityMinutes:0}),/Invalid Scheduler weekly capacity/);
});

check('projection is deterministic deeply frozen and side-effect free',()=>{
  const input=request('GD2',[item('FROZEN',candidate('MATH-L1-C03','dang_hoc','GD2'))]);
  const a=scheduler.projectWeek(input),b=scheduler.projectWeek(input);
  assert.deepEqual(a,b);
  assert(Object.isFrozen(a)&&Object.isFrozen(a.sessions)&&Object.isFrozen(a.sessions[0]));
  assert.equal(a.calendarWriteAllowed,false);
  assert.equal(a.persisted,false);
  assert.equal(a.runtimeWriteAllowed,false);
  assert.throws(()=>{a.usedMinutes=999;},TypeError);
  const source=fs.readFileSync('scripts/roadmap-v2-scheduler-harness.mjs','utf8');
  for(const forbidden of [/writeFileSync\s*\(/,/appendFileSync\s*\(/,/writeFile\s*\(/,/localStorage/,/sessionStorage/,/fetch\s*\(/,/XMLHttpRequest/,/child_process/,/spawn\s*\(/,/exec\s*\(/]) assert.doesNotMatch(source,forbidden);
  function walk(dir){return fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[p];}):[];}
  for(const file of [...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p))){
    const text=fs.readFileSync(file,'utf8');
    assert.equal(text.includes('roadmap-v2-scheduler-harness.mjs'),false,`runtime wiring leaked: ${file}`);
    assert.equal(text.includes('loadCurrentSchedulerHarness'),false,`runtime activation leaked: ${file}`);
  }
});

assert.equal(passed,16);
console.log('ROADMAP_V2_L26_B103_ADVERSARIAL_SCHEDULER=PASS');
console.log(JSON.stringify({tests:passed,provenanceRelationFailClosed:true,previewWindow:'2-4',gd1Rotation:true,reviewOnDemand:true,duplicateRejection:true,capacityAtomic:true,deterministic:true,deepFrozen:true,productionIntegration:'disconnected'},null,2));
