import controlService from "./index";

interface AutomationEnv {
  BAUMAN_CONTROL_SERVICE_SECRET?: string;
  APPLICATION_MANAGEMENT_ORIGIN?: string;
  BAUMAN_APP_ORIGIN?: string;
  DB?: D1Database;
}

type Role = "viewer" | "reviewer" | "publisher" | "owner";
type Identity = { actor: string; role: Role };
type UnknownRecord = Record<string, unknown>;

const TOKEN_ISSUER = "application-management";
const TOKEN_AUDIENCE = "bauman-control";
const TOKEN_APP = "bauman-master-ai";

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : {};
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(value) || value.length > 3072) throw new Error("INVALID_TICKET");
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

async function digest(value: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

async function secureEqual(left: string, right: string) {
  const [a, b] = await Promise.all([digest(left), digest(right)]);
  let difference = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) difference |= (a[index] ?? 0) ^ (b[index] ?? 0);
  return difference === 0;
}

async function signature(secret: string, value: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))));
}

async function authenticate(request: Request, env: AutomationEnv): Promise<Identity> {
  const secret = env.BAUMAN_CONTROL_SERVICE_SECRET ?? "";
  const authorization = request.headers.get("authorization") ?? "";
  const supplied = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (secret.length < 32 || supplied.length < 32) throw new Error("CONTROL_TICKET_FORBIDDEN");

  if (await secureEqual(secret, supplied)) {
    const suppliedRole = (request.headers.get("x-control-role") ?? "viewer").toLowerCase();
    const role = (["viewer", "reviewer", "publisher", "owner"].includes(suppliedRole) ? suppliedRole : "viewer") as Role;
    return { actor: (request.headers.get("x-control-actor") ?? "system").trim().toLowerCase().slice(0, 160), role };
  }

  const [version, encoded, suppliedSignature, extra] = supplied.split(".");
  if (version !== "v1" || !encoded || !suppliedSignature || extra) throw new Error("CONTROL_TICKET_FORBIDDEN");
  if (!(await secureEqual(await signature(secret, `${version}.${encoded}`), suppliedSignature))) throw new Error("CONTROL_TICKET_FORBIDDEN");

  let payload: UnknownRecord;
  try {
    payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encoded))) as UnknownRecord;
  } catch {
    throw new Error("CONTROL_TICKET_FORBIDDEN");
  }
  const actor = typeof payload.actor === "string" ? payload.actor.trim().toLowerCase().slice(0, 160) : "";
  const suppliedRole = typeof payload.role === "string" ? payload.role : "viewer";
  const role = (["viewer", "reviewer", "publisher", "owner"].includes(suppliedRole) ? suppliedRole : "viewer") as Role;
  const expiresAt = typeof payload.exp === "number" ? payload.exp : 0;
  if (payload.iss !== TOKEN_ISSUER || payload.aud !== TOKEN_AUDIENCE || payload.app !== TOKEN_APP || !actor.includes("@") || expiresAt <= Date.now() || expiresAt > Date.now() + 10 * 60 * 1000) {
    throw new Error("CONTROL_TICKET_FORBIDDEN");
  }
  return { actor, role };
}

function securityHeaders(headers?: HeadersInit) {
  const result = new Headers(headers);
  result.set("cache-control", "no-store, private");
  result.set("content-security-policy", "default-src 'none'; frame-ancestors 'none'");
  result.set("x-content-type-options", "nosniff");
  return result;
}

function json(data: unknown, status = 200, headers?: HeadersInit) {
  return Response.json(data, { status, headers: securityHeaders(headers) });
}

async function automationReady(env: AutomationEnv) {
  if (!env.DB) return false;
  try {
    await env.DB.prepare("SELECT auto_approve_devices FROM bm_automation_policy WHERE id=1").first();
    return true;
  } catch {
    return false;
  }
}

