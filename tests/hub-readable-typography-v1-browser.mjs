import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/hub-readable-typography-v1';
fs.mkdirSync(OUT,{recursive:true});

const px=value=>Number.parseFloat(String(value||'0'))||0;
async function openPage(page,id,selector){
  await page.evaluate(pageId=>window.app?.page?.(pageId,false),id);
  await page.waitForSelector(selector,{state:'visible',timeout:15000});
  await page.waitForTimeout(100);
}
async function style(page,selector){
  return page.evaluate(sel=>{
    const el=document.querySelector(sel);
    if(!el) return null;
    const s=getComputedStyle(el);
    return {fontSize:parseFloat(s.fontSize)||0,lineHeight:s.lineHeight,display:s.display,visibility:s.visibility,color:s.color,background:s.backgroundColor};
  },selector);
}
async function noPageOverflow(page,label){
  const v=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(v.scroll<=v.client+2,label+' has horizontal document overflow: '+JSON.stringify(v));
  return v;
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
  await page.waitForFunction(()=>!document.getElementById('appRoot')?.classList.contains('hidden'),null,{timeout:30000});
  await page.waitForFunction(()=>window.app&&window.BAUMAN_HUB_SAFE?.selfCheck?.().ready===true,null,{timeout:30000});

  // Normalize to the requested ChatGPT-like default.
  await page.evaluate(()=>{
    const size=document.getElementById('fontSizeSelect');
    if(size){size.value='normal';size.dispatchEvent(new Event('change',{bubbles:true}))}
    const font=document.getElementById('fontSelect');
    if(font){font.value='system';font.dispatchEvent(new Event('change',{bubbles:true}))}
    const theme=document.getElementById('themeSelect');
    if(theme){theme.value='academic';theme.dispatchEvent(new Event('change',{bubbles:true}))}
  });
  await page.waitForTimeout(100);

  const shell={
    bodySize:await page.evaluate(()=>parseFloat(getComputedStyle(document.body).fontSize)),
    nav:await style(page,'#nav>button'),
    search:await style(page,'.hub-safe-search input'),
    appearance:await style(page,'#appearanceBtn'),
    density:await page.evaluate(()=>document.body.dataset.hubDensity),
    size:await page.evaluate(()=>document.body.dataset.size)
  };
  assert.ok(shell.bodySize>=15.5,'Body normal size must be ChatGPT-like 16px');
  assert.ok(shell.nav?.fontSize>=14.5,'Sidebar navigation is still too small');
  assert.ok(shell.search?.fontSize>=13.5,'Top search is still too small');
  assert.ok(['flex','inline-flex'].includes(shell.appearance?.display),'Appearance button must be visibly usable');
  assert.ok(shell.appearance?.fontSize>=13.5,'Appearance button text is still too small');
  assert.equal(shell.density,'comfort','Default density should be comfort');
  assert.equal(shell.size,'normal','Default readable size should be normal');

  // Appearance menu must expose actual theme/font/size controls.
  await page.click('#appearanceBtn');
  await page.waitForSelector('#appearanceMenu:not(.hidden)',{state:'visible'});
  const appearanceState=await page.evaluate(()=>({
    themeDisplay:getComputedStyle(document.getElementById('themeSelect').closest('.profile-line')).display,
    themeSize:parseFloat(getComputedStyle(document.getElementById('themeSelect')).fontSize),
    sizeLabel:[...document.getElementById('fontSizeSelect').options].find(x=>x.value==='normal')?.textContent||'',
    presets:[...document.querySelectorAll('[data-safe-appearance]')].map(x=>x.textContent.trim())
  }));
  assert.notEqual(appearanceState.themeDisplay,'none','Theme selector is still hidden');
  assert.ok(appearanceState.themeSize>=13.5,'Appearance selects are too small');
  assert.ok(appearanceState.sizeLabel.includes('16px'),'Normal size must clearly communicate 16px');
  assert.equal(appearanceState.presets.length,3,'Appearance presets are missing');
  await page.click('#appearanceBtn');

  // Home
  await openPage(page,'home','#page-home .hub-safe-dashboard');
  const home={
    copy:await style(page,'#page-home .hub-safe-hero p'),
    action:await style(page,'#page-home .hub-safe-hero-actions .btn'),
    heading:await style(page,'#page-home .hub-safe-section-head h2')
  };
  console.log('READABLE_HOME',JSON.stringify(home));
  assert.ok(home.copy?.fontSize>=15.5,'Home body copy is below readable size');
  assert.ok(home.action?.fontSize>=13.5,'Home action text is below readable size');
  assert.ok(home.heading?.fontSize>=17.5,'Home section heading is below readable size');
  await noPageOverflow(page,'Home');
  await page.screenshot({path:path.join(OUT,'home-readable-1440x1000.png'),fullPage:true});

  // Roadmap
  await openPage(page,'roadmap','#page-roadmap .hub-roadmap-v3');
  const roadmap={
    title:await style(page,'#page-roadmap .hub-rm-stage-card h3'),
    body:await style(page,'#page-roadmap .hub-rm-stage-card p'),
    small:await style(page,'#page-roadmap .hub-rm-stage-card small'),
    button:await style(page,'#page-roadmap .hub-rm-filters button')
  };
  console.log('READABLE_ROADMAP',JSON.stringify(roadmap));
  assert.ok(roadmap.title?.fontSize>=14.5,'Roadmap card title is below readable size');
  assert.ok(roadmap.body?.fontSize>=15.5,'Roadmap body copy is below readable size');
  assert.ok(roadmap.small?.fontSize>=12.5,'Roadmap small copy is below readable size');
  assert.ok(roadmap.button?.fontSize>=13.5,'Roadmap controls are below readable size');
  await noPageOverflow(page,'Roadmap');
  await page.screenshot({path:path.join(OUT,'roadmap-readable-1440x1000.png'),fullPage:true});

  // Subjects
  await openPage(page,'subjects','#page-subjects .subjects-page');
  const subjects={
    title:await style(page,'#page-subjects .subjects-page__course-name b'),
    small:await style(page,'#page-subjects .subjects-page__course-name small'),
    action:await style(page,'#page-subjects .subjects-page__course-actions button'),
    kpi:await style(page,'#page-subjects .subjects-page__summary-card small')
  };
  console.log('READABLE_SUBJECTS',JSON.stringify(subjects));
  assert.ok(subjects.title?.fontSize>=14.5,'Subjects course title is below readable size');
  assert.ok(subjects.small?.fontSize>=12.5,'Subjects metadata is below readable size');
  assert.ok(subjects.action?.fontSize>=12.5,'Subjects action button is below readable size');
  assert.ok(subjects.kpi?.fontSize>=12.5,'Subjects KPI copy is below readable size');
  await noPageOverflow(page,'Subjects');
  await page.screenshot({path:path.join(OUT,'subjects-readable-1440x1000.png'),fullPage:true});

  // Schedule
  await openPage(page,'schedule','#page-schedule .schedule-ref-page');
  const schedule={
    event:await style(page,'#page-schedule .schedule-ref__event b'),
    eventMeta:await style(page,'#page-schedule .schedule-ref__event small'),
    kpi:await style(page,'#page-schedule .schedule-ref__summary-card small'),
    tab:await style(page,'#page-schedule .schedule-ref__segments button')
  };
  console.log('READABLE_SCHEDULE',JSON.stringify(schedule));
  assert.ok(schedule.event?.fontSize>=12.5,'Schedule event title is below readable size');
  assert.ok(schedule.eventMeta?.fontSize>=11.5,'Schedule event metadata is below readable size');
  assert.ok(schedule.kpi?.fontSize>=12.5,'Schedule KPI copy is below readable size');
  assert.ok(schedule.tab?.fontSize>=12.5,'Schedule view controls are below readable size');
  await noPageOverflow(page,'Schedule');
  await page.screenshot({path:path.join(OUT,'schedule-readable-1440x1000.png'),fullPage:true});

  // Thesis
  await openPage(page,'research','#page-research .thesis-page');
  const thesis={
    event:await style(page,'#page-research .thesis-page__event b'),
    eventMeta:await style(page,'#page-research .thesis-page__event span'),
    kpi:await style(page,'#page-research .thesis-page__summary-card small'),
    ai:await style(page,'#page-research .thesis-page__ai-list b')
  };
  console.log('READABLE_THESIS',JSON.stringify(thesis));
  assert.ok(thesis.event?.fontSize>=12.5,'Thesis event title is below readable size');
  assert.ok(thesis.eventMeta?.fontSize>=11.5,'Thesis event metadata is below readable size');
  assert.ok(thesis.kpi?.fontSize>=12.5,'Thesis KPI copy is below readable size');
  assert.ok(thesis.ai?.fontSize>=12.5,'Thesis AI suggestions are below readable size');
  await noPageOverflow(page,'Thesis');
  await page.screenshot({path:path.join(OUT,'thesis-readable-1440x1000.png'),fullPage:true});

  // Cỡ chữ control must have a strong visible effect.
  await openPage(page,'subjects','#page-subjects .subjects-page');
  const normalTitle=px((await style(page,'#page-subjects .subjects-page__course-name b'))?.fontSize);
  await page.evaluate(()=>{
    const size=document.getElementById('fontSizeSelect');
    size.value='xlarge';size.dispatchEvent(new Event('change',{bubbles:true}));
  });
  await page.waitForTimeout(120);
  const xlargeTitle=px((await style(page,'#page-subjects .subjects-page__course-name b'))?.fontSize);
  assert.ok(xlargeTitle>=18.5,'Xlarge mode did not produce clearly large text');
  assert.ok(xlargeTitle-normalTitle>=3,'Font-size control still has too little visual effect');

  // Presets must also produce a meaningful change.
  await page.click('#appearanceBtn');
  await page.click('[data-safe-appearance="reading"]');
  await page.waitForTimeout(120);
  const preset=await page.evaluate(()=>({theme:document.body.dataset.theme,size:document.body.dataset.size,font:document.body.dataset.font,density:document.body.dataset.hubDensity}));
  assert.deepEqual(preset,{theme:'paper',size:'large',font:'serif',density:'comfort'},'Reading preset did not apply a complete visible appearance change');

  // Restore requested default before mobile checks.
  await page.evaluate(()=>{
    for(const [id,value] of [['themeSelect','academic'],['fontSelect','system'],['fontSizeSelect','normal']]){
      const el=document.getElementById(id);el.value=value;el.dispatchEvent(new Event('change',{bubbles:true}));
    }
  });
  await page.waitForTimeout(120);

  // Mobile: all five primary tabs may grow vertically, but must not overflow the document horizontally.
  await page.setViewportSize({width:390,height:844});
  const roots={
    home:'#page-home .hub-safe-dashboard',
    roadmap:'#page-roadmap .hub-roadmap-v3',
    subjects:'#page-subjects .subjects-page',
    schedule:'#page-schedule .schedule-ref-page',
    research:'#page-research .thesis-page'
  };
  const mobile={};
  for(const [id,selector] of Object.entries(roots)){
    await openPage(page,id,selector);
    mobile[id]=await noPageOverflow(page,'Mobile '+id);
  }
  await page.screenshot({path:path.join(OUT,'mobile-readable-390x844.png'),fullPage:false});

  assert.deepEqual(errors,[],'Readable typography browser emitted console/page errors');
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({shell,appearanceState,home,roadmap,subjects,schedule,thesis,normalTitle,xlargeTitle,preset,mobile},null,2));
  console.log('HUB_READABLE_TYPOGRAPHY_V1_BROWSER_PASS');
}finally{
  await browser?.close();
}
