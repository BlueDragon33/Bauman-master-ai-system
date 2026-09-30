import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-p4-assessment-mastery';
fs.mkdirSync(OUT,{recursive:true});
const PAGE_URL=new globalThis.URL('subjects/russian/index.html',BASE).href;
let browser;

async function open(context){
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  await page.goto(PAGE_URL,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('body.ru-future-ui',{timeout:15000});
  await page.waitForFunction(()=>!!window.RussianAssessmentMastery,{timeout:15000});
  await page.waitForTimeout(400);
  assert.deepEqual(errors,[],'Russian page errors: '+errors.join('\n'));
  return page;
}

try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});

  // 1) Canonical immutable/idempotent attempt and evidence behavior.
  {
    const context=await browser.newContext({viewport:{width:1280,height:900}});
    const page=await open(context);
    const result=await page.evaluate(()=>{
      localStorage.removeItem('bauman_russian_assessment_mastery_v1');
      localStorage.removeItem('bauman_russian_assessment_mastery_v1_recovery_meta');
      window.RussianAssessmentMastery.refresh();

      const api=window.RussianAssessmentMastery;
      const assessmentId='exam:vn:standard:p4-browser';
      const firstId='ATT-P4-BROWSER-FIRST';
      const retryId='ATT-P4-BROWSER-RETRY';

      const first=api.recordAssessmentAttempt({
        attemptId:firstId,assessmentId,contentRevision:'p4-browser-v1',mode:'exam',stage:'vn',paperType:'standard',
        responses:[{itemId:'Q1',response:1,evaluation:{correct:true},skill:'phonetics',lessonId:'R01'}],
        evaluation:{score:80,passed:true},feedbackShown:false
      });
      const duplicate=api.recordAssessmentAttempt({
        attemptId:firstId,assessmentId,contentRevision:'p4-browser-v2',mode:'exam',stage:'vn',
        responses:[{itemId:'Q1',response:999,evaluation:{correct:false}}],
        evaluation:{score:0,passed:false},feedbackShown:true
      });
      const retry=api.recordAssessmentAttempt({
        attemptId:retryId,assessmentId,contentRevision:'p4-browser-v1',mode:'exam',stage:'vn',
        responses:[{itemId:'Q1',response:2,evaluation:{correct:false},skill:'phonetics',lessonId:'R01'}],
        evaluation:{score:40,passed:false},feedbackShown:false
      });

      const nonAuth=api.recordEvidence({
        evidenceId:'EVID-P4-SIGNAL',competencyId:'COMP-PHON-P4',skill:'phonetics',
        sourceAttemptId:firstId,evidenceType:'asr-signal',result:{value:0.92},authoritative:false
      });
      const afterSignal=api.exportState();
      const auth=api.recordEvidence({
        evidenceId:'EVID-P4-AUTH',competencyId:'COMP-PHON-P4',skill:'phonetics',
        sourceAttemptId:firstId,evidenceType:'validated-retrieval',result:{passed:true},authoritative:true
      });

      const gate1=api.recordStageGate({
        gateId:'GATE-FOUNDATION-P4',transactionId:'GATE-TX-P4-1',passed:true,
        criticalCompetencies:['COMP-PHON-P4'],evidenceAttemptIds:[firstId]
      });
      const gate2=api.recordStageGate({
        gateId:'GATE-FOUNDATION-P4',transactionId:'GATE-TX-P4-1',passed:false,
        criticalCompetencies:[],evidenceAttemptIds:[]
      });

      const beforeRender=localStorage.getItem('bauman_russian_assessment_mastery_v1');
      window.RUSSIAN_FUTURE_UI?.upgrade?.();
      window.RUSSIAN_FUTURE_UI?.upgrade?.();
      const afterRender=localStorage.getItem('bauman_russian_assessment_mastery_v1');

      return {
        first,duplicate,retry,nonAuth,auth,gate1,gate2,
        afterSignalMastery:afterSignal.mastery['COMP-PHON-P4']||null,
        final:api.exportState(),
        cycles:[7,14,21,28].map(d=>[d,api.cyclePurpose(d)]),
        renderPure:beforeRender===afterRender
      };
    });

    assert.equal(result.first.created,true);
    assert.equal(result.first.attempt.firstAttempt,true);
    assert.equal(result.duplicate.created,false,'Duplicate attempt ID must be idempotent');
    assert.equal(result.duplicate.attempt.responses[0].response,1,'Duplicate submit overwrote immutable first response');
    assert.equal(result.retry.created,true);
    assert.equal(result.retry.attempt.firstAttempt,false,'Retry must not become first attempt');
    assert.equal(result.final.attempts['ATT-P4-BROWSER-FIRST'].responses[0].response,1);
    assert.equal(result.final.attempts['ATT-P4-BROWSER-RETRY'].responses[0].response,2);
    assert.equal(result.afterSignalMastery,null,'Non-authoritative signal wrote mastery');
    assert.equal(result.final.mastery['COMP-PHON-P4'].lastEvidenceId,'EVID-P4-AUTH');
    assert.equal(result.gate1.created,true);
    assert.equal(result.gate2.created,false,'Duplicate stage-gate transaction was not idempotent');
    assert.equal(result.final.stageGates['GATE-FOUNDATION-P4'].history.length,1);
    assert.equal(result.renderPure,true,'Presentation rerender wrote canonical assessment/mastery state');
    assert.deepEqual(result.cycles,[
      [7,{role:'early-retention-repair'}],
      [14,{role:'mid-retention'}],
      [21,{role:'transfer-weakness-check'}],
      [28,{role:'longer-retention-stage-consolidation'}]
    ]);
    await page.screenshot({path:path.join(OUT,'p4-clean-state.png'),fullPage:true});
    fs.writeFileSync(path.join(OUT,'p4-clean-result.json'),JSON.stringify(result,null,2));
    await context.close();
  }

  // 2) Malformed canonical assessment state must be preserved and fail closed.
  {
    const malformed='}{P4-MALFORMED-SENTINEL';
    const context=await browser.newContext({viewport:{width:1024,height:768}});
    await context.addInitScript(value=>{
      localStorage.setItem('bauman_russian_assessment_mastery_v1',value);
      localStorage.removeItem('bauman_russian_assessment_mastery_v1_recovery_meta');
    },malformed);
    const page=await open(context);
    const state=await page.evaluate(()=>({
      raw:localStorage.getItem('bauman_russian_assessment_mastery_v1'),
      meta:localStorage.getItem('bauman_russian_assessment_mastery_v1_recovery_meta'),
      status:window.RussianAssessmentMastery.status()
    }));
    assert.equal(state.raw,malformed,'Malformed canonical assessment state was overwritten/deleted');
    assert.equal(state.status.recoveryBlock?.reason,'malformed-json');
    assert.ok(state.meta?.includes('malformed-json'));
    await context.close();
  }

  // 3) Oversize legacy core state must remain intact and normal writes must be blocked.
  {
    const coreKey='bauman_russian_survival_master_v11_clean_skeleton';
    const payload=JSON.stringify({sentinel:'P4-OVERSIZE',padding:'x'.repeat(1610000)});
    const context=await browser.newContext({viewport:{width:1024,height:768}});
    await context.addInitScript(({key,value})=>{
      localStorage.setItem(key,value);
      localStorage.removeItem(key+'_recovery_meta');
    },{key:coreKey,value:payload});
    const page=await open(context);
    const state=await page.evaluate(key=>({
      rawLength:(localStorage.getItem(key)||'').length,
      prefix:(localStorage.getItem(key)||'').slice(0,80),
      recovery:window.RussianCoreStateRecovery?.status?.(key),
      recoveryMeta:localStorage.getItem(key+'_recovery_meta')
    }),coreKey);
    assert.equal(state.rawLength,payload.length,'Oversize core state length changed');
    assert.ok(state.prefix.includes('P4-OVERSIZE'),'Oversize core state sentinel was lost');
    assert.equal(state.recovery?.reason,'oversize');
    assert.ok(state.recoveryMeta?.includes('oversize'));
    await context.close();
  }

  console.log('Russian P4 assessment/mastery browser acceptance: PASS');
} finally {
  await browser?.close();
}
