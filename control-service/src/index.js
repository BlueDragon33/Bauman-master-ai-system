const APPLICATION = "bauman-master-ai";
const PROTOCOL = "bauman-control-v1";
const ACTIVE_TIMEOUT_MS = 180_000;
const CHALLENGE_TTL_MS = 120_000;
const MAX_PENDING_DEVICES = 500;
const ALLOWED_ROLES = new Set(["viewer", "reviewer", "publisher", "owner"]);

const SUBCLIENTS = [
  { id: "math", name: "Toán Bauman", kind: "independent-site", repository: "BlueDragon33/Math_Bauman", state: "active", controlState: "contract-ready" },
  { id: "russian", name: "Tiếng Nga", kind: "module", sourcePath: "subjects/russian", state: "active", controlState: "inside-bauman" },
  { id: "programming", name: "Lập trình", kind: "module", sourcePath: "subjects/programming", state: "active", controlState: "inside-bauman" },
  { id: "ai", name: "AI", kind: "module", sourcePath: "subjects/ai", state: "active", controlState: "inside-bauman" },
  { id: "signal", name: "Tín hiệu", kind: "module", sourcePath: "subjects/signal", state: "active", controlState: "inside-bauman" },
  { id: "systems", name: "Hệ thống", kind: "module", sourcePath: "subjects/systems", state: "active", controlState: "inside-bauman" },
  { id: "foundation", name: "Nền tảng", kind: "module", sourcePath: "subjects/foundation", state: "active", controlState: "inside-bauman" },
  { id: "research", name: "Nghiên cứu", kind: "module", sourcePath: "subjects/research", state: "active", controlState: "inside-bauman" }
];

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "authorization, content-type, x-control-actor, x-control-role",
  "access-control-max-age": "86400",
  "x-content-type-options": "nosniff"
};

function json(data, status = 200, extra = {}) {
  return Response.json(data, {
    status,
    headers: { ...corsHeaders, "cache-control": "no-store, private", ...extra }
  });
}

function cleanText(value, max = 120) {
  return typeof value === "string" ? value.trim().slice(0, max) || null : null;
}

function base64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("INVALID_BASE64URL");
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

function utf8FromBase64Url(value) {
  return new TextDecoder().decode(fromBase64Url(value));
}

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((item) => item.toString(16).padStart(2, "0")).join("");
}

function normalizedPublicKey(value) {
  if (!value || typeof value !== "object") throw new Error("INVALID_DEVICE_KEY");
  const source = value;
  const x = typeof source.x === "string" ? source.x : "";
  const y = typeof source.y === "string" ? source.y : "";
  if (source.kty !== "EC" || source.crv !== "P-256" || !/^[A-Za-z0-9_-]{42,44}$/.test(x) || !/^[A-Za-z0-9_-]{42,44}$/.test(y)) {
    throw new Error("INVALID_DEVICE_KEY");
  }
  return { kty: "EC", crv: "P-256", x, y, ext: true, key_ops: ["verify"] };
}

function canonicalPublicKey(key) {
  return JSON.stringify({ kty: key.kty, crv: key.crv, x: key.x, y: key.y });
}

function displayCodeFor(deviceId) {
  return `BM-${deviceId.slice(0, 4)}-${deviceId.slice(4, 8)}-${deviceId.slice(8, 12)}-${deviceId.slice(12, 16)}`.toUpperCase();
}

function publicDevice(row) {
  const seen = Date.parse(row.last_seen_at);
  return {
    deviceId: row.device_id,
    deviceCode: row.display_code,
    displayName: row.label || null,
    label: row.label || null,
    status: row.status,
    platform: row.platform || null,
    browser: row.browser || null,
    language: row.language || null,
    timezone: row.timezone || null,
    screen: row.screen || null,
    createdAt: row.created_at,
    approvedAt: row.approved_at || null,
    approvedBy: row.approved_by || null,
    blockedAt: row.blocked_at || null,
    blockedBy: row.blocked_by || null,
    lastSeenAt: row.last_seen_at,
    active: row.status === "approved" && Number.isFinite(seen) && Date.now() - seen <= ACTIVE_TIMEOUT_MS
  };
}

async function deviceRow(db, deviceId) {
  return db.prepare(`SELECT device_id, display_code, public_key_jwk, status, label, platform, browser,
      language, timezone, screen, created_at, approved_at, approved_by, blocked_at, blocked_by, last_seen_at
    FROM bauman_devices WHERE device_id = ?`).bind(deviceId).first();
}

