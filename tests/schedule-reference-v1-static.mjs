import assert from 'node:assert/strict';
import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('assets/js/schedule-reference-v1.js','utf8');
const css=fs.readFileSync('assets/css/schedule-reference-v1.css','utf8');

assert.ok(index.includes('assets/css/schedule-reference-v1.css?v=6'),'schedule stylesheet is not loaded');
assert.ok(index.includes('assets/js/schedule-reference-v1.js?v=4'),'schedule renderer is not loaded');
assert.ok(js.includes("a.schedule=function(){return render()}"),'module must patch app.schedule only');
assert.ok(!js.includes('a.page=function'),'module must not patch app.page');
assert.ok(!js.includes("querySelector('#nav"),'module must not touch sidebar/navigation');
assert.ok(!js.includes("app.page('"),'module must not introduce cross-tab navigation');
assert.ok(js.includes("document.getElementById('page-schedule')"),'renderer must target #page-schedule');
for(const marker of ['schedule-ref__summary','schedule-ref__week-calendar','schedule-ref__right-rail','schedule-ref__ai','schedule-ref__mini-calendar','schedule-ref__progress','schedule-ref__heatmap','schedule-ref__notes','schedule-ref__range-popover','schedule-ref__day-blocked']){
  assert.ok(js.includes(marker),'missing schedule surface: '+marker);
}
const unscoped=css.split('\n').filter(line=>{
  const x=line.trim();
  return (x.startsWith('.')||x.startsWith('body')||x.startsWith('#app')||x.startsWith('#nav'))&&!x.startsWith('#page-schedule ');
});
assert.equal(unscoped.length,0,'schedule stylesheet leaked an unscoped selector');
assert.ok(css.includes('#page-schedule .schedule-ref-page'),'schedule namespace missing');
assert.ok(css.includes('@media(max-width:620px)'),'mobile responsive gate missing');
assert.ok(js.includes('dateStatus(d)'),'canonical no-study / eligibility guard missing');
assert.ok(js.includes('weekCapacity()'),'week attention metric must be based on visible week capacity');
assert.ok(js.includes('stageSubjects()'),'schedule suggestions must respect the active stage');
assert.ok(js.includes('writeAccepted()'),'schedule suggestion acknowledgement must persist');
assert.ok(!js.includes("' ca lặp'"),'misleading repeated-session warning returned');
assert.ok(css.includes('Schedule Priority Matrix V4'),'V4 priority matrix layer missing');
assert.ok(js.includes("q1:{key:'q1',label:'Khẩn cấp + Quan trọng'"),'q1 priority mapping missing');
assert.ok(js.includes("q3:{key:'q3',label:'Khẩn cấp + Không quan trọng'"),'q3 priority mapping missing');
assert.ok(js.includes("q2:{key:'q2',label:'Quan trọng + Không khẩn cấp'"),'q2 priority mapping missing');
assert.ok(js.includes("q4:{key:'q4',label:'Không quan trọng + Không khẩn cấp'"),'q4 priority mapping missing');
assert.ok(js.includes('priorityKey(r.entry)'),'calendar events must derive semantic priority');
assert.ok(js.includes('highestPriority(records)'),'calendar day summaries must use highest semantic priority');
assert.ok(js.includes('schedule-ref__priority-legend'),'priority legend missing');
assert.ok(css.includes('#D84C63'),'q1 red accent missing');
assert.ok(css.includes('#E08A2E'),'q3 orange accent missing');
assert.ok(css.includes('#3E7BE0'),'q2 blue accent missing');
assert.ok(css.includes('#35A76B'),'q4 green accent missing');
for(const q of ['q1','q3','q2','q4']) assert.ok(css.includes('is-priority-'+q),'priority style missing: '+q);
assert.ok(!js.includes('tonePaint('),'subject palette must not drive primary schedule colors');
console.log('SCHEDULE_REFERENCE_V1_STATIC_PASS');