# ALG02 — ACADEMIC BLUEPRINT & CANONICAL ALGORITHMIC MODEL
## Curriculum · Competencies · Prerequisites · ADTs · Algorithms · Complexity · Provenance

Mode:

`EVIDENCE-BASED · ABSTRACTION-FIRST · CANONICAL-OWNER-AWARE · NO-CODE-STRING-TRUTH`

---

# 0. ENTRY GATE

Requires ALG01 evidence.

Do not design from a generic CS syllabus if repository/project goals say otherwise.

---

# 1. MISSION

Create the canonical academic model for Algorithms & Data Structures.

The system must represent algorithmic ideas independently from any one programming language.

---

# 2. OUTCOME MODEL

The learner should progressively demonstrate ability to:

- model a problem;
- choose representation;
- identify constraints;
- select a strategy;
- trace state;
- reason about correctness;
- analyze complexity;
- choose data structure;
- implement;
- test edge cases;
- compare alternatives;
- transfer to unfamiliar problems.

---

# 3. COMPETENCY FAMILIES

Canonical families may include:

`REPRESENTATION`

`ADT_OPERATION`

`TRACE_REASONING`

`CORRECTNESS`

`COMPLEXITY`

`ALGORITHM_SELECTION`

`DATA_STRUCTURE_SELECTION`

`IMPLEMENTATION`

`TESTING`

`OPTIMIZATION_TRADEOFF`

`TRANSFER`.

Use actual project goals to refine.

---

# 4. STAGE MODEL

Possible progression:

### Foundation
- computational thinking;
- sequence/state;
- simple complexity intuition.

### Core
- arrays/lists;
- stacks/queues;
- search/sort;
- recursion.

### Intermediate
- hashing;
- trees/heaps;
- graph fundamentals.

### Advanced
- greedy;
- dynamic programming;
- backtracking;
- graph algorithms;
- amortized/trade-off analysis.

This is a template; ALG01 evidence decides actual roadmap.

---

# 5. PREREQUISITE GRAPH

Represent prerequisite edges explicitly.

Examples:

binary search

requires:

- sorted order;
- interval reasoning;
- loop invariants.

Dijkstra

requires:

- weighted graph;
- priority queue;
- nonnegative-edge precondition.

DP

requires:

- subproblem/state decomposition;
- recurrence;
- dependency ordering.

---

# 6. CANONICAL ENTITY MODEL

At minimum:

`AlgorithmConcept`

`Algorithm`

`AlgorithmVariant`

`AbstractDataType`

`DataStructure`

`Operation`

`Invariant`

`Precondition`

`Postcondition`

`ComplexityClaim`

`ProblemPattern`

`Strategy`

`Trace`

`Counterexample`

`ImplementationExample`

`AssessmentTask`

`Misconception`

`Remediation`.

---

# 7. ONE FACT · ONE OWNER

Examples:

- BFS canonical semantics owned by Algorithm entity.
- Queue semantics owned by ADT/DataStructure entity.
- A lesson references them.
- Visualization consumes them.
- Assessment references them.
- AI retrieves them.

Do not copy divergent BFS explanations into five files.

---

# 8. ALGORITHM IDENTITY

Stable ID independent of display title and implementation language.

Example conceptually:

`alg.graph.bfs`

not:

`bfs-python-v2`.

---

# 9. VARIANT IDENTITY

Variants can differ meaningfully:

- iterative/recursive DFS;
- Lomuto/Hoare partition;
- top-down/bottom-up merge sort;
- chaining/open-addressing hash table.

Represent explicit relationship.

---

# 10. ADT ≠ DATA STRUCTURE

Example:

Queue ADT defines behavior.

Array queue and linked queue are implementations.

Do not equate interface with representation.

---

# 11. OPERATION CONTRACT

Each operation may define:

- name;
- inputs;
- output;
- mutation;
- preconditions;
- postconditions;
- structural invariant;
- expected complexity dimensions.

---

# 12. STATE MODEL

Algorithms should expose conceptual state sufficient for:

- traces;
- visualizers;
- assessment;
- debugging.

Do not make UI DOM the state model.

---

# 13. PRECONDITION

Examples:

- binary search requires sorted structure/order relation;
- Dijkstra requires no negative edges;
- topological sorting requires directed acyclic graph for full ordering.

Preconditions are canonical data.

---

# 14. POSTCONDITION

Define what correctness means.

Not merely “function returned”.

---

# 15. INVARIANT

Represent algorithm/data-structure invariants explicitly.

Examples:

- heap order;
- BST ordering;
- loop prefix processed;
- visited-set semantics;
- DP table meaning.

