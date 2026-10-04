# PYTHON04 EXECUTION CAPABILITY CONTRACT
Status: IMPLEMENTED VALIDATION BINDING — learner execution remains disabled.

Canonical facade: `python.execute`.
Related capabilities: `python.repl`, `python.notebook`, `python.test.run`, `python.trace`, `python.debug`, `python.lint`, `python.format`, `python.typecheck`, `python.files`, `python.package.info`, `python.data.numpy`, `python.data.pandas`, `python.ai.tutor`.

## Request
Every run must carry `runId`, `taskId`, `attemptId`, source code, stdin/files only when declared, runtime profile, package profile, timeout/output/resource policy, and deterministic seed when required. Secrets and ambient platform environment are excluded.

## Result
Providers return structured `status`, `stdout`, `stderr`, exception class/message/traceback, exit code when applicable, duration/resource signals, produced artifacts, runtime identity, truncation flags and cancellation/timeout state.

Provider output is evidence, not mastery. PYTHON03 remains assessment semantics owner and C4 remains mastery authority.

## Provider boundary
UI and lessons call this facade only. No lesson may instantiate an interpreter directly. Provider implementations may be browser, server, external or desktop, but must satisfy the same envelope.

## Current gate
No compliant provider is proven in the repository. Therefore executable learner code stays disabled and the product must not claim Python execution support.

## Implemented validation binding (not accepted execution)

Canonical subject extension: `SUBJECT_ADAPTER.pythonRuntime` in
`subjects/programming/assets/python-runtime.js`. Its `runCode`/`runTests`
use same-origin `/api/python/reserve`, `/run`, `/cancel`; the Worker mints runId
and binds it to the existing Control device/session owner. UI never selects a
Container or controls resource/network policy. Practice has sessionId, not an
official attemptId. Official execution/evidence persistence remains unavailable.

Provider: `runtime/python-cloudflare/worker.ts`, native Cloudflare 1.x
Durable Object Container. Its implementation details, safety limits and actual
CI receipts are tracked in `PYTHON04_CLOUDFLARE_PROVIDER_SPIKE.md`.
Result correctness is `not_assessed` or explicitly public-practice-only.
No success status or stdout grants assessment/mastery authority.
