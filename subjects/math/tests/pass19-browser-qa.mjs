import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const chapter='MATH-VN-C01-vector_trong_khong_gian_';
const lessons={
  l04:{
    id:'MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140',
    title:'§1.4 · Cơ sở, span và tọa độ',
    diagrams:[1,2,3,4,6,14,17,20],
    retrieval:[2,3,5,10,11,17,19,20,22],
    misconceptions:[1,3,4,5,6,7,8,11,12,13,14,17,18,19,20,21],
    referenceSections:['R01','R02','R03','R04','R05','R06','R07'],
    fullViewSections:11
  },
  l05:{
    id:'MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140',
    title:'§1.5 · Không gian con và biểu diễn dữ liệu',
    diagrams:[1,2,3,5,7,10,13,17,20],
    retrieval:[2,4,6,8,11,14,16,18,20,22],
    misconceptions:[1,2,3,4,5,6,8,9,10,11,12,14,15,16,18,19,20,21],
    referenceSections:['R01','R02','R03','R04','R05','R06','R07','R08'],
    fullViewSections:12
  }
};
const reportPath=path.join(process.env.GITHUB_WORKSPACE,'subjects/math/THEORY_C01_L05_RUNTIME_PASS19.json');
const shotDir=path.join(process.env.GITHUB_WORKSPACE,'subjects/math/qa/pass19');
fs.mkdirSync(shotDir,{recursive:true});
const report={
  id:'bauman_math_c01_l05_runtime_pass19_v1',
  schema:'bauman_math_chromium_acceptance_v1',
  version:'RUNTIME_PASS19_C01_L05_V1',
  status:'FAIL',
  executedAt:new Date().toISOString(),
  scope:'current branch static site via real Chromium',
  lessons:[lessons.l04.id,lessons.l05.id],
  checks:[],
  pageErrors:[],
  consoleErrors:[],
  failedRequests:[],
  navigationCount:0,
  screenshots:[]
};
const pass=(name,data={})=>report.checks.push({name,status:'PASS',...data});
const fail=(name,message,data={})=>{report.checks.push({name,status:'FAIL',message,...data});throw new Error(name+': '+message);};
const assert=(value,name,data={})=>{if(!value)fail(name,'assertion failed',data);pass(name,data);};
let browser;

async function screenshot(page,name){
  const file=path.join(shotDir,name+'.png');
  await page.screenshot({path:file,fullPage:false});
  report.screenshots.push(path.relative(process.env.GITHUB_WORKSPACE,file).replaceAll('\\','/'));
}

