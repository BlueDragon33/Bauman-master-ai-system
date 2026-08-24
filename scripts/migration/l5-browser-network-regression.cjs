'use strict';

const fs=require('fs');
const path=require('path');
const { chromium }=require('playwright');

const BASE_URL=process.env.BAUMAN_TEST_BASE_URL||'http://127.0.0.1:4173';
const LARGE_BYTES=5*1024*1024;
const SETTLE_MS=1800;
const INTERACTION_MS=500;
const RUSSIAN_DB_KEY='bauman_russian_survival_master_v11_clean_skeleton_db';
const PAGES=[
  ['main','/index.html'],
  ['ai','/subjects/ai/index.html'],
  ['foundation','/subjects/foundation/index.html'],
  ['math','/subjects/math/index.html'],
  ['programming','/subjects/programming/index.html'],
  ['research','/subjects/research/index.html'],
  ['russian','/subjects/russian/index.html'],
  ['signal','/subjects/signal/index.html'],
  ['systems','/subjects/systems/index.html']
];

function localJsonFile(url){
  try{
    const parsed=new URL(url);
    if(parsed.origin!==new URL(BASE_URL).origin)return null;
    const rel=decodeURIComponent(parsed.pathname).replace(/^\/+/, '');
    if(!rel.endsWith('.json')||rel.includes('..'))return null;
    const file=path.resolve(rel);
    const root=path.resolve('.')+path.sep;
    if(!file.startsWith(root)||!fs.existsSync(file)||!fs.statSync(file).isFile())return null;
    return file;
  }catch(_){return null;}
}

function relative(file){return path.relative('.',file).split(path.sep).join('/');}
function hasRequested(requested,suffix){
  return [...requested.keys()].some((file)=>relative(file).endsWith(suffix));
}
async function clickSelector(page,selector,label,failures){
  const clicked=await page.evaluate((sel)=>{
    const el=document.querySelector(sel);
    if(!el)return false;
    el.click();
    return true;
  },selector).catch(()=>false);
  if(!clicked)failures.push(`${label}: missing selector ${selector}`);
  return clicked;
}
async function expectRequest(requested,suffix,label,failures){
  if(!hasRequested(requested,suffix))failures.push(`${label}: expected lazy request ${suffix}`);
}

