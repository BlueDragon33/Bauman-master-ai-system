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
  const req=route.request();if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
  const pathname=new URL(req.url()).pathname,headers={...cors,'content-type':'application/json'},send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
  if(pathname==='/api/device/register'||pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
  if(pathname==='/api/device/challenge')return send({challengeId:'c',signingInput:'x'});
  if(pathname==='/api/device/verify')return send({sessionToken:'bm1.c',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
  if(pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});
  return route.fulfill({status:404,headers,body:'{}'});
 });
}
function emptyLearningState(){
 return {schema:'RUSSIAN_LEARNING_STATE_V2',resume:null,lastActivity:null,items:{},reviewQueue:{},reviewHistory:{},updatedAt:null};
}

let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage();await mockControl(page);
 await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:30000});
 await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:30000});

 await page.evaluate(empty=>{
  localStorage.setItem('bauman_russian_learning_state_v1',JSON.stringify(empty));
  state.lastStudy={subjectId:'russian',path:'subjects/russian/index.html'};
  state.subjectCapabilities.russian={schema:'RUSSIAN_CAPABILITY_BRIDGE_V1',subjectId:'russian',currentBand:{id:'R0',reviewDue:0},nextGap:{lessonId:'R04',step:'check',route:{view:'learning',learnTab:'review',lessonId:'R04'}},stageExit:{reviewDue:0}};
  save();
 },emptyLearningState());

 const progressBefore=await page.evaluate(()=>Number(state.progress?.russian||0));
 const immediate=await page.evaluate(()=>{
  app.continueStudy();
  return {source:state.activeTask?.source,route:state.activeTask?.capabilityRoute||null,pending:window.hasPendingCapabilityIntent?.('russian')===true,live:window.isSubjectCapabilityLive?.('russian')===true};
 });
 assert.notEqual(immediate.source,'capability-gap','Continue must not trust persisted capability snapshot before refresh');
 assert.equal(immediate.route,null);
 assert.equal(immediate.pending,true);
 assert.equal(immediate.live,false);

 await page.waitForFunction(()=>window.isSubjectCapabilityLive?.('russian')===true&&window.hasPendingCapabilityIntent?.('russian')!==true,null,{timeout:30000});
 await page.waitForFunction(()=>state.activeTask?.source==='capability-gap'&&state.activeTask?.capabilityRoute?.lessonId==='R01',null,{timeout:30000});
 const refreshed=await page.evaluate(()=>({source:state.activeTask.source,route:state.activeTask.capabilityRoute,capability:state.subjectCapabilities.russian}));
 assert.deepEqual(refreshed.route,{view:'learning',learnTab:'theory',lessonId:'R01'});
 assert.equal(refreshed.capability.nextGap?.lessonId,'R01','Fresh Russian snapshot must replace stale persisted gap');

 const tab=await page.evaluate(()=>{
  window.__capturedTabUrl='';
  window.open=url=>{window.__capturedTabUrl=String(url);return null;};
  app.openSubjectTab('russian');
  return {url:window.__capturedTabUrl,source:state.activeTask?.source,route:state.activeTask?.capabilityRoute||null};
 });
 assert.equal(tab.source,'capability-gap');
 assert.deepEqual(tab.route,{view:'learning',learnTab:'theory',lessonId:'R01'});
 assert.match(tab.url,/routeLesson=R01/);
 assert.match(tab.url,/routeTab=theory/);

 const crossSubject=await page.evaluate(()=>{
  window.__capturedTabUrl='';
  window.open=url=>{window.__capturedTabUrl=String(url);return null;};
  app.openSubjectTab('math');
  return {url:window.__capturedTabUrl,subjectId:state.activeTask?.subjectId,source:state.activeTask?.source,route:state.activeTask?.capabilityRoute||null};
 });
 assert.equal(crossSubject.subjectId,'math');
 assert.notEqual(crossSubject.source,'capability-gap');
 assert.equal(crossSubject.route,null);
 assert.doesNotMatch(crossSubject.url,/routeLesson=|routeTab=/,'Russian capability route must not leak into Math tab');

 await page.evaluate(()=>{
  app.closeStudy();
  state.lastStudy={subjectId:'russian',path:'subjects/russian/index.html'};
  const at=new Date(Date.now()-60000).toISOString();
  localStorage.setItem('bauman_russian_learning_state_v1',JSON.stringify({
    schema:'RUSSIAN_LEARNING_STATE_V2',resume:null,lastActivity:null,items:{},
    reviewQueue:{'review-e2e':{id:'review-e2e',reason:'wrong_answer',label:'Review E2E',lessonId:'R01',route:{view:'learning',learnTab:'review',lessonId:'R01'},dueAt:at,addedAt:at,scheduledAt:at,attempts:1,lastResult:'wrong'}},
    reviewHistory:{},updatedAt:at
  }));
  save();
 });
 const reviewImmediate=await page.evaluate(()=>{
  app.openSubjectCapabilityGap('russian');
  return {source:state.activeTask?.source,route:state.activeTask?.capabilityRoute||null,pending:window.hasPendingCapabilityIntent?.('russian')===true};
 });
 assert.notEqual(reviewImmediate.source,'capability-gap');
 assert.equal(reviewImmediate.route,null);
 assert.equal(reviewImmediate.pending,true);
 await page.waitForFunction(()=>window.isSubjectCapabilityLive?.('russian')===true&&window.hasPendingCapabilityIntent?.('russian')!==true,null,{timeout:30000});
 const reviewBlocked=await page.evaluate(()=>({
  source:state.activeTask?.source,route:state.activeTask?.capabilityRoute||null,
  bandDue:Number(state.subjectCapabilities?.russian?.currentBand?.reviewDue||0),
  stageDue:Number(state.subjectCapabilities?.russian?.stageExit?.reviewDue||0)
 }));
 assert.ok(Math.max(reviewBlocked.bandDue,reviewBlocked.stageDue)>0,'Fresh Russian snapshot must report the real due review');
 assert.notEqual(reviewBlocked.source,'capability-gap','Capability CTA must stay on safe mission while review is due');
 assert.equal(reviewBlocked.route,null);

 await page.evaluate(()=>app.closeStudy());
 const reviewContinueImmediate=await page.evaluate(()=>{
  app.continueStudy();
  return {source:state.activeTask?.source,route:state.activeTask?.capabilityRoute||null,pending:window.hasPendingCapabilityIntent?.('russian')===true};
 });
 assert.notEqual(reviewContinueImmediate.source,'capability-gap');
 assert.equal(reviewContinueImmediate.route,null);
 await page.waitForFunction(()=>window.hasPendingCapabilityIntent?.('russian')!==true&&window.isSubjectCapabilityLive?.('russian')===true,null,{timeout:30000});
 const reviewContinue=await page.evaluate(()=>({source:state.activeTask?.source,route:state.activeTask?.capabilityRoute||null}));
 assert.notEqual(reviewContinue.source,'capability-gap');
 assert.equal(reviewContinue.route,null);

 const progressAfterReview=await page.evaluate(()=>Number(state.progress?.russian||0));
 assert.equal(progressAfterReview,progressBefore,'Capability navigation and review heartbeat must not mutate canonical progress');

 await page.evaluate(empty=>{
  app.closeStudy();
  localStorage.setItem('bauman_russian_learning_state_v1',JSON.stringify(empty));
  state.lastStudy={subjectId:'russian',path:'subjects/russian/index.html'};
  state.subjectCapabilities.russian={schema:'RUSSIAN_CAPABILITY_BRIDGE_V1',subjectId:'russian',currentBand:{id:'R0',reviewDue:0},nextGap:{lessonId:'R04',step:'check',route:{view:'learning',learnTab:'review',lessonId:'R04'}},stageExit:{reviewDue:0}};
  save();
 },emptyLearningState());
 await page.reload({waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:30000});
 await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:30000});
 const staleBeforeOpen=await page.evaluate(()=>({live:window.isSubjectCapabilityLive?.('russian')===true,hasSnapshot:!!state.subjectCapabilities?.russian}));
 assert.equal(staleBeforeOpen.hasSnapshot,true);
 assert.equal(staleBeforeOpen.live,false);

 const staleImmediate=await page.evaluate(()=>{
  app.continueStudy();
  return {source:state.activeTask?.source,route:state.activeTask?.capabilityRoute||null,pending:window.hasPendingCapabilityIntent?.('russian')===true};
 });
 assert.notEqual(staleImmediate.source,'capability-gap');
 assert.equal(staleImmediate.route,null);
 assert.equal(staleImmediate.pending,true);
 await page.waitForFunction(()=>state.activeTask?.source==='capability-gap'&&state.activeTask?.capabilityRoute?.lessonId==='R01',null,{timeout:30000});
 const staleAfterFresh=await page.evaluate(()=>({source:state.activeTask.source,route:state.activeTask.capabilityRoute,pending:window.hasPendingCapabilityIntent?.('russian')===true}));
 assert.equal(staleAfterFresh.pending,false);
 assert.deepEqual(staleAfterFresh.route,{view:'learning',learnTab:'theory',lessonId:'R01'});

 const abandoned=await page.evaluate(()=>{
  app.closeStudy();
  app.openSubjectCapabilityGap('russian');
  const beforeClose=window.hasPendingCapabilityIntent?.('russian')===true;
  app.closeStudy();
  return {beforeClose,afterClose:window.hasPendingCapabilityIntent?.('russian')===true};
 });
 assert.equal(abandoned.beforeClose,true);
 assert.equal(abandoned.afterClose,false,'Closing study must cancel an unconsumed capability intent');

 await page.screenshot({path:path.join(OUT,'continue-fresh-handshake.png'),fullPage:true});
 fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',immediate,refreshed,tab,crossSubject,reviewImmediate,reviewBlocked,reviewContinueImmediate,reviewContinue,staleBeforeOpen,staleImmediate,staleAfterFresh,abandoned,progressBefore,progressAfterReview},null,2));
 console.log('Russian capability continue browser acceptance PASS');
}finally{await browser?.close()}
