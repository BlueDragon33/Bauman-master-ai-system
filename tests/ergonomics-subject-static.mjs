import assert from 'node:assert/strict';
import fs from 'node:fs';

const root='subjects/ergonomics';
for(const relative of [
  'index.html','editor.html','subject-manifest.json','subject-manifest.js',
  'data/curriculum.json','data/lessons.json','data/formulas.json',
  'data/exercises.json','data/tests.json','data/simulations.json','data/knowledge-index.json'
]){
  assert.ok(fs.existsSync(`${root}/${relative}`),`Ergonomics asset missing: ${relative}`);
}

const manifest=JSON.parse(fs.readFileSync(`${root}/subject-manifest.json`,'utf8'));
assert.equal(manifest.id,'ergonomics');
assert.equal(manifest.studyPlan?.version,1);
assert.equal(manifest.studyPlan?.relation,'related');
assert.equal(manifest.studyPlan?.runtimePath,'subjects/ergonomics/');
assert.deepEqual(manifest.studyPlan?.courseIds,['ergonomics']);
assert.equal(manifest.officialCourse?.credits,6);
assert.equal(manifest.officialCourse?.hours,216);
assert.equal(manifest.officialCourse?.contactHours,68);
assert.equal(manifest.officialCourse?.assessment,'exam-coursework');

const curriculum=JSON.parse(fs.readFileSync(`${root}/data/curriculum.json`,'utf8'));
const lessons=JSON.parse(fs.readFileSync(`${root}/data/lessons.json`,'utf8'));
const exercises=JSON.parse(fs.readFileSync(`${root}/data/exercises.json`,'utf8'));
const tests=JSON.parse(fs.readFileSync(`${root}/data/tests.json`,'utf8'));
const simulations=JSON.parse(fs.readFileSync(`${root}/data/simulations.json`,'utf8'));

assert.equal(curriculum.id,'ergonomics');
assert.deepEqual(curriculum.stages.map(x=>x.id),['m3']);
assert.equal(curriculum.modules.length,6);
assert.equal(lessons.length,12);
assert.ok(exercises.length>=12);
assert.ok(tests.questions.length>=60);
assert.ok(simulations.observation.length>=2);
assert.ok(simulations.practice.length>=2);
assert.equal(curriculum.officialPlan?.credits,6);
assert.equal(curriculum.officialPlan?.hours,216);
assert.equal(curriculum.officialPlan?.contactHours,68);

const lessonIds=new Set(lessons.map(x=>x.id));
for(const module of curriculum.modules){
  assert.equal(module.stage,'m3');
  assert.ok(module.lessons.length>=2);
  for(const lessonId of module.lessons){
    assert.ok(lessonIds.has(lessonId),`Module references missing lesson: ${lessonId}`);
  }
}
for(const lesson of lessons){
  assert.ok(lesson.description.includes('không thay thế syllabus chính thức'),'Support-vs-official boundary missing from lesson');
  assert.ok(lesson.eLearning?.sourceBasis?.includes('Detailed topic sequence is support content'),'Source boundary missing from lesson contract');
}

const index=fs.readFileSync(`${root}/index.html`,'utf8');
assert.ok(index.includes('../foundation/assets/foundation.js'),'Ergonomics must reuse the stable generic subject runtime');
assert.ok(index.includes('../foundation/assets/foundation.css'),'Ergonomics must reuse the stable generic subject styles');

const contract=JSON.parse(fs.readFileSync('control/application-management.contract.json','utf8'));
const subclient=contract.subclients.find(x=>x.id==='ergonomics');
assert.ok(subclient,'Ergonomics subclient missing from Application Management contract');
assert.equal(subclient.sourcePath,'subjects/ergonomics');

const data=fs.readFileSync('assets/js/data.js','utf8');
assert.ok(data.includes("id:'ergonomics'"),'Ergonomics subject missing from BAUMAN_DATA');
assert.ok(data.includes("id:'c20',stage:'m3',subject:'ergonomics'"),'Official HK3 ergonomics course missing from BAUMAN_DATA');
assert.ok(data.includes("credits:'6'"),'Official credits missing from Bauman course metadata');
assert.ok(data.includes("hours:'216 giờ (68 giờ tiếp xúc)'"),'Official hours missing from Bauman course metadata');

const main=fs.readFileSync('assets/js/main.js','utf8');
assert.ok(main.includes("ergonomics:'subjects/ergonomics/index.html'"),'Ergonomics runtime path missing from main hub');
assert.ok(main.includes("ergonomics:'subjects/ergonomics/editor.html'"),'Ergonomics editor path missing from main hub');
assert.ok(main.includes("'signal','ergonomics'"),'Ergonomics should be available in technical study slots');
assert.ok(main.includes("official_plan:'Theo учебный план 2026'"),'Official-plan confidence label missing');

console.log('ERGONOMICS_SUBJECT_STATIC_GATE=PASS');
