# Russian P11 Phase Record

1. **Mission:** integrate curriculum into real-world scenario/simulation/dialogue practice without creating a second speech engine.
2. **Preconditions:** P0-P6 FOUNDATION_LOCKED; P7-P10 PASS; main `2a9d9121f315f601670da3dd4b7aa9431af9aade`.
3. **Inputs:** P6 dialogue/deep-speaking runtime, speaking-link-index, P7-P10 authority contracts.
4. **Canonical owners affected:** P11 scenario composition only; P6/P4/P5/P7/P10 owners remain exclusive.
5. **Allowed changes:** scenario registry, roles, branching, unexpected turns, repair/progression policy, validators/docs.
6. **Forbidden changes:** duplicate recorder/ASR/audio/dialogue engine; mastery/SRS/planner writes; canonical AI promotion.
7. **Required deliverables:** scenario constitution, runtime contract, progression policy, registry, risk register, evidence index, validator, phase record.
8. **Runtime tests:** existing Russian source/package and whole-system browser/package regressions.
9. **Static/schema tests:** required families, valid context refs, branching/repair/unexpected-turn coverage, single-owner invariants.
10. **Data/state migration:** none; additive practice registry only.
11. **Regression scope:** P4-P10 contracts plus P6 dialogue/audio runtime.
12. **Evidence index:** `RUSSIAN_P11_EVIDENCE_INDEX.md`.
13. **Risk register delta:** `RUSSIAN_P11_RISK_REGISTER.md`.
14. **Rollback:** remove P11 additive files/validator/workflow entry; P6 runtime remains unchanged.
15. **Exit gate:** curriculum can be practiced in integrated real-world contexts through P6 runtime without duplicate engine or authority.
16. **PR/merge rule:** merge only after P11 validator + existing P6 gates + Russian/full-system browser/package regressions PASS.
17. **Production effect:** none; P17 only.

- **State:** IN_PROGRESS
- **Change class:** C/E — additive scenario orchestration and validation; no destructive migration.
