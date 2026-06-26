
const $=id=>document.getElementById(id), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const CONFIG=window.SUBJECT_CONFIG;
const KEY='bauman_subject_'+CONFIG.id+'_all_phases_v1';
const DATA_FILES=['curriculum','lessons','formulas','exercises','tests','simulations','knowledge-index'];
let store={curriculum:null,lessons:[],formulas:[],exercises:[],tests:{rules:{},questions:[]},simulations:{meta:{},observation:[],practice:[]},knowledge:[]};
let state=readState();
function defaultState(){return{page:'dashboard',stage:'prepare',module:null,lesson:null,formulaGroup:'all',exerciseDiff:'all',testLevel:'easy',simMode:'observation',activeSim:null,unlocked:{easy:true,medium:false,hard:false,excellent:false},progress:{modules:{},lessons:{},tests:{},simulations:{},simulationPractice:{}},lastScore:null}}
function readState(){try{return {...defaultState(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return defaultState()}}
function save(){localStorage.setItem(KEY,JSON.stringify(state));reportProgress()}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2600)}
async function loadJSON(name){const key=name==='knowledge-index'?'knowledge':name;try{const res=await fetch(`./data/${name}.json`);store[key]=await res.json()}catch(e){console.warn('Không nạp được',name,e)}}
function stages(){return store.curriculum?.stages||[]}
function currentStage(){return stages().find(s=>s.id===state.stage)||stages()[0]||{id:'prepare',title:'Giai đoạn',modules:[]}}
function modules(){return (store.curriculum?.modules||[]).filter(m=>m.stage===currentStage().id)}
function lessonsInStage(){const ids=new Set(modules().flatMap(m=>m.lessons||[]));return store.lessons.filter(l=>ids.has(l.id))}

function stageModules(stageId=state.stage){return (store.curriculum?.modules||[]).filter(m=>m.stage===stageId)}
function stageLessons(stageId=state.stage){const ids=new Set(stageModules(stageId).flatMap(m=>m.lessons||[]));return store.lessons.filter(l=>ids.has(l.id))}
function roadmapStats(stageId=state.stage){const ms=stageModules(stageId);const ls=stageLessons(stageId);const hrs=ms.reduce((a,m)=>a+(Number(m.hours)||0),0);const done=ms.filter(m=>moduleProgress(m.id)>=100).length;return {modules:ms.length,lessons:ls.length,hours:hrs,done,pct:ms.length?Math.round(done*100/ms.length):0}}
function moduleLessons(m){return (m.lessons||[]).map(id=>store.lessons.find(l=>l.id===id)).filter(Boolean)}
function shortText(x,n=120){x=String(x||'');return x.length>n?x.slice(0,n-1)+'…':x}
function listHTML(items,cls=''){return (items||[]).map(x=>`<li class="${cls}">${esc(typeof x==='string'?x:(x.work||x.session||JSON.stringify(x)))}</li>`).join('')}
function detailBlock(title,items,icon='•'){return `<section class="road-block"><h4>${icon} ${esc(title)}</h4><ul>${listHTML(items)}</ul></section>`}
function sessionTable(items){return `<div class="road-table"><table><thead><tr><th>Buổi</th><th>Thời lượng</th><th>Việc làm</th><th>Bằng chứng</th></tr></thead><tbody>${(items||[]).map(x=>`<tr><td><b>${esc(x.session||'Buổi học')}</b></td><td>${esc(x.time||'')}</td><td>${esc(x.work||'')}</td><td>${esc(x.evidence||'')}</td></tr>`).join('')}</tbody></table></div>`}
function moduleBadge(m){const p=moduleProgress(m.id);return p>=100?'Đã hoàn thành':p>0?'Đang học':'Chưa học'}