---

# 16. TERMINATION

Where educationally relevant, canonical explanation should state why algorithm terminates.

---

# 17. CORRECTNESS CLAIM

A correctness explanation may use:

- invariant;
- induction;
- exchange argument;
- cut property;
- contradiction;
- structural argument.

Math supplies generic proof foundations.

ALG owns the algorithm-specific claim.

---

# 18. COMPLEXITY CLAIM MODEL

Each claim should specify:

- operation/algorithm;
- input-size measure;
- time/space;
- case type;
- model/assumptions;
- asymptotic notation;
- variant;
- evidence/provenance.

Avoid naked `O(n)` without meaning.

---

# 19. INPUT SIZE

Explicitly define `n`, `V`, `E`, capacity, load factor or other size measure.

---

# 20. BIG-O / OMEGA / THETA

Do not teach them as synonyms.

---

# 21. BEST / AVERAGE / WORST

Each is separate evidence.

Average case requires assumptions/distribution.

---

# 22. AMORTIZED COMPLEXITY

Keep separate from average case.

Dynamic array append is a key example if in scope.

---

# 23. SPACE COMPLEXITY

Distinguish:

- input storage;
- auxiliary space;
- recursion stack;
- output storage.

---

# 24. EMPIRICAL PERFORMANCE

Benchmark is illustrative evidence.

It cannot own asymptotic truth.

---

# 25. RECURRENCE MODEL

Where in scope:

represent recurrence, base case and asymptotic solution.

Math may supply recurrence-solving techniques.

---

# 26. SEARCH MODEL

Canonical concepts:

- search space;
- ordering assumption;
- comparison;
- success/failure;
- index/result semantics.

---

# 27. SORT MODEL

Capture attributes:

- stable;
- in-place;
- comparison-based;
- adaptive;
- worst/average/best complexity;
- auxiliary space.

---

# 28. STABILITY

Stability is semantic.

A visual animation must not hide equal-key identity.

---

# 29. HASHING MODEL

Represent:

- key;
- hash;
- bucket/probe;
- collision;
- load factor;
- resize;
- equality relation.

Expected complexity assumptions explicit.

---

# 30. TREE MODEL

Separate:

- rooted tree;
- binary tree;
- BST;
- balanced variants;
- heap;
- trie if in scope.

Do not conflate.

---

# 31. GRAPH MODEL

Canonical dimensions:

- directed/undirected;
- weighted/unweighted;
- simple/multigraph if needed;
- vertices;
- edges;
- representation;
- connectedness;
- cycles.

---

# 32. GRAPH REPRESENTATION

Adjacency list/matrix are representations.

They affect complexity.

---

# 33. BFS MODEL

Own:

- frontier/queue;
- visited;
- layer/distance semantics for unweighted graph;
- complexity under representation.

---

# 34. DFS MODEL

Own:

- recursion/stack;
- discovery/finish concepts if in scope;
- traversal forest;
- cycle/topological applications.

---

# 35. SHORTEST PATH MODEL

Separate algorithms by preconditions:

- BFS for unweighted/equal weight;
- Dijkstra nonnegative;
- Bellman-Ford if included;
- DAG shortest paths if included.

---

# 36. MST MODEL

Separate from shortest-path problem.

If in scope:

- Kruskal;
- Prim;
- cut property.

---

# 37. DISJOINT SET

If in scope:

- make-set;
- find;
- union;
- path compression;
- union by rank/size;
- amortized claim.

---

# 38. HEAP / PRIORITY QUEUE

ADT vs heap implementation explicit.

---

# 39. GREEDY MODEL

Represent:

- candidate choice;
- feasibility;
- objective;
- greedy-choice property;
- correctness argument;
- counterexample when assumptions fail.

---

# 40. DYNAMIC PROGRAMMING MODEL

Canonical fields:

- state definition;
- transition;
- base cases;
- dependency order;
- objective/value;
- reconstruction;
- complexity.

---

# 41. MEMOIZATION ≠ DP DEFINITION

Memoization is one implementation strategy.

---

# 42. BACKTRACKING MODEL

Represent:

- state;
- choices;
- feasibility;
- pruning;
- goal;
- search tree.

---

# 43. DIVIDE AND CONQUER

Represent:

- divide;
- solve subproblems;
- combine;
- recurrence.

---

# 44. PROBLEM PATTERN MODEL

Examples:

- two pointers;
- sliding window;
- prefix sums;
- binary-search-on-answer;
- interval;
- graph traversal;
- state-space search.

Only include based on scope.

---

# 45. COUNTEREXAMPLE CONTRACT

