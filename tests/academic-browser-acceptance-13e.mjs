import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/browser-13e';
const MAIN='bauman_main_all_phases_subjects_v1';
const DIAG='bauman_academic_2026_diagnostics_v1';
const SESSION='bauman-device-session-v4';
const USER='dinhnam3391@gmail.com';
fs.mkdirSync(OUT,{recursive:true});
const checks=[],pageErrors=[],failedRequests=[];
const ok=(name,detail='')=>checks.push({name,detail});
const must=(v,m)=>assert.ok(v,m);

async function mockControl(page,state){
  const deviceId='a'.repeat(64),deviceCode='BM-E2E-001';
  const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{
    const req=route.request();
    if(!state.online)return route.abort('failed');
    if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const u=new URL(req.url()),headers={...cors,'content-type':'application/json'};
    const send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
    if(u.pathname==='/api/device/register'||u.pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:state.status}});
    if(u.pathname==='/api/device/challenge')return send({challengeId:'challenge-e2e',signingInput:`bauman-e2e:${deviceId}`});
    if(u.pathname==='/api/device/verify')return send({sessionToken:'bm1.e2e',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
    if(u.pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});
    return route.fulfill({status:404,headers,body:'{}'});
  });
}

async function waitAcademic(page){
  await page.waitForFunction(()=>Boolean(window.BAUMAN_ACADEMIC_2026_RUNTIME&&window.BAUMAN_ACADEMIC_SCHEDULER_PREVIEW_2026&&window.BAUMAN_PREREQ_2026),null,{timeout:15000});
}

