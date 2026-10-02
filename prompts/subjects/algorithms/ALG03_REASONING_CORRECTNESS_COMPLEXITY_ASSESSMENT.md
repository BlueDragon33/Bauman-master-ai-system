# ALG03 — ALGORITHMIC REASONING · CORRECTNESS · COMPLEXITY · ASSESSMENT
## Problem decomposition · Trace · Invariant · Proof · Trade-offs · Evidence

Mode:

`REASONING-FIRST · MULTIPLE-VALID-SOLUTION-AWARE · COMPLEXITY-AWARE · EVIDENCE-BASED`

---

# 0. ENTRY GATE

Requires ALG02 canonical model.

---

# 1. MISSION

Define how learners reason, solve, justify, compare and are assessed in Algorithms & Data Structures.

The core learning loop is:

`Problem`

→ `Representation`

→ `Constraints`

→ `Strategy`

→ `State / Steps`

→ `Invariant`

→ `Correctness`

→ `Complexity`

→ `Implementation`

→ `Testing`

→ `Trade-off`

→ `Transfer`.

---

# 2. REASONING DIMENSIONS

Assess separately:

- representation;
- strategy selection;
- state trace;
- invariant;
- correctness;
- complexity;
- implementation;
- testing;
- trade-off;
- explanation.

---

# 3. FINAL OUTPUT ≠ FULL EVIDENCE

A program returning expected output on sample data does not prove:

- algorithm is general;
- complexity is acceptable;
- invariant is understood;
- edge cases are handled.

---

# 4. PROBLEM-DECOMPOSITION CONTRACT

Learner should identify:

- input;
- output;
- constraints;
- size;
- structure;
- required operation;
- performance target.

---

# 5. REPRESENTATION CHOICE

Evidence may ask learner to choose:

- array/list;
- set/map;
- heap;
- tree;
- graph representation;
- DP state.

Choice and justification matter.

---

# 6. STRATEGY CHOICE

Possible strategy evidence:

- brute force;
- divide-and-conquer;
- greedy;
- DP;
- backtracking;
- traversal;
- incremental data structure.

---

# 7. TRACE MODEL

Trace should record meaningful algorithm state, not every runtime bytecode step.

---

# 8. TRACE TASK

Examples:

- array indices;
- queue/frontier;
- recursion stack;
- heap contents;
- visited set;
- DP table;
- union-find parents.

---

# 9. TRACE ACCEPTANCE

Multiple equivalent traces may exist when order is unspecified.

Task contract must state ordering rules.

---

# 10. INVARIANT EVIDENCE

Learner can be asked to:

- state invariant;
- identify when it holds;
- explain preservation;
- use it to justify result.

---

# 11. LOOP INVARIANT

Assess:

- initialization;
- maintenance;
- termination consequence.

---

# 12. STRUCTURE INVARIANT

Examples:

- heap property;
- BST property;
- union-find parent/rank semantics.

---

# 13. CORRECTNESS EVIDENCE

Levels may include:

- intuitive explanation;
- counterexample reasoning;
- proof sketch;
- formal invariant-based argument.

Match learner stage.

---

# 14. TERMINATION EVIDENCE

Where meaningful, learner explains why recursion/loop/search ends.

---

# 15. PRECONDITION EVIDENCE

Assessment should detect when learner applies an algorithm outside valid preconditions.

---

# 16. COUNTEREXAMPLE TASK

Learner may refute false claim with minimal counterexample.

This is high-value evidence.

---

# 17. COMPLEXITY EVIDENCE

Separate:

- identify size variable;
- count/derive operation growth;
- choose asymptotic bound;
- distinguish case;
- justify.

---

# 18. BIG-O STRING MATCH FORBIDDEN

`O(n log n)` as a typed string can be one answer form, but grading must understand normalized notation/equivalent valid forms.

---

# 19. CASE TYPE

Question must specify or infer clearly:

- worst;
- average;
- best;
- amortized.

---

# 20. TIME VS SPACE

Do not accept time answer for space question.

---

# 21. COMPLEXITY UNDER REPRESENTATION

Example:

BFS with adjacency list vs matrix differs.

Assessment must bind representation.

---

# 22. RECURSIVE COMPLEXITY

When in scope:

learner can derive recurrence and solve/estimate.

---

# 23. AMORTIZED EVIDENCE

Learner should not confuse amortized with average.

---

# 24. BENCHMARK TASK

Benchmark can test empirical understanding.

