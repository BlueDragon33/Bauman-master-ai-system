# DB SQL Semantics Contract

## Semantic task model

A `SQLTask` is defined by expected meaning, not one answer string.

Its contract may include:

- source schemas;
- data constraints;
- required output columns;
- row inclusion semantics;
- duplicate policy;
- ordering policy;
- NULL behavior;
- pedagogically justified required/forbidden constructs;
- optional engine profile.

## Ordering

Default: **unordered**.

Only explicit `ORDER BY` or a task ordering contract makes order grade-relevant.

Incidental engine order is never canonical evidence.

## Duplicates

SQL may preserve duplicates.

`DISTINCT` is explicit duplicate elimination.

Relational-algebra set semantics and SQL bag semantics must not be silently conflated.

## NULL / three-valued logic

NULL is not zero, empty string, false or an ordinary comparable value.

Predicates may evaluate TRUE/FALSE/UNKNOWN.

NULL-aware checks such as `IS NULL` are distinct from ordinary equality.

## COUNT

- `COUNT(*)` counts rows.
- `COUNT(expr)` ignores NULL values of the expression.

They are not universally equivalent.

## Joins

Join semantics include predicate and cardinality implications.

Many-to-many joins may multiply rows.

Outer joins preserve unmatched rows according join-side semantics.

## Aggregation

WHERE filters rows before grouping.
GROUP BY defines groups.
HAVING filters groups.

## Subqueries / CTEs / views

Syntax choice does not itself imply performance.

A CTE is not universally faster than a subquery.
A logical view is not automatically materialized.

## Semantic equivalence

Two SQL queries are accepted as equivalent only when behavior matches the task contract over discriminating fixtures/constraints, not because one sample dataset happened to produce the same rows.
