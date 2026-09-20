# L27R2B0-F1 — Repair R2A validator phase coupling

## Trigger

Roadmap V2 Reconciliation Gate run `35324553585` failed at:

`Validate R2A byte-exact historical archive`

All earlier/current-system gates that had completed remained green.

## Root cause

The R2A validator mixed two different responsibilities:

1. permanent verification that the R2A historical archive remains byte-exact;
2. temporary R2A-only restrictions forbidding files introduced by later recovery phases.

Once R2B0 legitimately added its own validator, the old R2A diff whitelist became stale and rejected valid later-phase files.

## Fix

R2A is now a timeless evidence gate. It verifies only:

- the 16 archived files exist;
- every archived file retains the exact historical Git blob SHA;
- archived execution state says L27/B108 complete and L28/B109 next;
- L22 and L27 archived acceptance records remain PASS.

Current-phase mutation boundaries remain the responsibility of the current phase validator (R2B0 now, later R2B/R2C/etc.).

## Safety

No runtime, Foundation, Russian, Math or Hub file is changed by this repair.
