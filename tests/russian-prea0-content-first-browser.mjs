// CONTENT-FIRST candidate · first real Chromium learner journey, no RU03/score claim.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const base=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const out=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-prea0';
fs.mkdirSync(out,{recursive:true});
const receipt={schema:'RUSSIAN_PREA0_CONTENT_FIRST_BROWSER_V1',status:'RUNNING',steps:[],scope:'candidate practice; not audio/linguistic approval'};
let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const ctx=await browser.newContext({viewport:{width:390,height:844}});
  const page=await ctx.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e.message||e)));
  await page.goto(new URL('subjects/russian/index.html',base).href,{waitUntil:'domcontentloaded',timeout:30000});
  // On 390px the sidebar is intentionally off-canvas. Use the actual visible
  // Overview shortcut already exercised by the stable Russian UI browser gate.
  const lessonShortcut=page.locator('.rf-module-lesson');
  await lessonShortcut.waitFor({state:'visible',timeout:30000});
  await lessonShortcut.click();
  await page.waitForFunction(()=>window.RussianPreA0Candidate?.status?.().loaded===true,null,{timeout:30000});
  const details=page.locator('#ruPreA0 details');
  await details.waitFor({state:'visible'});
  const baseline=await page.evaluate(()=>JSON.stringify(window.RussianLearningFlow?.get?.()?.lessons?.R01?.steps||{}));
  const initial=await page.evaluate(()=>window.RussianPreA0Candidate.status());
  assert.equal(initial.source,'LW_R02 / RHW_AZ_01');
  assert.equal(initial.audioAuthority,'UNVERIFIED');
  assert.equal(initial.masteryWrites,false);
  assert.match(await details.innerText(),/Nghe/);
  receipt.steps.push({name:'0 · source and audio authority',result:'PASS'});

  // Audio device presence is environmental: absence must be visible, not faked.
  const voiceState=await page.evaluate(()=>({voice:!!speechSynthesis?.getVoices?.().some(v=>/^ru[-_]/i.test(v.lang||''))}));
  if(!voiceState.voice)assert.match(await details.innerText(),/BLOCKED_AUDIO/);
  await page.locator('#ruPreA0 [data-prea0="reveal"]').click();
  assert.match(await details.innerText(),/Здравствуйте/);
  receipt.steps.push({name:'1 · listen first + optional script',result:'PASS',ttsRuPresent:voiceState.voice});

  await page.locator('#ruPreA0 [data-prea0="next"]').click();
  assert.match(await details.innerText(),/ghi âm/i);
  assert.ok(await page.locator('#ruPreA0 [data-prea0="record"]').isVisible());
  assert.ok(await page.locator('#ruPreA0 [data-prea0="stop"]').isVisible());
  receipt.steps.push({name:'2 · uses existing local recording controls (mic not auto-graded)',result:'PASS'});

  await page.locator('#ruPreA0 [data-prea0="next"]').click();
  await page.locator('#ruPreA0 [data-prea0="visual"][data-answer="hello"]').click();
  assert.match(await details.innerText(),/Đúng tình huống/);
  receipt.steps.push({name:'3 · pictogram-to-source identification',result:'PASS'});

  await page.locator('#ruPreA0 [data-prea0="next"]').click();
  await page.locator('#ruPreA0 [data-prea0="letter"][data-answer="А"]').click();
  assert.match(await details.innerText(),/Đúng chữ А/);
  assert.ok(await page.locator('#ruPreA0 [data-prea0="write"]').isVisible());
  receipt.steps.push({name:'4 · canonical print letter and writing handoff',result:'PASS'});

  await page.locator('#ruPreA0 [data-prea0="next"]').click();
  await page.locator('#ruPreA0Reply').fill('Здравствуйте.');
  await page.locator('#ruPreA0 [data-prea0="check"]').click();
  assert.match(await details.innerText(),/Khớp câu mẫu/);
  receipt.steps.push({name:'5 · typed scene response',result:'PASS'});

  await page.locator('#ruPreA0 [data-prea0="next"]').click();
  assert.match(await details.innerText(),/HUMAN_RU03_REQUIRED/);
  assert.equal((await page.evaluate(()=>window.RussianPreA0Candidate.status())).step,5);
  const after=await page.evaluate(()=>JSON.stringify(window.RussianLearningFlow?.get?.()?.lessons?.R01?.steps||{}));
  assert.equal(after,baseline,'Candidate Pre-A0 must not increment official learning-flow evidence');
  receipt.steps.push({name:'6 · honest session summary and unchanged mastery',result:'PASS'});
  assert.deepEqual(errors,[],'Browser JavaScript errors are forbidden');
  await page.screenshot({path:path.join(out,'prea0-mobile.png'),fullPage:true});
  receipt.status='PASS';receipt.viewport='390x844';receipt.micCapture='NOT_TESTED';receipt.RU03='BLOCKED';
  console.log('RUSSIAN_PREA0_CONTENT_FIRST_BROWSER_PASS');
}catch(e){receipt.status='FAIL';receipt.failure=String(e.stack||e);process.exitCode=1;console.error('RUSSIAN_PREA0_CONTENT_FIRST_BROWSER_FAIL',e)}
finally{fs.writeFileSync(path.join(out,'prea0-evidence.json'),JSON.stringify(receipt,null,2));await browser?.close()}
