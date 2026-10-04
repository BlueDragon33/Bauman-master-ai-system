# PYTHON EXECUTION CAPABILITY CONTRACT

Status: **DESIGN ACCEPTED · PROVIDER ACTIVATION BLOCKED**

## One facade

All learner-facing execution must call one governed Python execution facade. Lesson/UI code must never instantiate interpreters or containers directly.

Logical capabilities:
- `python.execute`
- `python.test.run`
- `python.trace`
- `python.cancel`
- optional exploration-only `python.repl` / `python.notebook`.

Capability names are contracts, not permission to activate them before the sandbox gate passes.

## Request

A request carries at minimum:
- request/run/attempt/task IDs;
- learner-session correlation without secrets;
- code plus explicitly attached files;
- stdin if allowed;
- environment profile ID;
- public task/test references;
- deterministic seed where required;
- execution mode: `exploration | practice | official`;
- support metadata from PYTHON03.

No client request may choose arbitrary container image, command, package installer, environment variables, network target or host path.

## Result

Structured result:
- `runId`, `attemptId`, status and provider;
- environment ID, Python version and image identity;
- stdout/stderr with truncation flags;
- exception type/message and sanitized learner-workspace traceback;
- exit/timeout/cancel/resource status;
- public test summary and protected hidden-test aggregate;
- produced artifacts allowed by contract;
- duration and safe resource signals;
- sequence/version token for stale-result rejection.

Possible statuses include `OK`, `SYNTAX_FAILURE`, `RUNTIME_FAILURE`, `TEST_FAILURE`, `TIMEOUT`, `RESOURCE_LIMIT`, `CANCELLED`, `POLICY_DENIED`, `PROVIDER_UNAVAILABLE`.

## State/evidence

Execution results are evidence inputs only. C4/global mastery remains authoritative. First official attempts are immutable; retries append. Idempotency keys prevent duplicate official evidence when a request is retried.

Late results whose task/session sequence no longer matches the active attempt are quarantined and cannot overwrite newer learner state.
