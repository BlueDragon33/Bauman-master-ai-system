import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-ru05-ru08-acceptance';
fs.mkdirSync(OUT,{recursive:true});
const RU='subjects/russian/index.html';
const EDITOR='subjects/russian/editor.html';
const protectedKeys=['bauman_russian_assessment_mastery_v1','bauman_russian_personalization_v1','bauman_russian_vocab_srs_v1'];
let browser;
async function openRussian(context,viewportLabel){
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto(new URL(RU,BASE).href,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.RussianScenarioRuntime&&window.RussianProductionWorkbench&&window.RussianAIMentorGuard,null,{timeout:30000});
  await page.waitForFunction(()=>window.RussianScenarioRuntime.registry()?.scenarios?.length>=7,null,{timeout:30000});
  return {page,errors,viewportLabel};
}
async function completeScenario(page,id){
  await page.selectOption('[data-ru-scenario-select]',id);
  await page.locator('[data-ru-scenario-start]').click();
  for(let guard=0;guard<12;guard++){
    const cur=await page.evaluate(()=>window.RussianScenarioRuntime.current());
    if(cur.state?.completed)return cur;
    const repair=await page.locator('[data-ru-scenario-repair]').first();
    if(await repair.count())await repair.click();
    const next=page.locator('[data-ru-scenario-next]').first();
    if(await next.count())await next.click();
    else await page.evaluate(()=>window.RussianScenarioRuntime.advance());
  }
  throw new Error('Scenario did not complete: '+id);
}
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const desktop=await browser.newContext({viewport:{width:1440,height:900}});
  const {page,errors}=await openRussian(desktop,'desktop');

  const registry=await page.evaluate(()=>window.RussianScenarioRuntime.registry());
  assert.deepEqual(new Set(registry.scenarios.map(x=>x.family)),new Set(['real-life','administration','classroom','lab','seminar','research','defense']));
  assert.equal(window===undefined,false);
  await page.click('#nav [data-view="dialogue"]');
  await page.waitForSelector('[data-ru-scenario-runner]',{state:'visible',timeout:10000});
  const protectedBefore=await page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),protectedKeys);
  const representative=[
    ['P11-LIFE-ROOMMATE','survival'],
    ['P11-LAB-TASK','university-technical'],
    ['P11-RESEARCH-NIR','research'],
    ['P11-DEFENSE-COMMISSION','defense']
  ];
  for(const [id,label] of representative){
    const done=await completeScenario(page,id);
    assert.equal(done.state.completed,true,label+' scenario did not complete');
    assert.equal(done.state.completion,'practice',label+' completion must remain practice-only');
  }
  const protectedAfter=await page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),protectedKeys);
  assert.deepEqual(protectedAfter,protectedBefore,'RU05 scenario practice must not mutate mastery/planner/vocab stores');

  await page.selectOption('[data-ru-scenario-select]','P11-RESEARCH-NIR');
  await page.locator('[data-ru-scenario-start]').click();
  await page.locator('[data-ru-scenario-next]').first().click();
  assert.equal((await page.evaluate(()=>window.RussianScenarioRuntime.current().state.nodeId)),'challenge');
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.RussianScenarioRuntime?.registry?.()?.scenarios?.length>=7,null,{timeout:30000});
  await page.click('#nav [data-view="dialogue"]');
  await page.waitForSelector('[data-ru-scenario-runner]',{state:'visible',timeout:10000});
  assert.equal((await page.evaluate(()=>window.RussianScenarioRuntime.current().state.nodeId)),'challenge','Scenario session must resume after refresh in the same tab');

  await page.click('#aiBtn');
  await page.waitForSelector('[data-ru-ai-guard]',{state:'visible',timeout:10000});
  const ai=await page.evaluate(()=>({policy:window.RussianAIMentorGuard.policy(),text:document.querySelector('[data-ru-ai-guard]')?.textContent||''}));
  assert.equal(ai.policy.aiMayModifyMastery,false);
  assert.equal(ai.policy.masteryReadOnly,true);
  assert.match(ai.text,/không sửa tiến độ/i);
  await page.keyboard.press('Escape');

  await page.selectOption('#stageSelect','hk2');
  await page.click('#nav [data-view="writing"]');
  await page.waitForSelector('[data-writing="academic"]',{timeout:10000});
  await page.click('[data-writing="academic"]');
  await page.waitForSelector('[data-ru-production-workbench]',{state:'visible',timeout:10000});
  await page.selectOption('[data-ru-production-target]','R16');
  const technical=await page.evaluate(()=>window.RussianProductionWorkbench.bundle('R16'));
  assert.ok(technical.concepts.length,'R16 technical concepts missing from runtime');
  assert.ok(technical.functions.length,'R16 academic functions missing from runtime');
  assert.ok(technical.reading.length,'R16 reading contract missing from runtime');
  assert.ok(technical.performance.length,'R16 performance task missing from runtime');

  await page.selectOption('#stageSelect','hk3');
  await page.click('#nav [data-view="writing"]');
  await page.click('[data-writing="academic"]');
  await page.waitForSelector('[data-ru-production-workbench]',{state:'visible',timeout:10000});
  await page.selectOption('[data-ru-production-target]','R20');
  const research=await page.evaluate(()=>window.RussianProductionWorkbench.bundle('R20'));
  assert.ok(research.functions.length&&research.reading.length&&research.performance.length,'R20 research production chain incomplete');
  assert.equal(await page.evaluate(()=>window.RussianProductionWorkbench.policy.writesMastery),false);
  assert.ok(await page.locator('[data-input="writingDraft"],.writing-studio textarea').count(),'Writing production surface missing');

  assert.equal(await page.locator('#authoringBtn').count(),1,'RU08 authoring surface must be reachable from Russian UI');
  assert.deepEqual(errors,[],'desktop RU05-RU08 acceptance emitted console/page errors');
  await page.screenshot({path:path.join(OUT,'desktop.png'),fullPage:true});

  const mobile=await browser.newContext({viewport:{width:390,height:844}});
  const m=await openRussian(mobile,'mobile');
  await m.page.click('#nav [data-view="dialogue"]');
  await m.page.waitForSelector('[data-ru-scenario-runner]',{state:'visible',timeout:10000});
  const mobileOverflow=await m.page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert.ok(mobileOverflow<=2,'Scenario runtime horizontally overflows mobile by '+mobileOverflow+'px');
  await m.page.selectOption('#stageSelect','hk2');
  await m.page.click('#nav [data-view="writing"]');
  await m.page.click('[data-writing="academic"]');
  await m.page.waitForSelector('[data-ru-production-workbench]',{state:'visible',timeout:10000});
  const productionOverflow=await m.page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert.ok(productionOverflow<=2,'Production workbench horizontally overflows mobile by '+productionOverflow+'px');
  assert.deepEqual(m.errors,[],'mobile RU05-RU08 acceptance emitted console/page errors');
  await m.page.screenshot({path:path.join(OUT,'mobile.png'),fullPage:true});

  const author=await desktop.newPage(),authorErrors=[];
  author.on('pageerror',e=>authorErrors.push(String(e?.stack||e)));
  author.on('console',m=>{if(m.type()==='error')authorErrors.push(m.text())});
  await author.goto(new URL(EDITOR,BASE).href,{waitUntil:'domcontentloaded',timeout:30000});
  await author.waitForFunction(()=>window.RussianAuthoringWorkbench,null,{timeout:30000});
  assert.equal(await author.locator('#ruAdvancedJson').getAttribute('open'),null,'Raw JSON must not be default authoring surface');
  assert.equal(await author.evaluate(()=>window.RussianAuthoringWorkbench.policy.directCanonicalWrite),false);
  await author.selectOption('#ruResponsibility','TechnicalConcept');
  await author.fill('#ruCanonicalId','TC-AUDIT-001');
  await author.fill('#ruDiffSummary','Acceptance fixture only; no canonical write.');
  await author.fill('#ruRollbackNote','Discard candidate fixture.');
  await author.fill('#ruSourceRefs','source:audit-fixture');
  const fills={id:'TC-AUDIT-001',domain:'automation',ru:'система',en:'system',vi:'hệ thống',authorityStatus:'UNVERIFIED',sourceRefs:'source:audit-fixture'};
  for(const [k,v] of Object.entries(fills))await author.fill('[data-payload-field="'+k+'"]',v);
  await author.click('#ruValidateCandidate');
  await author.waitForFunction(()=>/PASS/.test(document.querySelector('#ruValidationResult')?.textContent||''),null,{timeout:10000});
  await author.click('#ruReviewEnvelope');
  const envelope=JSON.parse(await author.locator('#ruCandidateJson').textContent());
  assert.equal(envelope.reviewEnvelope.metadataOnly,true);
  assert.equal(envelope.reviewEnvelope.sourcePath,'subjects/russian/data/technical-concepts.json');
  assert.equal(envelope.candidate.canonicalPatched,false);
  assert.deepEqual(authorErrors,[],'RU08 authoring browser emitted console/page errors');
  await author.screenshot({path:path.join(OUT,'authoring.png'),fullPage:true});

  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',scenarios:representative.map(x=>x[0]),technicalTarget:'R16',researchTarget:'R20',authoring:'metadata-only'},null,2));
  console.log('Russian RU05-RU08 executable acceptance PASS');
}finally{await browser?.close()}