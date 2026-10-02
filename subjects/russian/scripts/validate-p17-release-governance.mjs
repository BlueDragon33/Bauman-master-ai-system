import fs from 'node:fs';
import assert from 'node:assert/strict';
const base='subjects/russian/docs/p17/';
const required=[
 'RUSSIAN_P17_EXECUTIVE_SUMMARY.md','RUSSIAN_PRODUCTION_PREFLIGHT.md','RUSSIAN_RELEASE_IDENTITY_RECORD.md',
 'RUSSIAN_PRODUCTION_CONFIG_CHECK.md','RUSSIAN_BACKUP_CHECKPOINT_RECORD.md','RUSSIAN_PRODUCTION_MIGRATION_RECORD.md',
 'RUSSIAN_PRODUCTION_DEPLOYMENT_RECORD.md','RUSSIAN_PRODUCTION_CONTENT_ACTIVATION_RECORD.md','RUSSIAN_PRODUCTION_FEATURE_FLAG_RECORD.md',
 'RUSSIAN_PRODUCTION_SMOKE_REPORT.md','RUSSIAN_PRODUCTION_OFFLINE_PWA_VERIFY.md','RUSSIAN_PRODUCTION_SECURITY_HEADERS_VERIFY.md',
 'RUSSIAN_PRODUCTION_BUILD_CONTENT_DRIFT_CHECK.md','RUSSIAN_PRODUCTION_OBSERVATION_REPORT.md',
 'RUSSIAN_PRODUCTION_INCIDENT_REGISTER.json','RUSSIAN_P17_EVIDENCE_INDEX.md','RUSSIAN_RELEASE_CLOSURE_REPORT.md'
];
for(const name of required){
 const p=base+name;assert(fs.existsSync(p),'missing P17 deliverable '+p);
 const content=fs.readFileSync(p,'utf8').trim();assert(content.length>120,'P17 deliverable is ceremonial/empty: '+p);
}
const manifest=JSON.parse(fs.readFileSync(base+'RUSSIAN_P17_MUTATION_MANIFEST.json','utf8'));
assert.equal(manifest.persistentDataMutation,false);
assert.equal(manifest.databaseMigrationRequired,false);
assert.equal(manifest.serviceWorkerChange,true);
assert(Array.isArray(manifest.requiredPostDeploy)&&manifest.requiredPostDeploy.includes('observation'));

const closure=fs.readFileSync('.github/workflows/russian-production-release-closure.yml','utf8');
for(const marker of ['VERIFY_PRODUCTION','expected_sha','rollback_sha','russian-ru05-ru08-acceptance-browser.mjs','russian-offline-shell-browser.mjs','russian-p17-production-verify.mjs','PRODUCTION VERIFIED STABLE'])assert(closure.includes(marker),'P17 closure workflow missing '+marker);
assert(closure.includes('cancel-in-progress: false'),'release closure must serialize, not cancel an in-flight verification');

const deploy=fs.readFileSync('.github/workflows/deploy-bauman-production.yml','utf8');
assert(deploy.includes('ARTIFACT_DEPLOYED'),'production deploy must explicitly stop before STABLE');
assert(deploy.includes('do not call STABLE'),'production deploy wording must remain truthful');

const runtime=fs.readFileSync('cloudflare/runtime-worker.mjs','utf8');
assert(runtime.includes('microphone=(self)'),'production permissions policy must allow same-origin microphone');
assert(!runtime.includes('microphone=()'),'production permissions policy must not disable RU05 speech');
const verifier=fs.readFileSync('scripts/russian-p17-production-verify.mjs','utf8');
for(const marker of ['critical content drift','microphone=(self)','russian-ru05-ru08-production','russian-offline-production','observation','P17 PRODUCTION RELEASE COMPLETE'])assert(verifier.includes(marker),'P17 verifier missing '+marker);

const incident=JSON.parse(fs.readFileSync(base+'RUSSIAN_PRODUCTION_INCIDENT_REGISTER.json','utf8'));
assert(incident.incidents.some(x=>x.id==='RUS-P17-20261002-EVIDENCE-GAP'),'historical evidence-gap defect must remain auditable');
console.log(JSON.stringify({ok:true,deliverables:required.length,closureWorkflow:true,microphonePolicy:'self'}));