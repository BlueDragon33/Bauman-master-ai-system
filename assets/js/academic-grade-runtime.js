'use strict';
(function(){
  const VERSION='Academic 2026 Phase2 · Pass 14D Grade Control Ledger';
  const POLICY_URL='assets/data/grading-policy-bauman-2024.json';
  const STORE_KEY='bauman_academic_2026_grade_results_v1';
  const CURRENT_USER_KEY='bauman_current_user_fullcode_v1';
  const COURSE_ORDER=['d01','d02','d03','d04','d05','d06','d15','p02'];
  let policy=null;
  const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
  const h=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const architecture=()=>window.BAUMAN_COURSE_ARCHITECTURE_S1_2026||null;
  const eventRuntime=()=>window.BAUMAN_EVENT_READINESS_2026||null;
  const courseRuntime=()=>window.BAUMAN_COURSE_READINESS_2026||null;

  function currentUserScope(){try{const u=JSON.parse(localStorage.getItem(CURRENT_USER_KEY)||'null');return String(u?.email||'anonymous').toLowerCase()}catch{return 'anonymous'}}
  function blankStore(){return {schema:'bauman_academic_grade_result_store_v1',version:'PASS14D',users:{}}}
  function readStore(){try{const x=JSON.parse(localStorage.getItem(STORE_KEY)||'null');return x&&typeof x==='object'?x:blankStore()}catch{return blankStore()}}
  function userState(store=readStore()){store.version='PASS14D';store.users=store.users&&typeof store.users==='object'?store.users:{};const scope=currentUserScope();store.users[scope]=store.users[scope]&&typeof store.users[scope]==='object'?store.users[scope]:{results:{}};store.users[scope].results=store.users[scope].results&&typeof store.users[scope].results==='object'?store.users[scope].results:{};return {store,scope,user:store.users[scope]}}
  function persist(store){localStorage.setItem(STORE_KEY,JSON.stringify(store));return true}
  function courseById(id){return (architecture()?.courses||[]).find(x=>x.courseId===id)||null}
  function unresolved(event){return /^unresolved/.test(String(event?.timing||''))}
  function eventDefinition(courseId,code){const course=courseById(courseId);if(!course)return null;const event=(course.eventModel?.events||[]).find(x=>x.code===code)||null;return event?{course,event,key:`${courseId}::${event.code}::${event.timing||'unknown'}`}:null}
  function policyBand(score){const n=Number(score);if(!Number.isFinite(n)||n<0||n>100)return null;return (policy?.ratingScale||[]).find(x=>n>=Number(x.min)&&n<=Number(x.max))||null}
  function rawResult(courseId,code){const def=eventDefinition(courseId,code);if(!def)return null;const {user}=userState();return clone(user.results[def.key]||null)}

  function resultState(courseId,code){
    const def=eventDefinition(courseId,code);if(!def)return {id:'RESULT_UNRECORDED',label:'Event không tồn tại',reason:'missing_definition',editable:false,result:null};
    if(unresolved(def.event))return {id:'RESULT_TIMING_LOCKED',label:'Chưa khóa timing assessment',reason:'timing_unresolved',editable:false,event:def.event,result:null};
    const result=rawResult(courseId,code);if(!result)return {id:'RESULT_UNRECORDED',label:'Chưa ghi kết quả chính thức',reason:'missing_result',editable:true,event:def.event,result:null};
    if(def.event.gradingNature==='pass_fail'){
      return result.outcome==='pass'?{id:'CREDIT_PASSED',label:'ЗАЧЕТ · đã ghi',reason:'confirmed_pass',editable:true,event:def.event,result}:{id:'CREDIT_FAILED',label:'НЕЗАЧЕТ · đã ghi',reason:'confirmed_fail',editable:true,event:def.event,result};
    }
    const score=result.numericScore==null?null:Number(result.numericScore),band=score==null?null:policyBand(score),grade=result.officialGrade??band?.grade5Scale??null,target=Number(def.event.internalTarget);
    if(grade===2||(band&&band.grade5Scale===2))return {id:'RESULT_FAILED',label:'2 / không đạt',reason:'confirmed_failed_grade',editable:true,event:def.event,result,band};
    if(grade===3)return {id:'RESULT_SATISFACTORY',label:'3 · удовлетворительно',reason:'confirmed_grade_3',editable:true,event:def.event,result,band};
    if(grade===4)return {id:'RESULT_GOOD',label:'4 · хорошо',reason:'confirmed_grade_4',editable:true,event:def.event,result,band};
    if(grade===5&&score!=null&&Number.isFinite(target)&&score>=target)return {id:'RESULT_TARGET_MET',label:`5 · target ${target}+ đạt`,reason:'confirmed_score_target_met',editable:true,event:def.event,result,band};
    if(grade===5&&score!=null)return {id:'RESULT_EXCELLENT_BELOW_TARGET',label:'5 · отлично · dưới target nội bộ',reason:'confirmed_excellent_below_internal_target',editable:true,event:def.event,result,band};
    if(grade===5)return {id:'RESULT_EXCELLENT_GRADE_ONLY',label:'5 · отлично · chưa có score',reason:'confirmed_grade_5_without_score',editable:true,event:def.event,result,band};
    return {id:'RESULT_RECORDED',label:'Kết quả đã ghi',reason:'confirmed_result',editable:true,event:def.event,result,band};
  }

  function recordResult(courseId,code,payload={}){
    const def=eventDefinition(courseId,code);if(!def)throw new Error('Assessment event không tồn tại trong course architecture.');
    if(unresolved(def.event))throw new Error('Không thể ghi kết quả khi assessment timing của môn nhiều học kỳ chưa được nguồn khóa.');
    if(payload.resultConfirmed!==true)throw new Error('Phải xác nhận đây là kết quả assessment thực tế trước khi lưu.');
    const source=String(payload.resultSource||'').trim();if(source.length<3)throw new Error('Phải ghi nguồn của kết quả thực tế (LMS/giảng viên/bảng điểm...).');
    const row={resultConfirmed:true,resultSource:source,notes:String(payload.notes||'').trim(),recordedAt:new Date().toISOString(),source:'explicit_confirmed_assessment_result',supplementEntryVerified:false,supplementEntryCounted:null};
    if(def.event.gradingNature==='pass_fail'){
      const outcome=String(payload.outcome||'');if(!['pass','fail'].includes(outcome))throw new Error('Kết quả Зчт phải là pass hoặc fail.');row.outcome=outcome;row.numericScore=null;row.officialGrade=null;row.derivedGrade=null;
    }else{
      const hasScore=payload.numericScore!==''&&payload.numericScore!=null,hasGrade=payload.officialGrade!==''&&payload.officialGrade!=null;if(!hasScore&&!hasGrade)throw new Error('Event có điểm cần ít nhất numeric score hoặc official grade đã xác nhận.');
      let score=null,band=null,grade=null;if(hasScore){score=Number(payload.numericScore);if(!Number.isFinite(score)||score<0||score>100)throw new Error('Numeric score phải nằm trong 0–100.');band=policyBand(score);if(!band)throw new Error('Không ánh xạ được score vào grading policy đã khóa.');}
      if(hasGrade){grade=Number(payload.officialGrade);if(![2,3,4,5].includes(grade))throw new Error('Official grade phải là 2, 3, 4 hoặc 5.');}
      if(band&&grade!=null&&Number(band.grade5Scale)!==grade)throw new Error('Numeric score và official grade không nhất quán với grading policy đã khóa.');
      row.numericScore=score;row.officialGrade=grade;row.derivedGrade=band?.grade5Scale??null;
    }
    const {store,user}=userState();user.results[def.key]=row;persist(store);refreshUi();return resultState(courseId,code);
  }
  function clearResult(courseId,code){const def=eventDefinition(courseId,code);if(!def)return null;const {store,user}=userState();delete user.results[def.key];persist(store);refreshUi();return resultState(courseId,code)}
  function resolvedEvents(){const out=[];for(const courseId of COURSE_ORDER){const course=courseById(courseId);for(const event of course?.eventModel?.events||[])if(!unresolved(event))out.push({course,event,state:resultState(courseId,event.code)})}return out}
  function summary(){const out={total:0,recorded:0,targetMet:0,excellentBelowTarget:0,good:0,satisfactory:0,failed:0,creditsPassed:0,unrecorded:0};for(const x of resolvedEvents()){out.total++;const id=x.state.id;if(id==='RESULT_UNRECORDED')out.unrecorded++;else{out.recorded++;if(id==='RESULT_TARGET_MET')out.targetMet++;if(['RESULT_EXCELLENT_BELOW_TARGET','RESULT_EXCELLENT_GRADE_ONLY'].includes(id))out.excellentBelowTarget++;if(id==='RESULT_GOOD')out.good++;if(id==='RESULT_SATISFACTORY')out.satisfactory++;if(['RESULT_FAILED','CREDIT_FAILED'].includes(id))out.failed++;if(id==='CREDIT_PASSED')out.creditsPassed++;}}return out}
  function badge(state){const cls=state.id==='RESULT_TARGET_MET'||state.id==='CREDIT_PASSED'?'safe':state.id==='RESULT_UNRECORDED'?'empty':['RESULT_FAILED','CREDIT_FAILED'].includes(state.id)?'fail':'recorded';return `<span class="grade14d-badge ${cls}">${h(state.label)}</span>`}
  function renderPanel(){const s=summary(),rows=resolvedEvents().map(({course,event,state})=>`<button class="grade14d-row" onclick="openAcademicGradeResult2026('${h(course.courseId)}','${h(event.code)}')"><span><b>${h(course.courseId)} · ${h(event.code)}</b><small>${event.gradingNature==='graded'?`graded · safety target ${h(event.internalTarget)}`:'pass/fail · Зчт'}</small></span>${badge(state)}</button>`).join('');return `<section class="grade14d-shell" data-grade14d="ledger"><article class="academic2026-panel"><div class="academic2026-head"><div><span class="academic2026-badge">PHASE 2 · PASS 14D</span><h3>Grade Control · Kết quả assessment thực tế</h3><p>Chỉ ghi khi có kết quả thực tế đã xác nhận. Score được ánh xạ theo grading policy Bauman; target 90 là biên an toàn nội bộ, không phải biên điểm chính thức mới.</p></div><span class="academic2026-lock">No transcript counting · no course completion</span></div><div class="grade14d-kpis"><span><b>${s.recorded}/${s.total}</b><small>ĐÃ GHI</small></span><span><b>${s.targetMet}</b><small>TARGET 90+</small></span><span><b>${s.good+s.satisfactory+s.failed}</b><small>RỦI RO 5</small></span><span><b>${s.unrecorded}</b><small>CHƯA GHI</small></span></div><div class="grade14d-list">${rows}</div><p class="academic2026-note">Không dùng số event ở đây để tính tỷ lệ bằng đỏ: cấu trúc dòng trong phụ lục văn bằng phải được xác minh riêng.</p></article></section>`}

  function form(courseId,code){
    const def=eventDefinition(courseId,code);if(!def)return '<p>Event không tồn tại.</p>';const state=resultState(courseId,code),r=state.result||{};
    if(!state.editable)return `<div class="grade14d-locked"><b>${h(state.label)}</b><p>Cần khóa timing bằng nguồn curriculum/assessment có thẩm quyền trước khi cho ghi kết quả.</p></div>`;
    const confirmed=r.resultConfirmed===true?'checked':'',source=h(r.resultSource||'');let fields='';
    if(def.event.gradingNature==='pass_fail')fields=`<label>Kết quả<select class="field" id="grade14dOutcome"><option value="">Chọn</option><option value="pass" ${r.outcome==='pass'?'selected':''}>зачет / pass</option><option value="fail" ${r.outcome==='fail'?'selected':''}>незачет / fail</option></select></label>`;
    else fields=`<label>Numeric score 0–100 (nếu có)<input class="field" id="grade14dScore" type="number" min="0" max="100" value="${r.numericScore??''}"></label><label>Official grade 2–5 (nếu có)<select class="field" id="grade14dGrade"><option value="">Chưa nhập</option>${[5,4,3,2].map(g=>`<option value="${g}" ${Number(r.officialGrade)===g?'selected':''}>${g}</option>`).join('')}</select></label>`;
    return `<div class="grade14d-form"><div>${badge(state)}</div><label class="grade14d-check"><input id="grade14dConfirmed" type="checkbox" ${confirmed}> Tôi xác nhận đây là kết quả assessment thực tế, không phải rehearsal/ước lượng.</label><label>Nguồn kết quả<input class="field" id="grade14dSource" value="${source}" placeholder="LMS / giảng viên / bảng điểm / ведомость..."></label>${fields}<label>Ghi chú<textarea class="field" id="grade14dNotes" rows="3">${h(r.notes||'')}</textarea></label><div class="grade14d-actions"><button class="btn primary" onclick="saveAcademicGradeResult2026('${h(courseId)}','${h(code)}')">Lưu kết quả</button>${state.result?`<button class="btn" onclick="clearAcademicGradeResult2026('${h(courseId)}','${h(code)}')">Xóa kết quả</button>`:''}</div><p class="academic2026-note"><code>derivedGrade</code> nếu có chỉ là ánh xạ từ numeric score theo policy 2024. Hub không tự đánh dấu course COMPLETED và không suy ra dòng phụ lục văn bằng.</p></div>`;
  }
  function openResult(courseId,code){const def=eventDefinition(courseId,code);if(!def)return;const readiness=eventRuntime()?.eventState?.(courseId,code);const body=`<div class="grade14d-modal"><h4>${h(def.course.nameRu)}</h4><p>Readiness trước event: <b>${h(readiness?.label||'—')}</b></p>${form(courseId,code)}</div>`;if(typeof window.openModal==='function')return window.openModal(`${courseId} · ${code} · Grade Control`,body,true)}
  function saveFromUi(courseId,code){try{const v=id=>document.getElementById(id),state=recordResult(courseId,code,{resultConfirmed:v('grade14dConfirmed')?.checked===true,resultSource:v('grade14dSource')?.value||'',outcome:v('grade14dOutcome')?.value||'',numericScore:v('grade14dScore')?.value,officialGrade:v('grade14dGrade')?.value,notes:v('grade14dNotes')?.value||''});openResult(courseId,code);if(typeof window.toast==='function')window.toast(`${courseId} ${code}: ${state.label}`)}catch(err){alert(err.message||String(err))}}
  function clearFromUi(courseId,code){clearResult(courseId,code);openResult(courseId,code)}
  function appendPanel(){const root=document.getElementById('page-home');if(!root||root.querySelector('[data-grade14d="ledger"]'))return;root.insertAdjacentHTML('beforeend',renderPanel())}
  function refreshUi(){try{if(window.app?.home)window.app.home();else appendPanel()}catch{appendPanel()}}
  function patchHome(){if(!window.app||window.app.__grade14dPatched)return false;if(!window.app.__event14cPatched)return false;const app=window.app,oldHome=app.home.bind(app);app.__grade14dPatched=true;app.home=function(){oldHome();appendPanel()};app.home();return true}
  async function fetchJson(url){const r=await fetch(url,{cache:'no-cache'});if(!r.ok)throw new Error(`${url} HTTP ${r.status}`);return r.json()}
  async function waitBase(timeout=15000){const start=Date.now();while(Date.now()-start<timeout){if(eventRuntime()&&courseRuntime()&&architecture()&&window.app?.__event14cPatched)return true;await new Promise(r=>setTimeout(r,50))}return false}
  async function load(){try{policy=await fetchJson(POLICY_URL);window.BAUMAN_GRADING_POLICY_2024=policy;if(!(await waitBase()))throw new Error('Pass14C event runtime did not become ready');if(!patchHome())throw new Error('Could not patch home for Pass14D');console.info(VERSION,{policy:policy.version,storageKey:STORE_KEY,supplementCounting:false,courseCompletionMutation:false})}catch(err){console.warn('Pass14D grade runtime disabled safely:',err)}}
  function bootstrapTranscriptRuntime(){
    if(!document.querySelector('link[data-phase2-transcript-style]')){const link=document.createElement('link');link.rel='stylesheet';link.href='assets/css/academic-transcript-2026.css';link.dataset.phase2TranscriptStyle='1';document.head.appendChild(link)}
    if(window.BAUMAN_TRANSCRIPT_HONORS_2026||document.querySelector('script[data-phase2-transcript-runtime]'))return;
    const script=document.createElement('script');script.src='assets/js/academic-transcript-runtime.js';script.dataset.phase2TranscriptRuntime='1';script.async=false;document.body.appendChild(script);
  }

  window.openAcademicGradeResult2026=openResult;window.saveAcademicGradeResult2026=saveFromUi;window.clearAcademicGradeResult2026=clearFromUi;
  window.BAUMAN_GRADE_CONTROL_2026=Object.freeze({version:VERSION,load,resultState,recordResult,clearResult,rawResult,policyBand,resolvedEvents,summary,storageKey:STORE_KEY,userScoped:true,schedulerMutation:false,courseCompletionMutation:false,supplementCounting:false,policyUrl:POLICY_URL});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setTimeout(load,0);setTimeout(bootstrapTranscriptRuntime,0)},{once:true});else {setTimeout(load,0);setTimeout(bootstrapTranscriptRuntime,0)}
})();