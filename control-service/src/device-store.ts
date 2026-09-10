export type BaumanDeviceStatus = "pending" | "approved" | "blocked";
export type BaumanDeviceType = "desktop" | "tablet" | "phone" | "unknown";
export type BaumanControlRole = "viewer" | "reviewer" | "publisher" | "owner";

export type BaumanControlIdentity = {
  actor: string;
  role: BaumanControlRole;
  controlDeviceId: string | null;
};

export class BaumanDeviceError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "BaumanDeviceError";
    this.status = status;
    this.code = code;
  }
}

type DeviceRow = {
  device_id: string;
  display_code: string;
  public_jwk_json: string;
  device_type: string;
  display_name: string | null;
  label: string | null;
  status: string;
  edit_enabled: number;
  created_at: string;
  updated_at: string;
  last_seen_at: number;
  approved_at: string | null;
  approved_by: string | null;
  blocked_at: string | null;
};

type CommandRow = {
  command_id: string;
  device_id: string;
  operation: string;
  expected_status: string;
  payload_hash: string;
  state: string;
  result_status: string | null;
  actor: string;
  control_device_id: string | null;
  execution_nonce: string;
  error_code: string | null;
  created_at: string;
  completed_at: string | null;
};

function text(value: unknown, limit: number) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function normalizeDeviceType(value: unknown): BaumanDeviceType {
  return value === "desktop" || value === "tablet" || value === "phone" ? value : "unknown";
}

function normalizeStatus(value: unknown): BaumanDeviceStatus | null {
  return value === "pending" || value === "approved" || value === "blocked" ? value : null;
}

function validDeviceId(value: string) {
  return /^[a-f0-9]{64}$/.test(value);
}

function validCommandId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function base64UrlCoordinate(value: unknown) {
  return typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value) ? value : "";
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function displayCodeFor(deviceId: string) {
  const key = deviceId.slice(0, 12).toUpperCase();
  return `BM-${key.slice(0, 4)}-${key.slice(4, 8)}-${key.slice(8, 12)}`;
}

async function canonicalPublicJwk(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new BaumanDeviceError("Khóa thiết bị P-256 không hợp lệ.", 400, "INVALID_PUBLIC_KEY");
  }
  const supplied = value as Record<string, unknown>;
  const x = base64UrlCoordinate(supplied.x);
  const y = base64UrlCoordinate(supplied.y);
  if (supplied.kty !== "EC" || supplied.crv !== "P-256" || !x || !y) {
    throw new BaumanDeviceError("Khóa thiết bị phải là ECDSA P-256 hợp lệ.", 400, "INVALID_PUBLIC_KEY");
  }
  const jwk: JsonWebKey = { kty: "EC", crv: "P-256", x, y, ext: true };
  try {
    await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
  } catch {
    throw new BaumanDeviceError("Tọa độ khóa P-256 không hợp lệ.", 400, "INVALID_PUBLIC_KEY");
  }
  return {
    jwk,
    canonical: JSON.stringify({ crv: "P-256", kty: "EC", x, y }),
  };
}

function publicDevice(row: DeviceRow) {
  const status = normalizeStatus(row.status) ?? "pending";
  return {
    deviceId: row.device_id,
    deviceCode: row.display_code,
    deviceType: normalizeDeviceType(row.device_type),
    displayName: row.display_name,
    label: row.label,
    status,
    editEnabled: row.edit_enabled === 1,
    active: Date.now() - Number(row.last_seen_at || 0) <= 2 * 60 * 1000,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastSeenAt: Number(row.last_seen_at || 0),
    approvedAt: row.approved_at,
    approvedBy: row.approved_by,
    blockedAt: row.blocked_at,
  };
}

async function deviceRow(database: D1Database, deviceId: string) {
  return database.prepare(
    `SELECT device_id, display_code, public_jwk_json, device_type, display_name, label, status, edit_enabled,
            created_at, updated_at, last_seen_at, approved_at, approved_by, blocked_at
       FROM bm_devices WHERE device_id = ?`,
  ).bind(deviceId).first<DeviceRow>();
}

