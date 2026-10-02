# DB04 — DATABASE ENGINE · TRANSACTIONS · INDEXES · QUERY PLANNER · AI
## Safe execution providers and database-system intelligence

Mode:

`SANDBOXED · ENGINE-AWARE · VERSION-AWARE · DETERMINISTIC-FIXTURE-FIRST · AI-BOUNDED`

---

# 0. ENTRY

Requires DB02/DB03.

---

# 1. MISSION

Provide safe SQL execution and database-system visualization capabilities without making one engine's implementation the universal academic truth.

---

# 2. CAPABILITIES

Possible:

`db.sql.execute`

`db.schema.reset`

`db.fixture.load`

`db.plan.explain`

`db.transaction.simulate`

`db.index.visualize`

`db.relational.visualize`

`db.benchmark.run`

`db.ai.tutor`.

Register through C1.

---

# 3. LEARNER DB ISOLATION

Learner SQL runs only in:

- ephemeral/local sandbox;
- isolated schema/database;
- tightly scoped test backend.

Never use unrestricted production credentials.

---

# 4. RESETABILITY

Exercise DB can reset deterministically.

---

# 5. FIXTURE IDENTITY

Each task references exact schema/data fixture revision.

---

# 6. TRANSACTIONAL TEST RESET

Tests should not leak state across attempts.

---

# 7. DDL SAFETY

If DDL allowed, restrict to learner sandbox.

---

# 8. DML SAFETY

Same.

---

# 9. DANGEROUS FUNCTIONS

Block/restrict engine-specific:

- filesystem;
- extension loading;
- network;
- admin functions

as appropriate.

---

# 10. TIMEOUT

Prevent runaway queries.

---

# 11. ROW LIMIT

Prevent huge result floods.

---

# 12. MEMORY/RESOURCE LIMIT

Where provider supports.

---

# 13. MULTI-STATEMENT POLICY

Explicit.

---

# 14. PARAMETERIZATION

Application-owned queries use parameterized APIs.

Learner raw SQL is isolated input, not concatenated into privileged app SQL.

---

# 15. ENGINE PROFILE

Execution provider declares:

- engine;
- version;
- dialect;
- features;
- isolation semantics;
- plan format.

---

# 16. SQLITE VS POSTGRES

Do not silently treat as identical.

---

# 17. SQL DIALECT

Task chooses profile or portable subset.

---

# 18. QUERY PLAN PROVIDER

Consumes engine EXPLAIN output.

Parses to pedagogical operator model.

---

# 19. PLAN VERSIONING

Parser tied to engine/version.

---

# 20. ESTIMATE/ACTUAL

If ANALYZE is used, distinguish.

---

# 21. PLAN SAFETY

Do not run expensive ANALYZE blindly on production.

Learner sandbox only.

---

# 22. INDEX VISUALIZATION

Show logical key/order/tree concept.

Avoid claiming exact physical page structure unless engine evidence exists.

---

# 23. B-TREE BOUNDARY

Generic algorithm mechanics referenced from Algorithms.

DB visualizer focuses on index/search/storage implications.

---

# 24. COMPOSITE INDEX

Visualize left-prefix/order concept where engine/profile supports.

---

# 25. QUERY PLANNER

Teach:

planner chooses based on statistics/cost.

Not:

“DB always uses index when WHERE exists”.

---

# 26. BENCHMARK PROVIDER

Controlled engine/version/data.

Record:

- dataset;
- cache/warm state if relevant;
- repetitions;
- plan;
- timing.

---

# 27. BENCHMARK LIMIT

Not universal performance truth.

---

# 28. TRANSACTION SIMULATOR

Represent concurrent sessions and operations.

---

# 29. SCHEDULE

Explicit timeline:

T1/T2 operations.

---

# 30. COMMIT/ROLLBACK

Visible.

---

# 31. ANOMALY SIMULATION

Deterministic fixtures for in-scope anomalies.

---

# 32. ISOLATION PROFILE

Simulation labels theoretical vs actual engine semantics.

---

# 33. MVCC VISUALIZATION

If in scope:

versions/snapshot visibility.

Do not overclaim internal implementation.

---

# 34. LOCK VISUALIZATION

If in scope:

