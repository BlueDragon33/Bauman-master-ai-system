/* Bauman Master Hub · Schedule Reference UI V1
   Scope lock: presentation/interactions for #page-schedule only.
   Canonical state and scheduling semantics remain owned by main.js. */
(function(){
'use strict';
var RELEASE='SCHEDULE_REFERENCE_V1_2026_09_26';
var VIEW_KEY='bauman_schedule_reference_view_v1';
var NOTE_KEY='bauman_schedule_reference_notes_v1';
var ui={view:readView(),selectedDate:'',filterOpen:false,hidden:new Set(),accepted:new Set()};

function appRef(){return typeof app!=='undefined'?app:null}
function scheduleState(){return typeof state!=='undefined'&&state&&state.schedule?state.schedule:null}
function subjects(){return typeof state!=='undefined'&&state&&state.subjects?state.subjects:{}}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function pad(n){return String(n).padStart(2,'0')}
function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function parse(v){var m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})/);return m?new Date(+m[1],+m[2]-1,+m[3]):new Date()}
function add(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x}
function monday(d){var x=new Date(d),delta=(x.getDay()+6)%7;x.setHours(0,0,0,0);x.setDate(x.getDate()-delta);return x}
function weekStart(){var sc=scheduleState();return monday(parse(sc&&sc.weekStart?sc.weekStart:iso(new Date())))}
function weekDays(){var s=weekStart(),a=[];for(var i=0;i<7;i++)a.push(add(s,i));return a}
function fmt(d){return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()}
function short(d){return pad(d.getDate())+'/'+pad(d.getMonth()+1)}
function dayName(d){return ['Chủ nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'][d.getDay()]}
function monthLabel(d){return 'Tháng '+(d.getMonth()+1)+', '+d.getFullYear()}
function tone(id){return ({russian:'rose',math:'blue',programming:'violet',ai:'cyan',systems:'amber',signal:'green',research:'pink',foundation:'slate'})[id]||'slate'}
function subjectName(id){var s=subjects()[id];return s&&s.name?s.name:(id||'Môn học')}
function allSlots(){var a=[];try{if(typeof MAIN_SLOTS!=='undefined')a=a.concat(MAIN_SLOTS)}catch(e){}try{if(typeof REVIEW_SLOTS!=='undefined')a=a.concat(REVIEW_SLOTS)}catch(e){}return a}
function slotById(id){return allSlots().find(function(x){return x.id===id})||null}
function clock(v){var m=String(v||'').match(/(\d{1,2}):(\d{2})/);return m?(+m[1]*60+ +m[2]):360}
function slotWindow(slot){var m=String(slot&&slot.time||'').match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);return m?[clock(m[1]),clock(m[2])]:[360,450]}
function eligibleSlots(d){
  var dow=d.getDay();
  try{
    if(dow===0&&typeof REVIEW_SLOTS!=='undefined')return REVIEW_SLOTS.slice(0,1);
    if(dow===6&&typeof REVIEW_SLOTS!=='undefined')return REVIEW_SLOTS;
    if(typeof MAIN_SLOTS!=='undefined')return MAIN_SLOTS;
  }catch(e){}
  return [];
}
function entriesForDate(d){
  var sc=scheduleState();if(!sc)return [];
  var prefix=iso(d)+'|',out=[];
  Object.keys(sc.entries||{}).forEach(function(key){
    if(key.indexOf(prefix)!==0)return;
    var slotId=key.slice(prefix.length),slot=slotById(slotId);
    if(!slot)return;
    var entry=sc.entries[key]||{};
    if(ui.hidden.has(entry.subjectId))return;
    out.push({key:key,date:iso(d),dt:new Date(d),slotId:slotId,slot:slot,entry:entry});
  });
  out.sort(function(a,b){return slotWindow(a.slot)[0]-slotWindow(b.slot)[0]});
  return out;
}
function allRecords(){
  var sc=scheduleState();if(!sc)return [];
  var out=[];
  Object.keys(sc.entries||{}).forEach(function(key){
    var cut=key.lastIndexOf('|');if(cut<0)return;
    var date=key.slice(0,cut),slotId=key.slice(cut+1),slot=slotById(slotId);
    if(!slot)return;
    var entry=sc.entries[key]||{};if(ui.hidden.has(entry.subjectId))return;
    out.push({key:key,date:date,dt:parse(date),slotId:slotId,slot:slot,entry:entry});
  });
  out.sort(function(a,b){return a.dt-b.dt||slotWindow(a.slot)[0]-slotWindow(b.slot)[0]});
  return out;
}
function duration(slot){var w=slotWindow(slot);return Math.max(0,(w[1]-w[0])/60)}
function weekRecords(){var d=weekDays(),out=[];d.forEach(function(x){out=out.concat(entriesForDate(x))});return out}
function stats(records){
  var hrs=0,ids={};records.forEach(function(x){hrs+=duration(x.slot);if(x.entry.subjectId)ids[x.entry.subjectId]=1});
  return {sessions:records.length,hours:hrs,subjects:Object.keys(ids).length};
}
function progress(){
  try{return appRef()&&typeof appRef().scheduleProgress==='function'?appRef().scheduleProgress():{pct:0,filled:0,total:0}}catch(e){return {pct:0,filled:0,total:0}}
}
function readView(){try{var v=localStorage.getItem(VIEW_KEY);return ['day','week','month'].indexOf(v)>=0?v:'week'}catch(e){return 'week'}}
function saveView(){try{localStorage.setItem(VIEW_KEY,ui.view)}catch(e){}}
function readNotes(){try{var v=JSON.parse(localStorage.getItem(NOTE_KEY)||'[]');return Array.isArray(v)?v.slice(0,16):[]}catch(e){return []}}
function writeNotes(v){try{localStorage.setItem(NOTE_KEY,JSON.stringify(v.slice(0,16)))}catch(e){}}
function saveState(){try{if(typeof save==='function')save()}catch(e){}}
function toastSafe(msg){try{if(typeof toast==='function')toast(msg)}catch(e){}}

