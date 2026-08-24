(function(global){
  'use strict';

  const RELEASE='BAUMAN_OFFLINE_SUBJECT_PACK_MANAGER_2026_08_24';
  const CACHE_NAME='bauman-offline-content-v1';
  const BASE_MAX_RESOURCE=5*1024*1024;
  const SESSION_MAX_RESOURCE=64*1024*1024;
  const PROBE_SETTLE_MS=1800;
  let busy=false;

  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const lib=()=>global.BaumanOfflineContentLibrary;
  const formatBytes=bytes=>{const n=Number(bytes)||0;if(n<1024)return n+' B';if(n<1024*1024)return (n/1024).toFixed(1)+' KB';return (n/1024/1024).toFixed(1)+' MB';};
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

  function supported(){return !!global.caches&&!!lib()?.savePack;}
  function sameOrigin(url){try{return new URL(url,location.href).origin===location.origin;}catch(_){return false;}}
  function canonical(url){
    const parsed=new URL(url,location.href);
    if(parsed.origin!==location.origin)throw new Error('Chỉ cache tài nguyên same-origin');
    parsed.hash='';
    parsed.search='';
    return parsed.href;
  }
  function uniqueUrls(urls){return Array.from(new Set((urls||[]).filter(sameOrigin).map(canonical)));}
  function subjectRecord(id){return global.state?.subjects?.[id]||null;}
  function packId(id,mode){return `subject-${id}-${mode}`;}

  function frameResources(frame){
    const win=frame?.contentWindow;
    if(!win)return [];
    const urls=[];
    try{urls.push(win.location.href);}catch(_){ }
    try{
      for(const entry of win.performance.getEntriesByType('resource')||[])if(entry?.name)urls.push(entry.name);
    }catch(_){ }
    return uniqueUrls(urls);
  }

  async function probeSubject(subjectId){
    const subject=subjectRecord(subjectId);
    if(!subject?.mainPath)throw new Error('Môn chưa có đường dẫn Web App');
    const frame=document.createElement('iframe');
    frame.setAttribute('aria-hidden','true');
    frame.tabIndex=-1;
    frame.style.cssText='position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:-10000px;top:-10000px;border:0';
    const source=new URL(subject.mainPath,location.href);
    source.searchParams.set('offlinePackProbe','1');
    document.body.appendChild(frame);
    try{
      await new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>reject(new Error('Timeout khi dò tài nguyên môn')),30000);
        frame.onload=()=>{clearTimeout(timer);resolve();};
        frame.onerror=()=>{clearTimeout(timer);reject(new Error('Không mở được môn để tạo pack'));};
        frame.src=source.href;
      });
      await sleep(PROBE_SETTLE_MS);
      return frameResources(frame);
    }finally{frame.remove();}
  }

  async function measureResponse(response){
    const header=Number(response.headers.get('content-length'));
    if(Number.isFinite(header)&&header>0)return header;
    try{return (await response.clone().blob()).size||0;}catch(_){return 0;}
  }

  async function cacheUrls(urls,maxResourceBytes){
    const cache=await caches.open(CACHE_NAME);
    const ok=[],skipped=[],failed=[];
    let bytes=0;
    for(const url of uniqueUrls(urls)){
      try{
        const response=await fetch(url,{cache:'no-cache',credentials:'same-origin'});
        if(!response.ok){failed.push({url,status:response.status});continue;}
        const size=await measureResponse(response);
        if(size>maxResourceBytes){skipped.push({url,bytes:size,reason:'resource-limit'});continue;}
        await cache.put(new Request(canonical(url),{credentials:'same-origin'}),response.clone());
        ok.push({url:canonical(url),bytes:size,contentType:response.headers.get('content-type')||''});
        bytes+=size;
      }catch(error){failed.push({url,error:String(error?.message||error)});}
    }
    return {ok,skipped,failed,bytes};
  }

  async function saveSubjectPack(subjectId,mode,urls,maxResourceBytes){
    if(!supported())throw new Error('Cache Storage/Offline Library chưa được hỗ trợ');
    const subject=subjectRecord(subjectId);
    if(!subject)throw new Error('Không tìm thấy môn');
    const result=await cacheUrls(urls,maxResourceBytes);
    const id=packId(subjectId,mode);
    await lib().savePack({
      packId:id,
      version:'2026.08.24-l5.3',
      subjectId,
      title:`${subject.name||subjectId} · ${mode==='base'?'gói nền':'phiên đang học'}`,
      bytes:result.bytes,
      fileCount:result.ok.length,
      source:'service-worker-cache',
      metadata:{mode,urls:result.ok,skipped:result.skipped,failed:result.failed,maxResourceBytes,updatedAt:new Date().toISOString()}
    });
    return {packId:id,...result};
  }

  async function prepareBase(subjectId){
    if(busy)return null;busy=true;
    try{
      global.toast?.('Đang dò đúng tài nguyên startup của môn…');
      const urls=await probeSubject(subjectId);
      const result=await saveSubjectPack(subjectId,'base',urls,BASE_MAX_RESOURCE);
      global.toast?.(`Đã giữ ${result.ok.length} tài nguyên nền offline`);
      global.BaumanOfflineLibraryUI?.open?.();
      return result;
    }finally{busy=false;}
  }

  async function captureCurrentSession(){
    if(busy)return null;busy=true;
    try{
      const frame=document.getElementById('subjectFrame');
      if(!frame)throw new Error('Hãy mở môn trong trang này trước, rồi mở các nội dung cần giữ offline');
      const subjectId=global.state?.lastStudy?.subjectId||global.state?.subject;
      const urls=frameResources(frame);
      if(!urls.length)throw new Error('Chưa đọc được tài nguyên từ môn đang mở');
      const basePacks=(await lib().listPacks()).filter(pack=>pack.packId===packId(subjectId,'base'));
      const baseUrls=basePacks.flatMap(pack=>(pack.metadata?.urls||[]).map(item=>item.url));
      const result=await saveSubjectPack(subjectId,'session',baseUrls.concat(urls),SESSION_MAX_RESOURCE);
      global.toast?.(`Đã giữ phiên ${subjectRecord(subjectId)?.name||subjectId}: ${result.ok.length} tài nguyên`);
      global.BaumanOfflineLibraryUI?.open?.();
      return result;
    }finally{busy=false;}
  }

  async function packRecord(id){return (await lib().listPacks()).find(pack=>pack.packId===id)||null;}

  async function removePack(id){
    const pack=await packRecord(id);
    const cache=await caches.open(CACHE_NAME);
    for(const item of pack?.metadata?.urls||[])try{await cache.delete(canonical(item.url));}catch(_){ }
    await lib().removePack(id);
    global.toast?.('Đã xóa gói môn offline');
    global.BaumanOfflineLibraryUI?.open?.();
  }

  function renderPack(pack){
    const root=document.getElementById('modalRoot');
    if(!root)return;
    const items=pack?.metadata?.urls||[];
    const skipped=pack?.metadata?.skipped||[];
    const failed=pack?.metadata?.failed||[];
    root.innerHTML=`<div class="modal-backdrop canva-modal-backdrop offline-library-backdrop" data-offline-close="1"><div class="dialog canva-dialog wide offline-library-dialog"><div class="dialog-head canva-dialog-head"><div><span class="modal-eyebrow">SUBJECT OFFLINE PACK</span><h2>${esc(pack?.title||pack?.packId||'Offline pack')}</h2></div><button class="btn sm" data-offline-action="close">Đóng</button></div><div class="dialog-body canva-dialog-body offline-library-body"><section class="offline-pack-head panel"><div><button class="btn sm" data-offline-action="refresh">← Thư viện</button><span class="pill green">${esc(pack?.metadata?.mode||'pack')}</span><h3>${items.length} tài nguyên · ${formatBytes(pack?.bytes)}</h3><p>JSON chỉ nằm trong pack khi bạn chủ động tạo/cập nhật gói; hệ thống không precache cả kho.</p></div></section><div class="offline-file-list">${items.map((item,index)=>`<div class="offline-file-row"><i>${String(index+1).padStart(2,'0')}</i><span><b>${esc(new URL(item.url).pathname.split('/').pop()||item.url)}</b><small>${esc(new URL(item.url).pathname)} · ${formatBytes(item.bytes)}</small></span><em>${esc(item.contentType||'resource')}</em></div>`).join('')||'<div class="panel offline-empty">Pack chưa có tài nguyên.</div>'}</div>${skipped.length?`<section class="panel offline-empty"><b>${skipped.length} tài nguyên lớn chưa tự lưu</b><span>${skipped.map(item=>`${esc(new URL(item.url).pathname)} (${formatBytes(item.bytes)})`).join('<br>')}</span></section>`:''}${failed.length?`<section class="panel offline-empty"><b>${failed.length} tài nguyên tải lỗi</b><span>Có thể cập nhật lại pack khi mạng ổn định.</span></section>`:''}</div></div></div>`;
  }

  function subjectOptions(){
    const subjects=Object.values(global.state?.subjects||{}).filter(subject=>subject.mainPath);
    return subjects.map(subject=>`<option value="${esc(subject.id)}" ${subject.id===global.state?.subject?'selected':''}>${esc(subject.name||subject.id)}</option>`).join('');
  }

  function injectControls(){
    const actions=document.querySelector('.offline-library-actions');
    if(!actions||document.querySelector('.offline-subject-pack-controls'))return;
    const section=document.createElement('section');
    section.className='panel offline-subject-pack-controls';
    section.innerHTML=`<div><span class="pill purple">MÔN HỌC OFFLINE</span><h3>Giữ đúng phần bạn sẽ học</h3><p>Gói nền chỉ lấy tài nguyên startup dưới 5 MB. Nếu cần Vocab/Tests/Math legacy lớn, mở chức năng đó trong môn rồi lưu “phiên đang học”.</p></div><div class="offline-subject-pack-actions"><select class="field" id="offlineSubjectSelect">${subjectOptions()}</select><button class="btn primary" data-offline-pack-action="prepare-base">Giữ môn offline</button><button class="btn" data-offline-pack-action="capture-session">Lưu phiên môn đang mở</button></div>`;
    actions.insertAdjacentElement('afterend',section);
  }

  const observer=new MutationObserver(()=>injectControls());
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>observer.observe(document.getElementById('modalRoot'),{childList:true,subtree:true}),{once:true});
  else if(document.getElementById('modalRoot'))observer.observe(document.getElementById('modalRoot'),{childList:true,subtree:true});

  document.addEventListener('click',event=>{
    const packAction=event.target.closest?.('[data-offline-pack-action]');
    if(packAction){
      event.preventDefault();
      const action=packAction.dataset.offlinePackAction;
      if(action==='prepare-base')prepareBase(document.getElementById('offlineSubjectSelect')?.value||global.state?.subject).catch(error=>global.toast?.(String(error?.message||error)));
      if(action==='capture-session')captureCurrentSession().catch(error=>global.toast?.(String(error?.message||error)));
      return;
    }

    const target=event.target.closest?.('[data-offline-action]');
    if(!target)return;
    const id=target.dataset.packId||'';
    if(!id.startsWith('subject-'))return;
    if(target.dataset.offlineAction==='open-pack'){
      event.preventDefault();event.stopImmediatePropagation();
      packRecord(id).then(renderPack).catch(error=>global.toast?.(String(error?.message||error)));
    }
    if(target.dataset.offlineAction==='remove-pack'){
      event.preventDefault();event.stopImmediatePropagation();
      removePack(id).catch(error=>global.toast?.(String(error?.message||error)));
    }
  },true);

  global.BaumanOfflineSubjectPackManager={
    release:RELEASE,
    cacheName:CACHE_NAME,
    prepareBase,
    captureCurrentSession,
    saveSubjectPack,
    removePack,
    frameResources,
    selfCheck(){return {ok:supported(),release:RELEASE,cacheStorage:!!global.caches,library:!!lib(),baseMaxResourceBytes:BASE_MAX_RESOURCE,sessionMaxResourceBytes:SESSION_MAX_RESOURCE};}
  };
})(window);
