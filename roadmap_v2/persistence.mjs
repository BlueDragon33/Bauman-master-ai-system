import crypto from "node:crypto";

const EXPECTED_TABLES = Object.freeze([
  "users",
  "devices",
  "learning_events",
  "idempotency_keys",
  "user_sync_heads",
  "mastery_snapshots",
  "assessment_attempts",
  "study_schedule_entries",
  "bookmarks",
  "weak_topics",
  "mentor_history",
  "user_preferences"
]);
const EXPECTED_MIGRATIONS = Object.freeze([
  "0001_identity_devices",
  "0002_event_sync_core",
  "0003_learning_state",
  "0004_operational_indexes"
]);
const ZERO_CURSOR = "cur_0000000000000000";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function unique(values, label) {
  assert(new Set(values).size === values.length, `${label} contains duplicates`);
}

function sameJson(actual, expected, label) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${label} drift`);
}

function sameMembers(actual, expected, label) {
  unique(actual, label);
  assert(actual.length === expected.length, `${label} count drift`);
  const left = [...actual].sort();
  const right = [...expected].sort();
  assert(left.every((value, index) => value === right[index]), `${label} membership drift`);
}

export function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

function sha256(value) {
  return crypto.createHash("sha256").update(typeof value === "string" || Buffer.isBuffer(value) ? value : canonicalJson(value)).digest("hex");
}

export function migrationChecksum(migration) {
  return sha256({
    id: migration.id,
    dependsOn: migration.dependsOn,
    transactionRequired: migration.transactionRequired,
    targetTables: migration.targetTables,
    up: migration.up,
    down: migration.down
  });
}

export class PersistenceError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "PersistenceError";
    this.code = code;
    this.details = deepFreeze(structuredClone(details));
  }
}

export function validatePersistenceContract(contract) {
  assert(contract?.schema === "BAUMAN_ROADMAP_V2_PERSISTENCE_CONTRACT_V1", "Persistence contract schema drift");
  assert(contract.version === "2.14.0-l34-b133" && contract.status === "PASS_B133_PROVIDER_NEUTRAL_CONTRACT", "Persistence contract status drift");
  assert(contract.baselineCommit === "e383912354673bdce7a0059d6b9a23799d74e689", "Persistence baseline drift");
  assert(contract.headBeforeL34 === "cf88194bfa66b37856b6e477a94449158b99833d", "Pre-L34 head drift");
  assert(contract.mode === "PROVIDER_NEUTRAL_TRANSACTIONAL_IN_MEMORY_HARNESS" && contract.provider === "unselected", "Persistence provider/mode drift");
  assert(contract.storageSchemaVersion === "bauman.persistence.v1", "Persistence schema version drift");
  assert(contract.scopeDecision?.thisTurnLayer === "database_persistence_contract", "Persistence scope layer drift");
  assert(contract.scopeDecision?.realProviderSelectionRequiredBeforeConnection === true, "Provider selection gate was bypassed");
  assert(contract.scopeDecision?.authDeferredUntilStableSiteBackendDatabase === true, "Authentication staging drift");
  sameJson(contract.scopeDecision?.sequence, ["inventory", "normalize", "separate_layers", "site", "backend_api", "database_persistence", "multi_device_sync", "personal_ai"], "migration sequence");
  assert(contract.compatibility?.legacyLocalStorageRetained === true, "Legacy localStorage compatibility was removed");
  assert(contract.compatibility?.legacyLocalStorageRole === "temporary_cache_and_offline_fallback", "Legacy localStorage role drift");
  assert(contract.compatibility?.destructiveClientRewriteAllowed === false && contract.compatibility?.staticContentRemainsHashPinnedFiles === true, "Compatibility/static-content boundary drift");
  assert(contract.identity?.emailAsResourceId === false, "Email was authorized as a resource ID");
  assert(contract.identity?.userIdPrefix === "usr_" && contract.identity?.deviceIdPrefix === "dev_" && contract.identity?.eventIdPrefix === "evt_" && contract.identity?.cursorPrefix === "cur_" && contract.identity?.idempotencyKeyPrefix === "idem_", "Opaque ID prefix drift");
  assert(contract.eventPolicy?.appendOnly === true && contract.eventPolicy?.maxEventsPerBatch === 100, "Append-only event policy drift");
  assert(Array.isArray(contract.eventPolicy?.allowedTypes) && contract.eventPolicy.allowedTypes.length === 11, "Allowed event type count drift");
  unique(contract.eventPolicy.allowedTypes, "allowed event types");
  assert(contract.eventPolicy?.staleBasePolicy === "reject_with_conflict_and_server_cursor", "Stale-base policy drift");
  assert(contract.eventPolicy?.idempotencyPolicy === "same_key_same_request_returns_original_result", "Idempotency policy drift");
  assert(contract.eventPolicy?.partialWritePolicy === "forbidden_atomic_batch" && contract.eventPolicy?.crossUserPolicy === "reject_before_lookup_or_write", "Atomicity/ownership policy drift");
  const security = contract.securityBoundary || {};
  assert(security.trustedServerActorRequired === true && security.exactUserOwnershipRequired === true, "Trusted actor/ownership boundary incomplete");
  assert(security.defaultCredentialsAllowed === false && security.plaintextPasswordsAllowed === false && security.passwordColumnsAllowed === false, "Credential/password boundary drift");
  assert(security.frontendSecretsAllowed === false && security.callerSuppliedRolesTrusted === false, "Frontend trust boundary drift");
  assert(security.rowLevelOwnershipPolicyRequiredBeforeProduction === true, "Future row-ownership gate missing");
  assert(Object.keys(contract.productionBoundary || {}).length === 9 && Object.values(contract.productionBoundary).every((value) => value === 0), "Production persistence counter drift");
  assert(Object.keys(contract.capabilities || {}).length === 10 && Object.values(contract.capabilities).every((value) => value === false), "Production persistence capability must remain disabled");
  assert(contract.harness?.inMemoryOnly === true && contract.harness?.transactionalBatchSimulation === true && contract.harness?.migrationSimulationOnEmptySchema === true && contract.harness?.backupRestoreSimulationOnIsolatedState === true, "In-memory harness boundary drift");
  assert(contract.harness?.filesystemWrites === 0 && contract.harness?.networkConnections === 0, "Harness escaped memory-only boundary");
  assert(contract.acceptance?.step === 133 && contract.acceptance?.result === "PASS_PROVIDER_NEUTRAL_CONTRACT", "B133 acceptance drift");
  return true;
}

export function validateRelationalModel(model) {
  assert(model?.schema === "BAUMAN_ROADMAP_V2_RELATIONAL_MODEL_V1", "Relational model schema drift");
  assert(model.version === "2.14.0-l34-b134" && model.status === "PASS_B134_DECLARATIVE_RELATIONAL_MODEL", "Relational model status drift");
  assert(model.provider === "unselected" && model.dialectProfile === "portable_relational_postgresql_compatible", "Relational model provider/dialect drift");
  assert(model.staticContentDisposition === "hash_pinned_file_sidecars_outside_database", "Static content was moved into user persistence");
  assert(Array.isArray(model.tables), "Relational tables missing");
  sameMembers(model.tables.map((table) => table.name), EXPECTED_TABLES, "relational tables");
  unique(model.tables.flatMap((table) => table.columns.map((column) => `${table.name}.${column.name}`)), "relational columns");
  for (const table of model.tables) {
    assert(Array.isArray(table.primaryKey) && table.primaryKey.length > 0, `Primary key missing: ${table.name}`);
    const columnByName = new Map(table.columns.map((column) => [column.name, column]));
    for (const key of table.primaryKey) assert(columnByName.has(key) && columnByName.get(key).nullable === false, `Invalid primary key column: ${table.name}.${key}`);
    for (const column of table.columns) {
      assert(typeof column.name === "string" && typeof column.type === "string" && typeof column.nullable === "boolean", `Invalid column: ${table.name}`);
      assert(!/(^|_)(password|passwd|pwd|secret)(_|$)/i.test(column.name), `Forbidden credential column: ${table.name}.${column.name}`);
    }
    assert(Array.isArray(table.constraints) && table.constraints.length > 0, `Constraints missing: ${table.name}`);
    assert(!table.constraints.some((constraint) => /cascade/i.test(constraint)), `Destructive cascade policy found: ${table.name}`);
    if (table.name === "users") {
      assert(table.ownerColumn === null && table.class === "identity_root", "Users root ownership model drift");
    } else {
      assert(table.ownerColumn === "user_id", `User ownership column missing: ${table.name}`);
      assert(columnByName.has("user_id") && columnByName.get("user_id").nullable === false, `Non-null user ownership missing: ${table.name}`);
    }
  }
  const events = model.tables.find((table) => table.name === "learning_events");
  assert(events.authority === "append_only_source_of_truth" && events.constraints.includes("append_only_no_update_delete"), "Learning-event authority is not append-only");
  for (const name of ["mastery_snapshots", "weak_topics"]) {
    assert(model.tables.find((table) => table.name === name).authority.startsWith("derived_rebuildable"), `Projection authority overclaim: ${name}`);
  }
  sameJson(model.counts, { tables: 12, identityRoots: 1, userOwnedTables: 11, appendOnlyAuthorities: 1, derivedProjectionTables: 2, passwordColumns: 0 }, "relational model counts");
  assert(model.requiredProductionPolicies?.length === 8 && model.requiredProductionPolicies.includes("row_level_user_ownership") && model.requiredProductionPolicies.includes("backup_restore_drill_before_activation"), "Production persistence policies incomplete");
  assert(model.acceptance?.step === 134 && model.acceptance?.result === "PASS_RELATIONAL_MODEL_DESIGN", "B134 relational acceptance drift");
  return true;
}

function reverseOperation(operation) {
  if (operation.op === "create_table") return { op: "drop_table", table: operation.table };
  if (operation.op === "create_index") return { op: "drop_index", index: operation.index, table: operation.table };
  throw new Error(`Unsupported migration operation: ${operation.op}`);
}

export function validateMigrationPlan(plan, model) {
  validateRelationalModel(model);
  assert(plan?.schema === "BAUMAN_ROADMAP_V2_MIGRATION_PLAN_V1", "Migration plan schema drift");
  assert(plan.version === "2.14.0-l34-b134" && plan.status === "PASS_B134_REVERSIBLE_MIGRATION_DESIGN", "Migration plan status drift");
  assert(plan.provider === "unselected" && plan.executionMode === "declarative_simulation_only", "Migration execution/provider boundary drift");
  assert(plan.targetSchemaVersion === "bauman.persistence.v1", "Migration target schema drift");
  sameJson(plan.deploymentSequence, ["development", "local_test", "migration_test", "regression_test", "staging", "production"], "migration deployment sequence");
  sameJson(plan.migrations.map((migration) => migration.id), EXPECTED_MIGRATIONS, "migration order");
  const createdTables = [];
  const createdIndexes = [];
  for (let index = 0; index < plan.migrations.length; index += 1) {
    const migration = plan.migrations[index];
    sameJson(migration.dependsOn, index === 0 ? [] : [plan.migrations[index - 1].id], `migration dependency ${migration.id}`);
    assert(migration.transactionRequired === true, `Migration is not transactional: ${migration.id}`);
    assert(/^[0-9a-f]{64}$/.test(migration.checksumSha256 || ""), `Invalid migration checksum: ${migration.id}`);
    assert(migrationChecksum(migration) === migration.checksumSha256, `Migration checksum drift: ${migration.id}`);
    assert(Array.isArray(migration.up) && migration.up.length > 0 && Array.isArray(migration.down) && migration.down.length === migration.up.length, `Migration up/down symmetry missing: ${migration.id}`);
    const expectedDown = [...migration.up].reverse().map(reverseOperation);
    sameJson(migration.down, expectedDown, `migration reverse operations ${migration.id}`);
    for (const operation of migration.up) {
      assert(["create_table", "create_index"].includes(operation.op), `Unsupported up operation: ${migration.id}`);
      if (operation.op === "create_table") createdTables.push(operation.table);
      else createdIndexes.push(operation.index);
    }
  }
  sameMembers(createdTables, model.tables.map((table) => table.name), "migration-created tables");
  unique(createdIndexes, "migration-created indexes");
  assert(createdIndexes.length === 4, "Migration index count drift");
  assert(plan.rollback?.downMigrationScope === "empty_or_isolated_restore_target_only", "Down-migration scope drift");
  assert(plan.rollback?.productionRollback === "stop_writes_then_restore_last_verified_backup_or_forward_fix", "Production rollback policy drift");
  assert(plan.rollback?.reverseOrderRequired === true && plan.rollback?.inPlaceDestructiveRestoreAllowed === false && plan.rollback?.automaticProductionDownMigrationAllowed === false, "Rollback safety boundary drift");
  sameJson(plan.counts, { migrations: 4, tablesCreated: 12, indexesCreated: 4, productionExecutions: 0 }, "migration counts");
  assert(plan.acceptance?.step === 134 && plan.acceptance?.result === "PASS_REVERSIBLE_MIGRATION_DESIGN", "B134 migration acceptance drift");
  return true;
}

export function simulateMigrations(plan, model) {
  validateMigrationPlan(plan, model);
  const tables = new Set();
  const indexes = new Set();
  const applied = [];
  for (const migration of plan.migrations) {
    assert(migration.dependsOn.every((id) => applied.includes(id)), `Unmet migration dependency: ${migration.id}`);
    for (const operation of migration.up) {
      if (operation.op === "create_table") {
        assert(!tables.has(operation.table), `Migration table collision: ${operation.table}`);
        tables.add(operation.table);
      } else {
        assert(tables.has(operation.table), `Index target table missing: ${operation.index}`);
        assert(!indexes.has(operation.index), `Migration index collision: ${operation.index}`);
        indexes.add(operation.index);
      }
    }
    applied.push(migration.id);
  }
  return deepFreeze({ tables: [...tables].sort(), indexes: [...indexes].sort(), appliedMigrations: [...applied] });
}

export function simulateRollback(plan, model) {
  const applied = simulateMigrations(plan, model);
  const tables = new Set(applied.tables);
  const indexes = new Set(applied.indexes);
  const rolledBack = [];
  for (const migration of [...plan.migrations].reverse()) {
    for (const operation of migration.down) {
      if (operation.op === "drop_index") {
        assert(indexes.delete(operation.index), `Rollback index missing: ${operation.index}`);
      } else {
        assert(![...indexes].some((name) => plan.migrations.flatMap((item) => item.up).some((candidate) => candidate.op === "create_index" && candidate.index === name && candidate.table === operation.table)), `Rollback table still indexed: ${operation.table}`);
        assert(tables.delete(operation.table), `Rollback table missing: ${operation.table}`);
      }
    }
    rolledBack.push(migration.id);
  }
  return deepFreeze({ tables: [...tables], indexes: [...indexes], rolledBackMigrations: rolledBack });
}

export function validateBackupRestoreContract(backup) {
  assert(backup?.schema === "BAUMAN_ROADMAP_V2_BACKUP_RESTORE_CONTRACT_V1", "Backup/restore contract schema drift");
  assert(backup.version === "2.14.0-l34-b134" && backup.status === "PASS_B134_BACKUP_RESTORE_DESIGN", "Backup/restore status drift");
  assert(backup.provider === "unselected", "Backup provider selection overclaim");
  assert(backup.format?.schema === "BAUMAN_ROADMAP_V2_PERSISTENCE_BACKUP_V1" && backup.format?.canonicalEncoding === "canonical_json_utf8" && backup.format?.digest === "sha256", "Backup format/digest drift");
  assert(backup.format?.storageSchemaVersionRequired === true && backup.format?.migrationIdsRequired === true && backup.format?.recordCountsRequired === true && backup.format?.userOwnershipVerificationRequired === true, "Backup verification metadata incomplete");
  assert(backup.backupPolicy?.applicationConsistentSnapshot === true && backup.backupPolicy?.pointInTimeRecoveryRequiredBeforeProduction === true && backup.backupPolicy?.encryptionRequiredBeforeProduction === true && backup.backupPolicy?.secretMaterialExcluded === true, "Backup production policy incomplete");
  assert(backup.restorePolicy?.target === "fresh_isolated_schema_or_store" && backup.restorePolicy?.atomicSwapAfterAllChecks === true && backup.restorePolicy?.inPlaceOverwriteAllowed === false, "Isolated atomic restore boundary drift");
  sameJson(backup.restorePolicy?.verificationOrder, ["format", "schema_version", "migration_set", "sha256", "record_counts", "referential_integrity", "user_ownership", "cursor_monotonicity"], "restore verification order");
  assert(backup.restorePolicy?.tamperedBackupPolicy === "reject_without_mutating_current_state" && backup.restorePolicy?.crossUserRecordPolicy === "reject_without_mutating_current_state", "Restore fail-closed policy drift");
  assert(backup.drill?.requiredBeforeProviderActivation === true && backup.drill?.requiredBeforeProductionMigration === true, "Restore drill gate missing");
  assert(Object.values(backup.productionBoundary || {}).every((value) => value === 0), "Backup/restore production counter drift");
  assert(backup.acceptance?.step === 134 && backup.acceptance?.result === "PASS_BACKUP_RESTORE_DESIGN", "B134 backup acceptance drift");
  return true;
}

function validId(value, prefix) {
  return new RegExp(`^${prefix}[A-Za-z0-9_-]{8,64}$`).test(value || "");
}

function formatCursor(value) {
  assert(Number.isSafeInteger(value) && value >= 0, "Invalid internal cursor value");
  return `cur_${String(value).padStart(16, "0")}`;
}

function parseCursor(value) {
  if (!/^cur_[0-9]{16}$/.test(value || "")) throw new PersistenceError("INVALID_CURSOR", "Invalid sync cursor");
  return Number(value.slice(4));
}

function tableKey(table, record, modelByName) {
  return modelByName.get(table).primaryKey.map((column) => record[column]).join("\u001f");
}

function cloneState(state) {
  return {
    tables: Object.fromEntries(Object.entries(state.tables).map(([name, rows]) => [name, new Map([...rows].map(([key, row]) => [key, structuredClone(row)]))])),
    appliedMigrations: [...state.appliedMigrations]
  };
}

function stateCounts(state) {
  return Object.fromEntries(Object.entries(state.tables).map(([name, rows]) => [name, rows.size]));
}

export function createTransactionalPersistenceHarness({ contract, model, migrations, backup, failureInjector = null }) {
  validatePersistenceContract(contract);
  validateRelationalModel(model);
  validateMigrationPlan(migrations, model);
  validateBackupRestoreContract(backup);
  const migrationState = simulateMigrations(migrations, model);
  const modelByName = new Map(model.tables.map((table) => [table.name, table]));
  let state = {
    tables: Object.fromEntries(model.tables.map((table) => [table.name, new Map()])),
    appliedMigrations: [...migrationState.appliedMigrations]
  };

  const requireOwner = (actorUserId, userId) => {
    if (!validId(actorUserId, "usr_") || !validId(userId, "usr_")) throw new PersistenceError("INVALID_USER_ID", "Invalid opaque user ID");
    if (actorUserId !== userId) throw new PersistenceError("CROSS_USER_ACCESS", "Actor does not own requested user resource");
  };

  const requireUser = (userId) => {
    if (!state.tables.users.has(userId)) throw new PersistenceError("USER_NOT_FOUND", "User partition is not seeded in the isolated harness");
  };

  const seedUser = ({ actorUserId, userId, createdAt = "2026-08-13T00:00:00.000Z" }) => {
    requireOwner(actorUserId, userId);
    if (state.tables.users.has(userId)) throw new PersistenceError("USER_ALREADY_EXISTS", "User already exists in isolated harness");
    const candidate = cloneState(state);
    candidate.tables.users.set(userId, { user_id: userId, created_at: createdAt, status: "active" });
    candidate.tables.user_sync_heads.set(userId, { user_id: userId, cursor_value: 0, updated_at: createdAt });
    state = candidate;
    return deepFreeze({ userId, cursor: ZERO_CURSOR });
  };

  const registerDevice = ({ actorUserId, userId, deviceId, label = null, createdAt = "2026-08-13T00:00:00.000Z" }) => {
    requireOwner(actorUserId, userId);
    requireUser(userId);
    if (!validId(deviceId, "dev_")) throw new PersistenceError("INVALID_DEVICE_ID", "Invalid opaque device ID");
    if (state.tables.devices.has(deviceId)) throw new PersistenceError("DEVICE_ALREADY_EXISTS", "Device already exists in isolated harness");
    const candidate = cloneState(state);
    candidate.tables.devices.set(deviceId, { device_id: deviceId, user_id: userId, label, created_at: createdAt, last_seen_at: createdAt });
    state = candidate;
    return deepFreeze({ userId, deviceId });
  };

  const appendBatch = (request) => {
    assert(request && typeof request === "object", "Persistence batch request missing");
    const { actorUserId, userId, deviceId, idempotencyKey, baseCursor, events } = request;
    requireOwner(actorUserId, userId);
    requireUser(userId);
    if (!validId(deviceId, "dev_")) throw new PersistenceError("INVALID_DEVICE_ID", "Invalid opaque device ID");
    const device = state.tables.devices.get(deviceId);
    if (!device || device.user_id !== userId) throw new PersistenceError("DEVICE_OWNERSHIP_MISMATCH", "Device is not owned by requested user");
    if (!validId(idempotencyKey, "idem_")) throw new PersistenceError("INVALID_IDEMPOTENCY_KEY", "Invalid idempotency key");
    if (!Array.isArray(events) || events.length < 1 || events.length > contract.eventPolicy.maxEventsPerBatch) throw new PersistenceError("INVALID_BATCH_SIZE", "Event batch must contain 1–100 events");
    const requestHash = sha256({ userId, deviceId, idempotencyKey, baseCursor, events });
    const idempotencyStorageKey = `${userId}\u001f${idempotencyKey}`;
    const prior = state.tables.idempotency_keys.get(idempotencyStorageKey);
    if (prior) {
      if (prior.request_sha256 !== requestHash) throw new PersistenceError("IDEMPOTENCY_CONFLICT", "Idempotency key was reused with a different request");
      return deepFreeze(structuredClone(prior.result_json));
    }
    const requestedBase = parseCursor(baseCursor);
    const head = state.tables.user_sync_heads.get(userId);
    if (requestedBase !== head.cursor_value) throw new PersistenceError("STALE_BASE_CURSOR", "Base cursor is stale", { serverCursor: formatCursor(head.cursor_value) });
    const batchIds = new Set();
    const prepared = [];
    for (let index = 0; index < events.length; index += 1) {
      const event = events[index];
      if (!event || typeof event !== "object" || Array.isArray(event)) throw new PersistenceError("INVALID_EVENT", "Invalid learning event");
      if (!validId(event.eventId, "evt_")) throw new PersistenceError("INVALID_EVENT_ID", "Invalid opaque event ID");
      if (batchIds.has(event.eventId) || state.tables.learning_events.has(event.eventId)) throw new PersistenceError("DUPLICATE_EVENT_ID", "Learning event ID already exists");
      batchIds.add(event.eventId);
      if (!contract.eventPolicy.allowedTypes.includes(event.type)) throw new PersistenceError("UNKNOWN_EVENT_TYPE", "Unknown learning event type");
      if (event.userId !== undefined && event.userId !== userId) throw new PersistenceError("CROSS_USER_ACCESS", "Event carries a different user ID");
      if (typeof event.occurredAt !== "string" || Number.isNaN(Date.parse(event.occurredAt))) throw new PersistenceError("INVALID_EVENT_TIME", "Invalid event timestamp");
      if (!event.payload || typeof event.payload !== "object" || Array.isArray(event.payload)) throw new PersistenceError("INVALID_EVENT_PAYLOAD", "Invalid event payload");
      const cursorValue = head.cursor_value + index + 1;
      prepared.push({
        event_id: event.eventId,
        user_id: userId,
        device_id: deviceId,
        event_type: event.type,
        occurred_at: event.occurredAt,
        accepted_at: event.occurredAt,
        cursor_value: cursorValue,
        payload_json: structuredClone(event.payload)
      });
    }
    if (failureInjector) failureInjector("before_commit", deepFreeze(structuredClone({ userId, deviceId, events: prepared })));
    const candidate = cloneState(state);
    for (const record of prepared) candidate.tables.learning_events.set(record.event_id, record);
    const cursorValue = prepared.at(-1).cursor_value;
    candidate.tables.user_sync_heads.set(userId, { user_id: userId, cursor_value: cursorValue, updated_at: prepared.at(-1).accepted_at });
    const result = {
      schema: "BAUMAN_ROADMAP_V2_PERSISTENCE_BATCH_RESULT_V1",
      status: "committed",
      userId,
      acceptedEventIds: prepared.map((record) => record.event_id),
      eventCount: prepared.length,
      cursor: formatCursor(cursorValue)
    };
    candidate.tables.idempotency_keys.set(idempotencyStorageKey, {
      user_id: userId,
      idempotency_key: idempotencyKey,
      request_sha256: requestHash,
      result_json: structuredClone(result),
      created_at: prepared[0].accepted_at
    });
    state = candidate;
    return deepFreeze(result);
  };

  const readChanges = ({ actorUserId, userId, sinceCursor = ZERO_CURSOR, limit = 100 }) => {
    requireOwner(actorUserId, userId);
    requireUser(userId);
    const since = parseCursor(sinceCursor);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new PersistenceError("INVALID_LIMIT", "Change limit must be 1–100");
    const head = state.tables.user_sync_heads.get(userId).cursor_value;
    if (since > head) throw new PersistenceError("CURSOR_AHEAD_OF_SERVER", "Sync cursor is ahead of server", { serverCursor: formatCursor(head) });
    const events = [...state.tables.learning_events.values()]
      .filter((event) => event.user_id === userId && event.cursor_value > since)
      .sort((left, right) => left.cursor_value - right.cursor_value)
      .slice(0, limit);
    return deepFreeze({
      schema: "BAUMAN_ROADMAP_V2_PERSISTENCE_CHANGES_V1",
      userId,
      events: structuredClone(events),
      cursor: events.length ? formatCursor(events.at(-1).cursor_value) : sinceCursor,
      serverCursor: formatCursor(head),
      hasMore: events.length > 0 && events.at(-1).cursor_value < head
    });
  };

  const summary = () => {
    const counts = stateCounts(state);
    return deepFreeze({
      provider: "unselected",
      mode: "in_memory_transactional_harness",
      appliedMigrations: [...state.appliedMigrations],
      counts,
      totalRecords: Object.values(counts).reduce((total, count) => total + count, 0),
      productionWrites: 0,
      networkConnections: 0,
      filesystemWrites: 0
    });
  };

  const createBackup = () => {
    const tables = Object.fromEntries(Object.entries(state.tables).map(([name, rows]) => [name, [...rows.values()].map((row) => structuredClone(row)).sort((left, right) => tableKey(name, left, modelByName).localeCompare(tableKey(name, right, modelByName)))]));
    const body = {
      schema: backup.format.schema,
      formatVersion: 1,
      storageSchemaVersion: contract.storageSchemaVersion,
      provider: "unselected",
      appliedMigrations: [...state.appliedMigrations],
      tables,
      recordCounts: Object.fromEntries(Object.entries(tables).map(([name, rows]) => [name, rows.length]))
    };
    return deepFreeze({ ...body, sha256: sha256(body) });
  };

  const restoreBackup = (candidateBackup) => {
    const incoming = structuredClone(candidateBackup);
    if (incoming?.schema !== backup.format.schema || incoming?.formatVersion !== 1 || incoming?.provider !== "unselected") throw new PersistenceError("BACKUP_FORMAT_MISMATCH", "Backup format/provider mismatch");
    if (incoming.storageSchemaVersion !== contract.storageSchemaVersion) throw new PersistenceError("BACKUP_SCHEMA_MISMATCH", "Backup storage schema mismatch");
    sameJson(incoming.appliedMigrations, EXPECTED_MIGRATIONS, "backup migration set");
    const claimedDigest = incoming.sha256;
    delete incoming.sha256;
    if (!/^[0-9a-f]{64}$/.test(claimedDigest || "") || sha256(incoming) !== claimedDigest) throw new PersistenceError("BACKUP_DIGEST_MISMATCH", "Backup SHA-256 mismatch");
    sameMembers(Object.keys(incoming.tables || {}), EXPECTED_TABLES, "backup tables");
    const isolated = {
      tables: Object.fromEntries(model.tables.map((table) => [table.name, new Map()])),
      appliedMigrations: [...incoming.appliedMigrations]
    };
    for (const table of model.tables) {
      const rows = incoming.tables[table.name];
      if (!Array.isArray(rows) || incoming.recordCounts?.[table.name] !== rows.length) throw new PersistenceError("BACKUP_COUNT_MISMATCH", `Backup record count mismatch: ${table.name}`);
      for (const row of rows) {
        const key = tableKey(table.name, row, modelByName);
        if (isolated.tables[table.name].has(key)) throw new PersistenceError("BACKUP_DUPLICATE_KEY", `Backup duplicate key: ${table.name}`);
        isolated.tables[table.name].set(key, structuredClone(row));
      }
    }
    for (const [userId, user] of isolated.tables.users) {
      if (user.user_id !== userId || !validId(userId, "usr_")) throw new PersistenceError("BACKUP_INVALID_USER", "Backup contains invalid user identity");
    }
    for (const table of model.tables.filter((item) => item.ownerColumn === "user_id")) {
      for (const row of isolated.tables[table.name].values()) {
        if (!isolated.tables.users.has(row.user_id)) throw new PersistenceError("BACKUP_CROSS_USER_RECORD", `Backup contains orphan/cross-user record: ${table.name}`);
      }
    }
    for (const device of isolated.tables.devices.values()) {
      if (!validId(device.device_id, "dev_") || device.user_id === undefined) throw new PersistenceError("BACKUP_INVALID_DEVICE", "Backup contains invalid device");
    }
    for (const event of isolated.tables.learning_events.values()) {
      const device = isolated.tables.devices.get(event.device_id);
      if (!device || device.user_id !== event.user_id) throw new PersistenceError("BACKUP_DEVICE_OWNERSHIP_MISMATCH", "Backup event/device ownership mismatch");
      if (!validId(event.event_id, "evt_") || !Number.isSafeInteger(event.cursor_value) || event.cursor_value < 1) throw new PersistenceError("BACKUP_INVALID_EVENT", "Backup contains invalid event");
    }
    for (const userId of isolated.tables.users.keys()) {
      const head = isolated.tables.user_sync_heads.get(userId);
      if (!head) throw new PersistenceError("BACKUP_SYNC_HEAD_MISSING", "Backup user has no sync head");
      const maximum = Math.max(0, ...[...isolated.tables.learning_events.values()].filter((event) => event.user_id === userId).map((event) => event.cursor_value));
      if (head.cursor_value !== maximum) throw new PersistenceError("BACKUP_CURSOR_MISMATCH", "Backup sync cursor is not monotonic/exact");
    }
    state = isolated;
    return deepFreeze({ status: "restored_after_isolated_validation", sha256: claimedDigest, counts: stateCounts(state), atomicSwap: true });
  };

  return deepFreeze({
    provider: "unselected",
    mode: "in_memory_transactional_harness",
    productionConnected: false,
    zeroCursor: ZERO_CURSOR,
    seedUser,
    registerDevice,
    appendBatch,
    readChanges,
    summary,
    createBackup,
    restoreBackup
  });
}

export function buildPersistenceProjection({ contract, model, migrations, backup }) {
  validatePersistenceContract(contract);
  validateRelationalModel(model);
  validateMigrationPlan(migrations, model);
  validateBackupRestoreContract(backup);
  const applied = simulateMigrations(migrations, model);
  const rolledBack = simulateRollback(migrations, model);
  const harness = createTransactionalPersistenceHarness({ contract, model, migrations, backup });
  harness.seedUser({ actorUserId: "usr_projection", userId: "usr_projection" });
  harness.registerDevice({ actorUserId: "usr_projection", userId: "usr_projection", deviceId: "dev_projection" });
  const request = {
    actorUserId: "usr_projection",
    userId: "usr_projection",
    deviceId: "dev_projection",
    idempotencyKey: "idem_projection",
    baseCursor: ZERO_CURSOR,
    events: [
      { eventId: "evt_projection01", type: "bookmark_changed", occurredAt: "2026-08-13T00:00:01.000Z", payload: { targetId: "MATH-L1-C01" } },
      { eventId: "evt_projection02", type: "preference_changed", occurredAt: "2026-08-13T00:00:02.000Z", payload: { key: "language", value: "vi" } }
    ]
  };
  const committed = harness.appendBatch(request);
  const beforeReplay = harness.summary().counts.learning_events;
  const replay = harness.appendBatch(request);
  const afterReplay = harness.summary().counts.learning_events;
  const snapshot = harness.createBackup();
  const restored = createTransactionalPersistenceHarness({ contract, model, migrations, backup });
  restored.restoreBackup(snapshot);
  return deepFreeze({
    schema: "BAUMAN_ROADMAP_V2_PERSISTENCE_PROJECTION_V1",
    version: "2.14.0-l34-b135",
    status: "PASS_B135_TRANSACTIONAL_IN_MEMORY_PERSISTENCE_HARNESS",
    provider: "unselected",
    counts: {
      tables: model.counts.tables,
      userOwnedTables: model.counts.userOwnedTables,
      migrations: migrations.counts.migrations,
      indexes: migrations.counts.indexesCreated,
      eventTypes: contract.eventPolicy.allowedTypes.length,
      productionConnections: 0,
      productionMigrations: 0,
      productionWrites: 0
    },
    migrationSimulation: { appliedMigrations: applied.appliedMigrations.length, tablesAfterUp: applied.tables.length, indexesAfterUp: applied.indexes.length, tablesAfterRollback: rolledBack.tables.length, indexesAfterRollback: rolledBack.indexes.length },
    transactionSimulation: { committedEvents: committed.eventCount, cursor: committed.cursor, replayCursor: replay.cursor, replayAdditionalWrites: afterReplay - beforeReplay },
    backupRestoreSimulation: { digest: snapshot.sha256, restoredEvents: restored.summary().counts.learning_events, isolatedValidation: true, atomicSwap: true },
    compatibility: { legacyLocalStorageRetained: true, role: contract.compatibility.legacyLocalStorageRole, destructiveClientRewrite: false },
    safety: { providerConnections: 0, productionMigrations: 0, productionRollbacks: 0, productionUserWrites: 0, productionEventWrites: 0, productionSyncWrites: 0, productionBackups: 0, productionRestores: 0, runtimeActivations: 0, legacyMutations: 0 },
    acceptance: { step: 135, result: "PASS_TRANSACTIONAL_IN_MEMORY_PERSISTENCE_HARNESS" }
  });
}

export function validatePersistenceManifest(manifest, readBytes) {
  assert(manifest?.schema === "BAUMAN_ROADMAP_V2_PERSISTENCE_MANIFEST_V1", "Persistence manifest schema drift");
  assert(manifest.status === "PASS_B135_DETERMINISTIC_PERSISTENCE_PACKAGE", "Persistence manifest status drift");
  assert(typeof readBytes === "function", "Persistence manifest reader missing");
  const descriptors = [...Object.values(manifest.sources || {}), manifest.generatedProjection].filter(Boolean);
  assert(descriptors.length === 6, "Persistence manifest descriptor count drift");
  for (const descriptor of descriptors) {
    let bytes;
    try { bytes = readBytes(descriptor.path); } catch { throw new Error(`Persistence manifest file missing: ${descriptor.path}`); }
    assert(Buffer.isBuffer(bytes), `Persistence manifest reader did not return bytes: ${descriptor.path}`);
    assert(bytes.length === descriptor.bytes && sha256(bytes) === descriptor.sha256, `Persistence manifest fingerprint drift: ${descriptor.path}`);
  }
  sameJson(manifest.counts, { tables: 12, userOwnedTables: 11, migrations: 4, indexes: 4, eventTypes: 11, productionConnections: 0, productionMigrations: 0, productionWrites: 0 }, "Persistence manifest counts");
  assert(Object.keys(manifest.safety || {}).length === 10 && Object.values(manifest.safety).every((value) => value === 0), "Persistence manifest production write counter drift");
  assert(manifest.acceptance?.step === 135 && manifest.acceptance?.result === "PASS_PERSISTENCE_PACKAGE", "B135 manifest acceptance drift");
  return true;
}

export const persistenceConstants = deepFreeze({ EXPECTED_TABLES, EXPECTED_MIGRATIONS, ZERO_CURSOR });
