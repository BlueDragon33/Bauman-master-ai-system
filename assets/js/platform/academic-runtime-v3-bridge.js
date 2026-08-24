(function(global){
  'use strict';

  const VERSION='BAUMAN_IU5_MAIN_UI_BRIDGE_V3_2';
  const DATA=global.BAUMAN_DATA;
  const app=global.app;
  const state=global.state;
  if(!DATA||!app||!state)return;

  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const stageShort=id=>({prepare:'GĐ1',preparatory:'GĐ2',bauman:'GĐ3',m1:'HK1',m2:'HK2',m3:'HK3',m4:'HK4'}[id]||String(id||''));

  function syncSubjectMetadata(){
    let changed=false;
    const byId=Object.fromEntries((DATA.subjects||[]).map(subject=>[subject.id,subject]));
    state.subjects=state.subjects&&typeof state.subjects==='object'?state.subjects:{};
    Object.entries(byId).forEach(([id,source])=>{
      const current=state.subjects[id]||{};
      const preserved={mainPath:current.mainPath||`subjects/${id}/index.html`,editorPath:current.editorPath||`subjects/${id}/editor.html`,priority:current.priority||(['russian','math','programming','ai'].includes(id)?'q1':'q2')};
      const next={...current,...source,...preserved};
      const fields=['name','desc','main','icon','track'];
      if(fields.some(key=>current[key]!==next[key])||JSON.stringify(current.eq||[])!==JSON.stringify(next.eq||[])||state.academicRuntimeVersion!==VERSION)changed=true;
      state.subjects[id]=next;
    });
    if(!state.subjects[state.subject])state.subject='russian';
    if(!['prepare','preparatory','bauman','m1','m2','m3','m4'].includes(state.subjectStage))state.subjectStage='prepare';
    if(!['prepare','preparatory','bauman','m1','m2','m3','m4'].includes(state.roadmapStage))state.roadmapStage='prepare';
    state.academicRuntimeVersion=VERSION;
    if(changed){try{global.save?.();}catch(_){ }}
    return changed;
  }

  function bestTask(subjectId){
    const today=new Date().toISOString().slice(0,10);
    const entries=Object.entries(state.schedule?.entries||{}).map(([key,value])=>{
      const [date,slotId]=key.split('|');
      return {...(value||{}),date,slotId,key};
    }).filter(item=>item.subjectId===subjectId).sort((a,b)=>(a.date+a.slotId).localeCompare(b.date+b.slotId));
    return entries.find(item=>item.date>=today)||entries.at(-1)||null;
  }

  function courseTag(c){
    if(c.officialSource)return '<span class="tag strong">Учебный план ИУ-5 · 2026</span>';
    if(c.stage==='preparatory')return '<span class="tag strong">Dự bị / chuyển tiếp</span>';
    return '<span class="tag strong">Pre-Master prerequisite</span>';
  }

  app.courseHTML=function(c){
    return `<article class="course ${esc(c.priority||'')} ${esc(c.type||'')} route-course-card academic-v3-course">
      <div class="course-type-line">${courseTag(c)}<span class="tag">${esc(stageShort(c.stage))}</span>${c.hours?`<span class="tag">${esc(c.hours)}</span>`:''}</div>
      <h4>${esc(c.name||c.vi)}</h4>
      ${c.ru?`<p><b>${esc(c.ru)}</b></p>`:''}
      ${c.routeRole?`<p class="course-role"><b>Vai trò trong 09.04.01/11:</b> ${esc(c.routeRole)}</p>`:''}
      ${c.competencies?.length?`<div class="route-competency-box"><b>Năng lực cần đạt</b><div class="course-tags">${c.competencies.map(item=>`<span class="tag">${esc(item)}</span>`).join('')}</div></div>`:''}
      ${c.deliverable?`<p class="course-output"><b>Đầu ra:</b> ${esc(c.deliverable)}</p>`:''}
    </article>`;
  };

  app.subjectDetailHTML=function(subject){
    const filter=['prepare','preparatory','bauman','m1','m2','m3','m4'].includes(state.subjectStage)?state.subjectStage:'prepare';
    const courses=app.subjectCourses(subject.id,filter);
    const task=bestTask(subject.id);
    const competencies=[...new Set(courses.flatMap(c=>c.competencies||[]))].slice(0,8);
    return `<div class="subject-head compact academic-v3-subject-head"><span class="subject-icon">${esc(subject.icon)}</span><div><span class="pill purple">ИУ-5 · 09.04.01/11</span><h2>${esc(subject.name)}</h2><p>${esc(subject.desc)}</p></div></div>
      <div class="subject-actions compact-actions"><button class="launch primary compact-launch" onclick="app.openSubjectInPage('${esc(subject.id)}')"><strong>Học trong trang này</strong><small>Mở đúng content engine của môn</small></button><button class="launch compact-launch" onclick="app.openSubjectTab('${esc(subject.id)}')"><strong>Mở tab riêng</strong><small>Vẫn nhận nhiệm vụ từ Main</small></button><button class="btn compact-data" onclick="app.openSubjectEditor('${esc(subject.id)}')">Dữ liệu môn</button></div>
      <div class="subject-content"><div class="current-stage-note"><span class="pill">${esc(stageShort(filter))}</span><b>${esc(subject.main||'Kho môn phục vụ trực tiếp lộ trình Bauman.')}</b></div>
      ${competencies.length?`<div class="route-subject-summary"><div><b>Năng lực giai đoạn</b><div class="course-tags">${competencies.map(item=>`<span class="tag">${esc(item)}</span>`).join('')}</div></div></div>`:''}
      <div class="section-head"><div><h2>${courses.length?'Học phần / prerequisite':'Chưa có học phần ở giai đoạn này'}</h2><p>${task?`Nhiệm vụ gần nhất: ${esc(task.learningItem||'Học theo lịch')} · ${esc(task.date||'')}`:'Main sẽ ưu tiên môn theo giai đoạn và prerequisite.'}</p></div></div>
      <div class="course-list subject-course-list">${courses.slice(0,10).map(c=>app.courseHTML(c)).join('')||'<article class="course"><p>Chọn giai đoạn khác để xem nội dung liên quan.</p></article>'}</div></div>`;
  };

  const nirPlan=[
    {semester:'HK1',title:'НИР 1 · Đặt bài toán nghiên cứu',items:['Chốt hướng nghiên cứu đủ hẹp','Lập literature matrix','Viết research question/hypothesis','Chọn dữ liệu hoặc hệ thống thí nghiệm','Định nghĩa baseline và metric']},
    {semester:'HK2',title:'НИР 2 · Baseline và protocol',items:['Dựng baseline tái lập được','Khóa experimental protocol','Lập data/version log','Chạy thí nghiệm vòng 1','Viết báo cáo kết quả sơ bộ']},
    {semester:'HK3',title:'НИР 3 · Thực nghiệm chính',items:['Chạy comparative experiments','Phân tích lỗi và độ nhạy','Kiểm thống kê khi phù hợp','Hoàn thiện bảng/hình kết quả','Viết draft phần method/results']},
    {semester:'HK4',title:'НИР 4 → ВКР',items:['Khóa dữ liệu và mã','Hoàn thiện thí nghiệm cuối','Viết ВКР','Chuẩn bị slide/demo','Pre-defense','Bảo vệ ВКР']}
  ];

  function researchProgress(blockIndex){
    const block=nirPlan[blockIndex];
    const done=block.items.filter((_,itemIndex)=>state.researchChecks?.[`iu5.${blockIndex}.${itemIndex}`]).length;
    return {done,total:block.items.length,pct:Math.round(done*100/Math.max(1,block.items.length))};
  }

  app.research=function(){
    const root=document.getElementById('page-research');
    if(!root)return;
    const overall=nirPlan.reduce((acc,_,index)=>{const p=researchProgress(index);acc.done+=p.done;acc.total+=p.total;return acc;},{done:0,total:0});
    const pct=Math.round(overall.done*100/Math.max(1,overall.total));
    root.innerHTML=`<div class="canva-research-page academic-v3-research">
      <section class="canva-research-hero panel"><div><span class="pill purple">НИР · ВКР · ИУ-5 · 09.04.01/11</span><h2>Nghiên cứu chạy xuyên 4 học kỳ</h2><p>Không chờ đến cuối khóa mới làm luận văn. Mỗi học kỳ phải tạo ra bằng chứng nghiên cứu có thể tái sử dụng cho ВКР.</p></div><aside class="academic-research-progress"><b>${pct}%</b><span>${overall.done}/${overall.total} checkpoint</span></aside></section>
      <section class="academic-nir-grid">${nirPlan.map((block,blockIndex)=>{const p=researchProgress(blockIndex);return `<article class="panel academic-nir-card"><header><div><span>${esc(block.semester)}</span><h3>${esc(block.title)}</h3></div><b>${p.pct}%</b></header><div class="academic-nir-checks">${block.items.map((item,itemIndex)=>{const key=`iu5.${blockIndex}.${itemIndex}`;const checked=!!state.researchChecks?.[key];return `<label><input type="checkbox" ${checked?'checked':''} onchange="toggleResearchCheck('${key}',this.checked)"><span>${esc(item)}</span></label>`;}).join('')}</div></article>`;}).join('')}</section>
      <section class="panel academic-research-rule"><span class="pill">Master-ready research</span><h3>Mỗi kết quả phải có thể kiểm chứng</h3><div><span>Question</span><span>Data/System</span><span>Baseline</span><span>Method</span><span>Metric</span><span>Error analysis</span><span>Reproducibility</span><span>Russian defense</span></div><button class="btn" onclick="BaumanOfflineLibraryUI?.open?.()">📦 Mở thư viện tài liệu offline</button></section>
    </div>`;
  };

  function patchPageLabels(){
    const subtitle=document.getElementById('pageSubtitle');
    if(subtitle&&state.page==='home')subtitle.textContent='Bauman · ИУ-5 · 09.04.01/11 · prerequisite → học phần → НИР → ВКР.';
  }

  syncSubjectMetadata();
  if(!app.__academicV3OriginalRenderAll)app.__academicV3OriginalRenderAll=app.renderAll;
  app.renderAll=function(){syncSubjectMetadata();app.home();app.roadmap();app.subjects();app.schedule();app.research();app.admin();patchPageLabels();};

  global.BaumanAcademicRuntimeV3={
    version:VERSION,
    syncSubjectMetadata,
    nirPlan,
    bestTask,
    selfCheck(){
      const runtime=global.BAUMAN_ACADEMIC_RUNTIME_V3;
      const ids=Object.keys(state.subjects||{});
      const expected=(DATA.subjects||[]).map(s=>s.id);
      return {ok:runtime?.displayCode==='09.04.01/11'&&runtime?.department==='ИУ-5'&&expected.every(id=>ids.includes(id))&&typeof app.research==='function',version:VERSION,courseCount:DATA.courses?.length||0,subjectCount:expected.length};
    }
  };
})(window);
