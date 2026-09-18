# Foundation V2 — L10 Step 8 Audit

## Scope

Step 8 adds a cryptographic SHA-256 integrity envelope for deterministic registry snapshots. It builds on the Step 3 cross-platform integrity engine and the Step 6 canonical snapshot boundary.

It is integrity protection, not identity authentication or digital signing.

## Integrity envelope

`registry-snapshot-integrity.js` defines `BAUMAN_CONTENT_ASSET_REGISTRY_SNAPSHOT_INTEGRITY_V1` and provides:

- canonical snapshot sealing;
- SHA-256 digest and byte-length binding;
- registry schema/version and record-count parity checks;
- strict canonical-serialization verification;
- verified import that fails closed on integrity mismatch;
- deterministic envelope serialization;
- read-only verification that does not mutate registry state.

## Security boundary

The SHA-256 envelope detects accidental corruption and uncoordinated snapshot modification.

It does **not** prove who created a snapshot. An actor able to modify both the snapshot and checksum can recompute SHA-256. Authenticity, signer identity, key management, remote trust, and digital signatures remain outside Step 8.

This distinction is enforced in tests: a structurally valid modified snapshot with the old checksum fails, while the same snapshot with a correctly recomputed checksum is accepted as internally consistent but not authenticated.

## Safety invariants

1. Step 8 never bypasses Step 6 snapshot validation.
2. The digest is always computed over canonical Step 6 serialization.
3. Metadata mismatch fails before a snapshot is returned to consumers.
4. Invalid checksum shape fails closed.
5. Checksum mismatch fails closed.
6. Seal, verify, import, and serialize do not mutate source registry state.
7. No browser storage, filesystem storage, cloud storage, network call, authentication, entitlement, learner state, subject UI, or route behavior is introduced.
8. Existing Step 7 persistence remains transport-only and is not silently rewritten.
9. No learner-visible version badge is introduced.

## Gate

Step 8 requires all prior L10 gates plus:

- snapshot-integrity runtime syntax PASS;
- SHA-256 seal/verify/import PASS;
- canonical serialization and metadata parity PASS;
- checksum/schema/timestamp/noncanonical/tamper negative tests PASS;
- explicit non-signature boundary test PASS;
- source-registry immutability PASS;
- Foundation Domain Model, Academic Prerequisite, Cloudflare Preview, Windows checkout, and Whole System Integration remain green.

Step 9 must not start until the expanded gate is green on GitHub Actions.
