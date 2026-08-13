/* E246: do not preload the large compatibility lessons file. */
(function(){
  'use strict';
  var contract=window.BAUMAN_MATH_THEORY_E129_CONTRACT;
  if(!contract)return;
  var full='data/lessons.json';
  var small='data/lessons_deferred.json';
  contract.legacyPath=small;
  document.addEventListener('click',function(e){
    var button=e.target&&e.target.closest&&e.target.closest('[data-e129-refresh]');
    if(!button)return;
    contract.legacyPath=full;
    window.setTimeout(function(){contract.legacyPath=small;},1500);
  },true);
})();
