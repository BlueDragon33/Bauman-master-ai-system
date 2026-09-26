import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/schedule-reference-v1';
fs.mkdirSync(OUT,{recursive:true});

async function mockControl(page){
  const deviceId='d'.repeat(64),deviceCode='BM-SCHEDULE-E2E';
  const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','cache-control':'no-store'};
  await page.route('http://127.0.0.1:3003/**',async route=>{
    const req=route.request();
    if(req.method()==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    const pathname=new URL(req.url()).pathname,headers={...cors,'content-type':'application/json'};
    const send=body=>route.fulfill({status:200,headers,body:JSON.stringify(body)});
    if(pathname==='/api/device/register'||pathname==='/api/device/status')return send({device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/challenge')return send({challengeId:'challenge-schedule-e2e',signingInput:'bauman-schedule-e2e:'+deviceId});
    if(pathname==='/api/device/verify')return send({sessionToken:'bm1.schedule-e2e',expiresAt:Date.now()+3600000,device:{deviceId,deviceCode,status:'approved'}});
    if(pathname==='/api/device/heartbeat')return send({device:{deviceId,deviceCode,status:'approved'}});
    return route.fulfill({status:404,headers,body:'{}'});
  });
}

async function openSchedule(page){
  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.baumanDeviceAccess==='authorized',null,{timeout:30000});
  await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_SCHEDULE_REF?.selfCheck?.().patched===true,null,{timeout:15000});
  await page.evaluate(()=>window.app?.page?.('schedule',false));
  await page.waitForSelector('#page-schedule .schedule-ref-page',{state:'visible',timeout:15000});
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

  await openSchedule(page);

  const before=await page.evaluate(()=>({
    nav:document.getElementById('nav')?.innerHTML||'',
    topbar:document.querySelector('.topbar')?.innerHTML||'',
    navOrder:[...document.querySelectorAll('#nav [data-page]')].map(x=>x.dataset.page),
    schedule:window.BAUMAN_SCHEDULE_REF?.selfCheck?.(),
    summaries:document.querySelectorAll('#page-schedule .schedule-ref__summary-card').length,
    footer:document.querySelectorAll('#page-schedule .schedule-ref__footer-grid>.schedule-ref__panel').length,
    rightRail:!!document.querySelector('#page-schedule .schedule-ref__right-rail')
  }));
  assert.deepEqual(before.navOrder,['home','roadmap','subjects','schedule','research'],'Schedule rebuild changed primary navigation');
  assert.equal(before.schedule?.active,true,'Schedule reference UI is not active');
  assert.equal(before.schedule?.view,'week','Schedule must open in week view');
  assert.equal(before.summaries,4,'Schedule summary must contain four cards');
  assert.equal(before.footer,3,'Schedule footer must contain progress, workload and notes');
  assert.equal(before.rightRail,true,'Schedule right rail is missing');
  assert.equal(before.schedule?.priorityLegendItems,4,'Schedule must explain all four priority colors');

  await page.evaluate(()=>{
    const nodes=[...document.querySelectorAll('#page-schedule .schedule-ref__event')].slice(0,4);
    if(nodes.length<4)throw new Error('Need at least four schedule events for priority palette QA');
    ['q1','q3','q2','q4'].forEach((priority,i)=>{
      const key=nodes[i].dataset.entryKey;
      if(!key||!state.schedule.entries[key])throw new Error('Missing schedule entry key for priority QA');
      state.schedule.entries[key].priority=priority;
    });
    save();
    window.BAUMAN_SCHEDULE_REF.render();
  });
  const palette=await page.evaluate(()=>{
    const rows=[...document.querySelectorAll('#page-schedule .schedule-ref__event')];
    const byPriority={};
    rows.forEach(x=>{if(x.dataset.priority&&!byPriority[x.dataset.priority])byPriority[x.dataset.priority]=getComputedStyle(x).backgroundColor});
    return {count:rows.length,byPriority,legend:[...document.querySelectorAll('#page-schedule .schedule-ref__priority-legend>span')].map(x=>x.textContent.trim())};
  });
  assert.ok(palette.count>=4,'Schedule week does not expose enough event cards for priority QA');
  assert.deepEqual(Object.keys(palette.byPriority).sort(),['q1','q2','q3','q4'],'All four priority quadrants must be visible when present');
  assert.equal(palette.byPriority.q1,'rgb(253, 235, 236)','q1 must render red/pink emergency-important palette');
  assert.equal(palette.byPriority.q3,'rgb(255, 242, 229)','q3 must render orange urgent-not-important palette');
  assert.equal(palette.byPriority.q2,'rgb(234, 242, 255)','q2 must render blue important-not-urgent palette');
  assert.equal(palette.byPriority.q4,'rgb(234, 247, 239)','q4 must render green non-important/non-urgent palette');
  assert.ok(palette.legend.some(x=>x.includes('Khẩn cấp + Quan trọng')),'Red priority legend is missing');
  assert.ok(palette.legend.some(x=>x.includes('Khẩn cấp + Không quan trọng')),'Orange priority legend is missing');
  assert.ok(palette.legend.some(x=>x.includes('Quan trọng + Không khẩn cấp')),'Blue priority legend is missing');
  assert.ok(palette.legend.some(x=>x.includes('Không quan trọng + Không khẩn cấp')),'Green priority legend is missing');

  await page.evaluate(()=>window.BAUMAN_SCHEDULE_REF.setView('day'));
  await page.waitForSelector('#page-schedule .schedule-ref__day-view',{state:'visible'});
  await page.evaluate(()=>window.BAUMAN_SCHEDULE_REF.setView('month'));
  await page.waitForSelector('#page-schedule .schedule-ref__month-view',{state:'visible'});
  await page.evaluate(()=>window.BAUMAN_SCHEDULE_REF.setView('week'));
  await page.waitForSelector('#page-schedule .schedule-ref__week-calendar',{state:'visible'});

  await page.evaluate(()=>window.BAUMAN_SCHEDULE_REF.toggleFilter());
  await page.waitForSelector('#page-schedule .schedule-ref__filter-panel.is-open',{state:'visible'});
  await page.evaluate(()=>window.BAUMAN_SCHEDULE_REF.toggleFilter());

  await page.evaluate(()=>window.BAUMAN_SCHEDULE_REF.toggleRange());
  await page.waitForSelector('#page-schedule .schedule-ref__range-popover.is-open',{state:'visible'});
  await page.evaluate(()=>window.BAUMAN_SCHEDULE_REF.jumpToDate('2026-06-22'));
  const jumped=await page.evaluate(()=>state.schedule.weekStart);
  assert.equal(jumped,'2026-06-22','Date navigator did not move to the selected week');
  await page.evaluate(()=>window.BAUMAN_SCHEDULE_REF.jumpToDate('2026-06-08'));

  const priorityCopy=await page.textContent('#page-schedule .schedule-ref__priority-summary');
  assert.ok(priorityCopy.includes('Ưu tiên tuần này'),'Priority summary card is missing');
  assert.ok(priorityCopy.includes('đỏ')&&priorityCopy.includes('cam')&&priorityCopy.includes('xanh dương')&&priorityCopy.includes('xanh lá'),'Priority summary does not expose four-level counts');

  const savedWeek=await page.evaluate(()=>state.schedule.weekStart);
  await page.evaluate(()=>{state.schedule.weekStart='2026-07-13';state.schedule.edit=true;save();window.BAUMAN_SCHEDULE_REF.render()});
  const blocked=await page.evaluate(()=>({
    disabledDays:document.querySelectorAll('#page-schedule .schedule-ref__day-col.is-disabled').length,
    emptySlots:document.querySelectorAll('#page-schedule .schedule-ref__empty-slot').length,
    blockedBadges:document.querySelectorAll('#page-schedule .schedule-ref__blocked-badge').length
  }));
  assert.ok(blocked.disabledDays>=1,'No-study dates are not visibly blocked');
  assert.equal(blocked.emptySlots,0,'Manual edit exposed assignable slots on blocked dates');
  assert.ok(blocked.blockedBadges>=1,'Blocked date reason is not visible');
  await page.evaluate(saved=>{state.schedule.weekStart=saved;state.schedule.edit=false;save();window.BAUMAN_SCHEDULE_REF.render()},savedWeek);

  const upcomingBefore=await page.locator('#page-schedule .schedule-ref__upcoming-list>button').count();
  await page.evaluate(()=>window.BAUMAN_SCHEDULE_REF.toggleUpcoming());
  const upcomingAfter=await page.locator('#page-schedule .schedule-ref__upcoming-list>button').count();
  assert.ok(upcomingAfter>=upcomingBefore,'Expand upcoming reduced the visible schedule list');
  await page.evaluate(()=>window.BAUMAN_SCHEDULE_REF.toggleUpcoming());

  await page.evaluate(()=>window.BAUMAN_SCHEDULE_REF.toggleManual());
  await page.waitForSelector('#page-schedule .schedule-ref__today-btn.is-editing',{state:'visible'});
  await page.evaluate(()=>window.BAUMAN_SCHEDULE_REF.toggleManual());
  await page.waitForFunction(()=>!document.querySelector('#page-schedule .schedule-ref__today-btn.is-editing'));

  await page.evaluate(()=>window.BAUMAN_SCHEDULE_REF.openPlan());
  await page.waitForSelector('#modalRoot .schedule-settings-modal',{state:'visible',timeout:10000});
  await page.evaluate(()=>window.closeModal?.());

  const after=await page.evaluate(()=>({
    nav:document.getElementById('nav')?.innerHTML||'',
    topbar:document.querySelector('.topbar')?.innerHTML||'',
    activePage:[...document.querySelectorAll('.page.active')].map(x=>x.id),
    ui:window.BAUMAN_SCHEDULE_REF?.selfCheck?.()
  }));
  assert.equal(after.nav,before.nav,'Schedule interactions mutated shared sidebar');
  assert.equal(after.topbar,before.topbar,'Schedule interactions mutated shared topbar');
  assert.deepEqual(after.activePage,['page-schedule'],'Schedule interactions changed active route');
  assert.equal(after.ui?.view,'week','Schedule did not return to week view');
  await page.waitForTimeout(2800);
  const desktopType=await page.evaluate(()=>({event:parseFloat(getComputedStyle(document.querySelector('#page-schedule .schedule-ref__event b')).fontSize),summary:parseFloat(getComputedStyle(document.querySelector('#page-schedule .schedule-ref__summary-card b')).fontSize)}));
  assert.ok(desktopType.event>=9,'Desktop calendar event type is too small to scan comfortably');
  assert.ok(desktopType.summary>=15,'Desktop summary hierarchy regressed');
  await page.screenshot({path:path.join(OUT,'schedule-desktop-1920x1080.png'),fullPage:true});

  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(250);
  const mobile=await page.evaluate(()=>({
    client:document.documentElement.clientWidth,
    scroll:document.documentElement.scrollWidth,
    weekDisplay:getComputedStyle(document.querySelector('#page-schedule .schedule-ref__week-calendar')).display,
    agendaDisplay:getComputedStyle(document.querySelector('#page-schedule .schedule-ref__mobile-agenda')).display,
    active:window.BAUMAN_SCHEDULE_REF?.selfCheck?.().active
  }));
  assert.ok(mobile.scroll<=mobile.client+1,'Schedule mobile view has horizontal page overflow');
  assert.equal(mobile.weekDisplay,'none','Desktop week grid must collapse on narrow mobile');
  assert.notEqual(mobile.agendaDisplay,'none','Mobile schedule agenda is hidden');
  assert.equal(mobile.active,true,'Schedule reference UI disappeared on mobile');
  const mobileType=await page.evaluate(()=>parseFloat(getComputedStyle(document.querySelector('#page-schedule .schedule-ref__mobile-agenda>button>div b')).fontSize));
  assert.ok(mobileType>=10,'Mobile agenda subject type is too small');
  await page.screenshot({path:path.join(OUT,'schedule-mobile-390x844.png'),fullPage:true});

  assert.deepEqual(errors,[],'Schedule browser emitted console/page errors');
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({release:before.schedule?.release,desktop:true,mobile,navOrder:before.navOrder},null,2));
  console.log('SCHEDULE_REFERENCE_V1_BROWSER_PASS');
}finally{
  await browser?.close();
}