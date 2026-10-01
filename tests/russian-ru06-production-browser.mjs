import assert from 'node:assert/strict';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
let browser;
try{
  browser=await chromium.launch({headless:true});
  for(const viewport of [{width:1366,height:900},{width:390,height:844}]){
    const context=await browser.newContext({viewport}),page=await context.newPage();
    await page.addInitScript(()=>{window.__RU06_WRITES=[];const native=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){window.__RU06_WRITES.push(String(k));return native.call(this,k,v)}});
    await page.goto(new URL('subjects/russian/index.html',BASE).href,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.RussianAcademicProduction?.snapshot?.().ready===true);
    const writing=page.locator('#nav button[data-view="writing"]').first();await writing.waitFor({state:'visible'});await writing.click();
    await page.waitForSelector('[data-ru06-production-runtime]');
    const snap=await page.evaluate(()=>window.RussianAcademicProduction.snapshot());
    assert(snap.counts.technical>=60,'technical concepts not loaded');
    assert(snap.counts.functions>=10,'academic functions not loaded');
    assert(snap.counts.reading>=10,'reading tasks not loaded');
    assert(snap.counts.tasks>=8,'performance tasks not loaded');
    assert.equal(snap.policy.writesMastery,false);
    await page.selectOption('#ru06Target','R16');
    assert.match(await page.locator('[data-ru06-production-runtime]').innerText(),/figure|table|результ|данн|R16/i,'R16 technical/performance content missing');
    await page.fill('[data-ru06-draft]','Полученные результаты показывают устойчивую тенденцию.');
    await page.click('[data-ru06-save]');
    const saved=await page.evaluate(()=>window.RussianAcademicProduction.snapshot().state);
    assert.match(saved.drafts.R16,/Полученные результаты/);
    await page.selectOption('#ru06Target','R20');
    assert.match(await page.locator('[data-ru06-production-runtime]').innerText(),/источник|Согласно|огранич|R20/i,'R20 source/research functions missing');
    await context.setOffline(true);
    await page.evaluate(()=>window.RussianAcademicProduction.load());
    const offline=await page.evaluate(()=>window.RussianAcademicProduction.snapshot());
    assert(['cache','partial-unavailable'].includes(offline.loadSource),'RU06 did not enter offline cache/fallback path');
    assert(offline.counts.technical>=60,'cached technical concepts unavailable offline');
    await context.setOffline(false);
    const writes=await page.evaluate(()=>window.__RU06_WRITES);
    assert.deepEqual(writes.filter(k=>/mastery|assessment.*attempt|vocab.*srs|adaptive.*planner/i.test(k)),[],'RU06 practice wrote authoritative state');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert(overflow<=4,'RU06 horizontal overflow '+overflow);
    await context.close();
  }
}finally{await browser?.close()}
console.log('RUSSIAN_RU06_PRODUCTION_BROWSER=PASS');