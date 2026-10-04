import fs from 'node:fs';
import assert from 'node:assert/strict';
const workflow=fs.readFileSync('.github/workflows/deploy-bauman-production.yml','utf8');
const helper=fs.readFileSync('scripts/russian-release-annex-evidence.mjs','utf8');
const smokeDevice=fs.readFileSync('scripts/russian-production-smoke-device.mjs','utf8');
const runtimeWorker=fs.readFileSync('cloudflare/runtime-worker.mjs','utf8');
const controlDeployment=fs.readFileSync('control-service/src/cloudflare-preview.ts','utf8');
const controlTemplate=fs.readFileSync('control-service/wrangler.production.example.jsonc','utf8');
const runtimeTemplate=fs.readFileSync('wrangler.runtime.production.example.jsonc','utf8');
const productionPackager=fs.readFileSync('scripts/prepare-cloudflare-production.mjs','utf8');
for(const marker of [
 'Verify exact preview revision before production',
 'Materialize immutable Russian release preflight evidence',
 'Record immutable deployment artifact identity',
 'Export Bauman production D1 backup before migration',
 'Apply migrations to Bauman production D1',
 'Bootstrap isolated Russian production smoke device session',
 'Verify Russian production identity, security, offline contract and content drift',
 'Run Russian production subject smoke browser acceptance',
 'Observe exact Russian production revision',
 'Close Russian Release Annex state machine',
 'Upload Russian release closure evidence'
])assert(workflow.includes(marker),'production workflow missing annex gate: '+marker);
for(const evidence of [
 'RUSSIAN_RC_MANIFEST.json',
 'RUSSIAN_PRODUCTION_TARGET_RECORD.json',
 'RUSSIAN_DEPLOYMENT_ARTIFACT_IDENTITY.json',
 'RUSSIAN_PRODUCTION_CONFIG_IDENTITY.json',
 'RUSSIAN_BACKUP_DECISION_RESULT.json',
 'RUSSIAN_MIGRATION_RESULT.json',
 'RUSSIAN_PRODUCTION_SMOKE_REPORT.md',
 'RUSSIAN_PRODUCTION_OFFLINE_PWA_VERIFY.md',
 'RUSSIAN_PRODUCTION_SECURITY_HEADERS_VERIFY.md',
 'RUSSIAN_PRODUCTION_CONFIG_PROFILE_VERIFY.json',
 'RUSSIAN_PRODUCTION_BUILD_CONTENT_DRIFT_CHECK.md',
 'RUSSIAN_PRODUCTION_RU08_JOURNEYS.json',
 'RUSSIAN_PRODUCTION_RU08_AUTHOR.json',
 'RUSSIAN_PRODUCTION_OFFLINE_BROWSER.json',
 'RUSSIAN_PRODUCTION_ISOLATED_WRITE_PROBE.json',
 'RUSSIAN_PRODUCTION_OBSERVATION_REPORT.md',
 'RUSSIAN_PRODUCTION_INCIDENT_REGISTER.json',
 'RUSSIAN_FINAL_PRODUCTION_STATE_RECORD.json',
 'RUSSIAN_P17_EVIDENCE_INDEX.md',
 'RUSSIAN_RELEASE_CLOSURE_REPORT.md'
])assert(helper.includes(evidence),'release helper missing evidence output: '+evidence);
assert(helper.includes("state:'STABLE'"),'STABLE final state missing');
assert(helper.includes('OBSERVATION_PASS'),'observation gate missing');
assert(workflow.includes('tests/russian-ru08-journeys-browser.mjs'),'production learner journey smoke missing');
assert(workflow.includes('tests/russian-ru08-author-browser.mjs'),'production author journey smoke missing');
assert(workflow.includes('tests/russian-offline-shell-browser.mjs'),'production offline browser smoke missing');
assert(!workflow.includes('secrets.BAUMAN_CONTROL_SERVICE_SECRET'),'production release must not require duplicating the manager-owned control secret into GitHub Actions');
assert(workflow.includes('scripts/russian-production-smoke-device.mjs bootstrap'),'ephemeral production smoke-device bootstrap missing');
assert(workflow.includes('scripts/russian-production-smoke-device.mjs cleanup'),'ephemeral production smoke-device cleanup missing');
assert(workflow.includes('BAUMAN_E2E_DEVICE_SESSION: ${{ env.BAUMAN_PRODUCTION_SMOKE_DEVICE_SESSION }}'),'browser smoke must consume the run-scoped ephemeral device session');
assert(!workflow.includes('secrets.BAUMAN_PRODUCTION_SMOKE_DEVICE_SESSION'),'release must not depend on an expiring pre-provisioned smoke session secret');
assert(smokeDevice.includes('runProductionD1')&&smokeDevice.includes('release-ci-direct-d1'),'smoke bootstrap must use the audited release-only production D1 lifecycle');
assert(smokeDevice.includes("state='revoked'")&&smokeDevice.includes("status='blocked'"),'smoke cleanup must revoke sessions and block the ephemeral device in production D1');
assert(smokeDevice.includes("name: 'ECDSA'")&&smokeDevice.includes("namedCurve: 'P-256'"),'smoke bootstrap must prove the canonical P-256 device identity flow');
assert(helper.includes('RUSSIAN_PRODUCTION_ISOLATED_WRITE_PROBE.json'),'isolated production write-probe evidence missing');
assert(helper.includes('anonymousProtectedStatus')&&helper.includes('authenticatedProtectedStatus'),'production protected-data smoke must prove anonymous fail-closed and authenticated access');
assert(helper.includes('configFingerprint'),'release helper must verify live production config fingerprint');
assert(helper.includes('controlSecretConfigured'),'release helper must verify control-secret readiness');
assert(controlDeployment.includes('controlSecretConfigured'),'control deployment identity must expose non-secret secret readiness');
assert(controlDeployment.includes('bm_content_reviews')&&controlDeployment.includes('bm_content_review_commands'),'deployment database readiness must cover current Content Review schema');
assert(workflow.includes('migrationManifestSha256')&&workflow.includes('outputLogSha256'),'migration result must bind exact manifest and execution log');
assert(helper.includes('migrationManifestSha256!==rc.migrationManifestSha256'),'STABLE closure must reject migration-manifest drift');
assert(helper.includes('production rollback identity unavailable'),'preflight must block without exact rollback identities');
assert(workflow.indexOf('Dry-run all production artifacts before any remote mutation')<workflow.indexOf('Record immutable deployment artifact identity'),'artifact identity must be recorded after both dry-run builds');
assert(helper.includes("control-service/dist-production")&&helper.includes(".wrangler/runtime-production"),'artifact identity must cover both Worker dry-run bundles');
assert.match(runtimeWorker,/microphone=\(self\)/,'production runtime must permit same-origin microphone for Russian speaking');
assert.doesNotMatch(runtimeWorker,/microphone=\(\)/,'production runtime must not globally disable microphone');
assert(controlTemplate.includes('__BAUMAN_CONFIG_FINGERPRINT__'),'control production config fingerprint missing');
assert(runtimeTemplate.includes('__BAUMAN_CONFIG_FINGERPRINT__'),'runtime production config fingerprint missing');
assert(productionPackager.includes("fs.cpSync(path.join(root, 'platform', 'ui'), path.join(runtimeDist, 'platform', 'ui'), { recursive: true });"),'production runtime must package shared platform UI');
for(const asset of [
 'platform/ui/tokens.css',
 'platform/ui/foundations.css',
 'platform/ui/components.css',
 'platform/ui/layouts.css',
 'platform/ui/responsive.css',
 'platform/ui/bauman-ui.css',
 'platform/ui/bauman-ui.js'
])assert(productionPackager.includes("'"+asset+"'"),'production runtime preflight must require shared platform UI asset: '+asset);
assert(workflow.indexOf('Close Russian Release Annex state machine')<workflow.indexOf('Production deployment summary'),'summary must occur only after closure');
assert(!/Bauman production deployment completed\./.test(workflow),'workflow must not declare completion immediately after deploy/smoke');
console.log(JSON.stringify({ok:true,annexGates:10,evidenceOutputs:20,productionBrowserJourneys:3,configFingerprint:true,secretReadiness:true,currentSchema:true,migrationBound:true,rollbackBound:true,fullArtifactIdentity:true,microphonePolicy:'self'}));