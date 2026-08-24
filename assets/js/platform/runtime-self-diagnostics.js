(function(global){
  'use strict';

  const RELEASE='BAUMAN_RUNTIME_SELF_DIAGNOSTICS_2026_08_24';
  const DOM_WARN=3500;
  const DOM_FAIL=6000;
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const rows=[];

  function add(id,label,ok,detail='',severity='error'){
    const status=ok?'pass':(severity==='warning'?'warn':'fail');
    rows.push({id,label,status,detail:String(detail||'')});
  }

  async function run(){
    rows.length=0;
    const runtime=global.BAUMAN_ACADEMIC_RUNTIME_V3;
    add('academic-meta','Academic Runtime V3 metadata',runtime?.displayCode==='09.04.01/11'&&runtime?.department==='ИУ-5',`${runtime?.department||'—'} · ${runtime?.displayCode||'—'}`);

    const academic=global.BaumanAcademicRuntimeV3?.selfCheck?.();
    add('academic-main','Main unified academic runtime',academic?.ok===true,JSON.stringify(academic||{}));
    add('academic-courses','Academic course graph populated',Number(academic?.courseCount)>=40,`${Number(academic?.courseCount)||0} course records`);
    add('academic-subjects','Eight content engines mapped',Number(academic?.subjectCount)===8,`${Number(academic?.subjectCount)||0}/8`);

    try{await global.BaumanAcademicRoadmapV3?.load?.();}catch(_){ }
    const roadmap=global.BaumanAcademicRoadmapV3?.selfCheck?.();
    add('roadmap','Roadmap V3 manifest',roadmap?.ok===true&&roadmap?.loaded===true&&roadmap?.displayCode==='09.04.01/11',JSON.stringify(roadmap||{}));

    const storage=global.BaumanOfflineContentLibrary?.selfCheck?.();
    add('offline-library','Offline Content Library',storage?.ok===true,JSON.stringify(storage||{}));
    const direct=global.BaumanOfflineDirectFileReader?.selfCheck?.();
    add('direct-reader','Direct local reader zero-copy',direct?.ok===true&&direct?.stored===false,JSON.stringify(direct||{}));
    const packs=global.BaumanOfflineSubjectPackManager?.selfCheck?.();
    add('offline-packs','Subject offline pack manager',packs?.ok===true&&Number(packs?.baseMaxResourceBytes)===5*1024*1024,JSON.stringify(packs||{}));
    const refcount=global.BaumanOfflineSubjectPackRefcountGuard?.selfCheck?.();
    add('refcount','Offline pack refcount guard',refcount?.ok===true&&refcount?.managerPatched===true,JSON.stringify(refcount||{}),refcount?.ok===true?'warning':'error');

    const site=global.BaumanSiteRuntime;
    add('site-runtime','Site runtime enabled',site?.enabled===true,JSON.stringify(global.BAUMAN_SITE_RUNTIME_AUDIT?.()||{}));
    add('sw-rollout','Service Worker production rollout still gated',site?.cacheEnabled===false,site?.cacheEnabled===false?'OFF until L5 browser gates PASS':'ON before L5 closure','warning');

    const subjects=global.state?.subjects||{};
    add('state-subjects','Personal state retains all content engines',Object.keys(subjects).length===8,Object.keys(subjects).join(', '));
    add('school-label','Learner UI contains no comparison-school label',!/hutech/i.test(document.body?.innerText||''),'Bauman-only learner surface');

    const nodeCount=document.getElementsByTagName('*').length;
    add('dom-budget','Current DOM budget',nodeCount<DOM_FAIL,`${nodeCount} nodes · warn ${DOM_WARN} · fail ${DOM_FAIL}`,nodeCount<DOM_WARN?'warning':'error');

    let estimate={usage:0,quota:0};
    try{estimate=await global.BaumanOfflineContentLibrary?.estimate?.()||estimate;}catch(_){ }
    const quota=Number(estimate.quota)||0,usage=Number(estimate.usage)||0;
    add('quota','Browser storage estimate available',quota>0,quota?`${(usage/1048576).toFixed(1)} MB / ${(quota/1048576).toFixed(1)} MB`:'Storage quota unavailable','warning');

    const sw=global.navigator?.serviceWorker;
    add('sw-support','Service Worker capability',!!sw,sw?`controller=${!!sw.controller}`:'unsupported','warning');
    add('network','Current network state',global.navigator?.onLine!==false,global.navigator?.onLine===false?'offline':'online','warning');

    const failures=rows.filter(x=>x.status==='fail');
    const warnings=rows.filter(x=>x.status==='warn');
    return {release:RELEASE,ok:failures.length===0,failures,warnings,checks:[...rows],generatedAt:new Date().toISOString()};
  }

  function render(result){
    const root=document.getElementById('modalRoot');
    if(!root)return;
    const status=result.ok?'PASS':'CẦN XỬ LÝ';
    const items=result.checks.map(item=>`<article class="diag-row ${esc(item.status)}"><i>${item.status==='pass'?'✓':item.status==='warn'?'!':'×'}</i><div><b>${esc(item.label)}</b><small>${esc(item.detail)}</small></div><em>${esc(item.status.toUpperCase())}</em></article>`).join('');
    root.innerHTML=`<div class="modal-backdrop canva-modal-backdrop" data-runtime-diag-close="1"><div class="dialog canva-dialog wide"><div class="dialog-head canva-dialog-head"><div><span class="modal-eyebrow">L5 RUNTIME SELF-DIAGNOSTICS</span><h2>${esc(status)} · ${result.failures.length} lỗi · ${result.warnings.length} cảnh báo</h2></div><button class="btn sm" data-runtime-diag-action="close">Đóng</button></div><div class="dialog-body"><section class="panel runtime-diag-summary"><span class="pill ${result.ok?'green':'purple'}">${esc(result.release)}</span><p>Đây là kiểm tra trực tiếp trong Web App. Nó bổ sung, không thay thế browser/CI release gate.</p></section><section class="runtime-diag-list">${items}</section></div></div></div>`;
  }

  async function open(){const result=await run();render(result);return result;}

  function inject(){
    const menu=document.getElementById('profileMenu');
    if(!menu||menu.querySelector('[data-runtime-diag-action="open"]'))return;
    const button=document.createElement('button');
    button.className='profile-action admin-only';
    button.dataset.runtimeDiagAction='open';
    button.textContent='🩺 Chẩn đoán Web App';
    const logout=document.getElementById('logoutBtn');
    menu.insertBefore(button,logout||null);
    if(global.auth?.isAdmin&&!global.auth.isAdmin())button.classList.add('hidden');
  }

  document.addEventListener('click',event=>{
    if(event.target?.dataset?.runtimeDiagClose==='1'){document.getElementById('modalRoot').innerHTML='';return;}
    const target=event.target.closest?.('[data-runtime-diag-action]');
    if(!target)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(target.dataset.runtimeDiagAction==='open')open().catch(error=>global.toast?.('Diagnostics lỗi: '+String(error?.message||error)));
    if(target.dataset.runtimeDiagAction==='close')document.getElementById('modalRoot').innerHTML='';
  },true);

  const observer=new MutationObserver(inject);
  function install(){inject();const root=document.getElementById('profileMenu');if(root)observer.observe(root,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();

  global.BaumanRuntimeSelfDiagnostics={release:RELEASE,run,open,selfCheck(){return {ok:true,release:RELEASE,domWarn:DOM_WARN,domFail:DOM_FAIL};}};
})(window);
