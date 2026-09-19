import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4175/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/academic-verified-loader-authority-browser';
const CORE_PATHS=[
  '/assets/data/official-curriculum-iu5-2026.json',
  '/assets/data/prerequisite-registry-iu5-2026.json',
  '/assets/data/prerequisite-packs/manifest-2026.json'
];
const REGISTRY_PATH='/foundation/content-resolution/registry-candidates/academic-core-2026.v1.json';
fs.mkdirSync(OUT,{recursive:true});

async function mockControl(page){
  const deviceId='e'.repeat(64),deviceCode='BM-VERIFIED-LOADER-E2E';
  const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{
    const req=route.request();
    if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const pathname=new URL(req.url()).pathname,headers={...cors,'content-type':'application/json'};
    const send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
    if(pathname==='/api/device/register'||pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/challenge')return send({challengeId:'challenge-verified-loader-e2e',signingInput:`bauman-verified-loader-e2e:${deviceId}`});
    if(pathname==='/api/device/verify')return send({sessionToken:'bm1.verified-loader-e2e',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});
    return route.fulfill({status:404,headers,body:'{}'});
  });
}
function attach(page){
  const state={consoleErrors:[],pageErrors:[],failedRequests:[],httpErrors:[],requests:{}};
  page.on('request',request=>{
    try{const pathname=new URL(request.url()).pathname;state.requests[pathname]=(state.requests[pathname]||0)+1}catch{}
  });
  page.on('console',message=>{if(message.type()==='error')state.consoleErrors.push(message.text())});
  page.on('pageerror',error=>state.pageErrors.push(String(error?.stack||error)));
  page.on('requestfailed',request=>{if(!request.url().startsWith('http://127.0.0.1:3003/'))state.failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText||''}`)});
  page.on('response',response=>{if(!response.url().startsWith('http://127.0.0.1:3003/')&&response.status()>=400)state.httpErrors.push(`${response.status()} ${response.url()}`)});
  return state;
}
async function waitReady(page){
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});
  await page.waitForFunction(()=>window.BAUMAN_ACADEMIC_CORE_LOADER_STATUS?.ready===true,null,{timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_PREREQ_PACKS_2026_STATUS?.ready===true,null,{timeout:30000});
  return page.evaluate(()=>({
    loader:window.BAUMAN_ACADEMIC_CORE_LOADER_STATUS,
    packs:window.BAUMAN_PREREQ_PACKS_2026_STATUS,
    curriculum:Boolean(window.BAUMAN_CURRICULUM_2026),
    prerequisite:Boolean(window.BAUMAN_PREREQ_2026),
    resolver:Boolean(window.BaumanRuntimeResourceResolver),
    injected:Array.from(document.scripts).filter(x=>x.dataset.baumanAcademicVerifiedLoader==='1').map(x=>new URL(x.src).pathname)
  }));
}
function assertClean(state){
  assert.deepEqual(state.consoleErrors,[]);
  assert.deepEqual(state.pageErrors,[]);
  assert.deepEqual(state.failedRequests,[]);
  assert.deepEqual(state.httpErrors,[]);
}

let browserInstance;
try{
  browserInstance=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browserInstance.newContext({viewport:{width:1440,height:900}});

  const legacyPage=await context.newPage();
  await mockControl(legacyPage);
  const legacyNet=attach(legacyPage);
  await legacyPage.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  const legacy=await waitReady(legacyPage);
  assert.equal(legacy.loader.mode,'legacy_fetch');
  assert.equal(legacy.loader.authority,'legacy');
  assert.equal(legacy.loader.verified,false);
  assert.equal(legacy.resolver,false,'Legacy default unexpectedly loaded Content Resolution dependencies');
  assert.deepEqual(legacy.injected,[]);
  assert.equal(legacyNet.requests[REGISTRY_PATH]||0,0,'Legacy default unexpectedly requested registry candidate');
  for(const p of CORE_PATHS)assert.equal(legacyNet.requests[p]||0,1,`Legacy core request count drifted for ${p}`);
  assert.equal(legacy.packs.failed,0);
  assert.equal(legacy.curriculum,true);
  assert.equal(legacy.prerequisite,true);
  assertClean(legacyNet);
  await legacyPage.close();

  const trialPage=await context.newPage();
  await mockControl(trialPage);
  const trialNet=attach(trialPage);
  const url=new URL(BASE);url.searchParams.set('academicVerifiedLoader','1');
  await trialPage.goto(url.href,{waitUntil:'domcontentloaded',timeout:30000});
  const trial=await waitReady(trialPage);
  assert.equal(trial.loader.mode,'verified_candidate');
  assert.equal(trial.loader.authority,'opt_in_trial');
  assert.equal(trial.loader.verified,true);
  assert.equal(trial.loader.candidateStatus,'promotion_candidate');
  assert.equal(trial.loader.candidateAuthority,'candidate_only');
  assert.equal(trial.resolver,true,'Verified trial did not load Content Resolution dependencies');
  assert.equal(trial.injected.length,8,'Verified trial dependency chain drifted');
  assert.equal(trialNet.requests[REGISTRY_PATH]||0,1,'Verified trial registry candidate request count drifted');
  for(const p of CORE_PATHS)assert.equal(trialNet.requests[p]||0,1,`Verified trial core request count drifted for ${p}`);
  assert.equal(trial.packs.failed,0);
  assert.equal(trial.curriculum,true);
  assert.equal(trial.prerequisite,true);
  assertClean(trialNet);
  await trialPage.close();

  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',base:BASE,legacy:{status:legacy.loader,requests:legacyNet.requests},trial:{status:trial.loader,requests:trialNet.requests}},null,2));
  console.log('ACADEMIC_VERIFIED_LOADER_AUTHORITY_BROWSER_GATE=PASS');
  console.log(JSON.stringify({legacyDefault:true,optInVerified:true,coreRequestsPerResource:1,registryCandidateRequests:1,packFailures:0},null,2));
}catch(error){
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'FAIL',base:BASE,error:String(error?.stack||error)},null,2));
  throw error;
}finally{
  await browserInstance?.close();
}
