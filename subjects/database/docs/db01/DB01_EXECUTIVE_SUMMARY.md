# DB01 Executive Summary

Baseline SHA: `066ef7ce03be4e30f01fd69ae66a1cd859711226`

Status: **PASS**

## Current repository truth

There is **no dedicated learner-facing `subjects/database/` runtime yet**. Database learning currently exists in three places:

1. `assets/data/prerequisite-packs/p06-database-fundamentals.json` — an 11-node Database Fundamentals diagnostic/repair blueprint.
2. `subjects/programming/` — reusable lessons `PR06` and `PR15`, six related exercises, shared review/exam state, generic JSON authoring, and a SQL-themed simulation.
3. `control-service/` — a real Cloudflare D1 application database for device/control/content-review operations. This is **application infrastructure, not learner SQL infrastructure**.

## Key findings

- `PR06` covers basic relational concepts, PK/FK and SELECT/WHERE.
- `PR15` covers JOIN, GROUP BY and basic CREATE INDEX.
- P6 extends those lessons with relational algebra, normalization, transactions, isolation/deadlock, storage/selectivity, indexes, planner/cost, EXPLAIN/EXPLAIN ANALYZE and an ML-data workload bridge.
- P6 recommends PostgreSQL for practice but explicitly states it is **not an official Bauman requirement**.
- No learner SQL execution provider (SQLite/Postgres/Neon/etc.) is currently proven in the repository.
- `sim_sql_query_lab.html` is a UI-only risk/reproducibility slider; it does **not execute SQL, build schemas, or inspect query plans**.
- No database-specific semantic SQL grader is currently proven. Existing Programming exercises use generic rubrics and the P6 validator checks content/metadata invariants rather than learner SQL semantics.
- Generic learner state is stored through the Programming subject's shared/localStorage state; no DB-specific query history/mastery owner exists.
- Generic authoring is JSON Data Manager style; no DB-specific schema/seed/hidden-fixture authoring contract exists.
- The production/preview control D1 databases are clearly separate application backends and must remain inaccessible to learner SQL.

## DB01 conclusion

The current scope, content, execution path, grading path, state ownership, application-database boundary, legacy candidates and primary risks are mapped sufficiently for DB02.

Next module: **DB02 — Academic Blueprint + Canonical Database Model**.
