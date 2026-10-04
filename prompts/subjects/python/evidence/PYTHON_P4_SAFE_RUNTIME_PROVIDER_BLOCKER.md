# PYTHON04 SAFE RUNTIME PROVIDER BLOCKER

Status: **BLOCKED — NO SAFE EXECUTION PROVIDER PROVEN**

Baseline: `95c90f34e4deef1b9b51474863ca1d7cb06054dc`

## Evidence

Repository discovery found:
- no learner Python interpreter;
- no Pyodide/PyScript/MicroPython/CPython-WASM bundle;
- no Python package/environment owner;
- no server/container sandbox for arbitrary learner Python;
- no external runner binding/credential/configuration;
- Cloudflare learning runtime is a JavaScript Worker serving assets and enforcing session/data access, not a Python process/container sandbox.

The reusable capability pattern exists (for example Math capability runtime), but capability abstraction does not itself provide isolation.

## Why execution stays disabled

PYTHON04 requires enforceable:
- timeout / CPU containment;
- memory containment;
- stdout/stderr bounds;
- isolated filesystem;
- default-deny network;
- subprocess/package restrictions;
- secret/environment protection;
- cleanup/cancellation;
- hidden-test protection;
- reproducible runtime/package identity.

None of the currently available runtime owners proves all of those for untrusted Python code.

A browser `eval`, host JavaScript `eval`, ad-hoc remote API, or direct Cloudflare Worker execution would violate PYTHON04 and C1/C3/C4.

## Accepted next provider classes

A future implementation may proceed only after one of these is concretely authorized and proven:

1. **Browser sandbox provider** — pinned interpreter/runtime, isolated Worker, enforceable termination, explicit network/JS-bridge restrictions, reproducible package profile.
2. **Dedicated server/container sandbox** — isolated per-run process/container with seccomp/namespace/resource limits or equivalent, no platform secrets, egress policy and deterministic image identity.
3. **External runner provider** — explicitly approved service, stable API/version, bounded resources, secret-safe integration, hidden-test boundary and documented failure/availability policy.

## Stop rule

Until one provider passes the PYTHON04 golden security fixtures, `learnerExecutionEnabled` remains false and PYTHON05 must not present executable Python as available.

This is an intentional fail-closed blocker, not a missing implementation to bypass.
