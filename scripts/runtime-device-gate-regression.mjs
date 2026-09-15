import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

function text(path) {
  return readFileSync(path, "utf8");
}

function syntax(path) {
  const result = spawnSync(process.execPath, ["--check", path], { encoding: "utf8" });
  assert.equal(result.status, 0, `${path} must parse: ${result.stderr || result.stdout}`);
}

const html = text("index.html");
const config = text("assets/js/platform/runtime-config.js");
const gate = text("assets/js/platform/device-access-gate.js");
const css = text("assets/css/device-access-gate.css");
const server = text("scripts/serve-local-runtime.mjs");
const sitesBuild = text("scripts/prepare-chatgpt-site.mjs");
const hosting = JSON.parse(text(".openai/hosting.json"));
const control = text("control-service/src/index.ts");
const store = text("control-service/src/device-store.ts");

syntax("assets/js/platform/runtime-config.js");
syntax("assets/js/platform/device-access-gate.js");
syntax("scripts/serve-local-runtime.mjs");

assert.match(html, /assets\/css\/device-access-gate\.css/);
assert.match(html, /assets\/js\/platform\/runtime-config\.js/);
assert.match(html, /assets\/js\/platform\/device-access-gate\.js/);
const configIndex = html.indexOf("assets/js/platform/runtime-config.js");
const gateIndex = html.indexOf("assets/js/platform/device-access-gate.js");
const appIndex = html.indexOf("assets/js/data.js");
assert.ok(configIndex >= 0 && gateIndex > configIndex && appIndex > gateIndex, "Device Gate must load before learning application code");
assert.doesNotMatch(html, /bauman-platform-access/, "Source runtime must not trust the deployment platform implicitly");

assert.match(config, /protocol:\s*'bauman-control-v4'/);
assert.match(config, /local \? 'http:\/\/127\.0\.0\.1:3003'/);
assert.match(config, /deviceAccess:\s*true/);
assert.match(config, /offlineGraceMs:\s*86400000/);
assert.doesNotMatch(config, /workers\.dev/);
assert.doesNotMatch(config, /chatgpt\.site/);

assert.match(gate, /indexedDB\.open\(DB_NAME, 1\)/);
assert.match(gate, /generateKey\([\s\S]*ECDSA[\s\S]*P-256[\s\S]*false/);
assert.match(gate, /privateKey\.extractable/);
assert.match(gate, /exportKey\('jwk', pair\.publicKey\)/);
assert.doesNotMatch(gate, /exportKey\([^\n]*privateKey/);
assert.match(gate, /\/api\/device\/register/);
assert.match(gate, /\/api\/device\/challenge/);
assert.match(gate, /\/api\/device\/verify/);
assert.match(gate, /\/api\/device\/heartbeat/);
assert.match(gate, /\/api\/device\/status/);
assert.match(gate, /sessionStorage\.setItem\(SESSION_KEY/);
assert.match(gate, /identity\.lastKnownStatus === 'approved'/);
assert.match(gate, /connectivityFailure\(error\) && withinOfflineGrace\(identity\)/);
assert.match(gate, /DEVICE_BLOCKED/);
assert.match(gate, /DEVICE_PENDING/);
assert.match(gate, /platformAccessMode === 'chatgpt-site-owner-private'/);
assert.match(gate, /BAUMAN_DEVICE_ACCESS_BOUNDARY/);
assert.doesNotMatch(gate, /localBypass|localhost.*bypass|skip.*device/i);
assert.doesNotMatch(gate, /password|123456789|loginPass/i);

assert.match(css, /data-bauman-device-access="pending"/);
assert.match(css, /data-bauman-device-access="blocked"/);
assert.match(css, /visibility:\s*hidden\s*!important/);
assert.match(css, /data-bauman-device-access="authorized"/);

assert.match(server, /127\.0\.0\.1/);
assert.match(server, /_local\/health/);
assert.match(server, /request\.method !== "GET" && request\.method !== "HEAD"/);
assert.match(server, /segment === "\.\." \|\| segment === "\.git"/);
assert.doesNotMatch(server, /0\.0\.0\.0/);

assert.equal(hosting.static?.directory, "dist");
assert.equal(hosting.static?.not_found_handling, "none");
assert.match(sitesBuild, /runtime-dist/);
assert.match(sitesBuild, /chatgpt-site-owner-private/);
assert.match(sitesBuild, /bauman-build-revision/);

assert.match(control, /BAUMAN_APP_ORIGIN/);
assert.match(control, /requireAppOrigin/);
assert.match(control, /\/api\/device\/challenge/);
assert.match(control, /\/api\/device\/verify/);
assert.match(control, /\/api\/device\/heartbeat/);
assert.match(control, /learningAccessGate:\s*false/);
assert.match(store, /CHALLENGE_TTL_MS = 2 \* 60 \* 1000/);
assert.match(store, /DEVICE_SESSION_TTL_MS = 24 \* 60 \* 60 \* 1000/);
assert.match(store, /DELETE FROM bm_device_challenges WHERE challenge_id=\? AND device_id=\?/);
assert.match(store, /revokeDeviceSessions/);

console.log("Bauman runtime Device Gate regression: PASS");
