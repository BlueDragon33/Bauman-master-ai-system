# Russian Engine Phase 6 — Data-driven World Runtime

State: VALIDATING

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
