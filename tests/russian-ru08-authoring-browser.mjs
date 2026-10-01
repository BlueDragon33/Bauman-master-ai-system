import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-ru08-authoring';
fs.mkdirSync(OUT,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 const errors=[]; page.on('pageerror',e=>errors.push(String(e))); page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto(new URL('subjects/russian/editor.html',BASE).href,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForSelector('#authoringForm',{timeout:15000});
 await page.selectOption('#entityType','TechnicalConcept');
 await page.fill('#canonicalId','TC-RU08-DEMO');
 await page.fill('#candidateId','RU8-CAND-DEMO');
 await page.fill('#revision','r1');
 await page.fill('#proposal','Демонстрационное предложение для проверки authoring flow.');
 await page.fill('#sourceRefs','source:demo');
 await page.fill('#diffSummary','RU08 browser acceptance candidate');
 await page.fill('#rollbackNote','Discard candidate; canonical data remains unchanged.');
 await page.click('button[type=submit]');
 await page.waitForFunction(()=>document.querySelector('#preview')?.textContent?.includes('metadataOnly'));
 const result=await page.evaluate(()=>{
  const p=JSON.parse(document.querySelector('#preview').textContent);
  return {status:document.querySelector('#status').textContent,entityType:p.entityType,sourcePath:p.reviewEnvelope.sourcePath,metadataOnly:p.reviewEnvelope.metadataOnly,contentHash:p.contentHash,canonicalPatched:p.canonicalPatched??false};
 });
 assert.match(result.status,/Hợp lệ/);
 assert.equal(result.entityType,'TechnicalConcept');
 assert.equal(result.sourcePath,'subjects/russian/data/technical-concepts.json');
 assert.equal(result.metadataOnly,true);
 assert.match(result.contentHash,/^[a-f0-9]{64}$/);
 assert.equal(result.canonicalPatched,false);
 assert.deepEqual(errors,[]);
 await page.screenshot({path:path.join(OUT,'authoring-editor.png'),fullPage:true});
 fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',result},null,2));
 console.log('Russian RU08 authoring browser acceptance PASS');
}finally{await browser?.close()}