try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
  await context.addInitScript(()=>{
    try{
      localStorage.removeItem('bauman_math_e129_theory_content_overlay_v1');
      localStorage.removeItem('bauman_math_e129_theory_content_report_v1');
    }catch(_){}
  });
  const page=await context.newPage();
  page.on('pageerror',e=>report.pageErrors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text())});
  page.on('requestfailed',r=>report.failedRequests.push({url:r.url(),error:r.failure()?.errorText||''}));
  page.on('framenavigated',f=>{if(f===page.mainFrame())report.navigationCount+=1});

  await page.goto('http://127.0.0.1:4173/subjects/math/index.html',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>
    window.BAUMAN_MATH_THEORY_E129&&
    window.BAUMAN_MATH_THEORY_E132&&
    window.BAUMAN_MATH_E239_MIN_SLIDE_CONTRACT&&
    window.BAUMAN_MATH_E240_THEORY_CONTENT_SOURCE&&
    window.BAUMAN_MATH_E210_LESSON_IDENTITY&&
    window.BAUMAN_MATH_E241_ARTIFACT_READER&&
    window.BAUMAN_MATH_E242_SLIDESHOW_RICHNESS&&
    window.BAUMAN_MATH_E243_PRESENTER_ROUTE_LOCK&&
    window.BAUMAN_MATH_THEORY_ARTIFACT_REGISTRY_E244&&
    window.BAUMAN_MATH_E235_FORMULA_STANDARD,
    {timeout:60000}
  );
  await page.waitForFunction(()=>window.BAUMAN_MATH_THEORY_E129.selfCheck().sources.content>0,{timeout:60000});

  const startup=await page.evaluate(async ids=>{
    const durable=await fetch('data/theory_lecture_content.json',{cache:'no-store'}).then(r=>r.json());
    const normalization=await fetch('data/theory_normalization/theory_normalization_c01_l05.json',{cache:'no-store'}).then(r=>r.json());
    const records=durable.records||[];
    return {
      e129:window.BAUMAN_MATH_THEORY_E129.selfCheck(),
      minimum:window.BAUMAN_MATH_E239_MIN_SLIDE_CONTRACT.selfCheck(),
      registry:window.BAUMAN_MATH_THEORY_ARTIFACT_REGISTRY_E244.selfCheck(),
      recordCount:records.length,
      targets:ids.map(id=>({id,count:records.filter(r=>r.lessonId===id).length,slides:records.find(r=>r.lessonId===id)?.slides?.length||0})),
      normalization:{lessonId:normalization.lessonId,notation:normalization.canonicalNotation?.length||0,formulas:normalization.canonicalFormulaRegistry?.length||0},
      source:window.BAUMAN_MATH_E240_THEORY_CONTENT_SOURCE.source(),
      e235:window.BAUMAN_MATH_E235_FORMULA_STANDARD.release
    };
  },[lessons.l04.id,lessons.l05.id]);
  assert(startup.e129.ok&&startup.e129.sources.content===18,'runtime APIs and E129 source count',{startup});
  assert(startup.minimum.ok&&startup.minimum.tests.fifteen.ok===false&&startup.minimum.tests.sixteen.ok===true&&startup.minimum.tests.twentyTwo.ok===true,'minimum 16 slide contract',{minimum:startup.minimum});
  assert(startup.registry.ok&&startup.registry.lessonCount===2&&startup.registry.sourceCount===8,'E244 registry has two lessons and eight sources',{registry:startup.registry});
  assert(startup.recordCount===18&&startup.targets.every(x=>x.count===1&&x.slides===22),'durable L04 and L05 are unique 22-slide records',{targets:startup.targets,recordCount:startup.recordCount});
  assert(startup.normalization.lessonId===lessons.l05.id&&startup.normalization.notation===18&&startup.normalization.formulas===16,'L05 normalization JSON parses and has complete registries',{normalization:startup.normalization});
  assert(startup.e235==='E235_READER_PRO_FORMULA_STANDARD_R2','E235 formula standard release unchanged',{release:startup.e235});

  async function openLesson(lesson){
    await page.evaluate(({id,chapter})=>{
      const st=(window.__BAUMAN_CORE_API&&window.__BAUMAN_CORE_API.state)||window.__MATH_STATE||(window.__MATH_STATE={});
      st.view='learning';st.learnTab='theory';st.stage='vn';st.e129Stage='vn';st.e129ChapterId=chapter;st.e129LessonId=id;st.e129Present=false;
      st.e169Path={moduleId:'pure',courseId:'pure-algebra',chapterId:'c01',activityId:'theory',lessonId:id};
      window.BAUMAN_MATH_THEORY_E129.render();
    },{id:lesson.id,chapter});
    await page.waitForFunction(id=>document.querySelector('[data-current-lesson]')?.getAttribute('data-current-lesson')===id,lesson.id,{timeout:30000});
    const reader=await page.evaluate(()=>({slides:document.querySelectorAll('.e129-slide-list .e129-slide').length,current:document.querySelector('[data-current-lesson]')?.getAttribute('data-current-lesson')||''}));
    assert(reader.slides===22&&reader.current===lesson.id,'E129 reader renders '+lesson.title+' with 22 slides',{reader});
  }

  async function openDeck(lesson,previousLesson=null){
    await page.click('[data-e129-present]');
    await page.waitForSelector('.e132-overlay-deck.open',{timeout:30000});
    await page.waitForFunction(()=>/01\s*\/\s*22/.test(document.querySelector('[data-e202-count]')?.textContent||''),{timeout:30000});
    await page.waitForFunction(id=>document.querySelector('.e132-overlay-deck.open')?.getAttribute('data-e243-lesson-id')===id,lesson.id,{timeout:30000});
    await page.waitForFunction(id=>document.querySelector('.e132-clean-main')?.getAttribute('data-e242-slide')==='SL01'&&document.querySelector('.e132-overlay-deck.open')?.getAttribute('data-e242-lesson-id')===id,lesson.id,{timeout:30000});
    await page.waitForFunction(()=>document.querySelector('.e241-actions [data-e241-reference]')&&document.querySelector('.e241-actions [data-e241-full]'),{timeout:30000});
    await page.waitForTimeout(400);
    const identity=await page.evaluate(()=>{
      const deck=document.querySelector('.e132-overlay-deck.open');
      return {
        e243Id:deck?.getAttribute('data-e243-lesson-id')||'',
        e243Title:deck?.getAttribute('data-e243-lesson-title')||'',
        e210Id:deck?.getAttribute('data-e210-active-lesson-id')||'',
        genericId:deck?.getAttribute('data-lesson-id')||'',
        richnessId:deck?.getAttribute('data-e242-lesson-id')||'',
        actionId:deck?.querySelector('.e241-actions')?.getAttribute('data-e241-lesson-id')||'',
        chip:deck?.querySelector('[data-e210-lesson-id]')?.textContent?.trim()||'',
        sourceLine:deck?.querySelector('[data-e210-source-line]')?.textContent?.trim()||'',
        record:window.BAUMAN_MATH_E211_READER_CONTENT.selfCheck().record,
        e210:window.BAUMAN_MATH_E210_LESSON_IDENTITY.selfCheck(),
        e241:window.BAUMAN_MATH_E241_ARTIFACT_READER.selfCheck(),
        e242:window.BAUMAN_MATH_E242_SLIDESHOW_RICHNESS.selfCheck(),
        e243:window.BAUMAN_MATH_E243_PRESENTER_ROUTE_LOCK.selfCheck(),
        text:deck?.innerText||''
      };
    });
    const ids=[identity.e243Id,identity.e210Id,identity.genericId,identity.richnessId,identity.actionId,identity.e210.lessonId,identity.e241.activeLessonId,identity.e242.activeLessonId];
    assert(ids.every(id=>id===lesson.id)&&identity.e243Title===lesson.title&&identity.e210.lessonTitle===lesson.title&&identity.record===lesson.title,'canonical identity locks '+lesson.title,{identity});
    if(previousLesson)assert(!identity.text.includes(previousLesson.title)&&!identity.text.includes(previousLesson.id),'no previous lesson identity leaks into '+lesson.title,{previousLesson:previousLesson.id,identity});
    assert(identity.e243.routingGhostPresent===false,'no routing ghost for '+lesson.title,{e243:identity.e243});
    await screenshot(page,lesson===lessons.l04?'l04-deck-slide01':'l05-deck-slide01');
  }

  async function traverseDeck(lesson){
    const positions=[];
    for(let i=1;i<=22;i++){
      const sid='SL'+String(i).padStart(2,'0');
      await page.waitForFunction(s=>document.querySelector('.e132-clean-main')?.getAttribute('data-e242-slide')===s,sid,{timeout:20000});
      const row=await page.evaluate(i=>({
        i,
        count:document.querySelector('[data-e202-count]')?.textContent||'',
        cards:document.querySelectorAll('.e202-card-grid .e132-clean-card').length,
        diagram:!!document.querySelector('[data-e242-diagram]'),
        retrieval:!!document.querySelector('[data-e242-retrieval]'),
        misconception:!!document.querySelector('[data-e242-misconception]'),
        evidenceOpen:document.querySelector('.e242-evidence')?.open??null,
        lessonId:document.querySelector('.e132-overlay-deck.open')?.getAttribute('data-e243-lesson-id')||''
      }),i);
      positions.push(row);
      if(row.cards!==3)fail(lesson.title+' slide '+i+' card count','expected 3',{row});
      if(row.diagram!==lesson.diagrams.includes(i))fail(lesson.title+' slide '+i+' diagram mapping','mapping mismatch',{row,expected:lesson.diagrams});
      if(row.retrieval!==lesson.retrieval.includes(i))fail(lesson.title+' slide '+i+' retrieval mapping','mapping mismatch',{row,expected:lesson.retrieval});
      if(row.misconception!==lesson.misconceptions.includes(i))fail(lesson.title+' slide '+i+' misconception mapping','mapping mismatch',{row,expected:lesson.misconceptions});
      if(row.retrieval&&row.evidenceOpen!==false)fail(lesson.title+' slide '+i+' retrieval collapsed','expected closed details',{row});
      if(row.lessonId!==lesson.id)fail(lesson.title+' slide '+i+' identity stability','lesson ID changed',{row});
      if(i<22){
        if(i<=10)await page.click('[data-e202-next]'); else await page.keyboard.press('ArrowRight');
        await page.waitForFunction(n=>new RegExp(String(n).padStart(2,'0')+'\\s*\\/\\s*22').test(document.querySelector('[data-e202-count]')?.textContent||''),i+1,{timeout:20000});
      }
    }
    pass(lesson.title+' all 22 slides and richness mappings',{positions});
    return positions;
  }

  async function goBackToSlide2(){
    for(let i=22;i>2;i--){
      await page.click('[data-e202-prev]');
      await page.waitForFunction(n=>new RegExp(String(n).padStart(2,'0')+'\\s*\\/\\s*22').test(document.querySelector('[data-e202-count]')?.textContent||''),i-1,{timeout:20000});
    }
    await page.waitForFunction(()=>document.querySelector('.e132-clean-main')?.getAttribute('data-e242-slide')==='SL02',{timeout:20000});
  }

  async function verifyArtifactsAndFormula(lesson){
    const controls=await page.evaluate(()=>({
      reference:document.querySelectorAll('.e241-actions [data-e241-reference]').length,
      full:document.querySelectorAll('.e241-actions [data-e241-full]').length,
      lessonId:document.querySelector('.e241-actions')?.getAttribute('data-e241-lesson-id')||''
    }));
    assert(controls.reference===1&&controls.full===1&&controls.lessonId===lesson.id,'artifact controls are distinct and lesson scoped for '+lesson.title,{controls});

    await page.click('.e241-actions [data-e241-reference]');
    await page.waitForSelector('.e241-modal:not(.hidden)',{timeout:20000});
    const reference=await page.evaluate(()=>({
      title:document.querySelector('.e241-modal:not(.hidden) [data-e241-title]')?.textContent?.trim()||'',
      heads:Array.from(document.querySelectorAll('.e241-modal:not(.hidden) .e241-section h3')).map(x=>x.textContent.trim())
    }));
    assert(reference.title.includes(lesson.title.split(' · ')[1])&&lesson.referenceSections.every(id=>reference.heads.some(x=>x.includes(id))),'Reference opens correct artifact for '+lesson.title,{reference});
    if(lesson===lessons.l05)await screenshot(page,'l05-reference');
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>document.querySelector('.e241-modal')?.classList.contains('hidden'),{timeout:10000});
    assert(await page.locator('.e132-overlay-deck.open').count()===1,'Reference Escape keeps deck open for '+lesson.title);

    await page.click('.e241-actions [data-e241-full]');
    await page.waitForSelector('.e241-modal:not(.hidden)',{timeout:20000});
    const full=await page.evaluate(()=>({
      title:document.querySelector('.e241-modal:not(.hidden) [data-e241-title]')?.textContent?.trim()||'',
      sections:document.querySelectorAll('.e241-modal:not(.hidden) .e241-section').length
    }));
    assert(full.title.includes(lesson.title.split(' · ')[1])&&full.sections===lesson.fullViewSections,'Full View opens correct artifact for '+lesson.title,{full});
    if(lesson===lessons.l05)await screenshot(page,'l05-full-view');
    await page.click('.e241-modal:not(.hidden) [data-e241-close]');
    await page.waitForFunction(()=>document.querySelector('.e241-modal')?.classList.contains('hidden'),{timeout:10000});

    await goBackToSlide2();
    await page.waitForSelector('[data-e211-formula-full]',{timeout:20000});
    const formulaButton=await page.evaluate(()=>({count:document.querySelectorAll('[data-e211-formula-full]').length,label:document.querySelector('[data-e211-formula-full]')?.textContent.trim()}));
    assert(formulaButton.count===1&&formulaButton.label==='Công thức đầy đủ','formula control remains separate for '+lesson.title,{formulaButton});
    await page.click('[data-e211-formula-full]');
    await page.waitForSelector('.e211-formula-modal',{timeout:20000});
    const formula=await page.evaluate(()=>({
      title:document.querySelector('.e211-formula-modal h2')?.textContent?.trim()||'',
      e235Release:window.BAUMAN_MATH_E235_FORMULA_STANDARD.release,
      stylePresent:!!document.getElementById('e235-formula-standard-style'),
      styleText:document.getElementById('e235-formula-standard-style')?.textContent||'',
      artifactModalVisible:!!document.querySelector('.e241-modal:not(.hidden)')
    }));
    assert(formula.title.includes('Công thức đầy đủ')&&formula.e235Release==='E235_READER_PRO_FORMULA_STANDARD_R2'&&formula.stylePresent&&formula.styleText.includes('display:inline-grid!important')&&!formula.artifactModalVisible,'formula modal and E235 visuals remain intact for '+lesson.title,{formula});
    if(lesson===lessons.l05)await screenshot(page,'l05-formula-modal');
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>!document.querySelector('.e211-formula-modal'),{timeout:10000});
  }

  async function closeDeck(){
    await page.click('[data-e202-exit]');
    await page.waitForFunction(()=>!document.querySelector('.e132-overlay-deck.open'),{timeout:10000});
  }

  await openLesson(lessons.l04);
  await openDeck(lessons.l04);
  await traverseDeck(lessons.l04);
  await verifyArtifactsAndFormula(lessons.l04);
  await closeDeck();

  await openLesson(lessons.l05);
  await openDeck(lessons.l05,lessons.l04);
  await traverseDeck(lessons.l05);
  await verifyArtifactsAndFormula(lessons.l05);
  await closeDeck();

  await openLesson(lessons.l04);
  await openDeck(lessons.l04,lessons.l05);
  const roundTrip=await page.evaluate(()=>({
    id:document.querySelector('.e132-overlay-deck.open')?.getAttribute('data-e243-lesson-id')||'',
    title:document.querySelector('.e132-overlay-deck.open')?.getAttribute('data-e243-lesson-title')||'',
    actionId:document.querySelector('.e241-actions')?.getAttribute('data-e241-lesson-id')||'',
    richnessId:document.querySelector('.e132-overlay-deck.open')?.getAttribute('data-e242-lesson-id')||''
  }));
  assert(roundTrip.id===lessons.l04.id&&roundTrip.title===lessons.l04.title&&roundTrip.actionId===lessons.l04.id&&roundTrip.richnessId===lessons.l04.id,'L05 to L04 round trip clears stale identity and controls',{roundTrip});
  await closeDeck();

  const unsupported='MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140';
  await openLesson({id:unsupported,title:'§1.6'});
  await page.click('[data-e129-present]');
  await page.waitForSelector('.e132-overlay-deck.open',{timeout:20000});
  await page.waitForTimeout(1200);
  const leak=await page.evaluate(()=>({
    current:document.querySelector('[data-current-lesson]')?.getAttribute('data-current-lesson')||'',
    actions:document.querySelectorAll('.e241-actions').length,
    referencePanel:document.querySelectorAll('.e241-reference-summary').length,
    richness:document.querySelectorAll('[data-e242-diagram],[data-e242-retrieval],[data-e242-misconception]').length,
    richnessLesson:document.querySelector('.e132-overlay-deck.open')?.getAttribute('data-e242-lesson-id')||''
  }));
  assert(leak.current===unsupported&&leak.actions===0&&leak.referencePanel===0&&leak.richness===0&&!leak.richnessLesson,'unregistered lesson has no stale L04/L05 artifact controls or richness',{leak});
  await closeDeck();

  assert(report.pageErrors.length===0,'no uncaught page errors',{pageErrors:report.pageErrors});
  assert(report.consoleErrors.length===0,'no console errors',{consoleErrors:report.consoleErrors});
  assert(report.failedRequests.length===0,'no failed network requests',{failedRequests:report.failedRequests});
  report.status='PASS';
  report.finalState='ACADEMIC_14_OF_14_PASS_RUNTIME_5_OF_5_BROWSER_ACCEPTED';
}catch(e){
  report.error=String(e&&e.stack||e);
  process.exitCode=1;
}finally{
  if(browser)await browser.close();
  fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
}
