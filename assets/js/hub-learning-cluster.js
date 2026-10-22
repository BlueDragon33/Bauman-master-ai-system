/* Bauman Master Hub · Compact primary navigation V6
   Sidebar owns only five top-level destinations.
   Study/review/exam/AI/progress/settings remain in-page actions, not duplicate tabs. */
(()=>{
  'use strict';
  const RELEASE='HUB_PRIMARY_NAV_2026_10_V6';
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

  function activePageId(){
    const active=q('.main > .page.active');
    if(active?.id?.startsWith('page-'))return active.id.slice(5);
    const statePage=(typeof state!=='undefined'&&state?.page)||'';
    return PRIMARY.some(([id])=>id===statePage)?statePage:'';
  }

  function syncActive(nav){
    if(!nav)return '';
    const activeId=activePageId();
    for(const [id] of PRIMARY){
      const button=pageButton(nav,id);if(!button)continue;
      const selected=id===activeId;
      button.classList.toggle('active',selected);
      if(selected)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
    }
    nav.dataset.activePage=activeId;
    return activeId;
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
    syncActive(nav);
    return PRIMARY.every(([id])=>Boolean(pageButton(nav,id)));
  }

  let routeObserver=null;
  function observeActive(){
    const main=q('.main');if(!main||routeObserver)return;
    routeObserver=new MutationObserver(records=>{
      if(records.some(record=>record.type==='attributes'&&record.attributeName==='class'))syncActive(q('#nav'));
    });
    routeObserver.observe(main,{subtree:true,attributes:true,attributeFilter:['class']});
  }

  function boot(){apply();observeActive();}

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
        activePage:nav?.dataset.activePage||'',
        ariaCurrentPage:q(':scope > button[aria-current="page"]',nav)?.dataset?.page||'',
        ariaCurrentCount:qa(':scope > button[aria-current="page"]',nav).length,
        secondaryActionsHidden:visibleActions.length===0,
      };
    }
  };
})();
