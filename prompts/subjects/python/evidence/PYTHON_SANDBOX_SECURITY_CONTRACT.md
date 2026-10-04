# PYTHON04 SANDBOX SECURITY CONTRACT
Status: MANDATORY PRECONDITION — provider pending.

Learner and AI-generated code are untrusted.

## Default deny
A provider must deny platform secrets, unrestricted host filesystem, unrestricted network, subprocess/system calls, arbitrary package installation, privileged environment variables and cross-session state unless an explicit task capability grants a narrower permission.

## Isolation
Each run has a unique `runId` and isolated workspace. Path traversal outside that workspace is forbidden. Multi-tab runs cannot overwrite each other. Stale results are quarantined by run/task/attempt identity.

## Resource limits
A provider must enforce bounded wall-clock execution, CPU/process policy where applicable, memory containment, stdout/stderr limits, artifact/file size limits and cancellation. Infinite loops, output floods and allocation bombs must terminate without destabilizing the app/service.

## Network
Disabled by default. Approved endpoints require an explicit task policy and must never expose platform credentials.

## Files and deserialization
Uploads require type/size/name validation. Unsafe host deserialization such as untrusted pickle in privileged context is forbidden.

## Hidden evidence
Hidden official tests, solutions and privileged grading material must not enter learner or AI-visible contexts.

## Fail closed
If isolation, limits, cleanup or secret protection cannot be proven, execution remains disabled. Browser `eval`, host-language `eval`, or an ungoverned runner is not an acceptable fallback.

## Implemented profile; real-provider gate pending

The native Container requests 0.25 vCPU, 256 MiB RAM, 2048 MiB disk,
Internet disabled and no application environment. Digest-pinned image only.
Trusted CPython bootstrap: chroot, UID/GID 65534, all extra fds closed,
environment cleared, seccomp default deny and hard RLIMIT AS 96 MiB,
CPU 2/3 seconds, one process, 32 fds, 1 MiB file size, no core dump.
Process syscall policy denies sockets, fork/clone/exec, ptrace, mount,
namespace/credential changes and BPF. No learner Python runs in the Worker.

Supervisor bounds execution/startup/cleanup, combined captured output 16 KiB,
raw transport 128 KiB and raw stderr 16 KiB. Destroy plus inspect(null) is
required before admission release. Transactional admission/child recovery
alarms retain cancelled tombstones and quarantine failed cleanup.

Mock supervisor/local Docker evidence does not prove native Cloudflare safety.
Every mandatory fixture must run in the real Container before learner activation.
