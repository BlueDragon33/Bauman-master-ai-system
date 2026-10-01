# RU08 — Russian Authoring Lifecycle

Canonical lifecycle:

`DRAFT → VALIDATED → REVIEW_REQUESTED → APPROVED → CANONICAL_PATCHED → PUBLISHED → SUPERSEDED/ARCHIVED`

Alternative terminal path: `REJECTED`.

- **DRAFT**: non-canonical proposal.
- **VALIDATED**: owner/schema/local policy checks pass.
- **REVIEW_REQUESTED**: metadata-only envelope may enter shared Content Review.
- **APPROVED**: reviewer approves intent/diff; learner-facing truth is still unchanged.
- **CANONICAL_PATCHED**: reviewed repository patch updates the exact RU02 owner and passes affected owner gates.
- **PUBLISHED**: the accepted canonical patch is present in the authorized release artifact/content snapshot.
- **SUPERSEDED/ARCHIVED**: historical revision retained for audit/rollback compatibility.

Generated content cannot reach canonical patch unless RU03 authority permits the named claim. Meaning-changing published content creates a new revision rather than silently overwriting history.

The browser authoring surface never writes canonical datasets directly.
