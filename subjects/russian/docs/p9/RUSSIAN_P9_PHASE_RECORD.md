# Russian P9 Phase Record

1. **Mission:** move the learner from technical input to research output across reading, writing, НИР, ВКР and defense.
2. **Preconditions:** P0-P6 FOUNDATION_LOCKED; P7 PASS; P8 PASS at main `fb025239d143522b749249541c3613213bb8b435`.
3. **Inputs:** P2 reading/writing/research ladders, P3 owner topology, P4 rubrics/evidence, P7 authority, P8 academic/technical owners, existing writing bank.
4. **Canonical owners affected:** materialize ReadingText `data/reading.json` and PerformanceTask `data/performance-tasks.json`; preserve WritingTask owner.
5. **Allowed changes:** productive task contracts, reading progression, research workflows, additive canonical task inventories, validators.
6. **Forbidden changes:** official scoring/mastery/SRS/planner/audio/UI ownership; fabricated citations or linguistic truth; duplicate technical term owners.
7. **Required deliverables:** reading owner, performance task owner, production constitution, reading/research contracts, risk register, evidence index, validator, phase record.
8. **Runtime tests:** existing Russian source/package and whole-system regressions.
9. **Static/schema tests:** reference integrity, R11-R26 coverage, P4/P7/P8 boundary invariants.
10. **Data/state migration:** additive content owners only; no learner-state migration.
11. **Regression scope:** P3-P8 contracts plus browser/package parity.
12. **Evidence index:** `RUSSIAN_P9_EVIDENCE_INDEX.md`.
13. **Risk register delta:** `RUSSIAN_P9_RISK_REGISTER.md`.
14. **Rollback:** remove P9 additive files/validator/workflow entry; existing writing/runtime/state unchanged.
15. **Exit gate:** technical input can flow to reading/note-taking/writing/research/defense tasks across R11-R26 with P4 authority preserved.
16. **PR/merge rule:** merge only after P9 validator + foundation + browser/package regressions PASS.
17. **Production effect:** none; P17 only.

- **State:** IN_PROGRESS
- **Change class:** C/E — additive canonical task architecture, no destructive migration.