async function commandRow(database: D1Database, commandId: string) {
  return database.prepare(
    `SELECT command_id, device_id, operation, expected_status, payload_hash, state, result_status, actor,
            control_device_id, execution_nonce, error_code, created_at, completed_at
       FROM bm_control_commands WHERE command_id = ?`,
  ).bind(commandId).first<CommandRow>();
}

async function audit(database: D1Database, actor: string, action: string, target: string, detail: Record<string, unknown>) {
  await database.prepare(
    "INSERT INTO bm_audit_log (actor, action, target, detail_json) VALUES (?, ?, ?, ?)",
  ).bind(actor, action, target, JSON.stringify(detail)).run();
}

export async function registerBaumanDevice(database: D1Database, payload: Record<string, unknown>) {
  const key = await canonicalPublicJwk(payload.publicJwk);
  const deviceId = await sha256Hex(key.canonical);
  const displayCode = displayCodeFor(deviceId);
  const now = Date.now();
  const deviceType = normalizeDeviceType(payload.deviceType);
  const displayName = text(payload.displayName, 120) || null;
  const label = text(payload.label, 100) || null;

  await database.prepare(
    `INSERT OR IGNORE INTO bm_devices
       (device_id, display_code, public_jwk_json, device_type, display_name, label, status, edit_enabled, last_seen_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', 0, ?)`,
  ).bind(deviceId, displayCode, JSON.stringify(key.jwk), deviceType, displayName, label, now).run();

  await database.prepare(
    `UPDATE bm_devices
        SET device_type = ?, display_name = COALESCE(?, display_name), label = COALESCE(?, label),
            last_seen_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE device_id = ?`,
  ).bind(deviceType, displayName, label, now, deviceId).run();

  const row = await deviceRow(database, deviceId);
  if (!row) throw new BaumanDeviceError("Không thể tạo registry thiết bị Bauman.", 500, "DEVICE_REGISTRY_WRITE_FAILED");
  return publicDevice(row);
}

export async function touchBaumanDevice(database: D1Database, deviceIdValue: unknown) {
  const deviceId = text(deviceIdValue, 64).toLowerCase();
  if (!validDeviceId(deviceId)) throw new BaumanDeviceError("Mã thiết bị không hợp lệ.", 400, "INVALID_DEVICE_ID");
  await database.prepare(
    "UPDATE bm_devices SET last_seen_at = ?, updated_at = CURRENT_TIMESTAMP WHERE device_id = ?",
  ).bind(Date.now(), deviceId).run();
  const row = await deviceRow(database, deviceId);
  if (!row) throw new BaumanDeviceError("Không tìm thấy thiết bị Bauman.", 404, "DEVICE_NOT_FOUND");
  return publicDevice(row);
}

export async function readBaumanDeviceStatus(database: D1Database, deviceIdValue: unknown) {
  const deviceId = text(deviceIdValue, 64).toLowerCase();
  if (!validDeviceId(deviceId)) throw new BaumanDeviceError("Mã thiết bị không hợp lệ.", 400, "INVALID_DEVICE_ID");
  const row = await deviceRow(database, deviceId);
  if (!row) throw new BaumanDeviceError("Không tìm thấy thiết bị Bauman.", 404, "DEVICE_NOT_FOUND");
  const device = publicDevice(row);
  return {
    deviceId: device.deviceId,
    deviceCode: device.deviceCode,
    status: device.status,
    editEnabled: device.editEnabled,
    active: device.active,
    lastSeenAt: device.lastSeenAt,
  };
}

export async function listBaumanDevices(database: D1Database) {
  const rows = await database.prepare(
    `SELECT device_id, display_code, public_jwk_json, device_type, display_name, label, status, edit_enabled,
            created_at, updated_at, last_seen_at, approved_at, approved_by, blocked_at
       FROM bm_devices ORDER BY created_at DESC LIMIT 500`,
  ).all<DeviceRow>();
  return rows.results.map(publicDevice);
}

