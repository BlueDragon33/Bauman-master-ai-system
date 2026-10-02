# AM06 — ACCEPTANCE · HARDENING · LEGACY CLOSURE · RC READINESS

Mode:

`MODEL-SEMANTIC-REGRESSION · NUMERICAL-RED-TEAMED · NO-KNOWN-BLOCKER`

---

# 0. MISSION

Prove the Analytical Models subject is academically correct, numerically honest, accessible, secure and exact-RC ready.

---

# 1. GATES

`A CANONICAL MODEL TRUTH`

`B FORMULATION/ASSESSMENT`

`C SOLVER/SIMULATION`

`D VISUALIZATION/AI`

`E UX/A11Y/OFFLINE/PERFORMANCE`

`F LEGACY/RC`.

---

# 2. CANDIDATE IDENTITY

Freeze:

- SHA;
- content snapshot;
- subject pack;
- Math/Python provider versions;
- solver/library profile;
- config;
- lockfile.

---

# 3. SYSTEM BOUNDARY TESTS

Tasks/examples must not silently change boundary between lesson/grader/runtime.

---

# 4. VARIABLE-ROLE TESTS

Detect state/input/output/parameter mismatches.

---

# 5. UNIT/DIMENSION TESTS

Known inconsistent models must fail.

---

# 6. CONDITION TESTS

Missing/wrong initial/boundary conditions must be caught where required.

---

# 7. EQUIVALENT MODEL TESTS

Known equivalent mathematical representations must pass when task permits.

---

# 8. MODEL-PURPOSE TESTS

A model valid for one regime/purpose must not be overclaimed universally.

---

# 9. LINEARIZATION TESTS

If in scope:

outside-validity examples must be recognized.

---

# 10. DISCRETIZATION TESTS

If in scope:

different step sizes expose numerical artifact.

---

# 11. STATE-DIMENSION TESTS

If state-space in scope:

matrix/vector dimensions validated.

---

# 12. NUMERICAL SOLVER TESTS

Include:

- normal convergence;
- nonconvergence;
- stiff/unstable behavior only if relevant;
- tolerance/step effect;
- singular/degenerate input where applicable.

---

# 13. ANALYTICAL/NORMAL REFERENCE

Compare supported fixtures to known reference.

---

# 14. SIMULATION IDENTITY

Run must bind exact model/params/input/solver.

---

# 15. VALIDATION TESTS

A curve-fit/calibration-only example must not be labeled independent validation.

---

# 16. SENSITIVITY TESTS

Known high/low sensitivity fixture where scope supports.

---

# 17. UNCERTAINTY TESTS

If in scope:

seed/distribution/interval semantics.

---

# 18. STOCHASTIC TESTS

If in scope:

probability normalization/transition assumptions.

---

# 19. VISUALIZATION TESTS

Axes/units/state labels correct.

No stale run displayed as current.

---

# 20. DIAGRAM TESTS

Diagram and canonical equations/links agree.

---

# 21. AI TESTS

AI must:

- surface missing assumption;
- check units;
- distinguish verify vs validate;
- not invent model facts;
- not fabricate solver results;
- not claim universal validity;
- not reveal protected solution;
- not write official mastery.

---

# 22. MULTIPLE VALID FORMULATIONS

Grader accepts valid alternative formulation under task contract.

---

# 23. KNOWN INVALID MODEL LIBRARY

At minimum:

- unit mismatch;
- wrong condition;
- hidden assumption;
- wrong variable role;
- invalid linearization;
- solver artifact mistaken for system behavior;
- calibration-as-validation.

---

# 24. TEST-OF-TESTS

Known invalid models fail.

Known valid equivalents pass.

---

# 25. RUNTIME SECURITY

Math/Python execution remains within shared sandbox boundaries.

---

# 26. RESOURCE LIMITS

Large simulation/parameter sweep bounded.

---

# 27. OFFLINE

Actual supported local/precomputed matrix tested.

---

# 28. PERFORMANCE

Measure:

- subject load;
- formula/model editor;
- solver initialization;
- simulation;
- plot rendering;
- large parameter table;
- authoring.

---

# 29. MEMORY

Repeated simulation/plot mount does not grow unbounded.

---

# 30. RESPONSIVE

Model specification + plots + diagrams usable on mobile/tablet/desktop.

---

# 31. ACCESSIBILITY

Formula/diagram/plot alternatives tested.

---

# 32. AUTHORING ACCEPTANCE

Author creates:

- model;
- scenario;
- simulation;
- validation task;
- assessment

without app-code edits for ordinary cases.

---

# 33. LEGACY INVENTORY

Resolve duplicate:

- model registry;
- solver;
- equation parser;
- simulation engine;
- plotting state;
- old route;
- stale feature flag.

---

# 34. ADJACENT-OWNER GATE

No copied generic Math/Python/ML/Reliability truth becomes competing owner.

---

# 35. MIGRATION

If canonical IDs/model schema changed:

- aliases;
- content migration;
- learner evidence preservation;
- rollback.

---

# 36. PRODUCTION SMOKE PROFILE

Hand shared release procedure:

1. open Analytical Models subject;
2. open one canonical model lesson;
3. inspect system boundary/variables/assumptions;
4. run one safe deterministic reference model;
5. verify equations/conditions/units render;
6. render one trajectory/response;
7. verify active subject pack/model revision;
8. verify Math/Python provider profile;
9. verify optional AI grounded/fallback;
10. offline cached lesson/precomputed run if supported.

No destructive production data.

---

# 37. BLOCKERS

- canonical model missing assumptions/conditions systematically;
- known invalid model passes;
- valid equivalent model rejected systematically;
- units wrong;
- solver output mislabeled as validated truth;
- stale simulation shown as current;
- AI fabricates validation/results;
- duplicate canonical model owner;
- migration corrupts learner evidence.

---

# 38. DELIVERABLES

Create:

`AM_ACCEPTANCE_MATRIX.md`

`AM_MODEL_SEMANTIC_REGRESSION.json`

`AM_DIMENSION_CONDITION_REPORT.md`

`AM_SOLVER_NUMERICAL_ACCEPTANCE.md`

`AM_VERIFICATION_VALIDATION_ACCEPTANCE.md`

`AM_VISUALIZATION_ACCEPTANCE.md`

`AM_AI_ACCEPTANCE_REPORT.md`

`AM_ACCESSIBILITY_RESPONSIVE_REPORT.md`

`AM_OFFLINE_PERFORMANCE_REPORT.md`

`AM_LEGACY_CLOSURE_REPORT.md`

`AM_RC_MANIFEST.json`

`AM_PRODUCTION_SMOKE_PROFILE.md`

`AM06_EVIDENCE_INDEX.md`.

---

# 39. PASS

PASS only when canonical model, grader, solver, simulation, visualization and AI agree; numerical assumptions are visible; no blocker remains; exact RC exists.

---

# 40. FINAL PRINCIPLE

**THE RELEASE CANDIDATE MUST PROVE BOTH MATHEMATICAL CORRECTNESS AND MODELING HONESTY.**
