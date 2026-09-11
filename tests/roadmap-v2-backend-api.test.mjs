import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import {
  buildBackendApiProjection,
  createDisconnectedApiHarness,
  validateApiSurface,
  validateBackendApiContract,
  validateBackendApiManifest,
  validateSyncContract
} from "../roadmap_v2/backend-api.mjs";

const root = path.resolve(".");
const json = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const catalogSummary = { courses: 10, chapters: 85, numberedLessons: 304, dynamicChapters: 8 };
const fresh = () => ({
  contract: json("roadmap_v2/backend-api/backend-api-contract.json"),
  surface: json("roadmap_v2/backend-api/api-surface.json"),
  sync: json("roadmap_v2/backend-api/sync-contract.json"),
  catalogSummary: { ...catalogSummary }
});
const context = (actorUserId = "usr_abcdefgh") => ({ requestId: "req_abcdefgh", actorUserId, sessionId: "ses_abcdefgh", authenticated: true, authSource: "trusted_server_adapter" });

test("valid L33 package builds a deeply frozen disconnected projection", () => {
  const projection = buildBackendApiProjection(fresh());
  assert.equal(projection.counts.endpoints, 7);
  assert.equal(projection.counts.persistenceBlocked, 5);
  assert.equal(Object.isFrozen(projection), true);
});

test("production capability fails closed", () => {
  const { contract } = fresh();
  contract.capabilities.productionServerStart = true;
  assert.throws(() => validateBackendApiContract(contract), /zero production\/persistence capability/);
});

test("database connection counter fails closed", () => {
  const { contract } = fresh();
  contract.persistenceBoundary.databaseConnections = 1;
  assert.throws(() => validateBackendApiContract(contract), /persistence counter drift/);
});

test("default credentials cannot be authorized", () => {
  const { contract } = fresh();
  contract.securityBoundary.defaultCredentialsAllowed = true;
  assert.throws(() => validateBackendApiContract(contract), /Default credentials/);
});

test("plaintext passwords cannot be authorized", () => {
  const { contract } = fresh();
  contract.securityBoundary.plaintextPasswordsAllowed = true;
  assert.throws(() => validateBackendApiContract(contract), /Plaintext passwords/);
});

test("persistence deferral cannot drift", () => {
  const { contract } = fresh();
  contract.scopeDecision.persistenceDeferredTo = "L33/B129";
  assert.throws(() => validateBackendApiContract(contract), /Persistence deferral drift/);
});

test("API production route overclaim fails closed", () => {
  const { surface } = fresh();
  surface.productionRoutesCreated = 1;
  assert.throws(() => validateApiSurface(surface), /created production API routes/);
});

test("endpoint omission fails closed", () => {
  const { surface } = fresh();
  surface.endpoints.pop();
  assert.throws(() => validateApiSurface(surface), /endpoint count drift/);
});

test("duplicate API operation fails closed", () => {
  const { surface } = fresh();
  surface.endpoints[1].operationId = surface.endpoints[0].operationId;
  assert.throws(() => validateApiSurface(surface), /operation IDs contains duplicates/);
});

test("protected endpoint cannot become public", () => {
  const { surface } = fresh();
  surface.endpoints.find((endpoint) => endpoint.operationId === "catalogSummary").auth = "none";
  assert.throws(() => validateApiSurface(surface), /lacks auth/);
});

test("dynamic endpoint cannot escape persistence block", () => {
  const { surface } = fresh();
  surface.endpoints.find((endpoint) => endpoint.operationId === "learningState").harnessDisposition = "implemented_in_memory";
  assert.throws(() => validateApiSurface(surface), /escaped persistence block/);
});

test("sync partial writes cannot be authorized", () => {
  const { sync } = fresh();
  sync.writeEnvelope.partialWritePolicy = "best_effort";
  assert.throws(() => validateSyncContract(sync), /atomic batch boundary drift/);
});

test("sync stale base cannot silently merge", () => {
  const { sync } = fresh();
  sync.writeEnvelope.staleBasePolicy = "last_write_wins";
  assert.throws(() => validateSyncContract(sync), /stale-base policy drift/);
});

test("email cannot become a resource identifier", () => {
  const { sync } = fresh();
  sync.identity.emailAsResourceId = true;
  assert.throws(() => validateSyncContract(sync), /Email was authorized/);
});

