import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
for(const entry of ['cloudflare/runtime-worker-python.mjs','cloudflare/python-sandbox-provider.mjs'])assert.match(read(entry),/export .*PythonSandbox.*runtime\/python-cloudflare\/worker\.ts/);
const worker=read('runtime/python-cloudflare/worker.ts'),controller=read('runtime/python-cloudflare/controller.mjs'),runner=read('cloudflare/python-runtime/runner.py');
assert.match(worker,/authorizeRuntimeRequest/);assert.match(worker,/crypto\.randomUUID/);
assert.match(worker,/claimAdmission/);assert.match(worker,/reapRun/);assert.match(worker,/storage\.transaction/);
assert.match(controller,/enableInternet:false/);assert.match(controller,/env:\{\}/);assert.match(controller,/container\.destroy/);assert.match(controller,/container\.inspect/);
for(const limit of ['RLIMIT_AS','RLIMIT_CPU','RLIMIT_FSIZE','RLIMIT_NOFILE','RLIMIT_NPROC'])assert.ok(runner.includes(limit));
assert.match(runner,/chroot/);assert.match(runner,/seccomp/);assert.match(runner,/setuid/);
assert.ok(!fs.existsSync('runtime/python-cloudflare/sandbox.py'),'duplicate bootstrap');
assert.match(read('cloudflare/python-runtime/Dockerfile'),/FROM python@sha256:[a-f0-9]{64}/);
for(const name of ['wrangler.runtime.preview.example.jsonc','wrangler.runtime.production.example.jsonc','wrangler.runtime.python-ci.jsonc']){
 const config=JSON.parse(read(name));assert.equal(config.main,'cloudflare/runtime-worker-python.mjs');
 assert.equal(config.vars.BAUMAN_PYTHON_EXECUTION_ENABLED,'false');
 assert.equal(config.vars.BAUMAN_PYTHON_PROVIDER_TEST_MODE,undefined,'unauthenticated bypass');
 assert.equal(config.containers[0].scheduling_policy,'durable_object');assert.equal(config.exports.PythonSandbox.storage,'sqlite');
 assert.equal(config.vars.BAUMAN_PYTHON_RUNTIME_PROFILE,'cpython-3.14.8-stdlib-v1');
}
console.log('PYTHON_P4_PROVIDER_STATIC=PASS_DISABLED_NATIVE_OWNER');