(async()=>{
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:900}});
  const failures=[];
  const report=[];

  for(const [id,route] of PAGES){
    const page=await context.newPage();
    const requested=new Map();
    page.on('request',(request)=>{
      const file=localJsonFile(request.url());
      if(file)requested.set(file,fs.statSync(file).size);
    });

    try{
      await page.goto(BASE_URL+route,{waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForTimeout(SETTLE_MS);
    }catch(error){
      failures.push(`${id}: navigation failed: ${error.message}`);
    }

    const startupJson=[...requested.entries()].map(([file,bytes])=>({file:relative(file),bytes})).sort((a,b)=>b.bytes-a.bytes);
    const startupLarge=startupJson.filter((item)=>item.bytes>=LARGE_BYTES);
    if(startupLarge.length)failures.push(`${id}: startup requested >=5 MB JSON: ${startupLarge.map((item)=>`${item.file} ${(item.bytes/1024/1024).toFixed(2)} MB`).join(', ')}`);

    const interaction={checks:[]};

    if(id==='math'){
      const selfCheck=await page.evaluate(()=>window.BAUMAN_MATH_E246_LEGACY_ROUTE?.selfCheck?.()||null).catch(()=>null);
      interaction.checks.push({name:'e246-self-check',result:selfCheck});
      if(!selfCheck||selfCheck.ok!==true)failures.push('math: E246 self-check failed before interaction');
      if(hasRequested(requested,'subjects/math/data/lessons.json'))failures.push('math: lessons.json was requested before explicit legacy refresh');
      if(await clickSelector(page,'[data-e129-refresh]','math',failures)){
        await page.waitForTimeout(INTERACTION_MS);
        await expectRequest(requested,'subjects/math/data/lessons.json','math refresh',failures);
      }
    }

    if(id==='russian'){
      const selfCheck=await page.evaluate(()=>window.BAUMAN_RUSSIAN_V1341_LAZY?.selfCheck?.()||null).catch(()=>null);
      interaction.checks.push({name:'v1342-self-check',result:selfCheck});
      if(!selfCheck||selfCheck.ok!==true)failures.push('russian: V13.42 self-check failed');
      if(selfCheck&&selfCheck.persistenceSafe!==true)failures.push('russian: heavy data is still classified as persistent optional data');
      if(selfCheck&&selfCheck.storageListBridgeConsumed!==true)failures.push('russian: storage-list compatibility bridge was not consumed by core');
      for(const suffix of ['subjects/russian/data/vocab.json','subjects/russian/data/tests.json','subjects/russian/data/speaking.json']){
        if(hasRequested(requested,suffix))failures.push(`russian: ${suffix} was requested before feature entry`);
      }

      if(await clickSelector(page,'[data-view="vocab"]','russian vocab',failures)){
        await page.waitForTimeout(INTERACTION_MS);
        await expectRequest(requested,'subjects/russian/data/vocab.json','russian vocab',failures);
      }

      if(await clickSelector(page,'[data-view="learning"]','russian learning',failures)){
        await page.waitForTimeout(100);
        if(await clickSelector(page,'[data-learn="practice"]','russian practice',failures)){
          await page.waitForTimeout(INTERACTION_MS);
          await expectRequest(requested,'subjects/russian/data/speaking.json','russian practice',failures);
        }
        if(await clickSelector(page,'[data-learn="review"]','russian review',failures)){
          await page.waitForTimeout(INTERACTION_MS);
          await expectRequest(requested,'subjects/russian/data/tests.json','russian review',failures);
        }
      }
    }

    const allJson=[...requested.entries()].map(([file,bytes])=>({file:relative(file),bytes})).sort((a,b)=>b.bytes-a.bytes);
    report.push({
      id,
      route,
      startupJsonCount:startupJson.length,
      startupJsonBytes:startupJson.reduce((sum,item)=>sum+item.bytes,0),
      startupLarge,
      allJsonCount:allJson.length,
      interaction
    });
    await page.close();
  }

  /*
   * Persistence regression: simulate a legacy _db overlay that already contains user-edited
   * heavy Russian sources. Boot must not erase/filter it and must not re-fetch static heavy JSON.
   */
  const overlayPayload=JSON.stringify({
    vocab:[{id:'__l5_overlay_vocab__',ru:'проверка',vi:'kiểm tra overlay'}],
    tests:[{id:'__l5_overlay_test__',question:'overlay test',choices:['A','B'],answer:0,difficulty:'easy'}],
    speaking:[{id:'__l5_overlay_speaking__',lessonId:'__l5__',title:'overlay speaking',turns:[]}],
    l5OverlayMarker:{preserve:true,version:1}
  });
  const overlayContext=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:900}});
  const overlayPage=await overlayContext.newPage();
  const overlayRequested=new Map();
  overlayPage.on('request',(request)=>{
    const file=localJsonFile(request.url());
    if(file)overlayRequested.set(file,fs.statSync(file).size);
  });
  await overlayPage.addInitScript(({key,payload})=>{
    localStorage.setItem(key,payload);
  },{key:RUSSIAN_DB_KEY,payload:overlayPayload});
  try{
    await overlayPage.goto(BASE_URL+'/subjects/russian/index.html',{waitUntil:'domcontentloaded',timeout:30000});
    await overlayPage.waitForTimeout(SETTLE_MS);
    const overlaySelfCheck=await overlayPage.evaluate(()=>window.BAUMAN_RUSSIAN_V1341_LAZY?.selfCheck?.()||null).catch(()=>null);
    if(!overlaySelfCheck||overlaySelfCheck.ok!==true||overlaySelfCheck.persistenceSafe!==true){
      failures.push('russian overlay: persistence-safe lazy self-check failed');
    }
    for(const suffix of ['subjects/russian/data/vocab.json','subjects/russian/data/tests.json','subjects/russian/data/speaking.json']){
      if(hasRequested(overlayRequested,suffix))failures.push(`russian overlay: static heavy source re-fetched despite legacy overlay ${suffix}`);
    }
    const afterBoot=await overlayPage.evaluate((key)=>localStorage.getItem(key),RUSSIAN_DB_KEY);
    if(afterBoot!==overlayPayload)failures.push('russian overlay: legacy _db bytes changed during boot');

    await clickSelector(overlayPage,'[data-view="vocab"]','russian overlay vocab',failures);
    await overlayPage.waitForTimeout(INTERACTION_MS);
    const afterFeature=await overlayPage.evaluate((key)=>localStorage.getItem(key),RUSSIAN_DB_KEY);
    if(afterFeature!==overlayPayload)failures.push('russian overlay: legacy _db bytes changed after heavy feature entry');
    if(hasRequested(overlayRequested,'subjects/russian/data/vocab.json'))failures.push('russian overlay: vocab static JSON requested although overlay vocab was already loaded');

    report.push({
      id:'russian-overlay-persistence',
      route:'/subjects/russian/index.html',
      startupJsonCount:[...overlayRequested.keys()].length,
      startupJsonBytes:[...overlayRequested.values()].reduce((sum,bytes)=>sum+bytes,0),
      startupLarge:[],
      allJsonCount:[...overlayRequested.keys()].length,
      interaction:{checks:[{name:'legacy-db-byte-preservation',result:{ok:afterBoot===overlayPayload&&afterFeature===overlayPayload}},{name:'v1342-self-check',result:overlaySelfCheck}]}
    });
  }catch(error){
    failures.push(`russian overlay: navigation/regression failed: ${error.message}`);
  }
  await overlayContext.close();

  await context.close();
  await browser.close();
  fs.mkdirSync('docs/migration',{recursive:true});
  fs.writeFileSync('docs/migration/L5_BROWSER_NETWORK_REGRESSION.generated.json',JSON.stringify({largeBytes:LARGE_BYTES,settleMs:SETTLE_MS,interactionMs:INTERACTION_MS,pages:report,failures},null,2)+'\n');
  report.forEach((row)=>console.log(`${row.id}: ${row.startupJsonCount} startup JSON, ${(row.startupJsonBytes/1024/1024).toFixed(2)} MB, ${row.startupLarge.length} startup large`));
  if(failures.length){console.error(failures.join('\n'));process.exit(2);}
  console.log('L5 browser network + deferred interaction + Russian overlay persistence regression PASS.');
})().catch((error)=>{console.error(error);process.exit(1);});
