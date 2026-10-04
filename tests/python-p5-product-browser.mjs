import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/python-p5-browser';fs.mkdirSync(OUT,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
 const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.route('**/api/python/runtime',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,implementation:'CPython',version:'3.14.8',runtimeProfileId:'cpython-3.14.8-stdlib-v1'})}));
 await page.route('**/api/python/run',async r=>{const body=JSON.parse(r.request().postData()||'{}');await r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,status:'complete',runId:'run-browser-1',stdout:body.stdin==='2 3\n'?'5\n':'',stderr:'',durationMs:7,runtimeProfileId:'cpython-3.14.8-stdlib-v1'})})});
 await page.route('**/api/python/test',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,runId:'test-browser-1',passed:2,total:2,tests:[{id:'positive',status:'passed',runtimeStatus:'complete'},{id:'negative',status:'passed',runtimeStatus:'complete'}],masteryWrite:false})}));
 await page.route('**/api/python/submit',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,runId:'submit-browser-1',result:'passed',passed:5,total:5,hiddenTestCount:3,hiddenMaterialReturned:false,officialAttemptWrite:false,masteryWrite:false})}));
 await page.goto(BASE+'subjects/programming/code-lab.html?task=py-beginner-sum',{waitUntil:'load',timeout:30000});
 await page.waitForSelector('#codeEditor');
 assert.equal(await page.locator('#runBtn').innerText(),'▶ Run');assert.match(await page.locator('#testBtn').innerText(),/Run tests/);assert.equal(await page.locator('#submitBtn').innerText(),'Submit');
 await page.locator('#runBtn').click();await page.waitForFunction(()=>document.querySelector('#stdout').textContent.includes('5'));assert.equal((await page.locator('#stdout').innerText()).trim(),'5');
 await page.locator('#testBtn').click();await page.waitForFunction(()=>document.querySelectorAll('.test-row').length===2);assert.equal(await page.locator('.test-row.pass').count(),2);
 await page.locator('#codeEditor').focus();await page.keyboard.press('Control+Enter');await page.waitForTimeout(50);
 const saved=await page.evaluate(()=>Object.keys(localStorage).some(k=>k.startsWith('bauman:python:draft:')));assert.equal(saved,true);
 for(const vp of [{width:1024,height:768},{width:390,height:844}]){await page.setViewportSize(vp);await page.waitForTimeout(100);const o=await page.evaluate(()=>({c:document.documentElement.clientWidth,s:document.documentElement.scrollWidth}));assert.ok(o.s<=o.c+2,'overflow '+vp.width+' '+o.s+'/'+o.c);}
 await page.screenshot({path:path.join(OUT,'python-p5-mobile.png'),fullPage:false});
 const author=await page.context().newPage();await author.goto(BASE+'subjects/programming/editor.html',{waitUntil:'load'});await author.locator('#validateBtn').click();assert.match(await author.locator('#validationOutput').innerText(),/VALIDATE PASS/);assert.match(await author.locator('#authorStatus').innerText(),/VALIDATED/);
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',viewports:['1440x900','1024x768','390x844'],runTestSubmitDistinct:true,authorValidation:true},null,2));
 console.log('PYTHON_P5_PRODUCT_BROWSER=PASS');
}finally{await browser?.close()}
