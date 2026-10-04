import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/math-e170-activity-router';
const CHAPTER1='MATH-VN-C01-vector_trong_khong_gian_';
fs.mkdirSync(OUT,{recursive:true});

const routes=[
  ['exercises','exercise_content'],
  ['practice','simulation_content'],
  ['application','application_content'],
  ['review','review_pack_content'],
  ['exam','question_bank_content']
];

function countRecords(raw,chapterId){
  const rows=Array.isArray(raw)?raw:(Array.isArray(raw?.records)?raw.records:(Array.isArray(raw?.items)?raw.items:(Array.isArray(raw?.data?.records)?raw.data.records:[])));
  return rows.filter(x=>String(x?.chapterId||'')===chapterId).length;
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

  await page.goto(BASE+'subjects/math/index.html?host=main&hostOrigin='+encodeURIComponent(new URL(BASE).origin)+'&subjectId=math&taskId=e170-revalidation&stage=prepare',{waitUntil:'load',timeout:30000});
  await page.waitForFunction(()=>!!window.BAUMAN_MATH_THEORY_E129,null,{timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_MATH_THEORY_E129.sourceStatus().frame>0,null,{timeout:30000});
  await page.waitForFunction(()=>['exercise_content','simulation_content','application_content','review_pack_content','question_bank_content'].every(k=>window.DB?.[k]),null,{timeout:30000});

  await page.evaluate(()=>{
    window.__MATH_STATE=window.__MATH_STATE||{};
    const st=window.__MATH_STATE;
    st.view='learning';st.learnTab='theory';st.stage='vn';delete st.e169Path;
    window.BAUMAN_MATH_THEORY_E129.render();
  });
  await page.waitForSelector('[data-e169-open="chapter"]',{timeout:10000});

  // Re-select C01 so lessonId is cleared and E170 must use exact chapter filtering.
  await page.locator('[data-e169-open="chapter"]').click();
  await page.locator('[data-e169-pick-chapter="c01"]').click();

  const observed={};
  for(const [activity,source] of routes){
    if(!await page.locator('[data-e169-pick-activity="'+activity+'"]').count()){
      await page.locator('[data-e169-open="activity"]').click();
    }
    await page.locator('[data-e169-pick-activity="'+activity+'"]').click();
    const shell=page.locator('.e169-activity-shell[data-e170-activity="'+activity+'"]');
    await shell.waitFor({state:'visible',timeout:10000});
    const snapshot=await page.evaluate(({activity,source,chapterId})=>{
      const shell=document.querySelector('.e169-activity-shell[data-e170-activity="'+activity+'"]');
      const raw=window.DB?.[source];
      const rows=Array.isArray(raw)?raw:(Array.isArray(raw?.records)?raw.records:(Array.isArray(raw?.items)?raw.items:(Array.isArray(raw?.data?.records)?raw.data.records:[])));
      return {
        text:shell?.textContent||'',
        cards:shell?.querySelectorAll('.e169-placeholder-grid article').length||0,
        expected:rows.filter(x=>String(x?.chapterId||'')===chapterId).length
      };
    },{activity,source,chapterId:CHAPTER1});
    assert.ok(snapshot.expected>0,source+' has no C01 fixture records');
    assert.match(snapshot.text,new RegExp(source),'Activity shell does not identify '+source);
    assert.match(snapshot.text,new RegExp(snapshot.expected+' record'),'Rendered count does not match C01 '+source);
    assert.ok(snapshot.cards>0,activity+' rendered no cards');
    assert.ok(!snapshot.text.includes('Chưa có dữ liệu khớp'),activity+' incorrectly rendered empty state for C01');
    observed[activity]={source,expected:snapshot.expected,cards:snapshot.cards};
    await page.locator('[data-e169-open="activity"]').click();
  }

  // C03 intentionally has no E170 activity records. It must not borrow C01/C02 data.
  await page.keyboard.press('Escape');
  await page.locator('[data-e169-open="chapter"]').click();
  await page.locator('[data-e169-pick-chapter="c03"]').click();
  await page.locator('[data-e169-pick-activity="application"]').click();
  const emptyShell=page.locator('.e169-activity-shell[data-e170-activity="application"]');
  await emptyShell.waitFor({state:'visible',timeout:10000});
  const emptyText=await emptyShell.textContent();
  assert.match(emptyText,/0 record/,'C03 empty route must report zero records');
  assert.match(emptyText,/Chưa có dữ liệu khớp/,'C03 empty route must show truthful empty state');
  assert.ok(!emptyText.includes('Đóng gói telemetry robot thành ma trận dữ liệu'),'C03 borrowed C01 application data');

  // Return to C01 theory and prove E129 Reader remains owned by theory.
  await page.locator('[data-e169-open="chapter"]').click();
  await page.locator('[data-e169-pick-chapter="c01"]').click();
  const theoryChoice=page.locator('[data-e169-pick-activity="theory"]').first();
  await theoryChoice.click();
  await page.waitForSelector('.e129-theory-shell:not(.e169-activity-shell)',{timeout:10000});
  assert.ok(await page.locator('[data-current-lesson]').count()>0,'E129 Reader lost current lesson after E170 routing');

  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(150);
  const geom=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(geom.scroll<=geom.client+2,'E170 hierarchy/activity UI overflows on mobile');

  assert.deepEqual(errors,[],'E170 revalidation emitted console/page errors');
  assert.deepEqual(failed,[],'E170 revalidation emitted failed requests');
  await page.screenshot({path:path.join(OUT,'math-e170-mobile.png'),fullPage:true});
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',chapter:CHAPTER1,observed,emptyChapter:'c03',geom},null,2));
  console.log('MATH_E170_ACTIVITY_ROUTER_BROWSER_PASS');
}finally{await browser?.close()}
