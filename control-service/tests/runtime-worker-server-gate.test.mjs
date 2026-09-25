import assert from "node:assert/strict";
import test from "node:test";
import runtimeWorker from "../../cloudflare/runtime-worker.mjs";

const CONTROL_ORIGIN = "https://control.example.test";
const RUNTIME_ORIGIN = "https://learn.example.test";

function request(path, init = {}) {
  return new Request(`${RUNTIME_ORIGIN}${path}`, init);
}

function env(assetHandler) {
  return {
    BAUMAN_CONTROL_ORIGIN: CONTROL_ORIGIN,
    BAUMAN_DEPLOYMENT_CHANNEL: "test",
    BAUMAN_BUILD_REVISION: "issue-28",
    ASSETS: { fetch: assetHandler },
  };
}

test("protected learning data fails closed without runtime device cookie", async () => {
  let assetReads = 0;
  const response = await runtimeWorker.fetch(
    request("/subjects/math/data/lessons.json"),
    env(async () => {
      assetReads += 1;
      return Response.json({ secret: true });
    }),
  );
  assert.equal(response.status, 401);
  assert.equal(assetReads, 0);
  assert.equal((await response.json()).code, "DEVICE_SESSION_REQUIRED");
});

test("approved device session may read protected learning data", async () => {
  const originalFetch = globalThis.fetch;
  let controlChecks = 0;
  let assetReads = 0;
  globalThis.fetch = async (input, init) => {
    controlChecks += 1;
    assert.equal(String(input), `${CONTROL_ORIGIN}/api/device/heartbeat`);
    assert.equal(init?.headers?.authorization, "Bearer bm1.abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN");
    assert.equal(init?.headers?.origin, RUNTIME_ORIGIN);
    return Response.json({ device: { status: "approved", deviceId: "abc" } });
  };
  try {
    const response = await runtimeWorker.fetch(
      request("/subjects/math/data/lessons.json", {
        headers: { cookie: "__Host-bauman_session=bm1.abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN" },
      }),
      env(async () => {
        assetReads += 1;
        return Response.json({ lessons: [1] });
      }),
    );
    assert.equal(response.status, 200);
    assert.equal(controlChecks, 1);
    assert.equal(assetReads, 1);
    assert.match(response.headers.get("cache-control") || "", /no-store/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("blocked device is denied before protected learning asset read", async () => {
  const originalFetch = globalThis.fetch;
  let assetReads = 0;
  globalThis.fetch = async () => Response.json(
    { ok: false, code: "DEVICE_BLOCKED" },
    { status: 403 },
  );
  try {
    const response = await runtimeWorker.fetch(
      request("/subjects/math/data/lessons.json", {
        headers: { cookie: "__Host-bauman_session=bm1.abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN" },
      }),
      env(async () => {
        assetReads += 1;
        return Response.json({ secret: true });
      }),
    );
    assert.equal(response.status, 403);
    assert.equal(assetReads, 0);
    assert.equal((await response.json()).code, "DEVICE_BLOCKED");
    assert.match(response.headers.get("set-cookie") || "", /Max-Age=0/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("runtime session exchange binds only an approved bm1 session", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ device: { status: "approved", deviceId: "abc" } });
  try {
    const response = await runtimeWorker.fetch(
      request("/api/runtime/session", {
        method: "POST",
        headers: { authorization: "Bearer bm1.abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN" },
      }),
      env(async () => new Response("unused")),
    );
    assert.equal(response.status, 200);
    assert.equal((await response.json()).ok, true);
    const cookie = response.headers.get("set-cookie") || "";
    assert.match(cookie, /__Host-bauman_session=/);
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /Secure/);
    assert.match(cookie, /SameSite=Strict/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});


test("runtime control-link probe reports same-account Control reachability", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    assert.equal(String(input), `${CONTROL_ORIGIN}/health`);
    return Response.json({ ok: true, application: "bauman-master-ai" });
  };
  try {
    const response = await runtimeWorker.fetch(
      request("/__control-link"),
      env(async () => new Response("unused")),
    );
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.ok, true);
    assert.equal(payload.controlReachable, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});


test("HTML runtime pages may be embedded only by the same Bauman origin", async () => {
  const response = await runtimeWorker.fetch(
    request("/subjects/russian/"),
    env(async () => new Response("<!doctype html><html><body>Russian</body></html>", {
      headers: { "content-type": "text/html; charset=utf-8" },
    })),
  );
  assert.equal(response.status, 200);
  const csp = response.headers.get("content-security-policy") || "";
  assert.match(csp, /frame-ancestors 'self'/);
  assert.doesNotMatch(csp, /frame-ancestors 'none'/);
});
