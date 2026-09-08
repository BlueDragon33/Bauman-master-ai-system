interface Env {
  BAUMAN_CONTROL_SERVICE_SECRET?: string;
  APPLICATION_MANAGEMENT_ORIGIN?: string;
}

type Role = "viewer" | "reviewer" | "publisher" | "owner";

type Identity = {
  actor: string;
  role: Role;
  controlDeviceId: string | null;
};

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
  deviceRegistry: "missing",
  deviceGateway: "missing",
  auditApi: "missing",
  contentReviewApi: "missing",
} as const;

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

function cors(request: Request, env: Env) {
  const configured = (env.APPLICATION_MANAGEMENT_ORIGIN ?? "").replace(/\/$/, "");
  const origin = request.headers.get("origin") ?? "";
  return configured && origin === configured ? {
    "access-control-allow-origin": configured,
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "authorization, content-type",
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
        controlMode: "read-only-readiness",
        checkedAt: Date.now(),
      });
    }

    if (request.method !== "GET" || !url.pathname.startsWith("/api/control/")) {
      return json(request, env, { ok: false, code: "NOT_FOUND" }, 404);
    }

    try {
      const identity = await authenticate(request, env);
      if (url.pathname === "/api/control/status") {
        return json(request, env, {
          ok: true,
          application: "bauman-master-ai",
          protocol: "bauman-control-v1",
          actorRole: identity.role,
          ownership: {
            runtime: "Bauman-master-ai-system",
            subclients: "Bauman-master-ai-system",
            centralRole: "policy-and-readiness-only",
          },
          readiness: READINESS,
          counts: {
            subclients: SUBCLIENTS.length,
            independentSites: SUBCLIENTS.filter((item) => item.state === "independent").length,
            modules: SUBCLIENTS.filter((item) => item.state === "module").length,
          },
          checkedAt: Date.now(),
        });
      }
      if (url.pathname === "/api/control/subclients") {
        return json(request, env, { ok: true, application: "bauman-master-ai", subclients: SUBCLIENTS });
      }
      return json(request, env, { ok: false, code: "NOT_FOUND" }, 404);
    } catch {
      return json(request, env, { ok: false, code: "CONTROL_TICKET_FORBIDDEN" }, 403);
    }
  },
} satisfies ExportedHandler<Env>;
