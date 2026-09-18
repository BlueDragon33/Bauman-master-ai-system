# L25-F1 — Floating-point Formula Validation Hardening

Status: `FIX_APPLIED_PENDING_GATE`

## Trigger

Roadmap V2 Current Gate run `35336375168` failed at:

`scripts/validate-roadmap-v2-l25-b97.mjs:50`

Observed:

- actual sum: `0.9999999999999999`
- expected: `1`

## Root cause

The B97 validator used strict floating-point equality for the sum of:

- 0.35
- 0.30
- 0.20
- 0.15

JavaScript IEEE-754 representation makes the direct sum slightly below 1 even though the contract values are correct.

This is a validator defect, not a Priority formula defect.

## Upgrade

The validator now:

1. still verifies the exact structured weights individually;
2. converts them to integer percentage basis points;
3. requires exactly `[35,30,20,15]`;
4. requires their integer total to equal `100`.

This is stricter and deterministic while avoiding false failures from binary floating-point representation.

## Safety

No Priority formula, runtime, score behavior, persistence, scheduler or production boundary was changed.

B97 remains blocked until L25-F1 and the complete six-gate set pass.
