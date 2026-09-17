import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/foundation-identity-projection';
fs.mkdirSync(OUT,{recursive:true});

const seed={
  bauman_russian_survival_master_v11_clean_skeleton:{view:'learning',learnTab:'theory',lessonId:'R01',slide:2},
  bauman_russian_learning_state_v1:{schema:'RUSSIAN_LEARNING_STATE_V1',resume:{route:{view:'learning',lessonId:'R01'}},lastActivity:null,items:{'learning:theory:R01':{status:'in_progress'}},reviewQueue:{'vocab:12':{reason:'wrong'}},updatedAt:null},
  bauman_russian_learning_flow_v1:{schema:'RUSSIAN_LEARNING_FLOW_V1',lessons:{R01:{id:'R01',steps:{theory:{events:1}}}},updatedAt:null},
  bauman_russian_vocab_srs_v1:{schema:'RUSSIAN_VOCAB_SRS_V1',cards:{'vocab:12':{reviewCount:1}},sentences:{},updatedAt:null},
  bauman_russian_academic_language_v1:{schema:'RUSSIAN_ACADEMIC_LANGUAGE_V1',grammar:{G01:{ruleReads:1}},reading:{},writing:{},updatedAt:null}
};

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  await context.addInitScript(seedValue=>{
    if(!location.pathname.endsWith('/subjects/russian/index.html'))return;
    if(sessionStorage.getItem('foundationIdentityProjectionSeeded')==='1')return;
    for(const [key,value] of Object.entries(seedValue))localStorage.setItem(key,JSON.stringify(value));
    localStorage.removeItem('bauman_identity_overlay_v1');
    localStorage.removeItem('bauman_identity_overlay_v1_staging');
    sessionStorage.setItem('foundationIdentityProjectionSeeded','1');
  },seed);
  const page=await context.newPage();
  const errors=[];
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});
  page.on('pageerror',error=>errors.push(String(error?.stack||error)));
  const url=new URL('subjects/russian/index.html',BASE).href;
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_FOUNDATION_IDENTITY_PROJECTION_REPORT?.status==='ready',null,{timeout:10000});
  const first=await page.evaluate(()=>{
    const api=window.BaumanFoundationIdentityProjection;
    const rows=api?.list?.()||[];
    const sample=rows[0]||null;
    const resolved=sample?api.resolve(sample.legacy.systemId,sample.legacy.scope,sample.legacy.id):null;
    const projected=sample?api.projectRecord(sample.legacy.systemId,sample.legacy.scope,sample.legacy.id,{nested:{value:1}}):null;
    return{
      report:window.BAUMAN_FOUNDATION_IDENTITY_PROJECTION_REPORT,
      summary:api?.summary?.(),
      sample,
      resolved,
      projected,
      reverse:sample?api.reverse(sample.canonicalId):[],
      missing:api?.canonicalFor?.('russian-vocab-srs','card','definitely-missing')??'unexpected',
      overlayRaw:localStorage.getItem('bauman_identity_overlay_v1'),
      uiLeak:/BAUMAN_(?:CANONICAL|FOUNDATION)_IDENTITY|IDENTITY_OVERLAY/.test(document.body.textContent||'')
    };
  });
  assert.equal(first.report?.durable,true);
  assert.ok(first.report?.mappingCount>5,'Projection exposed too few durable mappings');
  assert.equal(first.summary?.status,'ready');
  assert.ok(first.sample?.canonicalId?.startsWith('bd:'),'Projection sample lacks canonical ID');
  assert.equal(first.resolved?.canonicalId,first.sample.canonicalId,'Browser projection resolve mismatch');
  assert.ok(first.reverse.some(row=>row.key===first.sample.key),'Browser reverse lookup mismatch');
  assert.equal(first.missing,null,'Unknown browser mapping must return null');
  assert.equal(first.projected?.record?.nested?.value,1,'Browser projected record missing clone');
  assert.equal(first.uiLeak,false,'Canonical projection debug text leaked into learner UI');
  const checksum=first.report.checksum;

  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_FOUNDATION_IDENTITY_PROJECTION_REPORT?.status==='ready',null,{timeout:10000});
  const second=await page.evaluate(()=>({report:window.BAUMAN_FOUNDATION_IDENTITY_PROJECTION_REPORT,overlayRaw:localStorage.getItem('bauman_identity_overlay_v1')}));
  assert.equal(second.report?.checksum,checksum,'Projection checksum changed on idempotent reload');
  assert.equal(second.overlayRaw,first.overlayRaw,'Projection reload rewrote durable overlay bytes');

  await page.evaluate(()=>localStorage.setItem('bauman_identity_overlay_v1','{"corrupt":true}'));
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_FOUNDATION_IDENTITY_PROJECTION_REPORT?.status==='blocked',null,{timeout:10000});
  const blocked=await page.evaluate(()=>({
    persistence:window.BAUMAN_FOUNDATION_IDENTITY_PERSISTENCE_REPORT,
    projection:window.BAUMAN_FOUNDATION_IDENTITY_PROJECTION_REPORT,
    rows:window.BaumanFoundationIdentityProjection?.list?.()||[],
    lookup:window.BaumanFoundationIdentityProjection?.canonicalFor?.('russian-vocab-srs','card','vocab:12')??null,
    raw:localStorage.getItem('bauman_identity_overlay_v1')
  }));
  assert.equal(blocked.persistence?.status,'blocked-corrupt');
  assert.equal(blocked.projection?.durable,false);
  assert.equal(blocked.rows.length,0,'Blocked projection retained stale mappings');
  assert.equal(blocked.lookup,null,'Blocked projection retained stale lookup');
  assert.equal(blocked.raw,'{"corrupt":true}','Projection path repaired corrupt overlay unexpectedly');
  assert.equal(errors.length,0,`Browser errors: ${errors.join('\n')}`);

  fs.writeFileSync(`${OUT}/summary.json`,JSON.stringify({status:'FOUNDATION_IDENTITY_PROJECTION_BROWSER_PASS',first:first.report,second:second.report,blocked:blocked.projection},null,2));
  await page.screenshot({path:`${OUT}/russian-foundation-projection.png`,fullPage:false});
  console.log('FOUNDATION_IDENTITY_PROJECTION_BROWSER_PASS');
}finally{
  await browser?.close();
}
