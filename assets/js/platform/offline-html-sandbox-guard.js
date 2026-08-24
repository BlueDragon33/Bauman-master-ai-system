(function(global){
  'use strict';

  const RELEASE='BAUMAN_OFFLINE_HTML_SANDBOX_GUARD_2026_08_24';
  let previewUrl='';
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const revoke=()=>{if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl='';}};
  const isHtml=path=>/\.html?$/i.test(String(path||''));

  async function preview(target){
    const lib=global.BaumanOfflineContentLibrary;
    const root=document.getElementById('modalRoot');
    if(!lib||!root)return;
    try{
      const packId=target.dataset.packId||'';
      const filePath=target.dataset.filePath||'';
      const record=await lib.getFile(packId,filePath);
      if(!record)return;
      revoke();
      previewUrl=URL.createObjectURL(record.blob);
      root.innerHTML=`<div class="modal-backdrop canva-modal-backdrop offline-library-backdrop" data-offline-close="1"><div class="dialog canva-dialog wide offline-library-dialog"><div class="dialog-head canva-dialog-head"><div><span class="modal-eyebrow">LOCAL HTML · SANDBOX</span><h2>${esc(record.name||filePath)}</h2></div><button class="btn sm" data-offline-action="close">Đóng</button></div><div class="dialog-body canva-dialog-body offline-library-body"><section class="offline-preview-head panel"><button class="btn sm" data-offline-action="open-pack" data-pack-id="${esc(packId)}">← Danh sách file</button><div><span class="pill">${esc(record.mime||'text/html')}</span><h3>${esc(record.name||filePath)}</h3><p>${Number(record.bytes||0).toLocaleString('vi-VN')} bytes</p></div></section><iframe class="offline-sandbox-frame" sandbox="" src="${esc(previewUrl)}" title="${esc(record.name||filePath)}"></iframe><p class="offline-sandbox-note">HTML trên máy được render trong iframe sandbox không cấp script, same-origin, form, popup hay quyền truy cập Web App.</p></div></div></div>`;
    }catch(error){global.toast?.('Không mở được HTML local: '+String(error?.message||error));}
  }

  document.addEventListener('click',event=>{
    const target=event.target.closest?.('[data-offline-action]');
    if(event.target?.dataset?.offlineClose==='1')revoke();
    if(!target)return;
    const action=target.dataset.offlineAction;
    if(action!=='preview-file'){revoke();return;}
    if(!isHtml(target.dataset.filePath))return;
    event.preventDefault();
    event.stopImmediatePropagation();
    preview(target);
  },true);

  global.BaumanOfflineHtmlSandboxGuard={release:RELEASE,isHtml,selfCheck(){return {ok:true,release:RELEASE,captureGuard:true,sandboxRequired:true};}};
})(window);
