# DB01 Security Audit

Baseline SHA: `066ef7ce03be4e30f01fd69ae66a1cd859711226`

## Findings

### Learner SQL execution

No learner SQL execution provider is currently proven, so there is no current learner connection credential to classify.

### Application/control D1

The repository contains real preview and production D1 application backends:

- `bauman-control-preview-db`
- `bauman-control-db`

The control service uses a `DB` binding and migrations for device/control/content-review data.

Classification: **APPLICATION BACKEND — NOT LEARNER DATABASE**

### Current SQL lab

`subjects/programming/simulations/sim_sql_query_lab.html` does not execute SQL, so it currently presents no SQL injection or DDL/DML escape path.

## Critical future safety rules

Before DB04 adds executable SQL:

- use ephemeral or resettable learner databases;
- never expose production/preview application DB credentials;
- isolate network/file/extension access;
- scope DDL/DML by exercise policy;
- reset fixtures deterministically;
- protect hidden tests/solutions;
- avoid secrets in logs/examples;
- enforce resource/time/query limits;
- keep learner DB schema ownership separate from application migrations.

## Blocker assessment

No current critical production-connection violation was found.

However, **reusing control-service D1 as the learner execution backend would be a critical blocker**.
