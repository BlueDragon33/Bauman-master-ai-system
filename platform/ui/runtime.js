/* BAUMAN FUTURE INTERFACE SYSTEM · Core Runtime
   Framework-free, dependency-free, progressive enhancement. */
(function(){
  'use strict';
  if(window.BaumanUI?.version)return;
  const VERSION='BFIS-E1-E10-20260927';
  const commandMap=new Map(),slotMap=new Map(),searchProviders=new Map();
  const ICONS={
    home:'<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1Z"/>',
    roadmap:'<path d="M6 4v16M18 4v16M6 7h7l2 3-2 3H6M18 11h-5l-2 3 2 3h5"/>',
    subjects:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3H6.5A2.5 2.5 0 0 0 4 20.5ZM20 5.5A2.5 2.5 0 0 0 17.5 3H14v15a3 3 0 0 1 3-3h.5A2.5 2.5 0 0 1 20 17.5Z"/>',
    schedule:'<path d="M6 3v3M18 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Zm3 7h3v3H8Z"/>',
    research:'<path d="M9 3h6v4l4 8a4 4 0 0 1-3.6 6H8.6A4 4 0 0 1 5 15l4-8Zm0 9h6M8 16h8"/>',
    lessons:'<path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/>',
    formulas:'<path d="M17 5H8l5 7-5 7h9M5 5h2M5 19h2"/>',
    exercises:'<path d="m5 13 4 4L19 7M4 4h16v16H4z"/>',
    tests:'<path d="M7 3h10v4H7zM5 5h14v16H5zM8 11l2 2 5-5M8 17h8"/>',
    simulations:'<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/><circle cx="12" cy="12" r="3"/>',
    assistant:'<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6ZM18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8Z"/>',
    data:'<ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7"/>',
    focus:'<path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/><circle cx="12" cy="12" r="3"/>'
  };
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function icon(name,label=''){
    const p=ICONS[name]||ICONS.focus;
    return '<svg class="bui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'+(label?'<span class="bui-visually-hidden">'+safe(label)+'</span>':'');
  }

  function boot(){
    document.body?.setAttribute('data-bui','1');
    installAccessibility();
    bindFocusMode();
    bindCommandPalette();
    registerDefaultCommands();
    installPrimaryMobileNav();
    normalizePrimaryIcons();
    document.documentElement.dataset.buiReady='1';
    document.dispatchEvent(new CustomEvent('bauman-ui-ready',{detail:{version:VERSION}}));
  }


  function installAccessibility(){
    const main=q('main');
    if(main&&!main.id)main.id='bui-main';
    if(main&&!main.getAttribute('role'))main.setAttribute('role','main');
    const nav=q('#nav');if(nav&&!nav.getAttribute('aria-label'))nav.setAttribute('aria-label','Điều hướng chính');
    if(main&&!q('[data-bui-skip]')){
      const a=document.createElement('a');a.href='#'+main.id;a.dataset.buiSkip='1';a.className='bui-skip-link';a.textContent='Bỏ qua điều hướng';document.body.insertBefore(a,document.body.firstChild);
    }
    if(nav){
      nav.addEventListener('keydown',e=>{
        if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;
        const items=qa('button:not([disabled]),a[href]',nav);if(!items.length)return;
        const current=items.indexOf(document.activeElement);let next=current;
        if(e.key==='ArrowDown')next=(current+1+items.length)%items.length;
        if(e.key==='ArrowUp')next=(current-1+items.length)%items.length;
        if(e.key==='Home')next=0;if(e.key==='End')next=items.length-1;
        e.preventDefault();items[next<0?0:next]?.focus();
      });
    }
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
  function normalizePrimaryIcons(){
    const map={home:'home',roadmap:'roadmap',subjects:'subjects',schedule:'schedule',research:'research'};
    qa('#nav [data-page]').forEach(btn=>{
      const name=map[btn.dataset.page];if(!name||btn.dataset.buiIconized==='1')return;
      const span=q('span',btn),label=(span?.textContent||btn.textContent||'').trim();
      const old=q('i',btn);if(old){old.innerHTML=icon(name);old.setAttribute('aria-hidden','true')}
      btn.dataset.buiIconized='1';if(label)btn.setAttribute('aria-label',label);
    });
  }
  function installPrimaryMobileNav(){
    if(document.body?.hasAttribute('data-bui-subject')||q('[data-bui-mobile-nav]'))return;
    const nav=q('#nav');if(!nav)return;
    const primary=qa('[data-page]',nav).slice(0,5);if(!primary.length)return;
    const mobile=document.createElement('nav');mobile.className='bui-mobile-nav';mobile.dataset.buiMobileNav='1';mobile.setAttribute('aria-label','Điều hướng chính trên di động');
    primary.forEach(source=>{
      const b=document.createElement('button');b.type='button';b.dataset.page=source.dataset.page;b.innerHTML=icon(({home:'home',roadmap:'roadmap',subjects:'subjects',schedule:'schedule',research:'research'})[source.dataset.page]||'home')+'<span>'+safe(q('span',source)?.textContent||source.textContent)+'</span>';
      b.addEventListener('click',()=>source.click());mobile.appendChild(b);
    });
    document.body.appendChild(mobile);
    const sync=()=>qa('[data-page]',mobile).forEach(b=>b.classList.toggle('is-active',q('#nav [data-page="'+b.dataset.page+'"]')?.classList.contains('active')));
    new MutationObserver(sync).observe(nav,{subtree:true,attributes:true,attributeFilter:['class']});sync();
  }

  function registerDefaultCommands(){
    registerCommand({id:'focus.toggle',label:'Bật / tắt Focus Mode',group:'Giao diện',keywords:'focus tập trung',icon:'◉',run:()=>setFocusMode()});
    registerCommand({id:'appearance.open',label:'Mở cài đặt giao diện',group:'Giao diện',keywords:'theme font cỡ chữ dark mode',icon:'◌',run:()=>q('#appearanceBtn')?.click()});
    registerCommand({id:'assistant.open',label:'Mở Trợ lý AI',group:'Học tập',keywords:'ai trợ lý hỏi đáp',icon:'✦',run:()=>q('#aiBtn')?.click()});
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
  function registerSearchProvider(id,provider){if(!id||typeof provider!=='function')return false;searchProviders.set(String(id),provider);return true}
  function unregisterSearchProvider(id){return searchProviders.delete(String(id))}
  function dataSearch(t){
    if(!t)return [];
    const data=window.BAUMAN_DATA||window.DATA||null;if(!data)return [];
    const out=[];
    (data.subjects||[]).filter(x=>[x.name,x.desc,x.main,(x.eq||[]).join(' ')].join(' ').toLowerCase().includes(t)).slice(0,8).forEach(x=>{
      out.push({id:'data.subject.'+x.id,label:x.name,description:'Môn học',group:'Môn học',icon:'▦',run:()=>{try{window.pickSubject?.(x.id);window.app?.page?.('subjects')}catch{}}});
    });
    (data.courses||[]).filter(x=>[x.name,x.ru,x.stage,x.deliverable,x.note].join(' ').toLowerCase().includes(t)).slice(0,12).forEach(x=>{
      out.push({id:'data.course.'+x.id,label:x.name,description:(x.stage||'')+' · '+(x.ru||''),group:'Bài học / học phần',icon:'→',run:()=>{try{window.pickSubject?.(x.subject);window.app?.page?.('subjects')}catch{}}});
    });
    return out;
  }
  registerSearchProvider('bauman-data',dataSearch);

  function commandSearchRows(term=''){
    const t=String(term).trim().toLowerCase();
    const commands=[...commandMap.values()].filter(c=>!t||[c.label,c.group,c.keywords].join(' ').toLowerCase().includes(t));
    if(t){for(const provider of searchProviders.values()){try{const rows=provider(t);if(Array.isArray(rows))commands.push(...rows)}catch(e){console.warn('[BaumanUI] search provider failed',e)}}}
    if(t){
      qa('a[href],button').forEach((el,i)=>{
        const text=(el.textContent||el.getAttribute('aria-label')||'').trim();
        if(text&&text.length<90&&text.toLowerCase().includes(t)){
          const id='dom.'+i+'.'+text.slice(0,16);
          if(!commands.some(c=>c.id===id))commands.push({id,label:text,group:'Trong trang',icon:'↳',run:()=>el.click()});
        }
      });
    }
    const seen=new Set();return commands.filter(x=>x&&x.id&&!seen.has(x.id)&&seen.add(x.id)).slice(0,40);
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
    search:{register:registerSearchProvider,unregister:unregisterSearchProvider,providers:()=>[...searchProviders.keys()]},
    slots:{register:registerSlot,resolve:resolveSlot,mount:mountSlot},
    icons:{svg:icon,names:()=>Object.keys(ICONS)},
    ready:()=>document.documentElement.dataset.buiReady==='1'
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
