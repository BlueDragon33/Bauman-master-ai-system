'use strict';
(function(){
  const VERSION='Academic Phase2 Current-Main · A3 Event Evidence · Grade Bridge';
  const STORE_KEY='bauman_academic_2026_event_readiness_v1';
  const CURRENT_USER_KEY='bauman_current_user_fullcode_v1';
  const COURSE_ORDER=['d01','d02','d03','d04','d05','d06','d15','p02'];
  const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
  const h=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const courseRuntime=()=>window.BAUMAN_COURSE_READINESS_2026||null;
  const architecture=()=>window.BAUMAN_COURSE_ARCHITECTURE_S1_2026||null;

  function currentUserScope(){try{const u=JSON.parse(localStorage.getItem(CURRENT_USER_KEY)||'null');return String(u?.email||'anonymous').toLowerCase()}catch{return 'anonymous'}}
  function blankStore(){return {schema:'bauman_academic_event_readiness_store_v1',version:'A3',users:{}}}
  function readStore(){try{const x=JSON.parse(localStorage.getItem(STORE_KEY)||'null');return x&&typeof x==='object'?x:blankStore()}catch{return blankStore()}}
  function userState(store=readStore()){store.version='A3';store.users=store.users&&typeof store.users==='object'?store.users:{};const scope=currentUserScope();store.users[scope]=store.users[scope]&&typeof store.users[scope]==='object'?store.users[scope]:{events:{}};store.users[scope].events=store.users[scope].events&&typeof store.users[scope].events==='object'?store.users[scope].events:{};return {store,scope,user:store.users[scope]}}
  function persist(store){localStorage.setItem(STORE_KEY,JSON.stringify(store));return true}
  function courseById(id){return (architecture()?.courses||[]).find(x=>x.courseId===id)||null}
  function eventKey(courseId,event){return `${courseId}::${event.code}::${event.timing||'unknown'}`}
  function definition(courseId,code){const course=courseById(courseId);if(!course)return null;const event=(course.eventModel?.events||[]).find(x=>x.code===code)||null;return event?{course,event,key:eventKey(courseId,event)}:null}
  function evidenceFor(courseId,code){const def=definition(courseId,code);if(!def)return null;const {user}=userState();return clone(user.events[def.key]||null)}
  function unresolvedTiming(event){return /^unresolved/.test(String(event?.timing||''))}
  function eventState(courseId,code){
    const def=definition(courseId,code);if(!def)return {id:'EVENT_UNASSESSED',label:'Event không tồn tại trong architecture',reason:'missing_definition',editable:false,evidence:null};
    const {event}=def,evidence=evidenceFor(courseId,code);
    if(unresolvedTiming(event))return {id:'EVENT_UNASSESSED',label:'Timing chưa được nguồn khóa',reason:'timing_unresolved',editable:false,event,evidence:null};
    if(!evidence)return {id:'EVENT_UNASSESSED',label:'Chưa có event-readiness evidence',reason:'missing_evidence',editable:true,event,evidence:null};
    const critical=Number(evidence.criticalOpenIssues),source=String(evidence.requirementSource||'').trim(),verified=evidence.requirementsVerified===true,met=evidence.allVerifiedRequirementsMet===true;
    const scoreNeeded=event.gradingNature==='graded'&&Number.isFinite(Number(event.internalTarget));
    const score=Number(evidence.rehearsalScore),scoreOk=!scoreNeeded||(Number.isFinite(score)&&score>=Number(event.internalTarget));
    const ready=verified&&source.length>=3&&met&&Number.isInteger(critical)&&critical===0&&scoreOk;
    if(ready)return {id:'EVENT_READY',label:'EVENT READY',reason:'verified_requirements_met',editable:true,event,evidence};
    return {id:'EVENT_PREPARING',label:'Đang chuẩn bị event',reason:'evidence_incomplete',editable:true,event,evidence};
  }
  function courseEventAxis(courseId){
    const course=courseById(courseId),events=course?.eventModel?.events||[];
    if(!events.length)return {id:'NOT_APPLICABLE',label:'Không có event đã mô hình hóa',events:[]};
    const rows=events.map(e=>({...e,...eventState(courseId,e.code)}));
    if(rows.some(x=>x.reason==='timing_unresolved'))return {id:'EVENT_UNASSESSED',label:'Event timing còn chưa khóa',events:rows};
    if(rows.every(x=>x.id==='EVENT_READY'))return {id:'EVENT_READY',label:'Tất cả event đã READY',events:rows};
    if(rows.some(x=>x.id==='EVENT_READY'||x.id==='EVENT_PREPARING'))return {id:'EVENT_PREPARING',label:'Đang chuẩn bị assessment event',events:rows};
    return {id:'EVENT_UNASSESSED',label:'Chưa đánh giá event readiness',events:rows};
  }
  function recordEvidence(courseId,code,payload={}){
    const def=definition(courseId,code);if(!def)throw new Error('Assessment event không tồn tại trong course architecture.');
    if(unresolvedTiming(def.event))throw new Error('Không thể đánh dấu readiness khi assessment timing của môn nhiều học kỳ chưa được nguồn khóa.');
    const requirementsVerified=payload.requirementsVerified===true,allVerifiedRequirementsMet=payload.allVerifiedRequirementsMet===true,requirementSource=String(payload.requirementSource||'').trim(),criticalOpenIssues=Number(payload.criticalOpenIssues);
    if(requirementsVerified&&requirementSource.length<3)throw new Error('Khi xác nhận đã kiểm chứng yêu cầu, phải ghi nguồn/yêu cầu đã kiểm chứng.');
    if(!Number.isInteger(criticalOpenIssues)||criticalOpenIssues<0)throw new Error('Critical open issues phải là số nguyên từ 0 trở lên.');
    let rehearsalScore=null;
    if(def.event.gradingNature==='graded'){
      if(payload.rehearsalScore!==''&&payload.rehearsalScore!=null){rehearsalScore=Number(payload.rehearsalScore);if(!Number.isFinite(rehearsalScore)||rehearsalScore<0||rehearsalScore>100)throw new Error('Rehearsal score phải nằm trong 0–100.');}
    }
    const row={requirementsVerified,requirementSource,allVerifiedRequirementsMet,criticalOpenIssues,rehearsalScore,notes:String(payload.notes||'').trim(),updatedAt:new Date().toISOString(),source:'explicit_event_readiness_evidence'};
    const {store,user}=userState();user.events[def.key]=row;persist(store);refreshUi();return eventState(courseId,code);
  }
  function clearEvidence(courseId,code){const def=definition(courseId,code);if(!def)return null;const {store,user}=userState();delete user.events[def.key];persist(store);refreshUi();return eventState(courseId,code)}

  function readinessCounts(){
    const counts={ready:0,preparing:0,unassessed:0,timingUnresolved:0,total:0};
    for(const courseId of COURSE_ORDER){const course=courseById(courseId);for(const event of course?.eventModel?.events||[]){counts.total++;const state=eventState(courseId,event.code);if(state.reason==='timing_unresolved')counts.timingUnresolved++;else if(state.id==='EVENT_READY')counts.ready++;else if(state.id==='EVENT_PREPARING')counts.preparing++;else counts.unassessed++;}}
    return counts;
  }
  function currentResolvedEvents(){
    const out=[];for(const courseId of COURSE_ORDER){const course=courseById(courseId);for(const event of course?.eventModel?.events||[]){if(!unresolvedTiming(event))out.push({course,event,state:eventState(courseId,event.code)})}}return out;
  }
  function badge(state){const cls=state.id==='EVENT_READY'?'ready':state.id==='EVENT_PREPARING'?'preparing':'unassessed';return `<span class="event14c-badge ${cls}">${h(state.label)}</span>`}
  function renderPanel(){
    const counts=readinessCounts(),rows=currentResolvedEvents().map(({course,event,state})=>`<button class="event14c-row" onclick="openAcademicEventReadiness2026('${h(course.courseId)}','${h(event.code)}')"><span><b>${h(course.courseId)} · ${h(event.code)}</b><small>${event.gradingNature==='graded'?`graded · target nội bộ ${h(event.internalTarget)}`:'pass/fail · không target số'}</small></span>${badge(state)}</button>`).join('');
    return `<section class="event14c-shell" data-event14c="ledger"><article class="academic2026-panel"><div class="academic2026-head"><div><span class="academic2026-badge">PHASE 2 · PASS 14C</span><h3>Assessment Event Readiness</h3><p>Chỉ EVENT_READY khi yêu cầu thật đã được kiểm chứng, tất cả yêu cầu đã kiểm chứng đều đạt, không còn critical issue; event có điểm còn cần rehearsal score đạt target nội bộ.</p></div><span class="academic2026-lock">No official-result / no scheduler mutation</span></div><div class="event14c-kpis"><span><b>${counts.ready}</b><small>READY</small></span><span><b>${counts.preparing}</b><small>PREPARING</small></span><span><b>${counts.unassessed}</b><small>UNASSESSED</small></span><span><b>${counts.timingUnresolved}</b><small>TIMING LOCKED</small></span></div><div class="event14c-list">${rows}</div></article></section>`;
  }

  function eventForm(courseId,code){
    const def=definition(courseId,code);if(!def)return '<p>Event không tồn tại.</p>';const state=eventState(courseId,code),e=state.evidence||{},event=def.event;
    if(!state.editable)return `<div class="event14c-locked"><b>${h(state.label)}</b><p>Hub không cho phép tạo EVENT_READY từ một assessment event chưa biết timing trong curriculum đã khóa.</p></div>`;
    const checked=v=>v===true?'checked':'';const scoreField=event.gradingNature==='graded'?`<label>Rehearsal score (0–100, target nội bộ ${h(event.internalTarget)})<input class="field" id="event14cScore" type="number" min="0" max="100" value="${e.rehearsalScore??''}"></label>`:'<p class="academic2026-note">Đây là Зчт/pass-fail: không gán target số 90.</p>';
    return `<div class="event14c-form"><div class="event14c-state">${badge(state)}</div><label class="event14c-check"><input id="event14cVerified" type="checkbox" ${checked(e.requirementsVerified)}> Tôi đã kiểm chứng yêu cầu assessment thực tế của môn/event này.</label><label>Nguồn/yêu cầu đã kiểm chứng<input class="field" id="event14cSource" value="${h(e.requirementSource||'')}" placeholder="Ví dụ: LMS/giảng viên/đề cương đã được xác nhận"></label><label class="event14c-check"><input id="event14cMet" type="checkbox" ${checked(e.allVerifiedRequirementsMet)}> Tất cả yêu cầu đã kiểm chứng hiện đều đạt.</label><label>Critical open issues<input class="field" id="event14cCritical" type="number" min="0" step="1" value="${e.criticalOpenIssues??0}"></label>${scoreField}<label>Ghi chú evidence<textarea class="field" id="event14cNotes" rows="3">${h(e.notes||'')}</textarea></label><div class="event14c-actions"><button class="btn primary" onclick="saveAcademicEventReadiness2026('${h(courseId)}','${h(code)}')">Lưu readiness evidence</button>${state.evidence?`<button class="btn" onclick="clearAcademicEventReadiness2026('${h(courseId)}','${h(code)}')">Xóa evidence</button>`:''}</div><p class="academic2026-note">EVENT_READY là trạng thái chuẩn bị nội bộ của Hub, không phải điểm chính thức và không tự đánh dấu course COMPLETED.</p></div>`;
  }
  function openEvent(courseId,code){const def=definition(courseId,code);if(!def)return;const title=`${courseId} · ${code} · Assessment readiness`;const body=`<div class="event14c-modal"><h4>${h(def.course.nameRu)}</h4><p>${def.event.gradingNature==='graded'?`Event có điểm · target nội bộ ${h(def.event.internalTarget)}`:'Event pass/fail · không target số'}</p>${eventForm(courseId,code)}</div>`;if(typeof window.openModal==='function')return window.openModal(title,body,true)}
  function saveFromUi(courseId,code){try{const v=id=>document.getElementById(id),state=recordEvidence(courseId,code,{requirementsVerified:v('event14cVerified')?.checked===true,requirementSource:v('event14cSource')?.value||'',allVerifiedRequirementsMet:v('event14cMet')?.checked===true,criticalOpenIssues:v('event14cCritical')?.value,rehearsalScore:v('event14cScore')?.value,notes:v('event14cNotes')?.value||''});openEvent(courseId,code);if(typeof window.toast==='function')window.toast(`${courseId} ${code}: ${state.label}`)}catch(err){alert(err.message||String(err))}}
  function clearFromUi(courseId,code){clearEvidence(courseId,code);openEvent(courseId,code)}
  function refreshUi(){return true}
  async function waitBase(timeout=15000){const start=Date.now();while(Date.now()-start<timeout){if(courseRuntime()&&architecture()&&window.app?.__course14bPatched)return true;await new Promise(r=>setTimeout(r,50))}return false}
  async function load(){try{if(!(await waitBase()))throw new Error('A2 course runtime did not become ready');console.info(VERSION,{storageKey:STORE_KEY,userScoped:true,schedulerMutation:false,officialResultMutation:false,gradeBridge:true,surface:'course-progress-modal',homeSurfaceAdded:false})}catch(err){console.warn('A3 event runtime disabled safely:',err)}}
  let gradeLoadPromise=null;
  function ensureGradeRuntime(){
    if(window.BAUMAN_GRADE_CONTROL_2026&&window.BAUMAN_GRADING_POLICY_2024)return Promise.resolve(window.BAUMAN_GRADE_CONTROL_2026);
    if(gradeLoadPromise)return gradeLoadPromise;
    gradeLoadPromise=new Promise((resolve,reject)=>{
      if(!document.querySelector('link[data-phase2-grade-style]')){const link=document.createElement('link');link.rel='stylesheet';link.href='assets/css/academic-grade-2026.css';link.dataset.phase2GradeStyle='1';document.head.appendChild(link)}
      const waitReady=()=>{const started=Date.now();(function poll(){if(window.BAUMAN_GRADE_CONTROL_2026&&window.BAUMAN_GRADING_POLICY_2024)return resolve(window.BAUMAN_GRADE_CONTROL_2026);if(Date.now()-started>15000)return reject(new Error('A3 Grade runtime/policy did not become ready'));setTimeout(poll,50)})()};
      let script=document.querySelector('script[data-phase2-grade-runtime]');
      if(script){waitReady();return}
      script=document.createElement('script');script.src='assets/js/academic-grade-runtime.js';script.dataset.phase2GradeRuntime='1';script.async=false;script.addEventListener('load',waitReady,{once:true});script.addEventListener('error',()=>reject(new Error('A3 Grade runtime failed to load')),{once:true});document.body.appendChild(script);
    }).catch(err=>{gradeLoadPromise=null;throw err});
    return gradeLoadPromise;
  }

  window.openAcademicEventReadiness2026=openEvent;window.saveAcademicEventReadiness2026=saveFromUi;window.clearAcademicEventReadiness2026=clearFromUi;
  window.BAUMAN_EVENT_READINESS_2026=Object.freeze({version:VERSION,load,eventState,courseEventAxis,recordEvidence,clearEvidence,evidenceFor,readinessCounts,currentResolvedEvents,ensureGradeRuntime,storageKey:STORE_KEY,userScoped:true,schedulerMutation:false,officialResultMutation:false,surface:'course-progress-modal',homeSurfaceAdded:false,gradeBridge:true,lazyGradeLoad:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(load,0),{once:true});else setTimeout(load,0)
})();
