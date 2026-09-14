import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/math-study-command-center';
const LESSON='MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140';
const MASTERY_KEY='bauman_math_activity_mastery_v1';
const HISTORY_KEY='bauman_math_mastery_history_v1';
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
  assert.ok(canonical&&canonical.lessonId===LESSON,'L06 canonical lesson could not be found');
  assert.equal(canonical.slides,22,'L06 durable slide count drift');

  // Drive the same E186 Lesson First route a real user uses instead of mutating legacy E169 selectors.
  await page.evaluate(()=>window.BAUMAN_MATH_E186_LESSON_FIRST.open('lesson'));
  const lessonChoice=page.locator(`[data-e186-pick="lesson"][data-e186-id="${LESSON}"]`);
  await lessonChoice.waitFor({state:'visible',timeout:10000});
  await lessonChoice.click();
  const reviewChoice=page.locator('[data-e186-pick="activity"][data-e186-id="review"]');
  await reviewChoice.waitFor({state:'visible',timeout:10000});
  await reviewChoice.click();
  await page.waitForFunction(lessonId=>{
    const st=window.__BAUMAN_CORE_API?.state||window.__MATH_STATE||{};
    return st.e169Path?.lessonId===lessonId&&st.e169Path?.activityId==='review'&&st.learnTab==='review';
  },LESSON,{timeout:10000});
  await page.waitForSelector('#mathActivityStudio .math-activity-card',{timeout:10000});
  report.checks.e186LessonFirstRoute=true;

  await page.evaluate(({lessonId,masteryKey,historyKey,notesKey,sessionKey})=>{
    localStorage.removeItem(historyKey);localStorage.removeItem(notesKey);localStorage.removeItem(sessionKey);
    const now=Date.now();
    localStorage.setItem(masteryKey,JSON.stringify({
      [`${lessonId}::exercises::e2e-review`]:{state:'review',updatedAt:now-3000},
      [`${lessonId}::practice::e2e-mastered`]:{state:'mastered',updatedAt:now-2000},
      [`${lessonId}::application::e2e-learning`]:{state:'learning',updatedAt:now-1000}
    }));
    window.BAUMAN_MATH_ACTIVITY_MASTERY.refresh();
    window.BAUMAN_MATH_STUDY_COMMAND_CENTER.refresh();
  },{lessonId:LESSON,masteryKey:MASTERY_KEY,historyKey:HISTORY_KEY,notesKey:NOTES_KEY,sessionKey:SESSION_KEY});

  await page.waitForSelector('#mathStudyCommandCenter',{timeout:10000});
  await page.waitForFunction(()=>window.BAUMAN_MATH_STUDY_COMMAND_CENTER.selfCheck().masteryItems===3&&window.BAUMAN_MATH_STUDY_COMMAND_CENTER.selfCheck().reviewQueue===1);
  const initial=await page.evaluate(()=>({summary:window.BAUMAN_MATH_STUDY_COMMAND_CENTER.summarize(),review:window.BAUMAN_MATH_STUDY_COMMAND_CENTER.reviewItems(),self:window.BAUMAN_MATH_STUDY_COMMAND_CENTER.selfCheck()}));
  assert.equal(initial.summary.total,3);
  assert.equal(initial.summary.review,1);
  assert.equal(initial.summary.learning,1);
  assert.equal(initial.summary.mastered,1);
  assert.equal(initial.summary.pct,33);
  assert.equal(initial.review.length,1);
  assert.equal(initial.review[0].lessonId,LESSON);
  assert.equal(initial.self.localOnly,true);
  assert.equal(initial.self.academicWrites,false);
  assert.equal(initial.self.gradingAuthority,false);
  assert.equal(initial.self.generatedQuestions,false);
  assert.equal(initial.self.correctnessInference,false);
  report.checks.dashboardLocalState=true;

  await page.waitForSelector('#mathActivityStudio .math-activity-card .math-workbench',{timeout:10000});
  const card=page.locator('#mathActivityStudio .math-activity-card').first();
  const realKey=await card.getAttribute('data-math-mastery-key');
  assert.ok(realKey,'Activity Studio card lacks mastery identity');
  const reviewButton=card.locator('[data-am-state="review"]');
  await reviewButton.click();
  await page.waitForFunction(({key,store})=>JSON.parse(localStorage.getItem(store)||'{}')?.[key]?.state==='review',{key:realKey,store:MASTERY_KEY});
  await page.waitForFunction(()=>window.BAUMAN_MATH_STUDY_COMMAND_CENTER.selfCheck().historyEvents>=1);

  const note='E2E local note · không phải nội dung học thuật';
  const noteArea=card.locator('[data-scc-note]');
  await noteArea.fill(note);
  await page.waitForTimeout(320);
  assert.equal(await page.evaluate(({key,store})=>JSON.parse(localStorage.getItem(store)||'{}')?.[key]?.text,{key:realKey,store:NOTES_KEY}),note);
  await card.locator('[data-scc="session-start"]').click();
  await page.waitForFunction(({key,store})=>JSON.parse(localStorage.getItem(store)||'null')?.key===key,{key:realKey,store:SESSION_KEY});
  const afterActivity=await page.evaluate(()=>window.BAUMAN_MATH_STUDY_COMMAND_CENTER.selfCheck());
  assert.ok(afterActivity.historyEvents>=1&&afterActivity.notes>=1,'Activity history/note state did not persist locally');
  report.checks.activityWorkbench=true;

  await page.locator('#mathStudyCommandCenter [data-scc="formula"]').click();
  await page.waitForFunction(()=>document.getElementById('mathFormulaLibrary')?.classList.contains('open'));
  assert.ok((await page.locator('#mathFlList .math-fl-item').count())>0,'Formula deep link opened without formula records');
  await page.evaluate(()=>window.BAUMAN_MATH_FORMULA_LIBRARY.close());
  await page.waitForFunction(()=>!document.getElementById('mathFormulaLibrary')?.classList.contains('open'));
  report.checks.formulaDeepLink=true;

  await page.locator('#mathStudyCommandCenter [data-scc="simulation"]').click();
  await page.waitForFunction(()=>document.getElementById('mathWorkspaceLab')?.classList.contains('open'));
  assert.ok(await page.locator('#mathSimulationSource').count(),'Simulation deep link did not decorate canonical-source panel');
  await page.locator('#mathWorkspaceLab [data-math-ws="close-lab"]').click();
  await page.waitForFunction(()=>!document.getElementById('mathWorkspaceLab')?.classList.contains('open'));
  report.checks.simulationDeepLink=true;

  await page.locator('#mathStudyCommandCenter [data-scc="professor"]').click();
  await page.waitForFunction(()=>document.getElementById('mathProfessorDrill')?.classList.contains('open'));
  const professor=await page.evaluate(()=>window.BAUMAN_MATH_PROFESSOR_DRILL.selfCheck());
  assert.ok(professor.items>0,'L06 Professor Drill opened without source-backed questions');
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
