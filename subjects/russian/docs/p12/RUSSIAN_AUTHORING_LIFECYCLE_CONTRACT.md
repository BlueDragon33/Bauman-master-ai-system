# Russian P12 Authoring Lifecycle Contract

Canonical candidate lifecycle:

`DRAFT → VALIDATED → REVIEW_REQUESTED → APPROVED → CANONICAL_PATCHED → PUBLISHED`

Alternative terminal path: `REJECTED`.

## Meaning
- **DRAFT:** editable candidate, non-canonical.
- **VALIDATED:** schema + owner + local policy checks pass.
- **REVIEW_REQUESTED:** metadata envelope may be submitted to Content Review.
- **APPROVED:** reviewer approved metadata/diff intent; still non-canonical.
- **CANONICAL_PATCHED:** reviewed repository patch has changed the exact P3 owner and passed CI.
- **PUBLISHED:** accepted canonical patch is available through the authorized release path.

Generated candidates additionally require P7 provenance to reach VERIFIED before canonical patch.

The control-service status named `published` is review metadata and must not be interpreted as an automatic canonical-content write.
