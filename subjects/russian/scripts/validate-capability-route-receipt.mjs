import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync('assets/js/main.js','utf8');
const hub=fs.readFileSync('assets/js/hub-safe-shell.js','utf8');
const css=fs.readFileSync('assets/css/hub-safe-shell.css','utf8');
const core=fs.readFileSync('subjects/russian/assets/core.js','utf8');

assert.ok(main.includes("capabilityRouteReceipt:'BAUMAN_SUBJECT_CAPABILITY_ROUTE_APPLIED'"),'Main receipt message type missing');
assert.ok(main.includes('subjectRouteReceipts:{}'),'Main route receipt store missing');
assert.ok(main.includes('out.subjectRouteReceipts ='),'Main receipt store normalization missing');
assert.ok(main.includes('function normalizeSubjectRouteReceipt'),'Main receipt sanitizer missing');
assert.ok(main.includes('function receiveSubjectRouteReceipt'),'Main receipt consumer missing');
assert.ok(main.includes("receipt.schema!=='RUSSIAN_CAPABILITY_ROUTE_RECEIPT_V1'"),'Receipt schema gate missing');
assert.ok(main.includes("task.source!=='capability-gap'"),'Receipt must bind to active capability mission');
assert.ok(main.includes('receipt.taskId!==activeTaskId'),'Receipt task identity gate missing');
assert.ok(main.includes('receipt.route.view!==expected.view'),'Receipt route view gate missing');
assert.ok(main.includes('receipt.route.learnTab!==expected.learnTab'),'Receipt route tab gate missing');
assert.ok(main.includes('receipt.route.lessonId!==expected.lessonId'),'Receipt lesson gate missing');
assert.ok(main.includes('state.subjectRouteReceipts[receipt.subjectId]=receipt'),'Verified receipt persistence missing');
assert.ok(main.includes('msg.type===BRIDGE_TYPES.capabilityRouteReceipt'),'Bridge receipt consumer branch missing');

assert.ok(core.includes("type:'BAUMAN_SUBJECT_CAPABILITY_ROUTE_APPLIED'"),'Russian applied-route ACK missing');
assert.ok(core.includes("schema:'RUSSIAN_CAPABILITY_ROUTE_RECEIPT_V1'"),'Russian receipt schema missing');
assert.ok(core.includes("taskId:str(state.hostTask.taskId||state.hostTask.missionId)"),'Russian receipt task binding missing');
assert.ok(core.includes('route:appliedRoute'),'Russian receipt exact route missing');
assert.ok(core.includes("source:'subjects/russian'"),'Russian receipt provenance missing');
assert.ok(core.indexOf('save();render();')<core.indexOf("type:'BAUMAN_SUBJECT_CAPABILITY_ROUTE_APPLIED'"),'Russian must save/render applied route before ACK');

assert.ok(hub.includes('function capabilityRouteReceipt'),'Hub verified receipt matcher missing');
assert.ok(hub.includes("data-safe-capability-receipt=\"confirmed\""),'Hub confirmed receipt surface missing');
assert.ok(hub.includes('Russian đã xác nhận mở'),'Hub receipt confirmation copy missing');
assert.ok(hub.includes('Hub chỉ đánh dấu xác nhận sau ACK'),'Hub pending receipt disclosure missing');
assert.ok(css.includes('.hub-safe-capability-receipt'),'Hub receipt styling missing');

assert.doesNotMatch(main,/subjectRouteReceipts[^\n]{0,180}state\.progress\s*=/i,'Route receipt must not synthesize progress');
assert.doesNotMatch(core,/CAPABILITY_ROUTE_APPLIED[^\n]{0,300}(?:correct|score|mastery)/i,'Route receipt must not claim learning mastery');
console.log('RUSSIAN_CAPABILITY_ROUTE_RECEIPT_GATE=PASS');
