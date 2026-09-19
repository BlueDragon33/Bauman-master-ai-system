'use strict';
(function(){
  const SCHEMA='RUSSIAN_RUNTIME_OPTIMIZER_V1';
  const SHELL_CACHE='russian-app-shell-v2';
  const SHELL_REQUIRED=["./","./index.html","./manifest.webmanifest","./assets/core.css","./assets/browser-capabilities.css","./assets/russian.css","./assets/russian-reference-ui.css","./assets/russian-reference-ui-polish.css","./assets/learning-state.css","./assets/content-contract.css","./assets/learning-flow.css","./assets/cyrillic-literacy.css","./assets/cursive-glyphs.css","./assets/handwriting-motor-coach.css","./assets/reading-bridge.css","./assets/dictation-listen-write.css","./assets/vocab-srs.css","./assets/multimodal-review.css","./assets/skill-gated-assessment.css","./assets/weakness-repair-router.css","./assets/visual-vocabulary-runtime.css","./assets/speaking-coach.css","./assets/listening-ladder.css","./assets/dialogue-scaffold.css","./assets/academic-language.css","./assets/grammar-pattern-coach.css","./assets/runtime-optimizer.css","./assets/asset-reliability.css","./assets/subject-adapter.js","./assets/ui-cleanup-contract.js","./assets/content-contract.js","../shared/host-bridge.js","../../foundation/domain-model/canonical-identity-runtime.js","../../foundation/domain-model/identity-overlay-store.js","../../foundation/domain-model/legacy-snapshot-extractor.js","../../foundation/domain-model/canonical-read-projection.js","../shared/foundation-identity-bootstrap.js","../shared/foundation-identity-persistence.js","../shared/foundation-identity-projection.js","../shared/foundation-canonical-context.js","./assets/planning-bridge.js","./assets/russian-optional-data-loader.js","./assets/visual-vocabulary-runtime.js","./assets/ai-direct-explanation.js","./assets/dialogue-scaffold.js","./assets/browser-capabilities.js","./assets/core.js","./assets/learning-state.js","./assets/learning-flow.js","./assets/cursive-glyphs.js","./assets/cyrillic-literacy.js","./assets/handwriting-motor-coach.js","./assets/reading-bridge.js","./assets/dictation-listen-write.js","./assets/vocab-srs.js","./assets/multimodal-review.js","./assets/skill-gated-assessment.js","./assets/listening-ladder.js","./assets/speaking-coach.js","./assets/academic-language.js","./assets/grammar-pattern-coach.js","./assets/ai-mentor-guard.js","./assets/weakness-repair-router.js","./assets/asset-reliability.js","./assets/runtime-optimizer.js","./assets/russian-reference-ui.js"];
  const CORE_DATA=["curriculum","lessons","grammar","grammar-path","vocab","mindmap","exercises","tests","simulations","speaking","handwriting","writing","videos","knowledge-index","cyrillic-sound-map","reading-bridge","grammar-pattern-bridge"];
  const LIGHT_DATA=['curriculum','grammar','grammar-path','handwriting','writing','videos','knowledge-index'];
  const DATA_CACHE='russian-learning-data-v2';
  let preparing=false, prepared=0, shellPrepared=0, verified=false;

  function statusButton(){
    const host=document.querySelector('.ru-top-actions');if(!host)return null;
    let btn=document.getElementById('ruOfflineStatus');
    if(!btn){btn=document.createElement('button');btn.type='button';btn.id='ruOfflineStatus';btn.className='ru-runtime-status';btn.innerHTML='<i></i><span></span>';btn.title='Trạng thái mạng và bộ học offline';host.insertBefore(btn,document.getElementById('saveState')||null);btn.addEventListener('click',()=>prepareOfflineCore());}
    return btn;
  }
  function paint(){
    const btn=statusButton();if(!btn)return;
    const online=navigator.onLine;const dataReady=prepared>=CORE_DATA.length;const shellReady=shellPrepared>=SHELL_REQUIRED.length;const ready=verified&&dataReady&&shellReady;
    btn.dataset.online=online?'1':'0';btn.dataset.ready=ready?'1':'0';
    const label=preparing?'Đang chuẩn bị offline…':ready?(online?'Offline sẵn sàng':'Đang dùng offline'):(online?`Online · shell ${shellPrepared}/${SHELL_REQUIRED.length} · data ${prepared}/${CORE_DATA.length}`:`Offline chưa đủ · shell ${shellPrepared}/${SHELL_REQUIRED.length} · data ${prepared}/${CORE_DATA.length}`);
    const span=btn.querySelector('span');if(span)span.textContent=label;btn.title=ready?'App shell và dữ liệu học bắt buộc đã đủ trong Cache Storage.':'Bấm để chuẩn bị đầy đủ app shell và dữ liệu bắt buộc cho offline.';
  }
  async function countCachedShell(names=SHELL_REQUIRED){
    if(!('caches'in window))return 0;
    const cache=await caches.open(SHELL_CACHE);let count=0;
    for(const name of names){if(await cache.match(name))count++;}
    return count;
  }
  async function cacheShell(names=SHELL_REQUIRED,{refresh=false}={}){
    if(!('caches'in window))return 0;
    const cache=await caches.open(SHELL_CACHE);let count=0;
    for(const url of names){
      try{
        const existing=await cache.match(url);
        if(existing&&!refresh){count++;continue;}
        const res=await fetch(url,{cache:'no-store'});
        if(res.ok){await cache.put(url,res.clone());count++;}
        else if(existing){count++;}
      }catch(_){if(await cache.match(url))count++;}
      shellPrepared=count;localStorage.setItem('ru_offline_shell_count',String(count));paint();
    }
    return count;
  }
  async function countCached(names=CORE_DATA){
    if(!('caches'in window))return 0;
    const cache=await caches.open(DATA_CACHE);let count=0;
    for(const name of names){if(await cache.match(`data/${name}.json`))count++;}
    return count;
  }
  async function reconcileOfflineCore(){
    try{
      [shellPrepared,prepared]=await Promise.all([countCachedShell(SHELL_REQUIRED),countCached(CORE_DATA)]);
      localStorage.setItem('ru_offline_shell_count',String(shellPrepared));
      localStorage.setItem('ru_offline_core_count',String(prepared));
      verified=true;
    }catch(_){shellPrepared=0;prepared=0;verified=false;}
    paint();return {shellPrepared,prepared,verified};
  }
  async function cacheNames(names,{refresh=false}={}){
    if(!('caches'in window))return 0;
    const cache=await caches.open(DATA_CACHE);let count=0;
    for(const name of names){
      const url=`data/${name}.json`;
      try{
        const existing=await cache.match(url);
        if(existing&&!refresh){count++;continue;}
        const res=await fetch(url,{cache:'no-store'});
        if(res.ok){await cache.put(url,res.clone());count++;}
        else if(existing){count++;}
      }catch(_){if(await cache.match(url))count++;}
      if(names===CORE_DATA){prepared=count;localStorage.setItem('ru_offline_core_count',String(count));paint();}
    }
    return count;
  }
  async function prepareOfflineCore(){
    if(preparing||!navigator.onLine)return;
    preparing=true;paint();
    try{
      shellPrepared=await cacheShell(SHELL_REQUIRED,{refresh:true});
      prepared=await cacheNames(CORE_DATA,{refresh:true});
      localStorage.setItem('ru_offline_shell_count',String(shellPrepared));
      localStorage.setItem('ru_offline_core_count',String(prepared));
      verified=true;
    }finally{preparing=false;paint();}
  }
  function idleWarm(){
    if(!navigator.onLine||navigator.connection?.saveData)return;
    const run=()=>cacheNames(LIGHT_DATA).then(()=>reconcileOfflineCore()).catch(()=>{});
    if('requestIdleCallback'in window)requestIdleCallback(run,{timeout:5000});else setTimeout(run,1800);
  }
  async function register(){
    if(!('serviceWorker'in navigator)||location.protocol==='file:')return;
    try{await navigator.serviceWorker.register('./sw.js',{scope:'./'});await navigator.serviceWorker.ready;await reconcileOfflineCore();idleWarm();}
    catch(e){console.warn('Russian offline shell unavailable',e);}
  }
  window.addEventListener('online',()=>{paint();reconcileOfflineCore();});window.addEventListener('offline',()=>{paint();reconcileOfflineCore();});
  document.addEventListener('DOMContentLoaded',()=>{paint();register();});
  window.RussianRuntimeOptimizer={schema:SCHEMA,prepareOfflineCore,reconcileOfflineCore,status:()=>({online:navigator.onLine,verified,shellPrepared,shellTotal:SHELL_REQUIRED.length,prepared,total:CORE_DATA.length,ready:verified&&shellPrepared>=SHELL_REQUIRED.length&&prepared>=CORE_DATA.length}),coreData:[...CORE_DATA],shellRequired:[...SHELL_REQUIRED]};
})();
