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
  const plainOwnerState=await page.evaluate(()=>window.RussianAssessmentMastery?.exportState?.()||{attempts:{},evidence:{},mastery:{}});
  assert.equal(Object.values(plainOwnerState.attempts||{}).filter(x=>String(x?.assessmentId||'').startsWith('ENGINE::')).length,0,'Feature-off must not create Engine RU04 attempts');
  assert.equal(Object.values(plainOwnerState.evidence||{}).filter(x=>String(x?.evidenceId||'').startsWith('RU04::RE09S1')).length,0,'Feature-off must not create Engine RU04 evidence');
  assert.equal(await page.evaluate(()=>window.RussianEngineIntegration?.status?.().liveOwner?.active??false),false,'Feature-off must not activate live owner integration');

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
  assert.equal(integration.liveOwner.active,true,'Feature-on must activate live owner integration');
  assert.equal(integration.liveOwner.status.assessmentOwnerPresent,true);
  assert.equal(integration.liveOwner.planner.ok,true,'Existing RussianAdaptivePlanner must be compatible');

  const plannerNonInterference=await page.evaluate(()=>{
    const planner=window.RussianAdaptivePlanner;
    const beforeBuild=planner?.buildPlan;
    const beforeExplain=planner?.explain;
    const beforeOverride=planner?.setManualOverride;
    const proposal=window.RussianEngineIntegration?.plannerCandidates?.({
      snapshot:{reviewDue:[]},
      recommendation:{kind:'introduce',experienceId:'EXP-BROWSER'},
      experiences:[{experienceId:'EXP-BROWSER',label:'Browser candidate',skill:'interaction',route:{view:'dialogue'},requiredCapabilities:[]}],
      capabilities:{},
      revision:'browser-r1'
    });
    return {
      proposalOk:proposal?.ok===true,
      candidateCount:proposal?.candidates?.length||0,
      sameBuild:planner?.buildPlan===beforeBuild,
      sameExplain:planner?.explain===beforeExplain,
      sameOverride:planner?.setManualOverride===beforeOverride
    };
  });
  assert.equal(plannerNonInterference.proposalOk,true);
  assert.equal(plannerNonInterference.candidateCount,1);
  assert.equal(plannerNonInterference.sameBuild,true);
  assert.equal(plannerNonInterference.sameExplain,true);
  assert.equal(plannerNonInterference.sameOverride,true);

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
  assert.equal(finalState.integrationEventCount,10);
  assert.equal(finalState.lastIntegration?.ok,true);

  const ownerProof=await page.evaluate(()=>{
    const state=window.RussianAssessmentMastery?.exportState?.()||{attempts:{},evidence:{},mastery:{},stageGates:{}};
    const engineAttempts=Object.values(state.attempts||{}).filter(x=>String(x?.assessmentId||'').startsWith('ENGINE::RE02-EXP-'));
    const engineEvidence=Object.values(state.evidence||{}).filter(x=>String(x?.evidenceId||'').startsWith('RU04::RE09S1'));
    const live=window.RussianEngineIntegration?.liveOwnerStatus?.();
    return {
      attemptCount:engineAttempts.length,
      evidenceCount:engineEvidence.length,
      authoritativeCount:engineEvidence.filter(x=>x?.authoritative===true).length,
      masteryKeys:Object.keys(state.mastery||{}),
      stageGateKeys:Object.keys(state.stageGates||{}),
      live,
      diagnosticText:JSON.stringify(live||{})
    };
  });
  assert.equal(ownerProof.attemptCount,10,'Each grounded observation must append a RU04 attempt');
  assert.equal(ownerProof.evidenceCount,10,'Each grounded observation must append non-authoritative RU04 evidence');
  assert.equal(ownerProof.authoritativeCount,0,'Engine evidence must remain non-authoritative');
  assert.deepEqual(ownerProof.masteryKeys,[],'Engine observation must not grant mastery');
  assert.deepEqual(ownerProof.stageGateKeys,[],'Engine observation must not write stage gates');
  assert.equal(ownerProof.live.ru04BundlesApplied,10);
  assert.equal(ownerProof.diagnosticText.includes('Дай мяч.'),false,'Diagnostics must not contain transcript content');

  const engineStorageKeys=await page.evaluate(()=>Object.keys(localStorage).filter(key=>/engine|grounded/i.test(key)));
  assert.deepEqual(engineStorageKeys,[],'Prepared slice must not persist a parallel Engine learner store');

  await page.screenshot({path:path.join(OUT,'grounded-s1-final.png'),fullPage:true});
  fs.writeFileSync(path.join(OUT,'grounded-s1-evidence.json'),JSON.stringify({
    url:flaggedUrl,
    integration:await page.evaluate(()=>window.RussianEngineIntegration.status()),
    tts:await page.evaluate(()=>window.__RE_TTS),
    engineStorageKeys,
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
    liveRu04Evidence:true,
    masteryGranted:false,
    plannerPatched:false,
    featureOffWrites:false,
    noPersistentEngineStore:true,
    screenshot:path.join(OUT,'grounded-s1-final.png')
  }));
}finally{
  await browser?.close();
}
