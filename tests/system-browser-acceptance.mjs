import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/system-browser';
const EXPECT_PLATFORM_ACCESS=process.env.BAUMAN_E2E_EXPECT_PLATFORM_ACCESS==='1';
const SUBJECTS=['ai','foundation','math','programming','research','russian','signal','systems'];
const SIMPLE=new Set(['ai','foundation','research','signal','systems']);
const ACCEPTED_MATH_LESSONS=[
  {key:'l04',id:'MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140',diagrams:8,retrievalChecks:9,misconceptions:16},
  {key:'l05',id:'MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140',diagrams:9,retrievalChecks:10,misconceptions:18},
  {key:'l06',id:'MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140',diagrams:11,retrievalChecks:22,misconceptions:22}
];
const summary={status:'RUNNING',subjects:{},responsive:{},consoleErrors:[],pageErrors:[],failedRequests:[],httpErrors:[],ignoredDecorativeAborts:[]};
let explicitReloadInProgress=false;
fs.mkdirSync(OUT,{recursive:true});

async function mockControl(page,status='approved'){
  const deviceId='c'.repeat(64),deviceCode='BM-SYSTEM-E2E';
  const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{
    const req=route.request();
    if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const pathname=new URL(req.url()).pathname,headers={...cors,'content-type':'application/json'};
    const send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
    if(pathname==='/api/device/register'||pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status}});
    if(pathname==='/api/device/challenge')return send({challengeId:'challenge-system-e2e',signingInput:`bauman-system-e2e:${deviceId}`});
    if(pathname==='/api/device/verify')return send({sessionToken:'bm1.system-e2e',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});
    return route.fulfill({status:404,headers,body:'{}'});
  });
}

function subjectFrame(page,id){return page.frames().find(frame=>{try{return new URL(frame.url()).pathname===`/subjects/${id}/index.html`}catch{return false}})}

function isConfirmedNavigationAbort(request){
  const errorText=request.failure()?.errorText||'';
  if(request.method()!=='GET'||errorText!=='net::ERR_ABORTED')return false;
  try{
    const requestUrl=new URL(request.url());
    const baseUrl=new URL(BASE);
    const decorativePaths=new Set([
      '/assets/media/hub-mountains.svg',
      '/assets/media/hub-ai-robot.svg'
    ]);
    const isPrerequisitePack=/^\/assets\/data\/prerequisite-packs\/(?:p\d{2}-[a-z0-9-]+|j\d{2}-[a-z0-9-]+)\.json$/.test(requestUrl.pathname);
    const isAcademicLazyAsset=/^\/assets\/(?:js\/academic-(?:course|event|grade|transcript|command-center)-runtime\.js|css\/academic-(?:course|event|grade|transcript|command-center)-2026\.css)$/.test(requestUrl.pathname);
    return requestUrl.origin===baseUrl.origin&&(decorativePaths.has(requestUrl.pathname)||isPrerequisitePack||(explicitReloadInProgress&&isAcademicLazyAsset));
  }catch{return false}
}

