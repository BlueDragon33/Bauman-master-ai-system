import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

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
assert.ok(main.includes('BAUMAN_HUB_SUBJECT_LAUNCH.launchInHub'), 'Main Hub must delegate learner launch to its adapter');
const configWindow = {BAUMAN_DATA:{subjects:[{id:'entrepreneurship',name:'Entrepreneurship'}]}};
const configSource = fs.readFileSync('assets/js/platform/hub-subject-config.js','utf8');
const launchSource = fs.readFileSync('assets/js/platform/hub-subject-launch.js','utf8');
const location = {href:'https://hub.example/index.html',origin:'https://hub.example'};
// Public storage fixture only. Real IndexedDB failure/migration is covered by
// hub-subject-config-browser; no Subject source or private store is consulted.
let configurationRow;
const indexedDB = {open(){const request={};queueMicrotask(()=>{
  request.result={createObjectStore(){},transaction(){const transaction={objectStore(){return {
    get(){const read={};queueMicrotask(()=>{read.result=configurationRow;read.onsuccess()});return read},
    put(row){configurationRow=structuredClone(row);queueMicrotask(()=>transaction.oncomplete())},
  }}};return transaction}};request.onsuccess();
});return request}};
vm.runInNewContext(configSource,{window:configWindow,structuredClone,URL,location,indexedDB});
const configuration = configWindow.BAUMAN_HUB_SUBJECT_CONFIG.getConfiguration('entrepreneurship');
assert.equal(configuration.entry,'subjects/entrepreneurship/index.html', 'Entrepreneurship runtime path missing from Hub application config');
assert.equal(configuration.editor,'subjects/entrepreneurship/editor.html', 'Entrepreneurship admin editor path missing from Hub application config');
assert.equal(configWindow.BAUMAN_HUB_SUBJECT_CONFIG.getDescriptor('entrepreneurship').authoring,null,'Admin editor path must not imply learner authoring capability');

for(const path of ['assets/js/main.js','assets/js/planning-main.js']){
  const presentation=fs.readFileSync(path,'utf8');
  assert.doesNotMatch(presentation,/\.mainPath|\.editorPath|subjects\/entrepreneurship\/(?:index|editor)\.html/,'Presentation must not own raw launch/config URLs');
  assert.ok(presentation.includes('BAUMAN_HUB_SUBJECT_LAUNCH.launchInHub'),'Hub and planning must use the same Launch Adapter');
  assert.ok(presentation.includes('BAUMAN_HUB_SUBJECT_LAUNCH.launchInTab'),'Separate-tab launch must use the same Launch Adapter');
}
for(const owner of [configSource,launchSource]){
  assert.doesNotMatch(owner,/\b(?:fetch|XMLHttpRequest|importScripts)\s*\(|\bimport\s*(?:\(|[\s{*])/,'Config/launch owners must not load Subject implementation or private configuration');
  assert.doesNotMatch(owner,/subject-manifest|\/data\/|\/assets\/|mastery|assessment/,'Hub launch must have no direct Subject-internal dependency');
}
vm.runInNewContext(launchSource,{window:configWindow,URL,location});
const adapter=configWindow.BAUMAN_HUB_SUBJECT_LAUNCH;
assert.equal(adapter.getLaunchState('entrepreneurship').status,'UNAVAILABLE','Launch must respect config capability readiness');
await configWindow.BAUMAN_HUB_SUBJECT_CONFIG.initialize();
const descriptor=adapter.getDescriptor('entrepreneurship');
assert.equal(descriptor.source,'HUB_APPLICATION_CONFIG','URL/config must have the canonical Hub owner');
assert.equal(descriptor.launch.transport,'iframe');
assert.equal(descriptor.launch.target,'https://hub.example/subjects/entrepreneurship/index.html');
assert.equal(descriptor.authoring,null,'Launch capability must not grant learner authoring');
const launchCalls=[];
adapter.bind({buildTask:(subjectId,context)=>({subjectId,taskId:context.taskId}),recordLaunch:(id,task)=>launchCalls.push(['record',id,task.taskId]),renderInHub:(item,url)=>launchCalls.push(['hub',item.subjectId,url]),openTab:url=>launchCalls.push(['tab',url]),notify:reason=>launchCalls.push(['unavailable',reason])});
assert.equal(adapter.launchInHub('entrepreneurship',{taskId:'hub-task'}).status,'CURRENT');
assert.equal(adapter.launchInTab('entrepreneurship',{taskId:'tab-task'}).status,'CURRENT');
for(const [mode,url,taskId] of [['hub',launchCalls[1][2],'hub-task'],['tab',launchCalls[3][1],'tab-task']]){
  const target=new URL(url);
  assert.equal(target.pathname,'/subjects/entrepreneurship/index.html',`${mode} launch must use the canonical config target`);
  assert.equal(target.searchParams.get('subjectId'),'entrepreneurship');
  assert.equal(target.searchParams.get('taskId'),taskId);
  assert.equal(target.searchParams.get('protocol'),'planning-v3');
}
const beforeMissing=launchCalls.length;
assert.equal(adapter.launchInHub('unknown',{}).status,'UNAVAILABLE');
assert.equal(launchCalls.length,beforeMissing+1,'Missing descriptor must only notify; never navigate');

console.log('ENTREPRENEURSHIP_SUBJECT_STATIC_GATE=PASS');
