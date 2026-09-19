import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const ROOT=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-handwriting-recognition';
fs.mkdirSync(OUT,{recursive:true});

function russianUrl(){
  const base=new URL(ROOT);
  if(base.pathname.includes('/subjects/russian/'))return base.href;
  return new URL('subjects/russian/',base).href;
}

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1280,height:800}});
  const page=await context.newPage();
  const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  await page.goto(russianUrl(),{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>!!window.RussianHandwritingRecognition?.getCapability,null,{timeout:15000});
  await page.locator('[data-view="writing"]').first().click();
  await page.waitForFunction(()=>!!document.querySelector('.writing-studio')&&!!document.querySelector('.ru-handwriting-capability')&&!!document.querySelector('.ru-handwriting-recognition'),null,{timeout:15000});
  await page.waitForTimeout(350);

  const initial=await page.evaluate(()=>({
    capability:window.RussianHandwritingRecognition.getCapability(),
    state:window.RussianHandwritingRecognition.getState(),
    bannerCount:document.querySelectorAll('.ru-handwriting-capability').length,
    drillCount:document.querySelectorAll('.ru-handwriting-recognition').length,
    choiceCount:document.querySelectorAll('[data-ru-handwriting-choice]').length,
    recognitionState:document.querySelector('.ru-handwriting-recognition')?.dataset.ruRecognitionState||'',
    flowSchema:window.RussianLearningFlow?.schema||'',
    learningSchema:window.RussianLearningState?.get?.()?.schema||''
  }));
  assert.equal(initial.bannerCount,1,'Handwriting capability banner duplicated');
  assert.equal(initial.drillCount,1,'Handwriting recognition drill duplicated');
  assert.equal(initial.flowSchema,'RUSSIAN_LEARNING_FLOW_V1');
  assert.equal(initial.learningSchema,'RUSSIAN_LEARNING_STATE_V1');
  assert.ok(['local-script-preview','reference-only'].includes(initial.capability.mode));
  assert.equal(initial.capability.canScore,false,'Blocked production glyph authority unexpectedly enabled scoring');
  assert.equal(initial.capability.authority?.status,'blocked');
  assert.equal(initial.capability.authority?.trusted,false);

  if(initial.capability.canScore){
    assert.equal(initial.recognitionState,'ready');
    assert.equal(initial.choiceCount,4,'Recognition drill must expose four Cyrillic visual choices');
    const beforeAttempts=Number(initial.state.attempts||0);
    await page.evaluate(()=>window.RussianHandwritingRecognition.answer('__definitely_wrong__'));
    await page.waitForFunction(before=>Number(window.RussianHandwritingRecognition.getState().attempts||0)===before+1,beforeAttempts);
    const scored=await page.evaluate(()=>({
      recognition:window.RussianHandwritingRecognition.getState(),
      learning:window.RussianLearningState.get(),
      flow:window.RussianLearningFlow.get()
    }));
    assert.equal(scored.recognition.lastCorrect,false);
    assert.ok(scored.learning.reviewQueue['handwriting:'+scored.recognition.lastLetterId],'Wrong recognition did not enter Review Queue');
    assert.equal(scored.learning.resume?.route?.view,'writing');
    const lessons=Object.values(scored.flow.lessons||{});
    const alphabetSteps=lessons.map(x=>x?.steps?.alphabet).filter(Boolean);
    assert.ok(alphabetSteps.some(x=>Number(x.recognitionAttempts||0)>=beforeAttempts+1),'Recognition evidence missing from learning flow');
    assert.ok(alphabetSteps.every(x=>Number(x.strokeActions||0)===0),'Recognition must not fabricate handwriting stroke evidence');
  }else{
    assert.equal(initial.recognitionState,'disabled');
    assert.equal(initial.choiceCount,0,'Fail-closed recognition must not expose scored choices');
    const before=JSON.stringify(initial.state);
    const result=await page.evaluate(()=>window.RussianHandwritingRecognition.answer('HW_AZ_01'));
    const after=await page.evaluate(()=>window.RussianHandwritingRecognition.getState());
    assert.equal(result,false);
    assert.equal(JSON.stringify(after),before,'Fail-closed answer attempt mutated recognition state');
  }

  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(180);
  const mobile=await page.evaluate(()=>{
    const cap=document.querySelector('.ru-handwriting-capability')?.getBoundingClientRect();
    const drill=document.querySelector('.ru-handwriting-recognition')?.getBoundingClientRect();
    return {innerWidth,cap:cap&&{left:cap.left,right:cap.right,width:cap.width},drill:drill&&{left:drill.left,right:drill.right,width:drill.width},bannerCount:document.querySelectorAll('.ru-handwriting-capability').length,drillCount:document.querySelectorAll('.ru-handwriting-recognition').length};
  });
  assert.equal(mobile.bannerCount,1);
  assert.equal(mobile.drillCount,1);
  for(const box of [mobile.cap,mobile.drill]){if(box){assert.ok(box.left>=-2,'Recognition UI overflows left on phone');assert.ok(box.right<=mobile.innerWidth+2,'Recognition UI overflows right on phone');}}
  assert.deepEqual(errors,[],'Russian handwriting browser emitted console/page errors');
  await page.screenshot({path:`${OUT}/russian-handwriting-recognition.png`,fullPage:true});

  const scoringContext=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});
  await scoringContext.route('**/assets/handwriting-glyph-authority.js',route=>route.fulfill({
    status:200,
    contentType:'application/javascript; charset=utf-8',
    body:"'use strict';window.RUSSIAN_HANDWRITING_GLYPH_AUTHORITY=Object.freeze({schema:'RUSSIAN_HANDWRITING_GLYPH_AUTHORITY_V1',status:'ready',source:'bundled-vetted',trustedFamilies:Object.freeze(['Segoe Script']),asset:'subjects/russian/assets/fonts/e2e-approved-cyrillic-handwriting.woff2',assetSha256:'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',license:'subjects/russian/assets/fonts/e2e-license.txt',licenseSha256:'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',coverageManifest:'subjects/russian/assets/fonts/e2e-coverage.json',coverageSha256:'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',verifiedAt:'2026-09-19T00:00:00.000Z',note:'Deterministic E2E authority fixture'});"
  }));
  await scoringContext.addInitScript(()=>{
    const original=CanvasRenderingContext2D.prototype.measureText;
    CanvasRenderingContext2D.prototype.measureText=function(text){
      const metrics=original.call(this,text);
      if(String(text)==='ДдЖжФфЯяШш'&&String(this.font).includes('Segoe Script'))return {width:Number(metrics.width||0)+37};
      return metrics;
    };
  });
  const scoringPage=await scoringContext.newPage();
  const scoringErrors=[];
  scoringPage.on('console',m=>{if(m.type()==='error')scoringErrors.push(m.text())});
  scoringPage.on('pageerror',e=>scoringErrors.push(String(e?.stack||e)));
  await scoringPage.goto(russianUrl(),{waitUntil:'domcontentloaded',timeout:30000});
  await scoringPage.waitForFunction(()=>window.RussianHandwritingRecognition?.getCapability?.().canScore===true,null,{timeout:15000});
  await scoringPage.locator('[data-view="writing"]').first().click();
  await scoringPage.waitForFunction(()=>document.querySelector('.ru-handwriting-recognition')?.dataset.ruRecognitionState==='ready'&&document.querySelectorAll('[data-ru-handwriting-choice]').length===4,null,{timeout:15000});

  const forcedCapability=await scoringPage.evaluate(()=>window.RussianHandwritingRecognition.getCapability());
  assert.equal(forcedCapability.mode,'approved-handwriting-authority');
  assert.equal(forcedCapability.font,'Segoe Script');
  assert.equal(forcedCapability.authority?.trusted,true);
  assert.equal(forcedCapability.authority?.source,'bundled-vetted');
  assert.equal(forcedCapability.authority?.asset,'subjects/russian/assets/fonts/e2e-approved-cyrillic-handwriting.woff2');
  assert.equal(forcedCapability.authority?.assetSha256?.length,64);
  assert.equal(forcedCapability.authority?.licenseSha256?.length,64);
  assert.equal(forcedCapability.authority?.coverageSha256?.length,64);

  await scoringPage.locator('[data-ru-handwriting-choice]').nth(1).click();
  await scoringPage.waitForFunction(()=>window.RussianHandwritingRecognition.getState().attempts===1&&window.RussianHandwritingRecognition.getState().lastCorrect===false);
  const missed=await scoringPage.evaluate(()=>({
    recognition:window.RussianHandwritingRecognition.getState(),
    learning:window.RussianLearningState.get()
  }));
  const reviewId='handwriting:'+missed.recognition.lastLetterId;
  assert.ok(missed.learning.reviewQueue[reviewId],'Forced scoring miss did not enter Review Queue');
  assert.equal(missed.learning.resume?.route?.view,'writing');
  assert.ok(Number.isInteger(Number(missed.learning.resume?.route?.handwritingIndex)),'Forced scoring miss did not preserve handwriting index');

  await scoringPage.reload({waitUntil:'domcontentloaded',timeout:30000});
  await scoringPage.waitForFunction(()=>window.RussianHandwritingRecognition?.getCapability?.().canScore===true&&window.RussianHandwritingRecognition?.getState?.().attempts===1,null,{timeout:15000});
  await scoringPage.locator('[data-view="writing"]').first().click();
  await scoringPage.waitForFunction(()=>document.querySelector('.ru-handwriting-recognition')?.dataset.ruRecognitionState==='ready'&&document.querySelectorAll('[data-ru-handwriting-choice]').length===4,null,{timeout:15000});
  const persisted=await scoringPage.evaluate(()=>({
    recognition:window.RussianHandwritingRecognition.getState(),
    learning:window.RussianLearningState.get()
  }));
  assert.equal(persisted.recognition.lastLetterId,missed.recognition.lastLetterId,'Recognition letter changed across reload after miss');
  assert.equal(persisted.recognition.lastCorrect,false,'Recognition miss state did not persist across reload');
  assert.ok(persisted.learning.reviewQueue[reviewId],'Handwriting Review Queue item did not persist across reload');
  assert.equal(persisted.learning.resume?.route?.view,'writing','Writing resume route did not persist across reload');
  assert.equal(Number(persisted.learning.resume?.route?.handwritingIndex),Number(missed.learning.resume?.route?.handwritingIndex),'Handwriting resume index drifted across reload');

  await scoringPage.locator(`[data-ru-handwriting-choice="${missed.recognition.lastLetterId}"]`).click();
  await scoringPage.waitForFunction(()=>window.RussianHandwritingRecognition.getState().attempts===2&&window.RussianHandwritingRecognition.getState().correct===1&&window.RussianHandwritingRecognition.getState().lastCorrect===true);
  const confirmedOnce=await scoringPage.evaluate(()=>({
    recognition:window.RussianHandwritingRecognition.getState(),
    learning:window.RussianLearningState.get(),
    dueIds:window.RussianHandwritingRecognition.dueReviewIds(),
    nextReviewAt:window.RussianHandwritingRecognition.nextReviewAt()
  }));
  assert.ok(confirmedOnce.learning.reviewQueue[reviewId],'First correct confirmation cleared Review Queue too early');
  assert.equal(Number(confirmedOnce.recognition.profiles[missed.recognition.lastLetterId]?.correctStreak),1,'First recovery confirmation streak drift');
  assert.ok(Number.isFinite(Date.parse(confirmedOnce.recognition.profiles[missed.recognition.lastLetterId]?.dueAt||'')),'First recovery confirmation did not schedule a due time');
  assert.ok(Date.parse(confirmedOnce.recognition.profiles[missed.recognition.lastLetterId].dueAt)>Date.now(),'First recovery confirmation did not schedule a future review');
  assert.ok(!confirmedOnce.dueIds.includes(missed.recognition.lastLetterId),'Future recovery item was treated as already due');
  assert.equal(confirmedOnce.nextReviewAt,confirmedOnce.recognition.profiles[missed.recognition.lastLetterId].dueAt,'Next review timestamp drift');

  await scoringPage.reload({waitUntil:'domcontentloaded',timeout:30000});
  await scoringPage.waitForFunction(()=>window.RussianHandwritingRecognition?.getState?.().attempts===2&&window.RussianHandwritingRecognition?.getCapability?.().canScore===true,null,{timeout:15000});
  const scheduledPersisted=await scoringPage.evaluate(id=>({
    recognition:window.RussianHandwritingRecognition.getState(),
    learning:window.RussianLearningState.get(),
    reviewExists:Boolean(window.RussianLearningState.get().reviewQueue['handwriting:'+id])
  }),missed.recognition.lastLetterId);
  assert.equal(Number(scheduledPersisted.recognition.profiles[missed.recognition.lastLetterId]?.correctStreak),1,'Recovery streak did not persist across reload');
  assert.ok(scheduledPersisted.reviewExists,'Scheduled handwriting Review Queue item did not persist across reload');

  await scoringPage.evaluate(id=>{
    const key='bauman_russian_handwriting_recognition_v1';
    const state=JSON.parse(localStorage.getItem(key)||'{}');
    state.profiles=state.profiles||{};
    state.profiles[id]=state.profiles[id]||{};
    state.profiles[id].dueAt=new Date(Date.now()-1000).toISOString();
    localStorage.setItem(key,JSON.stringify(state));
  },missed.recognition.lastLetterId);
  await scoringPage.reload({waitUntil:'domcontentloaded',timeout:30000});
  await scoringPage.waitForFunction(()=>window.RussianHandwritingRecognition?.getCapability?.().canScore===true&&window.RussianHandwritingRecognition?.dueReviewIds?.().length>0,null,{timeout:15000});
  await scoringPage.locator('[data-view="writing"]').first().click();
  await scoringPage.waitForFunction(()=>document.querySelector('.ru-handwriting-recognition')?.dataset.ruQuestionSource==='review_due',null,{timeout:15000});
  const dueQuestionId=await scoringPage.evaluate(()=>window.RussianHandwritingRecognition.dueReviewIds()[0]);
  assert.equal(dueQuestionId,missed.recognition.lastLetterId,'Due weak letter was not prioritized for recovery');

  await scoringPage.locator(`[data-ru-handwriting-choice="${missed.recognition.lastLetterId}"]`).click();
  await scoringPage.waitForFunction(()=>window.RussianHandwritingRecognition.getState().attempts===3&&window.RussianHandwritingRecognition.getState().correct===2&&window.RussianHandwritingRecognition.getState().lastCorrect===true);
  const recovered=await scoringPage.evaluate(()=>({
    recognition:window.RussianHandwritingRecognition.getState(),
    learning:window.RussianLearningState.get(),
    flow:window.RussianLearningFlow.get(),
    dueIds:window.RussianHandwritingRecognition.dueReviewIds()
  }));
  assert.ok(!recovered.learning.reviewQueue[reviewId],'Second consecutive correct confirmation did not clear handwriting Review Queue item');
  assert.equal(Number(recovered.recognition.profiles[missed.recognition.lastLetterId]?.correctStreak),2,'Recovery streak did not reach two confirmations');
  assert.ok(recovered.recognition.profiles[missed.recognition.lastLetterId]?.resolvedAt,'Recovered letter was not marked resolved');
  assert.ok(!recovered.dueIds.includes(missed.recognition.lastLetterId),'Resolved handwriting letter remained due');
  assert.ok(!Object.prototype.hasOwnProperty.call(recovered.recognition.weak,missed.recognition.lastLetterId),'Resolved handwriting letter remained in weak map');
  const scoringAlphabetSteps=Object.values(recovered.flow.lessons||{}).map(x=>x?.steps?.alphabet).filter(Boolean);
  assert.ok(scoringAlphabetSteps.some(x=>Number(x.recognitionAttempts||0)>=3&&Number(x.recognitionCorrect||0)>=2),'Scored recognition evidence missing from learning flow');
  assert.ok(scoringAlphabetSteps.every(x=>Number(x.strokeActions||0)===0),'Scored recognition fabricated handwriting stroke evidence');
  assert.ok(scoringAlphabetSteps.every(x=>x.mastery===undefined&&x.completed===undefined),'Scored recognition wrote mastery/completed state');
  assert.deepEqual(scoringErrors,[],'Forced scoring browser emitted console/page errors');
  await scoringPage.screenshot({path:`${OUT}/russian-handwriting-recognition-scoring.png`,fullPage:true});
  await scoringContext.close();

  fs.writeFileSync(`${OUT}/result.json`,JSON.stringify({status:'PASS',initial,mobile,forcedCapability,scoredState:recovered.recognition,url:russianUrl()},null,2));
  console.log('RUSSIAN_HANDWRITING_RECOGNITION_BROWSER=PASS');
}finally{if(browser)await browser.close();}