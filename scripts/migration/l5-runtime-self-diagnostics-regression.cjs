'use strict';

const fs=require('fs');
const failures=[];
const checks=[];
const check=(name,ok,detail='')=>{checks.push({name,ok:!!ok,detail});if(!ok)failures.push(`${name}${detail?': '+detail:''}`);};
const read=file=>fs.readFileSync(file,'utf8');

const index=read('index.html');
const diag=read('assets/js/platform/runtime-self-diagnostics.js');
const css=read('assets/css/runtime-diagnostics.css');
const worker=read('service-worker.js');

check('diagnostics script wired',index.includes('assets/js/platform/runtime-self-diagnostics.js'));
check('diagnostics stylesheet wired',index.includes('assets/css/runtime-diagnostics.css'));
check('diagnostics loads after offline pack manager',index.indexOf('offline-subject-pack-manager.js')<index.indexOf('runtime-self-diagnostics.js'));
check('diagnostics loads before planning bridge',index.indexOf('runtime-self-diagnostics.js')<index.indexOf('planning-main.js'));
check('diagnostics assets included in shell',worker.includes("'./assets/js/platform/runtime-self-diagnostics.js'")&&worker.includes("'./assets/css/runtime-diagnostics.css'"));
check('academic identity gate exists',/09\.04\.01\/11/.test(diag)&&/ИУ-5/.test(diag));
check('eight content engines gate exists',/subjectCount\)===8/.test(diag)||/subjectCount\)===8/.test(diag.replace(/\s/g,'')));
check('DOM warning and failure budgets exist',/DOM_WARN=3500/.test(diag)&&/DOM_FAIL=6000/.test(diag));
check('DOM warning band is explicit',/nodeCount>=DOM_FAIL\?'fail':nodeCount>=DOM_WARN\?'warn':'pass'/.test(diag));
check('diagnostics is admin menu opt-in',/data-runtime-diag-action/.test(diag)&&/Chẩn đoán Web App/.test(diag));
check('diagnostics run is not invoked automatically',!/(?:DOMContentLoaded|install)\([^\n]*run\s*\(/.test(diag));
check('service-worker rollout gate is visible',/Service Worker production rollout still gated/.test(diag));
check('offline zero-copy reader is checked',/Direct local reader zero-copy/.test(diag));
check('UI has pass warn fail styles',/\.diag-row\.pass/.test(css)&&/\.diag-row\.warn/.test(css)&&/\.diag-row\.fail/.test(css));

const report={generatedAt:new Date().toISOString(),checks,failures};
fs.mkdirSync('docs/migration',{recursive:true});
fs.writeFileSync('docs/migration/L5_RUNTIME_SELF_DIAGNOSTICS_REGRESSION.generated.json',JSON.stringify(report,null,2)+'\n');
console.log(`L5 runtime self diagnostics regression: ${checks.length} checks, ${failures.length} failure(s).`);
if(failures.length){console.error(failures.join('\n'));process.exit(2);}
console.log('L5 runtime self diagnostics regression PASS.');
