# Russian P8 Phase Record

1. **Mission:** deepen academic and technical Russian so R11–R21 cover the discourse and terminology needed for technical study without fabricating linguistic authority.
2. **Preconditions:** P0–P6 `FOUNDATION_LOCKED`; P7 PASS at main `4f07af6827b4b879b25a64c61509155eb0562f0f`.
3. **Inputs:** R11–R21 lessons/knowledge index; P3 owner topology; P7 provenance/confidence rules; Russian technical terminology standards.
4. **Canonical owners affected:** materialize P3-planned `TechnicalConcept` owner `data/technical-concepts.json` and `AcademicFunction` owner `data/academic-functions.json`.
5. **Allowed changes:** source-backed technical terminology, academic discourse functions, coverage maps, validators, additive CI.
6. **Forbidden changes:** mastery/SRS/planner/audio/UI ownership; P9 research-production workflow; guessed linguistic facts; duplicate canonical datasets.
7. **Required deliverables:** technical concept owner, academic function owner, domain coverage report, academic function contract, risk register, evidence index, validator, phase record.
8. **Runtime tests:** Russian source/package regressions remain green; no learner-state/runtime behavior is rewritten by P8.
9. **Static/schema tests:** P8 validator verifies domain coverage, authority/source refs, R11–R21 targeting and owner invariants.
10. **Data/state migration:** additive canonical content owners only; no learner-state migration or destructive rewrite.
11. **Regression scope:** P3 owner topology, P7 provenance, P4–P6 foundation contracts, Russian browser/package parity.
12. **Evidence index:** `RUSSIAN_P8_EVIDENCE_INDEX.md`.
13. **Risk register delta:** `RUSSIAN_P8_RISK_REGISTER.md`.
14. **Rollback plan:** remove the two P8 canonical files/docs/validator/workflow step; no learner state changes.
15. **Exit gate:** all P8 required domains have source-backed canonical concepts and academic functions linked to R11–R21; no P8 blocker/critical.
16. **PR/merge rule:** merge only after P8 validator + foundation + browser/package regressions PASS.
17. **Production effect:** none; P17 remains production authority.

- **State:** PASS
- **Change class:** C/E — additive canonical content and validation architecture.

## Exit evidence
- P8 academic/technical validator: PASS.
- Full P2.9 minimum technical matrix enforced, not merely domain presence.
- P7 authority labels preserved: normative GOST-backed terms may be VERIFIED; other authoritative learning sources remain SOURCE_ASSERTED.
- Russian Reference UI / Fast CI / Constitution / static integration: PASS.
- Russian source + packaged browser regressions: PASS.
- No learner-state, mastery, SRS, planner, audio, speech or UI ownership change.
- Cloudflare branch deployment check remains outside P8 product scope; production authority remains P17.

**P8 STATE: PASS**
