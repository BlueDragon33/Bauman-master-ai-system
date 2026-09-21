import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

async function json(path) {
  return JSON.parse(await source(path));
}

test("Bauman control service remains app-scoped and signed", async () => {
  const worker = await source("../src/index.ts");
  assert.match(worker, /BAUMAN_CONTROL_SERVICE_SECRET/);
  assert.match(worker, /TOKEN_ISSUER = "application-management"/);
  assert.match(worker, /TOKEN_AUDIENCE = "bauman-control"/);
  assert.match(worker, /TOKEN_APP = "bauman-master-ai"/);
  assert.match(worker, /HMAC/);
  assert.doesNotMatch(worker, /HEALTH_CONTROL_SERVICE_SECRET|RU_LIFE_CONTROL_SERVICE_SECRET|MEDICINE_SERVICE_SECRET/);
});

test("Bauman v4 publishes real device control only when D1 is ready", async () => {
  const worker = await source("../src/index.ts");
  assert.match(worker, /CONTROL_PROTOCOL = "bauman-control-v4"/);
  assert.match(worker, /databaseReady/);
  assert.match(worker, /deviceRegistry: ready/);
  assert.match(worker, /deviceIdempotentCommands: ready/);
  assert.match(worker, /optimisticConcurrency: ready/);
  assert.match(worker, /p256ChallengeProof: ready && appOriginReady/);
  assert.match(worker, /revocableDeviceSessions: ready && appOriginReady/);
  assert.match(worker, /learningAccessGate: false/);
});

test("Cloudflare preview promotes learningAccessGate only after D1 and app origin are ready", async () => {
  const preview = await source("../src/cloudflare-preview.ts");
  assert.match(preview, /import controlService from "\.\/automation-contract"/);
  assert.match(preview, /const gateAvailable = ready && appOriginReady/);
  assert.match(preview, /learningAccessGate: gateAvailable/);
  assert.match(preview, /accessGate: gateAvailable \? "available" : "configuration-required"/);
  assert.match(preview, /BAUMAN_DEPLOYMENT_CHANNEL/);
  assert.match(preview, /BAUMAN_BUILD_REVISION/);
});

test("device gateway uses single-use P-256 challenge proof before issuing a session", async () => {
  const worker = await source("../src/index.ts");
  const store = await source("../src/device-store.ts");
  assert.match(worker, /\/api\/device\/register/);
  assert.match(worker, /\/api\/device\/challenge/);
  assert.match(worker, /\/api\/device\/verify/);
  assert.match(worker, /\/api\/device\/heartbeat/);
  assert.match(store, /bauman-device:v1:\$\{deviceId\}:\$\{challengeId\}:\$\{challenge\.challenge\}/);
  assert.match(store, /DELETE FROM bm_device_challenges WHERE challenge_id=\? AND device_id=\?/);
  assert.match(store, /crypto\.subtle\.verify/);
  assert.match(store, /sessionToken = `bm1\.\$\{randomToken\(32\)\}`/);
  assert.match(store, /DEVICE_PENDING/);
  assert.match(store, /DEVICE_BLOCKED/);
});

test("private key never belongs in Bauman server storage", async () => {
  const migration = await source("../migrations/0001_device_control.sql");
  const store = await source("../src/device-store.ts");
  assert.match(migration, /public_jwk_json TEXT NOT NULL/);
  assert.doesNotMatch(migration, /private[_ ]?(key|jwk)/i);
  assert.doesNotMatch(store, /privateKey|private_jwk|privateJwk/);
});

test("block preserves registry and revokes sessions", async () => {
  const store = await source("../src/device-store.ts");
  assert.match(store, /SET status='blocked', edit_enabled=0/);
  assert.match(store, /revokeDeviceSessions/);
  assert.match(store, /state='revoked'/);
  assert.match(store, /registryPreserved: true/);
  assert.doesNotMatch(store, /DELETE FROM bm_devices/);
});

test("Bauman command ledger is idempotent and compare-and-set protected", async () => {
  const store = await source("../src/device-store.ts");
  assert.match(store, /commandId/);
  assert.match(store, /expectedStatus/);
  assert.match(store, /COMMAND_ID_PAYLOAD_MISMATCH/);
  assert.match(store, /COMMAND_IN_PROGRESS/);
  assert.match(store, /COMMAND_REQUIRES_RECONCILIATION/);
  assert.match(store, /WHERE device_id=\? AND status=\?/);
  assert.match(store, /replayed: true/);
  assert.match(store, /state='uncertain'/);
});

test("Bauman D1 schema owns registry, challenge, session, command and audit tables", async () => {
  const migration = await source("../migrations/0001_device_control.sql");
  for (const table of ["bm_devices", "bm_device_challenges", "bm_device_sessions", "bm_control_commands", "bm_audit_log"]) {
    assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  }
});

