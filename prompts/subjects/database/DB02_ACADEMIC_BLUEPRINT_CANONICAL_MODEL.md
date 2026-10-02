# DB02 — ACADEMIC BLUEPRINT & CANONICAL DATABASE MODEL
## Relational model · Schema · Keys · Constraints · Normalization · Transactions · Index/query concepts

Mode:

`SEMANTICS-FIRST · CANONICAL-OWNER · ENGINE-AWARE · CONTENT-AS-DATA`

---

# 0. ENTRY

Requires DB01 evidence.

---

# 1. MISSION

Define one canonical Database/SQL academic model that all lessons, graders, visualizers, AI and authoring consume.

---

# 2. OUTCOME FAMILIES

Learner should progressively demonstrate:

- conceptual modeling;
- relational modeling;
- schema design;
- key/constraint reasoning;
- relational algebra;
- SQL query construction;
- query semantics;
- data integrity;
- normalization;
- transaction reasoning;
- index selection;
- query-plan interpretation;
- database trade-offs;
- implementation transfer.

---

# 3. CANONICAL ENTITIES

At minimum:

`DatabaseConcept`

`RelationSchema`

`Attribute`

`Domain`

`TupleFixture`

`Key`

`Constraint`

`FunctionalDependency`

`NormalizationProblem`

`RelationalAlgebraExpression`

`SQLTask`

`SQLQueryCandidate`

`ExpectedSemantics`

`TransactionScenario`

`IsolationPhenomenon`

`IndexConcept`

`QueryPlanConcept`

`DatabaseEngineProfile`

`Misconception`

`Remediation`.

---

# 4. RELATION VS TABLE

Canonical model distinguishes mathematical relation from practical SQL table/bag semantics.

---

# 5. ATTRIBUTE / DOMAIN

Attributes have names and domains/types.

Engine-specific SQL types are implementation details where necessary.

---

# 6. KEYS

Represent:

- superkey;
- candidate key;
- primary key;
- alternate key;
- foreign key.

Do not define primary key merely as “ID column”.

---

# 7. COMPOSITE KEYS

First-class support.

---

# 8. NULLABILITY

Nullable semantics explicit.

---

# 9. CONSTRAINT MODEL

Support:

- NOT NULL;
- UNIQUE;
- PRIMARY KEY;
- FOREIGN KEY;
- CHECK;
- engine-specific constraints where taught.

---

# 10. REFERENTIAL ACTIONS

Represent:

- restrict/no action;
- cascade;
- set null/default where supported.

---

# 11. FUNCTIONAL DEPENDENCY

Canonical:

`X -> Y`

with attribute sets and schema context.

---

# 12. CLOSURE

If normalization depth requires, represent attribute closure.

---

# 13. CANDIDATE KEY DERIVATION

Can be assessed from FD set.

---

# 14. NORMAL FORMS

Represent 1NF/2NF/3NF/BCNF according actual scope.

Do not oversimplify.

---

# 15. LOSSLESS JOIN

If decomposition is taught, represent/test.

---

# 16. DEPENDENCY PRESERVATION

Separate from losslessness.

---

# 17. ANOMALIES

Represent:

- update;
- insertion;
- deletion

as consequences of design.

---

# 18. RELATIONAL ALGEBRA

Entities/operators may include:

- selection;
- projection;
- rename;
- product;
- joins;
- union;
- difference;
- intersection if scope;
- grouping/aggregation extensions if taught.

---

# 19. BAG VS SET

SQL duplicates differ from pure relational algebra.

Explicit.

---

# 20. SQL QUERY MODEL

Canonical SQL task should define semantics independent from one textual query.

---

# 21. QUERY CONTRACT

A task may specify:

- source schema;
- data constraints;
- required columns;
- row inclusion semantics;
- duplicate policy;
- ordering;
- NULL behavior;
- performance constraint if any;
- forbidden/required constructs only when pedagogically justified.

---

# 22. ORDER

Results are unordered unless task requires ORDER BY.

Grader should not impose accidental engine order.

---

# 23. NULL

NULL is unknown/missing marker, not ordinary value.

---

# 24. THREE-VALUED LOGIC

Represent TRUE/FALSE/UNKNOWN where needed.

---

# 25. COMPARISON WITH NULL

Teach/assess `IS NULL` semantics rather than `= NULL`.

---

# 26. COUNT SEMANTICS

`COUNT(*)`

vs

`COUNT(expr)`.

---

# 27. DISTINCT

Explicit duplicate-elimination semantics.

---

# 28. JOIN MODEL

Represent:

- inner;
- outer variants as supported;
- cross;
- self;
- semi/anti concept if taught.

---

# 29. JOIN CARDINALITY

Examples/assessment must handle many-to-many duplication.

---

# 30. AGGREGATION

Represent grouping keys, aggregate semantics, HAVING.

---

# 31. SUBQUERY

Represent:

- scalar;
- IN/EXISTS;
- correlated;
- derived table.

According to scope.

