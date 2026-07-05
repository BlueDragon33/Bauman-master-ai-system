/* E212 Reader Pro adaptive typography and summary-card label. */
(function(){
  'use strict';
  var RELEASE='E212_READER_PRO_ADAPTIVE_TEXT_FIT';
  var last='';
  function text(n){return (n&&n.textContent||'').replace(/\s+/g,' ').trim();}
  function isReaderPro(){
    var d=document.querySelector('.e132-overlay-deck.open');
    if(!d)return false;
    var m=text(d.querySelector('[data-e202-mode], .e132-clean-role'));
    return /Reader Pro/i.test(m);
  }
  function ensureStyle(){
    if(document.getElementById('e212-reader-fit-style'))return;
    var css='.e132-overlay-deck.open .e132-clean-card[data-e212-fit="1"]{min-height:0}.e132-overlay-deck.open .e132-clean-card[data-e212-fit="1"] h3{overflow-wrap:anywhere}.e132-overlay-deck.open .e132-clean-card[data-e212-fit="1"] p{overflow-wrap:anywhere}.e132-overlay-deck.open .e132-clean-card[data-e212-fit="1"][data-e212-density="light"] h3{font-size:clamp(24px,2vw,34px)!important;line-height:1.12!important}.e132-overlay-deck.open .e132-clean-card[data-e212-fit="1"][data-e212-density="light"] p{font-size:clamp(19px,1.35vw,25px)!important;line-height:1.42!important}.e132-overlay-deck.open .e132-clean-card[data-e212-fit="1"][data-e212-density="normal"] h3{font-size:clamp(20px,1.45vw,26px)!important;line-height:1.15!important}.e132-overlay-deck.open .e132-clean-card[data-e212-fit="1"][data-e212-density="normal"] p{font-size:clamp(16px,1.08vw,20px)!important;line-height:1.43!important}.e132-overlay-deck.open .e132-clean-card[data-e212-fit="1"][data-e212-density="dense"] h3{font-size:clamp(17px,1.15vw,21px)!important;line-height:1.13!important}.e132-overlay-deck.open .e132-clean-card[data-e212-fit="1"][data-e212-density="dense"] p{font-size:clamp(13px,.9vw,16px)!important;line-height:1.32!important}.e132-overlay-deck.open .e132-clean-card[data-e212-fit="1"][data-e212-density="overflow"] h3{font-size:clamp(15px,1vw,18px)!important;line-height:1.1!important}.e132-overlay-deck.open .e132-clean-card[data-e212-fit="1"][data-e212-density="overflow"] p{font-size:clamp(11.5px,.78vw,14px)!important;line-height:1.23!important}';
    var s=document.createElement('style');s.id='e212-reader-fit-style';s.textContent=css;document.head.appendChild(s);
  }
  function density(card){
    var t=text(card);
    var len=t.length;
    var h=card.getBoundingClientRect().height||1;
    var score=len/(h/100);
    if(len<180&&h>210)return 'light';
    if(score<120)return 'light';
    if(score<230)return 'normal';
    if(score<370)return 'dense';
    return 'overflow';
  }
  function squeezeIfOverflow(card){
    var levels=['normal','dense','overflow'];
    for(var i=0;i<levels.length;i++){
      if(card.scrollHeight<=card.clientHeight+6)return;
      card.setAttribute('data-e212-density',levels[i]);
    }
  }
  function apply(){
    var d=document.querySelector('.e132-overlay-deck.open');
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
