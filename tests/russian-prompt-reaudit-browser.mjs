import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-prompt-reaudit';
fs.mkdirSync(OUT,{recursive:true});
const subjectUrl=new URL('subjects/russian/index.html',BASE).href;
const editorUrl=new URL('subjects/russian/editor.html',BASE).href;
let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  let page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  await page.goto(subjectUrl,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.RussianLinguisticAuthority?.status?.().ready===true&&window.RussianScenarioRuntime?.status?.().ready===true&&window.RussianAcademicProduction?.status?.().ready===true,{timeout:20000});

  const authority=await page.evaluate(async()=>{
    const tech=await fetch('data/technical-concepts.json').then(r=>r.json());
    const verified=tech.concepts.find(x=>x.authorityStatus==='VERIFIED');
    const asserted=tech.concepts.find(x=>x.authorityStatus==='SOURCE_ASSERTED');
    return {
      status:window.RussianLinguisticAuthority.status(),
      vocab:window.RussianLinguisticAuthority.guard('vocab',null,{authoritativeUse:true}),
      verified:window.RussianLinguisticAuthority.guard('technical-concepts',verified,{authoritativeUse:true}),
      asserted:window.RussianLinguisticAuthority.guard('technical-concepts',asserted,{authoritativeUse:true}),
      unknown:window.RussianLinguisticAuthority.guard('missing-dataset',null,{authoritativeUse:true})
    };
  });
  assert.equal(authority.status.policy,'FAIL_CLOSED');
  assert.equal(authority.vocab.allowed,false,'UNVERIFIED vocab must fail closed for authoritative use');
  assert.equal(authority.verified.allowed,true,'VERIFIED technical term with external source must be authoritative');
  assert.equal(authority.asserted.allowed,false,'SOURCE_ASSERTED term must not be promoted to authority');
  assert.equal(authority.unknown.allowed,false,'Unknown dataset must fail closed');

  const scenario=await page.evaluate(()=>{
    localStorage.removeItem('bauman_russian_scenario_runtime_v1');
    const api=window.RussianScenarioRuntime;
    api.reset();
    const start=api.start('P11-LIFE-ROOMMATE');
    const toClarify=api.advance('clarify');
    const repair=api.repair('ask-repeat');
    const done=api.advance('close');
    const assessment=window.RussianAssessmentMastery?.exportState?.()||{};
    return {start,toClarify,repair,done,context:api.context(),stored:JSON.parse(localStorage.getItem('bauman_russian_scenario_runtime_v1')),mastery:assessment.mastery?.['scenario:P11-LIFE-ROOMMATE']||null};
  });
  assert.equal(scenario.start.ok,true);assert.equal(scenario.toClarify.ok,true);assert.equal(scenario.repair.ok,true);assert.equal(scenario.done.ok,true);
  assert.equal(scenario.context.completed,true);assert.equal(scenario.context.repairUsed.length,1);assert.equal(scenario.mastery,null,'Scenario practice completion must not create mastery');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.RussianScenarioRuntime?.status?.().ready===true,{timeout:15000});
  const resumed=await page.evaluate(()=>window.RussianScenarioRuntime.context());
  assert.equal(resumed.scenarioId,'P11-LIFE-ROOMMATE');assert.equal(resumed.completed,true,'Scenario state must survive refresh');

  const production=await page.evaluate(async()=>{
    const api=window.RussianAcademicProduction;
    const status=api.status();
    const tasks=api.tasks();
    const ta=await fetch('data/technical-concepts.json').then(r=>r.json());
    const verified=ta.concepts.find(x=>x.authorityStatus==='VERIFIED');
    const asserted=ta.concepts.find(x=>x.authorityStatus==='SOURCE_ASSERTED');
    const el=document.createElement('textarea');el.id='ruProdDraft';el.value='Черновик исследовательского ответа с ограничением.';document.body.append(el);
    api.snapshot('browser-acceptance');
    const state=api.get();
    const assessment=window.RussianAssessmentMastery?.exportState?.()||{};
    return {status,tasks:tasks.length,verified:api.authority('technical-concepts',verified,true),asserted:api.authority('technical-concepts',asserted,true),snapshots:state.snapshots.length,masteryKeys:Object.keys(assessment.mastery||{}).filter(k=>k.startsWith('academic-production:'))};
  });
  assert.deepEqual(new Set(production.status.datasets),new Set(['technical-concepts','academic-functions','reading','performance-tasks']));
  assert.ok(production.tasks>0,'RU06 runtime must expose stage-aware performance tasks');
  assert.equal(production.verified.allowed,true);assert.equal(production.asserted.allowed,false);assert.ok(production.snapshots>0);assert.deepEqual(production.masteryKeys,[],'Production snapshots must not auto-write mastery');

  await page.locator('#aiBtn').click();
  await page.waitForSelector('[data-ru-ai-guard]',{state:'visible',timeout:10000});
  const ai=await page.evaluate(()=>({provider:window.RussianAIMentorGuard.provider(),mode:document.querySelector('[data-ru-ai-guard]')?.dataset.providerMode,label:document.querySelector('[data-ru-ai-guard] b')?.textContent,run:document.querySelector('[data-act="ai-run"]')?.textContent}));
  assert.equal(ai.provider.available,false);assert.equal(ai.mode,'DETERMINISTIC_FALLBACK');assert.match(ai.label,/không gọi model/i);assert.match(ai.run,/cục bộ/i);
  await page.screenshot({path:path.join(OUT,'learner-runtime.png'),fullPage:true});
  assert.deepEqual(errors,[],'Learner runtime page errors: '+errors.join('\n'));

  page=await context.newPage();const editorErrors=[];page.on('pageerror',e=>editorErrors.push(String(e?.stack||e)));
  await page.goto(editorUrl,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.RussianAuthoringWorkbench&&document.querySelectorAll('#responsibility option').length>5,{timeout:15000});
  assert.equal(await page.locator('[data-russian-authoring-workbench="1"]').count(),1);
  assert.equal(await page.locator('details[data-advanced-raw-json="1"]').evaluate(el=>el.open),false,'Raw JSON must not be the default authoring surface');
  assert.equal(await page.getByText(/Publish canonical/i).count(),0,'Browser workbench must not expose direct canonical publish');
  await page.selectOption('#responsibility','LexicalEntry');
  await page.fill('#canonicalId','LEX-REAUDIT-001');await page.fill('#revision','r1');await page.fill('#sourceRefs','GOST TEST SOURCE');await page.fill('#diffSummary','Browser acceptance candidate');await page.fill('#rollbackNote','Restore previous canonical item');
  await page.locator('[data-payload-field="ru"]').fill('пример');
  await page.locator('[data-author-action="validate"]').click();
  await page.waitForFunction(()=>document.getElementById('candidateState')?.textContent==='VALIDATED',{timeout:5000});
  await page.locator('[data-author-action="review"]').click();
  await page.waitForFunction(()=>document.getElementById('candidateState')?.textContent==='REVIEW_REQUESTED',{timeout:5000});
  const candidate=await page.evaluate(()=>({c:window.RussianAuthoringWorkbench.get(),review:window.RussianAuthoringWorkbench.reviewEnvelope(),patch:window.RussianAuthoringWorkbench.patchPacket()}));
  assert.equal(candidate.c.state,'REVIEW_REQUESTED');assert.equal(candidate.review.metadataOnly,true);assert.match(candidate.patch.warning,/NO_DIRECT_CANONICAL_WRITE/);assert.ok(candidate.patch.canonicalOwner?.endsWith('/vocab.json'));
  await page.screenshot({path:path.join(OUT,'authoring-workbench.png'),fullPage:true});
  assert.deepEqual(editorErrors,[],'Authoring page errors: '+editorErrors.join('\n'));
  await context.close();
  console.log('Russian prompt re-audit browser acceptance: PASS');
} finally {await browser?.close();}
