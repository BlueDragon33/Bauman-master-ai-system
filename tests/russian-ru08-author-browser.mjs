import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-ru08-author';
fs.mkdirSync(OUT,{recursive:true});
let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  await page.goto(new URL('subjects/russian/editor.html',BASE).href,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>!!window.RussianAuthorWorkspace,null,{timeout:15000});
  assert.equal(await page.locator('#storageItemJson').count(),0,'Ordinary author surface must not default to raw JSON');
  assert.ok(await page.locator('#responsibility option').count()>5,'Authorable entity mapping did not load');
  await page.selectOption('#responsibility','LexicalEntry');
  await page.fill('#canonicalId','LEX-RU08-BROWSER-001');
  await page.fill('#revision','r1');
  await page.fill('#ruText','пример');
  await page.fill('#viText','ví dụ');
  await page.fill('#sourceRefs','source:ru08-browser-fixture');
  await page.fill('#diffSummary','Browser acceptance candidate');
  await page.fill('#rollbackNote','Restore prior canonical item');
  await page.locator('#candidateForm button[type="submit"]').click();
  await page.waitForFunction(()=>window.RussianAuthorWorkspace.state.candidate?.state==='VALIDATED');
  const valid=await page.evaluate(()=>({
    candidate:window.RussianAuthorWorkspace.state.candidate,
    owner:window.RussianAuthorWorkspace.ownerFor('LexicalEntry'),
    reviewDisabled:document.getElementById('reviewBtn').disabled
  }));
  assert.equal(valid.owner,'subjects/russian/data/vocab.json');
  assert.equal(valid.reviewDisabled,false);
  assert.match(valid.candidate.contentHash,/^[0-9a-f]{64}$/);
  await page.click('#reviewBtn');
  const reviewed=await page.evaluate(()=>({
    candidate:window.RussianAuthorWorkspace.state.candidate,
    envelope:window.RussianAuthorWorkspace.state.reviewEnvelope
  }));
  assert.equal(reviewed.candidate.state,'REVIEW_REQUESTED');
  assert.equal(reviewed.envelope.metadataOnly,true);
  assert.equal(reviewed.envelope.learningContentStored,false);
  assert.equal(reviewed.envelope.canonicalOwner,'subjects/russian/data/vocab.json');
  assert.equal(await page.locator('[data-canonical-write]').count(),0,'Workspace must not expose direct canonical-write controls');
  await page.screenshot({path:path.join(OUT,'author-workspace.png'),fullPage:true});
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',owner:valid.owner,candidateState:reviewed.candidate.state,metadataOnly:true},null,2));
  assert.deepEqual(errors,[]);
  console.log('Russian RU08 author browser acceptance PASS');
}finally{await browser?.close();}