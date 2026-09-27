import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/readable-typography-v1';
fs.mkdirSync(OUT,{recursive:true});

const px=v=>Number.parseFloat(String(v||'0'))||0;
let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();
  const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));

  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.app&&document.getElementById('appRoot')&&!document.getElementById('appRoot').classList.contains('hidden'),null,{timeout:20000});
  await page.waitForFunction(()=>window.BAUMAN_SUBJECTS_REF?.selfCheck?.().patched&&window.BAUMAN_SCHEDULE_REF?.selfCheck?.().patched&&window.BAUMAN_THESIS_REF?.selfCheck?.().patched,null,{timeout:15000});

  await page.evaluate(()=>{
    state.fontSize='normal';
    save();
    applyAppearance();
  });

  const samples={};
  async function sample(route,selector){
    await page.evaluate(r=>window.app.page(r,false),route);
    await page.waitForSelector(selector,{state:'visible',timeout:10000});
    samples[route]=await page.$eval(selector,el=>({font:getComputedStyle(el).fontSize,line:getComputedStyle(el).lineHeight,text:el.textContent.trim().slice(0,80)}));
  }
  await sample('home','#page-home .canva-main-hero p');
  await sample('roadmap','#page-roadmap .canva-roadmap-hero p');
  await sample('subjects','#page-subjects .subjects-page__course-name b');
  await sample('schedule','#page-schedule .schedule-ref__event b');
  await sample('research','#page-research .thesis-page__event b');

  assert.ok(px(samples.home.font)>=14.4,'Home copy remains too small');
  assert.ok(px(samples.roadmap.font)>=14.4,'Roadmap copy remains too small');
  assert.ok(px(samples.subjects.font)>=15.5,'Subjects course title remains too small');
  assert.ok(px(samples.schedule.font)>=13.3,'Schedule event title remains too small');
  assert.ok(px(samples.research.font)>=12.8,'Thesis event title remains too small');

  const shell=await page.evaluate(()=>({
    nav:getComputedStyle(document.querySelector('#nav button')).fontSize,
    topButton:getComputedStyle(document.querySelector('.top-actions .btn')).fontSize,
    subtitle:getComputedStyle(document.querySelector('.top-title p')).fontSize,
    body:getComputedStyle(document.body).fontSize
  }));
  assert.ok(px(shell.nav)>=14.8,'Sidebar text remains too small');
  assert.ok(px(shell.topButton)>=14.3,'Topbar button text remains too small');
  assert.ok(px(shell.subtitle)>=13.3,'Topbar subtitle remains too small');
  assert.ok(px(shell.body)>=15.8,'Normal body size is not ChatGPT-like 16px');

  await page.click('#appearanceBtn');
  await page.waitForSelector('#appearanceMenu:not(.hidden)',{state:'visible'});
  const appearanceBefore=await page.$eval('#fontSizeSelect',el=>({value:el.value,font:getComputedStyle(el).fontSize}));
  assert.ok(px(appearanceBefore.font)>=14.3,'Appearance selector itself is too small');

  await page.selectOption('#fontSizeSelect','large');
  await page.waitForTimeout(100);
  const large=await page.evaluate(()=>({
    body:getComputedStyle(document.body).fontSize,
    nav:getComputedStyle(document.querySelector('#nav button')).fontSize,
    stored:state.fontSize,
    data:document.body.dataset.size
  }));
  assert.equal(large.stored,'large','Font-size setting did not persist to state');
  assert.equal(large.data,'large','Font-size setting did not apply to body');
  assert.ok(px(large.body)>px(shell.body)+1,'Large font preset has no meaningful visual effect');
  assert.ok(px(large.nav)>px(shell.nav)+1,'Large font preset does not affect navigation');

  await page.selectOption('#fontSizeSelect','normal');
  await page.evaluate(()=>window.app.page('schedule',false));
  await page.waitForSelector('#page-schedule .schedule-ref__today-btn',{state:'visible'});
  await page.evaluate(()=>{if(state.schedule.edit) window.BAUMAN_SCHEDULE_REF.toggleManual();});
  await page.evaluate(()=>window.BAUMAN_SCHEDULE_REF.toggleManual());
  const edit=await page.evaluate(()=>({
    data:document.body.dataset.scheduleEditing,
    button:[...document.querySelectorAll('#page-schedule .schedule-ref__today-btn')].find(x=>x.textContent.includes('Xong'))?.textContent||'',
    className:[...document.querySelectorAll('#page-schedule .schedule-ref__today-btn')].find(x=>x.textContent.includes('Xong'))?.className||''
  }));
  assert.equal(edit.data,'true','Manual edit mode is not exposed visually');
  assert.ok(edit.button.includes('Xong'),'Edit button does not visibly change state');
  assert.ok(edit.className.includes('is-editing'),'Edit button lacks active-state styling');
  await page.evaluate(()=>window.BAUMAN_SCHEDULE_REF.toggleManual());

  await page.screenshot({path:path.join(OUT,'all-tabs-readable-1440x1000.png'),fullPage:false});
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({shell,samples,large,edit},null,2));

  assert.deepEqual(errors,[],'Readable typography browser test emitted console/page errors');
  console.log('READABLE_TYPOGRAPHY_V1_BROWSER_PASS');
}finally{
  await browser?.close();
}
