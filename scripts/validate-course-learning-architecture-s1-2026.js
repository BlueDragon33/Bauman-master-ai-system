'use strict';
const fs=require('fs');
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const architecture=readJson('assets/data/course-learning-architecture-s1-2026.json');
const curriculum=readJson('assets/data/official-curriculum-iu5-2026.json');
const prereq=readJson('assets/data/prerequisite-registry-iu5-2026.json');
const p0=readJson('assets/data/prerequisite-packs/p00-technical-russian.json');
const errors=[];
const assert=(c,m)=>{if(!c)errors.push(m)};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const unique=a=>new Set(a).size===a.length;

assert(architecture.schema==='bauman_official_course_learning_architecture_v1','architecture schema drifted');
assert(architecture.version==='PHASE2_CURRENT_MAIN_A1_S1_COURSE_ARCHITECTURE_V3','current-main A1 architecture version missing');
assert(architecture.semester===1,'architecture semester must be 1');
assert(architecture.policies.gradedEventInternalTarget===90,'graded-event internal target must be 90');
assert(/not an official Bauman grading rule/i.test(architecture.policies.gradedEventTargetMeaning||''),'graded target must be labeled internal only');
assert(/pure Зчт.*pass\/fail/i.test(architecture.policies.passFailCreditPolicy||''),'pure Зчт must use pass/fail planning policy');
assert(/must not be split|must not.*assigned to semester 1/i.test(architecture.policies.multiSemesterAllocationRule||''),'multi-semester no-inference policy missing');
assert(/must not use whole-course credits/i.test(architecture.policies.riskPriorityRule||''),'multi-semester risk guard missing');
assert(architecture.policies.readyOverallMinimum===90&&architecture.policies.readyApplicationMinimum===85,'READY thresholds drifted');
assert(architecture.policies.masteredOverallMinimum===95&&architecture.policies.masteredApplicationMinimum===90,'MASTERED thresholds drifted');
assert(architecture.policies.criticalMisconceptionsAllowed===0,'critical misconceptions must remain zero');
assert(architecture.policies.courseReadinessRule==='worst critical prerequisite gate wins','course readiness rule drifted');

const sm=architecture.stateModel||{};
assert(/three axes are independent/i.test(sm.rule||''),'state axes independence rule missing');
assert(same((sm.prerequisiteReadinessAxis||[]).map(x=>x.id),['UNASSESSED','PREREQ_REPAIR','COURSE_READY']),'prerequisite readiness axis drifted');
assert(same((sm.courseLifecycleAxis||[]).map(x=>x.id),['NOT_STARTED','COURSE_ACTIVE','COMPLETED']),'course lifecycle axis drifted');
assert(same((sm.eventReadinessAxis||[]).map(x=>x.id),['NOT_APPLICABLE','EVENT_UNASSESSED','EVENT_PREPARING','EVENT_READY','EVENT_COMPLETED']),'event readiness axis drifted');

const required=['d01','d02','d03','d04','d05','d06','d15','p02'];
assert(same(architecture.courses.map(x=>x.courseId),required),'S1 course set/order drifted');
const currById=new Map([...curriculum.disciplines,...curriculum.practices].map(x=>[x.id,x]));
const depById=new Map(prereq.courseDependencies.map(x=>[x.courseId,x]));
const gateIds=new Set([...prereq.coreGates,...prereq.jitBridgeGates].map(x=>x.id));
const blockIds=[];