function filterPanel(){
  var list=Object.values(subjects());
  return '<div class="schedule-ref__filter-panel '+(ui.filterOpen?'is-open':'')+'"><div class="schedule-ref__filter-head"><b>Hiển thị môn</b><button type="button" onclick="BAUMAN_SCHEDULE_REF.clearFilters()">Tất cả</button></div>'+
    list.map(function(s){return '<label><input type="checkbox" '+(ui.hidden.has(s.id)?'':'checked')+' onchange="BAUMAN_SCHEDULE_REF.filterSubject(\''+esc(s.id)+'\',this.checked)"><i class="schedule-ref__dot is-'+tone(s.id)+'"></i><span>'+esc(s.name)+'</span></label>'}).join('')+
    '</div>';
}
function header(){
  var s=weekStart(),e=add(s,6);
  return '<header class="schedule-ref__header"><div><h2>Lịch học</h2><p>Theo dõi kế hoạch học tập, lịch học, nhắc việc và gợi ý tự động.</p></div><div class="schedule-ref__header-actions">'+
    '<button class="schedule-ref__range" type="button" onclick="BAUMAN_SCHEDULE_REF.today()">▣ <b>'+fmt(s)+' – '+fmt(e)+'</b>⌄</button>'+
    '<div class="schedule-ref__filter-wrap"><button class="schedule-ref__btn" type="button" onclick="BAUMAN_SCHEDULE_REF.toggleFilter()">⌘ <span>Bộ lọc</span></button>'+filterPanel()+'</div>'+
    '<button class="schedule-ref__btn schedule-ref__btn--primary" type="button" onclick="BAUMAN_SCHEDULE_REF.openPlan()">＋ <span>Tạo kế hoạch</span></button>'+
    '</div></header>';
}
function suggestions(){
  var wr=weekRecords(),count={};wr.forEach(function(x){count[x.entry.subjectId]=(count[x.entry.subjectId]||0)+1});
  var vals=Object.values(subjects()),out=[];
  if(subjects().russian)out.push({id:'ru',title:'Ưu tiên ôn Tiếng Nga vào buổi sáng',desc:'Tuần đang xem có '+(count.russian||0)+' ca Tiếng Nga; ca sáng phù hợp với học thuộc và nghe – nói.'});
  if(subjects().math)out.push({id:'math',title:'Giữ các phiên Toán tập trung',desc:'Tuần đang xem có '+(count.math||0)+' ca Toán; nên giữ các block kỹ thuật liền mạch.'});
  var least=vals.slice().sort(function(a,b){return (count[a.id]||0)-(count[b.id]||0)})[0];
  if(least)out.push({id:'balance-'+least.id,title:'Cân bằng thêm môn '+least.name,desc:least.name+' đang có '+(count[least.id]||0)+' ca trong tuần đang xem.'});
  return out.slice(0,3);
}
function summary(){
  var today=stats(entriesForDate(new Date())),week=stats(weekRecords()),p=progress(),sug=suggestions(),attention=Math.max(0,(p.total||0)-(p.filled||0));
  return '<section class="schedule-ref__summary">'+
    card('blue','▣','Hôm nay',today.sessions+' phiên học',today.hours.toFixed(1)+' giờ','Hoàn thành '+(p.pct||0)+'% lịch giai đoạn','ring',p.pct||0)+
    card('green','▥','Tuần này',week.sessions+' buổi học',week.hours.toFixed(1)+' giờ','Theo tuần đang hiển thị','bars',0)+
    card('orange','!','Công việc cần chú ý',attention+' ca còn trống',Math.max(0,week.sessions-week.subjects)+' ca lặp','Mở cài đặt để cân đối lại','link',0)+
    card('purple','✦','Gợi ý tự động',sug.length+' gợi ý mới','Theo '+week.subjects+' môn','Dựa trên lịch và tiến độ hiện có','chev',0)+
    '</section>';
}
function card(kind,ico,label,big,strong,desc,extra,p){
  var tail='';
  if(extra==='ring')tail='<span class="schedule-ref__ring" style="--p:'+Math.max(0,Math.min(100,p))+'"><i>'+Math.round(p)+'%</i></span>';
  if(extra==='bars')tail='<span class="schedule-ref__bars"><i></i><i></i><i></i><i></i></span>';
  if(extra==='link')tail='<button type="button" onclick="BAUMAN_SCHEDULE_REF.openPlan()">Xem chi tiết →</button>';
  if(extra==='chev')tail='<button class="schedule-ref__chev" type="button" onclick="BAUMAN_SCHEDULE_REF.scrollSuggestions()">›</button>';
  return '<article class="schedule-ref__summary-card is-'+kind+'"><span class="schedule-ref__summary-icon">'+ico+'</span><div><small>'+esc(label)+'</small><b>'+esc(big)+'</b><strong>'+esc(strong)+'</strong><p>'+esc(desc)+'</p>'+tail+'</div></article>';
}
function toolbar(){
  var s=weekStart(),e=add(s,6),sc=scheduleState();
  return '<div class="schedule-ref__calendar-toolbar"><div class="schedule-ref__week-nav"><button type="button" onclick="BAUMAN_SCHEDULE_REF.changeWeek(-1)">‹</button><button type="button" onclick="BAUMAN_SCHEDULE_REF.changeWeek(1)">›</button><b>Tuần '+short(s)+' – '+fmt(e)+'</b></div>'+
    '<div class="schedule-ref__calendar-tools"><div class="schedule-ref__segments">'+['day','week','month'].map(function(v){return '<button type="button" class="'+(ui.view===v?'is-active':'')+'" onclick="BAUMAN_SCHEDULE_REF.setView(\''+v+'\')">'+(v==='day'?'Ngày':v==='week'?'Tuần':'Tháng')+'</button>'}).join('')+'</div>'+
    '<button class="schedule-ref__today-btn '+(sc&&sc.edit?'is-editing':'')+'" type="button" onclick="BAUMAN_SCHEDULE_REF.toggleManual()">'+(sc&&sc.edit?'✓ Xong':'✎ Chỉnh lịch')+'</button>'+
    '<button class="schedule-ref__today-btn" type="button" onclick="BAUMAN_SCHEDULE_REF.today()">＋ Hôm nay</button></div></div>';
}
function eventCard(r,d){
  var w=slotWindow(r.slot),top=((w[0]-360)/720*100),h=Math.max(5,(w[1]-w[0])/720*100);
  return '<button type="button" class="schedule-ref__event is-'+tone(r.entry.subjectId)+'" style="--top:'+top+'%;--height:'+h+'%" onclick="BAUMAN_SCHEDULE_REF.openSlot(\''+iso(d)+'\',\''+esc(r.slotId)+'\')" title="'+esc(r.entry.learningItem||r.entry.label||'Học theo lịch')+'"><b>'+esc(subjectName(r.entry.subjectId))+'</b><span>'+esc(r.slot.time)+'</span><small>'+esc(r.entry.learningItem||r.entry.label||'Học theo lịch')+'</small></button>';
}
function emptySlots(d){
  var sc=scheduleState();if(!sc||!sc.edit)return '';
  var existing=new Set(entriesForDate(d).map(function(x){return x.slotId}));
  return eligibleSlots(d).filter(function(s){return !existing.has(s.id)}).map(function(s){var w=slotWindow(s),top=((w[0]-360)/720*100),h=Math.max(5,(w[1]-w[0])/720*100);return '<button class="schedule-ref__empty-slot" style="--top:'+top+'%;--height:'+h+'%" type="button" onclick="BAUMAN_SCHEDULE_REF.openSlot(\''+iso(d)+'\',\''+esc(s.id)+'\')">＋</button>'}).join('');
}
function weekView(){
  var ds=weekDays(),hours=[];for(var h=6;h<=18;h++)hours.push(h);
  return '<div class="schedule-ref__week-calendar"><div class="schedule-ref__day-heads"><span></span>'+ds.map(function(d){return '<button type="button" class="'+(iso(d)===iso(new Date())?'is-today':'')+'" onclick="BAUMAN_SCHEDULE_REF.selectDay(\''+iso(d)+'\')"><b>'+dayName(d)+'</b><small>'+short(d)+'</small></button>'}).join('')+'</div>'+
    '<div class="schedule-ref__timeline"><div class="schedule-ref__time-axis">'+hours.map(function(h,i){return '<span style="--y:'+(i/(hours.length-1)*100)+'%">'+pad(h)+':00</span>'}).join('')+'</div>'+
    ds.map(function(d){return '<div class="schedule-ref__day-col '+(iso(d)===iso(new Date())?'is-today':'')+'">'+hours.map(function(h,i){return '<i class="schedule-ref__hour-line" style="--y:'+(i/(hours.length-1)*100)+'%"></i>'}).join('')+entriesForDate(d).map(function(r){return eventCard(r,d)}).join('')+emptySlots(d)+'</div>'}).join('')+
    '</div></div>';
}
function dayView(){
  var d=parse(ui.selectedDate||iso(weekStart())),existing=new Map(entriesForDate(d).map(function(x){return [x.slotId,x]})),slots=eligibleSlots(d);
  return '<div class="schedule-ref__day-view"><div class="schedule-ref__day-view-head"><div><small>'+dayName(d)+'</small><h3>'+fmt(d)+'</h3></div><button type="button" onclick="BAUMAN_SCHEDULE_REF.setView(\'week\')">Xem tuần</button></div><div class="schedule-ref__day-agenda">'+
  slots.map(function(s){var r=existing.get(s.id);return r?'<button type="button" class="schedule-ref__day-event is-'+tone(r.entry.subjectId)+'" onclick="BAUMAN_SCHEDULE_REF.openSlot(\''+iso(d)+'\',\''+esc(s.id)+'\')"><time>'+esc(s.time)+'</time><div><b>'+esc(subjectName(r.entry.subjectId))+'</b><span>'+esc(r.entry.learningItem||r.entry.label||'Học theo lịch')+'</span></div></button>':'<button type="button" class="schedule-ref__day-empty" onclick="BAUMAN_SCHEDULE_REF.openSlot(\''+iso(d)+'\',\''+esc(s.id)+'\')"><time>'+esc(s.time)+'</time><span>'+(scheduleState()&&scheduleState().edit?'＋ Gán ca học':'Chưa có lịch')+'</span></button>'}).join('')+
  '</div></div>';
}
function monthCells(base){var first=new Date(base.getFullYear(),base.getMonth(),1),start=monday(first),a=[];for(var i=0;i<42;i++)a.push(add(start,i));return a}
function monthView(){
  var base=parse(ui.selectedDate||iso(weekStart())),cells=monthCells(base);
  return '<div class="schedule-ref__month-view"><div class="schedule-ref__month-head"><button type="button" onclick="BAUMAN_SCHEDULE_REF.shiftMonth(-1)">‹</button><h3>'+monthLabel(base)+'</h3><button type="button" onclick="BAUMAN_SCHEDULE_REF.shiftMonth(1)">›</button></div><div class="schedule-ref__month-weekdays">'+['T2','T3','T4','T5','T6','T7','CN'].map(function(x){return '<span>'+x+'</span>'}).join('')+'</div><div class="schedule-ref__month-grid">'+cells.map(function(d){var n=entriesForDate(d).length;return '<button type="button" class="'+(d.getMonth()!==base.getMonth()?'is-outside ':'')+(iso(d)===iso(new Date())?'is-today':'')+'" onclick="BAUMAN_SCHEDULE_REF.selectDay(\''+iso(d)+'\')"><b>'+d.getDate()+'</b><span>'+(n?n+' phiên':'')+'</span></button>'}).join('')+'</div></div>';
}
function mobileAgenda(){
  if(ui.view!=='week')return '';
  var rows=[];weekDays().forEach(function(d){entriesForDate(d).forEach(function(r){rows.push({d:d,r:r})})});
  return '<div class="schedule-ref__mobile-agenda">'+(rows.length?rows.map(function(x){return '<button type="button" onclick="BAUMAN_SCHEDULE_REF.openSlot(\''+iso(x.d)+'\',\''+esc(x.r.slotId)+'\')"><time><b>'+dayName(x.d).replace('Thứ ','T')+'</b><span>'+short(x.d)+'</span></time><i class="schedule-ref__dot is-'+tone(x.r.entry.subjectId)+'"></i><div><b>'+esc(subjectName(x.r.entry.subjectId))+'</b><span>'+esc(x.r.slot.time)+' · '+esc(x.r.entry.learningItem||x.r.entry.label||'Học theo lịch')+'</span></div></button>'}).join(''):'<p>Tuần này chưa có phiên học.</p>')+'</div>';
}
function calendar(){
  var content=ui.view==='day'?dayView():ui.view==='month'?monthView():weekView();
  return '<section class="schedule-ref__calendar-card">'+toolbar()+'<div class="schedule-ref__calendar-body">'+content+'</div>'+mobileAgenda()+'</section>';
}
function suggestionsPanel(){
  return '<section class="schedule-ref__panel schedule-ref__ai" id="scheduleRefSuggestions"><div class="schedule-ref__panel-head"><div><span>✦</span><b>Lập kế hoạch tự động</b><em>AI</em></div><button type="button" onclick="BAUMAN_SCHEDULE_REF.openPlan()">Xem thêm →</button></div><div class="schedule-ref__ai-intro"><span>🤖</span><p>Dựa trên lịch học và tiến độ hiện tại, đây là các gợi ý cân bằng cho tuần đang xem.</p></div><div class="schedule-ref__suggestions">'+suggestions().map(function(s){var done=ui.accepted.has(s.id);return '<button type="button" class="'+(done?'is-done':'')+'" onclick="BAUMAN_SCHEDULE_REF.acceptSuggestion(\''+esc(s.id)+'\')"><span class="schedule-ref__check">'+(done?'✓':'')+'</span><i>✧</i><div><b>'+esc(s.title)+'</b><p>'+esc(s.desc)+'</p></div><span>›</span></button>'}).join('')+'</div></section>';
}
function miniCalendar(){
  var base=parse(ui.selectedDate||iso(weekStart())),cells=monthCells(base);
  return '<section class="schedule-ref__panel schedule-ref__mini-calendar"><div class="schedule-ref__panel-head"><b>'+monthLabel(base)+'</b><div><button type="button" onclick="BAUMAN_SCHEDULE_REF.shiftMonth(-1)">‹</button><button type="button" onclick="BAUMAN_SCHEDULE_REF.shiftMonth(1)">›</button></div></div><div class="schedule-ref__mini-weekdays">'+['T2','T3','T4','T5','T6','T7','CN'].map(function(x){return '<span>'+x+'</span>'}).join('')+'</div><div class="schedule-ref__mini-grid">'+cells.map(function(d){var n=entriesForDate(d).length;return '<button type="button" class="'+(d.getMonth()!==base.getMonth()?'is-outside ':'')+(iso(d)===iso(new Date())?'is-today':'')+'" onclick="BAUMAN_SCHEDULE_REF.selectDay(\''+iso(d)+'\')"><b>'+d.getDate()+'</b>'+(n?'<i class="l'+Math.min(4,n)+'"></i>':'')+'</button>'}).join('')+'</div></section>';
}
function upcoming(){
  var start=weekStart(),end=add(start,6),list=allRecords().filter(function(x){return x.dt>=start&&x.dt<=end}).slice(0,5);
  return '<section class="schedule-ref__panel schedule-ref__upcoming"><div class="schedule-ref__panel-head"><b>Sắp đến hạn</b><button type="button" onclick="BAUMAN_SCHEDULE_REF.today()">Xem tất cả →</button></div><div class="schedule-ref__upcoming-list">'+(list.length?list.map(function(x){return '<button type="button" onclick="BAUMAN_SCHEDULE_REF.openSlot(\''+esc(x.date)+'\',\''+esc(x.slotId)+'\')"><span class="schedule-ref__upcoming-icon is-'+tone(x.entry.subjectId)+'">▣</span><div><b>'+esc(subjectName(x.entry.subjectId))+'</b><small>'+esc(x.entry.learningItem||x.entry.label||'Học theo lịch')+'</small></div><em>'+short(x.dt)+'</em></button>'}).join(''):'<p>Không có phiên nào trong tuần đang xem.</p>')+'</div></section>';
}
function progressPanel(){
  var rows=Object.values(subjects()).map(function(s){var v=0;try{v=Math.max(0,Math.min(100,Math.round(Number(state.progress&&state.progress[s.id]||0))))}catch(e){}return {s:s,v:v}}).sort(function(a,b){return b.v-a.v}).slice(0,5);
  return '<section class="schedule-ref__panel schedule-ref__progress"><div class="schedule-ref__panel-head"><b>Tiến độ môn học</b><button type="button" onclick="BAUMAN_SCHEDULE_REF.scrollCalendar()">Xem lịch →</button></div><div class="schedule-ref__progress-list">'+rows.map(function(r){return '<div><span><i class="schedule-ref__dot is-'+tone(r.s.id)+'"></i>'+esc(r.s.name)+'</span><span class="schedule-ref__progress-track"><i class="is-'+tone(r.s.id)+'" style="--value:'+r.v+'%"></i></span><b>'+r.v+'%</b></div>'}).join('')+'</div></section>';
}
function heatmap(){
  var ds=weekDays(),periods=[['Sáng',6,11],['Trưa',11,13],['Chiều',13,18],['Tối',18,24]];
  function value(d,a,b){return entriesForDate(d).reduce(function(sum,x){var w=slotWindow(x.slot),o=Math.max(0,Math.min(w[1],b*60)-Math.max(w[0],a*60));return sum+o/60},0)}
  function level(v){return v<=0?0:v<1?1:v<2?2:v<3?3:4}
  return '<section class="schedule-ref__panel schedule-ref__heatmap"><div class="schedule-ref__panel-head"><b>Khối lượng học tập (giờ)</b></div><div class="schedule-ref__heat-grid"><span></span>'+ds.map(function(d){return '<b>'+dayName(d).replace('Thứ ','T').replace('Chủ nhật','CN')+'</b>'}).join('')+periods.map(function(p){return '<span>'+p[0]+'</span>'+ds.map(function(d){var v=value(d,p[1],p[2]);return '<i class="l'+level(v)+'" title="'+v.toFixed(1)+' giờ"></i>'}).join('')}).join('')+'</div><div class="schedule-ref__heat-legend"><span><i class="l0"></i>0</span><span><i class="l1"></i>&lt;1h</span><span><i class="l2"></i>1–2h</span><span><i class="l3"></i>2–3h</span><span><i class="l4"></i>&gt;3h</span></div></section>';
}
function notesPanel(){
  var notes=readNotes(),derived=weekRecords().slice(0,2);
  return '<section class="schedule-ref__panel schedule-ref__notes"><div class="schedule-ref__panel-head"><b>Ghi chú / Nhắc việc</b><button type="button" onclick="BAUMAN_SCHEDULE_REF.addNote()">＋ Thêm mới</button></div><div class="schedule-ref__notes-grid">'+
    notes.map(function(n){return '<label class="'+(n.done?'is-done':'')+'"><input type="checkbox" '+(n.done?'checked':'')+' onchange="BAUMAN_SCHEDULE_REF.toggleNote(\''+esc(n.id)+'\',this.checked)"><span><b>'+esc(n.text)+'</b><small>'+esc(n.when||'Ghi chú cá nhân')+'</small></span><button type="button" onclick="event.preventDefault();BAUMAN_SCHEDULE_REF.removeNote(\''+esc(n.id)+'\')">×</button></label>'}).join('')+
    derived.map(function(x){return '<label class="is-derived"><input type="checkbox" disabled><span><b>'+esc(subjectName(x.entry.subjectId))+': '+esc(x.entry.learningItem||x.entry.label||'Học theo lịch')+'</b><small>'+fmt(x.dt)+' · '+esc(x.slot.time)+'</small></span></label>'}).join('')+
    (!notes.length&&!derived.length?'<p>Chưa có ghi chú hoặc phiên học trong tuần.</p>':'')+'</div><blockquote>“Kỷ luật hôm nay, kết quả ngày mai.”</blockquote></section>';
}
function rightRail(){return '<aside class="schedule-ref__right-rail">'+suggestionsPanel()+'<div class="schedule-ref__right-split">'+miniCalendar()+upcoming()+'</div></aside>'}
function footer(){return '<section class="schedule-ref__footer-grid">'+progressPanel()+heatmap()+notesPanel()+'</section>'}

