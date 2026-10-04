# PYTHON04 implementation plan

Initial baseline: `991b342704a2bc52337f0bb4fd293d3c74b3ec30`.
Reconfirmed/integrated main: `a86f00ebe339a0f39ad8feab66315046b94185a7`.
Status: LOCAL REFERENCE SPIKE ONLY; superseded as canonical provider by the
Cloudflare decision on that main. No PYTHON04 acceptance or production authority.
Spec: `../CURRENT_WORK_PACKET.json` and the active PYTHON04 prompt.
Execution: inline, autonomously as requested; review before any merge.

## Architecture and constraints

Reuse Programming subject manifest/adapter and shared bridge; no new global
kernel, progress store or academic/assessment owner. Add one local companion
provider and one learner execution facade. Cloudflare/static hosting cannot
host this native provider; remote execution remains unavailable by default.
The managed Docker daemon is usable; cgroup limits and non-root chroot were
probed. Landlock is unavailable (ENOSYS); it is not part of the boundary.

Use digest-pinned CPython 3.12.12, empty per-run tmpfs/chroot, drop privileges,
no-new-privileges, syscall allowlist, no networking, 128 MiB container memory,
96 MiB address space, CPU/wall timeout, bounded output, one concurrent run,
cleanup and structured transport. Only explicitly preloaded standard-library
modules are supported. No package installation. No platform credentials or
Docker socket in the learner container. Private official tests require a
separate trusted task store and are not enabled by this practice provider.
No inferred mastery; no changes to PYTHON02/PYTHON03 or legacy learner state.

## Tasks

- [ ] 1. Write real Docker security/integration tests first; observe missing
  provider failure. Implement `runtime/python/provider.mjs`, `sandbox.py`,
  digest-pinned image/setup, policy validation and structured results.
  Test normal run, syntax/runtime error, all eight security fixtures,
  spoofed output, cancellation, cleanup, invalid paths/limits and no secret
  exposure. Never execute attack fixtures on the host.
- [ ] 2. Write service/facade tests first. Implement local HTTP boundary and
  Programming facade with bounded requests, origin checks, timeout,
  stale-result quarantine and no state writes. Register via subject adapter.
  Test wrong origin, payload overflow, provider unavailable and stale result.
- [ ] 3. Write browser journeys first. Add minimal lab using shared UI tokens:
  run/test/trace, notebook restart/run-all semantics, cancellation and safe
  unavailable/offline states. Test desktop/mobile interaction, error, reload,
  state preservation, honest offline fallback and packaged runtime.
- [ ] 4. Complete required contracts/fixtures and CI, run accepted Python
  regressions plus integration/browser/security at an exact committed head.
  Record evidence, rollback, PROJECT_STATE/STATUS and PYTHON05 handoff only
  when acceptance is actually met. Open PR; merge only with exact-head
  acceptance and required CI. Never deploy production.

## Review focus

Raw syscalls cannot bypass chroot/seccomp; Docker's default proxy injection
must not survive entrypoint environment clearing; malicious output cannot
grant correctness; user input cannot select host paths/images/policy; an
aborted or stale request cannot outlive cleanup or change learner state.

## Ledger

Discovery: main reconfirmed; baseline diff adds only the work packet/start doc.
Canonical runtime declarations are subject-manifest and subject-adapter;
shared host bridge transports task/progress only. No existing execution
registry/provider was found in the targeted platform/control/runtime paths.
Ruling: local companion is the supported initial provider; no remote provider
or production endpoint is implied. Cost if wrong: remote deployment requires
separate infrastructure authority rather than an unsafe automatic fallback.

Review red/green fixes: discard rejected adversarial result payloads; keep stale UI results out of hint state; preserve syntax source locations; apply explicit hash seed without Python -I/-E; prove default execution gate and missing cgroup boundaries fail closed. Directory enumeration is intentionally denied by syscall policy, so private-material fixture probes a concrete absent private path instead of assuming listdir support.
