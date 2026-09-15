import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/hub-preservation-responsive';
fs.mkdirSync(OUT,{recursive:true});

async function mockControl(page){
  const deviceId='c'.repeat(64),deviceCode='BM-SYSTEM-E2E';
  const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{
    const req=route.request();
    if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const pathname=new URL(req.url()).pathname,headers={...cors,'content-type':'application/json'};
    const send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
    if(pathname==='/api/device/register'||pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/challenge')return send({challengeId:'challenge-system-e2e',signingInput:`bauman-system-e2e:${deviceId}`});
    if(pathname==='/api/device/verify')return send({sessionToken:'bm1.system-e2e',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});
    return route.fulfill({status:404,headers,body:'{}'});
  });
}

async function login(page){
  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:30000});
  await page.locator('#loginEmail').fill('hub-preservation@example.test');
  await page.locator('#loginPass').fill('hub-preservation-pass');
  await page.locator('#loginBtn').click();
  await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:30000});
}

async function checkCanonicalContent(page){
  const content=await page.evaluate(()=>({
    subjectIds:(window.BAUMAN_DATA?.subjects||[]).map(x=>x.id).sort(),
    pages:['home','roadmap','subjects','schedule','research'].filter(id=>document.getElementById(`page-${id}`)),
    appearance:!!document.getElementById('appearanceBtn'),
    ai:!!document.getElementById('aiBtn'),
    optionalSkin:!!window.BAUMAN_HUB_V2
  }));
  assert.deepEqual(content.subjectIds,['ai','foundation','math','programming','research','russian','signal','systems']);
  assert.equal(content.pages.length,5,'canonical Hub pages were removed');
  assert.ok(content.appearance,'Giao diện control missing');
  assert.ok(content.ai,'AI control missing');
  return content;
}

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1920,height:1080}});
  const page=await context.newPage();
  await mockControl(page);
  const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  await login(page);
  const content=await checkCanonicalContent(page);

  for(const id of ['roadmap','subjects','schedule','research','home']){
    await page.evaluate(id=>window.app?.page?.(id,false),id);
    await page.waitForFunction(id=>document.getElementById(`page-${id}`)?.classList.contains('active'),id,{timeout:10000});
  }

  if(content.optionalSkin){
    const skin=await page.evaluate(()=>window.BAUMAN_HUB_V2?.selfCheck?.());
    assert.equal(skin?.ready,true,'optional Hub skin is loaded but not healthy');
  }

  const cases=[['tuf-f15-1920x1080',1920,1080],['laptop-1536x864',1536,864],['ipad-3x2',1180,787],['iphone-19_5x9',390,844]];
  for(const [label,width,height] of cases){
    await page.setViewportSize({width,height});
    await page.waitForTimeout(150);
    await page.evaluate(()=>window.app?.page?.('home',false));
    const snap=await page.evaluate(()=>({
      client:document.documentElement.clientWidth,
      scroll:document.documentElement.scrollWidth,
      app:!!document.getElementById('appRoot')&&!document.getElementById('appRoot').classList.contains('hidden'),
      appearance:!!document.getElementById('appearanceBtn'),
      page:document.getElementById('page-home')?.classList.contains('active')===true
    }));
    assert.ok(snap.app&&snap.appearance&&snap.page,`${label}: canonical Hub controls missing`);
    assert.ok(snap.scroll<=snap.client+2,`${label}: horizontal overflow ${snap.scroll}/${snap.client}`);
    await page.screenshot({path:path.join(OUT,`${label}.png`),fullPage:true});
  }

  assert.deepEqual(errors,[],'Hub emitted console/page errors');
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',mode:content.optionalSkin?'optional-skin':'preservation',subjects:content.subjectIds.length,viewports:cases.map(x=>x[0]),errors},null,2));
  console.log(`Hub preservation responsive acceptance PASS (${content.optionalSkin?'optional-skin':'preservation'})`);
}finally{
  await browser?.close();
}
