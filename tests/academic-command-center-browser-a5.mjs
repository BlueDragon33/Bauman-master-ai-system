import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/browser-a5';
fs.mkdirSync(OUT,{recursive:true});
const errors=[],failed=[];const must=(v,m)=>assert.ok(v,m);

async function mockControl(page){
  const deviceId='5'.repeat(64),deviceCode='BM-A5-001';
  const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{
    const req=route.request();if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const u=new URL(req.url()),headers={...cors,'content-type':'application/json'},send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
    if(u.pathname==='/api/device/register'||u.pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
    if(u.pathname==='/api/device/challenge')return send({challengeId:'challenge-a5',signingInput:`bauman-a5:${deviceId}`});
    if(u.pathname==='/api/device/verify')return send({sessionToken:'bm1.a5',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
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
  if(await page.locator('#appRoot.hidden').count())await page.locator('#loginBtn').click();
  await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:10000});
  await page.waitForFunction(()=>Boolean(window.BAUMAN_COURSE_READINESS_2026&&window.BAUMAN_EVENT_READINESS_2026),null,{timeout:15000});

  assert.equal(await page.locator('#page-home [data-command-a5="center"]').count(),0,'A5 must not add Command Center to Home');
  assert.equal(await page.evaluate(()=>Boolean(window.BAUMAN_ACADEMIC_COMMAND_CENTER_2026)),false,'A5 must remain lazy before Progress action');

  await page.evaluate(()=>window.app.openHomeFrame('progress'));
  await page.waitForSelector('#modalRoot [data-course14b-progress="s1"]');
  assert.ok(await page.locator('[data-a5-command-open]').count()>0,'Progress modal missing A5 action');
  await page.locator('[data-a5-command-open]').click();
  await page.waitForFunction(()=>Boolean(window.BAUMAN_ACADEMIC_COMMAND_CENTER_2026),null,{timeout:15000});
  await page.waitForSelector('#modalRoot [data-command-a5="center"]');
  assert.equal(await page.locator('#modalRoot .commandA5-card').count(),8,'A5 must render exact 8 S1 course cards');

  const result=await page.evaluate(()=>{
    const cmd=window.BAUMAN_ACADEMIC_COMMAND_CENTER_2026;
    const grade=window.BAUMAN_GRADE_CONTROL_2026,transcript=window.BAUMAN_TRANSCRIPT_HONORS_2026,key='bauman_current_user_fullcode_v1';
    const scheduleBefore=JSON.stringify(window.state?.schedule?.entries||{});
    const initial=cmd.summary(),initialD04=cmd.courseCommand('d04');

    grade.recordResult('d04','Экз',{resultConfirmed:true,resultSource:'Confirmed LMS result',numericScore:84});
    const afterGrade4=cmd.courseCommand('d04');
    transcript.recordEntry('d04',{entryVerified:true,source:'Registrar verified row',transcriptValue:4});
    const afterTranscript4=cmd.courseCommand('d04');
    transcript.recordEntry('d06',{entryVerified:true,source:'Registrar verified row',transcriptValue:3});
    const blocker=cmd.courseCommand('d06'),honors=cmd.summary().honors;
    const scheduleAfter=JSON.stringify(window.state?.schedule?.entries||{});

    const originalUser=localStorage.getItem(key);
    localStorage.setItem(key,JSON.stringify({email:'a5-other@example.test',name:'Other'}));
    const isolated=cmd.courseCommand('d06'),isolatedHonors=cmd.summary().honors;
    localStorage.setItem(key,originalUser);

    return {
      initial:{courses:initial.courses,critical:initial.critical,high:initial.high,honors:initial.honors.id},
      initialD04,afterGrade4,afterTranscript4,blocker,honors,isolated,isolatedHonors,
      scheduleUnchanged:scheduleBefore===scheduleAfter,
      boundaries:{readOnly:cmd.readOnly,schedulerMutation:cmd.schedulerMutation,evidenceMutation:cmd.evidenceMutation,courseCompletionMutation:cmd.courseCompletionMutation,homeSurfaceAdded:cmd.homeSurfaceAdded,surface:cmd.surface}
    };
  });

  assert.equal(result.initial.courses,8);
  assert.equal(result.afterGrade4.type,'GRADE_4_RISK');assert.equal(result.afterGrade4.severity,'high');
  assert.equal(result.afterTranscript4.type,'HONORS_GRADE_4');assert.equal(result.afterTranscript4.severity,'high');
  assert.equal(result.blocker.type,'HONORS_BLOCKER');assert.equal(result.blocker.severity,'critical');
  assert.equal(result.honors.id,'CURRENT_EVIDENCE_BLOCKS_HONORS');
  assert.equal(result.honors.finalEligibilityClaimed,false);
  must(result.isolated.type!=='HONORS_BLOCKER','A5 transcript blocker must stay user-isolated');
  assert.equal(result.isolatedHonors.id,'EVIDENCE_INCOMPLETE');
  assert.equal(result.scheduleUnchanged,true,'A5 orchestration must not mutate schedule');
  assert.deepEqual(result.boundaries,{readOnly:true,schedulerMutation:false,evidenceMutation:false,courseCompletionMutation:false,homeSurfaceAdded:false,surface:'progress-modal'});

  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>window.openAcademicCommandCenterOverviewA5());
  await page.waitForSelector('#modalRoot [data-command-a5="center"]');
  const mobile=await page.evaluate(()=>{const root=document.querySelector('#modalRoot [data-command-a5="center"]');return{client:root?.clientWidth||0,scroll:root?.scrollWidth||0,columns:getComputedStyle(document.querySelector('.commandA5-grid')).gridTemplateColumns}});
  must(mobile.scroll<=mobile.client+2,`A5 mobile overflow: ${JSON.stringify(mobile)}`);
  if(mobile.columns)assert.equal(mobile.columns.trim().split(/\s+/).length,1);
  await page.screenshot({path:path.join(OUT,'a5-command-center-mobile.png'),fullPage:true});

  assert.equal(await page.locator('#page-home [data-command-a5="center"]').count(),0,'A5 must still not exist on Home after use');
  must(errors.length===0,`Page errors: ${errors.join('\n')}`);
  must(failed.length===0,`Unexpected failed requests: ${failed.join('\n')}`);
  fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify({status:'PASS',result,mobile},null,2));
  console.log('A5_COMMAND_CENTER_BROWSER_PASS');
}finally{await browser.close()}
