# L9 Step 5 — Browser Bootstrap Integration

## Goal

Load the Foundation identity layer in the real Russian browser entry point without changing learner state, routes, UI, review, SRS, mastery, or legacy storage.

## Integration mode

`BAUMAN_FOUNDATION_IDENTITY_BOOTSTRAP_V1` runs in **silent-read-only** mode.

The Russian page loads, in order:

1. existing subject adapter/content contract/host bridge
2. canonical identity runtime
3. transactional overlay store library
4. legacy snapshot extractor
5. read-only browser bootstrap
6. existing planning/core/learning runtime

The bootstrap waits until `DOMContentLoaded` and then defers by one tick so legacy modules can finish their own initialization first.

## Browser behavior

The bootstrap:

- fetches `BAUMAN_LEGACY_MAPPING_REGISTRY_V1` from the same application origin;
- reads current legacy snapshots and current host task;
- extracts deterministic descriptors;
- reads any existing identity overlay through a fail-closed read-only adapter;
- plans canonical mappings in memory;
- exposes only `BAUMAN_FOUNDATION_IDENTITY_REPORT` and dispatches `bauman:foundation-identity-ready`;
- renders no UI and emits no learning/mastery/progress changes.

## Storage boundary

The storage adapter supplied to the overlay store has:

- `getItem()` enabled;
- `setItem()` throwing `FOUNDATION_IDENTITY_BOOTSTRAP_READ_ONLY`;
- `removeItem()` throwing `FOUNDATION_IDENTITY_BOOTSTRAP_READ_ONLY`.

Therefore even an accidental future call to `commit()` or `recover()` from the bootstrap path fails closed instead of writing.

## Corrupt overlay behavior

A corrupt persisted overlay is reported as `persistedStatus: corrupt`.

Step 5 does **not** attempt recovery or deletion in browser bootstrap mode. It plans a fresh in-memory overlay only for diagnostic/canonical read purposes. Recovery remains a separate explicit persistence responsibility.

## Acceptance requirements

The validator proves:

- correct script load order in `subjects/russian/index.html`;
- zero local/session storage writes;
- zero DOM/UI writes;
- legacy bytes unchanged before/after `buildReport()` and `run()`;
- deterministic descriptor/mapping counts;
- ready event/report exposure works;
- corrupt overlay handling remains read-only;
- all previous Foundation gates continue to pass.

## Verified result

- `FOUNDATION_BROWSER_BOOTSTRAP_GATE=PASS`
- `Foundation Domain Model Gate=SUCCESS`
- `Russian Reference UI Gate=SUCCESS`
- `Windows checkout safety=SUCCESS`
- `Bauman Cloudflare Preview CI=SUCCESS`
- Whole-system static validation and primary browser acceptance passed before any write-capable integration is allowed.

## Non-goals

- no overlay persistence from the live Russian page;
- no route migration;
- no canonical IDs injected into legacy records;
- no UI badges/debug/version labels;
- no mastery/review/SRS transformations;
- no service-worker/offline caching changes yet.

These remain deferred until later L9 steps and their own gates.
