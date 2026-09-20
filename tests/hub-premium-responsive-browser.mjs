import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/hub-preservation-responsive';
fs.mkdirSync(OUT,{recursive:true});

// Static ownership gate: PlanningBridge is an accepted canonical wrapper around app.home.
// The Safe Shell itself must never assign app.home or replace the canonical nav tree.
const safeSource=fs.readFileSync('assets/js/hub-safe-shell.js','utf8');
assert.doesNotMatch(safeSource,/(?:window\.)?app\.home\s*=/,'Safe Hub must not assign app.home');
assert.doesNotMatch(safeSource,/\.home\s*=\s*function\s*\(/,'Safe Hub must not wrap app.home');
assert.doesNotMatch(safeSource,/nav\.innerHTML\s*=/,'Safe Hub must not replace canonical navigation');

async function mockControl(page){
  const deviceId='c'.repeat(64),deviceCode='BM-SYSTEM-E2E';
  const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{
    const req=route.request();
    if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const pathname=new URL(req.url()).pathname,headers={...cors,'content-type':'application/json'};
    const send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
    if(pathname==='/api/device/register'||pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/challenge')return send({challengeId:'challenge-system-e2e',signingInput:`bauman-system-e2e:${deviceId}`});
    if(pathname==='/api/device/verify')return send({sessionToken:'bm1.system-e2e',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});
    return route.fulfill({status:404,headers,body:'{}'});
  });
}

async function openHub(page){
  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_APP_MANAGER_ACCESS?.selfCheck?.().ready===true,null,{timeout:10000});
  const access=await page.evaluate(()=>window.BAUMAN_APP_MANAGER_ACCESS.selfCheck());
  assert.equal(access.mode,'app-manager');
  assert.equal(access.deviceAuthorized,true);
  assert.equal(access.localAuthBypassed,true);
  assert.equal(access.authScreenHidden,true);
  assert.equal(access.credentialStorePresent,false);
  assert.equal(access.managedScopeStored,true);
  assert.equal(access.localAdminVisible,false);
  assert.equal(access.localLogoutVisible,false);
  assert.equal(access.routeOwnership,false);
  assert.equal(access.academicWrites,false);
  await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:30000});
  await page.waitForFunction(()=>!!window.BAUMAN_HUB_SAFE?.selfCheck,null,{timeout:10000});
  await page.waitForFunction(()=>window.BAUMAN_HUB_LEARNING_CLUSTER?.selfCheck?.().visibleLearningClones?.length===5,null,{timeout:10000});
  await page.waitForFunction(()=>window.BAUMAN_HUB_OVERVIEW_SEARCH_V2?.selfCheck?.().homeSummary===true,null,{timeout:10000});
  await page.waitForFunction(()=>{
    const safe=window.BAUMAN_HUB_SAFE?.selfCheck?.();
    return safe?.ready===true
      && !!document.querySelector('.hub-safe-dashboard')
      && !!document.querySelector('[data-safe-action="details"]')
      && document.querySelectorAll('[data-safe-appearance]').length===3;
  },null,{timeout:15000});
}

