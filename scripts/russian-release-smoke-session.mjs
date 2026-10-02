import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const mode=process.argv[2]||'';
const out=process.env.RUSSIAN_RELEASE_EVIDENCE_DIR||'artifacts/russian-release-annex';
const revision=process.env.GITHUB_SHA||'';
const runId=process.env.GITHUB_RUN_ID||'local';
const planPath=path.join(out,'RUSSIAN_PRODUCTION_SMOKE_IDENTITY_PLAN.json');
const provisionResultPath=path.join(out,'RUSSIAN_PRODUCTION_SMOKE_IDENTITY_PROVISION_RESULT.json');
const cleanupResultPath=path.join(out,'RUSSIAN_PRODUCTION_SMOKE_IDENTITY_CLEANUP_RESULT.json');

function ensureOut(){fs.mkdirSync(out,{recursive:true});}
function iso(){return new Date().toISOString();}
function sha256(value){return crypto.createHash('sha256').update(value).digest('hex');}
function b64url(bytes){return Buffer.from(bytes).toString('base64url');}
function sql(value){return "'" + String(value).replaceAll("'","''") + "'";}
function readJson(file){return JSON.parse(fs.readFileSync(file,'utf8'));}
function writeJson(file,value){fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');}
function displayCode(deviceId){
  const key=deviceId.slice(0,16).toUpperCase();
  return 'BM-'+key.slice(0,4)+'-'+key.slice(4,8)+'-'+key.slice(8,12)+'-'+key.slice(12,16);
}
function resultRows(payload){
  const entries=Array.isArray(payload)?payload:[payload];
  const rows=[];
  for(const entry of entries){
    if(Array.isArray(entry?.results))rows.push(...entry.results);
    if(Array.isArray(entry?.result))rows.push(...entry.result);
  }
  return rows;
}
function countRow(file){
  const payload=readJson(file);
  const rows=resultRows(payload);
  const row=[...rows].reverse().find(value=>value&&typeof value==='object'&&('smoke_device_count' in value||'smoke_session_count' in value));
  if(!row)throw new Error('Wrangler D1 output does not contain smoke identity count evidence.');
  return {
    device:Number(row.smoke_device_count),
    session:Number(row.smoke_session_count),
    outputSha256:sha256(fs.readFileSync(file)),
  };
}
async function prepare(){
  if(!revision)throw new Error('GITHUB_SHA is required for production smoke identity.');
  ensureOut();
  const pair=await crypto.webcrypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
  const publicJwk=await crypto.webcrypto.subtle.exportKey('jwk',pair.publicKey);
  const canonical=JSON.stringify({crv:'P-256',kty:'EC',x:publicJwk.x,y:publicJwk.y});
  const deviceId=sha256(canonical);
  const deviceCode=displayCode(deviceId);
  const token='bm1.'+b64url(crypto.randomBytes(32));
  const sessionHash=sha256(token);
  const now=Date.now();
  const expiresAt=now+2*60*60*1000;
  const actor='release-annex:'+runId;
  const publicJwkJson=JSON.stringify({kty:'EC',crv:'P-256',x:publicJwk.x,y:publicJwk.y,ext:true});
  const provisionSql=[
    'INSERT INTO bm_devices (device_id, display_code, public_jwk_json, device_type, platform, browser, display_name, label, status, edit_enabled, last_seen_at, approved_at, approved_by)',
    'VALUES ('+[deviceId,deviceCode,publicJwkJson,'desktop','GitHub Actions','Playwright Chromium','Russian Release Smoke','Release Annex ephemeral smoke','approved'].map(sql).join(', ')+', 0, '+now+", CURRENT_TIMESTAMP, "+sql(actor)+');',
    'INSERT INTO bm_device_sessions (session_hash, device_id, state, expires_at, last_seen_at) VALUES ('+sql(sessionHash)+', '+sql(deviceId)+", 'active', "+expiresAt+', '+now+');',
    'INSERT INTO bm_audit_log (actor, action, target, detail_json) VALUES ('+sql(actor)+", 'release_smoke_identity_provisioned', "+sql(deviceId)+', '+sql(JSON.stringify({revision,runId,expiresAt}))+');',
    'SELECT (SELECT COUNT(*) FROM bm_devices WHERE device_id='+sql(deviceId)+') AS smoke_device_count, (SELECT COUNT(*) FROM bm_device_sessions WHERE session_hash='+sql(sessionHash)+' AND device_id='+sql(deviceId)+" AND state='active') AS smoke_session_count;",
    ''
  ].join('\n');
  const cleanupSql=[
    "UPDATE bm_device_sessions SET state='revoked', revoked_at=CURRENT_TIMESTAMP, revoked_by="+sql(actor)+" WHERE session_hash="+sql(sessionHash)+" AND device_id="+sql(deviceId)+" AND state='active';",
    'DELETE FROM bm_device_sessions WHERE session_hash='+sql(sessionHash)+' AND device_id='+sql(deviceId)+';',
    'DELETE FROM bm_device_challenges WHERE device_id='+sql(deviceId)+';',
    'DELETE FROM bm_devices WHERE device_id='+sql(deviceId)+';',
    'INSERT INTO bm_audit_log (actor, action, target, detail_json) VALUES ('+sql(actor)+", 'release_smoke_identity_cleaned', "+sql(deviceId)+', '+sql(JSON.stringify({revision,runId}))+');',
    'SELECT (SELECT COUNT(*) FROM bm_devices WHERE device_id='+sql(deviceId)+') AS smoke_device_count, (SELECT COUNT(*) FROM bm_device_sessions WHERE session_hash='+sql(sessionHash)+' OR device_id='+sql(deviceId)+') AS smoke_session_count;',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(out,'russian-smoke-provision.sql'),provisionSql,{mode:0o600});
  fs.writeFileSync(path.join(out,'russian-smoke-cleanup.sql'),cleanupSql,{mode:0o600});
  writeJson(planPath,{
    schema:'RUSSIAN_PRODUCTION_SMOKE_IDENTITY_PLAN_V1',
    status:'PREPARED',
    generatedAt:iso(),
    revision,
    runId,
    deviceId,
    deviceCode,
    sessionHash,
    expiresAt,
    ttlSeconds:Math.floor((expiresAt-now)/1000),
    credentialPersisted:false,
    tokenStoredInEvidence:false,
    provisionSqlSha256:sha256(provisionSql),
    cleanupSqlSha256:sha256(cleanupSql),
  });
  process.stdout.write(token);
}
function markProvisioned(outputFile){
  ensureOut();
  const plan=readJson(planPath);
  if(plan.revision!==revision)throw new Error('Smoke identity plan revision mismatch.');
  const counts=countRow(outputFile);
  if(counts.device!==1||counts.session!==1)throw new Error('Ephemeral smoke identity was not materialized exactly once.');
  writeJson(provisionResultPath,{
    schema:'RUSSIAN_PRODUCTION_SMOKE_IDENTITY_PROVISION_RESULT_V1',
    status:'PASS',
    generatedAt:iso(),
    revision,
    runId,
    deviceId:plan.deviceId,
    expiresAt:plan.expiresAt,
    smokeDeviceCount:counts.device,
    activeSessionCount:counts.session,
    outputSha256:counts.outputSha256,
    credentialPersisted:false,
  });
}
function markCleaned(outputFile){
  ensureOut();
  const plan=readJson(planPath);
  const counts=countRow(outputFile);
  if(counts.device!==0||counts.session!==0)throw new Error('Ephemeral smoke identity residue remains in production D1.');
  writeJson(cleanupResultPath,{
    schema:'RUSSIAN_PRODUCTION_SMOKE_IDENTITY_CLEANUP_RESULT_V1',
    status:'PASS',
    generatedAt:iso(),
    revision,
    runId,
    deviceId:plan.deviceId,
    smokeDeviceCount:counts.device,
    remainingSessionCount:counts.session,
    outputSha256:counts.outputSha256,
  });
}
if(mode==='prepare')await prepare();
else if(mode==='provisioned')markProvisioned(process.argv[3]);
else if(mode==='cleaned')markCleaned(process.argv[3]);
else throw new Error('mode must be prepare, provisioned, or cleaned');
