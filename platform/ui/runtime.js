/* BAUMAN FUTURE INTERFACE SYSTEM · Core Runtime
   Framework-free, dependency-free, progressive enhancement. */
(function(){
  'use strict';
  if(window.BaumanUI?.version)return;
  const VERSION='BFIS-E1-E10-20260927';
  const commandMap=new Map(),slotMap=new Map();
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function boot(){
    document.body?.setAttribute('data-bui','1');
    bindFocusMode();
    bindCommandPalette();
    registerDefaultCommands();
    document.documentElement.dataset.buiReady='1';
    document.dispatchEvent(new CustomEvent('bauman-ui-ready',{detail:{version:VERSION}}));
  }

  function setFocusMode(next){
    const on=typeof next==='boolean'?next:document.body.dataset.buiFocus!=='1';
    document.body.dataset.buiFocus=on?'1':'0';
    try{localStorage.setItem('bauman.ui.focus',on?'1':'0')}catch{}
    document.dispatchEvent(new CustomEvent('bauman-ui-focus',{detail:{active:on}}));
    return on;
  }
  function bindFocusMode(){
    let saved='0';try{saved=localStorage.getItem('bauman.ui.focus')||'0'}catch{}
    document.body.dataset.buiFocus=saved==='1'?'1':'0';
    document.addEventListener('keydown',e=>{
      if(e.altKey&&!e.ctrlKey&&!e.metaKey&&e.key.toLowerCase()==='f'){e.preventDefault();setFocusMode()}
    });
  }

  function registerCommand(cmd){
    if(!cmd||!cmd.id||!cmd.label||typeof cmd.run!=='function')return false;
    commandMap.set(String(cmd.id),{group:'Hành động',keywords:'',icon:'⌘',...cmd});
    return true;
  }
  function unregisterCommand(id){return commandMap.delete(String(id))}
  function registerDefaultCommands(){
    registerCommand({id:'focus.toggle',label:'Bật / tắt Focus Mode',group:'Giao diện',keywords:'focus tập trung',icon:'◉',run:()=>setFocusMode()});
    const pageMap=[['home','Tổng quan'],['roadmap','Lộ trình'],['subjects','Môn học'],['schedule','Lịch học'],['research','Luận văn']];
    pageMap.forEach(([id,label])=>registerCommand({id:'nav.'+id,label:'Mở '+label,group:'Điều hướng',icon:'→',keywords:label.toLowerCase(),run:()=>{
      if(window.app?.page)window.app.page(id); else q('[data-page="'+id+'"]')?.click();
    }}));
  }

  function paletteMarkup(){
    return '<div class="bui-command-backdrop" data-bui-command-backdrop role="presentation">'+
      '<section class="bui-command" role="dialog" aria-modal="true" aria-label="Command Palette">'+
        '<div class="bui-command__input-wrap"><span aria-hidden="true">⌕</span><input class="bui-command__input" data-bui-command-input autocomplete="off" placeholder="Tìm chức năng, môn học, tài nguyên..."><kbd class="bui-command__kbd">Esc</kbd></div>'+
        '<div class="bui-command__list" data-bui-command-list role="listbox"></div>'+
      '</section></div>';
  }
  function ensurePalette(){
    let root=q('[data-bui-command-root]');
    if(root)return root;
    root=document.createElement('div');root.dataset.buiCommandRoot='1';root.hidden=true;root.innerHTML=paletteMarkup();document.body.appendChild(root);
    root.addEventListener('click',e=>{
      if(e.target.matches('[data-bui-command-backdrop]'))closePalette();
      const item=e.target.closest('[data-bui-command-id]');if(item){runCommand(item.dataset.buiCommandId);closePalette()}
    });
    q('[data-bui-command-input]',root).addEventListener('input',renderCommands);
    return root;
  }
  function commandSearchRows(term=''){
    const t=String(term).trim().toLowerCase();
    const commands=[...commandMap.values()].filter(c=>!t||[c.label,c.group,c.keywords].join(' ').toLowerCase().includes(t));
    if(t){
      qa('a[href],button').forEach((el,i)=>{
        const text=(el.textContent||el.getAttribute('aria-label')||'').trim();
        if(text&&text.length<90&&text.toLowerCase().includes(t)){
          const id='dom.'+i+'.'+text.slice(0,16);
          if(!commands.some(c=>c.id===id))commands.push({id,label:text,group:'Trong trang',icon:'↳',run:()=>el.click()});
        }
      });
    }
    return commands.slice(0,40);
  }
  function renderCommands(){
    const root=ensurePalette(),input=q('[data-bui-command-input]',root),list=q('[data-bui-command-list]',root),rows=commandSearchRows(input?.value||'');
    let current='';
    list.innerHTML=rows.map(c=>{
      const group=c.group||'Hành động',head=group!==current?'<div class="bui-command__group">'+safe(group)+'</div>':'';
      current=group;
      return head+'<button class="bui-command__item" type="button" role="option" data-bui-command-id="'+safe(c.id)+'"><span aria-hidden="true">'+safe(c.icon||'⌘')+'</span><span><b>'+safe(c.label)+'</b>'+(c.description?'<small>'+safe(c.description)+'</small>':'')+'</span><span aria-hidden="true">↵</span></button>';
    }).join('')||'<div class="bui-empty"><h3>Không tìm thấy</h3><p>Thử tên môn, chức năng hoặc hành động khác.</p></div>';
  }
  function openPalette(seed=''){
    const root=ensurePalette();root.hidden=false;
    const input=q('[data-bui-command-input]',root);input.value=seed;renderCommands();requestAnimationFrame(()=>input.focus());
    document.body.dataset.buiCommand='1';
  }
  function closePalette(){const root=q('[data-bui-command-root]');if(root)root.hidden=true;document.body.dataset.buiCommand='0'}
  function runCommand(id){const cmd=commandMap.get(id);if(cmd){cmd.run();return true}return false}
  function bindCommandPalette(){
    document.addEventListener('keydown',e=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openPalette()}
      if(e.key==='Escape'&&document.body.dataset.buiCommand==='1'){e.preventDefault();closePalette()}
    });
  }

  function registerSlot(name,element){
    if(!name||!element)return false;slotMap.set(String(name),element);return true;
  }
  function resolveSlot(name){return slotMap.get(String(name))||q('[data-bui-slot="'+CSS.escape(String(name))+'"]')}
  function mountSlot(name,node){const target=resolveSlot(name);if(!target||!node)return false;target.replaceChildren(node);return true}

  window.BaumanUI={
    version:VERSION,
    focus:{set:setFocusMode,toggle:()=>setFocusMode(),get:()=>document.body?.dataset.buiFocus==='1'},
    commands:{register:registerCommand,unregister:unregisterCommand,open:openPalette,close:closePalette,run:runCommand,list:()=>[...commandMap.values()]},
    slots:{register:registerSlot,resolve:resolveSlot,mount:mountSlot},
    ready:()=>document.documentElement.dataset.buiReady==='1'
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
