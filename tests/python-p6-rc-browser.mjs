import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/python-p6-browser';fs.mkdirSync(OUT,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:900}});
 let delayedRunId=null,cancelRunId=null;
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.route('**/api/python/runtime',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,implementation:'CPython',version:'3.14.8',runtimeProfileId:'cpython-3.14.8-stdlib-v1'})}));
 await page.route('**/api/python/run',async r=>{const body=JSON.parse(r.request().postData()||'{}');delayedRunId=body.runId;await new Promise(x=>setTimeout(x,1200));await r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,status:'complete',runId:body.runId,stdout:'late-result\n',stderr:'',durationMs:1200,runtimeProfileId:'cpython-3.14.8-stdlib-v1'})})});
 await page.route('**/api/python/cancel',async r=>{const body=JSON.parse(r.request().postData()||'{}');cancelRunId=body.runId;await r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,canceled:true,runId:body.runId})})});
 await page.route('**/api/python/test',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,runId:'test-p6',passed:2,total:2,tests:[{id:'a',status:'passed',runtimeStatus:'complete'},{id:'b',status:'passed',runtimeStatus:'complete'}],masteryWrite:false})}));
 await page.route('**/api/python/submit',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,runId:'submit-p6',result:'passed',passed:5,total:5,hiddenMaterialReturned:false,officialAttemptWrite:false,masteryWrite:false})}));
 await page.goto(BASE+'subjects/programming/code-lab.html?task=py-beginner-sum',{waitUntil:'load'});
 await page.locator('#runBtn').click();await page.waitForTimeout(100);assert.equal(await page.locator('#cancelBtn').isVisible(),true);await page.locator('#cancelBtn').click();await page.waitForFunction(()=>document.querySelector('#runStatus').textContent.includes('Đã hủy'));await page.waitForTimeout(1400);
 assert.equal(delayedRunId,cancelRunId,'Cancel must target the exact in-flight runId');
 assert.match(await page.locator('#runStatus').innerText(),/Đã hủy/);assert.doesNotMatch(await page.locator('#stdout').innerText(),/late-result/);

 await page.unroute('**/api/python/run');
 await page.route('**/api/python/run',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:false,status:'timeout',runId:'timeout-p6',stdout:'',stderr:'',durationMs:500,runtimeProfileId:'cpython-3.14.8-stdlib-v1'})}));
 await page.locator('#runBtn').click();await page.waitForFunction(()=>document.querySelector('#runStatus').textContent.includes('timeout'));assert.match(await page.locator('#runStatus').innerText(),/timeout/);

 await page.locator('#codeEditor').fill('print(123)');await page.waitForTimeout(650);
 const second=await context.newPage();await second.goto(BASE+'subjects/programming/code-lab.html?task=py-beginner-sum',{waitUntil:'load'});await second.locator('#codeEditor').fill('print(456)');await second.waitForTimeout(650);await page.waitForFunction(()=>!document.querySelector('#conflictBanner').classList.contains('hidden'));assert.equal(await page.locator('#conflictBanner').isVisible(),true);

 await context.setOffline(true);await page.waitForTimeout(100);assert.equal(await page.locator('#offlineBanner').isVisible(),true);assert.equal(await page.locator('#runBtn').isDisabled(),true);await context.setOffline(false);
 for(const vp of [{width:1024,height:768},{width:390,height:844}]){await page.setViewportSize(vp);await page.waitForTimeout(80);const o=await page.evaluate(()=>({c:document.documentElement.clientWidth,s:document.documentElement.scrollWidth}));assert.ok(o.s<=o.c+2,'overflow '+vp.width);}
 const author=await context.newPage();await author.goto(BASE+'subjects/programming/editor.html',{waitUntil:'load'});await author.waitForFunction(()=>document.querySelectorAll('#competency option').length>=16);const comp=await author.locator('#competency').inputValue();assert.match(comp,/^py\.comp\./);await author.locator('#validateBtn').click();assert.match(await author.locator('#validationOutput').innerText(),/VALIDATE PASS/);
 await page.screenshot({path:path.join(OUT,'python-p6-mobile.png')});
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',cancelTargetsInflightRun:true,staleResultQuarantined:true,timeoutDistinct:true,multiTabConflict:true,offlineHonest:true,canonicalAuthoring:true,viewports:['1440x900','1024x768','390x844']},null,2));
 console.log('PYTHON_P6_RC_BROWSER=PASS');
}finally{await browser?.close();}
