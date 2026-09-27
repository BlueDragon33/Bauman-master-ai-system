import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/bauman-future-ui';
fs.mkdirSync(OUT,{recursive:true});
const px=v=>Number.parseFloat(String(v||'0'))||0;

async function assertNoOverflow(page,label){
  const v=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(v.scroll<=v.client+2,label+' horizontal overflow '+JSON.stringify(v));
  return v;
}
async function openRoute(page,route){
  await page.evaluate(r=>window.app?.page?.(r,false),route);
  await page.waitForSelector('#page-'+route+'.active',{state:'visible',timeout:10000});
  await page.waitForTimeout(80);
}
let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();
  const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));

  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.app&&window.BAUMAN_FUTURE_UI&&document.getElementById('appRoot')&&!document.getElementById('appRoot').classList.contains('hidden'),null,{timeout:30000});

  const core=await page.evaluate(()=>({
    release:window.BAUMAN_FUTURE_UI?.selfCheck?.(),
    touch:getComputedStyle(document.documentElement).getPropertyValue('--ui-touch').trim(),
    surface:getComputedStyle(document.documentElement).getPropertyValue('--ui-surface-primary').trim(),
    sidebar:getComputedStyle(document.querySelector('.sidebar')).backgroundColor,
    sidebarShadow:getComputedStyle(document.querySelector('.sidebar')).boxShadow,
    topbarShadow:getComputedStyle(document.querySelector('.topbar')).boxShadow,
    wallpaper:document.body.dataset.hubWallpaper
  }));
  assert.equal(core.touch,'44px','44px touch token missing');
  assert.equal(core.release?.palette,true,'Command palette not mounted');
  assert.equal(core.release?.mobileNav,true,'Mobile nav not mounted');
  assert.equal(core.wallpaper,'plain','Decorative wallpaper remains default');
  assert.equal(core.sidebarShadow,'none','Canonical shell still has heavy sidebar shadow');
  assert.equal(core.topbarShadow,'none','Canonical shell still has heavy topbar shadow');

  const shellByRoute={};
  for(const route of ['home','roadmap','subjects','schedule','research']){
    await openRoute(page,route);
    await assertNoOverflow(page,'Desktop '+route);
    shellByRoute[route]=await page.evaluate(()=>({
      sidebarWidth:Math.round(document.querySelector('.sidebar').getBoundingClientRect().width),
      sidebarBg:getComputedStyle(document.querySelector('.sidebar')).backgroundColor,
      sidebarShadow:getComputedStyle(document.querySelector('.sidebar')).boxShadow,
      topbarHeight:Math.round(document.querySelector('.topbar').getBoundingClientRect().height),
      topbarShadow:getComputedStyle(document.querySelector('.topbar')).boxShadow
    }));
  }
  const shellBaseline=shellByRoute.home;
  for(const [route,shape] of Object.entries(shellByRoute)){
    assert.equal(shape.sidebarWidth,shellBaseline.sidebarWidth,'App Shell sidebar width changed on '+route);
    assert.equal(shape.sidebarBg,shellBaseline.sidebarBg,'App Shell sidebar surface changed on '+route);
    assert.equal(shape.sidebarShadow,'none','Heavy sidebar shadow returned on '+route);
    assert.equal(shape.topbarHeight,shellBaseline.topbarHeight,'App Shell topbar height changed on '+route);
    assert.equal(shape.topbarShadow,'none','Heavy topbar shadow returned on '+route);
  }

  // Command palette keyboard acceptance.
  await page.keyboard.press(process.platform==='darwin'?'Meta+K':'Control+K');
  await page.waitForSelector('#baumanCommandPalette:not([hidden])',{state:'visible'});
  const palette=await page.evaluate(()=>({
    dialog:!!document.querySelector('#baumanCommandPalette .ui-command'),
    options:document.querySelectorAll('#baumanCommandResults [data-ui-command-index]').length,
    focused:document.activeElement?.id
  }));
  assert.ok(palette.dialog,'Command dialog missing');
  assert.ok(palette.options>=5,'Command palette lacks useful results');
  assert.equal(palette.focused,'baumanCommandInput','Command input not focused');
  await page.keyboard.type('Lịch');
  await page.keyboard.press('Enter');
  await page.waitForSelector('#page-schedule.active',{state:'visible'});

  // Focus mode acceptance.
  await page.evaluate(()=>window.BAUMAN_FUTURE_UI.setFocus(true));
  const focus=await page.evaluate(()=>({
    mode:document.body.dataset.uiFocusMode,
    sidebar:getComputedStyle(document.querySelector('.sidebar')).display,
    topbar:getComputedStyle(document.querySelector('.topbar')).display,
    banner:getComputedStyle(document.getElementById('baumanFocusBanner')).display
  }));
  assert.equal(focus.mode,'true');
  assert.equal(focus.sidebar,'none');
  assert.equal(focus.topbar,'none');
  assert.notEqual(focus.banner,'none');
  await page.evaluate(()=>window.BAUMAN_FUTURE_UI.setFocus(false));

  // Dark mode must have a distinct authored surface scale.
  await page.evaluate(()=>{
    const theme=document.getElementById('themeSelect');
    theme.value='night';theme.dispatchEvent(new Event('change',{bubbles:true}));
  });
  await page.waitForTimeout(80);
  const dark=await page.evaluate(()=>({
    canvas:getComputedStyle(document.documentElement).getPropertyValue('--ui-canvas').trim(),
    surface:getComputedStyle(document.documentElement).getPropertyValue('--ui-surface-primary').trim(),
    text:getComputedStyle(document.documentElement).getPropertyValue('--ui-text-primary').trim()
  }));
  assert.ok(dark.canvas&&dark.surface&&dark.text,'Dark tokens missing');
  assert.notEqual(dark.canvas,core.surface,'Dark theme did not materially change authored surfaces');

  // Restore default before screenshots.
  await page.evaluate(()=>{
    const theme=document.getElementById('themeSelect');
    theme.value='academic';theme.dispatchEvent(new Event('change',{bubbles:true}));
  });
  await openRoute(page,'home');
  await page.setViewportSize({width:1920,height:1080});
  await assertNoOverflow(page,'1920 home');
  await page.evaluate(()=>{const t=document.getElementById('toast');if(t)t.style.display='none'});
  await page.screenshot({path:path.join(OUT,'desktop-1920-home.png'),fullPage:false});

  await page.setViewportSize({width:1440,height:1000});
  await openRoute(page,'subjects');
  await assertNoOverflow(page,'1440 subjects');
  await page.evaluate(()=>{const t=document.getElementById('toast');if(t)t.style.display='none'});
  await page.screenshot({path:path.join(OUT,'desktop-1440-subjects.png'),fullPage:false});

  // Tablet
  await page.setViewportSize({width:768,height:1024});
  for(const route of ['home','roadmap','subjects','schedule','research']){
    await openRoute(page,route);
    await assertNoOverflow(page,'Tablet '+route);
  }
  const tablet=await page.evaluate(()=>({
    sidebar:getComputedStyle(document.querySelector('.sidebar')).display,
    mobileNav:getComputedStyle(document.getElementById('baumanMobileNav')).display
  }));
  assert.equal(tablet.sidebar,'none','Desktop sidebar still shown on tablet');
  assert.notEqual(tablet.mobileNav,'none','Mobile/tablet navigation missing');
  await openRoute(page,'schedule');
  await page.evaluate(()=>{const t=document.getElementById('toast');if(t)t.style.display='none'});
  await page.screenshot({path:path.join(OUT,'tablet-768-schedule.png'),fullPage:false});

  // Mobile
  await page.setViewportSize({width:390,height:844});
  for(const route of ['home','roadmap','subjects','schedule','research']){
    await openRoute(page,route);
    await assertNoOverflow(page,'Mobile '+route);
  }
  const mobile=await page.evaluate(()=>({
    nav:getComputedStyle(document.getElementById('baumanMobileNav')).display,
    active:[...document.querySelectorAll('#baumanMobileNav [aria-current="page"]')].map(x=>x.dataset.uiPage),
    targets:[...document.querySelectorAll('#baumanMobileNav button')].map(x=>Math.round(x.getBoundingClientRect().height))
  }));
  assert.notEqual(mobile.nav,'none');
  assert.deepEqual(mobile.active,['research'],'Mobile nav active route did not sync');
  assert.ok(mobile.targets.every(x=>x>=44),'Mobile nav has touch targets below 44px');
  await page.evaluate(()=>{const t=document.getElementById('toast');if(t)t.style.display='none'});
  await page.screenshot({path:path.join(OUT,'mobile-390-research.png'),fullPage:false});

  assert.deepEqual(errors,[],'Future UI browser emitted console/page errors');
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({core,shellByRoute,palette,focus,dark,tablet,mobile},null,2));
  console.log('BAUMAN_FUTURE_UI_BROWSER_PASS');
}finally{
  await browser?.close();
}
