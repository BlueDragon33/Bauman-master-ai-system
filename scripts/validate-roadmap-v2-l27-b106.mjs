import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {loadCurrentReadinessHarness} from './roadmap-v2-readiness-harness.mjs';

const readiness=loadCurrentReadinessHarness();
const satisfying=new Set(readiness.mastery.contract.prerequisiteGate.satisfyingStates);

function snapshot(targetId,state,phaseId='GD2',options={}){
  return {
    schema:'BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1',
    streamId:options.streamId||`B106::${phaseId}::${targetId}`,
    targetId,phaseId,eventCount:options.eventCount??1,lastSequence:options.lastSequence??1,
    knowledgeState:state,existingCompetencyVerified:options.existingCompetencyVerified||false,
    dimensions:options.dimensions||{},
    masterReadyGate:options.masterReadyGate||{passed:false,checks:{}},
    prerequisiteEligible:satisfying.has(state),persisted:false,transitions:[]
  };
}
function item(id,snap,options={}){
  const technicalTrack=options.technicalTrack===undefined?'math':options.technicalTrack;
  return {
    scheduleItemId:id,
    priorityCandidate:{
      schema:'BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1',
      candidateId:options.candidateId||`B106::CANDIDATE::${id}`,
      targetId:snap.targetId,phaseId:snap.phaseId,
      masterRelevance:options.masterRelevance??0.8,
      masterRelevanceSource:'L27/B106 readiness fixture',
      weeksUntilNeeded:options.weeksUntilNeeded??8,
      snapshot:snap
    },
    activityKind:options.activityKind||'technical_core',
    estimatedMinutes:options.estimatedMinutes||60,
    technicalTrack,
    russianTwinMinutes:options.russianTwinMinutes===undefined?(technicalTrack===null?null:30):options.russianTwinMinutes,
    dueDate:null,reviewRequested:options.reviewRequested||false,
    source:{kind:'registry_static',ref:`registry://${snap.targetId}`,verified:true,masterModeRelation:options.masterModeRelation||'not_applicable'}
  };
}
function schedule(phaseId,items,capacity=600){
  return {schema:'BAUMAN_ROADMAP_V2_SCHEDULER_REQUEST_V1',requestId:`B106::SCHEDULE::${phaseId}`,phaseId,weekStart:'2026-09-21',weeklyCapacityMinutes:capacity,items};
}
function request(phaseId,focusTargetIds,items,options={}){
  return {schema:'BAUMAN_ROADMAP_V2_READINESS_REQUEST_V1',reportId:options.reportId||`B106::READINESS::${phaseId}`,phaseId,focusTargetIds,scheduleRequest:options.scheduleRequest||schedule(phaseId,items,options.capacity??600),externalGates:options.externalGates||[]};
}
function gate(gateId,satisfied=true,verified=true){
  return {gateId,satisfied,sourceRef:`verified://${gateId}`,verified};
}
function event(sequence,evidenceType,payload,targetId,phaseId='GD2'){
  return {schema:'BAUMAN_ROADMAP_V2_EVIDENCE_EVENT_V1',eventId:`${targetId}-B106-${sequence}`,streamId:`B106::STREAM::${targetId}`,sequence,targetId,phaseId,evidenceType,occurredAt:'2026-09-19T00:00:00Z',source:{kind:'b106_fixture',ref:`${targetId}/${sequence}`},payload};
}
function fullEvidence(targetId,phaseId='GD2'){
  const xs=[
    event(1,'chapter_assessment',{percent:85,criticalPercent:75},targetId,phaseId),
    event(2,'exercise_set',{percent:90,completedItems:20,totalItems:20},targetId,phaseId),
    event(3,'lab_or_simulation',{passed:true,explanationAccepted:true},targetId,phaseId),
    event(4,'project_rubric',{rubric:{correctness:3,clarity:3,verification:3,reproducibility:3}},targetId,phaseId),
    event(5,'retention_check',{percent:80,daysAfterLearning:14},targetId,phaseId)
  ];
  if(['GD2','GD3'].includes(phaseId)&&!targetId.startsWith('RU-'))xs.push(event(6,'russian_technical_terms',{verifiedTermCount:5},targetId,phaseId));
  return xs;
}

assert.equal(readiness.contract.version,'2.7.2-l27-b105-h2-current');
assert.equal(readiness.contract.targetPolicy.prerequisiteResolution,'chapter_policy_inherited_by_lessons');
assert.equal(readiness.contract.mode.productionIntegration,'disconnected');

// Missing focus evidence is red.
{
  const result=readiness.projectReadiness(request('GD2',['RU-R0-C01'],[]));
  assert.equal(result.overallColor,'red');
  assert(result.targets[0].reasonCodes.includes('FOCUS_MASTERY_EVIDENCE_MISSING'));
}

// Prerequisite-ready but incomplete mastery is yellow.
{
  const s=snapshot('RU-R0-C01','dang_hoc');
  const result=readiness.projectReadiness(request('GD2',['RU-R0-C01'],[
    item('RU-PROGRESS',s,{technicalTrack:null,activityKind:'russian_foundation'})
  ]));
  assert.equal(result.overallColor,'yellow');
  assert.equal(result.targets[0].prerequisiteReady,true);
  assert.equal(result.targets[0].masterReady,false);
}

