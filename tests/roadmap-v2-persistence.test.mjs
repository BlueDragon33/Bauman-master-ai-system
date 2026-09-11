import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import {
  buildPersistenceProjection,
  canonicalJson,
  createTransactionalPersistenceHarness,
  migrationChecksum,
  simulateMigrations,
  simulateRollback,
  validateBackupRestoreContract,
  validateMigrationPlan,
  validatePersistenceContract,
  validatePersistenceManifest,
  validateRelationalModel
} from "../roadmap_v2/persistence.mjs";

const root = path.resolve(".");
const json = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const fresh = () => ({
  contract: json("roadmap_v2/persistence/persistence-contract.json"),
  model: json("roadmap_v2/persistence/relational-model.json"),
  migrations: json("roadmap_v2/persistence/migration-plan.json"),
  backup: json("roadmap_v2/persistence/backup-restore-contract.json")
});
const harness = (options = {}) => createTransactionalPersistenceHarness({ ...fresh(), ...options });
const event = (eventId = "evt_alpha001", type = "bookmark_changed", payload = { targetId: "MATH-L1-C01" }) => ({ eventId, type, occurredAt: "2026-08-13T01:00:00.000Z", payload });
const setup = (options = {}) => {
  const store = harness(options);
  const userId = "usr_alpha001";
  const deviceId = "dev_alpha001";
  store.seedUser({ actorUserId: userId, userId });
  store.registerDevice({ actorUserId: userId, userId, deviceId, label: "Laptop" });
  return { store, userId, deviceId };
};
const request = ({ userId = "usr_alpha001", actorUserId = userId, deviceId = "dev_alpha001", idempotencyKey = "idem_alpha001", baseCursor = "cur_0000000000000000", events = [event()] } = {}) => ({ actorUserId, userId, deviceId, idempotencyKey, baseCursor, events });
const expectCode = (fn, code) => assert.throws(fn, (error) => error?.code === code);
const resign = (backup) => {
  const clone = structuredClone(backup);
  delete clone.sha256;
  clone.sha256 = crypto.createHash("sha256").update(canonicalJson(clone)).digest("hex");
  return clone;
};

test("valid L34 package builds a deeply frozen provider-neutral projection", () => {
  const projection = buildPersistenceProjection(fresh());
  assert.equal(projection.counts.tables, 12);
  assert.equal(projection.transactionSimulation.replayAdditionalWrites, 0);
  assert.equal(projection.migrationSimulation.tablesAfterRollback, 0);
  assert.equal(Object.isFrozen(projection), true);
});

test("real provider selection overclaim fails closed", () => {
  const { contract } = fresh();
  contract.provider = "neon";
  assert.throws(() => validatePersistenceContract(contract), /provider\/mode drift/);
});

test("production database capability fails closed", () => {
  const { contract } = fresh();
  contract.capabilities.productionDatabaseConnect = true;
  assert.throws(() => validatePersistenceContract(contract), /capability must remain disabled/);
});

test("production connection counter fails closed", () => {
  const { contract } = fresh();
  contract.productionBoundary.databaseConnections = 1;
  assert.throws(() => validatePersistenceContract(contract), /counter drift/);
});

test("legacy localStorage compatibility cannot be removed", () => {
  const { contract } = fresh();
  contract.compatibility.legacyLocalStorageRetained = false;
  assert.throws(() => validatePersistenceContract(contract), /compatibility was removed/);
});

test("plaintext passwords cannot be authorized", () => {
  const { contract } = fresh();
  contract.securityBoundary.plaintextPasswordsAllowed = true;
  assert.throws(() => validatePersistenceContract(contract), /Credential\/password boundary drift/);
});

test("duplicate allowed event type fails closed", () => {
  const { contract } = fresh();
  contract.eventPolicy.allowedTypes[1] = contract.eventPolicy.allowedTypes[0];
  assert.throws(() => validatePersistenceContract(contract), /duplicates/);
});

test("valid relational model has 12 tables and no password columns", () => {
  const { model } = fresh();
  assert.equal(validateRelationalModel(model), true);
  assert.equal(model.tables.flatMap((table) => table.columns).some((column) => /password/i.test(column.name)), false);
});

test("password column fails closed", () => {
  const { model } = fresh();
  model.tables[0].columns.push({ name: "password_plaintext", type: "text", nullable: true });
  assert.throws(() => validateRelationalModel(model), /Forbidden credential column/);
});

