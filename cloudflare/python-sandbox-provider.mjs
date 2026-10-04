import { DurableObject } from "cloudflare:workers";

const RUNTIME_PROFILE_ID = "cpython-3.14.8-stdlib-v1";
const PROVIDER_ID = "cloudflare-container-durable-object-v1";
const INACTIVITY_TIMEOUT_MS = 60_000;
const MAX_RUNNER_OUTPUT_BYTES = 192 * 1024;

function sleep(ms) {
  if (globalThis.scheduler?.wait) return scheduler.wait(ms);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decode(arrayBuffer) {
  return new TextDecoder().decode(arrayBuffer);
}

function normalizeRunnerResult(result, identity) {
  return {
    ...result,
    provider: PROVIDER_ID,
    runtimeProfileId: RUNTIME_PROFILE_ID,
    runtime: identity,
    isolation: "fresh-container-per-run",
    networkPolicy: "deny",
  };
}

export class PythonSandbox extends DurableObject {
  starting;

  async ensureRunning() {
    const container = this.ctx.container;
    if (!container) throw new Error("PYTHON_CONTAINER_BINDING_MISSING");
    if (!container.running) {
      container.start({
        image: container.images.python,
        instance: "lite",
        enableInternet: false,
      });
    }
    await container.setInactivityTimeout(INACTIVITY_TIMEOUT_MS);

    this.starting ??= (async () => {
      let lastError;
      for (let attempt = 0; attempt < 100; attempt += 1) {
        try {
          const process = await container.exec(["python3", "--version"]);
          const output = await process.output();
          if (output.exitCode === 0) return;
          lastError = new Error(`python readiness exited ${output.exitCode}`);
        } catch (error) {
          lastError = error;
        }
        await sleep(100);
      }
      throw lastError || new Error("PYTHON_CONTAINER_NOT_READY");
    })().finally(() => {
      this.starting = undefined;
    });
    await this.starting;
    return container;
  }

  async runtimeIdentity() {
    const container = await this.ensureRunning();
    try {
      const process = await container.exec([
        "python3",
        "-I",
        "-c",
        "import json,platform,sys; print(json.dumps({'implementation':platform.python_implementation(),'version':platform.python_version(),'hexversion':sys.hexversion}))",
      ]);
      const output = await process.output();
      if (output.exitCode !== 0) throw new Error("PYTHON_RUNTIME_IDENTITY_FAILED");
      const identity = JSON.parse(decode(output.stdout).trim());
      return {
        ...identity,
        runtimeProfileId: RUNTIME_PROFILE_ID,
        provider: PROVIDER_ID,
      };
    } finally {
      await container.destroy("runtime identity complete");
    }
  }

  async execute(payload, signal = null) {
    const container = await this.ensureRunning();
    let aborted = Boolean(signal?.aborted);
    const abort = () => {
      aborted = true;
      try {
        const pending = container.destroy("learner request aborted");
        if (pending?.catch) pending.catch(() => {});
      } catch {}
    };
    if (signal && !signal.aborted) signal.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
    try {
      const runnerPayload = JSON.stringify({
        code: payload.code,
        stdin: payload.stdin || "",
        timeoutMs: payload.timeoutMs || 3000,
      });
      const process = await container.exec(["python3", "-I", "/opt/bauman/runner.py"], {
        stdin: new Response(runnerPayload).body,
        cwd: "/workspace",
      });
      const output = await process.output();
      if (aborted || signal?.aborted) {
        return normalizeRunnerResult({
          ok: false,
          status: "canceled",
          stdout: "",
          stderr: "",
          exitCode: null,
          durationMs: null,
          truncated: { stdout: false, stderr: false },
        }, { implementation: "CPython", version: "3.14.8" });
      }
      if (output.stdout.byteLength > MAX_RUNNER_OUTPUT_BYTES || output.stderr.byteLength > 8192) {
        throw new Error("PYTHON_RUNNER_ENVELOPE_TOO_LARGE");
      }
      if (output.exitCode !== 0) throw new Error("PYTHON_RUNNER_EXITED_NONZERO");
      const result = JSON.parse(decode(output.stdout));
      return normalizeRunnerResult(result, {
        implementation: "CPython",
        version: "3.14.8",
      });
    } catch (error) {
      if (aborted || signal?.aborted) {
        return normalizeRunnerResult({
          ok: false,
          status: "canceled",
          stdout: "",
          stderr: "",
          exitCode: null,
          durationMs: null,
          truncated: { stdout: false, stderr: false },
        }, { implementation: "CPython", version: "3.14.8" });
      }
      throw error;
    } finally {
      if (signal) signal.removeEventListener("abort", abort);
      try { await container.destroy("fresh run cleanup"); } catch {}
    }
  }

  async runCode(request, signal = null) {
    return {
      runId: request.runId,
      taskId: request.taskId || null,
      attemptId: request.attemptId || null,
      ...(await this.execute(request, signal)),
    };
  }

  async runTests(request, signal = null) {
    const results = [];
    for (const [index, testCase] of request.cases.entries()) {
      if (signal?.aborted) break;
      const result = await this.execute({
        code: request.code,
        stdin: testCase.stdin,
        timeoutMs: request.timeoutMs,
      }, signal);
      const actual = String(result.stdout || "").replace(/\r\n/g, "\n").trimEnd();
      const expected = String(testCase.expected || "").replace(/\r\n/g, "\n").trimEnd();
      results.push({
        id: testCase.id || `case-${index + 1}`,
        status: result.status === "complete" && actual === expected ? "passed" : "failed",
        runtimeStatus: result.status,
      });
    }
    return {
      runId: request.runId,
      provider: PROVIDER_ID,
      runtimeProfileId: RUNTIME_PROFILE_ID,
      tests: results,
      passed: results.filter((item) => item.status === "passed").length,
      total: results.length,
    };
  }

  async cancelRun() {
    const container = this.ctx.container;
    if (container?.running) await container.destroy("run canceled");
    return { canceled: true, provider: PROVIDER_ID };
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
    const body = await request.json();
    if (url.pathname === "/run-code") {
      return Response.json(await this.runCode(body, request.signal));
    }
    if (url.pathname === "/run-tests") {
      return Response.json(await this.runTests(body, request.signal));
    }
    return new Response("Not found", { status: 404 });
  }
}

export const PYTHON_RUNTIME_PROFILE_ID = RUNTIME_PROFILE_ID;
export const PYTHON_PROVIDER_ID = PROVIDER_ID;
