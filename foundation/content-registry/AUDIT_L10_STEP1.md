# Foundation V2 — L10 Step 1 Audit

## Scope

L10 Step 1 establishes the contract boundary for the Content + Asset + Provenance Registry. It is intentionally runtime-neutral: no learner state, subject runtime, legacy content path, or current storage contract is rewritten.

## Added contract surface

- `registry-contract.v1.json` defines registry-scoped identity for asset, content, source, provenance, checksum, and access records.
- Registry records link back to L9 canonical domain identities through `canonicalEntityId`; L10 does not add or rename L9 canonical kinds.
- The exact L9 `domain-contract.v1.json` baseline is pinned by Git blob SHA `0691acecbec6734cb746aa9cb745350880a98d59`.
- Assets require SHA-256 integrity records.
- Provenance is append-only and transformed/generated content must retain lineage.
- Canonical repository locators are OS-neutral: forward-slash relative paths only; Windows/Unix absolute paths and parent traversal are rejected.
- Access policy defaults to private and is represented as a separate registry record.

## Compatibility invariants

1. Additive only.
2. Existing Russian/runtime contracts remain authoritative for their current scope.
3. No existing content file is moved, renamed, or rewritten in Step 1.
4. No local/session storage mutation is introduced.
5. L9 domain contract must remain byte-for-byte identical to its promoted baseline.
6. Registry IDs are not domain IDs; they must reference canonical L9 `source` or `artifact` IDs where canonical identity is required.

## Gate

The Step 1 gate requires all of the following:

- existing Foundation Domain Model validator PASS;
- Content + Asset + Provenance registry validator PASS;
- valid registry fixture PASS;
- negative contract tests reject malformed checksum, OS-specific absolute paths, traversal, missing lineage, and display-derived IDs;
- JSON parse and Node syntax checks PASS.

Step 2 must not start until the GitHub Actions gate for this step is green.
