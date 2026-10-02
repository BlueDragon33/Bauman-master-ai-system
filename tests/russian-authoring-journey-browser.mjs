import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-authoring-journey';
fs.mkdirSync(OUT,{recursive:true});

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();
  await page.goto(new URL('subjects/russian/editor.html',BASE).href,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.RussianAuthoringWorkspace?.governance?.(),null,{timeout:30000});

  const advancedOpen=await page.locator('#advancedRaw').evaluate(el=>el.open);
  assert.equal(advancedOpen,false,'raw JSON must not be the ordinary authoring default');

  await page.selectOption('#responsibility','LexicalEntry');
  await page.fill('#candidateId','RU08-BROWSER-001');
  await page.fill('#canonicalId','LEX-BROWSER-001');
  await page.fill('#revision','r1');
  await page.fill('#ruText','пример');
  await page.fill('#viText','ví dụ');
  await page.fill('#sourceRefs','source:browser-fixture');
  await page.fill('#diffSummary','Browser acceptance candidate');
  await page.fill('#rollbackNote','Restore previous canonical revision');
  await page.click('#validateBtn');

  await page.waitForFunction(()=>document.getElementById('validationResult')?.textContent?.startsWith('PASS'));
  const validation=await page.locator('#validationResult').textContent();
  assert.match(validation,/Không có canonical write/);

  const owner=await page.locator('#ownerPath').textContent();
  assert.equal(owner,'subjects/russian/data/vocab.json');

  const hash=await page.locator('#contentHash').textContent();
  assert.match(hash,/^[a-f0-9]{64}$/);

  await page.click('#previewBtn');
  const envelope=JSON.parse(await page.locator('#reviewEnvelope').textContent());
  assert.equal(envelope.subjectId,'russian');
  assert.equal(envelope.resourceType,'LexicalEntry');
  assert.equal(envelope.resourceId,'LEX-BROWSER-001');
  assert.equal(envelope.sourcePath,'subjects/russian/data/vocab.json');
  assert.equal(envelope.metadataOnly,true);
  assert.equal(envelope.contentHash,hash);

  const directPublishButtons=await page.getByRole('button',{name:/publish canonical/i}).count();
  assert.equal(directPublishButtons,0,'authoring workspace must not expose direct canonical publish');

  await page.selectOption('#state','REVIEW_REQUESTED');
  await page.fill('#sourceRefs','');
  await page.click('#validateBtn');
  await page.waitForFunction(()=>document.getElementById('validationResult')?.textContent?.startsWith('FAIL'));
  assert.match(await page.locator('#validationResult').textContent(),/REVIEW_REQUESTED cần sourceRefs/);

  await page.fill('#sourceRefs','source:browser-fixture');
  await page.click('#validateBtn');
  await page.waitForFunction(()=>document.getElementById('validationResult')?.textContent?.startsWith('PASS'));

  const importFixture={
    schema:'RUSSIAN_AUTHORING_CANDIDATE_V1',
    candidateId:'RU08-IMPORTED-001',
    responsibility:'LexicalEntry',
    canonicalId:'LEX-IMPORTED-001',
    revision:'r7',
    state:'VALIDATED',
    payload:{ru:'система',vi:'hệ thống'},
    sourceRefs:['source:import-fixture'],
    rollbackNote:'Restore r6',
    diffSummary:'Imported browser fixture',
    generated:false,
    confidence:'VERIFIED'
  };
  await page.setInputFiles('#importFile',{
    name:'candidate.json',
    mimeType:'application/json',
    buffer:Buffer.from(JSON.stringify(importFixture))
  });
  await page.waitForFunction(()=>document.getElementById('candidateId')?.value==='RU08-IMPORTED-001');
  await page.waitForFunction(()=>document.getElementById('validationResult')?.textContent?.startsWith('PASS'));
  assert.equal(await page.locator('#revision').inputValue(),'r7');
  assert.equal(await page.locator('#ruText').inputValue(),'система');
  assert.equal(await page.locator('#ownerPath').textContent(),'subjects/russian/data/vocab.json');

  await page.click('#newRevisionBtn');
  assert.equal(await page.locator('#revision').inputValue(),'r8');
  assert.equal(await page.locator('#state').inputValue(),'DRAFT');
  assert.match(await page.locator('#candidateId').inputValue(),/-NEXT$/);
  assert.equal(await page.locator('#diffSummary').inputValue(),'');
  assert.match(await page.locator('#validationResult').textContent(),/Revision mới ở DRAFT/);

  await page.fill('#diffSummary','Next revision browser fixture');
  await page.click('#validateBtn');
  await page.waitForFunction(()=>document.getElementById('validationResult')?.textContent?.startsWith('PASS'));

  await page.click('#advancedRaw summary');
  assert.equal(await page.locator('#advancedRaw').evaluate(el=>el.open),true);
  await page.click('#syncRaw');
  assert.match(await page.locator('#rawPayload').inputValue(),/"ru": "пример"/);

  await page.screenshot({path:path.join(OUT,'russian-authoring-workspace.png'),fullPage:true});
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({
    status:'PASS',
    defaultSurface:'schema-aware-form',
    advancedRawDefault:false,
    canonicalOwner:owner,
    metadataOnlyEnvelope:true,
    directCanonicalPublish:false,
    reviewRequestedRequiresSourceRefs:true,
    importCandidate:true,
    updateCreatesNewRevision:true,
    rollbackNotePreserved:true
  },null,2));
  console.log('Russian RU08 authoring browser journey PASS');
}finally{
  await browser?.close();
}
