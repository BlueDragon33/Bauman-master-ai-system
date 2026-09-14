import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/system-browser';
const SUBJECTS=['ai','foundation','math','programming','research','russian','signal','systems'];
const SIMPLE=new Set(['ai','foundation','research','signal','systems']);
const summary={status:'RUNNING',subjects:{},responsive:{},consoleErrors:[],pageErrors:[],failedRequests:[],httpErrors:[]};
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
  page.on('requestfailed',request=>{if(!request.url().startsWith('http://127.0.0.1:3003/'))summary.failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText||''}`)});
  page.on('response',response=>{if(response.status()>=400)summary.httpErrors.push(`${response.status()} ${response.url()}`)});

  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});
  assert.equal(await page.locator('#authTitle').textContent(),'Thiết lập quản trị viên đầu tiên');
  assert.equal(await page.locator('#loginEmail').inputValue(),'');
  assert.equal(await page.locator('#loginPass').inputValue(),'');
  await page.locator('#loginEmail').fill('system-e2e@example.test');
  await page.locator('#loginPass').fill('system-e2e-pass');
  await page.locator('#loginBtn').click();
  await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'));
  const localAccount=await page.evaluate(()=>{const users=JSON.parse(localStorage.getItem('bauman_main_users_fullcode_v1')||'[]');return{role:window.auth?.current?.role,count:users.length,hashed:Boolean(users[0]?.passwordHash&&users[0]?.passwordSalt),plain:Object.hasOwn(users[0]||{},'password')}});
  assert.deepEqual(localAccount,{role:'admin',count:1,hashed:true,plain:false});

  await page.evaluate(()=>localStorage.removeItem('bauman_current_user_fullcode_v1'));
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:15000});
  assert.equal(await page.locator('#authTitle').textContent(),'Đăng nhập lộ trình Bauman');
  await page.locator('#loginEmail').fill('system-e2e@example.test');
  await page.locator('#loginPass').fill('system-e2e-pass');
  await page.locator('#loginBtn').click();
  await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'));

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
  await queryPage.close();

  assert.deepEqual(summary.consoleErrors,[],'Console errors detected');
  assert.deepEqual(summary.pageErrors,[],'Page errors detected');
  assert.deepEqual(summary.failedRequests,[],'Failed requests detected');
  assert.deepEqual(summary.httpErrors,[],'HTTP errors detected');
  summary.status='PASS';
  summary.acceptance={firstUseHashedAccount:true,existingLogin:true,unsafeRouteRejected:true,adminRouteProtected:true,allSubjectRoutes:true,queryTaskHydration:true,forgedMessagesRejected:true,legitimateProgressAccepted:true};
  summary.completedAt=new Date().toISOString();
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(summary,null,2));
  console.log('SYSTEM_BROWSER_ACCEPTANCE_PASS');
  console.log(JSON.stringify({subjects:Object.keys(summary.subjects).length,responsive:Object.keys(summary.responsive),acceptance:summary.acceptance},null,2));
  await context.close();
}catch(error){
  summary.status='FAIL';summary.error=String(error?.stack||error);summary.completedAt=new Date().toISOString();
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(summary,null,2));
  console.error('SYSTEM_BROWSER_ACCEPTANCE_FAIL');console.error(summary.error);process.exitCode=1;
}finally{if(browser)await browser.close()}
