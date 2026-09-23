import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const fail=m=>{throw new Error(m)};
const must=(cond,m)=>{if(!cond)fail(m)};

const index=read('index.html');
const css=read('assets/russian-future-ui.css');
const polish=css;
const futureCss=css;
const futureJs=read('assets/russian-future-ui.js');
const js=futureJs;
const optionalLoader=read('assets/russian-optional-data-loader.js');
const contentContract=read('assets/content-contract.js');
const contentContractCss=read('assets/content-contract.css');
const core=read('assets/core.js');
const adapter=read('assets/subject-adapter.js');
const chatgptPackage=fs.readFileSync(path.resolve('scripts/prepare-chatgpt-site.mjs'),'utf8');
const previewPackage=fs.readFileSync(path.resolve('scripts/prepare-cloudflare-preview.mjs'),'utf8');

for(const id of ['app','nav','stageSelect','view','modal','modalBody','toast','themeBtn','aiBtn','pageTitle','pageSub','coreLabel','saveState']){
  must(index.includes(`id="${id}"`),`Missing required runtime id: ${id}`);
}
for(const ref of ['assets/core.css','assets/russian.css','assets/russian-future-ui.css','assets/learning-state.css','assets/content-contract.css','assets/subject-adapter.js','assets/content-contract.js','assets/planning-bridge.js','assets/russian-optional-data-loader.js','assets/core.js','assets/russian-future-ui.js']){
  must(index.includes(ref),`Missing asset reference: ${ref}`);
}
must(index.indexOf('assets/core.css')<index.indexOf('assets/russian.css'),'Russian theme must load after core CSS');
must(index.indexOf('assets/russian.css')<index.indexOf('assets/russian-future-ui.css'),'Canonical Russian presentation CSS must load after subject theme');
must(index.indexOf('assets/subject-adapter.js')<index.indexOf('assets/content-contract.js'),'Content contract must load after subject adapter');
must(index.indexOf('assets/content-contract.js')<index.indexOf('assets/core.js'),'Content contract must normalize adapter before core.js');
must(index.indexOf('assets/russian-optional-data-loader.js')<index.indexOf('assets/core.js'),'Optional chunk loader must bootstrap before core.js');
must(index.indexOf('assets/core.js')<index.indexOf('assets/russian-future-ui.js'),'Canonical Future UI must load after core.js');
must(!index.includes('assets/russian-reference-ui.css'),'Legacy reference presentation CSS must not be loaded');
must(!index.includes('assets/russian-reference-ui-polish.css'),'Legacy polish presentation CSS must not be loaded');
must(!index.includes('assets/russian-reference-ui.js'),'Legacy reference UI runtime must not be loaded');
must(!index.includes('id="russianRightRail"'),'Fixed right rail must not return to the learning shell');
must(index.includes('<body class="ru-reference-ui ru-future-ui">'),'Canonical Future UI must be active at first paint');
must(index.includes('id="russianGlobalSearch"'),'Missing global search');
must(index.includes('role="combobox"'),'Global search must expose combobox semantics');
must(index.includes('aria-controls="russianSearchHints"'),'Global search must identify its result list');
must(index.includes('id="aiBtn"'),'Topbar must retain the core AI Mentor entry point');
must(index.includes('role="dialog"'),'Modal must expose dialog semantics');
must(index.includes('aria-modal="true"'),'Modal must declare aria-modal');
must(index.includes('aria-label="Đóng hộp thoại"'),'Modal close button must have an accessible name');
must(!index.includes('/priˈvʲet/'),'Learning shell must not expose a hard-coded pronunciation sample as canonical data');