async function approvedFlow(browser){
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),control={online:true,status:'approved'};
  await mockControl(page,control);
  page.on('pageerror',e=>pageErrors.push(String(e?.stack||e)));
  page.on('requestfailed',r=>{if(!r.url().startsWith('http://127.0.0.1:3003/'))failedRequests.push(`${r.method()} ${r.url()} ${r.failure()?.errorText||''}`)});
  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});
  must(await page.locator('#baumanDeviceGate').evaluate(e=>e.classList.contains('hidden')),'Device gate did not hide after approval');
  ok('device_authorized');

  await page.locator('#loginBtn').click();
  await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'));
  await waitAcademic(page);
  const runtime=await page.evaluate(()=>({
    academic:window.BAUMAN_ACADEMIC_2026_RUNTIME?.version,
    preview:window.BAUMAN_ACADEMIC_SCHEDULER_PREVIEW_2026?.version,
    planning:Boolean(window.app?.__planningV3Patched),
    academicPatch:Boolean(window.app?.__academic2026Patched),
    previewPatch:Boolean(window.app?.__academic13dPreviewPatched),
    schedulerMutation:window.BAUMAN_ACADEMIC_2026_RUNTIME?.schedulerMutationEnabled,
    apply:window.BAUMAN_ACADEMIC_SCHEDULER_PREVIEW_2026?.applyEnabled
  }));
  must(runtime.planning&&runtime.academicPatch&&runtime.previewPatch,'Runtime patches do not coexist');
  must(runtime.schedulerMutation===false&&runtime.apply===false,'Mutation must remain locked');
  ok('runtime_coexistence',JSON.stringify(runtime));

  await page.waitForSelector('[data-academic2026="home"]');
  assert.equal(await page.locator('[data-academic2026="home"]').count(),1);
  assert.equal(await page.getByText('Course Risk + Active Repair',{exact:true}).count(),1);
  assert.equal(await page.getByText('Scheduler Integration Preview',{exact:true}).count(),1);
  await page.screenshot({path:path.join(OUT,'desktop-home.png'),fullPage:true});
  ok('home_render');

  await page.locator('button[data-page="roadmap"]').click();
  await page.waitForSelector('#page-roadmap.active [data-academic2026="roadmap"]');
  assert.equal(await page.locator('#page-roadmap .academic2026-semester').count(),4);
  ok('roadmap_4_semesters');

  const diag=await page.evaluate(()=>{
    const rt=window.BAUMAN_ACADEMIC_2026_RUNTIME;
    const p1=rt.recordDiagnostic('P1',{D0:70,D1:70,D2:70,criticalMisconceptions:0,failedNodeIds:['P1-N03']});
    const p2=rt.recordDiagnostic('P2',{D0:96,D1:96,D2:96,criticalMisconceptions:0,failedNodeIds:[]});
    const i1=rt.gateIntervention('P1','before_stankin'),i2=rt.gateIntervention('P2','before_stankin');
    return {p1:p1.id,p2:p2.id,p1Action:i1.action,p1Routes:i1.repairRoutes.map(x=>x.id),p2Action:i2.action,p2Stop:i2.broadStop};
  });
  assert.equal(diag.p1,'repair');assert.equal(diag.p2,'mastered');assert.equal(diag.p1Action,'REPAIR_MATCHED');must(diag.p1Routes.length>0,'P1 route missing');assert.equal(diag.p2Action,'STOP_BROAD');must(diag.p2Stop,'P2 STOP missing');
  ok('diagnostic_repair_stop',JSON.stringify(diag));

  await page.evaluate(()=>{
    window.app.page('home',false);window.state.schedule.weekStart='2026-06-08';window.state.schedule.autoStage='prepare';
    window.state.schedule.entries['2026-06-08|afternoon']={subjectId:'russian',learningItem:'Manual E2E',source:'manual'};
    window.state.schedule.entries['2026-06-09|morning1']={subjectId:'research',learningItem:'External E2E',source:'external_sync'};
    window.save();window.app.home();
  });
  await page.waitForSelector('[data-academic13d="preview"]');
  const preview=await page.evaluate(()=>{
    const pv=window.BAUMAN_ACADEMIC_SCHEDULER_PREVIEW_2026,before=JSON.stringify(window.state.schedule.entries),p=pv.generateSchedulePreview(),after=JSON.stringify(window.state.schedule.entries);
    let applyError='';try{pv.applySchedulePreview()}catch(e){applyError=String(e?.message||e)}
    return {unchanged:before===after,protected:p.protectedManualAndExternal.map(x=>x.key),changes:p.changes.map(x=>x.key),routeSafe:p.changes.filter(x=>x.action==='REPAIR_MATCHED').every(x=>(x.repairEvidence?.routeIds||[]).length>0&&(x.repairEvidence?.failedNodeIds||[]).length>0),rollback:Object.keys(p.rollbackBaseline||{}).sort(),proposed:p.summary.proposedChanges,stop:p.summary.stopGatesExcluded,applyError};
  });
  must(preview.unchanged,'Preview mutated schedule');must(preview.protected.includes('2026-06-08|afternoon'),'Manual slot not protected');must(preview.protected.includes('2026-06-09|morning1'),'External slot not protected');must(!preview.changes.includes('2026-06-08|afternoon')&&!preview.changes.includes('2026-06-09|morning1'),'Protected slot proposed for change');must(preview.routeSafe,'Repair evidence missing');must(preview.proposed<=6,'Preview exceeds cap');assert.deepEqual(preview.rollback,[...preview.changes].sort());must(preview.stop.includes('P2'),'MASTERED P2 not excluded');must(/Browser\/E2E|khóa|locked/i.test(preview.applyError),'Apply did not fail closed');
  ok('preview_diff_safety',JSON.stringify({proposed:preview.proposed,protected:preview.protected.length,stop:preview.stop}));

  const stale=await page.evaluate(()=>{
    const pv=window.BAUMAN_ACADEMIC_SCHEDULER_PREVIEW_2026,p=pv.readStoredPreview(),k='2026-06-10|morning1',cur=window.state.schedule.entries[k]||{subjectId:'russian',source:'auto',learningItem:'Auto'};
    window.state.schedule.entries[k]={...cur,learningItem:`${cur.learningItem||'Auto'} changed`};window.save();return {stale:pv.previewIsStale(p),rollback:pv.rollbackPackage(p)};
  });
  must(stale.stale,'Stale fingerprint not detected');must(stale.rollback?.requiresFingerprintMatch===true,'Rollback fingerprint guard missing');ok('stale_fingerprint');

  await page.evaluate(()=>{window.app.home();window.app.home();window.app.home()});
  const duplicates=await page.evaluate(()=>({home:document.querySelectorAll('[data-academic2026="home"]').length,preview:document.querySelectorAll('[data-academic13d="preview"]').length}));
  assert.deepEqual(duplicates,{home:1,preview:1});ok('no_duplicate_patches');

  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{window.app.page('home',false);window.app.home()});await page.waitForSelector('[data-academic2026="home"]');
  const mobile=await page.evaluate(()=>{const h=document.getElementById('page-home'),risk=document.querySelector('.academic2026-risk-grid'),action=document.querySelector('.academic2026-action-row');return{client:h?.clientWidth||0,scroll:h?.scrollWidth||0,risk:risk?getComputedStyle(risk).gridTemplateColumns:'',action:action?getComputedStyle(action).gridTemplateColumns:''}});
  must(mobile.scroll<=mobile.client+2,`Mobile horizontal overflow ${JSON.stringify(mobile)}`);if(mobile.risk)must(mobile.risk.trim().split(/\s+/).length===1,`Risk grid not one column: ${mobile.risk}`);if(mobile.action)must(mobile.action.trim().split(/\s+/).length===1,`Action grid not one column: ${mobile.action}`);
  await page.screenshot({path:path.join(OUT,'mobile-home.png'),fullPage:true});ok('responsive_390px',JSON.stringify(mobile));

  await page.setViewportSize({width:1440,height:1000});
  await page.evaluate(({MAIN,DIAG})=>{const m=JSON.parse(localStorage.getItem(MAIN)||'{}');m.academic2026={...(m.academic2026||{}),gateDiagnostics:{P3:{D0:92,D1:92,D2:92,criticalMisconceptions:0,failedNodeIds:[],source:'legacy_e2e'}}};localStorage.setItem(MAIN,JSON.stringify(m));localStorage.removeItem(DIAG)},{MAIN,DIAG});
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});await waitAcademic(page);
  const migration=await page.evaluate(({DIAG,USER})=>{const rt=window.BAUMAN_ACADEMIC_2026_RUNTIME,s=JSON.parse(localStorage.getItem(DIAG)||'{}'),g=window.BAUMAN_PREREQ_2026.coreGates.find(x=>x.id==='P3');return{state:rt.gateState(g).id,score:rt.scoreForGate('P3')?.score,migrated:Boolean(s.users?.[USER]?.gateDiagnostics?.P3),checked:Boolean(s.users?.[USER]?.migrationChecked)}},{DIAG,USER});
  assert.equal(migration.state,'ready');assert.equal(migration.score,92);must(migration.migrated&&migration.checked,'Legacy migration failed');ok('legacy_diagnostic_migration',JSON.stringify(migration));

  const compat=await page.evaluate(()=>window.BAUMAN_ACADEMIC_2026_RUNTIME.schedulerCompatibility('before_stankin'));
  must(compat.mode==='advice_only'&&compat.mutationEnabled===false,'PlanningBridge compatibility drift');assert.equal(compat.academicReadyMinimum,90);ok('planningbridge_compatibility');
  const pwa=await page.evaluate(async()=>{if(!('serviceWorker'in navigator))return{supported:false,registrations:0};return{supported:true,registrations:(await navigator.serviceWorker.getRegistrations()).length}});ok('pwa_observation',JSON.stringify(pwa));

  await page.evaluate(SESSION=>sessionStorage.removeItem(SESSION),SESSION);control.online=false;await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='offline-grace',null,{timeout:15000});await waitAcademic(page);must(!(await page.locator('#appRoot').evaluate(e=>e.classList.contains('hidden'))),'Offline grace hid logged-in app');ok('device_offline_grace');
  control.online=true;await context.close();return{runtime,diag,preview,mobile,migration,pwa};
}