// Green only from reducer-produced Master-ready evidence.
{
  const complete=readiness.mastery.reduceEvidenceStream(fullEvidence('RU-R0-C01'));
  const result=readiness.projectReadiness(request('GD2',['RU-R0-C01'],[
    item('RU-MASTER',complete,{technicalTrack:null,activityKind:'russian_foundation'})
  ]));
  assert.equal(result.overallColor,'green');
  assert.equal(result.targets[0].masterReady,true);
}

// Bare forged Master-ready remains red.
{
  const forged=snapshot('RU-R0-C01','master_ready','GD2',{masterReadyGate:{passed:false,checks:{}}});
  const result=readiness.projectReadiness(request('GD2',['RU-R0-C01'],[
    item('RU-FORGED',forged,{technicalTrack:null,activityKind:'russian_foundation'})
  ]));
  assert.equal(result.overallColor,'red');
  assert(result.targets[0].reasonCodes.includes('MASTER_READY_GATE_UNVERIFIED'));
}

// Verified external gate is required and missing/false gate fails closed.
{
  const s=snapshot('MATH-L0-C01','dang_hoc');
  const it=item('MATH-ENTRY',s);
  const ready=readiness.projectReadiness(request('GD2',['MATH-L0-C01'],[it],{
    externalGates:[gate('EXT-DIAGNOSTIC-ENTRY',true)]
  }));
  assert.equal(ready.overallColor,'yellow');
  const missing=readiness.projectReadiness(request('GD2',['MATH-L0-C01'],[it]));
  assert.equal(missing.overallColor,'red');
  assert.deepEqual(missing.targets[0].unresolvedExternalGateIds,['EXT-DIAGNOSTIC-ENTRY']);
  assert.throws(()=>readiness.projectReadiness(request('GD2',['MATH-L0-C01'],[it],{
    externalGates:[gate('EXT-DIAGNOSTIC-ENTRY',true,false)]
  })),/Unverified Readiness external gate/);
}

// H2: lesson focus inherits the unambiguous parent chapter prerequisite policy.
{
  const prereq=snapshot('MATH-L0-C01','dat_prerequisite');
  const lesson=snapshot('MATH-L1-C03-L01','dang_hoc');
  const result=readiness.projectReadiness(request('GD2',['MATH-L1-C03-L01'],[
    item('PREREQ',prereq,{reviewRequested:true,activityKind:'retention_review'}),
    item('LESSON',lesson)
  ]));
  assert.equal(result.overallColor,'yellow');
  assert.equal(result.targets[0].prerequisiteTargetId,'MATH-L1-C03');
  assert.equal(result.targets[0].prerequisiteReady,true);
}

// Caller cannot inject scheduler output or readiness colors.
{
  const bad=request('GD2',['RU-R0-C01'],[]);
  bad.overallColor='green';
  assert.throws(()=>readiness.projectReadiness(bad),/unsupported fields/);
  const supplied=request('GD2',['RU-R0-C01'],[]);
  supplied.schedulerResult={sessions:[]};
  assert.throws(()=>readiness.projectReadiness(supplied),/unsupported fields/);
}

// Output is deterministic, deeply frozen and non-persistent.
{
  const s=snapshot('RU-R0-C01','dang_hoc');
  const input=request('GD2',['RU-R0-C01'],[item('FROZEN',s,{technicalTrack:null,activityKind:'russian_foundation'})]);
  const a=readiness.projectReadiness(input),b=readiness.projectReadiness(input);
  assert.deepEqual(a,b);
  assert(Object.isFrozen(a)&&Object.isFrozen(a.targets)&&Object.isFrozen(a.targets[0]));
  assert.equal(a.persisted,false);
  assert.equal(a.dashboardUiRendered,false);
  assert.equal(a.runtimeWriteAllowed,false);
  assert.equal(a.notificationWriteAllowed,false);
  assert.throws(()=>{a.overallColor='green';},TypeError);
}

// Harness remains side-effect free and outside production runtime wiring.
{
  const source=fs.readFileSync('scripts/roadmap-v2-readiness-harness.mjs','utf8');
  for(const forbidden of [/writeFileSync\s*\(/,/appendFileSync\s*\(/,/writeFile\s*\(/,/localStorage/,/sessionStorage/,/fetch\s*\(/,/XMLHttpRequest/,/child_process/,/spawn\s*\(/,/exec\s*\(/]){
    assert.doesNotMatch(source,forbidden,`Readiness harness gained forbidden side effect: ${forbidden}`);
  }
  function walk(dir){return fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[p];}):[];}
  for(const file of [...(fs.existsSync('index.html')?['index.html']:[]),...walk('assets'),...walk('subjects')].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p))){
    const text=fs.readFileSync(file,'utf8');
    assert.equal(text.includes('roadmap-v2-readiness-harness.mjs'),false,`Readiness harness wired into runtime: ${file}`);
    assert.equal(text.includes('loadCurrentReadinessHarness'),false,`Readiness activation leaked into runtime: ${file}`);
  }
}

console.log('ROADMAP_V2_L27_B106_READINESS_PROJECTOR=PASS');
console.log(JSON.stringify({
  missingEvidenceFailsClosed:true,
  reducerMasterReadyRequired:true,
  verifiedExternalGates:true,
  lessonPrerequisiteInheritance:true,
  manualOverride:false,
  deterministic:true,
  deepFrozen:true,
  persisted:false,
  dashboardUi:false,
  runtimeWrite:false,
  notificationWrite:false
},null,2));
