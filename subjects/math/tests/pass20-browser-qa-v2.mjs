import fs from 'node:fs';
import {chromium} from 'playwright';

const target='MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140';
const chapter='MATH-VN-C01-vector_trong_khong_gian_';
const title='§1.4 · Cơ sở, span và tọa độ';
const expected={
  diagrams:[1,2,3,4,6,14,17,20],
  retrieval:[2,3,5,10,11,17,19,20,22],
  misconceptions:[1,3,4,5,6,7,8,11,12,13,14,17,18,19,20,21]
};
const report={status:'FAIL',executedAt:new Date().toISOString(),targetLessonId:target,scope:'full checked-out static site via Chromium',checks:[],pageErrors:[],consoleErrors:[],failedRequests:[],navigationCount:0};
const pass=(name,data={})=>report.checks.push({name,status:'PASS',...data});
const fail=(name,message,data={})=>{report.checks.push({name,status:'FAIL',message,...data});throw new Error(name+': '+message);};
const assert=(value,name,data={})=>{if(!value)fail(name,'assertion failed',data);pass(name,data);};
let browser;

try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await context.newPage();
  page.on('pageerror',e=>report.pageErrors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text())});
  page.on('requestfailed',r=>report.failedRequests.push({url:r.url(),error:r.failure()?.errorText||''}));
  page.on('framenavigated',f=>{if(f===page.mainFrame())report.navigationCount+=1});

  const openSite=async()=>{
    await page.goto('http://127.0.0.1:4173/subjects/math/index.html',{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>window.BAUMAN_MATH_THEORY_E129&&window.BAUMAN_MATH_THEORY_E132&&window.BAUMAN_MATH_E239_MIN_SLIDE_CONTRACT&&window.BAUMAN_MATH_E240_THEORY_CONTENT_SOURCE&&window.BAUMAN_MATH_E241_ARTIFACT_READER&&window.BAUMAN_MATH_E242_SLIDESHOW_RICHNESS&&window.BAUMAN_MATH_E243_PRESENTER_ROUTE_LOCK,{timeout:60000});
    await page.waitForFunction(()=>window.BAUMAN_MATH_THEORY_E129.selfCheck().sources.content>0,{timeout:60000});
  };
  await openSite();

  const e129=await page.evaluate(()=>window.BAUMAN_MATH_THEORY_E129.selfCheck());
  assert(e129.ok&&e129.sources.content===18,'runtime APIs and E129 sources',{e129});

  const min=await page.evaluate(()=>window.BAUMAN_MATH_E239_MIN_SLIDE_CONTRACT.selfCheck());
  assert(min.ok&&min.tests.fifteen.ok===false&&min.tests.sixteen.ok===true&&min.tests.twentyTwo.ok===true,'minimum slide contract',{min});

  const durable=await page.evaluate(async id=>{
    const payload=await fetch('data/theory_lecture_content.json',{cache:'no-store'}).then(r=>r.json());
    const records=payload.records||[];const record=records.find(r=>r.lessonId===id);
    return {recordCount:records.length,targetCount:records.filter(r=>r.lessonId===id).length,slides:record?.slides?.length||0,source:window.BAUMAN_MATH_E240_THEORY_CONTENT_SOURCE.source()};
  },target);
  assert(durable.recordCount===18&&durable.targetCount===1&&durable.slides===22,'durable source contains one 22-slide target',{durable});

  async function openLesson(id){
    await page.evaluate(({id,chapter})=>{
      const st=(window.__BAUMAN_CORE_API&&window.__BAUMAN_CORE_API.state)||window.__MATH_STATE||(window.__MATH_STATE={});
      st.view='learning';st.learnTab='theory';st.stage='vn';st.e129Stage='vn';st.e129ChapterId=chapter;st.e129LessonId=id;st.e129Present=false;
      st.e169Path={moduleId:'pure',courseId:'pure-algebra',chapterId:'c01',activityId:'theory',lessonId:id};
      window.BAUMAN_MATH_THEORY_E129.render();
    },{id,chapter});
    await page.waitForFunction(id=>document.querySelector('[data-current-lesson]')?.getAttribute('data-current-lesson')===id,id,{timeout:30000});
  }

  await openLesson(target);
  const reader=await page.evaluate(()=>({slides:document.querySelectorAll('.e129-slide-list .e129-slide').length,current:document.querySelector('[data-current-lesson]')?.getAttribute('data-current-lesson')||''}));
  assert(reader.slides===22&&reader.current===target,'E129 Reader renders target 22 slides',{reader});

  await page.click('[data-e129-present]');
  await page.waitForSelector('.e132-overlay-deck.open',{timeout:30000});
  await page.waitForFunction(()=>/01\s*\/\s*22/.test(document.querySelector('[data-e202-count]')?.textContent||''),{timeout:30000});
  await page.waitForFunction(()=>document.querySelector('.e132-clean-main')?.getAttribute('data-e242-slide')==='SL01',{timeout:30000});
  await page.waitForTimeout(900);
  const opened=await page.evaluate(()=>({count:document.querySelector('[data-e202-count]')?.textContent||'',mode:document.querySelector('[data-e202-mode]')?.textContent||'',side:document.querySelector('.e132-clean-side small')?.textContent||'',record:window.BAUMAN_MATH_E211_READER_CONTENT.selfCheck().record,current:document.querySelector('[data-current-lesson]')?.getAttribute('data-current-lesson')||'',e243:window.BAUMAN_MATH_E243_PRESENTER_ROUTE_LOCK.selfCheck()}));
  assert(opened.mode==='Reader Pro'&&opened.record===title&&opened.current===target&&opened.e243.routingGhostPresent===false,'slideshow opens locked to §1.4',{opened});

  const positions=[];
  for(let i=1;i<=22;i++){
    await page.waitForFunction(i=>document.querySelector('.e132-clean-main')?.getAttribute('data-e242-slide')==='SL'+String(i).padStart(2,'0'),i,{timeout:20000});
    const row=await page.evaluate(i=>({i,count:document.querySelector('[data-e202-count]')?.textContent||'',cards:document.querySelectorAll('.e202-card-grid .e132-clean-card').length,diagram:!!document.querySelector('[data-e242-diagram]'),retrieval:!!document.querySelector('[data-e242-retrieval]'),misconception:!!document.querySelector('[data-e242-misconception]'),evidenceOpen:document.querySelector('.e242-evidence')?.open??null}),i);
    positions.push(row);
    if(row.cards!==3)fail('slide '+i+' card count','expected 3',{row});
    if(row.diagram!==expected.diagrams.includes(i))fail('slide '+i+' diagram mapping','mapping mismatch',{row});
    if(row.retrieval!==expected.retrieval.includes(i))fail('slide '+i+' retrieval mapping','mapping mismatch',{row});
    if(row.misconception!==expected.misconceptions.includes(i))fail('slide '+i+' misconception mapping','mapping mismatch',{row});
    if(row.retrieval&&row.evidenceOpen!==false)fail('slide '+i+' retrieval collapsed','expected closed details',{row});
    if(i<22){
      if(i<11)await page.click('[data-e202-next]');
      else await page.keyboard.press('ArrowRight');
      await page.waitForFunction(n=>new RegExp(String(n).padStart(2,'0')+'\\s*\\/\\s*22').test(document.querySelector('[data-e202-count]')?.textContent||''),i+1,{timeout:20000});
    }
  }
  pass('all 22 slides via buttons and keyboard',{positions});

  const referenceControls=await page.evaluate(()=>({reference:document.querySelectorAll('.e241-actions [data-e241-reference]').length,full:document.querySelectorAll('.e241-actions [data-e241-full]').length,labels:{reference:document.querySelector('.e241-actions [data-e241-reference]')?.textContent.trim(),full:document.querySelector('.e241-actions [data-e241-full]')?.textContent.trim()}}));
  assert(referenceControls.reference===1&&referenceControls.full===1&&referenceControls.labels.reference==='Tham khảo thêm'&&referenceControls.labels.full==='Xem đầy đủ','Reference and Full View controls are distinct and non-duplicated',{referenceControls});

  for(let i=22;i>2;i--){
    await page.click('[data-e202-prev]');
    await page.waitForFunction(n=>new RegExp(String(n).padStart(2,'0')+'\\s*\\/\\s*22').test(document.querySelector('[data-e202-count]')?.textContent||''),i-1,{timeout:20000});
  }
  await page.waitForFunction(()=>document.querySelector('.e132-clean-main')?.getAttribute('data-e242-slide')==='SL02',{timeout:20000});
  await page.waitForSelector('[data-e211-formula-full]',{timeout:20000});
  const formulaControl=await page.evaluate(()=>({count:document.querySelectorAll('[data-e211-formula-full]').length,label:document.querySelector('[data-e211-formula-full]')?.textContent.trim()}));
  assert(formulaControl.count===1&&formulaControl.label==='Công thức đầy đủ','formula control appears on formula-bearing slide',{formulaControl});

  await page.click('.e241-actions [data-e241-reference]');
  await page.waitForSelector('.e241-modal:not(.hidden)',{timeout:20000});
  const refHeads=await page.locator('.e241-modal:not(.hidden) .e241-section h3').allTextContents();
  assert(['R01','R02','R03','R04','R05','R06','R07'].every(id=>refHeads.some(x=>x.includes(id))),'Reference renders R01-R07',{refHeads});
  await page.keyboard.press('Escape');
  await page.waitForSelector('.e241-modal.hidden',{timeout:10000});
  assert(await page.locator('.e132-overlay-deck.open').count()===1,'Reference Escape keeps deck open');

  await page.click('.e241-actions [data-e241-full]');
  await page.waitForSelector('.e241-modal:not(.hidden)',{timeout:20000});
  const fullCount=await page.locator('.e241-modal:not(.hidden) .e241-section').count();
  assert(fullCount===11,'Full View renders 11 sections',{fullCount});
  await page.click('.e241-modal:not(.hidden) [data-e241-close]');
  await page.waitForSelector('.e241-modal.hidden',{timeout:10000});

  await page.click('[data-e211-formula-full]');
  await page.waitForSelector('.e211-formula-modal',{timeout:20000});
  const formulaTitle=await page.locator('.e211-formula-modal h2').textContent();
  assert((formulaTitle||'').includes('Công thức đầy đủ'),'formula modal remains separate',{formulaTitle});
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.querySelector('.e211-formula-modal'),{timeout:10000});
  pass('formula modal closes with Escape');

  await page.click('[data-e202-exit]');
  await page.waitForFunction(()=>!document.querySelector('.e132-overlay-deck.open'),{timeout:10000});
  const alternate=await page.evaluate(async id=>{const payload=await fetch('data/theory_lecture_content.json',{cache:'no-store'}).then(r=>r.json());return (payload.records||[]).find(r=>r.lessonId!==id&&r.chapterId==='MATH-VN-C01-vector_trong_khong_gian_')?.lessonId||''},target);
  assert(!!alternate,'alternate C01 lesson available',{alternate});
  await openLesson(alternate);
  await page.click('[data-e129-present]');
  await page.waitForSelector('.e132-overlay-deck.open',{timeout:20000});
  await page.waitForTimeout(1000);
  const leak=await page.evaluate(()=>({actions:document.querySelectorAll('.e241-actions').length,referencePanel:document.querySelectorAll('.e241-reference-summary').length,richness:document.querySelectorAll('[data-e242-diagram],[data-e242-retrieval],[data-e242-misconception]').length,current:document.querySelector('[data-current-lesson]')?.getAttribute('data-current-lesson')||''}));
  assert(leak.actions===0&&leak.referencePanel===0&&leak.richness===0&&leak.current===alternate,'other lesson has no §1.4 enhancements',{leak,alternate});
  await page.click('[data-e202-exit]');
  await page.waitForFunction(()=>!document.querySelector('.e132-overlay-deck.open'),{timeout:10000});

  await openLesson(target);
  const pkg=await page.evaluate(()=>fetch('data/theory_integration/theory_lecture_content_c01_l04_import.json',{cache:'no-store'}).then(r=>r.json()));
  const beforeImportNav=report.navigationCount;
  await Promise.all([page.waitForNavigation({waitUntil:'domcontentloaded',timeout:30000}),page.evaluate(pkg=>window.BAUMAN_MATH_THEORY_E129.commitContent(pkg,'theory_lecture_content_c01_l04_import.json','merge'),pkg)]);
  await page.waitForFunction(()=>window.BAUMAN_MATH_THEORY_E129&&window.BAUMAN_MATH_E240_THEORY_CONTENT_SOURCE,{timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_MATH_THEORY_E129.selfCheck().sources.overlay===true,{timeout:30000});
  await page.waitForTimeout(700);
  const imported=await page.evaluate(async id=>{const payload=await fetch('data/theory_lecture_content.json',{cache:'no-store'}).then(r=>r.json());const importReport=JSON.parse(localStorage.getItem('bauman_math_e129_theory_content_report_v1')||'null');return {overlay:!!localStorage.getItem('bauman_math_e129_theory_content_overlay_v1'),slides:(payload.records||[]).find(r=>r.lessonId===id)?.slides?.length||0,source:window.BAUMAN_MATH_E240_THEORY_CONTENT_SOURCE.source(),warnings:importReport?.warnings||[]}},target);
  const obsolete=imported.warnings.some(w=>/Khuyến nghị đủ 16 slide role; hiện có 22/.test(String(w.message||w)));
  assert(imported.overlay&&imported.slides===22&&!obsolete&&report.navigationCount-beforeImportNav===1,'overlay import and single controlled reload',{imported,navigations:report.navigationCount-beforeImportNav});

  const beforeClearNav=report.navigationCount;
  await Promise.all([page.waitForNavigation({waitUntil:'domcontentloaded',timeout:30000}),page.evaluate(()=>window.BAUMAN_MATH_THEORY_E129.clearContentOverlay())]);
  await page.waitForFunction(()=>window.BAUMAN_MATH_THEORY_E129&&window.BAUMAN_MATH_E240_THEORY_CONTENT_SOURCE,{timeout:30000});
  await page.waitForFunction(()=>window.BAUMAN_MATH_THEORY_E129.selfCheck().sources.overlay===false&&window.BAUMAN_MATH_THEORY_E129.selfCheck().sources.content>0,{timeout:30000});
  await page.waitForTimeout(700);
  const cleared=await page.evaluate(async id=>{const payload=await fetch('data/theory_lecture_content.json',{cache:'no-store'}).then(r=>r.json());return {overlay:!!localStorage.getItem('bauman_math_e129_theory_content_overlay_v1'),slides:(payload.records||[]).find(r=>r.lessonId===id)?.slides?.length||0,source:window.BAUMAN_MATH_E240_THEORY_CONTENT_SOURCE.source()}},target);
  assert(!cleared.overlay&&cleared.slides===22&&report.navigationCount-beforeClearNav===1,'clear overlay restores durable source with one reload',{cleared,navigations:report.navigationCount-beforeClearNav});

  assert(report.pageErrors.length===0,'no uncaught page errors',{pageErrors:report.pageErrors});
  assert(report.consoleErrors.length===0,'no console errors',{consoleErrors:report.consoleErrors});
  assert(report.failedRequests.length===0,'no failed network requests',{failedRequests:report.failedRequests});
  report.status='PASS';
}catch(e){
  report.error=String(e&&e.stack||e);
}finally{
  if(browser)await browser.close();
  fs.writeFileSync(process.env.GITHUB_WORKSPACE+'/subjects/math/PASS20_BROWSER_QA_REPORT.json',JSON.stringify(report,null,2)+'\n');
}
