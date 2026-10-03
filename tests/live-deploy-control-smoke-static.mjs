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
  'Bauman live Control + Runtime availability PASS.',
]){
  assert.ok(workflow.includes(token), `Live deploy verification missing: ${token}`);
}

const controlDeploy=workflow.indexOf('Deploy Control live Worker');
const runtimeDeploy=workflow.indexOf('Deploy Learning Runtime live Worker');
const verify=workflow.indexOf('Verify live Control and Runtime availability');
assert.ok(controlDeploy>=0 && runtimeDeploy>controlDeploy && verify>runtimeDeploy,'Live verification must run after both deployments');

console.log('LIVE_DEPLOY_CONTROL_SMOKE_STATIC=PASS');
