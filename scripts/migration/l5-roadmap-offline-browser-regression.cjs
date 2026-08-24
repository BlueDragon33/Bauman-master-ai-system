'use strict';

const fs=require('fs');
const {chromium}=require('playwright');

const BASE_URL=process.env.BAUMAN_TEST_BASE_URL||'http://127.0.0.1:4173';
const failures=[];
const report={generatedAt:new Date().toISOString(),baseUrl:BASE_URL,checks:[],packs:[],offlineRoutes:[],failures};
const check=(name,ok,detail='')=>{report.checks.push({name,ok:!!ok,detail});if(!ok)failures.push(`${name}${detail?': '+detail:''}`);};
const sameOrigin=url=>{try{return new URL(url).origin===new URL(BASE_URL).origin;}catch(_){return false;}};

async function waitRoadmap(page){
  await page.waitForFunction(()=>window.BaumanAcademicRoadmapV3?.selfCheck?.().loaded===true,{timeout:15000});
  await page.evaluate(()=>window.app?.page?.('roadmap',false));
  await page.waitForSelector('.academic-roadmap-v3',{timeout:10000});
}

async function testRoadmapAndLocalLibrary(page){
  await waitRoadmap(page);
  const roadmap=await page.evaluate(()=>({
    self:window.BaumanAcademicRoadmapV3.selfCheck(),
    text:document.getElementById('page-roadmap')?.innerText||'',
    phases:document.querySelectorAll('[data-academic-phase]').length,
    semesters:document.querySelectorAll('.academic-semester-card').length,
    offline:window.BaumanOfflineContentLibrary?.selfCheck?.()||null,
    ui:window.BaumanOfflineLibraryUI?.selfCheck?.()||null,
    quota:window.BaumanOfflineImportQuotaGuard?.selfCheck?.()||null,
    packManager:window.BaumanOfflineSubjectPackManager?.selfCheck?.()||null,
    refcount:window.BaumanOfflineSubjectPackRefcountGuard?.selfCheck?.()||null
  }));
  check('roadmap bridge loaded',roadmap.self?.ok===true&&roadmap.self?.displayCode==='09.04.01/11',JSON.stringify(roadmap.self));
  check('roadmap renders five phases',roadmap.phases===5,String(roadmap.phases));
  check('roadmap renders four semesters',roadmap.semesters===4,String(roadmap.semesters));
  check('roadmap UI contains display code',roadmap.text.includes('09.04.01/11'));
  check('roadmap UI contains no comparison-school label',!/hutech/i.test(roadmap.text));
  check('offline IndexedDB runtime ready',roadmap.offline?.ok===true,JSON.stringify(roadmap.offline));
  check('offline UI runtime ready',roadmap.ui?.ok===true,JSON.stringify(roadmap.ui));
  check('quota guard runtime ready',roadmap.quota?.ok===true,JSON.stringify(roadmap.quota));
  check('subject pack manager runtime ready',roadmap.packManager?.ok===true,JSON.stringify(roadmap.packManager));
  await page.waitForFunction(()=>window.BaumanOfflineSubjectPackRefcountGuard?.selfCheck?.().managerPatched===true,{timeout:3000}).catch(()=>{});
  const refSelf=await page.evaluate(()=>window.BaumanOfflineSubjectPackRefcountGuard?.selfCheck?.()||null);
  check('subject pack refcount manager patch ready',refSelf?.ok===true&&refSelf?.managerPatched===true,JSON.stringify(refSelf));

  const phasePersist=await page.evaluate(()=>{
    const buttons=[...document.querySelectorAll('[data-academic-phase]')];
    const target=buttons[2];
    target?.click();
    return {saved:window.state?.academicRoadmapPhase||'',active:document.querySelector('[data-academic-phase].active')?.dataset?.academicPhase||''};
  });
  check('roadmap phase state persists through main repository path',phasePersist.saved==='ai-asoiu-research-bridge'&&phasePersist.active===phasePersist.saved,JSON.stringify(phasePersist));

  const localPackId='__l5_local_roundtrip__';
  const importResult=await page.evaluate(async(packId)=>{
    const files=[
      new File(['# Offline note\nBauman IU5'], 'note.md',{type:'text/markdown'}),
      new File(['<!doctype html><meta charset="utf-8"><h1>Sandbox probe</h1><script>parent.__l5SandboxBreach=true<\/script>'], 'unsafe.html',{type:'text/html'}),
      new File([JSON.stringify({displayCode:'09.04.01/11',ok:true})], 'sample.json',{type:'application/json'})
    ];
    window.__l5SandboxBreach=false;
    const result=await window.BaumanOfflineImportQuotaGuard.safeImport(files,{packId,title:'L5 Local Roundtrip'});
    const stored=await window.BaumanOfflineContentLibrary.listFiles(packId);
    return {result,count:stored.length,names:stored.map(x=>x.name)};
  },localPackId);
  check('local file safe import roundtrip',importResult.count===3,JSON.stringify(importResult));

  await page.evaluate(()=>window.BaumanOfflineLibraryUI.open());
  await page.waitForSelector(`[data-offline-action="open-pack"][data-pack-id="${localPackId}"]`,{timeout:5000});
  await page.click(`[data-offline-action="open-pack"][data-pack-id="${localPackId}"]`);
  await page.waitForSelector('[data-offline-action="preview-file"][data-file-path="unsafe.html"]',{timeout:5000});
  await page.click('[data-offline-action="preview-file"][data-file-path="unsafe.html"]');
  await page.waitForSelector('iframe.offline-sandbox-frame',{timeout:5000});
  await page.waitForTimeout(250);
  const sandbox=await page.evaluate(()=>({
    value:document.querySelector('iframe.offline-sandbox-frame')?.getAttribute('sandbox'),
    breach:window.__l5SandboxBreach===true,
    note:document.querySelector('.offline-sandbox-note')?.innerText||''
  }));
  check('local HTML preview has empty sandbox permission set',sandbox.value==='',JSON.stringify(sandbox));
  check('local HTML script cannot mutate parent',sandbox.breach===false,JSON.stringify(sandbox));
  check('sandbox UI explains isolation',/sandbox/i.test(sandbox.note),sandbox.note);
  await page.evaluate(async(packId)=>window.BaumanOfflineContentLibrary.removePack(packId),localPackId);
  const localRemoved=await page.evaluate(async(packId)=>!(await window.BaumanOfflineContentLibrary.listPacks()).some(x=>x.packId===packId),localPackId);
  check('local pack remove roundtrip',localRemoved===true);

  const quotaProbe=await page.evaluate(async()=>{
    const storage=navigator.storage;
    if(!storage)return {supported:false};
    const original=storage.estimate;
    let rejected=false,name='';
    try{
      Object.defineProperty(storage,'estimate',{configurable:true,value:async()=>({usage:9,quota:10})});
      try{await window.BaumanOfflineImportQuotaGuard.capacityCheck([new File(['1234'],'quota.txt')]);}
      catch(error){rejected=true;name=error?.name||'';}
    }finally{
      try{Object.defineProperty(storage,'estimate',{configurable:true,value:original});}catch(_){ }
    }
    return {supported:true,rejected,name};
  });
  check('quota preflight rejects insufficient capacity',quotaProbe.supported&&quotaProbe.rejected&&quotaProbe.name==='QuotaPreflightError',JSON.stringify(quotaProbe));

  const rollbackProbe=await page.evaluate(async()=>{
    const guard=window.BaumanOfflineImportQuotaGuard;
    const library=window.BaumanOfflineContentLibrary;
    const id='__l5_partial_rollback__';
    const original=library.importFiles;
    let threw=false;
    library.importFiles=async(files,options)=>{
      await library.putFile(options.packId,'partial.txt',new Blob(['partial'],{type:'text/plain'}),{name:'partial.txt',mime:'text/plain'});
      throw new Error('forced-import-failure');
    };
    try{await guard.safeImport([new File(['ok'],'source.txt')],{packId:id,title:'forced'});}catch(_){threw=true;}
    library.importFiles=original;
    const remaining=await library.listFiles(id);
    return {threw,remaining:remaining.length};
  });
  check('failed local import rolls back partial files',rollbackProbe.threw&&rollbackProbe.remaining===0,JSON.stringify(rollbackProbe));

  const refProbe=await page.evaluate(async(baseUrl)=>{
    const lib=window.BaumanOfflineContentLibrary;
    const guard=window.BaumanOfflineSubjectPackRefcountGuard;
    const cache=await caches.open('bauman-offline-content-v1');
    const url=new URL('/assets/css/main.css',baseUrl).href;
    await cache.put(url,new Response('shared',{headers:{'content-type':'text/css'}}));
    const item={url,bytes:6,contentType:'text/css'};
    await lib.savePack({packId:'subject-l5-base',subjectId:'l5',title:'base',source:'service-worker-cache',fileCount:1,bytes:6,metadata:{urls:[item]}});
    await lib.savePack({packId:'subject-l5-session',subjectId:'l5',title:'session',source:'service-worker-cache',fileCount:1,bytes:6,metadata:{urls:[item]}});
    const first=await guard.safeRemovePack('subject-l5-base');
    const afterFirst=!!(await cache.match(url));
    const second=await guard.safeRemovePack('subject-l5-session');
    const afterSecond=!!(await cache.match(url));
    return {first,afterFirst,second,afterSecond};
  },BASE_URL);
  check('refcount guard preserves shared cache on first pack removal',refProbe.afterFirst===true&&refProbe.first?.preservedShared===1,JSON.stringify(refProbe));
  check('refcount guard removes cache after final reference',refProbe.afterSecond===false,JSON.stringify(refProbe));
}

