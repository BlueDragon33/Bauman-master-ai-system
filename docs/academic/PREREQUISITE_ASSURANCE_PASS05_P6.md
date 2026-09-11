# Prerequisite Assurance · Pass 05 · P6 Database Fundamentals

Date: 2026-09-10
Branch: `temp/bauman-master-hub-prereq-2026`
Status: `P6_BLUEPRINT_VALIDATED_CI_PASS`
CI run: `34451113967`
Head SHA validated: `91012f06ab9a2cbeafd627dc76912e1830de43b2`

## Goal

Close the database-foundation gap before the official semester-1 course `d06 · Оптимизация баз данных систем машинного обучения` without rebuilding SQL from zero and without detouring into vendor administration, cloud certifications, ORM frameworks, NoSQL or data warehousing too early.

The locked IU5 2026 curriculum remains the source of truth for the official course identity: d06 is 4 credits / 144 hours, semester 1, exam. P6 itself is a competency prerequisite inferred by Bauman Master Hub, not an administrative prerequisite declared by Bauman.

## Reuse first

The audit already verified usable Programming content:

- `PR06 · SQL căn bản và mô hình quan hệ`: relational basics, PK/FK, SELECT/WHERE.
- `PR15 · SQL nâng nền: JOIN, GROUP BY, index`: JOIN/GROUP BY/basic index creation.

Pass 05 therefore does not duplicate those lessons. Repair routes enter PR06/PR15 only when diagnostics show the corresponding foundation is weak.

## New P6 pack

Added `assets/data/prerequisite-packs/p06-database-fundamentals.json` with 11 active nodes:

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

P6 uses the locked formula `M = 0.25*D0 + 0.50*D1 + 0.25*D2`, target 90, D1 minimum 85 and zero critical misconceptions. Stop broad P6 study when P6 >= 95 and D1 >= 90 with zero critical misconceptions.

The pack contains 18 D0 recall items, 12 D1 application tasks, 8 Vietnamese/Russian D2 oral prompts, 11 critical misconceptions and 8 targeted repair routes.

D1 checks actual competence: PK/FK/constraints, relational algebra → SQL, normalization, window SQL, transaction boundaries, deadlock detection, selectivity, composite-index choice, cardinality-estimation diagnosis, execution-plan comparison, repeated benchmarking and experiment/run/metric schema design for ML research data.

## PostgreSQL policy

PostgreSQL is only the recommended practice platform for transactions, indexes and EXPLAIN/EXPLAIN ANALYZE. The pack explicitly sets `officiallyRequiredByBauman2026Plan: false`, so the Hub cannot present PostgreSQL as an official Bauman requirement.

## Source discipline

Official source: `https://home.science.iu5.bmstu.ru/study-plans/iu5-master-program.pdf`.

Related public IU5 material: `https://e-learning.bmstu.ru/iu5/course/view.php?id=44`. It is labeled `legacy_related_iu5_material` and is not treated as the exact 2026 d06 syllabus.

## Validator and CI

Added `scripts/validate-p06-database-fundamentals.js`. The Academic 2026 workflow now runs it together with the locked curriculum validator, prerequisite coverage validator, P9 validator and runtime syntax/reference checks.

P6 validation checks:

- exact d06 identity, 4 credits / 144 hours, semester 1, exam;
- d10 semester-2 bridge;
- real existence of PR06 and PR15 before reuse;
- 11 unique, ordered, acyclic nodes;
- required database topic signals;
- D0/D1/D2 counts and node references;
- Russian D2 prompts;
- repair-route references;
- scope guards against administration/cloud detours;
- PostgreSQL not promoted to an official requirement;
- canonical functional-dependency closure for the normalization sanity case;
- wait-for graph deadlock/acyclic invariants;
- selectivity-order sanity invariant.

CI run `34451113967` completed successfully. Every step passed, including `Validate P6 Database Fundamentals pack`, P9 validation, official curriculum/prerequisite validation, coverage validation and runtime checks.

## Runtime policy

Pass 05 still does not write diagnostic scores, mutate the adaptive scheduler, create a new top-level database site, overwrite existing Programming lessons or merge the temporary branch into `main`.

## Next pass

Pass 06: implement `P4 · Discrete Mathematics, Algorithms & Data Structures` as a compact repair package. Reuse `PR02` and `PR11`, then fill only the audited gaps: linked list, tree traversal, hash collisions, sorting/searching, recursion, BFS/DFS and basic graph complexity. No competitive-programming detour.