async function listDevices(db) {
  const result = await db.prepare(`SELECT device_id, display_code, public_key_jwk, status, label, platform, browser,
      language, timezone, screen, created_at, approved_at, approved_by, blocked_at, blocked_by, last_seen_at
    FROM bauman_devices
    ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END, last_seen_at DESC
    LIMIT 500`).all();
  return result.results.map(publicDevice);
}

async function counts(db) {
  const rows = await db.prepare("SELECT status, COUNT(*) AS total FROM bauman_devices GROUP BY status").all();
  const map = { pending: 0, approved: 0, blocked: 0 };
  for (const row of rows.results) if (row.status in map) map[row.status] = Number(row.total) || 0;
  const activeCutoff = new Date(Date.now() - ACTIVE_TIMEOUT_MS).toISOString();
  const active = await db.prepare("SELECT COUNT(*) AS total FROM bauman_devices WHERE status = 'approved' AND last_seen_at >= ?").bind(activeCutoff).first();
  return {
    devices: map.pending + map.approved + map.blocked,
    pendingDevices: map.pending,
    approvedDevices: map.approved,
    blockedDevices: map.blocked,
    activeSessions: Number(active?.total) || 0
  };
}

async function audit(db, actor, role, action, target, detail = {}) {
  await db.prepare("INSERT INTO bauman_audit_log (actor, role, action, target, detail_json) VALUES (?, ?, ?, ?, ?)")
    .bind(String(actor || "unknown").slice(0, 180), String(role || "unknown").slice(0, 40), action.slice(0, 80), target.slice(0, 180), JSON.stringify(detail)).run();
}

async function listAudit(db) {
  const result = await db.prepare("SELECT id, actor, role, action, target, detail_json, created_at FROM bauman_audit_log ORDER BY id DESC LIMIT 200").all();
  return result.results.map((row) => {
    let detail = {};
    try { detail = JSON.parse(row.detail_json || "{}"); } catch { detail = {}; }
    return { id: `bauman-${row.id}`, actor: row.actor, role: row.role, action: row.action, target: row.target, detail, createdAt: row.created_at };
  });
}

async function registerDevice(db, payload) {
  const key = normalizedPublicKey(payload.publicKey);
  const serialized = canonicalPublicKey(key);
  const deviceId = await sha256(serialized);
  const metadata = payload.metadata && typeof payload.metadata === "object" ? payload.metadata : {};
  const existing = await deviceRow(db, deviceId);
  const fields = {
    platform: cleanText(metadata.platform), browser: cleanText(metadata.browser), language: cleanText(metadata.language, 40),
    timezone: cleanText(metadata.timezone, 80), screen: cleanText(metadata.screen, 40)
  };

  if (existing) {
    await db.prepare(`UPDATE bauman_devices SET platform = COALESCE(?, platform), browser = COALESCE(?, browser),
      language = COALESCE(?, language), timezone = COALESCE(?, timezone), screen = COALESCE(?, screen),
      last_seen_at = CURRENT_TIMESTAMP WHERE device_id = ?`)
      .bind(fields.platform, fields.browser, fields.language, fields.timezone, fields.screen, deviceId).run();
    return publicDevice(await deviceRow(db, deviceId));
  }

  const pending = await db.prepare("SELECT COUNT(*) AS total FROM bauman_devices WHERE status = 'pending'").first();
  if ((Number(pending?.total) || 0) >= MAX_PENDING_DEVICES) {
    const error = new Error("PENDING_QUEUE_FULL");
    error.code = "PENDING_QUEUE_FULL";
    throw error;
  }

  const code = displayCodeFor(deviceId);
  await db.prepare(`INSERT INTO bauman_devices
    (device_id, display_code, public_key_jwk, status, platform, browser, language, timezone, screen)
    VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?)`)
    .bind(deviceId, code, serialized, fields.platform, fields.browser, fields.language, fields.timezone, fields.screen).run();
  await audit(db, "bauman-runtime", "device", "device_registered", deviceId, { deviceCode: code, platform: fields.platform, browser: fields.browser });
  return publicDevice(await deviceRow(db, deviceId));
}

async function createChallenge(db, deviceId) {
  if (typeof deviceId !== "string" || !/^[a-f0-9]{64}$/.test(deviceId)) throw Object.assign(new Error("INVALID_DEVICE"), { code: "INVALID_DEVICE" });
  const row = await deviceRow(db, deviceId);
  if (!row) throw Object.assign(new Error("DEVICE_NOT_FOUND"), { code: "DEVICE_NOT_FOUND" });
  if (row.status !== "approved") throw Object.assign(new Error(row.status === "blocked" ? "DEVICE_BLOCKED" : "DEVICE_PENDING"), { code: row.status === "blocked" ? "DEVICE_BLOCKED" : "DEVICE_PENDING", device: publicDevice(row) });
  const nonce = base64Url(crypto.getRandomValues(new Uint8Array(32)));
  const expiresAt = Date.now() + CHALLENGE_TTL_MS;
  await db.batch([
    db.prepare("DELETE FROM bauman_challenges WHERE expires_at < ?").bind(Date.now()),
    db.prepare("INSERT INTO bauman_challenges (nonce, device_id, expires_at) VALUES (?, ?, ?)").bind(nonce, deviceId, expiresAt)
  ]);
  return { challenge: nonce, expiresAt, device: publicDevice(row) };
}

