# ALG06 — ACCEPTANCE · HARDENING · LEGACY CLOSURE · RC READINESS
## Subject-specific final gate before shared production release

Mode:

`RISK-BASED · EDGE-CASE-HEAVY · PROPERTY-TESTED · NO-KNOWN-BLOCKER`

---

# 0. MISSION

Prove the integrated Algorithms & Data Structures subject is correct, robust, accessible and ready to become an exact release candidate.

Production deploy remains the shared release annex.

---

# 1. ENTRY GATE

Requires ALG01–ALG05 implementation/evidence.

---

# 2. ACCEPTANCE GATES

`A ACADEMIC TRUTH`

`B REASONING/ASSESSMENT`

`C EXECUTION/VISUALIZATION`

`D UX/ACCESSIBILITY`

`E OFFLINE/PERFORMANCE`

`F SECURITY/GOVERNANCE`

`G LEGACY/RC`.

All mandatory gates pass.

---

# 3. CANDIDATE IDENTITY

Record exact:

- SHA;
- content snapshot;
- subject pack;
- runtime/provider versions;
- config/flags;
- lockfile.

---

# 4. CURRICULUM ACCEPTANCE

Verify prerequisite order and competency coverage.

---

# 5. CONTENT ACCEPTANCE

Canonical entities validate.

No duplicate IDs/dangling refs.

---

# 6. ADT ACCEPTANCE

Ensure ADT vs representation distinction remains.

---

# 7. COMPLEXITY CLAIM ACCEPTANCE

Sample/check:

- size variable;
- case;
- representation;
- time/space;
- assumptions.

---

# 8. CORRECTNESS CLAIM ACCEPTANCE

Canonical proof/invariant explanations match algorithm preconditions.

---

# 9. BINARY SEARCH EDGE MATRIX

At minimum:

- empty;
- singleton;
- first;
- last;
- missing;
- duplicates;
- interval boundaries.

---

# 10. SORT EDGE MATRIX

At minimum:

- empty;
- singleton;
- sorted;
- reverse;
- duplicates;
- all equal;
- stable equal-key records.

---

# 11. QUICKSORT EDGE MATRIX

If included:

- pivot extremes;
- duplicates;
- partition variant;
- worst-case behavior.

---

# 12. MERGESORT EDGE MATRIX

If included:

- odd/even sizes;
- stability;
- auxiliary space.

---

# 13. HASH EDGE MATRIX

- collision;
- high load;
- resize;
- missing key;
- duplicate update semantics;
- worst-case claim.

---

# 14. STACK/QUEUE EDGE MATRIX

- empty pop/dequeue;
- single item;
- wrap-around if circular implementation exists;
- capacity if bounded.

---

# 15. LINKED STRUCTURE EDGE MATRIX

- empty;
- head/tail;
- single node;
- delete missing;
- cycle only if structure supports.

---

# 16. TREE EDGE MATRIX

- empty;
- root;
- leaf;
- one-child;
- two-child delete if BST;
- duplicate-key policy;
- skewed tree.

---

# 17. HEAP EDGE MATRIX

- empty;
- singleton;
- equal priorities;
- heapify;
- repeated extract;
- heap property.

---

# 18. GRAPH REPRESENTATION MATRIX

- adjacency list;
- adjacency matrix;
- directed/undirected;
- weighted/unweighted.

Only supported combinations required.

---

# 19. BFS EDGE MATRIX

- isolated start;
- disconnected;
- cycle;
- duplicate adjacency entries if input permits;
- multiple valid visitation orders.

---

# 20. DFS EDGE MATRIX

- recursion/iterative;
- cycle;
- disconnected traversal forest;
- multiple valid orders.

---

# 21. TOPOLOGICAL SORT

- DAG;
- cycle rejection;
- multiple valid orders.

---

# 22. DIJKSTRA

- nonnegative graph;
- unreachable;
- equal distances;
- zero weight;
- negative edge rejected.

---

# 23. MST

If included:

- disconnected input policy;
- equal weights;
- multiple valid MSTs;
- negative weights if supported.

---

# 24. UNION-FIND

If included:

- repeated union;
- same-set union;
- path compression;
- rank/size invariant.

---

# 25. GREEDY

Golden counterexample for at least one false greedy rule.

---

# 26. DP

- base;
- state;
- transition;
- order;
- reconstruction;
- memory optimization where in scope.

---

# 27. BACKTRACKING

