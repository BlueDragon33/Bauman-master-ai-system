import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-ru08-authoring';fs.mkdirSync(OUT,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
 const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(String(e)));
 const url=new URL('/subjects/russian/editor.html',BASE).href;await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForSelector('[data-ru08-authoring]');
 assert.equal(await page.locator('#advancedPayload').isVisible(),false,'raw JSON advanced payload must not be default surface');
 await page.selectOption('#responsibility','vocab');await page.fill('#canonicalId','LEX-RU08-E2E');await page.fill('#revision','e2e-r1');await page.fill('#titleField','пример');
 await page.fill('#bodyField','Проверочный пример.');await page.fill('#diffSummary','RU08 guided authoring browser fixture');await page.fill('#rollbackNote','restore previous revision');
 await page.click('#buildBtn');await page.waitForFunction(()=>document.querySelector('#preview')?.textContent.includes('RUSSIAN_AUTHORING_CANDIDATE_V2'));
 let preview=JSON.parse(await page.locator('#preview').innerText());assert.equal(preview.candidate.state,'VALIDATED');assert.equal(preview.reviewEnvelope.metadataOnly,true);assert.match(await page.locator('#authorStatus').innerText(),/chưa có source refs/i);
 await page.fill('#sourceRefs','source:test\nGOST:test');await page.click('#buildBtn');await page.waitForFunction(()=>document.querySelector('#authorStatus')?.textContent.includes('Content Review'));
 preview=JSON.parse(await page.locator('#preview').innerText());assert.equal(preview.reviewEnvelope.subjectId,'russian');assert.equal(preview.reviewEnvelope.sourcePath,'subjects/russian/data/vocab.json');assert.match(preview.candidate.contentHash,/^[a-f0-9]{64}$/);
 await page.screenshot({path:path.join(OUT,'authoring.png'),fullPage:true});assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',candidateId:preview.candidate.candidateId,metadataOnly:preview.reviewEnvelope.metadataOnly,errors},null,2));
 console.log('Russian RU08 authoring browser acceptance PASS');
}finally{await browser?.close()}
