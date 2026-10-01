import assert from 'node:assert/strict';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
let browser;
try{
  browser=await chromium.launch({headless:true});
  for(const viewport of [{width:1280,height:900},{width:390,height:844}]){
    const context=await browser.newContext({viewport}),page=await context.newPage(),requests=[];
    page.on('request',r=>requests.push({url:r.url(),method:r.method()}));
    await page.goto(new URL('subjects/russian/editor.html',BASE).href,{waitUntil:'domcontentloaded'});
    await page.waitForSelector('[data-russian-authoring][data-ready="1"]');
    assert.equal(await page.locator('textarea[name="ru"]').isVisible(),true,'structured field missing');
    assert.equal(await page.locator('details [data-authoring-raw]').isVisible(),false,'raw JSON visible by default');
    await page.selectOption('select[name="entityType"]','LexicalEntry');
    await page.fill('input[name="canonicalId"]','vocab:audit-demo');await page.fill('input[name="revision"]','audit-r1');await page.fill('input[name="title"]','audit');
    await page.fill('textarea[name="ru"]','пример');await page.fill('textarea[name="vi"]','ví dụ');await page.fill('textarea[name="rollbackNote"]','restore prior revision');await page.fill('textarea[name="diffSummary"]','re-audit candidate');
    await page.click('[data-authoring-validate]');
    assert.equal(await page.locator('[data-authoring-result]').getAttribute('data-validation'),'pass');
    assert.match(await page.locator('[data-authoring-result]').innerText(),/sourceRefs/i);
    await page.fill('textarea[name="sourceRefs"]','https://example.edu/reference');await page.click('[data-authoring-validate]');
    assert.equal(await page.locator('[data-authoring-result]').getAttribute('data-validation'),'pass');
    const draft=await page.evaluate(()=>JSON.parse(localStorage.getItem('bauman_russian_authoring_draft_v1')||'null'));
    assert.equal(draft.schema,'RUSSIAN_RU08_AUTHORING_BROWSER_V1');assert.equal(draft.draft.payload.ru,'пример');
    const env=await page.evaluate(()=>{const a=window.RussianAuthoringAdapter,d=a.restoreDraft();return a.reviewEnvelope(d)});
    assert.equal(env.metadataOnly,true);assert.equal(env.payloadIncluded,false);assert.equal('payload' in env,false,'review envelope leaked body');
    await page.reload({waitUntil:'domcontentloaded'});await page.waitForSelector('[data-russian-authoring][data-ready="1"]');
    assert.equal(await page.inputValue('textarea[name="ru"]'),'пример','draft recovery failed');
    assert.deepEqual(requests.filter(x=>x.method!=='GET'&&x.method!=='HEAD'),[],'authoring UI made remote write');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert(overflow<=4,'authoring overflow '+overflow);
    await context.close();
  }
}finally{await browser?.close()}
console.log('RUSSIAN_RU08_AUTHORING_BROWSER=PASS');