import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-academic-production';
fs.mkdirSync(OUT,{recursive:true});

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1365,height:900}});
  const page=await context.newPage();
  await page.goto(new URL('subjects/russian/index.html',BASE).href,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.RussianRuntimeData?.ready&&window.RussianAcademicProduction&&window.RussianAssessmentMastery,{timeout:30000});

  const availability=await page.evaluate(()=>({
    technical:window.RussianRuntimeData.has('technical-concepts'),
    academic:window.RussianRuntimeData.has('academic-functions'),
    reading:window.RussianRuntimeData.has('reading'),
    performance:window.RussianRuntimeData.has('performance-tasks')
  }));
  assert.deepEqual(availability,{technical:true,academic:true,reading:true,performance:true});

  const ids=await page.evaluate(()=>window.RussianAcademicProduction.tasks().map(x=>x.id));
  for(const id of ['PT-R17-LAB','PT-R19-NIR-PITCH','PT-R25-DEFENSE'])assert(ids.includes(id),'missing RU06 task '+id);

  const masteryBefore=await page.evaluate(()=>JSON.stringify(window.RussianAssessmentMastery.exportState()));

  await page.click('[data-view="writing"]');
  await page.waitForSelector('[data-writing="academic"]');
  await page.click('[data-writing="academic"]');
  await page.waitForSelector('#ruAcademicProduction',{state:'visible'});

  await page.evaluate(()=>window.RussianAcademicProduction.setTask('PT-R17-LAB'));
  await page.waitForFunction(()=>document.querySelector('#ruProdTask')?.value==='PT-R17-LAB');
  assert.match(await page.locator('#ruAcademicProduction').textContent(),/lab-report/);

  await page.selectOption('#ruProdClaimType','source-fact');
  await page.fill('#ruProdClaimText','Результат эксперимента показывает устойчивое поведение.');
  await page.fill('#ruProdClaimSource','');
  await page.click('[data-ru-prod="claim"]');
  await page.waitForFunction(()=>document.querySelector('.ru-prod-notice')?.textContent?.includes('sourceRef'));
  assert.equal((await page.evaluate(()=>window.RussianAcademicProduction.get().claims.length)),0,'source-fact without source must be rejected');

  await page.fill('#ruProdSourceRef','doi:10.0000/example');
  await page.fill('#ruProdSourceNote','Reviewed experiment source');
  await page.click('[data-ru-prod="source"]');
  await page.selectOption('#ruProdClaimType','source-fact');
  await page.fill('#ruProdClaimSource','doi:10.0000/example');
  await page.fill('#ruProdClaimText','Результат эксперимента показывает устойчивое поведение.');
  await page.click('[data-ru-prod="claim"]');

  await page.selectOption('#ruProdClaimType','generated-suggestion');
  await page.fill('#ruProdClaimSource','');
  await page.fill('#ruProdClaimText','Возможный переход между разделами.');
  await page.click('[data-ru-prod="claim"]');

  const lineage=await page.evaluate(()=>window.RussianAcademicProduction.get().claims);
  assert.equal(lineage.length,2);
  assert.equal(lineage[0].type,'source-fact');
  assert.equal(lineage[0].sourceRef,'doi:10.0000/example');
  assert.equal(lineage[1].generated,true);
  assert.equal(lineage[1].canonical,false);

  for(const key of ['numbers','equations','code-identifiers','figures-tables','experimental-results']){
    await page.click('[data-ru-integrity="'+key+'"]');
  }
  const integrity=await page.evaluate(()=>window.RussianAcademicProduction.context().integrity);
  assert(Object.values(integrity).every(Boolean),'representation integrity checklist not persisted');

  await page.fill('[data-input="writingDraft"]','Цель эксперимента состоит в проверке устойчивости системы. Полученные результаты показывают ожидаемую тенденцию.');
  await page.click('[data-ru-prod="snapshot"]');
  await page.waitForFunction(()=>window.RussianAcademicProduction.get().snapshots.length===1);
  const snapshot=await page.evaluate(()=>window.RussianAcademicProduction.get().snapshots[0]);
  assert.equal(snapshot.taskId,'PT-R17-LAB');
  assert.equal(snapshot.authoritative,false);
  assert.equal(snapshot.masteryWrite,false);
  assert(snapshot.sourceRefs.includes('doi:10.0000/example'));

  await page.evaluate(()=>window.RussianAcademicProduction.setTask('PT-R19-NIR-PITCH'));
  await page.waitForFunction(()=>document.querySelector('#ruProdTask')?.value==='PT-R19-NIR-PITCH');
  assert.match(await page.locator('#ruAcademicProduction').textContent(),/nir-proposal/);

  await page.evaluate(()=>window.RussianAcademicProduction.setTask('PT-R25-DEFENSE'));
  await page.waitForFunction(()=>document.querySelector('#ruProdTask')?.value==='PT-R25-DEFENSE');
  const defenseText=await page.locator('#ruAcademicProduction').textContent();
  assert.match(defenseText,/vkr-defense/);
  assert.match(defenseText,/presentation \+ figures\/tables \+ defense Q&A \+ uncertainty handling/);

  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.RussianAcademicProduction&&window.RussianRuntimeData?.ready,{timeout:30000});
  const persisted=await page.evaluate(()=>window.RussianAcademicProduction.context());
  assert.equal(persisted.taskId,'PT-R25-DEFENSE');
  assert(persisted.sourceRefs.includes('doi:10.0000/example'));

  await page.setViewportSize({width:390,height:844});
  await page.click('[data-view="writing"]');
  await page.waitForSelector('[data-writing="academic"]');
  await page.click('[data-writing="academic"]');
  await page.waitForSelector('#ruAcademicProduction');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
  assert.equal(overflow,false,'RU06 production UI causes mobile horizontal overflow');

  const masteryAfter=await page.evaluate(()=>JSON.stringify(window.RussianAssessmentMastery.exportState()));
  assert.equal(masteryAfter,masteryBefore,'RU06 production evidence must not mutate canonical mastery');

  await page.screenshot({path:path.join(OUT,'academic-production-mobile.png'),fullPage:true});
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({
    status:'PASS',
    technicalTask:'PT-R17-LAB',
    researchTask:'PT-R19-NIR-PITCH',
    defenseTask:'PT-R25-DEFENSE',
    sourceFactRequiresSource:true,
    generatedSuggestionNonCanonical:true,
    representationIntegrity:true,
    reloadPersistence:true,
    masteryUnchanged:true,
    mobileOverflow:false
  },null,2));
  console.log('Russian RU06 academic production browser journey PASS');
}finally{await browser?.close();}
