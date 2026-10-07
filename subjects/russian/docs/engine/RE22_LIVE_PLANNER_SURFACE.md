# Russian Engine RE22 — Live Planner Compatibility Surface

State: VALIDATING

## Runtime

The live owner controller can inspect the existing RussianAdaptivePlanner schema/reasons and produce planner-compatible candidate tasks.

## Non-interference

It does not:
- replace buildPlan;
- replace explain;
- call setManualOverride;
- write planner storage;
- create a second Today plan.

The owner remains authoritative.

## Failure

An incompatible or missing planner returns:
- ok=false;
- zero candidates;
- compatibility errors.

The grounded learning experience is not blocked.

## Exit

PASS when live compatibility, deterministic candidates, no monkey-patch and zero manualOverride usage are proven.
