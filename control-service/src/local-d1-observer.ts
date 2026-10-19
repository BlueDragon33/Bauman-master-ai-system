// Per-Worker-isolate accounting for real D1 operations. This is NOT a global
// Cloudflare Worker quiescence barrier and NEVER grants shutdown authority.
type BackgroundReadback = () => Promise<boolean>;
type BackgroundOptions = { now?: () => number; timeoutMs?: number };

export function createLocalD1Observer(serviceId: string, options: BackgroundOptions = {}) {
  const now = options.now ?? Date.now;
  const timeoutMs = options.timeoutMs ?? 15000;
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120000 ||
      typeof now !== "function") throw new Error("D1_BACKGROUND_OBSERVER_CONFIG_INVALID");
  let activeRequests = 0;
  let activeD1Calls = 0;
  let completedD1Calls = 0;
  let failedD1Calls = 0;
  let completedBackgroundTasks = 0;
  let rejectedBackgroundTasks = 0;
  let timedOutBackgroundTasks = 0;
  let unverifiedBackgroundTasks = 0;
  let readbackReported = 0;
  let failedBackgroundReadbacks = 0;
  let rejectedRegistrations = 0;
  let nextTaskId = 0;
  const background = new Map<number, { deadline: number; expired: boolean }>();
  const preparedNative = new WeakMap<object, D1PreparedStatement>();

  async function observed<T>(invoke: () => Promise<T>): Promise<T> {
    activeD1Calls++;
    try {
      const result = await invoke();
      completedD1Calls++;
      return result;
    } catch (error) {
      failedD1Calls++;
      throw error;
    } finally {
      activeD1Calls--;
    }
  }

  function trackStatement(statement: D1PreparedStatement): D1PreparedStatement {
    const proxied = new Proxy(statement, {
      get(target, property) {
        if (property === "bind") {
          return (...values: unknown[]) =>
            trackStatement(Reflect.apply(Reflect.get(target, property), target, values));
        }
        const value = Reflect.get(target, property);
        if (typeof value !== "function") return value;
        if (["run", "first", "all", "raw"].includes(String(property))) {
          return (...args: unknown[]) =>
            observed(() => Reflect.apply(value, target, args) as Promise<unknown>);
        }
        return value.bind(target);
      },
    });
    preparedNative.set(proxied, statement);
    return proxied;
  }

  function trackDatabase(database: D1Database): D1Database {
    return new Proxy(database, {
      get(target, property) {
        if (property === "prepare") return (sql: string) => trackStatement(target.prepare(sql));
        if (property === "batch") {
          return (statements: D1PreparedStatement[]) =>
            observed(() => target.batch(statements.map(stmt => preparedNative.get(stmt) ?? stmt)));
        }
        if (property === "exec") return (sql: string) => observed(() => target.exec(sql));
        const value = Reflect.get(target, property);
        return typeof value === "function" ? value.bind(target) : value;
      },
    });
  }

  // A local per-isolate observer for tasks registered via this context only.
  // Rejected, timed-out, and readback-unverified attempts never grant stop.
  function observeWaitUntil(context: ExecutionContext, task: Promise<unknown>,
    readback?: BackgroundReadback): void {
    if (!context || typeof context.waitUntil !== "function" ||
        !task || typeof (task as Promise<unknown>).then !== "function" ||
        (readback !== undefined && typeof readback !== "function")) {
      rejectedRegistrations++;
      throw new Error("D1_BACKGROUND_REGISTRATION_INVALID");
    }
    const id = ++nextTaskId;
    background.set(id, { deadline: now() + timeoutMs, expired: false });
    const observedTask = Promise.resolve(task).then(async () => {
      if (!readback) { unverifiedBackgroundTasks++; return; }
      try {
        if ((await readback()) !== true)
          throw new Error("D1_BACKGROUND_READBACK_MISMATCH");
        // Caller-supplied readback is advisory, never an independent D1 barrier.
        readbackReported++;
      } catch (error) {
        failedBackgroundReadbacks++;
        throw error;
      }
    }, (error: unknown) => {
      rejectedBackgroundTasks++;
      throw error;
    }).finally(() => {
      const pending = background.get(id);
      // Even if no snapshot ran while pending, account for an overdue task.
      if (pending && !pending.expired && now() >= pending.deadline) {
        pending.expired = true;
        timedOutBackgroundTasks++;
      }
      background.delete(id);
      completedBackgroundTasks++;
    });
    // Retain rejection semantics for the runtime, suppress local unhandled noise.
    void observedTask.catch(() => {});
    try { context.waitUntil(observedTask); }
    catch (error) {
      rejectedRegistrations++;
      // The underlying write might still be running: permanent failure taint.
      throw error;
    }
  }

  function trackContext(context: ExecutionContext): ExecutionContext {
    return new Proxy(context, {
      get(target, property) {
        if (property === "waitUntil")
          return (task: Promise<unknown>) => observeWaitUntil(target, task);
        const value = Reflect.get(target, property);
        return typeof value === "function" ? value.bind(target) : value;
      },
    });
  }

  async function trackFetch<TEnv extends { DB?: D1Database }>(
    env: TEnv, work: (wrapped: TEnv, context?: ExecutionContext) => Promise<Response>,
    context?: ExecutionContext,
  ): Promise<Response> {
    activeRequests++;
    const wrapped = env.DB ? { ...env, DB: trackDatabase(env.DB) } as TEnv : env;
    const wrappedContext = context ? trackContext(context) : undefined;
    try { return await work(wrapped, wrappedContext); }
    finally { activeRequests--; }
  }

  function snapshot() {
    const current = now();
    for (const value of background.values()) {
      if (!value.expired && current >= value.deadline) {
        value.expired = true;
        timedOutBackgroundTasks++;
      }
    }
    return { serviceId, activeRequests, activeD1Calls, completedD1Calls,
      failedD1Calls, activeBackgroundTasks: background.size,
      completedBackgroundTasks, rejectedBackgroundTasks, timedOutBackgroundTasks,
      unverifiedBackgroundTasks, readbackReported, failedBackgroundReadbacks,
      rejectedRegistrations, backgroundScope: "observed-context-per-isolate-only",
      backgroundDrainVerified: false, backgroundDurabilityVerified: false,
      scope: "single-worker-isolate", allIsolatesObserved: false,
      allWaitUntilJobsInstrumented: false, allD1BindingsInstrumented: false,
      transactionCommitBarrierVerified: false, durableReadbackVerified: false,
      processExitVerified: false, gracefulShutdownReady: false,
      autoRestartAllowed: false };
  }

  // Constant 503 deliberately ignores any caller-supplied token/identity.
  // No public caller can set a drain state on a Worker that lacks global proof.
  function blockedPreflight(): Response {
    return Response.json({
      ok: false, protocol: "local-ops-runtime-drain/v1",
      code: "WORKER_ISOLATE_D1_DRAIN_UNVERIFIED",
      serviceId, supported: false, durableReadbackVerified: false,
      fullRuntimeExitVerified: false, autoRestartAllowed: false,
    }, { status: 503, headers: { "cache-control": "no-store",
      "x-content-type-options": "nosniff" } });
  }
  return { trackFetch, observeWaitUntil, snapshot, blockedPreflight };
}