for(const token of ['.grammar-examples-first','.grammar-pattern-strip','.grammar-concept-details','.ru-app-shell','.rf-continue-band','.rf-today-plan','.rf-module-grid','.rf-dashboard-lower','.vocab-progressive-details','@media (max-width:1080px)','@media (max-width:760px)','@media (max-width:480px)']){
  must(css.includes(token),`Missing CSS contract: ${token}`);
}
for(const token of ['.ru-legacy-overview-details','.ru-empty-activity',':focus-visible','prefers-reduced-motion']){
  must(polish.includes(token),`Missing polish CSS contract: ${token}`);
}
for(const token of ['.ru-language-contract','.ru-language-contract-row','.stress.missing','@media (max-width:760px)']){
  must(contentContractCss.includes(token),`Missing language contract CSS: ${token}`);
}
must((css.match(/{/g)||[]).length===(css.match(/}/g)||[]).length,'Reference CSS brace imbalance');
must((polish.match(/{/g)||[]).length===(polish.match(/}/g)||[]).length,'Polish CSS brace imbalance');
must((contentContractCss.match(/{/g)||[]).length===(contentContractCss.match(/}/g)||[]).length,'Content contract CSS brace imbalance');
must((futureCss.match(/{/g)||[]).length===(futureCss.match(/}/g)||[]).length,'Future UI CSS brace imbalance');
must(!css.includes("url('./subject-header.jpg')"),'Reference UI must not depend on missing subject-header.jpg');
must(!css.includes("url('./bauman-logo.png')"),'Reference UI must not depend on missing bauman-logo.png');

