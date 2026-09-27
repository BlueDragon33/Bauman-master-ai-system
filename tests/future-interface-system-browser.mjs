import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/future-interface-system';
fs.mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function noDocumentOverflow(page,label){
  const v=await page.evaluate(()=>({
    client:document.documentElement.clientWidth,
    scroll:document.documentElement.scrollWidth,
    body:document.body.scrollWidth
  }));
  assert.ok(v.scroll<=v.client+2,label+' horizontal overflow '+JSON.stringify(v));
  return v;
}
async function waitHub(page){
  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.BaumanUI?.ready?.()===true,null,{timeout:20000});
  await page.waitForFunction(()=>window.app&&document.getElementById('appRoot')&&!document.getElementById('appRoot').classList.contains('hidden'),null,{timeout:30000});
  await page.waitForFunction(()=>document.body.dataset.buiShell==='1',null,{timeout:20000});
}
async function screenshot(page,name,fullPage=true){
  await page.screenshot({path:path.join(OUT,name),fullPage});
}
async function checkTouchTargets(page,selector,label){
  const sizes=await page.$$eval(selector,els=>els.filter(e=>getComputedStyle(e).display!=='none').map(e=>{
    const r=e.getBoundingClientRect();return {w:r.width,h:r.height,text:(e.textContent||'').trim().slice(0,40)}
  }));
  for(const s of sizes) assert.ok(s.w>=40&&s.h>=40,label+' small target '+JSON.stringify(s));
  return sizes;
}

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();
  const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e?.stack||e)));

  await waitHub(page);

  const shell=await page.evaluate(()=>({
    bui:document.body.dataset.bui,
    shell:document.body.dataset.buiShell,
    legacy:document.body.dataset.hubReferenceV5||'',
    background:getComputedStyle(document.body).backgroundColor,
    sidebar:Math.round(document.querySelector('.sidebar')?.getBoundingClientRect().width||0),
    topbar:Math.round(document.querySelector('.topbar')?.getBoundingClientRect().height||0),
    ready:window.BaumanUI?.ready?.(),
    commands:window.BaumanUI?.commands?.list?.().map(x=>x.id)||[],
    searchProviders:window.BaumanUI?.search?.providers?.()||[],
    resourceTypes:window.BaumanUI?.resource?.types?.()||[],
    importReady:typeof window.BaumanUI?.importCenter?.mount==='function'
  }));
  assert.equal(shell.bui,'1','BFIS root contract missing');
  assert.equal(shell.shell,'1','canonical shell is not active');
  assert.equal(shell.legacy,'','legacy Precision V5 shell is still active');
  assert.equal(shell.ready,true,'BFIS runtime is not ready');
  assert.ok(shell.sidebar>=220&&shell.sidebar<=245,'sidebar width is outside calm shell target');
  assert.ok(shell.topbar>=60&&shell.topbar<=68,'topbar height is outside shell target');
  assert.ok(shell.commands.includes('focus.toggle'),'Focus command missing');
  assert.ok(shell.searchProviders.includes('bauman-data'),'global academic search provider missing');
  assert.ok(shell.resourceTypes.includes('simulation')&&shell.resourceTypes.includes('pdf'),'ResourceViewer type contract incomplete');
  assert.equal(shell.importReady,true,'Import Center runtime missing');

  // Command Palette: keyboard, semantic search, close.
  await page.keyboard.press('Control+K');
  await page.waitForFunction(()=>document.querySelector('[data-bui-command-root]')?.hidden===false,null,{timeout:10000});
  await page.waitForSelector('.bui-command-backdrop',{state:'visible'});
  const commandInput=page.locator('[data-bui-command-input]');
  await commandInput.fill('Tiếng Nga');
  await page.waitForTimeout(80);
  const commandText=await page.locator('[data-bui-command-list]').innerText();
  assert.match(commandText,/Tiếng Nga/i,'global command search did not find subject/course data');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('[data-bui-command-root]').getAttribute('hidden'),'','command palette did not close with Escape');

  // Focus Mode must collapse navigation, preserve context and restore.
  await page.keyboard.press('Alt+f');
  await page.waitForTimeout(80);
  let focus=await page.evaluate(()=>({
    active:document.body.dataset.buiFocus,
    sidebar:getComputedStyle(document.querySelector('.sidebar')).display,
    columns:getComputedStyle(document.getElementById('appRoot')).gridTemplateColumns
  }));
  assert.equal(focus.active,'1','Focus Mode did not activate');
  assert.equal(focus.sidebar,'none','Focus Mode did not hide global navigation');
  assert.ok(!focus.columns.includes('236px'),'Focus Mode left an empty sidebar column');
  await page.keyboard.press('Alt+f');
  await page.waitForTimeout(50);
  assert.equal(await page.evaluate(()=>document.body.dataset.buiFocus),'0','Focus Mode did not restore');

  // ResourceViewer behavior.
  await page.evaluate(()=>window.BaumanUI.resource.open({
    id:'qa-image',type:'image',src:'assets/media/favicon.svg',title:'BFIS QA resource',description:'ResourceViewer acceptance',progress:42
  }));
  await page.waitForSelector('[data-bui-resource-viewer]',{state:'visible'});
  assert.equal(await page.locator('[data-bui-resource-viewer]').getAttribute('data-resource-type'),'image');
  await page.locator('[data-rv-action="note"]').first().click();
  await page.locator('[data-rv-note]').fill('BFIS note');
  await page.locator('[data-rv-action="close"]').first().click();
  assert.equal(await page.locator('[data-bui-resource-viewer]').count(),0,'ResourceViewer did not close');

  // Import Center behavior through the actual public API.
  await page.evaluate(()=>{
    const host=document.createElement('div');host.id='bfisImportQa';document.body.appendChild(host);window.BaumanUI.importCenter.mount(host);
  });
  await page.waitForSelector('#bfisImportQa .bui-import__steps');
  assert.equal(await page.locator('#bfisImportQa .bui-import__step').count(),6,'Import Center does not expose six-step flow');
  await page.evaluate(()=>document.getElementById('bfisImportQa')?.remove());

  // Required cross-device widths + every primary Hub tab.
  const viewports=[
    [1920,1080],[1440,1000],[1280,900],[1024,850],[768,900],[430,900],[390,844]
  ];
  const routes=['home','roadmap','subjects','schedule','research'];
  const overflow={};
  for(const [width,height] of viewports){
    await page.setViewportSize({width,height});
    overflow[width]={};
    for(const route of routes){
      await page.evaluate(r=>window.app.page(r,false),route);
      await page.waitForTimeout(70);
      overflow[width][route]=await noDocumentOverflow(page,width+' '+route);
    }
    await page.evaluate(()=>window.app.page('home',false));
    if([1920,1440,768,390].includes(width))await screenshot(page,'hub-home-light-'+width+'.png',true);
    if(width<=768){
      const nav=page.locator('[data-bui-mobile-nav]');
      await nav.waitFor({state:'visible'});
      assert.ok(await nav.locator('button').count()>=5,'mobile primary navigation is incomplete at '+width);
      await checkTouchTargets(page,'[data-bui-mobile-nav] button','mobile nav '+width);
    }
  }

  // Key dense primary tabs at desktop.
  await page.setViewportSize({width:1440,height:1000});
  for(const route of ['roadmap','subjects','schedule','research']){
    await page.evaluate(r=>window.app.page(r,false),route);
    await page.waitForTimeout(120);
    await screenshot(page,'hub-'+route+'-light-1440.png',true);
  }

  // Dark mode is a real surface scale, not simple inversion.
  await page.evaluate(()=>window.app.page('home',false));
  await page.click('#appearanceBtn');
  await page.selectOption('#themeSelect','night');
  await page.waitForTimeout(100);
  const dark=await page.evaluate(()=>({
    theme:document.body.dataset.theme,
    canvas:getComputedStyle(document.body).backgroundColor,
    surface:getComputedStyle(document.querySelector('.sidebar')).backgroundColor,
    text:getComputedStyle(document.querySelector('#nav button')).color
  }));
  assert.equal(dark.theme,'night','dark mode selector did not apply');
  assert.notEqual(dark.canvas,shell.background,'dark mode did not change canvas');
  await screenshot(page,'hub-home-dark-1440.png',true);
  await page.setViewportSize({width:390,height:844});
  await screenshot(page,'hub-home-dark-390.png',true);
  await page.evaluate(()=>{
    const theme=document.getElementById('themeSelect');theme.value='academic';theme.dispatchEvent(new Event('change',{bubbles:true}));
  });

  // Representative subjects: generic, deeply customized Math, deeply customized Russian.
  const subjectEvidence={};
  for(const id of ['ai','math','russian']){
    await page.setViewportSize({width:1440,height:1000});
    await page.goto(BASE+'subjects/'+id+'/index.html',{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(expected=>document.body.dataset.buiSubject===expected&&window.BaumanUI?.ready?.(),id,{timeout:25000});
    await page.waitForTimeout(350);
    subjectEvidence[id]={
      desktop:await noDocumentOverflow(page,id+' desktop'),
      navCount:await page.locator('#nav [data-page]').count(),
      iconized:await page.locator('#nav [data-bui-iconized="1"]').count()
    };
    assert.ok(subjectEvidence[id].navCount>=5,id+' subject navigation is unexpectedly incomplete');
    assert.equal(subjectEvidence[id].iconized,subjectEvidence[id].navCount,id+' subject navigation still mixes legacy emoji/icon families');
    await screenshot(page,'subject-'+id+'-1440.png',true);

    await page.setViewportSize({width:390,height:844});
    await page.waitForTimeout(100);
    subjectEvidence[id].mobile=await noDocumentOverflow(page,id+' mobile');
    const mobile=page.locator('[data-bui-subject-mobile]');
    await mobile.waitFor({state:'visible'});
    await checkTouchTargets(page,'[data-bui-subject-mobile] button',id+' mobile subject nav');
    await screenshot(page,'subject-'+id+'-390.png',true);

    // Subject Focus Mode.
    await page.keyboard.press('Alt+f');await page.waitForTimeout(70);
    assert.equal(await page.evaluate(()=>document.body.dataset.buiFocus),'1',id+' Focus Mode failed');
    await page.keyboard.press('Alt+f');
  }

  // Standalone HTML micro-app is wrapped in the same Resource Shell.
  await page.setViewportSize({width:1280,height:900});
  await page.goto(BASE+'subjects/math/simulations/sim_vector_projection.html',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('.bui-micro-header',{state:'visible',timeout:15000});
  const micro={
    contract:await page.evaluate(()=>document.body.dataset.buiMicroApp),
    controls:await page.locator('.bui-micro-header button').count(),
    overflow:await noDocumentOverflow(page,'micro-app desktop')
  };
  assert.equal(micro.contract,'1','micro-app contract missing');
  assert.ok(micro.controls>=4,'micro-app contextual controls incomplete');
  await screenshot(page,'micro-app-math-1280.png',true);
  await page.setViewportSize({width:390,height:844});
  await noDocumentOverflow(page,'micro-app mobile');
  await screenshot(page,'micro-app-math-390.png',true);

  // Professional editor surface.
  await page.goto(BASE+'subjects/ai/editor.html',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('body[data-bui-editor="ai"] .wrap',{state:'visible'});
  await page.waitForTimeout(150);
  await noDocumentOverflow(page,'AI editor mobile');
  assert.equal(await page.locator('style').count(),0,'editor reintroduced inline CSS patchwork');
  await screenshot(page,'editor-ai-390.png',true);

  // BFIS-owned JS must have no runtime page exceptions.
  const bfisErrors=pageErrors.filter(x=>/BaumanUI|platform\/ui|bui-/i.test(x));
  assert.deepEqual(bfisErrors,[],'BFIS runtime errors: '+bfisErrors.join('\n'));

  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({
    shell,dark,overflow,subjectEvidence,micro,pageErrors
  },null,2));
  console.log('BFIS_BROWSER_PASS');
}finally{
  await browser?.close();
}
