import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-capability-continue';
fs.mkdirSync(OUT,{recursive:true});
async function mockControl(page){
 const deviceId='e'.repeat(64),deviceCode='BM-RU-CONTINUE';
 const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
 await page.route('http://127.0.0.1:3003/**',async route=>{
  const req=route.request(); if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
  const pathname=new URL(req.url()).pathname,headers={...cors,'content-type':'application/json'},send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
  if(pathname==='/api/device/register'||pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
  if(pathname==='/api/device/challenge')return send({challengeId:'c',signingInput:'x'});
  if(pathname==='/api/device/verify')return send({sessionToken:'bm1.c',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
  if(pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});
  return route.fulfill({status:404,headers,body:'{}'});
 });
}
let browser;
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage(); await mockControl(page);
 await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:30000});
 await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:30000});
 await page.evaluate(()=>{
  state.lastStudy={subjectId:'russian',path:'subjects/russian/index.html'};
  state.subjectCapabilities.russian={schema:'RUSSIAN_CAPABILITY_BRIDGE_V1',subjectId:'russian',currentBand:{id:'R0',reviewDue:0},nextGap:{lessonId:'R01',route:{view:'learning',learnTab:'theory',lessonId:'R01'}},stageExit:{reviewDue:0}};
  save();
 });
 await page.evaluate(()=>app.continueStudy());
 await page.waitForFunction(()=>state.activeTask?.source==='capability-gap'&&state.activeTask?.capabilityRoute?.lessonId==='R01',null,{timeout:10000});
 await page.evaluate(()=>app.closeStudy());
 await page.evaluate(()=>{
  state.subjectCapabilities.russian.currentBand.reviewDue=2;
  state.subjectCapabilities.russian.stageExit.reviewDue=2;
  save();
  app.continueStudy();
 });
 await page.waitForFunction(()=>state.activeTask?.source!=='capability-gap'&&!state.activeTask?.capabilityRoute,null,{timeout:10000});
 const result=await page.evaluate(()=>({source:state.activeTask.source,route:state.activeTask.capabilityRoute||null,progress:Number(state.progress?.russian||0)}));
 assert.equal(result.route,null);
 await page.screenshot({path:path.join(OUT,'continue-review-safe.png'),fullPage:true});
 fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',result},null,2));
 console.log('Russian capability continue browser acceptance PASS');
}finally{await browser?.close()}
