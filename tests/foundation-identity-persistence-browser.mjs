import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/foundation-identity-persistence';
fs.mkdirSync(OUT,{recursive:true});

const legacySeed={
  bauman_russian_survival_master_v11_clean_skeleton:{view:'overview',stage:'vn',lessonId:'R01',unknown:{keep:true}},
  bauman_russian_learning_state_v1:{schema:'RUSSIAN_LEARNING_STATE_V1',resume:null,lastActivity:null,items:{'learning:theory:R01':{status:'in_progress'}},reviewQueue:{'vocab:12':{reason:'wrong'}},updatedAt:null},
  bauman_russian_learning_flow_v1:{schema:'RUSSIAN_LEARNING_FLOW_V1',lessons:{R01:{id:'R01',steps:{theory:{events:1}}}},updatedAt:null},
  bauman_russian_vocab_srs_v1:{schema:'RUSSIAN_VOCAB_SRS_V1',cards:{'vocab:12':{reviewCount:1}},sentences:{},updatedAt:null},
  bauman_russian_academic_language_v1:{schema:'RUSSIAN_ACADEMIC_LANGUAGE_V1',grammar:{G01:{ruleReads:1}},reading:{},writing:{},updatedAt:null}
};

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  await context.addInitScript(seed=>{
    if(!location.pathname.endsWith('/subjects/russian/index.html'))return;
    if(sessionStorage.getItem('foundationIdentityPersistenceSeeded')==='1')return;
    for(const [key,value] of Object.entries(seed))localStorage.setItem(key,JSON.stringify(value));
    localStorage.removeItem('bauman_identity_overlay_v1');
    localStorage.removeItem('bauman_identity_overlay_v1_staging');
    sessionStorage.setItem('foundationIdentityPersistenceSeeded','1');
  },legacySeed);
  const page=await context.newPage();
  const errors=[];
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});
  page.on('pageerror',error=>errors.push(String(error?.stack||error)));
  await page.goto(new URL('subjects/russian/index.html',BASE).href,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_FOUNDATION_IDENTITY_PERSISTENCE_REPORT?.status==='persisted',null,{timeout:10000});
  const first=await page.evaluate(()=>{
    const raw=localStorage.getItem('bauman_identity_overlay_v1');
    const envelope=raw?JSON.parse(raw):null;
    return{
      bootstrap:window.BAUMAN_FOUNDATION_IDENTITY_REPORT,
      persistence:window.BAUMAN_FOUNDATION_IDENTITY_PERSISTENCE_REPORT,
      raw,
      staging:localStorage.getItem('bauman_identity_overlay_v1_staging'),
      envelope,
      uiLeak:document.body.textContent.includes('BAUMAN_FOUNDATION_IDENTITY')||document.body.textContent.includes('IDENTITY_OVERLAY')
    };
  });
  assert.equal(first.bootstrap?.mode,'silent-read-only');
  assert.equal(first.persistence?.status,'persisted');
  assert.ok(first.persistence?.mappingCount>=5,'Too few persisted mappings');
  assert.equal(first.staging,null,'Staging key survived verified browser commit');
  assert.equal(first.envelope?.schema,'BAUMAN_IDENTITY_OVERLAY_STORE_V1');
  assert.equal(first.envelope?.overlay?.schema,'BAUMAN_IDENTITY_OVERLAY_V1');
  assert.equal(first.uiLeak,false,'Foundation identity debug text leaked into learner UI');

  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_FOUNDATION_IDENTITY_PERSISTENCE_REPORT?.status==='unchanged',null,{timeout:10000});
  const second=await page.evaluate(()=>({
    persistence:window.BAUMAN_FOUNDATION_IDENTITY_PERSISTENCE_REPORT,
    raw:localStorage.getItem('bauman_identity_overlay_v1'),
    staging:localStorage.getItem('bauman_identity_overlay_v1_staging')
  }));
  assert.equal(second.persistence?.status,'unchanged','Reload must not rewrite an identical overlay');
  assert.equal(second.raw,first.raw,'Idempotent reload changed persisted overlay bytes');
  assert.equal(second.staging,null,'Reload recreated staging for unchanged overlay');

  await page.evaluate(()=>localStorage.setItem('bauman_identity_overlay_v1','{"bad":true}'));
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_FOUNDATION_IDENTITY_PERSISTENCE_REPORT?.status==='blocked-corrupt',null,{timeout:10000});
  const corrupt=await page.evaluate(()=>({
    persistence:window.BAUMAN_FOUNDATION_IDENTITY_PERSISTENCE_REPORT,
    raw:localStorage.getItem('bauman_identity_overlay_v1'),
    staging:localStorage.getItem('bauman_identity_overlay_v1_staging')
  }));
  assert.equal(corrupt.raw,'{"bad":true}','Corrupt overlay was silently replaced');
  assert.equal(corrupt.staging,null,'Corrupt overlay created an automatic recovery staging write');
  assert.equal(corrupt.persistence?.status,'blocked-corrupt');
  assert.equal(errors.length,0,`Browser errors: ${errors.join('\n')}`);

  fs.writeFileSync(`${OUT}/summary.json`,JSON.stringify({status:'FOUNDATION_IDENTITY_PERSISTENCE_BROWSER_PASS',first:first.persistence,second:second.persistence,corrupt:corrupt.persistence},null,2));
  await page.screenshot({path:`${OUT}/russian-foundation-identity.png`,fullPage:false});
  console.log('FOUNDATION_IDENTITY_PERSISTENCE_BROWSER_PASS');
}finally{
  await browser?.close();
}
