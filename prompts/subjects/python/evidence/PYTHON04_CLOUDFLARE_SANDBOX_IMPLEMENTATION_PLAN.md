# PYTHON04 CLOUDFLARE SANDBOX IMPLEMENTATION PLAN

Status: **ACTIVE WORK PACKET — EXECUTION STILL DISABLED**

Architecture decision: `PYTHON04_RUNTIME_PROVIDER_DECISION.md`

Baseline: `1622aa591fc0ded12c0659caf42e38d21b051487`

## P4.1 Provider adapter

Create one canonical Python execution provider entrypoint. UI code must not call Sandbox APIs directly.

Minimum provider contract:
- `runCode(request)`;
- `runTests(request)`;
- `cancelRun(runId)`;
- `getRuntimeIdentity()`;
- normalized stdout/stderr/status;
- explicit timeout/resource/policy failures.

## P4.2 Runtime image

Create a deterministic sandbox image for CPython 3.14.8.

Initial image profile:
- Python standard library;
- no platform secrets;
- Internet disabled;
- no runtime `pip install`;
- minimal required OS tools;
- dedicated workspace;
- image/runtime identity exposed to the Worker.

NumPy/Pandas are added only through a declared, pinned data profile after the base security profile passes.

## P4.3 Worker control plane

The Worker owns:
- authentication;
- learner/task/attempt authorization;
- runId creation;
- task policy lookup;
- sandbox identity derivation;
- hidden-test injection for official assessment;
- output/result validation;
- stale-result rejection;
- evidence persistence.

The Worker must not execute learner Python itself.

## P4.4 Sandbox lifecycle

First implementation uses clean run/attempt sandboxes.

Required:
- create/start;
- write only declared input files;
- execute with bounded time;
- collect bounded output;
- collect declared artifacts only;
- terminate/cleanup;
- cancel safely;
- no cross-run reuse for official attempts.

## P4.5 Security defaults

- Internet: OFF.
- Credentials in sandbox: NONE.
- Hidden tests returned to client: NEVER.
- Workspace escape: DENY.
- Output: bounded/truncated.
- File uploads/artifacts: validated and bounded.
- Runtime/package identity: pinned and reported.
- Fallback execution: NONE.

## P4.6 Golden fixture adapter

Run all cases in `PYTHON_RUNTIME_GOLDEN_FIXTURES.json` through the real provider, not a mock.

Record provider evidence for:
- timeout;
- memory containment;
- output limit;
- filesystem boundary;
- secret absence;
- network denial;
- process/subprocess policy;
- unsafe deserialization boundary;
- stale result handling;
- hidden-test protection.

## P4.7 Assessment proof

Run representative public + hidden tests using the accepted PYTHON03 behavior-first assessment contract.

Prove:
- equivalent valid solutions pass;
- known wrong implementations fail;
- hidden tests are absent from browser bundles/network responses;
- first official attempt evidence is immutable;
- retry appends rather than overwrites.

## P4.8 Feature gating

Keep `learnerExecutionEnabled=false` while the provider is being built.

Only after provider fixtures and integration tests pass may the state move to a runtime-enabled validation stage. Enabling production execution is a separate reviewed change.

## P4.9 CI

Add provider-specific tests to Development Fast CI where they can run deterministically.

Tests that require deployed Sandbox infrastructure must produce explicit evidence and must not be silently replaced by mocks.

## P4.10 Exit criteria

PYTHON04 provider implementation may leave ACTIVE only when:
1. concrete Sandbox Container binding exists;
2. runtime identity is pinned;
3. all mandatory security/resource fixtures pass;
4. hidden-test boundary passes;
5. official/practice state boundaries are explicit;
6. provider failure is fail-closed;
7. evidence is recorded;
8. downstream PYTHON05 contract can consume the provider without bypassing capability ownership.

Until then, PYTHON05 must not advertise executable Python as available.
