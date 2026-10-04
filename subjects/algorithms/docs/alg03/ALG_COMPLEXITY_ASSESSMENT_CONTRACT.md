# ALG03 COMPLEXITY ASSESSMENT CONTRACT

A complete complexity response binds: input-size measure, representation/operation model, time-or-space dimension, case (best/average/worst/amortized/expected/all), normalized asymptotic bound, assumptions and appropriate reasoning. A naked `O(n log n)` is not full evidence.

Equivalent notation is normalized semantically, not raw-string matched. An upper-bound O answer is not automatically equivalent to a required tight Θ answer.

Never conflate worst/average, amortized/average, expected/guaranteed or best/all-cases. Quicksort may be average Θ(n log n) and worst Θ(n²); hash lookup may be expected O(1) and worst O(n).

Representation is part of the claim: adjacency-list BFS/DFS full traversal is Θ(V+E); adjacency-matrix neighbor scan is Θ(V), so full traversal can be Θ(V²). BST operations are O(h), with h possibly n. Linked-list insertion after an already-known node can be Θ(1), excluding search.

Separate time from space and auxiliary from input/output storage when requested. Benchmarks are supporting empirical evidence only, never asymptotic truth.

ALG03 does not claim exact static complexity inference for arbitrary source code. If the grader lacks sufficient validated evidence, it returns `UNRESOLVED`, not fabricated PASS.
