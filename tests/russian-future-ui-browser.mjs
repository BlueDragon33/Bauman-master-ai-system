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
    const box=s=>{const r=document.querySelector(s)?.getBoundingClientRect();return r?{x:r.x,y:r.y,w:r.width,h:r.height}:null};
    const modules=[...document.querySelectorAll('.rf-module-card')].map(el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}});
    return {
      vw:innerWidth,scroll:document.documentElement.scrollWidth,
      sidebar:box('.ru-sidebar'),main:box('.ru-main'),view:box('.ru-view'),hero:box('.overview-top-only-hero'),
      progress:box('.rf-progress-strip'),modules,
      lower:box('.rf-dashboard-lower'),
      typography:{
        body:parseFloat(getComputedStyle(document.body).fontSize),
        pageTitle:parseFloat(getComputedStyle(document.getElementById('pageTitle')).fontSize),
        cardTitle:parseFloat(getComputedStyle(document.querySelector('.rf-module-card h4')).fontSize),
        caption:parseFloat(getComputedStyle(document.querySelector('.rf-module-card p')).fontSize)
      }
    };
  });
  const cascade=await page.evaluate(()=>{
    const take=s=>{const el=document.querySelector(s);if(!el)return null;const c=getComputedStyle(el);return {className:el.className,display:c.display,width:c.width,maxWidth:c.maxWidth,minWidth:c.minWidth,padding:c.padding,margin:c.margin,justifySelf:c.justifySelf,gridTemplateColumns:c.gridTemplateColumns,columnGap:c.columnGap,rowGap:c.rowGap,boxSizing:c.boxSizing,fontSize:c.fontSize,zoom:c.zoom,transform:c.transform};};
    return {bodyClass:document.body.className,rootContentMax:getComputedStyle(document.body).getPropertyValue('--rf-content-max').trim(),app:take('.ru-app-shell'),sidebar:take('.ru-sidebar'),main:take('.ru-main'),view:take('.ru-view'),pageTitle:take('#pageTitle'),styles:[...document.styleSheets].map(x=>x.href?.split('/').pop()||'inline')};
  });
  console.log('RUSSIAN_FUTURE_UI_DIMS',JSON.stringify(dims));
  console.log('RUSSIAN_FUTURE_UI_CASCADE',JSON.stringify(cascade));
  assert.ok(dims.sidebar&&dims.sidebar.w>=216&&dims.sidebar.w<=224,'Desktop sidebar must stay within the 216–224px learning-shell contract');
  assert.ok(dims.main&&dims.main.w>1300,'Main learning canvas must use space released by old right rail');
  assert.ok(dims.view&&dims.view.w>=1080&&dims.view.w<=1122,'Desktop content container must stay near the 1120px maximum');
  assert.ok(dims.hero&&dims.hero.h>=275&&dims.hero.h<=315,'Hero height drifted from reference rhythm');
  assert.ok(dims.progress&&dims.progress.h>=70,'Progress strip must remain readable after typography normalization');
  assert.equal(dims.modules.length,5,'Overview must contain exactly five core module cards');
  const moduleRows=[...new Set(dims.modules.map(x=>Math.round(x.y)))];
  assert.ok(moduleRows.length>=3,'Five learning cards must wrap into no more than two columns');
  assert.ok(Math.max(...dims.modules.map(x=>x.w))-Math.min(...dims.modules.map(x=>x.w))<4,'Learning cards must keep balanced widths');
  assert.ok(dims.lower&&dims.lower.w<=1122,'Lower learning content must respect the global content maximum');
  assert.ok(dims.typography.body>=15&&dims.typography.body<=16,'Body typography must remain 15–16px');
  assert.ok(dims.typography.pageTitle>=28&&dims.typography.pageTitle<=32,'Page title typography must remain 28–32px');
  assert.ok(dims.typography.cardTitle>=16&&dims.typography.cardTitle<=18,'Card title typography must remain 16–18px');
  assert.ok(dims.typography.caption>=12&&dims.typography.caption<=13,'Card supporting text must remain 12–13px');
  assert.ok(dims.scroll<=dims.vw+2,'Future Russian UI must not horizontally overflow at reference viewport');

  const dashboardText=await page.locator('.rf-dashboard').innerText();
  for(const label of ['HỌC TIẾP','CẦN ÔN','Kế hoạch hôm nay','5 kỹ năng chính','Video','Nghe & Nói','Luyện chữ','Từ vựng','Ngữ pháp','Ôn tập trọng điểm']){
    assert.ok(dashboardText.includes(label),'Overview summary missing '+label);
  }
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
    await page.waitForSelector('#view > .rf-tab-intro[data-view="'+view+'"]',{timeout:10000});
    const visible=await page.locator('#view > .rf-tab-intro').isVisible();
    assert.equal(visible,true,'Future intro missing for '+view);
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
      return {height:rect.height,steps:el.querySelectorAll('[data-ru-flow-step]').length,hasFooter:Boolean(el.querySelector('.ru-flow-foot'))};
    });
    if(view==='learning'){
      assert.ok(lessonFlow&&lessonFlow.height>=56&&lessonFlow.height<=80,'Lesson-detail stepper must stay within the 56–80px compact target');
      assert.equal(lessonFlow.steps,7,'Compact lesson stepper must preserve all existing evidence/navigation steps');
      assert.equal(lessonFlow.hasFooter,false,'Lesson-detail stepper must not become a dashboard-like footer flow');
    }else{
      assert.equal(lessonFlow,null,'Specialized tab '+view+' must put its own learning content first instead of prepending Learning Flow');
    }
    if(view==='media'){
      await page.waitForSelector('.step54-listening-plan',{state:'visible',timeout:10000});
      const mediaFlow=await page.evaluate(()=>({
        tasks:[...document.querySelectorAll('.step54-listening-plan article')].map(x=>x.textContent||''),
        speakRoute:document.querySelector('.v1256-media-actions [data-route]')?.dataset.route||''
      }));
      assert.equal(mediaFlow.tasks.length,4,'Video learning flow must keep four bounded steps');
      for(const label of ['Trước khi xem','Lượt nghe đầu','Lượt nghe lại','Sau khi xem'])assert.equal(mediaFlow.tasks.some(x=>x.includes(label)),true,'Video flow missing '+label);
      assert.match(mediaFlow.speakRoute,/"view":"learning"/,'Video must link into the core Nghe & Nói learning route');
      assert.match(mediaFlow.speakRoute,/"learnTab":"practice"/,'Video must enter the speaking practice tab directly');
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
      await page.locator('[data-act="toggle-transcript"]').click();
      await page.waitForSelector('.transcript-listen-first',{state:'visible',timeout:10000});
    }
    if(view==='grammar'){
      await page.waitForSelector('.grammar-main-card .grammar-examples-first',{state:'visible',timeout:10000});
      await page.waitForSelector('.grammar-main-card .grammar-pattern-strip',{state:'visible',timeout:10000});
      await page.waitForSelector('.grammar-main-card .grammar-practice-now',{state:'visible',timeout:10000});
      const grammarOrder=await page.evaluate(()=>{
        const main=document.querySelector('.grammar-main-card');
        const examples=main?.querySelector('.grammar-examples-first');
        const pattern=main?.querySelector('.grammar-pattern-strip');
        const practice=main?.querySelector('.grammar-practice-now');
        const details=main?.querySelector('.grammar-concept-details');
        const pos=el=>el?[...main.children].indexOf(el):-1;
        return {examples:pos(examples),pattern:pos(pattern),practice:pos(practice),details:pos(details),detailsOpen:Boolean(details?.open),exampleRu:[...main.querySelectorAll('.grammar-examples-first article b')].some(el=>/[А-Яа-яЁё]/.test(el.textContent||''))};
      });
      assert.ok(grammarOrder.examples>=0&&grammarOrder.examples<grammarOrder.pattern&&grammarOrder.pattern<grammarOrder.practice&&grammarOrder.practice<grammarOrder.details,'Grammar hierarchy must be examples → pattern → practice → deeper explanation');
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
      const topicLabels=await library.locator('[data-input="vocabTopic"] option').allTextContents();
      assert.ok(topicLabels.length>1,'Vocabulary library must expose curated topic choices for the current stage');
      assert.equal(topicLabels.some(x=>/graduate_path|microtask|category_/i.test(x)),false,'Vocabulary library must not expose raw metadata tags');
      await library.locator('[data-input="vocabStatus"]').selectOption('learned');
      await page.waitForFunction(()=>document.querySelector('[data-input="vocabStatus"]')?.value==='learned'&&Boolean(document.querySelector('.vocab-card-panel,.v1310-vocab-main')),null,{timeout:10000});
      const learnedState=await page.evaluate(()=>({rows:document.querySelectorAll('.vocab-mini-row').length,key:document.querySelector('.vocab-card-panel,.v1310-vocab-main')?.dataset.vocabKey||''}));
      assert.ok(learnedState.rows>=1,'SRS learned filter must keep exposed vocabulary visible');
      assert.equal(learnedState.key,identity.key,'SRS learned filter must preserve the exposed card identity');
      await page.locator('[data-input="vocabStatus"]').selectOption('all');
      await page.waitForFunction(()=>document.querySelector('[data-input="vocabStatus"]')?.value==='all',null,{timeout:10000});
    }
  }

  await page.click('#nav [data-view="overview"]');
  await page.waitForSelector('.rf-dashboard');
  await page.screenshot({path:path.join(OUT,'russian-future-overview-1672x941.png'),fullPage:true});

  await page.setViewportSize({width:1280,height:800});
  await page.waitForTimeout(220);
  const laptop=await page.evaluate(()=>{
    const sidebar=document.querySelector('.ru-sidebar')?.getBoundingClientRect();
    const view=document.querySelector('.ru-view')?.getBoundingClientRect();
    return {vw:innerWidth,scroll:document.documentElement.scrollWidth,sidebarW:sidebar?.width||0,viewW:view?.width||0,menuDisplay:getComputedStyle(document.getElementById('russianMenuBtn')).display};
  });
  assert.ok(laptop.sidebarW>=216&&laptop.sidebarW<=224,'1280px shell must keep the canonical 220px sidebar');
  assert.ok(laptop.viewW<=1062,'1280px content must fit the available canvas without a 1400–1500px stretch');
  assert.equal(laptop.menuDisplay,'none','Desktop shell must not expose the drawer opener');
  assert.ok(laptop.scroll<=laptop.vw+2,'1280px layout must not horizontally overflow');

  await page.setViewportSize({width:1024,height:900});
  await page.waitForTimeout(220);
  const tabletDesktop=await page.evaluate(()=>{
    const sidebar=document.querySelector('.ru-sidebar')?.getBoundingClientRect();
    const view=document.querySelector('.ru-view')?.getBoundingClientRect();
    return {vw:innerWidth,scroll:document.documentElement.scrollWidth,sidebarW:sidebar?.width||0,viewW:view?.width||0,sidebarPosition:getComputedStyle(document.querySelector('.ru-sidebar')).position};
  });
  assert.ok(tabletDesktop.sidebarW>=216&&tabletDesktop.sidebarW<=224,'1024px shell must preserve the canonical desktop learning rail');
  assert.equal(tabletDesktop.sidebarPosition,'sticky','1024px sidebar must remain the desktop learning rail');
  assert.ok(tabletDesktop.viewW<=804,'1024px content must fit beside the 220px rail');
  assert.ok(tabletDesktop.scroll<=tabletDesktop.vw+2,'1024px layout must not horizontally overflow');

  await page.setViewportSize({width:768,height:960});
  await page.waitForTimeout(240);
  const drawerClosed=await page.evaluate(()=>{
    const sidebar=document.querySelector('.ru-sidebar')?.getBoundingClientRect();
    const menu=document.getElementById('russianMenuBtn');
    return {
      vw:innerWidth,scroll:document.documentElement.scrollWidth,
      sidebarX:sidebar?.x||0,sidebarW:sidebar?.width||0,
      sidebarPosition:getComputedStyle(document.querySelector('.ru-sidebar')).position,
      menuDisplay:getComputedStyle(menu).display,
      expanded:menu.getAttribute('aria-expanded'),
      hidden:document.getElementById('russianSidebar').getAttribute('aria-hidden')
    };
  });
  assert.equal(drawerClosed.sidebarPosition,'fixed','768px navigation must become an off-canvas drawer');
  assert.ok(drawerClosed.sidebarX<0,'Closed 768px drawer must sit outside the viewport');
  assert.notEqual(drawerClosed.menuDisplay,'none','768px shell must expose the drawer opener');
  assert.equal(drawerClosed.expanded,'false','Closed drawer must report aria-expanded=false');
  assert.equal(drawerClosed.hidden,'true','Closed mobile drawer must be hidden from assistive technology');
  assert.ok(drawerClosed.scroll<=drawerClosed.vw+2,'768px layout must not horizontally overflow');

  await page.locator('#russianMenuBtn').click();
  await page.waitForTimeout(240);
  const drawerOpen=await page.evaluate(()=>{
    const sidebar=document.querySelector('.ru-sidebar')?.getBoundingClientRect();
    return {
      x:sidebar?.x||0,
      expanded:document.getElementById('russianMenuBtn').getAttribute('aria-expanded'),
      hidden:document.getElementById('russianSidebar').getAttribute('aria-hidden'),
      bodyOpen:document.body.classList.contains('ru-nav-open'),
      focusId:document.activeElement?.id||''
    };
  });
  assert.ok(Math.abs(drawerOpen.x)<=2,'Open drawer must align with the viewport edge');
  assert.equal(drawerOpen.expanded,'true','Open drawer must report aria-expanded=true');
  assert.equal(drawerOpen.hidden,'false','Open drawer must be exposed to assistive technology');
  assert.equal(drawerOpen.bodyOpen,true,'Open drawer must lock the mobile shell');
  assert.equal(drawerOpen.focusId,'russianSidebarClose','Opening the drawer must move focus to its close control');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(240);
  assert.equal(await page.locator('#russianMenuBtn').getAttribute('aria-expanded'),'false','Escape must close the drawer');
  assert.equal(await page.evaluate(()=>document.activeElement?.id),'russianMenuBtn','Escape must restore focus to the drawer opener');

  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(240);
  const mobile=await page.evaluate(()=>({
    scroll:document.documentElement.scrollWidth,
    vw:innerWidth,
    modules:document.querySelectorAll('.rf-module-card').length,
    searchVisible:getComputedStyle(document.querySelector('.ru-global-search-wrap')).display!=='none',
    moduleColumns:getComputedStyle(document.querySelector('.rf-module-grid')).gridTemplateColumns,
    menuVisible:getComputedStyle(document.getElementById('russianMenuBtn')).display!=='none'
  }));
  assert.ok(mobile.scroll<=mobile.vw+2,'390px mobile layout must not horizontally overflow');
  assert.equal(mobile.modules,5);
  assert.equal(mobile.searchVisible,true);
  assert.equal(mobile.menuVisible,true);
  assert.ok(!mobile.moduleColumns.includes(' '),'390px learning cards must collapse to one column');
  await page.screenshot({path:path.join(OUT,'russian-future-overview-mobile.png'),fullPage:true});

  assert.deepEqual(errors,[],'Future Russian UI emitted browser errors');
  fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify({status:'PASS',dims,laptop,tabletDesktop,drawerClosed,drawerOpen,mobile},null,2));
  console.log('RUSSIAN_FUTURE_UI_BROWSER_PASS');
}finally{await browser?.close()}
