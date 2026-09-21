import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-future-ui';
fs.mkdirSync(OUT,{recursive:true});

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1672,height:941}});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.addInitScript(()=>{
    const speech={count:0,last:null};
    class MockUtterance{constructor(text){this.text=String(text);this.lang='';this.rate=1;}}
    Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:MockUtterance});
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel(){},speak(u){speech.count++;speech.last={text:u.text,lang:u.lang,rate:u.rate}}}});
    window.__RF_SPEECH=speech;
  });

  await page.goto(new URL('subjects/russian/index.html',BASE).href,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('body.ru-future-ui',{timeout:15000});
  await page.waitForSelector('.rf-dashboard .rf-module-card',{timeout:15000});

  assert.equal((await page.locator('#subjectTitle').innerText()).trim(),'Tiếng Nga','Russian-only visible brand drifted');
  assert.match(await page.locator('#subjectSubtitle').innerText(),/Nghe.*Nói.*Đọc.*Viết/);
  assert.equal(await page.locator('.ru-right-rail').evaluate(el=>getComputedStyle(el).display),'none','Fixed right rail must be removed from future layout');

  const dims=await page.evaluate(()=> {
    const box=s=>{const r=document.querySelector(s)?.getBoundingClientRect();return r?{x:r.x,y:r.y,w:r.width,h:r.height}:null};
    const modules=[...document.querySelectorAll('.rf-module-card')].map(el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}});
    return {
      vw:innerWidth,scroll:document.documentElement.scrollWidth,
      sidebar:box('.ru-sidebar'),main:box('.ru-main'),hero:box('.overview-top-only-hero'),
      progress:box('.rf-progress-strip'),modules,
      lower:box('.rf-dashboard-lower')
    };
  });
  assert.ok(dims.sidebar&&dims.sidebar.w>=205&&dims.sidebar.w<=235,'Sidebar width must stay close to 220px reference');
  assert.ok(dims.main&&dims.main.w>1300,'Main learning canvas must use space released by old right rail');
  assert.ok(dims.hero&&dims.hero.h>=240&&dims.hero.h<=285,'Hero height drifted from reference rhythm');
  assert.ok(dims.progress&&dims.progress.h>=70&&dims.progress.h<=100,'Progress strip height drifted');
  assert.equal(dims.modules.length,5,'Overview must contain exactly five core module cards');
  assert.ok(Math.max(...dims.modules.map(x=>x.y))-Math.min(...dims.modules.map(x=>x.y))<3,'Five module cards must share one row at 16:9 desktop');
  assert.ok(Math.max(...dims.modules.map(x=>x.w))-Math.min(...dims.modules.map(x=>x.w))<4,'Five module cards must have balanced widths');
  assert.ok(dims.lower&&dims.lower.w>1200,'Lower dashboard grid must remain wide and balanced');
  assert.ok(dims.scroll<=dims.vw+2,'Future Russian UI must not horizontally overflow at reference viewport');

  const dashboardText=await page.locator('.rf-dashboard').innerText();
  for(const label of ['Nghe & Nói','Bảng chữ cái','Từ vựng','Ngữ pháp','Luyện chữ','Hôm nay học gì?','Phát âm nhanh','Tiến độ hiện tại','Lộ trình kỹ năng']){
    assert.ok(dashboardText.includes(label),'Overview summary missing '+label);
  }

  await page.locator('[data-rf-speak="привет"]').click();
  const speech=await page.evaluate(()=>window.__RF_SPEECH);
  assert.equal(speech.last?.text,'привет');
  assert.equal(speech.last?.lang,'ru-RU');

  const tabs=['learning','media','writing','vocab','grammar','dialogue','mindmap','storage'];
  for(const view of tabs){
    await page.click('#nav [data-view="'+view+'"]');
    await page.waitForSelector('#view > .rf-tab-intro[data-view="'+view+'"]',{timeout:10000});
    const visible=await page.locator('#view > .rf-tab-intro').isVisible();
    assert.equal(visible,true,'Future intro missing for '+view);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
    assert.ok(overflow<=2,'Horizontal overflow in '+view+': '+overflow);
  }

  await page.click('#nav [data-view="overview"]');
  await page.waitForSelector('.rf-dashboard');
  await page.screenshot({path:path.join(OUT,'russian-future-overview-1672x941.png'),fullPage:true});

  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(120);
  const mobile=await page.evaluate(()=>({
    scroll:document.documentElement.scrollWidth,
    vw:innerWidth,
    modules:document.querySelectorAll('.rf-module-card').length,
    searchVisible:getComputedStyle(document.querySelector('.ru-global-search-wrap')).display!=='none'
  }));
  assert.ok(mobile.scroll<=mobile.vw+2,'Future UI mobile horizontal overflow');
  assert.equal(mobile.modules,5);
  assert.equal(mobile.searchVisible,true);
  await page.screenshot({path:path.join(OUT,'russian-future-overview-mobile.png'),fullPage:true});

  assert.deepEqual(errors,[],'Future Russian UI emitted browser errors');
  fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify({status:'PASS',dims,mobile},null,2));
  console.log('RUSSIAN_FUTURE_UI_BROWSER_PASS');
}finally{await browser?.close()}
