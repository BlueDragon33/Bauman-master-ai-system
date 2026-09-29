import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/future-interface-system';
fs.mkdirSync(OUT,{recursive:true});

const targets=[
  ['hub','index.html'],
  ['ai','subjects/ai/index.html'],
  ['foundation','subjects/foundation/index.html'],
  ['math','subjects/math/index.html'],
  ['programming','subjects/programming/index.html'],
  ['russian','subjects/russian/index.html'],
  ['signal','subjects/signal/index.html'],
  ['systems','subjects/systems/index.html'],
  ['research','subjects/research/index.html'],
  ['editor','subjects/programming/editor.html'],
  ['simulation','subjects/math/simulations/sim_vector_projection.html']
];

async function inspect(page,name,url,viewport){
  await page.setViewportSize(viewport);
  await page.goto(new URL(url,BASE).href,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_UI?.selfCheck?.().ready===true,null,{timeout:15000});
  await page.waitForTimeout(180);
  const data=await page.evaluate(()=>({
    ready:window.BAUMAN_UI?.selfCheck?.().ready,
    font:parseFloat(getComputedStyle(document.body).fontSize)||0,
    client:document.documentElement.clientWidth,
    scroll:document.documentElement.scrollWidth,
    touch:getComputedStyle(document.documentElement).getPropertyValue('--bui-touch').trim(),
    canvas:getComputedStyle(document.documentElement).getPropertyValue('--bui-surface-canvas').trim(),
    title:document.title
  }));
  assert.equal(data.ready,true,name+' UI kernel not ready');
  assert.ok(data.font>=15.5,name+' body typography below 16px baseline');
  assert.ok(data.scroll<=data.client+4,name+' horizontal document overflow '+JSON.stringify(data));
  assert.equal(data.touch,'44px',name+' touch target token mismatch');
  return data;
}

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();
  const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e?.message||e)));

  const desktop={};
  for(const [name,url] of targets) desktop[name]=await inspect(page,name,url,{width:1440,height:1000});

  // Global shell screenshots required by the design prompt.
  for(const width of [1920,1440,768,390]){
    await page.setViewportSize({width,height:width>=1000?1080:844});
    await page.goto(new URL('index.html',BASE).href,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.BAUMAN_UI?.selfCheck?.().ready===true);
    await page.waitForTimeout(180);
    await page.screenshot({path:path.join(OUT,`hub-${width}.png`),fullPage:false});
  }

  // Mobile architecture smoke across representative module families.
  const mobile={};
  for(const [name,url] of [['hub','index.html'],['generic-subject','subjects/ai/index.html'],['core-subject','subjects/programming/index.html'],['russian','subjects/russian/index.html'],['math','subjects/math/index.html'],['simulation','subjects/math/simulations/sim_vector_projection.html']]){
    mobile[name]=await inspect(page,name,url,{width:390,height:844});
  }

  // Token-driven dark mode must materially change surface without automatic inversion.
  await page.goto(new URL('index.html',BASE).href,{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>document.body.dataset.uiTheme='dark');
  const dark=await page.evaluate(()=>({
    bg:getComputedStyle(document.body).backgroundColor,
    canvas:getComputedStyle(document.documentElement).getPropertyValue('--bui-surface-canvas').trim()
  }));
  assert.equal(dark.canvas,'#0d1118','Dark token scale did not activate');

  // Keyboard modality and reduced motion are global behaviors.
  await page.keyboard.press('Tab');
  const runtime=await page.evaluate(()=>window.BAUMAN_UI.selfCheck());
  assert.equal(runtime.inputMode,'keyboard','Keyboard modality was not detected');
  assert.equal(runtime.reducedMotion,true,'Reduced-motion preference was not propagated');

  // UI-E5 navigation is progressive enhancement: it mirrors route state but never owns routing.
  const navigation=await page.evaluate(()=>({
    check:window.BAUMAN_UI.selfCheck(),
    mobileCount:document.querySelectorAll('[data-bui-mobile-nav] [data-page]').length,
    navLabel:document.querySelector('#nav')?.getAttribute('aria-label')||'',
    skip:!!document.querySelector('[data-bui-skip]')
  }));
  assert.equal(navigation.check.routeOwnership,false,'UI-E5 must not own application routing');
  assert.equal(navigation.check.navigationReady,true,'UI-E5 navigation did not initialize');
  assert.equal(navigation.mobileCount,5,'UI-E5 mobile navigation must mirror the five primary Hub routes');
  assert.ok(navigation.navLabel.length>0,'Primary navigation requires an accessible label');
  assert.equal(navigation.skip,true,'UI-E5 skip-navigation link missing');

  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({desktop,mobile,dark,runtime,pageErrors},null,2));
  console.log('BAUMAN_FUTURE_INTERFACE_SYSTEM_BROWSER_PASS');
}finally{
  await browser?.close();
}
