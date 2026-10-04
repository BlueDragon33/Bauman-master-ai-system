# PYTHON04 RUNTIME PROVIDER DECISION

Status: **ACCEPTED FOR IMPLEMENTATION — SERVER/CONTAINER SANDBOX**

Decision date: 2026-10-04

Baseline main SHA: `1622aa591fc0ded12c0659caf42e38d21b051487`

Provider class: **Dedicated server/container sandbox**

Concrete provider: **Cloudflare Sandboxes / Containers (current 1.x path)**

Supported Python baseline for the provider spike: **CPython 3.14.8**

Learner execution remains: **DISABLED UNTIL GOLDEN FIXTURES PASS**

## Decision

PYTHON04 will use a server/container sandbox as the canonical execution authority for learner Python.

The existing Cloudflare Worker remains the control plane. It authenticates the learner, validates task/run identity, selects the runtime profile, starts/routes the sandbox, applies policy, receives bounded results, and persists only validated evidence.

Untrusted learner or AI-generated Python never executes inside the application Worker and never shares application credentials.

Python executes inside an isolated Cloudflare Sandbox Container. Official assessment runs use a clean sandbox identity per attempt/run. Practice reuse may be considered later only if it cannot contaminate official evidence.

## Why this option

This subject requires real CPython behavior, filesystem semantics, public/hidden tests, NumPy/Pandas-capable environments, bounded resource execution, reproducible images and a private grading boundary.

A browser runtime is not the canonical provider because official hidden tests and full package/toolchain semantics must remain outside the learner client.

An external runner is not the canonical provider because the project already uses Cloudflare and adding a second execution vendor would create avoidable auth, availability, secret-management and observability boundaries.

## Runtime boundary

```text
Learner browser
  -> Bauman/Programming UI
  -> Cloudflare Worker control plane
  -> authenticated run request + task policy
  -> Cloudflare Sandbox Container
       - pinned CPython/runtime image
       - isolated run workspace
       - Internet disabled by default
       - no platform secrets
       - bounded execution/output/files
       - hidden tests injected only for official grading
  -> normalized run result
  -> Worker validation / evidence write
  -> learner UI
```

## Mandatory isolation policy

1. Every run has a unique `runId`.
2. Every official attempt maps to a clean sandbox/workspace identity.
3. Internet is disabled by default.
4. No platform credential, database secret, API token or privileged environment variable enters the sandbox.
5. Hidden tests are injected only inside the official grading sandbox and are never returned to the learner or AI context.
6. Runtime output is bounded and treated as untrusted.
7. Stale results are rejected by run/task/attempt identity.
8. Sandbox failure fails closed; the platform never falls back to browser `eval`, host `eval` or direct Worker execution.

## Runtime image policy

The initial implementation spike binds Python to **CPython 3.14.8**, the current stable 3.14 maintenance release at decision time. Python 3.15 is still a release candidate and is not used for the first production-capable profile.

The final RC must pin:
- interpreter version;
- container image digest;
- dependency lock;
- runtime profile ID;
- package allowlist/profile;
- fixture/evidence version.

A future interpreter upgrade is a PYTHON04 change that triggers the selective revalidation defined by PYTHON00.

## Practice versus official assessment

### Practice

Practice code may receive a short-lived reusable sandbox later for better UX, but only after the per-run provider passes security and cleanup tests.

### Official assessment

Official assessment always starts from a clean declared runtime profile. No notebook, REPL, previous practice file or previous attempt state may be inherited.

Official hidden tests stay server-side inside the sandbox boundary. Only normalized test outcomes/evidence leave that boundary.

## Network policy

Default: `enableInternet: false`.

The first provider implementation exposes no arbitrary outbound network access.

If a future task needs an authenticated external API, credentials remain in the Worker and access must use an explicit allowlisted mediation path. The sandbox never receives the credential itself.

## Resource policy

The provider implementation must prove:
- wall-clock timeout/cancellation;
- memory containment;
- output truncation/limit;
- file/artifact size limits;
- process cleanup;
- isolated filesystem/workspace;
- no cross-run state;
- deterministic runtime identity.

Subprocesses are not considered trusted merely because they execute inside the sandbox. The first educational runtime profile should expose only the process behavior required by the task contract.

## Required proof before learner execution is enabled

All fixtures in `PYTHON_RUNTIME_GOLDEN_FIXTURES.json` must pass, including:
- infinite loop;
- huge allocation;
- output flood;
- path traversal;
- environment/secret read;
- network denial;
- subprocess policy;
- unsafe deserialization boundary;
- stale result quarantine;
- hidden-test non-disclosure.

The provider must also pass the existing `tests/python-p4-runtime-security-contract.mjs` gate and any new provider-specific integration tests.

## Rejected as canonical runtime

### Browser sandbox

Allowed later only as an optional practice/offline acceleration layer. It is not official execution truth and cannot hold hidden tests.

### External runner

Not selected. It remains a future contingency only if the selected Cloudflare provider cannot satisfy a mandatory PYTHON04 invariant.

## Rollback

Rollback means:
- keep `learnerExecutionEnabled=false`;
- remove/disable the provider binding or feature flag;
- preserve existing content, drafts and non-runtime learner state;
- retain the contract/evidence files;
- do not fall back to a weaker execution path.

## External authority checked at decision time

Cloudflare Sandboxes documentation states that Container sandboxes run full Linux images and are isolated from the Worker; current Containers use microVM isolation and can run Python. Network access can remain disabled and credentials should remain outside the sandbox.

Python authority checked at decision time: Python 3.14 is the latest stable feature series; Python 3.15.0 final is scheduled after this decision date.

## Next implementation gate

Implement the Cloudflare Sandbox Container provider spike behind a disabled feature flag, then run the PYTHON04 golden security fixtures. PYTHON05 executable UX remains blocked until this provider proof passes.
