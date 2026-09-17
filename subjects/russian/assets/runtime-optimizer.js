'use strict';
(function(){
  const SCHEMA='RUSSIAN_RUNTIME_OPTIMIZER_V1';
  const CORE_DATA=['curriculum','lessons','grammar','grammar-path','vocab','mindmap','exercises','tests','simulations','speaking','handwriting','writing','videos','knowledge-index'];
  const LIGHT_DATA=['curriculum','grammar','grammar-path','handwriting','writing','videos','knowledge-index'];
  const DATA_CACHE='russian-learning-data-v1';
  const clean=v=>String(v??'').trim();
  let preparing=false, prepared=Number(localStorage.getItem('ru_offline_core_count')||0);

  function statusButton(){
    const host=document.querySelector('.ru-top-actions');if(!host)return null;
    let btn=document.getElementById('ruOfflineStatus');
    if(!btn){btn=document.createElement('button');btn.type='button';btn.id='ruOfflineStatus';btn.className='ru-runtime-status';btn.innerHTML='<i></i><span></span>';btn.title='Trạng thái mạng và bộ học offline';host.insertBefore(btn,document.getElementById('saveState')||null);btn.addEventListener('click',()=>prepareOfflineCore());}
    return btn;
  }
  function paint(){
    const btn=statusButton();if(!btn)return;
    const online=navigator.onLine;const ready=prepared>=CORE_DATA.length;
    btn.dataset.online=online?'1':'0';btn.dataset.ready=ready?'1':'0';
    const label=preparing?'Đang chuẩn bị offline…':ready?(online?'Offline sẵn sàng':'Đang dùng offline'):(online?`Online · offline ${prepared}/${CORE_DATA.length}`:'Offline · dữ liệu chưa đủ');
    const span=btn.querySelector('span');if(span)span.textContent=label;btn.title=ready?'Bộ dữ liệu học bắt buộc đã được cache cho lần dùng offline tiếp theo.':'Bấm để chuẩn bị bộ dữ liệu học bắt buộc cho offline.';
  }
  async function cacheNames(names){
    if(!('caches'in window))return 0;
    const cache=await caches.open(DATA_CACHE);let count=0;
    for(const name of names){
      const url=`data/${name}.json`;
      try{const existing=await cache.match(url);if(existing){count++;continue;}const res=await fetch(url,{cache:'no-store'});if(res.ok){await cache.put(url,res.clone());count++;}}
      catch(_){/* network can disappear while warming */}
      if(names===CORE_DATA){prepared=count;localStorage.setItem('ru_offline_core_count',String(count));paint();}
    }
    return count;
  }
  async function prepareOfflineCore(){
    if(preparing||!navigator.onLine)return;
    preparing=true;paint();
    try{prepared=await cacheNames(CORE_DATA);localStorage.setItem('ru_offline_core_count',String(prepared));}
    finally{preparing=false;paint();}
  }
  function idleWarm(){
    if(!navigator.onLine||navigator.connection?.saveData)return;
    const run=()=>cacheNames(LIGHT_DATA).catch(()=>{});
    if('requestIdleCallback'in window)requestIdleCallback(run,{timeout:5000});else setTimeout(run,1800);
  }
  async function register(){
    if(!('serviceWorker'in navigator)||location.protocol==='file:')return;
    try{await navigator.serviceWorker.register('./sw.js',{scope:'./'});await navigator.serviceWorker.ready;idleWarm();}
    catch(e){console.warn('Russian offline shell unavailable',e);}
  }
  window.addEventListener('online',paint);window.addEventListener('offline',paint);
  document.addEventListener('DOMContentLoaded',()=>{paint();register();});
  window.RussianRuntimeOptimizer={schema:SCHEMA,prepareOfflineCore,status:()=>({online:navigator.onLine,prepared,total:CORE_DATA.length,ready:prepared>=CORE_DATA.length}),coreData:[...CORE_DATA]};
})();
