# L9 Step 7 — Durable Canonical Read Projection

## Goal

Expose canonical Foundation identities to browser consumers without replacing, rewriting, or mutating the existing Russian runtime state.

Step 7 is a **read-path integration only**. Legacy Russian stores remain authoritative for learning state, mastery, review, SRS, resume, routes, and academic activity.

## Runtime layers

The Russian browser entry point now loads the identity stack in this order:

1. canonical identity runtime
2. transactional identity overlay store
3. legacy snapshot extractor
4. canonical read projection core
5. silent identity bootstrap
6. verified overlay persistence bridge
7. canonical projection bridge
8. existing Russian learning runtime

This order makes the canonical read API available only after the durable overlay has been independently verified.

## Canonical projection contract

`BAUMAN_CANONICAL_READ_PROJECTION_V1` provides an immutable read model over the verified overlay.

Supported operations:

- legacy identity -> canonical ID;
- canonical ID -> legacy mapping rows;
- exact mapping resolution;
- filtered mapping enumeration;
- record projection that clones the legacy record and attaches canonical identity metadata without mutating the source record;
- projection summary/status.

Unknown mappings return `null`. They are never invented or inferred from display labels.

## Durability boundary

A projection is exposed as durable only when all of the following are true:

- browser bootstrap report is present;
- persistence status is one of `persisted`, `unchanged`, or `recovered`;
- persisted overlay checksum matches the bootstrap-planned checksum;
- overlay/store schema is valid.

If persistence is missing, corrupt, blocked, or checksum verification fails, the projection fails closed and exposes no stale mapping rows.

## Immutability and ownership

The projection layer:

- does not write localStorage or sessionStorage;
- does not render or modify learner UI;
- does not mutate legacy records;
- does not mutate the verified overlay;
- deep-freezes exposed projection rows;
- does not change mastery, Review Queue, SRS, progress, routes, or resume state;
- does not make canonical data authoritative over legacy learning state.

## Browser bridge

`BAUMAN_FOUNDATION_IDENTITY_PROJECTION_BRIDGE_V1` listens to verified identity bootstrap/persistence events and exposes the durable projection to browser consumers through the Foundation projection API/report.

A corrupt overlay after reload produces a blocked projection with zero retained rows and no stale canonical lookup.

## Packaging safeguards

Both runtime materializers now require the complete projection dependency chain:

- `canonical-identity-runtime.js`
- `identity-overlay-store.js`
- `legacy-snapshot-extractor.js`
- `canonical-read-projection.js`
- `foundation-identity-bootstrap.js`
- `foundation-identity-persistence.js`
- `foundation-identity-projection.js`
- `legacy-mapping-registry.v1.json`

The Russian packaged HTML is also checked for all required Foundation script references. Missing projection infrastructure therefore fails at packaging time rather than becoming a browser 404.

## Regression found and fixed

The first real-browser projection acceptance failed on the unknown-mapping assertion even though runtime behavior was correct.

The test used nullish coalescing:

`canonicalFor(...) ?? 'unexpected'`

Because the correct API result for an unknown mapping is `null`, the test itself converted the valid result into the sentinel string. The test was corrected to distinguish a missing API function from a valid `null` lookup result. The projection runtime contract was not changed.

## Verified acceptance

On commit `3014bf32496dc8d400edbb3e025ad1d037bd6ea6`:

- Foundation Domain Model Gate = SUCCESS
- Russian Reference UI Gate = SUCCESS
- Windows checkout safety = SUCCESS
- Bauman Cloudflare Preview CI = SUCCESS
- Whole System static integration = SUCCESS
- normal whole-system browser acceptance = SUCCESS
- normal identity persistence browser acceptance = SUCCESS
- normal canonical projection browser acceptance = SUCCESS
- Math Study Command Center browser acceptance = SUCCESS
- normal Hub responsive acceptance = SUCCESS
- ChatGPT Site package materialization = SUCCESS
- packaged whole-system browser acceptance = SUCCESS
- packaged identity persistence acceptance = SUCCESS
- packaged canonical projection acceptance = SUCCESS
- packaged Hub responsive acceptance = SUCCESS

## Step 7 checkpoint

**L9 Step 7 = PASS.**

Canonical identity can now be consumed safely through a durable, immutable, fail-closed read projection while every existing Russian learning store and decision path remains unchanged.

## Deferred

Step 7 deliberately does not:

- inject canonical IDs into legacy records;
- change route/query formats;
- migrate mastery/SRS/review state;
- allow AI to write canonical state;
- replace existing subject contracts;
- delete or rename legacy storage keys.

Any later integration must consume the projection through an explicit adapter and must preserve these invariants unless a separately gated migration proves otherwise.
