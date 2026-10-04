import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL;
if(!BASE)throw new Error('BAUMAN_E2E_BASE_URL required');
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/python-production-smoke';fs.mkdirSync(OUT,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 const smokeSession=String(process.env.BAUMAN_E2E_DEVICE_SESSION||'').trim();if(!smokeSession)throw new Error('BAUMAN_E2E_DEVICE_SESSION required');
 const baseUrl=new URL(BASE);await context.addCookies([{name:'__Host-bauman_session',value:smokeSession,url:baseUrl.origin+'/',httpOnly:true,secure:baseUrl.protocol==='https:',sameSite:'Strict'}]);
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto(new URL('subjects/programming/code-lab.html?task=py-beginner-sum',BASE).href,{waitUntil:'load',timeout:30000});await page.waitForFunction(()=>document.querySelector('#runtimeSummary')?.textContent?.includes('3.14.8'),null,{timeout:30000});
 await page.locator('#runBtn').click();await page.waitForFunction(()=>document.querySelector('#stdout')?.textContent?.trim()==='5',null,{timeout:15000});
 await page.locator('#testBtn').click();await page.waitForFunction(()=>document.querySelectorAll('.test-row.pass').length>=2,null,{timeout:20000});
 await page.locator('#taskSelect').selectOption('py-assessment-even');await page.locator('#codeEditor').fill("n=int(input());print('EVEN' if n%2==0 else 'ODD')");await page.locator('#submitBtn').click();await page.waitForFunction(()=>document.querySelector('#evidenceOutput')?.textContent?.includes('"result": "passed"'),null,{timeout:30000});
 const evidence=JSON.parse(await page.locator('#evidenceOutput').innerText());assert.equal(evidence.hiddenMaterialReturned,false);assert.equal(evidence.officialAttemptWrite,false);assert.equal(evidence.masteryWrite,false);
 const draft=await page.evaluate(()=>Object.keys(localStorage).some(k=>k.startsWith('bauman:python:draft:')));assert.equal(draft,true);
 await page.locator('#hintBtn').click();assert.ok(await page.locator('#hintList li').count()>=1);
 const envProbe=await page.evaluate(async()=>{const r=await fetch('/api/python/run',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({runId:'prod-'+crypto.randomUUID().toLowerCase(),code:'import os; print(os.environ)',timeoutMs:1000})});return r.json();});
 assert.equal(envProbe.status,'complete');assert.doesNotMatch(String(envProbe.stdout),/BAUMAN_|TOKEN|SECRET|DATABASE/i);
 await context.setOffline(true);await page.waitForTimeout(100);assert.equal(await page.locator('#offlineBanner').isVisible(),true);assert.equal(await page.locator('#runBtn').isDisabled(),true);await context.setOffline(false);
 assert.deepEqual(errors,[]);
 const summary={status:'PASS',runtimeProfile:'cpython-3.14.8-stdlib-v1',run:true,publicTests:true,evidenceOnlySubmit:true,draftPersistence:true,hintFallback:true,safeEnvIsolationProbe:true,offlineHonest:true};
 fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(summary,null,2));await page.screenshot({path:path.join(OUT,'python-production-smoke.png')});
 console.log('Python production RC smoke PASS',JSON.stringify(summary));
}finally{await browser?.close();}
