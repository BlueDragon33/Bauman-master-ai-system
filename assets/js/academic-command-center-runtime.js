'use strict';
(function(){
  const VERSION='Academic Phase2 Current-Main · A5 Academic Command Center';
  const COURSE_ORDER=['d01','d02','d03','d04','d05','d06','d15','p02'];
  const SEVERITY_RANK={critical:4,high:3,medium:2,low:1};
  const SEVERITY_LABEL={critical:'Khẩn cấp',high:'Cao',medium:'Trung bình',low:'Theo dõi'};
  const TYPE_LABEL={HONORS_BLOCKER:'Rủi ro mục tiêu bằng đỏ',ASSESSMENT_FAILED:'Đánh giá không đạt',GRADE_3_RISK:'Rủi ro điểm 3',HONORS_GRADE_4:'Điểm 4 trên phụ lục',GRADE_4_RISK:'Rủi ro điểm 4',EVENT_TIMING_LOCKED:'Chưa khóa thời điểm đánh giá',EVENT_PREPARING:'Chưa sẵn sàng đánh giá',PREREQ_REPAIR:'Cần củng cố điều kiện đầu vào',EVENT_EVIDENCE_REQUIRED:'Thiếu bằng chứng sẵn sàng',PREREQ_UNASSESSED:'Chưa đánh giá điều kiện đầu vào',EXCELLENT_BELOW_SAFETY_TARGET:'Điểm 5 dưới biên an toàn',READY_FOR_ASSESSMENT:'Sẵn sàng đánh giá',TRACK:'Theo dõi'};
  const h=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const courseRuntime=()=>window.BAUMAN_COURSE_READINESS_2026||null;
  const eventRuntime=()=>window.BAUMAN_EVENT_READINESS_2026||null;
  const gradeRuntime=()=>window.BAUMAN_GRADE_CONTROL_2026||null;
  const transcriptRuntime=()=>window.BAUMAN_TRANSCRIPT_HONORS_2026||null;
  const architecture=()=>window.BAUMAN_COURSE_ARCHITECTURE_S1_2026||null;

  function courseById(id){return (architecture()?.courses||[]).find(x=>x.courseId===id)||null}
  function gradeStates(courseId){return (gradeRuntime()?.resolvedEvents?.()||[]).filter(x=>x.course?.courseId===courseId)}
  function firstGradeRisk(courseId){
    const rank={RESULT_FAILED:100,CREDIT_FAILED:100,RESULT_SATISFACTORY:90,RESULT_GOOD:80,RESULT_EXCELLENT_BELOW_TARGET:50,RESULT_EXCELLENT_GRADE_ONLY:40,RESULT_TARGET_MET:20,CREDIT_PASSED:10,RESULT_UNRECORDED:0};
    return gradeStates(courseId).sort((a,b)=>(rank[b.state?.id]||0)-(rank[a.state?.id]||0))[0]||null;
  }
  function firstEventNeed(courseId){
    const rows=[...(eventRuntime()?.courseEventAxis?.(courseId)?.events||[])];
    const rank=x=>x.reason==='timing_unresolved'?90:x.id==='EVENT_PREPARING'?80:x.id==='EVENT_UNASSESSED'?70:x.id==='EVENT_READY'?10:0;
    return rows.sort((a,b)=>rank(b)-rank(a))[0]||null;
  }
  function transcriptState(courseId){return transcriptRuntime()?.entryState?.(courseId)||{id:'ENTRY_UNVERIFIED',label:'Chưa xác minh phụ lục',verified:false}}
  function honorsState(){return transcriptRuntime()?.honorsEvaluation?.()||{id:'EVIDENCE_INCOMPLETE',label:'Chưa đủ evidence',verifiedRows:0,totalRows:0,fiveCount:0,requiredFive:null,projection:null,projectionCaveatActive:true,finalEligibilityClaimed:false}}

  function courseCommand(courseId){
    const course=courseById(courseId);if(!course)return null;
    const cr=courseRuntime();
    const prereq=cr?.prereqAxis?.(courseId)||{id:'UNASSESSED',label:'Chưa đánh giá'};
    const lifecycle=cr?.lifecycleAxis?.(courseId)||{id:null,label:'Chưa ghi'};
    const eventAxis=eventRuntime()?.courseEventAxis?.(courseId)||{id:'EVENT_UNASSESSED',label:'Chưa đánh giá event',events:[]};
    const transcript=transcriptState(courseId),grade=firstGradeRisk(courseId),eventNeed=firstEventNeed(courseId);
    let severity='low',type='TRACK',title='Theo dõi học phần',detail='Chưa có blocker mức cao trong dữ liệu đã xác minh hiện tại.',target={kind:'course',courseId};

    if(['ENTRY_GRADE_2','ENTRY_GRADE_3','ENTRY_CREDIT_FAIL'].includes(transcript.id)){
      severity='critical';type='HONORS_BLOCKER';title='Evidence phụ lục đang chặn mục tiêu honors';detail=`${courseId}: ${transcript.label}. Hub chỉ chỉ ra blocker; không tự quyết định retake hay sửa lịch.`;target={kind:'transcript',rowId:courseId};
    }else if(grade&&['RESULT_FAILED','CREDIT_FAILED'].includes(grade.state?.id)){
      severity='critical';type='ASSESSMENT_FAILED';title='Kết quả assessment đã ghi là không đạt';detail=`${grade.event.code}: ${grade.state.label}. Cần xác minh yêu cầu học vụ và kế hoạch phục hồi.`;target={kind:'grade',courseId,code:grade.event.code};
    }else if(grade?.state?.id==='RESULT_SATISFACTORY'){
      severity='critical';type='GRADE_3_RISK';title='Điểm 3 đe dọa mục tiêu honors';detail=`${grade.event.code}: ${grade.state.label}. Không tự coi đây là điểm phụ lục.`;target={kind:'grade',courseId,code:grade.event.code};
    }else if(transcript.id==='ENTRY_GRADE_4'){
      severity='high';type='HONORS_GRADE_4';title='Đã xác minh một điểm 4 trên phụ lục';detail='Điểm 4 vẫn nằm trong tập điểm được phép nhưng làm giảm biên an toàn tỷ lệ điểm 5.';target={kind:'transcript',rowId:courseId};
    }else if(grade?.state?.id==='RESULT_GOOD'){
      severity='high';type='GRADE_4_RISK';title='Assessment đang ở mức 4';detail=`${grade.event.code}: ${grade.state.label}. Ưu tiên tăng biên an toàn ở assessment còn lại.`;target={kind:'grade',courseId,code:grade.event.code};
    }else if(eventNeed?.reason==='timing_unresolved'){
      severity='medium';type='EVENT_TIMING_LOCKED';title='Timing assessment chưa được nguồn khóa';detail='Môn nhiều học kỳ: không suy diễn semester/event timing khi chưa có nguồn có thẩm quyền.';target={kind:'course',courseId};
    }else if(eventNeed?.id==='EVENT_PREPARING'){
      severity='high';type='EVENT_PREPARING';title='Assessment event chưa đạt readiness';detail=`${eventNeed.code}: ${eventNeed.label}. Hoàn tất yêu cầu đã kiểm chứng và đóng critical issues.`;target={kind:'event',courseId,code:eventNeed.code};
    }else if(prereq.id==='PREREQ_REPAIR'){
      severity='high';type='PREREQ_REPAIR';title='Prerequisite đang là blocker';detail=cr?.nextAction?.(courseId)?.label||'Repair đúng gate còn thiếu trước khi học lại rộng.';target={kind:'course',courseId};
    }else if(eventNeed?.id==='EVENT_UNASSESSED'){
      severity=lifecycle.id==='COURSE_ACTIVE'?'high':'medium';type='EVENT_EVIDENCE_REQUIRED';title='Chưa có evidence readiness cho assessment';detail=`${eventNeed.code}: cần kiểm chứng yêu cầu thật trước khi gán EVENT_READY.`;target={kind:'event',courseId,code:eventNeed.code};
    }else if(prereq.id==='UNASSESSED'){
      severity='medium';type='PREREQ_UNASSESSED';title='Chưa đủ diagnostic prerequisite';detail=cr?.nextAction?.(courseId)?.label||'Chẩn đoán trước khi tạo remediation.';target={kind:'course',courseId};
    }else if(grade?.state?.id==='RESULT_EXCELLENT_BELOW_TARGET'){
      severity='medium';type='EXCELLENT_BELOW_SAFETY_TARGET';title='Điểm 5 nhưng dưới safety target nội bộ';detail=`${grade.event.code}: vẫn là band 5 theo policy đã khóa, nhưng thấp hơn biên an toàn nội bộ.`;target={kind:'grade',courseId,code:grade.event.code};
    }else if(prereq.id==='COURSE_READY'&&eventAxis.id==='EVENT_READY'){
      severity='low';type='READY_FOR_ASSESSMENT';title='Prerequisite và event readiness đều đạt';detail='Tiếp tục học phần thật; chờ kết quả assessment thực tế, không tự đánh dấu COMPLETED.';target={kind:'course',courseId};
    }

    return {courseId,course,severity,severityRank:SEVERITY_RANK[severity],type,title,detail,target,axes:{prereq,lifecycle,event:eventAxis,grade:grade?.state||{id:'RESULT_UNRECORDED',label:'Chưa có kết quả'},transcript}};
  }

  function commandBoard(){return COURSE_ORDER.map(courseCommand).filter(Boolean).sort((a,b)=>b.severityRank-a.severityRank||COURSE_ORDER.indexOf(a.courseId)-COURSE_ORDER.indexOf(b.courseId))}
  function summary(){
    const board=commandBoard(),honors=honorsState();
    return {courses:board.length,critical:board.filter(x=>x.severity==='critical').length,high:board.filter(x=>x.severity==='high').length,medium:board.filter(x=>x.severity==='medium').length,low:board.filter(x=>x.severity==='low').length,topAction:board[0]||null,honors};
  }
  function axis(label,value){return `<span class="commandA5-axis"><b>${h(label)}</b><span>${h(value||'—')}</span></span>`}
  function targetButton(cmd){
    const t=cmd.target;
    if(t.kind==='transcript')return `<button class="btn" onclick="openAcademicTranscriptEntry2026('${h(t.rowId)}')">Mở dữ liệu phụ lục</button>`;
    if(t.kind==='grade')return `<button class="btn" onclick="openAcademicGradeResult2026('${h(t.courseId)}','${h(t.code)}')">Mở kết quả đánh giá</button>`;
    if(t.kind==='event')return `<button class="btn" onclick="openAcademicEventReadiness2026('${h(t.courseId)}','${h(t.code)}')">Mở mức sẵn sàng đánh giá</button>`;
    return `<button class="btn" onclick="openOfficialCoursePhase2('${h(t.courseId)}')">Mở mức sẵn sàng học phần</button>`;
  }
  function card(cmd){
    return `<article class="commandA5-card ${h(cmd.severity)}"><div class="commandA5-card-head"><div><b>${h(cmd.courseId)} · ${h(cmd.course.nameRu)}</b><small>${h(TYPE_LABEL[cmd.type]||cmd.type)}</small></div><span class="commandA5-severity ${h(cmd.severity)}">${h(SEVERITY_LABEL[cmd.severity]||cmd.severity)}</span></div><div class="commandA5-axes">${axis('Điều kiện',cmd.axes.prereq.label)}${axis('Trạng thái môn',cmd.axes.lifecycle.label)}${axis('Đánh giá',cmd.axes.event.label)}${axis('Phụ lục',cmd.axes.transcript.label)}</div><div class="commandA5-action"><strong>${h(cmd.title)}</strong><small>${h(cmd.detail)}</small><div class="commandA5-actions">${targetButton(cmd)}</div></div></article>`;
  }
  function renderPanel(){
    const s=summary(),hon=s.honors,p=hon.projection||{};
    const caveat=hon.projectionCaveatActive!==false||hon.finalEligibilityClaimed!==true;
    return `<section class="commandA5-shell" data-command-a5="center" data-academic-report data-academic-report-title="Báo cáo học vụ tổng hợp"><article class="academic2026-panel"><div class="academic2026-report-tools"><button class="btn" onclick="printAcademicReport2026('Báo cáo học vụ tổng hợp')">In / lưu PDF</button></div><div class="academic2026-report-meta"><span><b>Phạm vi:</b> 8 học phần trọng tâm HK1</span><span><b>Dữ liệu:</b> điều kiện, đánh giá, kết quả và phụ lục</span><span><b>Chế độ:</b> chỉ đọc, không tự sửa lịch</span></div><div class="academic2026-head"><div><span class="academic2026-badge">HỌC VỤ · TỔNG HỢP</span><h3>Báo cáo học vụ tổng hợp</h3><p>Tổng hợp prerequisite, assessment readiness, kết quả thực tế và evidence phụ lục để chỉ ra việc cần xử lý tiếp theo mà không tự thay đổi lịch học.</p></div><span class="academic2026-lock">Chỉ đọc · không sửa lịch</span></div><div class="commandA5-summary"><span><b>${s.critical}</b><small>KHẨN CẤP</small></span><span><b>${s.high}</b><small>MỨC CAO</small></span><span><b>${hon.verifiedRows??0}/${hon.totalRows??0}</b><small>PHỤ LỤC ĐÃ XÁC MINH</small></span><span><b>${hon.fiveCount??0}/${hon.requiredFive??p.requiredFiveIfProjectionConfirmed??'—'}</b><small>ĐIỂM 5 / NHU CẦU DỰ KIẾN</small></span></div><div class="commandA5-honors"><b>${h(hon.label||'Chưa có honors evidence')}</b><small>${caveat?'Mẫu số honors vẫn là projection; Command Center không tuyên bố đủ điều kiện cuối cùng.':'Ledger đã được xác minh theo policy hiện có.'}</small></div><div class="commandA5-grid">${commandBoard().map(card).join('')}</div></article></section>`;
  }
  function openOverview(){
    if(typeof window.openModal==='function')return window.openModal('Báo cáo học vụ tổng hợp',renderPanel(),true);
    return null;
  }
  function refresh(){return summary()}
  async function waitBase(timeout=15000){
    const start=Date.now();while(Date.now()-start<timeout){if(courseRuntime()&&eventRuntime()&&gradeRuntime()&&transcriptRuntime()&&architecture())return true;await new Promise(r=>setTimeout(r,50))}return false;
  }
  async function load(){
    try{if(!(await waitBase()))throw new Error('A2–A4 evidence layers did not become ready');console.info(VERSION,{courses:COURSE_ORDER.length,readOnly:true,schedulerMutation:false,evidenceMutation:false,surface:'progress-modal',homeSurfaceAdded:false})}
    catch(err){console.warn('A5 Academic Command Center disabled safely:',err)}
  }

  window.openAcademicCommandCenterOverviewA5=openOverview;
  window.BAUMAN_ACADEMIC_COMMAND_CENTER_2026=Object.freeze({version:VERSION,load,courseCommand,commandBoard,summary,renderPanel,openOverview,refresh,readOnly:true,schedulerMutation:false,evidenceMutation:false,courseCompletionMutation:false,surface:'progress-modal',homeSurfaceAdded:false});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(load,0),{once:true});else setTimeout(load,0);
})();