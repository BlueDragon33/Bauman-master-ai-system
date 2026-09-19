# L25-F2 — Packaged Hub Safe-Shell Readiness Race

Status: `PASS`

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


## Full gate evidence

Accepted repair/B97 head: `28e730595828b326ba0f7409cb79821460e02d76`

- Roadmap V2 Current Gate — run `35336940531` — PASS
- Foundation Domain Model — run `35336940521` — PASS
- Windows checkout safety — run `35336940515` — PASS
- Russian Reference UI — run `35336940503` — PASS
- Cloudflare Preview — run `35336940527` — PASS
- Whole System Integration — run `35336940529` — PASS
