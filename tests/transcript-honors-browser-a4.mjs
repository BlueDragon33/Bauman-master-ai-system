import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/browser-a4';
fs.mkdirSync(OUT,{recursive:true});
const errors=[],failed=[];
const must=(c,m)=>{if(!c)throw new Error(m)};

async function mockControl(page){
  const deviceId='4'.repeat(64),deviceCode='BM-A4-001';
  const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{
    const req=route.request();if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const u=new URL(req.url()),headers={...cors,'content-type':'application/json'},send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
    if(u.pathname==='/api/device/register'||u.pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
    if(u.pathname==='/api/device/challenge')return send({challengeId:'challenge-a4',signingInput:`bauman-a4:${deviceId}`});
    if(u.pathname==='/api/device/verify')return send({sessionToken:'bm1.a4',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
    if(u.pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});
    return route.fulfill({status:404,headers,body:'{}'});
  });
}

const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();await mockControl(page);
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  page.on('requestfailed',r=>{if(!r.url().startsWith('http://127.0.0.1:3003/'))failed.push(`${r.method()} ${r.url()} ${r.failure()?.errorText||''}`)});
  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});
  const appOpen=await page.evaluate(()=>!document.getElementById('appRoot')?.classList.contains('hidden'));
  if(!appOpen){const login=page.locator('#loginBtn');if(await login.isVisible())await login.click()}
  await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:10000});
  await page.waitForFunction(()=>Boolean(window.BAUMAN_COURSE_READINESS_2026&&window.BAUMAN_EVENT_READINESS_2026),null,{timeout:15000});

  assert.equal(await page.locator('#page-home [data-transcript14e="ledger"]').count(),0,'A4 must not add Transcript/Honors ledger to Home');
  await page.evaluate(()=>window.app.openHomeFrame('progress'));
  await page.waitForSelector('#modalRoot [data-course14b-progress="s1"]');
  assert.ok(await page.locator('[data-a4-transcript-open]').count()>0,'Progress modal missing A4 Transcript/Honors action');
  await page.locator('[data-a4-transcript-open]').click();
  await page.waitForFunction(()=>Boolean(window.BAUMAN_TRANSCRIPT_HONORS_2026&&window.BAUMAN_DIPLOMA_HONORS_POLICY_2026),null,{timeout:15000});
  await page.waitForSelector('#modalRoot [data-transcript14e="ledger"]');

  const result=await page.evaluate(()=>{
    const t=window.BAUMAN_TRANSCRIPT_HONORS_2026,key='bauman_current_user_fullcode_v1';
    const rows=t.candidateRows(),fac=t.facultativeRows(),p=t.projection();
    const graded=rows.filter(r=>r.expectedNature==='graded'),credits=rows.filter(r=>r.expectedNature==='credit'),gia=graded.filter(r=>r.kind==='gia');
    const nonGia=graded.filter(r=>r.kind!=='gia');
    function payloadFor(r,value){
      return {entryVerified:true,source:'Verified academic record',selectedOptionId:r.kind==='elective_group'?(r.options?.[0]?.id||''):r.selectedOptionId,transcriptValue:value,notes:'A4 browser acceptance'};
    }
    for(const r of credits)t.recordEntry(r.rowId,payloadFor(r,'зачтено'));
    for(const r of graded)t.recordEntry(r.rowId,payloadFor(r,4));
    for(const r of gia)t.recordEntry(r.rowId,payloadFor(r,5));
    const needed=Math.max(0,p.requiredFiveIfProjectionConfirmed-gia.length);
    for(const r of nonGia.slice(0,needed))t.recordEntry(r.rowId,payloadFor(r,5));
    const meets=t.honorsEvaluation();

    const gradeFive=nonGia.find(r=>t.rawEntry(r.rowId)?.transcriptValue===5);
    t.recordEntry(gradeFive.rowId,payloadFor(gradeFive,4));
    const below=t.honorsEvaluation();
    t.recordEntry(gradeFive.rowId,payloadFor(gradeFive,3));
    const blocked=t.honorsEvaluation();

    const originalUser=localStorage.getItem(key);
    localStorage.setItem(key,JSON.stringify({email:'a4-other@example.test'}));
    const isolated=t.honorsEvaluation();
    localStorage.setItem(key,originalUser);

    return {
      rows:rows.length,facultatives:fac.length,projection:p,meets,below,blocked,isolated,
      homeSurfaceAdded:t.homeSurfaceAdded,eventAutoPromotion:t.eventAutoPromotion,
      schedulerMutation:t.schedulerMutation,courseCompletionMutation:t.courseCompletionMutation
    };
  });

  assert.equal(result.rows,27);assert.equal(result.projection.projectedGradeBearingRows,22);assert.equal(result.projection.projectedCreditRows,5);assert.equal(result.projection.requiredFiveIfProjectionConfirmed,17);
  assert.equal(result.meets.id,'HONORS_RULES_MET_ON_VERIFIED_LEDGER');
  assert.equal(result.meets.projectionCaveatActive,true);
  assert.equal(result.meets.finalEligibilityClaimed,false,'A4 must not claim final honors eligibility while denominator/mapping is projected');
  assert.equal(result.below.id,'EXCELLENT_SHARE_BELOW_75');
  assert.equal(result.blocked.id,'CURRENT_EVIDENCE_BLOCKS_HONORS');
  assert.equal(result.isolated.id,'EVIDENCE_INCOMPLETE');
  assert.equal(result.isolated.verifiedRows,0);
  assert.equal(result.homeSurfaceAdded,false);assert.equal(result.eventAutoPromotion,false);assert.equal(result.schedulerMutation,false);assert.equal(result.courseCompletionMutation,false);

  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});
  await page.waitForFunction(()=>Boolean(window.BAUMAN_EVENT_READINESS_2026),null,{timeout:15000});
  const persisted=await page.evaluate(async()=>{
    const g=await window.BAUMAN_EVENT_READINESS_2026.ensureGradeRuntime();
    const t=await g.ensureTranscriptRuntime();
    return t.honorsEvaluation();
  });
  assert.equal(persisted.complete,true);assert.equal(persisted.id,'CURRENT_EVIDENCE_BLOCKS_HONORS');

  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>window.app.openHomeFrame('progress'));
  await page.waitForSelector('#modalRoot [data-course14b-progress="s1"]');
  await page.locator('[data-a4-transcript-open]').click();
  await page.waitForSelector('#modalRoot [data-transcript14e="ledger"]');
  const mobile=await page.evaluate(()=>{const root=document.querySelector('#modalRoot [data-transcript14e="ledger"]');return{client:root?.clientWidth||0,scroll:root?.scrollWidth||0}});
  must(mobile.scroll<=mobile.client+2,`A4 mobile overflow: ${JSON.stringify(mobile)}`);
  await page.screenshot({path:path.join(OUT,'a4-transcript-mobile.png'),fullPage:true});

  must(errors.length===0,`Page errors: ${errors.join('\n')}`);must(failed.length===0,`Unexpected failed requests: ${failed.join('\n')}`);
  fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify({status:'PASS',result,persisted,mobile},null,2));
  console.log('A4_TRANSCRIPT_HONORS_BROWSER_PASS');
}finally{await browser.close()}