test("Bauman auto approval is client-owned, persisted and only promotes pending devices", async () => {
  const automation = await source("../src/automation-contract.ts");
  const migration = await source("../migrations/0002_automation_policy.sql");
  assert.match(migration, /CREATE TABLE IF NOT EXISTS bm_automation_policy/);
  assert.match(migration, /auto_approve_devices INTEGER DEFAULT 0/);
  assert.match(automation, /\/api\/control\/automation/);
  assert.match(automation, /deviceAutoApproval: ready/);
  assert.match(automation, /WHERE device_id=\? AND status='pending'/);
  assert.match(automation, /device_auto_approved/);
  assert.match(automation, /identity\.role !== "owner"/);
  assert.match(automation, /CONTROL_TICKET_FORBIDDEN/);
});

test("local Bauman control uses an isolated D1 binding", async () => {
  const local = await json("../wrangler.local.jsonc");
  assert.equal(local.name, "bauman-control-local");
  assert.equal(local.main, "src/automation-contract.ts");
  assert.equal(local.d1_databases?.[0]?.binding, "DB");
  assert.equal(local.d1_databases?.[0]?.database_name, "bauman-control-local");
  assert.equal(local.d1_databases?.[0]?.migrations_dir, "migrations");
  assert.match(local.d1_databases?.[0]?.database_id ?? "", /^00000000-0000-0000-0000-000000000002$/);
});

test("machine-readable contract records the E2E-verified learning gate and isolated preview", async () => {
  const contract = await json("../../control/application-management.contract.json");
  assert.equal(contract.contractVersion, 6);
  assert.equal(contract.controlService.protocol, "bauman-control-v4");
  assert.equal(contract.requiredDeviceContract.namespace, "BM-");
  assert.equal(contract.requiredDeviceContract.challengeSingleUse, true);
  assert.equal(contract.requiredDeviceContract.blockedDeviceSessionsRevoked, true);
  assert.equal(contract.readiness.learningAccessGate, "implemented-e2e-verified-requires-d1-and-app-origin");
  assert.equal(contract.cloudflarePreview.manualOnly, true);
  assert.equal(contract.cloudflarePreview.controlWorker, "bauman-control-preview");
  assert.equal(contract.cloudflarePreview.controlDatabase, "bauman-control-preview-db");
  assert.equal(contract.cloudflarePreview.learningWorker, "bauman-master-ai-preview");
  assert.equal(contract.cloudflarePreview.productionDataIsolated, true);
  assert.equal(contract.cloudflarePreview.chatgptSitesFallbackAllowed, false);
  assert.equal(contract.policy.centralMayClaimLearningGateOnlyAfterLiveCapabilityProbe, true);
});


test("Issue #28 device metadata and admin mutation contract are complete", async () => {
  const store = await source("../src/device-store.ts");
  const migration = await source("../migrations/0003_device_metadata_contract.sql");
  assert.match(store, /BM-\$\{key\.slice\(0, 4\)\}-\$\{key\.slice\(4, 8\)\}-\$\{key\.slice\(8, 12\)\}-\$\{key\.slice\(12, 16\)\}/);
  assert.match(store, /platform: row\.platform/);
  assert.match(store, /browser: row\.browser/);
  assert.match(store, /payload\.operation === "unblock"/);
  assert.match(store, /payload\.operation === "set_edit_permission"/);
  assert.match(store, /device_unblocked/);
  assert.match(store, /device_edit_permission_changed/);
  assert.match(migration, /ADD COLUMN platform TEXT/);
  assert.match(migration, /ADD COLUMN browser TEXT/);
});

test("runtime worker denies protected learning data without a live approved device session", async () => {
  const runtime = await source("../../cloudflare/runtime-worker.mjs");
  const gate = await source("../../assets/js/platform/device-access-gate.js");
  assert.match(runtime, /RUNTIME_SESSION_COOKIE = '__Host-bauman_session'/);
  assert.match(runtime, /protectedLearningAsset/);
  assert.match(runtime, /\/api\/runtime\/session/);
  assert.match(runtime, /\/api\/device\/heartbeat/);
  assert.match(runtime, /DEVICE_SESSION_REQUIRED/);
  assert.match(runtime, /set-cookie/);
  assert.match(gate, /bindRuntimeSession/);
  assert.match(gate, /platform: detectPlatform\(\)/);
  assert.match(gate, /browser: detectBrowser\(\)/);
});

test("Bauman topology remains under one level-1 hub", async () => {
  const worker = await source("../src/index.ts");
  for (const id of ["math", "programming", "ai", "signal", "systems", "foundation", "research", "russian"]) {
    assert.match(worker, new RegExp(`id: "${id}"`));
  }
  assert.match(worker, /BlueDragon33\/Math_Bauman/);
  assert.match(worker, /subclients: "Bauman-master-ai-system"/);
});
