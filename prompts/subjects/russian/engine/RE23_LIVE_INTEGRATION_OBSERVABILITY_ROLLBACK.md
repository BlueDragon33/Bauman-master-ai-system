# RE23 — LIVE INTEGRATION OBSERVABILITY & ROLLBACK

Canonical owners: RU08 + C3

Mission: make opt-in live integration diagnosable and trivially reversible without exposing sensitive learner content.

## Runtime diagnostics
Track bounded counters/status only:
- feature requested;
- grounded mounted;
- evidence observed;
- RU04 bundles applied;
- duplicate bundles;
- owner unavailable;
- bridge errors;
- planner compatible/incompatible;
- last non-sensitive error code.

Do not log raw learner audio.
Do not persist transcripts in diagnostics.
Do not include private learner profile data.

## Rollback
Removing the opt-in query flag must restore passive behavior immediately.
No migration is required to disable the Engine UI.
Already-written RU04 evidence remains historical evidence and must not be deleted by rollback.

## Failure containment
Owner integration failure must not crash the general Russian app.
Planner incompatibility must not block the grounded experience.

## Exit
PASS when diagnostics are bounded/non-sensitive, feature-off rollback is immediate, and integration failures remain contained.
