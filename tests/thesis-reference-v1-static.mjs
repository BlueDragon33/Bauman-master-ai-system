import assert from 'node:assert/strict';
import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('assets/js/thesis-reference-v1.js','utf8');
const truth=fs.readFileSync('assets/js/hub-data-truth.js','utf8');
const css=fs.readFileSync('assets/css/thesis-reference-v1.css','utf8');

assert.ok(index.includes('assets/css/thesis-reference-v1.css?v=1'),'thesis stylesheet is not loaded');
assert.ok(index.includes('assets/js/thesis-reference-v1.js?v=1'),'thesis renderer is not loaded');
assert.ok(index.includes('assets/js/hub-data-truth.js?v=1'),'Hub truth adapter is not loaded');
assert.ok(js.includes("a.research=function(){return render()}"),'module must patch app.research only');
assert.ok(!js.includes('a.page=function'),'thesis module must not patch app.page');
assert.ok(!js.includes('a.subjects=function'),'thesis module must not patch subjects');
assert.ok(!js.includes('a.schedule=function'),'thesis module must not patch schedule');
assert.ok(!js.includes("querySelector('#nav"),'thesis module must not touch shared navigation');
assert.ok(js.includes("document.getElementById('page-research')"),'renderer must target #page-research');

for(const marker of [
  'thesis-page__header','thesis-page__metrics','thesis-page__plan','thesis-page__timeline',
  'thesis-page__ai','thesis-page__mini-calendar','thesis-page__milestones',
  'thesis-page__progress','thesis-page__heatmap','thesis-page__notes'
]) assert.ok(js.includes(marker),'missing thesis surface: '+marker);

for(const label of ['Tuần','Tháng','Gantt','Danh sách']) assert.ok(js.includes("'"+label+"'")||js.includes('>'+label+'<'),'view missing: '+label);

assert.ok(js.includes('function topicState()'),'canonical research-topic projection missing');
assert.ok(js.includes("return Array.isArray(v)?v.filter"),'persisted reference task/note filtering missing');
assert.ok(js.includes("referenceIds=new Set(DEFAULT_NOTES"),'reference notes must be filtered from local state');
assert.ok(js.includes("var referenceIds=new Set(REFERENCE_TASKS"),'reference tasks must be filtered from local state');
assert.ok(js.includes('Không dùng nhiệm vụ mẫu.'),'active Thesis summary must reject sample tasks');
assert.ok(js.includes('Chưa có capability AI luận văn được xác nhận'),'AI panel must fail honestly when capability is unavailable');
assert.ok(js.includes('Chưa có nguồn mốc chính thức được kết nối'),'official milestone panel must remain unavailable without a source');
assert.ok(js.includes('Chưa có nguồn canonical cho tiến độ chương'),'chapter progress must not be invented');
assert.ok(js.includes('LOCAL_HUB'),'local research evidence labeling missing');
assert.ok(js.includes("id:'local-'+Date.now()"),'user-created research tasks must use local identity');
assert.ok(js.includes('data-truth-status="UNAVAILABLE"'),'unavailable truth-state surfaces missing');
assert.ok(truth.includes("STATES=Object.freeze({CURRENT:'CURRENT',STALE:'STALE',UNAVAILABLE:'UNAVAILABLE',LOCAL_HUB:'LOCAL_HUB'})"),'truth-state enum missing');

const unscoped=css.split('\n').filter(line=>{
  const x=line.trim();
  return (x.startsWith('.')||x.startsWith('body')||x.startsWith('#app')||x.startsWith('#nav'))&&!x.startsWith('#page-research ');
});
assert.equal(unscoped.length,0,'thesis stylesheet leaked an unscoped selector');
assert.ok(css.includes('#page-research .thesis-page'),'thesis namespace missing');
assert.ok(css.includes('grid-template-columns:minmax(0,2.08fr) minmax(330px,.92fr)'),'desktop 67/33 split missing');
assert.ok(css.includes('--tp-timeline-height:350px'),'timeline fixed geometry missing');
assert.ok(css.includes('grid-template-columns:50px repeat(7,minmax(0,1fr))'),'7-day timeline grid missing');
assert.ok(js.includes('thesis-page__left-bottom'),'lower-left research mosaic missing');
assert.ok(css.includes('grid-template-columns:1fr 1.08fr'),'lower-left progress/heatmap split missing');
assert.ok(js.includes("'+notes()+'</aside>'"),'notes must stay in the right rail');
assert.ok(css.includes('@media(max-width:820px)'),'thesis responsive gate missing');

console.log('THESIS_REFERENCE_V1_STATIC_PASS');