async function verifyProof(db, payload) {
  const deviceId = typeof payload.deviceId === "string" ? payload.deviceId : "";
  const challenge = typeof payload.challenge === "string" ? payload.challenge : "";
  const signature = typeof payload.signature === "string" ? payload.signature : "";
  if (!/^[a-f0-9]{64}$/.test(deviceId) || !/^[A-Za-z0-9_-]{40,100}$/.test(challenge) || !/^[A-Za-z0-9_-]{70,120}$/.test(signature)) {
    throw Object.assign(new Error("INVALID_DEVICE_PROOF"), { code: "INVALID_DEVICE_PROOF" });
  }
  const row = await deviceRow(db, deviceId);
  if (!row) throw Object.assign(new Error("DEVICE_NOT_FOUND"), { code: "DEVICE_NOT_FOUND" });
  if (row.status !== "approved") throw Object.assign(new Error(row.status === "blocked" ? "DEVICE_BLOCKED" : "DEVICE_PENDING"), { code: row.status === "blocked" ? "DEVICE_BLOCKED" : "DEVICE_PENDING", device: publicDevice(row) });

  const proof = await db.prepare("SELECT expires_at FROM bauman_challenges WHERE nonce = ? AND device_id = ?").bind(challenge, deviceId).first();
  await db.prepare("DELETE FROM bauman_challenges WHERE nonce = ? AND device_id = ?").bind(challenge, deviceId).run();
  if (!proof || Number(proof.expires_at) < Date.now()) throw Object.assign(new Error("DEVICE_PROOF_EXPIRED"), { code: "DEVICE_PROOF_EXPIRED" });

  const key = await crypto.subtle.importKey("jwk", normalizedPublicKey(JSON.parse(row.public_key_jwk)), { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
  const valid = await crypto.subtle.verify(
    { name: "ECDSA", hash: "SHA-256" }, key, fromBase64Url(signature),
    new TextEncoder().encode(`bauman-runtime:${deviceId}:${challenge}`)
  );
  if (!valid) throw Object.assign(new Error("DEVICE_MISMATCH"), { code: "DEVICE_MISMATCH", device: publicDevice(row) });
  await db.prepare("UPDATE bauman_devices SET last_seen_at = CURRENT_TIMESTAMP WHERE device_id = ?").bind(deviceId).run();
  return publicDevice(await deviceRow(db, deviceId));
}

async function hmacKey(secret) {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
}

async function controlActor(request, env) {
  const secret = typeof env.BAUMAN_CONTROL_SERVICE_SECRET === "string" ? env.BAUMAN_CONTROL_SERVICE_SECRET : "";
  if (secret.length < 32) throw Object.assign(new Error("CONTROL_SECRET_NOT_CONFIGURED"), { status: 503, code: "CONTROL_SECRET_NOT_CONFIGURED" });
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) throw Object.assign(new Error("CONTROL_AUTH_REQUIRED"), { status: 401, code: "CONTROL_AUTH_REQUIRED" });
  const token = header.slice(7).trim();

  if (token === secret) {
    const requestedRole = request.headers.get("x-control-role") || "viewer";
    return { actor: (request.headers.get("x-control-actor") || "application-management").slice(0, 180), role: ALLOWED_ROLES.has(requestedRole) ? requestedRole : "viewer", source: "server-secret" };
  }

  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") throw Object.assign(new Error("CONTROL_TOKEN_INVALID"), { status: 401, code: "CONTROL_TOKEN_INVALID" });
  const signedInput = `v1.${parts[1]}`;
  const verified = await crypto.subtle.verify("HMAC", await hmacKey(secret), fromBase64Url(parts[2]), new TextEncoder().encode(signedInput));
  if (!verified) throw Object.assign(new Error("CONTROL_TOKEN_INVALID"), { status: 401, code: "CONTROL_TOKEN_INVALID" });
  let claims;
  try { claims = JSON.parse(utf8FromBase64Url(parts[1])); } catch { throw Object.assign(new Error("CONTROL_TOKEN_INVALID"), { status: 401, code: "CONTROL_TOKEN_INVALID" }); }
  if (claims.iss !== "application-management" || claims.aud !== "bauman-control" || claims.app !== APPLICATION || !ALLOWED_ROLES.has(claims.role) || Number(claims.exp) < Date.now()) {
    throw Object.assign(new Error("CONTROL_TOKEN_EXPIRED_OR_INVALID"), { status: 401, code: "CONTROL_TOKEN_EXPIRED_OR_INVALID" });
  }
  return { actor: String(claims.actor || "control-center").slice(0, 180), role: claims.role, source: "browser-bridge", controlDeviceId: claims.controlDeviceId || null };
}

function requireReview(actor) {
  if (!["reviewer", "publisher", "owner"].includes(actor.role)) throw Object.assign(new Error("REVIEWER_REQUIRED"), { status: 403, code: "REVIEWER_REQUIRED" });
}

function requireOwner(actor) {
  if (actor.role !== "owner") throw Object.assign(new Error("OWNER_REQUIRED"), { status: 403, code: "OWNER_REQUIRED" });
}

async function manageDevice(db, actor, body) {
  requireOwner(actor);
  const action = typeof body.action === "string" ? body.action : typeof body.operation === "string" ? body.operation : "";
  const deviceId = typeof body.deviceId === "string" ? body.deviceId : typeof body.targetDeviceId === "string" ? body.targetDeviceId : "";
  if (!/^[a-f0-9]{64}$/.test(deviceId)) throw Object.assign(new Error("INVALID_DEVICE"), { status: 400, code: "INVALID_DEVICE" });
  const row = await deviceRow(db, deviceId);
  if (!row) throw Object.assign(new Error("DEVICE_NOT_FOUND"), { status: 404, code: "DEVICE_NOT_FOUND" });

  if (action === "approve") {
    await db.prepare(`UPDATE bauman_devices SET status = 'approved', approved_at = CURRENT_TIMESTAMP, approved_by = ?, blocked_at = NULL, blocked_by = NULL WHERE device_id = ?`).bind(actor.actor, deviceId).run();
    await audit(db, actor.actor, actor.role, "device_approved", deviceId, { deviceCode: row.display_code });
  } else if (action === "reject" || action === "block") {
    await db.batch([
      db.prepare(`UPDATE bauman_devices SET status = 'blocked', blocked_at = CURRENT_TIMESTAMP, blocked_by = ? WHERE device_id = ?`).bind(actor.actor, deviceId),
      db.prepare("DELETE FROM bauman_challenges WHERE device_id = ?").bind(deviceId)
    ]);
    await audit(db, actor.actor, actor.role, row.status === "pending" ? "device_rejected" : "device_blocked", deviceId, { deviceCode: row.display_code });
  } else if (action === "reopen") {
    await db.prepare(`UPDATE bauman_devices SET status = 'pending', approved_at = NULL, approved_by = NULL, blocked_at = NULL, blocked_by = NULL WHERE device_id = ?`).bind(deviceId).run();
    await audit(db, actor.actor, actor.role, "device_reopened", deviceId, { deviceCode: row.display_code });
  } else if (action === "label") {
    const label = cleanText(body.label, 120);
    await db.prepare("UPDATE bauman_devices SET label = ? WHERE device_id = ?").bind(label, deviceId).run();
    await audit(db, actor.actor, actor.role, "device_label_updated", deviceId, { deviceCode: row.display_code, label });
  } else {
    throw Object.assign(new Error("INVALID_DEVICE_ACTION"), { status: 400, code: "INVALID_DEVICE_ACTION" });
  }
  return listDevices(db);
}

async function deviceApi(request, env) {
  const body = await request.json().catch(() => ({}));
  const action = typeof body.action === "string" ? body.action : "register";
  try {
    if (action === "register") {
      const device = await registerDevice(env.BAUMAN_DB, body);
      return json({ ok: true, application: APPLICATION, protocol: PROTOCOL, device, accessGranted: device.status === "approved", pollAfterSeconds: device.status === "pending" ? 15 : 60 });
    }
    if (action === "challenge") return json({ ok: true, application: APPLICATION, protocol: PROTOCOL, ...await createChallenge(env.BAUMAN_DB, body.deviceId) });
    if (action === "verify") return json({ ok: true, application: APPLICATION, protocol: PROTOCOL, device: await verifyProof(env.BAUMAN_DB, body), accessGranted: true, heartbeatSeconds: 60 });
    return json({ ok: false, error: "Thao tác thiết bị Bauman không hợp lệ.", code: "INVALID_DEVICE_ACTION" }, 400);
  } catch (error) {
    const code = error.code || error.message || "DEVICE_SERVICE_ERROR";
    const status = code === "DEVICE_NOT_FOUND" ? 404 : code === "PENDING_QUEUE_FULL" ? 429 : ["DEVICE_PENDING", "DEVICE_BLOCKED", "DEVICE_MISMATCH"].includes(code) ? 403 : code === "DEVICE_PROOF_EXPIRED" ? 401 : 400;
    const messages = {
      INVALID_DEVICE_KEY: "Khóa thiết bị Bauman không hợp lệ.", INVALID_DEVICE: "Mã thiết bị Bauman không hợp lệ.", DEVICE_NOT_FOUND: "Thiết bị Bauman chưa đăng ký.",
      DEVICE_PENDING: "Thiết bị Bauman đang chờ duyệt.", DEVICE_BLOCKED: "Thiết bị Bauman đã bị loại bỏ hoặc khóa.", DEVICE_MISMATCH: "Thiết bị không khớp quyền đã cấp.",
      DEVICE_PROOF_EXPIRED: "Phiên xác thực thiết bị đã hết hạn.", INVALID_DEVICE_PROOF: "Bằng chứng thiết bị không hợp lệ.", PENDING_QUEUE_FULL: "Hàng chờ thiết bị Bauman đang đầy; quản trị viên cần xử lý trước."
    };
    return json({ ok: false, error: messages[code] || "Dịch vụ thiết bị Bauman đang tạm gián đoạn.", code, device: error.device || undefined }, status);
  }
}

async function controlApi(request, env, url) {
  const actor = await controlActor(request, env);
  const path = url.pathname;
  if (request.method === "GET" && path === "/api/control/status") {
    const totals = await counts(env.BAUMAN_DB);
    return json({
      ok: true, application: APPLICATION, protocol: PROTOCOL, actorRole: actor.role,
      ownership: { runtime: "bauman-master-ai-system", subclients: "bauman-master-ai-system", centralRole: "remote-control-only" },
      readiness: { runtime: "available", subclientInventory: "available", readOnlyControlApi: "available", deviceRegistry: "available", deviceGateway: "available", auditApi: "available", contentReviewApi: "planned" },
      counts: { subclients: SUBCLIENTS.length, independentSites: SUBCLIENTS.filter((item) => item.kind === "independent-site").length, modules: SUBCLIENTS.filter((item) => item.kind === "module").length, ...totals },
      capabilities: ["device-review-v1", "p256-device-proof-v1", "central-review-sync-v1", "browser-bridge-v1", "client-owned-registry-v1"],
      buildRevision: env.BAUMAN_BUILD_REVISION || null,
      buildSource: env.BAUMAN_BUILD_SOURCE || "BlueDragon33/Bauman-master-ai-system",
      checkedAt: Date.now()
    });
  }
  if (request.method === "GET" && path === "/api/control/subclients") return json({ ok: true, application: APPLICATION, protocol: PROTOCOL, subclients: SUBCLIENTS });
  if (path === "/api/control/devices") {
    requireReview(actor);
    if (request.method === "GET") return json({ ok: true, application: APPLICATION, protocol: PROTOCOL, devices: await listDevices(env.BAUMAN_DB) });
    if (request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      return json({ ok: true, application: APPLICATION, protocol: PROTOCOL, devices: await manageDevice(env.BAUMAN_DB, actor, body), counts: await counts(env.BAUMAN_DB) });
    }
  }
  if (request.method === "GET" && path === "/api/control/audit") {
    requireReview(actor);
    return json({ ok: true, application: APPLICATION, protocol: PROTOCOL, audit: await listAudit(env.BAUMAN_DB) });
  }
  return json({ ok: false, error: "Endpoint quản trị Bauman không tồn tại.", code: "CONTROL_ROUTE_NOT_FOUND" }, 404);
}

async function handle(request, env) {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (url.pathname === "/health" && request.method === "GET") return json({ ok: true, application: APPLICATION, protocol: PROTOCOL, service: "online", checkedAt: Date.now() });
  if (url.pathname === "/api/device" && request.method === "POST") return deviceApi(request, env);
  if (url.pathname.startsWith("/api/control/")) {
    try { return await controlApi(request, env, url); }
    catch (error) { return json({ ok: false, error: error.message || "Không thể xác thực quản trị Bauman.", code: error.code || "CONTROL_ERROR" }, error.status || 500); }
  }
  return json({ ok: false, error: "Bauman Control Service", code: "NOT_FOUND" }, 404);
}

export default { fetch: handle };
export { handle, normalizedPublicKey, canonicalPublicKey, displayCodeFor };