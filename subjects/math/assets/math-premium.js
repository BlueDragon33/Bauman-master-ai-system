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
    wrap.innerHTML='<input id="mathPremiumSearch" class="math-premium-search" type="search" autocomplete="off" placeholder="Tìm toàn môn: PCA, ma trận, covariance, bài tập…"><span class="math-premium-search-hint">Enter</span>';
    const actions=$('.top-actions',top);
    if(actions) top.insertBefore(wrap,actions); else top.appendChild(wrap);
    $('#mathPremiumSearch')?.addEventListener('keydown',event=>{
      if(event.key!=='Enter') return;
      const value=event.target.value.trim();
      global.BAUMAN_MATH_STUDY_LIBRARY?.openSearch?.(value);
    });
  }

  function cleanupLegacySurface(){
    // L04/L05 learner-first ownership:
    // dashboard belongs to math-dashboard.js and primary navigation belongs
    // exclusively to math-navigation.js. Premium may enhance appearance/search,
    // but it must never create a competing dashboard or persistent nav controls.
    $('#mathPremiumDashboard')?.remove();
    $('#mathPremiumOverview')?.remove();
    $('#mathPremiumControl')?.remove();
  }

  function textNumber(el){
    const m=String(el?.textContent||'').match(/\d[\d.,]*/);
    return m?m[0]:'—';
  }

  function bind(){
    document.addEventListener('click',event=>{
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
    cleanupLegacySurface();
    ensureSearch();
  }

  function selfCheck(){
    return {
      release:RELEASE,
      ready:document.body.classList.contains('math-premium-ready'),
      duplicateDashboard:!!$('#mathPremiumDashboard'),
      duplicateNav:!!$('#mathPremiumOverview')||!!$('#mathPremiumControl'),
      search:!!$('#mathPremiumSearch'),
      mutationObserver:false,
      contentWrites:false,
      routeOwnership:false,
      visualEnhancementOnly:true
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
