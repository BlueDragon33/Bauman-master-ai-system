interface Env {
  BAUMAN_CONTROL_SERVICE_SECRET?: string;
  APPLICATION_MANAGEMENT_ORIGIN?: string;
  BAUMAN_RUNTIME_ORIGIN?: string;
  DEVICE_REGISTRY: DurableObjectNamespace;
}

type Role = "viewer" | "reviewer" | "publisher" | "owner";
type DeviceStatus = "pending" | "approved" | "blocked";

type Identity = {
  actor: string;
  role: Role;
  controlDeviceId: string | null;
};

type DeviceRecord = {
  deviceId: string;
  deviceCode: string;
  publicKey: JsonWebKey;
  email: string | null;
  displayName: string | null;
  deviceType: "desktop" | "tablet" | "phone" | "unknown";
  status: DeviceStatus;
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string;
  approvedAt: string | null;
  blockedAt: string | null;
};

type ChallengeRecord = { value: string; expiresAt: number };
type AuditRecord = { id: string; actor: string; action: string; target: string; createdAt: string; detail: Record<string, unknown> };

const TOKEN_ISSUER = "application-management";
const TOKEN_AUDIENCE = "bauman-control";
const TOKEN_APP = "bauman-master-ai";

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

const READINESS = {
  runtime: "available",
  subclientInventory: "available",
  readOnlyControlApi: "available",
  deviceRegistry: "available",
  deviceGateway: "available",
  auditApi: "available",
  contentReviewApi: "missing",
} as const;

function base64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(value) || value.length > 4096) throw new Error("INVALID_BASE64URL");
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

async function digestBytes(value: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

async function digestHex(value: string) {
  return Array.from(await digestBytes(value), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function secureEqual(left: string, right: string) {
  const [a, b] = await Promise.all([digestBytes(left), digestBytes(right)]);
  let difference = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) difference |= (a[index] ?? 0) ^ (b[index] ?? 0);
  return difference === 0;
}

async function signature(secret: string, value: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))));
}

function validPublicKey(value: unknown): value is JsonWebKey {
  if (!value || typeof value !== "object") return false;
  const key = value as JsonWebKey;
  return key.kty === "EC" && key.crv === "P-256" && typeof key.x === "string" && typeof key.y === "string";
}

async function deviceIdentity(publicKey: JsonWebKey) {
  const digest = await digestHex(`${publicKey.kty}.${publicKey.crv}.${publicKey.x}.${publicKey.y}`);
  return {
    deviceId: digest,
    deviceCode: `BM-${digest.slice(0, 4).toUpperCase()}-${digest.slice(4, 8).toUpperCase()}-${digest.slice(8, 12).toUpperCase()}`,
  };
}

function cleanText(value: unknown, max = 160) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanDeviceType(value: unknown): DeviceRecord["deviceType"] {
  return value === "desktop" || value === "tablet" || value === "phone" ? value : "unknown";
}

async function authenticate(request: Request, env: Env): Promise<Identity> {
  const secret = env.BAUMAN_CONTROL_SERVICE_SECRET ?? "";
  const authorization = request.headers.get("authorization") ?? "";
  const supplied = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (secret.length < 32 || supplied.length < 32) throw new Error("FORBIDDEN");

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
  if (version !== "v1" || !encoded || !suppliedSignature || extra) throw new Error("FORBIDDEN");
  if (!(await secureEqual(await signature(secret, `${version}.${encoded}`), suppliedSignature))) throw new Error("FORBIDDEN");

  const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encoded))) as Record<string, unknown>;
  const actor = typeof payload.actor === "string" ? payload.actor.trim().toLowerCase().slice(0, 160) : "";
  const suppliedRole = typeof payload.role === "string" ? payload.role : "viewer";
  const role = (["viewer", "reviewer", "publisher", "owner"].includes(suppliedRole) ? suppliedRole : "viewer") as Role;
  const expiresAt = typeof payload.exp === "number" ? payload.exp : 0;
  const controlDeviceId = typeof payload.controlDeviceId === "string" && /^[a-f0-9]{64}$/.test(payload.controlDeviceId) ? payload.controlDeviceId : null;
  if (payload.iss !== TOKEN_ISSUER || payload.aud !== TOKEN_AUDIENCE || payload.app !== TOKEN_APP || !actor.includes("@") || expiresAt <= Date.now() || expiresAt > Date.now() + 10 * 60 * 1000) {
    throw new Error("FORBIDDEN");
  }
  return { actor, role, controlDeviceId };
}

