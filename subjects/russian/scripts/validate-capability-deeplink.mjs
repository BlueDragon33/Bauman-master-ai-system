import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const main=fs.readFileSync('assets/js/main.js','utf8');
const planning=fs.readFileSync('assets/js/planning-main.js','utf8');
const launch=fs.readFileSync('assets/js/platform/hub-subject-launch.js','utf8');
const host=fs.readFileSync('subjects/shared/host-bridge.js','utf8');
const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');
const hub=fs.readFileSync('assets/js/hub-safe-shell.js','utf8');

assert.ok(main.includes('function compactSubjectRoute'),'Main route sanitizer missing');
assert.ok(main.includes('function capabilityGapContext'),'Main capability gap context missing');
assert.ok(main.includes("source:capabilityRoute?'capability-gap':'bauman-main'"),'Capability mission source missing');
assert.ok(launch.includes('routeView:route.view'),'Capability route query view missing from launch owner');
assert.ok(launch.includes('routeTab:route.learnTab'),'Capability route query tab missing from launch owner');
assert.ok(launch.includes('routeLesson:route.lessonId'),'Capability route query lesson missing from launch owner');
assert.ok(main.includes('return window.BAUMAN_HUB_SUBJECT_LAUNCH.withTaskQuery(path,task)'),'Public runtime query compatibility helper must delegate to the launch owner');
const queryWindow={};
vm.runInNewContext(launch,{window:queryWindow,URL,location:{href:'https://hub.example/',origin:'https://hub.example'}});
const query=new URL(queryWindow.BAUMAN_HUB_SUBJECT_LAUNCH.withTaskQuery('subjects/russian/index.html',{subjectId:'russian',taskId:'public-contract-test',capabilityRoute:{view:'learning',learnTab:'practice',lessonId:'public-lesson'},capabilityBand:'A1'}));
for(const [key,value] of Object.entries({routeView:'learning',routeTab:'practice',routeLesson:'public-lesson',capabilityBand:'A1',hostOrigin:'https://hub.example',protocol:'planning-v3'}))assert.equal(query.searchParams.get(key),value,'Capability query contract drift: '+key);
assert.ok(main.includes("openSubjectCapabilityGap(id='russian')"),'Main capability gap launcher missing');
assert.ok(hub.includes("a.openSubjectCapabilityGap?.('russian')"),'Hub CTA must use capability gap launcher');
assert.ok(planning.includes("source:base.source==='capability-gap'?'capability-gap':'bauman-main-planning-v3'"),'PlanningBridge must preserve capability-gap provenance');
assert.ok(planning.includes("originSource:base.source||'bauman-main'"),'PlanningBridge origin source trace missing');

assert.ok(host.includes("params.get('routeLesson')"),'Host bridge deep-link lesson fallback missing');
assert.ok(host.includes("params.get('routeView')"),'Host bridge deep-link view fallback missing');
assert.ok(host.includes("source:capabilityRoute?'capability-gap-query':'bauman-main-query'"),'Host bridge query source missing');

assert.ok(core.includes('function normalizeHostCapabilityRoute'),'Russian trusted route sanitizer missing');
assert.ok(core.includes('function applyHostCapabilityRoute'),'Russian capability route applicator missing');
assert.ok(core.includes("const lesson=allLessons.find(x=>lessonKey(x)===route.lessonId)"),'Russian route must resolve a real lesson');
assert.ok(core.includes('const lessonStage=stageOf(lesson)'),'Russian route must derive lesson stage from dataset');
assert.ok(core.includes('state.view=route.view'),'Russian route view application missing');
assert.ok(core.includes('state.learnTab=route.learnTab'),'Russian route tab application missing');
assert.ok(core.includes('state.lessonId=route.lessonId'),'Russian route lesson application missing');
assert.ok(core.includes('const routed=applyHostCapabilityRoute(state.hostTask)'),'Host task does not apply capability route');
assert.doesNotMatch(main,/capabilityRoute[^\n]{0,140}state\.progress\s*=/i,'Deep link must not synthesize progress');
console.log('RUSSIAN_CAPABILITY_DEEPLINK_GATE=PASS');
