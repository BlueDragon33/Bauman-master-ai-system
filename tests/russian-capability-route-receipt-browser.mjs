import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-capability-route-receipt';
fs.mkdirSync(OUT,{recursive:true});

async function mockControl(page){
  const deviceId='f'.repeat(64),deviceCode='BM-RU-RECEIPT-E2E';
  const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{
    const req=route.request();
    if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const pathname=new URL(req.url()).pathname,headers={...cors,'content-type':'application/json'};
    const send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
    if(pathname==='/api/device/register'||pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/challenge')return send({challengeId:'challenge-ru-receipt',signingInput:`bauman-ru-receipt:${deviceId}`});
    if(pathname==='/api/device/verify')return send({sessionToken:'bm1.ru-receipt',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
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

  // Obtain the producer snapshot first. A normal open must not create a capability route receipt.
  await page.evaluate(()=>window.app?.openSubjectInPage?.('russian'));
  await page.waitForFunction(()=>window.state?.subjectCapabilities?.russian?.schema==='RUSSIAN_CAPABILITY_BRIDGE_V1',null,{timeout:30000});
  const cap=await page.evaluate(()=>window.state.subjectCapabilities.russian);
  assert.equal(cap.nextGap?.lessonId,'R01');
  assert.equal(await page.evaluate(()=>window.state?.subjectRouteReceipts?.russian??null),null);
  const progressBefore=await page.evaluate(()=>Number(window.state?.progress?.russian||0));

  await page.evaluate(()=>{
    window.app?.closeStudy?.();
    window.state.subject='russian';
    window.app?.page?.('subjects',false);
    window.app?.subjects?.();
    window.BAUMAN_HUB_OVERVIEW_SEARCH_V2?.compactSubjectCapability?.();
    window.BAUMAN_HUB_SAFE?.refresh?.();
  });
  await page.waitForFunction(()=>document.querySelector('[data-safe-capability-receipt="pending"]')?.textContent?.includes('Chưa có biên nhận mở gap')===true,null,{timeout:10000});

  // Open through capability CTA and require an ACK from the real Russian iframe.
  await page.locator('[data-safe-capability="russian"] [data-hub-v2-action="capability"]').click();
  await page.waitForFunction(()=>window.state?.activeTask?.source==='capability-gap',null,{timeout:10000});
  await page.waitForFunction(()=>window.state?.subjectRouteReceipts?.russian?.schema==='RUSSIAN_CAPABILITY_ROUTE_RECEIPT_V1',null,{timeout:30000});
  const receipt=await page.evaluate(()=>window.state.subjectRouteReceipts.russian);
  const task=await page.evaluate(()=>window.state.activeTask);
  assert.equal(receipt.subjectId,'russian');
  assert.equal(receipt.taskId,task.taskId||task.missionId);
  assert.equal(receipt.capabilityBand,'R0');
  assert.deepEqual(receipt.route,{view:'learning',learnTab:'theory',lessonId:'R01'});
  assert.equal(receipt.stage,'vn');

  await page.waitForFunction(()=>document.querySelector('[data-safe-capability-receipt="confirmed"]')?.textContent?.includes('Russian đã xác nhận mở R01')===true,null,{timeout:10000});
  const hubReceipt=await page.locator('[data-safe-capability-receipt="confirmed"]').innerText();
  assert.match(hubReceipt,/learning/);
  assert.match(hubReceipt,/theory/);
  assert.match(hubReceipt,/stage vn/);

  // Semantic forgery: even a direct consumer call cannot replace the verified receipt with a wrong task/route.
  const forged=await page.evaluate(()=>{
    const before=JSON.stringify(window.state.subjectRouteReceipts.russian);
    const accepted=window.receiveSubjectRouteReceipt?.({
      type:'BAUMAN_SUBJECT_CAPABILITY_ROUTE_APPLIED',
      schema:'RUSSIAN_CAPABILITY_ROUTE_RECEIPT_V1',
      subjectId:'russian',
      taskId:'forged-task',
      capabilityBand:'R0',
      route:{view:'learning',learnTab:'theory',lessonId:'R99'},
      stage:'hk4'
    });
    return {accepted,before,after:JSON.stringify(window.state.subjectRouteReceipts.russian)};
  });
  assert.equal(forged.accepted,false);
  assert.equal(forged.after,forged.before);

  // A receipt for a previous gap must not be shown as confirmation for a different current gap.
  await page.evaluate(()=>{
    const cap=window.state.subjectCapabilities.russian;
    cap.nextGap={lessonId:'R02',route:{view:'learning',learnTab:'theory',lessonId:'R02'}};
    window.BAUMAN_HUB_OVERVIEW_SEARCH_V2?.compactSubjectCapability?.();
    window.BAUMAN_HUB_SAFE?.refresh?.();
  });
  await page.waitForFunction(()=>document.querySelector('[data-safe-capability-receipt="pending"]')?.textContent?.includes('Chưa có biên nhận mở gap')===true,null,{timeout:10000});
  assert.equal(await page.locator('[data-safe-capability-receipt="confirmed"]').count(),0,'stale route receipt must not confirm a new gap');

  const progressAfter=await page.evaluate(()=>Number(window.state?.progress?.russian||0));
  assert.equal(progressAfter,progressBefore,'Route receipt must not mutate canonical progress');

  const health=await page.evaluate(()=>window.BAUMAN_HUB_SAFE?.selfCheck?.());
  assert.equal(health.capabilityRouteReceipt,true);
  await page.screenshot({path:path.join(OUT,'russian-capability-route-receipt.png'),fullPage:true});
  assert.deepEqual(errors,[],'Capability route receipt emitted console/page errors');
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({
    status:'PASS',receipt,taskId:task.taskId||task.missionId,forgedRejected:forged.accepted===false,
    staleReceiptHidden:true,progressBefore,progressAfter,health,errors
  },null,2));
  console.log('Russian capability route receipt browser acceptance PASS');
}finally{
  await browser?.close();
}
