// RE64 browser QA: Chromium fake microphone only; no human voice or RU03 claims.
// Run explicitly in a local QA environment; never via GitHub-hosted Actions.
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const pageUrl=pathToFileURL(fileURLToPath(new URL('../review/re64-r02-speaker-capture.offline.html',import.meta.url))).href;
const root=mkdtempSync(path.join(tmpdir(),'russian-re64-fake-mic-'));
let browser;
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const status={schema:'RUSSIAN_RE64_BROWSER_FAKE_MIC_TEST_V1',status:'RUNNING',
  humanAudio:false,independentRightsVerified:false,RU03:'BLOCKED',artifactsExported:0};
try{
 browser=await chromium.launch({headless:true,args:[
  '--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream'
 ]});
 const context=await browser.newContext({acceptDownloads:true,permissions:['microphone']});
 const page=await context.newPage();
 let externalRequests=0;
 page.on('request',r=>{if(/^https?:\/\//.test(r.url()))externalRequests++});
 await page.goto(pageUrl,{waitUntil:'domcontentloaded'});
 assert.equal(await page.locator('article[data-source-item]').count(),2);
 assert.equal(await page.locator('#evidence').isDisabled(),true);
 for(const key of ['R02_NAME','R02_INTRO']){
   const card=page.locator('article[data-key="'+key+'"]');
   await card.locator('[data-action="start"]').click();
   await page.waitForTimeout(key==='R02_NAME'?900:1800);
   await card.locator('[data-action="stop"]').click();
   await page.waitForFunction(k=>{
     const panel=document.querySelector('article[data-key="'+k+'"]');
     return panel?.querySelector('[data-action="save"]')?.disabled===false;
   },key,{timeout:12000});
   assert.match(await card.locator('[data-status]').innerText(),/SHA-256 вычислен/);
 }
 await page.locator('#credit').fill('FAKE MIC QA ONLY — NO SPEAKER');
 await page.locator('#original').check();
 await page.locator('#rights').check();
 await page.locator('#review').check();
 assert.equal(await page.locator('#evidence').isEnabled(),true);
 const downloads=[];
 for(const key of ['R02_NAME','R02_INTRO']){
   const [download]=await Promise.all([
     page.waitForEvent('download'),
     page.locator('article[data-key="'+key+'"] [data-action="save"]').click()
   ]);
   const file=path.join(root,download.suggestedFilename());
   await download.saveAs(file);
   downloads.push({filename:download.suggestedFilename(),bytes:readFileSync(file)});
 }
 const [decl]=await Promise.all([page.waitForEvent('download'),page.locator('#evidence').click()]);
 const declared=path.join(root,decl.suggestedFilename());
 await decl.saveAs(declared);
 const manifest=JSON.parse(readFileSync(declared,'utf8'));
 assert.equal(manifest.clips.length,2);
 assert.equal(manifest.consent.independentRightsVerified,false);
 assert.equal(manifest.humanRu03Approved,false);
 assert.equal(manifest.canonicalPublicationReady,false);
 assert.equal(manifest.autoUploaded,false);
 for(let i=0;i<2;i++){
   const entry=manifest.clips[i],download=downloads[i];
   assert.equal(entry.filename,download.filename);
   assert.equal(entry.bytes,download.bytes.length);
   assert.equal(entry.sha256,sha(download.bytes));
   assert.ok(entry.mimeType.startsWith('audio/'));
 }
 assert.equal(externalRequests,0,'No network requests allowed in speaker capture');
 status.status='PASS_FAKE_DEVICE_ONLY';
 status.artifactsExported=3;
 status.shaMatchesRealDownloadedBytes=true;
 status.noNetwork=true;
 console.log('RUSSIAN_RE64_FAKE_MIC_BROWSER_PASS',JSON.stringify(status));
 await context.close();
}catch(error){
 status.status='FAIL_OR_BROWSER_MICROPHONE_BLOCKED';
 status.failure=String(error.stack||error);
 console.error('RUSSIAN_RE64_FAKE_MIC_BROWSER_FAIL',JSON.stringify(status));
 process.exitCode=1;
}finally{
 await browser?.close();
 rmSync(root,{recursive:true,force:true});
}