Every overgeneralizable rule should have counterexample where useful.

Examples:

- greedy does not always work;
- binary search not valid on arbitrary unsorted list;
- Dijkstra with negative edge can fail.

---

# 46. IMPLEMENTATION EXAMPLE

An implementation example must reference canonical algorithm/variant.

Language-specific source is not canonical truth.

---

# 47. PYTHON IMPLEMENTATION BOUNDARY

Python examples may demonstrate.

Python subject owns:

- syntax;
- references/mutation semantics;
- language/runtime details.

ALG owns:

- algorithm invariant;
- operation semantics;
- complexity.

---

# 48. PSEUDOCODE

Use language-neutral pseudocode where beneficial.

Define conventions.

Avoid pseudocode syntax ambiguity that changes semantics.

---

# 49. INDEXING CONVENTION

State whether ranges are:

- inclusive/exclusive;
- zero/one based

inside examples.

---

# 50. GRAPH LABEL CONVENTION

Distinguish vertex identity from display label.

---

# 51. MUTABILITY

For structures/algorithms, specify in-place/mutating behavior.

---

# 52. DUPLICATES

Canonical handling must be explicit for:

- BST duplicates;
- sort stability;
- search results;
- sets/maps.

---

# 53. TIE-BREAKING

When multiple valid outputs exist:

task contract must define whether any valid output is accepted.

Examples:

- topological ordering;
- MST with equal weights;
- traversal order under unspecified adjacency order.

---

# 54. DETERMINISM

Canonical algorithm can permit nondeterministic-equivalent outputs.

Grader must know.

---

# 55. PROVENANCE

Claims should track source/review authority per global content governance.

Especially:

- complexity;
- preconditions;
- correctness;
- algorithm variants.

---

# 56. VERSION SENSITIVITY

Algorithms are generally stable, but implementation/library benchmark details may be version-sensitive.

Separate timeless algorithmic truth from library behavior.

---

# 57. LEARNING OBJECTIVE CONTRACT

Each objective maps:

concept/skill

→ task

→ evidence.

Avoid vague “understand sorting”.

---

# 58. PROJECT CONTRACT

Projects should integrate multiple competencies.

Examples:

- route planner;
- scheduler;
- search/index prototype;
- graph analyzer.

They should not become UI-development projects.

---

# 59. ADJACENT DATABASE BOUNDARY

B-tree/hash index as generic structure may appear.

Database owns:

- page/storage engine;
- query planner;
- transaction behavior;
- DB-specific index semantics.

---

# 60. ADJACENT OS BOUNDARY

Queues/heaps may be examples.

OS owns scheduling/process semantics.

---

# 61. ADJACENT AI BOUNDARY

Search/graphs/DP can be prerequisites.

AI owns model-specific algorithms.

---

# 62. REQUIRED DELIVERABLES

Create:

`subjects/algorithms/docs/alg02/ALG_ACADEMIC_BLUEPRINT.md`

`ALG_COMPETENCY_GRAPH.json`

`ALG_PREREQUISITE_GRAPH.json`

`ALG_CANONICAL_ENTITY_SCHEMA.json`

`ALG_ADT_OPERATION_CONTRACT.md`

`ALG_COMPLEXITY_CLAIM_CONTRACT.md`

`ALG_CORRECTNESS_INVARIANT_CONTRACT.md`

`ALG_ALGORITHM_REGISTRY.json`

`ALG_DATA_STRUCTURE_REGISTRY.json`

`ALG03_INPUT_CONTRACT.md`.

---

# 63. PASS CONDITIONS

PASS when:

- outcomes/competencies/prerequisites are explicit;
- canonical owner model exists;
- ADT vs representation is explicit;
- algorithm variants are representable;
- correctness/invariants are representable;
- complexity claims carry assumptions;
- graph/tree/hash/sort/search semantics are not conflated;
- adjacent-subject boundaries are explicit;
- stable IDs/provenance exist;
- ALG03 can build assessment on canonical truth.

---

# 64. FAIL CONDITIONS

FAIL if:

- code snippets are treated as canonical algorithm truth;
- Big-O is stored without size/case/assumption;
- ADT and representation are merged;
- correctness is defined as “passes examples”;
- multiple valid outputs cannot be represented;
- Python-specific behavior silently owns the subject.

---

# 65. FINAL PRINCIPLE

**DEFINE THE IDEA BEFORE GRADING THE IMPLEMENTATION.**

The canonical model must be rich enough that:

visualization,
assessment,
AI,
authoring,
runtime

all consume one algorithmic truth instead of reimplementing it.