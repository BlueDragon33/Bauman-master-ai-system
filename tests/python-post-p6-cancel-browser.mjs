import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/python-post-p6-browser';fs.mkdirSync(OUT,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1280,height:800}});
 const page=await context.newPage();const errors=[];let runId=null,cancelId=null;
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.route('**/api/python/runtime',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,implementation:'CPython',version:'3.14.8',runtimeProfileId:'cpython-3.14.8-stdlib-v1'})}));
 await page.route('**/api/python/run',async r=>{const b=JSON.parse(r.request().postData()||'{}');runId=b.runId;await new Promise(x=>setTimeout(x,1000));await r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,status:'complete',runId:b.runId,stdout:'LATE\n',stderr:'',durationMs:1000,runtimeProfileId:'cpython-3.14.8-stdlib-v1'})})});
 await page.route('**/api/python/cancel',async r=>{const b=JSON.parse(r.request().postData()||'{}');cancelId=b.runId;await r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,canceled:true,runId:b.runId})})});
 await page.goto(BASE+'subjects/programming/code-lab.html?task=py-beginner-sum',{waitUntil:'load'});
 await page.locator('#runBtn').click();await page.waitForTimeout(100);
 assert.equal(await page.locator('#cancelBtn').isVisible(),true,'cancel must be available during run');
 await page.locator('#cancelBtn').click();
 await page.waitForFunction(()=>document.querySelector('#runStatus')?.textContent?.includes('Đã hủy'));
 await page.waitForTimeout(1100);
 assert.equal(runId,cancelId,'client must cancel exact in-flight run');
 assert.doesNotMatch(await page.locator('#stdout').innerText(),/LATE/,'late result must not repaint UI');
 assert.match(await page.locator('#runStatus').innerText(),/Đã hủy/);

 const author=await context.newPage();await author.goto(BASE+'subjects/programming/editor.html',{waitUntil:'load'});
 await author.waitForFunction(()=>document.querySelectorAll('#competency option').length>=16);
 assert.match(await author.locator('#competency').inputValue(),/^py\.comp\./);
 await author.locator('#validateBtn').click();assert.match(await author.locator('#validationOutput').innerText(),/VALIDATE PASS/);

 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',cancelExactRun:true,lateResultQuarantined:true,canonicalAuthoring:true},null,2));
 console.log('PYTHON_POST_P6_CANCEL_BROWSER=PASS');
}finally{await browser?.close();}
