'use strict';

const fs=require('fs');
const path=require('path');
const { chromium }=require('playwright');

const BASE_URL=process.env.BAUMAN_TEST_BASE_URL||'http://127.0.0.1:4173';
const LARGE_BYTES=5*1024*1024;
const SETTLE_MS=1800;
const INTERACTION_MS=500;
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
      interaction.checks.push({name:'v1341-self-check',result:selfCheck});
      if(!selfCheck||selfCheck.ok!==true)failures.push('russian: V13.41 self-check failed');
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

  await browser.close();
  fs.mkdirSync('docs/migration',{recursive:true});
  fs.writeFileSync('docs/migration/L5_BROWSER_NETWORK_REGRESSION.generated.json',JSON.stringify({largeBytes:LARGE_BYTES,settleMs:SETTLE_MS,interactionMs:INTERACTION_MS,pages:report,failures},null,2)+'\n');
  report.forEach((row)=>console.log(`${row.id}: ${row.startupJsonCount} startup JSON, ${(row.startupJsonBytes/1024/1024).toFixed(2)} MB, ${row.startupLarge.length} startup large`));
  if(failures.length){console.error(failures.join('\n'));process.exit(2);}
  console.log('L5 browser network + deferred interaction regression PASS.');
})().catch((error)=>{console.error(error);process.exit(1);});
