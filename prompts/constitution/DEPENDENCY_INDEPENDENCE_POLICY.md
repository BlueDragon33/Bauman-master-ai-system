# GLOBAL DEPENDENCY INDEPENDENCE POLICY
## Local-first · Offline-first · Free-first · User-owned data · Optional cloud bridges

Repository: `BlueDragon33/Bauman-master-ai-system`

Status: CANONICAL SHARED POLICY

Universal Constitution: `blueprint-os:universal-century-grade@1.2.0`

Required project dependency budget: `prompts/constitution/DEPENDENCY_BUDGET.json`

Authority:
1. `.blueprint/constitution-adoption.json`
2. `prompts/CONSTITUTION.md`
3. this policy
4. domain/subject Master Prompt
5. module prompt/state/evidence

This policy is a specialization of C1 (architecture) and C3 (QA/release). It is not a fifth Constitution.

---

# 0. PURPOSE

Bauman is a personal learning system first.

The default architecture must minimize operational dependency on paid or vendor-specific infrastructure while preserving portability, offline use, reproducibility, security and long-term maintainability.

Default priority:

`LOCAL-FIRST → OFFLINE-FIRST → FREE-FIRST → PORTABLE → OPTIONAL CLOUD`

No provider may become mandatory merely because it is convenient.

---

# 1. USER-SOVEREIGNTY PRINCIPLE

The user must retain practical control over:

- source code;
- learning content;
- learner data;
- progress/evidence;
- configuration;
- exports/backups;
- provider choice.

A provider outage, pricing change, quota change, account closure or product retirement must not destroy canonical learning data or make the core product unusable when a local/browser path can satisfy the requirement.

---

# 2. PROVIDER DECISION LADDER

For every new capability, evaluate providers in this order:

1. browser-native;
2. Web Worker / Service Worker;
3. WebAssembly;
4. local desktop/runtime integration;
5. user-owned local service;
6. free static hosting / free sync bridge;
7. user-owned cloud storage bridge;
8. managed free-tier backend;
9. paid managed backend;
10. vendor-specific proprietary runtime.

Choose the lowest-dependency option that still meets the actual capability, security and evidence requirements.

Skipping a lower tier requires evidence of a real capability gap.

---

# 3. PAID SERVICE RULE

A recurring paid service is never the default requirement for the personal learning core.

Paid infrastructure requires:

- explicit user approval;
- documented reason local/free alternatives are insufficient;
- cost visibility;
- data export path;
- rollback/fallback path;
- clear optional/required classification.

No subject may block completion solely because a paid hosting/runtime product is unavailable when an acceptable local/browser provider can satisfy the subject contract.

---

# 4. VENDOR-LOCK-IN RULE

Cloudflare, Vercel, Neon, Google, Microsoft, GitHub or any other vendor must be treated as providers behind stable abstractions.

Forbidden:

- vendor API as canonical domain truth;
- provider-specific IDs as irreplaceable learner-state identity;
- subject logic directly coupled to vendor SDK without adapter boundary;
- data format that cannot be exported independently;
- hidden paid dependency in a required path.

Provider-specific implementations are allowed when isolated behind a capability/provider contract.

---

# 5. CHATGPT ROLE

ChatGPT is the preferred interactive AI assistant for this personal system.

Default rule:

- do not require a separate paid AI API merely to reproduce capabilities already available through the user's ChatGPT workflow;
- AI-dependent app features must degrade gracefully when no model API is connected;
- canonical learning truth, mastery and learner state remain outside model authority;
- ChatGPT may assist through chat, Work, connectors or explicit user workflows without becoming a hidden backend requirement.

The product must remain useful without continuous AI availability.

---

# 6. GITHUB ROLE

GitHub is primarily:

- source control;
- version history;
- issue/PR governance;
- CI/test execution;
- release artifact provenance.

GitHub is not the canonical runtime database for learner state.

Manual GitHub actions should prefer reproducible CLI commands when available rather than requiring UI clicking.

---

# 7. LOCAL DATA LAYER

Default canonical personal-data strategy:

- structured local storage via IndexedDB/OPFS or equivalent browser-safe storage;
- exportable JSON/JSONL/SQLite/ZIP content packs where appropriate;
- versioned schemas;
- deterministic migration;
- append-only evidence/history where official learning evidence requires it;
- explicit backup/restore.

LocalStorage may be used only for small non-critical preferences unless a stronger contract explicitly permits more.

---

# 8. GOOGLE DRIVE / SHEETS / APPS SCRIPT ROLE

Google services are OPTIONAL user-owned cloud bridges, not core truth owners.

## Google Drive
May provide:

- backup;
- versioned snapshots;
- exported content packs;
- learner artifact sync;
- cross-device file access.

Drive must not be the only copy of canonical learner state.

## Google Sheets
May provide:

- indexes;
- lightweight tabular metadata;
- reporting views;
- human-editable planning tables.

Sheets must not become the canonical transactional store for complex mastery/state graphs.

## Google Apps Script
May provide an optional thin sync/API bridge when access is needed while the user's PC is offline.

Apps Script must:

- remain replaceable;
- be quota-aware;
- use idempotent operations;
- avoid storing secrets in browser code;
- fail gracefully;
- never be required for offline core use.

No quota number is hard-coded into architecture; quotas change over time.

---

# 9. SYNC MODEL

Cloud sync is a secondary projection of local canonical data.

Preferred pattern:

