import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-offline-shell';
const expectedShell=fs.readFileSync('subjects/russian/sw.js','utf8').match(/const CACHE='([^']+)'/)?.[1];
assert.ok(/^russian-app-shell-v\d+-engine-/.test(expectedShell||''),'Canonical Russian shell must declare a versioned cache');
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

  // Seed obsolete Russian shells through v35 so local echo controls upgrade to v36.
  // This tests genuine browser CacheStorage activation and cross-subject isolation,
  // not a claim that an already-deployed Production device was upgraded.
  await page.goto(new URL('subjects/russian/assets/russian.css',BASE).href,{waitUntil:'domcontentloaded',timeout:30000});
  const seeded=await page.evaluate(async()=>{
    const old='russian-app-shell-v26-engine-semantic-symbols';
    const previous='russian-app-shell-v27-engine-mobile-navigation';
    const immediatelyPrevious='russian-app-shell-v28-engine-local-save-status';
    const latestPrevious='russian-app-shell-v31-engine-approved-overview';
    const playbackPrevious='russian-app-shell-v32-engine-mic-permission-cancel';
    const fallbackPrevious='russian-app-shell-v33-engine-listening-playback';
    const asrPrevious='russian-app-shell-v34-engine-source-audio-fallback';
    const echoPrevious='russian-app-shell-v35-engine-asr-turn-isolation';
    const foreign='bauman-other-subject-persist-sentinel-v1';
    const data='russian-learning-data-v1';
    const stale=await caches.open(old);
    await stale.put('./assets/russian-future-ui.js',new Response('old-russian-v26'));
    const prior=await caches.open(previous);
    await prior.put('./assets/core.js',new Response('stale-russian-v27'));
    const priorAsr=await caches.open(immediatelyPrevious);
    await priorAsr.put('./assets/speech-interaction-engine.js',new Response('stale-russian-v28-asr'));
    const priorMic=await caches.open(latestPrevious);
    await priorMic.put('./assets/speech-interaction-engine.js',new Response('stale-microphone-permission-v31'));
    const priorPlayback=await caches.open(playbackPrevious);
    await priorPlayback.put('./assets/speech-interaction-engine.js',new Response('stale-audio-playback-v32'));
    const oldFallback=await caches.open(fallbackPrevious);
    await oldFallback.put('./assets/core.js',new Response('no-offline-audio-fallback-v33'));
    const oldAsr=await caches.open(asrPrevious);
    await oldAsr.put('./assets/core.js',new Response('stale-cross-turn-ASR-v34'));
    const oldEcho=await caches.open(echoPrevious);
    await oldEcho.put('./assets/core.js',new Response('no-local-echo-v35'));
    const sibling=await caches.open(foreign);
    await sibling.put('/__retain-foreign-cache',new Response('unrelated-app-retained'));
    const learning=await caches.open(data);
    await learning.put('/__retain-learning-data',new Response('user-offline-data-retained'));
    return {old,previous,immediatelyPrevious,latestPrevious,playbackPrevious,fallbackPrevious,asrPrevious,echoPrevious,foreign,data,keys:await caches.keys()};
  });
  for(const name of [seeded.old,seeded.previous,seeded.immediatelyPrevious,seeded.latestPrevious,seeded.playbackPrevious,seeded.fallbackPrevious,seeded.asrPrevious,seeded.echoPrevious,seeded.foreign,seeded.data]){
    assert.ok(seeded.keys.includes(name),'Pre-activation CacheStorage fixture missing: '+name);
  }

  const url=new URL('subjects/russian/index.html',BASE).href;
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>!!window.RussianRuntimeOptimizer&&!!window.RussianCapabilityProgression,null,{timeout:30000});
  const swReadiness=await withTimeout(page.evaluate(async()=>{
    const reg=await window.RussianRuntimeOptimizer.ensureServiceWorkerReady({force:true});
    const registrations=await navigator.serviceWorker.getRegistrations();
    return {
      scope:reg?.scope||'',
      controller:!!navigator.serviceWorker.controller,
      precacheReport:await window.RussianRuntimeOptimizer.readShellPrecacheReport(),
      registrations:registrations.map(x=>({scope:x.scope,active:x.active?.state||'',installing:x.installing?.state||'',waiting:x.waiting?.state||''}))
    };
  }),75000,'Russian service-worker readiness');
  assert.equal(swReadiness.controller,true,'Russian service-worker must control the production page before offline verification');
  assert.ok(swReadiness.registrations.some(x=>x.active==='activated'),'Russian service-worker registration has no activated worker');
  assert.equal(swReadiness.precacheReport?.schema,'RUSSIAN_SW_PRECACHE_REPORT_V1','Russian service-worker precache report is unavailable');
  assert.deepEqual(swReadiness.precacheReport?.failed||[],[],'Russian service-worker precache still has failed assets after authenticated repair');
  // The v36 activation must remove obsolete Russian shells without touching learner or sibling caches.
  await page.waitForFunction(async()=>!(await caches.keys()).some(key=>['russian-app-shell-v26-engine-semantic-symbols','russian-app-shell-v27-engine-mobile-navigation','russian-app-shell-v28-engine-local-save-status','russian-app-shell-v31-engine-approved-overview','russian-app-shell-v32-engine-mic-permission-cancel','russian-app-shell-v33-engine-listening-playback','russian-app-shell-v34-engine-source-audio-fallback','russian-app-shell-v35-engine-asr-turn-isolation'].includes(key)),null,{timeout:15000});
  const migration=await page.evaluate(async(expectedShell)=>{
    const keys=await caches.keys();
    const foreign=await caches.open('bauman-other-subject-persist-sentinel-v1');
    const sibling=await foreign.match('/__retain-foreign-cache');
    const learning=await caches.open('russian-learning-data-v1');
    const retained=await learning.match('/__retain-learning-data');
    return {
      keys,
      previousShellRemoved:!keys.includes('russian-app-shell-v26-engine-semantic-symbols')&&!keys.includes('russian-app-shell-v27-engine-mobile-navigation')&&!keys.includes('russian-app-shell-v28-engine-local-save-status')&&!keys.includes('russian-app-shell-v31-engine-approved-overview')&&!keys.includes('russian-app-shell-v32-engine-mic-permission-cancel')&&!keys.includes('russian-app-shell-v33-engine-listening-playback')&&!keys.includes('russian-app-shell-v34-engine-source-audio-fallback')&&!keys.includes('russian-app-shell-v35-engine-asr-turn-isolation'),
      newShellPresent:keys.includes(expectedShell),
      siblingCachePreserved:keys.includes('bauman-other-subject-persist-sentinel-v1')&&(await sibling?.text())==='unrelated-app-retained',
      learningCachePreserved:keys.includes('russian-learning-data-v1')&&(await retained?.text())==='user-offline-data-retained'
    };
  },expectedShell);
  assert.equal(migration.previousShellRemoved,true,'v26/v27/v28/v31/v32/v33/v34/v35 shells must be removed after v36 activation');
  assert.equal(migration.newShellPresent,true,'Combined canonical shell must be installed');
  assert.equal(migration.siblingCachePreserved,true,'Russian SW must not remove unrelated application caches');
  assert.equal(migration.learningCachePreserved,true,'Russian SW must not remove learner offline data cache');
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
  assert.ok(cached.shellVersion>=36,`Transient local self-recording requires Russian cache v36+ (got v${cached.shellVersion})`);
  for(const suffix of ['/subjects/russian/assets/russian-future-ui.js','/subjects/russian/assets/russian-future-ui.css'])assert.ok(cached.urls.some(x=>x.endsWith(suffix)),`Russian mobile app asset missing from offline shell: ${suffix}`);
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
    appShell:!!document.querySelector('.ru-app-shell'),
    saveLabel:document.getElementById('saveState')?.textContent||'',
    saveStatus:document.getElementById('saveState')?.dataset.localSave||''
  }));
  assert.equal(offline.online,false);
  assert.equal(offline.identityRuntime,true);
  assert.equal(offline.identityBootstrap,true);
  assert.notEqual(offline.identityReport?.status,'unavailable','Foundation identity registry/runtime must remain available offline');
  assert.ok(/^R[0-4]$/.test(offline.capability));
  assert.equal(offline.appShell,true);
  assert.doesNotMatch(offline.saveLabel,/Đã đồng bộ/,'Offline app must not falsely claim server sync');
  assert.ok(['pending','saved','error','recovery'].includes(offline.saveStatus),'Offline app must render the new truthful local-save status contract');
  assert.deepEqual(errors,[],'offline Russian reload emitted console/page errors');

  await page.screenshot({path:path.join(OUT,'russian-offline-reload.png'),fullPage:true});
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',cachedFoundation:true,offline,simulatedCacheMigration:{from:'v26/v27/v28/v31/v32/v33/v34/v35',to:expectedShell,previousShellRemoved:migration.previousShellRemoved,siblingCachePreserved:migration.siblingCachePreserved,learningCachePreserved:migration.learningCachePreserved}},null,2));
  console.log('Russian offline shell browser acceptance PASS');
}finally{
  await browser?.close();
}
