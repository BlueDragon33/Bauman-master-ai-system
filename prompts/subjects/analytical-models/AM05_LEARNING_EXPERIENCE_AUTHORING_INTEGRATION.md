# AM05 — LEARNING EXPERIENCE · AUTHORING · PRODUCT INTEGRATION

Mode:

`SHARED-DESIGN-SYSTEM · MODEL-CENTERED · NO-CODE-FIRST · ACCESSIBLE`

---

# 0. ENTRY

Requires AM02–AM04.

---

# 1. PRIMARY LEARNER SURFACES

Possible:

- concept lesson;
- model specification workspace;
- equation workspace;
- system/block diagram;
- parameter/units table;
- solver/simulation workspace;
- trajectory/response plots;
- sensitivity explorer;
- validation workspace;
- model comparison;
- error notebook;
- project/model report.

---

# 2. MODEL SPECIFICATION

Show together:

- purpose;
- boundary;
- variables;
- roles;
- units;
- parameters;
- assumptions;
- equations;
- conditions.

---

# 3. EQUATION EDITOR

Reuse Math formula editor/capabilities.

---

# 4. VARIABLE TABLE

Columns can include:

symbol, meaning, role, unit, domain.

---

# 5. PARAMETER TABLE

Value, unit, source, scenario.

---

# 6. ASSUMPTION PANE

Visible and editable in learning/authoring contexts.

Do not hide behind tooltip only.

---

# 7. CONDITION PANE

Initial/boundary conditions explicit.

---

# 8. SYSTEM DIAGRAM

Graphical projection of canonical model relationships.

---

# 9. DIAGRAM ALTERNATIVE

Structured list/table for keyboard/screen reader.

---

# 10. SIMULATION CONTROLS

Input scenario, horizon, solver, step/tolerance as appropriate.

---

# 11. RUN VS SUBMIT

Separate.

Simulation runs do not automatically create official mastery evidence.

---

# 12. RESULT VIEW

Show:

- run identity;
- warnings;
- units;
- plots;
- derived metrics.

---

# 13. VALIDATION VIEW

Reference/observed data and model result separated clearly.

---

# 14. SENSITIVITY VIEW

Parameter change + response metric + interpretation.

---

# 15. MODEL COMPARISON

Compare assumptions/complexity/validity, not only fit error.

---

# 16. ERROR NOTEBOOK

Recurring:

- unit;
- hidden assumption;
- state/input role;
- condition;
- solver;
- validation;
- overclaim.

---

# 17. RESPONSIVE

Mobile:

- stacked specification sections;
- focus one plot;
- diagram as scrollable/structured alternative.

Do not squeeze desktop multi-panel UI.

---

# 18. ACCESSIBILITY

- formulas semantic where possible;
- plots have text/table summaries;
- diagrams have structured alternatives;
- color not sole cue;
- keyboard controls;
- reduced motion.

---

# 19. AUTHORING

Use shared content lifecycle.

AM-specific authoring creates:

- system;
- variables;
- parameters;
- assumptions;
- equations;
- model;
- input scenarios;
- solver presets;
- validation cases;
- assessment tasks.

---

# 20. MODEL AUTHORING

Structured fields; no giant free-text JSON editor as primary workflow.

---

# 21. EQUATION VALIDATION

References valid variables/parameters.

---

# 22. UNIT VALIDATION

Dimensional rules where applicable.

---

# 23. SCENARIO AUTHORING

Input/parameter/condition sets declarative.

---

# 24. GOLDEN REFERENCE AUTHORING

Reference solutions/runs protected when assessment requires.

---

# 25. PREVIEW

Author runs:

model → solver → visualization → grader

before review.

---

# 26. TEST-OF-TESTS

Known invalid model fixtures fail.

Known equivalent formulations pass.

---

# 27. SUBJECT MANIFEST

Register capabilities through Subject Factory.

No kernel patch for ordinary blocks.

---

# 28. SUBJECT PACK

Package:

- canonical content;
- safe model fixtures;
- parameter/input scenarios;
- precomputed results where needed.

Do not duplicate Math/Python runtime.

---

# 29. OFFLINE

Cached theory/precomputed simulations/local runtime as supported.

---

# 30. ANALYTICS

Track:

- formulation attempts;
- assumption edits;
- simulation;
- hint;
- validation task;
- submission.

Do not equate plot viewing with mastery.

---

# 31. DELIVERABLES

Create:

`AM_SUBJECT_MANIFEST.md`

`AM_LEARNING_BLOCK_REGISTRY.json`

`AM_MODEL_WORKSPACE_UX_CONTRACT.md`

`AM_DIAGRAM_VISUALIZATION_ACCESSIBILITY_CONTRACT.md`

`AM_SIMULATION_WORKSPACE_UX_CONTRACT.md`

`AM_AUTHORING_SCHEMA_CONTRACT.md`

`AM_GOLDEN_MODEL_AUTHORING_CONTRACT.md`

`AM_RESPONSIVE_ACCESSIBILITY_MATRIX.md`

`AM_SUBJECT_PACK_CONTRACT.md`

`AM06_INPUT_CONTRACT.md`.

---

# 32. PILOTS

A — simple static/algebraic model from actual scope

B — dynamic model with conditions

C — unit mismatch

D — equivalent representation

E — parameter sweep/sensitivity

F — validation mismatch

G — author creates normal model task without app-code change.

---

# 33. PASS

PASS when the learner can see and manipulate the modeling assumptions/structure—not just a black-box simulator—and ordinary authoring is no-code.

---

# 34. FINAL PRINCIPLE

**MAKE THE MODEL STRUCTURE VISIBLE. DO NOT HIDE THE LEARNING INSIDE A RUN BUTTON.**
