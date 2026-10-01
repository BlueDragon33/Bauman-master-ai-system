import assert from 'node:assert/strict';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
let browser;
try{
  browser=await chromium.launch({headless:true});
  for(const viewport of [{width:1366,height:900},{width:390,height:844}]){
    const context=await browser.newContext({viewport});
    const page=await context.newPage();const errors=[];
    page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
    await page.addInitScript(()=>{
      window.__SCENARIO_WRITES=[];
      const native=Storage.prototype.setItem;
      Storage.prototype.setItem=function(k,v){window.__SCENARIO_WRITES.push(String(k));return native.call(this,k,v)};
    });
    await page.goto(new URL('subjects/russian/index.html',BASE).href,{waitUntil:'domcontentloaded'});
    await page.waitForSelector('body.ru-future-ui');
    const dialogue=page.locator('[data-view="dialogue"],button[data-view="dialogue"]').first();
    await dialogue.click();
    await page.waitForSelector('[data-ru-scenario-runtime]');
    const api=await page.evaluate(()=>window.RussianScenarioRuntime?.snapshot?.());
    assert.equal(api?.registry?.phase,'RU05');assert.equal(api.policy.writesMastery,false);
    const families=api.registry.scenarios.map(x=>x.family);
    for(const f of ['real-life','classroom','lab','seminar','research','defense'])assert(families.includes(f),'missing family '+f);
    for(const id of ['P11-LIFE-ROOMMATE','P11-LAB-TASK','P11-SEMINAR-FIRST','P11-RESEARCH-NIR','P11-DEFENSE-COMMISSION']){
      assert.equal(await page.evaluate(id=>window.RussianScenarioRuntime.start(id),id),true,'cannot start '+id);
      const before=await page.evaluate(()=>window.RussianScenarioRuntime.snapshot().session);
      const s=api.registry.scenarios.find(x=>x.id===id),node=s.nodes[before.nodeId];assert(node.next?.length,'scenario has no next '+id);
      await page.evaluate(next=>window.RussianScenarioRuntime.advance(next),node.next[0]);
      const mid=await page.evaluate(()=>window.RussianScenarioRuntime.snapshot().session);
      const pressure=s.nodes[mid.nodeId];assert(pressure.unexpectedTurn,'missing unexpected turn '+id);assert(pressure.repairPath?.length,'missing repair '+id);
      await page.evaluate(action=>window.RussianScenarioRuntime.repair(action),pressure.repairPath[0]);
      assert.equal((await page.evaluate(()=>window.RussianScenarioRuntime.snapshot().session)).completion,'PRACTICE_COMPLETE','scenario incomplete '+id);
    }
    await page.evaluate(()=>window.RussianScenarioRuntime.start('P11-CLASS-PDF'));
    const saved=await page.evaluate(()=>window.RussianScenarioRuntime.snapshot().session);
    await page.reload({waitUntil:'domcontentloaded'});await page.waitForSelector('[data-ru-scenario-runtime]');
    const resumed=await page.evaluate(()=>window.RussianScenarioRuntime.snapshot().session);
    assert.equal(resumed.scenarioId,saved.scenarioId,'scenario session did not resume');
    await context.setOffline(true);
    await page.evaluate(()=>window.RussianScenarioRuntime.load());
    const offline=await page.evaluate(()=>window.RussianScenarioRuntime.snapshot());
    assert.equal(offline.loadSource,'cache','scenario registry did not fall back to cached data offline');
    await context.setOffline(false);
    const writes=await page.evaluate(()=>window.__SCENARIO_WRITES);
    assert.deepEqual(writes.filter(k=>/mastery|assessment.*attempt|vocab.*srs|adaptive.*planner/i.test(k)),[],'scenario wrote authoritative state');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert(overflow<=4,'horizontal overflow '+overflow);
    await page.locator('[data-ru-scenario-runtime]').focus();
    assert.equal(errors.length,0,errors.join('\n'));
    await context.close();
  }
}finally{await browser?.close()}
console.log('RUSSIAN_RU05_SCENARIO_BROWSER=PASS');