'use strict';
(function(){
  const VERSION='Official Course Learning · Pass 14A';
  const DATA_URL='assets/data/official-course-learning-architecture-2026.json';
  const READ_ONLY=true;
  const h=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let architecture=null;

  function curriculum(){return window.BAUMAN_CURRICULUM_2026||null}
  function prereq(){return window.BAUMAN_PREREQ_2026||null}
  function academic(){return window.BAUMAN_ACADEMIC_2026_RUNTIME||null}
  function allOfficial(){const c=curriculum();return c?[...(c.disciplines||[]),...(c.practices||[]),...(c.gia||[])]:[]}
  function officialById(id){return allOfficial().find(x=>x.id===id)||null}
  function blueprintById(id){return (architecture?.courseBlueprints||[]).find(x=>x.courseId===id)||null}
  function gateById(id){const p=prereq();return [...(p?.coreGates||[]),...(p?.jitBridgeGates||[])].find(x=>x.id===id)||null}
  function itemMeta(x){const sems=x?.semesters||[];return `${Number(x?.credits||0)} cr · ${Number(x?.hours||0)} h · HK ${sems.join(', ')||'—'} · ${(x?.assessment||[]).join(' + ')||'—'}`}
  function readiness(id){return academic()?.courseReadiness?.(id)||{id:'unassessed',label:'Chưa chẩn đoán đủ',score:null}}
  function risk(id){return academic()?.courseRisk?.(id,academic()?.currentStageId?.())||{id:'unknown',label:'UNKNOWN'}}
  function laneState(courseId){
    const r=readiness(courseId);
    if(r.id==='unassessed')return {id:'diagnose',label:'DIAGNOSE PREREQUISITE',next:'Chẩn đoán các gate critical trước khi mở học rộng.'};
    if(r.id==='rebuild')return {id:'rebuild',label:'REBUILD PREREQUISITE',next:'Xây lại nền critical đang gãy trước khi học sâu môn chính thức.'};
    if(r.id==='repair')return {id:'repair',label:'REPAIR PREREQUISITE',next:'Sửa đúng node critical đã sai rồi kiểm tra lại.'};
    if(r.id==='bridge')return {id:'bridge',label:'BRIDGE TO READY',next:'Bridge hẹp các gate còn 80–89 lên READY ≥90.'};
    return {id:'course_ready',label:'COURSE READY',next:'Dùng nền đã đạt để chuyển sang core của môn và graded event.'};
  }
  function claimLabel(type){return ({official_identity:'OFFICIAL',public_course_evidence:'PUBLIC IU5 EVIDENCE',existing_repo_reuse:'REUSE',bridge_inference:'INFERRED BRIDGE',suggested_evidence:'SUGGESTED EVIDENCE'})[type]||String(type||'').toUpperCase()}
  function gateTags(ids){return (ids||[]).map(id=>{const g=gateById(id);return `<button class="course14a-gate" onclick="openAcademicGate('${h(id)}')"><b>${h(id)}</b><span>${h(g?.name||id)}</span></button>`}).join('')||'<span class="course14a-empty">—</span>'}

  function courseModel(courseId){
    const course=officialById(courseId),blueprint=blueprintById(courseId);if(!course||!blueprint)return null;
    const ready=readiness(courseId),courseRisk=risk(courseId),lane=laneState(courseId);
    return {course,blueprint,ready,risk:courseRisk,lane};
  }
  function renderCard(id){
    const m=courseModel(id);if(!m)return '';
    const score=m.ready.score==null?'—':`${m.ready.score}%`;
    return `<button class="course14a-card ${h(m.lane.id)}" onclick="openOfficialCourseLearning2026('${h(id)}')"><span class="course14a-card-top"><b>${h(id)}</b><em>${h(m.lane.label)}</em></span><strong>${h(m.course.nameRu)}</strong><small>${h(itemMeta(m.course))}</small><span class="course14a-readiness">Readiness: ${h(m.ready.label)} · ${h(score)} · Risk ${h(m.risk.label||'UNKNOWN')}</span><p>${h(m.lane.next)}</p></button>`;
  }
  function renderHomePanel(){
    if(!architecture)return '';
    const cards=(architecture.semester1DisplayOrder||[]).map(renderCard).join('');
    return `<section class="course14a-shell" data-course-learning14a="home"><article class="course14a-panel"><div class="course14a-head"><div><span class="course14a-badge">PHASE 2 · PASS 14A · READ ONLY</span><h2>Official Course Learning Architecture · HK1</h2><p>Mỗi môn đi theo một lane duy nhất: prerequisite → course core → graded event → evidence reuse. Focus suy luận luôn được gắn nhãn, không giả thành syllabus chính thức.</p></div><span class="course14a-lock">Scheduler/content mutation: OFF</span></div><div class="course14a-grid">${cards}</div><div class="course14a-targets"><span>COURSE READY ≥ ${h(architecture.policy.performanceTargets.courseReady)}</span><span>GRADED EVENT READY ≥ ${h(architecture.policy.performanceTargets.gradedEventReady)}</span><span>Internal strategy · không phải ngưỡng điểm chính thức</span></div></article></section>`;
  }
  function appendHome(){const root=document.getElementById('page-home');if(!root||root.querySelector('[data-course-learning14a="home"]'))return;root.insertAdjacentHTML('beforeend',renderHomePanel())}
  function patchApp(){
    if(!window.app||window.app.__courseLearning14aPatched)return false;
    const app=window.app,oldHome=app.home.bind(app);app.__courseLearning14aPatched=true;
    app.home=function(){oldHome();appendHome()};app.home();return true;
  }
  function focusHtml(bp){return (bp.focus||[]).map(x=>`<li><span class="course14a-claim ${h(x.sourceType)}">${h(claimLabel(x.sourceType))}</span><b>${h(x.label)}</b>${x.sourceRef?`<small>${h(x.sourceRef)}</small>`:''}</li>`).join('')}
  function laneHtml(){return (architecture?.policy?.defaultLane||[]).map((x,i)=>`<div class="course14a-lane-step"><b>${i+1}</b><span>${h(x.replaceAll('_',' '))}</span></div>`).join('')}
  function modal(title,body){if(typeof window.openModal==='function')return window.openModal(title,body,true);const root=document.getElementById('modalRoot');if(root)root.innerHTML=`<div class="modal-backdrop"><div class="dialog wide"><div class="dialog-head"><h2>${h(title)}</h2><button class="btn" onclick="document.getElementById('modalRoot').innerHTML=''">Đóng</button></div><div class="dialog-body">${body}</div></div></div>`}
  function openCourseLearning(id){
    const m=courseModel(id);if(!m)return modal('Official Course Learning','Không tìm thấy learning contract cho course này.');
    const bp=m.blueprint,srcs=(architecture?.sourceCatalog||[]).filter(s=>(bp.focus||[]).some(f=>f.sourceRef===s.id));
    const body=`<div class="course14a-modal"><section><span class="course14a-badge">${h(id)} · ${h(m.lane.label)}</span><h3>${h(m.course.nameRu)}</h3><p><b>${h(itemMeta(m.course))}</b></p><p>${h(m.lane.next)}</p></section><section><h4>Learning lane</h4><div class="course14a-lane">${laneHtml()}</div></section><section><h4>Critical gates</h4><div class="course14a-gates">${gateTags(bp.criticalGates)}</div><h4>Support gates</h4><div class="course14a-gates">${gateTags(bp.supportGates)}</div></section><section><h4>Course focus · có provenance</h4><ul class="course14a-focus">${focusHtml(bp)}</ul></section><section><h4>Evidence nên giữ lại</h4><p>${(bp.suggestedEvidence||[]).map(x=>`<span class="course14a-evidence">${h(x)}</span>`).join(' ')}</p><p class="course14a-note">Đây là artifact học tập đề xuất, không tự động được coi là yêu cầu nộp chính thức.</p></section>${srcs.length?`<section><h4>Nguồn công khai được dùng</h4>${srcs.map(s=>`<p class="course14a-source"><b>${h(s.id)}</b> · ${h(s.url)}<br><small>${h(s.caveat||'')}</small></p>`).join('')}</section>`:''}</div>`;
    modal(m.course.nameRu,body);
  }
  async function fetchJson(url){const r=await fetch(url,{cache:'no-cache'});if(!r.ok)throw new Error(`${url} HTTP ${r.status}`);return r.json()}
  async function waitBase(timeout=15000){const t=Date.now();while(Date.now()-t<timeout){if(window.BAUMAN_ACADEMIC_2026_RUNTIME&&window.BAUMAN_CURRICULUM_2026&&window.BAUMAN_PREREQ_2026&&window.app)return true;await new Promise(r=>setTimeout(r,50))}throw new Error('Academic base runtime not ready')}
  async function load(){
    try{await waitBase();architecture=await fetchJson(DATA_URL);window.BAUMAN_OFFICIAL_COURSE_LEARNING_DATA_2026=architecture;patchApp();console.info(VERSION,{courses:architecture.courseBlueprints?.length||0,readOnly:READ_ONLY})}
    catch(err){console.warn('Official Course Learning disabled safely:',err)}
  }
  window.openOfficialCourseLearning2026=openCourseLearning;
  window.BAUMAN_OFFICIAL_COURSE_LEARNING_2026=Object.freeze({version:VERSION,readOnly:READ_ONLY,load,courseModel,laneState,openCourseLearning,getArchitecture:()=>architecture});
  document.addEventListener('DOMContentLoaded',()=>setTimeout(load,0));
})();
