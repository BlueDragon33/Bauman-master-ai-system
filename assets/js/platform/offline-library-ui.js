(function(global){
  'use strict';

  const RELEASE='BAUMAN_OFFLINE_LIBRARY_UI_2026_08_24';
  let previewUrl='';
  let busy=false;

  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const lib=()=>global.BaumanOfflineContentLibrary;
  const formatBytes=bytes=>{
    const n=Number(bytes)||0;
    if(n<1024)return n+' B';
    if(n<1024*1024)return (n/1024).toFixed(1)+' KB';
    if(n<1024*1024*1024)return (n/1024/1024).toFixed(1)+' MB';
    return (n/1024/1024/1024).toFixed(2)+' GB';
  };

  function revokePreview(){if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl='';}}

  function modalRoot(){return document.getElementById('modalRoot');}
  function close(){revokePreview();const root=modalRoot();if(root)root.innerHTML='';}

  function shell(body){
    const root=modalRoot();
    if(!root)return;
    root.innerHTML=`<div class="modal-backdrop canva-modal-backdrop offline-library-backdrop" data-offline-close="1"><div class="dialog canva-dialog wide offline-library-dialog"><div class="dialog-head canva-dialog-head"><div><span class="modal-eyebrow">Bauman · ИУ-5 · 09.04.01/11</span><h2>📦 Offline Library</h2></div><button class="btn sm" data-offline-action="close">Đóng</button></div><div class="dialog-body canva-dialog-body offline-library-body">${body}</div></div></div>`;
  }

  function statusCard(estimate,packs){
    const quota=estimate?.quota||0,usage=estimate?.usage||0;
    const pct=quota?Math.min(100,Math.round(usage*100/quota)):0;
    return `<section class="offline-library-status panel"><div><span class="pill green">OFFLINE-FIRST</span><h3>Nội dung trên máy</h3><p>Lộ trình và nội dung đã giữ offline mở được khi mạng/VPN không dùng được. Học liệu lớn chỉ tải khi bạn chọn.</p></div><aside><b>${packs.length}</b><span>gói offline</span><small>${formatBytes(usage)} / ${quota?formatBytes(quota):'quota trình duyệt'}</small><i><u style="width:${pct}%"></u></i></aside></section>`;
  }

  function actions(){
    return `<section class="offline-library-actions"><button class="offline-library-action" data-offline-action="choose-files"><span>📄</span><b>Mở file đã tải</b><small>JSON, PDF, HTML, Markdown, ảnh, audio/video</small></button><button class="offline-library-action" data-offline-action="choose-directory"><span>📁</span><b>Mở thư mục tài liệu</b><small>Nhập cả thư mục vào IndexedDB để đọc lại offline</small></button><button class="offline-library-action" data-offline-action="cache-roadmap"><span>🧭</span><b>Giữ Roadmap V3 offline</b><small>Manifest rất nhỏ, không kéo theo học liệu nặng</small></button></section>`;
  }

  function packCards(packs){
    if(!packs.length)return '<div class="panel offline-empty"><b>Chưa có gói offline</b><span>Bạn có thể mở file/thư mục đã tải hoặc giữ từng nội dung khi cần.</span></div>';
    return packs.map(pack=>`<article class="panel offline-pack-card"><div><span>${esc(pack.source==='local-file'?'LOCAL FILE':'OFFLINE PACK')}</span><h4>${esc(pack.title||pack.packId)}</h4><p>${esc(pack.subjectId||'Bauman Library')}</p></div><dl><div><dt>File</dt><dd>${Number(pack.fileCount)||0}</dd></div><div><dt>Dung lượng</dt><dd>${formatBytes(pack.bytes)}</dd></div></dl><div class="offline-pack-buttons"><button class="btn sm" data-offline-action="open-pack" data-pack-id="${esc(pack.packId)}">Mở</button><button class="btn sm" data-offline-action="remove-pack" data-pack-id="${esc(pack.packId)}">Xóa bản offline</button></div></article>`).join('');
  }

  async function open(){
    if(!lib()?.supported?.()){
      shell('<section class="panel offline-empty"><b>Trình duyệt chưa hỗ trợ IndexedDB</b><span>Offline Library không thể hoạt động an toàn trên trình duyệt này.</span></section>');
      return;
    }
    shell('<section class="panel offline-empty">Đang đọc thư viện trên máy…</section>');
    try{
      const [packs,estimate]=await Promise.all([lib().listPacks(),lib().estimate()]);
      shell(`${statusCard(estimate,packs)}${actions()}<section class="offline-library-list-head"><div><h3>Gói đã lưu</h3><p>Chỉ những gì bạn chủ động giữ offline mới nằm ở đây.</p></div><button class="btn sm" data-offline-action="refresh">↻ Cập nhật</button></section><div class="offline-pack-grid">${packCards(packs)}</div>`);
    }catch(error){shell(`<section class="panel offline-empty"><b>Không đọc được Offline Library</b><span>${esc(error?.message||error)}</span></section>`);}
  }

  async function importFiles(directory=false){
    if(busy)return;busy=true;
    try{
      const result=directory
        ? await lib().importChosenDirectory({packId:'local-'+Date.now(),title:'Thư mục tài liệu trên máy'})
        : await lib().importChosenFiles({packId:'local-'+Date.now(),title:'Tài liệu đã tải',multiple:true});
      global.toast?.(`Đã đưa ${result.fileCount} file vào Offline Library`);
      await open();
    }catch(error){
      if(error?.name!=='AbortError')global.toast?.('Không nhập được tài liệu: '+String(error?.message||error));
    }finally{busy=false;}
  }

  async function cacheRoadmap(){
    if(busy)return;busy=true;
    try{
      const source='assets/data/roadmap/iu5-090401-11-v3.json';
      await lib().cacheUrl('bauman-roadmap-core',source,'iu5-090401-11-v3.json',{version:'3.0.0',subjectId:'roadmap',title:'Roadmap ИУ-5 · 09.04.01/11'});
      global.toast?.('Đã giữ Roadmap V3 để mở offline');
      await open();
    }catch(error){global.toast?.('Không lưu được Roadmap: '+String(error?.message||error));}
    finally{busy=false;}
  }

  async function openPack(packId){
    revokePreview();
    try{
      const files=await lib().listFiles(packId);
      const rows=files.sort((a,b)=>a.relativePath.localeCompare(b.relativePath)).map((file,index)=>`<button class="offline-file-row" data-offline-action="preview-file" data-pack-id="${esc(packId)}" data-file-path="${esc(file.relativePath)}"><i>${String(index+1).padStart(2,'0')}</i><span><b>${esc(file.name||file.relativePath)}</b><small>${esc(file.relativePath)} · ${formatBytes(file.bytes)}</small></span><em>${esc(file.mime||'file')}</em></button>`).join('');
      shell(`<section class="offline-pack-head panel"><div><button class="btn sm" data-offline-action="refresh">← Thư viện</button><span class="pill">LOCAL / OFFLINE</span><h3>${esc(packId)}</h3><p>${files.length} file · ${formatBytes(files.reduce((sum,f)=>sum+Number(f.bytes||0),0))}</p></div></section><div class="offline-file-list">${rows||'<div class="panel offline-empty">Gói này chưa có file.</div>'}</div>`);
    }catch(error){global.toast?.('Không mở được gói: '+String(error?.message||error));}
  }

  function textPreview(text,mime,name){
    const max=300000;
    const clipped=String(text||'').slice(0,max);
    const truncated=String(text||'').length>max;
    return `<section class="offline-preview-text"><pre>${esc(clipped)}</pre>${truncated?'<p>Đã giới hạn preview 300.000 ký tự để tránh giật lag.</p>':''}</section>`;
  }

  async function previewFile(packId,relativePath){
    revokePreview();
    try{
      const record=await lib().getFile(packId,relativePath);
      if(!record)return global.toast?.('Không tìm thấy file offline');
      const mime=String(record.mime||'').toLowerCase();
      const name=String(record.name||relativePath);
      let preview='';
      if(mime.includes('json')||name.toLowerCase().endsWith('.json')){
        if(record.bytes>16*1024*1024){
          preview='<section class="panel offline-empty"><b>JSON quá lớn để preview trực tiếp</b><span>File vẫn được giữ offline. Hãy mở qua module môn học có pagination/lazy loader.</span></section>';
        }else{
          const raw=await record.blob.text();
          let pretty=raw;try{pretty=JSON.stringify(JSON.parse(raw),null,2);}catch(_){ }
          preview=textPreview(pretty,mime,name);
        }
      }else if(mime.startsWith('text/')||/\.(?:txt|md|csv|log)$/i.test(name)){
        preview=textPreview(await record.blob.text(),mime,name);
      }else if(mime==='text/html'||/\.html?$/i.test(name)){
        previewUrl=URL.createObjectURL(record.blob);
        preview=`<iframe class="offline-sandbox-frame" sandbox="" src="${esc(previewUrl)}" title="${esc(name)}"></iframe><p class="offline-sandbox-note">HTML local được mở trong sandbox, script và quyền truy cập app bị chặn.</p>`;
      }else if(mime==='application/pdf'||/\.pdf$/i.test(name)){
        previewUrl=URL.createObjectURL(record.blob);
        preview=`<iframe class="offline-sandbox-frame" src="${esc(previewUrl)}" title="${esc(name)}"></iframe>`;
      }else if(mime.startsWith('image/')){
        previewUrl=URL.createObjectURL(record.blob);preview=`<div class="offline-media-preview"><img src="${esc(previewUrl)}" alt="${esc(name)}"></div>`;
      }else if(mime.startsWith('audio/')){
        previewUrl=URL.createObjectURL(record.blob);preview=`<div class="offline-media-preview"><audio controls preload="metadata" src="${esc(previewUrl)}"></audio></div>`;
      }else if(mime.startsWith('video/')){
        previewUrl=URL.createObjectURL(record.blob);preview=`<div class="offline-media-preview"><video controls preload="metadata" src="${esc(previewUrl)}"></video></div>`;
      }else{
        preview='<section class="panel offline-empty"><b>Đã lưu file</b><span>Định dạng này chưa có preview trong Web App.</span></section>';
      }
      shell(`<section class="offline-preview-head panel"><button class="btn sm" data-offline-action="open-pack" data-pack-id="${esc(packId)}">← Danh sách file</button><div><span class="pill">${esc(record.mime||'file')}</span><h3>${esc(name)}</h3><p>${formatBytes(record.bytes)}</p></div></section>${preview}`);
    }catch(error){global.toast?.('Không preview được file: '+String(error?.message||error));}
  }

  async function removePack(packId){
    if(busy)return;busy=true;
    try{const result=await lib().removePack(packId);global.toast?.(`Đã xóa ${result.removedFiles} file offline`);await open();}
    catch(error){global.toast?.('Không xóa được gói: '+String(error?.message||error));}
    finally{busy=false;}
  }

  function installButton(){
    const actions=document.querySelector('.top-actions');
    if(!actions||document.getElementById('offlineLibraryBtn'))return;
    const button=document.createElement('button');
    button.className='btn offline-library-trigger';
    button.id='offlineLibraryBtn';
    button.type='button';
    button.textContent='📦 Offline';
    button.title='Tài liệu và gói học offline';
    const ai=document.getElementById('aiBtn');
    if(ai)actions.insertBefore(button,ai);else actions.appendChild(button);
    button.addEventListener('click',open);
  }

  document.addEventListener('click',event=>{
    if(event.target.dataset.offlineClose==='1'){close();return;}
    const target=event.target.closest('[data-offline-action]');
    if(!target)return;
    const action=target.dataset.offlineAction;
    if(action==='close')close();
    if(action==='refresh')open();
    if(action==='choose-files')importFiles(false);
    if(action==='choose-directory')importFiles(true);
    if(action==='cache-roadmap')cacheRoadmap();
    if(action==='open-pack')openPack(target.dataset.packId);
    if(action==='preview-file')previewFile(target.dataset.packId,target.dataset.filePath);
    if(action==='remove-pack')removePack(target.dataset.packId);
  });

  function install(){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installButton,{once:true});
    else installButton();
  }

  global.BaumanOfflineLibraryUI={release:RELEASE,open,close,install,selfCheck(){return {ok:!!lib()&&typeof lib().listPacks==='function',release:RELEASE,button:!!document.getElementById('offlineLibraryBtn'),library:lib()?.selfCheck?.()||null};}};
  install();
})(window);
