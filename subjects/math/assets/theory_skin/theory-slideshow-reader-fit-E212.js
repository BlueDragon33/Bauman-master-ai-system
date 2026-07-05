/* E213 Reader Pro adaptive typography + balance guard. */
(function(){
  'use strict';
  var RELEASE='E213_READER_PRO_FIT_AND_BALANCE';
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
    if(document.getElementById('e213-reader-fit-balance-style'))return;
    var css=''
      +'.e132-overlay-deck.open.e211-reader-pro{--readerHero:57%;--readerCards:190px}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-slide{height:min(724px,calc(100vh - 88px))!important;grid-template-columns:86px minmax(0,1fr)!important;gap:10px!important;padding:10px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-side{padding:9px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-side strong{font-size:clamp(30px,3.1vw,42px)!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-side small{display:-webkit-box!important;-webkit-line-clamp:4!important;-webkit-box-orient:vertical!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-main{height:100%!important;min-height:0!important;display:grid!important;grid-template-rows:minmax(0,var(--readerHero)) minmax(var(--readerCards),1fr)!important;gap:10px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-hero{height:100%!important;min-height:0!important;grid-template-columns:minmax(0,1.55fr) minmax(300px,.9fr)!important;gap:12px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-hero-copy{min-height:0!important;justify-content:flex-start!important;padding:4px 4px 2px!important;overflow:auto!important;scrollbar-width:thin}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-main h1{font-size:clamp(28px,2.4vw,40px)!important;line-height:1.05!important;margin:0!important;display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-source-line,.e132-overlay-deck.open.e211-reader-pro .e210-source-line{font-size:12px!important;line-height:1.25!important;margin:2px 0 0!important;color:#9ed9ff!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-insight{font-size:clamp(14px,1vw,17px)!important;line-height:1.45!important;max-height:112px!important;margin:4px 0 0!important;padding-right:4px!important;overflow:auto!important;scrollbar-width:thin}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-formula-strip{max-width:100%!important;padding:7px 9px!important;margin-top:2px!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-formula-strip code{font-size:clamp(12px,.86vw,14px)!important;line-height:1.28!important;-webkit-line-clamp:3!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-visual{height:100%!important;min-height:0!important;max-height:100%!important;padding:10px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-summary-panel{height:100%!important;max-height:100%!important;padding:12px!important;overflow:auto!important;scrollbar-width:thin}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-summary-panel h3{font-size:clamp(15px,1.05vw,18px)!important;line-height:1.18!important;margin:0 0 6px!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-summary-panel .e211-slide-name{font-size:12px!important;line-height:1.25!important;margin:0 0 7px!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-summary-list{font-size:clamp(12px,.84vw,14px)!important;line-height:1.36!important;margin:0!important;padding-left:17px!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-summary-list li{margin:5px 0!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e211-keyline{font-size:11.5px!important;line-height:1.25!important;margin-top:8px!important;padding-top:7px!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e202-note{font-size:11.5px!important;line-height:1.25!important;margin-top:2px!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-grid.e202-card-grid{height:100%!important;min-height:0!important;max-height:none!important;display:grid!important;grid-template-columns:1.1fr 1fr .95fr!important;grid-auto-rows:1fr!important;gap:10px!important;overflow:hidden!important}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card{height:100%!important;min-height:0!important;padding:11px 13px!important;overflow:auto!important;scrollbar-width:thin}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card h3{font-size:clamp(16px,1.08vw,20px)!important;line-height:1.16!important;margin:0!important;overflow-wrap:anywhere}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-clean-card p.e132-full-body{font-size:clamp(12.5px,.86vw,15px)!important;line-height:1.36!important;margin:0!important;overflow-wrap:anywhere}'
      +'.e132-overlay-deck.open.e211-reader-pro .e132-card-kicker{font-size:10.5px!important;padding:4px 7px!important;margin-bottom:5px!important}'
      +'@media(max-height:760px){.e132-overlay-deck.open.e211-reader-pro{--readerHero:54%;--readerCards:178px}.e132-overlay-deck.open.e211-reader-pro .e132-clean-main h1{font-size:clamp(24px,2.1vw,34px)!important}.e132-overlay-deck.open.e211-reader-pro .e202-insight{max-height:84px!important}.e132-overlay-deck.open.e211-reader-pro .e211-summary-list{font-size:12px!important;line-height:1.28!important}}'
      +'@media(max-width:1100px){.e132-overlay-deck.open.e211-reader-pro .e202-hero{grid-template-columns:1fr!important}.e132-overlay-deck.open.e211-reader-pro .e202-visual{display:none!important}.e132-overlay-deck.open.e211-reader-pro .e132-clean-grid.e202-card-grid{grid-template-columns:1fr!important;overflow:auto!important}}';
    var s=document.createElement('style');
    s.id='e213-reader-fit-balance-style';
    s.textContent=css;
    document.head.appendChild(s);
  }
  function density(card){
    var t=text(card), len=t.length, h=card.getBoundingClientRect().height||1, score=len/(h/100);
    if(len<180&&h>190)return 'light';
    if(score<135)return 'light';
    if(score<250)return 'normal';
    if(score<390)return 'dense';
    return 'overflow';
  }
  function squeezeIfOverflow(card){
    var levels=['normal','dense','overflow'];
    for(var i=0;i<levels.length;i++){
      if(card.scrollHeight<=card.clientHeight+8)return;
      card.setAttribute('data-e212-density',levels[i]);
    }
  }
  function apply(){
    var d=deck();
    if(!d||!isReaderPro())return;
    ensureStyle();
    var sig=text(d.querySelector('[data-e202-count]'))+'|'+text(d.querySelector('.e132-clean-main h1'))+'|'+text(d.querySelector('.e132-clean-grid'));
    if(sig===last)return;
    last=sig;
    var cards=Array.prototype.slice.call(d.querySelectorAll('.e132-clean-card'));
    cards.forEach(function(card,i){
      card.setAttribute('data-e212-fit','1');
      if(i===0){
        var k=card.querySelector('.e132-card-kicker');
        if(k)k.textContent='Tóm tắt ý chính của slide';
      }
      card.setAttribute('data-e212-density',density(card));
    });
    requestAnimationFrame(function(){cards.forEach(squeezeIfOverflow);});
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
  window.BAUMAN_MATH_E212_READER_FIT={release:RELEASE,apply:apply,selfCheck:function(){return {ok:true,release:RELEASE,readerPro:isReaderPro(),cards:document.querySelectorAll('.e132-clean-card[data-e212-fit="1"]').length};}};
})();
