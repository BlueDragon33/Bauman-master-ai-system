# PYTHON04 execution capability contract

Status: VALIDATING; remote exact-head CI/PR acceptance is not yet established.

## Canonical integration

`subjects/programming/subject-manifest.{json,js}` declares `pythonRuntime` and
the lab entry. `assets/subject-adapter.js` remains the Programming integration
owner. `assets/python-runtime.js` attaches exactly one facade to that adapter;
the lab uses only `SUBJECT_ADAPTER.pythonRuntime.run`. No global registry/kernel
is introduced. Shared `subjects/shared/host-bridge.js` remains task/progress
transport; Python execution does not write progress or mastery.

## Supported provider

Local companion `runtime/python/server.mjs`, loopback port 4414, serving only
the local development origins on port 3005. Native CPython 3.12.12, Linux
x86_64, cgroup v2, Docker with the tested limits and seccomp support. Start:

```sh
cd /workspace/Bauman-master-ai-system
node runtime/python/setup.mjs
node runtime/python/server.mjs --acceptance
node scripts/serve-local-runtime.mjs --port 3005
```

The provider is a development companion, not a Cloudflare Worker or production
service. Hosted pages fail closed; no remote endpoint, external credential,
desktop host interpreter or browser eval fallback is selected automatically.

## Request/result

Requests allow only run/task/session IDs, code or ordered cells, stdin, text
file map and mode (`run`, `notebook`, `trace`, `test`). Code: 16 KiB / 12 cells;
stdin: 8 KiB; files: 8 / 16 KiB. Unknown fields, runtime/image/policy overrides,
official test payloads and unsafe paths are rejected before container launch.

Results bind request identity, provider, pinned runtime/environment/image ID,
policy, status, bounded stdout/stderr, exception class/location, cell/trace
metadata, duration, truncation and verified cleanup. Public-test results carry
passed/failed/cases. Transport is structured JSON; printed `PASS` is not a
correctness signal. Interpreter diagnostics remain adversarial reports.
Identity, policy, cleanup and official-evidence authority are set by the
supervisor, never accepted from learner output.

`officialEvidence=false` always. Public tests are practice feedback, not a
score or mastery decision. PYTHON02/PYTHON03 and existing learner history are
unchanged. IDs plus facade generation quarantine late replies; edits,
restart, cancel and newer runs invalidate the previous request.

## Lifecycle / failure

One concurrent run per companion. Busy/unavailable/invalid-result/timeout,
memory/output-limit, cancellation and cleanup failure are distinct. Cleanup
failure blocks subsequent runs until the provider is repaired/restarted;
never automatically reuse its workspace. The lab gives honest unavailable
feedback when the companion is down or network/browser is offline.

## Pending release gate

Canonical logical capability: `python.execute`; the existing subject adapter owns its concrete facade. Provider output is evidence, not mastery. Until required CI/review accepts the exact head, executable learner code stays disabled. The default companion returns `acceptance_pending`; only an explicitly started loopback `--acceptance` harness runs the security/browser fixtures. This is not a deployed learner service. Requests bind run/task/session identity; official attempt ownership remains PYTHON03.
