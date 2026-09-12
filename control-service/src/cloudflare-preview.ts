import controlService from "./automation-contract";

interface PreviewEnv {
  BAUMAN_CONTROL_SERVICE_SECRET?: string;
  APPLICATION_MANAGEMENT_ORIGIN?: string;
  BAUMAN_APP_ORIGIN?: string;
  BAUMAN_DEPLOYMENT_CHANNEL?: string;
  BAUMAN_BUILD_REVISION?: string;
  DB?: D1Database;
}

async function databaseReady(env: PreviewEnv) {
  if (!env.DB) return false;
  try {
    await env.DB.prepare("SELECT device_id FROM bm_devices LIMIT 1").first();
    await env.DB.prepare("SELECT command_id FROM bm_control_commands LIMIT 1").first();
    return true;
  } catch {
    return false;
  }
}

function deployment(env: PreviewEnv, ready: boolean) {
  return {
    channel: env.BAUMAN_DEPLOYMENT_CHANNEL ?? "unknown",
    revision: env.BAUMAN_BUILD_REVISION ?? "unknown",
    databaseReady: ready,
    applicationManagementOriginConfigured: Boolean(env.APPLICATION_MANAGEMENT_ORIGIN),
    appOriginConfigured: Boolean(env.BAUMAN_APP_ORIGIN),
  };
}

export default {
  async fetch(request: Request, env: PreviewEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/__deployment") {
      const ready = await databaseReady(env);
      return Response.json({
        ok: true,
        application: "bauman-master-ai",
        runtime: "control-service",
        ...deployment(env, ready),
        checkedAt: Date.now(),
      }, {
        headers: {
          "cache-control": "no-store, private",
          "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
          "x-content-type-options": "nosniff",
        },
      });
    }

    const response = await controlService.fetch(request, env, ctx);
    if (request.method !== "GET" || url.pathname !== "/api/control/status" || !response.ok) return response;

    const payload = await response.json() as Record<string, unknown>;
    const ready = await databaseReady(env);
    const appOriginReady = Boolean(env.BAUMAN_APP_ORIGIN);
    const gateAvailable = ready && appOriginReady;
    const readiness = payload.readiness && typeof payload.readiness === "object"
      ? payload.readiness as Record<string, unknown>
      : {};
    const capabilities = payload.capabilities && typeof payload.capabilities === "object"
      ? payload.capabilities as Record<string, unknown>
      : {};

    const headers = new Headers(response.headers);
    headers.set("cache-control", "no-store, private");
    return Response.json({
      ...payload,
      readiness: {
        ...readiness,
        accessGate: gateAvailable ? "available" : "configuration-required",
      },
      capabilities: {
        ...capabilities,
        learningAccessGate: gateAvailable,
      },
      deployment: deployment(env, ready),
    }, { status: response.status, headers });
  },
} satisfies ExportedHandler<PreviewEnv>;
