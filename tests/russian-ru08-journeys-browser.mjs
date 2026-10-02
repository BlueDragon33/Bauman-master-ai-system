import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-ru08-journeys';
fs.mkdirSync(OUT,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 const page=await context.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(String(e?.stack||e)));
 await page.goto(new URL('subjects/russian/index.html',BASE).href,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForSelector('body.ru-future-ui',{timeout:15000});
 await page.waitForFunction(()=>!!window.RussianAssessmentMastery&&!!window.RussianLearningState&&!!window.RussianAcademicLanguage,null,{timeout:15000});

 // Beginner: enter -> next action -> learn -> review truth -> return.
 assert.equal(await page.locator('.rf-dashboard').count(),1);
 assert.ok(await page.locator('.rf-continue-card,.rf-today-plan').count()>0);
 await page.locator('#nav [data-view="learning"]').first().click();
 await page.waitForFunction(()=>document.querySelector('#pageTitle')?.textContent?.length>0);
 assert.equal(await page.locator('[data-learn="theory"]').count()>0,true);
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForSelector('body.ru-future-ui');
 
 // Survival oral path and deterministic capability boundary.
 await page.locator('#nav [data-view="learning"]').first().click();
 const practice=page.locator('[data-learn="practice"]').first();
 if(await practice.count())await practice.click();
 await page.waitForFunction(()=>!!window.RussianRecordingEngine&&!!window.RussianAudioEngine&&!!window.RussianSpeechRecognitionAdapter,null,{timeout:10000});
 const survival=await page.evaluate(async()=>{
   const reg=await fetch('data/scenario-registry.json').then(r=>r.json());
   const rows=reg.scenarios||[];
   return {scenarioCount:rows.length,hasRepair:rows.some(x=>Object.values(x.nodes||{}).some(n=>Array.isArray(n.repairPath)&&n.repairPath.length)),recording:typeof window.RussianRecordingEngine?.start==='function'};
 });
 assert.ok(survival.scenarioCount>0);assert.equal(survival.hasRepair,true);assert.equal(survival.recording,true);

 // University / technical / research material must be live, loadable and connected to the academic runtime.
 const advanced=await page.evaluate(async()=>{
   const [reading,tech,perf]=await Promise.all(['reading','technical-concepts','performance-tasks'].map(n=>fetch('data/'+n+'.json').then(r=>r.json())));
   return {
     readingCount:(reading.tasks||reading||[]).length,
     techCount:(tech.concepts||tech||[]).length,
     performanceCount:(perf.tasks||perf||[]).length,
     academicRuntime:!!window.RussianAcademicLanguage,
     researchTargets:(perf.tasks||[]).filter(x=>/R(?:1[9]|2[0-6])/.test(String(x.stage||x.module||x.id||''))).length
   };
 });
 assert.ok(advanced.readingCount>=12,'University reading tasks missing');
 assert.ok(advanced.techCount>=60,'Technical concept coverage missing');
 assert.ok(advanced.performanceCount>=10,'Performance/research tasks missing');
 assert.equal(advanced.academicRuntime,true);

 // Academic writing route must be reachable without changing mastery by mere navigation.
 const before=await page.evaluate(()=>JSON.stringify(window.RussianAssessmentMastery.exportState()));
 await page.locator('#nav [data-view="writing"]').first().click();
 await page.waitForFunction(()=>document.querySelector('#view')?.textContent?.length>0);
 const after=await page.evaluate(()=>JSON.stringify(window.RussianAssessmentMastery.exportState()));
 assert.equal(after,before,'Navigation/exposure must not mutate canonical mastery');

 const summary={status:'PASS',beginner:true,survival,university:advanced.readingCount,technical:advanced.techCount,research:advanced.performanceCount,masteryNavigationPure:true};
 fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(summary,null,2));
 await page.screenshot({path:path.join(OUT,'journeys.png'),fullPage:true});
 assert.deepEqual(errors,[]);
 console.log('Russian RU08 learner journeys browser acceptance PASS',JSON.stringify(summary));
}finally{await browser?.close();}