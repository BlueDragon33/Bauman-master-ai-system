import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/deep-study-journal';
fs.mkdirSync(OUT,{recursive:true});
const errors=[],failed=[];
async function mockControl(page){
  const deviceId='8'.repeat(64),deviceCode='BM-DSJ-001';
  const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{
    const req=route.request();if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const u=new URL(req.url()),headers={...cors,'content-type':'application/json'},send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
    if(u.pathname==='/api/device/register'||u.pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
    if(u.pathname==='/api/device/challenge')return send({challengeId:'challenge-dsj',signingInput:`bauman-dsj:${deviceId}`});
    if(u.pathname==='/api/device/verify')return send({sessionToken:'bm1.dsj',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
    if(u.pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});
    return route.fulfill({status:404,headers,body:'{}'});
  });
}
const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
  await mockControl(page);
  await page.addInitScript(()=>{
    const user={email:'dsj@example.com',name:'DSJ Tester',role:'user'};
    localStorage.setItem('bauman_main_users_fullcode_v1',JSON.stringify([user]));
    localStorage.setItem('bauman_current_user_fullcode_v1',JSON.stringify(user));
  });
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  page.on('requestfailed',r=>{if(!r.url().startsWith('http://127.0.0.1:3003/'))failed.push(`${r.method()} ${r.url()} ${r.failure()?.errorText||''}`)});
  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});
  await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:10000});
  await page.waitForFunction(()=>Boolean(window.BAUMAN_DEEP_STUDY_JOURNAL_V1),null,{timeout:10000});
  // The Progress action is owned by the asynchronously bootstrapped Phase2 course runtime.
  // Direct and packaged runtimes can reach this point at different speeds, so wait for the
  // existing deterministic patch marker instead of racing the modal render.
  await page.waitForFunction(()=>window.app?.__course14bPatched===true,null,{timeout:15000});

  const before=await page.evaluate(()=>({progress:JSON.stringify(window.state.progress),schedule:JSON.stringify(window.state.schedule),journal:window.state.deepStudyJournal}));
  await page.evaluate(()=>window.app.openHomeFrame('progress'));
  await page.waitForSelector('[data-dsj-open]',{timeout:15000});
  await page.locator('[data-dsj-open]').click();
  await page.waitForSelector('[data-deep-study-journal-v1]');
  assert.equal(await page.locator('#nav [data-page="journal"]').count(),0,'DSJ must not add sidebar nav');

  await page.locator('[data-dsj-field="type"]').selectOption('error');
  await page.locator('[data-dsj-field="title"]').fill('Sai giả thiết ổn định');
  await page.locator('[data-dsj-field="body"]').fill('Tôi đã dùng điều kiện ổn định trước khi kiểm tra giả thiết. Lần sau phải xác định miền áp dụng trước.');
  await page.locator('[data-dsj-action="save"]').click();
  await page.waitForSelector('.dsj-entry');
  const after=await page.evaluate(()=>({
    progress:JSON.stringify(window.state.progress),
    schedule:JSON.stringify(window.state.schedule),
    count:window.state.deepStudyJournal.entries.length,
    entry:window.state.deepStudyJournal.entries[0],
    self:window.BAUMAN_DEEP_STUDY_JOURNAL_V1.selfCheck()
  }));
  assert.equal(after.count,1);
  assert.equal(after.entry.type,'error');
  assert.equal(after.progress,before.progress,'DSJ changed Hub progress');
  assert.equal(after.schedule,before.schedule,'DSJ changed scheduler');
  assert.equal(after.self.authoritativeMasteryEvidence,false);
  assert.equal(after.self.masteryMutation,false);
  assert.equal(after.self.diagnosticMutation,false);
  assert.equal(after.self.schedulerMutation,false);
  assert.equal(after.self.progressMutation,false);
  assert.equal(after.self.noSeparateStorage,true);

  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});
  await page.waitForFunction(()=>Boolean(window.BAUMAN_DEEP_STUDY_JOURNAL_V1),null,{timeout:10000});
  assert.equal(await page.evaluate(()=>window.state.deepStudyJournal.entries.length),1,'DSJ learner-state entry did not persist');

  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>window.openDeepStudyJournalV1());
  await page.waitForSelector('[data-deep-study-journal-v1]');
  const mobile=await page.evaluate(()=>{const x=document.querySelector('[data-deep-study-journal-v1]');return{client:x?.clientWidth||0,scroll:x?.scrollWidth||0}});
  assert.ok(mobile.scroll<=mobile.client+2,`DSJ mobile overflow: ${JSON.stringify(mobile)}`);
  await page.screenshot({path:path.join(OUT,'dsj-mobile.png'),fullPage:true});

  assert.deepEqual(errors,[],'DSJ emitted page errors');
  assert.deepEqual(failed,[],'DSJ emitted unexpected failed requests');
  fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify({status:'PASS',after,mobile},null,2));
  console.log('DEEP_STUDY_JOURNAL_BROWSER_PASS');
}finally{await browser.close()}
