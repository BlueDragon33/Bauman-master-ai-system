# 14 — Master Dependency Roadmap

This roadmap is intentionally dependency-driven. It is not Roadmap V2 and must not be named L36.

## Program streams

- ARCH — System Architecture
- DATA — Domain/Data Contracts
- PLAT — Platform Runtime
- LEARN — Academic/Learning
- UI — Interface
- QA — Quality
- SEC — Security
- OPS — Operations
- GOV — Governance

## Wave 0 — Survey and Blueprint

Deliver:
- As-Is/To-Be architecture;
- product charter;
- domain/trust maps;
- NFR/quality gates;
- migration/rollback plan;
- governance.

Exit: **A0 Architecture Ready**.

## Wave 1 — Foundation

Primary dependency chain:

`Identity → schema conventions → manifest → registry → capability model → event/storage ports → Learning Contract`

Parallel supporting work:

- UI token/layout foundation;
- security threat model;
- QA contract tests.

Exit: **A1 Foundation Ready**.

## Wave 2 — Real Vertical Slice

Use one bounded production-like learning unit.

Target pipeline:

`Package → Resource → Lesson → Practice → Assessment → Evidence → Learner State → UI → Offline → QA`

Do not migrate all subjects.

Exit: **A2 Vertical Slice Ready**.

## Wave 3 — Extensible Platform

Add:

- universal resource adapters;
- extension runtime/SDK;
- package validation;
- import center;
- subject factory;
- no-code authoring foundations.

Exit: **A3 Platform Ready**.

## Wave 4 — Learning Outcome System

Expand:

- competency graph;
- prerequisite graph;
- outcome mapping;
- assessment architecture;
- evidence store;
- mastery policy;
- retrieval/retention;
- transfer/oral defense;
- projects/portfolio.

This work grows from the Learning Contract established in Wave 1; it is not a disconnected subsystem.

## Wave 5 — Migration

Migrate high-value legacy behavior incrementally.

Suggested ordering is decided by dependency audit, not by subject prestige.

Exit: **A4 Migration Ready** and then controlled adoption.

## Wave 6 — Product Hardening

Professional UI convergence, performance, accessibility, failure injection, long-session tests, observability, recovery and operational runbooks.

Exit: **A5 Product Ready**.

## Dependency rules

1. A downstream wave cannot redefine upstream contracts informally.
2. Upstream contract changes require ADR and impact analysis.
3. Parallel work is allowed only where dependencies are explicit.
4. QA begins in Wave 0 and follows every wave; it is never a final phase.
5. Production publish remains manual/exact-revision throughout architectural migration.

