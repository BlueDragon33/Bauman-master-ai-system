import assert from 'node:assert/strict';
import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('assets/css/hub-readable-type-v1.css','utf8');
const main=fs.readFileSync('assets/js/main.js','utf8');
const schedule=fs.readFileSync('assets/js/schedule-reference-v1.js','utf8');

assert.ok(index.includes('assets/css/hub-readable-type-v1.css?v=1'),'readable typography layer is not loaded last');
assert.ok(index.includes('ChatGPT · 100%'),'ChatGPT-size preset label missing');
for(const mode of ['compact','normal','large','xlarge']) assert.ok(css.includes('body[data-size="'+mode+'"]'),'size mode missing: '+mode);
for(const page of ['#page-home','#page-roadmap','#page-subjects','#page-schedule','#page-research']) assert.ok(css.includes(page),'readability coverage missing: '+page);
assert.ok(css.includes('--hub-body-size:16px'),'normal body size must be 16px');
assert.ok(css.includes('--hub-control-size:14.5px'),'normal control size must be readable');
assert.ok(css.includes('.subjects-page__course-name b'),'subjects title override missing');
assert.ok(css.includes('.schedule-ref__event b'),'schedule event override missing');
assert.ok(css.includes('.thesis-page__event b'),'thesis event override missing');
assert.ok(css.includes('#modalRoot .dialog'),'modal/edit typography override missing');
assert.ok(main.includes("toast('Đã áp dụng cỡ chữ"),'appearance size feedback missing');
assert.ok(main.includes("document.body.dataset.scheduleEditing=state.schedule?.edit?'true':'false'"),'manual editing state sync missing');
assert.ok(schedule.includes("document.body.dataset.scheduleEditing=sc.edit?'true':'false'"),'schedule reference edit state sync missing');
console.log('READABLE_TYPOGRAPHY_V1_STATIC_PASS');