`LOCAL STATE → CHANGE JOURNAL → VERSION/HASH → OPTIONAL SYNC ADAPTER → REMOTE BACKUP/PROJECTION`

Requirements:

- conflict detection;
- explicit merge policy;
- retry-safe writes;
- offline queue;
- no silent overwrite of newer state;
- remote failure must not destroy local progress;
- provider reconnect must not duplicate official evidence.

---

# 10. STORAGE ABSTRACTION

All domains must use a storage/provider facade rather than direct vendor calls.

Example conceptual providers:

- memory;
- IndexedDB;
- OPFS;
- local file export/import;
- Google Drive sync;
- Google Sheets projection;
- Apps Script bridge;
- D1/SQL backend;
- other managed cloud provider.

The facade owns provider selection; subject code owns subject semantics.

---

# 11. COMPUTE POLICY

Default compute should run as close to the user as safely practical.

Preferred:

- browser JavaScript;
- WebAssembly;
- Web Workers;
- local desktop runtime.

External compute is justified only when required for:

- capability unavailable locally;
- stronger isolation;
- confidential hidden evaluation;
- heavy compute that would be impractical locally;
- collaborative/shared service semantics.

Even then, provide a reduced local/offline mode whenever practical.

---

# 12. PYTHON SPECIALIZATION

Python provider priority:

1. browser/WASM runtime for interactive practice and offline learning;
2. local desktop CPython/sandbox for native/full-runtime tasks;
3. optional managed container provider for stronger shared isolation;
4. external runner only as contingency.

A cloud container is not canonical Python truth.

Browser execution must not claim hidden-test confidentiality it cannot provide.

High-assurance hidden evaluation may use a local trusted runner or optional remote provider.

---

# 13. DATABASE SPECIALIZATION

For personal learning and practice, prefer:

- SQLite/SQLite-WASM;
- DuckDB/DuckDB-WASM when analytical SQL is appropriate;
- local ephemeral databases;
- deterministic fixtures.

Managed remote databases are optional capability providers, not mandatory curriculum dependencies.

---

# 14. ML / DATA / ALGORITHMS SPECIALIZATION

Prefer browser/local compute for:

- algorithms;
- visualizations;
- small/medium numerical experiments;
- data exploration;
- deterministic simulations.

Heavy GPU/distributed workloads may use optional remote providers, but the course must preserve a local conceptual/practice path.

---

# 15. OFFLINE REQUIREMENT

Every core learner journey should declare one of:

- `OFFLINE_REQUIRED`
- `OFFLINE_PREFERRED`
- `NETWORK_REQUIRED_WITH_REASON`

Default is `OFFLINE_PREFERRED`.

Network-required status must identify the exact capability that cannot be provided locally.

---

# 16. RELEASE PROFILES

A release target is explicit.

Supported profiles:

## LOCAL_STABLE
Validated local/browser/offline package. No external hosting required.

## SYNC_STABLE
LOCAL_STABLE plus one or more optional sync bridges validated.

## PUBLISHED_STABLE
A hosted/public endpoint is validated in addition to local capability.

## MANAGED_PRODUCTION_STABLE
A managed backend/runtime release is validated with the full C3 production procedure.

Subject completion must not be blocked by MANAGED_PRODUCTION_STABLE unless the subject's actual requirements prove managed infrastructure is necessary.

---

# 17. FAILURE BEHAVIOR

If an optional provider fails:

- core app continues;
- local state remains writable where safe;
- sync queue remains pending;
- user receives clear status;
- no fake success;
- no silent data loss.

If a capability is truly provider-only, only that capability becomes unavailable.

---

# 18. SECURITY

Rules:

- no provider secret in repository/runtime content;
- least-privilege OAuth scopes;
- user-owned remote folder/scope where practical;
- revocable integrations;
- explicit auth boundary;
- no direct plugin access to privileged cloud credentials;
- sensitive exports may require encryption before cloud backup.

---

# 19. PORTABILITY ACCEPTANCE

A capability is not considered dependency-independent until:

- data can be exported;
- provider can be disabled without corrupting canonical state;
- fallback behavior is defined;
- provider-specific code is isolated;
- core startup does not require paid credentials unless explicitly approved;
- offline/local smoke exists where applicable.

---

# 20. ARCHITECTURE REVIEW CHECKLIST

Before adding an external service, answer:

1. Can browser/local do this?
2. Can WebAssembly do this?
3. Can a local companion do this?
4. Is a free user-owned sync bridge sufficient?
5. Is remote compute actually required?
6. Is the provider behind an adapter?
7. Can data be exported?
8. What happens when the provider is unavailable?
9. Does the feature still work in reduced local mode?
10. Is there recurring cost?
11. Has the user explicitly approved that cost?
12. What is the migration path away from the provider?

No satisfactory answers = do not make the provider mandatory.

---

# 21. MIGRATION RULE

Existing paid/vendor-specific implementations are not deleted immediately.

Use incremental migration:

`existing provider → abstraction → local/free provider → parity tests → default switch → optional legacy provider → retire when safe`

Preserve accepted evidence and compatibility until the replacement passes.

---

# 22. FINAL PRINCIPLE

**THE USER OWNS THE SYSTEM.**

**LOCAL CAPABILITY IS THE BASELINE.**

**CLOUD IS AN OPTIONAL EXTENSION.**

**PAID INFRASTRUCTURE REQUIRES EXPLICIT JUSTIFICATION.**
