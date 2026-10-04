# ALG03 CORRECTNESS ASSESSMENT CONTRACT

A successful sample is observation, not proof. Correctness evidence is evaluated against ALG02 canonical contracts.

A task may require precondition recognition, postcondition, invariant, initialization, maintenance, progress/termination, consequence at termination and/or a minimal counterexample. Rigor scales by learner stage; precise natural-language reasoning can satisfy a proof sketch when formal notation is not required.

Required traps:
- Binary search: reject unsorted use unless an equivalent monotone predicate/invariant is explicitly declared; test empty/singleton/first/last/missing boundaries.
- Sorting: require sortedness plus permutation/multiset preservation; stability is separate when required.
- BST: operation cost is O(h), not automatically O(log n).
- BFS: shortest path by edge count requires unweighted/equal-cost semantics.
- DFS/BFS: disconnected/cyclic graphs and visited policy must match scope; traversal order may be non-unique.

When several outputs are valid, validate canonical properties instead of one arbitrary reference order. Counterexamples are high-value evidence, including unsorted binary search, degenerate BST, hash collisions, weighted graph against generalized BFS shortest-path claims and sorting that drops duplicates.

Algorithmic termination/space belongs ALG evidence. Python recursion/process limits are runtime evidence and must be labeled separately.
