import assert from 'node:assert/strict';
import runtime from '../cloudflare/runtime-worker.mjs';

function env(mode) {
  return {
    BAUMAN_CONTROL_ORIGIN: 'https://control.example.test',
    BAUMAN_ACCESS_MODE: mode,
    BAUMAN_DEPLOYMENT_CHANNEL: 'test',
    BAUMAN_BUILD_REVISION: '0123456789abcdef0123456789abcdef01234567',
    BAUMAN_CONFIG_FINGERPRINT: 'test',
    ASSETS: {
      async fetch(request) {
        const url = new URL(request.url);
        if (url.pathname.endsWith('/curriculum.json')) {
          return new Response(JSON.stringify({ id: 'entrepreneurship' }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          });
        }
        return new Response('not found', { status: 404, headers: { 'content-type': 'text/plain' } });
      },
    },
  };
}

const protectedRequest = new Request(
  'https://runtime.example.test/subjects/entrepreneurship/data/curriculum.json',
  { method: 'GET' },
);

const standalone = await runtime.fetch(protectedRequest, env('standalone'));
assert.equal(standalone.status, 200, 'standalone mode must serve protected learning data without a BM session');
assert.equal((await standalone.json()).id, 'entrepreneurship');

const managed = await runtime.fetch(protectedRequest, env('managed'));
assert.equal(managed.status, 401, 'managed mode must fail closed without a BM session');
assert.equal((await managed.json()).code, 'DEVICE_SESSION_REQUIRED');

const standaloneDeployment = await runtime.fetch(
  new Request('https://runtime.example.test/__deployment'),
  env('standalone'),
);
const standaloneStatus = await standaloneDeployment.json();
assert.equal(standaloneStatus.accessMode, 'standalone');
assert.equal(standaloneStatus.serverSideLearningGate, false);

const managedDeployment = await runtime.fetch(
  new Request('https://runtime.example.test/__deployment'),
  env('managed'),
);
const managedStatus = await managedDeployment.json();
assert.equal(managedStatus.accessMode, 'managed');
assert.equal(managedStatus.serverSideLearningGate, true);

console.log('RUNTIME_ACCESS_MODE_BEHAVIOR=PASS');
