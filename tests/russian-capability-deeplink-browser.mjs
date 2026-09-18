import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-capability-deeplink';
fs.mkdirSync(OUT,{recursive:true});

async function mockControl(page){
  const deviceId='e'.repeat(64),deviceCode='BM-RU-DEEPLINK-E2E';
  const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{
    const req=route.request();
    if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const pathname=new URL(req.url()).pathname,headers={...cors,'content-type':'application/json'};
    const send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
    if(pathname==='/api/device/register'||pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/challenge')return send({challengeId:'challenge-ru-deeplink',signingInput:`bauman-ru-deeplink:${deviceId}`});
    if(pathname==='/api/device/verify')return send({sessionToken:'bm1.ru-deeplink',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});
    return route.fulfill({status:404,headers,body:'{}'});
  });
}

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1536,height:864}});
  const page=await context.newPage();
  await mockControl(page);
  const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));

  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:30000});
  await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:30000});
  await page.waitForFunction(()=>!!window.BAUMAN_HUB_SAFE?.selfCheck,null,{timeout:15000});

  // First open obtains the real compact capability snapshot from Russian.
  await page.evaluate(()=>window.app?.openSubjectInPage?.('russian'));
  await page.waitForFunction(()=>window.state?.subjectCapabilities?.russian?.schema==='RUSSIAN_CAPABILITY_BRIDGE_V1',null,{timeout:30000});
  const cap=await page.evaluate(()=>window.state.subjectCapabilities.russian);
  assert.equal(cap.currentBand?.id,'R0');
  assert.equal(cap.nextGap?.lessonId,'R01');
  assert.deepEqual(cap.nextGap?.route,{view:'learning',learnTab:'theory',lessonId:'R01'});
  const progressBefore=await page.evaluate(()=>Number(window.state?.progress?.russian||0));

  // Force a deliberately wrong remembered Russian location to prove the deep-link overrides it.
  await page.evaluate(()=>{
    const key='bauman_russian_survival_master_v11_clean_skeleton';
    const saved=JSON.parse(localStorage.getItem(key)||'{}');
    Object.assign(saved,{view:'overview',learnTab:'exam',lessonId:'R02',stage:'prep',slide:7});
    localStorage.setItem(key,JSON.stringify(saved));
    window.app?.closeStudy?.();
    window.app?.page?.('home',false);
    window.BAUMAN_HUB_SAFE?.refresh?.();
  });
  await page.waitForFunction(()=>!!document.querySelector('[data-safe-capability="russian"]'),null,{timeout:10000});

  await page.locator('[data-safe-capability="russian"] [data-safe-action="capability"]').click();
  await page.waitForFunction(()=>window.state?.activeTask?.source==='capability-gap',null,{timeout:10000});
  const activeTask=await page.evaluate(()=>window.state.activeTask);
  assert.deepEqual(activeTask.capabilityRoute,{view:'learning',learnTab:'theory',lessonId:'R01'});
  assert.equal(activeTask.capabilityBand,'R0');
  assert.equal(activeTask.capabilityLesson,'R01');

  const frameEl=page.locator('#subjectFrame');
  await frameEl.waitFor({state:'attached',timeout:10000});
  const frameSrc=await frameEl.getAttribute('src');
  assert.match(frameSrc,/routeView=learning/);
  assert.match(frameSrc,/routeTab=theory/);
  assert.match(frameSrc,/routeLesson=R01/);

  const frame=page.frames().find(f=>/subjects\/russian\/index\.html/.test(f.url()));
  assert.ok(frame,'Russian subject iframe missing after capability launch');
  await frame.waitForFunction(()=>{
    const saved=JSON.parse(localStorage.getItem('bauman_russian_survival_master_v11_clean_skeleton')||'{}');
    return saved.view==='learning'&&saved.learnTab==='theory'&&saved.lessonId==='R01'&&saved.stage==='vn';
  },null,{timeout:30000});
  const routed=await frame.evaluate(()=>JSON.parse(localStorage.getItem('bauman_russian_survival_master_v11_clean_skeleton')||'{}'));
  assert.equal(routed.view,'learning');
  assert.equal(routed.learnTab,'theory');
  assert.equal(routed.lessonId,'R01');
  assert.equal(routed.stage,'vn');
  assert.equal(routed.slide,0);

  const progressAfter=await page.evaluate(()=>Number(window.state?.progress?.russian||0));
  assert.equal(progressAfter,progressBefore,'Capability deep-link must not mutate canonical subject progress');

  await page.screenshot({path:path.join(OUT,'russian-capability-deeplink.png'),fullPage:true});
  assert.deepEqual(errors,[],'Capability deep-link emitted console/page errors');
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({
    status:'PASS',
    capability:cap,
    activeTask:{source:activeTask.source,capabilityBand:activeTask.capabilityBand,capabilityLesson:activeTask.capabilityLesson,capabilityRoute:activeTask.capabilityRoute},
    routed:{view:routed.view,learnTab:routed.learnTab,lessonId:routed.lessonId,stage:routed.stage,slide:routed.slide},
    progressBefore,progressAfter,errors
  },null,2));
  console.log('Russian capability deep-link browser acceptance PASS');
}finally{
  await browser?.close();
}