- no solution;
- one solution;
- many;
- pruning;
- termination.

---

# 28. RECURRENCE / COMPLEXITY

If included:

known recurrence fixtures and case distinction.

---

# 29. MULTIPLE VALID SOLUTIONS

Critical gate.

Test:

- topo order;
- MST;
- graph traversal order;
- alternative code implementations;
- alternative algorithm where allowed.

---

# 30. WRONG SOLUTION MATRIX

Known wrong solutions must fail:

- off-by-one;
- unsorted binary search assumption;
- visited marking bug;
- invalid Dijkstra negative edge;
- unstable behavior when stability required;
- hash collision loss;
- wrong DP state/transition.

---

# 31. TEST-OF-TESTS

Grader suite proves both:

- rejection power;
- acceptance breadth.

---

# 32. COMPLEXITY GRADER ACCEPTANCE

Must not reject equivalent notation.

Must bind case/representation.

Must not infer arbitrary code complexity falsely.

---

# 33. PROPERTY TESTS

Recommended:

- sort permutation + order;
- heap invariant;
- queue FIFO;
- stack LIFO;
- BST invariant;
- BFS reachability/distance;
- topo validity;
- path validity.

---

# 34. RANDOMIZED TESTS

Use deterministic seeds.

Record failures.

---

# 35. FUZZ / ADVERSARIAL INPUT

Bounded fuzz for parsers/graph editors/input generators.

---

# 36. TRACE ENGINE ACCEPTANCE

Canonical trace state matches reference.

---

# 37. TRACE DETERMINISM

Same seed/input/variant reproduces.

---

# 38. VISUALIZER ACCEPTANCE

Visualizer state never diverges from trace.

---

# 39. GRAPH VISUAL SEMANTICS

Position does not imply weight/distance.

Directed arrows/weights visible.

---

# 40. HEAP VISUAL SEMANTICS

No false BST/global sorted implication.

---

# 41. DP VISUAL SEMANTICS

Cell/state meaning understandable.

---

# 42. BENCHMARK ACCEPTANCE

UI labels empirical results honestly.

No auto Big-O declaration from timing.

---

# 43. PYTHON RUNTIME INTEGRATION

Reuse Python runtime.

No duplicate unrestricted interpreter.

---

# 44. EXECUTION SECURITY

Timeout/memory/output/file/network policies inherited and tested.

---

# 45. AI TUTOR ACCEPTANCE

Test:

- grounded explanation;
- invariant coaching;
- complexity context;
- no hidden-test reveal;
- no official mastery write;
- no answer reveal when blocked.

---

# 46. AI WRONG-COMPLEXITY FIXTURE

Feed misleading learner claim.

AI must not simply agree.

---

# 47. AI PRECONDITION FIXTURE

Dijkstra negative edge / binary search unsorted examples.

---

# 48. AI PROVIDER FAILURE

Canonical lesson/trace remains usable.

---

# 49. RESPONSIVE ACCEPTANCE

Test:

- mobile;
- tablet;
- desktop;
- wide.

---

# 50. GRAPH MOBILE

Must have usable focused/text alternative.

---

# 51. KEYBOARD

Trace controls and core task usable.

---

# 52. SCREEN READER

Structured alternative for graph/tree/table.

---

# 53. REDUCED MOTION

Animations can reduce/disable without losing state meaning.

---

# 54. LARGE TEXT

No clipped essential controls.

---

# 55. AUTHORING ACCEPTANCE

Author creates:

- algorithm;
- data structure;
- trace task;
- complexity task;
- code task

without code edit for ordinary cases.

---

# 56. AUTHORING VALIDATOR

Reject:

- missing precondition;
- malformed complexity claim;
- dangling refs;
- invalid grader fixture.

---

# 57. HIDDEN TEST SECURITY

Learner/AI/browser client must not receive protected hidden test source unnecessarily.

---

# 58. OFFLINE MATRIX

Test:

- cached lesson;
- trace;
- visualization;
- static assessment;
- code runtime if supported;
- AI fallback.

---

# 59. SUBJECT PACK

Atomic/installable/versioned.

---

# 60. PERFORMANCE

Measure:

- initial subject load;
- large graph visualization;
- long trace;
- large DP table;
- code runtime init;
- search.

---

# 61. MEMORY

Repeated visualizer mount/unmount should not grow unbounded.

---

# 62. LARGE TRACE

Bounded rendering/virtualization/summarization.

