'use strict';
(function(){
  const A=window.SUBJECT_ADAPTER||{};
  const CORE_KEY=A.storageKey||'bauman_russian_survival_master_v11_clean_skeleton';
  const SCHEMA='RUSSIAN_RU06_PRODUCTION_WORKBENCH_V1';
  const parse=(raw,fallback)=>{try{return raw?JSON.parse(raw):fallback}catch(_){return fallback}};
  const clean=v=>String(v??'').trim();
  const esc=v=>clean(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clone=v=>JSON.parse(JSON.stringify(v==null?null:v));
  const stageTargets={hk1:['R11','R12','R13','R14'],hk2:['R15','R16','R17','R18'],hk3:['R19','R20','R21','R22'],hk4:['R23','R24','R25','R26']};
  let data={technical:[],functions:[],reading:[],performance:[]},ready=false,selectedTarget='',renderQueued=false;
  const core=()=>parse(localStorage.getItem(CORE_KEY),{});
  const targetsForStage=stage=>stageTargets[clean(stage)]||[];
  const matches=(row,target)=>Array.isArray(row?.targets)&&row.targets.includes(target);
  async function load(){
    if(ready)return context();
    const [tech,funcs,reading,perf]=await Promise.all([
      fetch('data/technical-concepts.json',{cache:'force-cache'}).then(r=>r.ok?r.json():null),
      fetch('data/academic-functions.json',{cache:'force-cache'}).then(r=>r.ok?r.json():null),
      fetch('data/reading.json',{cache:'force-cache'}).then(r=>r.ok?r.json():null),
      fetch('data/performance-tasks.json',{cache:'force-cache'}).then(r=>r.ok?r.json():null)
    ]);
    data={
      technical:Array.isArray(tech?.concepts)?tech.concepts:[],
      functions:Array.isArray(funcs?.functions)?funcs.functions:[],
      reading:Array.isArray(reading?.tasks)?reading.tasks:[],
      performance:Array.isArray(perf?.tasks)?perf.tasks:[]
    };
    ready=true;schedule();window.dispatchEvent(new CustomEvent('russian:production-workbench',{detail:{type:'ready',schema:SCHEMA}}));
    return context();
  }
  function target(){
    const c=core(),allowed=targetsForStage(c.stage);
    if(selectedTarget&&allowed.includes(selectedTarget))return selectedTarget;
    const write=window.RussianAcademicLanguage?.activeWriting?.(c)?.item;
    const fromWrite=(write?.targets||[]).find(x=>allowed.includes(x));
    return fromWrite||allowed[0]||'';
  }
  function bundle(t=target()){
    const concepts=data.technical.filter(x=>matches(x,t));
    const funcs=data.functions.filter(x=>matches(x,t));
    const reading=data.reading.filter(x=>matches(x,t));
    const performance=data.performance.filter(x=>matches(x,t));
    return {target:t,concepts,functions:funcs,reading,performance};
  }
  function context(){
    const c=core(),b=bundle();
    return {schema:SCHEMA,active:c.view==='writing'&&c.writingMode==='academic',stage:clean(c.stage),...clone(b),policy:{canonicalDataReadOnly:true,officialScoringOwner:'RU04',fabricationAllowed:false}};
  }
  function chips(values){return values.filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('')}
  function panelHtml(){
    if(!ready)return '<section class="ru-production-workbench" data-ru-production-workbench="1"><b>Đang tải tuyến học thuật/kỹ thuật…</b></section>';
    const c=core(),allowed=targetsForStage(c.stage);
    if(!allowed.length)return `<section class="ru-production-workbench" data-ru-production-workbench="1"><header><div><span>RU06 · PRODUCTION</span><h3>Tuyến học thuật/kỹ thuật</h3></div></header><p>Tuyến RU06 bắt đầu từ R11. Giai đoạn hiện tại chưa có target R11–R26.</p></section>`;
    const b=bundle();
    const rd=b.reading[0],pt=b.performance[0],tc=b.concepts[0],af=b.functions[0];
    const options=allowed.map(t=>`<option value="${t}" ${t===b.target?'selected':''}>${t}</option>`).join('');
    const sourceRefs=(tc?.sourceRefs||[]).join(' · ');
    const patterns=(af?.patterns||[]).slice(0,3);
    return `<section class="ru-production-workbench" data-ru-production-workbench="1" role="region" aria-label="Russian academic technical production workbench">
      <header><div><span>RU06 · SOURCE → CLAIM → PRODUCTION → TRANSFER</span><h3>Production Workbench</h3><p>Dùng trực tiếp canonical owners; đây là tuyến luyện sản xuất, không tự chấm mastery và không tự tạo nguồn/citation.</p></div><label>Target<select data-ru-production-target>${options}</select></label></header>
      <div class="ru-production-grid">
        <article><i>01</i><h4>Đọc / nguồn</h4>${rd?`<b>${esc(rd.id)}</b><p>${esc(rd.genre)} · ${esc((rd.operations||[]).join(' → '))}</p><small>Đầu ra: ${esc(rd.output)}</small>`:'<p>Chưa có reading contract cho target này.</p>'}</article>
        <article><i>02</i><h4>Khái niệm & chức năng</h4>${tc?`<b>${esc(tc.ru)} · ${esc(tc.vi||tc.en||'')}</b><p>${esc(tc.domain||'')} · ${esc(tc.authorityStatus||'')}</p><small>${esc(sourceRefs||'Nguồn theo provenance registry')}</small>`:'<p>Không ép tạo thuật ngữ nếu chưa có canonical concept.</p>'}${af?`<div class="ru-production-pattern"><b>${esc(af.ruLabel||af.id)}</b>${chips(patterns)}</div>`:''}</article>
        <article><i>03</i><h4>Nhiệm vụ giao tiếp</h4>${pt?`<b>${esc(pt.id)}</b><p>Input: ${esc(pt.input)}</p><p>Output: ${esc(pt.output)}</p><small>Bằng chứng: ${esc((pt.evidenceTypes||[]).join(', '))}</small>`:'<p>Chưa có performance task cho target này.</p>'}</article>
        <article><i>04</i><h4>Viết / trình bày</h4><p>Dùng Writing Lab ngay bên dưới để tạo bản nháp → tự soát → viết lại. Rubric chỉ hỗ trợ; RU04 mới là owner của official scoring/mastery.</p><button type="button" data-ru-production-focus-writing>Đi tới Writing Lab</button></article>
      </div>
      <footer>Integrity: số liệu, công thức, code identifier, bảng/hình và kết quả thực nghiệm không được AI hoặc UI tự sửa nghĩa.</footer>
    </section>`;
  }
  function render(){
    const view=document.getElementById('view');if(!view)return;
    let panel=document.querySelector('[data-ru-production-workbench]');
    const c=core(),active=c.view==='writing'&&c.writingMode==='academic';
    if(!active){panel?.remove();return}
    if(!panel){panel=document.createElement('div');panel.dataset.ruProductionWorkbench='1';view.prepend(panel)}
    panel.outerHTML=panelHtml();
  }
  function schedule(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(()=>{renderQueued=false;render()})}
  document.addEventListener('change',e=>{if(e.target?.matches?.('[data-ru-production-target]')){selectedTarget=e.target.value;schedule()}},true);
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-ru-production-focus-writing]')){e.preventDefault();document.querySelector('.writing-studio textarea,[data-input="writingDraft"]')?.focus?.()}},true);
  document.addEventListener('DOMContentLoaded',()=>{load().catch(err=>{console.warn('Russian production workbench load failed',err);ready=true;schedule()});const view=document.getElementById('view');if(view)new MutationObserver(schedule).observe(view,{childList:true,subtree:false});schedule()});
  window.RussianProductionWorkbench={schema:SCHEMA,load,context,bundle,targetsForStage,policy:{canonicalDataReadOnly:true,writesMastery:false,writesOfficialScore:false}};
})();