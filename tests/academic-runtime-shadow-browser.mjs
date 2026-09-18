import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4175/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/academic-runtime-shadow-browser';
fs.mkdirSync(OUT,{recursive:true});

function makeSummary(mode){
  return {mode,status:'RUNNING',consoleErrors:[],pageErrors:[],failedRequests:[],httpErrors:[],shadow:null};
}
async function mockControl(page){
  const deviceId='d'.repeat(64),deviceCode='BM-CONTENT-SHADOW-E2E';
  const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{
    const req=route.request();
    if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const pathname=new URL(req.url()).pathname,headers={...cors,'content-type':'application/json'};
    const send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
    if(pathname==='/api/device/register'||pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/challenge')return send({challengeId:'challenge-content-shadow-e2e',signingInput:`bauman-content-shadow-e2e:${deviceId}`});
    if(pathname==='/api/device/verify')return send({sessionToken:'bm1.content-shadow-e2e',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});
    return route.fulfill({status:404,headers,body:'{}'});
  });
}
function monitor(page,summary){
  page.on('console',message=>{if(message.type()==='error')summary.consoleErrors.push(message.text())});
  page.on('pageerror',error=>summary.pageErrors.push(String(error?.stack||error)));
  page.on('requestfailed',request=>{
    if(request.url().startsWith('http://127.0.0.1:3003/'))return;
    summary.failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText||''}`);
  });
  page.on('response',response=>{
    if(response.url().startsWith('http://127.0.0.1:3003/'))return;
    if(response.status()>=400)summary.httpErrors.push(`${response.status()} ${response.url()}`);
  });
}
async function waitAcademic(page){
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});
  await page.waitForFunction(()=>window.BAUMAN_PREREQ_PACKS_2026_STATUS?.ready===true,null,{timeout:30000});
  const status=await page.evaluate(()=>window.BAUMAN_PREREQ_PACKS_2026_STATUS);
  assert.ok(status.expected>0,'Academic prerequisite pack manifest is empty');
  assert.equal(status.failed,0,`Academic prerequisite pack load failed: ${JSON.stringify(status)}`);
  assert.equal(status.loaded,status.expected,`Academic prerequisite pack readiness mismatch: ${JSON.stringify(status)}`);
  return status;
}

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:900}});

  const disabledSummary=makeSummary('disabled-default');
  const disabledPage=await context.newPage();
  await mockControl(disabledPage);
  monitor(disabledPage,disabledSummary);
  await disabledPage.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  await waitAcademic(disabledPage);
  await disabledPage.waitForFunction(()=>window.BAUMAN_CONTENT_RESOLUTION_SHADOW_STATUS?.ready===true,null,{timeout:10000});
  const disabled=await disabledPage.evaluate(()=>({
    status:window.BAUMAN_CONTENT_RESOLUTION_SHADOW_STATUS,
    injected:Array.from(document.scripts).filter(x=>x.dataset.baumanContentResolutionShadow==='1').map(x=>x.src),
    resolverLoaded:Boolean(window.BaumanRuntimeResourceResolver),
    bridgeLoaded:Boolean(window.BaumanAcademicContentResolutionShadow)
  }));
  assert.equal(disabled.status.enabled,false,'Shadow must remain disabled by default');
  assert.equal(disabled.status.passed,null,'Disabled shadow must not report verification result');
  assert.deepEqual(disabled.injected,[],'Disabled shadow loaded Foundation dependencies');
  assert.equal(disabled.resolverLoaded,false,'Disabled shadow unexpectedly loaded resolver');
  assert.equal(disabled.bridgeLoaded,true,'Shadow bridge script is missing from real Hub');
  assert.deepEqual(disabledSummary.consoleErrors,[]);
  assert.deepEqual(disabledSummary.pageErrors,[]);
  assert.deepEqual(disabledSummary.failedRequests,[]);
  assert.deepEqual(disabledSummary.httpErrors,[]);
  disabledSummary.shadow=disabled.status;
  disabledSummary.status='PASS';
  await disabledPage.close();

  const enabledSummary=makeSummary('enabled-opt-in');
  const enabledPage=await context.newPage();
  await mockControl(enabledPage);
  monitor(enabledPage,enabledSummary);
  const url=new URL(BASE);
  url.searchParams.set('contentResolutionShadow','1');
  await enabledPage.goto(url.href,{waitUntil:'domcontentloaded',timeout:30000});
  await waitAcademic(enabledPage);
  await enabledPage.waitForFunction(()=>window.BAUMAN_CONTENT_RESOLUTION_SHADOW_STATUS?.ready===true,null,{timeout:30000});
  const enabled=await enabledPage.evaluate(()=>({
    status:window.BAUMAN_CONTENT_RESOLUTION_SHADOW_STATUS,
    dependencyScripts:Array.from(document.scripts).filter(x=>x.dataset.baumanContentResolutionShadow==='1').map(x=>new URL(x.src).pathname),
    authoritative:{
      curriculum:Boolean(window.BAUMAN_CURRICULUM_2026),
      prerequisite:Boolean(window.BAUMAN_PREREQ_2026),
      packs:window.BAUMAN_PREREQ_PACKS_2026_STATUS
    }
  }));
  assert.equal(enabled.status.enabled,true);
  assert.equal(enabled.status.ready,true);
  assert.equal(enabled.status.passed,true,`Runtime shadow failed: ${JSON.stringify(enabled.status)}`);
  assert.equal(enabled.status.resources.length,3);
  assert.equal(enabled.status.registryMode,'pinned_candidate');
  assert.equal(enabled.status.candidateStatus,'promotion_candidate');
  assert.equal(enabled.status.candidateAuthority,'candidate_only');
  assert.equal(enabled.status.packParity,true);
  assert.equal(enabled.status.globalsUnchanged,true);
  assert.equal(enabled.status.registryUnchanged,true);
  for(const row of enabled.status.resources){
    assert.equal(row.descriptorStatus,'resolved',`${row.id}: descriptor not resolved`);
    assert.equal(row.planStatus,'ready',`${row.id}: plan not ready`);
    assert.equal(row.executionStatus,'verified',`${row.id}: execution not verified`);
    assert.equal(row.pinnedVerification,true,`${row.id}: pinned verification failed`);
    assert.equal(row.authoritativeParity,true,`${row.id}: authoritative parity failed`);
    assert.match(row.digest,/^[0-9a-f]{64}$/);
    assert.ok(row.byteLength>0);
  }
  assert.equal(enabled.dependencyScripts.length,8,'Opt-in shadow did not load the exact dependency chain');
  assert.equal(enabled.authoritative.curriculum,true);
  assert.equal(enabled.authoritative.prerequisite,true);
  assert.equal(enabled.authoritative.packs.failed,0);
  assert.deepEqual(enabledSummary.consoleErrors,[]);
  assert.deepEqual(enabledSummary.pageErrors,[]);
  assert.deepEqual(enabledSummary.failedRequests,[]);
  assert.deepEqual(enabledSummary.httpErrors,[]);
  enabledSummary.shadow=enabled.status;
  enabledSummary.status='PASS';
  await enabledPage.close();

  const evidence={status:'PASS',base:BASE,disabled:disabledSummary,enabled:enabledSummary};
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(evidence,null,2));
  console.log('ACADEMIC_RUNTIME_SHADOW_BROWSER_GATE=PASS');
  console.log(JSON.stringify({defaultDisabled:true,optInPinnedVerified:true,registryMode:'pinned_candidate',resources:3,dependencyScripts:8,authorityUnchanged:true},null,2));
}catch(error){
  const evidence={status:'FAIL',base:BASE,error:String(error?.stack||error)};
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(evidence,null,2));
  throw error;
}finally{
  await browser?.close();
}
