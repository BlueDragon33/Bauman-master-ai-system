# OOPSE05 — LEARNING EXPERIENCE · AUTHORING · PRODUCT INTEGRATION

Mode:

`SHARED-DESIGN-SYSTEM · DESIGN-TRACEABLE · NO-CODE-FIRST · ACCESSIBLE`

---

# 0. ENTRY

Requires OOPSE02–OOPSE04.

---

# 1. PRIMARY SURFACES

Possible:

- concept lesson;
- requirement/design workspace;
- domain/class model;
- interaction/sequence view;
- state model;
- code lab;
- tests;
- dependency graph;
- diff/refactor workspace;
- code review;
- architecture decision;
- smell/error notebook;
- project portfolio.

---

# 2. REQUIREMENT PANEL

Keep task behavior/change scenarios visible while designing.

---

# 3. RESPONSIBILITY WORKSPACE

Learner maps responsibilities to roles/objects/components.

---

# 4. CONTRACT VIEW

Show:

- inputs;
- outputs;
- pre/postconditions;
- errors;
- side effects.

---

# 5. CLASS/TYPE VIEW

Class view is one design projection.

Do not hide responsibilities/contracts behind fields/methods only.

---

# 6. UML VIEW

If used, structured canonical data drives diagram.

---

# 7. DIAGRAM ACCESSIBILITY

Provide list/table/text alternative.

---

# 8. INTERACTION VIEW

Sequence/collaboration steps visible.

---

# 9. STATE MODEL

Transitions/events/guards accessible.

---

# 10. CODE LAB

Reuse Python editor/runtime.

---

# 11. RUN VS TEST VS SUBMIT

Separate actions/consequences.

---

# 12. TEST PANEL

Show:

- test scope;
- failures;
- relevant contract;
- hidden tests protected.

---

# 13. COVERAGE UX

Never render coverage as “correctness score”.

---

# 14. STATIC ANALYSIS UX

Findings show tool/source/severity/confidence where available.

---

# 15. DEPENDENCY GRAPH

Graph + structured alternative.

---

# 16. DIFF/REFACTOR VIEW

Before/after + regression state.

---

# 17. CODE REVIEW WORKSPACE

Review findings linked to code/design.

---

# 18. DESIGN ALTERNATIVES

Allow comparing alternatives by requirement/change scenario.

---

# 19. ARCHITECTURE DECISION RECORD

If in scope:

context → options → decision → consequences.

---

# 20. AI TUTOR UX

Advisory panel, not hidden auto-rewrite.

---

# 21. ERROR/SMELL NOTEBOOK

Recurring:

- responsibility;
- contract;
- coupling;
- inheritance;
- tests;
- refactor;
- traceability.

---

# 22. RESPONSIVE

Mobile:

- tabs/sheets for model/code/test;
- focused diff;
- diagram structured alternative.

Do not squeeze desktop IDE layout.

---

# 23. ACCESSIBILITY

- keyboard code/test/review flows;
- diagram alternatives;
- color-independent status;
- reduced motion;
- large text;
- accessible diff labels.

---

# 24. AUTHORING

Use shared lifecycle.

OOPSE-specific authoring can create:

- requirement/design task;
- class/object modeling task;
- interaction/state task;
- code task;
- test-design task;
- review task;
- refactor task;
- architecture-decision task;
- project rubric.

---

# 25. REQUIREMENT AUTHORING

Structured scenario/behavior/constraints.

---

# 26. DESIGN TASK AUTHORING

Specify:

- requirements;
- allowed assumptions;
- required contracts;
- quality attributes;
- change scenarios;
- rubric.

Do not require one reference class tree unless objective demands it.

---

# 27. CODE TASK AUTHORING

Reference canonical design/task.

---

# 28. TEST TASK AUTHORING

Protected official tests/hints separation.

---

# 29. REFACTOR TASK AUTHORING

Initial code + behavior tests + target issues.

---

# 30. REVIEW TASK AUTHORING

Diff + context + issue categories + rubric.

---

# 31. GOLDEN ALTERNATIVE DESIGNS

Author can register multiple valid solutions.

---

# 32. GOLDEN POOR DESIGNS

Known problematic fixtures strengthen grader.

---

# 33. PREVIEW

Author previews:

requirement → model → code → test → analysis → rubric.

---

# 34. VALIDATION

Before review:

- refs;
- contracts;
- tests;
- hidden-test protection;
- model/code mapping;
- test-of-tests.

---

# 35. SUBJECT MANIFEST

Register through Subject Factory.

No kernel patch for ordinary OOPSE blocks.

---

# 36. SUBJECT PACK

Package:

- canonical content;
- design fixtures;
- code/test fixtures;
- diagrams;
- rubrics.

Do not duplicate Python runtime.

---

# 37. OFFLINE

Cached theory/models/code fixtures/local runtime where supported.

---

# 38. ANALYTICS

Track:

- design attempt;
- code run;
- test run;
- review finding;
- hint;
- refactor;
- submission.

Do not treat number of classes/diagram edits as mastery.

---

# 39. DELIVERABLES

Create:

`OOPSE_SUBJECT_MANIFEST.md`

`OOPSE_LEARNING_BLOCK_REGISTRY.json`

`OOPSE_DESIGN_WORKSPACE_UX_CONTRACT.md`

`OOPSE_CODE_TEST_REVIEW_UX_CONTRACT.md`

`OOPSE_DIAGRAM_ACCESSIBILITY_CONTRACT.md`

`OOPSE_AUTHORING_SCHEMA_CONTRACT.md`

`OOPSE_GOLDEN_DESIGN_AUTHORING_CONTRACT.md`

`OOPSE_RESPONSIVE_ACCESSIBILITY_MATRIX.md`

`OOPSE_SUBJECT_PACK_CONTRACT.md`

`OOPSE06_INPUT_CONTRACT.md`.

---

# 40. PILOTS

A — responsibility/class design

B — composition vs inheritance

C — interaction/state modeling

D — test design

E — refactor with behavior preservation

F — code review

G — author creates normal OOPSE task without app-code change.

---

# 41. PASS

PASS when design reasoning remains visible, multiple valid designs can be learned/graded, and ordinary authoring is no-code.

---

# 42. FINAL PRINCIPLE

**DO NOT TURN OOP LEARNING INTO A DIAGRAM DRAWER OR A CODE AUTOCOMPLETER.**
