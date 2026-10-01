import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-ru05-scenario';
fs.mkdirSync(OUT,{recursive:true});
const PAGE_URL=new URL('subjects/russian/index.html',BASE).href;
let browser;

async function open(context){
  const page=await context.newPage();const errors=[],scenarioRequests=[];
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  page.on('request',r=>{if(r.url().includes('/subjects/russian/data/scenario-registry.json'))scenarioRequests.push(r.url());});
  await page.goto(PAGE_URL,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>!!window.RussianScenarioRuntime,{timeout:15000});
  await page.waitForTimeout(250);
  const initial=await page.evaluate(()=>window.RussianScenarioRuntime.status());
  assert.equal(initial.ready,false,'scenario data must not be loaded at Russian startup');
  assert.equal(initial.lazyOnCapabilityUse,true,'scenario runtime must declare lazy-on-capability-use behavior');
  assert.equal(scenarioRequests.length,0,'scenario registry fetched before dialogue/API use');
  return {page,errors,scenarioRequests};
}
try{
 browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 const {page,errors,scenarioRequests}=await open(context);
 await page.evaluate(()=>window.RussianScenarioRuntime.loadRegistry());
 await page.waitForFunction(()=>window.RussianScenarioRuntime?.status?.().ready===true,{timeout:15000});
 assert.equal(scenarioRequests.length,1,'explicit scenario capability use must load the registry once');
 const registry=await page.evaluate(()=>({status:window.RussianScenarioRuntime.status(),list:window.RussianScenarioRuntime.list()}));
 assert.equal(registry.status.registry.ok,true,'scenario registry graph must validate');
 for(const family of ['real-life','administration','classroom','lab','seminar','research','defense'])assert(registry.list.some(x=>x.family===family),'missing scenario family '+family);

 const run=await page.evaluate(()=>{
   localStorage.removeItem('bauman_russian_scenario_runtime_v1');
   const api=window.RussianScenarioRuntime;
   api.start('P11-RESEARCH-NIR');
   api.advance('challenge');
   api.repair('restate-scope');
   return api.activeRun();
 });
 assert.equal(run.scenarioId,'P11-RESEARCH-NIR');
 assert.equal(run.nodeId,'challenge');
 assert.equal(run.repairs.length,1);
 assert.equal(run.completed,false);

 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.RussianScenarioRuntime,{timeout:15000});
 await page.evaluate(()=>window.RussianScenarioRuntime.loadRegistry());
 await page.waitForFunction(()=>window.RussianScenarioRuntime?.status?.().ready===true,{timeout:15000});
 const resumed=await page.evaluate(()=>window.RussianScenarioRuntime.activeRun());
 assert.equal(resumed.nodeId,'challenge','scenario node must survive refresh');
 assert.equal(resumed.repairs.length,1,'repair history must survive refresh');
 const completed=await page.evaluate(()=>{window.RussianScenarioRuntime.advance('close');return window.RussianScenarioRuntime.activeRun();});
 assert.equal(completed.completed,true);
 assert(completed.events.some(x=>x.type==='complete'));

 // Simulate registry-network failure: cached canonical scenario registry must keep runtime usable.
 await page.route('**/subjects/russian/data/scenario-registry.json',route=>route.abort());
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.RussianScenarioRuntime,{timeout:15000});
 await page.evaluate(()=>window.RussianScenarioRuntime.loadRegistry());
 await page.waitForFunction(()=>window.RussianScenarioRuntime?.status?.().ready===true,{timeout:15000});
 const fallback=await page.evaluate(()=>window.RussianScenarioRuntime.status());
 assert.equal(fallback.offlineFallback,true,'scenario engine must use deterministic cached fallback');

 await page.evaluate(()=>{
   const key=window.SUBJECT_ADAPTER.storageKey;
   const s=JSON.parse(localStorage.getItem(key)||'{}');s.view='dialogue';s.stage='hk3';localStorage.setItem(key,JSON.stringify(s));
 });
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForSelector('#ruScenarioRuntime',{timeout:15000});
 await page.screenshot({path:OUT+'/research-scenario.png',fullPage:true});
 assert.deepEqual(errors,[],'Page errors: '+errors.join('\n'));
 await context.close();

 const mobile=await browser.newContext({viewport:{width:390,height:844}});
 const opened=await open(mobile);const m=opened.page;
 await m.evaluate(()=>{const key=window.SUBJECT_ADAPTER.storageKey;const s=JSON.parse(localStorage.getItem(key)||'{}');s.view='dialogue';s.stage='vn';localStorage.setItem(key,JSON.stringify(s));});
 await m.reload({waitUntil:'domcontentloaded'});
 await m.waitForSelector('#ruScenarioRuntime',{timeout:15000});
 await m.waitForFunction(()=>window.RussianScenarioRuntime?.status?.().ready===true,{timeout:15000});
 const overflow=await m.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 assert(overflow<=2,'scenario mobile layout overflows by '+overflow+'px');
 await m.screenshot({path:OUT+'/mobile-scenario.png',fullPage:true});
 assert.deepEqual(opened.errors,[],'Mobile page errors: '+opened.errors.join('\n'));
 await mobile.close();
 console.log(JSON.stringify({ok:true,scenarios:registry.list.length,fallback:true,mobileOverflow:overflow}));
}finally{await browser?.close();}