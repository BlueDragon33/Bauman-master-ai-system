import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/math-study-command-center';
const LESSON='MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140';
const STATE_KEY='bauman_math_learning_flow_v1';
const NOTES_KEY='bauman_math_activity_notes_v1';
const SESSION_KEY='bauman_math_activity_session_v1';
const report={status:'RUNNING',lessonId:LESSON,consoleErrors:[],pageErrors:[],failedRequests:[],httpErrors:[],checks:{}};
fs.mkdirSync(OUT,{recursive:true});

function assertNoRuntimeErrors(){
  assert.deepEqual(report.consoleErrors,[],'Study Command Center emitted console errors');
  assert.deepEqual(report.pageErrors,[],'Study Command Center emitted page errors');
  assert.deepEqual(report.failedRequests,[],'Study Command Center emitted failed requests');
  assert.deepEqual(report.httpErrors,[],'Study Command Center emitted HTTP errors');
}

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await context.newPage();
  page.on('console',message=>{if(message.type()==='error')report.consoleErrors.push(message.text())});
  page.on('pageerror',error=>report.pageErrors.push(String(error?.stack||error)));
  page.on('requestfailed',request=>report.failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText||''}`));
  page.on('response',response=>{if(response.status()>=400)report.httpErrors.push(`${response.status()} ${response.url()}`)});

  const url=`${BASE}subjects/math/index.html?host=main&hostOrigin=${encodeURIComponent(new URL(BASE).origin)}&subjectId=math&taskId=study-command-center-e2e&stage=prepare`;
  await page.goto(url,{waitUntil:'load',timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_MATH_STUDY_COMMAND_CENTER&&window.BAUMAN_MATH_ACTIVITY_STUDIO&&window.BAUMAN_MATH_ACTIVITY_MASTERY&&window.BAUMAN_MATH_FORMULA_LIBRARY&&window.BAUMAN_MATH_SIMULATION_SOURCE&&window.BAUMAN_MATH_PROFESSOR_DRILL&&window.BAUMAN_MATH_REGRESSION_GATE&&window.BAUMAN_MATH_RUNTIME_HEALTH&&window.BAUMAN_MATH_E186_LESSON_FIRST,null,{timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_MATH_THEORY_E129?.sourceStatus?.().content>=3,null,{timeout:30000});

  const canonical=await page.evaluate(async lessonId=>{
    const payload=window.BAUMAN_MATH_E240_THEORY_CONTENT_SOURCE.getPayload()||await fetch('data/theory_lecture_content.json',{cache:'no-store'}).then(r=>r.json());
    const record=payload?.records?.find(row=>row?.lessonId===lessonId);
    return record?{lessonId:record.lessonId,chapterId:record.chapterId,slides:record.slides?.length||0}:null;
  },LESSON);
  assert.ok(canonical&&canonical.lessonId===LESSON,'L05 canonical lesson could not be found');
  assert.equal(canonical.slides,22,'L05 durable slide count drift');

  // Drive the same E186 Lesson First route a real user uses.
  await page.evaluate(()=>window.BAUMAN_MATH_E186_LESSON_FIRST.open('lesson'));
  const lessonChoice=page.locator(`[data-e186-pick="lesson"][data-e186-id="${LESSON}"]`);
  await lessonChoice.waitFor({state:'visible',timeout:10000});
  await lessonChoice.click();
  await page.waitForSelector(`[data-current-lesson="${LESSON}"]`,{timeout:10000});
  await page.waitForFunction(id=>window.BAUMAN_MATH_LEARNING_FLOW?.selfCheck?.().lessonId===id,LESSON,{timeout:10000});

  await page.waitForFunction(()=>window.BAUMAN_MATH_LEARNING_FLOW?.selfCheck?.().assessmentLoaded===true,null,{timeout:10000});
  await page.waitForFunction(id=>window.BAUMAN_MATH_LEARNING_FLOW?.checkSummary?.(id)?.total>0,LESSON,{timeout:10000});

  // Seed the canonical learner-state store using real Lesson Check IDs.
  // This test validates Command Center projection; UI interaction is covered by math-learning-journey-browser.mjs.
  const sourceCheck=await page.evaluate(id=>window.BAUMAN_MATH_LEARNING_FLOW.checkSummary(id),LESSON);
  assert.ok(sourceCheck.total>=1,'L05 has no source-backed Lesson Check items');
  const checkCount=sourceCheck.total;
  await page.evaluate(({lessonId,stateKey,items})=>{
    const all=JSON.parse(localStorage.getItem(stateKey)||'{}');
    const now=Date.now();
    const check={};items.forEach((item,index)=>{check[item.id]=index===0?'review':'understood'});
    all[lessonId]={...(all[lessonId]||{}),active:'selfcheck',visited:{...((all[lessonId]||{}).visited||{}),selfcheck:true},check,lastAt:now};
    all._meta={...(all._meta||{}),schemaVersion:2,currentLessonId:lessonId,currentStepId:'selfcheck',lastActivityAt:now};
    localStorage.setItem(stateKey,JSON.stringify(all));
    window.BAUMAN_MATH_LEARNING_FLOW.refresh();
  },{lessonId:LESSON,stateKey:STATE_KEY,items:sourceCheck.items});
  const checkState=await page.evaluate(id=>window.BAUMAN_MATH_LEARNING_FLOW.checkSummary(id),LESSON);
  assert.equal(checkState.review,1,'Canonical fixture did not create exactly one review item');

  await page.evaluate(()=>window.BAUMAN_MATH_NAVIGATION.route('review'));
  await page.waitForFunction(()=>document.body.dataset.mathPrimaryRoute==='review',null,{timeout:10000});
  await page.waitForSelector('#mathActivityStudio .math-activity-card',{timeout:10000});
  report.checks.e186LessonFirstRoute=true;

  await page.evaluate(({notesKey,sessionKey})=>{
    localStorage.removeItem(notesKey);localStorage.removeItem(sessionKey);
    window.BAUMAN_MATH_ACTIVITY_MASTERY.refresh();
    window.BAUMAN_MATH_STUDY_COMMAND_CENTER.refresh();
  },{notesKey:NOTES_KEY,sessionKey:SESSION_KEY});

  await page.waitForSelector('#mathStudyCommandCenter',{timeout:10000});
  await page.waitForFunction(()=>window.BAUMAN_MATH_STUDY_COMMAND_CENTER.selfCheck().reviewQueue===1);
  const initial=await page.evaluate(()=>({summary:window.BAUMAN_MATH_STUDY_COMMAND_CENTER.summarize(),review:window.BAUMAN_MATH_STUDY_COMMAND_CENTER.reviewItems(),self:window.BAUMAN_MATH_STUDY_COMMAND_CENTER.selfCheck()}));
  assert.equal(initial.summary.total,checkCount);
  assert.equal(initial.summary.review,1);
  assert.equal(initial.summary.learning,checkCount-1);
  assert.equal(initial.summary.mastered,0);
  assert.equal(initial.summary.pct,0);
  assert.equal(initial.review.length,1);
  assert.equal(initial.review[0].lessonId,LESSON);
  assert.equal(initial.self.canonicalSource,'BAUMAN_MATH_LEARNING_FLOW.checkSummary');
  assert.equal(initial.self.legacyMasteryStore,false);
  assert.equal(initial.self.localOnly,true);
  assert.equal(initial.self.academicWrites,false);
  assert.equal(initial.self.gradingAuthority,false);
  assert.equal(initial.self.generatedQuestions,false);
  assert.equal(initial.self.correctnessInference,false);
  report.checks.dashboardCanonicalState=true;

  await page.waitForSelector('#mathActivityStudio .math-activity-card .math-workbench',{timeout:10000});
  const card=page.locator('#mathActivityStudio .math-activity-card').first();
  const realKey=await card.getAttribute('data-scc-key');
  assert.ok(realKey,'Activity Studio card lacks local workbench identity');

  const note='E2E local note · không phải nội dung học thuật';
  const noteArea=card.locator('[data-scc-note]');
  await noteArea.fill(note);
  await page.waitForTimeout(320);
  assert.equal(await page.evaluate(({key,store})=>JSON.parse(localStorage.getItem(store)||'{}')?.[key]?.text,{key:realKey,store:NOTES_KEY}),note);
  // Mastery and note events can legitimately refresh the Activity Studio DOM. Re-decorate and
  // reacquire the live session button instead of holding a stale workbench locator for 30 seconds.
  await page.evaluate(()=>window.BAUMAN_MATH_STUDY_COMMAND_CENTER.refresh());
  const liveSessionButton=page.locator('#mathActivityStudio .math-activity-card [data-scc="session-start"]').first();
  await liveSessionButton.waitFor({state:'visible',timeout:15000});
  await liveSessionButton.click();
  await page.waitForFunction(({key,store})=>JSON.parse(localStorage.getItem(store)||'null')?.key===key,{key:realKey,store:SESSION_KEY});
  const afterActivity=await page.evaluate(()=>window.BAUMAN_MATH_STUDY_COMMAND_CENTER.selfCheck());
  assert.ok(afterActivity.notes>=1,'Activity note state did not persist locally');
  assert.equal(afterActivity.historyEvents,0,'Retired mastery history must not be recreated');
  report.checks.activityWorkbench=true;

  await page.locator('#mathStudyCommandCenter [data-scc="formula"]').click();
  await page.waitForFunction(()=>document.getElementById('mathFormulaLibrary')?.classList.contains('open'));
  assert.ok((await page.locator('#mathFlList .math-fl-item').count())>0,'Formula deep link opened without formula records');
  await page.evaluate(()=>window.BAUMAN_MATH_FORMULA_LIBRARY.close());
  await page.waitForFunction(()=>!document.getElementById('mathFormulaLibrary')?.classList.contains('open'));
  report.checks.formulaDeepLink=true;

  await page.locator('#mathStudyCommandCenter [data-scc="simulation"]').click();
  await page.waitForFunction(()=>window.BAUMAN_MATH_LEARNING_FLOW?.snapshot?.().activeStep==='visualize',null,{timeout:10000});
  assert.ok(!await page.evaluate(()=>document.getElementById('mathWorkspaceLab')?.classList.contains('open')),'Context simulation incorrectly opened generic Math Lab');
  report.checks.simulationDeepLink='lesson-context';
  await page.evaluate(()=>window.BAUMAN_MATH_NAVIGATION.route('review'));
  await page.waitForSelector('#mathActivityStudio .math-activity-card',{timeout:10000});

  await page.locator('#mathStudyCommandCenter [data-scc="professor"]').click();
  await page.waitForFunction(()=>document.getElementById('mathProfessorDrill')?.classList.contains('open'));
  const professor=await page.evaluate(()=>window.BAUMAN_MATH_PROFESSOR_DRILL.selfCheck());
  assert.ok(professor.items>0,'L05 Professor Drill opened without source-backed questions');
  assert.equal(professor.generatedQuestions,false);
  assert.equal(professor.gradingAuthority,false);
  await page.evaluate(()=>window.BAUMAN_MATH_PROFESSOR_DRILL.close());
  report.checks.professorDeepLink=true;

  const regression=await page.evaluate(()=>window.BAUMAN_MATH_REGRESSION_GATE.run());
  assert.equal(regression.summary.fail,0,'Regression Gate failed after Study Command Center interactions');
  const sccPolicy=regression.rows.find(row=>row.id==='scc-policy');
  assert.equal(sccPolicy?.state,'pass','Study Command Center policy gate did not PASS');
  const health=await page.evaluate(()=>window.BAUMAN_MATH_RUNTIME_HEALTH.check());
  assert.equal(health.summary.fail,0,'Runtime Health failed after Study Command Center interactions');
  report.checks.regression={summary:regression.summary,sccPolicy:sccPolicy?.state};
  report.checks.runtimeHealth=health.summary;

  for(const [label,width,height] of [['desktop',1440,900],['tablet',768,1024],['mobile',390,844]]){
    await page.setViewportSize({width,height});
    await page.evaluate(()=>window.BAUMAN_MATH_STUDY_COMMAND_CENTER.refresh());
    const size=await page.evaluate(()=>{const el=document.getElementById('mathStudyCommandCenter'),r=el?.getBoundingClientRect();return{client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,left:r?.left??null,right:r?.right??null,width:r?.width??null}});
    assert.ok(size.scroll<=size.client+2,`${label}: horizontal overflow ${size.scroll}/${size.client}`);
    assert.ok(size.left!=null&&size.left>=-1&&size.right<=size.client+1,`${label}: command center outside viewport`);
    report.checks[`responsive_${label}`]=size;
    await page.screenshot({path:path.join(OUT,`math-study-command-center-${label}.png`),fullPage:true});
  }

  assertNoRuntimeErrors();
  report.status='PASS';report.completedAt=new Date().toISOString();
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(report,null,2));
  await context.close();
}catch(error){
  report.status='FAIL';report.error=String(error?.stack||error);report.completedAt=new Date().toISOString();
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(report,null,2));
  throw error;
}finally{await browser?.close()}
