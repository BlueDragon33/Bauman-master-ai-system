/* E215 Reader Pro adaptive typography + fit guard. */
(function(){
  'use strict';
  var RELEASE='E215_READER_PRO_DENSITY_FIT';
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
    if(document.getElementById('e215-reader-fit-style'))return;
    var css=''
      +'.e132-overlay-deck.open.e211-reader-pro{--readerHero:56%;--readerCards:190px}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-slide{height:min(724px,calc(100vh - 88px))!important;grid-template-columns:86px minmax(0,1fr)!important;gap:10px!important;padding:10px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-side{padding:9px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-side strong{font-size:clamp(30px,3.1vw,42px)!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-side small{display:-webkit-box!important;-webkit-line-clamp:4!important;-webkit-box-orient:vertical!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-main{height:100%!important;min-height:0!important;display:grid!important;grid-template-rows:minmax(0,var(--readerHero)) minmax(var(--readerCards),1fr)!important;gap:10px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-hero{height:100%!important;min-height:0!important;grid-template-columns:minmax(0,1.55fr) minmax(300px,.9fr)!important;gap:12px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-hero-copy{min-height:0!important;justify-content:flex-start!important;padding:4px 4px 2px!important;overflow:auto!important;scrollbar-width:thin}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-main h1{font-size:clamp(28px,2.4vw,40px)!important;line-height:1.05!important;margin:0!important;display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-source-line,.e132-overlay-deck.open.e211-reader-pro .e210-source-line{font-size:12px!important;line-height:1.25!important;margin:2px 0 0!important;color:#9ed9ff!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-insight{max-height:112px!important;margin:4px 0 0!important;padding-right:4px!important;overflow:auto!important;scrollbar-width:thin}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-insight.is-light{font-size:clamp(17px,1.32vw,21px)!important;line-height:1.52!important;font-weight:720}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-insight.is-normal{font-size:clamp(14px,1vw,17px)!important;line-height:1.45!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-insight.is-dense{font-size:clamp(12.5px,.9vw,14.5px)!important;line-height:1.33!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-insight.is-overflow{font-size:clamp(11.8px,.8vw,13.5px)!important;line-height:1.27!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-formula-strip{max-width:100%!important;padding:7px 9px!important;margin-top:2px!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-formula-strip code{font-size:clamp(12px,.86vw,14px)!important;line-height:1.28!important;-webkit-line-clamp:3!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-visual{height:100%!important;min-height:0!important;max-height:100%!important;padding:10px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel{height:100%!important;max-height:100%!important;overflow:auto!important;scrollbar-width:thin}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel h3{font-size:clamp(13px,.92vw,16px)!important;line-height:1.2!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel .e211-slide-name{font-size:clamp(14px,1vw,18px)!important;line-height:1.22!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel .e211-summary-lead{font-size:clamp(14px,1vw,17px)!important;line-height:1.42!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel.is-light{justify-content:center!important;padding:18px!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel.is-light .e211-summary-lead{font-size:clamp(18px,1.52vw,24px)!important;line-height:1.43!important;font-weight:760}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel.is-light .e211-slide-name{font-size:clamp(16px,1.22vw,21px)!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel.is-dense .e211-summary-lead{font-size:clamp(12.5px,.86vw,14.5px)!important;line-height:1.32!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel.is-overflow .e211-summary-lead{font-size:clamp(11.8px,.78vw,13.2px)!important;line-height:1.25!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-note{font-size:11.5px!important;line-height:1.25!important;margin-top:2px!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-grid.e202-card-grid{height:100%!important;min-height:0!important;max-height:none!important;display:grid!important;grid-template-columns:1.1fr 1fr .95fr!important;grid-auto-rows:1fr!important;gap:10px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card{height:100%!important;min-height:0!important;padding:11px 13px!important;overflow:auto!important;scrollbar-width:thin}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card h3{font-size:clamp(16px,1.08vw,20px)!important;line-height:1.16!important;margin:0!important;overflow-wrap:anywhere}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card p.e132-full-body{font-size:clamp(12.5px,.86vw,15px)!important;line-height:1.36!important;margin:0!important;overflow-wrap:anywhere}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="light"] h3{font-size:clamp(18px,1.24vw,22px)!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="light"] p.e132-full-body{font-size:clamp(14px,1vw,17px)!important;line-height:1.43!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="dense"] p.e132-full-body{font-size:clamp(12px,.8vw,13.8px)!important;line-height:1.29!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="overflow"] p.e132-full-body{font-size:clamp(11.4px,.74vw,13px)!important;line-height:1.24!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-card-kicker{font-size:10.5px!important;padding:4px 7px!important;margin-bottom:5px!important}'
      +'@media(max-height:760px){.e132-overlay-deck.open.e211-reader-pro{--readerHero:54%;--readerCards:178px}.e132-overlay-deck.open.e211-reader-pro .e132-clean-main h1{font-size:clamp(24px,2.1vw,34px)!important}.e132-overlay-deck.open.e211-reader-pro .e202-insight{max-height:84px!important}.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel .e211-summary-lead{font-size:clamp(12px,.82vw,14px)!important;line-height:1.28!important}}'
      +'@media(max-width:1100px){.e132-overlay-deck.open.e211-reader-pro .e202-hero{grid-template-columns:1fr!important}.e132-overlay-deck.open.e211-reader-pro .e202-visual{display:none!important}.e132-overlay-deck.open.e211-reader-pro .e132-clean-grid.e202-card-grid{grid-template-columns:1fr!important;overflow:auto!important}}';
    var s=document.createElement('style');
    s.id='e215-reader-fit-style';
    s.textContent=css;
    document.head.appendChild(s);
  }

  function baseDensity(el){
    var t=text(el), len=t.length, h=el.getBoundingClientRect().height||1, score=len/(h/100);
    if(len<150&&h>150)return 'light';
    if(score<125)return 'light';
    if(score<245)return 'normal';
    if(score<380)return 'dense';
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
      if(el.scrollHeight>el.clientHeight+8)setDensity(el,'dense');
      requestAnimationFrame(function(){
        if(el.scrollHeight>el.clientHeight+8)setDensity(el,'overflow');
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
  window.BAUMAN_MATH_E212_READER_FIT={release:RELEASE,apply:apply,selfCheck:function(){return {ok:true,release:RELEASE,readerPro:isReaderPro(),cards:document.querySelectorAll('.e132-clean-card[data-e212-fit="1"]').length,panel:!!document.querySelector('.e211-extension-panel[data-e212-density]')};}};
})();