async function prepareSubjectPacks(page){
  for(const id of ['foundation','math','russian']){
    const result=await page.evaluate(async(subjectId)=>{
      const out=await window.BaumanOfflineSubjectPackManager.prepareBase(subjectId);
      return {packId:out?.packId||'',ok:(out?.ok||[]).length,bytes:Number(out?.bytes)||0,skipped:out?.skipped||[],failed:out?.failed||[]};
    },id);
    report.packs.push({id,...result});
    check(`${id} base offline pack created`,result.ok>0,JSON.stringify(result));
    check(`${id} base offline pack has no >5MB auto-cached resource`,result.skipped.length===0,JSON.stringify(result.skipped));
    check(`${id} base offline pack has no fetch failures`,result.failed.length===0,JSON.stringify(result.failed));
  }
}

async function registerTestServiceWorker(page){
  const result=await page.evaluate(async()=>{
    if(!('serviceWorker' in navigator))return {ok:false,reason:'unsupported'};
    const worker=new URL('service-worker.js?l5-offline-browser=1',document.baseURI);
    const scope=new URL('./',document.baseURI);
    const registration=await navigator.serviceWorker.register(worker.href,{scope:scope.href});
    await navigator.serviceWorker.ready;
    const started=Date.now();
    while(!navigator.serviceWorker.controller&&Date.now()-started<10000)await new Promise(r=>setTimeout(r,100));
    return {ok:!!registration.active,scope:registration.scope,controller:!!navigator.serviceWorker.controller,script:registration.active?.scriptURL||''};
  });
  check('test service worker activates',result.ok===true,JSON.stringify(result));
  check('test service worker controls main page',result.controller===true,JSON.stringify(result));
  return result;
}

