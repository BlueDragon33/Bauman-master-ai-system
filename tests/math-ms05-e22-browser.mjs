import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/math-ms05-e22';
const targets=[
 {module:'pure',course:'pure-algebra',chapter:'c01',needle:'-E22-MS05-T01-',physical:'MATH-PREP-C09-ai_so_tuyen_tinh_i_vecto'},
 {module:'pure',course:'pure-algebra',chapter:'c03',needle:'-E22-MS05-T02-',physical:'MATH-PREP-C12-giai_tich_ii_nhieu_bien_'},
 {module:'applied',course:'applied-probability',chapter:'c12',needle:'-E22-MS05-T03-',physical:'MATH-PREP-C15-xac_suat_phan_phoi_ky_vo'},
 {module:'applied',course:'applied-probability',chapter:'c12',needle:'-E22-MS05-T04-',physical:'MATH-PREP-C15-xac_suat_phan_phoi_ky_vo'},
 {module:'applied',course:'applied-probability',chapter:'c13',needle:'-E22-MS05-T05-',physical:'MATH-PREP-C16-thong_ke_uoc_luong_kiem_'},
 {module:'pure',course:'pure-logic',chapter:'c10',needle:'-E22-MS05-T06-',physical:'MATH-PREP-C07-ngon_ngu_toan_ky_thuat_n'},
 {module:'pure',course:'pure-logic',chapter:'c10',needle:'-E22-MS05-T07-',physical:'MATH-PREP-C07-ngon_ngu_toan_ky_thuat_n'},
 {module:'applied',course:'applied-discrete',chapter:'c16',needle:'-E22-MS05-T08-',physical:'MATH-PREP-C18-lab_mo_hinh_toan_tin_hie'}
];
const report={status:'RUNNING',checks:{routes:[]},consoleErrors:[],pageErrors:[],failedRequests:[],httpErrors:[]};
fs.mkdirSync(OUT,{recursive:true});let browser;
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:900}});
 const page=await context.newPage();
 page.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text())});
 page.on('pageerror',e=>report.pageErrors.push(String(e?.stack||e)));
 page.on('requestfailed',r=>report.failedRequests.push(`${r.method()} ${r.url()} ${r.failure()?.errorText||''}`));
 page.on('response',r=>{if(r.status()>=400)report.httpErrors.push(`${r.status()} ${r.url()}`)});
 const url=`${BASE}subjects/math/index.html?host=main&hostOrigin=${encodeURIComponent(new URL(BASE).origin)}&subjectId=math&taskId=ms05-e22-browser&stage=prep`;
 await page.goto(url,{waitUntil:'load',timeout:30000});
 await page.waitForFunction(()=>window.BAUMAN_MATH_THEORY_E129&&window.BAUMAN_MATH_E186_LESSON_FIRST&&window.BAUMAN_MATH_ACTIVITY_STUDIO,null,{timeout:30000});

 async function pick(t){
   await page.evaluate(()=>window.BAUMAN_MATH_E186_LESSON_FIRST.open('module'));
   await page.locator(`[data-e186-pick="module"][data-e186-id="${t.module}"]`).click();
   await page.locator(`[data-e186-pick="course"][data-e186-id="${t.course}"]`).click();
   await page.locator(`[data-e186-pick="chapter"][data-e186-id="${t.chapter}"]`).click();
   const options=await page.evaluate(()=>window.BAUMAN_MATH_E186_LESSON_FIRST.lessonOptions());
   const hit=options.find(x=>x.id.includes(t.needle));
   assert.ok(hit,`missing ${t.needle} in ${t.chapter}`);
   await page.locator(`[data-e186-pick="lesson"][data-e186-id="${hit.id}"]`).click();
   await page.waitForFunction(id=>window.BAUMAN_MATH_E186_LESSON_FIRST.path().lessonId===id,hit.id,{timeout:10000});
   await page.waitForFunction(id=>document.querySelector(`[data-current-lesson="${id}"]`),hit.id,{timeout:10000});
   const route=await page.evaluate(()=>({path:window.BAUMAN_MATH_E186_LESSON_FIRST.path(),physical:window.__MATH_STATE?.e129ChapterId}));
   assert.equal(route.physical,t.physical,`${t.needle} wrong physical route`);
   report.checks.routes.push({needle:t.needle,chapter:t.chapter,lessonId:hit.id,physical:route.physical});
   return hit.id;
 }
 for(const t of targets)await pick(t);
 const t08=report.checks.routes.find(x=>x.needle.includes('T08')).lessonId;
 async function activity(id,min){
   await page.evaluate(()=>window.BAUMAN_MATH_E186_LESSON_FIRST.open('activity'));
   await page.locator(`[data-e186-pick="activity"][data-e186-id="${id}"]`).click();
   await page.waitForFunction(({lesson,id,min})=>{const x=window.BAUMAN_MATH_ACTIVITY_STUDIO?.selfCheck?.();return x?.lessonId===lesson&&x?.activity===id&&x?.companionMatches>=min;},{lesson:t08,id,min},{timeout:10000});
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
 await search.fill('Điểm có trọng số');
 await page.waitForTimeout(150);
 assert.ok(await page.locator('#mathFlList .math-fl-item').count()>0,'E22 mock-exam formula not searchable');
 await page.evaluate(()=>window.BAUMAN_MATH_FORMULA_LIBRARY.close());
 assert.deepEqual(report.pageErrors,[]);
 assert.deepEqual(report.failedRequests,[]);
 assert.deepEqual(report.httpErrors,[]);
 await page.screenshot({path:path.join(OUT,'math-ms05-e22.png'),fullPage:true});
 report.status='PASS';report.completedAt=new Date().toISOString();
 fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(report,null,2));
 await context.close();
}catch(error){
 report.status='FAIL';report.error=String(error?.stack||error);report.completedAt=new Date().toISOString();
 fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(report,null,2));throw error;
}finally{await browser?.close();}
