import {
  BaumanDeviceError,
  executeBaumanDeviceCommand,
  listBaumanAudit,
  listBaumanDevices,
  readBaumanDeviceStatus,
  registerBaumanDevice,
  touchBaumanDevice,
  type BaumanControlIdentity,
  type BaumanControlRole,
} from "./device-store";

interface Env {
  BAUMAN_CONTROL_SERVICE_SECRET?: string;
  APPLICATION_MANAGEMENT_ORIGIN?: string;
  BAUMAN_APP_ORIGIN?: string;
  DB?: D1Database;
}

type Identity = BaumanControlIdentity;
type Role = BaumanControlRole;

const TOKEN_ISSUER = "application-management";
const TOKEN_AUDIENCE = "bauman-control";
const TOKEN_APP = "bauman-master-ai";
const CONTROL_PROTOCOL = "bauman-control-v3";

const SUBCLIENTS = [
  { id: "math", name: "Toán Bauman", kind: "subject-site", repository: "BlueDragon33/Math_Bauman", state: "independent", controlState: "pending" },
  { id: "programming", name: "Lập trình", kind: "module", sourcePath: "subjects/programming", state: "module", controlState: "pending" },
  { id: "ai", name: "AI", kind: "module", sourcePath: "subjects/ai", state: "module", controlState: "pending" },
  { id: "signal", name: "Tín hiệu", kind: "module", sourcePath: "subjects/signal", state: "module", controlState: "pending" },
  { id: "systems", name: "Hệ thống", kind: "module", sourcePath: "subjects/systems", state: "module", controlState: "pending" },
  { id: "foundation", name: "Nền tảng", kind: "module", sourcePath: "subjects/foundation", state: "module", controlState: "pending" },
  { id: "research", name: "Nghiên cứu", kind: "module", sourcePath: "subjects/research", state: "module", controlState: "pending" },
  { id: "russian", name: "Tiếng Nga", kind: "module", sourcePath: "subjects/russian", state: "module", controlState: "pending" },
] as const;

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

async function authenticate(request: Request, env: Env): Promise<Identity> {
  const secret = env.BAUMAN_CONTROL_SERVICE_SECRET ?? "";
  const authorization = request.headers.get("authorization") ?? "";
  const supplied = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (secret.length < 32 || supplied.length < 32) throw new BaumanDeviceError("Không được phép truy cập control API Bauman.", 403, "CONTROL_TICKET_FORBIDDEN");

  if (await secureEqual(secret, supplied)) {
    const suppliedRole = (request.headers.get("x-control-role") ?? "viewer").toLowerCase();
    const role = (["viewer", "reviewer", "publisher", "owner"].includes(suppliedRole) ? suppliedRole : "viewer") as Role;
    const controlDeviceId = (request.headers.get("x-control-device") ?? "").toLowerCase();
    return {
      actor: (request.headers.get("x-control-actor") ?? "system").trim().toLowerCase().slice(0, 160),
      role,
      controlDeviceId: /^[a-f0-9]{64}$/.test(controlDeviceId) ? controlDeviceId : null,
    };
  }

  const [version, encoded, suppliedSignature, extra] = supplied.split(".");
  if (version !== "v1" || !encoded || !suppliedSignature || extra) {
    throw new BaumanDeviceError("Vé quản trị Bauman không hợp lệ.", 403, "CONTROL_TICKET_FORBIDDEN");
  }
  if (!(await secureEqual(await signature(secret, `${version}.${encoded}`), suppliedSignature))) {
    throw new BaumanDeviceError("Chữ ký vé quản trị Bauman không hợp lệ.", 403, "CONTROL_TICKET_FORBIDDEN");
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encoded))) as Record<string, unknown>;
  } catch {
    throw new BaumanDeviceError("Payload vé quản trị Bauman không hợp lệ.", 403, "CONTROL_TICKET_FORBIDDEN");
  }
  const actor = typeof payload.actor === "string" ? payload.actor.trim().toLowerCase().slice(0, 160) : "";
  const suppliedRole = typeof payload.role === "string" ? payload.role : "viewer";
  const role = (["viewer", "reviewer", "publisher", "owner"].includes(suppliedRole) ? suppliedRole : "viewer") as Role;
  const expiresAt = typeof payload.exp === "number" ? payload.exp : 0;
  const controlDeviceId = typeof payload.controlDeviceId === "string" && /^[a-f0-9]{64}$/.test(payload.controlDeviceId) ? payload.controlDeviceId : null;
  if (payload.iss !== TOKEN_ISSUER || payload.aud !== TOKEN_AUDIENCE || payload.app !== TOKEN_APP || !actor.includes("@") || expiresAt <= Date.now() || expiresAt > Date.now() + 10 * 60 * 1000) {
    throw new BaumanDeviceError("Vé quản trị Bauman đã hết hạn hoặc không hợp lệ.", 403, "CONTROL_TICKET_FORBIDDEN");
  }
  return { actor, role, controlDeviceId };
}

