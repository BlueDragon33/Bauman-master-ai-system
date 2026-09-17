/* Bauman Master Hub · Learning navigation cluster
   Presentation-only: reuses existing canonical page/action buttons and handlers. */
(()=>{
  'use strict';
  const RELEASE='HUB_LEARNING_CLUSTER_2026_09';
  const LEARNING_IDS=['study','simulation','exercise','test','review'];
  const REMOVE_IDS=new Set(['achievement','settings']);
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const actionId=el=>el?.dataset?.safeNav||el?.dataset?.hubAction||'';

  function actionButton(nav,id){
    return qa('button',nav).find(button=>actionId(button)===id)||null;
  }

  function removeDeprecated(nav){
    qa('button',nav).forEach(button=>{
      if(REMOVE_IDS.has(actionId(button)))button.remove();
    });
    qa('.hub-safe-nav-divider,.hub-nav-divider',nav).forEach(divider=>divider.remove());
  }

  function renameProgress(nav){
    const button=actionButton(nav,'progress');
    if(!button)return;
    const label=q('span',button);
    if(label)label.textContent='Tiến độ';
    button.title='Tiến độ';
    button.setAttribute('aria-label','Tiến độ');
  }

  function ensureCluster(nav){
    let cluster=q('[data-hub-learning-cluster="1"]',nav);
    if(!cluster){
      cluster=document.createElement('section');
      cluster.className='hub-learning-cluster';
      cluster.dataset.hubLearningCluster='1';
      cluster.innerHTML='<header class="hub-learning-cluster-title"><span>Tiếp tục nơi vừa mới học xong</span><small>Học · luyện · kiểm tra · ôn tập</small></header><div class="hub-learning-cluster-items"></div>';
    }
    const items=q('.hub-learning-cluster-items',cluster);
    LEARNING_IDS.forEach(id=>{
      const button=actionButton(nav,id);
      if(button)items.appendChild(button);
    });

    const research=nav.querySelector('button[data-page="research"]');
    if(research)research.insertAdjacentElement('afterend',cluster);
    else nav.appendChild(cluster);
    return cluster;
  }

  function reorderSecondary(nav,cluster){
    const ordered=['ai','progress','community'];
    let anchor=cluster;
    ordered.forEach(id=>{
      const button=actionButton(nav,id);
      if(!button)return;
      anchor.insertAdjacentElement('afterend',button);
      anchor=button;
    });
  }

  function apply(){
    const nav=q('#nav');
    if(!nav)return false;
    removeDeprecated(nav);
    renameProgress(nav);
    const cluster=ensureCluster(nav);
    reorderSecondary(nav,cluster);
    nav.dataset.learningCluster='1';
    document.documentElement.dataset.hubLearningCluster=RELEASE;
    return LEARNING_IDS.filter(id=>Boolean(actionButton(nav,id))).length>=4;
  }

  function boot(){
    let attempts=0;
    const tick=()=>{
      attempts+=1;
      const ready=apply();
      if(!ready&&attempts<12)setTimeout(tick,80);
    };
    tick();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
  window.BAUMAN_HUB_LEARNING_CLUSTER={release:RELEASE,apply,selfCheck:()=>{
    const nav=q('#nav'),cluster=q('[data-hub-learning-cluster="1"]',nav||document);
    return {
      release:RELEASE,
      installed:Boolean(cluster),
      learningActions:LEARNING_IDS.filter(id=>Boolean(actionButton(nav,id))),
      achievementRemoved:!actionButton(nav,'achievement'),
      settingsRemoved:!actionButton(nav,'settings'),
      progressLabel:q('span',actionButton(nav,'progress'))?.textContent?.trim()||''
    };
  }};
})();
