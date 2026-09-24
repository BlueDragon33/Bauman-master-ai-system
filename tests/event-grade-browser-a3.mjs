import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/browser-a3';
fs.mkdirSync(OUT,{recursive:true});
const errors=[],failed=[];const must=(v,m)=>assert.ok(v,m);

async function mockControl(page){
  const deviceId='3'.repeat(64),deviceCode='BM-A3-001';
  const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{
    const req=route.request();if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const u=new URL(req.url()),headers={...cors,'content-type':'application/json'},send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
    if(u.pathname==='/api/device/register'||u.pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
    if(u.pathname==='/api/device/challenge')return send({challengeId:'challenge-a3',signingInput:`bauman-a3:${deviceId}`});
    if(u.pathname==='/api/device/verify')return send({sessionToken:'bm1.a3',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
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

  assert.equal(await page.locator('#page-home [data-event14c="ledger"]').count(),0,'A3 must not add Event ledger to Home');
  assert.equal(await page.locator('#page-home [data-grade14d="ledger"]').count(),0,'A3 must not add Grade ledger to Home');
  assert.equal(await page.evaluate(()=>Boolean(window.BAUMAN_GRADE_CONTROL_2026)),false,'A3 Grade runtime must stay lazy before grade action');

  await page.evaluate(()=>window.app.openHomeFrame('progress'));await page.waitForSelector('#modalRoot [data-course14b-progress="s1"]');
  await page.evaluate(()=>window.openOfficialCoursePhase2('d04'));await page.waitForSelector('#modalRoot .course14b-modal');
  assert.ok(await page.getByRole('button',{name:'Readiness'}).count()>0,'course modal missing A3 readiness action');
  assert.ok(await page.getByRole('button',{name:'Kết quả'}).count()>0,'course modal missing A3 grade action');
  await page.getByRole('button',{name:'Kết quả'}).first().click();
  await page.waitForFunction(()=>Boolean(window.BAUMAN_GRADE_CONTROL_2026&&window.BAUMAN_GRADING_POLICY_2024),null,{timeout:15000});

  const result=await page.evaluate(()=>{
    const e=window.BAUMAN_EVENT_READINESS_2026,g=window.BAUMAN_GRADE_CONTROL_2026,c=window.BAUMAN_COURSE_READINESS_2026,key='bauman_current_user_fullcode_v1';
    const scheduleBefore=JSON.stringify(window.state?.schedule?.entries||{}),lifeBefore=c.lifecycleAxis('d04');
    const initialEvent=e.eventState('d04','Экз');
    const e89=e.recordEvidence('d04','Экз',{requirementsVerified:true,requirementSource:'Verified BMSTU requirement',allVerifiedRequirementsMet:true,criticalOpenIssues:0,rehearsalScore:89});
    const e92=e.recordEvidence('d04','Экз',{requirementsVerified:true,requirementSource:'Verified BMSTU requirement',allVerifiedRequirementsMet:true,criticalOpenIssues:0,rehearsalScore:92});
    const d02=e.recordEvidence('d02','Зчт',{requirementsVerified:true,requirementSource:'Verified course requirement',allVerifiedRequirementsMet:true,criticalOpenIssues:0});
    let eventLocked='';try{e.recordEvidence('d15','Экз',{requirementsVerified:true,requirementSource:'blocked',allVerifiedRequirementsMet:true,criticalOpenIssues:0,rehearsalScore:100})}catch(err){eventLocked=String(err?.message||err)}

    let noConfirm='';try{g.recordResult('d04','Экз',{resultConfirmed:false,resultSource:'LMS',numericScore:92})}catch(err){noConfirm=String(err?.message||err)}
    const g89=g.recordResult('d04','Экз',{resultConfirmed:true,resultSource:'Confirmed LMS result',numericScore:89});
    const g92=g.recordResult('d04','Экз',{resultConfirmed:true,resultSource:'Confirmed LMS result',numericScore:92});
    let mismatch='';try{g.recordResult('d04','ДЗчт',{resultConfirmed:true,resultSource:'Confirmed LMS result',numericScore:92,officialGrade:4})}catch(err){mismatch=String(err?.message||err)}
    const pass=g.recordResult('d02','Зчт',{resultConfirmed:true,resultSource:'Confirmed LMS result',outcome:'pass'});
    let gradeLocked='';try{g.recordResult('d15','Экз',{resultConfirmed:true,resultSource:'Confirmed LMS result',numericScore:100})}catch(err){gradeLocked=String(err?.message||err)}
    const stored=g.rawResult('d04','Экз'),originalUser=localStorage.getItem(key);
    localStorage.setItem(key,JSON.stringify({email:'a3-other@example.test'}));const isolated=g.resultState('d04','Экз');localStorage.setItem(key,originalUser);
    const scheduleAfter=JSON.stringify(window.state?.schedule?.entries||{}),lifeAfter=c.lifecycleAxis('d04');
    return {initialEvent,e89,e92,d02,eventLocked,noConfirm,g89,g92,mismatch,pass,gradeLocked,stored,isolated,scheduleUnchanged:scheduleBefore===scheduleAfter,lifeBefore,lifeAfter};
  });
  assert.equal(result.initialEvent.id,'EVENT_UNASSESSED');assert.equal(result.e89.id,'EVENT_PREPARING');assert.equal(result.e92.id,'EVENT_READY');assert.equal(result.d02.id,'EVENT_READY');
  must(/timing/.test(result.eventLocked),'unresolved Event timing must be blocked');
  must(/xác nhận/.test(result.noConfirm),'unconfirmed grade must be rejected');
  assert.equal(result.g89.id,'RESULT_EXCELLENT_BELOW_TARGET');assert.equal(result.g92.id,'RESULT_TARGET_MET');must(/không nhất quán/.test(result.mismatch),'score/grade mismatch must reject');
  assert.equal(result.pass.id,'CREDIT_PASSED');must(/timing/.test(result.gradeLocked),'unresolved grade timing must be blocked');
  assert.equal(result.stored.supplementEntryVerified,false);assert.equal(result.stored.supplementEntryCounted,null);
  assert.equal(result.isolated.id,'RESULT_UNRECORDED');assert.equal(result.scheduleUnchanged,true);assert.equal(result.lifeBefore.id,result.lifeAfter.id);

  const clearGuard=await page.evaluate(()=>{
    const g=window.BAUMAN_GRADE_CONTROL_2026;
    window.confirm=()=>false;
    window.clearAcademicGradeResult2026('d04','Экз');
    const afterCancel=g.resultState('d04','Экз').id;
    window.confirm=()=>true;
    window.clearAcademicGradeResult2026('d04','Экз');
    const afterConfirm=g.resultState('d04','Экз').id;
    const restored=g.recordResult('d04','Экз',{resultConfirmed:true,resultSource:'Confirmed LMS result',numericScore:92}).id;
    return {afterCancel,afterConfirm,restored};
  });
  assert.equal(clearGuard.afterCancel,'RESULT_TARGET_MET','Cancelling destructive clear must preserve the confirmed grade');
  assert.equal(clearGuard.afterConfirm,'RESULT_UNRECORDED','Confirmed destructive clear must remove the grade');
  assert.equal(clearGuard.restored,'RESULT_TARGET_MET','Grade must remain writable after a confirmed clear');

  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});
  await page.waitForFunction(()=>Boolean(window.BAUMAN_EVENT_READINESS_2026),null,{timeout:15000});
  await page.evaluate(()=>window.BAUMAN_EVENT_READINESS_2026.ensureGradeRuntime());
  await page.waitForFunction(()=>Boolean(window.BAUMAN_GRADE_CONTROL_2026&&window.BAUMAN_GRADING_POLICY_2024),null,{timeout:15000});
  const persisted=await page.evaluate(()=>({event:window.BAUMAN_EVENT_READINESS_2026.eventState('d04','Экз'),grade:window.BAUMAN_GRADE_CONTROL_2026.resultState('d04','Экз')}));
  assert.equal(persisted.event.id,'EVENT_READY');assert.equal(persisted.grade.id,'RESULT_TARGET_MET');

  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.app.openHomeFrame('progress'));await page.waitForSelector('#modalRoot [data-course14b-progress="s1"]');
  const mobile=await page.evaluate(()=>{const root=document.querySelector('#modalRoot [data-course14b-progress="s1"]');return{client:root?.clientWidth||0,scroll:root?.scrollWidth||0}});
  must(mobile.scroll<=mobile.client+2,`A3 mobile overflow: ${JSON.stringify(mobile)}`);
  await page.screenshot({path:path.join(OUT,'a3-progress-mobile.png'),fullPage:true});

  must(errors.length===0,`Page errors: ${errors.join('\n')}`);must(failed.length===0,`Unexpected failed requests: ${failed.join('\n')}`);
  fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify({status:'PASS',result,persisted,mobile},null,2));
  console.log('A3_EVENT_GRADE_BROWSER_PASS');
}finally{await browser.close()}
