# DB04 SQL Execution Sandbox Contract

Status: **IMPLEMENTATION CONTRACT — runtime provider pending**

## Capability

Canonical capability ID:

`db.sql.execute`

Related:
- `db.schema.reset`
- `db.fixture.load`

## Hard isolation boundary

Learner SQL may execute only in:
- an ephemeral/local sandbox; or
- a dedicated learner-only backend with equivalent isolation.

It must never connect to:
- `bauman-control-preview-db`;
- `bauman-control-db`;
- any platform/control/auth/device/content-review database;
- any unrestricted production credential.

## Session model

Every learner execution session has:
- `sessionId`;
- `engineProfileId`;
- exact fixture revision;
- resource policy;
- reset token/version;
- no implicit access to another tab/session.

Multi-tab state must be isolated by session ID.

## Reset

`db.schema.reset` returns the exact known fixture revision. Attempts must not leak mutations into later attempts unless a task explicitly models persistence.

## SQL policies

The task/provider declares:
- SELECT-only vs DML vs DDL;
- multi-statement allowed/forbidden;
- row limit;
- timeout;
- memory/resource limit where supported;
- transaction policy.

Application-owned SQL uses parameterization. Learner raw SQL is never interpolated into privileged application SQL.

## Dangerous capability policy

Provider must block or sandbox engine-specific:
- filesystem access;
- extension loading;
- network/admin functions;
- attach/import paths that escape sandbox;
- unrestricted pragma/config/admin operations;
- cross-database access.

Use parser/engine capability controls where possible. Regex alone is not a security boundary.

## Result envelope

Execution returns structured evidence:
- engine/profile/version;
- schema revision;
- columns;
- rows with SQL NULL preserved;
- row count / truncation marker;
- deterministic ordering marker;
- execution error category;
- elapsed time only as contextual observation;
- no hidden fixture contents.

DB03 remains grading-semantics owner.
