import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4175/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/academic-verified-loader-failure-browser';
const CURRICULUM='/assets/data/official-curriculum-iu5-2026.json';
const CORE_PATHS=[
  CURRICULUM,
  '/assets/data/prerequisite-registry-iu5-2026.json',
  '/assets/data/prerequisite-packs/manifest-2026.json'
];
const REGISTRY='/foundation/content-resolution/registry-candidates/academic-core-2026.v1.json';
fs.mkdirSync(OUT,{recursive:true});

async function mockControl(page){
  const deviceId='f'.repeat(64),deviceCode='BM-VERIFIED-FAIL-E2E';
  const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{
    const req=route.request();
    if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const pathname=new URL(req.url()).pathname,headers={...cors,'content-type':'application/json'};
    const send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
    if(pathname==='/api/device/register'||pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/challenge')return send({challengeId:'challenge-verified-fail-e2e',signingInput:`bauman-verified-fail-e2e:${deviceId}`});
    if(pathname==='/api/device/verify')return send({sessionToken:'bm1.verified-fail-e2e',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});
    return route.fulfill({status:404,headers,body:'{}'});
  });
}

function observe(page){
  const state={requests:{},consoleErrors:[],pageErrors:[],failedRequests:[],httpErrors:[]};
  page.on('request',request=>{
    try{
      const pathname=new URL(request.url()).pathname;
      state.requests[pathname]=(state.requests[pathname]||0)+1;
    }catch{}
  });
  page.on('console',message=>{if(message.type()==='error')state.consoleErrors.push(message.text())});
  page.on('pageerror',error=>state.pageErrors.push(String(error?.stack||error)));
  page.on('requestfailed',request=>{
    if(request.url().startsWith('http://127.0.0.1:3003/'))return;
    state.failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText||''}`);
  });
  page.on('response',response=>{
    if(response.url().startsWith('http://127.0.0.1:3003/'))return;
    const pathname=new URL(response.url()).pathname;
    if(response.status()>=400&&pathname!==REGISTRY)state.httpErrors.push(`${response.status()} ${response.url()}`);
  });
  return state;
}

function trialUrl(){
  const url=new URL(BASE);
  url.searchParams.set('academicVerifiedLoader','1');
  return url.href;
}

async function waitFailure(page){
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});
  await page.waitForFunction(()=>window.BAUMAN_ACADEMIC_CORE_LOADER_STATUS?.ready===true,null,{timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_PREREQ_PACKS_2026_STATUS?.ready===true,null,{timeout:30000});
  return page.evaluate(()=>({
    loader:window.BAUMAN_ACADEMIC_CORE_LOADER_STATUS,
    packs:window.BAUMAN_PREREQ_PACKS_2026_STATUS,
    curriculum:Boolean(window.BAUMAN_CURRICULUM_2026),
    prerequisite:Boolean(window.BAUMAN_PREREQ_2026)
  }));
}

function assertClean(state){
  assert.deepEqual(state.consoleErrors,[]);
  assert.deepEqual(state.pageErrors,[]);
  assert.deepEqual(state.failedRequests,[]);
  assert.deepEqual(state.httpErrors,[]);
}

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:900}});

  const changedPage=await context.newPage();
  await mockControl(changedPage);
  const changedNet=observe(changedPage);
  await changedPage.route(`**${CURRICULUM}`,async route=>{
    const response=await route.fetch();
    await route.fulfill({response,body:(await response.text())+' '});
  });
  await changedPage.goto(trialUrl(),{waitUntil:'domcontentloaded',timeout:30000});
  const changed=await waitFailure(changedPage);
  assert.equal(changed.loader.mode,'verified_candidate');
  assert.equal(changed.loader.authority,'opt_in_trial');
  assert.equal(changed.loader.verified,false);
  assert.match(changed.loader.error||'',/VERIFICATION_curriculum_blocked/i);
  assert.equal(changed.packs.failed,1);
  assert.equal(changed.curriculum,false);
  assert.equal(changed.prerequisite,false);
  assert.equal(changedNet.requests[REGISTRY]||0,1);
  assert.equal(changedNet.requests[CURRICULUM]||0,1);
  assert.equal(changedNet.requests[CORE_PATHS[1]]||0,0);
  assert.equal(changedNet.requests[CORE_PATHS[2]]||0,0);
  assertClean(changedNet);
  await changedPage.close();

  const missingPage=await context.newPage();
  await mockControl(missingPage);
  const missingNet=observe(missingPage);
  await missingPage.route(`**${REGISTRY}`,route=>route.fulfill({status:404,contentType:'application/json',body:'{}'}));
  await missingPage.goto(trialUrl(),{waitUntil:'domcontentloaded',timeout:30000});
  const missing=await waitFailure(missingPage);
  assert.equal(missing.loader.mode,'verified_candidate');
  assert.equal(missing.loader.authority,'opt_in_trial');
  assert.equal(missing.loader.verified,false);
  assert.match(missing.loader.error||'',/REGISTRY_HTTP_404/i);
  assert.equal(missing.packs.failed,1);
  assert.equal(missing.curriculum,false);
  assert.equal(missing.prerequisite,false);
  assert.equal(missingNet.requests[REGISTRY]||0,1);
  for(const resource of CORE_PATHS)assert.equal(missingNet.requests[resource]||0,0,`Unexpected core fallback request ${resource}`);
  assertClean(missingNet);
  await missingPage.close();

  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({
    status:'PASS',
    base:BASE,
    changedBytes:{loader:changed.loader,packs:changed.packs,requests:changedNet.requests},
    missingRegistry:{loader:missing.loader,packs:missing.packs,requests:missingNet.requests}
  },null,2));
  console.log('ACADEMIC_VERIFIED_LOADER_FAILURE_BROWSER_GATE=PASS');
  console.log(JSON.stringify({changedBytesBlocked:true,missingRegistryBlocked:true,legacyFallbacks:0,academicGlobalsPublishedOnFailure:false},null,2));
}catch(error){
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'FAIL',base:BASE,error:String(error?.stack||error)},null,2));
  throw error;
}finally{
  await browser?.close();
}
