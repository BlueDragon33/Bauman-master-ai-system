# ALG03 INPUT CONTRACT

ALG02 entry status required: **PASS**

ALG03 receives the following canonical owners:

- `ALG_P2_CANONICAL_MODEL.json`
- `ALG_COMPETENCY_GRAPH.json`
- `ALG_PREREQUISITE_GRAPH.json`
- `ALG_CANONICAL_ENTITY_SCHEMA.json`
- `ALG_ALGORITHM_REGISTRY.json`
- `ALG_DATA_STRUCTURE_REGISTRY.json`
- `ALG_ADT_OPERATION_CONTRACT.md`
- `ALG_COMPLEXITY_CLAIM_CONTRACT.md`
- `ALG_CORRECTNESS_INVARIANT_CONTRACT.md`
- `ALG_LEGACY_COMPATIBILITY_MAP.json`

## Assessment truths ALG03 may assume

1. Canonical competency namespace is `alg.comp.*`.
2. Algorithm IDs are language-neutral; Python source is only implementation evidence.
3. ADT behavior and data-structure representation are distinct.
4. Complexity claims always bind input measure, dimension, case and assumptions.
5. Correctness is expressed through preconditions/postconditions/invariants/termination, not sample output alone.
6. Multiple valid traces/orders must be accepted unless tie/order policy is explicit.
7. Current core algorithm set is binary search, five named sorts, depth-first tree traversal variants, BFS and DFS.
8. Dijkstra/topological/MST/greedy/DP/backtracking/heap/union-find remain `DEFERRED_JIT`, not required default competencies.
9. Legacy Programming MCQs are compatibility review evidence only, not canonical Algorithms mastery.
10. C4 remains the official mastery/state authority.

## ALG03 must produce

- reasoning dimensions and rubrics;
- correctness/complexity assessment contracts;
- alternate-valid-solution policy;
- error taxonomy and remediation mapping;
- edge-case golden fixtures;
- correct/wrong solution libraries;
- grader/test-of-tests contract.

ALG03 may not mutate production runtime or create a second learner-state authority.
