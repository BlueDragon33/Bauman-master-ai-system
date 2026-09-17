import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('subjects/russian');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const need=(text,token,msg)=>{if(!text.includes(token))throw new Error(msg||`Missing ${token}`);};
const forbid=(text,token,msg)=>{if(text.includes(token))throw new Error(msg||`Forbidden ${token}`);};
const html=read('index.html');
const sw=read('sw.js');
const learning=read('assets/learning-state.js');
const vocab=read('assets/vocab-srs.js');
const speaking=read('assets/speaking-coach.js');
const academic=read('assets/academic-language.js');
const ai=read('assets/ai-mentor-guard.js');
const runtime=read('assets/runtime-optimizer.js');
const runtimeCss=read('assets/runtime-optimizer.css');
const adapter=read('assets/subject-adapter.js');
const cleanup=read('assets/ui-cleanup-contract.js');

for(const p of ['assets/core.css.bak','assets/core.js.bak']){
  if(fs.existsSync(path.join(root,p)))throw new Error(`Legacy backup still present: ${p}`);
  forbid(html,p,'Index must not reference backup assets');
}
const cssOrder=['assets/core.css','assets/russian.css','assets/russian-reference-ui.css','assets/russian-reference-ui-polish.css','assets/learning-state.css','assets/content-contract.css','assets/learning-flow.css','assets/vocab-srs.css','assets/speaking-coach.css','assets/academic-language.css','assets/runtime-optimizer.css'];
const jsOrder=['assets/subject-adapter.js','assets/ui-cleanup-contract.js','assets/content-contract.js','../shared/host-bridge.js','assets/planning-bridge.js','assets/russian-optional-data-loader.js','assets/core.js','assets/learning-state.js','assets/learning-flow.js','assets/vocab-srs.js','assets/speaking-coach.js','assets/academic-language.js','assets/ai-mentor-guard.js','assets/runtime-optimizer.js','assets/russian-reference-ui.js'];
function assertOrder(list,label){let prev=-1;for(const item of list){const pos=html.indexOf(item);if(pos<0)throw new Error(`${label} missing ${item}`);if(pos<=prev)throw new Error(`${label} order invalid at ${item}`);prev=pos;}}
assertOrder(cssOrder,'CSS');assertOrder(jsOrder,'JS');
for(const item of [...cssOrder.filter(x=>x!=='assets/core.css'),...jsOrder.filter(x=>x.startsWith('assets/'))])need(sw,`./${item}`,`Service worker shell missing ${item}`);
need(sw,'OPTIONAL_LARGE');for(const x of ['dialogue-bauman-az.json','deep-speaking-bauman.json','speaking-link-index.json'])need(sw,x,`Optional large source policy missing ${x}`);
need(runtime,'prepareOfflineCore');need(runtime,'navigator.connection?.saveData');need(runtimeCss,'@media(max-width:1080px)');need(runtimeCss,'@media(max-width:760px)');
need(learning,'bauman_russian_learning_state_v1');need(vocab,'bauman_russian_vocab_srs_v1');need(academic,'bauman_russian_academic_language_v1');need(adapter,'bauman_russian_survival_master_v11_clean_skeleton');
need(learning,'setResume');need(learning,'addReview');need(vocab,'RussianLearningState');need(speaking,'RussianLearningState');need(academic,'RussianLearningState');
need(cleanup,"A.ui.coreLabel='TIẾNG NGA BAUMAN'");need(cleanup,"A.ui.heroBadge='LỘ TRÌNH TIẾNG NGA BAUMAN'");need(cleanup,'hideLegacyVersionLabels:true');need(cleanup,'preserveInternalStorageAndBridgeIds:true');
need(ai,'canonicalStateReadOnly:true');need(ai,'aiMayModifyMastery:false');need(ai,'aiMayCompleteTasks:false');forbid(ai,'RussianLearningState?.set');forbid(ai,'.addReview');
const runtimeJs=['assets/core.js','assets/learning-state.js','assets/learning-flow.js','assets/vocab-srs.js','assets/speaking-coach.js','assets/academic-language.js','assets/ai-mentor-guard.js','assets/runtime-optimizer.js','assets/russian-reference-ui.js','assets/ui-cleanup-contract.js'].map(read).join('\n');
forbid(runtimeJs,'localStorage.clear(','Promotion candidate must not wipe existing learner storage');
forbid(html,'PASS','Gate status must not be visible in app shell');forbid(html,'DEBUG','Debug status must not be visible in app shell');
if(!html.includes('name="viewport"'))throw new Error('Viewport metadata missing');
console.log('RUSSIAN_PROMOTION_RUNTIME_GATE=PASS');
console.log('Checks: no runtime backups, stable additive load order, legacy UI version labels neutralized before core render, canonical resume/review/SRS/academic storage preserved, AI read-only, Russian-scoped offline shell, responsive runtime status, no destructive storage reset.');