---

# 32. CTE

Semantic convenience / recursion if in scope.

---

# 33. VIEW

Logical stored query semantics.

Do not conflate with materialized view.

---

# 34. DML

INSERT/UPDATE/DELETE semantic contracts where in scope.

---

# 35. DDL

CREATE/ALTER/DROP isolated from canonical application DB.

---

# 36. TRANSACTION

Canonical entity contains:

- sequence of operations;
- read/write sets;
- commit/abort;
- isolation context.

---

# 37. ACID

Represent each property without slogans only.

---

# 38. ISOLATION PHENOMENA

Possible:

- dirty read;
- non-repeatable read;
- phantom;
- lost update;
- write skew

according to scope/engine model.

---

# 39. ISOLATION LEVEL

Do not assume every DB engine implements textbook levels identically.

Engine profile captures behavior.

---

# 40. SERIALIZABILITY

Conceptual gold standard if in scope.

---

# 41. LOCKING

Represent generic lock concepts only to required depth.

OS owns generic concurrency primitives.

---

# 42. MVCC

If taught, represent version visibility concept.

Engine-specific behavior attached to engine profile.

---

# 43. INDEX MODEL

Separate:

- logical purpose;
- key columns;
- ordering;
- selectivity;
- storage structure;
- engine-specific implementation.

---

# 44. COMPOSITE INDEX

Column order matters.

---

# 45. COVERING INDEX

Engine/context dependent.

---

# 46. B-TREE

Algorithms owns generic tree mechanics.

DB owns database-index use/storage/query implications.

---

# 47. HASH INDEX

Same boundary.

---

# 48. QUERY PLAN

Plan entity can contain:

- operators;
- access paths;
- join strategy;
- estimated rows;
- cost;
- actual rows/time if analyze.

---

# 49. ESTIMATE ≠ ACTUAL

Explicit.

---

# 50. COST UNIT

Planner cost is engine-specific, not universal time.

---

# 51. STATISTICS

Planner decisions may depend on statistics.

---

# 52. INDEX USE

No guarantee.

Predicate/selectivity/order/statistics matter.

---

# 53. STORAGE / PAGE

Represent if actual curriculum scope requires.

---

# 54. LOGGING / WAL

Represent if scope requires.

---

# 55. BACKUP / RECOVERY

Conceptual model if in scope; operational release DB backup remains platform/infrastructure concern.

---

# 56. ER MODEL

If used:

- entity;
- attribute;
- relationship;
- cardinality;
- participation/optionality.

Map to relational schema explicitly.

---

# 57. STABLE IDs

Use stable semantic IDs, not lesson-title-derived identity.

---

# 58. ENGINE PROFILE

Store version-sensitive semantics for:

- SQL dialect;
- types;
- isolation;
- plan format;
- index support;
- EXPLAIN behavior.

---

# 59. DIALECT BOUNDARY

Canonical relational/SQL concepts may be cross-engine.

Dialect syntax belongs engine profile/content variant.

---

# 60. PROVENANCE

Track authoritative/curated/generated status especially for engine/version-specific claims.

---

# 61. PYTHON/ORM BOUNDARY

ORM mappings may reference DB canonical schema.

ORM behavior is not canonical SQL truth.

---

# 62. ALGORITHMS BOUNDARY

Generic complexity/data structures referenced, not duplicated.

---

# 63. DELIVERABLES

Create:

`subjects/database/docs/db02/DB_ACADEMIC_BLUEPRINT.md`

`DB_COMPETENCY_GRAPH.json`

`DB_PREREQUISITE_GRAPH.json`

`DB_CANONICAL_ENTITY_SCHEMA.json`

`DB_RELATIONAL_MODEL_CONTRACT.md`

`DB_SQL_SEMANTICS_CONTRACT.md`

`DB_NORMALIZATION_CONTRACT.md`

`DB_TRANSACTION_ISOLATION_CONTRACT.md`

`DB_INDEX_QUERY_PLAN_CONTRACT.md`

`DB_ENGINE_PROFILE_SCHEMA.json`

`DB03_INPUT_CONTRACT.md`.

---

# 64. PASS

PASS when:

- canonical relational model exists;
- keys/constraints/FDs are explicit;
- SQL semantics represent NULL/duplicates/order;
- normalization concepts are rigorous enough;
- transaction/isolation model is engine-aware;
- index/plan claims are contextual;
- stable IDs/provenance exist;
- DB03 can grade semantics rather than strings.

---

# 65. FAIL

FAIL if:

- table equals spreadsheet;
- primary key equals auto-increment ID;
- SQL result order assumed without ORDER BY;
- NULL modeled as ordinary value;
- normalization reduced to visual splitting;
- planner cost interpreted as milliseconds universally.

---

# 66. FINAL PRINCIPLE

**THE CANONICAL MODEL MUST DESCRIBE WHAT THE DATABASE QUERY MEANS, NOT JUST WHAT ONE SQL STRING LOOKS LIKE.**
