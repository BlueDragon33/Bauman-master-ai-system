# Foundation V2 — L10 Step 6 Audit

## Scope

Step 6 adds deterministic registry snapshot import/export for packaging, transfer, backup, and later persistence adapters. It remains storage-neutral and network-neutral.

## Snapshot contract

`registry-snapshot.js` defines `BAUMAN_CONTENT_ASSET_REGISTRY_SNAPSHOT_V1` and provides:

- deterministic export of all registry record buckets;
- lexicographic record ordering by `registryId`;
- stable recursive object-key ordering for canonical JSON serialization;
- explicit `recordCount`;
- registry schema/version pinning;
- preservation of registry extensions;
- strict reconstruction with duplicate, bucket-type, record-count, registry-integrity, and provenance-integrity validation;
- canonical digest input suitable for a later signature/checksum envelope.

## Safety invariants

1. Export and import are read-only with respect to the source registry.
2. Snapshot import never writes browser storage, filesystem state, learner state, or network state.
3. Unknown record buckets fail closed.
4. Duplicate registry IDs fail closed.
5. Bucket name and registry ID record type must agree.
6. Missing references fail through the existing immutable registry validator.
7. Provenance cycles and invalid history fail through the existing provenance validator.
8. Unknown namespaced registry extensions survive round trips.
9. Serialization is deterministic for semantically identical object-key ordering.

## Why this step precedes persistence

A storage adapter should not invent its own serialization rules. Step 6 freezes a deterministic, fully validated interchange boundary first. Future persistence can store these snapshots without becoming a second registry authority.

## Gate

Step 6 requires all prior L10 gates plus:

- snapshot runtime syntax PASS;
- deterministic round trip PASS;
- canonical serialization PASS;
- extension preservation PASS;
- invalid JSON/schema/count/duplicate/bucket/reference negative tests PASS;
- read-only immutability PASS;
- Foundation Domain Model, Windows checkout, and Whole System Integration remain green.

Step 7 must not start until the expanded gate is green on GitHub Actions.
