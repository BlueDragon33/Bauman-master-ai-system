/* Bauman Master Hub · Learning navigation cluster
   Presentation-only: preserves canonical nav nodes and handlers in-place. */
(()=>{
  'use strict';
  const RELEASE='HUB_LEARNING_CLUSTER_2026_09_R4';
  const LEARNING_IDS=['study','simulation','exercise','exam','review'];
  const REMOVE_IDS=new Set(['achievement','settings']);
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const actionId=el=>el?.dataset?.safeNav||el?.dataset?.hubAction||'';

  function canonicalActionButton(nav,id){
    return qa(':scope > button',nav).find(button=>actionId(button)===id)||null;
  }

  function markPolicyHidden(nav){
    qa(':scope > button',nav).forEach(button=>{
      const id=actionId(button);
      if(REMOVE_IDS.has(id)){
        button.classList.add('hub-nav-hidden-by-policy');
        button.setAttribute('aria-hidden','true');
        button.tabIndex=-1;
      }
      if(LEARNING_IDS.includes(id)){
        button.classList.add('hub-nav-cluster-source');
        button.setAttribute('aria-hidden','true');
        button.tabIndex=-1;
      }
    });
    qa(':scope > .hub-safe-nav-divider,:scope > .hub-nav-divider',nav).forEach(divider=>divider.classList.add('hub-nav-hidden-by-policy'));
  }

  function renameProgress(nav){
    const button=canonicalActionButton(nav,'progress');
    if(!button)return;
    const label=q('span',button);
    if(label)label.textContent='Tiến độ';
    button.title='Tiến độ';
    button.setAttribute('aria-label','Tiến độ');
  }

  function makeDisplayClone(source){
    const id=actionId(source);
    const clone=source.cloneNode(true);
    clone.removeAttribute('id');
    clone.removeAttribute('data-safe-nav');
    clone.removeAttribute('data-hub-action');
    clone.classList.remove('hub-nav-cluster-source','hub-nav-hidden-by-policy');
    clone.classList.add('hub-learning-clone');
    clone.dataset.learningAction=id;
    clone.removeAttribute('aria-hidden');
    clone.removeAttribute('tabindex');
    return clone;
  }

  function ensureCluster(nav){
    let cluster=q(':scope > [data-hub-learning-cluster="1"]',nav);
    if(!cluster){
      cluster=document.createElement('section');
      cluster.className='hub-learning-cluster';
      cluster.dataset.hubLearningCluster='1';
      cluster.innerHTML='<header class="hub-learning-cluster-title"><span>Tiếp tục nơi vừa mới học xong</span><small>Học · luyện · kiểm tra · ôn tập</small></header><div class="hub-learning-cluster-items"></div>';
      const research=nav.querySelector(':scope > button[data-page="research"]');
      if(research)research.insertAdjacentElement('afterend',cluster);
      else nav.appendChild(cluster);
    }
    const items=q('.hub-learning-cluster-items',cluster);
    items.innerHTML='';
    LEARNING_IDS.forEach(id=>{
      const source=canonicalActionButton(nav,id);
      if(source)items.appendChild(makeDisplayClone(source));
    });
    return cluster;
  }

  function forwardLearningAction(button){
    const id=button?.dataset?.learningAction;
    if(!id)return false;
    const nav=q('#nav');
    const source=nav&&canonicalActionButton(nav,id);
    if(!source)return false;
    source.click();
    return true;
  }

  function apply(){
    const nav=q('#nav');
    if(!nav)return false;
    markPolicyHidden(nav);
    renameProgress(nav);
    ensureCluster(nav);
    nav.dataset.learningCluster='1';
    document.documentElement.dataset.hubLearningCluster=RELEASE;
    const learningActions=LEARNING_IDS.filter(id=>Boolean(canonicalActionButton(nav,id)));
    const progress=canonicalActionButton(nav,'progress');
    return learningActions.length===LEARNING_IDS.length&&Boolean(progress);
  }

  function bind(){
    document.addEventListener('click',event=>{
      const button=event.target.closest('[data-learning-action]');
      if(!button)return;
      event.preventDefault();
      event.stopPropagation();
      forwardLearningAction(button);
    },true);
  }

  function boot(){
    let attempts=0;
    const tick=()=>{
      attempts+=1;
      const ready=apply();
      if(attempts<12)setTimeout(tick,ready?180:80);
    };
    tick();
  }

  bind();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
  window.BAUMAN_HUB_LEARNING_CLUSTER={release:RELEASE,apply,selfCheck:()=>{
    const nav=q('#nav'),cluster=q('[data-hub-learning-cluster="1"]',nav||document);
    return {
      release:RELEASE,
      installed:Boolean(cluster),
      learningActions:LEARNING_IDS.filter(id=>Boolean(canonicalActionButton(nav,id))),
      completeLearningCluster:LEARNING_IDS.every(id=>Boolean(canonicalActionButton(nav,id))),
      visibleLearningClones:cluster?qa('[data-learning-action]',cluster).map(el=>el.dataset.learningAction):[],
      canonicalSelectorsIsolated:cluster?qa('[data-safe-nav],[data-hub-action]',cluster).length===0:false,
      achievementHidden:Boolean(canonicalActionButton(nav,'achievement')?.classList.contains('hub-nav-hidden-by-policy')),
      settingsHidden:Boolean(canonicalActionButton(nav,'settings')?.classList.contains('hub-nav-hidden-by-policy')),
      progressPresent:Boolean(canonicalActionButton(nav,'progress')),
      progressLabel:q('span',canonicalActionButton(nav,'progress'))?.textContent?.trim()||''
    };
  }};
})();
