/* Bauman Master Hub · Thesis Reference UI V1
   Scope lock: only #page-research / app.research.
   Reference-first visual state for the Luận văn tab. */
(function(){
'use strict';

var RELEASE='THESIS_REFERENCE_V1_2026_09_26';
var UI_KEY='bauman_thesis_reference_ui_v1';
var TASK_KEY='bauman_thesis_reference_tasks_v1';
var NOTE_KEY='bauman_thesis_reference_notes_v1';

var DAYS=[
  {date:'2025-03-10',label:'Thứ 2',short:'10/03'},
  {date:'2025-03-11',label:'Thứ 3',short:'11/03'},
  {date:'2025-03-12',label:'Thứ 4',short:'12/03'},
  {date:'2025-03-13',label:'Thứ 5',short:'13/03',today:true},
  {date:'2025-03-14',label:'Thứ 6',short:'14/03'},
  {date:'2025-03-15',label:'Thứ 7',short:'15/03'},
  {date:'2025-03-16',label:'Chủ nhật',short:'16/03'}
];

var REFERENCE_TASKS=[
  {id:'t01',day:0,title:'Đọc tài liệu',start:'09:00',end:'11:00',tone:'purple',detail:'Đọc và đánh dấu các tài liệu nền cho Chương 3.'},
  {id:'t02',day:0,title:'Viết chương 3',start:'14:00',end:'16:00',tone:'green',detail:'Viết phần phương pháp và giả thuyết nghiên cứu.'},
  {id:'t03',day:0,title:'Tổng hợp dữ liệu',start:'19:00',end:'21:00',tone:'blue',detail:'Chuẩn hóa dữ liệu thô và cập nhật bảng biến.'},
  {id:'t04',day:1,title:'Họp GVHD',start:'09:00',end:'10:30',tone:'yellow',detail:'Trao đổi cấu trúc Chương 3 và kế hoạch phân tích.'},
  {id:'t05',day:1,title:'Chỉnh sửa nội dung',start:'13:00',end:'15:00',tone:'red',detail:'Sửa nội dung theo nhận xét gần nhất của GVHD.'},
  {id:'t06',day:1,title:'Nghiên cứu thêm',start:'16:00',end:'17:30',tone:'purple',detail:'Bổ sung tài liệu về phương pháp và thang đo.'},
  {id:'t07',day:2,title:'Phân tích số liệu',start:'10:00',end:'12:00',tone:'blue',detail:'Chạy phân tích mô tả và kiểm tra dữ liệu.'},
  {id:'t08',day:2,title:'Viết chương 3',start:'15:00',end:'17:00',tone:'green',detail:'Hoàn thiện phần quy trình nghiên cứu.'},
  {id:'t09',day:3,title:'Viết chương 3',start:'09:00',end:'11:00',tone:'red',detail:'Chốt phần phương pháp nghiên cứu quan trọng.'},
  {id:'t10',day:3,title:'Đọc & ghi chú tài liệu',start:'14:00',end:'16:00',tone:'yellow',detail:'Đọc tài liệu liên quan và ghi chú trích dẫn.'},
  {id:'t11',day:3,title:'Chuẩn bị báo cáo',start:'19:00',end:'20:30',tone:'blue',detail:'Chuẩn bị báo cáo tiến độ cho cuộc họp tiếp theo.'},
  {id:'t12',day:4,title:'Xử lý số liệu',start:'10:00',end:'12:00',tone:'green',detail:'Làm sạch dữ liệu và xử lý biến phân tích.'},
  {id:'t13',day:4,title:'Viết kết luận sơ bộ',start:'15:00',end:'17:00',tone:'purple',detail:'Ghi các phát hiện ban đầu sau phân tích.'},
  {id:'t14',day:5,title:'Ôn tập tài liệu',start:'09:00',end:'11:00',tone:'blue',detail:'Rà soát tài liệu và mạch lập luận.'},
  {id:'t15',day:5,title:'Hoàn thiện biểu đồ',start:'16:00',end:'18:00',tone:'red',detail:'Chuẩn hóa nhãn, đơn vị và chú thích biểu đồ.'},
  {id:'t16',day:6,title:'Đọc phản hồi',start:'10:00',end:'11:30',tone:'yellow',detail:'Đọc phản hồi của GVHD và lập danh sách sửa.'}
];

var AI_ITEMS=[
  {id:'a1',checked:true,icon:'▧',tone:'blue',title:'Gợi ý cấu trúc chi tiết cho Chương 3',desc:'Dựa trên đề tài và các bài nghiên cứu gần đây'},
  {id:'a2',checked:true,icon:'💡',tone:'yellow',title:'Đề xuất 5 bài báo quan trọng',desc:'Liên quan đến phương pháp nghiên cứu của bạn'},
  {id:'a3',checked:false,icon:'▥',tone:'blue',title:'Gợi ý cách phân tích và trình bày số liệu',desc:'Kèm ví dụ minh họa phù hợp với SPSS/R'},
  {id:'a4',checked:false,icon:'✎',tone:'purple',title:'Kiểm tra trùng lặp nội dung',desc:'So sánh với các nguồn tài liệu học thuật'},
  {id:'a5',checked:false,icon:'●',tone:'blue',title:'Gợi ý cách trả lời nhận xét của GVHD',desc:'Hỗ trợ viết email trao đổi chuyên môn'}
];

var MILESTONES=[
  {id:'m1',tone:'red',icon:'▣',title:'Báo cáo tiến độ tháng 3',date:'Hạn nộp: 16/03/2025',badge:'Còn 3 ngày'},
  {id:'m2',tone:'orange',icon:'▣',title:'Nộp chương 3',date:'Hạn nộp: 23/03/2025',badge:'Còn 10 ngày'},
  {id:'m3',tone:'blue',icon:'▣',title:'Gặp GVHD',date:'Hạn nộp: 25/03/2025',badge:'Còn 12 ngày'},
  {id:'m4',tone:'green',icon:'▣',title:'Nộp bản nháp tổng thể',date:'Hạn nộp: 10/04/2025',badge:'Còn 28 ngày'}
];

var CHAPTERS=[
  {tone:'green',title:'Chương 1. Giới thiệu',value:100},
  {tone:'blue',title:'Chương 2. Tổng quan tài liệu',value:80},
  {tone:'purple',title:'Chương 3. Phương pháp NC',value:50},
  {tone:'orange',title:'Chương 4. Kết quả nghiên cứu',value:30},
  {tone:'gray',title:'Chương 5. Thảo luận',value:0},
  {tone:'gray',title:'Chương 6. Kết luận & kiến nghị',value:0}
];

var HEAT=[
  [1,2,1,2,2,1,0],
  [1,1,2,3,2,1,1],
  [2,3,4,2,4,2,2],
  [2,3,4,2,4,3,3]
];

var DEFAULT_NOTES=[
  {id:'n1',text:'Hoàn thiện dàn ý chương 3',date:'12/03/2025',done:true},
  {id:'n2',text:'Tổng hợp phản hồi từ GVHD',date:'16/03/2025',done:false},
  {id:'n3',text:'Đọc thêm tài liệu về SEM',date:'13/03/2025',done:true},
  {id:'n4',text:'Chuẩn bị slide bảo vệ',date:'30/03/2025',done:false}
];

var ui=readUI();

function appRef(){return typeof app!=='undefined'?app:null}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function toastSafe(msg){try{if(typeof toast==='function')return toast(msg)}catch(e){}}
function readUI(){
  try{
    var raw=JSON.parse(localStorage.getItem(UI_KEY)||'{}');
    return {
      view:['week','month','gantt','list'].includes(raw.view)?raw.view:'week',
      month:raw.month||'2025-03',
      weekOffset:Number(raw.weekOffset)||0,
      filterOpen:false,
      aiDone:new Set(Array.isArray(raw.aiDone)?raw.aiDone:AI_ITEMS.filter(function(x){return x.checked}).map(function(x){return x.id})),
      detailId:'',
      taskOpen:false,
      upcomingExpanded:!!raw.upcomingExpanded
    };
  }catch(e){
    return {view:'week',month:'2025-03',weekOffset:0,filterOpen:false,aiDone:new Set(['a1','a2']),detailId:'',taskOpen:false,upcomingExpanded:false};
  }
}
function saveUI(){
  try{localStorage.setItem(UI_KEY,JSON.stringify({view:ui.view,month:ui.month,weekOffset:ui.weekOffset,aiDone:Array.from(ui.aiDone),upcomingExpanded:ui.upcomingExpanded}))}catch(e){}
}
function readTasks(){try{var v=JSON.parse(localStorage.getItem(TASK_KEY)||'null');return Array.isArray(v)?v:REFERENCE_TASKS.map(function(x){return Object.assign({},x)});}catch(e){return REFERENCE_TASKS.map(function(x){return Object.assign({},x)})}}
function writeTasks(v){try{localStorage.setItem(TASK_KEY,JSON.stringify(v.slice(0,60)))}catch(e){}}
function readNotes(){try{var v=JSON.parse(localStorage.getItem(NOTE_KEY)||'null');return Array.isArray(v)?v:DEFAULT_NOTES.map(function(x){return Object.assign({},x)});}catch(e){return DEFAULT_NOTES.map(function(x){return Object.assign({},x)})}}
function writeNotes(v){try{localStorage.setItem(NOTE_KEY,JSON.stringify(v.slice(0,24)))}catch(e){}}
function timeMinutes(v){var m=String(v||'').match(/(\d{1,2}):(\d{2})/);return m?Number(m[1])*60+Number(m[2]):0}
function todayLabel(){return 'Tuần 10/03 - 16/03/2025'}
function setView(view){ui.view=['week','month','gantt','list'].includes(view)?view:'week';saveUI();render()}
function setMonth(v){ui.month=v||'2025-03';saveUI();render()}
function toggleFilter(){ui.filterOpen=!ui.filterOpen;render()}
function clearFilters(){ui.filterOpen=false;render()}
function shiftWeek(n){ui.weekOffset+=Number(n)||0;saveUI();render()}
function goToday(){ui.weekOffset=0;ui.month='2025-03';saveUI();render()}
function toggleAI(id){if(ui.aiDone.has(id))ui.aiDone.delete(id);else ui.aiDone.add(id);saveUI();render()}
function toggleUpcoming(){ui.upcomingExpanded=!ui.upcomingExpanded;saveUI();render()}
function openTask(id){ui.detailId=id;render()}
function closeTask(){ui.detailId='';render()}
function openCreate(){ui.taskOpen=true;render()}
function closeCreate(){ui.taskOpen=false;render()}
function createTask(){
  var root=document.getElementById('page-research');
  var title=root&&root.querySelector('#thesisTaskTitle'),day=root&&root.querySelector('#thesisTaskDay'),start=root&&root.querySelector('#thesisTaskStart'),end=root&&root.querySelector('#thesisTaskEnd'),tone=root&&root.querySelector('#thesisTaskTone');
  if(!title||!title.value.trim())return toastSafe('Hãy nhập tên nhiệm vụ.');
  var rows=readTasks();
  rows.push({id:'t'+Date.now(),day:Number(day&&day.value)||0,title:title.value.trim().slice(0,80),start:start&&start.value||'09:00',end:end&&end.value||'10:00',tone:tone&&tone.value||'blue',detail:'Nhiệm vụ được thêm từ Tab Luận văn.'});
  writeTasks(rows);ui.taskOpen=false;render();toastSafe('Đã thêm nhiệm vụ luận văn.');
}
function toggleNote(id,done){var notes=readNotes(),n=notes.find(function(x){return x.id===id});if(n)n.done=!!done;writeNotes(notes);render()}
function addNote(){
  var text=window.prompt('Nhập ghi chú / nhắc việc:');
  if(!text||!text.trim())return;
  var date=window.prompt('Ngày / thời hạn:','Hôm nay')||'Hôm nay';
  var notes=readNotes();
  notes.push({id:'n'+Date.now(),text:text.trim().slice(0,140),date:date.trim().slice(0,40),done:false});
  writeNotes(notes);render();
}
function openMilestone(id){var x=MILESTONES.find(function(m){return m.id===id});if(x)toastSafe(x.title+' · '+x.date)}
function header(){
  return '<header class="thesis-page__header"><div><h2>Luận văn</h2><p>Theo dõi tiến độ luận văn, quản lý nhiệm vụ nghiên cứu, phản hồi từ giảng viên, mốc thời gian và tài nguyên.</p></div>'+
  '<div class="thesis-page__header-actions"><select class="thesis-page__select" onchange="BAUMAN_THESIS_REF.setMonth(this.value)"><option value="2025-03" '+(ui.month==='2025-03'?'selected':'')+'>▣ Tháng 3, 2025</option><option value="2025-04" '+(ui.month==='2025-04'?'selected':'')+'>▣ Tháng 4, 2025</option></select>'+
  '<div class="thesis-page__filter-wrap"><button class="thesis-page__button" onclick="BAUMAN_THESIS_REF.toggleFilter()">⌁ Bộ lọc</button>'+filterPanel()+'</div>'+
  '<button class="thesis-page__button thesis-page__button--primary" onclick="BAUMAN_THESIS_REF.openCreate()">＋ Tạo nhiệm vụ</button></div></header>';
}
function filterPanel(){
  return '<div class="thesis-page__filter-panel '+(ui.filterOpen?'is-open':'')+'"><b>Hiển thị</b><label><input type="checkbox" checked> Nhiệm vụ viết</label><label><input type="checkbox" checked> Nghiên cứu & dữ liệu</label><label><input type="checkbox" checked> GVHD & báo cáo</label><button onclick="BAUMAN_THESIS_REF.clearFilters()">Đóng</button></div>';
}
function summaryCard(tone,icon,label,main,sub,desc,kind){
  var tail=kind==='ring'?'<span class="thesis-page__donut" style="--p:65"><i>65%</i></span>':'<span class="thesis-page__chev">›</span>';
  return '<article class="thesis-page__summary-card is-'+tone+'"><span class="thesis-page__summary-icon">'+icon+'</span><div><small>'+esc(label)+'</small><b>'+esc(main)+'</b><strong>'+esc(sub)+'</strong><p>'+esc(desc)+'</p></div>'+tail+'</article>';
}
function summary(){
  return '<section class="thesis-page__metrics">'+
    summaryCard('blue','▥','Tiến độ luận văn','65% hoàn thành','Đã hoàn thành 7/11 nhiệm vụ chính','', 'ring')+
    summaryCard('green','▧','Chương hiện tại','Chương 3','Phương pháp nghiên cứu','Đang viết và phân tích dữ liệu','chev')+
    summaryCard('orange','!','Việc cần chú ý','2 mốc sắp đến hạn','Báo cáo tiến độ (3 ngày nữa)','Nộp chương 3 (10 ngày nữa)','chev')+
    summaryCard('purple','✦','Gợi ý từ AI','3 gợi ý hữu ích','Về cấu trúc chương, tài liệu tham khảo','và cách phân tích số liệu','chev')+
  '</section>';
}
function tabs(){
  return '<div class="thesis-page__tabs">'+[
    ['week','Tuần'],['month','Tháng'],['gantt','Gantt'],['list','Danh sách']
  ].map(function(x){return '<button class="'+(ui.view===x[0]?'is-active':'')+'" onclick="BAUMAN_THESIS_REF.setView(\''+x[0]+'\')">'+x[1]+'</button>'}).join('')+'</div>';
}
function planToolbar(){
  return '<div class="thesis-page__plan-head"><div class="thesis-page__plan-title"><span>▣</span><b>Kế hoạch luận văn</b></div>'+tabs()+'<div class="thesis-page__plan-nav"><button onclick="BAUMAN_THESIS_REF.goToday()">▣ Hôm nay</button><button aria-label="Tuần trước" onclick="BAUMAN_THESIS_REF.shiftWeek(-1)">‹</button><button aria-label="Tuần sau" onclick="BAUMAN_THESIS_REF.shiftWeek(1)">›</button></div></div>';
}
function eventCard(t){
  var start=timeMinutes(t.start),end=timeMinutes(t.end),top=(start-480)/780*100,height=Math.max(5,(end-start)/780*100);
  return '<button class="thesis-page__event is-'+esc(t.tone)+'" style="--top:'+top+'%;--height:'+height+'%" onclick="BAUMAN_THESIS_REF.openTask(\''+esc(t.id)+'\')"><b>'+esc(t.title)+'</b><span>'+esc(t.start+' – '+t.end)+'</span></button>';
}
function weekView(){
  var tasks=readTasks();
  return '<div class="thesis-page__week-label">'+todayLabel()+'</div>'+
    '<div class="thesis-page__timeline"><div class="thesis-page__corner"></div>'+
    DAYS.map(function(d){return '<div class="thesis-page__day-head '+(d.today?'is-today':'')+'"><b>'+d.label+'</b><span>'+d.short+'</span></div>'}).join('')+
    '<div class="thesis-page__time-axis">'+Array.from({length:14},function(_,i){return '<span>'+String(8+i).padStart(2,'0')+':00</span>'}).join('')+'</div>'+
    DAYS.map(function(d,di){return '<div class="thesis-page__day-col '+(d.today?'is-today':'')+'">'+tasks.filter(function(t){return Number(t.day)===di}).map(eventCard).join('')+'</div>'}).join('')+
    '</div>';
}
function monthView(){
  var days=Array.from({length:42},function(_,i){var d=i-4;return d<=0?{d:28+d,out:true}:{d:d>31?d-31:d,out:d>31}});
  var marked={3:'purple',5:'blue',7:'green',10:'blue',11:'yellow',12:'blue',13:'red',14:'green',15:'blue',16:'yellow',20:'blue',23:'orange',25:'blue',30:'green'};
  return '<div class="thesis-page__month-view"><div class="thesis-page__month-weekdays">'+['T2','T3','T4','T5','T6','T7','CN'].map(function(x){return '<span>'+x+'</span>'}).join('')+'</div><div class="thesis-page__month-grid">'+days.map(function(x){return '<button class="'+(x.out?'is-outside ':'')+(x.d===13&&!x.out?'is-active':'')+'"><b>'+x.d+'</b>'+(marked[x.d]&&!x.out?'<i class="is-'+marked[x.d]+'"></i>':'')+'</button>'}).join('')+'</div></div>';
}
function ganttView(){
  return '<div class="thesis-page__gantt"><div class="thesis-page__gantt-head"><span>Hạng mục</span>'+['10/03','11/03','12/03','13/03','14/03','15/03','16/03'].map(function(x){return '<b>'+x+'</b>'}).join('')+'</div>'+
  [
    ['Chương 3','green',0,4],['Phân tích dữ liệu','blue',2,3],['Phản hồi GVHD','yellow',1,5],['Báo cáo tiến độ','red',3,4],['Tài liệu tham khảo','purple',0,6]
  ].map(function(x){return '<div class="thesis-page__gantt-row"><span>'+x[0]+'</span><div><i class="is-'+x[1]+'" style="--start:'+x[2]+';--span:'+x[3]+'"></i></div></div>'}).join('')+'</div>';
}
function listView(){
  return '<div class="thesis-page__task-list">'+readTasks().map(function(t){return '<button onclick="BAUMAN_THESIS_REF.openTask(\''+esc(t.id)+'\')"><i class="is-'+esc(t.tone)+'"></i><div><b>'+esc(t.title)+'</b><span>'+DAYS[t.day].label+' '+DAYS[t.day].short+' · '+esc(t.start+' – '+t.end)+'</span></div><em>›</em></button>'}).join('')+'</div>';
}
function plan(){
  var content=ui.view==='month'?monthView():ui.view==='gantt'?ganttView():ui.view==='list'?listView():weekView();
  return '<section class="thesis-page__plan">'+planToolbar()+'<div class="thesis-page__plan-body is-'+ui.view+'">'+content+'</div></section>';
}
function aiPanel(){
  return '<section class="thesis-page__panel thesis-page__ai"><div class="thesis-page__panel-head"><div><span class="thesis-page__spark">✦</span><b>Trợ lý luận văn AI</b><em>AI</em></div><button onclick="BAUMAN_THESIS_REF.setView(\'list\')">Xem thêm →</button></div>'+
  '<div class="thesis-page__ai-intro"><span>🤖</span><p>Tôi có thể hỗ trợ bạn trong quá trình thực hiện luận văn.<br>Dưới đây là một số gợi ý dành riêng cho bạn:</p></div>'+
  '<div class="thesis-page__ai-list">'+AI_ITEMS.map(function(x){var done=ui.aiDone.has(x.id);return '<button class="'+(done?'is-done':'')+'" onclick="BAUMAN_THESIS_REF.toggleAI(\''+x.id+'\')"><span class="thesis-page__check">'+(done?'✓':'')+'</span><i class="is-'+x.tone+'">'+x.icon+'</i><div><b>'+esc(x.title)+'</b><small>'+esc(x.desc)+'</small></div><em>›</em></button>'}).join('')+'</div></section>';
}
function miniCalendar(){
  var marks={6:'yellow',9:'blue',11:'blue',12:'yellow',13:'blue',19:'yellow',20:'blue',30:'orange'};
  var cells=Array.from({length:42},function(_,i){var d=i-4;return d<=0?{d:28+d,out:true}:{d:d>31?d-31:d,out:d>31}});
  return '<section class="thesis-page__panel thesis-page__mini-calendar"><div class="thesis-page__panel-head"><b>Tháng 3, 2025</b><div><button onclick="BAUMAN_THESIS_REF.setMonth(\'2025-02\')">‹</button><button onclick="BAUMAN_THESIS_REF.setMonth(\'2025-04\')">›</button></div></div><div class="thesis-page__mini-week">'+['T2','T3','T4','T5','T6','T7','CN'].map(function(x){return '<span>'+x+'</span>'}).join('')+'</div><div class="thesis-page__mini-grid">'+cells.map(function(x){return '<button class="'+(x.out?'is-outside ':'')+(x.d===13&&!x.out?'is-active':'')+'"><b>'+x.d+'</b>'+(marks[x.d]&&!x.out?'<i class="is-'+marks[x.d]+'"></i>':'')+'</button>'}).join('')+'</div></section>';
}
function milestones(){
  var list=ui.upcomingExpanded?MILESTONES:MILESTONES.slice(0,4);
  return '<section class="thesis-page__panel thesis-page__milestones"><div class="thesis-page__panel-head"><b>Mốc sắp tới</b><button onclick="BAUMAN_THESIS_REF.toggleUpcoming()">'+(ui.upcomingExpanded?'Thu gọn':'Xem tất cả →')+'</button></div><div class="thesis-page__milestone-list">'+list.map(function(x){return '<button onclick="BAUMAN_THESIS_REF.openMilestone(\''+x.id+'\')"><span class="thesis-page__milestone-icon is-'+x.tone+'">'+x.icon+'</span><div><b>'+esc(x.title)+'</b><small>'+esc(x.date)+'</small></div><em class="is-'+x.tone+'">'+esc(x.badge)+'</em></button>'}).join('')+'</div></section>';
}
function rightRail(){return '<aside class="thesis-page__right-rail">'+aiPanel()+'<div class="thesis-page__right-split">'+miniCalendar()+milestones()+'</div>'+notes()+'</aside>'}
function chapterProgress(){
  return '<section class="thesis-page__panel thesis-page__progress"><div class="thesis-page__panel-head"><b>Tiến độ theo chương</b><button onclick="BAUMAN_THESIS_REF.setView(\'list\')">Xem chi tiết →</button></div><div class="thesis-page__progress-list">'+CHAPTERS.map(function(c,i){return '<div><span><i class="is-'+c.tone+'">'+(i+1)+'</i>'+esc(c.title)+'</span><span class="thesis-page__progress-track"><i class="is-'+c.tone+'" style="--value:'+c.value+'%"></i></span><b>'+c.value+'%</b></div>'}).join('')+'</div></section>';
}
function heatmap(){
  return '<section class="thesis-page__panel thesis-page__heatmap"><div class="thesis-page__panel-head"><b>Cường độ nghiên cứu (giờ)</b></div><div class="thesis-page__heat-body"><div class="thesis-page__heat-grid"><span></span>'+['T2','T3','T4','T5','T6','T7','CN'].map(function(x){return '<b>'+x+'</b>'}).join('')+HEAT.map(function(row,ri){return '<span>Tuần '+(ri+1)+'</span>'+row.map(function(v){return '<i class="l'+v+'"></i>'}).join('')}).join('')+'</div><div class="thesis-page__heat-legend">'+['0 - 1 giờ','1 - 2 giờ','2 - 3 giờ','3 - 4 giờ','> 4 giờ'].map(function(x,i){return '<span><i class="l'+i+'"></i>'+x+'</span>'}).join('')+'</div></div></section>';
}
function notes(){
  var rows=readNotes();
  return '<section class="thesis-page__panel thesis-page__notes"><div class="thesis-page__panel-head"><b>Ghi chú & Nhắc việc</b><button onclick="BAUMAN_THESIS_REF.addNote()">＋ Thêm mới</button></div><div class="thesis-page__notes-grid">'+rows.map(function(n){return '<label class="'+(n.done?'is-done':'')+'"><input type="checkbox" '+(n.done?'checked':'')+' onchange="BAUMAN_THESIS_REF.toggleNote(\''+esc(n.id)+'\',this.checked)"><span><b>'+esc(n.text)+'</b><small>'+esc(n.date)+'</small></span></label>'}).join('')+'</div></section>';
}
function taskDetail(){
  if(!ui.detailId)return '';
  var t=readTasks().find(function(x){return x.id===ui.detailId});if(!t)return '';
  return '<div class="thesis-page__modal-backdrop" onclick="if(event.target===this)BAUMAN_THESIS_REF.closeTask()"><div class="thesis-page__modal"><div class="thesis-page__modal-head"><div><small>Nhiệm vụ luận văn</small><h3>'+esc(t.title)+'</h3></div><button onclick="BAUMAN_THESIS_REF.closeTask()">×</button></div><p>'+esc(t.detail||'Nhiệm vụ thuộc kế hoạch luận văn.')+'</p><div class="thesis-page__detail-grid"><span><small>Ngày</small><b>'+esc(DAYS[t.day]?.label+' '+DAYS[t.day]?.short)+'</b></span><span><small>Thời gian</small><b>'+esc(t.start+' – '+t.end)+'</b></span></div><div class="thesis-page__modal-actions"><button onclick="BAUMAN_THESIS_REF.closeTask()">Đóng</button></div></div></div>';
}
function createModal(){
  if(!ui.taskOpen)return '';
  return '<div class="thesis-page__modal-backdrop" onclick="if(event.target===this)BAUMAN_THESIS_REF.closeCreate()"><div class="thesis-page__modal"><div class="thesis-page__modal-head"><div><small>Kế hoạch luận văn</small><h3>Tạo nhiệm vụ</h3></div><button onclick="BAUMAN_THESIS_REF.closeCreate()">×</button></div><label>Tên nhiệm vụ<input id="thesisTaskTitle" placeholder="Ví dụ: Kiểm tra thang đo"></label><div class="thesis-page__form-grid"><label>Ngày<select id="thesisTaskDay">'+DAYS.map(function(d,i){return '<option value="'+i+'">'+d.label+' '+d.short+'</option>'}).join('')+'</select></label><label>Màu<select id="thesisTaskTone"><option value="blue">Xanh</option><option value="green">Xanh lá</option><option value="yellow">Vàng</option><option value="purple">Tím</option><option value="red">Đỏ</option></select></label><label>Bắt đầu<input id="thesisTaskStart" type="time" value="09:00"></label><label>Kết thúc<input id="thesisTaskEnd" type="time" value="10:30"></label></div><div class="thesis-page__modal-actions"><button onclick="BAUMAN_THESIS_REF.closeCreate()">Hủy</button><button class="is-primary" onclick="BAUMAN_THESIS_REF.createTask()">Tạo nhiệm vụ</button></div></div></div>';
}
function render(){
  var host=document.getElementById('page-research');if(!host)return false;
  host.innerHTML='<div class="thesis-page" data-thesis-reference="'+RELEASE+'">'+header()+summary()+'<section class="thesis-page__workspace"><div class="thesis-page__main-column">'+plan()+'<div class="thesis-page__left-bottom">'+chapterProgress()+heatmap()+'</div></div>'+rightRail()+'</section>'+taskDetail()+createModal()+'</div>';
  host.dataset.thesisReference='v1';
  document.body.dataset.hubPrimaryPage='research';
  return true;
}
function patch(){
  var a=appRef();if(!a||a.__thesisReferenceV1)return false;
  var previous=typeof a.research==='function'?a.research.bind(a):null;
  a.research=function(){return render()};
  a.__thesisReferenceV1={release:RELEASE,previousResearch:previous};
  if(typeof state!=='undefined'&&state&&state.page==='research')render();
  return true;
}
function selfCheck(){
  var h=document.getElementById('page-research');
  return {release:RELEASE,patched:!!(appRef()&&appRef().__thesisReferenceV1),active:!!(h&&h.querySelector('.thesis-page')),summaryCards:h?h.querySelectorAll('.thesis-page__summary-card').length:0,timelineEvents:h?h.querySelectorAll('.thesis-page__event').length:0,aiRows:h?h.querySelectorAll('.thesis-page__ai-list>button').length:0,rightRail:!!(h&&h.querySelector('.thesis-page__right-rail')),bottomPanels:h?h.querySelectorAll('.thesis-page__progress,.thesis-page__heatmap,.thesis-page__notes').length:0,touchesOnlyResearch:true};
}

window.BAUMAN_THESIS_REF={
  release:RELEASE,patch:patch,render:render,selfCheck:selfCheck,setView:setView,setMonth:setMonth,toggleFilter:toggleFilter,clearFilters:clearFilters,shiftWeek:shiftWeek,goToday:goToday,toggleAI:toggleAI,toggleUpcoming:toggleUpcoming,openTask:openTask,closeTask:closeTask,openCreate:openCreate,closeCreate:closeCreate,createTask:createTask,toggleNote:toggleNote,addNote:addNote,openMilestone:openMilestone
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patch,{once:true});else patch();
})();