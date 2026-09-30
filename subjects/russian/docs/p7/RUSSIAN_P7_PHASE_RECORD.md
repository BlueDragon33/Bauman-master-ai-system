# Russian P7 Phase Record

1. **Mission:** make Russian linguistic truth auditable and fail-closed within declared confidence.
2. **Preconditions:** P0–P6 `FOUNDATION_LOCKED` at main `f3063a43d526164ab8b18394c1ea08aa65428000`.
3. **Inputs:** P1 content gaps, P3 canonical owner registry/topology, existing content contract and canonical datasets.
4. **Canonical owners affected:** no content owner replacement. P7 materializes the planned `ProvenanceRecord` owner at `data/provenance.json`.
5. **Allowed changes:** provenance/confidence policy, validation metadata, validators, source-backed field review.
6. **Forbidden changes:** mastery/SRS/planner/audio/UI ownership changes; guessed stress/morphology; generated canonical truth; duplicate datasets.
7. **Required deliverables:** authority constitution, confidence policy, provenance workflow/registry, risk register, evidence index, validator, acceptance record.
8. **Runtime tests:** existing source/package Russian regression; content-contract behavior remains fail-closed.
9. **Static/schema tests:** P7 validator audits vocab/owner/provenance/foundation invariants.
10. **Data/state migration:** additive provenance registry only; no learner-state migration and no destructive canonical-data rewrite.
11. **Regression scope:** P3 owner invariants plus P4/P5/P6 foundation gates and Russian browser/package parity.
12. **Evidence index:** `RUSSIAN_P7_EVIDENCE_INDEX.md`.
13. **Risk register delta:** `RUSSIAN_P7_RISK_REGISTER.md`.
14. **Rollback plan:** remove P7 provenance/policy/validator files and workflow step; canonical content/state remain unchanged.
15. **Exit gate:** canonical linguistic claims are trustworthy **only within explicit declared confidence**; unsupported claims remain unverified; no P7 blocker/critical.
16. **PR/merge rule:** merge only after P7 validator and foundation regressions PASS.
17. **Production effect:** none; P17 remains production authority.

- **State:** PASS
- **Change class:** C/E — additive provenance schema + validation architecture, no destructive migration.


## Exit evidence
- `RUSSIAN_P7_LINGUISTIC_AUTHORITY_GATE=PASS`.
- Vocabulary preserved: 8,000 rows; no false `VERIFIED` claims.
- Stress/POS/forms gaps remain explicitly unverified rather than inferred.
- Russian reference UI, fast CI, constitution, static integration, Russian P1 browser regression and whole-system browser acceptance: PASS.
- Foundation ownership invariants preserved; no mastery/SRS/planner/audio/UI ownership changes.
- Production behavior/deploy authority unchanged; P17 remains owner.

**P7 STATE: PASS**
