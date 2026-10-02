# DB03 Input Contract

Produced by: DB02

## Foundation status

**DATABASE ACADEMIC FOUNDATION LOCKED**

## Canonical sources

- `DB_ACADEMIC_BLUEPRINT.md`
- `DB_COMPETENCY_GRAPH.json`
- `DB_PREREQUISITE_GRAPH.json`
- `DB_CANONICAL_ENTITY_SCHEMA.json`
- `DB_RELATIONAL_MODEL_CONTRACT.md`
- `DB_SQL_SEMANTICS_CONTRACT.md`
- `DB_NORMALIZATION_CONTRACT.md`
- `DB_TRANSACTION_ISOLATION_CONTRACT.md`
- `DB_INDEX_QUERY_PLAN_CONTRACT.md`
- `DB_ENGINE_PROFILE_SCHEMA.json`

## DB03 must grade semantics, not strings

DB03 should define assessment/evidence for:

- relational algebra;
- schema/key/constraint reasoning;
- SQL alternatives;
- NULL / three-valued logic;
- duplicate/bag semantics;
- ordering;
- join cardinality;
- aggregation;
- normalization;
- query-result vs query-meaning distinction.

## Required grader properties

- multiple-valid-query support;
- discriminating fixtures;
- known-wrong query rejection;
- hidden-fixture protection;
- partial credit by semantic error class;
- explicit task semantics;
- no dependence on incidental row order;
- no AI ownership of official grading.

## Engine boundary

DB03 may use deterministic execution as evidence, but engine/provider implementation belongs to DB04.

Do not pre-build production SQL runtime inside DB03.
