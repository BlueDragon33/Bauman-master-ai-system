/* Math Workspace -> accepted E129 integration bridge.
 * Window-capture is intentional: it routes the Workspace vault action before
 * the generic workspace document handler, without changing E129 itself.
 */
(function mathWorkspaceIntegration(global){
  'use strict';
  global.addEventListener('click',function(event){
    const target=event.target && event.target.closest ? event.target.closest('[data-math-ws="open-vault"]') : null;
    if(!target) return;
    const e129=global.BAUMAN_MATH_THEORY_E129;
    if(!e129 || typeof e129.openTheoryVault!=='function') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    e129.openTheoryVault();
    document.getElementById('mathWorkspacePanel')?.classList.remove('open');
    global.setTimeout(function(){ global.BAUMAN_MATH_WORKSPACE?.refresh?.(); },120);
  },true);

  global.BAUMAN_MATH_WORKSPACE_INTEGRATION={
    release:'MATH_WORKSPACE_E129_BRIDGE_V1',
    selfCheck:function(){
      return {
        e129Available:!!global.BAUMAN_MATH_THEORY_E129,
        openTheoryVault:typeof global.BAUMAN_MATH_THEORY_E129?.openTheoryVault==='function',
        workspaceAvailable:!!global.BAUMAN_MATH_WORKSPACE
      };
    }
  };
})(window);
