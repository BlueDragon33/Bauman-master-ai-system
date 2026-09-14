/* Bauman Math Integration Sync V1
 * Event-driven refresh coordinator. No MutationObserver and no route ownership.
 */
(function mathIntegrationSync(global){
  'use strict';
  const RELEASE='MATH_INTEGRATION_SYNC_V1';
  let timer=0,runs=0;
  function call(fn){try{if(typeof fn==='function')fn()}catch(e){console.warn('[Math Sync]',e)}}
  function refresh(){
    runs++;
    call(()=>global.BAUMAN_MATH_READER_ROLE_MAP?.map?.());
    call(()=>global.BAUMAN_MATH_WORKSPACE?.refresh?.());
    call(()=>global.BAUMAN_MATH_PREMIUM?.refresh?.());
    call(()=>global.BAUMAN_MATH_DASHBOARD_V2?.refresh?.());
    call(()=>global.BAUMAN_MATH_NAVIGATION?.refresh?.());
    call(()=>global.BAUMAN_MATH_LEARNING_FLOW?.refresh?.());
    call(()=>global.BAUMAN_MATH_ACTIVITY_STUDIO?.refresh?.());
    call(()=>global.BAUMAN_MATH_FORMULA_LIBRARY?.refresh?.());
    call(()=>global.BAUMAN_MATH_SIMULATION_SOURCE?.decorate?.());
    call(()=>global.BAUMAN_MATH_STUDY_LIBRARY?.refresh?.());
  }
  function schedule(ms=160){clearTimeout(timer);timer=setTimeout(refresh,ms)}
  function bind(){
    document.addEventListener('click',e=>{
      if(e.target.closest('[data-e129-chapter],[data-e129-lesson],[data-e129-stage],[data-e129-nav],[data-e169-pick-activity],[data-e169-pick-lesson],[data-e129-back-theory],[data-e129-refresh],[data-math-nav],[data-lf-step],[data-study-open],[data-activity-action]'))schedule(220);
    },true);
    document.addEventListener('change',e=>{if(e.target?.id==='stageSelect')schedule(240)},true);
    global.addEventListener('hashchange',()=>schedule(150));global.addEventListener('popstate',()=>schedule(150));
  }
  function selfCheck(){return{release:RELEASE,runs,mutationObserver:false,routeOwnership:false,academicWrites:false,targets:['role-map','workspace','premium','dashboard','navigation','learning-flow','activity-studio','formula-library','simulation-source','study-library']}}
  function init(){if(!document.body||document.body.dataset.mathIntegrationSync==='1')return;document.body.dataset.mathIntegrationSync='1';bind();[500,1200,2600].forEach(ms=>setTimeout(refresh,ms));global.BAUMAN_MATH_INTEGRATION_SYNC={release:RELEASE,refresh,schedule,selfCheck}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
