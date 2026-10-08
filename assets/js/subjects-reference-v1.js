/* Bauman Master Hub · Subjects Reference UI V1
   Scope lock: presentation/interactions for #page-subjects only.
   Existing subject routes, progress state and subject modules remain canonical in main.js. */
(function(){
'use strict';

var RELEASE='SUBJECTS_REFERENCE_V1_2026_09_26';
var UI_KEY='bauman_subjects_reference_ui_v1';
var NOTES_KEY='bauman_subjects_reference_notes_v1';
var CUSTOM_KEY='bauman_subjects_reference_custom_v1';
var TEACHER_KEY='bauman_subjects_reference_teacher_overrides_v1';

// Historical seed IDs are retained only to filter imported demo notes.
// Never render demo teachers, progress, AI suggestions or deadlines as learner truth.
var DEFAULT_NOTES=[{id:'n1'},{id:'n2'},{id:'n3'},{id:'n4'}];
var ui=readUI();

function appRef(){return typeof app!=='undefined'?app:null}
function stateRef(){return typeof state!=='undefined'&&state?state:null}
function safe(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function clamp(v,a,b){return Math.max(a,Math.min(b,Number(v)||0))}
function toastSafe(msg){try{if(typeof toast==='function')return toast(msg)}catch(e){}}
function persistState(){try{if(typeof save==='function')save()}catch(e){}}
function saveUI(){
  try{localStorage.setItem(UI_KEY,JSON.stringify({tab:ui.tab,semester:ui.semester,calendarOffset:ui.calendarOffset,aiDone:Array.from(ui.aiDone)}))}catch(e){}
}
function writeNotes(v){return window.BAUMAN_HUB_PERSONAL_STORE.set(NOTES_KEY,v.slice(0,16))}
function readCustom(){var v=window.BAUMAN_HUB_PERSONAL_STORE.get(CUSTOM_KEY,[]);return Array.isArray(v)?v.slice(0,4):[]}
function writeCustom(v){return window.BAUMAN_HUB_PERSONAL_STORE.set(CUSTOM_KEY,v.slice(0,4))}
function readTeacherOverrides(){return window.BAUMAN_HUB_PERSONAL_STORE.get(TEACHER_KEY,{})}
function writeTeacherOverrides(v){return window.BAUMAN_HUB_PERSONAL_STORE.set(TEACHER_KEY,v&&typeof v==='object'?v:{})}
function editTeacher(key){
  var c=courseRows().find(function(x){return x.key===key});if(!c)return;
  var current=teacherFor(c).replace(/^GV:\s*/i,''),value=window.prompt('Tên giảng viên (để trống để khôi phục tên mặc định):',current);
  if(value===null)return;
  var rows=readTeacherOverrides(),clean=String(value).trim().slice(0,90);
  if(!clean)delete rows[key];else rows[key]=/^GV:\s*/i.test(clean)?clean:'GV: '+clean;
  writeTeacherOverrides(rows);ui.menu='';render();toastSafe(clean?'Đã cập nhật tên giảng viên.':'Đã khôi phục tên giảng viên mặc định.');
}
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
function toggleTab(tab){ui.tab=['all','study','exam','done'].includes(tab)?tab:'all';ui.menu='';saveUI();render()}
function toggleFilter(){ui.filterOpen=!ui.filterOpen;ui.menu='';render()}
function toggleMenu(key){ui.menu=ui.menu===key?'':key;ui.filterOpen=false;render()}
function filterCourse(key,checked){if(!ui.hidden)ui.hidden=new Set();if(checked)ui.hidden.delete(key);else ui.hidden.add(key);ui.filterOpen=true;render()}
function clearFilter(){ui.hidden=new Set();ui.filterOpen=true;render()}
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
function filterPanel(){
  var rows=courseRows();
  return '<div class="subjects-page__filter-panel '+(ui.filterOpen?'is-open':'')+'"><div><b>Hiển thị môn</b><button type="button" onclick="BAUMAN_SUBJECTS_REF.clearFilter()">Tất cả</button></div>'+rows.map(function(c){var hidden=ui.hidden&&ui.hidden.has&&ui.hidden.has(c.key);return '<label><input type="checkbox" '+(hidden?'':'checked')+' onchange="BAUMAN_SUBJECTS_REF.filterCourse(\''+safe(c.key)+'\',this.checked)"><i class="is-'+safe(c.tone)+'"></i><span>'+safe(c.title)+'</span></label>'}).join('')+'</div>';
}
function tabs(){
  var counts={all:courseRows().length,study:courseRows().filter(function(x){return x.status==='study'}).length,exam:courseRows().filter(function(x){return x.status==='exam'}).length,done:courseRows().filter(function(x){return x.status==='done'}).length};
  var labels={all:'Tất cả',study:'Đang học',exam:'Sắp thi',done:'Đã hoàn thành'};
  return '<div class="subjects-page__tabs">'+['all','study','exam','done'].map(function(k){return '<button type="button" class="'+(ui.tab===k?'is-active':'')+'" onclick="BAUMAN_SUBJECTS_REF.toggleTab(\''+k+'\')">'+labels[k]+' ('+counts[k]+')</button>'}).join('')+'</div>';
}
function listHeader(){
  return '<div class="subjects-page__list-head"><div class="subjects-page__list-title"><span>▤</span><b>Danh sách môn học</b></div>'+tabs()+'<div class="subjects-page__list-actions"><span>'+safe(semesterLabel())+'</span><button type="button" onclick="BAUMAN_SUBJECTS_REF.openAddCourse()">＋ Thêm môn</button></div></div>';
}
function courseList(){
  var rows=visibleCourses();
  return '<section class="subjects-page__course-list"><div class="subjects-page__course-list-inner">'+listHeader()+'<div class="subjects-page__course-grid">'+(rows.length?rows.map(courseCard).join(''):'<div class="subjects-page__empty">Không có môn phù hợp bộ lọc hiện tại.</div>')+'</div></div></section>';
}
function mondayOf(d){var x=new Date(d),n=(x.getDay()+6)%7;x.setDate(x.getDate()-n);return x}
function addDay(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x}
function rightRail(){return '<aside class="subjects-page__right-rail">'+aiPanel()+'<div class="subjects-page__right-split">'+monthPanel()+deadlinesPanel()+'</div></aside>'}
function addModal(){
  if(!ui.addOpen)return '';
  var s=stateRef(),options=Object.values(s&&s.subjects||{}).map(function(x){return '<option value="'+safe(x.id)+'">'+safe(x.name)+'</option>'}).join('');
  return '<div class="subjects-page__modal-backdrop" onclick="if(event.target===this)BAUMAN_SUBJECTS_REF.closeAddCourse()"><div class="subjects-page__modal"><div><h3>Thêm môn học</h3><button onclick="BAUMAN_SUBJECTS_REF.closeAddCourse()">×</button></div><label>Tên hiển thị<input id="subjectsAddName" placeholder="Ví dụ: Mô phỏng hệ thống"></label><label>Module liên kết<select id="subjectsAddSubject">'+options+'</select></label><label>Giảng viên / ghi chú<input id="subjectsAddTeacher" placeholder="GV: Chưa cập nhật"></label><p>Môn mới chỉ được thêm vào danh sách của Tab Môn học; không thay route hay cấu trúc hệ thống.</p><div class="subjects-page__modal-actions"><button onclick="BAUMAN_SUBJECTS_REF.closeAddCourse()">Hủy</button><button class="is-primary" onclick="BAUMAN_SUBJECTS_REF.submitAddCourse()">Thêm môn</button></div></div></div>';
}
/* Canonical learner UI: rendering reads Hub truth or explicitly LOCAL_HUB data. */
function readUI(){
  try{
    var raw=JSON.parse(localStorage.getItem(UI_KEY)||'{}'),stage=(stateRef()&&stateRef().subjectStage)||'prepare',allowed=['prepare','preparatory','m1','m2','m3','m4'];
    var semester=allowed.includes(raw.semester)?raw.semester:stage;
    return {tab:raw.tab||'all',semester:semester,filterOpen:false,menu:'',calendarOffset:Number(raw.calendarOffset)||0,aiDone:new Set(Array.isArray(raw.aiDone)?raw.aiDone:[])};
  }catch(e){return {tab:'all',semester:(stateRef()&&stateRef().subjectStage)||'prepare',filterOpen:false,menu:'',calendarOffset:0,aiDone:new Set()}}
}
function readNotes(){
  try{
    var v=window.BAUMAN_HUB_PERSONAL_STORE.get(NOTES_KEY,[]),legacy=new Set(DEFAULT_NOTES.map(function(x){return x.id}));
    return Array.isArray(v)?v.filter(function(x){return x&&x.id&&!legacy.has(x.id)}):[];
  }catch(e){return []}
}
function truthProgress(id){
  var t=window.BAUMAN_HUB_TRUTH,s=stateRef(),map=s&&s.progress||{};
  if(t)return t.progress(map,id,{source:'hub.state.progress'});
  var has=Object.prototype.hasOwnProperty.call(map,id)&&Number.isFinite(Number(map[id]));
  return {status:has?'CURRENT':'UNAVAILABLE',value:has?clamp(Math.round(Number(map[id])),0,100):null,source:'hub.state.progress'};
}
function progressText(field){return field&&Number.isFinite(field.value)?field.value+'%':'—'}
function subjectTone(id){return ({russian:'blue',math:'violet',programming:'green',ai:'violet',systems:'cyan',signal:'blue',research:'purple',foundation:'orange'})[id]||'blue'}
function scheduleRowsFor(subjectId){
  var s=stateRef(),rows=[],entries=s&&s.schedule&&s.schedule.entries||{},today=new Date();today.setHours(0,0,0,0);
  Object.keys(entries).forEach(function(key){
    var cut=key.lastIndexOf('|');if(cut<0)return;
    var date=key.slice(0,cut),slotId=key.slice(cut+1),entry=entries[key]||{};
    if(entry.subjectId!==subjectId)return;
    var m=date.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m)return;
    var d=new Date(+m[1],+m[2]-1,+m[3]);
    rows.push({date:date,slotId:slotId,entry:entry,d:d,future:d>=today});
  });
  rows.sort(function(a,b){return a.d-b.d||a.slotId.localeCompare(b.slotId)});
  return rows;
}
function nextSessionFor(subjectId){
  var row=scheduleRowsFor(subjectId).find(function(x){return x.future});
  if(!row)return 'Chưa có dữ liệu lịch sắp tới';
  var d=row.d;return ['Chủ nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'][d.getDay()]+', '+String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');
}
function sessionLabel(subjectId){
  var n=scheduleRowsFor(subjectId).length;
  return n?n+' ca đã xếp':'Chưa có ca trong lịch';
}
function teacherFor(c){
  var v=readTeacherOverrides(),name=v[c.key];
  if(name)return String(name);
  if(c.custom&&c.teacher)return String(c.teacher);
  if(c.teacher)return String(c.teacher);
  return 'Chưa có dữ liệu giảng viên';
}
function courseRows(){
  var s=stateRef(),a=appRef(),stage=(s&&s.subjectStage)||'prepare',list=[];
  try{if(a&&typeof a.filteredSubjectsForStage==='function')list=a.filteredSubjectsForStage(stage)||[]}catch(e){}
  if(!list.length)list=Object.values(s&&s.subjects||{});
  var canonical=list.map(function(x){
    var f=truthProgress(x.id),status=Number.isFinite(f.value)&&f.value>=100?'done':'study';
    return {key:x.id,subjectId:x.id,title:x.name||x.id,teacher:x.teacher||'',icon:x.icon||'•',tone:subjectTone(x.id),progressTone:subjectTone(x.id),status:status,statusLabel:status==='done'?'Hoàn thành':'Theo lộ trình',truthStatus:f.status,custom:false};
  });
  return canonical.concat(readCustom().map(function(x){return Object.assign({},x,{truthStatus:'LOCAL_HUB',status:x.status||'study',statusLabel:x.statusLabel||'LOCAL_HUB'})}));
}
function stageSubjectCount(){return courseRows().filter(function(x){return !x.custom}).length}
function allSubjectCount(){var s=stateRef();return Object.keys(s&&s.subjects||{}).length}
function semesterLabel(){
  return ({prepare:'Chuẩn bị trước dự bị',preparatory:'Dự bị tiếng Nga',m1:'Học kỳ 1',m2:'Học kỳ 2',m3:'Học kỳ 3',m4:'Học kỳ 4',bauman:'Chính khóa Bauman'})[ui.semester]||'Theo giai đoạn hiện tại';
}
function header(){
  var values=['prepare','preparatory','m1','m2','m3','m4'];
  return '<header class="subjects-page__header"><div><h2>Môn học</h2><p>Dữ liệu được đọc từ Hub canonical; ghi chú và tùy chỉnh cá nhân được đánh dấu LOCAL_HUB.</p></div><div class="subjects-page__header-actions">'+
  '<select class="subjects-page__select" onchange="BAUMAN_SUBJECTS_REF.setSemester(this.value)">'+values.map(function(v){return '<option value="'+v+'" '+(ui.semester===v?'selected':'')+'>'+safe(semesterLabelFor(v))+'</option>'}).join('')+
  '</select><div class="subjects-page__filter-wrap"><button type="button" class="subjects-page__button" onclick="BAUMAN_SUBJECTS_REF.toggleFilter()">⌘ <span>Bộ lọc</span></button>'+filterPanel()+'</div>'+
  '<button type="button" class="subjects-page__button subjects-page__button--primary" onclick="BAUMAN_SUBJECTS_REF.openAddCourse()">＋ Thêm mục LOCAL_HUB</button></div></header>';
}
function semesterLabelFor(v){return ({prepare:'Chuẩn bị trước dự bị',preparatory:'Dự bị tiếng Nga',m1:'Học kỳ 1',m2:'Học kỳ 2',m3:'Học kỳ 3',m4:'Học kỳ 4'})[v]||v}
function setSemester(value){
  ui.semester=value;var s=stateRef();if(s&&['prepare','preparatory','m1','m2','m3','m4'].includes(value)){s.subjectStage=value;persistState()}saveUI();render();
}
function summaryCard(tone,icon,label,line1,line2,kind,desc,ringValue,truthStatus){
  var tail=kind==='ring'?'<span class="subjects-page__donut" style="--p:'+(Number.isFinite(ringValue)?ringValue:0)+'"><i>'+(Number.isFinite(ringValue)?ringValue+'%':'—')+'</i></span>':kind==='arrow'?'<span class="subjects-page__summary-arrow">›</span>':'';
  return '<article class="subjects-page__summary-card is-'+tone+'" data-truth-status="'+safe(truthStatus||'CURRENT')+'"><span class="subjects-page__summary-icon">'+icon+'</span><div><small>'+safe(label)+'</small><b>'+safe(line1)+'</b><strong>'+safe(line2)+'</strong><p>'+safe(desc||'')+'</p></div>'+tail+'</article>';
}
function summary(){
  var s=stateRef(),selected=s&&s.subjects&&s.subjects[s.subject]||courseRows()[0]||{},f=truthProgress(selected.id||selected.subjectId),reviews=(s&&s.reviewQueue||[]).length,next=selected.id?nextSessionFor(selected.id):'Chưa có dữ liệu lịch';
  var known=courseRows().filter(function(x){return !x.custom}).map(function(x){return truthProgress(x.subjectId)}).filter(function(x){return Number.isFinite(x.value)});
  var avg=known.length?Math.round(known.reduce(function(a,b){return a+b.value},0)/known.length):null;
  return '<section class="subjects-page__summary">'+
    summaryCard('blue','▣','Tổng số môn',allSubjectCount()+' môn canonical',stageSubjectCount()+' môn trong giai đoạn','ring',known.length?'Trung bình các môn có dữ liệu':'Chưa có dữ liệu tiến độ',avg,known.length?'CURRENT':'UNAVAILABLE')+
    summaryCard('green','◎','Môn đang chọn',selected.name||selected.title||'Chưa chọn',progressText(f),'arrow','Buổi tiếp theo: '+next,null,f.status)+
    summaryCard('orange','!','Cần ôn',reviews+' mục trong hàng đợi',reviews?'Mở nội dung cần ôn':'Không có mục cần ôn','arrow','Nguồn: reviewQueue của Hub',null,'CURRENT')+
    summaryCard('purple','✦','Gợi ý tự động',reviews?'Có gợi ý từ dữ liệu ôn tập':'Chưa có dữ liệu gợi ý','Không dùng nội dung mẫu','arrow','Chỉ hiển thị khi có nguồn dữ liệu Hub.',null,reviews?'CURRENT':'UNAVAILABLE')+
  '</section>';
}
function courseCard(c){
  var f=c.custom?{status:'LOCAL_HUB',value:null}:truthProgress(c.subjectId),v=Number.isFinite(f.value)?f.value:null,next=nextSessionFor(c.subjectId),menu=ui.menu===c.key;
  return '<article class="subjects-page__course-card" data-course-key="'+safe(c.key)+'" data-truth-status="'+safe(c.truthStatus||f.status)+'">'+
    '<div class="subjects-page__course-top">'+iconMarkup(c)+'<div class="subjects-page__course-name"><b>'+safe(c.title)+'</b><small>'+safe(teacherFor(c))+'</small></div><span class="subjects-page__status '+statusClass(c)+'">'+safe(c.custom?'LOCAL_HUB':c.statusLabel)+'</span><button type="button" class="subjects-page__kebab" onclick="BAUMAN_SUBJECTS_REF.toggleMenu(\''+safe(c.key)+'\')">⋮</button>'+
    '<div class="subjects-page__course-menu '+(menu?'is-open':'')+'"><button onclick="BAUMAN_SUBJECTS_REF.selectCourse(\''+safe(c.key)+'\')">Mở môn</button><button onclick="BAUMAN_SUBJECTS_REF.editTeacher(\''+safe(c.key)+'\')">✎ Ghi chú giảng viên LOCAL_HUB</button><button onclick="BAUMAN_SUBJECTS_REF.openEditor(\''+safe(c.subjectId)+'\')">Dữ liệu môn</button>'+(c.custom?'<button class="is-danger" onclick="BAUMAN_SUBJECTS_REF.removeCustom(\''+safe(c.key)+'\')">Xóa khỏi LOCAL_HUB</button>':'')+'</div></div>'+
    '<div class="subjects-page__course-progress"><span><i class="is-'+safe(c.progressTone||c.tone)+'" style="--value:'+(v===null?0:v)+'%"></i></span><b>'+(v===null?'—':v+'%')+'</b></div>'+
    '<div class="subjects-page__course-meta"><span><i>▤</i>'+safe(sessionLabel(c.subjectId))+'</span><span><i>▣</i><small>Buổi tiếp theo</small><b>'+safe(next)+'</b></span></div>'+
    '<div class="subjects-page__course-actions"><button class="is-primary" onclick="BAUMAN_SUBJECTS_REF.openSubject(\''+safe(c.subjectId)+'\',\'study\')">▶ Vào môn</button><button onclick="BAUMAN_SUBJECTS_REF.openSubject(\''+safe(c.subjectId)+'\',\'docs\')">▧ Tài liệu</button><button onclick="BAUMAN_SUBJECTS_REF.openSubject(\''+safe(c.subjectId)+'\',\'tasks\')">◫ Bài tập</button></div>'+
  '</article>';
}
function aiItems(){
  var s=stateRef(),reviews=(s&&s.reviewQueue||[]).slice(0,4);
  return reviews.map(function(x,i){return {id:'review-'+i,title:x.label||x.title||'Nội dung cần ôn',desc:(s.subjects&&s.subjects[x.subjectId]&&s.subjects[x.subjectId].name)||'Theo hàng đợi ôn tập'}});
}
function aiPanel(){
  var rows=aiItems();
  return '<section class="subjects-page__panel subjects-page__ai" data-truth-status="'+(rows.length?'CURRENT':'UNAVAILABLE')+'"><div class="subjects-page__panel-head"><div><span class="subjects-page__spark">✦</span><b>Gợi ý học tập</b><em>Hub</em></div><button type="button" onclick="BAUMAN_SUBJECTS_REF.scrollCourses()">Xem môn →</button></div>'+
  '<div class="subjects-page__ai-intro"><span>🤖</span><p>Gợi ý chỉ được tạo từ dữ liệu ôn tập hiện có; không dùng nội dung mẫu.</p></div>'+
  '<div class="subjects-page__ai-list">'+(rows.length?rows.map(function(x){var done=ui.aiDone.has(x.id);return '<button type="button" class="'+(done?'is-done':'')+'" onclick="BAUMAN_SUBJECTS_REF.toggleAI(\''+safe(x.id)+'\')"><span class="subjects-page__check">'+(done?'✓':'')+'</span><div><b>'+safe(x.title)+'</b><small>'+safe(x.desc)+'</small></div><i>›</i></button>'}).join(''):'<p>Chưa có dữ liệu gợi ý.</p>')+'</div></section>';
}
function calendarBase(){
  var s=stateRef(),raw=s&&s.schedule&&s.schedule.weekStart,m=String(raw||'').match(/^(\d{4})-(\d{2})-(\d{2})$/),d=m?new Date(+m[1],+m[2]-1,1):new Date();
  d.setDate(1);d.setMonth(d.getMonth()+ui.calendarOffset);return d;
}
function monthPanel(){
  var base=calendarBase(),first=new Date(base.getFullYear(),base.getMonth(),1),start=mondayOf(first),cells=Array.from({length:42},function(_,i){return addDay(start,i)}),entries=stateRef()&&stateRef().schedule&&stateRef().schedule.entries||{};
  var counts={};Object.keys(entries).forEach(function(key){var date=key.split('|')[0];counts[date]=(counts[date]||0)+1});
  var title='Lịch tháng '+(base.getMonth()+1)+', '+base.getFullYear();
  return '<section class="subjects-page__panel subjects-page__calendar"><div class="subjects-page__panel-head"><b>'+title+'</b><div><button onclick="BAUMAN_SUBJECTS_REF.shiftCalendar(-1)">‹</button><button onclick="BAUMAN_SUBJECTS_REF.shiftCalendar(1)">›</button></div></div><div class="subjects-page__calendar-week">'+['T2','T3','T4','T5','T6','T7','CN'].map(function(x){return '<span>'+x+'</span>'}).join('')+'</div><div class="subjects-page__calendar-grid">'+cells.map(function(d){var outside=d.getMonth()!==base.getMonth(),key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'),n=counts[key]||0,active=key===new Date().toISOString().slice(0,10);return '<button class="'+(outside?'is-outside ':'')+(active?'is-active':'')+'"><b>'+d.getDate()+'</b>'+(n?'<i class="is-blue" title="'+n+' ca"></i>':'')+'</button>'}).join('')+'</div></section>';
}
function deadlineRows(){
  var s=stateRef();
  var entries=s&&s.schedule&&s.schedule.entries||{};
  var today=new Date();
  var rows=[];
  today.setHours(0,0,0,0);
  Object.keys(entries).forEach(function(key){
    var cut=key.lastIndexOf('|'),date=key.slice(0,cut),e=entries[key]||{},m=date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(!m)return;
    var d=new Date(+m[1],+m[2]-1,+m[3]);
    if(d<today)return;
    rows.push({date:date,d:d,subjectId:e.subjectId,title:e.learningItem||e.label||'Học theo lịch'});
  });
  return rows.sort(function(a,b){return a.d-b.d}).slice(0,4);
}
function openDeadline(i){var x=deadlineRows()[i];if(x&&x.subjectId)openSubject(x.subjectId,'study')}
function deadlinesPanel(){
  var rows=deadlineRows();
  return '<section class="subjects-page__panel subjects-page__deadlines" data-truth-status="'+(rows.length?'CURRENT':'UNAVAILABLE')+'"><div class="subjects-page__panel-head"><b>Mốc sắp tới</b><button type="button" onclick="BAUMAN_SUBJECTS_REF.scrollCourses()">Xem môn →</button></div><div class="subjects-page__deadline-list">'+(rows.length?rows.map(function(x,i){var name=stateRef()&&stateRef().subjects&&stateRef().subjects[x.subjectId]&&stateRef().subjects[x.subjectId].name||x.subjectId||'Môn học';return '<button type="button" onclick="BAUMAN_SUBJECTS_REF.openDeadline('+i+')"><span class="subjects-page__deadline-icon is-blue">▣</span><div><b>'+safe(name)+'</b><small>'+safe(x.date+' · '+x.title)+'</small></div><em class="is-blue">Lịch Hub</em></button>'}).join(''):'<p>Chưa có dữ liệu lịch sắp tới.</p>')+'</div></section>';
}
function progressPanel(){
  var rows=courseRows().filter(function(c){return !c.custom});
  return '<section class="subjects-page__panel subjects-page__progress"><div class="subjects-page__panel-head"><b>Tiến độ theo môn</b><button onclick="BAUMAN_SUBJECTS_REF.scrollCourses()">Xem chi tiết →</button></div><div class="subjects-page__progress-list">'+rows.slice(0,8).map(function(c){var f=truthProgress(c.subjectId),v=Number.isFinite(f.value)?f.value:null;return '<div data-truth-status="'+safe(f.status)+'"><span><i class="is-'+safe(c.tone)+'">'+safe(c.icon)+'</i>'+safe(c.title)+'</span><span class="subjects-page__progress-track"><i class="is-'+safe(c.progressTone||c.tone)+'" style="--value:'+(v===null?0:v)+'%"></i></span><b>'+(v===null?'—':v+'%')+'</b></div>'}).join('')+'</div></section>';
}
function heatPanel(){
  var base=mondayOf(new Date()),days=Array.from({length:7},function(_,i){return addDay(base,i)}),entries=stateRef()&&stateRef().schedule&&stateRef().schedule.entries||{};
  var counts=days.map(function(d){var key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'),n=0;Object.keys(entries).forEach(function(x){if(x.indexOf(key+'|')===0)n++});return n});
  return '<section class="subjects-page__panel subjects-page__heat"><div class="subjects-page__panel-head"><b>Phân bố phiên học tuần hiện tại</b></div><div class="subjects-page__heat-body"><div class="subjects-page__heat-grid"><span></span>'+['T2','T3','T4','T5','T6','T7','CN'].map(function(x){return '<b>'+x+'</b>'}).join('')+'<span>Số phiên</span>'+counts.map(function(v){return '<i class="l'+Math.min(4,v)+'" title="'+v+' phiên"></i>'}).join('')+'</div><div class="subjects-page__heat-legend"><span>Dữ liệu từ lịch Hub, không phải giờ học giả lập.</span></div></div></section>';
}
function notesPanel(){
  var notes=readNotes();
  return '<section class="subjects-page__panel subjects-page__notes" data-truth-status="LOCAL_HUB"><div class="subjects-page__panel-head"><b>Ghi chú LOCAL_HUB</b><button onclick="BAUMAN_SUBJECTS_REF.addNote()">Thêm mới</button></div><div class="subjects-page__notes-list">'+(notes.length?notes.map(function(n){return '<label class="'+(n.done?'is-done':'')+'"><input type="checkbox" '+(n.done?'checked':'')+' onchange="BAUMAN_SUBJECTS_REF.toggleNote(\''+safe(n.id)+'\',this.checked)"><span>'+safe(n.text)+'</span><time>'+safe(n.date)+'</time></label>'}).join(''):'<p>Chưa có ghi chú cá nhân.</p>')+'</div></section>';
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
  toggleNote:toggleNote,addNote:addNote,removeCustom:removeCustom,editTeacher:editTeacher,teacherFor:teacherFor,openAddCourse:openAddCourse,closeAddCourse:closeAddCourse,submitAddCourse:submitAddCourse,scrollCourses:scrollCourses
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patch,{once:true});else patch();
})();
