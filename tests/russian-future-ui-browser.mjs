import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const {chromium}=await import(process.env.BAUMAN_PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.BAUMAN_E2E_BASE_URL||'http://127.0.0.1:4173/';
const OUT=process.env.BAUMAN_E2E_ARTIFACT_DIR||'artifacts/russian-future-ui';
fs.mkdirSync(OUT,{recursive:true});

let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.BAUMAN_CHROME_PATH?{executablePath:process.env.BAUMAN_CHROME_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1672,height:941}});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.addInitScript(()=>{
    const speech={count:0,last:null};
    const audio={count:0,last:null};
    class MockUtterance{constructor(text){this.text=String(text);this.lang='';this.rate=1;}}
    class MockAudio{
      constructor(src){this.src=String(src||'');this.playbackRate=1;this.listeners={};}
      addEventListener(name,fn){this.listeners[name]=fn;}
      play(){audio.count++;audio.last={src:this.src,rate:this.playbackRate};return Promise.resolve();}
    }
    Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:MockUtterance});
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel(){},speak(u){speech.count++;speech.last={text:u.text,lang:u.lang,rate:u.rate}}}});
    Object.defineProperty(window,'Audio',{configurable:true,value:MockAudio});
    window.__RF_SPEECH=speech;
    window.__RF_AUDIO=audio;
    window.__RF_PRINT_COUNT=0;
    Object.defineProperty(window,'print',{configurable:true,value:()=>{window.__RF_PRINT_COUNT++}});
  });

  await page.goto(new URL('subjects/russian/index.html',BASE).href,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('body.ru-future-ui',{timeout:15000});
  await page.waitForSelector('.rf-dashboard .rf-module-card',{timeout:15000});
  // Core can finish one last render after the future enhancer first paints.
  // Wait for the MutationObserver/RAF presentation layer to settle before asserting visible branding.
  await page.waitForFunction(()=>document.getElementById('subjectTitle')?.textContent?.trim()==='Tiếng Nga',null,{timeout:10000});

  // Browser speech recognition must distinguish interim hypotheses from completed
  // answers, ignore detached events, and preserve a real confidence value of zero.
  const asrSessionAudit=await page.evaluate(()=>{
    const adapter=window.RussianSpeechRecognitionAdapter;
    const prior=window.SpeechRecognition;
    const sessions=[];
    const received=[];
    class SimulatedRecognizer {
      start(){sessions.push(this)}
      stop(){}
      abort(){}
    }
    window.SpeechRecognition=SimulatedRecognizer;
    try{
      adapter.start({interim:true,onResult:row=>received.push(row)});
      const old=sessions[0],staleResult=old.onresult,staleEnd=old.onend;
      old.onresult({results:[{0:{transcript:'где м...',confidence:.9},isFinal:false}]});
      const interim=received.at(-1);
      old.onresult({results:[{0:{transcript:'Где метро?',confidence:0},isFinal:true}]});
      const final=received.at(-1);
      old.onresult({results:[{0:{transcript:'Где метро?',confidence:0},isFinal:true}]});
      const withoutDuplicate=received.length===2;
      adapter.start({onResult:row=>received.push(row)});
      staleResult({results:[{0:{transcript:'wrong previous answer'},isFinal:true}]});
      staleEnd();
      const oldSilenced=received.length===2&&adapter.support()==='SUPPORTED';
      const current=sessions[1],late=current.onresult;
      current.onresult({results:[{0:{transcript:'Как пройти?',confidence:.75},isFinal:false}]});
      const pendingNotFinal=received.length===2;
      current.onresult({results:[{0:{transcript:'Как пройти?',confidence:.75},isFinal:true}]});
      const secondFinal=received.at(-1);
      adapter.cancel();
      late({results:[{0:{transcript:'stale after cancellation'},isFinal:true}]});
      const cancellationSafe=received.length===3;
      return {interim,final,secondFinal,withoutDuplicate,oldSilenced,pendingNotFinal,cancellationSafe};
    }finally{
      adapter.cancel();
      if(prior===undefined)delete window.SpeechRecognition;
      else window.SpeechRecognition=prior;
    }
  });
  assert.equal(asrSessionAudit.interim?.final,false,'Interim Russian hypothesis must not be reported as final');
  assert.equal(asrSessionAudit.interim?.pronunciationAuthority,false,'Browser interim transcript must never imply pronunciation authority');
  assert.equal(asrSessionAudit.final?.final,true,'Final Russian transcript must retain explicit final state');
  assert.equal(asrSessionAudit.final?.transcript,'Где метро?','Final Russian transcript must preserve text');
  assert.equal(asrSessionAudit.final?.rawConfidence,0,'Valid zero recognition confidence must not become missing');
  assert.equal(asrSessionAudit.secondFinal?.transcript,'Как пройти?','A new oral session must process its own final answer');
  assert.ok(asrSessionAudit.withoutDuplicate&&asrSessionAudit.oldSilenced&&asrSessionAudit.pendingNotFinal&&asrSessionAudit.cancellationSafe,
    'Speech recognition must reject duplicates, late/cancelled events and interim evidence');

  assert.equal((await page.locator('#subjectTitle').innerText()).trim(),'Tiếng Nga','Russian-only visible brand drifted');
  assert.match(await page.locator('#subjectSubtitle').innerText(),/Nghe.*Nói.*Đọc.*Viết/);
  assert.equal(await page.locator('.ru-right-rail').count(),0,'Fixed right rail must be absent from the canonical learning shell');

  // Prime one explicit presentation pass, then wait for the app/package runtime to reach
  // an actual DOM-quiet window. Packaged startup can deliver legitimate queued mutations
  // later than two RAFs; those must not be misattributed to the measured upgrade pass.
  await page.evaluate(async()=>{
    window.RUSSIAN_FUTURE_UI.upgrade();
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const root=document.querySelector('.ru-app-shell');
    await new Promise(resolve=>{
      let quietTimer=null;
      const finish=()=>{if(quietTimer)clearTimeout(quietTimer);observer.disconnect();resolve();};
      const arm=()=>{if(quietTimer)clearTimeout(quietTimer);quietTimer=setTimeout(finish,200);};
      const observer=new MutationObserver(arm);
      observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
      arm();
      setTimeout(finish,3000);
    });
  });

  // An overview upgrade must not schedule vocabulary rendering in the background.
  const offscreenSrsRefreshes=await page.evaluate(()=>{
    const owner=window.RussianVocabSrs;
    if(!owner||typeof owner.refresh!=='function')return -1;
    const original=owner.refresh;
    let calls=0;
    owner.refresh=()=>{calls++;};
    try{window.RUSSIAN_FUTURE_UI.upgrade();}
    finally{owner.refresh=original;}
    return calls;
  });
  assert.equal(offscreenSrsRefreshes,0,'Overview upgrade must not refresh the offscreen vocabulary SRS');

  const idleMutationCount=await page.evaluate(async()=>{
    const root=document.querySelector('.ru-app-shell');
    let count=0;
    const observer=new MutationObserver(records=>{
      count+=records.filter(r=>r.type==='childList'||(r.type==='attributes'&&r.attributeName==='class')).length;
    });
    observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    window.RUSSIAN_FUTURE_UI.upgrade();
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    observer.disconnect();
    return count;
  });
  assert.equal(idleMutationCount,0,'Repeated future UI upgrade must be DOM-idempotent and must not self-trigger MutationObserver churn');

  await page.waitForSelector('.ru-capability-roadmap .ru-cap-band',{timeout:20000});
  const dims=await page.evaluate(()=> {
    const box=s=>{const r=document.querySelector(s)?.getBoundingClientRect();return r?{x:r.x,y:r.y,w:r.width,h:r.height,b:r.bottom}:null};
    const modules=[...document.querySelectorAll('.rf-module-card')].map(el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}});
    return {
      vw:innerWidth,scroll:document.documentElement.scrollWidth,
      sidebar:box('.ru-sidebar'),main:box('.ru-main'),view:box('.ru-view'),hero:box('.overview-top-only-hero'),capHero:box('.ru-cap-hero'),capCards:[...document.querySelectorAll('.ru-cap-band')].map(el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}}),
      continueCard:box('.rf-continue-card'),today:box('.rf-today-plan'),review:box('.rf-review-now'),path:box('.rf-learning-path'),
      progress:box('.rf-progress-strip'),modules,
      bodyFont:parseFloat(getComputedStyle(document.querySelector('.ru-view')).fontSize),
      viewComputed:{maxWidth:getComputedStyle(document.querySelector('.ru-view')).maxWidth,width:getComputedStyle(document.querySelector('.ru-view')).width,boxSizing:getComputedStyle(document.querySelector('.ru-view')).boxSizing},
      shellComputed:{columns:getComputedStyle(document.querySelector('.ru-app-shell')).gridTemplateColumns,mainWidth:getComputedStyle(document.querySelector('.ru-main')).width}
    };
  });
  assert.ok(dims.sidebar&&dims.sidebar.w>=205&&dims.sidebar.w<=235,'Sidebar width must stay close to 220px reference');
  assert.ok(dims.main&&dims.main.w>1300,'Main shell must still use space released by the old right rail');
  assert.ok(dims.view&&dims.view.w<=1461&&dims.view.w>=1230,'Approved Russian Overview must use the wider reference canvas: '+JSON.stringify({view:dims.view,viewComputed:dims.viewComputed,shell:dims.shellComputed}));
  assert.ok(dims.bodyFont>=15,'Primary learning content must not fall below 15px body text');
  assert.ok(dims.capHero&&dims.capHero.h>=215,'Approved R0–R4 hero must remain prominent');
  assert.equal(dims.capCards.length,5,'Approved overview must show exactly five evidence-driven capability bands');
  assert.ok(dims.capCards.every(x=>x.w>=150),'Five capability cards must remain legible on desktop');
  assert.ok(dims.continueCard?.y>dims.capCards.at(-1)?.y,'Continue Learning must follow canonical R0–R4 capability cards');
  assert.ok(dims.modules[0]?.y>dims.continueCard?.y,'Activity icons stay available below the primary Continue Learning decision');
  assert.equal(dims.hero?.h||0,0,'Legacy Future UI hero must be hidden when the canonical capability hero is ready');
  assert.ok(Math.max(...dims.modules.map(x=>x.h))<=145,'Icon shortcuts must remain compact, not rebuild large dashboard cards');
  assert.ok(dims.today&&dims.review&&Math.abs(dims.today.y-dims.review.y)<3,'Today and truthful review status must share the next decision row');
  assert.ok(dims.path&&dims.path.y>dims.today.y,'Compact Learning Path must follow the primary learning actions');
  assert.ok(dims.progress&&dims.progress.y>dims.path.y,'Secondary statistics must appear after the learning path');
  const capability=await page.evaluate(()=>({
    bands:[...document.querySelectorAll('.ru-cap-band')].map(x=>({id:x.dataset.capBand,locked:x.classList.contains('locked'),disabled:!!x.querySelector('button:disabled')})),
    progress:document.querySelector('.ru-cap-meter')?.getAttribute('role'),
    result:window.RussianCapabilityProgression?.currentBand?.().lessonReady,
    stage:window.RussianCapabilityProgression?.stageExitStatus?.('vn').lessonReady,
    source:document.querySelector('.ru-capability-roadmap')?.dataset.approvedOverview
  }));
  assert.deepEqual(capability.bands.map(x=>x.id),['R0','R1','R2','R3','R4'],'Approved overview must reuse the canonical five-band source of truth');
  assert.equal(capability.progress,'progressbar','Stage summary must expose accessible progress semantics');
  assert.equal(capability.source,'2026-10-16','UI must identify the approved overview model');
  assert.ok(capability.bands.slice(1).every(x=>!x.locked||x.disabled),'Future locked bands must not provide unauthorized lesson shortcuts');
  assert.equal(typeof capability.result,'number','Capability summary must derive from the real learner state');
  assert.equal(dims.modules.length,8,'Overview must expose exactly eight phone-style app shortcuts');
  const moduleRows=[...new Set(dims.modules.map(x=>Math.round(x.y)))];
  assert.equal(moduleRows.length,2,'Eight shortcuts must use two balanced four-icon rows on desktop');
  assert.ok(Math.min(...dims.modules.map(x=>x.w))>=200,'Desktop app icons need readable tap targets in a four-column grid');
  assert.ok(dims.scroll<=dims.vw+2,'Future Russian UI must not horizontally overflow at reference viewport');

  const personalReport=page.locator('.rf-personal-report[data-report-scope="learner"]');
  await personalReport.waitFor({state:'visible',timeout:10000});
  const personalReportText=await personalReport.innerText();
  for(const label of ['Báo cáo học tập cá nhân','Kết luận ngắn','Kỹ năng tốt','Vấn đề cần xử lý','Kế hoạch tiếp theo','Mức dữ liệu','Stage Check gần nhất','Bằng chứng gần nhất','In báo cáo'])assert.ok(personalReportText.includes(label),'Personal learning report missing '+label);
  assert.equal(/device log|access log|technical log|nhật ký thiết bị/i.test(personalReportText),false,'Learner report must not expose admin/device technical logs');
  assert.equal(await personalReport.getAttribute('data-report-evidence-status'),'Chưa đủ dữ liệu','Fresh learner report must not overstate evidence completeness');
  assert.match(personalReportText,/không phải bảng điểm, chứng chỉ hoặc kết luận học vụ chính thức/i,'Learner report must state its non-official evidence boundary');

  await page.locator('[data-rf-report-print]').click();
  assert.equal(await page.evaluate(()=>window.__RF_PRINT_COUNT),1,'Report print action must invoke the browser print flow exactly once');
  assert.equal(await page.locator('.rf-report-print-sheet').count(),1,'Print action must materialize a report-only print sheet');
  assert.equal(await page.locator('body.rf-report-printing').count(),1,'Print action must activate report-only print mode');
  await page.waitForTimeout(1300);
  assert.equal(await page.locator('.rf-report-print-sheet').count(),0,'Temporary print sheet must clean itself up');

  await page.evaluate(()=>{
    const at=new Date().toISOString();
    localStorage.setItem('bauman_russian_learning_state_v1',JSON.stringify({
      schema:'bauman_russian_learning_state_v1',
      reviewQueue:{'qa-review-evidence':{id:'qa-review-evidence',label:'Mục QA có evidence',reason:'user_flagged',addedAt:at,scheduledAt:at,dueAt:at}},
      updatedAt:at
    }));
    window.dispatchEvent(new CustomEvent('russian:learning-state'));
  });
  await page.waitForFunction(()=>document.querySelector('.rf-personal-report')?.dataset.reportEvidenceStatus==='Đang tích lũy',null,{timeout:5000});
  assert.equal(await personalReport.getAttribute('data-report-evidence-status'),'Đang tích lũy','Learner report must refresh when evidence state changes');

  const dashboardText=await page.locator('.rf-dashboard').innerText();
  for(const label of ['HỌC TIẾP','CẦN ÔN','Hôm nay','Ứng dụng học tập','Nghe','Nói','Bài học','Luyện chữ','Từ vựng','Ngữ pháp','Hội thoại','Ôn tập','Learning Path','Khởi động','Âm & chữ','Nghe nói cơ bản','A1','A2 / Dự bị','Tiếng Nga học thuật']){
    assert.ok(dashboardText.includes(label),'Overview summary missing '+label);
  }
  assert.equal(await page.locator('.rf-module-progress').count(),5,'Only five evidence-bearing skill icons may display real learning-state counts');
  assert.equal(await page.locator('.rf-module-icon svg[aria-hidden="true"]').count(),8,'Each shortcut must have one consistent decorative SVG icon');
  assert.equal(await page.locator('.rf-module-card p').first().evaluate(el=>getComputedStyle(el).display),'none','Icon launchers must not show redundant subtitles');
  assert.equal(await page.locator('.rf-module-progress').first().evaluate(el=>getComputedStyle(el).display),'none','Activity evidence stays available in the report, not shown as a fake phone-icon score');
  const iconRoutes=await page.locator('.rf-module-card').evaluateAll(nodes=>nodes.map(node=>({route:JSON.parse(node.dataset.route),name:node.getAttribute('aria-label'),height:node.getBoundingClientRect().height})));
  assert.ok(iconRoutes.every(x=>x.name&&x.height>=44),'Every app icon must have an accessible name and a 44px-or-taller tap target');
  assert.deepEqual(iconRoutes.map(x=>x.route.view),['media','learning','learning','writing','vocab','grammar','dialogue','learning'],'Icon grid must reuse all eight existing core routes without a parallel state store');
  assert.equal(await page.locator('.rf-road-step').count(),6,'Overview Learning Path must contain exactly six canonical stages');
  assert.equal(await page.locator('.rf-road-step[aria-current="step"]').count(),1,'Learning Path must expose one current stage');
  assert.equal(await page.locator('.rf-road-step.done').count(),0,'Selected academic stage or clicked activities must not create fake completed CEFR levels');
  assert.match(await page.locator('.rf-learning-path').innerText(),/không phải chứng nhận trình độ/i,'Learning Path must disclose that it is not proficiency certification');
  assert.doesNotMatch(await page.locator('.rf-continue-actions').innerText(),/\d+%/,'Activity-based heuristic percentage must not appear as language mastery');
  assert.match(await page.locator('.rf-review-now').innerText(),/Chưa có nội dung đến hạn\./,'Fresh learner state must not synthesize review work');
  assert.equal(await page.locator('.rf-review-now button').count(),0,'Empty Review Queue must not show a fake review CTA');
  assert.equal(await page.locator('#ruLessonFlow').count(),0,'Overview must not duplicate the lesson-detail stepper');

  await page.locator('#aiBtn').focus();
  await page.locator('#aiBtn').click();
  await page.waitForSelector('#modal:not(.hidden)',{state:'visible',timeout:10000});
  const modalState=await page.evaluate(()=>{
    const modal=document.getElementById('modal');
    return {role:modal?.getAttribute('role'),ariaModal:modal?.getAttribute('aria-modal'),ariaHidden:modal?.getAttribute('aria-hidden'),focusInside:Boolean(modal?.contains(document.activeElement))};
  });
  assert.equal(modalState.role,'dialog','Modal must expose dialog semantics');
  assert.equal(modalState.ariaModal,'true','Modal must be modal to assistive technology');
  assert.equal(modalState.ariaHidden,'false','Open modal must be exposed to assistive technology');
  assert.equal(modalState.focusInside,true,'Opening a modal must move keyboard focus inside it');
  await page.keyboard.press('Shift+Tab');
  assert.equal(await page.evaluate(()=>document.getElementById('modal')?.contains(document.activeElement)),true,'Shift+Tab must stay trapped inside modal');
  await page.keyboard.press('Escape');
  await page.waitForSelector('#modal.hidden',{state:'attached',timeout:5000});
  assert.equal(await page.locator('#modal').getAttribute('aria-hidden'),'true','Closed modal must be hidden from assistive technology');
  await page.waitForFunction(()=>document.activeElement?.id==='aiBtn',null,{timeout:5000});

  const search=page.locator('#russianGlobalSearch');
  await search.fill('ngữ pháp');
  await page.waitForFunction(()=>document.querySelectorAll('#russianSearchHints .rf-search-group').length>=2,null,{timeout:10000});
  const searchGroups=await page.locator('#russianSearchHints .rf-search-group > b').allTextContents();
  assert.ok(searchGroups.includes('NGỮ PHÁP'),'Grouped search must expose grammar content results');
  assert.ok(searchGroups.includes('HOẠT ĐỘNG'),'Grouped search must keep navigation/activity results separate');
  assert.equal(await search.getAttribute('aria-expanded'),'true','Search combobox must expose expanded results');
  await search.press('ArrowDown');
  assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('role')),'option','ArrowDown from search must focus the first result');
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>document.activeElement?.id),'russianGlobalSearch','Escape from search results must return focus to the search input');
  assert.equal(await search.getAttribute('aria-expanded'),'false','Escaping search results must collapse the combobox');
  await search.fill('');

  assert.equal(await page.evaluate(()=>window.RussianLearningSearch?.isVocabularyLoaded?.()),false,'Large vocabulary dataset must remain unloaded before the learner opens Vocabulary');

  // Local storage is NOT account/server sync. Verify visible truth on success and
  // simulated quota denial; restore the native storage method before other journeys.
  assert.doesNotMatch(await page.locator('#saveState').innerText(),/Đã đồng bộ/,'Local save must never claim server synchronization');
  assert.equal(await page.locator('#saveState').getAttribute('aria-live'),'polite','Storage status must be readable to assistive technology');
  await page.click('#nav [data-view="media"]');
  await page.waitForFunction(()=>document.getElementById('saveState')?.dataset.localSave==='saved');
  assert.equal((await page.locator('#saveState').innerText()).trim(),'Đã lưu trên thiết bị','Successful localStorage write must label its actual destination');
  await page.evaluate(()=>{
    const original=Storage.prototype.setItem;
    window.__ruOriginalSetItem=original;
    Storage.prototype.setItem=function(name,value){
      if(name===window.SUBJECT_ADAPTER.storageKey)throw new DOMException('QA quota denial','QuotaExceededError');
      return original.call(this,name,value);
    };
  });
  await page.click('#nav [data-view="overview"]');
  await page.waitForFunction(()=>document.getElementById('saveState')?.dataset.localSave==='error');
  assert.equal((await page.locator('#saveState').innerText()).trim(),'Không thể lưu trên thiết bị','Local storage failure must be shown, not a false success');
  await page.evaluate(()=>{
    Storage.prototype.setItem=window.__ruOriginalSetItem;
    delete window.__ruOriginalSetItem;
  });
  await page.click('#nav [data-view="media"]');
  await page.waitForFunction(()=>document.getElementById('saveState')?.dataset.localSave==='saved');
  await page.click('#nav [data-view="overview"]');
  await page.waitForSelector('.rf-dashboard');

  const tabs=['media','learning','vocab','grammar','writing'];
  for(const view of tabs){
    await page.click(view==='learning'?'#nav [data-view="learning"][data-learn="practice"]':'#nav [data-view="'+view+'"]');
    if(view==='writing'){
      await page.waitForFunction(()=>!document.querySelector('#view > .rf-tab-intro'),null,{timeout:10000});
      assert.equal(await page.locator('#view > .writing-studio .writing-hero').count(),1,'Writing must use its single canonical hero');
    }else{
      await page.waitForSelector('#view > .rf-tab-intro[data-view="'+view+'"]',{timeout:10000});
      const visible=await page.locator('#view > .rf-tab-intro').isVisible();
      assert.equal(visible,true,'Future intro missing for '+view);
    }
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
    assert.ok(overflow<=2,'Horizontal overflow in '+view+': '+overflow);
    if(view==='learning'){
      await page.waitForSelector('#ruLessonFlow',{state:'visible',timeout:10000});
    }else{
      await page.waitForFunction(()=>!document.getElementById('ruLessonFlow'),null,{timeout:10000});
    }
    const lessonFlow=await page.evaluate(()=>{
      const el=document.getElementById('ruLessonFlow');
      if(!el)return null;
      const rect=el.getBoundingClientRect();
      return {height:rect.height,steps:el.querySelectorAll('[data-ru-flow-step]').length,labels:[...el.querySelectorAll('[data-ru-flow-step] b')].map(x=>x.textContent.trim()),hasFooter:Boolean(el.querySelector('.ru-flow-foot'))};
    });
    if(view==='learning'){
      assert.ok(lessonFlow&&lessonFlow.height>=56&&lessonFlow.height<=80,'Lesson-detail stepper must stay within the 56–80px compact target');
      assert.equal(lessonFlow.steps,5,'Lesson detail must expose exactly five learner-facing macro steps');
      assert.deepEqual(lessonFlow.labels,['Nghe','Nhận diện','Viết','Thực hành','Kiểm tra'],'Lesson-detail macro step order drifted');
      assert.equal(lessonFlow.hasFooter,false,'Lesson-detail stepper must not become a dashboard-like footer flow');
    }else{
      assert.equal(lessonFlow,null,'Specialized tab '+view+' must put its own learning content first instead of prepending Learning Flow');
    }
    if(view==='media'){
      await page.waitForSelector('.step54-listening-plan',{state:'visible',timeout:10000});
      const mediaFlow=await page.evaluate(()=>({
        tasks:[...document.querySelectorAll('.step54-listening-plan article')].map(x=>x.textContent||''),
        speakRoute:document.querySelector('.v1256-media-actions [data-route]')?.dataset.route||'',
        startLabel:document.querySelector('[data-act="media-start-listening"]')?.textContent?.trim()||'',
        sourceNotice:document.querySelector('.media-empty-player')?.textContent||'',
        practiceRoute:document.querySelector('.v1256-media-actions .btn.primary[data-route]')?.dataset.route||'',
        searchAction:document.querySelector('.v1256-media-actions a[target="_blank"]')?.textContent?.trim()||'',
        playableCount:document.querySelectorAll('[data-media-listen-target="1"] iframe,[data-media-listen-target="1"] audio,[data-media-listen-target="1"] video').length,
        planHeight:document.querySelector('.step54-listening-plan')?.getBoundingClientRect().height||0
      }));
      assert.equal(mediaFlow.tasks.length,4,'Video learning flow must keep four bounded steps');
      for(const label of ['Trước khi xem','Lượt nghe đầu','Lượt nghe lại','Sau khi xem'])assert.equal(mediaFlow.tasks.some(x=>x.includes(label)),true,'Video flow missing '+label);
      assert.match(mediaFlow.speakRoute,/"view":"learning"/,'Video must link into the core Nghe & Nói learning route');
      assert.match(mediaFlow.speakRoute,/"learnTab":"practice"/,'Video must enter the speaking practice tab directly');
      assert.equal(mediaFlow.playableCount,0,'Default YouTube search suggestion is not an embedded lesson');
      assert.equal(mediaFlow.startLabel,'','Search-only sources must not offer a fake Start Listening player action');
      assert.match(mediaFlow.sourceNotice,/gợi ý tìm kiếm, không phải video hoặc âm thanh đã được chọn/i,'Unverified search results must disclose non-playability');
      assert.match(mediaFlow.searchAction,/Tìm video bên ngoài/,'Search-only source must offer an honest external discovery action');
      assert.match(mediaFlow.practiceRoute,/"view":"learning"/,'Primary Listen action must open an existing practice route');
      assert.match(mediaFlow.practiceRoute,/"learnTab":"practice"/,'Primary Listen action must open the listening-speaking practice tab');
      assert.ok(mediaFlow.planHeight<120,'Four-step Video flow must remain a compact guide instead of four dashboard cards');
      await page.locator('.v1256-media-actions .btn.primary[data-route]').click();
      await page.waitForSelector('#view > .rf-tab-intro[data-view="learning"]',{timeout:10000});
      assert.ok(await page.locator('[data-act="speak-line"]').count()>0,'One-tap listening practice must expose an existing audio/playback control');
      await page.click('#nav [data-view="media"]');
      await page.waitForSelector('.step54-listening-plan',{state:'visible',timeout:10000});
    }
    if(view==='learning'){
      await page.waitForSelector('.transcript-listen-first',{state:'visible',timeout:10000});
      assert.equal(await page.locator('[data-act="toggle-vi"]').isDisabled(),true,'Translation control must stay disabled before transcript reveal');
      const beforeListen=await page.evaluate(()=>window.__RF_SPEECH.count);
      await page.locator('[data-act="speak-line"]').click();
      await page.waitForFunction(before=>window.__RF_SPEECH.count>before,beforeListen,{timeout:5000});
      await page.locator('[data-act="toggle-transcript"]').click();
      await page.waitForFunction(()=>/[А-Яа-яЁё]/.test(document.querySelector('.speech-content-board .russian-line')?.textContent||''),null,{timeout:10000});
      assert.equal(await page.locator('.transcript-listen-first').count(),0,'Listening activity must reveal transcript only after learner action');
      assert.equal(await page.locator('[data-act="toggle-vi"]').isDisabled(),false,'Translation control may unlock only after transcript reveal');
      assert.equal(await page.locator('.speech-content-board p').count(),0,'Vietnamese meaning must remain hidden when transcript is first revealed');
      for(const action of ['speak-line','speak-line-slow','record-line'])assert.equal(await page.locator('[data-act="'+action+'"]').count()>0,true,'Speaking primary action missing: '+action);
      assert.match(await page.locator('[data-act="record-line"]').first().innerText(),/Nhận giọng nói|Transcript|ASR/i,'Speaking ASR action must be labeled as recognition/transcript, not local recording');
      for(const action of ['self-record-start','self-record-stop','self-record-play','self-record-clear']){
        assert.ok(await page.locator('[data-act="'+action+'"]').first().count()>0,'Offline self-replay control missing: '+action);
      }
      assert.match(await page.locator('.prea0-self-replay-note').first().innerText(),/Không tự chấm phát âm/);
      const transientChecks=await page.evaluate(()=>{
        const engine=window.RussianRecordingEngine;
        const html=document.querySelector('.prea0-self-replay');
        return {status:engine?.status?.(),clear:typeof engine?.clear,owner:html?.getAttribute('aria-label'),
          hasLocalAudio:!!document.querySelector('[data-act="self-record-play"]')};
      });
      assert.equal(transientChecks.clear,'function');
      assert.match(transientChecks.owner||'',/Tự ghi âm và đối chiếu/);
      assert.equal(transientChecks.hasLocalAudio,true);
      const recorderCapability=await page.evaluate(()=>({
        present:typeof window.RussianRecordingEngine==='object',
        start:typeof window.RussianRecordingEngine?.start==='function',
        stop:typeof window.RussianRecordingEngine?.stop==='function',
        status:typeof window.RussianRecordingEngine?.status==='function'
      }));
      assert.deepEqual(recorderCapability,{present:true,start:true,stop:true,status:true},'Canonical local recording engine must be available independently from ASR; coach visibility is validated in its speaking-specific gate');
      // A learner can change role/turn while the old Web Speech recognizer is
      // still pending. Neither its late final result nor its onEnd may mutate
      // learner evidence or the state of the newly selected turn.
      await page.evaluate(()=>{
        const previous=window.SpeechRecognition;
        const instances=[];
        class MockSpeechSession{
          start(){this.started=true;instances.push(this)}
          abort(){this.aborted=true}
          stop(){this.stopped=true;this.onend?.()}
        }
        window.__RU_TURN_ASR={previous,instances};
        window.SpeechRecognition=MockSpeechSession;
      });
      const asrSignalCount=async()=>page.evaluate(()=>{
        const stored=JSON.parse(localStorage.getItem(window.SUBJECT_ADAPTER.storageKey)||'{}');
        return Object.values(stored.practiceSpeechResults||{}).filter(row=>row?.signalType==='asr_transcript_similarity').length;
      });
      const priorSignalCount=await asrSignalCount();
      await page.locator('[data-act="record-line"]').first().click();
      assert.equal(await page.evaluate(()=>window.__RU_TURN_ASR.instances.length),1,'First Pre-A0 recognition attempt must start');
      await page.evaluate(()=>{window.__RU_TURN_ASR.staleResult=window.__RU_TURN_ASR.instances[0].onresult});
      await page.locator('[data-act="role-a"]').first().click();
      await page.evaluate(()=>{
        window.__RU_TURN_ASR.staleResult?.({results:[{0:{transcript:'СТАРАЯ ФРАЗА',confidence:.99},isFinal:true}]});
      });
      const abandoned=await page.evaluate(()=>{
        const obj=window.__RU_TURN_ASR;
        const state=JSON.parse(localStorage.getItem(window.SUBJECT_ADAPTER.storageKey)||'{}');
        return {aborted:obj.instances[0]?.aborted===true,
          recording:state.speechRecording,
          signals:Object.values(state.practiceSpeechResults||{}).filter(row=>row?.signalType==='asr_transcript_similarity').length};
      });
      assert.equal(abandoned.aborted,true,'Role change must abort old speech recognizer');
      assert.equal(abandoned.recording,false,'Role change must clear offline active-mic marker');
      assert.equal(abandoned.signals,priorSignalCount,'Late old-turn ASR must not create learner evidence');

      await page.locator('[data-act="record-line"]').first().click();
      assert.equal(await page.evaluate(()=>window.__RU_TURN_ASR.instances.length),2);
      await page.evaluate(()=>{
        window.__RU_TURN_ASR.instances[1].onresult?.({results:[{
          0:{transcript:'Где метро?',confidence:.6},isFinal:true
        }]});
      });
      await page.waitForFunction(previous=>{
        const state=JSON.parse(localStorage.getItem(window.SUBJECT_ADAPTER.storageKey)||'{}');
        return Object.values(state.practiceSpeechResults||{}).filter(r=>r?.signalType==='asr_transcript_similarity').length===previous+1
          &&state.speechRecording===false;
      },priorSignalCount,{timeout:10000});
      const evidence=await page.evaluate(()=>{
        const state=JSON.parse(localStorage.getItem(window.SUBJECT_ADAPTER.storageKey)||'{}');
        return Object.values(state.practiceSpeechResults||{}).find(r=>r?.signalType==='asr_transcript_similarity');
      });
      assert.equal(evidence?.ok,false,'ASR text similarity cannot certify spoken proficiency');
      assert.equal(evidence?.signalOnly,true,'ASR remains supporting evidence only');
      assert.equal(evidence?.providerConfidence,.6);
      // Explicit learner self-check takes precedence over any ASR attempt that
      // is still in-flight. Neither a late final nor a late error can overwrite it.
      await page.locator('[data-act="record-line"]').first().click();
      assert.equal(await page.evaluate(()=>window.__RU_TURN_ASR.instances.length),3);
      await page.evaluate(()=>{window.__RU_TURN_ASR.manualLate=window.__RU_TURN_ASR.instances[2].onresult});
      await page.locator('[data-act="mark-line-ok"]').first().click();
      await page.evaluate(()=>{
        window.__RU_TURN_ASR.manualLate?.({results:[{0:{transcript:'ПОЗДНИЙ ОТВЕТ',confidence:.99},isFinal:true}]});
      });
      const manualPriority=await page.evaluate(()=>{
        const instance=window.__RU_TURN_ASR.instances[2];
        const state=JSON.parse(localStorage.getItem(window.SUBJECT_ADAPTER.storageKey)||'{}');
        return {aborted:instance.aborted===true,recording:state.speechRecording,
          manual:Object.values(state.practiceSpeechResults||{}).find(r=>r?.signalType==='self-confirmation')||null};
      });
      assert.equal(manualPriority.aborted,true,'Self-confirmation must cancel pending recognition');
      assert.equal(manualPriority.recording,false,'Self-check must clear recording status');
      assert.equal(manualPriority.manual?.manual,true,'Late ASR cannot override explicit learner self-check');
      assert.equal(manualPriority.manual?.score,null,'Self-check must never become a synthetic pronunciation score');
      await page.evaluate(()=>{
        const obj=window.__RU_TURN_ASR;
        if(obj.previous===undefined)delete window.SpeechRecognition;
        else window.SpeechRecognition=obj.previous;
        delete window.__RU_TURN_ASR;
      });
      await page.locator('[data-act="toggle-transcript"]').click();
      await page.waitForSelector('.transcript-listen-first',{state:'visible',timeout:10000});
      assert.match(await page.locator('[data-act="mark-line-ok"]').first().innerText(),/tự đối chiếu/i,'Manual speaking button must not pose as graded pronunciation');
      await page.locator('[data-act="mark-line-ok"]').first().click();
      await page.waitForFunction(()=>/Tự xác nhận/.test(document.querySelector('.v1294-feedback-line b')?.textContent||''),null,{timeout:10000});
      const manualSpeech=await page.evaluate(()=>{
        const stored=JSON.parse(localStorage.getItem(window.SUBJECT_ADAPTER.storageKey)||'{}');
        return Object.values(stored.practiceSpeechResults||{}).find(row=>row?.signalType==='self-confirmation')||null;
      });
      assert.ok(manualSpeech&&manualSpeech.manual===true&&manualSpeech.selfConfirmed===true,'Manual attempt must retain self-confirmation provenance');
      assert.equal(manualSpeech.score,null,'Manual speaking cannot fabricate a pronunciation score');
      assert.match(await page.locator('.v1294-feedback-line').innerText(),/chưa chấm phát âm|chưa có đánh giá phát âm/i,'Self-confirmed speech must disclose independent review is absent');
      await page.locator('#nav [data-view="overview"]').first().click();
      await page.waitForSelector('.rf-module-speak',{state:'visible',timeout:10000});
      const speakingLabel=await page.locator('.rf-module-speak').getAttribute('aria-label');
      assert.match(speakingLabel||'',/lượt tự xác nhận/i,'Home speaking icon must label self-reports without calling them external feedback');
      assert.doesNotMatch(speakingLabel||'',/lượt có phản hồi|điểm phát âm/i,'Home speaking icon cannot present self-assessment as externally graded feedback');
    }
    if(view==='grammar'){
      await page.waitForSelector('.grammar-main-card .grammar-examples-first',{state:'visible',timeout:10000});
      await page.waitForSelector('.grammar-main-card .grammar-pattern-strip',{state:'visible',timeout:10000});
      await page.waitForSelector('.grammar-main-card .grammar-rule-short',{state:'visible',timeout:10000});
      await page.waitForSelector('.grammar-main-card .grammar-practice-now',{state:'visible',timeout:10000});
      const grammarOrder=await page.evaluate(()=>{
        const main=document.querySelector('.grammar-main-card');
        const examples=main?.querySelector('.grammar-examples-first');
        const pattern=main?.querySelector('.grammar-pattern-strip');
        const rule=main?.querySelector('.grammar-rule-short');
        const practice=main?.querySelector('.grammar-practice-now');
        const details=main?.querySelector('.grammar-concept-details');
        const pos=el=>el?[...main.children].indexOf(el):-1;
        return {examples:pos(examples),pattern:pos(pattern),rule:pos(rule),practice:pos(practice),details:pos(details),detailsOpen:Boolean(details?.open),exampleRu:[...main.querySelectorAll('.grammar-examples-first article b')].some(el=>/[А-Яа-яЁё]/.test(el.textContent||''))};
      });
      assert.ok(grammarOrder.examples>=0&&grammarOrder.examples<grammarOrder.pattern&&grammarOrder.pattern<grammarOrder.rule&&grammarOrder.rule<grammarOrder.practice&&grammarOrder.practice<grammarOrder.details,'Grammar hierarchy must be examples → pattern → short rule → practice → deeper explanation');
      assert.equal(grammarOrder.detailsOpen,false,'Deeper grammar explanation must start collapsed');
      assert.equal(grammarOrder.exampleRu,true,'Grammar example-first surface must contain Russian examples');
      await page.locator('.grammar-concept-details summary').click();
      await page.waitForFunction(()=>document.querySelector('.grammar-concept-details')?.open===true,null,{timeout:5000});
      assert.equal(await page.locator('.grammar-concept-details .grammar-core-grid').isVisible(),true,'Deeper grammar explanation must reveal on demand');
    }
    if(view==='vocab'){
      await page.waitForFunction(()=>window.RussianLearningSearch?.isVocabularyLoaded?.()===true,null,{timeout:30000});
      assert.equal(await page.evaluate(()=>window.RussianLearningSearch?.isVocabularyLoaded?.()),true,'Vocabulary dataset must load on demand when Vocabulary opens');
      const details=page.locator('.vocab-studio details.vocab-progressive-details');
      await details.waitFor({state:'attached',timeout:10000});
      assert.equal(await details.evaluate(el=>el.open),false,'Vocabulary advanced details must start collapsed');
      await details.locator('summary').click();
      await page.waitForSelector('.vocab-studio .v1310-vocab-detail',{state:'visible',timeout:10000});
      const immersion=await page.evaluate(()=>{
        const paragraphs=[...document.querySelectorAll('.v1310-vocab-detail article p')].map(el=>el.textContent.trim());
        const vietnamese=/[ăâđêôơưáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;
        const visual=document.querySelector('.v1310-flash .visual-symbols');
        return {
          paragraphs,
          hasVietnamese:paragraphs.some(text=>vietnamese.test(text)),
          allRussianContext:paragraphs.every(text=>/[А-Яа-яЁё]/.test(text)),
          visualChildren:visual?.children?.length||0
        };
      });
      assert.equal(immersion.paragraphs.length,3,'Vocab immersion detail must keep three contextual learning blocks');
      assert.equal(immersion.hasVietnamese,false,'Vocab learning content must not display Vietnamese translation/explanation');
      assert.equal(immersion.allRussianContext,true,'Vocab contextual learning blocks must stay in Russian');
      assert.ok(immersion.visualChildren>=1,'Vocab card must keep an image or visual-symbol cue');
      const beforeAudio=await page.evaluate(()=>({speech:window.__RF_SPEECH.count,audio:window.__RF_AUDIO.count}));
      await page.locator('[data-act="speak-vocab"]').click();
      const normalAudio=await page.evaluate(()=>({speech:window.__RF_SPEECH,audio:window.__RF_AUDIO}));
      const normalUsesTts=normalAudio.speech.count>beforeAudio.speech;
      const normalUsesSource=normalAudio.audio.count>beforeAudio.audio;
      assert.ok(normalUsesTts||normalUsesSource,'Vocabulary audio must use source audio or Russian TTS fallback');
      const normalRate=normalUsesSource?normalAudio.audio.last?.rate:normalAudio.speech.last?.rate;
      if(normalUsesTts){
        assert.equal(normalAudio.speech.last?.lang,'ru-RU','Vocabulary TTS must use Russian locale');
        assert.match(normalAudio.speech.last?.text||'',/[А-Яа-яЁё]/,'Vocabulary TTS must speak Russian text');
      }
      const beforeSlow=await page.evaluate(()=>({speech:window.__RF_SPEECH.count,audio:window.__RF_AUDIO.count}));
      await page.locator('[data-act="speak-vocab-slow"]').click();
      const slowAudio=await page.evaluate(()=>({speech:window.__RF_SPEECH,audio:window.__RF_AUDIO}));
      const slowUsesTts=slowAudio.speech.count>beforeSlow.speech;
      const slowUsesSource=slowAudio.audio.count>beforeSlow.audio;
      assert.ok(slowUsesTts||slowUsesSource,'Slow vocabulary audio must use the same source/TTS audio path');
      const slowRate=slowUsesSource?slowAudio.audio.last?.rate:slowAudio.speech.last?.rate;
      assert.ok(Number(slowRate)<Number(normalRate),'Slow vocabulary audio must actually reduce playback rate');
      const identity=await page.evaluate(()=>{
        const panel=document.querySelector('.vocab-card-panel,.v1310-vocab-main');
        return {key:panel?.dataset.vocabKey||'',sourceIndex:Number(panel?.dataset.vocabSourceIndex),stageIndex:Number(panel?.dataset.vocabStageIndex),term:panel?.dataset.vocabTerm||''};
      });
      assert.ok(identity.key,'Vocabulary card must expose a stable source key');
      assert.ok(Number.isFinite(identity.sourceIndex)&&Number.isFinite(identity.stageIndex),'Vocabulary card must expose canonical source and stage indices');
      await page.waitForFunction(key=>Boolean(window.RussianVocabSrs?.get?.().cards?.['vocab-id:'+key]),identity.key,{timeout:10000});
      await page.evaluate(({term})=>{
        const b=document.createElement('button');b.hidden=true;b.dataset.route=JSON.stringify({view:'vocab',vocabQuery:term,vocabKey:'',vocabIndex:0});document.body.appendChild(b);b.click();b.remove();
      },identity);
      await page.waitForFunction(key=>document.querySelector('.vocab-card-panel,.v1310-vocab-main')?.dataset.vocabKey===key,identity.key,{timeout:10000});
      const filteredIdentity=await page.evaluate(()=>{
        const panel=document.querySelector('.vocab-card-panel,.v1310-vocab-main');
        return {key:panel?.dataset.vocabKey||'',sourceIndex:Number(panel?.dataset.vocabSourceIndex),stageIndex:Number(panel?.dataset.vocabStageIndex)};
      });
      assert.equal(filteredIdentity.key,identity.key,'Vocabulary identity must survive query filtering');
      assert.equal(filteredIdentity.sourceIndex,identity.sourceIndex,'Canonical vocabulary source index must survive query filtering');
      assert.equal(filteredIdentity.stageIndex,identity.stageIndex,'Stage-relative vocabulary index must survive query filtering');
      await page.evaluate(({stageIndex})=>{
        const b=document.createElement('button');b.hidden=true;b.dataset.route=JSON.stringify({view:'vocab',vocabQuery:'',vocabKey:'',vocabIndex:stageIndex});document.body.appendChild(b);b.click();b.remove();
      },identity);
      await page.waitForFunction(key=>document.querySelector('.vocab-card-panel,.v1310-vocab-main')?.dataset.vocabKey===key,identity.key,{timeout:10000});
      const library=page.locator('.vocab-library-toolbar');
      await library.waitFor({state:'visible',timeout:10000});
      const libraryLayout=await page.evaluate(()=>{
        const desk=document.querySelector('.vocab-desk')?.getBoundingClientRect();
        const toolbar=document.querySelector('.vocab-library-toolbar')?.getBoundingClientRect();
        return {deskBottom:desk?.bottom||0,toolbarTop:toolbar?.top||0,flowSteps:document.querySelectorAll('.ru-vocab-flow-nav [data-ru-vocab-mode]').length};
      });
      assert.ok(libraryLayout.toolbarTop>=libraryLayout.deskBottom-2,'Vocabulary library/filter controls must sit below the main learning surface');
      assert.equal(libraryLayout.flowSteps,7,'Vocabulary learning flow must expose exactly seven canonical evidence steps');
      const topicLabels=await library.locator('[data-input="vocabTopic"] option').allTextContents();
      assert.ok(topicLabels.length>1,'Vocabulary library must expose curated topic choices for the current stage');
      assert.equal(topicLabels.some(x=>/graduate_path|microtask|category_/i.test(x)),false,'Vocabulary library must not expose raw metadata tags');
      const statusLabels=await library.locator('[data-input="vocabStatus"] option').allTextContents();
      for(const label of ['Đang học','Cần ôn','Đã học'])assert.ok(statusLabels.includes(label),'Vocabulary library missing learner-facing filter: '+label);
      const beforeRating=await page.evaluate(key=>window.RussianVocabSrs?.get?.().cards?.['vocab-id:'+key]||null,identity.key);
      assert.ok(beforeRating?.exposedAt,'Opening the vocabulary card must record exposure evidence');
      assert.equal(Number(beforeRating?.reviewCount||0),0,'Opening the vocabulary card must not create learned/review evidence');
      await library.locator('[data-input="vocabStatus"]').selectOption('learning');
      await page.waitForFunction(()=>document.querySelector('[data-input="vocabStatus"]')?.value==='learning'&&Boolean(document.querySelector('.vocab-card-panel,.v1310-vocab-main')),null,{timeout:10000});
      assert.equal(await page.evaluate(()=>document.querySelector('.vocab-card-panel,.v1310-vocab-main')?.dataset.vocabKey||''),identity.key,'In-progress filter must retain an exposed but unreviewed card');
      await page.evaluate(()=>window.RussianVocabSrs?.rate?.('recalled'));
      await page.waitForFunction(key=>Number(window.RussianVocabSrs?.get?.().cards?.['vocab-id:'+key]?.reviewCount||0)>0,identity.key,{timeout:10000});
      await library.locator('[data-input="vocabStatus"]').selectOption('learned');
      await page.waitForFunction(()=>document.querySelector('[data-input="vocabStatus"]')?.value==='learned'&&Boolean(document.querySelector('.vocab-card-panel,.v1310-vocab-main')),null,{timeout:10000});
      const learnedState=await page.evaluate(()=>({rows:document.querySelectorAll('.vocab-mini-row').length,key:document.querySelector('.vocab-card-panel,.v1310-vocab-main')?.dataset.vocabKey||''}));
      assert.ok(learnedState.rows>=1,'SRS learned filter must retain vocabulary only after real recalled-review evidence');
      assert.equal(learnedState.key,identity.key,'SRS learned filter must preserve the reviewed card identity');
      await page.locator('[data-input="vocabStatus"]').selectOption('all');
      await page.waitForFunction(()=>document.querySelector('[data-input="vocabStatus"]')?.value==='all',null,{timeout:10000});
    }
  }

  // PASS 8: lesson Check is a bounded 3–5 question Mini Check, not the full Review bank.
  await page.click('#nav [data-view="learning"][data-learn="practice"]');
  await page.waitForSelector('#ruLessonFlow [data-ru-flow-step="check"]',{timeout:10000});
  const miniLesson=await page.evaluate(()=>document.querySelector('#ruLessonFlow .ru-flow-head > span')?.textContent?.replace(/^LESSON\s*·\s*/,'').trim()||'');
  await page.locator('#ruLessonFlow [data-ru-flow-step="check"]').click();
  await page.waitForSelector('.review-studio',{state:'visible',timeout:30000});
  await page.waitForFunction(()=>document.querySelector('.assessment-title-line .chip')?.textContent?.includes('MINI CHECK'),null,{timeout:10000});
  const miniCheck=await page.evaluate(()=>({
    chip:document.querySelector('.assessment-title-line .chip')?.textContent?.trim()||'',
    lesson:document.querySelector('[data-input="reviewLesson"]')?.value||'',
    count:Number((document.querySelector('.assessment-title-line > b')?.textContent||'').match(/\/(\d+)/)?.[1]||0)
  }));
  assert.ok(miniCheck.count>=3&&miniCheck.count<=5,'Lesson Mini Check must contain 3–5 real lesson questions');
  assert.equal(miniCheck.lesson,miniLesson,'Lesson Mini Check must remain scoped to the lesson that launched it');
  assert.match(miniCheck.chip,/MINI CHECK/,'Lesson Check must be visibly distinct from full Review');

  await page.click('#nav [data-view="overview"]');
  await page.waitForSelector('.rf-dashboard');
  await page.screenshot({path:path.join(OUT,'russian-future-overview-1672x941.png'),fullPage:true});

  const responsive={};
  for(const width of [1280,1024,768]){
    await page.setViewportSize({width,height:900});
    await page.waitForTimeout(140);
    responsive[width]=await page.evaluate(()=>{
      const sidebar=document.querySelector('.ru-sidebar')?.getBoundingClientRect();
      const view=document.querySelector('.ru-view')?.getBoundingClientRect();
      const report=document.querySelector('.rf-personal-report-grid');
      return {
        vw:innerWidth,
        scroll:document.documentElement.scrollWidth,
        reportColumns:report?getComputedStyle(report).gridTemplateColumns:'',
        sidebarW:sidebar?.width||0,
        sidebarPosition:getComputedStyle(document.querySelector('.ru-sidebar')).position,
        viewW:view?.width||0,
        drawerToggleVisible:getComputedStyle(document.querySelector('.rf-sidebar-toggle')).display!=='none'
      };
    });
    assert.ok(responsive[width].scroll<=width+2,'Responsive horizontal overflow at '+width+'px');
    assert.ok(responsive[width].reportColumns.split(' ').filter(Boolean).length>=2,'Personal report must remain at least two columns at '+width+'px');
    assert.ok(responsive[width].sidebarW>=216&&responsive[width].sidebarW<=224,'Desktop/tablet sidebar must remain within 216–224px at '+width+'px');
    assert.equal(responsive[width].drawerToggleVisible,false,'Drawer toggle must stay hidden at '+width+'px');
    assert.equal(await page.locator('.rf-mobile-dock').isVisible(),false,'Bottom app dock must stay hidden at tablet/desktop '+width+'px');
  }

  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(140);
  const toggle=page.locator('.rf-sidebar-toggle');
  await toggle.waitFor({state:'visible',timeout:5000});
  const mobileBefore=await page.evaluate(()=>({
    scroll:document.documentElement.scrollWidth,
    vw:innerWidth,
    open:document.body.classList.contains('rf-sidebar-open'),
    expanded:document.querySelector('.rf-sidebar-toggle')?.getAttribute('aria-expanded'),
    sidebarPosition:getComputedStyle(document.querySelector('.ru-sidebar')).position,
    reportColumns:getComputedStyle(document.querySelector('.rf-personal-report-grid')).gridTemplateColumns
  }));
  assert.ok(mobileBefore.scroll<=mobileBefore.vw+2,'Future UI mobile horizontal overflow');
  assert.equal(mobileBefore.open,false,'Mobile learning drawer must start closed');
  assert.equal(mobileBefore.expanded,'false','Mobile drawer ARIA state must start collapsed');
  assert.equal(mobileBefore.sidebarPosition,'fixed','Mobile navigation must use an off-canvas drawer');
  assert.equal(mobileBefore.reportColumns.split(' ').filter(Boolean).length,1,'Personal report must collapse to one column on 390px mobile');
  const dock=page.locator('.rf-mobile-dock');
  await dock.waitFor({state:'visible',timeout:5000});
  assert.equal(await page.locator('.rf-mobile-dock').count(),1,'Mobile dock must be created only once');
  assert.deepEqual(await dock.locator('button').allTextContents(),['Trang chủ','Nghe','Nói','Từ vựng','Thêm'],'Mobile dock must expose five predictable shortcuts');
  assert.equal(await dock.locator('svg[aria-hidden="true"]').count(),5,'Dock icons are decorative, with readable text labels');
  const dockGeometry=await dock.locator('button').evaluateAll(buttons=>buttons.map(button=>({w:button.getBoundingClientRect().width,h:button.getBoundingClientRect().height,bottom:button.getBoundingClientRect().bottom})));
  assert.ok(dockGeometry.every(x=>x.w>=44&&x.h>=44&&x.bottom<=(page.viewportSize()?.height||844)+1),'All dock touch targets must remain visible and >=44px');
  assert.equal(await dock.locator('[data-rf-dock="home"]').getAttribute('aria-current'),'page','Home must be the default selected dock route');
  await toggle.click();
  await page.waitForFunction(()=>document.body.classList.contains('rf-sidebar-open'));
  assert.equal(await toggle.getAttribute('aria-expanded'),'true','Opening drawer must update aria-expanded');
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.body.classList.contains('rf-sidebar-open'));
  assert.equal(await page.evaluate(()=>document.activeElement?.classList.contains('rf-sidebar-toggle')),true,'Escape must restore focus to drawer toggle');
  for(const [key,view,learn] of [['listen','media',''],['speak','learning','practice'],['vocab','vocab',''],['home','overview','']]){
    await dock.locator('[data-rf-dock="'+key+'"]').click();
    await page.waitForFunction(([v,l])=>[...document.querySelectorAll('#nav button.active[data-view]')].some(b=>b.dataset.view===v&&(!l||b.dataset.learn===l)),[view,learn],{timeout:10000});
    await page.waitForFunction(id=>document.querySelector('.rf-mobile-dock [data-rf-dock="'+id+'"]')?.getAttribute('aria-current')==='page',key,{timeout:5000});
  }
  await dock.locator('[data-rf-menu]').click();
  await page.waitForFunction(()=>document.body.classList.contains('rf-sidebar-open'));
  assert.equal(await dock.locator('[data-rf-menu]').getAttribute('aria-expanded'),'true','More button must expose its drawer-open state');
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.body.classList.contains('rf-sidebar-open'));
  await page.setViewportSize({width:320,height:720});
  const narrow=await page.evaluate(()=>({vw:innerWidth,scroll:document.documentElement.scrollWidth,dock:document.querySelector('.rf-mobile-dock')?.getBoundingClientRect().width,items:document.querySelectorAll('.rf-mobile-dock button').length}));
  assert.equal(narrow.items,5,'Narrow phone must preserve navigation shortcuts');
  assert.ok(narrow.scroll<=narrow.vw+2&&narrow.dock<=narrow.vw+1,'320px phone must not horizontally overflow');
  await page.setViewportSize({width:390,height:844});
  await page.waitForSelector('.rf-dashboard');
  const repeatedDock=await page.evaluate(()=>{const before=document.querySelector('.rf-mobile-dock');window.RUSSIAN_FUTURE_UI.upgrade();return{same:before===document.querySelector('.rf-mobile-dock'),count:document.querySelectorAll('.rf-mobile-dock').length}});
  assert.deepEqual(repeatedDock,{same:true,count:1},'Repeated presentation updates must not append or duplicate navigation');
  const mobile=await page.evaluate(()=>({
    scroll:document.documentElement.scrollWidth,
    vw:innerWidth,
    modules:document.querySelectorAll('.rf-module-card').length,
    searchVisible:getComputedStyle(document.querySelector('.ru-global-search-wrap')).display!=='none'
  }));
  assert.ok(mobile.scroll<=mobile.vw+2,'Future UI mobile horizontal overflow after drawer interaction');
  assert.equal(mobile.modules,8);
  assert.ok(await page.locator('.rf-module-card').first().evaluate(el=>el.getBoundingClientRect().height<=125),'Phone launcher remains compact at mobile width');
  assert.equal(mobile.searchVisible,true);
  await page.screenshot({path:path.join(OUT,'russian-future-overview-mobile.png'),fullPage:true});

  assert.deepEqual(errors,[],'Future Russian UI emitted browser errors');
  fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify({status:'PASS',dims,responsive,mobile},null,2));
  console.log('RUSSIAN_FUTURE_UI_BROWSER_PASS');
}finally{await browser?.close()}
