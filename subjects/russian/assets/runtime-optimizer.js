'use strict';
(function(){
  const SCHEMA='RUSSIAN_RUNTIME_OPTIMIZER_V1';
  const CORE_DATA=['curriculum','lessons','grammar','grammar-path','vocab','mindmap','exercises','tests','simulations','speaking','handwriting','handwriting-listen-write','listen-write-lessons','listen-write-level-rules','writing','videos','knowledge-index'];
  const LIGHT_DATA=['curriculum','grammar','grammar-path','handwriting','handwriting-listen-write','writing','videos','knowledge-index'];
  const DATA_CACHE='russian-learning-data-v1';
  const PROTECTED_OFFLINE_URLS=['../../foundation/domain-model/legacy-mapping-registry.v1.json'];
  const DATA_FETCH_TIMEOUT_MS=8000;
  const SW_READY_TIMEOUT_MS=20000;
  const SW_REGISTER_ATTEMPTS=3;
  let preparing=false, prepared=Number(localStorage.getItem('ru_offline_core_count')||0), protectedPrepared=0, swReadyPromise=null;

  function statusButton(){
    const host=document.querySelector('.ru-top-actions');if(!host)return null;
    let btn=document.getElementById('ruOfflineStatus');
    if(!btn){btn=document.createElement('button');btn.type='button';btn.id='ruOfflineStatus';btn.className='ru-runtime-status';btn.innerHTML='<i></i><span></span>';btn.title='Trạng thái mạng và bộ học offline';host.insertBefore(btn,document.getElementById('saveState')||null);btn.addEventListener('click',()=>prepareOfflineCore());}
    return btn;
  }
  function paint(){
    const btn=statusButton();if(!btn)return;
    const online=navigator.onLine;const ready=prepared>=CORE_DATA.length&&protectedPrepared>=PROTECTED_OFFLINE_URLS.length;
    btn.dataset.online=online?'1':'0';btn.dataset.ready=ready?'1':'0';
    const label=preparing?'Đang chuẩn bị offline…':ready?(online?'Offline sẵn sàng':'Đang dùng offline'):(online?`Online · offline ${prepared}/${CORE_DATA.length}`:'Offline · dữ liệu chưa đủ');
    const span=btn.querySelector('span');if(span)span.textContent=label;btn.title=ready?'Bộ dữ liệu học bắt buộc đã được cache cho lần dùng offline tiếp theo.':'Bấm để chuẩn bị bộ dữ liệu học bắt buộc cho offline.';
  }
  async function fetchWithTimeout(url,options={},timeoutMs=DATA_FETCH_TIMEOUT_MS){
    if(typeof AbortController!=='function')return fetch(url,options);
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),timeoutMs);
    try{return await fetch(url,{...options,signal:controller.signal});}
    finally{clearTimeout(timer);}
  }
  async function countCached(names=CORE_DATA){
    if(!('caches'in window))return 0;
    const cache=await caches.open(DATA_CACHE);let count=0;
    for(const name of names){if(await cache.match(`data/${name}.json`))count++;}
    return count;
  }
  async function countProtectedCached(urls=PROTECTED_OFFLINE_URLS){
    if(!('caches'in window))return 0;
    const cache=await caches.open(DATA_CACHE);let count=0;
    for(const url of urls){if(await cache.match(url))count++;}
    return count;
  }
  async function reconcileOfflineCore(){
    try{
      [prepared,protectedPrepared]=await Promise.all([countCached(CORE_DATA),countProtectedCached()]);
      localStorage.setItem('ru_offline_core_count',String(prepared));
    }catch(_){prepared=0;protectedPrepared=0;}
    paint();return prepared;
  }
  async function cacheNames(names,{refresh=false}={}){
    if(!('caches'in window))return 0;
    const cache=await caches.open(DATA_CACHE);let count=0;
    for(const name of names){
      const url=`data/${name}.json`;
      try{
        const existing=await cache.match(url);
        if(existing&&!refresh){count++;continue;}
        const res=await fetchWithTimeout(url,{cache:'no-store'});
        if(res.ok){await cache.put(url,res.clone());count++;}
        else if(existing){count++;}
      }catch(_){if(await cache.match(url))count++;}
      if(names===CORE_DATA){prepared=count;localStorage.setItem('ru_offline_core_count',String(count));paint();}
    }
    return count;
  }
  async function cacheProtectedOffline(urls=PROTECTED_OFFLINE_URLS,{refresh=false}={}){
    if(!('caches'in window))return 0;
    const cache=await caches.open(DATA_CACHE);let count=0;
    for(const url of urls){
      try{
        const existing=await cache.match(url);
        if(existing&&!refresh){count++;continue;}
        const res=await fetchWithTimeout(url,{cache:'no-store',credentials:'include'});
        if(res.ok){await cache.put(url,res.clone());count++;}
        else if(existing){count++;}
      }catch(_){if(await cache.match(url))count++;}
    }
    protectedPrepared=count;paint();return count;
  }
  async function prepareOfflineCore(){
    if(preparing||!navigator.onLine)return;
    preparing=true;paint();
    try{
      [prepared,protectedPrepared]=await Promise.all([
        cacheNames(CORE_DATA,{refresh:true}),
        cacheProtectedOffline(PROTECTED_OFFLINE_URLS,{refresh:true})
      ]);
      localStorage.setItem('ru_offline_core_count',String(prepared));
    }finally{preparing=false;paint();}
  }
  function idleWarm(){
    if(!navigator.onLine||navigator.connection?.saveData)return;
    const run=()=>cacheNames(LIGHT_DATA).then(()=>reconcileOfflineCore()).catch(()=>{});
    if('requestIdleCallback'in window)requestIdleCallback(run,{timeout:5000});else setTimeout(run,1800);
  }
  function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
  function promiseTimeout(promise,timeoutMs,label){
    let timer;
    return Promise.race([
      promise,
      new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(label+' timed out after '+timeoutMs+'ms')),timeoutMs);})
    ]).finally(()=>{if(timer)clearTimeout(timer);});
  }
  async function serviceWorkerAttempt(){
    const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
    await reg.update().catch(()=>{});
    const ready=await promiseTimeout(navigator.serviceWorker.ready,SW_READY_TIMEOUT_MS,'Russian service-worker ready');
    if(!navigator.serviceWorker.controller){
      await promiseTimeout(new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true})),SW_READY_TIMEOUT_MS,'Russian service-worker controller');
    }
    if(!navigator.serviceWorker.controller)throw new Error('Russian service-worker controller unavailable after activation');
    return ready;
  }
  async function ensureServiceWorkerReady({force=false}={}){
    if(!('serviceWorker'in navigator)||location.protocol==='file:')return null;
    if(swReadyPromise&&!force)return swReadyPromise;
    const run=(async()=>{
      let lastError=null;
      for(let attempt=1;attempt<=SW_REGISTER_ATTEMPTS;attempt++){
        try{return await serviceWorkerAttempt();}
        catch(e){
          lastError=e;
          if(attempt<SW_REGISTER_ATTEMPTS)await sleep(600*attempt);
        }
      }
      throw lastError||new Error('Russian service-worker registration failed');
    })();
    swReadyPromise=run;
    try{return await run;}
    catch(e){if(swReadyPromise===run)swReadyPromise=null;throw e;}
  }
  async function register(){
    if(!('serviceWorker'in navigator)||location.protocol==='file:')return;
    try{await ensureServiceWorkerReady();await reconcileOfflineCore();idleWarm();}
    catch(e){console.warn('Russian offline shell unavailable',e);}
  }
  function bootOfflineRuntime(){paint();register();}
  window.addEventListener('online',()=>{paint();reconcileOfflineCore();});window.addEventListener('offline',()=>{paint();reconcileOfflineCore();});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootOfflineRuntime,{once:true});else bootOfflineRuntime();
  window.RussianRuntimeOptimizer={schema:SCHEMA,prepareOfflineCore,reconcileOfflineCore,ensureServiceWorkerReady,status:()=>({online:navigator.onLine,prepared,total:CORE_DATA.length,protectedPrepared,protectedTotal:PROTECTED_OFFLINE_URLS.length,ready:prepared>=CORE_DATA.length&&protectedPrepared>=PROTECTED_OFFLINE_URLS.length,serviceWorkerControlled:!!navigator.serviceWorker?.controller}),coreData:[...CORE_DATA],protectedOfflineUrls:[...PROTECTED_OFFLINE_URLS]};
})();
