# PYTHON04 native Cloudflare authorization blocker

Status: REAL EXTERNAL BLOCKER — IMPLEMENTATION DISABLED, MODULE NOT ACCEPTED.
Main reconfirmed: `a86f00ebe339a0f39ad8feab66315046b94185a7`.
Exact remote CI source: `57c9815a18edc4c133823cc9b95858d1a476af64`.
Workflow: https://github.com/BlueDragon33/Bauman-master-ai-system/actions/runs/37199893492
Receipt: `cloudflare-ci/57c9815a18edc4c133823cc9b95858d1a476af64.json`.

## Evidence and root cause

Both repository bindings exist in the established `bauman-preview` Environment.
The account-owned token verification endpoint returns HTTP 200, status active.
The user-token endpoint returns 401 because it is a different token type; that
response alone must not be described as an invalid account token.
The required native Container endpoint `/accounts/{account}/containers/me`
returns HTTP 403, error code 10000, Authentication error. Wrangler's real test
Worker deployment also failed at that endpoint. Its cleanup check returned
10090 (Worker does not exist); the failure occurred before a Worker was created.
Later preflight runs stop before deployment. No production Worker was modified.

The existing token's native Container authorization/compatibility is therefore
unproven and currently denied. The exact missing scope/entitlement cannot be
inferred from the generic 403 alone. A Cloudflare account/token owner must
provide compatible Container access for the scoped test binding. Codex cannot
manufacture that administrative authority or prove the VM boundary locally.

## Completed work and boundaries

Native 1.x provider, digest-pinned CPython 3.14.8 image/bootstrap, bounded
structured supervisor, clean run identities, atomic recovery leases/tombstones,
existing Control auth, same-origin Programming facade, disabled lab, public
practice tests/trace/notebook, CSV/JSON text inputs and local evidence hints
are implemented. Review fixes and executable tests are in the spike ledger.
Static/integration/controller/lifecycle/bootstrap and gated browser checks passed;
source and preview package desktop/mobile checks preserve current learner state.
Those checks are insufficient for real sandbox acceptance. No hidden official
grader, official attempt persistence, external AI or data-package profile has
been activated. PYTHON02/PYTHON03 truths and stable lesson IDs remain unchanged.

All security fixture implementations are present, but no real native fixture is
claimed PASS. Official hidden grading/immutable first attempt/retry acceptance,
authenticated learner E2E and exact-head module acceptance remain outstanding.
The real browser test's acceptance-driver proxy proves execution journeys only;
it does not replace the existing Control authentication integration gate.

## Resume and exit gate

Grant compatible native Containers access to the `bauman-preview` token/account
binding; do not send secret values in Chat or commit them. The exact endpoint
must return success. Rerun `Python04 Cloudflare Provider Proof` at the branch
head. Fix failures at their owner without weakening image pinning or security
fixtures. Keep `BAUMAN_PYTHON04_ENABLED=false` until native security/resource,
private-boundary, state and authenticated browser gates all pass at one exact
head. Complete the remaining work packet before marking PYTHON04 PASS, opening
the acceptance PR and merging. Do not deploy Production in this packet.
