import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/browser-14d';
fs.mkdirSync(OUT,{recursive:true});
const errors=[],failed=[];const must=(v,m)=>assert.ok(v,m);
async function mockControl(page){
  const deviceId='d'.repeat(64),deviceCode='BM-14D-001',cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{const req=route.request();if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});const u=new URL(req.url()),headers={...cors,'content-type':'application/json'};const send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});if(u.pathname==='/api/device/register'||u.pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});if(u.pathname==='/api/device/challenge')return send({challengeId:'challenge-14d',signingInput:`bauman-14d:${deviceId}`});if(u.pathname==='/api/device/verify')return send({sessionToken:'bm1.14d',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});if(u.pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});return route.fulfill({status:404,headers,body:'{}'});});
}

const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();await mockControl(page);
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));page.on('requestfailed',r=>{if(!r.url().startsWith('http://127.0.0.1:3003/'))failed.push(`${r.method()} ${r.url()} ${r.failure()?.errorText||''}`)});
  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});if(await page.locator('#appRoot.hidden').count())await page.locator('#loginBtn').click();await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:10000});
  await page.waitForFunction(()=>Boolean(window.BAUMAN_GRADE_CONTROL_2026&&window.BAUMAN_GRADING_POLICY_2024&&window.app?.__grade14dPatched),null,{timeout:15000});await page.waitForSelector('[data-grade14d="ledger"]');
  assert.equal(await page.locator('[data-grade14d="ledger"]').count(),1);assert.equal(await page.locator('.grade14d-row').count(),8);

  const result=await page.evaluate(()=>{
    const g=window.BAUMAN_GRADE_CONTROL_2026,c=window.BAUMAN_COURSE_READINESS_2026,policy=window.BAUMAN_GRADING_POLICY_2024,key='bauman_current_user_fullcode_v1';
    const entriesBefore=JSON.stringify(window.state?.schedule?.entries||{}),lifeBefore=c.lifecycleAxis('d04'),initial=g.resultState('d04','Экз');
    let noConfirm='';try{g.recordResult('d04','Экз',{resultConfirmed:false,resultSource:'LMS',numericScore:92})}catch(err){noConfirm=String(err?.message||err)}
    let noSource='';try{g.recordResult('d04','Экз',{resultConfirmed:true,resultSource:'',numericScore:92})}catch(err){noSource=String(err?.message||err)}
    const score89=g.recordResult('d04','Экз',{resultConfirmed:true,resultSource:'Official LMS result',numericScore:89,notes:'browser 89'});
    const score92=g.recordResult('d04','Экз',{resultConfirmed:true,resultSource:'Official LMS result',numericScore:92,notes:'browser 92'});
    let mismatch='';try{g.recordResult('d04','ДЗчт',{resultConfirmed:true,resultSource:'Official LMS result',numericScore:92,officialGrade:4})}catch(err){mismatch=String(err?.message||err)}
    const pass=g.recordResult('d02','Зчт',{resultConfirmed:true,resultSource:'Official LMS result',outcome:'pass'});
    let locked='';try{g.recordResult('d15','Экз',{resultConfirmed:true,resultSource:'Official LMS result',numericScore:100})}catch(err){locked=String(err?.message||err)}
    const d15=g.resultState('d15','Экз'),stored=g.rawResult('d04','Экз'),entriesAfter=JSON.stringify(window.state?.schedule?.entries||{}),lifeAfter=c.lifecycleAxis('d04'),originalUser=localStorage.getItem(key);
    localStorage.setItem(key,JSON.stringify({email:'other14d@example.test',name:'Other'}));const isolated=g.resultState('d04','Экз');localStorage.setItem(key,originalUser);
    return {policy:policy.ratingScale,initial,noConfirm,noSource,score89,score92,mismatch,pass,locked,d15,stored,isolated,scheduleUnchanged:entriesBefore===entriesAfter,lifeBefore,lifeAfter,summary:g.summary()};
  });
  assert.equal(result.initial.id,'RESULT_UNRECORDED');must(/xác nhận/.test(result.noConfirm),'Unconfirmed result must be rejected');must(/nguồn/.test(result.noSource.toLowerCase()),'Missing result source must be rejected');
  assert.equal(result.score89.id,'RESULT_EXCELLENT_BELOW_TARGET');assert.equal(result.score89.result.derivedGrade,5);assert.equal(result.score92.id,'RESULT_TARGET_MET');assert.equal(result.score92.result.derivedGrade,5);
  must(/không nhất quán/.test(result.mismatch),'Score/official-grade mismatch must be rejected');assert.equal(result.pass.id,'CREDIT_PASSED');must(/timing/.test(result.locked),'Unresolved d15 timing must block result recording');assert.equal(result.d15.id,'RESULT_TIMING_LOCKED');
  assert.equal(result.stored.supplementEntryVerified,false);assert.equal(result.stored.supplementEntryCounted,null);assert.equal(result.scheduleUnchanged,true);assert.equal(result.lifeBefore.id,result.lifeAfter.id);assert.equal(result.isolated.id,'RESULT_UNRECORDED','Grade result must be isolated by current user');
  assert.deepEqual(result.policy.map(x=>[x.min,x.max,x.grade5Scale]),[[85,100,5],[71,84,4],[60,70,3],[0,59,2]]);

  await page.evaluate(()=>{window.app.home();window.app.home()});assert.equal(await page.locator('[data-grade14d="ledger"]').count(),1);await page.screenshot({path:path.join(OUT,'desktop-grade-control.png'),fullPage:true});
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});if(await page.locator('#appRoot.hidden').count())await page.locator('#loginBtn').click();await page.waitForFunction(()=>Boolean(window.BAUMAN_GRADE_CONTROL_2026&&window.app?.__grade14dPatched),null,{timeout:15000});
  const persisted=await page.evaluate(()=>({exam:window.BAUMAN_GRADE_CONTROL_2026.resultState('d04','Экз'),credit:window.BAUMAN_GRADE_CONTROL_2026.resultState('d02','Зчт')}));assert.equal(persisted.exam.id,'RESULT_TARGET_MET');assert.equal(persisted.credit.id,'CREDIT_PASSED');
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.app.home());await page.waitForSelector('[data-grade14d="ledger"]');const mobile=await page.evaluate(()=>{const home=document.getElementById('page-home'),list=document.querySelector('.grade14d-list');return{client:home?.clientWidth||0,scroll:home?.scrollWidth||0,columns:list?getComputedStyle(list).gridTemplateColumns:''}});must(mobile.scroll<=mobile.client+2,`Mobile overflow: ${JSON.stringify(mobile)}`);if(mobile.columns)assert.equal(mobile.columns.trim().split(/\s+/).length,1);await page.screenshot({path:path.join(OUT,'mobile-grade-control.png'),fullPage:true});
  must(errors.length===0,`Page errors: ${errors.join('\n')}`);must(failed.length===0,`Unexpected failed requests: ${failed.join('\n')}`);fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify({status:'PASS',result,persisted,mobile},null,2));console.log('PASS14D_BROWSER_ACCEPTANCE_PASS');
} finally {await browser.close()}
