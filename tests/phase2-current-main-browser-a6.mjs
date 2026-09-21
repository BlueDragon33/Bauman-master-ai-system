import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/browser-a6';
fs.mkdirSync(OUT,{recursive:true});
const errors=[],failed=[];const must=(v,m)=>assert.ok(v,m);

async function mockControl(page){
  const deviceId='6'.repeat(64),deviceCode='BM-A6-001';
  const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{
    const req=route.request();if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const u=new URL(req.url()),headers={...cors,'content-type':'application/json'},send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
    if(u.pathname==='/api/device/register'||u.pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
    if(u.pathname==='/api/device/challenge')return send({challengeId:'challenge-a6',signingInput:`bauman-a6:${deviceId}`});
    if(u.pathname==='/api/device/verify')return send({sessionToken:'bm1.a6',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
    if(u.pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});
    return route.fulfill({status:404,headers,body:'{}'});
  });
}

const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();await mockControl(page);
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  page.on('requestfailed',r=>{if(!r.url().startsWith('http://127.0.0.1:3003/')&&!context._offline)failed.push(`${r.method()} ${r.url()} ${r.failure()?.errorText||''}`)});
  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});
  if(await page.locator('#appRoot.hidden').count())await page.locator('#loginBtn').click();
  await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:10000});
  await page.waitForFunction(()=>Boolean(window.BAUMAN_COURSE_READINESS_2026&&window.BAUMAN_EVENT_READINESS_2026),null,{timeout:15000});

  const homeSnapshot=await page.evaluate(()=>({
    homeActive:document.getElementById('page-home')?.classList.contains('active')===true,
    commandOnHome:document.querySelectorAll('#page-home [data-command-a5="center"]').length,
    transcriptOnHome:document.querySelectorAll('#page-home [data-transcript14e="ledger"]').length
  }));
  assert.deepEqual(homeSnapshot,{homeActive:true,commandOnHome:0,transcriptOnHome:0});

  await page.evaluate(()=>window.app.openHomeFrame('progress'));
  await page.waitForSelector('#modalRoot [data-course14b-progress="s1"]');
  await page.locator('[data-a5-command-open]').click();
  await page.waitForFunction(()=>Boolean(window.BAUMAN_ACADEMIC_COMMAND_CENTER_2026),null,{timeout:15000});
  await page.waitForSelector('#modalRoot [data-command-a5="center"]');
  const online=await page.evaluate(()=>({
    courses:window.BAUMAN_ACADEMIC_COMMAND_CENTER_2026.summary().courses,
    cards:document.querySelectorAll('#modalRoot .commandA5-card').length,
    readOnly:window.BAUMAN_ACADEMIC_COMMAND_CENTER_2026.readOnly,
    schedulerMutation:window.BAUMAN_ACADEMIC_COMMAND_CENTER_2026.schedulerMutation,
    evidenceMutation:window.BAUMAN_ACADEMIC_COMMAND_CENTER_2026.evidenceMutation
  }));
  assert.deepEqual(online,{courses:8,cards:8,readOnly:true,schedulerMutation:false,evidenceMutation:false});

  await page.evaluate(()=>{document.getElementById('modalRoot').innerHTML=''});
  await context.setOffline(true);
  context._offline=true;
  await page.evaluate(()=>window.openAcademicCommandCenterOverviewA5());
  await page.waitForSelector('#modalRoot [data-command-a5="center"]',{timeout:5000});
  const offline=await page.evaluate(()=>({
    cards:document.querySelectorAll('#modalRoot .commandA5-card').length,
    honorsFinal:window.BAUMAN_ACADEMIC_COMMAND_CENTER_2026.summary().honors.finalEligibilityClaimed,
    caveat:window.BAUMAN_ACADEMIC_COMMAND_CENTER_2026.summary().honors.projectionCaveatActive
  }));
  assert.equal(offline.cards,8,'A6 offline-after-load must keep Command Center available');
  assert.equal(offline.honorsFinal,false,'A6 offline path must preserve no-final-honors-claim guard');
  assert.equal(offline.caveat,true,'A6 offline path must preserve honors projection caveat');
  await context.setOffline(false);context._offline=false;

  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>window.openAcademicCommandCenterOverviewA5());
  await page.waitForSelector('#modalRoot [data-command-a5="center"]');
  const mobile=await page.evaluate(()=>{const root=document.querySelector('#modalRoot [data-command-a5="center"]');return{client:root?.clientWidth||0,scroll:root?.scrollWidth||0}});
  must(mobile.scroll<=mobile.client+2,`A6 mobile overflow: ${JSON.stringify(mobile)}`);
  await page.screenshot({path:path.join(OUT,'a6-offline-command-center-mobile.png'),fullPage:true});

  must(errors.length===0,`Page errors: ${errors.join('\n')}`);
  must(failed.length===0,`Unexpected failed requests: ${failed.join('\n')}`);
  fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify({status:'PASS',online,offline,mobile,homeSnapshot},null,2));
  console.log('A6_CURRENT_MAIN_BROWSER_PASS');
}finally{await browser.close()}
