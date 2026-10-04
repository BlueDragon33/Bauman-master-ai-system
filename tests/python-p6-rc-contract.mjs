import assert from 'node:assert/strict';
import fs from 'node:fs';

const base='prompts/subjects/python/evidence/';
const required=[
 'PYTHON06_ACCEPTANCE_MATRIX.md','PYTHON_LANGUAGE_RUNTIME_REGRESSION.md','PYTHON_ASSESSMENT_TEST_OF_TESTS_REPORT.md',
 'PYTHON_SANDBOX_SECURITY_REPORT.md','PYTHON_OFFLINE_PERFORMANCE_REPORT.md','PYTHON_AI_TUTOR_ACCEPTANCE.md',
 'PYTHON_UX_ACCESSIBILITY_ACCEPTANCE.md','PYTHON_LEGACY_RETIREMENT_MAP.md','PYTHON_RC_MANIFEST.json',
 'PYTHON_PRODUCTION_SMOKE_PROFILE.md','PYTHON06_EVIDENCE_INDEX.md'
];
for(const name of required)assert.ok(fs.existsSync(base+name),'Missing PYTHON06 deliverable '+name);

const graph=JSON.parse(fs.readFileSync(base+'PYTHON_COMPETENCY_GRAPH.json','utf8'));
const ids=new Set(graph.competencies.map(x=>x.id));
const projection=JSON.parse(fs.readFileSync('subjects/programming/data/python-competencies.json','utf8'));
assert.deepEqual(new Set(projection.competencies.map(x=>x.id)),ids,'competency projection drift');
const catalog=JSON.parse(fs.readFileSync('subjects/programming/data/python-task-catalog.json','utf8'));
for(const task of catalog.tasks)assert.ok(ids.has(task.competency),'noncanonical task competency '+task.id+' '+task.competency);

const manifest=JSON.parse(fs.readFileSync('subjects/programming/subject-manifest.json','utf8'));
assert.equal(manifest.pythonRuntime.provider,'cloudflare-container-durable-object-v1');
assert.equal(manifest.pythonRuntime.runtimeProfileId,'cpython-3.14.8-stdlib-v1');
assert.equal(manifest.pythonRuntime.offlineExecution,false);
assert.equal(manifest.pythonRuntime.learnerExecutionFeatureGated,false);
assert.ok(manifest.dataFiles.some(x=>x.id==='python-competencies'));

for(const file of ['wrangler.runtime.preview.example.jsonc','wrangler.runtime.production.example.jsonc']){
 const txt=fs.readFileSync(file,'utf8');
 assert.match(txt,/"BAUMAN_PYTHON_EXECUTION_ENABLED": "true"/);
 assert.match(txt,/cpython-3\.14\.8-stdlib-v1/);
}
const docker=fs.readFileSync('cloudflare/python-runtime/Dockerfile','utf8');
assert.match(docker,/FROM python:3\.14\.8-slim@sha256:[a-f0-9]{64}/);
const worker=fs.readFileSync('cloudflare/runtime-worker-python.mjs','utf8');
assert.match(worker,/resolveRunId\(body\)/);
assert.match(worker,/hiddenMaterialReturned: false/);
assert.match(worker,/officialAttemptWrite: false/);
assert.match(worker,/masteryWrite: false/);
const lab=fs.readFileSync('subjects/programming/assets/python-lab.js','utf8');
assert.match(lab,/requestRunId="ui-"\+crypto\.randomUUID/);
assert.match(lab,/actionToken/);
assert.match(lab,/Hết thời gian chạy/);
assert.match(lab,/invoke\("cancel",\{runId:id\}\)/);

const rc=JSON.parse(fs.readFileSync(base+'PYTHON_RC_MANIFEST.json','utf8'));
assert.equal(rc.runtime.version,'3.14.8');assert.equal(rc.runtime.packages,'stdlib-only');
assert.equal(rc.featureFlags.previewLearnerExecution,true);assert.equal(rc.featureFlags.productionLearnerExecution,true);
assert.equal(rc.statePolicy.officialAttemptWrite,false);assert.equal(rc.statePolicy.masteryWrite,false);
for(const file of rc.identityFiles)assert.ok(fs.existsSync(file),'RC identity file missing '+file);

const prod=fs.readFileSync('.github/workflows/deploy-bauman-production.yml','utf8');
assert.match(prod,/Run Python production RC smoke browser acceptance/);
assert.match(prod,/python-production-smoke-browser\.mjs/);
console.log('PYTHON_P6_RC_CONTRACT=PASS');