function allowedCorsOrigin(request: Request, env: Env) {
  const origin = request.headers.get("origin") ?? "";
  const admin = (env.APPLICATION_MANAGEMENT_ORIGIN ?? "").replace(/\/$/, "");
  const runtime = (env.BAUMAN_RUNTIME_ORIGIN ?? "").replace(/\/$/, "");
  if (origin && origin === admin) return admin;
  if (origin && origin === runtime) return runtime;
  return "";
}

function cors(request: Request, env: Env) {
  const origin = allowedCorsOrigin(request, env);
  return origin ? {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "authorization, content-type, x-control-actor, x-control-role, x-control-device",
    "access-control-max-age": "600",
    vary: "Origin",
  } : {};
}

function json(request: Request, env: Env, data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "cache-control": "no-store, private",
      "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
      "x-content-type-options": "nosniff",
      ...cors(request, env),
    },
  });
}

function registry(env: Env) {
  return env.DEVICE_REGISTRY.get(env.DEVICE_REGISTRY.idFromName("primary"));
}

async function registryJson<T>(env: Env, path: string, init?: RequestInit) {
  const response = await registry(env).fetch(`https://registry.internal${path}`, init);
  const data = await response.json() as T;
  if (!response.ok) throw new Error("REGISTRY_FAILED");
  return data;
}

async function verifyDeviceProof(record: DeviceRecord, challenge: ChallengeRecord, signatureValue: string) {
  const publicKey = await crypto.subtle.importKey("jwk", record.publicKey, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
  return crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, publicKey, fromBase64Url(signatureValue), new TextEncoder().encode(`bauman-device:${record.deviceId}:${challenge.value}`));
}

export class DeviceRegistry {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const body = request.method === "POST" ? await request.json().catch(() => ({})) as Record<string, unknown> : {};

    if (request.method === "POST" && url.pathname === "/register") {
      if (!validPublicKey(body.publicKey)) return Response.json({ error: "INVALID_PUBLIC_KEY" }, { status: 400 });
      const identity = await deviceIdentity(body.publicKey);
      const key = `device:${identity.deviceId}`;
      const current = await this.state.storage.get<DeviceRecord>(key);
      const now = new Date().toISOString();
      const next: DeviceRecord = current ? {
        ...current,
        publicKey: body.publicKey,
        email: cleanText(body.email) || current.email,
        displayName: cleanText(body.displayName, 100) || current.displayName,
        deviceType: cleanDeviceType(body.deviceType) === "unknown" ? current.deviceType : cleanDeviceType(body.deviceType),
        updatedAt: now,
        lastSeenAt: now,
      } : {
        ...identity,
        publicKey: body.publicKey,
        email: cleanText(body.email) || null,
        displayName: cleanText(body.displayName, 100) || null,
        deviceType: cleanDeviceType(body.deviceType),
        status: "pending",
        createdAt: now,
        updatedAt: now,
        lastSeenAt: now,
        approvedAt: null,
        blockedAt: null,
      };
      await this.state.storage.put(key, next);
      return Response.json({ device: next });
    }

    if (request.method === "POST" && url.pathname === "/challenge") {
      const deviceId = cleanText(body.deviceId, 64).toLowerCase();
      const device = await this.state.storage.get<DeviceRecord>(`device:${deviceId}`);
      if (!device) return Response.json({ error: "DEVICE_NOT_FOUND" }, { status: 404 });
      const challenge: ChallengeRecord = { value: base64Url(crypto.getRandomValues(new Uint8Array(24))), expiresAt: Date.now() + 120_000 };
      await this.state.storage.put(`challenge:${deviceId}`, challenge, { expirationTtl: 180 });
      return Response.json({ device, challenge });
    }

    if (request.method === "POST" && url.pathname === "/consume-challenge") {
      const deviceId = cleanText(body.deviceId, 64).toLowerCase();
      const challenge = await this.state.storage.get<ChallengeRecord>(`challenge:${deviceId}`);
      if (!challenge) return Response.json({ error: "CHALLENGE_NOT_FOUND" }, { status: 404 });
      await this.state.storage.delete(`challenge:${deviceId}`);
      return Response.json({ challenge });
    }

