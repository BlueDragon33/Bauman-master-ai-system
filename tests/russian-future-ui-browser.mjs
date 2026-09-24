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
  });

  await page.goto(new URL('subjects/russian/index.html',BASE).href,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('body.ru-future-ui',{timeout:15000});
  await page.waitForSelector('.rf-dashboard .rf-module-card',{timeout:15000});
  // Core can finish one last render after the future enhancer first paints.
  // Wait for the MutationObserver/RAF presentation layer to settle before asserting visible branding.
  await page.waitForFunction(()=>document.getElementById('subjectTitle')?.textContent?.trim()==='Tiếng Nga',null,{timeout:10000});

  assert.equal((await page.locator('#subjectTitle').innerText()).trim(),'Tiếng Nga','Russian-only visible brand drifted');
  assert.match(await page.locator('#subjectSubtitle').innerText(),/Nghe.*Nói.*Đọc.*Viết/);
  assert.equal(await page.locator('.ru-right-rail').count(),0,'Fixed right rail must be absent from the canonical learning shell');

  // Prime one explicit presentation pass and let any already-queued RAF work settle.
  // The measured pass below must still produce zero DOM/class mutations.
  await page.evaluate(async()=>{
    window.RUSSIAN_FUTURE_UI.upgrade();
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  });

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

  const dims=await page.evaluate(()=> {
    const box=s=>{const r=document.querySelector(s)?.getBoundingClientRect();return r?{x:r.x,y:r.y,w:r.width,h:r.height,b:r.bottom}:null};
    const modules=[...document.querySelectorAll('.rf-module-card')].map(el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}});
    return {
      vw:innerWidth,scroll:document.documentElement.scrollWidth,
      sidebar:box('.ru-sidebar'),main:box('.ru-main'),view:box('.ru-view'),hero:box('.overview-top-only-hero'),
      continueCard:box('.rf-continue-card'),today:box('.rf-today-plan'),review:box('.rf-review-now'),path:box('.rf-learning-path'),
      progress:box('.rf-progress-strip'),modules,
      bodyFont:parseFloat(getComputedStyle(document.querySelector('.ru-view')).fontSize),
      viewComputed:{maxWidth:getComputedStyle(document.querySelector('.ru-view')).maxWidth,width:getComputedStyle(document.querySelector('.ru-view')).width,boxSizing:getComputedStyle(document.querySelector('.ru-view')).boxSizing},
      shellComputed:{columns:getComputedStyle(document.querySelector('.ru-app-shell')).gridTemplateColumns,mainWidth:getComputedStyle(document.querySelector('.ru-main')).width}
    };
  });
  assert.ok(dims.sidebar&&dims.sidebar.w>=205&&dims.sidebar.w<=235,'Sidebar width must stay close to 220px reference');
  assert.ok(dims.main&&dims.main.w>1300,'Main shell must still use space released by the old right rail');
  assert.ok(dims.view&&dims.view.w<=1122&&dims.view.w>=1080,'Learning content container must stay near the 1120px canonical max-width: '+JSON.stringify({view:dims.view,viewComputed:dims.viewComputed,shell:dims.shellComputed}));
  assert.ok(dims.bodyFont>=15,'Primary learning content must not fall below 15px body text');
  assert.ok(dims.hero&&dims.hero.h>=210&&dims.hero.h<=235,'Overview hero must stay compact enough to expose learner action above the fold');
  assert.ok(dims.continueCard&&dims.continueCard.y>dims.hero.y&&dims.continueCard.y<dims.hero.b+50,'Continue Learning must follow the compact hero immediately');
  assert.ok(dims.today&&dims.review&&Math.abs(dims.today.y-dims.review.y)<3,'Today and truthful review status must share the next decision row');
  assert.ok(dims.path&&dims.path.y>dims.today.y,'Compact Learning Path must follow the primary learning actions');
  assert.ok(dims.progress&&dims.progress.y>dims.path.y,'Secondary statistics must appear after the learning path');
  assert.equal(dims.modules.length,5,'Overview must contain exactly five core module cards');
  const moduleRows=[...new Set(dims.modules.map(x=>Math.round(x.y)))];
  assert.ok(moduleRows.length>=3,'Five skill cards must wrap to at most two columns instead of one dense five-card row');
  assert.ok(Math.min(...dims.modules.map(x=>x.w))>450,'Desktop skill cards must remain readable at the canonical two-column width');
  assert.ok(dims.scroll<=dims.vw+2,'Future Russian UI must not horizontally overflow at reference viewport');

  const dashboardText=await page.locator('.rf-dashboard').innerText();
  for(const label of ['HỌC TIẾP','CẦN ÔN','Hôm nay','5 kỹ năng chính','Video','Nghe & Nói','Luyện chữ','Từ vựng','Ngữ pháp','Learning Path','Khởi động','Âm & chữ','Nghe nói cơ bản','A1','A2 / Dự bị','Tiếng Nga học thuật']){
    assert.ok(dashboardText.includes(label),'Overview summary missing '+label);
  }
  assert.equal(await page.locator('.rf-module-progress').count(),5,'Each core skill card must expose one truthful progress/evidence line');
  assert.equal(await page.locator('.rf-road-step').count(),6,'Overview Learning Path must contain exactly six canonical stages');
  assert.equal(await page.locator('.rf-road-step[aria-current="step"]').count(),1,'Learning Path must expose one current stage');
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
        planHeight:document.querySelector('.step54-listening-plan')?.getBoundingClientRect().height||0
      }));
      assert.equal(mediaFlow.tasks.length,4,'Video learning flow must keep four bounded steps');
      for(const label of ['Trước khi xem','Lượt nghe đầu','Lượt nghe lại','Sau khi xem'])assert.equal(mediaFlow.tasks.some(x=>x.includes(label)),true,'Video flow missing '+label);
      assert.match(mediaFlow.speakRoute,/"view":"learning"/,'Video must link into the core Nghe & Nói learning route');
      assert.match(mediaFlow.speakRoute,/"learnTab":"practice"/,'Video must enter the speaking practice tab directly');
      assert.match(mediaFlow.startLabel,/Bắt đầu nghe/,'Video above-the-fold must expose a clear start-listening CTA');
      assert.ok(mediaFlow.planHeight<120,'Four-step Video flow must remain a compact guide instead of four dashboard cards');
      await page.locator('[data-act="media-start-listening"]').click();
      assert.equal(await page.evaluate(()=>Boolean(document.activeElement?.closest?.('[data-media-listen-target="1"]')||document.activeElement?.matches?.('[data-media-listen-target="1"]'))),true,'Start-listening CTA must move focus into the player in one action');
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
      assert.match(await page.locator('[data-act="record-line"]').first().innerText(),/Bắt đầu nói|Ghi âm/,'Speaking must expose recording as an explicit primary action');
      await page.locator('[data-act="toggle-transcript"]').click();
      await page.waitForSelector('.transcript-listen-first',{state:'visible',timeout:10000});
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
      return {
        vw:innerWidth,
        scroll:document.documentElement.scrollWidth,
        sidebarW:sidebar?.width||0,
        sidebarPosition:getComputedStyle(document.querySelector('.ru-sidebar')).position,
        viewW:view?.width||0,
        drawerToggleVisible:getComputedStyle(document.querySelector('.rf-sidebar-toggle')).display!=='none'
      };
    });
    assert.ok(responsive[width].scroll<=width+2,'Responsive horizontal overflow at '+width+'px');
    assert.ok(responsive[width].sidebarW>=216&&responsive[width].sidebarW<=224,'Desktop/tablet sidebar must remain within 216–224px at '+width+'px');
    assert.equal(responsive[width].drawerToggleVisible,false,'Drawer toggle must stay hidden at '+width+'px');
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
    sidebarPosition:getComputedStyle(document.querySelector('.ru-sidebar')).position
  }));
  assert.ok(mobileBefore.scroll<=mobileBefore.vw+2,'Future UI mobile horizontal overflow');
  assert.equal(mobileBefore.open,false,'Mobile learning drawer must start closed');
  assert.equal(mobileBefore.expanded,'false','Mobile drawer ARIA state must start collapsed');
  assert.equal(mobileBefore.sidebarPosition,'fixed','Mobile navigation must use an off-canvas drawer');
  await toggle.click();
  await page.waitForFunction(()=>document.body.classList.contains('rf-sidebar-open'));
  assert.equal(await toggle.getAttribute('aria-expanded'),'true','Opening drawer must update aria-expanded');
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.body.classList.contains('rf-sidebar-open'));
  assert.equal(await page.evaluate(()=>document.activeElement?.classList.contains('rf-sidebar-toggle')),true,'Escape must restore focus to drawer toggle');
  const mobile=await page.evaluate(()=>({
    scroll:document.documentElement.scrollWidth,
    vw:innerWidth,
    modules:document.querySelectorAll('.rf-module-card').length,
    searchVisible:getComputedStyle(document.querySelector('.ru-global-search-wrap')).display!=='none'
  }));
  assert.ok(mobile.scroll<=mobile.vw+2,'Future UI mobile horizontal overflow after drawer interaction');
  assert.equal(mobile.modules,5);
  assert.equal(mobile.searchVisible,true);
  await page.screenshot({path:path.join(OUT,'russian-future-overview-mobile.png'),fullPage:true});

  assert.deepEqual(errors,[],'Future Russian UI emitted browser errors');
  fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify({status:'PASS',dims,responsive,mobile},null,2));
  console.log('RUSSIAN_FUTURE_UI_BROWSER_PASS');
}finally{await browser?.close()}
