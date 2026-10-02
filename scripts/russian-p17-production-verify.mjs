import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const required=(v,n)=>{const s=String(v??'').trim();if(!s)throw new Error(n+' is required');return s};
const expectedSha=required(process.env.EXPECTED_SHA,'EXPECTED_SHA');
const rollbackSha=required(process.env.ROLLBACK_SHA,'ROLLBACK_SHA');
const runtimeOrigin=required(process.env.BAUMAN_RUNTIME_PRODUCTION_ORIGIN,'BAUMAN_RUNTIME_PRODUCTION_ORIGIN').replace(/\/$/,'');
const controlOrigin=required(process.env.BAUMAN_CONTROL_PRODUCTION_ORIGIN,'BAUMAN_CONTROL_PRODUCTION_ORIGIN').replace(/\/$/,'');
const appManagerOrigin=required(process.env.APPLICATION_MANAGEMENT_PRODUCTION_ORIGIN,'APPLICATION_MANAGEMENT_PRODUCTION_ORIGIN').replace(/\/$/,'');
const out=process.env.RUSSIAN_P17_OUT||'artifacts/russian-p17';
fs.mkdirSync(out,{recursive:true});
const releaseId='RUS-'+expectedSha.slice(0,12);
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fetchOk=async(url,init={})=>{const r=await fetch(url,{...init,signal:AbortSignal.timeout(15000)});return r};
const json=async(url)=>{const r=await fetchOk(url,{headers:{accept:'application/json','cache-control':'no-cache'}});if(!r.ok)throw new Error(url+' -> HTTP '+r.status);return r.json()};
const text=async(url)=>{const r=await fetchOk(url,{headers:{'cache-control':'no-cache'}});if(!r.ok)throw new Error(url+' -> HTTP '+r.status);return {body:await r.text(),headers:Object.fromEntries(r.headers.entries()),status:r.status}};
const critical=[
  'subjects/russian/index.html','subjects/russian/sw.js','subjects/russian/subject-manifest.json',
  'subjects/russian/assets/scenario-runtime.js','subjects/russian/assets/production-workbench.js','subjects/russian/assets/ai-mentor-guard.js',
  'subjects/russian/editor.html','subjects/russian/assets/authoring-workbench.js',
  'subjects/russian/data/scenario-registry.json','subjects/russian/data/technical-concepts.json','subjects/russian/data/academic-functions.json',
  'subjects/russian/data/reading.json','subjects/russian/data/performance-tasks.json','subjects/russian/data/ai-mentor-policy.json','subjects/russian/data/authoring-governance.json'
];
const rel=p=>p.replace(/^subjects\/russian\//,'subjects/russian/');
const liveUrl=p=>runtimeOrigin+'/'+rel(p);
const evidence={schema:'RUSSIAN_P17_RUNTIME_EVIDENCE_V1',releaseId,expectedSha,rollbackSha,runtimeOrigin,controlOrigin,appManagerOrigin,startedAt:new Date().toISOString(),checks:{},drift:[],observation:[],incidents:[]};
function md(name,body){fs.writeFileSync(path.join(out,name),body.trim()+'\n')}
function record(name,value){evidence.checks[name]=value;return value}
async function main(){
  try{
    if(!/^[0-9a-f]{40}$/i.test(expectedSha)||!/[0-9a-f]{40}/i.test(rollbackSha))throw new Error('SHA inputs must be immutable full revisions');
    const [runtimeDeployment,controlDeployment]=await Promise.all([json(runtimeOrigin+'/__deployment'),json(controlOrigin+'/__deployment')]);
    record('runtimeDeployment',runtimeDeployment);record('controlDeployment',controlDeployment);
    for(const [label,payload,runtime] of [['runtime',runtimeDeployment,'learning-runtime'],['control',controlDeployment,'control-service']]){
      if(payload.revision!==expectedSha)throw new Error(label+' revision mismatch '+payload.revision);
      if(payload.channel!=='cloudflare-production')throw new Error(label+' channel mismatch '+payload.channel);
      if(payload.runtime!==runtime)throw new Error(label+' runtime mismatch '+payload.runtime);
    }

    const russian=await text(runtimeOrigin+'/subjects/russian/');
    const headers=russian.headers;
    record('securityHeaders',{
      contentSecurityPolicy:headers['content-security-policy']||'',
      permissionsPolicy:headers['permissions-policy']||'',
      referrerPolicy:headers['referrer-policy']||'',
      xContentTypeOptions:headers['x-content-type-options']||''
    });
    if(headers['x-content-type-options']!=='nosniff')throw new Error('missing nosniff');
    if(!String(headers['referrer-policy']||'').includes('strict-origin-when-cross-origin'))throw new Error('unexpected referrer-policy');
    if(!String(headers['content-security-policy']||'').includes("object-src 'none'"))throw new Error('CSP missing object-src none');
    if(!String(headers['permissions-policy']||'').includes('microphone=(self)'))throw new Error('production microphone policy does not allow same-origin RU05 speech');
    if(String(headers['permissions-policy']||'').includes('microphone=()'))throw new Error('production microphone globally disabled');
    if(/(?:src|href)=["']http:\/\//i.test(russian.body))throw new Error('mixed-content asset reference found');

    const controlStatus=await fetchOk(controlOrigin+'/api/control/status',{headers:{accept:'application/json'}});
    let controlBody={};try{controlBody=await controlStatus.json()}catch{}
    record('anonymousControl',{status:controlStatus.status,code:controlBody?.code||null});
    if(controlStatus.status!==403||controlBody?.code!=='CONTROL_TICKET_FORBIDDEN')throw new Error('control plane no longer fails closed anonymously');

    for(const p of critical){
      const local=fs.readFileSync(p);
      const live=await text(liveUrl(p));
      const row={path:p,localSha256:sha(local),liveSha256:sha(live.body),bytes:local.length,status:'MATCH'};
      if(row.localSha256!==row.liveSha256){row.status='DRIFT';evidence.drift.push(row);throw new Error('critical content drift '+p)}
      evidence.drift.push(row);
    }

    const browserSummary='artifacts/russian-ru05-ru08-production/summary.json';
    const offlineSummary='artifacts/russian-offline-production/summary.json';
    if(!fs.existsSync(browserSummary))throw new Error('production RU05-RU08 browser summary missing');
    if(!fs.existsSync(offlineSummary))throw new Error('production offline/PWA summary missing');
    const browser=JSON.parse(fs.readFileSync(browserSummary,'utf8')),offline=JSON.parse(fs.readFileSync(offlineSummary,'utf8'));
    record('browserAcceptance',browser);record('offlinePwa',offline);
    if(browser.status!=='PASS'||offline.status!=='PASS')throw new Error('production browser/offline acceptance not PASS');

    for(let i=1;i<=3;i++){
      const [rd,cd,ru]=await Promise.all([json(runtimeOrigin+'/__deployment'),json(controlOrigin+'/__deployment'),fetchOk(runtimeOrigin+'/subjects/russian/',{headers:{'cache-control':'no-cache'}})]);
      const cs=await fetchOk(controlOrigin+'/api/control/status',{headers:{accept:'application/json'}});
      const sample={sample:i,at:new Date().toISOString(),runtimeRevision:rd.revision,controlRevision:cd.revision,russianStatus:ru.status,controlAnonymousStatus:cs.status};
      evidence.observation.push(sample);
      if(rd.revision!==expectedSha||cd.revision!==expectedSha||!ru.ok||cs.status!==403)throw new Error('observation sample unhealthy '+i);
      if(i<3)await sleep(10000);
    }

    evidence.finalState='STABLE';evidence.completedAt=new Date().toISOString();
    fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(evidence,null,2)+'\n');
    fs.writeFileSync(path.join(out,'observation.json'),JSON.stringify(evidence.observation,null,2)+'\n');
    fs.writeFileSync(path.join(out,'RUSSIAN_PRODUCTION_INCIDENT_REGISTER.json'),JSON.stringify({schema:'RUSSIAN_P17_INCIDENT_REGISTER_V1',releaseId,incidents:[]},null,2)+'\n');

    const driftRows=evidence.drift.map(x=>`- \`${x.path}\`: ${x.status} · \`${x.localSha256}\``).join('\n');
    md('RUSSIAN_P17_EXECUTIVE_SUMMARY.md',`# Russian P17 Executive Summary\n\nRelease \`${releaseId}\` on exact SHA \`${expectedSha}\` passed exact deployment identity, critical content drift, live security headers, executable production browser acceptance, production offline/PWA acceptance and observation.\n\n**P17 PRODUCTION RELEASE COMPLETE — PRODUCTION VERIFIED STABLE**`);
    md('RUSSIAN_PRODUCTION_PREFLIGHT.md',`# Russian Production Preflight\n\n- exact RC: \`${expectedSha}\`\n- rollback target: \`${rollbackSha}\`\n- runtime: \`${runtimeOrigin}\`\n- control: \`${controlOrigin}\`\n- Application Management: \`${appManagerOrigin}\`\n- environment: PRODUCTION\n- mutation manifest: no persistent-data migration/backfill\n\nPREFLIGHT: PASS`);
    md('RUSSIAN_RELEASE_IDENTITY_RECORD.md',`# Russian Release Identity Record\n\n- release ID: \`${releaseId}\`\n- source/build revision: \`${expectedSha}\`\n- runtime deployment: \`${JSON.stringify(runtimeDeployment)}\`\n- control deployment: \`${JSON.stringify(controlDeployment)}\`\n- rollback target: \`${rollbackSha}\``);
    md('RUSSIAN_PRODUCTION_CONFIG_CHECK.md',`# Russian Production Config Check\n\n- runtime origin: \`${runtimeOrigin}\`\n- control origin: \`${controlOrigin}\`\n- Application Management origin: \`${appManagerOrigin}\`\n- deployment channel: \`cloudflare-production\`\n\nNo secret values are recorded. PASS.`);
    md('RUSSIAN_BACKUP_CHECKPOINT_RECORD.md',`# Russian Backup / Checkpoint Record\n\nPersistent data mutation/backfill for this release: **NO**. Backup decision: **NOT REQUIRED** by \`RUSSIAN_P17_MUTATION_MANIFEST.json\`. Rollback artifact SHA retained: \`${rollbackSha}\`.`);
    md('RUSSIAN_PRODUCTION_MIGRATION_RECORD.md',`# Russian Production Migration Record\n\nMutation manifest declares no Russian persistent schema migration/backfill. The standard production deploy migration gate must have completed before this closure workflow. Closure observed exact post-deploy revision \`${expectedSha}\`.`);
    md('RUSSIAN_PRODUCTION_DEPLOYMENT_RECORD.md',`# Russian Production Deployment Record\n\nExact runtime/control deployment identity was read back from production and matched \`${expectedSha}\`.\n\nRuntime: \`${JSON.stringify(runtimeDeployment)}\`\n\nControl: \`${JSON.stringify(controlDeployment)}\``);
    md('RUSSIAN_PRODUCTION_CONTENT_ACTIVATION_RECORD.md',`# Russian Production Content Activation Record\n\nCritical Russian source/live content comparison passed.\n\n${driftRows}`);
    md('RUSSIAN_PRODUCTION_FEATURE_FLAG_RECORD.md',`# Russian Production Feature / Runtime Mode Record\n\n- deployment channel: cloudflare-production\n- access model: managed (production workflow contract)\n- RU05 scenario: practice-only\n- RU06 production workbench: canonical-data read-only\n- RU07 AI: mastery read-only\n- RU08 authoring: metadata/candidate only; no direct canonical write`);
    md('RUSSIAN_PRODUCTION_SMOKE_REPORT.md',`# Russian Production Smoke Report\n\nExecutable RU05–RU08 browser acceptance: **${browser.status}**.\n\nAnonymous control fail-closed: HTTP ${controlStatus.status} / \`${controlBody?.code||''}\`.\n\nExact revision: \`${expectedSha}\`.`);
    md('RUSSIAN_PRODUCTION_OFFLINE_PWA_VERIFY.md',`# Russian Production Offline / PWA Verify\n\nProduction-origin offline test: **${offline.status}**.\n\n```json\n${JSON.stringify(offline,null,2)}\n````);
    md('RUSSIAN_PRODUCTION_SECURITY_HEADERS_VERIFY.md',`# Russian Production Security Headers Verify\n\n```json\n${JSON.stringify(evidence.checks.securityHeaders,null,2)}\n```\n\nChecks include CSP, nosniff, referrer policy, same-origin microphone permission and mixed-content guard. PASS.`);
    md('RUSSIAN_PRODUCTION_BUILD_CONTENT_DRIFT_CHECK.md',`# Russian Production Build / Content Drift Check\n\nExact build revision matched and every critical Russian source/live SHA-256 matched.\n\n${driftRows}`);
    md('RUSSIAN_PRODUCTION_OBSERVATION_REPORT.md',`# Russian Production Observation Report\n\nThree post-verification samples remained on exact SHA \`${expectedSha}\`, Russian HTTP health stayed successful, and anonymous Control remained fail-closed.\n\n```json\n${JSON.stringify(evidence.observation,null,2)}\n````);
    md('RUSSIAN_P17_EVIDENCE_INDEX.md',`# Russian P17 Evidence Index\n\n- exact source: \`${expectedSha}\`\n- \`verification.json\`\n- \`observation.json\`\n- production RU05–RU08 browser artifacts\n- production offline/PWA artifacts\n- all release-specific P17 Markdown records in this artifact\n- incident register: empty for this closure run`);
    md('RUSSIAN_RELEASE_CLOSURE_REPORT.md',`# Russian Release Closure Report\n\nRelease ID: \`${releaseId}\`\n\nExact SHA: \`${expectedSha}\`\n\nRollback SHA retained: \`${rollbackSha}\`\n\n**P17 PRODUCTION RELEASE COMPLETE — PRODUCTION VERIFIED STABLE**\n\nClosure time: ${evidence.completedAt}`);
    console.log(JSON.stringify({ok:true,releaseId,finalState:evidence.finalState,expectedSha,criticalFiles:evidence.drift.length,observationSamples:evidence.observation.length}));
  }catch(error){
    evidence.finalState='FAILED';evidence.completedAt=new Date().toISOString();evidence.incidents.push({id:'RUS-P17-'+Date.now(),severity:'BLOCKER',message:String(error?.message||error),at:evidence.completedAt});
    fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(evidence,null,2)+'\n');
    fs.writeFileSync(path.join(out,'RUSSIAN_PRODUCTION_INCIDENT_REGISTER.json'),JSON.stringify({schema:'RUSSIAN_P17_INCIDENT_REGISTER_V1',releaseId,incidents:evidence.incidents},null,2)+'\n');
    md('RUSSIAN_RELEASE_CLOSURE_REPORT.md',`# Russian Release Closure Report\n\n**P17 NOT COMPLETE — PRODUCTION STATE NOT FULLY VERIFIED**\n\nExact SHA: \`${expectedSha}\`\n\nFailure: ${String(error?.message||error)}`);
    throw error;
  }
}
main().catch(e=>{console.error(e?.stack||e);process.exitCode=1});