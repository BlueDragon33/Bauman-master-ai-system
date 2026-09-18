# L25-F2 — Packaged Hub Safe-Shell Readiness Race

Status: `FIX_APPLIED_PENDING_GATE`

## Trigger

Whole System Integration run `35336485020` failed only at:

`Run packaged Hub V2 responsive acceptance`

with:

`AssertionError: Canonical detail toggle missing`

The source-browser Hub responsive acceptance passed on the same head.

## Root cause

The acceptance helper waited for:

- Safe Shell API existence; and
- `.hub-safe-dashboard`.

It did **not** wait for the Safe Shell's own complete readiness condition before immediately asserting the canonical detail toggle and appearance presets.

On the slower packaged runtime, the test could observe an intermediate additive-shell state and report a false missing-toggle failure.

## Fix

The browser acceptance now waits until all of the following are simultaneously true:

- `BAUMAN_HUB_SAFE.selfCheck().ready === true`;
- premium dashboard exists;
- canonical detail toggle exists;
- exactly three appearance presets exist.

The later assertions are unchanged.

## Safety

This does not weaken the UI contract and does not change production runtime code, canonical learning data, Roadmap contracts, Priority scoring, persistence, scheduler or runtime activation.

B97 remains blocked until F2 passes the complete gate set.