async function init(){await Promise.all(DATA_FILES.map(loadJSON));const st=stages();if(!st.some(s=>s.id===state.stage))state.stage=st[0]?.id||'prepare';if(!state.module||!modules().some(m=>m.id===state.module))state.module=modules()[0]?.id||'';bind();renderAll();nav(state.page||'dashboard');reportProgress();window.parent?.postMessage?.({type:'BAUMAN_CHILD_READY',contract:'SUBJECT_MODULE_V1',subjectId:CONFIG.id},'*')}
function bind(){ $('nav').addEventListener('click',e=>{const b=e.target.closest('button[data-page]'); if(b) nav(b.dataset.page)}); $('stageSelect').onchange=e=>{state.stage=e.target.value;state.module=modules()[0]?.id||'';save();renderAll();nav(state.page);toast('Đã chuyển sang '+currentStage().title)};}
function syncStageSelect(){const sel=$('stageSelect'); if(!sel)return; sel.innerHTML=stages().map(s=>`<option value="${s.id}" ${s.id===state.stage?'selected':''}>${esc(s.short||s.title)}</option>`).join('')}
function nav(page){state.page=page;save();$$('.section').forEach(s=>s.classList.toggle('active',s.id==='sec-'+page));$$('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));const st=currentStage();const titles={dashboard:['Tổng quan',`${st.title} · ${CONFIG.tagline}`],roadmap:['Lộ trình',`Module học trong ${st.title}.`],lessons:['Bài học','Chọn module để học sâu từng bài.'],formulas:[CONFIG.formulaLabel||'Công thức','Kho mẫu, công thức, checklist và quy trình cốt lõi.'],exercises:['Bài tập','Luyện thực hành theo mức độ.'],tests:['Kiểm tra','Mở khóa mức độ bằng điểm ≥ 8/10.'],simulations:['Mô phỏng','Quan sát cơ chế riêng của môn theo từng giai đoạn.'],simulationPractice:['Thực hành mô phỏng','Làm nhiệm vụ nhập vai, nhận phản hồi và ghi tiến độ.'],assistant:['Trợ lý môn','Tìm nhanh bài, mẫu, bài tập và gợi ý ôn.'],data:['Dữ liệu môn','Nguồn JSON cục bộ và nhập bổ sung.']};$('pageTitle').textContent=titles[page][0];$('pageSub').textContent=titles[page][1];renderPage(page)}
function renderAll(){syncStageSelect();['dashboard','roadmap','lessons','formulas','exercises','tests','simulations','simulationPractice','assistant','data'].forEach(renderPage)}
function renderPage(p){({dashboard,roadmap,lessons,formulas,exercises,tests,simulations,simulationPractice,assistant,dataPage}[p]||(()=>{}))()}
function moduleProgress(id){const m=(store.curriculum?.modules||[]).find(x=>x.id===id);if(!m)return 0;const done=(m.lessons||[]).filter(l=>state.progress.lessons[l]).length;return Math.round(done*100/Math.max((m.lessons||[]).length,1))}
function overall(){const mods=modules();const done=mods.filter(m=>moduleProgress(m.id)>=100).length;return {total:mods.length,done,pct: mods.length?Math.round(done*100/mods.length):0}}
function dashboard(){const o=overall();const st=currentStage();$('sec-dashboard').innerHTML=`<div class="hero"><div><span class="pill green">${esc(st.short||st.title)} · ${esc(CONFIG.short)}</span><h3>${esc(store.curriculum?.title||CONFIG.title)}</h3><p>${esc(st.target||store.curriculum?.target||CONFIG.tagline)}</p><div class="toolbar"><button class="btn primary" onclick="continueLearning()">Tiếp tục học →</button><button class="btn" onclick="nav('tests')">Kiểm tra thử</button><button class="btn" onclick="nav('assistant')">Hỏi trợ lý môn</button></div></div><div class="hero-card"><h3>Mục tiêu đầu ra giai đoạn</h3><ul>${(st.outcomes||store.curriculum?.outcomes||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div><div class="grid4"><div class="panel metric"><b>${modules().length}</b><small>module giai đoạn</small></div><div class="panel metric"><b>${lessonsInStage().length}</b><small>bài học</small></div><div class="panel metric"><b>${store.formulas.length}</b><small>mẫu/công thức</small></div><div class="panel metric"><b>${o.pct}%</b><small>tiến độ</small></div></div><div class="panel"><h3>Nguyên tắc học</h3><div class="lesson-grid">${(store.curriculum?.principles||[]).map(x=>`<div class="lesson"><p>${esc(x)}</p></div>`).join('')}</div></div>`}

function roadmap(){
 const st=currentStage(); const mods=stageModules(st.id); const stats=roadmapStats(st.id);
 $('sec-roadmap').innerHTML=`<div class="road-overview panel">
  <div><span class="pill green">${esc(st.short||st.title)}</span><h3>${esc(st.title)}</h3><p>${esc(st.target||store.curriculum?.target||'')}</p></div>
  <div class="road-kpis"><div><b>${stats.modules}</b><small>module</small></div><div><b>${stats.lessons}</b><small>bài học</small></div><div><b>${stats.hours}h</b><small>thời lượng</small></div><div><b>${stats.pct}%</b><small>hoàn thành</small></div></div>
 </div>
 <div class="stage-guidance panel"><h3>Nhịp học của giai đoạn</h3><div class="road-columns"><div>${detailBlock('Trọng tâm',st.focusBlocks||[])}</div><div>${detailBlock('Cách học tuần',st.weeklyRhythm||[])}</div></div></div>
 <div class="layout road-layout"><aside class="panel list road-list">${mods.map(m=>`<button class="card module-card ${state.module===m.id?'active':''}" onclick="selectModule('${m.id}')"><div class="module-topline"><span class="tag">${esc(m.week)}</span><span class="tag">${moduleProgress(m.id)}%</span></div><h4>${esc(m.title)}</h4><p>${esc(shortText(m.goal,145))}</p><div class="module-meta"><span class="tag">${m.hours}h</span><span class="tag">${esc(m.level)}</span><span class="tag">${moduleBadge(m)}</span></div></button>`).join('')||'<div class="lesson">Chưa có module trong giai đoạn này.</div>'}</aside><main class="panel detail road-detail" id="roadmapDetail"></main></div>`;
 renderModuleDetail()
}
function selectModule(id){state.module=id;save();roadmap()}
function renderModuleDetail(){
 const m=stageModules().find(x=>x.id===state.module)||stageModules()[0];
 if(!m){$('roadmapDetail').innerHTML='<p>Chưa có module.</p>';return}
 const p=moduleProgress(m.id), lessons=moduleLessons(m);
 $('roadmapDetail').innerHTML=`<div class="road-detail-head"><div><span class="pill">${esc(m.week)} · ${esc(m.level)}</span><h3>${esc(m.title)}</h3><p>${esc(m.phaseObjective||m.goal)}</p></div><div class="road-score"><b>${p}%</b><small>tiến độ module</small></div></div>
 <div class="progressbar"><span style="width:${p}%"></span></div>
 <div class="road-actions"><button class="btn primary" onclick="openFirstLessonInModule('${m.id}')">Bắt đầu bài học</button><button class="btn" onclick="nav('simulations')">Mở mô phỏng</button><button class="btn" onclick="nav('tests')">Kiểm tra</button></div>
 <div class="road-columns">
  ${detailBlock('Vì sao cần học',m.whyImportant||[], '🎯')}
  ${detailBlock('Cần chuẩn bị',m.prerequisites||[], '🧰')}
 </div>
 ${detailBlock('Bản đồ khái niệm',m.conceptMap||[], '🧠')}
 <section class="road-block"><h4>🗓️ Kế hoạch học chi tiết</h4>${sessionTable(m.studyPlan||[])}</section>
 <div class="road-columns">
  ${detailBlock('Đầu ra cần nộp',m.outputs||[], '📦')}
  ${detailBlock('Bài tập theo mức',m.practicePlan||[], '🧪')}
 </div>
 <div class="road-columns">
  ${detailBlock('Mô phỏng cần chạy',m.simulationPlan||[], '🧩')}
  ${detailBlock('Liên kết Bauman/luận văn',m.baumanLinks||[], '🎓')}
 </div>
 <section class="road-block"><h4>📚 Bài học trong module</h4><div class="lesson-grid">${lessons.map(l=>lessonCard(l.id)).join('')||'<div class="lesson">Chưa có bài học.</div>'}</div></section>
 <div class="road-columns">
  ${detailBlock('Tiêu chí hoàn thành',m.completionCriteria||[], '✅')}
  ${detailBlock('Rủi ro cần tránh',m.risks||[], '⚠️')}
 </div>
 <section class="road-block"><h4>➡️ Bước tiếp theo</h4><p>${esc(m.nextStep||'Chuyển module kế tiếp hoặc làm kiểm tra tổng hợp.')}</p></section>`
}
function openFirstLessonInModule(mid){const m=(store.curriculum?.modules||[]).find(x=>x.id===mid);const id=m?.lessons?.[0]; if(id) openLesson(id); else toast('Module này chưa có bài học chi tiết.')}


function normalizeArray(value){
  if(Array.isArray(value)) return value;
  if(value==null || value==='') return [];
  if(typeof value==='string') return [value];
  if(typeof value==='object') return Object.entries(value).map(([k,v])=>`${k}: ${typeof v==='string'?v:JSON.stringify(v)}`);
  return [String(value)];
}
function lessonCard(item){
  const id=typeof item==='string'?item:item?.id;
  const l=store.lessons.find(x=>x.id===id) || (typeof item==='object'?item:null);
  if(!l) return `<div class="lesson"><h4>Không tìm thấy bài học</h4><p>${esc(id||'')}</p></div>`;
  const done=!!state.progress.lessons[l.id];
  const e=l.eLearning||{};
  const meta=[l.kind,e.estimatedMinutes?`${e.estimatedMinutes} phút`:null,l.stage].filter(Boolean).join(' · ');
  return `<button class="lesson ${done?'done':''}" onclick="openLesson('${l.id}')">
    <span class="tag">${esc(meta||'Bài học')}</span>
    <h4>${done?'✅ ':''}${esc(l.title)}</h4>
    <p>${esc(l.description||e.whyItMatters||'Mở để học nội dung chi tiết.')}</p>
    <div class="chips">${normalizeArray(e.objectives||l.keyPoints).slice(0,3).map(x=>`<span class="tag">${esc(shortText(x,42))}</span>`).join('')}</div>
  </button>`;
}
function textList(items){return normalizeArray(items).map(x=>`<li>${esc(typeof x==='string'?x:(x.task||x.q||x.criterion||JSON.stringify(x)))}</li>`).join('')||'<li>Chưa có dữ liệu.</li>'}
function eBlock(title,body,icon=''){
  return `<article class="elearn-block"><h4>${icon?icon+' ':''}${esc(title)}</h4>${body}</article>`
}
function renderWorkedExample(ex){
  if(!ex) return '<p>Chưa có ví dụ mẫu.</p>';
  return `<p><b>Bối cảnh:</b> ${esc(ex.context||'')}</p><ol>${textList(ex.steps||[])}</ol><div class="answer-box"><b>Kết luận mẫu:</b> ${esc(ex.answer||'')}</div>`;
}
function renderPractice(items){
  return `<div class="elearn-practice-grid">${normalizeArray(items).map(x=>`<div class="elearn-practice"><b>${esc(x.level||'Bài tập')}</b><p>${esc(x.task||x)}</p><small>${esc(x.expected||'Tự kiểm tra bằng rubric cuối bài.')}</small></div>`).join('')||'<p>Chưa có bài luyện tập.</p>'}</div>`
}
function renderQuestions(items){
  return normalizeArray(items).map((x,i)=>`<div class="elearn-practice"><b>Câu ${i+1}: ${esc(x.q||x)}</b><div class="answer-box"><b>Đáp án gợi ý:</b> ${esc(x.a||'Đối chiếu lại phần lý thuyết cốt lõi.')}</div></div>`).join('')
}
function openLesson(id){
  const l=store.lessons.find(x=>x.id===id);
  if(!l){toast('Không tìm thấy dữ liệu bài học.');return}
  const e=l.eLearning||{};
  const minutes=e.estimatedMinutes||45;
  $('modalRoot').innerHTML=`<div class="modal"><div class="dialog elearn-dialog"><header class="dialog-head"><div><span class="tag">${esc(e.stage||l.stage||currentStage().title)}</span><h3 style="margin:6px 0 0">${esc(l.title)}</h3></div><button class="btn sm" onclick="closeModal()">Đóng</button></header><div class="dialog-body elearn-body">
    <section class="elearn-hero"><div><span class="pill green">Bài học e-learning</span><h4>${esc(l.title)}</h4><p>${esc(l.description||e.whyItMatters||'')}</p></div><div class="elearn-minutes"><b>${minutes}</b><small>phút học</small></div></section>
    <div class="elearn-grid two">
      ${eBlock('Mục tiêu học tập',`<ul>${textList(e.objectives||l.keyPoints)}</ul>`,'🎯')}
      ${eBlock('Điều kiện chuẩn bị',`<ul>${textList(e.prerequisites)}</ul>`,'🧰')}
    </div>
    ${eBlock('Vì sao cần học',`<p>${esc(e.whyItMatters||'Nội dung này là mắt xích trong lộ trình môn học và phục vụ các module sau.')}</p>`,'🧭')}
    ${eBlock('Lý thuyết cốt lõi',`<ul>${textList(e.coreTheory||l.keyPoints)}</ul><div class="formula-row">${normalizeArray(e.coreFormulas).map(f=>`<span class="formula-chip">${esc(f)}</span>`).join('')}</div>`,'📘')}
    ${eBlock('Ví dụ có lời giải',renderWorkedExample(e.workedExample),'🧪')}
    ${eBlock('Luyện tập có hướng dẫn',renderPractice(e.guidedPractice||l.tasks),'✍️')}
    <div class="elearn-grid two">
      ${eBlock('Mô phỏng gắn với bài',`<p>${esc(e.simulationLink||'Mở tab Mô phỏng hoặc Thực hành mô phỏng để quan sát cơ chế.')}</p><button class="btn primary" onclick="closeModal();nav('simulations')">Mở mô phỏng</button>`,'🧩')}
      ${eBlock('Sai lầm hay gặp',`<ul>${textList(e.commonMistakes)}</ul>`,'⚠️')}
    </div>
    ${eBlock('Câu hỏi cuối bài',`<div class="elearn-practice-grid">${renderQuestions(e.checkpointQuestions)}</div>`,'✅')}
    <div class="elearn-grid two">
      ${eBlock('Tiêu chí đạt',`<ul>${textList(e.masteryCriteria)}</ul>`,'🏁')}
      ${eBlock('Rubric đánh giá',`<div class="rubric-box">${normalizeArray(e.rubric).map(r=>`<div class="rubric-row"><span>${esc(r.criterion||r)}</span><b>${r.weight?Math.round(r.weight*100)+'%':''}</b></div>`).join('')||'<p>Hoàn thành bài học, ví dụ, mô phỏng và kiểm tra.</p>'}</div>`,'📊')}
    </div>
    ${eBlock('Liên hệ Bauman / НИР / ВКР',`<p>${esc(e.baumanConnection||'Liên hệ với học phần chính khóa, năng lực đọc tài liệu kỹ thuật và luận văn.')}</p><p><b>Nếu sai:</b> ${esc(e.reviewIfWrong||'Quay lại bài học, chạy mô phỏng và làm lại bài tập mức dễ.')}</p>`,'🎓')}
    <div class="toolbar"><button class="btn green" onclick="markLessonDone('${l.id}')">Đánh dấu hoàn thành</button><button class="btn" onclick="closeModal()">Đóng</button></div>
  </div></div></div>`;
}
function markLessonDone(id){
  state.progress.lessons[id]=true;
  save();
  closeModal();
  renderPage(state.page);
  toast('Đã ghi hoàn thành bài học');
}
function closeModal(){const r=$('modalRoot'); if(r) r.innerHTML=''}

function lessons(){const mods=modules();$('sec-lessons').innerHTML=`<div class="layout"><aside class="panel list">${mods.map(m=>`<button class="card module-card ${state.module===m.id?'active':''}" onclick="state.module='${m.id}';save();lessons()"><h4>${esc(m.week)} · ${esc(m.title)}</h4><p>${(m.lessons||[]).length} bài · ${moduleProgress(m.id)}%</p></button>`).join('')}</aside><main class="panel detail"><h3>Bài học trong module</h3><div class="lesson-grid">${(mods.find(m=>m.id===state.module)?.lessons||[]).map(lessonCard).join('')}</div></main></div>`}
function formulas(){const groups=['all',...new Set(store.formulas.map(f=>f.group))];let list=state.formulaGroup==='all'?store.formulas:store.formulas.filter(f=>f.group===state.formulaGroup);$('sec-formulas').innerHTML=`<div class="formula-toolbar">${groups.map(g=>`<button class="btn sm ${state.formulaGroup===g?'primary':''}" onclick="state.formulaGroup='${g}';save();formulas()">${g==='all'?'Tất cả':esc(g)}</button>`).join('')}</div><div class="formula-grid">${list.map(f=>`<article class="formula"><span class="tag">${esc(f.group)}</span><h3>${esc(f.name)}</h3><code>${esc(f.formula)}</code><p>${esc(f.meaning)}</p><small>${esc(f.example)}</small></article>`).join('')}</div>`}
function exercises(){let diffs=['all','easy','medium','hard'];let ids=new Set(modules().map(m=>m.title));let list=state.exerciseDiff==='all'?store.exercises:store.exercises.filter(e=>e.difficulty===state.exerciseDiff);list=list.filter(e=>ids.has(e.topic));$('sec-exercises').innerHTML=`<div class="toolbar">${diffs.map(d=>`<button class="btn sm ${state.exerciseDiff===d?'primary':''}" onclick="state.exerciseDiff='${d}';save();exercises()">${d==='all'?'Tất cả':d}</button>`).join('')}</div><div class="exercise-grid">${list.map(e=>`<article class="exercise"><span class="tag">${esc(e.topic)} · ${esc(e.difficulty)}</span><h3>${esc(e.prompt)}</h3><button class="btn sm" onclick="toggleAnswer('${e.id}')">Xem đáp án</button><button class="btn sm" onclick="reviewLesson('${e.reviewLesson}')">Ôn bài liên quan</button><div class="answer" id="ans-${e.id}"><b>Đáp án:</b> ${esc(e.answer)}</div></article>`).join('')||'<div class="lesson">Chưa có bài tập cho giai đoạn này.</div>'}</div>`}
function toggleAnswer(id){const a=$('ans-'+id);a.style.display=a.style.display==='block'?'none':'block'}
function reviewLesson(id){openLesson(id)}
function tests(){const levels=['easy','medium','hard','excellent'];$('sec-tests').innerHTML=`<div class="test-panel"><aside class="panel"><h3>Chọn mức</h3>${levels.map(l=>`<button class="btn ${state.testLevel===l?'primary':''}" style="width:100%;margin:5px 0" ${state.unlocked[l]?'':'disabled'} onclick="state.testLevel='${l}';save();tests()">${levelName(l)} ${state.unlocked[l]?'':'🔒'}</button>`).join('')}<p style="color:var(--muted);line-height:1.55">Quy tắc: đạt từ 8/10 để mở mức tiếp theo. Dễ 20 câu, Trung bình 30, Khá 40, Giỏi 50.</p><button class="btn green" onclick="startTest()">Bắt đầu kiểm tra</button></aside><main class="panel" id="testArea"><h3>Sẵn sàng kiểm tra</h3><p>Chọn mức và bấm bắt đầu.</p></main></div>`}
function levelName(l){return {easy:'Dễ',medium:'Trung bình',hard:'Khá',excellent:'Giỏi'}[l]}
function startTest(){const stageModuleIds=new Set(modules().map(m=>m.id));let qs=store.tests.questions.filter(q=>stageModuleIds.has(q.moduleId));qs=qs.filter(q=>q.difficulty===state.testLevel || (state.testLevel==='excellent'&&['hard','medium'].includes(q.difficulty)));if(!qs.length)qs=store.tests.questions.slice(0,10);state.currentTest={level:state.testLevel,index:0,score:0,answers:[],questions:qs.slice(0,Math.min(qs.length,10))};renderQuestion()}
function renderQuestion(){const t=state.currentTest,q=t.questions[t.index];$('testArea').innerHTML=`<div class="question"><span class="tag">Câu ${t.index+1}/${t.questions.length}</span><h3>${esc(q.prompt)}</h3>${q.options.map((o,i)=>`<button class="option" onclick="answerQuestion(${i})">${esc(o)}</button>`).join('')}</div>`}
function answerQuestion(i){const t=state.currentTest,q=t.questions[t.index];const correct=i===q.answerIndex;t.score+=correct?1:0;t.answers.push({id:q.id,correct,reviewLesson:q.reviewLesson});$$('.option').forEach((b,idx)=>{b.disabled=true;if(idx===q.answerIndex)b.classList.add('correct');if(idx===i&&!correct)b.classList.add('wrong')});setTimeout(()=>{t.index++; if(t.index<t.questions.length)renderQuestion(); else finishTest()},650)}
function finishTest(){const t=state.currentTest;const score10=Math.round((t.score/t.questions.length)*100)/10;state.progress.tests[t.level]={score:score10,at:new Date().toISOString(),stage:state.stage};if(score10>=8){if(t.level==='easy')state.unlocked.medium=true;if(t.level==='medium')state.unlocked.hard=true;if(t.level==='hard')state.unlocked.excellent=true}save();const wrong=t.answers.filter(a=>!a.correct);$('testArea').innerHTML=`<h3>Kết quả: ${score10}/10</h3><p>${score10>=8?'Đạt. Đã mở khóa mức tiếp theo nếu có.':'Chưa đạt 8/10. Nên ôn lại các mục sai.'}</p><div class="lesson-grid">${wrong.map(w=>`<button class="lesson" onclick="reviewLesson('${w.reviewLesson}')">Ôn lại: ${esc(store.lessons.find(l=>l.id===w.reviewLesson)?.title||w.reviewLesson)}</button>`).join('')||'<div class="lesson">Không sai câu nào trong nhóm câu này.</div>'}</div><button class="btn primary" onclick="tests()">Quay lại kiểm tra</button>`;reportProgress()}


function simsInStage(kind){
  const st=currentStage().id;
  return (store.simulations?.[kind]||[]).filter(x=>x.stage===st)
}
function simulations(){
  const id=CONFIG.id;
  if(id==='math') return renderMathDeepSims();
  if(id==='programming') return renderProgrammingLab();
  if(id==='ai') return renderAILab();
  if(id==='systems') return renderSystemsLab();
  if(id==='signal') return renderSignalLab();
  if(id==='research') return renderResearchLab();
  if(id==='foundation') return renderFoundationLab();
  return renderGenericLab();
}
function simulationPractice(){
  const id=CONFIG.id;
  const titleMap={math:'Toán',programming:'Lập trình',ai:'AI/ML',systems:'АСОИУ',signal:'Signal',research:'НИР/ВКР',foundation:'Dự bị'};
  const scenarios={
    math:['Giải thích vì sao ma trận xấu làm nghiệm nhảy mạnh khi nhiễu b thay đổi.','Chọn chuẩn phù hợp cho bài toán sparse data và giải thích.','Dùng PCA để giảm chiều dataset telemetry trước khi đưa vào ML.'],
    programming:['Debug pipeline CSV → PostgreSQL → pandas → model khi dữ liệu bị lệch schema.','Chọn index cho truy vấn chậm và giải thích EXPLAIN plan.','Thiết kế API nhận telemetry từ robot và lưu log lỗi.'],
    ai:['Nhìn metric train/test và chẩn đoán overfit.','Chọn regularization phù hợp khi noise tăng.','Đề xuất cải thiện mô hình khi recall thấp.'],
    systems:['Xử lý sensor node mất gói trong loop điều khiển.','Chọn chiến lược fail-safe khi actuator phản hồi trễ.','Phân tích độ tin cậy hệ thống khi một node yếu.'],
    signal:['Phát hiện anomaly trong chuỗi telemetry có trend và seasonality.','Chọn sampling rate khi tín hiệu có nhiễu cao.','Tách trend/season/noise trước khi dự báo.'],
    research:['Trả lời phản biện: vì sao chọn UGV thay vì UAV/UUV?','Chuyển một ý tưởng thành câu hỏi nghiên cứu đo được.','Lập plan thực nghiệm cho НИР có dữ liệu và metric rõ.'],
    foundation:['Giải thích bài toán vật lý/toán bằng tiếng Nga đơn giản.','Chuẩn bị câu hỏi hỏi lại giảng viên khi chưa hiểu đề.','Lập kế hoạch tự học tuần dự bị.']
  };
  const list=scenarios[id]||['Hoàn thành nhiệm vụ mô phỏng và ghi phản hồi.'];
  $('sec-simulationPractice').innerHTML=`<div class="lab-shell"><div class="lab-hero"><div><span class="lab-badge">Mô phỏng thực hành</span><h3>${esc(titleMap[id]||CONFIG.short)} · nhiệm vụ có phản hồi</h3><p>Làm nhiệm vụ, tích rubric, ghi câu trả lời và lưu tiến độ về Main.</p></div><button class="btn" onclick="nav('simulations')">← Mô phỏng riêng</button></div><div class="lab-grid">${list.map((s,i)=>practiceCard(id,i,s)).join('')}</div></div>`;
}
function practiceCard(subject,i,mission){
  const key=`${subject}_${state.stage}_practice_${i}`;
  const done=state.progress.simulationPractice?.[key];
  return `<article class="lab-card ${done?'done':''}"><span class="lab-badge">Nhiệm vụ ${i+1}</span><h3>${done?'✅ ':''}${esc(mission)}</h3><p>Hoàn thành theo quy trình: phân tích tình huống → chọn công cụ/phương án → viết kết luận ngắn.</p><div class="rubric-list"><label><input type="checkbox"> Nêu đúng dữ kiện đầu vào</label><label><input type="checkbox"> Chọn đúng công thức / thuật toán / chiến lược</label><label><input type="checkbox"> Có kết luận và bước ôn tập tiếp theo</label></div><textarea class="practice-input" id="prac-${key}" placeholder="Ghi câu trả lời / quyết định / kết quả mô phỏng..."></textarea><div class="lab-toolbar"><button class="btn primary" onclick="completePracticeSim('${key}')">Tích hoàn thành</button><button class="btn" onclick="showPracticeFeedback('${key}')">Gợi ý phản hồi</button></div><div class="sim-result" id="practice-feedback-${key}"></div></article>`;
}
function completePracticeSim(key){
  state.progress.simulationPractice=state.progress.simulationPractice||{};
  state.progress.simulationPractice[key]={completed:true,note:$('prac-'+key)?.value||'',stage:state.stage,at:new Date().toISOString()};
  save(); simulationPractice(); toast('Đã ghi hoàn thành mô phỏng thực hành');
}
function showPracticeFeedback(key){
  const el=$('practice-feedback-'+key);
  if(el){el.style.display='block';el.innerHTML='<b>Phản hồi gợi ý:</b><p>Đối chiếu câu trả lời với rubric. Nếu thiếu dữ kiện hoặc kết luận, quay lại bài học liên quan trước khi làm kiểm tra.</p>'}
}
function renderMathDeepSims(){
  const labs=[
    ['matrix_ch2_norm_conditioning.html','Chương 2 · Chuẩn, bán kính phổ, điều kiện số','Unit ball Lp, chuẩn ma trận, Gelfand, conditioning và Neumann.'],
    ['matrix_ch4_calculus_optimization.html','Chương 4 · Jacobian, Hessian, Gradient Descent','Độ cong, tiếp tuyến, learning rate và backprop.'],
    ['matrix_ch5_tensor_lab.html','Chương 5 · Kronecker, Vectorization, Tensor','Tích Kronecker, vec(AXB), tensor unfolding và nén.'],
    ['matrix_ch6_sketching_graph.html','Chương 6 · Sketching, Laplacian, rSVD','JL projection, graph Laplacian và randomized SVD.']
  ];
  $('sec-simulations').innerHTML=`<div class="lab-shell"><div class="lab-hero"><div><span class="lab-badge">Mô phỏng riêng đúng chuẩn</span><h3>Toán · phòng thí nghiệm tương tác</h3><p>Đây là mô phỏng kiểu anh gửi: có input, slider, canvas/biểu đồ, công thức và kết quả thay đổi ngay khi thao tác.</p></div><button class="btn primary" onclick="nav('simulationPractice')">Sang thực hành mô phỏng →</button></div><div class="deep-sim-grid">${labs.map(l=>`<article class="deep-sim-card"><span class="lab-badge">Interactive HTML Lab</span><h3>${esc(l[1])}</h3><p>${esc(l[2])}</p><button class="btn primary" onclick="openDeepSim('./simulations/${l[0]}','${esc(l[1])}')">Mở mô phỏng</button></article>`).join('')}</div>${renderMiniMathLab()}</div>`;
  setTimeout(initMiniMathLab,30);
}
function renderMiniMathLab(){return `<article class="lab-card"><span class="lab-badge">Lab nhanh trong môn</span><h3>Vector norm & ma trận điều kiện</h3><div class="lab-grid"><div><div class="lab-toolbar"><label>Chuẩn<select id="normType" class="input"><option value="1">L1</option><option value="2" selected>L2</option><option value="inf">L∞</option></select></label><label>x<input id="vx" class="matrix-cell" type="number" value="3"></label><label>y<input id="vy" class="matrix-cell" type="number" value="4"></label></div><div class="lab-kpi"><div><b id="normOut">5.00</b><small>norm</small></div><div><b id="condOut">2.62</b><small>κ demo</small></div><div><b id="riskOut">ổn</b><small>độ nhạy</small></div></div></div><div class="lab-board"><canvas id="mathQuickCanvas" class="sim-canvas"></canvas></div></div></article>`}
function initMiniMathLab(){['normType','vx','vy'].forEach(id=>$(id)?.addEventListener('input',updateMiniMathLab)); updateMiniMathLab()}
function updateMiniMathLab(){const x=Number($('vx')?.value||0),y=Number($('vy')?.value||0),t=$('normType')?.value||'2';let n=t==='1'?Math.abs(x)+Math.abs(y):t==='inf'?Math.max(Math.abs(x),Math.abs(y)):Math.hypot(x,y);if($('normOut'))$('normOut').textContent=n.toFixed(2);const cond=1+Math.abs(x-y)/(Math.abs(x+y)+.2)*5;if($('condOut'))$('condOut').textContent=cond.toFixed(2);if($('riskOut'))$('riskOut').textContent=cond>3?'nhạy':'ổn';drawVectorCanvas('mathQuickCanvas',x,y,t)}
function drawVectorCanvas(id,x,y,type){const c=$(id);if(!c)return;const r=c.getBoundingClientRect();c.width=Math.max(320,r.width);c.height=220;const ctx=c.getContext('2d'),w=c.width,h=c.height,ox=w/2,oy=h/2,s=28;ctx.clearRect(0,0,w,h);ctx.strokeStyle='#e2e8f0';ctx.lineWidth=1;for(let i=-8;i<=8;i++){ctx.beginPath();ctx.moveTo(ox+i*s,0);ctx.lineTo(ox+i*s,h);ctx.stroke();ctx.beginPath();ctx.moveTo(0,oy+i*s);ctx.lineTo(w,oy+i*s);ctx.stroke()}ctx.strokeStyle='#94a3b8';ctx.beginPath();ctx.moveTo(0,oy);ctx.lineTo(w,oy);ctx.moveTo(ox,0);ctx.lineTo(ox,h);ctx.stroke();ctx.strokeStyle='#2563eb';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+x*s,oy-y*s);ctx.stroke();ctx.fillStyle='#2563eb';ctx.beginPath();ctx.arc(ox+x*s,oy-y*s,6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#0f172a';ctx.font='14px sans-serif';ctx.fillText(`v=(${x},${y}) · L${type}`,14,22)}
function openDeepSim(src,title){$('modalRoot').innerHTML=`<div class="sim-modal"><div class="sim-dialog"><header><b>${title}</b><button class="btn sm" onclick="closeModal()">Đóng</button></header><iframe src="${src}"></iframe></div></div>`;}
function renderProgrammingLab(){
  $('sec-simulations').innerHTML=`<div class="lab-shell"><div class="lab-hero"><div><span class="lab-badge">Mô phỏng riêng</span><h3>Programming · pipeline, SQL và bug lab</h3><p>Điều chỉnh dữ liệu, index, batch và xem độ trễ/bug thay đổi.</p></div><button class="btn primary" onclick="nav('simulationPractice')">Thực hành mô phỏng →</button></div><div class="lab-grid"><article class="lab-card"><h3>Data pipeline simulator</h3><div class="lab-toolbar"><label>Rows<input id="pgRows" type="range" min="1000" max="1000000" value="200000" class="lab-slider"></label><label>Index<select id="pgIndex" class="input"><option value="0">Không</option><option value="1" selected>Có index</option></select></label><label>Batch<input id="pgBatch" type="range" min="100" max="10000" value="1000" class="lab-slider"></label></div><div class="lab-node-row"><div class="lab-node">CSV</div><div class="lab-arrow"></div><div class="lab-node">SQL</div><div class="lab-arrow"></div><div class="lab-node">Pandas</div><div class="lab-arrow"></div><div class="lab-node">ML</div></div><div class="lab-kpi"><div><b id="pgLatency">0ms</b><small>latency</small></div><div><b id="pgCost">0</b><small>cost</small></div><div><b id="pgRisk">ok</b><small>risk</small></div></div></article><article class="lab-card"><h3>Bug console</h3><div class="lab-console" id="pgConsole"></div><button class="btn primary" onclick="pgSim()">Chạy pipeline</button></article></div></div>`;setTimeout(()=>{['pgRows','pgIndex','pgBatch'].forEach(i=>$(i)?.addEventListener('input',pgSim));pgSim()},30)}
function pgSim(){const rows=Number($('pgRows')?.value||1000),idx=Number($('pgIndex')?.value||0),batch=Number($('pgBatch')?.value||1000);const latency=Math.round(rows/(idx?4200:900)+10000/batch);const cost=Math.round(latency*(idx?0.8:1.6));const risk=batch<800?'schema drift':rows>700000&&!idx?'slow query':'ok';if($('pgLatency'))$('pgLatency').textContent=latency+'ms';if($('pgCost'))$('pgCost').textContent=cost;if($('pgRisk'))$('pgRisk').textContent=risk;if($('pgConsole'))$('pgConsole').textContent=`> read_csv(rows=${rows})\n> COPY INTO postgres batch=${batch}\n> ${idx?'CREATE INDEX idx_timestamp':'-- missing index'}\n> query_latency=${latency}ms\n> diagnosis=${risk}`;}
function renderAILab(){
  $('sec-simulations').innerHTML=`<div class="lab-shell"><div class="lab-hero"><div><span class="lab-badge">Mô phỏng riêng</span><h3>AI/ML · overfit, metric và model selection</h3><p>Thay noise, complexity, train size để thấy train/test gap và chẩn đoán mô hình.</p></div><button class="btn primary" onclick="nav('simulationPractice')">Thực hành mô phỏng →</button></div><div class="lab-grid"><article class="lab-card"><h3>Model sandbox</h3><div class="lab-toolbar"><label>Noise<input id="aiNoise" type="range" min="0" max="100" value="25" class="lab-slider"></label><label>Complexity<input id="aiComp" type="range" min="1" max="10" value="5" class="lab-slider"></label><label>Train size<input id="aiSize" type="range" min="50" max="1000" value="400" class="lab-slider"></label></div><canvas id="aiCanvas" class="sim-canvas"></canvas></article><article class="lab-card"><h3>Diagnosis</h3><div class="lab-kpi"><div><b id="aiTrain">0%</b><small>train</small></div><div><b id="aiTest">0%</b><small>test</small></div><div><b id="aiStatus">ok</b><small>status</small></div></div><div class="lab-console" id="aiConsole"></div></article></div></div>`;setTimeout(()=>{['aiNoise','aiComp','aiSize'].forEach(i=>$(i)?.addEventListener('input',aiSim));aiSim()},30)}
function aiSim(){const n=Number($('aiNoise')?.value||0),c=Number($('aiComp')?.value||1),s=Number($('aiSize')?.value||100);let train=Math.min(99,65+c*5-n*.12+s/200),test=Math.min(96,train-Math.max(0,c*3-s/250)-n*.18);let gap=train-test,status=gap>12?'overfit':test<65?'underfit/noisy':'good';$('aiTrain').textContent=train.toFixed(1)+'%';$('aiTest').textContent=test.toFixed(1)+'%';$('aiStatus').textContent=status;$('aiConsole').textContent=`complexity=${c}\nnoise=${n}%\ntrain_size=${s}\ngap=${gap.toFixed(1)}\nrecommendation=${gap>12?'regularization / more data':test<65?'feature cleanup':'proceed to validation'}`;barCanvas('aiCanvas',[train,test,Math.max(0,gap)],['train','test','gap'])}
function renderSystemsLab(){
  $('sec-simulations').innerHTML=`<div class="lab-shell"><div class="lab-hero"><div><span class="lab-badge">Mô phỏng riêng</span><h3>АСОИУ · smart node, sensor và reliability</h3><p>Mô phỏng master-controller nhận telemetry từ node, xử lý lỗi mất gói/trễ.</p></div><button class="btn primary" onclick="nav('simulationPractice')">Thực hành mô phỏng →</button></div><div class="lab-grid"><article class="lab-card"><h3>Node reliability lab</h3><div class="lab-toolbar"><label>Packet loss<input id="sysLoss" type="range" min="0" max="60" value="8" class="lab-slider"></label><label>Latency<input id="sysLat" type="range" min="10" max="500" value="80" class="lab-slider"></label><label>Redundancy<select id="sysRed" class="input"><option value="1">1 node</option><option value="2" selected>2 nodes</option><option value="3">3 nodes</option></select></label></div><div class="lab-node-row"><div class="lab-node">Sensor</div><div class="lab-arrow"></div><div class="lab-node">Node</div><div class="lab-arrow"></div><div class="lab-node">MQTT</div><div class="lab-arrow"></div><div class="lab-node">Main</div></div></article><article class="lab-card"><h3>Telemetry</h3><div class="lab-kpi"><div><b id="sysRel">0%</b><small>reliability</small></div><div><b id="sysMode">normal</b><small>mode</small></div><div><b id="sysAction">none</b><small>action</small></div></div><div class="lab-console" id="sysConsole"></div></article></div></div>`;setTimeout(()=>{['sysLoss','sysLat','sysRed'].forEach(i=>$(i)?.addEventListener('input',sysSim));sysSim()},30)}
function sysSim(){const loss=Number($('sysLoss')?.value||0),lat=Number($('sysLat')?.value||0),red=Number($('sysRed')?.value||1);let rel=Math.max(0,100-loss*1.1-lat/18+red*8);let mode=rel<70?'degraded':lat>250?'safe-latency':'normal';let act=mode==='normal'?'continue':mode==='degraded'?'switch redundant node':'slow control loop';$('sysRel').textContent=rel.toFixed(1)+'%';$('sysMode').textContent=mode;$('sysAction').textContent=act;$('sysConsole').textContent=`loss=${loss}%\nlatency=${lat}ms\nredundancy=${red}\nmode=${mode}\naction=${act}`;}
function renderSignalLab(){
  $('sec-simulations').innerHTML=`<div class="lab-shell"><div class="lab-hero"><div><span class="lab-badge">Mô phỏng riêng</span><h3>Signal · telemetry/time-series lab</h3><p>Điều chỉnh trend, season, noise và anomaly để quan sát tín hiệu robot.</p></div><button class="btn primary" onclick="nav('simulationPractice')">Thực hành mô phỏng →</button></div><div class="lab-grid"><article class="lab-card"><h3>Time-series generator</h3><div class="lab-toolbar"><label>Noise<input id="sigNoise" type="range" min="0" max="80" value="20" class="lab-slider"></label><label>Trend<input id="sigTrend" type="range" min="0" max="80" value="25" class="lab-slider"></label><label>Anomaly<input id="sigAnom" type="range" min="0" max="100" value="45" class="lab-slider"></label></div><canvas id="sigCanvas" class="sim-canvas"></canvas></article><article class="lab-card"><h3>Detection</h3><div class="lab-kpi"><div><b id="sigScore">0</b><small>anomaly</small></div><div><b id="sigForecast">ok</b><small>forecast</small></div><div><b id="sigAction">none</b><small>action</small></div></div><div class="lab-console" id="sigConsole"></div></article></div></div>`;setTimeout(()=>{['sigNoise','sigTrend','sigAnom'].forEach(i=>$(i)?.addEventListener('input',sigSim));sigSim()},30)}
function sigSim(){const noise=Number($('sigNoise')?.value||0),trend=Number($('sigTrend')?.value||0),anom=Number($('sigAnom')?.value||0);drawSignal('sigCanvas',noise,trend,anom);const score=Math.round(anom*.8+noise*.2);$('sigScore').textContent=score;$('sigForecast').textContent=noise>55?'unstable':'ok';$('sigAction').textContent=score>60?'inspect sensor':'monitor';$('sigConsole').textContent=`decompose = trend + season + noise\nnoise=${noise}\ntrend=${trend}\nanomaly_score=${score}\nrecommendation=${score>60?'open anomaly report':'continue monitoring'}`;}
function renderResearchLab(){
  $('sec-simulations').innerHTML=`<div class="lab-shell"><div class="lab-hero"><div><span class="lab-badge">Mô phỏng riêng</span><h3>НИР/ВКР · hội đồng đề tài và phản biện</h3><p>Chấm điểm ý tưởng UGV/USV theo dữ liệu, linh kiện, tính mới và rủi ro.</p></div><button class="btn primary" onclick="nav('simulationPractice')">Thực hành mô phỏng →</button></div><div class="lab-grid"><article class="lab-card"><h3>Topic scoring board</h3><div class="lab-toolbar"><label>Novelty<input id="rsNovel" type="range" min="0" max="10" value="7" class="lab-slider"></label><label>Data<input id="rsData" type="range" min="0" max="10" value="6" class="lab-slider"></label><label>Hardware<input id="rsHard" type="range" min="0" max="10" value="8" class="lab-slider"></label><label>Risk<input id="rsRisk" type="range" min="0" max="10" value="4" class="lab-slider"></label></div><div class="lab-kpi"><div><b id="rsScore">0</b><small>score</small></div><div><b id="rsDecision">?</b><small>decision</small></div><div><b id="rsTrack">UGV</b><small>track</small></div></div></article><article class="lab-card"><h3>Defense questions</h3><div class="lab-console" id="rsConsole"></div></article></div></div>`;setTimeout(()=>{['rsNovel','rsData','rsHard','rsRisk'].forEach(i=>$(i)?.addEventListener('input',rsSim));rsSim()},30)}
function rsSim(){const n=Number($('rsNovel').value),d=Number($('rsData').value),h=Number($('rsHard').value),r=Number($('rsRisk').value);const score=Math.round((n*3+d*3+h*2-r*2)*5);$('rsScore').textContent=score;$('rsDecision').textContent=score>=60?'go':'revise';$('rsTrack').textContent=h>d?'UGV':'USV/Telemetry';$('rsConsole').textContent=`Q1: Dữ liệu lấy từ đâu và có đủ tái lập không?\nQ2: Vì sao UGV phù hợp hơn UAV/UUV?\nQ3: Metric nào chứng minh cải thiện?\nQ4: Rủi ro linh kiện và kế hoạch thay thế?\nDecision=${score>=60?'Có thể đưa vào НИР':'Cần thu hẹp đề tài'}`;}
function renderFoundationLab(){
  $('sec-simulations').innerHTML=`<div class="lab-shell"><div class="lab-hero"><div><span class="lab-badge">Mô phỏng riêng</span><h3>Dự bị · lớp học Nga, Toán, Tin, Vật lý</h3><p>Quan sát tình huống lớp dự bị: đề bài, thuật ngữ, hỏi lại giảng viên.</p></div><button class="btn primary" onclick="nav('simulationPractice')">Thực hành mô phỏng →</button></div><div class="lab-grid"><article class="lab-card"><h3>Russian classroom simulator</h3><div class="roleplay-chat" id="fdChat"><div class="bubble bot">Прочитайте условие задачи. Что нужно найти?</div></div><div class="choice-row"><button class="btn sm" onclick="fdReply(1)">Повторите, пожалуйста.</button><button class="btn sm" onclick="fdReply(2)">Нужно найти решение уравнения.</button><button class="btn sm" onclick="fdReply(3)">Я не понимаю тему.</button></div></article><article class="lab-card"><h3>Feedback</h3><div class="lab-console" id="fdConsole">Chọn câu trả lời để xem phản hồi.</div></article></div></div>`}
function fdReply(i){const chat=$('fdChat'),txt={1:'Повторите, пожалуйста.',2:'Нужно найти решение уравнения.',3:'Я не понимаю тему.'}[i];chat.innerHTML+=`<div class="bubble user">${txt}</div>`;$('fdConsole').textContent=i===2?'Tốt: trả lời đúng yêu cầu bài toán.':'Ổn trong giao tiếp, nhưng cần thêm câu hỏi cụ thể để giảng viên hỗ trợ nhanh hơn.';}
function renderGenericLab(){
  const list=simsInStage('observation');
  $('sec-simulations').innerHTML=`<div class="lab-shell"><div class="lab-hero"><div><span class="lab-badge">Mô phỏng riêng</span><h3>${esc(CONFIG.title)} · interactive lab</h3><p>Quan sát cơ chế bằng tham số, bảng kết quả và phản hồi trực tiếp.</p></div><button class="btn primary" onclick="nav('simulationPractice')">Thực hành mô phỏng →</button></div><div class="sim-grid">${list.map(sim=>`<article class="sim-card"><span class="tag">${esc(sim.stage)} · ${esc(sim.type)}</span><h3>${esc(sim.title)}</h3><p>${esc(sim.goal)}</p><div class="sim-box"><b>Kịch bản:</b> ${esc(sim.scenario)}</div><button class="btn sm primary" onclick="runObservationSim('${sim.id}')">Chạy mô phỏng</button><div class="sim-result" id="sim-result-${sim.id}"></div></article>`).join('')||'<div class="panel">Chưa có mô phỏng riêng cho giai đoạn này.</div>'}</div></div>`
}
function runObservationSim(id){
  const sim=(store.simulations?.observation||[]).find(x=>x.id===id); if(!sim)return;
  state.progress.simulations=state.progress.simulations||{}; state.progress.simulations[id]={ran:true,at:new Date().toISOString(),stage:state.stage}; save();
  const out=(sim.outputs||[]).map((x,i)=>`<li>${esc(x)}: <b>${Math.max(10,Math.min(95,35+i*18+Math.floor(Math.random()*16)))}%</b> mức ảnh hưởng giả lập</li>`).join('');
  const el=$('sim-result-'+id); if(el){el.style.display='block';el.innerHTML=`<b>Kết quả mô phỏng:</b><ul>${out}</ul><small>Đã ghi nhận bạn đã chạy mô phỏng này.</small>`}
  toast('Đã chạy mô phỏng riêng')
}
function barCanvas(id,vals,labels){const c=$(id);if(!c)return;const r=c.getBoundingClientRect();c.width=Math.max(320,r.width);c.height=220;const ctx=c.getContext('2d'),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#f8fafc';ctx.fillRect(0,0,w,h);vals.forEach((v,i)=>{const bw=w/(vals.length*2),x=40+i*(bw*2),bh=(h-50)*v/100;ctx.fillStyle=['#2563eb','#10b981','#f97316'][i%3];ctx.fillRect(x,h-30-bh,bw,bh);ctx.fillStyle='#0f172a';ctx.font='12px sans-serif';ctx.fillText(labels[i],x,h-10);ctx.fillText(v.toFixed?v.toFixed(1):v,x,h-36-bh)})}
function drawSignal(id,noise,trend,anom){const c=$(id);if(!c)return;const r=c.getBoundingClientRect();c.width=Math.max(320,r.width);c.height=220;const ctx=c.getContext('2d'),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='white';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#e2e8f0';for(let y=30;y<h;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}ctx.strokeStyle='#2563eb';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<90;i++){const x=i*w/89;let y=h/2-Math.sin(i/7)*35-trend*i/160+(Math.random()-.5)*noise*.9;if(i===55)y-=anom; if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke();ctx.fillStyle='#ef4444';ctx.beginPath();ctx.arc(55*w/89,h/2-Math.sin(55/7)*35-trend*55/160-anom,6,0,Math.PI*2);ctx.fill()}

function assistant(){ $('sec-assistant').innerHTML=`<div class="panel"><h3>Trợ lý môn</h3><p style="color:var(--muted)">Tìm trong bài học, mẫu/công thức, bài tập của toàn bộ giai đoạn.</p><div class="ai-box"><input id="aiQuery" class="input" placeholder="Tìm nội dung cần học..."><button class="btn primary" onclick="runSearch()">Tìm</button></div><div class="results" id="searchResults"></div></div>`}
function runSearch(){const q=$('aiQuery').value.toLowerCase().trim();if(!q)return;const results=store.knowledge.filter(k=>(k.title+' '+k.text+' '+(k.stage||'')).toLowerCase().includes(q)).slice(0,16);$('searchResults').innerHTML=results.map(r=>`<article class="result"><span class="tag">${esc(r.type)} · ${esc(r.stage||'')}</span><h3>${esc(r.title)}</h3><p>${esc(r.text.slice(0,320))}</p><button class="btn sm" onclick="goTarget('${r.type}','${r.target}')">Đi tới</button></article>`).join('')||'<div class="result">Không tìm thấy. Thử từ khóa khác.</div>'}
function goTarget(type,target){if(type==='lesson'){openLesson(target)}else if(type==='formula'){state.formulaGroup='all';nav('formulas');setTimeout(()=>toast('Mẫu/công thức cần tìm nằm trong danh sách.'),100)}else{nav('exercises')}}
function dataPage(){const counts=[['stages',stages().length],['modules',store.curriculum?.modules?.length||0],['lessons',store.lessons.length],['formulas',store.formulas.length],['exercises',store.exercises.length],['tests',store.tests.questions.length],['knowledge',store.knowledge.length]];$('sec-data').innerHTML=`<div class="data-grid">${counts.map(([k,v])=>`<div class="panel metric"><b>${v}</b><small>${k}</small></div>`).join('')}</div><div class="panel" style="margin-top:16px"><h3>Nhập JSON bổ sung</h3><p style="color:var(--muted)">Dữ liệu gốc nằm trong <code>subjects/${CONFIG.id}/data/</code>. Bản HTML local không ghi trực tiếp vào ổ cứng, nên sau khi chỉnh hãy xuất/chép lại bằng VS Code.</p><input class="input" type="file" accept=".json" onchange="importJSON(event)"></div>`}
function importJSON(e){const file=e.target.files[0]; if(!file)return; const r=new FileReader(); r.onload=()=>{try{JSON.parse(r.result);toast('Đã đọc JSON. Muốn tích hợp bền vững hãy chép vào thư mục data bằng VS Code.')}catch{toast('JSON không hợp lệ')}}; r.readAsText(file)}
function continueLearning(){const mods=modules();const m=mods.find(x=>moduleProgress(x.id)<100)||mods[0];if(m){state.module=m.id;save();nav('roadmap')}}
function reportProgress(){const o=overall();window.parent?.postMessage?.({type:'SUBJECT_FEEDBACK',subjectId:CONFIG.id,stage:state.stage,progress:o.pct,completed:o.pct>=100,weakPoints:collectWeak(),recommendedReview:recommendReview(),updatedAt:new Date().toISOString()},'*')}
function collectWeak(){const wrongTests=Object.values(state.progress.tests||{}).filter(t=>t.score<8);return wrongTests.length?['cần luyện kiểm tra mức đã làm','ôn lại câu sai theo reviewLesson']:['đang học theo lộ trình']}
function recommendReview(){const m=modules().find(x=>moduleProgress(x.id)<100);return m?[m.id,...(m.lessons||[]).slice(0,2)]:['mini_project']}
window.addEventListener('DOMContentLoaded',init);
