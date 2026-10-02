import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = 'subjects/entrepreneurship';
for (const relative of [
  'index.html',
  'editor.html',
  'subject-manifest.json',
  'subject-manifest.js',
  'data/curriculum.json',
  'data/lessons.json',
  'data/formulas.json',
  'data/exercises.json',
  'data/tests.json',
  'data/simulations.json',
  'data/knowledge-index.json',
]) {
  assert.ok(fs.existsSync(`${root}/${relative}`), `Entrepreneurship asset missing: ${relative}`);
}

const manifest = JSON.parse(fs.readFileSync(`${root}/subject-manifest.json`, 'utf8'));
assert.equal(manifest.id, 'entrepreneurship');
assert.equal(manifest.studyPlan?.version, 1);
assert.equal(manifest.studyPlan?.relation, 'related');
assert.equal(manifest.studyPlan?.runtimePath, 'subjects/entrepreneurship/');
assert.deepEqual(manifest.studyPlan?.courseIds, ['entrepreneurship']);

const curriculum = JSON.parse(fs.readFileSync(`${root}/data/curriculum.json`, 'utf8'));
const lessons = JSON.parse(fs.readFileSync(`${root}/data/lessons.json`, 'utf8'));
const tests = JSON.parse(fs.readFileSync(`${root}/data/tests.json`, 'utf8'));
const exercises = JSON.parse(fs.readFileSync(`${root}/data/exercises.json`, 'utf8'));
const simulations = JSON.parse(fs.readFileSync(`${root}/data/simulations.json`, 'utf8'));

assert.equal(curriculum.id, 'entrepreneurship');
assert.deepEqual(curriculum.stages.map(stage => stage.id), ['m2']);
assert.equal(curriculum.modules.length, 4);
assert.equal(lessons.length, 8);
assert.ok(exercises.length >= 8);
assert.ok(tests.questions.length >= 40);
assert.ok(simulations.observation.length >= 2);
assert.ok(simulations.practice.length >= 2);

const lessonIds = new Set(lessons.map(lesson => lesson.id));
for (const module of curriculum.modules) {
  assert.equal(module.stage, 'm2');
  assert.ok(module.lessons.length >= 2);
  for (const lessonId of module.lessons) {
    assert.ok(lessonIds.has(lessonId), `Module references missing lesson: ${lessonId}`);
  }
}

const index = fs.readFileSync(`${root}/index.html`, 'utf8');
assert.ok(index.includes('../foundation/assets/foundation.js'), 'Entrepreneurship must reuse the stable generic subject runtime');
assert.ok(index.includes('../foundation/assets/foundation.css'), 'Entrepreneurship must reuse the stable generic subject styles');

const contract = JSON.parse(fs.readFileSync('control/application-management.contract.json', 'utf8'));
const subclient = contract.subclients.find(item => item.id === 'entrepreneurship');
assert.ok(subclient, 'Entrepreneurship subclient missing from Application Management contract');
assert.equal(subclient.sourcePath, 'subjects/entrepreneurship');

const data = fs.readFileSync('assets/js/data.js', 'utf8');
assert.ok(data.includes("id:'entrepreneurship'"), 'Entrepreneurship subject missing from BAUMAN_DATA');
assert.ok(data.includes("id:'c8',stage:'m2',subject:'entrepreneurship'"), 'HK2 entrepreneurship course is not routed to the dedicated subject');

const main = fs.readFileSync('assets/js/main.js', 'utf8');
assert.ok(main.includes("entrepreneurship:'subjects/entrepreneurship/index.html'"), 'Entrepreneurship runtime path missing from main hub');
assert.ok(main.includes("entrepreneurship:'subjects/entrepreneurship/editor.html'"), 'Entrepreneurship editor path missing from main hub');

console.log('ENTREPRENEURSHIP_SUBJECT_STATIC_GATE=PASS');
