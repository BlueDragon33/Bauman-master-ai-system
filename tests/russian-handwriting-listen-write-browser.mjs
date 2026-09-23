import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-handwriting-listen-write';
fs.mkdirSync(OUT,{recursive:true});

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});

  await page.addInitScript(()=>{
    const speech={cancel:0,speak:0,last:null,history:[]};
    class MockUtterance{
      constructor(text){this.text=String(text);this.lang='';this.rate=1;this.onstart=null;this.onend=null;this.onerror=null;}
    }
    const synth={
      cancel(){speech.cancel++;},
      speak(u){
        speech.speak++;
        speech.last={text:u.text,lang:u.lang,rate:u.rate};
        speech.history.push(speech.last);
        u.onstart?.();
        queueMicrotask(()=>u.onend?.());
      }
    };
    Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:MockUtterance});
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:synth});
    window.__RHW_SPEECH=speech;
  });

  const url=new URL('subjects/russian/index.html',BASE).href;
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('#nav [data-view="writing"]',{timeout:30000});
  await page.click('#nav [data-view="writing"]');
  await page.waitForSelector('.hand-listen-write-card',{timeout:15000});
  await page.waitForSelector('.hand-exercise-card',{timeout:15000});

  // S22: rapid playback must cancel the previous utterance and preserve Russian locale/rates.
  await page.click('[data-act="hand-speak-name"]');
  await page.click('[data-act="hand-speak-example"]');
  await page.click('[data-act="hand-speak-example-slow"]');
  await page.click('[data-act="hand-exercise-play"]');
  await page.click('[data-act="hand-exercise-play-slow"]');
  await page.waitForTimeout(50);
  const speech=await page.evaluate(()=>window.__RHW_SPEECH);
  assert.ok(speech.speak>=5,'RHW5 expected handwriting speech calls');
  assert.ok(speech.cancel>=speech.speak,'Every handwriting playback must cancel prior speech first');
  assert.equal(speech.last.lang,'ru-RU');
  assert.equal(speech.last.rate,0.62);
  assert.ok(speech.history.some(x=>x.rate===0.85),'Normal handwriting playback rate missing');
  assert.ok(speech.history.some(x=>x.rate===0.62),'Slow handwriting playback rate missing');

  // Answer must be hidden before attempt; deterministic hear-select should grade after explicit choice.
  await page.click('[data-hand-session="learn"]');
  await page.waitForSelector('.hand-exercise-hidden-answer');
  assert.match(await page.locator('.hand-exercise-hidden-answer').innerText(),/khóa|Đáp án/i);
  const firstChoice=page.locator('.hand-exercise-choices [data-hand-choice]').first();
  assert.equal(await firstChoice.isVisible(),true,'Hear-select choices are not visible');
  const correct=page.locator('.hand-exercise-choices [data-hand-choice="А"]');
  assert.equal(await correct.count(),1,'Expected deterministic А choice for first alphabet item');
  await correct.click();
  await page.click('[data-act="hand-exercise-check"]');
  await page.waitForSelector('.hand-exercise-feedback.correct');
  assert.match(await page.locator('.hand-exercise-feedback.correct').innerText(),/Đúng/);

  // Progress only appears after the attempt.
  const letterProgress=await page.locator('.hand-letter-progress').innerText();
  assert.match(letterProgress,/1 lần/);
  assert.match(letterProgress,/✓ 1/);

  // S23: canvas remains writable while/after audio interaction.
  await page.click('[data-act="hand-exercise-play"]');
  const canvas=page.locator('#writingCanvas');
  const box=await canvas.boundingBox();
  assert.ok(box&&box.width>100&&box.height>100,'Writing canvas unavailable');
  await page.mouse.move(box.x+80,box.y+100);
  await page.mouse.down();
  await page.mouse.move(box.x+180,box.y+180,{steps:6});
  await page.mouse.up();
  await page.click('[data-act="undo-canvas"]');
  await page.click('[data-act="toggle-guide"]');
  await page.click('[data-act="toggle-guide"]');
  assert.equal(await canvas.isVisible(),true,'Canvas disappeared during audio/writing interaction');

  // S24: keyboard navigation applies only outside typing controls.
  const beforeTitle=await page.locator('.practice-head h3').innerText();
  await page.locator('body').click({position:{x:5,y:5}});
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(50);
  const afterTitle=await page.locator('.practice-head h3').innerText();
  assert.notEqual(afterTitle,beforeTitle,'ArrowRight did not navigate handwriting samples');
  await page.locator('[data-hand-session="dictation"]').click();
  await page.waitForTimeout(50);
  const input=page.locator('[data-hand-exercise-input="1"]');
  if(await input.count()){
    const titleBeforeTyping=await page.locator('.practice-head h3').innerText();
    await input.focus();
    await page.keyboard.type('тест');
    await page.keyboard.press('ArrowRight');
    const titleAfterTyping=await page.locator('.practice-head h3').innerText();
    assert.equal(titleAfterTyping,titleBeforeTyping,'Arrow key inside answer input must not navigate handwriting item');
  }

  // Responsive/mobile acceptance.
  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(80);
  for(const selector of ['.hand-session-tabs','.hand-listen-write-actions','.hand-exercise-actions','#writingCanvas']){
    assert.equal(await page.locator(selector).first().isVisible(),true,'Mobile handwriting control missing: '+selector);
  }
  const actionBox=await page.locator('.hand-exercise-actions').boundingBox();
  assert.ok(actionBox&&actionBox.width<=390,'Exercise actions overflow mobile viewport');

  await page.screenshot({path:path.join(OUT,'rhw5-mobile.png'),fullPage:true});
  assert.deepEqual(errors,[],'RHW5 browser flow emitted console/page errors');

  // Unsupported-speech fallback must never block handwriting.
  const noSpeechContext=await browser.newContext({viewport:{width:390,height:844}});
  const noSpeechPage=await noSpeechContext.newPage();
  const noSpeechErrors=[];
  noSpeechPage.on('pageerror',e=>noSpeechErrors.push(String(e?.stack||e)));
  noSpeechPage.on('console',m=>{if(m.type()==='error')noSpeechErrors.push(m.text())});
  await noSpeechPage.addInitScript(()=>{
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:undefined});
    Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:undefined});
  });
  await noSpeechPage.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await noSpeechPage.waitForSelector('#nav [data-view="writing"]',{timeout:30000});
  if(await noSpeechPage.locator('#russianMenuBtn').isVisible())await noSpeechPage.click('#russianMenuBtn');
  await noSpeechPage.click('#nav [data-view="writing"]');
  await noSpeechPage.waitForSelector('.hand-listen-write-card',{timeout:15000});
  assert.equal(await noSpeechPage.locator('[data-act="hand-speak-name"]').isDisabled(),true,'Speech-unavailable name control must be disabled');
  assert.equal(await noSpeechPage.locator('#writingCanvas').isVisible(),true,'Canvas must remain available without speech support');
  assert.match(await noSpeechPage.locator('.hand-audio-fallback').innerText(),/luyện viết|viết/i);
  assert.deepEqual(noSpeechErrors,[],'Speech-unavailable fallback emitted console/page errors');
  await noSpeechContext.close();

  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',speech,letterProgress,mobile:true,speechUnavailableFallback:true,errors},null,2));
  console.log('Russian handwriting listen-write browser acceptance PASS');
}finally{
  await browser?.close();
}
