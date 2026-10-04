# PYTHON04 CONTAINER PROVIDER ACCEPTANCE REPORT

Status: **PASS — PROVIDER PROVEN, PRODUCT ACTIVATION STILL GATED**

Tested head: `19afbae5fc3b3243a945da5a115cbdc7b0b2e63a`

Provider CI: `Python P4 Container Provider CI` run `37198860782`

Other exact-head gates:
- Development Fast CI run `37198860787`: PASS
- Universal Constitution Compliance run `37198861173`: PASS
- Russian Reference UI Gate run `37198860790`: PASS

## Provider identity

- class: dedicated server/container sandbox
- Cloudflare scheduling: Durable Object Container
- provider id: `cloudflare-container-durable-object-v1`
- runtime profile: `cpython-3.14.8-stdlib-v1`
- actual runtime check: CPython `3.14.8`
- base image pinned by digest
- instance: `lite`
- Internet: disabled
- official isolation policy: fresh container per run/attempt
- learner uid/gid: 10001/10001

## Real execution evidence

The CI job used Docker plus `wrangler dev` to start the actual Worker/Durable Object/Container integration. It did not replace execution with a mock.

The run proved:
1. normal CPython execution;
2. infinite-loop termination;
3. huge-allocation containment;
4. output-flood bounding;
5. path-traversal fixture failure outside the run workspace;
6. platform environment/secret absence;
7. outbound-network denial;
8. subprocess remains confined to the non-privileged sandbox user;
9. unsafe pickle executes only inside the sandbox and fails without privileged-host deserialization;
10. separate run identities prevent provider-side stale overwrite;
11. hidden-test/Worker sentinel data does not enter learner execution;
12. canonical and alternate correct solutions pass the server-side test provider while a known wrong solution fails.

## Resource envelope

The in-container runner enforces:
- max source: 32 KiB;
- max stdin: 64 KiB;
- max stdout: 64 KiB;
- max stderr: 64 KiB;
- address-space limit: 192 MiB;
- file descriptor limit: 32;
- wall-clock timeout request: 100–5000 ms;
- process-group termination on timeout;
- container destruction after execution.

## Fail-closed behavior

Preview and production config still set `BAUMAN_PYTHON_EXECUTION_ENABLED=false`. There is no browser eval, Worker eval or external-runner fallback. If the Container provider is unavailable, execution returns provider failure rather than using a weaker path.

## PYTHON04 conclusion

PYTHON04 PASS conditions are satisfied for the base CPython standard-library provider. NumPy/Pandas, notebook, full debugger and learner-facing code-lab UX are not silently claimed by this PASS; they remain explicit later capabilities.

Handoff: **PYTHON05 READY**.
