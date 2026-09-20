/* Bauman Master Hub · Reference navigation V4
   Presentation-only: keeps canonical buttons/handlers and flattens them to match the approved Hub reference UI. */
(()=>{
  'use strict';
  const RELEASE='HUB_REFERENCE_NAV_2026_09_V4';
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const actionId=el=>el?.dataset?.safeNav||el?.dataset?.hubAction||'';
  const ACTION_IDS=['study','simulation','exercise','ai','exam','review','progress','achievement','community','settings'];
  const ORDER=[
    ['page','home'],['action','study'],['page','roadmap'],['page','subjects'],
    ['action','simulation'],['action','exercise'],['action','ai'],['action','exam'],
    ['action','review'],['action','progress'],['action','achievement'],['action','community'],
    ['action','settings'],['page','schedule'],['page','research']
  ];

  function actionButton(nav,id){return qa(':scope > button',nav).find(button=>actionId(button)===id)||null}
  function pageButton(nav,id){return q(':scope > button[data-page="'+id+'"]',nav)}

  function labelButton(button,label){
    if(!button)return;
    const span=q('span',button);if(span)span.textContent=label;
    button.title=label;button.setAttribute('aria-label',label);
  }

  function clearLegacyCluster(nav){
    q(':scope > [data-hub-learning-cluster="1"]',nav)?.remove();
    qa(':scope > button',nav).forEach(button=>{
      button.classList.remove('hub-nav-hidden-by-policy','hub-nav-cluster-source');
      button.removeAttribute('aria-hidden');
      button.removeAttribute('tabindex');
    });
    qa(':scope > .hub-safe-nav-divider,:scope > .hub-nav-divider',nav).forEach(divider=>divider.classList.add('hub-nav-reference-hidden'));
  }

  function apply(){
    const nav=q('#nav');if(!nav)return false;
    clearLegacyCluster(nav);
    labelButton(actionButton(nav,'progress'),'Bản đồ năng lực');
    labelButton(actionButton(nav,'achievement'),'Thành tích');
    const schedule=pageButton(nav,'schedule'),research=pageButton(nav,'research');
    schedule?.classList.add('hub-nav-reference-hidden');
    research?.classList.add('hub-nav-reference-hidden');
    const nodes=ORDER.map(([kind,id])=>kind==='page'?pageButton(nav,id):actionButton(nav,id)).filter(Boolean);
    nodes.forEach(node=>nav.appendChild(node));
    nav.dataset.learningCluster='flat-v4';
    nav.dataset.referenceNav='1';
    document.documentElement.dataset.hubLearningCluster=RELEASE;
    return ACTION_IDS.every(id=>Boolean(actionButton(nav,id)));
  }

  function boot(){
    let attempts=0;
    const tick=()=>{attempts+=1;const ready=apply();if(attempts<18)setTimeout(tick,ready?220:90)};
    tick();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.BAUMAN_HUB_LEARNING_CLUSTER={release:RELEASE,apply,selfCheck:()=>{
    const nav=q('#nav');
    const visibleActions=ACTION_IDS.filter(id=>{const el=actionButton(nav,id);return !!el&&getComputedStyle(el).display!=='none'});
    const visiblePages=['home','roadmap','subjects'].filter(id=>{const el=pageButton(nav,id);return !!el&&getComputedStyle(el).display!=='none'});
    return{
      release:RELEASE,
      installed:Boolean(nav?.dataset.referenceNav==='1'),
      flatLayout:Boolean(nav?.dataset.learningCluster==='flat-v4'),
      visibleActions,
      visiblePages,
      scheduleHidden:Boolean(pageButton(nav,'schedule')?.classList.contains('hub-nav-reference-hidden')),
      researchHidden:Boolean(pageButton(nav,'research')?.classList.contains('hub-nav-reference-hidden')),
      progressLabel:q('span',actionButton(nav,'progress'))?.textContent?.trim()||'',
      achievementLabel:q('span',actionButton(nav,'achievement'))?.textContent?.trim()||''
    };
  }};
})();
