# ALG01 — FORENSIC BASELINE
## Current-reality audit before redesign

Mode:

`AUDIT-ONLY · NO-REDESIGN · EVIDENCE-FIRST · REPOSITORY-TRUTH-FIRST`

---

# 0. MISSION

Determine exactly what Algorithms/Data Structures content, code, data, UI, state and runtime capabilities already exist.

ALG01 must not build the future system.

It must produce the evidence needed to design ALG02 truthfully.

---

# 1. FORBIDDEN DURING BASELINE

Do not:

- rewrite curriculum;
- bulk-generate exercises;
- replace visualizers;
- rename canonical IDs;
- migrate learner state;
- delete legacy code;
- add new algorithms merely because they are missing.

Allowed only:

- read;
- trace;
- run non-destructive tests;
- classify;
- document;
- create audit artifacts.

---

# 2. REPOSITORY DISCOVERY

Search:

- `subjects/algorithms/`;
- algorithms inside Python/Math/AI subjects;
- generic visualization engines;
- graph/tree components;
- exercise/test datasets;
- route registrations;
- state stores;
- APIs;
- old experiments;
- generated files.

Do not assume folder names.

---

# 3. CONTENT INVENTORY

Inventory counts/types for:

- concepts;
- algorithms;
- data structures;
- exercises;
- assessments;
- traces;
- visualizations;
- projects;
- datasets;
- reference implementations.

Record source files and ownership evidence.

---

# 4. CURRICULUM INVENTORY

Map actual current topics.

Possible examples to look for, not assume:

- complexity;
- arrays/lists;
- stacks/queues;
- recursion;
- search/sort;
- hashing;
- trees/heaps;
- graphs;
- greedy;
- dynamic programming;
- backtracking.

Mark:

`PRESENT`
`PARTIAL`
`DUPLICATED`
`LEGACY`
`MISSING`
`UNKNOWN`.

---

# 5. PREREQUISITE AUDIT

Find explicit/implicit prerequisite relationships.

Detect contradictions such as:

- heap before tree fundamentals;
- shortest path before graph representation;
- DP before recurrence/state decomposition;
- complexity assessment before notation foundation.

---

# 6. ADT AUDIT

Determine whether current content distinguishes:

- abstract data type;
- interface/operations;
- invariant;
- concrete representation;
- implementation language.

Flag direct “data structure = code class” conflation.

---

# 7. COMPLEXITY AUDIT

Locate current handling of:

- Big-O;
- Big-Ω;
- Big-Θ;
- best/average/worst case;
- time vs space;
- amortized complexity;
- recursion/recurrence if present.

Flag stopwatch-only claims.

---

# 8. CORRECTNESS AUDIT

Look for:

- invariants;
- termination;
- proof sketches;
- induction;
- counterexamples;
- pre/postconditions.

Classify whether correctness is actually taught or only implied.

---

# 9. ALGORITHM INVENTORY

For each canonical-looking algorithm record:

- name/ID;
- inputs;
- outputs;
- preconditions;
- state/steps;
- correctness explanation;
- complexity claims;
- variants;
- implementation examples;
- provenance/source.

---

# 10. DATA-STRUCTURE INVENTORY

For each structure record:

- ADT;
- representation;
- operations;
- operation complexity;
- invariants;
- memory model;
- variants.

---

# 11. SEARCH / SORT AUDIT

Inspect:

- linear/binary search;
- elementary sorts;
- divide-and-conquer sorts;
- stability;
- in-place/out-of-place;
- comparison/non-comparison boundary;
- duplicate handling;
- edge cases.

Do not assume all must exist.

---

# 12. RECURSION AUDIT

Find:

- base case;
- recursive case;
- call-stack reasoning;
- tree recursion;
- recursion depth;
- tail recursion claims;
- iterative alternatives.

Flag language-specific myths.

---

# 13. HASHING AUDIT

Inspect:

- hash function concept;
- collision handling;
- load factor;
- open addressing/chaining;
- expected vs worst-case claims;
- resizing.

---

# 14. TREE AUDIT

Inspect:

- binary tree;
- BST;
- traversals;
- balanced-tree mentions;
- heap;
- trie if present.

Record invariant quality.

---

# 15. GRAPH AUDIT

Inspect:

- directed/undirected;
- weighted/unweighted;
- adjacency list/matrix;
- BFS/DFS;
- cycle detection;
- topological sort;
- shortest path;
- MST.

Flag algorithm applied outside preconditions.

---

# 16. GREEDY AUDIT

Look for explanation of:

- greedy choice;
- exchange/cut argument;
- counterexamples;
- when greedy fails.

---

# 17. DYNAMIC PROGRAMMING AUDIT

Look for:

- state definition;
- recurrence;
- base cases;
- dependency order;
- memoization/tabulation;
- reconstruction;
- complexity.

Flag “DP = memoization” oversimplification.

---

# 18. BACKTRACKING AUDIT

Inspect:

- search tree;
- candidate generation;
- constraint pruning;
- termination;
- exponential behavior.

---

# 19. EXECUTION ENGINE AUDIT

Find any code execution/trace provider.

Record:

- language;
- sandbox;
- deterministic behavior;
- step instrumentation;
- input generation;
- timeout;
- output limits.

---

# 20. VISUALIZATION ENGINE AUDIT

Inventory:

- array animation;
- pointer/list view;
- stack/queue;
- tree;
- heap;
- graph;
- recursion tree;
- DP table.

Determine whether visualization consumes canonical state or embeds its own algorithm logic.

---

# 21. DUPLICATE ENGINE AUDIT

Identify multiple implementations of:

