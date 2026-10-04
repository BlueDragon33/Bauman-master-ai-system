import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const wrapper = read("cloudflare/runtime-worker-python.mjs");
const provider = read("cloudflare/python-sandbox-provider.mjs");
const runner = read("cloudflare/python-runtime/runner.py");
const dockerfile = read("cloudflare/python-runtime/Dockerfile");
const preview = read("wrangler.runtime.preview.example.jsonc");
const production = read("wrangler.runtime.production.example.jsonc");
const ci = read("wrangler.runtime.python-ci.jsonc");

assert.match(wrapper, /PYTHON_EXECUTION_DISABLED/);
assert.match(wrapper, /validateDeviceSession/);
assert.match(wrapper, /crypto\.randomUUID/);
assert.match(wrapper, /BAUMAN_PYTHON_PROVIDER_TEST_MODE/);
assert.match(provider, /enableInternet:\s*false/);
assert.match(provider, /instance:\s*"lite"/);
assert.match(provider, /fresh-container-per-run/);
assert.match(provider, /container\.destroy/);
assert.match(provider, /runCode\(request\)/);
assert.match(provider, /runTests\(request\)/);
assert.match(provider, /cancelRun\(\)/);
assert.match(provider, /runtimeIdentity\(\)/);
assert.match(runner, /RLIMIT_AS/);
assert.match(runner, /RLIMIT_FSIZE/);
assert.match(runner, /os\.setuid\(SANDBOX_UID\)/);
assert.match(runner, /MAX_STREAM_BYTES = 65536/);
assert.match(dockerfile, /python:3\.14\.8-slim@sha256:/);

for (const [name, source] of [["preview", preview], ["production", production], ["ci", ci]]) {
  const parsed = JSON.parse(source);
  assert.equal(parsed.main, "cloudflare/runtime-worker-python.mjs", `${name}: wrong main`);
  assert.equal(parsed.containers?.[0]?.scheduling_policy, "durable_object", `${name}: missing DO scheduling`);
  assert.equal(parsed.durable_objects?.bindings?.[0]?.name, "PYTHON_SANDBOX", `${name}: missing binding`);
  assert.equal(parsed.exports?.PythonSandbox?.storage, "sqlite", `${name}: missing sqlite export`);
  assert.equal(parsed.vars?.BAUMAN_PYTHON_RUNTIME_PROFILE, "cpython-3.14.8-stdlib-v1", `${name}: wrong profile`);
}
assert.equal(JSON.parse(preview).vars.BAUMAN_PYTHON_EXECUTION_ENABLED, "false");
assert.equal(JSON.parse(production).vars.BAUMAN_PYTHON_EXECUTION_ENABLED, "false");
assert.equal(JSON.parse(ci).vars.BAUMAN_PYTHON_EXECUTION_ENABLED, "true");

console.log("PYTHON_P4_PROVIDER_STATIC=PASS");
