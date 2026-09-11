import controlService from "./index";

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

export default {
  async fetch(request: Request, env: PreviewEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/__deployment") {
      return Response.json({
        ok: true,
        application: "bauman-master-ai",
        runtime: "control-service",
        channel: env.BAUMAN_DEPLOYMENT_CHANNEL ?? "unknown",
        revision: env.BAUMAN_BUILD_REVISION ?? "unknown",
        databaseReady: await databaseReady(env),
        applicationManagementOriginConfigured: Boolean(env.APPLICATION_MANAGEMENT_ORIGIN),
        appOriginConfigured: Boolean(env.BAUMAN_APP_ORIGIN),
        checkedAt: Date.now(),
      }, {
        headers: {
          "cache-control": "no-store, private",
          "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
          "x-content-type-options": "nosniff",
        },
      });
    }

    return controlService.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<PreviewEnv>;
