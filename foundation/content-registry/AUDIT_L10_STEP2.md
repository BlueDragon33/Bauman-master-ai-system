# Bauman Foundation — Content, Asset & Provenance Registry — Step 2 Audit

## Scope

Step 2 adds the first executable registry core while remaining isolated from subject UI, learner state, browser persistence, and legacy content loading.

## Runtime

`content-asset-registry.js` provides a pure immutable registry API:

- creates and normalizes `BAUMAN_CONTENT_ASSET_REGISTRY_RUNTIME_V1` registries;
- parses stable `bdr:<recordType>:<namespace>:<localId>` identities;
- delegates canonical `bd:*` identity parsing to the promoted L9 identity runtime;
- validates portable repository, HTTPS, and content-hash locators;
- appends source/checksum/asset/provenance/content/access records without mutating the input registry;
- rejects duplicate identities instead of overwriting history;
- requires referenced checksum/source/asset/provenance/access scope records to exist;
- exposes read-only lookup, type listing, canonical indexing, and full integrity validation.

## Safety invariants

1. No storage adapter is introduced in Step 2.
2. No DOM/browser integration is introduced in Step 2.
3. Existing L9 canonical identity runtime is reused instead of reimplemented as a competing identity system.
4. Provenance records are append-only because duplicate registry IDs cannot replace existing records.
5. Invalid/missing dependencies fail closed.
6. Read operations must not mutate registry state.

## Gate

Step 2 requires:

- Step 1 contract gate still PASS;
- runtime syntax PASS under Node 22;
- full fixture materialization PASS;
- canonical index PASS;
- duplicate-record, missing-checksum, missing-lineage, non-portable-path, insecure-URL, malformed-ID, and malformed-checksum negative tests PASS;
- L9 Domain Model Gate remains PASS.

Step 3 must not start until this expanded gate is green on GitHub Actions.