function configuredOrigin(value: string | undefined) {
  return (value ?? "").trim().replace(/\/$/, "");
}

function controlCors(request: Request, env: Env) {
  const configured = configuredOrigin(env.APPLICATION_MANAGEMENT_ORIGIN);
  const origin = configuredOrigin(request.headers.get("origin") ?? "");
  return configured && origin === configured ? {
    "access-control-allow-origin": configured,
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "authorization, content-type",
    "access-control-max-age": "600",
    vary: "Origin",
  } : {};
}

function appCors(request: Request, env: Env) {
  const configured = configuredOrigin(env.BAUMAN_APP_ORIGIN);
  const origin = configuredOrigin(request.headers.get("origin") ?? "");
  return configured && origin === configured ? {
    "access-control-allow-origin": configured,
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "600",
    vary: "Origin",
  } : {};
}

function securityHeaders() {
  return {
    "cache-control": "no-store, private",
    "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
    "x-content-type-options": "nosniff",
  };
}

function json(request: Request, env: Env, data: unknown, status = 200, surface: "control" | "app" | "none" = "control") {
  const cors = surface === "control" ? controlCors(request, env) : surface === "app" ? appCors(request, env) : {};
  return Response.json(data, { status, headers: { ...securityHeaders(), ...cors } });
}

function requireAppOrigin(request: Request, env: Env) {
  const configured = configuredOrigin(env.BAUMAN_APP_ORIGIN);
  if (!configured) throw new BaumanDeviceError("Chưa cấu hình BAUMAN_APP_ORIGIN.", 503, "BAUMAN_APP_ORIGIN_NOT_CONFIGURED");
  const origin = configuredOrigin(request.headers.get("origin") ?? "");
  if (origin !== configured) throw new BaumanDeviceError("Origin không được phép dùng device gateway Bauman.", 403, "BAUMAN_APP_ORIGIN_FORBIDDEN");
}

function requireDatabase(env: Env) {
  if (!env.DB) throw new BaumanDeviceError("Bauman control service chưa được gắn D1 DB.", 503, "BAUMAN_DB_NOT_CONFIGURED");
  return env.DB;
}

async function databaseReady(env: Env) {
  if (!env.DB) return false;
  try {
    await env.DB.prepare("SELECT device_id FROM bm_devices LIMIT 1").first();
    await env.DB.prepare("SELECT command_id FROM bm_control_commands LIMIT 1").first();
    await env.DB.prepare("SELECT id FROM bm_audit_log LIMIT 1").first();
    return true;
  } catch {
    return false;
  }
}

async function body(request: Request) {
  const parsed = await request.json().catch(() => null);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new BaumanDeviceError("JSON body không hợp lệ.", 400, "INVALID_JSON_BODY");
  }
  return parsed as Record<string, unknown>;
}

function errorResponse(request: Request, env: Env, error: unknown, surface: "control" | "app") {
  if (error instanceof BaumanDeviceError) {
    return json(request, env, { ok: false, error: error.message, code: error.code }, error.status, surface);
  }
  return json(request, env, { ok: false, error: "Bauman control service đang tạm gián đoạn.", code: "BAUMAN_CONTROL_ERROR" }, 500, surface);
}

async function publicDeviceRoute(request: Request, env: Env, url: URL) {
  try {
    requireAppOrigin(request, env);
    const database = requireDatabase(env);
    if (request.method === "POST" && url.pathname === "/api/device/register") {
      const device = await registerBaumanDevice(database, await body(request));
      return json(request, env, { ok: true, application: TOKEN_APP, device }, 200, "app");
    }
    if (request.method === "POST" && url.pathname === "/api/device/heartbeat") {
      const payload = await body(request);
      const device = await touchBaumanDevice(database, payload.deviceId);
      return json(request, env, { ok: true, application: TOKEN_APP, device }, 200, "app");
    }
    if (request.method === "GET" && url.pathname === "/api/device/status") {
      const device = await readBaumanDeviceStatus(database, url.searchParams.get("deviceId"));
      return json(request, env, { ok: true, application: TOKEN_APP, device }, 200, "app");
    }
    return json(request, env, { ok: false, code: "NOT_FOUND" }, 404, "app");
  } catch (error) {
    return errorResponse(request, env, error, "app");
  }
}

