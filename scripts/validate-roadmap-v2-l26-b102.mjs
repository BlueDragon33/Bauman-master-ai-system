import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {loadCurrentSchedulerHarness} from './roadmap-v2-scheduler-harness.mjs';

const scheduler=loadCurrentSchedulerHarness();
const satisfying=new Set(scheduler.priority.mastery.prerequisiteGate.satisfyingStates);

function snapshot(targetId,state,phaseId,options={}){
  return {
    schema:'BAUMAN_ROADMAP_V2_MASTERY_SNAPSHOT_V1',
    streamId:options.streamId||`B102::${phaseId}::${targetId}`,
    targetId,
    phaseId,
    eventCount:1,
    lastSequence:1,
    knowledgeState:state,
    existingCompetencyVerified:options.existingCompetencyVerified||false,
    dimensions:options.dimensions||{},
    masterReadyGate:{passed:state==='master_ready'},
    prerequisiteEligible:satisfying.has(state),
    persisted:false,
    transitions:[]
  };
}
function candidate(targetId,state,phaseId,options={}){
  return {
    schema:'BAUMAN_ROADMAP_V2_PRIORITY_CANDIDATE_V1',
    candidateId:options.candidateId||`B102::${phaseId}::${targetId}`,
    targetId,
    phaseId,
    masterRelevance:options.masterRelevance??0.8,
    masterRelevanceSource:options.masterRelevanceSource||'L26/B102 current scheduler fixture',
    weeksUntilNeeded:options.weeksUntilNeeded??8,
    snapshot:options.snapshot||snapshot(targetId,state,phaseId)
  };
}
function item(id,priorityCandidate,options={}){
  const technicalTrack=options.technicalTrack===undefined?'math':options.technicalTrack;
  const russianTwinMinutes=options.russianTwinMinutes===undefined
    ?(technicalTrack===null?null:30)
    :options.russianTwinMinutes;
  return {
    scheduleItemId:id,
    priorityCandidate,
    activityKind:options.activityKind||'technical_core',
    estimatedMinutes:options.estimatedMinutes||60,
    technicalTrack,
    russianTwinMinutes,
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
    requestId:options.requestId||`B102::SCHEDULE::${phaseId}`,
    phaseId,
    weekStart:options.weekStart||'2026-09-21',
    weeklyCapacityMinutes:options.weeklyCapacityMinutes||600,
    items
  };
}

assert.equal(scheduler.contract.version,'2.6.1-l26-b101-current');
assert.equal(scheduler.priority.contract.schema,'BAUMAN_ROADMAP_V2_PRIORITY_CONTRACT_V2');
assert.equal(scheduler.contract.mode.productionIntegration,'disconnected');
assert.equal(scheduler.contract.mode.calendarReadEnabled,false);
assert.equal(scheduler.contract.mode.calendarWriteEnabled,false);
assert.equal(scheduler.contract.mode.persistentStoreEnabled,false);
assert.equal(scheduler.contract.mode.runtimeWriteAllowed,false);
assert.equal(scheduler.contract.mode.dynamicContentGenerationAllowed,false);

// Critical gap remains first even when a lower-weighted candidate is present.
{
  const result=scheduler.projectWeek(request('GD2',[
    item('ITEM::NORMAL',candidate('MATH-L1-C03','dang_hoc','GD2',{masterRelevance:1,weeksUntilNeeded:8})),
    item('ITEM::CRITICAL',candidate('MATH-L2-C07','gap','GD2',{masterRelevance:0.1,weeksUntilNeeded:4}))
  ]));
  const primary=result.sessions.filter(x=>x.companionOf===null);
  assert.equal(primary[0].scheduleItemId,'ITEM::CRITICAL');
  assert.equal(primary[0].disposition,'critical');
  assert(primary[0].reasonCodes.includes('CRITICAL_GAP_FIRST'));
}

// Verified Current Bauman source overrides weighted Priority only after Critical.
// The knowledge target must already be admitted by Priority V2; an uninstantiated CUR target remains blocked.
{
  const result=scheduler.projectWeek(request('GD3',[
    item('ITEM::STATIC',candidate('MATH-L1-C04','dang_hoc','GD3',{masterRelevance:1,weeksUntilNeeded:8}),{
      masterModeRelation:'current_subject_prerequisite'
    }),
    item('ITEM::CURRENT',candidate('MATH-L1-C03','chua_hoc','GD3',{masterRelevance:0.1,weeksUntilNeeded:3}),{
      activityKind:'current_subject_preview',
      sourceKind:'current_bauman_official',
      sourceRef:'official-syllabus://current/prerequisite/MATH-L1-C03',
      masterModeRelation:'current_subject_prerequisite'
    })
  ]));
  const primary=result.sessions.filter(x=>x.companionOf===null);
  assert.equal(primary[0].scheduleItemId,'ITEM::CURRENT');
  assert(primary[0].reasonCodes.includes('VERIFIED_CURRENT_BAUMAN_OVERRIDE'));
}