async function pendingFlow(browser){
  const context=await browser.newContext({viewport:{width:900,height:760}}),page=await context.newPage(),control={online:true,status:'pending'};await mockControl(page,control);await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='pending',null,{timeout:15000});must(!(await page.locator('#baumanDeviceGate').evaluate(e=>e.classList.contains('hidden'))),'Pending gate hidden');assert.equal((await page.locator('#baumanDeviceCode').textContent())?.trim(),'BM-E2E-001');must(/chờ duyệt/i.test((await page.locator('#baumanDeviceTitle').textContent())||''),'Pending title incorrect');await page.screenshot({path:path.join(OUT,'device-pending.png'),fullPage:true});ok('device_pending_gate');await context.close();
}

let browser,result;
try{browser=await chromium.launch({headless:true});result=await approvedFlow(browser);await pendingFlow(browser);must(pageErrors.length===0,`Page errors: ${pageErrors.join('\n')}`);must(failedRequests.length===0,`Unexpected failed requests: ${failedRequests.join('\n')}`);fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',suite:'Academic Browser Acceptance · Pass13E',checks,pageErrors,failedRequests,observations:result,completedAt:new Date().toISOString()},null,2));console.log('ACADEMIC_BROWSER_ACCEPTANCE_13E_PASS');console.log(JSON.stringify({checks:checks.length,pwa:result.pwa,offlineGrace:true,manualProtection:true,staleFingerprint:true},null,2))}
catch(e){fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'FAIL',suite:'Academic Browser Acceptance · Pass13E',error:String(e?.stack||e),checks,pageErrors,failedRequests,completedAt:new Date().toISOString()},null,2));console.error('ACADEMIC_BROWSER_ACCEPTANCE_13E_FAIL');console.error(e?.stack||e);process.exitCode=1}
finally{if(browser)await browser.close()}
