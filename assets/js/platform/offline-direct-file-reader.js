(function(global){
  'use strict';

  const RELEASE='BAUMAN_OFFLINE_DIRECT_FILE_READER_2026_08_24';
  const TEXT_PREVIEW_BYTES=300000;
  let objectUrl='';

  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const formatBytes=bytes=>{const n=Number(bytes)||0;if(n<1024)return `${n} B`;if(n<1024*1024)return `${(n/1024).toFixed(1)} KB`;if(n<1024*1024*1024)return `${(n/1024/1024).toFixed(1)} MB`;return `${(n/1024/1024/1024).toFixed(2)} GB`;};

  function revoke(){if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl='';}}
  function modalRoot(){return document.getElementById('modalRoot');}

  function shell(file,body,note=''){
    const root=modalRoot();
    if(!root)return;
    root.innerHTML=`<div class="modal-backdrop canva-modal-backdrop offline-library-backdrop" data-direct-local-close="1"><div class="dialog canva-dialog wide offline-library-dialog"><div class="dialog-head canva-dialog-head"><div><span class="modal-eyebrow">LOCAL FILE · KHÔNG SAO CHÉP</span><h2>${esc(file.name||'Tài liệu trên máy')}</h2></div><button class="btn sm" data-direct-local-action="close">Đóng</button></div><div class="dialog-body canva-dialog-body offline-library-body"><section class="offline-preview-head panel"><div><span class="pill green">Đọc trực tiếp</span><h3>${esc(file.name||'file')}</h3><p>${esc(file.type||'file')} · ${formatBytes(file.size)}</p></div></section>${body}${note?`<p class="offline-sandbox-note">${esc(note)}</p>`:''}</div></div></div>`;
  }

  async function textPreview(file){
    const clipped=file.slice(0,Math.min(file.size,TEXT_PREVIEW_BYTES));
    const text=await clipped.text();
    const truncated=file.size>TEXT_PREVIEW_BYTES;
    return `<section class="offline-preview-text"><pre>${esc(text)}</pre>${truncated?`<p>Preview chỉ đọc ${formatBytes(TEXT_PREVIEW_BYTES)} đầu file để tránh giật lag. File gốc không bị sao chép.</p>`:''}</section>`;
  }

  async function previewFile(file){
    if(!(file instanceof Blob))throw new Error('File không hợp lệ');
    revoke();
    const name=String(file.name||'local-file');
    const mime=String(file.type||'').toLowerCase();
    let body='',note='';

    if(mime==='text/html'||/\.html?$/i.test(name)){
      objectUrl=URL.createObjectURL(file);
      body=`<iframe class="offline-sandbox-frame" sandbox="" src="${esc(objectUrl)}" title="${esc(name)}"></iframe>`;
      note='HTML local chạy trong sandbox không cấp quyền script hay truy cập Web App.';
    }else if(mime==='application/pdf'||/\.pdf$/i.test(name)){
      objectUrl=URL.createObjectURL(file);
      body=`<iframe class="offline-sandbox-frame" src="${esc(objectUrl)}" title="${esc(name)}"></iframe>`;
    }else if(mime.startsWith('image/')){
      objectUrl=URL.createObjectURL(file);
      body=`<div class="offline-media-preview"><img src="${esc(objectUrl)}" alt="${esc(name)}"></div>`;
    }else if(mime.startsWith('audio/')){
      objectUrl=URL.createObjectURL(file);
      body=`<div class="offline-media-preview"><audio controls preload="metadata" src="${esc(objectUrl)}"></audio></div>`;
    }else if(mime.startsWith('video/')){
      objectUrl=URL.createObjectURL(file);
      body=`<div class="offline-media-preview"><video controls preload="metadata" src="${esc(objectUrl)}"></video></div>`;
    }else if(mime.startsWith('text/')||/\.(?:txt|md|csv|log|json|py|js|ts|c|cpp|h|hpp|java|sql|yaml|yml)$/i.test(name)){
      body=await textPreview(file);
      note=file.size>TEXT_PREVIEW_BYTES?'Không parse toàn bộ file lớn trong chế độ đọc nhanh.':'';
    }else{
      body='<section class="panel offline-empty"><b>File đã được chọn</b><span>Định dạng này chưa có trình xem tích hợp. File vẫn nằm nguyên trên máy và không được sao chép vào Web App.</span></section>';
    }
    shell(file,body,note);
    return {name,size:Number(file.size)||0,mime,objectUrl:!!objectUrl,truncated:file.size>TEXT_PREVIEW_BYTES};
  }

  async function chooseFile(){
    if(typeof global.showOpenFilePicker==='function'){
      const handles=await global.showOpenFilePicker({multiple:false});
      if(!handles?.length)return null;
      return handles[0].getFile();
    }
    return new Promise((resolve,reject)=>{
      const input=document.createElement('input');
      input.type='file';
      input.style.display='none';
      document.body.appendChild(input);
      input.onchange=()=>{const file=input.files?.[0]||null;input.remove();resolve(file);};
      input.onerror=()=>{input.remove();reject(new Error('Không mở được file picker'));};
      input.click();
    });
  }

  async function openPicker(){
    const file=await chooseFile();
    if(file)await previewFile(file);
  }

  function inject(){
    const actions=document.querySelector('.offline-library-actions');
    if(!actions||actions.querySelector('[data-direct-local-action="open-file"]'))return;
    const button=document.createElement('button');
    button.className='offline-library-action';
    button.dataset.directLocalAction='open-file';
    button.innerHTML='<span>🖥️</span><b>Đọc trực tiếp từ máy</b><small>Không sao chép vào IndexedDB · hợp PDF/video/file lớn</small>';
    actions.insertBefore(button,actions.firstChild);
  }

  document.addEventListener('click',event=>{
    if(event.target.dataset.directLocalClose==='1'){revoke();modalRoot().innerHTML='';return;}
    const target=event.target.closest?.('[data-direct-local-action]');
    if(!target)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if(target.dataset.directLocalAction==='open-file')openPicker().catch(error=>{if(error?.name!=='AbortError')global.toast?.(String(error?.message||error));});
    if(target.dataset.directLocalAction==='close'){revoke();if(modalRoot())modalRoot().innerHTML='';}
  },true);

  const observer=new MutationObserver(inject);
  function install(){
    const root=modalRoot();
    if(root)observer.observe(root,{childList:true,subtree:true});
    inject();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  global.addEventListener('pagehide',revoke,{passive:true});

  global.BaumanOfflineDirectFileReader={release:RELEASE,previewFile,openPicker,revoke,selfCheck(){return {ok:typeof File!=='undefined'&&typeof Blob!=='undefined',release:RELEASE,textPreviewBytes:TEXT_PREVIEW_BYTES,stored:false};}};
})(window);
