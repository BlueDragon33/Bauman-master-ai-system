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

  // Global shell screenshots: desktop + explicit iPad/iPhone profiles.
  const visualProfiles=[
    ['1920',1920,1080],
    ['1440',1440,1000],
    ['1366',1366,768],
    ['1024',1024,768],
    ['820',820,1180],
    ['768',768,1024],
    ['744',744,1133],
    ['430',430,932],
    ['393',393,852],
    ['390',390,844],
    ['375',375,812]
  ];
  for(const [label,width,height] of visualProfiles){
    await page.setViewportSize({width,height});
    await page.goto(new URL('index.html',BASE).href,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.BAUMAN_UI?.selfCheck?.().ready===true);
    await page.waitForFunction(()=>{
      const app=document.getElementById('appRoot');
      return !!app&&!app.classList.contains('hidden');
    },null,{timeout:10000});
    await page.waitForSelector('#page-home [data-bui-dashboard="e6"] .bui-dashboard__hero',{state:'visible',timeout:10000});
    await page.waitForTimeout(180);
    await page.screenshot({path:path.join(OUT,`hub-${label}.png`),fullPage:false});
  }

  // Mobile architecture smoke across representative module families.
  const mobile={};
  for(const [name,url] of [['hub','index.html'],['generic-subject','subjects/ai/index.html'],['core-subject','subjects/programming/index.html'],['russian','subjects/russian/index.html'],['math','subjects/math/index.html'],['simulation','subjects/math/simulations/sim_vector_projection.html']]){
    mobile[name]=await inspect(page,name,url,{width:390,height:844});
  }

  // UI-E5 compact navigation must replace, not duplicate, the legacy Hub sidebar.
  const compactNavigation={};
  for(const width of [768,390]){
    await page.setViewportSize({width,height:844});
    await page.goto(new URL('index.html',BASE).href,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.BAUMAN_UI?.selfCheck?.().ready===true);
    await page.waitForFunction(()=>{
      const app=document.getElementById('appRoot');
      return !!app&&!app.classList.contains('hidden');
    },null,{timeout:10000});
    await page.waitForSelector('#page-home [data-bui-dashboard="e6"] .bui-dashboard__hero',{state:'visible',timeout:10000});
    await page.waitForTimeout(180);
    compactNavigation[width]=await page.evaluate(()=> {
      const visible=el=>{
        if(!el)return false;
        const s=getComputedStyle(el),r=el.getBoundingClientRect();
        return s.display!=='none'&&s.visibility!=='hidden'&&r.width>1&&r.height>1;
      };
      const app=document.querySelector('#appRoot');
      const shell=document.querySelector('#appRoot>.shell');
      const sidebar=document.querySelector('#appRoot>.sidebar');
      const mobile=document.querySelector('[data-bui-mobile-nav]');
      const active=document.querySelector('#appRoot .page.active');
      return{
        appVisible:visible(app),
        shellVisible:visible(shell),
        sidebarVisible:visible(sidebar),
        mobileVisible:visible(mobile),
        activeVisible:visible(active),
        shellWidth:shell?.getBoundingClientRect().width||0,
        viewport:document.documentElement.clientWidth,
        topbarBottom:document.querySelector('#appRoot .topbar')?.getBoundingClientRect().bottom||0,
        heroTop:document.querySelector('#page-home .hub-safe-hero')?.getBoundingClientRect().top||0
      };
    });
    if(compactNavigation[width].appVisible){
      assert.equal(compactNavigation[width].shellVisible,true,`UI-E5 compact shell hidden at ${width}px`);
      assert.equal(compactNavigation[width].activeVisible,true,`UI-E5 active content hidden at ${width}px`);
      assert.equal(compactNavigation[width].sidebarVisible,false,`Legacy Hub sidebar duplicates UI-E5 compact nav at ${width}px`);
      assert.equal(compactNavigation[width].mobileVisible,true,`UI-E5 compact navigation missing at ${width}px`);
      assert.ok(compactNavigation[width].shellWidth>=compactNavigation[width].viewport-4,`UI-E5 shell does not fill compact viewport at ${width}px`);
      if(compactNavigation[width].heroTop>0){
        assert.ok(compactNavigation[width].heroTop>=compactNavigation[width].topbarBottom-4,`UI-E5 compact topbar materially overlaps the home hero at ${width}px: ${JSON.stringify(compactNavigation[width])}`);
      }
    }
  }

  // UI-E6 dashboard is a structural layer over the canonical Hub runtime.
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(new URL('index.html',BASE).href,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.BAUMAN_UI?.selfCheck?.().ready===true);
  await page.waitForFunction(()=>{
    const app=document.getElementById('appRoot');
    return !!app&&!app.classList.contains('hidden');
  },null,{timeout:10000});
  await page.waitForSelector('#page-home [data-bui-dashboard="e6"]',{state:'visible',timeout:10000});
  await page.waitForTimeout(180);
  const dashboardE6=await page.evaluate(()=> {
    const root=document.querySelector('[data-bui-dashboard="e6"]');
    return{
      visible:!!root&&getComputedStyle(root).display!=='none',
      regions:root?Array.from(root.querySelectorAll('[data-bui-region]')).map(x=>x.dataset.buiRegion):[],
      panels:root?Array.from(root.querySelectorAll('[data-bui-panel]')).map(x=>x.dataset.buiPanel):[],
      subjectCards:root?.querySelectorAll('.bui-dashboard__subject-card').length||0,
      runtime:window.BAUMAN_UI?.selfCheck?.(),
      appActive:!!document.getElementById('appRoot')&&!document.getElementById('appRoot').classList.contains('hidden')
    };
  });
  if(dashboardE6.appActive){
    assert.equal(dashboardE6.visible,true,'UI-E6 dashboard is not visible on an active Hub');
    for(const region of ['hero','subjects','continue','progress','rail'])assert.ok(dashboardE6.regions.includes(region),'UI-E6 region missing: '+region);
    for(const panel of ['assistant','schedule','motivation'])assert.ok(dashboardE6.panels.includes(panel),'UI-E6 rail panel missing: '+panel);
    assert.equal(dashboardE6.subjectCards,5,'UI-E6 must preserve the five-card Home priority strip');
    assert.equal(dashboardE6.runtime?.dashboardReady,true,'UI-E6 runtime readiness signal failed');
    assert.equal(dashboardE6.runtime?.routeOwnership,false,'UI-E6 must not own routing');
  }

  // UI-E7 iPad/iPhone layout acceptance.
  const deviceProfiles={};
  for(const [label,width,height,expected] of [
    ['asus-compact',1366,768,'desktop'],
    ['ipad-landscape',1024,768,'tablet-landscape'],
    ['ipad-portrait-820',820,1180,'tablet-portrait'],
    ['ipad-portrait-768',768,1024,'tablet-portrait'],
    ['ipad-portrait-744',744,1133,'tablet-portrait'],
    ['iphone-430',430,932,'phone'],
    ['iphone-393',393,852,'phone'],
    ['iphone-390',390,844,'phone'],
    ['iphone-375',375,812,'phone']
  ]){
    await page.setViewportSize({width,height});
    await page.goto(new URL('index.html',BASE).href,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.BAUMAN_UI?.selfCheck?.().ready===true);
    await page.waitForFunction(()=>{
      const app=document.getElementById('appRoot');
      return !!app&&!app.classList.contains('hidden');
    },null,{timeout:10000});
    await page.waitForSelector('#page-home [data-bui-dashboard="e6"] .bui-dashboard__hero',{state:'visible',timeout:10000});
    await page.waitForTimeout(180);
    deviceProfiles[label]=await page.evaluate(()=> {
      const visible=el=>{
        if(!el)return false;
        const s=getComputedStyle(el),r=el.getBoundingClientRect();
        return s.display!=='none'&&s.visibility!=='hidden'&&r.width>1&&r.height>1;
      };
      const rect=sel=>document.querySelector(sel)?.getBoundingClientRect()||null;
      const app=document.getElementById('appRoot');
      const hero=rect('#page-home .bui-dashboard__hero');
      const topbar=rect('#appRoot>.shell>.topbar');
      const dock=rect('[data-bui-mobile-nav]');
      const subjectCards=Array.from(document.querySelectorAll('#page-home .bui-dashboard__subject-card')).map(el=>el.getBoundingClientRect().width);
      const ctas=Array.from(document.querySelectorAll('#page-home .hub-safe-hero-actions .btn')).map(el=>el.getBoundingClientRect().width);
      const topActions=document.querySelector('#appRoot>.shell>.topbar .top-actions');
      const main=document.querySelector('#appRoot>.shell>.main');
      const topControls=Array.from(topActions?.querySelectorAll('.btn,.hub-safe-icon-btn,#profileBtn')||[])
        .filter(visible)
        .map(el=>el.getBoundingClientRect());
      const centers=topControls.map(r=>r.top+r.height/2);
      const intersects=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1;
      let topControlCollisions=0;
      for(let i=0;i<topControls.length;i++)for(let j=i+1;j<topControls.length;j++)if(intersects(topControls[i],topControls[j]))topControlCollisions++;
      return{
        runtime:window.BAUMAN_UI?.selfCheck?.(),
        appActive:!!app&&!app.classList.contains('hidden'),
        sidebarVisible:visible(document.querySelector('#appRoot>.sidebar')),
        dockVisible:visible(document.querySelector('[data-bui-mobile-nav]')),
        heroHeight:hero?.height||0,
        heroTop:hero?.top||0,
        topbarBottom:topbar?.bottom||0,
        topbarHeight:topbar?.height||0,
        dockWidth:dock?.width||0,
        viewport:document.documentElement.clientWidth,
        quoteVisible:visible(document.querySelector('#page-home .hub-safe-quote')),
        artVisible:visible(document.querySelector('#page-home .hub-safe-art')),
        subjectMin:subjectCards.length?Math.min(...subjectCards):0,
        ctaMin:ctas.length?Math.min(...ctas):0,
        topControlMinHeight:topControls.length?Math.min(...topControls.map(r=>r.height)):0,
        topControlCenterSpread:centers.length?Math.max(...centers)-Math.min(...centers):0,
        topControlCollisions,
        topActionOverflow:topActions?Math.max(0,topActions.scrollWidth-topActions.clientWidth):0,
        mainBottom:main?.getBoundingClientRect().bottom||0,
        mainOverflowY:main?getComputedStyle(main).overflowY:'',
        dockTop:dock?.top||0,
        ringBottom:rect('#page-home .hub-safe-ring-block')?.bottom||0,
        continueBodyTop:rect('#page-home .hub-safe-continue-body')?.top||0,
        dockLabels:Array.from(document.querySelectorAll('[data-bui-mobile-nav] [data-page] span')).map(x=>x.textContent?.trim()||''),
        overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
      };
    });
    const d=deviceProfiles[label];
    assert.equal(d.runtime?.deviceProfile,expected,`${label}: viewport profile mismatch ${JSON.stringify(d)}`);
    assert.ok(d.overflow<=4,`${label}: horizontal overflow ${JSON.stringify(d)}`);
    if(d.appActive){
      assert.ok(d.heroTop>=d.topbarBottom-4,`${label}: topbar overlaps Home ${JSON.stringify(d)}`);
      assert.ok(d.topControlCenterSpread<=5,`${label}: topbar buttons are vertically misaligned ${JSON.stringify(d)}`);
      assert.equal(d.topControlCollisions,0,`${label}: topbar controls overlap each other ${JSON.stringify(d)}`);
      assert.ok(d.topActionOverflow<=4,`${label}: topbar action row overflows horizontally ${JSON.stringify(d)}`);
      if(width<=820)assert.ok(d.topControlMinHeight>=43.5,`${label}: compact topbar controls are below the 44px touch contract ${JSON.stringify(d)}`);
      else if(width<=1100)assert.ok(d.topControlMinHeight>=41.5,`${label}: iPad landscape controls are below the 42px contract ${JSON.stringify(d)}`);
      if(width<=820){
        assert.equal(d.sidebarVisible,false,`${label}: compact layout still shows desktop sidebar`);
        assert.equal(d.dockVisible,true,`${label}: compact dock missing`);
        const expectedDock=Math.min(d.viewport-16,780);
        assert.ok(Math.abs(d.dockWidth-expectedDock)<=4,`${label}: dock is not the intended floating inset width ${JSON.stringify(d)}`);
        assert.ok(d.mainBottom<=d.dockTop+2,`${label}: fixed dock overlaps the scrollable content viewport ${JSON.stringify(d)}`);
        assert.ok(['auto','scroll'].includes(d.mainOverflowY),`${label}: compact main must own vertical scrolling above the dock ${JSON.stringify(d)}`);
      }else{
        assert.equal(d.sidebarVisible,true,`${label}: landscape iPad should retain compact sidebar`);
        assert.equal(d.dockVisible,false,`${label}: landscape iPad should not show phone dock`);
      }
      if(width<=480){
        assert.equal(d.quoteVisible,false,`${label}: decorative quote should be removed on iPhone`);
        assert.equal(d.artVisible,false,`${label}: decorative Continue artwork should be removed on iPhone`);
        assert.ok(d.heroHeight<=330,`${label}: hero still behaves like desktop ${JSON.stringify(d)}`);
        assert.ok(d.topbarHeight<=104,`${label}: topbar is too tall ${JSON.stringify(d)}`);
        assert.ok(d.subjectMin>=150,`${label}: subject cards are too compressed ${JSON.stringify(d)}`);
        assert.ok(d.ctaMin>=250,`${label}: hero CTA is too narrow/readability-poor ${JSON.stringify(d)}`);
        assert.ok(d.continueBodyTop>=d.ringBottom-2,`${label}: Continue progress overlaps lesson content ${JSON.stringify(d)}`);
        assert.deepEqual(d.dockLabels,['Trang chủ','Lộ trình','Môn học','Lịch học','Luận văn'],`${label}: compact dock labels drifted`);
      }else if(width<=820){
        assert.ok(d.heroHeight<=240,`${label}: tablet portrait hero is too tall ${JSON.stringify(d)}`);
        assert.ok(d.subjectMin>=150,`${label}: tablet subject cards are too compressed ${JSON.stringify(d)}`);
      }else if(width<=1100){
        assert.ok(d.heroHeight<=240,`${label}: tablet landscape hero is too tall ${JSON.stringify(d)}`);
      }
    }
  }

  // UI-E9 contrast constitution: semantic text must remain decisively readable
  // against the canonical surface scale in both themes.
  await page.goto(new URL('index.html',BASE).href,{waitUntil:'domcontentloaded'});
  const contrastAudit=await page.evaluate(()=> {
    const root=document.documentElement,body=document.body;
    const ratio=(a,b)=>{
      const parse=v=>{
        const s=v.trim();
        if(/^#[0-9a-f]{6}$/i.test(s))return [1,3,5].map(i=>parseInt(s.slice(i,i+2),16)/255);
        const m=s.match(/rgba?\\(([^)]+)\\)/i);
        if(m)return m[1].split(',').slice(0,3).map(x=>parseFloat(x)/255);
        const probe=document.createElement('span');
        probe.style.color=s;document.body.appendChild(probe);
        const resolved=getComputedStyle(probe).color;probe.remove();
        const rm=resolved.match(/rgba?\\(([^)]+)\\)/i);
        return rm?rm[1].split(',').slice(0,3).map(x=>parseFloat(x)/255):[0,0,0];
      };
      const lum=v=>parse(v).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4)
        .reduce((n,x,i)=>n+x*[.2126,.7152,.0722][i],0);
      const [x,y]=[lum(a),lum(b)];
      return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
    };
    const read=()=>{
      const cs=getComputedStyle(root);
      const get=n=>cs.getPropertyValue(n).trim();
      const surface=get('--bui-surface-primary');
      return{
        canvas:get('--bui-surface-canvas'),
        surface,
        primary:ratio(get('--bui-text-primary'),surface),
        secondary:ratio(get('--bui-text-secondary'),surface),
        tertiary:ratio(get('--bui-text-tertiary'),surface),
        placeholder:ratio(get('--bui-text-placeholder'),get('--bui-surface-secondary')),
        strongBoundary:ratio(get('--bui-border-strong'),surface)
      };
    };
    const priorTheme=body.getAttribute('data-theme');
    const priorUi=body.getAttribute('data-ui-theme');
    body.removeAttribute('data-theme');
    body.removeAttribute('data-ui-theme');
    const light=read();
    body.dataset.uiTheme='dark';
    const dark=read();
    if(priorTheme===null)body.removeAttribute('data-theme');else body.setAttribute('data-theme',priorTheme);
    if(priorUi===null)body.removeAttribute('data-ui-theme');else body.setAttribute('data-ui-theme',priorUi);
    return{light,dark};
  });
  for(const [theme,audit] of Object.entries(contrastAudit)){
    assert.ok(audit.primary>=7,`UI-E9 ${theme}: primary text contrast below 7:1 ${JSON.stringify(audit)}`);
    assert.ok(audit.secondary>=4.5,`UI-E9 ${theme}: secondary text contrast below 4.5:1 ${JSON.stringify(audit)}`);
    assert.ok(audit.tertiary>=4.5,`UI-E9 ${theme}: tertiary text contrast below 4.5:1 ${JSON.stringify(audit)}`);
    assert.ok(audit.placeholder>=4.5,`UI-E9 ${theme}: placeholder contrast below 4.5:1 ${JSON.stringify(audit)}`);
    assert.ok(audit.strongBoundary>=3,`UI-E9 ${theme}: strong control boundary contrast below 3:1 ${JSON.stringify(audit)}`);
  }
  const dark={canvas:contrastAudit.dark.canvas,contrast:contrastAudit.dark};

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

  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({desktop,mobile,deviceProfiles,dark,contrastAudit,runtime,pageErrors},null,2));
  console.log('BAUMAN_FUTURE_INTERFACE_SYSTEM_BROWSER_PASS');
}finally{
  await browser?.close();
}
