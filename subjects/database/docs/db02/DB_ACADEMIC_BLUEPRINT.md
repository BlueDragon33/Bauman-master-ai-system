# DB Academic Blueprint

Canonicalization base SHA: `80865deb54f8fc94b9ac412719cd27bddb00b387`

Status: **DATABASE ACADEMIC FOUNDATION LOCKED**

## Canonical learning chain

`Concept → schema/model → constraints → relational reasoning → SQL semantics → normalization → transactions/isolation → indexes/plans → design trade-offs → transfer`

Lesson order may vary, but canonical meaning must not.

## Canonical domains

1. **Relational foundations** — relation, tuple, attribute, domain, schema vs instance, relation semantics vs practical SQL table/bag behavior.
2. **Keys and integrity** — superkey, candidate key, primary key, alternate key, foreign key; NOT NULL, UNIQUE, PK, FK, CHECK.
3. **Relational algebra** — selection, projection, rename, product, joins, union, difference; grouping/aggregation extensions where taught.
4. **SQL semantics** — query meaning independent from one answer string; duplicates, order, NULL, three-valued logic, COUNT, GROUP BY/HAVING, subqueries, CTEs and views.
5. **Normalization** — FDs, closure and candidate-key derivation where required, 1NF/2NF/3NF/BCNF, lossless join and dependency preservation.
6. **Transactions/isolation** — operation sequence, read/write sets, commit/abort, ACID, anomalies, locking/MVCC under explicit engine context.
7. **Indexes/query plans** — selectivity, composite indexes, statistics, cardinality estimates, planner cost, actual-vs-estimated evidence.
8. **Transfer** — logical design before physical optimization; workload before benchmark conclusion; provenance carried into recommendations.

## Stable ID policy

Semantic IDs are not title-derived.

Examples:

- `db.concept.relation`
- `db.comp.sql-semantics`
- `db.schema.experiment-run-metric`
- `db.task.join-cardinality-001`

Renaming a title does not change identity.

## Provenance states

- `canonical-curated`
- `repo-existing`
- `engine-specific`
- `generated-draft`

Generated drafts cannot become official grading truth without review.

## Reuse boundary

- Programming PR06/PR15 remain bridge learning experiences.
- P6 remains source evidence and diagnostic structure.
- DB02 becomes the canonical owner of Database academic semantics.
- Advanced Database remains a separate later-subject owner.
- control-service D1 remains application infrastructure only.

## Foundation lock

After DB02 PASS, later modules may extend capability but may not silently redefine:

- key/constraint semantics;
- NULL/three-valued logic;
- bag/order semantics;
- functional dependency and normalization semantics;
- transaction/isolation semantics;
- index/query-plan meaning;
- stable IDs.
