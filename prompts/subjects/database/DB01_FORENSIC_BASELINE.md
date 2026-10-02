# DB01 — FORENSIC BASELINE
## Audit current Database/SQL reality before redesign

Mode:

`AUDIT-ONLY · NO-REDESIGN · REPOSITORY-TRUTH-FIRST · SECURITY-AWARE`

---

# 0. MISSION

Map exactly what Database/SQL content, engines, schemas, exercises, graders, UI, learner state and integrations already exist.

No future redesign during DB01.

---

# 1. DISCOVERY

Search actual repository for:

- database subject folders;
- SQL lessons;
- schema files;
- seed datasets;
- SQL runners;
- SQLite/Postgres/Neon/etc integrations;
- ORM code;
- query graders;
- ER diagrams;
- transaction simulations;
- index/plan visualizers;
- authoring tools;
- legacy routes.

Do not assume folder names.

---

# 2. CONTENT INVENTORY

Inventory:

- concepts;
- lessons;
- examples;
- SQL tasks;
- schema-design tasks;
- normalization tasks;
- transaction tasks;
- projects;
- assessments;
- datasets.

---

# 3. CURRICULUM INVENTORY

Classify actual current topics such as:

- relational model;
- schemas/tables;
- keys;
- constraints;
- SELECT;
- filtering;
- joins;
- aggregation;
- subqueries;
- CTEs;
- views;
- normalization;
- transactions;
- indexes;
- query plans;
- recovery.

Do not assume missing topics must be added.

---

# 4. DATABASE ENGINE INVENTORY

Record every runtime/provider:

- SQLite WASM;
- local SQLite;
- Postgres;
- Neon;
- mock engine;
- server API;
- in-memory SQL;
- ORM.

Record which are learner-facing vs production backend.

---

# 5. CONNECTION SAFETY AUDIT

For every DB connection determine:

- credentials;
- privilege;
- read/write;
- environment;
- isolation from production;
- reset mechanism.

Critical blocker:

learner SQL running against privileged production data.

---

# 6. SCHEMA INVENTORY

Record:

- canonical schemas;
- exercise schemas;
- demo schemas;
- production app schemas;
- migrations;
- generated schemas.

Do not mix learner exercise DB with application DB ownership.

---

# 7. SQL GRADER INVENTORY

Determine whether grading uses:

- exact SQL string;
- result comparison;
- ordered result comparison;
- schema-state comparison;
- hidden fixtures;
- query-plan check;
- static AST checks;
- rubric.

---

# 8. EXACT-STRING GRADER RISK

Flag any grader that rejects semantically valid alternative SQL because text differs.

---

# 9. SINGLE-DATASET GRADER RISK

Flag graders that accept wrong SQL merely because one dataset does not distinguish it.

---

# 10. NULL AUDIT

Inspect whether current materials/grader treat NULL correctly.

---

# 11. DUPLICATE/SET-BAG AUDIT

SQL typically uses bag/multiset semantics in many operations.

Determine whether current content incorrectly assumes pure set semantics.

---

# 12. ORDER AUDIT

Flag tasks that rely on row order without `ORDER BY`.

---

# 13. JOIN AUDIT

Inspect:

- inner;
- left;
- right/full if supported;
- cross;
- self;
- natural join if taught;
- join predicates;
- duplicate cardinality.

---

# 14. AGGREGATION AUDIT

Inspect:

- GROUP BY;
- HAVING;
- COUNT;
- DISTINCT;
- NULL interactions.

---

# 15. SUBQUERY / CTE AUDIT

Inspect scope/correlation/semantics.

---

# 16. DML AUDIT

If INSERT/UPDATE/DELETE taught:

check sandbox/reset/constraint handling.

---

# 17. DDL AUDIT

If CREATE/ALTER/DROP taught:

ensure isolated DB.

---

# 18. KEYS/CONSTRAINTS AUDIT

Inspect:

- primary;
- candidate;
- foreign;
- unique;
- not null;
- check;
- default;
- referential actions.

---

# 19. NORMALIZATION AUDIT

Inspect:

- functional dependencies;
- anomalies;
- 1NF/2NF/3NF/BCNF if present;
- lossless join;
- dependency preservation if in scope.

Flag “normalization = split large table”.

---

# 20. TRANSACTION AUDIT

Inspect:

- ACID;
- begin/commit/rollback;
- isolation;
- anomalies;
- concurrency examples.

