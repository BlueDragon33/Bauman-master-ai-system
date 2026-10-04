import assert from "node:assert/strict";

const base = process.env.BAUMAN_PYTHON_PROVIDER_URL || "http://127.0.0.1:8788";

async function request(path, options = {}) {
  const response = await fetch(base + path, options);
  const payload = await response.json().catch(() => ({}));
  assert.ok(response.ok, `${path} failed: ${response.status} ${JSON.stringify(payload)}`);
  return payload;
}

async function run(code, extra = {}) {
  return request("/api/python/run", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code, ...extra }),
  });
}

const health = await request("/__python/provider-health");
assert.equal(health.version, "3.14.8");
assert.equal(health.runtimeProfileId, "cpython-3.14.8-stdlib-v1");

const normal = await run("print(2 + 2)");
assert.equal(normal.status, "complete");
assert.equal(normal.stdout.trim(), "4");
assert.equal(normal.networkPolicy, "deny");
assert.equal(normal.isolation, "fresh-container-per-run");

const timeout = await run("while True: pass", { timeoutMs: 500 });
assert.equal(timeout.status, "timeout");

const memory = await run("x = bytearray(10**10)", { timeoutMs: 2000 });
assert.equal(memory.status, "resource_failure");

const flood = await run("print('x' * 100000000)", { timeoutMs: 2000 });
assert.equal(flood.status, "output_limit");
assert.ok(flood.truncated.stdout || flood.stdout.length <= 65536);

const traversal = await run("open('../../secret.txt').read()", { timeoutMs: 1000 });
assert.notEqual(traversal.status, "complete");

const environment = await run("import os; print(os.environ)", { timeoutMs: 1000 });
assert.equal(environment.status, "complete");
assert.doesNotMatch(environment.stdout, /BAUMAN_/);
assert.doesNotMatch(environment.stdout, /TOKEN|SECRET|DATABASE/i);

const network = await run("import urllib.request; urllib.request.urlopen('https://example.com', timeout=1)", { timeoutMs: 2500 });
assert.notEqual(network.status, "complete");

const subprocess = await run("import subprocess; subprocess.run(['sh','-c','id'], check=True)", { timeoutMs: 1000 });
assert.equal(subprocess.status, "complete");
assert.match(subprocess.stdout, /uid=10001/);

const unsafePickle = await run("import pickle; pickle.loads(b'...')", { timeoutMs: 1000 });
assert.notEqual(unsafePickle.status, "complete");

const first = await run("print('old run')");
const second = await run("print('new run')");
assert.notEqual(first.runId, second.runId);
assert.equal(first.stdout.trim(), "old run");
assert.equal(second.stdout.trim(), "new run");

const hidden = await request("/__python/hidden-boundary", { method: "POST" });
assert.equal(hidden.platformSecretsUnavailable, true);
assert.equal(hidden.hiddenTestsExposed, false);

const testOfTests = await request("/__python/test-of-tests", { method: "POST" });
assert.equal(testOfTests.ok, true);
assert.equal(testOfTests.candidates.canonical.passed, 3);
assert.equal(testOfTests.candidates.alternate.passed, 3);
assert.ok(testOfTests.candidates.wrong.passed < 3);
assert.equal(testOfTests.hiddenMaterialReturned, false);
assert.doesNotMatch(JSON.stringify(testOfTests), /-5 7|100 200|expected/);

console.log(JSON.stringify({
  schema: "PYTHON_P4_PROVIDER_LIVE_RESULT_V1",
  status: "PASS",
  runtime: health,
  fixtures: [
    "infinite-loop",
    "huge-allocation",
    "output-flood",
    "path-traversal",
    "env-read",
    "network",
    "subprocess",
    "unsafe-pickle",
    "stale-result",
    "hidden-test-leak",
    "assessment-test-of-tests"
  ]
}, null, 2));
