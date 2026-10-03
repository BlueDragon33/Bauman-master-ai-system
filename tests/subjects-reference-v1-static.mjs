import assert from 'node:assert/strict';
import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('assets/js/subjects-reference-v1.js','utf8');
const truth=fs.readFileSync('assets/js/hub-data-truth.js','utf8');
const css=fs.readFileSync('assets/css/subjects-reference-v1.css','utf8');

assert.ok(index.includes('assets/css/subjects-reference-v1.css?v=1'),'subjects stylesheet is not loaded');
assert.ok(index.includes('assets/js/subjects-reference-v1.js?v=1'),'subjects renderer is not loaded');
assert.ok(index.includes('assets/js/hub-data-truth.js?v=1'),'Hub truth adapter is not loaded');
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

assert.ok(js.includes("function truthProgress(id)"),'truth-aware subject progress resolver missing');
assert.ok(js.includes("a.filteredSubjectsForStage"),'active course rows must derive from canonical stage subjects');
assert.ok(js.includes("return canonical.concat(readCustom()"),'LOCAL_HUB custom rows must remain separate from canonical rows');
assert.ok(js.includes("return 'Chưa có dữ liệu giảng viên'"),'missing lecturer must remain unavailable');
assert.ok(js.includes("var v=JSON.parse(localStorage.getItem(NOTES_KEY)||'[]')"),'notes must not seed reference defaults');
assert.ok(js.includes("Dữ liệu được đọc từ Hub canonical"),'canonical data disclosure missing');
assert.ok(js.includes("Không dùng nội dung mẫu"),'sample-data prohibition missing from active Subjects copy');
assert.ok(js.includes("data-truth-status"),'Subjects truth-state markers missing');
assert.ok(js.includes("TEACHER_KEY='bauman_subjects_reference_teacher_overrides_v1'"),'persistent lecturer override store missing');
assert.ok(js.includes('function editTeacher(key)'),'editable lecturer action missing');
assert.ok(js.includes('function teacherFor(c)'),'lecturer override resolver missing');
assert.ok(js.includes('LOCAL_HUB'),'local override labeling missing');
assert.ok(truth.includes("realZero:progress({x:0},'x').value===0"),'truth helper must preserve a real zero');
assert.ok(truth.includes("missingIsUnavailable:progress({},'x').status===STATES.UNAVAILABLE"),'truth helper must keep missing progress unavailable');
console.log('SUBJECTS_REFERENCE_V1_STATIC_PASS');
