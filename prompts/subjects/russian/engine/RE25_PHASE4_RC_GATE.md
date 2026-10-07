# RE25 — PHASE 4 RC GATE

Canonical owners: RU08 + C3 + C4

Mission: close live-owner integration as an opt-in release candidate without authorizing default-on or production.

## Required
- RE21 PASS;
- RE22 PASS;
- RE23 PASS;
- RE24 PASS;
- Russian Engine isolated suite PASS;
- Russian Reference UI PASS;
- Whole System Integration PASS;
- source grounded browser acceptance PASS;
- packaged grounded browser acceptance PASS;
- offline shell PASS.

## Rollout
Remain `OPT_IN_FLAG`.

No `INTERNAL_BETA`, `DEFAULT_ON_CANDIDATE`, `DEFAULT_ON` or production publish without separate explicit authorization.

## Exit
PASS means live opt-in owner integration is safe enough to merge.
It does not mean default-on and does not publish.
