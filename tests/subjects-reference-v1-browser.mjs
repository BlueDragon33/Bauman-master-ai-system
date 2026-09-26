import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/subjects-reference-v1';
fs.mkdirSync(OUT,{recursive:true});

async function mockControl(page){
  const deviceId='c'.repeat(64),deviceCode='BM-SUBJECTS-E2E';
  const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{
    const req=route.request();
    if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const pathname=new URL(req.url()).pathname,headers={...cors,'content-type':'application/json'};
    const send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
    if(pathname==='/api/device/register'||pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/challenge')return send({challengeId:'challenge-subjects-e2e',signingInput:'bauman-subjects-e2e:'+deviceId});
    if(pathname==='/api/device/verify')return send({sessionToken:'bm1.subjects-e2e',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});
    return route.fulfill({status:404,headers,body:'{}'});
  });
}

async function openSubjects(page){
  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:30000});
  await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_SUBJECTS_REF?.selfCheck?.().patched===true,null,{timeout:15000});
  await page.evaluate(()=>window.app?.page?.('subjects',false));
  await page.waitForSelector('#page-subjects .subjects-page',{state:'visible',timeout:15000});
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

  await openSubjects(page);

  const before=await page.evaluate(()=>({
    nav:document.getElementById('nav')?.innerHTML||'',
    topbar:document.querySelector('.topbar')?.innerHTML||'',
    navOrder:[...document.querySelectorAll('#nav [data-page]')].map(x=>x.dataset.page),
    ui:window.BAUMAN_SUBJECTS_REF?.selfCheck?.(),
    pageTitle:document.querySelector('#page-subjects .subjects-page__header h2')?.textContent,
    summary:document.querySelectorAll('#page-subjects .subjects-page__summary-card').length,
    courses:document.querySelectorAll('#page-subjects .subjects-page__course-card').length,
    aiRows:document.querySelectorAll('#page-subjects .subjects-page__ai-list>button').length,
    footer:document.querySelectorAll('#page-subjects .subjects-page__footer>.subjects-page__panel').length
  }));

  assert.deepEqual(before.navOrder,['home','roadmap','subjects','schedule','research'],'Subjects rebuild changed primary navigation');
  assert.equal(before.ui?.active,true,'Subjects reference UI is not active');
  assert.equal(before.pageTitle,'Môn học','Subjects page title mismatch');
  assert.equal(before.summary,4,'Subjects summary must contain four cards');
  assert.equal(before.courses,6,'Reference Subjects state must show six course cards');
  assert.equal(before.aiRows,4,'AI assistant must show four suggestions');
  assert.equal(before.footer,3,'Subjects footer must contain progress, heatmap and notes');

  const geometry=await page.evaluate(()=>{
    const workspace=document.querySelector('#page-subjects .subjects-page__workspace');
    const list=document.querySelector('#page-subjects .subjects-page__course-list');
    const rail=document.querySelector('#page-subjects .subjects-page__right-rail');
    const cards=[...document.querySelectorAll('#page-subjects .subjects-page__course-card')];
    const wr=workspace.getBoundingClientRect(),lr=list.getBoundingClientRect(),rr=rail.getBoundingClientRect();
    return {
      ratio:lr.width/rr.width,
      courseColumns:new Set(cards.slice(0,2).map(x=>Math.round(x.getBoundingClientRect().top))).size===1,
      firstHeight:cards[0]?.getBoundingClientRect().height||0,
      workspaceWidth:wr.width
    };
  });
  assert.ok(geometry.ratio>1.75&&geometry.ratio<2.35,'Desktop subjects workspace is not close to the reference 67/33 split');
  assert.equal(geometry.courseColumns,true,'Desktop course grid is not two columns');
  assert.ok(geometry.firstHeight>=138&&geometry.firstHeight<=155,'Course-card density drifted from the reference');

  await page.evaluate(()=>window.BAUMAN_SUBJECTS_REF.toggleTab('exam'));
  assert.equal(await page.locator('#page-subjects .subjects-page__course-card').count(),1,'Sắp thi filter did not reduce list to one course');
  await page.evaluate(()=>window.BAUMAN_SUBJECTS_REF.toggleTab('all'));
  assert.equal(await page.locator('#page-subjects .subjects-page__course-card').count(),6,'All filter did not restore reference six cards');

  await page.evaluate(()=>window.BAUMAN_SUBJECTS_REF.toggleFilter());
  await page.waitForSelector('#page-subjects .subjects-page__filter-panel.is-open',{state:'visible'});
  await page.evaluate(()=>window.BAUMAN_SUBJECTS_REF.toggleFilter());

  await page.evaluate(()=>window.BAUMAN_SUBJECTS_REF.toggleAI('math'));
  const aiMath=await page.locator('#page-subjects .subjects-page__ai-list>button').nth(2).getAttribute('class');
  assert.ok(aiMath?.includes('is-done'),'AI suggestion checkbox interaction failed');

  await page.evaluate(()=>window.BAUMAN_SUBJECTS_REF.shiftCalendar(1));
  const calendarTitle=await page.textContent('#page-subjects .subjects-page__calendar .subjects-page__panel-head>b');
  assert.ok(calendarTitle?.includes('4, 2025'),'Calendar next-month interaction failed');
  await page.evaluate(()=>window.BAUMAN_SUBJECTS_REF.shiftCalendar(-1));

  await page.evaluate(()=>window.BAUMAN_SUBJECTS_REF.openAddCourse());
  await page.waitForSelector('#page-subjects .subjects-page__modal',{state:'visible'});
  await page.evaluate(()=>window.BAUMAN_SUBJECTS_REF.closeAddCourse());

  const after=await page.evaluate(()=>({
    nav:document.getElementById('nav')?.innerHTML||'',
    topbar:document.querySelector('.topbar')?.innerHTML||'',
    activePage:[...document.querySelectorAll('.page.active')].map(x=>x.id),
    ui:window.BAUMAN_SUBJECTS_REF?.selfCheck?.()
  }));
  assert.equal(after.nav,before.nav,'Subjects interactions mutated shared sidebar');
  assert.equal(after.topbar,before.topbar,'Subjects interactions mutated shared topbar');
  assert.deepEqual(after.activePage,['page-subjects'],'Subjects interactions changed active route');
  assert.equal(after.ui?.active,true,'Subjects reference UI disappeared after interaction');

  await page.screenshot({path:path.join(OUT,'subjects-desktop-1672x941.png'),fullPage:true});

  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(200);
  const mobile=await page.evaluate(()=>({
    client:document.documentElement.clientWidth,
    scroll:document.documentElement.scrollWidth,
    columns:getComputedStyle(document.querySelector('#page-subjects .subjects-page__course-grid')).gridTemplateColumns,
    active:window.BAUMAN_SUBJECTS_REF?.selfCheck?.().active
  }));
  assert.ok(mobile.scroll<=mobile.client+1,'Subjects mobile view has horizontal page overflow');
  assert.equal(mobile.active,true,'Subjects reference UI disappeared on mobile');
  await page.screenshot({path:path.join(OUT,'subjects-mobile-390x844.png'),fullPage:true});

  assert.deepEqual(errors,[],'Subjects browser emitted console/page errors');
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({release:before.ui?.release,desktop:true,mobile,geometry,navOrder:before.navOrder},null,2));
  console.log('SUBJECTS_REFERENCE_V1_BROWSER_PASS');
}finally{
  await browser?.close();
}
