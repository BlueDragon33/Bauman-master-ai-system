# L9 Step 6 — Verified Overlay Persistence in Browser

## Goal

Persist the canonical identity overlay from the real Russian browser runtime without changing legacy state, routes, UI, review, SRS, mastery, or any existing subject contract.

## Persistence contract

Browser persistence is explicitly limited to `verified_overlay_only`.

Allowed keys:

- `bauman_identity_overlay_v1`
- `bauman_identity_overlay_v1_staging`

All legacy stores remain authoritative and are compared byte-for-byte before/after persistence operations.

## Safety behavior

The browser persistence bridge:

- accepts only a valid `BAUMAN_FOUNDATION_IDENTITY_BOOTSTRAP_V1` report;
- verifies the planned overlay checksum before any write;
- performs staging → read-back verify → final → read-back verify → staging cleanup;
- performs no rewrite when the persisted overlay is already semantically identical;
- recovers only from a valid staging envelope with the same planned checksum;
- blocks on corrupt existing overlay instead of auto-repairing or deleting it;
- emits only an internal persistence report/event and renders no learner UI;
- never embeds or writes any legacy storage key.

## Runtime bug caught by the gate

The first Step 6 validator run exposed a single-flight lifecycle defect. `inFlight` could retain the already-resolved first persistence promise, causing later calls to reuse the first `persisted` result forever instead of re-evaluating storage and returning `unchanged`.

The implementation now separates the operation promise from the public async lifecycle and clears `inFlight` only after the awaited operation settles. The validator additionally proves that two concurrent callers share one transaction while later sequential calls re-evaluate state normally.

The staging recovery fixture was also corrected to use the real `store.seal()` envelope contract (`storeVersion`, `overlaySchema`, `committedAt`, checksum) instead of a hand-built stale shape.

## Acceptance coverage

Static/VM gate proves:

- first valid persistence = `persisted`;
- repeated identical overlay = `unchanged` with zero set/remove operations;
- concurrent callers perform exactly one staging/final/cleanup transaction;
- valid staging = verified `recovered`;
- corrupt final overlay = `blocked-corrupt`, byte-for-byte untouched;
- tampered bootstrap overlay/checksum = `blocked-integrity`;
- all non-read storage mutations target only the two overlay keys;
- every legacy storage value remains byte-for-byte unchanged.

Real-browser acceptance proves the same core lifecycle in Chromium:

1. first Russian load persists a valid overlay;
2. reload returns `unchanged` and preserves persisted envelope bytes;
3. corrupt overlay is blocked and not silently replaced;
4. no Foundation debug/schema text leaks into learner UI;
5. the acceptance passes in both source runtime and packaged ChatGPT Site runtime.

## Verified result

Head verified: `220f6bf85137bc560f3fa7d4bd9d4c34f01e0444`.

- `FOUNDATION_IDENTITY_PERSISTENCE_GATE=PASS`
- Foundation Domain Model Gate = SUCCESS
- Russian Reference UI Gate = SUCCESS
- Windows checkout safety = SUCCESS
- Bauman Cloudflare Preview CI = SUCCESS
- Whole System Integration Gate = SUCCESS
- normal Foundation identity persistence browser acceptance = SUCCESS
- packaged Foundation identity persistence browser acceptance = SUCCESS
- normal and packaged Hub responsive acceptance = SUCCESS

## Non-goals

- no legacy record rewrite;
- no canonical ID injection into legacy JSON;
- no canonical identity rendered in learner UI;
- no route migration;
- no mastery/evidence conversion;
- no removal of legacy stores;
- no destructive corrupt-overlay recovery.

Step 7 may now expose a read-only canonical projection API to consumers while preserving these boundaries.
