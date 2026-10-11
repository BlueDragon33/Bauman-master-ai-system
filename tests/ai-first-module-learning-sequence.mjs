import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const load = (p) => JSON.parse(readFileSync(p,'utf8'));
const lessons = load('subjects/ai/data/lessons.json');
const curriculum = load('subjects/ai/data/curriculum.json');
const tests = load('subjects/ai/data/tests.json');
const ids = ['a_p01_l1','a_p01_l2','a_p01_l3'];
const module = curriculum.modules.find((m) => m.id === 'a_p01');
assert.ok(module,'AI first module must exist');
assert.deepEqual(module.lessons,ids,'Module must preserve ordered lesson IDs and learning-state keys');
const pilot = ids.map((id) => lessons.find((l) => l.id === id));
assert.ok(pilot.every(Boolean),'Every declared first-module lesson must have content');
assert.ok(pilot.every((l) => l.stage === module.stage && l.moduleId === module.id));
assert.equal(new Set(lessons.map((l) => l.id)).size,lessons.length,'Lesson IDs must remain unique');
assert.equal(lessons.length,51,'Protect all other 48 AI lessons during this scoped pilot');

for(const [i,l] of pilot.entries()){
  const e=l.eLearning;
  assert.ok(l.title.length >= 25 && l.description.length >= 70);
  assert.equal(e.lessonContractVersion,'elearning-v1.1');
  assert.ok(e.sourceBasis.includes('Không phải đề cương chính thức Bauman'),
    'AI supplemental lessons must not impersonate an official syllabus');
  for(const [key,items,min] of [
    ['keyPoints',l.keyPoints,3],['tasks',l.tasks,3],
    ['objectives',e.objectives,3],['prerequisites',e.prerequisites,2],
    ['coreTheory',e.coreTheory,3],['workedExample.steps',e.workedExample?.steps,5],
    ['guidedPractice',e.guidedPractice,3],['checkpointQuestions',e.checkpointQuestions,3]
  ]){
    assert.ok(Array.isArray(items)&&items.length>=min,idMessage(l,key));
  }
  assert.ok(e.workedExample.context.includes('giả lập') || e.workedExample.context.includes('minh họa'),
    'Worked example must disclose synthetic nature');
  assert.ok(e.workedExample.answer.length>=100,'Worked answer must be substantive');
  assert.ok(e.guidedPractice.every((x)=>x.task?.length>20&&x.expected?.length>25),
    'Practices require concrete tasks and assessable outputs');
  assert.ok(e.checkpointQuestions.every((x)=>x.q?.length>20&&x.a?.length>20),
    'Checkpoint must include a specific answer, not a placeholder');
  assert.ok(!l.tasks.includes('Làm ví dụ có input/output/giả thiết/kết quả rõ ràng.'),
    'Generic cloned assignment may not re-enter the accepted pilot');
  assert.ok(!l.tasks.some((x)=>x.includes('Chạy mô phỏng liên quan, thay đổi ít nhất 3 tham số')),
    'A nonexistent simulation must never be a required acceptance task');
  if(i>0){
    assert.notDeepEqual(l.tasks,pilot[i-1].tasks,'Each lesson must teach a distinct applied skill');
    assert.notDeepEqual(e.workedExample.steps,pilot[i-1].eLearning.workedExample.steps);
    assert.ok(e.prerequisites.some((x)=>x.includes(ids[i-1])),
      'Lesson must name the previous prerequisite instead of skipping ahead');
  }
}
function idMessage(l,key){return l.id+': missing substantive '+key}
assert.match(pilot[0].title,/rò rỉ dữ liệu/);
assert.match(pilot[1].title,/confusion matrix/);
assert.match(pilot[2].title,/tái lập/);

const [tp,fp,fn,tn]=[8,2,4,26];
const values=[
  tp/(tp+fp),
  tp/(tp+fn),
  2*tp/(2*tp+fp+fn),
  (tp+tn)/(tp+fp+fn+tn)
];
assert.ok(Math.abs(values[0]-0.8)<1e-9);
assert.ok(Math.abs(values[1]-2/3)<1e-9);
assert.ok(Math.abs(values[2]-16/22)<1e-9);
assert.ok(Math.abs(values[3]-.85)<1e-9);
for(const fraction of ['8/10','8/12','16/22','34/40']){
  assert.ok(pilot[1].eLearning.coreFormulas.some((x)=>x.includes(fraction)),
    'Numerical teaching example missing: '+fraction);
}
assert.ok(pilot[2].eLearning.workedExample.answer.includes('33,3%'),
  'Error analysis must disclose four missed faults among twelve actual faults');

const questions = ['q_a_p01','q_a_p01_v1'].map((id)=>tests.questions.find((q)=>q.id===id));
assert.ok(questions.every(Boolean),'Original quiz IDs must be preserved');
assert.deepEqual(questions.map((q)=>q.reviewLesson),[ids[0],ids[1]]);
assert.notEqual(questions[0].prompt,questions[1].prompt,'Quiz questions must test distinct skills');
assert.ok(questions[0].prompt.includes('data leakage'));
assert.ok(questions[1].prompt.includes('Recall'));
for(const q of questions){
  assert.equal(q.options.length,4);
  assert.ok(Number.isInteger(q.answerIndex)&&q.answerIndex>=0&&q.answerIndex<4);
  assert.equal(new Set(q.options).size,4,'Quiz distractors must be distinguishable');
}
assert.ok(questions[0].options[questions[0].answerIndex].includes('5 phút sau t'));
assert.ok(questions[1].options[questions[1].answerIndex].includes('66,7%'));

console.log('AI_FIRST_MODULE_LEARNING_SEQUENCE_PASS',JSON.stringify({
  module:module.id,lessons:ids,quizQuestions:questions.map((q)=>q.id),
  retainedNonPilotLessons:lessons.length-ids.length,
  sourceStatus:'supplemental_not_official',metrics:values
}));