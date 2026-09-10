import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";

const cryptoApi = globalThis.crypto || webcrypto;
const controlOrigin = process.env.BAUMAN_CONTROL_ORIGIN || "http://127.0.0.1:3003";
const appOrigin = process.env.BAUMAN_APP_ORIGIN || "http://127.0.0.1:3005";
const secret = process.env.BAUMAN_TEST_SECRET || "local-e2e-bauman-control-secret-0123456789abcdef";

function base64Url(bytes) {
  return Buffer.from(bytes).toString("base64url");
}

async function json(path, { method = "GET", body, token, control = false } = {}) {
  const headers = {};
  if (body) headers["content-type"] = "application/json";
  if (control) {
    headers.authorization = `Bearer ${secret}`;
    headers["x-control-role"] = "owner";
    headers["x-control-actor"] = "bauman-e2e@local.test";
  } else {
    headers.origin = appOrigin;
    if (token) headers.authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${controlOrigin}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
}

const runtime = await fetch(`${appOrigin}/_local/health`, { cache: "no-store" });
assert.equal(runtime.status, 200, "local Bauman runtime must be serving");

const pair = await cryptoApi.subtle.generateKey(
  { name: "ECDSA", namedCurve: "P-256" },
  true,
  ["sign", "verify"],
);
const publicJwk = await cryptoApi.subtle.exportKey("jwk", pair.publicKey);

const registered = await json("/api/device/register", {
  method: "POST",
  body: { publicJwk, deviceType: "desktop", displayName: "E2E Browser", label: "Bauman runtime E2E" },
});
assert.equal(registered.response.status, 200, JSON.stringify(registered.payload));
assert.equal(registered.payload.device.status, "pending");
assert.match(registered.payload.device.deviceId, /^[a-f0-9]{64}$/);
assert.match(registered.payload.device.deviceCode, /^BM-[A-Z0-9-]+$/);
const deviceId = registered.payload.device.deviceId;

const pending = await json(`/api/device/status?deviceId=${encodeURIComponent(deviceId)}`);
assert.equal(pending.response.status, 200, JSON.stringify(pending.payload));
assert.equal(pending.payload.device.status, "pending");

const approveCommandId = cryptoApi.randomUUID();
const approved = await json("/api/control/device-commands", {
  method: "POST",
  control: true,
  body: { commandId: approveCommandId, deviceId, operation: "approve", expectedStatus: "pending" },
});
assert.equal(approved.response.status, 200, JSON.stringify(approved.payload));
assert.equal(approved.payload.commandId, approveCommandId);
assert.equal(approved.payload.status, "approved");
assert.equal(approved.payload.replayed, false);

const replay = await json("/api/control/device-commands", {
  method: "POST",
  control: true,
  body: { commandId: approveCommandId, deviceId, operation: "approve", expectedStatus: "pending" },
});
assert.equal(replay.response.status, 200, JSON.stringify(replay.payload));
assert.equal(replay.payload.commandId, approveCommandId);
assert.equal(replay.payload.status, "approved");
assert.equal(replay.payload.replayed, true);

const challenged = await json("/api/device/challenge", {
  method: "POST",
  body: { deviceId },
});
assert.equal(challenged.response.status, 200, JSON.stringify(challenged.payload));
assert.match(challenged.payload.challengeId, /^[0-9a-f-]{36}$/i);
assert.match(challenged.payload.signingInput, new RegExp(`^bauman-device:v1:${deviceId}:`));

const signature = await cryptoApi.subtle.sign(
  { name: "ECDSA", hash: "SHA-256" },
  pair.privateKey,
  new TextEncoder().encode(challenged.payload.signingInput),
);
const verified = await json("/api/device/verify", {
  method: "POST",
  body: {
    deviceId,
    challengeId: challenged.payload.challengeId,
    signature: base64Url(signature),
  },
});
assert.equal(verified.response.status, 200, JSON.stringify(verified.payload));
assert.match(verified.payload.sessionToken, /^bm1\./);
assert.ok(Number(verified.payload.expiresAt) > Date.now());
const sessionToken = verified.payload.sessionToken;

const heartbeat = await json("/api/device/heartbeat", { method: "POST", token: sessionToken });
assert.equal(heartbeat.response.status, 200, JSON.stringify(heartbeat.payload));
assert.equal(heartbeat.payload.device.status, "approved");

const blockCommandId = cryptoApi.randomUUID();
const blocked = await json("/api/control/device-commands", {
  method: "POST",
  control: true,
  body: { commandId: blockCommandId, deviceId, operation: "block", expectedStatus: "approved" },
});
assert.equal(blocked.response.status, 200, JSON.stringify(blocked.payload));
assert.equal(blocked.payload.status, "blocked");

const revokedHeartbeat = await json("/api/device/heartbeat", { method: "POST", token: sessionToken });
assert.notEqual(revokedHeartbeat.response.status, 200, "blocked device session must be revoked");
assert.equal(revokedHeartbeat.payload.ok, false);

const finalStatus = await json(`/api/device/status?deviceId=${encodeURIComponent(deviceId)}`);
assert.equal(finalStatus.response.status, 200, JSON.stringify(finalStatus.payload));
assert.equal(finalStatus.payload.device.status, "blocked");

console.log(JSON.stringify({
  ok: true,
  deviceCode: registered.payload.device.deviceCode,
  lifecycle: ["pending", "approved", "p256-verified", "heartbeat", "blocked", "session-revoked"],
}, null, 2));
