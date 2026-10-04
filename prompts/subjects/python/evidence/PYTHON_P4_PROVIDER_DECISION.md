# PYTHON04 RUNTIME PROVIDER DECISION
## Evidence-backed provider selection before enabling learner execution

Status: **BLOCKED — EXTERNAL SANDBOX AUTHORITY / ENTITLEMENT NOT YET PROVEN**

Baseline: `991b342704a2bc52337f0bb4fd293d3c74b3ec30`

## Current repository truth

The current learning runtime is a Cloudflare Worker serving/gating static learning assets. The Programming subject has no interpreter, code runner, sandbox, REPL/notebook executor, test runner or debugger. No canonical execution-provider registry exists yet. Therefore there is nothing safe to "turn on".

## Options assessed

### Same-origin browser Pyodide / Web Worker — rejected for official execution

Pyodide is technically capable of CPython-in-WebAssembly, including Web Workers, but browser Python can access Web APIs and HTTP through the browser networking stack. A Worker improves responsiveness and allows interruption; it does **not** by itself prove the network/credential/resource isolation required for official untrusted learner code.

It may be reconsidered later for unscored exploration on an explicitly isolated origin with no authenticated cookies/bindings, but it is not the PYTHON04 official-evidence provider.

### Pyodide/Node or host-process execution — rejected

The project must not execute learner source through host-language `eval`, privileged Node/Python processes, or any provider that can inherit application filesystem/environment/secrets.

### Current Bauman Cloudflare Learning Runtime Worker — rejected as executor

The existing Worker is the access-controlled learning/runtime shell. It is not a general Linux process sandbox and must not gain ad-hoc code execution privileges.

### Cloudflare Sandbox/Container — selected candidate

Cloudflare's Sandbox/Container model is the best fit with the repository's existing Cloudflare deployment boundary because it is designed for untrusted/generated code, isolates the sandbox from the application Worker, can run Python in a Linux image, and allows the Worker to control what APIs/data/network the sandbox receives.

Required deployment policy:
- official assessments use fresh/isolated workspaces;
- no application secret is copied into the sandbox;
- Internet is disabled by default;
- approved outbound access, if ever required, is mediated outside the sandbox;
- image, CPython and package environment are immutable/pinned for official evidence;
- resource class, timeout, output cap and cleanup are explicit;
- hidden tests are injected only into the isolated execution boundary and never returned as source.

## External blocker

Repository evidence cannot prove that the current Cloudflare account has the Workers Paid / Sandbox-Container entitlement and deployment authority required to create this provider. It also cannot prove that the existing token has the necessary container/Durable Object permissions.

Until that external authority is confirmed, **PYTHON04 must not enable learner code execution**.

## Activation decision

`selectedProvider = cloudflare-sandbox-container`  
`activation = BLOCKED_EXTERNAL_AUTHORITY`  
`officialExecutionEnabled = false`

This is a deliberate security stop, not a failed implementation. PYTHON04 resumes with Class-B implementation only after entitlement/credentials are proven.
