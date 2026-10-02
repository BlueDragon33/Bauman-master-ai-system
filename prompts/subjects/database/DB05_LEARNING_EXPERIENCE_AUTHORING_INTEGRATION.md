# DB05 — LEARNING EXPERIENCE · AUTHORING · PRODUCT INTEGRATION
## SQL workspace · Schema explorer · Result grid · Query plan · Transaction timeline

Mode:

`SHARED-DESIGN-SYSTEM · SUBJECT-SPECIALIZED · NO-CODE-FIRST · ACCESSIBLE`

---

# 0. ENTRY

Requires DB02–DB04.

---

# 1. MISSION

Integrate Database & SQL into the shared platform using subject-specific learning blocks and shared global UX/authoring rules.

---

# 2. SUBJECT MANIFEST

Register:

- subject;
- routes;
- capability needs;
- content packs;
- DB engine profiles;
- learning blocks.

No kernel patch for ordinary integration.

---

# 3. PRIMARY SURFACES

Possible:

- concept lesson;
- SQL workspace;
- schema explorer;
- table data viewer;
- relational algebra workspace;
- ER/schema design;
- normalization workspace;
- query plan viewer;
- transaction simulator;
- project workspace;
- error notebook.

---

# 4. SQL EDITOR

Reuse shared code/editor infrastructure where feasible.

Need:

- SQL syntax mode;
- run;
- reset fixture;
- format optional;
- submit;
- result/errors.

---

# 5. RUN VS SUBMIT

Clearly distinct.

Run does not automatically create official evidence unless policy says.

---

# 6. SCHEMA EXPLORER

Display:

- tables;
- columns;
- types;
- keys;
- constraints;
- relations.

---

# 7. RESULT GRID

Support:

- NULL display distinct;
- column names;
- row count;
- horizontal overflow;
- accessible table semantics.

---

# 8. NULL VISUAL

Do not show NULL as blank indistinguishable from empty string.

---

# 9. DUPLICATES

Result grid preserves duplicate rows unless query removes them.

---

# 10. ORDER

Do not visually imply guaranteed order when task/result has none.

---

# 11. QUERY DIFF

For feedback, show semantic issue rather than only text diff.

---

# 12. ERROR DISPLAY

Distinguish:

- syntax;
- runtime;
- constraint;
- timeout;
- grader semantic mismatch.

---

# 13. SCHEMA DESIGN WORKSPACE

Can support:

- entities/tables;
- columns;
- keys;
- FKs;
- constraints.

Use structured form plus diagram.

---

# 14. ER DIAGRAM

Diagram is visualization; structured schema data is canonical.

---

# 15. ER ACCESSIBILITY

Provide table/list alternative.

---

# 16. NORMALIZATION WORKSPACE

Show:

- relation attributes;
- FDs;
- candidate keys;
- decomposition;
- checks.

---

# 17. FD INPUT

Structured attribute-set input.

Avoid free-text-only parsing if authoring/assessment needs determinism.

---

# 18. RELATIONAL ALGEBRA

Optional expression builder/text.

---

# 19. QUERY PLAN VIEW

Show:

- operator hierarchy;
- estimates;
- actual where available;
- access path.

Engine profile visible.

---

# 20. PLAN MOBILE

Tree can become structured list.

---

# 21. INDEX VIEW

Show index definition + conceptual structure.

---

# 22. TRANSACTION TIMELINE

Sessions as lanes.

Operations ordered.

Commit/rollback visible.

---

# 23. ANOMALY EXPLANATION

Tie observed phenomenon to isolation context.

---

# 24. AI TUTOR UX

Contextual side panel.

Do not cover SQL/result/schema.

---

# 25. HINT UX

Consistent with DB03 ladder.

---

# 26. ERROR NOTEBOOK

Recurring:

- join;
- NULL;
- grouping;
- duplicates;
- constraints;
- normalization;
- transactions;
- indexes.

---

# 27. RESPONSIVE

Mobile:

- editor/result tabs;
- schema sheet;
- compact plan list;
- transaction timeline scroll.

Do not squeeze desktop three-pane layout.

---

# 28. TABLET

Can use split editor/result.

---

# 29. DESKTOP

Can use:

schema | editor | result/feedback

where space allows.

---

# 30. KEYBOARD

Editor/run/submit/schema navigation usable.

---

# 31. SCREEN READER

Schema/result tables semantic.

Diagram has structured alternative.

---

# 32. LARGE TEXT

