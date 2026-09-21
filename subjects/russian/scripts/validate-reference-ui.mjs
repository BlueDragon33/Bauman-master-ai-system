import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const fail=m=>{throw new Error(m)};
const must=(cond,m)=>{if(!cond)fail(m)};

const index=read('index.html');
const css=read('assets/russian-reference-ui.css');
const polish=read('assets/russian-reference-ui-polish.css');
const futureCss=read('assets/russian-future-ui.css');
const futureJs=read('assets/russian-future-ui.js');
const js=read('assets/russian-reference-ui.js');
const optionalLoader=read('assets/russian-optional-data-loader.js');
const contentContract=read('assets/content-contract.js');
const contentContractCss=read('assets/content-contract.css');
const core=read('assets/core.js');
const adapter=read('assets/subject-adapter.js');

for(const id of ['app','nav','stageSelect','view','modal','modalBody','toast','themeBtn','aiBtn','pageTitle','pageSub','coreLabel','saveState']){
  must(index.includes(`id="${id}"`),`Missing required runtime id: ${id}`);
}
for(const ref of ['assets/core.css','assets/russian.css','assets/russian-reference-ui.css','assets/russian-reference-ui-polish.css','assets/russian-future-ui.css','assets/learning-state.css','assets/content-contract.css','assets/subject-adapter.js','assets/content-contract.js','assets/planning-bridge.js','assets/russian-optional-data-loader.js','assets/core.js','assets/russian-reference-ui.js','assets/russian-future-ui.js']){
  must(index.includes(ref),`Missing asset reference: ${ref}`);
}
must(index.indexOf('assets/russian-reference-ui.css')<index.indexOf('assets/russian-reference-ui-polish.css'),'Polish CSS must load after reference UI CSS');
must(index.indexOf('assets/subject-adapter.js')<index.indexOf('assets/content-contract.js'),'Content contract must load after subject adapter');
must(index.indexOf('assets/content-contract.js')<index.indexOf('assets/core.js'),'Content contract must normalize adapter before core.js');
must(index.indexOf('assets/russian-optional-data-loader.js')<index.indexOf('assets/core.js'),'Optional chunk loader must bootstrap before core.js');
must(index.indexOf('assets/core.js')<index.indexOf('assets/russian-reference-ui.js'),'Reference UI JS must load after core.js');
must(index.indexOf('assets/russian-reference-ui.js')<index.indexOf('assets/russian-future-ui.js'),'Future UI must load after reference UI enhancer');
must(index.indexOf('assets/russian-reference-ui-polish.css')<index.indexOf('assets/russian-future-ui.css'),'Future CSS must load last among Russian presentation layers');
must(index.includes('id="russianRightRail"'),'Missing right AI rail');
must(index.includes('id="russianGlobalSearch"'),'Missing global search');
must(index.includes('data-ai-quick='),'AI rail must expose core AI Mentor quick-action contract');
must(!index.includes('/priˈvʲet/'),'Right rail must not expose a hard-coded pronunciation sample as canonical data');

for(const token of ['.ru-app-shell','.ru-right-rail','.ru-skill-grid','.ru-dashboard-middle','.ru-dashboard-bottom','@media (max-width:1080px)','@media (max-width:760px)','@media (max-width:480px)']){
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
must(js.includes("window.SUBJECT_ADAPTER?.storageKey"),'Dashboard must use adapter storage key');
must(js.includes('MutationObserver'),'Dashboard enhancer must follow core renders');
must(js.includes("getElementById('aiBtn')"),'AI rail custom prompt must open existing AI Mentor');
must(js.includes("document.querySelector('[data-act=\"ai-run\"]')"),'AI rail custom prompt must reuse core AI run action');
must(js.includes("data-act=\"route-modal\""),'Dashboard must reuse route modal contract');
must(js.includes('data-route'),'Dashboard shortcuts must use core routing contract');
must(js.includes("aiQuick:'intro'"),'Global search must be able to open AI Mentor');
must(js.includes("act:'route-modal'"),'Global search must be able to open today schedule');
must(js.includes('collapseLegacyOverview'),'Overview must preserve legacy tools in a compact disclosure');
must(js.includes('navigator.platform'),'Shortcut hint must adapt to the user platform');
must(!js.includes('base+Math.round'),'Skill cards must not synthesize fake per-skill progress');
must(!js.includes('mini-progress'),'Skill cards must not display invented per-skill progress bars');
for(const token of ['ru-future-ui','rf-progress-strip','rf-module-grid','rf-dashboard-lower','rf-tab-intro','grid-template-columns:220px minmax(0,1fr)','display:none!important']) must(futureCss.includes(token),`Future UI CSS missing ${token}`);
for(const token of ['RUSSIAN_FUTURE_REFERENCE_UI_V1','upgradeOverview','upgradeTabIntro','data-rf-speak','Nghe & Nói','Bảng chữ cái','Lộ trình kỹ năng']) must(futureJs.includes(token),`Future UI runtime missing ${token}`);
must(futureJs.includes("title.textContent='Tiếng Nga'"),'Future UI must expose Russian-only visible brand');
must(!futureJs.includes('Bauman Hub'),'Future UI must not restore Bauman Hub branding');
must(futureJs.includes('MutationObserver'),'Future UI must survive core rerenders');

for(const token of ['RUSSIAN_CONTENT_CONTRACT_V1','normalizeVocab','latin_transliteration','orthographic_yo','missing','Hệ thống không tự đoán','textForVocab']){
  must(contentContract.includes(token),`Content contract missing truthful-language token: ${token}`);
}
must(!contentContract.includes('stressIndex-1'),'Content contract must not infer Russian stress from unknown numeric fields');
must(!contentContract.includes('Math.random'),'Content contract must not synthesize language metadata');

for(const token of ['dialogue-bauman-az.json','deep-speaking-bauman.json','json-array-chunks-v1','chunks/${dataset}/manifest.json','RUSSIAN_OPTIONAL_CHUNKS_V1']){
  must(optionalLoader.includes(token),`Optional chunk loader missing contract: ${token}`);
}
must(optionalLoader.includes('const nativeFetch=window.fetch.bind(window)'),'Optional loader must preserve native fetch');
must(optionalLoader.includes('window.fetch=async function'),'Optional loader must intercept only supported lazy datasets');
must(optionalLoader.includes('if(!dataset)return nativeFetch(input,init)'),'Optional loader must pass unrelated requests through untouched');

must(core.includes('if(b.dataset.route)'),'Core data-route contract missing');
must(core.includes('if(b.dataset.aiQuick)'),'Core data-ai-quick contract missing');
must(core.includes("if(act==='route-modal')"),'Core route-modal contract missing');
must(core.includes("if(act==='ai-run')"),'Core AI run action missing');
must(adapter.includes("storageKey: 'bauman_russian_survival_master_v11_clean_skeleton'"),'Unexpected Russian storage key');
must(adapter.includes("optionalDataFiles: ['dialogue-bauman-az','deep-speaking-bauman','speaking-link-index']"),'Unexpected optional Russian dataset contract');

console.log('RUSSIAN_REFERENCE_UI_GATE=PASS');
console.log('Checks: shell, self-contained visuals, responsive layout, JS parse, truthful progress, truthful Russian content contract, optional chunk loading, accessibility, routing, AI and schedule integration.');
