'use strict';
(function(){
  const VERSION='Academic Phase2 Current-Main · A2 Course Readiness + A3→A5 Evidence Bridge';
  const ARCH_URL='assets/data/course-learning-architecture-s1-2026.json';
  const COURSE_ORDER=['d01','d02','d03','d04','d05','d06','d15','p02'];
  let architecture=null;

  const h=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const byId=(arr,id)=>(arr||[]).find(x=>x.courseId===id)||null;
  const phase1=()=>window.BAUMAN_ACADEMIC_2026_RUNTIME||null;
  const prereq=()=>window.BAUMAN_PREREQ_2026||null;
  const curriculum=()=>window.BAUMAN_CURRICULUM_2026||null;
  const officialById=id=>{
    const c=curriculum();
    if(!c)return null;
    return (c.disciplines||[]).find(x=>x.id===id)||(c.practices||[]).find(x=>x.id===id)||null;
  };
  const courseById=id=>byId(architecture?.courses,id);

  function prereqAxis(courseId){
    const course=courseById(courseId);
    if(!course)return {id:'UNASSESSED',label:'Chưa có course architecture',reason:'missing_course_architecture'};
    if(course.courseLocalReadiness){
      return {id:'UNASSESSED',label:'Chưa đánh giá English readiness',reason:'course_local_readiness_unassessed',localReadiness:course.courseLocalReadiness};
    }
    const raw=phase1()?.courseReadiness?.(courseId);
    if(!raw||raw.id==='unassessed')return {id:'UNASSESSED',label:'Chưa chẩn đoán đủ prerequisite',reason:raw?.id||'runtime_unavailable',raw};
    if(['rebuild','repair','bridge'].includes(raw.id))return {id:'PREREQ_REPAIR',label:'Cần sửa prerequisite',reason:raw.id,score:raw.score,raw};
    if(['ready','mastered'].includes(raw.id))return {id:'COURSE_READY',label:raw.id==='mastered'?'Prerequisite MASTERED':'Prerequisite READY',reason:raw.id,score:raw.score,raw};
    return {id:'UNASSESSED',label:'Chưa xác định',reason:'unknown_phase1_state',raw};
  }

  function stageSemester(){
    const id=phase1()?.currentStageId?.()||'before_stankin';
    const m=String(id).match(/^semester_(\d)$/);
    return {stageId:id,semester:m?Number(m[1]):null};
  }

  function lifecycleAxis(courseId){
    const course=courseById(courseId),stage=stageSemester();
    if(!course)return {id:null,label:'Chưa ghi trạng thái',reason:'missing_course'};
    const sems=course.official?.semesters||[];
    if(stage.semester==null)return {id:'NOT_STARTED',label:'Chưa bắt đầu',reason:'pre_program_stage',stageId:stage.stageId};
    if(sems.includes(stage.semester))return {id:'COURSE_ACTIVE',label:'Đang trong học kỳ có môn',reason:'semester_membership',stageId:stage.stageId};
    if(sems.length&&stage.semester<Math.min(...sems))return {id:'NOT_STARTED',label:'Chưa bắt đầu',reason:'future_semester',stageId:stage.stageId};
    return {id:null,label:'Chưa ghi kết quả vòng đời',reason:'no_completion_evidence',stageId:stage.stageId};
  }

  function fallbackEventAxis(courseId){
    const course=courseById(courseId),stage=stageSemester(),events=course?.eventModel?.events||[];
    if(!events.length)return {id:'NOT_APPLICABLE',label:'Không có event đã mô hình hóa',events:[]};
    const rows=events.map(event=>{
      const unresolved=/^unresolved/.test(event.timing||'');
      const inCurrent=stage.semester!=null&&event.timing===`semester_${stage.semester}`;
      return {...event,state:'EVENT_UNASSESSED',label:unresolved?'Timing chưa được nguồn khóa':(inCurrent?'Chưa có evidence event-readiness':'Chưa tới/không xác định event hiện tại')};
    });
    return {id:'EVENT_UNASSESSED',label:rows.some(x=>/^unresolved/.test(x.timing||''))?'Event timing còn chưa khóa':'Chưa đánh giá event readiness',events:rows};
  }
  function eventAxis(courseId){
    const enhanced=window.BAUMAN_EVENT_READINESS_2026?.courseEventAxis?.(courseId);
    return enhanced||fallbackEventAxis(courseId);
  }

  function gateRows(courseId){
    const course=courseById(courseId),rt=phase1();
    return (course?.criticalPrerequisites||[]).map(gateId=>{
      const gate=(prereq()?.coreGates||[]).concat(prereq()?.jitBridgeGates||[]).find(x=>x.id===gateId)||null;
      const state=rt?.gateState?.(gate)||{id:'unassessed',label:'Chưa chẩn đoán',score:null};
      const intervention=rt?.gateIntervention?.(gateId)||null;
      return {gateId,gate,state,intervention};
    });
  }

  function nextAction(courseId){
    const course=courseById(courseId),axis=prereqAxis(courseId),rows=gateRows(courseId);
    if(course?.courseLocalReadiness)return {type:'LOCAL_DIAGNOSTIC_PENDING',label:'Giữ d01 ở trạng thái chưa đánh giá cho tới khi có diagnostic tiếng Anh cục bộ đã kiểm chứng.',gateId:null};
    if(axis.id==='UNASSESSED'){
      const hit=rows.find(x=>x.state.id==='unassessed')||rows[0];
      return {type:'DIAGNOSE',label:hit?`Chẩn đoán ${hit.gateId} trước khi học lại rộng.`:'Chưa có prerequisite evidence đủ để ra quyết định.',gateId:hit?.gateId||null};
    }
    if(axis.id==='PREREQ_REPAIR'){
      const rank={rebuild:0,repair:1,bridge:2,ready:3,mastered:4,unassessed:-1};
      const hit=rows.filter(x=>!['ready','mastered'].includes(x.state.id)).sort((a,b)=>(rank[a.state.id]??9)-(rank[b.state.id]??9))[0];
      return {type:'REPAIR',label:hit?.intervention?.actionLabel||`Sửa gate ${hit?.gateId||''} theo diagnostic evidence.`,gateId:hit?.gateId||null};
    }
    return {type:'COURSE_STUDY',label:'Prerequisite đã đủ; chuyển trọng tâm sang học phần thật và chỉ repair JIT khi có bằng chứng mới.',gateId:null};
  }

  function allocationText(course){
    const a=course.semester1Allocation,t=course.official?.wholeCourseTotals||{};
    if(a?.status==='known_single_semester')return `HK1 xác định: ${a.credits} cr · ${a.hours} h`;
    return `HK1 chưa có phân bổ khóa · tổng toàn môn ${t.credits??'—'} cr · ${t.hours??'—'} h`;
  }
  function axisChip(axis,kind){return `<span class="course14b-axis ${h(kind)} ${h((axis.id||'unknown').toLowerCase())}"><b>${h(kind)}</b><small>${h(axis.label)}</small></span>`}
  function courseCard(course){
    const p=prereqAxis(course.courseId),life=lifecycleAxis(course.courseId),event=eventAxis(course.courseId),action=nextAction(course.courseId);
    const blockers=gateRows(course.courseId).filter(x=>!['ready','mastered'].includes(x.state.id));
    return `<button class="course14b-card" onclick="openOfficialCoursePhase2('${h(course.courseId)}')"><div class="course14b-card-head"><span>${h(course.courseId)}</span><strong>${h(course.nameRu)}</strong></div><p>${h(allocationText(course))}</p><div class="course14b-axis-row">${axisChip(p,'Prereq')}${axisChip(life,'Lifecycle')}${axisChip(event,'Event')}</div><small>${blockers.length?`Blocker: ${h(blockers.map(x=>x.gateId).join(', '))}`:course.courseLocalReadiness?'English readiness: chưa đánh giá':'Không có blocker prerequisite hiện tại'}</small><em>${h(action.label)}</em></button>`;
  }
  function renderProgressSummary(){
    if(!architecture)return '';
    return `<section class="course14b-shell course14b-progress" data-course14b-progress="s1"><div class="course14b-progress-head"><div><span class="academic2026-badge">PHASE2 · A2→A4 · READ-ONLY</span><h3>Course Readiness · Học kỳ 1</h3><p>Ba trục độc lập: prerequisite · lifecycle · event. Transcript/Honors là evidence riêng, không suy ra từ assessment event.</p></div><div class="course14b-progress-actions"><button class="btn" onclick="openCourseReadinessOverview2026()">Mở 8 học phần</button><button class="btn" data-a4-transcript-open onclick="openAcademicTranscriptEvidenceA4()">Phụ lục / Honors</button><button class="btn primary" data-a5-command-open onclick="openAcademicCommandCenterA5()">Academic Command Center</button></div></div><div class="course14b-grid course14b-grid-compact">${COURSE_ORDER.map(id=>courseById(id)).filter(Boolean).map(courseCard).join('')}</div></section>`;
  }

  function evidenceLabel(block){
    const map={competency_inference:'Hub inference',public_material_plus_competency_inference:'Public BMSTU + inference',course_local_planning_inference:'Course-local planning'};
    return map[block.evidenceClass]||block.evidenceClass||'—';
  }
  function eventRows(course){
    const axis=eventAxis(course.courseId),eventReady=Boolean(window.BAUMAN_EVENT_READINESS_2026);
    return (axis.events||[]).map(e=>{
      const unresolved=/^unresolved/.test(e.timing||'')||e.reason==='timing_unresolved',stateLabel=e.label||e.state||'EVENT_UNASSESSED';
      const content=`<span class="course14b-event-copy"><b>${h(e.code)}</b><span>${e.gradingNature==='graded'?`Có điểm · target nội bộ ${h(e.internalTarget)}`:'Pass/fail · không gán target 90'}</span><small>${h(stateLabel)}</small></span>`;
      if(unresolved)return `<div class="course14b-event course14b-event-a3 locked">${content}<span class="course14b-event-lock">Timing chưa khóa</span></div>`;
      const readiness=eventReady?`<button class="btn" onclick="openAcademicEventReadiness2026('${h(course.courseId)}','${h(e.code)}')">Readiness</button>`:'<span class="course14b-event-lock">A3 đang tải</span>';
      const grade=eventReady?`<button class="btn" onclick="openAcademicGradeEvidenceA3('${h(course.courseId)}','${h(e.code)}')">Kết quả</button>`:'';
      return `<div class="course14b-event course14b-event-a3">${content}<span class="course14b-event-actions">${readiness}${grade}</span></div>`;
    }).join('');
  }
  function blockersHtml(course){
    if(course.courseLocalReadiness)return `<div class="course14b-local"><b>${h(course.courseLocalReadiness.id)}</b><p>Ngôn ngữ: English · threshold: chưa định nghĩa. P0 Russian không phải gate của d01.</p><small>Nguồn: ${h(course.courseLocalReadiness.sourceEvidence?.[0]?.url||'—')}</small></div>`;
    const rows=gateRows(course.courseId);
    if(!rows.length)return '<p>Không có global critical gate đã đăng ký; trạng thái vẫn không được tự coi là READY.</p>';
    return rows.map(x=>`<button class="course14b-gate-row" onclick="openAcademicGate('${h(x.gateId)}')"><b>${h(x.gateId)} · ${h(x.gate?.name||'')}</b><span>${h(x.state.label)}${x.state.score==null?'':` · ${h(x.state.score)}%`}</span><small>${h(x.intervention?.actionLabel||'Chưa có intervention')}</small></button>`).join('');
  }
  function openCourse(courseId){
    const course=courseById(courseId);if(!course)return;
    const p=prereqAxis(courseId),life=lifecycleAxis(courseId),event=eventAxis(courseId),action=nextAction(courseId),blocks=(course.competencyBlocks||[]).map(b=>`<li><b>${h(b.label)}</b><small>${h(evidenceLabel(b))}</small></li>`).join('');
    const body=`<div class="course14b-modal"><section><h4>Ba trục trạng thái</h4><div class="course14b-axis-row">${axisChip(p,'Prereq')}${axisChip(life,'Lifecycle')}${axisChip(event,'Event')}</div><p class="academic2026-note">${h(allocationText(course))}. Assessment timing nhiều học kỳ giữ unresolved nếu curriculum không phân bổ.</p></section><section><h4>Blocker / readiness evidence</h4><div class="course14b-gates">${blockersHtml(course)}</div></section><section><h4>Competency blocks</h4><ul class="course14b-blocks">${blocks}</ul><p class="academic2026-note">Các block là planning inference trừ khi được gắn public evidence; không phải syllabus chính thức.</p></section><section><h4>Assessment events</h4><div class="course14b-events">${eventRows(course)}</div></section><section class="course14b-next"><h4>Việc tiếp theo</h4><p>${h(action.label)}</p>${action.gateId?`<button class="btn primary" onclick="openAcademicGate('${h(action.gateId)}')">Mở ${h(action.gateId)}</button>`:''}</section></div>`;
    if(typeof window.openModal==='function')return window.openModal(`${course.courseId} · ${course.nameRu}`,body,true);
    const root=document.getElementById('modalRoot');if(root)root.innerHTML=`<div class="modal-backdrop"><div class="dialog wide"><div class="dialog-head"><h2>${h(course.nameRu)}</h2><button class="btn" onclick="document.getElementById('modalRoot').innerHTML=''">Đóng</button></div><div class="dialog-body">${body}</div></div></div>`;
  }

  async function openGradeEvidence(courseId,code){
    try{
      const eventRuntime=window.BAUMAN_EVENT_READINESS_2026;
      if(!eventRuntime?.ensureGradeRuntime)throw new Error('A3 Event runtime chưa sẵn sàng.');
      await eventRuntime.ensureGradeRuntime();
      if(typeof window.openAcademicGradeResult2026!=='function')throw new Error('A3 Grade runtime chưa sẵn sàng.');
      return window.openAcademicGradeResult2026(courseId,code);
    }catch(err){if(typeof window.alert==='function')window.alert(err.message||String(err));return null}
  }

  async function openTranscriptEvidence(){
    try{
      const eventRuntime=window.BAUMAN_EVENT_READINESS_2026;
      if(!eventRuntime?.ensureGradeRuntime)throw new Error('A3 Event runtime chưa sẵn sàng.');
      const gradeRuntime=await eventRuntime.ensureGradeRuntime();
      if(!gradeRuntime?.ensureTranscriptRuntime)throw new Error('A4 Transcript bridge chưa sẵn sàng.');
      const transcript=await gradeRuntime.ensureTranscriptRuntime();
      if(typeof transcript?.openOverview!=='function')throw new Error('A4 Transcript runtime chưa sẵn sàng.');
      return transcript.openOverview();
    }catch(err){if(typeof window.alert==='function')window.alert(err.message||String(err));return null}
  }

  async function openCommandCenter(){
    try{
      const eventRuntime=window.BAUMAN_EVENT_READINESS_2026;
      if(!eventRuntime?.ensureGradeRuntime)throw new Error('A3 Event runtime chưa sẵn sàng.');
      const gradeRuntime=await eventRuntime.ensureGradeRuntime();
      if(!gradeRuntime?.ensureTranscriptRuntime)throw new Error('A4 Transcript bridge chưa sẵn sàng.');
      const transcript=await gradeRuntime.ensureTranscriptRuntime();
      if(!transcript?.ensureCommandCenterRuntime)throw new Error('A5 Command Center bridge chưa sẵn sàng.');
      const command=await transcript.ensureCommandCenterRuntime();
      if(typeof command?.openOverview!=='function')throw new Error('A5 Command Center runtime chưa sẵn sàng.');
      return command.openOverview();
    }catch(err){if(typeof window.alert==='function')window.alert(err.message||String(err));return null}
  }

  function openOverview(){
    if(!architecture)return;
    const body=`<div class="course14b-modal course14b-overview"><p class="academic2026-note">A2 chỉ tổng hợp evidence hiện có. Runtime không ghi diagnostic, không sửa scheduler và không tự đánh dấu course completion.</p><div class="course14b-grid">${COURSE_ORDER.map(id=>courseById(id)).filter(Boolean).map(courseCard).join('')}</div></div>`;
    if(typeof window.openModal==='function')return window.openModal('Course Readiness · Học kỳ 1',body,true);
  }
  function patchProgressFrame(){
    if(!window.app||window.app.__course14bPatched)return false;
    if(!window.app.__academic2026Patched||!window.app.__academic13dPreviewPatched||!window.app.__academic13fApplyPatched)return false;
    const app=window.app,oldHomePanelHTML=app.homePanelHTML?.bind(app);
    if(!oldHomePanelHTML)return false;
    app.__course14bPatched=true;
    app.homePanelHTML=function(mode){const base=oldHomePanelHTML(mode);return mode==='progress'?base+renderProgressSummary():base};
    return true;
  }

  function bootstrapEventRuntime(){
    if(!document.querySelector('link[data-phase2-event-style]')){
      const link=document.createElement('link');link.rel='stylesheet';link.href='assets/css/academic-event-2026.css';link.dataset.phase2EventStyle='1';document.head.appendChild(link);
    }
    if(window.BAUMAN_EVENT_READINESS_2026||document.querySelector('script[data-phase2-event-runtime]'))return;
    const script=document.createElement('script');script.src='assets/js/academic-event-runtime.js';script.dataset.phase2EventRuntime='1';script.async=false;document.body.appendChild(script);
  }

  async function fetchJson(url){const r=await fetch(url,{cache:'no-cache'});if(!r.ok)throw new Error(`${url} HTTP ${r.status}`);return r.json()}
  async function waitBase(timeout=15000){const start=Date.now();while(Date.now()-start<timeout){if(phase1()&&prereq()&&curriculum()&&window.app?.__academic13fApplyPatched)return true;await new Promise(r=>setTimeout(r,50))}return false}
  async function load(){
    try{
      architecture=await fetchJson(ARCH_URL);window.BAUMAN_COURSE_ARCHITECTURE_S1_2026=architecture;
      if(!(await waitBase()))throw new Error('Phase1 Academic runtime did not become ready');
      if(!patchProgressFrame())throw new Error('Could not patch Progress frame after Academic scheduler Apply layer');
      setTimeout(bootstrapEventRuntime,0);
      if(!window.openOfficialCoursePhase1)window.openOfficialCoursePhase1=window.openOfficialCourse2026;
      window.openOfficialCourse2026=openCourse;
      console.info(VERSION,{architecture:architecture.version,courses:architecture.courses?.length||0,readOnly:true,surface:'progress-modal'});
    }catch(err){console.warn('Phase2 Course Readiness runtime disabled safely:',err)}
  }
  window.openOfficialCoursePhase2=openCourse;
  window.openCourseReadinessOverview2026=openOverview;
  window.openAcademicGradeEvidenceA3=openGradeEvidence;
  window.openAcademicTranscriptEvidenceA4=openTranscriptEvidence;
  window.openAcademicCommandCenterA5=openCommandCenter;
  window.BAUMAN_COURSE_READINESS_2026=Object.freeze({version:VERSION,load,prereqAxis,lifecycleAxis,eventAxis,fallbackEventAxis,gateRows,nextAction,courseById,renderProgressSummary,openCommandCenter,readOnly:true,architectureUrl:ARCH_URL,surface:'progress-modal',a3EvidenceBridge:true,a4TranscriptBridge:true,a5CommandBridge:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(load,0),{once:true});
  else setTimeout(load,0)
})();