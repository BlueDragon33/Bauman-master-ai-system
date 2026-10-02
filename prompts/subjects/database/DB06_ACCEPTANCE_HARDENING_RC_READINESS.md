# DB06 — ACCEPTANCE · HARDENING · LEGACY CLOSURE · RC READINESS
## Database-specific final gate before shared production release

Mode:

`SEMANTIC-REGRESSION · SECURITY-FIRST · DATA-INTEGRITY-FIRST · NO-KNOWN-BLOCKER`

---

# 0. MISSION

Prove the Database/SQL subject is academically correct, grader-safe, sandboxed, accessible, performant and ready for exact RC freeze.

---

# 1. GATES

`A CANONICAL DB TRUTH`

`B SQL/SCHEMA ASSESSMENT`

`C ENGINE/TRANSACTION/PLAN`

`D UX/A11Y`

`E SECURITY/OFFLINE/PERFORMANCE`

`F LEGACY/RC`.

---

# 2. CANDIDATE IDENTITY

Record:

- SHA;
- content snapshot;
- subject pack;
- SQL engine profile/version;
- config/flags;
- lockfile.

---

# 3. CANONICAL VALIDATION

No duplicate IDs/dangling refs.

---

# 4. KEY/CONSTRAINT FIXTURES

Test:

- composite primary key;
- nullable unique behavior according engine profile;
- FK violation;
- cascade/restrict where taught;
- CHECK.

---

# 5. NULL MATRIX

At minimum:

- `= NULL` misconception;
- IS NULL;
- COUNT(nullable);
- aggregate NULL;
- outer join NULL;
- NOT IN NULL trap if in scope.

---

# 6. DUPLICATE MATRIX

Test:

- join multiplication;
- DISTINCT;
- UNION vs UNION ALL if taught;
- GROUP BY.

---

# 7. ORDER MATRIX

No ORDER BY → grader not dependent on accidental row order.

With ORDER BY → direction/ties tested.

---

# 8. EMPTY RELATION

Queries behave correctly.

---

# 9. JOIN MATRIX

- one-to-one;
- one-to-many;
- many-to-many;
- unmatched left/right;
- duplicate keys when allowed;
- missing predicate.

---

# 10. AGGREGATION MATRIX

- empty;
- NULL;
- multiple groups;
- HAVING;
- COUNT differences.

---

# 11. SUBQUERY MATRIX

- no rows;
- one row;
- many rows;
- correlation;
- NULL where relevant.

---

# 12. CTE/WINDOW MATRIX

Only if in curriculum.

---

# 13. DML MATRIX

- constraint pass/fail;
- rollback/reset;
- affected rows.

---

# 14. DDL MATRIX

- create;
- alter;
- drop only sandbox;
- schema state.

---

# 15. MULTIPLE VALID SQL

Critical gate.

Known alternative valid queries must pass.

---

# 16. KNOWN WRONG SQL

Known wrong queries must fail.

---

# 17. SINGLE-FIXTURE FALSE POSITIVE

Add discriminating fixtures until wrong query fails.

---

# 18. NORMALIZATION

Test:

- FD closure;
- keys;
- normal-form violation;
- decomposition;
- lossless/dependency preservation where in scope;
- alternate valid decomposition.

---

# 19. TRANSACTION MATRIX

Controlled schedules for in-scope anomalies.

---

# 20. ISOLATION PROFILE

Tests tied to theoretical/engine profile explicitly.

---

# 21. LOST UPDATE

If taught, fixture.

---

# 22. NON-REPEATABLE READ

If taught, fixture.

---

# 23. PHANTOM

If taught, fixture.

---

# 24. WRITE SKEW

If taught/MVCC scope, fixture.

---

# 25. DEADLOCK

If taught, controlled fixture.

---

# 26. INDEX MATRIX

- equality;
- range;
- low selectivity;
- composite order;
- covering if supported;
- no-plan-benefit example.

---

# 27. QUERY PLAN

Plan parser/view tested against exact engine version.

---

# 28. ESTIMATE VS ACTUAL

Visual distinction.

---

# 29. INDEX NOT USED

Golden example where planner chooses scan.

---

# 30. BENCHMARK

No universal performance claim from one run.

---

# 31. SQL SANDBOX SECURITY

Attempt:

- production table access;
- filesystem;
- network;
- extension loading;
- dangerous admin commands;
- long-running query;
- output flood.

Must be contained.

---

# 32. SQL INJECTION

Application-owned DB calls parameterized.

Learner raw SQL never concatenated into privileged queries.

---

# 33. CREDENTIAL LEAK

No secrets in:

- frontend;
- fixtures;
- prompts;
- logs;
- exported task packages.

---

# 34. HIDDEN FIXTURE SECURITY

Not shipped to learner/AI when protection required.

---

# 35. RESET ISOLATION

Attempt A cannot contaminate B.

---

# 36. MULTI-TAB ISOLATION

Separate DB session/attempt safely.

---

# 37. AI ACCEPTANCE

Test:

- NULL;
- outer join;
- normalization;
- isolation;
- index/plan advice;
- hidden-test refusal;
- no official mastery write.