function render(){
  var host=document.getElementById('page-schedule');if(!host||!scheduleState())return false;
  if(!ui.selectedDate)ui.selectedDate=iso(weekStart());
  host.innerHTML='<div class="schedule-page schedule-ref-page" data-schedule-reference="'+RELEASE+'">'+header()+summary()+'<section class="schedule-ref__workspace"><div class="schedule-ref__main-column">'+calendar()+'</div>'+rightRail()+'</section>'+footer()+'</div>';
  host.dataset.scheduleReference='v1';
  document.body.dataset.hubPrimaryPage='schedule';
  return true;
}
function rerender(){render()}
function changeWeek(delta){var sc=scheduleState();if(!sc)return;sc.weekStart=iso(add(weekStart(),Number(delta||0)*7));ui.selectedDate=sc.weekStart;saveState();rerender()}
function today(){var sc=scheduleState();if(!sc)return;var now=new Date();sc.weekStart=iso(monday(now));ui.selectedDate=iso(now);ui.view='week';saveView();saveState();rerender()}
function setView(v){if(['day','week','month'].indexOf(v)<0)return;ui.view=v;saveView();rerender()}
function selectDay(v){ui.selectedDate=v;var sc=scheduleState();if(sc){sc.weekStart=iso(monday(parse(v)));saveState()}ui.view='day';saveView();rerender()}
function shiftMonth(delta){var d=parse(ui.selectedDate||iso(weekStart()));d.setDate(1);d.setMonth(d.getMonth()+Number(delta||0));ui.selectedDate=iso(d);rerender()}
function toggleFilter(){ui.filterOpen=!ui.filterOpen;rerender()}
function clearFilters(){ui.hidden.clear();ui.filterOpen=true;rerender()}
function filterSubject(id,checked){if(checked)ui.hidden.delete(id);else ui.hidden.add(id);ui.filterOpen=true;rerender()}
function openPlan(){try{if(typeof showAutoScheduleSettings==='function')return showAutoScheduleSettings()}catch(e){}try{if(appRef()&&typeof appRef().openAutoScheduleSettings==='function')return appRef().openAutoScheduleSettings()}catch(e){}toastSafe('Cài đặt kế hoạch tự động chưa sẵn sàng.')}
function openSlot(date,slotId){try{if(typeof openScheduleSlot==='function')return openScheduleSlot(date,slotId)}catch(e){}toastSafe('Không mở được ca học này.')}
function acceptSuggestion(id){if(ui.accepted.has(id))ui.accepted.delete(id);else ui.accepted.add(id);rerender()}
function scrollSuggestions(){var x=document.getElementById('scheduleRefSuggestions');if(x)x.scrollIntoView({behavior:'smooth',block:'nearest'})}
function scrollCalendar(){var h=document.getElementById('page-schedule'),x=h&&h.querySelector('.schedule-ref__calendar-card');if(x)x.scrollIntoView({behavior:'smooth',block:'start'})}
function addNote(){var text=window.prompt('Nhập ghi chú hoặc nhắc việc:');if(!text||!text.trim())return;var when=window.prompt('Thời gian / mô tả ngắn (không bắt buộc):')||'';var a=readNotes();a.unshift({id:'n'+Date.now(),text:text.trim().slice(0,180),when:when.trim().slice(0,80),done:false});writeNotes(a);rerender()}
function toggleNote(id,done){var a=readNotes(),n=a.find(function(x){return x.id===id});if(n)n.done=!!done;writeNotes(a);rerender()}
function removeNote(id){writeNotes(readNotes().filter(function(x){return x.id!==id}));rerender()}
function toggleManual(){var sc=scheduleState();if(!sc)return;sc.edit=!sc.edit;saveState();rerender();toastSafe(sc.edit?'Đã bật chỉnh lịch thủ công.':'Đã tắt chỉnh lịch thủ công.')}
function patch(){var a=appRef();if(!a||a.__scheduleReferenceV1)return false;var previous=typeof a.schedule==='function'?a.schedule.bind(a):null;a.schedule=function(){return render()};a.__scheduleReferenceV1={release:RELEASE,previousSchedule:previous};if(typeof state!=='undefined'&&state&&state.page==='schedule')render();return true}
function selfCheck(){var h=document.getElementById('page-schedule');return {release:RELEASE,patched:!!(appRef()&&appRef().__scheduleReferenceV1),active:!!(h&&h.querySelector('.schedule-ref-page')),view:ui.view,summaryCards:h?h.querySelectorAll('.schedule-ref__summary-card').length:0,rightRail:!!(h&&h.querySelector('.schedule-ref__right-rail')),footerPanels:h?h.querySelectorAll('.schedule-ref__footer-grid>.schedule-ref__panel').length:0,touchesOnlySchedule:true}}
window.BAUMAN_SCHEDULE_REF={release:RELEASE,patch:patch,render:render,selfCheck:selfCheck,changeWeek:changeWeek,today:today,setView:setView,selectDay:selectDay,shiftMonth:shiftMonth,toggleFilter:toggleFilter,clearFilters:clearFilters,filterSubject:filterSubject,openPlan:openPlan,openSlot:openSlot,acceptSuggestion:acceptSuggestion,scrollSuggestions:scrollSuggestions,scrollCalendar:scrollCalendar,addNote:addNote,toggleNote:toggleNote,removeNote:removeNote,toggleManual:toggleManual};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patch,{once:true});else patch();
})();