// H2: dynamic blueprint IDs are not scheduler-eligible before a real syllabus instance exists.
{
  assert(scheduler.blockedDynamicTargetIds.includes('CUR-L4-C03'));
  const blocked=candidate('CUR-L4-C03','chua_hoc','GD3',{weeksUntilNeeded:3});
  assert.throws(()=>scheduler.projectWeek(request('GD3',[
    item('ITEM::BLOCKED',blocked,{
      activityKind:'current_subject_preview',
      sourceKind:'current_bauman_official',
      sourceRef:'official-syllabus://current/uninstantiated',
      masterModeRelation:'current_subject_prerequisite'
    })
  ])),/Dynamic Scheduler target requires real syllabus instance/);
}

// Technical + Russian twin is atomic under capacity.
{
  const result=scheduler.projectWeek(request('GD2',[
    item('ITEM::ATOMIC',candidate('MATH-L2-C07','gap','GD2',{weeksUntilNeeded:4}))
  ],{weeklyCapacityMinutes:89}));
  assert.equal(result.sessions.length,0);
  assert.equal(result.usedMinutes,0);
  assert.equal(result.deferred[0].reason,'WEEKLY_CAPACITY_ATOMIC_BUNDLE');
  assert.deepEqual(result.readiness.unscheduledCriticalTargets,['MATH-L2-C07']);
  assert.equal(result.readiness.ready,false);
}

// Russian twin remains a placeholder, never generated lesson content.
{
  const result=scheduler.projectWeek(request('GD2',[
    item('ITEM::TWIN',candidate('MATH-L1-C03','dang_hoc','GD2'))
  ]));
  assert.equal(result.sessions.length,2);
  assert.equal(result.sessions[1].activityKind,'russian_twin_placeholder');
  assert(result.sessions[1].reasonCodes.includes('CONTENT_GENERATION_DISABLED'));
}

// Deterministic, deeply frozen and non-persisted.
{
  const input=request('GD2',[item('ITEM::FROZEN',candidate('MATH-L1-C03','dang_hoc','GD2'))]);
  const a=scheduler.projectWeek(input);
  const b=scheduler.projectWeek(input);
  assert.deepEqual(a,b);
  assert.equal(Object.isFrozen(a),true);
  assert.equal(Object.isFrozen(a.sessions),true);
  assert.equal(Object.isFrozen(a.sessions[0]),true);
  assert.equal(a.calendarWriteAllowed,false);
  assert.equal(a.persisted,false);
  assert.equal(a.runtimeWriteAllowed,false);
  assert.throws(()=>{a.usedMinutes=999;},TypeError);
}

// Current harness stays side-effect free and outside runtime wiring.
const source=fs.readFileSync('scripts/roadmap-v2-scheduler-harness.mjs','utf8');
for(const forbidden of [
  /writeFileSync\s*\(/,
  /appendFileSync\s*\(/,
  /writeFile\s*\(/,
  /localStorage/,
  /sessionStorage/,
  /fetch\s*\(/,
  /XMLHttpRequest/,
  /child_process/,
  /spawn\s*\(/,
  /exec\s*\(/
])assert.doesNotMatch(source,forbidden,`Scheduler harness gained forbidden side effect: ${forbidden}`);

function walk(dir){
  if(!fs.existsSync(dir))return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const p=path.join(dir,entry.name);
    return entry.isDirectory()?walk(p):[p];
  });
}
for(const file of [
  ...(fs.existsSync('index.html')?['index.html']:[]),
  ...walk('assets'),
  ...walk('subjects')
].filter(p=>/\.(?:html|js|mjs|cjs|json)$/i.test(p))){
  const text=fs.readFileSync(file,'utf8');
  assert.equal(text.includes('roadmap-v2-scheduler-harness.mjs'),false,`Scheduler harness wired into runtime: ${file}`);
  assert.equal(text.includes('loadCurrentSchedulerHarness'),false,`Scheduler activation leaked into runtime: ${file}`);
}

console.log('ROADMAP_V2_L26_B102_WEEKLY_PROJECTOR=PASS');
console.log(JSON.stringify({
  priority:scheduler.priority.contract.schema,
  scheduler:scheduler.contract.schema,
  blockedDynamicTargets:scheduler.blockedDynamicTargetIds.length,
  currentBaumanOverride:true,
  criticalFirst:true,
  atomicRussianTwin:true,
  deepFrozen:true,
  calendarRead:false,
  calendarWrite:false,
  persistence:false,
  runtimeActivation:false,
  productionIntegration:'disconnected'
},null,2));
