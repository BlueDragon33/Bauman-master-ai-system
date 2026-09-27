/* UI-E25 · perceived performance hygiene */
(function(){
  'use strict';
  function optimize(root=document){
    root.querySelectorAll('img:not([loading])').forEach(img=>{if(!img.closest('[data-bui-eager]'))img.loading='lazy';img.decoding='async'});
    root.querySelectorAll('iframe:not([loading])').forEach(frame=>{if(!frame.closest('[data-bui-eager]'))frame.loading='lazy'});
  }
  function boot(){
    optimize();
    const observer=new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(n=>{if(n.nodeType===1)optimize(n)})));
    observer.observe(document.body,{childList:true,subtree:true});
    window.BaumanUIPerformance={optimize,observer};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