test("missing user ownership column fails closed", () => {
  const { model } = fresh();
  model.tables.find((table) => table.name === "bookmarks").ownerColumn = null;
  assert.throws(() => validateRelationalModel(model), /ownership column missing/);
});

test("nullable user ownership column fails closed", () => {
  const { model } = fresh();
  model.tables.find((table) => table.name === "mentor_history").columns.find((column) => column.name === "user_id").nullable = true;
  assert.throws(() => validateRelationalModel(model), /Non-null user ownership missing/);
});

test("destructive cascade constraint fails closed", () => {
  const { model } = fresh();
  model.tables.find((table) => table.name === "devices").constraints.push("on_delete_cascade");
  assert.throws(() => validateRelationalModel(model), /Destructive cascade/);
});

test("derived snapshot cannot become event authority", () => {
  const { model } = fresh();
  model.tables.find((table) => table.name === "mastery_snapshots").authority = "source_of_truth";
  assert.throws(() => validateRelationalModel(model), /Projection authority overclaim/);
});

test("duplicate table name fails closed", () => {
  const { model } = fresh();
  model.tables[1].name = model.tables[0].name;
  assert.throws(() => validateRelationalModel(model), /duplicates|membership drift/);
});

test("valid migrations apply all tables/indexes and roll back to empty", () => {
  const { migrations, model } = fresh();
  const applied = simulateMigrations(migrations, model);
  const rolledBack = simulateRollback(migrations, model);
  assert.equal(applied.tables.length, 12);
  assert.equal(applied.indexes.length, 4);
  assert.deepEqual(rolledBack.tables, []);
  assert.deepEqual(rolledBack.indexes, []);
});

test("migration checksum drift fails closed", () => {
  const { migrations, model } = fresh();
  migrations.migrations[0].up[0].table = "forged_users";
  assert.throws(() => validateMigrationPlan(migrations, model), /checksum drift/);
});

test("missing down operation fails closed", () => {
  const { migrations, model } = fresh();
  const target = migrations.migrations[1];
  target.down.pop();
  target.checksumSha256 = migrationChecksum(target);
  assert.throws(() => validateMigrationPlan(migrations, model), /up\/down symmetry/);
});

test("non-transactional migration fails closed", () => {
  const { migrations, model } = fresh();
  const target = migrations.migrations[2];
  target.transactionRequired = false;
  target.checksumSha256 = migrationChecksum(target);
  assert.throws(() => validateMigrationPlan(migrations, model), /not transactional/);
});

test("migration dependency drift fails closed", () => {
  const { migrations, model } = fresh();
  const target = migrations.migrations[2];
  target.dependsOn = [];
  target.checksumSha256 = migrationChecksum(target);
  assert.throws(() => validateMigrationPlan(migrations, model), /dependency/);
});

test("automatic production down migration fails closed", () => {
  const { migrations, model } = fresh();
  migrations.rollback.automaticProductionDownMigrationAllowed = true;
  assert.throws(() => validateMigrationPlan(migrations, model), /Rollback safety boundary drift/);
});

test("valid backup contract requires isolated atomic restore", () => {
  const { backup } = fresh();
  assert.equal(validateBackupRestoreContract(backup), true);
});

test("in-place restore authorization fails closed", () => {
  const { backup } = fresh();
  backup.restorePolicy.inPlaceOverwriteAllowed = true;
  assert.throws(() => validateBackupRestoreContract(backup), /Isolated atomic restore boundary drift/);
});

test("production backup counter fails closed", () => {
  const { backup } = fresh();
  backup.productionBoundary.backupsCreated = 1;
  assert.throws(() => validateBackupRestoreContract(backup), /production counter drift/);
});

test("isolated harness seeds user and registers owned device", () => {
  const { store } = setup();
  const counts = store.summary().counts;
  assert.equal(counts.users, 1);
  assert.equal(counts.devices, 1);
  assert.equal(counts.user_sync_heads, 1);
  assert.equal(store.productionConnected, false);
});

test("cross-user seed fails closed", () => {
  const store = harness();
  expectCode(() => store.seedUser({ actorUserId: "usr_alpha001", userId: "usr_bravo001" }), "CROSS_USER_ACCESS");
});

test("invalid device ID fails closed", () => {
  const store = harness();
  store.seedUser({ actorUserId: "usr_alpha001", userId: "usr_alpha001" });
  expectCode(() => store.registerDevice({ actorUserId: "usr_alpha001", userId: "usr_alpha001", deviceId: "phone" }), "INVALID_DEVICE_ID");
});

