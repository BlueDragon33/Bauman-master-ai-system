import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-offline-shell';
fs.mkdirSync(OUT,{recursive:true});

async function withTimeout(promise,timeoutMs,label){
  let timer;
  try{
    return await Promise.race([
      promise,
      new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(`${label} timed out after ${timeoutMs}ms`)),timeoutMs);})
    ]);
  }finally{if(timer)clearTimeout(timer);}
}

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const smokeSession=String(process.env.BAUMAN_E2E_DEVICE_SESSION||'').trim();
 if(smokeSession){
   const baseUrl=new URL(BASE);
   await context.addCookies([{name:'__Host-bauman_session',value:smokeSession,url:baseUrl.origin+'/',httpOnly:true,secure:baseUrl.protocol==='https:',sameSite:'Strict'}]);
 }
 const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});

  const url=new URL('subjects/russian/index.html',BASE).href;
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>!!window.RussianRuntimeOptimizer&&!!window.RussianCapabilityProgression,null,{timeout:30000});
  const swReadiness=await withTimeout(page.evaluate(async()=>{
    const reg=await window.RussianRuntimeOptimizer.ensureServiceWorkerReady({force:true});
    const registrations=await navigator.serviceWorker.getRegistrations();
    return {
      scope:reg?.scope||'',
      controller:!!navigator.serviceWorker.controller,
      registrations:registrations.map(x=>({scope:x.scope,active:x.active?.state||'',installing:x.installing?.state||'',waiting:x.waiting?.state||''}))
    };
  }),75000,'Russian service-worker readiness');
  assert.equal(swReadiness.controller,true,'Russian service-worker must control the production page before offline verification');
  assert.ok(swReadiness.registrations.some(x=>x.active==='activated'),'Russian service-worker registration has no activated worker');
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:15000});
  await page.waitForFunction(()=>window.BAUMAN_FOUNDATION_IDENTITY_REPORT!==undefined,null,{timeout:15000});

  // Explicitly exercise the product's "prepare offline core" flow before asserting
  // that all required learning data is available without a network.
  const offlinePreparation=await withTimeout(page.evaluate(async()=>{
    await window.RussianRuntimeOptimizer.prepareOfflineCore();
    return window.RussianRuntimeOptimizer.status();
  }),120000,'Russian offline-core preparation');
  assert.equal(offlinePreparation.ready,true,'Russian offline core did not become ready');
  assert.equal(offlinePreparation.prepared,offlinePreparation.total,'Russian offline core count mismatch');
  assert.equal(offlinePreparation.shellPrepared,true,'Russian post-activation shell preparation did not complete');
  assert.equal(offlinePreparation.protectedPrepared,true,'Russian protected offline assets did not become ready');
  const protectedOffline=await page.evaluate(()=>window.RussianRuntimeOptimizer.protectedOfflineAssets||[]);
  assert.ok(protectedOffline.includes('../../foundation/domain-model/legacy-mapping-registry.v1.json'),'Protected Foundation offline asset is not routed through authenticated preparation');

  const cached=await page.evaluate(async()=>{
    const names=await caches.keys();
    const shellCandidates=names.filter(x=>/^russian-app-shell-v[0-9]+(?:-|$)/i.test(x));
    const shell=shellCandidates.sort((a,b)=>{
      const av=Number(a.match(/russian-app-shell-v([0-9]+)/i)?.[1]||0);
      const bv=Number(b.match(/russian-app-shell-v([0-9]+)/i)?.[1]||0);
      return bv-av;
    })[0]||null;
    const dataName=names.find(x=>x==='russian-learning-data-v1');
    if(!shell)return {shell:null,shellVersion:0,urls:[],dataName:null,dataUrls:[]};
    const cache=await caches.open(shell);
    const keys=await cache.keys();
    const dataCache=dataName?await caches.open(dataName):null;
    const dataKeys=dataCache?await dataCache.keys():[];
    const shellVersion=Number(shell.match(/russian-app-shell-v([0-9]+)/i)?.[1]||0);
    return {shell,shellVersion,urls:keys.map(x=>new URL(x.url).pathname),dataName,dataUrls:dataKeys.map(x=>new URL(x.url).pathname)};
  });
  assert.match(cached.shell||'',/^russian-app-shell-v[0-9]+(?:-|$)/i,'Russian offline shell cache must use a versioned namespace');
  assert.ok(cached.shellVersion>=2,`Russian offline shell cache version must remain bumped (got v${cached.shellVersion})`);
  assert.equal(cached.dataName,'russian-learning-data-v1');
  assert.ok(cached.dataUrls.some(x=>x.endsWith('/subjects/russian/data/handwriting-listen-write.json')),'offline data cache missing handwriting-listen-write.json');
  for(const suffix of [
    '/foundation/domain-model/canonical-identity-runtime.js',
    '/foundation/domain-model/identity-overlay-store.js',
    '/foundation/domain-model/legacy-snapshot-extractor.js',
    '/foundation/domain-model/canonical-read-projection.js',
    '/foundation/domain-model/legacy-mapping-registry.v1.json',
    '/subjects/shared/foundation-identity-bootstrap.js',
    '/subjects/shared/foundation-identity-persistence.js',
    '/subjects/shared/foundation-identity-projection.js',
    '/subjects/shared/foundation-canonical-context.js'
  ])assert.ok(cached.urls.some(x=>x.endsWith(suffix)),`offline cache missing ${suffix}`);

  errors.length=0;
  await context.setOffline(true);
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>!!window.RussianRuntimeOptimizer&&!!window.RussianCapabilityProgression,null,{timeout:20000});
  await page.waitForFunction(()=>window.BAUMAN_FOUNDATION_IDENTITY_REPORT!==undefined,null,{timeout:15000});
  const offline=await page.evaluate(()=>({
    online:navigator.onLine,
    identityRuntime:!!window.BaumanIdentityRuntime,
    identityBootstrap:!!window.BaumanFoundationIdentityBootstrap,
    identityReport:window.BAUMAN_FOUNDATION_IDENTITY_REPORT,
    capability:window.RussianCapabilityProgression?.currentBand?.()?.id||'',
    appShell:!!document.querySelector('.ru-app-shell')
  }));
  assert.equal(offline.online,false);
  assert.equal(offline.identityRuntime,true);
  assert.equal(offline.identityBootstrap,true);
  assert.notEqual(offline.identityReport?.status,'unavailable','Foundation identity registry/runtime must remain available offline');
  assert.ok(/^R[0-4]$/.test(offline.capability));
  assert.equal(offline.appShell,true);
  assert.deepEqual(errors,[],'offline Russian reload emitted console/page errors');

  await page.screenshot({path:path.join(OUT,'russian-offline-reload.png'),fullPage:true});
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',cachedFoundation:true,offline},null,2));
  console.log('Russian offline shell browser acceptance PASS');
}finally{
  await browser?.close();
}
