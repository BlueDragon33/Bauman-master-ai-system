import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/browser-14c';
fs.mkdirSync(OUT,{recursive:true});
const errors=[],failed=[];const must=(v,m)=>assert.ok(v,m);

async function mockControl(page){
  const deviceId='c'.repeat(64),deviceCode='BM-14C-001';
  const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{
    const req=route.request();if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const u=new URL(req.url()),headers={...cors,'content-type':'application/json'};const send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
    if(u.pathname==='/api/device/register'||u.pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
    if(u.pathname==='/api/device/challenge')return send({challengeId:'challenge-14c',signingInput:`bauman-14c:${deviceId}`});
    if(u.pathname==='/api/device/verify')return send({sessionToken:'bm1.14c',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
    if(u.pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});
    return route.fulfill({status:404,headers,body:'{}'});
  });
}

const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
  await mockControl(page);
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  page.on('requestfailed',r=>{if(!r.url().startsWith('http://127.0.0.1:3003/'))failed.push(`${r.method()} ${r.url()} ${r.failure()?.errorText||''}`)});
  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});
  if(await page.locator('#appRoot.hidden').count())await page.locator('#loginBtn').click();
  await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:10000});
  await page.waitForFunction(()=>Boolean(window.BAUMAN_EVENT_READINESS_2026&&window.BAUMAN_COURSE_READINESS_2026&&window.app?.__event14cPatched),null,{timeout:15000});
  await page.waitForSelector('[data-event14c="ledger"]');
  assert.equal(await page.locator('[data-event14c="ledger"]').count(),1);
  assert.equal(await page.locator('.event14c-row').count(),8);

  const result=await page.evaluate(()=>{
    const e=window.BAUMAN_EVENT_READINESS_2026,c=window.BAUMAN_COURSE_READINESS_2026;
    const entriesBefore=JSON.stringify(window.state?.schedule?.entries||{}),lifecycleBefore=c.lifecycleAxis('d04');
    const initial=e.eventState('d04','Экз');
    const score89=e.recordEvidence('d04','Экз',{requirementsVerified:true,requirementSource:'BMSTU LMS verified requirement',allVerifiedRequirementsMet:true,criticalOpenIssues:0,rehearsalScore:89,notes:'browser gate 89'});
    const score92=e.recordEvidence('d04','Экз',{requirementsVerified:true,requirementSource:'BMSTU LMS verified requirement',allVerifiedRequirementsMet:true,criticalOpenIssues:0,rehearsalScore:92,notes:'browser gate 92'});
    const d04Half=e.courseEventAxis('d04');
    const dzReady=e.recordEvidence('d04','ДЗчт',{requirementsVerified:true,requirementSource:'BMSTU LMS verified requirement',allVerifiedRequirementsMet:true,criticalOpenIssues:0,rehearsalScore:92});
    const d04Full=e.courseEventAxis('d04');
    const d02Ready=e.recordEvidence('d02','Зчт',{requirementsVerified:true,requirementSource:'Verified course requirement',allVerifiedRequirementsMet:true,criticalOpenIssues:0});
    let d15Error='';try{e.recordEvidence('d15','Экз',{requirementsVerified:true,requirementSource:'Should be blocked',allVerifiedRequirementsMet:true,criticalOpenIssues:0,rehearsalScore:100})}catch(err){d15Error=String(err?.message||err)}
    const d15=e.eventState('d15','Экз'),entriesAfter=JSON.stringify(window.state?.schedule?.entries||{}),lifecycleAfter=c.lifecycleAxis('d04');
    return {initial,score89,score92,d04Half,dzReady,d04Full,d02Ready,d15Error,d15,scheduleUnchanged:entriesBefore===entriesAfter,lifecycleBefore,lifecycleAfter,counts:e.readinessCounts()};
  });
  assert.equal(result.initial.id,'EVENT_UNASSESSED');
  assert.equal(result.score89.id,'EVENT_PREPARING');
  assert.equal(result.score92.id,'EVENT_READY');
  assert.equal(result.d04Half.id,'EVENT_PREPARING');
  assert.equal(result.dzReady.id,'EVENT_READY');
  assert.equal(result.d04Full.id,'EVENT_READY');
  assert.equal(result.d02Ready.id,'EVENT_READY');
  must(/timing/.test(result.d15Error),'d15 unresolved timing must reject readiness evidence');
  assert.equal(result.d15.id,'EVENT_UNASSESSED');assert.equal(result.d15.editable,false);
  assert.equal(result.scheduleUnchanged,true,'Pass14C evidence writes must not change schedule entries');
  assert.equal(result.lifecycleBefore.id,result.lifecycleAfter.id,'Pass14C must not mutate course lifecycle');

  await page.evaluate(()=>window.app.home());
  assert.equal(await page.locator('[data-event14c="ledger"]').count(),1);
  await page.screenshot({path:path.join(OUT,'desktop-event-readiness.png'),fullPage:true});

  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});
  if(await page.locator('#appRoot.hidden').count())await page.locator('#loginBtn').click();
  await page.waitForFunction(()=>Boolean(window.BAUMAN_EVENT_READINESS_2026&&window.app?.__event14cPatched),null,{timeout:15000});
  const persisted=await page.evaluate(()=>({exam:window.BAUMAN_EVENT_READINESS_2026.eventState('d04','Экз'),dz:window.BAUMAN_EVENT_READINESS_2026.eventState('d04','ДЗчт'),credit:window.BAUMAN_EVENT_READINESS_2026.eventState('d02','Зчт')}));
  assert.equal(persisted.exam.id,'EVENT_READY');assert.equal(persisted.dz.id,'EVENT_READY');assert.equal(persisted.credit.id,'EVENT_READY');

  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.app.home());await page.waitForSelector('[data-event14c="ledger"]');
  const mobile=await page.evaluate(()=>{const home=document.getElementById('page-home'),list=document.querySelector('.event14c-list');return{client:home?.clientWidth||0,scroll:home?.scrollWidth||0,columns:list?getComputedStyle(list).gridTemplateColumns:''}});
  must(mobile.scroll<=mobile.client+2,`Mobile overflow: ${JSON.stringify(mobile)}`);if(mobile.columns)assert.equal(mobile.columns.trim().split(/\s+/).length,1);
  await page.screenshot({path:path.join(OUT,'mobile-event-readiness.png'),fullPage:true});

  must(errors.length===0,`Page errors: ${errors.join('\n')}`);must(failed.length===0,`Unexpected failed requests: ${failed.join('\n')}`);
  fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify({status:'PASS',result,persisted,mobile},null,2));
  console.log('PASS14C_BROWSER_ACCEPTANCE_PASS');
} finally {await browser.close()}
