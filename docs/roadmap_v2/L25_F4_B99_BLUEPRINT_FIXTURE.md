# L25-F4 — B99 Current-Blueprint Ranking Fixture Repair

Status: `FIX_APPLIED_PENDING_GATE`

## Trigger

Roadmap V2 Current Gate run `35338831853` failed in:

`Validate current L25 B99 Priority ranking`

with:

`AssertionError: Unknown Priority target: MATH-L1-C02`

## Root cause

The mixed-ranking validator fixture referenced `MATH-L1-C02`, which is not a target in the current Consumer Blueprint.

The Priority harness correctly failed closed on the unknown target. This is a validator-fixture defect, not a ranking-engine defect.

## Fix

The invalid fixture target is replaced with current Blueprint target:

`MATH-L2-C05`

The fixture keeps the same ranking characteristics:

- knowledge state: `dang_hoc`;
- master relevance: `0.9`;
- weeks until needed: `5`;
- candidate ID: `D`.

## Safety

No target-validation rule is weakened.

Unknown targets remain rejected. Priority formula, ranking order, persistence, scheduler write and runtime activation remain unchanged.

B100 remains blocked until F4 and B99 pass the complete six-gate set.
