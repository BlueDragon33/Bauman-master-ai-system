/* Bauman Master Hub · Compact primary navigation V5
   Sidebar owns only five top-level destinations.
   Study/review/exam/AI/progress/settings remain in-page actions, not duplicate tabs. */
(()=>{
  'use strict';
  const RELEASE='HUB_PRIMARY_NAV_2026_09_V5';
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const PRIMARY=[
    ['home','Trang chủ'],
    ['roadmap','Lộ trình'],
    ['subjects','Môn học'],
    ['schedule','Lịch học'],
    ['research','НИР & Luận văn'],
  ];
  const actionId=el=>el?.dataset?.safeNav||el?.dataset?.hubAction||'';

  function pageButton(nav,id){return q(':scope > button[data-page="'+id+'"]',nav)}
  function secondaryButtons(nav){return qa(':scope > button',nav).filter(button=>Boolean(actionId(button)))}

  function normalizePrimary(nav){
    for(const [id,label] of PRIMARY){
      const button=pageButton(nav,id);
      if(!button)continue;
      button.classList.remove('hub-nav-reference-hidden','hub-nav-hidden-by-policy','hub-rm-v4-hidden');
      button.removeAttribute('aria-hidden');
      button.removeAttribute('tabindex');
      button.title=label;
      button.setAttribute('aria-label',label);
      const span=q('span',button);if(span)span.textContent=label;
      nav.appendChild(button);
    }
  }

  function hideSecondary(nav){
    secondaryButtons(nav).forEach(button=>{
      button.classList.add('hub-nav-reference-hidden','hub-nav-secondary-action');
      button.setAttribute('aria-hidden','true');
      button.setAttribute('tabindex','-1');
    });
    qa(':scope > .hub-safe-nav-divider,:scope > .hub-nav-divider,:scope > [data-hub-learning-cluster="1"]',nav)
      .forEach(node=>node.classList.add('hub-nav-reference-hidden'));
  }

  function apply(){
    const nav=q('#nav');if(!nav)return false;
    hideSecondary(nav);
    normalizePrimary(nav);
    nav.dataset.learningCluster='primary-v5';
    nav.dataset.referenceNav='1';
    nav.dataset.primaryCount=String(PRIMARY.length);
    document.documentElement.dataset.hubLearningCluster=RELEASE;
    return PRIMARY.every(([id])=>Boolean(pageButton(nav,id)));
  }

  function boot(){
    let attempts=0;
    const tick=()=>{attempts+=1;apply();if(attempts<20)setTimeout(tick,attempts<5?90:240)};
    tick();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();

  window.BAUMAN_HUB_LEARNING_CLUSTER={
    release:RELEASE,
    apply,
    selfCheck:()=>{
      const nav=q('#nav');
      const visiblePages=PRIMARY.filter(([id])=>{const el=pageButton(nav,id);return !!el&&getComputedStyle(el).display!=='none'}).map(([id])=>id);
      const visibleActions=secondaryButtons(nav).filter(el=>getComputedStyle(el).display!=='none').map(actionId);
      return{
        release:RELEASE,
        installed:Boolean(nav?.dataset.referenceNav==='1'),
        layout:nav?.dataset.learningCluster||'',
        primaryCount:Number(nav?.dataset.primaryCount||0),
        visiblePages,
        visibleActions,
        secondaryActionsHidden:visibleActions.length===0,
      };
    }
  };
})();