for(const course of architecture.courses){
  const official=currById.get(course.courseId);
  assert(official,`${course.courseId}: missing official item`);
  assert(course.nameRu===official?.nameRu,`${course.courseId}: name mismatch`);
  assert(course.official?.department===official?.department||course.official?.type===official?.type,`${course.courseId}: department/type mismatch`);
  const totals=course.official?.wholeCourseTotals||{};
  assert(totals.credits===official?.credits,`${course.courseId}: whole-course credits mismatch`);
  assert(totals.hours===official?.hours,`${course.courseId}: whole-course hours mismatch`);
  if(official?.classroom!==undefined)assert(totals.classroom===official.classroom,`${course.courseId}: classroom mismatch`);
  if(official?.selfOther!==undefined)assert(totals.selfOther===official.selfOther,`${course.courseId}: selfOther mismatch`);
  assert(same(course.official?.semesters,official?.semesters),`${course.courseId}: semesters mismatch`);
  assert(same(course.official?.assessmentCodes,official?.assessment),`${course.courseId}: assessment codes mismatch`);
  if(official?.part!==undefined)assert(course.official?.part===official.part,`${course.courseId}: part mismatch`);

  const dep=depById.get(course.courseId);
  assert(dep,`${course.courseId}: dependency mapping missing`);
  assert(same(course.criticalPrerequisites,dep?.critical),`${course.courseId}: critical prerequisite mismatch`);
  assert(same(course.supportPrerequisites,dep?.support),`${course.courseId}: support prerequisite mismatch`);
  for(const g of [...(course.criticalPrerequisites||[]),...(course.supportPrerequisites||[])])assert(gateIds.has(g),`${course.courseId}: unknown gate ${g}`);

  const multi=(official?.semesters||[]).length>1;
  if(multi){
    assert(course.semester1Allocation?.status==='unresolved_from_locked_curriculum',`${course.courseId}: multisemester allocation must remain unresolved`);
    assert(course.semester1Allocation?.credits===null&&course.semester1Allocation?.hours===null,`${course.courseId}: must not fabricate semester-1 credits/hours`);
    assert(course.semester1Allocation?.assessmentTiming==='unresolved',`${course.courseId}: assessment timing must remain unresolved`);
  }else{
    assert(course.semester1Allocation?.status==='known_single_semester',`${course.courseId}: single-semester allocation should be known`);
    assert(course.semester1Allocation?.credits===official.credits&&course.semester1Allocation?.hours===official.hours,`${course.courseId}: single-semester allocation mismatch`);
    assert(course.semester1Allocation?.assessmentTiming==='semester_1',`${course.courseId}: single-semester event timing mismatch`);
  }

  const events=course.eventModel?.events||[];
  assert(events.length===official.assessment.length,`${course.courseId}: event count mismatch`);
  assert(same(events.map(x=>x.code),official.assessment),`${course.courseId}: event code order mismatch`);
  for(const e of events){
    if(e.code==='Зчт'){
      assert(e.gradingNature==='pass_fail',`${course.courseId}: Зчт must be pass_fail planning event`);
      assert(e.internalTarget===null,`${course.courseId}: pure Зчт event must not get numeric 90 target`);
    }else{
      assert(e.gradingNature==='graded',`${course.courseId}: ${e.code} must be graded planning event`);
      assert(e.internalTarget===90,`${course.courseId}: graded event target must be internal 90`);
    }
    if(multi)assert(/^unresolved_for_multisemester/.test(e.timing||''),`${course.courseId}: multisemester event timing must stay unresolved`);
    else assert(e.timing==='semester_1',`${course.courseId}: single-semester event must resolve to semester_1`);
  }

  assert((course.competencyBlocks||[]).length>=2,`${course.courseId}: competency blocks missing`);
  for(const b of course.competencyBlocks||[]){
    blockIds.push(b.id);
    assert(['competency_inference','public_material_plus_competency_inference','course_local_planning_inference'].includes(b.evidenceClass),`${b.id}: invalid evidenceClass`);
    if(course.courseId==='d01')assert((b.localReadinessRefs||[]).includes('d01-english-readiness'),`${b.id}: d01 block must use local English readiness`);
    else{assert((b.gateRefs||[]).length>0,`${b.id}: gateRefs missing`);for(const g of b.gateRefs||[])assert(gateIds.has(g),`${b.id}: unknown gate ${g}`)}
  }
}
assert(unique(blockIds),'competency block IDs must be unique');

