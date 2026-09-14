/* Bauman Math Unified Navigation V1
 * Reuses accepted E129/Workspace routes. No route engine replacement, no academic writes.
 */
(function mathNavigation(global){
  'use strict';
  const RELEASE='MATH_UNIFIED_NAV_V1';
  let active='overview', timer=0;
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const ITEMS=[
    {id:'overview',group:'Học tập',icon:'⌂',label:'Tổng quan',sub:'Dashboard & tiến độ',key:'1'},
    {id:'theory',group:'Học tập',icon:'▤',label:'Lý thuyết',sub:'E129 Reader',key:'2'},
    {id:'exercises',group:'Học tập',icon:'✎',label:'Bài tập',sub:'Củng cố tư duy',key:'3'},
    {id:'practice',group:'Học tập',icon:'⌘',label:'Thực hành',sub:'Code & hiện thực hóa',key:'4'},
    {id:'application',group:'Học tập',icon:'◇',label:'Ứng dụng',sub:'AI · Signal · Systems',key:'5'},
    {id:'review',group:'Học tập',icon:'↺',label:'Ôn tập',sub:'Hệ thống hóa',key:'6'},
    {id:'exam',group:'Học tập',icon:'✓',label:'Kiểm tra',sub:'Đánh giá năng lực',key:'7'},
    {id:'lab',group:'Công cụ',icon:'∿',label:'Mô phỏng Lab',sub:'Đồ thị · Vector · Ma trận',key:'L'},
    {id:'formula',group:'Công cụ',icon:'∑',label:'Công thức',sub:'Formula Focus',key:'F'},
    {id:'control',group:'Công cụ',icon:'☷',label:'Điều khiển',sub:'Lọc & kiểm duyệt nội dung',key:'C'},
    {id:'vault',group:'Hệ thống',icon:'▣',label:'Kho dữ liệu',sub:'E129 DataVault',key:'D'}
  ];

  function toast(message){
    const existing=$('#mathWsToast');
    if(existing){ existing.textContent=message; existing.style.opacity='1'; clearTimeout(existing._timer); existing._timer=setTimeout(()=>existing.style.opacity='0',1800); return; }
    console.info('[Math Navigation]',message);
  }

  function navHtml(){
    const groups=['Học tập','Công cụ','Hệ thống'];
    return groups.map(group=>{
      const items=ITEMS.filter(x=>x.group===group);
      return `<section class="math-unified-group"><div class="math-unified-label"><span>${esc(group)}</span><span>${items.length}</span></div>${items.map(x=>`<button type="button" class="math-unified-nav-button ${x.id===active?'active':''}" data-math-unified="1" data-math-nav="${x.id}" title="${esc(x.label)} · ${esc(x.sub)}"><i class="math-unified-icon">${x.icon}</i><span class="math-unified-copy"><b>${esc(x.label)}</b><small>${esc(x.sub)}</small></span><span class="math-unified-tail">${esc(x.key)}</span></button>`).join('')}</section>`;
    }).join('');
  }

  function ensureNav(){
    const nav=$('#nav'); if(!nav) return;
    let root=$('#mathUnifiedNav',nav);
    if(!root){
      root=document.createElement('div'); root.id='mathUnifiedNav'; root.className='math-unified-nav'; nav.appendChild(root);
      const sys=document.createElement('div'); sys.id='mathUnifiedSystem'; sys.className='math-unified-system';
      sys.innerHTML='<div class="math-unified-system-head"><span>Math runtime</span><i title="Runtime active"></i></div><div class="math-unified-system-grid"><button type="button" data-math-system="command">⌘K</button><button type="button" data-math-system="focus">Focus</button><button type="button" data-math-system="theme">Theme</button></div>';
      nav.parentElement?.appendChild(sys);
    }
    root.innerHTML=navHtml();
  }

  function setActive(id){ active=id||'overview'; $$('.math-unified-nav-button').forEach(b=>b.classList.toggle('active',b.dataset.mathNav===active)); }

  function hiddenTheoryButton(){ return $('[data-e129-nav="theory"]'); }
  function routeTheory(done){
    const btn=hiddenTheoryButton();
    if(btn){ btn.click(); setTimeout(()=>done&&done(),90); return true; }
    try{ global.BAUMAN_MATH_THEORY_E129?.render?.(); setTimeout(()=>done&&done(),120); return true; }catch(_){ return false; }
  }

  function routeActivity(activity){
    setActive(activity);
    routeTheory(()=>{
      const opener=$('[data-e169-open="activity"]');
      if(!opener){ toast('Chưa tìm thấy Learning Path của bài hiện tại.'); return; }
      opener.click();
      setTimeout(()=>{
        const pick=$(`[data-e169-pick-activity="${activity}"]`);
        if(pick){ pick.click(); scheduleSync(180); }
        else toast('Hoạt động này chưa có route E169 trong chương hiện tại.');
      },70);
    });
  }

  function route(id){
    if(!id) return;
    if(id==='overview'){
      setActive(id);
      ($('#mathPremiumDashboard')||$('#mathV2Dashboard')||$('.main'))?.scrollIntoView({behavior:'smooth',block:'start'});
      return;
    }
    if(id==='theory'){
      setActive(id); routeTheory(()=>{$('#view')?.scrollIntoView({behavior:'smooth',block:'start'}); scheduleSync(120);}); return;
    }
    if(['exercises','practice','application','review','exam'].includes(id)){ routeActivity(id); return; }
    if(id==='lab'){ setActive(id); global.BAUMAN_MATH_WORKSPACE?.openLab?.(); return; }
    if(id==='control'){ setActive(id); global.BAUMAN_MATH_WORKSPACE?.openControl?.(); return; }
    if(id==='formula'){ setActive(id); openFormulaFocus(); return; }
    if(id==='vault'){
      setActive(id);
      if(global.BAUMAN_MATH_THEORY_E129?.openTheoryVault){ global.BAUMAN_MATH_THEORY_E129.openTheoryVault(); scheduleSync(150); }
      else toast('DataVault E129 chưa sẵn sàng ở màn hiện tại.');
    }
  }

  function collectFormulas(){
    const out=[],seen=new Set();
    const candidates=[...$$('[data-current-lesson] pre'),...$$('.e129-slide pre'),...$$('[data-math-ws-type~="formula"]')];
    candidates.forEach((el,index)=>{
      const text=(el.matches('pre')?el.textContent:(el.querySelector('pre')?.textContent||el.textContent)||'').replace(/\s+$/,'').trim();
      if(!text) return;
      const key=text.replace(/\s+/g,' ').slice(0,220); if(seen.has(key)) return; seen.add(key);
      const host=el.closest('.e129-slide,[data-current-lesson],article,section');
      const title=(host?.querySelector('h2,h3,h4')?.textContent||`Công thức ${out.length+1}`).trim();
      const note=(host?.querySelector('p')?.textContent||'').trim();
      out.push({title,text,note,element:el,index});
    });
    return out.slice(0,60);
  }

  function ensureFormulaFocus(){
    if($('#mathFormulaFocus')) return;
    const layer=document.createElement('section'); layer.id='mathFormulaFocus'; layer.className='math-formula-focus';
    layer.innerHTML='<div class="math-formula-focus-shell"><header class="math-formula-focus-head"><div><span class="math-formula-focus-kicker">Formula Focus</span><h2>Công thức trong bài đang mở</h2><p>Đọc trực tiếp từ Reader hiện tại; không tạo hay sửa công thức nguồn.</p></div><button type="button" class="math-formula-close" data-formula-close>×</button></header><div class="math-formula-focus-body"><nav id="mathFormulaIndex" class="math-formula-index"></nav><main id="mathFormulaStage" class="math-formula-stage"></main></div></div>';
    document.body.appendChild(layer);
    layer.addEventListener('click',e=>{ if(e.target===layer||e.target.closest('[data-formula-close]')) closeFormulaFocus(); });
  }

  function renderFormulaFocus(selected=0){
    ensureFormulaFocus(); const list=collectFormulas(), index=$('#mathFormulaIndex'), stage=$('#mathFormulaStage');
    if(!index||!stage) return;
    if(!list.length){ index.innerHTML='<div class="math-formula-stage-empty">Chưa phát hiện block công thức trong bài đang mở.</div>'; stage.innerHTML='<div class="math-formula-stage-empty">Mở một bài có công thức trong E129 Reader hoặc dùng Math Lab để tiếp tục.</div>'; return; }
    const pick=Math.max(0,Math.min(selected,list.length-1)), item=list[pick];
    index.innerHTML=list.map((x,i)=>`<button type="button" data-formula-index="${i}" class="${i===pick?'active':''}">${esc(x.title.slice(0,95))}</button>`).join('');
    stage.innerHTML=`<article class="math-formula-stage-card"><span>Công thức ${pick+1}/${list.length}</span><pre>${esc(item.text)}</pre>${item.note?`<p>${esc(item.note.slice(0,700))}</p>`:''}</article>`;
    $$('[data-formula-index]',index).forEach(b=>b.addEventListener('click',()=>renderFormulaFocus(Number(b.dataset.formulaIndex)||0)));
  }
  function openFormulaFocus(){ renderFormulaFocus(0); $('#mathFormulaFocus')?.classList.add('open'); }
  function closeFormulaFocus(){ $('#mathFormulaFocus')?.classList.remove('open'); }

  function ensureCommand(){
    if($('#mathCommandPalette')) return;
    const layer=document.createElement('section'); layer.id='mathCommandPalette'; layer.className='math-command-palette';
    layer.innerHTML='<div class="math-command-shell"><input id="mathCommandSearch" class="math-command-search" type="search" autocomplete="off" placeholder="Đi tới: Lý thuyết, Mô phỏng, Công thức, DataVault…"><div id="mathCommandList" class="math-command-list"></div></div>';
    document.body.appendChild(layer);
    layer.addEventListener('click',e=>{ if(e.target===layer) closeCommand(); });
    $('#mathCommandSearch')?.addEventListener('input',renderCommandList);
    $('#mathCommandSearch')?.addEventListener('keydown',e=>{
      const rows=$$('.math-command-item').filter(x=>x.offsetParent!==null); let idx=rows.findIndex(x=>x.classList.contains('active'));
      if(e.key==='ArrowDown'){e.preventDefault();idx=(idx+1+rows.length)%rows.length;rows.forEach((x,i)=>x.classList.toggle('active',i===idx));rows[idx]?.scrollIntoView({block:'nearest'});}
      if(e.key==='ArrowUp'){e.preventDefault();idx=(idx-1+rows.length)%rows.length;rows.forEach((x,i)=>x.classList.toggle('active',i===idx));rows[idx]?.scrollIntoView({block:'nearest'});}
      if(e.key==='Enter'){e.preventDefault();(rows[idx>=0?idx:0])?.click();}
      if(e.key==='Escape'){closeCommand();}
    });
  }
  function renderCommandList(){
    ensureCommand(); const value=($('#mathCommandSearch')?.value||'').toLocaleLowerCase('vi').trim(); const list=ITEMS.filter(x=>!value||`${x.label} ${x.sub} ${x.group}`.toLocaleLowerCase('vi').includes(value));
    const host=$('#mathCommandList'); if(!host)return;
    host.innerHTML=list.map((x,i)=>`<button type="button" class="math-command-item ${i===0?'active':''}" data-command-route="${x.id}"><i>${x.icon}</i><span><b>${esc(x.label)}</b><small>${esc(x.group)} · ${esc(x.sub)}</small></span><kbd>${esc(x.key)}</kbd></button>`).join('')||'<div class="math-formula-stage-empty">Không có chức năng phù hợp.</div>';
    $$('[data-command-route]',host).forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.commandRoute;closeCommand();route(id);}));
  }
  function openCommand(){ ensureCommand(); renderCommandList(); $('#mathCommandPalette')?.classList.add('open'); const s=$('#mathCommandSearch'); if(s){s.value='';s.focus();renderCommandList();} }
  function closeCommand(){ $('#mathCommandPalette')?.classList.remove('open'); }

  function syncFromRuntime(){
    if(document.body.classList.contains('e129-theory-storage')){ setActive('vault'); return; }
    const title=($('#pageTitle')?.textContent||'').toLocaleLowerCase('vi');
    if(title.includes('bài tập')) setActive('exercises');
    else if(title.includes('thực hành')) setActive('practice');
    else if(title.includes('ứng dụng')) setActive('application');
    else if(title.includes('ôn tập')) setActive('review');
    else if(title.includes('kiểm tra')) setActive('exam');
    else if(title.includes('lý thuyết')) setActive('theory');
  }
  function scheduleSync(ms=100){clearTimeout(timer);timer=setTimeout(()=>{ensureNav();syncFromRuntime();global.BAUMAN_MATH_PREMIUM?.refresh?.();global.BAUMAN_MATH_DASHBOARD_V2?.refresh?.();},ms);}

  function bind(){
    document.addEventListener('click',e=>{
      const nav=e.target.closest('[data-math-nav]'); if(nav){e.preventDefault();route(nav.dataset.mathNav);return;}
      const sys=e.target.closest('[data-math-system]'); if(sys){e.preventDefault();const a=sys.dataset.mathSystem;if(a==='command')openCommand();if(a==='focus')global.BAUMAN_MATH_WORKSPACE?.openControl?.();if(a==='theme')$('#themeBtn')?.click();return;}
      if(e.target.closest('[data-e129-nav],[data-e169-pick-activity],[data-e129-back-theory],[data-e129-open-vault],[data-e129-refresh]')) scheduleSync(160);
    },true);
    document.addEventListener('keydown',e=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCommand();return;}
      if(e.key==='Escape'){closeCommand();closeFormulaFocus();}
      if(!e.ctrlKey&&!e.metaKey&&!e.altKey&&document.activeElement===document.body){
        const hit=ITEMS.find(x=>x.key.toLowerCase()===e.key.toLowerCase()); if(hit) route(hit.id);
      }
    });
  }

  function selfCheck(){return{release:RELEASE,ready:document.body.classList.contains('math-nav-ready'),items:ITEMS.length,e129:!!global.BAUMAN_MATH_THEORY_E129,workspace:!!global.BAUMAN_MATH_WORKSPACE,mutationObserver:false,academicWrites:false,newRouteEngine:false};}
  function init(){
    if(!document.body||document.body.dataset.mathUnifiedNav==='1')return;
    document.body.dataset.mathUnifiedNav='1';document.body.classList.add('math-nav-ready');ensureFormulaFocus();ensureCommand();bind();ensureNav();
    [250,700,1400,2400].forEach(ms=>setTimeout(()=>{ensureNav();syncFromRuntime();},ms));
    global.BAUMAN_MATH_NAVIGATION={release:RELEASE,route,openCommand,openFormulaFocus,refresh:()=>{ensureNav();syncFromRuntime();},selfCheck};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
