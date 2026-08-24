'use strict';

const fs=require('fs');
const {chromium}=require('playwright');

const BASE_URL=process.env.BAUMAN_TEST_BASE_URL||'http://127.0.0.1:4173';
const VIEWPORTS=[
  {id:'desktop',width:1440,height:900},
  {id:'laptop',width:1280,height:800},
  {id:'tablet',width:820,height:1180},
  {id:'mobile',width:390,height:844}
];
// Root selector follows each subject shell contract. Generic SUBJECT_MODULE_V2 uses .app;
// Russian/Math/Programming legacy-rich shells expose #app.
const PAGES=[
  ['main','/index.html','#authScreen'],
  ['ai','/subjects/ai/index.html','.app'],
  ['foundation','/subjects/foundation/index.html','.app'],
  ['math','/subjects/math/index.html','#app'],
  ['programming','/subjects/programming/index.html','#app'],
  ['research','/subjects/research/index.html','.app'],
  ['russian','/subjects/russian/index.html','#app'],
  ['signal','/subjects/signal/index.html','.app'],
  ['systems','/subjects/systems/index.html','.app']
];
const MAX_OVERFLOW_PX=64;

(async()=>{
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({serviceWorkers:'block'});
  const failures=[];
  const report=[];

  for(const viewport of VIEWPORTS){
    for(const [id,route,rootSelector] of PAGES){
      const page=await context.newPage();
      await page.setViewportSize({width:viewport.width,height:viewport.height});
      let navigationError='';
      try{
        await page.goto(BASE_URL+route,{waitUntil:'domcontentloaded',timeout:30000});
        await page.waitForTimeout(500);
      }catch(error){navigationError=String(error&&error.message||error);}

      const metrics=await page.evaluate((selector)=>{
        const doc=document.documentElement;
        const body=document.body;
        const root=document.querySelector(selector);
        const rect=root&&root.getBoundingClientRect();
        return {
          viewportMeta:!!document.querySelector('meta[name="viewport"]'),
          scrollWidth:Math.max(doc?.scrollWidth||0,body?.scrollWidth||0),
          innerWidth:window.innerWidth,
          overflowX:Math.max(0,Math.max(doc?.scrollWidth||0,body?.scrollWidth||0)-window.innerWidth),
          rootExists:!!root,
          rootWidth:rect?rect.width:0,
          rootHeight:rect?rect.height:0,
          title:document.title||''
        };
      },rootSelector).catch(()=>({viewportMeta:false,scrollWidth:0,innerWidth:viewport.width,overflowX:0,rootExists:false,rootWidth:0,rootHeight:0,title:''}));

      if(navigationError)failures.push(`${viewport.id}/${id}: navigation failed: ${navigationError}`);
      if(!metrics.viewportMeta)failures.push(`${viewport.id}/${id}: missing viewport meta`);
      if(!metrics.rootExists)failures.push(`${viewport.id}/${id}: missing root ${rootSelector}`);
      if(metrics.rootExists&&(metrics.rootWidth<=0||metrics.rootHeight<=0))failures.push(`${viewport.id}/${id}: root has zero layout size`);
      if(metrics.overflowX>MAX_OVERFLOW_PX)failures.push(`${viewport.id}/${id}: document horizontal overflow ${metrics.overflowX}px > ${MAX_OVERFLOW_PX}px`);

      let runtime=null;
      let routing=null;
      if(id==='main'){
        runtime=await page.evaluate(()=>window.BAUMAN_SITE_RUNTIME_AUDIT?.()||null).catch(()=>null);
        routing=await page.evaluate(()=>window.BAUMAN_SITE_ROUTING_BRIDGE?.selfCheck?.()||null).catch(()=>null);
        if(!runtime||runtime.enabled!==true)failures.push(`${viewport.id}/main: site runtime not active`);
        if(!routing||routing.ok!==true)failures.push(`${viewport.id}/main: site routing bridge self-check failed`);
        const routeProbe=await page.evaluate(()=>{
          try{
            const href=window.BaumanSiteRuntime.resolvePath('subjects/math/index.html',{sameOrigin:true});
            let blocked=false;
            try{window.BaumanSiteRuntime.resolvePath('https://example.com/subjects/math/index.html',{sameOrigin:true});}catch(_){blocked=true;}
            return {href,blocked,origin:new URL(href).origin,path:new URL(href).pathname};
          }catch(error){return {error:String(error&&error.message||error)};}
        }).catch((error)=>({error:String(error&&error.message||error)}));
        if(routeProbe.error||routeProbe.origin!==new URL(BASE_URL).origin||!routeProbe.path.endsWith('/subjects/math/index.html')||routeProbe.blocked!==true){
          failures.push(`${viewport.id}/main: same-origin routing probe failed: ${JSON.stringify(routeProbe)}`);
        }
      }

      report.push({viewport:viewport.id,width:viewport.width,height:viewport.height,id,route,rootSelector,metrics,runtime,routing});
      await page.close();
    }
  }

  await browser.close();
  fs.mkdirSync('docs/migration',{recursive:true});
  fs.writeFileSync('docs/migration/L5_RESPONSIVE_REGRESSION.generated.json',JSON.stringify({maxOverflowPx:MAX_OVERFLOW_PX,viewports:VIEWPORTS,pages:report,failures},null,2)+'\n');
  console.log(`L5 responsive regression: ${report.length} page/viewport checks, ${failures.length} failure(s).`);
  if(failures.length){console.error(failures.join('\n'));process.exit(2);}
  console.log('L5 responsive + runtime routing regression PASS.');
})().catch((error)=>{console.error(error);process.exit(1);});