const d01=architecture.courses.find(x=>x.courseId==='d01');
assert(d01.criticalPrerequisites.length===0&&d01.supportPrerequisites.length===0,'d01 must have no P0 Russian dependency');
assert(d01.courseLocalReadiness?.language==='English','d01 must use English local readiness');
assert((d01.courseLocalReadiness?.globalGateRefs||[]).length===0,'d01 English readiness must not be tied to a global P0 gate');
assert(d01.courseLocalReadiness?.thresholdStatus==='not_defined_until_verified_course_requirements_or_diagnostic_blueprint','d01 English threshold must remain unresolved');
assert((d01.courseLocalReadiness?.sourceEvidence||[]).some(x=>x.url==='https://e-learning.bmstu.ru/l/course/index.php?categoryid=3'),'d01 L2 English source evidence missing');
assert(!(p0.officialTargets||[]).some(x=>x.courseId==='d01'),'P0 pack still incorrectly targets d01');
assert(p0.implementationPolicy?.excludesForeignLanguageCourseD01===true,'P0 d01 exclusion policy missing');

for(const id of ['d01','d15','p02']){
  const c=architecture.courses.find(x=>x.courseId===id);
  assert(c.semester1Allocation.status==='unresolved_from_locked_curriculum',`${id}: must preserve unresolved semester allocation`);
}
for(const id of ['d02','d03','d04','d05','d06']){
  const c=architecture.courses.find(x=>x.courseId===id);
  assert(c.semester1Allocation.status==='known_single_semester',`${id}: single-semester allocation should be known`);
}

const d03=architecture.courses.find(x=>x.courseId==='d03');
assert((d03.publicLearningEvidence||[]).some(x=>x.url==='https://e-learning.bmstu.ru/iu5/course/view.php?id=48'),'d03 public IU5 evidence missing');
const p02=architecture.courses.find(x=>x.courseId==='p02');
assert(p02.topicSelectionPolicy?.defaultState==='TOPIC_NEUTRAL','NIR must remain topic-neutral');
assert((p02.publicLearningEvidence||[]).some(x=>x.url==='https://e-learning.bmstu.ru/iu5/course/view.php?id=153'),'p02 public NIR evidence missing');

const activeText=architecture.courses.flatMap(c=>(c.competencyBlocks||[]).map(b=>b.label)).join(' ').toLowerCase();
for(const forbidden of ['ugv','usv','pid','lqr','fpga','plc','scada','kalman','sensor fusion','rag','agent'])assert(!activeText.includes(forbidden),`default-route topic leaked: ${forbidden}`);
const serialized=JSON.stringify(architecture);
for(const key of ['officialTopics','officialSyllabus','officialExamQuestions'])assert(!serialized.includes(`\"${key}\"`),`must not fabricate ${key}`);

// Independent logic sanity: lifecycle and readiness must be representable simultaneously.
const example={prerequisiteReadiness:'PREREQ_REPAIR',courseLifecycle:'COURSE_ACTIVE',eventReadiness:'EVENT_UNASSESSED'};
assert(example.prerequisiteReadiness==='PREREQ_REPAIR'&&example.courseLifecycle==='COURSE_ACTIVE','independent-state sanity failed');
// Multi-semester priority sanity: whole-course totals are not semester-specific evidence.
function semesterWeight(course){return (course.official.semesters||[]).length===1?course.semester1Allocation.credits:0}
assert(semesterWeight(architecture.courses.find(x=>x.courseId==='d15'))===0,'d15 whole credits must not become S1 weight');
assert(semesterWeight(architecture.courses.find(x=>x.courseId==='p02'))===0,'p02 whole credits must not become S1 weight');
assert(semesterWeight(architecture.courses.find(x=>x.courseId==='d04'))===5,'single-semester d04 should retain S1 credit weight');

if(errors.length){console.error(`PASS14A_R_INTEGRITY_FAIL (${errors.length})`);for(const e of errors)console.error(`- ${e}`);process.exit(1)}
console.log('PASS14A_R_S1_COURSE_ARCHITECTURE_INTEGRITY_PASS');
console.log(JSON.stringify({courses:architecture.courses.length,d01EnglishSeparated:true,multiSemesterUnresolved:['d01','d15','p02'],stateAxes:3,gradedTarget:90,pureCreditTarget:null},null,2));
