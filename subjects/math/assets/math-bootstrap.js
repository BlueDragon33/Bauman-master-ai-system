/* Bauman Math Bootstrap V1
 * Non-critical diagnostics + offline shell registration.
 * Keeps learner path independent from diagnostic modules.
 */
(function mathBootstrap(global){
  'use strict';
  const RELEASE='MATH_BOOTSTRAP_V1';
  const DIAGNOSTICS=[
    ['css','assets/math-regression-gate.css?v=1'],
    ['css','assets/math-runtime-health.css?v=1'],
    ['js','assets/math-regression-gate.js?v=3'],
    ['js','assets/math-runtime-health.js?v=5']
  ];
  let diagnosticsStarted=false;

  function loadOne([kind,src]){
    return new Promise(resolve=>{
      const el=document.createElement(kind==='css'?'link':'script');
      if(kind==='css'){el.rel='stylesheet';el.href=src}else{el.src=src;el.async=true}
      el.onload=()=>resolve({src,ok:true});
      el.onerror=()=>resolve({src,ok:false});
      document.head.appendChild(el);
    });
  }
  async function loadDiagnostics(){
    if(diagnosticsStarted)return;
    diagnosticsStarted=true;
    for(const item of DIAGNOSTICS)await loadOne(item);
  }
  function scheduleDiagnostics(){
    if('requestIdleCallback'in global)global.requestIdleCallback(loadDiagnostics,{timeout:2600});
    else global.setTimeout(loadDiagnostics,1400);
  }
  function registerOffline(){
    if(!('serviceWorker'in navigator)||!/^https?:$/.test(location.protocol))return;
    global.addEventListener('load',()=>{
      navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(error=>console.warn('[Math Offline]',error));
    },{once:true});
  }
  function networkState(){
    document.body.dataset.mathNetwork=navigator.onLine?'online':'offline';
    const status=document.querySelector('#saveState');
    if(status&& !navigator.onLine)status.textContent='Offline · tiến độ lưu cục bộ';
  }
  function init(){
    if(!document.body||document.body.dataset.mathBootstrap==='1')return;
    document.body.dataset.mathBootstrap='1';
    scheduleDiagnostics();
    registerOffline();
    networkState();
    global.addEventListener('online',networkState);
    global.addEventListener('offline',networkState);
    global.BAUMAN_MATH_BOOTSTRAP={release:RELEASE,loadDiagnostics,selfCheck:()=>({release:RELEASE,diagnosticsStarted,online:navigator.onLine,serviceWorker:'serviceWorker'in navigator})};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(window);
