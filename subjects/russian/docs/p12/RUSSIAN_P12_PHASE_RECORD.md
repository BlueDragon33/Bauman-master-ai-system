# Russian P12 Phase Record

1. **Mission:** make Russian content authoring sustainable and reviewable without bypassing canonical ownership.
2. **Preconditions:** P0-P6 FOUNDATION_LOCKED; P7-P11 PASS; main `1c722fd7dd7525e960f2d8bb0fb36312705448be`.
3. **Inputs:** P3 owner registry, P7 provenance, P10 generated-content policy, existing Content Review service, current Russian datasets.
4. **Canonical owners affected:** no owner replacement; P12 resolves and patches existing P3 owners only after review.
5. **Allowed changes:** authoring governance/schema, candidate lifecycle, staging/import/export, review envelopes, validators/docs.
6. **Forbidden changes:** second content DB; direct candidate/import canonical overwrite; mastery/SRS/planner/audio authority; skipped provenance.
7. **Required deliverables:** authoring constitution, lifecycle/editor/bulk contracts, governance JSON, candidate schema/tool, risk/evidence records, validator.
8. **Runtime tests:** existing Russian and full-system source/package regressions; Content Review contract tests remain valid.
9. **Static/schema tests:** owner resolution, lifecycle order, metadata-only review, hash/diff/provenance requirements.
10. **Data/state migration:** none.
11. **Regression scope:** P3/P7/P10/P11 plus control-service Content Review invariants.
12. **Evidence index:** `RUSSIAN_P12_EVIDENCE_INDEX.md`.
13. **Risk register delta:** `RUSSIAN_P12_RISK_REGISTER.md`.
14. **Rollback:** remove additive P12 files/workflow step; existing Content Review and canonical datasets remain unchanged.
15. **Exit gate:** future content can be staged, validated, reviewed and canonically patched without code surgery or architecture drift.
16. **PR/merge rule:** merge only after P12 validator + Content Review contracts + Russian/full-system browser/package regressions PASS.
17. **Production effect:** none; P17 only.

- **State:** IN_PROGRESS
- **Change class:** C/E — authoring governance/tooling; no destructive migration.
