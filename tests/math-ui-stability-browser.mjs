// Blueprint OS: measured stability of Math navigation / overview / active lesson.
// Source and packaged browser evidence must be kept separate from human UX acceptance.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/math-ui-stability';
const LESSON='MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140';
const evidence={status:'RUNNING',schema:'MATH_UI_STABILITY_BROWSER_V1',checks:{},issues:[]};
fs.mkdirSync(OUT,{recursive:true});
let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push(String(error?.stack||error)));
  const origin=new URL(BASE).origin;
  await page.goto(new URL('subjects/math/index.html?host=main&hostOrigin='+encodeURIComponent(origin)+'&subjectId=math&taskId=ux-stability&stage=prepare',BASE).href,{waitUntil:'load',timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_MATH_NAVIGATION?.refresh&&window.BAUMAN_MATH_DASHBOARD_V2?.refresh&&window.BAUMAN_MATH_LEARNING_FLOW?.refresh&&window.BAUMAN_MATH_E186_LESSON_FIRST,null,{timeout:30000});
  await page.waitForSelector('#mathUnifiedNav [data-math-nav="overview"]',{timeout:10000});
  const nav=await page.evaluate(async()=>{
    const node=document.querySelector('#mathUnifiedNav [data-math-nav="overview"]');
    const selected=document.querySelector('#mathUnifiedNav [data-math-nav="learn"]');
    window.BAUMAN_MATH_NAVIGATION.refresh();
    await new Promise(r=>setTimeout(r,280));
    window.BAUMAN_MATH_NAVIGATION.refresh();
    return {same:node===document.querySelector('#mathUnifiedNav [data-math-nav="overview"]'),learnSame:selected===document.querySelector('#mathUnifiedNav [data-math-nav="learn"]'),count:document.querySelectorAll('#mathUnifiedNav [data-math-nav]').length};
  });
  assert.deepEqual(nav,{same:true,learnSame:true,count:5},'Repeated navigation refresh must retain canonical buttons');
  evidence.checks.stableNavigation=nav;

  const dashboard=await page.evaluate(async()=>{
    const review=document.querySelector('#mathHomeReviewState');
    if(!review)return {missing:true};
    let mutations=0;const observer=new MutationObserver(records=>mutations+=records.filter(x=>x.type==='childList').length);
    observer.observe(review,{childList:true,subtree:true});
    window.BAUMAN_MATH_DASHBOARD_V2.refresh();window.BAUMAN_MATH_DASHBOARD_V2.refresh();
    await new Promise(r=>setTimeout(r,220));observer.disconnect();
    return{mutations};
  });
  assert.equal(dashboard.missing,undefined,'Overview evidence panel missing');
  assert.equal(dashboard.mutations,0,'Idle dashboard must not remount review controls');
  evidence.checks.overviewIdempotence=dashboard;

  await page.evaluate(()=>window.BAUMAN_MATH_E186_LESSON_FIRST.open('lesson'));
  const lesson=page.locator('[data-e186-pick="lesson"][data-e186-id="'+LESSON+'"]');
  await lesson.waitFor({state:'visible',timeout:15000});
  await lesson.click();
  await page.waitForSelector('[data-current-lesson="'+LESSON+'"]',{timeout:15000});
  await page.waitForSelector('#mathLearningFlow .math-lf-shell',{timeout:15000});
  const lessonStability=await page.evaluate(async()=>{
    const host=document.querySelector('#mathLearningFlow'),bar=document.querySelector('#mathLearningStudybar');
    const old=host.querySelector('.math-lf-shell'),oldBar=bar.firstElementChild;
    window.BAUMAN_MATH_LEARNING_FLOW.refresh();window.BAUMAN_MATH_LEARNING_FLOW.refresh();
    return{sameShell:old===host.querySelector('.math-lf-shell'),sameBar:oldBar===bar.firstElementChild};
  });
  assert.deepEqual(lessonStability,{sameShell:true,sameBar:true},'Repeated lesson refresh must not remount study controls');
  evidence.checks.lessonIdempotence=lessonStability;

  const focused=await page.evaluate(()=>{
    const text=document.querySelector('#mathLfNote');
    if(!text)return{missing:true};
    text.focus({preventScroll:true});text.value='Заметка об учебном шаге';
    text.dispatchEvent(new Event('input',{bubbles:true}));
    text.setSelectionRange(10,10);
    window.BAUMAN_MATH_LEARNING_FLOW.refresh();
    const next=document.querySelector('#mathLfNote');
    return{active:next===document.activeElement,value:next?.value,caret:next?.selectionStart};
  });
  assert.equal(focused.missing,undefined,'Math lesson note input missing');
  assert.equal(focused.active,true,'Learning note lost focus');
  assert.equal(focused.caret,10,'Learning note lost caret');
  assert.equal(focused.value,'Заметка об учебном шаге','Learner note changed during refresh');
  evidence.checks.noteCaret=focused;

  await page.setViewportSize({width:390,height:844});
  const mobile=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(mobile.scroll<=mobile.viewport+2,'Math mobile shell horizontal overflow');
  evidence.checks.mobile=mobile;
  assert.deepEqual(errors,[],'Uncaught Math browser errors');
  await page.screenshot({path:path.join(OUT,'math-stability-mobile.png'),fullPage:true});
  evidence.status='PASS';
  console.log('MATH_UI_STABILITY_BROWSER_PASS');
}catch(e){evidence.status='FAIL';evidence.issues.push(String(e?.stack||e));process.exitCode=1;console.error('MATH_UI_STABILITY_BROWSER_FAIL',e?.stack||e)}
finally{fs.writeFileSync(path.join(OUT,'evidence.json'),JSON.stringify(evidence,null,2));await browser?.close()}
