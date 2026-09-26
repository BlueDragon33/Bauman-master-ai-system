import assert from 'node:assert/strict';
import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('assets/js/subjects-reference-v1.js','utf8');
const css=fs.readFileSync('assets/css/subjects-reference-v1.css','utf8');

assert.ok(index.includes('assets/css/subjects-reference-v1.css?v=1'),'subjects stylesheet is not loaded');
assert.ok(index.includes('assets/js/subjects-reference-v1.js?v=1'),'subjects renderer is not loaded');
assert.ok(js.includes("a.subjects=function(){return render()}"),'module must patch app.subjects only');
assert.ok(!js.includes('a.page=function'),'subjects module must not patch app.page');
assert.ok(!js.includes("querySelector('#nav"),'subjects module must not touch sidebar/navigation');
assert.ok(!js.includes("app.page('"),'subjects module must not introduce cross-tab navigation');
assert.ok(js.includes("document.getElementById('page-subjects')"),'renderer must target #page-subjects');
for(const marker of ['subjects-page__header','subjects-page__summary','subjects-page__course-list','subjects-page__course-card','subjects-page__ai','subjects-page__calendar','subjects-page__deadlines','subjects-page__progress','subjects-page__heat','subjects-page__notes']){
  assert.ok(js.includes(marker),'missing subjects surface: '+marker);
}
const unscoped=css.split('\n').filter(line=>{
  const x=line.trim();
  return (x.startsWith('.')||x.startsWith('body')||x.startsWith('#app')||x.startsWith('#nav'))&&!x.startsWith('#page-subjects ');
});
assert.equal(unscoped.length,0,'subjects stylesheet leaked an unscoped selector');
assert.ok(css.includes('#page-subjects .subjects-page'),'subjects namespace missing');
assert.ok(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'),'desktop two-column course grid missing');
assert.ok(css.includes('grid-template-columns:minmax(0,2.06fr) minmax(330px,.94fr)'),'desktop 67/33 workspace ratio missing');
assert.ok(css.includes('@media(max-width:820px)'),'subjects responsive gate missing');
assert.ok(js.includes("title:'Tiếng Nga'"),'reference Russian course missing');
assert.ok(js.includes("title:'Toán cao cấp'"),'reference math course missing');
assert.ok(js.includes("title:'Lập trình Python'"),'reference Python course missing');
assert.ok(js.includes("title:'Xác suất thống kê'"),'reference probability course missing');
assert.ok(js.includes("title:'Cơ sở dữ liệu'"),'reference database course missing');
assert.ok(js.includes("title:'Nghe - Nói'"),'reference speaking course missing');
assert.ok(!js.includes('canva-subjects-page'),'subjects renderer must bypass V6 legacy subjects decorator');
console.log('SUBJECTS_REFERENCE_V1_STATIC_PASS');
