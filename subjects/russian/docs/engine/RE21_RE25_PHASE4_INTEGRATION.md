# Russian Engine Phase 4 — Integration Hub

State: **RE21–RE24 PASS · RE25 AWAITING AUTHORIZATION**

## RE21
Integration transaction hub composes RE17 + RE18 without becoming mastery/planner authority.

## RE22
Durable outbox provides idempotent enqueue, retryable delivery and delivered-history retention.

## RE23
Pack resolver requires one explicit active revision and rejects incompatible Engine API versions.

## RE24
Compatibility dry-run is read-only.

Against the current app contract it should identify:
- assessment owner available;
- planner owner available;
- speech owners available;
- Engine bootstrap available;
- planner candidate-source seam missing.

## RE25 boundary

No outside-Engine write occurs yet.

The expected minimum cross-boundary allowlist is:
1. subjects/russian/assets/adaptive-planner.js — add an explicit Engine candidate-source seam, not manualOverride;
2. subjects/russian/sw.js — precache newly browser-loaded integration modules if/when the hub is connected for true offline parity.

Additional outside files are forbidden unless fresh evidence proves they are necessary.

Rollout remains OPT_IN_FLAG.


## Exact-head validation

Validated implementation HEAD:

`e49a4aee54b2edb7b5a6f253e424b7d3b09bf2fa`

Evidence:
- Development Fast CI: **PASS**;
- Russian Engine isolated auto-discovered suite: **PASS**;
- Universal Constitution Compliance: **PASS**;
- Prompt Control Center CI: **PASS**;
- Russian Reference UI Gate: **PASS**;
- Whole System Integration Gate: **PASS**;
- Russian P1 source browser acceptance: **PASS**;
- packaged Russian P1 browser acceptance: **PASS**;
- Russian Engine grounded slice source + packaged acceptance: **PASS**;
- Russian true-offline shell source + packaged acceptance: **PASS**.

## RE25 authorization boundary

No outside-Engine write has occurred.

Exact requested cross-boundary allowlist:

1. `subjects/russian/assets/adaptive-planner.js`
   - add an explicit registered candidate-source seam;
   - preserve `RussianAdaptivePlanner` as final planner owner;
   - do not use or impersonate `manualOverride`;
   - candidate sources are read-only inputs to `buildPlan()`.

2. `subjects/russian/sw.js`
   - precache only the newly browser-loaded Engine integration modules needed by the approved seam;
   - preserve existing offline behavior and cache policy;
   - no unrelated service-worker rewrite.

Any additional outside-Engine file remains forbidden without new evidence + authorization.

Rollout remains `OPT_IN_FLAG`.