---

# 63. MULTI-TAB

No shared trace/attempt corruption.

---

# 64. STATE PERSISTENCE

Reload preserves safe learner state.

---

# 65. LEGACY INVENTORY

From ALG01/P15-style observation classify:

- duplicate algorithm registry;
- old visualizer;
- old grader;
- old route;
- duplicate runtime;
- stale feature flag.

---

# 66. DUPLICATE OWNER GATE

Zero unresolved duplicate canonical writers.

---

# 67. PYTHON LEAKAGE GATE

Python syntax/runtime teaching routed out of ALG where inappropriate.

---

# 68. DATABASE LEAKAGE GATE

DB-specific indexing/query behavior not accidentally claimed as generic structure truth.

---

# 69. DEPENDENCY / SUPPLY CHAIN

Subject adds no unjustified heavy/unsafe library.

---

# 70. MIGRATION

If subject schema/IDs changed:

- migration;
- aliases;
- learner state preservation;
- rollback.

---

# 71. RC FREEZE

Freeze:

- exact SHA;
- content snapshot;
- subject pack;
- capability versions;
- config;
- lockfile.

---

# 72. PRODUCTION SMOKE PROFILE

Provide shared release procedure with safe production smoke:

1. open Algorithms subject;
2. open one canonical lesson;
3. run binary search trace;
4. run graph traversal visualization;
5. submit isolated practice task;
6. verify active subject pack/content snapshot;
7. verify Python runtime integration if enabled;
8. verify optional AI fallback/grounding;
9. offline open representative cached content if supported.

No destructive production learner data.

---

# 73. REQUIRED DELIVERABLES

Create:

`subjects/algorithms/docs/alg06/ALG_ACCEPTANCE_MATRIX.md`

`ALG_EDGE_CASE_REGRESSION.json`

`ALG_PROPERTY_TEST_REPORT.md`

`ALG_GRADER_TEST_OF_TESTS_REPORT.md`

`ALG_VISUALIZER_TRACE_CONSISTENCY_REPORT.md`

`ALG_AI_ACCEPTANCE_REPORT.md`

`ALG_ACCESSIBILITY_RESPONSIVE_REPORT.md`

`ALG_OFFLINE_PERFORMANCE_REPORT.md`

`ALG_LEGACY_CLOSURE_REPORT.md`

`ALG_RC_MANIFEST.json`

`ALG_PRODUCTION_SMOKE_PROFILE.md`

`ALG06_EVIDENCE_INDEX.md`.

---

# 74. BLOCKERS

BLOCKER examples:

- wrong canonical complexity;
- invalid algorithm precondition;
- grader rejects valid alternative systematically;
- grader accepts known incorrect solution;
- trace and visualizer disagree;
- hidden tests leak;
- duplicate algorithm truth owner;
- learner state corruption;
- unrestricted duplicate runtime.

---

# 75. PASS CONDITIONS

PASS when:

1. academic truth gate passes;
2. prerequisite/curriculum gate passes;
3. correctness/complexity gate passes;
4. alternate-solution grading passes;
5. wrong-solution rejection passes;
6. property tests pass;
7. edge matrices pass;
8. trace engine passes;
9. visualizer consistency passes;
10. Python runtime integration is clean;
11. AI boundaries pass;
12. responsive/mobile passes;
13. accessibility passes;
14. authoring passes;
15. hidden-test security passes;
16. offline behavior passes;
17. performance/memory acceptable;
18. no duplicate canonical owner remains;
19. migration/legacy closure complete;
20. exact RC + production smoke profile ready.

---

# 76. FINAL RESPONSE FORMAT

`ALG06 STATUS: PASS / FAIL / BLOCKED`

`Candidate SHA:`

`Content snapshot:`

`Academic truth: PASS / FAIL`

`Correctness/complexity: PASS / FAIL`

`Grader breadth/rejection: PASS / FAIL`

`Trace/visualizer: PASS / FAIL`

`Runtime integration: PASS / FAIL`

`AI: PASS / FAIL`

`UX/accessibility: PASS / FAIL`

`Offline/performance: PASS / FAIL`

`Legacy/duplicate owners: PASS / FAIL`

`RC readiness: READY / NOT READY`

---

# 77. FINAL PRINCIPLE

**THE RC MUST PROVE THAT CORRECT IDEAS, CORRECT GRADING AND CORRECT VISUALIZATION ALL AGREE.**
