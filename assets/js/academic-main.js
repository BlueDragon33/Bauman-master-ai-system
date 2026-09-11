'use strict';
(function(){
  const VERSION='Academic 2026 Runtime · Pass 13B';
  const CURRICULUM_URL='assets/data/official-curriculum-iu5-2026.json';
  const PREREQ_URL='assets/data/prerequisite-registry-iu5-2026.json';
  const PACK_MANIFEST_URL='assets/data/prerequisite-packs/manifest-2026.json';
  const DIAGNOSTIC_STORAGE_KEY='bauman_academic_2026_diagnostics_v1';
  const MAIN_STORAGE_KEY='bauman_main_all_phases_subjects_v1';
  const CURRENT_USER_KEY='bauman_current_user_fullcode_v1';

  const h=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const byId=(arr,id)=>(arr||[]).find(x=>x.id===id)||null;
  const uniq=a=>Array.from(new Set((a||[]).filter(Boolean)));
  const finite=n=>Number.isFinite(Number(n));
  const clampScore=n=>Math.max(0,Math.min(100,Number(n)));

  let academicStore=null;

  function currentUserScope(){
    try{
      const u=JSON.parse(localStorage.getItem(CURRENT_USER_KEY)||'null');
      return String(u?.email||'anonymous').toLowerCase();
    }catch{return 'anonymous'}
  }

  function blankStore(){ return {schema:'bauman_academic_diagnostic_store_v1',version:'PASS13B',users:{}}; }

  function readStore(){
    if(academicStore)return academicStore;
    try{
      const parsed=JSON.parse(localStorage.getItem(DIAGNOSTIC_STORAGE_KEY)||'null');
      academicStore=parsed&&typeof parsed==='object'?parsed:blankStore();
    }catch{academicStore=blankStore()}
    if(!academicStore.users||typeof academicStore.users!=='object')academicStore.users={};
    migrateLegacyDiagnostics();
    return academicStore;
  }

  function migrateLegacyDiagnostics(){
    const scope=currentUserScope();
    if(academicStore?.users?.[scope]?.migrationChecked)return;
    academicStore.users[scope]=academicStore.users[scope]&&typeof academicStore.users[scope]==='object'?academicStore.users[scope]:{};
    const user=academicStore.users[scope];
    user.gateDiagnostics=user.gateDiagnostics&&typeof user.gateDiagnostics==='object'?user.gateDiagnostics:{};
    try{
      const main=JSON.parse(localStorage.getItem(MAIN_STORAGE_KEY)||'null');
      const legacy=main?.academic2026?.gateDiagnostics;
      if(legacy&&typeof legacy==='object'){
        for(const [gateId,value] of Object.entries(legacy)) if(user.gateDiagnostics[gateId]==null) user.gateDiagnostics[gateId]=value;
      }
    }catch{/* no legacy state */}
    user.migrationChecked=true;
    persistStore();
  }

  function persistStore(){
    try{localStorage.setItem(DIAGNOSTIC_STORAGE_KEY,JSON.stringify(academicStore||blankStore()));return true}catch(err){console.warn('Academic diagnostic storage failed:',err);return false}
  }

  function userAcademicState(){
    const store=readStore();
    const scope=currentUserScope();
    store.users[scope]=store.users[scope]&&typeof store.users[scope]==='object'?store.users[scope]:{};
    const u=store.users[scope];
    u.gateDiagnostics=u.gateDiagnostics&&typeof u.gateDiagnostics==='object'?u.gateDiagnostics:{};
    return u;
  }

  function rawDiagnostic(gateId){ return userAcademicState().gateDiagnostics[gateId]||null; }

  function scoreForGate(gateId){
    const raw=rawDiagnostic(gateId);
    if(!raw||typeof raw!=='object')return null;
    if(!finite(raw.D0)||!finite(raw.D1)||!finite(raw.D2)||!finite(raw.criticalMisconceptions))return null;
    const d0=clampScore(raw.D0),d1=clampScore(raw.D1),d2=clampScore(raw.D2);
    const critical=Number(raw.criticalMisconceptions);
    if(!Number.isInteger(critical)||critical<0)return null;
    const score=Math.round((0.25*d0+0.50*d1+0.25*d2)*10)/10;
    return {score,d0,d1,d2,critical,failedNodeIds:uniq(raw.failedNodeIds),assessedAt:raw.assessedAt||null};
  }

  function allGates(){
    const p=window.BAUMAN_PREREQ_2026;
    return [...(p?.coreGates||[]),...(p?.jitBridgeGates||[])];
  }
  function gateById(id){return byId(allGates(),id)}
  function packByGate(id){return window.BAUMAN_PREREQ_PACKS_2026?.[id]||null}

  function gateState(gate){
    if(!gate)return {id:'unassessed',label:'Chưa chẩn đoán',score:null,targetMet:false,reason:'missing_gate'};
    const diag=scoreForGate(gate.id);
    if(!diag)return {id:'unassessed',label:'Chưa chẩn đoán',score:null,targetMet:false,reason:'missing_or_incomplete_diagnostic'};
    const globalReady=Number(window.BAUMAN_PREREQ_2026?.masteryPolicy?.readyRules?.overallMinimum||90);
    const applicationMin=Number(window.BAUMAN_PREREQ_2026?.masteryPolicy?.readyRules?.applicationMinimum||85);
    const localTarget=Number(gate.target||globalReady);
    const targetMet=diag.score>=localTarget;
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
    for(const g of c.electiveGroups||[])items.push({...g,nameRu:`Дисциплина по выбору · ${g.options.map(o=>o.nameRu).join(' / ')}`,semesters:[g.semester],kind:'elective_group'});
    return items;
  }
  function officialById(id){
    const c=window.BAUMAN_CURRICULUM_2026;if(!c)return null;
    let hit=byId(c.disciplines,id)||byId(c.practices,id)||byId(c.gia,id)||byId(c.electiveGroups,id);if(hit)return hit;
    for(const g of c.electiveGroups||[]){const opt=byId(g.options,id);if(opt)return {...opt,credits:g.credits,hours:g.hours,semesters:[g.semester],assessment:g.assessment,kind:'elective_option'}}
    return null;
  }
  function dependencyFor(courseId){return byId(window.BAUMAN_PREREQ_2026?.courseDependencies,courseId)||{critical:[],support:[]}}

  function courseReadiness(courseId){
    const dep=dependencyFor(courseId);
    if(!(dep.critical||[]).length)return {id:'unassessed',label:'Không có gate bắt buộc',score:null,critical:[]};
    const rows=dep.critical.map(id=>({gate:gateById(id),state:gateState(gateById(id))}));
    if(rows.some(x=>x.state.id==='unassessed'))return {id:'unassessed',label:'Chưa chẩn đoán đủ',score:null,critical:rows};
    const minScore=Math.min(...rows.map(x=>Number(x.state.score)));
    if(rows.every(x=>x.state.id==='mastered'))return {id:'mastered',label:'MASTERED',score:minScore,critical:rows};
    if(rows.every(x=>['ready','mastered'].includes(x.state.id)))return {id:'ready',label:'READY',score:minScore,critical:rows};
    const order=['rebuild','repair','bridge','ready','mastered'];
    const worst=rows.reduce((a,b)=>order.indexOf(b.state.id)<order.indexOf(a.state.id)?b:a,rows[0]);
    return {id:worst.state.id,label:worst.state.label,score:minScore,critical:rows};
  }

  function shouldStopGate(gateId){return gateState(gateById(gateId)).id==='mastered'}

  function repairRoutesForGate(gateId){
    const pack=packByGate(gateId),state=gateState(gateById(gateId));
    const routes=pack?.repairRoutes||[];
    if(['ready','mastered','unassessed'].includes(state.id))return {routes:[],selection:'none'};
    const failed=state.diag?.failedNodeIds||[];
    if(!failed.length)return {routes,selection:'await_node_evidence'};
    const matched=routes.filter(r=>(r.triggerNodes||[]).some(n=>failed.includes(n)));
    return {routes:matched,selection:matched.length?'matched_failed_nodes':'no_route_match'};
  }

  function recordDiagnostic(gateId,payload){
    const gate=gateById(gateId);if(!gate)throw new Error(`Unknown gate ${gateId}`);
    const D0=Number(payload?.D0),D1=Number(payload?.D1),D2=Number(payload?.D2),critical=Number(payload?.criticalMisconceptions);
    if(![D0,D1,D2].every(n=>Number.isFinite(n)&&n>=0&&n<=100))throw new Error('D0/D1/D2 phải là số từ 0 đến 100.');
    if(!Number.isInteger(critical)||critical<0)throw new Error('Critical misconception phải là số nguyên từ 0 trở lên.');
    const allowedNodes=new Set((packByGate(gateId)?.nodes||[]).map(n=>n.id));
    const failedNodeIds=uniq(payload?.failedNodeIds).filter(id=>allowedNodes.has(id));
    const u=userAcademicState();
    u.gateDiagnostics[gateId]={D0,D1,D2,criticalMisconceptions:critical,failedNodeIds,assessedAt:new Date().toISOString(),source:'diagnostic_result'};
    if(!persistStore())throw new Error('Không lưu được diagnostic vào localStorage.');
    return gateState(gate);
  }

  function clearDiagnostic(gateId){
    const u=userAcademicState();delete u.gateDiagnostics[gateId];persistStore();return gateState(gateById(gateId));
  }

  function stateBadge(stateObj){
    const score=stateObj.score==null?'':` · ${h(stateObj.score)}%`;
    return `<span class="academic2026-state ${h(stateObj.id)}">${h(stateObj.label)}${score}</span>`;
  }
  function assessmentText(x){return (x?.assessment||[]).join(' + ')||'—'}
  function itemMeta(x){const sems=x.semesters||((x.semester!=null)?[x.semester]:[]);return `${Number(x.credits||0)} cr · ${Number(x.hours||0)} h · HK ${sems.join(', ')||'—'} · ${assessmentText(x)}`}
  function gateTags(ids){return (ids||[]).map(id=>{const g=gateById(id),st=gateState(g);return `<button class="academic2026-tag" onclick="openAcademicGate('${h(id)}')">${h(id)} · ${h(g?.name||id)}${st.score==null?'':` ${h(st.score)}%`}</button>`}).join('')}
  function semesterItems(semester){return officialItems().filter(x=>(x.semesters||[]).includes(semester))}
  function primaryS1Ids(){return ['d03','d04','d05','d06','d15','p02']}

  function renderHomePanel(){
    const c=window.BAUMAN_CURRICULUM_2026;if(!c)return '';
    const cards=primaryS1Ids().map(id=>officialById(id)).filter(Boolean).map(course=>{const ready=courseReadiness(course.id),dep=dependencyFor(course.id);return `<article class="academic2026-course"><button onclick="openOfficialCourse2026('${h(course.id)}')"><div class="academic2026-head" style="margin:0 0 6px"><div><h4>${h(course.nameRu)}</h4></div>${stateBadge(ready)}</div><p>${h(itemMeta(course))}</p><div class="academic2026-tags">${gateTags(dep.critical)}</div></button></article>`}).join('');
    const assessed=allGates().filter(g=>gateState(g).id!=='unassessed').length;
    return `<section class="academic2026-shell" data-academic2026="home"><article class="academic2026-panel"><div class="academic2026-head"><div><span class="academic2026-badge">OFFICIAL 2026 · ИУ5 · 09.04.01</span><h2>Hệ học chính thức + cổng tiên quyết</h2><p>Diagnostic chưa làm luôn là “Chưa chẩn đoán”; hệ thống không tự điền 0 hay tự nhận đã biết.</p></div><button class="btn" onclick="openPrerequisiteOverview2026()">Cổng nền · ${assessed}/${allGates().length} đã chẩn đoán</button></div><div class="academic2026-kpis"><div class="academic2026-kpi"><small>Toàn chương trình</small><b>${h(c.program.totalCredits)}</b><span>tín chỉ</span></div><div class="academic2026-kpi"><small>Môn học</small><b>${h(c.program.disciplineCredits)}</b><span>tín chỉ</span></div><div class="academic2026-kpi"><small>Thực hành/NIR</small><b>${h(c.program.practiceCredits)}</b><span>tín chỉ</span></div><div class="academic2026-kpi"><small>ВКР / GIA</small><b>${h(c.program.giaCredits)}</b><span>tín chỉ</span></div></div></article><article class="academic2026-panel"><div class="academic2026-head"><div><span class="academic2026-badge">SEMESTER 1 READINESS</span><h3>Worst-gate readiness, không lấy trung bình</h3><p>Một gate critical chưa READY thì môn tương ứng chưa READY, dù các gate khác rất cao.</p></div></div><div class="academic2026-course-grid">${cards}</div><p class="academic2026-note">Pass 13B đã bật lưu diagnostic và tính readiness. Scheduler vẫn read-only đối với dữ liệu Academic 2026 ở lượt này.</p></article></section>`;
  }

  function renderRoadmapPanel(){
    const c=window.BAUMAN_CURRICULUM_2026;if(!c)return '';
    const cols=[1,2,3,4].map(sem=>`<section class="academic2026-semester"><h3>Học kỳ ${sem}</h3><small>${semesterItems(sem).length} học phần/practice liên quan</small><div class="academic2026-semester-list">${semesterItems(sem).map(x=>`<div class="academic2026-semester-item"><button onclick="openOfficialCourse2026('${h(x.id)}')"><b>${h(x.nameRu)}</b><span>${h(itemMeta(x))}</span></button></div>`).join('')}</div></section>`).join('');
    return `<section class="academic2026-shell" data-academic2026="roadmap"><article class="academic2026-panel"><div class="academic2026-head"><div><span class="academic2026-badge">LOCKED CURRICULUM MIRROR</span><h2>Учебный план 2026 theo học kỳ</h2><p>Trục chính thức không bị thay bằng UGV/USV hay một đề tài luận văn giả định.</p></div></div><div class="academic2026-semesters">${cols}</div></article></section>`;
  }

  function appendOnce(rootId,selector,html){const root=document.getElementById(rootId);if(!root||root.querySelector(selector))return;root.insertAdjacentHTML('beforeend',html)}
  function patchApp(){
    if(!window.app||window.app.__academic2026Patched)return;
    const app=window.app;app.__academic2026Patched=true;
    const oldHome=app.home.bind(app);app.home=function(){oldHome();appendOnce('page-home','[data-academic2026="home"]',renderHomePanel())};
    const oldRoadmap=app.roadmap.bind(app);app.roadmap=function(){oldRoadmap();appendOnce('page-roadmap','[data-academic2026="roadmap"]',renderRoadmapPanel())};
    app.home();app.roadmap();
  }
  function refreshPanels(){if(window.app?.home)window.app.home();if(window.app?.roadmap)window.app.roadmap()}

  function modal(title,body){
    if(typeof window.openModal==='function')return window.openModal(title,body,true);
    const root=document.getElementById('modalRoot');if(root)root.innerHTML=`<div class="modal-backdrop" data-close="1"><div class="dialog wide"><div class="dialog-head"><h2>${h(title)}</h2><button class="btn" onclick="document.getElementById('modalRoot').innerHTML=''">Đóng</button></div><div class="dialog-body">${body}</div></div></div>`;
  }

  function diagnosticForm(g,st,pack){
    const raw=rawDiagnostic(g.id)||{};
    const val=k=>raw[k]===0?'0':(raw[k]??'');
    const failed=(raw.failedNodeIds||[]).join(', ');
    const counts=pack?.diagnostic?`D0 ${(pack.diagnostic.D0?.items||[]).length} · D1 ${(pack.diagnostic.D1?.items||[]).length} · D2 ${(pack.diagnostic.D2?.items||[]).length}`:'Pack diagnostic chưa được load cho gate này.';
    return `<section class="academic2026-modal-card" style="grid-column:1/-1"><h4>Kết quả diagnostic</h4><p class="academic2026-note">${h(counts)}. Chỉ nhập điểm sau khi thực sự làm diagnostic. Critical misconception không được để trống hoặc tự mặc định 0.</p><div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px"><label>D0<input id="academicDiagD0" class="field" type="number" min="0" max="100" value="${h(val('D0'))}" placeholder="0–100"></label><label>D1<input id="academicDiagD1" class="field" type="number" min="0" max="100" value="${h(val('D1'))}" placeholder="0–100"></label><label>D2<input id="academicDiagD2" class="field" type="number" min="0" max="100" value="${h(val('D2'))}" placeholder="0–100"></label><label>Critical<input id="academicDiagCritical" class="field" type="number" min="0" step="1" value="${h(val('criticalMisconceptions'))}" placeholder="phải nhập"></label></div><label style="display:block;margin-top:8px">Failed node IDs (nếu diagnostic có bằng chứng theo node)<input id="academicDiagFailedNodes" class="field" value="${h(failed)}" placeholder="Ví dụ: ${h(pack?.nodes?.[0]?.id||'P1-N01')}, ..."></label><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn primary" onclick="saveAcademicDiagnostic2026('${h(g.id)}')">Lưu diagnostic</button>${st.id!=='unassessed'?`<button class="btn" onclick="clearAcademicDiagnostic2026('${h(g.id)}')">Xóa kết quả</button>`:''}</div></section>`;
  }

  function repairSummary(g){
    const info=repairRoutesForGate(g.id),st=gateState(g);
    if(['ready','mastered'].includes(st.id))return `<p class="academic2026-note">${st.id==='mastered'?'STOP RULE: bỏ gate khỏi remediation rộng; chỉ mở lại khi có sub-gate hẹp được chứng minh cần thiết.':'Gate đã READY; không tạo repair route.'}</p>`;
    if(st.id==='unassessed')return '<p class="academic2026-note">Chưa có diagnostic nên không được tự chọn tuyến sửa.</p>';
    if(info.selection==='await_node_evidence')return `<p class="academic2026-note">Có ${info.routes.length} repair route trong pack, nhưng chưa có failed-node evidence nên runtime không đoán route. Hãy ghi node sai từ diagnostic.</p>`;
    if(!info.routes.length)return '<p class="academic2026-note">Chưa có route khớp với failed-node evidence; cần kiểm tra lại dữ liệu diagnostic.</p>';
    return `<ul>${info.routes.map(r=>`<li><b>${h(r.id)}</b> · ${(r.route||[]).map(h).join(' → ')}<br><small>${h(r.stopWhen||'')}</small></li>`).join('')}</ul>`;
  }

  function openGate(id){
    const g=gateById(id);if(!g)return;const st=gateState(g),pack=packByGate(id);
    const targetNote=Number(g.target)<90?`Gate target nội bộ ${g.target}%, nhưng READY toàn hệ thống vẫn cần ≥90% + D1≥85 + 0 critical misconception.`:`READY cần ≥90% + D1≥85 + 0 critical misconception.`;
    modal(`${g.id} · ${g.name}`,`<div class="academic2026-modal-grid"><section class="academic2026-modal-card"><h4>Trạng thái</h4>${stateBadge(st)}<p>Mục tiêu gate: <b>${h(g.target)}%</b></p><p>${h(targetNote)}</p><p>Kho môn: <b>${h(g.homeSubject)}</b></p>${st.score!=null?`<p>D0 ${h(st.diag.d0)} · D1 ${h(st.diag.d1)} · D2 ${h(st.diag.d2)} · critical ${h(st.diag.critical)}</p>`:''}</section><section class="academic2026-modal-card"><h4>Nội dung cần làm được</h4><ul>${(g.topics||[]).map(x=>`<li>${h(x)}</li>`).join('')}</ul><h4 style="margin-top:12px">Repair routing</h4>${repairSummary(g)}</section>${diagnosticForm(g,st,pack)}</div><p class="academic2026-note">Đây là prerequisite về năng lực do Hub suy ra, không phải điều kiện hành chính chính thức của Bauman.</p>`);
  }

  function saveDiagnosticFromModal(id){
    try{
      const get=x=>document.getElementById(x)?.value;
      const failed=String(get('academicDiagFailedNodes')||'').split(',').map(x=>x.trim()).filter(Boolean);
      const st=recordDiagnostic(id,{D0:get('academicDiagD0'),D1:get('academicDiagD1'),D2:get('academicDiagD2'),criticalMisconceptions:get('academicDiagCritical'),failedNodeIds:failed});
      refreshPanels();openGate(id);if(typeof window.toast==='function')window.toast(`Đã lưu ${id}: ${st.label}`);
    }catch(err){alert(err.message||String(err))}
  }
  function clearDiagnosticFromModal(id){clearDiagnostic(id);refreshPanels();openGate(id)}

  function openPrereqOverview(){
    const rows=allGates().map(g=>{const st=gateState(g);return `<div class="academic2026-prereq-row"><button onclick="openAcademicGate('${h(g.id)}')"><b>${h(g.id)}</b></button><button onclick="openAcademicGate('${h(g.id)}')"><strong>${h(g.name)}</strong><small>${h(g.homeSubject)} · target ${h(g.target)}%</small></button>${stateBadge(st)}</div>`}).join('');
    modal('Prerequisite Assurance · IU5 2026',`<div class="academic2026-prereq-list">${rows}</div><p class="academic2026-note">UNASSESSED là trạng thái hợp lệ. Không có điểm nào được tự điền. MASTERED mới kích hoạt STOP RULE cho remediation rộng.</p>`);
  }

  function openCourse(id){
    const course=officialById(id);if(!course)return;const dep=dependencyFor(id),ready=courseReadiness(id),critical=dep.critical||[],support=dep.support||[];
    modal(course.nameRu||id,`<div class="academic2026-modal-grid"><section class="academic2026-modal-card"><h4>Dữ liệu chính thức</h4><p><b>${h(itemMeta(course))}</b></p><p>Readiness: ${stateBadge(ready)}</p><p class="academic2026-note">Course readiness dùng gate critical yếu nhất; không lấy trung bình để che gate yếu.</p></section><section class="academic2026-modal-card"><h4>Gate critical</h4><div class="academic2026-tags">${critical.length?gateTags(critical):'<span class="academic2026-tag">Không có gate critical trong registry V1</span>'}</div><h4 style="margin-top:12px">Gate hỗ trợ</h4><div class="academic2026-tags">${support.length?gateTags(support):'<span class="academic2026-tag">—</span>'}</div></section></div><p class="academic2026-source">Nguồn chương trình: ${h(window.BAUMAN_CURRICULUM_2026?.source?.url||CURRICULUM_URL)}</p>`);
  }

  async function fetchJson(url){const r=await fetch(url,{cache:'no-cache'});if(!r.ok)throw new Error(`${url} HTTP ${r.status}`);return r.json()}
  async function load(){
    try{
      const [curriculum,prereq,manifest]=await Promise.all([fetchJson(CURRICULUM_URL),fetchJson(PREREQ_URL),fetchJson(PACK_MANIFEST_URL)]);
      window.BAUMAN_CURRICULUM_2026=curriculum;window.BAUMAN_PREREQ_2026=prereq;
      const results=await Promise.allSettled((manifest.packs||[]).map(async row=>[row.gateId,await fetchJson(row.path)]));
      const packs={};for(const result of results)if(result.status==='fulfilled'){const [gateId,pack]=result.value;if(pack?.gateId===gateId)packs[gateId]=pack}
      window.BAUMAN_PREREQ_PACKS_2026=Object.freeze(packs);readStore();patchApp();
      console.info(VERSION,{curriculum:curriculum.version,prereq:prereq.version,packs:Object.keys(packs).length,storage:DIAGNOSTIC_STORAGE_KEY});
    }catch(err){console.warn('Academic 2026 runtime disabled safely:',err)}
  }

  window.openAcademicGate=openGate;
  window.openPrerequisiteOverview2026=openPrereqOverview;
  window.openOfficialCourse2026=openCourse;
  window.saveAcademicDiagnostic2026=saveDiagnosticFromModal;
  window.clearAcademicDiagnostic2026=clearDiagnosticFromModal;
  window.BAUMAN_ACADEMIC_2026_RUNTIME=Object.freeze({version:VERSION,load,scoreForGate,gateState,courseReadiness,recordDiagnostic,clearDiagnostic,repairRoutesForGate,shouldStopGate,storageKey:DIAGNOSTIC_STORAGE_KEY});
  document.addEventListener('DOMContentLoaded',()=>setTimeout(load,0));
})();