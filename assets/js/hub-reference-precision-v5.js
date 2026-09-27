/* Legacy Precision Reference V5 · retired by BAUMAN_FUTURE_INTERFACE_SYSTEM.
   Compatibility API remains so historical checks/extensions do not crash. */
(()=>{
  'use strict';
  const RELEASE='HUB_REFERENCE_PRECISION_V5_RETIRED_2026_09';
  const q=(s,r=document)=>r.querySelector(s);
  function suppressSecondaryHome(){
    const host=q('#page-home');if(!host)return;
    host.querySelectorAll('[data-academic2026="home"]').forEach(el=>{
      el.dataset.hubV5Secondary='1';
      el.setAttribute('aria-hidden','true');
    });
  }
  function apply(){
    document.body.dataset.hubReferenceV5='retired';
    document.documentElement.dataset.hubReferencePrecision=RELEASE;
    suppressSecondaryHome();
    return true;
  }
  function geometry(){
    const box=s=>q(s)?.getBoundingClientRect()||null;
    return{sidebar:box('.sidebar'),topbar:box('.topbar'),home:box('#page-home')};
  }
  function selfCheck(){
    return{release:RELEASE,active:false,retired:true,secondaryHomeHidden:[...document.querySelectorAll('#page-home [data-academic2026="home"]')].every(el=>getComputedStyle(el).display==='none'),geometry:geometry()};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  window.BAUMAN_HUB_REFERENCE_V5={release:RELEASE,apply,selfCheck,geometry};
})();