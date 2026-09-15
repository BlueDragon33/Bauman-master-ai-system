import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/browser-14f';
fs.mkdirSync(OUT,{recursive:true});
const errors=[],failed=[];const must=(v,m)=>assert.ok(v,m);
async function mockControl(page){
  const deviceId='f'.repeat(64),deviceCode='BM-14F-001',cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{const req=route.request();if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});const u=new URL(req.url()),headers={...cors,'content-type':'application/json'};const send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});if(u.pathname==='/api/device/register'||u.pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});if(u.pathname==='/api/device/challenge')return send({challengeId:'challenge-14f',signingInput:`bauman-14f:${deviceId}`});if(u.pathname==='/api/device/verify')return send({sessionToken:'bm1.14f',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});if(u.pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});return route.fulfill({status:404,headers,body:'{}'});});
}

const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();await mockControl(page);
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));page.on('requestfailed',r=>{if(!r.url().startsWith('http://127.0.0.1:3003/'))failed.push(`${r.method()} ${r.url()} ${r.failure()?.errorText||''}`)});
  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});if(await page.locator('#appRoot.hidden').count())await page.locator('#loginBtn').click();await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:10000});
  await page.waitForFunction(()=>Boolean(window.BAUMAN_ACADEMIC_COMMAND_CENTER_2026&&window.app?.__command14fPatched),null,{timeout:15000});await page.waitForSelector('[data-command14f="center"]');
  assert.equal(await page.locator('[data-command14f="center"]').count(),1);assert.equal(await page.locator('.command14f-card').count(),8);

  const result=await page.evaluate(()=>{
    const cmd=window.BAUMAN_ACADEMIC_COMMAND_CENTER_2026,p1=window.BAUMAN_ACADEMIC_2026_RUNTIME,event=window.BAUMAN_EVENT_READINESS_2026,grade=window.BAUMAN_GRADE_CONTROL_2026,transcript=window.BAUMAN_TRANSCRIPT_HONORS_2026,key='bauman_current_user_fullcode_v1';
    const scheduleBefore=JSON.stringify(window.state?.schedule?.entries||{}),initial=cmd.summary(),initialD04=cmd.courseCommand('d04');
    for(const g of ['P2','P3','P10'])p1.recordDiagnostic(g,{D0:92,D1:92,D2:92,criticalMisconceptions:0,failedNodeIds:[]});
    const afterPrereq=cmd.courseCommand('d04');
    event.recordEvidence('d04','Экз',{requirementsVerified:true,requirementSource:'Verified exam requirements',allVerifiedRequirementsMet:true,criticalOpenIssues:0,rehearsalScore:92});
    const afterEvent=cmd.courseCommand('d04');
    grade.recordResult('d04','Экз',{resultConfirmed:true,resultSource:'Official LMS result',numericScore:84});
    const afterGrade4=cmd.courseCommand('d04');
    transcript.recordEntry('d04',{entryVerified:true,source:'Registrar draft transcript',transcriptValue:4});
    const afterTranscript4=cmd.courseCommand('d04');
    transcript.recordEntry('d06',{entryVerified:true,source:'Registrar draft transcript',transcriptValue:3});
    const blocker=cmd.courseCommand('d06'),honors=cmd.summary().honors,scheduleAfter=JSON.stringify(window.state?.schedule?.entries||{}),originalUser=localStorage.getItem(key);
    localStorage.setItem(key,JSON.stringify({email:'other14f@example.test',name:'Other'}));const isolated=cmd.courseCommand('d06'),isolatedHonors=cmd.summary().honors;localStorage.setItem(key,originalUser);
    window.app.home();window.app.home();window.app.home();
    return {initial:{critical:initial.critical,high:initial.high,honors:initial.honors.id},initialD04,afterPrereq,afterEvent,afterGrade4,afterTranscript4,blocker,honors,isolated,isolatedHonors,scheduleUnchanged:scheduleBefore===scheduleAfter,panelCount:document.querySelectorAll('[data-command14f="center"]').length};
  });
  assert.equal(result.scheduleUnchanged,true,'Pass14F orchestration must not mutate schedule');assert.equal(result.panelCount,1,'Command Center panel must not duplicate');
  assert.equal(result.afterPrereq.axes.prereq.id,'COURSE_READY');must(['EVENT_EVIDENCE_REQUIRED','EVENT_PREPARING'].includes(result.afterPrereq.type),'After prereq readiness, unresolved event evidence should drive action');
  assert.equal(result.afterGrade4.type,'GRADE_4_RISK');assert.equal(result.afterGrade4.severity,'high');assert.equal(result.afterTranscript4.type,'HONORS_GRADE_4');
  assert.equal(result.blocker.type,'HONORS_BLOCKER');assert.equal(result.blocker.severity,'critical');assert.equal(result.honors.id,'CURRENT_EVIDENCE_BLOCKS_HONORS');
  must(result.isolated.type!=='HONORS_BLOCKER','Transcript blocker must be isolated by current user');assert.equal(result.isolatedHonors.id,'EVIDENCE_INCOMPLETE');

  await page.screenshot({path:path.join(OUT,'desktop-academic-command-center.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.app.home());await page.waitForSelector('[data-command14f="center"]');const mobile=await page.evaluate(()=>{const home=document.getElementById('page-home'),grid=document.querySelector('.command14f-grid');return{client:home?.clientWidth||0,scroll:home?.scrollWidth||0,columns:grid?getComputedStyle(grid).gridTemplateColumns:''}});must(mobile.scroll<=mobile.client+2,`Mobile overflow: ${JSON.stringify(mobile)}`);if(mobile.columns)assert.equal(mobile.columns.trim().split(/\s+/).length,1);await page.screenshot({path:path.join(OUT,'mobile-academic-command-center.png'),fullPage:true});
  must(errors.length===0,`Page errors: ${errors.join('\n')}`);must(failed.length===0,`Unexpected failed requests: ${failed.join('\n')}`);fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify({status:'PASS',result,mobile},null,2));console.log('PASS14F_COMMAND_CENTER_BROWSER_PASS');
} finally {await browser.close()}