    if (request.method === "POST" && url.pathname === "/touch") {
      const deviceId = cleanText(body.deviceId, 64).toLowerCase();
      const key = `device:${deviceId}`;
      const device = await this.state.storage.get<DeviceRecord>(key);
      if (!device) return Response.json({ error: "DEVICE_NOT_FOUND" }, { status: 404 });
      const next = { ...device, lastSeenAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      await this.state.storage.put(key, next);
      return Response.json({ device: next });
    }

    if (request.method === "GET" && url.pathname === "/devices") {
      const entries = await this.state.storage.list<DeviceRecord>({ prefix: "device:" });
      const devices = [...entries.values()].sort((a, b) => {
        const statusOrder = { pending: 0, approved: 1, blocked: 2 } as const;
        return statusOrder[a.status] - statusOrder[b.status] || Date.parse(b.lastSeenAt) - Date.parse(a.lastSeenAt);
      });
      return Response.json({ devices });
    }

    if (request.method === "POST" && url.pathname === "/manage") {
      const deviceId = cleanText(body.deviceId, 64).toLowerCase();
      const action = cleanText(body.action, 32);
      const key = `device:${deviceId}`;
      const current = await this.state.storage.get<DeviceRecord>(key);
      if (!current) return Response.json({ error: "DEVICE_NOT_FOUND" }, { status: 404 });
      const now = new Date().toISOString();
      let status: DeviceStatus;
      if (action === "approve") status = "approved";
      else if (action === "reject" || action === "block") status = "blocked";
      else if (action === "restore") status = "pending";
      else return Response.json({ error: "INVALID_ACTION" }, { status: 400 });
      const next: DeviceRecord = {
        ...current,
        status,
        updatedAt: now,
        approvedAt: status === "approved" ? now : current.approvedAt,
        blockedAt: status === "blocked" ? now : null,
      };
      await this.state.storage.put(key, next);
      const audit: AuditRecord = {
        id: crypto.randomUUID(),
        actor: cleanText(body.actor) || "system",
        action: `device_${action}`,
        target: deviceId,
        createdAt: now,
        detail: { deviceCode: current.deviceCode },
      };
      await this.state.storage.put(`audit:${Date.now().toString().padStart(16, "0")}:${audit.id}`, audit);
      const entries = await this.state.storage.list<DeviceRecord>({ prefix: "device:" });
      return Response.json({ device: next, devices: [...entries.values()] });
    }

    if (request.method === "GET" && url.pathname === "/audit") {
      const entries = await this.state.storage.list<AuditRecord>({ prefix: "audit:", reverse: true, limit: 100 });
      return Response.json({ audit: [...entries.values()] });
    }

    return Response.json({ error: "NOT_FOUND" }, { status: 404 });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      const headers = cors(request, env);
      return Object.keys(headers).length ? new Response(null, { status: 204, headers }) : new Response(null, { status: 403 });
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return json(request, env, {
        ok: true,
        application: "bauman-master-ai",
        protocol: "bauman-control-v1",
        independentRuntime: true,
        controlMode: "device-review",
        checkedAt: Date.now(),
      });
    }