Do not grade asymptotic truth solely from timing.

---

# 25. DATA-STRUCTURE OPERATION ASSESSMENT

Ask:

- perform operations;
- predict state;
- preserve invariant;
- analyze complexity.

---

# 26. SEARCH ASSESSMENT

Edge cases:

- empty;
- missing;
- duplicate;
- boundary target.

---

# 27. SORT ASSESSMENT

Can assess:

- trace;
- stability;
- comparison count;
- in-place;
- worst-case input;
- algorithm selection.

---

# 28. HASHING ASSESSMENT

Include:

- collision;
- probing/chaining;
- load factor;
- resizing;
- expected/worst distinction.

---

# 29. TREE ASSESSMENT

Include:

- traversal;
- search/insert/delete;
- invariant;
- height;
- balance where in scope.

---

# 30. HEAP ASSESSMENT

Include:

- heapify;
- insert/extract;
- priority queue semantics;
- index relationships.

---

# 31. GRAPH ASSESSMENT

Include:

- representation;
- BFS/DFS;
- reachability;
- cycles;
- topological constraints;
- path algorithms.

---

# 32. DIJKSTRA PRECONDITION TEST

Negative-edge counterexample should exist in golden set.

---

# 33. TOPOLOGICAL SORT

Any valid order accepted when multiple exist, unless deterministic tie-breaking is explicitly part of task.

---

# 34. MST

Any valid minimum tree accepted when weights allow multiple MSTs.

Grader must not compare one exact edge sequence only.

---

# 35. GREEDY ASSESSMENT

Learner may need to:

- propose greedy choice;
- justify;
- find failure case.

---

# 36. DP ASSESSMENT

Separate:

- state definition;
- transition;
- base;
- order;
- reconstruction;
- complexity.

A correct final number with wrong state model is incomplete evidence.

---

# 37. BACKTRACKING ASSESSMENT

Evaluate:

- state;
- branching;
- pruning;
- correctness;
- exponential complexity reasoning.

---

# 38. IMPLEMENTATION ASSESSMENT

Use code execution where appropriate.

Implementation evidence is tied to canonical algorithm.

---

# 39. LANGUAGE FLEXIBILITY

If course policy permits Python only, grade Python.

Conceptual assessment should still distinguish algorithmic from Python-specific mistakes.

---

# 40. ALTERNATIVE IMPLEMENTATION

Different code structure is valid if behavior/contracts/complexity satisfy task.

Do not source-string match.

---

# 41. ALTERNATIVE ALGORITHM

Task may allow multiple algorithms.

Rubric states:

- functional requirements;
- complexity target;
- memory target;
- stability/ordering requirements.

---

# 42. COMPLEXITY-CONSTRAINED GRADING

A solution can be:

functionally correct

but complexity-noncompliant.

Record separately.

---

# 43. PARTIAL CREDIT MODEL

Possible dimensions:

- representation;
- strategy;
- trace;
- correctness;
- complexity;
- code;
- tests.

C4 owns global evidence/mastery policy.

---

# 44. ERROR TAXONOMY

At minimum:

`REPRESENTATION_ERROR`

`PRECONDITION_ERROR`

`INVARIANT_ERROR`

`BOUNDARY_ERROR`

`TERMINATION_ERROR`

`STATE_UPDATE_ERROR`

`COMPLEXITY_ERROR`

`CASE_CONFUSION`

`MUTATION_ERROR`

`TRAVERSAL_ORDER_ERROR`

`GREEDY_FALLACY`

`DP_STATE_ERROR`

`GRAPH_MODEL_ERROR`

`IMPLEMENTATION_LANGUAGE_ERROR`.

---

# 45. OFF-BY-ONE

Golden fixtures required.

---

# 46. EMPTY INPUT

Golden fixtures required.

---

# 47. SINGLETON

Golden fixtures required.

---

# 48. DUPLICATES

Golden fixtures required.

---

# 49. ALL-EQUAL VALUES

Important for sort/search/hash behavior.

---

# 50. ALREADY SORTED / REVERSE SORTED

Useful for algorithm behavior/case analysis.

---

# 51. LARGE DEPTH

Recursion/stack limits belong implementation runtime, but algorithmic termination/space reasoning belongs ALG.

---

# 52. GRAPH DISCONNECTED

Golden fixture.

---

# 53. GRAPH CYCLE

Golden fixture.

---

# 54. SELF LOOP / PARALLEL EDGE

