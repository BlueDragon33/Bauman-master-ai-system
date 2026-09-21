import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/deep-study-journal';
fs.mkdirSync(OUT,{recursive:true});

async function mockControl(page){
  const deviceId='e'.repeat(64),deviceCode='BM-DSJ-E2E';
  const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{
    const req=route.request();
    if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const pathname=new URL(req.url()).pathname,headers={...cors,'content-type':'application/json'};
    const send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
    if(pathname==='/api/device/register'||pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/challenge')return send({challengeId:'challenge-dsj',signingInput:`bauman-dsj:${deviceId}`});
    if(pathname==='/api/device/verify')return send({sessionToken:'bm1.dsj',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});
    return route.fulfill({status:404,headers,body:'{}'});
  });
}

async function ensureLogin(page){
  const hidden=await page.locator('#appRoot').evaluate(el=>el.classList.contains('hidden'));
  if(!hidden)return;
  await page.locator('#loginEmail').fill('dsj-e2e@example.com');
  await page.locator('#loginPass').fill('dsj-e2e-password');
  await page.locator('#loginBtn').click();
  await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:15000});
}

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();
  await mockControl(page);
  const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));

  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:30000});
  await ensureLogin(page);
  await page.waitForFunction(()=>!!window.BAUMAN_DEEP_STUDY_JOURNAL?.selfCheck,null,{timeout:15000});

  const before=await page.evaluate(()=>({
    progress:JSON.stringify(window.state.progress),
    schedule:JSON.stringify(window.state.schedule),
    capabilities:JSON.stringify(window.state.subjectCapabilities),
    reviewQueue:JSON.stringify(window.state.reviewQueue)
  }));

  await page.evaluate(()=>window.app.openHomeFrame('progress'));
  await page.locator('.deep-study-journal-launch').click();
  await page.waitForSelector('[data-dsj-release="DEEP_STUDY_JOURNAL_V1_2026_09"]');

  const health=await page.evaluate(()=>window.BAUMAN_DEEP_STUDY_JOURNAL.selfCheck());
  assert.equal(health.boundary.learnerReflectionOnly,true);
  assert.equal(health.boundary.authoritativeMasteryWrites,false);
  assert.equal(health.boundary.schedulerWrites,false);
  assert.equal(health.sidebarRouteAdded,false);

  await page.locator('#dsjFeynmanTopic').fill('PCA intuition');
  await page.locator('#dsjFeynmanText').fill('PCA tìm các trục trực giao giữ phương sai lớn nhất sau khi dữ liệu được đặt tâm; giảm chiều phải chấp nhận mất một phần thông tin.');
  await page.locator('[data-dsj-action="save-feynman"]').click();
  await page.waitForSelector('[data-dsj-release="DEEP_STUDY_JOURNAL_V1_2026_09"]');

  await page.locator('#dsjErrorSummary').fill('Quên center dữ liệu trước PCA');
  await page.locator('#dsjErrorFix').fill('Luôn kiểm tra mean và center train data trước khi tạo covariance.');
  await page.locator('[data-dsj-action="save-error"]').click();

  await page.locator('[data-dsj-action="start-closed"]').click();
  await page.locator('#dsjClosedNote').fill('Tự giải thích được covariance và eigenvector.');
  await page.locator('[data-dsj-action="finish-closed"]').click();

  await page.locator('#dsjDefenseAnswer').fill('Метод выбран потому, что он уменьшает размерность данных и сохраняет основную дисперсию.');
  await page.locator('[data-dsj-action="save-defense"]').click();

  const after=await page.evaluate(()=>({
    progress:JSON.stringify(window.state.progress),
    schedule:JSON.stringify(window.state.schedule),
    capabilities:JSON.stringify(window.state.subjectCapabilities),
    reviewQueue:JSON.stringify(window.state.reviewQueue),
    journal:window.state.deepStudyJournal,
    persisted:JSON.parse(localStorage.getItem('bauman_main_all_phases_subjects_v1')||'{}').deepStudyJournal,
    health:window.BAUMAN_DEEP_STUDY_JOURNAL.selfCheck()
  }));

  assert.equal(after.progress,before.progress,'Journal must not mutate canonical progress');
  assert.equal(after.schedule,before.schedule,'Journal must not mutate scheduler state');
  assert.equal(after.capabilities,before.capabilities,'Journal must not mutate subject capabilities');
  assert.equal(after.reviewQueue,before.reviewQueue,'Journal must not mutate review queue');
  assert.equal(after.journal.feynman.length,1);
  assert.equal(after.journal.errors.length,1);
  assert.equal(after.journal.closedAi.filter(x=>x.status==='completed').length,1);
  assert.equal(after.journal.oralDefense.length,1);
  assert.equal(after.persisted.feynman.length,1);

  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:30000});
  await ensureLogin(page);
  await page.waitForFunction(()=>!!window.BAUMAN_DEEP_STUDY_JOURNAL?.selfCheck,null,{timeout:15000});
  const reloaded=await page.evaluate(()=>window.BAUMAN_DEEP_STUDY_JOURNAL.selfCheck());
  assert.equal(reloaded.counts.feynman,1);
  assert.equal(reloaded.counts.openErrors,1);
  assert.equal(reloaded.counts.closedAi,1);
  assert.equal(reloaded.counts.oralDefense,1);

  await page.evaluate(()=>window.app.openHomeFrame('progress'));
  await page.locator('.deep-study-journal-launch').click();
  await page.screenshot({path:path.join(OUT,'deep-study-journal.png'),fullPage:true});

  assert.deepEqual(errors,[],'Deep Study Journal emitted console/page errors');
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',health:after.health,reloaded,errors},null,2));
  console.log('Deep Study Journal browser acceptance PASS');
}finally{
  await browser?.close();
}