new Function(js);
new Function(optionalLoader);
new Function(contentContract);
new Function(futureJs);
must(js.includes("window.SUBJECT_ADAPTER?.storageKey"),'Canonical UI must use adapter storage key');
must(js.includes('MutationObserver'),'Canonical UI enhancer must follow core renders');
must(js.includes("aiQuick:'intro'"),'Command search must expose the existing AI Mentor');
must(js.includes('function bindSearch()'),'Canonical UI runtime must own command search binding');
must(js.includes('role="group"'),'Search results must expose grouped result semantics');
must(js.includes('role="option"'),'Search result actions must expose listbox option semantics');
must(js.includes("e.key==='ArrowDown'"),'Search must support keyboard result navigation');
for(const token of ['BÀI HỌC','NGỮ PHÁP','VIDEO','TỪ VỰNG']) must(core.includes(token),`Unified search group missing: ${token}`);
must(js.includes("data-act=\"route-modal\""),'Canonical overview must reuse route modal contract');
must(js.includes('data-route'),'Canonical shortcuts must use core routing contract');
must(js.includes("aiQuick:'intro'"),'Global search must be able to open AI Mentor');
must(js.includes("act:'route-modal'"),'Global search must be able to open today schedule');
must(js.includes('collapseLegacyOverview'),'Overview must preserve legacy tools in a compact disclosure');
for(const token of ['HỌC TIẾP','Kế hoạch hôm nay','5 kỹ năng chính','Ôn tập trọng điểm']) must(js.includes(token),`Canonical Home hierarchy missing: ${token}`);
must(js.includes('navigator.platform'),'Shortcut hint must adapt to the user platform');
must(!js.includes('base+Math.round'),'Skill cards must not synthesize fake per-skill progress');
must(!js.includes('mini-progress'),'Skill cards must not display invented per-skill progress bars');
for(const token of ['ru-future-ui','rf-progress-strip','rf-module-grid','rf-dashboard-lower','rf-tab-intro','--rf-sidebar:220px','--rf-sidebar-compact:220px','--rf-content-max:1120px','--rf-reading-max:820px','--rf-card-padding:22px','--rf-section-gap:28px','--rf-font-md:15px','--rf-font-hero:32px','--rf-motion-fast:180ms','grid-template-columns:var(--rf-sidebar) minmax(0,1fr)','display:none!important']) must(futureCss.includes(token),`Future UI CSS missing ${token}`);
must(futureCss.includes('@media(max-width:1320px){\n .ru-future-ui .ru-app-shell{grid-template-columns:var(--rf-sidebar-compact)'), 'Laptop breakpoint must activate the compact sidebar token at <=1320px');
for(const token of ['@media(max-width:767px)','rf-sidebar-toggle','rf-sidebar-scrim','rf-sidebar-open','width:min(86vw,320px)','height:100dvh']){
  must(futureCss.includes(token),`PASS 2 mobile drawer contract missing: ${token}`);
}
must(futureJs.includes('function upgradeMobileShell'),'PASS 2 mobile shell runtime missing');
must(futureJs.includes("aria-controls',sidebar.id")&&futureJs.includes("aria-expanded','false'"),'Mobile drawer toggle must expose ARIA state');
must(futureJs.includes("e.key==='Escape'&&document.body.classList.contains('rf-sidebar-open')"),'Mobile drawer must close with Escape');
for(const token of ['body.ru-reference-ui.ru-future-ui.main-balanced .ru-view','body.ru-reference-ui.ru-future-ui.main-focus .ru-view','body.ru-reference-ui.ru-future-ui.main-compact .ru-view','body.ru-reference-ui.ru-future-ui.density-wide .ru-view']){
  must(futureCss.includes(token),`Canonical content width must survive legacy interface mode: ${token}`);
}
must(!futureCss.includes('Russian Reference UI · premium Bauman/Russia dashboard layer'),'PASS 2 must not restore the obsolete dark shell presentation layer');
for(const token of ['--ru-bg:#040d1b','grid-template-columns:228px minmax(0,1fr) 328px','background:rgba(4,15,29,.88)']){
  must(!futureCss.includes(token),`Obsolete shell token returned: ${token}`);
}
for(const token of ['position:relative;height:44px;display:flex','position:absolute;left:0;right:0;top:45px','margin:0;padding:0 1px']){
  must(futureCss.includes(token),`Canonical shell/search structure missing after PASS 2 migration: ${token}`);
}
const shellStart=futureCss.indexOf('body.ru-reference-ui.ru-future-ui{');
const shellEnd=futureCss.indexOf('/* Shared light-surface system');
must(shellStart>=0&&shellEnd>shellStart,'Canonical PASS 2 shell slice markers missing');
const canonicalShell=futureCss.slice(shellStart,shellEnd);
must(!canonicalShell.includes('!important'),'Canonical base shell/topbar/search must not rely on !important cascade overrides');
for(const token of ['/* core component theme */','var(--ru-text)','#071a30']){
  must(!futureCss.includes(token),`Obsolete dark component theme token returned: ${token}`);
}
const sharedSurfaceStart=futureCss.indexOf('/* Shared light-surface system');
const sharedSurfaceEnd=futureCss.indexOf('/* Future overview */');
must(sharedSurfaceStart>=0&&sharedSurfaceEnd>sharedSurfaceStart,'Canonical shared surface slice markers missing');
const sharedSurface=futureCss.slice(sharedSurfaceStart,sharedSurfaceEnd);
must(!sharedSurface.includes('!important'),'Canonical shared panel/button/input/modal theme must not rely on !important overrides');
for(const token of ['RUSSIAN_FUTURE_REFERENCE_UI_V1','upgradeOverview','upgradeTabIntro','data-rf-speak','Nghe & Nói','Luyện chữ','Kế hoạch hôm nay']) must(futureJs.includes(token),`Future UI runtime missing ${token}`);
must(futureJs.includes("setText(title,'Tiếng Nga')"),'Future UI must expose Russian-only visible brand');
must(futureJs.includes("function setText(el,value){if(el&&el.textContent!==value)el.textContent=value}"),'Future UI text writes must remain idempotent');
must(futureJs.includes("quote&&quote.dataset.rfFutureQuote!=='1'"),'Future UI quote render must remain one-shot and observer-safe');
must(!futureJs.includes('Bauman Hub'),'Future UI must not restore Bauman Hub branding');
must(futureJs.includes('MutationObserver'),'Future UI must survive core rerenders');
for(const [name,source] of [['ChatGPT Site',chatgptPackage],['Cloudflare preview',previewPackage]]){
  for(const asset of ['subjects/russian/assets/russian-future-ui.css','subjects/russian/assets/russian-future-ui.js']){
    must(source.includes(asset),`${name} package must require Russian Future UI asset: ${asset}`);
  }
}
must(chatgptPackage.includes('Packaged Russian Future UI reference missing'),'ChatGPT Site package must validate Russian Future UI HTML references');
must(previewPackage.includes('Russian Future UI reference missing'),'Cloudflare preview package must validate Russian Future UI HTML references');

for(const token of ['RUSSIAN_CONTENT_CONTRACT_V1','normalizeVocab','latin_transliteration','orthographic_yo','missing','Hệ thống không tự đoán','textForVocab']){
  must(contentContract.includes(token),`Content contract missing truthful-language token: ${token}`);
}
must(!contentContract.includes('stressIndex-1'),'Content contract must not infer Russian stress from unknown numeric fields');
must(!contentContract.includes('Math.random'),'Content contract must not synthesize language metadata');
must(!contentContract.includes('new MutationObserver'),'Content contract must refresh through the canonical Future UI observer');
must(contentContract.includes('enhance,schema'),'Content contract must expose its idempotent enhance hook');