async function openSubject(page,id){
  await page.evaluate(subjectId=>window.app.openSubjectInPage(subjectId),id);
  await page.waitForFunction(subjectId=>{try{return new URL(document.getElementById('subjectFrame')?.src||'').pathname===`/subjects/${subjectId}/index.html`}catch{return false}},id);
  await page.waitForFunction(subjectId=>Array.from(document.querySelectorAll('iframe')).some(element=>{try{return new URL(element.contentWindow?.location?.href||'').pathname===`/subjects/${subjectId}/index.html`}catch{return false}}),id,{timeout:30000});
  const frame=subjectFrame(page,id);
  assert.ok(frame,`${id}: canonical iframe route did not load`);
  await frame.waitForLoadState('load',{timeout:30000});
  await frame.waitForFunction(subjectId=>window.BAUMAN_HOST_TASK?.subjectId===subjectId,id,{timeout:30000});
  if(SIMPLE.has(id))await page.waitForFunction(subjectId=>(window.state.subjectReports?.[subjectId]||[]).length>0,id,{timeout:15000});
  await frame.waitForLoadState('networkidle',{timeout:30000});
  return frame;
}

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await context.newPage();
  await mockControl(page);
  page.on('console',message=>{if(message.type()==='error')summary.consoleErrors.push(message.text())});
  page.on('pageerror',error=>summary.pageErrors.push(String(error?.stack||error)));
  page.on('requestfailed',request=>{
    if(request.url().startsWith('http://127.0.0.1:3003/'))return;
    const failure=`${request.method()} ${request.url()} ${request.failure()?.errorText||''}`;
    if(isConfirmedNavigationAbort(request)){
      summary.ignoredDecorativeAborts.push(failure);
      return;
    }
    summary.failedRequests.push(failure);
  });
  page.on('response',response=>{if(response.status()>=400)summary.httpErrors.push(`${response.status()} ${response.url()}`)});

  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});
  const accessBoundary=await page.evaluate(()=>window.BAUMAN_DEVICE_ACCESS_BOUNDARY);
  assert.deepEqual(accessBoundary,{
    mode:EXPECT_PLATFORM_ACCESS?'chatgpt-site-owner-private':'bauman-control-v4',
    platformAuthorized:EXPECT_PLATFORM_ACCESS,
    controlProtocol:'bauman-control-v4'
  });
  summary.accessBoundary=accessBoundary;
  await page.waitForFunction(()=>window.BAUMAN_APP_MANAGER_ACCESS?.selfCheck?.().ready===true,null,{timeout:15000});
  const managedAccess=await page.evaluate(()=>window.BAUMAN_APP_MANAGER_ACCESS.selfCheck());
  assert.equal(managedAccess.mode,'app-manager');
  assert.equal(managedAccess.deviceAuthorized,true);
  assert.equal(managedAccess.localAuthBypassed,true);
  assert.equal(managedAccess.authScreenHidden,true);
  assert.equal(managedAccess.credentialStorePresent,false);
  assert.equal(managedAccess.managedScopeStored,true);
  assert.equal(managedAccess.currentManagedBy,'app-manager');
  assert.equal(managedAccess.localAdminVisible,false);
  assert.equal(managedAccess.localLogoutVisible,false);
  assert.equal(managedAccess.routeOwnership,false);
  assert.equal(managedAccess.academicWrites,false);
  await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'));

  explicitReloadInProgress=true;
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});
  await page.waitForFunction(()=>window.BAUMAN_APP_MANAGER_ACCESS?.selfCheck?.().ready===true,null,{timeout:15000});
  const managedReload=await page.evaluate(()=>window.BAUMAN_APP_MANAGER_ACCESS.selfCheck());
  assert.equal(managedReload.credentialStorePresent,false);
  assert.equal(managedReload.managedScopeStored,true);
  assert.equal(managedReload.authScreenHidden,true);
  assert.equal(managedReload.currentManagedBy,'app-manager');
  await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'));
  explicitReloadInProgress=false;

  const unsafeRejected=await page.evaluate(()=>{const old=window.state.subjects.ai.mainPath;window.state.subjects.ai.mainPath='javascript:alert(1)';document.getElementById('studyRoot').innerHTML='';window.app.openSubjectInPage('ai');const rejected=!document.getElementById('subjectFrame');window.state.subjects.ai.mainPath=old;return rejected});
  assert.ok(unsafeRejected,'Unsafe subject route was accepted');
  const protectedRoute=await page.evaluate(()=>{window.app.page('home',false);const previous=window.state.page;const user=window.auth.current;window.auth.current={...user,role:'user'};window.app.page('admin');const rejected=window.state.page===previous;window.auth.current=user;return rejected});
  assert.ok(protectedRoute,'Non-admin session entered the admin route');

  for(const id of SUBJECTS){
    const frame=await openSubject(page,id);
    const observed=await frame.evaluate(()=>({title:document.title,subjectId:window.BaumanSubjectHost?.subjectId,hostOrigin:window.BaumanSubjectHost?.hostOrigin,taskType:window.BAUMAN_HOST_TASK?.type,taskSubject:window.BAUMAN_HOST_TASK?.subjectId,taskId:window.BAUMAN_HOST_TASK?.taskId||window.BAUMAN_HOST_TASK?.missionId,client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
    assert.equal(observed.subjectId,id,`${id}: bridge identity drift`);
    assert.equal(observed.hostOrigin,new URL(BASE).origin,`${id}: host origin drift`);
    assert.equal(observed.taskType,'BAUMAN_ASSIGN_TASK',`${id}: task type drift`);
    assert.equal(observed.taskSubject,id,`${id}: task identity drift`);
    assert.ok(observed.taskId&&observed.title,`${id}: task or page identity missing`);
    const beforeTask=observed.taskId;
    await frame.evaluate(subjectId=>window.postMessage({type:'BAUMAN_ASSIGN_TASK',subjectId,taskId:'forged-child-task'},location.origin),id);
    await page.waitForTimeout(75);
    assert.equal(await frame.evaluate(()=>window.BAUMAN_HOST_TASK?.taskId||window.BAUMAN_HOST_TASK?.missionId),beforeTask,`${id}: accepted an untrusted self-message`);
    summary.subjects[id]={title:observed.title,bridge:observed.subjectId,task:observed.taskType,reportCount:SIMPLE.has(id)?await page.evaluate(subjectId=>(window.state.subjectReports?.[subjectId]||[]).length,id):null};
  }

  const active='systems';
  const before=await page.evaluate(id=>(window.state.subjectReports?.[id]||[]).length,active);
  await page.evaluate(id=>window.postMessage({type:'BAUMAN_SUBJECT_PROGRESS',subjectId:id,percent:99,total:99,correct:99},location.origin),active);
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(id=>(window.state.subjectReports?.[id]||[]).length,active),before,'Hub accepted forged progress from its own window');
  await subjectFrame(page,active).evaluate(()=>window.BaumanSubjectHost.progress({percent:23,total:5,correct:4,stage:'prepare'}));
  await page.waitForFunction(({id,count})=>(window.state.subjectReports?.[id]||[]).length===count+1,{id:active,count:before});

  for(const [label,width,height] of [['tablet',768,1024],['mobile',390,844]]){
    await page.setViewportSize({width,height});
    const routes={};
    for(const id of SUBJECTS){
      const frame=await openSubject(page,id);
      const sizes=await frame.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
      const hub=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,frame:(()=>{const rect=document.getElementById('subjectFrame')?.getBoundingClientRect();return rect?{left:rect.left,right:rect.right}:null})()}));
      assert.ok(hub.scroll<=hub.client+2,`${label}/${id}: Hub horizontal overflow`);
      assert.ok(hub.frame&&hub.frame.left>=-1&&hub.frame.right<=hub.client+1,`${label}/${id}: subject frame outside viewport`);
      assert.ok(sizes.scroll<=sizes.client+2,`${label}/${id}: subject page horizontal overflow (${sizes.scroll}/${sizes.client})`);
      routes[id]={hubWidth:hub.client,subjectWidth:sizes.client,noHorizontalOverflow:true};
    }
    summary.responsive[label]=routes;
    await page.screenshot({path:path.join(OUT,`${label}-systems.png`),fullPage:true});
  }

  const queryPage=await context.newPage();
  await queryPage.goto(`${BASE}subjects/math/index.html?host=main&hostOrigin=${encodeURIComponent(new URL(BASE).origin)}&subjectId=math&taskId=query-route-e2e&stage=prepare`,{waitUntil:'load'});
  await queryPage.waitForFunction(()=>window.BAUMAN_HOST_TASK?.taskId==='query-route-e2e');
  assert.deepEqual(await queryPage.evaluate(()=>({subjectId:window.BAUMAN_HOST_TASK.subjectId,taskId:window.BAUMAN_HOST_TASK.taskId,standalone:window.parent===window})),{subjectId:'math',taskId:'query-route-e2e',standalone:true});
  await queryPage.waitForFunction(()=>window.BAUMAN_MATH_THEORY_E129?.sourceStatus?.().content>=3&&window.BAUMAN_MATH_THEORY_ARTIFACT_REGISTRY_E244?.selfCheck?.().ok===true,null,{timeout:30000});
  const registry=await queryPage.evaluate(()=>window.BAUMAN_MATH_THEORY_ARTIFACT_REGISTRY_E244.selfCheck());
  assert.equal(registry.lessonCount,3,'Math accepted lesson registry count drift');
  assert.equal(registry.sourceCount,12,'Math accepted source registry count drift');
  assert.deepEqual(registry.duplicateSourceIds,[],'Math runtime source IDs are duplicated');
  assert.ok(await queryPage.evaluate(()=>Boolean(window.BAUMAN_MATH_E235_FORMULA_STANDARD&&!window.BAUMAN_MATH_E236_FORMULA_LAYOUT&&!window.BAUMAN_MATH_E237_ACADEMIC&&!window.BAUMAN_MATH_E238_AUDIT)),'Math E235/E236-E238 runtime boundary drift');
  // E129 intentionally schedules a second startup stabilization render at 650 ms.
  // Let that render finish before deterministic lesson routing so it cannot overwrite a test-selected lesson.
  await queryPage.waitForTimeout(800);
  summary.mathRuntime={};
  for(const lesson of ACCEPTED_MATH_LESSONS){
    const selected=await queryPage.evaluate(async lessonId=>{
      const payload=window.BAUMAN_MATH_E240_THEORY_CONTENT_SOURCE.getPayload()||await fetch('data/theory_lecture_content.json',{cache:'no-store'}).then(response=>response.json());
      const record=payload?.records?.find(row=>row?.lessonId===lessonId);
      if(!record)return null;
      const state=window.__BAUMAN_CORE_API?.state||window.__MATH_STATE;
      state.view='learning';state.learnTab='theory';state.stage='vn';state.e129Stage='vn';state.e129ChapterId=record.chapterId;state.e129LessonId=lessonId;state.e129Present=false;
      state.e169Path={...(state.e169Path||{}),chapterId:record.chapterId,activityId:'theory',lessonId};
      window.BAUMAN_MATH_THEORY_E129.render();
      return{lessonId:record.lessonId,chapterId:record.chapterId,slides:record.slides?.length||0};
    },lesson.id);
    assert.deepEqual(selected,{lessonId:lesson.id,chapterId:selected?.chapterId,slides:22},`${lesson.key}: durable source registration drift`);
    await queryPage.waitForFunction(({lessonId,expectedSlides})=>{
      const current=document.querySelector('[data-current-lesson]');
      return current?.getAttribute('data-current-lesson')===lessonId&&current.querySelectorAll('.e129-slide').length===expectedSlides;
    },{lessonId:lesson.id,expectedSlides:22},{timeout:30000});
    await queryPage.waitForTimeout(100);
    const readerState=await queryPage.evaluate(lessonId=>{
      const current=document.querySelector('[data-current-lesson]');
      return {lessonId:current?.getAttribute('data-current-lesson')||null,slides:current?.querySelectorAll('.e129-slide').length||0};
    },lesson.id);
    assert.deepEqual(readerState,{lessonId:lesson.id,slides:22},`${lesson.key}: Reader stable slide state drift`);
    if(lesson.key==='l04'){
      await queryPage.waitForFunction(()=>window.BAUMAN_MATH_FORMULA_LIBRARY?.selfCheck?.().loaded===true&&window.BAUMAN_MATH_SIMULATION_SOURCE?.selfCheck?.().loaded===true&&window.BAUMAN_MATH_ACTIVITY_STUDIO&&window.BAUMAN_MATH_INTEGRATION_SYNC&&window.BAUMAN_MATH_REGRESSION_GATE&&window.BAUMAN_MATH_RUNTIME_HEALTH,null,{timeout:30000});
      const layers=await queryPage.evaluate(()=>({
        formula:window.BAUMAN_MATH_FORMULA_LIBRARY.selfCheck(),
        simulation:window.BAUMAN_MATH_SIMULATION_SOURCE.selfCheck(),
        activity:window.BAUMAN_MATH_ACTIVITY_STUDIO.selfCheck(),
        integration:window.BAUMAN_MATH_INTEGRATION_SYNC.selfCheck(),
        regression:window.BAUMAN_MATH_REGRESSION_GATE.run(),
        health:window.BAUMAN_MATH_RUNTIME_HEALTH.check()
      }));
      assert.ok(layers.formula.total>0&&layers.formula.formulaContentSampleRecordUsed===false&&layers.formula.academicWrites===false,'Math Formula Library source policy drift');
      assert.ok(layers.simulation.canonicalOk&&layers.simulation.sampleRecordUsed===false&&layers.simulation.academicWrites===false,'Math Simulation Source policy drift');
      assert.ok(layers.activity.sampleRecordsRendered===false&&layers.activity.academicWrites===false&&layers.activity.newRouteEngine===false,'Math Activity Studio read-only policy drift');
      assert.ok(layers.integration.academicWrites===false&&layers.integration.routeOwnership===false&&layers.integration.mutationObserver===false,'Math Integration Sync ownership drift');
      assert.equal(layers.regression.summary.fail,0,'Math in-app regression gate reported a failure');
      assert.deepEqual(layers.regression.rows.filter(row=>row.state==='warn').map(row=>row.id),['browser'],'Math in-app regression warnings drift');
      assert.equal(layers.health.summary.fail,0,'Math runtime health reported a failure');
      summary.mathRuntime.activeLayers={formulaItems:layers.formula.total,simulationRecords:layers.simulation.canonicalRecords,regression:layers.regression.summary,runtimeHealth:layers.health.summary,academicWrites:false,routeEngineReplacement:false};
    }
    await queryPage.evaluate(lessonId=>window.BAUMAN_MATH_E242_SLIDESHOW_RICHNESS.load(lessonId),lesson.id);
    await queryPage.evaluate(lessonId=>{
      const state=window.__BAUMAN_CORE_API?.state||window.__MATH_STATE;
      state.e129Present=true;
      window.BAUMAN_MATH_THEORY_E129.render();
      const presenter=window.BAUMAN_MATH_THEORY_E132;
      if(!presenter||typeof presenter.openDeck!=='function'||presenter.openDeck()===false)throw new Error('Math public presenter API did not open');
      const route=window.BAUMAN_MATH_E243_PRESENTER_ROUTE_LOCK;
      const identity=route.canonicalIdentity(lessonId);
      if(!route.stampDeck(identity))throw new Error('Math route lock did not stamp active deck');
      window.BAUMAN_MATH_E210_LESSON_IDENTITY?.apply?.();
      window.BAUMAN_MATH_E242_SLIDESHOW_RICHNESS?.apply?.();
    },lesson.id);
    try{
      await queryPage.waitForFunction(lessonId=>{
        const deck=document.querySelector('.e132-overlay-deck.open');
        const richness=window.BAUMAN_MATH_E242_SLIDESHOW_RICHNESS?.selfCheck?.();
        return deck?.getAttribute('data-e243-lesson-id')===lessonId&&deck?.getAttribute('data-e210-active-lesson-id')===lessonId&&richness?.activeLessonId===lessonId&&richness?.loaded===true&&richness?.richnessPresent===true;
      },lesson.id,{timeout:30000});
    }catch(error){
      const diag=await queryPage.evaluate(()=>{const deck=document.querySelector('.e132-overlay-deck.open');return{
        deckE243:deck?.getAttribute('data-e243-lesson-id')||null,
        deckE210:deck?.getAttribute('data-e210-active-lesson-id')||null,
        deckLesson:deck?.getAttribute('data-lesson-id')||null,
        e210:window.BAUMAN_MATH_E210_LESSON_IDENTITY?.selfCheck?.()||null,
        e242:window.BAUMAN_MATH_E242_SLIDESHOW_RICHNESS?.selfCheck?.()||null,
        e243:window.BAUMAN_MATH_E243_PRESENTER_ROUTE_LOCK?.selfCheck?.()||null,
        presenter:window.BAUMAN_MATH_THEORY_E132?.selfCheck?.()||null,
        title:deck?.querySelector('.e132-clean-main h1')?.textContent?.trim()||null,
        visual:!!deck?.querySelector('.e202-visual'),
        applicationCard:!!deck?.querySelector('.e132-clean-card.application'),
        checkCard:!!deck?.querySelector('.e132-clean-card.check')
      }});throw new Error(`${lesson.key}: presenter richness did not settle: ${JSON.stringify(diag)}; original=${error.message}`);
    }
    const opened=await queryPage.evaluate(()=>{
      const richness=window.BAUMAN_MATH_E242_SLIDESHOW_RICHNESS.selfCheck(),route=window.BAUMAN_MATH_E243_PRESENTER_ROUTE_LOCK.selfCheck(),presenter=window.BAUMAN_MATH_THEORY_E132.selfCheck();
      return{presenter,routeId:route.deckLessonId,routeTitle:route.deckLessonTitle,routingGhost:route.routingGhostPresent,routeGuardInstalled:route.publicOpenGuardInstalled,richness};
    });
    assert.equal(opened.presenter.slides,22,`${lesson.key}: presenter slide count drift ${JSON.stringify(opened)}`);
    assert.equal(opened.presenter.currentIndex,0,`${lesson.key}: presenter did not open at slide 1`);
    assert.equal(opened.routeId,lesson.id,`${lesson.key}: presenter route identity drift`);
    assert.ok(opened.routeTitle&&!opened.routingGhost,`${lesson.key}: missing title or routing ghost`);
    assert.deepEqual(opened.richness.counts,{slides:22,diagrams:lesson.diagrams,retrievalChecks:lesson.retrievalChecks,misconceptions:lesson.misconceptions},`${lesson.key}: Reader Pro richness drift`);
    for(let index=1;index<22;index+=1)await queryPage.keyboard.press('ArrowRight');
    const forward=await queryPage.evaluate(()=>window.BAUMAN_MATH_THEORY_E132.selfCheck());
    assert.equal(forward.slides,22,`${lesson.key}: presenter slide total changed during navigation`);
    assert.equal(forward.currentIndex,21,`${lesson.key}: forward navigation did not reach slide 22`);
    for(let index=1;index<22;index+=1)await queryPage.keyboard.press('ArrowLeft');
    const reverse=await queryPage.evaluate(()=>window.BAUMAN_MATH_THEORY_E132.selfCheck());
    assert.equal(reverse.currentIndex,0,`${lesson.key}: reverse navigation did not return to slide 1`);
    summary.mathRuntime[lesson.key]={lessonId:lesson.id,sourceSlides:22,readerSlides:22,navigation:'01/22 -> 22/22 -> 01/22',identitySynchronized:true,richness:opened.richness.counts};
    await queryPage.keyboard.press('Escape');
    await queryPage.waitForFunction(()=>!document.querySelector('.e132-overlay-deck.open'));
  }
  await queryPage.close();

  assert.deepEqual(summary.consoleErrors,[],'Console errors detected');
  assert.deepEqual(summary.pageErrors,[],'Page errors detected');
  assert.deepEqual(summary.failedRequests,[],'Failed requests detected');
  assert.deepEqual(summary.httpErrors,[],'HTTP errors detected');
  summary.status='PASS';
  summary.acceptance={appManagerManagedAccess:true,localAuthBypassed:true,reloadBypassStable:true,unsafeRouteRejected:true,adminRouteProtected:true,allSubjectRoutes:true,queryTaskHydration:true,forgedMessagesRejected:true,legitimateProgressAccepted:true,mathLessonRuntimeRegression:true};
  summary.completedAt=new Date().toISOString();
  await context.close();
  await browser.close();
  browser=null;
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(summary,null,2));
  console.log('SYSTEM_BROWSER_ACCEPTANCE_PASS');
  console.log(JSON.stringify({subjects:Object.keys(summary.subjects).length,responsive:Object.keys(summary.responsive),acceptance:summary.acceptance,ignoredDecorativeAborts:summary.ignoredDecorativeAborts.length},null,2));
}catch(error){
  summary.status='FAIL';summary.error=String(error?.stack||error);summary.completedAt=new Date().toISOString();
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(summary,null,2));
  console.error('SYSTEM_BROWSER_ACCEPTANCE_FAIL');console.error(summary.error);process.exitCode=1;
}finally{if(browser)await browser.close()}
