# Russian Engine Phase 6 — Data-driven World Runtime

State: **PASS**

## Scope

RE31–RE35 generalize the grounded learner experience from a two-scene proof into a data-driven world catalog.

## Scene schema

RE31 validates scene identity, revision, linguistic authority state, setting, semantic targets, Russian stimulus, world objects, expected action, consequence, support policy, transfer group and capability requirements.

## Real-life pack

RE32 provides 15 fixture scenes across:
- room;
- shop;
- metro;
- dormitory;
- university.

All new Russian wording remains FIXTURE_NONCANONICAL_PENDING_RU03.

## Adaptive selection

RE33 distinguishes:
- remediation after failure/high support;
- unseen transfer after independent success;
- new content by setting;
- fail-closed unavailable capability.

## Generic renderer

RE34 selects catalog via ruWorld and setting via ruSetting.
The same grounded renderer handles all five settings.
Existing grounded-v1 remains unchanged by default.

## Release boundary

RE35 requires Engine + Russian UI + source/packaged/offline browser regressions.
Rollout remains OPT_IN_FLAG.


## Exact-head validation

Validated implementation HEAD:

`73b57888f2d549316f9943ff67e0d10d6e941662`

Evidence:
- Development Fast CI: **PASS**;
- Russian Engine isolated suite: **PASS**;
- Universal Constitution Compliance: **PASS**;
- Russian Reference UI Gate: **PASS**;
- Whole System Integration Gate: **PASS**;
- Russian Engine grounded source browser acceptance: **PASS**;
- Russian Engine grounded packaged browser acceptance: **PASS**;
- Russian true-offline source + packaged acceptance: **PASS**;
- Russian P1 source + packaged acceptance: **PASS**;
- whole-system packaged browser regression: **PASS**.

## Adaptive selector integration proof

Validation found and fixed a real integration gap: RE33 existed as a tested selector but RE34 still used legacy first/transfer selection.

The final runtime now:
- validates `real-life-v1` through RE31 schema v2;
- selects real-life scenes through RE33;
- scopes adaptive selection to requested `ruSetting`;
- tracks session completed scenes + observations;
- routes independent success to unseen transfer;
- routes high-support success to remediation;
- keeps legacy `grounded-v1` unchanged;
- precaches RE31/RE33 runtime dependencies for true offline parity.

Browser proof:
`room → rl-01-room → independent success → rl-02-room`
with selector reason `unseen-transfer`.

**RE31–RE35 PASS.**
