import assert from 'node:assert/strict';
import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('assets/js/thesis-reference-v1.js','utf8');
const css=fs.readFileSync('assets/css/thesis-reference-v1.css','utf8');

assert.ok(index.includes('assets/css/thesis-reference-v1.css?v=1'),'thesis stylesheet is not loaded');
assert.ok(index.includes('assets/js/thesis-reference-v1.js?v=1'),'thesis renderer is not loaded');
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

for(const title of [
  'Đọc tài liệu','Viết chương 3','Tổng hợp dữ liệu','Họp GVHD','Chỉnh sửa nội dung',
  'Nghiên cứu thêm','Phân tích số liệu','Đọc & ghi chú tài liệu','Chuẩn bị báo cáo',
  'Xử lý số liệu','Viết kết luận sơ bộ','Ôn tập tài liệu','Hoàn thiện biểu đồ','Đọc phản hồi'
]) assert.ok(js.includes(title),'reference task missing: '+title);

for(const label of ['Tuần','Tháng','Gantt','Danh sách']) assert.ok(js.includes("'"+label+"'")||js.includes('>'+label+'<'),'view missing: '+label);
assert.ok(js.includes('3 gợi ý hữu ích'),'KPI AI reference copy missing');
assert.ok(js.includes('2 mốc sắp đến hạn'),'attention KPI reference copy missing');
assert.ok(js.includes('65% hoàn thành'),'progress KPI reference copy missing');
assert.ok(js.includes('Chương 3'),'current chapter reference missing');
assert.ok(js.includes('Gợi ý cấu trúc chi tiết cho Chương 3'),'AI row 1 missing');
assert.ok(js.includes('Đề xuất 5 bài báo quan trọng'),'AI row 2 missing');
assert.ok(js.includes('Gợi ý cách phân tích và trình bày số liệu'),'AI row 3 missing');
assert.ok(js.includes('Kiểm tra trùng lặp nội dung'),'AI row 4 missing');
assert.ok(js.includes('Gợi ý cách trả lời nhận xét của GVHD'),'AI row 5 missing');

const unscoped=css.split('\n').filter(line=>{
  const x=line.trim();
  return (x.startsWith('.')||x.startsWith('body')||x.startsWith('#app')||x.startsWith('#nav'))&&!x.startsWith('#page-research ');
});
assert.equal(unscoped.length,0,'thesis stylesheet leaked an unscoped selector');
assert.ok(css.includes('#page-research .thesis-page'),'thesis namespace missing');
assert.ok(css.includes('grid-template-columns:minmax(0,2.08fr) minmax(330px,.92fr)'),'desktop 67/33 split missing');
assert.ok(css.includes('--tp-timeline-height:350px'),'timeline fixed geometry missing');
assert.ok(css.includes('grid-template-columns:50px repeat(7,minmax(0,1fr))'),'7-day timeline grid missing');
assert.ok(css.includes('grid-template-columns:1fr 1.05fr 1.1fr'),'bottom three-panel layout missing');
assert.ok(css.includes('@media(max-width:820px)'),'thesis responsive gate missing');

console.log('THESIS_REFERENCE_V1_STATIC_PASS');
