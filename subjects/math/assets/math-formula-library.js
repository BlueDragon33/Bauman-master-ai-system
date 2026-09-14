/* Bauman Math Formula Library V1
 * Primary source: populated data/formulas-or-patterns.json.
 * formula_content.json remains clean-architecture companion source and is not populated from sampleRecord.
 */
(function mathFormulaLibrary(global){
  'use strict';
  const RELEASE='MATH_FORMULA_LIBRARY_V1';
  const DATA_PATH='data/formulas-or-patterns.json';
  const FAVORITE_KEY='bauman_math_formula_favorites_v1';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clip=(s,n=90)=>{s=String(s??'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1)+'…':s};
  let items=[],filtered=[],selected=0,group='all',loaded=false,error=null;

  function favorites(){try{return JSON.parse(localStorage.getItem(FAVORITE_KEY)||'[]')}catch(_){return[]}}
  function setFavorites(v){try{localStorage.setItem(FAVORITE_KEY,JSON.stringify([...new Set(v)]))}catch(_){}}
  function isFavorite(id){return favorites().includes(id)}
  function toggleFavorite(id){const list=favorites();setFavorites(list.includes(id)?list.filter(x=>x!==id):[id,...list]);renderStage();renderList()}
  async function load(){
    if(loaded)return items;
    try{const r=await fetch(DATA_PATH,{cache:'no-store'});if(!r.ok)throw new Error(`${DATA_PATH} HTTP ${r.status}`);const raw=await r.json();items=Array.isArray(raw)?raw:Array.isArray(raw?.items)?raw.items:[];loaded=true;error=null;}
    catch(e){items=[];loaded=true;error=String(e?.message||e)}
    applyFilter();return items;
  }
  function ensure(){
    if(!$('#mathFormulaLibrary')){
      const layer=document.createElement('section');layer.id='mathFormulaLibrary';layer.className='math-formula-library';
      layer.innerHTML=`<div class="math-fl-shell"><header class="math-fl-head"><div><small>Formula Library</small><h2>Thư viện Công thức Toán Bauman</h2><p>Nguồn thật: formulas-or-patterns.json · tìm kiếm toàn môn · không sửa dữ liệu nguồn.</p></div><div class="math-fl-actions"><button data-fl="current">Công thức bài hiện tại</button><button data-fl="close">Đóng ×</button></div></header><div class="math-fl-toolbar"><input id="mathFlSearch" class="math-fl-search" type="search" placeholder="Tìm: cosine, ma trận, Bayes, gradient, Fourier…"><div id="mathFlGroups" class="math-fl-groups"></div><span id="mathFlCount" class="math-fl-count">0 công thức</span></div><div class="math-fl-body"><nav id="mathFlList" class="math-fl-list"></nav><main id="mathFlStage" class="math-fl-stage"></main></div></div>`;
      document.body.appendChild(layer);layer.addEventListener('click',e=>{if(e.target===layer)close()});$('#mathFlSearch')?.addEventListener('input',()=>{applyFilter();render()});
    }
    ensureNav();ensureFormulaFocusLink();
  }
  function ensureNav(){
    const root=$('#mathUnifiedNav');if(!root||$('#mathFormulaLibraryNav',root))return;
    const formula=$('[data-math-nav="formula"]',root);const b=document.createElement('button');b.id='mathFormulaLibraryNav';b.type='button';b.className='math-unified-nav-button math-formula-library-nav';b.dataset.fl='open';b.innerHTML='<i class="math-unified-icon">ƒ</i><span class="math-unified-copy"><b>Thư viện CT</b><small>Toàn bộ công thức</small></span><span class="math-unified-tail">G</span>';
    if(formula)formula.insertAdjacentElement('afterend',b);else root.appendChild(b);
  }
  function ensureFormulaFocusLink(){
    const head=$('#mathFormulaFocus .math-formula-focus-head');if(!head||$('#mathFormulaFocusLibraryBtn',head))return;
    const b=document.createElement('button');b.id='mathFormulaFocusLibraryBtn';b.type='button';b.dataset.fl='open';b.className='math-formula-close';b.style.width='auto';b.style.padding='0 10px';b.textContent='Thư viện toàn môn';const closeBtn=$('[data-formula-close]',head);if(closeBtn)head.insertBefore(b,closeBtn);else head.appendChild(b);
  }
  function groups(){return [...new Set(items.map(x=>String(x.group||'other')).filter(Boolean))].sort()}
  function labelGroup(g){return ({foundations:'Nền tảng',linear_algebra:'Đại số tuyến tính',calculus:'Giải tích',probability:'Xác suất',statistics:'Thống kê',optimization:'Tối ưu',differential_equations:'PT vi phân',discrete_math:'Toán rời rạc',numerical_methods:'Phương pháp số'})[g]||g.replace(/_/g,' ')}
  function applyFilter(){
    const q=String($('#mathFlSearch')?.value||'').toLocaleLowerCase('vi').trim();
    filtered=items.filter(x=>{
      if(group==='favorites'&&!isFavorite(x.id))return false;
      if(group!=='all'&&group!=='favorites'&&String(x.group||'other')!==group)return false;
      if(!q)return true;
      const text=[x.name,x.latex,x.meaning,x.whenToUse,x.example,x.group,(x.commonMistakes||[]).join(' ')].join(' ').toLocaleLowerCase('vi');return text.includes(q);
    });
    if(selected>=filtered.length)selected=0;
  }
  function renderGroups(){
    const host=$('#mathFlGroups');if(!host)return;const gs=groups();
    host.innerHTML=[['all','Tất cả'],['favorites',`★ Đã lưu (${favorites().length})`],...gs.map(g=>[g,labelGroup(g)])].map(([id,label])=>`<button type="button" data-fl-group="${esc(id)}" class="${group===id?'active':''}">${esc(label)}</button>`).join('');
  }
  function renderList(){
    const host=$('#mathFlList');if(!host)return;
    host.innerHTML=filtered.length?filtered.map((x,i)=>`<button type="button" class="math-fl-item ${i===selected?'active':''}" data-fl-index="${i}"><b>${isFavorite(x.id)?'★ ':''}${esc(x.name||x.id||`Công thức ${i+1}`)}</b><span>${esc(labelGroup(String(x.group||'other')))} · ${esc(clip(x.latex,58))}</span></button>`).join(''):`<div class="math-fl-empty">${error?`Không tải được nguồn: ${esc(error)}`:'Không có công thức khớp bộ lọc.'}</div>`;
    const count=$('#mathFlCount');if(count)count.textContent=`${filtered.length}/${items.length} công thức`;
  }
  function renderStage(){
    const host=$('#mathFlStage');if(!host)return;const x=filtered[selected];
    if(!x){host.innerHTML='<div class="math-fl-empty">Chọn một công thức để xem chi tiết.</div>';return}
    const mistakes=Array.isArray(x.commonMistakes)?x.commonMistakes:[];
    host.innerHTML=`<article class="math-fl-card"><div class="math-fl-card-head"><div><small>${esc(labelGroup(String(x.group||'other')))} · ${esc(x.id||'formula')}</small><h3>${esc(x.name||'Công thức')}</h3></div><button type="button" class="math-fl-star" data-fl-favorite="${esc(x.id||'')}" title="Lưu công thức">${isFavorite(x.id)?'★':'☆'}</button></div><pre class="math-fl-formula">${esc(x.latex||x.formula||'—')}</pre><div class="math-fl-info-grid"><section class="math-fl-info"><span>Ý nghĩa</span><p>${esc(x.meaning||'Nguồn chưa mô tả.')}</p></section><section class="math-fl-info"><span>Khi nào dùng</span><p>${esc(x.whenToUse||'Nguồn chưa mô tả.')}</p></section><section class="math-fl-info"><span>Ví dụ</span><p>${esc(x.example||'Nguồn chưa mô tả.')}</p></section><section class="math-fl-info"><span>Proof / trực giác</span><p>${esc(clip(x.proofSketch||'Nguồn chưa mô tả.',800))}</p></section></div>${mistakes.length?`<section class="math-fl-mistakes"><b>Lỗi thường gặp</b><ul>${mistakes.map(m=>`<li>${esc(m)}</li>`).join('')}</ul></section>`:''}<div class="math-fl-bottom-actions"><button type="button" data-fl-copy="${selected}">Sao chép công thức</button><button type="button" data-fl="current">So với bài hiện tại</button><button type="button" data-fl="lab">Mở Math Lab</button></div></article>`;
  }
  function render(){ensure();renderGroups();renderList();renderStage()}
  function open(){ensure();load().then(()=>{applyFilter();render();$('#mathFormulaLibrary')?.classList.add('open');setTimeout(()=>$('#mathFlSearch')?.focus(),30)});return true}
  function close(){$('#mathFormulaLibrary')?.classList.remove('open')}
  function copyItem(index){const x=filtered[index];if(!x)return;const text=`${x.name||x.id}\n${x.latex||x.formula||''}\n${x.meaning||''}`;navigator.clipboard?.writeText?.(text).then(()=>toast('Đã sao chép công thức')).catch(()=>toast('Không thể truy cập clipboard'))}
  function toast(message){const el=$('#mathWsToast');if(el){el.textContent=message;el.style.opacity='1';clearTimeout(el._timer);el._timer=setTimeout(()=>el.style.opacity='0',1500)}else console.info('[Formula Library]',message)}
  function bind(){
    document.addEventListener('click',e=>{
      const action=e.target.closest('[data-fl]')?.dataset.fl;if(action){e.preventDefault();if(action==='open')open();if(action==='close')close();if(action==='current'){close();global.BAUMAN_MATH_NAVIGATION?.openFormulaFocus?.()}if(action==='lab'){close();global.BAUMAN_MATH_SIMULATION_SOURCE?.openForCurrent?.()||global.BAUMAN_MATH_WORKSPACE?.openLab?.()}return}
      const g=e.target.closest('[data-fl-group]')?.dataset.flGroup;if(g){e.preventDefault();group=g;selected=0;applyFilter();render();return}
      const i=e.target.closest('[data-fl-index]')?.dataset.flIndex;if(i!=null){e.preventDefault();selected=Number(i)||0;renderList();renderStage();return}
      const fav=e.target.closest('[data-fl-favorite]')?.dataset.flFavorite;if(fav){e.preventDefault();toggleFavorite(fav);return}
      const cp=e.target.closest('[data-fl-copy]')?.dataset.flCopy;if(cp!=null){e.preventDefault();copyItem(Number(cp)||0);return}
    },true);
    document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='f'){e.preventDefault();open()}if(e.key==='Escape')close()});
  }
  function selfCheck(){return{release:RELEASE,ready:!!$('#mathFormulaLibrary'),source:DATA_PATH,loaded,total:items.length,groups:groups().length,favorites:favorites().length,formulaContentSampleRecordUsed:false,academicWrites:false,mutationObserver:false}}
  function init(){if(!document.body||document.body.dataset.mathFormulaLibrary==='1')return;document.body.dataset.mathFormulaLibrary='1';ensure();bind();load().then(()=>{render();[500,1200,2400].forEach(ms=>setTimeout(()=>{ensureNav();ensureFormulaFocusLink()},ms))});global.BAUMAN_MATH_FORMULA_LIBRARY={release:RELEASE,open,close,refresh:render,selfCheck}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
