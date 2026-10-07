# RE16 — CANONICAL CONTENT PROMOTION

Canonical owners: RU03 + RU08 + C3 + C4

Mission: provide a fail-closed promotion pipeline from Engine fixture/generated content to reviewed canonical-reference content without allowing the Engine to declare linguistic truth.

## States
DRAFT
→ GENERATED_UNREVIEWED / FIXTURE_NONCANONICAL
→ REVIEW_CANDIDATE
→ RU03_APPROVED
→ PUBLISHED_REFERENCE
→ SUPERSEDED / ARCHIVED.

No state may be skipped silently.

## Promotion requirements
A candidate must declare:
- stable content ID;
- revision;
- source/provenance;
- Russian text or external canonical ref;
- linguistic facts requiring review;
- semantic target;
- competency mapping;
- accepted variants where relevant;
- media rights;
- reviewer decision;
- review timestamp/revision.

## Engine boundary
Engine may prepare candidate records and validate completeness.
Only RU03-authorized review may produce RU03_APPROVED.
Published Engine artifacts should prefer canonical refs over copied truth.

## Generated content
AI-generated or heuristic content starts GENERATED_UNREVIEWED.
It may be useful for temporary practice but cannot enter canonical/sellable packs as truth without promotion.

## Exit
PASS when invalid/skipped promotions fail, approved promotion requires an RU03 decision record, revisions are immutable, and supersession preserves history.
