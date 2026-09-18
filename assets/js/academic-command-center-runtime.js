'use strict';
(function(){
  const VERSION='Academic 2026 Phase2 · Pass 14F Academic Command Center';
  const COURSE_ORDER=['d01','d02','d03','d04','d05','d06','d15','p02'];
  const SEVERITY_RANK={critical:4,high:3,medium:2,low:1};
  const h=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const courseRuntime=()=>window.BAUMAN_COURSE_READINESS_2026||null;
  const eventRuntime=()=>window.BAUMAN_EVENT_READINESS_2026||null;
  const gradeRuntime=()=>window.BAUMAN_GRADE_CONTROL_2026||null;
  const transcriptRuntime=()=>window.BAUMAN_TRANSCRIPT_HONORS_2026||null;
  const architecture=()=>window.BAUMAN_COURSE_ARCHITECTURE_S1_2026||null;

  function courseById(id){return (architecture()?.courses||[]).find(x=>x.courseId===id)||null}
  function gradeStates(courseId){return (gradeRuntime()?.resolvedEvents?.()||[]).filter(x=>x.course?.courseId===courseId)}
  function firstGradeRisk(courseId){const rows=gradeStates(courseId);const rank={RESULT_FAILED:100,RESULT_SATISFACTORY:90,RESULT_GOOD:80,RESULT_EXCELLENT_BELOW_TARGET:50,RESULT_EXCELLENT_GRADE_ONLY:40,RESULT_TARGET_MET:20,CREDIT_FAILED:100,CREDIT_PASSED:10,RESULT_UNRECORDED:0};return rows.sort((a,b)=>(rank[b.state?.id]||0)-(rank[a.state?.id]||0))[0]||null}
  function firstEventNeed(courseId){const axis=eventRuntime()?.courseEventAxis?.(courseId);const rows=axis?.events||[];const rank=x=>x.reason==='timing_unresolved'?90:x.id==='EVENT_PREPARING'?80:x.id==='EVENT_UNASSESSED'?70:x.id==='EVENT_READY'?10:0;return rows.sort((a,b)=>rank(b)-rank(a))[0]||null}
  function transcriptState(courseId){return transcriptRuntime()?.entryState?.(courseId)||{id:'ENTRY_UNVERIFIED',label:'Chưa xác minh phụ lục',verified:false}}
  function honorsState(){return transcriptRuntime()?.honorsEvaluation?.()||{id:'EVIDENCE_INCOMPLETE',label:'Chưa đủ evidence',verifiedRows:0,totalRows:0,fiveCount:0,requiredFive:null,projection:null}}

  function courseCommand(courseId){
    const course=courseById(courseId);if(!course)return null;
    const cr=courseRuntime(),prereq=cr?.prereqAxis?.(courseId)||{id:'UNASSESSED',label:'Chưa đánh giá'},lifecycle=cr?.lifecycleAxis?.(courseId)||{id:null,label:'Chưa ghi'},eventAxis=eventRuntime()?.courseEventAxis?.(courseId)||{id:'EVENT_UNASSESSED',label:'Chưa đánh giá event',events:[]},transcript=transcriptState(courseId),grade=firstGradeRisk(courseId),eventNeed=firstEventNeed(courseId);
    let severity='low',type='TRACK',title='Theo dõi học phần',detail='Chưa có blocker mức cao trong evidence hiện tại.',target={kind:'course',courseId};

    if(['ENTRY_GRADE_2','ENTRY_GRADE_3','ENTRY_CREDIT_FAIL'].includes(transcript.id)){
      severity='critical';type='HONORS_BLOCKER';title='Evidence phụ lục đang chặn điều kiện bằng đỏ';detail=`${courseId}: ${transcript.label}. Cần xử lý học vụ/chiến lược điểm bằng quyết định của người học; Hub không tự sửa lịch hay tự suy ra retake.`;target={kind:'transcript',courseId};
    }else if(grade&&['RESULT_FAILED','CREDIT_FAILED'].includes(grade.state?.id)){
      severity='critical';type='ASSESSMENT_FAILED';title='Kết quả assessment đã ghi là không đạt';detail=`${grade.event.code}: ${grade.state.label}. Ưu tiên xác minh yêu cầu học vụ và kế hoạch phục hồi.`;target={kind:'grade',courseId,code:grade.event.code};
    }else if(grade?.state?.id==='RESULT_SATISFACTORY'){
      severity='critical';type='GRADE_3_RISK';title='Điểm 3 đe dọa mục tiêu bằng đỏ';detail=`${grade.event.code}: ${grade.state.label}. Không tự động coi đây là điểm phụ lục; cần theo dõi kết quả cuối môn.`;target={kind:'grade',courseId,code:grade.event.code};
    }else if(transcript.id==='ENTRY_GRADE_4'){
      severity='high';type='HONORS_GRADE_4';title='Đã xác minh một điểm 4 trên phụ lục';detail='Điểm 4 vẫn hợp lệ theo điều kiện bằng đỏ, nhưng làm giảm biên an toàn tỷ lệ điểm 5.';target={kind:'transcript',courseId};
    }else if(grade?.state?.id==='RESULT_GOOD'){
      severity='high';type='GRADE_4_RISK';title='Assessment đang ở mức 4';detail=`${grade.event.code}: ${grade.state.label}. Cần ưu tiên nâng biên an toàn cho các assessment còn lại.`;target={kind:'grade',courseId,code:grade.event.code};
    }else if(eventNeed?.reason==='timing_unresolved'){
      severity='medium';type='EVENT_TIMING_LOCKED';title='Chưa được phép suy diễn timing assessment';detail='Môn nhiều học kỳ: cần nguồn có thẩm quyền để khóa event timing trước khi lập readiness/event plan.';target={kind:'course',courseId};
    }else if(eventNeed?.id==='EVENT_PREPARING'){
      severity='high';type='EVENT_PREPARING';title='Assessment event chưa đạt readiness';detail=`${eventNeed.code}: ${eventNeed.label}. Hoàn tất yêu cầu đã kiểm chứng và đóng critical issues.`;target={kind:'event',courseId,code:eventNeed.code};
    }else if(prereq.id==='PREREQ_REPAIR'){
      severity='high';type='PREREQ_REPAIR';title='Prerequisite đang là blocker';detail=cr?.nextAction?.(courseId)?.label||'Repair đúng gate còn thiếu trước khi học lại rộng.';target={kind:'course',courseId};
    }else if(eventNeed?.id==='EVENT_UNASSESSED'){
      severity=lifecycle.id==='COURSE_ACTIVE'?'high':'medium';type='EVENT_EVIDENCE_REQUIRED';title='Chưa có evidence readiness cho assessment';detail=`${eventNeed.code}: cần kiểm chứng yêu cầu thật trước khi gán EVENT_READY.`;target={kind:'event',courseId,code:eventNeed.code};
    }else if(prereq.id==='UNASSESSED'){
      severity='medium';type='PREREQ_UNASSESSED';title='Chưa đủ diagnostic prerequisite';detail=cr?.nextAction?.(courseId)?.label||'Chẩn đoán trước khi tạo remediation.';target={kind:'course',courseId};
    }else if(grade?.state?.id==='RESULT_EXCELLENT_BELOW_TARGET'){
      severity='medium';type='EXCELLENT_BELOW_SAFETY_TARGET';title='Điểm 5 nhưng dưới safety target 90';detail=`${grade.event.code}: vẫn là band 5 chính thức, nhưng thấp hơn biên an toàn nội bộ.`;target={kind:'grade',courseId,code:grade.event.code};
    }else if(prereq.id==='COURSE_READY'&&eventAxis.id==='EVENT_READY'){
      severity='low';type='READY_FOR_ASSESSMENT';title='Prerequisite và event readiness đều đạt';detail='Tiếp tục học phần thật; chờ kết quả assessment thực tế, không tự đánh dấu COMPLETED.';target={kind:'course',courseId};
    }

    return {courseId,course,severity,severityRank:SEVERITY_RANK[severity],type,title,detail,target,axes:{prereq,lifecycle,event:eventAxis,grade:grade?.state||{id:'RESULT_UNRECORDED',label:'Chưa có kết quả'},transcript}};
  }

  function commandBoard(){return COURSE_ORDER.map(courseCommand).filter(Boolean).sort((a,b)=>b.severityRank-a.severityRank||COURSE_ORDER.indexOf(a.courseId)-COURSE_ORDER.indexOf(b.courseId))}
  function summary(){const board=commandBoard(),honors=honorsState();return {courses:board.length,critical:board.filter(x=>x.severity==='critical').length,high:board.filter(x=>x.severity==='high').length,medium:board.filter(x=>x.severity==='medium').length,low:board.filter(x=>x.severity==='low').length,topAction:board[0]||null,honors}}
  function axis(label,value){return `<span class="command14f-axis"><b>${h(label)}</b><span>${h(value||'—')}</span></span>`}
  function targetButtons(cmd){const t=cmd.target;if(t.kind==='transcript')return `<button class="btn" onclick="openAcademicTranscriptEntry2026('${h(t.courseId)}')">Mở Transcript evidence</button>`;if(t.kind==='grade')return `<button class="btn" onclick="openAcademicGradeResult2026('${h(t.courseId)}','${h(t.code)}')">Mở Grade Control</button>`;if(t.kind==='event')return `<button class="btn" onclick="openAcademicEventReadiness2026('${h(t.courseId)}','${h(t.code)}')">Mở Event Readiness</button>`;return `<button class="btn" onclick="openOfficialCoursePhase2('${h(t.courseId)}')">Mở Course Readiness</button>`}
  function card(cmd){return `<article class="command14f-card ${h(cmd.severity)}"><div class="command14f-card-head"><div><b>${h(cmd.courseId)} · ${h(cmd.course.nameRu)}</b><small>${h(cmd.type)}</small></div><span class="command14f-severity ${h(cmd.severity)}">${h(cmd.severity.toUpperCase())}</span></div><div class="command14f-axes">${axis('Prereq',cmd.axes.prereq.label)}${axis('Lifecycle',cmd.axes.lifecycle.label)}${axis('Event',cmd.axes.event.label)}${axis('Transcript',cmd.axes.transcript.label)}</div><div class="command14f-action"><strong>${h(cmd.title)}</strong><small>${h(cmd.detail)}</small><div class="command14f-actions">${targetButtons(cmd)}</div></div></article>`}
  function renderPanel(){const s=summary(),hon=s.honors,p=hon.projection||{};return `<section class="command14f-shell" data-command14f="center"><article class="academic2026-panel"><div class="academic2026-head"><div><span class="academic2026-badge">PHASE 2 · PASS 14F · DECISION SUPPORT</span><h2>Academic Command Center</h2><p>Một nơi để thấy môn nào đang đe dọa điểm 5/bằng đỏ, blocker nằm ở prerequisite, assessment event, kết quả thực tế hay transcript evidence. Không auto-apply scheduler.</p></div><span class="academic2026-lock">Read-only orchestration</span></div><div class="command14f-summary"><span><b>${s.critical}</b><small>CRITICAL</small></span><span><b>${s.high}</b><small>HIGH</small></span><span><b>${hon.verifiedRows??0}/${hon.totalRows??0}</b><small>TRANSCRIPT VERIFIED</small></span><span><b>${hon.fiveCount??0}/${hon.requiredFive??p.requiredFiveIfProjectionConfirmed??'—'}</b><small>5s VERIFIED / PROJECTED NEED</small></span></div><div class="command14f-honors"><b>${h(hon.label||'Chưa có honors evidence')}</b><small>Honors chỉ được kết luận từ ledger phụ lục đã xác minh. Projection 22/17 không được coi là mẫu số cuối cho tới khi cấu trúc phụ lục IU5 thực tế được xác minh.</small></div><div class="command14f-grid">${commandBoard().map(card).join('')}</div></article></section>`}
  function appendPanel(){const root=document.getElementById('page-home');if(!root||root.querySelector('[data-command14f="center"]'))return;root.insertAdjacentHTML('afterbegin',renderPanel())}
  function refresh(){try{if(window.app?.home)window.app.home();else appendPanel()}catch{appendPanel()}}
  function patchHome(){if(!window.app||window.app.__command14fPatched)return false;if(!window.app.__transcript14ePatched)return false;const app=window.app,oldHome=app.home.bind(app);app.__command14fPatched=true;app.home=function(){oldHome();appendPanel()};app.home();return true}
  async function waitBase(timeout=15000){const start=Date.now();while(Date.now()-start<timeout){if(courseRuntime()&&eventRuntime()&&gradeRuntime()&&transcriptRuntime()&&window.app?.__transcript14ePatched)return true;await new Promise(r=>setTimeout(r,50))}return false}
  async function load(){try{if(!(await waitBase()))throw new Error('Pass14E transcript runtime did not become ready');if(!patchHome())throw new Error('Could not patch home for Pass14F');console.info(VERSION,{courses:COURSE_ORDER.length,readOnly:true,schedulerMutation:false,transcriptAutoPromotion:false})}catch(err){console.warn('Pass14F Academic Command Center disabled safely:',err)}}

  window.BAUMAN_ACADEMIC_COMMAND_CENTER_2026=Object.freeze({version:VERSION,load,courseCommand,commandBoard,summary,refresh,readOnly:true,schedulerMutation:false,transcriptAutoPromotion:false});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(load,0),{once:true});else setTimeout(load,0);
})();