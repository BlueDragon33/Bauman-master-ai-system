/* Bauman Master Hub · Stable unified primary pages V6
   Final synchronous presentation pass. It does not own academic data or route semantics. */
(()=>{
  'use strict';
  const RELEASE='HUB_PRIMARY_PAGES_V6_2026_09';
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const S=()=>typeof state!=='undefined'&&state?state:{};
  const A=()=>typeof app!=='undefined'&&app?app:null;
  const escText=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const pct=v=>Math.max(0,Math.min(100,Math.round(Number(v)||0)));

  function hero({eyebrow,title,description,kpis=[]}){
    return `<section class="hub-v6-hero" data-hub-v6-hero="1"><div><span class="hub-v6-eyebrow">${escText(eyebrow)}</span><h2>${escText(title)}</h2><p>${escText(description)}</p></div><div class="hub-v6-kpis">${kpis.map(x=>`<span class="hub-v6-kpi"><b>${escText(x.value)}</b><small>${escText(x.label)}</small></span>`).join('')}</div></section>`;
  }

  function prependHero(container,markup){
    if(!container)return false;
    container.classList.add('hub-v6-page');
    q(':scope > [data-hub-v6-hero="1"]',container)?.remove();
    container.insertAdjacentHTML('afterbegin',markup);
    return true;
  }

  function decorateSubjects(){
    const host=q('#page-subjects .canva-subjects-page');
    if(!host)return false;
    const s=S();
    const current=s.subjects?.[s.subject]||Object.values(s.subjects||{})[0]||{};
    const stage=s.subjectStage||'prepare';
    const subjectCards=qa('.subject-card',host);
    const courseCards=qa('.subject-course-list .course',host);
    const progress=pct(s.progress?.[current.id]);
    prependHero(host,hero({
      eyebrow:'Learning workspace',
      title:'Môn học & năng lực',
      description:'Chọn đúng môn theo giai đoạn, nhìn nhiệm vụ gần nhất và vào thẳng không gian học tập mà không qua thêm lớp điều hướng.',
      kpis:[
        {value:subjectCards.length,label:'môn ở giai đoạn'},
        {value:courseCards.length,label:'khối nội dung đang thấy'},
        {value:`${progress}%`,label:'tiến độ môn chọn'},
        {value:String(stage).toUpperCase(),label:'giai đoạn'}
      ]
    }));
    document.body.dataset.hubPrimaryPage='subjects';
    return true;
  }

  function decorateSchedule(){
    const host=q('#page-schedule .schedule-page');
    if(!host)return false;
    const s=S(),sc=s.schedule||{};
    const result=A()?.scheduleProgress?.()||{filled:0,total:0,pct:0};
    const main=sc.view!=='review';
    prependHero(host,hero({
      eyebrow:'Study planner',
      title:'Lịch học thông minh',
      description:'Một lịch duy nhất cho học chính, ôn tập và điều chỉnh thủ công. Toàn bộ thay đổi vẫn dùng scheduler và dữ liệu canonical hiện có.',
      kpis:[
        {value:`${result.pct||0}%`,label:'độ phủ lịch'},
        {value:`${result.filled||0}/${result.total||0}`,label:'ca đã xếp'},
        {value:main?'Học chính':'Ôn tập',label:'chế độ'},
        {value:String(sc.autoStage||'prepare').toUpperCase(),label:'giai đoạn auto'}
      ]
    }));
    document.body.dataset.hubPrimaryPage='schedule';
    return true;
  }

  function decorateResearch(){
    const host=q('#page-research .canva-research-page');
    if(!host)return false;
    const checks=qa('input[type="checkbox"]',host);
    const done=checks.filter(x=>x.checked).length;
    const progress=checks.length?Math.round(done*100/checks.length):0;
    const files=qa('.file-pill',host).length;
    const topic=S().researchTopic||'ugv';
    prependHero(host,hero({
      eyebrow:'НИР · ВКР workspace',
      title:'Nghiên cứu & luận văn',
      description:'Theo dõi câu hỏi nghiên cứu, dữ liệu, phần cứng, rủi ro và mốc НИР → ВКР trong cùng một không gian làm việc.',
      kpis:[
        {value:`${done}/${checks.length}`,label:'việc hoàn thành'},
        {value:`${progress}%`,label:'tiến độ checklist'},
        {value:files,label:'tệp đính kèm'},
        {value:String(topic).toUpperCase(),label:'hướng nghiên cứu'}
      ]
    }));
    document.body.dataset.hubPrimaryPage='research';
    return true;
  }

  function finalize(pageId){
    window.BAUMAN_HUB_LEARNING_CLUSTER?.apply?.();
    if(pageId==='home'){
      window.BAUMAN_HUB_SAFE?.refresh?.();
      window.BAUMAN_HUB_OVERVIEW_SEARCH_V2?.install?.();
      window.BAUMAN_HUB_REFERENCE_V5?.apply?.();
      document.body.dataset.hubPrimaryPage='home';
    }else if(pageId==='roadmap'){
      window.BAUMAN_HUB_ROADMAP_V4?.render?.();
      window.BAUMAN_HUB_REFERENCE_V5?.apply?.();
      document.body.dataset.hubPrimaryPage='roadmap';
    }else if(pageId==='subjects')decorateSubjects();
    else if(pageId==='schedule')decorateSchedule();
    else if(pageId==='research')decorateResearch();
    return true;
  }

  function patch(){
    const a=A();if(!a||a.__primaryPagesV6)return false;
    const originals={
      subjects:a.subjects.bind(a),
      schedule:a.schedule.bind(a),
      research:a.research.bind(a),
      page:a.page.bind(a)
    };

    a.subjects=function(){const out=originals.subjects();decorateSubjects();return out};
    a.schedule=function(){const out=originals.schedule();decorateSchedule();return out};
    a.research=function(){const out=originals.research();decorateResearch();return out};

    a.page=function(id,persist=true){
      document.body.classList.add('hub-ui-routing');
      try{
        const out=originals.page(id,persist);
        finalize(id);
        return out;
      }finally{
        document.body.classList.remove('hub-ui-routing');
      }
    };

    a.__primaryPagesV6=true;
    document.body.dataset.hubPrimaryPages='v6';
    document.documentElement.dataset.hubPrimaryPages=RELEASE;

    const current=S().page||'home';
    a.page(current,false);
    document.body.classList.remove('hub-ui-booting');
    return true;
  }

  function selfCheck(){
    const primary=qa('#nav > button[data-page]').filter(x=>getComputedStyle(x).display!=='none').map(x=>x.dataset.page);
    const secondary=qa('#nav > button[data-safe-nav]').filter(x=>getComputedStyle(x).display!=='none').map(x=>x.dataset.safeNav);
    return{
      release:RELEASE,
      patched:Boolean(A()?.__primaryPagesV6),
      primary,
      secondary,
      subjects:Boolean(q('#page-subjects .hub-v6-hero')),
      schedule:Boolean(q('#page-schedule .hub-v6-hero')),
      research:Boolean(q('#page-research .hub-v6-hero')),
      booting:document.body.classList.contains('hub-ui-booting')
    };
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patch,{once:true});else patch();
  window.BAUMAN_HUB_PRIMARY_PAGES_V6={release:RELEASE,patch,finalize,selfCheck};
})();
