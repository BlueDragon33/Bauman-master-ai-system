'use strict';

const fs=require('fs');
const path=require('path');
const { chromium }=require('playwright');

const BASE_URL=process.env.BAUMAN_TEST_BASE_URL||'http://127.0.0.1:4173';
const LARGE_BYTES=5*1024*1024;
const SETTLE_MS=1800;
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

    const json=[...requested.entries()].map(([file,bytes])=>({file:path.relative('.',file),bytes})).sort((a,b)=>b.bytes-a.bytes);
    const large=json.filter((item)=>item.bytes>=LARGE_BYTES);
    if(large.length)failures.push(`${id}: startup requested >=5 MB JSON: ${large.map((item)=>`${item.file} ${(item.bytes/1024/1024).toFixed(2)} MB`).join(', ')}`);
    report.push({id,route,jsonCount:json.length,jsonBytes:json.reduce((sum,item)=>sum+item.bytes,0),large});
    await page.close();
  }

  await browser.close();
  fs.mkdirSync('docs/migration',{recursive:true});
  fs.writeFileSync('docs/migration/L5_BROWSER_NETWORK_REGRESSION.generated.json',JSON.stringify({largeBytes:LARGE_BYTES,settleMs:SETTLE_MS,pages:report,failures},null,2)+'\n');
  report.forEach((row)=>console.log(`${row.id}: ${row.jsonCount} startup JSON, ${(row.jsonBytes/1024/1024).toFixed(2)} MB`));
  if(failures.length){console.error(failures.join('\n'));process.exit(2);}
  console.log('L5 browser network regression PASS.');
})().catch((error)=>{console.error(error);process.exit(1);});
