# Post-release reconciliation · Deployment Propagation Fx

Status: `IMPLEMENTED · GATE_PENDING`

Baseline: `main@0674f5c93704078424897714f4bab9815e358ddd`

Roadmap relationship: **outside Roadmap V2**. L35 remains terminal and no L36 is opened.

## Trigger

PR #123 promoted E16R m_p07 recovery and the exact merge revision was deployed successfully:

- Preview: run `36079732967`, attempt 2 — SUCCESS.
- Production: run `36079959055` — SUCCESS.

The first preview attempt uploaded Control and Learning Runtime with the expected revision, but immediately after Control secret rotation the live Control `/__deployment` endpoint briefly returned the previous revision `f76ce9c4235cc11a36ee3649c699553b2bf67022`. Retrying the same immutable revision passed without a source change.

This is treated as deployment propagation/version sequencing hardening, not as an E16R application defect.

## Invariants

1. Preview and production deploy remain `workflow_dispatch` only.
2. Exact `GITHUB_SHA` remains mandatory; no non-empty/latest/eventual-any-revision fallback is allowed.
3. Wrong application identity, runtime identity or deployment channel fails immediately.
4. Transient HTTP/network failures and a stale revision may retry only inside a bounded window.
5. Retry exhaustion fails closed.
6. Control secret rotation is followed by a final authoritative Control deploy before smoke/read-back.
7. Preview and production D1 remain isolated.
8. Production still requires exact-preview-first promotion and the `bauman-production` environment.
9. No Roadmap V2 authority is extended and no L36 is created.

## Implementation

- `scripts/wait-cloudflare-deployment-revision.mjs`
  - bounded revision polling;
  - cache-busted `/__deployment` probes;
  - request timeout;
  - immediate identity/channel rejection;
  - exact revision only;
  - deterministic failure after exhaustion.
- `scripts/test-deployment-propagation-wait.mjs`
  - stale → exact convergence;
  - transient request recovery;
  - wrong identity immediate failure;
  - bounded stale-revision exhaustion.
- Preview and production deploy workflows:
  - final Control deploy after secret rotation;
  - bounded exact-revision waiter for Control and Learning Runtime;
  - existing D1/readiness/device/protected-data checks preserved.
- Preview CI, Production Publish Gate CI and Whole System Integration execute the waiter regression.

## Acceptance

The track may merge only after the final PR head passes:

- Current-Main Control-State Gate;
- Bauman Cloudflare Preview CI;
- Bauman Cloudflare Production Publish Gate CI;
- Whole System Integration Gate, including browser acceptance;
- Windows checkout safety;
- deployment propagation waiter regression.

After merge, live publication remains manual-only:

`merged SHA → DEPLOY_PREVIEW → exact-revision smoke → DEPLOY_PRODUCTION → production read-back/smoke`.

No release is considered complete before that exact chain passes.
