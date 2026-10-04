// Trusted transport fixtures validate UI/state races; no Python is executed.
import assert from 'node:assert/strict';
import {chromium} from '../runtime/python-cloudflare/node_modules/playwright/index.mjs';
const base=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:3015/';
const browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
const errors=[];
try {
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]) {
  const context=await browser.newContext({viewport});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  let release,startRun,waitRun;const cancelled=[];
  function resetPending(){waitRun=new Promise(r=>startRun=r);}
  resetPending();
  await context.route('**/api/python/*',async route=>{
   const op=new URL(route.request().url()).pathname.split('/').pop(),body=JSON.parse(route.request().postData()||'{}');
   if(op==='reserve')return route.fulfill({contentType:'application/json',body:JSON.stringify({status:'reserved',runId:crypto.randomUUID()})});
   if(op==='cancel'){cancelled.push(body.runId);return route.fulfill({contentType:'application/json',body:JSON.stringify({status:'cancelled'})});}
   if(op==='run'){
    startRun();await new Promise(r=>release=r);
    return route.fulfill({contentType:'application/json',body:JSON.stringify({...body,status:'completed',stdout:'OLD_RESULT\n',stderr:'',officialEvidence:false,cleanup:true})}).catch(()=>{});
   }
   throw Error('second execution transport selected');
  });
  await page.goto(base+'subjects/programming/code-lab.html?task=py-beginner-sum');
  await page.waitForFunction(()=>document.querySelector('#taskSelect').options.length>=3);
  await page.locator('#runBtn').click();await waitRun;
  await page.locator('#cancelBtn').click();
  assert.equal(await page.locator('#runStatus').getAttribute('data-state'),'cancelled','pending cancellation did not invalidate UI');
  release();await page.waitForTimeout(200);
  assert.equal(await page.locator('#stdout').textContent(),'');assert.ok(cancelled.length);
  resetPending();await page.locator('#runBtn').click();await waitRun;
  await page.locator('#stdinInput').fill('changed input');release();await page.waitForTimeout(200);
  assert.equal(await page.locator('#stdout').textContent(),'','previous stdin execution remained current');
  resetPending();await page.locator('#runBtn').click();await waitRun;
  const next=await page.locator('#taskSelect option').nth(1).getAttribute('value');
  await page.locator('#taskSelect').selectOption(next);release();await page.waitForTimeout(200);
  assert.equal(await page.locator('#stdout').textContent(),'','old task execution overwrote selected task');
  const draftKey='bauman:python:draft:'+next;
  await page.locator('#codeEditor').fill('my pending draft');
  await page.evaluate(k=>{
   const value=JSON.stringify({taskId:document.querySelector('#taskSelect').value,code:'NEWER_OTHER_TAB',updatedAt:Date.now()+10000});
   localStorage.setItem(k,value);dispatchEvent(new StorageEvent('storage',{key:k,newValue:value,storageArea:localStorage}));
  },draftKey);
  await page.waitForTimeout(650);
  assert.equal(JSON.parse(await page.evaluate(k=>localStorage.getItem(k),draftKey)).code,'NEWER_OTHER_TAB','autosave overwrote a newer tab draft');
  await page.locator('#testBtn').click();await page.waitForSelector('#runStatus[data-state="error"]');
  assert.equal(await page.locator('.test-row.pass').count(),0,'unsupported task grading granted public PASS');
  await page.locator('#submitBtn').click();await page.waitForFunction(()=>document.querySelector('#evidenceOutput').textContent.includes('OFFICIAL_ASSESSMENT_UNAVAILABLE'));
  await context.setOffline(true);await page.waitForTimeout(100);assert.equal(await page.locator('#runBtn').isDisabled(),true);
  await context.setOffline(false);await page.reload();await page.waitForFunction(()=>document.querySelector('#taskSelect').options.length>=3);
  assert.equal(await page.locator('#codeEditor').inputValue(),'NEWER_OTHER_TAB');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true);
  await page.goto(base+'subjects/programming/editor.html');
  resetPending();await page.locator('#previewBtn').click();await waitRun;
  await page.locator('#starter').fill('changed starter');release();await page.waitForTimeout(200);
  assert.equal(await page.locator('#previewOutput').textContent(),'','previous author draft execution remained current');
  assert.match(await page.locator('#authorStatus').textContent(),/^DRAFT/);
  resetPending();await page.locator('#previewBtn').click();await waitRun;
  const oldRelease=release;
  resetPending();await page.locator('#previewBtn').click();await waitRun;
  release();await page.waitForTimeout(200);
  const latestPreview=await page.locator('#previewOutput').textContent();
  assert.match(latestPreview,/completed/);
  oldRelease();await page.waitForTimeout(200);
  assert.equal(await page.locator('#previewOutput').textContent(),latestPreview,'old author preview replaced latest result');
  await context.close();
 }
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({status:'PASS',scope:'TRUSTED_TRANSPORT_UI_ONLY',viewports:['desktop','mobile'],journeys:['cancel-before-result','stale-stdin','stale-task','newer-tab-draft','unsupported-assessment','offline','reload-state','author-edit','author-preview-order'],realPythonExecuted:false}));
}finally{await browser.close();}
