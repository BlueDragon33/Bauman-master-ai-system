import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-p1-forensic';
fs.mkdirSync(OUT,{recursive:true});

const viewports=[
  [1920,1080],[1440,1000],[1366,768],[1024,768],[820,1180],[768,1024],
  [744,1133],[430,932],[393,852],[390,844],[375,812]
].map(([width,height])=>({width,height}));

const selectors={
  app:'.ru-app-shell',
  sidebar:'.ru-sidebar',
  main:'.ru-main',
  topbar:'.ru-topbar',
  nav:'#nav',
  view:'.ru-view',
  hero:'.overview-top-only-hero',
  continueCard:'.rf-continue-card',
  today:'.rf-today-plan',
  review:'.rf-review-now',
  path:'.rf-learning-path',
  progress:'.rf-progress-strip',
  modal:'#modal'
};
const cssProps=['display','position','overflow','overflow-x','overflow-y','width','height','font-size','line-height','color','background-color','border','z-index','visibility','opacity'];

let browser;
const report={schema:'RUSSIAN_P1_FORENSIC_BROWSER_V1',base:BASE,generatedAt:new Date().toISOString(),viewports:[],summary:{}};
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  for(const viewport of viewports){
    const context=await browser.newContext({viewport});
    const page=await context.newPage();
    const consoleErrors=[];
    const pageErrors=[];
    const responses=[];
    page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
    page.on('pageerror',e=>pageErrors.push(String(e?.stack||e)));
    page.on('response',r=>responses.push({url:r.url(),status:r.status(),type:r.request().resourceType()}));
    await page.addInitScript(()=>{
      window.__RUSSIAN_P1={mutationObservers:0,storageWrites:[],listeners:0};
      const NativeMO=window.MutationObserver;
      if(NativeMO){
        window.MutationObserver=class extends NativeMO{
          constructor(cb){window.__RUSSIAN_P1.mutationObservers++;super(cb);}
        };
      }
      const nativeSet=Storage.prototype.setItem;
      Storage.prototype.setItem=function(k,v){
        try{window.__RUSSIAN_P1.storageWrites.push({key:String(k),valueLength:String(v??'').length,at:performance.now()});}catch{}
        return nativeSet.call(this,k,v);
      };
      const nativeAdd=EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener=function(...args){
        try{window.__RUSSIAN_P1.listeners++;}catch{}
        return nativeAdd.apply(this,args);
      };
    });
    await page.goto(new URL('subjects/russian/index.html',BASE).href,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForSelector('body.ru-future-ui',{timeout:15000});
    await page.waitForTimeout(1000);
    const data=await page.evaluate(async({selectors,cssProps})=>{
      const rect=el=>{
        if(!el)return null;
        const r=el.getBoundingClientRect();
        return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};
      };
      const intersect=(a,b)=>{
        if(!a||!b)return 0;
        const w=Math.max(0,Math.min(a.right,b.right)-Math.max(a.x,b.x));
        const h=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y));
        return w*h;
      };
      const matchedRules=(el)=>{
        if(!el)return [];
        const out=[];
        const walk=(rules,href)=>{
          for(const rule of rules||[]){
            if(rule.cssRules){try{walk(rule.cssRules,href)}catch{};continue;}
            if(!rule.selectorText)continue;
            let matches=false;try{matches=el.matches(rule.selectorText)}catch{}
            if(!matches)continue;
            const props={};
            for(const p of cssProps){
              const v=rule.style?.getPropertyValue?.(p);
              if(v)props[p]={value:v.trim(),important:rule.style.getPropertyPriority(p)==='important'};
            }
            if(Object.keys(props).length)out.push({href:href||'inline',selector:rule.selectorText,props});
          }
        };
        for(const sheet of [...document.styleSheets]){
          try{walk(sheet.cssRules,sheet.href)}catch{}
        }
        return out.slice(-80);
      };
      const components={};
      for(const [name,selector] of Object.entries(selectors)){
        const el=document.querySelector(selector);
        if(!el){components[name]=null;continue;}
        const cs=getComputedStyle(el);
        const computed={};for(const p of cssProps)computed[p]=cs.getPropertyValue(p);
        components[name]={selector,rect:rect(el),computed,matchedRules:matchedRules(el)};
      }
      const pairs=[['sidebar','main'],['topbar','view'],['hero','continueCard'],['today','review'],['nav','view']];
      const collisions=pairs.map(([a,b])=>({a,b,area:intersect(components[a]?.rect,components[b]?.rect)}));
      const storage={local:{},session:{}};
      for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);storage.local[k]={length:(localStorage.getItem(k)||'').length};}
      for(let i=0;i<sessionStorage.length;i++){const k=sessionStorage.key(i);storage.session[k]={length:(sessionStorage.getItem(k)||'').length};}
      let indexedDBNames=[];try{if(indexedDB.databases)indexedDBNames=(await indexedDB.databases()).map(x=>x.name).filter(Boolean)}catch{}
      let cacheNames=[];try{cacheNames=await caches.keys()}catch{}
      const nav=[...document.querySelectorAll('#nav button,[data-route]')].slice(0,100).map(el=>({text:(el.textContent||'').trim().slice(0,100),route:el.dataset?.route||el.getAttribute('data-tab')||el.getAttribute('data-action')||null}));
      return {
        url:location.href,
        title:document.title,
        scroll:{docWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,bodyWidth:document.body.scrollWidth,docHeight:document.documentElement.scrollHeight},
        components,collisions,storage,indexedDBNames,cacheNames,nav,
        instrumentation:{...window.__RUSSIAN_P1}
      };
    },{selectors,cssProps});
    await page.evaluate(async()=>{
      if(window.__RUSSIAN_P1)window.__RUSSIAN_P1.storageWrites=[];
      window.RUSSIAN_FUTURE_UI?.upgrade?.();
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
      window.RUSSIAN_FUTURE_UI?.upgrade?.();
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    });
    const postUpgrade=await page.evaluate(()=>({writes:window.__RUSSIAN_P1?.storageWrites||[],mutationObservers:window.__RUSSIAN_P1?.mutationObservers||0}));
    assert.equal(postUpgrade.writes.length,0,'Presentation-only Future UI rerender must not write learner storage');
    assert.ok(data.scroll.docWidth<=viewport.width+4,`Horizontal overflow at ${viewport.width}x${viewport.height}: ${data.scroll.docWidth}`);
    assert.equal(pageErrors.length,0,'Page errors at '+viewport.width+'x'+viewport.height+': '+pageErrors.join('\n'));
    const shot=path.join(OUT,`russian-p1-${viewport.width}x${viewport.height}.png`);
    await page.screenshot({path:shot,fullPage:true});
    report.viewports.push({viewport,data,postUpgrade,consoleErrors,pageErrors,responses:responses.slice(-500),screenshot:path.basename(shot)});
    await context.close();
  }
  report.summary={
    viewportCount:report.viewports.length,
    horizontalOverflowFailures:report.viewports.filter(x=>x.data.scroll.docWidth>x.viewport.width+4).map(x=>x.viewport),
    pageErrorCount:report.viewports.reduce((n,x)=>n+x.pageErrors.length,0),
    consoleErrorCount:report.viewports.reduce((n,x)=>n+x.consoleErrors.length,0),
    maxMutationObserverCount:Math.max(...report.viewports.map(x=>x.data.instrumentation.mutationObservers||0)),
    storageKeys:[...new Set(report.viewports.flatMap(x=>Object.keys(x.data.storage.local)))],
    sessionKeys:[...new Set(report.viewports.flatMap(x=>Object.keys(x.data.storage.session)))],
    indexedDBNames:[...new Set(report.viewports.flatMap(x=>x.data.indexedDBNames))],
    cacheNames:[...new Set(report.viewports.flatMap(x=>x.data.cacheNames))]
  };
  fs.writeFileSync(path.join(OUT,'russian-p1-forensic-browser.json'),JSON.stringify(report,null,2));
  console.log('Russian P1 forensic browser evidence:',JSON.stringify(report.summary));
}finally{
  await browser?.close();
}
