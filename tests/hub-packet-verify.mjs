import fs from 'node:fs';
import {spawnSync,execFileSync} from 'node:child_process';
const tests=[
 'tests/hub-prompt-boundary-static.mjs',
 'tests/hub-subject-adapter-unit.mjs','tests/hub-research-workspace-unit.mjs',
 'tests/hub-data-truth-static.mjs','tests/subjects-reference-v1-static.mjs',
 'tests/thesis-reference-v1-static.mjs','tests/schedule-reference-v1-static.mjs',
 'tests/hub-primary-pages-v6-static.mjs','tests/hub-readable-typography-v1-static.mjs',
 'scripts/runtime-device-gate-regression.mjs','tests/runtime-access-mode-static.mjs','tests/runtime-access-mode-behavior.mjs'
];
if(process.argv.includes('--browser'))tests.push(
 'tests/hub-data-truth-browser.mjs','tests/subjects-reference-v1-browser.mjs',
 'tests/thesis-reference-v1-browser.mjs','tests/schedule-reference-v1-browser.mjs',
 'tests/hub-readable-typography-v1-browser.mjs','tests/hub-premium-responsive-browser.mjs',
 'tests/hub-truth-ux-cleanup-browser.mjs'
);
const out='artifacts/hub-packet-verification';fs.mkdirSync(out,{recursive:true});
const result={head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),tests:[]};
for(const file of tests){
 const run=spawnSync(process.execPath,[file],{encoding:'utf8',env:process.env,timeout:600000});
 const entry={command:'node '+file,exitCode:run.status,status:run.status===0?'PASS':'FAIL'};
 result.tests.push(entry);fs.writeFileSync(out+'/'+file.split('/').at(-1)+'.log',(run.stdout||'')+(run.stderr||''));
 console.log(entry.status+' '+entry.command);if(run.status!==0)console.log((run.stderr||run.stdout||String(run.error)).slice(-1600));
}
fs.writeFileSync(out+'/summary.json',JSON.stringify(result,null,2));
process.exitCode=result.tests.every(x=>x.status==='PASS')?0:1;
