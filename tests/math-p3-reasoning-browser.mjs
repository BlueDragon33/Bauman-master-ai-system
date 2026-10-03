import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/math-p3-reasoning';
const LESSON='MATH-PREP-C08-logic_tap_hop_ham_so_va_-E18-MP09-T02-sets-functions';
const PROBLEM='math03:domain:rational-cancel-01';
const EVIDENCE_KEY='bauman_math_reasoning_evidence_v1';
fs.mkdirSync(OUT,{recursive:true});

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await context.newPage();
  const errors=[];
  const failed=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  page.on('requestfailed',r=>failed.push(`${r.method()} ${r.url()} ${r.failure()?.errorText||''}`));
  page.on('response',r=>{if(r.status()>=400)failed.push(`${r.status()} ${r.url()}`)});

  await page.addInitScript(key=>localStorage.removeItem(key),EVIDENCE_KEY);
  const url=`${BASE}subjects/math/index.html?host=main&hostOrigin=${encodeURIComponent(new URL(BASE).origin)}&subjectId=math&taskId=math03-e2e&stage=prepare`;
  await page.goto(url,{waitUntil:'load',timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_MATH_NAVIGATION&&window.BAUMAN_MATH_E186_LESSON_FIRST&&window.BAUMAN_MATH_REASONING_EVALUATOR&&window.BAUMAN_MATH_REASONING_EVIDENCE&&window.BAUMAN_MATH_ACTIVITY_STUDIO,null,{timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_MATH_E129_CONTENT_SOURCE_READY||window.BAUMAN_MATH_THEORY_E129?.sourceStatus?.().content>=3,null,{timeout:30000});

  await page.evaluate(()=>window.BAUMAN_MATH_E186_LESSON_FIRST.open('lesson'));
  const pick=page.locator(`[data-e186-pick="lesson"][data-e186-id="${LESSON}"]`);
  await pick.waitFor({state:'visible',timeout:15000});
  await pick.click();
  await page.waitForSelector(`[data-current-lesson="${LESSON}"]`,{timeout:15000});

  await page.evaluate(()=>window.BAUMAN_MATH_NAVIGATION.route('practice'));
  const card=page.locator(`[data-math03-problem-id="${PROBLEM}"]`);
  await card.waitFor({state:'visible',timeout:15000});
  assert.match(await card.locator('.role').textContent(),/MATH03 PILOT/);

  await card.locator('[data-math03-answer="expression"]').fill('x+2');
  await card.locator('[data-math03-check]').click();
  await page.waitForFunction(id=>window.BAUMAN_MATH_REASONING_EVIDENCE.attemptsForProblem(id).length===1,PROBLEM,{timeout:10000});
  assert.equal((await card.locator('[data-math03-feedback] b').textContent()).trim(),'CONDITIONAL');
  let ledger=await page.evaluate(id=>({
    attempts:window.BAUMAN_MATH_REASONING_EVIDENCE.attemptsForProblem(id),
    first:window.BAUMAN_MATH_REASONING_EVIDENCE.firstAttempt(id),
    self:window.BAUMAN_MATH_REASONING_EVIDENCE.selfCheck()
  }),PROBLEM);
  assert.equal(ledger.first.evaluation.errorCode,'DOMAIN_RESTRICTION_MISSING');
  assert.equal(ledger.first.masteryWrite,false);
  assert.equal(ledger.first.academicWrite,false);

  await card.locator('[data-math03-answer="excludedValues"]').fill('2');
  await card.locator('[data-math03-check]').click();
  await page.waitForFunction(id=>window.BAUMAN_MATH_REASONING_EVIDENCE.attemptsForProblem(id).length===2,PROBLEM,{timeout:10000});
  assert.equal((await card.locator('[data-math03-feedback] b').textContent()).trim(),'ACCEPTED');

  ledger=await page.evaluate(id=>({
    attempts:window.BAUMAN_MATH_REASONING_EVIDENCE.attemptsForProblem(id),
    first:window.BAUMAN_MATH_REASONING_EVIDENCE.firstAttempt(id),
    summary:window.BAUMAN_MATH_REASONING_EVIDENCE.summaryForLesson(window.BAUMAN_MATH_REASONING_EVIDENCE.firstAttempt(id).lessonId)
  }),PROBLEM);
  assert.equal(ledger.attempts.length,2);
  assert.equal(ledger.first.evaluation.status,'CONDITIONAL','First attempt was mutated by retry');
  assert.equal(ledger.summary.accepted,1);
  assert.equal(ledger.summary.conditional,1);
  assert.equal(ledger.summary.masteryWrite,false);

  await card.locator('[data-math03-check]').click();
  await page.waitForTimeout(250);
  assert.equal(await page.evaluate(id=>window.BAUMAN_MATH_REASONING_EVIDENCE.attemptsForProblem(id).length,PROBLEM),2,'Double submit duplicated official attempt evidence');

  const evidencePanel=page.locator('#mathActivityMastery');
  await evidencePanel.waitFor({state:'visible',timeout:5000});
  assert.match(await evidencePanel.textContent(),/self-report ≠ mastery/);
  assert.match(await evidencePanel.textContent(),/Performance đạt/);

  await page.reload({waitUntil:'load',timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_MATH_REASONING_EVIDENCE,null,{timeout:30000});
  const afterReload=await page.evaluate(id=>({
    count:window.BAUMAN_MATH_REASONING_EVIDENCE.attemptsForProblem(id).length,
    first:window.BAUMAN_MATH_REASONING_EVIDENCE.firstAttempt(id)
  }),PROBLEM);
  assert.equal(afterReload.count,2,'Reload lost immutable reasoning evidence');
  assert.equal(afterReload.first.evaluation.status,'CONDITIONAL');

  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(150);
  const overflow=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(overflow.scroll<=overflow.client+2,`MATH03 mobile overflow: ${overflow.scroll}/${overflow.client}`);

  assert.deepEqual(errors,[],'MATH03 browser emitted console/page errors');
  assert.deepEqual(failed,[],'MATH03 browser emitted failed/HTTP requests');
  await page.screenshot({path:path.join(OUT,'math03-reasoning-mobile.png'),fullPage:true});
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({status:'PASS',lessonId:LESSON,problemId:PROBLEM,attempts:2,firstAttempt:'CONDITIONAL',recheck:'ACCEPTED',idempotent:true,masteryWrite:false,overflow},null,2));
  console.log('MATH03_REASONING_BROWSER_PASS');
}finally{
  await browser?.close();
}
