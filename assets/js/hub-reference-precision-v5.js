/* Bauman Master Hub · Precision Reference Layout V5
   Presentation orchestrator only. Does not own routes or academic data. */
(()=>{
  'use strict';
  const RELEASE='HUB_REFERENCE_PRECISION_V5_2026_09';
  const q=(s,r=document)=>r.querySelector(s);

  function syncProfile(){
    const source=q('#currentUserName');
    const target=q('#hubTopProfileName');
    if(target){
      const name=(source?.textContent||'').trim();
      target.textContent=name&&name!=='Người học'?name:'Learner';
    }
  }

  function syncTopbar(){
    const search=q('#hubSafeSearch');
    if(search)search.placeholder='Tìm kiếm bài học, công thức, bài tập, mô phỏng...';
    const motto=q('#hubSafeTopMeta .hub-safe-motto b');
    if(motto)motto.innerHTML='Learn deeper<br>Build further';
    syncProfile();
  }

  function suppressSecondaryHome(){
    const host=q('#page-home');
    if(!host)return;
    host.querySelectorAll('[data-academic2026="home"]').forEach(el=>{
      el.dataset.hubV5Secondary='1';
      el.setAttribute('aria-hidden','true');
    });
  }

  function apply(){
    document.body.dataset.hubReferenceV5='1';
    document.documentElement.dataset.hubReferencePrecision=RELEASE;
    syncTopbar();
    suppressSecondaryHome();
    return true;
  }

  function geometry(){
    const el=s=>q('#page-home '+s)?.getBoundingClientRect()||null;
    const sidebar=q('.sidebar')?.getBoundingClientRect()||null;
    const topbar=q('.topbar')?.getBoundingClientRect()||null;
    return{
      sidebar:sidebar?{w:Math.round(sidebar.width),h:Math.round(sidebar.height)}:null,
      topbar:topbar?{h:Math.round(topbar.height)}:null,
      hero:el('.hub-safe-hero'),
      subjects:el('.hub-safe-subjects'),
      continue:el('.hub-safe-continue'),
      achievements:el('.hub-safe-achievements'),
      overall:el('.hub-safe-overall'),
      assistant:el('.hub-safe-assistant'),
      schedule:el('.hub-safe-schedule'),
      motivation:el('.hub-safe-motivation')
    };
  }

  function selfCheck(){
    const g=geometry();
    return{
      release:RELEASE,
      active:document.body.dataset.hubReferenceV5==='1',
      searchPlaceholder:q('#hubSafeSearch')?.placeholder||'',
      profileCopy:Boolean(q('.hub-top-profile-copy')),
      secondaryHomeHidden:[...document.querySelectorAll('#page-home [data-academic2026="home"]')].every(el=>getComputedStyle(el).display==='none'),
      primaryPanels:['.hub-safe-hero','.hub-safe-subjects','.hub-safe-continue','.hub-safe-assistant','.hub-safe-schedule','.hub-safe-achievements','.hub-safe-overall','.hub-safe-motivation'].every(sel=>Boolean(q('#page-home '+sel))),
      geometry:g
    };
  }

  let timer=0;
  const repair=()=>{clearTimeout(timer);timer=setTimeout(apply,20)};
  const observer=new MutationObserver(repair);

  function boot(){
    apply();
    const root=q('#appRoot')||document.body;
    observer.observe(root,{childList:true,subtree:true,characterData:true});
    window.addEventListener('resize',repair,{passive:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  window.BAUMAN_HUB_REFERENCE_V5={release:RELEASE,apply,selfCheck,geometry};
})();
