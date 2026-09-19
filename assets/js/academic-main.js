'use strict';
(function(){
  const VERSION='Academic 2026 Runtime · Pass 13C';
  const CURRICULUM_URL='assets/data/official-curriculum-iu5-2026.json';
  const PREREQ_URL='assets/data/prerequisite-registry-iu5-2026.json';
  const PACK_MANIFEST_URL='assets/data/prerequisite-packs/manifest-2026.json';
  const VERIFIED_LOADER_TRIAL_PARAM='academicVerifiedLoader';
  const VERIFIED_LOADER_TRIAL_VALUE='1';
  const DIAGNOSTIC_STORAGE_KEY='bauman_academic_2026_diagnostics_v1';
  const MAIN_STORAGE_KEY='bauman_main_all_phases_subjects_v1';
  const CURRENT_USER_KEY='bauman_current_user_fullcode_v1';
  const SCHEDULER_MUTATION_ENABLED=false;
  const STAGE_MAP=Object.freeze({prepare:'before_stankin',preparatory:'stankin',bauman:'pre_bauman_8_weeks',m1:'semester_1',m2:'semester_2',m3:'semester_3',m4:'semester_4'});
  const RISK_META=Object.freeze({
    rebuild:{id:'critical',label:'CRITICAL',rank:50},
    repair:{id:'high',label:'HIGH',rank:40},
    bridge:{id:'medium',label:'MEDIUM',rank:30},
    unassessed:{id:'unknown',label:'UNKNOWN',rank:20},
    ready:{id:'clear',label:'CLEAR',rank:5},
    mastered:{id:'clear',label:'CLEAR',rank:0}
  });

  const h=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const byId=(arr,id)=>(arr||[]).find(x=>x.id===id)||null;
  const uniq=a=>Array.from(new Set((a||[]).filter(Boolean)));
  const finite=n=>Number.isFinite(Number(n));
  const clampScore=n=>Math.max(0,Math.min(100,Number(n)));
  let academicStore=null;

  function currentUserScope(){
    try{const u=JSON.parse(localStorage.getItem(CURRENT_USER_KEY)||'null');return String(u?.email||'anonymous').toLowerCase()}catch{return 'anonymous'}
  }
  function blankStore(){return {schema:'bauman_academic_diagnostic_store_v1',version:'PASS13C',users:{}}}
  function persistStore(){try{localStorage.setItem(DIAGNOSTIC_STORAGE_KEY,JSON.stringify(academicStore||blankStore()));return true}catch(err){console.warn('Academic diagnostic storage failed:',err);return false}}
  function migrateLegacyDiagnostics(){
    const scope=currentUserScope();if(academicStore?.users?.[scope]?.migrationChecked)return;
    academicStore.users[scope]=academicStore.users[scope]&&typeof academicStore.users[scope]==='object'?academicStore.users[scope]:{};
    const user=academicStore.users[scope];user.gateDiagnostics=user.gateDiagnostics&&typeof user.gateDiagnostics==='object'?user.gateDiagnostics:{};
    try{const main=JSON.parse(localStorage.getItem(MAIN_STORAGE_KEY)||'null');const legacy=main?.academic2026?.gateDiagnostics;if(legacy&&typeof legacy==='object')for(const [gateId,value] of Object.entries(legacy))if(user.gateDiagnostics[gateId]==null)user.gateDiagnostics[gateId]=value}catch{/* no legacy state */}
    user.migrationChecked=true;persistStore();
  }
  function readStore(){
    if(academicStore)return academicStore;
    try{const parsed=JSON.parse(localStorage.getItem(DIAGNOSTIC_STORAGE_KEY)||'null');academicStore=parsed&&typeof parsed==='object'?parsed:blankStore()}catch{academicStore=blankStore()}
    if(!academicStore.users||typeof academicStore.users!=='object')academicStore.users={};academicStore.version='PASS13C';migrateLegacyDiagnostics();return academicStore;
  }
  function userAcademicState(){const store=readStore(),scope=currentUserScope();store.users[scope]=store.users[scope]&&typeof store.users[scope]==='object'?store.users[scope]:{};const u=store.users[scope];u.gateDiagnostics=u.gateDiagnostics&&typeof u.gateDiagnostics==='object'?u.gateDiagnostics:{};return u}
  function rawDiagnostic(gateId){return userAcademicState().gateDiagnostics[gateId]||null}
  function scoreForGate(gateId){
    const raw=rawDiagnostic(gateId);if(!raw||typeof raw!=='object')return null;
    if(!finite(raw.D0)||!finite(raw.D1)||!finite(raw.D2)||!finite(raw.criticalMisconceptions))return null;
    const d0=clampScore(raw.D0),d1=clampScore(raw.D1),d2=clampScore(raw.D2),critical=Number(raw.criticalMisconceptions);if(!Number.isInteger(critical)||critical<0)return null;
    const score=Math.round((0.25*d0+0.50*d1+0.25*d2)*10)/10;return {score,d0,d1,d2,critical,failedNodeIds:uniq(raw.failedNodeIds),assessedAt:raw.assessedAt||null};
  }

  function allGates(){const p=window.BAUMAN_PREREQ_2026;return [...(p?.coreGates||[]),...(p?.jitBridgeGates||[])]}
  function gateById(id){return byId(allGates(),id)}
  function packByGate(id){return window.BAUMAN_PREREQ_PACKS_2026?.[id]||null}
  function gateState(gate){
    if(!gate)return {id:'unassessed',label:'Chưa chẩn đoán',score:null,targetMet:false,reason:'missing_gate'};
    const diag=scoreForGate(gate.id);if(!diag)return {id:'unassessed',label:'Chưa chẩn đoán',score:null,targetMet:false,reason:'missing_or_incomplete_diagnostic'};
    const globalReady=Number(window.BAUMAN_PREREQ_2026?.masteryPolicy?.readyRules?.overallMinimum||90),applicationMin=Number(window.BAUMAN_PREREQ_2026?.masteryPolicy?.readyRules?.applicationMinimum||85),localTarget=Number(gate.target||globalReady),targetMet=diag.score>=localTarget;
    if(diag.critical>0)return {id:'repair',label:'REPAIR',score:diag.score,targetMet,reason:'critical_misconception',diag};
    if(diag.score<60)return {id:'rebuild',label:'REBUILD',score:diag.score,targetMet,reason:'score_below_60',diag};
    if(diag.score<80)return {id:'repair',label:'REPAIR',score:diag.score,targetMet,reason:'score_60_79',diag};
    if(diag.score<globalReady)return {id:'bridge',label:'BRIDGE',score:diag.score,targetMet,reason:targetMet?'local_target_met_global_ready_not_met':'global_ready_not_met',diag};
    if(diag.d1<applicationMin)return {id:'repair',label:'REPAIR',score:diag.score,targetMet,reason:'application_floor_not_met',diag};
    if(diag.score>=95&&diag.d1>=90)return {id:'mastered',label:'MASTERED',score:diag.score,targetMet,reason:'mastered',diag};
    return {id:'ready',label:'READY',score:diag.score,targetMet,reason:'ready',diag};
  }

  function officialItems(){
    const c=window.BAUMAN_CURRICULUM_2026;if(!c)return [];
    const items=[...(c.disciplines||[]).map(x=>({...x,kind:'discipline'})),...(c.practices||[]).map(x=>({...x,kind:'practice'})),...(c.gia||[]).map(x=>({...x,kind:'gia'}))];
    for(const g of c.electiveGroups||[])items.push({...g,nameRu:`Дисциплина по выбору · ${g.options.map(o=>o.nameRu).join(' / ')}`,semesters:[g.semester],kind:'elective_group'});return items;
  }
  function officialById(id){
    const c=window.BAUMAN_CURRICULUM_2026;if(!c)return null;let hit=byId(c.disciplines,id)||byId(c.practices,id)||byId(c.gia,id)||byId(c.electiveGroups,id);if(hit)return hit;
    for(const g of c.electiveGroups||[]){const opt=byId(g.options,id);if(opt)return {...opt,credits:g.credits,hours:g.hours,semesters:[g.semester],assessment:g.assessment,kind:'elective_option'}}return null;
  }
  function dependencyFor(courseId){return byId(window.BAUMAN_PREREQ_2026?.courseDependencies,courseId)||{critical:[],support:[]}}
  function courseReadiness(courseId){
    const dep=dependencyFor(courseId);if(!(dep.critical||[]).length)return {id:'unassessed',label:'Không có gate bắt buộc',score:null,critical:[]};
    const rows=dep.critical.map(id=>({gate:gateById(id),state:gateState(gateById(id))}));if(rows.some(x=>x.state.id==='unassessed'))return {id:'unassessed',label:'Chưa chẩn đoán đủ',score:null,critical:rows};
    const minScore=Math.min(...rows.map(x=>Number(x.state.score)));if(rows.every(x=>x.state.id==='mastered'))return {id:'mastered',label:'MASTERED',score:minScore,critical:rows};if(rows.every(x=>['ready','mastered'].includes(x.state.id)))return {id:'ready',label:'READY',score:minScore,critical:rows};
    const order=['rebuild','repair','bridge','ready','mastered'],worst=rows.reduce((a,b)=>order.indexOf(b.state.id)<order.indexOf(a.state.id)?b:a,rows[0]);return {id:worst.state.id,label:worst.state.label,score:minScore,critical:rows};
  }

  function legacyStageId(){
    const direct=window.state?.schedule?.autoStage;if(STAGE_MAP[direct])return direct;
    try{const main=JSON.parse(localStorage.getItem(MAIN_STORAGE_KEY)||'null'),saved=main?.schedule?.autoStage;if(STAGE_MAP[saved])return saved}catch{/* fallback */}
    return 'prepare';
  }
  function currentStageId(){return STAGE_MAP[legacyStageId()]||'before_stankin'}
  function stagePolicy(stageId=currentStageId()){return (window.BAUMAN_PREREQ_2026?.stageActivationPolicy||[]).find(x=>x.stage===stageId)||{stage:stageId,active:[],secondary:[],locked:[]}}
  function stageSemester(stageId=currentStageId()){
    const m=String(stageId).match(/^semester_(\d)$/);if(m)return Number(m[1]);return 1;
  }
  function stageUrgency(stageId=currentStageId()){
    if(stageId==='pre_bauman_8_weeks'||/^semester_/.test(stageId))return 'immediate';
    if(stageId==='stankin')return 'rolling';return 'future';
  }
  function semesterItems(semester){return officialItems().filter(x=>(x.semesters||((x.semester!=null)?[x.semester]:[])).includes(semester))}
  function currentCourseHorizon(stageId=currentStageId()){return {stageId,semester:stageSemester(stageId),urgency:stageUrgency(stageId),courses:semesterItems(stageSemester(stageId))}}
  function coursesThreatenedByGate(gateId,stageId=currentStageId()){
    const semester=stageSemester(stageId);return (window.BAUMAN_PREREQ_2026?.courseDependencies||[]).filter(d=>(d.critical||[]).includes(gateId)).map(d=>officialById(d.courseId)).filter(Boolean).filter(c=>(c.semesters||((c.semester!=null)?[c.semester]:[])).includes(semester));
  }
  function gateActivation(gateId,stageId=currentStageId()){
    const st=gateState(gateById(gateId));if(st.id==='mastered')return {id:'stopped',label:'STOP',reason:'mastered'};
    const p=stagePolicy(stageId);if((p.locked||[]).includes(gateId))return {id:'locked',label:'DEFER',reason:'stage_locked'};if((p.active||[]).includes(gateId))return {id:'active',label:'ACTIVE',reason:'stage_active'};if((p.secondary||[]).includes(gateId))return {id:'secondary',label:'SECONDARY',reason:'stage_secondary'};
    if(/^semester_/.test(stageId)&&coursesThreatenedByGate(gateId,stageId).length&&!['ready','mastered'].includes(st.id))return {id:'carryover_critical',label:'CARRYOVER',reason:'current_course_critical'};
    return {id:'inactive',label:'HOLD',reason:'not_active_for_stage'};
  }
  function assessmentPriority(course){const text=(course?.assessment||[]).join(' ');return /(?:^|\s)(?:Р?Экз)(?:\s|$)/u.test(text)?2:(/ДЗчт/u.test(text)?1:0)}
  function courseRisk(courseId,stageId=currentStageId()){
    const course=officialById(courseId);if(!course)return {id:'unknown',label:'UNKNOWN',priorityScore:-1,reason:'missing_course'};
    const dep=dependencyFor(courseId),critical=dep.critical||[];if(!critical.length)return {id:'clear',label:'CLEAR',priorityScore:0,reason:'no_critical_gate_in_registry',course,readiness:courseReadiness(courseId),blockers:[]};
    const readiness=courseReadiness(courseId),meta=RISK_META[readiness.id]||RISK_META.unassessed,blockers=(readiness.critical||[]).filter(x=>!['ready','mastered'].includes(x.state.id));
    const urgency=stageUrgency(stageId),urgencyRank=urgency==='immediate'?4:(urgency==='rolling'?2:1),creditsRank=Math.min(4,Math.ceil(Number(course.credits||0)/2)),priorityScore=meta.rank*100+urgencyRank*10+assessmentPriority(course)*3+creditsRank;
    return {...meta,priorityScore,reason:readiness.id==='unassessed'?'readiness_unknown':readiness.id,course,readiness,blockers,urgency,semester:stageSemester(stageId),note:'Readiness risk only; not a probability of receiving a grade.'};
  }
  function courseRiskBoard(stageId=currentStageId()){
    const sem=stageSemester(stageId);return semesterItems(sem).filter(c=>(dependencyFor(c.id).critical||[]).length).map(c=>courseRisk(c.id,stageId)).sort((a,b)=>b.priorityScore-a.priorityScore);
  }
  function shouldStopGate(gateId){return gateState(gateById(gateId)).id==='mastered'}
  function stopDecision(gateId){const stopped=shouldStopGate(gateId);return {gateId,stopBroadRemediation:stopped,continuity:stopped&&gateId==='P0'?'course_event_jit_russian_only':(stopped?'reopen_only_if_narrow_subgate_is_proven':'continue_by_state')}}

  function repairRoutesForGate(gateId){
    const pack=packByGate(gateId),state=gateState(gateById(gateId)),routes=pack?.repairRoutes||[];if(['ready','mastered','unassessed'].includes(state.id))return {routes:[],selection:'none'};
    const failed=state.diag?.failedNodeIds||[];if(!failed.length)return {routes,selection:'await_node_evidence'};const matched=routes.filter(r=>(r.triggerNodes||[]).some(n=>failed.includes(n)));return {routes:matched,selection:matched.length?'matched_failed_nodes':'no_route_match'};
  }
  function gateIntervention(gateId,stageId=currentStageId()){
    const gate=gateById(gateId),state=gateState(gate),activation=gateActivation(gateId,stageId),threatCourses=coursesThreatenedByGate(gateId,stageId),repair=repairRoutesForGate(gateId);
    let action='HOLD',actionLabel='Chưa kích hoạt',broadStop=false;
    if(state.id==='mastered'){broadStop=true;action=gateId==='P0'?'JIT_ONLY':'STOP_BROAD';actionLabel=gateId==='P0'?'Dừng ôn rộng · chỉ JIT tiếng Nga':'STOP remediation rộng'}
    else if(activation.id==='locked'){action='DEFER';actionLabel='Để đúng giai đoạn JIT'}
    else if(['inactive'].includes(activation.id)){action='HOLD';actionLabel='Chưa thuộc active route'}
    else if(state.id==='unassessed'){action='DIAGNOSE';actionLabel='Chẩn đoán trước khi học lại'}
    else if(state.id==='ready'){action='MAINTAIN_READY';actionLabel='Không repair · dùng trong môn thật'}
    else if(repair.selection==='matched_failed_nodes'){action='REPAIR_MATCHED';actionLabel='Sửa đúng node đã sai'}
    else if(repair.selection==='await_node_evidence'){action='LOCATE_FAILED_NODES';actionLabel='Khoanh node sai trước khi repair'}
    else if(repair.selection==='no_route_match'){action='REVIEW_DIAGNOSTIC';actionLabel='Kiểm tra lại diagnostic/route'}
    else if(state.id==='bridge'){action='BRIDGE_TO_READY';actionLabel='Bridge hẹp lên READY'}
    else {action='REPAIR';actionLabel='Repair theo diagnostic'}
    const actionRank={DIAGNOSE:100,LOCATE_FAILED_NODES:95,REPAIR_MATCHED:92,REPAIR:90,REVIEW_DIAGNOSTIC:88,BRIDGE_TO_READY:80,MAINTAIN_READY:20,JIT_ONLY:10,STOP_BROAD:5,DEFER:0,HOLD:0}[action]||0;
    const activationRank={carryover_critical:30,active:20,secondary:10,stopped:0,locked:0,inactive:0}[activation.id]||0,gateRank=gate?.priority==='critical'?5:(gate?.priority==='high'?3:1);
    return {gateId,gate,state,activation,action,actionLabel,broadStop,repairSelection:repair.selection,repairRoutes:repair.routes,threatCourses,priorityScore:actionRank*100+activationRank*10+gateRank+threatCourses.length};
  }
  function activeRepairPlan(stageId=currentStageId()){
    const allowed=new Set(['active','secondary','carryover_critical','stopped']);return allGates().map(g=>gateIntervention(g.id,stageId)).filter(x=>allowed.has(x.activation.id)).sort((a,b)=>b.priorityScore-a.priorityScore);
  }
  function schedulerCompatibility(stageId=currentStageId()){
    const legacyTarget=Number(window.state?.schedule?.targetScore||0),academicReadyMinimum=Number(window.BAUMAN_PREREQ_2026?.masteryPolicy?.readyRules?.overallMinimum||90);
    return {stageId,mutationEnabled:SCHEDULER_MUTATION_ENABLED,mode:'advice_only',legacyTargetScore:legacyTarget||null,academicReadyMinimum,targetBelowAcademicReady:legacyTarget>0&&legacyTarget<academicReadyMinimum,plan:activeRepairPlan(stageId).map(x=>({gateId:x.gateId,homeSubject:x.gate?.homeSubject||'',action:x.action,routeIds:(x.repairRoutes||[]).map(r=>r.id),affectedCourseIds:x.threatCourses.map(c=>c.id),stopBroadRemediation:x.broadStop}))};
  }

  function recordDiagnostic(gateId,payload){
    const gate=gateById(gateId);if(!gate)throw new Error(`Unknown gate ${gateId}`);const D0=Number(payload?.D0),D1=Number(payload?.D1),D2=Number(payload?.D2),critical=Number(payload?.criticalMisconceptions);
    if(![D0,D1,D2].every(n=>Number.isFinite(n)&&n>=0&&n<=100))throw new Error('D0/D1/D2 phải là số từ 0 đến 100.');if(!Number.isInteger(critical)||critical<0)throw new Error('Critical misconception phải là số nguyên từ 0 trở lên.');
    const allowedNodes=new Set((packByGate(gateId)?.nodes||[]).map(n=>n.id)),failedNodeIds=uniq(payload?.failedNodeIds).filter(id=>allowedNodes.has(id)),u=userAcademicState();u.gateDiagnostics[gateId]={D0,D1,D2,criticalMisconceptions:critical,failedNodeIds,assessedAt:new Date().toISOString(),source:'diagnostic_result'};if(!persistStore())throw new Error('Không lưu được diagnostic vào localStorage.');return gateState(gate);
  }
  function clearDiagnostic(gateId){const u=userAcademicState();delete u.gateDiagnostics[gateId];persistStore();return gateState(gateById(gateId))}

  function stateBadge(s){const score=s.score==null?'':` · ${h(s.score)}%`;return `<span class="academic2026-state ${h(s.id)}">${h(s.label)}${score}</span>`}
  function riskBadge(r){return `<span class="academic2026-risk ${h(r.id)}">${h(r.label)}</span>`}
  function assessmentText(x){return (x?.assessment||[]).join(' + ')||'—'}
  function itemMeta(x){const sems=x.semesters||((x.semester!=null)?[x.semester]:[]);return `${Number(x.credits||0)} cr · ${Number(x.hours||0)} h · HK ${sems.join(', ')||'—'} · ${assessmentText(x)}`}
  function gateTags(ids){return (ids||[]).map(id=>{const g=gateById(id),st=gateState(g);return `<button class="academic2026-tag" onclick="openAcademicGate('${h(id)}')">${h(id)} · ${h(g?.name||id)}${st.score==null?'':` ${h(st.score)}%`}</button>`}).join('')}
  function primaryS1Ids(){return ['d03','d04','d05','d06','d15','p02']}
  function renderRiskPanel(){
    const stage=currentStageId(),risk=courseRiskBoard(stage).slice(0,6),plan=activeRepairPlan(stage).filter(x=>!['HOLD','DEFER'].includes(x.action)).slice(0,6),compat=schedulerCompatibility(stage);
    const riskCards=risk.map(r=>`<button class="academic2026-risk-card" onclick="openOfficialCourse2026('${h(r.course.id)}')"><span><b>${h(r.course.id)}</b> ${riskBadge(r)}</span><strong>${h(r.course.nameRu)}</strong><small>${h(itemMeta(r.course))}</small><em>${r.blockers.length?`Blocker: ${h(r.blockers.map(b=>b.gate?.id||'?').join(', '))}`:'Không có blocker đã biết'}</em></button>`).join('')||'<p class="academic2026-note">Chưa có course risk trong horizon hiện tại.</p>';
    const actions=plan.map(x=>`<button class="academic2026-action-row" onclick="openAcademicGate('${h(x.gateId)}')"><span><b>${h(x.gateId)}</b>${stateBadge(x.state)}</span><strong>${h(x.actionLabel)}</strong><small>${h(x.activation.label)} · ${x.threatCourses.length?`đe dọa ${x.threatCourses.map(c=>c.id).join(', ')}`:'chưa gắn blocker course trong horizon'}</small></button>`).join('')||'<p class="academic2026-note">Không có remediation active cần hiển thị.</p>';
    const legacyWarn=compat.targetBelowAcademicReady?`Target scheduler cũ ${h(compat.legacyTargetScore)}% thấp hơn READY ${h(compat.academicReadyMinimum)}%; Pass13C chỉ cảnh báo, chưa tự sửa.`:'Scheduler Academic vẫn khóa ở chế độ advice-only.';
    return `<article class="academic2026-panel"><div class="academic2026-head"><div><span class="academic2026-badge">PASS 13C · ${h(stage)} · ADVICE ONLY</span><h3>Course Risk + Active Repair</h3><p>Risk dưới đây là readiness risk để sắp thứ tự can thiệp, không phải xác suất điểm số.</p></div><span class="academic2026-lock">Scheduler mutation: OFF</span></div><div class="academic2026-risk-grid">${riskCards}</div><h4 class="academic2026-subhead">Việc nền nên làm tiếp theo</h4><div class="academic2026-action-list">${actions}</div><p class="academic2026-note">${legacyWarn}</p></article>`;
  }
  function renderHomePanel(){
    const c=window.BAUMAN_CURRICULUM_2026;if(!c)return '';
    const cards=primaryS1Ids().map(id=>officialById(id)).filter(Boolean).map(course=>{const ready=courseReadiness(course.id),dep=dependencyFor(course.id);return `<article class="academic2026-course"><button onclick="openOfficialCourse2026('${h(course.id)}')"><div class="academic2026-head" style="margin:0 0 6px"><div><h4>${h(course.nameRu)}</h4></div>${stateBadge(ready)}</div><p>${h(itemMeta(course))}</p><div class="academic2026-tags">${gateTags(dep.critical)}</div></button></article>`}).join(''),assessed=allGates().filter(g=>gateState(g).id!=='unassessed').length;
    return `<section class="academic2026-shell" data-academic2026="home"><article class="academic2026-panel"><div class="academic2026-head"><div><span class="academic2026-badge">OFFICIAL 2026 · ИУ5 · 09.04.01</span><h2>Hệ học chính thức + cổng tiên quyết</h2><p>Diagnostic chưa làm luôn là “Chưa chẩn đoán”; hệ thống không tự điền 0 hay tự nhận đã biết.</p></div><button class="btn" onclick="openPrerequisiteOverview2026()">Cổng nền · ${assessed}/${allGates().length} đã chẩn đoán</button></div><div class="academic2026-kpis"><div class="academic2026-kpi"><small>Toàn chương trình</small><b>${h(c.program.totalCredits)}</b><span>tín chỉ</span></div><div class="academic2026-kpi"><small>Môn học</small><b>${h(c.program.disciplineCredits)}</b><span>tín chỉ</span></div><div class="academic2026-kpi"><small>Thực hành/NIR</small><b>${h(c.program.practiceCredits)}</b><span>tín chỉ</span></div><div class="academic2026-kpi"><small>ВКР / GIA</small><b>${h(c.program.giaCredits)}</b><span>tín chỉ</span></div></div></article><article class="academic2026-panel"><div class="academic2026-head"><div><span class="academic2026-badge">SEMESTER 1 READINESS</span><h3>Worst-gate readiness, không lấy trung bình</h3><p>Một gate critical chưa READY thì môn tương ứng chưa READY, dù các gate khác rất cao.</p></div></div><div class="academic2026-course-grid">${cards}</div></article>${renderRiskPanel()}</section>`;
  }
  function renderRoadmapPanel(){const c=window.BAUMAN_CURRICULUM_2026;if(!c)return '';const cols=[1,2,3,4].map(sem=>`<section class="academic2026-semester"><h3>Học kỳ ${sem}</h3><small>${semesterItems(sem).length} học phần/practice liên quan</small><div class="academic2026-semester-list">${semesterItems(sem).map(x=>`<div class="academic2026-semester-item"><button onclick="openOfficialCourse2026('${h(x.id)}')"><b>${h(x.nameRu)}</b><span>${h(itemMeta(x))}</span></button></div>`).join('')}</div></section>`).join('');return `<section class="academic2026-shell" data-academic2026="roadmap"><article class="academic2026-panel"><div class="academic2026-head"><div><span class="academic2026-badge">LOCKED CURRICULUM MIRROR</span><h2>Учебный план 2026 theo học kỳ</h2><p>Trục chính thức không bị thay bằng UGV/USV hay một đề tài luận văn giả định.</p></div></div><div class="academic2026-semesters">${cols}</div></article></section>`}
  function appendOnce(rootId,selector,html){const root=document.getElementById(rootId);if(!root||root.querySelector(selector))return;root.insertAdjacentHTML('beforeend',html)}
  function patchApp(){if(!window.app||window.app.__academic2026Patched)return;const app=window.app;app.__academic2026Patched=true;const oldHome=app.home.bind(app);app.home=function(){oldHome();appendOnce('page-home','[data-academic2026="home"]',renderHomePanel())};const oldRoadmap=app.roadmap.bind(app);app.roadmap=function(){oldRoadmap();appendOnce('page-roadmap','[data-academic2026="roadmap"]',renderRoadmapPanel())};app.home();app.roadmap()}
  function refreshPanels(){if(window.app?.home)window.app.home();if(window.app?.roadmap)window.app.roadmap()}
  function modal(title,body){if(typeof window.openModal==='function')return window.openModal(title,body,true);const root=document.getElementById('modalRoot');if(root)root.innerHTML=`<div class="modal-backdrop" data-close="1"><div class="dialog wide"><div class="dialog-head"><h2>${h(title)}</h2><button class="btn" onclick="document.getElementById('modalRoot').innerHTML=''">Đóng</button></div><div class="dialog-body">${body}</div></div></div>`}

  function diagnosticForm(g,st,pack){
    const raw=rawDiagnostic(g.id)||{},val=k=>raw[k]===0?'0':(raw[k]??''),failed=(raw.failedNodeIds||[]).join(', '),counts=pack?.diagnostic?`D0 ${(pack.diagnostic.D0?.items||[]).length} · D1 ${(pack.diagnostic.D1?.items||[]).length} · D2 ${(pack.diagnostic.D2?.items||[]).length}`:'Pack diagnostic chưa được load cho gate này.';
    return `<section class="academic2026-modal-card" style="grid-column:1/-1"><h4>Kết quả diagnostic</h4><p class="academic2026-note">${h(counts)}. Chỉ nhập điểm sau khi thực sự làm diagnostic. Critical misconception không được để trống hoặc tự mặc định 0.</p><div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px"><label>D0<input id="academicDiagD0" class="field" type="number" min="0" max="100" value="${h(val('D0'))}" placeholder="0–100"></label><label>D1<input id="academicDiagD1" class="field" type="number" min="0" max="100" value="${h(val('D1'))}" placeholder="0–100"></label><label>D2<input id="academicDiagD2" class="field" type="number" min="0" max="100" value="${h(val('D2'))}" placeholder="0–100"></label><label>Critical<input id="academicDiagCritical" class="field" type="number" min="0" step="1" value="${h(val('criticalMisconceptions'))}" placeholder="phải nhập"></label></div><label style="display:block;margin-top:8px">Failed node IDs<input id="academicDiagFailedNodes" class="field" value="${h(failed)}" placeholder="Ví dụ: ${h(pack?.nodes?.[0]?.id||'P1-N01')}, ..."></label><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn primary" onclick="saveAcademicDiagnostic2026('${h(g.id)}')">Lưu diagnostic</button>${st.id!=='unassessed'?`<button class="btn" onclick="clearAcademicDiagnostic2026('${h(g.id)}')">Xóa kết quả</button>`:''}</div></section>`;
  }
  function repairSummary(g){const info=repairRoutesForGate(g.id),st=gateState(g);if(['ready','mastered'].includes(st.id))return `<p class="academic2026-note">${st.id==='mastered'?'STOP RULE: bỏ gate khỏi remediation rộng; P0 chỉ tiếp tục JIT theo môn/sự kiện.':'Gate đã READY; không tạo repair route.'}</p>`;if(st.id==='unassessed')return '<p class="academic2026-note">Chưa có diagnostic nên không được tự chọn tuyến sửa.</p>';if(info.selection==='await_node_evidence')return `<p class="academic2026-note">Có ${info.routes.length} route nhưng chưa có failed-node evidence; runtime không đoán route.</p>`;if(!info.routes.length)return '<p class="academic2026-note">Chưa có route khớp failed-node evidence.</p>';return `<ul>${info.routes.map(r=>`<li><b>${h(r.id)}</b> · ${(r.route||[]).map(h).join(' → ')}<br><small>${h(r.stopWhen||'')}</small></li>`).join('')}</ul>`}
  function openGate(id){
    const g=gateById(id);if(!g)return;const st=gateState(g),pack=packByGate(id),activation=gateActivation(id),intervention=gateIntervention(id),targetNote=Number(g.target)<90?`Gate target nội bộ ${g.target}%, nhưng READY toàn hệ thống vẫn cần ≥90% + D1≥85 + 0 critical misconception.`:'READY cần ≥90% + D1≥85 + 0 critical misconception.';
    modal(`${g.id} · ${g.name}`,`<div class="academic2026-modal-grid"><section class="academic2026-modal-card"><h4>Trạng thái</h4>${stateBadge(st)}<p>Mục tiêu gate: <b>${h(g.target)}%</b></p><p>${h(targetNote)}</p><p>Activation: <b>${h(activation.label)}</b> · ${h(currentStageId())}</p><p>Hành động: <b>${h(intervention.actionLabel)}</b></p>${st.score!=null?`<p>D0 ${h(st.diag.d0)} · D1 ${h(st.diag.d1)} · D2 ${h(st.diag.d2)} · critical ${h(st.diag.critical)}</p>`:''}</section><section class="academic2026-modal-card"><h4>Nội dung cần làm được</h4><ul>${(g.topics||[]).map(x=>`<li>${h(x)}</li>`).join('')}</ul><h4 style="margin-top:12px">Môn bị ảnh hưởng trong horizon</h4><p>${intervention.threatCourses.length?intervention.threatCourses.map(c=>`<button class="academic2026-tag" onclick="openOfficialCourse2026('${h(c.id)}')">${h(c.id)}</button>`).join(' '):'—'}</p><h4 style="margin-top:12px">Repair routing</h4>${repairSummary(g)}</section>${diagnosticForm(g,st,pack)}</div><p class="academic2026-note">Đây là prerequisite về năng lực do Hub suy ra, không phải điều kiện hành chính chính thức của Bauman.</p>`);
  }
  function saveDiagnosticFromModal(id){try{const get=x=>document.getElementById(x)?.value,failed=String(get('academicDiagFailedNodes')||'').split(',').map(x=>x.trim()).filter(Boolean),st=recordDiagnostic(id,{D0:get('academicDiagD0'),D1:get('academicDiagD1'),D2:get('academicDiagD2'),criticalMisconceptions:get('academicDiagCritical'),failedNodeIds:failed});refreshPanels();openGate(id);if(typeof window.toast==='function')window.toast(`Đã lưu ${id}: ${st.label}`)}catch(err){alert(err.message||String(err))}}
  function clearDiagnosticFromModal(id){clearDiagnostic(id);refreshPanels();openGate(id)}
  function openPrereqOverview(){const rows=allGates().map(g=>{const st=gateState(g),act=gateActivation(g.id);return `<div class="academic2026-prereq-row"><button onclick="openAcademicGate('${h(g.id)}')"><b>${h(g.id)}</b></button><button onclick="openAcademicGate('${h(g.id)}')"><strong>${h(g.name)}</strong><small>${h(g.homeSubject)} · ${h(act.label)} · target ${h(g.target)}%</small></button>${stateBadge(st)}</div>`}).join('');modal('Prerequisite Assurance · IU5 2026',`<div class="academic2026-prereq-list">${rows}</div><p class="academic2026-note">UNASSESSED là hợp lệ. MASTERED mới STOP remediation rộng; scheduler chưa được phép tự sửa lịch.</p>`)}
  function openCourse(id){
    const course=officialById(id);if(!course)return;const dep=dependencyFor(id),ready=courseReadiness(id),risk=courseRisk(id),critical=dep.critical||[],support=dep.support||[];
    modal(course.nameRu||id,`<div class="academic2026-modal-grid"><section class="academic2026-modal-card"><h4>Dữ liệu chính thức</h4><p><b>${h(itemMeta(course))}</b></p><p>Readiness: ${stateBadge(ready)} · ${riskBadge(risk)}</p><p class="academic2026-note">Risk là readiness risk để xếp thứ tự can thiệp; không phải xác suất điểm số.</p></section><section class="academic2026-modal-card"><h4>Gate critical</h4><div class="academic2026-tags">${critical.length?gateTags(critical):'<span class="academic2026-tag">Không có gate critical trong registry V1</span>'}</div><h4 style="margin-top:12px">Gate hỗ trợ</h4><div class="academic2026-tags">${support.length?gateTags(support):'<span class="academic2026-tag">—</span>'}</div></section></div><p class="academic2026-source">Nguồn chương trình: ${h(window.BAUMAN_CURRICULUM_2026?.source?.url||CURRICULUM_URL)}</p>`);
  }

  function publishPackStatus(value){window.BAUMAN_PREREQ_PACKS_2026_STATUS=Object.freeze({ready:Boolean(value?.ready),expected:Number(value?.expected)||0,loaded:Number(value?.loaded)||0,failed:Number(value?.failed)||0})}
  function publishCoreLoaderStatus(value){window.BAUMAN_ACADEMIC_CORE_LOADER_STATUS=Object.freeze({ready:Boolean(value?.ready),mode:String(value?.mode||'pending'),verified:Boolean(value?.verified),authority:String(value?.authority||'none'),candidateStatus:value?.candidateStatus||null,candidateAuthority:value?.candidateAuthority||null,error:value?.error?String(value.error):null})}
  function verifiedLoaderTrialEnabled(){try{return new URLSearchParams(window.location.search).get(VERIFIED_LOADER_TRIAL_PARAM)===VERIFIED_LOADER_TRIAL_VALUE}catch{return false}}
  publishPackStatus({ready:false,expected:0,loaded:0,failed:0});
  publishCoreLoaderStatus({ready:false,mode:'pending',verified:false,authority:'none'});
  async function fetchJson(url){const r=await fetch(url,{cache:'no-cache'});if(!r.ok)throw new Error(`${url} HTTP ${r.status}`);return r.json()}
  async function loadCoreData(){
    const trial=verifiedLoaderTrialEnabled();
    const mode=trial?'verified_candidate':'legacy_fetch',authority=trial?'opt_in_trial':'legacy';
    publishCoreLoaderStatus({ready:false,mode,verified:false,authority});
    try{
      if(!trial){
        const [curriculum,prereq,manifest]=await Promise.all([fetchJson(CURRICULUM_URL),fetchJson(PREREQ_URL),fetchJson(PACK_MANIFEST_URL)]);
        publishCoreLoaderStatus({ready:true,mode:'legacy_fetch',verified:false,authority:'legacy'});
        return {curriculum,prereq,manifest};
      }
      const loader=window.BaumanAcademicVerifiedContentLoader;
      if(!loader||typeof loader.loadCore!=='function')throw new Error('ACADEMIC_VERIFIED_LOADER_MISSING');
      const result=await loader.loadCore({baseUrl:document.baseURI});
      if(result?.status!=='verified')throw new Error('ACADEMIC_VERIFIED_LOADER_UNVERIFIED');
      publishCoreLoaderStatus({ready:true,mode:'verified_candidate',verified:true,authority:'opt_in_trial',candidateStatus:result.candidateStatus,candidateAuthority:result.candidateAuthority});
      return {curriculum:result.data.curriculum,prereq:result.data.prerequisite,manifest:result.data.manifest};
    }catch(err){
      publishCoreLoaderStatus({ready:true,mode,verified:false,authority,error:err?.message||String(err)});
      throw err;
    }
  }
  async function load(){
    publishPackStatus({ready:false,expected:0,loaded:0,failed:0});
    try{
      const {curriculum,prereq,manifest}=await loadCoreData();
      window.BAUMAN_CURRICULUM_2026=curriculum;window.BAUMAN_PREREQ_2026=prereq;
      const rows=Array.isArray(manifest.packs)?manifest.packs:[];
      publishPackStatus({ready:false,expected:rows.length,loaded:0,failed:0});
      const results=await Promise.allSettled(rows.map(async row=>[row.gateId,await fetchJson(row.path)])),packs={};
      let failed=0;
      results.forEach((result,index)=>{
        if(result.status!=='fulfilled'){failed++;return}
        const [gateId,pack]=result.value;
        if(gateId!==rows[index]?.gateId||pack?.gateId!==gateId){failed++;return}
        packs[gateId]=pack;
      });
      window.BAUMAN_PREREQ_PACKS_2026=Object.freeze(packs);
      publishPackStatus({ready:true,expected:rows.length,loaded:Object.keys(packs).length,failed});
      readStore();patchApp();
      console.info(VERSION,{curriculum:curriculum.version,prereq:prereq.version,packs:Object.keys(packs).length,packFailures:failed,storage:DIAGNOSTIC_STORAGE_KEY,schedulerMutation:SCHEDULER_MUTATION_ENABLED});
    }catch(err){
      publishPackStatus({ready:true,expected:0,loaded:0,failed:1});
      console.warn('Academic 2026 runtime disabled safely:',err);
    }
  }

  window.openAcademicGate=openGate;window.openPrerequisiteOverview2026=openPrereqOverview;window.openOfficialCourse2026=openCourse;window.saveAcademicDiagnostic2026=saveDiagnosticFromModal;window.clearAcademicDiagnostic2026=clearDiagnosticFromModal;
  window.BAUMAN_ACADEMIC_2026_RUNTIME=Object.freeze({version:VERSION,load,loadCoreData,verifiedLoaderTrialEnabled,scoreForGate,gateState,courseReadiness,currentStageId,currentCourseHorizon,gateActivation,courseRisk,courseRiskBoard,gateIntervention,activeRepairPlan,schedulerCompatibility,recordDiagnostic,clearDiagnostic,repairRoutesForGate,shouldStopGate,stopDecision,schedulerMutationEnabled:SCHEDULER_MUTATION_ENABLED,storageKey:DIAGNOSTIC_STORAGE_KEY});
  document.addEventListener('DOMContentLoaded',()=>setTimeout(load,0));
})();