async function offlineNavigate(context,page,route,label,assertion){
  const failed=[];
  const handler=request=>{if(sameOrigin(request.url()))failed.push({url:request.url(),error:request.failure()?.errorText||'failed'});};
  page.on('requestfailed',handler);
  let navError='';
  try{
    await page.goto(BASE_URL+route,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForTimeout(1200);
  }catch(error){navError=error.message;}
  page.off('requestfailed',handler);
  let probe={};
  try{probe=await assertion(page);}catch(error){probe={error:error.message};}
  report.offlineRoutes.push({label,route,navError,failed,probe});
  check(`${label} offline navigation`,!navError,navError);
  check(`${label} has no failed same-origin request`,failed.length===0,JSON.stringify(failed.slice(0,8)));
  check(`${label} offline UI/data probe`,probe?.ok===true,JSON.stringify(probe));
}

(async()=>{
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({serviceWorkers:'allow',viewport:{width:1440,height:900}});
  const page=await context.newPage();
  page.on('console',msg=>{if(msg.type()==='error')report.checks.push({name:'browser-console-error',ok:false,detail:msg.text()});});

  try{
    await page.goto(BASE_URL+'/index.html',{waitUntil:'domcontentloaded',timeout:30000});
    await testRoadmapAndLocalLibrary(page);
    await prepareSubjectPacks(page);
    await registerTestServiceWorker(page);

    await page.reload({waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller,{timeout:10000});
    await waitRoadmap(page);
    await context.setOffline(true);

    await offlineNavigate(context,page,'/index.html','main',async p=>{
      await p.waitForFunction(()=>window.BaumanAcademicRoadmapV3?.selfCheck?.().loaded===true,{timeout:10000});
      await p.evaluate(()=>window.app?.page?.('roadmap',false));
      const text=await p.locator('#page-roadmap').innerText();
      return {ok:text.includes('09.04.01/11')&&!/hutech/i.test(text),textLength:text.length};
    });

    await offlineNavigate(context,page,'/subjects/foundation/index.html','foundation',async p=>{
      const text=await p.locator('body').innerText();
      return {ok:text.trim().length>80,textLength:text.length,title:await p.title()};
    });

    await offlineNavigate(context,page,'/subjects/math/index.html','math',async p=>{
      await p.waitForTimeout(800);
      const text=await p.locator('body').innerText();
      const legacyRequested=await p.evaluate(()=>performance.getEntriesByType('resource').some(e=>/subjects\/math\/data\/lessons\.json(?:$|\?)/.test(e.name)));
      return {ok:text.trim().length>80&&!legacyRequested,textLength:text.length,legacyRequested,title:await p.title()};
    });

    await offlineNavigate(context,page,'/subjects/russian/index.html','russian',async p=>{
      await p.waitForTimeout(800);
      const text=await p.locator('body').innerText();
      const heavy=await p.evaluate(()=>performance.getEntriesByType('resource').filter(e=>/subjects\/russian\/data\/(?:vocab|tests|speaking)\.json(?:$|\?)/.test(e.name)).map(e=>e.name));
      return {ok:text.trim().length>80&&heavy.length===0,textLength:text.length,heavy,title:await p.title()};
    });
  }catch(error){failures.push(`browser regression fatal: ${error.stack||error.message}`);}
  finally{
    try{await context.setOffline(false);}catch(_){ }
    await context.close();
    await browser.close();
  }

  fs.mkdirSync('docs/migration',{recursive:true});
  fs.writeFileSync('docs/migration/L5_ROADMAP_OFFLINE_BROWSER_REGRESSION.generated.json',JSON.stringify(report,null,2)+'\n');
  console.log(`L5 roadmap/offline browser regression: ${report.checks.length} checks, ${failures.length} failure(s).`);
  if(failures.length){console.error(failures.join('\n'));process.exit(2);}
  console.log('L5 roadmap/offline browser regression PASS.');
})().catch(error=>{console.error(error);process.exit(1);});