async function controlRoute(request: Request, env: Env, url: URL) {
  try {
    const identity = await authenticate(request, env);
    if (request.method === "GET" && url.pathname === "/api/control/status") {
      const ready = await databaseReady(env);
      return json(request, env, {
        ok: true,
        application: TOKEN_APP,
        canonicalApplication: TOKEN_APP,
        protocol: CONTROL_PROTOCOL,
        actorRole: identity.role,
        ownership: {
          runtime: "Bauman-master-ai-system",
          database: "Bauman-master-ai-system",
          deviceRegistry: "Bauman-master-ai-system",
          audit: "Bauman-master-ai-system",
          subclients: "Bauman-master-ai-system",
          centralRole: "policy-and-remote-admin-only",
        },
        readiness: {
          runtime: "available",
          subclientInventory: "available",
          readOnlyControlApi: "available",
          deviceRegistry: ready ? "available" : "configuration-required",
          deviceGateway: ready && configuredOrigin(env.BAUMAN_APP_ORIGIN) ? "available" : "configuration-required",
          mutationAdminApi: ready ? "available" : "configuration-required",
          auditApi: ready ? "available" : "configuration-required",
          accessGate: "missing",
          contentReviewApi: "missing",
        },
        capabilities: {
          deviceRegistry: ready,
          deviceRegistration: ready && Boolean(configuredOrigin(env.BAUMAN_APP_ORIGIN)),
          deviceApproval: ready,
          deviceIdempotentCommands: ready,
          optimisticConcurrency: ready,
          accessAndEditSeparated: ready,
          audit: ready,
          p256DeviceIdentity: ready,
          learningAccessGate: false,
        },
        endpoints: {
          devices: "/api/control/devices",
          deviceCommands: "/api/control/device-commands",
          audit: "/api/control/audit",
          subclients: "/api/control/subclients",
          deviceRegister: "/api/device/register",
          deviceHeartbeat: "/api/device/heartbeat",
          deviceStatus: "/api/device/status",
        },
        deviceRegistry: { owner: "Bauman-master-ai-system", namespace: "BM-" },
        counts: {
          subclients: SUBCLIENTS.length,
          independentSites: SUBCLIENTS.filter((item) => item.state === "independent").length,
          modules: SUBCLIENTS.filter((item) => item.state === "module").length,
        },
        checkedAt: Date.now(),
      });
    }

    if (request.method === "GET" && url.pathname === "/api/control/subclients") {
      return json(request, env, { ok: true, application: TOKEN_APP, subclients: SUBCLIENTS });
    }

    if (request.method === "GET" && url.pathname === "/api/control/devices") {
      const database = requireDatabase(env);
      const devices = await listBaumanDevices(database);
      return json(request, env, { ok: true, application: TOKEN_APP, devices });
    }

    if (request.method === "POST" && url.pathname === "/api/control/device-commands") {
      const database = requireDatabase(env);
      const command = await executeBaumanDeviceCommand(database, identity, await body(request));
      return json(request, env, { ok: true, application: TOKEN_APP, ...command });
    }

    if (request.method === "GET" && url.pathname === "/api/control/audit") {
      if (identity.role === "viewer") throw new BaumanDeviceError("Cần quyền reviewer trở lên để đọc audit Bauman.", 403, "REVIEWER_REQUIRED");
      const database = requireDatabase(env);
      const audit = await listBaumanAudit(database);
      return json(request, env, { ok: true, application: TOKEN_APP, audit });
    }

    return json(request, env, { ok: false, code: "NOT_FOUND" }, 404);
  } catch (error) {
    return errorResponse(request, env, error, "control");
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      if (url.pathname.startsWith("/api/device/")) {
        const headers = appCors(request, env);
        return Object.keys(headers).length ? new Response(null, { status: 204, headers }) : new Response(null, { status: 403, headers: securityHeaders() });
      }
      if (url.pathname.startsWith("/api/control/")) {
        const headers = controlCors(request, env);
        return Object.keys(headers).length ? new Response(null, { status: 204, headers }) : new Response(null, { status: 403, headers: securityHeaders() });
      }
    }

    if (request.method === "GET" && url.pathname === "/health") {
      const ready = await databaseReady(env);
      return json(request, env, {
        ok: true,
        application: TOKEN_APP,
        protocol: CONTROL_PROTOCOL,
        independentRuntime: true,
        controlMode: "device-control-v3",
        databaseReady: ready,
        appOriginConfigured: Boolean(configuredOrigin(env.BAUMAN_APP_ORIGIN)),
        checkedAt: Date.now(),
      }, 200, "none");
    }

    if (url.pathname.startsWith("/api/device/")) return publicDeviceRoute(request, env, url);
    if (url.pathname.startsWith("/api/control/")) return controlRoute(request, env, url);
    return json(request, env, { ok: false, code: "NOT_FOUND" }, 404, "none");
  },
} satisfies ExportedHandler<Env>;
