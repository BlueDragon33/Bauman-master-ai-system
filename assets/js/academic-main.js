'use strict';
(function(){
  const VERSION='Academic 2026 Runtime · Pass 02';
  const CURRICULUM_URL='assets/data/official-curriculum-iu5-2026.json';
  const PREREQ_URL='assets/data/prerequisite-registry-iu5-2026.json';

  const h=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const byId=(arr,id)=>(arr||[]).find(x=>x.id===id)||null;
  const uniq=a=>Array.from(new Set((a||[]).filter(Boolean)));

  function ensureState(){
    if(!window.state)return null;
    const s=window.state;
    s.academic2026=s.academic2026&&typeof s.academic2026==='object'?s.academic2026:{};
    s.academic2026.gateDiagnostics=s.academic2026.gateDiagnostics&&typeof s.academic2026.gateDiagnostics==='object'?s.academic2026.gateDiagnostics:{};
    s.academic2026.version=s.academic2026.version||'PREREQ_ASSURANCE_IU5_2026_V1';
    return s.academic2026;
  }

  function scoreForGate(gateId){
    const a=ensureState();
    const raw=a?.gateDiagnostics?.[gateId];
    if(!raw || typeof raw!=='object')return null;
    const d0=Number(raw.D0), d1=Number(raw.D1), d2=Number(raw.D2);
    if(![d0,d1,d2].every(Number.isFinite))return null;
    const critical=Number(raw.criticalMisconceptions||0);
    const score=Math.round((0.25*d0+0.50*d1+0.25*d2)*10)/10;
    return {score,d0,d1,d2,critical};
  }

  function gateState(gate){
    const diag=scoreForGate(gate.id);
    if(!diag)return {id:'unassessed',label:'Chưa chẩn đoán',score:null};
    if(diag.critical>0)return {id:'repair',label:'REPAIR',score:diag.score};
    if(diag.score>=95 && diag.d1>=85)return {id:'mastered',label:'MASTERED',score:diag.score};
    if(diag.score>=Number(gate.target||90) && diag.d1>=85)return {id:'ready',label:'READY',score:diag.score};
    if(diag.score>=80)return {id:'bridge',label:'BRIDGE',score:diag.score};
    if(diag.score>=60)return {id:'repair',label:'REPAIR',score:diag.score};
    return {id:'rebuild',label:'REBUILD',score:diag.score};
  }

  function allGates(){
    const p=window.BAUMAN_PREREQ_2026;
    return [...(p?.coreGates||[]),...(p?.jitBridgeGates||[])];
  }

  function gateById(id){ return byId(allGates(),id); }

  function officialItems(){
    const c=window.BAUMAN_CURRICULUM_2026;
    if(!c)return [];
    const items=[
      ...(c.disciplines||[]).map(x=>({...x,kind:'discipline'})),
      ...(c.practices||[]).map(x=>({...x,kind:'practice'})),
      ...(c.gia||[]).map(x=>({...x,kind:'gia'}))
    ];
    for(const g of c.electiveGroups||[]){
      items.push({...g,nameRu:`Дисциплина по выбору · ${g.options.map(o=>o.nameRu).join(' / ')}`,semesters:[g.semester],kind:'elective_group'});
    }
    return items;
  }

  function officialById(id){
    const c=window.BAUMAN_CURRICULUM_2026;
    if(!c)return null;
    let hit=byId(c.disciplines,id)||byId(c.practices,id)||byId(c.gia,id)||byId(c.electiveGroups,id);
    if(hit)return hit;
    for(const g of c.electiveGroups||[]){
      const opt=byId(g.options,id);
      if(opt)return {...opt,credits:g.credits,hours:g.hours,semesters:[g.semester],assessment:g.assessment,kind:'elective_option'};
    }
    return null;
  }

  function dependencyFor(courseId){
    return byId(window.BAUMAN_PREREQ_2026?.courseDependencies,courseId)||{critical:[],support:[]};
  }

  function courseReadiness(courseId){
    const dep=dependencyFor(courseId);
    if(!(dep.critical||[]).length)return {id:'unassessed',label:'Không có gate bắt buộc',score:null,critical:[]};
    const rows=dep.critical.map(id=>({gate:gateById(id),state:gateState(gateById(id)||{id,target:90})}));
    if(rows.some(x=>x.state.id==='unassessed'))return {id:'unassessed',label:'Chưa chẩn đoán đủ',score:null,critical:rows};
    const minScore=Math.min(...rows.map(x=>Number(x.state.score||0)));
    const order=['rebuild','repair','bridge','ready','mastered'];
    const worst=rows.reduce((a,b)=>order.indexOf(b.state.id)<order.indexOf(a.state.id)?b:a,rows[0]);
    return {id:worst.state.id,label:worst.state.id==='mastered'?'MASTERED':worst.state.id==='ready'?'READY':worst.state.id==='bridge'?'BRIDGE':worst.state.id==='repair'?'REPAIR':'REBUILD',score:minScore,critical:rows};
  }

  function stateBadge(stateObj){
    const score=stateObj.score==null?'':` · ${h(stateObj.score)}%`;
    return `<span class="academic2026-state ${h(stateObj.id)}">${h(stateObj.label)}${score}</span>`;
  }

  function assessmentText(x){ return (x?.assessment||[]).join(' + ')||'—'; }

  function itemMeta(x){
    const sems=x.semesters||((x.semester!=null)?[x.semester]:[]);
    return `${Number(x.credits||0)} cr · ${Number(x.hours||0)} h · HK ${sems.join(', ')||'—'} · ${assessmentText(x)}`;
  }

  function gateTags(ids){
    return (ids||[]).map(id=>{
      const g=gateById(id);
      const st=g?gateState(g):{id:'unassessed',label:'?',score:null};
      return `<button class="academic2026-tag" onclick="openAcademicGate('${h(id)}')">${h(id)} · ${h(g?.name||id)}${st.score==null?'':` ${h(st.score)}%`}</button>`;
    }).join('');
  }

  function semesterItems(semester){
    return officialItems().filter(x=>(x.semesters||[]).includes(semester));
  }

  function primaryS1Ids(){
    return ['d03','d04','d05','d06','d15','p02'];
  }

  function renderHomePanel(){
    const c=window.BAUMAN_CURRICULUM_2026;
    if(!c)return '';
    const selected=primaryS1Ids().map(id=>officialById(id)).filter(Boolean);
    const cards=selected.map(course=>{
      const ready=courseReadiness(course.id);
      const dep=dependencyFor(course.id);
      return `<article class="academic2026-course">
        <button onclick="openOfficialCourse2026('${h(course.id)}')">
          <div class="academic2026-head" style="margin:0 0 6px"><div><h4>${h(course.nameRu)}</h4></div>${stateBadge(ready)}</div>
          <p>${h(itemMeta(course))}</p>
          <div class="academic2026-tags">${gateTags(dep.critical)}</div>
        </button>
      </article>`;
    }).join('');
    return `<section class="academic2026-shell" data-academic2026="home">
      <article class="academic2026-panel">
        <div class="academic2026-head">
          <div>
            <span class="academic2026-badge">OFFICIAL 2026 · ИУ5 · 09.04.01</span>
            <h2>Hệ học chính thức + cổng tiên quyết</h2>
            <p>Chỉ hiện dữ liệu đã khóa từ учебный план 2026. Điểm nền chưa kiểm tra sẽ giữ trạng thái “Chưa chẩn đoán”, không tự giả định là yếu hoặc mạnh.</p>
          </div>
          <button class="btn" onclick="openPrerequisiteOverview2026()">Xem toàn bộ cổng nền</button>
        </div>
        <div class="academic2026-kpis">
          <div class="academic2026-kpi"><small>Toàn chương trình</small><b>${h(c.program.totalCredits)}</b><span>tín chỉ</span></div>
          <div class="academic2026-kpi"><small>Môn học</small><b>${h(c.program.disciplineCredits)}</b><span>tín chỉ</span></div>
          <div class="academic2026-kpi"><small>Thực hành/NIR</small><b>${h(c.program.practiceCredits)}</b><span>tín chỉ</span></div>
          <div class="academic2026-kpi"><small>ВКР / GIA</small><b>${h(c.program.giaCredits)}</b><span>tín chỉ</span></div>
        </div>
      </article>
      <article class="academic2026-panel">
        <div class="academic2026-head">
          <div><span class="academic2026-badge">SEMESTER 1 READINESS</span><h3>Những khối phải sẵn sàng trước khi vào HK1</h3><p>Ưu tiên theo môn thật của Bauman, không theo UGV/USV hay một đề tài luận văn giả định.</p></div>
        </div>
        <div class="academic2026-course-grid">${cards}</div>
        <p class="academic2026-note">Pass 02 là lớp hiển thị đọc-only. Chẩn đoán D0/D1/D2 và scheduler thích nghi sẽ chỉ được mở sau khi bộ câu hỏi từng gate được xây và kiểm định.</p>
      </article>
    </section>`;
  }

  function renderRoadmapPanel(){
    const c=window.BAUMAN_CURRICULUM_2026;
    if(!c)return '';
    const cols=[1,2,3,4].map(sem=>{
      const items=semesterItems(sem);
      return `<section class="academic2026-semester">
        <h3>Học kỳ ${sem}</h3>
        <small>${items.length} học phần/practice liên quan</small>
        <div class="academic2026-semester-list">
          ${items.map(x=>`<div class="academic2026-semester-item"><button onclick="openOfficialCourse2026('${h(x.id)}')"><b>${h(x.nameRu)}</b><span>${h(itemMeta(x))}</span></button></div>`).join('')}
        </div>
      </section>`;
    }).join('');
    return `<section class="academic2026-shell" data-academic2026="roadmap">
      <article class="academic2026-panel">
        <div class="academic2026-head"><div><span class="academic2026-badge">LOCKED CURRICULUM MIRROR</span><h2>Учебный план 2026 theo học kỳ</h2><p>Đây là trục chính thức. Các app Math / Programming / AI / Systems / Research chỉ là kho kiến thức phục vụ các mục dưới đây.</p></div></div>
        <div class="academic2026-semesters">${cols}</div>
      </article>
    </section>`;
  }

  function appendOnce(rootId,selector,html){
    const root=document.getElementById(rootId);
    if(!root || root.querySelector(selector))return;
    root.insertAdjacentHTML('beforeend',html);
  }

  function patchApp(){
    if(!window.app || window.app.__academic2026Patched)return;
    const app=window.app;
    app.__academic2026Patched=true;
    const oldHome=app.home.bind(app);
    app.home=function(){ oldHome(); appendOnce('page-home','[data-academic2026="home"]',renderHomePanel()); };
    const oldRoadmap=app.roadmap.bind(app);
    app.roadmap=function(){ oldRoadmap(); appendOnce('page-roadmap','[data-academic2026="roadmap"]',renderRoadmapPanel()); };
    app.home();
    app.roadmap();
  }

  function modal(title,body){
    if(typeof window.openModal==='function')return window.openModal(title,body,true);
    const root=document.getElementById('modalRoot');
    if(root)root.innerHTML=`<div class="modal-backdrop" data-close="1"><div class="dialog wide"><div class="dialog-head"><h2>${h(title)}</h2><button class="btn" onclick="document.getElementById('modalRoot').innerHTML=''">Đóng</button></div><div class="dialog-body">${body}</div></div></div>`;
  }

  function openGate(id){
    const g=gateById(id);
    if(!g)return;
    const st=gateState(g);
    modal(`${g.id} · ${g.name}`,`<div class="academic2026-modal-grid">
      <section class="academic2026-modal-card"><h4>Trạng thái</h4>${stateBadge(st)}<p>Mục tiêu gate: <b>${h(g.target)}%</b></p><p>Kho môn phụ trách: <b>${h(g.homeSubject)}</b></p><p>Ưu tiên: <b>${h(g.priority)}</b></p></section>
      <section class="academic2026-modal-card"><h4>Nội dung cần làm được</h4><ul>${(g.topics||[]).map(x=>`<li>${h(x)}</li>`).join('')}</ul></section>
    </div><p class="academic2026-note">Đây là prerequisite về năng lực do hệ thống suy ra để bảo đảm khả năng học môn chính thức; không được trình bày như điều kiện hành chính chính thức của Bauman.</p>`);
  }

  function openPrereqOverview(){
    const rows=allGates().map(g=>{
      const st=gateState(g);
      return `<div class="academic2026-prereq-row"><button onclick="openAcademicGate('${h(g.id)}')"><b>${h(g.id)}</b></button><button onclick="openAcademicGate('${h(g.id)}')"><strong>${h(g.name)}</strong><small>${h(g.homeSubject)} · mục tiêu ${h(g.target)}%</small></button>${stateBadge(st)}</div>`;
    }).join('');
    modal('Prerequisite Assurance · IU5 2026',`<div class="academic2026-prereq-list">${rows}</div><p class="academic2026-note">Không có điểm nào được tự điền. Gate chưa làm diagnostic giữ nguyên trạng thái “Chưa chẩn đoán”.</p>`);
  }

  function openCourse(id){
    const course=officialById(id);
    if(!course)return;
    const dep=dependencyFor(id);
    const ready=courseReadiness(id);
    const critical=(dep.critical||[]);
    const support=(dep.support||[]);
    modal(course.nameRu||id,`<div class="academic2026-modal-grid">
      <section class="academic2026-modal-card"><h4>Dữ liệu chính thức</h4><p><b>${h(itemMeta(course))}</b></p><p>Trạng thái sẵn sàng: ${stateBadge(ready)}</p></section>
      <section class="academic2026-modal-card"><h4>Cổng bắt buộc về năng lực</h4><div class="academic2026-tags">${critical.length?gateTags(critical):'<span class="academic2026-tag">Không có gate bắt buộc trong registry V1</span>'}</div><h4 style="margin-top:12px">Cổng hỗ trợ</h4><div class="academic2026-tags">${support.length?gateTags(support):'<span class="academic2026-tag">—</span>'}</div></section>
    </div><p class="academic2026-source">Nguồn chương trình: ${h(window.BAUMAN_CURRICULUM_2026?.source?.url||CURRICULUM_URL)}</p>`);
  }

  async function load(){
    try{
      const [curriculum,prereq]=await Promise.all([
        fetch(CURRICULUM_URL,{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error(`curriculum HTTP ${r.status}`);return r.json()}),
        fetch(PREREQ_URL,{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error(`prereq HTTP ${r.status}`);return r.json()})
      ]);
      window.BAUMAN_CURRICULUM_2026=curriculum;
      window.BAUMAN_PREREQ_2026=prereq;
      ensureState();
      patchApp();
      console.info(VERSION,{curriculum:curriculum.version,prereq:prereq.version});
    }catch(err){
      console.warn('Academic 2026 runtime disabled safely:',err);
    }
  }

  window.openAcademicGate=openGate;
  window.openPrerequisiteOverview2026=openPrereqOverview;
  window.openOfficialCourse2026=openCourse;
  window.BAUMAN_ACADEMIC_2026_RUNTIME={version:VERSION,load,courseReadiness,gateState};
  document.addEventListener('DOMContentLoaded',()=>setTimeout(load,0));
})();