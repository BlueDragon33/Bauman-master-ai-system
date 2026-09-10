# Prerequisite Assurance · Pass 05 · P6 Database Fundamentals

Date: 2026-09-10
Branch: `temp/bauman-master-hub-prereq-2026`
Status: `P6_PACK_IMPLEMENTED_GATE_PENDING`

## Goal

Close the database-foundation gap before the official semester-1 course:

`d06 · Оптимизация баз данных систем машинного обучения`

without rebuilding SQL from zero and without detouring into vendor administration, cloud certifications, ORM frameworks, NoSQL or data warehousing too early.

The locked IU5 2026 curriculum remains the source of truth for the official course identity: d06 is 4 credits / 144 hours, semester 1, exam. P6 itself is a competency prerequisite inferred by Bauman Master Hub, not an administrative prerequisite declared by Bauman.

## Reuse first

The audit already verified usable Programming content:

- `PR06 · SQL căn bản và mô hình quan hệ`: relational basics, PK/FK, SELECT/WHERE.
- `PR15 · SQL nâng nền: JOIN, GROUP BY, index`: JOIN/GROUP BY/basic index creation.

Pass 05 therefore does not duplicate those lessons. Repair routes enter PR06/PR15 only when diagnostics show the corresponding foundation is weak.

## New P6 pack

Added:

`assets/data/prerequisite-packs/p06-database-fundamentals.json`

The active path has 11 nodes:

1. Relational model, keys and integrity constraints — reuse bridge.
2. Relational algebra and query semantics.
3. Functional dependencies and 1NF–3NF/BCNF.
4. JOIN/subquery/CTE/window SQL — extend PR15.
5. Transactions and ACID.
6. Isolation, MVCC, locking and deadlocks.
7. Physical storage, pages, cardinality and selectivity.
8. B-tree/hash/composite indexes.
9. Query planner, cardinality estimates and cost.
10. EXPLAIN/EXPLAIN ANALYZE evidence-based tuning.
11. Physical design for ML experiment data and bridge into d06.

The downstream bridge to `d10 · Постреляционные базы данных` is preserved, but NoSQL is explicitly excluded from the default P6 repair route. J2 Data Warehouse/OLAP remains deferred until semester-3 rolling preparation.

## Diagnostic design

P6 uses the same locked mastery model as the global prerequisite registry:

`M = 0.25*D0 + 0.50*D1 + 0.25*D2`

with:

- target: 90;
- D1 application minimum: 85;
- critical misconceptions allowed: 0;
- stop broad study when P6 >= 95 and D1 >= 90 with zero critical misconceptions.

The pack contains:

- D0: 18 recall items;
- D1: 12 application tasks;
- D2: 8 Vietnamese/Russian oral-explanation prompts;
- 11 critical misconceptions;
- 8 targeted repair routes.

## D1 emphasis

D1 is deliberately the largest weight. It checks whether the learner can actually:

- design PK/FK/constraints;
- translate relational-algebra intent into SQL;
- normalize a realistic relation;
- use a window function;
- define a correct transaction boundary;
- detect a wait-for deadlock cycle;
- reason about selectivity;
- choose a composite index from a workload;
- diagnose cardinality-estimation error;
- read before/after execution plans;
- benchmark repeatedly rather than cherry-pick one run;
- design an experiment/run/metric schema for ML research data.

## PostgreSQL policy

PostgreSQL is selected only as the recommended practice platform because it exposes transactions, indexes and EXPLAIN/EXPLAIN ANALYZE well enough for this preparation route.

It is explicitly marked:

`officiallyRequiredByBauman2026Plan: false`

so the Hub cannot present PostgreSQL as an official Bauman requirement.

## Source discipline

Official source:

- IU5 2026 study plan: `https://home.science.iu5.bmstu.ru/study-plans/iu5-master-program.pdf`

Related IU5 public material:

- `https://e-learning.bmstu.ru/iu5/course/view.php?id=44`

The second source is labeled `legacy_related_iu5_material`. It is used only to confirm that database/transaction/locking themes exist in related public IU5 teaching material. It is not treated as the exact 2026 syllabus for d06.

## New validator

Added:

`scripts/validate-p06-database-fundamentals.js`

The validator checks:

- P6 identity and global mastery-policy invariants;
- d06 remains exactly the locked official course name, 4 credits / 144 hours, semester 1, exam;
- d10 remains the official semester-2 bridge;
- PR06 and PR15 actually exist before they can be referenced as reusable content;
- all 11 nodes are unique, ordered and acyclic;
- required database topics are present in the intended nodes;
- D0/D1/D2 counts and node references are valid;
- Russian D2 prompts are present;
- repair routes cannot point to missing nodes or missing reused lessons;
- excluded administration/cloud detours do not enter active content;
- PostgreSQL cannot be promoted to an official Bauman requirement;
- canonical functional-dependency closure verifies the composite key used in the normalization sanity case;
- a canonical wait-for graph detects a two-transaction deadlock and rejects an acyclic graph;
- the selectivity sanity check preserves the expected ordering in the diagnostic example.

## Runtime policy

Pass 05 still does not:

- write diagnostic scores;
- mutate the adaptive scheduler;
- create a new top-level database site;
- overwrite existing Programming lessons;
- merge the temporary branch into `main`.

Runtime integration is deferred until the pack passes CI.

## Next step after CI passes

Pass 06 should implement `P4 · Discrete Mathematics, Algorithms & Data Structures` as a compact repair package, reusing `PR02` and `PR11` and filling only the audited gaps: linked list, tree traversal, hash collisions, sorting/searching, recursion, BFS/DFS and basic graph complexity.
