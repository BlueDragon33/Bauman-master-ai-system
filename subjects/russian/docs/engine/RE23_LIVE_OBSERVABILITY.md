# Russian Engine RE23 — Live Integration Observability & Rollback

State: VALIDATING

## Diagnostics

The live integration exposes bounded counters/status:
- evidence observed;
- RU04 bundles applied;
- duplicates;
- owner unavailable;
- bridge errors;
- planner compatibility/check count;
- last non-sensitive error code.

Diagnostics do not store:
- raw audio;
- transcript content;
- learner profile data.

## Rollback

Removing the opt-in query flag restores passive bootstrap behavior.

No Engine UI is mounted and no live owner controller is activated.

Already-written RU04 evidence remains historical evidence; rollback does not delete learning history.

## Containment

RU04 absence/bridge failure and planner incompatibility are contained inside Engine diagnostics and do not become learner failure.

## Exit

PASS when diagnostics are bounded/non-sensitive and opt-out rollback is immediate.
