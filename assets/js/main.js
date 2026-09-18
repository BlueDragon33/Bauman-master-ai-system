const DATA = window.BAUMAN_DATA;
const $ = id => document.getElementById(id);
const $$ = sel => [...document.querySelectorAll(sel)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const KEY = 'bauman_main_all_phases_subjects_v1';
const USERS_KEY = 'bauman_main_users_fullcode_v1';
const CURRENT_USER_KEY = 'bauman_current_user_fullcode_v1';
const DAYS = ['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','Chủ nhật'];
const MAIN_SLOTS = [
  {id:'morning1', label:'Sáng 1', time:'06:30–08:00', type:'memorize'},
  {id:'morning2', label:'Sáng 2', time:'08:30–10:30', type:'memorize'},
  {id:'afternoon', label:'Chiều', time:'14:00–16:00', type:'technical'}
];
const REVIEW_SLOTS = [
  {id:'reviewMorning', label:'Sáng ôn tập', time:'07:00–08:30'},
  {id:'reviewAfternoon', label:'Chiều ôn tập', time:'14:00–15:30'}
];
const FINAL_TARGET_QUESTIONS = 100;
const DEFAULT_TARGET_SCORE = 80;
const BRIDGE_TYPES = {ready:'BAUMAN_SUBJECT_READY', task:'BAUMAN_ASSIGN_TASK', progress:'BAUMAN_SUBJECT_PROGRESS', capability:'BAUMAN_SUBJECT_CAPABILITY_STATE', capabilityRequest:'BAUMAN_REQUEST_SUBJECT_CAPABILITY_STATE', capabilityRouteReceipt:'BAUMAN_SUBJECT_CAPABILITY_ROUTE_APPLIED'};
function pad2(n){return String(n).padStart(2,'0')}
function iso(d){return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate())}
function parseDate(s){const m=String(s||'2026-06-08').match(/^(\d{4})-(\d{2})-(\d{2})/);return m?new Date(Number(m[1]),Number(m[2])-1,Number(m[3])):new Date(2026,5,8)}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function todayISO(){return iso(new Date())}
function minutesFromClock(text){const m=String(text||'').match(/(\d{1,2}):(\d{2})/);return m?Number(m[1])*60+Number(m[2]):0}
function slotDurationMinutes(slot){const m=String(slot?.time||'').match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);if(!m)return 90;return Math.max(30,minutesFromClock(m[2])-minutesFromClock(m[1]))}
function parseHoursValue(raw){const text=String(raw||'').toLowerCase();if(text.includes('hằng ngày')||text.includes('theo lịch'))return null;const nums=[...text.matchAll(/(\d+(?:[.,]\d+)?)/g)].map(x=>Number(x[1].replace(',','.'))).filter(Boolean);if(!nums.length)return null;return Math.max(...nums)}
function isWeekendDate(dateStr){const d=parseDate(dateStr).getDay();return d===0||d===6}
function progressPct(correct,total){return total?Math.round(Number(correct||0)*100/Number(total||1)):0}
function initials(user){const raw=(user?.name||user?.email||'?').replace(/@.*/,'').trim();const parts=raw.split(/[\s._-]+/).filter(Boolean);return (parts.length>1?parts[0][0]+parts.at(-1)[0]:raw.slice(0,2)).toUpperCase()}
function toast(msg){const t=$('toast');t.textContent=msg;t.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.display='none',2600)}
function subjectName(id){return state.subjects[id]?.name || DATA.subjects.find(s=>s.id===id)?.name || id}
function stageShort(id){return ({all:'Tất cả',prepare:'GĐ1',preparatory:'GĐ2',bauman:'GĐ3',m1:'HK1',m2:'HK2',m3:'HK3',m4:'HK4'}[id]||String(id).toUpperCase())}
function stageLabel(id){return DATA.stages.find(s=>s.id===id)?.name || DATA.semesters.find(s=>s.id===id)?.name || id}
function courseTypeLabel(type){return ({self_prep:'Tự chuẩn bị',prep_core:'Dự bị chính',prep_support:'Bổ trợ dự bị',official_candidate:'Chính khóa cần xác minh',nir_core:'НИР',vkr_core:'ВКР',thesis_module:'Module luận văn',support_module:'Module hỗ trợ',foundation:'Nền tảng',official:'Chính khóa'}[type]||String(type||'Học phần'))}
function confidenceLabel(c){return ({self:'Tự thiết kế',institutional:'Theo khung dự bị',candidate:'Cần đối chiếu учебный план',program_flow:'Theo luồng НИР/ВКР'}[c?.confidence]||'Theo lộ trình')}
function courseTrackLabel(track){return ({ugv_core:'UGV lõi',usv_extension:'USV mở rộng',support:'Bổ trợ',base:'Nền bắt buộc'}[track]||'Theo lộ trình')}
function chipsHTML(items,cls='tag'){return Array.isArray(items)&&items.length?items.map(x=>`<span class="${cls}">${esc(x)}</span>`).join(''):''}
function isMemorizeSubject(id){return ['russian','research','foundation'].includes(id)}
function isTechnicalSubject(id){return ['math','programming','ai','systems','signal'].includes(id)}
function defaultUsers(){return []}
function readUsers(){try{const users=JSON.parse(localStorage.getItem(USERS_KEY)||'[]');return Array.isArray(users)?users:defaultUsers()}catch{return defaultUsers()}}
function saveUsers(users){localStorage.setItem(USERS_KEY,JSON.stringify(users))}
const PASSWORD_ITERATIONS=120000;
function base64Bytes(bytes){let binary='';bytes.forEach(byte=>binary+=String.fromCharCode(byte));return btoa(binary)}
function bytesFromBase64(value){return Uint8Array.from(atob(value),char=>char.charCodeAt(0))}
async function derivePassword(password,salt,iterations=PASSWORD_ITERATIONS){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations},key,256);return base64Bytes(new Uint8Array(bits))}
async function passwordRecord(password){const salt=crypto.getRandomValues(new Uint8Array(16));return{passwordHash:await derivePassword(password,salt),passwordSalt:base64Bytes(salt),passwordIterations:PASSWORD_ITERATIONS}}
async function passwordMatches(user,password){if(user.passwordHash&&user.passwordSalt)return (await derivePassword(password,bytesFromBase64(user.passwordSalt),Number(user.passwordIterations)||PASSWORD_ITERATIONS))===user.passwordHash;return typeof user.password==='string'&&user.password===password}
function getCurrentUser(){try{return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)||'null')}catch{return null}}
function setCurrentUser(user){localStorage.setItem(CURRENT_USER_KEY,JSON.stringify(user))}
function defaultState(){
  const pathMap={russian:'subjects/russian/index.html',math:'subjects/math/index.html',programming:'subjects/programming/index.html',ai:'subjects/ai/index.html',systems:'subjects/systems/index.html',signal:'subjects/signal/index.html',research:'subjects/research/index.html',foundation:'subjects/foundation/index.html'}; const editorMap={russian:'subjects/russian/editor.html',math:'subjects/math/editor.html',programming:'subjects/programming/editor.html',ai:'subjects/ai/editor.html',systems:'subjects/systems/editor.html',signal:'subjects/signal/editor.html',research:'subjects/research/editor.html',foundation:'subjects/foundation/editor.html'}; const subjects=Object.fromEntries(DATA.subjects.map(s=>[s.id,{...s,mainPath:pathMap[s.id]||'',editorPath:editorMap[s.id]||'',priority:['russian','math','programming','ai'].includes(s.id)?'q1':(['systems','signal','research'].includes(s.id)?'q2':'q4')}]))
  return {page:'home',homePanel:'matrix',roadmapStage:'prepare',subject:'russian',subjectStage:'prepare',schedule:{view:'main',weekStart:'2026-06-08',edit:false,entries:{},timezone:'utc7',autoStage:'prepare',autoFrom:'2026-06-08',autoTo:'2026-10-31',targetQuestions:FINAL_TARGET_QUESTIONS,targetScore:DEFAULT_TARGET_SCORE},progress:{},subjectReports:{},subjectCapabilities:{},subjectRouteReceipts:{},reviewQueue:[],activeTask:null,activity:[],theme:'academic',font:'system',fontSize:'normal',lastStudy:{subjectId:'russian',path:'subjects/russian/index.html'},researchTopic:'ugv',researchChecks:{},researchFiles:{},subjects};
}
function normalizeState(raw){
  const base=defaultState(); const src=raw&&typeof raw==='object'?raw:{}; const out={...base,...src};
  out.subjects={...base.subjects};
  for(const id of Object.keys(base.subjects)){
    const saved=src.subjects?.[id]||{};
    out.subjects[id]={...base.subjects[id],...saved};
    out.subjects[id].name=saved.name||base.subjects[id].name;
    out.subjects[id].desc=saved.desc||base.subjects[id].desc;
    out.subjects[id].main=saved.main||base.subjects[id].main||'';
    out.subjects[id].eq=Array.isArray(saved.eq)&&saved.eq.length?saved.eq:(base.subjects[id].eq||[]);
    out.subjects[id].mainPath=saved.mainPath || base.subjects[id].mainPath;
    out.subjects[id].editorPath=saved.editorPath || base.subjects[id].editorPath;
    out.subjects[id].priority=saved.priority||base.subjects[id].priority;
  }
  out.schedule={...base.schedule,...(src.schedule||{})}; out.schedule.entries={...(src.schedule?.entries||{})}; if(!['utc7','utc3'].includes(out.schedule.timezone))out.schedule.timezone='utc7'; if(!['prepare','preparatory','bauman','m1','m2','m3','m4'].includes(out.schedule.autoStage))out.schedule.autoStage='prepare'; if(!out.schedule.autoFrom)out.schedule.autoFrom='2026-06-08'; if(!out.schedule.autoTo)out.schedule.autoTo='2026-10-31'; out.schedule.targetQuestions=Number(out.schedule.targetQuestions)||FINAL_TARGET_QUESTIONS; out.schedule.targetScore=Number(out.schedule.targetScore)||DEFAULT_TARGET_SCORE;
  out.subjectReports = (src.subjectReports && typeof src.subjectReports==='object') ? src.subjectReports : {};
  out.subjectCapabilities = (src.subjectCapabilities && typeof src.subjectCapabilities==='object') ? src.subjectCapabilities : {};
  out.subjectRouteReceipts = (src.subjectRouteReceipts && typeof src.subjectRouteReceipts==='object') ? src.subjectRouteReceipts : {};
  out.reviewQueue = Array.isArray(src.reviewQueue) ? src.reviewQueue : [];
  out.activeTask = (src.activeTask && typeof src.activeTask==='object') ? src.activeTask : null;
  if(!out.subjects[out.subject])out.subject='russian';
  if(!['academic','paper','night','mint'].includes(out.theme))out.theme='academic';
  if(!['system','serif','mono','rounded'].includes(out.font))out.font='system';
  if(!['compact','normal','large','xlarge'].includes(out.fontSize))out.fontSize='normal';
  if(out.subjectStage==='all')out.subjectStage='prepare';
  out.researchChecks = (src.researchChecks && typeof src.researchChecks==='object') ? src.researchChecks : {};
  out.researchFiles = (src.researchFiles && typeof src.researchFiles==='object') ? src.researchFiles : {};
  return out;
}
function readState(){try{return normalizeState(JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{return defaultState()}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
let state=readState();
function applyAppearance(){document.body.dataset.theme=state.theme||'academic';document.body.dataset.font=state.font||'system';document.body.dataset.size=state.fontSize||'normal'}

const auth={
  current:null,
  setupMode:false,
  init(){const users=readUsers();const stored=getCurrentUser();this.current=stored&&users.some(u=>u.email===stored.email)?stored:null;this.setupMode=users.length===0;this.renderLogin();if(this.current){$('authScreen').classList.add('hidden');$('appRoot').classList.remove('hidden');this.render()}else{localStorage.removeItem(CURRENT_USER_KEY);$('authScreen').classList.remove('hidden');$('appRoot').classList.add('hidden')}} ,
  renderLogin(){const title=$('authTitle'),description=$('authDescription'),button=$('loginBtn'),note=$('authSafeNote'),pass=$('loginPass');if(this.setupMode){title.textContent='Thiết lập quản trị viên đầu tiên';description.textContent='Tạo hồ sơ quản trị cục bộ cho trình duyệt này để bắt đầu.';button.textContent='Tạo quản trị viên';note.textContent='Không có tài khoản hoặc mật khẩu mặc định được phát hành cùng trang.';pass.autocomplete='new-password'}else{title.textContent='Đăng nhập lộ trình Bauman';description.textContent='Đăng nhập để dùng lộ trình, lịch học, môn học và tiến độ cá nhân.';button.textContent='Đăng nhập';note.textContent='Hồ sơ này được lưu cục bộ; quyền truy cập hệ thống do Device Gate bảo vệ.';pass.autocomplete='current-password'}},
  async login(){const email=$('loginEmail').value.trim().toLowerCase();const pass=$('loginPass').value;let users=readUsers();let user;if(!users.length){if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return toast('Cần nhập email hợp lệ');if(pass.length<8)return toast('Mật khẩu cần ít nhất 8 ký tự');user={email,...await passwordRecord(pass),name:email.split('@')[0]||'Quản trị viên',role:'admin'};users=[user];saveUsers(users);this.setupMode=false}else{user=users.find(u=>String(u.email).toLowerCase()===email);if(!user||!await passwordMatches(user,pass))return toast('Email hoặc mật khẩu chưa đúng');if(user.password&&!user.passwordHash){Object.assign(user,await passwordRecord(pass));delete user.password;saveUsers(users)}}this.current={email:user.email,name:user.name,role:user.role};setCurrentUser(this.current);$('authScreen').classList.add('hidden');$('appRoot').classList.remove('hidden');this.render();app.renderAll();app.page(state.page||'home',false);toast(user.role==='admin'&&users.length===1?'Đã sẵn sàng':'Đã đăng nhập')},
  logout(){localStorage.removeItem(CURRENT_USER_KEY);location.reload()},
  render(){const u=this.current||{email:'--',name:'Người học',role:'user'};$('currentUserName').textContent=u.name||'Người học';$('currentUserEmail').textContent=u.email||'--';$('currentUserRole').textContent=(u.role||'user').toUpperCase();$('userAvatar').textContent=initials(u);$('userAvatarBig').textContent=initials(u);$$('.admin-only').forEach(x=>x.classList.toggle('hidden',u.role!=='admin'))},
  isAdmin(){return this.current?.role==='admin'}
};
function closeProfileMenu(){ $('profileMenu')?.classList.add('hidden') }
function openModal(title,body,wide=false){$('modalRoot').innerHTML=`<div class="modal-backdrop canva-modal-backdrop" data-close="1"><div class="dialog canva-dialog ${wide?'wide':''}"><div class="dialog-head canva-dialog-head"><div><span class="modal-eyebrow">Bauman Main</span><h2>${esc(title)}</h2></div><button class="btn sm canva-close-btn" data-action="close-modal">Đóng</button></div><div class="dialog-body canva-dialog-body">${body}</div></div></div>`}
function closeModal(){ $('modalRoot').innerHTML='' }
function roadmapItem(id){const stage=DATA.stages.find(s=>s.id===id);if(stage)return {...stage,kind:'stage',title:stage.name,subtitle:stage.period,detail:stage.goal,meta:stage.load||''};const sem=DATA.semesters.find(s=>s.id===id);if(sem)return {id:sem.id,kind:'semester',title:sem.name,subtitle:sem.period,detail:sem.focus,meta:'GĐ3 · Chính khóa Bauman'};return roadmapItem('prepare')}

const app={
  init(){applyAppearance();this.bind();auth.init();this.ensureSchedule();this.renderAll();this.page(state.page||'home',false);setTimeout(()=>BAUMAN_AUDIT(),300)},
  bind(){
    $('loginBtn').onclick=()=>auth.login(); $('sidebarToggle').onclick=()=>this.toggleSidebar();
    $('nav').addEventListener('click',e=>{const btn=e.target.closest('button[data-page]');if(btn)this.page(btn.dataset.page)});
    $('profileBtn').onclick=e=>{e.stopPropagation();$('profileMenu').classList.toggle('hidden');$('appearanceMenu')?.classList.add('hidden')};
    $('appearanceBtn').onclick=e=>{e.stopPropagation();$('appearanceMenu').classList.toggle('hidden');closeProfileMenu()};
    document.addEventListener('click',e=>{if(!e.target.closest('.profile-wrap'))closeProfileMenu();if(!e.target.closest('.appearance-wrap'))$('appearanceMenu')?.classList.add('hidden');if(e.target.dataset.close==='1')closeModal()});
    $('adminOpenBtn').onclick=()=>{closeProfileMenu();this.page('admin')}; $('logoutBtn').onclick=()=>auth.logout();
    $('backupBtn').onclick=()=>this.exportBackup(); $('restoreInput').onchange=e=>this.importBackup(e.target.files[0]);
    $('themeSelect').value=state.theme; $('fontSelect').value=state.font; $('fontSizeSelect').value=state.fontSize;
    $('themeSelect').onchange=e=>{state.theme=e.target.value;save();applyAppearance()};
    $('fontSelect').onchange=e=>{state.font=e.target.value;save();applyAppearance()};
    $('fontSizeSelect').onchange=e=>{state.fontSize=e.target.value;save();applyAppearance()};
    $('aiBtn').onclick=()=>mentor.open();
    $('modalRoot').addEventListener('click',e=>{const a=e.target.dataset.action;if(!a)return;e.preventDefault();e.stopPropagation();if(a==='close-modal')closeModal();if(a==='auto-schedule'){applyAutoScheduleSettings()}if(a==='toggle-edit'){state.schedule.edit=!state.schedule.edit;save();this.schedule();this.openManualScheduleMode()}if(a==='save-user')this.saveUser()});
    $('studyRoot').addEventListener('click',e=>{if(e.target.dataset.action==='close-study')this.closeStudy()});
    window.addEventListener('message',handleSubjectBridgeMessage);
  },
  toggleSidebar(){ $('appRoot').classList.toggle('collapsed') },
  renderAll(){this.home();this.roadmap();this.subjects();this.schedule();this.research();this.admin()},
  page(p,persist=true){if(p==='admin'&&!auth.isAdmin())return toast('Chỉ quản trị viên mới vào được phần này');state.page=p;if(persist)save();$$('.page').forEach(x=>x.classList.toggle('active',x.id==='page-'+p));$$('#nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===p));const titles={home:['Tổng quan','Trang chính giúp bạn biết hôm nay học gì, mở đúng môn và theo dõi tiến độ.'],roadmap:['Lộ trình','Chọn giai đoạn, học kỳ Bauman và học phần liên quan.'],subjects:['Môn học','Theo dõi từng môn theo giai đoạn và mở chương trình học.'],schedule:['Lịch học','Tự động xếp học chính và ôn tập theo ma trận ưu tiên.'],research:['НИР & Luận văn','Chọn chủ đề, xem dữ liệu, phần cứng, rủi ro và mốc triển khai.'],admin:['Quản trị','Tài khoản người học và đường dẫn môn học.']};$('pageTitle').textContent=titles[p]?.[0]||'Bauman';$('pageSubtitle').textContent=titles[p]?.[1]||'';this[p]?.()},
  home(){
    const current=state.subjects[state.subject]||Object.values(state.subjects)[0]||{};
    const done=Object.values(state.progress||{}).filter(x=>Number(x)>=100).length;
    const nextTask=findBestLearningTask(state.subject);
    const prog=this.scheduleProgress?this.scheduleProgress():{pct:0,filled:0,total:0};
    const stage=roadmapItem(state.roadmapStage||state.schedule?.autoStage||'prepare');
    const subjectCount=Object.keys(state.subjects||{}).length;
    const todayLabel=nextTask?`${esc(nextTask.date||'Hôm nay')} · ${esc(nextTask.durationMinutes||90)} phút`:'Chưa có ca học gần nhất';
    $('page-home').innerHTML=`<div class="canva-dashboard-page"><section class="canva-main-hero"><div class="canva-hero-copy"><span class="pill green">PlanningBridge · Main Control</span><h2>Trạm điều phối học Bauman</h2><p>Vào đúng môn, đúng ca học, đúng giai đoạn. Main giữ vai trò điều phối: lịch trình, tiến độ, môn học và НИР được gom thành một bảng lái sạch, nhẹ, dễ thao tác.</p><div class="hero-actions"><button class="btn primary big" onclick="app.continueStudy()">▶ Tiếp tục học</button><button class="btn big" onclick="app.page('schedule')">🗓 Lịch hôm nay</button><button class="btn big" onclick="app.page('subjects')">📚 Kho môn học</button></div></div><aside class="canva-hero-panel"><span class="pill">Môn đang chọn</span><h3>${esc(current.name||'Môn học')}</h3><p>${esc(current.desc||'Chọn môn học để bắt đầu lộ trình.')}</p><div class="canva-mini-list"><span><b>${todayLabel}</b><small>Nhiệm vụ kế tiếp</small></span><span><b>${esc(stage.title||stage.name||'Giai đoạn')}</b><small>Lộ trình hiện tại</small></span></div></aside></section><section class="canva-kpi-row"><article class="kpi"><small>Môn học</small><b>${subjectCount}</b><span>module đang quản lý</span></article><article class="kpi"><small>Học phần</small><b>${DATA.courses.length}</b><span>từ dự bị đến ВКР</span></article><article class="kpi"><small>Đã xong</small><b>${done}</b><span>môn đạt 100%</span></article><article class="kpi"><small>Lịch trình</small><b>${prog.pct}%</b><span>${prog.filled}/${prog.total} ca đã xếp</span></article></section><section class="canva-home-grid"><article class="panel canva-today-board"><div class="section-head"><div><h2>Học ngay hôm nay</h2><p>${nextTask?`Ca gần nhất: ${esc(nextTask.learningItem||'Học theo lịch')}`:'Chưa có ca học gần nhất trong lịch hiện tại.'}</p></div><button class="btn" onclick="app.page('schedule')">Mở lịch</button></div><div class="canva-action-stack"><button class="canva-action-card" onclick="app.continueStudy()"><b>Vào môn đang học</b><span>${esc(current.name||'Môn học')}</span></button><button class="canva-action-card" onclick="app.page('roadmap')"><b>Xem giai đoạn</b><span>${esc(stage.subtitle||'Theo dõi đường bay học tập')}</span></button><button class="canva-action-card" onclick="app.page('research')"><b>Chuẩn bị НИР</b><span>Gắn mục tiêu nghiên cứu với học phần</span></button></div></article><article class="panel canva-progress-board"><div class="section-head"><div><h2>Tiến độ môn học</h2><p>Nhìn nhanh môn nào đang chạy, môn nào cần kéo lên.</p></div><button class="btn" onclick="showHomeFrame('progress')">Chi tiết</button></div><div class="canva-subject-progress">${Object.values(state.subjects).slice(0,6).map(s=>{const pct=Number(state.progress?.[s.id]||0);return `<div class="canva-progress-row"><span>${esc(s.icon||'•')}</span><b>${esc(s.name)}</b><em>${pct}%</em><i><u style="width:${pct}%"></u></i></div>`}).join('')}</div></article></section></div>`
  },
  homePanelHTML(mode){if(mode==='progress'){const rows=Object.values(state.subjects).map(s=>`<tr><td><b>${esc(s.name)}</b></td><td>${state.progress[s.id]||0}%</td><td>${state.lastStudy?.subjectId===s.id?'Đang học gần nhất':'-'}</td></tr>`).join('');return `<div class="section-head"><div><h2>Tiến độ</h2><p>Theo dõi tổng quan, không ghi mã kỹ thuật.</p></div></div><div class="matrix-table"><table><thead><tr><th>Môn</th><th>Tiến độ</th><th>Ghi chú</th></tr></thead><tbody>${rows}</tbody></table></div>`}if(mode==='current'){const st=roadmapItem(state.roadmapStage);const count=this.coursesForStage(st.id).length;return `<div class="section-head"><div><h2>Lộ trình hiện tại</h2><p>${esc(st.subtitle)}</p></div><button class="btn" onclick="closeModal();app.page('roadmap')">Xem đầy đủ</button></div><div class="time-item"><h3>${esc(st.title)}</h3><p>${esc(st.detail)}</p><div class="course-tags"><span class="tag">${esc(st.meta)}</span><span class="tag">${count} học phần liên quan</span></div></div>`}const rows=Object.values(state.subjects).map(s=>`<tr><td><b>${esc(s.name)}</b><br><small>${esc(s.main||'')}</small></td><td>${esc(s.eq?.[0]||'')}</td><td>${esc(s.eq?.[1]||'')}</td><td>${esc(s.eq?.[2]||'')}</td></tr>`).join('');return `<div class="section-head"><div><h2>Giai đoạn môn học</h2><p>Mỗi môn phát triển xuyên suốt từ chuẩn bị, dự bị đến chính khóa.</p></div></div><div class="matrix-table"><table><thead><tr><th>Môn</th><th>GĐ1</th><th>GĐ2</th><th>GĐ3</th></tr></thead><tbody>${rows}</tbody></table></div>`},
  openHomeFrame(mode){const titles={matrix:'Giai đoạn môn học',progress:'Tiến độ',current:'Lộ trình hiện tại'};openModal(titles[mode]||'Tổng quan',`<div class="home-frame-box">${this.homePanelHTML(mode)}</div>`,true)},
  renderHomePanel(){const box=$('homePanel');if(!box)return;box.innerHTML=this.homePanelHTML(state.homePanel||'matrix')},
  continueStudy(){const last=state.lastStudy||{subjectId:state.subject};const context=capabilityContinueContext(last.subjectId);this.openSubjectInPage(last.subjectId,context||{})},
  roadmap(){
    const item=roadmapItem(state.roadmapStage);
    const courses=this.coursesForStage(item.id);
    const semesterCards=DATA.semesters.map(sem=>`<button class="semester-card ${state.roadmapStage===sem.id?'active':''}" onclick="selectRoadmapStage('${sem.id}')"><span class="pill purple">${stageShort(sem.id)}</span><strong>${esc(sem.name.replace('Bauman ',''))}</strong><small>${esc(sem.period||'')}</small></button>`).join('');
    $('page-roadmap').innerHTML=`<div class="canva-roadmap-page"><section class="canva-roadmap-hero panel"><div><span class="pill ${item.kind==='semester'?'purple':'green'}">${item.kind==='semester'?'Học kỳ Bauman':'Giai đoạn'}</span><h2>${esc(item.title)}</h2><p>${esc(item.subtitle)}</p></div><div class="canva-roadmap-stat"><b>${courses.length}</b><span>học phần liên quan</span></div></section><div class="roadmap-layout canva-roadmap-layout"><aside class="roadmap-list canva-roadmap-rail">${DATA.stages.map(s=>`<button class="stage-card ${state.roadmapStage===s.id?'active':''}" onclick="selectRoadmapStage('${s.id}')"><span class="pill ${s.color||''}">${stageShort(s.id)}</span><h3>${esc(s.name)}</h3><p>${esc(s.period)}</p></button>`).join('')}<div class="panel semester-panel"><b>Học kỳ Bauman</b><p>Chọn học kỳ để xem mục tiêu và học phần đúng giai đoạn.</p><div class="semester-grid">${semesterCards}</div></div></aside><article class="roadmap-detail canva-roadmap-detail"><div class="section-head"><div><h2>${item.kind==='semester'?'Trọng tâm học kỳ':'Mục tiêu trọng tâm'}</h2><p>${esc(item.detail)}</p></div></div><div class="course-tags"><span class="tag">${esc(item.meta)}</span><span class="tag">${courses.length} học phần</span><span class="tag">${esc(item.kind==='semester'?'Chính khóa':'Chuẩn bị')}</span></div><div class="section-head" style="margin-top:18px"><div><h2>${item.kind==='semester'?'Học phần học kỳ này':'Học phần liên quan'}</h2><p>Danh sách được gom thành card để dễ chọn, đọc và mở rộng sau này.</p></div></div><div class="course-list roadmap-course-list canva-course-grid">${courses.map(c=>this.courseHTML(c)).join('')||'<div class="panel">Giai đoạn này đang dùng kế hoạch tự học, chưa có học phần chính khóa riêng.</div>'}</div></article></div></div>`
  },
  coursesForStage(stage){if(stage==='bauman')return DATA.courses.filter(c=>/^m\d/.test(c.stage));if(/^m\d$/.test(String(stage)))return DATA.courses.filter(c=>c.stage===stage);return DATA.courses.filter(c=>c.stage===stage)},
  subjectStageOptions(){return ['prepare','preparatory','bauman','m1','m2','m3','m4']},
  filteredSubjectsForStage(stage){const filtered=Object.values(state.subjects).filter(s=>this.subjectCourses(s.id,stage).length>0);return filtered.length?filtered:Object.values(state.subjects)},
  subjects(){
    const stage=this.subjectStageOptions().includes(state.subjectStage)?state.subjectStage:'prepare';
    state.subjectStage=stage;
    let list=this.filteredSubjectsForStage(stage);
    if(!list.some(x=>x.id===state.subject))state.subject=list[0]?.id||'russian';
    const s=state.subjects[state.subject]||list[0]||{};
    state.subject=s.id;
    const totalCourses=list.reduce((sum,x)=>sum+this.subjectCourses(x.id,stage).length,0);
    $('page-subjects').innerHTML=`<div class="canva-subjects-page"><section class="subject-stage-toolbar panel canva-subject-toolbar"><div><span class="pill">Kho môn học</span><h2>Chọn môn theo giai đoạn</h2><p>${esc(stageLabel(stage))} · ${list.length} môn · ${totalCourses} học phần liên quan.</p></div><select class="field subject-stage-select" onchange="setSubjectStage(this.value)">${this.subjectStageOptions().map(id=>`<option value="${id}" ${stage===id?'selected':''}>${stageShort(id)} · ${esc(stageLabel(id))}</option>`).join('')}</select></section><div class="subject-page canva-subject-page"><aside class="panel subject-list canva-subject-list">${list.map(x=>`<button class="subject-card ${x.id===s.id?'active':''}" onclick="pickSubject('${x.id}')"><span class="subject-icon">${esc(x.icon)}</span><span><strong>${esc(x.name)}</strong><small>${this.subjectCourses(x.id,stage).length} học phần · ${x.mainPath?'Có file học':'Chưa có file'}</small></span></button>`).join('')}</aside><article class="panel subject-detail canva-subject-detail">${this.subjectDetailHTML(s)}</article></div></div>`
  },
  subjectCourses(subjectId,stage){return DATA.courses.filter(c=>c.subject===subjectId&&(stage==='all'||c.stage===stage||(stage==='bauman'&&/^m\d/.test(c.stage))))},
  subjectDetailHTML(s){const filter=this.subjectStageOptions().includes(state.subjectStage)?state.subjectStage:'prepare';const courses=this.subjectCourses(s.id,filter);const task=findBestLearningTask(s.id);const report=latestSubjectReport(s.id);const comp=[...new Set(courses.flatMap(c=>c.competencies||[]))].slice(0,6);const tracks=[...new Set(courses.map(c=>courseTrackLabel(c.trackUse)))].filter(Boolean);return `<div class="subject-head compact"><span class="subject-icon">${esc(s.icon)}</span><div><h2>${esc(s.name)}</h2><p>${esc(s.desc)}</p></div></div><div class="subject-actions compact-actions"><button class="launch primary compact-launch" onclick="app.openSubjectInPage('${s.id}')"><strong>Học trong trang này</strong><small>Nhận nhiệm vụ từ Main</small></button><button class="launch compact-launch" onclick="app.openSubjectTab('${s.id}')"><strong>Mở tab riêng</strong><small>Vẫn truyền nhiệm vụ qua URL</small></button><button class="btn compact-data" onclick="app.openSubjectEditor('${s.id}')">Dữ liệu môn</button></div><div class="subject-content"><div class="current-stage-note"><span class="pill">${stageShort(filter)}</span><b>Main điều phối lộ trình. Môn học chỉ thực hiện nhiệm vụ được giao và phản hồi kết quả.</b></div><div class="route-subject-summary"><div><b>Năng lực giai đoạn</b><div class="course-tags">${chipsHTML(comp)}</div></div><div><b>Vai trò đề tài</b><div class="course-tags">${chipsHTML(tracks)}</div></div></div><div class="section-head"><div><h2>Nhiệm vụ gần nhất từ thời khóa biểu</h2><p>${task?`${esc(task.learningItem||'Học theo lịch')} · ${esc(task.date)} · ${task.durationMinutes||90} phút · kết thúc dự kiến ${esc(task.plannedEndDate||task.date)}`:'Chưa có ca học cho môn này trong lịch hiện tại.'}</p></div></div><div class="course-list subject-course-list"><article class="course critical"><h4>${task?esc(task.learningItem||'Học theo lịch'):'Chưa có nhiệm vụ'}</h4><p>${report?`Phản hồi gần nhất: ${Number(report.percent||0)}% · ${Number(report.total||0)}/${Number(report.targetQuestions||FINAL_TARGET_QUESTIONS)} câu`:'Chưa có phản hồi từ môn học.'}</p><div class="course-tags"><span class="tag">Mục tiêu: ${DEFAULT_TARGET_SCORE}%</span><span class="tag">Bài kết thúc: ${FINAL_TARGET_QUESTIONS} câu</span><span class="tag">${courses.length} học phần trong Main</span></div></article>${courses.slice(0,5).map(c=>this.courseHTML(c)).join('')}</div></div>`},
  courseHTML(c){return `<article class="course ${c.priority||''} ${c.type||''} route-course-card"><div class="course-type-line"><span class="tag strong">${esc(courseTypeLabel(c.type))}</span><span class="tag">${esc(confidenceLabel(c))}</span><span class="tag route-track">${esc(courseTrackLabel(c.trackUse))}</span></div><h4>${esc(c.name||c.vi)}</h4><p><b>${esc(c.ru||'')}</b><br>${esc(c.note||c.vi||'')}</p>${c.routeRole?`<p class="course-role"><b>Vai trò:</b> ${esc(c.routeRole)}</p>`:''}${c.competencies?.length?`<div class="route-competency-box"><b>Năng lực đầu ra</b><div class="course-tags">${chipsHTML(c.competencies)}</div></div>`:''}${c.projectUse?`<p class="course-project"><b>Gắn với UGV/USV:</b> ${esc(c.projectUse)}</p>`:''}${c.deliverable?`<p class="course-output"><b>Sản phẩm:</b> ${esc(c.deliverable)}</p>`:''}<div class="course-tags"><span class="tag">${stageShort(c.stage)}</span>${c.credits?`<span class="tag">${esc(c.credits)}</span>`:''}<span class="tag">${esc(c.hours||'')}</span><span class="tag">${esc(c.assessment||'')}</span></div></article>`},
  openSubjectCapabilityGap(id='russian'){const context=capabilityGapContext(id);if(!context)return this.openSubjectInPage(id);return this.openSubjectInPage(id,context)},
  openSubjectInPage(id,context={}){const s=state.subjects[id];if(!s?.mainPath)return toast('Môn này chưa có file học. Quản trị có thể thêm đường dẫn trong phần Quản trị.');const task=buildLearningTask(id,context);const src=withTaskQuery(s.mainPath,task);if(!src)return toast('Đường dẫn môn học không an toàn hoặc không hợp lệ.');state.lastStudy={subjectId:id,path:s.mainPath};state.activeTask=task;save();$('studyRoot').innerHTML=`<div class="study-viewer canva-study-viewer"><div class="study-head canva-study-head"><div><h2>${esc(s.name)}</h2><small>Nhiệm vụ từ Main: ${esc(task.learningItem||'Học theo lịch')} · ${task.durationMinutes} phút · kết thúc ${esc(task.plannedEndDate||task.date)}</small></div><div class="tools"><button class="btn" data-action="close-study">Đóng</button><button class="btn" onclick="app.openSubjectTab('${id}')">Mở tab riêng</button></div></div><iframe id="subjectFrame" src="${esc(src)}"></iframe></div>`;const iframe=$('subjectFrame');if(iframe)iframe.addEventListener('load',()=>sendTaskToSubject(iframe.contentWindow,task));},
  openSubjectTab(id){const s=state.subjects[id];if(!s?.mainPath)return toast('Môn này chưa có file học.');const task=buildLearningTask(id,{});const src=withTaskQuery(s.mainPath,task);if(!src)return toast('Đường dẫn môn học không an toàn hoặc không hợp lệ.');state.lastStudy={subjectId:id,path:s.mainPath};state.activeTask=task;save();window.open(src,'_blank','noopener')},
  openSubjectEditor(id){const s=state.subjects[id];const url=subjectUrl(s?.editorPath);if(url)window.open(url.href,'_blank','noopener');else toast('Đường dẫn dữ liệu môn chưa có hoặc không hợp lệ')},
  closeStudy(){$('studyRoot').innerHTML='';this.home()},
  sortedSubjectsForSlot(slotType){const arr=Object.values(state.subjects).sort((a,b)=>['q1','q2','q3','q4'].indexOf(a.priority)-['q1','q2','q3','q4'].indexOf(b.priority));const pref=arr.filter(s=>slotType==='technical'?isTechnicalSubject(s.id):isMemorizeSubject(s.id));return [...pref,...arr.filter(s=>!pref.includes(s))]},
  scheduleBounds(stage){
    const map={
      prepare:['2026-06-08','2026-10-31'],
      preparatory:['2026-11-02','2027-07-04'],
      bauman:['2027-09-06','2029-06-30'],
      m1:['2027-09-06','2028-01-31'],
      m2:['2028-02-01','2028-06-30'],
      m3:['2028-09-04','2029-01-31'],
      m4:['2029-02-01','2029-06-30']
    };
    const base=map[stage]||map.prepare;
    const from=state.schedule.autoFrom||base[0];
    const to=state.schedule.autoTo||base[1];
    return [from,to];
  },
  defaultStageBounds(stage){
    const map={prepare:['2026-06-08','2026-10-31'],preparatory:['2026-11-02','2027-07-04'],bauman:['2027-09-06','2029-06-30'],m1:['2027-09-06','2028-01-31'],m2:['2028-02-01','2028-06-30'],m3:['2028-09-04','2029-01-31'],m4:['2029-02-01','2029-06-30']};
    return map[stage]||map.prepare;
  },
  isNoStudyDate(dateStr){
    const t=parseDate(dateStr).getTime();
    return t>=parseDate('2026-07-11').getTime() && t<=parseDate('2026-08-04').getTime();
  },
  isEligibleStudyDate(dateStr){
    const [from,to]=this.scheduleBounds(state.schedule.autoStage||'prepare');
    const t=parseDate(dateStr).getTime();
    return t>=parseDate(from).getTime() && t<=parseDate(to).getTime() && !this.isNoStudyDate(dateStr);
  },
  mondayOf(dateStr){
    const d=parseDate(dateStr); const offset=(d.getDay()+6)%7; return iso(addDays(d,-offset));
  },
  stageSubjectIds(stage){
    const ids=[...new Set(DATA.courses.filter(c=>stage==='bauman'?/^m\d/.test(c.stage):c.stage===stage).map(c=>c.subject))];
    if(ids.length)return ids;
    if(stage==='prepare')return ['russian','math','programming','ai','research'];
    if(stage==='preparatory')return ['russian','foundation','math','programming','research'];
    return Object.keys(state.subjects);
  },
  subjectsForAuto(stage,slotType){
    const ids=this.stageSubjectIds(stage);
    let arr=ids.map(id=>state.subjects[id]).filter(Boolean);
    if(slotType==='memorize'){
      const preferred=arr.filter(s=>isMemorizeSubject(s.id));
      arr=preferred.length?preferred:arr;
    }else if(slotType==='technical'){
      const preferred=arr.filter(s=>isTechnicalSubject(s.id));
      arr=preferred.length?preferred:arr;
    }
    return arr.sort((a,b)=>['q1','q2','q3','q4'].indexOf(a.priority)-['q1','q2','q3','q4'].indexOf(b.priority));
  },
  courseOptionsForSubject(subjectId,stage){
    const courses=DATA.courses.filter(c=>c.subject===subjectId && (stage==='bauman'?/^m\d/.test(c.stage):c.stage===stage));
    return courses.length?courses:DATA.courses.filter(c=>c.subject===subjectId).slice(0,8);
  },
  autoSchedule(showToast=true){
    const stage=state.schedule.autoStage||'prepare';
    const [from,to]=this.scheduleBounds(stage);
    state.schedule.entries=Object.fromEntries(Object.entries(state.schedule.entries||{}).filter(([k,e])=>e&&e.source==='manual'));
    let pointer={memorize:0,technical:0};
    const startMonday=this.mondayOf(from);
    state.schedule.weekStart=startMonday;
    for(let w=parseDate(startMonday); w<=parseDate(to); w=addDays(w,7)){
      let studied=[];
      for(let d=0; d<5; d++){
        const day=iso(addDays(w,d));
        if(!this.isEligibleStudyDate(day))continue;
        MAIN_SLOTS.forEach(slot=>{
          const list=this.subjectsForAuto(stage,slot.type);
          const s=list[pointer[slot.type]++ % list.length];
          if(!s)return;
          const courses=this.courseOptionsForSubject(s.id,stage);
          const item=courses[(pointer[slot.type]+d) % Math.max(courses.length,1)];
          state.schedule.entries[day+'|'+slot.id]={subjectId:s.id,itemId:item?.id||'',learningItem:item?.name||item?.vi||'Học theo lộ trình',label:slot.type==='memorize'?'Học thuộc / đọc hiểu':'Tính toán / kỹ thuật',source:'auto'};
          if(!studied.includes(s.id))studied.push(s.id);
        });
      }
      if(studied.length){
        [5,6].forEach((d,dayIndex)=>{
          const day=iso(addDays(w,d));
          if(!this.isEligibleStudyDate(day))return;
          REVIEW_SLOTS.forEach((slot,slotIndex)=>{
            if(d===6 && slot.id==='reviewAfternoon')return;
            const sid=studied[(dayIndex*2+slotIndex)%studied.length];
            const subj=state.subjects[sid];
            if(subj)state.schedule.entries[day+'|'+slot.id]={subjectId:sid,learningItem:'Ôn lại nội dung đã học trong tuần',label:'Ôn tập củng cố',source:'review'};
          })
        })
      }
    }
    save();this.schedule();if(showToast)toast('Đã phân bổ lịch tự động theo giai đoạn và thời gian nghỉ')
  },
  ensureSchedule(){if(Object.keys(state.schedule.entries||{}).length===0)this.autoSchedule(false)},
  scheduleProgress(){
    const stage=state.schedule.autoStage||'prepare';
    const [from,to]=this.scheduleBounds(stage);
    let total=0,filled=0;
    for(let d=parseDate(from); d<=parseDate(to); d=addDays(d,1)){
      const ds=iso(d); if(!this.isEligibleStudyDate(ds))continue;
      const dow=d.getDay();
      if(dow>=1&&dow<=5){MAIN_SLOTS.forEach(slot=>{total++; if(state.schedule.entries[ds+'|'+slot.id])filled++})}
      if(dow===6){REVIEW_SLOTS.forEach(slot=>{total++; if(state.schedule.entries[ds+'|'+slot.id])filled++})}
      if(dow===0){const slot=REVIEW_SLOTS[0]; total++; if(state.schedule.entries[ds+'|'+slot.id])filled++}
    }
    const pct=total?Math.round(filled*100/total):0;
    return {total,filled,pct};
  },
  schedule(){
    const sc=state.schedule;
    const start=parseDate(sc.weekStart);
    const main=sc.view==='main';
    const days=main?[0,1,2,3,4]:[5,6];
    const slots=main?MAIN_SLOTS:REVIEW_SLOTS;
    const tz=sc.timezone==='utc3'?'Nga · UTC+3':'Việt Nam · UTC+7';
    $('page-schedule').innerHTML=`<div class="schedule-page compact-schedule"><div class="schedule-head compact"><div><h2>Thời khóa biểu tuần</h2><p>Múi giờ: <b>${tz}</b>. Auto bám theo <b>${stageShort(sc.autoStage||'prepare')}</b>, áp dụng <b>${esc(sc.autoFrom||'2026-06-08')}</b> → <b>${esc(sc.autoTo||'2026-10-31')}</b>, nghỉ 11/7–4/8/2026.</p></div><div class="schedule-actions"><div class="schedule-settings-wrap"><button class="btn primary" onclick="toggleScheduleSettingsMenu(event)">⚙ Cài đặt</button><div id="scheduleSettingsMenu" class="schedule-settings-menu hidden"><button onclick="startManualScheduleMode()">Thủ công</button><button onclick="showAutoScheduleSettings()">Tự động</button></div></div>${sc.edit?'<button class="btn success" onclick="finishManualScheduleMode()">✓ Đã xong</button>':''}</div></div><div class="schedule-control-line"><div class="schedule-mode-row"><button class="btn ${main?'active':''}" onclick="setScheduleView('main')">Học chính</button><button class="btn ${!main?'active':''}" onclick="setScheduleView('review')">Ôn tập</button></div><div class="week-nav big compact-nav"><button class="btn big" onclick="changeWeek(-1)">‹ Tuần trước</button><b>${iso(start)} – ${iso(addDays(start,6))}</b><button class="btn big" onclick="changeWeek(1)">Tuần sau ›</button></div></div><div class="calendar-wrap tight-calendar"><table class="calendar"><thead><tr><th>Ca học</th>${days.map(d=>`<th>${DAYS[d]}<br><small>${iso(addDays(start,d))}</small></th>`).join('')}</tr></thead><tbody>${slots.map(slot=>`<tr><td class="time-cell">${slot.label}<br><small>${slot.time}</small></td>${days.map(d=>this.slotHTML(iso(addDays(start,d)),slot,d)).join('')}</tr>`).join('')}</tbody></table></div></div>`},
  slotHTML(dateStr,slot,dayIndex){const key=dateStr+'|'+slot.id;const e=state.schedule.entries[key];if(this.isNoStudyDate(dateStr))return `<td><div class="slot-card rest"><b>Nghỉ thăm gia đình</b><small>Không xếp lịch 11/7–4/8/2026</small></div></td>`;if(!this.isEligibleStudyDate(dateStr))return `<td><div class="slot-card muted"><b>Ngoài giai đoạn</b><small>Không xếp lịch tự động</small></div></td>`;if(!e)return `<td><div class="slot-card" onclick="openScheduleSlot('${dateStr}','${slot.id}')">${state.schedule.edit?'＋ Gán ca học':'Trống'}</div></td>`;const s=state.subjects[e.subjectId];const review=e.source==='review';return `<td><div class="slot-card has ${review?'review':''} ${e.source==='manual'?'manual':''}" onclick="openScheduleSlot('${dateStr}','${slot.id}')"><b>${esc(s?.name||'Môn học')}</b><small>${esc(e.learningItem||e.label||'Học theo lịch')}</small><em>${esc(slotTaskMeta(e,slot,dateStr))}</em><span>${esc(e.source==='manual'?'Sửa tay':review?'Ôn tập':'Tự động')}</span></div></td>`},
  openManualScheduleMode(){
    state.schedule.edit=true;save();this.schedule();closeModal();toast('Đã bật sửa tay. Bấm vào từng ca trong thời khóa biểu để chỉnh.')
  },
  openAutoScheduleSettings(){
    const priorityLabels={q1:'Quan trọng & Khẩn cấp',q2:'Quan trọng & Không khẩn cấp',q3:'Không quan trọng & Khẩn cấp',q4:'Không quan trọng & Không khẩn cấp'};
    const stage=state.schedule.autoStage||'prepare';
    const base=this.defaultStageBounds(stage);
    if(!state.schedule.autoFrom)state.schedule.autoFrom=base[0];
    if(!state.schedule.autoTo)state.schedule.autoTo=base[1];
    openModal('Cài đặt lịch tự động',`<div class="schedule-settings-modal auto-mode"><div class="settings-grid"><label>Giai đoạn<select id="scheduleStageSelect" class="field">${['prepare','preparatory','bauman','m1','m2','m3','m4'].map(id=>`<option value="${id}" ${state.schedule.autoStage===id?'selected':''}>${stageShort(id)} · ${esc(stageLabel(id))}</option>`).join('')}</select></label><label>Múi giờ<select id="scheduleTzSelect" class="field"><option value="utc7" ${state.schedule.timezone==='utc7'?'selected':''}>Việt Nam · UTC+7</option><option value="utc3" ${state.schedule.timezone==='utc3'?'selected':''}>Nga · UTC+3</option></select></label></div><div class="auto-range-box"><div><b>Giai đoạn auto</b><p>Chọn ngày bắt đầu/kết thúc áp dụng. Có thể dùng nhanh toàn giai đoạn hoặc tuần đang xem.</p></div><div class="settings-grid"><label>Từ ngày<input id="autoFromInput" class="field" type="date" value="${esc(state.schedule.autoFrom||base[0])}"></label><label>Đến ngày<input id="autoToInput" class="field" type="date" value="${esc(state.schedule.autoTo||base[1])}"></label></div><div class="tools"><button class="btn sm" onclick="useFullStageRange()">Dùng toàn giai đoạn</button><button class="btn sm" onclick="useCurrentWeekRange()">Dùng tuần đang xem</button></div><div class="settings-grid"><label>Số câu kiểm tra kết thúc<input id="targetQuestionsInput" class="field" type="number" min="20" max="300" value="${esc(state.schedule.targetQuestions||FINAL_TARGET_QUESTIONS)}"></label><label>Điểm mục tiêu (%)<input id="targetScoreInput" class="field" type="number" min="50" max="100" value="${esc(state.schedule.targetScore||DEFAULT_TARGET_SCORE)}"></label></div></div><div class="auto-subjects-head"><h3>Môn học trong giai đoạn</h3><p>Click môn để chuyển khu ưu tiên. Kéo thả cũng được nếu trình duyệt hỗ trợ.</p></div><div class="priority-board">${['q1','q2','q3','q4'].map(q=>`<section class="priority-drop" data-priority-zone="${q}"><h4>${priorityLabels[q]}</h4><div class="priority-drop-list">${this.priorityCards(q,stage)}</div></section>`).join('')}</div><p class="setting-note">Auto xếp kín Thứ 2–Thứ 6; Thứ 7 và sáng Chủ nhật là ôn tập. Môn học thuộc/quan trọng ưu tiên ca sáng, môn tính toán/kỹ thuật ưu tiên ca chiều. Khoảng 11/7–4/8/2026 để trống.</p><div class="modal-actions"><button class="btn" data-action="close-modal">Hủy</button><button class="btn primary" data-action="auto-schedule">⚡ Auto xếp lịch</button></div></div>`,true);
    this.bindAutoSettingsModal();
  },
  priorityCards(q,stage){
    const ids=new Set(this.stageSubjectIds(stage));
    const items=Object.values(state.subjects).filter(s=>ids.has(s.id)&&s.priority===q);
    return items.map(s=>`<button class="priority-card" draggable="true" data-subject-id="${s.id}" onclick="cyclePriority('${s.id}')"><span>${esc(s.icon)}</span><b>${esc(s.name)}</b></button>`).join('')||'<small>Chưa có môn</small>'
  },
  refreshPriorityBoard(){
    const wrap=$('modalRoot').querySelector('.priority-board');
    if(!wrap)return;
    const stage=$('scheduleStageSelect')?.value||state.schedule.autoStage||'prepare';
    const priorityLabels={q1:'Quan trọng & Khẩn cấp',q2:'Quan trọng & Không khẩn cấp',q3:'Không quan trọng & Khẩn cấp',q4:'Không quan trọng & Không khẩn cấp'};
    wrap.innerHTML=['q1','q2','q3','q4'].map(q=>`<section class="priority-drop" data-priority-zone="${q}"><h4>${priorityLabels[q]}</h4><div class="priority-drop-list">${this.priorityCards(q,stage)}</div></section>`).join('');
    this.bindPriorityDrag();
  },
  bindAutoSettingsModal(){
    const stageSel=$('scheduleStageSelect'), tzSel=$('scheduleTzSelect');
    stageSel.addEventListener('change',e=>{const b=this.defaultStageBounds(e.target.value);$('autoFromInput').value=b[0];$('autoToInput').value=b[1];state.schedule.autoStage=e.target.value;save();this.refreshPriorityBoard()});
    tzSel.addEventListener('change',e=>{state.schedule.timezone=e.target.value;save();this.schedule()});
    this.bindPriorityDrag();
  },
  bindPriorityDrag(){
    let dragged=null;
    $('modalRoot').querySelectorAll('.priority-card').forEach(card=>{
      card.addEventListener('dragstart',e=>{dragged=card.dataset.subjectId;e.dataTransfer.effectAllowed='move'});
    });
    $('modalRoot').querySelectorAll('.priority-drop').forEach(zone=>{
      zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('drag-over')});
      zone.addEventListener('dragleave',()=>zone.classList.remove('drag-over'));
      zone.addEventListener('drop',e=>{e.preventDefault();zone.classList.remove('drag-over');if(dragged){state.subjects[dragged].priority=zone.dataset.priorityZone;save();this.refreshPriorityBoard();toast('Đã đổi khu ưu tiên môn học')}});
    });
  },
  research(){
    const id=state.researchTopic||'ugv';
    const topic=RESEARCH_TOPICS[id];
    const keys=['questions','data','hardware','outputs','risks','tasks'];
    const cards=keys.map(k=>this.researchCardHTML(id,k,topic[k]||[])).join('');
    $('page-research').innerHTML=`<div class="canva-research-page"><section class="canva-research-hero panel"><div><span class="pill purple">НИР · ВКР</span><h2>${esc(topic.title)}</h2><p>${esc(topic.short)}</p></div><div class="research-tabs canva-research-tabs">${Object.entries(RESEARCH_TOPICS).map(([key,t])=>`<button class="btn ${id===key?'active':''}" onclick="selectResearch('${key}')">${esc(t.title.split('·')[0].trim())}</button>`).join('')}</div></section><div class="research-grid rich-research canva-research-grid">${cards}</div><div class="research-card research-roadmap timeline-panel canva-timeline-panel"><div class="section-head"><div><h2>Timeline НИР → ВКР</h2><p>Chia mốc nghiên cứu để không bị loãng giữa học phần, dữ liệu và phần cứng.</p></div></div><div class="timeline-list">${topic.roadmap.map((r,i)=>`<div class="timeline-row"><span>${i+1}</span><div><b>${esc(r[0])}</b><p>${esc(r[1])}</p></div></div>`).join('')}</div></div></div>`
  },
  researchCardHTML(topicId,key,items){
    const total=items.length||1;
    const done=items.filter((_,i)=>state.researchChecks?.[`${topicId}.${key}.${i}`]).length;
    const pct=Math.round(done*100/total);
    return `<div class="research-card"><div class="research-card-head"><div><h3>${RESEARCH_LABELS[key]}</h3><small>${done}/${items.length} hoàn thành</small></div><div class="mini-progress"><span style="width:${pct}%"></span></div></div><ul class="research-check-list">${items.map((x,i)=>this.researchItemHTML(topicId,key,i,x)).join('')}</ul></div>`
  },
  researchItemHTML(topicId,key,i,text){
    const itemId=`${topicId}.${key}.${i}`;
    const checked=!!state.researchChecks?.[itemId];
    const files=state.researchFiles?.[itemId]||[];
    return `<li class="research-check-item"><label><input type="checkbox" ${checked?'checked':''} onchange="toggleResearchCheck('${itemId}',this.checked)"><span>${esc(text)}</span></label><div class="research-file-tools"><button class="btn sm" onclick="attachResearchFile('${itemId}')">＋ Đính kèm</button><input type="file" id="file_${itemId.replace(/[^a-zA-Z0-9_-]/g,'_')}" class="hidden" accept=".json,.html,.htm,video/*,application/json,text/html" onchange="handleResearchFile(this,'${itemId}')">${files.map((f,idx)=>`<button class="file-pill" onclick="openResearchFile('${itemId}',${idx})">${esc(f.typeLabel||f.name)}</button>`).join('')}</div></li>`
  },
  admin(){if(!auth.isAdmin())return;const users=readUsers();$('page-admin').innerHTML=`<div class="section-head"><div><h2>Quản trị</h2><p>Thêm người học và chỉnh đường dẫn môn học.</p></div></div><div class="admin-grid"><div class="panel"><h3>Tạo tài khoản người học</h3><input id="newUserName" class="field" placeholder="Tên" style="width:100%;margin-bottom:8px"><input id="newUserEmail" class="field" placeholder="Email" style="width:100%;margin-bottom:8px"><input id="newUserPass" class="field" placeholder="Mật khẩu" style="width:100%;margin-bottom:8px"><button class="btn primary" data-action="save-user">Thêm người học</button><div class="course-list" style="margin-top:12px">${users.map(u=>`<div class="course"><b>${esc(u.name)}</b><p>${esc(u.email)} · ${esc(u.role)}</p></div>`).join('')}</div></div><div class="panel"><h3>Đường dẫn môn học</h3>${Object.values(state.subjects).map(s=>`<div class="course"><b>${esc(s.name)}</b><input class="field" value="${esc(s.mainPath||'')}" onchange="state.subjects['${s.id}'].mainPath=this.value;save()" style="width:100%;margin-top:7px" placeholder="subjects/.../index.html"><input class="field" value="${esc(s.editorPath||'')}" onchange="state.subjects['${s.id}'].editorPath=this.value;save()" style="width:100%;margin-top:7px" placeholder="subjects/.../editor.html"></div>`).join('')}</div></div>`},
  async saveUser(){const name=$('newUserName').value.trim(),email=$('newUserEmail').value.trim().toLowerCase(),password=$('newUserPass').value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return toast('Cần email hợp lệ');if(password.length<8)return toast('Mật khẩu cần ít nhất 8 ký tự');const users=readUsers();if(users.some(u=>String(u.email).toLowerCase()===email))return toast('Email đã tồn tại');users.push({name:name||email,email,...await passwordRecord(password),role:'user'});saveUsers(users);this.admin();toast('Đã thêm người học')},
  exportBackup(){const blob=new Blob([JSON.stringify({state,users:readUsers()},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='bauman_main_backup.json';a.click();URL.revokeObjectURL(a.href);closeProfileMenu()},
  importBackup(file){if(!file)return;const r=new FileReader();r.onload=()=>{try{const data=JSON.parse(r.result);if(data.state){state=normalizeState(data.state);localStorage.setItem(KEY,JSON.stringify(state))}if(data.users)saveUsers(data.users);toast('Đã khôi phục');location.reload()}catch{toast('File sao lưu không hợp lệ')}};r.readAsText(file)}
};
const RESEARCH_LABELS={questions:'Câu hỏi nghiên cứu',data:'Dữ liệu cần thu',hardware:'Linh kiện / phần cứng',outputs:'Đầu ra mong muốn',risks:'Rủi ro cần kiểm soát',tasks:'Việc nên làm ngay'};
const RESEARCH_TOPICS={
  ugv:{title:'UGV tự hành · Cảm nhận và điều hướng thông minh',short:'Trục chính của ВКР: linh kiện dễ mua, thử nghiệm trong nhà thuận, đủ gắn AI + АСОИУ + dữ liệu thật.',questions:['UGV nhận biết vật cản và vùng đi được bằng camera/cảm biến như thế nào?','Mô hình AI nào đủ nhẹ để chạy trên thiết bị nhúng?','Đánh giá an toàn điều hướng bằng metric nào?'],data:['Ảnh camera trước/sau xử lý','Log vận tốc, encoder, IMU, khoảng cách vật cản','Nhãn vật cản, lối đi, vùng nguy hiểm'],hardware:['Khung UGV 4 bánh hoặc tracked chassis','Raspberry Pi/Jetson Nano, camera, IMU, ultrasonic/LiDAR mini','Pin, motor driver, encoder'],outputs:['Demo UGV chạy tuyến ngắn','Bảng metric accuracy, latency, collision rate','Chương luận văn kiến trúc АСОИУ + AI perception'],risks:['Dữ liệu thực nghiệm chưa ổn định','Mô hình nặng cho phần cứng','Ánh sáng môi trường thay đổi'],tasks:['Tạo repo research/ugv','Lập bảng paper theo problem-method-data-metric','Dựng log CSV mẫu','Tạo baseline nhận dạng vật cản'],roadmap:[['HK1','Khảo sát tài liệu, chọn supervisor, xác định câu hỏi'],['HK2','Proposal v1, baseline model, dữ liệu mẫu'],['HK3','Thực nghiệm chính, bảng metric, phân tích lỗi'],['HK4','Khóa dữ liệu, viết và bảo vệ']]},
  telemetry:{title:'Telemetry & phát hiện bất thường',short:'Rất hợp với chuỗi thời gian, độ tin cậy hệ thống và dữ liệu cảm biến.',questions:['Dấu hiệu bất thường xuất hiện trước lỗi bao lâu?','Mô hình time-series nào phù hợp với dữ liệu ít?','Kết hợp anomaly detection với cảnh báo vận hành ra sao?'],data:['IMU, pin, dòng motor, nhiệt độ','Log lỗi, mất tín hiệu, rung lắc','Nhãn bình thường, nghi ngờ, lỗi'],hardware:['UGV/USV có telemetry','Module đo dòng, điện áp, IMU','Logger CSV/JSON'],outputs:['Bộ dữ liệu telemetry sạch','Model phát hiện bất thường','Dashboard cảnh báo reliability'],risks:['Dữ liệu lỗi thật ít','Khó gán nhãn bất thường','Nhiễu cảm biến gây báo giả'],tasks:['Tạo cấu trúc log telemetry','Mô phỏng dữ liệu lỗi nhẹ','Thử moving average, isolation forest, LSTM nhỏ','Liên kết với môn Time Series'],roadmap:[['HK1','Thiết kế schema telemetry'],['HK2','Baseline anomaly detection'],['HK3','Thực nghiệm và reliability report'],['HK4','Đóng gói dashboard và chương thesis']]},
  usv:{title:'USV giám sát mặt nước bằng AI',short:'Nhánh mở rộng từ UGV: chỉ triển khai khi có dữ liệu, chống nước và môi trường thử nghiệm an toàn.',questions:['Dữ liệu mặt nước khác gì mặt đất?','AI phát hiện vật cản/nhiễu trên mặt nước ra sao?','Telemetry GPS/IMU ảnh hưởng điều hướng thế nào?'],data:['GPS track, IMU, tốc độ, heading','Ảnh mặt nước, vật cản, bờ, sóng','Log điều khiển motor trái/phải'],hardware:['Thân USV nhỏ, ESC, motor chống nước','GPS, IMU, camera, telemetry radio','Hộp chống nước và nguồn ổn định'],outputs:['Mô hình chuyển giao UGV → USV','So sánh môi trường đất/nước','Đề xuất hướng sau luận văn'],risks:['Khó thử nghiệm an toàn','Linh kiện chống nước phức tạp','Nhiễu GPS và thời tiết'],tasks:['Giữ USV là nhánh phụ','Tận dụng pipeline UGV','Thu ít dữ liệu minh họa','Viết phần future work rõ ràng'],roadmap:[['HK1','Khảo sát khả năng chuyển giao'],['HK2','Thiết kế pipeline chung'],['HK3','Thử nghiệm mô phỏng/nhỏ'],['HK4','Đưa vào phần mở rộng luận văn']]}
};

function courseById(id){return DATA.courses.find(c=>c.id===id)||null}
function entryCourse(e){return courseById(e?.itemId)||DATA.courses.find(c=>c.subject===e?.subjectId&&c.name===e?.learningItem)||null}
function allEntriesForSubject(subjectId){return Object.entries(state.schedule.entries||{}).map(([key,e])=>{const [date,slotId]=key.split('|');return {...e,date,slotId,key};}).filter(e=>e.subjectId===subjectId).sort((a,b)=>(a.date+a.slotId).localeCompare(b.date+b.slotId))}
function findBestLearningTask(subjectId){const entries=allEntriesForSubject(subjectId);if(!entries.length)return null;const today=todayISO();return entries.find(e=>e.date>=today)||entries.at(-1)}
function latestSubjectReport(subjectId){const arr=state.subjectReports?.[subjectId]||[];return arr[arr.length-1]||null}
function estimateCourseEndDate(subjectId,courseId,startDate){const c=courseById(courseId);const needed=parseHoursValue(c?.hours);if(!needed)return state.schedule.autoTo||startDate;let sum=0,last=startDate;for(const e of allEntriesForSubject(subjectId)){if(e.date<startDate)continue;const slot=[...MAIN_SLOTS,...REVIEW_SLOTS].find(x=>x.id===e.slotId);sum+=slotDurationMinutes(slot)/60;last=e.date;if(sum>=needed)return last;}return state.schedule.autoTo||last||startDate}
function slotTaskMeta(e,slot,dateStr){const minutes=e.durationMinutes||slotDurationMinutes(slot);const end=e.plannedEndDate||estimateCourseEndDate(e.subjectId,e.itemId,dateStr);return `${minutes} phút · kết thúc dự kiến ${end}`}
function compactSubjectRoute(route={}){
 const view=String(route?.view||'').slice(0,32),learnTab=String(route?.learnTab||'').slice(0,32),lessonId=String(route?.lessonId||'').slice(0,80);
 if(!view||!lessonId)return null;
 return {view,learnTab,lessonId};
}
function capabilityGapContext(subjectId){
 const cap=state.subjectCapabilities?.[subjectId],route=compactSubjectRoute(cap?.nextGap?.route);
 if(!route)return null;
 return {capabilityRoute:route,capabilityBand:String(cap?.currentBand?.id||'').slice(0,16),capabilityLesson:route.lessonId};
}
function capabilityContinueContext(subjectId){
 const cap=state.subjectCapabilities?.[subjectId];
 if(!cap||subjectId!=='russian')return null;
 const reviewDue=Math.max(Number(cap?.currentBand?.reviewDue||0),Number(cap?.stageExit?.reviewDue||0));
 if(reviewDue>0)return null;
 return capabilityGapContext(subjectId);
}
function buildLearningTask(subjectId,context={}){const taskEntry=context.date&&context.slotId?{...state.schedule.entries[context.date+'|'+context.slotId],date:context.date,slotId:context.slotId}:findBestLearningTask(subjectId);const s=state.subjects[subjectId]||{};const slot=[...MAIN_SLOTS,...REVIEW_SLOTS].find(x=>x.id===(taskEntry?.slotId||context.slotId))||MAIN_SLOTS[0];const course=entryCourse(taskEntry)||courseById(taskEntry?.itemId)||null;const date=taskEntry?.date||todayISO();const duration=taskEntry?.durationMinutes||slotDurationMinutes(slot);const capabilityRoute=compactSubjectRoute(context.capabilityRoute);const task={type:BRIDGE_TYPES.task,taskId:[subjectId,taskEntry?.itemId||'general',date,taskEntry?.slotId||slot.id].join('::'),subjectId,subjectName:s.name||subjectId,courseId:taskEntry?.itemId||course?.id||'',courseName:course?.name||taskEntry?.learningItem||'Học theo lịch',learningItem:taskEntry?.learningItem||course?.name||'Học theo lịch',stage:course?.stage||state.schedule.autoStage||state.subjectStage||'prepare',date,slotId:taskEntry?.slotId||slot.id,slotLabel:slot.label,durationMinutes:duration,plannedEndDate:taskEntry?.plannedEndDate||estimateCourseEndDate(subjectId,taskEntry?.itemId||course?.id,date),targetQuestions:Number(state.schedule.targetQuestions)||FINAL_TARGET_QUESTIONS,targetScore:Number(state.schedule.targetScore)||DEFAULT_TARGET_SCORE,source:capabilityRoute?'capability-gap':'bauman-main',...(capabilityRoute?{capabilityRoute,capabilityBand:String(context.capabilityBand||'').slice(0,16),capabilityLesson:capabilityRoute.lessonId}:{})};return task}
function subjectUrl(path){try{const url=new URL(String(path||''),location.href);if(!['http:','https:'].includes(url.protocol)||url.username||url.password)return null;return url}catch{return null}}
function withTaskQuery(path,task){const url=subjectUrl(path);if(!url)return '';const route=compactSubjectRoute(task.capabilityRoute);const fields={host:'main',hostOrigin:location.origin,subjectId:task.subjectId||'',courseId:task.courseId||'',taskId:task.taskId||task.missionId||'',missionId:task.missionId||task.taskId||'',stage:task.stage||'',learningItem:task.learningItem||task.target||'',durationMinutes:task.durationMinutes||'',targetQuestions:task.targetQuestions||FINAL_TARGET_QUESTIONS,targetScore:task.targetScore||DEFAULT_TARGET_SCORE,protocol:'planning-v3',...(route?{routeView:route.view,routeTab:route.learnTab,routeLesson:route.lessonId,capabilityBand:task.capabilityBand||''}:{})};Object.entries(fields).forEach(([key,value])=>url.searchParams.set(key,String(value)));return url.href}
function activeSubjectFrame(){return $('subjectFrame')}
function trustedSubjectEvent(event){const frame=activeSubjectFrame();if(!frame||event.source!==frame.contentWindow)return false;const url=subjectUrl(frame.src);return !!url&&event.origin===url.origin}
function sendTaskToSubject(win,task){const frame=activeSubjectFrame();const url=frame&&subjectUrl(frame.src);if(!frame||frame.contentWindow!==win||!url)return false;try{win.postMessage(task,url.origin);return true}catch(err){console.warn('Không gửi được nhiệm vụ sang môn',err);return false}}
function sendCapabilityRequestToSubject(win,subjectId){const frame=activeSubjectFrame();const url=frame&&subjectUrl(frame.src);if(!frame||frame.contentWindow!==win||!url)return false;try{win.postMessage({type:BRIDGE_TYPES.capabilityRequest,subjectId:subjectId||state.activeTask?.subjectId||''},url.origin);return true}catch(err){console.warn('Không yêu cầu được capability state từ môn',err);return false}}
function normalizeSubjectCapability(msg={}){
 const subjectId=String(msg.subjectId||state.activeTask?.subjectId||'').trim();
 const band=msg.currentBand&&typeof msg.currentBand==='object'?msg.currentBand:null;
 const gap=msg.nextGap&&typeof msg.nextGap==='object'?msg.nextGap:null;
 const exit=msg.stageExit&&typeof msg.stageExit==='object'?msg.stageExit:null;
 const bands=Array.isArray(msg.bands)?msg.bands.slice(0,8).map(x=>({id:String(x?.id||''),unlocked:!!x?.unlocked,complete:!!x?.complete,lessonReady:Number(x?.lessonReady||0),lessonTotal:Number(x?.lessonTotal||0),reviewDue:Number(x?.reviewDue||0)})).filter(x=>x.id):[];
 return {
  schema:String(msg.schema||''),
  subjectId,
  receivedAt:new Date().toISOString(),
  currentBand:band?{id:String(band.id||''),title:String(band.title||''),complete:!!band.complete,lessonReady:Number(band.lessonReady||0),lessonTotal:Number(band.lessonTotal||0),reviewDue:Number(band.reviewDue||0),writing:Number(band.writing||0),writingNeed:Number(band.writingNeed||0),rewrites:Number(band.rewrites||0),rewriteNeed:Number(band.rewriteNeed||0)}:null,
  nextGap:gap?{lessonId:String(gap.lessonId||''),route:{view:String(gap.route?.view||''),learnTab:String(gap.route?.learnTab||''),lessonId:String(gap.route?.lessonId||gap.lessonId||'')}}:null,
  stageExit:exit?{stage:String(exit.stage||''),allowed:!!exit.allowed,lessonReady:Number(exit.lessonReady||0),lessonTotal:Number(exit.lessonTotal||0),reviewDue:Number(exit.reviewDue||0),writing:Number(exit.writing||0),rewrites:Number(exit.rewrites||0),blocker:String(exit.blocker||'')}:null,
  bands
 };
}
function receiveSubjectCapability(msg={}){
 const normalized=normalizeSubjectCapability(msg),subjectId=normalized.subjectId;
 if(!subjectId||!state.subjects[subjectId]||normalized.schema!=='RUSSIAN_CAPABILITY_BRIDGE_V1')return false;
 state.subjectCapabilities[subjectId]=normalized;
 save();
 app.home();
 window.BAUMAN_HUB_SAFE?.refresh?.();
 return true;
}
function normalizeSubjectRouteReceipt(msg={}){
 const route=compactSubjectRoute(msg.route),subjectId=String(msg.subjectId||'').trim();
 return {
  schema:String(msg.schema||''),
  subjectId,
  taskId:String(msg.taskId||msg.missionId||'').slice(0,180),
  capabilityBand:String(msg.capabilityBand||'').slice(0,16),
  route,
  stage:String(msg.stage||'').slice(0,32),
  receivedAt:new Date().toISOString()
 };
}
function receiveSubjectRouteReceipt(msg={}){
 const receipt=normalizeSubjectRouteReceipt(msg),task=state.activeTask||{},expected=compactSubjectRoute(task.capabilityRoute);
 const activeTaskId=String(task.taskId||task.missionId||'');
 if(receipt.schema!=='RUSSIAN_CAPABILITY_ROUTE_RECEIPT_V1'||!receipt.subjectId||!state.subjects[receipt.subjectId]||!receipt.route||!expected)return false;
 if(task.subjectId!==receipt.subjectId||task.source!=='capability-gap'||!activeTaskId||receipt.taskId!==activeTaskId)return false;
 if(receipt.route.view!==expected.view||receipt.route.learnTab!==expected.learnTab||receipt.route.lessonId!==expected.lessonId)return false;
 state.subjectRouteReceipts[receipt.subjectId]=receipt;
 save();
 app.home();
 window.BAUMAN_HUB_SAFE?.refresh?.();
 return true;
}
function handleSubjectBridgeMessage(event){if(!trustedSubjectEvent(event))return;const msg=event.data||{};if(!msg||typeof msg!=='object')return;const readyTypes=[BRIDGE_TYPES.ready,'BAUMAN_CHILD_READY'];const progressTypes=[BRIDGE_TYPES.progress,'BAUMAN_PROGRESS_REPORT','SUBJECT_FEEDBACK'];const activeSubjectId=state.activeTask?.subjectId||msg.subjectId||'';if(readyTypes.includes(msg.type)){if(state.activeTask)sendTaskToSubject(event.source,state.activeTask);sendCapabilityRequestToSubject(event.source,activeSubjectId);return}if(msg.type===BRIDGE_TYPES.capability){if(msg.subjectId&&activeSubjectId&&msg.subjectId!==activeSubjectId)return;receiveSubjectCapability({...msg,subjectId:msg.subjectId||activeSubjectId});return}if(msg.type===BRIDGE_TYPES.capabilityRouteReceipt){receiveSubjectRouteReceipt(msg);return}if(progressTypes.includes(msg.type)){if(msg.subjectId&&activeSubjectId&&msg.subjectId!==activeSubjectId)return;receiveSubjectProgress({...msg,subjectId:msg.subjectId||activeSubjectId})}}
function receiveSubjectProgress(report){const subjectId=report.subjectId||report.subject||state.activeTask?.subjectId;if(!subjectId||!state.subjects[subjectId])return;const normalized={...report,subjectId,receivedAt:new Date().toISOString(),targetQuestions:Number(report.targetQuestions||state.schedule.targetQuestions||FINAL_TARGET_QUESTIONS),targetScore:Number(report.targetScore||state.schedule.targetScore||DEFAULT_TARGET_SCORE)};normalized.total=Number(normalized.total||normalized.questions||normalized.answered||0);normalized.correct=Number(normalized.correct||0);normalized.percent=Number(normalized.percent??normalized.progress??progressPct(normalized.correct,normalized.total));normalized.completed=!!normalized.completed || (normalized.total>=normalized.targetQuestions && normalized.percent>=normalized.targetScore);state.subjectReports[subjectId]=[...(state.subjectReports[subjectId]||[]),normalized].slice(-60);state.progress[subjectId]=normalized.completed?100:Math.max(Number(state.progress[subjectId]||0),Math.min(99,Math.round((normalized.total/normalized.targetQuestions)*60 + (normalized.percent/100)*39)));if(normalized.completed)markSubjectCourseComplete(subjectId,normalized);else scheduleAdaptiveReviews(normalized);state.activity.unshift({time:normalized.receivedAt,subjectId,text:`${subjectName(subjectId)} phản hồi ${normalized.percent}% (${normalized.correct}/${normalized.total})`});state.activity=state.activity.slice(0,80);save();app.home();app.schedule();toast(normalized.completed?'Đã hoàn thành mục tiêu kiểm tra 100 câu':'Đã nhận phản hồi và tự điều chỉnh ôn tập')}
function markSubjectCourseComplete(subjectId,report){for(const [key,e] of Object.entries(state.schedule.entries||{})){if(e.subjectId===subjectId&&(e.itemId===report.courseId||!report.courseId)){e.status='completed';e.completedAt=report.receivedAt;}}
}
function scheduleAdaptiveReviews(report){const poor=Number(report.percent||0)<Number(report.targetScore||DEFAULT_TARGET_SCORE);const offsets=poor?[0,1,2,3,7]:[1,3,7,14];const subjectId=report.subjectId;const base=todayISO();offsets.forEach((off,i)=>{const day=iso(addDays(parseDate(base),off));const target=findReviewSlot(day,poor);if(!target)return;const key=target.date+'|'+target.slot.id;if(state.schedule.entries[key])return;state.schedule.entries[key]={subjectId,itemId:report.courseId||'',learningItem:poor?'Ôn tăng cường do kết quả còn yếu':'Ôn ghi nhớ gián đoạn',label:poor?'Ôn tập tăng cường':'Ôn tập gián đoạn',source:poor?'adaptive-review':'spaced-review',durationMinutes:slotDurationMinutes(target.slot),plannedEndDate:target.date,fromReportAt:report.receivedAt,reviewIndex:i+1};});}
function findReviewSlot(startDate,forceWeekend=false){for(let offset=0;offset<21;offset++){const ds=iso(addDays(parseDate(startDate),offset));if(!app.isEligibleStudyDate(ds))continue;const dow=parseDate(ds).getDay();if(forceWeekend&&dow!==6&&dow!==0)continue;const slots=dow===6?REVIEW_SLOTS:(dow===0?[REVIEW_SLOTS[0]]:(!forceWeekend?REVIEW_SLOTS:[]));for(const slot of slots){if(!state.schedule.entries[ds+'|'+slot.id])return {date:ds,slot};}}return null}

const mentor={open(){$('aiRoot').innerHTML=`<aside class="ai-panel canva-ai-panel"><div class="ai-head canva-ai-head"><div><h2>✨ Trợ lý AI</h2><small>Tìm môn, lộ trình, lịch và luận văn</small></div><button class="btn sm" onclick="mentor.close()">Đóng</button></div><div class="ai-body canva-ai-body" id="aiLog"><div class="bubble">Bạn muốn tìm môn, giai đoạn hay đề tài НИР nào?</div></div><div class="ai-compose canva-ai-compose"><input id="aiInput" class="field" placeholder="Ví dụ: UGV, Python, lịch tuần"><button class="btn primary" onclick="mentor.send()">Gửi</button></div></aside>`;$('aiInput').addEventListener('keydown',e=>{if(e.key==='Enter')mentor.send()})},close(){$('aiRoot').innerHTML=''},send(){const q=$('aiInput').value.trim();if(!q)return;const res=this.search(q);$('aiLog').innerHTML+=`<div class="bubble user">${esc(q)}</div><div class="bubble">${res}</div>`;$('aiInput').value='';$('aiLog').scrollTop=$('aiLog').scrollHeight},search(q){const t=q.toLowerCase();const subj=Object.values(state.subjects).find(s=>(s.name+' '+s.desc+' '+s.main).toLowerCase().includes(t));if(subj)return `Tìm thấy trong môn <b>${esc(subj.name)}</b>. <button class="btn sm primary" onclick="mentor.close();pickSubject('${subj.id}');app.page('subjects')">Mở môn</button>`;const topic=Object.entries(RESEARCH_TOPICS).find(([id,x])=>(id+' '+x.title+' '+x.short).toLowerCase().includes(t));if(topic)return `Nội dung này thuộc <b>${esc(topic[1].title)}</b>. <button class="btn sm primary" onclick="mentor.close();selectResearch('${topic[0]}');app.page('research')">Mở luận văn</button>`;if(t.includes('lịch'))return `Vào Lịch học, bấm <b>Cài đặt</b>, sau đó chọn <b>Tự động</b> và bấm <b>Auto xếp lịch</b>. <button class="btn sm primary" onclick="mentor.close();app.page('schedule')">Mở lịch</button>`;return 'Chưa tìm thấy kết quả rõ ràng. Hãy thử tên môn, giai đoạn hoặc đề tài như UGV, telemetry, tiếng Nga, Python.'}};
function setHomePanel(mode){state.homePanel=mode;save();app.openHomeFrame(mode)}function showHomeFrame(mode){app.openHomeFrame(mode)}function selectRoadmapStage(id){state.roadmapStage=id;save();app.roadmap()}function pickSubject(id){state.subject=id;save();app.subjects()}function setSubjectStage(id){state.subjectStage=id;const list=app.filteredSubjectsForStage?app.filteredSubjectsForStage(id):Object.values(state.subjects);if(!list.some(s=>s.id===state.subject))state.subject=list[0]?.id||'russian';save();app.subjects()}function setScheduleView(v){state.schedule.view=v;save();app.schedule()}function changeWeek(n){state.schedule.weekStart=iso(addDays(parseDate(state.schedule.weekStart),n*7));save();app.schedule()}function learningOptionsHTML(subjectId){const courses=app.courseOptionsForSubject(subjectId,state.schedule.autoStage||'prepare');return courses.map(c=>`<option value="${esc(c.id)}">${esc(c.name||c.vi)}</option>`).join('')||'<option value="">Học theo lộ trình</option>'}
function editScheduleSlot(date,slot){
  if(!state.schedule.edit)return toast('Bấm Cài đặt → Thủ công để bật sửa lịch');
  const current=state.schedule.entries[date+'|'+slot]||{};
  const opts=Object.values(state.subjects).map(s=>`<option value="${s.id}" ${current.subjectId===s.id?'selected':''}>${esc(s.name)}</option>`).join('');
  openModal('Sửa ca học',`<div class="manual-schedule-form"><label>Môn học<select id="slotSubject" class="field" onchange="document.getElementById('slotItem').innerHTML=learningOptionsHTML(this.value)">${opts}</select></label><label>Sự kiện<select id="slotEvent" class="field"><option value="study">Học bình thường</option><option value="busy">Có việc bận · tự dời ngày/cuối tuần</option><option value="badtime">Thời gian không hợp lý · tự chỉnh lại</option></select></label><label>Áp dụng<select id="slotApply" class="field"><option value="1">1 tuần</option><option value="2">2 tuần</option><option value="3">3 tuần</option><option value="4">4 tuần</option></select></label><label>Mục học<select id="slotItem" class="field">${learningOptionsHTML(current.subjectId||Object.keys(state.subjects)[0])}</select></label><label class="wide">Ghi chú<input id="slotLabel" class="field" value="${esc(current.label||'Học theo lịch')}"></label></div><div class="tools" style="margin-top:14px"><button class="btn primary" onclick="saveScheduleSlot('${date}','${slot}')">Lưu & áp dụng</button><button class="btn" data-action="close-modal">Hủy</button></div>`,true);
  if(current.itemId)$('slotItem').value=current.itemId;
}
function findNextFreeSlot(fromDate,subjectId,preferReview=false){
  for(let offset=0; offset<45; offset++){
    const d=addDays(parseDate(fromDate),offset); const ds=iso(d); if(!app.isEligibleStudyDate(ds))continue;
    const dow=d.getDay();
    const slots=(dow>=1&&dow<=5)?MAIN_SLOTS:(dow===6?REVIEW_SLOTS:(dow===0?[REVIEW_SLOTS[0]]:[]));
    for(const slot of slots){
      const key=ds+'|'+slot.id; if(!state.schedule.entries[key])return {date:ds,slot:slot.id};
    }
  }
  return null;
}
function saveScheduleSlot(date,slot){
  const subjectId=$('slotSubject').value, event=$('slotEvent').value, weeks=Number($('slotApply').value)||1, itemId=$('slotItem').value, itemText=$('slotItem').selectedOptions[0]?.textContent||'Học theo lộ trình', label=$('slotLabel').value||'Học theo lịch';
  for(let i=0;i<weeks;i++){
    const ds=iso(addDays(parseDate(date),i*7));
    if(event==='busy'){
      const key=ds+'|'+slot; delete state.schedule.entries[key];
      const target=findNextFreeSlot(ds,subjectId,true);
      if(target)state.schedule.entries[target.date+'|'+target.slot]={subjectId,itemId,learningItem:itemText,label:'Dời lịch do có việc bận',source:'manual'};
    }else if(event==='badtime'){
      const subj=state.subjects[subjectId]; const desired=isMemorizeSubject(subjectId)?'morning1':isTechnicalSubject(subjectId)?'afternoon':slot;
      const targetSlot=MAIN_SLOTS.find(s=>s.id===desired)?.id||slot;
      state.schedule.entries[ds+'|'+targetSlot]={subjectId,itemId,learningItem:itemText,label:'Tự chỉnh thời gian hợp lý',source:'manual'};
      if(targetSlot!==slot)delete state.schedule.entries[ds+'|'+slot];
    }else{
      state.schedule.entries[ds+'|'+slot]={subjectId,itemId,learningItem:itemText,label,source:'manual'};
    }
  }
  closeModal();save();app.schedule();toast('Đã cập nhật lịch thủ công')
}
function openScheduleSlot(date,slot){const e=state.schedule.entries[date+'|'+slot];if(!e)return editScheduleSlot(date,slot);if(state.schedule.edit)return editScheduleSlot(date,slot);if(e.subjectId){pickSubject(e.subjectId);app.openSubjectInPage(e.subjectId,{date,slotId:slot})}}
function toggleScheduleSettingsMenu(event){event?.stopPropagation?.();const menu=$('scheduleSettingsMenu');if(menu)menu.classList.toggle('hidden')}
function startManualScheduleMode(){state.schedule.edit=true;save();app.schedule();toast('Đã bật sửa tay. Bấm vào từng ca để chỉnh.')}
function finishManualScheduleMode(){state.schedule.edit=false;save();app.schedule();toast('Đã kết thúc sửa tay')}
function showAutoScheduleSettings(){app.openAutoScheduleSettings()}
function applyAutoScheduleSettings(){state.schedule.autoStage=$('scheduleStageSelect')?.value||state.schedule.autoStage;state.schedule.timezone=$('scheduleTzSelect')?.value||state.schedule.timezone;state.schedule.autoFrom=$('autoFromInput')?.value||state.schedule.autoFrom;state.schedule.autoTo=$('autoToInput')?.value||state.schedule.autoTo;state.schedule.targetQuestions=Number($('targetQuestionsInput')?.value)||FINAL_TARGET_QUESTIONS;state.schedule.targetScore=Number($('targetScoreInput')?.value)||DEFAULT_TARGET_SCORE;save();app.autoSchedule();closeModal()}
function useFullStageRange(){const b=app.defaultStageBounds($('scheduleStageSelect').value);$('autoFromInput').value=b[0];$('autoToInput').value=b[1]}
function useCurrentWeekRange(){const start=parseDate(state.schedule.weekStart);$('autoFromInput').value=iso(start);$('autoToInput').value=iso(addDays(start,6))}
function cyclePriority(id){const order=['q1','q2','q3','q4'];const i=order.indexOf(state.subjects[id].priority);state.subjects[id].priority=order[(i+1)%order.length];save();app.refreshPriorityBoard();toast('Đã chuyển khu ưu tiên')}
function toggleResearchCheck(itemId,val){state.researchChecks=state.researchChecks||{};state.researchChecks[itemId]=!!val;save();app.research()}
function fileInputId(itemId){return 'file_'+itemId.replace(/[^a-zA-Z0-9_-]/g,'_')}
function attachResearchFile(itemId){document.getElementById(fileInputId(itemId))?.click()}
function handleResearchFile(input,itemId){const file=input.files&&input.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{state.researchFiles=state.researchFiles||{};const arr=state.researchFiles[itemId]||[];const ext=(file.name.split('.').pop()||'').toLowerCase();const typeLabel=file.type.startsWith('video/')?'Video':ext==='json'?'JSON':'HTML';arr.push({name:file.name,mime:file.type||'',typeLabel,content:reader.result,addedAt:new Date().toISOString()});state.researchFiles[itemId]=arr.slice(-8);save();app.research();toast('Đã đính kèm '+file.name)};reader.readAsDataURL(file)}
function openResearchFile(itemId,idx){const f=(state.researchFiles?.[itemId]||[])[idx];if(!f)return;let body='';if((f.mime||'').startsWith('video/')){body=`<video controls style="width:100%;max-height:70vh" src="${f.content}"></video>`}else if((f.mime||'').includes('json')||f.name.toLowerCase().endsWith('.json')){body=`<iframe style="width:100%;height:70vh;border:0;background:#fff" src="${f.content}"></iframe>`}else{body=`<iframe style="width:100%;height:70vh;border:0;background:#fff" src="${f.content}"></iframe>`}openModal(f.name,body,true)}
function selectResearch(id){state.researchTopic=id;save();app.research()}function BAUMAN_AUDIT(){const issues=[];['page-home','page-roadmap','page-subjects','page-schedule','page-research'].forEach(id=>{if(!$(id))issues.push('Thiếu '+id)});if(!DATA?.courses?.length)issues.push('Thiếu DATA.courses');if(!Object.keys(state.subjects||{}).length)issues.push('Thiếu state.subjects');console.table({issues:issues.length,courses:DATA.courses.length,subjects:Object.keys(state.subjects).length,page:state.page});if(issues.length)console.warn('BAUMAN_AUDIT',issues);return issues}
window.app=app;window.auth=auth;window.mentor=mentor;window.closeModal=closeModal;window.save=save;window.state=state;window.buildLearningTask=buildLearningTask;window.receiveSubjectProgress=receiveSubjectProgress;window.receiveSubjectCapability=receiveSubjectCapability;window.receiveSubjectRouteReceipt=receiveSubjectRouteReceipt;window.setHomePanel=setHomePanel;window.showHomeFrame=showHomeFrame;window.selectRoadmapStage=selectRoadmapStage;window.pickSubject=pickSubject;window.setSubjectStage=setSubjectStage;window.setScheduleView=setScheduleView;window.changeWeek=changeWeek;window.editScheduleSlot=editScheduleSlot;window.saveScheduleSlot=saveScheduleSlot;window.openScheduleSlot=openScheduleSlot;window.toggleScheduleSettingsMenu=toggleScheduleSettingsMenu;window.startManualScheduleMode=startManualScheduleMode;window.finishManualScheduleMode=finishManualScheduleMode;window.showAutoScheduleSettings=showAutoScheduleSettings;window.applyAutoScheduleSettings=applyAutoScheduleSettings;window.useFullStageRange=useFullStageRange;window.useCurrentWeekRange=useCurrentWeekRange;window.cyclePriority=cyclePriority;window.learningOptionsHTML=learningOptionsHTML;window.findNextFreeSlot=findNextFreeSlot;window.selectResearch=selectResearch;window.toggleResearchCheck=toggleResearchCheck;window.attachResearchFile=attachResearchFile;window.handleResearchFile=handleResearchFile;window.openResearchFile=openResearchFile;window.BAUMAN_AUDIT=BAUMAN_AUDIT;window.BaumanSubjectRuntime={subjectUrl,withTaskQuery,sendTaskToSubject,sendCapabilityRequestToSubject,trustedSubjectEvent};
document.addEventListener('DOMContentLoaded',()=>app.init());
