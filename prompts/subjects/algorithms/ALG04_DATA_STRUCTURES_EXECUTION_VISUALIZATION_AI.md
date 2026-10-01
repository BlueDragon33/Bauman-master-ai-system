# ALG04 — DATA STRUCTURES · EXECUTION · VISUALIZATION · AI INTELLIGENCE
## Capability providers without creating a second source of truth

Mode:

`CAPABILITY-BASED · CANONICAL-STATE-DRIVEN · DETERMINISTIC-FIRST · AI-BOUNDED`

---

# 0. ENTRY GATE

Requires ALG02 and ALG03 contracts.

---

# 1. MISSION

Provide execution, trace, visualization, benchmark and AI capabilities that consume canonical algorithmic truth.

These capabilities must not reimplement or redefine canonical algorithm semantics independently.

---

# 2. CAPABILITY REGISTRY

Possible subject capabilities:

`alg.trace.execute`

`alg.visual.array`

`alg.visual.stack_queue`

`alg.visual.linked_structure`

`alg.visual.tree`

`alg.visual.heap`

`alg.visual.hash`

`alg.visual.graph`

`alg.visual.dp`

`alg.input.generate`

`alg.benchmark.run`

`alg.reference.run`

`alg.ai.tutor`.

Register through C1 extension model.

---

# 3. ONE TRACE FACADE

Visualizers should consume a shared trace/event contract.

Do not hard-code algorithm logic separately inside every component.

---

# 4. TRACE EVENT CONTRACT

Possible events:

- compare;
- read;
- write;
- swap;
- enqueue;
- dequeue;
- push;
- pop;
- visit;
- discover;
- relax;
- union;
- find;
- recurse;
- return;
- mark;
- update-state.

Exact set follows implementation needs.

---

# 5. TRACE SEMANTICS

Trace event must map to canonical algorithm state.

UI animation is a projection.

---

# 6. TRACE DETERMINISM

Given same:

- algorithm variant;
- input;
- tie/order convention;
- seed;

trace should be reproducible where algorithm is deterministic.

---

# 7. NONDETERMINISTIC TRACE

If multiple valid choices:

record seed/tie-breaking.

---

# 8. TRACE SIZE

Large inputs can produce huge traces.

Use:

- sampling;
- checkpoints;
- summarized events;
- input caps

without corrupting pedagogical meaning.

---

# 9. TRACE CANCELLATION

Learner can stop long run safely.

---

# 10. TRACE STALE RESPONSE

If learner changes input/algorithm mid-run:

old trace result must not overwrite new state.

---

# 11. ARRAY VISUALIZER

Show:

- indices;
- values;
- active region;
- comparisons/swaps;
- boundaries.

Do not use color alone.

---

# 12. LINKED STRUCTURE VISUALIZER

Show identity/references explicitly.

Do not imply contiguous memory.

---

# 13. STACK / QUEUE VISUALIZER

Respect operation semantics.

Queue must not become arbitrary list editing.

---

# 14. TREE VISUALIZER

Preserve:

- parent/child;
- ordering invariant when applicable;
- node identity;
- traversals.

---

# 15. BST VISUALIZER

Duplicates policy explicit.

---

# 16. HEAP VISUALIZER

Heap is not a sorted tree.

Visualization must not imply global ordering.

---

# 17. HASH VISUALIZER

Show:

- hash/bucket/probe;
- collision;
- resize;
- load factor.

Avoid presenting hash order as meaningful sorted order.

---

# 18. GRAPH VISUALIZER

Show:

- directed arrows;
- weights;
- selected start/target;
- visited/frontier states.

---

# 19. GRAPH LAYOUT

Visual spatial position is not graph weight/distance unless explicitly encoded.

---

# 20. GRAPH ACCESSIBILITY

Provide structured node/edge list and textual step alternative.

Canvas alone is insufficient.

---

# 21. BFS VISUALIZATION

Queue/frontier/layers should align with canonical state.

---

# 22. DFS VISUALIZATION

Stack/recursion and discovery state should align.

---

# 23. SHORTEST-PATH VISUALIZATION

Distinguish:

- tentative distance;
- finalized state;
- predecessor.

Do not visualize Dijkstra on invalid negative-edge example as if valid.

---

# 24. MST VISUALIZATION

Show candidate/selected edges without conflating shortest path.

---

# 25. UNION-FIND VISUALIZATION

Path compression can alter representation while preserving sets.

Teach distinction.

---

# 26. DP VISUALIZER

Show meaning of each state/cell.

A colored table without state definition is not learning.

---

# 27. RECURSION TREE

Useful for:

- call structure;
- recurrence intuition.

Do not imply physical simultaneous execution.

---

# 28. BENCHMARK PROVIDER

Purpose:

illustrate empirical behavior.

Inputs:

- implementation;
- generated data;
- size series;
- repetitions;
- seed/environment metadata.

---

# 29. BENCHMARK RESULT

Report:

- environment;
- input distribution;
- size;
- timing summary.

Never automatically turn timing into canonical Big-O.

---

# 30. MICROBENCHMARK WARNING

Tiny inputs/runtime warmup can mislead.

---

# 31. RANDOM INPUT GENERATOR

Generate controlled distributions:

- random;
- sorted;
- reverse;
- duplicates;
- adversarial where meaningful.

---

# 32. GRAPH GENERATOR

Can generate:

- connected/disconnected;
- directed;
- weighted;
- DAG;
- cyclic.

Task declares required constraints.

---

# 33. PROPERTY CHECKER

Useful runtime capabilities:

- sortedness;
- permutation;
- heap property;
- path validity;
- topological validity;
- MST validity where feasible.

