# DB01 Repository Map

Baseline SHA: `066ef7ce03be4e30f01fd69ae66a1cd859711226`

## Canonical prompt system

- `prompts/subjects/database/README.md`
- `prompts/subjects/database/DB_MASTER_PROMPT.md`
- `prompts/subjects/database/DB01_FORENSIC_BASELINE.md`
- `prompts/subjects/database/DB_CONSTITUTION_ROUTER.json`

## Current learning-content surfaces

### P6 Database Fundamentals
- `assets/data/prerequisite-packs/p06-database-fundamentals.json`
- `scripts/validate-p06-database-fundamentals.js`

Role: diagnostic/repair blueprint, not a learner database engine.

### Programming reuse
- `subjects/programming/data/lessons.json`
  - `PR06` — SQL căn bản và mô hình quan hệ
  - `PR15` — SQL nâng nền: JOIN, GROUP BY, index
- `subjects/programming/data/exercises.json`
  - `ex_PR06_easy|medium|hard`
  - `ex_PR15_easy|medium|hard`
- `subjects/programming/simulations/sim_sql_query_lab.html`
- `subjects/programming/assets/subject-adapter.js`
- `subjects/programming/assets/core.js`
- `subjects/programming/editor.html`
- `subjects/programming/subject-manifest.json`

Role: current reusable subject shell, generic assessment/review state and JSON authoring.

## Application database surface — MUST NOT become learner DB

- `control-service/migrations/0001_device_control.sql`
- `control-service/migrations/0002_automation_policy.sql`
- `control-service/migrations/0003_device_metadata_contract.sql`
- `control-service/migrations/0004_content_review.sql`
- `control-service/src/index.ts`
- `control-service/wrangler.preview.example.jsonc`
- `control-service/wrangler.production.example.jsonc`

Preview D1 binding:
- `bauman-control-preview-db`

Production D1 binding:
- `bauman-control-db`

These are application/control databases, not exercise databases.

## Adjacent subject boundary

- `prompts/subjects/advanced-database/` owns the later Advanced Database subject prompt architecture.
- Database Fundamentals / DB subject must not duplicate Advanced Database ownership.
- Programming owns generic language/application integration.
- Algorithms owns generic data-structure/algorithm theory.

## Dedicated DB runtime status

Current tree contains no dedicated:
- `subjects/database/index.html`
- learner SQL engine/provider
- learner database schema-fixture registry
- DB-specific semantic grader
- transaction simulation engine
- EXPLAIN/query-plan parser

These are absent/currently unproven, not assumed.
