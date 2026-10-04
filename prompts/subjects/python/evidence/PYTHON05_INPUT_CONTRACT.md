# PYTHON05 INPUT CONTRACT
Status: READY — PYTHON04 runtime provider PASS.

PYTHON05 may now consume the governed PYTHON04 provider under these fixed boundaries:

- facade owner: `python.execute` / server-side `python.test.run`;
- provider: `cloudflare-container-durable-object-v1`;
- runtime profile: `cpython-3.14.8-stdlib-v1`;
- clean Container per run/official attempt;
- outbound Internet denied by default;
- Worker/platform secrets absent from learner execution;
- bounded timeout, memory and stdout/stderr;
- learner process uid/gid 10001;
- server-generated run identity and identity echo in every result;
- hidden tests remain inside trusted Worker/server provider flow;
- provider output is evidence, never direct mastery authority;
- no browser/Worker eval fallback;
- no browser-local/offline interpreter is claimed.

Real provider proof: GitHub Actions `Python P4 Container Provider CI` run `37197219411` on `6984c97effa094e4cb61c193103186f3d0da727f`.

PYTHON05 must preserve `BAUMAN_PYTHON_EXECUTION_ENABLED=false` in preview/production until learner UX, task authoring, public/hidden test flow, accessibility/responsive behavior and state/evidence integration are themselves accepted. PYTHON05 may enable execution only through the canonical facade and must not expose Sandbox APIs directly to lesson/UI code.
