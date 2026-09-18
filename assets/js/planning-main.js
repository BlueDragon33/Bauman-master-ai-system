'use strict';
(function(){
  const VERSION='Main PlanningBridge V3 · Route Cards';
  const h=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const $=id=>document.getElementById(id);
  const DAY_NAMES=['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','Chủ nhật'];
  const MAIN_SLOTS_V3=[
    {id:'morning1',label:'Sáng 1',time:'06:30–08:00',type:'memorize',minutes:90},
    {id:'morning2',label:'Sáng 2',time:'08:30–10:30',type:'memorize',minutes:120},
    {id:'afternoon',label:'Chiều',time:'14:00–16:00',type:'technical',minutes:120}
  ];
  const REVIEW_SLOTS_V3=[
    {id:'reviewMorning',label:'Sáng ôn tập',time:'07:00–08:30',minutes:90},
    {id:'reviewAfternoon',label:'Chiều ôn tập',time:'14:00–15:30',minutes:90}
  ];
  const EXTRA_POLICY={evening:{id:'evening',label:'Tối học bù',time:'19:30–21:00',minutes:90},saturday:{id:'reviewMorning',label:'Thứ 7 tăng cường',time:'07:00–08:30',minutes:90},sunday:{id:'reviewMorning',label:'Chủ nhật sửa lỗi',time:'07:00–08:30',minutes:90}};
  function iso(d){const x=new Date(d);if(Number.isNaN(x.getTime()))return '';return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`}
  function parseDate(s){const m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})/);return m?new Date(+m[1],+m[2]-1,+m[3]):new Date();}
  function addDays(date,n){const d=parseDate(date);d.setDate(d.getDate()+Number(n||0));return iso(d)}
  function mondayOf(dateStr){const d=parseDate(dateStr);const off=(d.getDay()+6)%7;d.setDate(d.getDate()-off);return iso(d)}
  function safeSave(){try{window.save?.()}catch(_){}}
  function unique(a){return Array.from(new Set((a||[]).filter(Boolean)))}
  function slotMinutes(slotId){return [...MAIN_SLOTS_V3,...REVIEW_SLOTS_V3,Object.values(EXTRA_POLICY)].find(s=>s.id===slotId)?.minutes||90}
  function ensurePlanningState(){const s=window.state;if(!s)return; if(!s.schedule)s.schedule={entries:{}}; if(!s.schedule.entries)s.schedule.entries={}; s.planningWarnings=s.planningWarnings&&typeof s.planningWarnings==='object'?s.planningWarnings:{}; s.planningMissions=s.planningMissions&&typeof s.planningMissions==='object'?s.planningMissions:{}; s.planningPlans=s.planningPlans&&typeof s.planningPlans==='object'?s.planningPlans:{}; s.planningActions=s.planningActions&&typeof s.planningActions==='object'?s.planningActions:{};}
  function keyOf(subjectId,courseId){return [subjectId||'subject',courseId||'general'].join('::')}
  function warningKey(subjectId,courseId){return keyOf(subjectId,courseId)}
  function currentWarnings(){ensurePlanningState();return Object.entries(window.state.planningWarnings||{}).filter(([_,w])=>w&&!w.resolvedAt).map(([k,w])=>({...w,key:k}))}
  function warningFor(subjectId,courseId){ensurePlanningState();return window.state.planningWarnings[warningKey(subjectId,courseId)]||window.state.planningWarnings[warningKey(subjectId,'general')]||null}
  function planFor(subjectId,courseId,missionId=''){ensurePlanningState();if(missionId&&window.state.planningPlans[missionId])return window.state.planningPlans[missionId];return window.state.planningPlans[keyOf(subjectId,courseId)]||window.state.planningPlans[keyOf(subjectId,'general')]||null}
  function allEntries(subjectId,courseId,startDate){ensurePlanningState();return Object.entries(window.state.schedule.entries||{}).map(([key,e])=>{const [date,slotId]=key.split('|');return {...e,key,date,slotId,minutes:Number(e.durationMinutes||slotMinutes(slotId))}}).filter(e=>e.subjectId===subjectId && (!courseId || e.itemId===courseId || !e.itemId)).filter(e=>!startDate||e.date>=startDate).sort((a,b)=>(a.date+a.slotId).localeCompare(b.date+b.slotId));}
  function latestReports(subjectId){const arr=window.state.subjectReports?.[subjectId]||[];return Array.isArray(arr)?arr:[]}
  function learnedStats(subjectId){const reports=latestReports(subjectId);let studyMinutes=0, learnedItems=0, dialogues=0;reports.forEach(r=>{studyMinutes+=Number(r.completedMinutes||r.plannedMinutes||r.durationMinutes||0);learnedItems+=Number(r.learnedItems||r.completedItems||r.answered||r.total||0);dialogues+=Number(r.dialogues||r.completedDialogues||0)});return {studyMinutes,learnedItems,dialogues};}
  function previousAssessments(subjectId,courseId){return latestReports(subjectId).filter(r=>!courseId||!r.courseId||r.courseId===courseId).map(r=>({level:r.testLevel||r.difficulty||r.level||r.nextReviewMode||'',score:Number(r.score||r.percent||0),answered:Number(r.answered||r.total||r.questions||0),date:r.receivedAt||r.generatedAt||''})).filter(x=>x.score||x.level).slice(-12)}
  function courseById(id){return (window.BAUMAN_DATA?.courses||[]).find(c=>c.id===id)||null}
  function inferLevels(text){const found=(String(text||'').toUpperCase().match(/A0|A1|A2|B1|B2|C1|C2/g)||[]);return {startLevel:found.length>1?found[0]:(found[0]||'A0'),targetLevel:found.length>1?found[found.length-1]:(found[0]||'A1')}}
  function markWeekEndSignals(entries){const lastByWeek={};entries.forEach(e=>{const k=[mondayOf(e.date),e.subjectId,e.itemId||'general'].join('::');lastByWeek[k]=e.key});return entries.map(e=>{const k=[mondayOf(e.date),e.subjectId,e.itemId||'general'].join('::');const dow=parseDate(e.date).getDay();return {...e,isWeekEndSignal:lastByWeek[k]===e.key,isLastDayOfWeek:lastByWeek[k]===e.key,calendarWeekend:dow===0||dow===6}})}
  function buildPlanningMission(subjectId,context={}){
    ensurePlanningState();
    const base=window.buildLearningTask?window.buildLearningTask(subjectId,context):{};
    const subject=window.state.subjects?.[subjectId]||{};
    const course=courseById(base.courseId||base.itemId);
    const startDate=base.date||iso(new Date());
    const entries=markWeekEndSignals(allEntries(subjectId,base.courseId,startDate));
    const rawSessions=(entries.length?entries:[{date:startDate,slotId:base.slotId||'morning1',durationMinutes:base.durationMinutes||90,source:'single',subjectId,itemId:base.courseId||''}]);
    const sessions=rawSessions.map((e,i)=>({id:`s${i+1}`,date:e.date,minutes:Number(e.durationMinutes||e.minutes||slotMinutes(e.slotId)),timeBlock:e.slotId||'',source:e.source||'main',isWeekEndSignal:!!e.isWeekEndSignal,isLastDayOfWeek:!!e.isLastDayOfWeek,calendarWeekend:!!e.calendarWeekend,learningItem:e.learningItem||base.learningItem||course?.name||''}));
    const days=unique(sessions.map(s=>s.date));
    const deadline=sessions.at(-1)?.date||base.plannedEndDate||startDate;
    const level=inferLevels([base.learningItem,base.courseName,course?.name,course?.vi,course?.desc,subject.name].join(' '));
    const mission={
      ...base,
      type:'BAUMAN_ASSIGN_TASK',
      protocol:'BAUMAN_PLANNING_BRIDGE_V3_ROUTE_CARDS',
      missionId:base.taskId||`${subjectId}::mission::${Date.now()}`,
      id:base.taskId||`${subjectId}::mission::${Date.now()}`,
      subjectType:/russian|tiếng nga|language/i.test(subjectId+' '+subject.name)?'language':'academic',
      target:base.learningItem||course?.name||'Mục tiêu học tập',
      goalType:'level_completion',
      startLevel:level.startLevel,
      targetLevel:level.targetLevel,
      startDate:sessions[0]?.date||startDate,
      deadline:base.plannedEndDate||deadline,
      durationDays:Math.max(1,days.length),
      sessions,
      learnedStats:learnedStats(subjectId),
      previousAssessments:previousAssessments(subjectId,base.courseId),
      requiredOutput:{
        level:`${level.startLevel}-${level.targetLevel}`,
        testQuestions:Number(window.state.schedule?.targetQuestions)||100,
        targetScore:Number(window.state.schedule?.targetScore)||80,
        speaking:'giao tiếp theo mục học', listening:'nghe hiểu nền tảng', writing:'viết ứng dụng theo nhiệm vụ'
      },
      targetQuestions:Number(window.state.schedule?.targetQuestions)||100,
      targetScore:Number(window.state.schedule?.targetScore)||80,
      antiCramming:true,
      mainRole:'schedule_orchestrator_only',
      subjectRole:'build_route_cards_and_decide_weekly_test',
      source:base.source==='capability-gap'?'capability-gap':'bauman-main-planning-v3',
      originSource:base.source||'bauman-main'
    };
    window.state.planningMissions[mission.missionId]=mission; safeSave();
    return mission;
  }
  function taskQuery(path,task){return window.BaumanSubjectRuntime?.withTaskQuery?.(path,task)||''}
  function send(win,task){return window.BaumanSubjectRuntime?.sendTaskToSubject?.(win,task)||false}
  function trusted(event){return window.BaumanSubjectRuntime?.trustedSubjectEvent?.(event)===true}
  function routeSummary(plan){const sessions=plan?.sessions||plan?.plan?.sessions||[];if(!sessions.length)return '';const first=sessions[0], tests=sessions.filter(s=>s.officialTest).length, reviews=sessions.filter(s=>s.sessionKind==='review_consolidation').length;return `${sessions.length} buổi · ${plan.totalMinutes||sessions.reduce((a,x)=>a+Number(x.minutes||0),0)} phút · ${tests} kiểm tra · ${reviews} ôn củng cố · buổi đầu: ${first.phase||first.sessionKind||'orientation'}`}
  function escapeJs(s){return String(s??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,' ')}
  function sessionForEntry(plan,e,date,slotId){const sessions=plan?.sessions||plan?.plan?.sessions||[];return sessions.find(s=>s.date===date && (s.timeBlock===slotId || s.id===e?.routeSessionId))||sessions.find(s=>s.date===date)||null}
  function planLineForEntry(e,date,slotId){const p=planFor(e.subjectId,e.itemId||'');const s=sessionForEntry(p,e,date,slotId);if(!s)return '';const badge=s.officialTest?`Kiểm tra ${h(s.testLevel||'')}`:(s.sessionKind==='review_consolidation'?'Ôn củng cố':(s.sessionKind==='orientation'?'Làm quen':'Thẻ học'));
    const cards=(s.cards||[]).slice(0,2).map(c=>`<button onclick="event.stopPropagation();planningBridgeOpenRoute('${escapeJs(e.subjectId)}','${escapeJs(e.itemId||'')}','${escapeJs(c.route?.view||'learning')}','${escapeJs(c.route?.learnTab||'')}','${escapeJs(c.route?.mode||'')}')">${h(c.button||c.title||'Mở')}</button>`).join('');
    return `<div class="pb-route-line"><b>${h(badge)}</b><small>${h(s.output||'')}</small><div class="pb-route-actions">${cards}</div></div>`}
  function warningLine(e){const w=warningFor(e.subjectId,e.itemId||'');if(!w||w.resolvedAt)return '';return `<div class="pb-warning-line">⚠ ${h(w.message||'Môn học cảnh báo chưa đủ điều kiện đạt đầu ra.')}<div class="pb-warning-actions"><button onclick="event.stopPropagation();planningBridgeMainAction('regenerate_schedule','${escapeJs(e.subjectId)}','${escapeJs(e.itemId||'')}')">Tạo lại lịch</button><button onclick="event.stopPropagation();planningBridgeMainAction('add_extra_study_time','${escapeJs(e.subjectId)}','${escapeJs(e.itemId||'')}')">Học bù thêm</button></div></div>`}
  function patchOpeners(){if(!window.app||window.app.__planningV3Patched)return;const app=window.app;app.__planningV3Patched=true;
    app.openSubjectInPage=function(id,context={}){const s=window.state.subjects[id];if(!s?.mainPath)return window.toast?.('Môn này chưa có file học.');const task=buildPlanningMission(id,context);const src=taskQuery(s.mainPath,task);if(!src)return window.toast?.('Đường dẫn môn học không an toàn hoặc không hợp lệ.');window.state.lastStudy={subjectId:id,path:s.mainPath};window.state.activeTask=task;safeSave();const p=planFor(id,task.courseId,task.missionId);$('studyRoot').innerHTML=`<div class="study-viewer"><div class="study-head"><div><h2>${h(s.name)}</h2><small>Mission từ Main: ${h(task.target)} · ${task.durationDays} ngày · ${task.sessions.reduce((a,x)=>a+Number(x.minutes||0),0)} phút · hạn ${h(task.deadline)}</small>${p?`<div class="pb-plan-strip">${h(routeSummary(p))}</div>`:''}</div><div class="tools"><button class="btn" data-action="close-study">Đóng</button><button class="btn" onclick="app.openSubjectTab('${id}')">Mở tab riêng</button></div></div><iframe id="subjectFrame" src="${h(src)}"></iframe></div>`;const iframe=$('subjectFrame');if(iframe)iframe.addEventListener('load',()=>send(iframe.contentWindow,task));};
    app.openSubjectTab=function(id){const s=window.state.subjects[id];if(!s?.mainPath)return window.toast?.('Môn này chưa có file học.');const context=window.capabilityContextFromTask?.(window.state.activeTask)||{};const task=buildPlanningMission(id,context);const src=taskQuery(s.mainPath,task);if(!src)return window.toast?.('Đường dẫn môn học không an toàn hoặc không hợp lệ.');window.state.lastStudy={subjectId:id,path:s.mainPath};window.state.activeTask=task;safeSave();window.open(src,'_blank','noopener')};
    const oldSlot=app.slotHTML?.bind(app); if(oldSlot){app.slotHTML=function(dateStr,slot,dayIndex){let html=oldSlot(dateStr,slot,dayIndex);const e=window.state.schedule.entries?.[dateStr+'|'+slot.id];if(e){const additions=warningLine(e)+planLineForEntry(e,dateStr,slot.id);if(additions){html=html.replace('</div></td>',additions+'</div></td>').replace('slot-card has','slot-card has pb-v3-has');}}return html;}}
    const oldHome=app.home?.bind(app); if(oldHome){app.home=function(){oldHome();const root=$('page-home');if(!root)return;const warnings=currentWarnings();const plans=Object.entries(window.state.planningPlans||{}).filter(([k,p])=>p&&p.sessions).slice(-4);let extra='';if(warnings.length){extra+=`<div class="panel pb-warning-panel"><h2>⚠ Cảnh báo PlanningBridge</h2><p>Main cần xử lý trước khi lịch được xem là an toàn.</p><div class="pb-warning-list">${warnings.map(w=>`<article><b>${h(window.state.subjects?.[w.subjectId]?.name||w.subjectId||'Môn học')}</b><span>${h(w.message||'Chưa đủ thời lượng')}</span><div><button class="btn sm primary" onclick="planningBridgeMainAction('regenerate_schedule','${escapeJs(w.subjectId)}','${escapeJs(w.courseId||'')}')">Tạo lại lịch</button><button class="btn sm" onclick="planningBridgeMainAction('add_extra_study_time','${escapeJs(w.subjectId)}','${escapeJs(w.courseId||'')}')">Học bù thêm giờ</button></div></article>`).join('')}</div></div>`;}if(plans.length){extra+=`<div class="panel pb-plan-panel"><h2>🧭 Route cards từ môn học</h2><p>Môn tự chia lịch nội bộ theo buổi, Main chỉ điều phối thời gian.</p>${plans.map(([k,p])=>`<article><b>${h(p.target||p.courseId||k)}</b><small>${h(routeSummary(p))}</small></article>`).join('')}</div>`;}if(extra)root.insertAdjacentHTML('beforeend',extra);}}
  }
  function storeWarning(msg){ensurePlanningState();const subjectId=msg.subjectId||msg.subject||window.state.activeTask?.subjectId||'';const courseId=msg.courseId||window.state.activeTask?.courseId||'general';const key=warningKey(subjectId,courseId);window.state.planningWarnings[key]={...msg,subjectId,courseId,key,receivedAt:new Date().toISOString(),resolvedAt:null};safeSave();window.app?.home?.();window.app?.schedule?.();window.toast?.('⚠ Môn học cảnh báo: cần điều chỉnh lịch');}
  function storePlan(msg){ensurePlanningState();const subjectId=msg.subjectId||msg.subject||window.state.activeTask?.subjectId||'';const courseId=msg.courseId||window.state.activeTask?.courseId||msg.plan?.courseId||'general';const plan=msg.plan||msg.routePlan||msg;const normalized={...plan,subjectId,courseId,receivedAt:new Date().toISOString()};const missionId=msg.missionId||plan.missionId||window.state.activeTask?.missionId;window.state.planningPlans[keyOf(subjectId,courseId)]=normalized;if(missionId)window.state.planningPlans[missionId]=normalized;safeSave();window.app?.home?.();window.app?.schedule?.();}
  function freeSlotOnDate(date,slots){for(const s of slots){const key=date+'|'+s.id;if(!window.state.schedule.entries[key])return s}return null}
  function findFreeSlot(startDate,{weekendOnly=false,preferRegular=true}={}){for(let off=0;off<120;off++){const ds=addDays(startDate,off);if(window.app?.isEligibleStudyDate&&!window.app.isEligibleStudyDate(ds))continue;const dow=parseDate(ds).getDay();let slots=[];if(weekendOnly){slots=dow===6?REVIEW_SLOTS_V3:(dow===0?[REVIEW_SLOTS_V3[0]]:[])}else if(preferRegular){slots=(dow>=1&&dow<=5)?MAIN_SLOTS_V3:(dow===6?REVIEW_SLOTS_V3:(dow===0?[REVIEW_SLOTS_V3[0]]:[]))}else{slots=(dow>=1&&dow<=5)?[...MAIN_SLOTS_V3]:[...REVIEW_SLOTS_V3]}
      const slot=freeSlotOnDate(ds,slots);if(slot)return {date:ds,slot};}
    return null;}
  function addSession(subjectId,courseId,label,opts={}){const start=window.state.schedule?.autoFrom||iso(new Date());const found=findFreeSlot(start,opts);if(!found)return 0;window.state.schedule.entries[found.date+'|'+found.slot.id]={subjectId,itemId:courseId||'',learningItem:label,label:opts.weekendOnly?'Học bù / sửa lỗi cuối tuần':'Bổ sung theo PlanningBridge',source:opts.weekendOnly?'planning-extra-weekend':'planning-regenerated',durationMinutes:Number(found.slot.minutes||slotMinutes(found.slot.id)),plannedEndDate:found.date};return Number(found.slot.minutes||slotMinutes(found.slot.id));}
  function totalMinutes(subjectId,courseId){return allEntries(subjectId,courseId).reduce((a,e)=>a+Number(e.minutes||0),0)}
  function totalDays(subjectId,courseId){return unique(allEntries(subjectId,courseId).map(e=>e.date)).length}
  function resolveIfEnough(subjectId,courseId,requiredMinutes,requiredDays){const key=warningKey(subjectId,courseId);const w=window.state.planningWarnings[key];if(w&&totalMinutes(subjectId,courseId)>=Number(requiredMinutes||0)&&totalDays(subjectId,courseId)>=Number(requiredDays||0)){w.resolvedAt=new Date().toISOString();w.status='resolved_by_main_schedule';}}
  function actionRequirements(w){const opts=w?.options||[];const regen=opts.find(o=>o.action==='regenerate_schedule')||{};const extra=opts.find(o=>o.action==='add_extra_study_time')||{};return {minMinutes:Number(w?.requestedMinimumMinutes||regen.requestedMinimumMinutes||0),minDays:Number(w?.requestedMinimumDays||regen.requestedMinimumDays||0),extraMinutes:Number(w?.requestedExtraMinutes||extra.requestedExtraMinutes||360)};}
  function dispatchUpdatedMission(subjectId,courseId){const iframe=$('subjectFrame');if(iframe?.contentWindow){const task=buildPlanningMission(subjectId,{courseId});send(iframe.contentWindow,task)}}
  function handleMainAction(action,subjectId,courseId){ensurePlanningState();const w=warningFor(subjectId,courseId)||{};const req=actionRequirements(w);let guard=0,added=0;if(action==='regenerate_schedule'){while(((!req.minMinutes)||totalMinutes(subjectId,courseId)<req.minMinutes || (req.minDays&&totalDays(subjectId,courseId)<req.minDays)) && guard++<120){const m=addSession(subjectId,courseId,'Bổ sung để đạt chuẩn đầu ra',{weekendOnly:false,preferRegular:true});if(!m)break;added+=m;}}
    else {const target=req.extraMinutes||360;while(added<target&&guard++<60){const m=addSession(subjectId,courseId,'Học bù thêm giờ theo cảnh báo',{weekendOnly:true,preferRegular:false});if(!m)break;added+=m;}}
    resolveIfEnough(subjectId,courseId,req.minMinutes,req.minDays);safeSave();window.app?.schedule?.();window.app?.home?.();dispatchUpdatedMission(subjectId,courseId);window.toast?.(action==='regenerate_schedule'?'Đã tạo lại lịch theo cảnh báo':'Đã thêm học bù cuối tuần');}
  function openRoute(subjectId,courseId,view,learnTab,mode){const s=window.state.subjects?.[subjectId];if(!s?.mainPath)return window.toast?.('Không tìm thấy file môn học');const task=buildPlanningMission(subjectId,{courseId});task.preferredView=view;task.learnTab=learnTab;task.mode=mode;window.state.activeTask=task;safeSave();const iframe=$('subjectFrame');if(iframe?.contentWindow){send(iframe.contentWindow,task);window.toast?.('Đã gửi chỉ dẫn tới môn học');}else{window.app?.openSubjectInPage?.(subjectId,{courseId});}}
  window.addEventListener('message',e=>{if(!trusted(e))return;const msg=e.data||{};if(!msg||typeof msg!=='object')return;if(['BAUMAN_SUBJECT_READY','BAUMAN_CHILD_READY'].includes(msg.type)&&window.state?.activeTask){send(e.source,window.state.activeTask)}if(msg.type==='BAUMAN_SUBJECT_WARNING')storeWarning(msg);if(msg.type==='BAUMAN_SUBJECT_SCHEDULE_REQUEST')storeWarning({...msg,status:'warning',message:msg.reason||'Môn học yêu cầu Main điều chỉnh lịch.'});if(['BAUMAN_SUBJECT_PLAN','BAUMAN_SUBJECT_ROUTE_PLAN','BAUMAN_SUBJECT_INTERNAL_PLAN'].includes(msg.type))storePlan(msg);if(msg.plan&&msg.plan.sessions)storePlan(msg);});
  window.planningBridgeMainAction=handleMainAction;
  window.planningBridgeOpenRoute=openRoute;
  window.BaumanMainPlanningBridge={VERSION,buildPlanningMission,currentWarnings,planFor,handleMainAction,routeSummary};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patchOpeners);else patchOpeners();
})();
