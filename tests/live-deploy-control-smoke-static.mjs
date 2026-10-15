import assert from 'node:assert/strict';
import fs from 'node:fs';

const workflow=fs.readFileSync('.github/workflows/live-development-deploy.yml','utf8');

for(const token of [
  'BAUMAN_CONTROL_PRODUCTION_ORIGIN/__deployment',
  'BAUMAN_RUNTIME_PRODUCTION_ORIGIN/__deployment',
  'BAUMAN_EXPECTED_RUNTIME="control-service"',
  'BAUMAN_EXPECTED_RUNTIME="learning-runtime"',
  'control.databaseReady !== true',
  'control.controlSecretConfigured !== true',
  'control.applicationManagementOriginConfigured !== true',
  'control.appOriginConfigured !== true',
  'runtime.controlOriginConfigured !== true',
  "runtime.accessMode !== 'standalone'",
  'runtime.serverSideLearningGate !== false',
  'CONTROL_TICKET_FORBIDDEN',
  'BAUMAN_RUNTIME_PRODUCTION_ORIGIN/__control-link',
  'subjects/entrepreneurship/',
  'subjects/ergonomics/',
  'subjects/mivar/',
  'subjects/foreign-language/',
  'subjects/security-elective/',
  'subjects/specialization-elective/',
  'subjects/practice-workflow/',
  'Study-plan module routes PASS.',
  'scripts/list-study-plan-runtime-routes.mjs',
  'All manifest-driven study-plan runtime routes PASS',
  'subjects/entrepreneurship/data/curriculum.json',
  'Standalone learning-data access PASS.',
  'Bauman live Control + Runtime availability PASS.',
]){
  assert.ok(workflow.includes(token), `Live deploy verification missing: ${token}`);
}

const controlDeploy=workflow.indexOf('Deploy Control live Worker');
const runtimeDeploy=workflow.indexOf('Deploy Learning Runtime live Worker');
const verify=workflow.indexOf('Verify live Control and Runtime availability');
assert.ok(controlDeploy>=0 && runtimeDeploy>controlDeploy && verify>runtimeDeploy,'Live verification must run after both deployments');


// Preview is manually dispatched, not a Production release. A Runtime-only
// deployment receipt is insufficient: the Control Worker, D1 and Russian entry
// must all be verified on the same immutable preview revision.
const preview=fs.readFileSync('.github/workflows/deploy-bauman-preview.yml','utf8');
for(const token of [
  'workflow_dispatch:',
  'environment: bauman-preview',
  'BAUMAN_CONTROL_PREVIEW_D1_DATABASE_ID',
  'BAUMAN_CONTROL_PRODUCTION_D1_DATABASE_ID',
  'BAUMAN_EXPECTED_RUNTIME="control-service"',
  'BAUMAN_EXPECTED_RUNTIME="learning-runtime"',
  'BAUMAN_EXPECTED_REVISION="$GITHUB_SHA"',
  'BAUMAN_CONTROL_PREVIEW_ORIGIN/__deployment',
  'BAUMAN_RUNTIME_PREVIEW_ORIGIN/__deployment',
  'control.databaseReady !== true',
  'control.controlSecretConfigured !== true',
  'control.applicationManagementOriginConfigured !== true',
  'control.appOriginConfigured !== true',
  'runtime.controlOriginConfigured !== true',
  "runtime.accessMode !== 'standalone'",
  'runtime.serverSideLearningGate !== false',
  'runtime.pythonExecutionEnabled !== true',
  'CONTROL_TICKET_FORBIDDEN',
  'BAUMAN_RUNTIME_PREVIEW_ORIGIN/__control-link',
  'controlReachable !== true',
  'BAUMAN_RUNTIME_PREVIEW_ORIGIN/subjects/russian/index.html',
  'BAUMAN_RUNTIME_PREVIEW_ORIGIN/subjects/russian/sw.js',
  'data-local-save="pending"',
  "const expectedCache = sourceSw.match",
  'Preview source-level smoke PASS; authenticated Work W1–W3 and RU03 remain independent.'
]){
  assert.ok(preview.includes(token),'Preview workflow missing fail-closed smoke: '+token);
}
assert(!preview.includes('environment: bauman-production'),'Preview must not use the Production environment');
assert(!/^\s+push:/m.test(preview),'Preview deploy cannot auto-run on push');
assert(!/^\s+pull_request:/m.test(preview),'Preview deploy cannot auto-run on PR');
const previewControlDeploy=preview.indexOf('Deploy Control preview');
const previewRuntimeDeploy=preview.indexOf('Deploy Learning Runtime preview');
const previewVerify=preview.indexOf('Verify exact Preview Control, Runtime and Russian learning entry');
const previewSummary=preview.indexOf('Preview summary');
assert.ok(previewControlDeploy>=0&&previewRuntimeDeploy>previewControlDeploy&&previewVerify>previewRuntimeDeploy&&previewSummary>previewVerify,
  'Preview checks must run after both deployments, before any successful summary');
assert(!/wrangler\s+deploy.*production/i.test(preview),'Preview must never call production deployment commands');

console.log('LIVE_DEPLOY_CONTROL_SMOKE_STATIC=PASS');
