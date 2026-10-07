# RE22 — LIVE PLANNER COMPATIBILITY SURFACE

Canonical owner: RU04 / RussianAdaptivePlanner

Mission: let Russian Engine inspect the real RussianAdaptivePlanner and produce planner-compatible candidates without modifying or impersonating the canonical planner.

## Important boundary
Do not patch or replace `RussianAdaptivePlanner.buildPlan`.
Do not use `setManualOverride`.
Do not inject tasks into planner storage.
Do not create a second Today plan.

## Surface
The Engine integration bridge may expose:
- planner compatibility status;
- deterministic candidate generation from Engine state/evidence;
- reason codes and source;
- candidate diagnostics.

The canonical planner remains the sole final-plan authority.

## Compatibility
Validate current planner schema and required reason codes before producing candidates.
If incompatible, fail closed and return diagnostics.

## Exit
PASS when live planner compatibility can be inspected through Engine, candidates match current planner vocabulary, no owner method is patched, manualOverride remains unused, and feature-off behavior is unchanged.
