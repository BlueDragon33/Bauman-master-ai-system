import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-ai-grounding';
fs.mkdirSync(OUT,{recursive:true});

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await context.newPage();
  await page.goto(new URL('subjects/russian/index.html',BASE).href,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.RussianRuntimeData?.ready&&window.RussianAIMentorGuard&&window.RussianScenarioEngine&&window.RussianAcademicProduction,{timeout:30000});

  const policy=await page.evaluate(()=>window.RussianAIMentorGuard.policy());
  assert.equal(policy.phase,'RU07');
  assert.equal(policy.canonicalTruthOwner,'RU03');
  assert.equal(policy.assessmentMasteryOwner,'RU04');
  assert.equal(policy.speechScenarioOwner,'RU05');
  assert.equal(policy.academicProductionOwner,'RU06');
  assert.equal(policy.authoringPromotionOwner,'RU08');
  assert.equal(policy.aiMayModifyMastery,false);
  assert.equal(policy.aiMayWritePlanner,false);
  assert.equal(policy.aiMayUnlockStage,false);
  assert.equal(policy.aiMayGenerateCanonicalContent,false);

  await page.evaluate(()=>window.RussianScenarioEngine.start(window.RussianScenarioEngine.scenarios()[0].id));
  await page.click('[data-view="writing"]');
  await page.waitForSelector('[data-writing="academic"]');
  await page.click('[data-writing="academic"]');
  await page.waitForSelector('#ruAcademicProduction');
  await page.fill('#ruProdSourceRef','doi:10.0000/grounding');
  await page.fill('#ruProdSourceNote','grounding source');
  await page.click('[data-ru-prod="source"]');
  await page.selectOption('#ruProdClaimType','source-fact');
  await page.fill('#ruProdClaimSource','doi:10.0000/grounding');
  await page.fill('#ruProdClaimText','Проверяемый факт из источника.');
  await page.click('[data-ru-prod="claim"]');

  const ctx=await page.evaluate(()=>window.RussianAIMentorGuard.buildContext());
  assert.equal(ctx.schema,'RUSSIAN_AI_MENTOR_CONTEXT_V2');
  assert(ctx.scenario?.runId,'scenario summary missing');
  assert.equal(Object.keys(ctx.scenario).sort().join(','),'nodeId,runId,scenarioId,status,supportLevel,turn');
  assert(ctx.production?.sourceRefs.includes('doi:10.0000/grounding'),'production source ref missing');
  assert.equal(ctx.production.authoritative,false);
  assert.equal(ctx.grounding.conversationSummaryCanonical,false);
  assert.equal(ctx.grounding.wholeDatasetDump,false);
  assert(Array.isArray(ctx.grounding.datasets)&&ctx.grounding.datasets.length>0,'RU03 trust summary missing');
  assert(ctx.grounding.datasets.some(x=>x.id==='performance-tasks'),'route-specific provenance missing');
  assert(ctx.grounding.datasets.every(x=>!('knownGaps' in x)),'AI grounding should not dump whole provenance rows');
  assert(ctx.grounding.datasets.every(x=>Array.isArray(x.sourceRefs)&&x.sourceRefs.length<=4),'source evidence must be bounded');

  const serialized=JSON.stringify(ctx);
  assert(serialized.length<45000,'AI minimum-necessary context unexpectedly large');
  for(const forbidden of ['"concepts":[','"tasks":[','"questions":[','"wholeDataset"']) assert(!serialized.includes(forbidden),'full dataset leaked into AI context: '+forbidden);

  await page.click('#aiBtn');
  await page.waitForSelector('[data-ru-ai-guard="1"]',{state:'visible'});
  const guard=await page.locator('[data-ru-ai-guard="1"]').textContent();
  assert.match(guard,/không sửa tiến độ/);
  assert.match(guard,/RU03 grounding/);
  assert.match(guard,/RU04 giữ quyền mastery/);

  await page.screenshot({path:path.join(OUT,'ai-grounding.png'),fullPage:true});
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({
    status:'PASS',
    activePolicy:'RU07',
    truthOwner:'RU03',
    masteryOwner:'RU04',
    scenarioOwner:'RU05',
    productionOwner:'RU06',
    sourceRefsBounded:true,
    fullDatasetDump:false,
    masteryWrite:false
  },null,2));
  console.log('Russian RU07 AI grounding browser journey PASS');
}finally{await browser?.close();}
