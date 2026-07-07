/* E235 Reader Pro formula standard: fraction alignment + semantic index guard. */
(function(){
  'use strict';
  var RELEASE='E235_READER_PRO_FORMULA_STANDARD';
  var STYLE_ID='e235-formula-standard-style';
  var SELECTOR='.e211-formula-modal .e226-math[data-e226-raw-formula]';
  var scheduled=false;

  function escRe(s){return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    var css=''
      +SELECTOR+' .e234-fraction{'
      +'display:inline-grid!important;'
      +'grid-template-rows:auto auto!important;'
      +'align-items:center!important;'
      +'justify-items:stretch!important;'
      +'vertical-align:middle!important;'
      +'transform:translateY(-.04em)!important;'
      +'line-height:1!important;'
      +'margin:0 .24em!important;'
      +'min-width:max-content!important;'
      +'}'
      +SELECTOR+' .e234-fraction-num,'
      +SELECTOR+' .e234-fraction-den{'
      +'display:block!important;'
      +'box-sizing:border-box!important;'
      +'width:100%!important;'
      +'text-align:center!important;'
      +'font-size:.90em!important;'
      +'line-height:1.18!important;'
      +'white-space:nowrap!important;'
      +'}'
      +SELECTOR+' .e234-fraction-num{'
      +'padding:0 .30em .13em!important;'
      +'border-bottom:1.55px solid currentColor!important;'
      +'}'
      +SELECTOR+' .e234-fraction-den{'
      +'padding:.13em .30em 0!important;'
      +'}'
      +SELECTOR+' .e234-fraction .e234-fraction{'
      +'font-size:.92em!important;'
      +'margin:0 .12em!important;'
      +'}'
      +SELECTOR+' .e234-op{'
      +'vertical-align:middle!important;'
      +'transform:translateY(-.01em)!important;'
      +'}'
      +SELECTOR+' sub{'
      +'font-size:.72em!important;'
      +'line-height:0!important;'
      +'vertical-align:-.34em!important;'
      +'position:relative!important;'
      +'bottom:auto!important;'
      +'top:auto!important;'
      +'}'
      +SELECTOR+' sup{'
      +'font-size:.72em!important;'
      +'line-height:0!important;'
      +'vertical-align:.58em!important;'
      +'position:relative!important;'
      +'bottom:auto!important;'
      +'top:auto!important;'
      +'}';
    var style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=css;
    document.head.appendChild(style);
  }

  function indexedTokens(raw){
    var tokens=[];
    var re=/\b([A-Za-z])_\{?([A-Za-z0-9,+\-]+)\}?/g;
    var m;
    while((m=re.exec(String(raw||''))))tokens.push({base:m[1],index:m[2]});
    return tokens;
  }

  function enforceSemanticSubscripts(node){
    var raw=node.getAttribute('data-e226-raw-formula')||'';
    var tokens=indexedTokens(raw);
    if(!tokens.length)return;
    var html=node.innerHTML;
    var changed=false;
    tokens.forEach(function(token){
      var base=escRe(token.base),index=escRe(token.index);
      var wrong=new RegExp('('+base+')\\s*<sup>'+index+'<\\/sup>','g');
      var fixed=html.replace(wrong,'$1<sub>'+token.index+'</sub>');
      if(fixed!==html){html=fixed;changed=true;}
    });
    if(changed)node.innerHTML=html;
    node.setAttribute('data-e235-index-checked','1');
  }

  function apply(){
    ensureStyle();
    Array.prototype.slice.call(document.querySelectorAll(SELECTOR)).forEach(enforceSemanticSubscripts);
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(function(){scheduled=false;apply();});
  }

  function boot(){
    apply();
    try{new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});}catch(_){}
    document.addEventListener('click',function(){setTimeout(schedule,0);},true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.BAUMAN_MATH_E235_FORMULA_STANDARD={release:RELEASE,apply:apply};
})();