import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-capability-hub';
fs.mkdirSync(OUT,{recursive:true});

async function mockControl(page){
  const deviceId='d'.repeat(64),deviceCode='BM-RU-CAP-E2E';
  const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{
    const req=route.request();
    if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const pathname=new URL(req.url()).pathname,headers={...cors,'content-type':'application/json'};
    const send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
    if(pathname==='/api/device/register'||pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/challenge')return send({challengeId:'challenge-ru-cap',signingInput:`bauman-ru-cap:${deviceId}`});
    if(pathname==='/api/device/verify')return send({sessionToken:'bm1.ru-cap',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
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

  const before=await page.evaluate(()=>Number(window.state?.progress?.russian||0));
  await page.evaluate(()=>window.app?.openSubjectInPage?.('russian'));
  await page.waitForFunction(()=>!!document.getElementById('subjectFrame'),null,{timeout:10000});
  await page.waitForFunction(()=>window.state?.subjectCapabilities?.russian?.schema==='RUSSIAN_CAPABILITY_BRIDGE_V1',null,{timeout:30000});

  const snap=await page.evaluate(()=>window.state.subjectCapabilities.russian);
  assert.equal(snap.subjectId,'russian');
  assert.equal(snap.schema,'RUSSIAN_CAPABILITY_BRIDGE_V1');
  assert.equal(snap.currentBand?.id,'R0');
  assert.equal(snap.nextGap?.lessonId,'R01');
  assert.ok(Array.isArray(snap.bands)&&snap.bands.length===5);
  assert.equal(Number(window.NaN),Number.NaN);

  const after=await page.evaluate(()=>Number(window.state?.progress?.russian||0));
  assert.equal(after,before,'Capability bridge must not mutate canonical subject progress');

  await page.evaluate(()=>{window.app?.closeStudy?.();window.app?.page?.('home',false);window.BAUMAN_HUB_SAFE?.refresh?.()});
  await page.waitForFunction(()=>!!document.querySelector('[data-safe-capability="russian"]'),null,{timeout:10000});
  const card=page.locator('[data-safe-capability="russian"]');
  const text=await card.innerText();
  assert.match(text,/R0/);
  assert.match(text,/R01/);
  assert.match(text,/Snapshot từ Russian Sub Web App/);

  const health=await page.evaluate(()=>window.BAUMAN_HUB_SAFE?.selfCheck?.());
  assert.equal(health.capabilitySnapshot,true);
  assert.equal(health.capabilitySurface,true);

  await page.screenshot({path:path.join(OUT,'russian-capability-hub.png'),fullPage:true});
  assert.deepEqual(errors,[],'Capability Hub flow emitted console/page errors');
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',currentBand:snap.currentBand,nextGap:snap.nextGap,stageExit:snap.stageExit,progressBefore:before,progressAfter:after,health,errors},null,2));
  console.log('Russian capability Hub browser acceptance PASS');
}finally{
  await browser?.close();
}