---

# 34. REFERENCE IMPLEMENTATION RUNNER

Reference implementation is for verification/demo.

It is not learner-visible answer in protected assessment.

---

# 35. EXECUTION LANGUAGE

Python may be primary implementation language.

Execution sandbox/provider should reuse Python capability where possible.

Do not create a second Python interpreter stack.

---

# 36. PYTHON PROVIDER INTEGRATION

ALG requests:

- code execution;
- tests;
- traces/hooks

through shared Python runtime capability where architecture supports.

---

# 37. LANGUAGE-NEUTRAL TRACE

Canonical trace should be separable from Python-specific AST/runtime when possible.

---

# 38. TIMEOUT

Protect long/infinite algorithms.

---

# 39. MEMORY LIMIT

Protect accidental/exponential blowups.

---

# 40. OUTPUT LIMIT

Protect console/trace flood.

---

# 41. INPUT LIMIT

Visualizations should cap input size to remain comprehensible.

---

# 42. MULTI-TAB

Parallel visualizers must not share unintended state.

---

# 43. OFFLINE

Deterministic traces/visualization/reference data should work offline where packs/runtime permit.

---

# 44. CACHE

Cache canonical static content and safe precomputed traces carefully.

Do not cache learner state incorrectly.

---

# 45. AI TUTOR MODES

Possible:

`CONCEPT_EXPLAINER`

`TRACE_COACH`

`INVARIANT_COACH`

`COMPLEXITY_COACH`

`DATA_STRUCTURE_COACH`

`DEBUGGING_COACH`

`COUNTEREXAMPLE_COACH`

`PROBLEM_STRATEGY_COACH`.

---

# 46. AI CONTEXT

Ground with:

- canonical concept;
- algorithm/variant;
- current task;
- learner attempt;
- allowed hints;
- relevant prerequisite.

---

# 47. AI CORRECTNESS BOUNDARY

AI must not create authoritative algorithm facts from memory when canonical source exists.

Retrieve canonical data.

---

# 48. AI COMPLEXITY BOUNDARY

AI cannot silently claim complexity without:

- size variable;
- case;
- representation/assumption;
- algorithm variant.

---

# 49. AI COUNTEREXAMPLE

AI may suggest a candidate counterexample.

If used as canonical feedback, verify deterministically or against canonical logic.

---

# 50. AI TRACE

AI should not invent trace if deterministic engine can produce it.

Prefer trace engine.

---

# 51. AI HINT LADDER

Respect ALG03 hint policy.

---

# 52. AI SOLUTION REVEAL

Blocked in protected assessment until allowed.

---

# 53. AI ALTERNATIVE SOLUTION

May compare approaches after learner attempt.

Must distinguish:

- correctness;
- complexity;
- readability;
- memory.

---

# 54. AI DEBUGGING

Ask learner to reason before replacing code.

---

# 55. AI DATA-STRUCTURE SELECTION

Coach trade-offs.

Avoid one universal “best”.

---

# 56. AI ASSESSMENT BOUNDARY

AI is advisory unless explicit deterministic/rubric verification exists.

Cannot write official mastery.

---

# 57. AI HIDDEN TEST SECURITY

Do not expose hidden cases/solutions.

---

# 58. AI PROMPT INJECTION

Learner content/source code cannot override system permissions.

---

# 59. AI PROVIDER FAILURE

Fallback to:

- canonical explanation;
- deterministic trace;
- static hints.

Core subject remains usable.

---

# 60. OBSERVABILITY

Track:

- trace failures;
- visualizer errors;
- provider latency;
- timeout;
- AI failure;
- stale response.

No private learner payload logging by default.

---

# 61. REQUIRED DELIVERABLES

Create:

`subjects/algorithms/docs/alg04/ALG_TRACE_EVENT_CONTRACT.json`

`ALG_VISUALIZATION_PROVIDER_CONTRACT.md`

`ALG_GRAPH_VISUALIZATION_CONTRACT.md`

`ALG_DP_VISUALIZATION_CONTRACT.md`

`ALG_INPUT_GENERATOR_CONTRACT.md`

`ALG_BENCHMARK_PROVIDER_CONTRACT.md`

`ALG_PROPERTY_CHECKER_CONTRACT.md`

`ALG_AI_TUTOR_CONTRACT.md`

`ALG_RUNTIME_INTEGRATION_MAP.md`

`ALG05_INPUT_CONTRACT.md`.

---

# 62. GOLDEN FIXTURES

At minimum:

- stable sort equal keys;
- binary-search boundaries;
- BFS disconnected graph;
- DFS cycle;
- Dijkstra negative-edge rejection;
- topological multiple-valid-order;
- heap not globally sorted;
- hash collisions;
- DP state update;
- stale trace cancellation.

---

# 63. PASS CONDITIONS

PASS when:

- one trace/state facade exists;
- visualizers consume canonical state;
- Python runtime is reused rather than duplicated;
- benchmark is separated from asymptotic truth;
- graph/tree/hash visual semantics are correct;
- accessibility alternatives exist;
- AI is bounded/grounded;
- offline/failure behavior is defined.

---

# 64. FAIL CONDITIONS

FAIL if:

- visualizer embeds divergent algorithm truth;
- benchmark declares Big-O automatically;
- graph layout is treated as path weight;
- AI becomes official grader/mastery writer;
- subject creates a second unrestricted code runtime;
- trace events are not reproducible enough to test.

---

# 65. FINAL PRINCIPLE

**VISUALIZE THE CANONICAL STATE.**
**DO NOT LET THE ANIMATION BECOME THE ALGORITHM.**