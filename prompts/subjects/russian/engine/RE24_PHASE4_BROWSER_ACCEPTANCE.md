# RE24 — PHASE 4 BROWSER ACCEPTANCE

Canonical owners: RU08 + C3 + C4

Mission: prove live opt-in owner integration in a real browser while preserving the general Russian app.

## Required journeys

### Feature OFF
Open Russian app normally:
- no grounded Engine experience;
- no new RU04 attempt/evidence caused by Engine;
- no planner mutation;
- normal app behavior preserved.

### Feature ON
Open with `?ruEngine=grounded-v1`:
- grounded slice mounts;
- perform a correct or incorrect selection;
- Engine emits observation;
- observation bridges into existing RussianAssessmentMastery as non-authoritative evidence;
- no mastery is granted;
- planner compatibility can be inspected;
- planner itself is not patched.

### Failure
Simulate missing/incompatible owner:
- grounded experience still works;
- diagnostics report owner/bridge failure;
- no learner failure is fabricated.

### Packaged/offline
Repeat relevant feature-on path in packaged runtime where supported.
True-offline shell must remain valid.

## Exit
PASS when source + packaged browser evidence confirms live RU04 binding under opt-in, zero Engine writes with feature off, no mastery grant, no planner patch and no regression.