export async function executeBaumanDeviceCommand(
  database: D1Database,
  identity: BaumanControlIdentity,
  payload: Record<string, unknown>,
) {
  if (identity.role !== "owner") {
    throw new BaumanDeviceError("Bauman yêu cầu quyền Chủ hệ thống để thay đổi thiết bị.", 403, "OWNER_REQUIRED");
  }

  const commandId = text(payload.commandId, 64).toLowerCase();
  const deviceId = text(payload.deviceId, 64).toLowerCase();
  const operation = payload.operation === "approve" || payload.operation === "block" ? payload.operation : "";
  const expectedStatus = normalizeStatus(payload.expectedStatus);
  if (!validCommandId(commandId)) throw new BaumanDeviceError("commandId không hợp lệ.", 400, "INVALID_COMMAND_ID");
  if (!validDeviceId(deviceId)) throw new BaumanDeviceError("Mã thiết bị không hợp lệ.", 400, "INVALID_DEVICE_ID");
  if (!operation) throw new BaumanDeviceError("Thao tác thiết bị không hợp lệ.", 400, "INVALID_DEVICE_OPERATION");
  if (!expectedStatus) throw new BaumanDeviceError("expectedStatus không hợp lệ.", 400, "INVALID_EXPECTED_STATUS");
  if (operation === "approve" && expectedStatus !== "pending") {
    throw new BaumanDeviceError("Chỉ thiết bị pending mới được duyệt.", 409, "DEVICE_STATE_CONFLICT");
  }
  if (operation === "block" && expectedStatus !== "pending" && expectedStatus !== "approved") {
    throw new BaumanDeviceError("Thiết bị đã bị khóa hoặc trạng thái không cho phép.", 409, "DEVICE_STATE_CONFLICT");
  }

  const payloadHash = await sha256Hex(JSON.stringify({ deviceId, expectedStatus, operation }));
  const existing = await commandRow(database, commandId);
  if (existing) {
    if (existing.payload_hash !== payloadHash) {
      throw new BaumanDeviceError("commandId đã được dùng cho payload khác.", 409, "COMMAND_ID_PAYLOAD_MISMATCH");
    }
    if (existing.state === "completed" && normalizeStatus(existing.result_status)) {
      return { commandId, deviceId, operation, status: existing.result_status as BaumanDeviceStatus, replayed: true };
    }
    throw new BaumanDeviceError(
      "Lệnh này đã được tiếp nhận nhưng chưa có kết quả chắc chắn; không tự động chạy lại.",
      409,
      existing.state === "processing" ? "COMMAND_IN_PROGRESS" : "COMMAND_REQUIRES_RECONCILIATION",
    );
  }

  const current = await deviceRow(database, deviceId);
  if (!current) throw new BaumanDeviceError("Không tìm thấy thiết bị Bauman.", 404, "DEVICE_NOT_FOUND");
  if (normalizeStatus(current.status) !== expectedStatus) {
    throw new BaumanDeviceError(
      `Snapshot Bauman đã thay đổi: expected ${expectedStatus}, hiện tại ${current.status}.`,
      409,
      "DEVICE_STATE_CONFLICT",
    );
  }

  const executionNonce = crypto.randomUUID();
  await database.prepare(
    `INSERT OR IGNORE INTO bm_control_commands
       (command_id, device_id, operation, expected_status, payload_hash, state, actor, control_device_id, execution_nonce)
     VALUES (?, ?, ?, ?, ?, 'processing', ?, ?, ?)`,
  ).bind(commandId, deviceId, operation, expectedStatus, payloadHash, identity.actor, identity.controlDeviceId, executionNonce).run();

  const owned = await commandRow(database, commandId);
  if (!owned) throw new BaumanDeviceError("Không thể ghi command ledger Bauman.", 500, "COMMAND_LEDGER_WRITE_FAILED");
  if (owned.payload_hash !== payloadHash) {
    throw new BaumanDeviceError("commandId đã được dùng cho payload khác.", 409, "COMMAND_ID_PAYLOAD_MISMATCH");
  }
  if (owned.execution_nonce !== executionNonce) {
    if (owned.state === "completed" && normalizeStatus(owned.result_status)) {
      return { commandId, deviceId, operation, status: owned.result_status as BaumanDeviceStatus, replayed: true };
    }
    throw new BaumanDeviceError("Lệnh cùng commandId đang được xử lý.", 409, "COMMAND_IN_PROGRESS");
  }

  const targetStatus: BaumanDeviceStatus = operation === "approve" ? "approved" : "blocked";
  try {
    const mutation = operation === "approve"
      ? await database.prepare(
        `UPDATE bm_devices
            SET status='approved', approved_at=CURRENT_TIMESTAMP, approved_by=?, blocked_at=NULL,
                updated_at=CURRENT_TIMESTAMP
          WHERE device_id=? AND status=?`,
      ).bind(identity.actor, deviceId, expectedStatus).run()
      : await database.prepare(
        `UPDATE bm_devices
            SET status='blocked', edit_enabled=0, blocked_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP
          WHERE device_id=? AND status=?`,
      ).bind(deviceId, expectedStatus).run();

    if (Number(mutation.meta.changes ?? 0) !== 1) {
      await database.prepare(
        "UPDATE bm_control_commands SET state='failed', error_code='DEVICE_STATE_CONFLICT', completed_at=CURRENT_TIMESTAMP WHERE command_id=? AND execution_nonce=?",
      ).bind(commandId, executionNonce).run();
      throw new BaumanDeviceError("Trạng thái thiết bị đã thay đổi trước khi lệnh được áp dụng.", 409, "DEVICE_STATE_CONFLICT");
    }

    await audit(database, identity.actor, operation === "approve" ? "device_approved" : "device_blocked", deviceId, {
      commandId,
      expectedStatus,
      resultStatus: targetStatus,
      registryPreserved: true,
      editDisabled: operation === "block",
    });

    await database.prepare(
      "UPDATE bm_control_commands SET state='completed', result_status=?, completed_at=CURRENT_TIMESTAMP WHERE command_id=? AND execution_nonce=?",
    ).bind(targetStatus, commandId, executionNonce).run();

    const updated = await deviceRow(database, deviceId);
    if (!updated || normalizeStatus(updated.status) !== targetStatus) {
      throw new BaumanDeviceError("Registry Bauman chưa xác nhận kết quả lệnh.", 502, "DEVICE_COMMAND_READBACK_MISMATCH");
    }
    return { commandId, deviceId, operation, status: targetStatus, replayed: false, device: publicDevice(updated) };
  } catch (error) {
    if (!(error instanceof BaumanDeviceError && error.code === "DEVICE_STATE_CONFLICT")) {
      try {
        await database.prepare(
          "UPDATE bm_control_commands SET state='uncertain', error_code='COMMAND_REQUIRES_RECONCILIATION' WHERE command_id=? AND execution_nonce=? AND state='processing'",
        ).bind(commandId, executionNonce).run();
      } catch {
        // The safest retry policy is still to refuse replay while the ledger is unresolved.
      }
    }
    throw error;
  }
}

export async function listBaumanAudit(database: D1Database) {
  const rows = await database.prepare(
    "SELECT id, actor, action, target, detail_json, created_at FROM bm_audit_log ORDER BY id DESC LIMIT 300",
  ).all<{ id: number; actor: string; action: string; target: string; detail_json: string; created_at: string }>();
  return rows.results.map((row) => {
    let detail: Record<string, unknown> = {};
    try { detail = JSON.parse(row.detail_json) as Record<string, unknown>; } catch { detail = {}; }
    return { id: `bm-${row.id}`, actor: row.actor, action: row.action, target: row.target, detail, createdAt: row.created_at };
  });
}
