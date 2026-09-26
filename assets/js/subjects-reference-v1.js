/* Bauman Master Hub · Subjects Reference UI V1
   Scope lock: presentation/interactions for #page-subjects only.
   Existing subject routes, progress state and subject modules remain canonical in main.js. */
(function(){
'use strict';

var RELEASE='SUBJECTS_REFERENCE_V1_2026_09_26';
var UI_KEY='bauman_subjects_reference_ui_v1';
var NOTES_KEY='bauman_subjects_reference_notes_v1';
var CUSTOM_KEY='bauman_subjects_reference_custom_v1';

var COURSE_REF=[
  {key:'russian',subjectId:'russian',title:'Tiếng Nga',teacher:'GV: TS. Trần Thị Mai',icon:'Я',tone:'blue',progressTone:'green',status:'study',statusLabel:'Đang học',fallbackProgress:70,sessions:'14/20 buổi',next:'Thứ 5, 13/03, 09:00 – 10:30'},
  {key:'advanced-math',subjectId:'math',title:'Toán cao cấp',teacher:'GV: PGS. Lê Minh Hoàng',icon:'∑',tone:'violet',progressTone:'violet',status:'study',statusLabel:'Đang học',fallbackProgress:55,sessions:'11/20 buổi',next:'Thứ 4, 12/03, 13:30 – 15:00'},
  {key:'python',subjectId:'programming',title:'Lập trình Python',teacher:'GV: TS. Nguyễn Quốc Bảo',icon:'Py',tone:'green',progressTone:'green',status:'study',statusLabel:'Đang học',fallbackProgress:80,sessions:'16/20 buổi',next:'Thứ 6, 14/03, 09:00 – 11:00'},
  {key:'probability',subjectId:'math',title:'Xác suất thống kê',teacher:'GV: PGS. Đặng Thùy Linh',icon:'▥',tone:'orange',progressTone:'orange',status:'exam',statusLabel:'Sắp thi',fallbackProgress:45,sessions:'9/20 buổi',next:'Thứ 3, 11/03, 15:30 – 17:00'},
  {key:'database',subjectId:'programming',title:'Cơ sở dữ liệu',teacher:'GV: ThS. Phạm Trung Hiếu',icon:'DB',tone:'cyan',progressTone:'blue',status:'study',statusLabel:'Đang học',fallbackProgress:65,sessions:'13/20 buổi',next:'Thứ 5, 13/03, 13:30 – 15:00'},
  {key:'listen-speak',subjectId:'russian',title:'Nghe - Nói',teacher:'GV: TS. Vũ Thị Lan Anh',icon:'◉',tone:'rose',progressTone:'rose',status:'done',statusLabel:'Ôn tập',fallbackProgress:90,sessions:'18/20 buổi',next:'Thứ 2, 10/03, 10:00 – 11:30'}
];

var AI_ITEMS=[
  {id:'ru',checked:true,title:'Ưu tiên ôn Tiếng Nga trong 3 phiên tới',desc:'Bạn sắp có bài kiểm tra giữa kỳ. Tập trung ôn từ vựng và ngữ pháp.'},
  {id:'db',checked:true,title:'Hoàn thành bài tập CSDL trước thứ 6',desc:'Còn 3 ngày. Bài tập chương 4 và 5 đang chờ nộp.'},
  {id:'math',checked:false,title:'Ôn lại xác suất trước buổi kiểm tra',desc:'Xem lại các dạng bài quan trọng và làm thêm đề mẫu.'},
  {id:'python',checked:false,title:'Xem lại tài liệu Python và ghi chú',desc:'Tập trung vào chương 6 - Xử lý dữ liệu với Pandas.'}
];

var DEADLINES=[
  {subjectId:'programming',tone:'orange',title:'Nộp bài tập Cơ sở dữ liệu',date:'Hạn nộp: 14/03/2025',badge:'Còn 3 ngày'},
  {subjectId:'russian',tone:'rose',title:'Quiz Tiếng Nga',date:'Thứ 5, 13/03/2025',badge:'Còn 2 ngày'},
  {subjectId:'programming',tone:'blue',title:'Thuyết trình Python',date:'Thứ 6, 14/03/2025',badge:'Còn 3 ngày'},
  {subjectId:'math',tone:'orange',title:'Ôn tập Xác suất thống kê',date:'Thứ 3, 18/03/2025',badge:'Còn 7 ngày'}
];

var DEFAULT_NOTES=[
  {id:'n1',text:'Đọc chương 5 - Cơ sở dữ liệu',date:'10/03/2025',done:true},
  {id:'n2',text:'Làm đề ôn tập Xác suất thống kê',date:'12/03/2025',done:true},
  {id:'n3',text:'Xem video bài giảng Python (chương 6)',date:'14/03/2025',done:false},
  {id:'n4',text:'Chuẩn bị thuyết trình nhóm',date:'18/03/2025',done:false}
];

var ui=readUI();

function appRef(){return typeof app!=='undefined'?app:null}
function stateRef(){return typeof state!=='undefined'&&state?state:null}
function safe(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function clamp(v,a,b){return Math.max(a,Math.min(b,Number(v)||0))}
function toastSafe(msg){try{if(typeof toast==='function')return toast(msg)}catch(e){}}
function persistState(){try{if(typeof save==='function')save()}catch(e){}}
function readUI(){
  try{
    var raw=JSON.parse(localStorage.getItem(UI_KEY)||'{}');
    return {tab:raw.tab||'all',semester:raw.semester||'ref-2025-s2',filterOpen:false,menu:'',calendarOffset:Number(raw.calendarOffset)||0,aiDone:new Set(Array.isArray(raw.aiDone)?raw.aiDone:AI_ITEMS.filter(function(x){return x.checked}).map(function(x){return x.id}))};
  }catch(e){return {tab:'all',semester:'ref-2025-s2',filterOpen:false,menu:'',calendarOffset:0,aiDone:new Set(['ru','db'])}}
}
function saveUI(){
  try{localStorage.setItem(UI_KEY,JSON.stringify({tab:ui.tab,semester:ui.semester,calendarOffset:ui.calendarOffset,aiDone:Array.from(ui.aiDone)}))}catch(e){}
}
function readNotes(){try{var v=JSON.parse(localStorage.getItem(NOTES_KEY)||'null');return Array.isArray(v)?v:DEFAULT_NOTES.map(function(x){return Object.assign({},x)});}catch(e){return DEFAULT_NOTES.map(function(x){return Object.assign({},x)})}}
function writeNotes(v){try{localStorage.setItem(NOTES_KEY,JSON.stringify(v.slice(0,16)))}catch(e){}}
function readCustom(){try{var v=JSON.parse(localStorage.getItem(CUSTOM_KEY)||'[]');return Array.isArray(v)?v.slice(0,4):[]}catch(e){return []}}
function writeCustom(v){try{localStorage.setItem(CUSTOM_KEY,JSON.stringify(v.slice(0,4)))}catch(e){}}
function subjectProgress(id,fallback){var s=stateRef();var raw=s&&s.progress?s.progress[id]:0;return raw>0?clamp(Math.round(raw),0,100):fallback}
function courseProgress(c){return subjectProgress(c.subjectId,c.fallbackProgress)}
function stageSubjectCount(){var s=stateRef(),a=appRef();try{if(a&&typeof a.filteredSubjectsForStage==='function')return a.filteredSubjectsForStage(s&&s.subjectStage||'prepare').length}catch(e){}return 5}
function allSubjectCount(){var s=stateRef();return Object.keys(s&&s.subjects||{}).length||8}
function courseRows(){return COURSE_REF.concat(readCustom())}
function visibleCourses(){
  return courseRows().filter(function(c){
    if(ui.tab!=='all'&&c.status!==ui.tab)return false;
    if(ui.hidden&&ui.hidden.has&&ui.hidden.has(c.key))return false;
    return true;
  });
}
function iconMarkup(c){return '<span class="subjects-page__course-icon is-'+safe(c.tone||'blue')+'">'+safe(c.icon||'•')+'</span>'}
function statusClass(c){return c.status==='exam'?'is-exam':c.status==='done'?'is-review':'is-study'}
function openSubject(id,mode){
  var a=appRef();if(!a||typeof a.openSubjectInPage!=='function')return toastSafe('Môn học chưa sẵn sàng.');
  var label=mode==='docs'?'Mở tài liệu':mode==='tasks'?'Làm bài tập':'Học theo kế hoạch';
  try{return a.openSubjectInPage(id,{learningItem:label})}catch(e){toastSafe('Không mở được môn học.')}
}
function openEditor(id){var a=appRef();try{if(a&&typeof a.openSubjectEditor==='function')return a.openSubjectEditor(id)}catch(e){}toastSafe('Khu dữ liệu môn chưa sẵn sàng.')}
function openDeadline(i){var x=DEADLINES[i];if(x)openSubject(x.subjectId,'tasks')}
function toggleTab(tab){ui.tab=['all','study','exam','done'].includes(tab)?tab:'all';ui.menu='';saveUI();render()}
function toggleFilter(){ui.filterOpen=!ui.filterOpen;ui.menu='';render()}
function toggleMenu(key){ui.menu=ui.menu===key?'':key;ui.filterOpen=false;render()}
function filterCourse(key,checked){if(!ui.hidden)ui.hidden=new Set();if(checked)ui.hidden.delete(key);else ui.hidden.add(key);ui.filterOpen=true;render()}
function clearFilter(){ui.hidden=new Set();ui.filterOpen=true;render()}
function setSemester(value){ui.semester=value;saveUI();render()}
function toggleAI(id){if(ui.aiDone.has(id))ui.aiDone.delete(id);else ui.aiDone.add(id);saveUI();render()}
function shiftCalendar(delta){ui.calendarOffset+=Number(delta)||0;saveUI();render()}
function toggleNote(id,done){var notes=readNotes(),n=notes.find(function(x){return x.id===id});if(n)n.done=!!done;writeNotes(notes);render()}
function addNote(){var text=window.prompt('Nhập ghi chú / nhắc việc:');if(!text||!text.trim())return;var date=window.prompt('Ngày hoặc mô tả thời gian:','Hôm nay')||'Hôm nay';var notes=readNotes();notes.push({id:'n'+Date.now(),text:text.trim().slice(0,140),date:date.trim().slice(0,40),done:false});writeNotes(notes);render()}
function removeCustom(key){var rows=readCustom().filter(function(x){return x.key!==key});writeCustom(rows);ui.menu='';render()}
function openAddCourse(){ui.addOpen=true;ui.menu='';ui.filterOpen=false;render()}
function closeAddCourse(){ui.addOpen=false;render()}
function submitAddCourse(){
  var root=document.getElementById('page-subjects'),name=root&&root.querySelector('#subjectsAddName'),subject=root&&root.querySelector('#subjectsAddSubject'),teacher=root&&root.querySelector('#subjectsAddTeacher');
  if(!name||!name.value.trim())return toastSafe('Hãy nhập tên môn học.');
  var rows=readCustom(),key='custom-'+Date.now(),sid=subject&&subject.value||'foundation';
  rows.push({key:key,subjectId:sid,title:name.value.trim().slice(0,60),teacher:(teacher&&teacher.value.trim())||'GV: Chưa cập nhật',icon:'＋',tone:'blue',progressTone:'blue',status:'study',statusLabel:'Đang học',fallbackProgress:0,sessions:'0/20 buổi',next:'Chưa có lịch',custom:true});
  writeCustom(rows);ui.addOpen=false;render();toastSafe('Đã thêm môn vào danh sách tham chiếu.');
}
function selectCourse(key){var c=courseRows().find(function(x){return x.key===key});if(c){var s=stateRef();if(s){s.subject=c.subjectId;persistState()}openSubject(c.subjectId,'study')}}
function nextSessionFor(subjectId,fallback){
  var s=stateRef();if(!s||!s.schedule||!s.schedule.entries)return fallback;
  var today=new Date();today.setHours(0,0,0,0);var rows=[];
  Object.keys(s.schedule.entries).forEach(function(key){
    var cut=key.lastIndexOf('|');if(cut<0)return;var date=key.slice(0,cut),entry=s.schedule.entries[key];if(!entry||entry.subjectId!==subjectId)return;
    var m=date.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m)return;var d=new Date(+m[1],+m[2]-1,+m[3]);if(d<today)return;
    rows.push({date:date,d:d});
  });
  rows.sort(function(a,b){return a.d-b.d});
  if(!rows.length)return fallback;
  var d=rows[0].d;return ['Chủ nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'][d.getDay()]+', '+String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');
}
function semesterLabel(){
  return ({'ref-2025-s2':'Học kỳ 2, 2025','prepare':'Chuẩn bị','preparatory':'Dự bị','m1':'Học kỳ 1','m2':'Học kỳ 2','m3':'Học kỳ 3','m4':'Học kỳ 4'})[ui.semester]||'Học kỳ 2, 2025';
}
function header(){
  return '<header class="subjects-page__header"><div><h2>Môn học</h2><p>Quản lý môn học, theo dõi tiến độ, tài liệu, bài tập và kế hoạch học tập một cách trực quan.</p></div><div class="subjects-page__header-actions">'+
  '<select class="subjects-page__select" onchange="BAUMAN_SUBJECTS_REF.setSemester(this.value)">'+
  ['ref-2025-s2','prepare','preparatory','m1','m2','m3','m4'].map(function(v){return '<option value="'+v+'" '+(ui.semester===v?'selected':'')+'>'+safe(({ 'ref-2025-s2':'Học kỳ 2, 2025',prepare:'Chuẩn bị trước dự bị',preparatory:'Dự bị tiếng Nga',m1:'Học kỳ 1',m2:'Học kỳ 2',m3:'Học kỳ 3',m4:'Học kỳ 4'})[v])+'</option>'}).join('')+
  '</select><div class="subjects-page__filter-wrap"><button type="button" class="subjects-page__button" onclick="BAUMAN_SUBJECTS_REF.toggleFilter()">⌘ <span>Bộ lọc</span></button>'+filterPanel()+'</div>'+
  '<button type="button" class="subjects-page__button subjects-page__button--primary" onclick="BAUMAN_SUBJECTS_REF.openAddCourse()">＋ Thêm môn học</button></div></header>';
}
function filterPanel(){
  var rows=courseRows();
  return '<div class="subjects-page__filter-panel '+(ui.filterOpen?'is-open':'')+'"><div><b>Hiển thị môn</b><button type="button" onclick="BAUMAN_SUBJECTS_REF.clearFilter()">Tất cả</button></div>'+rows.map(function(c){var hidden=ui.hidden&&ui.hidden.has&&ui.hidden.has(c.key);return '<label><input type="checkbox" '+(hidden?'':'checked')+' onchange="BAUMAN_SUBJECTS_REF.filterCourse(\''+safe(c.key)+'\',this.checked)"><i class="is-'+safe(c.tone)+'"></i><span>'+safe(c.title)+'</span></label>'}).join('')+'</div>';
}
function summary(){
  return '<section class="subjects-page__summary">'+
  summaryCard('blue','▣','Tổng số môn',allSubjectCount()+' môn đang quản lý',stageSubjectCount()+' môn đang học trong học kỳ này','ring','63%')+
  summaryCard('green','◎','Môn nổi bật tuần này','Tiếng Nga','Tiến độ '+courseProgress(COURSE_REF[0])+'%','arrow','Buổi học tiếp theo: '+nextSessionFor('russian','Thứ 5, 13/03'))+
  summaryCard('orange','!','Việc cần chú ý','3 bài tập sắp hạn','2 buổi ôn tập','arrow','Đừng quên hoàn thành đúng hạn!')+
  summaryCard('purple','✦','Gợi ý từ AI','4 gợi ý hữu ích','Tối ưu kế hoạch học tập của bạn','arrow','dựa trên tiến độ hiện tại.')+
  '</section>';
}
function summaryCard(tone,icon,label,line1,line2,kind,desc){
  var tail=kind==='ring'?'<span class="subjects-page__donut" style="--p:63"><i>63%</i></span>':kind==='arrow'?'<span class="subjects-page__summary-arrow">›</span>':'';
  return '<article class="subjects-page__summary-card is-'+tone+'"><span class="subjects-page__summary-icon">'+icon+'</span><div><small>'+safe(label)+'</small><b>'+safe(line1)+'</b><strong>'+safe(line2)+'</strong><p>'+safe(desc||'')+'</p></div>'+tail+'</article>';
}
function tabs(){
  var counts={all:courseRows().length,study:courseRows().filter(function(x){return x.status==='study'}).length,exam:courseRows().filter(function(x){return x.status==='exam'}).length,done:courseRows().filter(function(x){return x.status==='done'}).length};
  var labels={all:'Tất cả',study:'Đang học',exam:'Sắp thi',done:'Đã hoàn thành'};
  return '<div class="subjects-page__tabs">'+['all','study','exam','done'].map(function(k){return '<button type="button" class="'+(ui.tab===k?'is-active':'')+'" onclick="BAUMAN_SUBJECTS_REF.toggleTab(\''+k+'\')">'+labels[k]+' ('+counts[k]+')</button>'}).join('')+'</div>';
}
function listHeader(){
  return '<div class="subjects-page__list-head"><div class="subjects-page__list-title"><span>▤</span><b>Danh sách môn học</b></div>'+tabs()+'<div class="subjects-page__list-actions"><span>'+safe(semesterLabel())+'</span><button type="button" onclick="BAUMAN_SUBJECTS_REF.openAddCourse()">＋ Thêm môn</button></div></div>';
}
function courseCard(c){
  var p=courseProgress(c),next=nextSessionFor(c.subjectId,c.next),menu=ui.menu===c.key;
  return '<article class="subjects-page__course-card" data-course-key="'+safe(c.key)+'">'+
    '<div class="subjects-page__course-top">'+iconMarkup(c)+'<div class="subjects-page__course-name"><b>'+safe(c.title)+'</b><small>'+safe(c.teacher)+'</small></div><span class="subjects-page__status '+statusClass(c)+'">'+safe(c.statusLabel)+'</span><button type="button" class="subjects-page__kebab" onclick="BAUMAN_SUBJECTS_REF.toggleMenu(\''+safe(c.key)+'\')">⋮</button>'+
    '<div class="subjects-page__course-menu '+(menu?'is-open':'')+'"><button onclick="BAUMAN_SUBJECTS_REF.selectCourse(\''+safe(c.key)+'\')">Mở môn</button><button onclick="BAUMAN_SUBJECTS_REF.openEditor(\''+safe(c.subjectId)+'\')">Dữ liệu môn</button>'+(c.custom?'<button class="is-danger" onclick="BAUMAN_SUBJECTS_REF.removeCustom(\''+safe(c.key)+'\')">Xóa khỏi danh sách</button>':'')+'</div></div>'+
    '<div class="subjects-page__course-progress"><span><i class="is-'+safe(c.progressTone)+'" style="--value:'+p+'%"></i></span><b>'+p+'%</b></div>'+
    '<div class="subjects-page__course-meta"><span><i>▤</i>'+safe(c.sessions)+'</span><span><i>▣</i><small>Buổi tiếp theo</small><b>'+safe(next)+'</b></span></div>'+
    '<div class="subjects-page__course-actions"><button class="is-primary" onclick="BAUMAN_SUBJECTS_REF.openSubject(\''+safe(c.subjectId)+'\',\'study\')">▶ Vào môn</button><button onclick="BAUMAN_SUBJECTS_REF.openSubject(\''+safe(c.subjectId)+'\',\'docs\')">▧ Tài liệu</button><button onclick="BAUMAN_SUBJECTS_REF.openSubject(\''+safe(c.subjectId)+'\',\'tasks\')">◫ Bài tập</button></div>'+
  '</article>';
}
function courseList(){
  var rows=visibleCourses();
  return '<section class="subjects-page__course-list"><div class="subjects-page__course-list-inner">'+listHeader()+'<div class="subjects-page__course-grid">'+(rows.length?rows.map(courseCard).join(''):'<div class="subjects-page__empty">Không có môn phù hợp bộ lọc hiện tại.</div>')+'</div></div></section>';
}
function aiPanel(){
  return '<section class="subjects-page__panel subjects-page__ai"><div class="subjects-page__panel-head"><div><span class="subjects-page__spark">✦</span><b>Trợ lý học tập AI</b><em>AI</em></div><button type="button" onclick="BAUMAN_SUBJECTS_REF.scrollCourses()">Xem thêm →</button></div>'+
  '<div class="subjects-page__ai-intro"><span>🤖</span><p>Tôi có thể hỗ trợ bạn trong quá trình học tập các môn học.<br>Dưới đây là một số gợi ý dựa trên tiến độ hiện tại của bạn:</p></div>'+
  '<div class="subjects-page__ai-list">'+AI_ITEMS.map(function(x){var done=ui.aiDone.has(x.id);return '<button type="button" class="'+(done?'is-done':'')+'" onclick="BAUMAN_SUBJECTS_REF.toggleAI(\''+x.id+'\')"><span class="subjects-page__check">'+(done?'✓':'')+'</span><div><b>'+safe(x.title)+'</b><small>'+safe(x.desc)+'</small></div><i>›</i></button>'}).join('')+'</div></section>';
}
function calendarBase(){var d=new Date(2025,2,1);d.setMonth(d.getMonth()+ui.calendarOffset);return d}
function mondayOf(d){var x=new Date(d),n=(x.getDay()+6)%7;x.setDate(x.getDate()-n);return x}
function addDay(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x}
function monthPanel(){
  var base=calendarBase(),first=new Date(base.getFullYear(),base.getMonth(),1),start=mondayOf(first),cells=Array.from({length:42},function(_,i){return addDay(start,i)}),markers={6:'rose',9:'orange',11:'blue',14:'blue',18:'orange',20:'green',21:'green'};
  var title='Lịch tháng '+(base.getMonth()+1)+', '+base.getFullYear();
  return '<section class="subjects-page__panel subjects-page__calendar"><div class="subjects-page__panel-head"><b>'+title+'</b><div><button onclick="BAUMAN_SUBJECTS_REF.shiftCalendar(-1)">‹</button><button onclick="BAUMAN_SUBJECTS_REF.shiftCalendar(1)">›</button></div></div><div class="subjects-page__calendar-week">'+['T2','T3','T4','T5','T6','T7','CN'].map(function(x){return '<span>'+x+'</span>'}).join('')+'</div><div class="subjects-page__calendar-grid">'+cells.map(function(d){var outside=d.getMonth()!==base.getMonth(),day=d.getDate(),active=!outside&&day===10,mark=!outside&&markers[day];return '<button class="'+(outside?'is-outside ':'')+(active?'is-active':'')+'"><b>'+day+'</b>'+(mark?'<i class="is-'+mark+'"></i>':'')+'</button>'}).join('')+'</div></section>';
}
function deadlinesPanel(){
  return '<section class="subjects-page__panel subjects-page__deadlines"><div class="subjects-page__panel-head"><b>Mốc sắp tới</b><button type="button" onclick="BAUMAN_SUBJECTS_REF.scrollCourses()">Xem tất cả →</button></div><div class="subjects-page__deadline-list">'+DEADLINES.map(function(x,i){return '<button type="button" onclick="BAUMAN_SUBJECTS_REF.openDeadline('+i+')"><span class="subjects-page__deadline-icon is-'+x.tone+'">'+(x.tone==='orange'?'▤':x.tone==='rose'?'?':'▣')+'</span><div><b>'+safe(x.title)+'</b><small>'+safe(x.date)+'</small></div><em class="is-'+x.tone+'">'+safe(x.badge)+'</em></button>'}).join('')+'</div></section>';
}
function rightRail(){return '<aside class="subjects-page__right-rail">'+aiPanel()+'<div class="subjects-page__right-split">'+monthPanel()+deadlinesPanel()+'</div></aside>'}
function progressPanel(){
  return '<section class="subjects-page__panel subjects-page__progress"><div class="subjects-page__panel-head"><b>Tiến độ theo môn</b><button onclick="BAUMAN_SUBJECTS_REF.scrollCourses()">Xem chi tiết →</button></div><div class="subjects-page__progress-list">'+COURSE_REF.map(function(c){var p=courseProgress(c);return '<div><span><i class="is-'+c.tone+'">'+safe(c.icon)+'</i>'+safe(c.title)+'</span><span class="subjects-page__progress-track"><i class="is-'+c.progressTone+'" style="--value:'+p+'%"></i></span><b>'+p+'%</b></div>'}).join('')+'</div></section>';
}
function heatPanel(){
  var values=[[1,2,2,3,2,1,0],[1,2,3,3,2,1,1],[2,3,4,2,4,2,2]];
  return '<section class="subjects-page__panel subjects-page__heat"><div class="subjects-page__panel-head"><b>Cường độ học tập (giờ)</b></div><div class="subjects-page__heat-body"><div class="subjects-page__heat-grid"><span></span>'+['T2','T3','T4','T5','T6','T7','CN'].map(function(x){return '<b>'+x+'</b>'}).join('')+['Sáng (6-12h)','Chiều (12-18h)','Tối (18-24h)'].map(function(label,r){return '<span>'+label+'</span>'+values[r].map(function(v){return '<i class="l'+v+'"></i>'}).join('')}).join('')+'</div><div class="subjects-page__heat-legend">'+['0 - 1 giờ','1 - 2 giờ','2 - 3 giờ','3 - 4 giờ','> 4 giờ'].map(function(x,i){return '<span><i class="l'+i+'"></i>'+x+'</span>'}).join('')+'</div></div></section>';
}
function notesPanel(){
  var notes=readNotes();
  return '<section class="subjects-page__panel subjects-page__notes"><div class="subjects-page__panel-head"><b>Ghi chú & Nhắc việc</b><button onclick="BAUMAN_SUBJECTS_REF.addNote()">Thêm mới</button></div><div class="subjects-page__notes-list">'+notes.map(function(n){return '<label class="'+(n.done?'is-done':'')+'"><input type="checkbox" '+(n.done?'checked':'')+' onchange="BAUMAN_SUBJECTS_REF.toggleNote(\''+safe(n.id)+'\',this.checked)"><span>'+safe(n.text)+'</span><time>'+safe(n.date)+'</time></label>'}).join('')+'</div></section>';
}
function addModal(){
  if(!ui.addOpen)return '';
  var s=stateRef(),options=Object.values(s&&s.subjects||{}).map(function(x){return '<option value="'+safe(x.id)+'">'+safe(x.name)+'</option>'}).join('');
  return '<div class="subjects-page__modal-backdrop" onclick="if(event.target===this)BAUMAN_SUBJECTS_REF.closeAddCourse()"><div class="subjects-page__modal"><div><h3>Thêm môn học</h3><button onclick="BAUMAN_SUBJECTS_REF.closeAddCourse()">×</button></div><label>Tên hiển thị<input id="subjectsAddName" placeholder="Ví dụ: Mô phỏng hệ thống"></label><label>Module liên kết<select id="subjectsAddSubject">'+options+'</select></label><label>Giảng viên / ghi chú<input id="subjectsAddTeacher" placeholder="GV: Chưa cập nhật"></label><p>Môn mới chỉ được thêm vào danh sách của Tab Môn học; không thay route hay cấu trúc hệ thống.</p><div class="subjects-page__modal-actions"><button onclick="BAUMAN_SUBJECTS_REF.closeAddCourse()">Hủy</button><button class="is-primary" onclick="BAUMAN_SUBJECTS_REF.submitAddCourse()">Thêm môn</button></div></div></div>';
}
function render(){
  var host=document.getElementById('page-subjects');if(!host)return false;
  if(!ui.hidden)ui.hidden=new Set();
  host.innerHTML='<div class="subjects-page" data-subjects-reference="'+RELEASE+'">'+header()+summary()+'<section class="subjects-page__workspace"><div class="subjects-page__main-column">'+courseList()+'</div>'+rightRail()+'</section><section class="subjects-page__footer">'+progressPanel()+heatPanel()+notesPanel()+'</section>'+addModal()+'</div>';
  host.dataset.subjectsReference='v1';document.body.dataset.hubPrimaryPage='subjects';return true;
}
function rerender(){render()}
function scrollCourses(){var h=document.getElementById('page-subjects'),x=h&&h.querySelector('.subjects-page__course-list');if(x)x.scrollIntoView({behavior:'smooth',block:'start'})}
function patch(){
  var a=appRef();if(!a||a.__subjectsReferenceV1)return false;
  var previous=typeof a.subjects==='function'?a.subjects.bind(a):null;
  a.subjects=function(){return render()};
  a.__subjectsReferenceV1={release:RELEASE,previousSubjects:previous};
  if(stateRef()&&stateRef().page==='subjects')render();
  return true;
}
function selfCheck(){
  var h=document.getElementById('page-subjects');
  return {release:RELEASE,patched:!!(appRef()&&appRef().__subjectsReferenceV1),active:!!(h&&h.querySelector('.subjects-page')),summaryCards:h?h.querySelectorAll('.subjects-page__summary-card').length:0,courseCards:h?h.querySelectorAll('.subjects-page__course-card').length:0,rightRail:!!(h&&h.querySelector('.subjects-page__right-rail')),footerPanels:h?h.querySelectorAll('.subjects-page__footer>.subjects-page__panel').length:0,touchesOnlySubjects:true};
}

window.BAUMAN_SUBJECTS_REF={
  release:RELEASE,patch:patch,render:render,selfCheck:selfCheck,
  toggleTab:toggleTab,toggleFilter:toggleFilter,toggleMenu:toggleMenu,filterCourse:filterCourse,clearFilter:clearFilter,setSemester:setSemester,
  openSubject:openSubject,openEditor:openEditor,selectCourse:selectCourse,openDeadline:openDeadline,toggleAI:toggleAI,shiftCalendar:shiftCalendar,
  toggleNote:toggleNote,addNote:addNote,removeCustom:removeCustom,openAddCourse:openAddCourse,closeAddCourse:closeAddCourse,submitAddCourse:submitAddCourse,scrollCourses:scrollCourses
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patch,{once:true});else patch();
})();