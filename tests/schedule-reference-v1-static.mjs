import assert from 'node:assert/strict';
import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('assets/js/schedule-reference-v1.js','utf8');
const css=fs.readFileSync('assets/css/schedule-reference-v1.css','utf8');

assert.ok(index.includes('assets/css/schedule-reference-v1.css?v=1'),'schedule stylesheet is not loaded');
assert.ok(index.includes('assets/js/schedule-reference-v1.js?v=1'),'schedule renderer is not loaded');
assert.ok(js.includes("a.schedule=function(){return render()}"),'module must patch app.schedule only');
assert.ok(!js.includes('a.page=function'),'module must not patch app.page');
assert.ok(!js.includes("querySelector('#nav"),'module must not touch sidebar/navigation');
assert.ok(!js.includes("app.page('"),'module must not introduce cross-tab navigation');
assert.ok(js.includes("document.getElementById('page-schedule')"),'renderer must target #page-schedule');
for(const marker of ['schedule-ref__summary','schedule-ref__week-calendar','schedule-ref__right-rail','schedule-ref__ai','schedule-ref__mini-calendar','schedule-ref__progress','schedule-ref__heatmap','schedule-ref__notes']){
  assert.ok(js.includes(marker),'missing schedule surface: '+marker);
}
const unscoped=css.split('\n').filter(line=>{
  const x=line.trim();
  return (x.startsWith('.')||x.startsWith('body')||x.startsWith('#app')||x.startsWith('#nav'))&&!x.startsWith('#page-schedule ');
});
assert.equal(unscoped.length,0,'schedule stylesheet leaked an unscoped selector');
assert.ok(css.includes('#page-schedule .schedule-ref-page'),'schedule namespace missing');
assert.ok(css.includes('@media(max-width:620px)'),'mobile responsive gate missing');
console.log('SCHEDULE_REFERENCE_V1_STATIC_PASS');