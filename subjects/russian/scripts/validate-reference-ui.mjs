import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const fail=m=>{throw new Error(m)};
const must=(cond,m)=>{if(!cond)fail(m)};

const index=read('index.html');
const css=read('assets/russian-reference-ui.css');
const js=read('assets/russian-reference-ui.js');
const core=read('assets/core.js');
const adapter=read('assets/subject-adapter.js');

for(const id of ['app','nav','stageSelect','view','modal','modalBody','toast','themeBtn','aiBtn','pageTitle','pageSub','coreLabel','saveState']){
  must(index.includes(`id="${id}"`),`Missing required runtime id: ${id}`);
}
for(const ref of ['assets/core.css','assets/russian.css','assets/russian-reference-ui.css','assets/subject-adapter.js','assets/planning-bridge.js','assets/core.js','assets/russian-reference-ui.js']){
  must(index.includes(ref),`Missing asset reference: ${ref}`);
}
must(index.indexOf('assets/core.js')<index.indexOf('assets/russian-reference-ui.js'),'Reference UI JS must load after core.js');
must(index.includes('id="russianRightRail"'),'Missing right AI rail');
must(index.includes('id="russianGlobalSearch"'),'Missing global search');
must(exists('assets/subject-header.jpg'),'Missing subject-header.jpg');
must(exists('assets/bauman-logo.png'),'Missing bauman-logo.png');

for(const token of ['.ru-app-shell','.ru-right-rail','.ru-skill-grid','.ru-dashboard-middle','.ru-dashboard-bottom','@media (max-width:1080px)','@media (max-width:760px)','@media (max-width:480px)']){
  must(css.includes(token),`Missing CSS contract: ${token}`);
}
must((css.match(/{/g)||[]).length===(css.match(/}/g)||[]).length,'CSS brace imbalance');

new Function(js);
must(js.includes("window.SUBJECT_ADAPTER?.storageKey"),'Dashboard must use adapter storage key');
must(js.includes('MutationObserver'),'Dashboard enhancer must follow core renders');
must(js.includes('data-ai-quick'),'AI rail must reuse core AI Mentor contract');
must(js.includes("data-act=\"route-modal\""),'Dashboard must reuse route modal contract');
must(js.includes('data-route'),'Dashboard shortcuts must use core routing contract');

must(core.includes('if(b.dataset.route)'),'Core data-route contract missing');
must(core.includes('if(b.dataset.aiQuick)'),'Core data-ai-quick contract missing');
must(core.includes("if(act==='route-modal')"),'Core route-modal contract missing');
must(core.includes("if(act==='ai-run')"),'Core AI run contract missing');
must(adapter.includes("storageKey: 'bauman_russian_survival_master_v11_clean_skeleton'"),'Unexpected Russian storage key');

console.log('RUSSIAN_REFERENCE_UI_GATE=PASS');
console.log('Checks: shell, required runtime ids, asset order, existing imagery, responsive contracts, JS parse, storage binding, routing, AI and schedule integration.');
