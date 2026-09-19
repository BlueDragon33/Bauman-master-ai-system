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
  assert.ok(['local-script-font','reference-only'].includes(initial.capability.mode));

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
  fs.writeFileSync(`${OUT}/result.json`,JSON.stringify({status:'PASS',initial,mobile,url:russianUrl()},null,2));
  console.log('RUSSIAN_HANDWRITING_RECOGNITION_BROWSER=PASS');
}finally{if(browser)await browser.close();}