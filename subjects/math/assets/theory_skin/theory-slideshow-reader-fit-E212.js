/* E219 Reader Pro fit: separate titles from body and keep body within four-size band. */
(function(){
  'use strict';
  var RELEASE='E219_READER_PRO_TITLE_BODY_SEPARATION';
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
    if(document.getElementById('e219-reader-fit-style'))return;
    ['e215-reader-fit-style','e216-reader-fit-style','e217-reader-fit-style','e218-reader-fit-style'].forEach(function(id){
      var old=document.getElementById(id);
      if(old&&old.parentNode)old.parentNode.removeChild(old);
    });
    var css=''
      +'.e132-overlay-deck.open.e211-reader-pro{--readerHero:56%;--readerCards:196px}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-slide{height:min(724px,calc(100vh - 88px))!important;grid-template-columns:86px minmax(0,1fr)!important;gap:10px!important;padding:10px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-side{padding:9px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-side strong{font-size:clamp(30px,3.1vw,42px)!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-side small{display:-webkit-box!important;-webkit-line-clamp:4!important;-webkit-box-orient:vertical!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-main{height:100%!important;min-height:0!important;display:grid!important;grid-template-rows:minmax(0,var(--readerHero)) minmax(var(--readerCards),1fr)!important;gap:10px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-hero{height:100%!important;min-height:0!important;grid-template-columns:minmax(0,1.55fr) minmax(300px,.9fr)!important;gap:12px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-hero-copy{min-height:0!important;justify-content:flex-start!important;padding:4px 4px 2px!important;overflow:auto!important;scrollbar-width:thin}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-main h1{font-size:clamp(24px,2.15vw,36px)!important;line-height:1.05!important;margin:0!important;font-weight:950!important;display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-source-line,.e132-overlay-deck.open.e211-reader-pro .e210-source-line{display:none!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-insight{max-height:126px!important;margin:6px 0 0!important;padding-right:6px!important;overflow:auto!important;scrollbar-width:thin;overflow-wrap:anywhere}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-insight.is-light{font-size:clamp(18px,1.28vw,22px)!important;line-height:1.42!important;font-weight:720}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-insight.is-normal{font-size:clamp(17px,1.2vw,21px)!important;line-height:1.4!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-insight.is-dense{font-size:clamp(16px,1.12vw,20px)!important;line-height:1.36!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-insight.is-overflow{font-size:clamp(15px,1.04vw,19px)!important;line-height:1.32!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-formula-strip{max-width:100%!important;padding:9px 11px!important;margin-top:4px!important;grid-template-columns:auto minmax(0,1fr) auto!important;gap:10px!important;align-items:start!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-formula-strip b{font-size:12px!important;line-height:1.2!important;letter-spacing:.08em!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-formula-strip code{display:block!important;max-height:116px!important;overflow:auto!important;white-space:pre-wrap!important;overflow-wrap:anywhere!important;word-break:break-word!important;font-size:clamp(15px,1.06vw,18px)!important;line-height:1.28!important;-webkit-line-clamp:unset!important;scrollbar-width:thin}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-formula-full-btn{align-self:start!important;font-size:12px!important;padding:8px 10px!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-visual{height:100%!important;min-height:0!important;max-height:100%!important;padding:10px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel{height:100%!important;max-height:100%!important;overflow:auto!important;scrollbar-width:thin;padding:18px!important;gap:10px!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel .e211-panel-title{font-size:clamp(15px,1vw,18px)!important;line-height:1.18!important;margin:0 0 4px!important;font-weight:950!important;color:#f8fbff!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel h3{font-size:clamp(15px,1vw,18px)!important;line-height:1.18!important;margin:0 0 4px!important;font-weight:950!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel .e211-summary-lead{font-size:clamp(17px,1.2vw,21px)!important;line-height:1.38!important;margin:0!important;overflow-wrap:anywhere}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel.is-light .e211-summary-lead{font-size:clamp(18px,1.28vw,22px)!important;line-height:1.36!important;font-weight:700}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel.is-normal .e211-summary-lead{font-size:clamp(17px,1.2vw,21px)!important;line-height:1.38!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel.is-dense .e211-summary-lead{font-size:clamp(16px,1.12vw,20px)!important;line-height:1.34!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-extension-panel.is-overflow .e211-summary-lead{font-size:clamp(15px,1.04vw,19px)!important;line-height:1.3!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-grid.e202-card-grid{height:100%!important;min-height:0!important;max-height:none!important;display:grid!important;grid-template-columns:1.1fr 1fr .95fr!important;grid-auto-rows:1fr!important;gap:10px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card{height:100%!important;min-height:0!important;padding:13px 15px!important;overflow:auto!important;scrollbar-width:thin}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-card-kicker{font-size:11px!important;padding:4px 8px!important;margin-bottom:6px!important;font-weight:900!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card h3{font-size:clamp(15px,1vw,18px)!important;line-height:1.16!important;margin:0 0 6px!important;font-weight:950!important;overflow-wrap:anywhere}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card p.e132-full-body{font-size:clamp(16px,1.12vw,20px)!important;line-height:1.34!important;margin:0!important;overflow-wrap:anywhere}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="light"] p.e132-full-body{font-size:clamp(17px,1.2vw,21px)!important;line-height:1.32!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="normal"] p.e132-full-body{font-size:clamp(16px,1.12vw,20px)!important;line-height:1.34!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="dense"] p.e132-full-body{font-size:clamp(15px,1.04vw,19px)!important;line-height:1.3!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="overflow"] p.e132-full-body{font-size:clamp(14px,.96vw,18px)!important;line-height:1.27!important}'
      +'@media(max-height:760px){.e132-overlay-deck.open.e211-reader-pro{--readerHero:55%;--readerCards:184px}.e132-overlay-deck.open.e211-reader-pro .e132-clean-main h1{font-size:clamp(23px,2vw,34px)!important}.e132-overlay-deck.open.e211-reader-pro .e202-insight{max-height:108px!important}.e132-overlay-deck.open.e211-reader-pro .e202-formula-strip code{max-height:92px!important}.e132-overlay-deck.open.e211-reader-pro .e132-clean-card p.e132-full-body{font-size:clamp(15px,1.05vw,19px)!important}.e132-overlay-deck.open.e211-reader-pro .e132-clean-card[data-e212-density="overflow"] p.e132-full-body{font-size:clamp(13.5px,.92vw,17.5px)!important}}'
      +'@media(max-width:1100px){.e132-overlay-deck.open.e211-reader-pro .e202-hero{grid-template-columns:1fr!important}.e132-overlay-deck.open.e211-reader-pro .e202-visual{display:none!important}.e132-overlay-deck.open.e211-reader-pro .e132-clean-grid.e202-card-grid{grid-template-columns:1fr!important;overflow:auto!important}}';
    var s=document.createElement('style');
    s.id='e219-reader-fit-style';
    s.textContent=css;
    document.head.appendChild(s);
  }

  function baseDensity(el){
    var len=text(el).length;
    if(el.classList.contains('e132-clean-card')){
      if(len<260)return 'light';
      if(len<620)return 'normal';
      if(len<900)return 'dense';
      return 'overflow';
    }
    if(el.classList.contains('e211-extension-panel')){
      if(len<240)return 'light';
      if(len<560)return 'normal';
      if(len<820)return 'dense';
      return 'overflow';
    }
    if(el.classList.contains('e202-insight')){
      if(len<260)return 'light';
      if(len<620)return 'normal';
      if(len<900)return 'dense';
      return 'overflow';
    }
    return len<260?'light':(len<620?'normal':(len<900?'dense':'overflow'));
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