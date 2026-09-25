import assert from 'node:assert/strict';
import { waitForDeploymentRevision } from './wait-cloudflare-deployment-revision.mjs';

const expected = '0674f5c93704078424897714f4bab9815e358ddd';

function response(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() { return payload; },
  };
}

{
  const seen = [];
  const sequence = [
    response({ application: 'bauman-master-ai', runtime: 'control-service', channel: 'cloudflare-preview', revision: 'f76ce9c4235cc11a36ee3649c699553b2bf67022' }),
    response({ application: 'bauman-master-ai', runtime: 'control-service', channel: 'cloudflare-preview', revision: 'f76ce9c4235cc11a36ee3649c699553b2bf67022' }),
    response({ application: 'bauman-master-ai', runtime: 'control-service', channel: 'cloudflare-preview', revision: expected, databaseReady: true }),
  ];
  const result = await waitForDeploymentRevision({
    url: 'https://preview.example.test/__deployment',
    expectedRevision: expected,
    expectedChannel: 'cloudflare-preview',
    expectedRuntime: 'control-service',
    attempts: 5,
    delayMs: 0,
    fetchImpl: async url => {
      seen.push(String(url));
      return sequence.shift();
    },
  });
  assert.equal(result.attempt, 3, 'stale revisions must be retried until the exact revision is visible');
  assert.equal(result.payload.revision, expected);
  assert.equal(seen.length, 3);
  assert.ok(seen.every(url => url.includes('_bauman_revision_probe=')), 'revision probes must be cache-busted');
}

{
  let calls = 0;
  const result = await waitForDeploymentRevision({
    url: 'https://runtime.example.test/__deployment',
    expectedRevision: expected,
    expectedChannel: 'cloudflare-production',
    expectedRuntime: 'learning-runtime',
    attempts: 3,
    delayMs: 0,
    fetchImpl: async () => {
      calls += 1;
      if (calls === 1) throw new Error('transient edge propagation failure');
      return response({ application: 'bauman-master-ai', runtime: 'learning-runtime', channel: 'cloudflare-production', revision: expected });
    },
  });
  assert.equal(result.attempt, 2, 'transient request failures must remain retryable');
}

await assert.rejects(
  waitForDeploymentRevision({
    url: 'https://wrong.example.test/__deployment',
    expectedRevision: expected,
    expectedChannel: 'cloudflare-preview',
    expectedRuntime: 'control-service',
    attempts: 5,
    delayMs: 0,
    fetchImpl: async () => response({ application: 'other-app', runtime: 'control-service', channel: 'cloudflare-preview', revision: expected }),
  }),
  /Deployment identity mismatch/,
  'wrong deployment identity must fail immediately instead of being masked as propagation'
);

await assert.rejects(
  waitForDeploymentRevision({
    url: 'https://stale.example.test/__deployment',
    expectedRevision: expected,
    expectedChannel: 'cloudflare-preview',
    expectedRuntime: 'control-service',
    attempts: 3,
    delayMs: 0,
    fetchImpl: async () => response({ application: 'bauman-master-ai', runtime: 'control-service', channel: 'cloudflare-preview', revision: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' }),
  }),
  /did not converge after 3 attempts/,
  'bounded polling must still fail closed when the exact revision never appears'
);

console.log('DEPLOYMENT_PROPAGATION_WAITER_TEST=PASS');
