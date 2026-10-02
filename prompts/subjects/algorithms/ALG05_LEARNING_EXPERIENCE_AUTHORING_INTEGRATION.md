# ALG05 — LEARNING EXPERIENCE · AUTHORING · PRODUCT INTEGRATION
## Learner surfaces · Authoring · Responsive visualization · Subject Factory integration

Mode:

`SHARED-DESIGN-SYSTEM · SUBJECT-SPECIALIZED · NO-CODE-FIRST · ACCESSIBLE`

---

# 0. ENTRY GATE

Requires ALG02–ALG04.

---

# 1. MISSION

Integrate Algorithms & Data Structures into the shared platform without rebuilding the global UI or authoring system.

ALG05 defines subject-specific blocks and workflows.

---

# 2. SUBJECT MANIFEST

Register:

- subject identity;
- routes;
- capability requirements;
- content packs;
- learning blocks;
- icons/labels via shared system;
- offline requirements.

No kernel patch for normal subject registration.

---

# 3. PRIMARY LEARNER SURFACES

Possible:

- Today/roadmap via global shell;
- concept lesson;
- algorithm explorer;
- data-structure lab;
- trace task;
- coding task;
- complexity task;
- proof/correctness task;
- error notebook;
- project.

---

# 4. ALGORITHM LESSON BLOCK

Can include:

- problem;
- idea;
- preconditions;
- invariant;
- pseudocode;
- trace;
- correctness;
- complexity;
- implementation;
- edge cases.

Progressive disclosure prevents overload.

---

# 5. DATA-STRUCTURE BLOCK

Show:

- ADT;
- operations;
- representation;
- invariant;
- complexity;
- trade-offs.

Do not present one implementation as definition.

---

# 6. TRACE PLAYER

Controls:

- start;
- step;
- previous if supported;
- pause;
- reset;
- speed;
- input selection.

State labels accessible.

---

# 7. TRACE EXPLANATION

Each step can explain:

- what changed;
- why;
- invariant relevance.

Avoid narration for every trivial DOM change.

---

# 8. ARRAY VISUAL UX

Index/value distinction clear.

Long arrays scroll/virtualize safely.

---

# 9. POINTER/REFERENCE UX

Linked structures need arrows/identity plus textual alternative.

---

# 10. STACK/QUEUE UX

Operation buttons reflect ADT operations.

---

# 11. TREE UX

Zoom/pan if needed.

Keyboard/list alternative.

---

# 12. HEAP UX

Array/tree dual representation useful.

Do not imply BST semantics.

---

# 13. HASH UX

Collision/probe sequence understandable.

---

# 14. GRAPH UX

Support:

- node/edge selection;
- directed arrow;
- weight label;
- start/target;
- textual graph summary.

---

# 15. GRAPH EDITOR

For learner task where needed:

add/remove node/edge with constraints.

Keyboard alternative.

---

# 16. DP TABLE UX

State meaning visible.

Row/column headers persistent.

Large table scrolls with accessible labels.

---

# 17. RECURSION UX

Call stack/tree readable.

Avoid overwhelming huge recursion.

---

# 18. COMPLEXITY UX

Display:

- size variable;
- case;
- time;
- space;
- assumptions.

Avoid naked badge `O(n)` without context.

---

# 19. COMPLEXITY COMPARISON

Compare algorithms under same task/assumptions.

Charts are secondary to symbolic reasoning.

---

# 20. BENCHMARK UX

Label clearly:

“empirical timing”

not:

“proof of complexity”.

---

# 21. PSEUDOCODE UX

Readable, selectable, syntax-highlighted carefully.

Do not make it look like executable Python if it is not.

---

# 22. CODE LAB

Reuse Python subject/runtime editor where possible.

ALG supplies algorithm task contract and trace hooks.

---

# 23. RUN VS TRACE VS SUBMIT

Separate controls:

`Run`

`Trace`

`Test`

`Submit`.

Learner understands consequences.

---

# 24. TEST RESULT UX

Show:

- case category;
- pass/fail;
- expected contract;
- hidden-test protection.

---

# 25. COMPLEXITY REQUIREMENT UX

Task shows expected bound when part of requirement.

---

# 26. CORRECTNESS EXPLANATION UX

Text/proof field supports structured reasoning.

---

# 27. COUNTEREXAMPLE UX

Allow compact structured input for counterexample.

---

# 28. HINT UX

Consistent with shared hint design and ALG03 ladder.

---

# 29. AI TUTOR UX

Contextual panel.

Do not cover trace/graph.

AI suggestions visually distinct from canonical facts.

---

# 30. ERROR NOTEBOOK UX

Group recurring:

- boundary;
- invariant;
- complexity;
- graph;
- DP;
- data-structure choice errors.

---

# 31. PROGRESS UX

Use C4 evidence/mastery states.

No fake “algorithm mastery = animation watched”.

---

# 32. RESPONSIVE DESIGN

Mobile should not render desktop graph/editor squeezed tiny.

Use:

- stacked panels;
- sheets;
- focused trace;
- textual alternatives.

---

# 33. TABLET

Can show trace + explanation split if space permits.

---

# 34. DESKTOP

Can show:

problem

| visualization

| state/explanation

without overwhelming.

---

# 35. KEYBOARD ACCESSIBILITY

Core trace and task flows usable via keyboard.

