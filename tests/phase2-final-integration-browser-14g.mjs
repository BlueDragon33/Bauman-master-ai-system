import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/browser-14g';
fs.mkdirSync(OUT,{recursive:true});
const errors=[],failed=[];const must=(v,m)=>assert.ok(v,m);

async function mockControl(page){
  const deviceId='e'.repeat(64),deviceCode='BM-14G-001',cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{
    const req=route.request();if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const u=new URL(req.url()),headers={...cors,'content-type':'application/json'};const send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
    if(u.pathname==='/api/device/register'||u.pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
    if(u.pathname==='/api/device/challenge')return send({challengeId:'challenge-14g',signingInput:`bauman-14g:${deviceId}`});
    if(u.pathname==='/api/device/verify')return send({sessionToken:'bm1.14g',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
    if(u.pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});
    return route.fulfill({status:404,headers,body:'{}'});
  });
}

async function waitStack(page){
  await page.waitForFunction(()=>Boolean(
    window.BAUMAN_ACADEMIC_2026_RUNTIME&&
    window.BAUMAN_COURSE_READINESS_2026&&
    window.BAUMAN_EVENT_READINESS_2026&&
    window.BAUMAN_GRADE_CONTROL_2026&&
    window.BAUMAN_TRANSCRIPT_HONORS_2026&&
    window.BAUMAN_ACADEMIC_COMMAND_CENTER_2026&&
    window.app?.__command14fPatched
  ),null,{timeout:20000});
  await page.waitForSelector('[data-command14f="center"]');
}

const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();await mockControl(page);
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));page.on('requestfailed',r=>{if(!r.url().startsWith('http://127.0.0.1:3003/'))failed.push(`${r.method()} ${r.url()} ${r.failure()?.errorText||''}`)});
  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});
  if(await page.locator('#appRoot.hidden').count())await page.locator('#loginBtn').click();
  await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:10000});
  await waitStack(page);

  const flow=await page.evaluate(()=>{
    const p1=window.BAUMAN_ACADEMIC_2026_RUNTIME,course=window.BAUMAN_COURSE_READINESS_2026,event=window.BAUMAN_EVENT_READINESS_2026,grade=window.BAUMAN_GRADE_CONTROL_2026,transcript=window.BAUMAN_TRANSCRIPT_HONORS_2026,cmd=window.BAUMAN_ACADEMIC_COMMAND_CENTER_2026;
    const userKey='bauman_current_user_fullcode_v1',txKey='bauman_academic_2026_schedule_transactions_v1';
    const originalUser=localStorage.getItem(userKey),scheduleBefore=JSON.stringify(window.state?.schedule||{}),txBefore=localStorage.getItem(txKey);
    const initial={d01:course.prereqAxis('d01'),d04:course.prereqAxis('d04'),d15Event:event.eventState('d15','Экз'),d15Grade:grade.resultState('d15','Экз'),d04Transcript:transcript.entryState('d04'),honors:transcript.honorsEvaluation(),command:cmd.courseCommand('d04')};

    let d15EventWriteBlocked=false,d15GradeWriteBlocked=false;
    try{event.recordEvidence('d15','Экз',{requirementsVerified:true,requirementSource:'should remain blocked',allVerifiedRequirementsMet:true,criticalOpenIssues:0,rehearsalScore:99})}catch{d15EventWriteBlocked=true}
    try{grade.recordResult('d15','Экз',{resultConfirmed:true,resultSource:'should remain blocked',numericScore:99})}catch{d15GradeWriteBlocked=true}

    for(const g of ['P2','P3','P10'])p1.recordDiagnostic(g,{D0:92,D1:92,D2:92,criticalMisconceptions:0,failedNodeIds:[]});
    const afterPrereq={course:course.prereqAxis('d04'),event:event.courseEventAxis('d04'),grade:grade.resultState('d04','Экз'),transcript:transcript.entryState('d04'),command:cmd.courseCommand('d04')};

    event.recordEvidence('d04','Экз',{requirementsVerified:true,requirementSource:'Verified exam requirements',allVerifiedRequirementsMet:true,criticalOpenIssues:0,rehearsalScore:94});
    event.recordEvidence('d04','ДЗчт',{requirementsVerified:true,requirementSource:'Verified differentiated-credit requirements',allVerifiedRequirementsMet:true,criticalOpenIssues:0,rehearsalScore:93});
    const afterEvents={event:event.courseEventAxis('d04'),transcript:transcript.entryState('d04'),command:cmd.courseCommand('d04')};

    grade.recordResult('d04','Экз',{resultConfirmed:true,resultSource:'Official LMS result',numericScore:92,officialGrade:5});
    const afterGrade={grade:grade.resultState('d04','Экз'),transcript:transcript.entryState('d04'),honors:transcript.honorsEvaluation(),command:cmd.courseCommand('d04')};

    transcript.recordEntry('d04',{entryVerified:true,source:'Registrar draft transcript',transcriptValue:5});
    const afterTranscript={transcript:transcript.entryState('d04'),honors:transcript.honorsEvaluation(),command:cmd.courseCommand('d04')};

    grade.recordResult('d06','Экз',{resultConfirmed:true,resultSource:'Official LMS result',numericScore:96,officialGrade:5});
    transcript.recordEntry('d06',{entryVerified:true,source:'Registrar draft transcript',transcriptValue:3});
    const conflict={grade:grade.resultState('d06','Экз'),transcript:transcript.entryState('d06'),command:cmd.courseCommand('d06'),honors:transcript.honorsEvaluation()};

    const scheduleAfter=JSON.stringify(window.state?.schedule||{}),txAfter=localStorage.getItem(txKey);
    localStorage.setItem(userKey,JSON.stringify({email:'phase2-isolated@example.test',name:'Phase2 Isolated'}));
    const isolated={d04Prereq:course.prereqAxis('d04'),d04Event:event.eventState('d04','Экз'),d04Grade:grade.resultState('d04','Экз'),d04Transcript:transcript.entryState('d04'),d06Command:cmd.courseCommand('d06'),honors:transcript.honorsEvaluation()};
    if(originalUser==null)localStorage.removeItem(userKey);else localStorage.setItem(userKey,originalUser);

    window.app.home();window.app.home();window.app.home();
    const panels={base:document.querySelectorAll('[data-academic2026="home"]').length,course:document.querySelectorAll('[data-course14b="s1"]').length,event:document.querySelectorAll('[data-event14c="ledger"]').length,grade:document.querySelectorAll('[data-grade14d="ledger"]').length,transcript:document.querySelectorAll('[data-transcript14e="ledger"]').length,command:document.querySelectorAll('[data-command14f="center"]').length};
    return {initial,d15EventWriteBlocked,d15GradeWriteBlocked,afterPrereq,afterEvents,afterGrade,afterTranscript,conflict,isolated,scheduleUnchanged:scheduleBefore===scheduleAfter,transactionStoreUnchanged:txBefore===txAfter,panels};
  });

  assert.equal(flow.initial.d01.id,'UNASSESSED','d01 must remain local English readiness, not auto-ready');
  assert.equal(flow.initial.d15Event.reason,'timing_unresolved');assert.equal(flow.initial.d15Grade.reason,'timing_unresolved');
  assert.equal(flow.d15EventWriteBlocked,true,'Unresolved d15 event must reject readiness writes');assert.equal(flow.d15GradeWriteBlocked,true,'Unresolved d15 event must reject grade writes');
  assert.equal(flow.afterPrereq.course.id,'COURSE_READY');assert.equal(flow.afterPrereq.grade.id,'RESULT_UNRECORDED');assert.equal(flow.afterPrereq.transcript.id,'ENTRY_UNVERIFIED');
  assert.equal(flow.afterEvents.event.id,'EVENT_READY');assert.equal(flow.afterEvents.transcript.id,'ENTRY_UNVERIFIED','Event readiness must not promote transcript evidence');
  assert.equal(flow.afterGrade.grade.id,'RESULT_TARGET_MET');assert.equal(flow.afterGrade.transcript.id,'ENTRY_UNVERIFIED','Grade result must not auto-promote diploma supplement evidence');assert.equal(flow.afterGrade.honors.id,'EVIDENCE_INCOMPLETE');
  assert.equal(flow.afterTranscript.transcript.id,'ENTRY_GRADE_5');assert.equal(flow.afterTranscript.honors.finalEligibilityClaimed,false,'Partial verified ledger must not claim final honors eligibility');
  assert.equal(flow.conflict.grade.id,'RESULT_TARGET_MET');assert.equal(flow.conflict.transcript.id,'ENTRY_GRADE_3');assert.equal(flow.conflict.command.type,'HONORS_BLOCKER','Verified transcript blocker must outrank a good assessment result');assert.equal(flow.conflict.command.severity,'critical');assert.equal(flow.conflict.honors.id,'CURRENT_EVIDENCE_BLOCKS_HONORS');
  assert.equal(flow.isolated.d04Prereq.id,'UNASSESSED');assert.equal(flow.isolated.d04Event.id,'EVENT_UNASSESSED');assert.equal(flow.isolated.d04Grade.id,'RESULT_UNRECORDED');assert.equal(flow.isolated.d04Transcript.id,'ENTRY_UNVERIFIED');must(flow.isolated.d06Command.type!=='HONORS_BLOCKER','Cross-user transcript blocker leaked');assert.equal(flow.isolated.honors.id,'EVIDENCE_INCOMPLETE');
  assert.equal(flow.scheduleUnchanged,true,'Phase2 evidence flow must not mutate schedule');assert.equal(flow.transactionStoreUnchanged,true,'Phase2 evidence flow must not create scheduler transactions');
  for(const [name,count] of Object.entries(flow.panels))assert.equal(count,1,`${name} panel duplicated after repeated home renders`);

  await page.reload({waitUntil:'domcontentloaded',timeout:30000});await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});if(await page.locator('#appRoot.hidden').count())await page.locator('#loginBtn').click();await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:10000});await waitStack(page);
  const persisted=await page.evaluate(()=>({d04Prereq:window.BAUMAN_COURSE_READINESS_2026.prereqAxis('d04'),d04Event:window.BAUMAN_EVENT_READINESS_2026.courseEventAxis('d04'),d04Grade:window.BAUMAN_GRADE_CONTROL_2026.resultState('d04','Экз'),d04Transcript:window.BAUMAN_TRANSCRIPT_HONORS_2026.entryState('d04'),d06Transcript:window.BAUMAN_TRANSCRIPT_HONORS_2026.entryState('d06'),d06Command:window.BAUMAN_ACADEMIC_COMMAND_CENTER_2026.courseCommand('d06'),honors:window.BAUMAN_TRANSCRIPT_HONORS_2026.honorsEvaluation(),panels:document.querySelectorAll('[data-command14f="center"]').length}));
  assert.equal(persisted.d04Prereq.id,'COURSE_READY');assert.equal(persisted.d04Event.id,'EVENT_READY');assert.equal(persisted.d04Grade.id,'RESULT_TARGET_MET');assert.equal(persisted.d04Transcript.id,'ENTRY_GRADE_5');assert.equal(persisted.d06Transcript.id,'ENTRY_GRADE_3');assert.equal(persisted.d06Command.type,'HONORS_BLOCKER');assert.equal(persisted.honors.finalEligibilityClaimed,false);assert.equal(persisted.panels,1);

  await page.screenshot({path:path.join(OUT,'desktop-phase2-final-integration.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.app.home());await page.waitForSelector('[data-command14f="center"]');
  const mobile=await page.evaluate(()=>{const home=document.getElementById('page-home');return{client:home?.clientWidth||0,scroll:home?.scrollWidth||0,commandColumns:getComputedStyle(document.querySelector('.command14f-grid')).gridTemplateColumns,courseColumns:getComputedStyle(document.querySelector('.course14b-grid')).gridTemplateColumns}});
  must(mobile.scroll<=mobile.client+2,`Mobile overflow: ${JSON.stringify(mobile)}`);assert.equal(mobile.commandColumns.trim().split(/\s+/).length,1);assert.equal(mobile.courseColumns.trim().split(/\s+/).length,1);
  await page.screenshot({path:path.join(OUT,'mobile-phase2-final-integration.png'),fullPage:true});

  must(errors.length===0,`Page errors: ${errors.join('\n')}`);must(failed.length===0,`Unexpected failed requests: ${failed.join('\n')}`);
  fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify({status:'PASS',flow,persisted,mobile},null,2));console.log('PASS14G_FINAL_INTEGRATION_BROWSER_PASS');
} finally {await browser.close()}
