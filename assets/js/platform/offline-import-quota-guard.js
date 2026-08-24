(function(global){
  'use strict';

  const RELEASE='BAUMAN_OFFLINE_IMPORT_QUOTA_GUARD_2026_08_24';
  const MIN_RESERVE=2*1024*1024;
  const lib=()=>global.BaumanOfflineContentLibrary;

  async function capacityCheck(files){
    const list=Array.from(files||[]);
    const incoming=list.reduce((sum,file)=>sum+Number(file?.size||0),0);
    const estimate=await lib()?.estimate?.()||{usage:0,quota:0};
    const quota=Number(estimate.quota)||0;
    const usage=Number(estimate.usage)||0;
    const free=quota?Math.max(0,quota-usage):0;
    const reserve=Math.max(MIN_RESERVE,Math.ceil(incoming*0.1));
    if(quota&&free<incoming+reserve){
      const error=new Error(`Không đủ dung lượng offline: cần khoảng ${Math.ceil((incoming+reserve)/1024/1024)} MB, còn ${Math.floor(free/1024/1024)} MB.`);
      error.name='QuotaPreflightError';
      throw error;
    }
    return {incoming,quota,usage,free,reserve};
  }

  async function safeImport(files,options={}){
    const library=lib();
    if(!library)throw new Error('Offline Library chưa sẵn sàng');
    const list=Array.from(files||[]).filter(Boolean);
    if(!list.length)throw new Error('Không có file để nhập');
    await capacityCheck(list);
    const packId=options.packId||('local-'+Date.now());
    try{
      return await library.importFiles(list,{...options,packId});
    }catch(error){
      try{await library.removePack(packId);}catch(_){ }
      throw error;
    }
  }

  async function chooseAndImport(directory){
    const library=lib();
    const files=directory?await library.chooseDirectory():await library.chooseFiles({multiple:true});
    const packId='local-'+Date.now();
    const title=directory?'Thư mục tài liệu trên máy':'Tài liệu đã tải';
    const result=await safeImport(files,{packId,title});
    global.toast?.(`Đã đưa ${result.fileCount} file vào Offline Library`);
    await global.BaumanOfflineLibraryUI?.open?.();
    return result;
  }

  document.addEventListener('click',event=>{
    const target=event.target.closest?.('[data-offline-action]');
    if(!target)return;
    const action=target.dataset.offlineAction;
    if(action!=='choose-files'&&action!=='choose-directory')return;
    event.preventDefault();
    event.stopImmediatePropagation();
    chooseAndImport(action==='choose-directory').catch(error=>{
      if(error?.name==='AbortError')return;
      global.toast?.(String(error?.message||error));
    });
  },true);

  global.BaumanOfflineImportQuotaGuard={
    release:RELEASE,
    capacityCheck,
    safeImport,
    selfCheck(){return {ok:!!lib()&&typeof lib().removePack==='function',release:RELEASE,minReserveBytes:MIN_RESERVE,rollback:true};}
  };
})(window);
