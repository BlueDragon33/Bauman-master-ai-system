# Russian RU08 Phase Record

State: **CANDIDATE — PASS only after CI + integration acceptance**

Baseline: `main@f6aa11215dfcf24e2d646f7c9737733e66c642c8` (RU04 canonical-scheduler revalidation + RU05–RU07 selective revalidation PASS).

RU08 consumes current RU02–RU07 owners and is the final Russian-specific integration module.

## Scope
- adopt schema-aware authoring candidate lifecycle without a second content database;
- keep shared Content Review metadata-only;
- register Russian architecture/capability/content-snapshot metadata in the subject package;
- preserve shared app shell, design system, offline framework, auth/storage/search/release boundaries;
- validate representative learner/admin journeys and failure modes;
- produce RC readiness + exact production handoff contract.

## No-platform-fork rule
RU08 adds no Russian router, auth system, generic importer, generic plugin runtime, generic release mechanism, generic search system or second offline framework.

## Authoring rule
Ordinary authoring uses a guided proposal form. Browser tools emit a non-canonical candidate only. Canonical content changes require reviewed repository patches against the exact RU02 owner.

## Migration
Strangler only. No mass rewrite, no learner-state reset, no deletion of legacy compatibility paths.

## Release
RU08 stops at `RC_READY`. Production publication is exclusively the shared C3 Release Annex.

**RU08 PASS is declared only after branch + merged-main gates prove the candidate.**
