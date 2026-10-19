// CONTENT-FIRST · Only R03/R04 new learner journey. No real microphone or RU03 claim.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const root='subjects/russian/';
const rows=JSON.parse(fs.readFileSync(root+'data/listen-write-lessons.json','utf8'));
const base=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const out=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-survival';
fs.mkdirSync(out,{recursive:true});
const receipt={schema:'RUSSIAN_SURVIVAL_R03_R04_BROWSER_V1',status:'RUNNING',
  scope:'R03/R04 only; source-bound text, no RU03 or microphone grading',scenarios:[]};
let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  for(const target of [{lesson:'R03',width:1440,height:900},{lesson:'R04',width:390,height:844}]){
    const context=await browser.newContext({viewport:{width:target.width,height:target.height}});
    const page=await context.newPage();
    const pageErrors=[];
    page.on('pageerror',error=>pageErrors.push(String(error.message||error)));
    await page.goto(new URL('subjects/russian/index.html',base).href,
      {waitUntil:'domcontentloaded',timeout:30000});
    await page.locator('.rf-module-lesson').click();
    await page.locator('[data-lesson="'+target.lesson+'"]').click();
    await page.waitForFunction(id=>{
      const state=window.RussianSurvivalPracticeCandidate?.status?.();
      return state?.lessonId===id&&state?.sourceReady===true;
    },target.lesson,{timeout:30000});
    const wrapper=page.locator('#ruSurvivalPractice');
    await wrapper.waitFor({state:'visible'});
    const source=rows.find(x=>x.lessonId===target.lesson);
    assert.equal(source.items.length,2);
    const before=await page.evaluate(id=>JSON.stringify(
      window.RussianLearningFlow?.get?.()?.lessons?.[id]?.steps||{}),target.lesson);
    const status=await page.evaluate(()=>window.RussianSurvivalPracticeCandidate.status());
    assert.equal(status.audioAuthority,'UNVERIFIED');
    assert.equal(status.masteryWrites,false);
    const visible=await wrapper.innerText();
    assert.match(visible,/Nghe trước/);
    assert.ok(!visible.includes(source.items[0].printSample),'Text must stay hidden until reveal');
    receipt.scenarios.push({lesson:target.lesson,viewport:target.width+'x'+target.height,
      sceneSourceIds:source.items.map(x=>x.id),checks:[]});
    const checks=receipt.scenarios.at(-1).checks;
    for(const item of source.items){
      await wrapper.locator('[data-survival="scenario"][data-id="'+item.id+'"]').click();
      const current=await page.evaluate(()=>window.RussianSurvivalPracticeCandidate.status());
      assert.equal(current.selectedItem,item.id);
      await wrapper.locator('[data-survival="reveal"]').click();
      assert.ok((await wrapper.innerText()).includes(item.printSample),'Text must be canonical after reveal');
      checks.push({sourceId:item.id,step:'listen and source text',result:'PASS'});
      await wrapper.locator('[data-survival="next"]').click();
      assert.ok(await wrapper.locator('[data-survival="record"]').isVisible());
      assert.ok(await wrapper.locator('[data-survival="stop"]').isVisible());
      checks.push({sourceId:item.id,step:'recording controls visible (capture not tested)',result:'PASS'});
      await wrapper.locator('[data-survival="next"]').click();
      const alternate=source.items.find(x=>x.id!==item.id);
      await wrapper.locator('[data-survival="visual"][data-id="'+alternate.id+'"]').click();
      assert.match(await wrapper.innerText(),/Thử lại/);
      await wrapper.locator('[data-survival="visual"][data-id="'+item.id+'"]').click();
      assert.match(await wrapper.innerText(),/Đã ghép đúng câu/);
      checks.push({sourceId:item.id,step:'scene discrimination wrong+correct',result:'PASS'});
      await wrapper.locator('[data-survival="next"]').click();
      assert.match(await wrapper.innerText(),/Cyrillic/);
      await wrapper.locator('[data-survival="next"]').click();
      await wrapper.locator('#ruSurvivalReply').fill(item.printSample);
      await wrapper.locator('[data-survival="check"]').click();
      assert.match(await wrapper.innerText(),/Khớp đúng văn bản nguồn/);
      await wrapper.locator('[data-survival="next"]').click();
      assert.match(await wrapper.innerText(),/HUMAN_RU03_REQUIRED/);
      checks.push({sourceId:item.id,step:'script, typed reaction and session-only reflection',result:'PASS'});
    }
    const after=await page.evaluate(id=>JSON.stringify(
      window.RussianLearningFlow?.get?.()?.lessons?.[id]?.steps||{}),target.lesson);
    assert.equal(after,before,'R03/R04 practice must not write canonical learning-flow evidence');
    assert.deepEqual(pageErrors,[],'R03/R04 browser page errors are not permitted');
    const dimensions=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
    assert.ok(dimensions.scrollWidth<=dimensions.width+1,'Survival UI overflows viewport');
    receipt.scenarios.at(-1).result='PASS';
    await page.screenshot({path:path.join(out,'survival-'+target.lesson.toLowerCase()+'-'+target.width+'.png'),fullPage:true});
    await context.close();
  }
  receipt.status='PASS';receipt.RU03='BLOCKED';receipt.realMicrophone='NOT_TESTED';
  console.log('RUSSIAN_SURVIVAL_R03_R04_BROWSER_PASS');
}catch(error){
  receipt.status='FAIL';receipt.failure=String(error.stack||error);
  process.exitCode=1;
  console.error('RUSSIAN_SURVIVAL_R03_R04_BROWSER_FAIL',error);
}finally{
  fs.writeFileSync(path.join(out,'survival-evidence.json'),JSON.stringify(receipt,null,2));
  await browser?.close();
}