test("atomic append commits ordered events and advances cursor", () => {
  const { store } = setup();
  const result = store.appendBatch(request({ events: [event("evt_alpha001"), event("evt_alpha002", "preference_changed", { key: "language", value: "vi" })] }));
  assert.equal(result.eventCount, 2);
  assert.equal(result.cursor, "cur_0000000000000002");
  const changes = store.readChanges({ actorUserId: "usr_alpha001", userId: "usr_alpha001" });
  assert.deepEqual(changes.events.map((item) => item.event_id), ["evt_alpha001", "evt_alpha002"]);
});

test("same idempotency key and request returns original result without writes", () => {
  const { store } = setup();
  const input = request();
  const first = store.appendBatch(input);
  const before = store.summary().counts.learning_events;
  const second = store.appendBatch(input);
  assert.deepEqual(second, first);
  assert.equal(store.summary().counts.learning_events, before);
});

test("same idempotency key with different request fails closed", () => {
  const { store } = setup();
  store.appendBatch(request());
  expectCode(() => store.appendBatch(request({ events: [event("evt_alpha002")] })), "IDEMPOTENCY_CONFLICT");
  assert.equal(store.summary().counts.learning_events, 1);
});

test("stale base cursor returns server cursor without writes", () => {
  const { store } = setup();
  store.appendBatch(request());
  assert.throws(() => store.appendBatch(request({ idempotencyKey: "idem_alpha002", events: [event("evt_alpha002")] })), (error) => error.code === "STALE_BASE_CURSOR" && error.details.serverCursor === "cur_0000000000000001");
  assert.equal(store.summary().counts.learning_events, 1);
});

test("cross-user append fails before lookup/write", () => {
  const { store } = setup();
  expectCode(() => store.appendBatch(request({ actorUserId: "usr_bravo001" })), "CROSS_USER_ACCESS");
  assert.equal(store.summary().counts.learning_events, 0);
});

test("device ownership mismatch fails closed", () => {
  const { store } = setup();
  store.seedUser({ actorUserId: "usr_bravo001", userId: "usr_bravo001" });
  store.registerDevice({ actorUserId: "usr_bravo001", userId: "usr_bravo001", deviceId: "dev_bravo001" });
  expectCode(() => store.appendBatch(request({ deviceId: "dev_bravo001" })), "DEVICE_OWNERSHIP_MISMATCH");
});

test("duplicate event within a batch rejects the entire batch", () => {
  const { store } = setup();
  expectCode(() => store.appendBatch(request({ events: [event(), event()] })), "DUPLICATE_EVENT_ID");
  assert.equal(store.summary().counts.learning_events, 0);
});

test("duplicate persisted event ID fails closed", () => {
  const { store } = setup();
  store.appendBatch(request());
  expectCode(() => store.appendBatch(request({ idempotencyKey: "idem_alpha002", baseCursor: "cur_0000000000000001" })), "DUPLICATE_EVENT_ID");
  assert.equal(store.summary().counts.learning_events, 1);
});

test("unknown event type rejects the entire batch", () => {
  const { store } = setup();
  expectCode(() => store.appendBatch(request({ events: [event("evt_alpha001"), event("evt_alpha002", "invented_event")] })), "UNKNOWN_EVENT_TYPE");
  assert.equal(store.summary().counts.learning_events, 0);
  assert.equal(store.summary().counts.idempotency_keys, 0);
});

test("batch above 100 events fails closed", () => {
  const { store } = setup();
  const events = Array.from({ length: 101 }, (_, index) => event(`evt_${String(index).padStart(8, "0")}`));
  expectCode(() => store.appendBatch(request({ events })), "INVALID_BATCH_SIZE");
});

test("injected pre-commit failure leaves every table unchanged", () => {
  const { store } = setup({ failureInjector: () => { throw new Error("simulated transaction failure"); } });
  const before = store.summary();
  assert.throws(() => store.appendBatch(request()), /simulated transaction failure/);
  assert.deepEqual(store.summary(), before);
});

test("change reads paginate deterministically across devices", () => {
  const { store } = setup();
  store.appendBatch(request({ events: [event("evt_alpha001"), event("evt_alpha002"), event("evt_alpha003")] }));
  const first = store.readChanges({ actorUserId: "usr_alpha001", userId: "usr_alpha001", limit: 2 });
  assert.equal(first.cursor, "cur_0000000000000002");
  assert.equal(first.serverCursor, "cur_0000000000000003");
  assert.equal(first.hasMore, true);
  const second = store.readChanges({ actorUserId: "usr_alpha001", userId: "usr_alpha001", sinceCursor: first.cursor });
  assert.deepEqual(second.events.map((item) => item.event_id), ["evt_alpha003"]);
  assert.equal(second.hasMore, false);
});

