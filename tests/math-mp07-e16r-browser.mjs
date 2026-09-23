import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/math-mp07-e16r';
const T02='MATH-VN-C05-thong_ke_mo_ta_va_du_lie-E16R-MP07-T02-centering-scaling';
const T03='MATH-VN-C04-xac_suat_co_ban_va_bien_-E16R-MP07-T03-covariance';
const T04='MATH-VN-C05-thong_ke_mo_ta_va_du_lie-E16R-MP07-T04-pearson';
const T05='MATH-VN-C05-thong_ke_mo_ta_va_du_lie-E16R-MP07-T05-covariance-matrix';
const PCA='MATH-VN-C02-ma_tran_va_phep_bien_oi_-L06-matrix-to-pca-linear-model-e143';
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

  const url=`${BASE}subjects/math/index.html?host=main&hostOrigin=${encodeURIComponent(new URL(BASE).origin)}&subjectId=math&taskId=mp07-e16r-browser&stage=prepare`;
  await page.goto(url,{waitUntil:'load',timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_MATH_THEORY_E129&&window.BAUMAN_MATH_ACTIVITY_STUDIO&&window.BAUMAN_MATH_FORMULA_LIBRARY,null,{timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_MATH_THEORY_E129?.sourceStatus?.().content>=22,null,{timeout:30000});

  const theory=await page.evaluate(async ids=>{
    const raw=window.BAUMAN_MATH_E240_THEORY_CONTENT_SOURCE?.getPayload?.()||await fetch('data/theory_lecture_content.json',{cache:'no-store'}).then(r=>r.json());
    const rows=raw?.records||[];
    return Object.fromEntries(ids.map(id=>{const r=rows.find(x=>x.lessonId===id);return[id,r?{slides:r.slides?.length||0,chapterId:r.chapterId,title:r.lessonTitle||r.title}:null]}));
  },[T02,T03,T04,T05,PCA]);
  for(const id of [T02,T03,T04,T05])assert.equal(theory[id]?.slides,10,`m_p07 theory core missing/incorrect: ${id}`);
  assert.equal(theory[PCA]?.slides,22,'PCA anchor must remain 22 slides after E16R upgrade');
  report.checks.theory=theory;

  async function activity(lessonId,activityId,minMatches){
    await page.evaluate(({lessonId,activityId})=>{
      const st=window.__BAUMAN_CORE_API?.state||window.__MATH_STATE||{};
      st.view='learning';st.learnTab=activityId;st.e129LessonId=lessonId;
      st.e186Path={...(st.e186Path||{}),lessonId,activityId};
      st.e169Path={...(st.e169Path||{}),lessonId,activityId};
      window.BAUMAN_MATH_ACTIVITY_STUDIO.render();
    },{lessonId,activityId});
    await page.waitForFunction(({lessonId,activityId,minMatches})=>{
      const s=window.BAUMAN_MATH_ACTIVITY_STUDIO?.selfCheck?.();
      return s?.lessonId===lessonId&&s?.activity===activityId&&s?.companionMatches>=minMatches;
    },{lessonId,activityId,minMatches},{timeout:10000});
    return page.evaluate(()=>window.BAUMAN_MATH_ACTIVITY_STUDIO.selfCheck());
  }

  report.checks.exercises=await activity(T02,'exercises',14);
  report.checks.practice=await activity(T02,'practice',2);
  report.checks.application=await activity(T02,'application',2);
  report.checks.review=await activity(T02,'review',1);
  report.checks.exam=await activity(T02,'exam',7);

  await page.evaluate(()=>window.BAUMAN_MATH_FORMULA_LIBRARY.open());
  await page.waitForFunction(()=>window.BAUMAN_MATH_FORMULA_LIBRARY?.selfCheck?.().loaded&&window.BAUMAN_MATH_FORMULA_LIBRARY?.selfCheck?.().canonicalMerge===true,null,{timeout:10000});
  const formulaSelf=await page.evaluate(()=>window.BAUMAN_MATH_FORMULA_LIBRARY.selfCheck());
  assert.match(formulaSelf.sourceSummary,/24 canonical/,'Formula Library did not load the 24 canonical m_p07 formulas');
  const search=page.locator('#mathFlSearch');
  await search.fill('Sample covariance');
  await page.waitForTimeout(100);
  assert.ok(await page.locator('#mathFlList .math-fl-item').count()>0,'Canonical covariance formula is not searchable in Formula Library');
  report.checks.formulaLibrary=formulaSelf;
  await page.evaluate(()=>window.BAUMAN_MATH_FORMULA_LIBRARY.close());

  assert.deepEqual(report.pageErrors,[],'m_p07 browser emitted page errors');
  assert.deepEqual(report.failedRequests,[],'m_p07 browser emitted failed requests');
  assert.deepEqual(report.httpErrors,[],'m_p07 browser emitted HTTP errors');
  // Existing app code may emit intentionally handled console errors from unrelated optional services.
  // Keep them as evidence, but the m_p07 acceptance authority is request/page/runtime assertions above.

  await page.screenshot({path:path.join(OUT,'math-mp07-e16r.png'),fullPage:true});
  report.status='PASS';report.completedAt=new Date().toISOString();
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(report,null,2));
  await context.close();
}catch(error){
  report.status='FAIL';report.error=String(error?.stack||error);report.completedAt=new Date().toISOString();
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(report,null,2));
  throw error;
}finally{await browser?.close()}
