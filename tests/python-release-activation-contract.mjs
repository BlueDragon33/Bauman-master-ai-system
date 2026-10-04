import assert from "node:assert/strict";
import fs from "node:fs";

for(const path of ["wrangler.runtime.preview.example.jsonc","wrangler.runtime.production.example.jsonc"]){
  const text=fs.readFileSync(path,"utf8");
  assert.match(text,/"BAUMAN_PYTHON_EXECUTION_ENABLED": "true"/);
  assert.match(text,/"BAUMAN_PYTHON_RUNTIME_PROFILE": "cpython-3\.14\.8-stdlib-v1"/);
}
const worker=fs.readFileSync("cloudflare/runtime-worker.mjs","utf8");
assert.match(worker,/pythonExecutionEnabled/);
assert.match(worker,/pythonRuntimeProfile/);

const preview=fs.readFileSync(".github/workflows/deploy-bauman-preview.yml","utf8");
assert.match(preview,/Verify exact preview runtime and Python activation/);
assert.match(preview,/runtime\.pythonExecutionEnabled !== true/);
assert.match(preview,/cpython-3\.14\.8-stdlib-v1/);

const production=fs.readFileSync(".github/workflows/deploy-bauman-production.yml","utf8");
assert.match(production,/Preview Python execution is not enabled for promotion/);
assert.match(production,/Production Python execution read-back mismatch/);
assert.match(production,/Run Python production smoke/);
assert.match(production,/tests\/python-production-smoke\.mjs/);
assert.match(production,/BAUMAN_E2E_DEVICE_SESSION/);

const activation=JSON.parse(fs.readFileSync("prompts/subjects/python/evidence/PYTHON_RELEASE_ACTIVATION.json","utf8"));
assert.equal(activation.runtimeProfile,"cpython-3.14.8-stdlib-v1");
assert.equal(activation.provider,"cloudflare-container-durable-object-v1");
assert.equal(activation.previewExecutionEnabled,true);
assert.equal(activation.productionExecutionEnabled,true);
assert.equal(activation.productionSmokeRequired,true);
assert.equal(activation.rollback.failClosedExecutionValue,false);
console.log("PYTHON_RELEASE_ACTIVATION_CONTRACT=PASS");
