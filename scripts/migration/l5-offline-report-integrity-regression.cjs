'use strict';

const fs=require('fs');

const source='docs/migration/L5_ROADMAP_OFFLINE_BROWSER_REGRESSION.generated.json';
const output='docs/migration/L5_OFFLINE_REPORT_INTEGRITY.generated.json';
const failures=[];
const checks=[];
const check=(name,ok,detail='')=>{checks.push({name,ok:!!ok,detail});if(!ok)failures.push(`${name}${detail?': '+detail:''}`);};

if(!fs.existsSync(source)){
  console.error(`Missing ${source}`);
  process.exit(2);
}

const report=JSON.parse(fs.readFileSync(source,'utf8'));
const declaredFailures=Array.isArray(report.failures)?report.failures:[];
const falseChecks=(Array.isArray(report.checks)?report.checks:[]).filter(item=>item?.ok===false);
const expectedSandboxBlocks=falseChecks.filter(item=>
  item?.name==='browser-console-error' &&
  /blocked script execution/i.test(String(item.detail||'')) &&
  /sandboxed/i.test(String(item.detail||'')) &&
  /allow-scripts/i.test(String(item.detail||''))
);
const unexpectedFalseChecks=falseChecks.filter(item=>!expectedSandboxBlocks.includes(item));

check('offline browser declares zero failures',declaredFailures.length===0,JSON.stringify(declaredFailures));
check('all false checks are expected sandbox enforcement signals',unexpectedFalseChecks.length===0,JSON.stringify(unexpectedFalseChecks));
check('sandbox enforcement was actually observed',expectedSandboxBlocks.length>=1,`observed=${expectedSandboxBlocks.length}`);
check('offline routes cover main foundation math russian',
  ['main','foundation','math','russian'].every(label=>(report.offlineRoutes||[]).some(route=>route.label===label&&route.probe?.ok===true&&!(route.failed||[]).length&&!route.navError)),
  JSON.stringify((report.offlineRoutes||[]).map(route=>({label:route.label,navError:route.navError,failed:(route.failed||[]).length,ok:route.probe?.ok})))
);
check('subject base packs cover foundation math russian',
  ['foundation','math','russian'].every(id=>(report.packs||[]).some(pack=>pack.id===id&&Number(pack.ok)>0&&!(pack.failed||[]).length&&!(pack.skipped||[]).length)),
  JSON.stringify(report.packs||[])
);

const normalized={
  generatedAt:new Date().toISOString(),
  source,
  sourceGeneratedAt:report.generatedAt||null,
  sourceCheckCount:(report.checks||[]).length,
  declaredFailureCount:declaredFailures.length,
  expectedSandboxBlocks:expectedSandboxBlocks.map(item=>item.detail),
  unexpectedFalseChecks,
  checks,
  failures
};
fs.mkdirSync('docs/migration',{recursive:true});
fs.writeFileSync(output,JSON.stringify(normalized,null,2)+'\n');
console.log(`L5 offline report integrity: ${checks.length} checks, ${failures.length} failure(s), ${expectedSandboxBlocks.length} expected sandbox block(s).`);
if(failures.length){console.error(failures.join('\n'));process.exit(2);}
console.log('L5 offline report semantic integrity PASS.');