test("cursor ahead of server fails closed", () => {
  const { store } = setup();
  expectCode(() => store.readChanges({ actorUserId: "usr_alpha001", userId: "usr_alpha001", sinceCursor: "cur_0000000000000001" }), "CURSOR_AHEAD_OF_SERVER");
});

test("backup is canonical and deterministic for unchanged state", () => {
  const { store } = setup();
  store.appendBatch(request());
  assert.deepEqual(store.createBackup(), store.createBackup());
  assert.match(store.createBackup().sha256, /^[0-9a-f]{64}$/);
});

test("verified backup restores through isolated validation and atomic swap", () => {
  const { store } = setup();
  store.appendBatch(request({ events: [event("evt_alpha001"), event("evt_alpha002")] }));
  const backup = store.createBackup();
  const target = harness();
  const result = target.restoreBackup(backup);
  assert.equal(result.atomicSwap, true);
  assert.equal(target.summary().counts.learning_events, 2);
  assert.equal(target.readChanges({ actorUserId: "usr_alpha001", userId: "usr_alpha001" }).serverCursor, "cur_0000000000000002");
});

test("tampered backup is rejected without mutating current state", () => {
  const source = setup().store;
  source.appendBatch(request());
  const tampered = structuredClone(source.createBackup());
  tampered.tables.learning_events[0].payload_json.targetId = "FORGED";
  const target = setup().store;
  const before = target.summary();
  expectCode(() => target.restoreBackup(tampered), "BACKUP_DIGEST_MISMATCH");
  assert.deepEqual(target.summary(), before);
});

test("backup schema mismatch is rejected", () => {
  const { store } = setup();
  const backup = structuredClone(store.createBackup());
  backup.storageSchemaVersion = "bauman.persistence.v999";
  expectCode(() => harness().restoreBackup(backup), "BACKUP_SCHEMA_MISMATCH");
});

test("re-signed orphan user-owned record is rejected", () => {
  const { store } = setup();
  const backup = structuredClone(store.createBackup());
  backup.tables.user_preferences.push({ user_id: "usr_missing01", preference_key: "language", preference_json: { value: "vi" }, source_cursor_value: 0 });
  backup.recordCounts.user_preferences += 1;
  expectCode(() => harness().restoreBackup(resign(backup)), "BACKUP_CROSS_USER_RECORD");
});

test("re-signed event/device ownership mismatch is rejected", () => {
  const { store } = setup();
  store.appendBatch(request());
  const backup = structuredClone(store.createBackup());
  backup.tables.learning_events[0].device_id = "dev_missing01";
  expectCode(() => harness().restoreBackup(resign(backup)), "BACKUP_DEVICE_OWNERSHIP_MISMATCH");
});

test("re-signed cursor mismatch is rejected", () => {
  const { store } = setup();
  store.appendBatch(request());
  const backup = structuredClone(store.createBackup());
  backup.tables.user_sync_heads[0].cursor_value = 2;
  expectCode(() => harness().restoreBackup(resign(backup)), "BACKUP_CURSOR_MISMATCH");
});

test("manifest source tamper fails closed", () => {
  const manifest = json("roadmap_v2/persistence/manifest.json");
  assert.throws(() => validatePersistenceManifest(manifest, (name) => {
    const bytes = fs.readFileSync(path.join(root, name));
    return name === "roadmap_v2/persistence/relational-model.json" ? Buffer.concat([bytes, Buffer.from("tamper")]) : bytes;
  }), /fingerprint drift/);
});

test("manifest missing source fails closed", () => {
  const manifest = json("roadmap_v2/persistence/manifest.json");
  assert.throws(() => validatePersistenceManifest(manifest, (name) => {
    if (name === "roadmap_v2/persistence/migration-plan.json") throw new Error("ENOENT");
    return fs.readFileSync(path.join(root, name));
  }), /file missing/);
});

test("manifest production write counter fails closed", () => {
  const manifest = json("roadmap_v2/persistence/manifest.json");
  manifest.safety.productionEventWrites = 1;
  assert.throws(() => validatePersistenceManifest(manifest, (name) => fs.readFileSync(path.join(root, name))), /write counter drift/);
});
