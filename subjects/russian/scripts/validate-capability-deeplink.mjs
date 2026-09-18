import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync('assets/js/main.js','utf8');
const host=fs.readFileSync('subjects/shared/host-bridge.js','utf8');
const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');
const hub=fs.readFileSync('assets/js/hub-safe-shell.js','utf8');

assert.ok(main.includes('function compactSubjectRoute'),'Main route sanitizer missing');
assert.ok(main.includes('function capabilityGapContext'),'Main capability gap context missing');
assert.ok(main.includes("source:capabilityRoute?'capability-gap':'bauman-main'"),'Capability mission source missing');
assert.ok(main.includes('routeView:route.view'),'Capability route query view missing');
assert.ok(main.includes('routeTab:route.learnTab'),'Capability route query tab missing');
assert.ok(main.includes('routeLesson:route.lessonId'),'Capability route query lesson missing');
assert.ok(main.includes("openSubjectCapabilityGap(id='russian')"),'Main capability gap launcher missing');
assert.ok(hub.includes("a.openSubjectCapabilityGap?.('russian')"),'Hub CTA must use capability gap launcher');

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
