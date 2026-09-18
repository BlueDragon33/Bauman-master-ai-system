# L27R2B0 — Contract hygiene audit

## Why this repair round exists

Before transplanting Roadmap contracts, semantic path validation found a historical metadata defect in the L22 consumer contract:

- historical: `subjects/math/theory-framework.json`
- real source: `subjects/math/data/theory-framework.json`

The historical path does not exist in either the old L27 tree or the modern runtime. The executable consumer/validator did not load this path directly, so previous gates could still pass; however the contract provenance metadata is inaccurate and must not be promoted unchanged.

## Repair

A candidate consumer contract is created under the recovery area with only the provenance path corrected. It remains:

- read-only;
- production-disconnected;
- runtime activation disabled;
- legacy mutation disabled.

## Migration contract quarantine

The historical migration contract pins baseline `e383912354673bdce7a0059d6b9a23799d74e689` and old inventory checksums. It is preserved byte-for-byte as evidence, but it is **not admitted to canonical Roadmap paths in R2B**.

L27R3 must regenerate its baseline/checksums against the modern source before admission.

## Admission result

- Consumer contract: repair candidate.
- Diagnostic, Mastery, Priority, Scheduler, Readiness contracts: byte-exact candidates for R2B.
- Migration contract: quarantined until R3.
- Runtime/UI changes: 0.
