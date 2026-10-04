# ALG02 ACADEMIC BLUEPRINT
## Algorithms & Data Structures canonical model for Bauman 09.04.01/11

Status: **VALIDATING**  
Runtime mutation: **NO**  
Production migration: **NO**

## 1. Academic role

The repository baseline proves Algorithms/Data Structures is currently a prerequisite/integration foundation rather than a standalone learner runtime. Its immediate purpose is to support object-oriented ASOIU design, database/ML-data work, post-relational systems, Mivar logical AI and Big Data bridges without turning the preparation route into competitive programming.

The canonical model is language-neutral. Python may implement examples later, but Python syntax/runtime semantics are not Algorithms truth.

## 2. Canonical learning progression

The accepted progression is:

**Foundation**
- model input/output/constraints and size;
- write unambiguous pseudocode;
- reason about O/Ω/Θ, time and space;
- state preconditions, invariants, termination and correctness.

**Core**
- separate ADT from representation;
- reason about arrays, linked lists, stacks and queues;
- trace recursion/call stack;
- search and sort under explicit correctness/complexity contracts.

**Structures**
- hashing, collisions, load factor and expected-vs-worst behavior;
- trees/BSTs, height, ordering and traversal.

**Graphs**
- directed/undirected and weighted/unweighted semantics;
- adjacency list/matrix representation;
- BFS/DFS traversal and O(V+E) under declared representation;
- BFS shortest-path-by-edge-count only under unweighted/equal-cost assumptions.

**Transfer**
- design edge cases and property evidence;
- choose algorithms/data structures by workload;
- explain trade-offs and hand off domain-specific semantics to Database/AI/Big Data owners.

## 3. Competency owner

Machine-readable competency truth is `ALG_COMPETENCY_GRAPH.json`. It defines 15 stable `alg.comp.*` families and the prerequisite DAG in `ALG_PREREQUISITE_GRAPH.json`.

A route completion, slider interaction or legacy MCQ score is not mastery. Performance evidence must demonstrate algorithmic reasoning, trace, correctness, complexity or verified implementation behavior. C4 remains the mastery-state authority.

## 4. Canonical entity model

`ALG_CANONICAL_ENTITY_SCHEMA.json` defines stable identities for:

- AlgorithmConcept
- Algorithm / AlgorithmVariant
- AbstractDataType / DataStructure
- Operation
- Invariant / Precondition / Postcondition
- ComplexityClaim
- ProblemPattern / Strategy
- Trace
- Counterexample
- ImplementationExample
- AssessmentTask
- Misconception / Remediation

Algorithm identity does not encode implementation language. A Python implementation references a canonical `alg.algorithm.*` ID.

## 5. Required algorithm scope

ALG02 canonicalizes only algorithms evidenced by ALG01/P4:

- binary search;
- insertion sort;
- selection sort;
- bubble sort;
- merge sort;
- quicksort;
- preorder/inorder/postorder tree traversal as variants of depth-first tree traversal;
- BFS;
- DFS.

The active baseline does not justify promoting Dijkstra, topological sort, MST, union-find, heap/priority queue, greedy, dynamic programming or backtracking into the default required route. These remain **DEFERRED_JIT** until a downstream course/project provides evidence.

## 6. Required data-structure scope

Canonical ADTs and representations distinguish:

- Sequence ADT → array / linked-list representations;
- Stack ADT → LIFO semantics independent of implementation;
- Queue ADT → FIFO semantics independent of implementation;
- Map ADT → hash-table representations with explicit collision policy;
- Rooted-tree / ordered-symbol-table abstractions → binary tree / unbalanced BST;
- Graph ADT → adjacency-list / adjacency-matrix representations.

A structure's operation cost is never asserted without the representation and assumptions.

## 7. Correctness model

Correctness is not “the sample worked”.

Canonical algorithms must be able to reference:
- explicit preconditions;
- postconditions;
- invariants;
- termination argument or finite-progress measure;
- counterexamples for overgeneralized claims;
- declared ordering/tie policy where outputs can vary.

Examples:
- binary search requires sorted order;
- BST lookup cost depends on tree height;
- BFS shortest path applies to unweighted/equal-cost edges;
- traversal order may vary when adjacency/child order is unspecified.

## 8. Complexity model

A canonical `ComplexityClaim` binds:
- owner algorithm/operation;
- input-size measure;
- time/space dimension;
- case type;
- notation and bound;
- assumptions;
- provenance.

Therefore naked strings such as `O(n)` or `O(n log n)` are not sufficient canonical truth.

Benchmarks are illustrative only and can never own asymptotic truth.

## 9. Compatibility projection

Existing learner IDs remain:
- PR02 — compatibility projection to problem/complexity/selection competencies;
- PR10 — compatibility projection to pseudocode/state reasoning;
- PR11 — compatibility projection to ADT/linear/hash/graph representation.

The P4 nodes remain a prerequisite projection. No existing Programming lesson, P4 node, localStorage state or production route is deleted/renumbered in ALG02.

## 10. Adjacent ownership

**Math** owns generic logic, induction/proof foundations and recurrence-solving mathematics.  
**Python** owns language/runtime semantics and the isolated CPython capability.  
**Database** owns storage engines, database indexes, query planning and transactions.  
**AI/ML** owns model-specific algorithms.  
**C4** owns generic mastery aggregation/state.

ALG owns algorithm-specific representation, strategy, invariants, correctness, complexity and data-structure semantics.

## 11. Pass boundary

ALG02 passes when:
- 15 competency IDs and their DAG are coherent;
- ADT and representation are separated;
- canonical algorithms carry precondition/invariant/complexity/trace references;
- complexity claims include size/case/assumptions;
- graph/search/sort semantics are not conflated;
- legacy compatibility is preserved;
- optional non-baseline topics remain JIT rather than silently required;
- ALG03 receives an explicit assessment input contract.
