import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-ru08-authoring';
fs.mkdirSync(OUT,{recursive:true});
const PAGE_URL=new URL('subjects/russian/editor.html',BASE).href;
let browser;

try{
 browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1280,height:1000}});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e?.stack||e)));
 await page.goto(PAGE_URL,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>!!window.RussianAuthoringStudio?.governance?.(),{timeout:15000});
 assert(await page.locator('#responsibility option').count()>5,'structured responsibility options missing');
 assert.equal(await page.locator('textarea').filter({hasText:'raw JSON'}).count(),0);

 await page.fill('#candidateId','audit-tc-cs-001');
 await page.selectOption('#responsibility','TechnicalConcept');
 await page.fill('#canonicalId','TC-CS-AUDIT-001');
 await page.fill('#revision','2026-10-01-audit-r1');
 await page.fill('#sourceRefs','GOST 33707-2016 §4.39\nrepo:R14');
 await page.fill('#contentText','алгоритм проверки состояния');
 await page.fill('#stress','алгори́тм');
 await page.fill('#technicalTerminology','computer science · source-bound terminology');
 await page.fill('#researchLineage','source refs → terminology note → learner explanation');
 await page.fill('#diffSummary','Add one source-bound technical concept candidate for audit.');
 await page.fill('#rollbackNote','Revert reviewed repository patch; preserve learner evidence/history.');

 await page.click('[data-authoring-action="validate"]');
 let c=await page.evaluate(()=>window.RussianAuthoringStudio.getCurrent());
 assert.equal(c.state,'VALIDATED','structured candidate must validate');
 assert.equal(c.canonicalOwnerPath,'subjects/russian/data/technical-concepts.json','owner resolution must be canonical');

 await page.click('[data-authoring-action="preview"]');
 c=await page.evaluate(()=>window.RussianAuthoringStudio.getCurrent());
 assert.match(c.contentHash,/^[a-f0-9]{64}$/,'preview must create stable content hash');

 await page.click('[data-authoring-action="review"]');
 c=await page.evaluate(()=>window.RussianAuthoringStudio.getCurrent());
 assert.equal(c.state,'REVIEW_REQUESTED');
 assert.equal(c.reviewEnvelope.metadataOnly,true,'review handoff must remain metadata-only');
 assert.equal(c.reviewEnvelope.contentHash,c.contentHash);

 await page.fill('#reviewReceipt','review-receipt-audit-001');
 await page.click('[data-authoring-action="approve"]');
 c=await page.evaluate(()=>window.RussianAuthoringStudio.getCurrent());
 assert.equal(c.state,'APPROVED');

 await page.fill('#patchSha','abcdef1234567890');
 await page.click('[data-authoring-action="patch"]');
 c=await page.evaluate(()=>window.RussianAuthoringStudio.getCurrent());
 assert.equal(c.state,'CANONICAL_PATCHED');
 assert.equal(c.canonicalPatched,true);

 await page.fill('#publishSha','1234567abcdef890');
 await page.click('[data-authoring-action="publish"]');
 c=await page.evaluate(()=>window.RussianAuthoringStudio.getCurrent());
 assert.equal(c.state,'PUBLISHED');
 const rollback=await page.evaluate(()=>window.RussianAuthoringStudio.rollbackPlan(window.RussianAuthoringStudio.getCurrent()));
 assert.equal(rollback.action,'create-reviewed-repository-revert; never rewrite learner history');
 assert.equal(rollback.canonicalOwnerPath,'subjects/russian/data/technical-concepts.json');

 const body=await page.locator('body').innerText();
 assert(body.includes('Raw JSON không phải giao diện mặc định'),'ordinary author boundary must be explicit');
 assert(body.includes('không ghi thẳng canonical content'),'direct canonical write must be explicitly forbidden');
 assert(body.includes('Studio không tự sửa repo'),'canonical patch must be external reviewed repository action');
 await page.screenshot({path:OUT+'/authoring-journey.png',fullPage:true});
 assert.deepEqual(errors,[],'Authoring page errors: '+errors.join('\n'));
 await context.close();

 const mobile=await browser.newContext({viewport:{width:390,height:844}});
 const m=await mobile.newPage();await m.goto(PAGE_URL,{waitUntil:'domcontentloaded',timeout:30000});await m.waitForFunction(()=>!!window.RussianAuthoringStudio?.governance?.(),{timeout:15000});
 const overflow=await m.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 assert(overflow<=2,'authoring mobile overflow '+overflow+'px');
 await m.screenshot({path:OUT+'/authoring-mobile.png',fullPage:true});await mobile.close();
 console.log(JSON.stringify({ok:true,state:c.state,owner:c.canonicalOwnerPath,mobileOverflow:overflow}));
}finally{await browser?.close();}