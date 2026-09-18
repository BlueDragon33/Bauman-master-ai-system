# CODEX_STATE

Current task: `BAUMAN_ARCHITECTURE_NAMING_AND_LAYER_MAP`

Status: `ARCHITECTURE_MAP_ACTIVE`

Date: 2026-09-18

Current working branch: `work/foundation-v2-l10-content-asset-provenance`

> The branch name is historical and predates the current naming rule. Do not reuse the `foundation-v2` naming pattern for future branches.

## Primary architecture reference

Use `ARCHITECTURE.md` as the first document for understanding ownership, dependencies, and where a future change belongs.

Architecture names are responsibility-based. Version numbers are reserved for technical compatibility contracts only.

## Current foundation state

### Foundation — Identity & Domain Model

Historical checkpoint: L9.

State: frozen additive compatibility layer.

Responsibilities:

- canonical identity;
- domain entities;
- legacy mapping;
- identity overlay;
- durable canonical read projection;
- read-only canonical consumer context.

### Foundation — Content, Asset & Provenance Registry

Historical checkpoint: L10.

State: `promotion_candidate`.

Freeze head before architecture naming cleanup: `e8987dba7aca3acff7df012cb5d58922e7149aa3`.

Responsibilities:

- content/asset registry;
- SHA-256 asset integrity;
- provenance lineage;
- access metadata;
- deterministic registry snapshots;
- transactional storage-neutral snapshot transport;
- SHA-256 snapshot integrity;
- promotion/freeze invariants.

All six final L10 system gates were green at the freeze head:

- Content Asset Provenance Gate;
- Foundation Domain Model Gate;
- Academic 2026 Prerequisite Gate;
- Windows checkout safety;
- Bauman Cloudflare Preview CI;
- Whole System Integration Gate.

## Architecture naming policy

Do not use V2/V3/New/Latest/Final as the primary name of an architecture layer.

Use descriptive names such as:

- Hub Application Shell;
- Shared Subject Platform;
- Foundation — Identity & Domain Model;
- Foundation — Content, Asset & Provenance Registry;
- Foundation — Learning Content Standard;
- Learning State & Academic Planning;
- Packaging & Deployment;
- Verification & Quality Gates.

Historical L9/L10 codes may remain for traceability, but the responsibility name comes first.

## Authority rules

- Existing learner/subject state remains authoritative until an explicit migration gate changes ownership.
- Identity Foundation is additive and must not rewrite legacy state silently.
- Content/Asset/Provenance Foundation is runtime-neutral and must not become a second academic database.
- AI context remains policy-constrained and read-only for protected decisions.
- Packaging does not create new application authority.
- Tests must not be weakened simply to make CI green.

## Next architecture work

Before starting the next foundation layer:

1. write its descriptive responsibility name;
2. define owned data and non-owned data;
3. define dependencies on existing layers;
4. define expected runtime integration;
5. define its gate;
6. then create a descriptively named branch without generation labels.