async function readAutomation(database: D1Database) {
  const row = await database.prepare(
    "SELECT auto_approve_devices, updated_at, updated_by FROM bm_automation_policy WHERE id=1",
  ).first<{ auto_approve_devices: number; updated_at: string; updated_by: string | null }>();
  if (!row) throw new Error("AUTOMATION_POLICY_NOT_MIGRATED");
  return {
    autoApproveDevices: Number(row.auto_approve_devices) === 1,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

async function writeAutomation(database: D1Database, enabled: boolean, actor: string) {
  await database.prepare(
    `INSERT INTO bm_automation_policy (id, auto_approve_devices, updated_at, updated_by)
     VALUES (1, ?, CURRENT_TIMESTAMP, ?)
     ON CONFLICT(id) DO UPDATE SET auto_approve_devices=excluded.auto_approve_devices, updated_at=CURRENT_TIMESTAMP, updated_by=excluded.updated_by`,
  ).bind(enabled ? 1 : 0, actor || "application-management").run();
  await database.prepare(
    "INSERT INTO bm_audit_log (actor, action, target, detail_json) VALUES (?, 'automation_auto_approval_updated', 'policy:device-auto-approval', ?)",
  ).bind(actor || "application-management", JSON.stringify({ enabled })).run();
  return readAutomation(database);
}

async function maybeAutoApprove(database: D1Database, deviceId: string) {
  const policy = await readAutomation(database).catch(() => null);
  if (!policy?.autoApproveDevices) return false;
  const result = await database.prepare(
    `UPDATE bm_devices
        SET status='approved', edit_enabled=0, approved_at=COALESCE(approved_at, CURRENT_TIMESTAMP),
            approved_by='automation:application-management', blocked_at=NULL, updated_at=CURRENT_TIMESTAMP
      WHERE device_id=? AND status='pending'`,
  ).bind(deviceId).run();
  const changed = Number(result.meta.changes ?? 0) === 1;
  if (changed) {
    await database.prepare(
      "INSERT INTO bm_audit_log (actor, action, target, detail_json) VALUES ('automation:application-management', 'device_auto_approved', ?, ?)",
    ).bind(deviceId, JSON.stringify({ policy: "device-auto-approval" })).run();
  }
  return changed;
}

async function automationEndpoint(request: Request, env: AutomationEnv) {
  let identity: Identity;
  try {
    identity = await authenticate(request, env);
  } catch {
    return json({ ok: false, error: "Không được phép truy cập automation contract Bauman.", code: "CONTROL_TICKET_FORBIDDEN" }, 403);
  }
  if (!env.DB) return json({ ok: false, error: "Bauman control service chưa được gắn D1 DB.", code: "BAUMAN_DB_NOT_CONFIGURED" }, 503);
  if (!(await automationReady(env))) return json({ ok: false, error: "Bauman automation policy chưa được migrate.", code: "BAUMAN_AUTOMATION_NOT_MIGRATED" }, 503);

  if (request.method === "GET") {
    return json({ ok: true, application: TOKEN_APP, automation: await readAutomation(env.DB) });
  }
  if (request.method !== "POST") return json({ ok: false, code: "METHOD_NOT_ALLOWED" }, 405);
  if (identity.role !== "owner") return json({ ok: false, error: "Chỉ Chủ hệ thống được đổi duyệt tự động Bauman.", code: "OWNER_REQUIRED" }, 403);

  const payload = record(await request.json().catch(() => null));
  if (typeof payload.autoApproveDevices !== "boolean") {
    return json({ ok: false, error: "Trạng thái duyệt tự động không hợp lệ.", code: "INVALID_AUTO_APPROVAL_STATE" }, 400);
  }
  const automation = await writeAutomation(env.DB, payload.autoApproveDevices, identity.actor);
  return json({ ok: true, application: TOKEN_APP, automation });
}

async function augmentStatus(response: Response, env: AutomationEnv) {
  if (!response.ok) return response;
  const payload = await response.json() as UnknownRecord;
  const readiness = record(payload.readiness);
  const capabilities = record(payload.capabilities);
  const endpoints = record(payload.endpoints);
  const ready = await automationReady(env);
  return json({
    ...payload,
    readiness: { ...readiness, deviceAutoApproval: ready ? "available" : "configuration-required" },
    capabilities: { ...capabilities, deviceAutoApproval: ready },
    endpoints: { ...endpoints, automation: "/api/control/automation" },
  }, response.status, response.headers);
}

async function augmentRegistration(response: Response, env: AutomationEnv) {
  if (!response.ok || !env.DB || !(await automationReady(env))) return response;
  const payload = await response.json().catch(() => null) as UnknownRecord | null;
  if (!payload) return response;
  const device = record(payload.device);
  const deviceId = typeof device.deviceId === "string" ? device.deviceId : "";
  if (!/^[a-f0-9]{64}$/.test(deviceId) || device.status !== "pending") return json(payload, response.status, response.headers);
  if (!(await maybeAutoApprove(env.DB, deviceId))) return json(payload, response.status, response.headers);
  const updated = await env.DB.prepare(
    "SELECT status, approved_at, approved_by, updated_at FROM bm_devices WHERE device_id=?",
  ).bind(deviceId).first<{ status: string; approved_at: string | null; approved_by: string | null; updated_at: string }>();
  return json({
    ...payload,
    device: {
      ...device,
      status: updated?.status ?? "approved",
      approvedAt: updated?.approved_at ?? null,
      approvedBy: updated?.approved_by ?? "automation:application-management",
      updatedAt: updated?.updated_at ?? device.updatedAt,
    },
  }, response.status, response.headers);
}

export default {
  async fetch(request: Request, env: AutomationEnv, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/control/automation") return automationEndpoint(request, env);

    const response = await controlService.fetch(request, env);
    if (request.method === "GET" && url.pathname === "/api/control/status") return augmentStatus(response, env);
    if (request.method === "POST" && url.pathname === "/api/device/register") return augmentRegistration(response, env);
    return response;
  },
} satisfies ExportedHandler<AutomationEnv>;
