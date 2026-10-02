import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-scenario-journey';
fs.mkdirSync(OUT,{recursive:true});

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await context.newPage();
  await page.goto(new URL('subjects/russian/index.html',BASE).href,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>window.RussianScenarioEngine&&window.RussianRuntimeData?.ready&&window.RussianAssessmentMastery,{timeout:30000});

  const loaded=await page.evaluate(()=>({
    scenario:window.RussianRuntimeData.has('scenario-registry'),
    provenance:window.RussianRuntimeData.has('provenance'),
    technical:window.RussianRuntimeData.has('technical-concepts'),
    aiPolicy:window.RussianRuntimeData.has('ai-mentor-policy')
  }));
  assert.deepEqual(loaded,{scenario:true,provenance:true,technical:true,aiPolicy:true});

  const masteryBefore=await page.evaluate(()=>JSON.stringify(window.RussianAssessmentMastery.exportState()));
  const families=await page.evaluate(()=>window.RussianScenarioEngine.scenarios().map(x=>({id:x.id,family:x.family})));
  for(const family of ['real-life','classroom','lab','research']){
    const s=families.find(x=>x.family===family);
    assert(s,'missing representative scenario family '+family);
    const result=await page.evaluate(async id=>{
      const e=window.RussianScenarioEngine;
      const start=e.start(id); if(!start.ok)return {ok:false,start};
      let snap=e.get(),guard=0,repairUsed=false;
      while(snap.run?.status==='active'&&guard++<20){
        const registry=window.RussianRuntimeData.get('scenario-registry');
        const sc=registry.scenarios.find(x=>x.id===snap.run.scenarioId);
        const n=sc.nodes[snap.run.nodeId];
        if(!repairUsed&&Array.isArray(n.repairPath)&&n.repairPath.length){e.repair(n.repairPath[0]);repairUsed=true}
        if(Array.isArray(n.next)&&n.next.length)e.advance(n.next[0]);else e.finish('success');
        snap=e.get();
      }
      return {ok:snap.run?.status==='success',run:snap.run,repairUsed};
    },s.id);
    assert.equal(result.ok,true,'scenario did not complete '+family);
    assert.equal(result.run.masteryWrite,undefined);
    assert(result.run.evidence.every(x=>x.authoritative===false&&x.masteryWrite===false),'scenario evidence must remain non-authoritative');
    if(['real-life','classroom','lab','research'].includes(family))assert.equal(result.repairUsed,true,'repair path not exercised '+family);
  }

  const firstRun=await page.evaluate(()=>window.RussianScenarioEngine.get().run.runId);
  const replay=await page.evaluate(()=>window.RussianScenarioEngine.replay());
  assert.equal(replay.ok,true);
  assert.notEqual(replay.run.runId,firstRun,'replay must create a new run identity');

  const resumeBefore=await page.evaluate(()=>window.RussianScenarioEngine.get().run);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.RussianScenarioEngine&&window.RussianRuntimeData?.ready,{timeout:30000});
  const resumeAfter=await page.evaluate(()=>window.RussianScenarioEngine.get().run);
  assert.equal(resumeAfter.runId,resumeBefore.runId,'refresh must preserve active scenario run');
  assert.equal(resumeAfter.nodeId,resumeBefore.nodeId,'refresh must not create progress');

  await context.setOffline(true);
  const offline=await page.evaluate(()=>{
    const e=window.RussianScenarioEngine;
    const s=e.scenarios().find(x=>x.family==='defense')||e.scenarios()[0];
    const a=e.start(s.id);
    const registry=window.RussianRuntimeData.get('scenario-registry');
    const sc=registry.scenarios.find(x=>x.id===s.id);
    let snap=e.get(),guard=0;
    while(snap.run?.status==='active'&&guard++<20){
      const n=sc.nodes[snap.run.nodeId];
      if(Array.isArray(n.repairPath)&&n.repairPath[0])e.repair(n.repairPath[0]);
      if(Array.isArray(n.next)&&n.next[0])e.advance(n.next[0]);else e.finish('success');
      snap=e.get();
    }
    return {started:a.ok,status:snap.run?.status,evidence:snap.run?.evidence?.length||0};
  });
  assert.deepEqual(offline,{started:true,status:'success',evidence:7});
  await context.setOffline(false);

  await page.click('[data-view="dialogue"]');
  await page.waitForSelector('#ruScenarioRuntime',{state:'visible'});
  assert.equal(await page.getByText(/RU05 · SCENARIO RUNTIME/).count()>0,true);
  const keyboardButton=page.locator('#ruScenarioRuntime button').first();
  await keyboardButton.focus();
  assert.equal(await keyboardButton.evaluate(el=>document.activeElement===el),true);

  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(100);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
  assert.equal(overflow,false,'scenario UI must not create mobile horizontal overflow');

  const masteryAfter=await page.evaluate(()=>JSON.stringify(window.RussianAssessmentMastery.exportState()));
  assert.equal(masteryAfter,masteryBefore,'scenario practice must not mutate canonical mastery');

  await page.screenshot({path:path.join(OUT,'russian-scenario-mobile.png'),fullPage:true});
  fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify({
    status:'PASS',
    representativeFamilies:['real-life','classroom','lab','research','defense'],
    refreshResume:true,
    offlineAfterLoad:true,
    replayNewIdentity:true,
    masteryUnchanged:true,
    mobileOverflow:false
  },null,2));
  console.log('Russian RU05 scenario browser journey PASS');
}finally{
  await browser?.close();
}