---

# 21. ISOLATION AUDIT

Determine DB engine-specific semantics.

Do not assume textbook isolation maps identically across engines.

---

# 22. INDEX AUDIT

Inspect:

- B-tree;
- hash;
- composite;
- covering;
- clustered/nonclustered if engine-specific;
- selectivity.

Separate generic algorithm theory from DB semantics.

---

# 23. QUERY PLAN AUDIT

Find:

- EXPLAIN;
- EXPLAIN ANALYZE;
- visual plan;
- cost estimates.

Record database engine/version dependency.

---

# 24. BENCHMARK AUDIT

Flag simplistic “index always faster” claims.

---

# 25. STORAGE AUDIT

If pages/records/buffers taught:

map current depth.

---

# 26. RECOVERY AUDIT

If logging/WAL/recovery taught:

map actual scope.

---

# 27. ER/MODELING AUDIT

Inspect:

- entity;
- relationship;
- cardinality;
- optionality;
- mapping to relational schema.

---

# 28. ORM AUDIT

Separate ORM convenience from SQL/database semantics.

---

# 29. PYTHON BOUNDARY AUDIT

Python DB-API/SQLAlchemy/etc belongs partly to Python/application integration.

Database owns SQL/data semantics.

---

# 30. ALGORITHMS BOUNDARY AUDIT

B-tree/hash theory may be duplicated.

Map owner and references.

---

# 31. LEARNER-STATE AUDIT

Locate:

- attempts;
- completion;
- mastery;
- hints;
- query history;
- projects.

Subject must not own generic mastery aggregation.

---

# 32. AUTHORING AUDIT

Find how authors create:

- schemas;
- seed data;
- SQL tasks;
- hidden fixtures;
- expected results;
- design tasks.

---

# 33. SECURITY AUDIT

Check:

- SQL injection;
- unrestricted DDL/DML;
- file access;
- extension loading;
- dangerous functions;
- network access;
- production credentials;
- hidden test exposure;
- secrets in examples/logs.

---

# 34. UI AUDIT

Inspect:

- SQL editor;
- schema explorer;
- table/result grid;
- plan view;
- ER diagram;
- transaction timeline;
- responsive/mobile;
- accessibility.

---

# 35. QA AUDIT

Locate:

- query fixtures;
- semantic equivalence tests;
- constraint tests;
- concurrency tests;
- browser tests;
- security tests.

---

# 36. LEGACY CLASSIFICATION

For every candidate:

`KEEP`
`MIGRATE`
`RETIRE`
`UNKNOWN`.

No deletion in DB01.

---

# 37. DUPLICATE OWNER MAP

Identify duplicate:

- SQL runner;
- schema registry;
- query grader;
- migration engine;
- transaction simulator;
- query-plan parser.

---

# 38. RISK REGISTER

At minimum:

- unsafe production connection;
- exact-string grader;
- single-fixture false positive;
- NULL/order bug;
- transaction misconception;
- planner/version overclaim;
- duplicate owner;
- hidden-test leak;
- migration/state risk.

---

# 39. DELIVERABLES

Create:

`subjects/database/docs/db01/DB01_EXECUTIVE_SUMMARY.md`

`DB01_REPOSITORY_MAP.md`

`DB01_CONTENT_INVENTORY.json`

`DB01_ENGINE_CONNECTION_INVENTORY.json`

`DB01_SCHEMA_DATASET_INVENTORY.json`

`DB01_GRADER_AUDIT.md`

`DB01_SECURITY_AUDIT.md`

`DB01_DUPLICATE_OWNER_MAP.md`

`DB01_LEGACY_REGISTER.json`

`DB01_RISK_REGISTER.json`

`DB02_INPUT_CONTRACT.md`.

---

# 40. PASS

PASS only when current:

- subject scope;
- content;
- engines;
- schemas;
- graders;
- state;
- security;
- legacy;
- adjacent boundaries

are mapped sufficiently for DB02.

---

# 41. FAIL

FAIL if audit:

- redesigns the subject;
- runs destructive production SQL;
- assumes engine behavior without evidence;
- misses grader/runtime ownership;
- confuses learner DB with app production DB.

---

# 42. FINAL PRINCIPLE

**KNOW WHICH DATABASE YOU ARE TOUCHING BEFORE YOU TEACH, TEST OR MIGRATE ANYTHING.**
