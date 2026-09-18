import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/browser-14b';
fs.mkdirSync(OUT,{recursive:true});
const errors=[],failed=[];
const must=(v,m)=>assert.ok(v,m);

async function mockControl(page){
  const deviceId='b'.repeat(64),deviceCode='BM-14B-001';
  const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{
    const req=route.request();if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const u=new URL(req.url()),headers={...cors,'content-type':'application/json'};const send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
    if(u.pathname==='/api/device/register'||u.pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
    if(u.pathname==='/api/device/challenge')return send({challengeId:'challenge-14b',signingInput:`bauman-14b:${deviceId}`});
    if(u.pathname==='/api/device/verify')return send({sessionToken:'bm1.14b',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
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
  await page.locator('#loginBtn').click();
  await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:10000});
  await page.waitForFunction(()=>Boolean(window.BAUMAN_COURSE_READINESS_2026&&window.BAUMAN_COURSE_ARCHITECTURE_S1_2026&&window.app?.__course14bPatched),null,{timeout:15000});
  await page.waitForSelector('[data-course14b="s1"]');
  assert.equal(await page.locator('[data-course14b="s1"]').count(),1);
  assert.equal(await page.locator('.course14b-card').count(),8);

  const initial=await page.evaluate(()=>{
    const r=window.BAUMAN_COURSE_READINESS_2026,a=window.BAUMAN_COURSE_ARCHITECTURE_S1_2026;
    const d01=a.courses.find(x=>x.courseId==='d01'),d15=a.courses.find(x=>x.courseId==='d15'),p02=a.courses.find(x=>x.courseId==='p02'),d02=a.courses.find(x=>x.courseId==='d02');
    return {version:r.version,readOnly:r.readOnly,courses:a.courses.length,d01Prereq:r.prereqAxis('d01'),d01Action:r.nextAction('d01'),d01Critical:d01.criticalPrerequisites,d15Allocation:d15.semester1Allocation,p02Allocation:p02.semester1Allocation,d02Events:d02.eventModel.events,lifecycle:r.lifecycleAxis('d04'),event:r.eventAxis('d15')};
  });
  must(initial.readOnly,'Pass14B runtime must be read-only');assert.equal(initial.courses,8);
  assert.equal(initial.d01Prereq.id,'UNASSESSED');assert.equal(initial.d01Action.type,'LOCAL_DIAGNOSTIC_PENDING');assert.deepEqual(initial.d01Critical,[]);
  for(const alloc of [initial.d15Allocation,initial.p02Allocation]){assert.equal(alloc.credits,null);assert.equal(alloc.hours,null);assert.equal(alloc.assessmentTiming,'unresolved')}
  must(initial.d02Events.every(x=>x.code!=='Зчт'||x.internalTarget===null),'Pure Зчт got numeric target');
  assert.equal(initial.lifecycle.id,'NOT_STARTED');assert.equal(initial.event.id,'EVENT_UNASSESSED');

  const ready=await page.evaluate(()=>{
    const p1=window.BAUMAN_ACADEMIC_2026_RUNTIME,r=window.BAUMAN_COURSE_READINESS_2026;
    const recorded={};for(const g of ['P2','P3','P10'])recorded[g]=p1.recordDiagnostic(g,{D0:92,D1:92,D2:92,criticalMisconceptions:0,failedNodeIds:[]});
    const rawCourse=p1.courseReadiness('d04'),gateRows=r.gateRows('d04'),before=r.prereqAxis('d04');
    window.state.schedule.autoStage='m1';window.save();window.app.home();
    return {recorded,rawCourse,gateRows,before,lifecycle:r.lifecycleAxis('d04'),event:r.eventAxis('d04'),panelCount:document.querySelectorAll('[data-course14b="s1"]').length};
  });
  assert.equal(ready.before.id,'COURSE_READY',`Unexpected d04 readiness: ${JSON.stringify(ready)}`);assert.equal(ready.lifecycle.id,'COURSE_ACTIVE');assert.equal(ready.event.id,'EVENT_UNASSESSED');assert.equal(ready.panelCount,1);

  await page.locator('.course14b-card').first().click();
  await page.waitForSelector('.course14b-modal');
  const modalText=await page.locator('.course14b-modal').innerText();
  must(/English/.test(modalText),'d01 modal must expose English local readiness');
  must(/P0 Russian không phải gate/.test(modalText),'d01 modal must reject P0-as-Foreign-Language mapping');
  await page.locator('[data-action="close-modal"]').click();

  await page.evaluate(()=>{window.app.home();window.app.home();window.app.home()});
  assert.equal(await page.locator('[data-course14b="s1"]').count(),1);
  await page.screenshot({path:path.join(OUT,'desktop-course-readiness.png'),fullPage:true});

  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.app.home());
  await page.waitForSelector('[data-course14b="s1"]');
  const mobile=await page.evaluate(()=>{const home=document.getElementById('page-home'),grid=document.querySelector('.course14b-grid');return{client:home?.clientWidth||0,scroll:home?.scrollWidth||0,columns:grid?getComputedStyle(grid).gridTemplateColumns:''}});
  must(mobile.scroll<=mobile.client+2,`Mobile overflow: ${JSON.stringify(mobile)}`);
  if(mobile.columns)assert.equal(mobile.columns.trim().split(/\s+/).length,1);
  await page.screenshot({path:path.join(OUT,'mobile-course-readiness.png'),fullPage:true});

  must(errors.length===0,`Page errors: ${errors.join('\n')}`);must(failed.length===0,`Unexpected failed requests: ${failed.join('\n')}`);
  fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify({status:'PASS',initial:{version:initial.version,courses:initial.courses},ready,mobile},null,2));
  console.log('PASS14B_BROWSER_ACCEPTANCE_PASS');
} finally {await browser.close()}
