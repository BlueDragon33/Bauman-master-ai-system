import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/math-mp08-e17';
const T01='MATH-VN-C06-python_numpy_cho_tinh_to-E17-MP08-T01-time-index-sampling';
const T05='MATH-VN-C04-xac_suat_co_ban_va_bien_-E17-MP08-T05-autocorrelation';
const report={status:'RUNNING',checks:{},consoleErrors:[],pageErrors:[],failedRequests:[],httpErrors:[]};
fs.mkdirSync(OUT,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:900}});
 const page=await context.newPage();
 page.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text())});
 page.on('pageerror',e=>report.pageErrors.push(String(e?.stack||e)));
 page.on('requestfailed',r=>report.failedRequests.push(`${r.method()} ${r.url()} ${r.failure()?.errorText||''}`));
 page.on('response',r=>{if(r.status()>=400)report.httpErrors.push(`${r.status()} ${r.url()}`)});
 const url=`${BASE}subjects/math/index.html?host=main&hostOrigin=${encodeURIComponent(new URL(BASE).origin)}&subjectId=math&taskId=mp08-e17-browser&stage=prepare`;
 await page.goto(url,{waitUntil:'load',timeout:30000});
 await page.waitForFunction(()=>window.BAUMAN_MATH_THEORY_E129&&window.BAUMAN_MATH_E186_LESSON_FIRST&&window.BAUMAN_MATH_ACTIVITY_STUDIO,null,{timeout:30000});
 await page.waitForFunction(()=>window.BAUMAN_MATH_E186_LESSON_FIRST?.release==='E197_PROGRAM_ANCHOR_ROUTING_MP08',null,{timeout:30000});

 await page.evaluate(()=>window.BAUMAN_MATH_E186_LESSON_FIRST.open('module'));
 await page.locator('[data-e186-pick="module"][data-e186-id="applied"]').click();
 await page.locator('[data-e186-pick="course"][data-e186-id="applied-probability"]').click();
 await page.locator('[data-e186-pick="chapter"][data-e186-id="c14"]').click();
 const options=await page.evaluate(()=>window.BAUMAN_MATH_E186_LESSON_FIRST.lessonOptions());
 const ids=options.map(x=>x.id);
 assert.equal(ids.length,8,'Program L14 must expose exactly the eight E17 m_p08 lessons');
 assert.ok(ids.includes(T01)&&ids.includes(T05),'Program L14 lesson list misses E17 anchors');
 report.checks.programL14=ids;

 await page.locator(`[data-e186-pick="lesson"][data-e186-id="${T01}"]`).click();
 await page.waitForFunction(id=>window.BAUMAN_MATH_E186_LESSON_FIRST.path().lessonId===id,T01,{timeout:10000});
 await page.waitForFunction(id=>document.querySelector(`[data-current-lesson="${id}"]`),T01,{timeout:10000});
 const route=await page.evaluate(()=>({path:window.BAUMAN_MATH_E186_LESSON_FIRST.path(),chapter:window.__MATH_STATE?.e129ChapterId}));
 assert.equal(route.path.chapterId,'c14','logical program chapter must remain L14 route');
 assert.equal(route.chapter,'MATH-VN-C06-python_numpy_cho_tinh_to','selected lesson must route theory renderer to its physical C06 content');
 report.checks.routeBridge=route;

 async function activity(id,min){
   await page.evaluate(()=>window.BAUMAN_MATH_E186_LESSON_FIRST.open('activity'));
   await page.locator(`[data-e186-pick="activity"][data-e186-id="${id}"]`).click();
   await page.waitForFunction(({lesson,id,min})=>{
     const x=window.BAUMAN_MATH_ACTIVITY_STUDIO?.selfCheck?.();
     return x?.lessonId===lesson&&x?.activity===id&&x?.companionMatches>=min;
   },{lesson:T01,id,min},{timeout:10000});
   return page.evaluate(()=>window.BAUMAN_MATH_ACTIVITY_STUDIO.selfCheck());
 }
 report.checks.exercises=await activity('exercises',14);
 report.checks.practice=await activity('practice',2);
 report.checks.application=await activity('application',2);
 report.checks.review=await activity('review',1);
 report.checks.exam=await activity('exam',7);

 await page.evaluate(()=>window.BAUMAN_MATH_FORMULA_LIBRARY.open());
 await page.waitForFunction(()=>window.BAUMAN_MATH_FORMULA_LIBRARY?.selfCheck?.().loaded,null,{timeout:10000});
 const search=page.locator('#mathFlSearch');
 await search.fill('Tần số lấy mẫu');
 await page.waitForTimeout(150);
 assert.ok(await page.locator('#mathFlList .math-fl-item').count()>0,'E17 sampling formula is not searchable');
 await page.evaluate(()=>window.BAUMAN_MATH_FORMULA_LIBRARY.close());

 assert.deepEqual(report.pageErrors,[],'browser emitted page errors');
 assert.deepEqual(report.failedRequests,[],'browser emitted failed requests');
 assert.deepEqual(report.httpErrors,[],'browser emitted HTTP errors');
 await page.screenshot({path:path.join(OUT,'math-mp08-e17.png'),fullPage:true});
 report.status='PASS';report.completedAt=new Date().toISOString();
 fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(report,null,2));
 await context.close();
}catch(error){
 report.status='FAIL';report.error=String(error?.stack||error);report.completedAt=new Date().toISOString();
 fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(report,null,2));
 throw error;
}finally{await browser?.close();}
