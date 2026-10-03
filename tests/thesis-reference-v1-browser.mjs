import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/thesis-reference-v1';
fs.mkdirSync(OUT,{recursive:true});

async function mockControl(page){
  const deviceId='d'.repeat(64),deviceCode='BM-THESIS-E2E';
  const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{
    const req=route.request();
    if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const pathname=new URL(req.url()).pathname,headers={...cors,'content-type':'application/json'};
    const send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
    if(pathname==='/api/device/register'||pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/challenge')return send({challengeId:'challenge-thesis-e2e',signingInput:'bauman-thesis-e2e:'+deviceId});
    if(pathname==='/api/device/verify')return send({sessionToken:'bm1.thesis-e2e',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});
    return route.fulfill({status:404,headers,body:'{}'});
  });
}

async function openThesis(page){
  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>['standalone','authorized','offline-grace'].includes(document.documentElement.dataset.baumanDeviceAccess),null,{timeout:30000});
  await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_THESIS_REF?.selfCheck?.().patched===true&&window.BAUMAN_HUB_TRUTH?.selfCheck?.().patched===true,null,{timeout:15000});
  await page.evaluate(()=>window.app?.page?.('research',false));
  await page.waitForSelector('#page-research .thesis-page',{state:'visible',timeout:15000});
}

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1672,height:941}});
  const page=await context.newPage();
  await mockControl(page);
  const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));

  await openThesis(page);

  const before=await page.evaluate(()=>({
    nav:document.getElementById('nav')?.innerHTML||'',
    topbar:(()=>{const n=document.querySelector('.topbar')?.cloneNode(true);n?.querySelectorAll('[style]').forEach(x=>{if(!x.getAttribute('style'))x.removeAttribute('style')});return n?.innerHTML||''})(),
    navOrder:[...document.querySelectorAll('#nav [data-page]')].map(x=>x.dataset.page),
    active:[...document.querySelectorAll('.page.active')].map(x=>x.id),
    ui:window.BAUMAN_THESIS_REF?.selfCheck?.(),
    truth:window.BAUMAN_HUB_TRUTH?.selfCheck?.(),
    title:document.querySelector('#page-research .thesis-page__header h2')?.textContent,
    subtitle:document.querySelector('#page-research .thesis-page__header p')?.textContent,
    metrics:document.querySelectorAll('#page-research .thesis-page__summary-card').length,
    statuses:[...document.querySelectorAll('#page-research .thesis-page__summary-card')].map(x=>x.dataset.truthStatus),
    events:document.querySelectorAll('#page-research .thesis-page__event').length,
    ai:document.querySelectorAll('#page-research .thesis-page__ai-list>button').length,
    milestones:document.querySelectorAll('#page-research .thesis-page__milestone-list>button').length,
    bottom:document.querySelectorAll('#page-research .thesis-page__progress,#page-research .thesis-page__heatmap,#page-research .thesis-page__notes').length,
    text:document.querySelector('#page-research .thesis-page')?.textContent||''
  }));

  assert.deepEqual(before.navOrder,['home','roadmap','subjects','schedule','research'],'Thesis rebuild changed primary navigation');
  assert.deepEqual(before.active,['page-research'],'Thesis route is not isolated');
  assert.equal(before.ui?.active,true,'Thesis reference UI is not active');
  assert.equal(before.ui?.touchesOnlyResearch,true,'Thesis module scope marker failed');
  assert.equal(before.truth?.researchReferenceTruthSafe,true,'Research truth adapter is not active');
  assert.equal(before.title,'НИР & Luận văn','Thesis page title mismatch');
  assert.ok(before.subtitle?.includes('LOCAL_HUB'),'Thesis truth/local disclosure missing');
  assert.equal(before.metrics,4,'Thesis KPI row must contain four cards');
  assert.equal(before.events,0,'Thesis must not seed reference timeline tasks');
  assert.equal(before.ai,0,'Thesis must not seed fake AI suggestions');
  assert.equal(before.milestones,0,'Thesis must not seed reference milestones');
  assert.equal(before.bottom,3,'Thesis bottom must contain three panels');
  assert.ok(before.statuses.includes('LOCAL_HUB'),'Thesis summary must label local evidence');
  assert.ok(before.statuses.includes('UNAVAILABLE'),'Thesis summary must expose unavailable capabilities honestly');
  assert.ok(!before.text.includes('65% hoàn thành'),'Reference 65% KPI is still learner-facing');
  assert.ok(!before.text.includes('Báo cáo tiến độ tháng 3'),'Reference milestone is still learner-facing');
  assert.ok(!before.text.includes('Gợi ý cấu trúc chi tiết cho Chương 3'),'Reference AI suggestion is still learner-facing');

  const checklistCount=await page.locator('#page-research input[data-research-check="1"]').count();
  assert.ok(checklistCount>0,'Canonical Research checklist is missing from Thesis workspace');
  const firstCheck=page.locator('#page-research input[data-research-check="1"]').first();
  const checkBefore=await firstCheck.isChecked();
  await firstCheck.click();
  assert.notEqual(await page.locator('#page-research input[data-research-check="1"]').first().isChecked(),checkBefore,'Canonical Research checklist did not persist LOCAL_HUB state');

  const geometry=await page.evaluate(()=>{
    const workspace=document.querySelector('#page-research .thesis-page__workspace');
    const plan=document.querySelector('#page-research .thesis-page__plan');
    const rail=document.querySelector('#page-research .thesis-page__right-rail');
    const metrics=[...document.querySelectorAll('#page-research .thesis-page__summary-card')];
    const timeline=document.querySelector('#page-research .thesis-page__timeline');
    const today=document.querySelector('#page-research .thesis-page__day-head.is-today');
    const pr=plan.getBoundingClientRect(),rr=rail.getBoundingClientRect();
    return {
      ratio:pr.width/rr.width,
      metricHeights:metrics.map(x=>Math.round(x.getBoundingClientRect().height)),
      timelineHeight:Math.round(timeline.getBoundingClientRect().height),
      todayBg:today?getComputedStyle(today).backgroundColor:null,
      metricBodyFont:parseFloat(getComputedStyle(document.querySelector('#page-research .thesis-page__summary-card small')).fontSize)||0,
      workspaceWidth:Math.round(workspace.getBoundingClientRect().width)
    };
  });
  assert.ok(geometry.ratio>1.9&&geometry.ratio<2.45,'Desktop thesis workspace is not close to the 67/33 reference split');
  assert.ok(geometry.metricHeights.every(x=>x>=115),'KPI readable height regressed');
  assert.ok(geometry.timelineHeight>=540,'Weekly timeline readable geometry regressed');
  assert.ok(geometry.metricBodyFont>=12.5,'Thesis KPI copy fell below readable size');

  await page.evaluate(()=>window.BAUMAN_THESIS_REF.setView('month'));
  assert.ok(await page.locator('#page-research .thesis-page__month-grid').count(),'Month view did not render');
  await page.evaluate(()=>window.BAUMAN_THESIS_REF.setView('gantt'));
  assert.ok(await page.locator('#page-research .thesis-page__gantt').count(),'Gantt view did not render');
  await page.evaluate(()=>window.BAUMAN_THESIS_REF.setView('list'));
  assert.equal(await page.locator('#page-research .thesis-page__task-list>button').count(),0,'Empty LOCAL_HUB task list must not contain reference tasks');
  await page.evaluate(()=>window.BAUMAN_THESIS_REF.setView('week'));

  await page.evaluate(()=>window.BAUMAN_THESIS_REF.toggleFilter());
  await page.waitForSelector('#page-research .thesis-page__filter-panel.is-open',{state:'visible'});
  await page.evaluate(()=>window.BAUMAN_THESIS_REF.toggleFilter());

  await page.evaluate(()=>window.BAUMAN_THESIS_REF.openCreate());
  await page.waitForSelector('#page-research .thesis-page__modal',{state:'visible'});
  await page.fill('#thesisTaskTitle','Nhiệm vụ QA LOCAL_HUB');
  const today=await page.evaluate(()=>new Date().toISOString().slice(0,10));
  await page.fill('#thesisTaskDate',today);
  await page.fill('#thesisTaskStart','09:00');
  await page.fill('#thesisTaskEnd','10:30');
  await page.evaluate(()=>window.BAUMAN_THESIS_REF.createTask());
  assert.equal(await page.locator('#page-research .thesis-page__event').count(),1,'User-created LOCAL_HUB task did not appear in week view');
  assert.ok((await page.textContent('#page-research .thesis-page__event')).includes('LOCAL_HUB'),'User-created task is not labeled LOCAL_HUB');

  await page.locator('#page-research .thesis-page__event').first().click();
  await page.waitForSelector('#page-research .thesis-page__modal',{state:'visible'});
  assert.ok((await page.textContent('#page-research .thesis-page__modal')).includes('LOCAL_HUB'),'Task detail lost LOCAL_HUB provenance');
  await page.evaluate(()=>window.BAUMAN_THESIS_REF.closeTask());

  await page.evaluate(()=>window.BAUMAN_THESIS_REF.setView('list'));
  assert.equal(await page.locator('#page-research .thesis-page__task-list>button').count(),1,'List view must contain only the user-created task');
  await page.evaluate(()=>window.BAUMAN_THESIS_REF.setView('week'));

  await page.evaluate(()=>{
    let i=0;window.prompt=()=>++i===1?'Ghi chú QA LOCAL_HUB':'Hôm nay';
    window.BAUMAN_THESIS_REF.addNote();
  });
  const note=page.locator('#page-research .thesis-page__notes-grid input').first();
  assert.equal(await note.count(),1,'User-created LOCAL_HUB note did not render');
  const wasChecked=await note.isChecked();
  await note.click();
  assert.notEqual(await note.isChecked(),wasChecked,'Note checkbox did not toggle');

  const after=await page.evaluate(()=>({
    nav:document.getElementById('nav')?.innerHTML||'',
    topbar:(()=>{const n=document.querySelector('.topbar')?.cloneNode(true);n?.querySelectorAll('[style]').forEach(x=>{if(!x.getAttribute('style'))x.removeAttribute('style')});return n?.innerHTML||''})(),
    active:[...document.querySelectorAll('.page.active')].map(x=>x.id),
    ui:window.BAUMAN_THESIS_REF?.selfCheck?.()
  }));
  assert.equal(after.nav,before.nav,'Thesis interactions mutated shared sidebar');
  assert.equal(after.topbar,before.topbar,'Thesis interactions mutated shared topbar');
  assert.deepEqual(after.active,['page-research'],'Thesis interactions changed active route');
  assert.equal(after.ui?.active,true,'Thesis reference UI disappeared after interaction');

  await page.screenshot({path:path.join(OUT,'thesis-desktop-1672x941.png'),fullPage:false});

  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(200);
  const mobile=await page.evaluate(()=>({
    client:document.documentElement.clientWidth,
    scroll:document.documentElement.scrollWidth,
    active:window.BAUMAN_THESIS_REF?.selfCheck?.().active,
    metrics:getComputedStyle(document.querySelector('#page-research .thesis-page__metrics')).gridTemplateColumns,
    bottom:getComputedStyle(document.querySelector('#page-research .thesis-page__left-bottom')).gridTemplateColumns
  }));
  assert.ok(mobile.scroll<=mobile.client+1,'Thesis mobile view has horizontal page overflow');
  assert.equal(mobile.active,true,'Thesis reference UI disappeared on mobile');
  await page.screenshot({path:path.join(OUT,'thesis-mobile-390x844.png'),fullPage:false});

  assert.deepEqual(errors,[],'Thesis browser emitted console/page errors');
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({release:before.ui?.release,geometry,mobile,navOrder:before.navOrder},null,2));
  console.log('THESIS_REFERENCE_V1_BROWSER_PASS');
}finally{
  await browser?.close();
}
