/* Bauman Master Hub · Comprehensive Roadmap Reference V1
   Presentation layer for #page-roadmap based on the approved roadmap reference.
   Uses only existing BAUMAN_DATA/state; does not replace canonical roadmap semantics. */
(()=>{
  'use strict';
  const RELEASE='HUB_ROADMAP_COMPREHENSIVE_V1_2026_09';
  const STORAGE_FILTER='bauman.roadmap.v1.filter';
  const STORAGE_OPEN='bauman.roadmap.v1.open';
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const D=()=>window.BAUMAN_DATA||{stages:[],semesters:[],subjects:[],courses:[]};
  const S=()=>window.state||{subjects:{},progress:{},schedule:{entries:{}},reviewQueue:[]};
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clamp=v=>Math.max(0,Math.min(100,Math.round(Number(v)||0)));
  const avg=xs=>xs.length?Math.round(xs.reduce((a,b)=>a+b,0)/xs.length):0;

  const PHASES=[
    {id:'foundation',n:1,title:'Giai đoạn 1: Nền tảng',short:'Nền tảng',subtitle:'Xây dựng nền tảng vững chắc',source:['prepare'],tone:'green'},
    {id:'preparatory',n:2,title:'Giai đoạn 2: Dự bị',short:'Dự bị',subtitle:'Tiếng Nga và khoa học nền tại Nga',source:['preparatory'],tone:'blue'},
    {id:'deep',n:3,title:'Giai đoạn 3: Chuyên sâu',short:'Chuyên sâu',subtitle:'Chính khóa Bauman · HK1–HK2',source:['m1','m2','bauman'],tone:'violet'},
    {id:'application',n:4,title:'Giai đoạn 4: Ứng dụng & ВКР',short:'Ứng dụng',subtitle:'НИР sâu · thực nghiệm · ВКР',source:['m3','m4'],tone:'red'}
  ];
  const FILTERS=[
    {id:'all',label:'Tất cả',icon:'▦',subjects:null},
    {id:'russian',label:'Tiếng Nga',icon:'Я',subjects:['russian']},
    {id:'math',label:'Toán',icon:'∑',subjects:['math']},
    {id:'foundation',label:'Dự bị',icon:'▤',subjects:['foundation']},
    {id:'technical',label:'Chuyên ngành',icon:'✦',subjects:['programming','ai','systems','signal','research']}
  ];
  const SUBJECT_ICON={russian:'Я',math:'∑',foundation:'▤',programming:'</>',ai:'◎',systems:'⚙',signal:'≈',research:'✦'};
  const SUBJECT_TONE={russian:'blue',math:'green',foundation:'amber',programming:'cyan',ai:'violet',systems:'indigo',signal:'teal',research:'violet'};

  function readOpen(){try{const x=JSON.parse(localStorage.getItem(STORAGE_OPEN)||'["foundation","preparatory"]');return new Set(Array.isArray(x)?x:['foundation','preparatory'])}catch{return new Set(['foundation','preparatory'])}}
  function saveOpen(set){localStorage.setItem(STORAGE_OPEN,JSON.stringify([...set]))}
  function activeFilter(){const id=localStorage.getItem(STORAGE_FILTER)||'russian';return FILTERS.some(x=>x.id===id)?id:'russian'}
  function setFilter(id){localStorage.setItem(STORAGE_FILTER,id);render()}

  function subjectObj(id){return S().subjects?.[id]||D().subjects.find(x=>x.id===id)||{id,name:id}}
  function subjectName(id){
    const concise={russian:'Tiếng Nga',math:'Toán',foundation:'Dự bị',programming:'Lập trình',ai:'AI/ML',systems:'АСОИУ',signal:'Dữ liệu',research:'НИР/ВКР'};
    return concise[id]||subjectObj(id).name||id;
  }
  function subjectIcon(id){return SUBJECT_ICON[id]||subjectObj(id).icon||'•'}
  function subjectProgress(id){return clamp(S().progress?.[id]||0)}

  function coursesForPhase(phase,filterId=activeFilter()){
    const f=FILTERS.find(x=>x.id===filterId)||FILTERS[0];
    return (D().courses||[]).filter(c=>phase.source.includes(c.stage)&&(f.subjects?f.subjects.includes(c.subject):true));
  }
  function subjectsForPhase(phase){
    return [...new Set((D().courses||[]).filter(c=>phase.source.includes(c.stage)).map(c=>c.subject))];
  }
  function phaseProgress(phase){
    const ids=subjectsForPhase(phase);
    return avg(ids.map(subjectProgress));
  }
  function overall(){
    const ids=Object.keys(S().subjects||{});
    return avg(ids.map(subjectProgress));
  }
  function phaseForState(){
    const id=S().roadmapStage||S().schedule?.autoStage||'prepare';
    return PHASES.find(p=>p.source.includes(id))||PHASES[0];
  }

  function phaseSubjectChips(phase){
    const ids=subjectsForPhase(phase);
    const preferred=['russian','math','foundation','programming','ai','systems','research'];
    return preferred.filter(x=>ids.includes(x)).slice(0,4).map(id=>'<span class="hub-rm-stage-subject '+(SUBJECT_TONE[id]||'blue')+'"><i>'+esc(subjectIcon(id))+'</i>'+esc(subjectName(id))+'</span>').join('');
  }

  function stageCards(){
    return PHASES.map((p,i)=>{
      const pct=phaseProgress(p),current=phaseForState().id===p.id;
      return '<article class="hub-rm-stage-card '+p.tone+' '+(current?'current':'')+'" data-rm-stage="'+p.id+'">'+
        '<div class="hub-rm-stage-top">'+
          '<span class="hub-rm-stage-num">'+p.n+'</span>'+
          '<div><h3>'+esc(p.title)+'</h3><p>'+esc(p.subtitle)+'</p></div>'+
          (current?'<span class="hub-rm-stage-check">✓</span>':'')+
        '</div>'+
        '<div class="hub-rm-stage-progress"><i><u style="width:'+pct+'%"></u></i><b>'+pct+'%</b></div>'+
        '<small>Môn học chính trong giai đoạn:</small>'+
        '<div class="hub-rm-stage-subjects">'+phaseSubjectChips(p)+'</div>'+
        (i<PHASES.length-1?'<span class="hub-rm-stage-arrow">›</span>':'')+
      '</article>';
    }).join('');
  }

  function filtersHTML(){
    const active=activeFilter();
    return FILTERS.map(f=>'<button class="'+(f.id===active?'active':'')+'" data-rm-filter="'+f.id+'"><i>'+esc(f.icon)+'</i>'+esc(f.label)+'</button>').join('');
  }

  function courseTile(c,phase,index){
    const activeSubject=S().lastStudy?.subjectId===c.subject;
    const activeStage=phaseForState().id===phase.id;
    const current=activeSubject&&activeStage&&index===0;
    const tone=SUBJECT_TONE[c.subject]||'blue';
    const meta=c.hours||c.assessment||c.type||'Theo lộ trình';
    return '<button class="hub-rm-course '+tone+' '+(current?'current':'')+'" data-rm-course="'+esc(c.id)+'" data-rm-subject="'+esc(c.subject)+'">'+
      '<span class="hub-rm-course-icon">'+(current?'▶':esc(subjectIcon(c.subject)))+'</span>'+
      '<span><b>'+esc(c.name||c.vi||'Học phần')+'</b><small>'+esc(meta)+'</small></span>'+
      '<em>'+esc(subjectName(c.subject))+'</em>'+
    '</button>';
  }

  function phaseRows(){
    const open=readOpen(),filterId=activeFilter();
    return PHASES.map(p=>{
      const rows=coursesForPhase(p,filterId),pct=rows.length?avg([...new Set(rows.map(c=>c.subject))].map(subjectProgress)):phaseProgress(p);
      const isOpen=open.has(p.id),shown=isOpen?rows.slice(0,p.id==='foundation'?8:6):[];
      return '<section class="hub-rm-level '+p.tone+' '+(isOpen?'open':'')+'" data-rm-level="'+p.id+'">'+
        '<button class="hub-rm-level-head" data-rm-toggle="'+p.id+'">'+
          '<span class="hub-rm-level-num">'+p.n+'</span>'+
          '<span class="hub-rm-level-copy"><b>'+esc(p.short)+'</b><small>'+esc(p.subtitle)+'</small></span>'+
          '<span class="hub-rm-level-progress"><i><u style="width:'+pct+'%"></u></i><b>'+pct+'%</b></span>'+
          '<span class="hub-rm-level-count">'+rows.length+' học phần</span>'+
          '<span class="hub-rm-level-chevron">'+(isOpen?'⌃':'⌄')+'</span>'+
        '</button>'+
        (isOpen?'<div class="hub-rm-course-grid">'+(shown.map((c,i)=>courseTile(c,p,i)).join('')||'<div class="hub-rm-empty">Chưa có học phần phù hợp với bộ lọc ở giai đoạn này.</div>')+(rows.length>shown.length?'<button class="hub-rm-more" data-rm-more="'+p.id+'">+ '+(rows.length-shown.length)+' học phần khác trong dữ liệu gốc</button>':'')+'</div>':'')+
      '</section>';
    }).join('');
  }

  function selectedTitle(){
    const f=FILTERS.find(x=>x.id===activeFilter())||FILTERS[0];
    if(f.id==='all')return ['Lộ trình tổng hợp','Theo dõi các môn xuyên suốt toàn bộ hành trình Bauman'];
    return ['Lộ trình '+f.label,'Nội dung thật từ lộ trình hiện có · không tạo thêm môn/học phần giả'];
  }

  function upcoming(){
    const entries=Object.entries(S().schedule?.entries||{}).map(([key,v])=>{const [date,slot]=key.split('|');return{date,slot,...v}}).filter(x=>x.date).sort((a,b)=>(a.date+a.slot).localeCompare(b.date+b.slot));
    const today=new Date().toISOString().slice(0,10);
    const future=entries.filter(x=>x.date>=today).slice(0,3);
    const reviews=(S().reviewQueue||[]).slice(0,3-future.length).map(x=>({date:'Ôn tập',subjectId:x.subjectId,label:x.label||x.title||x.reason||'Mục cần ôn'}));
    const items=[...future,...reviews];
    if(!items.length){
      const phase=phaseForState(),fallback=coursesForPhase(phase,'all').slice(0,3);
      return fallback.map(c=>'<div class="hub-rm-task suggested"><i>'+esc(subjectIcon(c.subject))+'</i><span><b>'+esc(subjectName(c.subject))+': '+esc(c.name||c.vi)+'</b><small>Gợi ý từ giai đoạn hiện tại</small></span><em>›</em></div>').join('');
    }
    return items.map(x=>'<div class="hub-rm-task"><i>'+esc(subjectIcon(x.subjectId||'research'))+'</i><span><b>'+esc(x.learningItem||x.label||x.subjectId||'Nhiệm vụ học')+'</b><small>'+esc(x.date||'')+(x.slot?' · '+esc(x.slot):'')+'</small></span><em>›</em></div>').join('');
  }

  function rightRail(){
    const pct=overall(),current=phaseForState(),cp=phaseProgress(current),courseCount=coursesForPhase(current,'all').length;
    return '<aside class="hub-rm-rail">'+
      '<article class="hub-rm-side-card hub-rm-overall">'+
        '<div class="hub-rm-side-head"><h3>Tiến độ học tập tổng thể</h3><button data-rm-action="progress">Xem chi tiết →</button></div>'+
        '<div class="hub-rm-overall-body">'+
          '<div class="hub-rm-donut" style="--pct:'+pct+'"><b>'+pct+'%</b></div>'+
          '<div><span>Tiến độ trung bình</span><strong>'+Object.keys(S().subjects||{}).length+' môn đang quản lý</strong><div class="hub-rm-legend"><i class="done"></i>Đã học <i class="active"></i>Đang học <i class="todo"></i>Chưa học</div></div>'+
        '</div>'+
      '</article>'+
      '<article class="hub-rm-side-card">'+
        '<div class="hub-rm-side-head"><h3>Giai đoạn hiện tại</h3><button data-rm-action="current">Xem lộ trình →</button></div>'+
        '<div class="hub-rm-current">'+
          '<span class="hub-rm-current-icon '+current.tone+'">'+current.n+'</span>'+
          '<div><b>'+esc(current.title)+'</b><small>'+esc(current.subtitle)+'</small><div class="hub-rm-mini-progress"><i><u style="width:'+cp+'%"></u></i><b>'+cp+'%</b><em>'+courseCount+' học phần</em></div></div>'+
        '</div>'+
      '</article>'+
      '<article class="hub-rm-side-card">'+
        '<div class="hub-rm-side-head"><h3>Nhiệm vụ sắp tới</h3><button data-rm-action="schedule">Xem tất cả →</button></div>'+
        '<div class="hub-rm-task-list">'+upcoming()+'</div>'+
      '</article>'+
      '<article class="hub-rm-side-card hub-rm-plan">'+
        '<div class="hub-rm-plan-icon">✦</div>'+
        '<div><h3>Gợi ý kế hoạch tự động</h3><p>Dựa trên giai đoạn, tiến độ môn và lịch hiện có để mở trang lập kế hoạch.</p></div>'+
        '<button data-rm-action="schedule">Tạo kế hoạch ngay　→</button>'+
      '</article>'+
    '</aside>';
  }

  function render(){
    const host=q('#page-roadmap');
    if(!host)return false;
    qa('.canva-roadmap-page,[data-academic2026="roadmap"]',host).forEach(el=>{el.dataset.rmCanonical='preserved';el.setAttribute('aria-hidden','true')});
    q('.hub-roadmap-v1',host)?.remove();
    const [title,subtitle]=selectedTitle();
    const active=FILTERS.find(x=>x.id===activeFilter())||FILTERS[0];
    host.insertAdjacentHTML('afterbegin','<section class="hub-roadmap-v1" data-roadmap-reference="'+RELEASE+'">'+
      '<header class="hub-rm-hero">'+
        '<div><h1>Lộ trình học tập tổng hợp</h1><p>Theo dõi tiến độ học tập theo từng giai đoạn và từng nhóm môn học</p></div>'+
        '<blockquote>“Маленькие шаги<br>приводят к большим целям.”<small>— Bauman Master Hub</small></blockquote>'+
      '</header>'+
      '<section class="hub-rm-stages">'+
        '<div class="hub-rm-block-head"><div><h2>Lộ trình theo giai đoạn</h2><p>4 nhóm hiển thị được ánh xạ trực tiếp từ GĐ1 · GĐ2 · HK1–2 · HK3–4 hiện có</p></div></div>'+
        '<div class="hub-rm-stage-grid">'+stageCards()+'</div>'+
      '</section>'+
      '<div class="hub-rm-content">'+
        '<main class="hub-rm-main">'+
          '<section class="hub-rm-subject-panel">'+
            '<div class="hub-rm-subject-head"><div><h2>Lộ trình theo môn học</h2><p>Chọn nhóm để xem lộ trình chi tiết</p></div><div class="hub-rm-filters">'+filtersHTML()+'</div></div>'+
            '<div class="hub-rm-track-title"><div class="hub-rm-track-icon">'+esc(active.icon)+'</div><div><h2>'+esc(title)+'</h2><p>'+esc(subtitle)+'</p></div><button data-rm-action="subjects">Xem tổng quan môn học ↗</button></div>'+
            '<div class="hub-rm-levels">'+phaseRows()+'</div>'+
          '</section>'+
        '</main>'+
        rightRail()+
      '</div>'+
    '</section>');
    document.body.dataset.hubRoadmapV1='1';
    return true;
  }

  function handle(e){
    const filter=e.target.closest('[data-rm-filter]');
    if(filter){e.preventDefault();setFilter(filter.dataset.rmFilter);return}
    const toggle=e.target.closest('[data-rm-toggle]');
    if(toggle){e.preventDefault();const set=readOpen(),id=toggle.dataset.rmToggle;set.has(id)?set.delete(id):set.add(id);saveOpen(set);render();return}
    const course=e.target.closest('[data-rm-course]');
    if(course){e.preventDefault();const sid=course.dataset.rmSubject;if(sid){S().subject=sid;S().searchFocusCourseId=course.dataset.rmCourse||'';window.save?.();window.app?.page?.('subjects');window.app?.subjects?.()}return}
    const more=e.target.closest('[data-rm-more]');
    if(more){e.preventDefault();localStorage.setItem(STORAGE_FILTER,'all');const set=readOpen();set.add(more.dataset.rmMore);saveOpen(set);render();return}
    const action=e.target.closest('[data-rm-action]')?.dataset.rmAction;
    if(action==='subjects'){e.preventDefault();window.app?.page?.('subjects');return}
    if(action==='schedule'){e.preventDefault();window.app?.page?.('schedule');return}
    if(action==='progress'){e.preventDefault();window.app?.openHomeFrame?.('progress');return}
    if(action==='current'){e.preventDefault();const phase=phaseForState();const target=phase.source[0];if(window.selectRoadmapStage)window.selectRoadmapStage(target);return}
  }

  function patch(){
    if(!window.app||window.app.__roadmapReferenceV1)return false;
    const old=window.app.roadmap.bind(window.app);
    window.app.roadmap=function(){old();render()};
    window.app.__roadmapReferenceV1=true;
    render();
    return true;
  }

  function selfCheck(){
    const root=q('.hub-roadmap-v1');
    return{
      release:RELEASE,
      active:!!root,
      stageCards:qa('.hub-rm-stage-card',root).length,
      filters:qa('[data-rm-filter]',root).length,
      levels:qa('.hub-rm-level',root).length,
      sideCards:qa('.hub-rm-side-card',root).length,
      canonicalHidden:qa('#page-roadmap .canva-roadmap-page,#page-roadmap [data-academic2026="roadmap"]').every(el=>getComputedStyle(el).display==='none')
    };
  }

  document.addEventListener('click',handle,true);
  let attempts=0;
  const boot=()=>{attempts++;if(!patch()&&attempts<30)setTimeout(boot,120)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.BAUMAN_HUB_ROADMAP_V1={release:RELEASE,render,selfCheck,setFilter};
})();