Include only if graph model supports them; task must specify.

---

# 55. UNREACHABLE TARGET

Path tasks must define expected result.

---

# 56. EQUAL WEIGHTS / TIES

Grader accepts multiple valid results where appropriate.

---

# 57. HASH COLLISION

Golden fixture.

---

# 58. RANDOMIZED ALGORITHM

If included:

- seed;
- probability;
- expected behavior;
- deterministic test harness.

---

# 59. HINT LADDER

Possible:

H0 no hint

H1 restate constraint

H2 identify representation

H3 identify strategy family

H4 suggest invariant/state

H5 reveal one next step

H6 full worked solution after policy allows.

---

# 60. SOLUTION REVEAL

Must respect assessment mode.

---

# 61. AI ASSISTANCE

AI can coach reasoning.

It cannot:

- declare official score;
- write mastery;
- reveal hidden tests;
- fabricate canonical complexity;
- bypass solution-reveal policy.

---

# 62. ERROR NOTEBOOK

Learner-facing recurring patterns may include:

- boundary mistakes;
- wrong structure choice;
- complexity misconception;
- graph direction confusion;
- DP-state confusion.

---

# 63. REMEDIATION

Map error to prerequisite and targeted task.

---

# 64. ADAPTIVE DIFFICULTY

Difficulty can vary by:

- input size;
- structural complexity;
- number of constraints;
- representation;
- required proof;
- hidden edge cases;
- complexity target.

Not merely bigger numbers.

---

# 65. TRANSFER

Learner should solve structurally similar problem with changed surface story.

---

# 66. ANTI-MEMORIZATION

Vary:

- labels;
- data values;
- graph shape;
- tie conditions;
- required output.

Preserve target competency.

---

# 67. PROPERTY TESTING

Useful for implementation assessment:

- sortedness;
- permutation preservation;
- heap invariant;
- path validity;
- structure size.

---

# 68. TEST-OF-TESTS

Validate grader can reject known wrong implementations and accept known alternative correct implementations.

---

# 69. WRONG SOLUTION LIBRARY

Maintain representative wrong implementations:

- off-by-one;
- wrong visited timing;
- wrong comparator;
- missing collision handling;
- greedy invalidity;
- DP transition error.

---

# 70. COMPLEXITY GRADER LIMIT

Static inference of arbitrary code complexity is hard.

Do not pretend exact complexity analysis from source unless supported.

Use task structure/rubric/benchmarks carefully.

---

# 71. BENCHMARK LIMIT

Timing is noisy and language/runtime dependent.

Use only supporting evidence.

---

# 72. FIRST ATTEMPT

Preserve under C4.

---

# 73. RETRIES

Append evidence; do not overwrite first attempt.

---

# 74. MASTERY BOUNDARY

ALG03 defines subject evidence semantics.

C4 decides generic mastery aggregation/state.

---

# 75. REQUIRED DELIVERABLES

Create:

`subjects/algorithms/docs/alg03/ALG_REASONING_CONTRACT.md`

`ALG_CORRECTNESS_ASSESSMENT_CONTRACT.md`

`ALG_COMPLEXITY_ASSESSMENT_CONTRACT.md`

`ALG_ERROR_TAXONOMY.json`

`ALG_ALTERNATE_SOLUTION_POLICY.md`

`ALG_GRADER_CONTRACT.md`

`ALG_GOLDEN_CORRECT_SOLUTIONS.json`

`ALG_GOLDEN_WRONG_SOLUTIONS.json`

`ALG_GOLDEN_EDGE_CASES.json`

`ALG04_INPUT_CONTRACT.md`.

---

# 76. PASS CONDITIONS

PASS when:

- algorithmic reasoning dimensions are explicit;
- correctness evidence exists beyond examples;
- complexity evidence is structured;
- alternate valid outputs/algorithms are supported;
- edge-case matrix exists;
- wrong-solution library tests the grader;
- remediation maps to prerequisites;
- mastery boundary with C4 is respected.

---

# 77. FAIL CONDITIONS

FAIL if:

- exact source string is primary grader;
- one exact topological order/MST is always required;
- Big-O grading ignores case/representation;
- timing is used as sole complexity truth;
- correct sample output is treated as correctness proof;
- AI becomes official authority.

---

# 78. FINAL PRINCIPLE

**GRADE THE ALGORITHMIC CONTRACT, NOT THE SHAPE OF ONE REFERENCE SOLUTION.**
