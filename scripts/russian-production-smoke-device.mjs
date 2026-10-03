import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const mode = process.argv[2] || '';
const controlOrigin = String(process.env.BAUMAN_CONTROL_PRODUCTION_ORIGIN || '').replace(/\/$/, '');
const runtimeOrigin = String(process.env.BAUMAN_RUNTIME_PRODUCTION_ORIGIN || '').replace(/\/$/, '');
const evidenceDir = process.env.RUSSIAN_RELEASE_EVIDENCE_DIR || 'artifacts/russian-release-annex';
const githubEnv = process.env.GITHUB_ENV || '';

function required(name, value) {
  if (!value) throw new Error(name + ' required');
  return value;
}
function base64Url(buffer) {
  return Buffer.from(buffer).toString('base64url');
}
function sha256Hex(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}
function canonicalPublicJwk(jwk) {
  return JSON.stringify({ crv: 'P-256', kty: 'EC', x: jwk.x, y: jwk.y });
}
function writeEvidence(name, value) {
  fs.mkdirSync(evidenceDir, { recursive: true });
  fs.writeFileSync(path.join(evidenceDir, name), JSON.stringify(value, null, 2) + '\n');
}
async function jsonRequest(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = {};
  try { body = JSON.parse(text); } catch {}
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${url} failed HTTP ${response.status}: ${body.code || text.slice(0, 300)}`);
  }
  return body;
}
function appHeaders() {
  return { 'content-type': 'application/json', origin: runtimeOrigin };
}
function sqlQuote(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}
function runProductionD1(sql, label) {
  const result = spawnSync('npx', [
    '--yes', 'wrangler@4.92.0', 'd1', 'execute', 'bauman-control-db',
    '--remote', '--config', 'control-service/wrangler.production.jsonc', '--command', sql,
  ], { encoding: 'utf8', env: process.env });
  if (result.status !== 0) {
    throw new Error(`${label} failed: ${String(result.stderr || result.stdout || '').slice(0, 1200)}`);
  }
  return String(result.stdout || '');
}
function appendGithubEnv(name, value) {
  required('GITHUB_ENV', githubEnv);
  fs.appendFileSync(githubEnv, `${name}=${value}\n`);
}
async function bootstrap() {
  required('BAUMAN_CONTROL_PRODUCTION_ORIGIN', controlOrigin);
  required('BAUMAN_RUNTIME_PRODUCTION_ORIGIN', runtimeOrigin);
  const { privateKey, publicKey } = await crypto.webcrypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify'],
  );
  const publicJwk = await crypto.webcrypto.subtle.exportKey('jwk', publicKey);
  const deviceId = sha256Hex(canonicalPublicJwk(publicJwk));
  const runId = String(process.env.GITHUB_RUN_ID || 'local');

  const registered = await jsonRequest(controlOrigin + '/api/device/register', {
    method: 'POST',
    headers: appHeaders(),
    body: JSON.stringify({
      publicJwk,
      deviceType: 'desktop',
      platform: 'github-actions',
      browser: 'release-smoke',
      displayName: 'Russian Release Smoke',
      label: 'release-smoke:' + runId,
    }),
  });
  if (registered?.device?.deviceId !== deviceId) throw new Error('registered smoke device identity mismatch');
  appendGithubEnv('BAUMAN_PRODUCTION_SMOKE_DEVICE_ID', deviceId);

  const status = registered.device.status;
  if (status === 'blocked') throw new Error('ephemeral smoke device unexpectedly resolved to blocked identity');
  if (status === 'pending') {
    const actor = 'russian-release-smoke@bauman.local';
    const detail = JSON.stringify({ provisioning: 'release-ci-direct-d1', runId });
    runProductionD1(
      [
        "UPDATE bm_devices SET status='approved', approved_at=CURRENT_TIMESTAMP, approved_by=" + sqlQuote(actor) + ", blocked_at=NULL, updated_at=CURRENT_TIMESTAMP WHERE device_id=" + sqlQuote(deviceId) + " AND status='pending';",
        "INSERT INTO bm_audit_log (actor, action, target, detail_json) VALUES (" + sqlQuote(actor) + ", 'release_smoke_device_approved', " + sqlQuote(deviceId) + ", " + sqlQuote(detail) + ");",
      ].join(' '),
      'approve ephemeral smoke device',
    );
    const approved = await jsonRequest(controlOrigin + '/api/device/status?deviceId=' + encodeURIComponent(deviceId), {
      headers: { origin: runtimeOrigin },
    });
    if (approved?.device?.status !== 'approved') throw new Error('smoke device D1 approval did not reach approved state');
  }

  const challenge = await jsonRequest(controlOrigin + '/api/device/challenge', {
    method: 'POST',
    headers: appHeaders(),
    body: JSON.stringify({ deviceId }),
  });
  if (!challenge.challengeId || !challenge.signingInput) throw new Error('smoke device challenge incomplete');

  const signature = await crypto.webcrypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(challenge.signingInput),
  );
  const verified = await jsonRequest(controlOrigin + '/api/device/verify', {
    method: 'POST',
    headers: appHeaders(),
    body: JSON.stringify({
      deviceId,
      challengeId: challenge.challengeId,
      signature: base64Url(signature),
    }),
  });
  const sessionToken = String(verified.sessionToken || '');
  if (!/^bm1\.[A-Za-z0-9_-]{40,100}$/.test(sessionToken)) throw new Error('ephemeral smoke device session format invalid');
  if (verified?.device?.status !== 'approved') throw new Error('ephemeral smoke device verification is not approved');

  appendGithubEnv('BAUMAN_PRODUCTION_SMOKE_DEVICE_SESSION', sessionToken);
  writeEvidence('RUSSIAN_PRODUCTION_SMOKE_DEVICE_BOOTSTRAP.json', {
    schema: 'RUSSIAN_PRODUCTION_SMOKE_DEVICE_BOOTSTRAP_V1',
    status: 'PASS',
    revision: process.env.GITHUB_SHA || null,
    runId,
    deviceId,
    deviceCode: verified.device.deviceCode || registered.device.deviceCode || null,
    lifecycle: 'ephemeral-per-release',
    approvalPath: 'release-ci-direct-d1-audited',
    sessionPersisted: false,
    expiresAt: verified.expiresAt || null,
  });
  console.log(JSON.stringify({ ok: true, status: 'PASS', deviceId, deviceCode: verified.device.deviceCode || null }));
}

async function cleanup() {
  const deviceId = String(process.env.BAUMAN_PRODUCTION_SMOKE_DEVICE_ID || '');
  if (!deviceId) {
    console.log(JSON.stringify({ ok: true, status: 'NOOP', reason: 'smoke-device-not-created' }));
    return;
  }
  required('BAUMAN_CONTROL_PRODUCTION_ORIGIN', controlOrigin);
  let result;
  try {
    const current = await jsonRequest(controlOrigin + '/api/device/status?deviceId=' + encodeURIComponent(deviceId), {
      headers: { origin: runtimeOrigin },
    });
    const status = current?.device?.status;
    if (status === 'blocked') {
      result = { status: 'blocked', alreadyBlocked: true };
    } else if (status === 'pending' || status === 'approved') {
      const actor = 'russian-release-smoke@bauman.local';
      const detail = JSON.stringify({ provisioning: 'release-ci-direct-d1', cleanup: true, runId: String(process.env.GITHUB_RUN_ID || 'local') });
      runProductionD1(
        [
          "UPDATE bm_device_sessions SET state='revoked', revoked_at=CURRENT_TIMESTAMP, revoked_by=" + sqlQuote(actor) + " WHERE device_id=" + sqlQuote(deviceId) + " AND state='active';",
          "UPDATE bm_devices SET status='blocked', edit_enabled=0, blocked_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP WHERE device_id=" + sqlQuote(deviceId) + ";",
          "INSERT INTO bm_audit_log (actor, action, target, detail_json) VALUES (" + sqlQuote(actor) + ", 'release_smoke_device_blocked', " + sqlQuote(deviceId) + ", " + sqlQuote(detail) + ");",
        ].join(' '),
        'cleanup ephemeral smoke device',
      );
      const readback = await jsonRequest(controlOrigin + '/api/device/status?deviceId=' + encodeURIComponent(deviceId), {
        headers: { origin: runtimeOrigin },
      });
      result = { status: readback?.device?.status || null, directD1Cleanup: true };
    } else {
      throw new Error('ephemeral smoke device cleanup found unexpected status: ' + String(status));
    }
  } catch (error) {
    writeEvidence('RUSSIAN_PRODUCTION_SMOKE_DEVICE_CLEANUP.json', {
      schema: 'RUSSIAN_PRODUCTION_SMOKE_DEVICE_CLEANUP_V1',
      status: 'FAIL',
      revision: process.env.GITHUB_SHA || null,
      deviceId,
      reason: String(error?.message || error),
    });
    throw error;
  }
  if (result.status !== 'blocked') throw new Error('ephemeral smoke device cleanup did not reach blocked state');
  writeEvidence('RUSSIAN_PRODUCTION_SMOKE_DEVICE_CLEANUP.json', {
    schema: 'RUSSIAN_PRODUCTION_SMOKE_DEVICE_CLEANUP_V1',
    status: 'PASS',
    revision: process.env.GITHUB_SHA || null,
    deviceId,
    finalStatus: result.status,
    sessionRevokedByDeviceBlock: true,
  });
  console.log(JSON.stringify({ ok: true, status: 'PASS', deviceId, finalStatus: result.status }));
}

if (mode === 'bootstrap') await bootstrap();
else if (mode === 'cleanup') await cleanup();
else throw new Error('mode must be bootstrap or cleanup');
