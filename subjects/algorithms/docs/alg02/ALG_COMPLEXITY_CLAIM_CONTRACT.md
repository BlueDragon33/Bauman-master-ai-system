# ALG02 COMPLEXITY CLAIM CONTRACT

A complexity claim is canonical only when it includes all of:

1. canonical owner ID;
2. operation/algorithm;
3. input-size measure;
4. dimension: time / auxiliary space / total space / output space;
5. case: best / average / worst / amortized / expected / all cases;
6. notation and bound;
7. assumptions/model;
8. provenance.

## Forbidden shortcuts

- naked `O(n)`;
- “fast” / “slow” without a size model;
- benchmark time as proof of Big-O;
- average-case without distribution/pivot/hash assumptions;
- amortized treated as average;
- BFS complexity without graph representation;
- BST claimed O(log n) without a height/balance assumption;
- hash lookup claimed guaranteed O(1).

## Size measures

Common canonical measures:
- `n` — number of elements/search positions;
- `h` — tree height;
- `V`, `E` — graph vertices/edges;
- `m` — hash buckets/capacity;
- `alpha=n/m` — load factor.

The task must define which measure applies.

## Space

Separate:
- input storage;
- auxiliary working storage;
- recursion stack;
- output storage.

For example, top-down array merge sort uses Θ(n) auxiliary buffer in the canonical projection. Recursive tree traversal uses O(h) auxiliary stack excluding emitted output.

## Representation binding

Canonical graph-traversal claim `Theta(V+E)` is tied to adjacency-list access. An adjacency matrix changes neighbor scanning to Θ(V) per expanded vertex and can yield Θ(V²) traversal time.

## Benchmark policy

Benchmarks may support empirical comparison after the asymptotic claim is known. They must declare runtime, input generator, warmup/repetition and measurement method. They are never the canonical source of asymptotic truth.
