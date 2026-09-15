import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/hub-premium-responsive';
fs.mkdirSync(OUT,{recursive:true});
async function mockControl(page){
  const deviceId='h'.repeat(64),deviceCode='BM-HUB-V2';
  const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{const req=route.request();if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});const pathname=new URL(req.url()).pathname,headers={...cors,'content-type':'application/json'};const send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});if(pathname==='/api/device/register'||pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});if(pathname==='/api/device/challenge')return send({challengeId:'hub-v2',signingInput:`hub-v2:${deviceId}`});if(pathname==='/api/device/verify')return send({sessionToken:'bm1.hub-v2',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});if(pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});return route.fulfill({status:404,headers,body:'{}'});});
}
async function login(page){
  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});
  await page.locator('#loginEmail').fill('hub-v2@example.test');
  await page.locator('#loginPass').fill('hub-v2-pass');
  await page.locator('#loginBtn').click();
  await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'));
  await page.waitForFunction(()=>window.BAUMAN_HUB_V2?.selfCheck?.().ready===true,null,{timeout:15000});
}
let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1920,height:1080}});
  const page=await context.newPage();await mockControl(page);
  const errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  await login(page);
  const core=await page.evaluate(()=>window.BAUMAN_HUB_V2.selfCheck());
  assert.equal(core.release,'HUB_PREMIUM_V2_2026_09');assert.ok(core.appearance&&core.density&&core.search&&core.subjectBridge);
  assert.ok(await page.locator('.hub2-hero').isVisible());assert.ok(await page.locator('.hub2-assistant').isVisible());assert.ok(await page.locator('.hub2-schedule').isVisible());assert.ok((await page.locator('.hub2-subject').count())>=5);
  await page.locator('#appearanceBtn').click();await page.locator('#densitySelect').selectOption('compact');assert.equal(await page.evaluate(()=>document.body.dataset.density),'compact');await page.keyboard.press('Escape').catch(()=>{});
  await page.locator('[data-hub-subject="math"]').click();await page.waitForFunction(()=>window.state.page==='subjects'&&window.state.subject==='math');
  await page.evaluate(()=>window.app.page('home'));await page.waitForSelector('.hub2-dashboard');
  await page.locator('[data-hub-action="roadmap"]').first().click();await page.waitForFunction(()=>window.state.page==='roadmap');
  await page.evaluate(()=>window.app.page('home'));await page.waitForSelector('.hub2-dashboard');
  await page.locator('[data-hub-action="schedule"]').click();await page.waitForFunction(()=>window.state.page==='schedule');
  await page.evaluate(()=>window.app.page('home'));await page.waitForSelector('.hub2-dashboard');
  await page.locator('[data-hub-ask]').first().click();await page.waitForSelector('#aiRoot .ai-panel');await page.evaluate(()=>window.mentor.close());
  const cases=[['tuf-f15-1920x1080',1920,1080,'laptop'],['laptop-1536x864',1536,864,'laptop'],['ipad-3x2',1180,787,'tablet'],['iphone-19_5x9',390,844,'phone']];
  for(const [label,width,height,mode] of cases){
    await page.setViewportSize({width,height});await page.waitForTimeout(120);await page.evaluate(()=>window.app.page('home',false));await page.waitForSelector('.hub2-dashboard');
    const snap=await page.evaluate(()=>({mode:document.body.dataset.hubViewport,client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,hero:!!document.querySelector('.hub2-hero'),assistant:!!document.querySelector('.hub2-assistant'),appearance:!!document.getElementById('appearanceBtn'),search:!!document.getElementById('hubGlobalSearch')}));
    assert.equal(snap.mode,mode,`${label}: viewport classification drift`);assert.ok(snap.scroll<=snap.client+2,`${label}: horizontal overflow ${snap.scroll}/${snap.client}`);assert.ok(snap.hero&&snap.assistant&&snap.appearance&&snap.search,`${label}: primary Hub controls missing`);
    await page.screenshot({path:path.join(OUT,`${label}.png`),fullPage:true});
  }
  assert.deepEqual(errors,[],'Hub V2 emitted console/page errors');
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',release:core.release,viewports:cases.map(x=>x[0]),errors},null,2));
  console.log('Hub Premium V2 responsive acceptance PASS');
}finally{await browser?.close()}
