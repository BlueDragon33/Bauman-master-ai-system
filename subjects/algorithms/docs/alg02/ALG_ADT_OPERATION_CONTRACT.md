# ALG02 ADT & OPERATION CONTRACT

## Rule 1 — ADT is behavioral, representation is structural

An ADT defines **what operations mean**. A data structure defines **how state is represented**.

Examples:
- `alg.adt.stack` = LIFO behavior.
- `alg.ds.stack-array` = one representation of that behavior.
- `alg.adt.queue` = FIFO behavior.
- `alg.ds.queue-ring-buffer` = one representation.
- `alg.adt.map` = key→value behavior.
- hash table chaining/open addressing are representations.

A learner must not conclude “stack = Python list” or “map = hash table” as universal identity.

## Rule 2 — Every operation contract states

- inputs;
- output;
- whether it mutates;
- preconditions;
- postconditions;
- representation-sensitive complexity when relevant.

Empty-state behavior must be task-declared; it is not silently assumed.

## Rule 3 — Representation-sensitive cost

Costs belong to a representation and workload.

Examples:
- array positional access: Θ(1) under direct indexing;
- linked-list access by index: Θ(n);
- linked-list insert after an already-known node: Θ(1), excluding search cost;
- hash lookup: expected O(1) only under declared hash/load assumptions; worst O(n);
- BST operations: O(h), and h may be n for an unbalanced tree;
- adjacency list storage: Θ(V+E);
- adjacency matrix storage: Θ(V²).

## Rule 4 — Mutation is explicit

In-place/mutating behavior is a semantic property. Operation records must say whether mutation occurs or whether the projection returns a new value.

## Rule 5 — Invariants are first-class

Representation validity must reference invariants:
- linked-list chain validity;
- hash key discoverability under collision policy;
- binary-tree parent/child acyclicity;
- BST ordering;
- graph representation equivalence.

## Rule 6 — Duplicate/key semantics are explicit

BST duplicate policy, map key equality, hash equality, graph parallel-edge policy and sort stability must be declared by a concrete task/projection. Canonical truth cannot rely on an unstated language container behavior.

## Rule 7 — Algorithms consume ADTs

BFS consumes Queue semantics. DFS consumes Stack/call-stack semantics. Their correctness cannot depend on one particular Python container implementation.
