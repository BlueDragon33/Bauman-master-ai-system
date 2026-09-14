/* Math System Bridge V1
 * Resolves shell controls to existing Workspace/Navigation actions without replacing either engine.
 */
(function mathSystemBridge(global){
  'use strict';
  const RELEASE='MATH_SYSTEM_BRIDGE_V1';
  function q(s,r=document){return r.querySelector(s)}
  function toggleFocus(){
    const launcher=q('#mathWsLauncher [data-math-ws="focus"]')||q('[data-math-ws="focus"]');
    if(launcher){launcher.click();return true;}
    document.body.classList.toggle('math-ws-focus');return false;
  }
  global.addEventListener('click',function(event){
    const button=event.target?.closest?.('[data-math-system="focus"]');
    if(!button)return;
    event.preventDefault();event.stopImmediatePropagation();toggleFocus();
  },true);
  global.BAUMAN_MATH_SYSTEM_BRIDGE={
    release:RELEASE,toggleFocus,
    selfCheck:function(){return{release:RELEASE,workspace:!!global.BAUMAN_MATH_WORKSPACE,focusButton:!!q('[data-math-system="focus"]'),launcher:!!q('[data-math-ws="focus"]'),routeReplacement:false,academicWrites:false}}
  };
})(window);
