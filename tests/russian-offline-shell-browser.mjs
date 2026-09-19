import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-offline-shell';
fs.mkdirSync(OUT,{recursive:true});

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});

  const url=new URL('subjects/russian/index.html',BASE).href;
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>!!window.RussianRuntimeOptimizer&&!!window.RussianCapabilityProgression,null,{timeout:30000});
  await page.evaluate(async()=>{
    const reg=await navigator.serviceWorker.ready;
    if(!navigator.serviceWorker.controller){
      await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));
    }
    await reg.update().catch(()=>{});
  });
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:15000});
  await page.waitForFunction(()=>window.BAUMAN_FOUNDATION_IDENTITY_REPORT!==undefined,null,{timeout:15000});

  const cached=await page.evaluate(async()=>{
    const names=await caches.keys();
    const shell=names.find(x=>x==='russian-app-shell-v2-foundation');
    if(!shell)return {shell:null,urls:[]};
    const cache=await caches.open(shell);
    const keys=await cache.keys();
    return {shell,urls:keys.map(x=>new URL(x.url).pathname)};
  });
  assert.equal(cached.shell,'russian-app-shell-v2-foundation');
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
