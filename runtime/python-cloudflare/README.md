# PYTHON04 cloud setup and validation

This additive provider is a disabled validation binding, not accepted learner
execution. It uses native Cloudflare 1.x Containers and the existing runtime
Worker session/Control authorization. No production command belongs here.

Requirements: Node 22.13+, npm, Docker, a Cloudflare Containers-enabled account,
and a scoped token that can create/delete only the authorized test resources.
The repository's `bauman-preview` GitHub Environment already binds
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`; their presence was verified
by workflow receipt 18faf85c24078d5de29d06117572884ed3031bc9. Token/account
values never belong in tracked files, learner requests, image env or receipts.

Install with `npm ci --prefix runtime/python-cloudflare --no-audit --no-fund`.
Run `npm run typecheck --prefix runtime/python-cloudflare` and
`npm run build --prefix runtime/python-cloudflare` (Wrangler dry-run).
Use a writable XDG/Buildx/cache directory in managed environments, preserving
session Docker/proxy/CA configuration. Docker build copies a pinned CPython
3.14.8 image and trusted bootstrap without package installation/network steps.

Run the controller/lifecycle/facade tests from the repository root:
`node --test tests/python-p4-cloudflare-controller.test.mjs tests/python-p4-cloudflare-lifecycle.test.mjs tests/python-p4-facade.test.mjs`.
After building `bauman-python04-cf-spike:3.14.8`, the bootstrap test exercises
all inherited descriptors, including fd 2048. These tests do not prove the
Cloudflare VM. Wrangler local development uses mutable image tags and is
intentionally refused for execution.

The dedicated provider workflow deploys a uniquely named
`bauman-python04-spike-*` Worker, keeps the learner flag false, generates a
masked acceptance-only key, runs real provider and browser tests, and removes
that test Worker. Exact revision/image evidence and redacted failure diagnostics
are published on a separate `codex/python04-ci-*` branch for review. Static,
mock, bootstrap or gated UI success cannot substitute for real provider PASS.

Direct real tests require `BAUMAN_PYTHON04_BASE_URL`,
`BAUMAN_PYTHON04_ACCEPTANCE_SECRET` and exact 40-character
`BAUMAN_BUILD_REVISION`. Real browser mode additionally sets
`BAUMAN_PYTHON04_BROWSER_REAL=true`. The key stays in the trusted Node driver;
it is never exposed to the page or untrusted Python. Browser-only gate checks
run without a provider and explicitly report `DISABLED_GATE_UI_ONLY`.

Official grading/persistence, hidden-test injection, external model AI,
NumPy/Pandas, runtime pip install and offline execution are unavailable.
Activation requires the remaining acceptance gates; rollback keeps the flag
false and removes only the additive provider/test binding. Current learner
state, academic truth and assessment truth are not migrated.


After upstream PR #261, canonical entries remain
`cloudflare/runtime-worker-python.mjs` / `cloudflare/python-sandbox-provider.mjs`;
both export the same shared implementation. The sole image/bootstrap owner is
`cloudflare/python-runtime/`. Build the test image from that directory. All
preview/production/local configs keep execution disabled; legacy unauthenticated
provider-test mode and mutable local-image execution are removed.
