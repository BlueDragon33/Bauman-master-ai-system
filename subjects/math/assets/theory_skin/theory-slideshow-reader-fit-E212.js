/* E216 Reader Pro adaptive typography + hard fit guard. */
(function(){
  'use strict';
  var RELEASE='E216_READER_PRO_DENSITY_FIT';
  var last='';

  function text(n){return (n&&n.textContent||'').replace(/\s+/g,' ').trim();}
  function deck(){return document.querySelector('.e132-overlay-deck.open');}
  function isReaderPro(){
    var d=deck();
    if(!d)return false;
    var m=text(d.querySelector('[data-e202-mode], .e132-clean-role'));
    return /Reader Pro/i.test(m);
  }

  function ensureStyle(){
    if(document.getElementById('e216-reader-fit-style'))return;
    var old=document.getElementById('e215-reader-fit-style');
    if(old&&old.parentNode)old.parentNode.removeChild(old);
    var css=''
      +'.e132-overlay-deck.open.e211-reader-pro{--readerHero:55%;--readerCards:218px}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-slide{height:min(724px,calc(100vh - 88px))!important;grid-template-columns:86px minmax(0,1fr)!important;gap:10px!important;padding:10px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-side{padding:9px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-side strong{font-size:clamp(30px,3.1vw,42px)!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-side small{display:-webkit-box!important;-webkit-line-clamp:4!important;-webkit-box-orient:vertical!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-main{height:100%!important;min-height:0!important;display:grid!important;grid-template-rows:minmax(0,var(--readerHero)) minmax(var(--readerCards),1fr)!important;gap:10px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-hero{height:100%!important;min-height:0!important;grid-template-columns:minmax(0,1.58fr) minmax(300px,.92fr)!important;gap:12px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-hero-copy{min-height:0!important;justify-content:flex-start!important;padding:4px 4px 2px!important;overflow:auto!important;scrollbar-width:thin}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-main h1{font-size:clamp(36px,3.45vw,56px)!important;line-height:1.02!important;margin:0!important;display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-source-line,.e132-overlay-deck.open.e211-reader-pro .e210-source-line{font-size:13px!important;line-height:1.25!important;margin:4px 0 0!important;color:#9ed9ff!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-insight{max-height:132px!important;margin:6px 0 0!important;padding-right:4px!important;overflow:auto!important;scrollbar-width:thin}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-insight.is-light{font-size:clamp(24px,1.9vw,34px)!important;line-height:1.32!important;font-weight:760}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-insight.is-normal{font-size:clamp(19px,1.45vw,26px)!important;line-height:1.36!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-insight.is-dense{font-size:clamp(14px,1vw,18px)!important;line-height:1.25!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-insight.is-overflow{font-size:clamp(11.8px,.82vw,15px)!important;line-height:1.18!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-formula-strip{max-width:100%!important;padding:7px 9px!important;margin-top:2px!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-formula-strip code{font-size:clamp(13px,.92vw,15px)!important;line-height:1.25!important;-webkit-line-clamp:3!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-visual{height:100%!important;min-height:0!important;max-height:100%!important;padding:10px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel{height:100%!important;max-height:100%!important;overflow:auto!important;scrollbar-width:thin;overscroll-behavior:contain}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel .e211-panel-title{font-size:clamp(28px,2.1vw,40px)!important;line-height:1.04!important;margin:0!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel .e211-summary-lead{font-size:clamp(20px,1.52vw,30px)!important;line-height:1.3!important;margin:0!important;overflow-wrap:anywhere}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel.is-light{justify-content:center!important;padding:24px!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel.is-light .e211-panel-title{font-size:clamp(32px,2.42vw,46px)!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel.is-light .e211-summary-lead{font-size:clamp(27px,2.12vw,40px)!important;line-height:1.24!important;font-weight:760}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel.is-normal .e211-summary-lead{font-size:clamp(21px,1.62vw,31px)!important;line-height:1.29!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel.is-dense .e211-summary-lead{font-size:clamp(15px,1.08vw,20px)!important;line-height:1.24!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel.is-overflow .e211-summary-lead{font-size:clamp(11.8px,.82vw,15.5px)!important;line-height:1.16!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-grid.e202-card-grid{height:100%!important;min-height:0!important;max-height:none!important;display:grid!important;grid-template-columns:1.08fr 1fr .95fr!important;grid-auto-rows:minmax(0,1fr)!important;gap:12px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card{height:100%!important;min-height:0!important;padding:18px 20px!important;overflow:auto!important;scrollbar-width:thin;overscroll-behavior:contain}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card h3{font-size:clamp(24px,1.82vw,34px)!important;line-height:1.06!important;margin:0 0 8px!important;overflow-wrap:anywhere}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card p.e132-full-body{font-size:clamp(18px,1.35vw,25px)!important;line-height:1.32!important;margin:0!important;overflow-wrap:anywhere}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="light"] h3{font-size:clamp(28px,2.08vw,40px)!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="light"] p.e132-full-body{font-size:clamp(24px,1.9vw,36px)!important;line-height:1.22!important;font-weight:730}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="normal"] p.e132-full-body{font-size:clamp(18px,1.35vw,25px)!important;line-height:1.32!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="dense"] h3{font-size:clamp(17px,1.16vw,22px)!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="dense"] p.e132-full-body{font-size:clamp(12.8px,.86vw,16px)!important;line-height:1.22!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="overflow"] h3{font-size:clamp(15px,1vw,20px)!important;margin-bottom:5px!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="overflow"] p.e132-full-body{font-size:clamp(11.2px,.72vw,14px)!important;line-height:1.14!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-card-kicker{font-size:12px!important;padding:5px 9px!important;margin-bottom:8px!important}'
      +'@media(max-height:760px){.e132-overlay-deck.open.e211-reader-pro{--readerHero:53%;--readerCards:192px}.e132-overlay-deck.open.e211-reader-pro .e132-clean-main h1{font-size:clamp(28px,2.35vw,42px)!important}.e132-overlay-deck.open.e211-reader-pro .e202-insight{max-height:94px!important}.e132-overlay-deck.open.e211-reader-pro .e132-clean-card{padding:13px 15px!important}.e132-overlay-deck.open.e211-reader-pro .e132-clean-card h3{font-size:clamp(19px,1.35vw,26px)!important}.e132-overlay-deck.open.e211-reader-pro .e132-clean-card p.e132-full-body{font-size:clamp(14px,1vw,19px)!important;line-height:1.24!important}.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel .e211-summary-lead{font-size:clamp(15px,1.06vw,20px)!important;line-height:1.21!important}}'
      +'@media(max-width:1100px){.e132-overlay-deck.open.e211-reader-pro .e202-hero{grid-template-columns:1fr!important}.e132-overlay-deck.open.e211-reader-pro .e202-visual{display:none!important}.e132-overlay-deck.open.e211-reader-pro .e132-clean-grid.e202-card-grid{grid-template-columns:1fr!important;overflow:auto!important}}';
    var s=document.createElement('style');
    s.id='e216-reader-fit-style';
    s.textContent=css;
    document.head.appendChild(s);
  }

  function baseDensity(el){
    var t=text(el), len=t.length, h=el.getBoundingClientRect().height||1, score=len/(h/100);
    if(len<120&&h>130)return 'light';
    if(score<105)return 'light';
    if(score<220)return 'normal';
    if(score<350)return 'dense';
    return 'overflow';
  }
  function setDensity(el,kind){
    ['is-light','is-normal','is-dense','is-overflow'].forEach(function(c){el.classList.remove(c);});
    el.classList.add('is-'+kind);
    el.setAttribute('data-e212-density',kind);
  }
  function fitElement(el){
    if(!el)return;
    setDensity(el,baseDensity(el));
    requestAnimationFrame(function(){
      if(el.scrollHeight>el.clientHeight+6)setDensity(el,'dense');
      requestAnimationFrame(function(){
        if(el.scrollHeight>el.clientHeight+6)setDensity(el,'overflow');
      });
    });
  }

  function apply(){
    var d=deck();
    if(!d||!isReaderPro())return;
    ensureStyle();
    var sig=text(d.querySelector('[data-e202-count]'))+'|'+text(d.querySelector('.e132-clean-main h1'))+'|'+text(d.querySelector('.e132-clean-grid'))+'|'+text(d.querySelector('.e211-extension-panel'));
    if(sig===last)return;
    last=sig;

    fitElement(d.querySelector('.e202-insight'));
    fitElement(d.querySelector('.e211-extension-panel'));

    var cards=Array.prototype.slice.call(d.querySelectorAll('.e132-clean-card'));
    cards.forEach(function(card,i){
      card.setAttribute('data-e212-fit','1');
      if(i===0){
        var k=card.querySelector('.e132-card-kicker');
        if(k)k.textContent='Tóm tắt ý chính của slide';
      }
      fitElement(card);
    });
  }

  var scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;apply();});}
  function boot(){
    apply();
    try{new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}catch(_){}
    document.addEventListener('click',function(){setTimeout(schedule,0);},true);
    document.addEventListener('keydown',function(){setTimeout(schedule,0);},true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.BAUMAN_MATH_E212_READER_FIT={release:RELEASE,apply:apply,selfCheck:function(){return {ok:true,release:RELEASE,readerPro:isReaderPro(),cards:document.querySelectorAll('.e132-clean-card[data-e212-fit="1"]').length,panel:!!document.querySelector('.e211-extension-panel[data-e212-density], .e211-extension-panel[data-e212-density]')};}};
})();