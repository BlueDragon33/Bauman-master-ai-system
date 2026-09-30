# Russian P12 Authoring · Content Governance Constitution

## Mission
Allow Russian content to be proposed, validated, reviewed and promoted without code surgery, duplicate truth owners or silent canonical mutation.

## Authority chain
- P3 owns canonical content paths and the one-owner rule.
- P7 owns linguistic provenance and verification.
- P4 owns assessment/mastery truth.
- Existing Content Review service owns review metadata and role/CAS semantics only.
- P12 owns candidate lifecycle, schema-aware authoring, validation, diff/review and safe bulk staging.

## Hard rules
1. Candidate/editor/import tools never write canonical datasets directly.
2. Control-service Content Review remains metadata-only and never stores learning content bodies.
3. A canonical patch must target the exact P3 owner path for the named responsibility.
4. Generated content begins non-canonical and must satisfy P7 provenance before promotion.
5. Approval and canonical merge are separate events; approval alone never changes learner-facing truth.
6. Derived indexes are regenerated from canonical IDs rather than hand-authored as independent facts.
7. Bulk import is staging-only; each item is independently validated and reviewable.
8. Every canonical candidate carries rollback note, diff summary, revision and content hash.
9. Publish cannot skip validation/review/provenance states.
10. P12 does not grant the editor authority over mastery, SRS, planner, audio or speech engines.

## Exit
A maintainer can create or bulk-stage a candidate, resolve its canonical owner, validate provenance/schema, obtain review metadata, inspect the diff and promote through a reviewed repository patch without architectural drift.