    if (request.method === "POST" && url.pathname === "/api/device/register") {
      const body = await request.json().catch(() => ({})) as Record<string, unknown>;
      if (!validPublicKey(body.publicKey)) return json(request, env, { ok: false, code: "INVALID_PUBLIC_KEY" }, 400);
      const data = await registryJson<{ device: DeviceRecord }>(env, "/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      return json(request, env, { ok: true, device: data.device });
    }

    if (request.method === "POST" && url.pathname === "/api/device/challenge") {
      const body = await request.json().catch(() => ({})) as Record<string, unknown>;
      const data = await registryJson<{ device: DeviceRecord; challenge: ChallengeRecord }>(env, "/challenge", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      return json(request, env, { ok: true, deviceId: data.device.deviceId, challenge: data.challenge.value, expiresAt: data.challenge.expiresAt });
    }

    if (request.method === "POST" && url.pathname === "/api/device/prove") {
      const body = await request.json().catch(() => ({})) as Record<string, unknown>;
      const deviceId = cleanText(body.deviceId, 64).toLowerCase();
      const signatureValue = cleanText(body.signature, 4096);
      const challengeValue = cleanText(body.challenge, 512);
      const devices = await registryJson<{ devices: DeviceRecord[] }>(env, "/devices");
      const device = devices.devices.find((item) => item.deviceId === deviceId);
      if (!device) return json(request, env, { ok: false, code: "DEVICE_NOT_FOUND" }, 404);
      const consumed = await registryJson<{ challenge: ChallengeRecord }>(env, "/consume-challenge", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ deviceId }) });
      if (consumed.challenge.expiresAt <= Date.now() || consumed.challenge.value !== challengeValue) return json(request, env, { ok: false, code: "CHALLENGE_EXPIRED" }, 401);
      if (!(await verifyDeviceProof(device, consumed.challenge, signatureValue))) return json(request, env, { ok: false, code: "DEVICE_PROOF_INVALID" }, 401);
      const touched = await registryJson<{ device: DeviceRecord }>(env, "/touch", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ deviceId }) });
      return json(request, env, { ok: true, device: touched.device, accessGranted: touched.device.status === "approved" });
    }

    if (!url.pathname.startsWith("/api/control/")) return json(request, env, { ok: false, code: "NOT_FOUND" }, 404);

    try {
      const identity = await authenticate(request, env);
      const deviceData = await registryJson<{ devices: DeviceRecord[] }>(env, "/devices");
      const counts = {
        devices: deviceData.devices.length,
        pendingDevices: deviceData.devices.filter((item) => item.status === "pending").length,
        approvedDevices: deviceData.devices.filter((item) => item.status === "approved").length,
        blockedDevices: deviceData.devices.filter((item) => item.status === "blocked").length,
        activeSessions: deviceData.devices.filter((item) => item.status === "approved" && Date.now() - Date.parse(item.lastSeenAt) <= 150_000).length,
      };

      if (request.method === "GET" && url.pathname === "/api/control/status") {
        return json(request, env, {
          ok: true,
          application: "bauman-master-ai",
          protocol: "bauman-control-v1",
          actorRole: identity.role,
          ownership: {
            runtime: "Bauman-master-ai-system",
            subclients: "Bauman-master-ai-system",
            centralRole: "policy-and-remote-control",
          },
          readiness: READINESS,
          capabilities: ["control-read-v1", "subclient-inventory-v1", "device-review-v1", "p256-device-gate-v1", "audit-v1"],
          counts: {
            subclients: SUBCLIENTS.length,
            independentSites: SUBCLIENTS.filter((item) => item.state === "independent").length,
            modules: SUBCLIENTS.filter((item) => item.state === "module").length,
            ...counts,
          },
          checkedAt: Date.now(),
        });
      }

      if (request.method === "GET" && url.pathname === "/api/control/subclients") {
        return json(request, env, { ok: true, application: "bauman-master-ai", subclients: SUBCLIENTS });
      }

      if (request.method === "GET" && url.pathname === "/api/control/devices") {
        return json(request, env, { ok: true, application: "bauman-master-ai", devices: deviceData.devices });
      }

      if (request.method === "POST" && url.pathname === "/api/control/devices") {
        if (identity.role !== "owner") return json(request, env, { ok: false, code: "OWNER_REQUIRED", error: "Chỉ chủ hệ thống được duyệt hoặc loại bỏ thiết bị Bauman." }, 403);
        const body = await request.json().catch(() => ({})) as Record<string, unknown>;
        const action = cleanText(body.action, 32);
        const deviceId = cleanText(body.deviceId, 64).toLowerCase();
        if (!deviceId || !["approve", "reject", "block", "restore"].includes(action)) return json(request, env, { ok: false, code: "INVALID_DEVICE_ACTION" }, 400);
        const data = await registryJson<{ device: DeviceRecord; devices: DeviceRecord[] }>(env, "/manage", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, deviceId, actor: identity.actor }) });
        return json(request, env, { ok: true, application: "bauman-master-ai", device: data.device, devices: data.devices });
      }

      if (request.method === "GET" && url.pathname === "/api/control/audit") {
        const data = await registryJson<{ audit: AuditRecord[] }>(env, "/audit");
        return json(request, env, { ok: true, application: "bauman-master-ai", audit: data.audit });
      }

      return json(request, env, { ok: false, code: "NOT_FOUND" }, 404);
    } catch {
      return json(request, env, { ok: false, code: "CONTROL_TICKET_FORBIDDEN" }, 403);
    }
  },
} satisfies ExportedHandler<Env>;
