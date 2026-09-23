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
      sidebar:box('.ru-sidebar'),main:box('.ru-main'),hero:box('.overview-top-only-hero'),
      progress:box('.rf-progress-strip'),modules,
      lower:box('.rf-dashboard-lower')
    };
  });
  assert.ok(dims.sidebar&&dims.sidebar.w>=205&&dims.sidebar.w<=235,'Sidebar width must stay close to 220px reference');
  assert.ok(dims.main&&dims.main.w>1300,'Main learning canvas must use space released by old right rail');
  assert.ok(dims.hero&&dims.hero.h>=275&&dims.hero.h<=315,'Hero height drifted from reference rhythm');
  assert.ok(dims.progress&&dims.progress.h>=70&&dims.progress.h<=100,'Progress strip height drifted');
  assert.equal(dims.modules.length,5,'Overview must contain exactly five core module cards');
  assert.ok(Math.max(...dims.modules.map(x=>x.y))-Math.min(...dims.modules.map(x=>x.y))<3,'Five module cards must share one row at 16:9 desktop');
  assert.ok(Math.max(...dims.modules.map(x=>x.w))-Math.min(...dims.modules.map(x=>x.w))<4,'Five module cards must have balanced widths');
  assert.ok(dims.lower&&dims.lower.w>1200,'Lower dashboard grid must remain wide and balanced');
  assert.ok(dims.scroll<=dims.vw+2,'Future Russian UI must not horizontally overflow at reference viewport');

  const dashboardText=await page.locator('.rf-dashboard').innerText();
  for(const label of ['HỌC TIẾP','CẦN ÔN','Kế hoạch hôm nay','5 kỹ năng chính','Video','Nghe & Nói','Luyện chữ','Từ vựng','Ngữ pháp','Ôn tập trọng điểm']){
    assert.ok(dashboardText.includes(label),'Overview summary missing '+label);
  }

  const tabs=['media','dialogue','vocab','grammar','writing'];
  for(const view of tabs){
    await page.click('#nav [data-view="'+view+'"]');
    await page.waitForSelector('#view > .rf-tab-intro[data-view="'+view+'"]',{timeout:10000});
    const visible=await page.locator('#view > .rf-tab-intro').isVisible();
    assert.equal(visible,true,'Future intro missing for '+view);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
    assert.ok(overflow<=2,'Horizontal overflow in '+view+': '+overflow);
    if(view==='dialogue'){
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

  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(120);
  const mobile=await page.evaluate(()=>({
    scroll:document.documentElement.scrollWidth,
    vw:innerWidth,
    modules:document.querySelectorAll('.rf-module-card').length,
    searchVisible:getComputedStyle(document.querySelector('.ru-global-search-wrap')).display!=='none'
  }));
  assert.ok(mobile.scroll<=mobile.vw+2,'Future UI mobile horizontal overflow');
  assert.equal(mobile.modules,5);
  assert.equal(mobile.searchVisible,true);
  await page.screenshot({path:path.join(OUT,'russian-future-overview-mobile.png'),fullPage:true});

  assert.deepEqual(errors,[],'Future Russian UI emitted browser errors');
  fs.writeFileSync(path.join(OUT,'result.json'),JSON.stringify({status:'PASS',dims,mobile},null,2));
  console.log('RUSSIAN_FUTURE_UI_BROWSER_PASS');
}finally{await browser?.close()}
