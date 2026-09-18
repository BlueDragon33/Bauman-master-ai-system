import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/subject-progress-contract';
fs.mkdirSync(OUT,{recursive:true});

async function mockControl(page){
 const deviceId='9'.repeat(64),deviceCode='BM-PROGRESS-CONTRACT';
 const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
 await page.route('http://127.0.0.1:3003/**',async route=>{
  const req=route.request();if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
  const pathname=new URL(req.url()).pathname,headers={...cors,'content-type':'application/json'},send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
  if(pathname==='/api/device/register'||pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
  if(pathname==='/api/device/challenge')return send({challengeId:'progress-contract',signingInput:'progress-contract'});
  if(pathname==='/api/device/verify')return send({sessionToken:'bm1.progress',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
  if(pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});
  return route.fulfill({status:404,headers,body:'{}'});
 });
}

let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage();await mockControl(page);
 await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:30000});
 await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:30000});

 const stateOnly=await page.evaluate(()=>{
  state.activeTask={subjectId:'russian',taskId:'heartbeat-task'};
  state.progress.russian=17;
  const scheduleBefore=JSON.stringify(state.schedule.entries||{}),activityBefore=(state.activity||[]).length;
  const accepted=window.receiveSubjectProgress({
    subjectId:'russian',taskId:'heartbeat-task',status:'in_progress',
    progress:{reviewDue:3,reviewTotal:4,canonicalState:'RUSSIAN_LEARNING_STATE_V2'}
  });
  const report=(state.subjectReports.russian||[]).at(-1);
  return {accepted,progress:state.progress.russian,scheduleSame:JSON.stringify(state.schedule.entries||{})===scheduleBefore,activitySame:(state.activity||[]).length===activityBefore,reportKind:report?.reportKind,percent:report?.percent};
 });
 assert.equal(stateOnly.accepted,false);
 assert.equal(stateOnly.progress,17);
 assert.equal(stateOnly.scheduleSame,true);
 assert.equal(stateOnly.activitySame,true);
 assert.equal(stateOnly.reportKind,'state');
 assert.equal(stateOnly.percent,null);

 const stale=await page.evaluate(()=>{
  state.activeTask={subjectId:'russian',taskId:'current-task'};
  const progressBefore=state.progress.russian,scheduleBefore=JSON.stringify(state.schedule.entries||{});
  const accepted=window.receiveSubjectProgress({subjectId:'russian',taskId:'old-task',total:10,correct:9,percent:90,targetQuestions:100,targetScore:80});
  return {accepted,progressBefore,progressAfter:state.progress.russian,scheduleSame:JSON.stringify(state.schedule.entries||{})===scheduleBefore,kind:(state.subjectReports.russian||[]).at(-1)?.reportKind};
 });
 assert.equal(stale.accepted,false);
 assert.equal(stale.progressAfter,stale.progressBefore);
 assert.equal(stale.scheduleSame,true);
 assert.equal(stale.kind,'assessment');

 const valid=await page.evaluate(()=>{
  state.activeTask={subjectId:'russian',taskId:'current-task'};
  const accepted=window.receiveSubjectProgress({subjectId:'russian',taskId:'current-task',total:10,correct:9,percent:90,targetQuestions:100,targetScore:80});
  const report=(state.subjectReports.russian||[]).at(-1);
  return {accepted,progress:state.progress.russian,kind:report?.reportKind,taskAccepted:report?.taskAccepted};
 });
 assert.equal(valid.accepted,true);
 assert.equal(valid.kind,'assessment');
 assert.equal(valid.taskAccepted,true);
 assert.ok(Number.isFinite(valid.progress)&&valid.progress>=17&&valid.progress<=99);

 await page.screenshot({path:path.join(OUT,'subject-progress-contract.png'),fullPage:true});
 fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',stateOnly,stale,valid},null,2));
 console.log('Subject progress contract browser acceptance PASS');
}finally{await browser?.close()}
