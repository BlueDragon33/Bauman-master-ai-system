import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');

const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-ru03-assessment-authority';
fs.mkdirSync(OUT,{recursive:true});
const PAGE_URL=new globalThis.URL('subjects/russian/index.html',BASE).href;
let browser;

try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  await page.goto(PAGE_URL,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.RussianAssessmentAuthority?.status?.().loaded===true,{timeout:15000});
  await page.waitForFunction(()=>!!window.RussianOfficialGateAudit,{timeout:15000});

  const authority=await page.evaluate(()=>{
    const api=window.RussianAssessmentAuthority;
    const current=api.evaluateOfficialAssessment({questions:[{id:'CURRENT-Q'}]});
    const verifiedProvenance={records:[{id:'assessment-bank',validationStatus:'VERIFIED',sourceRefs:['source:reviewed-bank'],reviewer:'linguist-reviewer',reviewedAt:'2026-10-01T00:00:00Z'}]};
    const verified=api.evaluateOfficialAssessment({questions:[{id:'VERIFIED-Q'}],provenance:verifiedProvenance});
    const itemOverride=api.evaluateOfficialAssessment({questions:[{id:'UNSAFE-Q',authorityStatus:'UNVERIFIED'}],provenance:verifiedProvenance});
    return {current,verified,itemOverride,status:api.status()};
  });
  assert.equal(authority.current.officialEligible,false,'current PARTIAL assessment bank must fail closed');
  assert.notEqual(authority.current.datasetStatus,'VERIFIED','current bank must not be silently promoted');
  assert.equal(authority.verified.officialEligible,true,'explicit reviewed VERIFIED fixture should be eligible');
  assert.equal(authority.itemOverride.officialEligible,false,'explicit UNVERIFIED item must override dataset authority');

  const gate=await page.evaluate(()=>{
    const audit=window.RussianOfficialGateAudit;
    const coreKey=window.SUBJECT_ADAPTER.storageKey;
    const stored=JSON.parse(localStorage.getItem(coreKey)||'{}');
    stored.stage='vn';stored.view='learning';stored.learnTab='exam';
    stored.stageGate={version:'RUSSIAN_STAGE_GATE_V2',currentStage:'vn',currentPart:1,totalParts:4,unlockedPart:1,completedTasks:{},completedReviews:{},completedExamPapers:{'vn::part1':[
      {type:'standard',passed:true,score10:10,at:1},
      {type:'standard',passed:true,authorityEligible:true,score10:10,at:2}
    ]}};
    localStorage.setItem(coreKey,JSON.stringify(stored));
    return true;
  });
  assert.equal(gate,true);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.RussianOfficialGateAudit,{timeout:15000});
  const counts=await page.evaluate(()=>({
    all:window.RussianOfficialGateAudit.records(1).length,
    authoritative:window.RussianOfficialGateAudit.authoritativeRecords(1).length,
    counted:window.RussianOfficialGateAudit.count('standard',1)
  }));
  assert.equal(counts.all,2,'historical record must be preserved');
  assert.equal(counts.authoritative,1,'legacy pass without authority must not count');
  assert.equal(counts.counted,1,'only explicit authority-eligible pass counts toward gate');

  await page.screenshot({path:OUT+'/authority-gate.png',fullPage:true});
  assert.deepEqual(errors,[],'Page errors: '+errors.join('\n'));
  console.log(JSON.stringify({ok:true,currentDatasetStatus:authority.current.datasetStatus,counts}));
  await context.close();
}finally{
  await browser?.close();
}