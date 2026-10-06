# BAUMAN INFRASTRUCTURE INDEPENDENCE MIGRATION PLAN
## Repo-wide transition to local-first · offline-first · free-first

Applies to every domain registered in `prompts/PROMPT_REGISTRY.json`.

This plan changes architecture incrementally. It does not authorize destructive rewrites.

---

# 0. TARGET ARCHITECTURE

```
ChatGPT
   │
   ├── planning / tutoring / analysis / file workflows
   │
Bauman browser/local runtime
   │
   ├── local content packs
   ├── IndexedDB / OPFS / exportable files
   ├── WebAssembly / Web Workers
   ├── optional local desktop runtimes
   │
   └── Storage/Sync/Compute Provider Facades
             │
             ├── Google Drive (optional backup/sync)
             ├── Google Sheets (optional tabular projection)
             ├── Apps Script (optional thin bridge)
             ├── GitHub (source/CI/release provenance)
             ├── Cloudflare/Vercel/Neon (optional adapters)
             └── other future providers
```

Core learning must not require any single optional provider.

---

# PHASE G0 — GOVERNANCE BASELINE

Deliverables:
- dependency-independence policy;
- Constitution reference;
- execution protocol update;
- registry/index inheritance;
- release-profile semantics;
- static governance gate.

Exit:
- all domains inherit the policy without duplicating it.

---

# PHASE G1 — PROVIDER INVENTORY

For each runtime/storage/sync dependency classify:

- CANONICAL_TRUTH
- REQUIRED_CAPABILITY
- OPTIONAL_PROVIDER
- LEGACY_PROVIDER
- UNKNOWN

Record:
- owner;
- data handled;
- cost;
- auth/secret requirements;
- offline behavior;
- export path;
- failure behavior;
- local/free replacement candidate.

Do not migrate before classification.

---

# PHASE G2 — STORAGE ABSTRACTION

Create/normalize a common storage facade.

Required provider classes:
- memory;
- IndexedDB;
- OPFS or file-pack equivalent where supported;
- export/import;
- optional remote sync.

Rules:
- subject code does not call Drive/D1/Neon directly;
- versioned schema;
- idempotent writes;
- conflict-safe sync;
- learner history preservation.

---

# PHASE G3 — LOCAL/OFFLINE BASELINE

Every core learner route must be testable without paid infrastructure.

Validate:
- app startup;
- subject navigation;
- content reading;
- practice;
- local progress/evidence;
- export/backup;
- offline reload where promised.

No fake offline claim.

---

# PHASE G4 — GOOGLE OPTIONAL BRIDGE

Add Google integration only through adapters.

## Drive adapter
- user-selected Bauman folder;
- versioned snapshots/content packs;
- resumable/retry-safe transfer where practical;
- no canonical-only copy.

## Sheets adapter
- reporting/index projection;
- metadata tables;
- human-editable planning;
- no complex transactional mastery authority.

## Apps Script bridge
- optional;
- thin API;
- idempotency keys;
- minimal scopes;
- quota-aware batching;
- graceful local fallback.

Exit:
- disconnecting Google leaves local core intact.

---

# PHASE G5 — PYTHON PROVIDER MIGRATION

Current Cloudflare Container implementation remains evidence, not default dependency.

Target provider order:
1. browser/WASM practice runtime;
2. local desktop CPython provider;
3. optional managed container provider.

Required work:
- provider-neutral execution facade;
- browser provider;
- local/full CPython provider contract;
- security capability matrix;
- visible limitation flags;
- assessment policy for browser-visible tests;
- P4/P5/P6 selective revalidation;
- release profile changed from cloud-only to LOCAL_STABLE first.

Do not delete container implementation until replacement parity is proven.

---

# PHASE G6 — DATABASE PROVIDER MIGRATION

Default practice:
- SQLite/SQLite-WASM;
- DuckDB-WASM when analytical workloads fit;
- deterministic resettable fixtures.

Optional:
- remote SQL/database adapter.

DB04 must not require a paid managed database unless a specific engine feature cannot be represented locally and that limitation is documented.

---

# PHASE G7 — COMPUTE-HEAVY SUBJECTS

Algorithms:
- browser/local deterministic execution and visualization.

Math:
- local parser/numerical/graph providers first.

ML/Data:
- browser/local datasets and modest experiments first;
- optional GPU/remote compute profiles for heavy workloads.

Neural networks / Big Data:
- local teaching-scale profile;
- optional remote/full-scale profile;
- never conflate teaching-scale evidence with production-scale benchmarks.

---

# PHASE G8 — HUB / APP-MANAGER / SHARED PLATFORM

Hub must surface capability availability honestly:

- LOCAL
- OFFLINE
- SYNC_AVAILABLE
- SYNC_PENDING
- OPTIONAL_PROVIDER_UNAVAILABLE
- NETWORK_REQUIRED

Do not show optional-provider outage as whole-system failure.

App management/config should store provider descriptors, not hard-coded vendor assumptions.

---

# PHASE G9 — RELEASE MODEL MIGRATION

Use explicit target states:

- LOCAL_STABLE
- SYNC_STABLE
- PUBLISHED_STABLE
- MANAGED_PRODUCTION_STABLE

A subject RC selects required target profile.

Only MANAGED_PRODUCTION_STABLE requires the full managed-cloud mutation path.

LOCAL_STABLE still requires exact artifact identity, smoke, offline/update checks and evidence.

---

# PHASE G10 — EXTERNAL SERVICE RETIREMENT

For each external service:

Retire only when:
- replacement passes;
- data exported/migrated;
- rollback tested;
- no canonical state depends on it;
- docs/prompts updated;
- secrets can be removed safely.

Possible outcomes:
- RETAIN_OPTIONAL
- RETAIN_DEV_ONLY
- RETAIN_BACKUP_ONLY
- RETIRE

No mass deletion.

---

# DOMAIN ORDER

Preserve `ONE_SUBJECT_AT_A_TIME` for subject implementation.

Infrastructure governance may proceed repo-wide because it is inherited policy.

Recommended execution order after G0:
1. Python provider migration (currently blocking sequencing);
2. Algorithms resume;
3. Database local SQL runtime;
4. ML/Data local runtime;
5. remaining subjects in registry order.

---

# CHAT / CODEX ALLOCATION

Default:
- Chat: 90–95%
- Codex: 5–10% maximum

Chat owns:
- architecture;
- inventory;
- prompt/state;
- small/medium edits;
- provider selection;
- GitHub/CI/release orchestration;
- diff/log/root-cause review.

Codex only for:
- deep multi-file runtime refactor;
- complex sandbox;
- WASM/runtime integration;
- migration/concurrency;
- large E2E harness.

---

# USER INTERVENTION RULE

Stop for the user only when required for:
- OAuth consent;
- new credential/secret;
- irreversible/destructive action;
- paid plan approval;
- real ambiguous product/pedagogy decision.

Prefer one copy-paste PowerShell/GitHub CLI command over UI instructions when possible.

---

# SUCCESS CRITERIA

Repo-wide migration succeeds when:

- no core learner path requires paid cloud infrastructure;
- local/offline mode is real;
- user data is exportable;
- optional sync survives provider outage;
- external providers are replaceable adapters;
- each subject declares its minimum required release profile;
- paid provider use is explicit rather than accidental.
