/* Bauman Master Hub · Comprehensive Roadmap Reference V2
   Presentation layer for #page-roadmap based on the approved roadmap reference.
   Uses only existing BAUMAN_DATA/state; does not replace canonical roadmap semantics. */
(()=>{
  'use strict';
  const RELEASE='HUB_ROADMAP_REFERENCE_V4_2026_09';
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
    {id:'preparatory',n:2,title:'Giai đoạn 2: Củng cố',short:'Củng cố',subtitle:'Dự bị tiếng Nga và khoa học nền tại Nga',source:['preparatory'],tone:'blue'},
    {id:'deep',n:3,title:'Giai đoạn 3: Chuyên sâu',short:'Chuyên sâu',subtitle:'Chính khóa Bauman · HK1–HK2',source:['m1','m2','bauman'],tone:'violet'},
    {id:'application',n:4,title:'Giai đoạn 4: Ứng dụng',short:'Ứng dụng',subtitle:'НИР sâu · thực nghiệm · ВКР',source:['m3','m4'],tone:'red'}
  ];
  const FILTERS=[
    {id:'all',label:'Tất cả',icon:'▦',subjects:null},
    {id:'russian',label:'Tiếng Nga',icon:'Я',subjects:['russian']},
    {id:'math',label:'Toán',icon:'∑',subjects:['math']},
    {id:'foundation',label:'Hòa nhập Nga',icon:'▤',subjects:['foundation']},
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
    const concise={russian:'Tiếng Nga',math:'Toán',foundation:'Hòa nhập Nga',programming:'Lập trình',ai:'AI/ML',systems:'АСОИУ',signal:'Dữ liệu',research:'НИР/ВКР'};
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
    const ids=subjectsForPhase(phase),chips=[];
    if(ids.includes('russian'))chips.push({id:'russian',label:'Tiếng Nga',icon:'Я'});
    if(ids.includes('math'))chips.push({id:'math',label:'Toán',icon:'∑'});
    if(ids.includes('foundation'))chips.push({id:'foundation',label:'Hòa nhập Nga',icon:'▤'});
    if(ids.some(id=>['programming','ai','systems','signal','research'].includes(id)))chips.push({id:'research',label:'Chuyên ngành',icon:'✦'});
    return chips.slice(0,4).map(x=>'<span class="hub-rm-stage-subject '+(SUBJECT_TONE[x.id]||'blue')+'"><i>'+esc(x.icon)+'</i>'+esc(x.label)+'</span>').join('');
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
    if(f.id==='foundation')return ['Lộ trình Hòa nhập Nga','Dự bị, khoa học nền và kỹ năng học trong môi trường Nga'];
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
    const ids=Object.keys(S().subjects||{}),values=ids.map(subjectProgress),done=values.filter(v=>v>=100).length,active=values.filter(v=>v>0&&v<100).length,todo=values.filter(v=>v<=0).length;
    return '<aside class="hub-rm-rail">'+
      '<article class="hub-rm-side-card hub-rm-overall">'+
        '<div class="hub-rm-side-head"><h3>Tiến độ học tập tổng thể</h3><button data-rm-action="progress">Xem chi tiết →</button></div>'+
        '<div class="hub-rm-overall-body">'+
          '<div class="hub-rm-donut" style="--pct:'+pct+'"><b>'+pct+'%</b></div>'+
          '<div><span>Đã hoàn thành</span><strong>'+done+'/'+ids.length+' môn</strong><div class="hub-rm-legend"><i class="done"></i>Hoàn thành '+done+' <i class="active"></i>Đang học '+active+' <i class="todo"></i>Chưa học '+todo+'</div></div>'+
        '</div>'+
      '</article>'+
      '<article class="hub-rm-side-card">'+
        '<div class="hub-rm-side-head"><h3>Giai đoạn hiện tại</h3><button data-rm-action="current">Xem lộ trình →</button></div>'+
        '<div class="hub-rm-current">'+
          '<span class="hub-rm-current-icon '+current.tone+'">'+current.n+'</span>'+
          '<div><b>'+esc(current.title)+'</b><small>'+esc(current.subtitle)+'</small><span class="hub-rm-doing">Đang thực hiện</span><div class="hub-rm-mini-progress"><i><u style="width:'+cp+'%"></u></i><b>'+cp+'%</b><em>'+courseCount+' học phần</em></div></div>'+
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

  function ensureReferenceChrome(){
    const top=q('.topbar');
    if(top&&!q('#hubRoadmapTopNav',top)){
      const nav=document.createElement('nav');
      nav.id='hubRoadmapTopNav';
      nav.className='hub-rm-topnav';
      nav.innerHTML=[
        ['home','⌂','Tổng quan'],
        ['study','▣','Học bài'],
        ['roadmap','⌘','Lộ trình'],
        ['schedule','▣','Lịch học'],
        ['exercise','✓','Bài tập'],
        ['exam','◉','Kiểm tra'],
        ['subjects','▤','Tài liệu']
      ].map(x=>'<button type="button" data-rm-top="'+x[0]+'" class="'+(x[0]==='roadmap'?'active':'')+'"><i>'+x[1]+'</i><span>'+x[2]+'</span></button>').join('');
      top.insertBefore(nav,q('.top-actions',top));
    }
    const side=q('.sidebar');
    if(side&&!q('#hubRoadmapJourney',side)){
      const card=document.createElement('section');
      card.id='hubRoadmapJourney';
      card.className='hub-rm-journey-card';
      const current=subjectObj(S().subject||S().lastStudy?.subjectId||'russian');
      card.innerHTML='<button type="button" data-rm-journey-close title="Ẩn thẻ">×</button><b>Hành trình của bạn</b><span>'+esc(subjectName(current.id))+' · Mở tương lai</span><small>Tiến độ và lộ trình hiện tại được đồng bộ từ dữ liệu Hub.</small>';
      side.insertBefore(card,q('#nav',side));
    }
    return true;
  }

  function setRoadmapChrome(active){
    document.body.dataset.hubRoadmapV3=active?'1':'0';
    document.body.dataset.hubRoadmapV4=active?'1':'0';
    q('#hubRoadmapTopNav')?.classList.toggle('hidden',!active);
    q('#hubRoadmapJourney')?.classList.toggle('hidden',!active);
    const nav=q('#nav');
    if(nav){
      const visiblePages=new Set(['home','roadmap','schedule','subjects']);
      const visibleActions=new Set(['study','exercise','exam','review','achievement','settings']);
      qa(':scope > button',nav).forEach(btn=>{
        const page=btn.dataset.page||'',action=btn.dataset.safeNav||'';
        const show=page?visiblePages.has(page):(action?visibleActions.has(action):true);
        btn.classList.toggle('hub-rm-v4-hidden',active&&!show);
        if(active&&page==='subjects'){btn.classList.remove('hub-nav-reference-hidden');const span=q('span',btn);if(span)span.textContent='Tài liệu';btn.title='Tài liệu'}
        if(active&&page==='schedule')btn.classList.remove('hub-nav-reference-hidden');
        if(active&&action==='study'){const span=q('span',btn);if(span)span.textContent='Học bài';btn.title='Học bài'}
        if(active&&action==='review'){const span=q('span',btn);if(span)span.textContent='Ôn tập';btn.title='Ôn tập'}
        if(active&&action==='achievement'){const span=q('span',btn);if(span)span.textContent='Thành tích';btn.title='Thành tích'}
      });
      const order=[
        q(':scope > button[data-page="home"]',nav),
        q(':scope > button[data-safe-nav="study"]',nav),
        q(':scope > button[data-page="roadmap"]',nav),
        q(':scope > button[data-page="schedule"]',nav),
        q(':scope > button[data-safe-nav="exercise"]',nav),
        q(':scope > button[data-safe-nav="exam"]',nav),
        q(':scope > button[data-page="subjects"]',nav),
        q(':scope > button[data-safe-nav="review"]',nav),
        q(':scope > button[data-safe-nav="achievement"]',nav),
        q(':scope > button[data-safe-nav="settings"]',nav)
      ].filter(Boolean);
      if(active)order.forEach(btn=>nav.appendChild(btn));
      if(!active)window.BAUMAN_HUB_LEARNING_CLUSTER?.apply?.();
    }
  }

  function render(){
    const host=q('#page-roadmap');
    if(!host)return false;
    qa('.canva-roadmap-page,[data-academic2026="roadmap"]',host).forEach(el=>{el.dataset.rmCanonical='preserved';el.setAttribute('aria-hidden','true')});
    q('.hub-roadmap-v3',host)?.remove();
    const [title,subtitle]=selectedTitle();
    const active=FILTERS.find(x=>x.id===activeFilter())||FILTERS[0];
    host.insertAdjacentHTML('afterbegin','<section class="hub-roadmap-v3" data-roadmap-reference="'+RELEASE+'">'+
      '<header class="hub-rm-hero">'+
        '<div><h1>Lộ trình học tập tổng hợp</h1><p>Theo dõi tiến độ học tập theo từng giai đoạn và từng môn học</p></div>'+
        '<blockquote>“Маленькие шаги<br>приводят к большим целям.”<small>— Bauman Hub</small></blockquote>'+
      '</header>'+
      '<section class="hub-rm-stages">'+
        '<div class="hub-rm-block-head"><div><h2>Lộ trình theo giai đoạn</h2><p>4 giai đoạn đồng hành cùng mục tiêu của bạn</p></div></div>'+
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
    ensureReferenceChrome();setRoadmapChrome(host.classList.contains('active'));
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
    if(!window.app||window.app.__roadmapReferenceV3)return false;
    const oldPage=window.app.page.bind(window.app);
    window.app.page=function(id,persist=true){const out=oldPage(id,persist);setRoadmapChrome(id==='roadmap');return out};
    const old=window.app.roadmap.bind(window.app);
    window.app.roadmap=function(){old();render()};
    window.app.__roadmapReferenceV3=true;
    render();
    return true;
  }

  function selfCheck(){
    const root=q('.hub-roadmap-v3');
    return{
      release:RELEASE,
      active:!!root,
      stageCards:qa('.hub-rm-stage-card',root).length,
      filters:qa('[data-rm-filter]',root).length,
      levels:qa('.hub-rm-level',root).length,
      sideCards:qa('.hub-rm-side-card',root).length,
      canonicalHidden:qa('#page-roadmap .canva-roadmap-page,#page-roadmap [data-academic2026="roadmap"]').every(el=>getComputedStyle(el).display==='none'),
      topNav:qa('#hubRoadmapTopNav [data-rm-top]').length,
      journey:!!q('#hubRoadmapJourney'),
      chromeActive:document.body.dataset.hubRoadmapV3==='1'
    };
  }

  document.addEventListener('click',e=>{
    const top=e.target.closest('[data-rm-top]')?.dataset.rmTop;
    if(top){
      e.preventDefault();
      if(top==='study')window.app?.continueStudy?.();
      else if(top==='exercise')q('[data-safe-nav="exercise"]')?.click();
      else if(top==='exam')q('[data-safe-nav="exam"]')?.click();
      else window.app?.page?.(top);
      return;
    }
    if(e.target.closest('[data-rm-journey-close]')){e.preventDefault();q('#hubRoadmapJourney')?.classList.add('hidden');return}
    handle(e);
  },true);
  let attempts=0;
  const boot=()=>{attempts++;if(!patch()&&attempts<30)setTimeout(boot,120)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.BAUMAN_HUB_ROADMAP_V4={release:RELEASE,render,selfCheck,setFilter};
  window.BAUMAN_HUB_ROADMAP_V3=window.BAUMAN_HUB_ROADMAP_V4;
  window.BAUMAN_HUB_ROADMAP_V2=window.BAUMAN_HUB_ROADMAP_V4;
})();
