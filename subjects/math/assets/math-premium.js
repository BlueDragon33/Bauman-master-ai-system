/* Bauman Math Premium UI
 * Visual/dashboard enhancement only. No MutationObserver, no content writes, no route ownership.
 */
(function mathPremium(global){
  'use strict';
  const RELEASE='MATH_PREMIUM_UI_V1';
  let refreshTimer=0;
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function ensureSearch(){
    const top=$('.topbar');
    if(!top || $('#mathPremiumSearchWrap')) return;
    const wrap=document.createElement('div');
    wrap.id='mathPremiumSearchWrap';
    wrap.className='math-premium-search-wrap';
    wrap.innerHTML='<input id="mathPremiumSearch" class="math-premium-search" type="search" autocomplete="off" placeholder="Tìm trong bài đang mở: ma trận, vector, covariance…"><span class="math-premium-search-hint">Enter</span>';
    const actions=$('.top-actions',top);
    if(actions) top.insertBefore(wrap,actions); else top.appendChild(wrap);
    $('#mathPremiumSearch')?.addEventListener('keydown',event=>{
      if(event.key!=='Enter') return;
      const value=event.target.value.trim();
      global.BAUMAN_MATH_WORKSPACE?.openControl?.();
      global.setTimeout(()=>{
        const target=$('#mathWsSearch');
        if(target){ target.value=value; target.dispatchEvent(new Event('input',{bubbles:true})); target.focus(); }
      },80);
    });
  }

  function ensureDashboard(){
    const main=$('.main');
    const view=$('#view');
    if(!main || !view || $('#mathPremiumDashboard')) return;
    const dash=document.createElement('section');
    dash.id='mathPremiumDashboard';
    dash.className='math-premium-dashboard';
    dash.innerHTML=`
      <section class="math-premium-hero">
        <div>
          <div class="math-premium-eyebrow">Bauman Math Workspace</div>
          <h1>Hành trình chinh phục Toán học cùng Bauman</h1>
          <p class="math-premium-hero-copy">Một không gian thống nhất để học lý thuyết, kiểm soát nội dung, thao tác công thức và quan sát mô phỏng — tập trung vào Toán cho AI, tín hiệu, điều khiển và nghiên cứu.</p>
          <div class="math-premium-hero-actions">
            <button type="button" class="math-premium-action primary" data-premium-action="continue">Tiếp tục học →</button>
            <button type="button" class="math-premium-action" data-premium-action="lab">∿ Mở Math Lab</button>
            <button type="button" class="math-premium-action" data-premium-action="control">☷ Kiểm soát nội dung</button>
          </div>
        </div>
        <aside class="math-premium-current">
          <div><span>Bài học hiện tại</span><strong id="mathPremiumLessonTitle">Đang đồng bộ bài học…</strong><small id="mathPremiumLessonId">E129 · Theory Reader</small></div>
          <div><div class="math-premium-current-bar"><i id="mathPremiumCurrentBar"></i></div><small id="mathPremiumCurrentNote">Đọc trực tiếp từ runtime hiện tại</small></div>
        </aside>
      </section>
      <section class="math-premium-metrics">
        <article class="math-premium-metric"><div class="math-premium-metric-icon">▦</div><div><b id="mathPremiumFrames">—</b><span>Khung chương</span></div></article>
        <article class="math-premium-metric gold"><div class="math-premium-metric-icon">▤</div><div><b id="mathPremiumRecords">—</b><span>Bài nội dung</span></div></article>
        <article class="math-premium-metric"><div class="math-premium-metric-icon">▱</div><div><b id="mathPremiumSlides">—</b><span>Slide đang mở</span></div></article>
        <article class="math-premium-metric green"><div class="math-premium-metric-icon">⌁</div><div><b id="mathPremiumBlocks">—</b><span>Khối có thể kiểm soát</span></div></article>
      </section>`;
    main.insertBefore(dash,view);
  }

  function ensureNav(){
    const nav=$('#nav'); if(!nav) return;
    if(!$('#mathPremiumOverview',nav)){
      const b=document.createElement('button');
      b.id='mathPremiumOverview'; b.type='button'; b.dataset.premiumAction='overview';
      b.innerHTML='<span>⌂</span><b>Tổng quan</b>';
      nav.insertBefore(b,nav.firstChild);
    }
    if(!$('#mathPremiumControl',nav)){
      const b=document.createElement('button');
      b.id='mathPremiumControl'; b.type='button'; b.dataset.premiumAction='control';
      b.innerHTML='<span>☷</span><b>Điều khiển</b>';
      nav.appendChild(b);
    }
  }

  function textNumber(el){
    const m=String(el?.textContent||'').match(/\d[\d.,]*/);
    return m?m[0]:'—';
  }

  function updateDashboard(){
    const title=$('[data-current-lesson] .e169-reader-title h2') || $('[data-current-lesson] h2') || $('.e169-reader-title h2') || $('.e129-placeholder h2');
    const lessonHost=$('[data-current-lesson]');
    const lessonTitle=$('#mathPremiumLessonTitle');
    const lessonId=$('#mathPremiumLessonId');
    if(lessonTitle) lessonTitle.textContent=(title?.textContent||'Lý thuyết Toán Bauman').trim();
    if(lessonId) lessonId.textContent=lessonHost?.getAttribute('data-current-lesson') || 'E129 · Theory Reader';

    const stats=$$('.e129-stat');
    const frames=$('#mathPremiumFrames'), records=$('#mathPremiumRecords');
    if(frames) frames.textContent=stats[0]?textNumber(stats[0]):textNumber($('.e129-side-head'));
    if(records) records.textContent=stats[1]?textNumber(stats[1]):'—';
    const slides=$$('.e129-slide').filter(el=>el.offsetParent!==null).length;
    const slideOut=$('#mathPremiumSlides'); if(slideOut) slideOut.textContent=slides||'—';
    const blocks=$$('[data-math-ws-type]').filter(el=>el.offsetParent!==null).length;
    const blockOut=$('#mathPremiumBlocks'); if(blockOut) blockOut.textContent=blocks||'—';
    const bar=$('#mathPremiumCurrentBar'); if(bar) bar.style.width=slides?`${Math.min(100,Math.max(28,slides*4))}%`:'38%';
    const note=$('#mathPremiumCurrentNote'); if(note) note.textContent=slides?`${slides} slide đang sẵn sàng trong bài hiện tại`:'Đọc trực tiếp từ runtime hiện tại';
  }

  function setOverviewActive(on){ $('#mathPremiumOverview')?.classList.toggle('active',!!on); }

  function onAction(action){
    if(action==='overview'){
      setOverviewActive(true);
      $('#mathPremiumDashboard')?.scrollIntoView({behavior:'smooth',block:'start'});
      return;
    }
    setOverviewActive(false);
    if(action==='continue'){ $('#view')?.scrollIntoView({behavior:'smooth',block:'start'}); return; }
    if(action==='lab'){ global.BAUMAN_MATH_WORKSPACE?.openLab?.(); return; }
    if(action==='control'){ global.BAUMAN_MATH_WORKSPACE?.openControl?.(); return; }
  }

  function bind(){
    document.addEventListener('click',event=>{
      const action=event.target.closest('[data-premium-action]')?.dataset.premiumAction;
      if(action){ event.preventDefault(); onAction(action); }
      if(event.target.closest('[data-e129-chapter],[data-e129-lesson],[data-e129-stage],[data-e129-nav],[data-e169-pick-activity],[data-e129-back-theory],[data-e129-refresh]')) scheduleRefresh(180);
    },true);
    global.addEventListener('hashchange',()=>scheduleRefresh(120));
    global.addEventListener('popstate',()=>scheduleRefresh(120));
  }

  function scheduleRefresh(delay=120){
    global.clearTimeout(refreshTimer);
    refreshTimer=global.setTimeout(refresh,delay);
  }

  function refresh(){
    ensureSearch(); ensureDashboard(); ensureNav();
    global.BAUMAN_MATH_WORKSPACE?.refresh?.();
    global.setTimeout(updateDashboard,30);
  }

  function selfCheck(){
    return {
      release:RELEASE,
      ready:document.body.classList.contains('math-premium-ready'),
      dashboard:!!$('#mathPremiumDashboard'),
      search:!!$('#mathPremiumSearch'),
      workspace:!!global.BAUMAN_MATH_WORKSPACE,
      mutationObserver:false,
      contentWrites:false,
      routeOwnership:false
    };
  }

  function init(){
    if(!document.body || document.body.dataset.mathPremiumInit==='1') return;
    document.body.dataset.mathPremiumInit='1';
    document.body.classList.add('math-premium-ready');
    bind(); refresh();
    [350,800,1500,2600].forEach(ms=>global.setTimeout(refresh,ms));
    global.BAUMAN_MATH_PREMIUM={release:RELEASE,refresh,selfCheck};
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})(window);
