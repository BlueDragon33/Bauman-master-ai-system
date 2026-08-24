(function(global){
  'use strict';

  const MANIFEST_PATH='assets/data/roadmap/iu5-090401-11-v3.json';
  const RELEASE='BAUMAN_IU5_ROADMAP_V3_BRIDGE_2026_08_24';
  let manifest=null;
  let loadError=null;
  let loadPromise=null;

  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const phaseLabels={
    'russian-foundation':'Tiếng Nga nền tảng',
    'pre-master-core':'Pre-Master Core',
    'ai-asoiu-research-bridge':'AI · ASOIU · Research',
    'master-mode':'Bauman Master Mode',
    'nir-vkr':'НИР → ВКР'
  };
  const moduleLabels={
    'linear-algebra':'Đại số tuyến tính','probability-statistics':'Xác suất & thống kê','multivariate-data':'Dữ liệu đa chiều','pca-svd':'PCA / SVD','optimization-essentials':'Tối ưu hóa thiết yếu','numerical-essentials':'Tính toán số',
    'python-core':'Python','oop':'OOP','solid-patterns':'SOLID & patterns','numpy-pandas':'NumPy / Pandas','testing':'Testing','git':'Git','api-data-pipeline':'API & data pipeline',
    'complexity':'Độ phức tạp','linear-structures':'Cấu trúc tuyến tính','hashing':'Hashing','trees-graphs':'Tree / Graph','search-sort':'Search / Sort','graph-traversal':'Graph traversal',
    'sql':'SQL','relational-model':'Relational model','schema-normalization':'Schema & normalization','transactions':'Transactions','indexing-query-plan':'Index & query plan','db-optimization':'DB optimization','post-relational':'Post-relational DB','ml-data-architecture':'ML data architecture',
    'requirements':'Requirements','uml':'UML','architecture':'Architecture','oop-system-design':'OOP system design','testing-strategy':'Testing strategy','versioning-ci':'Versioning / CI','lifecycle':'Lifecycle','project-management':'Project management',
    'supervised':'Supervised learning','unsupervised':'Unsupervised learning','metrics-cv':'Metrics & cross-validation','feature-engineering':'Feature engineering','regularization':'Regularization','ensembles':'Ensembles','clustering':'Clustering','neural-fundamentals':'Neural fundamentals','reproducible-experiments':'Reproducible experiments',
    'analytical-system-models':'Analytical models ASOIU','stochastic-bridge':'Stochastic bridge','reliability':'Reliability','markov-on-demand':'Markov khi cần','time-series':'Time Series','forecasting':'Forecasting','anomaly-detection':'Anomaly detection','lifecycle-ergonomics':'Lifecycle & ergonomics',
    'research-question':'Research question','literature':'Literature review','baseline':'Baseline','experimental-protocol':'Experimental protocol','statistics-for-experiments':'Statistics for experiments','reproducibility':'Reproducibility','scientific-writing':'Scientific writing','presentation-defense':'Presentation & defense',
    'semester-1':'Semester 1','semester-2':'Semester 2','semester-3':'Semester 3','semester-4':'Semester 4','nir-1':'НИР 1','nir-2':'НИР 2','nir-3':'НИР 3','nir-4':'НИР 4','vkr':'ВКР',
    'A0-A2':'A0 → A2','classroom-russian':'Tiếng Nga lớp học','technical-russian':'Tiếng Nga kỹ thuật','academic-russian':'Tiếng Nga học thuật','russian-twin-lesson':'Russian Twin Lesson'
  };

  function moduleLabel(id){return moduleLabels[id]||String(id||'').replace(/-/g,' ');}
  function phaseById(id){return manifest?.phases?.find(item=>item.id===id)||manifest?.phases?.[0]||null;}
  function selectedPhaseId(){
    const saved=global.state?.academicRoadmapPhase;
    return manifest?.phases?.some(item=>item.id===saved)?saved:(manifest?.phases?.[0]?.id||'russian-foundation');
  }
  function savePhase(id){
    if(!global.state)return;
    global.state.academicRoadmapPhase=id;
    try{global.save?.();}catch(_){ }
  }

  async function loadManifest(){
    if(manifest)return manifest;
    if(loadPromise)return loadPromise;
    loadPromise=(async()=>{
      try{
        const offline=global.BaumanOfflineContentLibrary;
        if(offline?.resolveJSON){
          const result=await offline.resolveJSON({packId:'bauman-roadmap-core',relativePath:'iu5-090401-11-v3.json',url:MANIFEST_PATH});
          manifest=result.data;
        }else{
          const response=await fetch(MANIFEST_PATH,{cache:'no-cache'});
          if(!response.ok)throw new Error('HTTP '+response.status);
          manifest=await response.json();
        }
        validateManifest(manifest);
        loadError=null;
        return manifest;
      }catch(error){
        loadError=error;
        throw error;
      }finally{loadPromise=null;}
    })();
    return loadPromise;
  }

  function validateManifest(data){
    if(!data||data.id!=='bauman-iu5-090401-11')throw new Error('Roadmap manifest id không hợp lệ');
    if(data.displayCode!=='09.04.01/11')throw new Error('Roadmap displayCode phải là 09.04.01/11');
    if(data.department!=='ИУ-5')throw new Error('Roadmap department phải là ИУ-5');
    if(!Array.isArray(data.phases)||data.phases.length!==5)throw new Error('Roadmap phải có 5 pha');
    if(!Array.isArray(data.semesters)||data.semesters.length!==4)throw new Error('Roadmap phải có 4 học kỳ Master');
    return true;
  }

  function renderLoading(){
    const root=document.getElementById('page-roadmap');
    if(!root)return;
    root.innerHTML='<section class="panel academic-roadmap-loading"><span class="pill purple">ИУ-5 · 09.04.01/11</span><h2>Đang mở lộ trình Bauman…</h2><p>Chỉ nạp manifest nhỏ. Học liệu lớn vẫn chờ đến khi bạn mở đúng môn/bài.</p></section>';
  }

  function phaseTrackCards(phase){
    const ids=phase?.tracks||[];
    return ids.map(trackId=>{
      const track=manifest.tracks?.[trackId];
      if(!track)return '';
      const modules=(track.modules||[]).map(id=>`<span class="academic-module-chip">${esc(moduleLabel(id))}</span>`).join('');
      const priority=track.priority==='critical'?'Trọng tâm':track.priority==='dynamic'?'Theo môn Bauman hiện tại':'Bổ trợ bắt buộc';
      return `<article class="panel academic-track-card"><header><div><span>${esc(priority)}</span><h3>${esc(track.title)}</h3></div><b>${(track.modules||[]).length}</b></header><div class="academic-module-cloud">${modules}</div></article>`;
    }).join('');
  }

  function semesterCards(){
    return manifest.semesters.map(sem=>{
      const subjects=(sem.subjects||[]).map(subject=>`<li>${esc(subject)}</li>`).join('');
      const prereq=(sem.prerequisiteOrder||[]).map(id=>`<span>${esc(moduleLabel(id))}</span>`).join('');
      return `<details class="panel academic-semester-card" ${sem.semester===1?'open':''}><summary><div><span>SEMESTER ${sem.semester}</span><h3>Học kỳ ${sem.semester} · ИУ-5</h3></div><b>${(sem.subjects||[]).length} nội dung</b></summary><div class="academic-semester-body"><section><h4>Môn / hoạt động</h4><ol>${subjects}</ol></section><section><h4>Học trước 2–4 tuần</h4><div class="academic-prereq-cloud">${prereq}</div></section></div></details>`;
    }).join('');
  }

  function render(){
    const root=document.getElementById('page-roadmap');
    if(!root)return;
    if(!manifest){renderLoading();loadManifest().then(()=>render()).catch(()=>renderError());return;}
    const phaseId=selectedPhaseId();
    const phase=phaseById(phaseId);
    const phaseButtons=manifest.phases.map((item,index)=>`<button class="academic-phase-button ${item.id===phaseId?'active':''}" data-academic-phase="${esc(item.id)}"><i>${String(index+1).padStart(2,'0')}</i><b>${esc(phaseLabels[item.id]||item.title)}</b><span>${esc(item.goal)}</span></button>`).join('');
    const priority=(manifest.priorityEngine||[]).map((item,index)=>`<li><i>${index+1}</i><span>${esc(moduleLabel(item))}</span></li>`).join('');
    const support=(manifest.supportOnDemand||[]).map(id=>`<span>${esc(moduleLabel(id))}</span>`).join('');

    root.innerHTML=`<div class="academic-roadmap-v3">
      <section class="academic-roadmap-hero panel">
        <div><span class="pill purple">BAUMAN · ИУ-5 · ${esc(manifest.displayCode)}</span><h2>${esc(manifest.program)}</h2><p>Roadmap dành riêng cho việc chuẩn bị, theo học, làm НИР và bảo vệ ВКР tại Bauman. Không tải dàn trải, không học kho chỉ vì kho đó tồn tại.</p></div>
        <aside><b>${esc(manifest.credits)} з.е.</b><span>${esc(manifest.durationYears)} năm · khóa ${esc(manifest.cohortYear)}</span><small>Master Mode học trước prerequisite 2–4 tuần</small></aside>
      </section>
      <section class="academic-roadmap-grid">
        <aside class="academic-phase-rail">${phaseButtons}</aside>
        <main class="academic-phase-main">
          <section class="panel academic-phase-focus"><span class="pill green">PHA ĐANG XEM</span><h2>${esc(phaseLabels[phase.id]||phase.title)}</h2><p>${esc(phase.goal)}</p><div class="academic-master-ready"><b>Master-ready</b><span>Understand</span><span>Solve</span><span>Build</span><span>Retain</span></div></section>
          <div class="academic-track-grid">${phaseTrackCards(phase)}</div>
        </main>
      </section>
      <section class="academic-master-section"><div class="section-head"><div><h2>Bauman Master Mode · Semester 1 → 4</h2><p>Đây là trục động. Khi biết môn đang học, hệ thống kéo prerequisite tương ứng lên trước 2–4 tuần.</p></div></div><div class="academic-semester-stack">${semesterCards()}</div></section>
      <section class="academic-roadmap-bottom">
        <article class="panel academic-priority-panel"><span class="pill">Priority Engine</span><h3>Hôm nay học gì?</h3><ol>${priority}</ol></article>
        <article class="panel academic-support-panel"><span class="pill">Support on demand</span><h3>Chỉ mở khi thật sự cần</h3><div>${support}</div></article>
      </section>
    </div>`;
  }

  function renderError(){
    const root=document.getElementById('page-roadmap');
    if(!root)return;
    root.innerHTML=`<section class="panel academic-roadmap-error"><span class="pill">Roadmap V3</span><h2>Không đọc được manifest lộ trình</h2><p>${esc(loadError?.message||'Lỗi không xác định')}</p><button class="btn primary" id="academicRoadmapRetry">Thử lại</button></section>`;
    document.getElementById('academicRoadmapRetry')?.addEventListener('click',()=>{manifest=null;loadError=null;render();});
  }

  function bind(){
    document.addEventListener('click',event=>{
      const button=event.target.closest('[data-academic-phase]');
      if(!button)return;
      savePhase(button.dataset.academicPhase);
      render();
    });
  }

  function install(){
    const app=global.app;
    if(!app)return false;
    if(!app.__legacyRoadmapV2)app.__legacyRoadmapV2=app.roadmap;
    app.roadmap=render;
    bind();
    loadManifest().then(()=>{
      if(global.state?.page==='roadmap'||document.getElementById('page-roadmap')?.classList.contains('active'))render();
    }).catch(()=>{if(global.state?.page==='roadmap')renderError();});
    return true;
  }

  global.BaumanAcademicRoadmapV3={
    release:RELEASE,
    manifestPath:MANIFEST_PATH,
    load:loadManifest,
    render,
    install,
    get manifest(){return manifest;},
    selfCheck(){
      let valid=false;
      try{if(manifest)valid=validateManifest(manifest);}catch(_){valid=false;}
      return {ok:!!global.app&&typeof global.app.roadmap==='function'&&(manifest?valid:true),release:RELEASE,loaded:!!manifest,displayCode:manifest?.displayCode||null,department:manifest?.department||null,error:loadError?.message||null};
    }
  };

  install();
})(window);
