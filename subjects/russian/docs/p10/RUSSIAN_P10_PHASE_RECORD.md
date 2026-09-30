# Russian P10 Phase Record

1. **Mission:** add bounded AI coaching without creating a second learning engine.
2. **Preconditions:** P0-P6 FOUNDATION_LOCKED; P7-P9 PASS; main `caa33bd3a1e96dda457c2488b594f53ec9856698`.
3. **Inputs:** existing ai-mentor guard/runtime validator; P4-P9 ownership contracts.
4. **Canonical owners affected:** AI policy only; no canonical learning/content owner replacement.
5. **Allowed changes:** AI context/policy/generation/language/source guardrails, validators, documentation.
6. **Forbidden changes:** mastery/SRS/planner/audio/content truth ownership; silent state writes; fabricated source authority.
7. **Required deliverables:** AI mentor constitution, context contract, generation policy, language policy, policy JSON, risk register, evidence index, validator, phase record.
8. **Runtime tests:** existing AI runtime + Russian/full-system browser/package regressions.
9. **Static/schema tests:** policy permissions, source boundary, no state mutation, no duplicate authority.
10. **Data/state migration:** none.
11. **Regression scope:** P4-P9 contracts and Russian runtime load order.
12. **Evidence index:** `RUSSIAN_P10_EVIDENCE_INDEX.md`.
13. **Risk register delta:** `RUSSIAN_P10_RISK_REGISTER.md`.
14. **Rollback:** remove additive policy/docs/validator/workflow step; existing AI guard remains.
15. **Exit gate:** AI improves learning through bounded coaching while canonical truth/mastery/planner/audio owners remain exclusive.
16. **PR/merge rule:** merge only after P10 validator + existing AI runtime + foundation/browser/package regressions PASS.
17. **Production effect:** none; P17 only.

- **State:** IN_PROGRESS
- **Change class:** E — policy/guardrail architecture, no destructive migration.
