# PYTHON04 EXECUTION CAPABILITY CONTRACT
Status: PROVIDER PROVEN — learner-facing activation remains release-gated.

Canonical facade: `python.execute`.
Concrete provider: `cloudflare/python-sandbox-provider.mjs`.
Worker control-plane adapter: `cloudflare/runtime-worker-python.mjs`.
Runtime profile: `cpython-3.14.8-stdlib-v1`.
Provider identity: `cloudflare-container-durable-object-v1`.

Related capabilities: `python.repl`, `python.notebook`, `python.test.run`, `python.trace`, `python.debug`, `python.lint`, `python.format`, `python.typecheck`, `python.files`, `python.package.info`, `python.data.numpy`, `python.data.pandas`, `python.ai.tutor`.

## Request

The Worker owns run identity and authorization. A governed run carries a server-created `runId`, task/attempt identity when applicable, source code, declared stdin, runtime profile and bounded timeout policy. Secrets and ambient platform environment are excluded.

The first provider accepts at most 32 KiB source, 64 KiB stdin and a 100–5000 ms execution timeout. Later profiles may change limits only through a versioned provider contract.

## Result

The provider returns structured `status`, `stdout`, `stderr`, exit code, duration, truncation flags, runtime/provider identity and isolation/network policy. Provider output is evidence, not mastery. PYTHON03 remains assessment semantics owner and C4 remains mastery authority.

## Isolation

Each run resolves to a dedicated Durable Object/Container identity and the container is destroyed after the run. The learner process runs as uid/gid 10001. The container starts with `enableInternet:false`. Worker secrets are not forwarded into the container.

The in-container runner enforces wall-clock, address-space, output-file and file-descriptor limits and kills the learner process group on timeout. The provider does not fall back to browser `eval`, Worker `eval` or host execution.

## Tests

`PythonSandbox.runTests()` is the server-side test provider. Test material is passed from trusted Worker/task policy, not from learner-facing client state. Results return only structured case status and omit hidden input/expected source.

## Feature gate

The provider is proven, but preview and production templates intentionally keep `BAUMAN_PYTHON_EXECUTION_ENABLED=false` until PYTHON05 integrates learner UX/authoring and PYTHON06 completes acceptance. This is a product-release gate, not a missing execution provider.

## Evidence

Real Worker + Container execution passed `Python P4 Container Provider CI` run `37197219411` on tested head `6984c97effa094e4cb61c193103186f3d0da727f`.
