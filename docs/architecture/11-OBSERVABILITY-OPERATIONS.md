# 11 — Observability and Operations

## Operational goal

The platform should be diagnosable without turning logs into a privacy/security leak.

## Required dimensions

Operational telemetry should be able to identify:

- application;
- runtime;
- release revision;
- channel/environment;
- route/operation;
- bounded context;
- error class/code;
- request/correlation ID where available.

Never log secrets or raw protected tokens.

## Health model

Distinguish:

- process/runtime reachable;
- configuration ready;
- dependency/database ready;
- protected contract ready;
- content/package integrity ready.

A single `200 OK` is not comprehensive readiness.

## Extension/package health

Admin diagnostics should expose:

- installed package/version;
- enabled/disabled;
- schema compatibility;
- missing capability;
- failed resource;
- integrity mismatch;
- extension runtime error.

One failed extension must degrade locally rather than crash the whole product.

## Backup and recovery

For every authoritative store define:

- what is backed up;
- retention;
- restore procedure;
- restore validation;
- relationship to schema version;
- operator authority.

## Incident workflow

`detect → contain → preserve evidence → identify revision/config → rollback/disable when safe → root-cause fix → regression → release`

## Operational evidence

Release evidence should retain:

- source SHA;
- relevant PR;
- required gate runs;
- preview deploy run;
- production deploy run;
- read-back/smoke outcome;
- known warnings;
- rollback reference.

