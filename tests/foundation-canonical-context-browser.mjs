import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/foundation-canonical-context';
fs.mkdirSync(OUT,{recursive:true});

const seed={
  bauman_russian_survival_master_v11_clean_skeleton:{view:'learning',learnTab:'theory',stage:'vn',lessonId:'R01',slide:2},
  bauman_russian_learning_state_v1:{schema:'RUSSIAN_LEARNING_STATE_V1',resume:{route:{view:'learning',lessonId:'R01'}},lastActivity:null,items:{'learning:theory:R01':{status:'in_progress'}},reviewQueue:{'vocab:12':{reason:'wrong'}},updatedAt:null},
  bauman_russian_learning_flow_v1:{schema:'RUSSIAN_LEARNING_FLOW_V1',lessons:{R01:{id:'R01',steps:{theory:{events:1}}}},updatedAt:null},
  bauman_russian_vocab_srs_v1:{schema:'RUSSIAN_VOCAB_SRS_V1',cards:{'vocab:12':{reviewCount:1}},sentences:{},updatedAt:null},
  bauman_russian_academic_language_v1:{schema:'RUSSIAN_ACADEMIC_LANGUAGE_V1',grammar:{G01:{ruleReads:1}},reading:{},writing:{},updatedAt:null}
};
const legacyKeys=Object.keys(seed);

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  await context.addInitScript(seedValue=>{
    if(!location.pathname.endsWith('/subjects/russian/index.html'))return;
    if(sessionStorage.getItem('foundationCanonicalContextSeeded')==='1')return;
    for(const [key,value] of Object.entries(seedValue))localStorage.setItem(key,JSON.stringify(value));
    localStorage.removeItem('bauman_identity_overlay_v1');
    localStorage.removeItem('bauman_identity_overlay_v1_staging');
    sessionStorage.setItem('foundationCanonicalContextSeeded','1');
  },seed);
  const page=await context.newPage();
  const errors=[];
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});
  page.on('pageerror',error=>errors.push(String(error?.stack||error)));
  const url=new URL('subjects/russian/index.html?host=main&subjectId=russian&courseId=prep&taskId=task-context-01&missionId=mission-context-01',BASE).href;
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_FOUNDATION_IDENTITY_PROJECTION_REPORT?.status==='ready'&&window.RussianAIMentorGuard?.buildContext,null,{timeout:10000});

  const result=await page.evaluate(keys=>{
    const before=Object.fromEntries(keys.map(key=>[key,localStorage.getItem(key)]));
    const overlayBefore=localStorage.getItem('bauman_identity_overlay_v1');
    const ctx=window.RussianAIMentorGuard.buildContext();
    const after=Object.fromEntries(keys.map(key=>[key,localStorage.getItem(key)]));
    const overlayAfter=localStorage.getItem('bauman_identity_overlay_v1');
    return{
      ctx,
      before,
      after,
      overlayBefore,
      overlayAfter,
      adapterSchema:window.BaumanFoundationCanonicalContext?.schema||null,
      projection:window.BAUMAN_FOUNDATION_IDENTITY_PROJECTION_REPORT,
      visibleLeak:/BAUMAN_FOUNDATION_CANONICAL_CONTEXT_V1|bd:(?:knowledge|task|workflow):/.test(document.body.textContent||'')
    };
  },legacyKeys);

  assert.equal(result.adapterSchema,'BAUMAN_FOUNDATION_CANONICAL_CONTEXT_V1');
  assert.equal(result.ctx?.schema,'RUSSIAN_AI_MENTOR_CONTEXT_V1');
  assert.equal(result.ctx?.canonical?.status,'ready');
  assert.equal(result.ctx?.canonical?.durable,true);
  assert.equal(result.ctx?.policy?.canonicalIdentityReadOnly,true);
  assert.equal(result.ctx?.policy?.aiMayModifyMastery,false);
  assert.ok(result.ctx?.canonical?.canonical?.lesson?.startsWith('bd:'),'AI context missing lesson canonical identity');
  assert.ok(result.ctx?.canonical?.canonical?.route?.startsWith('bd:'),'AI context missing route canonical identity');
  assert.ok(result.ctx?.canonical?.canonical?.resume?.startsWith('bd:'),'AI context missing resume canonical identity');
  assert.ok(result.ctx?.canonical?.canonical?.review?.some(row=>row.legacyId==='vocab:12'&&row.canonicalId?.startsWith('bd:')),'AI context missing review canonical identity');
  assert.ok(result.ctx?.canonical?.canonical?.host?.subject?.startsWith('bd:'),'AI context missing host subject canonical identity');
  assert.ok(result.ctx?.canonical?.canonical?.host?.task?.startsWith('bd:'),'AI context missing host task canonical identity');
  assert.ok(result.ctx?.canonical?.canonical?.host?.mission?.startsWith('bd:'),'AI context missing host mission canonical identity');
  assert.deepEqual(result.after,result.before,'Building canonical AI context changed legacy storage bytes');
  assert.equal(result.overlayAfter,result.overlayBefore,'Building canonical AI context rewrote durable overlay bytes');
  assert.equal(result.visibleLeak,false,'Canonical IDs/schema leaked into learner-visible UI');
  assert.equal(errors.length,0,`Browser errors: ${errors.join('\n')}`);

  fs.writeFileSync(`${OUT}/summary.json`,JSON.stringify({status:'FOUNDATION_CANONICAL_CONTEXT_BROWSER_PASS',canonical:result.ctx.canonical,projection:result.projection},null,2));
  await page.screenshot({path:`${OUT}/russian-canonical-context.png`,fullPage:false});
  console.log('FOUNDATION_CANONICAL_CONTEXT_BROWSER_PASS');
}finally{
  await browser?.close();
}
