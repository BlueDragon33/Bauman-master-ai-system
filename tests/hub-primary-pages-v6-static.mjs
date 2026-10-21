import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const index=fs.readFileSync('index.html','utf8');
const pages=fs.readFileSync('assets/js/hub-primary-pages-v6.js','utf8');
const css=fs.readFileSync('assets/css/hub-primary-pages-v6.css','utf8');
const nav=fs.readFileSync('assets/js/hub-learning-cluster.js','utf8');
const shell=fs.readFileSync('assets/js/hub-safe-shell.js','utf8');
const safeUx=fs.readFileSync('assets/js/hub-safe-ux.js','utf8');
const search=fs.readFileSync('assets/js/hub-overview-search-v2.js','utf8');

assert.ok(index.includes('hub-ui-booting'),'Hub boot guard is missing');
assert.ok(index.includes('assets/css/hub-primary-pages-v6.css?v=2'),'V6 page stylesheet is not loaded');
assert.ok(index.includes('assets/js/hub-primary-pages-v6.js?v=1'),'V6 page renderer is not loaded');
assert.ok(index.includes('assets/js/hub-data-truth.js?v=1'),'Hub truth adapter is not loaded');

for(const id of ['subjects','schedule','research']){
  assert.ok(pages.includes(`a.${id}=function()`),`V6 does not synchronously own the ${id} presentation pass`);
  assert.ok(pages.includes(`pageId==='${id}'`),`V6 finalizer is missing ${id}`);
}
assert.ok(pages.includes("document.body.classList.remove('hub-ui-booting')"),'V6 never releases the boot guard');
assert.ok(pages.includes("document.body.classList.add('hub-ui-routing')"),'V6 route paint guard is missing');
assert.ok(css.includes('body.hub-ui-booting #appRoot:not(.hidden){visibility:hidden}'),'Boot guard CSS is missing');
assert.ok(css.includes('#page-subjects'),'Subjects V6 styling missing');
assert.ok(css.includes('#page-schedule'),'Schedule V6 styling missing');
assert.ok(css.includes('#page-research'),'Research V6 styling missing');
assert.ok(css.includes('.page.active{min-width:0;animation:none!important;transform:none!important}'),'V6 must disable the legacy 4px route-entry transform');

assert.ok(!nav.includes('attempts<20'),'Primary navigation still performs delayed polling reflows');
assert.ok(!shell.includes('setTimeout(ensureAll,350)'),'Safe shell still performs delayed 350ms startup reflow');
assert.ok(!shell.includes('setTimeout(ensureAll,1200)'),'Safe shell still performs delayed 1200ms startup reflow');
assert.ok(!safeUx.includes('setTimeout(refresh,1400)'),'Safe UX still performs delayed startup reflow');
assert.ok(!search.includes('setTimeout(install,350)'),'Overview/search still performs delayed 350ms startup reflow');
assert.ok(!search.includes('setTimeout(install,1200)'),'Overview/search still performs delayed 1200ms startup reflow');
assert.ok(!search.includes('setTimeout(compactHome,0)'),'Home observer still defers layout mutation to a later paint');
assert.ok(!search.includes('setTimeout(compactSubjectCapability,0)'),'Subject capability observer still defers layout mutation to a later paint');
assert.ok(pages.includes("truth?truth.progress"),'Subjects V6 hero must preserve progress truth state');
assert.ok(pages.includes("input[data-research-check=\"1\"]"),'Research V6 metrics must count only canonical checklist evidence');
assert.ok(pages.includes("checklist LOCAL_HUB"),'Research checklist must be labeled LOCAL_HUB');

// Reproduce the reference-renderer integration: legacy card selectors are
// absent, while the canonical Hub owner still has six stage subjects.
let subjectHero='';
const subjectHost={classList:{add(){}},querySelector(){return null},querySelectorAll(){return []},insertAdjacentHTML(position,markup){subjectHero=markup}};
const fixtureSubjects=Object.fromEntries(Array.from({length:6},(_,i)=>['fixture-'+i,{id:'fixture-'+i,name:'Fixture '+i}]));
const sandbox={
  window:{BAUMAN_HUB_PERSONAL_STORE:{get(key,fallback){return fallback}}},
  document:{readyState:'loading',addEventListener(){},getElementById(){return null},body:{dataset:{}},querySelector(selector){return selector==='#page-subjects .subjects-page'?subjectHost:null},querySelectorAll(){return []}},
  localStorage:{getItem(){return null},setItem(){}},
  state:{subjectStage:'prepare',subject:'fixture-0',subjects:fixtureSubjects,progress:{},page:'home'},
  app:{filteredSubjectsForStage(){return Object.values(fixtureSubjects)}}
};
vm.createContext(sandbox);
vm.runInContext(pages,sandbox);
vm.runInContext(fs.readFileSync('assets/js/subjects-reference-v1.js','utf8'),sandbox);
sandbox.window.BAUMAN_HUB_PRIMARY_PAGES_V6.finalize('subjects');
assert.match(subjectHero,/<b>6<\/b><small>môn ở giai đoạn<\/small>/,'Reference Subjects hero must use the canonical stage count, not obsolete DOM selectors');
assert.match(subjectHero,/<b>6<\/b><small>khối nội dung đang thấy<\/small>/,'Reference Subjects hero must use the visible course count from its owner');
assert.match(subjectHero,/<b>—<\/b><small>chưa có dữ liệu tiến độ<\/small>/,'Missing progress must remain unavailable');
sandbox.window.BAUMAN_SUBJECTS_REF.toggleTab('done');
sandbox.window.BAUMAN_HUB_PRIMARY_PAGES_V6.finalize('subjects');
assert.match(subjectHero,/<b>6<\/b><small>môn ở giai đoạn<\/small>/,'A visibility filter must not change the canonical stage count');
assert.match(subjectHero,/<b>0<\/b><small>khối nội dung đang thấy<\/small>/,'A genuinely empty filter must remain zero');

console.log('HUB_PRIMARY_PAGES_V6_STATIC_PASS');