lock mode/wait/block/deadlock concept.

Engine-specific detail only with authority.

---

# 35. DEADLOCK

If taught:

controlled example + detection/rollback concept.

---

# 36. BACKUP/RECOVERY SIMULATION

Educational only.

Do not connect to real production backup controls.

---

# 37. RELATIONAL ALGEBRA VISUALIZATION

Can show operator tree and intermediate relations.

---

# 38. SQL → RELATIONAL SHAPE

Optional conceptual mapping.

Do not imply optimizer literal implementation equals the pedagogical tree.

---

# 39. AI TUTOR MODES

Possible:

`DATA_MODEL_COACH`

`SQL_QUERY_COACH`

`JOIN_COACH`

`NULL_COACH`

`NORMALIZATION_COACH`

`TRANSACTION_COACH`

`INDEX_COACH`

`QUERY_PLAN_COACH`.

---

# 40. AI GROUNDING

Context includes:

- canonical concept;
- engine profile;
- schema;
- task;
- learner query/result;
- allowed hints.

---

# 41. AI SQL EXECUTION

Prefer sandbox execution for verifying claims.

Do not rely solely on language model prediction.

---

# 42. AI QUERY FIX

Coach learner rather than replacing full query immediately.

---

# 43. AI PLAN CLAIM

Must be tied to actual plan/engine profile where available.

---

# 44. AI INDEX CLAIM

Avoid “add index = faster” universal advice.

---

# 45. AI TRANSACTION CLAIM

Must name isolation/model.

---

# 46. AI HIDDEN TEST

No access.

---

# 47. AI OFFICIAL GRADING

Forbidden by default.

---

# 48. AI PROVIDER FAILURE

Fallback:

- canonical lesson;
- deterministic fixtures;
- static hints.

---

# 49. OBSERVABILITY

Track:

- SQL timeout;
- sandbox reset failure;
- planner parse failure;
- transaction simulator error;
- AI failure.

No secrets/query data dumps unnecessarily.

---

# 50. OFFLINE

If using local SQLite/WASM or precomputed fixtures, support offline as architecture permits.

Server-only providers degrade honestly.

---

# 51. SECURITY

No learner query may access:

- platform DB;
- secrets;
- filesystem outside sandbox;
- network/admin functions.

---

# 52. MULTI-TAB

Separate learner DB/session state.

---

# 53. REQUIRED DELIVERABLES

Create:

`subjects/database/docs/db04/DB_SQL_EXECUTION_SANDBOX_CONTRACT.md`

`DB_ENGINE_PROFILE_REGISTRY.json`

`DB_FIXTURE_RESET_CONTRACT.md`

`DB_QUERY_PLAN_PROVIDER_CONTRACT.md`

`DB_INDEX_VISUALIZATION_CONTRACT.md`

`DB_TRANSACTION_SIMULATION_CONTRACT.md`

`DB_BENCHMARK_CONTRACT.md`

`DB_AI_TUTOR_CONTRACT.md`

`DB_SECURITY_BOUNDARY.md`

`DB05_INPUT_CONTRACT.md`.

---

# 54. GOLDEN FIXTURES

At minimum:

- NULL comparison;
- duplicate joins;
- outer join unmatched;
- COUNT nullable;
- NOT IN NULL trap if taught;
- composite index example;
- planner chooses scan despite index;
- transaction anomaly;
- sandbox destructive SQL isolation.

---

# 55. PASS

PASS when:

- execution isolated;
- engine/version explicit;
- fixtures deterministic;
- planner/index/transaction visualizations are truthful;
- AI bounded/grounded;
- unsafe capabilities blocked;
- offline/failure behavior defined.

---

# 56. FAIL

FAIL if:

- learner SQL touches production DB;
- planner output treated as universal;
- index advice unconditional;
- transaction simulator hides isolation model;
- AI reveals hidden fixtures;
- SQL runner has unrestricted filesystem/network/admin access.

---

# 57. FINAL PRINCIPLE

**RUN QUERIES IN A SANDBOX.**
**RUN CLAIMS THROUGH AN ENGINE PROFILE.**
**DO NOT TURN ONE DATABASE IMPLEMENTATION INTO UNIVERSAL THEORY.**
