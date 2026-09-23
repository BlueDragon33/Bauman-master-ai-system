import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/math-learning-journey';
const LESSON='MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140';
const STATE_KEY='bauman_math_learning_flow_v1';
const report={status:'RUNNING',lessonId:LESSON,checks:{},consoleErrors:[],pageErrors:[],failedRequests:[],httpErrors:[]};
fs.mkdirSync(OUT,{recursive:true});

function assertRuntimeClean(){
  assert.deepEqual(report.consoleErrors,[],'Math learner journey emitted console errors');
  assert.deepEqual(report.pageErrors,[],'Math learner journey emitted page errors');
  assert.deepEqual(report.failedRequests,[],'Math learner journey emitted failed requests');
  assert.deepEqual(report.httpErrors,[],'Math learner journey emitted HTTP errors');
}

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await context.newPage();
  page.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text())});
  page.on('pageerror',e=>report.pageErrors.push(String(e?.stack||e)));
  page.on('requestfailed',r=>report.failedRequests.push(`${r.method()} ${r.url()} ${r.failure()?.errorText||''}`));
  page.on('response',r=>{if(r.status()>=400)report.httpErrors.push(`${r.status()} ${r.url()}`)});

  await page.addInitScript(key=>localStorage.removeItem(key),STATE_KEY);
  const url=`${BASE}subjects/math/index.html?host=main&hostOrigin=${encodeURIComponent(new URL(BASE).origin)}&subjectId=math&taskId=learner-journey-e2e&stage=prepare`;
  await page.goto(url,{waitUntil:'load',timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_MATH_NAVIGATION&&window.BAUMAN_MATH_LEARNING_FLOW&&window.BAUMAN_MATH_DASHBOARD_V2&&window.BAUMAN_MATH_E186_LESSON_FIRST,null,{timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_MATH_E129_CONTENT_SOURCE_READY||window.BAUMAN_MATH_THEORY_E129?.sourceStatus?.().content>=3,null,{timeout:30000});

  // Journey 1: a learner sees one canonical five-item navigation and can enter Roadmap.
  const nav=await page.locator('#mathUnifiedNav [data-math-nav]').evaluateAll(nodes=>nodes.map(n=>n.textContent.replace(/\s+/g,' ').trim()));
  assert.equal(nav.length,5,'Primary learner navigation must contain exactly five items');
  for(const label of ['Tổng quan','Lộ trình','Học','Luyện tập','Ôn tập'])assert.ok(nav.some(x=>x.includes(label)),`Missing primary nav: ${label}`);
  await page.evaluate(()=>window.BAUMAN_MATH_NAVIGATION.route('roadmap'));
  await page.waitForSelector('.math-roadmap-shell',{timeout:10000});
  report.checks.firstVisitRoadmap=true;

  // Journey 2: open a real source-backed lesson through the accepted E186 route.
  await page.evaluate(()=>window.BAUMAN_MATH_E186_LESSON_FIRST.open('lesson'));
  const lessonChoice=page.locator(`[data-e186-pick="lesson"][data-e186-id="${LESSON}"]`);
  await lessonChoice.waitFor({state:'visible',timeout:10000});
  await lessonChoice.click();
  await page.waitForSelector(`[data-current-lesson="${LESSON}"]`,{timeout:10000});
  await page.waitForFunction(id=>window.BAUMAN_MATH_LEARNING_FLOW.selfCheck().lessonId===id,LESSON,{timeout:10000});
  report.checks.lessonOpen=true;

  await page.waitForFunction(()=>window.BAUMAN_MATH_LEARNING_FLOW?.selfCheck?.().assessmentLoaded===true,null,{timeout:10000});
  await page.waitForFunction(id=>window.BAUMAN_MATH_LEARNING_FLOW?.checkSummary?.(id)?.total>0,LESSON,{timeout:10000});

  // Journey 3 + 4: visit all source-backed steps, complete Lesson Check with one review item,
  // persist completion only after the gate becomes eligible.
  const steps=await page.evaluate(()=>window.BAUMAN_MATH_LEARNING_FLOW.selfCheck().sourceDrivenSteps);
  assert.ok(steps.length>=5,'Lesson Player exposed too few source-backed steps');
  for(const step of steps)await page.evaluate(id=>window.BAUMAN_MATH_LEARNING_FLOW.activate(id),step);
  await page.evaluate(()=>window.BAUMAN_MATH_LEARNING_FLOW.openLessonCheck());
  await page.waitForSelector('.math-lf-check-item',{timeout:10000});
  const checkCount=await page.locator('.math-lf-check-item').count();
  assert.ok(checkCount>=1,'Lesson Check has no source-backed item');

  const items=page.locator('.math-lf-check-item');
  await items.nth(0).locator('[data-lf-check-state="review"]').click();
  for(let i=1;i<checkCount;i++)await items.nth(i).locator('[data-lf-check-state="understood"]').click();

  const eligible=await page.evaluate(id=>window.BAUMAN_MATH_LEARNING_FLOW.completionState(id),LESSON);
  assert.equal(eligible.eligible,true,'Lesson completion gate did not become eligible after steps + check');
  assert.equal(eligible.check.review,1,'Expected exactly one evidence-backed review item');
  assert.equal(await page.evaluate(()=>window.BAUMAN_MATH_LEARNING_FLOW.completeLesson()),true,'Lesson did not persist completion');
  const completed=await page.evaluate(id=>window.BAUMAN_MATH_LEARNING_FLOW.lessonSnapshot(id),LESSON);
  assert.ok(completed.completedAt>0,'Completion timestamp was not persisted');
  report.checks.lessonCompletion=true;

  // Journey 5: weak evidence produces a real review queue and Review route.
  const review=await page.evaluate(()=>window.BAUMAN_MATH_LEARNING_FLOW.reviewQueue(LESSON));
  assert.equal(review.length,1,'Review queue does not reflect Lesson Check evidence');
  assert.ok(review[0].reviewStepId,'Review item lacks a recovery step');
  await page.evaluate(()=>window.BAUMAN_MATH_NAVIGATION.route('review'));
  await page.waitForFunction(()=>document.body.dataset.mathPrimaryRoute==='review',null,{timeout:10000});
  await page.waitForSelector('#mathActivityStudio',{timeout:10000});
  report.checks.reviewRecovery=true;

  // Journey 2 resumed: a reload must preserve the canonical lesson pointer + completion.
  await page.reload({waitUntil:'load',timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_MATH_NAVIGATION&&window.BAUMAN_MATH_LEARNING_FLOW,null,{timeout:30000});
  const pointer=await page.evaluate(()=>window.BAUMAN_MATH_LEARNING_FLOW.resumePointer());
  assert.equal(pointer?.lessonId,LESSON,'Reload lost canonical resume lesson');
  await page.evaluate(()=>window.BAUMAN_MATH_NAVIGATION.route('learn'));
  await page.waitForSelector(`[data-current-lesson="${LESSON}"]`,{timeout:10000});
  const resumed=await page.evaluate(()=>window.BAUMAN_MATH_LEARNING_FLOW.resumeSnapshot());
  assert.equal(resumed.lessonId,LESSON);
  assert.ok(resumed.completedAt>0,'Reload lost lesson completion');
  report.checks.resume=true;

  // Journey 6: offline status must be explicit and learner progress remains locally readable.
  await context.setOffline(true);
  await page.waitForFunction(()=>document.body.dataset.mathNetwork==='offline',null,{timeout:5000});
  assert.match(await page.locator('#saveState').textContent(),/Offline/i);
  const offlineSnapshot=await page.evaluate(()=>window.BAUMAN_MATH_LEARNING_FLOW.resumeSnapshot());
  assert.equal(offlineSnapshot.lessonId,LESSON,'Offline mode lost locally persisted learner state');
  await context.setOffline(false);
  report.checks.offline=true;

  await page.setViewportSize({width:390,height:844});
  const overflow=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(overflow.scroll<=overflow.client+2,`Mobile learner shell overflows horizontally: ${overflow.scroll}/${overflow.client}`);
  await page.screenshot({path:path.join(OUT,'math-learning-journey-mobile.png'),fullPage:true});
  report.checks.mobile=overflow;

  assertRuntimeClean();
  report.status='PASS';
  report.completedAt=new Date().toISOString();
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(report,null,2));
  await context.close();
}catch(error){
  report.status='FAIL';report.error=String(error?.stack||error);report.completedAt=new Date().toISOString();
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(report,null,2));
  throw error;
}finally{await browser?.close()}
