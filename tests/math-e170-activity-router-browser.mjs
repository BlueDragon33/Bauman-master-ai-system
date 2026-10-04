import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/math-e170-activity-router';
const C01_L06='MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140';
const C03_L01='MATH-VN-C03-giai_tich_dao_ham_gradient-L01-function-as-input-output-model-e145';
fs.mkdirSync(OUT,{recursive:true});

const routes=[
  ['exercises','exercise_content'],
  ['practice','simulation_content'],
  ['application','application_content'],
  ['review','review_pack_content'],
  ['exam','question_bank_content']
];

async function selectChapterLesson(page,chapterId,lessonId){
  await page.evaluate(()=>window.BAUMAN_MATH_E186_LESSON_FIRST.open('chapter'));
  await page.locator('[data-e186-pick="chapter"][data-e186-id="'+chapterId+'"]').click();
  const lesson=page.locator('[data-e186-pick="lesson"][data-e186-id="'+lessonId+'"]');
  await lesson.waitFor({state:'visible',timeout:10000});
  await lesson.click();
  await page.waitForFunction(id=>window.BAUMAN_MATH_E186_LESSON_FIRST.path().lessonId===id,lessonId,{timeout:10000});
}

async function selectActivity(page,activity){
  await page.evaluate(()=>window.BAUMAN_MATH_E186_LESSON_FIRST.open('activity'));
  const pick=page.locator('[data-e186-pick="activity"][data-e186-id="'+activity+'"]');
  await pick.waitFor({state:'visible',timeout:10000});
  await pick.click();
  await page.waitForSelector('.e169-activity-shell[data-e170-activity="'+activity+'"][data-e170-owner="math-activity-studio"]',{timeout:10000});
  await page.waitForFunction(a=>window.BAUMAN_MATH_ACTIVITY_STUDIO?.selfCheck?.().activity===a,activity,{timeout:10000});
}

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await context.newPage();
  const errors=[],failed=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  page.on('requestfailed',r=>{const t=r.failure()?.errorText||'';if(t!=='net::ERR_ABORTED')failed.push(r.url()+' '+t)});
  await page.addInitScript(()=>localStorage.clear());

  await page.goto(BASE+'subjects/math/index.html?host=main&hostOrigin='+encodeURIComponent(new URL(BASE).origin)+'&subjectId=math&taskId=e171-revalidation&stage=prepare',{waitUntil:'load',timeout:30000});
  await page.waitForFunction(()=>!!window.BAUMAN_MATH_THEORY_E129&&!!window.BAUMAN_MATH_E186_LESSON_FIRST&&!!window.BAUMAN_MATH_ACTIVITY_STUDIO,null,{timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_MATH_THEORY_E129.sourceStatus().frame>0,null,{timeout:30000});

  // Current owner is E186 Lesson First. It must sync the legacy E169 route consumed by E129/E170.
  await selectChapterLesson(page,'c01',C01_L06);
  const owner=await page.evaluate(()=>({
    flow:window.BAUMAN_MATH_E186_LESSON_FIRST.selfCheck().flow,
    e186:window.BAUMAN_MATH_E186_LESSON_FIRST.path(),
    e169:window.__MATH_STATE?.e169Path||null
  }));
  assert.equal(owner.flow,'module-course-chapter-lesson-activity');
  assert.equal(owner.e186.lessonId,C01_L06);
  assert.equal(owner.e169?.lessonId,C01_L06,'E186 did not sync legacy E169 lesson state');

  const observed={};
  for(const [activity,source] of routes){
    await selectActivity(page,activity);
    await page.waitForFunction(src=>[...document.querySelectorAll('#mathActivityStudio .math-activity-source')].some(x=>x.textContent.includes(src+'.json')),source,{timeout:10000});
    const snapshot=await page.evaluate(({activity,source})=>{
      const shell=document.querySelector('.e169-activity-shell[data-e170-activity="'+activity+'"]');
      const studio=document.querySelector('#mathActivityStudio');
      const row=[...studio.querySelectorAll('.math-activity-source')].find(x=>x.textContent.includes(source+'.json'));
      const match=Number((row?.textContent.match(/·\s*(\d+)\s+match/)||[])[1]||0);
      return {
        routeText:shell?.textContent||'',
        studioText:studio?.textContent||'',
        cards:studio?.querySelectorAll('.math-activity-card').length||0,
        match,
        self:window.BAUMAN_MATH_ACTIVITY_STUDIO.selfCheck(),
        e186:window.BAUMAN_MATH_E186_LESSON_FIRST.path(),
        e169:window.__MATH_STATE?.e169Path||null
      };
    },{activity,source});
    assert.ok(snapshot.match>0,source+' has no exact C01/L06 canonical match');
    assert.match(snapshot.routeText,new RegExp(source),'E170 route context does not identify '+source);
    assert.equal(snapshot.self.activity,activity,'Activity Studio state mismatch');
    assert.equal(snapshot.e186.activityId,activity,'E186 activity state mismatch');
    assert.equal(snapshot.e169?.activityId,activity,'E186 did not sync E169 activity state');
    assert.ok(snapshot.cards>0,activity+' rendered no canonical/fallback cards');
    observed[activity]={source,match:snapshot.match,cards:snapshot.cards};
  }

  // C03 has no companion activity records. It may use semantic theory fallback, but must never borrow C01 data.
  await selectChapterLesson(page,'c03',C03_L01);
  await selectActivity(page,'application');
  await page.waitForFunction(()=>[...document.querySelectorAll('#mathActivityStudio .math-activity-source')].some(x=>x.textContent.includes('application_content.json')),null,{timeout:10000});
  const empty=await page.evaluate(()=>{
    const studio=document.querySelector('#mathActivityStudio');
    const row=[...studio.querySelectorAll('.math-activity-source')].find(x=>x.textContent.includes('application_content.json'));
    return {
      text:studio?.textContent||'',
      source:row?.textContent||'',
      self:window.BAUMAN_MATH_ACTIVITY_STUDIO.selfCheck()
    };
  });
  assert.match(empty.source,/·\s*0\s+match/,'C03 application route must report zero canonical matches');
  assert.equal(empty.self.companionMatches,0,'C03 must not borrow canonical companion records from another chapter');
  assert.ok(!empty.text.includes('Đóng gói telemetry robot thành ma trận dữ liệu'),'C03 borrowed C01 application data');

  // Return to C01/L06 theory and prove E129 Reader remains the theory owner.
  await selectChapterLesson(page,'c01',C01_L06);
  await page.waitForSelector('.e129-theory-shell:not(.e169-activity-shell)',{timeout:10000});
  assert.ok(await page.locator('[data-current-lesson="'+C01_L06+'"]').count()>0,'E129 Reader lost C01/L06 after E170 routing');

  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(180);
  const geom=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(geom.scroll<=geom.client+2,'E170/E186 hierarchy activity UI overflows on mobile');

  assert.deepEqual(errors,[],'E171 revalidation emitted console/page errors');
  assert.deepEqual(failed,[],'E171 revalidation emitted failed requests');
  await page.screenshot({path:path.join(OUT,'math-e171-mobile.png'),fullPage:true});
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',lesson:C01_L06,owner:'E186 Lesson First',renderer:'Math Activity Studio',observed,zeroCompanionLesson:C03_L01,geom},null,2));
  console.log('MATH_E170_ACTIVITY_ROUTER_BROWSER_PASS');
}finally{await browser?.close()}