---

# 38. AI WRONG CLAIM FIXTURE

Misleading “index always faster” / “NULL = empty” / isolation claim.

AI must not agree blindly.

---

# 39. AI PROVIDER FAILURE

Subject core remains.

---

# 40. RESPONSIVE

SQL editor/result/schema on:

- mobile;
- tablet;
- desktop.

---

# 41. ACCESSIBILITY

- schema table;
- result grid;
- ER alternative;
- plan alternative;
- transaction timeline alternative.

---

# 42. OFFLINE

Test actual supported matrix.

---

# 43. LOCAL SQL ENGINE

If WASM/local:

- load time;
- DB reset;
- persistence policy;
- storage size;
- unsupported feature fallback.

---

# 44. SERVER SQL ENGINE

If server:

- auth;
- isolation;
- timeout;
- quota;
- offline fallback.

---

# 45. PERFORMANCE

Measure:

- subject startup;
- engine init;
- query execution;
- large result rendering;
- schema explorer;
- plan rendering;
- authoring list.

---

# 46. LARGE RESULT

Row limit/pagination/virtualization.

---

# 47. LARGE SCHEMA

Explorer remains responsive.

---

# 48. MEMORY

Repeated DB reset/engine mount does not leak unbounded memory.

---

# 49. AUTHORING ACCEPTANCE

Create:

- schema;
- fixture;
- SQL task;
- normalization task;
- transaction task;
- plan task

without app code edit for ordinary cases.

---

# 50. TEST-OF-TESTS AUTHORING

Wrong query fixtures fail, alternate-correct pass.

---

# 51. LEGACY INVENTORY

Retire/resolve duplicate:

- SQL runner;
- exact-string grader;
- old schema registry;
- old plan parser;
- old transaction simulator;
- unsafe DB connection;
- stale route/flag.

---

# 52. DUPLICATE OWNER GATE

Zero unresolved canonical writers.

---

# 53. MIGRATION

If canonical IDs/schema changed:

- aliases;
- learner attempt preservation;
- content migration;
- rollback.

---

# 54. DEPENDENCY AUDIT

No unjustified duplicate SQL editor/DB engine/client library.

---

# 55. RC FREEZE

Freeze:

- SHA;
- content snapshot;
- subject pack;
- engine/version;
- config;
- lockfile;
- migrations.

---

# 56. PRODUCTION SMOKE PROFILE

Hand shared release procedure a safe DB subject smoke:

1. open Database subject;
2. open canonical SQL lesson;
3. run isolated SELECT against test fixture;
4. verify NULL/result-grid semantics;
5. run one join/aggregation practice;
6. verify active DB subject pack/content snapshot;
7. verify SQL engine profile/version;
8. verify sandbox cannot reach platform production DB;
9. verify optional AI grounded/fallback;
10. offline cached lesson/local SQL only if supported.

No destructive production data.

---

# 57. BLOCKERS

- learner SQL can touch production DB;
- secret leak;
- known wrong SQL passes;
- alternate-correct SQL systematically fails;
- NULL/order semantics wrong;
- query plan presented as universal truth;
- transaction simulation false;
- hidden fixtures leak;
- duplicate canonical DB owner;
- migration corrupts learner state.

---

# 58. DELIVERABLES

Create:

`subjects/database/docs/db06/DB_ACCEPTANCE_MATRIX.md`

`DB_SQL_SEMANTIC_REGRESSION.json`

`DB_GRADER_TEST_OF_TESTS_REPORT.md`

`DB_NULL_DUPLICATE_ORDER_REPORT.md`

`DB_TRANSACTION_ISOLATION_ACCEPTANCE.md`

`DB_INDEX_PLAN_ACCEPTANCE.md`

`DB_SANDBOX_SECURITY_REPORT.md`

`DB_AI_ACCEPTANCE_REPORT.md`

`DB_ACCESSIBILITY_RESPONSIVE_REPORT.md`

`DB_OFFLINE_PERFORMANCE_REPORT.md`

`DB_LEGACY_CLOSURE_REPORT.md`

`DB_RC_MANIFEST.json`

`DB_PRODUCTION_SMOKE_PROFILE.md`

`DB06_EVIDENCE_INDEX.md`.

---

# 59. PASS

PASS when:

1. canonical truth passes;
2. SQL semantic grader passes;
3. known wrong queries fail;
4. alternate-correct queries pass;
5. NULL/duplicates/order pass;
6. schema design/normalization pass;
7. transaction/isolation pass;
8. index/plan semantics pass;
9. sandbox security passes;
10. hidden tests protected;
11. AI boundaries pass;
12. UX/accessibility passes;
13. offline behavior passes;
14. performance acceptable;
15. authoring passes;
16. no duplicate canonical owner remains;
17. migration/legacy closure complete;
18. exact RC + production smoke ready.

---

# 60. FINAL PRINCIPLE

**A DATABASE SUBJECT IS NOT RELEASE-READY UNTIL THE SAME CANONICAL SEMANTICS ARE AGREED BY THE LESSON, THE SQL ENGINE, THE GRADER, THE VISUALIZER AND THE AI.**
