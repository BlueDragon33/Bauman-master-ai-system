import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const fail=m=>{throw new Error(m)};
const must=(cond,m)=>{if(!cond)fail(m)};

const index=read('index.html');
const css=read('assets/russian-reference-ui.css');
const polish=read('assets/russian-reference-ui-polish.css');
const js=read('assets/russian-reference-ui.js');
const core=read('assets/core.js');
const adapter=read('assets/subject-adapter.js');

for(const id of ['app','nav','stageSelect','view','modal','modalBody','toast','themeBtn','aiBtn','pageTitle','pageSub','coreLabel','saveState']){
  must(index.includes(`id="${id}"`),`Missing required runtime id: ${id}`);
}
for(const ref of ['assets/core.css','assets/russian.css','assets/russian-reference-ui.css','assets/russian-reference-ui-polish.css','assets/subject-adapter.js','assets/planning-bridge.js','assets/core.js','assets/russian-reference-ui.js']){
  must(index.includes(ref),`Missing asset reference: ${ref}`);
}
must(index.indexOf('assets/russian-reference-ui.css')<index.indexOf('assets/russian-reference-ui-polish.css'),'Polish CSS must load after reference UI CSS');
must(index.indexOf('assets/core.js')<index.indexOf('assets/russian-reference-ui.js'),'Reference UI JS must load after core.js');
must(index.includes('id="russianRightRail"'),'Missing right AI rail');
must(index.includes('id="russianGlobalSearch"'),'Missing global search');
must(index.includes('data-ai-quick='),'AI rail must expose core AI Mentor quick-action contract');

for(const token of ['.ru-app-shell','.ru-right-rail','.ru-skill-grid','.ru-dashboard-middle','.ru-dashboard-bottom','@media (max-width:1080px)','@media (max-width:760px)','@media (max-width:480px)']){
  must(css.includes(token),`Missing CSS contract: ${token}`);
}
for(const token of ['.ru-legacy-overview-details','.ru-empty-activity',':focus-visible','prefers-reduced-motion']){
  must(polish.includes(token),`Missing polish CSS contract: ${token}`);
}
must((css.match(/{/g)||[]).length===(css.match(/}/g)||[]).length,'Reference CSS brace imbalance');
must((polish.match(/{/g)||[]).length===(polish.match(/}/g)||[]).length,'Polish CSS brace imbalance');
must(!css.includes("url('./subject-header.jpg')"),'Reference UI must not depend on missing subject-header.jpg');
must(!css.includes("url('./bauman-logo.png')"),'Reference UI must not depend on missing bauman-logo.png');

new Function(js);
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

must(core.includes('if(b.dataset.route)'),'Core data-route contract missing');
must(core.includes('if(b.dataset.aiQuick)'),'Core data-ai-quick contract missing');
must(core.includes("if(act==='route-modal')"),'Core route-modal contract missing');
must(core.includes("if(act==='ai-run')"),'Core AI run action missing');
must(adapter.includes("storageKey: 'bauman_russian_survival_master_v11_clean_skeleton'"),'Unexpected Russian storage key');

console.log('RUSSIAN_REFERENCE_UI_GATE=PASS');
console.log('Checks: shell, self-contained visuals, responsive layout, JS parse, truthful progress, compact legacy tools, accessibility polish, routing, AI and schedule integration.');
