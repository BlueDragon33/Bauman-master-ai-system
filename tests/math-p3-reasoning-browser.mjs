import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/math-p3-reasoning';
const LESSON='MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140';
const PROBLEM='math03:proof:rank-bound-e16r-t01-e06';
const DOMAIN_PROBLEM='math03:domain:rational-cancel-01';
const EVIDENCE_KEY='bauman_math_reasoning_evidence_v1';
fs.mkdirSync(OUT,{recursive:true});

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const smokeSession=String(process.env.BAUMAN_E2E_DEVICE_SESSION||'').trim();
  if(smokeSession){
    const baseUrl=new URL(BASE);
    await context.addCookies([{name:'__Host-bauman_session',value:smokeSession,url:baseUrl.origin+'/',httpOnly:true,secure:baseUrl.protocol==='https:',sameSite:'Strict'}]);
  }
  const page=await context.newPage();
  const errors=[],failed=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  page.on('requestfailed',r=>failed.push(`${r.method()} ${r.url()} ${r.failure()?.errorText||''}`));
  page.on('response',r=>{if(r.status()>=400)failed.push(`${r.status()} ${r.url()}`)});

  const url=`${BASE}subjects/math/index.html?host=main&hostOrigin=${encodeURIComponent(new URL(BASE).origin)}&subjectId=math&taskId=math03-e2e&stage=prepare`;
  await page.goto(url,{waitUntil:'load',timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_MATH_NAVIGATION&&window.BAUMAN_MATH_E186_LESSON_FIRST&&window.BAUMAN_MATH_REASONING_EVALUATOR&&window.BAUMAN_MATH_REASONING_EVIDENCE&&window.BAUMAN_MATH_ACTIVITY_STUDIO,null,{timeout:30000});
  await page.evaluate(key=>localStorage.removeItem(key),EVIDENCE_KEY);
  await page.waitForFunction(()=>window.BAUMAN_MATH_E129_CONTENT_SOURCE_READY||window.BAUMAN_MATH_THEORY_E129?.sourceStatus?.().content>=3,null,{timeout:30000});

  // Use an actual E186-exposed canonical lesson. MATH03 must not invent a parallel route engine.
  await page.evaluate(()=>window.BAUMAN_MATH_E186_LESSON_FIRST.open('lesson'));
  const pick=page.locator(`[data-e186-pick="lesson"][data-e186-id="${LESSON}"]`);
  await pick.waitFor({state:'visible',timeout:15000});
  await pick.click();
  await page.waitForSelector(`[data-current-lesson="${LESSON}"]`,{timeout:15000});

  await page.evaluate(()=>window.BAUMAN_MATH_NAVIGATION.route('practice'));
  const card=page.locator(`[data-math03-problem-id="${PROBLEM}"]`);
  await card.waitFor({state:'visible',timeout:15000});
  assert.match(await card.locator('.role').textContent(),/MATH03 PILOT/);

  // Learner-authored proof has no validated review authority: fail honest, never auto-pass.
  await card.locator('[data-math03-answer="text"]').fill('rank(X) bị chặn bởi cả số hàng n và số cột p.');
  await card.locator('[data-math03-check]').click();
  await page.waitForFunction(id=>window.BAUMAN_MATH_REASONING_EVIDENCE.attemptsForProblem(id).length===1,PROBLEM,{timeout:10000});
  assert.equal((await card.locator('[data-math03-feedback] b').textContent()).trim(),'INDETERMINATE');

  let proofLedger=await page.evaluate(id=>({
    attempts:window.BAUMAN_MATH_REASONING_EVIDENCE.attemptsForProblem(id),
    first:window.BAUMAN_MATH_REASONING_EVIDENCE.firstAttempt(id)
  }),PROBLEM);
  assert.equal(proofLedger.first.evaluation.errorCode,'REQUIRES_VALIDATED_REVIEW');
  assert.equal(proofLedger.first.evidenceTier,'progress');
  assert.equal(proofLedger.first.masteryWrite,false);
  assert.equal(proofLedger.first.academicWrite,false);

  // A validated reviewer may produce performance evidence, but still cannot write mastery/academic truth.
  const reviewed=await page.evaluate(async ({problemId})=>{
    const pilot=await fetch('data/math_reasoning_pilot_v1.json',{cache:'no-store'}).then(r=>r.json());
    const p=pilot.problems.find(x=>x.problemId===problemId);
    const evaluation=window.BAUMAN_MATH_REASONING_EVALUATOR.evaluate(
      p,
      {criterionEvidence:{hypotheses:true,column_bound:true,row_bound:true,conclusion:true}},
      {providerAuthority:'validated_human'}
    );
    const detail={
      submissionId:'validated-proof-review-1',
      problemId:p.problemId,
      sourceExerciseId:p.sourceExerciseId,
      lessonId:p.canonicalLessonId,
      chapterId:p.canonicalChapterId,
      response:{criterionEvidence:{hypotheses:true,column_bound:true,row_bound:true,conclusion:true}},
      evaluation,
      mode:'checkpoint',
      hintLevel:0,
      problemRevision:pilot.contentRevision,
      at:Date.now()
    };
    const stored=await window.BAUMAN_MATH_REASONING_EVIDENCE.recordAttempt(detail);
    const duplicate=await window.BAUMAN_MATH_REASONING_EVIDENCE.recordAttempt({...detail,response:{criterionEvidence:{}}});
    return {evaluation,stored,duplicate};
  },{problemId:PROBLEM});
  assert.equal(reviewed.evaluation.status,'ACCEPTED');
  assert.equal(reviewed.evaluation.officialScore,null);
  assert.equal(reviewed.evaluation.masteryWrite,false);
  assert.equal(reviewed.duplicate.duplicate,true);
  assert.equal(reviewed.duplicate.attempt.attemptId,'validated-proof-review-1');

  proofLedger=await page.evaluate(id=>({
    attempts:window.BAUMAN_MATH_REASONING_EVIDENCE.attemptsForProblem(id),
    first:window.BAUMAN_MATH_REASONING_EVIDENCE.firstAttempt(id),
    summary:window.BAUMAN_MATH_REASONING_EVIDENCE.summaryForLesson(window.BAUMAN_MATH_REASONING_EVIDENCE.firstAttempt(id).lessonId)
  }),PROBLEM);
  assert.equal(proofLedger.attempts.length,2);
  assert.equal(proofLedger.first.evaluation.status,'INDETERMINATE','Validated review mutated the first attempt');
  assert.equal(proofLedger.summary.accepted,1);
  assert.equal(proofLedger.summary.indeterminate,1);
  assert.equal(proofLedger.summary.masteryWrite,false);

  // Representative domain misconception -> remediation -> independent recheck in the real browser runtime.
  const domain=await page.evaluate(async ({problemId})=>{
    const pilot=await fetch('data/math_reasoning_pilot_v1.json',{cache:'no-store'}).then(r=>r.json());
    const p=pilot.problems.find(x=>x.problemId===problemId),ev=window.BAUMAN_MATH_REASONING_EVALUATOR;
    const first=ev.evaluate(p,{expression:'x+2',excludedValues:[]});
    const recheck=ev.evaluate(p,{expression:'2+x',excludedValues:['2']});
    return {first,recheck};
  },{problemId:DOMAIN_PROBLEM});
  assert.equal(domain.first.status,'CONDITIONAL');
  assert.equal(domain.first.errorCode,'DOMAIN_RESTRICTION_MISSING');
  assert.equal(domain.first.remediationId,'DOMAIN_ERROR');
  assert.equal(domain.recheck.status,'ACCEPTED');
  assert.equal(domain.recheck.stepValidity,'VALID_EQUIVALENT_TRANSFORMATION');

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
  assert.equal(afterReload.first.evaluation.status,'INDETERMINATE');

  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(150);
  const overflow=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(overflow.scroll<=overflow.client+2,`MATH03 mobile overflow: ${overflow.scroll}/${overflow.client}`);

  assert.deepEqual(errors,[],'MATH03 browser emitted console/page errors');
  assert.deepEqual(failed,[],'MATH03 browser emitted failed/HTTP requests');
  await page.screenshot({path:path.join(OUT,'math03-reasoning-mobile.png'),fullPage:true});
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({
    status:'PASS',
    lessonId:LESSON,
    proofProblemId:PROBLEM,
    firstAttempt:'INDETERMINATE_REQUIRES_VALIDATED_REVIEW',
    validatedReview:'ACCEPTED_PERFORMANCE_EVIDENCE',
    domainMisconception:'CONDITIONAL_DOMAIN_RESTRICTION_MISSING',
    domainRecheck:'ACCEPTED',
    attempts:2,
    idempotent:true,
    masteryWrite:false,
    overflow
  },null,2));
  console.log('MATH03_REASONING_BROWSER_PASS');
}finally{
  await browser?.close();
}
