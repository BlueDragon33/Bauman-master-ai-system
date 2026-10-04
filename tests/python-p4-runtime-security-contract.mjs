import assert from 'node:assert/strict';
import fs from 'node:fs';

const base='prompts/subjects/python/evidence/';
const required=[
  'PYTHON_EXECUTION_CAPABILITY_CONTRACT.md',
  'PYTHON_SANDBOX_SECURITY_CONTRACT.md',
  'PYTHON_RUNTIME_ENVIRONMENT_POLICY.md',
  'PYTHON_NOTEBOOK_REPRODUCIBILITY_POLICY.md',
  'PYTHON_TEST_DEBUG_PROVIDER_CONTRACT.md',
  'PYTHON_DATA_TOOLING_CONTRACT.md',
  'PYTHON_AI_CODING_TUTOR_CONTRACT.md',
  'PYTHON_RUNTIME_GOLDEN_FIXTURES.json',
  'PYTHON05_INPUT_CONTRACT.md'
];
for(const file of required)assert.ok(fs.existsSync(base+file),`missing PYTHON04 deliverable: ${file}`);

const read=file=>fs.readFileSync(base+file,'utf8');
const exec=read('PYTHON_EXECUTION_CAPABILITY_CONTRACT.md');
assert.match(exec,/python\.execute/);
assert.match(exec,/Provider output is evidence, not mastery/);
assert.match(exec,/PROVIDER PROVEN/);

const sandbox=read('PYTHON_SANDBOX_SECURITY_CONTRACT.md');
for(const token of ['Default deny','Resource limits','Network','Hidden evidence','Fail closed'])assert.ok(sandbox.includes(token),`sandbox contract missing ${token}`);
assert.match(sandbox,/Browser `eval`/);

const runtime=read('PYTHON_RUNTIME_ENVIRONMENT_POLICY.md');
assert.match(runtime,/CPython 3\.14\.8/);
assert.match(runtime,/runtimeProfileId/);
assert.match(runtime,/Uncontrolled learner `pip install`/);

const notebook=read('PYTHON_NOTEBOOK_REPRODUCIBILITY_POLICY.md');
assert.match(notebook,/restart/i);
assert.match(notebook,/run-all/i);
assert.match(notebook,/not automatically official evidence/i);

const testDebug=read('PYTHON_TEST_DEBUG_PROVIDER_CONTRACT.md');
assert.match(testDebug,/hidden test source is never returned/i);
assert.match(testDebug,/no provider grants mastery/i);

const ai=read('PYTHON_AI_CODING_TUTOR_CONTRACT.md');
assert.match(ai,/AI is not runtime or mastery authority/i);
assert.match(ai,/Hidden tests\/solutions are excluded/i);
assert.match(ai,/untrusted until sandboxed\/tested/i);

const fixtures=JSON.parse(read('PYTHON_RUNTIME_GOLDEN_FIXTURES.json'));
assert.equal(fixtures.schema,'PYTHON_RUNTIME_GOLDEN_FIXTURES_V1');
assert.equal(fixtures.learnerExecutionEnabled,false);\nassert.equal(fixtures.status,'PROVIDER_PROVEN_LOCAL_CONTAINER_CI');\nassert.equal(fixtures.runtimeProfileId,'cpython-3.14.8-stdlib-v1');
const ids=new Set(fixtures.fixtures.map(x=>x.id));
for(const id of ['infinite-loop','huge-allocation','output-flood','path-traversal','env-read','network','subprocess','unsafe-pickle','stale-result','hidden-test-leak'])assert.ok(ids.has(id),`missing runtime fixture ${id}`);

const handoff=read('PYTHON05_INPUT_CONTRACT.md');
assert.match(handoff,/Status: READY/);\nassert.match(handoff,/cloudflare-container-durable-object-v1/);

console.log('PYTHON_P4_RUNTIME_SECURITY_CONTRACT=PASS');
