'use strict';

const fs=require('fs');
const path=require('path');

const status=String(process.env.L5_JOB_STATUS||'unknown').toLowerCase();
const sourceSha=String(process.env.GITHUB_SHA||'');
const runId=String(process.env.GITHUB_RUN_ID||'');
const runAttempt=String(process.env.GITHUB_RUN_ATTEMPT||'');
const ref=String(process.env.GITHUB_REF_NAME||'');
const knownReports=[
  'docs/migration/L5_STATIC_ROUTING_AUDIT.generated.json',
  'docs/migration/L5_SERVICE_WORKER_LIFECYCLE_REGRESSION.generated.json',
  'docs/migration/L5_ACADEMIC_RUNTIME_V3_REGRESSION.generated.json',
  'docs/migration/L5_ROADMAP_OFFLINE_STATIC_REGRESSION.generated.json',
  'docs/migration/L5_DATA_LOADING_AUDIT.generated.md',
  'docs/migration/L5_BROWSER_NETWORK_REGRESSION.generated.json',
  'docs/migration/L5_RESPONSIVE_REGRESSION.generated.json',
  'docs/migration/L5_RENDER_PERFORMANCE_REGRESSION.generated.json',
  'docs/migration/L5_DIRECT_FILE_READER_REGRESSION.generated.json',
  'docs/migration/L5_ROADMAP_OFFLINE_BROWSER_REGRESSION.generated.json'
];

function summarizeJson(file){
  try{
    const data=JSON.parse(fs.readFileSync(file,'utf8'));
    return {
      failures:Array.isArray(data.failures)?data.failures:[],
      warnings:Array.isArray(data.warnings)?data.warnings:[],
      pageChecks:Array.isArray(data.pages)?data.pages.length:null,
      checks:Array.isArray(data.checks)?data.checks.length:null,
      offlineRoutes:Array.isArray(data.offlineRoutes)?data.offlineRoutes.length:null,
      packs:Array.isArray(data.packs)?data.packs.length:null,
      runtime:data.runtime||null,
      budgets:data.budgets||null,
      workerVersion:data.workerVersion||null,
      runtimeVersion:data.runtimeVersion||null
    };
  }catch(_){return null;}
}

const reports=knownReports.filter((file)=>fs.existsSync(file)).map((file)=>({file,bytes:fs.statSync(file).size,summary:file.endsWith('.json')?summarizeJson(file):null}));
const result={schema:'bauman-l5-ci-result-v6',status,passed:status==='success',sourceSha,runId,runAttempt,ref,generatedAt:new Date().toISOString(),reports};
fs.mkdirSync(path.join('docs','migration'),{recursive:true});
fs.writeFileSync('docs/migration/L5_CI_RESULT.generated.json',JSON.stringify(result,null,2)+'\n');
console.log(`L5 durable CI result: ${status}, source ${sourceSha.slice(0,12)}, ${reports.length} report(s).`);
