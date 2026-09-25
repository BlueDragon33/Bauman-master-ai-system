import { pathToFileURL } from 'node:url';

const DEFAULT_ATTEMPTS = 15;
const DEFAULT_DELAY_MS = 2000;
const DEFAULT_TIMEOUT_MS = 8000;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function integer(value, fallback, name, { min = 0, max = 120 } = {}) {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}.`);
  }
  return parsed;
}

function required(value, name) {
  const normalized = String(value ?? '').trim();
  if (!normalized) throw new Error(`${name} is required.`);
  return normalized;
}

function probeUrl(value, attempt) {
  const url = new URL(value);
  url.searchParams.set('_bauman_revision_probe', String(attempt));
  url.searchParams.set('_bauman_revision_expected', '1');
  return url;
}

export async function waitForDeploymentRevision(options = {}) {
  const url = required(options.url, 'url');
  const expectedRevision = required(options.expectedRevision, 'expectedRevision');
  const expectedChannel = required(options.expectedChannel, 'expectedChannel');
  const expectedRuntime = required(options.expectedRuntime, 'expectedRuntime');
  const expectedApplication = String(options.expectedApplication || 'bauman-master-ai').trim();
  const attempts = integer(options.attempts, DEFAULT_ATTEMPTS, 'attempts', { min: 1, max: 60 });
  const delayMs = integer(options.delayMs, DEFAULT_DELAY_MS, 'delayMs', { min: 0, max: 30000 });
  const timeoutMs = integer(options.timeoutMs, DEFAULT_TIMEOUT_MS, 'timeoutMs', { min: 250, max: 60000 });
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const sleepImpl = options.sleepImpl || sleep;
  const onAttempt = options.onAttempt || (() => {});

  if (!/^[0-9a-f]{7,64}$/i.test(expectedRevision)) {
    throw new Error('expectedRevision must be a Git revision.');
  }
  if (typeof fetchImpl !== 'function') throw new Error('fetch implementation is required.');

  let lastRevision = 'unavailable';
  let lastFailure = 'no response';

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    onAttempt({ attempt, attempts, lastRevision, lastFailure });

    try {
      const response = await fetchImpl(probeUrl(url, attempt), {
        headers: {
          accept: 'application/json',
          'cache-control': 'no-cache',
          pragma: 'no-cache',
        },
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!response.ok) {
        lastFailure = `HTTP ${response.status}`;
      } else {
        const payload = await response.json();
        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
          lastFailure = 'deployment endpoint returned a non-object payload';
        } else {
          const application = String(payload.application || '');
          const runtime = String(payload.runtime || '');
          const channel = String(payload.channel || '');

          if (application !== expectedApplication) {
            throw new Error(`Deployment identity mismatch: application ${application || '<missing>'} !== ${expectedApplication}`);
          }
          if (runtime !== expectedRuntime) {
            throw new Error(`Deployment identity mismatch: runtime ${runtime || '<missing>'} !== ${expectedRuntime}`);
          }
          if (channel !== expectedChannel) {
            throw new Error(`Deployment channel mismatch: ${channel || '<missing>'} !== ${expectedChannel}`);
          }

          lastRevision = String(payload.revision || 'unknown');
          if (lastRevision === expectedRevision) {
            return { payload, attempt, attempts };
          }
          lastFailure = `revision ${lastRevision} !== expected ${expectedRevision}`;
        }
      }
    } catch (error) {
      const message = String(error?.message || error);
      if (/^Deployment (?:identity|channel) mismatch:/.test(message)) throw error;
      lastFailure = message;
    }

    if (attempt < attempts && delayMs > 0) await sleepImpl(delayMs);
  }

  throw new Error(
    `Deployment revision did not converge after ${attempts} attempts: ${lastFailure}. ` +
    `Expected ${expectedRevision}; last observed ${lastRevision}.`
  );
}

async function cli() {
  const result = await waitForDeploymentRevision({
    url: process.env.BAUMAN_DEPLOYMENT_URL,
    expectedRevision: process.env.BAUMAN_EXPECTED_REVISION,
    expectedChannel: process.env.BAUMAN_EXPECTED_CHANNEL,
    expectedRuntime: process.env.BAUMAN_EXPECTED_RUNTIME,
    expectedApplication: process.env.BAUMAN_EXPECTED_APPLICATION || 'bauman-master-ai',
    attempts: process.env.BAUMAN_DEPLOYMENT_WAIT_ATTEMPTS,
    delayMs: process.env.BAUMAN_DEPLOYMENT_WAIT_MS,
    timeoutMs: process.env.BAUMAN_DEPLOYMENT_REQUEST_TIMEOUT_MS,
    onAttempt({ attempt, attempts, lastRevision, lastFailure }) {
      if (attempt === 1) {
        console.error(`Waiting for exact deployment revision ${process.env.BAUMAN_EXPECTED_REVISION} (${attempts} attempts max).`);
      } else {
        console.error(`Revision propagation attempt ${attempt}/${attempts}; previous=${lastRevision}; ${lastFailure}`);
      }
    },
  });
  console.error(`Exact deployment revision observed on attempt ${result.attempt}/${result.attempts}.`);
  process.stdout.write(JSON.stringify(result.payload));
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === invokedPath) {
  cli().catch(error => {
    console.error(error instanceof Error ? error.stack || error.message : String(error));
    process.exitCode = 1;
  });
}
