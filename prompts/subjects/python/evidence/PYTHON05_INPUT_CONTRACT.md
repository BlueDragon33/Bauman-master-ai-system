# PYTHON05 INPUT CONTRACT
Status: NOT READY — requires PYTHON04 PASS.

PYTHON05 may consume PYTHON04 only after:
- one governed execution facade is selected;
- provider/runtime identity is explicit;
- sandbox and resource limits are proven by executable tests;
- filesystem/network/subprocess/secret boundaries pass;
- test/debug result envelopes are stable;
- package/data environment identity is reproducible;
- AI remains advisory and hidden tests are protected;
- offline/failure behavior is honest.

Current handoff is intentionally blocked because no compliant learner Python execution provider has yet been proven. PYTHON05 may continue UI/authoring design against the contracts, but must not present code execution as available until PYTHON04 runtime gates pass.

## Provisional implementation handoff; activation forbidden

Programming lab: `subjects/programming/python-lab.html`.
Single facade: `SUBJECT_ADAPTER.pythonRuntime`.
Canonical provider: native Cloudflare 1.x Container, CPython 3.14.8,
`cpython-3.14.8-stdlib-v1` / `python04-cf-curated-stdlib-v1`.
Supported validation modes: fresh run, public tests, bounded line trace,
ordered notebook replay, declared CSV/JSON text files, deterministic local hints.
Unavailable: offline execution, persistent REPL, official grading/persistence,
NumPy/Pandas, package install, external AI and production activation.

PYTHON05 must preserve the disabled gate until real native-provider security,
resource, hidden boundary, official/practice separation and exact-head browser
acceptance pass. No compliant learner Python execution provider has yet been
proven. Local/bootstrap and gated UI tests are explicitly insufficient.
