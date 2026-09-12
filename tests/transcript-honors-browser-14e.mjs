import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/browser-14e';
fs.mkdirSync(OUT,{recursive:true});
const errors=[],failed=[];const must=(v,m)=>assert.ok(v,m);
async function mockControl(page){
  const deviceId='e'.repeat(64),deviceCode='BM-14E-001',cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{const req=route.request();if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});const u=new URL(req.url()),headers={...cors,'content-type':'application/json'};const send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});if(u.pathname==='/api/device/register'||u.pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});if(u.pathname==='/api/device/challenge')return send({challengeId:'challenge-14e',signingInput:`bauman-14e:${deviceId}`});if(u.pathname==='/api/device/verify')return send({sessionToken:'bm1.14e',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});if(u.pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});return route.fulfill({status:404,headers,body:'{}'});});
}

const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();await mockControl(page);
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));page.on('requestfailed',r=>{if(!r.url().startsWith('http://127.0.0.1:3003/'))failed.push(`${r.method()} ${r.url()} ${r.failure()?.errorText||''}`)});
  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});if(await page.locator('#appRoot.hidden').count())await page.locator('#loginBtn').click();await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:10000});
  await page.waitForFunction(()=>Boolean(window.BAUMAN_TRANSCRIPT_HONORS_2026&&window.BAUMAN_DIPLOMA_HONORS_POLICY_2026&&window.app?.__transcript14ePatched),null,{timeout:15000});await page.waitForSelector('[data-transcript14e="ledger"]');
  assert.equal(await page.locator('[data-transcript14e="ledger"]').count(),1);assert.equal(await page.locator('.transcript14e-row').count(),27);

  const result=await page.evaluate(()=>{
    const t=window.BAUMAN_TRANSCRIPT_HONORS_2026,g=window.BAUMAN_GRADE_CONTROL_2026,key='bauman_current_user_fullcode_v1';
    const beforeSchedule=JSON.stringify(window.state?.schedule?.entries||{}),projection=t.projection(),initial=t.honorsEvaluation();
    g.recordResult('d04','Экз',{resultConfirmed:true,resultSource:'Official LMS result',numericScore:92});
    const afterGradeButBeforeTranscript=t.entryState('d04');
    let noConfirm='';try{t.recordEntry('d04',{entryVerified:false,source:'Registrar',transcriptValue:5})}catch(err){noConfirm=String(err?.message||err)}
    let noSource='';try{t.recordEntry('d04',{entryVerified:true,source:'',transcriptValue:5})}catch(err){noSource=String(err?.message||err)}
    let electiveMissing='';try{t.recordEntry('e02',{entryVerified:true,source:'Registrar',transcriptValue:5})}catch(err){electiveMissing=String(err?.message||err)}
    const rows=t.candidateRows(),graded=rows.filter(x=>x.expectedNature==='graded'),credits=rows.filter(x=>x.expectedNature==='credit'),gia=graded.find(x=>x.kind==='gia'),nonGia=graded.filter(x=>x.rowId!==gia.rowId);
    const payloadFor=(r,value)=>({entryVerified:true,source:'Verified registrar draft',selectedOptionId:r.kind==='elective_group'?r.options[0].id:'',transcriptValue:value,notes:'browser14e'});
    for(const r of credits)t.recordEntry(r.rowId,payloadFor(r,'зачтено'));
    for(const r of graded)t.recordEntry(r.rowId,payloadFor(r,4));
    t.recordEntry(gia.rowId,payloadFor(gia,5));for(const r of nonGia.slice(0,16))t.recordEntry(r.rowId,payloadFor(r,5));
    const exactly75=t.honorsEvaluation();
    t.recordEntry(nonGia[0].rowId,payloadFor(nonGia[0],4));const below75=t.honorsEvaluation();
    t.recordEntry(nonGia[0].rowId,payloadFor(nonGia[0],3));const with3=t.honorsEvaluation();
    t.recordEntry(nonGia[0].rowId,payloadFor(nonGia[0],5));const restored=t.honorsEvaluation();
    const afterSchedule=JSON.stringify(window.state?.schedule?.entries||{}),originalUser=localStorage.getItem(key);localStorage.setItem(key,JSON.stringify({email:'other14e@example.test'}));const isolated=t.honorsEvaluation();localStorage.setItem(key,originalUser);
    return {projection,initial,afterGradeButBeforeTranscript,noConfirm,noSource,electiveMissing,exactly75,below75,with3,restored,scheduleUnchanged:beforeSchedule===afterSchedule,isolated,d04:t.rawEntry('d04')};
  });
  assert.equal(result.projection.baselineRows,27);assert.equal(result.projection.projectedGradeBearingRows,22);assert.equal(result.projection.projectedCreditRows,5);assert.equal(result.projection.requiredFiveIfProjectionConfirmed,17);assert.equal(result.projection.maximumFoursIfProjectionConfirmed,5);
  assert.equal(result.initial.id,'EVIDENCE_INCOMPLETE');assert.equal(result.afterGradeButBeforeTranscript.id,'ENTRY_UNVERIFIED','Pass14D assessment result must not auto-promote into transcript row');must(/xác nhận/.test(result.noConfirm),'Transcript evidence must require explicit verification');must(/nguồn/.test(result.noSource.toLowerCase()),'Transcript evidence must require a source');must(/tự chọn/.test(result.electiveMissing),'Elective row must require selected option');
  assert.equal(result.exactly75.id,'HONORS_RULES_MET_ON_VERIFIED_LEDGER');assert.equal(result.exactly75.fiveCount,17);assert.equal(result.exactly75.requiredFive,17);assert.equal(result.exactly75.excellentShare,17/22);assert.equal(result.exactly75.finalEligibilityClaimed,true);
  assert.equal(result.below75.id,'EXCELLENT_SHARE_BELOW_75');assert.equal(result.below75.fiveCount,16);assert.equal(result.with3.id,'CURRENT_EVIDENCE_BLOCKS_HONORS');must(result.with3.lowGradeRows.length===1,'Grade 3 must be identified as blocker');assert.equal(result.restored.id,'HONORS_RULES_MET_ON_VERIFIED_LEDGER');
  assert.equal(result.d04.autoPromotedFromAssessmentEvent,false);assert.equal(result.scheduleUnchanged,true);assert.equal(result.isolated.id,'EVIDENCE_INCOMPLETE');assert.equal(result.isolated.verifiedRows,0,'Transcript evidence must be isolated by current user');

  await page.evaluate(()=>{window.app.home();window.app.home()});assert.equal(await page.locator('[data-transcript14e="ledger"]').count(),1);await page.screenshot({path:path.join(OUT,'desktop-transcript-honors.png'),fullPage:true});
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});if(await page.locator('#appRoot.hidden').count())await page.locator('#loginBtn').click();await page.waitForFunction(()=>Boolean(window.BAUMAN_TRANSCRIPT_HONORS_2026&&window.app?.__transcript14ePatched),null,{timeout:15000});const persisted=await page.evaluate(()=>window.BAUMAN_TRANSCRIPT_HONORS_2026.honorsEvaluation());assert.equal(persisted.id,'HONORS_RULES_MET_ON_VERIFIED_LEDGER');assert.equal(persisted.verifiedRows,27);
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.app.home());await page.waitForSelector('[data-transcript14e="ledger"]');const mobile=await page.evaluate(()=>{const home=document.getElementById('page-home'),list=document.querySelector('.transcript14e-list');return{client:home?.clientWidth||0,scroll:home?.scrollWidth||0,columns:list?getComputedStyle(list).gridTemplateColumns:''}});must(mobile.scroll<=mobile.client+2,`Mobile overflow: ${JSON.stringify(mobile)}`);if(mobile.columns)assert.equal(mobile.columns.trim().split(/\s+/).length,1);await page.screenshot({path:path.join(OUT,'mobile-transcript-honors.png'),fullPage:true});
  must(errors.length===0,`Page errors: ${errors.join('\n')}`);must(failed.length===0,`Unexpected failed requests: ${failed.join('\n')}`);fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify({status:'PASS',result,persisted,mobile},null,2));console.log('PASS14E_BROWSER_ACCEPTANCE_PASS');
} finally {await browser.close()}