- BFS/DFS;
- sorting;
- heap;
- graph state;
- complexity calculator;
- trace generation.

Flag duplicate owners.

---

# 22. BENCHMARK AUDIT

Find performance demos.

Check whether they are incorrectly presented as asymptotic proof.

---

# 23. ASSESSMENT AUDIT

Classify:

- MCQ;
- trace;
- operation sequence;
- code implementation;
- correctness explanation;
- complexity analysis;
- choose-data-structure;
- proof/counterexample;
- project.

---

# 24. GRADER AUDIT

Determine if grading uses:

- exact answer string;
- final output only;
- public tests;
- hidden tests;
- property tests;
- complexity constraints;
- trace comparison;
- rubric.

---

# 25. ALTERNATE-SOLUTION AUDIT

Check whether tasks permit multiple valid algorithms/implementations.

Flag graders that reject valid alternatives.

---

# 26. EDGE-CASE AUDIT

Look for coverage of:

- empty input;
- singleton;
- duplicates;
- already sorted;
- reverse sorted;
- all equal;
- negative/zero values;
- disconnected graphs;
- cycles;
- self loops;
- parallel edges;
- unreachable nodes;
- large depth;
- hash collisions.

---

# 27. LEARNER-STATE AUDIT

Locate:

- completion;
- attempts;
- mastery;
- errors;
- review;
- projects.

Ensure subject-specific code is not writing generic mastery outside C4 owner.

---

# 28. ERROR TAXONOMY AUDIT

Identify existing learner error categories:

- representation;
- invariant;
- off-by-one;
- termination;
- wrong complexity;
- wrong precondition;
- mutation;
- traversal order;
- greedy fallacy;
- DP-state error.

---

# 29. PYTHON LEAKAGE AUDIT

Identify content that is actually Python syntax/runtime rather than algorithmic theory.

Route to Python owner where appropriate.

---

# 30. MATH LEAKAGE AUDIT

Identify generic proof/algebra content that belongs to Math foundation.

Keep only algorithm-specific application.

---

# 31. DATABASE LEAKAGE AUDIT

Indexing/storage examples may exist.

Distinguish generic B-tree/hash theory from DB-specific behavior.

---

# 32. AI AUDIT

Find AI tutor use.

Determine whether AI:

- fabricates complexity;
- gives solution immediately;
- writes mastery;
- bypasses assessment;
- executes hidden tests.

---

# 33. ARCHITECTURE AUDIT

Under C1 inspect:

- manifest;
- registry;
- capability provider;
- hard-coded routes;
- subject-specific kernel patches;
- duplicate platform logic.

---

# 34. UI/UX AUDIT

Under C2 inspect:

- visualization usability;
- step controls;
- responsive behavior;
- keyboard controls;
- color-only state;
- graph accessibility;
- mobile overflow.

---

# 35. QA AUDIT

Under C3 inspect:

- unit tests;
- property tests;
- golden traces;
- randomized tests;
- visual regression;
- browser/device tests;
- release evidence.

---

# 36. LEARNING-OUTCOME AUDIT

Under C4 inspect whether evidence proves:

- concept understanding;
- trace reasoning;
- correctness;
- complexity;
- data-structure selection;
- implementation;
- transfer.

---

# 37. LEGACY CLASSIFICATION

For each legacy candidate:

`KEEP`
`MIGRATE`
`RETIRE`
`UNKNOWN`.

Do not delete.

---

# 38. RISK REGISTER

At minimum classify:

- wrong complexity claims;
- invalid algorithm preconditions;
- duplicate owner;
- visualization logic divergence;
- weak grader;
- learner-state corruption;
- AI authority leak;
- security/runtime risk.

---

# 39. REQUIRED DELIVERABLES

Create:

`subjects/algorithms/docs/alg01/ALG01_EXECUTIVE_SUMMARY.md`

`ALG01_REPOSITORY_MAP.md`

`ALG01_CONTENT_INVENTORY.json`

`ALG01_ALGORITHM_INVENTORY.json`

`ALG01_DATA_STRUCTURE_INVENTORY.json`

`ALG01_ASSESSMENT_GRADER_AUDIT.md`

`ALG01_RUNTIME_VISUALIZATION_AUDIT.md`

`ALG01_OWNER_DUPLICATION_MAP.md`

`ALG01_LEGACY_REGISTER.json`

`ALG01_RISK_REGISTER.json`

`ALG02_INPUT_CONTRACT.md`.

No empty ceremonial docs.

---

# 40. PASS CONDITIONS

ALG01 PASS only if:

- actual scope is identified;
- current topics/content counted;
- algorithm/data-structure owners located;
- runtime/visualizer mapped;
- assessment/grader mapped;
- learner state mapped;
- legacy/duplicates classified;
- adjacent-subject leakage mapped;
- major risks identified;
- ALG02 receives evidence.

---

# 41. FAIL CONDITIONS

FAIL if:

- future curriculum is invented as current reality;
- repository scope remains ambiguous;
- duplicate owners are ignored;
- grader/runtime unknown;
- current content claims are unverified;
- audit modifies production learning behavior.

---

# 42. FINAL RESPONSE FORMAT

`ALG01 STATUS: PASS / FAIL / BLOCKED`

`Base SHA:`

`Subject scope discovered:`

`Content summary:`

`Canonical-owner candidates:`

`Duplicate-owner risks:`

`Assessment/runtime risks:`

`Legacy count:`

`ALG02 readiness: READY / NOT READY`

---

# 43. FINAL PRINCIPLE

**MAP REALITY BEFORE IMPROVING IT.**

Do not confuse an attractive algorithm page with a trustworthy algorithm-learning system.