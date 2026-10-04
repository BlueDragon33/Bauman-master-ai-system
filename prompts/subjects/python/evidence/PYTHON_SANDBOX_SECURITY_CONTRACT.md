# PYTHON SANDBOX SECURITY CONTRACT

Status: **MANDATORY BEFORE EXECUTION**

Selected candidate: Cloudflare Sandbox/Container. No implementation is authorized until account entitlement/deployment authority is proven.

## Trust model

Learner code, uploaded files, AI-produced code and third-party exercise artifacts are untrusted.

The application Worker keeps device/session/control secrets outside the sandbox. The sandbox receives only task-scoped public data and opaque correlation IDs.

## Isolation policy

Official execution:
- fresh isolated workspace for each official attempt;
- no sensitive host/app filesystem mounted;
- no application secret or unrestricted environment value;
- Internet disabled by default;
- no arbitrary package installation;
- no privileged host RPC exposed;
- subprocess use denied unless a future task/provider contract explicitly allows a fixed command;
- generated artifacts copied out only through validated API boundaries.

A container process may have broad privileges **inside its own sandbox**. Security therefore comes from sandbox/container isolation and from not placing sensitive data inside it, not from Unix file permissions alone.

## Resource policy

Provider implementation must enforce:
- hard wall-clock timeout per run;
- bounded provisioned CPU/memory/disk profile;
- bounded stdout/stderr capture;
- bounded input/file count and file sizes;
- cancellation and guaranteed cleanup;
- OOM/timeout/cancel distinct from wrong answer.

Provisional profiles are design guidance only until deployment evidence binds them:
- `python-core`: smallest profile proven to run pinned CPython + test harness reliably;
- `python-data`: larger profile only for explicitly allowed NumPy/Pandas tasks.

## Filesystem

Use an execution workspace such as `/workspace/run/<runId>`. Reject path traversal at the facade and ensure the sandbox contains no sensitive files outside the workspace that learner code could profitably steal.

## Network

Default `deny`. If a future task requires network, route only allowlisted destinations through an outbound policy outside the sandbox. Credentials are injected outside the sandbox and never disclosed to learner code.

## Hidden assessment material

Hidden test source/solutions remain inside the trusted orchestration boundary and are not included in learner-visible stdout/stderr, artifact downloads or learner-facing AI context.

## Forbidden shortcuts

No browser/host `eval` of learner code, no same-process execution in Bauman Control/Learning Runtime, no host Docker socket, no production secrets in container env, no arbitrary `pip install` for official runs.