test("health endpoint is public, read-only and non-production", () => {
  const harness = createDisconnectedApiHarness(fresh());
  const result = harness.handle({ method: "GET", path: "/api/v1/health" });
  assert.equal(result.status, 200);
  assert.equal(result.body.code, "OK");
  assert.equal(result.persisted, false);
  assert.equal(result.productionRoute, false);
});

test("catalog endpoint requires trusted authentication context", () => {
  const harness = createDisconnectedApiHarness(fresh());
  const result = harness.handle({ method: "GET", path: "/api/v1/catalog/summary" });
  assert.equal(result.status, 401);
  assert.equal(result.body.code, "UNAUTHENTICATED");
});

test("catalog endpoint returns only the pinned summary", () => {
  const harness = createDisconnectedApiHarness(fresh());
  const result = harness.handle({ method: "GET", path: "/api/v1/catalog/summary", context: context() });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.catalog, catalogSummary);
  assert.equal(Object.isFrozen(result.body.catalog), true);
});

test("forged frontend auth source fails closed", () => {
  const harness = createDisconnectedApiHarness(fresh());
  const forged = { ...context(), authSource: "frontend_claim" };
  const result = harness.handle({ method: "GET", path: "/api/v1/catalog/summary", context: forged });
  assert.equal(result.status, 401);
});

test("cross-user read is forbidden before persistence lookup", () => {
  const harness = createDisconnectedApiHarness(fresh());
  const result = harness.handle({ method: "GET", path: "/api/v1/users/usr_otheruser/learning-state", context: context() });
  assert.equal(result.status, 403);
  assert.equal(result.body.code, "CROSS_USER_ACCESS");
});

test("owner learning-state read is blocked while persistence is unavailable", () => {
  const harness = createDisconnectedApiHarness(fresh());
  const result = harness.handle({ method: "GET", path: "/api/v1/users/usr_abcdefgh/learning-state", context: context() });
  assert.equal(result.status, 503);
  assert.equal(result.body.code, "PERSISTENCE_UNAVAILABLE");
  assert.equal(result.body.deferredTo, "L34/B133");
});

test("event append is blocked without writing", () => {
  const harness = createDisconnectedApiHarness(fresh());
  const result = harness.handle({ method: "POST", path: "/api/v1/users/usr_abcdefgh/learning-events", context: context(), body: { forged: true } });
  assert.equal(result.status, 503);
  assert.equal(result.persisted, false);
});

test("sync is blocked without conflict overclaim", () => {
  const harness = createDisconnectedApiHarness(fresh());
  const result = harness.handle({ method: "POST", path: "/api/v1/users/usr_abcdefgh/sync/changes", context: context() });
  assert.equal(result.status, 503);
  assert.equal(result.body.code, "PERSISTENCE_UNAVAILABLE");
});

test("unknown API path returns deterministic not-found", () => {
  const harness = createDisconnectedApiHarness(fresh());
  const result = harness.handle({ method: "GET", path: "/api/v1/unknown", context: context() });
  assert.equal(result.status, 404);
  assert.equal(result.body.code, "NOT_FOUND");
});

test("invalid method fails closed before route handling", () => {
  const harness = createDisconnectedApiHarness(fresh());
  assert.throws(() => harness.handle({ method: "DELETE", path: "/api/v1/health" }), /Unsupported API method/);
});

test("invalid catalog totals fail closed", () => {
  const fx = fresh();
  fx.catalogSummary.courses = 9;
  assert.throws(() => createDisconnectedApiHarness(fx), /Catalog summary drift/);
});

test("manifest source tamper fails closed", () => {
  const manifest = json("roadmap_v2/backend-api/manifest.json");
  assert.throws(() => validateBackendApiManifest(manifest, (name) => {
    const bytes = fs.readFileSync(path.join(root, name));
    return name === "roadmap_v2/backend-api/api-surface.json" ? Buffer.concat([bytes, Buffer.from("tamper")]) : bytes;
  }), /fingerprint drift/);
});

test("manifest missing source fails closed", () => {
  const manifest = json("roadmap_v2/backend-api/manifest.json");
  assert.throws(() => validateBackendApiManifest(manifest, (name) => {
    if (name === "roadmap_v2/backend-api/sync-contract.json") throw new Error("ENOENT");
    return fs.readFileSync(path.join(root, name));
  }), /file missing/);
});

test("manifest write counter fails closed", () => {
  const manifest = json("roadmap_v2/backend-api/manifest.json");
  manifest.safety.eventWrites = 1;
  assert.throws(() => validateBackendApiManifest(manifest, (name) => fs.readFileSync(path.join(root, name))), /mutation\/write count drift/);
});
