/* Bauman Math Workspace · stable enhancement layer
 * No MutationObserver. No lesson-data writes. No Reader Pro/slideshow ownership.
 */
(function mathWorkspace(global){
  'use strict';

  const KEY = 'bauman_math_workspace_v1';
  const TYPE_META = {
    formula:{label:'Công thức',selectors:['.formula-block','.formula-card','.theory-formula','.math-formula','[data-role="formula"]','[data-slide-role="core_formula"]']},
    example:{label:'Ví dụ',selectors:['.worked-example-block','.worked-example','.example-block','[data-role="example"]','[data-slide-role="mini_case"]']},
    warning:{label:'Lỗi sai / cảnh báo',selectors:['.mistake-block','.common-mistake','.warning','[data-role="warning"]','[data-slide-role="common_mistakes"]']},
    application:{label:'Ứng dụng',selectors:['.application-block','.application-card','[data-role="application"]','[data-slide-role="application"]']},
    assessment:{label:'Câu hỏi / kiểm tra',selectors:['.question-card','.quiz-card','.assessment-card','.professor-qa','[data-role="assessment"]','[data-slide-role="professor_qa"]','[data-slide-role="practice"]']},
    simulation:{label:'Mô phỏng',selectors:['.simulation','.simulation-block','[class*="math-sim-"]','[data-role="simulation"]','[data-slide-role="simulation"]']}
  };
  const defaults = {
    panelTab:'content', focus:false, review:false, density:'normal', fontScale:1, lineHeight:1.62,
    hidden:{formula:false,example:false,warning:false,application:false,assessment:false,simulation:false},
    query:'', labMode:'function'
  };
  let state = load();
  let refreshTimer = 0;
  let refreshCount = 0;

  function load(){
    try{
      const value = JSON.parse(localStorage.getItem(KEY) || '{}');
      return {...defaults,...value,hidden:{...defaults.hidden,...(value.hidden||{})}};
    }catch(_){ return {...defaults,hidden:{...defaults.hidden}}; }
  }
  function save(){ try{ localStorage.setItem(KEY,JSON.stringify(state)); }catch(_){ } }
  function q(sel,root=document){ return root.querySelector(sel); }
  function qa(sel,root=document){ return Array.from(root.querySelectorAll(sel)); }
  function esc(value){ return String(value == null ? '' : value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function num(value,fallback=0){ const n=Number(value); return Number.isFinite(n)?n:fallback; }
  function fmt(value,digits=3){ return Number.isFinite(value) ? String(Number(value.toFixed(digits))) : '—'; }

  function toast(message){
    let el=q('#mathWsToast');
    if(!el){
      el=document.createElement('div'); el.id='mathWsToast';
      Object.assign(el.style,{position:'fixed',left:'50%',bottom:'24px',transform:'translateX(-50%)',zIndex:'120',padding:'10px 14px',borderRadius:'12px',background:'#07111f',color:'#eaf6ff',border:'1px solid rgba(125,211,252,.25)',boxShadow:'0 15px 45px rgba(2,6,23,.35)',font:'800 12px Inter,system-ui,sans-serif',opacity:'0',transition:'opacity .18s'});
      document.body.appendChild(el);
    }
    el.textContent=message; el.style.opacity='1'; clearTimeout(el._timer); el._timer=setTimeout(()=>{el.style.opacity='0';},1800);
  }

  function build(){
    if(q('#mathWorkspacePanel')) return;

    const launcher=document.createElement('div');
    launcher.className='math-ws-launcher'; launcher.id='mathWsLauncher';
    launcher.innerHTML='<button type="button" data-math-ws="lab" title="Mở Math Lab">∿ Lab</button><button type="button" data-math-ws="control" title="Điều khiển nội dung">☷</button><button type="button" data-math-ws="focus" title="Chế độ tập trung">⛶</button>';
    document.body.appendChild(launcher);

    const panel=document.createElement('aside');
    panel.id='mathWorkspacePanel'; panel.className='math-ws-panel'; panel.setAttribute('aria-label','Bảng điều khiển môn Toán');
    panel.innerHTML=`
      <div class="math-ws-panel-head"><div><span>MATH WORKSPACE</span><h3>Điều khiển học tập</h3></div><button type="button" class="math-ws-icon-btn" data-math-ws="close-panel" aria-label="Đóng">×</button></div>
      <div class="math-ws-tabs">
        <button type="button" data-math-ws-tab="content">Nội dung</button>
        <button type="button" data-math-ws-tab="tools">Công cụ</button>
        <button type="button" data-math-ws-tab="display">Hiển thị</button>
      </div>
      <div class="math-ws-panel-scroll">
        <section class="math-ws-pane" data-math-ws-pane="content">
          <div class="math-ws-card"><h4>Tìm trong nội dung đang mở</h4><input id="mathWsSearch" class="math-ws-search" type="search" placeholder="Ví dụ: ma trận, covariance, eigenvalue…"><p id="mathWsSearchInfo">Chỉ lọc phần đang hiển thị, không sửa dữ liệu nguồn.</p></div>
          <div class="math-ws-card"><h4>Lớp nội dung</h4><div id="mathWsTypeToggles" class="math-ws-toggle-list"></div></div>
          <div class="math-ws-card"><h4>Kiểm duyệt nội dung</h4><div class="math-ws-toggle"><span>Đánh dấu loại khối <em>QA</em></span><input id="mathWsReview" type="checkbox"></div><p>Hiện nhãn Công thức / Ví dụ / Ứng dụng / Cảnh báo… để kiểm tra cấu trúc bài mà không thay đổi lesson JSON.</p></div>
          <div class="math-ws-card"><h4>Mục lục màn hiện tại</h4><div id="mathWsOutline" class="math-ws-outline"></div></div>
          <div class="math-ws-card"><h4>Kho nội dung</h4><div class="math-ws-actions"><button type="button" class="math-ws-action primary" data-math-ws="open-vault">Mở Kho môn học</button><button type="button" class="math-ws-action" data-math-ws="rescan">Quét lại UI</button></div><p>Kho môn học vẫn là nơi nhập/xuất và quản lý nguồn. Workspace chỉ kiểm soát lớp trình bày.</p></div>
        </section>
        <section class="math-ws-pane" data-math-ws-pane="tools">
          <div class="math-ws-card"><h4>Vector nhanh</h4><div class="math-ws-tool-grid"><div class="math-ws-field full"><label>u (phân cách bằng dấu phẩy)</label><input id="mathToolU" value="1, 2, 3"></div><div class="math-ws-field full"><label>v</label><input id="mathToolV" value="4, -1, 2"></div></div><div id="mathVectorResult" class="math-ws-result">Nhập hai vector cùng số chiều.</div></div>
          <div class="math-ws-card"><h4>Ma trận 2×2 nhanh</h4><div class="math-ws-tool-grid"><div class="math-ws-field"><label>a₁₁</label><input id="mathM11" type="number" value="1" step="0.1"></div><div class="math-ws-field"><label>a₁₂</label><input id="mathM12" type="number" value="2" step="0.1"></div><div class="math-ws-field"><label>a₂₁</label><input id="mathM21" type="number" value="3" step="0.1"></div><div class="math-ws-field"><label>a₂₂</label><input id="mathM22" type="number" value="4" step="0.1"></div></div><div id="mathMatrixResult" class="math-ws-result"></div></div>
          <button type="button" class="math-ws-action primary" data-math-ws="lab">Mở mô phỏng toàn màn hình</button>
        </section>
        <section class="math-ws-pane" data-math-ws-pane="display">
          <div class="math-ws-card"><h4>Chế độ học</h4><div class="math-ws-segment"><button type="button" data-density="compact">Gọn</button><button type="button" data-density="normal">Chuẩn</button><button type="button" data-density="comfort">Thoáng</button></div><div class="math-ws-toggle" style="margin-top:9px"><span>Tập trung toàn màn hình</span><input id="mathWsFocus" type="checkbox"></div></div>
          <div class="math-ws-card"><h4>Khả năng đọc</h4><div class="math-ws-range"><label for="mathWsFont">Cỡ nội dung</label><output id="mathWsFontOut"></output><input id="mathWsFont" type="range" min="0.9" max="1.2" step="0.05"></div><div class="math-ws-range"><label for="mathWsLine">Giãn dòng</label><output id="mathWsLineOut"></output><input id="mathWsLine" type="range" min="1.35" max="1.95" step="0.05"></div></div>
          <div class="math-ws-actions"><button type="button" class="math-ws-action" data-math-ws="reset">Khôi phục mặc định</button><button type="button" class="math-ws-action primary" data-math-ws="close-panel">Áp dụng & đóng</button></div>
        </section>
      </div>`;
    document.body.appendChild(panel);

    const lab=document.createElement('section');
    lab.id='mathWorkspaceLab'; lab.className='math-ws-lab'; lab.setAttribute('aria-label','Math Lab');
    lab.innerHTML=`
      <div class="math-ws-lab-shell">
        <aside class="math-ws-lab-side">
          <header><div><span class="math-ws-lab-kicker">INTERACTIVE MATH LAB</span><h2>Mô phỏng Toán</h2></div><button type="button" class="math-ws-icon-btn" data-math-ws="close-lab">×</button></header>
          <p>Ba mô phỏng nền dùng trực tiếp trong trình duyệt: hàm số, vector và biến đổi tuyến tính. Không gửi dữ liệu lên server.</p>
          <div class="math-ws-lab-modes"><button type="button" data-lab-mode="function">Hàm số</button><button type="button" data-lab-mode="vector">Vector</button><button type="button" data-lab-mode="matrix">Ma trận</button></div>
          <div id="mathLabControls" class="math-ws-lab-controls"></div>
          <div id="mathLabNote" class="math-ws-lab-note"></div>
        </aside>
        <main class="math-ws-lab-main">
          <div class="math-ws-lab-toolbar"><div><h3 id="mathLabTitle">Đồ thị hàm số</h3><span id="mathLabFormula"></span></div><button type="button" class="math-ws-action" data-math-ws="lab-reset">Đặt lại tham số</button></div>
          <div class="math-ws-plot"><svg id="mathLabSvg" viewBox="-320 -210 640 420" role="img" aria-label="Mô phỏng Toán"></svg></div>
          <div id="mathLabReadout" class="math-ws-lab-readout"></div>
        </main>
      </div>`;
    document.body.appendChild(lab);

    bind();
    syncControls();
    applyState();
    renderLab();
  }

  function bind(){
    document.addEventListener('click',event=>{
      const action=event.target.closest('[data-math-ws]')?.dataset.mathWs;
      if(action){
        if(action==='lab') openLab();
        if(action==='control') openPanel('content');
        if(action==='focus'){ state.focus=!state.focus; save(); applyState(); syncControls(); }
        if(action==='close-panel') closePanel();
        if(action==='close-lab') closeLab();
        if(action==='open-vault') openVault();
        if(action==='rescan'){ refresh(true); toast('Đã quét lại nội dung hiện tại'); }
        if(action==='reset') resetWorkspace();
        if(action==='lab-reset') resetLab();
      }
      const tab=event.target.closest('[data-math-ws-tab]')?.dataset.mathWsTab;
      if(tab) openPanel(tab);
      const density=event.target.closest('[data-density]')?.dataset.density;
      if(density){ state.density=density; save(); applyState(); syncControls(); }
      const mode=event.target.closest('[data-lab-mode]')?.dataset.labMode;
      if(mode){ state.labMode=mode; save(); renderLab(); }
      const outline=event.target.closest('[data-outline-index]');
      if(outline){ const el=document.querySelector(`[data-math-ws-outline-id="${outline.dataset.outlineIndex}"]`); el?.scrollIntoView({behavior:'smooth',block:'center'}); }
      if(!event.target.closest('#mathWorkspacePanel,#mathWorkspaceLab,#mathWsLauncher')) scheduleRefresh();
    },true);

    q('#mathWsSearch')?.addEventListener('input',event=>{ state.query=event.target.value; save(); applySearch(); updateSearchInfo(); });
    q('#mathWsReview')?.addEventListener('change',event=>{ state.review=event.target.checked; save(); applyState(); });
    q('#mathWsFocus')?.addEventListener('change',event=>{ state.focus=event.target.checked; save(); applyState(); });
    q('#mathWsFont')?.addEventListener('input',event=>{ state.fontScale=num(event.target.value,1); save(); applyState(); syncControls(); });
    q('#mathWsLine')?.addEventListener('input',event=>{ state.lineHeight=num(event.target.value,1.62); save(); applyState(); syncControls(); });

    ['mathToolU','mathToolV'].forEach(id=>q('#'+id)?.addEventListener('input',renderVectorTool));
    ['mathM11','mathM12','mathM21','mathM22'].forEach(id=>q('#'+id)?.addEventListener('input',renderMatrixTool));

    q('#mathWorkspaceLab')?.addEventListener('click',event=>{ if(event.target.id==='mathWorkspaceLab') closeLab(); });
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'){ closePanel(); closeLab(); }
      if((event.ctrlKey||event.metaKey) && event.shiftKey && event.key.toLowerCase()==='m'){ event.preventDefault(); openLab(); }
    });
    global.addEventListener('hashchange',scheduleRefresh);
    global.addEventListener('popstate',scheduleRefresh);
  }

  function ensureTopButtons(){
    // Learner-first IA (L03): workspace tools must not append persistent
    // peer navigation or topbar actions. They remain available through the
    // advanced workspace launcher/contextual entry points only.
    qa('#mathWsTopLab,#mathWsTopControl,#mathWsNavLab').forEach(el=>el.remove());
  }

  function openPanel(tab='content'){ state.panelTab=tab; save(); q('#mathWorkspacePanel')?.classList.add('open'); syncControls(); refresh(false); }
  function closePanel(){ q('#mathWorkspacePanel')?.classList.remove('open'); }
  function openLab(){ q('#mathWorkspaceLab')?.classList.add('open'); renderLab(); }
  function closeLab(){ q('#mathWorkspaceLab')?.classList.remove('open'); }

  function syncControls(){
    qa('[data-math-ws-tab]').forEach(b=>b.classList.toggle('active',b.dataset.mathWsTab===state.panelTab));
    qa('[data-math-ws-pane]').forEach(p=>p.classList.toggle('active',p.dataset.mathWsPane===state.panelTab));
    const search=q('#mathWsSearch'); if(search && search.value!==state.query) search.value=state.query||'';
    const review=q('#mathWsReview'); if(review) review.checked=!!state.review;
    const focus=q('#mathWsFocus'); if(focus) focus.checked=!!state.focus;
    const font=q('#mathWsFont'); if(font) font.value=state.fontScale;
    const line=q('#mathWsLine'); if(line) line.value=state.lineHeight;
    const fo=q('#mathWsFontOut'); if(fo) fo.textContent=`${Math.round(state.fontScale*100)}%`;
    const lo=q('#mathWsLineOut'); if(lo) lo.textContent=Number(state.lineHeight).toFixed(2);
    qa('[data-density]').forEach(b=>b.classList.toggle('active',b.dataset.density===state.density));
    qa('[data-lab-mode]').forEach(b=>b.classList.toggle('active',b.dataset.labMode===state.labMode));
    renderTypeToggles(); renderVectorTool(); renderMatrixTool();
  }

  function renderTypeToggles(){
    const wrap=q('#mathWsTypeToggles'); if(!wrap) return;
    const counts=countTypes();
    wrap.innerHTML=Object.entries(TYPE_META).map(([type,meta])=>`<label class="math-ws-toggle"><span>${esc(meta.label)} <em>${counts[type]||0}</em></span><input type="checkbox" data-type-toggle="${type}" ${state.hidden[type]?'':'checked'}></label>`).join('');
    qa('[data-type-toggle]',wrap).forEach(input=>input.addEventListener('change',event=>{ const type=event.target.dataset.typeToggle; state.hidden[type]=!event.target.checked; save(); applyState(); }));
  }

  function applyState(){
    const body=document.body; if(!body) return;
    body.classList.add('math-workspace-ready');
    body.classList.toggle('math-ws-focus',!!state.focus);
    body.classList.toggle('math-ws-review',!!state.review);
    ['compact','normal','comfort'].forEach(d=>body.classList.toggle(`math-ws-density-${d}`,state.density===d));
    Object.keys(TYPE_META).forEach(type=>body.classList.toggle(`math-ws-hide-${type}`,!!state.hidden[type]));
    body.style.setProperty('--math-ws-font-scale',String(state.fontScale));
    body.style.setProperty('--math-ws-line-height',String(state.lineHeight));
    applySearch();
  }

  function scanContent(){
    const roots=[q('#view'),q('#modalBody')].filter(Boolean);
    roots.forEach(root=>{
      Object.entries(TYPE_META).forEach(([type,meta])=>{
        meta.selectors.forEach(selector=>{
          qa(selector,root).forEach(el=>{
            if(el===root || el.matches('#mathWorkspacePanel,#mathWorkspaceLab')) return;
            const types=new Set((el.dataset.mathWsType||'').split(/\s+/).filter(Boolean)); types.add(type);
            el.dataset.mathWsType=Array.from(types).join(' ');
            el.dataset.mathWsLabel=Array.from(types).map(t=>TYPE_META[t]?.label||t).join(' · ');
          });
        });
      });
    });
  }

  function applySearch(){
    const query=String(state.query||'').trim().toLocaleLowerCase('vi');
    qa('[data-math-ws-search-hidden="true"]').forEach(el=>el.removeAttribute('data-math-ws-search-hidden'));
    if(!query) return;
    const roots=[q('#view'),q('#modalBody')].filter(Boolean);
    roots.forEach(root=>{
      let candidates=qa('[data-math-ws-type], .slide-section, article.content-block, article.card',root);
      if(!candidates.length) candidates=qa('article',root);
      candidates.forEach(el=>{
        const text=(el.textContent||'').toLocaleLowerCase('vi');
        if(text && !text.includes(query)) el.dataset.mathWsSearchHidden='true';
      });
    });
  }

  function countTypes(){
    const out={}; Object.keys(TYPE_META).forEach(type=>out[type]=qa(`[data-math-ws-type~="${type}"]`).length); return out;
  }

  function buildOutline(){
    const wrap=q('#mathWsOutline'); if(!wrap) return;
    qa('[data-math-ws-outline-id]').forEach(el=>el.removeAttribute('data-math-ws-outline-id'));
    const roots=[q('#view'),q('#modalBody')].filter(Boolean);
    const headings=[];
    roots.forEach(root=>qa('h1,h2,h3,h4',root).forEach(el=>{ if(el.offsetParent!==null && (el.textContent||'').trim()) headings.push(el); }));
    if(!headings.length){ wrap.innerHTML='<div class="math-ws-empty">Chưa có tiêu đề trong màn hiện tại.</div>'; return; }
    wrap.innerHTML=headings.slice(0,40).map((el,index)=>{
      const id=`mwo-${index}`; el.dataset.mathWsOutlineId=id; const level=Math.min(3,Math.max(2,Number(el.tagName.slice(1))));
      return `<button type="button" data-outline-index="${id}" data-level="${level}">${esc((el.textContent||'').trim().slice(0,120))}</button>`;
    }).join('');
  }

  function updateSearchInfo(){
    const el=q('#mathWsSearchInfo'); if(!el) return;
    const hidden=qa('[data-math-ws-search-hidden="true"]').length;
    el.textContent=state.query ? `${hidden} khối không khớp đang được ẩn tạm thời.` : 'Chỉ lọc phần đang hiển thị, không sửa dữ liệu nguồn.';
  }

  function refresh(force){
    ensureTopButtons(); scanContent(); applyState(); buildOutline(); renderTypeToggles(); updateSearchInfo();
    if(force) refreshCount++;
  }
  function scheduleRefresh(){ clearTimeout(refreshTimer); refreshTimer=setTimeout(()=>refresh(false),140); }

  function openVault(){
    const buttons=qa('#nav button, nav button');
    const target=buttons.find(b=>/dữ liệu|kho môn học|storage/i.test((b.textContent||'')+' '+(b.dataset.page||'')+' '+(b.dataset.view||'')));
    if(target){ target.click(); closePanel(); setTimeout(()=>refresh(false),220); return; }
    const api=global.__BAUMAN_CORE_API;
    if(api?.state){ api.state.view='storage'; try{ api.save?.(); api.render?.(); }catch(_){ } closePanel(); setTimeout(()=>refresh(false),220); return; }
    toast('Runtime hiện tại chưa mở route Kho môn học từ màn này.');
  }

  function resetWorkspace(){
    state={...defaults,hidden:{...defaults.hidden}}; save(); applyState(); syncControls(); refresh(true); toast('Đã khôi phục giao diện mặc định');
  }

  function parseVector(value){ return String(value||'').split(/[;,\s]+/).map(Number).filter(Number.isFinite); }
  function renderVectorTool(){
    const out=q('#mathVectorResult'); if(!out) return;
    const u=parseVector(q('#mathToolU')?.value), v=parseVector(q('#mathToolV')?.value);
    if(!u.length || u.length!==v.length){ out.textContent='Hai vector phải cùng số chiều và chứa số hợp lệ.'; return; }
    const dot=u.reduce((s,x,i)=>s+x*v[i],0), nu=Math.hypot(...u), nv=Math.hypot(...v), sum=u.map((x,i)=>x+v[i]);
    const cos=nu&&nv?dot/(nu*nv):NaN;
    out.textContent=`u+v = [${sum.map(x=>fmt(x)).join(', ')}]\nu·v = ${fmt(dot)}\n||u||₂ = ${fmt(nu)} · ||v||₂ = ${fmt(nv)}\ncos(u,v) = ${fmt(cos)}`;
  }
  function renderMatrixTool(){
    const out=q('#mathMatrixResult'); if(!out) return;
    const a=num(q('#mathM11')?.value,1),b=num(q('#mathM12')?.value,0),c=num(q('#mathM21')?.value,0),d=num(q('#mathM22')?.value,1),det=a*d-b*c;
    let inv='Không khả nghịch (det = 0)';
    if(Math.abs(det)>1e-10) inv=`A⁻¹ = 1/${fmt(det)} · [[${fmt(d)}, ${fmt(-b)}], [${fmt(-c)}, ${fmt(a)}]]`;
    out.textContent=`det(A) = ${fmt(det)}\n${inv}`;
  }

  function labDefaults(mode){
    if(mode==='vector') return {ux:3,uy:2,vx:-1,vy:3};
    if(mode==='matrix') return {a:1.2,b:.5,c:-.3,d:1.1,x:2,y:1};
    return {a:1,b:0,c:-2};
  }
  function currentLabValues(){
    const values={}; qa('#mathLabControls [data-lab-key]').forEach(input=>values[input.dataset.labKey]=num(input.value,0)); return values;
  }
  function controlRow(key,label,value,min,max,step){
    return `<div class="math-ws-lab-row"><label>${label}</label><input type="range" data-lab-range="${key}" min="${min}" max="${max}" step="${step}" value="${value}"><input type="number" data-lab-key="${key}" min="${min}" max="${max}" step="${step}" value="${value}"></div>`;
  }
  function renderLabControls(values){
    const wrap=q('#mathLabControls'); if(!wrap) return;
    if(state.labMode==='vector') wrap.innerHTML=controlRow('ux','uₓ',values.ux,-5,5,.1)+controlRow('uy','uᵧ',values.uy,-5,5,.1)+controlRow('vx','vₓ',values.vx,-5,5,.1)+controlRow('vy','vᵧ',values.vy,-5,5,.1);
    else if(state.labMode==='matrix') wrap.innerHTML=controlRow('a','a₁₁',values.a,-3,3,.1)+controlRow('b','a₁₂',values.b,-3,3,.1)+controlRow('c','a₂₁',values.c,-3,3,.1)+controlRow('d','a₂₂',values.d,-3,3,.1)+controlRow('x','x',values.x,-4,4,.1)+controlRow('y','y',values.y,-4,4,.1);
    else wrap.innerHTML=controlRow('a','a',values.a,-3,3,.1)+controlRow('b','b',values.b,-5,5,.1)+controlRow('c','c',values.c,-6,6,.1);
    qa('[data-lab-range]',wrap).forEach(range=>range.addEventListener('input',event=>{ const input=q(`[data-lab-key="${event.target.dataset.labRange}"]`,wrap); if(input) input.value=event.target.value; drawLab(); }));
    qa('[data-lab-key]',wrap).forEach(input=>input.addEventListener('input',event=>{ const range=q(`[data-lab-range="${event.target.dataset.labKey}"]`,wrap); if(range) range.value=event.target.value; drawLab(); }));
  }

  function axesSvg(scale=40){
    let grid=''; for(let x=-280;x<=280;x+=scale) grid+=`<line x1="${x}" y1="-190" x2="${x}" y2="190" stroke="rgba(148,163,184,.09)"/>`; for(let y=-160;y<=160;y+=scale) grid+=`<line x1="-300" y1="${y}" x2="300" y2="${y}" stroke="rgba(148,163,184,.09)"/>`;
    return `<defs><marker id="mathWsArrowCyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#67e8f9"/></marker><marker id="mathWsArrowGold" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24"/></marker><marker id="mathWsArrowPink" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f472b6"/></marker></defs>${grid}<line x1="-300" y1="0" x2="300" y2="0" stroke="#6b839b" stroke-width="1.4"/><line x1="0" y1="-190" x2="0" y2="190" stroke="#6b839b" stroke-width="1.4"/>`;
  }
  function arrow(x,y,color,marker,label,scale=40){ const ex=x*scale, ey=-y*scale; return `<line x1="0" y1="0" x2="${ex}" y2="${ey}" stroke="${color}" stroke-width="4" marker-end="url(#${marker})"/><text x="${ex+8}" y="${ey-8}" fill="${color}" font-size="14" font-weight="800">${label}</text>`; }

  function renderLab(){
    syncControls(); const values=labDefaults(state.labMode); renderLabControls(values); drawLab();
  }
  function resetLab(){ renderLab(); }
  function drawLab(){
    const svg=q('#mathLabSvg'), title=q('#mathLabTitle'), formula=q('#mathLabFormula'), readout=q('#mathLabReadout'), note=q('#mathLabNote'); if(!svg||!readout) return;
    const v=currentLabValues(), scale=40; let content=axesSvg(scale), cards=[];
    if(state.labMode==='vector'){
      title.textContent='Vector 2D · cộng và tích vô hướng'; formula.textContent='w = u + v · u·v = uₓvₓ + uᵧvᵧ';
      const sx=v.ux+v.vx, sy=v.uy+v.vy, dot=v.ux*v.vx+v.uy*v.vy, nu=Math.hypot(v.ux,v.uy), nv=Math.hypot(v.vx,v.vy), cos=nu&&nv?dot/(nu*nv):NaN;
      content+=arrow(v.ux,v.uy,'#67e8f9','mathWsArrowCyan','u',scale)+arrow(v.vx,v.vy,'#fbbf24','mathWsArrowGold','v',scale)+arrow(sx,sy,'#f472b6','mathWsArrowPink','u+v',scale);
      cards=[['Tổng',`[${fmt(sx)}, ${fmt(sy)}]`],['Tích vô hướng',fmt(dot)],['cos góc',fmt(cos)]];
      note.textContent='Dùng để nhìn trực quan phép cộng vector, độ dài và góc. Đây là nền cho projection, cosine similarity, gradient và dữ liệu nhiều chiều.';
    }else if(state.labMode==='matrix'){
      title.textContent='Ma trận 2×2 · biến đổi tuyến tính'; formula.textContent='y = Ax · det(A) = a₁₁a₂₂ − a₁₂a₂₁';
      const tx=v.a*v.x+v.b*v.y, ty=v.c*v.x+v.d*v.y, det=v.a*v.d-v.b*v.c;
      content+=arrow(v.x,v.y,'#67e8f9','mathWsArrowCyan','x',scale)+arrow(tx,ty,'#fbbf24','mathWsArrowGold','Ax',scale);
      const e1x=v.a,e1y=v.c,e2x=v.b,e2y=v.d;
      const pts=`0,0 ${e1x*scale},${-e1y*scale} ${(e1x+e2x)*scale},${-(e1y+e2y)*scale} ${e2x*scale},${-e2y*scale}`;
      content+=`<polygon points="${pts}" fill="rgba(56,189,248,.08)" stroke="rgba(56,189,248,.55)" stroke-width="2"/>`;
      cards=[['det(A)',fmt(det)],['Vector vào',`[${fmt(v.x)}, ${fmt(v.y)}]`],['Vector ra',`[${fmt(tx)}, ${fmt(ty)}]`]];
      note.textContent=Math.abs(det)<.08?'Định thức gần 0: phép biến đổi gần làm sụp một chiều, ma trận kém khả nghịch.':'Diện tích hình bình hành đổi theo |det(A)|; dấu định thức cho biết hướng có bị đảo hay không.';
    }else{
      title.textContent='Hàm bậc hai · hình dạng và nghiệm'; formula.textContent='y = ax² + bx + c';
      let d=''; for(let px=-300;px<=300;px+=3){ const x=px/scale, y=v.a*x*x+v.b*x+v.c, py=-y*scale; if(py<-260||py>260){ if(d) d+=' '; continue; } d+=(d?' L ':'M ')+`${px.toFixed(1)} ${py.toFixed(1)}`; }
      content+=`<path d="${d}" fill="none" stroke="#67e8f9" stroke-width="3.5" stroke-linecap="round"/>`;
      const delta=v.b*v.b-4*v.a*v.c, xv=Math.abs(v.a)>1e-10?-v.b/(2*v.a):NaN, yv=Number.isFinite(xv)?v.a*xv*xv+v.b*xv+v.c:NaN;
      if(Number.isFinite(xv)&&Math.abs(xv)<=7.5&&Math.abs(yv)<=5) content+=`<circle cx="${xv*scale}" cy="${-yv*scale}" r="5" fill="#fbbf24"/>`;
      cards=[['Δ',fmt(delta)],['Đỉnh',Number.isFinite(xv)?`(${fmt(xv)}, ${fmt(yv)})`:'Không có'],['Số nghiệm thực',Math.abs(v.a)<1e-10?(Math.abs(v.b)>1e-10?'1':'—'):(delta>1e-10?'2':Math.abs(delta)<=1e-10?'1':'0')]];
      note.textContent='Thay đổi a, b, c để nhìn ngay tác động lên độ cong, vị trí đỉnh và số nghiệm. Mô phỏng dùng hệ trục chuẩn, không thay cho chứng minh đại số.';
    }
    svg.innerHTML=content;
    readout.innerHTML=cards.map(([label,value])=>`<article><span>${esc(label)}</span><strong>${esc(value)}</strong></article>`).join('');
  }

  function selfCheck(){
    return {
      release:'MATH_WORKSPACE_V1', ready:!!q('#mathWorkspacePanel'), lab:!!q('#mathWorkspaceLab'),
      topButtons:!!q('#mathWsTopLab')&&!!q('#mathWsTopControl'), mutationObserver:false,
      taggedBlocks:qa('[data-math-ws-type]').length, lessonDataWrites:false, readerOwnership:false
    };
  }

  function init(){
    if(!document.body || document.body.dataset.mathWorkspaceInit==='1') return;
    document.body.dataset.mathWorkspaceInit='1'; build(); refresh(true);
    [450,1200,2600].forEach(ms=>setTimeout(()=>refresh(false),ms));
    global.BAUMAN_MATH_WORKSPACE={openLab,openControl:()=>openPanel('content'),refresh,selfCheck,getState:()=>JSON.parse(JSON.stringify(state))};
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})(window);
