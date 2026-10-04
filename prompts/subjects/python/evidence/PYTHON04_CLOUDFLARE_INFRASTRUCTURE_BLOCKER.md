# PYTHON04 Cloudflare infrastructure blocker

Status: BLOCKED — canonical Cloudflare Sandbox provider has not been proven.
Learner execution: DISABLED. PYTHON05: NOT READY. Production: not deployed.

## Exact baseline and owner

Main was fetched/reconfirmed at `a86f00ebe339a0f39ad8feab66315046b94185a7`.
The accepted decision in `PYTHON04_RUNTIME_PROVIDER_DECISION.md` selects
Cloudflare Sandboxes/Containers with CPython 3.14.8. Its Worker control plane
owns authorization/task policy/run identity and normalized evidence. Existing
PYTHON02 academic truth, PYTHON03 assessment truth, lesson IDs and learner state
are unchanged. The newer decision supersedes the initial local-provider choice.

## Concrete unavailable infrastructure

At 2026-10-04 10:34 UTC:

- Managed cloud environment reports connected/running, restricted egress,
  `allowed_hosts: []`, no configured secrets, no runtime variables and no
  outbound identities. The relevant process environment contains no
  `CLOUDFLARE_*` or `CF_*` credential/account variables. Values were never read
  or logged.
- `wrangler.runtime.preview.example.jsonc` declares the static ASSETS binding
  and control origin; it has no Sandbox/Container/Durable Object binding.
  `control-service/wrangler.jsonc` also has none. No Sandbox SDK dependency is
  declared in `control-service/package.json`. These files do not identify a
  runnable Sandbox test target.
- `curl --head --max-time 15 https://api.cloudflare.com/client/v4/` fails with
  CONNECT tunnel HTTP 403 from envoy before reaching the provider. This is
  network policy evidence, not an account authentication failure.
- `gh api repos/BlueDragon33/Bauman-master-ai-system` fails with Forbidden.
  Git fetch/push via the existing HTTPS Git proxy works. GitHub API access for
  opening a PR, dispatching/reading CI and checking exact-head acceptance does
  not work. No alternate network route or credential extraction was used.

Repository workflow references to Cloudflare Actions secrets are not evidence
that this session has those secrets, a Container-enabled account, a binding or
a sandbox that can pass real fixtures. A mock or local Docker result cannot
substitute for the selected Cloudflare provider.

## Preserved reference work

The initial local reference spike is isolated on
`codex/python04-local-sandbox-spike`, commit
`6e9df869d263d0d22f3cc27b13b347abb692d4bf`, pushed to origin and recoverable from
`/workspace/python04-local-sandbox-spike.bundle` (verified, requires the baseline
main commit above). It is not merged, not a canonical provider, and not PYTHON04
acceptance. Its companion defaults to denying execution; `--acceptance` is a
loopback-only test harness. No production or official assessment is enabled.

The spike exercises real Docker/cgroup/chroot/seccomp boundaries, 12 fixtures,
secret canaries, raw syscall/output attempts, startup cancellation, malformed
results, stale UI hints and cleanup failure. Tests exposed and fixed rejected
payload leakage, stale hint replacement, missing SyntaxError locations and an
ignored hash seed. These are useful reference findings only. CPython 3.12.12,
local Docker isolation and its public practice tests do not establish CPython
3.14.8 Cloudflare isolation, hidden official grading or first-attempt persistence.

## Required external handoff

The onboarding configuration draft
`d8c6dbf4-acbc-47e5-af83-c73b7dc2982f~cecfgdraft_ff35e1f0c5888194976cae01fe44a1a4`
was confirmed saved with `requires_publish=true`. It preserves existing
settings, retains `api.github.com`, adds `api.cloudflare.com`, declares the
non-secret `CLOUDFLARE_ACCOUNT_ID` requirement and a `CLOUDFLARE_API_TOKEN` secret
requirement restricted to `api.cloudflare.com`. No secret values were supplied.
Saving a draft has not applied or published the environment configuration.

To resume, review/save/publish the development environment draft and supply
credentials through environment settings for a non-production,
Container-enabled Cloudflare test account. A test Sandbox binding must then be
created/configured and the selected runtime image verified/pinned. Never send
secret values in chat. Follow `PYTHON04_CLOUDFLARE_SANDBOX_IMPLEMENTATION_PLAN.md`
and run the real provider fixtures, assessment isolation, integration and
browser tests before enabling any learner execution. Exact-head CI and review
must pass before PR merge. Production deployment remains separately prohibited.

## Release decision

Do not mark PYTHON04 PASS, open PYTHON05, merge the local reference spike,
claim remote CI success or enable a replacement execution path. This branch
records the external blocker; it does not redefine the chosen provider or
weaken any golden fixture/Constitution requirement.

## Exact-head reference receipts

At the isolated reference commit `6e9df869d263d0d22f3cc27b13b347abb692d4bf`:

- `node --test --test-concurrency=1 tests/python-p4-*.test.mjs`: 15/15 PASS,
  including 12 golden fixtures and real cleanup-failure injection.
- P1 forensic, P2 canonical, P3 assessment and P4 contract/wiring static gates:
  PASS. Integration: 491 checks / 15 subjects PASS.
- `tests/python-p4-browser.mjs`: desktop/mobile source and materialized package
  journeys PASS (run, public tests, trace/error, local hints, notebook replay,
  restart, cancel/stale, offline unavailable, reload/state preservation).
- The packaged artifact excludes `runtime/python`; preview materialization used
  explicit synthetic UUIDs/example.com origins. No deployment command ran.
- `git diff --exit-code`: clean at the tested reference SHA. Docker fixture
  cleanup removes the provider's containers; no shared learner state is written.

Local receipts are archived at `/workspace/python04-reference-evidence.tar.gz`.
They establish only the separately preserved reference implementation. Remote
required CI, selected Cloudflare provider proof and PYTHON04 acceptance remain
NOT RUN / BLOCKED. The terminal blocker branch changes governance/evidence only;
its exact-head local static receipt is recorded separately from reference tests.
