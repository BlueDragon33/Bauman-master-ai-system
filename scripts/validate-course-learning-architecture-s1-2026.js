const fs = require('fs');

function readJson(path){ return JSON.parse(fs.readFileSync(path,'utf8')); }
function assert(condition,message){ if(!condition) throw new Error(message); }
function sameArray(a,b){ return JSON.stringify(a)===JSON.stringify(b); }

const architecture = readJson('assets/data/course-learning-architecture-s1-2026.json');
const curriculum = readJson('assets/data/official-curriculum-iu5-2026.json');
const prereq = readJson('assets/data/prerequisite-registry-iu5-2026.json');

assert(architecture.schema==='bauman_official_course_learning_architecture_v1','Unexpected architecture schema');
assert(architecture.version==='PHASE2_PASS14A_S1_COURSE_ARCHITECTURE_V1','Unexpected architecture version');
assert(architecture.semester===1,'Pass14A must target semester 1');
assert(architecture.policies.internalCourseTarget===90,'Internal course target must remain 90');
assert(architecture.policies.readyOverallMinimum===90,'READY minimum must remain 90');
assert(architecture.policies.readyApplicationMinimum===85,'READY D1 minimum must remain 85');
assert(architecture.policies.masteredOverallMinimum===95,'MASTERED minimum must remain 95');
assert(architecture.policies.masteredApplicationMinimum===90,'MASTERED D1 minimum must remain 90');
assert(architecture.policies.criticalMisconceptionsAllowed===0,'Critical misconceptions must remain zero');
assert(architecture.policies.courseReadinessRule==='worst critical prerequisite gate wins','Course readiness must use worst critical gate');

const requiredIds=['d01','d02','d03','d04','d05','d06','d15','p02'];
assert(sameArray(architecture.courses.map(x=>x.courseId),requiredIds),'Semester-1 architecture must contain exactly the required course/practice IDs in stable order');

const currById = new Map([
  ...curriculum.disciplines.map(x=>[x.id,x]),
  ...curriculum.practices.map(x=>[x.id,x])
]);
const depById = new Map(prereq.courseDependencies.map(x=>[x.courseId,x]));

const seenBlocks = new Set();
for(const course of architecture.courses){
  const official = currById.get(course.courseId);
  assert(official,`Unknown official course ${course.courseId}`);
  assert(course.nameRu===official.nameRu,`${course.courseId}: name mismatch`);
  assert(course.official.credits===official.credits,`${course.courseId}: credit mismatch`);
  assert(course.official.hours===official.hours,`${course.courseId}: hours mismatch`);
  assert(sameArray(course.official.semesters,official.semesters),`${course.courseId}: semester mismatch`);
  assert(sameArray(course.official.assessment,official.assessment),`${course.courseId}: assessment mismatch`);
  if(official.classroom!==undefined) assert(course.official.classroom===official.classroom,`${course.courseId}: classroom mismatch`);
  if(official.selfOther!==undefined) assert(course.official.selfOther===official.selfOther,`${course.courseId}: self/other mismatch`);
  if(official.part!==undefined) assert(course.official.part===official.part,`${course.courseId}: part mismatch`);
  if(official.type!==undefined) assert(course.official.type===official.type,`${course.courseId}: practice type mismatch`);

  const dep = depById.get(course.courseId);
  assert(dep,`${course.courseId}: missing prerequisite dependency mapping`);
  assert(sameArray(course.criticalPrerequisites,dep.critical),`${course.courseId}: critical prerequisite mapping mismatch`);
  assert(sameArray(course.supportPrerequisites,dep.support),`${course.courseId}: support prerequisite mapping mismatch`);

  assert(Array.isArray(course.competencyBlocks) && course.competencyBlocks.length>=2,`${course.courseId}: competency blocks missing`);
  for(const block of course.competencyBlocks){
    assert(!seenBlocks.has(block.id),`Duplicate competency block id ${block.id}`);
    seenBlocks.add(block.id);
    assert(['competency_inference','public_material_plus_competency_inference'].includes(block.evidenceClass),`${block.id}: invalid evidence class`);
    assert(Array.isArray(block.gateRefs) && block.gateRefs.length>0,`${block.id}: gateRefs required`);
    for(const gate of block.gateRefs){
      const allGateIds=[...prereq.coreGates,...prereq.jitBridgeGates].map(x=>x.id);
      assert(allGateIds.includes(gate),`${block.id}: unknown gate ${gate}`);
    }
  }

  assert(sameArray(course.eventModel.officialAssessmentCodes,official.assessment),`${course.courseId}: event model must preserve exact official assessment codes`);
  assert(Array.isArray(course.eventModel.planningEvents) && course.eventModel.planningEvents.length>0,`${course.courseId}: planning events missing`);
}

const d03 = architecture.courses.find(x=>x.courseId==='d03');
assert(d03.publicLearningEvidence?.some(x=>x.url==='https://e-learning.bmstu.ru/iu5/course/view.php?id=48'),'d03 public IU5 evidence missing');
assert(d03.competencyBlocks.some(x=>/Queueing models/.test(x.label)),'d03 queueing bridge missing');

const p02 = architecture.courses.find(x=>x.courseId==='p02');
assert(p02.publicLearningEvidence?.some(x=>x.url==='https://e-learning.bmstu.ru/iu5/course/view.php?id=153'),'p02 public NIR evidence missing');
assert(p02.topicSelectionPolicy?.defaultState==='TOPIC_NEUTRAL','NIR must remain topic-neutral by default');

const activeText = architecture.courses.flatMap(c=>c.competencyBlocks.map(b=>b.label)).join(' ').toLowerCase();
for(const forbidden of ['ugv','usv','pid','lqr','fpga','plc','scada','kalman','sensor fusion','rag','agent']){
  assert(!activeText.includes(forbidden),`Forbidden default-route topic leaked into active competency blocks: ${forbidden}`);
}

const serialized = JSON.stringify(architecture);
for(const forbiddenKey of ['officialTopics','officialSyllabus','officialExamQuestions']){
  assert(!serialized.includes(`\"${forbiddenKey}\"`),`Architecture must not fabricate ${forbiddenKey}`);
}

// Sanity: semester-1 official hours and course ordering stay fixed.
const expectedHours={d01:144,d02:72,d03:144,d04:180,d05:216,d06:144,d15:216,p02:756};
for(const [id,hours] of Object.entries(expectedHours)) assert(currById.get(id).hours===hours,`${id}: official-hour sanity failed`);

console.log('PASS14A_S1_COURSE_ARCHITECTURE_VALID');