No clipped schema/result controls.

---

# 33. COLOR

Keys/constraints/status need textual/icon cues.

---

# 34. REDUCED MOTION

Transaction/index animations reducible.

---

# 35. AUTHORING

Use shared lifecycle.

DB-specific editors create:

- schema;
- fixture;
- query task;
- design task;
- normalization task;
- transaction scenario;
- planner/index exercise.

---

# 36. SCHEMA AUTHORING

Structured fields.

Validate keys/FKs/constraints.

---

# 37. FIXTURE AUTHORING

Rows validated against schema.

---

# 38. DIFFERENTIAL FIXTURE AUTHORING

Allow author to add edge datasets that distinguish common wrong queries.

---

# 39. QUERY TASK AUTHORING

Fields:

- objective;
- schema fixture;
- semantic expected behavior;
- ordering;
- duplicate policy;
- NULL policy;
- allowed/required constructs;
- hidden fixtures;
- rubric.

---

# 40. CORRECT QUERY CANDIDATES

Author can register multiple known-valid solutions for test-of-tests.

---

# 41. WRONG QUERY CANDIDATES

Author can register known wrong solutions.

---

# 42. NORMALIZATION TASK AUTHORING

Structured FDs/decomposition/rubric.

---

# 43. TRANSACTION TASK AUTHORING

Structured schedule/isolation/profile.

---

# 44. INDEX/PLAN TASK AUTHORING

Engine profile mandatory.

---

# 45. PREVIEW

Author previews:

- schema;
- data;
- SQL execution;
- grader;
- result normalization;
- plan;
- responsive states.

---

# 46. VALIDATION

Before review:

- refs;
- schema;
- fixtures;
- hidden tests;
- SQL sandbox;
- test-of-tests;
- engine profile.

---

# 47. SECURITY VALIDATION

Reject fixture/task attempting privileged DB or dangerous functions.

---

# 48. SUBJECT PACK

Include:

- canonical DB content;
- schema/fixtures;
- safe SQL runtime assets if local;
- precomputed plan/transaction examples where needed.

Do not package secrets.

---

# 49. OFFLINE

If full SQL execution unavailable offline, content/read-only/static exercises degrade honestly.

If local engine exists, pack exact version.

---

# 50. STATE RESTORE

Preserve learner query/draft/result state safely.

---

# 51. MULTI-TAB

No sandbox/attempt state collision.

---

# 52. ANALYTICS

Use semantic events:

- query run;
- submit;
- error class;
- hint;
- schema task;
- transaction step.

Do not treat query-run count as mastery.

---

# 53. DELIVERABLES

Create:

`subjects/database/docs/db05/DB_SUBJECT_MANIFEST.md`

`DB_LEARNING_BLOCK_REGISTRY.json`

`DB_SQL_WORKSPACE_UX_CONTRACT.md`

`DB_SCHEMA_EXPLORER_UX_CONTRACT.md`

`DB_QUERY_PLAN_UX_CONTRACT.md`

`DB_TRANSACTION_TIMELINE_UX_CONTRACT.md`

`DB_AUTHORING_SCHEMA_CONTRACT.md`

`DB_DIFFERENTIAL_FIXTURE_AUTHORING_CONTRACT.md`

`DB_RESPONSIVE_ACCESSIBILITY_MATRIX.md`

`DB_SUBJECT_PACK_CONTRACT.md`

`DB06_INPUT_CONTRACT.md`.

---

# 54. PILOTS

A — simple SELECT + NULL

B — multi-table join duplicates

C — aggregation/COUNT NULL

D — normalization from FDs

E — transaction anomaly

F — index/query plan

G — author creates SQL task + hidden fixtures without code edit.

---

# 55. PASS

PASS when:

- shared shell/design reused;
- SQL workspace/schema/result UX usable;
- NULL/order/duplicates visually truthful;
- diagrams have accessible alternatives;
- authoring no-code works;
- hidden fixtures protected;
- sandbox integrated;
- offline behavior truthful.

---

# 56. FAIL

FAIL if:

- second app shell created;
- result grid hides NULL distinctions;
- diagram is only source of schema truth;
- authors must edit app code for ordinary SQL tasks;
- hidden fixtures exposed;
- learner SQL uses production credentials.

---

# 57. FINAL PRINCIPLE

**MAKE DATABASE SEMANTICS VISIBLE WITHOUT MAKING THE VISUALIZATION THE SOURCE OF TRUTH.**
