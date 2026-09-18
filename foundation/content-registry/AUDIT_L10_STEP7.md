# Bauman Foundation — Content, Asset & Provenance Registry — Step 7 Audit

## Scope

Step 7 adds a transactional persistence adapter for deterministic registry snapshots. The adapter stores only Step 6 canonical snapshots and never becomes an independent registry authority.

## Persistence boundary

`registry-snapshot-store.js` defines `BAUMAN_CONTENT_ASSET_REGISTRY_SNAPSHOT_STORE_V1` and provides:

- explicit final and staging storage keys;
- staging-first writes with exact read-back verification;
- final promotion only after the staging envelope validates;
- recovery from an interrupted write when a valid staging envelope exists;
- fail-closed handling for corrupt final/staging values;
- canonical snapshot payload verification through the Step 6 importer;
- metadata parity checks for snapshot schema, registry schema/version, and record count;
- a strict allowed-write-key list for storage adapters.

The adapter accepts any synchronous key-value object exposing `getItem`, `setItem`, and `removeItem`. It does not bind itself to localStorage, IndexedDB, filesystem storage, cloud databases, or network APIs.

## Authority rule

Persistence is transport only.

A stored payload is readable only when:

1. the store envelope schema is valid;
2. the embedded Step 6 snapshot is valid;
3. the embedded snapshot is already in canonical serialization form;
4. the envelope metadata exactly matches the validated snapshot;
5. Step 6 registry and provenance integrity checks pass.

The persisted envelope cannot create, repair, or reinterpret registry records.

## Safety invariants

1. Source registries are never mutated by seal, commit, read, verify, or recovery.
2. Writes touch only the configured final and staging keys.
3. A failed staging read-back leaves the final key untouched.
4. A failed final read-back retains staging for recovery.
5. Corrupt final data never overrides a valid staging transaction.
6. Recovery re-validates the envelope before promoting it.
7. No learner state, subject UI, legacy path, browser route, or service worker behavior changes.
8. No authentication, entitlement, cloud synchronization, or cross-device merge is introduced.
9. No learner-visible version badge is introduced.

## Gate

Step 7 requires all prior L10 gates plus:

- snapshot-store runtime syntax PASS;
- canonical transactional commit/read PASS;
- interrupted-write recovery PASS;
- source-registry immutability PASS;
- allowed-write-key boundary PASS;
- invalid adapter/config/timestamp negative tests PASS;
- tampered metadata/schema/noncanonical snapshot negative tests PASS;
- corrupt-final and failed-readback negative tests PASS;
- Foundation Domain Model, Windows checkout, and Whole System Integration remain green.

Step 8 must not start until the expanded gate is green on GitHub Actions.


## Repair 7.1 — packaged browser reload race

Whole System Integration run `35345090191` exposed a deterministic acceptance race after the initial Step 7 implementation.

Evidence:

- all thirteen prerequisite-pack paths existed in the branch and runtime package;
- the packaged HTTP server returned `200` for all thirteen pack files;
- Chromium still reported all thirteen as `net::ERR_ABORTED`;
- the aborts occurred because the acceptance flow reloaded the Hub while `academic-main.js` was still resolving its background `Promise.allSettled` pack load.

Repair rule:

1. Academic runtime publishes an explicit prerequisite-pack readiness status.
2. The status records expected, loaded and failed pack counts only after every manifest request resolves.
3. Browser acceptance must wait for `ready=true`, require `failed=0`, and require `loaded===expected` before intentional reload.
4. The same readiness check is repeated after reload.
5. No blanket `ERR_ABORTED` exception is added; genuine failed requests remain gate failures.

Step 8 remains blocked until the repaired Step 7 head passes the complete gate set.
