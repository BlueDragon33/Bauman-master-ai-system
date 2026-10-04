# PYTHON04 canonical Cloudflare provider spike

Status: IMPLEMENTED BEHIND DISABLED LEARNER GATE; REAL PROVIDER PROOF BLOCKED BY CONTAINER AUTHORIZATION.
Baseline reconfirmed: `a86f00ebe339a0f39ad8feab66315046b94185a7`.
Authority: `PYTHON04_RUNTIME_PROVIDER_DECISION.md` and the Cloudflare plan.

## Owner and implementation

The canonical `cloudflare/runtime-worker-python.mjs` and
`cloudflare/python-sandbox-provider.mjs` export the single implementation in
`runtime/python-cloudflare/worker.ts`. The sole image/bootstrap owner is
`cloudflare/python-runtime/`.
The current official Sandbox 1.0 README uses an application Durable Object and
`ctx.container`, not the 0.x `getSandbox` facade. No browser/host interpreter is
added. The existing runtime Worker exports its session authorization function;
the provider reuses it for learner requests, including standalone asset mode.
Approval still comes from the existing Control heartbeat/session owner.

The Worker mints a UUID reservation, binds it to the authenticated owner, and
allows one active reservation per owner. Admission and attempt containers use
different Durable Object identities. Only the attempt starts a Container.
Reservations are transient execution metadata, not a learner/mastery store.
Consumed/cancelled IDs cannot execute again; cleanup failure holds admission
closed. Admission and child each retain a recovery alarm. Claim plus alarm and
release plus alarm deletion are transactional. Admission recovery writes a
cancelled child tombstone even if the HTTP Worker died before reserve; a late
request cannot revive it. Child alarms remain until admission release succeeds.

Every attempt gets a fresh image/workspace; no practice/notebook kernel is
reused. Native `start` requests explicit VM CPU/memory/disk resources and
`enableInternet:false`, with an empty environment. Image references must end in
a SHA-256 digest before code can run. Wrangler's local temporary image tags are
rejected; a local image is never substituted for the deployed provider.

## Image and process boundary

Digest-pinned CPython 3.14.8 amd64 base. Provider toolchain pins Workers types
5.20261004.1, Wrangler 4.147.0 and TypeScript 5.9.3 with a lockfile. Image build
has no network dependency installation. Native exec starts `env -i` with only
public PATH and seed 0, then Python `-s -P`; inherited proxy/application values
do not enter the interpreter. No Worker binding or secret is copied into stdin.

Trusted bootstrap preloads curated stdlib (including Python 3.14's lazy ctypes
layout helper), chroots to an empty `/workspace`, removes groups, drops UID/GID
to 65534, closes extra fds, clears environment and installs hard resource limits
before learner code. AS 96 MiB, CPU soft/hard 2/3 seconds, nproc 1, fds 32,
file size 1 MiB, no core dumps; limits are checked after installation. Native VM
request: 0.25 vCPU, 256 MiB RAM, 2048 MiB disk. Per-run input files: 8 / 16 KiB.
Artifacts are not collected. A private VM disk is not a shared host filesystem.

The architecture-checked seccomp allowlist denies sockets, exec/fork/clone,
ptrace, mounts, namespace/credential changes and BPF. No imports or Python name
filters are treated as OS isolation. No pickle is decoded by the privileged
Worker; pickle is unavailable in the curated interpreter profile.

## Results and lifecycle

The controller bounds both output streams, rejects malformed/oversize payloads,
normalizes source locations and sets request identity/runtime/policy/cleanup
authority itself. Public tests compare returned values outside the learner
process. Printed PASS grants nothing. All results have `officialEvidence=false`.
Timeout/startup/cleanup deadlines are separate. Cancellation aborts native exec,
then destroy+inspect must prove VM removal; failure quarantines that owner.

`runCode`, `runTests`, `cancelRun`, `getRuntimeIdentity` are the provider RPC
surface. HTTP reservation/run/cancel routes select identity in the Worker.
Hidden-test and policy overrides are rejected. Official grading/persistence,
external AI, NumPy/Pandas and production activation remain unavailable; these
are not inferred from successful public practice execution.

## Validation and real CI

Controller mocks test failure handling only. Docker checks test the exact
3.14.8 bootstrap only. Neither replaces the real Cloudflare fixture gate.
`tests/python-p4-cloudflare-real.mjs` requires an actual test URL and scoped
acceptance key; it runs the golden fixtures and records exact source/image IDs.

The provider workflow uses the repository's established `bauman-preview` GitHub
Environment and Cloudflare Actions secret names, creates only a uniquely named `bauman-python04-spike-*` Worker,
keeps learner execution disabled, generates a test-only Worker key, executes
the real provider tests, deletes that test Worker and publishes a bounded
receipt on a separate CI evidence branch. The key stays in the control plane
and trusted test driver. No secret value is included in a receipt. The workflow
does not modify or deploy the production Worker.

The current executor still reports no configured Cloudflare credential bindings
and direct GitHub/Cloudflare API access remains proxy-denied. The pipeline can
use existing repository secrets without copying them into this executor. Its
actual receipt determines infrastructure readiness and provider safety. No acceptance/merge claim is made yet.

Rollback: keep learner flag false; remove the additive provider binding/routes
and test-only Worker. Existing learning state, stable IDs, PYTHON02 academic
truth and PYTHON03 assessment truth have not been migrated or rewritten.

## Review and failure-injection ledger

A read-only security review identified admission lease leaks after Worker/RPC
failure, partial-deployment cleanup, a nonportable Docker path and a missing
remote revision assertion. Each owner was fixed. Three lifecycle tests first
failed on the old implementation and pass with transactional recovery leases;
they exercise crash-before-reserve, alarm-write rollback and release-RPC failure.
The bootstrap high-descriptor escape fixture also failed before the all-fd close
fix and passed afterward. Controller tests verify output bounding, malformed
results, cancellation and cleanup failure. These tests are control-plane/local
bootstrap evidence, not proof of the Cloudflare VM boundary.

## Programming integration

`SUBJECT_ADAPTER.pythonRuntime` is the single subject extension/facade. The
Programming manifest declares the disabled Cloudflare provider; the lab uses
same-origin reserve/run/cancel requests and owner-minted UUIDs. It never calls
Container APIs or an interpreter. Each tab/run carries a unique session token;
editing, cancellation or a newer run invalidates old UI results and cancels
late reservations. No learner-state writes are added. Local/offline execution
has no fallback. Gated desktop/mobile checks pass; real browser journeys require
the actual acceptance endpoint and keep its key exclusively in the Node driver.

## Final access proof

The account-owned token verifies active in `bauman-preview`; native Containers
returns 403 code 10000. This is recorded in
`PYTHON04_CLOUDFLARE_ACCESS_BLOCKER.md`. Learner execution remains false and
PYTHON04 acceptance is incomplete. Focused review of the additive Programming
facade found no blocking stale/state/secret findings; it explicitly did not
establish native VM safety or authenticated learner E2E. The Control-owner HTTP
integration fixture covers origin, missing/malformed session, owner-bound runId,
private-payload rejection and the disabled gate using trusted test shims only.
