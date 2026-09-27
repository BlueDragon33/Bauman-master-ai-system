/* BAUMAN FUTURE PROFESSIONAL INTERFACE SYSTEM · Runtime
   Global command palette + explicit Focus Mode. */
(()=>{
  'use strict';
  const RELEASE='BAUMAN_FUTURE_UI_E1_E5_2026_09';
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const safe=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const stateRef=()=>typeof state!=='undefined'&&state?state:null;
  const dataRef=()=>typeof DATA!=='undefined'&&DATA?DATA:(window.BAUMAN_DATA||{});
  const appRef=()=>typeof app!=='undefined'?app:null;
  let selected=0;
  let results=[];

  function ensure(){
    if(q('#baumanCommandPalette'))return;
    document.body.insertAdjacentHTML('beforeend',
      '<nav class="ui-mobile-nav" id="baumanMobileNav" aria-label="Điều hướng chính trên điện thoại">'+
        '<button type="button" data-ui-page="home"><span>⌂</span><span>Tổng quan</span></button>'+
        '<button type="button" data-ui-page="roadmap"><span>⌘</span><span>Lộ trình</span></button>'+
        '<button type="button" data-ui-page="subjects"><span>▦</span><span>Môn học</span></button>'+
        '<button type="button" data-ui-page="schedule"><span>◷</span><span>Lịch</span></button>'+
        '<button type="button" data-ui-page="research"><span>✦</span><span>Luận văn</span></button>'+
      '</nav>'+
      '<div id="baumanCommandPalette" class="ui-command-overlay" hidden aria-hidden="true">'+
        '<section class="ui-command" role="dialog" aria-modal="true" aria-label="Command Palette">'+
          '<div class="ui-command__search"><span aria-hidden="true">⌕</span><input id="baumanCommandInput" autocomplete="off" spellcheck="false" aria-label="Tìm kiếm hoặc chạy lệnh" placeholder="Tìm môn, bài học, tài nguyên hoặc lệnh…"><kbd class="ui-command__kbd">Esc</kbd></div>'+
          '<div id="baumanCommandResults" class="ui-command__results" role="listbox"></div>'+
        '</section>'+
      '</div>'+
      '<div class="ui-focus-banner" id="baumanFocusBanner"><b>Focus Mode</b><span class="ui-muted">Chỉ giữ nội dung học và hành động cần thiết.</span><button type="button" class="ui-btn" data-ui-exit-focus>Thoát Focus</button></div>');
    q('#baumanCommandInput').addEventListener('input',render);
    q('#baumanCommandInput').addEventListener('keydown',onInputKey);
    q('#baumanCommandPalette').addEventListener('mousedown',e=>{if(e.target.id==='baumanCommandPalette')close()});
    q('#baumanCommandResults').addEventListener('click',e=>{const b=e.target.closest('[data-ui-command-index]');if(!b)return;run(Number(b.dataset.uiCommandIndex))});
    q('[data-ui-exit-focus]').addEventListener('click',()=>setFocus(false));
    q('#baumanMobileNav').addEventListener('click',e=>{const b=e.target.closest('[data-ui-page]');if(!b)return;appRef()?.page?.(b.dataset.uiPage);syncMobileNav()});
    syncMobileNav();
  }

  function commands(){
    const a=appRef(),s=stateRef(),d=dataRef();
    const base=[
      {group:'Điều hướng',title:'Tổng quan',hint:'Trang chủ',keywords:'home dashboard overview',action:()=>a?.page?.('home')},
      {group:'Điều hướng',title:'Lộ trình',hint:'Giai đoạn & học kỳ',keywords:'roadmap stage semester',action:()=>a?.page?.('roadmap')},
      {group:'Điều hướng',title:'Môn học',hint:'Kho môn',keywords:'subjects courses study',action:()=>a?.page?.('subjects')},
      {group:'Điều hướng',title:'Lịch học',hint:'Kế hoạch',keywords:'schedule calendar plan',action:()=>a?.page?.('schedule')},
      {group:'Điều hướng',title:'Luận văn / НИР',hint:'Nghiên cứu',keywords:'research thesis nir',action:()=>a?.page?.('research')},
      {group:'Hành động',title:'Mở Trợ lý AI',hint:'Hỏi theo ngữ cảnh',keywords:'ai assistant mentor',action:()=>q('#aiBtn')?.click()},
      {group:'Hành động',title:'Mở Giao diện',hint:'Theme · font · cỡ chữ',keywords:'settings appearance theme font',action:()=>q('#appearanceBtn')?.click()},
      {group:'Hành động',title:document.body.dataset.uiFocusMode==='true'?'Thoát Focus Mode':'Bật Focus Mode',hint:'Giảm nhiễu khi học',keywords:'focus distraction learning',action:()=>setFocus(document.body.dataset.uiFocusMode!=='true')}
    ];
    const subjects=Object.values(s?.subjects||{}).map(x=>({
      group:'Môn học',title:x.name||x.id,hint:'Mở môn',keywords:[x.id,x.name,x.desc,...(x.eq||[])].join(' '),
      action:()=>{if(s){s.subject=x.id;try{save?.()}catch{}}a?.page?.('subjects');a?.subjects?.()}
    }));
    const courses=(d?.courses||[]).slice(0,250).map(c=>({
      group:'Bài học',title:c.name||c.vi||c.id||'Học phần',hint:c.stage||c.subject||'',keywords:[c.id,c.name,c.vi,c.stage,c.subject].join(' '),
      action:()=>{if(s&&c.subject)s.subject=c.subject;try{save?.()}catch{};a?.page?.('subjects');a?.subjects?.()}
    }));
    return [...base,...subjects,...courses];
  }

  function filtered(term=''){
    const t=String(term).trim().toLowerCase();
    const all=commands();
    if(!t)return all.slice(0,12);
    return all.map((x,i)=>{
      const hay=(x.title+' '+x.hint+' '+x.keywords+' '+x.group).toLowerCase();
      let score=0;
      if(x.title.toLowerCase().startsWith(t))score+=7;
      if(x.title.toLowerCase().includes(t))score+=5;
      if(hay.includes(t))score+=2;
      for(const bit of t.split(/\s+/).filter(Boolean))if(hay.includes(bit))score++;
      return {x,i,score};
    }).filter(r=>r.score>0).sort((a,b)=>b.score-a.score).slice(0,18).map(r=>r.x);
  }

  function render(){
    const input=q('#baumanCommandInput'),host=q('#baumanCommandResults');
    results=filtered(input?.value||'');
    selected=Math.min(selected,Math.max(0,results.length-1));
    if(!results.length){
      host.innerHTML='<div class="ui-empty"><h3>Không tìm thấy</h3><p>Thử tên môn, bài học, tài nguyên hoặc lệnh khác.</p></div>';
      return;
    }
    const groups=new Map();
    results.forEach((x,i)=>{if(!groups.has(x.group))groups.set(x.group,[]);groups.get(x.group).push({x,i})});
    host.innerHTML=[...groups.entries()].map(([g,rows])=>
      '<div class="ui-command__group"><p>'+safe(g)+'</p>'+
      rows.map(({x,i})=>'<button type="button" class="ui-command__item" role="option" aria-selected="'+(i===selected?'true':'false')+'" data-ui-command-index="'+i+'"><b>'+safe(x.title)+'</b><small>'+safe(x.hint||'')+'</small></button>').join('')+
      '</div>'
    ).join('');
  }

  function syncMobileNav(){
    const current=stateRef()?.page||qa('.page.active')[0]?.id?.replace('page-','')||'home';
    qa('#baumanMobileNav [data-ui-page]').forEach(b=>{const active=b.dataset.uiPage===current;b.toggleAttribute('aria-current',active);if(active)b.setAttribute('aria-current','page')});
  }

  function open(seed=''){
    ensure();
    const overlay=q('#baumanCommandPalette'),input=q('#baumanCommandInput');
    overlay.hidden=false;overlay.setAttribute('aria-hidden','false');selected=0;input.value=String(seed||'');render();
    requestAnimationFrame(()=>{input.focus();input.select()});
  }
  function close(){
    const overlay=q('#baumanCommandPalette');if(!overlay)return;
    overlay.hidden=true;overlay.setAttribute('aria-hidden','true');
  }
  function run(i=selected){
    const item=results[i];if(!item)return;
    close();
    try{item.action?.()}catch(err){console.error('[Bauman UI] command failed',err)}
  }
  function onInputKey(e){
    if(e.key==='ArrowDown'){e.preventDefault();selected=Math.min(results.length-1,selected+1);render()}
    if(e.key==='ArrowUp'){e.preventDefault();selected=Math.max(0,selected-1);render()}
    if(e.key==='Enter'){e.preventDefault();run()}
    if(e.key==='Escape'){e.preventDefault();close()}
  }
  function setFocus(on){
    document.body.dataset.uiFocusMode=on?'true':'false';
    localStorage.setItem('bauman_ui_focus_mode',on?'1':'0');
    close();
  }
  function bind(){
    document.addEventListener('keydown',e=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();e.stopImmediatePropagation();open()}
      else if(e.key==='Escape'&&!q('#baumanCommandPalette')?.hidden)close();
    },true);
    const search=q('#hubSafeSearch');
    if(search){
      search.setAttribute('aria-label','Tìm kiếm toàn hệ thống');
      search.addEventListener('focus',()=>open(search.value),{once:false});
    }
    document.addEventListener('click',e=>{if(e.target.closest('#nav [data-page]'))setTimeout(syncMobileNav,0)},true);
    const pageHost=q('.main');if(pageHost)new MutationObserver(syncMobileNav).observe(pageHost,{subtree:true,attributes:true,attributeFilter:['class']});
    const saved=localStorage.getItem('bauman_ui_focus_mode')==='1';
    if(saved)setFocus(true);
  }
  function selfCheck(){
    return {release:RELEASE,palette:!!q('#baumanCommandPalette'),mobileNav:!!q('#baumanMobileNav'),focusMode:document.body.dataset.uiFocusMode==='true',touchTarget:getComputedStyle(document.documentElement).getPropertyValue('--ui-touch').trim(),routesOwned:false};
  }
  ensure();bind();
  window.BAUMAN_FUTURE_UI={release:RELEASE,openCommand:open,closeCommand:close,setFocus,selfCheck};
})();