for(const token of ['dialogue-bauman-az.json','deep-speaking-bauman.json','json-array-chunks-v1','chunks/${dataset}/manifest.json','RUSSIAN_OPTIONAL_CHUNKS_V1']){
  must(optionalLoader.includes(token),`Optional chunk loader missing contract: ${token}`);
}
must(optionalLoader.includes('const nativeFetch=window.fetch.bind(window)'),'Optional loader must preserve native fetch');
must(optionalLoader.includes('window.fetch=async function'),'Optional loader must intercept only supported lazy datasets');
must(optionalLoader.includes('if(!dataset)return nativeFetch(input,init)'),'Optional loader must pass unrelated requests through untouched');

must(core.includes('if(b.dataset.route)'),'Core data-route contract missing');
must(core.includes('if(b.dataset.aiQuick)'),'Core data-ai-quick contract missing');
must(core.includes('function makeImmersiveVocabDisplay'),'Visual vocabulary immersion helper missing');
must(core.includes('const display=makeImmersiveVocabDisplay(v,base)'),'Vocabulary rendering must always use immersive display projection');
must(!core.includes('function makeVietnamVocabDisplay'),'Legacy Vietnamese vocabulary display helper must not return');
must(!core.includes('displayMeaning:meaningVi||english||meaningRu'),'Vocabulary must not prefer translated meaning in the visible learning surface');
must(!core.includes('info.meaningRu||info.meaningVi'),'Vocabulary visual fallback must not leak Vietnamese meaning');
must(!core.includes('class="visual-tags"'),'Vocabulary learning card must not expose raw metadata tags as translation clues');
must(core.includes('<article><b>Ngữ cảnh Nga</b><p lang="ru">'),'Vocabulary context block must remain Russian-only');
must(core.includes('<article><b>Thực hành</b><p lang="ru">'),'Vocabulary practice block must remain Russian-only');
must(core.includes("if(act==='route-modal')"),'Core route-modal contract missing');
must(core.includes('function trapModalFocus(e)'),'Modal keyboard focus trap missing');
must(core.includes("if(e.key==='Escape'){e.preventDefault();closeModal();return true;}"),'Escape must close any active modal');
must(core.includes('modalReturnFocus'),'Modal must restore focus to the opener');
must(core.includes("if(act==='ai-run')"),'Core AI run action missing');
for(const token of ['Trước khi xem','Lượt nghe đầu','Lượt nghe lại','Sau khi xem','Nghe xong nói lại']) must(core.includes(token),`Video learning flow missing: ${token}`);
must(adapter.includes("storageKey: 'bauman_russian_survival_master_v11_clean_skeleton'"),'Unexpected Russian storage key');
must(adapter.includes("optionalDataFiles: ['dialogue-bauman-az','deep-speaking-bauman','speaking-link-index']"),'Unexpected optional Russian dataset contract');
must(adapter.includes('primaryNav: ['),'Primary learner navigation contract missing');
for(const route of ["['overview','⌂','Tổng quan']","['media','◉','Video']","['learning','◌','Nghe & Nói','practice']","['vocab','▣','Từ vựng']","['grammar','▥','Ngữ pháp']","['writing','✎','Luyện chữ']"]){
  must(adapter.includes(route),`Primary learner navigation missing: ${route}`);
}
must(adapter.includes("['dialogue','💬','Đối thoại']"),'Full route registry must preserve advanced Dialogue deep links');
must(core.includes("const DEFERRED_CORE_DATA=new Set(['vocab','tests']);"),'Large vocabulary and test datasets must remain deferred from startup');
must(core.includes("ensureDeferredCoreData('vocab')"),'Vocabulary view must load the deferred dataset on demand');
must(core.includes("ensureDeferredCoreData('tests')"),'Review/exam must load the deferred test bank on demand');
must(core.includes("['review','exam'].includes(state.learnTab)&&!DB.tests"),'Test bank must remain absent until review/exam is opened');
must(core.includes('if(DB.vocab&&state.vocabIndex>=voc.length)'),'Deferred vocabulary must not clamp saved learner progress before data loads');
must(core.includes('Đang mở bộ từ vựng…'),'Vocabulary lazy-load state must remain learner-readable');
must(core.includes('const PRIMARY_NAV=A.primaryNav||NAV;'),'Core must separate visible primary navigation from full route registry');
must(core.includes("$('#nav').innerHTML=PRIMARY_NAV.map"),'Sidebar must render the compact primary navigation');
must(core.includes('const views=NAV.map'),'Full route registry must remain authoritative for deep-link/state compatibility');
must(core.includes('class="vocab-progressive-details"'),'Vocabulary advanced content must use progressive disclosure');
must(core.includes('data-vocab-key='),'Vocabulary card/list must expose a stable source key');
must(core.includes('data-vocab-source-index='),'Vocabulary card/list must expose canonical source index');
must(core.includes('data-vocab-stage-index='),'Vocabulary card/list must expose stage-relative index');
must(core.includes('class="vocab-library-toolbar"'),'Vocabulary library must expose a compact filter toolbar');
must(core.includes('data-input="vocabQuery"'),'Vocabulary library search input missing');
must(core.includes('data-input="vocabTopic"'),'Vocabulary library curated topic filter missing');
must(core.includes('data-input="vocabStatus"'),'Vocabulary library SRS status filter missing');
must(core.includes('grammar-examples-first'),'Grammar must present Russian examples before heavy explanation');
must(core.includes('grammar-pattern-strip'),'Grammar quick pattern strip missing');
must(core.includes('grammar-practice-now'),'Grammar immediate practice block missing');
must(core.includes('<details class="grammar-concept-details">'),'Grammar deeper explanation must use progressive disclosure');
must(core.indexOf('grammar-examples-first')<core.indexOf('grammar-concept-details'),'Grammar examples must precede deeper rule explanation');
must(core.includes("label:'Học tập',tags:['academic','graduate_path']"),'Raw vocabulary metadata must be mapped to learner-facing topic labels');
must(!core.includes('<option value="graduate_path"'),'Raw metadata tags must not be exposed as learner-facing options');
must(core.includes("vocabFocusKey:''"),'Vocabulary routing must preserve a dedicated stable focus key');
must(core.includes('<summary>Chi tiết'),'Vocabulary details disclosure label missing');
must(core.includes('class="vocab-micro-context"'),'Vocabulary card must expose a short Russian micro-context');
must(core.includes('data-act="speak-vocab-slow"'),'Vocabulary card must expose optional slow audio');
must(core.includes('function speakVocabItem(v,slow=false)'),'Vocabulary audio must stay in the canonical core audio path');
must(core.includes("player.playbackRate=slow?.75:1"),'Source vocabulary audio must support slower playback');
must(core.includes("speak(term,slow?.62:.85)"),'Vocabulary TTS fallback must support slower playback');
must(!core.includes('info.term,info.meaningRu,info.meaningVi,info.english,info.application'),'Visual inference must not depend on Vietnamese/English meaning fields');
must(!core.includes('info.term,info.meaningRu,info.meaningVi,info.english,info.visualLabel'),'Dialogue presentation inference must not depend on translated meaning fields');
must((futureJs.match(/new MutationObserver/g)||[]).length===1,'Canonical Russian presentation runtime must own exactly one MutationObserver');
must(!fs.existsSync(path.join(root,'assets/russian-reference-ui.css')),'Legacy reference CSS must be removed after consolidation');
must(!fs.existsSync(path.join(root,'assets/russian-reference-ui-polish.css')),'Legacy polish CSS must be removed after consolidation');
must(!fs.existsSync(path.join(root,'assets/russian-reference-ui.js')),'Legacy reference UI runtime must be removed after consolidation');

console.log('RUSSIAN_REFERENCE_UI_GATE=PASS');
console.log('Presentation: canonical Future UI only; compact nav; progressive Russian-first vocabulary.');
console.log('Checks: shell, self-contained visuals, responsive layout, JS parse, truthful progress, truthful Russian content contract, optional chunk loading, accessibility, routing, AI and schedule integration.');
