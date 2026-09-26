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
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:30000});
  await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_THESIS_REF?.selfCheck?.().patched===true,null,{timeout:15000});
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
    topbar:document.querySelector('.topbar')?.innerHTML||'',
    navOrder:[...document.querySelectorAll('#nav [data-page]')].map(x=>x.dataset.page),
    active:[...document.querySelectorAll('.page.active')].map(x=>x.id),
    ui:window.BAUMAN_THESIS_REF?.selfCheck?.(),
    title:document.querySelector('#page-research .thesis-page__header h2')?.textContent,
    subtitle:document.querySelector('#page-research .thesis-page__header p')?.textContent,
    metrics:document.querySelectorAll('#page-research .thesis-page__summary-card').length,
    events:document.querySelectorAll('#page-research .thesis-page__event').length,
    ai:document.querySelectorAll('#page-research .thesis-page__ai-list>button').length,
    milestones:document.querySelectorAll('#page-research .thesis-page__milestone-list>button').length,
    bottom:document.querySelectorAll('#page-research .thesis-page__bottom>.thesis-page__panel').length
  }));

  assert.deepEqual(before.navOrder,['home','roadmap','subjects','schedule','research'],'Thesis rebuild changed primary navigation');
  assert.deepEqual(before.active,['page-research'],'Thesis route is not isolated');
  assert.equal(before.ui?.active,true,'Thesis reference UI is not active');
  assert.equal(before.ui?.touchesOnlyResearch,true,'Thesis module scope marker failed');
  assert.equal(before.title,'Luận văn','Thesis page title mismatch');
  assert.ok(before.subtitle?.startsWith('Theo dõi tiến độ luận văn'),'Thesis subtitle mismatch');
  assert.equal(before.metrics,4,'Thesis KPI row must contain four cards');
  assert.equal(before.events,16,'Reference weekly timeline must contain 16 tasks');
  assert.equal(before.ai,5,'Thesis AI assistant must contain five rows');
  assert.equal(before.milestones,4,'Thesis milestones must contain four rows');
  assert.equal(before.bottom,3,'Thesis bottom must contain three panels');

  const geometry=await page.evaluate(()=>{
    const workspace=document.querySelector('#page-research .thesis-page__workspace');
    const plan=document.querySelector('#page-research .thesis-page__plan');
    const rail=document.querySelector('#page-research .thesis-page__right-rail');
    const metrics=[...document.querySelectorAll('#page-research .thesis-page__summary-card')];
    const timeline=document.querySelector('#page-research .thesis-page__timeline');
    const today=document.querySelector('#page-research .thesis-page__day-head.is-today');
    const root=document.querySelector('#page-research .thesis-page');
    const pr=plan.getBoundingClientRect(),rr=rail.getBoundingClientRect();
    return {
      ratio:pr.width/rr.width,
      metricHeights:metrics.map(x=>Math.round(x.getBoundingClientRect().height)),
      timelineHeight:Math.round(timeline.getBoundingClientRect().height),
      todayBg:getComputedStyle(today).backgroundColor,
      rootHeight:Math.round(root.getBoundingClientRect().height),
      viewportHeight:innerHeight,
      workspaceWidth:Math.round(workspace.getBoundingClientRect().width)
    };
  });
  assert.ok(geometry.ratio>1.9&&geometry.ratio<2.45,'Desktop thesis workspace is not close to the 67/33 reference split');
  assert.ok(geometry.metricHeights.every(x=>x>=104&&x<=112),'KPI card height drifted from reference');
  assert.ok(geometry.timelineHeight>=390&&geometry.timelineHeight<=405,'Weekly timeline geometry drifted');
  assert.equal(geometry.todayBg,'rgb(234, 243, 255)','Thursday highlight is not the reference light blue');
  assert.ok(geometry.rootHeight<=875,'Thesis dashboard became too tall for the high-density reference viewport');

  const eventChecks=await page.evaluate(()=>{
    const rows=[...document.querySelectorAll('#page-research .thesis-page__event')];
    const find=title=>rows.find(x=>x.querySelector('b')?.textContent===title);
    const read=x=>x?{bg:getComputedStyle(x).backgroundColor,left:getComputedStyle(x).borderLeftColor,top:x.style.getPropertyValue('--top'),height:x.style.getPropertyValue('--height')}:null;
    return {
      read:read(find('Đọc tài liệu')),
      write:read(rows.find(x=>x.querySelector('b')?.textContent==='Viết chương 3'&&x.textContent.includes('09:00'))),
      meeting:read(find('Họp GVHD')),
      chart:read(find('Hoàn thiện biểu đồ'))
    };
  });
  assert.equal(eventChecks.read?.bg,'rgb(234, 226, 255)','Purple thesis task palette mismatch');
  assert.equal(eventChecks.meeting?.bg,'rgb(255, 241, 199)','Yellow thesis task palette mismatch');
  assert.equal(eventChecks.write?.bg,'rgb(255, 224, 224)','Red thesis task palette mismatch');
  assert.equal(eventChecks.chart?.left,'rgb(223, 89, 96)','Task left accent mismatch');

  await page.evaluate(()=>window.BAUMAN_THESIS_REF.setView('month'));
  assert.ok(await page.locator('#page-research .thesis-page__month-grid').count(),'Month view did not render');
  await page.evaluate(()=>window.BAUMAN_THESIS_REF.setView('gantt'));
  assert.ok(await page.locator('#page-research .thesis-page__gantt').count(),'Gantt view did not render');
  await page.evaluate(()=>window.BAUMAN_THESIS_REF.setView('list'));
  assert.equal(await page.locator('#page-research .thesis-page__task-list>button').count(),16,'List view task count mismatch');
  await page.evaluate(()=>window.BAUMAN_THESIS_REF.setView('week'));

  await page.evaluate(()=>window.BAUMAN_THESIS_REF.toggleFilter());
  await page.waitForSelector('#page-research .thesis-page__filter-panel.is-open',{state:'visible'});
  await page.evaluate(()=>window.BAUMAN_THESIS_REF.toggleFilter());

  await page.evaluate(()=>window.BAUMAN_THESIS_REF.toggleAI('a3'));
  assert.ok((await page.locator('#page-research .thesis-page__ai-list>button').nth(2).getAttribute('class'))?.includes('is-done'),'AI checkbox interaction failed');

  await page.locator('#page-research .thesis-page__event').first().click();
  await page.waitForSelector('#page-research .thesis-page__modal',{state:'visible'});
  await page.evaluate(()=>window.BAUMAN_THESIS_REF.closeTask());

  await page.evaluate(()=>window.BAUMAN_THESIS_REF.openCreate());
  await page.waitForSelector('#page-research .thesis-page__modal',{state:'visible'});
  await page.evaluate(()=>window.BAUMAN_THESIS_REF.closeCreate());

  const note=page.locator('#page-research .thesis-page__notes-grid input').nth(1);
  const wasChecked=await note.isChecked();
  await note.click();
  assert.notEqual(await note.isChecked(),wasChecked,'Note checkbox did not toggle');

  const after=await page.evaluate(()=>({
    nav:document.getElementById('nav')?.innerHTML||'',
    topbar:document.querySelector('.topbar')?.innerHTML||'',
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
    bottom:getComputedStyle(document.querySelector('#page-research .thesis-page__bottom')).gridTemplateColumns
  }));
  assert.ok(mobile.scroll<=mobile.client+1,'Thesis mobile view has horizontal page overflow');
  assert.equal(mobile.active,true,'Thesis reference UI disappeared on mobile');
  await page.screenshot({path:path.join(OUT,'thesis-mobile-390x844.png'),fullPage:false});

  assert.deepEqual(errors,[],'Thesis browser emitted console/page errors');
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({release:before.ui?.release,geometry,eventChecks,mobile,navOrder:before.navOrder},null,2));
  console.log('THESIS_REFERENCE_V1_BROWSER_PASS');
}finally{
  await browser?.close();
}