---

# 36. SCREEN READER

Provide semantic summaries for:

- array;
- stack/queue;
- tree;
- graph;
- DP table.

---

# 37. COLOR

Visited/frontier/current/correct/error states need non-color cues.

---

# 38. FOCUS

Graph/trace controls preserve logical focus.

---

# 39. MOTION

Respect reduced motion.

Animation can become instant/step change.

---

# 40. TOUCH

Node/edge targets and trace controls usable on touch.

---

# 41. LARGE TEXT

Labels/panels do not clip.

---

# 42. AUTHORING MODEL

Use shared P12-style authoring lifecycle.

ALG adds subject-specific editors.

---

# 43. ALGORITHM AUTHORING

Fields:

- canonical ID;
- concept;
- preconditions;
- steps/pseudocode;
- invariant;
- correctness;
- complexity;
- variants;
- examples;
- counterexamples;
- references.

---

# 44. DATA-STRUCTURE AUTHORING

Fields:

- ADT;
- representation;
- invariant;
- operations;
- operation complexity;
- examples.

---

# 45. TRACE AUTHORING

Prefer generated trace from canonical engine.

Manual trace can exist as curated example but must validate against engine/contract.

---

# 46. VISUALIZATION CONFIG AUTHORING

Configure:

- layout;
- labels;
- allowed controls;
- initial input.

Do not embed arbitrary script.

---

# 47. EXERCISE AUTHORING

Task type:

- trace;
- choose strategy;
- choose structure;
- complexity;
- counterexample;
- code;
- proof;
- graph construction.

---

# 48. GRADER AUTHORING

Use ALG03 grader contract.

No arbitrary hidden executable grading script without sandbox/governance.

---

# 49. HIDDEN TEST AUTHORING

Protected from learner/AI.

---

# 50. WRONG-SOLUTION AUTHORING

Allow adding known wrong solution fixture to strengthen grader.

---

# 51. INPUT GENERATOR AUTHORING

Declarative constraints preferred.

Examples:

- duplicates;
- sorted;
- DAG;
- connected;
- negative weights forbidden/allowed.

---

# 52. PREVIEW

Author can preview:

- content;
- trace;
- visualization;
- grader;
- responsive states.

---

# 53. VALIDATION

Before review:

- refs valid;
- preconditions present;
- complexity normalized;
- canonical owner resolved;
- grader tests pass;
- visualizer matches trace.

---

# 54. TEST-OF-TESTS AUTHORING GATE

Known wrong implementations must fail.

Known correct alternatives must pass.

---

# 55. CONTENT LIFECYCLE

Use shared governance:

draft

→ validate

→ review

→ approve

→ activate.

---

# 56. SUBJECT PACKAGING

Pack:

- lessons;
- canonical entities;
- traces/fixtures;
- lightweight visualization config;
- optional media.

Do not package duplicate platform runtime.

---

# 57. OFFLINE UX

Downloaded subject pack supports deterministic learning/visualization where capabilities permit.

---

# 58. STATE RESTORATION

Reload preserves:

- current task;
- learner answer;
- trace position where useful;
- draft explanation.

---

# 59. MULTI-TAB

Same learner attempt/draft conflict handled safely.

---

# 60. ANALYTICS

Track learning semantics:

- task started;
- hint used;
- trace interaction;
- submission;
- error category.

Do not treat animation play count as mastery.

---

# 61. REQUIRED DELIVERABLES

Create:

`subjects/algorithms/docs/alg05/ALG_SUBJECT_MANIFEST.md`

`ALG_LEARNING_BLOCK_REGISTRY.json`

`ALG_TRACE_PLAYER_UX_CONTRACT.md`

`ALG_GRAPH_TREE_ACCESSIBILITY_CONTRACT.md`

`ALG_CODE_LAB_INTEGRATION_CONTRACT.md`

`ALG_AUTHORING_SCHEMA_CONTRACT.md`

`ALG_GRADER_AUTHORING_CONTRACT.md`

`ALG_RESPONSIVE_MATRIX.md`

`ALG_ACCESSIBILITY_MATRIX.md`

`ALG_SUBJECT_PACK_CONTRACT.md`

`ALG06_INPUT_CONTRACT.md`.

---

# 62. PILOT JOURNEYS

A — binary search trace + boundary case

B — stable sort equal-key visualization

C — heap operation + invariant

D — graph BFS/DFS

E — Dijkstra invalid negative-edge rejection

F — DP state/table problem

G — author creates algorithm task without code change.

---

# 63. PASS CONDITIONS

PASS when:

- subject integrates through manifest/capabilities;
- visualizations are canonical-state-driven;
- code lab reuses shared runtime;
- responsive/mobile usable;
- graph/tree accessible alternatives exist;
- authoring can create ordinary subject content no-code;
- grader authoring is governed;
- offline packaging does not duplicate kernel.

---

# 64. FAIL CONDITIONS

FAIL if:

- a new App Shell is created;
- a second code editor/runtime is created unnecessarily;
- animation state becomes canonical algorithm truth;
- graph accessibility is canvas-only;
- authors must edit application code for ordinary tasks;
- hidden tests leak into learner/AI context.

---

# 65. FINAL PRINCIPLE

**SUBJECT-SPECIFIC INTERACTION, SHARED PLATFORM.**
