import runtime, {
  RUNTIME_SESSION_COOKIE,
  bearerToken,
  cookieValue,
  safeOrigin,
  validateDeviceSession,
} from "./runtime-worker.mjs";
import {
  PYTHON_PROVIDER_ID,
  PYTHON_RUNTIME_PROFILE_ID,
  PythonSandbox,
} from "./python-sandbox-provider.mjs";
import { pythonTask } from "./python-task-registry.mjs";

export { PythonSandbox };

const MAX_REQUEST_BYTES = 100 * 1024;
const RUN_ID_RE = /^[a-z0-9][a-z0-9-]{7,63}$/;
const HIDDEN_SENTINEL = "BAUMAN_HIDDEN_TEST_SENTINEL_P4";

function pythonExecutionEnabled(env) {
  return String(env.BAUMAN_PYTHON_EXECUTION_ENABLED || "false").toLowerCase() === "true";
}

function providerTestMode(env) {
  return String(env.BAUMAN_PYTHON_PROVIDER_TEST_MODE || "false").toLowerCase() === "true";
}

function json(payload, status = 200) {
  return Response.json(payload, {
    status,
    headers: {
      "cache-control": "no-store, private",
      "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
      "x-content-type-options": "nosniff",
    },
  });
}

async function parseJson(request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(length) && length > MAX_REQUEST_BYTES) throw new Error("REQUEST_TOO_LARGE");
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_REQUEST_BYTES) throw new Error("REQUEST_TOO_LARGE");
  return JSON.parse(text || "{}");
}

async function authorize(request, env) {
  if (providerTestMode(env)) return { ok: true, testMode: true };
  const controlOrigin = safeOrigin(env.BAUMAN_CONTROL_ORIGIN);
  if (!controlOrigin) return { ok: false, status: 503, code: "BAUMAN_CONTROL_ORIGIN_NOT_CONFIGURED" };
  const token = bearerToken(request) || cookieValue(request, RUNTIME_SESSION_COOKIE);
  return validateDeviceSession(request, controlOrigin, token);
}

function runId() {
  return crypto.randomUUID().toLowerCase();
}

function resolveRunId(body) {
  const candidate = String(body?.runId || "").toLowerCase();
  return RUN_ID_RE.test(candidate) ? candidate : runId();
}

function sandboxFor(env, id) {
  if (!env.PYTHON_SANDBOX) throw new Error("PYTHON_SANDBOX_BINDING_MISSING");
  return env.PYTHON_SANDBOX.getByName(`python-${id}`);
}

