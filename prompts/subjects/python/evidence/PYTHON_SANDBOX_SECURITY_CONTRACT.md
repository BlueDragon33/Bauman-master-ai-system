# PYTHON04 sandbox security contract

All learner and AI-generated code is UNTRUSTED. The facade/HTTP validation is
not the sandbox. Linux/Docker boundaries are required before `exec` occurs.

## Actual boundary

Digest-pinned base image; built image labels must match SHA-256 of the trusted
bootstrap and Dockerfile. Supervisor resolves and uses that immutable image
ID, not a caller-provided tag. Per-run container: private namespaces,
network=none, read-only image, no host mounts/socket, no persistent volume,
8 MiB noexec/nosuid/nodev tmpfs. Bootstrap verifies effective cgroup v2 memory,
swap, PID and CPU settings; missing/unsupported boundaries stop before code.

Bootstrap uses only SYS_CHROOT/SETUID/SETGID, enters the empty tmpfs root,
sets groups empty and UID/GID 65534, closes all extra descriptors and clears
environment. Docker no-new-privileges prevents gaining privileges again.
The runtime has no `/proc`, system root, secrets, host files or root directory
descriptor. The interpreter/allowlisted stdlib are preloaded before chroot.
Paths in the request are validated; raw Python/syscall traversal cannot escape
the kernel chroot. Root files exist only for this run.

An x86_64 architecture-checked seccomp syscall allowlist permits ordinary file
I/O within that root, memory, clocks/signals and exit. It denies socket,
connect, fork/clone/exec, ptrace, mount, namespaces, credential changes and BPF.
Direct ctypes syscalls are tested; import restrictions are not the boundary.
Landlock probes returned ENOSYS and are not relied upon.

## Limits and teardown

Container memory 128 MiB, no swap; RLIMIT_AS 96 MiB; CPU quota 0.5 core;
CPU soft/hard limits 2/3 seconds; supervisor wall limit 5 seconds after start;
PID count 1; file size 1 MiB; fd limit 32; core dumps disabled. Bootstrap and
supervisor failure never enable a host fallback. Setup/control commands have
separate bounded deadlines; cancellation during startup still cleans up.

Normal stdout+stderr budget: 16 KiB with truncation. Raw fd output cannot evade
the supervisor's bounded transport (128 KiB stdout JSON envelope; 16 KiB raw
stderr threshold, only 2 KiB diagnostic buffer). Overflow sends one kill,
not an unbounded sequence of host subprocesses. Docker logging is disabled.
Supervisor force-removes the exact container and verifies removal. No process,
filesystem or notebook kernel is reused between runs.

## Secrets and package policy

Docker may inject proxy defaults. Entrypoint uses `env -i` before starting the
interpreter, so only a public PATH and deterministic hash seed enter bootstrap;
no platform values survive that exec. No credential files, CA/proxy secrets,
Docker socket, Control DB or learner-state store enter the container. Runtime
package installation and subprocess execution are denied by OS policy.
Untrusted pickle is not decoded in any privileged host process; pickle is not
part of the curated learner environment and the fixture fails closed.

## Verification / limits of the claim

Golden security fixtures are executed only in real containers by
`tests/python-p4-provider.test.mjs`. They include raw syscall and raw fd bypass
attempts, environment canary, traversal and cancellation/cleanup. Containers
share the host kernel; this is a local learning sandbox, not a claim of immunity
to every kernel vulnerability or a multi-tenant production security approval.
No production execution or private official assessment is enabled.

## Default deny

All capabilities outside the documented local profile are denied.

## Resource limits

The effective limits above are enforced before code, not caller-selected.

## Network

Network is denied by default at both namespace and syscall boundaries.

## Hidden evidence

Hidden official tests/solutions do not enter learner or AI contexts.

## Fail closed

Browser `eval`, host eval and direct host Python are forbidden. Default learner execution stays disabled pending exact-head acceptance; the local acceptance harness has no production authority.
