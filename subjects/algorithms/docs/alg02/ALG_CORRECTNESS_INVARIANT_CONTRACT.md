# ALG02 CORRECTNESS & INVARIANT CONTRACT

## Correctness evidence

A canonical correctness explanation states enough of:

- precondition;
- postcondition;
- invariant;
- initialization;
- maintenance/preservation;
- termination/progress;
- consequence at termination;
- counterexample when a precondition is violated.

The required rigor scales with learner stage, but “the sample output matched” is never sufficient proof.

## Canonical examples

### Binary search
Precondition: ordered input under a consistent total order.  
Invariant: if target exists, a valid target location remains inside the active interval.  
Progress: the interval strictly shrinks.  
Postcondition: returns a matching valid position or declared not-found value.

### Insertion sort
Invariant: before processing position i, prefix [0,i) is sorted and preserves the original prefix multiset.  
Postcondition: full output is ordered and is a permutation of input.

### BST
Invariant: left/right subtree keys obey the declared order/duplicate policy.  
Complexity is O(h), not automatically O(log n).

### BFS
Invariant: discovered vertices are enqueued at most once and queue layers are processed in nondecreasing discovered edge distance.  
Shortest-path postcondition applies only to unweighted/equal-cost edges.

### DFS
Invariant: visited vertices are not expanded as undiscovered again; active stack represents the depth-first frontier.  
Traversal ordering depends on declared adjacency order.

## Termination

Finite structures plus strictly shrinking intervals, consumed input, or visited-set progress must be explicit where educationally useful. Recursion must include a reachable base/progress condition.

## Multiple valid outputs

When ordering is unspecified, graders/visualizers cannot require one arbitrary trace/order. Task contracts either:
- declare deterministic tie/adjacency/child ordering; or
- accept all outputs satisfying the canonical postconditions.

## Counterexamples

Canonical material should use counterexamples for overgeneralized claims, including:
- binary search on unsorted data;
- degenerate BST against “always O(log n)”;
- colliding keys against “hash lookup guaranteed O(1)”;
- weighted graph against “BFS always gives shortest path”.
