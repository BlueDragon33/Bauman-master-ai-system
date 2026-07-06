/* E217 Reader Pro adaptive typography: large-first scale + progressive fit guard. */
(function(){
  'use strict';
  var RELEASE='E217_READER_PRO_LARGE_FIRST_FIT';
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
    if(document.getElementById('e217-reader-fit-style'))return;
    ['e215-reader-fit-style','e216-reader-fit-style'].forEach(function(id){
      var old=document.getElementById(id);
      if(old&&old.parentNode)old.parentNode.removeChild(old);
    });
    var css=''
      +'.e132-overlay-deck.open.e211-reader-pro{--readerHero:54%;--readerCards:236px}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-slide{height:min(724px,calc(100vh - 88px))!important;grid-template-columns:86px minmax(0,1fr)!important;gap:10px!important;padding:10px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-side{padding:9px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-side strong{font-size:clamp(34px,3.6vw,50px)!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-side small{display:-webkit-box!important;-webkit-line-clamp:4!important;-webkit-box-orient:vertical!important;overflow:hidden!important;font-size:13px!important;line-height:1.2!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-main{height:100%!important;min-height:0!important;display:grid!important;grid-template-rows:minmax(0,var(--readerHero)) minmax(var(--readerCards),1fr)!important;gap:10px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-hero{height:100%!important;min-height:0!important;grid-template-columns:minmax(0,1.58fr) minmax(300px,.92fr)!important;gap:12px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-hero-copy{min-height:0!important;justify-content:flex-start!important;padding:4px 6px 2px!important;overflow:auto!important;scrollbar-width:thin}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-main h1{font-size:clamp(44px,4.25vw,74px)!important;line-height:1!important;margin:0!important;display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-source-line,.e132-overlay-deck.open.e211-reader-pro .e210-source-line{font-size:clamp(16px,1.22vw,21px)!important;line-height:1.22!important;margin:6px 0 0!important;color:#9ed9ff!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-insight{max-height:178px!important;margin:10px 0 0!important;padding-right:8px!important;overflow:auto!important;scrollbar-width:thin;overflow-wrap:anywhere}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-insight.is-light{font-size:clamp(34px,2.75vw,52px)!important;line-height:1.14!important;font-weight:760}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-insight.is-normal{font-size:clamp(28px,2.15vw,42px)!important;line-height:1.18!important;font-weight:720}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-insight.is-dense{font-size:clamp(20px,1.48vw,28px)!important;line-height:1.18!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-insight.is-overflow{font-size:clamp(14px,1vw,19px)!important;line-height:1.16!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-formula-strip{max-width:100%!important;padding:7px 9px!important;margin-top:3px!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-formula-strip code{font-size:clamp(15px,1.1vw,19px)!important;line-height:1.2!important;-webkit-line-clamp:3!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-visual{height:100%!important;min-height:0!important;max-height:100%!important;padding:10px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel{height:100%!important;max-height:100%!important;overflow:auto!important;scrollbar-width:thin;overscroll-behavior:contain;padding:24px!important;gap:18px!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel .e211-panel-title{font-size:clamp(50px,4.1vw,78px)!important;line-height:.98!important;margin:0!important;letter-spacing:-.03em!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel .e211-summary-lead{font-size:clamp(32px,2.55vw,50px)!important;line-height:1.12!important;margin:0!important;overflow-wrap:anywhere}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel.is-light{justify-content:flex-start!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel.is-light .e211-summary-lead{font-size:clamp(40px,3.25vw,62px)!important;line-height:1.06!important;font-weight:760}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel.is-normal .e211-summary-lead{font-size:clamp(34px,2.7vw,52px)!important;line-height:1.1!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel.is-dense .e211-summary-lead{font-size:clamp(22px,1.65vw,32px)!important;line-height:1.14!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel.is-overflow .e211-summary-lead{font-size:clamp(15px,1.1vw,21px)!important;line-height:1.14!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-grid.e202-card-grid{height:100%!important;min-height:0!important;max-height:none!important;display:grid!important;grid-template-columns:1.08fr 1fr .95fr!important;grid-auto-rows:minmax(0,1fr)!important;gap:12px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card{height:100%!important;min-height:0!important;padding:22px 24px!important;overflow:auto!important;scrollbar-width:thin;overscroll-behavior:contain}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card h3{font-size:clamp(36px,2.85vw,54px)!important;line-height:1!important;margin:0 0 12px!important;letter-spacing:-.025em!important;overflow-wrap:anywhere}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card p.e132-full-body{font-size:clamp(28px,2.25vw,42px)!important;line-height:1.12!important;margin:0!important;overflow-wrap:anywhere}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="light"] h3{font-size:clamp(40px,3.15vw,60px)!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="light"] p.e132-full-body{font-size:clamp(34px,2.75vw,52px)!important;line-height:1.06!important;font-weight:740}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="normal"] h3{font-size:clamp(34px,2.55vw,50px)!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="normal"] p.e132-full-body{font-size:clamp(28px,2.2vw,42px)!important;line-height:1.1!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="dense"] h3{font-size:clamp(22px,1.62vw,32px)!important;margin-bottom:8px!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="dense"] p.e132-full-body{font-size:clamp(17px,1.24vw,24px)!important;line-height:1.16!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="overflow"] h3{font-size:clamp(16px,1.12vw,22px)!important;margin-bottom:6px!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="overflow"] p.e132-full-body{font-size:clamp(12.5px,.86vw,17px)!important;line-height:1.14!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-card-kicker{font-size:clamp(14px,1vw,18px)!important;padding:6px 11px!important;margin-bottom:10px!important}'
      +'@media(max-height:760px){.e132-overlay-deck.open.e211-reader-pro{--readerHero:52%;--readerCards:220px}.e132-overlay-deck.open.e211-reader-pro .e132-clean-main h1{font-size:clamp(38px,3.25vw,60px)!important}.e132-overlay-deck.open.e211-reader-pro .e202-insight{max-height:150px!important}.e132-overlay-deck.open.e211-reader-pro .e202-insight.is-light{font-size:clamp(30px,2.4vw,46px)!important}.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel .e211-panel-title{font-size:clamp(42px,3.35vw,64px)!important}.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel .e211-summary-lead{font-size:clamp(30px,2.35vw,46px)!important}.e132-overlay-deck.open.e211-reader-pro .e132-clean-card{padding:18px 20px!important}.e132-overlay-deck.open.e211-reader-pro .e132-clean-card h3{font-size:clamp(30px,2.3vw,46px)!important}.e132-overlay-deck.open.e211-reader-pro .e132-clean-card p.e132-full-body{font-size:clamp(24px,1.9vw,36px)!important;line-height:1.1!important}.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="dense"] p.e132-full-body{font-size:clamp(16px,1.16vw,22px)!important}.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="overflow"] p.e132-full-body{font-size:clamp(12px,.82vw,16px)!important}}'
      +'@media(max-width:1100px){.e132-overlay-deck.open.e211-reader-pro .e202-hero{grid-template-columns:1fr!important}.e132-overlay-deck.open.e211-reader-pro .e202-visual{display:none!important}.e132-overlay-deck.open.e211-reader-pro .e132-clean-grid.e202-card-grid{grid-template-columns:1fr!important;overflow:auto!important}}';
    var s=document.createElement('style');
    s.id='e217-reader-fit-style';
    s.textContent=css;
    document.head.appendChild(s);
  }

  function baseDensity(el){
    var t=text(el), len=t.length, h=el.getBoundingClientRect().height||1;
    if(el.classList.contains('e132-clean-card')){
      if(len<560)return 'light';
      if(len<900)return 'normal';
      if(len<1250)return 'dense';
      return 'overflow';
    }
    if(el.classList.contains('e211-extension-panel')){
      if(len<430)return 'light';
      if(len<720)return 'normal';
      if(len<1050)return 'dense';
      return 'overflow';
    }
    if(el.classList.contains('e202-insight')){
      if(len<520)return 'light';
      if(len<850)return 'normal';
      if(len<1150)return 'dense';
      return 'overflow';
    }
    var score=len/(h/100);
    if(score<180)return 'light';
    if(score<340)return 'normal';
    if(score<520)return 'dense';
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
      if(el.scrollHeight>el.clientHeight+8)setDensity(el,'normal');
      requestAnimationFrame(function(){
        if(el.scrollHeight>el.clientHeight+8)setDensity(el,'dense');
        requestAnimationFrame(function(){
          if(el.scrollHeight>el.clientHeight+8)setDensity(el,'overflow');
        });
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