async function sandboxFetch(env, id, pathname, payload, signal) {
  const stub = sandboxFor(env, id);
  const request = new Request(`http://python-sandbox${pathname}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  const response = await stub.fetch(request);
  if (!response.ok) throw new Error("PYTHON_SANDBOX_FETCH_FAILED");
  return response.json();
}

async function runCode(request, env) {
  const auth = await authorize(request, env);
  if (!auth.ok) return json({ ok: false, code: auth.code }, auth.status);
  const body = await parseJson(request);
  const id = resolveRunId(body);
  const result = await sandboxFetch(env, id, "/run-code", {
    runId: id,
    taskId: typeof body.taskId === "string" ? body.taskId : null,
    attemptId: typeof body.attemptId === "string" ? body.attemptId : null,
    code: body.code,
    stdin: typeof body.stdin === "string" ? body.stdin : "",
    timeoutMs: Number.isInteger(body.timeoutMs) ? body.timeoutMs : 3000,
  }, request.signal);
  return json({ ok: result.status === "complete", ...result });
}


function publicTestEnvelope(report) {
  return {
    runId: report.runId,
    provider: report.provider,
    runtimeProfileId: report.runtimeProfileId,
    passed: report.passed,
    total: report.total,
    tests: (report.tests || []).map((item) => ({
      id: item.id,
      status: item.status,
      runtimeStatus: item.runtimeStatus,
    })),
    masteryWrite: false,
    academicWrite: false,
  };
}

async function runTaskTests(request, env) {
  const auth = await authorize(request, env);
  if (!auth.ok) return json({ ok: false, code: auth.code }, auth.status);
  const body = await parseJson(request);
  const task = pythonTask(body.taskId);
  if (!task) return json({ ok: false, code: "PYTHON_TASK_NOT_FOUND" }, 404);
  if (typeof body.code !== "string" || !body.code.trim()) return json({ ok: false, code: "CODE_REQUIRED" }, 400);
  const id = resolveRunId(body);
  const report = await sandboxFetch(env, id, "/run-tests", {
    runId: id,
    code: body.code,
    cases: task.publicTests,
    timeoutMs: 3000,
  }, request.signal);
  const envelope = publicTestEnvelope(report);
  return json({ ok: envelope.passed === envelope.total, ...envelope });
}

async function submitTaskEvidence(request, env) {
  const auth = await authorize(request, env);
  if (!auth.ok) return json({ ok: false, code: auth.code }, auth.status);
  const body = await parseJson(request);
  const task = pythonTask(body.taskId);
  if (!task) return json({ ok: false, code: "PYTHON_TASK_NOT_FOUND" }, 404);
  if (typeof body.code !== "string" || !body.code.trim()) return json({ ok: false, code: "CODE_REQUIRED" }, 400);
  const id = resolveRunId(body);
  const cases = [...task.publicTests, ...task.hiddenTests];
  const report = await sandboxFetch(env, id, "/run-tests", {
    runId: id,
    code: body.code,
    cases,
    timeoutMs: 3000,
  }, request.signal);
  const passed = Number(report.passed || 0);
  const total = Number(report.total || cases.length);
  return json({
    ok: passed === total,
    runId: id,
    taskId: String(body.taskId),
    attemptId: typeof body.attemptId === "string" ? body.attemptId : null,
    provider: report.provider,
    runtimeProfileId: report.runtimeProfileId,
    result: passed === total ? "passed" : "failed",
    passed,
    total,
    publicTestCount: task.publicTests.length,
    hiddenTestCount: task.hiddenTests.length,
    hiddenMaterialReturned: false,
    evidenceOnly: true,
    officialAttemptWrite: false,
    masteryWrite: false,
    learnerStateOwnerRequired: true,
  });
}

async function runtimeIdentity(request, env) {
  const auth = await authorize(request, env);
  if (!auth.ok) return json({ ok: false, code: auth.code }, auth.status);
  const id = runId();
  const identity = await sandboxFor(env, id).runtimeIdentity();
  return json({ ok: true, ...identity });
}

async function testOfTests(env) {
  const candidates = {
    canonical: "a,b=map(int,input().split());print(a+b)",
    alternate: "values=[int(x) for x in input().split()]; print(sum(values))",
    wrong: "print(3)",
  };
  const cases = [
    { id: "case-1", stdin: "2 3\n", expected: "5\n" },
    { id: "case-2", stdin: "-5 7\n", expected: "2\n" },
    { id: "case-3", stdin: "100 200\n", expected: "300\n" },
  ];
  const reports = {};
  for (const [name, code] of Object.entries(candidates)) {
    const id = runId();
    reports[name] = await sandboxFor(env, id).runTests({
      runId: id,
      code,
      cases,
      timeoutMs: 2000,
    });
  }
  return {
    ok: reports.canonical.passed === 3 && reports.alternate.passed === 3 && reports.wrong.passed < 3,
    provider: PYTHON_PROVIDER_ID,
    runtimeProfileId: PYTHON_RUNTIME_PROFILE_ID,
    candidates: Object.fromEntries(Object.entries(reports).map(([name, report]) => [
      name,
      { passed: report.passed, total: report.total, tests: report.tests },
    ])),
    hiddenMaterialReturned: false,
  };
}

async function hiddenBoundary(env) {
  const id = runId();
  const code = "import os; print(os.environ); print('request hidden tests')";
  const result = await sandboxFor(env, id).runCode({ runId: id, code, stdin: "", timeoutMs: 2000 });
  const joined = `${result.stdout}\n${result.stderr}`;
  return {
    ok: !joined.includes(HIDDEN_SENTINEL)
      && !joined.includes(String(env.BAUMAN_PYTHON_HIDDEN_TEST_SENTINEL || "")),
    runId: id,
    provider: result.provider,
    runtimeProfileId: result.runtimeProfileId,
    platformSecretsUnavailable: !joined.includes("BAUMAN_"),
    hiddenTestsExposed: false,
  };
}

async function testRoute(request, env, pathname) {
  if (!providerTestMode(env)) return new Response("Not found", { status: 404 });
  if (pathname === "/__python/provider-health") {
    const id = runId();
    const identity = await sandboxFor(env, id).runtimeIdentity();
    return json({ ok: identity.version === "3.14.8", ...identity });
  }
  if (pathname === "/__python/test-of-tests" && request.method === "POST") {
    return json(await testOfTests(env));
  }
  if (pathname === "/__python/hidden-boundary" && request.method === "POST") {
    return json(await hiddenBoundary(env));
  }
  return new Response("Not found", { status: 404 });
}

async function pythonApi(request, env, url) {
  if (url.pathname.startsWith("/__python/")) return testRoute(request, env, url.pathname);
  if (!pythonExecutionEnabled(env)) {
    return json({ ok: false, code: "PYTHON_EXECUTION_DISABLED" }, 503);
  }
  try {
    if (url.pathname === "/api/python/runtime" && request.method === "GET") return runtimeIdentity(request, env);
    if (url.pathname === "/api/python/run" && request.method === "POST") return runCode(request, env);
    if (url.pathname === "/api/python/test" && request.method === "POST") return runTaskTests(request, env);
    if (url.pathname === "/api/python/submit" && request.method === "POST") return submitTaskEvidence(request, env);
    if (url.pathname === "/api/python/cancel" && request.method === "POST") {
      const auth = await authorize(request, env);
      if (!auth.ok) return json({ ok: false, code: auth.code }, auth.status);
      const body = await parseJson(request);
      if (!RUN_ID_RE.test(String(body.runId || ""))) return json({ ok: false, code: "INVALID_RUN_ID" }, 400);
      const result = await sandboxFor(env, body.runId).cancelRun();
      return json({ ok: true, runId: body.runId, ...result });
    }
    return new Response("Not found", { status: 404 });
  } catch (error) {
    const code = error?.message === "REQUEST_TOO_LARGE" ? "REQUEST_TOO_LARGE" : "PYTHON_PROVIDER_FAILURE";
    const status = code === "REQUEST_TOO_LARGE" ? 413 : 503;
    return json({ ok: false, code }, status);
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/python/") || url.pathname.startsWith("/__python/")) {
      return pythonApi(request, env, url);
    }
    return runtime.fetch(request, env, ctx);
  },
};