async function checkCanonicalContent(page){
  const content=await page.evaluate(()=>({
    subjectIds:(window.BAUMAN_DATA?.subjects||[]).map(x=>x.id).sort(),
    pages:['home','roadmap','subjects','schedule','research'].filter(id=>document.getElementById(`page-${id}`)),
    appearance:!!document.getElementById('appearanceBtn'),
    ai:!!document.getElementById('aiBtn'),
    safeSkin:!!window.BAUMAN_HUB_SAFE,
    planningWrapper:window.app?.__planningV3Patched===true,
    detailToggle:!!document.querySelector('[data-safe-action="details"]'),
    appearancePresets:document.querySelectorAll('[data-safe-appearance]').length,
    safeCheck:window.BAUMAN_HUB_SAFE?.selfCheck?.(),
    managedAccess:window.BAUMAN_APP_MANAGER_ACCESS?.selfCheck?.(),
    learningCluster:window.BAUMAN_HUB_LEARNING_CLUSTER?.selfCheck?.(),
    overviewSearch:window.BAUMAN_HUB_OVERVIEW_SEARCH_V2?.selfCheck?.()
  }));
  assert.deepEqual(content.subjectIds,['ai','foundation','math','programming','research','russian','signal','systems']);
  assert.equal(content.pages.length,5,'canonical Hub pages were removed');
  assert.ok(content.appearance,'Giao diện control missing');
  assert.ok(content.ai,'AI control missing');
  assert.ok(content.safeSkin,'Safe Hub shell missing');
  assert.ok(content.detailToggle,'Canonical detail toggle missing');
  assert.equal(content.appearancePresets,3,'Appearance quick presets missing');
  assert.equal(content.safeCheck?.ready,true,'Safe Hub shell is not healthy');
  assert.equal(content.safeCheck?.canonicalPages,true,'Safe Hub removed canonical pages');
  assert.equal(content.safeCheck?.originalHomePreserved,true,'Original home content was lost');
  assert.equal(content.safeCheck?.additiveDashboard,true,'Additive premium dashboard missing');
  assert.equal(content.safeCheck?.canonicalDetailsAvailable,true,'Canonical detail fold is unavailable');
  assert.equal(content.safeCheck?.appearancePresets,3,'Appearance preset self-check drift');
  assert.equal(content.safeCheck?.routesOwned,false,'Safe Hub must not own routes');
  assert.equal(content.safeCheck?.dataWrites,false,'Safe Hub must not own academic data');
  assert.equal(content.managedAccess?.ready,true,'App Manager managed access is not healthy');
  assert.equal(content.managedAccess?.credentialStorePresent,false,'Local credential store must stay empty');
  assert.deepEqual(content.learningCluster?.visibleLearningClones,['study','simulation','exercise','exam','review'],'Learning cluster lost a required user action');
  assert.equal(content.learningCluster?.progressLabel,'Tiến độ','Progress action is missing or was not renamed');
  assert.equal(content.overviewSearch?.homeSummary,true,'Concise Home summary is not active');
  assert.equal(content.overviewSearch?.canonicalHomeHidden,true,'Legacy canonical Home is still user-facing');
  assert.equal(content.overviewSearch?.searchInstalled,true,'Global search V2 is not installed');
  assert.equal(content.overviewSearch?.accentInsensitive,true,'Search is not accent-insensitive');
  assert.equal(content.overviewSearch?.legacyHomePanelsVisible,false,'Legacy detail panels leaked back onto Home');
  return content;
}

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1920,height:1080}});
  const page=await context.newPage();
  await mockControl(page);
  const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  await openHub(page);
  const content=await checkCanonicalContent(page);

  // Home must stay concise and global search must route across the system.
  const homeIA=await page.evaluate(()=>({
    summary:!!document.querySelector('.hub-v2-home'),
    stage:!!document.querySelector('.hub-v2-overview-hero'),
    resume:!!document.querySelector('.hub-v2-resume-card'),
    metrics:document.querySelectorAll('.hub-v2-system-strip>button').length,
    legacyVisible:['.hub-safe-subjects','.hub-safe-assistant','.hub-safe-schedule','.hub-safe-achievements','.hub-safe-overall'].some(sel=>{
      const el=document.querySelector('#page-home '+sel);
      return !!el&&getComputedStyle(el).display!=='none';
    }),
    canonicalHidden:getComputedStyle(document.querySelector('#page-home .canva-dashboard-page')).display==='none'
  }));
  assert.equal(homeIA.summary,true,'Concise Home summary missing');
  assert.equal(homeIA.stage,true,'Current-stage overview missing');
  assert.equal(homeIA.resume,true,'Resume block missing');
  assert.equal(homeIA.metrics,4,'Home should expose exactly four compact system indicators');
  assert.equal(homeIA.legacyVisible,false,'Detailed panels leaked onto Home');
  assert.equal(homeIA.canonicalHidden,true,'Canonical detail dashboard should be preserved but hidden from Home');

  const searchAudit=await page.evaluate(()=>({
    toan:window.BAUMAN_HUB_OVERVIEW_SEARCH_V2.search('toan').map(x=>[x.kind,x.subjectId||x.id]),
    python:window.BAUMAN_HUB_OVERVIEW_SEARCH_V2.search('python').map(x=>[x.kind,x.courseId||x.id]),
    m1:window.BAUMAN_HUB_OVERVIEW_SEARCH_V2.search('m1').map(x=>[x.kind,x.stageId||x.id]),
    ugv:window.BAUMAN_HUB_OVERVIEW_SEARCH_V2.search('ugv').map(x=>[x.kind,x.researchId||x.id]),
    lich:window.BAUMAN_HUB_OVERVIEW_SEARCH_V2.search('lich').map(x=>[x.kind,x.id])
  }));
  assert.ok(searchAudit.toan.some(x=>x[0]==='subject'&&x[1]==='math'),'Unaccented "toan" did not find Math');
  assert.ok(searchAudit.python.some(x=>x[0]==='course'),'Python did not find a course');
  assert.ok(searchAudit.m1.some(x=>x[0]==='stage'&&x[1]==='m1'),'M1 did not find semester M1');
  assert.ok(searchAudit.ugv.some(x=>x[0]==='research'&&x[1]==='ugv'),'UGV did not find research topic');
  assert.ok(searchAudit.lich.some(x=>x[0]==='page'&&x[1]==='schedule'),'Unaccented "lich" did not find Schedule');
  const naturalSearch=await page.evaluate(()=>({
    russian:window.BAUMAN_HUB_OVERVIEW_SEARCH_V2.search('học tiếng Nga nghe nói').slice(0,5).map(x=>[x.kind,x.subjectId||x.id,x.title]),
    math:window.BAUMAN_HUB_OVERVIEW_SEARCH_V2.search('học toán xác suất').slice(0,5).map(x=>[x.kind,x.subjectId||x.id,x.title]),
    schedule:window.BAUMAN_HUB_OVERVIEW_SEARCH_V2.search('xem lịch tuần này').slice(0,5).map(x=>[x.kind,x.id,x.title]),
    thesis:window.BAUMAN_HUB_OVERVIEW_SEARCH_V2.search('luận văn UGV').slice(0,8).map(x=>[x.kind,x.researchId||x.subjectId||x.id,x.title])
  }));
  assert.ok(naturalSearch.russian.some(x=>x[1]==='russian'),'Natural Russian query did not surface Russian');
  assert.ok(naturalSearch.math.some(x=>x[1]==='math'),'Natural Math query did not surface Math');
  assert.ok(naturalSearch.schedule.some(x=>x[0]==='page'&&x[1]==='schedule'),'Natural schedule query did not surface Schedule');
  assert.ok(naturalSearch.thesis.some(x=>x[0]==='research'||x[1]==='research'),'Natural thesis/UGV query did not surface Research');
  const homeAudit=await page.evaluate(()=>({
    summaryButtons:document.querySelectorAll('#page-home .hub-v2-system-strip>button').length,
    researchCard:!!document.querySelector('#page-home [data-hub-v2-action="research"]'),
    legacy:window.BAUMAN_HUB_OVERVIEW_SEARCH_V2.selfCheck().legacyHomePanelsVisible
  }));
  assert.equal(homeAudit.summaryButtons,3,'Home summary should contain only three high-signal quick indicators');
  assert.equal(homeAudit.researchCard,false,'Research detail should not be promoted as a Home summary card');
  assert.equal(homeAudit.legacy,false,'Legacy detailed Home panels leaked back into the overview');

  await page.evaluate(()=>{
    window.state.lastStudy={subjectId:'russian',path:window.state.subjects.russian.mainPath};
    window.state.subject='russian';
  });
  await page.locator('#hubSafeSearch').fill('toan');
  await page.locator('#hubSafeSearch').press('Enter');
  await page.waitForSelector('#modalRoot [data-hub-search-kind="subject"][data-hub-search-subject="math"]',{timeout:10000});
  await page.locator('#modalRoot [data-hub-search-kind="subject"][data-hub-search-subject="math"]').first().click();
  await page.waitForFunction(()=>window.state?.subject==='math'&&document.getElementById('page-subjects')?.classList.contains('active')===true);
  assert.equal(await page.evaluate(()=>window.state?.lastStudy?.subjectId),'russian','Search preview/navigation must not corrupt lastStudy');

  await page.evaluate(()=>window.app?.page?.('home',false));
  await page.waitForFunction(()=>window.BAUMAN_HUB_OVERVIEW_SEARCH_V2?.compactHome?.()===true);
  await page.locator('#hubSafeSearch').fill('python');
  await page.locator('#hubSafeSearch').press('Enter');
  const courseResult=page.locator('#modalRoot [data-hub-search-kind="course"]').first();
  await courseResult.waitFor({state:'visible',timeout:10000});
  const courseId=await courseResult.getAttribute('data-hub-search-course');
  await courseResult.click();
  await page.waitForFunction(id=>document.getElementById('page-subjects')?.classList.contains('active')===true&&!!document.querySelector('[data-course-id="'+CSS.escape(id)+'"]'),courseId,{timeout:10000});
  assert.equal(await page.evaluate(()=>window.state?.searchFocusCourseId),courseId,'Exact searched course was not focused');

  // Premium appearance control center must drive the existing canonical appearance state, not create another theme engine.
  await page.locator('#appearanceBtn').click();
  await page.waitForFunction(()=>!document.getElementById('appearanceMenu')?.classList.contains('hidden'));
  await page.locator('[data-safe-appearance="focus"]').click();
  await page.waitForFunction(()=>document.body.dataset.theme==='night'&&document.body.dataset.size==='compact'&&document.body.dataset.hubWallpaper==='plain'&&document.body.dataset.hubDensity==='fit1080');
  await page.locator('[data-safe-appearance="bauman"]').click();
  await page.waitForFunction(()=>document.body.dataset.theme==='academic'&&document.body.dataset.font==='system'&&document.body.dataset.size==='normal'&&document.body.dataset.hubWallpaper==='mountain'&&document.body.dataset.hubDensity==='fit1080');
  await page.locator('#appearanceBtn').click();

  for(const id of ['roadmap','subjects','schedule','research','home']){
    await page.evaluate(id=>window.app?.page?.(id,false),id);
    await page.waitForFunction(id=>document.getElementById(`page-${id}`)?.classList.contains('active'),id,{timeout:10000});
    if(id==='home')await page.evaluate(()=>{window.BAUMAN_HUB_SAFE?.refresh?.();window.BAUMAN_HUB_OVERVIEW_SEARCH_V2?.compactHome?.()});
  }

  const cases=[['tuf-f15-1920x1080',1920,1080],['laptop-1536x864',1536,864],['ipad-3x2',1180,787],['iphone-19_5x9',390,844]];
  for(const [label,width,height] of cases){
    await page.setViewportSize({width,height});
    await page.waitForTimeout(120);
    await page.evaluate(()=>{window.app?.page?.('home',false);window.BAUMAN_HUB_SAFE?.refresh?.();window.BAUMAN_HUB_OVERVIEW_SEARCH_V2?.compactHome?.()});
    const snap=await page.evaluate(()=>{
      const dash=document.querySelector('.hub-safe-dashboard')?.getBoundingClientRect();
      const gold=getComputedStyle(document.querySelector('.hub-safe-gold'));
      return{
        client:document.documentElement.clientWidth,
        scroll:document.documentElement.scrollWidth,
        app:!!document.getElementById('appRoot')&&!document.getElementById('appRoot').classList.contains('hidden'),
        appearance:!!document.getElementById('appearanceBtn'),
        dashboard:!!document.querySelector('.hub-safe-dashboard'),
        original:!!document.querySelector('#page-home .canva-dashboard-page'),
        originalFolded:document.querySelector('#page-home .canva-dashboard-page')?.classList.contains('hub-safe-preserved-collapsed')===true,
        summary:!!document.querySelector('.hub-v2-home'),
        legacyPanels:!!document.querySelector('#page-home .hub-safe-assistant,#page-home .hub-safe-schedule,#page-home .hub-safe-achievements,#page-home .hub-safe-overall,#page-home .hub-safe-subjects'),
        page:document.getElementById('page-home')?.classList.contains('active')===true,
        dashboardBottom:dash?.bottom??null,
        goldBackground:gold.backgroundImage,
        goldColor:gold.color
      };
    });
    assert.ok(snap.app&&snap.appearance&&snap.dashboard&&snap.original&&snap.page,`${label}: safe/preserved Hub content missing`);
    assert.ok(snap.originalFolded,`${label}: canonical home should stay folded by default`);
    assert.ok(snap.summary,`${label}: concise Home summary missing`);
    assert.equal(snap.legacyPanels,false,`${label}: legacy detailed Home panels leaked into summary`);
    assert.ok(snap.scroll<=snap.client+2,`${label}: horizontal overflow ${snap.scroll}/${snap.client}`);
    assert.match(snap.goldBackground,/gradient/i,`${label}: primary CTA lost premium gold background`);
    if(width>=1500)assert.ok(snap.dashboardBottom<=height+40,`${label}: premium dashboard no longer fits the first 16:9 screen (${snap.dashboardBottom}/${height})`);
    await page.screenshot({path:path.join(OUT,`${label}.png`),fullPage:true});
  }

  assert.deepEqual(errors,[],'Hub emitted console/page errors');
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',mode:'safe-additive-shell+app-manager-access',subjects:content.subjectIds.length,viewports:cases.map(x=>x[0]),planningWrapper:content.planningWrapper,safeCheck:content.safeCheck,managedAccess:content.managedAccess,staticOwnershipGate:'PASS',homeSummaryV2:'PASS',appearancePresets:'PASS',errors},null,2));
  console.log('Hub safe additive responsive acceptance PASS');
}finally{
  await browser?.close();
}
