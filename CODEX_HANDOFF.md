# CODEX HANDOFF

This file is the durable bridge between Chat Box and Codex.

CURRENT SUBJECT: Database Systems & SQL  
ACTIVE PHASE: DB04  
CODEX STATUS: READY  
LAST VERIFIED MAIN COMMIT: `f355cc3795280449617ed6f59dde9682aca85df3`

## COMPLETED

- DB01 — PASS
- DB02 — PASS · DATABASE ACADEMIC FOUNDATION LOCKED
- DB03 — PASS · DATABASE REASONING & ASSESSMENT CONTRACT LOCKED
- DB04 contracts/security boundary — PREPARED

## TASK-DB04-001

Status: READY

Subject: Database Systems & SQL

Phase: DB04

### Problem

The repository has no proven executable learner SQL provider. Current `subjects/programming/simulations/sim_sql_query_lab.html` is only a UI simulation. Real application D1 databases exist under `control-service` and must never be reused for learner SQL.

### Required action

Implement the smallest architecture-correct DB04 capability set:

1. inspect current static/runtime/offline constraints;
2. select an isolated learner SQL provider based on repository evidence;
3. implement `db.sql.execute`, deterministic fixture load/reset and session isolation;
4. declare exact engine/profile/version;
5. connect DB03 semantic result normalization/test-of-tests;
6. add safe query-plan support only if provider/profile supports it;
7. implement deterministic transaction simulation (theoretical and/or engine-backed, clearly labeled);
8. add bounded index visualization contract consumption;
9. integrate AI tutor only as optional coach with no hidden-fixture access;
10. add targeted tests and required regression.

### Provider selection rule

Prefer a local/ephemeral provider when it satisfies offline and security requirements.

A server sandbox is allowed only when it is a dedicated learner backend.

Do not choose a provider merely because it is already connected to the application.

### Hard prohibition

**Never use or expose control-service D1, `bauman-control-preview-db`, or `bauman-control-db` for learner SQL.**

### Relevant files

- `prompts/subjects/database/DB04_ENGINE_TRANSACTIONS_INDEXES_QUERY_PLANNER_AI.md`
- `subjects/database/docs/db02/`
- `subjects/database/docs/db03/`
- `subjects/database/docs/db04/`
- `subjects/programming/simulations/sim_sql_query_lab.html`
- `subjects/programming/assets/core.js`
- `subjects/programming/assets/subject-adapter.js`
- `control-service/wrangler.preview.example.jsonc`
- `control-service/wrangler.production.example.jsonc`

### Acceptance

DB04 cannot PASS until all are evidenced:

- isolated learner SQL execution works;
- exact engine/profile/version recorded;
- reset restores exact fixture revision;
- sessions do not leak across attempts/tabs;
- timeout and row limit enforced;
- dangerous filesystem/network/admin/extension paths blocked as applicable;
- DB03 golden correct alternatives PASS;
- DB03 golden wrong queries FAIL on mapped fixtures;
- NULL/duplicates/order preserved in result normalization;
- control-service D1 is inaccessible from learner execution;
- planner claims are profile/version bound;
- transaction simulator names theoretical/engine isolation context;
- AI cannot see hidden fixtures or write official mastery;
- provider failure degrades honestly;
- targeted tests + affected regression PASS.

### Do not

- implement exact-string grading;
- weaken DB03 goldens;
- hard-code expected answers into learner client;
- expose hidden fixture payloads;
- duplicate generic mastery owner;
- edit DB02 canonical semantics to fit provider quirks;
- mark DB04 PASS from contract files alone.

## AFTER CODEX

Update:
- `prompts/subjects/database/PROJECT_STATE.json`
- `prompts/subjects/database/SOURCE_STATUS.md`
- this `CODEX_HANDOFF.md`
- DB04 evidence
- tests
- verified commit SHA

If DB04 PASS:
set active module to DB05.

If provider selection is genuinely blocked:
record exact BLOCKER, USER ACTION and RESUME FROM without broad re-audit.
