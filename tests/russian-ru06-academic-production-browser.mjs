import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-ru06-production';
fs.mkdirSync(OUT,{recursive:true});
const PAGE_URL=new URL('subjects/russian/index.html',BASE).href;
let browser;

async function prepare(page){
  const dataRequests=[];
  page.on('request',r=>{if(/\/subjects\/russian\/data\/(technical-concepts|academic-functions|reading|performance-tasks)\.json/.test(r.url()))dataRequests.push(r.url());});
  await page.goto(PAGE_URL,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>!!window.RussianAcademicProduction,{timeout:15000});
  await page.waitForTimeout(250);
  const initial=await page.evaluate(()=>window.RussianAcademicProduction.status());
  assert.equal(initial.ready,false,'RU06 data must not load on Russian startup');
  assert.equal(initial.lazyOnCapabilityUse,true,'RU06 runtime must declare lazy-on-capability-use behavior');
  assert.equal(dataRequests.length,0,'RU06 canonical production datasets fetched before academic-writing use');
  await page.evaluate(()=>{const k=window.SUBJECT_ADAPTER.storageKey;const s=JSON.parse(localStorage.getItem(k)||'{}');s.view='writing';s.writingMode='academic';localStorage.setItem(k,JSON.stringify(s));});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForSelector('#ruAcademicProduction',{timeout:15000});
  await page.waitForFunction(()=>window.RussianAcademicProduction?.status?.().ready===true,{timeout:15000});
  assert(dataRequests.length>=4,'academic-writing activation must load canonical RU06 datasets');
}
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  await prepare(page);

  const tasks=await page.evaluate(()=>window.RussianAcademicProduction.listTasks());
  for(const id of ['PT-R17-LAB','PT-R19-NIR-PITCH','PT-R21-QA','PT-R22-NIR'])assert(tasks.some(x=>x.id===id),'missing productive task '+id);
  const trust=await page.evaluate(()=>window.RussianAcademicProduction.status().trust);
  assert.equal(trust.academicFunctions.status,'UNVERIFIED','RU06 must read actual RU03 provenance for academic functions');
  assert.equal(trust.technical.status,'PARTIAL','RU06 must read actual RU03 provenance for technical concepts');
  const initialText=await page.locator('#ruAcademicProduction').innerText();
  assert(initialText.includes('Tạm ẩn mẫu tiếng Nga'),'UNVERIFIED academic function patterns must fail closed');
  assert(initialText.includes('chỉ hiển thị item VERIFIED'),'technical suggestions must expose authority filter');

  await page.evaluate(()=>window.RussianAcademicProduction.select('PT-R17-LAB'));
  await page.waitForFunction(()=>document.querySelector('[data-ru-production-task]')?.value==='PT-R17-LAB');
  await page.fill('[data-ru-production-field="sourceNotes"]','repo:R17; experiment record; measured value 12.4 V; limitation: sensor tolerance ±0.2 V');
  await page.fill('[data-ru-production-field="draft"]','В эксперименте измеряется напряжение 12,4 В. Метод и ограничение описаны отдельно. Результат не интерпретируется без учёта погрешности.');
  await page.fill('[data-ru-production-field="presentation"]','Цель → метод → результат → ограничение → вывод.');
  await page.fill('[data-ru-production-field="qa"]','Вопрос: какова погрешность? Ответ: ±0,2 В по записи эксперимента.');
  await page.click('[data-ru-production="snapshot"]');
  await page.click('[data-ru-production-check="source-linked"]');
  await page.click('[data-ru-production-check="claim-bounded"]');
  const first=await page.evaluate(()=>window.RussianAcademicProduction.status());
  assert.equal(first.state.work['PT-R17-LAB'].snapshots.length,1);
  assert(first.state.work['PT-R17-LAB'].selfChecks.some(x=>x.label==='source-linked'));

  await page.evaluate(()=>window.RussianAcademicProduction.select('PT-R22-NIR'));
  await page.waitForFunction(()=>document.querySelector('[data-ru-production-task]')?.value==='PT-R22-NIR');
  await page.fill('[data-ru-production-field="sourceNotes"]','source:A; source:B; research objective; no fabricated result');
  await page.fill('[data-ru-production-field="draft"]','Цель исследования состоит в проверке сформулированного метода. Результаты будут сообщены только после эксперимента.');
  await page.fill('[data-ru-production-field="presentation"]','Проблема → цель → метод → ожидаемая проверка → ограничения.');
  await page.fill('[data-ru-production-field="qa"]','Q: Почему выбран метод? A: По источникам A/B; ограничение указано явно.');
  await page.click('[data-ru-production="snapshot"]');
  await page.click('[data-ru-production-check="novel-transfer"]');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.RussianAcademicProduction?.status?.().ready===true,{timeout:15000});
  const persisted=await page.evaluate(()=>window.RussianAcademicProduction.status());
  assert.equal(persisted.activeTaskId,'PT-R22-NIR','research task selection must persist');
  assert.equal(persisted.state.work['PT-R22-NIR'].snapshots.length,1,'research production snapshot must persist');
  assert(persisted.state.work['PT-R22-NIR'].selfChecks.some(x=>x.label==='novel-transfer'),'novel transfer check must persist');

  const text=await page.locator('#ruAcademicProduction').innerText();
  assert(text.includes('Không tự chấm mastery/official score'),'production workspace must state non-authoritative boundary');
  await page.screenshot({path:OUT+'/research-production.png',fullPage:true});
  assert.deepEqual(errors,[],'Page errors: '+errors.join('\n'));
  await context.close();

  const mobile=await browser.newContext({viewport:{width:390,height:844}});
  const m=await mobile.newPage();await prepare(m);
  const overflow=await m.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  assert(overflow<=2,'RU06 production mobile overflow '+overflow+'px');
  await m.screenshot({path:OUT+'/mobile-production.png',fullPage:true});
  await mobile.close();

  console.log(JSON.stringify({ok:true,tasks:tasks.length,mobileOverflow:overflow}));
}finally{await browser?.close();}