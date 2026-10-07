import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4175/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-engine-beta';
fs.mkdirSync(OUT,{recursive:true});

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1365,height:900}});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push(String(error?.stack||error)));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});

  await page.addInitScript(()=>{
    class MockUtterance{constructor(text){this.text=String(text||'');this.lang='';this.rate=1;}}
    Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:MockUtterance});
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel(){},speak(u){queueMicrotask(()=>u.onstart?.());queueMicrotask(()=>u.onend?.());}}});
  });

  const url=new URL('subjects/russian/index.html?ruEngine=beta-v1',BASE).href;
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('[data-russian-engine-grounded="1"]',{timeout:15000});
  await page.waitForFunction(()=>window.RussianEngineIntegration?.status?.().grounded?.state==='READY',null,{timeout:15000});

  let status=await page.evaluate(()=>window.RussianEngineIntegration.status());
  assert.equal(status.enabled,true);
  assert.equal(status.betaRequested,true);
  assert.equal(status.mode,'BETA_LEARNING_LOOP');
  assert.equal(status.session.status,'ACTIVE');
  const firstSessionId=status.session.sessionId;

  await page.evaluate(()=>{
    window.__savedRussianAssessmentMastery=window.RussianAssessmentMastery;
    delete window.RussianAssessmentMastery;
  });
  const slice=page.locator('[data-russian-engine-grounded="1"]');
  await slice.locator('[data-re-object]').nth(2).click();
  await page.waitForFunction(()=>window.RussianEngineIntegration?.status?.().session?.pendingOutbox===1,null,{timeout:10000});
  status=await page.evaluate(()=>window.RussianEngineIntegration.status());
  assert.equal(status.session.evidence.length,1);

  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('[data-russian-engine-grounded="1"]',{timeout:15000});
  await page.waitForFunction(()=>window.RussianEngineIntegration?.status?.().session?.pendingOutbox===0,null,{timeout:15000});
  await page.waitForFunction(()=>window.RussianAssessmentMastery?.status?.().evidenceCount>0,null,{timeout:15000});
  status=await page.evaluate(()=>window.RussianEngineIntegration.status());
  assert.equal(status.session.sessionId,firstSessionId,'Active beta session must resume after reload');
  assert.equal(status.session.evidence.length,1);

  const countAfterRecovery=await page.evaluate(()=>window.RussianAssessmentMastery.status().evidenceCount);
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('[data-russian-engine-grounded="1"]',{timeout:15000});
  await page.waitForTimeout(400);
  assert.equal(await page.evaluate(()=>window.RussianAssessmentMastery.status().evidenceCount),countAfterRecovery,'Delivered outbox evidence must not duplicate on reload');

  const resumed=page.locator('[data-russian-engine-grounded="1"]');
  await resumed.locator('[data-re-object]').nth(0).click();
  await page.waitForSelector('[data-re-next]');
  await resumed.locator('[data-re-next]').click();
  await page.waitForFunction(()=>window.RussianEngineIntegration.status().grounded.status.sceneId==='grounded-give-book-b');
  await resumed.locator('[data-re-object]').nth(1).click();
  await page.waitForFunction(()=>window.RussianEngineIntegration.status().session.status==='COMPLETED',null,{timeout:15000});

  const final=await page.evaluate(()=>({
    integration:window.RussianEngineIntegration.status(),
    assessment:window.RussianAssessmentMastery.status(),
    plan:window.RussianAdaptivePlanner.buildPlan({maxItems:12}),
    keys:Object.keys(localStorage).filter(k=>k.startsWith('russian_engine_'))
  }));
  assert.equal(final.integration.session.status,'COMPLETED');
  assert(final.integration.session.metrics.observations>=3);
  assert(final.assessment.attemptCount>=3);
  assert(final.assessment.evidenceCount>=3);
  assert(final.plan.tasks.some(x=>x.source==='russian-engine'),'Completed beta session must publish planner follow-up');
  assert(final.keys.some(k=>k.startsWith('russian_engine_outbox_v1:')));
  assert(final.keys.some(k=>k.startsWith('russian_engine_active_session_v1:')));

  const stored=await page.evaluate(()=>Object.entries(localStorage).filter(([k])=>k.startsWith('russian_engine_')).map(([k,v])=>[k,v]));
  assert.equal(JSON.stringify(stored).includes('rawAudio'),false);
  assert.equal(JSON.stringify(stored).includes('audioBlob'),false);

  await page.screenshot({path:path.join(OUT,'beta-learning-loop-final.png'),fullPage:true});
  fs.writeFileSync(path.join(OUT,'beta-learning-loop-evidence.json'),JSON.stringify({url,final,errors},null,2));
  assert.deepEqual(errors,[]);

  console.log(JSON.stringify({
    ok:true,
    betaMounted:true,
    reloadRecovery:true,
    duplicateDeliveryBlocked:true,
    sessionCompleted:true,
    plannerFollowup:true,
    noRawVoice:true
  }));
}finally{
  await browser?.close();
}
