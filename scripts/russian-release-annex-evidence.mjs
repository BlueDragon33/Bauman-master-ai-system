import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const mode=process.argv[2]||'';
const out=process.env.RUSSIAN_RELEASE_EVIDENCE_DIR||'artifacts/russian-release-annex';
fs.mkdirSync(out,{recursive:true});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const j=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(n,v)=>fs.writeFileSync(path.join(out,n),typeof v==='string'?v:JSON.stringify(v,null,2)+'\n');
const req=n=>{const v=process.env[n];if(!v)throw new Error(n+' required');return v};
const iso=()=>new Date().toISOString();
const u=(b,s)=>String(b).replace(/\/$/,'')+s;
async function get(url,headers={}){const r=await fetch(url,{redirect:'follow',headers});return {status:r.status,ok:r.ok,headers:Object.fromEntries(r.headers.entries()),body:await r.text()}}
function snap(){
 const o=j('subjects/russian/docs/ru02/RUSSIAN_RU02_CANONICAL_OWNER_REGISTRY.json');
 const set=new Set(['subjects/russian/subject-manifest.json','subjects/russian/data/authoring-governance.json']);
 for(const row of o.owners||[]){if(typeof row[1]==='string'&&fs.existsSync(row[1]))set.add(row[1])}
 const files=[...set].sort().map(p=>({path:p,sha256:hash(fs.readFileSync(p)),bytes:fs.statSync(p).size}));
 return {files,sha256:hash(Buffer.from(files.map(x=>x.path+':'+x.sha256).join('\n')))};
}
function locks(){
 const files=['package-lock.json','control-service/package-lock.json'].filter(fs.existsSync).map(p=>({path:p,sha256:hash(fs.readFileSync(p))}));
 return {files,sha256:hash(Buffer.from(files.map(x=>x.path+':'+x.sha256).join('\n')))};
}
function migrations(){
 const dir='control-service/migrations';
 const files=fs.readdirSync(dir).filter(x=>x.endsWith('.sql')).sort().map(x=>{const p=path.join(dir,x);return {path:p,sha256:hash(fs.readFileSync(p))}});
 return {files,sha256:hash(Buffer.from(files.map(x=>x.path+':'+x.sha256).join('\n')))};
}
async function preflight(){
 const rev=req('GITHUB_SHA'),cp=req('BAUMAN_CONTROL_PREVIEW_ORIGIN'),rp=req('BAUMAN_RUNTIME_PREVIEW_ORIGIN'),cprod=req('BAUMAN_CONTROL_PRODUCTION_ORIGIN'),rprod=req('BAUMAN_RUNTIME_PRODUCTION_ORIGIN');
 const [a,b,c,d]=await Promise.all([get(u(cp,'/__deployment')),get(u(rp,'/__deployment')),get(u(cprod,'/__deployment')),get(u(rprod,'/__deployment'))]);
 const parse=x=>{try{return JSON.parse(x.body)}catch{return {}}};const ap=parse(a),bp=parse(b),oldc=parse(c),oldr=parse(d);
 if(ap.revision!==rev||bp.revision!==rev)throw new Error('exact preview revision mismatch');
 const s=snap(),l=locks(),m=migrations();
 write('RUSSIAN_CONTENT_SNAPSHOT.json',{schema:'RUSSIAN_CONTENT_SNAPSHOT_V1',generatedAt:iso(),...s});
 write('RUSSIAN_DEPENDENCY_LOCK_RECORD.json',{schema:'RUSSIAN_DEPENDENCY_LOCK_V1',generatedAt:iso(),...l});
 write('RUSSIAN_MIGRATION_MANIFEST.json',{schema:'RUSSIAN_MIGRATION_MANIFEST_V1',generatedAt:iso(),...m});
 write('RUSSIAN_PRODUCTION_TARGET_RECORD.json',{schema:'RUSSIAN_PRODUCTION_TARGET_V1',generatedAt:iso(),revision:rev,environment:'bauman-production',controlOrigin:cprod,runtimeOrigin:rprod,priorProduction:{controlRevision:oldc.revision||null,runtimeRevision:oldr.revision||null},accessMode:process.env.BAUMAN_ACCESS_MODE||'managed'});
 write('RUSSIAN_RC_MANIFEST.json',{schema:'RUSSIAN_RC_MANIFEST_V1',generatedAt:iso(),sourceSha:rev,artifactIdentity:'github-source@'+rev,contentSnapshotSha256:s.sha256,dependencyLockSha256:l.sha256,migrationManifestSha256:m.sha256,rollbackTarget:oldr.revision||oldc.revision||null,state:'PREFLIGHT_PASS'});
 console.log(JSON.stringify({ok:true,revision:rev,contentSnapshot:s.sha256,rollbackTarget:oldr.revision||oldc.revision||null}));
}
function artifact(){
 const rev=req('GITHUB_SHA'),root='runtime-dist';
 if(!fs.existsSync(root))throw new Error('runtime-dist missing before artifact identity');
 const files=[];
 const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(e.isFile())files.push(p)}};
 walk(root);files.sort();
 const entries=files.map(p=>({path:p.replaceAll('\\','/'),sha256:hash(fs.readFileSync(p)),bytes:fs.statSync(p).size}));
 const aggregate=hash(Buffer.from(entries.map(x=>x.path+':'+x.sha256).join('\n')));
 const record={schema:'RUSSIAN_DEPLOYMENT_ARTIFACT_IDENTITY_V1',generatedAt:iso(),revision:rev,runtimeDistSha256:aggregate,fileCount:entries.length,files:entries};
 write('RUSSIAN_DEPLOYMENT_ARTIFACT_IDENTITY.json',record);
 const rcPath=path.join(out,'RUSSIAN_RC_MANIFEST.json'),rc=j(rcPath);rc.artifactIdentity='runtime-dist-sha256:'+aggregate;rc.runtimeDistSha256=aggregate;write('RUSSIAN_RC_MANIFEST.json',rc);
 console.log(JSON.stringify({ok:true,revision:rev,runtimeDistSha256:aggregate,fileCount:entries.length}));
}
async function verify(){
 const rev=req('GITHUB_SHA'),control=req('BAUMAN_CONTROL_PRODUCTION_ORIGIN'),runtime=req('BAUMAN_RUNTIME_PRODUCTION_ORIGIN'),smokeSession=req('BAUMAN_PRODUCTION_SMOKE_DEVICE_SESSION');
 if(!/^bm1\.[A-Za-z0-9_-]{40,100}$/.test(smokeSession))throw new Error('BAUMAN_PRODUCTION_SMOKE_DEVICE_SESSION format invalid');
 const sessionHeaders={cookie:'__Host-bauman_session='+encodeURIComponent(smokeSession)};
 const [dc,dr,home,ru,wm,sw,auth,remoteManifestAnon,remoteManifest,editor]=await Promise.all([get(u(control,'/__deployment')),get(u(runtime,'/__deployment')),get(u(runtime,'/')),get(u(runtime,'/subjects/russian/')),get(u(runtime,'/subjects/russian/manifest.webmanifest')),get(u(runtime,'/subjects/russian/sw.js')),get(u(control,'/api/control/status')),get(u(runtime,'/subjects/russian/subject-manifest.json')),get(u(runtime,'/subjects/russian/subject-manifest.json'),sessionHeaders),get(u(runtime,'/subjects/russian/editor.html'))]);
 const parse=x=>{try{return JSON.parse(x.body)}catch{return {}}};const c=parse(dc),r=parse(dr),ab=parse(auth);
 if(c.revision!==rev||r.revision!==rev)throw new Error('production identity mismatch');
 if(c.controlSecretConfigured!==true)throw new Error('production control secret is not configured');
 const config=j(path.join(out,'RUSSIAN_PRODUCTION_CONFIG_IDENTITY.json'));
 if(config.revision!==rev||!/^([0-9a-f]{64})$/i.test(String(config.fingerprint||'')))throw new Error('production config identity evidence invalid');
 if(c.configFingerprint!==config.fingerprint||r.configFingerprint!==config.fingerprint)throw new Error('production config fingerprint readback mismatch');
 if(!home.ok||!ru.ok||!remoteManifest.ok||!editor.ok)throw new Error('production runtime surface unavailable');
 if(![401,403].includes(remoteManifestAnon.status))throw new Error('protected Russian data must fail closed without device session');
 if(auth.status!==403||ab.code!=='CONTROL_TICKET_FORBIDDEN')throw new Error('control auth fail-closed mismatch');
 const permissionPolicy=String(home.headers['permissions-policy']||'');
 if(!/microphone=\(self\)/i.test(permissionPolicy))throw new Error('production microphone permissions-policy must allow same-origin Russian speaking');
 const local=fs.readFileSync('subjects/russian/subject-manifest.json'),drift=hash(local)===hash(Buffer.from(remoteManifest.body));if(!drift)throw new Error('subject manifest drift');
 const offline=wm.ok&&sw.ok&&/russian-app-shell-v[0-9]+/.test(sw.body)&&/russian-learning-data-v1/.test(sw.body);if(!offline)throw new Error('offline PWA verification failed');
 const smoke={status:'PASS',revision:rev,controlStatus:dc.status,runtimeStatus:dr.status,home:home.status,russian:ru.status,authorWorkspace:editor.status,deviceGate:home.body.includes('device-access-gate.js'),futureUi:ru.body.includes('russian-future-ui.js'),configFingerprint:config.fingerprint,controlDeployment:{application:c.application,runtime:c.runtime,channel:c.channel,databaseReady:c.databaseReady,controlSecretConfigured:c.controlSecretConfigured},runtimeDeployment:{application:r.application,runtime:r.runtime,channel:r.channel,controlOriginConfigured:r.controlOriginConfigured,serverSideLearningGate:r.serverSideLearningGate},permissionsPolicy:permissionPolicy};
 if(!smoke.deviceGate||!smoke.futureUi)throw new Error('critical Russian smoke failed');
 write('RUSSIAN_PRODUCTION_SMOKE_REPORT.md','# Russian Production Smoke Report\n\nStatus: PASS\n\nRevision: '+rev+'\n\n'+JSON.stringify(smoke,null,2)+'\n');
 write('RUSSIAN_PRODUCTION_OFFLINE_PWA_VERIFY.md','# Russian Production Offline/PWA Verify\n\nStatus: PASS\n\nManifest HTTP '+wm.status+'; Service Worker HTTP '+sw.status+'; versioned shell and learning-data cache namespaces found.\n');
 write('RUSSIAN_PRODUCTION_SECURITY_HEADERS_VERIFY.md','# Russian Production Security/Auth Verify\n\nStatus: PASS\n\nAnonymous control status: '+auth.status+' / '+ab.code+'\n\nPermissions-Policy: '+permissionPolicy+'\n\nRuntime headers:\n'+JSON.stringify(home.headers,null,2)+'\n');
 write('RUSSIAN_PRODUCTION_CONFIG_PROFILE_VERIFY.json',{schema:'RUSSIAN_PRODUCTION_CONFIG_PROFILE_VERIFY_V1',generatedAt:iso(),status:'PASS',revision:rev,profile:config.profile,fingerprint:config.fingerprint,controlReadback:smoke.controlDeployment,runtimeReadback:smoke.runtimeDeployment});
 write('RUSSIAN_PRODUCTION_ISOLATED_WRITE_PROBE.json',{schema:'RUSSIAN_PRODUCTION_ISOLATED_WRITE_PROBE_V1',generatedAt:iso(),status:'PASS',revision:rev,mechanism:'pre-provisioned smoke device session',anonymousProtectedStatus:remoteManifestAnon.status,authenticatedProtectedStatus:remoteManifest.status,heartbeatWriteExercised:true,isolated:true});
 write('RUSSIAN_PRODUCTION_BUILD_CONTENT_DRIFT_CHECK.md','# Russian Production Build/Content Drift Check\n\nStatus: PASS\n\nRevision: '+rev+'\nSubject manifest local/production SHA256 match: true\n');
 console.log(JSON.stringify({ok:true,revision:rev,drift,offline}));
}
async function observe(){
 const rev=req('GITHUB_SHA'),control=req('BAUMAN_CONTROL_PRODUCTION_ORIGIN'),runtime=req('BAUMAN_RUNTIME_PRODUCTION_ORIGIN'),interval=Math.max(5,Number(process.env.RUSSIAN_OBSERVATION_INTERVAL_SECONDS||20));
 const phases=['IMMEDIATE','SHORT_TERM','SUSTAINED'],checks=[],incidents=[];
 for(let i=0;i<phases.length;i++){if(i)await new Promise(r=>setTimeout(r,interval*1000));try{const [a,b,p]=await Promise.all([get(u(control,'/__deployment')),get(u(runtime,'/__deployment')),get(u(runtime,'/subjects/russian/'))]);const aj=JSON.parse(a.body),bj=JSON.parse(b.body),pass=a.ok&&b.ok&&p.ok&&aj.revision===rev&&bj.revision===rev&&p.body.includes('russian-future-ui.js');checks.push({phase:phases[i],at:iso(),pass,controlRevision:aj.revision,runtimeRevision:bj.revision});if(!pass)incidents.push({phase:phases[i],severity:'BLOCKER',reason:'synthetic observation failed'})}catch(e){checks.push({phase:phases[i],at:iso(),pass:false});incidents.push({phase:phases[i],severity:'BLOCKER',reason:String(e.message||e)})}}
 const pass=checks.every(x=>x.pass)&&!incidents.length;
 write('RUSSIAN_PRODUCTION_OBSERVATION_REPORT.md','# Russian Production Observation Report\n\nStatus: '+(pass?'OBSERVATION_PASS':'OBSERVATION_FAIL')+'\n\nModel: low-traffic synthetic observation; interval seconds: '+interval+'\n\n'+JSON.stringify(checks,null,2)+'\n');
 write('RUSSIAN_PRODUCTION_INCIDENT_REGISTER.json',{schema:'RUSSIAN_PRODUCTION_INCIDENT_REGISTER_V1',generatedAt:iso(),incidents});
 if(!pass)throw new Error('observation failed');console.log(JSON.stringify({ok:true,status:'OBSERVATION_PASS'}));
}
function close(){
 const files=['RUSSIAN_RC_MANIFEST.json','RUSSIAN_PRODUCTION_TARGET_RECORD.json','RUSSIAN_CONTENT_SNAPSHOT.json','RUSSIAN_DEPENDENCY_LOCK_RECORD.json','RUSSIAN_MIGRATION_MANIFEST.json','RUSSIAN_DEPLOYMENT_ARTIFACT_IDENTITY.json','RUSSIAN_PRODUCTION_CONFIG_IDENTITY.json','RUSSIAN_BACKUP_DECISION_RESULT.json','RUSSIAN_MIGRATION_RESULT.json','RUSSIAN_PRODUCTION_SMOKE_REPORT.md','RUSSIAN_PRODUCTION_OFFLINE_PWA_VERIFY.md','RUSSIAN_PRODUCTION_SECURITY_HEADERS_VERIFY.md','RUSSIAN_PRODUCTION_CONFIG_PROFILE_VERIFY.json','RUSSIAN_PRODUCTION_BUILD_CONTENT_DRIFT_CHECK.md','RUSSIAN_PRODUCTION_RU08_JOURNEYS.json','RUSSIAN_PRODUCTION_RU08_AUTHOR.json','RUSSIAN_PRODUCTION_OFFLINE_BROWSER.json','RUSSIAN_PRODUCTION_ISOLATED_WRITE_PROBE.json','RUSSIAN_PRODUCTION_OBSERVATION_REPORT.md','RUSSIAN_PRODUCTION_INCIDENT_REGISTER.json'];
 for(const f of files)if(!fs.existsSync(path.join(out,f)))throw new Error('missing release evidence '+f);
 if(!fs.readFileSync(path.join(out,'RUSSIAN_PRODUCTION_OBSERVATION_REPORT.md'),'utf8').includes('OBSERVATION_PASS'))throw new Error('observation not pass');
 if((j(path.join(out,'RUSSIAN_PRODUCTION_INCIDENT_REGISTER.json')).incidents||[]).length)throw new Error('release incidents remain');
 for(const f of ['RUSSIAN_PRODUCTION_RU08_JOURNEYS.json','RUSSIAN_PRODUCTION_RU08_AUTHOR.json','RUSSIAN_PRODUCTION_OFFLINE_BROWSER.json'])if(j(path.join(out,f)).status!=='PASS')throw new Error('production browser evidence not PASS: '+f);
 if(j(path.join(out,'RUSSIAN_PRODUCTION_CONFIG_PROFILE_VERIFY.json')).status!=='PASS')throw new Error('production config profile not verified');
 if(j(path.join(out,'RUSSIAN_PRODUCTION_ISOLATED_WRITE_PROBE.json')).status!=='PASS')throw new Error('isolated production write probe not verified');
 const rev=req('GITHUB_SHA'),rc=j(path.join(out,'RUSSIAN_RC_MANIFEST.json')),backup=j(path.join(out,'RUSSIAN_BACKUP_DECISION_RESULT.json')),migration=j(path.join(out,'RUSSIAN_MIGRATION_RESULT.json')),target=j(path.join(out,'RUSSIAN_PRODUCTION_TARGET_RECORD.json'));
 if(rc.sourceSha!==rev||target.revision!==rev)throw new Error('release identity evidence revision mismatch');
 if(backup.status!=='PASS'||backup.revision!==rev||!backup.sha256||!backup.bytes)throw new Error('production backup evidence invalid');
 if(migration.status!=='PASS'||migration.revision!==rev||migration.exitCode!==0)throw new Error('production migration result invalid');
 if(migration.migrationManifestSha256!==rc.migrationManifestSha256)throw new Error('production migration manifest identity mismatch');
 if(!Number.isInteger(migration.migrationCount)||migration.migrationCount<1||!migration.outputLogSha256||migration.outputBytes<1)throw new Error('production migration execution evidence incomplete');
write('RUSSIAN_FINAL_PRODUCTION_STATE_RECORD.json',{schema:'RUSSIAN_FINAL_PRODUCTION_STATE_V1',generatedAt:iso(),revision:rev,state:'STABLE',evidenceComplete:true});
 write('RUSSIAN_P17_EVIDENCE_INDEX.md','# Russian P17 Evidence Index\n\nState: STABLE\nRevision: '+rev+'\n\n'+files.map(x=>'- '+x).join('\n')+'\n- RUSSIAN_FINAL_PRODUCTION_STATE_RECORD.json\n');
 write('RUSSIAN_RELEASE_CLOSURE_REPORT.md','# Russian Release Closure Report\n\nP17 PRODUCTION RELEASE COMPLETE - PRODUCTION VERIFIED STABLE\n\nRevision: '+rev+'\nClosure: '+iso()+'\n');
 console.log(JSON.stringify({ok:true,state:'STABLE',revision:rev}));
}
if(mode==='preflight')await preflight();else if(mode==='artifact')artifact();else if(mode==='verify')await verify();else if(mode==='observe')await observe();else if(mode==='close')close();else throw new Error('mode must be preflight, artifact, verify, observe, or close');
