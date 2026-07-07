/* E235 fraction axis alignment patch for Reader Pro math surfaces. */
(function(){
  'use strict';
  var RELEASE='E235_FRACTION_AXIS_ALIGNMENT';
  var STYLE_ID='e235-fraction-axis-style';

  function apply(){
    if(document.getElementById(STYLE_ID))return;
    var selector='.e211-formula-modal .e226-math[data-e226-raw-formula]';
    var css=''
      +selector+' .e234-fraction{'
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
      +selector+' .e234-fraction-num,'
      +selector+' .e234-fraction-den{'
      +'display:block!important;'
      +'box-sizing:border-box!important;'
      +'width:100%!important;'
      +'text-align:center!important;'
      +'font-size:.90em!important;'
      +'line-height:1.18!important;'
      +'white-space:nowrap!important;'
      +'}'
      +selector+' .e234-fraction-num{'
      +'padding:0 .30em .13em!important;'
      +'border-bottom:1.55px solid currentColor!important;'
      +'}'
      +selector+' .e234-fraction-den{'
      +'padding:.13em .30em 0!important;'
      +'}'
      +selector+' .e234-fraction .e234-fraction{'
      +'font-size:.92em!important;'
      +'margin:0 .12em!important;'
      +'}'
      +selector+' .e234-op{'
      +'vertical-align:middle!important;'
      +'transform:translateY(-.01em)!important;'
      +'}';
    var style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=css;
    document.head.appendChild(style);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
  window.BAUMAN_MATH_E235_FRACTION_ALIGN={release:RELEASE,apply:apply};
})();