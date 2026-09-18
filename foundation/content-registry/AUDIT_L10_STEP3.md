# Bauman Foundation — Content, Asset & Provenance Registry — Step 3 Audit

## Scope

Step 3 adds cryptographic asset integrity without introducing storage, network access, DOM integration, or subject runtime coupling.

## Integrity engine

`asset-integrity.js` provides a cross-platform WebCrypto SHA-256 API:

- hashes strings, `ArrayBuffer`, and typed-array/DataView inputs;
- preserves typed-array `byteOffset` and `byteLength` semantics;
- creates immutable SHA-256 checksum registry records;
- creates canonical `content_hash` locators;
- verifies both SHA-256 digest and byte length;
- returns `verified` only when both fields match;
- returns `quarantined` on digest/length corruption;
- verifies that an asset points to the exact checksum record being used;
- plans a successor asset record instead of mutating a published asset record.

## Safety invariants

1. SHA-256 is the only accepted integrity algorithm in V1.
2. Digests are lowercase 64-character hex strings.
3. Integrity verification is read-only.
4. Asset state changes are represented as successor records with `supersedesId`; existing registry records are never overwritten.
5. No OS-specific hashing behavior is used; bytes are hashed through WebCrypto.
6. No file-system path, browser storage key, learner state, or legacy content is changed.

## Gate

Step 3 requires:

- Step 1 contract gate remains PASS;
- Step 2 immutable registry runtime gate remains PASS;
- SHA-256 known vectors for empty bytes and `abc` PASS;
- string, `ArrayBuffer`, and typed-array-view hashing PASS;
- corruption produces `quarantined` PASS;
- malformed algorithm/digest/length/checksum reference/successor ID negative tests PASS;
- Foundation Domain Model, Windows checkout, and Whole System Integration gates remain PASS.

Step 4 must not start until the expanded Content Asset Provenance gate and the system gates are green.
