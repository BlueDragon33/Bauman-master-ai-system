import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4175/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-engine-grounded';
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
    const speech={count:0,last:null};
    class MockUtterance{
      constructor(text){this.text=String(text||'');this.lang='';this.rate=1;}
    }
    Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:MockUtterance});
    Object.defineProperty(window,'speechSynthesis',{
      configurable:true,
      value:{
        cancel(){},
        speak(utterance){
          speech.count++;
          speech.last={text:utterance.text,lang:utterance.lang,rate:utterance.rate};
          queueMicrotask(()=>utterance.onstart?.());
          queueMicrotask(()=>utterance.onend?.());
        }
      }
    });
    window.__RE_TTS=speech;
  });

  const plainUrl=new URL('subjects/russian/index.html',BASE).href;
  await page.goto(plainUrl,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('body.ru-future-ui',{timeout:15000});
  await page.waitForTimeout(250);
  assert.equal(await page.locator('[data-russian-engine-grounded="1"]').count(),0,'Grounded slice must remain off without feature flag');

  const flaggedUrl=new URL('subjects/russian/index.html?ruEngine=grounded-v1',BASE).href;
  await page.goto(flaggedUrl,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('[data-russian-engine-grounded="1"]',{timeout:15000});
  await page.waitForFunction(()=>window.RussianEngineIntegration?.status?.().grounded?.state==='READY',null,{timeout:15000});

  const slice=page.locator('[data-russian-engine-grounded="1"]');
  assert.equal(await slice.count(),1,'Grounded slice must mount exactly once');
  assert.equal(await slice.locator('[data-re-object]').count(),3,'Grounded scene must expose three visual choices');
  assert.equal(await slice.locator('.re-grounded__transcript').count(),0,'Transcript must be hidden initially');
  assert.equal((await slice.innerText()).includes('Дай мяч.'),false,'Russian transcript must not leak before support threshold');

  const integration=await page.evaluate(()=>window.RussianEngineIntegration.status());
  assert.equal(integration.enabled,false,'Passive bridge must remain globally disabled');
  assert.equal(integration.grounded.requested,true);
  assert.equal(integration.grounded.mounted,true);
  assert.equal(integration.grounded.status.supportLevel,0);

  await slice.locator('[data-re-listen]').click();
  await page.waitForFunction(()=>window.__RE_TTS?.count>=1);
  const firstTts=await page.evaluate(()=>window.__RE_TTS.last);
  assert.equal(firstTts.text,'Дай мяч.');
  assert.equal(firstTts.lang,'ru-RU');

  const objects=slice.locator('[data-re-object]');
  await objects.nth(1).click();
  assert.equal((await slice.locator('[data-re-support]').innerText()).trim(),'↻');
  assert.equal(await slice.locator('.re-grounded__transcript').count(),0);

  await objects.nth(2).click();
  assert.equal(await objects.nth(0).getAttribute('class').then(value=>String(value).includes('is-hint')),true,'Second support step must visually focus the target');
  assert.equal(await slice.locator('.re-grounded__transcript').count(),0);

  for(let i=0;i<6;i++)await objects.nth(2).click();
  await page.waitForSelector('.re-grounded__transcript');
  assert.equal((await slice.locator('.re-grounded__transcript').innerText()).trim(),'Дай мяч.');
  assert.equal((await slice.innerText()).includes('quả bóng'),false,'Native-language translation must not be invented');

  await objects.nth(0).click();
  await page.waitForSelector('[data-re-next]');
  const firstDone=await page.evaluate(()=>window.RussianEngineIntegration.status().grounded.status);
  assert.equal(firstDone.evidenceCount,9);

  await slice.locator('[data-re-next]').click();
  await page.waitForFunction(()=>window.RussianEngineIntegration.status().grounded.status.sceneId==='grounded-give-book-b');
  const transferState=await page.evaluate(()=>window.RussianEngineIntegration.status().grounded.status);
  assert.equal(transferState.supportLevel,0,'Transfer scene must reset support');
  assert.equal(transferState.transferCount,1);
  assert.equal(await slice.locator('.re-grounded__transcript').count(),0,'Transfer scene must hide transcript again');

  const transferObjects=slice.locator('[data-re-object]');
  await transferObjects.nth(1).click();
  await page.waitForFunction(()=>document.querySelector('[data-russian-engine-grounded="1"]')?.innerText?.includes('Готово'));
  assert.equal(await slice.locator('[data-re-next]').count(),0,'Second scene must end the initial transfer proof instead of cycling');

  const finalState=await page.evaluate(()=>window.RussianEngineIntegration.status().grounded.status);
  assert.equal(finalState.evidenceCount,10);
  assert.equal(finalState.transferCount,1);

  const enginePersistence=await page.evaluate(()=>{
    const keys=Object.keys(localStorage).filter(key=>/engine|grounded/i.test(key)).sort();
    const outboxKey='bauman_russian_engine_evidence_outbox_v1';
    let outbox=null;
    try{outbox=JSON.parse(localStorage.getItem(outboxKey)||'null')}catch(_){}
    return {keys,outbox};
  });
  assert.deepEqual(
    enginePersistence.keys,
    ['bauman_russian_engine_evidence_outbox_v1'],
    'Grounded slice may persist only the structured Engine evidence outbox'
  );
  assert.equal(enginePersistence.outbox?.schema,'RUSSIAN_ENGINE_BROWSER_EVIDENCE_RUNTIME_V1');
  assert.equal(Array.isArray(enginePersistence.outbox?.rows),true);
  assert.equal(enginePersistence.outbox.rows.length,10,'Every grounded observation must remain auditable');
  assert.equal(enginePersistence.outbox.rows.every(row=>row.state==='DELIVERED'),true,'Delivered observations should be acknowledged');
  const persistedText=JSON.stringify(enginePersistence.outbox);
  for(const forbidden of ['rawAudio','audioBlob','microphoneStream','mediaStream','paymentCustomerId','billingProviderId','providerPrivateId']){
    assert.equal(persistedText.includes(forbidden),false,'Forbidden persisted field: '+forbidden);
  }
  assert.equal(enginePersistence.keys.some(key=>/learner|mastery/i.test(key)),false,'Engine must not persist a parallel learner/mastery store');

  const engineStorageKeys=enginePersistence.keys;

  const renderedSettings=[];
  for(const setting of ['room','shop','metro','dorm','university']){
    const worldUrl=new URL(
      'subjects/russian/index.html?ruEngine=grounded-v1&ruWorld=real-life-v1&ruSetting='+encodeURIComponent(setting),
      BASE
    ).href;
    await page.goto(worldUrl,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForSelector('[data-russian-engine-grounded="1"]',{timeout:15000});
    await page.waitForFunction(()=>window.RussianEngineIntegration?.status?.().grounded?.state==='READY',null,{timeout:15000});
    const state=await page.evaluate(()=>window.RussianEngineIntegration.status().grounded.status);
    assert.equal(state.catalog,'real-life-v1');
    assert.equal(state.setting,setting);
    assert.equal(state.selectorReason,'new-in-setting');
    assert.equal(await page.locator('[data-russian-engine-grounded="1"] [data-re-object]').count(),3);
    assert.equal(await page.locator('[data-russian-engine-grounded="1"] .re-grounded__transcript').count(),0);
    await page.locator('[data-russian-engine-grounded="1"] [data-re-listen]').click();
    await page.waitForFunction(()=>window.__RE_TTS?.count>=1);
    const spoken=await page.evaluate(()=>window.__RE_TTS?.last?.text||'');
    assert.match(spoken,/[А-Яа-яЁё]/,'Real-life setting must deliver Russian audio text');
    renderedSettings.push({setting,sceneId:state.sceneId,spoken});
  }

  // Pre-A0 contract: Vietnamese help is optional; an icon click cannot certify a location.
  const metroPreviewUrl=new URL(
    'subjects/russian/index.html?ruEngine=grounded-v1&ruWorld=real-life-v1&ruSetting=metro',
    BASE
  ).href;
  await page.goto(metroPreviewUrl,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('[data-russian-engine-grounded="1"]',{timeout:15000});
  await page.waitForFunction(()=>window.RussianEngineIntegration?.status?.().grounded?.state==='READY',null,{timeout:15000});
  const metroPreview=page.locator('[data-russian-engine-grounded="1"]');
  assert.match(await metroPreview.innerText(),/Bối cảnh: Tàu điện ngầm/);
  assert.equal(await metroPreview.locator('[data-re-a0-detail]').isVisible(),false);
  await metroPreview.locator('[data-re-a0-help]').click();
  assert.equal(await metroPreview.locator('[data-re-a0-detail]').isVisible(),true);
  assert.match(await metroPreview.locator('[data-re-a0-detail]').innerText(),/KHÔNG có nghĩa/);
  const beforePreviewRows=await page.evaluate(()=>JSON.parse(localStorage.getItem('bauman_russian_engine_evidence_outbox_v1')||'{"rows":[]}').rows.length);
  assert.equal((await page.evaluate(()=>window.RussianEngineIntegration.status().grounded.status)).sceneId,'rl-07-metro');
  await metroPreview.locator('[data-re-object="ticket"]').click();
  assert.match(await metroPreview.locator('[data-re-status]').innerText(),/chưa kiểm tra vị trí/);
  assert.equal(await metroPreview.locator('[data-re-receiver] .re-grounded__requester').count(),1,'a location icon must not transfer to a person');
  assert.equal(await metroPreview.locator('[data-re-object="ticket"].is-recognized').count(),1,'location icon recognition must be highlighted');
  const afterPreviewRows=await page.evaluate(()=>JSON.parse(localStorage.getItem('bauman_russian_engine_evidence_outbox_v1')||'{"rows":[]}').rows.length);
  assert.equal(afterPreviewRows,beforePreviewRows,'an icon-only location cannot be sent to RU04');
  assert.equal((await page.evaluate(()=>window.RussianEngineIntegration.status().grounded.status)).evidenceCount,1,'practice-only local observation should remain auditable');

  const adaptiveRoomUrl=new URL(
    'subjects/russian/index.html?ruEngine=grounded-v1&ruWorld=real-life-v1&ruSetting=room',
    BASE
  ).href;
  await page.goto(adaptiveRoomUrl,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('[data-russian-engine-grounded="1"]',{timeout:15000});
  await page.waitForFunction(()=>window.RussianEngineIntegration?.status?.().grounded?.state==='READY',null,{timeout:15000});
  const adaptiveStart=await page.evaluate(()=>window.RussianEngineIntegration.status().grounded.status);
  assert.equal(adaptiveStart.sceneId,'rl-01-room');
  assert.equal(adaptiveStart.selectorReason,'new-in-setting');
  await page.locator('[data-russian-engine-grounded="1"] [data-re-object="ball"]').click();
  await page.waitForSelector('[data-russian-engine-grounded="1"] [data-re-next]');
  await page.locator('[data-russian-engine-grounded="1"] [data-re-next]').click();
  await page.waitForFunction(()=>window.RussianEngineIntegration?.status?.().grounded?.status?.sceneId==='rl-02-room',null,{timeout:15000});
  const adaptiveTransfer=await page.evaluate(()=>window.RussianEngineIntegration.status().grounded.status);
  assert.equal(adaptiveTransfer.selectorReason,'unseen-transfer');
  assert.equal(adaptiveTransfer.completedSceneCount,1);
  assert.equal(adaptiveTransfer.supportLevel,0);

  await page.screenshot({path:path.join(OUT,'grounded-s1-final.png'),fullPage:true});
  fs.writeFileSync(path.join(OUT,'grounded-s1-evidence.json'),JSON.stringify({
    url:flaggedUrl,
    integration:await page.evaluate(()=>window.RussianEngineIntegration.status()),
    tts:await page.evaluate(()=>window.__RE_TTS),
    engineStorageKeys,
    renderedSettings,
    errors
  },null,2));

  assert.deepEqual(errors,[],'Grounded browser slice must not produce page/console errors');

  console.log(JSON.stringify({
    ok:true,
    defaultOff:true,
    mountedWithFlag:true,
    transcriptHiddenInitially:true,
    transcriptLate:true,
    translationInvented:false,
    transfer:true,
    structuredEvidenceOutboxOnly:true,
    noParallelLearnerMasteryStore:true,
    realLifeSettingsRendered:renderedSettings.length,
    adaptiveSelectorIntegrated:true,
    screenshot:path.join(OUT,'grounded-s1-final.png')
  }));
}finally{
  await browser?.close();
}
