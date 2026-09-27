/* UI-E12/E13/E16 · Universal Resource Viewer runtime */
(function(){
  'use strict';
  const renderers=new Map();
  const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const noteKey=id=>'bauman.resource.note.'+String(id||'resource');
  const bookmarkKey=id=>'bauman.resource.bookmark.'+String(id||'resource');
  function button(label,action,primary=false){return '<button type="button" class="bui-button '+(primary?'bui-button--primary':'')+'" data-rv-action="'+action+'">'+label+'</button>'}
  function defaultRenderer(resource){
    const type=resource.type||'url',src=safe(resource.src||resource.url||'');
    if(type==='image')return '<img src="'+src+'" alt="'+safe(resource.alt||resource.title||'Tài nguyên hình ảnh')+'">';
    if(type==='video')return '<video src="'+src+'" controls preload="metadata"></video>';
    if(type==='audio')return '<audio src="'+src+'" controls preload="metadata"></audio>';
    if(type==='pdf')return '<div class="bui-error-state"><h3>PDF renderer chuyên dụng chưa được nạp</h3><p>ResourceViewer giữ layout chuẩn; khi PDF.js adapter được đăng ký, tìm kiếm, zoom, thumbnail, bookmark và highlight sẽ hoạt động trong cùng shell.</p>'+button('Mở PDF ở tab mới','external',true)+'</div>';
    return '<iframe src="'+src+'" title="'+safe(resource.title||'Tài nguyên')+'" loading="lazy" referrerpolicy="no-referrer"></iframe>';
  }
  function toolbar(resource){
    const common=[button('Đóng','close'),button('Toàn màn hình','fullscreen'),button('Ghi chú','note'),button('Đánh dấu','bookmark')];
    const contextual=[];
    if(resource.type==='video')contextual.push(button('Tốc độ','speed'));
    if(resource.type==='audio')contextual.push(button('Tốc độ','speed'));
    if(resource.type==='pdf')contextual.push(button('Thumbnail','thumbs'),button('Tìm','search'),button('Thu phóng','zoom'));
    if(['url','html','simulation'].includes(resource.type))contextual.push(button('Tải lại','reload'));
    return common.concat(contextual).join('');
  }
  function open(resource={}){
    close();
    const id=resource.id||resource.src||resource.url||Date.now(),type=resource.type||'url';
    const root=document.createElement('div');root.className='bui-resource-viewer';root.dataset.buiResourceViewer='1';root.dataset.resourceType=type;
    const renderer=renderers.get(type)||defaultRenderer;
    let note='';try{note=localStorage.getItem(noteKey(id))||''}catch{}
    root.innerHTML='<header class="bui-resource-viewer__header">'+
      '<button type="button" class="bui-button bui-button--quiet" data-rv-action="close" aria-label="Đóng Resource Viewer">←</button>'+
      '<div class="bui-resource-viewer__title"><b>'+safe(resource.title||'Tài nguyên')+'</b><small>'+safe(resource.subtitle||type.toUpperCase())+'</small></div>'+
      '<div class="bui-resource-viewer__toolbar">'+toolbar(resource)+'</div></header>'+
      '<div class="bui-resource-viewer__body"><main class="bui-resource-viewer__stage">'+renderer(resource)+'</main>'+
      '<aside class="bui-resource-viewer__rail"><section><span class="bui-resource-viewer__status">Sẵn sàng</span><h3>Ngữ cảnh</h3><p>'+safe(resource.description||'Tài nguyên học tập trong Bauman Master Hub.')+'</p></section>'+
      '<section><h3>Ghi chú</h3><textarea data-rv-note placeholder="Ghi chú theo tài nguyên...">'+safe(note)+'</textarea></section>'+
      '<section><h3>Tiến độ</h3><div class="bui-progress"><span style="width:'+Math.max(0,Math.min(100,Number(resource.progress)||0))+'%"></span></div></section></aside></div>';
    document.body.appendChild(root);document.body.dataset.buiResourceOpen='1';
    root.addEventListener('click',e=>{const a=e.target.closest('[data-rv-action]')?.dataset.rvAction;if(a)action(a,resource,id,root)});
    root.querySelector('[data-rv-note]')?.addEventListener('input',e=>{try{localStorage.setItem(noteKey(id),e.target.value)}catch{}});
    root.querySelector('[data-rv-note]')?.addEventListener('keydown',e=>e.stopPropagation());
    return root;
  }
  function action(name,resource,id,root){
    if(name==='close')return close();
    if(name==='fullscreen')return document.fullscreenElement?document.exitFullscreen?.():root.requestFullscreen?.();
    if(name==='reload'){const f=root.querySelector('iframe');if(f){const src=f.src;f.src='about:blank';requestAnimationFrame(()=>f.src=src)}}
    if(name==='external'&&resource.src)window.open(resource.src,'_blank','noopener');
    if(name==='bookmark'){let next=true;try{next=localStorage.getItem(bookmarkKey(id))!=='1';localStorage.setItem(bookmarkKey(id),next?'1':'0')}catch{};toast(next?'Đã đánh dấu tài nguyên':'Đã bỏ đánh dấu')}
    if(name==='note')root.querySelector('[data-rv-note]')?.focus();
    if(name==='speed'){const media=root.querySelector('video,audio');if(media){const seq=[1,1.25,1.5,1.75,2],i=seq.indexOf(media.playbackRate);media.playbackRate=seq[(i+1)%seq.length];toast('Tốc độ '+media.playbackRate+'×')}}
    if(['thumbs','search','zoom'].includes(name)&&resource.type==='pdf')toast('Tính năng PDF sẽ bật khi PDF.js adapter được đăng ký.');
  }
  function toast(message){if(window.toast)try{return window.toast(message)}catch{};const n=document.createElement('div');n.className='bui-badge bui-badge--info';n.textContent=message;n.style.cssText='position:fixed;right:16px;bottom:16px;z-index:130';document.body.appendChild(n);setTimeout(()=>n.remove(),1800)}
  function close(){document.querySelector('[data-bui-resource-viewer]')?.remove();if(document.body)document.body.dataset.buiResourceOpen='0'}
  function register(type,renderer){if(!type||typeof renderer!=='function')return false;renderers.set(String(type),renderer);return true}
  function boot(){
    if(!window.BaumanUI)return;
    window.BaumanUI.resource={open,close,register,types:()=>['image','video','audio','pdf','url','html','simulation',...renderers.keys()]};
    window.BaumanUI.commands?.register({id:'resource.close',label:'Đóng Resource Viewer',group:'Tài nguyên',icon:'←',run:close});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
