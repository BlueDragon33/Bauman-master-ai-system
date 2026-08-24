(function(global){
  'use strict';

  const RELEASE='BAUMAN_OFFLINE_SUBJECT_PACK_REFCOUNT_GUARD_2026_08_24';
  const CACHE_NAME='bauman-offline-content-v1';
  const lib=()=>global.BaumanOfflineContentLibrary;
  const canonical=url=>{const parsed=new URL(url,location.href);parsed.hash='';parsed.search='';return parsed.href;};

  async function safeRemovePack(packId){
    const library=lib();
    if(!library)throw new Error('Offline Library chưa sẵn sàng');
    const packs=await library.listPacks();
    const target=packs.find(pack=>pack.packId===packId);
    if(!target){await library.removePack(packId);return {packId,removedUrls:0,preservedShared:0};}

    const referencedElsewhere=new Set();
    for(const pack of packs){
      if(pack.packId===packId||pack.source!=='service-worker-cache')continue;
      for(const item of pack.metadata?.urls||[])try{referencedElsewhere.add(canonical(item.url));}catch(_){ }
    }

    const cache=await caches.open(CACHE_NAME);
    let removedUrls=0,preservedShared=0;
    for(const item of target.metadata?.urls||[]){
      let url='';try{url=canonical(item.url);}catch(_){continue;}
      if(referencedElsewhere.has(url)){preservedShared++;continue;}
      if(await cache.delete(url))removedUrls++;
    }
    await library.removePack(packId);
    return {packId,removedUrls,preservedShared};
  }

  document.addEventListener('click',event=>{
    const target=event.target.closest?.('[data-offline-action="remove-pack"]');
    const id=target?.dataset?.packId||'';
    if(!id.startsWith('subject-'))return;
    event.preventDefault();
    event.stopImmediatePropagation();
    safeRemovePack(id).then(result=>{
      global.toast?.(`Đã xóa gói; giữ lại ${result.preservedShared} tài nguyên còn được gói khác dùng`);
      global.BaumanOfflineLibraryUI?.open?.();
    }).catch(error=>global.toast?.('Không xóa được gói: '+String(error?.message||error)));
  },true);

  function patchManager(){
    const manager=global.BaumanOfflineSubjectPackManager;
    if(manager&&manager.removePack!==safeRemovePack){manager.removePack=safeRemovePack;return true;}
    return !!manager;
  }
  let attempts=0;
  const timer=setInterval(()=>{attempts++;if(patchManager()||attempts>50)clearInterval(timer);},20);

  global.BaumanOfflineSubjectPackRefcountGuard={release:RELEASE,safeRemovePack,selfCheck(){return {ok:!!global.caches&&!!lib(),release:RELEASE,cacheName:CACHE_NAME,managerPatched:global.BaumanOfflineSubjectPackManager?.removePack===safeRemovePack};}};
})(window);
